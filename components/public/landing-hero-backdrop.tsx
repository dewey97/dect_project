"use client";

import { useEffect, useRef } from "react";

interface LandingHeroBackdropProps {
  bgImage?: string;
  desktopImage?: string;
  mobileImage?: string;
}

export function LandingHeroBackdrop({
  bgImage,
  desktopImage = "/images/hero/hero_wall_desktop.webp",
  mobileImage = "/images/hero/hero_wall_mobile.webp",
}: LandingHeroBackdropProps) {
  const finalDesktop = desktopImage || bgImage || "/images/hero/hero_wall_desktop.webp";
  const finalMobile = mobileImage || finalDesktop;
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Chỉ kích hoạt hiệu ứng đèn pin trên Desktop (chuột fine-pointer và màn hình lớn >= 1024px)
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const isLargeScreen = window.innerWidth >= 1024;
    if (!isFinePointer || !isLargeScreen) {
      return;
    }

    const container = containerRef.current;
    const spotlight = spotlightRef.current;
    if (!container || !spotlight) return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        spotlight.style.opacity = "1";
        spotlight.style.background = `radial-gradient(circle 320px at ${x}px ${y}px, rgba(255,230,180,0.28) 0%, rgba(0,0,0,0.72) 70%, rgba(0,0,0,0.85) 100%)`;
      });
    };

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      spotlight.style.opacity = "0";
    };

    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#0c0805]"
    >
      <picture className="w-full h-full block">
        <source media="(max-width: 767px)" srcSet={finalMobile} />
        <img
          src={finalDesktop}
          alt="Bảng điều tra hero"
          className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.05] lg:brightness-[0.72]"
        />
      </picture>
      {/* Lớp phủ tương phản tối tĩnh: Trên mobile sâu hơn để bảo vệ độ sắc nét của văn bản */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/85 lg:from-black/80 lg:via-black/35 lg:to-black/75 pointer-events-none" />

      {/* Quầng sáng đèn pin — Chỉ bật trên Desktop */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="hidden lg:block absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 ease-out"
      />
    </div>
  );
}
