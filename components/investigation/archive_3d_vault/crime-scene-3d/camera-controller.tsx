'use client'

import React from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ControllerState } from './types'

// ==========================================
// 360 FIRST-PERSON CRIME SCENE CONTROLLER
// ==========================================
export function FirstPersonRoomCamera({
  stateRef,
  onHeadingChange
}: {
  stateRef: React.MutableRefObject<ControllerState>
  onHeadingChange: (heading: number) => void
}) {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const s = stateRef.current

    s.lon = THREE.MathUtils.damp(s.lon, s.targetLon, 12, delta)
    s.lat = THREE.MathUtils.damp(s.lat, s.targetLat, 12, delta)
    s.lat = Math.max(-85, Math.min(85, s.lat))

    s.currentPos.lerp(s.targetPos, 0.09)
    camera.position.copy(s.currentPos)

    s.fov = THREE.MathUtils.damp(s.fov, s.targetFov, 10, delta)
    if (camera instanceof THREE.PerspectiveCamera) {
      if (Math.abs(camera.fov - s.fov) > 0.1) {
        camera.fov = s.fov
        camera.updateProjectionMatrix()
      }
    }

    const phi = THREE.MathUtils.degToRad(90 - s.lat)
    const theta = THREE.MathUtils.degToRad(s.lon)

    const lookTarget = new THREE.Vector3(
      s.currentPos.x + 10 * Math.sin(phi) * Math.sin(theta),
      s.currentPos.y + 10 * Math.cos(phi),
      s.currentPos.z + 10 * Math.sin(phi) * Math.cos(theta)
    )

    camera.lookAt(lookTarget)

    const curHeading = Math.round((s.lon % 360) + 360) % 360
    onHeadingChange(curHeading)
  })

  return null
}

// ==========================================
// MINIMAL FLOATING NEEDLE COMPASS
// ==========================================
export function MinimalNeedleCompass({ heading }: { heading: number }) {
  const needleRotation = heading - 180

  return (
    <div
      className="absolute top-3 left-3 z-20 pointer-events-none size-10 sm:size-11 rounded-full bg-black/60 border border-[#8c5e35]/40 backdrop-blur-md shadow-lg flex items-center justify-center select-none"
      title={`Hướng la bàn: ${Math.round((heading % 360) + 360) % 360}°`}
    >
      <span className="absolute top-1 text-[8px] font-mono font-black text-red-500/90 leading-none">
        N
      </span>
      <div
        className="relative size-7 flex items-center justify-center transition-transform duration-75 ease-out"
        style={{ transform: `rotate(${needleRotation}deg)` }}
      >
        <div className="absolute -top-0.5 w-0 h-0 border-x-[3px] border-x-transparent border-b-[13px] border-b-[#ef4444] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
        <div className="absolute -bottom-0.5 w-0 h-0 border-x-[3px] border-x-transparent border-t-[13px] border-t-[#cbd5e1] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
        <div className="relative size-1.5 rounded-full bg-white border border-gray-900 shadow-sm" />
      </div>
    </div>
  )
}
