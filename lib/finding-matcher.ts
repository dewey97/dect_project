import { Finding } from '@/content/cases/case-000/findings'

/**
 * Removes Vietnamese diacritics / accents and converts string to lowercase for fuzzy matching
 */
export function normalizeVietnameseText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Checks if raw input text matches a Finding's keyword groups
 */
export function matchesFinding(input: string, finding: Finding): boolean {
  if (!input || input.trim().length < 3) return false

  const normalizedInput = normalizeVietnameseText(input)
  const rawInputLower = input.toLowerCase().trim()

  // Finding matches if input satisfies AT LEAST ONE keyword from EVERY group
  return finding.keywordGroups.every((group) => {
    return group.some((keyword) => {
      const normalizedKeyword = normalizeVietnameseText(keyword)
      return (
        rawInputLower.includes(keyword.toLowerCase()) ||
        normalizedInput.includes(normalizedKeyword)
      )
    })
  })
}

/**
 * Scans list of available findings and returns the first matching finding
 */
export function findMatchingFinding(
  input: string,
  availableFindings: Finding[]
): Finding | null {
  for (const finding of availableFindings) {
    if (matchesFinding(input, finding)) {
      return finding
    }
  }
  return null
}
