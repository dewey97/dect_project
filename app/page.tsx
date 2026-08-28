'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { LandingHero } from '@/components/public/landing-hero'
import { CaseCarouselSection } from '@/components/public/case-carousel-section'
import { WorldArchiveSection } from '@/components/public/world-archive-section'
import { GameRulesShowcase } from '@/components/public/game-rules-showcase'
import { LandingFeaturesSection } from '@/components/public/landing-features-section'
import { ReviewsAndFaqSection } from '@/components/public/reviews-and-faq-section'
import { LandingFooter } from '@/components/public/landing-footer'

export default function MarketingLandingPage() {
  const [activePoster, setActivePoster] = useState<number>(0)

  return (
    <main className="noir-spotlight relative flex flex-col min-h-dvh w-full items-center overflow-x-clip bg-background text-foreground font-sans">
      {/* CRT scanlines overlay */}
      <div
        aria-hidden="true"
        className="noir-scanlines pointer-events-none absolute inset-0 opacity-15 z-20"
      />

      {/* Hero & Navigation */}
      <LandingHero activePoster={activePoster} />

      {/* 3D Poster Carousel */}
      <CaseCarouselSection activePoster={activePoster} setActivePoster={setActivePoster} />

      {/* World Archive & Lore */}
      <WorldArchiveSection />

      {/* Game Rules (Means / Motive / Opportunity) */}
      <GameRulesShowcase />

      {/* Box Contents, Features, Community & Hints */}
      <LandingFeaturesSection />

      {/* Reviews & FAQ */}
      <ReviewsAndFaqSection />

      {/* Footer */}
      <LandingFooter />
    </main>
  )
}
