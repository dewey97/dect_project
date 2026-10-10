import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Server-side in-memory cache cho file audio (30 phút) để phát ngay 0ms
const audioCache = new Map<string, { buffer: ArrayBuffer; contentType: string; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 mins

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const driveId = searchParams.get("id");
  const rawUrl = searchParams.get("url");

  let fileId = driveId;
  if (!fileId && rawUrl) {
    const match =
      rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      fileId = match[1];
    }
  }

  if (!fileId) {
    return new NextResponse("Missing audio file id or url", { status: 400 });
  }

  const cached = audioCache.get(fileId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return new NextResponse(cached.buffer, {
      headers: {
        "Content-Type": cached.contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const targetUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.warn(`Audio proxy upstream failed: ${res.status} for ${fileId}`);
      return new NextResponse(`Failed to fetch audio: ${res.statusText}`, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "audio/mpeg";
    const buffer = await res.arrayBuffer();

    audioCache.set(fileId, {
      buffer,
      contentType,
      timestamp: Date.now(),
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
        "X-Cache": "MISS",
      },
    });
  } catch (err: any) {
    console.error("Audio proxy error:", err);
    return new NextResponse(err.message || "Internal server error", { status: 500 });
  }
}
