"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PhoneLookupConfigFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

interface TextMatchInputItem {
  id: string;
  label: string;
  placeholder: string;
  validAnswers: string[];
}

const INPUT_CLASS = "h-8 border-white/10 bg-black/40 text-xs text-zinc-100 rounded-md";

export function PhoneLookupConfigForm({
  draft,
  onChange,
}: PhoneLookupConfigFormProps) {
  const config = draft.answerConfig;
  const inputs: TextMatchInputItem[] = Array.isArray(config.textMatchInputs)
    ? config.textMatchInputs
    : [];

  const updateInputs = (nextInputs: TextMatchInputItem[]) => {
    onChange({
      answerConfig: {
        ...config,
        textMatchInputs: nextInputs,
      },
    });
  };

  const addInput = () => {
    const nextId = `lookup_${Date.now().toString(36)}`;
    updateInputs([
      ...inputs,
      {
        id: nextId,
        label: `Số điện thoại #${inputs.length + 1}`,
        placeholder: "Nhập họ tên đầy đủ...",
        validAnswers: [""],
      },
    ]);
  };

  const updateItem = (index: number, patch: Partial<TextMatchInputItem>) => {
    const next = [...inputs];
    next[index] = { ...next[index], ...patch };
    updateInputs(next);
  };

  const removeItem = (index: number) => {
    updateInputs(inputs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-zinc-300">
          Danh sách ô tra cứu:
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addInput}
          className="h-6 text-[10px] gap-1 px-2 border-white/10 bg-white/5 hover:bg-white/10 text-amber-300 cursor-pointer"
        >
          <Plus className="size-3" />
          <span>Thêm ô tra cứu</span>
        </Button>
      </div>

      {inputs.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/10 p-4 text-center text-xs text-zinc-500">
          Chưa có ô tra cứu nào. Bấm &quot;Thêm ô tra cứu&quot; để thiết lập.
        </div>
      ) : (
        <div className="space-y-2.5">
          {inputs.map((item, index) => {
            const currentAnswer = (item.validAnswers && item.validAnswers[0]) || "";
            return (
              <div
                key={item.id || index}
                className="rounded-md border border-white/10 bg-black/30 p-2.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
                    Ô #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-zinc-500 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                    title="Xóa ô này"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block space-y-1">
                    <span className="text-[10px] font-medium text-zinc-400">
                      Nhãn ô nhập
                    </span>
                    <Input
                      value={item.label}
                      onChange={(e) =>
                        updateItem(index, {
                          label: e.target.value,
                          placeholder: "Nhập họ tên đầy đủ...",
                        })
                      }
                      placeholder="VD: Số điện thoại #1:"
                      className={INPUT_CLASS}
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-[10px] font-medium text-zinc-400">
                      Tên đầy đủ (Đáp án)
                    </span>
                    <Input
                      value={currentAnswer}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateItem(index, {
                          validAnswers: val.trim() ? [val.trim()] : [],
                        });
                      }}
                      placeholder="VD: Lê Quang Vũ"
                      className={INPUT_CLASS}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
