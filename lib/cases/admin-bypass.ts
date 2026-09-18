/**
 * Centralized Admin / Bypass Code Helper for DECT Project
 * Ensures '00', '000', '0', 'admin' auto-passes text inputs, codes, and checkpoints across the app without code duplication.
 */

export const ADMIN_BYPASS_CODES = [
  '0',
  '00',
  '000',
  '0000',
  '00000',
  'doc_0',
  'doc_00',
  'doc_000',
  'doc_0000',
  'admin',
  'ADMIN',
]

export const ADMIN_MASTER_EVIDENCE_ID = 'doc_000'
export const ADMIN_MASTER_EVIDENCE = {
  id: ADMIN_MASTER_EVIDENCE_ID,
  label: 'Tài liệu số 000 (Admin Master Key)',
  code: '000',
}

/**
 * Checks if a string input is an admin bypass / cheat code
 */
export function isAdminBypassCode(input?: string | null): boolean {
  if (!input) return false
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) return false

  // Exact matches
  if (ADMIN_BYPASS_CODES.includes(trimmed) || ADMIN_BYPASS_CODES.includes(input.trim())) {
    return true
  }

  // Normalized alphanumeric check (handles punctuation/spaces like '0 0', '#00', 'doc-000')
  const clean = trimmed.replace(/[^a-z0-9]/g, '')
  if (clean === '0' || clean === '00' || clean === '000' || clean === '0000' || clean === '00000') {
    return true
  }
  if (clean === 'doc0' || clean === 'doc00' || clean === 'doc000' || clean === 'doc0000') {
    return true
  }
  if (clean === 'admin' || clean === 'bypass') {
    return true
  }

  return false
}

/**
 * Checks if an array of selected IDs or codes contains any admin bypass code
 */
export function hasAdminBypassInArray(arr?: (string | null | undefined)[]): boolean {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return false
  return arr.some((item) => {
    if (!item) return false
    if (item === ADMIN_MASTER_EVIDENCE_ID) return true
    return isAdminBypassCode(item) || item.includes('000') || item.includes('doc_00') || item === '00' || item === '0'
  })
}
