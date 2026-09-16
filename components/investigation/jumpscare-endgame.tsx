'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * JumpscareEndgame — Case 000 "Trốn Tìm" Climax
 * 
 * Sequence:
 * Phase 1: FREEZE (4.5s) — Screen appears frozen, subtle flicker
 * Phase 2: COUNTING (~12s) — Audio plays: counting → creak → 90/95/100 → SLAM
 * Phase 3: FLASH (0.3s) — Full white screen flash
 * Phase 4: EYES (3.5s) — Wardrobe eyes image with slow zoom
 * Phase 5: TRANSITION (1s) — Fade to black → callback to epilogue
 */

type JumpscarePhase = 'idle' | 'freeze' | 'counting' | 'flash' | 'eyes' | 'transition' | 'done'

interface JumpscareEndgameProps {
  isActive: boolean
  onComplete: () => void
}

// Phase durations in ms
const PHASE_DURATIONS = {
  freeze: 4500,
  // counting: dynamic, based on audio duration
  flash: 300,
  eyes: 3500,
  transition: 1000,
} as const

export function JumpscareEndgame({ isActive, onComplete }: JumpscareEndgameProps) {
  const [phase, setPhase] = useState<JumpscarePhase>('idle')
  const [flickerOpacity, setFlickerOpacity] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const hasStartedRef = useRef(false)

  // Cleanup helper
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

  // Lock body scroll when active
  useEffect(() => {
    if (phase !== 'idle' && phase !== 'done') {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [phase])

  // Main sequence controller
  useEffect(() => {
    if (!isActive || hasStartedRef.current) return
    hasStartedRef.current = true

    // === PHASE 1: FREEZE ===
    setPhase('freeze')

    // Subtle screen flicker during freeze
    const flickerInterval = setInterval(() => {
      setFlickerOpacity(prev => prev === 1 ? 0.97 : 1)
    }, 1500)

    addTimeout(() => {
      clearInterval(flickerInterval)
      setFlickerOpacity(1)

      // === PHASE 2: COUNTING (audio) ===
      setPhase('counting')

      // Create and play audio
      const audio = new Audio('/audio/hide_and_seek_climax.mp3')
      audioRef.current = audio
      audio.volume = 0.8

      const onAudioEnd = () => {
        // Audio finished → flash
        addTimeout(() => {
          // === PHASE 3: FLASH ===
          setPhase('flash')

          addTimeout(() => {
            // === PHASE 4: EYES ===
            setPhase('eyes')

            addTimeout(() => {
              // === PHASE 5: TRANSITION ===
              setPhase('transition')

              addTimeout(() => {
                setPhase('done')
                onComplete()
              }, PHASE_DURATIONS.transition)
            }, PHASE_DURATIONS.eyes)
          }, PHASE_DURATIONS.flash)
        }, 200) // tiny pause after audio before flash
      }

      audio.addEventListener('ended', onAudioEnd)
      audio.play().catch(() => {
        // If audio can't play (autoplay blocked), skip to flash after timeout
        addTimeout(onAudioEnd, 15000)
      })
    }, PHASE_DURATIONS.freeze)

    return () => {
      clearInterval(flickerInterval)
      clearAllTimeouts()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [isActive, addTimeout, clearAllTimeouts, onComplete])

  // Reset when deactivated
  useEffect(() => {
    if (!isActive) {
      hasStartedRef.current = false
      setPhase('idle')
    }
  }, [isActive])

  if (phase === 'idle' || phase === 'done') return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] select-none"
        style={{ pointerEvents: 'all' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* === PHASE 1: FREEZE — Invisible overlay that blocks interaction === */}
        {phase === 'freeze' && (
          <motion.div
            className="absolute inset-0 bg-transparent"
            style={{ opacity: flickerOpacity, cursor: 'wait' }}
            initial={{ opacity: 1 }}
            animate={{ opacity: flickerOpacity }}
            transition={{ duration: 0.1 }}
          />
        )}

        {/* === PHASE 2: COUNTING — Dark overlay with subtle visual === */}
        {phase === 'counting' && (
          <motion.div
            className="absolute inset-0 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeIn' }}
          >
            {/* Subtle animated noise/grain texture */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                backgroundSize: '128px 128px',
              }}
            />

            {/* Faint pulsing vignette */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)',
              }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Very faint text that appears mid-way — "Trốn tìm..." */}
            <motion.p
              className="text-[#3a2a1a] text-xs sm:text-sm font-serif tracking-[0.3em] uppercase select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0.15, 0] }}
              transition={{ duration: 8, times: [0, 0.3, 0.7, 1], ease: 'easeInOut' }}
            >
              ... trốn tìm ...
            </motion.p>
          </motion.div>
        )}

        {/* === PHASE 3: FLASH — Blinding white flash === */}
        {phase === 'flash' && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 0.3,
              times: [0, 0.3, 0.6, 1],
              ease: 'easeOut',
            }}
          />
        )}

        {/* === PHASE 4: EYES — Wardrobe eyes reveal === */}
        {phase === 'eyes' && (
          <motion.div
            className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Dark vignette overlay */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 80%, rgba(0,0,0,0.95) 100%)',
              }}
            />

            {/* The wardrobe eyes image with slow creepy zoom */}
            <motion.img
              src="/images/jumpscare/wardrobe_eyes.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1.08, opacity: 1 }}
              transition={{
                scale: { duration: 3.5, ease: 'easeOut' },
                opacity: { duration: 0.5, ease: 'easeIn' },
              }}
              draggable={false}
            />

            {/* Scanline effect for noir feel */}
            <div
              className="absolute inset-0 z-20 pointer-events-none opacity-10"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
              }}
            />

            {/* Bottom text — "Đã tìm thấy..." */}
            <motion.div
              className="absolute bottom-8 sm:bottom-12 left-0 right-0 z-30 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1.2, ease: 'easeOut' }}
            >
              <p className="text-[#d9a066] text-xs sm:text-sm font-mono tracking-[0.25em] uppercase">
                Đã tìm thấy hung thủ
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* === PHASE 5: TRANSITION — Fade to black === */}
        {phase === 'transition' && (
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: 'easeIn' }}
          />
        )}

        {/* Skip button — small, unobtrusive, always available except during flash/transition */}
        {phase !== 'flash' && phase !== 'transition' && (
          <motion.button
            className="fixed bottom-4 right-4 z-[10000] text-[#666] hover:text-[#999] text-[10px] sm:text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer px-3 py-1.5 bg-black/30 backdrop-blur-sm border border-[#333] rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            whileHover={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            onClick={() => {
              clearAllTimeouts()
              if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
              }
              setPhase('done')
              onComplete()
            }}
          >
            Bỏ qua
          </motion.button>
        )}
      </div>
    </AnimatePresence>
  )
}
