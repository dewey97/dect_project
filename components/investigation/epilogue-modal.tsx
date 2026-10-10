'use client'

import React, { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BookOpen, X } from 'lucide-react'
import { TypewriterNarrator } from './evidence/typewriter-narrator'
import { detectiveAudio } from '@/lib/investigation-audio'
import { useCaseCheckpoints } from '@/lib/hooks/use-case-checkpoints'
import { cn } from '@/lib/utils'

interface EpilogueModalProps {
  isOpen: boolean
  onClose?: () => void
}

const EPILOGUE_META = [
  { id: 'cp-epilogue-ha', defaultTitle: 'Hậu Án I: Trần Thị Hà & Bản Án Lương Tâm' },
  { id: 'cp-epilogue-mai-vu', defaultTitle: 'Hậu Án II: Vợ Chồng Mai - Vũ & Mảnh Đất Tranh Chấp' },
  { id: 'cp-epilogue-tung', defaultTitle: 'Hậu Án III: Nguyễn Thanh Tùng & Bức Thư Cứu Rỗi' },
  { id: 'cp-epilogue-closure', defaultTitle: 'Hậu Án IV: Khép Lại Chuyên Án Số 14 Đường Bờ Sông' },
]

export function EpilogueModal({ isOpen, onClose }: EpilogueModalProps) {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0)
  const { checkpoints, loading } = useCaseCheckpoints('case-000')

  // Đọc 4 bài Hậu Án trực tiếp từ Google Sheets Live CMS (tab checkpoints)
  const epilogueStories = useMemo(() => {
    return EPILOGUE_META.map((meta) => {
      const cp = checkpoints.find((c) => c.id === meta.id)
      return {
        id: meta.id,
        title: cp?.title || meta.defaultTitle,
        monologue: cp?.storyConfig?.monologue || '',
      }
    })
  }, [checkpoints])

  if (!isOpen) return null

  const currentStory = epilogueStories[activeStoryIdx] || epilogueStories[0]

  const handleSelectStory = (idx: number) => {
    detectiveAudio.playTypewriterClick()
    setActiveStoryIdx(idx)
  }

  const handleClose = () => {
    detectiveAudio.playPaperRustle()
    if (onClose) onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none">
        {/* CRT Background scanlines */}
        <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

        {/* Top Header / Bar */}
        <header className="relative z-20 shrink-0 px-4 py-2.5 sm:px-6 bg-[#160f0a] border-b border-[#2e2015] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#d9a066]">
            <BookOpen className="size-4 sm:size-4.5" />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase">
              KÝ SỰ HẬU ÁN
            </span>
          </div>
          {onClose && (
            <button
              onClick={handleClose}
              className="p-1 text-[#a88a6d] hover:text-[#f5ebd9] transition-colors cursor-pointer"
              title="Đóng ký sự hậu án"
            >
              <X className="size-5" />
            </button>
          )}
        </header>

        {/* Mobile Horizontal Tabs Selector */}
        <nav className="relative z-20 flex lg:hidden overflow-x-auto custom-scrollbar bg-[#100b07] border-b border-[#22160d] p-1 px-2 gap-1 shrink-0">
          {epilogueStories.map((s, idx) => {
            const isSelected = activeStoryIdx === idx
            return (
              <button
                key={s.id}
                onClick={() => handleSelectStory(idx)}
                className={cn(
                  'px-2.5 py-1 text-[0.72rem] font-mono tracking-tight transition-all shrink-0 cursor-pointer border rounded-none',
                  isSelected
                    ? 'bg-[#24170e] border-[#c49257]/80 text-[#d9a066] font-semibold'
                    : 'bg-transparent border-[#22160d] text-[#7e6d5e] hover:text-[#d9c4b1] hover:bg-[#18100a]'
                )}
              >
                <span>{s.title}</span>
              </button>
            )
          })}
        </nav>

        {/* Main Content Area */}
        <div className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden min-h-0">
          {/* Left / Main Typewriter Story Canvas */}
          <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-[#24180f] p-4 sm:p-6 lg:p-7 flex flex-col justify-start items-center bg-black overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-3 max-w-xl mx-auto w-full flex flex-col items-start py-1">
              {/* Typewriter Story Display */}
              <div className="w-full">
                {currentStory?.monologue ? (
                  <TypewriterNarrator
                    key={currentStory.id}
                    text={currentStory.monologue}
                    speed={12}
                  />
                ) : (
                  <div className="py-12 text-center text-xs font-mono text-[#a88a6d] animate-pulse">
                    {loading
                      ? 'Đang đồng bộ hồ sơ hậu án từ Google Sheets Live CMS...'
                      : 'Hồ sơ hậu án đang được cập nhật.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Desktop Story Selector) */}
          <div className="hidden lg:flex lg:col-span-4 p-3.5 lg:p-4 bg-[#140e09] flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="flex flex-col space-y-2.5">
              <div className="border-b border-[#291b12] pb-1.5">
                <span className="font-mono text-[0.68rem] text-[#a88a6d] uppercase font-bold tracking-widest">
                  DANH SÁCH HẬU ÁN
                </span>
              </div>

              {/* 4 Story Option Cards */}
              <div className="space-y-1.5">
                {epilogueStories.map((s, idx) => {
                  const isSelected = activeStoryIdx === idx
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectStory(idx)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-xs font-serif transition-all flex items-center justify-between cursor-pointer border rounded-none',
                        isSelected
                          ? 'bg-[#291b11] border-[#c49257]/80 text-[#f5ebd9] font-semibold'
                          : 'bg-[#19110b]/80 border-[#26190f] text-[#8e7b6c] hover:bg-[#20160f] hover:text-[#d9c4b1] hover:border-[#382618]'
                      )}
                    >
                      <span className="line-clamp-2">{s.title}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 bg-[#c49257] shrink-0 ml-2" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {onClose && (
              <div className="pt-4 border-t border-[#291b12]">
                <button
                  onClick={handleClose}
                  className="w-full py-2 bg-[#221810] hover:bg-[#342418] border border-[#d9a066]/40 hover:border-[#d9a066] text-[#d9a066] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  ĐÓNG KÝ SỰ HẬU ÁN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}
