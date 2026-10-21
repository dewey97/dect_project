"use client";

import { ChevronDown } from "lucide-react";
import type {
  CheckpointStudioDraft,
  EvidencePickerConfig,
} from "@/lib/types/checkpoint-studio";
import { CodeChipInput } from "../code-chip-input";

interface EvidencePickerConfigFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

type ConfigListKey = keyof EvidencePickerConfig;

function TierCard({
  title,
  collapsed,
  children,
}: {
  title: string;
  collapsed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={!collapsed}
      className="group rounded-lg border border-white/10 bg-black/20"
    >
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-2 py-1.5">
        <ChevronDown className="size-3 text-zinc-500 transition-transform group-open:rotate-0 -rotate-90" />
        <span className="text-[11px] font-semibold text-zinc-200">{title}</span>
      </summary>
      <div className="space-y-2 border-t border-white/10 px-2 py-2">
        {children}
      </div>
    </details>
  );
}

export function EvidencePickerConfigForm({
  draft,
  onChange,
}: EvidencePickerConfigFormProps) {
  const config = draft.answerConfig;

  const setList = (key: ConfigListKey, value: string[]) => {
    onChange({ answerConfig: { ...config, [key]: value } });
  };

  return (
    <div className="space-y-2">
      <TierCard title="Động cơ">
        <Field label="Bắt buộc" required>
          <CodeChipInput
            value={config.motiveEvidenceIds}
            onChange={(value) => setList("motiveEvidenceIds", value)}
            placeholder="13, 42…"
            className="min-h-8"
          />
        </Field>
        <Field label="Tùy chọn">
          <CodeChipInput
            value={config.optionalMotiveIds}
            onChange={(value) => setList("optionalMotiveIds", value)}
            placeholder="Tùy chọn…"
            className="min-h-8"
          />
        </Field>
      </TierCard>

      <TierCard title="Mâu thuẫn">
        <Field label="Bắt buộc" required>
          <CodeChipInput
            value={config.contradictionEvidenceIds}
            onChange={(value) => setList("contradictionEvidenceIds", value)}
            placeholder="14, p4…"
            className="min-h-8"
          />
        </Field>
        <Field label="Tùy chọn">
          <CodeChipInput
            value={config.optionalContradictionIds}
            onChange={(value) => setList("optionalContradictionIds", value)}
            placeholder="Tùy chọn…"
            className="min-h-8"
          />
        </Field>
      </TierCard>

      <TierCard title="Ngoại phạm" collapsed>
        <Field label="Bắt buộc">
          <CodeChipInput
            value={config.alibiEvidenceIds}
            onChange={(value) => setList("alibiEvidenceIds", value)}
            placeholder="Không dùng…"
            className="min-h-8"
          />
        </Field>
        <Field label="Tùy chọn">
          <CodeChipInput
            value={config.optionalAlibiIds}
            onChange={(value) => setList("optionalAlibiIds", value)}
            placeholder="Không dùng…"
            className="min-h-8"
          />
        </Field>
      </TierCard>

      <TierCard title="Bổ sung" collapsed>
        <Field label="Nghi phạm hợp lệ">
          <CodeChipInput
            value={config.validSuspects}
            onChange={(value) => setList("validSuspects", value)}
            placeholder="mã hoặc tên…"
            className="min-h-8"
          />
        </Field>
        <Field label="Động cơ hợp lệ">
          <CodeChipInput
            value={config.validMotives}
            onChange={(value) => setList("validMotives", value)}
            placeholder="động_cơ_1…"
            className="min-h-8"
          />
        </Field>
        <Field label="Vật chứng bắt buộc">
          <CodeChipInput
            value={config.requiredEvidenceIds}
            onChange={(value) => setList("requiredEvidenceIds", value)}
            placeholder="52, 50…"
            className="min-h-8"
          />
        </Field>
        <Field label="Vật chứng tùy chọn">
          <CodeChipInput
            value={config.optionalEvidenceIds}
            onChange={(value) => setList("optionalEvidenceIds", value)}
            placeholder="Tùy chọn…"
            className="min-h-8"
          />
        </Field>
      </TierCard>
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
