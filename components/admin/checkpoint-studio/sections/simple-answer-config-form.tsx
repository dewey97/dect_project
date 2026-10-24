"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CodeChipInput } from "../code-chip-input";

interface SimpleAnswerConfigFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const INPUT_CLASS = "h-7 border-white/10 bg-black/30 text-xs";

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
    <div className="space-y-2">
      {type === "choice" ? (
        <>
          <Field label="Các phương án lựa chọn">
            <CodeChipInput
              value={config.options || []}
              onChange={(options) => setConfig({ options })}
              className="min-h-8"
            />
          </Field>

          <Field label="Đáp án đúng" required>
            <Input
              value={config.correctAnswer || ""}
              onChange={(event) =>
                setConfig({ correctAnswer: event.target.value })
              }
              className={INPUT_CLASS}
            />
          </Field>
        </>
      ) : (
        <Input
          value={config.correctAnswer || ""}
          onChange={(event) => setConfig({ correctAnswer: event.target.value })}
          className={INPUT_CLASS}
        />
      )}
    </div>
  );
}
