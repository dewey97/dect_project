"use client";

import { useEffect, useRef } from "react";

interface LandingHeroBackdropProps {
  bgImage?: string;
  desktopImage?: string;
  mobileImage?: string;
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulseOffset: number;
  vy: number;
  vxBase: number;
  driftSpeed: number;
  driftPhase: number;
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
  const dustCanvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Quầng sáng đèn pin theo trỏ chuột (Flashlight Spotlight)
  useEffect(() => {
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

  // 2. Hạt bụi bay lơ lửng cinematic (Subtle Ambient Floating Dust Motes)
  useEffect(() => {
    const canvas = dustCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    // Số lượng hạt: Tăng mật độ cinematic rõ rệt (75-80 hạt trên desktop, 38-42 hạt trên mobile)
    const isMobile = width < 768;
    const count = isMobile ? 40 : 75;

    const particles: DustParticle[] = [];
    for (let i = 0; i < count; i++) {
      // Phân tầng độ sâu (depth): hạt xa (nhỏ, mờ) và hạt gần (rõ hơn, lấp lánh hơn)
      const isForeground = Math.random() < 0.25;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        // Kích thước đa dạng: 0.7px - 2.2px
        size: isForeground ? Math.random() * 0.9 + 1.4 : Math.random() * 0.7 + 0.7,
        // Độ sáng rõ nét hơn: 0.18 - 0.52
        baseAlpha: isForeground ? Math.random() * 0.25 + 0.32 : Math.random() * 0.22 + 0.18,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        // Tốc độ bay lững lờ theo luồng không khí
        vy: -(Math.random() * 0.28 + 0.1),
        vxBase: (Math.random() - 0.5) * 0.12,
        driftSpeed: Math.random() * 0.014 + 0.007,
        driftPhase: Math.random() * Math.PI * 2,
      });
    }

    let isVisible = true;
    let animId: number | null = null;
    let time = 0;

    const render = () => {
      if (!isVisible) return;
      time += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cập nhật vị trí brownian lơ lửng
        p.driftPhase += p.driftSpeed;
        p.x += Math.sin(p.driftPhase) * 0.24 + p.vxBase;
        p.y += p.vy;

        // Vòng lặp biên màn hình mượt mà
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        if (p.x < -10) {
          p.x = width + 10;
        } else if (p.x > width + 10) {
          p.x = -10;
        }

        // Nhấp nháy nhẹ như phản chiếu ánh sáng đèn pin
        const alpha = Math.max(
          0.06,
          p.baseAlpha + Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.12
        );

        // Vẽ hạt bụi màu ấm hổ phách / ngà phát sáng nhẹ
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 242, 215, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Tự động tạm dừng animation khi cuộn khỏi màn hình Hero để tối ưu CPU 100%
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          animId = requestAnimationFrame(render);
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Cập nhật kích thước canvas khi thay đổi viewport
    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (animId) cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
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

      {/* Hạt bụi lơ lửng cinematic (Floating Dust Motes) — nhỏ xíu, thưa, bay chậm */}
      <canvas
        ref={dustCanvasRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Quầng sáng đèn pin — Chỉ bật trên Desktop */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="hidden lg:block absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 ease-out z-20"
      />
    </div>
  );
}
