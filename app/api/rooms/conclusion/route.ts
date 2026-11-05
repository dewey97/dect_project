import { normalizeRoomState } from "@/lib/rooms/merge";
import { eventMessage } from "@/lib/rooms/messages";
import {
  RoomError,
  addEvents,
  broadcastRoom,
  buildSnapshot,
  readBody,
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
 * Nộp kết luận (spec 2.7). Body: { culprit? }.
 * Chỉ nhận khi phòng còn ở `investigating`: hai người nộp gần cùng lúc thì bản đến
 * sau nhận 409 kèm tên người đã nộp. Chuyển `epilogue`, ghi `ended_at`,
 * `status = completed` và giải phóng mã phòng (spec Phần 6).
 *
 * Client chỉ gọi route này sau khi `/api/checkpoints/verify` chấm đúng.
 * Server chưa chấm lại (plan D7, chờ hệ thống điểm #15).
 */
export async function POST(request: Request) {
  try {
    const ctx = await requireParticipant(request);
    const { db, participant: me, senderId } = ctx;
    const body = await readBody(request);
    const culprit =
      typeof body.culprit === "string" && body.culprit.length <= 128
        ? body.culprit
        : null;

    let room: GameRoomRow;
    try {
      room = await updateRoomCas(db, ctx.room, (current: GameRoomRow) => {
        if (current.phase !== "investigating" || current.status !== "active") {
          throw new RoomError(409, "ALREADY_CONCLUDED", "Phòng đã kết thúc.");
        }
        const now = new Date().toISOString();
        const state = normalizeRoomState(current.state_json);
        return {
          phase: "epilogue",
          phase_changed_at: now,
          ended_at: now,
          status: "completed",
          room_code: null,
          state_json: {
            ...state,
            indictmentSolved: true,
            solvedCulprit: culprit ?? state.solvedCulprit,
          },
        };
      });
    } catch (err) {
      if (err instanceof RoomError && err.code === "ALREADY_CONCLUDED") {
        const { data } = await db
          .from("room_events")
          .select("message, actor_participant_id")
          .eq("room_id", ctx.room.id)
          .eq("type", "conclusion_submitted")
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle();
        throw new RoomError(
          409,
          "ALREADY_CONCLUDED",
          data?.message ?? "Phòng đã kết thúc.",
        );
      }
      throw err;
    }

    const events = await addEvents(db, room.id, [
      {
        actorId: me.id,
        type: "conclusion_submitted",
        message: eventMessage("conclusion_submitted", me.nickname),
      },
    ]);
    const state = normalizeRoomState(room.state_json);
    await broadcastRoom(room.id, [
      {
        event: "PHASE_CHANGE",
        payload: {
          senderId,
          version: room.version,
          room: toPublicRoom(room),
          state,
        },
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

    return roomJson({ snapshot: await buildSnapshot(db, room, me) });
  } catch (err) {
    return roomErrorResponse(err);
  }
}
