import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes image URLs from Google Drive, Sheets, or direct web URLs.
 * Converts Google Drive share links to direct CORS-friendly CDN URLs (`https://lh3.googleusercontent.com/d/{id}`).
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();

  // If already proxied, keep as is
  if (trimmed.startsWith("/api/image-proxy")) {
    return trimmed;
  }

  // Google Drive /file/d/{id}/view, /file/d/{id}
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `/api/image-proxy?id=${driveFileMatch[1]}`;
  }

  // Google Drive id query parameter: ?id={id} or &id={id}
  if (trimmed.includes("drive.google.com")) {
    const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveIdMatch && driveIdMatch[1]) {
      return `/api/image-proxy?id=${driveIdMatch[1]}`;
    }
  }

  // Direct lh3.googleusercontent.com link: route via proxy to prevent browser 429
  if (trimmed.includes("lh3.googleusercontent.com/d/")) {
    const directMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (directMatch && directMatch[1]) {
      return `/api/image-proxy?id=${directMatch[1]}`;
    }
  }

  return trimmed;
}

/**
 * Normalizes audio/video media URLs from Google Drive or local/public sources.
 * If given a Google Drive link, converts to direct streaming URL or fallback.
 */
export function normalizeMediaUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();

  // Local static file or direct http/https stream
  if (trimmed.startsWith("/") || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Google Drive /file/d/{id}/view, /file/d/{id}
  let driveId = "";
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    driveId = driveFileMatch[1];
  } else if (trimmed.includes("drive.google.com")) {
    const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveIdMatch && driveIdMatch[1]) {
      driveId = driveIdMatch[1];
    }
  }

  if (driveId) {
    // Nếu là file video hoặc gif từ Drive, cho đi qua /api/image-proxy để xem được cả ảnh động GIF và stream
    // Hoặc stream audio qua /api/audio-proxy
    const isAudio =
      trimmed.toLowerCase().includes(".mp3") ||
      trimmed.toLowerCase().includes(".wav") ||
      trimmed.toLowerCase().includes(".m4a") ||
      trimmed.toLowerCase().includes(".ogg");

    if (isAudio) {
      return `/api/audio-proxy?id=${driveId}`;
    }

    // Mặc định cho video và gif từ Drive qua image-proxy (stream an toàn không dính CSP/sandbox)
    return `/api/image-proxy?id=${driveId}`;
  }

  return trimmed;
}

/**
 * Normalizes PDF URLs from Google Drive or local/public sources.
 * Converts Google Drive share links to /preview URLs so they can be embedded cleanly in <iframe> without toolbar.
 */
export function normalizeDrivePdfUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();

  // If local PDF path (/documents/...)
  if (trimmed.startsWith("/")) {
    return `${trimmed}#toolbar=0&navpanes=0`;
  }

  // Google Drive /file/d/{id}/view, /file/d/{id} -> /file/d/{id}/preview
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  // Google Drive query parameter id: ?id={id}
  if (trimmed.includes("drive.google.com")) {
    const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveIdMatch && driveIdMatch[1]) {
      return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
    }
  }

  return trimmed;
}
