'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Compass
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { detectiveAudio } from '@/lib/investigation-audio'
import { setStorageItem } from '@/lib/storage'
import {
  WALKTHROUGH_STEPS,
  WalkthroughStep
} from '@/lib/guides/interactive-walkthrough-data'
import type { PinPoint } from '@/components/investigation/hero-interactive'

const BOARD_BASE_WIDTH = 896
const BOARD_BASE_HEIGHT = 1200

interface InteractiveWalkthroughProps {
  isOpen: boolean
  onClose: () => void
  pins?: PinPoint[]
  canvasWrapperRef?: React.RefObject<HTMLDivElement | null>
}

export function InteractiveWalkthrough({
  isOpen,
  onClose,
  pins = [],
  canvasWrapperRef
}: InteractiveWalkthroughProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [spotlightRect, setSpotlightRect] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const step = WALKTHROUGH_STEPS[currentStepIndex] || WALKTHROUGH_STEPS[0]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === WALKTHROUGH_STEPS.length - 1

  // Map pins by ID for fast lookup
  const pinMap = useMemo(() => {
    const map = new Map<string, PinPoint>()
    pins.forEach((p) => map.set(p.id, p))
    return map
  }, [pins])

  // Calculate spotlight location precisely based on actual live board geometry
  useEffect(() => {
    if (!isOpen) return

    const updateSpotlight = () => {
      const container = canvasWrapperRef?.current || document.body
      const rect = container.getBoundingClientRect()

      if (step.targetType === 'canvas-center') {
        const width = Math.min(rect.width * 0.7, 650)
        const height = Math.min(rect.height * 0.6, 500)
        setSpotlightRect({
          x: rect.left + (rect.width - width) / 2,
          y: rect.top + (rect.height - height) / 2,
          width,
          height
        })
      } else if (step.targetType === 'pin' && step.targetPinId) {
        // Find pin by id in current live pins
        let targetPin = pinMap.get(step.targetPinId)
        if (!targetPin) {
          // Fallback search by prefix/label
          targetPin = pins.find(
            (p) =>
              p.id.includes(step.targetPinId!) ||
              (step.targetPinId === 'c0-pin-victim-khang' && p.id.includes('khang')) ||
              (step.targetPinId === 'c0-pin-phone' && p.id.includes('phone')) ||
              (step.targetPinId === 'c0-pin-suspects' && p.id.includes('suspect')) ||
              (step.targetPinId === 'c0-pin-reinvestigate' && p.id.includes('reinvestigate')) ||
              (step.targetPinId === 'c0-pin-indictment' && p.id.includes('indictment'))
          )
        }

        if (targetPin) {
          // Exact board bounds calculation matching HeroInteractive
          const boardX = rect.left + (rect.width - BOARD_BASE_WIDTH) / 2
          const boardY = rect.top + (rect.height - BOARD_BASE_HEIGHT) / 2

          const pinScreenX = boardX + targetPin.x * BOARD_BASE_WIDTH
          const pinScreenY = boardY + targetPin.y * BOARD_BASE_HEIGHT

          // Size of spotlight based on pin type
          const isPhoto = !!targetPin.photoUrl
          const spotWidth = isPhoto ? 160 : 130
          const spotHeight = isPhoto ? 170 : 120

          setSpotlightRect({
            x: Math.max(8, pinScreenX - spotWidth / 2),
            y: Math.max(8, pinScreenY - spotHeight / 2),
            width: spotWidth,
            height: spotHeight
          })
        } else {
          setSpotlightRect(null)
        }
      } else if (step.targetType === 'dom-selector' && step.domSelector) {
        const el = document.querySelector(step.domSelector)
        if (el) {
          const elRect = el.getBoundingClientRect()
          setSpotlightRect({
            x: elRect.left - 10,
            y: elRect.top - 10,
            width: elRect.width + 20,
            height: elRect.height + 20
          })
        } else {
          setSpotlightRect(null)
        }
      } else {
        setSpotlightRect(null)
      }
    }

    updateSpotlight()
    window.addEventListener('resize', updateSpotlight)
    return () => window.removeEventListener('resize', updateSpotlight)
  }, [isOpen, currentStepIndex, step, pinMap, pins, canvasWrapperRef])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        detectiveAudio.playPaperRustle()
        onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentStepIndex, isLastStep, onClose])

  if (!isOpen) return null

  const handleNext = () => {
    detectiveAudio.playTypewriterClick()
    if (isLastStep) {
      setStorageItem('walkthrough_completed', 'true')
      onClose()
    } else {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (isFirstStep) return
    detectiveAudio.playPaperRustle()
    setCurrentStepIndex((prev) => prev - 1)
  }

  const handleSkip = () => {
    detectiveAudio.playPaperRustle()
    setStorageItem('walkthrough_completed', 'true')
    onClose()
  }

  // Dynamic card placement: place opposite to the spotlight
  const isTargetInUpperHalf = spotlightRect
    ? spotlightRect.y + spotlightRect.height / 2 < window.innerHeight * 0.48
    : false

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-auto select-none overflow-hidden flex flex-col items-center justify-between p-3 sm:p-6">
        {/* SEMI-TRANSPARENT NOIR SPOTLIGHT BACKDROP */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-all duration-300 pointer-events-none" />

        {/* ANIMATED SPOTLIGHT CUTOUT / HIGHLIGHT BOX */}
        {spotlightRect && (
          <motion.div
            initial={false}
            animate={{
              x: spotlightRect.x,
              y: spotlightRect.y,
              width: spotlightRect.width,
              height: spotlightRect.height
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="absolute top-0 left-0 rounded-xl pointer-events-none border-2 border-amber-400/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.65),0_0_35px_rgba(245,158,11,0.6)] z-[101]"
          >
            {/* Glowing Corner Accents */}
            <div className="absolute -top-1.5 -left-1.5 size-3 border-t-2 border-l-2 border-amber-300" />
            <div className="absolute -top-1.5 -right-1.5 size-3 border-t-2 border-r-2 border-amber-300" />
            <div className="absolute -bottom-1.5 -left-1.5 size-3 border-b-2 border-l-2 border-amber-300" />
            <div className="absolute -bottom-1.5 -right-1.5 size-3 border-b-2 border-r-2 border-amber-300" />

            {/* Pulsing Target Radar Ring */}
            <span className="absolute inset-0 rounded-xl ring-2 ring-amber-400/70 animate-ping opacity-75" />
          </motion.div>
        )}

        {/* TOP SPACER / TOP POSITION */}
        <div className="w-full flex justify-center z-[102] pointer-events-none">
          {!isTargetInUpperHalf && step.targetType !== 'canvas-center' && (
            <motion.div
              key={`top-${step.id}`}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_30px_rgba(217,160,102,0.25)] rounded-none overflow-hidden flex flex-col pointer-events-auto"
            >
              <WalkthroughCardContent
                step={step}
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                currentStepIndex={currentStepIndex}
                onSkip={handleSkip}
                onPrev={handlePrev}
                onNext={handleNext}
                onSelectStep={(idx) => setCurrentStepIndex(idx)}
              />
            </motion.div>
          )}
        </div>

        {/* CENTER POSITION (For step 1) */}
        {step.targetType === 'canvas-center' && (
          <motion.div
            key={`center-${step.id}`}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_30px_rgba(217,160,102,0.25)] rounded-none overflow-hidden flex flex-col z-[102] my-auto pointer-events-auto"
          >
            <WalkthroughCardContent
              step={step}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              currentStepIndex={currentStepIndex}
              onSkip={handleSkip}
              onPrev={handlePrev}
              onNext={handleNext}
              onSelectStep={(idx) => setCurrentStepIndex(idx)}
            />
          </motion.div>
        )}

        {/* BOTTOM POSITION (When target is in upper half) */}
        <div className="w-full flex justify-center z-[102] pointer-events-none">
          {isTargetInUpperHalf && step.targetType !== 'canvas-center' && (
            <motion.div
              key={`bottom-${step.id}`}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_30px_rgba(217,160,102,0.25)] rounded-none overflow-hidden flex flex-col pointer-events-auto"
            >
              <WalkthroughCardContent
                step={step}
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                currentStepIndex={currentStepIndex}
                onSkip={handleSkip}
                onPrev={handlePrev}
                onNext={handleNext}
                onSelectStep={(idx) => setCurrentStepIndex(idx)}
              />
            </motion.div>
          )}
        </div>
      </div>
    </AnimatePresence>
  )
}

function WalkthroughCardContent({
  step,
  isFirstStep,
  isLastStep,
  currentStepIndex,
  onSkip,
  onPrev,
  onNext,
  onSelectStep
}: {
  step: WalkthroughStep
  isFirstStep: boolean
  isLastStep: boolean
  currentStepIndex: number
  onSkip: () => void
  onPrev: () => void
  onNext: () => void
  onSelectStep: (idx: number) => void
}) {
  return (
    <>
      {/* TOP CARD HEADER */}
      <div className="bg-[#ede3d1] px-3.5 py-2.5 sm:px-4 sm:py-3 border-b-2 border-[#2b1f14] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#8c1d1d] text-[#fbf8f1] font-mono text-[10px] font-bold uppercase tracking-wider rounded-none">
            Bước {step.stepNumber}/{step.totalSteps}
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#5c4026] uppercase tracking-wider flex items-center gap-1">
            <Compass className="size-3.5 text-[#8c1d1d]" />
            HƯỚNG DẪN ĐIỀU TRA
          </span>
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="p-1 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors border border-[#5c4026]/30 cursor-pointer"
          title="Bỏ qua hướng dẫn [Esc]"
        >
          <X className="size-3.5 sm:size-4" />
        </button>
      </div>

      {/* CARD BODY */}
      <div className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3 bg-[#f6f1e5]">
        <div className="space-y-0.5">
          <h3 className="font-mono font-bold text-xs sm:text-base text-[#1a120b] uppercase tracking-wide">
            {step.title}
          </h3>
          <p className="font-mono text-[11px] sm:text-xs text-[#8c1d1d] font-semibold italic">
            {step.subtitle}
          </p>
        </div>

        <p className="text-xs sm:text-[13px] text-[#2b1f14] leading-relaxed font-sans">
          {step.description}
        </p>

        {step.actionHint && (
          <div className="p-2 sm:p-2.5 bg-[#fef3c7] border border-[#d97706]/50 text-[#78350f] text-[11px] sm:text-xs font-sans rounded-none shadow-xs">
            <span>{step.actionHint}</span>
          </div>
        )}
      </div>

      {/* STEP INDICATOR DOTS */}
      <div className="bg-[#e7dcce] px-3.5 py-1.5 sm:px-4 sm:py-2 border-t border-[#2b1f14]/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {WALKTHROUGH_STEPS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                detectiveAudio.playTypewriterClick()
                onSelectStep(idx)
              }}
              className={cn(
                'transition-all cursor-pointer rounded-none',
                idx === currentStepIndex
                  ? 'w-5 sm:w-6 h-2 bg-[#8c1d1d]'
                  : 'w-2 h-2 bg-[#2b1f14]/30 hover:bg-[#2b1f14]/60'
              )}
              title={`Chuyển đến bước ${idx + 1}`}
            />
          ))}
        </div>

        <span className="font-mono text-[9px] sm:text-[10px] text-[#5c4026]">
          Phím ◄ ► để đổi bước
        </span>
      </div>

      {/* FOOTER ACTION BUTTONS */}
      <div className="bg-[#ede3d1] p-2.5 sm:p-3 border-t-2 border-[#2b1f14] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[#5c4026] hover:text-[#1a120b] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Bỏ qua
        </button>

        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrev}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#dfd3bd] hover:bg-[#d0c2a8] text-[#1a120b] font-mono text-xs font-bold uppercase tracking-wider border border-[#2b1f14]/40 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-3 sm:size-3.5" />
              <span>Lùi lại</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNext}
            className="px-3 sm:px-4 py-1 sm:py-1.5 bg-[#2b1f14] hover:bg-[#433020] text-[#f6f1e5] font-mono text-xs font-bold uppercase tracking-wider border border-[#140d08] shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{isLastStep ? 'Hoàn tất & Bắt đầu' : 'Tiếp theo'}</span>
            {isLastStep ? (
              <CheckCircle2 className="size-3 sm:size-3.5 text-amber-400" />
            ) : (
              <ChevronRight className="size-3 sm:size-3.5 text-amber-300" />
            )}
          </button>
        </div>
      </div>
    </>
  )
}
