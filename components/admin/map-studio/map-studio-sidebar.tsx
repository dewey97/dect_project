"use client";

import React from "react";
import {
  Layers,
  Sliders,
  Milestone,
  Waves,
  LandPlot,
  MapPin,
  TrainTrack,
  Type,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  MousePointer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AnyMapFeature,
  MapVectorData,
  WaterFeature,
  ZoneFeature,
  BuildingFeature,
  RoadFeature,
  RailwayFeature,
  LabelFeature,
  PoiFeature,
  PoiCategory,
} from "@/types/map-vector";
import { POI_CATEGORY_CONFIG } from "./map-features";

export type FeatureType =
  "water" | "zone" | "building" | "road" | "railway" | "label" | "poi" | string;

export type FeatureLayerItem =
  | { type: "water"; item: WaterFeature }
  | { type: "zone"; item: ZoneFeature }
  | { type: "building"; item: BuildingFeature }
  | { type: "road"; item: RoadFeature }
  | { type: "railway"; item: RailwayFeature }
  | { type: "label"; item: LabelFeature }
  | { type: "poi"; item: PoiFeature };

export interface MapStudioSidebarProps {
  allFeaturesSorted: FeatureLayerItem[];
  filteredLayers: FeatureLayerItem[];
  selectedFeatureId: string | null;
  selectedFeature: AnyMapFeature | null;
  hiddenFeatureIds: Record<string, boolean>;
  editingLayerId: string | null;
  editingLayerName: string;
  filterLayer:
    "all" | "water" | "roads" | "railways" | "zones" | "pois" | "labels";
  layerSearchText: string;
  setFilterLayer: (
    filter:
      "all" | "water" | "roads" | "railways" | "zones" | "pois" | "labels",
  ) => void;
  setLayerSearchText: (text: string) => void;
  setSelectedFeatureId: (id: string | null) => void;
  setHiddenFeatureIds: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  setEditingLayerId: (id: string | null) => void;
  setEditingLayerName: (name: string) => void;
  handleRenameFeature: (id: string, name: string) => void;
  handleDeleteSelected: () => void;
  handleReorder: (direction: "up" | "down") => void;
  setMapData: React.Dispatch<React.SetStateAction<MapVectorData>>;
}

export const MapStudioSidebar = React.memo(function MapStudioSidebarComponent({
  allFeaturesSorted,
  filteredLayers,
  selectedFeatureId,
  selectedFeature,
  hiddenFeatureIds,
  editingLayerId,
  editingLayerName,
  filterLayer,
  layerSearchText,
  setFilterLayer,
  setLayerSearchText,
  setSelectedFeatureId,
  setHiddenFeatureIds,
  setEditingLayerId,
  setEditingLayerName,
  handleRenameFeature,
  handleDeleteSelected,
  handleReorder,
  setMapData,
}: MapStudioSidebarProps) {
  return (
    <aside className="w-80 bg-zinc-950 border-l border-white/10 flex flex-col shrink-0 z-20 shadow-xl overflow-hidden">
      {/* TOP SECTION: LAYERS TREE */}
      <div className="flex-1 min-h-[220px] flex flex-col p-3 space-y-2.5 overflow-hidden">
        {/* Header: Title */}
        <div className="flex items-center gap-2 pb-2 border-b border-white/10 shrink-0">
          <Layers className="size-4 text-blue-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Layers
          </span>
        </div>

        {/* Filter Pills */}
        <div className="space-y-2 shrink-0">
          <div className="flex flex-wrap gap-1.5 pb-0.5">
            {[
              { id: "all" as const, label: "Tất cả", icon: null, color: "" },
              {
                id: "roads" as const,
                label: "Đường",
                icon: Milestone,
                color: "text-amber-400",
              },
              {
                id: "water" as const,
                label: "Sông hồ",
                icon: Waves,
                color: "text-sky-400",
              },
              {
                id: "zones" as const,
                label: "Phân khu",
                icon: LandPlot,
                color: "text-emerald-400",
              },
              {
                id: "pois" as const,
                label: "POI",
                icon: MapPin,
                color: "text-red-400",
              },
              {
                id: "railways" as const,
                label: "Đường sắt",
                icon: TrainTrack,
                color: "text-zinc-400",
              },
              {
                id: "labels" as const,
                label: "Nhãn",
                icon: Type,
                color: "text-violet-400",
              },
            ].map((pill) => {
              const Icon = pill.icon;
              const isActive = filterLayer === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setFilterLayer(pill.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer border",
                    isActive
                      ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                      : "bg-zinc-900/90 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-zinc-200",
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "size-3.5",
                        isActive ? "text-white" : pill.color,
                      )}
                    />
                  )}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm lớp..."
              value={layerSearchText}
              onChange={(e) => setLayerSearchText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
            {layerSearchText && (
              <button
                onClick={() => setLayerSearchText("")}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Layers List */}
        <div className="flex-1 min-h-0 rounded-lg border border-white/5 bg-zinc-950/60 divide-y divide-white/5 overflow-y-auto text-xs">
          {filteredLayers.length === 0 ? (
            <div className="py-8 text-center text-zinc-600 text-[11px]">
              Không tìm thấy layer phù hợp
            </div>
          ) : (
            filteredLayers.map(({ type, item }, idx) => {
              const isSelected = selectedFeatureId === item.id;
              const isHidden = hiddenFeatureIds[item.id];

              const CategoryIcon =
                type === "water"
                  ? Waves
                  : type === "road"
                    ? Milestone
                    : type === "railway"
                      ? TrainTrack
                      : type === "zone"
                        ? LandPlot
                        : type === "poi"
                          ? MapPin
                          : Type;

              const iconColorClass =
                type === "water"
                  ? "text-sky-400"
                  : type === "road"
                    ? "text-amber-400"
                    : type === "railway"
                      ? "text-zinc-400"
                      : type === "zone"
                        ? "text-emerald-400"
                        : type === "poi"
                          ? "text-red-400"
                          : "text-violet-400";

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeatureId(item.id)}
                  className={cn(
                    "group flex items-center justify-between px-2.5 py-1.5 transition-colors cursor-pointer text-xs select-none",
                    isSelected
                      ? "bg-blue-600/20 text-white font-medium border-l-2 border-blue-500 pl-2"
                      : "text-zinc-300 hover:bg-white/[0.04] hover:text-white",
                    isHidden && "opacity-40",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1 flex-1">
                    <CategoryIcon
                      className={cn("size-3.5 shrink-0", iconColorClass)}
                    />
                    {editingLayerId === item.id ? (
                      <input
                        type="text"
                        value={editingLayerName}
                        onChange={(e) => setEditingLayerName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleRenameFeature(item.id, editingLayerName);
                            setEditingLayerId(null);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setEditingLayerId(null);
                          }
                        }}
                        onBlur={() => {
                          handleRenameFeature(item.id, editingLayerName);
                          setEditingLayerId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-900 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white outline-none w-full font-sans tracking-tight"
                      />
                    ) : (
                      <span
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingLayerId(item.id);
                          const currentName =
                            ("name" in item && item.name) ||
                            ("text" in item && item.text) ||
                            item.id ||
                            "";
                          setEditingLayerName(currentName);
                        }}
                        className="truncate font-sans tracking-tight cursor-text"
                        title="Nhấp đúp chuột để đổi tên nhanh"
                      >
                        {("name" in item && item.name) ||
                          ("text" in item && item.text) ||
                          item.id}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHiddenFeatureIds((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }));
                      }}
                      className={cn(
                        "p-1 rounded hover:bg-white/10 transition-colors cursor-pointer",
                        isHidden
                          ? "text-amber-400 opacity-100"
                          : "text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-zinc-200",
                      )}
                      title={isHidden ? "Hiện layer" : "Ẩn layer"}
                    >
                      {isHidden ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: INSPECTOR PANEL */}
      <div className="border-t border-white/10 bg-zinc-950 flex flex-col shrink-0 h-[44%] min-h-[220px] max-h-[50%] overflow-hidden">
        {/* Inspector Panel Header */}
        <div className="px-3.5 py-2 bg-zinc-900/70 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="size-3.5 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Inspector
            </span>
            {selectedFeature && (
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {selectedFeature.id.split("-")[0]}
              </span>
            )}
          </div>
          {selectedFeature && (
            <button
              onClick={() => setSelectedFeatureId(null)}
              className="text-zinc-400 hover:text-white text-[11px] px-2 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Bỏ chọn (Đóng inspector)"
            >
              Đóng
            </button>
          )}
        </div>

        {/* Inspector Panel Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
          {selectedFeature ? (
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-mono text-zinc-400 text-[10px] truncate max-w-[180px]">
                  ID: {selectedFeature.id}
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="px-2 py-1 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 rounded flex items-center gap-1 cursor-pointer transition-colors"
                  title="Xóa đối tượng này (Delete)"
                >
                  <Trash2 className="size-3" />
                  <span>Xóa</span>
                </button>
              </div>

              {/* Name field */}
              {"name" in selectedFeature && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">
                    Tên hiển thị:
                  </label>
                  <input
                    type="text"
                    value={selectedFeature.name || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMapData((prev) => ({
                        ...prev,
                        water: prev.water.map((w) =>
                          w.id === selectedFeature.id ? { ...w, name: val } : w,
                        ),
                        zones: prev.zones.map((z) =>
                          z.id === selectedFeature.id ? { ...z, name: val } : z,
                        ),
                        roads: prev.roads.map((r) =>
                          r.id === selectedFeature.id ? { ...r, name: val } : r,
                        ),
                        railways: prev.railways.map((rw) =>
                          rw.id === selectedFeature.id
                            ? { ...rw, name: val }
                            : rw,
                        ),
                        pois: prev.pois.map((p) =>
                          p.id === selectedFeature.id ? { ...p, name: val } : p,
                        ),
                      }));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Label Text field */}
              {"text" in selectedFeature && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">
                    Nội dung chữ:
                  </label>
                  <input
                    type="text"
                    value={selectedFeature.text || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMapData((prev) => ({
                        ...prev,
                        labels: prev.labels.map((l) =>
                          l.id === selectedFeature.id ? { ...l, text: val } : l,
                        ),
                      }));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* POI Specific Fields */}
              {"category" in selectedFeature && "phone" in selectedFeature && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">
                      Phân loại:
                    </label>
                    <select
                      value={(selectedFeature as PoiFeature).category}
                      onChange={(e) => {
                        const cat = e.target.value as PoiCategory;
                        setMapData((prev) => ({
                          ...prev,
                          pois: prev.pois.map((p) =>
                            p.id === selectedFeature.id
                              ? { ...p, category: cat }
                              : p,
                          ),
                        }));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none"
                    >
                      {Object.entries(POI_CATEGORY_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">
                      Số điện thoại liên hệ:
                    </label>
                    <input
                      type="text"
                      value={(selectedFeature as PoiFeature).phone || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMapData((prev) => ({
                          ...prev,
                          pois: prev.pois.map((p) =>
                            p.id === selectedFeature.id
                              ? { ...p, phone: val }
                              : p,
                          ),
                        }));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">
                      Địa chỉ:
                    </label>
                    <input
                      type="text"
                      value={(selectedFeature as PoiFeature).address || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMapData((prev) => ({
                          ...prev,
                          pois: prev.pois.map((p) =>
                            p.id === selectedFeature.id
                              ? { ...p, address: val }
                              : p,
                          ),
                        }));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">
                      Ghi chú điều tra / Manh mối:
                    </label>
                    <textarea
                      rows={3}
                      value={(selectedFeature as PoiFeature).clueNotes || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMapData((prev) => ({
                          ...prev,
                          pois: prev.pois.map((p) =>
                            p.id === selectedFeature.id
                              ? { ...p, clueNotes: val }
                              : p,
                          ),
                        }));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Width slider (for rivers & roads) */}
              {"width" in selectedFeature && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Độ rộng nét:</span>
                    <span className="font-mono">{selectedFeature.width}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="200"
                    value={selectedFeature.width || 10}
                    onChange={(e) => {
                      const w = Number(e.target.value);
                      setMapData((prev) => ({
                        ...prev,
                        water: prev.water.map((item) =>
                          item.id === selectedFeature.id
                            ? { ...item, width: w }
                            : item,
                        ),
                        roads: prev.roads.map((item) =>
                          item.id === selectedFeature.id
                            ? { ...item, width: w }
                            : item,
                        ),
                      }));
                    }}
                    className="w-full accent-blue-500"
                  />
                </div>
              )}

              {/* Curve Smoothing Toggle */}
              {"smooth" in selectedFeature && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">Uốn lượn mềm mại:</span>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedFeature.smooth)}
                    onChange={(e) => {
                      const sm = e.target.checked;
                      setMapData((prev) => ({
                        ...prev,
                        water: prev.water.map((item) =>
                          item.id === selectedFeature.id
                            ? { ...item, smooth: sm }
                            : item,
                        ),
                        roads: prev.roads.map((item) =>
                          item.id === selectedFeature.id
                            ? { ...item, smooth: sm }
                            : item,
                        ),
                        railways: prev.railways.map((item) =>
                          item.id === selectedFeature.id
                            ? { ...item, smooth: sm }
                            : item,
                        ),
                      }));
                    }}
                    className="size-4 rounded accent-blue-600"
                  />
                </div>
              )}

              {/* Bridge Toggle */}
              {"isBridge" in selectedFeature && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">
                    Là cầu vượt sông (có bóng):
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean((selectedFeature as RoadFeature).isBridge)}
                    onChange={(e) => {
                      const br = e.target.checked;
                      setMapData((prev) => ({
                        ...prev,
                        roads: prev.roads.map((item) =>
                          item.id === selectedFeature.id
                            ? { ...item, isBridge: br, zIndex: br ? 16 : 10 }
                            : item,
                        ),
                      }));
                    }}
                    className="size-4 rounded accent-blue-600"
                  />
                </div>
              )}

              {/* Layer Z-Order Controls */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-semibold block">
                  Thứ tự đè lớp (Z-Order):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleReorder("up")}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 flex items-center justify-center gap-1 font-semibold cursor-pointer transition-colors"
                  >
                    <ArrowUp className="size-3.5" />
                    <span>Nổi lên trên</span>
                  </button>
                  <button
                    onClick={() => handleReorder("down")}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 flex items-center justify-center gap-1 font-semibold cursor-pointer transition-colors"
                  >
                    <ArrowDown className="size-3.5" />
                    <span>Chìm xuống dưới</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* NO SELECTION EMPTY STATE */
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 gap-1.5 py-6">
              <MousePointer className="size-6 stroke-1 text-slate-600" />
              <p className="text-xs font-medium text-slate-400">
                Chưa chọn đối tượng nào
              </p>
              <p className="text-[11px] text-slate-600 max-w-[200px]">
                Nhấp vào một layer ở trên hoặc click trên bản đồ để sửa thuộc
                tính
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});
