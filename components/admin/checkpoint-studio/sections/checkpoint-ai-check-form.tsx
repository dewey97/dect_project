"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Field } from "@/components/ui/field";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";

interface CheckpointAiCheckFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

export function CheckpointAiCheckForm({
  draft,
  onChange,
}: CheckpointAiCheckFormProps) {
  return (
    <div className="space-y-2">
      <Field label="Bối cảnh">
        <AutoGrowTextarea
          value={draft.aiContext}
          onChange={(event) => onChange({ aiContext: event.target.value })}
          minRows={1}
          className="min-h-8"
        />
      </Field>

      <Field label="Mẫu ĐẠT">
        <AutoGrowTextarea
          value={draft.aiValidCases.join("\n")}
          onChange={(event) =>
            onChange({ aiValidCases: event.target.value.split("\n") })
          }
          minRows={1}
          className="min-h-8 font-mono"
        />
      </Field>

      <Field label="Mẫu TRƯỢT">
        <AutoGrowTextarea
          value={draft.aiInvalidCases.join("\n")}
          onChange={(event) =>
            onChange({ aiInvalidCases: event.target.value.split("\n") })
          }
          minRows={1}
          className="min-h-8 font-mono"
        />
      </Field>
    </div>
  );
}
