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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-black/30 p-1">
        {HINT_GROUPS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setGroup(item.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
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
          className="ml-auto inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/10"
        >
          <Plus className="size-3.5" />
          Thêm cấp
        </button>
      </div>

      {indices.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-xs text-zinc-500">
          Chưa có gợi ý nào trong nhóm này.
        </p>
      ) : (
        <ol className="space-y-2">
          {indices.map((absoluteIndex, position) => (
            <li
              key={absoluteIndex}
              className="flex items-start gap-2 rounded-lg border border-white/10 bg-black/20 p-2"
            >
              <span className="mt-2 w-6 shrink-0 text-center font-mono text-[11px] text-amber-400">
                {position + 1}
              </span>
              <Textarea
                value={draft.hints[absoluteIndex].text}
                onChange={(event) =>
                  updateHint(absoluteIndex, event.target.value)
                }
                placeholder={
                  position === 0
                    ? "Gợi ý cấp 1…"
                    : "Gợi ý cấp tiếp theo, cụ thể hơn…"
                }
                className="min-h-16 flex-1 border-white/10 bg-black/30 text-xs"
              />
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveHint(position, -1)}
                  disabled={position === 0}
                  className="rounded p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-30"
                  aria-label="Đưa gợi ý lên"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveHint(position, 1)}
                  disabled={position === indices.length - 1}
                  className="rounded p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-30"
                  aria-label="Đưa gợi ý xuống"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeHint(absoluteIndex)}
                  className="rounded p-1 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  aria-label="Xóa gợi ý"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
