"use client";

import { Trash2, Eye, EyeOff, Bot, ChevronDown } from "lucide-react";
import type {
  DbCaseCheckpoint,
  DbCaseDossier,
  DbCaseCharacter,
} from "@/lib/types/database";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Button } from "@/components/ui/button";
import { CheckpointIdentityForm } from "./sections/checkpoint-identity-form";
import { CheckpointBoardDisplayForm } from "./sections/checkpoint-board-display-form";
import { SuspectInterrogationConfigForm } from "./sections/suspect-interrogation-config-form";
import { PhoneLookupConfigForm } from "./sections/phone-lookup-config-form";
import { IndictmentConfigForm } from "./sections/indictment-config-form";
import { SimpleAnswerConfigForm } from "./sections/simple-answer-config-form";
import { CheckpointHintsForm } from "./sections/checkpoint-hints-form";
import { CheckpointNarrativeForm } from "./sections/checkpoint-narrative-form";
import { CheckpointAiCheckForm } from "./sections/checkpoint-ai-check-form";
import { CheckpointEpilogueForm } from "./sections/checkpoint-epilogue-form";
import { cn } from "@/lib/utils";

interface CheckpointEditorProps {
  draft: CheckpointStudioDraft | null;
  dossiers?: DbCaseDossier[];
  characters?: DbCaseCharacter[];
  checkpoints?: DbCaseCheckpoint[];
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
  onSave: () => void;
  onDelete: () => void;
  onPlaytest?: () => void;
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
  dossiers = [],
  characters = [],
  checkpoints = [],
  onChange,
  onSave,
  onDelete,
  onPlaytest,
  isSaving,
  isDirty,
}: CheckpointEditorProps) {
  if (!draft) return null;

  const isEpilogue =
    draft.kind === "epilogue" ||
    draft.type === "epilogue" ||
    draft.checkpointId.includes("epilogue");

  const isIndictment =
    draft.kind === "indictment" ||
    draft.type === "indictment" ||
    draft.checkpointId.includes("indictment");

  const rawKind = draft.kind || draft.type || "text";
  const effectiveKind =
    rawKind === "followup"
      ? (draft.questionType || draft.type || "code")
      : rawKind === "time"
        ? "code"
        : rawKind === "evidence_picker" || rawKind === "suspect_interrogation"
          ? "suspect_interrogation"
          : rawKind;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#0a0a0d] overflow-hidden">
      <header className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#0b0b0e]/95 px-3 py-2">
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            isDirty ? "bg-amber-400" : "bg-zinc-700",
          )}
          title={isDirty ? "Chưa lưu" : "Đã lưu"}
        />
        {isIndictment ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Kết luận
            </span>
          </div>
        ) : isEpilogue ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Hậu án
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              (
              {Array.isArray(draft.answerConfig?.epilogueStories)
                ? draft.answerConfig.epilogueStories.length
                : 1}{" "}
              phần)
            </span>
          </div>
        ) : (
          <input
            value={draft.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Tiêu đề checkpoint..."
            aria-label="Tiêu đề checkpoint"
            className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-zinc-100 outline-none border-b border-transparent focus:border-amber-500/50 hover:bg-white/[0.04] px-1.5 py-0.5 rounded transition-colors"
          />
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {!isEpilogue && !isIndictment && (
            <button
              type="button"
              onClick={() => {
                onChange({
                  boardConfig: {
                    ...(draft.boardConfig || {}),
                    hidden: !draft.boardConfig?.hidden,
                  },
                });
              }}
              className={cn(
                "h-7 w-7 flex items-center justify-center rounded border transition-colors cursor-pointer",
                !draft.boardConfig?.hidden
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                  : "border-white/10 bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300",
              )}
              title={
                draft.boardConfig?.hidden
                  ? "Ghim đang ẩn khỏi bảng (Bấm để hiển thị)"
                  : "Đang hiển thị ghim trên bảng (Bấm để ẩn)"
              }
            >
              {draft.boardConfig?.hidden ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </button>
          )}

          {draft.id && !isEpilogue && !isIndictment && (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              onClick={onDelete}
              disabled={isSaving}
              title="Xóa checkpoint"
              className="h-7 w-7"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="min-w-0 space-y-4">
          {!isEpilogue && !isIndictment && (
            <CheckpointIdentityForm
              draft={draft}
              dossiers={dossiers}
              characters={characters}
              checkpoints={checkpoints}
              onChange={onChange}
            />
          )}

          {!isEpilogue && (
            <CheckpointBoardDisplayForm
              draft={draft}
              characters={characters}
              onChange={onChange}
            />
          )}

          {isEpilogue ? (
            <CheckpointEpilogueForm
              draft={draft}
              checkpoints={checkpoints}
              onChange={onChange}
            />
          ) : isIndictment ? (
            <>
              <IndictmentConfigForm draft={draft} onChange={onChange} />
              <Section title="Lời dẫn">
                <CheckpointNarrativeForm draft={draft} onChange={onChange} />
              </Section>
            </>
          ) : (
            <>
              {/* Form đáp án theo kind */}
              {effectiveKind === "phone_lookup" && (
                <PhoneLookupConfigForm draft={draft} onChange={onChange} />
              )}

              {(effectiveKind === "suspect_interrogation" ||
                effectiveKind === "evidence_picker") && (
                <Section title="Cấu hình Chọn tài liệu (Động cơ & Mâu thuẫn)">
                  <SuspectInterrogationConfigForm
                    draft={draft}
                    onChange={onChange}
                  />
                </Section>
              )}

              {(effectiveKind === "choice" ||
                effectiveKind === "code" ||
                effectiveKind === "time" ||
                effectiveKind === "text") && (
                <>
                  <SimpleAnswerConfigForm draft={draft} onChange={onChange} />

                  {/* Đối với Tự do: AI check thu gọn/mở rộng ngay bên dưới đáp án */}
                  {(effectiveKind === "text" || draft.type === "text") && (
                    <details className="group rounded-md border border-white/5 bg-[#121216] p-2 text-xs">
                      <summary className="flex cursor-pointer select-none items-center justify-between text-zinc-400 hover:text-zinc-200 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Bot className="size-3.5 text-purple-400" />
                          <span>AI Check (Đánh giá ngữ nghĩa tự do)</span>
                        </span>
                        <ChevronDown className="size-3.5 transition-transform group-open:rotate-180 text-zinc-500" />
                      </summary>
                      <div className="mt-2.5 pt-2 border-t border-white/5">
                        <CheckpointAiCheckForm draft={draft} onChange={onChange} />
                      </div>
                    </details>
                  )}

                  <CheckpointHintsForm
                    draft={draft}
                    onChange={onChange}
                    title="Gợi ý"
                  />
                </>
              )}

              {effectiveKind === "phone_lookup" && (
                <CheckpointHintsForm
                  draft={draft}
                  onChange={onChange}
                  title="Gợi ý"
                />
              )}

              <Section title="Lời dẫn">
                <CheckpointNarrativeForm draft={draft} onChange={onChange} />
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
