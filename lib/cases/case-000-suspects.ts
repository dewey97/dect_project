import { isAdminBypassCode } from './admin-bypass'

export interface SuspectCharacter {
  id: string
  canonicalName: string
  aliases: string[]
  role: string
  avatarUrl: string
  slotIndex: number
}

export const VALID_CASE_CHARACTERS: SuspectCharacter[] = [
  {
    id: 'vu',
    canonicalName: 'Lê Quang Vũ',
    aliases: ['lê quang vũ', 'le quang vu', 'vũ', 'vu', 'quang vũ', 'quang vu'],
    role: 'Chồng của Mai / Kỹ sư điện',
    avatarUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_vu.png',
    slotIndex: 0,
  },
  {
    id: 'tung',
    canonicalName: 'Nguyễn Thanh Tùng',
    aliases: ['nguyễn thanh tùng', 'nguyen thanh tung', 'tùng', 'tung', 'thanh tùng', 'thanh tung'],
    role: 'Thợ nề tự do / Bạn thời thơ ấu',
    avatarUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_tung.png',
    slotIndex: 1,
  },
  {
    id: 'ha',
    canonicalName: 'Trần Thị Hà',
    aliases: ['trần thị hà', 'tran thi ha', 'hà', 'ha', 'thị hà', 'thi ha'],
    role: 'Kế toán / Bạn gái Khang (Hung thủ)',
    avatarUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_ha.png',
    slotIndex: 2,
  },
  {
    id: 'mai',
    canonicalName: 'Nguyễn Ngọc Mai',
    aliases: ['nguyễn ngọc mai', 'nguyen ngoc mai', 'mai', 'ngọc mai', 'ngoc mai'],
    role: 'Em họ nạn nhân Khang',
    avatarUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_mai.png',
    slotIndex: 3,
  },
  {
    id: 'dat',
    canonicalName: 'Trần Văn Đạt',
    aliases: ['đạt', 'dat', 'đạt gà', 'dat ga', 'trần văn đạt', 'tran van dat', 'văn đạt', 'van dat', 'đạt chợ cảng', 'dat cho cang'],
    role: 'Tiểu thương Chợ Cảng / Con nợ Khang',
    avatarUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_dat_ga.png',
    slotIndex: 4,
  },
  {
    id: 'lua',
    canonicalName: 'Nguyễn Thị Lụa',
    aliases: ['nguyễn thị lụa', 'nguyen thi lua', 'bà lụa', 'ba lua', 'lụa', 'lua', 'thị lụa', 'thi lua'],
    role: 'Hàng xóm / Người phát hiện thi thể',
    avatarUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_ba_lua.png',
    slotIndex: 5,
  },
  {
    id: 'khang',
    canonicalName: 'Nguyễn Văn Khang',
    aliases: ['khang', 'nguyễn văn khang', 'nguyen van khang', 'văn khang', 'van khang'],
    role: 'Nạn nhân vụ án',
    avatarUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png',
    slotIndex: 6,
  },
  {
    id: 'vy',
    canonicalName: 'Thảo Vy',
    aliases: ['vy', 'thảo vy', 'thao vy', 'bé vy', 'be vy', 'thao vy ❤️', 'bé vy ❤️'],
    role: 'Nhân tình của Khang',
    avatarUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_vy.png',
    slotIndex: 7,
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

export function findValidCaseCharacter(input: string): SuspectCharacter | null {
  const raw = (input || '').trim().toLowerCase()
  if (!raw) return null
  if (isAdminBypassCode(raw)) {
    return VALID_CASE_CHARACTERS[0]
  }
  const cleanRaw = removeDiacritics(raw)
  const rawWords = cleanRaw.split(/\s+/).filter(Boolean)

  // 1. Exact match on id, canonicalName, or any alias (with/without diacritics)
  for (const c of VALID_CASE_CHARACTERS) {
    if (c.id === raw || c.id === cleanRaw) return c
    if (c.canonicalName.toLowerCase() === raw || removeDiacritics(c.canonicalName) === cleanRaw) return c
    if (c.aliases.some((a) => a === raw || removeDiacritics(a) === cleanRaw)) return c
  }

  // 2. Word boundary / exact token match for aliases
  for (const c of VALID_CASE_CHARACTERS) {
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
