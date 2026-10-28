"use client";

import React from "react";
import {
  Undo2,
  Redo2,
  Wrench,
  Eye,
  RefreshCw,
  Check,
  AlertCircle,
  Save,
  MousePointer,
  Waves,
  Milestone,
  TrainTrack,
  LandPlot,
  MapPin,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  MapStudioTool,
  WaterType,
  RoadType,
  ZoneCategory,
  PoiCategory,
  Point,
  MapVectorData,
} from "@/lib/types/map-vector";
import { POI_CATEGORY_CONFIG } from "./map-features";

// =============================================================================
// 1. TOOL BUTTON (Sleek Cloud Island Style)
// =============================================================================
export function ToolButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "size-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group",
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
          : "text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95",
      )}
    >
      {icon}
      {/* Tooltip on right */}
      <span className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 border border-white/10 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
        {label}
      </span>
    </button>
  );
}

// =============================================================================
// 2. MAP STUDIO TOP HEADER TOOLBAR
// =============================================================================
export interface MapStudioHeaderProps {
  handleUndo: () => void;
  handleRedo: () => void;
  historyIndex: number;
  historyLength: number;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  viewMode: "admin" | "player";
  setViewMode: (val: "admin" | "player") => void;
  showPhoneOverlay: boolean;
  setShowPhoneOverlay: (val: boolean) => void;
  drawingPoints: Point[];
  finishDrawing: () => void;
  setDrawingPoints: (pts: Point[]) => void;
  draftRecoveryAvailable: { timestamp: number; data: MapVectorData } | null;
  handleRestoreDraft: () => void;
  handleDismissDraft: () => void;
  draftStatus: "idle" | "saving" | "saved";
  handleSave: () => void;
  isSaving: boolean;
  saveStatus: "idle" | "success" | "error";
  setSelectedFeatureId: (id: string | null) => void;
  setSelectedVertexIndex: (idx: number | null) => void;
}

export const MapStudioHeader = React.memo(function MapStudioHeaderComponent({
  handleUndo,
  handleRedo,
  historyIndex,
  historyLength,
  showGrid,
  setShowGrid,
  viewMode,
  setViewMode,
  showPhoneOverlay,
  setShowPhoneOverlay,
  drawingPoints,
  finishDrawing,
  setDrawingPoints,
  draftRecoveryAvailable,
  handleRestoreDraft,
  handleDismissDraft,
  draftStatus,
  handleSave,
  isSaving,
  saveStatus,
  setSelectedFeatureId,
  setSelectedVertexIndex,
}: MapStudioHeaderProps) {
  return (
    <header className="h-14 bg-zinc-950/90 border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-30 shadow-md backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-sm font-bold tracking-wider uppercase text-white font-mono flex items-center gap-2">
            <span>MAP STUDIO</span>
          </h1>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= historyLength - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 className="size-4" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* Grid Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border",
              showGrid
                ? "bg-slate-800 text-slate-200 border-slate-700"
                : "text-slate-500 border-slate-800 hover:bg-slate-800",
            )}
          >
            <span>{showGrid ? "Ẩn lưới" : "Hiện lưới"}</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* View Mode Toggle: Admin Edit vs Player Clean Preview */}
        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700/80 p-0.5 shadow-inner">
          <button
            onClick={() => setViewMode("admin")}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
              viewMode === "admin"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200",
            )}
            title="Chế độ Admin: Hiển thị đầy đủ mốc án, số thứ tự, ghim POI và công cụ biên tập"
          >
            <Wrench className="size-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => {
              setViewMode("player");
              setSelectedFeatureId(null);
              setSelectedVertexIndex(null);
            }}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
              viewMode === "player"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200",
            )}
            title="Chế độ Người chơi: Xem bản đồ dân sự sạch sẽ như trong game, ẩn toàn bộ số mốc và ghim án"
          >
            <Eye className="size-3.5" />
            <span>User</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        <button
          onClick={() => setShowPhoneOverlay(!showPhoneOverlay)}
          className={cn(
            "px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border",
            showPhoneOverlay
              ? "bg-sky-600/30 text-sky-400 border-sky-500/50"
              : "text-slate-400 border-slate-800 hover:bg-slate-800",
          )}
          title="Bật/Tắt khung mô phỏng màn hình iPhone trong Game"
        >
          <span>📱 Khung iPhone</span>
        </button>
      </div>

      {/* Center: Quick Action Status or In-drawing alert */}
      <div className="flex items-center gap-2">
        {drawingPoints.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-600/60 rounded-full text-amber-300 text-xs font-medium animate-pulse">
            <span>
              Đang vẽ ({drawingPoints.length} điểm) — Bấm đúp hoặc Enter để chốt
            </span>
            <button
              onClick={finishDrawing}
              className="ml-1 px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px]"
            >
              Hoàn tất
            </button>
            <button
              onClick={() => setDrawingPoints([])}
              className="px-1 text-amber-400 hover:text-white"
              title="Hủy vẽ"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Right actions: Draft status, Recovery button, and Save */}
      <div className="flex items-center gap-2">
        {/* Draft recovery pill */}
        {draftRecoveryAvailable && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 text-xs animate-pulse">
            <span className="font-medium">Tìm thấy bản nháp chưa lưu!</span>
            <button
              onClick={handleRestoreDraft}
              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px] transition-colors"
            >
              Khôi phục
            </button>
            <button
              onClick={handleDismissDraft}
              className="text-amber-400/70 hover:text-white px-1 text-xs"
              title="Bỏ qua bản nháp này"
            >
              ✕
            </button>
          </div>
        )}

        {/* Auto-save status badge */}
        {draftStatus !== "idle" && !draftRecoveryAvailable && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] text-zinc-400 font-mono">
            {draftStatus === "saving" ? (
              <>
                <RefreshCw className="size-2.5 animate-spin text-zinc-500" />
                <span className="text-zinc-500">Đang lưu nháp...</span>
              </>
            ) : (
              <>
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-400">Đã lưu nháp ngầm</span>
              </>
            )}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95",
            saveStatus === "success"
              ? "bg-emerald-600 text-white"
              : saveStatus === "error"
                ? "bg-red-600 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white",
          )}
        >
          {isSaving ? (
            <>
              <RefreshCw className="size-3.5 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : saveStatus === "success" ? (
            <>
              <Check className="size-3.5" />
              <span>Đã lưu thành công!</span>
            </>
          ) : saveStatus === "error" ? (
            <>
              <AlertCircle className="size-3.5" />
              <span>Lỗi khi lưu!</span>
            </>
          ) : (
            <>
              <Save className="size-3.5" />
              <span>LƯU</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
});

// =============================================================================
// 3. MAP STUDIO TOOLS PALETTE (Left Floating Island + Active Options Strip)
// =============================================================================
export interface MapStudioToolsPaletteProps {
  activeTool: MapStudioTool;
  setActiveTool: (tool: MapStudioTool) => void;
  setDrawingPoints: (pts: Point[]) => void;
  waterType: WaterType;
  setWaterType: (type: WaterType) => void;
  roadType: RoadType;
  setRoadType: (type: RoadType) => void;
  zoneCategory: ZoneCategory;
  setZoneCategory: (cat: ZoneCategory) => void;
  poiCategory: PoiCategory;
  setPoiCategory: (cat: PoiCategory) => void;
  coordRef: React.RefObject<HTMLSpanElement | null>;
}

export const MapStudioToolsPalette = React.memo(
  function MapStudioToolsPaletteComponent({
    activeTool,
    setActiveTool,
    setDrawingPoints,
    waterType,
    setWaterType,
    roadType,
    setRoadType,
    zoneCategory,
    setZoneCategory,
    poiCategory,
    setPoiCategory,
    coordRef,
  }: MapStudioToolsPaletteProps) {
    return (
      <>
        {/* FLOATING TOOLS PALETTE (Cloud Island Style) */}
        <div className="absolute top-4 left-4 z-20 flex flex-col items-center p-1.5 gap-1.5 rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80 ring-1 ring-white/5">
          <ToolButton
            active={activeTool === "select"}
            onClick={() => setActiveTool("select")}
            icon={<MousePointer className="size-4" />}
            label="Chọn / Sửa đỉnh (V)"
          />

          <div className="w-6 h-px bg-white/10 my-0.5" />

          <ToolButton
            active={activeTool === "water"}
            onClick={() => {
              setActiveTool("water");
              setDrawingPoints([]);
            }}
            icon={<Waves className="size-4" />}
            label="Vẽ Hồ & Sông (W)"
          />
          <ToolButton
            active={activeTool === "road"}
            onClick={() => {
              setActiveTool("road");
              setDrawingPoints([]);
            }}
            icon={<Milestone className="size-4" />}
            label="Vẽ Tuyến Đường (R)"
          />
          <ToolButton
            active={activeTool === "railway"}
            onClick={() => {
              setActiveTool("railway");
              setDrawingPoints([]);
            }}
            icon={<TrainTrack className="size-4" />}
            label="Vẽ Đường Sắt (T)"
          />
          <ToolButton
            active={activeTool === "zone"}
            onClick={() => {
              setActiveTool("zone");
              setDrawingPoints([]);
            }}
            icon={<LandPlot className="size-4" />}
            label="Vẽ Phân Khu (Z)"
          />

          <div className="w-6 h-px bg-white/10 my-0.5" />

          <ToolButton
            active={activeTool === "poi"}
            onClick={() => setActiveTool("poi")}
            icon={<MapPin className="size-4" />}
            label="Cắm Địa Danh / Hotspot (P)"
          />
          <ToolButton
            active={activeTool === "label"}
            onClick={() => setActiveTool("label")}
            icon={<Type className="size-4" />}
            label="Đặt Nhãn Chữ (L)"
          />
        </div>

        {/* ACTIVE TOOL OPTIONS STRIP (Top floating pill) */}
        <div className="absolute top-4 left-20 z-10 bg-zinc-950/80 backdrop-blur-xl border border-white/10 px-3.5 py-1.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs ring-1 ring-white/5">
          {activeTool === "water" && (
            <div className="flex items-center gap-2">
              <span className="text-sky-400 font-semibold">Sông / Hồ:</span>
              <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  onClick={() => setWaterType("river")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    waterType === "river"
                      ? "bg-sky-600 text-white"
                      : "text-slate-400",
                  )}
                >
                  Sông lớn (Đường)
                </button>
                <button
                  onClick={() => setWaterType("lake")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    waterType === "lake"
                      ? "bg-sky-600 text-white"
                      : "text-slate-400",
                  )}
                >
                  Hồ nước (Đa giác)
                </button>
                <button
                  onClick={() => setWaterType("stream")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    waterType === "stream"
                      ? "bg-sky-600 text-white"
                      : "text-slate-400",
                  )}
                >
                  Con suối (Nét nhỏ)
                </button>
              </div>
            </div>
          )}

          {activeTool === "road" && (
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold">Loại đường:</span>
              <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  onClick={() => setRoadType("highway")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    roadType === "highway"
                      ? "bg-amber-600 text-white"
                      : "text-slate-400",
                  )}
                >
                  Đại lộ lớn
                </button>
                <button
                  onClick={() => setRoadType("avenue")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    roadType === "avenue"
                      ? "bg-amber-600 text-white"
                      : "text-slate-400",
                  )}
                >
                  Đường phố
                </button>
                <button
                  onClick={() => setRoadType("alley")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    roadType === "alley"
                      ? "bg-amber-600 text-white"
                      : "text-slate-400",
                  )}
                >
                  Ngõ hẻm
                </button>
                <button
                  onClick={() => setRoadType("bridge")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    roadType === "bridge"
                      ? "bg-amber-600 text-white"
                      : "text-slate-400",
                  )}
                >
                  Cầu vượt sông
                </button>
              </div>
            </div>
          )}

          {activeTool === "zone" && (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">Phân khu:</span>
              <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  onClick={() => setZoneCategory("port")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    zoneCategory === "port"
                      ? "bg-slate-600 text-white"
                      : "text-slate-400",
                  )}
                >
                  Cảng biển
                </button>
                <button
                  onClick={() => setZoneCategory("park")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    zoneCategory === "park"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400",
                  )}
                >
                  Công viên
                </button>
                <button
                  onClick={() => setZoneCategory("industrial")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    zoneCategory === "industrial"
                      ? "bg-slate-600 text-white"
                      : "text-slate-400",
                  )}
                >
                  Khu công nghiệp
                </button>
                <button
                  onClick={() => setZoneCategory("residential")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                    zoneCategory === "residential"
                      ? "bg-amber-700 text-white"
                      : "text-slate-400",
                  )}
                >
                  Khu dân cư
                </button>
              </div>
            </div>
          )}

          {activeTool === "poi" && (
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-semibold">Loại địa danh:</span>
              <select
                value={poiCategory}
                onChange={(e) => setPoiCategory(e.target.value as PoiCategory)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 outline-none cursor-pointer"
              >
                {Object.entries(POI_CATEGORY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Coordinate Readout */}
          <div className="ml-auto flex items-center">
            <span
              ref={coordRef}
              className="font-mono text-[11px] text-slate-400"
            >
              X: 0 Y: 0
            </span>
          </div>
        </div>
      </>
    );
  },
);
