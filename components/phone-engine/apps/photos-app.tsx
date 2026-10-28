"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  ArrowLeft,
  ChevronLeft,
  Info,
  Trash2,
  CloudOff,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import { caseStorageKey } from "@/lib/cases/case-id";
import { getActiveCaseId } from "@/lib/cases/case-characters";
import { getDossierSlot, useCaseDossiers } from "@/lib/hooks/use-case-dossiers";
import { getStorageItem } from "@/lib/storage";
import {
  getUnlockedDossiers,
  getUnlockedPhase,
} from "@/lib/progress/case-progress";
import type { Photo } from "@/lib/types";

interface PhotoItem {
  id: string;
  filename: string;
  driveUrl: string;
  timestamp: string;
  location: string;
  description: string;
  size: string;
}

interface PhotosAppProps {
  photos?: (Photo | PhotoItem)[];
  onBackToHome?: () => void;
}

export function PhotosApp({ onBackToHome }: PhotosAppProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [showExifInfo, setShowExifInfo] = useState(false);

  const { data: rawPhotos, loading, error, refetch } = usePhoneData("photos");
  // Ảnh theo phase mở cùng bộ hồ sơ (lib/progress/case-progress.ts).
  const caseId = getActiveCaseId() || "";
  const { dossiers } = useCaseDossiers(caseId);
  const [unlockedRefs, setUnlockedRefs] = useState<string[]>([]);
  const [isIndictmentSolved, setIsIndictmentSolved] = useState(false);
  useEffect(() => {
    setUnlockedRefs(getUnlockedDossiers(caseId));
    setIsIndictmentSolved(
      getStorageItem(caseStorageKey(caseId, "indictment_solved")) === "true",
    );
  }, [caseId]);
  const unlockedPhase = getUnlockedPhase(
    dossiers.map((dossier, idx) => ({
      dossier,
      slot: getDossierSlot(dossier, idx),
    })),
    unlockedRefs,
    isIndictmentSolved,
  );

  const photos: PhotoItem[] = rawPhotos
    .filter((item: Record<string, unknown>) =>
      Boolean(
        item.drive_url ||
        item.direct_cdn_url ||
        item.url ||
        item.photo_url ||
        item.image_url,
      ),
    )
    .filter((item: Record<string, unknown>) => {
      // Ảnh mở khóa theo phase / bộ hồ sơ
      const itemPhase =
        typeof item.phase === "number"
          ? item.phase
          : typeof (item.metadata as any)?.phase === "number"
            ? (item.metadata as any).phase
            : 0;

      return itemPhase <= unlockedPhase;
    })
    .map((item: Record<string, unknown>, idx: number) => ({
      id: String(
        item.code || item.photo_code || item.photo_id || `photo-${idx + 1}`,
      ),
      filename: String(
        item.label ||
          item.title ||
          item.file_name ||
          item.filename ||
          item.code ||
          item.photo_code ||
          `IMG_${idx + 1000}.png`,
      ),
      driveUrl: normalizeImageUrl(
        String(
          item.direct_cdn_url ||
            item.drive_url ||
            item.url ||
            item.photo_url ||
            "",
        ),
      ),
      timestamp: String(
        item.timestamp || item.created_at || "24/07/2016 18:30",
      ),
      location: String(item.location || "Khu vực Bờ Sông"),
      description: String(
        item.description_prompt || item.description || item.note || "",
      ),
      size: String(item.size || "2.4 MB"),
    }));

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {selectedPhoto ? (
        /* PHOTO DETAIL VIEW */
        <div className="flex flex-col h-full animate-in fade-in-50 duration-200 relative">
          <div className="flex items-center justify-between px-3 pt-2 pb-2 bg-[#161618] border-b border-[#2C2C2E] shrink-0">
            <button
              onClick={() => {
                setSelectedPhoto(null);
                setShowExifInfo(false);
              }}
              className="flex items-center gap-0.5 text-[#0A84FF] text-[13px] font-medium active:opacity-60"
            >
              <ArrowLeft className="size-4" />
              <span>Thư viện</span>
            </button>
            <div className="text-center">
              <div className="text-[11px] font-semibold text-white">
                Ảnh vật chứng
              </div>
              <div className="text-[9px] text-[#8E8E93]">
                {selectedPhoto.timestamp}
              </div>
            </div>
            <button
              onClick={() => setShowExifInfo(!showExifInfo)}
              className={cn(
                "p-1 transition-colors",
                showExifInfo ? "text-[#0A84FF]" : "text-[#8E8E93]",
              )}
              title="Xem thông số EXIF"
            >
              <Info className="size-4" />
            </button>
          </div>

          {/* Photo Display */}
          <div className="flex-1 bg-[#09090B] flex flex-col items-center justify-center p-3 overflow-hidden">
            <div className="relative w-full max-h-[220px] rounded-xl overflow-hidden border border-[#2C2C2E] bg-[#18181B] flex flex-col items-center justify-center shadow-lg">
              {selectedPhoto.driveUrl ? (
                <img
                  src={selectedPhoto.driveUrl}
                  alt={selectedPhoto.filename}
                  className="w-full h-full object-contain max-h-[220px]"
                />
              ) : (
                <div className="p-4 text-center">
                  <ImageIcon className="size-10 text-[#8E8E93] mx-auto mb-2 opacity-50" />
                  <span className="text-[11px] text-[#8E8E93] font-mono block">
                    {selectedPhoto.filename}
                  </span>
                </div>
              )}
            </div>

            {/* EXIF Metadata Box */}
            {showExifInfo && (
              <div className="w-full mt-3 p-3 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] space-y-1.5 text-[11px] font-mono text-[#8E8E93]">
                <div className="flex justify-between">
                  <span>Tên file:</span>
                  <span className="text-white">{selectedPhoto.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian:</span>
                  <span className="text-white">{selectedPhoto.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vị trí:</span>
                  <span className="text-white">{selectedPhoto.location}</span>
                </div>
                {selectedPhoto.description && (
                  <div className="border-t border-[#2C2C2E] pt-1 mt-1 text-white italic">
                    "{selectedPhoto.description}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PHOTO GRID VIEW */
        <div className="flex flex-col h-full">
          <div className="px-3 pt-2.5 pb-2 bg-[#000000] shrink-0 border-b border-[#1C1C1E]">
            <div className="flex items-center justify-center">
              <span className="text-[17px] font-semibold tracking-tight text-white">
                Ảnh
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-[#8E8E93]">
              <Loader2 className="size-6 animate-spin mb-2 text-[#0A84FF]" />
              <span className="text-xs">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="flex-1 p-4 flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-xs text-red-400">Lỗi: {error}</span>
              <button
                onClick={refetch}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="size-3.5" /> Thử lại
              </button>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 pb-14">
              <div className="size-16 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93]">
                <CloudOff className="size-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5 max-w-[260px]">
                <h2 className="text-[16px] font-bold text-white tracking-tight">
                  Thư viện trống
                </h2>
                <p className="text-[12px] text-[#8E8E93]">
                  Không tìm thấy ảnh trong hồ sơ vụ án.
                </p>
              </div>
              <button
                onClick={refetch}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[#8E8E93] hover:text-white text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="size-3" /> Làm mới
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-1 pb-10 flex flex-col justify-between">
              <div className="grid grid-cols-3 gap-1">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="aspect-square bg-[#1C1C1E] border border-white/5 overflow-hidden hover:opacity-80 active:scale-95 cursor-pointer flex flex-col items-center justify-center relative group"
                  >
                    {photo.driveUrl ? (
                      <img
                        src={photo.driveUrl}
                        alt={photo.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <ImageIcon className="size-5 text-[#8E8E93] opacity-40 group-hover:text-[#0A84FF] transition-colors" />
                        <span className="text-[8px] font-mono text-[#8E8E93] truncate w-full text-center mt-1 px-1">
                          {photo.filename}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="py-4 text-center text-[11px] text-[#8E8E93] font-sans">
                {photos.length} Ảnh
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
