"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LandingPhoneShowcase } from "./landing-phone-showcase";
import { LandingScene360Showcase } from "./landing-scene-360-showcase";
import { LandingLogoMotion } from "./landing-logo-motion";

export function LandingFeaturesShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [centerOffset, setCenterOffset] = useState(0);

  // Measure container and title widths to calculate exact horizontal center offset on desktop
  useEffect(() => {
    const updateOffset = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 1024) {
        setCenterOffset(0);
        return;
      }
      if (containerRef.current && titleRef.current) {
        const containerW = containerRef.current.clientWidth - 48; // accounting for px-5 / px-6 padding
        const titleW = titleRef.current.offsetWidth;
        // Center offset accounting for 1.4x enlargement when centered
        const offset = Math.max(0, (containerW - titleW * 1.4) / 2);
        setCenterOffset(offset);
      }
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  // Track scroll progress through the entry and showcase sequence
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "start 0%"],
  });

  // 1. Logo internal motion (Glass zooms from X -> sweeps right -> reveals letters): 0.0 -> 0.48
  const logoProgress = useTransform(scrollYProgress, [0.0, 0.48], [0, 1]);

  // 2. Title scale: starts BIG (1.4x) when in center, then shrinks to 1.0x as it pulls to left
  const titleScale = useTransform(scrollYProgress, (v) => {
    if (v >= 0.72) return 1.0;
    if (v <= 0.48) return 1.4;
    const factor = (v - 0.48) / (0.72 - 0.48);
    return 1.4 - factor * 0.4;
  });

  // 3. Title slides from horizontal center to left column: 0.48 -> 0.72
  const titleX = useTransform(scrollYProgress, (v) => {
    if (v >= 0.72 || centerOffset === 0) return 0;
    if (v <= 0.48) return centerOffset;
    const factor = 1 - (v - 0.48) / (0.72 - 0.48);
    return factor * centerOffset;
  });

  // 4. Sub-sections on the right fade & slide up into view: 0.65 -> 0.88
  const contentOpacity = useTransform(scrollYProgress, [0.65, 0.88], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.65, 0.88], [40, 0]);
  const contentPointerEvents = useTransform(scrollYProgress, (v) =>
    v > 0.65 ? "auto" : "none"
  );

  return (
    <section
      ref={containerRef}
      id="trai-nghiem"
      className="relative w-full max-w-6xl px-5 sm:px-6 mt-12 sm:mt-20 lg:mt-28 pt-16 sm:pt-24 lg:pt-32 pb-16 lg:pb-24 z-10 select-none scroll-mt-24"
    >
      <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-14 relative">
        {/* ========================================================================= */}
        {/* CỘT TRÁI: LOGO MOTION TỪ GIỮA TRƯỢT SANG TRÁI KHI CUỘN, SAU ĐÓ GHIM CỐ ĐỊNH */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-1/2 lg:-translate-y-1/2 z-20 self-start">
          <motion.div
            ref={titleRef}
            style={{
              x: titleX,
              scale: titleScale,
              transformOrigin: "top left",
            }}
            className="w-full flex flex-col items-start text-left will-change-transform"
          >
            <LandingLogoMotion progress={logoProgress} />
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* CỘT PHẢI: 2 SECTION CON HIỆN RA SAU KHI LOGO ĐÃ MỞ RỘNG VÀ KÉO SANG TRÁI   */}
        {/* ========================================================================= */}
        <motion.div
          style={{
            opacity: contentOpacity,
            y: contentY,
            pointerEvents: contentPointerEvents,
          }}
          className="flex-1 w-full flex flex-col gap-8 sm:gap-12 min-w-0 will-change-transform"
        >
          {/* SECTION CON 01: ĐIỆN THOẠI TANG VẬT */}
          <div className="w-full">
            <LandingPhoneShowcase />
          </div>

          {/* SECTION CON 02: HIỆN TRƯỜNG 360° */}
          <div className="w-full">
            <LandingScene360Showcase />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
