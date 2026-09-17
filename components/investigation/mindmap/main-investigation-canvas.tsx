'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { HeroInteractive, type PinPoint, type CaseConnection } from '@/components/investigation/hero-interactive'
import { AddSuspectModal } from './add-suspect-modal'
import { PhoneLookupModal } from './phone-lookup-modal'
import { PhoneNarrativeModal } from './phone-narrative-modal'
import { EvidenceGuideModal } from './evidence-guide-modal'
import { IndictmentModal } from './indictment-modal'
import { CulpritEpilogueModal } from './culprit-epilogue-modal'
import { DossierResultModal } from './dossier-result-modal'
import { FollowupQuestionModal } from './followup-question-modal'
import { detectiveAudio } from '@/lib/investigation-audio'

interface SuspectItem {
  id: string
  name: string
  clueIds: string[]
  motiveClueIds?: string[]
  alibiClueIds?: string[]
}

interface MainInvestigationCanvasProps {
  onOpenPhoneSimulator?: () => void
  onOpenReinvestigation?: () => void
  onOpenEpilogue?: () => void
}

export function MainInvestigationCanvas({
  onOpenPhoneSimulator,
  onOpenReinvestigation,
  onOpenEpilogue
}: MainInvestigationCanvasProps) {
  const [suspects, setSuspects] = useState<SuspectItem[]>([])
  const [isReinvestigateUnlocked, setIsReinvestigateUnlocked] = useState(false)
  const [phoneLookupSuccess, setPhoneLookupSuccess] = useState(false)

  // Indictment & Epilogue state
  const [isIndictmentSolved, setIsIndictmentSolved] = useState(false)
  const [solvedCulprit, setSolvedCulprit] = useState<'vu' | 'tung' | null>(null)
  const [isEpilogueOpen, setIsEpilogueOpen] = useState(false)
  const [isDossierOpen, setIsDossierOpen] = useState(false)
  const [activeDossierType, setActiveDossierType] = useState<'A' | 'B' | null>(null)
  const [isFollowupQuestionOpen, setIsFollowupQuestionOpen] = useState(false)
  const [isEvidenceGuideOpen, setIsEvidenceGuideOpen] = useState(false)
  const [isPhoneNarrativeOpen, setIsPhoneNarrativeOpen] = useState(false)

  const [investigatedSuspects, setInvestigatedSuspects] = useState<('vu' | 'tung')[]>([])
  const [solvedFollowupQuestions, setSolvedFollowupQuestions] = useState<('vu' | 'tung')[]>([])
  const [activeFollowupCulprit, setActiveFollowupCulprit] = useState<'vu' | 'tung' | null>(null)
  const [narrativeCulprit, setNarrativeCulprit] = useState<'vu' | 'tung' | null>(null)

  // Modals state
  const [isAddSuspectOpen, setIsAddSuspectOpen] = useState(false)
  const [editingSuspect, setEditingSuspect] = useState<SuspectItem | null>(null)
  const [isPhoneLookupOpen, setIsPhoneLookupOpen] = useState(false)
  const [isIndictmentOpen, setIsIndictmentOpen] = useState(false)

  // Helper to resolve canonical suspect key, name, and static slot
  const getCanonicalSuspectKey = (suspect: { id?: string; name: string }) => {
    const lower = (suspect.name || '').trim().toLowerCase()
    const idLower = (suspect.id || '').toLowerCase()

    if (idLower.includes('vu') || lower.includes('vũ') || lower.includes('vu')) {
      return { canonicalId: 'vu', slotIndex: 0, canonicalName: 'Lê Quang Vũ' }
    }
    if (idLower.includes('tung') || lower.includes('tùng') || lower.includes('tung')) {
      return { canonicalId: 'tung', slotIndex: 1, canonicalName: 'Nguyễn Thanh Tùng' }
    }
    if (idLower.includes('ha') || lower.includes('hà') || lower.includes('ha')) {
      return { canonicalId: 'ha', slotIndex: 2, canonicalName: 'Trần Thị Hà' }
    }
    if (idLower.includes('mai') || lower.includes('mai')) {
      return { canonicalId: 'mai', slotIndex: 3, canonicalName: 'Nguyễn Ngọc Mai' }
    }
    if (idLower.includes('dat') || lower.includes('đạt') || lower.includes('dat')) {
      return { canonicalId: 'dat', slotIndex: 4, canonicalName: 'Trần Văn Đạt (Đạt Gà)' }
    }
    if (idLower.includes('lua') || lower.includes('lụa') || lower.includes('lua')) {
      return { canonicalId: 'lua', slotIndex: 5, canonicalName: 'Nguyễn Thị Lụa' }
    }
    if (idLower.includes('khang') || lower.includes('khang')) {
      return { canonicalId: 'khang', slotIndex: 6, canonicalName: 'Nguyễn Văn Khang' }
    }
    return {
      canonicalId: suspect.id || `suspect-${lower.replace(/\s+/g, '-')}`,
      slotIndex: 4,
      canonicalName: suspect.name,
    }
  }

  const sanitizeSuspectsList = (items: SuspectItem[]): SuspectItem[] => {
    const map = new Map<string, SuspectItem>()
    for (const s of items) {
      if (!s || !s.name) continue
      const { canonicalId, canonicalName } = getCanonicalSuspectKey(s)
      map.set(canonicalId, {
        ...s,
        id: canonicalId,
        name: canonicalName || s.name,
      })
    }
    return Array.from(map.values())
  }

  // Restore saved state from localStorage if available
  useEffect(() => {
    try {
      const savedSuspects = localStorage.getItem('veritas_canvas_suspects')
      if (savedSuspects) {
        const parsed = JSON.parse(savedSuspects)
        const validList = parsed.filter((s: any) => s.id !== 'suspect-default-1')
        const sanitized = sanitizeSuspectsList(validList)
        setSuspects(sanitized)
      }
      const savedSolvedFollowups = localStorage.getItem('veritas_solved_followups')
      if (savedSolvedFollowups) {
        try {
          const parsed = JSON.parse(savedSolvedFollowups)
          setSolvedFollowupQuestions(parsed)
          if (parsed.includes('vu') && parsed.includes('tung')) {
            setIsReinvestigateUnlocked(true)
          }
        } catch {}
      }
      const savedPhone = localStorage.getItem('veritas_phone_inputs')
      if (savedPhone) {
        try {
          const parsed = JSON.parse(savedPhone)
          if (parsed.phone1 || parsed.phone2 || parsed.phone3) {
            setPhoneLookupSuccess(true)
          }
        } catch {
          setPhoneLookupSuccess(true)
        }
      }
      const savedInvestigated = localStorage.getItem('veritas_investigated_suspects')
      if (savedInvestigated) {
        setInvestigatedSuspects(JSON.parse(savedInvestigated))
      }
      const savedSolved = localStorage.getItem('veritas_indictment_solved')
      const savedCulprit = localStorage.getItem('veritas_indictment_culprit') as 'vu' | 'tung' | null
      if (savedSolved === 'true' && savedCulprit) {
        setIsIndictmentSolved(true)
        setSolvedCulprit(savedCulprit)
      }
    } catch {}
  }, [])

  const saveSuspectsState = (newSuspects: SuspectItem[]) => {
    const sanitized = sanitizeSuspectsList(newSuspects)
    setSuspects(sanitized)
    try {
      localStorage.setItem('veritas_canvas_suspects', JSON.stringify(sanitized))
    } catch {}
  }

  const handleSaveSuspect = (savedSuspect: SuspectItem) => {
    const { canonicalId, canonicalName } = getCanonicalSuspectKey(savedSuspect)
    const normalizedItem: SuspectItem = {
      ...savedSuspect,
      id: canonicalId,
      name: canonicalName || savedSuspect.name,
    }

    setSuspects((prev) => {
      const existingIndex = prev.findIndex((s) => {
        const sKey = getCanonicalSuspectKey(s)
        return sKey.canonicalId === canonicalId || s.id === canonicalId
      })
      let updated: SuspectItem[]
      if (existingIndex >= 0) {
        updated = [...prev]
        updated[existingIndex] = normalizedItem
      } else {
        updated = [...prev, normalizedItem]
      }
      const sanitized = sanitizeSuspectsList(updated)
      try {
        localStorage.setItem('veritas_canvas_suspects', JSON.stringify(sanitized))
      } catch {}
      return sanitized
    })
  }

  const handleDeleteSuspect = (id: string) => {
    const { canonicalId } = getCanonicalSuspectKey({ id, name: id })
    const suspectToDelete = suspects.find(
      (s) => s.id === id || getCanonicalSuspectKey(s).canonicalId === canonicalId
    )
    const updated = suspects.filter(
      (s) => s.id !== id && getCanonicalSuspectKey(s).canonicalId !== canonicalId
    )
    saveSuspectsState(updated)

    if (suspectToDelete) {
      const lower = suspectToDelete.name.toLowerCase()
      const culpritType: 'vu' | 'tung' | null =
        lower.includes('vũ') || lower.includes('vu')
          ? 'vu'
          : lower.includes('tùng') || lower.includes('tung')
          ? 'tung'
          : null

      if (culpritType) {
        const remainingHasCulprit = updated.some((s) => {
          const l = s.name.toLowerCase()
          return culpritType === 'vu'
            ? l.includes('vũ') || l.includes('vu')
            : l.includes('tùng') || l.includes('tung')
        })
        if (!remainingHasCulprit) {
          setInvestigatedSuspects((prev) => {
            const next = prev.filter((c) => c !== culpritType)
            try {
              localStorage.setItem('veritas_investigated_suspects', JSON.stringify(next))
            } catch {}
            return next
          })
          if (solvedCulprit === culpritType) {
            setSolvedCulprit(null)
            setIsIndictmentSolved(false)
            try {
              localStorage.removeItem('veritas_indictment_solved')
              localStorage.removeItem('veritas_indictment_culprit')
            } catch {}
          }
        }
      }
    }
  }

  const handlePhoneLookupSuccess = (phone: string, info: string) => {
    setPhoneLookupSuccess(true)
    setIsPhoneLookupOpen(false)
    setIsPhoneNarrativeOpen(true)
  }

  const handleFollowupSuccess = (culprit: 'vu' | 'tung') => {
    const updated = Array.from(new Set([...solvedFollowupQuestions, culprit]))
    setSolvedFollowupQuestions(updated)
    try {
      localStorage.setItem('veritas_solved_followups', JSON.stringify(updated))
    } catch {}

    if (updated.includes('vu') && updated.includes('tung')) {
      setIsReinvestigateUnlocked(true)
      try {
        localStorage.setItem('veritas_reinvestigate_unlocked', 'true')
      } catch {}
    }
  }

  const handleSubmitIndictment = (data: {
    culprit: 'vu' | 'tung'
    suspectName: string
    motive: string
    selectedClueIds: string[]
    reasoning: string
  }) => {
    setIsIndictmentSolved(true)
    setSolvedCulprit(data.culprit)
    try {
      localStorage.setItem('veritas_indictment_solved', 'true')
      localStorage.setItem('veritas_indictment_culprit', data.culprit)
    } catch {}
    setIsEpilogueOpen(true)
  }

  const handleOpenDossier = (dossierType: 'A' | 'B') => {
    setActiveDossierType(dossierType)
    setIsDossierOpen(true)
  }

  const handleResetAll = () => {
    detectiveAudio.playGlassSound()
    setSuspects([])
    setPhoneLookupSuccess(false)
    setInvestigatedSuspects([])
    setSolvedFollowupQuestions([])
    setActiveFollowupCulprit(null)
    setIsIndictmentSolved(false)
    setSolvedCulprit(null)
    setIsReinvestigateUnlocked(false)
    setIsEpilogueOpen(false)
    setIsDossierOpen(false)
    setIsFollowupQuestionOpen(false)
    setIsPhoneNarrativeOpen(false)
    try {
      localStorage.removeItem('veritas_canvas_suspects')
      localStorage.removeItem('veritas_investigated_suspects')
      localStorage.removeItem('veritas_solved_followups')
      localStorage.removeItem('veritas_followup_vu')
      localStorage.removeItem('veritas_followup_tung')
      localStorage.removeItem('veritas_indictment_solved')
      localStorage.removeItem('veritas_indictment_culprit')
      localStorage.removeItem('veritas_reinvestigate_unlocked')
      localStorage.removeItem('veritas_phone_inputs')
      localStorage.removeItem('khang_phone_pinned_clues')
      localStorage.removeItem('veritas_custom_notes')
      localStorage.removeItem('veritas_discovered_findings')
      localStorage.removeItem('veritas_completed_checkpoints')
    } catch {}
  }

  // Handle pin clicks directly on HeroInteractive canvas
  const handlePinClick = useCallback((pinId: string) => {
    detectiveAudio.playPaperRustle()

    if (pinId === 'c0-pin-suspects') {
      setEditingSuspect(null)
      setIsAddSuspectOpen(true)
    } else if (pinId === 'c0-pin-evidence') {
      setIsEvidenceGuideOpen(true)
    } else if (pinId === 'c0-pin-phone') {
      setIsPhoneLookupOpen(true)
    } else if (pinId === 'c0-pin-reinvestigate') {
      if (isReinvestigateUnlocked && onOpenReinvestigation) {
        detectiveAudio.playGlassSound()
        onOpenReinvestigation()
      } else {
        detectiveAudio.playGlassSound()
      }
    } else if (pinId === 'c0-pin-indictment') {
      if (isIndictmentSolved && solvedCulprit) {
        setIsEpilogueOpen(true)
      } else {
        setIsIndictmentOpen(true)
      }
    } else if (pinId === 'c0-pin-followup-vu') {
      setActiveFollowupCulprit('vu')
      setIsFollowupQuestionOpen(true)
    } else if (pinId === 'c0-pin-followup-tung') {
      setActiveFollowupCulprit('tung')
      setIsFollowupQuestionOpen(true)
    } else if (pinId.startsWith('c0-pin-followup')) {
      const c = pinId.includes('tung') ? 'tung' : 'vu'
      setActiveFollowupCulprit(c)
      setIsFollowupQuestionOpen(true)
    } else if (pinId.startsWith('node-suspect-')) {
      const targetId = pinId.replace('node-suspect-', '')
      const foundSuspect = suspects.find((s) => {
        const key = getCanonicalSuspectKey(s)
        return (
          s.id === targetId ||
          key.canonicalId === targetId ||
          pinId.endsWith(s.id) ||
          pinId.endsWith(key.canonicalId)
        )
      })
      if (foundSuspect) {
        setEditingSuspect(foundSuspect)
        setIsAddSuspectOpen(true)
      }
    }
  }, [suspects, isReinvestigateUnlocked, onOpenReinvestigation, isIndictmentSolved, solvedCulprit])

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // CỐ ĐỊNH CÁC VỊ TRÍ SLOT NGHI PHẠM (Đồng bán kính, cân đối và thẩm mỹ tuyệt đối)
  const DESKTOP_SUSPECT_SLOTS = React.useMemo(() => [
    { x: 0.10, y: 0.36 }, // Slot 0: Lê Quang Vũ (Góc trái trên)
    { x: 0.26, y: 0.36 }, // Slot 1: Nguyễn Thanh Tùng (Góc phải trên)
    { x: 0.26, y: 0.68 }, // Slot 2: Trần Thị Hà (Góc phải dưới)
    { x: 0.10, y: 0.68 }, // Slot 3: Nguyễn Ngọc Mai (Góc trái dưới)
    { x: 0.18, y: 0.52 }, // Slot 4: Trần Văn Đạt (Đạt Gà) (Trung tâm)
    { x: 0.34, y: 0.52 }, // Slot 5: Nguyễn Thị Lụa (Phải giữa)
    { x: 0.02, y: 0.52 }, // Slot 6: Nguyễn Văn Khang (Trái giữa)
  ], [])

  const MOBILE_SUSPECT_SLOTS = React.useMemo(() => [
    { x: 0.15, y: 0.48 }, // Slot 0: Lê Quang Vũ
    { x: 0.40, y: 0.48 }, // Slot 1: Nguyễn Thanh Tùng
    { x: 0.65, y: 0.48 }, // Slot 2: Trần Thị Hà
    { x: 0.86, y: 0.48 }, // Slot 3: Nguyễn Ngọc Mai
    { x: 0.28, y: 0.64 }, // Slot 4: Trần Văn Đạt (Đạt Gà)
    { x: 0.72, y: 0.64 }, // Slot 5: Nguyễn Thị Lụa
    { x: 0.50, y: 0.64 }, // Slot 6: Nguyễn Văn Khang
  ], [])

  // Construct dynamic suspect pins with 100% deterministic, stationary slots
  const mobileSuspectPins: PinPoint[] = suspects.map((suspect) => {
    const { canonicalId, slotIndex, canonicalName } = getCanonicalSuspectKey(suspect)
    const slot = MOBILE_SUSPECT_SLOTS[slotIndex] || MOBILE_SUSPECT_SLOTS[0]
    return {
      id: `node-suspect-${canonicalId}`,
      x: slot.x,
      y: slot.y,
      label: canonicalName || suspect.name,
      detail: `Nghi phạm: ${canonicalName || suspect.name} (${suspect.clueIds.length} manh mối liên quan)`,
      color: 'yellow' as const,
    }
  })

  const desktopSuspectPins: PinPoint[] = suspects.map((suspect) => {
    const { canonicalId, slotIndex, canonicalName } = getCanonicalSuspectKey(suspect)
    const slot = DESKTOP_SUSPECT_SLOTS[slotIndex] || DESKTOP_SUSPECT_SLOTS[0]
    return {
      id: `node-suspect-${canonicalId}`,
      x: slot.x,
      y: slot.y,
      label: canonicalName || suspect.name,
      detail: `Nghi phạm: ${canonicalName || suspect.name} (${suspect.clueIds.length} manh mối liên quan)`,
      color: 'yellow' as const,
    }
  })

  // Tìm node suspect của Vũ và Tùng để nối dây
  const vuSuspect = suspects.find(
    (s) => s.name.toLowerCase().includes('vũ') || s.name.toLowerCase().includes('vu')
  )
  const tungSuspect = suspects.find(
    (s) => s.name.toLowerCase().includes('tùng') || s.name.toLowerCase().includes('tung')
  )

  // Dynamic Followup Pins cho Vũ và Tùng (Chỉ hiển thị khi có suspect tương ứng và ĐÃ THẨM TRA)
  const hasVuFollowup = !!vuSuspect && investigatedSuspects.includes('vu')
  const hasTungFollowup = !!tungSuspect && investigatedSuspects.includes('tung')

  const followupPinsMobile: PinPoint[] = [
    ...(hasVuFollowup
      ? [
          {
            id: 'c0-pin-followup-vu',
            x: 0.15,
            y: 0.64,
            label: 'Câu hỏi',
            detail: 'Câu hỏi suy luận mở rộng đối tượng Lê Quang Vũ',
            color: 'yellow' as const,
          },
        ]
      : []),
    ...(hasTungFollowup
      ? [
          {
            id: 'c0-pin-followup-tung',
            x: 0.40,
            y: 0.64,
            label: 'Câu hỏi',
            detail: 'Câu hỏi suy luận mở rộng đối tượng Nguyễn Thanh Tùng',
            color: 'yellow' as const,
          },
        ]
      : []),
  ]

  const followupPinsDesktop: PinPoint[] = [
    ...(hasVuFollowup
      ? [
          {
            id: 'c0-pin-followup-vu',
            x: 0.10,
            y: 0.50,
            label: 'Câu hỏi',
            detail: 'Câu hỏi suy luận mở rộng đối tượng Lê Quang Vũ',
            color: 'yellow' as const,
          },
        ]
      : []),
    ...(hasTungFollowup
      ? [
          {
            id: 'c0-pin-followup-tung',
            x: 0.26,
            y: 0.50,
            label: 'Câu hỏi',
            detail: 'Câu hỏi suy luận mở rộng đối tượng Nguyễn Thanh Tùng',
            color: 'yellow' as const,
          },
        ]
      : []),
  ]

  // Construct dynamic pins and connections combining main category pins, sub action pins, and suspect pins
  const customPins: PinPoint[] = isMobile
    ? [
        {
          id: 'c0-pin-suspects',
          x: 0.36,
          y: 0.32,
          label: 'Nghi phạm',
          detail: 'Thêm & xem danh sách nghi phạm vụ án',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-evidence',
          x: 0.78,
          y: 0.32,
          label: 'Bổ sung chứng cứ',
          detail: 'Chỉ dẫn nghiệp vụ & hướng dẫn mở khóa 2 nhánh chứng cứ',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-phone',
          x: 0.30,
          y: 0.16,
          label: 'Mở rộng điều tra',
          detail: phoneLookupSuccess
            ? 'Đã xác minh danh tính SĐT thành công'
            : 'Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang',
          color: phoneLookupSuccess ? ('blue' as const) : ('yellow' as const),
        },
        {
          id: 'c0-pin-reinvestigate',
          x: 0.76,
          y: 0.16,
          label: isReinvestigateUnlocked ? 'Khám xét lại' : 'Khám xét lại 🔒',
          detail: isReinvestigateUnlocked
            ? 'Mở biên bản tái khám xét hiện trường'
            : 'Khám xét lại hiện trường [Khóa — Cần trả lời xong câu hỏi của Vũ & Tùng]',
          color: isReinvestigateUnlocked ? ('yellow' as const) : ('black' as const),
        },
        {
          id: 'c0-pin-indictment',
          x: 0.74,
          y: 0.82,
          label: 'Đề nghị truy tố',
          detail: isIndictmentSolved
            ? 'Bản cáo trạng đã được Viện Kiểm sát phê chuẩn!'
            : 'Lập bản cáo trạng gửi Viện Kiểm sát',
          color: isIndictmentSolved ? ('blue' as const) : ('red' as const),
        },
        ...followupPinsMobile,
        ...mobileSuspectPins,
      ]
    : [
        {
          id: 'c0-pin-suspects',
          x: 0.18,
          y: 0.20,
          label: 'Nghi phạm',
          detail: 'Thêm & xem danh sách nghi phạm vụ án',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-evidence',
          x: 0.50,
          y: 0.20,
          label: 'Bổ sung chứng cứ',
          detail: 'Chỉ dẫn nghiệp vụ & hướng dẫn mở khóa 2 nhánh chứng cứ',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-indictment',
          x: 0.82,
          y: 0.20,
          label: 'Đề nghị truy tố',
          detail: isIndictmentSolved
            ? 'Bản cáo trạng đã được Viện Kiểm sát phê chuẩn!'
            : 'Lập bản cáo trạng gửi Viện Kiểm sát',
          color: isIndictmentSolved ? ('blue' as const) : ('red' as const),
        },
        ...followupPinsDesktop,
        {
          id: 'c0-pin-phone',
          x: 0.48,
          y: 0.70,
          label: 'Mở rộng điều tra',
          detail: phoneLookupSuccess
            ? 'Đã xác minh danh tính SĐT thành công'
            : 'Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang',
          color: phoneLookupSuccess ? ('blue' as const) : ('yellow' as const),
        },
        {
          id: 'c0-pin-reinvestigate',
          x: 0.76,
          y: 0.70,
          label: isReinvestigateUnlocked ? 'Khám xét lại' : 'Khám xét lại 🔒',
          detail: isReinvestigateUnlocked
            ? 'Mở biên bản tái khám xét hiện trường'
            : 'Khám xét lại hiện trường [Khóa — Cần trả lời xong câu hỏi của Vũ & Tùng]',
          color: isReinvestigateUnlocked ? ('yellow' as const) : ('black' as const),
        },
        ...desktopSuspectPins,
      ]

  const customConnections: CaseConnection[] = [
    { id: 'c0-conn-phone', fromPinId: 'c0-pin-evidence', toPinId: 'c0-pin-phone' },
    { id: 'c0-conn-reinvestigate', fromPinId: 'c0-pin-evidence', toPinId: 'c0-pin-reinvestigate' },
    ...(hasVuFollowup && vuSuspect
      ? [
          {
            id: 'c0-conn-followup-vu',
            fromPinId: `node-suspect-${getCanonicalSuspectKey(vuSuspect).canonicalId}`,
            toPinId: 'c0-pin-followup-vu',
          },
        ]
      : []),
    ...(hasTungFollowup && tungSuspect
      ? [
          {
            id: 'c0-conn-followup-tung',
            fromPinId: `node-suspect-${getCanonicalSuspectKey(tungSuspect).canonicalId}`,
            toPinId: 'c0-pin-followup-tung',
          },
        ]
      : []),
    ...suspects.map((suspect) => {
      const { canonicalId } = getCanonicalSuspectKey(suspect)
      return {
        id: `c0-conn-suspect-${canonicalId}`,
        fromPinId: 'c0-pin-suspects',
        toPinId: `node-suspect-${canonicalId}`,
      }
    }),
  ]

  return (
    <div className="w-full h-full min-h-[580px] relative rounded-xl border border-[#523924] overflow-hidden flex flex-col font-sans select-none shadow-[0_20px_60px_rgba(0,0,0,0.95)] bg-[#0f0b08]">
      {/* TOP ATMOSPHERIC HEADER */}
      <div className="relative z-20 bg-[#140e09]/95 backdrop-blur-md px-4 py-2.5 border-b border-[#3b2616] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
          <h2 className="font-sans font-bold text-xs text-[#fef5ec] tracking-wider uppercase">
            BẢNG CHỨNG CỨ VỤ ÁN // HERO INTERACTIVE BOARD (CASE #000)
          </h2>
        </div>
      </div>

      {/* 100% AUTHENTIC HEROINTERACTIVE LANDING PAGE CANVAS ENGINE */}
      <div className="flex-1 w-full h-full relative z-10 overflow-hidden">
        <HeroInteractive
          className="w-full h-full rounded-none border-none"
          controlledCaseId="case-000"
          customBgImage="/images/crime_scene_outline_bg.jpg"
          customPins={customPins}
          customConnections={customConnections}
          onPinClick={handlePinClick}
        />
      </div>

      {/* MODALS INTEGRATION */}
      <AddSuspectModal
        key={isAddSuspectOpen ? (editingSuspect ? editingSuspect.id : 'new-suspect-form') : 'closed'}
        isOpen={isAddSuspectOpen}
        onClose={() => {
          setIsAddSuspectOpen(false)
          setEditingSuspect(null)
        }}
        onSave={handleSaveSuspect}
        onDelete={handleDeleteSuspect}
        editingSuspect={editingSuspect}
        existingSuspects={suspects}
        onSelectSuspect={(s) => setEditingSuspect(s)}
        onSubmitConclusion={(culprit) => {
          detectiveAudio.playStampSound()
          detectiveAudio.playUnlockJingle()
          setIsReinvestigateUnlocked(true)
          setInvestigatedSuspects((prev) => {
            const next = Array.from(new Set([...prev, culprit]))
            try {
              localStorage.setItem('veritas_investigated_suspects', JSON.stringify(next))
            } catch {}
            return next
          })
          try {
            localStorage.setItem('veritas_reinvestigate_unlocked', 'true')
          } catch {}
          setNarrativeCulprit(culprit)
          setIsEpilogueOpen(true)
        }}
      />

      <PhoneLookupModal
        isOpen={isPhoneLookupOpen}
        onClose={() => setIsPhoneLookupOpen(false)}
        onSuccess={handlePhoneLookupSuccess}
        onOpenPhoneSimulator={onOpenPhoneSimulator}
      />

      <PhoneNarrativeModal
        isOpen={isPhoneNarrativeOpen}
        onClose={() => setIsPhoneNarrativeOpen(false)}
      />

      <EvidenceGuideModal
        isOpen={isEvidenceGuideOpen}
        onClose={() => setIsEvidenceGuideOpen(false)}
        isPhoneSolved={phoneLookupSuccess}
        isReinvestigateUnlocked={isReinvestigateUnlocked}
        onOpenPhoneLookup={() => setIsPhoneLookupOpen(true)}
        onOpenReinvestigation={onOpenReinvestigation}
      />

      <IndictmentModal
        isOpen={isIndictmentOpen}
        onClose={() => setIsIndictmentOpen(false)}
        onSubmitIndictment={handleSubmitIndictment}
      />

      <CulpritEpilogueModal
        isOpen={isEpilogueOpen}
        culprit={narrativeCulprit || activeFollowupCulprit || solvedCulprit}
        onClose={() => {
          setIsEpilogueOpen(false)
          setNarrativeCulprit(null)
        }}
        onOpenDossier={handleOpenDossier}
        onOpenFollowupQuestion={() => setIsFollowupQuestionOpen(true)}
      />

      <DossierResultModal
        isOpen={isDossierOpen}
        dossierType={activeDossierType}
        onClose={() => setIsDossierOpen(false)}
        onOpenFollowupQuestion={() => setIsFollowupQuestionOpen(true)}
      />

      <FollowupQuestionModal
        isOpen={isFollowupQuestionOpen}
        culprit={activeFollowupCulprit || solvedCulprit || 'vu'}
        onClose={() => setIsFollowupQuestionOpen(false)}
        onOpenDossier={handleOpenDossier}
        onSuccess={handleFollowupSuccess}
      />
    </div>
  )
}
