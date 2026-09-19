'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'

interface DossierEModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DossierEModal({ isOpen, onClose }: DossierEModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center pt-10 sm:pt-14 p-3 sm:p-6 font-sans select-none overflow-y-auto cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 12 }}
          exit={{ opacity: 0, scale: 0.95, y: 25 }}
          className="relative w-full max-w-md bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_30px_90px_rgba(0,0,0,0.98)] rounded-none overflow-hidden flex flex-col cursor-default translate-y-3 sm:translate-y-6 p-6 sm:p-8 space-y-6"
        >
          {/* MỞ TÚI HỒ SƠ E CALLOUT */}
          <div className="p-6 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm text-center">
            <span className="font-typewriter text-lg sm:text-xl font-bold text-[#8c1d1d] uppercase tracking-widest block">
              📂 MỞ TÚI HỒ SƠ E
            </span>
          </div>

          {/* ACTION BUTTON */}
          <button
            type="button"
            onClick={() => {
              detectiveAudio.playPaperRustle()
              onClose()
            }}
            className="w-full py-3 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-typewriter text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-[#2b1f14] shadow-sm active:scale-95"
          >
            <span>TIẾP TỤC ĐIỀU TRA</span>
            <ArrowRight className="size-4 text-[#d9a066]" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
