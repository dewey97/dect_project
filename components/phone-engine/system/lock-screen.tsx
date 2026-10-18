"use client";

import React, { useRef } from "react";

interface LockScreenProps {
  time?: string;
  date?: string;
  onUnlock: () => void;
}

export function LockScreen({
  time = "21:30",
  date = "Thứ Bảy, 23 tháng 7",
  onUnlock,
}: LockScreenProps) {
  const lockDragStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    lockDragStartY.current = clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (lockDragStartY.current === null) return;
    const clientY =
      "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;
    const diffY = lockDragStartY.current - clientY;
    if (diffY > 40) {
      onUnlock();
    }
    lockDragStartY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      className="flex-1 flex flex-col justify-between p-4 sm:p-5 relative overflow-hidden bg-black/25 backdrop-blur-xs select-none cursor-pointer"
      onClick={onUnlock}
    >
      {/* Top Notification Grabber Hint */}
      <div className="w-10 h-1 bg-white/40 rounded-full mx-auto -mt-1 mb-1 shadow-xs" />

      {/* Lock Screen Header & Clock */}
      <div className="flex flex-col items-center pt-2 space-y-1 relative z-10">
        <span className="text-[17px] font-normal text-white/95 tracking-[0.425px] drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] font-sans">
          {date}
        </span>
        <span className="text-[76px] sm:text-[80px] font-extralight text-white tracking-[-1.9px] leading-[80px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)] font-sans">
          {time}
        </span>
      </div>

      {/* Center Spacer */}
      <div className="flex-1 my-auto" />

      {/* Bottom Bar prompt */}
      <div className="relative z-10 w-full flex flex-col items-center pb-3 pt-1">
        <div className="text-white/70 font-sans text-[13px] font-normal tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] animate-pulse">
          Nhấn nút Home hoặc chạm để mở khóa
        </div>
      </div>
    </div>
  );
}
