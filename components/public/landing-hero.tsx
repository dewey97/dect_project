"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BrandMark } from "@/components/investigation/brand-mark";
import { LandingHeroBackdrop } from "@/components/public/landing-hero-backdrop";
import { UserNav } from "@/components/auth/user-nav";
import { LandingBanner } from "@/components/public/landing-banner";
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

export function LandingHero() {
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
      {/* TOP ANNOUNCEMENT TAPE BANNER (DYNAMIC FROM DB) */}
      <LandingBanner />

      {/* STICKY HEADER NAV */}
      <header className="sticky top-0 w-full z-50 border-b border-border/10 bg-card/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 lg:py-4 flex items-center justify-between">
          <BrandMark href="/" />

          {/* Quick links navigation on the right side */}
          <nav className="hidden md:flex items-center gap-6 font-sans text-sm font-medium text-muted-foreground">
            <a href="#bocanh" className="hover:text-primary transition-colors">
              Bối cảnh
            </a>
            <a href="#vuan" className="hover:text-primary transition-colors">
              Vụ án
            </a>
            <a href="#trai-nghiem-dieu-tra" className="hover:text-primary transition-colors">
              Trải nghiệm phá án
            </a>
            <Link
              href="/how-to-play"
              className="hover:text-primary transition-colors"
            >
              Cách chơi
            </Link>
            <a href="#danhgia" className="hover:text-primary transition-colors">
              Đánh giá
            </a>
            <a href="#faq" className="hover:text-primary transition-colors">
              Hỏi & Đáp
            </a>
          </nav>

          {/* Action controls (LogIn / User Profile) */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <UserNav />
          </div>
        </div>
      </header>

      {/* HERO SECTION — FULL VIEWPORT ON MOBILE (FITS PHONE SCREEN EXACTLY) + FLASHLIGHT ON DESKTOP */}
      <section className="relative w-full h-[calc(100svh-3.5rem)] min-h-[500px] lg:h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background static image + flashlight */}
        <div className="absolute inset-0 w-full h-full z-0">
          <LandingHeroBackdrop
            desktopImage="/images/hero/hero_wall_desktop.webp"
            mobileImage="/images/hero/hero_wall_mobile.webp"
          />
        </div>

        {/* Foreground Content overlay */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-6 flex justify-start lg:pl-0 pointer-events-none">
          <div className="w-full max-w-md flex flex-col items-start gap-4 sm:gap-5 pointer-events-auto lg:translate-x-[-1.5rem]">
            <h1 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight uppercase">
              Những vụ án chưa có lời giải...
            </h1>
            {/* Animated Rotating Detective Quote */}
            <div className="w-full min-h-[68px] sm:min-h-[68px] flex items-center">
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

            {/* Primary Hero CTA: Phá Án Ngay */}
            <div className="w-full mt-2 sm:mt-3 flex items-center">
              <Link
                href="/evidence/web"
                className="group inline-flex items-center justify-center gap-2.5 h-12 sm:h-13 px-8 sm:px-10 font-mono text-sm sm:text-base font-black uppercase tracking-wider rounded-md bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] border border-amber-300 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                <span>Phá Án Ngay</span>
                <ChevronRight className="size-4.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
