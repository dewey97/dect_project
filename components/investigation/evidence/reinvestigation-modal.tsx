'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'

interface ReinvestigationModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Hotspot {
  id: string
  x: number // percentage
  y: number // percentage
  zoomScale: number
}

const HOTSPOTS: Hotspot[] = [
  { id: 'spot-1', x: 74, y: 25, zoomScale: 2.2 }, // Cửa sổ nhìn ra đèn ray tàu
  { id: 'spot-2', x: 20, y: 35, zoomScale: 2.0 }, // Cửa chính mở hé nhìn ra sân mưa & gốc xoan
  { id: 'spot-3', x: 58, y: 55, zoomScale: 1.8 }, // Bàn trà & ấm chén vỡ
  { id: 'spot-4', x: 90, y: 48, zoomScale: 1.8 }, // Chiếc tủ gỗ lim cổ điển
  { id: 'spot-5', x: 36, y: 62, zoomScale: 2.0 }  // Giỏ rác nhựa cạnh cửa
]

export function ReinvestigationModal({ isOpen, onClose }: ReinvestigationModalProps) {
  const [activeSpot, setActiveSpot] = useState<Hotspot | null>(null)

  if (!isOpen) return null

  const handleSpotClick = (spot: Hotspot) => {
    detectiveAudio.playTypewriterClick()
    if (activeSpot?.id === spot.id) {
      // Toggle zoom out if clicking same spot
      setActiveSpot(null)
    } else {
      setActiveSpot(spot)
    }
  }

  const handleResetZoom = () => {
    if (activeSpot) {
      detectiveAudio.playPaperRustle()
      setActiveSpot(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 font-mono text-[#f4e8d8]">
      <div className="bg-[#17100b] border-2 border-[#66462c] shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-w-5xl w-full h-[85vh] flex flex-col relative overflow-hidden rounded-xl">
        {/* CLOSE BUTTON AT TOP RIGHT */}
        <button
          type="button"
          onClick={() => {
            detectiveAudio.playPaperRustle()
            onClose()
          }}
          className="absolute top-4 right-4 z-30 p-2.5 bg-[#2d1b10]/90 hover:bg-[#422918] border border-[#593c26] text-[#d9a066] hover:text-white rounded-full transition-colors cursor-pointer backdrop-blur-md shadow-lg"
          title="Đóng khám xét"
        >
          <X className="size-6" />
        </button>

        {/* IMAGE / DIAGRAM CANVAS AREA */}
        <div 
          onClick={handleResetZoom}
          className="relative w-full h-full bg-[#0f0b07] overflow-hidden flex items-center justify-center cursor-default select-none"
        >
          {/* ZOOMABLE CONTAINER */}
          <motion.div
            className="relative w-full h-full flex items-center justify-center"
            animate={{
              scale: activeSpot ? activeSpot.zoomScale : 1,
              x: activeSpot ? `${(50 - activeSpot.x) * 1.5}%` : '0%',
              y: activeSpot ? `${(50 - activeSpot.y) * 1.5}%` : '0%',
            }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          >
            {/* REALISTIC SCENE PHOTO CONTAINER */}
            <div className="relative w-[92%] h-[88%] bg-[#1a130d] rounded-lg border border-[#3b281c] flex items-center justify-center shadow-2xl overflow-hidden">
              {/* PHOTOREALISTIC CRIME SCENE IMAGE */}
              <img
                src="/images/cases/case_000/photo-reinvestigation-room-realistic.jpg"
                alt="Ảnh hiện trường phòng khách khám xét lại"
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* RED DOT HOTSPOTS */}
              {HOTSPOTS.map((spot) => {
                const isActive = activeSpot?.id === spot.id

                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSpotClick(spot)
                    }}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group p-2"
                  >
                    <div className="relative flex items-center justify-center">
                      {/* PULSING RING */}
                      <div
                        className={`absolute -inset-3 rounded-full border border-red-500/60 ${
                          isActive ? 'animate-ping border-amber-400' : 'animate-pulse'
                        }`}
                      />
                      
                      {/* SIMPLE RED DOT */}
                      <div
                        className={`size-4 rounded-full border-2 transition-all ${
                          isActive
                            ? 'bg-amber-400 border-white scale-125 shadow-[0_0_15px_rgba(251,191,36,0.9)]'
                            : 'bg-red-600 border-red-200 group-hover:scale-125 group-hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                        }`}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

