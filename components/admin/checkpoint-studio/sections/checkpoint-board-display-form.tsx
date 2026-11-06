"use client";

import React from "react";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import type { DbCaseCharacter } from "@/lib/types/database";
import type { BoardConfig } from "@/lib/types/database";
import { Eye, EyeOff, FileText, Image as ImageIcon, Tag, Pin, ArrowUp, ArrowDown, ArrowUpToLine, ArrowDownToLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckpointBoardDisplayFormProps {
  draft: CheckpointStudioDraft;
  characters?: DbCaseCharacter[];
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const NOTE_COLORS: Array<{ value: "yellow" | "white" | "red" | "blue"; label: string; dotClass: string }> = [
  { value: "yellow", label: "Vàng", dotClass: "bg-amber-300 border-amber-400" },
  { value: "white", label: "Trắng", dotClass: "bg-zinc-100 border-zinc-300" },
  { value: "blue", label: "Xanh", dotClass: "bg-sky-400 border-sky-500" },
  { value: "red", label: "Đỏ", dotClass: "bg-rose-400 border-rose-500" },
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

  // Nếu là checkpoint thẩm tra nghi phạm chính (suspect_interrogation), mặc định trên bảng là ảnh Polaroid
  const isSuspectInterrogation =
    draft.kind === "suspect_interrogation" ||
    draft.type === "suspect_interrogation";

  const defaultMode = isSuspectInterrogation ? "photo" : "note";
  const displayMode = cfg.display_mode || defaultMode;

  const matchedChar = characters.find(
    (c) =>
      (draft.subjectKey && c.key.toLowerCase() === draft.subjectKey.toLowerCase()) ||
      (draft.checkpointId && draft.checkpointId.includes(c.key.toLowerCase())),
  );

  const defaultNoteColor =
    draft.kind === "phone_lookup" || draft.kind === "indictment"
      ? "white"
      : "yellow";
  const noteColor = cfg.note_color || defaultNoteColor;
  const pinColor = cfg.pin_color || (displayMode === "photo" ? "blue" : "red");
  const pinTitle = cfg.pin_title !== undefined ? cfg.pin_title : (draft.title || "");
  const photoUrl =
    cfg.photo_url ??
    (isSuspectInterrogation && matchedChar?.avatar_url
      ? matchedChar.avatar_url
      : "");
  const hasPin = Boolean(cfg.has_pin);
  const zIndex = typeof cfg.z_index === "number" ? cfg.z_index : 0;
  const isPolaroid = cfg.is_polaroid !== false;
  const textScale =
    typeof cfg.text_scale === "number" && cfg.text_scale > 0
      ? cfg.text_scale
      : 1.0;
  const scale =
    typeof cfg.scale === "number" && cfg.scale > 0
      ? cfg.scale
      : 1.0;

  const updateCfg = (patch: Partial<BoardConfig>) => {
    onChange({
      boardConfig: {
        ...cfg,
        ...patch,
      },
    });
  };

  return (
    <div className="rounded-md border border-white/10 bg-[#121216] p-3 text-xs space-y-2.5">
      {/* 1. Header: Thứ tự lớp & Toggle Ẩn / Hiện trên bảng */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <span className="font-semibold text-zinc-200 flex items-center gap-1.5 text-[11px]">
          <Tag className="size-3.5 text-amber-400" />
          <span>Bảng điều tra</span>
        </span>

        <div className="flex items-center gap-1.5">
          {/* Cụm điều chỉnh thứ tự lớp Z-Index (chỉ icon, bỏ text số lớp) */}
          <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded border border-white/10">
            <button
              type="button"
              onClick={() => updateCfg({ z_index: -5 })}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Dưới cùng"
            >
              <ArrowDownToLine className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => updateCfg({ z_index: zIndex - 1 })}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Xuống 1 lớp"
            >
              <ArrowDown className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => updateCfg({ z_index: zIndex + 1 })}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Lên 1 lớp"
            >
              <ArrowUp className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => updateCfg({ z_index: 5 })}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Trên cùng"
            >
              <ArrowUpToLine className="size-3" />
            </button>
          </div>

          {/* Toggle Ẩn / Hiện (chỉ icon con mắt theo yêu cầu) */}
          <button
            type="button"
            onClick={() => updateCfg({ hidden: !isHidden })}
            className={cn(
              "p-1.5 rounded transition-colors cursor-pointer flex items-center justify-center",
              !isHidden
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                : "bg-zinc-800 text-zinc-500 border border-white/5 hover:text-zinc-300 hover:bg-zinc-700",
            )}
            title={!isHidden ? "Đang hiện trên bảng (Click để ẩn)" : "Đang ẩn khỏi bảng (Click để hiện)"}
          >
            {!isHidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </button>
        </div>
      </div>

      {!isHidden && (
        <>
          {/* 2. Dạng hiển thị (Display Mode) */}
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
              onClick={() =>
                updateCfg({
                  display_mode: "photo",
                  photo_url:
                    photoUrl || matchedChar?.avatar_url || undefined,
                })
              }
              className={cn(
                "flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer",
                displayMode === "photo"
                  ? "bg-purple-500/20 text-purple-300 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              <ImageIcon className="size-3" />
              <span>Ảnh</span>
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

          {/* 3A. Cấu hình Giấy note (Tactile Sticky Note) */}
          {displayMode === "note" && (
            <div className="space-y-2 rounded bg-black/20 p-2.5 border border-white/5">
              {/* Tiêu đề trên ghim (Label) - cùng dòng */}
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-400 shrink-0 w-10">
                  Label
                </label>
                <input
                  type="text"
                  value={pinTitle}
                  onChange={(e) => updateCfg({ pin_title: e.target.value })}
                  placeholder="Nhập chữ trên note..."
                  className="flex-1 rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-amber-200 outline-none focus:border-amber-400 placeholder:text-zinc-600 font-sans"
                />
              </div>

              {/* Màu giấy note - cùng dòng, các ô tròn */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[10px] text-zinc-400">Màu giấy</span>
                <div className="flex items-center gap-1.5">
                  {NOTE_COLORS.map((nc) => (
                    <button
                      key={nc.value}
                      type="button"
                      onClick={() => updateCfg({ note_color: nc.value })}
                      className={cn(
                        "size-5 rounded-full border transition-all cursor-pointer flex items-center justify-center",
                        noteColor === nc.value
                          ? "border-white ring-2 ring-amber-400 scale-110"
                          : "border-white/20 hover:scale-105 opacity-70 hover:opacity-100",
                      )}
                      title={nc.label}
                    >
                      <span className={cn("size-2.5 rounded-full border", nc.dotClass)} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Ghim bấm (Pin) - cùng dòng */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasPin}
                    onChange={(e) => updateCfg({ has_pin: e.target.checked })}
                    className="rounded border-white/20 bg-zinc-800 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <Pin className="size-3 text-amber-400 rotate-45" />
                  <span>Pin</span>
                </label>

                {hasPin && (
                  <div className="flex items-center gap-1.5">
                    {PIN_COLORS.map((pc) => (
                      <button
                        key={pc.value}
                        type="button"
                        onClick={() => updateCfg({ pin_color: pc.value })}
                        className={cn(
                          "size-5 rounded-full border transition-all cursor-pointer flex items-center justify-center",
                          pinColor === pc.value
                            ? "border-white ring-2 ring-amber-400 scale-110"
                            : "border-white/20 hover:scale-105 opacity-70 hover:opacity-100",
                        )}
                        title={pc.label}
                      >
                        <span className={cn("size-2.5 rounded-full", pc.dotClass)} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Kích thước note (Scale) - cùng dòng */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[10px] text-zinc-400">Kích thước note</span>
                <div className="flex items-center gap-2 flex-1 max-w-[170px]">
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={scale}
                    onChange={(e) =>
                      updateCfg({ scale: parseFloat(e.target.value) })
                    }
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-amber-400 font-mono text-[10px] w-8 text-right shrink-0">
                    {scale.toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Cỡ chữ trên note - cùng dòng */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[10px] text-zinc-400">Cỡ chữ</span>
                <div className="flex items-center gap-2 flex-1 max-w-[170px]">
                  <input
                    type="range"
                    min="0.7"
                    max="1.8"
                    step="0.05"
                    value={textScale}
                    onChange={(e) =>
                      updateCfg({ text_scale: parseFloat(e.target.value) })
                    }
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-amber-400 font-mono text-[10px] w-8 text-right shrink-0">
                    {textScale.toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3B. Cấu hình Ảnh */}
          {displayMode === "photo" && (
            <div className="space-y-2 rounded bg-black/20 p-2.5 border border-white/5">
              {/* Khung Polaroid checkbox */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPolaroid}
                    onChange={(e) => updateCfg({ is_polaroid: e.target.checked })}
                    className="rounded border-white/20 bg-zinc-800 text-purple-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Khung Polaroid</span>
                </label>
              </div>
              {/* URL ảnh - cùng dòng */}
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-400 shrink-0 w-10">URL</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => updateCfg({ photo_url: e.target.value })}
                  placeholder="/images/... hoặc https://..."
                  className="flex-1 rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-purple-400 placeholder:text-zinc-600 font-mono text-[11px]"
                />
              </div>

              {/* Chọn nhanh từ Avatar nhân vật */}
              {characters.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <span className="text-[10px] text-zinc-500 shrink-0">Nhân vật:</span>
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

              {/* Chú thích ảnh polaroid - cùng dòng */}
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-400 shrink-0 w-10">Label</label>
                <input
                  type="text"
                  value={pinTitle}
                  onChange={(e) => updateCfg({ pin_title: e.target.value })}
                  placeholder="Nhập tên hoặc chú thích..."
                  className="flex-1 rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-purple-400 placeholder:text-zinc-600"
                />
              </div>

              {/* Màu ghim bấm Polaroid - cùng dòng */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[10px] text-zinc-400">Màu ghim</span>
                <div className="flex items-center gap-1.5">
                  {PIN_COLORS.map((pc) => (
                    <button
                      key={pc.value}
                      type="button"
                      onClick={() => updateCfg({ pin_color: pc.value })}
                      className={cn(
                        "size-5 rounded-full border transition-all cursor-pointer flex items-center justify-center",
                        pinColor === pc.value
                          ? "border-purple-400 ring-2 ring-purple-400/50 scale-110"
                          : "border-white/20 hover:scale-105 opacity-70 hover:opacity-100",
                      )}
                      title={pc.label}
                    >
                      <span className={cn("size-2.5 rounded-full", pc.dotClass)} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Kích thước ảnh (Scale) - cùng dòng */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[10px] text-zinc-400">Kích thước ảnh</span>
                <div className="flex items-center gap-2 flex-1 max-w-[170px]">
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={scale}
                    onChange={(e) =>
                      updateCfg({ scale: parseFloat(e.target.value) })
                    }
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                  <span className="text-purple-400 font-mono text-[10px] w-8 text-right shrink-0">
                    {scale.toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Preview ảnh */}
              {photoUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="size-10 rounded border border-white/10 bg-black overflow-hidden shrink-0">
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
              {/* Label - cùng dòng */}
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-400 shrink-0 w-10">Label</label>
                <input
                  type="text"
                  value={pinTitle}
                  onChange={(e) => updateCfg({ pin_title: e.target.value })}
                  placeholder="Nhập nhãn định danh..."
                  className="flex-1 rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-emerald-200 outline-none focus:border-emerald-400 placeholder:text-zinc-600 font-mono"
                />
              </div>

              {/* Màu thẻ nhãn - cùng dòng, ô tròn */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[10px] text-zinc-400">Màu thẻ</span>
                <div className="flex items-center gap-1.5">
                  {NOTE_COLORS.map((nc) => (
                    <button
                      key={nc.value}
                      type="button"
                      onClick={() => updateCfg({ note_color: nc.value })}
                      className={cn(
                        "size-5 rounded-full border transition-all cursor-pointer flex items-center justify-center",
                        noteColor === nc.value
                          ? "border-white ring-2 ring-emerald-400 scale-110"
                          : "border-white/20 hover:scale-105 opacity-70 hover:opacity-100",
                      )}
                      title={nc.label}
                    >
                      <span className={cn("size-2.5 rounded-full border", nc.dotClass)} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Ghim bấm (Pin) - cùng dòng */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasPin}
                    onChange={(e) => updateCfg({ has_pin: e.target.checked })}
                    className="rounded border-white/20 bg-zinc-800 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <Pin className="size-3 text-emerald-400 rotate-45" />
                  <span>Pin</span>
                </label>

                {hasPin && (
                  <div className="flex items-center gap-1.5">
                    {PIN_COLORS.map((pc) => (
                      <button
                        key={pc.value}
                        type="button"
                        onClick={() => updateCfg({ pin_color: pc.value })}
                        className={cn(
                          "size-5 rounded-full border transition-all cursor-pointer flex items-center justify-center",
                          pinColor === pc.value
                            ? "border-white ring-2 ring-emerald-400 scale-110"
                            : "border-white/20 hover:scale-105 opacity-70 hover:opacity-100",
                        )}
                        title={pc.label}
                      >
                        <span className={cn("size-2.5 rounded-full", pc.dotClass)} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Kích thước thẻ (Scale) - cùng dòng */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[10px] text-zinc-400">Kích thước thẻ</span>
                <div className="flex items-center gap-2 flex-1 max-w-[170px]">
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={scale}
                    onChange={(e) =>
                      updateCfg({ scale: parseFloat(e.target.value) })
                    }
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <span className="text-emerald-400 font-mono text-[10px] w-8 text-right shrink-0">
                    {scale.toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
