"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  MapPin,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  Camera,
  Layers,
  HelpCircle,
  ExternalLink,
  Volume2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import type {
  DbCase,
  DbCaseEvidence,
  DbCaseWithEvidenceConfig,
} from "@/lib/types/database";
import type { ReinvestigationHotspot2D } from "@/components/investigation/evidence/reinvestigation-modal";
import { Scene360Viewer } from "@/components/investigation/scene-360-viewer";
import { Scene360ConfigModal } from "./scene-360-config-modal";
import { cn } from "@/lib/utils";

interface CrimeSceneEditorProps {
  caseId: string;
  evidenceList: DbCaseEvidence[];
  config360: DbCaseWithEvidenceConfig | null;
  onConfig360Updated?: (updated: DbCaseWithEvidenceConfig) => void;
  onSavingChange?: (saving: boolean) => void;
}

export function CrimeSceneEditor({
  caseId,
  evidenceList,
  config360,
  onConfig360Updated,
  onSavingChange,
}: CrimeSceneEditorProps) {
  const [sceneMode, setSceneMode] = useState<"2d" | "360">("2d");
  const [hotspots, setHotspots] = useState<ReinvestigationHotspot2D[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);

  useEffect(() => {
    onSavingChange?.(isLoading || isSaving);
  }, [isLoading, isSaving, onSavingChange]);

  // Background 2D image
  const backgroundUrl =
    (config360 as any)?.reinvestigation_bg_url ||
    config360?.panorama_url ||
    `/images/cases/${caseId}/scene_reinvestigate.jpg`;

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Fetch hotspots from DB
  const loadHotspots = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/reinvestigation?case=${encodeURIComponent(caseId)}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.hotspots)) {
          setHotspots(data.hotspots);
          if (data.hotspots.length > 0) {
            setSelectedSpotId(data.hotspots[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load reinvestigation hotspots:", err);
      toast.error("Không tải được danh sách điểm khám xét");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHotspots();
  }, [caseId]);

  const selectedSpot = hotspots.find((h) => h.id === selectedSpotId);

  // Click on 2D image to reposition selected spot or create new spot
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.round((clickX / rect.width) * 1000) / 10;
    const yPercent = Math.round((clickY / rect.height) * 1000) / 10;

    if (selectedSpotId) {
      // Reposition selected spot
      setHotspots((prev) =>
        prev.map((h) =>
          h.id === selectedSpotId ? { ...h, x: xPercent, y: yPercent } : h,
        ),
      );
      toast.info(`Đã đổi vị trí điểm #${selectedSpot?.num}: ${xPercent}%, ${yPercent}%`);
    } else {
      // Add new spot at click
      handleAddSpot(xPercent, yPercent);
    }
  };

  const handleAddSpot = (x = 50, y = 50) => {
    const nextNum =
      hotspots.length > 0 ? Math.max(...hotspots.map((h) => h.num || 0)) + 1 : 1;
    const newSpot: ReinvestigationHotspot2D = {
      id: `spot_${Date.now()}`,
      num: nextNum,
      title: `Vật chứng #${nextNum}`,
      x,
      y,
      imageUrl: "",
      soundFile: "sat_soat.mp3",
      soundCaption: "Tiếng lục soát hiện trường",
    };
    setHotspots((prev) => [...prev, newSpot]);
    setSelectedSpotId(newSpot.id);
  };

  const handleDeleteSpot = (id: string) => {
    setHotspots((prev) => prev.filter((h) => h.id !== id));
    if (selectedSpotId === id) {
      setSelectedSpotId(null);
    }
    toast.info("Đã xóa điểm");
  };

  const handleSaveHotspots = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/reinvestigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, hotspots }),
      });
      if (res.ok) {
        toast.success(`Đã lưu ${hotspots.length} điểm khám xét lên Server!`);
      } else {
        const data = await res.json();
        toast.error("Lỗi khi lưu: " + (data.error || "Server error"));
      }
    } catch (err: unknown) {
      toast.error("Lỗi mạng khi lưu điểm khám xét");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSelectedSpot = (patch: Partial<ReinvestigationHotspot2D>) => {
    if (!selectedSpotId) return;
    setHotspots((prev) =>
      prev.map((h) => (h.id === selectedSpotId ? { ...h, ...patch } : h)),
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0e1013] text-zinc-200">
      {/* Subheader Toolbar */}
      <div className="px-4 py-2.5 border-b border-white/10 bg-[#14161a] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-400">
            <Compass className="size-4" />
            <span>Khám xét Hiện trường ({caseId})</span>
          </div>

          {/* Mode Switch: 2D vs 360 */}
          <div className="flex bg-black/60 p-0.5 rounded border border-white/10">
            <button
              type="button"
              onClick={() => setSceneMode("2d")}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold transition-all",
                sceneMode === "2d"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-neutral-400 hover:text-white",
              )}
            >
              Hiện trường 2D ({hotspots.length} điểm)
            </button>
            <button
              type="button"
              onClick={() => setSceneMode("360")}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold transition-all",
                sceneMode === "360"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-neutral-400 hover:text-white",
              )}
            >
              Không gian 360 / Panorama
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {sceneMode === "2d" ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddSpot()}
                className="h-7 text-xs border-white/20 bg-white/5 hover:bg-white/10 gap-1"
              >
                <Plus className="size-3.5" />
                <span>Thêm Điểm</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveHotspots}
                disabled={isSaving}
                className="h-7 text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold gap-1 shadow-sm"
              >
                <Save className="size-3.5" />
                <span>{isSaving ? "Đang lưu..." : "Lưu Điểm (DB)"}</span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => setIs360ModalOpen(true)}
              className="h-7 text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold gap-1 shadow-sm"
            >
              <Camera className="size-3.5" />
              <span>Cấu hình Link 360 / Panorama</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {sceneMode === "2d" ? (
        <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
          {/* CỘT TRÁI: 2D SCENE CANVAS INTERACTIVE */}
          <div className="col-span-12 lg:col-span-8 flex flex-col p-4 bg-[#0a0c0e] overflow-auto">
            <div className="text-xs text-neutral-400 mb-2 flex items-center justify-between">
              <span>
                💡 <b>Mẹo:</b> Chọn một điểm ở cột phải rồi click lên ảnh để đặt lại vị trí (X%, Y%).
              </span>
              <span className="font-mono text-[11px] text-amber-500">
                {selectedSpot
                  ? `Đang chọn: Điểm #${selectedSpot.num} (${selectedSpot.x}%, ${selectedSpot.y}%)`
                  : "Chưa chọn điểm nào"}
              </span>
            </div>

            <div
              ref={imageContainerRef}
              onClick={handleImageClick}
              className="relative max-w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black cursor-crosshair select-none group"
            >
              <img
                src={backgroundUrl}
                alt="2D Crime Scene Background"
                className="w-full h-auto object-contain max-h-[70vh] pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/cases/case_000/scene_reinvestigate.jpg";
                }}
              />

              {/* Hotspots Overlay Pins */}
              {hotspots.map((spot) => {
                const isSelected = spot.id === selectedSpotId;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSpotId(spot.id);
                    }}
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={cn(
                      "absolute size-8 rounded-full flex items-center justify-center font-bold text-xs font-mono transition-all shadow-lg cursor-pointer",
                      isSelected
                        ? "bg-amber-400 text-black ring-4 ring-amber-400/40 scale-125 z-20"
                        : "bg-red-600/90 text-white hover:bg-red-500 hover:scale-110 z-10 border border-white/40",
                    )}
                    title={`Điểm #${spot.num}: ${spot.title || ""}`}
                  >
                    {spot.num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI: FORM CHỈNH SỬA CHI TIẾT HOTSPOT */}
          <div className="col-span-12 lg:col-span-4 border-l border-white/10 bg-[#121417] flex flex-col min-h-0 overflow-y-auto p-4 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-300 pb-1 border-b border-white/10 flex items-center justify-between">
              <span>Danh Sách Điểm Khám Xét ({hotspots.length})</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleAddSpot()}
                className="h-6 text-[10px] px-2 border-white/20"
              >
                + Thêm
              </Button>
            </h3>

            {/* List of chips */}
            <div className="flex flex-wrap gap-1.5">
              {hotspots.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setSelectedSpotId(h.id)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-mono font-bold transition-all border",
                    h.id === selectedSpotId
                      ? "bg-amber-500 text-black border-amber-400 shadow-sm"
                      : "bg-black/40 text-neutral-300 border-white/10 hover:border-white/30",
                  )}
                >
                  #{h.num} {h.title ? `(${h.title.slice(0, 10)})` : ""}
                </button>
              ))}
            </div>

            {/* Detail Form for Selected Spot */}
            {selectedSpot ? (
              <div className="space-y-3 p-3.5 rounded-xl border border-white/10 bg-black/40">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-amber-500 text-black font-bold font-mono text-xs">
                      #{selectedSpot.num}
                    </Badge>
                    <span className="font-semibold text-xs text-white">
                      Chi Tiết Điểm
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSpot(selectedSpot.id)}
                    className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Xóa điểm này"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Tên vật chứng / tiêu đề */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                    Tiêu Đề / Tên Vật Chứng
                  </label>
                  <Input
                    value={selectedSpot.title || ""}
                    onChange={(e) => updateSelectedSpot({ title: e.target.value })}
                    placeholder="VD: Hộp diêm Thống Nhất"
                    className="h-8 text-xs bg-zinc-900 border-white/10"
                  />
                </div>

                {/* Tọa độ X, Y */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      Tọa độ X (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={selectedSpot.x}
                      onChange={(e) =>
                        updateSelectedSpot({ x: parseFloat(e.target.value) || 0 })
                      }
                      className="h-8 text-xs bg-zinc-900 border-white/10 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      Tọa độ Y (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={selectedSpot.y}
                      onChange={(e) =>
                        updateSelectedSpot({ y: parseFloat(e.target.value) || 0 })
                      }
                      className="h-8 text-xs bg-zinc-900 border-white/10 font-mono"
                    />
                  </div>
                </div>

                {/* Gán Ảnh Vật Chứng từ Case Evidence */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                    Chọn Ảnh từ Vật Chứng (Evidence)
                  </label>
                  <select
                    value={selectedSpot.photoId || ""}
                    onChange={(e) => {
                      const code = e.target.value;
                      const matched = evidenceList.find(
                        (ev) => ev.code === code || ev.id === code,
                      );
                      updateSelectedSpot({
                        photoId: code,
                        imageUrl: matched?.file_url || selectedSpot.imageUrl,
                        title: selectedSpot.title || matched?.title,
                      });
                    }}
                    className="h-8 w-full rounded-md border border-white/10 bg-zinc-900 px-2 text-xs font-medium text-neutral-200 outline-none focus:border-amber-400"
                  >
                    <option value="">-- Nhập URL thủ công hoặc chọn vật chứng --</option>
                    {evidenceList.map((ev) => (
                      <option key={ev.id} value={ev.code}>
                        {ev.code}: {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hoặc nhập Image URL trực tiếp */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                    Image URL Trực Tiếp
                  </label>
                  <Input
                    value={selectedSpot.imageUrl || ""}
                    onChange={(e) =>
                      updateSelectedSpot({ imageUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="h-8 text-xs bg-zinc-900 border-white/10 font-mono"
                  />
                  {selectedSpot.imageUrl && (
                    <div className="mt-1.5 p-1 rounded border border-white/10 bg-black/60 flex items-center gap-2">
                      <img
                        src={selectedSpot.imageUrl}
                        alt="Preview"
                        className="size-10 object-cover rounded shrink-0 bg-neutral-900"
                      />
                      <span className="text-[10px] text-neutral-400 truncate">
                        {selectedSpot.imageUrl}
                      </span>
                    </div>
                  )}
                </div>

                {/* Âm thanh khi click */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      File Audio
                    </label>
                    <Input
                      value={selectedSpot.soundFile || ""}
                      onChange={(e) =>
                        updateSelectedSpot({ soundFile: e.target.value })
                      }
                      placeholder="sat_soat.mp3"
                      className="h-8 text-xs bg-zinc-900 border-white/10 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      Mô Tả Tiếng
                    </label>
                    <Input
                      value={selectedSpot.soundCaption || ""}
                      onChange={(e) =>
                        updateSelectedSpot({ soundCaption: e.target.value })
                      }
                      placeholder="Tiếng lục soát"
                      className="h-8 text-xs bg-zinc-900 border-white/10"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-500 text-xs border border-dashed border-white/10 rounded-xl">
                Chọn một điểm hoặc bấm "Thêm Điểm" để xem và chỉnh sửa.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 360 VIEWER WORKSPACE */
        <div className="flex-1 flex flex-col p-4 bg-black overflow-hidden relative">
          <div className="flex-1 rounded-xl overflow-hidden border border-white/10 relative">
            <Scene360Viewer
              imageUrl={config360?.scene_360_url || undefined}
              fallbackImageUrl={config360?.panorama_url || undefined}
            />
          </div>
        </div>
      )}

      {/* Modal Cấu hình 360 / Panorama */}
      <Scene360ConfigModal
        isOpen={is360ModalOpen}
        onClose={() => setIs360ModalOpen(false)}
        caseId={caseId}
        initialConfig={config360}
        onSave={(newCfg) => {
          if (onConfig360Updated && config360) {
            onConfig360Updated({
              ...config360,
              scene_360_url: newCfg.scene_360_url ?? null,
              panorama_url: newCfg.panorama_url ?? null,
            });
          }
        }}
      />
    </div>
  );
}
