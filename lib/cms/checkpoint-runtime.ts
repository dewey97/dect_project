import type { DbCaseCheckpoint } from "@/lib/types/database";
import type {
  Checkpoint,
  CheckpointOptionItem,
  EpilogueStoryRuntime,
} from "@/lib/types";
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
      (
        item,
      ): item is NonNullable<Checkpoint["textMatchConfig"]>["inputs"][number] =>
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

function parseEpilogueStories(
  raw: unknown,
): EpilogueStoryRuntime[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const stories = raw
    .map((s, idx): EpilogueStoryRuntime | null => {
      if (!s || typeof s !== "object") return null;
      const item = s as Record<string, unknown>;
      return {
        id: asString(item.id) || `epilogue-${idx}`,
        title: asString(item.title) || `Hậu Án ${idx + 1}`,
        monologue: asString(item.monologue) || asString(item.text),
      };
    })
    .filter((s): s is EpilogueStoryRuntime => s !== null && s.monologue !== "");
  return stories.length > 0 ? stories : undefined;
}

export function toRuntimeCheckpoint(row: DbCaseCheckpoint): Checkpoint {
  const config =
    row.answer_config && typeof row.answer_config === "object"
      ? (row.answer_config as Record<string, unknown>)
      : {};

  const options = asStringArray(config.options);
  const textMatchInputsRaw = parseTextMatchInputs(
    config.textMatchInputs || config.text_match_inputs,
  );
  const textMatchConfig =
    textMatchInputsRaw.length > 0 ? { inputs: textMatchInputsRaw } : undefined;

  const pickerFields = {
    validSuspects: asStringArray(config.validSuspects || config.valid_suspects),
    validMotives: asStringArray(config.validMotives || config.valid_motives),
    requiredEvidenceIds: asStringArray(
      config.requiredEvidenceIds || config.required_evidence_ids,
    ),
    optionalEvidenceIds: asStringArray(
      config.optionalEvidenceIds || config.optional_evidence_ids,
    ),
    motiveEvidenceIds: asStringArray(
      config.motiveEvidenceIds || config.motive_evidence_ids,
    ),
    optionalMotiveIds: asStringArray(
      config.optionalMotiveIds || config.optional_motive_ids,
    ),
    alibiEvidenceIds: asStringArray(
      config.alibiEvidenceIds || config.alibi_evidence_ids,
    ),
    optionalAlibiIds: asStringArray(
      config.optionalAlibiIds || config.optional_alibi_ids,
    ),
    contradictionEvidenceIds: asStringArray(
      config.contradictionEvidenceIds || config.contradiction_evidence_ids,
    ),
    optionalContradictionIds: asStringArray(
      config.optionalContradictionIds || config.optional_contradiction_ids,
    ),
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
        ...(asString(config.motiveContext || config.motive_context)
          ? {
              motiveContext: asString(
                config.motiveContext || config.motive_context,
              ),
            }
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
        ...(asString(config.contradictionContext || config.contradiction_context)
          ? {
              contradictionContext: asString(
                config.contradictionContext || config.contradiction_context,
              ),
            }
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
  const followupOf =
    asString(row.followup_of) ||
    asString(config.followupOf || config.followup_of);
  const rawAnswers = asString(config.rawAnswers || config.raw_answers);
  const narrative = asString(row.narrative);

  // Parse epilogue stories từ answer_config (L1 fix)
  const epilogueStories = parseEpilogueStories(
    config.epilogueStories || config.epilogue_stories,
  );

  // kind và subject_key (B2 migration 26)
  const kind = asString(row.kind) || undefined;
  const subjectKey = asString(row.subject_key) || undefined;

  return {
    id: row.checkpoint_id,
    caseId: row.case_id,
    title: row.title || "",
    question: row.question || "",
    hint: hintsList[0] || "",
    hintsList,
    options,
    correctAnswer:
      asString(config.correctAnswer || config.correct_answer) || undefined,
    unlockedEvidenceId: row.unlocked_evidence_id || undefined,
    status: "locked",
    kind,
    subjectKey,
    type: (row.type || "evidence_picker") as Checkpoint["type"],
    questionType,
    inputType: questionType,
    photoCodes: asStringArray(config.photoCodes || config.photo_codes),
    textMatchConfig,
    pickerConfig,
    epilogueStories,
    storyConfig: narrative
      ? {
          monologue: narrative,
          date: row.dossier || "",
          subtitle: row.title || "",
        }
      : undefined,
    dossier: row.dossier || undefined,
    unlocksDossier: asString(config.unlocksDossier) || undefined,
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
