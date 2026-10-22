"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  Search,
  Check,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AutoExpandingTextarea } from "./auto-expanding-textarea";
import type { DbCaseDossier } from "@/lib/types/database";
import type { AvailableDocumentItem } from "@/lib/actions/dossier-config-actions";
import { saveCaseDossier } from "@/lib/actions/dossier-config-actions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { slugifyVietnamese } from "@/lib/text";

interface DossierEditorProps {
  caseId?: string;
  dossier: DbCaseDossier | null;
  availableDocuments: AvailableDocumentItem[];
  onSaved: (updated: DbCaseDossier) => void;
  onClose: () => void;
}

export function DossierEditor({
  caseId = "case_000",
  dossier,
  availableDocuments,
  onSaved,
  onClose,
}: DossierEditorProps) {
  const [title, setTitle] = useState("");
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
      setDescription(dossier.description || "");
      setSelectedCodes(dossier.document_codes || []);
    } else {
      setTitle("");
      setDescription("");
      setSelectedCodes([]);
    }
    setSearchQuery("");
    setCustomCodeInput("");
  }, [dossier]);

  if (!dossier) return null;

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

  const filteredDocs = availableDocuments.filter((doc) => {
    if (activeCategory !== "all" && doc.category !== activeCategory) return false;
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

    // Tự động sinh khóa định danh (key) ở phía sau từ title hoặc giữ key cũ
    const generatedKey = slugifyVietnamese(title.trim());

    const finalKey = dossier.dossier_key || generatedKey || "bo_ho_so";

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
        toast.success(`Đã lưu "${res.dossier.title}" (${res.dossier.document_codes.length} tài liệu)`);
        onSaved(res.dossier);
      } else {
        toast.error(res.error || "Không lưu được bộ hồ sơ");
      }
    } catch (error: any) {
      toast.error(error?.message || "Lỗi lưu bộ hồ sơ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0a0a0d]">
      {/* Top Header: Cho sửa tiêu đề trực tiếp, bỏ text phụ */}
      <div className="flex shrink-0 items-center justify-between border-b border-purple-500/20 bg-purple-950/20 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <FolderOpen className="size-4 shrink-0 text-purple-400" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs font-bold text-purple-200 outline-none border-b border-transparent focus:border-purple-400 hover:bg-white/[0.04] px-1.5 py-0.5 rounded transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          title="Đóng"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Scrollable Content: Phẳng, không đóng hộp viền lồng nhau */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-3 text-xs">
        {/* Mô tả tóm tắt: 1 line tự động mở rộng */}
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-500 font-semibold">
            Mô tả
          </label>
          <AutoExpandingTextarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minRows={1}
            className="min-h-8 border-white/10 bg-black/40 text-xs text-zinc-200 focus:border-purple-500/50"
          />
        </div>

        {/* Danh sách tài liệu đã gán */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold flex items-center gap-1.5">
              <span>Tài liệu trong bộ</span>
              {selectedCodes.length > 0 && (
                <span className="rounded-full bg-purple-500/20 px-1.5 py-0.2 text-[9px] text-purple-300 font-mono">
                  {selectedCodes.length}
                </span>
              )}
            </span>

            {selectedCodes.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCodes([])}
                className="text-[10px] text-red-400/80 hover:text-red-300 transition-colors"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1 p-1.5 rounded-md border border-white/10 bg-black/30">
            {selectedCodes.length === 0 ? (
              <p className="py-1 px-1 text-[11px] text-zinc-500">
                Chưa gán tài liệu nào.
              </p>
            ) : (
              selectedCodes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 rounded bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-purple-200"
                >
                  {code}
                  <button
                    type="button"
                    onClick={() => removeCode(code)}
                    className="text-purple-400/70 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Nhập mã tự do */}
          <form onSubmit={handleAddCustomCode} className="mt-1.5 flex gap-1.5">
            <Input
              value={customCodeInput}
              onChange={(e) => setCustomCodeInput(e.target.value)}
              className="h-7 border-white/10 bg-black/40 text-[11px] text-zinc-200 focus:border-purple-500/50"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-7 shrink-0 border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 px-2 text-xs"
            >
              <Plus className="size-3 mr-1" /> Thêm
            </Button>
          </form>
        </div>

        {/* Danh mục tài liệu vụ án */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold">
              Kho tài liệu ({filteredDocs.length})
            </span>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-1 mb-1.5">
            {(
              [
                { id: "all", label: "Tất cả" },
                { id: "loi_khai", label: "Lời khai" },
                { id: "ly_lich", label: "Lý lịch" },
                { id: "evidence", label: "Vật chứng" },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                  activeCategory === cat.id
                    ? "bg-purple-500/25 text-purple-300 font-semibold"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative mb-1.5">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-7 text-[11px] border-white/10 bg-[#121218] text-zinc-200 focus:border-purple-500/50"
            />
          </div>

          {/* Checklist list: Cho tràn xuống dưới tự nhiên, không giới hạn chiều cao gây scroll lồng */}
          <div className="divide-y divide-white/5 rounded-md border border-white/10 bg-black/30">
            {filteredDocs.length === 0 ? (
              <p className="py-4 text-center text-xs text-zinc-600">
                Không có tài liệu nào.
              </p>
            ) : (
              filteredDocs.map((doc) => {
                const isChecked = selectedCodes.includes(doc.code);
                return (
                  <div
                    key={doc.code}
                    onClick={() => toggleCode(doc.code)}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1.5 cursor-pointer transition-colors hover:bg-white/[0.04]",
                      isChecked && "bg-purple-500/[0.06]",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-3.5 shrink-0 items-center justify-center rounded border transition-colors",
                        isChecked
                          ? "border-purple-400 bg-purple-500 text-white"
                          : "border-zinc-700 bg-transparent",
                      )}
                    >
                      {isChecked && <Check className="size-2.5 stroke-[3]" />}
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 font-mono text-[10px] font-bold px-1.5 py-0",
                        isChecked
                          ? "border-purple-400/60 bg-purple-500/20 text-purple-200"
                          : "border-zinc-700 text-zinc-400",
                      )}
                    >
                      {doc.code}
                    </Badge>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-[11px] font-medium",
                          isChecked ? "text-zinc-100" : "text-zinc-300",
                        )}
                      >
                        {doc.title}
                      </p>
                    </div>

                    <span className="shrink-0 text-[9px] uppercase tracking-wider text-zinc-600 font-mono">
                      {doc.category === "loi_khai"
                        ? "Khai"
                        : doc.category === "ly_lich"
                          ? "Lý lịch"
                          : "Chứng cứ"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-white/10 bg-[#0e0e13] px-3 py-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isSaving}
          className="border-white/10 text-xs"
        >
          Đóng
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          className="bg-purple-600 text-white hover:bg-purple-500 text-xs font-semibold"
        >
          {isSaving ? (
            <Loader2 className="size-3.5 animate-spin mr-1" />
          ) : null}
          Lưu bộ hồ sơ
        </Button>
      </div>
    </div>
  );
}
