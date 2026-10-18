"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PhoneStatusBarProps {
  time?: string;
  isLight?: boolean;
  batteryLevel?: number;
  serviceText?: string;
}

export function PhoneStatusBar({
  time = "21:30",
  isLight = false,
  batteryLevel = 15,
  serviceText = "Không có Dịch vụ",
}: PhoneStatusBarProps) {
  return (
    <div
      className={cn(
        "relative z-30 h-[20px] px-2 flex items-center justify-between text-[11px] font-sans tracking-tight shrink-0 select-none",
        isLight ? "bg-[#FFFFFF] text-black" : "bg-transparent text-white"
      )}
    >
      {/* Left: Signal Dots & Service Text */}
      <div className="flex items-center gap-1.5" title={`Trạng thái mạng: ${serviceText}`}>
        <div className="flex items-center gap-[2.5px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full inline-block border",
                isLight ? "border-black/50 bg-transparent" : "border-white/50 bg-transparent"
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            "font-medium text-[9.5px] ml-0.5 tracking-tight",
            isLight ? "text-black" : "text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          )}
        >
          {serviceText}
        </span>
      </div>

      {/* Center: Frozen Evidence Clock */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 font-semibold text-[11.5px] tracking-tight font-sans",
          isLight ? "text-black" : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        )}
      >
        {time}
      </div>

      {/* Right: Critical Battery Icon */}
      <div className={cn("flex items-center gap-1", isLight ? "text-black" : "text-white")}>
        <div
          className={cn(
            "w-5 h-2.5 rounded-[3px] p-[1px] relative flex items-center shadow-sm",
            isLight ? "border border-black/80 bg-black/10" : "border border-white/90 bg-black/20"
          )}
        >
          <div
            className="h-full bg-[#FF3B30] rounded-[1px]"
            style={{ width: `${Math.max(batteryLevel, 10)}%` }}
          />
          <div
            className={cn(
              "absolute -right-[3px] top-[2px] w-[2px] h-[4px] rounded-r-[1px]",
              isLight ? "bg-black/80" : "bg-white/90"
            )}
          />
        </div>
      </div>
    </div>
  );
}
