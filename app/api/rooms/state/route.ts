import {
  buildSnapshot,
  requireParticipant,
  roomErrorResponse,
  roomJson,
} from "@/lib/rooms/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HEARTBEAT_MIN_MS = 15_000;

/**
 * Snapshot phòng: phase, state, version, thành viên, sự kiện (`?since=<eventId>`).
 * Kiêm heartbeat: cập nhật last_seen_at, dùng cho tự chuyển Host (plan D1).
 * Xác thực bằng token, không cần mã phòng (mã đổi khi phòng được kích hoạt lại).
 */
export async function GET(request: Request) {
  try {
    const { db, participant, room } = await requireParticipant(request);

    let me = participant;
    if (Date.now() - Date.parse(participant.last_seen_at) > HEARTBEAT_MIN_MS) {
      const now = new Date().toISOString();
      const { error } = await db
        .from("room_participants")
        .update({ last_seen_at: now })
        .eq("id", participant.id);
      if (error) throw error;
      me = { ...participant, last_seen_at: now };
    }

    const since = Number(new URL(request.url).searchParams.get("since"));
    return roomJson({
      snapshot: await buildSnapshot(
        db,
        room,
        me,
        Number.isFinite(since) ? since : undefined,
      ),
    });
  } catch (err) {
    return roomErrorResponse(err);
  }
}
