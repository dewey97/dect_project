import { hostCanAdvance, isRoomPhase, nextPhase } from "@/lib/rooms/phase";
import {
  RoomError,
  broadcastMembers,
  broadcastRoom,
  buildSnapshot,
  readBody,
  requireActive,
  requireHost,
  requireParticipant,
  roomErrorResponse,
  roomJson,
  toPublicRoom,
  updateRoomCas,
} from "@/lib/rooms/server";
import type { GameRoomRow } from "@/lib/types/room";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Host chuyển màn: lobby → intro_scene → intro_handover → investigating.
 * Body: { from } là phase client đang thấy. Lệch phase thì 409 (bấm 2 lần, hoặc
 * Host khác đã chuyển), không bao giờ nhảy 2 màn.
 * intro_handover → investigating ghi started_at (mốc tính giờ, spec 2.6).
 */
export async function POST(request: Request) {
  try {
    const ctx = await requireParticipant(request);
    const { db, senderId } = ctx;
    requireHost(ctx);
    requireActive(ctx.room);

    const body = await readBody(request);
    const from = body.from;
    if (!isRoomPhase(from) || !hostCanAdvance(from)) {
      throw new RoomError(400, "INVALID_PHASE", "Không chuyển được màn này.");
    }

    const room = await updateRoomCas(db, ctx.room, (current: GameRoomRow) => {
      if (current.host_participant_id !== ctx.participant.id) {
        throw new RoomError(403, "NOT_HOST", "Chỉ Host được làm thao tác này.");
      }
      if (current.phase !== from) {
        throw new RoomError(409, "PHASE_CHANGED", "Phòng đã chuyển màn.", {
          phase: current.phase,
        });
      }
      const to = nextPhase(from)!;
      const now = new Date().toISOString();
      return {
        phase: to,
        phase_changed_at: now,
        ...(to === "investigating" ? { started_at: now } : {}),
      };
    });

    // Host bấm Bắt đầu: mọi người đang ở phòng chờ vào cuộc cùng lúc (spec 4.2).
    if (from === "lobby") {
      const { error } = await db
        .from("room_participants")
        .update({ entered_at: room.phase_changed_at })
        .eq("room_id", room.id)
        .is("entered_at", null)
        .is("left_at", null)
        .eq("kicked", false);
      if (error) throw error;
      await broadcastMembers(db, room, senderId, []);
    }

    await broadcastRoom(room.id, [
      {
        event: "PHASE_CHANGE",
        payload: { senderId, version: room.version, room: toPublicRoom(room) },
      },
    ]);

    return roomJson({
      snapshot: await buildSnapshot(db, room, ctx.participant),
    });
  } catch (err) {
    return roomErrorResponse(err);
  }
}
