'use client'

import React, { useMemo } from 'react'
import * as THREE from 'three'

// ==========================================
// VINTAGE WALL PICTURE FRAME & CANVAS PLACEHOLDER
// ==========================================
export function createPhotoPlaceholderTexture(text: string, subtitle = 'Thay ảnh vào sau') {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#f5efe6'
  ctx.fillRect(0, 0, 1024, 768)

  const grad = ctx.createRadialGradient(512, 384, 150, 512, 384, 560)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)')
  grad.addColorStop(0.7, 'rgba(215, 185, 150, 0.18)')
  grad.addColorStop(1, 'rgba(140, 105, 75, 0.35)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 768)

  ctx.strokeStyle = '#8c5e35'
  ctx.lineWidth = 8
  ctx.strokeRect(32, 32, 960, 704)

  ctx.strokeStyle = '#a47c54'
  ctx.lineWidth = 3
  ctx.setLineDash([16, 12])
  ctx.strokeRect(56, 56, 912, 656)
  ctx.setLineDash([])

  ctx.fillStyle = '#261408'
  ctx.font = 'bold 64px "Times New Roman", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 512, 380)

  ctx.fillStyle = '#784e2d'
  ctx.font = 'bold 26px sans-serif'
  ctx.fillText(`[ ${subtitle} ]`, 512, 460)

  ctx.fillStyle = '#9c7b5d'
  ctx.font = '20px monospace'
  ctx.fillText('HỒ SƠ HIỆN TRƯỜNG #KX-1996', 512, 620)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function WallPictureFrame({
  label,
  imageUrl,
  subtitle = 'Thay ảnh vào sau',
  position,
  rotation = [0, 0, 0],
  width = 0.95,
  height = 0.7,
  woodTexture,
  tilt = 0
}: {
  label: string
  imageUrl?: string
  subtitle?: string
  position: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  woodTexture?: THREE.Texture
  tilt?: number
}) {
  const photoTexture = useMemo(() => {
    if (imageUrl) {
      const loader = new THREE.TextureLoader()
      const t = loader.load(imageUrl)
      t.colorSpace = THREE.SRGBColorSpace
      return t
    }
    return createPhotoPlaceholderTexture(label, subtitle)
  }, [imageUrl, label, subtitle])

  const frameThickness = 0.05
  const frameDepth = 0.04
  const photoWidth = width - frameThickness * 2
  const photoHeight = height - frameThickness * 2

  return (
    <group position={position} rotation={[rotation[0], rotation[1], rotation[2] + tilt]}>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[width, height, frameDepth]} />
        <meshStandardMaterial map={woodTexture} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0, frameDepth / 2 + 0.002]}>
        <planeGeometry args={[photoWidth, photoHeight]} />
        <meshStandardMaterial
          map={photoTexture || undefined}
          roughness={0.35}
          metalness={0.02}
        />
      </mesh>
      <mesh position={[0, 0, frameDepth / 2 + 0.005]}>
        <planeGeometry args={[photoWidth, photoHeight]} />
        <meshPhysicalMaterial
          roughness={0.08}
          transmission={0.92}
          thickness={0.01}
          transparent
          opacity={0.12}
          reflectivity={0.4}
        />
      </mesh>
    </group>
  )
}
