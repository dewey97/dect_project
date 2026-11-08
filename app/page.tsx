"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics/analytics";
import { LandingHero } from "@/components/public/landing-hero";
import { LandingDualPlaySection } from "@/components/public/landing-dual-play-section";
import { LandingFeaturesShowcase } from "@/components/public/landing-features-showcase";
import { CaseDispatchSection } from "@/components/public/case-dispatch-section";
import { WorldArchiveSection } from "@/components/public/world-archive-section";
import { ReviewsAndFaqSection } from "@/components/public/reviews-and-faq-section";
import { LandingFooter } from "@/components/public/landing-footer";

export default function MarketingLandingPage() {
  const [activePoster, setActivePoster] = useState<number>(0);

  useEffect(() => {
    trackEvent("landing_page_view", {
      source: "web_client",
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <main
      suppressHydrationWarning
      className="noir-spotlight relative flex flex-col min-h-dvh w-full items-center overflow-x-clip bg-background text-foreground font-sans"
    >
      {/* CRT scanlines overlay */}
      <div
        aria-hidden="true"
        className="noir-scanlines pointer-events-none absolute inset-0 opacity-15 z-20"
      />

      {/* Hero & Navigation with Integrated Case Carousel */}
      <LandingHero
        activePoster={activePoster}
        setActivePoster={setActivePoster}
      />

      {/* World Archive & Lore */}
      <WorldArchiveSection />

      {/* Dual Play / Hybrid Model Section (Nhấn mạnh kết hợp tài liệu online và boardgame vật lý) */}
      <LandingDualPlaySection />

      {/* Case Dispatch: Chuyên Án Tiếp Theo & Bản In Giới Hạn */}
      <CaseDispatchSection />

      {/* Unified Features Showcase: Sticky Sidebar "XPLORE Có Gì Đặc Biệt?" & 2 Sub-sections */}
      <LandingFeaturesShowcase />

      {/* Reviews & FAQ */}
      <ReviewsAndFaqSection />

      {/* Footer */}
      <LandingFooter />
    </main>
  );
}
