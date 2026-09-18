'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { PhoneSimulator } from '../phone-simulator'
import {
  devices000,
  conversations000,
  photos000,
  emails000,
  documents000,
  browserHistory000,
  files000
} from '@/lib/content-service'
import type { Device } from '@/lib/types'

interface PhoneModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PhoneModal({ isOpen, onClose }: PhoneModalProps) {
  if (!isOpen) return null

  // Ensure device matches Device interface expected by PhoneSimulator
  const victimDevice: Device = {
    ...devices000[0],
    locked: false,
    status: 'unlocked',
    recoveryLevel: 100,
    lastUpdated: '24/07/2016 // 17:55',
    description: devices000[0].description || 'Điện thoại cá nhân của nạn nhân Khang'
  }

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
            <PhoneSimulator
              device={victimDevice}
              threads={conversations000[victimDevice.id] || []}
              photos={photos000[victimDevice.id] || []}
              emails={emails000[victimDevice.id] || []}
              notes={documents000[victimDevice.id] || []}
              history={browserHistory000[victimDevice.id] || []}
              files={files000[victimDevice.id] || []}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
