"use client";

import { useState } from "react";
import { Flame, Scale } from "lucide-react";
import type {
  CheckpointStudioDraft,
  EvidencePickerConfig,
} from "@/lib/types/checkpoint-studio";
import { Field } from "@/components/ui/field";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";
import { CodeChipInput } from "../code-chip-input";
import { cn } from "@/lib/utils";
import { CheckpointHintsForm } from "./checkpoint-hints-form";

interface EvidencePickerConfigFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

type ConfigListKey = keyof EvidencePickerConfig;

export function EvidencePickerConfigForm({
  draft,
  onChange,
}: EvidencePickerConfigFormProps) {
  const [activeTab, setActiveTab] = useState<"motive" | "contradiction">(
    "motive",
  );
  const config = draft.answerConfig;

  const setList = (key: ConfigListKey, value: string[]) => {
    onChange({ answerConfig: { ...config, [key]: value } });
  };

  const motiveCount =
    (config.motiveEvidenceIds?.length || 0) +
    (config.optionalMotiveIds?.length || 0);

  const contradictionCount =
    (config.contradictionEvidenceIds?.length || 0) +
    (config.optionalContradictionIds?.length || 0);

  return (
    <div className="space-y-3">
      {/* 2 Subtabs phẳng, tối giản: Động cơ & Mâu thuẫn */}
      <div className="flex rounded-md border border-white/10 bg-black/40 p-0.5 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("motive")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 text-xs font-semibold transition-all",
            activeTab === "motive"
              ? "bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
          )}
        >
          <Flame className="size-3.5 text-amber-400" />
          <span>Động cơ</span>
          {motiveCount > 0 && (
            <span className="rounded bg-amber-500/30 px-1.5 py-0.2 font-mono text-[9px] font-bold text-amber-200">
              {motiveCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contradiction")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 text-xs font-semibold transition-all",
            activeTab === "contradiction"
              ? "bg-rose-500/20 text-rose-300 shadow-sm border border-rose-500/30"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
          )}
        >
          <Scale className="size-3.5 text-rose-400" />
          <span>Mâu thuẫn lời khai</span>
          {contradictionCount > 0 && (
            <span className="rounded bg-rose-500/30 px-1.5 py-0.2 font-mono text-[9px] font-bold text-rose-200">
              {contradictionCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Động cơ (Clean, không box viền thừa, không lặp lại chữ 'Động cơ') */}
      {activeTab === "motive" && (
        <div className="space-y-2.5">
          <Field label="Vật chứng bắt buộc" required>
            <CodeChipInput
              value={config.motiveEvidenceIds}
              onChange={(value) => setList("motiveEvidenceIds", value)}
              className="min-h-8 border-white/10 bg-black/40"
            />
          </Field>

          <Field label="Vật chứng tùy chọn">
            <CodeChipInput
              value={config.optionalMotiveIds}
              onChange={(value) => setList("optionalMotiveIds", value)}
              className="min-h-8 border-white/10 bg-black/40"
            />
          </Field>

          <Field label="Bối cảnh">
            <AutoGrowTextarea
              value={config.motiveContext || ""}
              onChange={(e) =>
                onChange({
                  answerConfig: { ...config, motiveContext: e.target.value },
                })
              }
              minRows={1}
              className="min-h-8"
            />
          </Field>

          <div>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Gợi ý
            </span>
            <CheckpointHintsForm
              draft={draft}
              activeGroup="motive"
              hideGroupTabs
              onChange={onChange}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Mâu thuẫn lời khai (Clean, không box viền thừa, không lặp lại) */}
      {activeTab === "contradiction" && (
        <div className="space-y-2.5">
          <Field label="Vật chứng bắt buộc" required>
            <CodeChipInput
              value={config.contradictionEvidenceIds}
              onChange={(value) => setList("contradictionEvidenceIds", value)}
              className="min-h-8 border-white/10 bg-black/40"
            />
          </Field>

          <Field label="Vật chứng tùy chọn">
            <CodeChipInput
              value={config.optionalContradictionIds}
              onChange={(value) => setList("optionalContradictionIds", value)}
              className="min-h-8 border-white/10 bg-black/40"
            />
          </Field>

          <Field label="Bối cảnh">
            <AutoGrowTextarea
              value={config.contradictionContext || ""}
              onChange={(e) =>
                onChange({
                  answerConfig: {
                    ...config,
                    contradictionContext: e.target.value,
                  },
                })
              }
              minRows={1}
              className="min-h-8"
            />
          </Field>

          <div>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Gợi ý
            </span>
            <CheckpointHintsForm
              draft={draft}
              activeGroup="contradiction"
              hideGroupTabs
              onChange={onChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
