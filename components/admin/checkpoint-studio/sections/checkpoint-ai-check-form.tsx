"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Textarea } from "@/components/ui/textarea";

interface CheckpointAiCheckFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

export function CheckpointAiCheckForm({
  draft,
  onChange,
}: CheckpointAiCheckFormProps) {
  return (
    <div className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Bối cảnh chấm AI (ai_context)
        </span>
        <Textarea
          value={draft.aiContext}
          onChange={(event) => onChange({ aiContext: event.target.value })}
          placeholder="Sự thật khách quan, bằng chứng và logic để Gemini chấm lập luận của người chơi…"
          className="min-h-32 border-white/10 bg-black/30 text-sm leading-relaxed"
        />
        <span className="block text-[11px] leading-relaxed text-zinc-500">
          Khi có dữ liệu, bối cảnh này được dùng thay cho từ điển tĩnh trong
          code. Không đưa plot twist của nghi phạm khác vào đây.
        </span>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Few-shot ĐẠT
          </span>
          <Textarea
            value={draft.aiValidCases.join("\n")}
            onChange={(event) =>
              onChange({ aiValidCases: event.target.value.split("\n") })
            }
            placeholder={"Mỗi dòng một câu trả lời mẫu được chấp nhận"}
            className="min-h-32 border-white/10 bg-black/30 font-mono text-xs leading-relaxed"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Few-shot TRƯỢT
          </span>
          <Textarea
            value={draft.aiInvalidCases.join("\n")}
            onChange={(event) =>
              onChange({ aiInvalidCases: event.target.value.split("\n") })
            }
            placeholder={"Mỗi dòng một câu trả lời mẫu phải đánh trượt"}
            className="min-h-32 border-white/10 bg-black/30 font-mono text-xs leading-relaxed"
          />
        </label>
      </div>
    </div>
  );
}
