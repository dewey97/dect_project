'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { HeroInteractive, type PinPoint, type CaseConnection } from '@/components/investigation/hero-interactive'
import { AddSuspectModal } from './add-suspect-modal'
import { PhoneLookupModal } from './phone-lookup-modal'
import { IndictmentModal } from './indictment-modal'
import { detectiveAudio } from '@/lib/investigation-audio'

interface SuspectItem {
  id: string
  name: string
  clueIds: string[]
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
    const updated = suspects.filter((s) => s.id !== id)
    saveSuspectsState(updated)
  }

  const handlePhoneLookupSuccess = (phone: string, info: string) => {
    setPhoneLookupSuccess(true)
    setIsReinvestigateUnlocked(true)
    try {
      localStorage.setItem('veritas_reinvestigate_unlocked', 'true')
    } catch {}
  }

  const handleSubmitIndictment = (indictmentData: {
    suspectName: string
    motive: string
    selectedClueIds: string[]
    reasoning: string
  }) => {
    if (onOpenEpilogue) {
      onOpenEpilogue()
    }
  }

  // Handle pin clicks directly on HeroInteractive canvas
  const handlePinClick = useCallback((pinId: string) => {
    detectiveAudio.playPaperRustle()

    if (pinId === 'c0-pin-suspects') {
      setEditingSuspect(null)
      setIsAddSuspectOpen(true)
    } else if (pinId === 'c0-pin-evidence') {
      setIsPhoneLookupOpen(true)
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
      setIsIndictmentOpen(true)
    } else if (pinId.startsWith('node-suspect-') || pinId.includes('suspect')) {
      const targetId = pinId.replace('node-suspect-', '')
      const foundSuspect = suspects.find(
        (s) => s.id === targetId || s.id === pinId || pinId.endsWith(s.id) || pinId.includes(s.id)
      )
      if (foundSuspect) {
        setEditingSuspect(foundSuspect)
        setIsAddSuspectOpen(true)
      } else if (suspects.length > 0) {
        setEditingSuspect(suspects[0])
        setIsAddSuspectOpen(true)
      }
    }
  }, [suspects, isReinvestigateUnlocked, onOpenReinvestigation])

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Construct dynamic pins and connections combining main category pins, sub action pins, and suspect pins
  const customPins: PinPoint[] = isMobile
    ? [
        {
          id: 'c0-pin-suspects',
          x: 0.24,
          y: 0.48,
          label: 'XÁC ĐỊNH NGHI PHẠM',
          detail: 'Thêm & xem danh sách nghi phạm vụ án',
          color: 'red',
        },
        {
          id: 'c0-pin-evidence',
          x: 0.65,
          y: 0.32,
          label: 'BỔ SUNG CHỨNG CỨ',
          detail: 'Bóc tách vật chứng hiện trường & tài liệu điều tra',
          color: 'red',
        },
        {
          id: 'c0-pin-phone',
          x: 0.44,
          y: 0.20,
          label: 'THU THẬP THÊM THÔNG TIN',
          detail: 'Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang',
          color: 'yellow',
        },
        {
          id: 'c0-pin-reinvestigate',
          x: 0.74,
          y: 0.20,
          label: isReinvestigateUnlocked ? 'KHÁM XÉT LẠI' : 'KHÁM XÉT LẠI 🔒',
          detail: isReinvestigateUnlocked
            ? 'Mở biên bản tái khám xét hiện trường'
            : 'Khám xét lại hiện trường [Khóa — Cần bổ sung nghi phạm hoặc tra cứu SĐT]',
          color: 'yellow',
        },
        {
          id: 'c0-pin-indictment',
          x: 0.58,
          y: 0.74,
          label: 'ĐỀ NGHỊ TRUY TỐ',
          detail: 'Lập bản cáo trạng gửi Viện Kiểm sát',
          color: 'red',
        },
        ...suspects.map((suspect, idx) => {
          const xPos = 0.52 - idx * 0.08
          const yPos = 0.48 + idx * 0.10
          return {
            id: `node-suspect-${suspect.id}`,
            x: Math.min(0.85, Math.max(0.12, xPos)),
            y: Math.min(0.84, Math.max(0.40, yPos)),
            label: suspect.name.toUpperCase(),
            detail: `Nghi phạm: ${suspect.name} (${suspect.clueIds.length} manh mối liên quan)`,
            color: 'yellow' as const,
          }
        }),
      ]
    : [
        {
          id: 'c0-pin-suspects',
          x: 0.22,
          y: 0.24,
          label: 'XÁC ĐỊNH NGHI PHẠM',
          detail: 'Thêm & xem danh sách nghi phạm vụ án',
          color: 'red',
        },
        {
          id: 'c0-pin-evidence',
          x: 0.50,
          y: 0.22,
          label: 'BỔ SUNG CHỨNG CỨ',
          detail: 'Bóc tách vật chứng hiện trường & tài liệu điều tra',
          color: 'red',
        },
        {
          id: 'c0-pin-indictment',
          x: 0.78,
          y: 0.24,
          label: 'ĐỀ NGHỊ TRUY TỐ',
          detail: 'Lập bản cáo trạng gửi Viện Kiểm sát',
          color: 'red',
        },
        {
          id: 'c0-pin-phone',
          x: 0.38,
          y: 0.68,
          label: 'THU THẬP THÊM THÔNG TIN',
          detail: 'Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang',
          color: 'yellow',
        },
        {
          id: 'c0-pin-reinvestigate',
          x: 0.62,
          y: 0.68,
          label: isReinvestigateUnlocked ? 'KHÁM XÉT LẠI' : 'KHÁM XÉT LẠI 🔒',
          detail: isReinvestigateUnlocked
            ? 'Mở biên bản tái khám xét hiện trường'
            : 'Khám xét lại hiện trường [Khóa — Cần bổ sung nghi phạm hoặc tra cứu SĐT]',
          color: 'yellow',
        },
        ...suspects.map((suspect, idx) => {
          const row = Math.floor(idx / 2)
          const col = idx % 2
          const xPos = 0.12 + col * 0.18
          const yPos = 0.46 + row * 0.08
          return {
            id: `node-suspect-${suspect.id}`,
            x: Math.min(0.35, Math.max(0.08, xPos)),
            y: Math.min(0.90, Math.max(0.40, yPos)),
            label: suspect.name.toUpperCase(),
            detail: `Nghi phạm: ${suspect.name} (${suspect.clueIds.length} manh mối liên quan)`,
            color: 'yellow' as const,
          }
        }),
      ]

  const customConnections: CaseConnection[] = [
    { id: 'c0-conn-phone', fromPinId: 'c0-pin-evidence', toPinId: 'c0-pin-phone' },
    { id: 'c0-conn-reinvestigate', fromPinId: 'c0-pin-evidence', toPinId: 'c0-pin-reinvestigate' },
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
        isOpen={isAddSuspectOpen}
        onClose={() => setIsAddSuspectOpen(false)}
        onSave={handleSaveSuspect}
        onDelete={handleDeleteSuspect}
        editingSuspect={editingSuspect}
      />

      <PhoneLookupModal
        isOpen={isPhoneLookupOpen}
        onClose={() => setIsPhoneLookupOpen(false)}
        onSuccess={handlePhoneLookupSuccess}
        onOpenPhoneSimulator={onOpenPhoneSimulator}
      />

      <IndictmentModal
        isOpen={isIndictmentOpen}
        onClose={() => setIsIndictmentOpen(false)}
        onSubmitIndictment={handleSubmitIndictment}
      />
    </div>
  )
}
