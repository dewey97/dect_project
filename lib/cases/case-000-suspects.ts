import { isAdminBypassCode } from './admin-bypass'

export interface SuspectCharacter {
  id: string
  canonicalName: string
  aliases: string[]
  role: string
  avatarUrl: string
  slotIndex: number
}

export const DEFAULT_AVATAR_PLACEHOLDER = '/images/avatar_placeholder.svg'

export const VALID_CASE_CHARACTERS: SuspectCharacter[] = [
  {
    id: 'vu',
    canonicalName: 'Lê Quang Vũ',
    aliases: ['lê quang vũ', 'le quang vu', 'vũ', 'vu', 'quang vũ', 'quang vu'],
    role: 'Chồng của Mai / Kỹ sư điện',
    avatarUrl: DEFAULT_AVATAR_PLACEHOLDER,
    slotIndex: 0,
  },
  {
    id: 'tung',
    canonicalName: 'Nguyễn Thanh Tùng',
    aliases: ['nguyễn thanh tùng', 'nguyen thanh tung', 'tùng', 'tung', 'thanh tùng', 'thanh tung'],
    role: 'Thợ nề tự do / Bạn thời thơ ấu',
    avatarUrl: DEFAULT_AVATAR_PLACEHOLDER,
    slotIndex: 1,
  },
  {
    id: 'ha',
    canonicalName: 'Trần Thị Hà',
    aliases: ['trần thị hà', 'tran thi ha', 'hà', 'ha', 'thị hà', 'thi ha'],
    role: 'Kế toán / Bạn gái Khang (Hung thủ)',
    avatarUrl: DEFAULT_AVATAR_PLACEHOLDER,
    slotIndex: 2,
  },
]

export function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

export function findValidCaseCharacter(
  input: string,
  extraCharacters?: SuspectCharacter[]
): SuspectCharacter | null {
  const raw = (input || '').trim().toLowerCase()
  if (!raw) return null
  if (isAdminBypassCode(raw)) {
    return VALID_CASE_CHARACTERS[0]
  }
  const cleanRaw = removeDiacritics(raw)
  const rawWords = cleanRaw.split(/\s+/).filter(Boolean)
  const pool = Array.isArray(extraCharacters) && extraCharacters.length > 0
    ? [...VALID_CASE_CHARACTERS, ...extraCharacters]
    : VALID_CASE_CHARACTERS

  // 1. Exact match on id, canonicalName, or any alias (with/without diacritics)
  for (const c of pool) {
    if (c.id === raw || c.id === cleanRaw) return c
    if (c.canonicalName.toLowerCase() === raw || removeDiacritics(c.canonicalName) === cleanRaw) return c
    if (c.aliases?.some((a) => a === raw || removeDiacritics(a) === cleanRaw)) return c
  }

  // 2. Word boundary / exact token match for aliases
  for (const c of pool) {
    if (!c.aliases) continue
    for (const alias of c.aliases) {
      const cleanAlias = removeDiacritics(alias)
      const aliasWords = cleanAlias.split(/\s+/).filter(Boolean)
      if (aliasWords.length === 1) {
        if (rawWords.includes(aliasWords[0])) {
          return c
        }
      } else {
        if (cleanRaw.includes(cleanAlias)) {
          return c
        }
      }
    }
  }

  return null
}

export function getCanonicalSuspectKey(suspect: { id?: string; name: string }) {
  // 1. Exact ID match first (handling prefixes like node-suspect- or suspect-)
  const rawId = (suspect.id || '').toLowerCase()
  const cleanId = rawId.replace(/^(node-)?suspect-/, '')
  const exactIdChar = VALID_CASE_CHARACTERS.find((c) => c.id === cleanId)
  if (exactIdChar) {
    return {
      canonicalId: exactIdChar.id,
      slotIndex: exactIdChar.slotIndex,
      canonicalName: exactIdChar.canonicalName,
      photoUrl: exactIdChar.avatarUrl,
    }
  }

  // 2. Strict character matching by name or id
  const char = findValidCaseCharacter(suspect.name || '') || findValidCaseCharacter(suspect.id || '')
  if (char) {
    return {
      canonicalId: char.id,
      slotIndex: char.slotIndex,
      canonicalName: char.canonicalName,
      photoUrl: char.avatarUrl,
    }
  }

  const lower = (suspect.name || '').trim().toLowerCase()
  return {
    canonicalId: suspect.id || `suspect-${lower.replace(/\s+/g, '-')}`,
    slotIndex: 4,
    canonicalName: suspect.name,
    photoUrl: undefined,
  }
}
