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
];

interface CheckpointHintsFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

export function CheckpointHintsForm({
  draft,
  onChange,
}: CheckpointHintsFormProps) {
  const isEvidencePicker = (draft.type || "evidence_picker") === "evidence_picker";
  const [group, setGroup] = useState<CheckpointHintGroup>("general");

  const effectiveGroup: CheckpointHintGroup = isEvidencePicker ? group : "general";

  const indices = draft.hints
    .map((hint, index) => (hint.group === effectiveGroup ? index : -1))
    .filter((index) => index >= 0);

  const setHints = (hints: CheckpointHint[]) => onChange({ hints });

  const addHint = () => {
    const next = [...draft.hints];
    let insertAt = next.length;
    for (let i = next.length - 1; i >= 0; i--) {
      if (next[i].group === effectiveGroup) {
        insertAt = i + 1;
        break;
      }
    }
    next.splice(insertAt, 0, { group: effectiveGroup, text: "" });
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

  // Đếm số lượng gợi ý trong từng nhóm (để hiển thị badge)
  const groupCounts = HINT_GROUPS.reduce(
    (acc, item) => {
      acc[item.key] = draft.hints.filter((h) => h.group === item.key).length;
      return acc;
    },
    {} as Record<CheckpointHintGroup, number>,
  );

  return (
    <div className="space-y-2">
      {isEvidencePicker ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-white/10 pb-1.5">
          {HINT_GROUPS.map((item) => {
            const count = groupCounts[item.key] || 0;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setGroup(item.key)}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                  group === item.key
                    ? "bg-amber-500 text-black font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                )}
              >
                <span>{item.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1 py-0.2 text-[9px] font-mono",
                      group === item.key
                        ? "bg-black/30 text-black font-bold"
                        : "bg-white/10 text-amber-300",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={addHint}
            className="ml-auto inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            <Plus className="size-3" />
            Thêm
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <span className="text-[11px] font-medium text-zinc-400">
            Danh sách gợi ý mở dần ({indices.length})
          </span>
          <button
            type="button"
            onClick={addHint}
            className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            <Plus className="size-3" />
            + Gợi ý
          </button>
        </div>
      )}

      {indices.length === 0 ? (
        <div className="rounded border border-dashed border-white/10 py-3 text-center">
          <p className="text-[11px] text-zinc-500">Chưa có gợi ý nào</p>
          <button
            type="button"
            onClick={addHint}
            className="mt-1 text-[11px] text-amber-400 hover:underline"
          >
            + Bấm để thêm gợi ý đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {indices.map((absoluteIndex, position) => (
            <div
              key={absoluteIndex}
              className="flex items-start gap-1.5 rounded-md border border-white/5 bg-white/[0.02] p-1.5"
            >
              <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded bg-amber-500/10 font-mono text-[10px] font-bold text-amber-400">
                {position + 1}
              </span>
              <Textarea
                value={draft.hints[absoluteIndex].text}
                onChange={(event) =>
                  updateHint(absoluteIndex, event.target.value)
                }
                placeholder={`Gợi ý cấp ${position + 1}…`}
                className="min-h-9 flex-1 resize-none border-white/10 bg-black/40 py-1 px-2 text-xs leading-normal"
                rows={2}
              />
              <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
                {indices.length > 1 && (
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => moveHint(position, -1)}
                      disabled={position === 0}
                      className="rounded p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                      title="Chuyển lên"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveHint(position, 1)}
                      disabled={position === indices.length - 1}
                      className="rounded p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                      title="Chuyển xuống"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeHint(absoluteIndex)}
                  className="rounded p-1 text-zinc-500 hover:bg-red-500/20 hover:text-red-400"
                  title="Xóa gợi ý"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
