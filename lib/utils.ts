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
