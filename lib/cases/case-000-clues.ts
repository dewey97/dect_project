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

export const KNOWN_CASE_PHONES: Record<string, { full: string; formatted: string; name: string }> = {
  '991': { full: '0988200991', formatted: '0988.200.991', name: 'Lê Quang Vũ' },
  '888': { full: '0912331888', formatted: '0912.331.888', name: 'Nguyễn Thanh Tùng' },
  '109': { full: '0978552109', formatted: '0978.552.109', name: 'Trần Thị Hà' },
  '568': { full: '0984112568', formatted: '0984.112.568', name: 'Trần Thị Hà' },
  '357': { full: '0984180357', formatted: '0984.180.357', name: 'Trần Văn Đạt' },
}

/**
 * Checks if a clue identifier matches any of the allowed target codes/numbers.
 * Normalizes document codes ('A-12' === 'a12' === 'A12' === '12')
 * Normalizes phone numbers by full digits or last 3 digits ('991' === '0988.200.991').
 */
export function isEvidenceMatching(clueId: string, targetCodes: string[]): boolean {
  if (!clueId) return false
  if (isAdminBypassCode(clueId)) return true

  const cleanClue = clueId
    .toLowerCase()
    .replace(/^(doc_|custom_code_|ev_)/i, '')
    .replace(/^[#]/, '')
    .trim()

  const clueDigits = clueId.replace(/\D/g, '')
  const clueIsVoice = /voice|thoại/i.test(clueId)
  const clueIsPhone =
    /phone|sdt|sms|voice/i.test(clueId) ||
    clueDigits.length >= 9 ||
    (clueDigits.length >= 3 && KNOWN_CASE_PHONES[clueDigits.slice(-3)] !== undefined)

  const normClueCode = cleanClue.replace(/[-_.\s]/g, '')
  const normClueAlphanum = normClueCode.replace(/^([a-z])0+(\d+)$/, '$1$2')

  const clueNum = parseInt(cleanClue, 10)
  const isClueNumeric = !isNaN(clueNum) && cleanClue === String(clueNum).padStart(cleanClue.length, '0')

  return targetCodes.some((target) => {
    if (!target) return false
    if (isAdminBypassCode(target)) return true

    const cleanTarget = target
      .toLowerCase()
      .replace(/^(doc_|custom_code_|ev_)/i, '')
      .replace(/^[#]/, '')
      .trim()

    // 1. Direct string match
    if (cleanClue === cleanTarget) return true

    const normTargetCode = cleanTarget.replace(/[-_.\s]/g, '')
    const normTargetAlphanum = normTargetCode.replace(/^([a-z])0+(\d+)$/, '$1$2')

    // 2. Alphanumeric match (A-12 === a12, A-09 === a9 === a-9)
    if (normClueCode === normTargetCode || normClueAlphanum === normTargetAlphanum) return true

    // 3. Numeric match for integer equivalents
    if (isClueNumeric) {
      const targetNum = parseInt(cleanTarget, 10)
      if (!isNaN(targetNum) && clueNum === targetNum) return true
      const targetDigitsOnly = cleanTarget.replace(/\D/g, '')
      if (targetDigitsOnly && parseInt(targetDigitsOnly, 10) === clueNum) return true
    } else {
      const clueDigitsOnly = cleanClue.replace(/\D/g, '')
      if (clueDigitsOnly && cleanTarget === clueDigitsOnly) return true
    }

    // 4. PHONE NUMBER MATCHING (supports scanning 3 last digits or full phone number)
    const targetDigits = target.replace(/\D/g, '')
    const targetIsVoice = /voice|thoại/i.test(target)
    const targetIsPhone =
      /phone|sdt|sms|voice/i.test(target) ||
      targetDigits.length >= 9 ||
      (targetDigits.length >= 3 && KNOWN_CASE_PHONES[targetDigits.slice(-3)] !== undefined)

    if (clueIsPhone || targetIsPhone || (clueDigits.length >= 3 && targetDigits.length >= 3)) {
      if (clueDigits.length >= 3 && targetDigits.length >= 3) {
        // Voice vs SMS distinction
        if (targetIsVoice && !clueIsVoice) return false
        if (!targetIsVoice && clueIsVoice && /sms|tin\s*nhắn/i.test(target)) return false

        // Match on the last 3 digits
        if (clueDigits.slice(-3) === targetDigits.slice(-3)) {
          return true
        }
      }
    }

    return false
  })
}

/**
 * Validates motive evidence selection strictly against target codes from Google Sheets Live CMS (answers_id).
 * Zero static hardcoded fallback - 100% Google Sheets CMS driven.
 */
export function checkMotiveValid(targetCodes: string[], selectedIds: string[]): boolean {
  if (!targetCodes || targetCodes.length === 0 || !selectedIds || selectedIds.length === 0) return false
  if (hasAdminBypassInArray(selectedIds)) return true

  // Nếu GM khai báo nhiều lựa chọn SĐT cùng loại trong mục động cơ (ví dụ 2 SĐT SMS), chỉ cần trúng 1 trong các số
  const isAllPhoneSms = targetCodes.every((t) => /phone|sdt|sms|09/i.test(t))
  if (isAllPhoneSms && targetCodes.length > 1) {
    return targetCodes.some((target) =>
      selectedIds.some((c) => isEvidenceMatching(c, [target]))
    )
  }

  return targetCodes.every((target) =>
    selectedIds.some((c) => isEvidenceMatching(c, [target]))
  )
}

/**
 * Validates alibi evidence selection strictly against target codes from Google Sheets Live CMS (answers_id).
 * Zero static hardcoded fallback - 100% Google Sheets CMS driven.
 */
export function checkAlibiValid(targetCodes: string[], selectedIds: string[]): boolean {
  if (!targetCodes || targetCodes.length === 0 || !selectedIds || selectedIds.length === 0) return false
  if (hasAdminBypassInArray(selectedIds)) return true

  return targetCodes.every((target) =>
    selectedIds.some((c) => isEvidenceMatching(c, [target]))
  )
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

  // 1b. 3 last digits of phone number
  if (digitsOnly.length === 3 && KNOWN_CASE_PHONES[digitsOnly]) {
    const known = KNOWN_CASE_PHONES[digitsOnly]
    return {
      id: `sms_phone_${known.full}`,
      label: `Tin nhắn văn bản với SĐT: ${known.formatted}`,
      code: known.formatted,
    }
  }

  // 2. Voice message with phone number (chuẩn voice_)
  if (
    trimmed.toLowerCase().startsWith('voice_') ||
    trimmed.toLowerCase().startsWith('voice:')
  ) {
    const num = trimmed.replace(/^voice[_:]/i, '').trim()
    const digits = num.replace(/\D/g, '')
    const known = KNOWN_CASE_PHONES[digits.slice(-3)]
    const formatted = known
      ? known.formatted
      : digits.length === 10
      ? `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}`
      : num
    const finalDigits = known ? known.full : digits
    return {
      id: `voice_phone_${finalDigits}`,
      label: `Tin nhắn thoại với SĐT: ${formatted}`,
      code: `voice_${formatted}`,
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

  // Format code nicely (e.g. a-12 -> A-12)
  const formattedCode = /^[a-z]-?\d+/i.test(normalized)
    ? normalized.toUpperCase()
    : normalized

  return {
    id: formattedCode,
    label: `Tài liệu #${formattedCode}`,
    code: formattedCode,
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
    const known = KNOWN_CASE_PHONES[raw.slice(-3)]
    const formatted = known
      ? known.formatted
      : raw.length === 10
      ? `${raw.slice(0, 4)}.${raw.slice(4, 7)}.${raw.slice(7)}`
      : raw
    const label = `Tin nhắn văn bản với SĐT: ${formatted}`
    return { code: 'SĐT', label, displayCode: label, isPhone: true }
  }

  if (id.startsWith('voice_phone_')) {
    const raw = id.replace('voice_phone_', '')
    const known = KNOWN_CASE_PHONES[raw.slice(-3)]
    const formatted = known
      ? known.formatted
      : raw.length === 10
      ? `${raw.slice(0, 4)}.${raw.slice(4, 7)}.${raw.slice(7)}`
      : raw
    const label = `Tin nhắn thoại với SĐT: ${formatted}`
    return { code: 'VOICE', label, displayCode: label, isPhone: true }
  }

  const rawCode = id.replace(/^(doc_|custom_code_|ev_)/i, '').replace(/^#/, '').trim()
  const code = /^[a-z]-?\d+/i.test(rawCode) ? rawCode.toUpperCase() : rawCode
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
