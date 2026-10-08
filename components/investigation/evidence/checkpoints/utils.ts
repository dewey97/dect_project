import type { Checkpoint } from "@/lib/types";
import { isVietnameseTextMatch } from "@/lib/finding-matcher";

/** Chuẩn hóa mã vật chứng để so khớp chính xác không phân biệt hoa thường hay tiền tố */
export function normalizeEvidenceCode(code: string): string {
  return (code || "")
    .trim()
    .toLowerCase()
    .replace(/^doc_|^ev_|^p_/, "")
    .replace(/_/g, "-");
}

export interface CheckpointValidationState {
  textMatchValues: Record<string, string>;
  suspectInput: string;
  mismatchTypeSelect: string;
  motiveSelect: string;
  selectedEvidenceIds: string[];
  convergenceSelections: Record<string, string>;
}

/**
 * Validate form submission based on checkpoint type
 */
export function validateCheckpointAnswer(
  cp: Checkpoint,
  state: CheckpointValidationState,
): boolean {
  // 1. Text Match 3 (e.g. cp-000-0)
  if (cp.type === "text_match_3") {
    if (!cp.textMatchConfig?.inputs || cp.textMatchConfig.inputs.length === 0)
      return false;
    return cp.textMatchConfig.inputs.every((inp) => {
      const val = (state.textMatchValues[inp.id] || "").trim();
      if (!val) return false;
      if (
        val === "00" ||
        val === "000" ||
        val === "0" ||
        val.toLowerCase() === "admin"
      )
        return true;
      return inp.validAnswers.some((ans) => isVietnameseTextMatch(val, ans));
    });
  }

  // 2. Evidence Picker & Accusation
  if (cp.type === "evidence_picker" || cp.type === "accusation") {
    const sVal = state.suspectInput.trim();
    if (!sVal) return false;
    const isAdmin =
      sVal === "00" ||
      sVal === "000" ||
      sVal === "0" ||
      sVal.toLowerCase() === "admin";
    if (isAdmin) return true;

    if (
      cp.pickerConfig?.validSuspects &&
      cp.pickerConfig.validSuspects.length > 0
    ) {
      const isSuspectValid = cp.pickerConfig.validSuspects.some((validS) =>
        isVietnameseTextMatch(sVal, validS),
      );
      if (!isSuspectValid) return false;
    }

    // Check mismatch type
    if (
      cp.pickerConfig?.validMismatchTypes &&
      cp.pickerConfig.validMismatchTypes.length > 0
    ) {
      if (!cp.pickerConfig.validMismatchTypes.includes(state.mismatchTypeSelect)) {
        return false;
      }
    }

    // Check motive
    if (
      cp.pickerConfig?.validMotives &&
      cp.pickerConfig.validMotives.length > 0
    ) {
      if (!cp.pickerConfig.validMotives.includes(state.motiveSelect)) {
        return false;
      }
    }

    // Check required evidence IDs — so khớp mã vật chứng giữa checkpoint và tab `evidences`
    if (
      cp.pickerConfig?.requiredEvidenceIds &&
      cp.pickerConfig.requiredEvidenceIds.length > 0
    ) {
      const selectedCodes = new Set(
        state.selectedEvidenceIds.map((id) => normalizeEvidenceCode(id)),
      );
      const missingEvidence = cp.pickerConfig.requiredEvidenceIds.filter(
        (reqId) => !selectedCodes.has(normalizeEvidenceCode(reqId)),
      );
      if (missingEvidence.length > 0) return false;
    }

    return true;
  }

  // 3. Convergence Node
  if (cp.type === "convergence") {
    if (
      !cp.convergenceConfig?.suspects ||
      cp.convergenceConfig.suspects.length === 0
    )
      return false;
    return cp.convergenceConfig.suspects.every((s) => {
      const selectedReason = state.convergenceSelections[s.id];
      if (!selectedReason) return false;
      return s.validReasons.includes(selectedReason);
    });
  }

  return true;
}
