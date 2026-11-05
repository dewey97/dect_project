import {
  buildSnapshot,
  reactivateWithNewCode,
  requireParticipant,
  roomErrorResponse,
  roomJson,
} from "@/lib/rooms/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Nhận lại đúng người cũ bằng token (F5, mất mạng, mở lại máy). Không tạo nickname mới.
 * Phòng dormant thì kích hoạt lại với mã mới (spec Phần 6).
 * Phòng completed vẫn trả snapshot để xem lại (chỉ đọc).
 */
export async function POST(request: Request) {
  try {
    const ctx = await requireParticipant(request);
    const { db, participant } = ctx;
    let room = ctx.room;
    if (room.status === "dormant") room = await reactivateWithNewCode(db, room);

    const now = new Date().toISOString();
    const { error } = await db
      .from("room_participants")
      .update({ last_seen_at: now })
      .eq("id", participant.id);
    if (error) throw error;

    return roomJson({
      snapshot: await buildSnapshot(db, room, {
        ...participant,
        last_seen_at: now,
      }),
    });
  } catch (err) {
    return roomErrorResponse(err);
  }
}
