"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type {
  CheckpointHint,
  CheckpointHintGroup,
  CheckpointStudioDraft,
} from "@/lib/types/checkpoint-studio";
import { AutoExpandingTextarea } from "../auto-expanding-textarea";
import { cn } from "@/lib/utils";

const HINT_GROUPS: { key: CheckpointHintGroup; label: string }[] = [
  { key: "general", label: "Chung" },
  { key: "motive", label: "Động cơ" },
  { key: "contradiction", label: "Mâu thuẫn" },
];

interface CheckpointHintsFormProps {
  draft: CheckpointStudioDraft;
  activeGroup?: CheckpointHintGroup;
  hideGroupTabs?: boolean;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

export function CheckpointHintsForm({
  draft,
  activeGroup,
  hideGroupTabs = false,
  onChange,
}: CheckpointHintsFormProps) {
  const isEvidencePicker = (draft.type || "evidence_picker") === "evidence_picker";
  const [internalGroup, setInternalGroup] = useState<CheckpointHintGroup>("general");

  const effectiveGroup: CheckpointHintGroup = activeGroup ?? (isEvidencePicker ? internalGroup : "general");

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

  return (
    <div className="space-y-1.5">
      {isEvidencePicker && !hideGroupTabs && (
        <div className="flex flex-wrap items-center gap-1 pb-1">
          {HINT_GROUPS.map((item) => {
            const count = draft.hints.filter((h) => h.group === item.key).length;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setInternalGroup(item.key)}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                  internalGroup === item.key
                    ? "bg-amber-500 text-black font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                )}
              >
                <span>{item.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1 py-0.2 text-[9px] font-mono",
                      internalGroup === item.key
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
        </div>
      )}

      {/* Danh sách gợi ý phẳng, clean, 1 line mở rộng tự động, không placeholder */}
      <div className="space-y-1">
        {indices.map((absoluteIndex, position) => (
          <div key={absoluteIndex} className="flex items-start gap-1.5">
            <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded bg-white/5 font-mono text-[10px] text-zinc-400">
              {position + 1}
            </span>
            <AutoExpandingTextarea
              value={draft.hints[absoluteIndex].text}
              onChange={(event) =>
                updateHint(absoluteIndex, event.target.value)
              }
              minRows={1}
              className="min-h-8 flex-1"
            />
            <button
              type="button"
              onClick={() => removeHint(absoluteIndex)}
              className="mt-1 rounded p-1 text-zinc-500 hover:text-red-400"
              title="Xóa gợi ý"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addHint}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors pt-0.5"
        >
          <Plus className="size-3" />
          <span>Thêm gợi ý</span>
        </button>
      </div>
    </div>
  );
}
