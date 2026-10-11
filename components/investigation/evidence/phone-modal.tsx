'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneSimulator } from '../phone-simulator'

interface PhoneModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PhoneModal({ isOpen, onClose }: PhoneModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-2 pt-safe sm:p-4 select-none overflow-hidden animate-in fade-in-50">
        {/* Phone Frame Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full flex-1 min-h-0 max-w-[430px] flex flex-col items-center justify-center relative p-0 my-auto overflow-hidden"
        >
          <div className="w-full h-full overflow-hidden flex items-center justify-center p-0">
            <PhoneSimulator onClose={onClose} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

