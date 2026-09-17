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
  const [activeFollowupCulprit, setActiveFollowupCulprit] = useState<'vu' | 'tung' | null>(null)
  const [narrativeCulprit, setNarrativeCulprit] = useState<'vu' | 'tung' | null>(null)

  // Modals state
  const [isAddSuspectOpen, setIsAddSuspectOpen] = useState(false)
  const [editingSuspect, setEditingSuspect] = useState<SuspectItem | null>(null)
  const [isPhoneLookupOpen, setIsPhoneLookupOpen] = useState(false)
  const [isIndictmentOpen, setIsIndictmentOpen] = useState(false)

  // Restore saved state from localStorage if available
  useEffect(() => {
    try {
      const savedSuspects = localStorage.getItem('veritas_canvas_suspects')
      if (savedSuspects) {
        const parsed = JSON.parse(savedSuspects)
        setSuspects(parsed.filter((s: any) => s.id !== 'suspect-default-1'))
      }
      const savedUnlocked = localStorage.getItem('veritas_reinvestigate_unlocked')
      if (savedUnlocked === 'true') {
        setIsReinvestigateUnlocked(true)
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
    setSuspects(newSuspects)
    try {
      localStorage.setItem('veritas_canvas_suspects', JSON.stringify(newSuspects))
    } catch {}
  }

  const handleSaveSuspect = (savedSuspect: SuspectItem) => {
    const existingIndex = suspects.findIndex((s) => s.id === savedSuspect.id)
    let updated: SuspectItem[]
    if (existingIndex >= 0) {
      updated = [...suspects]
      updated[existingIndex] = savedSuspect
    } else {
      updated = [...suspects, savedSuspect]
    }
    saveSuspectsState(updated)

    if (updated.length >= 2 || phoneLookupSuccess) {
      setIsReinvestigateUnlocked(true)
      try {
        localStorage.setItem('veritas_reinvestigate_unlocked', 'true')
      } catch {}
    }
  }

  const handleDeleteSuspect = (id: string) => {
    const suspectToDelete = suspects.find((s) => s.id === id)
    const updated = suspects.filter((s) => s.id !== id)
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
    setIsReinvestigateUnlocked(true)
    setIsPhoneNarrativeOpen(true)
    try {
      localStorage.setItem('veritas_reinvestigate_unlocked', 'true')
    } catch {}
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
    setIsReinvestigateUnlocked(true)
    try {
      localStorage.setItem('veritas_indictment_solved', 'true')
      localStorage.setItem('veritas_indictment_culprit', data.culprit)
      localStorage.setItem('veritas_reinvestigate_unlocked', 'true')
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
      const foundSuspect = suspects.find(
        (s) => s.id === targetId || s.id === pinId || pinId.endsWith(s.id)
      )
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

  // CỐ ĐỊNH CÁC VỊ TRÍ SLOT NGHI PHẠM (Đồng bán kính, cân đối và thẩm mỹ)
  const DESKTOP_SUSPECT_SLOTS = React.useMemo(() => [
    { x: 0.10, y: 0.36 }, // Slot 1: Góc trái trên (Lê Quang Vũ)
    { x: 0.26, y: 0.36 }, // Slot 2: Góc phải trên (Nguyễn Thanh Tùng)
    { x: 0.26, y: 0.68 }, // Slot 3: Góc phải dưới (Trần Thị Hà)
    { x: 0.10, y: 0.68 }, // Slot 4: Góc trái dưới (Nguyễn Ngọc Mai)
    { x: 0.18, y: 0.52 }, // Slot 5: Dự phòng trung tâm
  ], [])

  const MOBILE_SUSPECT_SLOTS = React.useMemo(() => [
    { x: 0.15, y: 0.48 }, // Slot 1: Lê Quang Vũ (Cùng bán kính y=0.48)
    { x: 0.40, y: 0.48 }, // Slot 2: Nguyễn Thanh Tùng (Cùng bán kính y=0.48)
    { x: 0.65, y: 0.48 }, // Slot 3: Trần Thị Hà (Cùng bán kính y=0.48)
    { x: 0.86, y: 0.48 }, // Slot 4: Nguyễn Ngọc Mai (Cùng bán kính y=0.48)
    { x: 0.52, y: 0.64 }, // Slot 5: Dự phòng
  ], [])

  // Gán slot cố định bất biến cho từng nghi phạm
  const suspectSlotMap = React.useMemo(() => {
    const map = new Map<string, number>()
    const usedSlots = new Set<number>()

    // Giai đoạn 1: Ưu tiên gán slot theo tên nhân vật chuẩn
    suspects.forEach((suspect) => {
      const lower = suspect.name.toLowerCase()
      let targetSlot = -1
      if (lower.includes('vũ') || lower.includes('vu')) targetSlot = 0
      else if (lower.includes('tùng') || lower.includes('tung')) targetSlot = 1
      else if (lower.includes('hà') || lower.includes('ha')) targetSlot = 2
      else if (lower.includes('mai')) targetSlot = 3

      if (targetSlot !== -1 && !usedSlots.has(targetSlot)) {
        map.set(suspect.id, targetSlot)
        usedSlots.add(targetSlot)
      }
    })

    // Giai đoạn 2: Gán slot còn trống cho các đối tượng khác
    suspects.forEach((suspect) => {
      if (!map.has(suspect.id)) {
        for (let i = 0; i < DESKTOP_SUSPECT_SLOTS.length; i++) {
          if (!usedSlots.has(i)) {
            map.set(suspect.id, i)
            usedSlots.add(i)
            break
          }
        }
      }
    })

    return map
  }, [suspects, DESKTOP_SUSPECT_SLOTS.length])

  // Construct dynamic suspect pins
  const mobileSuspectPins: PinPoint[] = suspects.map((suspect, idx) => {
    const slotIdx = suspectSlotMap.get(suspect.id) ?? (idx % MOBILE_SUSPECT_SLOTS.length)
    const slot = MOBILE_SUSPECT_SLOTS[slotIdx] || MOBILE_SUSPECT_SLOTS[0]
    return {
      id: `node-suspect-${suspect.id}`,
      x: slot.x,
      y: slot.y,
      label: suspect.name.toUpperCase(),
      detail: `Nghi phạm: ${suspect.name} (${suspect.clueIds.length} manh mối liên quan)`,
      color: 'yellow' as const,
    }
  })

  const desktopSuspectPins: PinPoint[] = suspects.map((suspect, idx) => {
    const slotIdx = suspectSlotMap.get(suspect.id) ?? (idx % DESKTOP_SUSPECT_SLOTS.length)
    const slot = DESKTOP_SUSPECT_SLOTS[slotIdx] || DESKTOP_SUSPECT_SLOTS[0]
    return {
      id: `node-suspect-${suspect.id}`,
      x: slot.x,
      y: slot.y,
      label: suspect.name.toUpperCase(),
      detail: `Nghi phạm: ${suspect.name} (${suspect.clueIds.length} manh mối liên quan)`,
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
            label: 'CÂU HỎI 1',
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
            label: 'CÂU HỎI 1',
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
            label: 'CÂU HỎI 1',
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
            label: 'CÂU HỎI 1',
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
          label: 'XÁC ĐỊNH NGHI PHẠM',
          detail: 'Thêm & xem danh sách nghi phạm vụ án',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-evidence',
          x: 0.78,
          y: 0.32,
          label: 'BỔ SUNG CHỨNG CỨ',
          detail: 'Chỉ dẫn nghiệp vụ & hướng dẫn mở khóa 2 nhánh chứng cứ',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-phone',
          x: 0.30,
          y: 0.16,
          label: 'MỞ RỘNG ĐIỀU TRA',
          detail: phoneLookupSuccess
            ? 'Đã xác minh danh tính SĐT thành công'
            : 'Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang',
          color: phoneLookupSuccess ? ('blue' as const) : ('yellow' as const),
        },
        {
          id: 'c0-pin-reinvestigate',
          x: 0.76,
          y: 0.16,
          label: isReinvestigateUnlocked ? 'KHÁM XÉT LẠI' : 'KHÁM XÉT LẠI 🔒',
          detail: isReinvestigateUnlocked
            ? 'Mở biên bản tái khám xét hiện trường'
            : 'Khám xét lại hiện trường [Khóa — Cần bổ sung nghi phạm hoặc tra cứu SĐT]',
          color: isReinvestigateUnlocked ? ('yellow' as const) : ('black' as const),
        },
        {
          id: 'c0-pin-indictment',
          x: 0.74,
          y: 0.82,
          label: 'ĐỀ NGHỊ TRUY TỐ',
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
          label: 'XÁC ĐỊNH NGHI PHẠM',
          detail: 'Thêm & xem danh sách nghi phạm vụ án',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-evidence',
          x: 0.50,
          y: 0.20,
          label: 'BỔ SUNG CHỨNG CỨ',
          detail: 'Chỉ dẫn nghiệp vụ & hướng dẫn mở khóa 2 nhánh chứng cứ',
          color: 'red' as const,
        },
        {
          id: 'c0-pin-indictment',
          x: 0.82,
          y: 0.20,
          label: 'ĐỀ NGHỊ TRUY TỐ',
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
          label: 'MỞ RỘNG ĐIỀU TRA',
          detail: phoneLookupSuccess
            ? 'Đã xác minh danh tính SĐT thành công'
            : 'Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang',
          color: phoneLookupSuccess ? ('blue' as const) : ('yellow' as const),
        },
        {
          id: 'c0-pin-reinvestigate',
          x: 0.76,
          y: 0.70,
          label: isReinvestigateUnlocked ? 'KHÁM XÉT LẠI' : 'KHÁM XÉT LẠI 🔒',
          detail: isReinvestigateUnlocked
            ? 'Mở biên bản tái khám xét hiện trường'
            : 'Khám xét lại hiện trường [Khóa — Cần bổ sung nghi phạm hoặc tra cứu SĐT]',
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
            fromPinId: `node-suspect-${vuSuspect.id}`,
            toPinId: 'c0-pin-followup-vu',
          },
        ]
      : []),
    ...(hasTungFollowup && tungSuspect
      ? [
          {
            id: 'c0-conn-followup-tung',
            fromPinId: `node-suspect-${tungSuspect.id}`,
            toPinId: 'c0-pin-followup-tung',
          },
        ]
      : []),
    ...suspects.map((suspect) => ({
      id: `c0-conn-suspect-${suspect.id}`,
      fromPinId: 'c0-pin-suspects',
      toPinId: `node-suspect-${suspect.id}`,
    })),
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
      />
    </div>
  )
}
