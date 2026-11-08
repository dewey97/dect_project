"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LandingHeroBackdrop } from "@/components/public/landing-hero-backdrop";
import { HeroCaseCarousel } from "@/components/public/hero-case-carousel";
import { LandingNavbar } from "@/components/public/landing-navbar";
import { cn } from "@/lib/utils";

const DETECTIVE_QUOTES = [
  {
    quote: "Khi bạn đã loại bỏ tất cả những điều không thể, thì điều còn lại, dù vô lý đến đâu, cũng chính là sự thật.",
    author: "Sherlock Holmes",
  },
  {
    quote: "Mọi tiếp xúc đều để lại dấu vết. Kẻ thủ ác không thể rời hiện trường mà không mang theo hoặc bỏ lại điều gì.",
    author: "Edmond Locard",
  },
  {
    quote: "Những tế bào xám nhỏ bé không bao giờ nói dối. Sự thật luôn ẩn mình sau những chi tiết vụn vặt nhất.",
    author: "Hercule Poirot",
  },
  {
    quote: "Thế giới này chứa đầy những điều hiển nhiên mà chẳng mấy ai chịu để mắt quan sát.",
    author: "Arthur Conan Doyle",
  },
  {
    quote: "Kẻ quan sát sắc bén không chỉ nhìn vào những gì phơi bày trước mắt, mà nhìn thấu những gì bị che giấu.",
    author: "C. Auguste Dupin",
  },
];

interface LandingHeroProps {
  activePoster?: number;
  setActivePoster?: (update: number | ((prev: number) => number)) => void;
}

export function LandingHero({
  activePoster: externalActive,
  setActivePoster: externalSetActive,
}: LandingHeroProps = {}) {
  const [internalActive, setInternalActive] = useState(0);
  const activePoster = externalActive !== undefined ? externalActive : internalActive;
  const setActivePoster = externalSetActive || setInternalActive;

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % DETECTIVE_QUOTES.length);
        setIsFading(false);
      }, 400); // 400ms fade-out, sau đó đổi quote và fade-in
    }, 6000); // Đổi câu trích dẫn mỗi 6 giây

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* SYNCHRONIZED TOP HEADER NAV (Includes Dynamic Banner & UserNav) */}
      <LandingNavbar active="home" />

      {/* HERO SECTION — DESKTOP 50/50 SPLIT, MOBILE CENTER STACK */}
      <section
        id="vuan"
        className="relative w-full min-h-[calc(100svh-3.5rem)] lg:h-[90vh] flex items-center justify-center overflow-hidden py-8 sm:py-10 lg:py-0"
      >
        {/* Background static image + flashlight */}
        <div className="absolute inset-0 w-full h-full z-0">
          <LandingHeroBackdrop
            desktopImage="/images/hero/hero_wall_desktop.webp"
            mobileImage="/images/hero/hero_wall_mobile.webp"
          />
        </div>

        {/* Foreground Content overlay: Desktop 50/50, Mobile Stack */}
        <div className="relative z-10 w-full max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-6 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-10 pointer-events-none">
          {/* CỘT TRÁI (Desktop) / PHẦN TRÊN (Mobile): Title, Quote */}
          <div className="w-full max-w-md lg:max-w-[460px] xl:max-w-[500px] flex flex-col items-center lg:items-start text-center lg:text-left gap-4 sm:gap-5 pointer-events-auto">
            {/* TIÊU ĐỀ CHÍNH H1 */}
            <h1 className="text-balance text-xl sm:text-2xl lg:text-3xl xl:text-[2.05rem] font-black leading-[1.25] tracking-tight uppercase font-sans">
              Nền Tảng Phá Án Đa Hình Thức:{" "}
              <span className="block mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                Trực Tuyến Online × Boardgame Hồ Sơ Vật Lý
              </span>
            </h1>

            {/* Animated Rotating Detective Quote */}
            <div className="w-full min-h-[48px] sm:min-h-[52px] flex items-center justify-center lg:justify-start">
              <p
                className={cn(
                  "text-pretty text-xs lg:text-sm leading-relaxed text-muted-foreground font-mono italic transition-all duration-400 ease-in-out",
                  isFading ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
                )}
              >
                "{DETECTIVE_QUOTES[quoteIndex].quote}"
                <span className="block mt-1 not-italic text-primary/75 font-sans font-semibold text-[0.75rem] tracking-wider uppercase">
                  — {DETECTIVE_QUOTES[quoteIndex].author}
                </span>
              </p>
            </div>
          </div>

          {/* CỘT PHẢI (Desktop) / PHẦN DƯỚI (Mobile): HeroCaseCarousel */}
          <div className="w-full max-w-lg lg:max-w-[560px] xl:max-w-[620px] flex flex-col items-center justify-center pointer-events-auto">
            <HeroCaseCarousel
              activePoster={activePoster}
              setActivePoster={setActivePoster}
            />
          </div>
        </div>
      </section>
    </>
  );
}
