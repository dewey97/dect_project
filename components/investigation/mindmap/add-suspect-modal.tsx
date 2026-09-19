'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Trash2, Check, Save, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { checkpoints000 } from '@/content/cases/case-000/checkpoints'
import { ClueCodePicker } from './clue-code-picker'

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

import { findValidCaseCharacter, VALID_CASE_CHARACTERS } from '@/lib/cases/case-000-suspects'
import { checkMotiveValid, checkAlibiValid } from '@/lib/cases/case-000-clues'
import { isAdminBypassCode, hasAdminBypassInArray } from '@/lib/cases/admin-bypass'

export { findValidCaseCharacter, VALID_CASE_CHARACTERS, checkMotiveValid, checkAlibiValid }

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
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false)

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
    setShowExitConfirmModal(false)
  }, [editingSuspect, isOpen])

  if (!isOpen) return null

  // XÁC NHẬN MANH MỐI ĐỘNG CƠ (LƯU & QUAY VỀ MÀN HÌNH NHẬP TÊN)
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
    if (matched) {
      const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds]))
      onSave({
        id: matched.id,
        name: matched.canonicalName,
        clueIds: combinedClues,
        motiveClueIds,
        alibiClueIds
      })
    }
    setSubTileView('overview')
    setErrorMsg('')
  }

  // XÁC NHẬN MANH MỐI BÁC BỎ NGOẠI PHẠM (LƯU & QUAY VỀ MÀN HÌNH NHẬP TÊN)
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
    if (matched) {
      const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds]))
      onSave({
        id: matched.id,
        name: matched.canonicalName,
        clueIds: combinedClues,
        motiveClueIds,
        alibiClueIds
      })
    }
    setSubTileView('overview')
    setErrorMsg('')
  }

  // NÚT 1: LƯU HỒ SƠ (Lưu hồ sơ đối tượng hợp lệ và thông báo thành công)
  const handleSaveProfile = () => {
    const currentName = name.trim() || editingSuspect?.name?.trim() || ''
    if (!currentName) {
      setErrorMsg('Vui lòng nhập họ và tên đối tượng tình nghi!')
      detectiveAudio.playGlassSound()
      return
    }

    const matchedChar = findValidCaseCharacter(currentName)
    if (!matchedChar) {
      setErrorMsg('Họ và tên đối tượng không chính xác hoặc không có trong hồ sơ vụ án! Vui lòng kiểm tra lại tài liệu điều tra.')
      detectiveAudio.playGlassSound()
      return
    }

    if (matchedChar.id === 'khang') {
      setErrorMsg('Nguyễn Văn Khang là nạn nhân của vụ án, đã có vị trí chính thức trên bảng điều tra!')
      detectiveAudio.playGlassSound()
      return
    }

    const suspectId = matchedChar.id
    const suspectName = matchedChar.canonicalName
    const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds]))

    detectiveAudio.playStampSound()
    onSave({
      id: suspectId,
      name: suspectName,
      clueIds: combinedClues,
      motiveClueIds,
      alibiClueIds
    })
    setFeedbackMsg({
      type: 'success',
      text: `Đã lưu hồ sơ đối tượng ${suspectName} lên sơ đồ điều tra thành công!`
    })
    setErrorMsg('')
  }

  // NÚT 2: ĐIỀU TRA (Thẩm tra / điều tra nghi phạm Lê Quang Vũ, Nguyễn Thanh Tùng hoặc Trần Thị Hà)
  const handleSubmitConclusion = () => {
    const currentName = name.trim() || editingSuspect?.name?.trim() || ''
    if (!currentName) {
      setErrorMsg('Vui lòng nhập họ và tên đối tượng tình nghi!')
      detectiveAudio.playGlassSound()
      return
    }

    const matchedChar = findValidCaseCharacter(currentName)
    if (!matchedChar) {
      setErrorMsg('Họ và tên đối tượng không chính xác hoặc không có trong hồ sơ vụ án! Vui lòng kiểm tra lại tài liệu điều tra.')
      detectiveAudio.playGlassSound()
      return
    }

    if (matchedChar.id === 'khang') {
      setErrorMsg('Nguyễn Văn Khang là nạn nhân của vụ án, đã có vị trí chính thức trên bảng điều tra!')
      detectiveAudio.playGlassSound()
      return
    }

    const lower = currentName.toLowerCase()
    const isVu = matchedChar.id === 'vu' || lower.includes('vũ') || lower.includes('vu')
    const isTung = matchedChar.id === 'tung' || lower.includes('tùng') || lower.includes('tung')
    const isHa = matchedChar.id === 'ha' || lower.includes('hà') || lower.includes('ha')

    const isAdmin000 = currentName === '000' || currentName === '00' || currentName === '0'
    if (!isVu && !isTung && !isHa && !isAdmin000) {
      setErrorMsg('Chưa đủ căn cứ pháp lý: Đối tượng này không thuộc diện điều tra trọng điểm (Vũ / Tùng / Hà)!')
      detectiveAudio.playGlassSound()
      return
    }

    const charId = (isAdmin000 ? 'vu' : isVu ? 'vu' : isTung ? 'tung' : 'ha') as 'vu' | 'tung' | 'ha'
    const isMotiveOk = isAdmin000 || checkMotiveValid(charId, motiveClueIds)
    const isAlibiOk = isAdmin000 || checkAlibiValid(charId, alibiClueIds)

    if (!isMotiveOk || !isAlibiOk) {
      setErrorMsg('Bằng chứng động cơ hoặc mâu thuẫn ngoại phạm chưa chính xác. Vui lòng rà soát lại đúng cả 2 mục trước khi tiến hành điều tra!')
      detectiveAudio.playGlassSound()
      return
    }

    const suspectId = charId
    const suspectName = matchedChar.canonicalName

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

  const matchedChar = findValidCaseCharacter(name)
  const isValidName = !!matchedChar && matchedChar.id !== 'khang'
  const isVu = matchedChar?.id === 'vu'
  const isTung = matchedChar?.id === 'tung'
  const isHa = matchedChar?.id === 'ha'

  // Hiển thị tích xanh khi các manh mối được chọn đạt đủ điều kiện của đối tượng
  const isMotiveValid = matchedChar ? checkMotiveValid(matchedChar.id, motiveClueIds) : false
  const isAlibiValid = matchedChar ? checkAlibiValid(matchedChar.id, alibiClueIds) : false
  const isAdmin000 = name.trim() === '000' || name.trim() === '00' || name.trim() === '0'
  const isBothValid = (isMotiveValid && isAlibiValid) || isAdmin000

  // KIỂM TRA XEM CÓ THAY ĐỔI CHƯA LƯU HAY KHÔNG (CHỈ XÉT KHI TÊN ĐÚNG)
  const hasUnsavedChanges = () => {
    if (!isValidName) return false
    if (!editingSuspect) {
      return name.trim().length > 0 || motiveClueIds.length > 0 || alibiClueIds.length > 0
    }
    const initialName = (editingSuspect.name || '').trim()
    const initialMotive = editingSuspect.motiveClueIds || []
    const initialAlibi = editingSuspect.alibiClueIds || []
    const nameChanged = name.trim() !== initialName
    const motiveChanged =
      motiveClueIds.length !== initialMotive.length ||
      motiveClueIds.some((id) => !initialMotive.includes(id))
    const alibiChanged =
      alibiClueIds.length !== initialAlibi.length ||
      alibiClueIds.some((id) => !initialAlibi.includes(id))
    return nameChanged || motiveChanged || alibiChanged
  }

  // XỬ LÝ KHI ẤN DẤU X HOẶC CLICK RA NGOÀI OVERLAY
  const handleAttemptClose = () => {
    if (hasUnsavedChanges()) {
      setShowExitConfirmModal(true)
    } else {
      onClose()
    }
  }

  // XÁC NHẬN "CÓ": LƯU HỒ SƠ ĐỐI TƯỢNG VÀ ĐÓNG
  const handleConfirmSaveAndClose = () => {
    const currentName = name.trim() || editingSuspect?.name?.trim() || ''
    const matched = findValidCaseCharacter(currentName)
    if (matched && matched.id !== 'khang') {
      const suspectId = matched.id
      const suspectName = matched.canonicalName
      const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds]))
      detectiveAudio.playStampSound()
      onSave({
        id: suspectId,
        name: suspectName,
        clueIds: combinedClues,
        motiveClueIds,
        alibiClueIds,
      })
    } else {
      detectiveAudio.playPaperRustle()
    }
    setShowExitConfirmModal(false)
    onClose()
  }

  // XÁC NHẬN "KHÔNG": BỎ QUA VÀ ĐÓNG
  const handleDiscardAndClose = () => {
    detectiveAudio.playPaperRustle()
    setShowExitConfirmModal(false)
    onClose()
  }

  return (
    <AnimatePresence>
      <div
        onClick={handleAttemptClose}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 rounded-none font-sans select-text max-h-[90vh] overflow-y-auto cursor-default"
        >
          {/* TOP RIGHT X CLOSE */}
          <button
            type="button"
            onClick={handleAttemptClose}
            className="absolute top-4 right-4 p-1 text-[#2b1f14] hover:bg-[#2b1f14]/10 transition-colors cursor-pointer z-20"
            title="Đóng"
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
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errorMsg) setErrorMsg('')
                      }}
                      className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-4 py-2.5 text-base sm:text-lg text-[#0e2b5c] font-[family-name:var(--font-handwriting)] font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
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
                    {/* Tile 1: ĐỘNG CƠ GÂY ÁN */}
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
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b] leading-tight">
                          Động cơ gây án
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
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b] leading-tight">
                          Ngoại phạm bất hợp lý
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Sub-View for Tile 1: MOTIVE / ĐỘNG CƠ GÂY ÁN */}
            {subTileView === 'motive' && (
              <div className="space-y-3 pt-1">
                <div className="border-b border-[#2b1f14]/20 pb-2">
                  <span className="text-xs font-mono font-bold text-[#1a120b] uppercase flex items-center gap-1.5">
                    ĐỘNG CƠ GÂY ÁN {name ? `— ${name}` : ''}
                  </span>
                </div>

                <ClueCodePicker
                  selectedClueIds={motiveClueIds}
                  customPhoneEvidences={[]}
                  onAddClueId={(id) => {
                    setMotiveClueIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
                    if (errorMsg) setErrorMsg('')
                  }}
                  onRemoveClueId={(id) => {
                    setMotiveClueIds((prev) => prev.filter((item) => item !== id))
                  }}
                  onAddCustomPhone={() => {}}
                  label="BẰNG CHỨNG ĐÃ NHẬP"
                  placeholder="Nhập mã chứng cứ..."
                  emptyStateText="Chưa có bằng chứng nào được nhập."
                />

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
                <div className="border-b border-[#2b1f14]/20 pb-2">
                  <span className="text-xs font-mono font-bold text-[#1a120b] uppercase flex items-center gap-1.5">
                    NGOẠI PHẠM BẤT HỢP LÝ {name ? `— ${name}` : ''}
                  </span>
                </div>

                <ClueCodePicker
                  selectedClueIds={alibiClueIds}
                  customPhoneEvidences={[]}
                  onAddClueId={(id) => {
                    setAlibiClueIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
                    if (errorMsg) setErrorMsg('')
                  }}
                  onRemoveClueId={(id) => {
                    setAlibiClueIds((prev) => prev.filter((item) => item !== id))
                  }}
                  onAddCustomPhone={() => {}}
                  label="BẰNG CHỨNG NGOẠI PHẠM ĐÃ NHẬP"
                  placeholder="Nhập mã chứng cứ..."
                  emptyStateText="Chưa có bằng chứng ngoại phạm nào được nhập."
                />

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
                  {isValidName && (
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="text-xs uppercase tracking-wider px-4 py-2.5 rounded-none font-bold transition-all cursor-pointer flex items-center gap-1.5 border-2 border-[#2b1f14] bg-[#f4ebd9] hover:bg-[#ede3cf] text-[#2b1f14]"
                    >
                      <Save className="size-3.5 text-[#4a3520]" />
                      <span>LƯU HỒ SƠ</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!isBothValid}
                    onClick={handleSubmitConclusion}
                    className={cn(
                      "text-xs uppercase tracking-wider px-5 py-2.5 rounded-none font-bold transition-all border-2 flex items-center justify-center",
                      isBothValid
                        ? "cursor-pointer shadow-md bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-[#2b1f14] active:scale-95"
                        : "opacity-40 cursor-not-allowed bg-[#2b1f14]/50 text-[#f6f1e5]/60 border-[#2b1f14]/40"
                    )}
                  >
                    <span>ĐIỀU TRA</span>
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

        {/* MODAL XÁC NHẬN KHI THOÁT MÀ CHƯA LƯU HỒ SƠ */}
        <AnimatePresence>
          {showExitConfirmModal && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 10 }}
                className="relative w-full max-w-md p-6 bg-[#f6f1e5] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-[#1a120b] space-y-5"
              >
                <div className="space-y-2 text-center">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8c1d1d] block">
                    XÁC NHẬN LƯU HỒ SƠ
                  </span>
                  <p className="font-sans font-bold text-sm sm:text-base text-[#1a120b] leading-relaxed">
                    Bạn có muốn lưu hồ sơ này chờ hoàn thiện sau không?
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmSaveAndClose}
                    className="flex-1 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-2 border-[#2b1f14] shadow-sm active:scale-95 text-center"
                  >
                    CÓ
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardAndClose}
                    className="flex-1 py-2.5 bg-[#f4ebd9] hover:bg-[#ede3cf] text-[#2b1f14] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-2 border-[#2b1f14] active:scale-95 text-center"
                  >
                    KHÔNG
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  )
}
