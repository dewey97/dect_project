'use client'

import React, { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { RoomHotspot, CrimeSceneRoom3DProps, ControllerState } from './types'
import { CeilingProps, DustParticles } from './subcomponents/ceiling-props'
import { CrimeSceneGeometry } from './crime-scene-geometry'
import { FirstPersonRoomCamera, MinimalNeedleCompass } from './camera-controller'

export * from './types'
export * from './constants'

// ==========================================
// MAIN 3D CRIME SCENE ROOM COMPONENT
// ==========================================
export function CrimeSceneRoom3D({ onSelectSpot }: CrimeSceneRoom3DProps) {
  const [activeSpot, setActiveSpot] = useState<RoomHotspot | null>(null)
  const [heading, setHeading] = useState<number>(180)

  const controllerState = useRef<ControllerState>({
    lon: 180,
    lat: -5,
    targetLon: 180,
    targetLat: -5,
    targetPos: new THREE.Vector3(0, 1.62, 0.5),
    currentPos: new THREE.Vector3(0, 1.62, 0.5),
    fov: 65,
    targetFov: 65,
    isInteracting: false,
    downX: 0,
    downY: 0,
    downLon: 180,
    downLat: -5
  })

  const handlePointerDown = (e: React.PointerEvent) => {
    const s = controllerState.current
    s.isInteracting = true
    s.downX = e.clientX
    s.downY = e.clientY
    s.downLon = s.targetLon
    s.downLat = s.targetLat
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const s = controllerState.current
    if (!s.isInteracting) return

    const factor = (s.fov / 65) * 0.22
    s.targetLon = s.downLon + (e.clientX - s.downX) * factor
    s.targetLat = s.downLat + (s.downY - e.clientY) * factor
  }

  const handlePointerUp = () => {
    controllerState.current.isInteracting = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const s = controllerState.current
    s.targetFov = Math.max(30, Math.min(85, s.targetFov + e.deltaY * 0.05))
  }

  const handleZoom = (delta: number) => {
    const s = controllerState.current
    s.targetFov = Math.max(30, Math.min(85, s.targetFov + delta))
  }

  // Smooth Fly-to Zoom into specific numbered evidence in real-time 3D
  const handleFocusSpot = (spot: RoomHotspot) => {
    setActiveSpot(spot)
    const s = controllerState.current
    s.targetPos.set(...spot.targetCamera.pos)
    s.targetLon = spot.targetCamera.lon
    s.targetLat = spot.targetCamera.lat
    s.targetFov = spot.targetCamera.fov
    if (onSelectSpot) {
      onSelectSpot(spot)
    }
  }

  // Reset back to overview standing position
  const handleResetView = () => {
    setActiveSpot(null)
    const s = controllerState.current
    s.targetPos.set(0, 1.62, 0.5)
    s.targetLon = 180
    s.targetLat = -5
    s.targetFov = 65
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      className="relative w-full h-full bg-[#1e293b] select-none overflow-hidden cursor-grab active:cursor-grabbing touch-none"
    >
      {/* 3D CANVAS VIEWPORT */}
      <Canvas
        shadows={{
          type: THREE.PCFSoftShadowMap
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
        camera={{ position: [0, 1.62, 0.5], fov: 65 }}
        className="w-full h-full block"
      >
        <color attach="background" args={['#334155']} />
        <ambientLight intensity={0.28} color="#fed7aa" />

        <CeilingProps />

        <DustParticles count={100} />

        <CrimeSceneGeometry
          onSelectSpot={handleFocusSpot}
          activeSpotId={activeSpot?.id ?? null}
        />

        <FirstPersonRoomCamera
          stateRef={controllerState}
          onHeadingChange={setHeading}
        />
      </Canvas>

      {/* TOP-LEFT MINIMAL FLOATING NEEDLE COMPASS */}
      <MinimalNeedleCompass heading={heading} />

      {/* TOP-RIGHT UNOBTRUSIVE 3D EVIDENCE INSPECTION CARD */}
      {activeSpot && (
        <div className="absolute top-3 right-3 z-30 max-w-xs sm:max-w-sm bg-[#120b07]/92 border border-[#8c5e35] p-3 rounded-xl backdrop-blur-md shadow-2xl text-left pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#4d321c]">
            <div className="flex items-center gap-1.5 text-white font-bold text-xs">
              <span className="size-4.5 rounded-full bg-white text-[#18181b] text-[10.5px] font-bold flex items-center justify-center shadow-sm font-sans shrink-0">
                {activeSpot.num}
              </span>
              <span className="text-[11.5px] font-sans font-bold uppercase truncate text-amber-300">
                {activeSpot.shortName}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleResetView()
              }}
              className="text-[#a8825c] hover:text-white p-1 rounded transition-colors cursor-pointer"
              title="Thoát soi cận cảnh (Quay lại toàn cảnh)"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-[#e2d5c5] mt-1.5 leading-relaxed font-sans">
            {activeSpot.detail}
          </p>
        </div>
      )}

      {/* FLOATING BACK TO DEFAULT VIEW BUTTON */}
      {activeSpot && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleResetView()
            }}
            className="px-4 py-2 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white border border-white/20 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold tracking-wide transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer select-none"
          >
            <RotateCcw className="size-3.5 text-amber-400" />
            <span>Quay lại toàn cảnh</span>
          </button>
        </div>
      )}

      {/* BOTTOM-RIGHT FLOATING ZOOM & RESET CONTROLS */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-black/85 border border-[#593c26] p-1.5 rounded-xl backdrop-blur-md shadow-2xl">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleZoom(-8)
          }}
          className="p-1.5 text-[#d9a066] hover:text-white hover:bg-[#382314] rounded-lg transition-colors cursor-pointer"
          title="Phóng to (Zoom In)"
        >
          <ZoomIn className="size-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleZoom(8)
          }}
          className="p-1.5 text-[#d9a066] hover:text-white hover:bg-[#382314] rounded-lg transition-colors cursor-pointer"
          title="Thu nhỏ (Zoom Out)"
        >
          <ZoomOut className="size-4" />
        </button>
        <div className="w-px h-4 bg-[#593c26]" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleResetView()
          }}
          className="p-1.5 text-[#d9a066] hover:text-white hover:bg-[#382314] rounded-lg transition-colors cursor-pointer"
          title="Đặt lại toàn cảnh (Reset)"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
    </div>
  )
}

export default CrimeSceneRoom3D
