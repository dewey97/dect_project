'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { TypewriterNarrator } from '@/components/investigation/evidence/typewriter-narrator'
import { detectiveAudio } from '@/lib/investigation-audio'

interface PhoneNarrativeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PhoneNarrativeModal({
  isOpen,
  onClose
}: PhoneNarrativeModalProps) {
  const [isNarrativeComplete, setIsNarrativeComplete] = useState(false)

  React.useEffect(() => {
    setIsNarrativeComplete(false)
  }, [isOpen])

  if (!isOpen) return null

  const dateLabel = 'Thành công xác minh danh tính các thuê bao.'
  const storyText =
    'Chúc mừng các thám tử đã thành công truy vết chủ sở hữu 3 số thuê bao trong nhật ký điện thoại.\n\nTiếp theo, hãy tiến hành triệu tập và ghi lời khai đối với từng trường hợp để làm rõ mục đích liên lạc.'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none">
        {/* CRT Scanlines effect */}
        <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

        {/* Main Fullscreen Cinematic Container (Matching Opening Day & Epilogue style) */}
        <div className="relative z-20 flex-1 h-full flex flex-col justify-between items-center p-4 sm:p-8 max-w-3xl mx-auto w-full overflow-hidden">
          <div className="space-y-6 w-full flex-1 flex flex-col items-start my-auto py-4 overflow-y-auto custom-scrollbar pr-1">
            {/* Top Date / Subject Header */}
            <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-widest uppercase border-b border-[#261b12] pb-3 w-full flex items-center justify-between shrink-0">
              <span>{dateLabel}</span>
            </div>

            {/* Typewriter Monologue */}
            <div className="pt-2 w-full flex-1 overflow-y-auto custom-scrollbar">
              <TypewriterNarrator
                key="phone-narrative"
                text={storyText}
                speed={12}
                onComplete={() => setIsNarrativeComplete(true)}
              />
            </div>
          </div>

          {/* Clean Bottom Action Button: LẤY LỜI KHAI */}
          <div className="w-full pt-4 pb-2 shrink-0 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playStampSound()
                onClose()
              }}
              className="w-full py-3.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] animate-fade-in"
            >
              <Search className="size-4.5" />
              <span>LẤY LỜI KHAI</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}
