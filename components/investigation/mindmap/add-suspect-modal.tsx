'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Trash2, Check, Save, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { checkpoints000 } from '@/content/cases/case-000/checkpoints'

interface SuspectItemData {
  id: string
  name: string
  clueIds: string[]
  motiveClueIds?: string[]
  alibiClueIds?: string[]
}

interface AddSuspectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (suspect: SuspectItemData) => void
  onDelete?: (id: string) => void
  editingSuspect?: SuspectItemData | null
  existingSuspects?: SuspectItemData[]
  onSelectSuspect?: (suspect: SuspectItemData | null) => void
  onSubmitConclusion?: (culprit: 'vu' | 'tung' | 'ha') => void
  isPhoneSolved?: boolean
}

interface EvaluationModalState {
  isOpen: boolean
  isSuccess: boolean
  title: string
  heading: string
  message: string
  subMessage?: string
  suspectName: string
  selectedCount: number
}

// Lấy danh sách chứng cứ chuẩn từ checkpoints000 (ưu tiên cp-000-1a hoặc cp-000-2a)
const AVAILABLE_EVIDENCES =
  checkpoints000.find((cp) => cp.id === 'cp-000-1a')?.pickerConfig?.availableEvidences ||
  checkpoints000.find((cp) => cp.id === 'cp-000-2a')?.pickerConfig?.availableEvidences ||
  []

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

// Danh sách nhân vật hợp lệ trong hồ sơ Vụ án #000
export const VALID_CASE_CHARACTERS = [
  {
    id: 'vu',
    canonicalName: 'Lê Quang Vũ',
    aliases: ['lê quang vũ', 'le quang vu', 'vũ', 'vu', 'quang vũ', 'quang vu'],
    role: 'Chồng của Mai / Kỹ sư điện',
  },
  {
    id: 'tung',
    canonicalName: 'Nguyễn Thanh Tùng',
    aliases: ['nguyễn thanh tùng', 'nguyen thanh tung', 'tùng', 'tung', 'thanh tùng', 'thanh tung'],
    role: 'Thợ nề tự do / Bạn thời thơ ấu',
  },
  {
    id: 'ha',
    canonicalName: 'Trần Thị Hà',
    aliases: ['trần thị hà', 'tran thi ha', 'hà', 'ha', 'thị hà', 'thi ha'],
    role: 'Kế toán / Bạn gái Khang (Hung thủ)',
  },
  {
    id: 'mai',
    canonicalName: 'Nguyễn Ngọc Mai',
    aliases: ['nguyễn ngọc mai', 'nguyen ngoc mai', 'mai', 'ngọc mai', 'ngoc mai'],
    role: 'Em họ nạn nhân Khang',
  },
  {
    id: 'dat',
    canonicalName: 'Trần Văn Đạt',
    aliases: ['đạt', 'dat', 'đạt gà', 'dat ga', 'trần văn đạt', 'tran van dat', 'văn đạt', 'van dat', 'đạt chợ cảng', 'dat cho cang'],
    role: 'Tiểu thương Chợ Cảng / Con nợ Khang',
  },
  {
    id: 'lua',
    canonicalName: 'Nguyễn Thị Lụa',
    aliases: ['nguyễn thị lụa', 'nguyen thi lua', 'bà lụa', 'ba lua', 'lụa', 'lua', 'thị lụa', 'thi lua'],
    role: 'Hàng xóm / Người phát hiện thi thể',
  },
  {
    id: 'khang',
    canonicalName: 'Nguyễn Văn Khang',
    aliases: ['khang', 'nguyễn văn khang', 'nguyen van khang', 'văn khang', 'van khang'],
    role: 'Nạn nhân vụ án',
  },
]

export function findValidCaseCharacter(input: string) {
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null
  return VALID_CASE_CHARACTERS.find((c) => {
    if (c.canonicalName.toLowerCase() === normalized) return true
    if (c.aliases.includes(normalized)) return true
    // Match partial alias or keyword (e.g. typing "đạt", "vũ", "tùng", "hà", "mai", "lụa")
    return c.aliases.some((alias) => normalized === alias || (normalized.length >= 2 && alias.includes(normalized)) || (alias.length >= 3 && normalized.includes(alias)))
  })
}

export function checkMotiveValid(characterId: string, selectedIds: string[]): boolean {
  if (!characterId || selectedIds.length === 0) return false

  if (characterId === 'vu') {
    // Vũ: Sổ tay ghi nợ (doc_10_so_no) và Tin nhắn trên điện thoại Khang (sms_dev00)
    const hasSoNo = selectedIds.includes('doc_10_so_no')
    const hasSms = selectedIds.includes('sms_dev00')
    return hasSoNo && hasSms
  }

  if (characterId === 'tung') {
    // Tùng: Các mảnh báo cũ (p5_manh_bao) và Khung ảnh vỡ (p4_anh_1996)
    const hasManhBao = selectedIds.includes('p5_manh_bao')
    const hasAnh1996 = selectedIds.includes('p4_anh_1996')
    return hasManhBao && hasAnh1996
  }

  if (characterId === 'ha') {
    // Hà: Tin nhắn điện thoại (sms_dev00) hoặc sổ nợ (doc_10_so_no)
    const hasSms = selectedIds.includes('sms_dev00') || selectedIds.includes('doc_10_so_no')
    return hasSms
  }

  return false
}

export function checkAlibiValid(characterId: string, selectedIds: string[]): boolean {
  if (!characterId || selectedIds.length === 0) return false

  if (characterId === 'vu') {
    // Vũ: App đặt xe (p10_app_xe), Lời khai Lụa (doc_06_loi_khai_lua), Lời khai Vũ (doc_07b_loi_khai_vu)
    // Optional: Lời khai Mai (doc_07a_loi_khai_mai) - chọn hay không đều đúng
    const hasApp = selectedIds.includes('p10_app_xe')
    const hasLua = selectedIds.includes('doc_06_loi_khai_lua')
    const hasVu = selectedIds.includes('doc_07b_loi_khai_vu')
    return hasApp && hasLua && hasVu
  }

  if (characterId === 'tung') {
    // Tùng: Dấu vân tay (p4_van_tay), Lời khai Tùng (doc_14_loi_khai_tung)
    const hasVanTay = selectedIds.includes('p4_van_tay')
    const hasTung = selectedIds.includes('doc_14_loi_khai_tung')
    return hasVanTay && hasTung
  }

  if (characterId === 'ha') {
    // Hà: Lời khai Hà (doc_07d_loi_khai_ha) và (Voice còi tàu / Lịch VTV3 / Tin nhắn)
    // Optional: Lời khai Vũ (doc_07b_loi_khai_vu), Lời khai Lụa (doc_06_loi_khai_lua)
    const hasHa = selectedIds.includes('doc_07d_loi_khai_ha')
    const hasVoiceOrVtv3 =
      selectedIds.includes('doc_voice_coi_tau') ||
      selectedIds.includes('doc_lich_vtv3') ||
      selectedIds.includes('sms_dev00') ||
      selectedIds.includes('p10_app_xe')
    return hasHa && hasVoiceOrVtv3
  }

  return false
}

export function AddSuspectModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingSuspect,
  existingSuspects = [],
  onSelectSuspect,
  onSubmitConclusion,
  isPhoneSolved = false
}: AddSuspectModalProps) {
  const [name, setName] = useState(() => editingSuspect?.name || '')
  const [subTileView, setSubTileView] = useState<'overview' | 'motive' | 'alibi'>('overview')
  const [motiveClueIds, setMotiveClueIds] = useState<string[]>(() => {
    if (editingSuspect?.motiveClueIds) return editingSuspect.motiveClueIds
    return []
  })
  const [alibiClueIds, setAlibiClueIds] = useState<string[]>(() => {
    if (editingSuspect?.alibiClueIds) return editingSuspect.alibiClueIds
    return []
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [evalModal, setEvalModal] = useState<EvaluationModalState | null>(null)

  const hasPhoneSolvedState = isPhoneSolved || (typeof window !== 'undefined' && localStorage.getItem('veritas_phone_solved') === 'true')

  const filteredEvidences = AVAILABLE_EVIDENCES.filter((ev) => {
    if (PHONE_LOOKUP_EVIDENCE_IDS.includes(ev.id)) {
      const isAlreadySelected = motiveClueIds.includes(ev.id) || alibiClueIds.includes(ev.id)
      return hasPhoneSolvedState || isAlreadySelected
    }
    return true
  })

  useEffect(() => {
    if (editingSuspect) {
      setName(editingSuspect.name)
      if (editingSuspect.motiveClueIds || editingSuspect.alibiClueIds) {
        setMotiveClueIds(editingSuspect.motiveClueIds || [])
        setAlibiClueIds(editingSuspect.alibiClueIds || [])
      }
    } else {
      setName('')
      setMotiveClueIds([])
      setAlibiClueIds([])
    }
    setSubTileView('overview')
    setErrorMsg('')
    setFeedbackMsg(null)
    setEvalModal(null)
  }, [editingSuspect, isOpen])

  if (!isOpen) return null

  // XÁC NHẬN MANH MỐI ĐỘNG CƠ (HIỂN THỊ MODAL PHẢN HỒI ĐÚNG / SAI)
  const handleConfirmMotiveClues = () => {
    const suspectDisplayName = name.trim() || 'Đối tượng tình nghi'
    const matched = findValidCaseCharacter(name)
    const isCore = matched?.id === 'vu' || matched?.id === 'tung' || matched?.id === 'ha'
    const isValid = matched ? checkMotiveValid(matched.id, motiveClueIds) : false

    if (!isCore || !isValid) {
      detectiveAudio.playGlassSound()
      setEvalModal({
        isOpen: true,
        isSuccess: false,
        title: 'THÔNG BÁO',
        heading: '',
        message: 'Bằng chứng chứng minh đối tượng có động cơ chưa chính xác.',
        subMessage: 'Kiểm tra lại bằng chứng hoặc đối tượng đang lựa chọn tình nghi',
        suspectName: suspectDisplayName,
        selectedCount: motiveClueIds.length,
      })
      return
    }

    detectiveAudio.playStampSound()
    setEvalModal({
      isOpen: true,
      isSuccess: true,
      title: 'THÔNG BÁO',
      heading: '',
      message: 'Bằng chứng lựa chọn chính xác. Căn cứ tình nghi đã được ghi nhận',
      suspectName: suspectDisplayName,
      selectedCount: motiveClueIds.length,
    })
  }

  // XÁC NHẬN MANH MỐI BÁC BỎ NGOẠI PHẠM (HIỂN THỊ MODAL PHẢN HỒI ĐÚNG / SAI)
  const handleConfirmAlibiClues = () => {
    const suspectDisplayName = name.trim() || 'Đối tượng tình nghi'
    const matched = findValidCaseCharacter(name)
    const isCore = matched?.id === 'vu' || matched?.id === 'tung' || matched?.id === 'ha'
    const isValid = matched ? checkAlibiValid(matched.id, alibiClueIds) : false

    if (!isCore || !isValid) {
      detectiveAudio.playGlassSound()
      setEvalModal({
        isOpen: true,
        isSuccess: false,
        title: 'THÔNG BÁO',
        heading: '',
        message: 'Bằng chứng chứng minh mâu thuẫn ngoại phạm chưa chính xác.',
        subMessage: 'Kiểm tra lại bằng chứng hoặc đối tượng đang lựa chọn tình nghi',
        suspectName: suspectDisplayName,
        selectedCount: alibiClueIds.length,
      })
      return
    }

    detectiveAudio.playStampSound()
    setEvalModal({
      isOpen: true,
      isSuccess: true,
      title: 'THÔNG BÁO',
      heading: '',
      message: 'Bằng chứng lựa chọn chính xác. Căn cứ tình nghi đã được ghi nhận',
      suspectName: suspectDisplayName,
      selectedCount: alibiClueIds.length,
    })
  }

  // NÚT 1: LƯU HỒ SƠ (Cho phép lưu mọi đối tượng tình nghi lên sơ đồ)
  const handleSaveProfile = () => {
    const currentName = name.trim() || editingSuspect?.name?.trim() || ''
    if (!currentName) {
      setErrorMsg('Vui lòng nhập tên đối tượng tình nghi!')
      detectiveAudio.playGlassSound()
      return
    }

    const matchedChar = findValidCaseCharacter(currentName)
    const suspectId = matchedChar?.id || editingSuspect?.id || `suspect-custom-${Date.now()}`
    const suspectName = matchedChar?.canonicalName || currentName
    const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds]))

    detectiveAudio.playStampSound()
    onSave({
      id: suspectId,
      name: suspectName,
      clueIds: combinedClues,
      motiveClueIds,
      alibiClueIds
    })
    onClose()
  }

  // NÚT 2: ĐIỀU TRA (Thẩm tra / điều tra nghi phạm Lê Quang Vũ, Nguyễn Thanh Tùng hoặc Trần Thị Hà)
  const handleSubmitConclusion = () => {
    const currentName = name.trim() || editingSuspect?.name?.trim() || ''
    if (!currentName) {
      setErrorMsg('Vui lòng nhập tên đối tượng tình nghi!')
      detectiveAudio.playGlassSound()
      return
    }

    const matchedChar = findValidCaseCharacter(currentName)
    const lower = currentName.toLowerCase()
    const isVu = matchedChar?.id === 'vu' || lower.includes('vũ') || lower.includes('vu')
    const isTung = matchedChar?.id === 'tung' || lower.includes('tùng') || lower.includes('tung')
    const isHa = matchedChar?.id === 'ha' || lower.includes('hà') || lower.includes('ha')

    if (!isVu && !isTung && !isHa) {
      setErrorMsg('Chưa đủ căn cứ pháp lý: Đối tượng này không thuộc diện điều tra trọng điểm (Vũ / Tùng / Hà)!')
      detectiveAudio.playGlassSound()
      return
    }

    const charId = (isVu ? 'vu' : isTung ? 'tung' : 'ha') as 'vu' | 'tung' | 'ha'
    const isMotiveOk = checkMotiveValid(charId, motiveClueIds)
    const isAlibiOk = checkAlibiValid(charId, alibiClueIds)

    if (!isMotiveOk || !isAlibiOk) {
      setErrorMsg('Bằng chứng động cơ hoặc mâu thuẫn ngoại phạm chưa chính xác. Vui lòng rà soát lại đúng cả 2 mục trước khi tiến hành điều tra!')
      detectiveAudio.playGlassSound()
      return
    }

    const suspectId = charId
    const suspectName = matchedChar?.canonicalName || (isVu ? 'Lê Quang Vũ' : isTung ? 'Nguyễn Thanh Tùng' : 'Trần Thị Hà')

    const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds]))

    detectiveAudio.playStampSound()
    onSave({
      id: suspectId,
      name: suspectName,
      clueIds: combinedClues,
      motiveClueIds,
      alibiClueIds
    })
    if (onSubmitConclusion) {
      onSubmitConclusion(charId)
    }
    onClose()
  }

  // TỰ ĐỘNG LƯU KHI ẤN NÚT X
  const handleAutoSaveAndClose = () => {
    if (name.trim()) {
      const matchedChar = findValidCaseCharacter(name)
      const suspectId = matchedChar?.id || editingSuspect?.id || `suspect-custom-${Date.now()}`
      const suspectName = matchedChar?.canonicalName || name.trim()
      const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds]))
      detectiveAudio.playPaperRustle()
      onSave({
        id: suspectId,
        name: suspectName,
        clueIds: combinedClues,
        motiveClueIds,
        alibiClueIds
      })
    }
    onClose()
  }

  const matchedChar = findValidCaseCharacter(name)
  const isVu = matchedChar?.id === 'vu'
  const isTung = matchedChar?.id === 'tung'
  const isHa = matchedChar?.id === 'ha'

  // Hiển thị tích xanh khi các manh mối được chọn đạt đủ điều kiện của đối tượng
  const isMotiveValid = matchedChar ? checkMotiveValid(matchedChar.id, motiveClueIds) : false
  const isAlibiValid = matchedChar ? checkAlibiValid(matchedChar.id, alibiClueIds) : false

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 rounded-none font-sans select-text max-h-[90vh] overflow-y-auto"
        >
          {/* TOP RIGHT X CLOSE WITH AUTO-SAVE */}
          <button
            type="button"
            onClick={handleAutoSaveAndClose}
            className="absolute top-4 right-4 p-1 text-[#2b1f14] hover:bg-[#2b1f14]/10 transition-colors cursor-pointer z-20"
            title="Đóng & Tự động lưu"
          >
            <X className="size-5" />
          </button>

          {/* DOCUMENT HEADER & QUESTION */}
          <div className="space-y-1.5 pr-8">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6b4e2e] block">
              Xác Định Đối Tượng Tình Nghi
            </span>
          </div>

          {/* FORM BODY */}
          <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4 pt-2">
            {/* 2-TILE OVERVIEW VIEW */}
            {subTileView === 'overview' && (
              <>
                {/* SUSPECT NAME INPUT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                    Họ và tên đối tượng:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      placeholder="Nhập đầy đủ họ & tên"
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errorMsg) setErrorMsg('')
                      }}
                      className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-4 py-2.5 text-base sm:text-lg text-[#0e2b5c] font-[family-name:var(--font-handwriting)] font-bold focus:outline-none focus:border-black transition-colors shadow-inner placeholder:font-sans placeholder:text-xs placeholder:text-[#8c7355]/60 placeholder:font-normal"
                      autoFocus
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-700 font-mono font-bold mt-1">
                      ⚠️ {errorMsg}
                    </p>
                  )}
                </div>

                {/* FEEDBACK STATUS BANNER */}
                {feedbackMsg && (
                  <div
                    className={cn(
                      'p-2.5 rounded-none font-mono text-xs font-bold flex items-center gap-2 border-2 transition-all',
                      feedbackMsg.type === 'success'
                        ? 'bg-[#e7f0dc] border-[#2e5220] text-[#193310]'
                        : 'bg-[#fce8e6] border-[#a81c1c] text-[#a81c1c]'
                    )}
                  >
                    <span>{feedbackMsg.type === 'success' ? '✅' : '⚠️'}</span>
                    <span className="flex-1">{feedbackMsg.text}</span>
                  </div>
                )}

                <div className="space-y-3 pt-1">
                  <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                    CĂN CỨ TÌNH NGHI:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                    {/* Tile 1: ĐỐI TƯỢNG CÓ ĐỘNG CƠ */}
                    <button
                      type="button"
                      onClick={() => {
                        const currentName = name.trim() || editingSuspect?.name?.trim() || ''
                        if (!currentName) {
                          setErrorMsg('Vui lòng nhập tên đối tượng tình nghi trước!')
                          detectiveAudio.playGlassSound()
                          return
                        }
                        if (!name.trim() && editingSuspect?.name) {
                          setName(editingSuspect.name)
                        }
                        detectiveAudio.playTypewriterClick()
                        setErrorMsg('')
                        setFeedbackMsg(null)
                        setSubTileView('motive')
                      }}
                      className={cn(
                        'w-full text-left p-3.5 border-2 transition-all flex items-center justify-between cursor-pointer select-none relative group h-full min-h-[64px]',
                        isMotiveValid
                          ? 'bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm'
                          : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22]'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'size-5 border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors',
                            isMotiveValid
                              ? 'bg-[#2e5220] border-[#193310] text-white'
                              : 'bg-white border-[#4a3520]'
                          )}
                        >
                          {isMotiveValid && '✓'}
                        </div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b] leading-tight flex-1">
                          Đối tượng có động cơ
                        </span>
                      </div>
                    </button>

                    {/* Tile 2: NGOẠI PHẠM BẤT HỢP LÝ */}
                    <button
                      type="button"
                      onClick={() => {
                        const currentName = name.trim() || editingSuspect?.name?.trim() || ''
                        if (!currentName) {
                          setErrorMsg('Vui lòng nhập tên đối tượng tình nghi trước!')
                          detectiveAudio.playGlassSound()
                          return
                        }
                        if (!name.trim() && editingSuspect?.name) {
                          setName(editingSuspect.name)
                        }
                        detectiveAudio.playTypewriterClick()
                        setErrorMsg('')
                        setFeedbackMsg(null)
                        setSubTileView('alibi')
                      }}
                      className={cn(
                        'w-full text-left p-3.5 border-2 transition-all flex items-center justify-between cursor-pointer select-none relative group h-full min-h-[64px]',
                        isAlibiValid
                          ? 'bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm'
                          : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22]'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'size-5 border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors',
                            isAlibiValid
                              ? 'bg-[#2e5220] border-[#193310] text-white'
                              : 'bg-white border-[#4a3520]'
                          )}
                        >
                          {isAlibiValid && '✓'}
                        </div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b] leading-tight flex-1">
                          Ngoại phạm bất hợp lý
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Sub-View for Tile 1: MOTIVE */}
            {subTileView === 'motive' && (
              <div className="space-y-3 pt-1">
                <div className="border-b border-[#2b1f14]/20 pb-2 space-y-1">
                  <span className="text-xs font-mono font-bold text-[#1a120b] uppercase flex items-center gap-1.5">
                    BẰNG CHỨNG CHỨNG MINH ĐỐI TƯỢNG CÓ ĐỘNG CƠ {name ? `(${name})` : ''}:
                  </span>
                  <p className="text-xs text-[#6b4e2e] italic font-sans leading-relaxed">
                    Hãy chọn các bằng chứng chứng minh đối tượng có mâu thuẫn hoặc có lý do để ra tay với nạn nhân
                  </p>
                  {!hasPhoneSolvedState && (
                    <div className="p-2 bg-amber-50 border border-amber-300 text-amber-900 font-mono text-[11px] font-medium mt-1">
                      🔒 Giải mã câu hỏi Tra cứu SĐT trên bản đồ để mở khóa thêm 8 tài liệu/chứng cứ liên quan.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                  {filteredEvidences.map((ev) => {
                    const isChecked = motiveClueIds.includes(ev.id)
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          detectiveAudio.playPaperRustle()
                          setMotiveClueIds((prev) =>
                            prev.includes(ev.id) ? prev.filter((id) => id !== ev.id) : [...prev, ev.id]
                          )
                        }}
                        className={cn(
                          'text-left p-2.5 rounded-none border-2 transition-all flex items-center gap-2.5 cursor-pointer relative select-none',
                          isChecked
                            ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] font-bold shadow-sm'
                            : 'bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]'
                        )}
                      >
                        <div className={cn(
                          'size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white',
                          isChecked ? 'border-[#2b1f14] text-[#0e2b5c]' : 'border-[#4a3520]'
                        )}>
                          {isChecked && <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none">✓</span>}
                        </div>
                        <span className="text-xs leading-snug flex-1">{ev.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      detectiveAudio.playPaperRustle()
                      setSubTileView('overview')
                    }}
                    className="px-4 py-2.5 bg-[#f4ebd9] hover:bg-[#ede3cf] text-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-2 border-[#2b1f14]"
                  >
                    <ArrowLeft className="size-3.5 text-[#4a3520]" />
                    <span>QUAY LẠI</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmMotiveClues}
                    className="px-5 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-2 border-[#2b1f14] shadow-sm active:scale-95"
                  >
                    <Check className="size-3.5 text-[#d9a066]" />
                    <span>XÁC NHẬN MANH MỐI</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-View for Tile 2: ALIBI */}
            {subTileView === 'alibi' && (
              <div className="space-y-3 pt-1">
                <div className="border-b border-[#2b1f14]/20 pb-2 space-y-1">
                  <span className="text-xs font-mono font-bold text-[#1a120b] uppercase flex items-center gap-1.5">
                    NGOẠI PHẠM BẤT HỢP LÝ {name ? `(${name})` : ''}:
                  </span>
                  <p className="text-xs text-[#6b4e2e] italic font-sans leading-relaxed">
                    Hãy chọn các bằng chứng chỉ ra điểm bất hợp lý trong ngoại phạm của đối tượng
                  </p>
                  {!hasPhoneSolvedState && (
                    <div className="p-2 bg-amber-50 border border-amber-300 text-amber-900 font-mono text-[11px] font-medium mt-1">
                      🔒 Giải mã câu hỏi Tra cứu SĐT trên bản đồ để mở khóa thêm 8 tài liệu/chứng cứ liên quan.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                  {filteredEvidences.map((ev) => {
                    const isChecked = alibiClueIds.includes(ev.id)
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          detectiveAudio.playPaperRustle()
                          setAlibiClueIds((prev) =>
                            prev.includes(ev.id) ? prev.filter((id) => id !== ev.id) : [...prev, ev.id]
                          )
                        }}
                        className={cn(
                          'text-left p-2.5 rounded-none border-2 transition-all flex items-center gap-2.5 cursor-pointer relative select-none',
                          isChecked
                            ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] font-bold shadow-sm'
                            : 'bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]'
                        )}
                      >
                        <div className={cn(
                          'size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white',
                          isChecked ? 'border-[#2b1f14] text-[#0e2b5c]' : 'border-[#4a3520]'
                        )}>
                          {isChecked && <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none">✓</span>}
                        </div>
                        <span className="text-xs leading-snug flex-1">{ev.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      detectiveAudio.playPaperRustle()
                      setSubTileView('overview')
                    }}
                    className="px-4 py-2.5 bg-[#f4ebd9] hover:bg-[#ede3cf] text-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-2 border-[#2b1f14]"
                  >
                    <ArrowLeft className="size-3.5 text-[#4a3520]" />
                    <span>QUAY LẠI</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAlibiClues}
                    className="px-5 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-2 border-[#2b1f14] shadow-sm active:scale-95"
                  >
                    <Check className="size-3.5 text-[#d9a066]" />
                    <span>XÁC NHẬN MANH MỐI</span>
                  </button>
                </div>
              </div>
            )}

            {/* ACTION TOOLBAR: SAVE & SUBMIT (ONLY VISIBLE ON OVERVIEW) */}
            {subTileView === 'overview' && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  {editingSuspect && onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        detectiveAudio.playGlassSound()
                        onDelete(editingSuspect.id)
                        onClose()
                      }}
                      title="Xóa hồ sơ nghi phạm"
                      className="p-2 rounded-none border-2 border-[#a81c1c] bg-[#fce8e6] hover:bg-[#f8d7d4] text-[#a81c1c] transition-all cursor-pointer flex items-center justify-center active:scale-95"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="text-xs uppercase tracking-wider px-4 py-2.5 rounded-none font-bold transition-all cursor-pointer flex items-center gap-1.5 border-2 border-[#2b1f14] bg-[#f4ebd9] hover:bg-[#ede3cf] text-[#2b1f14]"
                  >
                    <Save className="size-3.5 text-[#4a3520]" />
                    <span>LƯU HỒ SƠ</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitConclusion}
                    className="text-xs uppercase tracking-wider px-5 py-2.5 rounded-none font-bold transition-all cursor-pointer flex items-center gap-1.5 border-2 shadow-md bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-[#2b1f14] active:scale-95"
                  >
                    <span>ĐIỀU TRA</span>
                    <ArrowRight className="size-3.5 text-[#d9a066]" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </motion.div>

        {/* MODAL PHẢN HỒI KẾT QUẢ XÁC NHẬN MANH MỐI */}
        <AnimatePresence>
          {evalModal && evalModal.isOpen && (
            <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                className={cn(
                  'relative w-full max-w-md p-6 border-2 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-[#1a120b]',
                  evalModal.isSuccess
                    ? 'bg-[#f5f9f2] border-[#2e5220]'
                    : 'bg-[#fcf3f2] border-[#a81c1c]'
                )}
              >
                {/* Icon & Message side-by-side (No separate header or 'THÔNG BÁO' text) */}
                <div className="flex items-start gap-3.5 pb-4">
                  <div
                    className={cn(
                      'p-2.5 rounded-none border-2 flex items-center justify-center shrink-0',
                      evalModal.isSuccess
                        ? 'bg-[#e7f0dc] border-[#2e5220] text-[#2e5220]'
                        : 'bg-[#fce8e6] border-[#a81c1c] text-[#a81c1c]'
                    )}
                  >
                    {evalModal.isSuccess ? (
                      <CheckCircle2 className="size-6" />
                    ) : (
                      <AlertTriangle className="size-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 font-sans space-y-1.5 pt-0.5">
                    <p
                      className={cn(
                        'font-bold leading-snug text-sm sm:text-base',
                        evalModal.isSuccess ? 'text-[#193310]' : 'text-[#a81c1c]'
                      )}
                    >
                      {evalModal.message}
                    </p>
                    {evalModal.subMessage && (
                      <p className="text-xs text-[#6b5847] leading-relaxed">
                        {evalModal.subMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 flex justify-end">
                  {evalModal.isSuccess ? (
                    <button
                      type="button"
                      onClick={() => {
                        detectiveAudio.playPaperRustle()
                        setEvalModal(null)
                        setSubTileView('overview')
                      }}
                      className="px-5 py-2.5 bg-[#2e5220] hover:bg-[#203a16] text-[#f6f1e5] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border-2 border-[#193310] shadow-md active:scale-95"
                    >
                      <span>TIẾP TỤC ĐIỀU TRA</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        detectiveAudio.playPaperRustle()
                        setEvalModal(null)
                      }}
                      className="px-5 py-2.5 bg-[#a81c1c] hover:bg-[#851414] text-[#f6f1e5] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border-2 border-[#5c0f0f] shadow-md active:scale-95"
                    >
                      <span>RÀ SOÁT LẠI</span>
                      <ArrowLeft className="size-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  )
}
