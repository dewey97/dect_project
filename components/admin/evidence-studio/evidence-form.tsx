"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  Upload,
  RefreshCw,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import type { DbCaseEvidence } from "@/lib/types/database";
import {
  deleteCaseEvidence,
  uploadEvidenceAsset,
} from "@/lib/actions/evidence-actions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";

interface EvidenceFormProps {
  caseId: string;
  evidence: Partial<DbCaseEvidence> | null;
  onChange?: (updated: Partial<DbCaseEvidence>) => void;
  onSave?: (saved: DbCaseEvidence) => void;
  onDelete?: (id: string) => void;
  onCancel?: () => void;
}

export function EvidenceForm({
  caseId,
  evidence,
  onChange,
  onDelete,
}: EvidenceFormProps) {
  const isEditing = Boolean(evidence?.id);

  const [code, setCode] = useState(evidence?.code || "");
  const [title, setTitle] = useState(evidence?.title || "");
  const [kind, setKind] = useState<DbCaseEvidence["kind"]>(
    evidence?.kind === "pdf" ? "pdf" : "photo",
  );
  const [description, setDescription] = useState(evidence?.description || "");
  const [fileUrl, setFileUrl] = useState(evidence?.file_url || "");

  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Sync state when evidence changes
  useEffect(() => {
    setCode(evidence?.code || "");
    setTitle(evidence?.title || "");
    setKind(evidence?.kind === "pdf" ? "pdf" : "photo");
    setDescription(evidence?.description || "");
    setFileUrl(evidence?.file_url || "");
  }, [evidence]);

  const notifyChange = (updatedFields: Partial<DbCaseEvidence>) => {
    if (onChange) {
      onChange({
        ...(evidence || {}),
        code,
        title,
        kind,
        description,
        file_url: fileUrl,
        ...updatedFields,
      });
    }
  };

  const handleCodeChange = (val: string) => {
    setCode(val);
    notifyChange({ code: val });
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    notifyChange({ title: val });
  };

  const handleKindChange = (newKind: "photo" | "pdf") => {
    setKind(newKind);
    notifyChange({ kind: newKind });
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    notifyChange({ description: val });
  };

  const handleFileUrlChange = (val: string) => {
    setFileUrl(val);
    notifyChange({ file_url: val, thumb_url: kind === "photo" ? val : undefined });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", caseId);
      formData.append("subfolder", kind === "pdf" ? "pdfs" : "photos");

      const res = await uploadEvidenceAsset(formData);
      if (res.success && res.url) {
        setFileUrl(res.url);
        notifyChange({
          file_url: res.url,
          thumb_url: kind === "photo" ? res.url : undefined,
        });
        toast.success(`Tải lên tệp ${file.name} thành công`);
      } else {
        toast.error(res.error || "Tải lên thất bại");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải tệp");
    } finally {
      setIsUploadingFile(false);
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
    <div className="space-y-3.5 text-xs">
      {/* 1. Mã Tag chứng cứ ở trên đầu */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-neutral-400 whitespace-nowrap font-medium">
          Mã Tag chứng cứ:
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="VD: A-01, B-02..."
          className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded px-2.5 py-1 font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500 text-right"
        />
      </div>

      {/* 2. Tiêu đề */}
      <div>
        <label className="text-neutral-400 mb-1 block font-medium">
          Tiêu đề chứng cứ
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="VD: Ảnh mảnh bình vỡ, Sổ ghi nợ, Bài báo cũ 1996..."
          className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* 3. Loại chứng cứ (Chỉ gồm 2 loại: Ảnh hoặc PDF từ bên ngoài) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-neutral-400 font-medium">
            Loại chứng cứ
          </label>
          <span className="text-[10px] text-neutral-500">2 loại: Ảnh hoặc PDF ngoài</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleKindChange("photo")}
            className={cn(
              "flex items-center justify-center p-2 rounded border text-xs gap-1.5 transition-all font-medium",
              kind === "photo" || kind === "image"
                ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm font-semibold"
                : "bg-black/40 border-white/10 text-neutral-400 hover:text-white",
            )}
          >
            <ImageIcon className="size-3.5" />
            <span>Ảnh (Hiện trường / Vật phẩm)</span>
          </button>
          <button
            type="button"
            onClick={() => handleKindChange("pdf")}
            className={cn(
              "flex items-center justify-center p-2 rounded border text-xs gap-1.5 transition-all font-medium",
              kind === "pdf"
                ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm font-semibold"
                : "bg-black/40 border-white/10 text-neutral-400 hover:text-white",
            )}
          >
            <FileText className="size-3.5" />
            <span>PDF từ bên ngoài</span>
          </button>
        </div>
        <p className="mt-1 text-[10px] text-neutral-500 italic">
          * Lưu ý: Hồ sơ Lý lịch và Biên bản Lời khai được quản lý & soạn thảo riêng trong Studio.
        </p>
      </div>

      {/* 4. Mô tả */}
      <div>
        <label className="text-neutral-400 mb-1 block font-medium">
          Mô tả
        </label>
        <AutoGrowTextarea
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Mô tả chi tiết vật chứng..."
          className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 leading-relaxed"
        />
      </div>

      {/* 5. URL tệp tin & Upload */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-neutral-400 font-medium">
            URL
          </label>
          <label className="px-2 py-0.5 text-[11px] font-mono rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 cursor-pointer transition-colors active:scale-95">
            {isUploadingFile ? (
              <RefreshCw className="size-3 animate-spin" />
            ) : (
              <Upload className="size-3" />
            )}
            <span>Tải lên</span>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept={kind === "pdf" ? ".pdf" : "image/*"}
            />
          </label>
        </div>
        <input
          type="text"
          value={fileUrl}
          onChange={(e) => handleFileUrlChange(e.target.value)}
          placeholder="https://... hoặc /documents/... hoặc /images/..."
          className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* 6. Nút Xóa (nếu đang chỉnh sửa chứng cứ đã có) */}
      {isEditing && onDelete && (
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={handleDelete}
            className="px-2.5 py-1 text-[11px] text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="size-3" />
            <span>Xóa vật chứng</span>
          </button>
        </div>
      )}
    </div>
  );
}
