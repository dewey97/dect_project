'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone } from 'lucide-react'
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
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-0 sm:p-4 select-none overflow-hidden animate-in fade-in-50">
        {/* Floating Close Button for Phone Modal */}
        <button
          onClick={onClose}
          className="fixed top-3 right-3 sm:top-5 sm:right-6 z-50 p-2 sm:px-4 sm:py-2 text-[#ad9885] hover:text-[#fef5ec] bg-[#24170e]/95 hover:bg-[#382618] rounded-full transition-all cursor-pointer border border-[#543b27] shadow-[0_4px_25px_rgba(0,0,0,0.9)] active:scale-95 flex items-center gap-1.5"
          title="Đóng điện thoại"
        >
          <X className="size-5 text-[#d9a066]" />
          <span className="text-xs font-bold font-mono text-[#e5d8cb] hidden sm:inline">ĐÓNG PHONE</span>
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full h-full sm:max-w-[460px] sm:max-h-[850px] flex flex-col overflow-hidden relative items-center justify-center p-0 sm:rounded-[36px] sm:border sm:border-[#543b27] sm:shadow-[0_25px_70px_rgba(0,0,0,0.95)]"
        >
          <div className="flex-1 w-full h-full overflow-hidden flex items-center justify-center p-0">
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
