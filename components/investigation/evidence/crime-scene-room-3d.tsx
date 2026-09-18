'use client'

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'

// ==========================================
// ROOM HOTSPOTS DEFINITION (8 CHUẨN ĐIỂM KHÁM XÉT HỒ SƠ VỤ ÁN)
// ==========================================
export interface RoomHotspot {
  id: string
  num: number
  shortName: string
  position: [number, number, number] // [X, Y, Z] in 3D room
  targetCamera: {
    pos: [number, number, number]
    lon: number
    lat: number
    fov: number
  }
  title: string
  caption: string
  detail: string
  imageUrl: string
}

export const CRIME_SCENE_HOTSPOTS: RoomHotspot[] = [
  {
    id: 'spot-1',
    num: 1,
    shortName: 'Bàn trà & Chén vỡ',
    position: [0, 0.51, -2.4],
    targetCamera: {
      pos: [0, 1.1, -1.45],
      lon: 180,
      lat: -32,
      fov: 46
    },
    title: 'BÀN TRÀ PHÒNG KHÁCH — PHÍCH RẠNG ĐÔNG & CHÉN VỠ',
    caption: 'Ảnh hiện trường #01-KX: Ấm chén gốm vỡ trên sàn gạch và phích nước Rạng Đông',
    detail: 'Bộ ấm chén gốm vỡ trên sàn gạch bông, ghế đơn bị xô ngã lật nghiêng khoảng 40cm. Phích nước còn nóng chứng tỏ nạn nhân đã tiếp khách ít phút trước khi xảy ra vụ việc.',
    imageUrl: '/images/cases/case_000/avatar_khang.jpg'
  },
  {
    id: 'spot-2',
    num: 2,
    shortName: 'Tủ tivi & Vết cạy',
    position: [3.65, 1.15, 3.25],
    targetCamera: {
      pos: [2.3, 1.35, 2.0],
      lon: 47,
      lat: -6,
      fov: 48
    },
    title: 'TỦ TIVI GỖ & TIVI CRT 90S',
    caption: 'Ảnh hiện trường #02-KX: Tivi CRT thập niên 90 và dấu vết tác động ngoại lực',
    detail: 'Màn hình tivi CRT bám một lớp bụi mỏng nhưng có dấu vết bị xê dịch khỏi vị trí ban đầu. Khung tủ gỗ có vết cạy trầy xước mới ở ngăn kéo dưới — nghi can đã tìm kiếm tài sản hoặc di thư.',
    imageUrl: '/images/cases/case_000/photo-reinvestigation-room-realistic.jpg'
  },
  {
    id: 'spot-3',
    num: 3,
    shortName: 'Tủ gỗ lim 1996',
    position: [-3.8, 1.35, 2.58],
    targetCamera: {
      pos: [-2.2, 1.45, 1.6],
      lon: 301,
      lat: -3,
      fov: 50
    },
    title: 'KHE TỦ GỖ LIM GÓC PHÒNG — VỤ ÁN TRỐN TÌM 1996',
    caption: 'Ảnh hiện trường #03-KX: Khe tủ hé mở có dấu vết người ẩn nấp quan sát và kỷ vật bi kịch 1996',
    detail: 'Khe tủ gỗ lim hé mở khoảng 5cm, then cài sắt đã gỉ sét. Bên trong phát hiện dấu vải cọ xát và dấu vân tay mờ — có người đã nấp bên trong quan sát toàn bộ diễn biến. Trên nóc tủ hằn vết đập bàn tay kích động.',
    imageUrl: '/images/cases/case_000/wardrobe_eyes.jpg'
  },
  {
    id: 'spot-4',
    num: 4,
    shortName: 'Cửa sổ ray tàu',
    position: [4.98, 1.70, 0.5],
    targetCamera: {
      pos: [3.5, 1.62, 0.5],
      lon: 90,
      lat: 3,
      fov: 45
    },
    title: 'GÓC CỬA SỔ PHÍA ĐÔNG — HƯỚNG ĐƯỜNG RAY TÀU',
    caption: 'Ảnh hiện trường #04-KX: Góc nhìn trực diện ra cột đèn tín hiệu đường sắt (150m)',
    detail: 'Từ cửa sổ phòng khách nhìn thẳng ra cột đèn ray tàu cách 150m. Thời điểm 20:30 đêm xảy ra vụ án, tiếng còi tàu hỏa rúc lớn trùng khớp với bản thu âm trong máy tính của Khang.',
    imageUrl: '/images/cases/case_000/trontim.jpg'
  },
  {
    id: 'spot-5',
    num: 5,
    shortName: 'Cửa chính & Thềm',
    position: [1.6, 0.35, 3.9],
    targetCamera: {
      pos: [1.6, 1.35, 2.6],
      lon: 0,
      lat: -33,
      fov: 50
    },
    title: 'CỬA CHÍNH NAM — BẬC THỀM & GỐC CÂY XOAN',
    caption: 'Ảnh hiện trường #05-KX: Dấu vết phấn hoa xoan và vệt nước mưa trên thềm gạch',
    detail: 'Cửa chính 2 cánh gỗ lim mở toang. Bậc thềm còn lưu lại vệt nước mưa và bột phấn hoa xoan bám dính. Ngoài sân, dưới gốc cây xoan cổ thụ có dấu chân đế giày nữ size 37.',
    imageUrl: '/images/cases/case_000/photo_cheating_sms.jpg'
  },
  {
    id: 'spot-6',
    num: 6,
    shortName: 'Giỏ rác cửa',
    position: [0.48, 0.45, 3.42],
    targetCamera: {
      pos: [0.8, 1.15, 2.7],
      lon: 336,
      lat: -42,
      fov: 42
    },
    title: 'GIỎ RÁC CẠNH CỬA RA VÀO — CUỐNG VÉ XE & KHĂN GIẤY',
    caption: 'Ảnh hiện trường #06-KX: Cuống vé xe khách liên tỉnh bị vò nát dưới đáy',
    detail: 'Dưới đáy giỏ rác thu giữ 01 cuống vé xe khách liên tỉnh tuyến Hà Nội — Nam Định có ghi thời gian xuất bến, cùng mẩu khăn giấy dính son dưỡng và bột phấn hoa xoan.',
    imageUrl: '/images/cases/case_000/cuong_ve_xe_tung.png'
  },
  {
    id: 'spot-7',
    num: 7,
    shortName: 'Giường ngủ & Bùa yêu',
    position: [-3.7, 0.70, -3.1],
    targetCamera: {
      pos: [-3.7, 1.35, -1.8],
      lon: 180,
      lat: -27,
      fov: 45
    },
    title: 'GIƯỜNG NGỦ GIAN TRONG — LÁ BÙA YÊU TRONG GỐI',
    caption: 'Ảnh hiện trường #07-KX: Ruột gối nằm phòng ngủ bị rạch khóa kéo giấu bùa yếm',
    detail: 'Trong ruột gối bông phát hiện 01 lá bùa vải đỏ gấp hình tam giác ghi họ tên Khang & Hà bằng mực son, buộc kèm lọn tóc bằng chỉ đỏ — minh chứng sự cuồng yêu mù quáng của Trần Thị Hà.',
    imageUrl: '/images/cases/case_000/photo-reinvestigation-room-realistic.jpg'
  },
  {
    id: 'spot-8',
    num: 8,
    shortName: 'Khung ảnh 1996',
    position: [0.0, 2.15, -3.70],
    targetCamera: {
      pos: [0.0, 1.65, -2.0],
      lon: 180,
      lat: 16,
      fov: 48
    },
    title: 'BỘ KHUNG ẢNH KỶ NIỆM XÓM BỜ SÔNG HÈ 1996',
    caption: 'Ảnh hiện trường #08-KX: Bức ảnh 5 đứa trẻ xóm Bờ Sông hè 1996 và đồng hồ cơ',
    detail: 'Khung ảnh gỗ treo tường chụp bức ảnh kỷ niệm hè 1996: Tùng (sẹo chữ V ở chân mày) ôm em trai Gia Huy đeo còi đồng trước ngực. Bên cạnh là đồng hồ cơ quả lắc truyền thống.',
    imageUrl: '/images/cases/case_000/trontim.jpg'
  }
]

// ==========================================
// WALL PICTURE FRAMES CONFIGURATION
// ==========================================
export interface WallPictureFrameConfig {
  id: string
  label: string
  subtitle?: string
  imageUrl?: string
  position: [number, number, number]
  rotation?: [number, number, number]
  width: number
  height: number
  tilt?: number
}

export const WALL_PICTURE_FRAMES: WallPictureFrameConfig[] = [
  {
    id: 'frame-1',
    label: 'Gia đình Văn hóa',
    subtitle: 'UBND Phường Phân Khu Cảng',
    imageUrl: '',
    position: [-1.4, 2.15, -3.72],
    width: 0.95,
    height: 0.68,
    tilt: -0.015
  },
  {
    id: 'frame-2',
    label: 'Kỷ niệm Hè 1996',
    subtitle: '5 Đứa Trẻ Xóm Bờ Sông',
    imageUrl: '/images/cases/case_000/trontim.jpg',
    position: [0.0, 2.15, -3.72],
    width: 1.15,
    height: 0.80,
    tilt: 0.01
  },
  {
    id: 'frame-3',
    label: 'Bằng Khen',
    subtitle: 'Năm 1994',
    imageUrl: '',
    position: [1.4, 2.15, -3.72],
    width: 0.95,
    height: 0.68,
    tilt: 0.012
  }
]

// ==========================================
// HIGH-RESOLUTION PROCEDURAL TEXTURE FACTORY
// ==========================================
function useProceduralTextures() {
  return useMemo(() => {
    const texLoader = new THREE.TextureLoader()

    // ----------------------------------------------------
    // 1. AUTHENTIC VIETNAMESE ENCAUSTIC FLOOR TILE (1024x1024 SEAMLESS 2x2 MOTIF)
    // ----------------------------------------------------
    const floorTexture = texLoader.load('/images/cases/case_000/vietnamese_tile_floor.png')
    floorTexture.wrapS = THREE.RepeatWrapping
    floorTexture.wrapT = THREE.RepeatWrapping
    // Room is 10.0m x 7.5m. 2x2 tile set is 0.50m x 0.50m => 20 repeats on X, 15 repeats on Z
    floorTexture.repeat.set(20, 15)
    floorTexture.colorSpace = THREE.SRGBColorSpace
    floorTexture.anisotropy = 8

    // Procedural Tile Grout Line Bump Map (1024x1024 aligned to 2x2 tiles)
    const floorBumpCanvas = document.createElement('canvas')
    floorBumpCanvas.width = 1024
    floorBumpCanvas.height = 1024
    const fbCtx = floorBumpCanvas.getContext('2d')
    if (fbCtx) {
      fbCtx.fillStyle = '#808080'
      fbCtx.fillRect(0, 0, 1024, 1024)
      fbCtx.strokeStyle = '#282828'
      fbCtx.lineWidth = 4
      fbCtx.strokeRect(0, 0, 1024, 1024)
      fbCtx.beginPath()
      fbCtx.moveTo(0, 512)
      fbCtx.lineTo(1024, 512)
      fbCtx.moveTo(512, 0)
      fbCtx.lineTo(512, 1024)
      fbCtx.stroke()
    }
    const floorBumpMap = new THREE.CanvasTexture(floorBumpCanvas)
    floorBumpMap.wrapS = THREE.RepeatWrapping
    floorBumpMap.wrapT = THREE.RepeatWrapping
    floorBumpMap.repeat.set(20, 15)

    // ----------------------------------------------------
    // 2. SEAMLESS AGED LIME PLASTER WALL (1024x1024)
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
      // Warm vintage Vietnamese lime wash wall base
      wCtx.fillStyle = '#c7ab6d'
      wCtx.fillRect(0, 0, 1024, 1024)

      wbCtx.fillStyle = '#808080'
      wbCtx.fillRect(0, 0, 1024, 1024)

      // Fine organic lime stucco texture without directional stretch
      for (let i = 0; i < 9000; i++) {
        const x = Math.random() * 1024
        const y = Math.random() * 1024
        const r = Math.random() * 8 + 1
        const alpha = Math.random() * 0.08
        wCtx.fillStyle =
          Math.random() > 0.5 ? `rgba(242, 230, 195, ${alpha})` : `rgba(145, 118, 72, ${alpha})`
        wCtx.beginPath()
        wCtx.arc(x, y, r, 0, Math.PI * 2)
        wCtx.fill()

        const bAlpha = Math.random() * 0.06
        wbCtx.fillStyle =
          Math.random() > 0.5 ? `rgba(255, 255, 255, ${bAlpha})` : `rgba(0, 0, 0, ${bAlpha})`
        wbCtx.beginPath()
        wbCtx.arc(x, y, r, 0, Math.PI * 2)
        wbCtx.fill()
      }

      // Subtle aged mottling
      for (let i = 0; i < 30; i++) {
        const mx = Math.random() * 1024
        const my = Math.random() * 1024
        const mrad = Math.random() * 90 + 30
        const mgrad = wCtx.createRadialGradient(mx, my, 5, mx, my, mrad)
        mgrad.addColorStop(0, 'rgba(120, 95, 55, 0.06)')
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
        bumpScale: 0.022,
        roughness: 0.85
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

    // Cloned textures with proper aspect ratios for baseboards & ceiling beams
    const baseboardWood = woodTexture.clone()
    baseboardWood.repeat.set(8, 1)
    baseboardWood.needsUpdate = true

    const beamWood = woodTexture.clone()
    beamWood.repeat.set(1, 6)
    beamWood.needsUpdate = true

    // ----------------------------------------------------
    // 4. NIGHT RAINY WINDOW TEXTURE (512x512)
    // ----------------------------------------------------
    const windowCanvas = document.createElement('canvas')
    windowCanvas.width = 512
    windowCanvas.height = 512
    const winCtx = windowCanvas.getContext('2d')
    if (winCtx) {
      const winGrad = winCtx.createLinearGradient(0, 0, 0, 512)
      winGrad.addColorStop(0, '#0a1020')
      winGrad.addColorStop(0.7, '#131e38')
      winGrad.addColorStop(1, '#05070e')
      winCtx.fillStyle = winGrad
      winCtx.fillRect(0, 0, 512, 512)

      // Red Railway Signal Light (150m away in dark rain)
      winCtx.fillStyle = '#ef4444'
      winCtx.shadowColor = '#ef4444'
      winCtx.shadowBlur = 32
      winCtx.beginPath()
      winCtx.arc(360, 240, 12, 0, Math.PI * 2)
      winCtx.fill()
      winCtx.shadowBlur = 0

      // Silhouette railway mast & signal arm
      winCtx.fillStyle = '#020408'
      winCtx.fillRect(356, 240, 8, 272)
      winCtx.fillRect(328, 252, 64, 6)

      // Distant track bed glow
      winCtx.fillStyle = 'rgba(239, 68, 68, 0.08)'
      winCtx.fillRect(0, 440, 512, 72)

      // Rain streaks
      winCtx.strokeStyle = 'rgba(190, 220, 255, 0.35)'
      winCtx.lineWidth = 1.4
      for (let r = 0; r < 140; r++) {
        const rx = Math.random() * 512
        const ry = Math.random() * 512
        winCtx.beginPath()
        winCtx.moveTo(rx, ry)
        winCtx.lineTo(rx - 12, ry + 36)
        winCtx.stroke()
      }
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

    return {
      floorTexture,
      floorBumpMap,
      createWallMaterial,
      woodTexture,
      woodNormalMap,
      woodRoughnessMap,
      baseboardWood,
      beamWood,
      nightWindowTexture,
      courtyardTexture,
      stoneTexture,
      barkTexture
    }
  }, [])
}

// ==========================================
// SWINGING CEILING LAMP & VINTAGE CEILING FAN
// ==========================================
function CeilingProps() {
  const lampGroupRef = useRef<THREE.Group>(null!)
  const fanGroupRef = useRef<THREE.Group>(null!)
  const lightRef = useRef<THREE.PointLight>(null!)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (lampGroupRef.current) {
      lampGroupRef.current.rotation.z = Math.sin(t * 1.1) * 0.04
      lampGroupRef.current.rotation.x = Math.cos(t * 0.9) * 0.02
    }
    if (lightRef.current) {
      lightRef.current.intensity = 5.2 + Math.sin(t * 8.5) * 0.35
    }

    if (fanGroupRef.current) {
      fanGroupRef.current.rotation.y += 0.035
    }
  })

  return (
    <group position={[0, 3.4, 0]}>
      {/* 1. SWINGING PENDANT NOIR LAMP (OVER TEA TABLE AT [0, 0, -2.4]) */}
      <group position={[0, 0, -2.4]}>
        <group ref={lampGroupRef}>
          <mesh position={[0, -0.45, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.9, 8]} />
            <meshStandardMaterial color="#111" roughness={0.7} />
          </mesh>

          <mesh position={[0, -0.9, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.38, 0.22, 24, 1, true]} />
            <meshStandardMaterial color="#2d2218" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>

          <mesh position={[0, -0.94, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#fffbeb" emissive="#fde047" emissiveIntensity={3.2} />
          </mesh>

          <pointLight
            ref={lightRef}
            position={[0, -0.98, 0]}
            color="#ffc87a"
            intensity={5.2}
            distance={12}
            decay={2}
          />

          <spotLight
            position={[0, -0.92, 0]}
            target-position={[0, 0, -2.4]}
            color="#ffd699"
            intensity={4.0}
            angle={0.75}
            penumbra={0.45}
            distance={8}
          />
        </group>
      </group>

      {/* 2. VINTAGE GREEN CEILING FAN */}
      <group position={[0, -0.25, 0.5]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.25, 12]} />
          <meshStandardMaterial color="#1e3a29" metalness={0.8} roughness={0.3} />
        </mesh>
        <group ref={fanGroupRef}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.14, 0.09, 16]} />
            <meshStandardMaterial color="#234530" metalness={0.7} roughness={0.35} />
          </mesh>
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((rad, i) => (
            <mesh key={i} rotation={[0.08, rad, 0]} position={[Math.cos(rad) * 0.55, 0, Math.sin(rad) * 0.55]}>
              <boxGeometry args={[0.85, 0.012, 0.14]} />
              <meshStandardMaterial color="#1a3524" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

// ==========================================
// DUST PARTICLES FLOATING IN AIR
// ==========================================
function DustParticles({ count = 100 }) {
  const pointsRef = useRef<THREE.Points>(null!)

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9.5
      pos[i * 3 + 1] = Math.random() * 3.2 + 0.2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7.0
    }
    return pos
  })

  useFrame((state) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const array = posAttr.array as Float32Array
    const t = state.clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.002 + 0.0008
      array[i * 3] += Math.cos(t * 0.4 + i) * 0.0008
      if (array[i * 3 + 1] > 3.4) array[i * 3 + 1] = 0.2
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#fed7aa"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ==========================================
// DETAILED TURNED WOODEN LEG
// ==========================================
function TurnedWoodenLeg({
  position,
  height = 0.44,
  woodTexture,
  woodNormalMap,
  woodRoughnessMap
}: {
  position: [number, number, number]
  height?: number
  woodTexture: THREE.Texture
  woodNormalMap?: THREE.Texture
  woodRoughnessMap?: THREE.Texture
}) {
  return (
    <group position={position}>
      <mesh position={[0, height - 0.04, 0]} castShadow>
        <boxGeometry args={[0.075, 0.08, 0.075]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, height - 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.046, 0.04, 16]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, height - 0.16, 0]} castShadow>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, height - 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.042, 0.025, 16]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, height - 0.31, 0]} castShadow>
        <cylinderGeometry args={[0.036, 0.026, 0.16, 16]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.035, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.032, 0.05, 16]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.005, 0]} castShadow>
        <cylinderGeometry args={[0.044, 0.044, 0.015, 16]} />
        <meshStandardMaterial
          map={woodTexture}
          normalMap={woodNormalMap}
          roughnessMap={woodRoughnessMap}
          roughness={0.45}
        />
      </mesh>
    </group>
  )
}

// ==========================================
// DETAILED VINTAGE TEAPOT WITH CURVED SPOUT & HANDLE
// ==========================================
function VintageTeapot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.055, 0]} castShadow>
        <sphereGeometry args={[0.065, 20, 16]} />
        <meshStandardMaterial color="#f0ede6" roughness={0.2} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.008, 0]}>
        <cylinderGeometry args={[0.042, 0.045, 0.016, 16]} />
        <meshStandardMaterial color="#e5e0d8" roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.038, 0.04, 0.015, 16]} />
        <meshStandardMaterial color="#ded9cf" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.125, 0]}>
        <sphereGeometry args={[0.012, 12, 8]} />
        <meshStandardMaterial color="#b45309" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[-0.065, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.04, 0.009, 8, 20, Math.PI * 1.2]} />
        <meshStandardMaterial color="#f0ede6" roughness={0.2} />
      </mesh>
      <mesh position={[0.062, 0.075, 0]} rotation={[0, 0, -0.65]}>
        <cylinderGeometry args={[0.014, 0.024, 0.07, 12]} />
        <meshStandardMaterial color="#f0ede6" roughness={0.2} />
      </mesh>
    </group>
  )
}

// ==========================================
// 3D GLB ASSET AUTO-SCALER (100% REAL-WORLD HUMAN SCALE IN METERS)
// ==========================================
function AutoScaledGLB({
  url,
  preRotation,
  filterMesh,
  targetDimensions,
  targetHeight,
  targetWidth,
  targetDepth,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  castShadow = true,
  receiveShadow = true,
  materialTweaks
}: {
  url: string
  preRotation?: [number, number, number]
  filterMesh?: (mesh: THREE.Mesh) => boolean
  targetDimensions?: [number, number, number] // [X, Y, Z] in exact meters
  targetHeight?: number
  targetWidth?: number
  targetDepth?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  castShadow?: boolean
  receiveShadow?: boolean
  materialTweaks?: (mat: THREE.Material) => void
}) {
  const { scene } = useGLTF(url)

  const wrapper = useMemo(() => {
    const c = scene.clone()

    if (preRotation) {
      c.rotation.set(...preRotation)
    }
    c.updateMatrixWorld(true)

    c.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = castShadow
        mesh.receiveShadow = receiveShadow
        if (filterMesh && !filterMesh(mesh)) {
          mesh.visible = false
        }
        if (mesh.name.includes('Plane')) {
          mesh.visible = false
        }
        if (materialTweaks && mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(materialTweaks)
          } else {
            materialTweaks(mesh.material)
          }
        }
      }
    })

    const inner = new THREE.Group()
    inner.add(c)
    inner.updateMatrixWorld(true)

    // Accurate bounding box calculated from visible meshes
    const box = new THREE.Box3()
    inner.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh && mesh.visible) {
        mesh.geometry.computeBoundingBox()
        if (mesh.geometry.boundingBox) {
          const b = mesh.geometry.boundingBox.clone()
          b.applyMatrix4(mesh.matrixWorld)
          box.union(b)
        }
      }
    })

    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    let sx = 1.0
    let sy = 1.0
    let sz = 1.0

    if (targetDimensions) {
      if (size.x > 0) sx = targetDimensions[0] / size.x
      if (size.y > 0) sy = targetDimensions[1] / size.y
      if (size.z > 0) sz = targetDimensions[2] / size.z
    } else if (targetHeight && size.y > 0) {
      const s = targetHeight / size.y
      sx = s
      sy = s
      sz = s
    } else if (targetWidth && size.x > 0) {
      const s = targetWidth / size.x
      sx = s
      sy = s
      sz = s
    } else if (targetDepth && size.z > 0) {
      const s = targetDepth / size.z
      sx = s
      sy = s
      sz = s
    }

    // Offset so bottom rests exactly on Y = 0 and centered on X and Z
    inner.position.set(-center.x, -box.min.y, -center.z)

    const outer = new THREE.Group()
    outer.add(inner)
    outer.scale.set(sx, sy, sz)
    return outer
  }, [
    scene,
    preRotation,
    filterMesh,
    targetDimensions,
    targetHeight,
    targetWidth,
    targetDepth,
    castShadow,
    receiveShadow,
    materialTweaks
  ])

  return <primitive object={wrapper} position={position} rotation={rotation} />
}

// Preload models
useGLTF.preload('/models/case_000/phich-nuoc__hot_water_flask.glb')
useGLTF.preload('/models/case_000/old_television_from_90s.glb')
useGLTF.preload('/models/case_000/wooden_dresser_drawer_pair.glb')
useGLTF.preload('/models/case_000/decrepit_window_1.glb')
useGLTF.preload('/models/case_000/bedroom_bed_clean.glb')
useGLTF.preload('/models/case_000/concrete_trash_bin.glb')
useGLTF.preload('/models/case_000/medieval_wardrobe.glb')
useGLTF.preload('/models/case_000/table_fan.glb')

// ==========================================
// RẠNG ĐÔNG THERMOS FLASK FALLBACK
// ==========================================
function RangDongFlask({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.17, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.072, 0.32, 20]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.076, 0.076, 0.06, 20]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.038, 0.075, 0.05, 20]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.034, 0.038, 0.035, 16]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.41, 0]}>
        <cylinderGeometry args={[0.024, 0.021, 0.035, 14]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ==========================================
// VINTAGE ASHTRAY WITH CIGARETTES
// ==========================================
function VintageAshtray({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.028, 16]} />
        <meshStandardMaterial
          color="#a7f3d0"
          transparent
          opacity={0.65}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.015, 0.02, 0.01]} rotation={[0.1, 0.6, 0.05]}>
        <cylinderGeometry args={[0.0038, 0.0038, 0.032, 8]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ==========================================
// AUTHENTIC VIETNAMESE WOODEN LIVING SET (TRƯỜNG KỶ & BÀN TRÀ)
// ==========================================
function VietnameseLivingRoomSet({
  woodTexture,
  woodNormalMap,
  woodRoughnessMap
}: {
  woodTexture: THREE.Texture
  woodNormalMap?: THREE.Texture
  woodRoughnessMap?: THREE.Texture
}) {
  return (
    <group position={[0, 0, -2.4]}>
      {/* 1. ARTISAN TEA TABLE (1.50m x 0.75m x 0.50m) */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.49, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.50, 0.03, 0.75]} />
          <meshStandardMaterial
            map={woodTexture}
            normalMap={woodNormalMap}
            normalScale={new THREE.Vector2(0.6, 0.6)}
            roughnessMap={woodRoughnessMap}
            roughness={0.24}
            metalness={0.06}
          />
        </mesh>
        <mesh position={[0, 0.47, 0]} castShadow>
          <boxGeometry args={[1.58, 0.035, 0.83]} />
          <meshStandardMaterial
            map={woodTexture}
            normalMap={woodNormalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            roughnessMap={woodRoughnessMap}
            roughness={0.34}
            metalness={0.05}
          />
        </mesh>

        {/* 4 Table Legs */}
        {[
          [-0.70, 0, -0.33],
          [0.70, 0, -0.33],
          [-0.70, 0, 0.33],
          [0.70, 0, 0.33]
        ].map((pos, i) => (
          <TurnedWoodenLeg
            key={`tbl-leg-${i}`}
            position={pos as [number, number, number]}
            height={0.47}
            woodTexture={woodTexture}
            woodNormalMap={woodNormalMap}
            woodRoughnessMap={woodRoughnessMap}
          />
        ))}

        {/* Props on Table */}
        <group position={[-0.18, 0.51, 0.02]}>
          <mesh receiveShadow>
            <boxGeometry args={[0.48, 0.016, 0.32]} />
            <meshStandardMaterial color="#30160b" roughness={0.35} />
          </mesh>
          <VintageTeapot position={[0.05, 0.01, -0.02]} />
          {[
            [-0.12, 0.01, -0.07],
            [-0.13, 0.01, 0.06],
            [-0.03, 0.01, 0.07]
          ].map((cPos, ci) => (
            <group key={`cup-${ci}`} position={cPos as [number, number, number]}>
              <mesh position={[0, 0.02, 0]} castShadow>
                <cylinderGeometry args={[0.026, 0.018, 0.04, 14]} />
                <meshStandardMaterial color="#f9fafb" roughness={0.2} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Hot Water Flask (Rạng Đông 42cm) */}
        <Suspense fallback={<RangDongFlask position={[0.52, 0.51, -0.14]} />}>
          <AutoScaledGLB
            url="/models/case_000/phich-nuoc__hot_water_flask.glb"
            targetDimensions={[0.16, 0.42, 0.16]}
            position={[0.52, 0.51, -0.14]}
            rotation={[0, -0.4, 0]}
          />
        </Suspense>

        <VintageAshtray position={[0.28, 0.51, 0.14]} />
      </group>

      {/* CRIME SCENE EVIDENCE ON FLOOR: SHATTERED TEACUP & CERAMIC BLOOD SHARD */}
      <group position={[-0.45, 0.005, 0.55]}>
        {/* Dark dried blood stain patch */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.26, 16]} />
          <meshStandardMaterial color="#3f0708" roughness={0.88} />
        </mesh>
        {/* Broken ceramic pieces */}
        <mesh position={[-0.06, 0.01, -0.04]} rotation={[0.4, 0.8, -0.2]} castShadow>
          <boxGeometry args={[0.06, 0.008, 0.04]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        <mesh position={[0.08, 0.01, 0.02]} rotation={[-0.2, 0.5, 0.6]} castShadow>
          <boxGeometry args={[0.05, 0.006, 0.03]} />
          <meshStandardMaterial color="#eedfd5" roughness={0.3} />
        </mesh>
        {/* Forensic yellow evidence marker card */}
        <mesh position={[0.16, 0.02, -0.12]} rotation={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.06, 0.04, 0.003]} />
          <meshStandardMaterial color="#facc15" roughness={0.4} />
        </mesh>
      </group>

      {/* 2. LONG BENCH (TRƯỜNG KỶ: 1.95m x 0.62m x 0.92m) */}
      <group position={[0, 0, -0.92]}>
        <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.95, 0.032, 0.60]} />
          <meshStandardMaterial
            map={woodTexture}
            normalMap={woodNormalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            roughnessMap={woodRoughnessMap}
            roughness={0.28}
            metalness={0.05}
          />
        </mesh>
        {[
          [-0.90, 0, -0.24],
          [0.90, 0, -0.24],
          [-0.90, 0, 0.24],
          [0.90, 0, 0.24]
        ].map((pos, i) => (
          <TurnedWoodenLeg
            key={`bench-leg-${i}`}
            position={pos as [number, number, number]}
            height={0.42}
            woodTexture={woodTexture}
            woodNormalMap={woodNormalMap}
            woodRoughnessMap={woodRoughnessMap}
          />
        ))}
        {/* Bench Backrest */}
        <group position={[0, 0.70, -0.28]}>
          <mesh position={[0, 0.20, 0]} castShadow>
            <boxGeometry args={[2.00, 0.07, 0.045]} />
            <meshStandardMaterial
              map={woodTexture}
              normalMap={woodNormalMap}
              roughnessMap={woodRoughnessMap}
              roughness={0.36}
            />
          </mesh>
          {[-0.62, 0, 0.62].map((bx, bi) => (
            <mesh key={`b-pan-${bi}`} position={[bx, 0.02, 0]} castShadow>
              <boxGeometry args={[0.50, 0.40, 0.035]} />
              <meshStandardMaterial
                map={woodTexture}
                normalMap={woodNormalMap}
                roughnessMap={woodRoughnessMap}
                roughness={0.42}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* 3. UPRIGHT ARMCHAIR 1 (0.72m x 0.62m x 0.90m) */}
      <group position={[1.25, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.70, 0.03, 0.60]} />
          <meshStandardMaterial
            map={woodTexture}
            normalMap={woodNormalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            roughnessMap={woodRoughnessMap}
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>
        {[
          [-0.29, 0, -0.24],
          [0.29, 0, -0.24],
          [-0.29, 0, 0.24],
          [0.29, 0, 0.24]
        ].map((pos, i) => (
          <TurnedWoodenLeg
            key={`ch1-leg-${i}`}
            position={pos as [number, number, number]}
            height={0.42}
            woodTexture={woodTexture}
            woodNormalMap={woodNormalMap}
            woodRoughnessMap={woodRoughnessMap}
          />
        ))}
        <group position={[0, 0.70, -0.28]}>
          <mesh position={[0, 0.20, 0]} castShadow>
            <boxGeometry args={[0.74, 0.07, 0.045]} />
            <meshStandardMaterial
              map={woodTexture}
              normalMap={woodNormalMap}
              roughnessMap={woodRoughnessMap}
              roughness={0.38}
            />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[0.54, 0.40, 0.035]} />
            <meshStandardMaterial
              map={woodTexture}
              normalMap={woodNormalMap}
              roughnessMap={woodRoughnessMap}
              roughness={0.4}
            />
          </mesh>
        </group>
      </group>

      {/* 4. OVERTURNED ARMCHAIR 2 (GHẾ ĐƠN BỊ XÔ NGÃ LẬT TRONG LÚC GIẰNG CO) */}
      <group position={[-1.25, 0.20, 0.1]} rotation={[0.4, 0.2, 1.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.70, 0.03, 0.60]} />
          <meshStandardMaterial
            map={woodTexture}
            normalMap={woodNormalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
            roughnessMap={woodRoughnessMap}
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>
        {[
          [-0.29, -0.40, -0.24],
          [0.29, -0.40, -0.24],
          [-0.29, -0.40, 0.24],
          [0.29, -0.40, 0.24]
        ].map((pos, i) => (
          <TurnedWoodenLeg
            key={`ch2-leg-${i}`}
            position={pos as [number, number, number]}
            height={0.40}
            woodTexture={woodTexture}
            woodNormalMap={woodNormalMap}
            woodRoughnessMap={woodRoughnessMap}
          />
        ))}
      </group>
    </group>
  )
}

// ==========================================
// OUTDOOR COURTYARD GARDEN (SÂN VƯỜN NGOÀI CỬA CHÍNH)
// ==========================================
function OutdoorCourtyardGarden({
  courtyardTexture,
  stoneTexture,
  barkTexture
}: {
  courtyardTexture: THREE.Texture
  stoneTexture: THREE.Texture
  barkTexture: THREE.Texture
}) {
  return (
    <group>
      {/* 1. COURTYARD BRICK GROUND (SÂN GẠCH BÁT TRÀNG ẨM ƯỚT) */}
      <mesh
        position={[1.6, -0.22, 7.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[14.0, 7.5]} />
        <meshStandardMaterial
          map={courtyardTexture}
          roughness={0.42}
          metalness={0.12}
        />
      </mesh>

      {/* 2. DAMP SOIL PATCH UNDER XOAN TREE (ĐẤT ẨM GỐC XOAN CÓ VẾT GIẪM LÕM SIZE 37) */}
      <mesh position={[0.9, -0.21, 6.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.2, 24]} />
        <meshStandardMaterial color="#1a120c" roughness={0.9} />
      </mesh>
      {/* Footprint size 37 */}
      <mesh position={[0.65, -0.20, 6.4]} rotation={[-Math.PI / 2, 0, 0.4]}>
        <planeGeometry args={[0.09, 0.22]} />
        <meshStandardMaterial color="#0d0906" roughness={0.95} />
      </mesh>

      {/* 3. WEATHERED STONE PORCH STEPS */}
      <mesh position={[1.6, -0.06, 3.98]} receiveShadow castShadow>
        <boxGeometry args={[2.08, 0.12, 0.42]} />
        <meshStandardMaterial map={stoneTexture} roughness={0.45} />
      </mesh>
      <mesh position={[1.6, -0.16, 4.38]} receiveShadow castShadow>
        <boxGeometry args={[2.48, 0.12, 0.42]} />
        <meshStandardMaterial map={stoneTexture} roughness={0.45} />
      </mesh>

      {/* 4. SCATTERED FALLEN XOAN FLOWERS */}
      {[
        [1.3, -0.005, 3.82],
        [1.5, -0.005, 3.88],
        [1.8, -0.005, 3.84],
        [1.2, -0.105, 4.25],
        [1.7, -0.105, 4.32],
        [2.0, -0.105, 4.22],
        [1.4, -0.21, 4.75],
        [0.85, -0.21, 6.2],
        [1.15, -0.21, 6.35]
      ].map((pos, i) => (
        <mesh key={`xoan-petal-${i}`} position={pos as [number, number, number]} rotation={[-Math.PI / 2, 0, i * 0.7]}>
          <circleGeometry args={[0.022, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#e9d5ff' : '#fef08a'} roughness={0.6} />
        </mesh>
      ))}

      {/* 5. GNARLY XOAN TREE (GỐC CÂY XOAN CỔ THỤ) */}
      <group position={[0.9, -0.22, 6.6]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.28, 1.2, 12]} />
          <meshStandardMaterial map={barkTexture} roughness={0.8} />
        </mesh>
        <mesh position={[0.08, 1.6, 0.05]} rotation={[0.12, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 1.1, 12]} />
          <meshStandardMaterial map={barkTexture} roughness={0.8} />
        </mesh>
        <mesh position={[0.22, 2.5, 0.14]} rotation={[-0.1, 0, 0.22]} castShadow>
          <cylinderGeometry args={[0.13, 0.18, 1.0, 12]} />
          <meshStandardMaterial map={barkTexture} roughness={0.8} />
        </mesh>
        <mesh position={[-0.38, 2.8, -0.15]} rotation={[0.5, -0.3, -0.8]} castShadow>
          <cylinderGeometry args={[0.07, 0.11, 1.4, 8]} />
          <meshStandardMaterial map={barkTexture} roughness={0.8} />
        </mesh>
        <mesh position={[0.52, 3.0, 0.25]} rotation={[-0.3, 0.4, 0.7]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 1.5, 8]} />
          <meshStandardMaterial map={barkTexture} roughness={0.8} />
        </mesh>
        {/* Foliage Clusters */}
        {[
          [-0.7, 3.3, -0.3, 0.75],
          [-0.3, 3.6, -0.1, 0.65],
          [0.8, 3.5, 0.3, 0.85],
          [1.1, 3.7, 0.1, 0.6],
          [0.2, 3.9, -0.4, 0.7],
          [0.1, 4.2, 0.2, 0.8]
        ].map(([fx, fy, fz, fr], idx) => (
          <mesh key={`xoan-leaf-${idx}`} position={[fx, fy, fz]}>
            <dodecahedronGeometry args={[fr, 1]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#1b2f1f' : '#142518'} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 6. CERAMIC PLANTER POTS */}
      <group position={[0.25, -0.08, 4.05]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.16, 0.4, 16]} />
          <meshStandardMaterial color="#472617" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.05, 16]} />
          <meshStandardMaterial color="#3b1f13" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <dodecahedronGeometry args={[0.38, 1]} />
          <meshStandardMaterial color="#1f3b25" roughness={0.7} />
        </mesh>
      </group>
      <group position={[2.95, -0.08, 4.05]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.24, 0.18, 0.42, 16]} />
          <meshStandardMaterial color="#2d3748" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.05, 16]} />
          <meshStandardMaterial color="#1a202c" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <dodecahedronGeometry args={[0.42, 1]} />
          <meshStandardMaterial color="#1e3a24" roughness={0.7} />
        </mesh>
      </group>

      {/* 7. COURTYARD BOUNDARY WALL & IRON GATE */}
      <group position={[1.6, 0.9, 9.2]}>
        <mesh position={[-3.8, 0, 0]} receiveShadow>
          <boxGeometry args={[6.5, 2.2, 0.24]} />
          <meshStandardMaterial color="#2d241c" roughness={0.9} />
        </mesh>
        <mesh position={[3.8, 0, 0]} receiveShadow>
          <boxGeometry args={[6.5, 2.2, 0.24]} />
          <meshStandardMaterial color="#2d241c" roughness={0.9} />
        </mesh>
        <mesh position={[-0.6, 0.05, 0]}>
          <boxGeometry args={[0.36, 2.3, 0.36]} />
          <meshStandardMaterial color="#221b15" roughness={0.85} />
        </mesh>
        <mesh position={[0.6, 0.05, 0]}>
          <boxGeometry args={[0.36, 2.3, 0.36]} />
          <meshStandardMaterial color="#221b15" roughness={0.85} />
        </mesh>
        <group position={[-0.42, -0.15, 0]} rotation={[0, 0.45, 0]}>
          <mesh position={[0.4, 0.5, 0]}>
            <boxGeometry args={[0.8, 1.7, 0.03]} />
            <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* 8. OUTDOOR PORCH LANTERN */}
      <group position={[1.6, 2.55, 3.88]}>
        <mesh position={[0, 0.08, -0.06]}>
          <boxGeometry args={[0.04, 0.16, 0.12]} />
          <meshStandardMaterial color="#78350f" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.18, 0.24, 0.18]} />
          <meshStandardMaterial color="#1c1917" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#fffbeb" emissive="#f59e0b" emissiveIntensity={3.0} />
        </mesh>
        <pointLight
          position={[0, -0.1, 0.05]}
          color="#f59e0b"
          intensity={2.6}
          distance={7.0}
          decay={2}
        />
      </group>

      {/* 9. NIGHT MOONLIGHT OVER COURTYARD */}
      <directionalLight
        position={[4.0, 7.0, 10.0]}
        target-position={[1.6, 0, 6.0]}
        color="#7dd3fc"
        intensity={0.45}
      />
    </group>
  )
}

// ==========================================
// DOUBLE-LEAF WOODEN ENTRANCE DOORWAY (CỬA CHÍNH MỞ TOANG)
// ==========================================
function EntranceDoorway({ woodTexture }: { woodTexture: THREE.Texture }) {
  return (
    <group>
      {/* 1. SOLID WOOD DOOR FRAME */}
      <mesh position={[0.8, 1.18, 3.75]} castShadow>
        <boxGeometry args={[0.08, 2.36, 0.16]} />
        <meshStandardMaterial map={woodTexture} roughness={0.4} />
      </mesh>
      <mesh position={[2.4, 1.18, 3.75]} castShadow>
        <boxGeometry args={[0.08, 2.36, 0.16]} />
        <meshStandardMaterial map={woodTexture} roughness={0.4} />
      </mesh>
      <mesh position={[1.6, 2.36, 3.75]} castShadow>
        <boxGeometry args={[1.68, 0.08, 0.16]} />
        <meshStandardMaterial map={woodTexture} roughness={0.4} />
      </mesh>
      <mesh position={[1.6, 0.02, 3.75]} receiveShadow>
        <boxGeometry args={[1.68, 0.04, 0.20]} />
        <meshStandardMaterial map={woodTexture} roughness={0.35} />
      </mesh>

      {/* 2. LEFT DOOR LEAF (SWUNG OPEN OUTWARDS TO LEFT) */}
      <group position={[0.84, 1.16, 3.75]} rotation={[0, -2.15, 0]}>
        <mesh position={[0.36, 0, 0]} castShadow>
          <boxGeometry args={[0.72, 2.24, 0.04]} />
          <meshStandardMaterial map={woodTexture} roughness={0.38} />
        </mesh>
        <mesh position={[0.36, 0.45, 0.022]}>
          <boxGeometry args={[0.54, 0.88, 0.01]} />
          <meshStandardMaterial color="#23130a" roughness={0.5} />
        </mesh>
        <mesh position={[0.36, -0.45, 0.022]}>
          <boxGeometry args={[0.54, 0.74, 0.01]} />
          <meshStandardMaterial color="#23130a" roughness={0.5} />
        </mesh>
        <mesh position={[0.62, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.032, 0.006, 8, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* 3. RIGHT DOOR LEAF (SWUNG OPEN OUTWARDS TO RIGHT) */}
      <group position={[2.36, 1.16, 3.75]} rotation={[0, 2.15, 0]}>
        <mesh position={[-0.36, 0, 0]} castShadow>
          <boxGeometry args={[0.72, 2.24, 0.04]} />
          <meshStandardMaterial map={woodTexture} roughness={0.38} />
        </mesh>
        <mesh position={[-0.36, 0.45, 0.022]}>
          <boxGeometry args={[0.54, 0.88, 0.01]} />
          <meshStandardMaterial color="#23130a" roughness={0.5} />
        </mesh>
        <mesh position={[-0.36, -0.45, 0.022]}>
          <boxGeometry args={[0.54, 0.74, 0.01]} />
          <meshStandardMaterial color="#23130a" roughness={0.5} />
        </mesh>
        <mesh position={[-0.62, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.032, 0.006, 8, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  )
}

// ==========================================
// VINTAGE WALL PICTURE FRAME
// ==========================================
function createPhotoPlaceholderTexture(text: string, subtitle = 'Thay ảnh vào sau') {
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

function WallPictureFrame({
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

// ==========================================
// 3D ARCHITECTURAL ROOM GEOMETRY & PROPS
// ==========================================
function CrimeSceneGeometry({
  onSelectSpot,
  activeSpotId
}: {
  onSelectSpot: (spot: RoomHotspot) => void
  activeSpotId?: string | null
}) {
  const {
    floorTexture,
    floorBumpMap,
    createWallMaterial,
    woodTexture,
    woodNormalMap,
    woodRoughnessMap,
    baseboardWood,
    beamWood,
    nightWindowTexture,
    courtyardTexture,
    stoneTexture,
    barkTexture
  } = useProceduralTextures()

  // Wall materials with accurately scaled plaster repeats
  const matWallNorth = useMemo(() => createWallMaterial(10.0, 3.4), [createWallMaterial])
  const matWallWest = useMemo(() => createWallMaterial(7.5, 3.4), [createWallMaterial])
  const matWallSouthLeft = useMemo(() => createWallMaterial(5.8, 3.4), [createWallMaterial])
  const matWallSouthLintel = useMemo(() => createWallMaterial(1.6, 1.04), [createWallMaterial])
  const matWallSouthRight = useMemo(() => createWallMaterial(2.6, 3.4), [createWallMaterial])
  const matWallEastNorth = useMemo(() => createWallMaterial(3.58, 3.4), [createWallMaterial])
  const matWallEastSouth = useMemo(() => createWallMaterial(2.58, 3.4), [createWallMaterial])
  const matWallEastSill = useMemo(() => createWallMaterial(1.34, 0.87), [createWallMaterial])
  const matWallEastLintel = useMemo(() => createWallMaterial(1.34, 0.87), [createWallMaterial])

  return (
    <group>
      {/* 1. FLOOR (10.0m x 7.5m) WITH AUTHENTIC 25cm VIETNAMESE ENCAUSTIC TILES */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10.0, 7.5]} />
        <meshStandardMaterial
          map={floorTexture}
          bumpMap={floorBumpMap}
          bumpScale={0.016}
          roughness={0.28}
          metalness={0.08}
        />
      </mesh>

      {/* 2. CEILING (10.0m x 7.5m, 3.4m height) WITH WOODEN CROSS BEAMS */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.4, 0]}>
        <planeGeometry args={[10.0, 7.5]} />
        <meshStandardMaterial color="#2d2218" roughness={0.9} />
      </mesh>
      {[-4.0, -2.0, 0, 2.0, 4.0].map((x) => (
        <mesh key={x} position={[x, 3.32, 0]}>
          <boxGeometry args={[0.22, 0.16, 7.54]} />
          <meshStandardMaterial map={beamWood} roughness={0.7} />
        </mesh>
      ))}

      {/* 3. WALL NORTH (Z = -3.75, 10.0m x 3.4m) */}
      <mesh position={[0, 1.7, -3.75]} material={matWallNorth} receiveShadow />

      {/* WALL PICTURE FRAMES */}
      {WALL_PICTURE_FRAMES.map((f) => (
        <WallPictureFrame
          key={f.id}
          label={f.label}
          subtitle={f.subtitle}
          imageUrl={f.imageUrl}
          position={f.position}
          width={f.width}
          height={f.height}
          tilt={f.tilt}
          woodTexture={woodTexture}
        />
      ))}

      {/* MECHANICAL WALL CLOCK (ĐỒNG HỒ CƠ QUẢ LẮC) */}
      <group position={[-2.8, 2.35, -3.71]}>
        <mesh>
          <boxGeometry args={[0.42, 0.72, 0.08]} />
          <meshStandardMaterial map={woodTexture} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.12, 0.045]}>
          <circleGeometry args={[0.13, 24]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.16, 0.043]}>
          <boxGeometry args={[0.015, 0.22, 0.01]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 4. WALL SOUTH (Z = +3.75, CÓ Ô CỬA CHÍNH TỪ X = 0.8 ĐẾN 2.4) */}
      {/* 4A. Left Segment (X = -5.0 to 0.8) */}
      <mesh position={[-2.1, 1.7, 3.75]} rotation={[0, Math.PI, 0]} material={matWallSouthLeft} receiveShadow />
      {/* 4B. Lintel above door (X = 0.8 to 2.4, Y = 2.36 to 3.4) */}
      <mesh position={[1.6, 2.88, 3.75]} rotation={[0, Math.PI, 0]} material={matWallSouthLintel} receiveShadow />
      {/* 4C. Right Segment behind TV (X = 2.4 to 5.0) */}
      <mesh position={[3.7, 1.7, 3.75]} rotation={[0, Math.PI, 0]} material={matWallSouthRight} receiveShadow />

      {/* OUTDOOR COURTYARD GARDEN (SÂN VƯỜN NGOÀI CỬA CHÍNH) */}
      <OutdoorCourtyardGarden
        courtyardTexture={courtyardTexture}
        stoneTexture={stoneTexture}
        barkTexture={barkTexture}
      />

      {/* ENTRANCE DOORWAY (CỬA CHÍNH 2 CÁNH GỖ MỞ TOANG) */}
      <EntranceDoorway woodTexture={woodTexture} />

      {/* 5. WALL EAST (X = +5.0, CÓ TRỔ Ô CỬA SỔ RỘNG 1.34m x CAO 1.66m TẠI Z = 0.5) */}
      {/* 5A. North-East Segment (Z = -3.75 to -0.17) */}
      <mesh position={[5.0, 1.7, -1.96]} rotation={[0, -Math.PI / 2, 0]} material={matWallEastNorth} receiveShadow />
      {/* 5B. South-East Segment (Z = 1.17 to 3.75) */}
      <mesh position={[5.0, 1.7, 2.46]} rotation={[0, -Math.PI / 2, 0]} material={matWallEastSouth} receiveShadow />
      {/* 5C. Sill Wall Below Window (Z = -0.17 to 1.17, Y = 0 to 0.87) */}
      <mesh position={[5.0, 0.435, 0.5]} rotation={[0, -Math.PI / 2, 0]} material={matWallEastSill} receiveShadow />
      {/* 5D. Lintel Wall Above Window (Z = -0.17 to 1.17, Y = 2.53 to 3.4) */}
      <mesh position={[5.0, 2.965, 0.5]} rotation={[0, -Math.PI / 2, 0]} material={matWallEastLintel} receiveShadow />

      {/* EAST WINDOW FRAME & RAINY NIGHT SKY VIEW */}
      <group position={[5.0, 1.70, 0.5]}>
        {/* Wooden Window Frame Surround */}
        <mesh rotation={[0, -Math.PI / 2, 0]} position={[0, 0, 0]}>
          <boxGeometry args={[1.36, 1.68, 0.08]} />
          <meshStandardMaterial map={woodTexture} roughness={0.5} />
        </mesh>

        {/* Window 3D GLB Model */}
        <Suspense
          fallback={
            <mesh rotation={[0, -Math.PI / 2, 0]} position={[0, 0, 0]}>
              <boxGeometry args={[1.30, 1.60, 0.08]} />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
          }
        >
          <AutoScaledGLB
            url="/models/case_000/decrepit_window_1.glb"
            targetDimensions={[1.32, 1.64, 0.10]}
            position={[0, -0.82, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          />
        </Suspense>

        {/* Night Sky & Distant Railway Signal Backdrop */}
        <mesh rotation={[0, -Math.PI / 2, 0]} position={[0.22, 0, 0]}>
          <planeGeometry args={[2.4, 2.2]} />
          <meshBasicMaterial map={nightWindowTexture} toneMapped={false} />
        </mesh>
      </group>

      {/* Soft Moonlight streaming in from the East Window */}
      <directionalLight
        position={[7.5, 3.2, 0.5]}
        target-position={[2.0, 0.8, 0.5]}
        color="#93c5fd"
        intensity={0.35}
      />

      {/* 6. WALL WEST (X = -5.0, 7.5m x 3.4m) */}
      <mesh position={[-5.0, 1.7, 0]} rotation={[0, Math.PI / 2, 0]} material={matWallWest} receiveShadow />

      {/* Vintage Wall Calendar on West Wall */}
      <group position={[-4.97, 1.8, -0.4]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[0.42, 0.62, 0.02]} />
          <meshStandardMaterial color="#991b1b" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.06, 0.012]}>
          <planeGeometry args={[0.34, 0.42]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.4} />
        </mesh>
      </group>

      {/* 7. WOODEN BASEBOARDS */}
      <mesh position={[0, 0.08, -3.72]}>
        <boxGeometry args={[10.0, 0.16, 0.05]} />
        <meshStandardMaterial map={baseboardWood} />
      </mesh>
      <mesh position={[-2.1, 0.08, 3.72]}>
        <boxGeometry args={[5.8, 0.16, 0.05]} />
        <meshStandardMaterial map={baseboardWood} />
      </mesh>
      <mesh position={[3.7, 0.08, 3.72]}>
        <boxGeometry args={[2.6, 0.16, 0.05]} />
        <meshStandardMaterial map={baseboardWood} />
      </mesh>
      <mesh position={[4.97, 0.08, 0]}>
        <boxGeometry args={[0.05, 0.16, 7.5]} />
        <meshStandardMaterial map={baseboardWood} />
      </mesh>
      <mesh position={[-4.97, 0.08, 0]}>
        <boxGeometry args={[0.05, 0.16, 7.5]} />
        <meshStandardMaterial map={baseboardWood} />
      </mesh>

      {/* 8. AUTHENTIC VIETNAMESE WOODEN LIVING SET */}
      <VietnameseLivingRoomSet
        woodTexture={woodTexture}
        woodNormalMap={woodNormalMap}
        woodRoughnessMap={woodRoughnessMap}
      />

      {/* 8B. VINTAGE BEDROOM SET (GÓC TÂY-BẮC: ĐÃ SỬA GÓC XOAY TRỤC Z-UP, NẰM PHẲNG SÀN) */}
      <group position={[-3.7, 0, -2.45]}>
        <Suspense
          fallback={
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.9, 0.9, 2.3]} />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
          }
        >
          {/* Bed rotated -90 deg on X to lay flat on floor, headboard against North Wall */}
          <AutoScaledGLB
            url="/models/case_000/bedroom_bed_clean.glb"
            preRotation={[-Math.PI / 2, 0, 0]}
            targetDimensions={[1.90, 1.10, 2.30]}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
          />
        </Suspense>

        {/* Pillow on the Bed with Love Spell Detail (Bùa yêu của Hà giấu trong gối) */}
        <group position={[0.28, 0.54, -0.65]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.58, 0.14, 0.38]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
          {/* Red thread & triangular red cloth amulet mark */}
          <mesh position={[0.08, 0.075, 0.02]} rotation={[-Math.PI / 2, 0, 0.4]}>
            <circleGeometry args={[0.04, 3]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
          <mesh position={[0.08, 0.076, 0.02]}>
            <cylinderGeometry args={[0.003, 0.003, 0.08, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* 9. VINTAGE LIM WARDROBE (GÓC TÂY-NAM: TỦ GỖ LIM 1996) */}
      <group position={[-3.8, 0, 3.0]}>
        <Suspense
          fallback={
            <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.45, 2.2, 0.75]} />
              <meshStandardMaterial map={woodTexture} roughness={0.45} />
            </mesh>
          }
        >
          <AutoScaledGLB
            url="/models/case_000/medieval_wardrobe.glb"
            targetDimensions={[1.45, 2.20, 0.75]}
            position={[0, 0, 0]}
            rotation={[0, Math.PI, 0]}
          />
        </Suspense>
        {/* Rusty Iron Latch & Scratch Indicator on Doors */}
        <mesh position={[0.05, 1.15, -0.40]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.02, 0.14, 0.02]} />
          <meshStandardMaterial color="#78350f" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>

      {/* 9B. WOODEN TV CREDENZA & 90s CRT TELEVISION & TABLE FAN */}
      <group position={[3.65, 0, 3.25]}>
        {/* TV Cabinet (Đã lọc bỏ Drawer phụ để tủ tivi cân đối hoàn hảo) */}
        <Suspense
          fallback={
            <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.35, 0.85, 0.50]} />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
          }
        >
          <AutoScaledGLB
            url="/models/case_000/wooden_dresser_drawer_pair.glb"
            filterMesh={(mesh) => !mesh.name.includes('Drawer_4')}
            targetDimensions={[1.35, 0.85, 0.50]}
            position={[0, 0, 0]}
            rotation={[0, Math.PI, 0]}
          />
        </Suspense>

        {/* 90s CRT Television (Đặt vuông vắn vững chãi trên mặt tủ, quay vào lòng phòng) */}
        <Suspense
          fallback={
            <mesh position={[0, 1.10, 0]} castShadow>
              <boxGeometry args={[0.58, 0.48, 0.44]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          }
        >
          <AutoScaledGLB
            url="/models/case_000/old_television_from_90s.glb"
            targetDimensions={[0.58, 0.46, 0.42]}
            position={[-0.10, 0.85, 0]}
            rotation={[0, Math.PI - 0.15, 0]}
          />
        </Suspense>

        {/* Vintage Vietnamese Electric Table Fan beside TV */}
        <Suspense fallback={null}>
          <AutoScaledGLB
            url="/models/case_000/table_fan.glb"
            targetDimensions={[0.28, 0.38, 0.24]}
            position={[0.42, 0.85, 0.05]}
            rotation={[0, Math.PI - 0.3, 0]}
          />
        </Suspense>
      </group>

      {/* 10. VINTAGE WASTEBASKET (ĐẶT CẠNH CỬA RA VÀO NAM) */}
      <Suspense
        fallback={
          <group position={[0.48, 0.22, 3.42]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.16, 0.13, 0.44, 16]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
            </mesh>
          </group>
        }
      >
        <AutoScaledGLB
          url="/models/case_000/concrete_trash_bin.glb"
          targetDimensions={[0.34, 0.44, 0.34]}
          position={[0.48, 0, 3.42]}
        />
      </Suspense>

      {/* 11. 3D ANNOTATION PINS (8 CHUẨN ĐIỂM KHÁM XÉT HIỆN TRƯỜNG) */}
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
    </group>
  )
}

// ==========================================
// 360 FIRST-PERSON CRIME SCENE CONTROLLER
// ==========================================
interface ControllerState {
  lon: number
  lat: number
  targetLon: number
  targetLat: number
  targetPos: THREE.Vector3
  currentPos: THREE.Vector3
  fov: number
  targetFov: number
  isInteracting: boolean
  downX: number
  downY: number
  downLon: number
  downLat: number
}

function FirstPersonRoomCamera({
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
function MinimalNeedleCompass({ heading }: { heading: number }) {
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

// ==========================================
// MAIN 3D CRIME SCENE ROOM COMPONENT
// ==========================================
interface CrimeSceneRoom3DProps {
  onSelectSpot?: (spot: RoomHotspot) => void
}

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
      className="relative w-full h-full bg-[#050302] select-none overflow-hidden cursor-grab active:cursor-grabbing touch-none"
    >
      {/* 3D CANVAS VIEWPORT */}
      <Canvas
        shadows
        camera={{ position: [0, 1.62, 0.5], fov: 65 }}
        className="w-full h-full block"
      >
        <ambientLight intensity={0.52} color="#fed7aa" />

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
