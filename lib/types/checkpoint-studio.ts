import type { DbCaseCheckpoint } from "./database";

/**
 * Checkpoint Studio (Admin) — model biên tập có cấu trúc.
 *
 * Lưu ý: đây là nguồn dữ liệu RIÊNG của Studio. Runtime gameplay hiện vẫn đọc
 * Google Sheets qua `lib/cms/checkpoint-cms.ts`; chưa có kết nối nào giữa hai bên.
 */

/**
 * Loại checkpoint đọc từ dữ liệu gốc. Studio V1 chỉ biên tập được
 * `evidence_picker`; các loại khác được giữ nguyên và hiển thị read-only.
 */
export type CheckpointStudioType = string;

export type CheckpointHintGroup =
  "general" | "motive" | "alibi" | "contradiction";

export interface CheckpointHint {
  group: CheckpointHintGroup;
  text: string;
}

/** Cấu hình đáp án cho checkpoint thẩm tra nghi phạm (3 lớp). */
export interface EvidencePickerConfig {
  validSuspects: string[];
  validMotives: string[];
  requiredEvidenceIds: string[];
  optionalEvidenceIds: string[];
  motiveEvidenceIds: string[];
  optionalMotiveIds: string[];
  alibiEvidenceIds: string[];
  optionalAlibiIds: string[];
  contradictionEvidenceIds: string[];
  optionalContradictionIds: string[];
}

export interface CheckpointStudioDraft {
  id?: string;
  caseId: string;
  checkpointId: string;
  nodeId: string;
  dossier: string;
  title: string;
  question: string;
  type: CheckpointStudioType;
  questionType: string;
  unlockedEvidenceId: string;
  followupOf: string;
  suspectLabel: string;
  evidenceStepLabel: string;
  answerConfig: EvidencePickerConfig;
  hints: CheckpointHint[];
  narrative: string;
  aiContext: string;
  aiValidCases: string[];
  aiInvalidCases: string[];
}

export const EMPTY_EVIDENCE_CONFIG: EvidencePickerConfig = {
  validSuspects: [],
  validMotives: [],
  requiredEvidenceIds: [],
  optionalEvidenceIds: [],
  motiveEvidenceIds: [],
  optionalMotiveIds: [],
  alibiEvidenceIds: [],
  optionalAlibiIds: [],
  contradictionEvidenceIds: [],
  optionalContradictionIds: [],
};

export function createEmptyDraft(caseId: string): CheckpointStudioDraft {
  return {
    caseId,
    checkpointId: "",
    nodeId: "",
    dossier: "",
    title: "",
    question: "",
    type: "evidence_picker",
    questionType: "evidence_picker",
    unlockedEvidenceId: "",
    followupOf: "",
    suspectLabel: "",
    evidenceStepLabel: "",
    answerConfig: { ...EMPTY_EVIDENCE_CONFIG },
    hints: [],
    narrative: "",
    aiContext: "",
    aiValidCases: [],
    aiInvalidCases: [],
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
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

function normalizeHintGroup(value: unknown): CheckpointHintGroup {
  return value === "motive" ||
    value === "alibi" ||
    value === "contradiction" ||
    value === "general"
    ? value
    : "general";
}

function parseConfig(
  raw: Record<string, unknown> | null,
): EvidencePickerConfig {
  const source = raw ?? {};
  return {
    validSuspects: asStringArray(source.validSuspects),
    validMotives: asStringArray(source.validMotives),
    requiredEvidenceIds: asStringArray(source.requiredEvidenceIds),
    optionalEvidenceIds: asStringArray(source.optionalEvidenceIds),
    motiveEvidenceIds: asStringArray(source.motiveEvidenceIds),
    optionalMotiveIds: asStringArray(source.optionalMotiveIds),
    alibiEvidenceIds: asStringArray(source.alibiEvidenceIds),
    optionalAlibiIds: asStringArray(source.optionalAlibiIds),
    contradictionEvidenceIds: asStringArray(source.contradictionEvidenceIds),
    optionalContradictionIds: asStringArray(source.optionalContradictionIds),
  };
}

function parseHints(raw: unknown): CheckpointHint[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): CheckpointHint | null => {
      if (!item || typeof item !== "object") return null;
      const hint = item as Record<string, unknown>;
      const text = asString(hint.text);
      if (!text) return null;
      return { group: normalizeHintGroup(hint.group), text };
    })
    .filter((item): item is CheckpointHint => item !== null);
}

/** Chuyển row Supabase thành draft phẳng cho form. */
export function toDraft(row: DbCaseCheckpoint): CheckpointStudioDraft {
  return {
    id: row.id,
    caseId: row.case_id,
    checkpointId: asString(row.checkpoint_id),
    nodeId: asString(row.node_id),
    dossier: asString(row.dossier),
    title: asString(row.title),
    question: asString(row.question),
    type: asString(row.type) || "evidence_picker",
    questionType: asString(row.question_type) || "evidence_picker",
    unlockedEvidenceId: asString(row.unlocked_evidence_id),
    followupOf: asString(row.followup_of),
    suspectLabel: asString(row.suspect_label),
    evidenceStepLabel: asString(row.evidence_step_label),
    answerConfig: parseConfig(row.answer_config),
    hints: parseHints(row.hints),
    narrative: asString(row.narrative),
    aiContext: asString(row.ai_context),
    aiValidCases: asStringArray(row.ai_valid_cases),
    aiInvalidCases: asStringArray(row.ai_invalid_cases),
  };
}

function cleanList(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

export type CaseCheckpointPayload = Omit<
  DbCaseCheckpoint,
  "id" | "created_at" | "updated_at"
>;

/** Chuyển draft thành payload insert/update. */
export function toRowPayload(
  draft: CheckpointStudioDraft,
): CaseCheckpointPayload {
  return {
    case_id: draft.caseId.trim() || "case_000",
    checkpoint_id: draft.checkpointId.trim(),
    node_id: draft.nodeId.trim() || null,
    dossier: draft.dossier.trim() || null,
    title: draft.title.trim(),
    question: draft.question.trim(),
    type: draft.type.trim() || "evidence_picker",
    question_type: draft.questionType.trim() || draft.type.trim() || null,
    unlocked_evidence_id: draft.unlockedEvidenceId.trim() || null,
    followup_of: draft.followupOf.trim() || null,
    suspect_label: draft.suspectLabel.trim() || null,
    evidence_step_label: draft.evidenceStepLabel.trim() || null,
    answer_config: {
      validSuspects: cleanList(draft.answerConfig.validSuspects),
      validMotives: cleanList(draft.answerConfig.validMotives),
      requiredEvidenceIds: cleanList(draft.answerConfig.requiredEvidenceIds),
      optionalEvidenceIds: cleanList(draft.answerConfig.optionalEvidenceIds),
      motiveEvidenceIds: cleanList(draft.answerConfig.motiveEvidenceIds),
      optionalMotiveIds: cleanList(draft.answerConfig.optionalMotiveIds),
      alibiEvidenceIds: cleanList(draft.answerConfig.alibiEvidenceIds),
      optionalAlibiIds: cleanList(draft.answerConfig.optionalAlibiIds),
      contradictionEvidenceIds: cleanList(
        draft.answerConfig.contradictionEvidenceIds,
      ),
      optionalContradictionIds: cleanList(
        draft.answerConfig.optionalContradictionIds,
      ),
    },
    hints: draft.hints
      .map((hint) => ({ group: hint.group, text: hint.text.trim() }))
      .filter((hint) => hint.text),
    narrative: draft.narrative.trim() || null,
    ai_context: draft.aiContext.trim() || null,
    ai_valid_cases: cleanList(draft.aiValidCases),
    ai_invalid_cases: cleanList(draft.aiInvalidCases),
  };
}
