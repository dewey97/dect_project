"use client";

import type { DbCaseCheckpoint } from "@/lib/types/database";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CodeChipInput } from "../code-chip-input";

interface FollowupConfigFormProps {
  draft: CheckpointStudioDraft;
  checkpoints?: DbCaseCheckpoint[];
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const INPUT_CLASS = "h-7 border-white/10 bg-black/40 text-xs text-zinc-100";

const FOLLOWUP_TYPES = [
  { value: "code", label: "So khớp" },
  { value: "choice", label: "Trắc nghiệm" },
  { value: "text", label: "Tự do" },
];

export function FollowupConfigForm({
  draft,
  onChange,
}: FollowupConfigFormProps) {
  const config = draft.answerConfig;
  const rawQuestionType = draft.questionType || "code";
  const questionType = rawQuestionType === "time" ? "code" : rawQuestionType;

  const setConfig = (patch: Partial<typeof config>) => {
    onChange({ answerConfig: { ...config, ...patch } });
  };

  return (
    <div className="space-y-3">
      <Field label="Loại câu hỏi phụ" required>
        <select
          value={questionType}
          onChange={(e) =>
            onChange({
              questionType: e.target.value,
              type: e.target.value,
            })
          }
          className="h-7 w-full rounded-md border border-white/10 bg-[#121216] px-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
        >
          {FOLLOWUP_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Phương án trắc nghiệm nếu là choice */}
      {questionType === "choice" && (
        <Field label="Các phương án lựa chọn (Enter để thêm)" required>
          <CodeChipInput
            value={config.options || []}
            onChange={(options) => setConfig({ options })}
            placeholder="Nhập phương án rồi Enter..."
            className="min-h-8 border-white/10 bg-black/40"
          />
        </Field>
      )}

      {/* Đáp án đúng */}
      <Field
        label={
          questionType === "code" || questionType === "time"
            ? "Đáp án so khớp"
            : "Đáp án đúng"
        }
        required
      >
        <Input
          value={config.correctAnswer || ""}
          onChange={(e) => setConfig({ correctAnswer: e.target.value })}
          placeholder={
            questionType === "code" || questionType === "time"
              ? "120713 hoặc 21:15"
              : "Nhập đáp án đúng..."
          }
          className={INPUT_CLASS}
        />
      </Field>
    </div>
  );
}
