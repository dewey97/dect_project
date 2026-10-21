"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CheckpointIdentityFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const INPUT_CLASS = "h-7 border-white/10 bg-black/30 text-xs";

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
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Node ID" required>
          <Input
            value={draft.nodeId}
            onChange={(event) => onChange({ nodeId: event.target.value })}
            placeholder="c0-pin-phone"
            className={`${INPUT_CLASS} font-mono`}
          />
        </Field>

        <Field label="Bộ hồ sơ">
          <Input
            value={draft.dossier}
            onChange={(event) => onChange({ dossier: event.target.value })}
            placeholder="Bộ A"
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="Loại">
          <div className="flex h-7 items-center truncate rounded-lg border border-white/10 bg-black/20 px-2 font-mono text-[11px] text-zinc-400">
            {draft.type || "evidence_picker"}
          </div>
        </Field>

        <Field label="Khóa">
          <Input
            value={draft.checkpointId}
            onChange={(event) =>
              onChange({ checkpointId: event.target.value })
            }
            placeholder={draft.nodeId || "tự động"}
            disabled={Boolean(draft.id)}
            className={`${INPUT_CLASS} font-mono`}
          />
        </Field>
      </div>

      <Field label="Tiêu đề">
        <Input
          value={draft.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Thẩm tra động cơ của nghi phạm"
          className={INPUT_CLASS}
        />
      </Field>

      <Field label="Câu hỏi">
        <Textarea
          value={draft.question}
          onChange={(event) => onChange({ question: event.target.value })}
          placeholder="Hãy chọn những chứng cứ chứng minh động cơ phạm tội…"
          className="min-h-16 border-white/10 bg-black/30 text-xs"
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Mở khóa vật chứng">
          <Input
            value={draft.unlockedEvidenceId}
            onChange={(event) =>
              onChange({ unlockedEvidenceId: event.target.value })
            }
            placeholder="A-12"
            className={`${INPUT_CLASS} font-mono`}
          />
        </Field>

        <Field label="Follow-up của">
          <Input
            value={draft.followupOf}
            onChange={(event) => onChange({ followupOf: event.target.value })}
            placeholder="mã tham chiếu"
            className={`${INPUT_CLASS} font-mono`}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
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
    </div>
  );
}
