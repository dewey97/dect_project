"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { POSTER_ITEMS } from "@/lib/data/landing-data";

interface HeroCaseCarouselProps {
  activePoster: number;
  setActivePoster: (update: number | ((prev: number) => number)) => void;
  className?: string;
}

export function HeroCaseCarousel({
  activePoster,
  setActivePoster,
  className = "",
}: HeroCaseCarouselProps) {
  const router = useRouter();
  const total = POSTER_ITEMS.length;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentCase = POSTER_ITEMS[activePoster] || POSTER_ITEMS[0];
  const isTrontim = activePoster === 0;

  return (
    <div
      className={`relative w-full flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* 3D Perspective Stage — TĂNG KÍCH THƯỚC RÕ RÀNG */}
      <div className="relative w-full max-w-[380px] sm:max-w-[480px] lg:max-w-[540px] xl:max-w-[580px] h-[260px] sm:h-[290px] lg:h-[310px] xl:h-[330px] flex items-center justify-center">
        {/* Navigation Arrow Left */}
        <button
          type="button"
          onClick={() =>
            setActivePoster((prev) => (prev === 0 ? total - 1 : prev - 1))
          }
          className="absolute -left-1 sm:left-0 z-40 p-2 sm:p-2.5 rounded-full border border-border/70 bg-background/90 hover:bg-amber-500/20 hover:border-amber-400 text-foreground transition-all cursor-pointer shadow-md active:scale-95"
          title="Vụ án trước"
        >
          <ChevronLeft className="size-4 sm:size-4.5" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          type="button"
          onClick={() =>
            setActivePoster((prev) => (prev === total - 1 ? 0 : prev + 1))
          }
          className="absolute -right-1 sm:right-0 z-40 p-2 sm:p-2.5 rounded-full border border-border/70 bg-background/90 hover:bg-amber-500/20 hover:border-amber-400 text-foreground transition-all cursor-pointer shadow-md active:scale-95"
          title="Vụ án kế tiếp"
        >
          <ChevronRight className="size-4 sm:size-4.5" />
        </button>

        {/* Carousel 3D Cards */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ perspective: "950px" }}
        >
          {POSTER_ITEMS.map((poster, index) => {
            const isActive = activePoster === index;
            const isLeft = (activePoster - 1 + total) % total === index;
            const isRight = (activePoster + 1) % total === index;
            const isFarLeft = (activePoster - 2 + total) % total === index;
            const isFarRight = (activePoster + 2) % total === index;

            // Offsets tuned for larger poster cards
            const leftOffset = isMobile ? -105 : -145;
            const rightOffset = isMobile ? 105 : 145;
            const farLeftOffset = isMobile ? -175 : -240;
            const farRightOffset = isMobile ? 175 : 240;

            let transformStyle = "scale(0) translate3d(0, 0, -200px)";
            let opacity = 0;
            let zIndex = 5;

            if (isActive) {
              transformStyle = "translate3d(0, 0, 0) scale(1) rotateY(0deg)";
              opacity = 1;
              zIndex = 30;
            } else if (isLeft) {
              transformStyle = `translate3d(${leftOffset}px, 0, -70px) scale(0.8) rotateY(18deg)`;
              opacity = 0.78;
              zIndex = 20;
            } else if (isRight) {
              transformStyle = `translate3d(${rightOffset}px, 0, -70px) scale(0.8) rotateY(-18deg)`;
              opacity = 0.78;
              zIndex = 20;
            } else if (isFarLeft) {
              transformStyle = `translate3d(${farLeftOffset}px, 0, -130px) scale(0.62) rotateY(30deg)`;
              opacity = 0.48;
              zIndex = 10;
            } else if (isFarRight) {
              transformStyle = `translate3d(${farRightOffset}px, 0, -130px) scale(0.62) rotateY(-30deg)`;
              opacity = 0.48;
              zIndex = 10;
            }

            const isCurrentTrontim = index === 0;

            return (
              <div
                key={poster.id}
                onClick={() => {
                  if (isActive && isCurrentTrontim) {
                    router.push("/cases/case_000");
                  } else {
                    setActivePoster(index);
                  }
                }}
                style={{
                  transform: transformStyle,
                  opacity: opacity,
                  zIndex: zIndex,
                  transition: "all 0.45s cubic-bezier(0.25, 1, 0.5, 1)",
                  transformStyle: "preserve-3d",
                }}
                className="absolute w-[155px] sm:w-[175px] lg:w-[195px] xl:w-[210px] aspect-[1/1.414] rounded-md overflow-hidden cursor-pointer group bg-zinc-950 transition-all duration-300 border border-white/40 shadow-[0_0_14px_rgba(255,255,255,0.12),0_12px_28px_rgba(0,0,0,0.85)] hover:border-amber-400 hover:shadow-[0_0_22px_rgba(245,158,11,0.3),0_16px_36px_rgba(0,0,0,0.9)]"
              >
                <img
                  src={poster.img}
                  alt={poster.title || poster.code}
                  className="w-full h-full object-cover filter brightness-[0.95] contrast-105 group-hover:brightness-100 transition-all duration-300"
                />

                {/* Subtle paper grain */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact Status Bar under Carousel */}
      <div className="mt-2.5 sm:mt-3 flex flex-col items-center justify-center gap-1 font-mono text-center">
        <div className="flex items-center gap-2">
          <span
            className={
              isTrontim
                ? "text-xs sm:text-sm text-amber-400 font-black tracking-widest uppercase"
                : "text-xs sm:text-sm text-zinc-500 font-bold tracking-widest uppercase"
            }
          >
            {currentCase.code}
          </span>
          {!isTrontim && currentCase.title && (
            <>
              <span className="text-zinc-600 text-xs">/</span>
              <span className="text-xs sm:text-sm text-zinc-400 font-bold uppercase tracking-wider">
                {currentCase.title}
              </span>
            </>
          )}
        </div>

        {/* Quick parameters - Vertical stack */}
        <div className="flex flex-col items-center justify-center gap-0.5 text-[0.68rem] sm:text-[0.74rem] text-muted-foreground mt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Độ khó:</span>
            {isTrontim ? (
              <span className="text-amber-400 font-bold tracking-wider">★★★☆☆</span>
            ) : (
              <span className="text-zinc-600 tracking-wider">?????</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Độ kinh dị:</span>
            {isTrontim ? (
              <span className="text-red-400 font-bold tracking-wider">★★☆☆☆</span>
            ) : (
              <span className="text-zinc-600 tracking-wider">?????</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Thời gian:</span>
            {isTrontim ? (
              <span className="text-zinc-200 font-medium">60 - 90 phút</span>
            ) : (
              <span className="text-zinc-600">???</span>
            )}
          </div>
        </div>
      </div>

      {/* Action CTA: Phá Án (kính lúp + độ rộng vừa phải) */}
      {isTrontim && (
        <div className="mt-3.5 sm:mt-4 flex items-center justify-center font-mono">
          <Link
            href="/cases/case_000"
            className="inline-flex items-center justify-center gap-2 h-9.5 sm:h-10 px-7 sm:px-8 text-xs sm:text-sm font-black uppercase tracking-wider rounded-md bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_18px_rgba(245,158,11,0.35)] hover:shadow-[0_0_26px_rgba(245,158,11,0.5)] transition-all active:scale-95 cursor-pointer"
          >
            <Search className="size-4 shrink-0 stroke-[2.5]" />
            <span>PHÁ ÁN</span>
          </Link>
        </div>
      )}
    </div>
  );
}
