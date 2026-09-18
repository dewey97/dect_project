'use client'

import React from 'react'
import { Html } from '@react-three/drei'
import { RoomHotspot } from '../types'
import { CRIME_SCENE_HOTSPOTS } from '../constants'

// ==========================================
// 3D ROOM HOTSPOT PINS (8 CHUẨN ĐIỂM KHÁM XÉT HIỆN TRƯỜNG)
// ==========================================
export function RoomHotspotPins({
  onSelectSpot,
  activeSpotId
}: {
  onSelectSpot: (spot: RoomHotspot) => void
  activeSpotId?: string | null
}) {
  return (
    <>
      {CRIME_SCENE_HOTSPOTS.map((spot) => {
        const isActive = activeSpotId === spot.id
        if (isActive) return null

        return (
          <group key={spot.id} position={spot.position}>
            <Html center>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectSpot(spot)
                }}
                className="group relative cursor-pointer focus:outline-none p-1 select-none"
                aria-label={spot.title}
              >
                {/* FIXED SIZE CIRCULAR NUMBER PIN */}
                <div className="size-6 rounded-full bg-white hover:bg-amber-100 text-neutral-900 font-sans font-bold text-[11px] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.6)] border border-neutral-300 transition-transform duration-150 group-hover:scale-120 active:scale-95">
                  {spot.num}
                </div>

                {/* SLEEK FLOATING TOOLTIP ON HOVER */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap bg-neutral-900/95 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-xl border border-white/15 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md z-30">
                  <span>
                    {spot.num}. {spot.shortName}
                  </span>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-neutral-900" />
                </div>
              </button>
            </Html>
          </group>
        )
      })}
    </>
  )
}
