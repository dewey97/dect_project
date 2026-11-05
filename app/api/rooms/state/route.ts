import {
  buildSnapshot,
  requireParticipant,
  roomErrorResponse,
  roomJson,
} from "@/lib/rooms/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Snapshot phòng: phase, state, version, thành viên, sự kiện (`?since=<eventId>`).
 * Kiêm heartbeat: `requireParticipant` ghi nhận `last_seen_at` (D1, Q12).
 * Xác thực bằng token, không cần mã phòng (mã đổi khi phòng được kích hoạt lại).
 */
export async function GET(request: Request) {
  try {
    const { db, participant, room } = await requireParticipant(request);
    const since = Number(new URL(request.url).searchParams.get("since"));
    return roomJson({
      snapshot: await buildSnapshot(
        db,
        room,
        participant,
        Number.isFinite(since) ? since : undefined,
      ),
    });
  } catch (err) {
    return roomErrorResponse(err);
  }
}
