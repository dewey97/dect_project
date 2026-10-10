'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause } from 'lucide-react'

export interface Hotspot360 {
  id: string
  num: number
  photoNumber: '9' | '11' | '15' | '17' | '18'
  yaw: number // degrees (-180 to 180)
  pitch: number // degrees (-85 to 85)
  imageUrl: string
  soundFile: string
  soundCaption: string
  title?: string
}

interface Scene360ViewerProps {
  imageUrl?: string
  hotspots: Hotspot360[]
  onSelectSpot: (spot: Hotspot360) => void
  selectedSpotId?: string | null
}

export function Scene360Viewer({
  imageUrl = '/images/cases/case_000/room_360_equirectangular.jpg',
  hotspots,
  onSelectSpot,
  selectedSpotId
}: Scene360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Screen positions for 2D UI hotspots mapped from 3D sphere
  const [screenHotspots, setScreenHotspots] = useState<
    Array<{
      id: string
      x: number
      y: number
      visible: boolean
      spot: Hotspot360
    }>
  >([])

  const [fov, setFov] = useState(70)
  const [heading, setHeading] = useState(0) // 0 - 360 for compass
  const [isLoading, setIsLoading] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)

  // References for Three.js state
  const stateRef = useRef({
    lon: 0,
    lat: 0,
    targetLon: 0,
    targetLat: 0,
    isUserInteracting: false,
    onPointerDownPointerX: 0,
    onPointerDownPointerY: 0,
    onPointerDownLon: 0,
    onPointerDownLat: 0,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    scene: null as THREE.Scene | null,
    animationFrameId: 0
  })

  // Convert (yaw, pitch) to 3D Vector3 on sphere surface
  const getVectorFromYawPitch = useCallback((yawDeg: number, pitchDeg: number, radius = 450) => {
    const phi = THREE.MathUtils.degToRad(90 - pitchDeg)
    const theta = THREE.MathUtils.degToRad(yawDeg)

    const x = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.cos(theta)
    return new THREE.Vector3(x, y, z)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const state = stateRef.current
    const width = container.clientWidth || 800
    const height = container.clientHeight || 500

    // 1. SCENE & CAMERA (Rectilinear Perspective keeps lines straight without fish-eye bending)
    const scene = new THREE.Scene()
    state.scene = scene

    const camera = new THREE.PerspectiveCamera(70, width / height, 1, 1100)
    state.camera = camera

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    state.renderer = renderer

    // 3. 360 SPHERE MESH
    const geometry = new THREE.SphereGeometry(500, 64, 40)
    geometry.scale(-1, 1, 1)

    const textureLoader = new THREE.TextureLoader()
    setIsLoading(true)

    textureLoader.load(
      imageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.minFilter = THREE.LinearFilter
        texture.generateMipmaps = false

        const material = new THREE.MeshBasicMaterial({
          map: texture
        })
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
        setIsLoading(false)
      },
      undefined,
      (err) => {
        console.warn('Fallback loading panorama texture:', err)
        // Fallback to cylindrical panorama
        textureLoader.load(
          '/images/cases/case_000/room_360_panorama.jpg',
          (altTex) => {
            altTex.colorSpace = THREE.SRGBColorSpace
            const material = new THREE.MeshBasicMaterial({ map: altTex })
            const mesh = new THREE.Mesh(geometry, material)
            scene.add(mesh)
            setIsLoading(false)
          },
          undefined,
          () => {
            setIsLoading(false)
          }
        )
      }
    )

    // 4. ANIMATION LOOP & HOTSPOT PROJECTION
    const renderLoop = () => {
      if (autoRotate && !state.isUserInteracting) {
        state.targetLon += 0.08
      }

      state.lat = THREE.MathUtils.lerp(state.lat, state.targetLat, 0.15)
      state.lon = THREE.MathUtils.lerp(state.lon, state.targetLon, 0.15)

      state.lat = Math.max(-85, Math.min(85, state.lat))

      const phi = THREE.MathUtils.degToRad(90 - state.lat)
      const theta = THREE.MathUtils.degToRad(state.lon)

      const targetX = 500 * Math.sin(phi) * Math.cos(theta)
      const targetY = 500 * Math.cos(phi)
      const targetZ = 500 * Math.sin(phi) * Math.sin(theta)

      camera.lookAt(targetX, targetY, targetZ)
      renderer.render(scene, camera)

      // Calculate heading for compass (0 to 360 deg)
      const curHeading = Math.round(((state.lon % 360) + 360) % 360)
      setHeading(curHeading)

      // Project 3D Hotspots to 2D Screen Coordinates
      if (container) {
        const cWidth = container.clientWidth
        const cHeight = container.clientHeight
        const projected = hotspots.map((spot) => {
          const vec = getVectorFromYawPitch(spot.yaw, spot.pitch, 450)

          const camDir = new THREE.Vector3()
          camera.getWorldDirection(camDir)
          const dot = vec.clone().normalize().dot(camDir)
          const isVisible = dot > 0.15

          vec.project(camera)

          const screenX = ((vec.x + 1) * cWidth) / 2
          const screenY = ((-vec.y + 1) * cHeight) / 2

          return {
            id: spot.id,
            x: screenX,
            y: screenY,
            visible: isVisible && screenX >= -20 && screenX <= cWidth + 20 && screenY >= -20 && screenY <= cHeight + 20,
            spot
          }
        })
        setScreenHotspots(projected)
      }

      state.animationFrameId = requestAnimationFrame(renderLoop)
    }

    renderLoop()

    // 5. RESIZE LISTENER
    const handleResize = () => {
      if (!container || !camera || !renderer) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(state.animationFrameId)
      renderer.dispose()
      geometry.dispose()
    }
  }, [imageUrl, hotspots, getVectorFromYawPitch, autoRotate])

  // MOUSE & TOUCH EVENT HANDLERS
  const handlePointerDown = (e: React.PointerEvent) => {
    const state = stateRef.current
    state.isUserInteracting = true
    state.onPointerDownPointerX = e.clientX
    state.onPointerDownPointerY = e.clientY
    state.onPointerDownLon = state.targetLon
    state.onPointerDownLat = state.targetLat
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = stateRef.current
    if (!state.isUserInteracting) return

    const factor = ((state.camera?.fov || 70) / 70) * 0.18
    state.targetLon = (e.clientX - state.onPointerDownPointerX) * factor + state.onPointerDownLon
    state.targetLat = (state.onPointerDownPointerY - e.clientY) * factor + state.onPointerDownLat
  }

  const handlePointerUp = () => {
    stateRef.current.isUserInteracting = false
  }

  // WHEEL ZOOM HANDLER
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setFov((prev) => {
      const nextFov = Math.max(35, Math.min(85, prev + e.deltaY * 0.05))
      if (stateRef.current.camera) {
        stateRef.current.camera.fov = nextFov
        stateRef.current.camera.updateProjectionMatrix()
      }
      return nextFov
    })
  }

  // ZOOM BUTTONS
  const handleZoom = (delta: number) => {
    setFov((prev) => {
      const nextFov = Math.max(35, Math.min(85, prev + delta))
      if (stateRef.current.camera) {
        stateRef.current.camera.fov = nextFov
        stateRef.current.camera.updateProjectionMatrix()
      }
      return nextFov
    })
  }

  // RESET VIEW
  const handleResetView = () => {
    const state = stateRef.current
    state.targetLon = 0
    state.targetLat = 0
    setFov(70)
    if (state.camera) {
      state.camera.fov = 70
      state.camera.updateProjectionMatrix()
    }
  }

  // Compass cardinal text
  let dirName = 'BẮC'
  if (heading >= 45 && heading < 135) dirName = 'ĐÔNG'
  else if (heading >= 135 && heading < 225) dirName = 'NAM'
  else if (heading >= 225 && heading < 315) dirName = 'TÂY'

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      className="relative w-full h-full bg-[#050403] select-none overflow-hidden cursor-grab active:cursor-grabbing touch-none"
    >
      {/* 3D WEBGL CANVAS */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-3 z-30 pointer-events-none">
          <div className="size-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#d9a066] tracking-widest uppercase">
            Đang tải không gian hiện trường 360°...
          </span>
        </div>
      )}

      {/* 3D PROJECTED HOTSPOTS (CHUNG MẪU PIN ĐỎ ĐÁNH SỐ NHƯ 2D) */}
      {screenHotspots.map(({ id, x, y, visible, spot }) => {
        if (!visible) return null
        const isSelected = selectedSpotId === spot.id

        return (
          <div
            key={id}
            style={{
              transform: `translate3d(${x}px, ${y}px, 0)`,
              left: 0,
              top: 0
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelectSpot(spot)
              }}
              className="group relative flex items-center justify-center cursor-pointer focus:outline-none p-2"
              aria-label={`Điểm khám xét #${spot.num}`}
            >
              {/* Radar pulse effect behind pin */}
              <div className="absolute size-7 sm:size-8 rounded-full border border-red-500/60 animate-ping pointer-events-none" />

              {/* Numbered Solid Red Pin (Exact match with 2D Pin style) */}
              <div
                className={`size-6 sm:size-7 rounded-full text-white font-bold text-xs sm:text-[13px] font-mono flex items-center justify-center shadow-lg transition-transform duration-150 group-hover:scale-125 border ${
                  isSelected
                    ? 'bg-amber-500 border-amber-200 text-neutral-950 ring-2 ring-amber-400/80 scale-125'
                    : 'bg-[#cc1818] group-hover:bg-[#ee2222] border-[#ffe4e4]/80'
                }`}
              >
                {spot.num}
              </div>
            </button>
          </div>
        )
      })}

      {/* TOP-LEFT COMPASS & HEADING DISPLAY */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-2 bg-black/70 border border-[#8c5e35]/50 px-3 py-1.5 rounded backdrop-blur-md shadow-lg select-none">
        <div
          className="relative size-6 flex items-center justify-center transition-transform duration-75 ease-out"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          <div className="absolute -top-0.5 w-0 h-0 border-x-[3px] border-x-transparent border-b-[10px] border-b-[#ef4444]" />
          <div className="absolute -bottom-0.5 w-0 h-0 border-x-[3px] border-x-transparent border-t-[10px] border-t-[#cbd5e1]" />
          <div className="relative size-1 rounded-full bg-white" />
        </div>
        <div className="font-mono text-[11px] text-[#e5c07b] font-bold">
          HƯỚNG: {dirName} ({heading}°)
        </div>
      </div>

      {/* BOTTOM-RIGHT FLOATING CONTROLS */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/85 border border-[#593c26] p-1.5 rounded-lg backdrop-blur-sm shadow-xl pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setAutoRotate((prev) => !prev)
          }}
          className={`p-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono ${
            autoRotate
              ? 'bg-amber-600/80 text-white'
              : 'text-[#d9a066] hover:text-white hover:bg-[#382314]'
          }`}
          title={autoRotate ? 'Dừng tự động xoay' : 'Bật tự động xoay 360°'}
        >
          {autoRotate ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          <span className="hidden sm:inline">Tự xoay</span>
        </button>
        <div className="w-px h-4 bg-[#593c26]" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleZoom(-10)
          }}
          className="p-1.5 text-[#d9a066] hover:text-white hover:bg-[#382314] rounded transition-colors cursor-pointer"
          title="Phóng to góc nhìn"
        >
          <ZoomIn className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleZoom(10)
          }}
          className="p-1.5 text-[#d9a066] hover:text-white hover:bg-[#382314] rounded transition-colors cursor-pointer"
          title="Thu nhỏ góc nhìn"
        >
          <ZoomOut className="size-3.5" />
        </button>
        <div className="w-px h-4 bg-[#593c26]" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleResetView()
          }}
          className="p-1.5 text-[#d9a066] hover:text-white hover:bg-[#382314] rounded transition-colors cursor-pointer"
          title="Đặt lại hướng nhìn ban đầu"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
