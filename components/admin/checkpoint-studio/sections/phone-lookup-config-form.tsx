"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CodeChipInput } from "../code-chip-input";

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

const INPUT_CLASS = "h-7 border-white/10 bg-black/40 text-xs text-zinc-100";

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
        label: `Ô tra cứu ${inputs.length + 1}`,
        placeholder: "Nhập họ tên cần tra...",
        validAnswers: [],
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
        <span className="text-[11px] text-zinc-400">
          Danh sách ô nhập liệu tra cứu SĐT / Danh bạ:
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addInput}
          className="h-6 text-[10px] gap-1 px-2 border-white/10 bg-white/5 hover:bg-white/10 text-amber-300"
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
        <div className="space-y-3">
          {inputs.map((item, index) => (
            <div
              key={item.id || index}
              className="rounded-md border border-white/10 bg-black/30 p-2.5 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
                  #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-zinc-500 hover:text-rose-400 transition-colors p-0.5"
                  title="Xóa ô này"
                >
                  <Trash2 className="size-3" />
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
                      updateItem(index, { label: e.target.value })
                    }
                    placeholder="VD: Tra cứu Lê Quang Vũ"
                    className={INPUT_CLASS}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-medium text-zinc-400">
                    Gợi ý (placeholder)
                  </span>
                  <Input
                    value={item.placeholder}
                    onChange={(e) =>
                      updateItem(index, { placeholder: e.target.value })
                    }
                    placeholder="VD: Nhập họ tên nghi phạm..."
                    className={INPUT_CLASS}
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-[10px] font-medium text-zinc-400">
                  Các đáp án được chấp nhận (Enter để thêm)
                </span>
                <CodeChipInput
                  value={item.validAnswers || []}
                  onChange={(answers) =>
                    updateItem(index, { validAnswers: answers })
                  }
                  placeholder="Nhập tên/từ khóa rồi Enter..."
                  className="min-h-7 border-white/10 bg-black/40 text-xs"
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
