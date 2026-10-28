import "server-only";
import { asString, normalizeForMatch } from "@/lib/text";
import { isAdminBypassCode } from "@/lib/cases/admin-bypass";
import {
  checkContradictionValid,
  checkMotiveValid,
  isEvidenceMatching,
} from "@/lib/cases/clues";
import { isVietnameseTextMatch } from "@/lib/finding-matcher";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import {
  parseCheckpointConfig,
  type CheckpointKind,
  type FollowupConfig,
} from "./kinds";

export interface CheckpointSubmission {
  caseId: string;
  checkpointId: string;
  /** Dùng cho followup, choice, code, time, text */
  answer?: string;
  /** Dùng cho indictment (và evidence picker chung) */
  selectedCodes?: string[];
  /** Thẩm tra 2 lớp: chỉ chấm lớp nào được gửi lên */
  motiveCodes?: string[];
  contradictionCodes?: string[];
  /** Dùng cho phone_lookup: key = id ô nhập */
  inputs?: Record<string, string>;
  /** Dùng cho indictment */
  suspect?: string;
  motive?: string;
}

export interface GradeResult {
  correct: boolean;
  feedback?: string;
  unlocksDossier?: string;
  /** Indictment: nghi phạm đúng (để client biết hung thủ khi dùng mã bypass). */
  culprit?: string;
  stageResults?: {
    motive?: boolean;
    contradiction?: boolean;
  };
}

type AnswerInputType = FollowupConfig["questionType"];

/**
 * Thẩm định bộ mã chứng cứ (AGENTS.md §13):
 * 1. Chứa đủ mã bắt buộc (targetCodes).
 * 2. Không chứa mã nào ngoài [targetCodes, optionalCodes].
 */
function validateEvidenceSelection(
  selected: string[],
  targetCodes: string[],
  optionalCodes: string[] = [],
): boolean {
  const validPool = [...targetCodes, ...optionalCodes];
  const hasAllTargets = targetCodes.every((target) =>
    selected.some((sel) => isEvidenceMatching(sel, [target])),
  );
  if (!hasAllTargets) return false;
  return selected.every((sel) =>
    validPool.some((valid) => isEvidenceMatching(sel, [valid])),
  );
}

function sameTime(user: string, expected: string): boolean {
  const u = user.replace(/\s+/g, "").toLowerCase();
  const e = expected.replace(/\s+/g, "").toLowerCase();
  return u === e || u === e.replace(":", "h") || u === e.replace("h", ":");
}

/** So khớp một câu trả lời đơn theo kiểu ô nhập. Không có đáp án = chấp nhận. */
export function matchAnswer(
  inputType: AnswerInputType,
  user: string,
  expected: string,
  options: string[] = [],
): boolean {
  const userAns = user.trim();
  const correct = expected.trim();
  if (!correct) return true;

  switch (inputType) {
    case "choice": {
      const normCorrect = normalizeForMatch(correct);
      if (normalizeForMatch(userAns) === normCorrect) return true;
      const idx = Number(userAns);
      return (
        userAns !== "" &&
        Number.isInteger(idx) &&
        Boolean(options[idx]) &&
        normalizeForMatch(options[idx]) === normCorrect
      );
    }
    case "time":
      return sameTime(userAns, correct);
    case "code":
      return (
        userAns.replace(/\s+/g, "").toLowerCase() ===
        correct.replace(/\s+/g, "").toLowerCase()
      );
    case "text":
    default:
      return (
        normalizeForMatch(userAns) === normalizeForMatch(correct) ||
        (correct.includes(":") && sameTime(userAns, correct))
      );
  }
}

function submittedValues(sub: CheckpointSubmission): string[] {
  return [
    sub.answer,
    sub.suspect,
    sub.motive,
    ...(sub.selectedCodes || []),
    ...(sub.motiveCodes || []),
    ...(sub.contradictionCodes || []),
    ...Object.values(sub.inputs || {}),
  ].filter((v): v is string => typeof v === "string");
}

function inferCheckpointKind(checkpoint: DbCaseCheckpoint): CheckpointKind {
  return (checkpoint.kind || checkpoint.type || "text") as CheckpointKind;
}

/** Chấm điểm tập trung server-side cho một submission. */
export function gradeCheckpoint(
  checkpoint: DbCaseCheckpoint,
  sub: CheckpointSubmission,
): GradeResult {
  const rawConfig = (checkpoint.answer_config ?? {}) as Record<string, unknown>;
  const config = parseCheckpointConfig(inferCheckpointKind(checkpoint), rawConfig);
  const unlocksDossier =
    asString(rawConfig.unlocksDossier || rawConfig.unlocks_dossier) ||
    undefined;
  const base = { unlocksDossier };

  if (submittedValues(sub).some(isAdminBypassCode)) {
    const culprit =
      config.kind === "indictment" ? config.validSuspects[0] : undefined;
    return {
      correct: true,
      feedback: "Admin bypass accepted",
      culprit,
      ...base,
    };
  }

  switch (config.kind) {
    case "phone_lookup": {
      if (config.textMatchInputs.length === 0) {
        return {
          correct: false,
          feedback:
            "Checkpoint tra cứu danh bạ chưa được cấu hình danh sách số điện thoại.",
        };
      }
      const userInputs = sub.inputs || {};
      const allMatch = config.textMatchInputs.every((inp) =>
        inp.validAnswers.some((ans) =>
          isVietnameseTextMatch(userInputs[inp.id] || "", ans),
        ),
      );
      return allMatch
        ? {
            correct: true,
            feedback: "Xác thực danh tính chủ thể thành công",
            ...base,
          }
        : {
            correct: false,
            feedback:
              "Danh tính chủ thể chưa chính xác. Vui lòng đối chiếu lại tài liệu điều tra.",
          };
    }

    case "suspect_interrogation": {
      // Chỉ chấm lớp được gửi lên; lớp không có mã yêu cầu thì đạt.
      const stageResults: NonNullable<GradeResult["stageResults"]> = {};
      if (sub.motiveCodes) {
        stageResults.motive =
          config.motiveEvidenceIds.length === 0 ||
          checkMotiveValid(
            config.motiveEvidenceIds,
            sub.motiveCodes,
            config.optionalMotiveIds,
          );
      }
      if (sub.contradictionCodes) {
        stageResults.contradiction =
          config.contradictionEvidenceIds.length === 0 ||
          checkContradictionValid(
            config.contradictionEvidenceIds,
            sub.contradictionCodes,
            config.optionalContradictionIds,
          );
      }
      const graded = Object.values(stageResults);
      const correct = graded.length > 0 && graded.every(Boolean);
      return {
        correct,
        stageResults,
        feedback: correct
          ? "Thẩm tra thành công"
          : "Chứng cứ thẩm tra chưa chính xác",
        ...base,
      };
    }

    case "indictment": {
      const userSuspect = normalizeForMatch(sub.suspect || "").trim();
      const culprit = config.validSuspects.find(
        (target) => normalizeForMatch(target).trim() === userSuspect,
      );
      if (config.validSuspects.length > 0 && !culprit) {
        return {
          correct: false,
          feedback:
            "Kết luận đối tượng chưa chính xác. Vui lòng đối chiếu lại toàn bộ chứng cứ.",
        };
      }

      const userMotive = normalizeForMatch(sub.motive || "");
      const motiveOk =
        config.validMotives.length === 0 ||
        config.validMotives.some((m) => {
          const target = normalizeForMatch(m);
          return target === userMotive || userMotive.includes(target);
        });
      if (!motiveOk) {
        return { correct: false, feedback: "Động cơ gây án chưa chính xác." };
      }

      const evidenceOk =
        config.requiredEvidenceIds.length === 0 ||
        validateEvidenceSelection(
          sub.selectedCodes || [],
          config.requiredEvidenceIds,
          config.optionalEvidenceIds,
        );
      if (!evidenceOk) {
        return {
          correct: false,
          feedback:
            "Bộ tài liệu chứng cứ chứng minh hành vi phạm tội chưa đầy đủ hoặc có mã sai.",
        };
      }

      return {
        correct: true,
        feedback: "Cáo trạng đã được phê chuẩn! Vụ án khép lại.",
        culprit: culprit || config.validSuspects[0],
        ...base,
      };
    }

    case "epilogue":
      return { correct: true, ...base };

    case "followup":
    case "choice":
    case "code":
    case "time":
    case "text": {
      const inputType: AnswerInputType =
        config.kind === "followup" ? config.questionType : config.kind;
      const options = "options" in config ? config.options || [] : [];
      const correct = matchAnswer(
        inputType,
        sub.answer || "",
        config.correctAnswer || "",
        options,
      );
      return {
        correct,
        feedback: correct
          ? "Câu trả lời chính xác"
          : "Câu trả lời chưa chính xác",
        ...base,
      };
    }
  }
}
