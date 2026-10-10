import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory binary cache cho Next.js server để phục vụ ảnh tức thì (0ms) sau lần tải đầu
const imageMemoryCache = new Map<string, { buffer: ArrayBuffer; contentType: string; timestamp: number }>();
const MAX_CACHE_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  const driveId = searchParams.get("id");

  let targetUrl = rawUrl;
  if (driveId) {
    targetUrl = `https://lh3.googleusercontent.com/d/${driveId}`;
  } else if (rawUrl) {
    const match =
      rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      targetUrl = `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }

  if (!targetUrl) {
    return new NextResponse("Missing url or id parameter", { status: 400 });
  }

  const cacheKey = driveId || targetUrl;
  const cached = imageMemoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < MAX_CACHE_AGE_MS) {
    return new NextResponse(cached.buffer, {
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.warn(
        `Image proxy upstream error: ${res.status} ${res.statusText} for ${targetUrl}`,
      );
      return new NextResponse(`Failed to fetch image: ${res.statusText}`, {
        status: res.status,
      });
    }

    const contentType = res.headers.get("content-type") || "image/png";
    const buffer = await res.arrayBuffer();

    // Lưu vào bộ nhớ đệm máy chủ
    imageMemoryCache.set(cacheKey, {
      buffer,
      contentType,
      timestamp: Date.now(),
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "X-Cache": "MISS",
      },
    });
  } catch (error: any) {
    console.error("Image proxy error:", error);
    return new NextResponse(error.message || "Internal error", { status: 500 });
  }
}
