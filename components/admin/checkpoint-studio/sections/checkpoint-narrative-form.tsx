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
    <div className="space-y-2">
      <Textarea
        value={draft.narrative}
        onChange={(event) => onChange({ narrative: event.target.value })}
        placeholder="Đoạn độc thoại dẫn truyện chạy typewriter khi mở checkpoint…"
        className="min-h-40 border-white/10 bg-black/30 text-sm leading-relaxed"
      />
      <p className="text-[11px] leading-relaxed text-zinc-500">
        Mapping runtime: <code className="text-zinc-400">monologue</code> = nội
        dung trên, <code className="text-zinc-400">date</code> = bộ hồ sơ,{" "}
        <code className="text-zinc-400">subtitle</code> = tiêu đề checkpoint.
        Để trống nếu checkpoint không có cinematic.
      </p>
    </div>
  );
}
