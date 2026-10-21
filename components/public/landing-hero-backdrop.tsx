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
  vxPush: number;
  vyPush: number;
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

  // Hiệu ứng đèn pin (Spotlight) & hạt bụi tương tác chuột (Interactive Floating Dust Motes)
  useEffect(() => {
    const canvas = dustCanvasRef.current;
    const container = containerRef.current;
    const spotlight = spotlightRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const isLargeScreen = () => window.innerWidth >= 1024;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    // Số lượng hạt bụi: ~120 hạt desktop, ~60 hạt mobile
    const isMobile = width < 768;
    const count = isMobile ? 60 : 120;

    const particles: DustParticle[] = [];
    for (let i = 0; i < count; i++) {
      const isForeground = Math.random() < 0.25;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isForeground ? Math.random() * 0.9 + 1.4 : Math.random() * 0.7 + 0.7,
        baseAlpha: isForeground ? Math.random() * 0.25 + 0.32 : Math.random() * 0.22 + 0.18,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        vy: -(Math.random() * 0.28 + 0.1),
        vxBase: (Math.random() - 0.5) * 0.12,
        vxPush: 0,
        vyPush: 0,
        driftSpeed: Math.random() * 0.014 + 0.007,
        driftPhase: Math.random() * Math.PI * 2,
      });
    }

    let isVisible = true;
    let animId: number | null = null;
    let time = 0;

    // Tọa độ và vận tốc con trỏ chuột
    let mouseX = -9999;
    let mouseY = -9999;
    let mouseActive = false;
    let prevMouseX = -9999;
    let prevMouseY = -9999;
    let mouseSpeedX = 0;
    let mouseSpeedY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();

      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const newX = e.clientX - rect.left;
        const newY = e.clientY - rect.top;

        if (prevMouseX !== -9999) {
          mouseSpeedX = (newX - prevMouseX) * 0.35;
          mouseSpeedY = (newY - prevMouseY) * 0.35;
        }
        prevMouseX = newX;
        prevMouseY = newY;
        mouseX = newX;
        mouseY = newY;
        mouseActive = true;

        if (spotlight && isLargeScreen() && isFinePointer) {
          spotlight.style.opacity = "1";
          spotlight.style.background = `radial-gradient(circle 320px at ${newX}px ${newY}px, rgba(255,230,180,0.28) 0%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.42) 100%)`;
        }
      } else {
        if (mouseActive) {
          mouseActive = false;
          mouseX = -9999;
          mouseY = -9999;
          prevMouseX = -9999;
          prevMouseY = -9999;
          mouseSpeedX = 0;
          mouseSpeedY = 0;
          if (spotlight) {
            spotlight.style.opacity = "0";
          }
        }
      }
    };

    const handleMouseLeave = () => {
      mouseActive = false;
      mouseX = -9999;
      mouseY = -9999;
      prevMouseX = -9999;
      prevMouseY = -9999;
      mouseSpeedX = 0;
      mouseSpeedY = 0;
      if (spotlight) {
        spotlight.style.opacity = "0";
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const pushRadius = 140;
    const spotRadius = 260;

    const render = () => {
      if (!isVisible) return;
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Giảm dần vận tốc chuột theo khung hình
      mouseSpeedX *= 0.85;
      mouseSpeedY *= 0.85;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        let illumBoost = 0;

        // Tương tác chuột: Luồng gió đẩy dạt + Bắt sáng chùm đèn
        if (mouseActive) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const distSq = dx * dx + dy * dy;

          if (distSq < spotRadius * spotRadius) {
            const dist = Math.sqrt(distSq);

            // Bắt sáng khi lọt vào quầng sáng đèn pin
            illumBoost = Math.max(0, 1 - dist / spotRadius);

            // Lực đẩy dạt gió tự nhiên khi con trỏ chuột lướt tới
            if (dist < pushRadius && dist > 1) {
              const factor = 1 - dist / pushRadius;
              const pushFactor = factor * factor * 1.6;
              const nx = dx / dist;
              const ny = dy / dist;

              p.vxPush += nx * pushFactor + mouseSpeedX * factor * 0.08;
              p.vyPush += ny * pushFactor + mouseSpeedY * factor * 0.08;
            }
          }
        }

        // Hãm tốc độ đẩy để hạt bụi êm ái trôi về nhịp ban đầu (damping)
        const maxV = 4.5;
        p.vxPush = Math.max(-maxV, Math.min(maxV, p.vxPush)) * 0.93;
        p.vyPush = Math.max(-maxV, Math.min(maxV, p.vyPush)) * 0.93;

        // Cập nhật vị trí brownian lơ lửng + lực đẩy chuột
        p.driftPhase += p.driftSpeed;
        p.x += Math.sin(p.driftPhase) * 0.24 + p.vxBase + p.vxPush;
        p.y += p.vy + p.vyPush;

        // Vòng lặp biên màn hình mượt mà
        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
          p.vxPush = 0;
          p.vyPush = 0;
        } else if (p.y > height + 15) {
          p.y = -15;
          p.x = Math.random() * width;
          p.vxPush = 0;
          p.vyPush = 0;
        }

        if (p.x < -15) {
          p.x = width + 15;
          p.vxPush = 0;
        } else if (p.x > width + 15) {
          p.x = -15;
          p.vxPush = 0;
        }

        // Nhấp nháy nhẹ như phản chiếu ánh sáng + tăng độ sáng rõ khi ở gần đèn pin
        const baseAlpha = p.baseAlpha + Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.12;
        const alpha = Math.min(
          0.92,
          Math.max(0.06, baseAlpha + illumBoost * 0.42)
        );

        // Kích thước hạt phản quang nhẹ khi trong chùm đèn
        const currentSize = p.size + illumBoost * 0.7;

        // Màu ngà ấm hổ phách, khi vào chùm đèn ánh vàng ấm sáng rõ hơn
        const r = 255;
        const g = Math.round(242 - illumBoost * 14);
        const b = Math.round(215 - illumBoost * 45);

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
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
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
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
