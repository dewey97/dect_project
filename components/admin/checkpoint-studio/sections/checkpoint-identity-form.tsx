"use client";

import type { DbCaseDossier } from "@/lib/types/database";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { AutoExpandingTextarea } from "../auto-expanding-textarea";

interface CheckpointIdentityFormProps {
  draft: CheckpointStudioDraft;
  dossiers?: DbCaseDossier[];
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const INPUT_CLASS = "h-7 border-white/10 bg-black/30 text-xs";

const QUESTION_TYPES = [
  { value: "evidence_picker", label: "Thẩm tra vật chứng (Động cơ & Mâu thuẫn)" },
  { value: "choice", label: "Trắc nghiệm" },
  { value: "code", label: "Nhập mã số / Thời gian" },
  { value: "text", label: "Nhập văn bản / Tự luận" },
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
  dossiers = [],
  onChange,
}: CheckpointIdentityFormProps) {
  const isEpilogue = draft.type === "epilogue" || draft.checkpointId.includes("epilogue");
  if (isEpilogue) return null;

  return (
    <div className="space-y-2.5">
      {/* Chọn Bộ Hồ Sơ Mở Khóa */}
      <select
        value={draft.unlocksDossier || ""}
        onChange={(event) => onChange({ unlocksDossier: event.target.value })}
        className="h-7 w-full rounded-md border border-purple-500/30 bg-[#14101e] px-2 text-xs font-medium text-purple-200 outline-none focus:border-purple-400"
      >
        <option value="" className="text-zinc-500 bg-[#101014]">
          -- Không mở khóa hồ sơ --
        </option>
        {dossiers.map((d) => (
          <option
            key={d.dossier_key}
            value={d.title || d.dossier_key}
            className="text-purple-200 bg-[#161220]"
          >
            📁 {d.title || d.dossier_key}
          </option>
        ))}
      </select>

      <Field label="Loại checkpoint">
        <select
          value={draft.type === "time" ? "code" : (draft.type || "evidence_picker")}
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

      <Field label="Câu hỏi">
        <AutoExpandingTextarea
          value={draft.question}
          onChange={(event) => onChange({ question: event.target.value })}
          minRows={1}
          className="min-h-8"
        />
      </Field>
    </div>
  );
}
