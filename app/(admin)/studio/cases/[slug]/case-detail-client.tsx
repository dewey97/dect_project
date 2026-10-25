"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Upload,
  Eye,
} from "lucide-react";
import type { DbCase, CaseStatus } from "@/lib/types/database";
import { updateCase } from "@/lib/actions/case-actions";
import { uploadEvidenceAsset } from "@/lib/actions/evidence-actions";
import { toast } from "@/components/ui/toast";
import { Scene360Viewer } from "@/components/investigation/scene-360-viewer";

export function CaseDetailClient({ initialCase }: { initialCase: DbCase }) {
  const router = useRouter();
  const [caseData, setCaseData] = useState<DbCase>(initialCase);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [isUploading360, setIsUploading360] = useState(false);
  const [isUploadingPano, setIsUploadingPano] = useState(false);
  const [showPreview360, setShowPreview360] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateCase(caseData.id, {
        title: caseData.title,
        synopsis: caseData.synopsis,
        full_story: caseData.full_story,
        difficulty: caseData.difficulty,
        status: caseData.status,
        cover_image_url: caseData.cover_image_url,
        panorama_url: caseData.panorama_url,
        scene_360_url: caseData.scene_360_url,
        reinvestigation_bg_url: caseData.reinvestigation_bg_url,
      });

      if (res.success && res.data) {
        setCaseData(res.data);
        toast.success("Đã cập nhật metadata vụ án thành công!");
        router.refresh();
      } else {
        toast.error(res.error || "Không lưu được vụ án");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi lưu vụ án");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    field: "cover_image_url" | "reinvestigation_bg_url" | "scene_360_url" | "panorama_url",
    setLoading: (val: boolean) => void
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", caseData.slug);
      formData.append("type", field.includes("360") || field.includes("panorama") ? "scene_360" : "evidence");

      const res = await uploadEvidenceAsset(formData);
      if (res.success && res.url) {
        setCaseData((prev) => ({ ...prev, [field]: res.url }));
        toast.success("Tải tệp ảnh thành công!");
      } else {
        toast.error(res.error || "Lỗi tải ảnh lên");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải ảnh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/studio/cases"
            className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              {caseData.title || "Chi tiết Vụ án"}
            </h1>
            <p className="text-xs font-mono text-amber-400/90 mt-0.5">
              Mã hệ thống: {caseData.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/evidence/web?case_id=${caseData.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-800 text-zinc-200 border border-white/10 rounded-md text-xs font-medium hover:bg-zinc-700 transition-colors"
          >
            <ExternalLink className="size-3.5" />
            Playtest
          </Link>
          <button
            type="submit"
            form="case-metadata-form"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-black font-semibold rounded-md text-xs hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/20"
          >
            <Save className="size-3.5" />
            {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
          </button>
        </div>
      </div>

      <form id="case-metadata-form" onSubmit={handleSave} className="space-y-6">
        {/* Nhóm 1: Thông tin cơ bản & Trạng thái */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 border-b border-white/5 pb-2">
            1. Thông tin Vụ án & Trạng thái
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Tên Vụ án *
              </label>
              <input
                type="text"
                required
                value={caseData.title}
                onChange={(e) => setCaseData({ ...caseData, title: e.target.value })}
                className="w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Trạng thái Vụ án
              </label>
              <select
                value={caseData.status}
                onChange={(e) => setCaseData({ ...caseData, status: e.target.value as CaseStatus })}
                className="w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="DRAFT">DRAFT (Bản nháp - Chỉ thấy trong Studio)</option>
                <option value="IN_REVIEW">IN_REVIEW (Đang nghiệm thu)</option>
                <option value="PUBLISHED">PUBLISHED (Xuất bản - Mở chơi tại /activate)</option>
                <option value="ARCHIVED">ARCHIVED (Lưu trữ / Đóng)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Độ khó (1 - 5 sao)
              </label>
              <select
                value={caseData.difficulty}
                onChange={(e) => setCaseData({ ...caseData, difficulty: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value={1}>★☆☆☆☆ 1 - Nhập môn</option>
                <option value={2}>★★☆☆☆ 2 - Dễ</option>
                <option value={3}>★★★☆☆ 3 - Trung bình</option>
                <option value={4}>★★★★☆ 4 - Nâng cao</option>
                <option value={5}>★★★★★ 5 - Chuyên gia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Ảnh bìa Vụ án (Cover URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={caseData.cover_image_url || ""}
                  onChange={(e) => setCaseData({ ...caseData, cover_image_url: e.target.value })}
                  placeholder="/images/... hoặc https://..."
                  className="flex-1 bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
                <label className="cursor-pointer inline-flex items-center px-3 py-2 bg-zinc-800 border border-white/10 hover:bg-zinc-700 rounded-md text-xs font-medium text-zinc-200">
                  <Upload className="size-3.5 mr-1" />
                  {isUploadingCover ? "..." : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, "cover_image_url", setIsUploadingCover);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Tóm tắt ngắn (Synopsis - Hiển thị trên thẻ vụ án)
            </label>
            <textarea
              rows={2}
              value={caseData.synopsis || ""}
              onChange={(e) => setCaseData({ ...caseData, synopsis: e.target.value })}
              placeholder="Tóm tắt bối cảnh vụ việc ngắn gọn..."
              className="w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Toàn bộ cốt truyện / Bối cảnh sâu (Full Story)
            </label>
            <textarea
              rows={4}
              value={caseData.full_story || ""}
              onChange={(e) => setCaseData({ ...caseData, full_story: e.target.value })}
              placeholder="Cốt truyện đầy đủ, dòng thời gian sự kiện..."
              className="w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>
        </div>

        {/* Nhóm 2: Không gian hiện trường & Khám xét 2D / 360 */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 border-b border-white/5 pb-2">
            2. Hiện trường Khám xét (2D & 360 Panorama)
          </h2>

          {/* 2D Crime Scene Background */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Ảnh nền Khám xét hiện trường 2D (Reinvestigation 2D Scene Background)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={caseData.reinvestigation_bg_url || ""}
                onChange={(e) => setCaseData({ ...caseData, reinvestigation_bg_url: e.target.value })}
                placeholder="VD: /images/cases/case_000/crime_scene_360.jpg hoặc URL ảnh"
                className="flex-1 bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
              <label className="cursor-pointer inline-flex items-center px-3 py-2 bg-zinc-800 border border-white/10 hover:bg-zinc-700 rounded-md text-xs font-medium text-zinc-200">
                <Upload className="size-3.5 mr-1" />
                {isUploadingBg ? "..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, "reinvestigation_bg_url", setIsUploadingBg);
                  }}
                />
              </label>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Ảnh này dùng làm phông nền khi người chơi mở giao diện &quot;Khám xét lại hiện trường&quot; để click các điểm hotspot.
            </p>
          </div>

          {/* 360 Sphere URL */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Ảnh cầu 360 (Equirectangular 360 URL)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={caseData.scene_360_url || ""}
                onChange={(e) => setCaseData({ ...caseData, scene_360_url: e.target.value })}
                placeholder="VD: /images/cases/case_000/crime_scene_360.jpg"
                className="flex-1 bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
              <label className="cursor-pointer inline-flex items-center px-3 py-2 bg-zinc-800 border border-white/10 hover:bg-zinc-700 rounded-md text-xs font-medium text-zinc-200">
                <Upload className="size-3.5 mr-1" />
                {isUploading360 ? "..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, "scene_360_url", setIsUploading360);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Panorama Cylindrical URL */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Ảnh Panorama phẳng / dải trụ (Cylindrical Panorama URL)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={caseData.panorama_url || ""}
                onChange={(e) => setCaseData({ ...caseData, panorama_url: e.target.value })}
                placeholder="VD: /images/cases/case_000/PANORAMA.png"
                className="flex-1 bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
              <label className="cursor-pointer inline-flex items-center px-3 py-2 bg-zinc-800 border border-white/10 hover:bg-zinc-700 rounded-md text-xs font-medium text-zinc-200">
                <Upload className="size-3.5 mr-1" />
                {isUploadingPano ? "..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, "panorama_url", setIsUploadingPano);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Nút xem thử 360 */}
          {caseData.scene_360_url && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPreview360(!showPreview360)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:text-white rounded text-xs border border-white/10"
              >
                <Eye className="size-3.5" />
                {showPreview360 ? "Ẩn xem thử 360" : "Xem thử không gian 360"}
              </button>

              {showPreview360 && (
                <div className="mt-3 aspect-video w-full rounded-lg overflow-hidden border border-white/20">
                  <Scene360Viewer
                    imageUrl={caseData.scene_360_url}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
