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
  narrative?: string;
  suspect_label?: string;
  evidence_step_label?: string;
  [key: string]: unknown;
}

/** Kết quả bóc tách cột `answers` */
export interface ParsedAnswers {
  options?: string[];
  correctAnswer?: string;
  validSuspects?: string[];
  validMotives?: string[];
  requiredEvidenceIds?: string[];
  optionalEvidenceIds?: string[];
  motiveEvidenceIds?: string[];
  optionalMotiveIds?: string[];
  alibiEvidenceIds?: string[];
  optionalAlibiIds?: string[];
  clueRules?: Record<string, string[]>;
  availableEvidences?: CheckpointOptionItem[];
  textMatchInputs?: NonNullable<Checkpoint["textMatchConfig"]>["inputs"];
  photoCodes?: string[];
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
  gio_roi_quan: "correct",

  // Nhập tên nghi phạm
  suspect: "suspect",
  suspects: "suspect",
  nghi_pham: "suspect",

  // Động cơ & Tùy chọn Động cơ
  motive: "motive",
  motives: "motive",
  dong_co: "motive",
  chung_cu_dong_co: "motive",
  optional_motive: "optional_motive",
  tuy_chon_dong_co: "optional_motive",

  // Ngoại phạm & Tùy chọn Ngoại phạm
  alibi: "alibi",
  ngoai_pham: "alibi",
  chung_cu_ngoai_pham: "alibi",
  optional_alibi: "optional_alibi",
  tuy_chon_ngoai_pham: "optional_alibi",

  // Tùy chọn chung (Optional clues)
  optional: "optional",
  tuy_chon: "optional",

  // Mã chứng cứ bắt buộc
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

  // Ảnh đính kèm kết quả (Photos)
  photo: "photo",
  photos: "photo",
  anh: "photo",
  vat_pham_anh: "photo",

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

/** 
 * Bóc một dòng ô nhập văn bản:
 * - Dạng tối giản: `0988.200.991: Vũ, Lê Quang Vũ` hoặc `SĐT 0988.200.991: Vũ`
 * - Dạng đầy đủ: `phone_1 | SĐT 0988.200.991: | Nhập tên nghi phạm... | Lê Quang Vũ, Vũ`
 */
function parseInputLine(
  value: string,
  rawKey?: string,
): NonNullable<Checkpoint["textMatchConfig"]>["inputs"][number] | null {
  if (!value) return null;

  // Dạng 1: Phân tách bằng dấu gạch đứng '|'
  if (value.includes("|")) {
    const [id, label, placeholder, answers] = value
      .split("|")
      .map((p) => p.trim());
    if (!id) return null;
    return {
      id,
      label: label || id,
      placeholder: placeholder || "Nhập tên nghi phạm...",
      validAnswers: splitCommas(answers),
    };
  }

  // Dạng 2: Cú pháp tối giản gọn gàng: "0988.200.991: Vũ, Lê Quang Vũ" hoặc rawKey là số điện thoại
  const colonIdx = value.indexOf(":");
  if (colonIdx !== -1) {
    const label = value.slice(0, colonIdx).trim();
    const answers = value.slice(colonIdx + 1).trim();
    const cleanId = label.toLowerCase().replace(/[^a-z0-9]/g, "_");
    return {
      id: cleanId || "input_field",
      label: label.startsWith("SĐT") ? label : `SĐT ${label}:`,
      placeholder: "Nhập tên nghi phạm...",
      validAnswers: splitCommas(answers),
    };
  }

  // Dạng 3: rawKey là nhãn, value là danh sách đáp án
  if (rawKey && rawKey !== "input" && rawKey !== "o_nhap") {
    const cleanId = rawKey.toLowerCase().replace(/[^a-z0-9]/g, "_");
    return {
      id: cleanId,
      label: rawKey.startsWith("SĐT") ? rawKey : `SĐT ${rawKey}:`,
      placeholder: "Nhập tên nghi phạm...",
      validAnswers: splitCommas(value),
    };
  }

  return null;
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
    const normalizedKey = normalizeKey(rawKey);
    const key = ANSWER_KEYS[normalizedKey];

    if (!value) return;

    if (key) {
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
        case "motive":
          parsed.validMotives = splitCommas(value);
          parsed.motiveEvidenceIds = splitCommas(value);
          break;
        case "optional_motive":
          parsed.optionalMotiveIds = splitCommas(value);
          break;
        case "alibi":
          parsed.alibiEvidenceIds = splitCommas(value);
          break;
        case "optional_alibi":
          parsed.optionalAlibiIds = splitCommas(value);
          break;
        case "optional":
          parsed.optionalEvidenceIds = splitCommas(value);
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
        case "photo":
          parsed.photoCodes = splitCommas(value);
          break;
        case "input": {
          const input = parseInputLine(value);
          if (input) (parsed.textMatchInputs ??= []).push(input);
          break;
        }
      }
    } else if (
      normalizedKey.startsWith("09") ||
      normalizedKey.startsWith("08") ||
      normalizedKey.startsWith("07") ||
      normalizedKey.startsWith("03") ||
      normalizedKey.startsWith("phone_") ||
      normalizedKey.startsWith("sdt_")
    ) {
      // Hỗ trợ viết thẳng: 0988.200.991: Vũ, Lê Quang Vũ
      const input = parseInputLine(value, rawKey);
      if (input) (parsed.textMatchInputs ??= []).push(input);
    } else {
      // Lưu các khóa quy tắc mở rộng (tile_ao_gio, chung_cu_2_1, ...)
      (parsed.clueRules ??= {})[normalizedKey] = splitCommas(value);
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
  if (!rawHints || typeof rawHints !== "string") return [];

  const raw = rawHints.trim();
  if (raw.startsWith("[") && raw.endsWith("]") && !raw.includes("\n")) {
    try {
      const parsedJson = JSON.parse(raw);
      if (Array.isArray(parsedJson)) {
        return parsedJson.map((x) => String(x).trim()).filter(Boolean);
      }
    } catch {}
  }

  const categorized = getCategorizedCheckpointHints(row);
  if (categorized.hasCategories) {
    return categorized.all;
  }

  return splitLines(raw).filter((line) => {
    const lower = line.toLowerCase();
    return (
      lower !== "[động cơ]" &&
      lower !== "động cơ:" &&
      lower !== "động cơ" &&
      lower !== "[ngoại phạm]" &&
      lower !== "ngoại phạm:" &&
      lower !== "ngoại phạm" &&
      lower !== "ngoại phạm mâu thuẫn" &&
      lower !== "[ngoại phạm mâu thuẫn]"
    );
  });
}

export interface CategorizedHints {
  all: string[];
  motive: string[];
  alibi: string[];
  hasCategories: boolean;
}

/**
 * Bóc tách gợi ý theo 2 nhóm [ĐỘNG CƠ] và [NGOẠI PHẠM] từ ô `hints` của Sheet.
 */
export function getCategorizedCheckpointHints(
  row?: SheetCheckpointRow,
): CategorizedHints {
  const result: CategorizedHints = {
    all: [],
    motive: [],
    alibi: [],
    hasCategories: false,
  };

  if (!row || typeof row !== "object") return result;

  const rawHints = row.hints;
  if (!rawHints || typeof rawHints !== "string") return result;

  const lines = splitLines(rawHints.trim());
  let currentCategory: "motive" | "alibi" | "none" = "none";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    if (
      lower === "[động cơ]" ||
      lower === "động cơ:" ||
      lower === "[dong co]" ||
      lower === "dong co:" ||
      lower === "động cơ"
    ) {
      currentCategory = "motive";
      result.hasCategories = true;
      continue;
    }

    if (
      lower === "[ngoại phạm]" ||
      lower === "ngoại phạm:" ||
      lower === "[ngoai pham]" ||
      lower === "ngoai pham:" ||
      lower === "ngoại phạm" ||
      lower === "ngoại phạm mâu thuẫn" ||
      lower === "[ngoại phạm mâu thuẫn]"
    ) {
      currentCategory = "alibi";
      result.hasCategories = true;
      continue;
    }

    result.all.push(trimmed);
    if (currentCategory === "motive") {
      result.motive.push(trimmed);
    } else if (currentCategory === "alibi") {
      result.alibi.push(trimmed);
    }
  }

  return result;
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
 * Chuyển một dòng thô từ tab 'checkpoints' trên Google Sheet thành object Checkpoint 100% trực tiếp từ dữ liệu Sheet,
 * không sử dụng bất kỳ static fallback nào.
 */
export function transformSheetCheckpoint(
  row: SheetCheckpointRow,
): Checkpoint {
  const answers = parseAnswersColumn(row.answers);
  const dynamicHints = getCheckpointHints(row);

  const hasPickerConfig =
    (answers.validSuspects && answers.validSuspects.length > 0) ||
    (answers.requiredEvidenceIds && answers.requiredEvidenceIds.length > 0) ||
    (answers.availableEvidences && answers.availableEvidences.length > 0) ||
    (row.suspect_label !== undefined && row.suspect_label !== "") ||
    (row.evidence_step_label !== undefined && row.evidence_step_label !== "");

  const pickerConfig = hasPickerConfig
    ? {
        ...(answers.validSuspects && answers.validSuspects.length > 0
          ? { validSuspects: answers.validSuspects }
          : {}),
        ...(answers.validMotives && answers.validMotives.length > 0
          ? { validMotives: answers.validMotives }
          : {}),
        ...(answers.requiredEvidenceIds && answers.requiredEvidenceIds.length > 0
          ? { requiredEvidenceIds: answers.requiredEvidenceIds }
          : {}),
        ...(answers.availableEvidences && answers.availableEvidences.length > 0
          ? { availableEvidences: answers.availableEvidences }
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
    answers.textMatchInputs && answers.textMatchInputs.length > 0
      ? { inputs: answers.textMatchInputs }
      : undefined;

  const storyConfig = row.narrative
    ? {
        monologue: row.narrative,
        date: row.dossier || "",
        subtitle: row.title || "",
      }
    : undefined;

  const effectiveId = String(
    row.checkpoint_id ||
    row.node_id ||
    (row as any).id ||
    "cp-dynamic"
  ).trim();

  return {
    id: effectiveId,
    nodeId: String(row.node_id || effectiveId).trim(),
    caseId: row.case_id || "case-000",
    title: row.title || "",
    question: row.question || "",
    hint: dynamicHints[0] || "",
    hintsList: dynamicHints,
    options: answers.options,
    correctAnswer: answers.correctAnswer,
    unlockedEvidenceId: row.unlocked_evidence_id || undefined,
    status: "locked",
    type: (row.type as Checkpoint["type"]) || "evidence_picker",
    photoCodes: answers.photoCodes,
    textMatchConfig,
    pickerConfig,
    storyConfig,
  } as Checkpoint;
}

/**
 * Chuyển danh sách dòng Sheet thành mảng Checkpoint 100% từ Google Sheets Live CMS.
 */
export function transformSheetCheckpoints(
  rows: SheetCheckpointRow[],
): Checkpoint[] {
  if (!rows || rows.length === 0) {
    return [];
  }
  return rows.map((row) => transformSheetCheckpoint(row));
}
