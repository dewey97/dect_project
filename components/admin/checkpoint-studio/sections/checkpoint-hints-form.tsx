"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type {
  CheckpointHint,
  CheckpointHintGroup,
  CheckpointStudioDraft,
} from "@/lib/types/checkpoint-studio";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const HINT_GROUPS: { key: CheckpointHintGroup; label: string }[] = [
  { key: "general", label: "Chung" },
  { key: "motive", label: "Động cơ" },
  { key: "contradiction", label: "Mâu thuẫn" },
  { key: "alibi", label: "Ngoại phạm" },
];

interface CheckpointHintsFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

export function CheckpointHintsForm({
  draft,
  onChange,
}: CheckpointHintsFormProps) {
  const [group, setGroup] = useState<CheckpointHintGroup>("general");

  const indices = draft.hints
    .map((hint, index) => (hint.group === group ? index : -1))
    .filter((index) => index >= 0);

  const setHints = (hints: CheckpointHint[]) => onChange({ hints });

  const addHint = () => {
    const next = [...draft.hints];
    let insertAt = next.length;
    for (let i = next.length - 1; i >= 0; i--) {
      if (next[i].group === group) {
        insertAt = i + 1;
        break;
      }
    }
    next.splice(insertAt, 0, { group, text: "" });
    setHints(next);
  };

  const updateHint = (absoluteIndex: number, text: string) => {
    const next = draft.hints.map((hint, index) =>
      index === absoluteIndex ? { ...hint, text } : hint,
    );
    setHints(next);
  };

  const removeHint = (absoluteIndex: number) => {
    setHints(draft.hints.filter((_, index) => index !== absoluteIndex));
  };

  const moveHint = (position: number, direction: -1 | 1) => {
    const targetPosition = position + direction;
    if (targetPosition < 0 || targetPosition >= indices.length) return;
    const a = indices[position];
    const b = indices[targetPosition];
    const next = [...draft.hints];
    [next[a], next[b]] = [next[b], next[a]];
    setHints(next);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 pb-1.5">
        {HINT_GROUPS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setGroup(item.key)}
            className={cn(
              "rounded px-1.5 py-0.5 text-[11px] transition-colors",
              group === item.key
                ? "bg-amber-500 text-black"
                : "text-zinc-400 hover:text-zinc-100",
            )}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={addHint}
          className="ml-auto inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold text-amber-300 transition-colors hover:bg-amber-500/10"
        >
          <Plus className="size-3" />
          Thêm
        </button>
      </div>

      {indices.length === 0 ? (
        <p className="py-2 text-center text-[11px] text-zinc-600">
          Chưa có gợi ý.
        </p>
      ) : (
        <ol className="divide-y divide-white/[0.06]">
          {indices.map((absoluteIndex, position) => (
            <li
              key={absoluteIndex}
              className="flex items-start gap-1.5 py-1.5"
            >
              <span className="mt-1.5 w-4 shrink-0 text-right font-mono text-[10px] text-amber-400">
                {position + 1}
              </span>
              <Textarea
                value={draft.hints[absoluteIndex].text}
                onChange={(event) =>
                  updateHint(absoluteIndex, event.target.value)
                }
                placeholder="Nội dung gợi ý…"
                className="min-h-12 flex-1 border-white/10 bg-black/30 text-xs"
              />
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveHint(position, -1)}
                  disabled={position === 0}
                  className="rounded p-0.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-30"
                  aria-label="Đưa gợi ý lên"
                >
                  <ArrowUp className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveHint(position, 1)}
                  disabled={position === indices.length - 1}
                  className="rounded p-0.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-30"
                  aria-label="Đưa gợi ý xuống"
                >
                  <ArrowDown className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeHint(absoluteIndex)}
                  className="rounded p-0.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  aria-label="Xóa gợi ý"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
