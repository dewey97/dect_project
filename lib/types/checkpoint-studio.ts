import type { DbCaseCheckpoint, BoardConfig } from "./database";
import { slugifyVietnamese, asStringArray, cleanList } from "@/lib/text";

/**
 * Checkpoint Studio (Admin) — model biên tập có cấu trúc.
 *
 * Lưu ý: đây là model biên tập của Studio trên bảng `case_checkpoints`.
 * Runtime gameplay đọc cùng bảng qua `/api/checkpoints` và
 * `lib/cms/checkpoint-runtime.ts`. Toàn bộ dữ liệu vụ án nằm trong database.
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

export interface EpilogueStoryItem {
  id: string;
  title: string;
  monologue: string;
}

/** Cấu hình đáp án cho checkpoint thẩm tra nghi phạm (2 lớp: Động cơ & Mâu thuẫn) hoặc Hậu án. */
export interface EvidencePickerConfig {
  validSuspects: string[];
  validMotives: string[];
  requiredEvidenceIds: string[];
  optionalEvidenceIds: string[];
  motiveEvidenceIds: string[];
  optionalMotiveIds: string[];
  motiveContext?: string;
  alibiEvidenceIds: string[];
  optionalAlibiIds: string[];
  contradictionEvidenceIds: string[];
  optionalContradictionIds: string[];
  contradictionContext?: string;
  correctAnswer?: string;
  options?: string[];
  unlocksDossier?: string;
  epilogueStories?: EpilogueStoryItem[];
  textMatchInputs?: {
    id: string;
    label: string;
    placeholder: string;
    validAnswers: string[];
  }[];
  photoCodes?: string[];
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
  /** Loại checkpoint theo gameplay (migration 26). */
  kind: string;
  /** Khóa nhân vật liên quan (`case_characters.key` cùng vụ). */
  subjectKey: string;
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
  boardConfig?: BoardConfig;
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
  const base = slugifyVietnamese(title || "").slice(0, 24);
  const suffix = Math.random().toString(36).slice(2, 7);
  return base
    ? `cp_${base}_${suffix}`
    : `cp_${Date.now().toString(36)}_${suffix}`;
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
    kind: "text",
    subjectKey: "",
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
    boardConfig: {},
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
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
    motiveContext: asString(source.motiveContext || source.motive_context),
    alibiEvidenceIds: asStringArray(source.alibiEvidenceIds),
    optionalAlibiIds: asStringArray(source.optionalAlibiIds),
    contradictionEvidenceIds: asStringArray(source.contradictionEvidenceIds),
    optionalContradictionIds: asStringArray(source.optionalContradictionIds),
    contradictionContext: asString(
      source.contradictionContext || source.contradiction_context,
    ),
    correctAnswer:
      asString(source.correctAnswer) || asString(source.correct_answer),
    options: asStringArray(source.options),
    unlocksDossier:
      asString(source.unlocksDossier) || asString(source.unlocks_dossier),
    epilogueStories: Array.isArray(source.epilogueStories)
      ? (source.epilogueStories as Array<Record<string, unknown>>).map((s) => ({
          id: asString(s?.id),
          title: asString(s?.title),
          monologue: asString(s?.monologue || s?.text),
        }))
      : undefined,
    textMatchInputs: Array.isArray(source.textMatchInputs)
      ? (source.textMatchInputs as Array<Record<string, unknown>>).map(
          (inp, idx) => ({
            id: asString(inp?.id) || `input_${idx}`,
            label: asString(inp?.label),
            placeholder: asString(inp?.placeholder),
            validAnswers: asStringArray(
              inp?.validAnswers || inp?.valid_answers,
            ),
          }),
        )
      : undefined,
    photoCodes: asStringArray(source.photoCodes || source.photo_codes),
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
    asString(
      (row.answer_config as Record<string, unknown> | null)?.unlocksDossier,
    ) ||
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
    kind: asString(row.kind) || "text",
    subjectKey: asString(row.subject_key),
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
    boardConfig: (row.board_config as BoardConfig) || {},
  };
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
    kind: draft.kind.trim() || "text",
    subject_key: draft.subjectKey.trim() || null,
    question_type: draft.questionType.trim() || draft.type.trim() || null,
    unlocked_evidence_id: draft.unlockedEvidenceId.trim() || null,
    followup_of:
      draft.followupOf.trim() ||
      (draft.kind === "followup" ? draft.dependsOn[0] || null : null),
    suspect_label: draft.suspectLabel.trim() || null,
    evidence_step_label: draft.evidenceStepLabel.trim() || null,
    answer_config: {
      validSuspects: cleanList(draft.answerConfig.validSuspects),
      validMotives: cleanList(draft.answerConfig.validMotives),
      requiredEvidenceIds: cleanList(draft.answerConfig.requiredEvidenceIds),
      optionalEvidenceIds: cleanList(draft.answerConfig.optionalEvidenceIds),
      motiveEvidenceIds: cleanList(draft.answerConfig.motiveEvidenceIds),
      optionalMotiveIds: cleanList(draft.answerConfig.optionalMotiveIds),
      ...(draft.answerConfig.motiveContext?.trim()
        ? { motiveContext: draft.answerConfig.motiveContext.trim() }
        : {}),
      alibiEvidenceIds: cleanList(draft.answerConfig.alibiEvidenceIds),
      optionalAlibiIds: cleanList(draft.answerConfig.optionalAlibiIds),
      contradictionEvidenceIds: cleanList(
        draft.answerConfig.contradictionEvidenceIds,
      ),
      optionalContradictionIds: cleanList(
        draft.answerConfig.optionalContradictionIds,
      ),
      ...(draft.answerConfig.contradictionContext?.trim()
        ? {
            contradictionContext:
              draft.answerConfig.contradictionContext.trim(),
          }
        : {}),
      ...(draft.answerConfig.correctAnswer?.trim()
        ? { correctAnswer: draft.answerConfig.correctAnswer.trim() }
        : {}),
      ...(draft.answerConfig.options && draft.answerConfig.options.length > 0
        ? { options: cleanList(draft.answerConfig.options) }
        : {}),
      ...(draft.unlocksDossier?.trim()
        ? { unlocksDossier: draft.unlocksDossier.trim() }
        : {}),
      ...(Array.isArray(draft.answerConfig.epilogueStories)
        ? { epilogueStories: draft.answerConfig.epilogueStories }
        : {}),
      ...(Array.isArray(draft.answerConfig.textMatchInputs)
        ? {
            textMatchInputs: draft.answerConfig.textMatchInputs.map((inp) => ({
              id: inp.id.trim(),
              label: inp.label.trim(),
              placeholder: inp.placeholder.trim(),
              validAnswers: cleanList(inp.validAnswers),
            })),
          }
        : {}),
      ...(draft.answerConfig.photoCodes &&
      draft.answerConfig.photoCodes.length > 0
        ? { photoCodes: cleanList(draft.answerConfig.photoCodes) }
        : {}),
    },
    hints: draft.hints
      .map((hint) => ({ group: hint.group, text: hint.text.trim() }))
      .filter((hint) => hint.text),
    narrative: draft.narrative.trim() || null,
    ai_context: draft.aiContext.trim() || null,
    ai_valid_cases: cleanList(draft.aiValidCases),
    ai_invalid_cases: cleanList(draft.aiInvalidCases),
    board_config: draft.boardConfig || {},
  };
}
