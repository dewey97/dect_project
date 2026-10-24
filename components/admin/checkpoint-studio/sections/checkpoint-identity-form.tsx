"use client";

import type { DbCaseCharacter, DbCaseDossier } from "@/lib/types/database";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Field } from "@/components/ui/field";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";
import { Input } from "@/components/ui/input";

interface CheckpointIdentityFormProps {
  draft: CheckpointStudioDraft;
  dossiers?: DbCaseDossier[];
  characters?: DbCaseCharacter[];
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

export function CheckpointIdentityForm({
  draft,
  dossiers = [],
  characters = [],
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
          <Field label="Nhân vật liên quan">
            <select
              value={draft.subjectKey || ""}
              onChange={(e) => onChange({ subjectKey: e.target.value })}
              className="h-7 w-full rounded-md border border-white/10 bg-[#121216] px-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
            >
              <option value="">-- Chọn nhân vật --</option>
              {characters.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name} ({c.key})
                </option>
              ))}
              {draft.subjectKey &&
                !characters.some((c) => c.key === draft.subjectKey) && (
                  <option value={draft.subjectKey}>
                    ⚠ {draft.subjectKey} (không tìm thấy)
                  </option>
                )}
            </select>
          </Field>
        )}
      </div>

      <Field label="Câu hỏi">
        <AutoGrowTextarea
          value={draft.question}
          onChange={(event) => onChange({ question: event.target.value })}
          minRows={1}
          className="min-h-8"
        />
      </Field>

      <details className="pt-1 text-xs text-zinc-500">
        <summary className="cursor-pointer select-none text-[11px] font-medium text-zinc-500 hover:text-zinc-400">
          Tùy chọn nâng cao
        </summary>
        <div className="mt-2 space-y-2 border-t border-white/5 pt-2">
          <Field label="Mã định danh">
            <Input
              value={draft.checkpointId || ""}
              onChange={(e) => onChange({ checkpointId: e.target.value })}
              placeholder="VD: cp_01..."
              className={INPUT_CLASS}
            />
          </Field>
        </div>
      </details>
    </div>
  );
}
