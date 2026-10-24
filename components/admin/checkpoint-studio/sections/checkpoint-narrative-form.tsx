"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";

interface CheckpointNarrativeFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

export function CheckpointNarrativeForm({
  draft,
  onChange,
}: CheckpointNarrativeFormProps) {
  return (
    <AutoGrowTextarea
      value={draft.narrative}
      onChange={(event) => onChange({ narrative: event.target.value })}
      minRows={1}
      className="min-h-8"
    />
  );
}
