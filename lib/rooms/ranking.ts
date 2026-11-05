/**
 * Quy tắc "chơi liền một mạch" (Q12, chốt 2026-11-05, spec Phần 7).
 * Sau `started_at`, nếu có khoảng trống QUÁ 15 phút mà không participant nào hoạt động,
 * phòng bị đánh dấu không xếp hạng vĩnh viễn (`game_rooms.unranked_at`). Phòng vẫn chơi tiếp.
 * Logic thuần; server gọi trước khi ghi nhận lần hoạt động mới của người gọi.
 */

export const UNRANKED_GAP_MS = 15 * 60_000;

export function shouldMarkUnranked(input: {
  startedAt: string | null;
  unrankedAt: string | null;
  /** last_seen_at của mọi participant (kể cả đã rời), TRƯỚC lần hoạt động hiện tại. */
  lastSeenAt: string[];
  now: number;
}): boolean {
  if (!input.startedAt || input.unrankedAt) return false;
  const started = Date.parse(input.startedAt);
  if (!Number.isFinite(started)) return false;
  // Khoảng trống tính từ mốc muộn nhất giữa lần hoạt động cuối và lúc bắt đầu tính giờ.
  const lastActivity = Math.max(
    started,
    ...input.lastSeenAt.map((t) => Date.parse(t)).filter(Number.isFinite),
  );
  return input.now - lastActivity > UNRANKED_GAP_MS;
}
