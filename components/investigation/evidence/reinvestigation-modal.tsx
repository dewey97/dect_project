'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Volume2
} from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'

interface ReinvestigationModalProps {
  isOpen: boolean
  onClose: () => void
}

export interface ReinvestigationHotspot2D {
  id: string
  num: number
  photoNumber: '9' | '11' | '15' | '17' | '18'
  x: number // percentage 0-100 for 2D flat view
  y: number // percentage 0-100 for 2D flat view
  imageUrl: string
  soundFile: string
  soundCaption: string
}

// 5 ĐIỂM KHÁM XÉT CHI TIẾT TRÊN TOÀN CẢNH NỐI LIỀN 14 & 16
export const HOTSPOTS_2D_LIST: ReinvestigationHotspot2D[] = [
  {
    id: 'spot-15',
    num: 1,
    photoNumber: '15',
    x: 20.2,
    y: 34,
    imageUrl: '/images/cases/case_000/15.png',
    soundFile: 'train sound.mp3',
    soundCaption: '*Tu tu... Xình xịch...*'
  },
  {
    id: 'spot-17',
    num: 2,
    photoNumber: '17',
    x: 58.5,
    y: 56,
    imageUrl: '/images/cases/case_000/17.png',
    soundFile: 'Sound tủ.mp3',
    soundCaption: '*Két... Cạch...*'
  },
  {
    id: 'spot-9',
    num: 3,
    photoNumber: '9',
    x: 6.4,
    y: 62,
    imageUrl: '/images/cases/case_000/9.png',
    soundFile: 'breaking.mp3',
    soundCaption: '*Choang! Xoảng...*'
  },
  {
    id: 'spot-18',
    num: 4,
    photoNumber: '18',
    x: 15.4,
    y: 62,
    imageUrl: '/images/cases/case_000/18.png',
    soundFile: 'Clack.mp3',
    soundCaption: '*Cạch... cạch...*'
  },
  {
    id: 'spot-11',
    num: 5,
    photoNumber: '11',
    x: 9.6,
    y: 78,
    imageUrl: '/images/cases/case_000/11.png',
    soundFile: 'sột soạt.mp3',
    soundCaption: '*Sột soạt... sột soạt...*'
  }
]

export function ReinvestigationModal({ isOpen, onClose }: ReinvestigationModalProps) {
  const [selectedSpot, setSelectedSpot] = useState<ReinvestigationHotspot2D | null>(null)
  const [activeAudioToast, setActiveAudioToast] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragDistanceRef = useRef(0)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 })

  // Track container dimensions on resize
  useEffect(() => {
    if (!isOpen) return
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 1200,
          height: containerRef.current.clientHeight || 800
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [isOpen])

  if (!isOpen) return null

  const playCustomSfx = (filename: string) => {
    try {
      const audio = new Audio(`/audio/sfx/${encodeURIComponent(filename)}`)
      audio.volume = 0.9
      audio.play().catch(() => {})
    } catch {}
  }

  const handleSpotClick = (spot: ReinvestigationHotspot2D) => {
    // If user was dragging across the scene in 2D, prevent opening modal
    if (dragDistanceRef.current > 6) return

    playCustomSfx(spot.soundFile)
    setActiveAudioToast(spot.soundCaption)
    setSelectedSpot(spot)

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = setTimeout(() => {
      setActiveAudioToast(null)
    }, 4500)
  }

  // Calculate dynamic drag bounds based on container dimensions for connected panorama
  const imageAspect = 7230 / 1080
  const renderedHeight = containerSize.height || 800
  const renderedWidth = renderedHeight * imageAspect
  const maxDragX = Math.max(0, (renderedWidth - containerSize.width) / 2)

  return (
    <div className="fixed inset-0 bg-[#080503] z-50 flex flex-col font-mono text-[#f4e8d8] select-none overflow-hidden w-screen h-[100dvh]">
      {/* SCANLINES EFFECT */}
      <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-15 z-10" />

      {/* TOP HEADER / STATUS BAR */}
      <div className="relative z-30 bg-[#160d07] border-b-2 border-[#3d2412] px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#f5ebd9] tracking-wider uppercase">
                KHÁM XÉT LẠI HIỆN TRƯỜNG
              </span>
            </div>
            <p className="text-[11px] text-[#9e7a56] hidden sm:block">
              Kéo ảnh sang trái/phải để lia toàn cảnh nối liền giữa 2 góc phòng • Bấm vào các điểm đỏ để soi chi tiết
            </p>
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              detectiveAudio.playPaperRustle()
              onClose()
            }}
            className="p-1.5 bg-[#2b170c] hover:bg-[#422413] border border-[#59341c] text-[#d9a066] hover:text-white rounded-none transition-colors cursor-pointer ml-1"
            title="Đóng bảng khám xét"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* MAIN VIEW AREA: 2D TOÀN CẢNH NỐI LIỀN */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full overflow-hidden bg-[#060402] flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {/* DRAGGABLE 2D PANORAMIC CANVAS AREA */}
        <motion.div
          drag="x"
          dragMomentum={true}
          dragElastic={0.08}
          dragConstraints={{
            left: -maxDragX,
            right: maxDragX
          }}
          onDragStart={() => {
            setIsDragging(true)
            dragDistanceRef.current = 0
          }}
          onDrag={(_, info) => {
            dragDistanceRef.current += Math.abs(info.delta.x) + Math.abs(info.delta.y)
          }}
          onDragEnd={() => {
            setTimeout(() => {
              setIsDragging(false)
              dragDistanceRef.current = 0
            }, 50)
          }}
          style={{
            width: renderedWidth,
            height: renderedHeight
          }}
          className="relative shrink-0 select-none touch-none flex items-center justify-center"
        >
          {/* CRIME SCENE REALISTIC ROOM 2D IMAGE (NỐI LIỀN 14 VÀ 16 QUA 2 GÓC TƯỜNG) */}
          <img
            src="/images/cases/case_000/panorama_2d_connected_14_16.jpg"
            alt="Toàn cảnh phòng khách hiện trường nối liền ảnh 14 và 16"
            draggable={false}
            className="w-full h-full object-cover pointer-events-none rounded-none shadow-2xl border border-[#26150b]"
          />

          {/* HOTSPOT PINS OVERLAY (CHẤM ĐỎ ĐÁNH SỐ THỨ TỰ) */}
          {HOTSPOTS_2D_LIST.map((spot) => {
            const isSelected = selectedSpot?.id === spot.id
            return (
              <div
                key={spot.id}
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <button
                  type="button"
                  onClick={() => handleSpotClick(spot)}
                  className="group relative flex items-center justify-center cursor-pointer focus:outline-none p-2"
                  aria-label={`Điểm khám xét #${spot.num}`}
                >
                  {/* Numbered Solid Red Pin */}
                  <div
                    className={`size-6 sm:size-7 rounded-full text-white font-bold text-xs sm:text-[13px] font-mono flex items-center justify-center shadow-lg transition-transform duration-150 group-hover:scale-125 border ${
                      isSelected
                        ? 'bg-amber-500 border-amber-200 text-neutral-950 ring-2 ring-amber-400/80 scale-125'
                        : 'bg-[#cc1818] group-hover:bg-[#ee2222] border-[#ffe4e4]/80'
                    }`}
                  >
                    {spot.num}
                  </div>
                </button>
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* LIGHTBOX PHOTO ZOOM MODAL */}
      <AnimatePresence>
        {selectedSpot && (
          <div
            onClick={() => setSelectedSpot(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-8 cursor-zoom-out select-none"
          >
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[92vw] max-h-[88vh] flex items-center justify-center"
            >
              {/* CLOSE BUTTON */}
              <button
                type="button"
                onClick={() => setSelectedSpot(null)}
                className="absolute -top-3 -right-3 z-30 p-2 bg-[#1a0f08] hover:bg-[#331c0e] border-2 border-[#59341c] text-[#f4e8d8] rounded-full shadow-2xl transition-all cursor-pointer"
                title="Đóng ảnh"
              >
                <X className="size-5" />
              </button>

              {/* HIGH-RES EVIDENCE PHOTO */}
              <img
                src={selectedSpot.imageUrl}
                alt={`Vật chứng ảnh #${selectedSpot.photoNumber}`}
                className="max-w-[92vw] max-h-[88vh] object-contain shadow-[0_30px_90px_rgba(0,0,0,0.98)] border-2 border-[#3d2412] rounded-none bg-[#0a0604]"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUDIO SUBTITLE TOAST AT BOTTOM LEFT (DÙNG CHUNG CHO CẢ 2D, 3D VÀ 360) */}
      <AnimatePresence>
        {activeAudioToast && (
          <motion.div
            initial={{ opacity: 0, y: 15, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-6 z-50 bg-[#120a05]/95 border border-[#59341c] text-[#f4e8d8] px-4 py-2.5 rounded shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-sm pointer-events-none"
          >
            <Volume2 className="size-4 text-amber-400 shrink-0" />
            <motion.span
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="font-mono text-sm text-[#f5ebd9] italic font-semibold tracking-wider"
            >
              {activeAudioToast}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
