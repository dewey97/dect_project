"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Input } from "@/components/ui/input";
import { CodeChipInput } from "../code-chip-input";

interface FollowupConfigFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const INPUT_CLASS = "h-7 border-white/10 bg-black/40 text-xs text-zinc-100";

const FOLLOWUP_TYPES = [
  { value: "time", label: "Mốc thời gian (VD: 21:15)" },
  { value: "choice", label: "Trắc nghiệm lựa chọn" },
  { value: "code", label: "Mật khẩu / Mã số (VD: 120713)" },
  { value: "text", label: "Nhập văn bản tự do" },
];

export function FollowupConfigForm({
  draft,
  onChange,
}: FollowupConfigFormProps) {
  const config = draft.answerConfig;
  const questionType = draft.questionType || "time";

  const setConfig = (patch: Partial<typeof config>) => {
    onChange({ answerConfig: { ...config, ...patch } });
  };

  return (
    <div className="space-y-3">
      <Field label="Loại câu hỏi phụ" required>
        <select
          value={questionType}
          onChange={(e) =>
            onChange({
              questionType: e.target.value,
              type: e.target.value,
            })
          }
          className="h-7 w-full rounded-md border border-white/10 bg-[#121216] px-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
        >
          {FOLLOWUP_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Phương án trắc nghiệm nếu là choice */}
      {questionType === "choice" && (
        <Field label="Các phương án lựa chọn (Enter để thêm)" required>
          <CodeChipInput
            value={config.options || []}
            onChange={(options) => setConfig({ options })}
            placeholder="Nhập phương án rồi Enter..."
            className="min-h-8 border-white/10 bg-black/40"
          />
        </Field>
      )}

      {/* Đáp án đúng */}
      <Field
        label={
          questionType === "time"
            ? "Mốc thời gian đúng (định dạng HH:MM, VD: 21:15)"
            : questionType === "code"
              ? "Mã số / Mật khẩu đúng (VD: 120713)"
              : "Đáp án đúng"
        }
        required
      >
        <Input
          value={config.correctAnswer || ""}
          onChange={(e) => setConfig({ correctAnswer: e.target.value })}
          placeholder={
            questionType === "time"
              ? "21:15"
              : questionType === "code"
                ? "120713"
                : "Nhập đáp án đúng..."
          }
          className={INPUT_CLASS}
        />
      </Field>

      {/* Mã ảnh mở khóa */}
      <Field label="Mã ảnh mở khóa sau khi giải đúng (nếu có)">
        <CodeChipInput
          value={config.photoCodes || []}
          onChange={(photoCodes) => setConfig({ photoCodes })}
          placeholder="VD: photo_01, photo_02..."
          className="min-h-8 border-white/10 bg-black/40"
        />
      </Field>

      {/* Checkpoint gốc (followup_of) */}
      <Field label="Mã Checkpoint gốc cần vượt qua trước">
        <Input
          value={draft.followupOf || ""}
          onChange={(e) => onChange({ followupOf: e.target.value })}
          placeholder="VD: cp-000-1a"
          className={INPUT_CLASS}
        />
      </Field>
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
