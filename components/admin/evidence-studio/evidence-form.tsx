"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Trash2,
  Upload,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Volume2,
  Package,
  Layers,
  Hash,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import type { DbCaseEvidence } from "@/lib/types/database";
import {
  upsertCaseEvidence,
  deleteCaseEvidence,
  uploadEvidenceAsset,
} from "@/lib/actions/evidence-actions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface EvidenceFormProps {
  caseId: string;
  evidence: Partial<DbCaseEvidence> | null;
  onSave: (saved: DbCaseEvidence) => void;
  onDelete?: (id: string) => void;
  onCancel?: () => void;
}

export function EvidenceForm({
  caseId,
  evidence,
  onSave,
  onDelete,
  onCancel,
}: EvidenceFormProps) {
  const isEditing = Boolean(evidence?.id);

  const [code, setCode] = useState(evidence?.code || "");
  const [title, setTitle] = useState(evidence?.title || "");
  const [kind, setKind] = useState<DbCaseEvidence["kind"]>(
    evidence?.kind || "photo",
  );
  const [phase, setPhase] = useState<number>(evidence?.phase ?? 0);
  const [slotIndex, setSlotIndex] = useState<number>(evidence?.slot_index ?? 0);
  const [description, setDescription] = useState(evidence?.description || "");
  const [fileUrl, setFileUrl] = useState(evidence?.file_url || "");
  const [thumbUrl, setThumbUrl] = useState(evidence?.thumb_url || "");

  // Metadata
  const initialMeta = evidence?.metadata || {};
  const [evidenceId, setEvidenceId] = useState(
    (initialMeta.evidenceId as string) || "",
  );
  const [recoveredBy, setRecoveredBy] = useState(
    (initialMeta.recoveredBy as string) || "ĐIỀU TRA VIÊN",
  );
  const [chainOfCustody, setChainOfCustody] = useState(
    (initialMeta.chainOfCustody as string) || "VERIFIED",
  );
  const [integrityStatus, setIntegrityStatus] = useState<string>(
    (initialMeta.integrityStatus as string) || "secured",
  );
  const [timestamp, setTimestamp] = useState(
    (initialMeta.timestamp as string) || "",
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  // Sync state when evidence changes
  useEffect(() => {
    setCode(evidence?.code || "");
    setTitle(evidence?.title || "");
    setKind(evidence?.kind || "photo");
    setPhase(evidence?.phase ?? 0);
    setSlotIndex(evidence?.slot_index ?? 0);
    setDescription(evidence?.description || "");
    setFileUrl(evidence?.file_url || "");
    setThumbUrl(evidence?.thumb_url || "");

    const m = evidence?.metadata || {};
    setEvidenceId((m.evidenceId as string) || "");
    setRecoveredBy((m.recoveredBy as string) || "ĐIỀU TRA VIÊN");
    setChainOfCustody((m.chainOfCustody as string) || "VERIFIED");
    setIntegrityStatus((m.integrityStatus as string) || "secured");
    setTimestamp((m.timestamp as string) || "");
  }, [evidence]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "file_url" | "thumb_url",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "file_url") setIsUploadingFile(true);
    else setIsUploadingThumb(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", caseId);
      formData.append(
        "subfolder",
        kind === "pdf" ? "pdfs" : kind === "audio" ? "audio" : "photos",
      );

      const res = await uploadEvidenceAsset(formData);
      if (res.success && res.url) {
        if (field === "file_url") {
          setFileUrl(res.url);
          // Auto-set thumbnail if uploading photo
          if ((kind === "photo" || kind === "image") && !thumbUrl) {
            setThumbUrl(res.url);
          }
        } else {
          setThumbUrl(res.url);
        }
        toast.success(`Tải lên tệp ${file.name} thành công`);
      } else {
        toast.error(res.error || "Tải lên thất bại");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải tệp");
    } finally {
      if (field === "file_url") setIsUploadingFile(false);
      else setIsUploadingThumb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Mã chứng cứ không được để trống");
      return;
    }
    if (!title.trim()) {
      toast.error("Tiêu đề chứng cứ không được để trống");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<DbCaseEvidence> & {
        case_slug: string;
        code: string;
        title: string;
      } = {
        ...(evidence?.id ? { id: evidence.id } : {}),
        case_slug: caseId,
        code: code.trim(),
        title: title.trim(),
        kind,
        phase: Number(phase),
        slot_index: Number(slotIndex),
        description: description.trim() || null,
        file_url: fileUrl.trim() || null,
        thumb_url:
          thumbUrl.trim() ||
          (kind === "photo" || kind === "image"
            ? fileUrl.trim() || null
            : null),
        metadata: {
          ...(evidence?.metadata || {}),
          evidenceId: evidenceId.trim() || `EV-${code.trim().toUpperCase()}`,
          recoveredBy: recoveredBy.trim(),
          chainOfCustody: chainOfCustody.trim(),
          integrityStatus: integrityStatus.trim(),
          timestamp: timestamp.trim(),
        },
      };

      const res = await upsertCaseEvidence(payload);
      if (res.success && res.data) {
        toast.success(
          isEditing ? "Đã cập nhật chứng cứ" : "Đã tạo chứng cứ mới",
        );
        onSave(res.data);
      } else {
        toast.error(res.error || "Lưu thất bại");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi hệ thống");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!evidence?.id) return;
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa chứng cứ [${evidence.code}] ${evidence.title}?`,
      )
    ) {
      return;
    }

    try {
      const res = await deleteCaseEvidence(evidence.id);
      if (res.success) {
        toast.success("Đã xóa chứng cứ thành công");
        if (onDelete) onDelete(evidence.id);
      } else {
        toast.error(res.error || "Xóa thất bại");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi xóa");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span>
              {isEditing ? "Chỉnh sửa Chứng Cứ" : "Thêm Chứng Cứ Mới"}
            </span>
            {isEditing && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400">
                #{evidence?.code}
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Điền thông số nghiệp vụ và tải tệp tin PDF / hình ảnh lên Storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            >
              Hủy
            </button>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="size-3.5" />
              <span>Xóa</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded flex items-center gap-1.5 shadow-lg shadow-amber-950 transition-colors"
          >
            {isSaving ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>{isEditing ? "Lưu thay đổi" : "Tạo chứng cứ"}</span>
          </button>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mã code */}
        <div>
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1">
            <Hash className="size-3.5 text-amber-500" />
            <span>Mã chứng cứ (Code) *</span>
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="VD: p1, p3, 00-HD, EV-GLASS"
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-500 transition-colors"
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Duy nhất theo từng vụ án (case_slug + code).
          </p>
        </div>

        {/* Phân loại Kind */}
        <div>
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1">
            <Package className="size-3.5 text-amber-500" />
            <span>Loại chứng cứ *</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: "photo", label: "Ảnh", icon: ImageIcon },
              { id: "pdf", label: "PDF", icon: FileText },
              { id: "audio", label: "Audio", icon: Volume2 },
              { id: "object", label: "Vật phẩm", icon: Package },
            ].map((k) => {
              const Icon = k.icon;
              const isSelected = kind === k.id;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id as DbCaseEvidence["kind"])}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded border text-xs gap-1 transition-all",
                    isSelected
                      ? "bg-amber-950/60 border-amber-500 text-amber-300 font-medium"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="text-[11px]">{k.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tiêu đề */}
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-zinc-300 mb-1 block">
            Tiêu đề chứng cứ *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: p1. Ảnh hiện trường phòng khách & bộ bình trà vỡ"
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Phase */}
        <div>
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1">
            <Layers className="size-3.5 text-amber-500" />
            <span>Giai đoạn mở khóa (Phase)</span>
          </label>
          <select
            value={phase}
            onChange={(e) => setPhase(Number(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value={0}>Phase 0: Khởi đầu (Hồ sơ ban đầu)</option>
            <option value={1}>Phase 1: Tuyến A (Phong bì 01)</option>
            <option value={2}>Phase 2: Tuyến B (Phong bì 02)</option>
            <option value={3}>Phase 3: Tuyến C (Định tội)</option>
            <option value={4}>Phase 4: Hậu kết / Mở rộng</option>
          </select>
        </div>

        {/* Slot index */}
        <div>
          <label className="text-xs font-medium text-zinc-300 mb-1 block">
            Thứ tự hiển thị (Slot Index)
          </label>
          <input
            type="number"
            value={slotIndex}
            onChange={(e) => setSlotIndex(Number(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-zinc-300 mb-1 block">
          Mô tả / Tóm tắt nội dung chứng cứ
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả hiện trạng vật chứng, vết nứt, dấu vân tay hoặc bối cảnh thu thập..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
        />
      </div>

      {/* Tệp tin chính & Upload */}
      <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <FolderOpen className="size-3.5 text-amber-500" />
            <span>Tệp tin chứng cứ ({kind.toUpperCase()})</span>
          </label>
          <label className="px-3 py-1 text-xs font-mono rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 flex items-center gap-1.5 cursor-pointer transition-colors">
            {isUploadingFile ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            <span>Tải lên Bucket</span>
            <input
              type="file"
              onChange={(e) => handleFileUpload(e, "file_url")}
              className="hidden"
              accept={
                kind === "pdf"
                  ? ".pdf"
                  : kind === "audio"
                    ? "audio/*"
                    : "image/*"
              }
            />
          </label>
        </div>

        <input
          type="text"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://... hoặc /documents/... hoặc /images/..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
        />

        {/* Thumbnail URL for non-photo or photo override */}
        {(kind === "pdf" || kind === "audio" || kind === "object") && (
          <div className="pt-2 border-t border-zinc-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-zinc-400">
                Ảnh đại diện (Thumbnail tùy chọn)
              </label>
              <label className="px-2.5 py-0.5 text-[11px] font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer flex items-center gap-1 transition-colors">
                {isUploadingThumb ? (
                  <RefreshCw className="size-3 animate-spin" />
                ) : (
                  <Upload className="size-3" />
                )}
                <span>Tải ảnh</span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, "thumb_url")}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
            <input
              type="text"
              value={thumbUrl}
              onChange={(e) => setThumbUrl(e.target.value)}
              placeholder="Đường dẫn ảnh thu nhỏ..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Forensics Metadata Section */}
      <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-3">
        <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-amber-500" />
          <span>Thông số Giám định & Chuỗi bảo quản (Metadata)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1">
              <Hash className="size-3 text-zinc-500" />
              <span>Mã vật chứng pháp lý (evidenceId)</span>
            </label>
            <input
              type="text"
              value={evidenceId}
              onChange={(e) => setEvidenceId(e.target.value)}
              placeholder="VD: EV-SCENE-OVERVIEW, EV-GLASS-SHARD"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1">
              <Clock className="size-3 text-zinc-500" />
              <span>Thời điểm ghi nhận (timestamp)</span>
            </label>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="VD: 20:00, 24/07/2016"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1">
              <User className="size-3 text-zinc-500" />
              <span>Người thu thập (recoveredBy)</span>
            </label>
            <input
              type="text"
              value={recoveredBy}
              onChange={(e) => setRecoveredBy(e.target.value)}
              placeholder="VD: ĐIỀU TRA VIÊN"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1">
              <AlertTriangle className="size-3 text-zinc-500" />
              <span>Trạng thái niêm phong (integrityStatus)</span>
            </label>
            <select
              value={integrityStatus}
              onChange={(e) => setIntegrityStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="secured">secured (Nguyên vẹn)</option>
              <option value="analyzing">analyzing (Đang giám định)</option>
              <option value="corrupted">corrupted (Bị xâm phạm / vỡ)</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}
