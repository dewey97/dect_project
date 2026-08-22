'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function TypewriterNarrator({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="p-3.5 bg-[#170e0a] border border-[#523722] rounded-none font-mono text-xs leading-relaxed italic text-amber-200/90 shadow-inner relative overflow-hidden"
    >
      <p className="relative z-10 font-medium">
        "{text}"
      </p>
    </motion.div>
  )
}
