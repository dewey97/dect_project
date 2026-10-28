"use client";

import { Plus, X } from "lucide-react";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SimpleAnswerConfigFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const INPUT_CLASS = "h-7 border-white/10 bg-black/30 text-xs";

export function SimpleAnswerConfigForm({
  draft,
  onChange,
}: SimpleAnswerConfigFormProps) {
  const type =
    draft.kind === "choice" || draft.type === "choice"
      ? "choice"
      : draft.kind || draft.type || "choice";
  const config = draft.answerConfig;
  const options = Array.isArray(config.options) ? config.options : [];

  const setConfig = (patch: Partial<typeof config>) => {
    onChange({ answerConfig: { ...config, ...patch } });
  };

  const addOption = () => {
    const next = [...options, ""];
    const nextPatch: Partial<typeof config> = { options: next };
    if (!config.correctAnswer && next.length === 1) {
      nextPatch.correctAnswer = "";
    }
    setConfig(nextPatch);
  };

  return (
    <div className="space-y-2">
      {type === "choice" ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300">
              Các phương án
            </span>
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
            >
              <Plus className="size-3" />
              <span>Thêm phương án</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {options.map((opt, index) => {
              const isCorrect = config.correctAnswer === opt && opt.trim().length > 0;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors",
                    isCorrect
                      ? "border-emerald-500/40 bg-emerald-950/20"
                      : "border-white/10 bg-black/40 hover:border-white/20",
                  )}
                >
                  <input
                    type="radio"
                    name="correct_choice"
                    checked={isCorrect}
                    onChange={() => setConfig({ correctAnswer: opt })}
                    className="size-3.5 accent-emerald-500 cursor-pointer"
                    title="Chọn làm đáp án đúng"
                  />
                  <input
                    value={opt}
                    onChange={(e) => {
                      const next = [...options];
                      const oldVal = next[index];
                      next[index] = e.target.value;
                      const nextPatch: Partial<typeof config> = { options: next };
                      if (config.correctAnswer === oldVal) {
                        nextPatch.correctAnswer = e.target.value;
                      }
                      setConfig(nextPatch);
                    }}
                    placeholder={`Phương án ${String.fromCharCode(65 + index)}...`}
                    className="flex-1 min-w-0 bg-transparent text-xs text-zinc-100 outline-none placeholder:text-zinc-600"
                  />
                  {isCorrect && (
                    <span className="text-[10px] font-semibold text-emerald-400 shrink-0 select-none">
                      Đúng
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const next = options.filter((_, i) => i !== index);
                      const nextPatch: Partial<typeof config> = { options: next };
                      if (config.correctAnswer === opt) {
                        nextPatch.correctAnswer = next[0] || "";
                      }
                      setConfig(nextPatch);
                    }}
                    className="text-zinc-500 hover:text-rose-400 transition-colors p-0.5 cursor-pointer shrink-0"
                    title="Xóa phương án này"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {options.length === 0 && (
            <div className="rounded-md border border-dashed border-white/10 p-3 text-center text-xs text-zinc-500">
              Chưa có phương án nào. Bấm &quot;Thêm phương án&quot; để thiết lập.
            </div>
          )}
        </div>
      ) : (
        <Field
          label={
            type === "code" || type === "time" || draft.kind === "code" || draft.kind === "time"
              ? "Đáp án so khớp"
              : "Đáp án đúng"
          }
          required
        >
          <Input
            value={config.correctAnswer || ""}
            onChange={(event) => setConfig({ correctAnswer: event.target.value })}
            placeholder={
              type === "code" || type === "time" || draft.kind === "code" || draft.kind === "time"
                ? "120713 hoặc 21:15"
                : "Nhập đáp án..."
            }
            className={INPUT_CLASS}
          />
        </Field>
      )}
    </div>
  );
}
