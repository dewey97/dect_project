"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Field } from "@/components/ui/field";
import { CodeChipInput } from "../code-chip-input";

interface IndictmentConfigFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

export function IndictmentConfigForm({
  draft,
  onChange,
}: IndictmentConfigFormProps) {
  const config = draft.answerConfig;

  const setConfig = (patch: Partial<typeof config>) => {
    onChange({ answerConfig: { ...config, ...patch } });
  };

  return (
    <div className="space-y-3">
      {/* 1. Bị can kết án */}
      <Field label="Nghi phạm bị can đúng (Tên hoặc mã định danh)" required>
        <CodeChipInput
          value={config.validSuspects || []}
          onChange={(validSuspects) => setConfig({ validSuspects })}
          placeholder="VD: Trần Thị Hà, ha..."
          className="min-h-8 border-white/10 bg-black/40"
        />
      </Field>

      {/* 2. Động cơ kết án */}
      <Field label="Động cơ phạm tội được chấp nhận (Enter để thêm)" required>
        <CodeChipInput
          value={config.validMotives || []}
          onChange={(validMotives) => setConfig({ validMotives })}
          placeholder="VD: Mâu thuẫn tình cảm..."
          className="min-h-8 border-white/10 bg-black/40"
        />
      </Field>

      {/* 3. Chứng cứ bắt buộc */}
      <Field label="Mã chứng cứ bắt buộc để truy tố" required>
        <CodeChipInput
          value={config.requiredEvidenceIds || []}
          onChange={(requiredEvidenceIds) => setConfig({ requiredEvidenceIds })}
          placeholder="VD: C-02, D-04, D-05..."
          className="min-h-8 border-white/10 bg-black/40"
        />
      </Field>

      {/* 4. Chứng cứ tùy chọn */}
      <Field label="Mã chứng cứ bổ trợ / chấp nhận thêm">
        <CodeChipInput
          value={config.optionalEvidenceIds || []}
          onChange={(optionalEvidenceIds) => setConfig({ optionalEvidenceIds })}
          placeholder="VD: D-01, B-03..."
          className="min-h-8 border-white/10 bg-black/40"
        />
      </Field>
    </div>
  );
}
