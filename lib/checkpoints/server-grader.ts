import "server-only";
import { normalizeForMatch, toWords } from "@/lib/text";
import { isAdminBypassCode } from "@/lib/cases/admin-bypass";
import { isEvidenceMatching } from "@/lib/cases/clues";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import type {
  CheckpointKind,
  PhoneLookupConfig,
  SuspectInterrogationConfig,
  FollowupConfig,
  IndictmentConfig,
  ChoiceConfig,
  CodeConfig,
  TimeConfig,
  TextConfig,
} from "./kinds";

export interface CheckpointSubmission {
  caseId: string;
  checkpointId: string;
  /** Dùng cho code, time, choice, text, followup */
  answer?: string;
  /** Dùng cho suspect_interrogation, indictment */
  selectedCodes?: string[];
  /** Phân loại cụ thể cho thẩm tra 3 lớp */
  motiveCodes?: string[];
  alibiCodes?: string[];
  contradictionCodes?: string[];
  /** Dùng cho phone_lookup */
  inputs?: Record<string, string>;
  /** Dùng cho indictment */
  suspect?: string;
  motive?: string;
}

export interface GradeResult {
  correct: boolean;
  feedback?: string;
  unlocksEvidenceId?: string;
  unlocksDossier?: string;
  stageResults?: {
    motive?: boolean;
    alibi?: boolean;
    contradiction?: boolean;
  };
}

function matchPhoneInput(value: string, validAnswers: string[]): boolean {
  if (!value || !value.trim()) return false;
  if (isAdminBypassCode(value)) return true;

  const valueWords = toWords(value);
  if (valueWords.length === 0) return false;

  return validAnswers.some((ans) => {
    if (isAdminBypassCode(ans)) return true;
    const ansWords = toWords(ans);
    if (ansWords.length === 0) return false;
    // Khớp nếu mọi từ trong đáp án đều xuất hiện trong input
    return ansWords.every((w) => valueWords.includes(w));
  });
}

/**
 * Thẩm định bộ mã chứng cứ:
 * 1. Chứa đầy đủ các mã bắt buộc (targetCodes).
 * 2. Không chứa bất kỳ mã nào nằm ngoài tập hợp [targetCodes, optionalCodes] (AGENTS.md §13).
 */
function validateEvidenceSelection(
  selected: string[],
  targetCodes: string[],
  optionalCodes: string[] = [],
): boolean {
  if (selected.some((code) => isAdminBypassCode(code))) return true;

  const validPool = [...targetCodes, ...optionalCodes];

  // 1. Phải thỏa mãn toàn bộ target codes
  const hasAllTargets = targetCodes.every((target) =>
    selected.some((sel) => isEvidenceMatching(sel, [target])),
  );
  if (!hasAllTargets) return false;

  // 2. Chặn spam: mọi mã đã chọn phải thuộc valid pool
  const hasNoInvalidCodes = selected.every((sel) =>
    validPool.some((valid) => isEvidenceMatching(sel, [valid])),
  );

  return hasNoInvalidCodes;
}

function inferCheckpointKind(checkpoint: DbCaseCheckpoint): CheckpointKind {
  if (checkpoint.kind) return checkpoint.kind as CheckpointKind;
  return (checkpoint.type as CheckpointKind) || "text";
}

/**
 * Chấm điểm tập trung server-side cho một submission đối chiếu với checkpoint trong DB.
 */
export function gradeCheckpoint(
  checkpoint: DbCaseCheckpoint,
  sub: CheckpointSubmission,
): GradeResult {
  const kind = inferCheckpointKind(checkpoint);
  const cfg = (checkpoint.answer_config || {}) as Record<string, any>;
  const baseUnlock = {
    unlocksDossier: cfg.unlocksDossier || undefined,
  };

  // 1. Phone Lookup (Tra cứu SĐT danh bạ)
  if (kind === "phone_lookup") {
    const inputsList = (cfg.textMatchInputs ||
      []) as PhoneLookupConfig["textMatchInputs"];
    if (!inputsList || inputsList.length === 0) {
      return {
        correct: false,
        feedback:
          "Checkpoint tra cứu danh bạ chưa được cấu hình danh sách số điện thoại trong hệ thống.",
      };
    }
    const userInputs = sub.inputs || {};

    // Kiểm tra bypass code
    const hasBypass = Object.values(userInputs).some((v) =>
      isAdminBypassCode(v),
    );
    if (hasBypass) {
      return {
        correct: true,
        feedback: "Admin bypass accepted",
        ...baseUnlock,
      };
    }

    const allMatch = inputsList.every((inp, idx) => {
      // Hỗ trợ cả key theo id hoặc legacy phone1, phone2, phone3
      const val =
        userInputs[inp.id] ??
        (idx === 0
          ? userInputs.phone1
          : idx === 1
            ? userInputs.phone2
            : userInputs.phone3) ??
        "";
      return matchPhoneInput(val, inp.validAnswers || []);
    });

    if (allMatch) {
      return {
        correct: true,
        feedback: "Xác thực danh tính chủ thể thành công",
        ...baseUnlock,
      };
    }
    return {
      correct: false,
      feedback:
        "Danh tính chủ thể chưa chính xác. Vui lòng đối chiếu lại tài liệu điều tra.",
    };
  }

  // 2. Suspect Interrogation (Thẩm tra nghi phạm 3 lớp)
  if (kind === "suspect_interrogation") {
    const motiveTargets = (cfg.motiveEvidenceIds || []) as string[];
    const motiveOptionals = (cfg.optionalMotiveIds || []) as string[];
    const alibiTargets = (cfg.alibiEvidenceIds || []) as string[];
    const alibiOptionals = (cfg.optionalAlibiIds || []) as string[];
    const contTargets = (cfg.contradictionEvidenceIds || []) as string[];
    const contOptionals = (cfg.optionalContradictionIds || []) as string[];

    const stageResults: GradeResult["stageResults"] = {};

    // Nếu người chơi gửi tách theo lớp:
    if (sub.motiveCodes || sub.alibiCodes || sub.contradictionCodes) {
      if (motiveTargets.length > 0) {
        stageResults.motive = validateEvidenceSelection(
          sub.motiveCodes || [],
          motiveTargets,
          motiveOptionals,
        );
      }
      if (alibiTargets.length > 0) {
        stageResults.alibi = validateEvidenceSelection(
          sub.alibiCodes || [],
          alibiTargets,
          alibiOptionals,
        );
      }
      if (contTargets.length > 0) {
        stageResults.contradiction = validateEvidenceSelection(
          sub.contradictionCodes || [],
          contTargets,
          contOptionals,
        );
      }
      const allPassed = Object.values(stageResults).every(Boolean);
      return {
        correct: allPassed,
        stageResults,
        feedback: allPassed
          ? "Thẩm tra thành công"
          : "Chứng cứ thẩm tra chưa chính xác",
        ...baseUnlock,
      };
    }

    // Nếu người chơi gửi chung danh sách `selectedCodes`:
    const allSelected = sub.selectedCodes || [];
    const motiveOk =
      motiveTargets.length === 0 ||
      validateEvidenceSelection(allSelected, motiveTargets, motiveOptionals);
    const contOk =
      contTargets.length === 0 ||
      validateEvidenceSelection(allSelected, contTargets, contOptionals);

    const correct = motiveOk && contOk;
    return {
      correct,
      stageResults: { motive: motiveOk, contradiction: contOk },
      feedback: correct
        ? "Thẩm tra đối tượng thành công"
        : "Bộ chứng cứ thẩm tra chưa khớp",
      ...baseUnlock,
    };
  }

  // 3. Indictment (Cáo trạng kết án)
  if (kind === "indictment") {
    const rawSuspects = (cfg.validSuspects || []) as string[];
    const validSuspects = rawSuspects;
    const validMotives = (cfg.validMotives || []) as string[];
    const requiredEvidence = (cfg.requiredEvidenceIds || []) as string[];
    const optionalEvidence = (cfg.optionalEvidenceIds || []) as string[];

    const userSuspect = sub.suspect || "";
    const userMotive = sub.motive || "";
    const userCodes = sub.selectedCodes || [];

    // Kiểm tra bypass
    if (
      isAdminBypassCode(userSuspect) ||
      isAdminBypassCode(userMotive) ||
      userCodes.some((c) => isAdminBypassCode(c))
    ) {
      return {
        correct: true,
        feedback: "Admin bypass accepted",
        ...baseUnlock,
      };
    }

    // 1. Check suspect (so sánh mềm)
    const suspectOk =
      validSuspects.length === 0 ||
      validSuspects.some((target) => {
        const normTarget = normalizeForMatch(target);
        const normUser = normalizeForMatch(userSuspect);
        return normTarget.trim() === normUser.trim();
      });

    if (!suspectOk) {
      return {
        correct: false,
        feedback:
          "Kết luận đối tượng chưa chính xác. Vui lòng đối chiếu lại toàn bộ chứng cứ.",
      };
    }

    // 2. Check motive
    const motiveOk =
      validMotives.length === 0 ||
      validMotives.some((m) => {
        const normTarget = normalizeForMatch(m);
        const normUser = normalizeForMatch(userMotive);
        return normTarget === normUser || normUser.includes(normTarget);
      });

    if (!motiveOk) {
      return {
        correct: false,
        feedback: "Động cơ gây án chưa chính xác.",
      };
    }

    // 3. Check evidence selection
    const evidenceOk =
      requiredEvidence.length === 0 ||
      validateEvidenceSelection(userCodes, requiredEvidence, optionalEvidence);

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
      ...baseUnlock,
    };
  }

  // 4. Followup (Phân nhánh theo inputType: choice | time | code | text)
  if (kind === "followup") {
    const rawType = String(
      cfg.inputType || cfg.input_type || cfg.questionType || "",
    ).toLowerCase();

    // 4a. Followup trắc nghiệm (Choice)
    if (rawType === "choice") {
      const userAns = (sub.answer || "").trim();
      const correctAns = (cfg.correctAnswer || cfg.correct_answer || "").trim();
      const options = (cfg.options || []) as string[];

      if (isAdminBypassCode(userAns)) {
        return {
          correct: true,
          feedback: "Admin bypass accepted",
          ...baseUnlock,
        };
      }

      const normUser = normalizeForMatch(userAns);
      const normCorrect = normalizeForMatch(correctAns);
      let isMatch = normUser === normCorrect;

      if (!isMatch && !isNaN(Number(userAns))) {
        const idx = Number(userAns);
        if (options[idx]) {
          isMatch = normalizeForMatch(options[idx]) === normCorrect;
        }
      }

      return {
        correct: isMatch,
        feedback: isMatch ? "Lựa chọn chính xác" : "Lựa chọn chưa chính xác",
        ...baseUnlock,
      };
    }

    // 4b. Followup thời gian (Time)
    if (rawType === "time") {
      const userAns = (sub.answer || "").trim();
      const correctAns = (cfg.correctAnswer || cfg.correct_answer || "").trim();

      if (isAdminBypassCode(userAns)) {
        return {
          correct: true,
          feedback: "Admin bypass accepted",
          ...baseUnlock,
        };
      }

      const cleanUser = userAns.replace(/\s+/g, "").toLowerCase();
      const cleanCorrect = correctAns.replace(/\s+/g, "").toLowerCase();
      const isMatch =
        cleanUser === cleanCorrect ||
        cleanUser === cleanCorrect.replace(":", "h") ||
        cleanUser === cleanCorrect.replace("h", ":");

      return {
        correct: isMatch,
        feedback: isMatch
          ? "Mốc thời gian chính xác"
          : "Mốc thời gian chưa chính xác",
        ...baseUnlock,
      };
    }

    // 4c. Followup mật mã (Code)
    if (rawType === "code") {
      const userAns = (sub.answer || "").trim().replace(/\s+/g, "");
      const correctAns = (cfg.correctAnswer || cfg.correct_answer || "")
        .trim()
        .replace(/\s+/g, "");

      if (isAdminBypassCode(userAns)) {
        return {
          correct: true,
          feedback: "Admin bypass accepted",
          ...baseUnlock,
        };
      }

      const isMatch = userAns.toLowerCase() === correctAns.toLowerCase();

      return {
        correct: isMatch,
        feedback: isMatch ? "Mật mã chính xác" : "Mật mã chưa chính xác",
        ...baseUnlock,
      };
    }
  }

  // 5. Code / Time / Text đơn thuần hoặc Followup dạng text
  if (
    kind === "followup" ||
    kind === "code" ||
    kind === "time" ||
    kind === "text"
  ) {
    const userAns = (sub.answer || "").trim();
    const correctAns = (cfg.correctAnswer || "").trim();

    if (isAdminBypassCode(userAns)) {
      return {
        correct: true,
        feedback: "Admin bypass accepted",
        ...baseUnlock,
      };
    }

    if (!correctAns) {
      // Nếu checkpoint không yêu cầu đáp án cố định
      return { correct: true, ...baseUnlock };
    }

    const normUser = normalizeForMatch(userAns);
    const normCorrect = normalizeForMatch(correctAns);

    let isMatch = normUser === normCorrect;

    // Hỗ trợ định dạng giờ linh hoạt (: vs h)
    if (!isMatch && normCorrect.includes(":")) {
      const cleanUser = userAns.replace(/\s+/g, "").toLowerCase();
      const cleanCorrect = normCorrect.replace(/\s+/g, "").toLowerCase();
      isMatch =
        cleanUser === cleanCorrect ||
        cleanUser === cleanCorrect.replace(":", "h") ||
        cleanUser === cleanCorrect.replace("h", ":");
    }

    return {
      correct: isMatch,
      feedback: isMatch
        ? "Câu trả lời chính xác"
        : "Câu trả lời chưa chính xác",
      ...baseUnlock,
    };
  }

  // 5. Choice (Trắc nghiệm)
  if (kind === "choice") {
    const userAns = (sub.answer || "").trim();
    const correctAns = (cfg.correctAnswer || "").trim();
    const options = (cfg.options || []) as string[];

    if (isAdminBypassCode(userAns)) {
      return { correct: true, ...baseUnlock };
    }

    // Khớp theo nội dung đáp án hoặc index
    const normUser = normalizeForMatch(userAns);
    const normCorrect = normalizeForMatch(correctAns);

    let isMatch = normUser === normCorrect;
    if (!isMatch && !isNaN(Number(userAns))) {
      const idx = Number(userAns);
      if (options[idx]) {
        isMatch = normalizeForMatch(options[idx]) === normCorrect;
      }
    }

    return {
      correct: isMatch,
      feedback: isMatch ? "Lựa chọn chính xác" : "Lựa chọn chưa chính xác",
      ...baseUnlock,
    };
  }

  // 6. Epilogue: luôn hợp lệ
  if (kind === "epilogue") {
    return { correct: true, ...baseUnlock };
  }

  return {
    correct: false,
    feedback: "Loại checkpoint không hỗ trợ chấm tự động",
  };
}
