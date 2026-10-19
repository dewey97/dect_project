'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SuspectExitConfirmModalProps {
  isOpen: boolean
  onConfirmSave: () => void
  onDiscard: () => void
}

export function SuspectExitConfirmModal({
  isOpen,
  onConfirmSave,
  onDiscard,
}: SuspectExitConfirmModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          className="relative w-full max-w-md p-6 bg-[#f6f1e5] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-[#1a120b] space-y-5"
        >
          <div className="space-y-2 text-center">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8c1d1d] block">
              XÁC NHẬN LƯU HỒ SƠ
            </span>
            <p className="font-sans font-bold text-sm sm:text-base text-[#1a120b] leading-relaxed">
              Bạn có muốn lưu hồ sơ này chờ hoàn thiện sau không?
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onConfirmSave}
              className="flex-1 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-2 border-[#2b1f14] shadow-sm active:scale-95 text-center"
            >
              CÓ
            </button>
            <button
              type="button"
              onClick={onDiscard}
              className="flex-1 py-2.5 bg-[#f4ebd9] hover:bg-[#ede3cf] text-[#2b1f14] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-2 border-[#2b1f14] active:scale-95 text-center"
            >
              KHÔNG
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
