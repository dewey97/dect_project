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
    // 4. PHOTOREALISTIC HANOI 1996 RAILWAY TRAIN & COURTYARD GARDEN WINDOW VIEW
    // ----------------------------------------------------
    const nightWindowTexture = texLoader.load('/images/cases/case_000/window_railway_train_view.jpg')
    nightWindowTexture.colorSpace = THREE.SRGBColorSpace
    nightWindowTexture.generateMipmaps = true
    nightWindowTexture.minFilter = THREE.LinearMipmapLinearFilter

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
