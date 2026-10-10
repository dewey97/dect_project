'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { TypewriterNarrator } from '@/components/investigation/evidence/typewriter-narrator'
import { detectiveAudio } from '@/lib/investigation-audio'
import { useCaseCheckpoints } from '@/lib/hooks/use-case-checkpoints'

interface CulpritEpilogueModalProps {
  isOpen: boolean
  culprit: 'vu' | 'tung' | 'ha' | null
  choice?: string | null
  onClose: () => void
  onOpenDossier?: (dossierType: 'A' | 'B' | 'C') => void
  onOpenFollowupQuestion?: (targetCulprit?: 'vu' | 'tung' | 'ha') => void
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
  const { checkpoints } = useCaseCheckpoints("case-000")
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
  const isHaMatchedAll = isHa && (choice === 'matched_3_tiles' || choice === 'matched_3_tiles_indictment')
  const isQuestionSolved = choice === '21:15' || choice === 'question_solved' || isHaMatchedAll || choice === 'tin' || choice === 'khong_tin'
  const showTwoChoiceButtons = (isVu || isTung || isHa) && isQuestionSolved && !internalChoice
  const suspectName = isVu ? 'Lê Quang Vũ' : isTung ? 'Nguyễn Thanh Tùng' : 'Trần Thị Hà'

  const getCheckpointMonologue = (cpId: string) => {
    const cp = checkpoints.find((c) => c.id === cpId);
    return cp?.storyConfig?.monologue || "";
  }

  let dateLabel = isVu
    ? 'THÔNG BÁO ĐIỀU TRA — LÊ QUANG VŨ'
    : isTung
    ? 'THÔNG BÁO ĐIỀU TRA — NGUYỄN THANH TÙNG'
    : 'THÔNG BÁO ĐIỀU TRA — TRẦN THỊ HÀ'

  let storyText = ''

  if (showTwoChoiceButtons) {
    storyText = `Toàn bộ hành tung của ${suspectName} trong đêm xảy ra vụ án đã được thu thập & phân tích. Các mảnh ghép đã dần lộ diện.\n\nDựa vào những gì đang nắm giữ, bạn có tin đối tượng này vô tội?`
  } else if (internalChoice === 'tin') {
    storyText = `Bạn lựa chọn tạm thời tin tưởng ${suspectName}.\n\nHãy chuyển hướng điều tra vụ án.\nTuy nhiên, xin các thám tử nhớ rằng: Một người chỉ được kết luận vô tội khi bạn tìm ra được hung thủ thực sự.`
  } else if (internalChoice === 'khong_tin') {
    if (isHa && haWarrantStep) {
      storyText = getCheckpointMonologue('cp-000-2b')
    } else {
      storyText = `Bạn không tin đối tượng ${suspectName} vô tội.\n\nHãy lập tức mở rộng điều tra, truy quét thêm các manh mối để chứng minh suy luận của mình.`
    }
  } else if (isHaMatchedAll) {
    storyText = getCheckpointMonologue('cp-epilogue-ha')
  } else {
    const suspectCpId = isVu ? 'cp-000-1a' : isTung ? 'cp-000-1b' : 'cp-000-1c'
    const epilogueCpId = isVu ? 'cp-epilogue-mai-vu' : isTung ? 'cp-epilogue-tung' : 'cp-epilogue-ha'
    storyText = getCheckpointMonologue(suspectCpId) || getCheckpointMonologue(epilogueCpId)
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
  }

  const handleCtaClick = () => {
    detectiveAudio.playStampSound()
    if (!choice && !internalChoice) {
      onClose()
      if (onOpenFollowupQuestion) {
        onOpenFollowupQuestion(culprit || undefined)
      }
    } else {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none pt-safe">
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
