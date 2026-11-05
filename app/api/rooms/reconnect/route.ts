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
 * Phòng dormant thì kích hoạt lại với mã mới (spec Phần 6); khoảng vắng dài đã làm
 * phòng mất xếp hạng (Q12, kiểm trong `requireParticipant`).
 * Phòng completed vẫn trả snapshot để xem lại (chỉ đọc).
 */
export async function POST(request: Request) {
  try {
    const ctx = await requireParticipant(request);
    let room = ctx.room;
    if (room.status === "dormant")
      room = await reactivateWithNewCode(ctx.db, room);
    return roomJson({
      snapshot: await buildSnapshot(ctx.db, room, ctx.participant),
    });
  } catch (err) {
    return roomErrorResponse(err);
  }
}
