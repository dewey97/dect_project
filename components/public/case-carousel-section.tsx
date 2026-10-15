'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { POSTER_ITEMS } from '@/lib/data/landing-data'

interface CaseCarouselSectionProps {
  activePoster: number
  setActivePoster: (update: number | ((prev: number) => number)) => void
}

export function CaseCarouselSection({ activePoster, setActivePoster }: CaseCarouselSectionProps) {
  const router = useRouter()
  const total = POSTER_ITEMS.length
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const currentCase = POSTER_ITEMS[activePoster] || POSTER_ITEMS[0]

  return (
    <section id="vuan" className="w-full max-w-6xl px-6 py-6 z-10 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative w-full md:max-w-3xl max-w-xl flex items-center justify-center h-[240px] select-none">
        {/* Navigation Arrows */}
        <button
          onClick={() => setActivePoster((prev) => (prev === 0 ? total - 1 : prev - 1))}
          className="absolute left-2 md:left-6 z-40 p-2.5 rounded-full border border-border/60 bg-background/90 hover:bg-primary/20 hover:border-primary text-foreground transition-all cursor-pointer shadow-md"
          title="Vụ án trước"
        >
          <ChevronLeft className="size-4" />
        </button>

        <button
          onClick={() => setActivePoster((prev) => (prev === total - 1 ? 0 : prev + 1))}
          className="absolute right-2 md:right-6 z-40 p-2.5 rounded-full border border-border/60 bg-background/90 hover:bg-primary/20 hover:border-primary text-foreground transition-all cursor-pointer shadow-md"
          title="Vụ án kế tiếp"
        >
          <ChevronRight className="size-4" />
        </button>

        {/* 3D Perspective container */}
        <div className="relative w-full flex items-center justify-center h-[240px]" style={{ perspective: '900px' }}>
          {POSTER_ITEMS.map((poster, index) => {
            const isActive = activePoster === index
            const isLeft = (activePoster - 1 + total) % total === index
            const isRight = (activePoster + 1) % total === index
            const isFarLeft = (activePoster - 2 + total) % total === index
            const isFarRight = (activePoster + 2) % total === index

            const leftOffset = isMobile ? -120 : -170
            const rightOffset = isMobile ? 120 : 170
            const farLeftOffset = isMobile ? -200 : -320
            const farRightOffset = isMobile ? 200 : 320

            let transformStyle = 'scale(0) translate3d(0, 0, -200px)'
            let opacity = 0
            let zIndex = 5

            if (isActive) {
              transformStyle = 'translate3d(0, 0, 0) scale(1) rotateY(0deg)'
              opacity = 1
              zIndex = 30
            } else if (isLeft) {
              transformStyle = `translate3d(${leftOffset}px, 0, -80px) scale(0.8) rotateY(20deg)`
              opacity = 0.45
              zIndex = 20
            } else if (isRight) {
              transformStyle = `translate3d(${rightOffset}px, 0, -80px) scale(0.8) rotateY(-20deg)`
              opacity = 0.45
              zIndex = 20
            } else if (isFarLeft) {
              transformStyle = `translate3d(${farLeftOffset}px, 0, -140px) scale(0.65) rotateY(35deg)`
              opacity = 0.18
              zIndex = 10
            } else if (isFarRight) {
              transformStyle = `translate3d(${farRightOffset}px, 0, -140px) scale(0.65) rotateY(-35deg)`
              opacity = 0.18
              zIndex = 10
            }

            const isTrontim = index === 0

            return (
              <div
                key={poster.id}
                onClick={() => {
                  if (isActive && isTrontim) {
                    router.push('/evidence/boardgame')
                  } else {
                    setActivePoster(index)
                  }
                }}
                style={{
                  transform: transformStyle,
                  opacity: opacity,
                  zIndex: zIndex,
                  transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                  transformStyle: 'preserve-3d',
                }}
                title={isActive && isTrontim ? "Bấm để vào chơi vụ án Trốn Tìm" : undefined}
                className="absolute w-[150px] h-[212px] aspect-[1/1.414] rounded-md overflow-hidden cursor-pointer group bg-zinc-950 transition-all duration-300 border border-white/45 shadow-[0_0_14px_rgba(255,255,255,0.12),0_12px_28px_rgba(0,0,0,0.85)] hover:border-white/75 hover:shadow-[0_0_18px_rgba(255,255,255,0.2),0_14px_32px_rgba(0,0,0,0.9)]"
              >
                <img
                  src={poster.img}
                  alt={poster.title}
                  className="w-full h-full object-cover filter brightness-[0.9] contrast-105 group-hover:brightness-100 transition-all duration-300"
                />
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.08, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

                {isActive && isTrontim && (
                  <div className="absolute inset-x-0 bottom-0 py-1.5 bg-black/85 backdrop-blur-xs text-center text-[0.62rem] font-mono text-amber-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    VÀO CHƠI NGAY →
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Case Status Bar — Hiển thị thông số vụ án (Case mở và Case mật dấu hỏi) */}
      <div className="mt-3 min-h-[42px] flex flex-col items-center justify-center gap-1 font-mono text-center">
        <div className="flex items-center gap-2.5">
          <span
            className={
              activePoster === 0
                ? "text-[0.7rem] text-amber-400 font-bold tracking-widest uppercase"
                : "text-[0.7rem] text-zinc-500 font-bold tracking-widest uppercase"
            }
          >
            {currentCase.code}
          </span>
          <span className="text-zinc-600 text-xs">/</span>
          <span
            className={
              activePoster === 0
                ? "text-xs text-foreground font-black uppercase tracking-wider"
                : "text-xs text-zinc-400 font-black uppercase tracking-wider"
            }
          >
            {currentCase.title}
          </span>
        </div>
        <div className="grid grid-cols-[auto_auto] items-center gap-x-2.5 gap-y-1 text-[0.68rem] text-muted-foreground font-mono mt-1.5 mx-auto">
          <span className="text-right">Độ khó:</span>
          {activePoster === 0 ? (
            <span className="text-left text-amber-400 tracking-widest text-xs font-bold">
              ★★★☆☆
            </span>
          ) : (
            <span className="text-left text-zinc-500 tracking-widest text-xs font-bold">
              ?????
            </span>
          )}

          <span className="text-right">Độ kinh dị:</span>
          {activePoster === 0 ? (
            <span className="text-left text-red-500 tracking-widest text-xs font-bold">
              ★★☆☆☆
            </span>
          ) : (
            <span className="text-left text-zinc-500 tracking-widest text-xs font-bold">
              ?????
            </span>
          )}

          <span className="text-right">Thời gian:</span>
          {activePoster === 0 ? (
            <span className="text-left text-zinc-200 font-semibold">
              60 - 90 phút
            </span>
          ) : (
            <span className="text-left text-zinc-500 font-semibold tracking-wider">
              ???
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
