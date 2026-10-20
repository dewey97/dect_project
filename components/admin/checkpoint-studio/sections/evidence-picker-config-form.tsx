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
  subtitle,
  badge,
  collapsed,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  collapsed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={!collapsed}
      className="group rounded-xl border border-white/10 bg-black/20"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3">
        <ChevronDown className="size-4 text-zinc-500 transition-transform group-open:rotate-0 -rotate-90" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-100">{title}</span>
            {badge && (
              <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-500">
                {badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500">{subtitle}</p>
        </div>
      </summary>
      <div className="space-y-3 border-t border-white/10 px-4 py-3">
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
    <div className="space-y-3">
      <TierCard
        title="Động cơ phạm tội"
        subtitle="Chứng cứ chứng minh lý do nghi phạm muốn nạn nhân chết."
        badge="motive"
      >
        <Field label="Mã chứng cứ bắt buộc" required>
          <CodeChipInput
            value={config.motiveEvidenceIds}
            onChange={(value) => setList("motiveEvidenceIds", value)}
            placeholder="13, 42…"
          />
        </Field>
        <Field label="Mã chứng cứ tùy chọn" hint="Chọn thêm không bị tính sai">
          <CodeChipInput
            value={config.optionalMotiveIds}
            onChange={(value) => setList("optionalMotiveIds", value)}
            placeholder="Tùy chọn…"
          />
        </Field>
      </TierCard>

      <TierCard
        title="Mâu thuẫn lời khai"
        subtitle="Chứng cứ vạch trần điểm nói dối trong biên bản."
        badge="contradiction"
      >
        <Field label="Mã chứng cứ bắt buộc" required>
          <CodeChipInput
            value={config.contradictionEvidenceIds}
            onChange={(value) => setList("contradictionEvidenceIds", value)}
            placeholder="14, p4…"
          />
        </Field>
        <Field label="Mã chứng cứ tùy chọn" hint="Chọn thêm không bị tính sai">
          <CodeChipInput
            value={config.optionalContradictionIds}
            onChange={(value) => setList("optionalContradictionIds", value)}
            placeholder="Tùy chọn…"
          />
        </Field>
      </TierCard>

      <TierCard
        title="Xác minh ngoại phạm"
        subtitle="Legacy — gameplay đã ẩn hạng mục này, parser vẫn đọc để tương thích."
        badge="legacy"
        collapsed
      >
        <Field label="Mã chứng cứ bắt buộc">
          <CodeChipInput
            value={config.alibiEvidenceIds}
            onChange={(value) => setList("alibiEvidenceIds", value)}
            placeholder="Không còn dùng…"
          />
        </Field>
        <Field label="Mã chứng cứ tùy chọn">
          <CodeChipInput
            value={config.optionalAlibiIds}
            onChange={(value) => setList("optionalAlibiIds", value)}
            placeholder="Không còn dùng…"
          />
        </Field>
      </TierCard>

      <TierCard
        title="Cấu hình bổ sung"
        subtitle="Dùng cho checkpoint dạng chọn nghi phạm / vật chứng chung."
        badge="picker"
        collapsed
      >
        <Field label="Nghi phạm hợp lệ">
          <CodeChipInput
            value={config.validSuspects}
            onChange={(value) => setList("validSuspects", value)}
            placeholder="Trần Thị Hà…"
          />
        </Field>
        <Field label="Động cơ hợp lệ">
          <CodeChipInput
            value={config.validMotives}
            onChange={(value) => setList("validMotives", value)}
            placeholder="động_cơ_1…"
          />
        </Field>
        <Field label="Vật chứng bắt buộc (chung)">
          <CodeChipInput
            value={config.requiredEvidenceIds}
            onChange={(value) => setList("requiredEvidenceIds", value)}
            placeholder="52, 50…"
          />
        </Field>
        <Field label="Vật chứng tùy chọn (chung)">
          <CodeChipInput
            value={config.optionalEvidenceIds}
            onChange={(value) => setList("optionalEvidenceIds", value)}
            placeholder="Tùy chọn…"
          />
        </Field>
      </TierCard>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline gap-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
        {required && <span className="text-amber-400">*</span>}
        {hint && (
          <span className="ml-auto font-normal normal-case tracking-normal text-zinc-600">
            {hint}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
