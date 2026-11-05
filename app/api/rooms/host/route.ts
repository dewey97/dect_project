import { autoHostCandidate, isSeated } from "@/lib/rooms/host";
import { eventMessage } from "@/lib/rooms/messages";
import {
  RoomError,
  addEvents,
  broadcastMembers,
  broadcastRoom,
  buildSnapshot,
  loadParticipants,
  readBody,
  requireActive,
  requireHost,
  requireParticipant,
  roomErrorResponse,
  roomJson,
  toPublicRoom,
  updateRoomCas,
  type ParticipantContext,
} from "@/lib/rooms/server";
import type { GameRoomRow, RoomParticipantRow } from "@/lib/types/room";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Quyền Host (spec Phần 3). Body: { action, participantId?, maxPlayers? }.
 * - transfer: Host chuyển quyền cho thành viên khác.
 * - kick: Host mời một thành viên ra khỏi phòng.
 * - max_players: Host sửa số người tối đa (không thấp hơn số đang giữ chỗ).
 * - claim: thành viên tự nhận quyền khi Host vắng quá 60 giây (plan D1).
 */
export async function POST(request: Request) {
  try {
    const ctx = await requireParticipant(request);
    requireActive(ctx.room);
    const body = await readBody(request);
    const participants = await loadParticipants(ctx.db, ctx.room.id);

    switch (body.action) {
      case "transfer":
        return await transfer(ctx, participants, body.participantId);
      case "kick":
        return await kick(ctx, participants, body.participantId);
      case "max_players":
        return await setMaxPlayers(ctx, participants, body.maxPlayers);
      case "claim":
        return await claim(ctx, participants);
      default:
        throw new RoomError(400, "INVALID_ACTION", "Thao tác không hợp lệ.");
    }
  } catch (err) {
    return roomErrorResponse(err);
  }
}

function findSeated(
  participants: RoomParticipantRow[],
  id: unknown,
  selfId: string,
) {
  const target = participants.find((p) => p.id === id);
  if (!target || !isSeated(target)) {
    throw new RoomError(
      404,
      "NOT_IN_ROOM",
      "Thành viên không còn trong phòng.",
    );
  }
  if (target.id === selfId)
    throw new RoomError(400, "SELF", "Không áp dụng cho chính bạn.");
  return target;
}

async function changeHost(
  ctx: ParticipantContext,
  newHost: RoomParticipantRow,
  expectedHostId: string | null,
) {
  const { db, senderId } = ctx;
  const room = await updateRoomCas(db, ctx.room, (current: GameRoomRow) => {
    if (current.host_participant_id !== expectedHostId) {
      throw new RoomError(409, "HOST_CHANGED", "Quyền Host vừa thay đổi.");
    }
    return { host_participant_id: newHost.id };
  });
  const events = await addEvents(db, room.id, [
    {
      actorId: newHost.id,
      type: "host_changed",
      message: eventMessage("host_changed", ctx.participant.nickname, {
        target: newHost.nickname,
      }),
    },
  ]);
  await broadcastRoom(room.id, [
    {
      event: "HOST_CHANGE",
      payload: { senderId, version: room.version, room: toPublicRoom(room) },
    },
  ]);
  await broadcastMembers(db, room, senderId, events);
  return roomJson({ snapshot: await buildSnapshot(db, room, ctx.participant) });
}

async function transfer(
  ctx: ParticipantContext,
  participants: RoomParticipantRow[],
  id: unknown,
) {
  requireHost(ctx);
  const target = findSeated(participants, id, ctx.participant.id);
  return changeHost(ctx, target, ctx.participant.id);
}

async function claim(
  ctx: ParticipantContext,
  participants: RoomParticipantRow[],
) {
  const hostId = ctx.room.host_participant_id;
  if (hostId === ctx.participant.id) {
    return roomJson({
      snapshot: await buildSnapshot(ctx.db, ctx.room, ctx.participant),
    });
  }
  // Tính cả heartbeat của chính người gọi lúc này.
  const now = Date.now();
  const fresh = participants.map((p) =>
    p.id === ctx.participant.id
      ? { ...p, last_seen_at: new Date(now).toISOString() }
      : p,
  );
  if (autoHostCandidate(fresh, hostId, now) !== ctx.participant.id) {
    throw new RoomError(409, "HOST_ONLINE", "Host vẫn đang trong phòng.");
  }
  return changeHost(ctx, ctx.participant, hostId);
}

async function kick(
  ctx: ParticipantContext,
  participants: RoomParticipantRow[],
  id: unknown,
) {
  requireHost(ctx);
  const target = findSeated(participants, id, ctx.participant.id);
  const { db, senderId, room } = ctx;
  const now = new Date().toISOString();
  const { error } = await db
    .from("room_participants")
    .update({ kicked: true, left_at: now })
    .eq("id", target.id);
  if (error) throw error;

  const events = await addEvents(db, room.id, [
    {
      actorId: ctx.participant.id,
      type: "member_kicked",
      message: eventMessage("member_kicked", ctx.participant.nickname, {
        target: target.nickname,
      }),
    },
  ]);
  await broadcastMembers(db, room, senderId, events, {
    kickedParticipantId: target.id,
  });
  return roomJson({ snapshot: await buildSnapshot(db, room, ctx.participant) });
}

async function setMaxPlayers(
  ctx: ParticipantContext,
  participants: RoomParticipantRow[],
  raw: unknown,
) {
  requireHost(ctx);
  const maxPlayers = Number(raw);
  if (!Number.isInteger(maxPlayers) || maxPlayers < 1 || maxPlayers > 99) {
    throw new RoomError(
      400,
      "INVALID_MAX_PLAYERS",
      "Số người tối đa từ 1 đến 99.",
    );
  }
  const seated = participants.filter(isSeated).length;
  if (maxPlayers < seated) {
    throw new RoomError(
      400,
      "BELOW_CURRENT",
      `Phòng đang có ${seated} người.`,
      { seated },
    );
  }
  const room = await updateRoomCas(ctx.db, ctx.room, () => ({
    max_players: maxPlayers,
  }));
  await broadcastMembers(ctx.db, room, ctx.senderId, []);
  return roomJson({
    snapshot: await buildSnapshot(ctx.db, room, ctx.participant),
  });
}
