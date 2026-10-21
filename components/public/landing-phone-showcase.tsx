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
    // Subtle tilt range (-8 to 8 deg)
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
    <section
      id="dien-thoai-nan-nhan"
      className="relative w-full max-w-6xl px-6 sm:px-8 py-16 md:py-24 flex items-center justify-center select-none"
    >
      {/* Ambient backlight glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[450px] rounded-full bg-amber-500/[0.07] blur-[140px] pointer-events-none"
      />

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* Left Column: 3D Zip Bag Evidence Stage (Mobile: order-2, Desktop: order-1) */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative w-full flex items-center justify-center lg:justify-start [perspective:1200px] py-4 order-2 lg:order-1"
        >
          <div
            className="relative transition-transform duration-200 ease-out will-change-transform max-w-[270px] sm:max-w-[320px] md:max-w-[350px]"
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
        <div className="flex flex-col items-start text-left gap-4 max-w-lg z-10 order-1 lg:order-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-foreground tracking-tight font-sans text-balance leading-tight">
            Điện Thoại Của Nạn Nhân Chờ Bạn Khám Phá
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono leading-relaxed">
            Tang vật niêm phong nguyên bản thu giữ tại hiện trường vụ án. Chiếc điện thoại chứa những tin nhắn cuối cùng, các cuộc gọi đáng ngờ và bí mật chưa từng được công bố của nạn nhân.
          </p>
        </div>
      </div>
    </section>
  )
}
