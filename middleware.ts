import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Bỏ qua xác thực session cho proxy đa phương tiện và file tĩnh
  if (
    pathname.startsWith("/api/image-proxy") ||
    pathname.startsWith("/api/audio-proxy") ||
    /\.(pdf|mp3|wav|ogg|glb|webp|avif|svg|png|jpg|jpeg|gif|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Khớp toàn bộ request paths ngoại trừ:
     * - _next/static & _next/image
     * - favicon.ico
     * - Proxy media công khai (/api/image-proxy, /api/audio-proxy)
     * - Tài nguyên tĩnh: tài liệu vụ án (pdf), âm thanh (mp3/wav/ogg), mô hình (glb), font (woff/woff2), ảnh
     */
    "/((?!_next/static|_next/image|favicon.ico|api/image-proxy|api/audio-proxy|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|pdf|mp3|wav|ogg|glb|woff2?)$).*)",
  ],
};
