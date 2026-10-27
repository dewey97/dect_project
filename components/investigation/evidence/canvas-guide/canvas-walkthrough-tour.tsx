'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Compass,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { detectiveAudio } from '@/lib/investigation-audio'
import {
  CANVAS_TOUR_STEPS,
  type CanvasTourStep,
} from '@/lib/guides/canvas-guide-data'

interface CanvasWalkthroughTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

interface SpotlightBox {
  x: number
  y: number
  width: number
  height: number
  radius?: number
}

export function CanvasWalkthroughTour({
  isOpen,
  onClose,
  onComplete,
}: CanvasWalkthroughTourProps) {
  const [mounted, setMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [spotlight, setSpotlight] = useState<SpotlightBox | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const currentStep: CanvasTourStep =
    CANVAS_TOUR_STEPS[currentIndex] || CANVAS_TOUR_STEPS[0]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === CANVAS_TOUR_STEPS.length - 1

  // Tính toán vùng Spotlight dựa trên DOM selector thực tế
  const updateSpotlight = useCallback(() => {
    if (!isOpen) return

    const winW = window.innerWidth
    const winH = window.innerHeight

    if (currentStep.targetType === 'canvas-center' || !currentStep.targetSelector) {
      // Vùng trung tâm mặt bàn
      const w = Math.min(Math.round(winW * 0.55), 720)
      const h = Math.min(Math.round(winH * 0.52), 480)
      setSpotlight({
        x: Math.round((winW - w) / 2),
        y: Math.round((winH - h) / 2),
        width: w,
        height: h,
        radius: 16,
      })
      return
    }

    // Tra cứu phần tử thực tế trong DOM
    const el = document.querySelector(currentStep.targetSelector)
    if (el) {
      const rect = el.getBoundingClientRect()
      const padding = 8
      const x = Math.max(8, rect.left - padding)
      const y = Math.max(8, rect.top - padding)
      const width = Math.min(winW - x - 8, rect.width + padding * 2)
      const height = Math.min(winH - y - 8, rect.height + padding * 2)

      setSpotlight({
        x,
        y,
        width,
        height,
        radius: 12,
      })
    } else {
      // Fallback về trung tâm nếu không tìm thấy target
      const w = Math.min(Math.round(winW * 0.55), 650)
      const h = Math.min(Math.round(winH * 0.5), 450)
      setSpotlight({
        x: Math.round((winW - w) / 2),
        y: Math.round((winH - h) / 2),
        width: w,
        height: h,
        radius: 16,
      })
    }
  }, [isOpen, currentStep])

  // Cập nhật vị trí spotlight khi đổi bước hoặc resize
  useEffect(() => {
    if (!isOpen) return
    updateSpotlight()
    const timer = setTimeout(updateSpotlight, 120)
    return () => clearTimeout(timer)
  }, [isOpen, currentIndex, updateSpotlight])

  // Điều hướng
  const handleNext = useCallback(() => {
    if (isLast) {
      detectiveAudio.playStampSound()
      onComplete?.()
      onClose()
    } else {
      detectiveAudio.playPaperRustle()
      setCurrentIndex((prev) => prev + 1)
    }
  }, [isLast, onComplete, onClose])

  const handlePrev = useCallback(() => {
    if (!isFirst) {
      detectiveAudio.playPaperRustle()
      setCurrentIndex((prev) => prev - 1)
    }
  }, [isFirst])

  // Phím tắt bàn phím
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        detectiveAudio.playPaperRustle()
        onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleNext, handlePrev, onClose])

  // Tính toán vị trí card thông minh để không tràn màn hình
  const cardPlacement = useMemo(() => {
    if (!spotlight) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const cardWidth = Math.min(460, windowSize.width - 32)
    const cardEstHeight = 360

    // Kiểm tra không gian các hướng
    const spaceBelow = windowSize.height - (spotlight.y + spotlight.height)
    const spaceAbove = spotlight.y
    const spaceRight = windowSize.width - (spotlight.x + spotlight.width)
    const spaceLeft = spotlight.x

    // 1. Nếu đủ chỗ bên phải (ví dụ dock bên trái hoặc tray bên trái)
    if (spaceRight >= cardWidth + 24 && spotlight.x < windowSize.width * 0.4) {
      return {
        top: Math.max(20, Math.min(windowSize.height - cardEstHeight - 20, spotlight.y)),
        left: spotlight.x + spotlight.width + 18,
      }
    }

    // 2. Nếu đủ chỗ bên trái (ví dụ bảng điều tra bên phải)
    if (spaceLeft >= cardWidth + 24 && spotlight.x > windowSize.width * 0.5) {
      return {
        top: Math.max(20, Math.min(windowSize.height - cardEstHeight - 20, spotlight.y)),
        left: Math.max(16, spotlight.x - cardWidth - 18),
      }
    }

    // 3. Nếu đủ chỗ phía trên (ví dụ bottom toolbar)
    if (spaceAbove >= cardEstHeight + 20) {
      const centerX = spotlight.x + spotlight.width / 2 - cardWidth / 2
      const clampedX = Math.max(16, Math.min(windowSize.width - cardWidth - 16, centerX))
      return {
        top: Math.max(16, spotlight.y - cardEstHeight - 16),
        left: clampedX,
      }
    }

    // 4. Nếu đủ chỗ phía dưới
    if (spaceBelow >= cardEstHeight + 20) {
      const centerX = spotlight.x + spotlight.width / 2 - cardWidth / 2
      const clampedX = Math.max(16, Math.min(windowSize.width - cardWidth - 16, centerX))
      return {
        top: spotlight.y + spotlight.height + 16,
        left: clampedX,
      }
    }

    // Mặc định căn giữa
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }, [spotlight, windowSize])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hướng dẫn Bàn hồ sơ tác nghiệp"
      className="fixed inset-0 z-[100] overflow-hidden select-none"
    >
      {/* 1. SVG LỚP PHỦ TỐI CÓ CUTOUT SPOTLIGHT */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id="canvas-tour-mask">
            {/* Màu trắng phủ toàn bộ -> giữ tối */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Hình chữ nhật màu đen -> khoét lỗ sáng trong suốt */}
            {spotlight && (
              <rect
                x={spotlight.x}
                y={spotlight.y}
                width={spotlight.width}
                height={spotlight.height}
                rx={spotlight.radius ?? 12}
                ry={spotlight.radius ?? 12}
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Nền đen bán trong suốt có áp dụng mặt nạ khoét lỗ */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(8, 7, 6, 0.82)"
          mask="url(#canvas-tour-mask)"
        />
      </svg>

      {/* 2. KHUNG VIỀN SPOTLIGHT HIỆU ỨNG TẬP TRUNG */}
      {spotlight && (
        <motion.div
          layoutId="canvas-spotlight-border"
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          style={{
            position: 'absolute',
            left: spotlight.x,
            top: spotlight.y,
            width: spotlight.width,
            height: spotlight.height,
            borderRadius: spotlight.radius ?? 12,
          }}
          className="pointer-events-none ring-2 ring-amber-400/70 shadow-[0_0_35px_rgba(217,160,102,0.35)]"
        />
      )}

      {/* 3. CARD HƯỚNG DẪN DIEGETIC NOIR */}
      <div
        style={{
          position: 'absolute',
          ...cardPlacement,
          maxWidth: 'calc(100vw - 32px)',
        }}
        className="z-10 w-[460px] pointer-events-auto"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl bg-[#14100c]/98 border border-[#3e2e20] shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-xl p-5 text-zinc-200 font-sans"
          >
            {/* Header: Bước hiện tại & Nút thoát */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#2a1f16]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#d9a066]/15 border border-[#d9a066]/30 text-[#e6b986] text-[11px] font-mono font-semibold tracking-wider uppercase">
                  Bước {currentStep.stepNumber} / {currentStep.totalSteps}
                </span>
                <span className="text-xs text-zinc-400 font-serif italic">
                  Bàn hồ sơ tác nghiệp
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playPaperRustle()
                  onClose()
                }}
                className="size-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors cursor-pointer"
                title="Đóng hướng dẫn (Esc)"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Nội dung bước */}
            <div className="pt-3.5 space-y-3">
              <div>
                <h3 className="text-base font-semibold text-[#f5ebd9] tracking-tight">
                  {currentStep.title}
                </h3>
                {currentStep.subtitle && (
                  <p className="text-xs text-amber-500/90 font-mono tracking-wide mt-0.5">
                    {currentStep.subtitle}
                  </p>
                )}
              </div>

              {/* Mô tả chi tiết */}
              <div className="text-[13px] text-zinc-300 leading-relaxed whitespace-pre-line space-y-1 bg-[#1a140f]/60 p-3 rounded-xl border border-[#2e2116]/80">
                {currentStep.description}
              </div>

              {/* Khối mẹo tác nghiệp */}
              {currentStep.actionHint && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-300 text-xs">
                  <Sparkles className="size-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <span className="leading-snug">{currentStep.actionHint}</span>
                </div>
              )}
            </div>

            {/* Điều khiển chân card */}
            <div className="mt-4 pt-3 border-t border-[#2a1f16] flex items-center justify-between">
              {/* Nút bỏ qua */}
              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playPaperRustle()
                  onClose()
                }}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-medium px-2 py-1.5 cursor-pointer"
              >
                Bỏ qua
              </button>

              {/* Nút tiến / lùi */}
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#221710] hover:bg-[#2e2017] border border-[#3e2e20] text-zinc-300 hover:text-white text-xs font-medium transition-all cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="size-3.5" />
                    <span>Trước</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#d9a066] hover:bg-[#e2af7b] active:bg-[#c89257] text-[#1a120b] text-xs font-semibold shadow-lg shadow-amber-950/50 transition-all cursor-pointer active:scale-95"
                >
                  <span>{isLast ? 'Hoàn tất' : 'Tiếp tục'}</span>
                  {isLast ? (
                    <Check className="size-3.5 stroke-[2.5]" />
                  ) : (
                    <ChevronRight className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>,
    document.body
  )
}
