"use client";

import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Volume2,
  Package,
  ExternalLink,
} from "lucide-react";
import type { DbCaseEvidence } from "@/lib/types/database";
import { cn, normalizeImageUrl } from "@/lib/utils";

interface EvidencePreviewProps {
  evidence: Partial<DbCaseEvidence> | null;
}

export function EvidencePreview({ evidence }: EvidencePreviewProps) {
  if (!evidence || !evidence.code) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500 border border-zinc-800/80 rounded-xl bg-zinc-950/40">
        <Package className="size-12 stroke-[1.2] text-zinc-600 mb-3 opacity-60" />
        <h4 className="text-sm font-medium text-zinc-400">
          Chưa chọn chứng cứ
        </h4>
        <p className="text-xs text-zinc-600 mt-1 max-w-xs">
          Chọn một chứng cứ từ danh sách bên trái hoặc tạo mới để xem bản mô
          phỏng giao diện người chơi.
        </p>
      </div>
    );
  }

  const kind = evidence.kind || "photo";
  const rawUrl = evidence.thumb_url || evidence.file_url;
  const imgUrl = normalizeImageUrl(rawUrl);

  return (
    <div className="h-full flex flex-col overflow-y-auto space-y-4 pr-1">
      {/* DIEGETIC EVIDENCE CARD — PHONG CÁCH TANG VẬT ĐIỀU TRA */}
      <div className="border border-amber-900/40 bg-[#140e0a] rounded-xl p-5 shadow-2xl relative overflow-hidden text-[#e5d8cb]">
        {/* Top vintage accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-800/60 via-amber-600/80 to-amber-900/60" />

        {/* Header tags */}
        <div className="flex items-center justify-between gap-2 border-b border-amber-950/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider",
                kind === "pdf" &&
                  "bg-rose-950/70 text-rose-300 border border-rose-800/50",
                (kind === "photo" || kind === "image") &&
                  "bg-sky-950/70 text-sky-300 border border-sky-800/50",
                kind === "audio" &&
                  "bg-emerald-950/70 text-emerald-300 border border-emerald-800/50",
                kind === "object" &&
                  "bg-amber-950/70 text-amber-300 border border-amber-800/50",
              )}
            >
              {kind === "pdf" && <FileText className="size-3" />}
              {(kind === "photo" || kind === "image") && (
                <ImageIcon className="size-3" />
              )}
              {kind === "audio" && <Volume2 className="size-3" />}
              {kind === "object" && <Package className="size-3" />}
              {kind.toUpperCase()}
            </span>

            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
              #{evidence.code}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            <span className="bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
              Phase {evidence.phase ?? 0}
            </span>
            <span className="bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
              Slot {evidence.slot_index ?? 0}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-amber-100 font-serif leading-snug mb-3">
          {evidence.title || "Chưa đặt tiêu đề chứng cứ"}
        </h3>

        {/* Media Container */}
        {(kind === "photo" || kind === "image") && (
          <div className="relative aspect-video w-full rounded-lg bg-black/60 border border-amber-950/80 overflow-hidden mb-4 group flex items-center justify-center">
            {imgUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgUrl}
                alt={evidence.title || "Chứng cứ"}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-600 gap-2">
                <ImageIcon className="size-8 stroke-1" />
                <span className="text-xs font-mono">Chưa có ảnh</span>
              </div>
            )}
            {imgUrl && (
              <a
                href={imgUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute top-2 right-2 p-1.5 rounded bg-black/70 hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Mở ảnh gốc trong tab mới"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        )}

        {kind === "pdf" && (
          <div className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-800 mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-400">
                <FileText className="size-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-200">
                  Hồ sơ / Biên bản PDF
                </p>
                <p className="text-[11px] font-mono text-zinc-500 truncate max-w-[200px]">
                  {evidence.file_url || "Chưa có đường dẫn PDF"}
                </p>
              </div>
            </div>
            {evidence.file_url && (
              <a
                href={evidence.file_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-mono rounded bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 flex items-center gap-1.5 transition-colors"
              >
                <span>Xem PDF</span>
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        )}

        {kind === "audio" && (
          <div className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-800 mb-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Volume2 className="size-4" />
              <span>Ghi âm lời khai / Băng từ</span>
            </div>
            {evidence.file_url ? (
              <audio controls src={evidence.file_url} className="w-full h-8" />
            ) : (
              <p className="text-xs text-zinc-500 italic">
                Chưa tải lên tệp âm thanh
              </p>
            )}
          </div>
        )}

        {kind === "object" && (
          <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/30 mb-4 flex items-center gap-3">
            <div className="p-2.5 rounded bg-amber-950/50 border border-amber-800/50 text-amber-400">
              <Package className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-200">
                Vật phẩm tang vật thực địa
              </p>
              <p className="text-[11px] text-zinc-400">
                Niêm phong trong túi zip bảo quản
              </p>
            </div>
          </div>
        )}

        {/* Description / Content */}
        {evidence.description && (
          <div className="mb-4">
            <label className="text-[11px] font-mono uppercase tracking-wider text-amber-600/80 block mb-1">
              Mô tả chi tiết / Lời dẫn
            </label>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-black/30 p-3 rounded border border-amber-950/50">
              {evidence.description}
            </p>
          </div>
        )}

        {/* Dossier footer badge */}
        <div className="pt-3 border-t border-amber-950/50 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-zinc-500">
            Bộ hồ sơ: Phase {evidence.phase ?? 0}
          </span>
          <span className="text-amber-500/80 font-bold">#{evidence.code}</span>
        </div>
      </div>
    </div>
  );
}
