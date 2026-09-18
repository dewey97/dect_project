'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Compass, ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react'

export interface Hotspot3D {
  id: string
  yaw: number // degrees (-180 to 180)
  pitch: number // degrees (-85 to 85)
  title: string
  caption: string
  detail: string
  imageUrl: string
}

interface Scene360ViewerProps {
  imageUrl: string
  hotspots: Hotspot3D[]
  onSelectSpot: (spot: Hotspot3D) => void
}

export function Scene360Viewer({ imageUrl, hotspots, onSelectSpot }: Scene360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Screen positions for 2D UI hotspots mapped from 3D sphere
  const [screenHotspots, setScreenHotspots] = useState<
    Array<{
      id: string
      x: number
      y: number
      visible: boolean
      spot: Hotspot3D
    }>
  >([])

  const [fov, setFov] = useState(70)
  const [heading, setHeading] = useState(0) // 0 - 360 for compass
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredSpot, setHoveredSpot] = useState<Hotspot3D | null>(null)

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

    // 1. SCENE & CAMERA
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
        console.warn('Fallback generating procedural grid for 360 viewer:', err)
        const canvasGen = document.createElement('canvas')
        canvasGen.width = 1024
        canvasGen.height = 512
        const ctx = canvasGen.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#140c06'
          ctx.fillRect(0, 0, 1024, 512)
          ctx.strokeStyle = '#593c26'
          ctx.lineWidth = 2
          for (let i = 0; i < 1024; i += 64) {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i, 512)
            ctx.stroke()
          }
          for (let j = 0; j < 512; j += 64) {
            ctx.beginPath()
            ctx.moveTo(0, j)
            ctx.lineTo(1024, j)
            ctx.stroke()
          }
          ctx.fillStyle = '#e8c89b'
          ctx.font = '24px monospace'
          ctx.fillText('HIỆN TRƯỜNG PHÒNG KHÁCH 360° — TEST GRID', 240, 256)
        }
        const fallbackTex = new THREE.CanvasTexture(canvasGen)
        const material = new THREE.MeshBasicMaterial({ map: fallbackTex })
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
        setIsLoading(false)
      }
    )

    // 4. ANIMATION LOOP & HOTSPOT PROJECTION
    const renderLoop = () => {
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
      const curHeading = (Math.round((state.lon % 360) + 360) % 360)
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
          const isVisible = dot > 0.2

          vec.project(camera)

          const screenX = ((vec.x + 1) * cWidth) / 2
          const screenY = ((-vec.y + 1) * cHeight) / 2

          return {
            id: spot.id,
            x: screenX,
            y: screenY,
            visible: isVisible && screenX >= 0 && screenX <= cWidth && screenY >= 0 && screenY <= cHeight,
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
  }, [imageUrl, hotspots, getVectorFromYawPitch])

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

    const factor = (state.camera?.fov || 70) / 70 * 0.18
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
            Đang giải mã không gian hiện trường 360°...
          </span>
        </div>
      )}

      {/* 3D PROJECTED HOTSPOTS */}
      {screenHotspots.map(({ id, x, y, visible, spot }) => {
        if (!visible) return null

        const isHovered = hoveredSpot?.id === spot.id

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
            {/* HOTSPOT BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelectSpot(spot)
              }}
              onMouseEnter={() => setHoveredSpot(spot)}
              onMouseLeave={() => setHoveredSpot(null)}
              className="relative group p-2 cursor-pointer focus:outline-none"
              aria-label={spot.title}
            >
              {/* RADAR TARGETING RETICLE */}
              <div className="relative flex items-center justify-center">
                <div className="absolute size-7 sm:size-8 rounded-full border border-red-500/60 animate-ping pointer-events-none" />
                <div className="size-6 sm:size-7 rounded-full border border-amber-400/80 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-transform group-hover:scale-125 group-hover:border-red-400">
                  <div className="size-2 rounded-full bg-red-600 group-hover:bg-red-400 animate-pulse shadow-[0_0_8px_#ef4444]" />
                </div>
              </div>

              {/* TOOLTIP LABEL ON HOVER */}
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 sm:w-56 bg-[#160e09]/95 border border-[#8c5e35] p-2 rounded shadow-2xl text-left pointer-events-none z-30 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    <Crosshair className="size-3" />
                    <span>Vật chứng phát hiện</span>
                  </div>
                  <div className="text-[11px] text-[#f5ebd7] font-semibold mt-0.5 line-clamp-2">
                    {spot.title}
                  </div>
                  <div className="text-[9px] text-[#a37e58] mt-1 font-mono">
                    [Nhấp để kiểm tra hiện vật]
                  </div>
                </div>
              )}
            </button>
          </div>
        )
      })}

      {/* TOP-LEFT MINIMAL FLOATING NEEDLE COMPASS */}
      <div
        className="absolute top-3 left-3 z-20 pointer-events-none size-10 sm:size-11 rounded-full bg-black/60 border border-[#8c5e35]/40 backdrop-blur-md shadow-lg flex items-center justify-center select-none"
        title={`Hướng la bàn: ${Math.round((heading % 360) + 360) % 360}°`}
      >
        <span className="absolute top-1 text-[8px] font-mono font-black text-red-500/90 leading-none">
          N
        </span>
        <div
          className="relative size-7 flex items-center justify-center transition-transform duration-75 ease-out"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          <div className="absolute -top-0.5 w-0 h-0 border-x-[3px] border-x-transparent border-b-[13px] border-b-[#ef4444] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="absolute -bottom-0.5 w-0 h-0 border-x-[3px] border-x-transparent border-t-[13px] border-t-[#cbd5e1] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="relative size-1.5 rounded-full bg-white border border-gray-900 shadow-sm" />
        </div>
      </div>

      {/* BOTTOM-RIGHT FLOATING CONTROLS */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/80 border border-[#593c26] p-1.5 rounded-xl backdrop-blur-sm shadow-xl">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleZoom(-10)
          }}
          className="p-1.5 text-[#d9a066] hover:text-white hover:bg-[#382314] rounded-lg transition-colors cursor-pointer"
          title="Phóng to góc nhìn"
        >
          <ZoomIn className="size-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleZoom(10)
          }}
          className="p-1.5 text-[#d9a066] hover:text-white hover:bg-[#382314] rounded-lg transition-colors cursor-pointer"
          title="Thu nhỏ góc nhìn"
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
          title="Đặt lại hướng nhìn ban đầu"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
    </div>
  )
}
