import type { DbCaseCheckpoint } from "./database";

/**
 * Checkpoint Studio (Admin) — model biên tập có cấu trúc.
 *
 * Lưu ý: đây là model biên tập của Studio trên bảng `case_checkpoints`.
 * Runtime gameplay đọc cùng bảng qua `/api/checkpoints` và
 * `lib/cms/checkpoint-runtime.ts`; Google Sheets chỉ còn quản lý `evidences`.
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

/** Vị trí node trên Flow view, lưu trong `case_checkpoints.flow_position`. */
export interface CheckpointFlowPosition {
  x: number;
  y: number;
}

export interface CheckpointPositionUpdate {
  checkpointId: string;
  position: CheckpointFlowPosition;
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
  correctAnswer?: string;
  options?: string[];
  unlocksDossier?: string;
}

export interface CheckpointStudioDraft {
  id?: string;
  caseId: string;
  checkpointId: string;
  nodeId: string;
  dossier: string;
  unlocksDossier: string;
  title: string;
  question: string;
  type: CheckpointStudioType;
  questionType: string;
  unlockedEvidenceId: string;
  followupOf: string;
  suspectLabel: string;
  evidenceStepLabel: string;
  /** checkpoint_id của các checkpoint phải hoàn thành trước (graph Studio). */
  dependsOn: string[];
  answerConfig: EvidencePickerConfig;
  hints: CheckpointHint[];
  narrative: string;
  aiContext: string;
  aiValidCases: string[];
  aiInvalidCases: string[];
}

/** Batch cập nhật cạnh phụ thuộc do Flow view gửi lên. */
export interface CheckpointDependencyUpdate {
  checkpointId: string;
  dependsOn: string[];
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
  correctAnswer: "",
  options: [],
  unlocksDossier: "",
};

/** Tạo ID kỹ thuật ngầm trong background (Game Master không cần nhập ID). */
export function generateCheckpointKey(title?: string): string {
  const base = (title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
  const suffix = Math.random().toString(36).slice(2, 7);
  return base ? `cp_${base}_${suffix}` : `cp_${Date.now().toString(36)}_${suffix}`;
}

export function createEmptyDraft(caseId: string): CheckpointStudioDraft {
  const generated = generateCheckpointKey();
  return {
    caseId,
    checkpointId: generated,
    nodeId: generated,
    dossier: "",
    unlocksDossier: "",
    title: "",
    question: "",
    type: "evidence_picker",
    questionType: "evidence_picker",
    unlockedEvidenceId: "",
    followupOf: "",
    suspectLabel: "",
    evidenceStepLabel: "",
    dependsOn: [],
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
    correctAnswer:
      asString(source.correctAnswer) || asString(source.correct_answer),
    options: asStringArray(source.options),
    unlocksDossier:
      asString(source.unlocksDossier) || asString(source.unlocks_dossier),
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
  const config = parseConfig(row.answer_config);
  const unlocksDossier =
    config.unlocksDossier ||
    asString((row.answer_config as any)?.unlocksDossier) ||
    "";

  return {
    id: row.id,
    caseId: row.case_id,
    checkpointId: asString(row.checkpoint_id),
    nodeId: asString(row.node_id),
    dossier: asString(row.dossier),
    unlocksDossier,
    title: asString(row.title),
    question: asString(row.question),
    type: asString(row.type) || "evidence_picker",
    questionType: asString(row.question_type) || "evidence_picker",
    unlockedEvidenceId: asString(row.unlocked_evidence_id),
    followupOf: asString(row.followup_of),
    suspectLabel: asString(row.suspect_label),
    evidenceStepLabel: asString(row.evidence_step_label),
    dependsOn: asStringArray(row.depends_on),
    answerConfig: config,
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

/**
 * Payload form không ghi `depends_on`: quan hệ đồ thị do
 * `updateCheckpointDependencies()` quản lý để tránh ghi đè khi lưu form.
 */
export type CaseCheckpointPayload = Omit<
  DbCaseCheckpoint,
  "id" | "created_at" | "updated_at" | "depends_on" | "flow_position"
>;

/** Chuyển draft thành payload insert/update. */
export function toRowPayload(
  draft: CheckpointStudioDraft,
): CaseCheckpointPayload {
  // ID kỹ thuật được quản lý ngầm trong background. Nếu draft chưa có thì sinh tự động từ tiêu đề.
  const checkpointId =
    draft.checkpointId.trim() ||
    draft.nodeId.trim() ||
    generateCheckpointKey(draft.title);
  const nodeId = draft.nodeId.trim() || checkpointId;

  return {
    case_id: draft.caseId.trim() || "case_000",
    checkpoint_id: checkpointId,
    node_id: nodeId,
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
      ...(draft.answerConfig.correctAnswer?.trim()
        ? { correctAnswer: draft.answerConfig.correctAnswer.trim() }
        : {}),
      ...(draft.answerConfig.options && draft.answerConfig.options.length > 0
        ? { options: cleanList(draft.answerConfig.options) }
        : {}),
      ...(draft.unlocksDossier?.trim()
        ? { unlocksDossier: draft.unlocksDossier.trim() }
        : {}),
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
