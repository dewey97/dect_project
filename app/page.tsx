"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { LandingHero } from "@/components/public/landing-hero";
import { CaseCarouselSection } from "@/components/public/case-carousel-section";
import { LandingPhoneShowcase } from "@/components/public/landing-phone-showcase";
import { LandingScene360Showcase } from "@/components/public/landing-scene-360-showcase";
import { WorldArchiveSection } from "@/components/public/world-archive-section";
import { LandingFeaturesSection } from "@/components/public/landing-features-section";
import { ReviewsAndFaqSection } from "@/components/public/reviews-and-faq-section";
import { CaseDispatchSection } from "@/components/public/case-dispatch-section";
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

      {/* Hero & Navigation */}
      <LandingHero />

      {/* World Archive & Lore */}
      <WorldArchiveSection />

      {/* 3D Poster Carousel */}
      <CaseCarouselSection
        activePoster={activePoster}
        setActivePoster={setActivePoster}
      />

      {/* Box Contents, Features & Community ("Tại sao nên chọn XPLORE") */}
      <LandingFeaturesSection />

      {/* Forensic Digital Evidence Phone (Túi zip tang vật điện thoại) */}
      <LandingPhoneShowcase />

      {/* 360 Crime Scene Reinvestigation (Ổ khóa hiện trường 360°) */}
      <LandingScene360Showcase />

      {/* Reviews & FAQ */}
      <ReviewsAndFaqSection />

      {/* Case Dispatch & Waitlist */}
      <CaseDispatchSection />

      {/* Footer */}
      <LandingFooter />
    </main>
  );
}
