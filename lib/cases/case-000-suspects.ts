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
    role: 'Kế toán / Bạn gái Khang',
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

/**
 * Tự động tạo danh sách SuspectCharacter từ các hàng avatar trong Google Sheet ('evidences' tab).
 * Tự động phân tách tên, sinh bí danh (aliases) không dấu, tên riêng rút gọn để nhận diện linh hoạt.
 */
export function buildDynamicSuspectCharacters(sheetEvidences?: any[]): SuspectCharacter[] {
  if (!Array.isArray(sheetEvidences) || sheetEvidences.length === 0) return []

  const result: SuspectCharacter[] = []
  sheetEvidences
    .filter((e) => {
      const cat = String(e.category || '').toUpperCase().trim()
      const code = String(e.code || '').toLowerCase().trim()
      return cat === 'AVATAR' || code.startsWith('avatar_')
    })
    .forEach((item, idx) => {
      const code = String(item.code || '').toLowerCase().trim()
      const id = code.replace(/^avatar_/, '') || `suspect_${idx}`
      if (id === 'khang') return // Bỏ qua nạn nhân

      const rawLabel = String(item.label || item.title || '').trim()
      const cleanName = rawLabel
        .replace(/^(Ảnh chân dung|Ảnh thẻ|Ảnh|Chân dung|Nạn nhân|Nghi phạm|Nhân chứng)\s+/i, '')
        .replace(/\s*\([^)]*\)/g, '')
        .trim() || id

      const noAccents = removeDiacritics(cleanName)
      const words = cleanName.split(/\s+/).filter(Boolean)
      const wordsNoAccents = noAccents.split(/\s+/).filter(Boolean)

      const aliases = new Set<string>()
      aliases.add(cleanName.toLowerCase())
      aliases.add(noAccents)
      aliases.add(id)

      if (words.length > 1) {
        // Tên gọi ngắn gọn (từ cuối cùng: "Vũ", "Tùng", "Hà", "Đạt", "Mai")
        const lastName = words[words.length - 1].toLowerCase()
        const lastNameNoAccents = wordsNoAccents[wordsNoAccents.length - 1]
        aliases.add(lastName)
        aliases.add(lastNameNoAccents)

        // 2 từ cuối (ví dụ "Quang Vũ", "Thanh Tùng", "Thị Hà", "Ngọc Mai")
        if (words.length >= 2) {
          const lastTwo = `${words[words.length - 2]} ${words[words.length - 1]}`.toLowerCase()
          aliases.add(lastTwo)
          aliases.add(removeDiacritics(lastTwo))
        }
      }

      result.push({
        id,
        canonicalName: cleanName,
        aliases: Array.from(aliases),
        role: item.description || 'Đối tượng liên quan vụ án',
        avatarUrl: item.drive_url || item.direct_cdn_url || item.url || DEFAULT_AVATAR_PLACEHOLDER,
        slotIndex: idx < 3 ? idx : 3 + (idx % 5),
      })
    })

  return result
}

export function getCanonicalSuspectKey(
  suspect: { id?: string; name: string },
  extraCharacters?: SuspectCharacter[]
) {
  const pool = Array.isArray(extraCharacters) && extraCharacters.length > 0
    ? [...VALID_CASE_CHARACTERS, ...extraCharacters]
    : VALID_CASE_CHARACTERS

  // 1. Exact ID match first (handling prefixes like node-suspect- or suspect-)
  const rawId = (suspect.id || '').toLowerCase()
  const cleanId = rawId.replace(/^(node-)?suspect-/, '')
  const exactIdChar = pool.find((c) => c.id === cleanId)
  if (exactIdChar) {
    return {
      canonicalId: exactIdChar.id,
      slotIndex: exactIdChar.slotIndex,
      canonicalName: exactIdChar.canonicalName,
      photoUrl: exactIdChar.avatarUrl,
    }
  }

  // 2. Strict character matching by name or id
  const char =
    findValidCaseCharacter(suspect.name || '', extraCharacters) ||
    findValidCaseCharacter(suspect.id || '', extraCharacters)
  if (char) {
    return {
      canonicalId: char.id,
      slotIndex: char.slotIndex,
      canonicalName: char.canonicalName,
      photoUrl: char.avatarUrl,
    }
  }

  const lower = (suspect.name || '').trim().toLowerCase()
  const fallbackId = cleanId || lower.replace(/[^a-z0-9_-]/g, '') || 'suspect'
  return {
    canonicalId: fallbackId,
    slotIndex: 4,
    canonicalName: suspect.name,
    photoUrl: undefined,
  }
}

