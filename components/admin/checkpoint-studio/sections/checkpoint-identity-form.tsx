"use client";

import type {
  DbCaseCharacter,
  DbCaseDossier,
  DbCaseCheckpoint,
} from "@/lib/types/database";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Field } from "@/components/ui/field";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";

interface CheckpointIdentityFormProps {
  draft: CheckpointStudioDraft;
  dossiers?: DbCaseDossier[];
  characters?: DbCaseCharacter[];
  checkpoints?: DbCaseCheckpoint[];
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const KIND_OPTIONS = [
  { value: "code", label: "So khớp" },
  { value: "choice", label: "Trắc nghiệm" },
  { value: "text", label: "Tự do" },
  { value: "evidence_picker", label: "Chọn tài liệu" },
  { value: "phone_lookup", label: "Tra cứu SĐT / Danh bạ" },
  { value: "followup", label: "Câu hỏi phụ sau thẩm tra" },
  { value: "indictment", label: "Cáo trạng kết án" },
  { value: "epilogue", label: "Hậu án" },
];

export function CheckpointIdentityForm({
  draft,
  dossiers = [],
  checkpoints = [],
  onChange,
}: CheckpointIdentityFormProps) {
  const isEpilogue =
    draft.kind === "epilogue" ||
    draft.type === "epilogue" ||
    draft.checkpointId.includes("epilogue");
  if (isEpilogue) return null;

  const rawKind = draft.kind || draft.type || "text";
  const currentKind =
    rawKind === "time"
      ? "code"
      : rawKind === "suspect_interrogation"
        ? "evidence_picker"
        : rawKind;

  const handleKindChange = (nextKind: string) => {
    // Map kind sang type de tuong thich nguoc
    let legacyType = nextKind;
    if (nextKind === "phone_lookup") legacyType = "text";
    else if (nextKind === "indictment" || nextKind === "evidence_picker")
      legacyType = "evidence_picker";

    onChange({
      kind: nextKind,
      type: legacyType,
      questionType: nextKind,
    });
  };

  return (
    <div className="space-y-2.5">
      {/* 1. Loại Checkpoint đưa lên đầu với Title 'Checkpoint' */}
      <Field label="Checkpoint" required>
        <select
          value={currentKind}
          onChange={(e) => handleKindChange(e.target.value)}
          className="h-8 w-full rounded-md border border-white/10 bg-[#121216] px-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50 cursor-pointer"
        >
          {KIND_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>

      {/* 2. Mở khóa hồ sơ cùng dòng với dropdown */}
      <div className="flex items-center justify-between gap-2 rounded-md border border-white/5 bg-[#121216] px-2.5 py-1.5">
        <span className="text-xs font-medium text-zinc-300 shrink-0">
          Mở khóa hồ sơ
        </span>
        <select
          value={draft.unlocksDossier || ""}
          onChange={(event) => onChange({ unlocksDossier: event.target.value })}
          className="h-7 w-auto min-w-[170px] max-w-[210px] rounded border border-white/10 bg-black/50 px-2 text-xs font-medium text-purple-200 outline-none focus:border-purple-400 cursor-pointer"
        >
          <option value="" className="text-zinc-500 bg-[#101014]">
            -- Không mở khóa --
          </option>
          {dossiers.map((d) => (
            <option
              key={d.dossier_key}
              value={d.title || d.dossier_key}
              className="text-purple-200 bg-[#161220]"
            >
              {d.title || d.dossier_key}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Câu hỏi */}
      <Field label="Câu hỏi">
        <AutoGrowTextarea
          value={draft.question}
          onChange={(event) => onChange({ question: event.target.value })}
          minRows={1}
          className="min-h-8"
        />
      </Field>

      <div className="space-y-2.5 border-t border-white/5 pt-2">
        {/* Cấu hình hiển thị ghim */}
        <div className="space-y-1.5 rounded border border-white/5 bg-black/20 p-2">
          <label className="flex items-center gap-2 text-[11px] text-zinc-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!draft.boardConfig?.hidden}
              onChange={(e) => {
                onChange({
                  boardConfig: {
                    ...(draft.boardConfig || {}),
                    hidden: !e.target.checked,
                  },
                });
              }}
              className="rounded border-zinc-700 bg-zinc-900 text-amber-500"
            />
            <span className="font-medium">Hiển thị ghim</span>
          </label>
        </div>

        {checkpoints && checkpoints.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="shrink-0 text-xs font-semibold text-zinc-300">
              Phụ thuộc
            </label>
            <select
              value={(draft.dependsOn && draft.dependsOn[0]) || ""}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ dependsOn: val ? [val] : [] });
              }}
              className="h-8 flex-1 px-2 rounded-md bg-black/40 border border-white/10 text-xs text-zinc-200 outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="">-- Không phụ thuộc (Mở sẵn) --</option>
              {checkpoints
                .filter((c) => c.checkpoint_id !== draft.checkpointId)
                .map((c) => (
                  <option key={c.checkpoint_id} value={c.checkpoint_id}>
                    {c.title || "Checkpoint không tên"}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
