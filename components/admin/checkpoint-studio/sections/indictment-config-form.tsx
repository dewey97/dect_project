"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import type { AvailableDocumentItem } from "@/lib/actions/dossier-config-actions";
import { Field } from "@/components/ui/field";
import { CodeChipInput } from "../code-chip-input";

interface IndictmentConfigFormProps {
  draft: CheckpointStudioDraft;
  availableDocs?: AvailableDocumentItem[];
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const HINT_CLASS = "text-[10px] text-zinc-500";

export function IndictmentConfigForm({
  draft,
  availableDocs = [],
  onChange,
}: IndictmentConfigFormProps) {
  const config = draft.answerConfig;
  const suggestions = availableDocs.map((doc) => ({
    code: doc.code,
    title: doc.title,
  }));

  const setConfig = (patch: Partial<typeof config>) => {
    onChange({ answerConfig: { ...config, ...patch } });
  };

  return (
    <div className="space-y-3">
      {/* 1. Tên */}
      <Field label="Tên hung thủ (mọi cách gọi chấp nhận)" required>
        <CodeChipInput
          value={config.validSuspects || []}
          onChange={(validSuspects) => setConfig({ validSuspects })}
          placeholder="VD: Trần Thị Hà, Hà, ha..."
          className="min-h-8 border-white/10 bg-black/40"
        />
        <p className={HINT_CLASS}>
          So khớp nguyên cụm, không phân biệt dấu và hoa thường. Nhập đủ tên đầy
          đủ, tên gọi và key nhân vật.
        </p>
      </Field>

      {/* 2. Động cơ */}
      <Field label="Động cơ (để trống = không chấm)">
        <CodeChipInput
          value={config.validMotives || []}
          onChange={(validMotives) => setConfig({ validMotives })}
          placeholder="VD: Mâu thuẫn tình cảm..."
          className="min-h-8 border-white/10 bg-black/40"
        />
      </Field>

      {/* 3. Chứng cứ bắt buộc */}
      <Field label="Mã chứng cứ bắt buộc" required>
        <CodeChipInput
          value={config.requiredEvidenceIds || []}
          onChange={(requiredEvidenceIds) => setConfig({ requiredEvidenceIds })}
          suggestions={suggestions}
          placeholder="VD: C02, D04, D05..."
          className="min-h-8 border-white/10 bg-black/40"
        />
        <p className={HINT_CLASS}>
          Người chơi phải chọn đủ các mã này. Để trống thì không ai qua được.
        </p>
      </Field>

      {/* 4. Chứng cứ tùy chọn */}
      <Field label="Mã chứng cứ bổ trợ / chấp nhận thêm">
        <CodeChipInput
          value={config.optionalEvidenceIds || []}
          onChange={(optionalEvidenceIds) => setConfig({ optionalEvidenceIds })}
          suggestions={suggestions}
          placeholder="VD: D01, B03..."
          className="min-h-8 border-white/10 bg-black/40"
        />
        <p className={HINT_CLASS}>
          Chọn thêm mã ngoài 2 danh sách này sẽ bị chấm sai.
        </p>
      </Field>
    </div>
  );
}
