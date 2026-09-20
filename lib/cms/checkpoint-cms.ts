import type { Checkpoint } from "@/lib/types";

export interface SheetCheckpointRow {
  case_id?: string;
  checkpoint_id?: string;
  phase?: string | number;
  title?: string;
  question?: string;
  type?:
    "mcq" | "text_match_3" | "evidence_picker" | "convergence" | "accusation";
  options?: string;
  correct_answer?: string;
  valid_suspects?: string;
  required_evidences?: string;
  unlocked_evidence_id?: string;
  level_1_hint?: string;
  level_2_hint?: string;
  level_3_hint?: string;
  hints_list?: string;
}

/**
 * Transforms a raw row from the unified 'checkpoints' Google Sheet tab into a Checkpoint object.
 * Extracts level_1_hint, level_2_hint, level_3_hint into structured hintsList.
 */
export function transformSheetCheckpoint(
  row: SheetCheckpointRow,
  fallback?: Checkpoint,
): Checkpoint {
  const options = row.options
    ? row.options
        .split(/\r?\n/)
        .map((o) => o.trim())
        .filter(Boolean)
    : fallback?.options;

  // Build 3-level hints array
  const dynamicHints: string[] = [];
  if (row.level_1_hint && row.level_1_hint.trim())
    dynamicHints.push(row.level_1_hint.trim());
  if (row.level_2_hint && row.level_2_hint.trim())
    dynamicHints.push(row.level_2_hint.trim());
  if (row.level_3_hint && row.level_3_hint.trim())
    dynamicHints.push(row.level_3_hint.trim());

  const hintsList =
    dynamicHints.length > 0
      ? dynamicHints
      : row.hints_list
        ? row.hints_list
            .split(/\r?\n/)
            .map((h) => h.trim())
            .filter(Boolean)
        : fallback?.hintsList;

  const validSuspects = row.valid_suspects
    ? row.valid_suspects
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : fallback?.pickerConfig?.validSuspects;

  const requiredEvidenceIds = row.required_evidences
    ? row.required_evidences
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
    : fallback?.pickerConfig?.requiredEvidenceIds;

  return {
    id: row.checkpoint_id || fallback?.id || "cp-dynamic",
    caseId: row.case_id || fallback?.caseId || "case-000",
    title:
      row.title !== undefined && row.title !== ""
        ? row.title
        : fallback?.title || "",
    question: row.question || fallback?.question || "",
    hint:
      hintsList && hintsList.length > 0 ? hintsList[0] : fallback?.hint || "",
    options: options && options.length > 0 ? options : fallback?.options,
    correctAnswer: row.correct_answer || fallback?.correctAnswer,
    unlockedEvidenceId:
      row.unlocked_evidence_id || fallback?.unlockedEvidenceId,
    status: fallback?.status || "locked",
    type: (row.type as Checkpoint["type"]) || fallback?.type || "mcq",
    hintsList:
      hintsList && hintsList.length > 0 ? hintsList : fallback?.hintsList,
    textMatchConfig: fallback?.textMatchConfig,
    pickerConfig: fallback?.pickerConfig
      ? {
          ...fallback.pickerConfig,
          ...(validSuspects && validSuspects.length > 0
            ? { validSuspects }
            : {}),
          ...(requiredEvidenceIds && requiredEvidenceIds.length > 0
            ? { requiredEvidenceIds }
            : {}),
        }
      : undefined,
    convergenceConfig: fallback?.convergenceConfig,
  };
}

/**
 * Transforms list of SheetCheckpointRows with full fallback fallbackCheckpoints array.
 */
export function transformSheetCheckpoints(
  rows: SheetCheckpointRow[],
  fallbackCheckpoints: Checkpoint[] = [],
): Checkpoint[] {
  if (!rows || rows.length === 0) {
    return fallbackCheckpoints;
  }

  const fallbackMap = new Map<string, Checkpoint>();
  fallbackCheckpoints.forEach((cp) => fallbackMap.set(cp.id, cp));

  return rows.map((row) => {
    const cpId = row.checkpoint_id || "";
    const fallback = fallbackMap.get(cpId);
    return transformSheetCheckpoint(row, fallback);
  });
}
