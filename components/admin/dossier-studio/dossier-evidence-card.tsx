"use client";

import React from "react";
import {
  Image as ImageIcon,
  FileText,
  Volume2,
  Package,
  ZoomIn,
  Sparkles,
} from "lucide-react";
import { cn, normalizeImageUrl } from "@/lib/utils";
import type { DbCaseEvidence } from "@/lib/types/database";

interface DossierEvidenceCardProps {
  item: DbCaseEvidence;
  isSelected?: boolean;
  onSelect?: () => void;
  onViewImage?: (url: string) => void;
}

export function DossierEvidenceCard({
  item,
  isSelected = false,
  onSelect,
  onViewImage,
}: DossierEvidenceCardProps) {
  const isImageKind = item.kind === "image" || item.kind === "photo";
  const rawUrl = item.thumb_url || item.file_url;
  const displayUrl = normalizeImageUrl(rawUrl);

  const renderKindIcon = () => {
    switch (item.kind) {
      case "image":
      case "photo":
        return <ImageIcon className="size-3.5 text-amber-400" />;
      case "pdf":
        return <FileText className="size-3.5 text-rose-400" />;
      case "audio":
        return <Volume2 className="size-3.5 text-emerald-400" />;
      case "object":
        return <Package className="size-3.5 text-blue-400" />;
      default:
        return <Sparkles className="size-3.5 text-amber-400" />;
    }
  };

  const getKindLabel = () => {
    switch (item.kind) {
      case "image":
      case "photo":
        return "Ảnh Hiện Trường";
      case "pdf":
        return "Báo Cáo PDF";
      case "audio":
        return "Bản Ghi Âm";
      case "object":
        return "Hiện Vật";
      default:
        return item.kind;
    }
  };

  return (
    <div
      id={`doc-sheet-${item.code}`}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col w-[320px] rounded-xl border bg-[#14151a] shadow-xl transition-all cursor-pointer select-none overflow-hidden shrink-0",
        isSelected
          ? "border-amber-500/80 ring-4 ring-amber-500/20 bg-[#1a1b22] shadow-[0_0_25px_rgba(245,158,11,0.2)]"
          : "border-white/10 hover:border-white/25 hover:bg-[#181920]",
      )}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/5 bg-[#101116]">
        <div className="flex items-center gap-1.5 min-w-0">
          {renderKindIcon()}
          <span className="font-mono text-xs font-bold text-amber-300">
            {item.code}
          </span>
          <span className="text-[10px] text-neutral-500">• {getKindLabel()}</span>
        </div>
      </div>

      {/* Media Preview Box */}
      <div className="relative aspect-[4/3] w-full bg-black/60 flex items-center justify-center overflow-hidden border-b border-white/5 group/media">
        {displayUrl && isImageKind ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/media:scale-105"
            loading="lazy"
          />
        ) : displayUrl && item.kind === "pdf" ? (
          <div className="flex flex-col items-center gap-2 text-neutral-400 p-4 text-center">
            <FileText className="size-12 text-rose-400/80" />
            <span className="text-[11px] font-mono line-clamp-1 text-neutral-300">
              {displayUrl.split("/").pop()}
            </span>
          </div>
        ) : displayUrl && item.kind === "audio" ? (
          <div className="flex flex-col items-center gap-2 text-neutral-400 p-4 text-center">
            <Volume2 className="size-12 text-emerald-400/80" />
            <span className="text-[11px] font-mono line-clamp-1 text-neutral-300">
              {displayUrl.split("/").pop()}
            </span>
          </div>
        ) : displayUrl && item.kind === "object" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt={item.title}
            className="w-full h-full object-contain p-2"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-neutral-500">
            <Package className="size-8 opacity-40" />
            <span className="text-[11px] italic">Chưa có tệp đính kèm</span>
          </div>
        )}

        {/* Nút phóng to ảnh lớn */}
        {displayUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewImage?.(displayUrl);
            }}
            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-neutral-300 hover:text-white backdrop-blur-md opacity-0 group-hover/media:opacity-100 transition-opacity shadow-md"
            title="Xem toàn màn hình"
          >
            <ZoomIn className="size-4 text-amber-400" />
          </button>
        )}
      </div>

      {/* Title & Description */}
      <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-zinc-100 line-clamp-1 group-hover:text-amber-300 transition-colors">
            {item.title || "Chưa đặt tên vật chứng"}
          </h4>
          {item.description && (
            <p className="mt-1 text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Footer slot index tag */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
          <span>Vị trí: #{item.slot_index ?? 0}</span>
          <span className="text-[9px] uppercase tracking-wider text-amber-500/70">
            Tang vật
          </span>
        </div>
      </div>
    </div>
  );
}
