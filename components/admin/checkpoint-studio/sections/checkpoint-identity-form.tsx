"use client";

import type { DbCaseDossier } from "@/lib/types/database";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { AutoExpandingTextarea } from "../auto-expanding-textarea";
import { Input } from "@/components/ui/input";

interface CheckpointIdentityFormProps {
  draft: CheckpointStudioDraft;
  dossiers?: DbCaseDossier[];
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const INPUT_CLASS = "h-7 border-white/10 bg-black/30 text-xs text-zinc-100";

const KIND_OPTIONS = [
  { value: "phone_lookup", label: "📞 Tra cứu SĐT / Danh bạ" },
  { value: "suspect_interrogation", label: "🕵️ Thẩm tra nghi phạm (3 lớp)" },
  { value: "followup", label: "❓ Câu hỏi phụ sau thẩm tra" },
  { value: "indictment", label: "⚖️ Cáo trạng kết án" },
  { value: "choice", label: "🔘 Trắc nghiệm" },
  { value: "code", label: "🔢 Nhập mã số / Mật khẩu" },
  { value: "time", label: "⏰ Mốc thời gian" },
  { value: "text", label: "📝 Nhập văn bản / Tự luận" },
  { value: "epilogue", label: "📜 Hậu án" },
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
  const isEpilogue =
    draft.kind === "epilogue" ||
    draft.type === "epilogue" ||
    draft.checkpointId.includes("epilogue");
  if (isEpilogue) return null;

  const currentKind =
    draft.kind ||
    (draft.type === "evidence_picker"
      ? "suspect_interrogation"
      : draft.type || "text");

  const handleKindChange = (nextKind: string) => {
    // Map kind sang type để tương thích ngược với runtime cũ
    let legacyType = nextKind;
    if (nextKind === "suspect_interrogation") legacyType = "evidence_picker";
    else if (nextKind === "phone_lookup") legacyType = "text";
    else if (nextKind === "indictment") legacyType = "evidence_picker";

    onChange({
      kind: nextKind,
      type: legacyType,
      questionType: nextKind,
    });
  };

  const showSubjectKey =
    currentKind === "suspect_interrogation" || currentKind === "followup";

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

      <div className={showSubjectKey ? "grid grid-cols-2 gap-2" : ""}>
        <Field label="Loại Checkpoint (Kind)" required>
          <select
            value={currentKind}
            onChange={(e) => handleKindChange(e.target.value)}
            className="h-7 w-full rounded-md border border-white/10 bg-[#121216] px-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
          >
            {KIND_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        {showSubjectKey && (
          <Field label="Khóa nhân vật (subjectKey)">
            <Input
              value={draft.subjectKey || ""}
              onChange={(e) => onChange({ subjectKey: e.target.value })}
              placeholder="VD: vu, tung, ha..."
              className={INPUT_CLASS}
            />
          </Field>
        )}
      </div>

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
