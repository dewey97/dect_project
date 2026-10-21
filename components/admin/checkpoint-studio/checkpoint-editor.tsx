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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h3>
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
  if (!draft) return null;

  const isEditable = draft.type === "evidence_picker";
  const canSave =
    isEditable &&
    isDirty &&
    !isSaving &&
    (draft.nodeId.trim().length > 0 || draft.checkpointId.trim().length > 0);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#0a0a0d]">
      <header className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#0b0b0e]/95 px-3 py-2">
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            isDirty ? "bg-amber-400" : "bg-zinc-700",
          )}
          title={isDirty ? "Chưa lưu" : "Đã lưu"}
        />
        <h2 className="min-w-0 truncate text-xs font-semibold text-zinc-100">
          {draft.title || "Checkpoint mới"}
        </h2>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {draft.id && (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              onClick={onDelete}
              disabled={isSaving}
              title="Xóa checkpoint"
            >
              <Trash2 className="size-3.5" />
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

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {!isEditable && (
          <p className="mb-3 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[11px] text-zinc-400">
            Chỉ đọc — loại{" "}
            <span className="font-mono text-zinc-200">{draft.type}</span>.
          </p>
        )}

        <fieldset
          disabled={!isEditable}
          className="min-w-0 space-y-5 disabled:opacity-70"
        >
          <Section title="Thông tin">
            <CheckpointIdentityForm draft={draft} onChange={onChange} />
          </Section>

          <Section title="Đáp án">
            <EvidencePickerConfigForm draft={draft} onChange={onChange} />
          </Section>

          <Section title="Gợi ý">
            <CheckpointHintsForm draft={draft} onChange={onChange} />
          </Section>

          <Section title="Narrative">
            <CheckpointNarrativeForm draft={draft} onChange={onChange} />
          </Section>

          <Section title="AI check">
            <CheckpointAiCheckForm draft={draft} onChange={onChange} />
          </Section>
        </fieldset>
      </div>
    </div>
  );
}
