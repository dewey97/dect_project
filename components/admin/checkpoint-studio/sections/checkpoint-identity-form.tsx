"use client";

import type {
  DbCaseCharacter,
  DbCaseDossier,
  DbCaseCheckpoint,
} from "@/lib/types/database";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import { Field } from "@/components/ui/field";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";
import { Input } from "@/components/ui/input";

interface CheckpointIdentityFormProps {
  draft: CheckpointStudioDraft;
  dossiers?: DbCaseDossier[];
  characters?: DbCaseCharacter[];
  checkpoints?: DbCaseCheckpoint[];
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

const INPUT_CLASS = "h-7 border-white/10 bg-black/30 text-xs text-zinc-100";

const KIND_OPTIONS = [
  { value: "phone_lookup", label: "Tra cứu SĐT / Danh bạ" },
  { value: "followup", label: "Câu hỏi phụ sau thẩm tra" },
  { value: "indictment", label: "Cáo trạng kết án" },
  { value: "choice", label: "Trắc nghiệm" },
  { value: "code", label: "Nhập mã số / Mật khẩu" },
  { value: "time", label: "Mốc thời gian" },
  { value: "text", label: "Nhập văn bản / Tự luận" },
  { value: "epilogue", label: "Hậu án" },
];

export function CheckpointIdentityForm({
  draft,
  dossiers = [],
  characters = [],
  checkpoints = [],
  onChange,
}: CheckpointIdentityFormProps) {
  const isEpilogue =
    draft.kind === "epilogue" ||
    draft.type === "epilogue" ||
    draft.checkpointId.includes("epilogue");
  if (isEpilogue) return null;

  const currentKind = draft.kind || draft.type || "text";

  const handleKindChange = (nextKind: string) => {
    // Map kind sang type de tuong thich nguoc
    let legacyType = nextKind;
    if (nextKind === "phone_lookup") legacyType = "text";
    else if (nextKind === "indictment") legacyType = "evidence_picker";

    onChange({
      kind: nextKind,
      type: legacyType,
      questionType: nextKind,
    });
  };

  const showSubjectKey = currentKind === "followup";

  return (
    <div className="space-y-2.5">
      {/* 1. Loại Checkpoint đưa lên đầu với Title 'Checkpoint' */}
      <div className={showSubjectKey ? "grid grid-cols-2 gap-2" : ""}>
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

        {showSubjectKey && (
          <Field label="Nhân vật liên quan">
            <select
              value={draft.subjectKey || ""}
              onChange={(e) => onChange({ subjectKey: e.target.value })}
              className="h-8 w-full rounded-md border border-white/10 bg-[#121216] px-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="">-- Chọn nhân vật --</option>
              {characters.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {/* 2. Mở khóa hồ sơ gọn gàng, bỏ icon */}
      <Field label="Mở khóa hồ sơ">
        <select
          value={draft.unlocksDossier || ""}
          onChange={(event) => onChange({ unlocksDossier: event.target.value })}
          className="h-8 w-full rounded-md border border-white/10 bg-black/40 px-2 text-xs font-medium text-purple-200 outline-none focus:border-purple-400 cursor-pointer"
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
              {d.title || d.dossier_key}
            </option>
          ))}
        </select>
      </Field>

      {/* 3. Câu hỏi */}
      <Field label="Câu hỏi">
        <AutoGrowTextarea
          value={draft.question}
          onChange={(event) => onChange({ question: event.target.value })}
          minRows={1}
          className="min-h-8"
        />
      </Field>

      <details className="pt-1 text-xs text-zinc-500" open>
        <summary className="cursor-pointer select-none text-[11px] font-medium text-zinc-500 hover:text-zinc-400">
          Tùy chọn nâng cao & Phụ thuộc
        </summary>
        <div className="mt-2 space-y-2.5 border-t border-white/5 pt-2">
          

          {/* Cấu hình hiển thị trên Bảng điều tra */}
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
              <span className="font-medium">Hiển thị ghim trên Bảng điều tra</span>
            </label>

            {!draft.boardConfig?.hidden && (
              <Field label="Tiêu đề ghim tùy chỉnh (nếu muốn khác tiêu đề checkpoint)">
                <Input
                  value={draft.boardConfig?.pin_title || ""}
                  onChange={(e) =>
                    onChange({
                      boardConfig: {
                        ...(draft.boardConfig || {}),
                        pin_title: e.target.value,
                      },
                    })
                  }
                  placeholder="Để trống nếu lấy theo tiêu đề checkpoint"
                  className={INPUT_CLASS}
                />
              </Field>
            )}
          </div>

          {checkpoints && checkpoints.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Phụ thuộc
              </label>
              <select
                value={(draft.dependsOn && draft.dependsOn[0]) || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({ dependsOn: val ? [val] : [] });
                }}
                className="w-full h-8 px-2 rounded-md bg-black/40 border border-white/10 text-xs text-zinc-200 outline-none focus:border-amber-400 cursor-pointer"
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
      </details>
    </div>
  );
}
