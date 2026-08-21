'use client'

import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CaseFile } from './cabinet-types'

export function InteractiveFileFolder3D({
  file,
  idx,
  totalFiles = 3,
  onSelectFile,
}: {
  file: CaseFile
  idx: number
  totalFiles?: number
  onSelectFile: (file: CaseFile) => void
}) {
  const folderRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  // Căn chỉnh khoảng cách z & y để dàn trải rộng trọn vẹn trong lòng tủ
  const spacingZ = totalFiles > 4 ? 0.36 : 0.45
  const startZ = totalFiles > 4 ? -0.76 : -0.65
  const startY = totalFiles > 4 ? 0.08 : 0.12
  const spacingY = totalFiles > 4 ? 0.06 : 0.08

  // Định vị thẻ Tab nhô lên xoay vòng 3 nấc chuẩn (Trái / Giữa / Phải)
  const tabX = idx % 3 === 0 ? -0.48 : idx % 3 === 1 ? 0 : 0.48

  // Canvas Texture in mã số chuyên án trực tiếp lên thẻ Tab 3D Kraft
  const tabTexture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 56
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Nền cùng tông màu Kraft da bò
      ctx.fillStyle = hovered ? '#fef08a' : file.folderBgColor || '#d9a066'
      ctx.fillRect(0, 0, 160, 56)
      ctx.strokeStyle = '#3d2b1c'
      ctx.lineWidth = 3
      ctx.strokeRect(3, 3, 154, 50)
      ctx.fillStyle = '#2b1b0e'
      ctx.font = 'bold 22px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(file.code, 80, 28)
    }
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [file.code, file.folderBgColor, hovered])

  // Canvas Texture in băng dán tên vụ án & dấu mộc đỏ niêm phong chuẩn trang activate
  const folderCoverTexture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 384
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // 1. Nền bìa giấy Kraft
      ctx.fillStyle = file.folderBgColor || '#d9a066'
      ctx.fillRect(0, 0, 512, 384)

      // Viền nét đứt nhẹ xung quanh bìa
      ctx.strokeStyle = '#3d2b1c'
      ctx.lineWidth = 4
      ctx.strokeRect(8, 8, 496, 368)

      // 2. Băng dán giấy trắng/kem viết tên vụ án (Paper Tape Label)
      ctx.save()
      ctx.translate(24, 28)
      ctx.rotate(-0.03)
      ctx.fillStyle = '#f4e8d8'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
      ctx.shadowBlur = 6
      ctx.fillRect(0, 0, 300, 60)
      ctx.strokeStyle = '#3d2b1c'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, 300, 60)
      ctx.shadowColor = 'transparent'

      // Chữ viết tay tên vụ án
      ctx.fillStyle = '#1a0f07'
      ctx.font = 'bold 26px monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(file.title.slice(0, 16), 14, 30)
      ctx.restore()

      // 3. Dấu mộc mực đỏ niêm phong (Red Rubber Stamp)
      ctx.save()
      ctx.translate(320, 24)
      ctx.rotate(-0.1)
      ctx.strokeStyle = '#991b1b'
      ctx.lineWidth = 4
      ctx.strokeRect(0, 0, 170, 48)
      ctx.fillStyle = '#991b1b'
      ctx.font = 'bold 15px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`🔴 HỒ SƠ // ${file.date || '1998'}`, 85, 24)
      ctx.restore()

      // 4. Mã lưu trữ ở chân bìa
      ctx.fillStyle = '#2b1b0e'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`MÃ CHUYÊN ÁN: VERITAS-${file.code.replace(' ', '')}`, 24, 352)
    }
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [file.title, file.code, file.date, file.folderBgColor])

  useFrame((_, delta) => {
    if (!folderRef.current) return
    // Khi di chuột, bìa hồ sơ nẩy nhô hẳn lên cao y + 0.48m
    const targetY = hovered ? startY + 0.48 : startY + idx * spacingY
    const targetZ = hovered ? startZ + idx * spacingZ + 0.22 : startZ + idx * spacingZ
    const targetRotX = hovered ? -0.05 : -0.22

    const step = Math.min(delta * 9, 1)
    folderRef.current.position.y += (targetY - folderRef.current.position.y) * step
    folderRef.current.position.z += (targetZ - folderRef.current.position.z) * step
    folderRef.current.rotation.x += (targetRotX - folderRef.current.rotation.x) * step
  })

  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = (e: any) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e: any) => {
    e.stopPropagation()
    onSelectFile(file)
  }

  return (
    <group
      ref={folderRef}
      position={[0, startY + idx * spacingY, startZ + idx * spacingZ]}
      rotation={[-0.22, 0, 0]}
    >
      {/* 1. TRANG GIẤY A4 TRẮNG KEM NHÔ RA BÊN TRONG HỒ SƠ (INNER DOCUMENT PAPER SHEETS) */}
      <mesh position={[0, 0.08, -0.012]}>
        <boxGeometry args={[1.55, 1.25, 0.008]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.6} />
      </mesh>
      {/* Trang giấy thứ 2 lót lệch nhẹ */}
      <mesh position={[0.03, 0.06, -0.02]}>
        <boxGeometry args={[1.52, 1.22, 0.008]} />
        <meshStandardMaterial color="#fef08a" roughness={0.7} />
      </mesh>

      {/* 2. BÌA GIẤY KRAFT 3D (THÂN MỎNG CHUẨN BÌA GIẤY 0.02m) */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[1.65, 1.25, 0.02]} />
        {folderCoverTexture ? (
          <meshStandardMaterial map={folderCoverTexture} roughness={0.5} />
        ) : (
          <meshStandardMaterial
            color={hovered ? '#fef08a' : file.folderBgColor || (idx === 0 ? '#fef3c7' : '#f59e0b')}
            roughness={0.5}
          />
        )}
      </mesh>

      {/* 3. THẺ TAB NHÔ DẬP LIỀN KHỐI BÌA KRAFT (SEAMLESS KRAFT TAB 0.02m) */}
      <mesh
        position={[tabX, 0.68, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[0.54, 0.18, 0.02]} />
        {tabTexture ? (
          <meshStandardMaterial map={tabTexture} roughness={0.4} />
        ) : (
          <meshStandardMaterial
            color={hovered ? '#fef08a' : file.folderBgColor || '#d9a066'}
            roughness={0.4}
          />
        )}
      </mesh>

      {/* 4. GHIM KẸP GIẤY KIM LOẠI 3D (3D CHROME PAPERCLIP) */}
      <mesh position={[tabX - 0.2, 0.68, 0.015]} rotation={[0, 0, Math.PI / 8]}>
        <torusGeometry args={[0.04, 0.008, 12, 24]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  )
}
