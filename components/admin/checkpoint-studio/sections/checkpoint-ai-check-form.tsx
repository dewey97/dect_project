"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Textarea } from "@/components/ui/textarea";

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
        <Textarea
          value={draft.aiContext}
          onChange={(event) => onChange({ aiContext: event.target.value })}
          placeholder="Sự thật, bằng chứng và logic để chấm…"
          className="min-h-20 border-white/10 bg-black/30 text-xs leading-relaxed"
        />
      </Field>

      <Field label="Mẫu ĐẠT">
        <Textarea
          value={draft.aiValidCases.join("\n")}
          onChange={(event) =>
            onChange({ aiValidCases: event.target.value.split("\n") })
          }
          placeholder="Mỗi dòng một câu trả lời mẫu"
          className="min-h-20 border-white/10 bg-black/30 font-mono text-xs leading-relaxed"
        />
      </Field>

      <Field label="Mẫu TRƯỢT">
        <Textarea
          value={draft.aiInvalidCases.join("\n")}
          onChange={(event) =>
            onChange({ aiInvalidCases: event.target.value.split("\n") })
          }
          placeholder="Mỗi dòng một câu trả lời mẫu"
          className="min-h-20 border-white/10 bg-black/30 font-mono text-xs leading-relaxed"
        />
      </Field>
    </div>
  );
}
