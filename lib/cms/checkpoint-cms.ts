import type { Checkpoint } from "@/lib/types";

/**
 * Interface đại diện cho một dòng bất kỳ trong tab 'checkpoints' trên Google Sheet.
 * Hỗ trợ động vô hạn cột gợi ý dạng `level_N_hint` (hoặc `hint_N`, `level_N_answer`, `hints_list`).
 */
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
  [key: string]: any;
}

/**
 * Trích xuất toàn bộ danh sách gợi ý từ một dòng Sheet:
 * 1. Tự động quét và sắp xếp mọi cột `level_1_hint`, `level_2_hint`, ..., `level_N_hint` (hoặc `hint_1`, `hint_2`, `hint_N`).
 * 2. Hỗ trợ ô text đa dòng `hints_list` (mỗi dòng 1 gợi ý phân tách bởi Alt+Enter).
 * 3. Hỗ trợ format JSON mảng `["Gợi ý 1", "Gợi ý 2", ...]`.
 */
export function getCheckpointHints(row?: SheetCheckpointRow): string[] {
  if (!row || typeof row !== "object") return [];

  const indexedHints: { level: number; text: string }[] = [];

  // 1. Quét tất cả các cột có tên dạng level_N_hint, level_N, hint_N, level_N_answer
  Object.keys(row).forEach((key) => {
    const val = String(row[key] || "").trim();
    if (!val) return;

    const match = key.match(
      /^(?:level_?(\d+)(?:_hint|_answer)?|hint_?(\d+))$/i,
    );
    if (match) {
      const level = parseInt(match[1] || match[2], 10);
      if (!isNaN(level) && level > 0) {
        indexedHints.push({ level, text: val });
      }
    }
  });

  // Sắp xếp theo thứ tự level tăng dần (1, 2, 3, 4, ...)
  if (indexedHints.length > 0) {
    indexedHints.sort((a, b) => a.level - b.level);
    return indexedHints.map((h) => h.text);
  }

  // 2. Nếu không có cột đánh số, đọc từ ô `hints_list` (hỗ trợ xuống dòng Alt+Enter hoặc JSON)
  if (row.hints_list && typeof row.hints_list === "string") {
    const raw = row.hints_list.trim();
    if (raw.startsWith("[") && raw.endsWith("]")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed))
          return parsed.map((x) => String(x).trim()).filter(Boolean);
      } catch {}
    }
    return raw
      .split(/\r?\n/)
      .map((h) => h.trim())
      .filter(Boolean);
  }

  return [];
}

/**
 * Lấy gợi ý ở cấp độ cụ thể (1-indexed). Trả về rỗng nếu cấp độ vượt quá số lượng trên Sheet.
 */
export function getSheetHintLevel(hints: string[], level: number): string {
  if (!hints || hints.length === 0 || level < 1) return "";
  return hints[level - 1] || "";
}

/**
 * Trích xuất các phương án trắc nghiệm từ cột `options` trên Sheet (hỗ trợ phân dòng Alt+Enter).
 */
export function getCheckpointOptions(row?: SheetCheckpointRow): string[] {
  if (!row?.options) return [];
  return String(row.options)
    .split(/\r?\n/)
    .map((o) => o.trim())
    .filter(Boolean);
}

/**
 * Transforms a raw row from the unified 'checkpoints' Google Sheet tab into a Checkpoint object.
 * Extracts unlimited level_N_hints into structured hintsList.
 */
export function transformSheetCheckpoint(
  row: SheetCheckpointRow,
  fallback?: Checkpoint,
): Checkpoint {
  const options = getCheckpointOptions(row);
  const dynamicHints = getCheckpointHints(row);

  const hintsList =
    dynamicHints.length > 0 ? dynamicHints : fallback?.hintsList;

  const validSuspects = row.valid_suspects
    ? String(row.valid_suspects)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : fallback?.pickerConfig?.validSuspects;

  const requiredEvidenceIds = row.required_evidences
    ? String(row.required_evidences)
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
    options: options.length > 0 ? options : fallback?.options,
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
