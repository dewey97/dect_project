"use client";

import React, { useState, useEffect } from "react";
import type { DbCaseBoardNode, BoardNodeKind } from "@/lib/types/database";
import type { PinPoint } from "@/components/investigation/hero-interactive";
import type { BoardNodeDraft } from "@/lib/actions/board-actions";
import { Button } from "@/components/ui/button";
import { X, Trash2, Save } from "lucide-react";

interface BoardNodeFormProps {
  caseId: string;
  node: DbCaseBoardNode | PinPoint | null;
  onSave: (draft: BoardNodeDraft) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onClose: () => void;
}

const NODE_KINDS: Array<{ value: BoardNodeKind; label: string }> = [
  { value: "victim", label: "Nạn nhân (Victim)" },
  { value: "victim_phone", label: "Điện thoại nạn nhân" },
  { value: "reinvestigate", label: "Khám xét hiện trường" },
  { value: "suspects_hub", label: "Hub Nghi phạm" },
  { value: "evidence_hub", label: "Hub Vật chứng" },
  { value: "note", label: "Giấy ghi chú (Note)" },
  { value: "photo", label: "Ghim ảnh hiện trường/vật chứng" },
  { value: "dossier", label: "Hồ sơ tài liệu" },
  { value: "custom", label: "Tự do (Custom)" },
];

export function BoardNodeForm({
  caseId,
  node,
  onSave,
  onDelete,
  onClose,
}: BoardNodeFormProps) {
  const isDbNode = node && "case_slug" in node;
  const dbNode = isDbNode ? (node as DbCaseBoardNode) : null;
  const pinNode = !isDbNode && node ? (node as PinPoint) : null;

  const [title, setTitle] = useState("");
  const [nodeKind, setNodeKind] = useState<BoardNodeKind>("note");
  const [subjectKey, setSubjectKey] = useState("");
  const [pinTitle, setPinTitle] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [scale, setScale] = useState(1.0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dbNode) {
      setTitle(dbNode.title || "");
      setNodeKind(dbNode.node_kind as BoardNodeKind);
      setSubjectKey(dbNode.subject_key || "");
      const cfg = (dbNode.config as any) || {};
      setPinTitle(cfg.pin_title || "");
      setPhotoUrl(cfg.photo_url || "");
      setScale(cfg.scale ?? 1.0);
    } else if (pinNode) {
      setTitle(pinNode.label || "");
      setNodeKind((pinNode.nodeKind as BoardNodeKind) || "custom");
      setSubjectKey(pinNode.subjectKey || "");
      setPinTitle(pinNode.label || "");
      setPhotoUrl(pinNode.photoUrl || "");
      setScale(pinNode.scale ?? 1.0);
    } else {
      setTitle("");
      setNodeKind("note");
      setSubjectKey("");
      setPinTitle("");
      setPhotoUrl("");
      setScale(1.0);
    }
  }, [dbNode, pinNode]);

  if (!node) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cfg = dbNode ? ((dbNode.config as any) || {}) : {};
      const draft: BoardNodeDraft = {
        id: node.id,
        caseId,
        nodeKind,
        title: title.trim() || undefined,
        subjectKey: subjectKey.trim() || undefined,
        checkpointId: dbNode?.checkpoint_id || undefined,
        slotIndex: dbNode?.slot_index ?? 0,
        config: {
          ...cfg,
          pin_title: pinTitle.trim() || title.trim(),
          photo_url: photoUrl.trim() || undefined,
          scale,
        },
      };

      const success = await onSave(draft);
      if (success) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#121217] text-zinc-100 border-l border-white/10 w-80 shrink-0">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Biên tập Node Bảng
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-4 text-xs">
        <div>
          <label className="mb-1 block font-mono text-[10px] text-zinc-400 uppercase">
            Mã định danh (ID)
          </label>
          <input
            type="text"
            readOnly
            value={node.id}
            className="w-full rounded bg-zinc-900 border border-white/10 px-2.5 py-1.5 font-mono text-[11px] text-zinc-400 select-all"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[10px] text-zinc-300 uppercase">
            Loại Node (node_kind)
          </label>
          <select
            value={nodeKind}
            onChange={(e) => setNodeKind(e.target.value as BoardNodeKind)}
            className="w-full rounded bg-zinc-800 border border-white/10 px-2.5 py-1.5 text-zinc-100 focus:border-amber-400 focus:outline-none"
          >
            {NODE_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block font-mono text-[10px] text-zinc-300 uppercase">
            Tiêu đề Node
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Nạn nhân, Hiện trường…"
            className="w-full rounded bg-zinc-800 border border-white/10 px-2.5 py-1.5 text-zinc-100 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[10px] text-zinc-300 uppercase">
            Tên ghim hiển thị (pin_title)
          </label>
          <input
            type="text"
            value={pinTitle}
            onChange={(e) => setPinTitle(e.target.value)}
            placeholder="Để trống nếu dùng theo tiêu đề"
            className="w-full rounded bg-zinc-800 border border-white/10 px-2.5 py-1.5 text-zinc-100 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[10px] text-zinc-300 uppercase">
            Mã đối tượng (subject_key)
          </label>
          <input
            type="text"
            value={subjectKey}
            onChange={(e) => setSubjectKey(e.target.value)}
            placeholder="VD: victim, suspect_a..."
            className="w-full rounded bg-zinc-800 border border-white/10 px-2.5 py-1.5 text-zinc-100 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[10px] text-zinc-300 uppercase">
            Đường dẫn ảnh (photo_url)
          </label>
          <input
            type="text"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="/images/... hoặc URL cdn"
            className="w-full rounded bg-zinc-800 border border-white/10 px-2.5 py-1.5 text-zinc-100 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[10px] text-zinc-300 uppercase">
            Tỉ lệ hiển thị (scale: {scale})
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full accent-amber-400"
          />
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-white/10">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(node.id)}
            className="gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/50"
          >
            <Trash2 className="size-3.5" />
            Xóa Node
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            <Save className="size-3.5" />
            Lưu
          </Button>
        </div>
      </form>
    </div>
  );
}
