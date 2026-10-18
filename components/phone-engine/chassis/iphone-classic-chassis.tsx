"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface ChassisProps {
  children: React.ReactNode;
  onHomePress?: () => void;
  onPowerPress?: () => void;
  frameless?: boolean;
  className?: string;
}

/**
 * Authentic Classic iPhone Chassis (iPhone 6s/7/8 Plus)
 * Phục vụ các vụ án phong cách cổ điển / 2016
 * Kích thước chuẩn: 415px x 768px (màn hình trong 375px x 600px)
 */
export function IPhoneClassicChassis({
  children,
  onHomePress,
  frameless = false,
  className,
}: ChassisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    let t1: NodeJS.Timeout | undefined;
    let t2: NodeJS.Timeout | undefined;

    const updateScale = () => {
      const container = containerRef.current;
      const rect = container?.getBoundingClientRect();

      const vpW = window.visualViewport?.width || window.innerWidth;
      const vpH = window.visualViewport?.height || window.innerHeight;

      const availW = rect && rect.width > 50 ? rect.width : vpW;
      const availH = rect && rect.height > 50 ? rect.height : vpH;

      const TARGET_W = 415;
      const TARGET_H = 768;

      const isMobile = vpW < 640;
      const padX = isMobile ? 8 : 24;
      const padY = isMobile ? 8 : 24;

      const maxUsableW = Math.max(availW - padX * 2, 280);
      const maxUsableH = Math.max(availH - padY * 2, 380);

      const scaleX = maxUsableW / TARGET_W;
      const scaleY = maxUsableH / TARGET_H;

      const fitScale = Math.min(scaleX, scaleY);
      const clampedScale = Math.min(Math.max(fitScale, 0.45), 1.05);

      setScale(clampedScale);
    };

    updateScale();
    t1 = setTimeout(updateScale, 100);
    t2 = setTimeout(updateScale, 400);

    window.addEventListener("resize", updateScale);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateScale);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", updateScale);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateScale);
      }
    };
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
          width: `${415 * scale}px`,
          height: `${768 * scale}px`,
        }}
      >
        <div
          data-iphone-frame="true"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            width: "415px",
            height: "768px",
          }}
          className={cn(
            "relative transition-transform duration-75 flex flex-col items-center shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] shrink-0 no-scrollbar",
            frameless
              ? "bg-black rounded-lg border border-white/20 h-[667px]"
              : "bg-[#D8D8DC] rounded-[48px] pt-3 pb-3 px-[20px] border-[2.5px] border-[#A1A1A6] ring-1 ring-black/25 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_25px_60px_rgba(0,0,0,0.6)]"
          )}
        >
          {!frameless && (
            <>
              {/* Top Bezel: Proximity sensor, Front Camera & Ear Speaker */}
              <div className="w-full h-[72px] flex flex-col items-center justify-center shrink-0 relative">
                <div className="size-1.5 rounded-full bg-[#3F3F46] opacity-80 mb-2 shadow-inner" />
                <div className="flex items-center justify-center relative w-full">
                  <div className="absolute left-1/2 -translate-x-14 size-3 rounded-full bg-[#27272A] border border-black/30 shadow-inner flex items-center justify-center">
                    <div className="size-1 rounded-full bg-[#0369a1]/60" />
                  </div>
                  <div className="w-14 h-1.5 rounded-full bg-[#52525B] border border-black/30 shadow-inner" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-[48px] pointer-events-none border border-white/40 shadow-[inset_0_0_3px_rgba(0,0,0,0.1)]" />
            </>
          )}

          {/* SCREEN CONTAINER: 375x600 Display */}
          <div
            className={cn(
              "relative w-[375px] max-w-full h-[600px] shrink-0 bg-[#0d2a45] bg-[url('/images/cases/case_000/phone/clean_beach_wallpaper.png')] bg-cover bg-center overflow-hidden flex flex-col no-scrollbar",
              !frameless && "rounded-lg border border-black/50 shadow-inner"
            )}
          >
            {children}
          </div>

          {!frameless && (
            /* Bottom Bezel: Physical Home Button (Touch ID) */
            <div className="w-full h-[72px] flex items-center justify-center shrink-0">
              <button
                onClick={onHomePress}
                className="group size-14 rounded-full bg-[#D8D8DC] border-[2px] border-[#A1A1A6] hover:border-[#71717A] active:scale-95 transition-all flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(0,0,0,0.06)] cursor-pointer relative"
                title="Nút Home vật lý (Touch ID): Bấm để về Màn hình chính hoặc Mở khóa"
              >
                <div className="absolute inset-[1.5px] rounded-full border-[1.5px] border-[#8E8E93] group-hover:border-[#52525B] pointer-events-none" />
                <div className="size-9 rounded-full bg-[#D8D8DC] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] group-active:brightness-90 transition-all" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
