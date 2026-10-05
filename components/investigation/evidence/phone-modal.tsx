'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { PhoneSimulator } from '../phone-simulator'

interface PhoneModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PhoneModal({ isOpen, onClose }: PhoneModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 select-none overflow-hidden animate-in fade-in-50">
        {/* Modal Dedicated Top Header Bar */}
        <div className="w-full max-w-[430px] flex items-center justify-between py-1.5 px-2 mb-1 shrink-0 z-50 border-b border-[#543b27]/40">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#d9a066]">
            <span>📱</span>
            <span>ĐIỆN THOẠI NẠN NHÂN KHANG</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#ad9885] hover:text-[#fef5ec] bg-[#24170e]/95 hover:bg-[#382618] transition-all cursor-pointer border border-[#543b27] shadow-lg active:scale-95 flex items-center justify-center"
            title="Đóng điện thoại"
          >
            <X className="size-5 text-[#d9a066]" />
          </button>
        </div>

        {/* Phone Frame Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full flex-1 min-h-0 max-w-[430px] flex flex-col items-center justify-center relative p-0 my-auto overflow-hidden"
        >
          <div className="w-full h-full overflow-hidden flex items-center justify-center p-0">
            <PhoneSimulator />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

