"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CheckpointIdentityFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const INPUT_CLASS = "h-7 border-white/10 bg-black/30 text-xs";

const QUESTION_TYPES = [
  { value: "evidence_picker", label: "Thẩm tra vật chứng (3 lớp)" },
  { value: "choice", label: "Trắc nghiệm" },
  { value: "text", label: "Nhập văn bản / Tự luận" },
  { value: "code", label: "Nhập mã số / Mật mã" },
  { value: "time", label: "Mốc thời gian" },
];

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
    <label className="block min-w-0 space-y-1">
      <span className="flex items-baseline gap-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
        {required && <span className="text-amber-400">*</span>}
      </span>
      {children}
    </label>
  );
}

export function CheckpointIdentityForm({
  draft,
  onChange,
}: CheckpointIdentityFormProps) {
  const isEvidencePicker = (draft.type || "evidence_picker") === "evidence_picker";

  return (
    <div className="space-y-2.5">
      <Field label="Tiêu đề" required>
        <Input
          value={draft.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Tiêu đề checkpoint…"
          className={INPUT_CLASS}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Thuộc bộ hồ sơ">
          <Input
            value={draft.dossier}
            onChange={(event) => onChange({ dossier: event.target.value })}
            placeholder="Ban Đầu, Bộ A…"
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="Mở khóa bộ hồ sơ (khi giải xong)">
          <Input
            value={draft.unlocksDossier}
            onChange={(event) =>
              onChange({ unlocksDossier: event.target.value })
            }
            placeholder="Bộ A, Bộ B, Kết Luận…"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Loại câu hỏi">
          <select
            value={draft.type || "evidence_picker"}
            onChange={(event) =>
              onChange({
                type: event.target.value,
                questionType: event.target.value,
              })
            }
            className="h-7 w-full rounded-md border border-white/10 bg-[#121216] px-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
          >
            {QUESTION_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Mở khóa vật chứng (nếu có)">
          <Input
            value={draft.unlockedEvidenceId}
            onChange={(event) =>
              onChange({ unlockedEvidenceId: event.target.value })
            }
            placeholder="vd: A-12, C-05…"
            className={`${INPUT_CLASS} font-mono`}
          />
        </Field>
      </div>

      <Field label="Câu hỏi">
        <Textarea
          value={draft.question}
          onChange={(event) => onChange({ question: event.target.value })}
          placeholder="Nội dung câu hỏi đặt ra cho người điều tra…"
          className="min-h-16 border-white/10 bg-black/30 text-xs"
        />
      </Field>

      {/* Chỉ hiển thị nhãn bước khi là câu hỏi Thẩm tra vật chứng */}
      {isEvidencePicker && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
          <Field label="Nhãn nghi phạm">
            <Input
              value={draft.suspectLabel}
              onChange={(event) =>
                onChange({ suspectLabel: event.target.value })
              }
              placeholder="Chọn nghi phạm"
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="Nhãn chứng cứ">
            <Input
              value={draft.evidenceStepLabel}
              onChange={(event) =>
                onChange({ evidenceStepLabel: event.target.value })
              }
              placeholder="Chọn chứng cứ"
              className={INPUT_CLASS}
            />
          </Field>
        </div>
      )}
    </div>
  );
}
