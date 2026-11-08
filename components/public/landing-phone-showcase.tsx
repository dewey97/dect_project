'use client'

import React, { useState, useRef } from 'react'

export function LandingPhoneShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 4, rotateY: -6 })
  const [isHovered, setIsHovered] = useState(false)

  // Interactive 3D tilt tracking mouse movement over container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateY = (x / (rect.width / 2)) * 8
    const rotateX = -(y / (rect.height / 2)) * 8
    setTilt({ rotateX, rotateY })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTilt({ rotateX: 4, rotateY: -6 })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <div
      id="dien-thoai-nan-nhan"
      className="relative w-full rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/20 via-zinc-900/60 to-zinc-950/80 p-5 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 hover:border-amber-500/40 select-none"
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Column: 3D Zip Bag Evidence Stage (Mobile: order-2, Desktop: order-1) */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative w-full flex items-center justify-center md:justify-start [perspective:1200px] py-2 order-2 md:order-1"
        >
          <div
            className="relative transition-transform duration-200 ease-out will-change-transform max-w-[210px] sm:max-w-[240px] md:max-w-[260px]"
            style={{
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            <div
              className="relative filter transition-all duration-300"
              style={{
                filter: isHovered
                  ? 'drop-shadow(0 25px 50px rgba(0,0,0,0.95)) drop-shadow(0 0 35px rgba(245,158,11,0.22))'
                  : 'drop-shadow(0 20px 40px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(245,158,11,0.1))'
              }}
            >
              <img
                src="/phone.png"
                alt="Điện thoại của nạn nhân trong túi zip tang vật"
                className="w-full h-auto object-contain select-none pointer-events-none transition-transform duration-300 hover:scale-[1.01]"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Forensic Text / Hook (Mobile: order-1, Desktop: order-2) */}
        <div className="flex flex-col items-start text-left gap-3 max-w-lg z-10 order-1 md:order-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-amber-200 font-sans">
              Điện Thoại Tang Vật
            </h3>
            <span className="text-[0.68rem] font-mono text-amber-400/70 uppercase tracking-wider">
              Khôi phục dữ liệu nguyên bản từ hiện trường
            </span>
          </div>

          <p className="text-xs sm:text-[0.84rem] text-muted-foreground font-sans leading-relaxed">
            Chiếc điện thoại thu giữ tại hiện trường được giả lập hoàn chỉnh. Bạn tự tay dò tìm mã PIN bẻ khóa máy, lội ngược dòng tin nhắn bí mật, khôi phục ảnh chụp đã xóa và nghe lại những cuộc gọi mờ ám cuối cùng trước khi án mạng xảy ra.
          </p>
        </div>
      </div>
    </div>
  )
}
