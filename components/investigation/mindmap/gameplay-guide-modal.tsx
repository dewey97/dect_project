'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { detectiveAudio } from '@/lib/investigation-audio'
import {
  GAMEPLAY_GUIDE_CONFIG,
  GuideSection
} from '@/lib/guides/gameplay-guide-data'
import { emitInvestigationEvent } from '@/lib/investigation-events'

interface GameplayGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStartWalkthrough?: () => void
  initialSectionId?: string
}

export function GameplayGuideModal({
  isOpen,
  onClose,
  onStartWalkthrough,
  initialSectionId = 'suspects'
}: GameplayGuideModalProps) {
  const [activeTabId, setActiveTabId] = useState<string>(initialSectionId)

  // Sync initial tab when opening
  useEffect(() => {
    if (isOpen && initialSectionId) {
      setActiveTabId(initialSectionId)
    }
  }, [isOpen, initialSectionId])

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        detectiveAudio.playPaperRustle()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const activeSection =
    GAMEPLAY_GUIDE_CONFIG.sections.find((s) => s.id === activeTabId) ||
    GAMEPLAY_GUIDE_CONFIG.sections[0]

  const handleTabChange = (sectionId: string) => {
    detectiveAudio.playPaperRustle()
    setActiveTabId(sectionId)
  }

  const handleLaunchWalkthrough = () => {
    detectiveAudio.playTypewriterClick()
    onClose()
    if (onStartWalkthrough) {
      onStartWalkthrough()
    } else {
      emitInvestigationEvent('OPEN_WALKTHROUGH')
    }
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 font-sans select-none overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            detectiveAudio.playPaperRustle()
            onClose()
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl h-[540px] sm:h-[580px] max-h-[88vh] bg-[#f6f1e5] text-[#1a120b] border border-[#2b1f14]/70 shadow-[0_20px_50px_rgba(0,0,0,0.85)] rounded-none overflow-hidden flex flex-col"
        >
          {/* TOP HEADER BAR */}
          <div className="bg-[#ede3d1] px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[#2b1f14]/15 flex items-center">
            <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-[#8c1d1d] flex items-center gap-2">
              <BookOpen className="size-4 text-[#8c1d1d]" />
              {GAMEPLAY_GUIDE_CONFIG.manualTitle}
            </span>
          </div>

          {/* TAB NAVIGATION BAR (3 TABS - KHÔNG ICON) */}
          <div className="bg-[#e4d7c0] px-3 sm:px-5 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            {GAMEPLAY_GUIDE_CONFIG.sections.map((section) => {
              const isActive = section.id === activeTabId

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleTabChange(section.id)}
                  className={cn(
                    'px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer rounded-none border',
                    isActive
                      ? 'bg-[#2b1f14] text-[#f6f1e5] border-[#2b1f14] shadow-xs'
                      : 'bg-transparent text-[#5c4026] hover:text-[#1a120b] hover:bg-[#d8c8ad] border-transparent'
                  )}
                >
                  <span>{section.tabLabel}</span>
                </button>
              )
            })}
          </div>

          {/* MAIN BODY CONTENT AREA */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3.5 bg-[#f6f1e5]">
            {/* SECTION TITLE & SUMMARY */}
            <div className="space-y-1">
              <h2 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wide">
                {activeSection.title}
              </h2>
              {activeSection.summary && (
                <p className="text-xs sm:text-[13px] text-[#5c4026] font-medium italic">
                  {activeSection.summary}
                </p>
              )}
            </div>

            {/* STEPS LIST */}
            <div className="space-y-2.5">
              {activeSection.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-3.5 border border-[#2b1f14]/15 bg-[#fbf8f1] space-y-1 relative"
                >
                  <div className="flex items-center gap-2">
                    <div className="size-5 bg-[#2b1f14] text-[#f6f1e5] flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                      {idx + 1}
                    </div>
                    <h4 className="font-mono font-bold text-xs sm:text-sm text-[#1a120b] uppercase tracking-wider">
                      {step.title}
                    </h4>
                  </div>

                  <p className="text-xs sm:text-[13px] text-[#2b1f14] leading-relaxed font-sans pl-7 whitespace-pre-line">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* REQUIREMENT TIP CALLOUT (NẾU CÓ) */}
            {activeSection.requirementTip && (
              <div className="p-3 bg-[#f5ede0] border border-[#8c1d1d]/30 text-[#8c1d1d] text-xs leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="size-4 text-[#8c1d1d] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-mono uppercase font-bold text-[11px] block tracking-wide text-[#8c1d1d] mb-0.5">
                    Điều Kiện Mở Khóa:
                  </strong>
                  <span>{activeSection.requirementTip}</span>
                </div>
              </div>
            )}

            {/* PRO TIP CALLOUT */}
            {activeSection.proTip && (
              <div className="p-3 bg-[#fef3c7] border border-[#d97706]/30 text-[#78350f] text-xs leading-relaxed flex items-start gap-2.5">
                <Lightbulb className="size-4 text-[#b45309] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-mono uppercase font-bold text-[11px] block tracking-wide text-[#92400e] mb-0.5">
                    Mẹo Trinh Thám:
                  </strong>
                  <span>{activeSection.proTip}</span>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER BAR */}
          <div className="bg-[#ede3d1] px-4 py-3 sm:px-5 sm:py-3 border-t border-[#2b1f14]/15 flex items-center justify-between shrink-0 gap-3">
            {/* START WALKTHROUGH BUTTON IN FOOTER */}
            <button
              type="button"
              onClick={handleLaunchWalkthrough}
              className="px-3.5 py-1.5 bg-[#8c1d1d] hover:bg-[#a32222] text-[#fbf8f1] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#501010] shadow-sm flex items-center justify-center"
            >
              <span>Hướng dẫn từng bước</span>
            </button>

            {/* RETURN / CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playTypewriterClick()
                onClose()
              }}
              className="px-4 py-1.5 bg-[#2b1f14] text-[#f6f1e5] hover:bg-[#433020] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#140d08] shadow-sm"
            >
              Trở về
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
