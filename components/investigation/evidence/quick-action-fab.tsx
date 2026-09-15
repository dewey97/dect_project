'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Smartphone, Search, RefreshCw, X, ShieldAlert, Menu, UserCheck } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'

interface QuickActionFabProps {
  onOpenPhone: () => void
  onReinvestigate: () => void
  onResetCase: () => void
  onOpenHint?: () => void
  onOpenSuspects?: () => void
}

export function QuickActionFab({ onOpenPhone, onReinvestigate, onResetCase, onOpenHint, onOpenSuspects }: QuickActionFabProps) {
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
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="mb-3 w-56 bg-[#1a110a]/95 border-2 border-[#543b27] shadow-[0_15px_40px_rgba(0,0,0,0.85)] rounded-2xl p-2 font-mono space-y-1.5 backdrop-blur-md overflow-hidden text-[#fef5ec]"
          >
            <div className="px-3 py-1.5 border-b border-[#3b271a] flex items-center justify-between text-[0.625rem] text-[#ad9885] uppercase font-bold tracking-wider">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="size-3 text-[#d9a066]" />
                MENU THAO TÁC
              </span>
            </div>

            {/* OPTION: HINT */}
            <button
              type="button"
              onClick={() => handleAction(() => {
                if (onOpenHint) {
                  onOpenHint()
                } else if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-hint-modal'))
                }
              })}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#2e1d11] border border-transparent hover:border-[#6e492e] transition-all cursor-pointer flex items-center gap-2.5 text-xs font-bold text-[#fef5ec] group"
            >
              <div className="p-1.5 bg-[#291b10] border border-[#523c28] text-amber-400 rounded-lg group-hover:bg-amber-500 group-hover:text-black transition-colors">
                <Lightbulb className="size-4" />
              </div>
              <span className="group-hover:text-amber-300 transition-colors">Gợi ý phá án</span>
            </button>

            {/* OPTION: SUSPECTS */}
            <button
              type="button"
              onClick={() => handleAction(() => {
                if (onOpenSuspects) {
                  onOpenSuspects()
                } else if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-suspects-modal'))
                }
              })}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#2e1d11] border border-transparent hover:border-[#6e492e] transition-all cursor-pointer flex items-center gap-2.5 text-xs font-bold text-[#fef5ec] group"
            >
              <div className="p-1.5 bg-[#291b10] border border-[#523c28] text-[#d9a066] rounded-lg group-hover:bg-[#d9a066] group-hover:text-black transition-colors">
                <UserCheck className="size-4" />
              </div>
              <span className="group-hover:text-[#d9a066] transition-colors">Thẩm tra tình nghi</span>
            </button>

            {/* OPTION 1: OPEN PHONE */}
            <button
              type="button"
              onClick={() => handleAction(onOpenPhone)}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#2e1d11] border border-transparent hover:border-[#6e492e] transition-all cursor-pointer flex items-center gap-2.5 text-xs font-bold text-[#fef5ec] group"
            >
              <div className="p-1.5 bg-[#291b10] border border-[#523c28] text-[#d9a066] rounded-lg group-hover:bg-[#d9a066] group-hover:text-black transition-colors">
                <Smartphone className="size-4" />
              </div>
              <span className="group-hover:text-[#d9a066] transition-colors">Điện thoại nạn nhân</span>
            </button>

            {/* OPTION 2: RE-INVESTIGATE */}
            <button
              type="button"
              onClick={() => handleAction(onReinvestigate)}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#2e1d11] border border-transparent hover:border-[#6e492e] transition-all cursor-pointer flex items-center gap-2.5 text-xs font-bold text-[#fef5ec] group"
            >
              <div className="p-1.5 bg-[#291b10] border border-[#523c28] text-[#d9a066] rounded-lg group-hover:bg-[#d9a066] group-hover:text-black transition-colors">
                <Search className="size-4" />
              </div>
              <span className="group-hover:text-[#d9a066] transition-colors">Khám xét lại</span>
            </button>

            {/* OPTION 3: RESET CASE */}
            <button
              type="button"
              onClick={() => handleAction(onResetCase)}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#3d1a15] border border-transparent hover:border-red-800/60 transition-all cursor-pointer flex items-center gap-2.5 text-xs font-bold text-red-300 group"
            >
              <div className="p-1.5 bg-[#26120e] border border-red-900/60 text-red-400 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                <RefreshCw className="size-4" />
              </div>
              <span className="group-hover:text-red-200 transition-colors">Làm lại từ đầu</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION CIRCLE BUTTON (FAB) */}
      <button
        type="button"
        onClick={toggleMenu}
        className="size-12 sm:size-13 rounded-full bg-[#1c120a] hover:bg-[#2b1c10] border border-[#523c28] hover:border-[#d9a066] text-[#d9a066] shadow-[0_10px_25px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all cursor-pointer active:scale-95 group relative"
        title="Menu thao tác nhanh"
      >
        {isOpen ? (
          <X className="size-5 text-[#d9a066] transition-transform duration-200" />
        ) : (
          <Menu className="size-5 text-[#d9a066] group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  )
}
