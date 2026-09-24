"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  ArrowLeft,
  ChevronLeft,
  Info,
  Trash2,
  CloudOff,
  Loader2,
} from "lucide-react";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";

interface PhotosAppProps {
  photos?: any[];
  onBackToHome?: () => void;
}

export function PhotosApp({ onBackToHome }: PhotosAppProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [showExifInfo, setShowExifInfo] = useState(false);

  const { data: sheetPhotos, loading, error } = usePhoneData("photos");

  const photos = sheetPhotos.map((item: any, idx: number) => ({
    id: item.photo_id || `photo-${idx + 1}`,
    filename: item.filename || item.photo_id || `IMG_${idx + 1000}.png`,
    driveUrl: normalizeImageUrl(
      item.drive_url || item.url || item.photo_url || "",
    ),
    timestamp: item.timestamp || item.created_at || "24/07/2016 18:30",
    location: item.location || "Khu vực Bờ Sông",
    description: item.description || item.note || "",
    size: item.size || "2.4 MB",
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
          <div className="px-4 pt-3 pb-2 bg-[#000000] shrink-0 border-b border-[#1C1C1E]">
            <div className="flex items-center justify-between mb-1">
              {onBackToHome ? (
                <button
                  onClick={onBackToHome}
                  className="flex items-center gap-0.5 text-[#0A84FF] text-[12.5px] font-medium hover:opacity-80 active:opacity-60 cursor-pointer"
                  title="Thoát ứng dụng về Màn hình chính"
                >
                  <ChevronLeft className="size-4" />
                  <span>Trang chính</span>
                </button>
              ) : (
                <span className="w-12" />
              )}
              <span className="text-[17px] font-bold tracking-tight text-white">
                Thư viện ảnh
              </span>
              <span className="w-12" />
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-[#8E8E93]">
              <Loader2 className="size-6 animate-spin mb-2 text-[#0A84FF]" />
              <span className="text-xs">
                Đang tải thư viện ảnh từ Google Sheets...
              </span>
            </div>
          ) : error ? (
            <div className="flex-1 p-4 text-center text-xs text-red-400">
              Lỗi: {error}
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
                  Không có ảnh nào trong thư viện Google Sheets.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2 pb-10">
              <div className="grid grid-cols-3 gap-1.5">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="aspect-square rounded-lg bg-[#1C1C1E] border border-[#2C2C2E] overflow-hidden hover:opacity-80 active:scale-95 cursor-pointer flex flex-col items-center justify-center p-1 relative group"
                  >
                    {photo.driveUrl ? (
                      <img
                        src={photo.driveUrl}
                        alt={photo.filename}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <>
                        <ImageIcon className="size-5 text-[#8E8E93] opacity-40 group-hover:text-[#0A84FF] transition-colors" />
                        <span className="text-[8px] font-mono text-[#8E8E93] truncate w-full text-center mt-1">
                          {photo.filename}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
