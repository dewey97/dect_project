'use client'

import React, { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Smartphone, Sparkles } from 'lucide-react'

// Dynamic import PhoneSimulator with ssr disabled for safe client rendering
const PhoneSimulator = dynamic(
  () => import('@/components/phone-engine').then((mod) => mod.PhoneSimulator),
  {
    ssr: false,
    loading: () => (
      <div className="w-[320px] sm:w-[380px] h-[640px] bg-zinc-950/90 rounded-[44px] border border-zinc-800 flex flex-col items-center justify-center text-muted-foreground font-mono text-xs gap-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="tracking-widest uppercase text-primary text-[0.7rem]">Đang nạp thiết bị...</span>
      </div>
    )
  }
)

export function LandingPhoneShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 6, rotateY: -8 })
  const [isHovered, setIsHovered] = useState(false)

  // Interactive 3D tilt tracking mouse movement over container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    // Subtle tilt range (-10 to 10 deg)
    const rotateY = (x / (rect.width / 2)) * 10
    const rotateX = -(y / (rect.height / 2)) * 10
    setTilt({ rotateX, rotateY })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    // Settle back to subtle default 3D pose
    setTilt({ rotateX: 5, rotateY: -6 })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <section
      id="dien-thoai-nan-nhan"
      className="relative w-full max-w-6xl px-4 sm:px-6 py-12 md:py-16 flex flex-col items-center justify-center select-none"
    >
      {/* Ambient backlight glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[450px] rounded-full bg-amber-500/[0.07] blur-[140px] pointer-events-none"
      />

      {/* Minimalist Forensic Title */}
      <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center gap-2 mb-8 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[0.68rem] font-bold tracking-widest uppercase">
          <Smartphone className="size-3.5 text-amber-400" />
          <span>Vật Chứng Kỹ Thuật Số</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-foreground tracking-tight font-sans">
          Điện Thoại Nạn Nhân // iPhone 6s Plus
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-sans">
          Chạm trực tiếp vào màn hình để mở khóa tin nhắn, danh bạ và nhật ký cuộc gọi
        </p>
      </div>

      {/* 3D Chassis Phone Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full flex items-center justify-center [perspective:1400px] py-4"
      >
        <div
          className="relative transition-transform duration-200 ease-out will-change-transform"
          style={{
            transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* 3D Phone Chassis Bezel */}
          <div
            className="relative p-2.5 sm:p-3 rounded-[54px] bg-gradient-to-b from-zinc-700 via-zinc-900 to-zinc-950 border border-zinc-600/50 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(245,158,11,0.06),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-shadow duration-300"
            style={{
              boxShadow: isHovered
                ? '0 35px 80px -15px rgba(0, 0, 0, 0.98), 0 0 60px rgba(245, 158, 11, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.4)'
                : undefined
            }}
          >
            {/* Top Speaker Ear-piece Notch / Mic Cutout on Chassis */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-1 bg-zinc-700/80 rounded-full z-30 pointer-events-none" />

            {/* Inner Phone Screen Content */}
            <div className="relative rounded-[46px] overflow-hidden bg-black z-20">
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
      </div>
    </section>
  )
}
