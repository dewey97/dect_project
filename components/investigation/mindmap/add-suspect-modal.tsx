'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Trash2, Check, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { ClueCodePicker, type PendingClueInputs } from './clue-code-picker'
import { emitInvestigationEvent } from '@/lib/investigation-events'
import { setStorageItem } from '@/lib/storage'
import { CheckpointHintSection } from '@/components/investigation/checkpoint-hint-section'

interface SuspectItemData {
  id: string
  name: string
  clueIds: string[]
  motiveClueIds?: string[]
  alibiClueIds?: string[]
}

interface AddSuspectModalProps {
  caseId?: string
  isOpen: boolean
  onClose: () => void
  onSave: (suspect: SuspectItemData) => void
  onDelete?: (id: string) => void
  editingSuspect?: SuspectItemData | null
  existingSuspects?: SuspectItemData[]
  onSelectSuspect?: (suspect: SuspectItemData | null) => void
  onSubmitConclusion?: (culprit: 'vu' | 'tung' | 'ha' | string) => void
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

import {
  findValidCaseCharacter,
  buildDynamicSuspectCharacters,
  VALID_CASE_CHARACTERS,
  type SuspectCharacter,
} from '@/lib/cases/case-000-suspects'
import {
  isEvidenceMatching,
  checkMotiveValid,
  checkAlibiValid,
  resolveEvidenceCode,
  KNOWN_CASE_PHONES,
} from '@/lib/cases/case-000-clues'
import { isAdminBypassCode, hasAdminBypassInArray } from '@/lib/cases/admin-bypass'
import { useCaseCheckpoints } from '@/lib/hooks/use-case-checkpoints'
import { usePhoneData } from '@/lib/hooks/use-phone-data'

export { findValidCaseCharacter, VALID_CASE_CHARACTERS, checkMotiveValid, checkAlibiValid }

export function AddSuspectModal({
  caseId = 'case-000',
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
  const [evalModal, setEvalModal] = useState<EvaluationModalState | null>(null)
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false)
  const openTimeRef = useRef(0)
  const pendingMotiveRef = useRef<PendingClueInputs>({})
  const pendingAlibiRef = useRef<PendingClueInputs>({})

  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = Date.now()
    }
  }, [isOpen])

  const normalizedCaseId = useMemo(() => caseId.replace(/-/g, '_'), [caseId])
  const { checkpoints } = useCaseCheckpoints(caseId)
  const { data: sheetEvidences } = usePhoneData('evidences', normalizedCaseId)

  // Parse all avatar/character items from Google Sheet
  const sheetCharacters: SuspectCharacter[] = useMemo(() => {
    return buildDynamicSuspectCharacters(sheetEvidences)
  }, [sheetEvidences])

  const matchedChar = useMemo(() => {
    return findValidCaseCharacter(name, sheetCharacters)
  }, [name, sheetCharacters])

  const suspectCpId = useMemo(() => {
    const norm = (name || editingSuspect?.name || editingSuspect?.id || '').toLowerCase()
    if (matchedChar) {
      const foundCp = checkpoints.find((cp) => {
        const titleLower = (cp.title || '').toLowerCase()
        const questionLower = (cp.question || '').toLowerCase()
        const suspectLabelLower = (cp.suspectLabel || '').toLowerCase()
        const validSuspects = (cp.pickerConfig?.validSuspects || []).map((s) => s.toLowerCase())
        return (
          titleLower.includes(matchedChar.id) ||
          titleLower.includes(matchedChar.canonicalName.toLowerCase()) ||
          questionLower.includes(matchedChar.canonicalName.toLowerCase()) ||
          suspectLabelLower.includes(matchedChar.canonicalName.toLowerCase()) ||
          validSuspects.includes(matchedChar.canonicalName.toLowerCase()) ||
          validSuspects.includes(matchedChar.id)
        )
      })
      if (foundCp) return foundCp.id
    }
    if (norm === 'vũ' || norm === 'vu' || norm === 'lê quang vũ') return 'cp-000-1a'
    if (norm === 'tùng' || norm === 'tung' || norm === 'nguyễn thanh tùng') return 'cp-000-1b'
    if (norm === 'hà' || norm === 'ha' || norm === 'trần thị hà') return 'cp-000-1c'
    return ''
  }, [name, editingSuspect, matchedChar, checkpoints])

  useEffect(() => {
    if (isOpen) {
      if (suspectCpId) {
        if (typeof window !== 'undefined') {
          (window as any).__ACTIVE_INVESTIGATION_CHECKPOINT__ = suspectCpId
        }
        setStorageItem('active_investigation_checkpoint', suspectCpId)
        setStorageItem('last_interacted_checkpoint', suspectCpId)
        if (suspectCpId === 'cp-000-1a') setStorageItem('last_viewed_suspect', 'vu')
        else if (suspectCpId === 'cp-000-1b') setStorageItem('last_viewed_suspect', 'tung')
        else if (suspectCpId === 'cp-000-1c') setStorageItem('last_viewed_suspect', 'ha')

        if (subTileView === 'motive') {
          setStorageItem('active_suspect_category', 'motive')
        } else if (subTileView === 'alibi') {
          setStorageItem('active_suspect_category', 'alibi')
        }
      }
    }
  }, [isOpen, suspectCpId, subTileView])

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
    pendingMotiveRef.current = {}
    pendingAlibiRef.current = {}
    setSubTileView('overview')
    setErrorMsg('')
    setEvalModal(null)
    setShowExitConfirmModal(false)
  }, [editingSuspect, isOpen])

  const matchedCheckpoint = useMemo(() => {
    return checkpoints.find((cp) => cp.id === suspectCpId)
  }, [checkpoints, suspectCpId])

  const extractClueIdsFromPending = (pending: PendingClueInputs): string[] => {
    const ids: string[] = []
    if (pending.code && pending.code.trim()) {
      const raw = pending.code.trim()
      const direct = resolveEvidenceCode(raw)
      if (direct) {
        ids.push(direct.id)
      } else {
        const tokens = raw
          .split(/[,;\n\r]+/)
          .flatMap((t) => t.trim().split(/\s+/))
          .map((t) => t.trim())
          .filter(Boolean)
        tokens.forEach((token) => {
          const resolved = resolveEvidenceCode(token)
          if (resolved) ids.push(resolved.id)
        })
      }
    }

    if (pending.textPhone && pending.textPhone.trim()) {
      const digits = pending.textPhone.replace(/\D/g, '')
      if (digits.length >= 3) {
        const known = KNOWN_CASE_PHONES[digits.slice(-3)]
        ids.push(known ? `sms_phone_${known.full}` : `sms_phone_${digits}`)
      }
    }

    if (pending.voicePhone && pending.voicePhone.trim()) {
      const digits = pending.voicePhone.replace(/\D/g, '')
      if (digits.length >= 3) {
        const known = KNOWN_CASE_PHONES[digits.slice(-3)]
        ids.push(known ? `voice_phone_${known.full}` : `voice_phone_${digits}`)
      }
    }

    return ids
  }

  const validateMotive = (_charId: string, clues: string[]) => {
    if (hasAdminBypassInArray(clues)) return true
    const liveMotive = matchedCheckpoint?.pickerConfig?.motiveEvidenceIds || []
    const optionalMotive = matchedCheckpoint?.pickerConfig?.optionalMotiveIds || []
    return checkMotiveValid(liveMotive, clues, optionalMotive)
  }

  const validateAlibi = (_charId: string, clues: string[]) => {
    if (hasAdminBypassInArray(clues)) return true
    const liveAlibi = matchedCheckpoint?.pickerConfig?.alibiEvidenceIds || []
    const optionalAlibi = matchedCheckpoint?.pickerConfig?.optionalAlibiIds || []
    return checkAlibiValid(liveAlibi, clues, optionalAlibi)
  }

  // XÁC NHẬN MANH MỐI ĐỘNG CƠ (HIỂN THỊ PHẢN HỒI ĐÚNG / SAI)
  const handleConfirmMotiveClues = () => {
    const pendingIds = extractClueIdsFromPending(pendingMotiveRef.current)
    const effectiveClues = Array.from(new Set([...motiveClueIds, ...pendingIds]))
    if (pendingIds.length > 0) {
      setMotiveClueIds(effectiveClues)
      pendingMotiveRef.current = {}
    }

    const suspectDisplayName = name.trim() || 'Đối tượng tình nghi'
    const matched = findValidCaseCharacter(name, sheetCharacters)
    const hasMotiveReqs = (matchedCheckpoint?.pickerConfig?.motiveEvidenceIds?.length ?? 0) > 0
    const isValid = hasMotiveReqs ? validateMotive(matched?.id || '', effectiveClues) : true

    if (hasMotiveReqs && !isValid) {
      detectiveAudio.playGlassSound()
      setEvalModal({
        isOpen: true,
        isSuccess: false,
        title: 'THÔNG BÁO',
        heading: '',
        message: 'Bằng chứng chứng minh đối tượng có động cơ chưa chính xác.',
        subMessage: 'Kiểm tra lại bằng chứng hoặc đối tượng đang lựa chọn tình nghi',
        suspectName: suspectDisplayName,
        selectedCount: effectiveClues.length,
      })
      return
    }

    detectiveAudio.playStampSound()
    if (matched) {
      const combinedClues = Array.from(new Set([...effectiveClues, ...alibiClueIds]))
      onSave({
        id: matched.id,
        name: matched.canonicalName,
        clueIds: combinedClues,
        motiveClueIds: effectiveClues,
        alibiClueIds
      })
    }
    setEvalModal({
      isOpen: true,
      isSuccess: true,
      title: 'THÔNG BÁO',
      heading: '',
      message: 'Bằng chứng lựa chọn chính xác. Căn cứ tình nghi đã được ghi nhận',
      suspectName: suspectDisplayName,
      selectedCount: effectiveClues.length,
    })
    setErrorMsg('')
  }

  // XÁC NHẬN MANH MỐI BÁC BỎ NGOẠI PHẠM (HIỂN THỊ PHẢN HỒI ĐÚNG / SAI)
  const handleConfirmAlibiClues = () => {
    const pendingIds = extractClueIdsFromPending(pendingAlibiRef.current)
    const effectiveClues = Array.from(new Set([...alibiClueIds, ...pendingIds]))
    if (pendingIds.length > 0) {
      setAlibiClueIds(effectiveClues)
      pendingAlibiRef.current = {}
    }

    const suspectDisplayName = name.trim() || 'Đối tượng tình nghi'
    const matched = findValidCaseCharacter(name, sheetCharacters)
    const hasAlibiReqs = (matchedCheckpoint?.pickerConfig?.alibiEvidenceIds?.length ?? 0) > 0
    const isValid = hasAlibiReqs ? validateAlibi(matched?.id || '', effectiveClues) : true

    if (hasAlibiReqs && !isValid) {
      detectiveAudio.playGlassSound()
      setEvalModal({
        isOpen: true,
        isSuccess: false,
        title: 'THÔNG BÁO',
        heading: '',
        message: 'Bằng chứng chứng minh mâu thuẫn ngoại phạm chưa chính xác.',
        subMessage: 'Kiểm tra lại bằng chứng hoặc đối tượng đang lựa chọn tình nghi',
        suspectName: suspectDisplayName,
        selectedCount: effectiveClues.length,
      })
      return
    }

    detectiveAudio.playStampSound()
    if (matched) {
      const combinedClues = Array.from(new Set([...motiveClueIds, ...effectiveClues]))
      onSave({
        id: matched.id,
        name: matched.canonicalName,
        clueIds: combinedClues,
        motiveClueIds,
        alibiClueIds: effectiveClues
      })
    }
    setEvalModal({
      isOpen: true,
      isSuccess: true,
      title: 'THÔNG BÁO',
      heading: '',
      message: 'Bằng chứng lựa chọn chính xác. Căn cứ tình nghi đã được ghi nhận',
      suspectName: suspectDisplayName,
      selectedCount: effectiveClues.length,
    })
    setErrorMsg('')
  }

  // NÚT: ĐIỀU TRA (Thẩm tra / điều tra nghi phạm Lê Quang Vũ, Nguyễn Thanh Tùng hoặc Trần Thị Hà)
  const handleSubmitConclusion = () => {
    const currentName = name.trim() || editingSuspect?.name?.trim() || ''
    if (!currentName) {
      setErrorMsg('Vui lòng nhập họ và tên đối tượng tình nghi!')
      detectiveAudio.playGlassSound()
      return
    }

    const matchedChar = findValidCaseCharacter(currentName, sheetCharacters)
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

    const pendingMotiveIds = extractClueIdsFromPending(pendingMotiveRef.current)
    const effectiveMotiveClues = Array.from(new Set([...motiveClueIds, ...pendingMotiveIds]))
    const pendingAlibiIds = extractClueIdsFromPending(pendingAlibiRef.current)
    const effectiveAlibiClues = Array.from(new Set([...alibiClueIds, ...pendingAlibiIds]))
    if (pendingMotiveIds.length > 0) setMotiveClueIds(effectiveMotiveClues)
    if (pendingAlibiIds.length > 0) setAlibiClueIds(effectiveAlibiClues)
    pendingMotiveRef.current = {}
    pendingAlibiRef.current = {}

    const isCore = matchedChar.id === 'vu' || matchedChar.id === 'tung' || matchedChar.id === 'ha'
    const isAdmin000 = currentName === '000' || currentName === '00' || currentName === '0'

    // If non-core suspect (Bà Lụa, Đạt, Mai...), save directly as related person of interest
    if (!isCore && !isAdmin000) {
      detectiveAudio.playStampSound()
      const combinedClues = Array.from(new Set([...effectiveMotiveClues, ...effectiveAlibiClues]))
      onSave({
        id: matchedChar.id,
        name: matchedChar.canonicalName,
        clueIds: combinedClues,
        motiveClueIds: effectiveMotiveClues,
        alibiClueIds: effectiveAlibiClues
      })
      // Chỉ kích hoạt onSubmitConclusion nếu nhân vật này thực sự có checkpoint/câu hỏi điều tra tương ứng trên CMS
      if (onSubmitConclusion && (suspectCpId || matchedCheckpoint)) {
        onSubmitConclusion(matchedChar.id)
      }
      onClose()
      return
    }

    const charId = (isAdmin000 ? 'vu' : matchedChar.id) as 'vu' | 'tung' | 'ha'
    const isMotiveOk = isAdmin000 || validateMotive(charId, effectiveMotiveClues)
    const isAlibiOk = isAdmin000 || validateAlibi(charId, effectiveAlibiClues)

    if (!isMotiveOk || !isAlibiOk) {
      setErrorMsg('Bằng chứng động cơ hoặc mâu thuẫn ngoại phạm chưa chính xác. Vui lòng rà soát lại đúng cả 2 mục trước khi tiến hành điều tra!')
      detectiveAudio.playGlassSound()
      return
    }

    const suspectId = charId
    const suspectName = matchedChar.canonicalName

    const combinedClues = Array.from(new Set([...effectiveMotiveClues, ...effectiveAlibiClues]))

    detectiveAudio.playStampSound()
    onSave({
      id: suspectId,
      name: suspectName,
      clueIds: combinedClues,
      motiveClueIds: effectiveMotiveClues,
      alibiClueIds: effectiveAlibiClues
    })
    if (onSubmitConclusion) {
      onSubmitConclusion(charId)
    }
    onClose()
  }

  const isValidName = !!matchedChar && matchedChar.id !== 'khang'
  const isCore = !!matchedChar && (matchedChar.id === 'vu' || matchedChar.id === 'tung' || matchedChar.id === 'ha')
  const isVu = matchedChar?.id === 'vu'
  const isTung = matchedChar?.id === 'tung'
  const isHa = matchedChar?.id === 'ha'

  // Hiển thị tích xanh khi các manh mối được chọn đạt đủ điều kiện của đối tượng
  const isMotiveValid = matchedChar && isCore ? validateMotive(matchedChar.id, motiveClueIds) : false
  const isAlibiValid = matchedChar && isCore ? validateAlibi(matchedChar.id, alibiClueIds) : false
  const isAdmin000 = name.trim() === '000' || name.trim() === '00' || name.trim() === '0'
  // For non-core suspects, having a valid recognized name is enough to save/investigate them
  const isBothValid = isValidName && (!isCore || (isMotiveValid && isAlibiValid) || isAdmin000)

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

  // XỬ LÝ KHI ẤN DẤU X ĐÓNG TRỰC TIẾP
  const handleDirectClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    detectiveAudio.playPaperRustle()

    // Nếu đã trả lời đúng 1 trong 2 căn cứ chính (động cơ hoặc ngoại phạm), tự động lưu không hỏi
    if (isMotiveValid || isAlibiValid) {
      const currentName = name.trim() || editingSuspect?.name?.trim() || ''
      const matched = findValidCaseCharacter(currentName)
      if (matched && matched.id !== 'khang') {
        const suspectId = matched.id
        const suspectName = matched.canonicalName
        const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds]))
        onSave({
          id: suspectId,
          name: suspectName,
          clueIds: combinedClues,
          motiveClueIds,
          alibiClueIds,
        })
      }
      onClose()
      return
    }

    if (hasUnsavedChanges()) {
      setShowExitConfirmModal(true)
    } else {
      onClose()
    }
  }

  // XỬ LÝ KHI CLICK RA NGOÀI VÙNG BACKDROP
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (Date.now() - openTimeRef.current < 350) return
    handleDirectClose()
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
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 rounded-none font-sans select-text max-h-[90vh] overflow-y-auto cursor-default"
        >
          {/* TOP RIGHT ACTIONS */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20 pointer-events-auto">
            <button
              type="button"
              onClick={handleDirectClose}
              className="p-1.5 text-[#2b1f14] hover:bg-[#2b1f14]/10 transition-colors cursor-pointer border border-[#5c4026]/40"
              title="Đóng"
            >
              <X className="size-5 pointer-events-none" />
            </button>
          </div>

          {/* DOCUMENT HEADER & QUESTION */}
          <div className="space-y-1.5 pr-8">
            <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#6b4e2e]">
              {subTileView === 'motive'
                ? 'Xác Định Động Cơ Gây Án'
                : subTileView === 'alibi'
                ? 'Xác Định Ngoại Phạm Bất Hợp Lý'
                : 'Xác Định Đối Tượng Tình Nghi'}
            </h3>

            {/* TÊN ĐỐI TƯỢNG ĐẨY XUỐNG DÒNG RIÊNG */}
            <div className="pt-0.5">
              {editingSuspect?.name || subTileView !== 'overview' ? (
                <div className="font-[family-name:var(--font-handwriting)] text-base sm:text-xl font-bold text-[#0e2b5c] normal-case tracking-normal">
                  {name || editingSuspect?.name}
                </div>
              ) : (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  placeholder="Nhập tên đối tượng..."
                  className="w-full max-w-sm bg-transparent border-b-2 border-[#2b1f14] px-1 py-0.5 text-base sm:text-xl font-[family-name:var(--font-handwriting)] font-bold text-[#0e2b5c] focus:outline-none focus:border-black placeholder:text-[#8c7355]/50 placeholder:font-sans placeholder:text-xs normal-case tracking-normal"
                />
              )}
            </div>

            {errorMsg && (
              <p className="text-xs text-red-700 font-mono font-bold mt-1">
                ⚠️ {errorMsg}
              </p>
            )}
          </div>

          {/* FORM BODY */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 pt-2">
            {/* 2-TILE OVERVIEW VIEW */}
            {subTileView === 'overview' && (
              <>
                <div className="space-y-3 pt-1">
                  <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                    CĂN CỨ TÌNH NGHI:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                    {/* Tile 1: ĐỘNG CƠ GÂY ÁN */}
                    <button
                      type="button"
                      disabled={isMotiveValid}
                      onClick={() => {
                        if (isMotiveValid) return
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
                        setSubTileView('motive')
                      }}
                      className={cn(
                        'w-full text-left p-3.5 border-2 transition-all flex items-center justify-between select-none relative group h-full min-h-[64px]',
                        isMotiveValid
                          ? 'bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm cursor-not-allowed opacity-95'
                          : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22] cursor-pointer'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b] leading-tight">
                          Động cơ gây án
                        </span>
                        {isMotiveValid && (
                          <Check className="size-5 text-[#2e5220] stroke-[2.5]" />
                        )}
                      </div>
                    </button>

                    {/* Tile 2: NGOẠI PHẠM BẤT HỢP LÝ */}
                    <button
                      type="button"
                      disabled={isAlibiValid}
                      onClick={() => {
                        if (isAlibiValid) return
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
                        setSubTileView('alibi')
                      }}
                      className={cn(
                        'w-full text-left p-3.5 border-2 transition-all flex items-center justify-between select-none relative group h-full min-h-[64px]',
                        isAlibiValid
                          ? 'bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm cursor-not-allowed opacity-95'
                          : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22] cursor-pointer'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b] leading-tight">
                          Ngoại phạm bất hợp lý
                        </span>
                        {isAlibiValid && (
                          <Check className="size-5 text-[#2e5220] stroke-[2.5]" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Sub-View for Tile 1: MOTIVE / ĐỘNG CƠ GÂY ÁN */}
            {subTileView === 'motive' && (
              <div className="space-y-3 pt-1">
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
                  onPendingChange={(pending) => {
                    pendingMotiveRef.current = pending
                  }}
                  label="BẰNG CHỨNG ĐÃ NHẬP"
                  placeholder="Nhập mã chứng cứ..."
                  emptyStateText="Chưa có bằng chứng nào được nhập."
                />

                {/* GỢI Ý ĐỘNG CƠ ĐẨY XUỐNG DƯỚI MÀN NHẬP MÃ */}
                {Boolean(suspectCpId) && (
                  <CheckpointHintSection
                    checkpointId={suspectCpId}
                    caseId={caseId}
                    category="motive"
                  />
                )}

                <div className="pt-3 border-t border-[#d4c5b0]/60 flex items-center justify-between gap-2 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      detectiveAudio.playPaperRustle()
                      setSubTileView('overview')
                    }}
                    className="h-10 px-3 sm:px-4 bg-[#f4ebd9] hover:bg-[#ede3cf] text-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 border-[#2b1f14] whitespace-nowrap shrink-0 shadow-xs active:scale-95"
                  >
                    <ArrowLeft className="size-3.5 text-[#4a3520] shrink-0" />
                    <span>QUAY LẠI</span>
                  </button>

                  <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleConfirmMotiveClues}
                      className="h-10 px-4 sm:px-5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 border-[#2b1f14] shadow-sm active:scale-95 whitespace-nowrap shrink-0"
                    >
                      <Check className="size-3.5 text-[#d9a066] shrink-0" />
                      <span>XÁC NHẬN</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-View for Tile 2: ALIBI */}
            {subTileView === 'alibi' && (
              <div className="space-y-3 pt-1">
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
                  onPendingChange={(pending) => {
                    pendingAlibiRef.current = pending
                  }}
                  label="BẰNG CHỨNG NGOẠI PHẠM ĐÃ NHẬP"
                  placeholder="Nhập mã chứng cứ..."
                  emptyStateText="Chưa có bằng chứng ngoại phạm nào được nhập."
                />

                {/* GỢI Ý NGOẠI PHẠM ĐẨY XUỐNG DƯỚI MÀN NHẬP MÃ */}
                {Boolean(suspectCpId) && (
                  <CheckpointHintSection
                    checkpointId={suspectCpId}
                    caseId={caseId}
                    category="alibi"
                  />
                )}

                <div className="pt-3 border-t border-[#d4c5b0]/60 flex items-center justify-between gap-2 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      detectiveAudio.playPaperRustle()
                      setSubTileView('overview')
                    }}
                    className="h-10 px-3 sm:px-4 bg-[#f4ebd9] hover:bg-[#ede3cf] text-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 border-[#2b1f14] whitespace-nowrap shrink-0 shadow-xs active:scale-95"
                  >
                    <ArrowLeft className="size-3.5 text-[#4a3520] shrink-0" />
                    <span>QUAY LẠI</span>
                  </button>

                  <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

                    <button
                      type="button"
                      onClick={handleConfirmAlibiClues}
                      className="h-10 px-4 sm:px-5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 border-[#2b1f14] shadow-sm active:scale-95 whitespace-nowrap shrink-0"
                    >
                      <Check className="size-3.5 text-[#d9a066] shrink-0" />
                      <span>XÁC NHẬN</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION TOOLBAR: SAVE & SUBMIT (ONLY VISIBLE ON OVERVIEW) */}
            {subTileView === 'overview' && (
              <div className="pt-3 border-t border-[#d4c5b0]/60 flex items-center justify-between gap-2 select-none">
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
                      className="h-10 px-3 rounded-none border-2 border-[#a81c1c] bg-[#fce8e6] hover:bg-[#f8d7d4] text-[#a81c1c] transition-all cursor-pointer flex items-center justify-center active:scale-95 shrink-0 shadow-xs"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    disabled={!isBothValid}
                    onClick={handleSubmitConclusion}
                    className={cn(
                      "h-10 px-5 rounded-none font-bold font-mono text-xs uppercase tracking-wider transition-all border-2 flex items-center justify-center whitespace-nowrap shrink-0",
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
            <div
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => {
                        e.stopPropagation()
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
                      onClick={(e) => {
                        e.stopPropagation()
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
