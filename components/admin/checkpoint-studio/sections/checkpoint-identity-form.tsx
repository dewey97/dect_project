"use client";

import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CheckpointIdentityFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
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

export function CheckpointIdentityForm({
  draft,
  onChange,
}: CheckpointIdentityFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Mã checkpoint" required hint="VD: cp-000-1a">
          <Input
            value={draft.checkpointId}
            onChange={(event) => onChange({ checkpointId: event.target.value })}
            placeholder="cp-000-1a"
            className="border-white/10 bg-black/30 font-mono text-sm"
          />
        </Field>

        <Field label="Node ID" hint="Tùy chọn, mặc định dùng mã checkpoint">
          <Input
            value={draft.nodeId}
            onChange={(event) => onChange({ nodeId: event.target.value })}
            placeholder={draft.checkpointId || "c0-pin-phone"}
            className="border-white/10 bg-black/30 font-mono text-sm"
          />
        </Field>

        <Field label="Bộ hồ sơ / chặng" hint="Ban Đầu, Bộ A, Bộ B, Bộ C">
          <Input
            value={draft.dossier}
            onChange={(event) => onChange({ dossier: event.target.value })}
            placeholder="Bộ A"
            className="border-white/10 bg-black/30 text-sm"
          />
        </Field>

        <Field label="Loại checkpoint">
          <div className="flex h-8 items-center rounded-lg border border-white/10 bg-black/20 px-2.5 font-mono text-xs text-zinc-400">
            {draft.type || "evidence_picker"}
            <span className="ml-auto text-[10px] text-zinc-600">
              {draft.type === "evidence_picker"
                ? "V1 hỗ trợ biên tập"
                : "chỉ đọc — V1 chưa hỗ trợ"}
            </span>
          </div>
        </Field>
      </div>

      <Field label="Tiêu đề" hint="Hiển thị trên ghim câu hỏi">
        <Input
          value={draft.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Thẩm tra động cơ của nghi phạm"
          className="border-white/10 bg-black/30 text-sm"
        />
      </Field>

      <Field
        label="Câu hỏi / lời dẫn"
        hint="Xuống dòng thoải mái — không giới hạn"
      >
        <Textarea
          value={draft.question}
          onChange={(event) => onChange({ question: event.target.value })}
          placeholder="Hãy chọn những chứng cứ chứng minh động cơ phạm tội…"
          className="min-h-24 border-white/10 bg-black/30 text-sm"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Mở khóa vật chứng"
          hint="Mã evidence được mở sau khi giải"
        >
          <Input
            value={draft.unlockedEvidenceId}
            onChange={(event) =>
              onChange({ unlockedEvidenceId: event.target.value })
            }
            placeholder="A-12"
            className="border-white/10 bg-black/30 font-mono text-sm"
          />
        </Field>

        <Field
          label="Follow-up của"
          hint="Mã checkpoint cha, nếu là câu hỏi tiếp"
        >
          <Input
            value={draft.followupOf}
            onChange={(event) => onChange({ followupOf: event.target.value })}
            placeholder="cp-000-1a"
            className="border-white/10 bg-black/30 font-mono text-sm"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nhãn chọn nghi phạm" hint="Tiêu đề bước chọn đối tượng">
          <Input
            value={draft.suspectLabel}
            onChange={(event) => onChange({ suspectLabel: event.target.value })}
            placeholder="Chọn nghi phạm cần thẩm tra"
            className="border-white/10 bg-black/30 text-sm"
          />
        </Field>

        <Field
          label="Nhãn bước chọn chứng cứ"
          hint="Tiêu đề bước chọn vật chứng"
        >
          <Input
            value={draft.evidenceStepLabel}
            onChange={(event) =>
              onChange({ evidenceStepLabel: event.target.value })
            }
            placeholder="Chọn chứng cứ chứng minh"
            className="border-white/10 bg-black/30 text-sm"
          />
        </Field>
      </div>
    </div>
  );
}
