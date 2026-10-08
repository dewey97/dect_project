/**
 * Domain Storage Helper
 * 
 * Quản lý localStorage thuần nghiệp vụ (domain-driven), KHÔNG gắn nhãn thương hiệu
 * (không prefix veritas_, nocturne_, xplore_).
 * 
 * Tự động đọc fallback nếu người dùng còn dữ liệu từ các phiên bản gắn brand cũ.
 */

const LEGACY_PREFIXES = ['xplore_', 'veritas_', 'nocturne_']

export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const directVal = localStorage.getItem(key)
    if (directVal !== null) return directVal

    for (const prefix of LEGACY_PREFIXES) {
      const legacyVal = localStorage.getItem(`${prefix}${key}`)
      if (legacyVal !== null) return legacyVal
    }
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
    for (const prefix of LEGACY_PREFIXES) {
      localStorage.removeItem(`${prefix}${key}`)
    }
  } catch {}
}

export const INVESTIGATION_STORAGE_KEYS = [
  'canvas_suspects',
  'investigated_suspects',
  'solved_followups',
  'followup_vu',
  'followup_tung',
  'followup_ha',
  'followup_ha_matches',
  'followup_tung_choice',
  'followup_vu_choice',
  'followup_ha_choice',
  'indictment_solved',
  'indictment_culprit',
  'reinvestigate_unlocked',
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
  'khang_phone_pinned_clues',
]

export function clearInvestigationStorage(): void {
  INVESTIGATION_STORAGE_KEYS.forEach(removeStorageItem)
}
