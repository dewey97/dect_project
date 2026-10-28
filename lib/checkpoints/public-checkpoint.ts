import type { DbCaseCheckpoint } from "@/lib/types/database";
import { asString, asStringArray } from "@/lib/text";

/**
 * Lọc row `case_checkpoints` trước khi gửi xuống client gameplay.
 *
 * Allowlist: chỉ giữ dữ liệu hiển thị. Đáp án (`correctAnswer`, `validAnswers`,
 * `validSuspects`, `validMotives`, các mã chứng cứ đúng) và cột `ai_*` ở lại
 * server; chấm điểm qua `/api/checkpoints/verify` và `/api/scan-answer`.
 */
export type PublicCheckpointRow = Omit<
  DbCaseCheckpoint,
  "answer_config" | "ai_context" | "ai_valid_cases" | "ai_invalid_cases"
> & {
  answer_config: PublicAnswerConfig;
};

export interface PublicAnswerConfig {
  inputType?: string;
  options?: string[];
  photoCodes?: string[];
  unlocksDossier?: string;
  followupOf?: string;
  textMatchInputs?: { id: string; label: string; placeholder: string }[];
  availableEvidences?: unknown[];
  epilogueStories?: unknown[];
  /** Thẩm tra 2 lớp: lớp nào có yêu cầu mã chứng cứ. */
  hasMotive?: boolean;
  hasContradiction?: boolean;
}

export function toPublicCheckpointRow(
  row: DbCaseCheckpoint,
): PublicCheckpointRow {
  const {
    answer_config,
    ai_context: _aiContext,
    ai_valid_cases: _aiValid,
    ai_invalid_cases: _aiInvalid,
    ...rest
  } = row;
  const cfg = (answer_config ?? {}) as Record<string, unknown>;

  const textMatchInputs = Array.isArray(cfg.textMatchInputs)
    ? (cfg.textMatchInputs as Record<string, unknown>[]).map((input) => ({
        id: asString(input.id),
        label: asString(input.label) || asString(input.id),
        placeholder: asString(input.placeholder),
      }))
    : undefined;

  const publicConfig: PublicAnswerConfig = {
    inputType:
      asString(cfg.inputType || cfg.input_type || cfg.questionType) ||
      undefined,
    options: asStringArray(cfg.options),
    photoCodes: asStringArray(cfg.photoCodes || cfg.photo_codes),
    unlocksDossier:
      asString(cfg.unlocksDossier || cfg.unlocks_dossier) || undefined,
    followupOf: asString(cfg.followupOf || cfg.followup_of) || undefined,
    textMatchInputs,
    availableEvidences: Array.isArray(cfg.availableEvidences)
      ? cfg.availableEvidences
      : undefined,
    epilogueStories: Array.isArray(cfg.epilogueStories)
      ? cfg.epilogueStories
      : undefined,
    hasMotive:
      asStringArray(cfg.motiveEvidenceIds || cfg.motive_evidence_ids).length >
      0,
    hasContradiction:
      asStringArray(
        cfg.contradictionEvidenceIds || cfg.contradiction_evidence_ids,
      ).length > 0,
  };

  return { ...rest, answer_config: publicConfig };
}
