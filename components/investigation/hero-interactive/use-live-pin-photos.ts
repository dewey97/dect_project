"use client";

import { useEffect, useMemo, useRef } from "react";
import { normalizeImageUrl } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";

export interface PinPhotoItem {
  id?: string;
  code?: string;
  photo_code?: string;
  photo_id?: string;
  direct_cdn_url?: string;
  drive_url?: string;
  image_url?: string;
  url?: string;
  photo_url?: string;
  label?: string;
  title?: string;
  name?: string;
  category?: string;
  group?: string;
  taken_at?: string;
  description?: string;
  is_evidence?: boolean;
}

/**
 * Nạp ảnh từ Supabase phone_photos (/api/phone-data/photos) trước,
 * fallback Google Sheets (/api/phone?tab=photos), tạo bản đồ tra cứu ảnh ghim / avatar.
 */
export function useLivePinPhotos(caseId: string, onRequestRender?: () => void) {
  const { data: sheetPhotos } = usePhoneData<PinPhotoItem>(
    "photos",
    caseId || "case-000",
  );

  const sheetPhotosMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!sheetPhotos || sheetPhotos.length === 0) return map;

    for (const item of sheetPhotos) {
      const liveUrl = (
        item.image_url ||
        item.url ||
        item.direct_cdn_url ||
        item.drive_url ||
        item.photo_url ||
        ""
      ).trim();
      if (!liveUrl) continue;
      const normalized = normalizeImageUrl(liveUrl);
      const code = item.photo_code || item.code || item.photo_id;
      if (code) {
        const pc = code.toLowerCase().trim();
        map.set(pc, normalized);
        if (pc.startsWith("avatar_")) {
          map.set(pc.replace("avatar_", ""), normalized);
        }
        if (
          pc === "crime_scene" ||
          pc === "chalk_outline" ||
          pc === "thi_the" ||
          pc === "a-06" ||
          pc.includes("chalk")
        ) {
          map.set("crime_scene", normalized);
          map.set("chalk_outline", normalized);
          map.set("thi_the", normalized);
        }
      }
      const title = item.label || item.title || item.name;
      if (title) {
        const titleLower = title.toLowerCase().trim();
        map.set(titleLower, normalized);
        const pc = (item.photo_code || item.code || item.photo_id || "")
          .toLowerCase()
          .trim();
        const isAvatar =
          pc.startsWith("avatar_") ||
          (item.category || "").toUpperCase().trim() === "AVATAR" ||
          titleLower.includes("chân dung");

        // Only map suspect keys if the row is truly an avatar/portrait photo
        if (isAvatar) {
          if (titleLower.includes("khang")) map.set("khang", normalized);
          if (titleLower.includes("vũ") || titleLower.includes("vu"))
            map.set("vu", normalized);
          if (titleLower.includes("tùng") || titleLower.includes("tung"))
            map.set("tung", normalized);
          if (titleLower.includes("hà") || titleLower.includes("ha"))
            map.set("ha", normalized);
          if (titleLower.includes("mai")) map.set("mai", normalized);
          if (titleLower.includes("đạt") || titleLower.includes("dat"))
            map.set("dat", normalized);
          if (titleLower.includes("lụa") || titleLower.includes("lua"))
            map.set("lua", normalized);
          if (titleLower.includes("vy")) map.set("vy", normalized);
          if (titleLower.includes("tiến") || titleLower.includes("tien"))
            map.set("tien", normalized);
        }

        if (
          titleLower.includes("thi thể") ||
          titleLower.includes("thi-the") ||
          titleLower.includes("chalk") ||
          (titleLower.includes("hiện trường") &&
            !titleLower.includes("phòng khách"))
        ) {
          map.set("crime_scene", normalized);
          map.set("chalk_outline", normalized);
          map.set("thi_the", normalized);
        }
      }
    }
    return map;
  }, [sheetPhotos]);

  const sheetPhotosMapRef = useRef<Map<string, string>>(sheetPhotosMap);

  useEffect(() => {
    sheetPhotosMapRef.current = sheetPhotosMap;
    if (onRequestRender) onRequestRender();
  }, [sheetPhotosMap, onRequestRender]);

  return {
    sheetPhotosMap,
    sheetPhotosMapRef,
  };
}
