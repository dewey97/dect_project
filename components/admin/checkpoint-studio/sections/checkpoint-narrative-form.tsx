"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Textarea } from "@/components/ui/textarea";

interface CheckpointNarrativeFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

export function CheckpointNarrativeForm({
  draft,
  onChange,
}: CheckpointNarrativeFormProps) {
  return (
    <Textarea
      value={draft.narrative}
      onChange={(event) => onChange({ narrative: event.target.value })}
      placeholder="Độc thoại dẫn truyện…"
      className="min-h-24 border-white/10 bg-black/30 text-xs leading-relaxed"
    />
  );
}
