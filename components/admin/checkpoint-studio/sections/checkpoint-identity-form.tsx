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
  { value: "phone_lookup", label: "Tra cứu" },
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
  const isIndictment =
    draft.kind === "indictment" ||
    draft.type === "indictment" ||
    draft.checkpointId.includes("indictment");
  if (isEpilogue || isIndictment) return null;

  const rawKind = draft.kind || draft.type || "text";
  const currentKind =
    rawKind === "time"
      ? "code"
      : rawKind === "suspect_interrogation"
        ? "evidence_picker"
        : rawKind === "followup"
          ? (draft.questionType || draft.type || "code")
          : rawKind;

  const handleKindChange = (nextKind: string) => {
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
      {/* 1. Nhóm cấu hình Checkpoint, Mở khóa hồ sơ & Phụ thuộc */}
      <div className="rounded-md border border-white/5 bg-[#121216] divide-y divide-white/5">
        {/* Dropdown Checkpoint */}
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
          <span className="text-xs font-medium text-zinc-300 shrink-0">
            Checkpoint
          </span>
          <select
            value={currentKind}
            onChange={(e) => handleKindChange(e.target.value)}
            className="h-7 w-auto min-w-[170px] max-w-[210px] rounded border border-white/10 bg-black/50 px-2 text-xs font-medium text-amber-300 outline-none focus:border-amber-400 cursor-pointer"
          >
            {KIND_OPTIONS.map((item) => (
              <option
                key={item.value}
                value={item.value}
                className="bg-[#121216] text-zinc-200"
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mở khóa hồ sơ */}
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
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

        {/* Phụ thuộc */}
        {checkpoints && checkpoints.length > 0 && (
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
            <span className="text-xs font-medium text-zinc-300 shrink-0">
              Phụ thuộc
            </span>
            <select
              value={(draft.dependsOn && draft.dependsOn[0]) || ""}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ dependsOn: val ? [val] : [] });
              }}
              className="h-7 w-auto min-w-[170px] max-w-[210px] rounded border border-white/10 bg-black/50 px-2 text-xs font-medium text-zinc-200 outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="" className="text-zinc-500 bg-[#101014]">
                -- Không phụ thuộc (Mở sẵn) --
              </option>
              {checkpoints
                .filter((c) => c.checkpoint_id !== draft.checkpointId)
                .map((c) => (
                  <option
                    key={c.checkpoint_id}
                    value={c.checkpoint_id}
                    className="text-zinc-200 bg-[#121216]"
                  >
                    {c.title || "Checkpoint không tên"}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Câu hỏi */}
      <Field label="Câu hỏi">
        <AutoGrowTextarea
          value={draft.question}
          onChange={(event) => onChange({ question: event.target.value })}
          minRows={1}
          className="min-h-8"
        />
      </Field>
    </div>
  );
}
