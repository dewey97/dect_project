/**
 * Domain Storage Helper
 * 
 * Quản lý localStorage thuần nghiệp vụ (domain-driven), KHÔNG gắn nhãn thương hiệu.
 */

export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {}
  return null
}

export function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {}
}

export function getStorageJson<T>(key: string, defaultValue: T): T {
  const item = getStorageItem(key)
  if (item === null || item === undefined || item === '') return defaultValue
  try {
    return JSON.parse(item) as T
  } catch {
    return defaultValue
  }
}

export function setStorageJson<T>(key: string, value: T): void {
  try {
    setStorageItem(key, JSON.stringify(value))
  } catch {}
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {}
}

export const INVESTIGATION_STORAGE_KEYS = [
  'canvas_suspects',
  'investigated_suspects',
  'solved_followups',
  'indictment_solved',
  'indictment_culprit',
  'reinvestigate_opened',
  'phone_inputs',
  'phone_solved',
  'custom_notes',
  'discovered_findings',
  'completed_checkpoints',
  'intro_seen',
  'play_experience',
  'investigation_mode',
  'hint_unlocked_levels',
  'walkthrough_completed',
  'boardgame_pins_case-000',
  'admin_custom_pins_case-000',
  'boardgame_transforms_case-000',
  'admin_connections_case-000',
  'phone_pinned_clues',
  'unlocked_dossiers',
  'board_layout_version',
]

/** Câu trả lời câu hỏi phụ lưu theo nghi phạm: `followup_<key>`, `followup_<key>_choice`... */
const FOLLOWUP_KEY_PREFIX = 'followup_'

export function clearInvestigationStorage(): void {
  INVESTIGATION_STORAGE_KEYS.forEach(removeStorageItem)
  if (typeof window === 'undefined') return
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(FOLLOWUP_KEY_PREFIX))
      .forEach(removeStorageItem)
  } catch {}
}
