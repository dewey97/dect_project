"use client";

import { Loader2, Save, Trash2 } from "lucide-react";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Button } from "@/components/ui/button";
import { CheckpointIdentityForm } from "./sections/checkpoint-identity-form";
import { EvidencePickerConfigForm } from "./sections/evidence-picker-config-form";
import { SimpleAnswerConfigForm } from "./sections/simple-answer-config-form";
import { CheckpointHintsForm } from "./sections/checkpoint-hints-form";
import { CheckpointNarrativeForm } from "./sections/checkpoint-narrative-form";
import { CheckpointAiCheckForm } from "./sections/checkpoint-ai-check-form";
import { CheckpointEpilogueForm } from "./sections/checkpoint-epilogue-form";
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

  const isEvidencePicker = (draft.type || "evidence_picker") === "evidence_picker";
  const isEpilogue = draft.type === "epilogue" || draft.checkpointId.includes("epilogue");
  const canSave = isDirty && !isSaving && draft.title.trim().length > 0;

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
        <div className="min-w-0 space-y-5">
          <Section title="Thông tin">
            <CheckpointIdentityForm draft={draft} onChange={onChange} />
          </Section>

          {isEpilogue ? (
            <Section title="Nội dung Hậu Án (Ký sự sau phá án)">
              <CheckpointEpilogueForm draft={draft} onChange={onChange} />
            </Section>
          ) : (
            <>
              {isEvidencePicker ? (
                <Section title="Vật chứng thẩm tra">
                  <EvidencePickerConfigForm draft={draft} onChange={onChange} />
                </Section>
              ) : (
                <Section title="Đáp án">
                  <SimpleAnswerConfigForm draft={draft} onChange={onChange} />
                </Section>
              )}

              <Section title="Gợi ý">
                <CheckpointHintsForm draft={draft} onChange={onChange} />
              </Section>

              <Section title="Narrative">
                <CheckpointNarrativeForm draft={draft} onChange={onChange} />
              </Section>

              {/* AI check chỉ dành cho câu hỏi nhập văn bản / tự luận */}
              {draft.type === "text" && (
                <Section title="AI check (Đánh giá câu trả lời)">
                  <CheckpointAiCheckForm draft={draft} onChange={onChange} />
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
