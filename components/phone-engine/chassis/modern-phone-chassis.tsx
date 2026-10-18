"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ChassisProps } from "./iphone-classic-chassis";

/**
 * Modern Smartphone Chassis (Màn hình tràn viền, viền mỏng, camera nốt ruồi / Dynamic pill)
 * Dùng cho các vụ án hiện đại hoặc smartphone nghi phạm đời mới
 */
export function ModernPhoneChassis({
  children,
  onHomePress,
  className,
}: ChassisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const updateScale = () => {
      const container = containerRef.current;
      const rect = container?.getBoundingClientRect();

      const vpW = window.visualViewport?.width || window.innerWidth;
      const vpH = window.visualViewport?.height || window.innerHeight;

      const availW = rect && rect.width > 50 ? rect.width : vpW;
      const availH = rect && rect.height > 50 ? rect.height : vpH;

      const TARGET_W = 390;
      const TARGET_H = 780;

      const fitScale = Math.min((availW - 32) / TARGET_W, (availH - 32) / TARGET_H);
      setScale(Math.min(Math.max(fitScale, 0.45), 1.05));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden p-0",
        className
      )}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: `${390 * scale}px`,
          height: `${780 * scale}px`,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            width: "390px",
            height: "780px",
          }}
          className="relative transition-transform duration-75 flex flex-col items-center shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] shrink-0 bg-[#1C1C1E] rounded-[52px] p-[10px] border-[3px] border-[#38383A] ring-1 ring-white/10"
        >
          {/* Dynamic Island / Pill Camera */}
          <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-between px-3 border border-white/5 shadow-md">
            <div className="size-2.5 rounded-full bg-[#09090b] border border-[#27272a]" />
            <div className="size-2 rounded-full bg-[#1e293b]" />
          </div>

          {/* Screen Content */}
          <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-black flex flex-col">
            {children}

            {/* Bottom Home Indicator Bar */}
            <div className="absolute bottom-1 left-0 right-0 h-6 flex items-center justify-center z-40 pointer-events-auto">
              <button
                onClick={onHomePress}
                className="w-32 h-1 bg-white/60 hover:bg-white active:scale-95 transition-all rounded-full cursor-pointer"
                title="Gạt về màn hình chính"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
