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
import { ReinvestigationModal } from '@/components/investigation/evidence/reinvestigation-modal'
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
  const [isReinvestigateModalOpen, setIsReinvestigateModalOpen] = useState(false)
  const [hasOpenedReinvestigation, setHasOpenedReinvestigation] = useState(false)
  const [phoneLookupSuccess, setPhoneLookupSuccess] = useState(false)

  // Indictment & Epilogue state
  const [isIndictmentSolved, setIsIndictmentSolved] = useState(false)
  const [solvedCulprit, setSolvedCulprit] = useState<'vu' | 'tung' | 'ha' | null>(null)
  const [isEpilogueOpen, setIsEpilogueOpen] = useState(false)
  const [isDossierOpen, setIsDossierOpen] = useState(false)
  const [activeDossierType, setActiveDossierType] = useState<'A' | 'B' | 'C' | null>(null)
  const [isFollowupQuestionOpen, setIsFollowupQuestionOpen] = useState(false)
  const [isEvidenceGuideOpen, setIsEvidenceGuideOpen] = useState(false)
  const [isPhoneNarrativeOpen, setIsPhoneNarrativeOpen] = useState(false)

  const [investigatedSuspects, setInvestigatedSuspects] = useState<('vu' | 'tung' | 'ha')[]>([])
  const [solvedFollowupQuestions, setSolvedFollowupQuestions] = useState<('vu' | 'tung' | 'ha')[]>([])
  const [activeFollowupCulprit, setActiveFollowupCulprit] = useState<'vu' | 'tung' | 'ha' | null>(null)
  const [narrativeCulprit, setNarrativeCulprit] = useState<'vu' | 'tung' | 'ha' | null>(null)
  const [narrativeChoice, setNarrativeChoice] = useState<string | null>(null)

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
      return { canonicalId: 'dat', slotIndex: 4, canonicalName: 'Trần Văn Đạt' }
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
      const savedReinvestigateUnlocked = localStorage.getItem('veritas_reinvestigate_unlocked')
      if (savedReinvestigateUnlocked === 'true') {
        setIsReinvestigateUnlocked(true)
      }
      const savedReinvestigateOpened = localStorage.getItem('veritas_reinvestigate_opened')
      if (savedReinvestigateOpened === 'true') {
        setHasOpenedReinvestigation(true)
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
      const savedCulprit = localStorage.getItem('veritas_indictment_culprit') as 'vu' | 'tung' | 'ha' | null
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
      const culpritType: 'vu' | 'tung' | 'ha' | null =
        lower.includes('vũ') || lower.includes('vu')
          ? 'vu'
          : lower.includes('tùng') || lower.includes('tung')
          ? 'tung'
          : lower.includes('hà') || lower.includes('ha')
          ? 'ha'
          : null

      if (culpritType) {
        const remainingHasCulprit = updated.some((s) => {
          const l = s.name.toLowerCase()
          return culpritType === 'vu'
            ? l.includes('vũ') || l.includes('vu')
            : culpritType === 'tung'
            ? l.includes('tùng') || l.includes('tung')
            : l.includes('hà') || l.includes('ha')
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

  const handleFollowupSuccess = (culprit: 'vu' | 'tung' | 'ha', choice?: string) => {
    const updated = Array.from(new Set([...solvedFollowupQuestions, culprit]))
    setSolvedFollowupQuestions(updated)
    try {
      localStorage.setItem('veritas_solved_followups', JSON.stringify(updated))
      if (choice) {
        localStorage.setItem(`veritas_followup_${culprit}_choice`, choice)
      }
    } catch {}

    if (updated.includes('vu') && updated.includes('tung')) {
      setIsReinvestigateUnlocked(true)
      try {
        localStorage.setItem('veritas_reinvestigate_unlocked', 'true')
      } catch {}
    }

    // Đóng câu hỏi và mở DẪN TRUYỆN toàn màn hình của đối tượng
    setIsFollowupQuestionOpen(false)
    setNarrativeCulprit(culprit)
    setNarrativeChoice(choice || null)
    setIsEpilogueOpen(true)
  }

  const handleSubmitIndictment = (data: {
    culprit: 'vu' | 'tung' | 'ha'
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

  const handleOpenDossier = (dossierType: 'A' | 'B' | 'C') => {
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
    setNarrativeChoice(null)
    setIsIndictmentSolved(false)
    setSolvedCulprit(null)
    setIsReinvestigateUnlocked(false)
    setIsReinvestigateModalOpen(false)
    setHasOpenedReinvestigation(false)
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
      localStorage.removeItem('veritas_followup_ha')
      localStorage.removeItem('veritas_followup_ha_matches')
      localStorage.removeItem('veritas_followup_tung_choice')
      localStorage.removeItem('veritas_followup_vu_choice')
      localStorage.removeItem('veritas_followup_ha_choice')
      localStorage.removeItem('veritas_indictment_solved')
      localStorage.removeItem('veritas_indictment_culprit')
      localStorage.removeItem('veritas_reinvestigate_unlocked')
      localStorage.removeItem('veritas_reinvestigate_opened')
      localStorage.removeItem('veritas_phone_inputs')
      localStorage.removeItem('khang_phone_pinned_clues')
      localStorage.removeItem('veritas_custom_notes')
      localStorage.removeItem('veritas_discovered_findings')
      localStorage.removeItem('veritas_completed_checkpoints')
    } catch {}
  }

  const handleOpenReinvestigation = useCallback(() => {
    setIsReinvestigateModalOpen(true)
    setHasOpenedReinvestigation(true)
    try {
      localStorage.setItem('veritas_reinvestigate_opened', 'true')
    } catch {}
    if (onOpenReinvestigation) {
      onOpenReinvestigation()
    }
  }, [onOpenReinvestigation])

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
      if (isReinvestigateUnlocked) {
        detectiveAudio.playGlassSound()
        handleOpenReinvestigation()
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
    } else if (pinId === 'c0-pin-followup-ha') {
      setActiveFollowupCulprit('ha')
      setIsFollowupQuestionOpen(true)
    } else if (pinId.startsWith('c0-pin-followup')) {
      const c = pinId.includes('ha') ? 'ha' : pinId.includes('tung') ? 'tung' : 'vu'
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
  // CỐ ĐỊNH CÁC VỊ TRÍ SLOT NGHI PHẠM (Xếp hàng ngang tự nhiên với độ cao lệch nhẹ)
  const DESKTOP_SUSPECT_SLOTS = React.useMemo(() => [
    { x: 0.48, y: 0.520 }, // Slot 0: Lê Quang Vũ
    { x: 0.65, y: 0.485 }, // Slot 1: Nguyễn Thanh Tùng (Lệch lên)
    { x: 0.82, y: 0.535 }, // Slot 2: Trần Thị Hà (Lệch xuống)
    { x: 0.15, y: 0.725 }, // Slot 3: Nguyễn Ngọc Mai
    { x: 0.31, y: 0.495 }, // Slot 4: Trần Văn Đạt (Đạt Gà) — Nằm bên trái Lê Quang Vũ (Lệch lên)
    { x: 0.16, y: 0.535 }, // Slot 5: Nguyễn Thị Lụa — Nằm bên trái Trần Văn Đạt (Lệch xuống)
    { x: 0.94, y: 0.480 }, // Slot 6: Nguyễn Văn Khang (Mé phải viền bảng)
  ], [])

  const MOBILE_SUSPECT_SLOTS = React.useMemo(() => [
    { x: 0.48, y: 0.520 }, // Slot 0: Lê Quang Vũ
    { x: 0.65, y: 0.485 }, // Slot 1: Nguyễn Thanh Tùng
    { x: 0.82, y: 0.535 }, // Slot 2: Trần Thị Hà
    { x: 0.15, y: 0.725 }, // Slot 3: Nguyễn Ngọc Mai
    { x: 0.31, y: 0.495 }, // Slot 4: Trần Văn Đạt (Đạt Gà) — Nằm bên trái Lê Quang Vũ
    { x: 0.16, y: 0.535 }, // Slot 5: Nguyễn Thị Lụa — Nằm bên trái Trần Văn Đạt
    { x: 0.94, y: 0.480 }, // Slot 6: Nguyễn Văn Khang
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

  // Tìm node suspect của Vũ, Tùng và Hà để nối dây
  const vuSuspect = suspects.find(
    (s) => s.name.toLowerCase().includes('vũ') || s.name.toLowerCase().includes('vu')
  )
  const tungSuspect = suspects.find(
    (s) => s.name.toLowerCase().includes('tùng') || s.name.toLowerCase().includes('tung')
  )
  const haSuspect = suspects.find(
    (s) => s.name.toLowerCase().includes('hà') || s.name.toLowerCase().includes('ha')
  )

  // Dynamic Followup Pins cho Vũ, Tùng và Hà (Chỉ hiển thị khi có suspect tương ứng và ĐÃ THẨM TRA)
  const hasVuFollowup = !!vuSuspect && investigatedSuspects.includes('vu')
  const hasTungFollowup = !!tungSuspect && investigatedSuspects.includes('tung')
  const hasHaFollowup = !!haSuspect && investigatedSuspects.includes('ha')

  const followupPinsMobile: PinPoint[] = [
    ...(hasVuFollowup
      ? [
          {
            id: 'c0-pin-followup-vu',
            x: 0.48,
            y: 0.710,
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
            x: 0.65,
            y: 0.670,
            label: 'Câu hỏi',
            detail: 'Câu hỏi suy luận mở rộng đối tượng Nguyễn Thanh Tùng',
            color: 'yellow' as const,
          },
        ]
      : []),
    ...(hasHaFollowup
      ? [
          {
            id: 'c0-pin-followup-ha',
            x: 0.82,
            y: 0.730,
            label: 'Câu hỏi',
            detail: 'Khớp nối chứng cứ đối tượng Trần Thị Hà',
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
            x: 0.48,
            y: 0.710,
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
            x: 0.65,
            y: 0.670,
            label: 'Câu hỏi',
            detail: 'Câu hỏi suy luận mở rộng đối tượng Nguyễn Thanh Tùng',
            color: 'yellow' as const,
          },
        ]
      : []),
    ...(hasHaFollowup
      ? [
          {
            id: 'c0-pin-followup-ha',
            x: 0.82,
            y: 0.730,
            label: 'Câu hỏi',
            detail: 'Khớp nối chứng cứ đối tượng Trần Thị Hà',
            color: 'yellow' as const,
          },
        ]
      : []),
  ]

  // Construct dynamic pins and connections combining main category pins, sub action pins, and suspect pins
  const isReinvestigateBlinking = isReinvestigateUnlocked && !hasOpenedReinvestigation

  const customPins: PinPoint[] = isMobile
    ? [
        {
          id: 'c0-pin-evidence',
          x: 0.25,
          y: 0.18,
          label: 'Bổ sung chứng cứ',
          detail: 'Chỉ dẫn nghiệp vụ & hướng dẫn các thao tác mở rộng điều tra',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-suspects',
          x: 0.65,
          y: 0.30,
          label: 'Nghi phạm',
          detail: 'Thêm & xem danh sách nghi phạm vụ án',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-phone',
          x: 0.58,
          y: 0.18,
          label: 'Mở rộng điều tra',
          detail: phoneLookupSuccess
            ? 'Đã xác minh danh tính SĐT thành công'
            : 'Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang',
          color: phoneLookupSuccess ? ('blue' as const) : ('yellow' as const),
        },
        {
          id: 'c0-pin-reinvestigate',
          x: 0.25,
          y: 0.32,
          label: isReinvestigateUnlocked ? 'Khám xét lại' : 'Khám xét lại 🔒',
          detail: isReinvestigateUnlocked
            ? 'Mở biên bản tái khám xét hiện trường'
            : 'Khám xét lại hiện trường [Khóa — Cần trả lời xong câu hỏi của Vũ & Tùng]',
          color: isReinvestigateUnlocked ? ('yellow' as const) : ('black' as const),
          noteColor: isReinvestigateUnlocked ? ('yellow' as const) : ('black' as const),
          pinColor: 'yellow' as const,
          pulseBorder: isReinvestigateBlinking,
        },
        {
          id: 'c0-pin-indictment',
          x: 0.25,
          y: 0.68,
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
          id: 'c0-pin-evidence',
          x: 0.25,
          y: 0.18,
          label: 'Bổ sung chứng cứ',
          detail: 'Chỉ dẫn nghiệp vụ & hướng dẫn các thao tác mở rộng điều tra',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-suspects',
          x: 0.65,
          y: 0.30,
          label: 'Nghi phạm',
          detail: 'Thêm & xem danh sách nghi phạm vụ án',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-indictment',
          x: 0.25,
          y: 0.68,
          label: 'Đề nghị truy tố',
          detail: isIndictmentSolved
            ? 'Bản cáo trạng đã được Viện Kiểm sát phê chuẩn!'
            : 'Lập bản cáo trạng gửi Viện Kiểm sát',
          color: isIndictmentSolved ? ('blue' as const) : ('red' as const),
        },
        ...followupPinsDesktop,
        {
          id: 'c0-pin-phone',
          x: 0.58,
          y: 0.18,
          label: 'Mở rộng điều tra',
          detail: phoneLookupSuccess
            ? 'Đã xác minh danh tính SĐT thành công'
            : 'Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang',
          color: phoneLookupSuccess ? ('blue' as const) : ('yellow' as const),
        },
        {
          id: 'c0-pin-reinvestigate',
          x: 0.25,
          y: 0.32,
          label: isReinvestigateUnlocked ? 'Khám xét lại' : 'Khám xét lại 🔒',
          detail: isReinvestigateUnlocked
            ? 'Mở biên bản tái khám xét hiện trường'
            : 'Khám xét lại hiện trường [Khóa — Cần trả lời xong câu hỏi của Vũ & Tùng]',
          color: isReinvestigateUnlocked ? ('yellow' as const) : ('black' as const),
          noteColor: isReinvestigateUnlocked ? ('yellow' as const) : ('black' as const),
          pinColor: 'yellow' as const,
          pulseBorder: isReinvestigateBlinking,
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
    ...(hasHaFollowup && haSuspect
      ? [
          {
            id: 'c0-conn-followup-ha',
            fromPinId: `node-suspect-${getCanonicalSuspectKey(haSuspect).canonicalId}`,
            toPinId: 'c0-pin-followup-ha',
          },
        ]
      : []),
    ...suspects.map((suspect) => {
      const { canonicalId } = getCanonicalSuspectKey(suspect)
      return {
        id: `c0-conn-${canonicalId}`,
        fromPinId: 'c0-pin-suspects',
        toPinId: `node-suspect-${canonicalId}`,
      }
    }),
  ]

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
      {/* Top Banner Toolbar */}
      <div className="absolute top-3 left-4 z-20 flex items-center pointer-events-none">
        <div className="flex items-center gap-2 bg-[#1b140e]/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#593c26]/60 text-xs text-[#d9a066] font-mono shadow-lg pointer-events-auto">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold tracking-wide">CASE 000 — BẢNG ĐIỀU TRA MANH MỐI</span>
        </div>
      </div>

      {/* Main Interactive Pinboard Canvas */}
      <HeroInteractive
        className="w-full h-full"
        controlledCaseId="case-00"
        customPins={customPins}
        customConnections={customConnections}
        onPinClick={handlePinClick}
      />

      {/* Modals & Narrative Layers */}
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
            const next = Array.from(new Set([...prev, culprit])) as ('vu' | 'tung' | 'ha')[]
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
      />

      <ReinvestigationModal
        isOpen={isReinvestigateModalOpen}
        onClose={() => setIsReinvestigateModalOpen(false)}
      />

      <IndictmentModal
        isOpen={isIndictmentOpen}
        onClose={() => setIsIndictmentOpen(false)}
        onSubmitIndictment={handleSubmitIndictment}
      />

      <CulpritEpilogueModal
        isOpen={isEpilogueOpen}
        culprit={narrativeCulprit || activeFollowupCulprit || solvedCulprit}
        choice={narrativeChoice}
        onClose={() => {
          setIsEpilogueOpen(false)
          setNarrativeCulprit(null)
          setNarrativeChoice(null)
        }}
        onOpenDossier={handleOpenDossier}
        onOpenFollowupQuestion={() => setIsFollowupQuestionOpen(true)}
        onOpenIndictment={() => {
          setIsEpilogueOpen(false)
          setNarrativeCulprit(null)
          setNarrativeChoice(null)
          setIsIndictmentOpen(true)
        }}
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
        onSuccess={handleFollowupSuccess}
        onOpenDossier={handleOpenDossier}
      />
    </div>
  )
}
