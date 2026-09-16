'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { POSTER_ITEMS } from '@/lib/data/landing-data'

interface CaseCarouselSectionProps {
  activePoster: number
  setActivePoster: (update: number | ((prev: number) => number)) => void
}

export function CaseCarouselSection({ activePoster, setActivePoster }: CaseCarouselSectionProps) {
  const total = POSTER_ITEMS.length

  return (
    <section className="w-full max-w-6xl px-6 py-2 z-10 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative w-full md:max-w-3xl max-w-xl flex items-center justify-center h-[240px] select-none">
        {/* Navigation Arrows */}
        <button
          onClick={() => setActivePoster((prev) => (prev === 0 ? total - 1 : prev - 1))}
          className="absolute left-2 md:left-6 z-40 p-2 rounded-full border border-primary/20 bg-background/80 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-all cursor-pointer"
        >
          <ChevronLeft className="size-4" />
        </button>

        <button
          onClick={() => setActivePoster((prev) => (prev === total - 1 ? 0 : prev + 1))}
          className="absolute right-2 md:right-6 z-40 p-2 rounded-full border border-primary/20 bg-background/80 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-all cursor-pointer"
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

            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
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

            return (
              <div
                key={poster.id}
                onClick={() => setActivePoster(index)}
                style={{
                  transform: transformStyle,
                  opacity: opacity,
                  zIndex: zIndex,
                  transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                  transformStyle: 'preserve-3d',
                }}
                className="absolute w-[150px] h-[212px] aspect-[1/1.414] shadow-[0_12px_30px_rgba(0,0,0,0.85)] border border-border/30 rounded-md overflow-hidden cursor-pointer group"
              >
                <img
                  src={poster.img}
                  alt={poster.title}
                  className="w-full h-full object-cover filter brightness-[0.85] contrast-105 group-hover:brightness-100 transition-all duration-300"
                />
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.08, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
