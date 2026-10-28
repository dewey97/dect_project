/**
 * Checkpoint `kind` — discriminated union type system.
 *
 * Mỗi checkpoint có một `kind` xác định loại gameplay và shape của
 * `answer_config` JSONB tương ứng. File này:
 * 1. Định nghĩa union type cho mọi kind
 * 2. Parse `answer_config` theo `kind` → typed config
 * 3. Validate cấu hình cho Studio editor
 */

import type { EpilogueStoryItem } from "@/lib/types/checkpoint-studio";
import { asString, asStringArray } from "@/lib/text";

// ---------------------------------------------------------------------------
// 1. Kind enum & discriminated union
// ---------------------------------------------------------------------------

export const CHECKPOINT_KINDS = [
  "phone_lookup",
  "suspect_interrogation",
  "followup",
  "indictment",
  "epilogue",
  "choice",
  "code",
  "time",
  "text",
] as const;

export type CheckpointKind = (typeof CHECKPOINT_KINDS)[number];

/** Cấu hình tra cứu SĐT: danh sách ô nhập liệu khớp tên nghi phạm. */
export interface PhoneLookupConfig {
  kind: "phone_lookup";
  textMatchInputs: {
    id: string;
    label: string;
    placeholder: string;
    validAnswers: string[];
  }[];
}

/** Cấu hình thẩm tra nghi phạm 2 lớp (Động cơ / Mâu thuẫn), AGENTS.md §13. */
export interface SuspectInterrogationConfig {
  kind: "suspect_interrogation";
  motiveEvidenceIds: string[];
  optionalMotiveIds: string[];
  motiveContext?: string;
  contradictionEvidenceIds: string[];
  optionalContradictionIds: string[];
  contradictionContext?: string;
}

/** Cấu hình câu hỏi phụ sau thẩm tra. */
export interface FollowupConfig {
  kind: "followup";
  /** Loại phụ: time | choice | code | text */
  questionType: "time" | "choice" | "code" | "text";
  inputType?: "time" | "choice" | "code" | "text";
  correctAnswer?: string;
  options?: string[];
  photoCodes?: string[];
}

/** Cấu hình cáo trạng kết án. */
export interface IndictmentConfig {
  kind: "indictment";
  validSuspects: string[];
  validMotives: string[];
  requiredEvidenceIds: string[];
  optionalEvidenceIds: string[];
  unlocksDossier?: string;
}

/** Cấu hình hậu án. */
export interface EpilogueConfig {
  kind: "epilogue";
  epilogueStories: EpilogueStoryItem[];
}

/** Cấu hình câu hỏi trắc nghiệm. */
export interface ChoiceConfig {
  kind: "choice";
  options: string[];
  correctAnswer: string;
}

/** Cấu hình nhập mã / mật khẩu. */
export interface CodeConfig {
  kind: "code";
  correctAnswer: string;
}

/** Cấu hình mốc thời gian. */
export interface TimeConfig {
  kind: "time";
  correctAnswer: string;
}

/** Cấu hình nhập văn bản tự do. */
export interface TextConfig {
  kind: "text";
  correctAnswer?: string;
}

export type CheckpointConfig =
  | PhoneLookupConfig
  | SuspectInterrogationConfig
  | FollowupConfig
  | IndictmentConfig
  | EpilogueConfig
  | ChoiceConfig
  | CodeConfig
  | TimeConfig
  | TextConfig;

// ---------------------------------------------------------------------------
// 2. Parser: raw answer_config + kind → typed config
// ---------------------------------------------------------------------------

/** Parse answer_config JSONB thô thành typed config theo kind. */
export function parseCheckpointConfig(
  kind: string,
  raw: Record<string, unknown> | null,
): CheckpointConfig {
  const source = raw ?? {};

  switch (kind) {
    case "phone_lookup":
      return {
        kind: "phone_lookup",
        textMatchInputs: Array.isArray(source.textMatchInputs)
          ? (source.textMatchInputs as Record<string, unknown>[]).map((i) => ({
              id: asString(i.id),
              label: asString(i.label) || asString(i.id),
              placeholder: asString(i.placeholder) || "Nhập tên nghi phạm...",
              validAnswers: asStringArray(i.validAnswers),
            }))
          : [],
      };

    case "suspect_interrogation":
      return {
        kind: "suspect_interrogation",
        motiveEvidenceIds: asStringArray(source.motiveEvidenceIds),
        optionalMotiveIds: asStringArray(source.optionalMotiveIds),
        motiveContext: asString(source.motiveContext) || undefined,
        contradictionEvidenceIds: asStringArray(
          source.contradictionEvidenceIds,
        ),
        optionalContradictionIds: asStringArray(
          source.optionalContradictionIds,
        ),
        contradictionContext:
          asString(source.contradictionContext) || undefined,
      };

    case "followup": {
      const rawType = asString(
        source.inputType || source.input_type || source.questionType,
      );
      const inputType = (
        ["time", "choice", "code", "text"].includes(rawType)
          ? rawType
          : "text"
      ) as FollowupConfig["questionType"];
      return {
        kind: "followup",
        questionType: inputType,
        inputType,
        correctAnswer:
          asString(source.correctAnswer || source.correct_answer) || undefined,
        options: asStringArray(source.options),
        photoCodes: asStringArray(source.photoCodes || source.photo_codes),
      };
    }

    case "indictment":
      return {
        kind: "indictment",
        validSuspects: asStringArray(
          source.validSuspects || source.valid_suspects,
        ),
        validMotives: asStringArray(source.validMotives || source.valid_motives),
        requiredEvidenceIds: asStringArray(
          source.requiredEvidenceIds || source.required_evidence_ids,
        ),
        optionalEvidenceIds: asStringArray(
          source.optionalEvidenceIds || source.optional_evidence_ids,
        ),
        unlocksDossier:
          asString(source.unlocksDossier || source.unlocks_dossier) || undefined,
      };

    case "epilogue":
      return {
        kind: "epilogue",
        epilogueStories: Array.isArray(source.epilogueStories)
          ? (source.epilogueStories as Record<string, unknown>[]).map(
              (s, idx) => ({
                id: asString(s.id) || `epilogue-${idx}`,
                title: asString(s.title) || `Hậu Án ${idx + 1}`,
                monologue: asString(s.monologue) || asString(s.text),
              }),
            )
          : [],
      };

    case "choice":
      return {
        kind: "choice",
        options: asStringArray(source.options),
        correctAnswer: asString(source.correctAnswer),
      };

    case "code":
      return {
        kind: "code",
        correctAnswer: asString(source.correctAnswer),
      };

    case "time":
      return {
        kind: "time",
        correctAnswer: asString(source.correctAnswer),
      };

    case "text":
    default:
      return {
        kind: "text",
        correctAnswer: asString(source.correctAnswer) || undefined,
      };
  }
}

// ---------------------------------------------------------------------------
// 3. Validator: kiểm tra cấu hình đủ/đúng cho Studio
// ---------------------------------------------------------------------------

export interface ValidationError {
  field: string;
  message: string;
}

/** Validate cấu hình checkpoint. Trả mảng lỗi (rỗng = hợp lệ). */
export function validateCheckpointConfig(
  config: CheckpointConfig,
): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (config.kind) {
    case "phone_lookup":
      if (config.textMatchInputs.length === 0) {
        errors.push({
          field: "textMatchInputs",
          message: "Cần ít nhất 1 ô nhập liệu tra cứu SĐT.",
        });
      }
      for (const input of config.textMatchInputs) {
        if (input.validAnswers.length === 0) {
          errors.push({
            field: `textMatchInputs.${input.id}.validAnswers`,
            message: `Ô "${input.label}" chưa có đáp án hợp lệ.`,
          });
        }
      }
      break;

    case "suspect_interrogation":
      if (
        config.motiveEvidenceIds.length === 0 &&
        config.contradictionEvidenceIds.length === 0
      ) {
        errors.push({
          field: "motiveEvidenceIds",
          message: "Cần ít nhất 1 mã chứng cứ cho động cơ hoặc mâu thuẫn.",
        });
      }
      break;

    case "followup":
      if (
        config.questionType === "choice" &&
        (!config.options || config.options.length < 2)
      ) {
        errors.push({
          field: "options",
          message: "Câu trắc nghiệm cần ít nhất 2 phương án.",
        });
      }
      break;

    case "indictment":
      if (config.validSuspects.length === 0) {
        errors.push({
          field: "validSuspects",
          message: "Cần ít nhất 1 nghi phạm hợp lệ.",
        });
      }
      if (config.requiredEvidenceIds.length === 0) {
        errors.push({
          field: "requiredEvidenceIds",
          message: "Cần ít nhất 1 mã chứng cứ bắt buộc.",
        });
      }
      break;

    case "epilogue":
      if (config.epilogueStories.length === 0) {
        errors.push({
          field: "epilogueStories",
          message: "Cần ít nhất 1 phần hậu án.",
        });
      }
      for (const story of config.epilogueStories) {
        if (!story.monologue) {
          errors.push({
            field: `epilogueStories.${story.id}.monologue`,
            message: `Phần "${story.title}" chưa có nội dung.`,
          });
        }
      }
      break;

    case "choice":
      if (config.options.length < 2) {
        errors.push({
          field: "options",
          message: "Cần ít nhất 2 phương án trắc nghiệm.",
        });
      }
      if (!config.correctAnswer) {
        errors.push({
          field: "correctAnswer",
          message: "Chưa có đáp án đúng.",
        });
      }
      break;

    case "code":
    case "time":
      if (!config.correctAnswer) {
        errors.push({
          field: "correctAnswer",
          message: "Chưa có đáp án đúng.",
        });
      }
      break;

    case "text":
      // text có thể không cần correctAnswer (AI check)
      break;
  }

  return errors;
}

/** Kiểm tra giá trị có phải kind hợp lệ. */
export function isValidKind(value: unknown): value is CheckpointKind {
  return (
    typeof value === "string" &&
    (CHECKPOINT_KINDS as readonly string[]).includes(value)
  );
}
