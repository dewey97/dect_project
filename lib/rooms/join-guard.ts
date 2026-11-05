/**
 * Giới hạn nhập mã phòng sai (spec 2.3): tối đa 10 lần sai trong 5 phút mỗi IP,
 * sau đó chặn 5 phút. Chỉ đếm lần sai, không khóa mã phòng.
 * Bộ nhớ trong process (một container VPS). Logic thuần, đồng hồ truyền vào để test.
 */

export const JOIN_FAIL_LIMIT = 10;
export const JOIN_FAIL_WINDOW_MS = 5 * 60_000;
export const JOIN_BLOCK_MS = 5 * 60_000;

interface Entry {
  fails: number;
  windowStart: number;
  blockedUntil: number;
}

export class JoinGuard {
  private entries = new Map<string, Entry>();

  /** Số giây còn bị chặn, 0 nếu được thử. */
  blockedFor(key: string, now: number): number {
    const e = this.entries.get(key);
    if (!e || e.blockedUntil <= now) return 0;
    return Math.ceil((e.blockedUntil - now) / 1000);
  }

  recordFailure(key: string, now: number): void {
    this.sweep(now);
    let e = this.entries.get(key);
    if (
      !e ||
      now - e.windowStart > JOIN_FAIL_WINDOW_MS ||
      (e.blockedUntil > 0 && e.blockedUntil <= now)
    ) {
      e = { fails: 0, windowStart: now, blockedUntil: 0 };
    }
    e.fails += 1;
    if (e.fails >= JOIN_FAIL_LIMIT) e.blockedUntil = now + JOIN_BLOCK_MS;
    this.entries.set(key, e);
  }

  private sweep(now: number): void {
    if (this.entries.size < 1_000) return;
    for (const [k, e] of this.entries) {
      if (now - e.windowStart > JOIN_FAIL_WINDOW_MS && e.blockedUntil <= now) {
        this.entries.delete(k);
      }
    }
  }
}
