"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FolderOpen,
  X,
  Search,
  Check,
  Plus,
  Trash2,
  Loader2,
  FileText,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { DbCaseDossier } from "@/lib/types/database";
import type { AvailableDocumentItem } from "@/lib/actions/dossier-config-actions";
import { saveCaseDossier } from "@/lib/actions/dossier-config-actions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { slugifyVietnamese } from "@/lib/text";

interface DossierConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
  dossier: DbCaseDossier | null;
  availableDocuments: AvailableDocumentItem[];
  onSaved: (updated: DbCaseDossier) => void;
}

export function DossierConfigModal({
  isOpen,
  onClose,
  caseId = "case_000",
  dossier,
  availableDocuments,
  onSaved,
}: DossierConfigModalProps) {
  const [title, setTitle] = useState("");
  const [dossierKey, setDossierKey] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "loi_khai" | "ly_lich" | "evidence"
  >("all");
  const [customCodeInput, setCustomCodeInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dossier) {
      setTitle(dossier.title || "");
      setDossierKey(dossier.dossier_key || "");
      setDescription(dossier.description || "");
      setSelectedCodes(dossier.document_codes || []);
    } else {
      setTitle("");
      setDossierKey("");
      setDescription("");
      setSelectedCodes([]);
    }
    setSearchQuery("");
    setCustomCodeInput("");
  }, [dossier, isOpen]);

  if (!isOpen || !dossier) return null;

  const toggleCode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setSelectedCodes((prev) =>
      prev.includes(trimmed)
        ? prev.filter((c) => c !== trimmed)
        : [...prev, trimmed],
    );
  };

  const handleAddCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = customCodeInput.trim().toUpperCase();
    if (!code) return;
    if (!selectedCodes.includes(code)) {
      setSelectedCodes((prev) => [...prev, code]);
    }
    setCustomCodeInput("");
  };

  const removeCode = (code: string) => {
    setSelectedCodes((prev) => prev.filter((c) => c !== code));
  };

  // Lọc danh sách tài liệu hiển thị
  const filteredDocs = availableDocuments.filter((doc) => {
    if (activeCategory !== "all" && doc.category !== activeCategory)
      return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      doc.code.toLowerCase().includes(query) ||
      doc.title.toLowerCase().includes(query) ||
      (doc.description || "").toLowerCase().includes(query)
    );
  });

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên bộ hồ sơ");
      return;
    }

    const finalKey =
      (dossierKey && dossierKey.trim()) ||
      slugifyVietnamese(title.trim()) ||
      `dossier_${Date.now()}`;

    setIsSaving(true);
    try {
      const res = await saveCaseDossier(caseId, {
        dossierKey: finalKey,
        title: title.trim(),
        description: description.trim(),
        documentCodes: selectedCodes,
        flowPosition: dossier.flow_position,
      });

      if (res.ok && res.dossier) {
        toast.success(
          `Đã lưu ${res.dossier.title} (${res.dossier.document_codes.length} tài liệu)`,
        );
        onSaved(res.dossier);
        onClose();
      } else {
        toast.error(res.error || "Không lưu được cấu hình bộ hồ sơ");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lỗi khi lưu bộ hồ sơ";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-white/10 bg-[#101014] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <FolderOpen className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                {title ? `Bộ Hồ Sơ: ${title}` : "Tạo Bộ Hồ Sơ Mới"}
              </h2>
              
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 space-y-4">
          {/* Metadata fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-semibold text-zinc-300">
                Tên hiển thị bộ hồ sơ <span className="text-amber-400">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!dossier.dossier_key) {
                    setDossierKey(slugifyVietnamese(e.target.value));
                  }
                }}
                placeholder="VD: Bộ A, Hồ Sơ Hiện Trường..."
                className="border-white/10 bg-[#16161c] text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-semibold text-zinc-300">
                Ghi chú nội dung (tuỳ chọn)
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả tóm tắt nội dung..."
                className="border-white/10 bg-[#16161c] text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400"
              />
            </div>
          </div>

          {/* Selected Codes Chips */}
          <div className="rounded-xl border border-white/5 bg-[#141418] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Tài liệu & Vật chứng đã chọn ({selectedCodes.length})
              </span>
              {selectedCodes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCodes([])}
                  className="text-[11px] text-zinc-500 hover:text-red-400"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {selectedCodes.length === 0 ? (
              <p className="py-2 text-center text-xs text-zinc-600">
                Chưa có tài liệu nào. Tích chọn tài liệu ở danh sách bên dưới
                hoặc thêm mã trực tiếp.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {selectedCodes.map((code) => (
                  <Badge
                    key={code}
                    variant="outline"
                    className="flex items-center gap-1 border-amber-500/40 bg-amber-500/10 font-mono text-xs text-amber-300 py-1 px-2"
                  >
                    <span>{code}</span>
                    <button
                      type="button"
                      onClick={() => removeCode(code)}
                      className="ml-1 text-zinc-400 hover:text-red-300"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Quick add custom code */}
            <form
              onSubmit={handleAddCustomCode}
              className="mt-2.5 flex items-center gap-2 border-t border-white/5 pt-2"
            >
              <Input
                value={customCodeInput}
                onChange={(e) => setCustomCodeInput(e.target.value)}
                placeholder="Mã tài liệu tự do (VD: D-04)..."
                className="h-8 border-white/10 bg-[#181820] text-xs font-mono text-zinc-200 placeholder:font-sans placeholder:text-zinc-600"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="h-8 shrink-0 border-white/10 bg-white/5 text-xs text-zinc-300 hover:bg-white/10"
              >
                <Plus className="size-3.5 mr-1" />
                Thêm mã
              </Button>
            </form>
          </div>

          {/* Document Picker Catalog */}
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-[#141418] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
              {/* Category tabs */}
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: "all", label: "Tất cả" },
                    { id: "loi_khai", label: "Lời khai (Studio)" },
                    { id: "ly_lich", label: "Lý lịch (Studio)" },
                    { id: "evidence", label: "Vật chứng & Ảnh" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                      activeCategory === cat.id
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-60">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo mã hoặc tên..."
                  className="h-8 pl-8 text-xs border-white/10 bg-[#181820] text-zinc-200 placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Checklist list */}
            <div className="mt-2 flex-1 max-h-60 overflow-y-auto divide-y divide-white/5">
              {filteredDocs.length === 0 ? (
                <p className="py-6 text-center text-xs text-zinc-600">
                  Không tìm thấy tài liệu phù hợp với bộ lọc.
                </p>
              ) : (
                filteredDocs.map((doc) => {
                  const isChecked = selectedCodes.includes(doc.code);
                  return (
                    <div
                      key={doc.code}
                      onClick={() => toggleCode(doc.code)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-white/[0.03]",
                        isChecked && "bg-amber-500/[0.04]",
                      )}
                    >
                      {/* Checkbox circle */}
                      <div
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                          isChecked
                            ? "border-amber-400 bg-amber-500 text-black"
                            : "border-zinc-700 bg-transparent",
                        )}
                      >
                        {isChecked && <Check className="size-3 stroke-[3]" />}
                      </div>

                      {/* Code Badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 font-mono text-[11px] font-bold px-1.5 py-0.5",
                          isChecked
                            ? "border-amber-400/60 bg-amber-500/10 text-amber-300"
                            : "border-zinc-700 text-zinc-400",
                        )}
                      >
                        {doc.code}
                      </Badge>

                      {/* Title & Info */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-xs font-medium",
                            isChecked ? "text-zinc-100" : "text-zinc-300",
                          )}
                        >
                          {doc.title}
                        </p>
                        {doc.description && (
                          <p className="truncate text-[10px] text-zinc-500">
                            {doc.description}
                          </p>
                        )}
                      </div>

                      {/* Category tag */}
                      <span className="shrink-0 text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                        {doc.category === "loi_khai"
                          ? "Lời khai"
                          : doc.category === "ly_lich"
                            ? "Lý lịch"
                            : doc.kind === "pdf"
                              ? "PDF ngoài"
                              : "Ảnh"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
          <span className="text-xs text-zinc-500">
            Đã gán{" "}
            <strong className="text-amber-400">{selectedCodes.length}</strong>{" "}
            tài liệu vào {title || dossier.title}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-500 text-black hover:bg-amber-400"
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              ) : null}
              Lưu bộ hồ sơ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
