'use client'

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Sparkles, Smartphone, Compass, Lock, Unlock, Radio, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

// Dynamic imports with SSR disabled for safe client rendering
const PhoneSimulator = dynamic(
  () => import('@/components/phone-engine').then((mod) => mod.PhoneSimulator),
  {
    ssr: false,
    loading: () => (
      <div className="w-[320px] sm:w-[380px] h-[640px] bg-zinc-950/80 rounded-[44px] border border-zinc-800 flex flex-col items-center justify-center text-muted-foreground font-mono text-xs gap-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="tracking-widest uppercase text-primary text-[0.7rem]">Đang nạp thiết bị...</span>
      </div>
    )
  }
)

const Scene360Viewer = dynamic(
  () => import('@/components/investigation/scene-360-viewer').then((mod) => mod.Scene360Viewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-muted-foreground font-mono text-xs gap-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="tracking-widest uppercase text-primary text-[0.7rem]">Đang mở không gian 360°...</span>
      </div>
    )
  }
)

export function CinematicInvestigationScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0) // 0.0 to 1.0

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const totalScrollable = container.clientHeight - window.innerHeight
      if (totalScrollable <= 0) return

      // Progress is how much of the container has scrolled past the top
      const currentScroll = -rect.top
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalScrollable))

      setScrollProgress(rawProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // STAGE CALCULATION:
  // scrollProgress ranges from 0.0 to 1.0 as the user scrolls through the 400vh section.
  // We want:
  // - 0.00 -> 0.15: Phone tilts up in 3D & laser scan line sweeps (Stage 1)
  // - 0.15 -> 0.50: Phone reaches 100% full frontal view, perfectly centered & playable (Stage 2)
  // - 0.50 -> 0.65: Phone transitions/fades out as 360 scene opens up
  // - 0.65 -> 1.00: 360 Crime Scene is 100% fully visible, steady and interactive (Stage 3)
  const isStage1 = scrollProgress < 0.20
  const isStage2 = scrollProgress >= 0.20 && scrollProgress < 0.55
  const isStage3 = scrollProgress >= 0.55

  // Interpolations for Phone 3D transform
  let phoneOpacity = 1
  let phoneScale = 1.0
  let phoneRotateX = 0
  let phoneRotateY = 0
  let phoneTranslateY = 0

  if (scrollProgress < 0.20) {
    // Stage 1: Tilting up from slight depth
    const p1 = Math.max(0, Math.min(1, scrollProgress / 0.20))
    phoneOpacity = Math.min(1, 0.4 + p1 * 0.6)
    phoneScale = 0.90 + p1 * 0.10
    phoneRotateX = 14 - p1 * 14
    phoneRotateY = -18 + p1 * 18
    phoneTranslateY = (1 - p1) * 40
  } else if (scrollProgress < 0.50) {
    // Stage 2: Front-facing, rock steady
    phoneOpacity = 1
    phoneScale = 1.0
    phoneRotateX = 0
    phoneRotateY = 0
    phoneTranslateY = 0
  } else if (scrollProgress < 0.65) {
    // Transition to 360: Phone smoothly scales down and dissolves
    const pOut = (scrollProgress - 0.50) / 0.15
    phoneOpacity = Math.max(0, 1 - pOut * 1.4)
    phoneScale = 1.0 - pOut * 0.15
    phoneTranslateY = -pOut * 60
    phoneRotateX = -pOut * 10
  } else {
    // Past 0.65: Phone is completely gone
    phoneOpacity = 0
  }

  // Interpolations for 360 Viewport
  let scene360Opacity = 0
  let scene360Scale = 0.95
  if (scrollProgress >= 0.48) {
    const pScene = Math.min(1, (scrollProgress - 0.48) / 0.16) // Reaches 1.0 by ~0.64
    scene360Opacity = Math.min(1, Math.max(0, pScene))
    scene360Scale = 0.95 + pScene * 0.05
  }

  return (
    <section
      id="trai-nghiem-dieu-tra"
      ref={containerRef}
      className="relative w-full h-[400vh] bg-background border-t border-border/20"
    >
      {/* STICKY VIEWPORT STAGE: Pins to center of screen while scrolling */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-between overflow-hidden select-none px-4 sm:px-6 py-6 z-10">
        {/* Ambient background illumination */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[160px] pointer-events-none transition-colors duration-700"
          style={{
            backgroundColor: isStage3 ? 'rgba(239, 68, 68, 0.06)' : 'rgba(245, 158, 11, 0.06)'
          }}
        />

        {/* 1. TOP PROGRESS STEPPER & DYNAMIC HEADLINE */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center gap-2 pt-2 sm:pt-4 z-30 shrink-0">
          {/* Milestone step indicators */}
          <div className="flex items-center gap-2 font-mono text-[0.62rem] text-muted-foreground uppercase tracking-widest">
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full border transition-all duration-300',
                isStage1
                  ? 'border-amber-400/80 bg-amber-400/10 text-amber-300 font-bold'
                  : 'border-zinc-800 text-zinc-500'
              )}
            >
              01. Thu Giữ Tang Vật
            </span>
            <span className="text-zinc-600">→</span>
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full border transition-all duration-300',
                isStage2
                  ? 'border-amber-400/80 bg-amber-400/10 text-amber-300 font-bold'
                  : 'border-zinc-800 text-zinc-500'
              )}
            >
              02. Giải Mã Dữ Liệu
            </span>
            <span className="text-zinc-600">→</span>
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full border transition-all duration-300',
                isStage3
                  ? 'border-red-500/80 bg-red-500/10 text-red-400 font-bold'
                  : 'border-zinc-800 text-zinc-500'
              )}
            >
              03. Hiện Trường 360°
            </span>
          </div>

          {/* Morphing headline based on stage */}
          <div className="min-h-[64px] flex flex-col items-center justify-center">
            {isStage1 && (
              <div className="animate-in fade-in duration-300 flex flex-col items-center gap-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-foreground tracking-tight font-sans">
                  Thu Giữ & Quét Pháp Y Điện Thoại Nạn Nhân
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Cuộn xuống để bắt đầu giải mã bộ nhớ thiết bị thu được tại hiện trường
                </p>
              </div>
            )}

            {isStage2 && (
              <div className="animate-in fade-in duration-300 flex flex-col items-center gap-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-amber-400 tracking-tight font-sans">
                  Thiết Bị Đã Mở Khóa: Tự Do Bóc Tách Tin Nhắn & Ảnh
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Chạm trực tiếp vào màn hình để lướt tin nhắn, danh bạ và nhật ký cuộc gọi
                </p>
              </div>
            )}

            {isStage3 && (
              <div className="animate-in fade-in duration-300 flex flex-col items-center gap-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-red-400 tracking-tight font-sans">
                  Khám Xét Hiện Trường Án Mạng 360° Toàn Cảnh
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  Di chuột qua khung nhìn để tự do xoay quanh phòng làm việc của nạn nhân
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. MAIN CENTER STAGE (PHONE SIMULATOR OR 360 SCENE VIEWPORT) */}
        <div className="relative w-full flex-1 min-h-0 flex items-center justify-center max-w-5xl my-2">
          {/* A. 3D PHONE SIMULATOR CONTAINER */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center pointer-events-auto [perspective:1400px]',
              phoneOpacity <= 0.05 && 'pointer-events-none'
            )}
            style={{
              opacity: phoneOpacity,
              transform: `translateY(${phoneTranslateY}px)`,
              display: phoneOpacity <= 0.01 ? 'none' : 'flex'
            }}
          >
            <div
              className="relative w-full max-w-[420px] h-[580px] sm:h-[660px] flex items-center justify-center transition-all duration-100 ease-out will-change-transform select-none"
              style={{
                transform: `rotateX(${phoneRotateX}deg) rotateY(${phoneRotateY}deg) scale3d(${phoneScale}, ${phoneScale}, 1)`,
                boxShadow: `0 25px 65px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12)`,
                borderRadius: '52px'
              }}
            >
              {/* Cyan laser scanning effect during Stage 1 */}
              {isStage1 && (
                <div
                  aria-hidden="true"
                  className="absolute inset-x-2 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] rounded-full z-40 animate-pulse pointer-events-none"
                  style={{
                    top: `${Math.round((scrollProgress / 0.20) * 85 + 5)}%`,
                    transition: 'top 0.1s linear'
                  }}
                />
              )}

              {/* The Actual In-Game Phone Simulator */}
              <div className="w-full h-full relative z-20 flex items-center justify-center">
                <PhoneSimulator
                  device={{
                    id: 'dev-000-1',
                    caseId: 'case_000',
                    evidenceId: 'DEV-000-1',
                    label: 'iPhone 6s Plus (Tang vật #01)',
                    owner: 'Nguyễn Văn Khang (Nạn nhân)',
                    status: 'unlocked',
                    locked: false
                  }}
                />
              </div>
            </div>
          </div>

          {/* B. 360 CRIME SCENE PANORAMA CONTAINER */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center pointer-events-auto transition-opacity duration-300',
              scene360Opacity <= 0.05 && 'pointer-events-none'
            )}
            style={{
              opacity: scene360Opacity,
              transform: `scale(${scene360Scale})`,
              display: scene360Opacity <= 0.01 ? 'none' : 'flex'
            }}
          >
            <div className="w-full max-w-4xl h-[480px] sm:h-[560px] rounded-xl border border-zinc-800 overflow-hidden relative shadow-2xl bg-zinc-950">
              <Scene360Viewer
                imageUrl="/images/cases/case_000/PANORAMA.png"
                fallbackImageUrl="/images/cases/case_000/PANORAMA.png"
                hotspots={[]}
                hideControls={true}
                hideCompass={true}
                disableZoom={true}
                rotateOnHover={true}
              />
            </div>
          </div>
        </div>

        {/* 3. BOTTOM SCROLL TRACKER BAR */}
        <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-1.5 pb-2 z-30 shrink-0">
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-75',
                isStage3 ? 'bg-red-500' : 'bg-primary'
              )}
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[0.6rem] text-zinc-500 uppercase tracking-widest">
            {scrollProgress < 0.98 ? 'Cuộn tiếp để theo dõi hành trình phá án ↓' : 'Đã bước vào hiện trường 360°'}
          </span>
        </div>
      </div>
    </section>
  )
}
