"use client";

import { useState } from "react";
import { Flame, Clock, Scale } from "lucide-react";
import type {
  CheckpointStudioDraft,
  EvidencePickerConfig,
} from "@/lib/types/checkpoint-studio";
import { CodeChipInput } from "../code-chip-input";
import { AutoExpandingTextarea } from "../auto-expanding-textarea";
import { cn } from "@/lib/utils";
import { CheckpointHintsForm } from "./checkpoint-hints-form";

interface SuspectInterrogationConfigFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

type TabKey = "motive" | "alibi" | "contradiction";
type ConfigListKey = keyof EvidencePickerConfig;

export function SuspectInterrogationConfigForm({
  draft,
  onChange,
}: SuspectInterrogationConfigFormProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("motive");
  const config = draft.answerConfig;

  const setList = (key: ConfigListKey, value: string[]) => {
    onChange({ answerConfig: { ...config, [key]: value } });
  };

  const motiveCount =
    (config.motiveEvidenceIds?.length || 0) +
    (config.optionalMotiveIds?.length || 0);

  const alibiCount =
    (config.alibiEvidenceIds?.length || 0) +
    (config.optionalAlibiIds?.length || 0);

  const contradictionCount =
    (config.contradictionEvidenceIds?.length || 0) +
    (config.optionalContradictionIds?.length || 0);

  return (
    <div className="space-y-3">
      {/* 3 Subtabs phẳng: Động cơ, Ngoại phạm, Mâu thuẫn */}
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
          onClick={() => setActiveTab("alibi")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 text-xs font-semibold transition-all",
            activeTab === "alibi"
              ? "bg-blue-500/20 text-blue-300 shadow-sm border border-blue-500/30"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
          )}
        >
          <Clock className="size-3.5 text-blue-400" />
          <span>Ngoại phạm</span>
          {alibiCount > 0 && (
            <span className="rounded bg-blue-500/30 px-1.5 py-0.2 font-mono text-[9px] font-bold text-blue-200">
              {alibiCount}
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
          <span>Mâu thuẫn</span>
          {contradictionCount > 0 && (
            <span className="rounded bg-rose-500/30 px-1.5 py-0.2 font-mono text-[9px] font-bold text-rose-200">
              {contradictionCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Động cơ */}
      {activeTab === "motive" && (
        <div className="space-y-2.5">
          <Field label="Vật chứng bắt buộc (chứng minh động cơ)" required>
            <CodeChipInput
              value={config.motiveEvidenceIds}
              onChange={(value) => setList("motiveEvidenceIds", value)}
              className="min-h-8 border-white/10 bg-black/40"
            />
          </Field>

          <Field label="Vật chứng tùy chọn / chấp nhận thêm">
            <CodeChipInput
              value={config.optionalMotiveIds}
              onChange={(value) => setList("optionalMotiveIds", value)}
              className="min-h-8 border-white/10 bg-black/40"
            />
          </Field>

          <Field label="Bối cảnh thẩm tra động cơ (cho AI check)">
            <AutoExpandingTextarea
              value={config.motiveContext || ""}
              onChange={(e) =>
                onChange({
                  answerConfig: { ...config, motiveContext: e.target.value },
                })
              }
              minRows={1}
              className="min-h-8"
              placeholder="Mô tả bối cảnh để AI chấm điểm lý do thẩm tra..."
            />
          </Field>

          <div>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Gợi ý cho phần Động cơ
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

      {/* Tab 2: Ngoại phạm */}
      {activeTab === "alibi" && (
        <div className="space-y-2.5">
          <Field label="Vật chứng bắt buộc (bóc tách ngoại phạm)" required>
            <CodeChipInput
              value={config.alibiEvidenceIds}
              onChange={(value) => setList("alibiEvidenceIds", value)}
              className="min-h-8 border-white/10 bg-black/40"
            />
          </Field>

          <Field label="Vật chứng tùy chọn / chấp nhận thêm">
            <CodeChipInput
              value={config.optionalAlibiIds}
              onChange={(value) => setList("optionalAlibiIds", value)}
              className="min-h-8 border-white/10 bg-black/40"
            />
          </Field>

          <div>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Gợi ý cho phần Ngoại phạm
            </span>
            <CheckpointHintsForm
              draft={draft}
              activeGroup="alibi"
              hideGroupTabs
              onChange={onChange}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Mâu thuẫn lời khai */}
      {activeTab === "contradiction" && (
        <div className="space-y-2.5">
          <Field label="Vật chứng bắt buộc (chứng minh mâu thuẫn)" required>
            <CodeChipInput
              value={config.contradictionEvidenceIds}
              onChange={(value) => setList("contradictionEvidenceIds", value)}
              className="min-h-8 border-white/10 bg-black/40"
            />
          </Field>

          <Field label="Vật chứng tùy chọn / chấp nhận thêm">
            <CodeChipInput
              value={config.optionalContradictionIds}
              onChange={(value) => setList("optionalContradictionIds", value)}
              className="min-h-8 border-white/10 bg-black/40"
            />
          </Field>

          <Field label="Bối cảnh mâu thuẫn (cho AI check)">
            <AutoExpandingTextarea
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
              placeholder="Mô tả lời khai gian dối và chứng cứ bắt bẻ..."
            />
          </Field>

          <div>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Gợi ý cho phần Mâu thuẫn
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="flex items-baseline gap-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
        {required && <span className="text-amber-400">*</span>}
      </span>
      {children}
    </label>
  );
}
