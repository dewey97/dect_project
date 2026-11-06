/**
 * Image Preloader Utility for Investigation Gameplay
 * Preloads critical board backgrounds, wooden frames, pushpins, and suspect/evidence photos
 * so that the HTML5 canvas and UI render completely without pop-in or missing textures.
 */
import { normalizeImageUrl } from "@/lib/utils";

const preloadedUrls = new Set<string>();

/**
 * Preloads a single image and resolves true on success or false on error/timeout.
 * Never throws, ensuring gameplay continues even if an asset fails to load.
 */
export function preloadImage(
  rawUrl: string,
  timeoutMs: number = 3500,
): Promise<boolean> {
  if (typeof window === "undefined" || !rawUrl) {
    return Promise.resolve(false);
  }
  const url = normalizeImageUrl(rawUrl);
  if (!url) {
    return Promise.resolve(false);
  }
  if (preloadedUrls.has(url)) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (success: boolean) => {
      if (settled) return;
      settled = true;
      if (success) preloadedUrls.add(url);
      resolve(success);
    };

    const timer = setTimeout(() => {
      finish(false);
    }, timeoutMs);

    try {
      const img = new Image();
      if (url.startsWith("http://") || url.startsWith("https://")) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        clearTimeout(timer);
        finish(true);
      };
      img.onerror = () => {
        clearTimeout(timer);
        finish(false);
      };
      img.src = url;

      if (img.complete && img.naturalWidth > 0) {
        clearTimeout(timer);
        finish(true);
      }
    } catch {
      clearTimeout(timer);
      finish(false);
    }
  });
}

/**
 * Preloads an array of image URLs in parallel, bounding total wait time with maxTimeoutMs.
 */
export async function preloadImages(
  urls: (string | undefined | null)[],
  maxTimeoutMs: number = 3500,
): Promise<void> {
  const validUrls = Array.from(
    new Set(
      urls
        .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
        .map((u) => u.trim()),
    ),
  );

  if (validUrls.length === 0) return;

  await Promise.race([
    Promise.all(validUrls.map((url) => preloadImage(url, maxTimeoutMs))),
    new Promise((resolve) => setTimeout(resolve, maxTimeoutMs)),
  ]);
}
