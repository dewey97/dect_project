"use client";

import { Loader2, Save, Trash2 } from "lucide-react";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Button } from "@/components/ui/button";
import { CheckpointIdentityForm } from "./sections/checkpoint-identity-form";
import { EvidencePickerConfigForm } from "./sections/evidence-picker-config-form";
import { CheckpointHintsForm } from "./sections/checkpoint-hints-form";
import { CheckpointNarrativeForm } from "./sections/checkpoint-narrative-form";
import { CheckpointAiCheckForm } from "./sections/checkpoint-ai-check-form";
import { cn } from "@/lib/utils";

interface CheckpointEditorProps {
  draft: CheckpointStudioDraft | null;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isDirty: boolean;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        <p className="text-[11px] text-zinc-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function CheckpointEditor({
  draft,
  onChange,
  onSave,
  onDelete,
  isSaving,
  isDirty,
}: CheckpointEditorProps) {
  if (!draft) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-600">
            Checkpoint Studio
          </p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-200">
            Chọn hoặc tạo một checkpoint
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Dữ liệu tại đây là nguồn runtime của game. Lưu trong Studio sẽ cập
            nhật checkpoint mà người chơi tải từ Supabase.
          </p>
        </div>
      </div>
    );
  }

  const isEditable = draft.type === "evidence_picker";
  const displayNode = draft.nodeId.trim() || draft.checkpointId.trim();
  const canSave =
    isEditable &&
    isDirty &&
    !isSaving &&
    (draft.nodeId.trim().length > 0 || draft.checkpointId.trim().length > 0);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#0a0a0d]">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#0b0b0e]/95 px-4 py-3 backdrop-blur-md">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-zinc-100">
              {draft.title || displayNode || "Checkpoint mới"}
            </h2>
            <span className="shrink-0 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-amber-300">
              {draft.type || "evidence_picker"}
            </span>
            <span className="shrink-0 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-500">
              Live
            </span>
          </div>
          <p className="truncate font-mono text-[11px] text-zinc-500">
            node {displayNode || "chưa có"} · nguồn runtime
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              "hidden text-[11px] sm:inline",
              isDirty ? "text-amber-300" : "text-zinc-600",
            )}
          >
            {isDirty ? "Chưa lưu" : "Đã lưu"}
          </span>

          {draft.id && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isSaving}
              title="Xóa checkpoint"
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">Xóa</span>
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={!canSave}
            className="bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {isSaving ? "Đang lưu…" : "Lưu"}
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-4 py-5 md:px-6">
        {!isEditable && (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs leading-relaxed text-zinc-400">
            Loại <span className="font-mono text-zinc-200">{draft.type}</span>{" "}
            chưa có editor trong V1. Dữ liệu đã import được giữ nguyên và chỉ
            đọc; không thể lưu đè từ Studio.
          </div>
        )}

        <fieldset disabled={!isEditable} className="min-w-0 space-y-8">
          <Section
            title="Thông tin checkpoint"
            description="Định danh, vị trí trên board và liên kết mở khóa."
          >
            <CheckpointIdentityForm draft={draft} onChange={onChange} />
          </Section>

          <Section
            title="Cấu hình đáp án"
            description="Mã chứng cứ bắt buộc và tùy chọn cho 3 lớp thẩm tra."
          >
            <EvidencePickerConfigForm draft={draft} onChange={onChange} />
          </Section>

          <Section
            title="Gợi ý đa cấp"
            description="Mỗi nhóm có thứ tự từ gợi ý mở đến đáp án gợi mở."
          >
            <CheckpointHintsForm draft={draft} onChange={onChange} />
          </Section>

          <Section
            title="Narrative"
            description="Độc thoại dẫn truyện của checkpoint."
          >
            <CheckpointNarrativeForm draft={draft} onChange={onChange} />
          </Section>

          <Section
            title="AI check"
            description="Bối cảnh và few-shot dùng khi chấm lập luận thẩm tra."
          >
            <CheckpointAiCheckForm draft={draft} onChange={onChange} />
          </Section>
        </fieldset>
      </div>
    </div>
  );
}
