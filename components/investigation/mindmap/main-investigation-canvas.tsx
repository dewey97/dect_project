'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Home, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeroInteractive, type PinPoint, type CaseConnection } from '@/components/investigation/hero-interactive'
import { AddSuspectModal } from './add-suspect-modal'
import { PhoneLookupModal } from './phone-lookup-modal'
import { PhoneNarrativeModal } from './phone-narrative-modal'
import { DossierEModal } from './dossier-e-modal'
import { EvidenceGuideModal } from './evidence-guide-modal'
import { IndictmentModal } from './indictment-modal'
import { CulpritEpilogueModal } from './culprit-epilogue-modal'
import { DossierResultModal } from './dossier-result-modal'
import { FollowupQuestionModal } from './followup-question-modal'
import { ReinvestigationModal } from '@/components/investigation/evidence/reinvestigation-modal'
import { getCanonicalSuspectKey, findValidCaseCharacter } from '@/lib/cases/case-000-suspects'
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
  const router = useRouter()
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
  const [isDossierEOpen, setIsDossierEOpen] = useState(false)
  const [zoomedPhotoUrl, setZoomedPhotoUrl] = useState<string | null>(null)
  const zoomOpenTimeRef = React.useRef<number>(0)

  const handleOpenPhotoZoom = useCallback((url: string) => {
    zoomOpenTimeRef.current = Date.now()
    setZoomedPhotoUrl(url)
  }, [])

  useEffect(() => {
    if (!zoomedPhotoUrl) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        detectiveAudio.playPaperRustle()
        setZoomedPhotoUrl(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoomedPhotoUrl])

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
  const sanitizeSuspectsList = (items: SuspectItem[]): SuspectItem[] => {
    const map = new Map<string, SuspectItem>()
    for (const s of items) {
      if (!s || !s.name) continue
      const matchedChar = findValidCaseCharacter(s.name || s.id)
      if (!matchedChar || matchedChar.id === 'khang') continue
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
      const isPhoneSolved = localStorage.getItem('veritas_phone_solved') === 'true'
      if (savedPhone || isPhoneSolved) {
        try {
          if (savedPhone) {
            const parsed = JSON.parse(savedPhone)
            if (parsed.phone1 || parsed.phone2 || parsed.phone3) {
              setPhoneLookupSuccess(true)
            } else if (isPhoneSolved) {
              setPhoneLookupSuccess(true)
            }
          } else if (isPhoneSolved) {
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
    const matchedChar = findValidCaseCharacter(savedSuspect.name || savedSuspect.id)
    if (!matchedChar || matchedChar.id === 'khang') return

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
  const handlePinClick = useCallback((pinId: string, pin?: PinPoint) => {
    detectiveAudio.playPaperRustle()

    if (pinId === 'c0-pin-suspects') {
      setEditingSuspect(null)
      setIsAddSuspectOpen(true)
    } else if (pinId === 'c0-pin-evidence') {
      setIsEvidenceGuideOpen(true)
    } else if (pinId === 'c0-pin-phone') {
      if (phoneLookupSuccess) {
        setIsDossierEOpen(true)
      } else {
        setIsPhoneLookupOpen(true)
      }
    } else if (pinId === 'c0-pin-crime-scene' || pinId.includes('crime-scene') || pinId.includes('thi-the')) {
      handleOpenPhotoZoom('/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_straight.png')
    } else if (pinId === 'c0-pin-victim-khang' || pinId.includes('khang')) {
      handleOpenPhotoZoom('/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang_straight.png')
    } else if (pinId === 'c0-pin-reinvestigate') {
      if (isReinvestigateUnlocked) {
        detectiveAudio.playGlassSound()
        handleOpenReinvestigation()
      } else {
        detectiveAudio.playGlassSound()
        setIsEvidenceGuideOpen(true)
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
    } else if (pinId.includes('followup') || pinId.includes('question')) {
      const c = pinId.includes('ha') ? 'ha' : pinId.includes('tung') ? 'tung' : (activeFollowupCulprit || 'vu')
      setActiveFollowupCulprit(c)
      setIsFollowupQuestionOpen(true)
    } else if (pinId.startsWith('node-suspect-')) {
      const targetId = pinId.replace('node-suspect-', '')
      if (targetId === 'suspect-khang' || targetId === 'khang' || pinId.includes('khang')) {
        handleOpenPhotoZoom('/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang_straight.png')
        return
      }
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
  }, [suspects, isReinvestigateUnlocked, handleOpenReinvestigation, isIndictmentSolved, solvedCulprit, phoneLookupSuccess, activeFollowupCulprit])

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // CỐ ĐỊNH CÁC VỊ TRÍ SLOT NGHI PHẠM (Được căn lề chuẩn theo phác thảo sketch, an toàn bên trong khung gỗ)
  const DESKTOP_SUSPECT_SLOTS = React.useMemo(() => [
    { x: 0.44, y: 0.62 }, // Slot 0: Lê Quang Vũ
    { x: 0.60, y: 0.58 }, // Slot 1: Nguyễn Thanh Tùng
    { x: 0.76, y: 0.65 }, // Slot 2: Trần Thị Hà
    { x: 0.76, y: 0.44 }, // Slot 3: Nguyễn Ngọc Mai
    { x: 0.23, y: 0.62 }, // Slot 4: Trần Văn Đạt — Nằm dưới Bà Lụa
    { x: 0.26, y: 0.48 }, // Slot 5: Nguyễn Thị Lụa
    { x: 0.64, y: 0.24 }, // Slot 6: Nguyễn Văn Khang (Nạn nhân)
    { x: 0.76, y: 0.44 }, // Slot 7: Thảo Vy
  ], [])

  const MOBILE_SUSPECT_SLOTS = React.useMemo(() => [
    { x: 0.44, y: 0.62 }, // Slot 0: Lê Quang Vũ
    { x: 0.60, y: 0.58 }, // Slot 1: Nguyễn Thanh Tùng
    { x: 0.76, y: 0.65 }, // Slot 2: Trần Thị Hà
    { x: 0.76, y: 0.44 }, // Slot 3: Nguyễn Ngọc Mai
    { x: 0.23, y: 0.62 }, // Slot 4: Trần Văn Đạt
    { x: 0.26, y: 0.48 }, // Slot 5: Nguyễn Thị Lụa
    { x: 0.64, y: 0.24 }, // Slot 6: Nguyễn Văn Khang
    { x: 0.76, y: 0.44 }, // Slot 7: Thảo Vy
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
      color: 'blue' as const,
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
      color: 'blue' as const,
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

  // Dynamic Followup Pins cho Vũ, Tùng và Hà (Kéo xuống vùng dưới đáy bảng)
  const hasVuFollowup = !!vuSuspect && investigatedSuspects.includes('vu')
  const hasTungFollowup = !!tungSuspect && investigatedSuspects.includes('tung')
  const hasHaFollowup = !!haSuspect && investigatedSuspects.includes('ha')

  const followupPinsMobile: PinPoint[] = [
    ...(hasVuFollowup
      ? [
          {
            id: 'c0-pin-followup-vu',
            x: 0.44,
            y: 0.80,
            label: 'Nghi vấn',
            detail: 'Nghi vấn suy luận mở rộng đối tượng Lê Quang Vũ',
            color: 'purple' as const,
            noteColor: 'yellow' as const,
          },
        ]
      : []),
    ...(hasTungFollowup
      ? [
          {
            id: 'c0-pin-followup-tung',
            x: 0.60,
            y: 0.78,
            label: 'Nghi vấn',
            detail: 'Nghi vấn suy luận mở rộng đối tượng Nguyễn Thanh Tùng',
            color: 'purple' as const,
            noteColor: 'yellow' as const,
          },
        ]
      : []),
    ...(hasHaFollowup
      ? [
          {
            id: 'c0-pin-followup-ha',
            x: 0.76,
            y: 0.80,
            label: 'Nghi vấn',
            detail: 'Khớp nối chứng cứ đối tượng Trần Thị Hà',
            color: 'purple' as const,
            noteColor: 'yellow' as const,
          },
        ]
      : []),
  ]

  const followupPinsDesktop: PinPoint[] = [
    ...(hasVuFollowup
      ? [
          {
            id: 'c0-pin-followup-vu',
            x: 0.44,
            y: 0.80,
            label: 'Nghi vấn',
            detail: 'Nghi vấn suy luận mở rộng đối tượng Lê Quang Vũ',
            color: 'purple' as const,
            noteColor: 'yellow' as const,
          },
        ]
      : []),
    ...(hasTungFollowup
      ? [
          {
            id: 'c0-pin-followup-tung',
            x: 0.60,
            y: 0.78,
            label: 'Nghi vấn',
            detail: 'Nghi vấn suy luận mở rộng đối tượng Nguyễn Thanh Tùng',
            color: 'purple' as const,
            noteColor: 'yellow' as const,
          },
        ]
      : []),
    ...(hasHaFollowup
      ? [
          {
            id: 'c0-pin-followup-ha',
            x: 0.76,
            y: 0.80,
            label: 'Nghi vấn',
            detail: 'Khớp nối chứng cứ đối tượng Trần Thị Hà',
            color: 'purple' as const,
            noteColor: 'yellow' as const,
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
          x: 0.20,
          y: 0.18,
          label: 'Bổ sung chứng cứ',
          detail: 'Chỉ dẫn nghiệp vụ & hướng dẫn các thao tác mở rộng điều tra',
          color: 'red' as const,
          noteColor: 'yellow' as const,
        },
        {
          id: 'c0-pin-phone',
          x: 0.42,
          y: 0.27,
          label: 'Mở rộng điều tra',
          detail: phoneLookupSuccess
            ? 'Đã xác minh danh tính SĐT thành công'
            : 'Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang',
          color: phoneLookupSuccess ? ('cyan' as const) : ('yellow' as const),
          noteColor: 'white' as const,
          isSolved: phoneLookupSuccess,
        },
        {
          id: 'c0-pin-victim-khang',
          x: 0.55,
          y: 0.12,
          label: 'Nạn nhân Nguyễn Văn Khang',
          detail: 'Nạn nhân vụ án — Thi thể được phát hiện tại bờ sông xóm Chài',
          color: 'red' as const,
          photoUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png',
        },
        {
          id: 'c0-pin-crime-scene',
          x: 0.73,
          y: 0.21,
          label: 'Hiện trường thi thể',
          detail: 'Ảnh hiện trường khám nghiệm tử thi và vệt máu trên sàn',
          color: 'orange' as const,
          photoUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_v2.png',
        },
        {
          id: 'c0-pin-reinvestigate',
          x: 0.20,
          y: 0.35,
          label: isReinvestigateUnlocked ? 'Khám xét lại' : 'Khám xét lại (Chờ phê duyệt)',
          detail: isReinvestigateUnlocked
            ? 'Mở biên bản tái khám xét hiện trường'
            : 'Khám xét lại hiện trường [Chờ phê duyệt lệnh — Cần trả lời xong câu hỏi của Vũ & Tùng]',
          color: isReinvestigateUnlocked ? ('yellow' as const) : ('dark' as const),
          noteColor: 'white' as const,
          pinColor: isReinvestigateUnlocked ? ('yellow' as const) : ('dark' as const),
          pulseBorder: isReinvestigateBlinking,
          isLocked: !isReinvestigateUnlocked,
        },
        {
          id: 'c0-pin-suspects',
          x: 0.58,
          y: 0.38,
          label: 'Nghi phạm',
          detail: 'Thêm & xem danh sách nghi phạm vụ án',
          color: 'red' as const,
          pinColor: 'red' as const,
          noteColor: 'yellow' as const,
        },
        {
          id: 'c0-pin-indictment',
          x: 0.22,
          y: 0.80,
          label: 'Bản kết luận điều tra',
          detail: isIndictmentSolved
            ? 'Bản cáo trạng đã được Viện Kiểm sát phê chuẩn!'
            : 'Lập bản cáo trạng gửi Viện Kiểm sát',
          color: 'red' as const,
          pinColor: 'red' as const,
          noteColor: 'white' as const,
        },
        ...followupPinsMobile,
        ...mobileSuspectPins,
      ]
    : [
        {
          id: 'c0-pin-evidence',
          x: 0.20,
          y: 0.18,
          label: 'Bổ sung chứng cứ',
          detail: 'Chỉ dẫn nghiệp vụ & hướng dẫn các thao tác mở rộng điều tra',
          color: 'red' as const,
          pinColor: 'red' as const,
          noteColor: 'yellow' as const,
        },
        {
          id: 'c0-pin-phone',
          x: 0.42,
          y: 0.27,
          label: 'Mở rộng điều tra',
          detail: phoneLookupSuccess
            ? 'Đã xác minh danh tính SĐT thành công'
            : 'Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang',
          color: 'yellow' as const,
          pinColor: 'yellow' as const,
          noteColor: 'white' as const,
          isSolved: phoneLookupSuccess,
        },
        {
          id: 'c0-pin-victim-khang',
          x: 0.55,
          y: 0.12,
          label: 'Nạn nhân Nguyễn Văn Khang',
          detail: 'Nạn nhân vụ án — Thi thể được phát hiện tại bờ sông xóm Chài',
          color: 'yellow' as const,
          pinColor: 'yellow' as const,
          photoUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png',
        },
        {
          id: 'c0-pin-crime-scene',
          x: 0.73,
          y: 0.21,
          label: 'Hiện trường thi thể',
          detail: 'Ảnh hiện trường khám nghiệm tử thi và vệt máu trên sàn',
          color: 'yellow' as const,
          pinColor: 'yellow' as const,
          photoUrl: '/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_v2.png',
        },
        {
          id: 'c0-pin-reinvestigate',
          x: 0.20,
          y: 0.35,
          label: isReinvestigateUnlocked ? 'Khám xét lại' : 'Khám xét lại (Chờ phê duyệt)',
          detail: isReinvestigateUnlocked
            ? 'Mở biên bản tái khám xét hiện trường'
            : 'Khám xét lại hiện trường [Chờ phê duyệt lệnh — Cần trả lời xong câu hỏi của Vũ & Tùng]',
          color: isReinvestigateUnlocked ? ('yellow' as const) : ('dark' as const),
          noteColor: 'white' as const,
          pinColor: isReinvestigateUnlocked ? ('yellow' as const) : ('dark' as const),
          pulseBorder: isReinvestigateBlinking,
          isLocked: !isReinvestigateUnlocked,
        },
        {
          id: 'c0-pin-suspects',
          x: 0.58,
          y: 0.38,
          label: 'Nghi phạm',
          detail: 'Thêm & xem danh sách nghi phạm vụ án',
          color: 'yellow' as const,
          pinColor: 'yellow' as const,
          noteColor: 'yellow' as const,
        },
        {
          id: 'c0-pin-indictment',
          x: 0.22,
          y: 0.80,
          label: 'Bản kết luận điều tra',
          detail: isIndictmentSolved
            ? 'Bản cáo trạng đã được Viện Kiểm sát phê chuẩn!'
            : 'Lập bản cáo trạng gửi Viện Kiểm sát',
          color: 'red' as const,
          pinColor: 'red' as const,
          noteColor: 'white' as const,
        },
        ...followupPinsDesktop,
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
    <div suppressHydrationWarning className="relative w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center select-none">
      {/* Top Banner Toolbar */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#1b140e]/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#593c26]/60 text-xs text-[#d9a066] font-mono shadow-lg pointer-events-auto">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold tracking-wide">BẢNG ĐIỀU TRA</span>
        </div>
      </div>

      {/* Main Interactive Pinboard Canvas */}
      <HeroInteractive
        className="w-full h-full flex-1 min-h-0"
        controlledCaseId="case-000"
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
        isPhoneSolved={phoneLookupSuccess}
        onSubmitConclusion={(culprit) => {
          detectiveAudio.playStampSound()
          detectiveAudio.playUnlockJingle()
          setInvestigatedSuspects((prev) => {
            const next = Array.from(new Set([...prev, culprit])) as ('vu' | 'tung' | 'ha')[]
            try {
              localStorage.setItem('veritas_investigated_suspects', JSON.stringify(next))
            } catch {}
            return next
          })
          setNarrativeCulprit(culprit)
          setActiveFollowupCulprit(culprit)
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
        onTakeTestimony={() => setIsDossierEOpen(true)}
      />

      <DossierEModal
        isOpen={isDossierEOpen}
        onClose={() => setIsDossierEOpen(false)}
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
        isPhoneSolved={phoneLookupSuccess}
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
        onOpenFollowupQuestion={() => {
          if (narrativeCulprit) {
            setActiveFollowupCulprit(narrativeCulprit)
          }
          setIsFollowupQuestionOpen(true)
        }}
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
        culprit={activeFollowupCulprit || narrativeCulprit || solvedCulprit || 'vu'}
        onClose={() => setIsFollowupQuestionOpen(false)}
        onSuccess={handleFollowupSuccess}
        onOpenDossier={handleOpenDossier}
        isPhoneSolved={phoneLookupSuccess}
      />

      {/* Zoomed Photo Lightbox Modal */}
      <AnimatePresence>
        {zoomedPhotoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => {
              e.stopPropagation()
              if (Date.now() - zoomOpenTimeRef.current < 250) {
                return
              }
              detectiveAudio.playPaperRustle()
              setZoomedPhotoUrl(null)
            }}
            className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-pointer select-none"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              className="relative max-w-[92vw] max-h-[90vh] flex items-center justify-center"
            >
              <img
                src={zoomedPhotoUrl}
                alt="Ảnh tư liệu phóng to"
                className="max-h-[85vh] max-w-[85vw] object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] pointer-events-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
