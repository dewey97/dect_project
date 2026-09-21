import { Finding } from "@/content/cases/case-000/findings";

/**
 * Removes Vietnamese diacritics / accents and converts string to lowercase for fuzzy matching
 */
export function normalizeVietnameseText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * So khớp linh hoạt một chuỗi người chơi nhập với một đáp án trên Google Sheet.
 *
 * Chấp nhận: khác biệt hoa/thường, có dấu hay không dấu, và khớp theo cụm từ
 * (gõ `Vũ` vẫn đúng cho đáp án `Lê Quang Vũ`).
 * Từ chối khớp chuỗi con thô: `Khang` KHÔNG lọt vào đáp án `Hà`, `Vương` không lọt `Vũ`.
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

  // 2. Đáp án một từ (VD: `vũ`, `hà`, `tùng`): input phải chứa chính xác từ đó
  if (candidateWords.length === 1) {
    return inputWords.includes(candidateWords[0]);
  }

  // 3. Input chứa trọn vẹn cụm từ của đáp án (VD: `Đạt Gà Chợ Cảng` cho đáp án `Đạt Gà`)
  if (normInput.includes(normCandidate)) return true;

  // 4. Mọi từ của đáp án đều có trong input
  if (candidateWords.every((word) => inputWords.includes(word))) return true;

  // 5. Input là tập con các từ của đáp án (VD: gõ `Vũ` cho đáp án `Lê Quang Vũ`)
  return inputWords.every((word) => candidateWords.includes(word));
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
