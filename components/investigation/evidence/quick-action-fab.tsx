'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Smartphone, RefreshCw, X, Search } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'

interface QuickActionFabProps {
  onOpenPhone: () => void
  onResetCase: () => void
  onOpenHint?: () => void
  onOpenReinvestigation?: () => void
}

export function QuickActionFab({ onOpenPhone, onResetCase, onOpenHint, onOpenReinvestigation }: QuickActionFabProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    detectiveAudio.playPaperRustle()
    setIsOpen((prev) => !prev)
  }

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleAction = (action: () => void) => {
    detectiveAudio.playTypewriterClick()
    setIsOpen(false)
    action()
  }

  return (
    <div ref={menuRef} className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* POPUP OPTIONS MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mb-2.5 w-56 bg-[#140d08]/95 border border-[#3d2b1d] shadow-[0_15px_40px_rgba(0,0,0,0.95),0_0_15px_rgba(217,160,102,0.06)] rounded-xl p-2 space-y-1.5 backdrop-blur-md text-[#fef5ec]"
          >
            {/* OPTION: REINVESTIGATION (KHÁM XÉT LẠI) */}
            <button
              type="button"
              onClick={() =>
                handleAction(() => {
                  if (onOpenReinvestigation) {
                    onOpenReinvestigation()
                  } else if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-reinvestigation-modal'))
                  }
                })
              }
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#281b11] transition-colors cursor-pointer flex items-center gap-3 text-xs font-medium text-[#e5d8cb] hover:text-amber-300 group"
            >
              <Search className="size-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Khám xét lại hiện trường (3D)</span>
            </button>

            {/* OPTION: HINT */}
            <button
              type="button"
              onClick={() =>
                handleAction(() => {
                  if (onOpenHint) {
                    onOpenHint()
                  } else if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-hint-modal'))
                  }
                })
              }
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#281b11] transition-colors cursor-pointer flex items-center gap-3 text-xs font-medium text-[#e5d8cb] hover:text-amber-300 group"
            >
              <Lightbulb className="size-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Gợi ý phá án</span>
            </button>

            {/* OPTION: OPEN PHONE */}
            <button
              type="button"
              onClick={() => handleAction(onOpenPhone)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#281b11] transition-colors cursor-pointer flex items-center gap-3 text-xs font-medium text-[#e5d8cb] hover:text-[#d9a066] group"
            >
              <Smartphone className="size-4 text-[#d9a066] shrink-0 group-hover:scale-110 transition-transform" />
              <span>Điện thoại nạn nhân</span>
            </button>

            {/* DIVIDER */}
            <div className="border-t border-[#2b1e14] my-1" />

            {/* OPTION: RESET CASE */}
            <button
              type="button"
              onClick={() => handleAction(onResetCase)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#341713] transition-colors cursor-pointer flex items-center gap-3 text-xs font-medium text-red-300 hover:text-red-200 group"
            >
              <RefreshCw className="size-4 text-red-400 shrink-0 group-hover:rotate-180 transition-transform duration-300" />
              <span>Làm lại từ đầu</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTON (FAB) */}
      <button
        type="button"
        onClick={toggleMenu}
        className="size-12 sm:size-13 rounded-full bg-gradient-to-br from-[#e5ab6a] via-[#c98a4b] to-[#965c25] hover:from-[#f0b978] hover:via-[#d49554] hover:to-[#a3672b] text-[#180e07] shadow-[0_10px_30px_rgba(0,0,0,0.85),0_0_25px_rgba(229,171,106,0.35)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.9),0_0_32px_rgba(229,171,106,0.5)] flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group relative border-0 outline-none"
        title="Menu thao tác nhanh"
      >
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
        >
          {isOpen ? (
            <X className="size-5 text-[#180e07]" />
          ) : (
            <Lightbulb className="size-5 text-[#180e07] fill-[#180e07]/25 group-hover:scale-110 transition-transform duration-300" />
          )}
        </motion.div>
      </button>
    </div>
  )
}
