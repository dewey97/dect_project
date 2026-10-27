"use client";

import { Play, Trash2, Save, Loader2 } from "lucide-react";
import type {
  DbCaseCheckpoint,
  DbCaseDossier,
  DbCaseCharacter,
} from "@/lib/types/database";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Button } from "@/components/ui/button";
import { CheckpointIdentityForm } from "./sections/checkpoint-identity-form";
import { SuspectInterrogationConfigForm } from "./sections/suspect-interrogation-config-form";
import { PhoneLookupConfigForm } from "./sections/phone-lookup-config-form";
import { FollowupConfigForm } from "./sections/followup-config-form";
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

  const effectiveKind =
    draft.kind ||
    (draft.type === "evidence_picker"
      ? "suspect_interrogation"
      : draft.type || "text");

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
        {isEpilogue ? (
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

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {onPlaytest && draft.checkpointId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPlaytest}
              className="h-7 px-2 text-[11px] border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 gap-1 cursor-pointer"
              title="Chơi thử vụ án từ checkpoint này (C4: Tự động mở khóa các node tiên quyết)"
            >
              <Play className="size-3 fill-amber-300" />
              <span>Chơi thử</span>
            </Button>
          )}

          {draft.id && !isEpilogue && (
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
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="min-w-0 space-y-4">
          {!isEpilogue && (
            <CheckpointIdentityForm
              draft={draft}
              dossiers={dossiers}
              characters={characters}
              checkpoints={checkpoints}
              onChange={onChange}
            />
          )}

          {isEpilogue ? (
            <CheckpointEpilogueForm
              draft={draft}
              checkpoints={checkpoints}
              onChange={onChange}
            />
          ) : (
            <>
              {/* Form đáp án theo kind */}
              {effectiveKind === "phone_lookup" && (
                <PhoneLookupConfigForm draft={draft} onChange={onChange} />
              )}

              {effectiveKind === "suspect_interrogation" && (
                <Section title="Thẩm tra nghi phạm (3 lớp)">
                  <SuspectInterrogationConfigForm
                    draft={draft}
                    onChange={onChange}
                  />
                </Section>
              )}

              {effectiveKind === "followup" && (
                <Section title="Cấu hình câu hỏi phụ">
                  <FollowupConfigForm
                    draft={draft}
                    checkpoints={checkpoints}
                    onChange={onChange}
                  />
                </Section>
              )}

              {effectiveKind === "indictment" && (
                <Section title="Cấu hình cáo trạng kết án">
                  <IndictmentConfigForm draft={draft} onChange={onChange} />
                </Section>
              )}

              {(effectiveKind === "choice" ||
                effectiveKind === "code" ||
                effectiveKind === "time" ||
                effectiveKind === "text") && (
                <>
                  <Section title="Đáp án">
                    <SimpleAnswerConfigForm draft={draft} onChange={onChange} />
                  </Section>

                  <Section title="Gợi ý">
                    <CheckpointHintsForm draft={draft} onChange={onChange} />
                  </Section>
                </>
              )}

              {/* Gợi ý cho phone_lookup / followup / indictment nếu chưa có trong form riêng */}
              {(effectiveKind === "phone_lookup" ||
                effectiveKind === "followup" ||
                effectiveKind === "indictment") && (
                <Section title="Gợi ý">
                  <CheckpointHintsForm draft={draft} onChange={onChange} />
                </Section>
              )}

              <Section title="Narrative (Lời dẫn / Độc thoại)">
                <CheckpointNarrativeForm draft={draft} onChange={onChange} />
              </Section>

              {/* AI check dành cho câu hỏi nhập văn bản / tự luận */}
              {(effectiveKind === "text" || draft.type === "text") && (
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
