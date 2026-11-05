import {
  mergeRoomState,
  normalizeRoomState,
  progressDelta,
  sanitizeProgressPatch,
} from "@/lib/rooms/merge";
import { eventMessage } from "@/lib/rooms/messages";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import {
  RoomError,
  addEvents,
  broadcastRoom,
  readBody,
  requireActive,
  requireParticipant,
  roomErrorResponse,
  roomJson,
  updateRoomCas,
} from "@/lib/rooms/server";
import type { GameRoomRow, RoomEventType } from "@/lib/types/room";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Ghi tiến trình điều tra (spec 5.3). Body: { patch }.
 * Server merge (union mảng, gộp map theo key) vào state mới nhất và tăng version
 * bằng compare-and-swap, nên hai người ghi cùng lúc không mất tiến trình.
 * Sự kiện thông báo do server tự suy ra từ phần thật sự mới.
 */
export async function POST(request: Request) {
  try {
    const ctx = await requireParticipant(request);
    const { db, participant: me, senderId } = ctx;
    requireActive(ctx.room);
    if (ctx.room.phase !== "investigating") {
      throw new RoomError(
        409,
        "NOT_INVESTIGATING",
        "Phòng không ở màn điều tra.",
      );
    }

    const rate = checkRateLimit(`room_progress:${me.id}`, {
      limit: 120,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      throw new RoomError(429, "RATE_LIMITED", "Cập nhật quá nhanh.", {
        retryAfter: rate.retryAfterSeconds,
      });
    }

    const body = await readBody(request);
    const patch = sanitizeProgressPatch(body.patch);
    if (!patch)
      throw new RoomError(400, "EMPTY_PATCH", "Không có tiến trình hợp lệ.");

    let before = normalizeRoomState(ctx.room.state_json);
    const room = await updateRoomCas(db, ctx.room, (current: GameRoomRow) => {
      if (current.phase !== "investigating" || current.status !== "active") {
        throw new RoomError(
          409,
          "NOT_INVESTIGATING",
          "Phòng không ở màn điều tra.",
        );
      }
      before = normalizeRoomState(current.state_json);
      return { state_json: mergeRoomState(before, patch) };
    });
    const state = normalizeRoomState(room.state_json);

    const delta = progressDelta(before, state);
    const items: {
      actorId: string;
      type: RoomEventType;
      message: string;
      targetRef: string;
    }[] = [
      ...delta.newCheckpoints.map((id) => ({
        actorId: me.id,
        type: "checkpoint_solved" as const,
        message: eventMessage("checkpoint_solved", me.nickname),
        targetRef: id,
      })),
      ...delta.newDossiers.map((id) => ({
        actorId: me.id,
        type: "dossier_unlocked" as const,
        message: eventMessage("dossier_unlocked", me.nickname),
        targetRef: id,
      })),
      ...(delta.phoneJustSolved
        ? [
            {
              actorId: me.id,
              type: "phone_solved" as const,
              message: eventMessage("phone_solved", me.nickname),
              targetRef: "phone",
            },
          ]
        : []),
    ];
    const events = await addEvents(db, room.id, items);

    await broadcastRoom(room.id, [
      {
        event: "PROGRESS_UPDATE",
        payload: { senderId, version: room.version, state },
      },
      ...(events.length > 0
        ? [
            {
              event: "ROOM_EVENT" as const,
              payload: { senderId, version: room.version, events },
            },
          ]
        : []),
    ]);

    return roomJson({ version: room.version, state, events });
  } catch (err) {
    return roomErrorResponse(err);
  }
}
