import type { DbCaseCheckpoint } from "@/lib/types/database";
import type { Checkpoint, CheckpointOptionItem } from "@/lib/types";
import type { CheckpointHintGroup } from "@/lib/types/checkpoint-studio";

/**
 * Chuyển row `case_checkpoints` (Checkpoint Studio / Supabase) thành model
 * runtime `Checkpoint` mà gameplay đang dùng. Đây là nguồn duy nhất cho runtime;
 * không đọc lại tab `checkpoints` trên Google Sheets.
 */

export interface RuntimeCheckpointHint {
  group: CheckpointHintGroup;
  text: string;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,|]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function asHintGroup(value: unknown): CheckpointHintGroup {
  return value === "motive" ||
    value === "alibi" ||
    value === "contradiction" ||
    value === "general"
    ? value
    : "general";
}

export function parseRuntimeHints(raw: unknown): RuntimeCheckpointHint[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): RuntimeCheckpointHint | null => {
      if (!item || typeof item !== "object") return null;
      const hint = item as Record<string, unknown>;
      const text = asString(hint.text);
      if (!text) return null;
      return { group: asHintGroup(hint.group), text };
    })
    .filter((item): item is RuntimeCheckpointHint => item !== null);
}

function parseTextMatchInputs(
  raw: unknown,
): NonNullable<Checkpoint["textMatchConfig"]>["inputs"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const input = item as Record<string, unknown>;
      const id = asString(input.id);
      if (!id) return null;
      return {
        id,
        label: asString(input.label) || id,
        placeholder: asString(input.placeholder) || "Nhập câu trả lời...",
        validAnswers: asStringArray(input.validAnswers),
      };
    })
    .filter(
      (item): item is NonNullable<Checkpoint["textMatchConfig"]>["inputs"][number] =>
        item !== null,
    );
}

function parseAvailableEvidences(raw: unknown): CheckpointOptionItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): CheckpointOptionItem | null => {
      if (typeof item === "string") {
        const code = item.trim();
        return code ? { id: code, code, label: code } : null;
      }
      if (!item || typeof item !== "object") return null;
      const option = item as Record<string, unknown>;
      const id = asString(option.id) || asString(option.code);
      const code = asString(option.code) || id;
      if (!id && !code) return null;
      return {
        id: id || code,
        code: code || id,
        label: asString(option.label) || code || id,
        description: asString(option.description) || undefined,
      };
    })
    .filter((item): item is CheckpointOptionItem => item !== null);
}

function resolveQuestionType(
  row: DbCaseCheckpoint,
  config: Record<string, unknown>,
  options: string[],
  textMatchInputs: Checkpoint["textMatchConfig"],
  hasPickerConfig: boolean,
): string | undefined {
  const explicit = asString(row.question_type);
  if (explicit) return explicit;

  const fromConfig = asString(config.questionType);
  if (fromConfig) return fromConfig;

  const type = asString(row.type).toLowerCase();
  if (["time", "choice", "code", "text", "evidence_picker"].includes(type)) {
    return type;
  }
  if (textMatchInputs && textMatchInputs.inputs.length > 0) {
    return "text_match_3";
  }
  if (options.length > 0) return "choice";
  if (hasPickerConfig) return "evidence_picker";
  return type || undefined;
}

export function toRuntimeCheckpoint(row: DbCaseCheckpoint): Checkpoint {
  const config =
    row.answer_config && typeof row.answer_config === "object"
      ? (row.answer_config as Record<string, unknown>)
      : {};

  const options = asStringArray(config.options);
  const textMatchInputsRaw = parseTextMatchInputs(config.textMatchInputs);
  const textMatchConfig =
    textMatchInputsRaw.length > 0 ? { inputs: textMatchInputsRaw } : undefined;

  const pickerFields = {
    validSuspects: asStringArray(config.validSuspects),
    validMotives: asStringArray(config.validMotives),
    requiredEvidenceIds: asStringArray(config.requiredEvidenceIds),
    optionalEvidenceIds: asStringArray(config.optionalEvidenceIds),
    motiveEvidenceIds: asStringArray(config.motiveEvidenceIds),
    optionalMotiveIds: asStringArray(config.optionalMotiveIds),
    alibiEvidenceIds: asStringArray(config.alibiEvidenceIds),
    optionalAlibiIds: asStringArray(config.optionalAlibiIds),
    contradictionEvidenceIds: asStringArray(config.contradictionEvidenceIds),
    optionalContradictionIds: asStringArray(config.optionalContradictionIds),
  };
  const availableEvidences = parseAvailableEvidences(config.availableEvidences);
  const suspectLabel = asString(row.suspect_label);
  const evidenceStepLabel = asString(row.evidence_step_label);
  const hasPickerConfig =
    Object.values(pickerFields).some((list) => list.length > 0) ||
    availableEvidences.length > 0 ||
    Boolean(suspectLabel || evidenceStepLabel);

  const pickerConfig = hasPickerConfig
    ? {
        ...(pickerFields.validSuspects.length > 0
          ? { validSuspects: pickerFields.validSuspects }
          : {}),
        ...(pickerFields.validMotives.length > 0
          ? { validMotives: pickerFields.validMotives }
          : {}),
        ...(pickerFields.requiredEvidenceIds.length > 0
          ? { requiredEvidenceIds: pickerFields.requiredEvidenceIds }
          : {}),
        ...(pickerFields.optionalEvidenceIds.length > 0
          ? { optionalEvidenceIds: pickerFields.optionalEvidenceIds }
          : {}),
        ...(pickerFields.motiveEvidenceIds.length > 0
          ? { motiveEvidenceIds: pickerFields.motiveEvidenceIds }
          : {}),
        ...(pickerFields.optionalMotiveIds.length > 0
          ? { optionalMotiveIds: pickerFields.optionalMotiveIds }
          : {}),
        ...(pickerFields.alibiEvidenceIds.length > 0
          ? { alibiEvidenceIds: pickerFields.alibiEvidenceIds }
          : {}),
        ...(pickerFields.optionalAlibiIds.length > 0
          ? { optionalAlibiIds: pickerFields.optionalAlibiIds }
          : {}),
        ...(pickerFields.contradictionEvidenceIds.length > 0
          ? { contradictionEvidenceIds: pickerFields.contradictionEvidenceIds }
          : {}),
        ...(pickerFields.optionalContradictionIds.length > 0
          ? { optionalContradictionIds: pickerFields.optionalContradictionIds }
          : {}),
        ...(availableEvidences.length > 0 ? { availableEvidences } : {}),
        ...(suspectLabel ? { suspectLabel } : {}),
        ...(evidenceStepLabel ? { evidenceStepLabel } : {}),
      }
    : undefined;

  const hints = parseRuntimeHints(row.hints);
  const hintsList = hints.map((hint) => hint.text);
  const questionType = resolveQuestionType(
    row,
    config,
    options,
    textMatchConfig,
    hasPickerConfig,
  );
  const followupOf = asString(row.followup_of) || asString(config.followupOf);
  const rawAnswers = asString(config.rawAnswers);
  const narrative = asString(row.narrative);

  return {
    id: row.checkpoint_id,
    caseId: row.case_id,
    title: row.title || "",
    question: row.question || "",
    hint: hintsList[0] || "",
    hintsList,
    options,
    correctAnswer: asString(config.correctAnswer) || undefined,
    unlockedEvidenceId: row.unlocked_evidence_id || undefined,
    status: "locked",
    type: (row.type || "evidence_picker") as Checkpoint["type"],
    questionType,
    inputType: questionType,
    photoCodes: asStringArray(config.photoCodes),
    textMatchConfig,
    pickerConfig,
    storyConfig: narrative
      ? {
          monologue: narrative,
          date: row.dossier || "",
          subtitle: row.title || "",
        }
      : undefined,
    dossier: row.dossier || undefined,
    suspectLabel: suspectLabel || undefined,
    aiContext: asString(row.ai_context) || undefined,
    aiValidCases: asStringArray(row.ai_valid_cases),
    aiInvalidCases: asStringArray(row.ai_invalid_cases),
    followupOf: followupOf || undefined,
    suspectId: followupOf || undefined,
    rawAnswersId: rawAnswers || undefined,
    rawAnswers: rawAnswers || undefined,
    nodeId: asString(row.node_id) || row.checkpoint_id,
  };
}

export function toRuntimeCheckpoints(rows: DbCaseCheckpoint[]): Checkpoint[] {
  return rows.map(toRuntimeCheckpoint);
}
