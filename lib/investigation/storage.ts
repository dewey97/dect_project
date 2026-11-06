/**
 * Domain Storage Helper
 * 
 * Quản lý localStorage thuần nghiệp vụ (domain-driven), KHÔNG gắn nhãn thương hiệu.
 *
 * Cách ly Solo và Room (spec group_play_realtime.md 1.3 mục 3, 8.1 mục 3):
 * khi thiết bị đang ở một phòng chơi nhóm, RoomSyncProvider gọi `setStorageScope(roomId)`.
 * Mọi key đi qua helper này được thêm tiền tố `room:<id>::`, nên đang ở phòng thì
 * không đọc, không ghi savegame Solo. Trừ vài tùy chọn giao diện của thiết bị.
 */

const UNSCOPED_KEYS = new Set(['play_experience', 'investigation_mode', 'walkthrough_completed'])

let scopePrefix = ''

export function setStorageScope(roomId: string | null): void {
  scopePrefix = roomId ? `room:${roomId}::` : ''
}

/** Xóa toàn bộ key cục bộ của một phòng (khi rời phòng). */
export function clearStorageScope(roomId: string): void {
  if (typeof window === 'undefined') return
  const prefix = `room:${roomId}::`
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k))
  } catch {}
}

function scoped(key: string): string {
  return scopePrefix && !UNSCOPED_KEYS.has(key) ? scopePrefix + key : key
}

export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(scoped(key))
  } catch {}
  return null
}

export function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(scoped(key), value)
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
    localStorage.removeItem(scoped(key))
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
