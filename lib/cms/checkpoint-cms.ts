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
  answers_id?: string;
  answer_id?: string;
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

function extractPhoneDigits(str: string): string | null {
  const digits = str.replace(/\D/g, "");
  return digits.length >= 3 ? digits : null;
}

/**
 * Bóc cột `answers_id` (hoặc `answers`) hợp nhất thành object cấu hình UI.
 * Hỗ trợ cả 2 định dạng:
 * 1. Định dạng khóa/giá trị: `dap_an: 21:15`, `0988.200.991: Vũ`
 * 2. Định dạng phân vùng: `[ĐỘNG CƠ]`, `[NGOẠI PHẠM]`, `Optional`, các mã vật chứng A-12, C-01, SĐT
 */
export function parseAnswersColumn(raw?: string): ParsedAnswers {
  const parsed: ParsedAnswers = {
    options: [],
    validSuspects: [],
    validMotives: [],
    requiredEvidenceIds: [],
    optionalEvidenceIds: [],
    motiveEvidenceIds: [],
    optionalMotiveIds: [],
    alibiEvidenceIds: [],
    optionalAlibiIds: [],
    textMatchInputs: [],
  };
  if (!raw || typeof raw !== "string") return parsed;

  const lines = splitLines(raw);
  if (lines.length === 0) return parsed;

  // Xử lý trường hợp chỉ có 1 dòng (đáp án trắc nghiệm hoặc text đơn, ví dụ "21:15" hay "120713")
  if (lines.length === 1) {
    const single = lines[0].trim();
    const sep = single.indexOf(":");
    if (sep === -1) {
      parsed.correctAnswer = single;
      return parsed;
    }
    const rawKey = single.slice(0, sep).trim();
    const val = single.slice(sep + 1).trim();
    const normKey = normalizeKey(rawKey);
    if (ANSWER_KEYS[normKey] === "correct") {
      parsed.correctAnswer = val;
      return parsed;
    }
    // Nếu là giờ/phút dạng 21:15 hoặc không phải từ khóa lệnh đặc biệt
    if (!ANSWER_KEYS[normKey] && !normKey.startsWith("0")) {
      parsed.correctAnswer = single;
      return parsed;
    }
  }

  let currentCategory: "none" | "motive" | "alibi" | "indictment_evidence" = "none";
  let isOptional = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // 1. Nhận diện các thẻ phân vùng (Section Triggers)
    if (
      lower === "[động cơ]" ||
      lower === "động cơ:" ||
      lower === "[motive]" ||
      lower === "động cơ" ||
      lower === "[dong co]"
    ) {
      currentCategory = "motive";
      isOptional = false;
      continue;
    }
    if (
      lower === "[ngoại phạm]" ||
      lower === "ngoại phạm:" ||
      lower === "[alibi]" ||
      lower === "ngoại phạm" ||
      lower === "[ngoai pham]" ||
      lower === "ngoại phạm mâu thuẫn" ||
      lower === "[ngoại phạm mâu thuẫn]"
    ) {
      currentCategory = "alibi";
      isOptional = false;
      continue;
    }
    if (
      lower === "optional" ||
      lower === "[optional]" ||
      lower === "tùy chọn" ||
      lower === "[tùy chọn]" ||
      lower === "tuy chon" ||
      lower === "[tuy chon]"
    ) {
      isOptional = true;
      continue;
    }
    if (lower.startsWith("nghi phạm:") || lower.startsWith("suspect:")) {
      const val = line.slice(line.indexOf(":") + 1).trim();
      if (val) (parsed.validSuspects ??= []).push(val);
      continue;
    }
    if (lower.startsWith("mâu thuẫn:") || lower.startsWith("động cơ:")) {
      const val = line.slice(line.indexOf(":") + 1).trim();
      if (val) (parsed.validMotives ??= []).push(val);
      continue;
    }
    if (lower.includes("bằng chứng để lại dấu vết") || lower.includes("chứng cứ:")) {
      currentCategory = "indictment_evidence";
      isOptional = false;
      continue;
    }
    if (lower.startsWith("optional:")) {
      const val = line.slice(line.indexOf(":") + 1).trim();
      val
        .split(/[\s,]+/)
        .filter(Boolean)
        .forEach((c) => (parsed.optionalEvidenceIds ??= []).push(c));
      continue;
    }

    // 2. Nhận diện cặp key: value bên ngoài phân vùng
    const separatorIndex = line.indexOf(":");
    if (separatorIndex !== -1 && currentCategory === "none") {
      const rawKey = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      const normalizedKey = normalizeKey(rawKey);
      const key = ANSWER_KEYS[normalizedKey];

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
        continue;
      } else if (
        normalizedKey.startsWith("09") ||
        normalizedKey.startsWith("08") ||
        normalizedKey.startsWith("07") ||
        normalizedKey.startsWith("03") ||
        normalizedKey.startsWith("phone_") ||
        normalizedKey.startsWith("sdt_")
      ) {
        const input = parseInputLine(value, rawKey);
        if (input) (parsed.textMatchInputs ??= []).push(input);
        continue;
      }
    }

    // 3. Nhận diện mã vật chứng / SĐT bên trong phân vùng
    if (currentCategory !== "none") {
      const codeOrPhone = line.replace(/^-\s*/, "").trim();
      if (!codeOrPhone) continue;

      const hasVoice = /voice|thoại/i.test(codeOrPhone);
      let phoneDigits = extractPhoneDigits(codeOrPhone);

      // Trường hợp dòng 1 là "- Tin nhắn với SDT" và dòng kế là "0988.200.991"
      if (!phoneDigits && i + 1 < lines.length) {
        const nextDigits = extractPhoneDigits(lines[i + 1]);
        if (nextDigits && nextDigits.length >= 3) {
          phoneDigits = nextDigits;
          i++; // Bỏ qua dòng kế tiếp vì đã bóc số điện thoại
        }
      }

      let resolvedId = codeOrPhone;
      if (phoneDigits) {
        resolvedId = hasVoice ? `voice_phone_${phoneDigits}` : `sms_phone_${phoneDigits}`;
      }

      if (currentCategory === "motive") {
        if (isOptional) {
          (parsed.optionalMotiveIds ??= []).push(resolvedId);
        } else {
          (parsed.motiveEvidenceIds ??= []).push(resolvedId);
          (parsed.validMotives ??= []).push(resolvedId);
        }
      } else if (currentCategory === "alibi") {
        if (isOptional) {
          (parsed.optionalAlibiIds ??= []).push(resolvedId);
        } else {
          (parsed.alibiEvidenceIds ??= []).push(resolvedId);
        }
      } else if (currentCategory === "indictment_evidence") {
        if (isOptional) {
          (parsed.optionalEvidenceIds ??= []).push(resolvedId);
        } else {
          (parsed.requiredEvidenceIds ??= []).push(resolvedId);
        }
      }
      continue;
    }

    // Fallback: nếu không ở trong phân vùng và không có dấu ':'
    if (!parsed.correctAnswer) {
      parsed.correctAnswer = line.trim();
    }
  }

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
  const rawAnswersId =
    typeof row.answers_id === "string" && row.answers_id.trim()
      ? row.answers_id.trim()
      : typeof row.answer_id === "string" && row.answer_id.trim()
      ? row.answer_id.trim()
      : "";
  const rawAnswersText =
    typeof row.answers === "string" ? row.answers.trim() : "";

  // answers_id là cột quét chính, fallback sang answers nếu answers_id trống
  const primaryRaw = rawAnswersId || rawAnswersText;
  const answers = parseAnswersColumn(primaryRaw);
  const dynamicHints = getCheckpointHints(row);

  const hasPickerConfig =
    (answers.validSuspects && answers.validSuspects.length > 0) ||
    (answers.requiredEvidenceIds && answers.requiredEvidenceIds.length > 0) ||
    (answers.motiveEvidenceIds && answers.motiveEvidenceIds.length > 0) ||
    (answers.alibiEvidenceIds && answers.alibiEvidenceIds.length > 0) ||
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
        ...(answers.optionalEvidenceIds && answers.optionalEvidenceIds.length > 0
          ? { optionalEvidenceIds: answers.optionalEvidenceIds }
          : {}),
        ...(answers.motiveEvidenceIds && answers.motiveEvidenceIds.length > 0
          ? { motiveEvidenceIds: answers.motiveEvidenceIds }
          : {}),
        ...(answers.optionalMotiveIds && answers.optionalMotiveIds.length > 0
          ? { optionalMotiveIds: answers.optionalMotiveIds }
          : {}),
        ...(answers.alibiEvidenceIds && answers.alibiEvidenceIds.length > 0
          ? { alibiEvidenceIds: answers.alibiEvidenceIds }
          : {}),
        ...(answers.optionalAlibiIds && answers.optionalAlibiIds.length > 0
          ? { optionalAlibiIds: answers.optionalAlibiIds }
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
    rawAnswersId,
    rawAnswers: rawAnswersText,
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
