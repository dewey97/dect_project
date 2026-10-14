/**
 * Rate Limiter phòng thủ & Nhận diện danh tính IP thông minh
 * Đúc kết từ kiến trúc Global Throttler của hệ thống Lendi (addressTracker + IPv6 /64 subnet grouping).
 */

interface RateBucket {
  tokens: number;
  lastRefill: number;
}

// Bảng lưu trữ hạn mức trong bộ nhớ RAM
const store = new Map<string, RateBucket>();

// Tự động dọn dẹp các IP đã hết thời hạn nợ sau mỗi 5 phút để chống rò rỉ bộ nhớ
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredBuckets(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, bucket] of store.entries()) {
    if (now - bucket.lastRefill > windowMs * 2) {
      store.delete(key);
    }
  }
}

/**
 * Phân tích và nhóm địa chỉ IPv6 thành dải /64 prefix (theo bài học Lendi).
 * Ngăn chặn kẻ xấu xoay hàng tỷ IP trong cùng một dải IPv6 để bypass rate limit.
 */
export function normalizeIp(rawIp: string | null | undefined): string {
  if (!rawIp) return "127.0.0.1";
  const ip = rawIp.trim();

  // Bỏ port nếu có (ví dụ: "192.168.1.1:54321")
  if (ip.includes(".") && ip.includes(":") && !ip.startsWith("[")) {
    const parts = ip.split(":");
    if (parts.length === 2) return parts[0];
  }

  // Nếu là IPv4 chuẩn
  if (!ip.includes(":")) return ip;

  // Xử lý IPv4-mapped IPv6 (dạng "::ffff:192.168.1.1")
  const ipv4MappedMatch = ip.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/i);
  if (ipv4MappedMatch) {
    return ipv4MappedMatch[1];
  }

  // Chuẩn hóa IPv6: gom cụm theo subnet /64 (4 cụm hextet đầu)
  try {
    const cleanIp = ip.split("%")[0]; // Bỏ zone id nếu có
    const parts = cleanIp.split(":");
    const prefix = parts.slice(0, 4).join(":");
    return `${prefix}::/64`;
  } catch {
    return ip;
  }
}

/**
 * Trích xuất địa chỉ IP thực tế của client từ HTTP Request headers
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return normalizeIp(firstIp);
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return normalizeIp(realIp.trim());

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return normalizeIp(cfConnectingIp.trim());

  return "127.0.0.1";
}

export interface RateLimitOptions {
  limit: number;      // Số request tối đa cho phép
  windowMs: number;   // Khoảng thời gian tính toán (milliseconds)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Kiểm tra hạn mức request của một định danh (IP hoặc User Session)
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { limit: 20, windowMs: 60_000 }
): RateLimitResult {
  cleanupExpiredBuckets(options.windowMs);

  const now = Date.now();
  const bucket = store.get(key) || { tokens: options.limit, lastRefill: now };

  // Tính toán số lượng token được hoàn trả theo thời gian trôi qua
  const elapsed = now - bucket.lastRefill;
  if (elapsed > 0) {
    const tokensToAdd = (elapsed / options.windowMs) * options.limit;
    bucket.tokens = Math.min(options.limit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    store.set(key, bucket);
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      retryAfterSeconds: 0,
    };
  }

  store.set(key, bucket);
  const needed = 1 - bucket.tokens;
  const retryAfterSeconds = Math.max(1, Math.ceil((needed * options.windowMs) / options.limit / 1000));

  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds,
  };
}
