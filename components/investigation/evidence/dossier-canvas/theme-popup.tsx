"use client";

import React from "react";
import {
  RotateCcw,
  X,
  Palette,
  Check,
} from "lucide-react";
import {
  DOSSIER_CANVAS_PRESETS,
  QUICK_CUSTOM_COLORS,
  createCustomCanvasTheme,
  type CanvasThemeConfig,
  type GridType,
  type LampTone,
} from "../dossier-canvas-themes";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { detectiveAudio } from "@/lib/investigation/investigation-audio";
import {
  emitInvestigationEvent,
  useInvestigationEvent,
} from "@/lib/investigation/investigation-events";
import {
  popAnnotationUndo,
  popAnnotationRedo,
} from "@/lib/investigation/annotation-history";
import type {
  CombinedItem,
  PDFDocument,
  PhysicalEvidence,
  SelectedView,
} from "../evidence-types";
import type { DbDossierDocument } from "@/lib/actions/dossier-actions";
import type { LoiKhaiData, LyLichData } from "@/lib/types/dossier";
import { DossierLoiKhaiSheet } from "@/components/admin/dossier-studio/dossier-loi-khai-sheet";
import { DossierLyLichSheet } from "@/components/admin/dossier-studio/dossier-ly-lich-sheet";
import {
  DossierAnnotationLayer,
  type AnnotationTool,
  type AnnotationColor,
  type EraserMode,
} from "../dossier-annotation-layer";
import { CASE_000_DOSSIER_MAP } from "@/lib/hooks/use-dossier-documents";
import { useRoomSync } from "@/components/investigation/room/room-sync-context";
import type { CanvasStickyNote } from "@/lib/types/room";
import {
  HIGHLIGHTER_PALETTE,
  HIGHLIGHTER_SIZES,
  PEN_PALETTE,
  PEN_SIZES,
  STICKY_NOTE_COLORS,
} from "./presets";
import { DossierCanvasToolbar } from "./toolbar";

export interface DossierCanvasThemePopupProps {
  themePopupRef: React.RefObject<HTMLDivElement | null>;
  isLight: boolean;
  canvasTheme: CanvasThemeConfig;
  handleResetDefaultTheme: () => void;
  setIsThemePopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setThemeActiveTab: React.Dispatch<React.SetStateAction<"presets" | "custom">>;
  themeActiveTab: "presets" | "custom";
  handleApplyTheme: (theme: CanvasThemeConfig) => void;
  customBaseColor: string;
  handleUpdateCustomTheme: (base: string, lamp: LampTone, intensity: number, grid: GridType) => void;
  customLampTone: LampTone;
  customLampIntensity: number;
  customGridType: GridType;
}

export function DossierCanvasThemePopup({
  themePopupRef,
  isLight,
  canvasTheme,
  handleResetDefaultTheme,
  setIsThemePopupOpen,
  setThemeActiveTab,
  themeActiveTab,
  handleApplyTheme,
  customBaseColor,
  handleUpdateCustomTheme,
  customLampTone,
  customLampIntensity,
  customGridType,
}: DossierCanvasThemePopupProps) {
  return (
    <div
          ref={themePopupRef}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "fixed top-16 right-4 sm:right-6 w-[420px] max-w-[calc(100vw-2rem)] backdrop-blur-2xl rounded-2xl p-3.5 flex flex-col gap-3 z-50 animate-in fade-in zoom-in-95 duration-100 select-none",
            isLight
              ? "bg-white/98 border border-zinc-200 shadow-[0_25px_60px_rgba(0,0,0,0.15)] text-zinc-900"
              : "bg-[#121418]/98 border border-[#353945] shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-zinc-200"
          )}
        >
          {/* Header: Title + Reset + Close */}
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-amber-400 shrink-0" />
              <span className="font-mono text-xs font-bold tracking-wider text-amber-300 uppercase">
                Mặt bàn hồ sơ
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded truncate max-w-[130px]">
                {canvasTheme.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {(canvasTheme.id !== "mahogany-warm" || canvasTheme.isCustom) && (
                <button
                  type="button"
                  onClick={handleResetDefaultTheme}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors cursor-pointer"
                  title="Khôi phục mặt bàn gỗ gụ mặc định"
                >
                  <RotateCcw className="size-3" />
                  <span>Mặc định</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsThemePopupOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Đóng bảng màu"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Tab navigation: [Mẫu sẵn có] / [Tùy biến tự do] */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-900/90 rounded-xl border border-zinc-800/80 text-xs font-mono">
            <button
              type="button"
              onClick={() => setThemeActiveTab("presets")}
              className={cn(
                "py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer",
                themeActiveTab === "presets"
                  ? "bg-zinc-800 text-amber-300 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Mẫu sẵn có ({DOSSIER_CANVAS_PRESETS.length})
            </button>
            <button
              type="button"
              onClick={() => setThemeActiveTab("custom")}
              className={cn(
                "py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer",
                themeActiveTab === "custom"
                  ? "bg-zinc-800 text-amber-300 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Tùy biến tự do
            </button>
          </div>

          {/* TAB 1: PRESETS (Chuyển đổi & So sánh nhanh) */}
          {themeActiveTab === "presets" && (
            <div className="flex flex-col gap-1.5 max-h-[310px] overflow-y-auto pr-1 scrollbar-thin">
              <div className="text-[11px] text-zinc-400 px-0.5 flex items-center justify-between">
                <span>Nhấp để đổi ngay & so sánh màu:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {DOSSIER_CANVAS_PRESETS.map((preset) => {
                  const isActive = canvasTheme.id === preset.id && !canvasTheme.isCustom;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyTheme(preset)}
                      className={cn(
                        "group relative flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer border text-xs",
                        isActive
                          ? "bg-zinc-800/95 border-amber-500/80 shadow-[0_0_12px_rgba(245,195,68,0.25)] ring-1 ring-amber-500/50"
                          : "bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700"
                      )}
                    >
                      {/* Mini spotlight swatch */}
                      <div
                        className="size-7 rounded-lg shrink-0 shadow-inner border border-white/20 relative overflow-hidden flex items-center justify-center"
                        style={{ background: preset.swatchGradient }}
                      >
                        {isActive && (
                          <Check className="size-3.5 text-amber-300 stroke-[3] drop-shadow" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={cn(
                            "font-medium truncate leading-tight",
                            isActive
                              ? "text-amber-300 font-bold"
                              : "text-zinc-200 group-hover:text-white"
                          )}
                        >
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {preset.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TÙY BIẾN TỰ DO (Custom Color Picker & Spotlight) */}
          {themeActiveTab === "custom" && (
            <div className="flex flex-col gap-3 text-xs">
              {/* 1. Chọn màu nền mặt bàn */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-zinc-400">1. Màu nền bàn (Base Color)</span>
                  <span className="font-mono text-[11px] text-amber-400 uppercase font-semibold">
                    {customBaseColor}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-amber-500/60 cursor-pointer transition-colors shrink-0">
                    <div
                      className="size-5 rounded-md border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: customBaseColor }}
                    />
                    <span className="font-mono text-[11px] text-zinc-200 font-medium">Bảng màu...</span>
                    <input
                      type="color"
                      value={customBaseColor}
                      onChange={(e) =>
                        handleUpdateCustomTheme(
                          e.target.value,
                          customLampTone,
                          customLampIntensity,
                          customGridType
                        )
                      }
                      className="opacity-0 absolute inset-0 size-full cursor-pointer"
                    />
                  </label>

                  {/* Quick color dots */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none flex-1">
                    {QUICK_CUSTOM_COLORS.map((qc) => (
                      <button
                        key={qc.color}
                        type="button"
                        onClick={() =>
                          handleUpdateCustomTheme(
                            qc.color,
                            customLampTone,
                            customLampIntensity,
                            customGridType
                          )
                        }
                        style={{ backgroundColor: qc.color }}
                        className={cn(
                          "size-6 rounded-md border transition-transform cursor-pointer shrink-0 shadow-sm",
                          customBaseColor.toLowerCase() === qc.color.toLowerCase()
                            ? "border-amber-400 scale-115 ring-2 ring-amber-400/40"
                            : "border-zinc-700 hover:scale-110"
                        )}
                        title={qc.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Ánh đèn bàn rọi (Spotlight Lamp) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-zinc-400">2. Ánh đèn rọi tâm bàn (Spotlight)</span>
                  <span className="font-mono text-[11px] text-zinc-300">
                    {customLampTone === "warm"
                      ? "Vàng ấm"
                      : customLampTone === "cool"
                        ? "Trắng dịu"
                        : customLampTone === "cyan"
                          ? "Xanh pháp y"
                          : "Không đèn"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(
                    [
                      { id: "warm", label: "Vàng ấm" },
                      { id: "cool", label: "Trắng dịu" },
                      { id: "cyan", label: "Xanh pháp y" },
                      { id: "none", label: "Tắt đèn" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        handleUpdateCustomTheme(
                          customBaseColor,
                          t.id,
                          customLampIntensity,
                          customGridType
                        )
                      }
                      className={cn(
                        "py-1 px-1.5 rounded-lg font-mono text-[11px] transition-all cursor-pointer border text-center truncate",
                        customLampTone === t.id
                          ? "bg-zinc-800 border-amber-500/80 text-amber-300 font-semibold"
                          : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {customLampTone !== "none" && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">Độ sáng:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={customLampIntensity}
                      onChange={(e) =>
                        handleUpdateCustomTheme(
                          customBaseColor,
                          customLampTone,
                          parseFloat(e.target.value),
                          customGridType
                        )
                      }
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                    />
                    <span className="text-[10px] font-mono text-zinc-300 w-8 text-right">
                      {Math.round(customLampIntensity * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* 3. Kiểu lưới định vị (Grid Style) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-zinc-400">3. Kiểu lưới định vị (Grid)</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(
                    [
                      { id: "crosses", label: "Dấu thập (+)" },
                      { id: "dots", label: "Điểm chấm (•)" },
                      { id: "grid", label: "Kẻ ô (#)" },
                      { id: "none", label: "Ẩn lưới" },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() =>
                        handleUpdateCustomTheme(
                          customBaseColor,
                          customLampTone,
                          customLampIntensity,
                          g.id
                        )
                      }
                      className={cn(
                        "py-1 px-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer border text-center truncate",
                        customGridType === g.id
                          ? "bg-zinc-800 border-amber-500/80 text-amber-300 font-semibold"
                          : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
  );
}
