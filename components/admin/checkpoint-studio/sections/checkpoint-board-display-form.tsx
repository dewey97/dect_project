"use client";

import React from "react";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import type { DbCaseCharacter } from "@/lib/types/database";
import type { BoardConfig } from "@/lib/types/database";
import { Eye, EyeOff, FileText, Image as ImageIcon, Tag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckpointBoardDisplayFormProps {
  draft: CheckpointStudioDraft;
  characters?: DbCaseCharacter[];
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const STOCK_TEMPLATES = [
  { value: "custom", label: "Chữ viết tay tự do (Khuyên dùng)" },
  { value: "/images/board/notes/note_nghi_van.png", label: "Ảnh in sẵn: [NGHI VẤN]" },
  { value: "/images/board/notes/note_cau_hoi_vu.png", label: "Ảnh in sẵn: [CÂU HỎI VŨ]" },
  { value: "/images/board/notes/note_cau_hoi_tung.png", label: "Ảnh in sẵn: [CÂU HỎI TÙNG]" },
  { value: "/images/board/notes/note_cau_hoi_ha.png", label: "Ảnh in sẵn: [CÂU HỎI HÀ]" },
  { value: "/images/board/notes/note_mo_rong_dieu_tra.png", label: "Ảnh in sẵn: [MỞ RỘNG ĐIỀU TRA]" },
  { value: "/images/board/notes/note_kham_xet_lai.png", label: "Ảnh in sẵn: [KHÁM XÉT LẠI]" },
  { value: "/images/board/notes/note_ket_luan_dieu_tra.png", label: "Ảnh in sẵn: [BẢN KẾT LUẬN]" },
];

const NOTE_COLORS: Array<{ value: "yellow" | "white" | "red" | "blue"; label: string; bgClass: string }> = [
  { value: "yellow", label: "Vàng", bgClass: "bg-amber-400 text-zinc-900" },
  { value: "white", label: "Trắng", bgClass: "bg-zinc-100 text-zinc-900" },
  { value: "red", label: "Đỏ", bgClass: "bg-rose-500 text-white" },
  { value: "blue", label: "Xanh", bgClass: "bg-sky-500 text-white" },
];

const PIN_COLORS: Array<{ value: "red" | "yellow" | "blue" | "silver" | "brass"; label: string; dotClass: string }> = [
  { value: "red", label: "Đỏ", dotClass: "bg-red-500" },
  { value: "yellow", label: "Vàng", dotClass: "bg-amber-400" },
  { value: "blue", label: "Xanh", dotClass: "bg-blue-500" },
  { value: "silver", label: "Bạc", dotClass: "bg-zinc-300" },
  { value: "brass", label: "Đồng", dotClass: "bg-amber-600" },
];

export function CheckpointBoardDisplayForm({
  draft,
  characters = [],
  onChange,
}: CheckpointBoardDisplayFormProps) {
  const cfg: BoardConfig = draft.boardConfig || {};
  const isHidden = cfg.hidden === true;
  const displayMode = cfg.display_mode || "note";
  const noteTemplate = cfg.note_template || "custom";
  const noteColor = cfg.note_color || "yellow";
  const pinColor = cfg.pin_color || "red";
  const pinTitle = cfg.pin_title ?? "";
  const photoUrl = cfg.photo_url ?? "";
  const scale = typeof cfg.scale === "number" && cfg.scale > 0 ? cfg.scale : 1.0;
  const rotation = typeof cfg.rotation === "number" ? cfg.rotation : 0;
  const pulse = Boolean(cfg.pulse);

  const updateCfg = (patch: Partial<BoardConfig>) => {
    onChange({
      boardConfig: {
        ...cfg,
        ...patch,
      },
    });
  };

  return (
    <div className="rounded-md border border-white/10 bg-[#121216] p-3 text-xs space-y-3">
      {/* 1. Header: Toggle Ẩn / Hiện trên bảng */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
          <Tag className="size-3.5 text-amber-400" />
          <span>Hiển thị trên Bảng điều tra</span>
        </span>
        <button
          type="button"
          onClick={() => updateCfg({ hidden: !isHidden })}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
            !isHidden
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-zinc-800 text-zinc-400 border border-white/5 hover:text-zinc-200",
          )}
        >
          {!isHidden ? (
            <>
              <Eye className="size-3" />
              <span>Đang hiện</span>
            </>
          ) : (
            <>
              <EyeOff className="size-3" />
              <span>Đang ẩn</span>
            </>
          )}
        </button>
      </div>

      {!isHidden && (
        <>
          {/* 2. Dạng hiển thị (Display Mode) */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              Kiểu hiển thị
            </label>
            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded border border-white/5">
              <button
                type="button"
                onClick={() => updateCfg({ display_mode: "note" })}
                className={cn(
                  "flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer",
                  displayMode === "note"
                    ? "bg-amber-500/20 text-amber-300 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                <FileText className="size-3" />
                <span>Giấy note</span>
              </button>
              <button
                type="button"
                onClick={() => updateCfg({ display_mode: "photo" })}
                className={cn(
                  "flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer",
                  displayMode === "photo"
                    ? "bg-purple-500/20 text-purple-300 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                <ImageIcon className="size-3" />
                <span>Ảnh Polaroid</span>
              </button>
              <button
                type="button"
                onClick={() => updateCfg({ display_mode: "badge" })}
                className={cn(
                  "flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer",
                  displayMode === "badge"
                    ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                <Tag className="size-3" />
                <span>Thẻ nhãn</span>
              </button>
            </div>
          </div>

          {/* 3A. Cấu hình Giấy note */}
          {displayMode === "note" && (
            <div className="space-y-2.5 rounded bg-black/20 p-2.5 border border-white/5">
              {/* Mẫu phôi giấy */}
              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-400">Mẫu phôi giấy</label>
                <select
                  value={noteTemplate}
                  onChange={(e) => updateCfg({ note_template: e.target.value })}
                  className="w-full rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-amber-400"
                >
                  {STOCK_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.value} value={tmpl.value} className="bg-zinc-900">
                      {tmpl.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tiêu đề trên ghim (chữ viết tay) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] text-zinc-400">
                    Chữ viết tay trên note (Pin Label)
                  </label>
                  {!pinTitle && (
                    <span className="text-[10px] text-zinc-500 italic">
                      Mặc định: &quot;{draft.title || "Nghi vấn"}&quot;
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={pinTitle}
                  onChange={(e) => updateCfg({ pin_title: e.target.value })}
                  placeholder={draft.title || "Nhập chữ viết trên giấy note..."}
                  className="w-full rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-amber-200 outline-none focus:border-amber-400 placeholder:text-zinc-600"
                />
              </div>

              {/* Màu giấy note & Màu ghim */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-400">Màu giấy</label>
                  <div className="flex gap-1.5">
                    {NOTE_COLORS.map((nc) => (
                      <button
                        key={nc.value}
                        type="button"
                        onClick={() => updateCfg({ note_color: nc.value })}
                        className={cn(
                          "size-5 rounded border transition-transform cursor-pointer",
                          nc.bgClass,
                          noteColor === nc.value
                            ? "border-amber-400 scale-110 ring-2 ring-amber-400/30"
                            : "border-white/10 opacity-70 hover:opacity-100",
                        )}
                        title={nc.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-400">Ghim bấm</label>
                  <div className="flex gap-1.5">
                    {PIN_COLORS.map((pc) => (
                      <button
                        key={pc.value}
                        type="button"
                        onClick={() => updateCfg({ pin_color: pc.value })}
                        className={cn(
                          "size-5 rounded-full border flex items-center justify-center transition-transform cursor-pointer",
                          pc.dotClass,
                          pinColor === pc.value
                            ? "border-white scale-110 ring-2 ring-white/50"
                            : "border-black/40 opacity-70 hover:opacity-100",
                        )}
                        title={pc.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3B. Cấu hình Ảnh Polaroid */}
          {displayMode === "photo" && (
            <div className="space-y-2.5 rounded bg-black/20 p-2.5 border border-white/5">
              {/* URL ảnh */}
              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-400">Đường dẫn ảnh (URL)</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => updateCfg({ photo_url: e.target.value })}
                  placeholder="/images/... hoặc https://..."
                  className="w-full rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-purple-400 placeholder:text-zinc-600 font-mono text-[11px]"
                />
              </div>

              {/* Chọn nhanh từ Avatar nhân vật */}
              {characters.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500">
                    Chọn nhanh từ nhân vật vụ án:
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {characters
                      .filter((c) => c.avatar_url)
                      .map((c) => (
                        <button
                          key={c.id || c.key}
                          type="button"
                          onClick={() =>
                            updateCfg({
                              photo_url: c.avatar_url || undefined,
                              pin_title: pinTitle || `Nghi phạm: ${c.name}`,
                            })
                          }
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] border transition-colors cursor-pointer",
                            photoUrl === c.avatar_url
                              ? "border-purple-400 bg-purple-500/20 text-purple-200"
                              : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-zinc-200",
                          )}
                        >
                          {c.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Chú thích ảnh polaroid */}
              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-400">Chú thích dưới ảnh</label>
                <input
                  type="text"
                  value={pinTitle}
                  onChange={(e) => updateCfg({ pin_title: e.target.value })}
                  placeholder={draft.title || "Nhập chú thích ảnh..."}
                  className="w-full rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-purple-400 placeholder:text-zinc-600"
                />
              </div>

              {/* Preview ảnh */}
              {photoUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="size-12 rounded border border-white/10 bg-black overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 break-all leading-tight">
                    {pinTitle || draft.title || "Ảnh xem trước"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 3C. Cấu hình Thẻ nhãn (Badge) */}
          {displayMode === "badge" && (
            <div className="space-y-2 rounded bg-black/20 p-2.5 border border-white/5">
              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-400">Nhãn hiển thị</label>
                <input
                  type="text"
                  value={pinTitle}
                  onChange={(e) => updateCfg({ pin_title: e.target.value })}
                  placeholder={draft.title || "Nhập nhãn định danh..."}
                  className="w-full rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-emerald-200 outline-none focus:border-emerald-400 placeholder:text-zinc-600"
                />
              </div>
            </div>
          )}

          {/* 4. Kích thước (Scale) & Góc xoay (Rotation) */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Tỉ lệ</span>
                <span className="text-amber-400 font-semibold">{scale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="2.0"
                step="0.05"
                value={scale}
                onChange={(e) => updateCfg({ scale: parseFloat(e.target.value) })}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Góc xoay</span>
                <span className="text-amber-400 font-semibold">{rotation}°</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={rotation}
                onChange={(e) => updateCfg({ rotation: parseInt(e.target.value, 10) })}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          {/* 5. Hiệu ứng nổi bật (Pulse) */}
          <label className="flex items-center gap-2 pt-1 text-[11px] text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={pulse}
              onChange={(e) => updateCfg({ pulse: e.target.checked })}
              className="rounded border-white/20 bg-zinc-800 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <Sparkles className="size-3 text-amber-400" />
            <span>Viền nhấp nháy phát sáng (Pulse)</span>
          </label>
        </>
      )}
    </div>
  );
}
