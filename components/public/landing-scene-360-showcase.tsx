'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Eye } from 'lucide-react'

// Dynamic import Scene360Viewer with ssr disabled for safe client rendering
const Scene360Viewer = dynamic(
  () => import('@/components/investigation/scene-360-viewer').then((mod) => mod.Scene360Viewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-muted-foreground font-mono text-xs gap-3">
        <div className="size-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        <span className="tracking-widest uppercase text-red-400 text-[0.7rem]">Đang mở không gian 360°...</span>
      </div>
    )
  }
)

export function LandingScene360Showcase() {
  return (
    <section
      id="hien-truong-360"
      className="relative w-full max-w-6xl px-4 sm:px-6 py-12 md:py-16 flex flex-col items-center justify-center select-none"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[450px] rounded-full bg-red-500/[0.05] blur-[140px] pointer-events-none"
      />

      {/* Header */}
      <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center gap-2 mb-8 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-[0.68rem] font-bold tracking-widest uppercase">
          <Eye className="size-3.5 text-red-400" />
          <span>Khám Nghiệm Hiện Trường</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-foreground tracking-tight font-sans">
          Hiện Trường Án Mạng 360° Toàn Cảnh
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-sans">
          Di chuyển chuột để tự do quan sát quanh phòng làm việc của nạn nhân
        </p>
      </div>

      {/* 360 Panoramic Viewport */}
      <div className="w-full max-w-5xl h-[480px] sm:h-[560px] md:h-[620px] rounded-2xl border border-zinc-800 overflow-hidden relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] bg-zinc-950 z-10">
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
    </section>
  )
}
