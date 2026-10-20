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
import { SuspectEvaluationModal, type EvaluationModalState } from './suspect/suspect-evaluation-modal'
import { SuspectExitConfirmModal } from './suspect/suspect-exit-confirm-modal'
import { InterrogationClueStep } from './suspect/interrogation-clue-step'

interface SuspectItemData {
  id: string
  name: string
  clueIds: string[]
  motiveClueIds?: string[]
  motiveReason?: string
  alibiClueIds?: string[]
  alibiReason?: string
  contradictionClueIds?: string[]
  contradictionReason?: string
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
  checkContradictionValid,
  resolveEvidenceCode,
  KNOWN_CASE_PHONES,
} from '@/lib/cases/case-000-clues'
import { isAdminBypassCode, hasAdminBypassInArray } from '@/lib/cases/admin-bypass'
import { useCaseCheckpoints } from '@/lib/hooks/use-case-checkpoints'
import { usePhoneData } from '@/lib/hooks/use-phone-data'
import { getInterrogationCriteria } from '@/lib/ai/suspect-interrogation-context'

export { findValidCaseCharacter, VALID_CASE_CHARACTERS, checkMotiveValid, checkAlibiValid, checkContradictionValid }

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
  const [subTileView, setSubTileView] = useState<'overview' | 'motive' | 'alibi' | 'contradiction'>('overview')
  const [motiveClueIds, setMotiveClueIds] = useState<string[]>(() => {
    if (editingSuspect?.motiveClueIds) return editingSuspect.motiveClueIds
    return []
  })
  const [motiveReason, setMotiveReason] = useState<string>(() => editingSuspect?.motiveReason || '')
  const [alibiClueIds, setAlibiClueIds] = useState<string[]>(() => {
    if (editingSuspect?.alibiClueIds) return editingSuspect.alibiClueIds
    return []
  })
  const [alibiReason, setAlibiReason] = useState<string>(() => editingSuspect?.alibiReason || '')
  const [contradictionClueIds, setContradictionClueIds] = useState<string[]>(() => {
    if (editingSuspect?.contradictionClueIds) return editingSuspect.contradictionClueIds
    return []
  })
  const [contradictionReason, setContradictionReason] = useState<string>(() => editingSuspect?.contradictionReason || '')
  const [isVerifyingAI, setIsVerifyingAI] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [evalModal, setEvalModal] = useState<EvaluationModalState | null>(null)
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false)
  const openTimeRef = useRef(0)
  const pendingMotiveRef = useRef<PendingClueInputs>({})
  const pendingAlibiRef = useRef<PendingClueInputs>({})
  const pendingContradictionRef = useRef<PendingClueInputs>({})

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
    const rawName = (name || editingSuspect?.name || editingSuspect?.id || '').trim()
    const norm = rawName.toLowerCase()
    if (!norm) return ''

    // 1. Quét tìm Checkpoint khớp trực tiếp theo suspectId, followupOf, hoặc suspectLabel
    const directMatch = checkpoints.find((cp) => {
      const sId = (cp.suspectId || '').toLowerCase().trim()
      const fOf = (cp.followupOf || '').toLowerCase().trim()
      const sLabel = (cp.suspectLabel || '').toLowerCase().trim()
      const validSuspects = (cp.pickerConfig?.validSuspects || []).map((s) => s.toLowerCase().trim())

      return (
        (sId && (norm === sId || norm.includes(sId) || sId.includes(norm))) ||
        (fOf && (norm === fOf || norm.includes(fOf) || fOf.includes(norm))) ||
        (sLabel && (norm === sLabel || norm.includes(sLabel) || sLabel.includes(norm))) ||
        validSuspects.some((v) => norm === v || norm.includes(v) || v.includes(norm))
      )
    })
    if (directMatch) return directMatch.id

    // 2. Tìm theo matchedChar (từ danh mục nhân vật)
    if (matchedChar) {
      const charId = matchedChar.id.toLowerCase()
      const charName = matchedChar.canonicalName.toLowerCase()
      const charAliases = (matchedChar.aliases || []).map((a) => a.toLowerCase())

      const foundCp = checkpoints.find((cp) => {
        const titleLower = (cp.title || '').toLowerCase()
        const questionLower = (cp.question || '').toLowerCase()
        const suspectLabelLower = (cp.suspectLabel || '').toLowerCase()
        const sId = (cp.suspectId || '').toLowerCase()
        const fOf = (cp.followupOf || '').toLowerCase()
        const validSuspects = (cp.pickerConfig?.validSuspects || []).map((s) => s.toLowerCase())

        return (
          sId === charId ||
          fOf === charId ||
          titleLower.includes(charId) ||
          titleLower.includes(charName) ||
          questionLower.includes(charName) ||
          suspectLabelLower.includes(charName) ||
          validSuspects.includes(charName) ||
          validSuspects.includes(charId) ||
          charAliases.some((alias) => titleLower.includes(alias) || validSuspects.includes(alias))
        )
      })
      if (foundCp) return foundCp.id
    }

    // 3. Fallback cho Case 000 nếu Sheet chưa gắn mã
    if (norm === 'vũ' || norm === 'vu' || norm === 'lê quang vũ') return 'cp-000-1a'
    if (norm === 'tùng' || norm === 'tung' || norm === 'nguyễn thanh tùng') return 'cp-000-1b'
    if (norm === 'hà' || norm === 'ha' || norm === 'trần thị hà') return 'cp-000-1c'
    return ''
  }, [name, editingSuspect, matchedChar, checkpoints])

  const matchedCheckpoint = useMemo(() => {
    return checkpoints.find((cp) => cp.id === suspectCpId)
  }, [checkpoints, suspectCpId])

  useEffect(() => {
    if (isOpen) {
      if (suspectCpId) {
        if (typeof window !== 'undefined') {
          (window as any).__ACTIVE_INVESTIGATION_CHECKPOINT__ = suspectCpId
        }
        setStorageItem('active_investigation_checkpoint', suspectCpId)
        setStorageItem('last_interacted_checkpoint', suspectCpId)

        const suspectKey =
          matchedCheckpoint?.suspectId ||
          matchedCheckpoint?.followupOf ||
          matchedChar?.id ||
          (suspectCpId === 'cp-000-1a'
            ? 'vu'
            : suspectCpId === 'cp-000-1b'
            ? 'tung'
            : suspectCpId === 'cp-000-1c'
            ? 'ha'
            : (name || '').toLowerCase().trim())

        setStorageItem('last_viewed_suspect', suspectKey)

        if (subTileView === 'motive') {
          setStorageItem('active_suspect_category', 'motive')
        } else if (subTileView === 'alibi') {
          setStorageItem('active_suspect_category', 'alibi')
        } else if (subTileView === 'contradiction') {
          setStorageItem('active_suspect_category', 'contradiction')
        }
      }
    }
  }, [isOpen, suspectCpId, subTileView, matchedCheckpoint, matchedChar, name])

  useEffect(() => {
    if (editingSuspect) {
      setName(editingSuspect.name)
      setMotiveClueIds(editingSuspect.motiveClueIds || [])
      setMotiveReason(editingSuspect.motiveReason || '')
      setAlibiClueIds(editingSuspect.alibiClueIds || [])
      setAlibiReason(editingSuspect.alibiReason || '')
      setContradictionClueIds(editingSuspect.contradictionClueIds || [])
      setContradictionReason(editingSuspect.contradictionReason || '')
    } else {
      setName('')
      setMotiveClueIds([])
      setMotiveReason('')
      setAlibiClueIds([])
      setAlibiReason('')
      setContradictionClueIds([])
      setContradictionReason('')
    }
    pendingMotiveRef.current = {}
    pendingAlibiRef.current = {}
    pendingContradictionRef.current = {}
    setSubTileView('overview')
    setErrorMsg('')
    setEvalModal(null)
    setShowExitConfirmModal(false)
    setIsVerifyingAI(false)
  }, [editingSuspect, isOpen])

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

  const validateContradiction = (_charId: string, clues: string[]) => {
    if (hasAdminBypassInArray(clues)) return true
    const liveContradiction = matchedCheckpoint?.pickerConfig?.contradictionEvidenceIds || []
    const optionalContradiction = matchedCheckpoint?.pickerConfig?.optionalContradictionIds || []
    return checkContradictionValid(liveContradiction, clues, optionalContradiction)
  }

  // HÀM HỖ TRỢ GỌI AI KIỂM TRA LẬP LUẬN LÝ DO
  const verifyReasonWithAI = async (
    category: 'motive' | 'alibi' | 'contradiction',
    reasonText: string,
    charId: string
  ): Promise<{ isCorrect: boolean; feedback: string }> => {
    try {
      const criteria = getInterrogationCriteria(charId, category, {
        title: matchedCheckpoint?.title,
        question: matchedCheckpoint?.question,
        hint: matchedCheckpoint?.hint,
      })

      const res = await fetch('/api/test-scan-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: criteria.context,
          answer: reasonText,
          validCases: criteria.validCases,
          invalidCases: criteria.invalidCases,
        }),
      })

      if (!res.ok) {
        // Nếu API lỗi tạm thời (hết quota / mạng), không chặn người chơi nếu mã chứng cứ đã đúng
        return { isCorrect: true, feedback: 'Xác nhận căn cứ lập luận.' }
      }

      const data = await res.json()
      return {
        isCorrect: !!data.isCorrect,
        feedback: data.feedback || '',
      }
    } catch (e) {
      console.warn('Lỗi kiểm tra AI, cho phép fallback qua mã chứng cứ:', e)
      return { isCorrect: true, feedback: 'Xác nhận căn cứ lập luận.' }
    }
  }

  // XÁC NHẬN MANH MỐI ĐỘNG CƠ (HIỂN THỊ PHẢN HỒI ĐÚNG / SAI)
  const handleConfirmMotiveClues = async () => {
    const pendingIds = extractClueIdsFromPending(pendingMotiveRef.current)
    const effectiveClues = Array.from(new Set([...motiveClueIds, ...pendingIds]))
    if (pendingIds.length > 0) {
      setMotiveClueIds(effectiveClues)
      pendingMotiveRef.current = {}
    }

    const suspectDisplayName = name.trim() || 'Đối tượng điều tra'
    const matched = findValidCaseCharacter(name, sheetCharacters)

    // Kiểm tra mã chứng cứ
    const hasMotiveReqs = (matchedCheckpoint?.pickerConfig?.motiveEvidenceIds?.length ?? 0) > 0
    const isCluesValid = hasMotiveReqs ? validateMotive(matched?.id || '', effectiveClues) : true

    if (hasMotiveReqs && !isCluesValid) {
      detectiveAudio.playGlassSound()
      setEvalModal({
        isOpen: true,
        isSuccess: false,
        title: 'THÔNG BÁO',
        heading: '',
        message: 'Bằng chứng chứng minh đối tượng có động cơ chưa chính xác.',
        subMessage: 'Kiểm tra lại bằng chứng hoặc đối tượng đang thẩm tra',
        suspectName: suspectDisplayName,
        selectedCount: effectiveClues.length,
      })
      return
    }

    detectiveAudio.playStampSound()
    if (matched) {
      const combinedClues = Array.from(new Set([...effectiveClues, ...alibiClueIds, ...contradictionClueIds]))
      onSave({
        id: matched.id,
        name: matched.canonicalName,
        clueIds: combinedClues,
        motiveClueIds: effectiveClues,
        motiveReason,
        alibiClueIds,
        alibiReason,
        contradictionClueIds,
        contradictionReason,
      })
    }
    setEvalModal({
      isOpen: true,
      isSuccess: true,
      title: 'THÔNG BÁO',
      heading: '',
      message: 'Bằng chứng chính xác. Căn cứ động cơ đã được ghi nhận',
      suspectName: suspectDisplayName,
      selectedCount: effectiveClues.length,
    })
    setErrorMsg('')
  }

  // XÁC NHẬN MANH MỐI NGOẠI PHẠM (HIỂN THỊ PHẢN HỒI ĐÚNG / SAI)
  const handleConfirmAlibiClues = async () => {
    const pendingIds = extractClueIdsFromPending(pendingAlibiRef.current)
    const effectiveClues = Array.from(new Set([...alibiClueIds, ...pendingIds]))
    if (pendingIds.length > 0) {
      setAlibiClueIds(effectiveClues)
      pendingAlibiRef.current = {}
    }

    const suspectDisplayName = name.trim() || 'Đối tượng điều tra'
    const matched = findValidCaseCharacter(name, sheetCharacters)

    // Kiểm tra mã chứng cứ
    const hasAlibiReqs = (matchedCheckpoint?.pickerConfig?.alibiEvidenceIds?.length ?? 0) > 0
    const isCluesValid = hasAlibiReqs ? validateAlibi(matched?.id || '', effectiveClues) : true

    if (hasAlibiReqs && !isCluesValid) {
      detectiveAudio.playGlassSound()
      setEvalModal({
        isOpen: true,
        isSuccess: false,
        title: 'THÔNG BÁO',
        heading: '',
        message: 'Bằng chứng chứng minh mâu thuẫn ngoại phạm chưa chính xác.',
        subMessage: 'Kiểm tra lại bằng chứng hoặc đối tượng đang thẩm tra',
        suspectName: suspectDisplayName,
        selectedCount: effectiveClues.length,
      })
      return
    }

    detectiveAudio.playStampSound()
    if (matched) {
      const combinedClues = Array.from(new Set([...motiveClueIds, ...effectiveClues, ...contradictionClueIds]))
      onSave({
        id: matched.id,
        name: matched.canonicalName,
        clueIds: combinedClues,
        motiveClueIds,
        motiveReason,
        alibiClueIds: effectiveClues,
        alibiReason,
        contradictionClueIds,
        contradictionReason,
      })
    }
    setEvalModal({
      isOpen: true,
      isSuccess: true,
      title: 'THÔNG BÁO',
      heading: '',
      message: 'Bằng chứng chính xác. Căn cứ ngoại phạm đã được ghi nhận',
      suspectName: suspectDisplayName,
      selectedCount: effectiveClues.length,
    })
    setErrorMsg('')
  }

  // XÁC NHẬN MANH MỐI MÂU THUẪN LỜI KHAI (HIỂN THỊ PHẢN HỒI ĐÚNG / SAI)
  const handleConfirmContradictionClues = async () => {
    const pendingIds = extractClueIdsFromPending(pendingContradictionRef.current)
    const effectiveClues = Array.from(new Set([...contradictionClueIds, ...pendingIds]))
    if (pendingIds.length > 0) {
      setContradictionClueIds(effectiveClues)
      pendingContradictionRef.current = {}
    }

    const suspectDisplayName = name.trim() || 'Đối tượng điều tra'
    const matched = findValidCaseCharacter(name, sheetCharacters)

    // Kiểm tra mã chứng cứ
    const hasContradictionReqs = (matchedCheckpoint?.pickerConfig?.contradictionEvidenceIds?.length ?? 0) > 0
    const isCluesValid = hasContradictionReqs ? validateContradiction(matched?.id || '', effectiveClues) : true

    if (hasContradictionReqs && !isCluesValid) {
      detectiveAudio.playGlassSound()
      setEvalModal({
        isOpen: true,
        isSuccess: false,
        title: 'THÔNG BÁO',
        heading: '',
        message: 'Bằng chứng chứng minh mâu thuẫn lời khai chưa chính xác.',
        subMessage: 'Kiểm tra lại bằng chứng hoặc đối tượng đang thẩm tra',
        suspectName: suspectDisplayName,
        selectedCount: effectiveClues.length,
      })
      return
    }

    detectiveAudio.playStampSound()
    if (matched) {
      const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds, ...effectiveClues]))
      onSave({
        id: matched.id,
        name: matched.canonicalName,
        clueIds: combinedClues,
        motiveClueIds,
        motiveReason,
        alibiClueIds,
        alibiReason,
        contradictionClueIds: effectiveClues,
        contradictionReason,
      })
    }
    setEvalModal({
      isOpen: true,
      isSuccess: true,
      title: 'THÔNG BÁO',
      heading: '',
      message: 'Bằng chứng chính xác. Mâu thuẫn lời khai đã được ghi nhận',
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
    const pendingContradictionIds = extractClueIdsFromPending(pendingContradictionRef.current)
    const effectiveContradictionClues = Array.from(new Set([...contradictionClueIds, ...pendingContradictionIds]))
    if (pendingMotiveIds.length > 0) setMotiveClueIds(effectiveMotiveClues)
    if (pendingAlibiIds.length > 0) setAlibiClueIds(effectiveAlibiClues)
    if (pendingContradictionIds.length > 0) setContradictionClueIds(effectiveContradictionClues)
    pendingMotiveRef.current = {}
    pendingAlibiRef.current = {}
    pendingContradictionRef.current = {}

    const hasInterrogationReqs = !!(
      (matchedCheckpoint?.pickerConfig?.motiveEvidenceIds?.length ?? 0) > 0 ||
      (matchedCheckpoint?.pickerConfig?.alibiEvidenceIds?.length ?? 0) > 0 ||
      (matchedCheckpoint?.pickerConfig?.contradictionEvidenceIds?.length ?? 0) > 0 ||
      matchedChar.id === 'vu' || matchedChar.id === 'tung' || matchedChar.id === 'ha'
    )
    const isAdmin000 = currentName === '000' || currentName === '00' || currentName === '0'

    // If non-core suspect (Bà Lụa, Đạt, Mai...), save directly as related person of interest
    if (!hasInterrogationReqs && !isAdmin000) {
      detectiveAudio.playStampSound()
      const combinedClues = Array.from(new Set([...effectiveMotiveClues, ...effectiveAlibiClues, ...effectiveContradictionClues]))
      onSave({
        id: matchedChar.id,
        name: matchedChar.canonicalName,
        clueIds: combinedClues,
        motiveClueIds: effectiveMotiveClues,
        motiveReason,
        alibiClueIds: effectiveAlibiClues,
        alibiReason,
        contradictionClueIds: effectiveContradictionClues,
        contradictionReason,
      })
      // Chỉ kích hoạt onSubmitConclusion nếu nhân vật này thực sự có checkpoint/câu hỏi điều tra tương ứng trên CMS
      if (onSubmitConclusion && (suspectCpId || matchedCheckpoint)) {
        onSubmitConclusion(matchedChar.id)
      }
      onClose()
      return
    }

    const charId = (isAdmin000 ? 'vu' : matchedChar.id) as string
    const hasMotiveReqs = (matchedCheckpoint?.pickerConfig?.motiveEvidenceIds?.length ?? 0) > 0
    const isMotiveOk = isAdmin000 || !hasMotiveReqs || validateMotive(charId, effectiveMotiveClues)
    const hasAlibiReqs = (matchedCheckpoint?.pickerConfig?.alibiEvidenceIds?.length ?? 0) > 0
    const isAlibiOk = isAdmin000 || !hasAlibiReqs || validateAlibi(charId, effectiveAlibiClues)
    const hasContradictionReqs = (matchedCheckpoint?.pickerConfig?.contradictionEvidenceIds?.length ?? 0) > 0
    const isContradictionOk = isAdmin000 || !hasContradictionReqs || validateContradiction(charId, effectiveContradictionClues)

    if (!isMotiveOk || !isAlibiOk || !isContradictionOk) {
      setErrorMsg('Bằng chứng động cơ, ngoại phạm hoặc mâu thuẫn lời khai chưa chính xác. Vui lòng rà soát lại trước khi hoàn tất thẩm tra!')
      detectiveAudio.playGlassSound()
      return
    }

    const suspectId = charId
    const suspectName = matchedChar.canonicalName

    const combinedClues = Array.from(new Set([...effectiveMotiveClues, ...effectiveAlibiClues, ...effectiveContradictionClues]))

    detectiveAudio.playStampSound()
    onSave({
      id: suspectId,
      name: suspectName,
      clueIds: combinedClues,
      motiveClueIds: effectiveMotiveClues,
      motiveReason,
      alibiClueIds: effectiveAlibiClues,
      alibiReason,
      contradictionClueIds: effectiveContradictionClues,
      contradictionReason,
    })
    if (onSubmitConclusion) {
      onSubmitConclusion(charId)
    }
    onClose()
  }

  const isValidName = !!matchedChar && matchedChar.id !== 'khang'
  const hasInterrogationReqs = !!(
    (matchedCheckpoint?.pickerConfig?.motiveEvidenceIds?.length ?? 0) > 0 ||
    (matchedCheckpoint?.pickerConfig?.alibiEvidenceIds?.length ?? 0) > 0 ||
    matchedChar?.id === 'vu' || matchedChar?.id === 'tung' || matchedChar?.id === 'ha'
  )
  const isCore = !!matchedChar && hasInterrogationReqs
  const isVu = matchedChar?.id === 'vu'
  const isTung = matchedChar?.id === 'tung'
  const isHa = matchedChar?.id === 'ha'

  // Hiển thị tích xanh khi các manh mối được chọn đạt đủ điều kiện của đối tượng
  const hasMotiveReqs = (matchedCheckpoint?.pickerConfig?.motiveEvidenceIds?.length ?? 0) > 0
  const isMotiveValid = matchedChar && isCore
    ? hasMotiveReqs ? validateMotive(matchedChar.id, motiveClueIds) : motiveClueIds.length > 0
    : false
  const hasAlibiReqs = (matchedCheckpoint?.pickerConfig?.alibiEvidenceIds?.length ?? 0) > 0
  const isAlibiValid = matchedChar && isCore
    ? hasAlibiReqs ? validateAlibi(matchedChar.id, alibiClueIds) : alibiClueIds.length > 0
    : false
  const hasContradictionReqs = (matchedCheckpoint?.pickerConfig?.contradictionEvidenceIds?.length ?? 0) > 0
  const isContradictionValid = matchedChar && isCore
    ? hasContradictionReqs
      ? validateContradiction(matchedChar.id, contradictionClueIds)
      : contradictionClueIds.length > 0
    : false
  const isAdmin000 = name.trim() === '000' || name.trim() === '00' || name.trim() === '0'
  const isCoreReqsMet = hasContradictionReqs
    ? isMotiveValid && isAlibiValid && isContradictionValid
    : isMotiveValid && isAlibiValid
  const isBothValid = isValidName && (!isCore || isCoreReqsMet || isAdmin000)

  // KIỂM TRA XEM CÓ THAY ĐỔI CHƯA LƯU HAY KHÔNG (CHỈ XÉT KHI TÊN ĐÚNG)
  const hasUnsavedChanges = () => {
    if (!isValidName) return false
    if (!editingSuspect) {
      return (
        name.trim().length > 0 ||
        motiveClueIds.length > 0 ||
        motiveReason.trim().length > 0 ||
        alibiClueIds.length > 0 ||
        alibiReason.trim().length > 0 ||
        contradictionClueIds.length > 0 ||
        contradictionReason.trim().length > 0
      )
    }
    const initialName = (editingSuspect.name || '').trim()
    const initialMotive = editingSuspect.motiveClueIds || []
    const initialAlibi = editingSuspect.alibiClueIds || []
    const initialContradiction = editingSuspect.contradictionClueIds || []
    const nameChanged = name.trim() !== initialName
    const motiveChanged =
      motiveClueIds.length !== initialMotive.length ||
      motiveClueIds.some((id) => !initialMotive.includes(id)) ||
      motiveReason !== (editingSuspect.motiveReason || '')
    const alibiChanged =
      alibiClueIds.length !== initialAlibi.length ||
      alibiClueIds.some((id) => !initialAlibi.includes(id)) ||
      alibiReason !== (editingSuspect.alibiReason || '')
    const contradictionChanged =
      contradictionClueIds.length !== initialContradiction.length ||
      contradictionClueIds.some((id) => !initialContradiction.includes(id)) ||
      contradictionReason !== (editingSuspect.contradictionReason || '')
    return nameChanged || motiveChanged || alibiChanged || contradictionChanged
  }

  // XỬ LÝ KHI ẤN DẤU X ĐÓNG TRỰC TIẾP
  const handleDirectClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    detectiveAudio.playPaperRustle()

    // Nếu đã trả lời đúng 1 trong các căn cứ, tự động lưu không hỏi
    if (isMotiveValid || isAlibiValid || isContradictionValid) {
      const currentName = name.trim() || editingSuspect?.name?.trim() || ''
      const matched = findValidCaseCharacter(currentName)
      if (matched && matched.id !== 'khang') {
        const suspectId = matched.id
        const suspectName = matched.canonicalName
        const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds, ...contradictionClueIds]))
        onSave({
          id: suspectId,
          name: suspectName,
          clueIds: combinedClues,
          motiveClueIds,
          motiveReason,
          alibiClueIds,
          alibiReason,
          contradictionClueIds,
          contradictionReason,
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
      const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds, ...contradictionClueIds]))
      detectiveAudio.playStampSound()
      onSave({
        id: suspectId,
        name: suspectName,
        clueIds: combinedClues,
        motiveClueIds,
        motiveReason,
        alibiClueIds,
        alibiReason,
        contradictionClueIds,
        contradictionReason,
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
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 rounded-none font-sans select-text max-h-[90vh] overflow-y-auto cursor-default paper-scrollbar"
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
                ? 'Động Cơ Gây Án'
                : subTileView === 'alibi'
                ? 'Xác Minh Ngoại Phạm'
                : subTileView === 'contradiction'
                ? 'Mâu Thuẫn Lời Khai'
                : 'THẨM TRA ĐỐI TƯỢNG'}
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
            {/* 3-TILE OVERVIEW VIEW */}
            {subTileView === 'overview' && (
              <>
                <div className="space-y-3 pt-1">
                  <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                    HẠNG MỤC THẨM TRA:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 items-stretch">
                    {/* Tile 1: ĐỘNG CƠ GÂY ÁN */}
                    <button
                      type="button"
                      disabled={isMotiveValid}
                      onClick={() => {
                        if (isMotiveValid) return
                        const currentName = name.trim() || editingSuspect?.name?.trim() || ''
                        if (!currentName) {
                          setErrorMsg('Vui lòng nhập tên đối tượng trước!')
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
                        'w-full text-left p-3 border-2 transition-all flex items-center justify-between select-none relative group h-full min-h-[64px]',
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

                    {/* Tile 2: XÁC MINH NGOẠI PHẠM */}
                    <button
                      type="button"
                      disabled={isAlibiValid}
                      onClick={() => {
                        if (isAlibiValid) return
                        const currentName = name.trim() || editingSuspect?.name?.trim() || ''
                        if (!currentName) {
                          setErrorMsg('Vui lòng nhập tên đối tượng trước!')
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
                        'w-full text-left p-3 border-2 transition-all flex items-center justify-between select-none relative group h-full min-h-[64px]',
                        isAlibiValid
                          ? 'bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm cursor-not-allowed opacity-95'
                          : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22] cursor-pointer'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b] leading-tight">
                          Xác minh ngoại phạm
                        </span>
                        {isAlibiValid && (
                          <Check className="size-5 text-[#2e5220] stroke-[2.5]" />
                        )}
                      </div>
                    </button>

                    {/* Tile 3: MÂU THUẪN LỜI KHAI */}
                    <button
                      type="button"
                      disabled={isContradictionValid}
                      onClick={() => {
                        if (isContradictionValid) return
                        const currentName = name.trim() || editingSuspect?.name?.trim() || ''
                        if (!currentName) {
                          setErrorMsg('Vui lòng nhập tên đối tượng trước!')
                          detectiveAudio.playGlassSound()
                          return
                        }
                        if (!name.trim() && editingSuspect?.name) {
                          setName(editingSuspect.name)
                        }
                        detectiveAudio.playTypewriterClick()
                        setErrorMsg('')
                        setSubTileView('contradiction')
                      }}
                      className={cn(
                        'w-full text-left p-3 border-2 transition-all flex items-center justify-between select-none relative group h-full min-h-[64px]',
                        isContradictionValid
                          ? 'bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm cursor-not-allowed opacity-95'
                          : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22] cursor-pointer'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b] leading-tight">
                          Mâu thuẫn lời khai
                        </span>
                        {isContradictionValid && (
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
              <InterrogationClueStep
                category="motive"
                clueIds={motiveClueIds}
                reason={motiveReason}
                onReasonChange={setMotiveReason}
                isLoading={isVerifyingAI}
                onAddClueId={(id) => {
                  setMotiveClueIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
                  if (errorMsg) setErrorMsg('')
                }}
                onRemoveClueId={(id) => {
                  setMotiveClueIds((prev) => prev.filter((item) => item !== id))
                }}
                onPendingChange={(pending) => {
                  pendingMotiveRef.current = pending
                }}
                checkpointId={suspectCpId}
                caseId={caseId}
                onBack={() => setSubTileView('overview')}
                onConfirm={handleConfirmMotiveClues}
              />
            )}

            {/* Sub-View for Tile 2: ALIBI */}
            {subTileView === 'alibi' && (
              <InterrogationClueStep
                category="alibi"
                clueIds={alibiClueIds}
                reason={alibiReason}
                onReasonChange={setAlibiReason}
                isLoading={isVerifyingAI}
                onAddClueId={(id) => {
                  setAlibiClueIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
                  if (errorMsg) setErrorMsg('')
                }}
                onRemoveClueId={(id) => {
                  setAlibiClueIds((prev) => prev.filter((item) => item !== id))
                }}
                onPendingChange={(pending) => {
                  pendingAlibiRef.current = pending
                }}
                checkpointId={suspectCpId}
                caseId={caseId}
                onBack={() => setSubTileView('overview')}
                onConfirm={handleConfirmAlibiClues}
              />
            )}

            {/* Sub-View for Tile 3: CONTRADICTION / MÂU THUẪN LỜI KHAI */}
            {subTileView === 'contradiction' && (
              <InterrogationClueStep
                category="contradiction"
                clueIds={contradictionClueIds}
                reason={contradictionReason}
                onReasonChange={setContradictionReason}
                isLoading={isVerifyingAI}
                onAddClueId={(id) => {
                  setContradictionClueIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
                  if (errorMsg) setErrorMsg('')
                }}
                onRemoveClueId={(id) => {
                  setContradictionClueIds((prev) => prev.filter((item) => item !== id))
                }}
                onPendingChange={(pending) => {
                  pendingContradictionRef.current = pending
                }}
                checkpointId={suspectCpId}
                caseId={caseId}
                onBack={() => setSubTileView('overview')}
                onConfirm={handleConfirmContradictionClues}
              />
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
        <SuspectEvaluationModal
          evalModal={evalModal}
          onCloseSuccess={() => {
            setEvalModal(null)
            setSubTileView('overview')
          }}
          onCloseFailure={() => setEvalModal(null)}
        />

        {/* MODAL XÁC NHẬN KHI THOÁT MÀ CHƯA LƯU HỒ SƠ */}
        <SuspectExitConfirmModal
          isOpen={showExitConfirmModal}
          onConfirmSave={handleConfirmSaveAndClose}
          onDiscard={handleDiscardAndClose}
        />
      </div>
    </AnimatePresence>
  )
}
