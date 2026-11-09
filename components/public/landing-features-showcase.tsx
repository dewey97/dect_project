"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LandingPhoneShowcase } from "./landing-phone-showcase";
import { LandingScene360Showcase } from "./landing-scene-360-showcase";
import { LandingLogoMotion } from "./landing-logo-motion";
import { LandingGroupSyncShowcase } from "./landing-group-sync-showcase";

export function LandingFeaturesShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  // Sentinel sits where the logo naturally starts; it hits viewport centre exactly when
  // the (lg-sticky) logo pins to the middle of the screen. Motion only starts from there.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [centerOffset, setCenterOffset] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  // Logo scale while centred (big) and once pinned in the left column (moderate).
  const [scaleRange, setScaleRange] = useState({ big: 1.25, pinned: 1.0 });

  // Measure container and title widths to calculate exact horizontal center offset on desktop
  useEffect(() => {
    const updateOffset = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 1024) {
        setIsDesktop(false);
        setCenterOffset(0);
        setScaleRange({ big: 1.25, pinned: 1.0 });
        return;
      }
      const big = 1.8;
      const pinned = window.innerWidth >= 1280 ? 0.92 : 0.85;
      setIsDesktop(true);
      setScaleRange({ big, pinned });
      if (containerRef.current && titleRef.current) {
        const containerW = containerRef.current.clientWidth - 48; // accounting for px-5 / px-6 padding
        const titleW = titleRef.current.offsetWidth;
        // Center offset accounting for enlargement when centered
        const offset = Math.max(0, (containerW - titleW * big) / 2);
        setCenterOffset(offset);
      }
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  // 0 = logo reaches viewport centre; 1 = 0.9 viewport heights later.
  const { scrollYProgress } = useScroll({
    target: sentinelRef,
    offset: ["start center", "start -40%"],
  });

  // Phase boundaries. Desktop has a 90vh spacer before the right column so the pinned
  // logo can play fully; mobile scrolls naturally, so phases are compressed.
  const phase = isDesktop
    ? { logoEnd: 0.5, pullEnd: 0.78, contentStart: 0.67, contentEnd: 0.94 }
    : { logoEnd: 0.3, pullEnd: 0.4, contentStart: 0.2, contentEnd: 0.4 };

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const pullFactor = (v: number) =>
    clamp01((v - phase.logoEnd) / (phase.pullEnd - phase.logoEnd));

  // 1. Logo internal motion (emblem -> glass travels to O -> letters pulled out)
  const logoProgress = useTransform(scrollYProgress, (v) =>
    clamp01(v / phase.logoEnd),
  );

  // 2. Title scale: starts BIG when centred, then shrinks moderately as it pulls to left
  const titleScale = useTransform(scrollYProgress, (v) => {
    const { big, pinned } = scaleRange;
    return big - pullFactor(v) * (big - pinned);
  });

  // 3. Title slides from horizontal center to left column
  const titleX = useTransform(
    scrollYProgress,
    (v) => (1 - pullFactor(v)) * centerOffset,
  );

  // Desk lamp: fades on as the user scrolls in (first 30% of the logo phase),
  // stays lit while the logo is centred, then fades off as the logo pulls left.
  const lampOn = (v: number) => clamp01(v / (phase.logoEnd * 0.3));
  const lampOpacity = useTransform(scrollYProgress, (v) =>
    Math.min(lampOn(v), 1 - pullFactor(v)),
  );
  // Nón sáng: đỉnh hẹp cố định, đáy loe; khi logo kéo sang trái, đáy khép dần về một điểm.
  const beamClip = useTransform(scrollYProgress, (v) => {
    const open = 1 - pullFactor(v);
    const top = 4 * open;
    const bottom = 50 * open;
    return `polygon(${50 - top}% 0%, ${50 + top}% 0%, ${50 + bottom}% 100%, ${50 - bottom}% 100%)`;
  });
  const poolScale = useTransform(
    scrollYProgress,
    (v) => 1 - 0.7 * pullFactor(v),
  );

  // 4. Sub-sections on the right fade & slide up into view
  const contentFactor = (v: number) =>
    clamp01((v - phase.contentStart) / (phase.contentEnd - phase.contentStart));
  const contentOpacity = useTransform(scrollYProgress, contentFactor);
  const contentY = useTransform(
    scrollYProgress,
    (v) => 40 * (1 - contentFactor(v)),
  );
  const contentPointerEvents = useTransform(scrollYProgress, (v) =>
    v > phase.contentStart ? "auto" : "none",
  );

  return (
    <section
      ref={containerRef}
      id="tinh-nang"
      className="relative w-full max-w-6xl px-5 sm:px-6 mt-12 sm:mt-20 lg:mt-28 pt-16 sm:pt-24 lg:pt-32 pb-16 lg:pb-24 z-10 select-none scroll-mt-24"
    >
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="absolute left-0 top-16 sm:top-24 lg:top-32 h-0 w-0 pointer-events-none"
      />
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
            className="relative w-full flex flex-col items-start text-left will-change-transform"
          >
            {/* Đèn dọi: chùm sáng hình nón rọi từ trên xuống logo, khép lại khi logo trượt sang trái */}
            {/* Blur sits on the wrapper: on the same element, clip-path would cut the blur and leave hard edges */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -z-10 left-1/2 -translate-x-1/2 bottom-[25%] w-[150%] h-[50vh] lg:h-[38vh]"
              style={{ opacity: lampOpacity, filter: "blur(22px)" }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  clipPath: beamClip,
                  background:
                    "linear-gradient(to bottom, rgba(255,228,165,0.3), rgba(255,205,120,0.14) 55%, rgba(255,190,90,0.04))",
                  maskImage:
                    "linear-gradient(to bottom, #000 55%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, #000 55%, transparent)",
                }}
              />
            </motion.div>
            {/* Vũng sáng dưới logo */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -z-10 left-1/2 -translate-x-1/2 top-[5%] w-[170%] h-[160%]"
              style={{
                opacity: lampOpacity,
                scaleX: poolScale,
                background:
                  "radial-gradient(ellipse 50% 45% at 50% 40%, rgba(245,183,10,0.14), rgba(200,120,30,0.06) 50%, transparent 75%)",
                maskImage:
                  "radial-gradient(ellipse 50% 45% at 50% 40%, #000 30%, transparent 72%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 50% 45% at 50% 40%, #000 30%, transparent 72%)",
              }}
            />
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
          className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 sm:gap-y-14 min-w-0 lg:pt-[90vh] will-change-transform"
        >
          {/* SECTION CON 01: ĐIỆN THOẠI TANG VẬT */}
          <div className="w-full">
            <LandingPhoneShowcase />
          </div>

          {/* SECTION CON 02: HIỆN TRƯỜNG 360° */}
          <div className="w-full">
            <LandingScene360Showcase />
          </div>

          {/* SECTION CON 03: CHƠI NHÓM, ĐỒNG BỘ TIẾN TRÌNH (full width row) */}
          <div className="w-full md:col-span-2">
            <LandingGroupSyncShowcase />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
