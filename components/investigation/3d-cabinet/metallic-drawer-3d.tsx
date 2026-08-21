'use client'

import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CaseFile, DrawerData } from './cabinet-types'
import { InteractiveFileFolder3D } from './interactive-file-folder-3d'

export function MetallicDrawer3D({
  drawer,
  isOpen,
  isAnyOpen,
  onSelect,
  onSelectFile,
}: {
  drawer: DrawerData
  isOpen: boolean
  isAnyOpen: boolean
  onSelect: () => void
  onSelectFile: (file: CaseFile) => void
}) {
  const meshRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)
  const [currentZ, setCurrentZ] = useState(0)

  // Khóa hover khi đã có 1 tủ khác đang mở
  const effectiveHovered = hovered && (!isAnyOpen || isOpen)

  // Canvas Texture in mã số thẻ nhãn kim loại titan mạ đen khắc chữ bạc sáng
  const labelTexture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 96
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Nền kim loại đen nhám xám sẫm
      ctx.fillStyle = '#141416'
      ctx.fillRect(0, 0, 256, 96)
      // Viền khung nhôm titan sáng
      ctx.strokeStyle = '#52525b'
      ctx.lineWidth = 4
      ctx.strokeRect(6, 6, 244, 84)
      // Nét chữ bạc xám sáng khắc chìm
      ctx.fillStyle = '#e4e4e7'
      ctx.font = 'bold 42px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(drawer.code, 128, 48)
    }
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [drawer.code])

  // Canvas Texture mặt kim loại gang đúc xước sần & sờn góc 4 cạnh
  const metalTexture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // 1. Nền kim loại gang đúc xám sẫm
      ctx.fillStyle = '#26262a'
      ctx.fillRect(0, 0, 512, 300)

      // 2. Hạt noise nếp sần gang đúc (Cast iron grain noise)
      for (let i = 0; i < 900; i++) {
        const nx = Math.random() * 512
        const ny = Math.random() * 300
        const opacity = Math.random() * 0.12
        ctx.fillStyle = i % 2 === 0 ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity * 1.5})`
        ctx.fillRect(nx, ny, 2, 2)
      }

      // 3. Vết xước kim loại phay xước nhẹ vừa phải (Brushed metal hairline scratches)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
      ctx.lineWidth = 1.2
      for (let i = 0; i < 40; i++) {
        const sx = Math.random() * 500
        const sy = Math.random() * 290
        const len = 15 + Math.random() * 50
        const angle = -0.05 + (Math.random() - 0.5) * 0.25
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len)
        ctx.stroke()
      }

      // 4. Sờn xước sáng bạc 4 góc & viền kim loại mài sờn (Scuffed metallic edge highlights)
      ctx.strokeStyle = 'rgba(212, 212, 216, 0.40)'
      ctx.lineWidth = 4
      ctx.strokeRect(5, 5, 502, 290)

      const corners = [
        [10, 10], [502, 10], [10, 290], [502, 290]
      ]
      corners.forEach(([cx, cy]) => {
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 30)
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.48)')
        grad.addColorStop(0.5, 'rgba(212, 212, 216, 0.22)')
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, 30, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    // Rút tủ ra 1.85m khi click mở
    const targetZ = isOpen ? 1.85 : 0
    const step = Math.min(delta * 4.5, 1)

    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * step
    setCurrentZ(meshRef.current.position.z)
  })

  return (
    <group ref={meshRef} position={drawer.position}>
      {/* 1. MẶT TỦ KIM LOẠI 3D (FRONT PANEL) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          if (!isAnyOpen || isOpen) document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[2.0, 1.2, 0.2]} />
        <meshStandardMaterial
          map={metalTexture || undefined}
          color={effectiveHovered ? '#cccccc' : '#e4e4e7'}
          metalness={0.85}
          roughness={0.26}
        />
      </mesh>

      {/* 2. VIỀN GỜ KIM LOẠI TỦ (BEVEL OUTER FRAME) */}
      <mesh position={[0, 0, 0.18]}>
        <boxGeometry args={[2.05, 1.25, 0.04]} />
        <meshStandardMaterial color={effectiveHovered ? '#71717a' : '#52525b'} metalness={0.92} roughness={0.15} />
      </mesh>

      {/* 3. Ổ KHÓA TRÒN 3D CHUYÊN DỤNG (KEY LOCK CYLINDER) */}
      <mesh position={[0.78, 0.38, 0.22]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#27272a" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Lỗ khóa chìa */}
      <mesh position={[0.78, 0.38, 0.26]}>
        <boxGeometry args={[0.02, 0.06, 0.02]} />
        <meshStandardMaterial
          color="#a1a1aa"
          emissive="#3f3f46"
          emissiveIntensity={effectiveHovered ? 0.5 : 0.1}
        />
      </mesh>

      {/* 4. TAY CẦM TRÒN KIM LOẠI UỐN BẬC (3D HANDLES) */}
      {/* Chân tay cầm trái */}
      <mesh position={[-0.45, -0.18, 0.26]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 12]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#27272a" metalness={0.9} />
      </mesh>
      {/* Chân tay cầm phải */}
      <mesh position={[0.45, -0.18, 0.26]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 12]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#27272a" metalness={0.9} />
      </mesh>
      {/* Thanh nắm ngang */}
      <mesh position={[0, -0.18, 0.31]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.038, 0.038, 0.95, 16]} />
        <meshStandardMaterial color={effectiveHovered ? '#a1a1aa' : '#71717a'} metalness={0.95} roughness={0.1} />
      </mesh>

      {/* 5. KHUNG VÀ THẺ KIM LOẠI TITAN KHẮC BẠC (TITANIUM ENGRAVED TAG & FRAME) */}
      {/* Khung viền đính giữ nhãn */}
      <mesh position={[-0.15, 0.28, 0.2]}>
        <boxGeometry args={[1.42, 0.44, 0.03]} />
        <meshStandardMaterial color="#27272a" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Thẻ kim loại in mã số khắc bạc */}
      <mesh position={[-0.15, 0.28, 0.22]}>
        <planeGeometry args={[1.32, 0.34]} />
        {labelTexture ? (
          <meshStandardMaterial map={labelTexture} metalness={0.88} roughness={0.25} />
        ) : (
          <meshStandardMaterial color="#141416" metalness={0.85} roughness={0.25} />
        )}
      </mesh>
      {/* Đinh ốc 4 góc khung nhãn */}
      {[-0.78, 0.48].map((xOffset) =>
        [0.12, 0.44].map((yOffset) => (
          <mesh key={`${xOffset}-${yOffset}`} position={[xOffset, yOffset, 0.22]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.9} />
          </mesh>
        ))
      )}

      {/* 6. TRONG LÒNG NGĂN KÉO MỞ (INTERIOR DETAILED MESH) */}
      {(isOpen || currentZ > 0.08) && (
        <group position={[0, -0.1, -1.0]}>
          {/* Đáy tủ thép mạ nhôm sáng */}
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[1.95, 0.1, 2.3]} />
            <meshStandardMaterial color="#52525b" metalness={0.82} roughness={0.2} />
          </mesh>
          {/* Vách trái thép mạ xám sáng */}
          <mesh position={[-0.98, 0.1, 0]}>
            <boxGeometry args={[0.1, 1.0, 2.3]} />
            <meshStandardMaterial color="#71717a" metalness={0.85} roughness={0.18} />
          </mesh>
          {/* Vách phải thép mạ xám sáng */}
          <mesh position={[0.98, 0.1, 0]}>
            <boxGeometry args={[0.1, 1.0, 2.3]} />
            <meshStandardMaterial color="#71717a" metalness={0.85} roughness={0.18} />
          </mesh>

          {/* DÃY BÌA HỒ SƠ 3D TƯƠNG TÁC TRONG NGĂN KÉO */}
          {drawer.files.map((file, idx) => (
            <InteractiveFileFolder3D
              key={file.id}
              file={file}
              idx={idx}
              totalFiles={drawer.files.length}
              onSelectFile={onSelectFile}
            />
          ))}
        </group>
      )}

      {/* 7. THANH RAY TRƯỢT KIM LOẠI CƠ KHÍ 2 BÊN HÔNG (3D TELESCOPING STEEL SLIDE RAILS) */}
      {(isOpen || currentZ > 0.05) && (
        <>
          {/* Ray trượt cơ khí bên trái gá sát hông hộc tủ */}
          <group position={[-1.02, 0, -1.1]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.04, 0.12, 2.2]} />
              <meshStandardMaterial color="#a1a1aa" metalness={0.95} roughness={0.1} />
            </mesh>
            <mesh position={[-0.02, 0, 0]}>
              <boxGeometry args={[0.02, 0.04, 2.2]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.98} roughness={0.05} />
            </mesh>
          </group>

          {/* Ray trượt cơ khí bên phải gá sát hông hộc tủ */}
          <group position={[1.02, 0, -1.1]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.04, 0.12, 2.2]} />
              <meshStandardMaterial color="#a1a1aa" metalness={0.95} roughness={0.1} />
            </mesh>
            <mesh position={[0.02, 0, 0]}>
              <boxGeometry args={[0.02, 0.04, 2.2]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.98} roughness={0.05} />
            </mesh>
          </group>
        </>
      )}
    </group>
  )
}
