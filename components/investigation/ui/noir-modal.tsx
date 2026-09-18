'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

interface NoirModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  badgeText?: string
  children: React.ReactNode
  className?: string
  maxWidthClass?: string
  showCloseButton?: boolean
}

export function NoirModal({
  isOpen,
  onClose,
  title,
  subtitle,
  badgeText = 'HỒ SƠ ĐIỀU TRA // MAT-000',
  children,
  className,
  maxWidthClass = 'max-w-2xl',
  showCloseButton = true,
}: NoirModalProps) {
  useEffect(() => {
    if (!isOpen) return
    detectiveAudio.playPaperRustle()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'relative w-full bg-[#16120e] border-2 border-[#3d2c1e] text-[#e5d8cb] shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden rounded-xl my-auto flex flex-col max-h-[90vh]',
              maxWidthClass,
              className
            )}
          >
            {/* AMBIENT NOIR GLOW & SCANLINES */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[radial-gradient(ellipse_at_top,rgba(217,160,102,0.12),transparent_70%)] z-0" />

            {/* HEADER */}
            {(title || badgeText) && (
              <header className="relative z-10 p-4 sm:p-6 pb-3 border-b border-[#3d2c1e] bg-[#241a12] flex items-start justify-between gap-4 shrink-0">
                <div>
                  {badgeText && (
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-[#d4a373] font-bold block mb-1">
                      {badgeText}
                    </span>
                  )}
                  {title && (
                    <h2 className="font-bold text-lg sm:text-xl text-[#f4e8d8] font-sans tracking-wide">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[#ad9885] mt-1 leading-relaxed">{subtitle}</p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={() => {
                      detectiveAudio.playPaperRustle()
                      onClose()
                    }}
                    className="p-1.5 text-[#ad9885] hover:text-[#fef5ec] hover:bg-[#382618] rounded transition-colors cursor-pointer border border-[#543b27] shrink-0"
                    title="Đóng cửa sổ (Esc)"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </header>
            )}

            {/* BODY CONTENT */}
            <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 min-h-0">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
