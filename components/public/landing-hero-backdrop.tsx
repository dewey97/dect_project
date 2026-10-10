"use client";

import { useEffect, useRef, useState } from "react";

interface LandingHeroBackdropProps {
  bgImage: string;
}

export function LandingHeroBackdrop({ bgImage }: LandingHeroBackdropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState<{
    x: number;
    y: number;
    active: boolean;
  }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPointer({ x, y, active: true });
    };

    const handlePointerLeave = () => {
      setPointer((prev) => ({ ...prev, active: false }));
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener("pointermove", handlePointerMove);
      el.addEventListener("pointerleave", handlePointerLeave);
    }

    return () => {
      if (el) {
        el.removeEventListener("pointermove", handlePointerMove);
        el.removeEventListener("pointerleave", handlePointerLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#0c0805]"
    >
      {/* 1. Base fixed image background */}
      <img
        src={bgImage}
        alt="Bảng điều tra hero"
        className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.1]"
      />

      {/* 2. Dark vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/70 pointer-events-none" />

      {/* 3. Flashlight light-cone spotlight following pointer */}
      {pointer.active && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 280px at ${pointer.x}px ${pointer.y}px, rgba(255, 230, 180, 0.28) 0%, rgba(217, 119, 6, 0.12) 45%, rgba(0, 0, 0, 0.72) 80%)`,
          }}
        />
      )}
    </div>
  );
}
