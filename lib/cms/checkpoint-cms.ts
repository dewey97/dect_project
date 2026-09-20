import type { Checkpoint, CheckpointOptionItem } from "@/lib/types";

/**
 * Interface đại diện cho một dòng bất kỳ trong tab 'checkpoints' trên Google Sheet.
 *
 * Toàn bộ dữ liệu đáp án / cấu hình form nằm gọn trong cột `answers`
 * theo định dạng `khóa: giá trị` (mỗi dòng một khóa).
 * Gợi ý nhiều cấp nằm trong cột `hints` (mỗi dòng là một cấp độ).
 */
export interface SheetCheckpointRow {
  case_id?: string;
  checkpoint_id?: string;
  /** Nhãn ghi chú cho biên kịch — code không đọc cột này. */
  phase?: string | number;
  title?: string;
  question?: string;
  type?:
    "mcq" | "text_match_3" | "evidence_picker" | "convergence" | "accusation";
  unlocked_evidence_id?: string;
  /** Cột đáp án hợp nhất — mỗi dòng `khóa: giá trị` (Alt+Enter để xuống dòng). */
  answers?: string;
  suspect_label?: string;
  evidence_step_label?: string;
  motive_label?: string;
  mismatch_label?: string;
  /** Danh sách gợi ý đa cấp — mỗi dòng (Alt+Enter) là một cấp độ gợi ý (1, 2, 3...). */
  hints?: string;
  [key: string]: any;
}

/** Kết quả bóc tách cột `answers` — chỉ chứa các khóa thực sự xuất hiện trên Sheet. */
export interface ParsedAnswers {
  options?: string[];
  correctAnswer?: string;
  validSuspects?: string[];
  requiredEvidenceIds?: string[];
  availableEvidences?: CheckpointOptionItem[];
  validMotives?: string[];
  validMismatchTypes?: string[];
  mismatchTypeOptions?: string[];
  convergenceSuspects?: NonNullable<
    Checkpoint["convergenceConfig"]
  >["suspects"];
  textMatchInputs?: NonNullable<Checkpoint["textMatchConfig"]>["inputs"];
}

/**
 * Từ điển khóa hợp lệ trong cột `answers`.
 * Hỗ trợ cả tiếng Anh lẫn tiếng Việt không dấu để biên kịch dễ nhập.
 */
const ANSWER_KEYS: Record<string, string> = {
  // type=mcq
  option: "option",
  options: "option",
  phuong_an: "option",
  lua_chon: "option",
  correct: "correct",
  correct_answer: "correct",
  dap_an: "correct",
  // Nhập tên nghi phạm
  suspect: "suspect",
  suspects: "suspect",
  nghi_pham: "suspect",
  // Vật chứng
  require: "require",
  required: "require",
  required_evidences: "require",
  bat_buoc: "require",
  show: "show",
  available: "show",
  available_evidences: "show",
  hien_thi: "show",
  // Động cơ
  motive: "motive",
  motives: "motive",
  dong_co: "motive",
  // Mâu thuẫn
  mismatch: "mismatch",
  mismatches: "mismatch",
  mau_thuan: "mismatch",
  mismatch_option: "mismatch_option",
  mismatch_options: "mismatch_option",
  mau_thuan_option: "mismatch_option",
  // Danh mục động cơ dùng chung mảng nhãn nút với mâu thuẫn (UI đọc mismatchTypeOptions)
  motive_option: "mismatch_option",
  motive_options: "mismatch_option",
  dong_co_option: "mismatch_option",
  // Nút hội tụ
  branch: "branch",
  branches: "branch",
  nhanh: "branch",
  // Ô nhập văn bản
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

/** Bóc một dòng `id | name | valid_ids | Lý do 1 /// Lý do 2` của nút hội tụ. */
function parseBranchLine(
  value: string,
): NonNullable<Checkpoint["convergenceConfig"]>["suspects"][number] | null {
  const [id, name, validIds, reasons] = value.split("|").map((p) => p.trim());
  if (!id) return null;
  return {
    id,
    name: name || id,
    validReasons: splitCommas(validIds),
    reasonOptions: (reasons || "")
      .split("///")
      .map((r) => r.trim())
      .filter(Boolean),
  };
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
 * Bóc cột `answers` hợp nhất thành object cấu hình.
 *
 * Định dạng: mỗi dòng một cặp `khóa: giá trị`. Khóa `option`, `mismatch_option`,
 * `branch`, `input` được phép lặp lại để tạo danh sách.
 * Khóa không nhận diện được sẽ bị bỏ qua kèm cảnh báo `console.warn` để phát hiện lỗi gõ.
 */
export function parseAnswersColumn(raw?: string): ParsedAnswers {
  const parsed: ParsedAnswers = {};
  const unknownKeys = new Set<string>();

  splitLines(raw).forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      unknownKeys.add(line);
      return;
    }

    const rawKey = line.slice(0, separatorIndex);
    const value = line.slice(separatorIndex + 1).trim();
    const key = ANSWER_KEYS[normalizeKey(rawKey)];

    if (!key || !value) {
      if (!key) unknownKeys.add(rawKey.trim());
      return;
    }

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
      case "motive":
        parsed.validMotives = splitCommas(value);
        break;
      case "mismatch":
        parsed.validMismatchTypes = splitCommas(value);
        break;
      case "mismatch_option":
        (parsed.mismatchTypeOptions ??= []).push(value);
        break;
      case "branch": {
        const branch = parseBranchLine(value);
        if (branch) (parsed.convergenceSuspects ??= []).push(branch);
        break;
      }
      case "input": {
        const input = parseInputLine(value);
        if (input) (parsed.textMatchInputs ??= []).push(input);
        break;
      }
    }
  });

  if (unknownKeys.size > 0) {
    console.warn(
      `[checkpoint-cms] Cột 'answers' chứa khóa không hợp lệ, đã bỏ qua: ${[...unknownKeys].join(", ")}`,
    );
  }

  return parsed;
}

/**
 * Trích xuất danh sách gợi ý từ ô `hints` đa dòng (Alt+Enter) trên Sheet.
 * Mỗi dòng tương ứng một cấp độ gợi ý (1, 2, 3...).
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
 * Lấy gợi ý ở cấp độ cụ thể (1-indexed). Trả về rỗng nếu cấp độ vượt quá số lượng trên Sheet.
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
 * Cột `answers` là nguồn chính; ô nào trống sẽ lấy từ checkpoint local cùng `checkpoint_id`.
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

  const validMotives = answers.validMotives?.length
    ? answers.validMotives
    : fallback?.pickerConfig?.validMotives;

  const validMismatchTypes = answers.validMismatchTypes?.length
    ? answers.validMismatchTypes
    : fallback?.pickerConfig?.validMismatchTypes;

  const mismatchTypeOptions = answers.mismatchTypeOptions?.length
    ? answers.mismatchTypeOptions
    : fallback?.pickerConfig?.mismatchTypeOptions;

  const convergenceSuspects = answers.convergenceSuspects?.length
    ? answers.convergenceSuspects
    : fallback?.convergenceConfig?.suspects;

  const textMatchInputs = answers.textMatchInputs?.length
    ? answers.textMatchInputs
    : fallback?.textMatchConfig?.inputs;

  // Picker config object: ưu tiên Sheet, fallback về code local
  const hasPickerConfig =
    fallback?.pickerConfig ||
    validSuspects ||
    requiredEvidenceIds ||
    availableEvidences ||
    validMotives ||
    validMismatchTypes ||
    row.suspect_label ||
    row.evidence_step_label ||
    row.motive_label ||
    row.mismatch_label;

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
        ...(validMotives && validMotives.length > 0 ? { validMotives } : {}),
        ...(validMismatchTypes && validMismatchTypes.length > 0
          ? { validMismatchTypes }
          : {}),
        ...(mismatchTypeOptions && mismatchTypeOptions.length > 0
          ? { mismatchTypeOptions }
          : {}),
        ...(row.suspect_label !== undefined && row.suspect_label !== ""
          ? { suspectLabel: row.suspect_label }
          : {}),
        ...(row.evidence_step_label !== undefined &&
        row.evidence_step_label !== ""
          ? { evidenceStepLabel: row.evidence_step_label }
          : {}),
        ...(row.motive_label !== undefined && row.motive_label !== ""
          ? { motiveLabel: row.motive_label }
          : {}),
        ...(row.mismatch_label !== undefined && row.mismatch_label !== ""
          ? { mismatchTypeLabel: row.mismatch_label }
          : {}),
      }
    : undefined;

  const textMatchConfig =
    textMatchInputs && textMatchInputs.length > 0
      ? { inputs: textMatchInputs }
      : fallback?.textMatchConfig;

  const convergenceConfig =
    convergenceSuspects && convergenceSuspects.length > 0
      ? { suspects: convergenceSuspects }
      : fallback?.convergenceConfig;

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
    type: (row.type as Checkpoint["type"]) || fallback?.type || "mcq",
    hintsList:
      hintsList && hintsList.length > 0 ? hintsList : fallback?.hintsList,
    textMatchConfig,
    pickerConfig,
    convergenceConfig,
  };
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
