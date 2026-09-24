import type { Checkpoint, CheckpointOptionItem } from "@/lib/types";

/**
 * Interface đại diện cho một dòng trong tab 'checkpoints' trên Google Sheet.
 *
 * Toàn bộ đáp án / cấu hình form nằm gọn trong cột `answers` theo định dạng `khóa: giá trị`.
 * Gợi ý nhiều cấp nằm trong cột `hints` (mỗi dòng Alt+Enter là một cấp độ).
 */
export interface SheetCheckpointRow {
  case_id?: string;
  checkpoint_id?: string;
  node_id?: string;
  dossier?: string;
  title?: string;
  question?: string;
  type?: "text_match_3" | "evidence_picker" | "mcq" | "text";
  unlocked_evidence_id?: string;
  answers?: string;
  hints?: string;
  suspect_label?: string;
  evidence_step_label?: string;
  [key: string]: unknown;
}

/** Kết quả bóc tách cột `answers` */
export interface ParsedAnswers {
  options?: string[];
  correctAnswer?: string;
  validSuspects?: string[];
  requiredEvidenceIds?: string[];
  availableEvidences?: CheckpointOptionItem[];
  textMatchInputs?: NonNullable<Checkpoint["textMatchConfig"]>["inputs"];
}

/**
 * Từ điển khóa hợp lệ trong cột `answers`.
 */
const ANSWER_KEYS: Record<string, string> = {
  // Trắc nghiệm & text đơn
  option: "option",
  phuong_an: "option",
  lua_chon: "option",
  correct: "correct",
  correct_answer: "correct",
  dap_an: "correct",

  // Nhập tên nghi phạm
  suspect: "suspect",
  suspects: "suspect",
  nghi_pham: "suspect",

  // Mã chứng cứ
  require: "require",
  required: "require",
  required_evidences: "require",
  bat_buoc: "require",
  ma_chung_cu: "require",
  vat_chung: "require",
  chung_cu: "require",
  show: "show",
  available: "show",
  hien_thi: "show",

  // Ô nhập văn bản (3 SĐT)
  input: "input",
  inputs: "input",
  o_nhap: "input",
};

/** Tách ô đa dòng (Alt+Enter) thành mảng dòng đã trim, bỏ dòng rỗng. */
function splitLines(raw?: string): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Tách danh sách phân cách bằng dấu phẩy. */
function splitCommas(raw?: string): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Chuẩn hóa tên khóa: chữ thường, khoảng trắng và gạch nối thành gạch dưới. */
function normalizeKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/** Bóc một dòng `id | Nhãn ô | Placeholder | đáp_án_1, đáp_án_2` của ô nhập văn bản. */
function parseInputLine(
  value: string,
): NonNullable<Checkpoint["textMatchConfig"]>["inputs"][number] | null {
  const [id, label, placeholder, answers] = value
    .split("|")
    .map((p) => p.trim());
  if (!id) return null;
  return {
    id,
    label: label || id,
    placeholder: placeholder || "",
    validAnswers: splitCommas(answers),
  };
}

/**
 * Bóc cột `answers` hợp nhất thành object cấu hình UI.
 */
export function parseAnswersColumn(raw?: string): ParsedAnswers {
  const parsed: ParsedAnswers = {};
  if (!raw || typeof raw !== "string") return parsed;

  const lines = splitLines(raw);

  // Nếu chỉ có 1 dòng và không có dấu ':' -> xem toàn bộ là đáp án text
  if (lines.length === 1 && !lines[0].includes(":")) {
    parsed.correctAnswer = lines[0].trim();
    return parsed;
  }

  lines.forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      if (!parsed.correctAnswer) {
        parsed.correctAnswer = line.trim();
      }
      return;
    }

    const rawKey = line.slice(0, separatorIndex);
    const value = line.slice(separatorIndex + 1).trim();
    const key = ANSWER_KEYS[normalizeKey(rawKey)];

    if (!key || !value) return;

    switch (key) {
      case "option":
        (parsed.options ??= []).push(value);
        break;
      case "correct":
        parsed.correctAnswer = value;
        break;
      case "suspect":
        parsed.validSuspects = splitCommas(value);
        break;
      case "require":
        parsed.requiredEvidenceIds = splitCommas(value);
        break;
      case "show":
        parsed.availableEvidences = splitCommas(value).map((code) => ({
          id: code,
          code,
          label: code,
        }));
        break;
      case "input": {
        const input = parseInputLine(value);
        if (input) (parsed.textMatchInputs ??= []).push(input);
        break;
      }
    }
  });

  return parsed;
}

/**
 * Trích xuất danh sách gợi ý từ ô `hints` đa dòng (Alt+Enter) trên Sheet.
 */
export function getCheckpointHints(row?: SheetCheckpointRow): string[] {
  if (!row || typeof row !== "object") return [];

  const rawHints = row.hints;
  if (rawHints && typeof rawHints === "string") {
    const raw = rawHints.trim();
    if (raw.startsWith("[") && raw.endsWith("]")) {
      try {
        const parsedJson = JSON.parse(raw);
        if (Array.isArray(parsedJson)) {
          return parsedJson.map((x) => String(x).trim()).filter(Boolean);
        }
      } catch {}
    }
    return splitLines(raw);
  }

  return [];
}

/**
 * Lấy gợi ý ở cấp độ cụ thể (1-indexed).
 */
export function getSheetHintLevel(hints: string[], level: number): string {
  if (!hints || hints.length === 0 || level < 1) return "";
  return hints[level - 1] || "";
}

/** Trích xuất các phương án trắc nghiệm từ khóa `option` trong cột `answers`. */
export function getCheckpointOptions(row?: SheetCheckpointRow): string[] {
  return parseAnswersColumn(row?.answers).options ?? [];
}

/**
 * Chuyển một dòng thô từ tab 'checkpoints' thành object Checkpoint.
 */
export function transformSheetCheckpoint(
  row: SheetCheckpointRow,
  fallback?: Checkpoint,
): Checkpoint {
  const answers = parseAnswersColumn(row.answers);
  const dynamicHints = getCheckpointHints(row);

  const hintsList =
    dynamicHints.length > 0 ? dynamicHints : fallback?.hintsList;

  const options = answers.options?.length ? answers.options : fallback?.options;
  const correctAnswer = answers.correctAnswer ?? fallback?.correctAnswer;

  const validSuspects = answers.validSuspects?.length
    ? answers.validSuspects
    : fallback?.pickerConfig?.validSuspects;

  const requiredEvidenceIds = answers.requiredEvidenceIds?.length
    ? answers.requiredEvidenceIds
    : fallback?.pickerConfig?.requiredEvidenceIds;

  const availableEvidences = answers.availableEvidences?.length
    ? answers.availableEvidences
    : fallback?.pickerConfig?.availableEvidences;

  const textMatchInputs = answers.textMatchInputs?.length
    ? answers.textMatchInputs
    : fallback?.textMatchConfig?.inputs;

  const hasPickerConfig =
    fallback?.pickerConfig ||
    validSuspects ||
    requiredEvidenceIds ||
    availableEvidences ||
    row.suspect_label ||
    row.evidence_step_label;

  const pickerConfig = hasPickerConfig
    ? {
        ...fallback?.pickerConfig,
        ...(validSuspects && validSuspects.length > 0 ? { validSuspects } : {}),
        ...(requiredEvidenceIds && requiredEvidenceIds.length > 0
          ? { requiredEvidenceIds }
          : {}),
        ...(availableEvidences && availableEvidences.length > 0
          ? { availableEvidences }
          : {}),
        ...(row.suspect_label !== undefined && row.suspect_label !== ""
          ? { suspectLabel: row.suspect_label }
          : {}),
        ...(row.evidence_step_label !== undefined &&
        row.evidence_step_label !== ""
          ? { evidenceStepLabel: row.evidence_step_label }
          : {}),
      }
    : undefined;

  const textMatchConfig =
    textMatchInputs && textMatchInputs.length > 0
      ? { inputs: textMatchInputs }
      : fallback?.textMatchConfig;

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
    options,
    correctAnswer,
    unlockedEvidenceId:
      row.unlocked_evidence_id || fallback?.unlockedEvidenceId,
    status: fallback?.status || "locked",
    type:
      (row.type as Checkpoint["type"]) || fallback?.type || "evidence_picker",
    hintsList:
      hintsList && hintsList.length > 0 ? hintsList : fallback?.hintsList,
    textMatchConfig,
    pickerConfig,
    ...(row.node_id ? { nodeId: row.node_id } : {}),
  } as Checkpoint;
}

/**
 * Chuyển danh sách dòng Sheet, tra cứu fallback local theo `checkpoint_id`.
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
