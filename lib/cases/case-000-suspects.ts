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

import { isAdminBypassCode } from './admin-bypass'

export function findValidCaseCharacter(input: string): SuspectCharacter | null {
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null
  if (isAdminBypassCode(normalized)) {
    return VALID_CASE_CHARACTERS[0]
  }
  return VALID_CASE_CHARACTERS.find((c) => {
    if (c.canonicalName.toLowerCase() === normalized) return true
    if (c.aliases.includes(normalized)) return true
    return c.aliases.some(
      (alias) =>
        normalized === alias ||
        (normalized.length >= 2 && alias.includes(normalized)) ||
        (alias.length >= 3 && normalized.includes(alias))
    )
  }) || null
}

export function getCanonicalSuspectKey(suspect: { id?: string; name: string }) {
  const lower = (suspect.name || '').trim().toLowerCase()
  const idLower = (suspect.id || '').toLowerCase()

  const match = VALID_CASE_CHARACTERS.find(
    (c) => idLower.includes(c.id) || lower.includes(c.id) || c.aliases.some((alias) => lower.includes(alias))
  )

  if (match) {
    return {
      canonicalId: match.id,
      slotIndex: match.slotIndex,
      canonicalName: match.canonicalName,
      photoUrl: match.avatarUrl,
    }
  }

  return {
    canonicalId: suspect.id || `suspect-${lower.replace(/\s+/g, '-')}`,
    slotIndex: 4,
    canonicalName: suspect.name,
    photoUrl: undefined,
  }
}
