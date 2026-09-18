'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

// ==========================================
// HIGH-RESOLUTION PROCEDURAL TEXTURE FACTORY
// ==========================================
export function useProceduralTextures() {
  return useMemo(() => {
    const texLoader = new THREE.TextureLoader()

    // ----------------------------------------------------
    // 1. AUTHENTIC VIETNAMESE ENCAUSTIC FLOOR TILE (100% CONTIGUOUS SEAMLESS GRID)
    // ----------------------------------------------------
    const floorTexture = texLoader.load('/images/cases/case_000/vietnamese_tile_seamless_grid.png')
    floorTexture.wrapS = THREE.RepeatWrapping
    floorTexture.wrapT = THREE.RepeatWrapping
    // Room is 7.8m x 7.5m. Each tile is 40cm x 40cm (0.40m square), 2x2 grid is 0.80m x 0.80m
    // Repeat: X = 7.8 / 0.80 = 9.75, Z = 7.5 / 0.80 = 9.375 (giving authentic large 40cm encaustic tiles)
    floorTexture.repeat.set(9.75, 9.375)
    floorTexture.colorSpace = THREE.SRGBColorSpace
    floorTexture.anisotropy = 8

    // Photoreal vintage bump map (scratches, grout indentations, weathered cracks)
    const floorBumpMap = texLoader.load('/images/cases/case_000/vietnamese_tile_bump.png')
    floorBumpMap.wrapS = THREE.RepeatWrapping
    floorBumpMap.wrapT = THREE.RepeatWrapping
    floorBumpMap.repeat.set(9.75, 9.375)

    // Photoreal vintage roughness map (matte grout & scratches vs satin glazed tile surface)
    const floorRoughnessMap = texLoader.load('/images/cases/case_000/vietnamese_tile_roughness.png')
    floorRoughnessMap.wrapS = THREE.RepeatWrapping
    floorRoughnessMap.wrapT = THREE.RepeatWrapping
    floorRoughnessMap.repeat.set(9.75, 9.375)

    // ----------------------------------------------------
    // 2. SEAMLESS RAW CEMENT PLASTER WALL (1024x1024)
    // ----------------------------------------------------
    const wallCanvas = document.createElement('canvas')
    wallCanvas.width = 1024
    wallCanvas.height = 1024
    const wCtx = wallCanvas.getContext('2d')

    const wallBumpCanvas = document.createElement('canvas')
    wallBumpCanvas.width = 1024
    wallBumpCanvas.height = 1024
    const wbCtx = wallBumpCanvas.getContext('2d')

    if (wCtx && wbCtx) {
      // Natural cement / concrete gray base
      wCtx.fillStyle = '#9299a2'
      wCtx.fillRect(0, 0, 1024, 1024)

      wbCtx.fillStyle = '#808080'
      wbCtx.fillRect(0, 0, 1024, 1024)

      // Fine cement grain, sand & trowel variation
      for (let i = 0; i < 12000; i++) {
        const x = Math.random() * 1024
        const y = Math.random() * 1024
        const r = Math.random() * 6 + 1
        const alpha = Math.random() * 0.07
        // Mix of lighter cement dust and darker gray sand
        wCtx.fillStyle =
          Math.random() > 0.5 ? `rgba(235, 240, 248, ${alpha})` : `rgba(45, 52, 60, ${alpha})`
        wCtx.beginPath()
        wCtx.arc(x, y, r, 0, Math.PI * 2)
        wCtx.fill()

        const bAlpha = Math.random() * 0.08
        wbCtx.fillStyle =
          Math.random() > 0.5 ? `rgba(255, 255, 255, ${bAlpha})` : `rgba(0, 0, 0, ${bAlpha})`
        wbCtx.beginPath()
        wbCtx.arc(x, y, r, 0, Math.PI * 2)
        wbCtx.fill()
      }

      // Hand-trowel plaster patches (vết bay xoa xi măng)
      for (let i = 0; i < 28; i++) {
        const mx = Math.random() * 1024
        const my = Math.random() * 1024
        const mrad = Math.random() * 120 + 40
        const mgrad = wCtx.createRadialGradient(mx, my, 8, mx, my, mrad)
        const isDark = Math.random() > 0.5
        mgrad.addColorStop(0, isDark ? 'rgba(55, 62, 70, 0.06)' : 'rgba(215, 222, 230, 0.05)')
        mgrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        wCtx.fillStyle = mgrad
        wCtx.beginPath()
        wCtx.arc(mx, my, mrad, 0, Math.PI * 2)
        wCtx.fill()
      }
    }

    const wallTexture = new THREE.CanvasTexture(wallCanvas)
    wallTexture.wrapS = THREE.RepeatWrapping
    wallTexture.wrapT = THREE.RepeatWrapping

    const wallBumpMap = new THREE.CanvasTexture(wallBumpCanvas)
    wallBumpMap.wrapS = THREE.RepeatWrapping
    wallBumpMap.wrapT = THREE.RepeatWrapping

    // Helper to create properly-scaled wall material per wall dimensions
    const createWallMaterial = (widthMeters: number, heightMeters: number) => {
      const tex = wallTexture.clone()
      tex.repeat.set(widthMeters / 2.5, heightMeters / 2.5)
      tex.needsUpdate = true

      const bump = wallBumpMap.clone()
      bump.repeat.set(widthMeters / 2.5, heightMeters / 2.5)
      bump.needsUpdate = true

      return new THREE.MeshStandardMaterial({
        map: tex,
        bumpMap: bump,
        bumpScale: 0.025,
        roughness: 0.90,
        metalness: 0.04
      })
    }

    // ----------------------------------------------------
    // 3. PHOTOREALISTIC VINTAGE LIM WOOD TEXTURES
    // ----------------------------------------------------
    const woodTexture = texLoader.load('/images/cases/case_000/photoreal_vintage_wood.png')
    woodTexture.wrapS = THREE.RepeatWrapping
    woodTexture.wrapT = THREE.RepeatWrapping
    woodTexture.repeat.set(2, 2)
    woodTexture.colorSpace = THREE.SRGBColorSpace
    woodTexture.anisotropy = 8

    const woodNormalMap = texLoader.load('/images/cases/case_000/photoreal_vintage_wood_normal.png')
    woodNormalMap.wrapS = THREE.RepeatWrapping
    woodNormalMap.wrapT = THREE.RepeatWrapping
    woodNormalMap.repeat.set(2, 2)

    const woodRoughnessMap = texLoader.load(
      '/images/cases/case_000/photoreal_vintage_wood_roughness.png'
    )
    woodRoughnessMap.wrapS = THREE.RepeatWrapping
    woodRoughnessMap.wrapT = THREE.RepeatWrapping
    woodRoughnessMap.repeat.set(2, 2)

    const baseboardWood = woodTexture.clone()
    baseboardWood.repeat.set(8, 1)
    baseboardWood.needsUpdate = true

    const beamWood = woodTexture.clone()
    beamWood.repeat.set(1, 6)
    beamWood.needsUpdate = true

    // ----------------------------------------------------
    // 4. OVERCAST GLOOMY SKY WINDOW TEXTURE (TRỜI ÂM U - 512x512)
    // ----------------------------------------------------
    const windowCanvas = document.createElement('canvas')
    windowCanvas.width = 512
    windowCanvas.height = 512
    const winCtx = windowCanvas.getContext('2d')
    if (winCtx) {
      // Gloomy overcast sky gradient (không tối om, sắc trời xám chì âm u)
      const winGrad = winCtx.createLinearGradient(0, 0, 0, 512)
      winGrad.addColorStop(0, '#384353') // Xám chì âm u tầng cao
      winGrad.addColorStop(0.35, '#4f5d73') // Xám xanh mây mù
      winGrad.addColorStop(0.70, '#6b7a91') // Sáng dịu gần đường chân trời
      winGrad.addColorStop(0.82, '#8291a5') // Dải sương mờ trên nóc rặng cây
      winGrad.addColorStop(1, '#2c3542') // Mặt đất/đường ray sẫm màu
      winCtx.fillStyle = winGrad
      winCtx.fillRect(0, 0, 512, 512)

      // Dải mây mù âm u trôi ngang (Overcast cloud layers)
      for (let c = 0; c < 8; c++) {
        const cy = 40 + c * 38
        const ch = 45 + Math.sin(c) * 15
        const cGrad = winCtx.createLinearGradient(0, cy, 0, cy + ch)
        cGrad.addColorStop(0, 'rgba(40, 50, 65, 0.25)')
        cGrad.addColorStop(0.5, 'rgba(120, 135, 155, 0.20)')
        cGrad.addColorStop(1, 'rgba(40, 50, 65, 0)')
        winCtx.fillStyle = cGrad
        winCtx.fillRect(0, cy, 512, ch)
      }

      // Rặng cây và bụi cây xa xa mọc ven đường ray (Silhouette rực nét trên nền trời âm u)
      winCtx.fillStyle = '#1e2631'
      winCtx.beginPath()
      winCtx.moveTo(0, 420)
      for (let x = 0; x <= 512; x += 16) {
        const treeH = 390 + Math.sin(x * 0.05) * 12 + Math.cos(x * 0.12) * 8
        winCtx.lineTo(x, treeH)
      }
      winCtx.lineTo(512, 512)
      winCtx.lineTo(0, 512)
      winCtx.closePath()
      winCtx.fill()

      // Red Railway Signal Light (150m away, rực sáng rõ nét trong không gian âm u)
      winCtx.fillStyle = '#ef4444'
      winCtx.shadowColor = '#ef4444'
      winCtx.shadowBlur = 28
      winCtx.beginPath()
      winCtx.arc(360, 260, 12, 0, Math.PI * 2)
      winCtx.fill()
      winCtx.shadowBlur = 0

      // Silhouette railway mast & signal arm (Cột đèn tín hiệu)
      winCtx.fillStyle = '#111827'
      winCtx.fillRect(356, 260, 8, 252)
      winCtx.fillRect(328, 272, 64, 6)

      // Cột điện & đường dây điện chạy ngang tạo chiều sâu
      winCtx.strokeStyle = 'rgba(25, 33, 44, 0.45)'
      winCtx.lineWidth = 1.2
      winCtx.beginPath()
      winCtx.moveTo(0, 310)
      winCtx.bezierCurveTo(180, 335, 360, 275, 512, 320)
      winCtx.stroke()

      // Nền đất đường ray tàu hỏa
      winCtx.fillStyle = '#141c24'
      winCtx.fillRect(0, 455, 512, 57)
    }
    const nightWindowTexture = new THREE.CanvasTexture(windowCanvas)

    // ----------------------------------------------------
    // 5. AUTHENTIC VIETNAMESE BAT TRANG COURTYARD TILE
    // ----------------------------------------------------
    const cyCanvas = document.createElement('canvas')
    cyCanvas.width = 512
    cyCanvas.height = 512
    const cyCtx = cyCanvas.getContext('2d')
    if (cyCtx) {
      cyCtx.fillStyle = '#3a1f14'
      cyCtx.fillRect(0, 0, 512, 512)
      const rows = 8
      const cols = 8
      const rh = 512 / rows
      const cw = 512 / cols
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (cw / 2)
        for (let c = -1; c <= cols; c++) {
          const bx = c * cw + offset
          const by = r * rh
          const hue = 14 + ((r * 7 + c * 3) % 8)
          const lit = 20 + ((r * 11 + c * 5) % 8)
          cyCtx.fillStyle = `hsl(${hue}, 42%, ${lit}%)`
          cyCtx.fillRect(bx + 2, by + 2, cw - 4, rh - 4)
        }
      }
      for (let i = 0; i < 4; i++) {
        const px = 100 + i * 90
        const py = 80 + ((i * 130) % 360)
        const pRad = 45 + (i % 2) * 20
        const pGrad = cyCtx.createRadialGradient(px, py, 4, px, py, pRad)
        pGrad.addColorStop(0, 'rgba(12, 18, 30, 0.45)')
        pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        cyCtx.fillStyle = pGrad
        cyCtx.beginPath()
        cyCtx.arc(px, py, pRad, 0, Math.PI * 2)
        cyCtx.fill()
      }
    }
    const courtyardTexture = new THREE.CanvasTexture(cyCanvas)
    courtyardTexture.wrapS = THREE.RepeatWrapping
    courtyardTexture.wrapT = THREE.RepeatWrapping
    courtyardTexture.repeat.set(6, 4)

    // ----------------------------------------------------
    // 6. WEATHERED BLUE-GRAY STONE STEPS TEXTURE
    // ----------------------------------------------------
    const stCanvas = document.createElement('canvas')
    stCanvas.width = 512
    stCanvas.height = 512
    const stCtx = stCanvas.getContext('2d')
    if (stCtx) {
      stCtx.fillStyle = '#1e2633'
      stCtx.fillRect(0, 0, 512, 512)
      for (let i = 0; i < 2000; i++) {
        const sx = Math.random() * 512
        const sy = Math.random() * 512
        const salpha = Math.random() * 0.08
        stCtx.fillStyle =
          Math.random() > 0.5 ? `rgba(148, 163, 184, ${salpha})` : `rgba(15, 23, 42, ${salpha})`
        stCtx.fillRect(sx, sy, Math.random() * 6 + 1, Math.random() * 6 + 1)
      }
    }
    const stoneTexture = new THREE.CanvasTexture(stCanvas)

    // ----------------------------------------------------
    // 7. ROUGH TREE BARK TEXTURE
    // ----------------------------------------------------
    const bkCanvas = document.createElement('canvas')
    bkCanvas.width = 512
    bkCanvas.height = 512
    const bkCtx = bkCanvas.getContext('2d')
    if (bkCtx) {
      bkCtx.fillStyle = '#22170f'
      bkCtx.fillRect(0, 0, 512, 512)
      for (let y = 0; y < 512; y += 3) {
        bkCtx.fillStyle = y % 6 === 0 ? '#140e09' : '#302116'
        bkCtx.fillRect(0, y, 512, 2 + Math.random() * 2)
      }
    }
    const barkTexture = new THREE.CanvasTexture(bkCanvas)
    barkTexture.wrapS = THREE.RepeatWrapping
    barkTexture.wrapT = THREE.RepeatWrapping

    // ----------------------------------------------------
    // 8. OVERCAST GLOOMY SKY BACKDROP TEXTURE (1024x512)
    // ----------------------------------------------------
    const skyBackdropTexture = texLoader.load('/images/cases/case_000/overcast_sky_backdrop.png')
    skyBackdropTexture.colorSpace = THREE.SRGBColorSpace

    return {
      floorTexture,
      floorBumpMap,
      floorRoughnessMap,
      createWallMaterial,
      woodTexture,
      woodNormalMap,
      woodRoughnessMap,
      baseboardWood,
      beamWood,
      nightWindowTexture,
      courtyardTexture,
      stoneTexture,
      barkTexture,
      skyBackdropTexture
    }
  }, [])
}
