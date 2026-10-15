import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { PhoneSimulator } from '../phone-simulator'

interface PhoneModalProps {
  isOpen: boolean
  onClose: () => void
  caseId?: string
}

export function PhoneModal({ isOpen, onClose, caseId }: PhoneModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col items-center justify-start select-none overflow-hidden animate-in fade-in-50 pt-safe">
        {/* TOP FIXED CONTROLS BAR: 100% Always visible on Mobile Viewport */}
        <div className="w-full h-[46px] px-3 sm:px-4 flex items-center justify-between shrink-0 z-50 bg-[#0A0A0C]/95 border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#FF453A] animate-pulse" />
            <span className="text-[12px] sm:text-[13px] font-mono uppercase tracking-widest text-zinc-100 font-bold drop-shadow">
              Điện thoại nạn nhân
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1C1E] text-zinc-200 hover:text-white hover:bg-white/15 border border-white/20 active:scale-95 transition-all cursor-pointer shadow-md text-[12px] font-sans font-medium"
            title="Quay lại hiện trường"
            aria-label="Quay lại hiện trường"
          >
            <ArrowLeft className="size-3.5 text-[#d9a066]" />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Phone Frame Simulator Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full flex-1 min-h-0 flex flex-col items-center justify-center relative p-0 overflow-hidden"
        >
          <div className="w-full h-full overflow-hidden flex items-center justify-center p-0">
            <PhoneSimulator onClose={onClose} device={caseId ? { caseId } : undefined} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

