"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  Key,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import type { DbPhonePhoto } from "@/lib/types/database";
import {
  upsertPhonePhoto,
  deletePhonePhoto,
  uploadPhoneAsset,
} from "@/lib/actions/phone-actions";

interface PhotosEditorProps {
  caseId: string;
  initialPhotos: DbPhonePhoto[];
  onPhotosChange: (photos: DbPhonePhoto[]) => void;
  onBusyChange?: (busy: boolean) => void;
}

export function PhotosEditor({
  caseId,
  initialPhotos,
  onPhotosChange,
  onBusyChange,
}: PhotosEditorProps) {
  const [photos, setPhotos] = useState<DbPhonePhoto[]>(initialPhotos);
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{
    type: "idle" | "success" | "error";
    text?: string;
  }>({ type: "idle" });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    onBusyChange?.(isPending || isUploading);
  }, [isPending, isUploading, onBusyChange]);
  const [editingPhoto, setEditingPhoto] = useState<DbPhonePhoto | null>(null);

  // New photo manual form
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("2023-07-23 18:30");
  const [newLocation, setNewLocation] = useState("");
  const [newIsEvidence, setNewIsEvidence] = useState(false);

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "photos");
        formData.append("caseSlug", caseId);

        const res = await uploadPhoneAsset(formData);
        if (res.success && res.data?.url) {
          const nextSlot =
            photos.length + successCount > 0
              ? Math.max(...photos.map((p) => p.slot_index), 0) +
                successCount +
                1
              : successCount;

          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const saveRes = await upsertPhonePhoto({
            case_slug: caseId,
            image_url: res.data.url,
            label: baseName,
            photo_code: `p-${Date.now().toString(36).slice(-4)}-${i + 1}`,
            taken_at: new Date().toISOString().replace("T", " ").slice(0, 16),
            slot_index: nextSlot,
          });

          if (saveRes.success && saveRes.data) {
            setPhotos((prev) => [...prev, saveRes.data!]);
            successCount++;
          }
        }
      } catch (err) {
        console.error("Lỗi upload ảnh:", err);
      }
    }

    setIsUploading(false);
    setStatusMsg({
      type: "success",
      text: `Đã tải lên thành công ${successCount}/${files.length} ảnh.`,
    });
    setTimeout(() => setStatusMsg({ type: "idle" }), 4000);
  };

  const handleAddManualPhoto = () => {
    if (!newUrl.trim()) {
      alert("Vui lòng nhập URL ảnh hoặc tải ảnh lên");
      return;
    }

    const nextSlot =
      photos.length > 0 ? Math.max(...photos.map((p) => p.slot_index)) + 1 : 0;

    startTransition(async () => {
      const res = await upsertPhonePhoto({
        case_slug: caseId,
        image_url: newUrl.trim(),
        label: newLabel.trim() || "Ảnh hiện trường",
        photo_code: newCode.trim() || null,
        description: newDesc.trim() || null,
        taken_at: newDate.trim() || null,
        exif_json: newLocation.trim() ? { location: newLocation.trim() } : null,
        is_evidence: newIsEvidence,
        slot_index: nextSlot,
      });

      if (res.success && res.data) {
        const updated = [...photos, res.data];
        setPhotos(updated);
        onPhotosChange(updated);
        setNewUrl("");
        setNewLabel("");
        setNewCode("");
        setNewDesc("");
        setNewLocation("");
        setNewIsEvidence(false);
        setStatusMsg({ type: "success", text: "Đã thêm ảnh vào bộ sưu tập." });
        setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Không thể thêm ảnh.",
        });
      }
    });
  };

  const handleDeletePhoto = (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này khỏi bộ sưu tập?")) return;

    const filtered = photos.filter((p) => p.id !== id);
    setPhotos(filtered);
    onPhotosChange(filtered);

    startTransition(async () => {
      const res = await deletePhonePhoto(id);
      if (!res.success) {
        setStatusMsg({ type: "error", text: res.error || "Lỗi xóa ảnh." });
      }
    });
  };

  const handleToggleEvidence = (p: DbPhonePhoto) => {
    const updated = { ...p, is_evidence: !p.is_evidence };
    const nextList = photos.map((item) => (item.id === p.id ? updated : item));
    setPhotos(nextList);
    onPhotosChange(nextList);

    startTransition(async () => {
      await upsertPhonePhoto({
        id: p.id,
        case_slug: caseId,
        label: p.label,
        image_url: p.image_url,
        is_evidence: !p.is_evidence,
      });
    });
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <ImageIcon className="size-4 text-purple-400" />
            Thư viện Ảnh & Bằng chứng Hình ảnh (Photos App)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Quản lý album ảnh trong máy, gắn mã chứng cứ, tọa độ địa điểm và
            thông tin EXIF
          </p>
        </div>

        {/* Batch Upload Button */}
        <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-medium text-xs transition-all cursor-pointer shadow-sm">
          <Upload className="size-3.5" />
          {isUploading ? "Đang tải ảnh..." : "Tải lên hàng loạt ảnh"}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleBatchUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {statusMsg.type === "success" && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}
      {statusMsg.type === "error" && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-700/60 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Bộ sưu tập ({photos.length} ảnh)
          </h3>
        </div>

        {photos.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
            Chưa có ảnh nào trong máy. Bấm "Tải lên hàng loạt ảnh" để thêm ảnh
            chứng cứ.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((p) => (
              <div
                key={p.id}
                className={`group relative rounded-xl overflow-hidden border bg-zinc-950 transition-all ${
                  p.is_evidence
                    ? "border-amber-500/80 ring-2 ring-amber-500/30"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {/* Photo Image Aspect 4:3 */}
                <div className="aspect-4/3 w-full bg-black relative overflow-hidden">
                  <img
                    src={p.image_url}
                    alt={p.label || "Photo"}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                  />

                  {/* Evidence Badge */}
                  {p.is_evidence && (
                    <div className="absolute top-1.5 left-1.5 bg-amber-500/90 text-black text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                      <Key className="size-2.5" /> CHỨNG CỨ
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleEvidence(p)}
                      className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                        p.is_evidence
                          ? "bg-amber-500 text-black"
                          : "bg-white/20 text-white hover:bg-white/40"
                      }`}
                      title={
                        p.is_evidence
                          ? "Bỏ đánh dấu chứng cứ"
                          : "Gắn thẻ Chứng cứ phá án"
                      }
                    >
                      <Key className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(p.id)}
                      className="p-1.5 rounded-full bg-red-600/80 text-white hover:bg-red-500 cursor-pointer transition-colors"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Caption Footer */}
                <div className="p-2 space-y-0.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-200 truncate">
                    <span>{p.label || "Không có tên"}</span>
                  </div>
                  {p.photo_code && (
                    <span className="font-mono text-[10px] text-zinc-500">
                      [{p.photo_code}]
                    </span>
                  )}
                  {p.taken_at && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                      <Calendar className="size-2.5" />
                      <span>{p.taken_at}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Add Photo Box */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-300">
          Thêm ảnh đơn lẻ bằng URL
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Đường dẫn ảnh (URL)
            </label>
            <input
              type="text"
              placeholder="/images/cases/... hoặc https://..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Tiêu đề ảnh (Label)
            </label>
            <input
              type="text"
              placeholder="VD: Chụp tại quán cà phê..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Mã ảnh (Photo Code)
            </label>
            <input
              type="text"
              placeholder="VD: c0-p01..."
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Thời điểm chụp (Date Taken)
            </label>
            <input
              type="text"
              placeholder="2023-07-23 18:30"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Địa điểm chụp (Location)
            </label>
            <input
              type="text"
              placeholder="VD: Cảng Bạch Đằng..."
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
            <input
              type="checkbox"
              checked={newIsEvidence}
              onChange={(e) => setNewIsEvidence(e.target.checked)}
              className="accent-amber-400 rounded"
            />
            <Key className="size-3.5 text-amber-400" />
            Đánh dấu là Chứng cứ phá án
          </label>

          <button
            type="button"
            onClick={handleAddManualPhoto}
            disabled={isPending || !newUrl.trim()}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="size-4" /> Thêm ảnh vào máy
          </button>
        </div>
      </div>
    </div>
  );
}
