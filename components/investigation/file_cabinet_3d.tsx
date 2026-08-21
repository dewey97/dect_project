'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CaseFile } from './3d-cabinet/cabinet-types'
import { DRAWERS_3D_DATA } from './3d-cabinet/cabinet-data'
import { MetallicDrawer3D } from './3d-cabinet/metallic-drawer-3d'
import { SwingingCeilingLamp } from './3d-cabinet/swinging-ceiling-lamp'
import { DossierSlideOverModal } from './3d-cabinet/dossier-slide-over-modal'

function CameraRig({
  activeDrawerId,
  isInspecting,
}: {
  activeDrawerId: string | null
  isInspecting: boolean
}) {
  const lookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0))

  useFrame((state, delta) => {
    const activeDrawer = DRAWERS_3D_DATA.find((d) => d.id === activeDrawerId)

    let targetCamPos: [number, number, number] = [0, 0, 10.6]
    let targetLookAt: [number, number, number] = [0, 0, 0]

    if (activeDrawer) {
      const [x, y, z] = activeDrawer.position
      // Đặt camera ở x + 1.8m và nhìn vào x + 0.9m để hộc tủ 3D lướt hẳn sang nửa trái màn hình
      const camX = isInspecting ? x + 1.8 : x
      const lookX = isInspecting ? x + 0.9 : x

      targetCamPos = [camX, y + 2.1, z + 2.8]
      targetLookAt = [lookX, y - 0.1, z + 0.5]
    }

    const step = Math.min(delta * 3.5, 1)

    // Smooth Lerp Camera Position
    state.camera.position.x += (targetCamPos[0] - state.camera.position.x) * step
    state.camera.position.y += (targetCamPos[1] - state.camera.position.y) * step
    state.camera.position.z += (targetCamPos[2] - state.camera.position.z) * step

    // Smooth Lerp Camera LookAt Target
    lookAtRef.current.x += (targetLookAt[0] - lookAtRef.current.x) * step
    lookAtRef.current.y += (targetLookAt[1] - lookAtRef.current.y) * step
    lookAtRef.current.z += (targetLookAt[2] - lookAtRef.current.z) * step

    state.camera.lookAt(lookAtRef.current)
  })

  return null
}

function Scene3DRig({
  activeDrawerId,
  isInspecting,
  onSelectDrawer,
  onSelectFile,
}: {
  activeDrawerId: string | null
  isInspecting: boolean
  onSelectDrawer: (id: string | null) => void
  onSelectFile: (file: CaseFile) => void
}) {
  return (
    <>
      {/* DIEU KHIEN CHUYEN DONG CAMERA LERPS AP SAT TOC DO CAO */}
      <CameraRig activeDrawerId={activeDrawerId} isInspecting={isInspecting} />

      {/* ÁNH SÁNG NỀN VÀNG ẤM SÁNG RÕ TOÀN BỘ 60 Ô TỦ */}
      <ambientLight intensity={1.6} color="#ffffff" />
      <directionalLight position={[10, 15, 12]} intensity={3.5} color="#ffffff" castShadow />
      <directionalLight position={[-10, 8, 10]} intensity={2.2} color="#f0f9ff" />

      {/* ĐÈN CHAO TREO TRẦN LẮC LƯ CON LẮC ĐƠN VẬT LÝ */}
      <SwingingCeilingLamp />

      {/* TƯỜNG SẮT VÒM TỦ PHÍA SAU - BAO PHỦ 60 Ô TỦ (26.0m x 11m) */}
      <mesh position={[0, 0, -0.35]} onClick={() => onSelectDrawer(null)}>
        <boxGeometry args={[26.0, 11.0, 0.5]} />
        <meshStandardMaterial color="#27272a" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* CÁC ĐƯỜNG GỜ VÁT KIM LOẠI DỌC GIỮA CÁC CỘT TỦ (VERTICAL STEEL BEAMS) */}
      {[-10.575, -8.225, -5.875, -3.525, -1.175, 1.175, 3.525, 5.875, 8.225, 10.575].map((xPos) => (
        <mesh key={`v-beam-${xPos}`} position={[xPos, 0, -0.05]}>
          <boxGeometry args={[0.1, 10.8, 0.25]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.92} roughness={0.2} />
        </mesh>
      ))}

      {/* CÁC ĐƯỜNG GỜ THÉP NGANG PHÂN CHIA HÀNG TỦ (HORIZONTAL STEEL SHELF DIVIDERS) */}
      {[-4.65, -2.95, -1.25, 0.45, 2.15, 3.85].map((yPos) => (
        <mesh key={`h-beam-${yPos}`} position={[0, yPos, -0.05]}>
          <boxGeometry args={[25.8, 0.08, 0.22]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.92} roughness={0.2} />
        </mesh>
      ))}

      {/* RỜI CÁC HỘC TỦ 3D */}
      {DRAWERS_3D_DATA.map((drawer) => (
        <MetallicDrawer3D
          key={drawer.id}
          drawer={drawer}
          isOpen={activeDrawerId === drawer.id}
          isAnyOpen={activeDrawerId !== null}
          onSelect={() => {
            if (activeDrawerId !== null) {
              // Khi đang mở 1 hộc tủ, nhấp bất kỳ đâu đều sẽ gấp đóng hộc tủ out về góc nhìn toàn cảnh
              onSelectDrawer(null)
            } else {
              onSelectDrawer(drawer.id)
            }
          }}
          onSelectFile={onSelectFile}
        />
      ))}
    </>
  )
}

export default function Real3DFilingCabinet() {
  const router = useRouter()
  const [activeDrawerId, setActiveDrawerId] = useState<string | null>(null)
  const [inspectingFile, setInspectingFile] = useState<CaseFile | null>(null)

  const [inputCode, setInputCode] = useState('')
  const [activationError, setActivationError] = useState<string | null>(null)
  const [activatedCase, setActivatedCase] = useState<string | null>(null)

  const handleVerifyCode = (targetFile: CaseFile) => {
    const cleanCode = inputCode.trim().toUpperCase()
    if (!cleanCode) {
      setActivationError('Vui lòng nhập mã kích hoạt!')
      return
    }

    // Đang chế độ test: Chấp nhận mọi mã nhập vào và chuyển thẳng tới /evidence
    setActivatedCase(targetFile.id)
    setActivationError(null)
    router.push('/evidence')
  }

  const handleSelectDrawer = (id: string | null) => {
    setActiveDrawerId(id)
    if (id === null) {
      setInspectingFile(null)
    }
  }

  return (
    <div className="relative w-full h-full min-h-screen bg-stone-950 font-mono select-none overflow-hidden flex flex-col justify-between">
      {/* 3D WebGL Canvas Stage - Fullscreen Fit */}
      <div className="relative w-full h-full">
        <Canvas camera={{ position: [0, 0, 10.6], fov: 54 }}>
          <Scene3DRig
            activeDrawerId={activeDrawerId}
            isInspecting={inspectingFile !== null}
            onSelectDrawer={handleSelectDrawer}
            onSelectFile={(file) => {
              setInspectingFile(file)
              setInputCode('')
              setActivationError(null)
            }}
          />
        </Canvas>
      </div>

      {/* FLOATING SLIDE-OVER RIGHT PANEL */}
      <DossierSlideOverModal
        inspectingFile={inspectingFile}
        inputCode={inputCode}
        activationError={activationError}
        activatedCase={activatedCase}
        onClose={() => setInspectingFile(null)}
        onChangeInputCode={(code) => {
          setInputCode(code)
          setActivationError(null)
        }}
        onVerifyCode={handleVerifyCode}
      />
    </div>
  )
}
