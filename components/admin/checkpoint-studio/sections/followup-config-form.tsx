"use client";

import type { DbCaseCheckpoint } from "@/lib/types/database";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CodeChipInput } from "../code-chip-input";

interface FollowupConfigFormProps {
  draft: CheckpointStudioDraft;
  checkpoints?: DbCaseCheckpoint[];
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
  checkpoints = [],
  onChange,
}: FollowupConfigFormProps) {
  const config = draft.answerConfig;
  const questionType = draft.questionType || "time";

  const interrogationCheckpoints = checkpoints.filter(
    (c) => c.kind === "suspect_interrogation" || c.type === "evidence_picker",
  );

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

      {/* Checkpoint thẩm tra gốc */}
      <Field label="Checkpoint thẩm tra gốc">
        <select
          value={draft.followupOf || ""}
          onChange={(e) => onChange({ followupOf: e.target.value })}
          className="h-7 w-full rounded-md border border-white/10 bg-[#121216] px-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
        >
          <option value="">-- Chọn checkpoint gốc --</option>
          {interrogationCheckpoints.map((cp) => (
            <option key={cp.checkpoint_id} value={cp.checkpoint_id}>
              {cp.title
                ? `${cp.title} (${cp.checkpoint_id})`
                : cp.checkpoint_id}
            </option>
          ))}
          {draft.followupOf &&
            !interrogationCheckpoints.some(
              (cp) => cp.checkpoint_id === draft.followupOf,
            ) && (
              <option value={draft.followupOf}>
                ⚠ {draft.followupOf} (không tìm thấy)
              </option>
            )}
        </select>
      </Field>
    </div>
  );
}
