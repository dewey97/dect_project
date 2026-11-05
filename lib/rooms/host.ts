/**
 * Quy tắc chuyển quyền Host (spec Phần 3). Logic thuần.
 */

export const HOST_OFFLINE_MS = 60_000;

export interface SeatInfo {
  id: string;
  joined_at: string;
  left_at: string | null;
  kicked: boolean;
  last_seen_at: string;
}

export function isSeated(p: Pick<SeatInfo, "left_at" | "kicked">): boolean {
  return p.left_at === null && !p.kicked;
}

function byJoinedAt(a: SeatInfo, b: SeatInfo): number {
  return (
    Date.parse(a.joined_at) - Date.parse(b.joined_at) ||
    a.id.localeCompare(b.id)
  );
}

/** Người nhận quyền khi Host rời phòng: thành viên còn giữ chỗ vào phòng sớm nhất. */
export function pickSuccessor(
  participants: SeatInfo[],
  hostId: string,
): string | null {
  const next = participants
    .filter((p) => p.id !== hostId && isSeated(p))
    .sort(byJoinedAt)[0];
  return next ? next.id : null;
}

/**
 * Người được phép tự nhận quyền khi Host vắng: Host không heartbeat quá 60 giây,
 * và người nhận là thành viên online (heartbeat trong 60 giây) vào phòng sớm nhất.
 */
export function autoHostCandidate(
  participants: SeatInfo[],
  hostId: string | null,
  now: number,
): string | null {
  const host = hostId ? participants.find((p) => p.id === hostId) : undefined;
  const hostOnline =
    host &&
    isSeated(host) &&
    now - Date.parse(host.last_seen_at) <= HOST_OFFLINE_MS;
  if (hostOnline) return null;

  const online = participants
    .filter(
      (p) =>
        p.id !== hostId &&
        isSeated(p) &&
        now - Date.parse(p.last_seen_at) <= HOST_OFFLINE_MS,
    )
    .sort(byJoinedAt);
  return online[0]?.id ?? null;
}
