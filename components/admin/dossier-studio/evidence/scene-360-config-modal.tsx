"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  RefreshCw,
  Save,
  RotateCcw,
  Eye,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  updateCase360Config,
  uploadEvidenceAsset,
} from "@/lib/actions/evidence-actions";
import { toast } from "@/components/ui/toast";
import { Scene360Viewer } from "@/components/investigation/scene-360-viewer";

interface Scene360ConfigModalProps {
  caseId: string;
  initialConfig: {
    panorama_url?: string | null;
    scene_360_url?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: {
    panorama_url?: string | null;
    scene_360_url?: string | null;
  }) => void;
}

export function Scene360ConfigModal({
  caseId,
  initialConfig,
  isOpen,
  onClose,
  onSave,
}: Scene360ConfigModalProps) {
  const [scene360Url, setScene360Url] = useState(
    initialConfig?.scene_360_url || "",
  );
  const [panoramaUrl, setPanoramaUrl] = useState(
    initialConfig?.panorama_url || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading360, setIsUploading360] = useState(false);
  const [isUploadingPano, setIsUploadingPano] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  useEffect(() => {
    setScene360Url(initialConfig?.scene_360_url || "");
    setPanoramaUrl(initialConfig?.panorama_url || "");
  }, [initialConfig]);

  if (!isOpen) return null;

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "scene_360" | "panorama",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "scene_360") setIsUploading360(true);
    else setIsUploadingPano(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", caseId);
      formData.append("subfolder", "scene360");

      const res = await uploadEvidenceAsset(formData);
      if (res.success && res.url) {
        if (type === "scene_360") setScene360Url(res.url);
        else setPanoramaUrl(res.url);
        toast.success(`Đã tải lên tệp ${file.name}`);
      } else {
        toast.error(res.error || "Tải lên thất bại");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải tệp");
    } finally {
      if (type === "scene_360") setIsUploading360(false);
      else setIsUploadingPano(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateCase360Config(caseId, {
        scene_360_url: scene360Url.trim() || null,
        panorama_url: panoramaUrl.trim() || null,
      });

      if (res.success) {
        toast.success("Đã cập nhật cấu hình ảnh hiện trường 360");
        onSave({
          scene_360_url: scene360Url.trim() || null,
          panorama_url: panoramaUrl.trim() || null,
        });
        onClose();
      } else {
        toast.error(res.error || "Lưu thất bại");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi hệ thống");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-950/60 border border-amber-800/60 text-amber-400">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <span>Cấu hình Hiện Trường 360 & Panorama</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400">
                  {caseId}
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Thiết lập nguồn ảnh khám xét hiện trường vụ án cho
                ReinvestigationModal & Scene360Viewer.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 360 Equirectangular Image */}
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-medium text-zinc-200 block">
                    Ảnh cầu 360 độ (Equirectangular Sphere Image)
                  </label>
                  <p className="text-[11px] text-zinc-500">
                    Chiếu lên khối cầu Three.js cho góc quay 360° tự do (e.g.
                    crime_scene_360.jpg).
                  </p>
                </div>

                <label className="px-3 py-1 text-xs font-mono rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 flex items-center gap-1.5 cursor-pointer transition-colors">
                  {isUploading360 ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  <span>Tải ảnh 360</span>
                  <input
                    type="file"
                    onChange={(e) => handleUpload(e, "scene_360")}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>

              <input
                type="text"
                value={scene360Url}
                onChange={(e) => setScene360Url(e.target.value)}
                placeholder="/images/cases/case_000/crime_scene_360.jpg hoặc https://..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Panorama 2D Fallback */}
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-medium text-zinc-200 block">
                    Ảnh Panorama dự phòng (Fallback Panorama PNG)
                  </label>
                  <p className="text-[11px] text-zinc-500">
                    Sử dụng khi ảnh 360 chưa tải xong hoặc mạng chậm (e.g.
                    PANORAMA.webp).
                  </p>
                </div>

                <label className="px-3 py-1 text-xs font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition-colors">
                  {isUploadingPano ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  <span>Tải Panorama</span>
                  <input
                    type="file"
                    onChange={(e) => handleUpload(e, "panorama")}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>

              <input
                type="text"
                value={panoramaUrl}
                onChange={(e) => setPanoramaUrl(e.target.value)}
                placeholder="/images/cases/case_000/PANORAMA.webp hoặc https://..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Live Test Preview Toggle */}
            {(scene360Url || panoramaUrl) && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewActive((prev) => !prev)}
                  className="px-3 py-1.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="size-3.5" />
                  <span>
                    {isPreviewActive
                      ? "Ẩn khung xem thử 360"
                      : "Bật xem thử 360 ngay tại đây"}
                  </span>
                </button>

                {isPreviewActive && (
                  <div className="h-64 w-full rounded-lg overflow-hidden border border-zinc-800 bg-black relative">
                    <Scene360Viewer
                      imageUrl={scene360Url || undefined}
                      fallbackImageUrl={panoramaUrl || undefined}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
              >
                Đóng
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded flex items-center gap-1.5 shadow-lg shadow-amber-950 transition-colors"
              >
                {isSaving ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                <span>Lưu cấu hình 360</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
