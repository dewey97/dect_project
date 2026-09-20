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
  hints_list?: string;
}

/**
 * Transforms a raw row from the 'checkpoints' Google Sheet tab into a Checkpoint object.
 * Merges with existing static fallback for rich configs (pickerConfig, textMatchConfig, convergenceConfig).
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

  const hintsList = row.hints_list
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

  // Map each fallback checkpoint by ID
  const fallbackMap = new Map<string, Checkpoint>();
  fallbackCheckpoints.forEach((cp) => fallbackMap.set(cp.id, cp));

  return rows.map((row) => {
    const cpId = row.checkpoint_id || "";
    const fallback = fallbackMap.get(cpId);
    return transformSheetCheckpoint(row, fallback);
  });
}
