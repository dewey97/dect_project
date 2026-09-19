import {
  isAdminBypassCode,
  hasAdminBypassInArray,
  ADMIN_MASTER_EVIDENCE,
  ADMIN_MASTER_EVIDENCE_ID,
} from './admin-bypass'

export {
  isAdminBypassCode,
  hasAdminBypassInArray,
  ADMIN_MASTER_EVIDENCE,
  ADMIN_MASTER_EVIDENCE_ID,
}

export const PHONE_LOOKUP_EVIDENCE_IDS = [
  'sms_phone_0988200991',
  'sms_phone_0912331888',
  'sms_phone_0984180357',
]

/**
 * Checks if a clue identifier matches any of the allowed target codes/numbers.
 * Normalizes integers ('8' === '08' === 'doc_08') and phone digits ('0988.200.991' === 'sms_phone_0988200991').
 */
export function isEvidenceMatching(clueId: string, targetCodes: string[]): boolean {
  if (!clueId) return false
  if (isAdminBypassCode(clueId)) return true

  const cleanClue = clueId
    .toLowerCase()
    .replace(/^(doc_|custom_code_|ev_)/i, '')
    .replace(/^#/, '')
    .trim()

  const clueDigits = clueId.replace(/\D/g, '')
  const clueNum = parseInt(cleanClue, 10)
  const isClueNumeric = !isNaN(clueNum) && cleanClue === String(clueNum).padStart(cleanClue.length, '0')

  return targetCodes.some((target) => {
    if (isAdminBypassCode(target)) return true

    const cleanTarget = target
      .toLowerCase()
      .replace(/^(doc_|custom_code_|ev_)/i, '')
      .replace(/^#/, '')
      .trim()

    // 1. Exact string match (e.g. "45" === "45" or "07b" === "07b")
    if (cleanClue === cleanTarget) return true

    // 2. Numeric match (e.g. "8" === "08")
    if (isClueNumeric) {
      const targetNum = parseInt(cleanTarget, 10)
      if (!isNaN(targetNum) && clueNum === targetNum) return true
    }

    // 3. Exact phone digits match (e.g. "0988200991" === "0988200991")
    const targetDigits = target.replace(/\D/g, '')
    if (targetDigits.length >= 9 && clueDigits === targetDigits) {
      if (target.toLowerCase().includes('voice') || target.toLowerCase().includes('thoai')) {
        return clueId.toLowerCase().includes('voice')
      }
      return true
    }

    return false
  })
}

/**
 * Validates motive evidence selection based on the master answer table.
 */
export function checkMotiveValid(characterId: string, selectedIds: string[]): boolean {
  if (!characterId || selectedIds.length === 0) return false
  if (hasAdminBypassInArray(selectedIds)) return true

  if (characterId === 'vu') {
    // Vũ: 13 (Sổ ghi nợ) hoặc SĐT 0988.200.991 (Optional: 10)
    const validCodes = ['13', '10', '0988.200.991', '0988200991', 'sms_phone_0988200991']
    return selectedIds.some((id) => isEvidenceMatching(id, validCodes))
  }

  if (characterId === 'tung') {
    // Tùng: 18, 40 hoặc SĐT 0912.331.888
    const validCodes = ['18', '40', '0912.331.888', '0912331888', 'sms_phone_0912331888']
    return selectedIds.some((id) => isEvidenceMatching(id, validCodes))
  }

  if (characterId === 'ha') {
    // Hà: SĐT 0978.552.109 (Optional: 0984.112.568, 53, 48)
    const validCodes = [
      '0978.552.109',
      '0978552109',
      'sms_phone_0978552109',
      '0984.112.568',
      '0984112568',
      'sms_phone_0984112568',
      '53',
      '48',
    ]
    return selectedIds.some((id) => isEvidenceMatching(id, validCodes))
  }

  return false
}

/**
 * Validates alibi evidence selection based on the master answer table.
 */
export function checkAlibiValid(characterId: string, selectedIds: string[]): boolean {
  if (!characterId || selectedIds.length === 0) return false
  if (hasAdminBypassInArray(selectedIds)) return true

  if (characterId === 'vu') {
    // Vũ: 10, 42 (Optional: 6, 8)
    const validCodes = ['10', '42', '6', '8']
    return selectedIds.some((id) => isEvidenceMatching(id, validCodes))
  }

  if (characterId === 'tung') {
    // Tùng: 20, 41
    const validCodes = ['20', '41']
    return selectedIds.some((id) => isEvidenceMatching(id, validCodes))
  }

  if (characterId === 'ha') {
    // Hà: Tin nhắn thoại 0984.112.568, 12, 44 (Optional: 9, 7, 45)
    const validCodes = [
      'voice_phone_0984112568',
      '0984.112.568',
      '0984112568',
      '12',
      '44',
      '9',
      '7',
      '45',
    ]
    return selectedIds.some((id) => isEvidenceMatching(id, validCodes))
  }

  return false
}

/**
 * Resolves user text input into a structured evidence object.
 * Retains exact document numbers/codes without rewriting or mutating them.
 */
export function resolveEvidenceCode(rawInput: string): { id: string; label: string; code: string } | null {
  const trimmed = rawInput.trim()
  if (!trimmed) return null

  if (isAdminBypassCode(trimmed)) {
    return ADMIN_MASTER_EVIDENCE
  }

  // 1. Phone number (Text SMS)
  const digitsOnly = trimmed.replace(/\D/g, '')
  if (trimmed.startsWith('0') && digitsOnly.length >= 9) {
    const formatted = digitsOnly.length === 10
      ? `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 7)}.${digitsOnly.slice(7)}`
      : trimmed
    return {
      id: `sms_phone_${digitsOnly}`,
      label: `Tin nhắn văn bản với SĐT: ${formatted}`,
      code: formatted,
    }
  }

  // 2. Voice message with phone number
  if (trimmed.toLowerCase().startsWith('voice:') || trimmed.toLowerCase().startsWith('thoai:')) {
    const num = trimmed.replace(/^(voice|thoai):/i, '').trim()
    const digits = num.replace(/\D/g, '')
    const formatted = digits.length === 10
      ? `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}`
      : num
    return {
      id: `voice_phone_${digits}`,
      label: `Tin nhắn thoại với SĐT: ${formatted}`,
      code: formatted,
    }
  }

  // 3. Document or Code
  const normalized = trimmed
    .replace(/^#/, '')
    .replace(/^doc_/i, '')
    .replace(/^mã\s*/i, '')
    .replace(/^ma\s*/i, '')
    .trim()

  if (!normalized) return null

  return {
    id: normalized,
    label: `Tài liệu #${normalized}`,
    code: normalized,
  }
}

/**
 * Returns badge rendering information for a clue id.
 */
export function getClueBadgeInfo(
  id: string,
  customPhoneList?: Array<{ id: string; label: string }>
): { code: string; label: string; displayCode: string; isPhone: boolean } {
  if (isAdminBypassCode(id)) {
    return { code: '00', label: 'Tài liệu số 00 (Admin Master Key)', displayCode: '00', isPhone: false }
  }

  if (customPhoneList) {
    const custom = customPhoneList.find((p) => p.id === id)
    if (custom) {
      const isVoice = id.startsWith('voice_phone_')
      return { code: isVoice ? 'VOICE' : 'SĐT', label: custom.label, displayCode: custom.label, isPhone: true }
    }
  }

  if (id.startsWith('sms_phone_')) {
    const raw = id.replace('sms_phone_', '')
    const formatted = raw.length === 10 ? `${raw.slice(0, 4)}.${raw.slice(4, 7)}.${raw.slice(7)}` : raw
    const label = `Tin nhắn văn bản với SĐT: ${formatted}`
    return { code: 'SĐT', label, displayCode: label, isPhone: true }
  }

  if (id.startsWith('voice_phone_')) {
    const raw = id.replace('voice_phone_', '')
    const formatted = raw.length === 10 ? `${raw.slice(0, 4)}.${raw.slice(4, 7)}.${raw.slice(7)}` : raw
    const label = `Tin nhắn thoại với SĐT: ${formatted}`
    return { code: 'VOICE', label, displayCode: label, isPhone: true }
  }

  const code = id.replace(/^(doc_|custom_code_|ev_)/i, '').replace(/^#/, '').trim()
  return { code, label: `Tài liệu #${code}`, displayCode: code, isPhone: false }
}

export function getSortedClues(
  clueIds: string[],
  customPhoneEvidences: Array<{ id: string; label: string }> = []
) {
  const docClues: Array<{ id: string; info: ReturnType<typeof getClueBadgeInfo>; sortWeight: number }> = []
  const phoneClues: Array<{ id: string; info: ReturnType<typeof getClueBadgeInfo> }> = []

  for (const id of clueIds) {
    const info = getClueBadgeInfo(id, customPhoneEvidences)
    if (info.isPhone) {
      phoneClues.push({ id, info })
    } else {
      let weight = 999
      const num = parseInt(info.code.replace(/\D/g, ''), 10)
      if (!isNaN(num)) {
        weight = num
      }
      docClues.push({ id, info, sortWeight: weight })
    }
  }

  docClues.sort((a, b) => a.sortWeight - b.sortWeight)

  return { docClues, phoneClues }
}
