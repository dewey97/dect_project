"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { AutoExpandingTextarea } from "../auto-expanding-textarea";

interface CheckpointAiCheckFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export function CheckpointAiCheckForm({
  draft,
  onChange,
}: CheckpointAiCheckFormProps) {
  return (
    <div className="space-y-2">
      <Field label="Bối cảnh">
        <AutoExpandingTextarea
          value={draft.aiContext}
          onChange={(event) => onChange({ aiContext: event.target.value })}
          minRows={1}
          className="min-h-8"
        />
      </Field>

      <Field label="Mẫu ĐẠT">
        <AutoExpandingTextarea
          value={draft.aiValidCases.join("\n")}
          onChange={(event) =>
            onChange({ aiValidCases: event.target.value.split("\n") })
          }
          minRows={1}
          className="min-h-8 font-mono"
        />
      </Field>

      <Field label="Mẫu TRƯỢT">
        <AutoExpandingTextarea
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
