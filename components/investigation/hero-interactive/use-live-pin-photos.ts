"use client";

import { useEffect, useMemo, useRef } from "react";
import { normalizeImageUrl } from "@/lib/utils";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import { useCaseEvidence } from "@/lib/hooks/use-case-evidence";

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
 * Nạp ảnh từ Supabase phone_photos (/api/phone-data/photos) và case_evidence,
 * tạo bản đồ tra cứu ảnh ghim / avatar. Cắt bỏ Google Sheets runtime.
 */
export function useLivePinPhotos(
  caseId?: string,
  onRequestRender?: () => void,
) {
  const effectiveCaseId = caseId ? normalizeCaseId(caseId) : "";
  const { data: phonePhotos } = usePhoneData<PinPhotoItem>(
    "photos",
    effectiveCaseId,
  );
  const { rawEvidence } = useCaseEvidence(effectiveCaseId);

  const sheetPhotosMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!effectiveCaseId) return map;
    const allPhotos: any[] = [...(phonePhotos || []), ...(rawEvidence || [])];
    if (allPhotos.length === 0) return map;

    for (const item of allPhotos) {
      const liveUrl = String(
        item.image_url ||
          item.thumb_url ||
          item.file_url ||
          item.url ||
          item.direct_cdn_url ||
          item.drive_url ||
          item.photo_url ||
          "",
      ).trim();
      if (!liveUrl) continue;
      const normalized = normalizeImageUrl(liveUrl);
      const rawCode = item.photo_code || item.code || item.photo_id;
      const code = typeof rawCode === "string" ? rawCode.trim() : "";
      if (code) {
        const pc = code.toLowerCase().trim();
        map.set(pc, normalized);
      }
      const rawTitle = item.label || item.title || item.name;
      const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
      if (title) {
        const titleLower = title.toLowerCase().trim();
        map.set(titleLower, normalized);
      }
    }
    return map;
  }, [effectiveCaseId, phonePhotos, rawEvidence]);

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
