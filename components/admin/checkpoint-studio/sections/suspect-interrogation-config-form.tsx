"use client";

import { useState } from "react";
import type {
  CheckpointStudioDraft,
  EvidencePickerConfig,
} from "@/lib/types/checkpoint-studio";
import { Field } from "@/components/ui/field";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";
import { CodeChipInput } from "../code-chip-input";
import { cn } from "@/lib/utils";
import { CheckpointHintsForm } from "./checkpoint-hints-form";

interface SuspectInterrogationConfigFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

type TabKey = "motive" | "contradiction";
type ConfigListKey = keyof EvidencePickerConfig;

export function SuspectInterrogationConfigForm({
  draft,
  onChange,
}: SuspectInterrogationConfigFormProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("motive");
  const config = draft.answerConfig;

  const setList = (key: ConfigListKey, value: string[] | undefined) => {
    onChange({ answerConfig: { ...config, [key]: value } });
  };

  return (
    <div className="space-y-3">
      {/* 2 Subtabs phẳng: Động cơ & Mâu thuẫn lời khai */}
      <div className="flex rounded-md border border-white/10 bg-black/40 p-0.5 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("motive")}
          className={cn(
            "flex flex-1 items-center justify-center rounded py-1.5 text-xs font-semibold transition-all cursor-pointer",
            activeTab === "motive"
              ? "bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
          )}
        >
          <span>Động cơ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contradiction")}
          className={cn(
            "flex flex-1 items-center justify-center rounded py-1.5 text-xs font-semibold transition-all cursor-pointer",
            activeTab === "contradiction"
              ? "bg-rose-500/20 text-rose-300 shadow-sm border border-rose-500/30"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
          )}
        >
          <span>Mâu thuẫn lời khai</span>
        </button>
      </div>

      {/* Tab 1: Động cơ gây án */}
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

          <Field label="Context">
            <AutoGrowTextarea
              value={config.motiveContext || ""}
              onChange={(e) =>
                onChange({
                  answerConfig: { ...config, motiveContext: e.target.value },
                })
              }
              minRows={1}
              className="min-h-8"
              placeholder="Mô tả bối cảnh để AI chấm điểm..."
            />
          </Field>

          <ExampleListField
            label="Thế nào là đúng (Ví dụ đạt)"
            value={config.motiveValidCases}
            onChange={(value) => setList("motiveValidCases", value)}
            placeholder="Mỗi dòng một câu trả lời đạt..."
          />

          <ExampleListField
            label="Thế nào là sai (Ví dụ không đạt)"
            value={config.motiveInvalidCases}
            onChange={(value) => setList("motiveInvalidCases", value)}
            placeholder="Mỗi dòng một câu trả lời không đạt..."
          />

          <LegacySharedExamples draft={draft} onChange={onChange} />

          <CheckpointHintsForm
            draft={draft}
            activeGroup="motive"
            hideGroupTabs
            title="Gợi ý cho phần Động cơ"
            onChange={onChange}
          />
        </div>
      )}

      {/* Tab 2: Mâu thuẫn lời khai */}
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

          <Field label="Context">
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
              placeholder="Lời khai gian dối và chứng cứ..."
            />
          </Field>

          <ExampleListField
            label="Thế nào là đúng (Ví dụ đạt)"
            value={config.contradictionValidCases}
            onChange={(value) => setList("contradictionValidCases", value)}
            placeholder="Mỗi dòng một câu trả lời đạt..."
          />

          <ExampleListField
            label="Thế nào là sai (Ví dụ không đạt)"
            value={config.contradictionInvalidCases}
            onChange={(value) => setList("contradictionInvalidCases", value)}
            placeholder="Mỗi dòng một câu trả lời không đạt..."
          />

          <LegacySharedExamples draft={draft} onChange={onChange} />

          <CheckpointHintsForm
            draft={draft}
            activeGroup="contradiction"
            hideGroupTabs
            title="Gợi ý cho phần Mâu thuẫn"
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}

function ExampleListField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  placeholder: string;
}) {
  return (
    <Field label={label}>
      <AutoGrowTextarea
        value={(value || []).join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        minRows={2}
        className="min-h-8"
        placeholder={placeholder}
      />
    </Field>
  );
}

/**
 * Dữ liệu cũ: `ai_valid_cases` / `ai_invalid_cases` dùng chung cho cả 2 hạng mục.
 * Server chỉ dùng khi hạng mục chưa có ví dụ riêng. Hiện để GM chia lại rồi xóa.
 */
function LegacySharedExamples({
  draft,
  onChange,
}: SuspectInterrogationConfigFormProps) {
  const valid = draft.aiValidCases.filter((line) => line.trim());
  const invalid = draft.aiInvalidCases.filter((line) => line.trim());
  if (valid.length === 0 && invalid.length === 0) return null;

  return (
    <div className="space-y-1.5 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-amber-200">
      <p className="font-semibold">Ví dụ cũ đang dùng chung cho cả 2 phần</p>
      <p className="text-amber-200/70">
        AI dùng danh sách này cho phần nào chưa có ví dụ riêng. Chép từng câu
        sang đúng phần ở trên, rồi xóa danh sách cũ.
      </p>
      {valid.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-4">
          {valid.map((line, i) => (
            <li key={`v-${i}`}>Đạt: {line}</li>
          ))}
        </ul>
      )}
      {invalid.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-4">
          {invalid.map((line, i) => (
            <li key={`i-${i}`}>Trượt: {line}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => onChange({ aiValidCases: [], aiInvalidCases: [] })}
        className="min-h-8 rounded border border-amber-500/40 px-2 py-1 font-semibold hover:bg-amber-500/10"
      >
        Xóa ví dụ dùng chung
      </button>
    </div>
  );
}
