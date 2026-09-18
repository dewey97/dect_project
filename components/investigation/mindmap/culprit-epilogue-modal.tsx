'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { TypewriterNarrator } from '@/components/investigation/evidence/typewriter-narrator'
import { detectiveAudio } from '@/lib/investigation-audio'
import { SUSPECT_NARRATIVES } from '@/content/cases/case-000/narrator'

interface CulpritEpilogueModalProps {
  isOpen: boolean
  culprit: 'vu' | 'tung' | 'ha' | null
  choice?: string | null
  onClose: () => void
  onOpenDossier?: (dossierType: 'A' | 'B' | 'C') => void
  onOpenFollowupQuestion?: () => void
  onOpenIndictment?: () => void
}

export function CulpritEpilogueModal({
  isOpen,
  culprit,
  choice,
  onClose,
  onOpenDossier,
  onOpenFollowupQuestion,
  onOpenIndictment
}: CulpritEpilogueModalProps) {
  const [isNarrativeComplete, setIsNarrativeComplete] = useState(false)
  const [internalChoice, setInternalChoice] = useState<'tin' | 'khong_tin' | null>(
    (choice === 'tin' || choice === 'khong_tin') ? choice : null
  )
  const [haWarrantStep, setHaWarrantStep] = useState(false)

  React.useEffect(() => {
    setIsNarrativeComplete(false)
    setHaWarrantStep(false)
    if (choice === 'tin' || choice === 'khong_tin') {
      setInternalChoice(choice)
    } else {
      setInternalChoice(null)
    }
  }, [culprit, choice, isOpen])

  if (!isOpen || !culprit) return null

  const isVu = culprit === 'vu'
  const isTung = culprit === 'tung'
  const isHa = culprit === 'ha'
  const isHaMatchedAll = isHa && choice === 'matched_3_tiles_indictment'
  const isQuestionSolved = choice === '21:15' || choice === 'matched_3_tiles' || choice === 'question_solved'
  const showTwoChoiceButtons = isQuestionSolved && !internalChoice
  const suspectName = isVu ? 'Lê Quang Vũ' : isTung ? 'Nguyễn Thanh Tùng' : 'Trần Thị Hà'

  let dateLabel = isVu
    ? 'THÔNG BÁO ĐIỀU TRA — LÊ QUANG VŨ'
    : isTung
    ? 'THÔNG BÁO ĐIỀU TRA — NGUYỄN THANH TÙNG'
    : isHaMatchedAll
    ? 'DẪN TRUYỆN BUỘC TỘI — TRẦN THỊ HÀ (25/07/2016)'
    : haWarrantStep
    ? 'ĐỀ XUẤT LỆNH KHÁM XẾT CHỖ Ở — TRẦN THỊ HÀ'
    : 'QUYẾT ĐỊNH ĐIỀU TRA ĐỐI TƯỢNG TRẦN THỊ HÀ'

  let storyText = ''

  if (showTwoChoiceButtons) {
    storyText = SUSPECT_NARRATIVES.questionPrompt(suspectName)
  } else if (internalChoice === 'tin') {
    storyText = SUSPECT_NARRATIVES.choiceTin(suspectName)
  } else if (internalChoice === 'khong_tin') {
    if (isHa && haWarrantStep) {
      storyText = SUSPECT_NARRATIVES.haWarrantProposal
    } else {
      storyText = SUSPECT_NARRATIVES.choiceKhongTin(suspectName)
    }
  } else if (isHaMatchedAll) {
    storyText = SUSPECT_NARRATIVES.haFinalConclusion
  } else {
    storyText = SUSPECT_NARRATIVES.suspectBreakdown(suspectName)
  }

  let ctaButtonText = 'TIẾP TỤC ĐIỀU TRA'
  if (!choice && !internalChoice) {
    ctaButtonText = 'Bắt đầu điều tra'
  } else if (internalChoice === 'tin') {
    ctaButtonText = 'Chuyển hướng điều tra'
  } else if (internalChoice === 'khong_tin') {
    if (isHa) {
      ctaButtonText = haWarrantStep ? 'Tiến hành khám xét' : 'Mở rộng điều tra'
    } else {
      ctaButtonText = 'Mở rộng điều tra'
    }
  } else if (isHaMatchedAll) {
    ctaButtonText = 'Đề nghị truy tố'
  }

  const handleCtaClick = () => {
    detectiveAudio.playStampSound()
    if (!choice && !internalChoice) {
      onClose()
      if (onOpenFollowupQuestion) {
        onOpenFollowupQuestion()
      }
    } else if (isHa && internalChoice === 'khong_tin') {
      onClose()
    } else if (isHaMatchedAll) {
      onClose()
      if (onOpenIndictment) {
        onOpenIndictment()
      }
    } else {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none">
        {/* CRT Scanlines effect */}
        <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

        {/* Main Fullscreen Cinematic Container */}
        <div className="relative z-20 flex-1 h-full flex flex-col justify-between items-center p-4 sm:p-8 max-w-3xl mx-auto w-full overflow-hidden">
          <div className="space-y-6 w-full flex-1 flex flex-col items-start my-auto py-4 overflow-y-auto custom-scrollbar pr-1">
            {/* Top Date / Subject Header */}
            <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-widest uppercase border-b border-[#261b12] pb-3 w-full flex items-center justify-between shrink-0">
              <span>{dateLabel}</span>
            </div>

            {/* Typewriter Monologue */}
            <div className="pt-2 w-full flex-1 overflow-y-auto custom-scrollbar">
              <TypewriterNarrator
                key={`${culprit}-${internalChoice || (showTwoChoiceButtons ? 'choice' : 'default')}-${haWarrantStep}`}
                text={storyText}
                speed={12}
                onComplete={() => setIsNarrativeComplete(true)}
              />
            </div>
          </div>

          {/* Bottom Action Area */}
          {showTwoChoiceButtons ? (
            <div className="w-full pt-4 pb-2 shrink-0 max-w-md mx-auto grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playPaperRustle()
                  setInternalChoice('tin')
                }}
                className="py-3.5 bg-[#2e5220] hover:bg-[#203a16] text-[#f6f1e5] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 border-2 border-[#193310] active:scale-[0.99]"
              >
                <span>CÓ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playGlassSound()
                  setInternalChoice('khong_tin')
                }}
                className="py-3.5 bg-[#8c1d1d] hover:bg-[#a82424] text-[#fff5f5] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 border-2 border-[#5c1313] active:scale-[0.99]"
              >
                <span>KHÔNG</span>
              </button>
            </div>
          ) : (
            <div className="w-full pt-4 pb-2 shrink-0 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full py-3.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] animate-fade-in"
              >
                <Search className="size-4.5" />
                <span>{ctaButtonText}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  )
}
