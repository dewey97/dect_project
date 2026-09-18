export const PHONE_LOOKUP_EVIDENCE_IDS = [
  'sms_dev00',
  'doc_07b_loi_khai_vu',
  'doc_14_loi_khai_tung',
  'p6_anh_vu',
  'p10_app_xe',
  'p4_anh_1996',
  'p4_van_tay',
  'p5_manh_bao',
]

export const DOCUMENT_EVIDENCE_MAP: Record<string, { id: string; label: string; code: string }> = {
  '0': { id: 'doc_000', label: 'Tài liệu số 000 (Admin Master Key)', code: '000' },
  '00': { id: 'doc_000', label: 'Tài liệu số 000 (Admin Master Key)', code: '000' },
  '000': { id: 'doc_000', label: 'Tài liệu số 000 (Admin Master Key)', code: '000' },
  'doc_000': { id: 'doc_000', label: 'Tài liệu số 000 (Admin Master Key)', code: '000' },
  '1': { id: 'doc_01_phieu_tn', label: 'Phiếu tiếp nhận tin báo từ bà Lụa (06:45)', code: '01' },
  '01': { id: 'doc_01_phieu_tn', label: 'Phiếu tiếp nhận tin báo từ bà Lụa (06:45)', code: '01' },
  '2': { id: 'doc_02_hien_truong', label: 'Biên bản khám nghiệm hiện trường', code: '02' },
  '02': { id: 'doc_02_hien_truong', label: 'Biên bản khám nghiệm hiện trường', code: '02' },
  '3': { id: 'doc_03_so_do', label: 'Ảnh chụp hiện trường', code: '03' },
  '03': { id: 'doc_03_so_do', label: 'Ảnh chụp hiện trường', code: '03' },
  '4': { id: 'doc_04_tu_thi', label: 'Báo cáo khám nghiệm tử thi sơ bộ', code: '04' },
  '04': { id: 'doc_04_tu_thi', label: 'Báo cáo khám nghiệm tử thi sơ bộ', code: '04' },
  '5': { id: 'doc_05_kham_nghiem', label: 'Biên bản khám nghiệm hiện trường vụ án', code: '05' },
  '05': { id: 'doc_05_kham_nghiem', label: 'Biên bản khám nghiệm hiện trường vụ án', code: '05' },
  '6': { id: 'doc_06_loi_khai_lua', label: 'Biên bản lấy lời khai bà Lụa', code: '06' },
  '06': { id: 'doc_06_loi_khai_lua', label: 'Biên bản lấy lời khai bà Lụa', code: '06' },
  '7': { id: 'doc_07a_loi_khai_mai', label: 'Biên bản lấy lời khai Nguyễn Ngọc Mai', code: '07a' },
  '07': { id: 'doc_07a_loi_khai_mai', label: 'Biên bản lấy lời khai Nguyễn Ngọc Mai', code: '07a' },
  '7a': { id: 'doc_07a_loi_khai_mai', label: 'Biên bản lấy lời khai Nguyễn Ngọc Mai', code: '07a' },
  '07a': { id: 'doc_07a_loi_khai_mai', label: 'Biên bản lấy lời khai Nguyễn Ngọc Mai', code: '07a' },
  '7b': { id: 'doc_07b_loi_khai_vu', label: 'Biên bản lấy lời khai Lê Quang Vũ', code: '07b' },
  '07b': { id: 'doc_07b_loi_khai_vu', label: 'Biên bản lấy lời khai Lê Quang Vũ', code: '07b' },
  '7c': { id: 'doc_14_loi_khai_tung', label: 'Biên bản lấy lời khai Nguyễn Thanh Tùng', code: '14' },
  '07c': { id: 'doc_14_loi_khai_tung', label: 'Biên bản lấy lời khai Nguyễn Thanh Tùng', code: '14' },
  '7d': { id: 'doc_07d_loi_khai_ha', label: 'Biên bản lấy lời khai Trần Thị Hà', code: '07d' },
  '07d': { id: 'doc_07d_loi_khai_ha', label: 'Biên bản lấy lời khai Trần Thị Hà', code: '07d' },
  '8': { id: 'doc_07b_loi_khai_vu', label: 'Biên bản lấy lời khai Lê Quang Vũ', code: '07b' },
  '08': { id: 'doc_07b_loi_khai_vu', label: 'Biên bản lấy lời khai Lê Quang Vũ', code: '07b' },
  '9': { id: 'doc_07d_loi_khai_ha', label: 'Biên bản lấy lời khai Trần Thị Hà', code: '07d' },
  '09': { id: 'doc_07d_loi_khai_ha', label: 'Biên bản lấy lời khai Trần Thị Hà', code: '07d' },
  '10': { id: 'doc_10_so_no', label: 'Sổ tay ghi nợ của Khang', code: '10' },
  '11': { id: 'sms_dev00', label: 'Tin nhắn trên điện thoại Khang', code: '11' },
  '12': { id: 'p10_app_xe', label: 'Ảnh chụp màn hình ứng dụng đặt xe', code: '12' },
  '13': { id: 'doc_13_don_dat', label: 'Đơn khởi kiện tranh chấp đất đai', code: '13' },
  '14': { id: 'doc_14_loi_khai_tung', label: 'Biên bản lấy lời khai Nguyễn Thanh Tùng', code: '14' },
  '15': { id: 'p3_hung_khi', label: 'Mảnh vỡ từ ấm trà (hung khí)', code: '15' },
  '16': { id: 'p4_anh_1996', label: 'Khung ảnh vỡ', code: '16' },
  '17': { id: 'p4_van_tay', label: 'Dấu vân tay trên khung bức ảnh vỡ', code: '17' },
  '18': { id: 'p5_manh_bao', label: 'Các mảnh báo cũ', code: '18' },
  '19': { id: 'p6_anh_vu', label: 'Ảnh chân dung Lê Quang Vũ', code: '19' },
  '20': { id: 'doc_voice_coi_tau', label: 'Voice tin nhắn thoại của Hà (20:32)', code: '20' },
  '21': { id: 'doc_lich_vtv3', label: 'Lịch phát sóng VTV3 tối Thứ Sáu', code: '21' },
  '22': { id: 'ev_hair_dna', label: 'Lọn tóc mai dính máu thu tại phòng Hà', code: '22' },
  '23': { id: 'ev_ao_gio_xoan', label: 'Áo gió xám đen dính phấn hoa xoan', code: '23' },
  'p3': { id: 'p3_hung_khi', label: 'Mảnh vỡ từ ấm trà (hung khí)', code: '15' },
  'p4': { id: 'p4_van_tay', label: 'Dấu vân tay trên khung bức ảnh vỡ', code: '17' },
  'p5': { id: 'p5_manh_bao', label: 'Các mảnh báo cũ', code: '18' },
  'p6': { id: 'p6_anh_vu', label: 'Ảnh chân dung Lê Quang Vũ', code: '19' },
  'p10': { id: 'p10_app_xe', label: 'Ảnh chụp màn hình ứng dụng đặt xe', code: '12' },
  'dev00': { id: 'sms_dev00', label: 'Tin nhắn trên điện thoại Khang', code: '11' },
  'dev-00': { id: 'sms_dev00', label: 'Tin nhắn trên điện thoại Khang', code: '11' },
}

export function checkMotiveValid(characterId: string, selectedIds: string[]): boolean {
  if (!characterId || selectedIds.length === 0) return false

  const has000 =
    selectedIds.includes('doc_000') ||
    selectedIds.includes('000') ||
    selectedIds.includes('0') ||
    selectedIds.some((id) => id.includes('000') || id === 'doc_000')

  if (has000) return true

  const hasDoc1 = selectedIds.includes('doc_01_phieu_tn') || selectedIds.includes('doc_01') || selectedIds.includes('doc_1')
  const hasDoc2 = selectedIds.includes('doc_02_hien_truong') || selectedIds.includes('doc_02') || selectedIds.includes('doc_2')
  const hasDoc3 = selectedIds.includes('doc_03_so_do') || selectedIds.includes('doc_03') || selectedIds.includes('doc_3')
  const hasSms123 = selectedIds.some(
    (id) => id.startsWith('sms_phone_') && id.replace(/\D/g, '').includes('123')
  )

  if (characterId === 'vu' || characterId === 'tung' || characterId === 'ha') {
    return hasDoc1 && hasDoc2 && hasDoc3 && hasSms123
  }

  return false
}

export function checkAlibiValid(characterId: string, selectedIds: string[]): boolean {
  if (!characterId || selectedIds.length === 0) return false

  const has000 =
    selectedIds.includes('doc_000') ||
    selectedIds.includes('000') ||
    selectedIds.includes('0') ||
    selectedIds.some((id) => id.includes('000') || id === 'doc_000')

  if (has000) return true

  const hasDoc4 = selectedIds.includes('doc_04_tu_thi') || selectedIds.includes('doc_04') || selectedIds.includes('doc_4')
  const hasDoc5 = selectedIds.includes('doc_05_kham_nghiem') || selectedIds.includes('doc_05') || selectedIds.includes('doc_5')
  const hasDoc6 = selectedIds.includes('doc_06_loi_khai_lua') || selectedIds.includes('doc_06') || selectedIds.includes('doc_6')
  const hasVoice456 = selectedIds.some(
    (id) => id.startsWith('voice_phone_') && id.replace(/\D/g, '').includes('456')
  )

  if (characterId === 'vu' || characterId === 'tung' || characterId === 'ha') {
    return hasDoc4 && hasDoc5 && hasDoc6 && hasVoice456
  }

  return false
}

export function resolveEvidenceCode(rawInput: string): { id: string; label: string; code: string } | null {
  const trimmed = rawInput.trim()
  if (!trimmed) return null

  if (trimmed === '000' || trimmed === '00' || trimmed === '0' || trimmed.toLowerCase() === 'doc_000') {
    return { id: 'doc_000', label: 'Tài liệu số 000 (Admin Master Key)', code: '000' }
  }

  const digitsOnly = trimmed.replace(/\D/g, '')
  if (trimmed.startsWith('0') && digitsOnly.length >= 9) {
    const id = `sms_phone_${digitsOnly}`
    return {
      id,
      label: `Tin nhắn văn bản với SĐT: ${trimmed}`,
      code: trimmed
    }
  }

  if (trimmed.toLowerCase().startsWith('voice:') || trimmed.toLowerCase().startsWith('thoai:')) {
    const num = trimmed.replace(/^(voice|thoai):/i, '').trim()
    const digits = num.replace(/\D/g, '')
    const id = `voice_phone_${digits}`
    return {
      id,
      label: `Tin nhắn thoại với SĐT: ${num}`,
      code: num
    }
  }

  const normalized = trimmed
    .toLowerCase()
    .replace(/^doc_/, '')
    .replace(/^mã\s*/i, '')
    .replace(/^ma\s*/i, '')
    .replace(/^#/, '')
    .trim()

  if (DOCUMENT_EVIDENCE_MAP[normalized]) {
    return DOCUMENT_EVIDENCE_MAP[normalized]
  }

  const numVal = parseInt(normalized, 10)
  if (!isNaN(numVal) && numVal >= 1 && numVal <= 99) {
    const padded = numVal < 10 ? `0${numVal}` : `${numVal}`
    if (DOCUMENT_EVIDENCE_MAP[padded]) {
      return DOCUMENT_EVIDENCE_MAP[padded]
    }
    return {
      id: `doc_${padded}`,
      label: `Tài liệu số ${padded}`,
      code: padded
    }
  }

  return {
    id: `custom_code_${normalized.replace(/[^a-zA-Z0-9_]/g, '')}`,
    label: `Mã chứng cứ #${trimmed}`,
    code: trimmed
  }
}

export function getClueBadgeInfo(
  id: string,
  customPhoneList?: Array<{ id: string; label: string }>
): { code: string; label: string; displayCode: string; isPhone: boolean } {
  if (customPhoneList) {
    const custom = customPhoneList.find((p) => p.id === id)
    if (custom) {
      const isVoice = id.startsWith('voice_phone_')
      return { code: isVoice ? 'VOICE' : 'SĐT', label: custom.label, displayCode: custom.label, isPhone: true }
    }
  }
  if (id.startsWith('sms_phone_')) {
    const raw = id.replace('sms_phone_', '')
    let formatted = raw
    if (raw.length === 10) {
      formatted = `${raw.slice(0, 4)}.${raw.slice(4, 7)}.${raw.slice(7)}`
    }
    const label = `Tin nhắn văn bản với SĐT: ${formatted}`
    return { code: 'SĐT', label, displayCode: label, isPhone: true }
  }
  if (id.startsWith('voice_phone_')) {
    const raw = id.replace('voice_phone_', '')
    let formatted = raw
    if (raw.length === 10) {
      formatted = `${raw.slice(0, 4)}.${raw.slice(4, 7)}.${raw.slice(7)}`
    }
    const label = `Tin nhắn thoại với SĐT: ${formatted}`
    return { code: 'VOICE', label, displayCode: label, isPhone: true }
  }

  if (id === 'doc_01_phieu_tn') return { code: '01', label: 'Phiếu tiếp nhận tin báo', displayCode: '01', isPhone: false }
  if (id === 'doc_02_hien_truong') return { code: '02', label: 'Biên bản khám nghiệm hiện trường', displayCode: '02', isPhone: false }
  if (id === 'doc_03_so_do') return { code: '03', label: 'Ảnh chụp hiện trường', displayCode: '03', isPhone: false }
  if (id === 'doc_04_tu_thi') return { code: '04', label: 'Khám nghiệm tử thi', displayCode: '04', isPhone: false }
  if (id === 'doc_05_kham_nghiem') return { code: '05', label: 'Biên bản khám nghiệm', displayCode: '05', isPhone: false }
  if (id === 'doc_06_loi_khai_lua') return { code: '06', label: 'Lời khai bà Lụa', displayCode: '06', isPhone: false }
  if (id === 'doc_07a_loi_khai_mai') return { code: '07a', label: 'Lời khai Mai', displayCode: '07a', isPhone: false }
  if (id === 'doc_07b_loi_khai_vu') return { code: '07b', label: 'Lời khai Vũ', displayCode: '07b', isPhone: false }
  if (id === 'doc_07d_loi_khai_ha') return { code: '07d', label: 'Lời khai Hà', displayCode: '07d', isPhone: false }
  if (id === 'doc_10_so_no') return { code: '10', label: 'Sổ ghi nợ', displayCode: '10', isPhone: false }
  if (id === 'sms_dev00') return { code: '11', label: 'Tin nhắn trên máy Khang', displayCode: '11', isPhone: false }
  if (id === 'p10_app_xe') return { code: '12', label: 'Ảnh chụp màn hình ứng dụng đặt xe', displayCode: '12', isPhone: false }
  if (id === 'doc_13_don_dat') return { code: '13', label: 'Đơn đòi đất', displayCode: '13', isPhone: false }
  if (id === 'doc_14_loi_khai_tung') return { code: '14', label: 'Lời khai Tùng', displayCode: '14', isPhone: false }
  if (id === 'p3_hung_khi') return { code: '15', label: 'Mảnh vỡ ấm trà', displayCode: '15', isPhone: false }
  if (id === 'p4_anh_1996') return { code: '16', label: 'Khung ảnh vỡ 1996', displayCode: '16', isPhone: false }
  if (id === 'p4_van_tay') return { code: '17', label: 'Dấu vân tay trên khung ảnh', displayCode: '17', isPhone: false }
  if (id === 'p5_manh_bao') return { code: '18', label: 'Các mảnh báo cũ', displayCode: '18', isPhone: false }
  if (id === 'p6_anh_vu') return { code: '19', label: 'Ảnh chân dung Lê Quang Vũ', displayCode: '19', isPhone: false }
  if (id === 'doc_voice_coi_tau') return { code: '20', label: 'Voice tin nhắn thoại của Hà', displayCode: '20', isPhone: false }
  if (id === 'doc_lich_vtv3') return { code: '21', label: 'Lịch phát sóng VTV3', displayCode: '21', isPhone: false }
  if (id === 'ev_hair_dna') return { code: '22', label: 'Lọn tóc mai dính máu', displayCode: '22', isPhone: false }
  if (id === 'ev_ao_gio_xoan') return { code: '23', label: 'Áo gió xám đen dính phấn hoa', displayCode: '23', isPhone: false }
  if (id === 'doc_000') return { code: '000', label: 'Tài liệu số 000 (Admin)', displayCode: '000', isPhone: false }

  const resolved = resolveEvidenceCode(id)
  if (resolved) {
    return { code: resolved.code, label: resolved.label, displayCode: resolved.code, isPhone: false }
  }

  return { code: id, label: id, displayCode: id, isPhone: false }
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
