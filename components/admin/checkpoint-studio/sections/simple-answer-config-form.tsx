"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Input } from "@/components/ui/input";
import { CodeChipInput } from "../code-chip-input";

interface SimpleAnswerConfigFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const INPUT_CLASS = "h-7 border-white/10 bg-black/30 text-xs";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="flex items-baseline gap-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
        {required && <span className="text-amber-400">*</span>}
      </span>
      {children}
    </label>
  );
}

export function SimpleAnswerConfigForm({
  draft,
  onChange,
}: SimpleAnswerConfigFormProps) {
  const type = draft.type || "choice";
  const config = draft.answerConfig;

  const setConfig = (patch: Partial<typeof config>) => {
    onChange({ answerConfig: { ...config, ...patch } });
  };

  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-2.5">
      {type === "choice" && (
        <Field label="Các phương án lựa chọn (Options)">
          <CodeChipInput
            value={config.options || []}
            onChange={(options) => setConfig({ options })}
            placeholder="Nhập phương án rồi Enter…"
            className="min-h-8"
          />
        </Field>
      )}

      <Field label="Đáp án chính xác" required>
        <Input
          value={config.correctAnswer || ""}
          onChange={(event) =>
            setConfig({ correctAnswer: event.target.value })
          }
          placeholder={
            type === "time"
              ? "vd: 21:15, 03:30…"
              : type === "code"
                ? "vd: 120713, PASSCODE…"
                : "Nhập đáp án đúng…"
          }
          className={INPUT_CLASS}
        />
      </Field>
    </div>
  );
}
