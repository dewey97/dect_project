import { NextResponse } from "next/server";

/**
 * Các hằng số chỉ thị bộ nhớ đệm phòng thủ (Defensive Cache Directives)
 * Học tập từ `exceptions.filter.ts` của Lendi: Không bao giờ để response lỗi bị browser hay proxy cache lại.
 */
export const CACHE_CONTROL_NO_STORE = "no-store, no-cache, must-revalidate, proxy-revalidate";

/**
 * Trả về phản hồi lỗi luôn kèm header `Cache-Control: no-store`
 * Đảm bảo người chơi khi gặp chập chờn mạng chỉ cần bấm F5 là nạp lại được dữ liệu mới nhất.
 */
export function defensiveErrorResponse(
  body: Record<string, any>,
  status = 500,
  extraHeaders: Record<string, string> = {}
): NextResponse {
  const res = NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": CACHE_CONTROL_NO_STORE,
      Pragma: "no-cache",
      Expires: "0",
      ...extraHeaders,
    },
  });
  return res;
}

/**
 * Trả về phản hồi HTTP 429 kèm header `Retry-After` chuẩn RFC
 */
export function rateLimitResponse(retryAfterSeconds: number, customMessage?: string): NextResponse {
  return defensiveErrorResponse(
    {
      success: false,
      error: customMessage || "Bạn đã gửi quá nhiều yêu cầu giải đố. Vui lòng dừng lại vài giây trước khi thử tiếp.",
      retryAfter: retryAfterSeconds,
    },
    429,
    {
      "Retry-After": String(retryAfterSeconds),
    }
  );
}

/**
 * Trả về dữ liệu thành công nhưng không cho phép cache (áp dụng cho Live CMS hoặc realtime gameplay)
 */
export function dynamicSuccessResponse(
  body: Record<string, any>,
  status = 200,
  extraHeaders: Record<string, string> = {}
): NextResponse {
  const res = NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": CACHE_CONTROL_NO_STORE,
      Pragma: "no-cache",
      Expires: "0",
      ...extraHeaders,
    },
  });
  return res;
}
