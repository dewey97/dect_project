import type { Finding } from "@/lib/types";
import { normalizeForMatch } from "@/lib/text";

/**
 * Removes Vietnamese diacritics / accents and converts string to lowercase for fuzzy matching
 */
export function normalizeVietnameseText(str: string): string {
  return normalizeForMatch(str)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * So khớp linh hoạt một chuỗi người chơi nhập với một đáp án trên Google Sheet.
 *
 * Chấp nhận: khác biệt hoa/thường, có dấu hay không dấu, và khớp theo cụm từ
 * (gõ `Đạt` vẫn đúng cho đáp án `Nguyễn Tiến Đạt`).
 * Từ chối khớp chuỗi con thô: `Khang` KHÔNG lọt vào đáp án `An`, `Vương` không lọt `Đạt`.
 */
export function isVietnameseTextMatch(
  input: string,
  candidate: string,
): boolean {
  const normInput = normalizeVietnameseText(input);
  const normCandidate = normalizeVietnameseText(candidate);
  if (!normInput || !normCandidate) return false;

  // 1. Trùng khớp hoàn toàn sau khi chuẩn hoá
  if (normInput === normCandidate) return true;

  const inputWords = normInput.split(" ").filter(Boolean);
  const candidateWords = normCandidate.split(" ").filter(Boolean);

  // 2. Input là tập con các từ của đáp án (VD: gõ `Đạt` cho đáp án `Nguyễn Tiến Đạt`, `Đạt Gà` cho `Đạt Gà Chợ Cảng`)
  // BẮT BUỘC: Mọi từ người chơi gõ đều phải nằm trong đáp án (không được có từ lạ / tên người khác)
  if (inputWords.length < candidateWords.length) {
    if (inputWords.every((word) => candidateWords.includes(word))) {
      return true;
    }
  }

  // 3. Người chơi gõ họ tên đầy đủ (VD: `Nguyễn Tiến Đạt`) khi trên Sheet chỉ để tên gọi tắt (`Đạt`)
  // BẮT BUỘC: Tên người chơi gõ phải kết thúc bằng từ của đáp án, độ dài hợp lý (<= 4 từ),
  // và KHÔNG được chứa các liên từ nối 2 người ("va", "cung", "hoac", "voi"...)
  if (
    candidateWords.length === 1 &&
    inputWords.length > 1 &&
    inputWords.length <= 4
  ) {
    const lastWord = inputWords[inputWords.length - 1];
    const invalidConjunctions = ["va", "cung", "hoac", "voi", "khong", "phai"];
    const hasConjunction = inputWords.some((w) =>
      invalidConjunctions.includes(w),
    );
    if (!hasConjunction && lastWord === candidateWords[0]) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if raw input text matches a Finding's keyword groups
 */
export function matchesFinding(input: string, finding: Finding): boolean {
  if (!input || input.trim().length < 3) return false;

  const normalizedInput = normalizeVietnameseText(input);
  const rawInputLower = input.toLowerCase().trim();

  // Finding matches if input satisfies AT LEAST ONE keyword from EVERY group
  return finding.keywordGroups.every((group) => {
    return group.some((keyword) => {
      const normalizedKeyword = normalizeVietnameseText(keyword);
      return (
        rawInputLower.includes(keyword.toLowerCase()) ||
        normalizedInput.includes(normalizedKeyword)
      );
    });
  });
}

/**
 * Scans list of available findings and returns the first matching finding
 */
export function findMatchingFinding(
  input: string,
  availableFindings: Finding[],
): Finding | null {
  for (const finding of availableFindings) {
    if (matchesFinding(input, finding)) {
      return finding;
    }
  }
  return null;
}
