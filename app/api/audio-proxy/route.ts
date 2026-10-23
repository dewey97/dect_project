import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Allowed hosts for audio files
const ALLOWED_AUDIO_HOSTS = new Set(["docs.google.com", "drive.google.com"]);

interface AudioCacheItem {
  buffer: ArrayBuffer;
  contentType: string;
  timestamp: number;
  byteLength: number;
}

// Bounded LRU cache: max 50 items or ~50MB
const MAX_AUDIO_ENTRIES = 50;
const MAX_TOTAL_AUDIO_BYTES = 50 * 1024 * 1024; // 50 MB
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 mins

const audioCache = new Map<string, AudioCacheItem>();
let currentAudioBytes = 0;

function getFromAudioCache(key: string): AudioCacheItem | null {
  const item = audioCache.get(key);
  if (!item) return null;

  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    currentAudioBytes -= item.byteLength;
    audioCache.delete(key);
    return null;
  }

  // LRU bump
  audioCache.delete(key);
  audioCache.set(key, item);
  return item;
}

function addToAudioCache(
  key: string,
  buffer: ArrayBuffer,
  contentType: string,
) {
  const byteLength = buffer.byteLength;
  if (byteLength > 15 * 1024 * 1024) return; // Do not cache files > 15MB

  while (
    (audioCache.size >= MAX_AUDIO_ENTRIES ||
      currentAudioBytes + byteLength > MAX_TOTAL_AUDIO_BYTES) &&
    audioCache.size > 0
  ) {
    const oldestKey = audioCache.keys().next().value;
    if (!oldestKey) break;
    const oldItem = audioCache.get(oldestKey);
    if (oldItem) {
      currentAudioBytes -= oldItem.byteLength;
    }
    audioCache.delete(oldestKey);
  }

  audioCache.set(key, {
    buffer,
    contentType,
    timestamp: Date.now(),
    byteLength,
  });
  currentAudioBytes += byteLength;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const driveId = searchParams.get("id")?.trim();
  const rawUrl = searchParams.get("url")?.trim();

  let fileId = driveId;
  if (!fileId && rawUrl) {
    const match =
      rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      fileId = match[1];
    } else {
      try {
        const parsed = new URL(rawUrl);
        if (
          parsed.protocol !== "https:" ||
          !ALLOWED_AUDIO_HOSTS.has(parsed.hostname)
        ) {
          return new NextResponse("Host not allowed", { status: 400 });
        }
        fileId = parsed.searchParams.get("id") || undefined;
      } catch {
        return new NextResponse("Invalid URL", { status: 400 });
      }
    }
  }

  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return new NextResponse("Missing or invalid audio file id", {
      status: 400,
    });
  }

  const cached = getFromAudioCache(fileId);
  if (cached) {
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
      return new NextResponse(`Failed to fetch audio: ${res.statusText}`, {
        status: res.status,
      });
    }

    const contentType = res.headers.get("content-type") || "audio/mpeg";
    const buffer = await res.arrayBuffer();

    addToAudioCache(fileId, buffer, contentType);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
        "X-Cache": "MISS",
      },
    });
  } catch (err: unknown) {
    console.error("Audio proxy error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return new NextResponse(message, { status: 500 });
  }
}
