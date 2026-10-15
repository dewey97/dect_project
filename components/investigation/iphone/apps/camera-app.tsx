"use client";

import { useState } from "react";
import { Zap, RefreshCw, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraAppProps {
  onBackToHome?: () => void;
}

export function CameraApp({ onBackToHome }: CameraAppProps) {
  const [flashMode, setFlashMode] = useState<"auto" | "on" | "off">("auto");
  const [hdrMode, setHdrMode] = useState<"auto" | "on" | "off">("auto");
  const [cameraFacing, setCameraFacing] = useState<"back" | "front">("back");
  const [shutterFlash, setShutterFlash] = useState(false);

  const handleShutter = () => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 120);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white select-none overflow-hidden font-sans relative">
      {/* 1. TOP CAMERA CONTROLS BAR (Classic iOS 9 Camera Bar) */}
      <div className="h-[44px] px-3 bg-black/80 flex items-center justify-between shrink-0 z-20 border-b border-white/10">
        {/* Flash Mode Toggle */}
        <button
          onClick={() =>
            setFlashMode((prev) =>
              prev === "auto" ? "on" : prev === "on" ? "off" : "auto",
            )
          }
          className="flex items-center gap-1 text-[13px] text-[#FFD60A] hover:opacity-80 active:opacity-60 cursor-pointer min-h-[36px]"
          title="Đèn Flash"
        >
          <Zap className="size-4 fill-current" />
          <span className="uppercase text-[11px] font-medium tracking-wider">
            {flashMode}
          </span>
        </button>

        {/* HDR Mode */}
        <button
          onClick={() =>
            setHdrMode((prev) =>
              prev === "auto" ? "on" : prev === "on" ? "off" : "auto",
            )
          }
          className={cn(
            "text-[12px] font-semibold px-2 py-0.5 rounded cursor-pointer",
            hdrMode === "on"
              ? "text-[#FFD60A]"
              : hdrMode === "auto"
                ? "text-white"
                : "text-white/40",
          )}
          title="HDR"
        >
          HDR {hdrMode.toUpperCase()}
        </button>

        {/* Flip Camera */}
        <button
          onClick={() =>
            setCameraFacing((p) => (p === "back" ? "front" : "back"))
          }
          className="text-white hover:opacity-80 active:opacity-60 p-1 cursor-pointer min-h-[36px]"
          title="Đổi camera"
        >
          <RefreshCw className="size-4.5" />
        </button>
      </div>

      {/* 2. CAMERA VIEWFINDER (PITCH BLACK SIMULATION) */}
      <div className="flex-1 min-h-0 bg-black relative flex items-center justify-center overflow-hidden">
        {/* Pitch Black / Covered Camera Viewport */}
        <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center relative">
          {/* Subtle camera lens noise/grain overlay */}
          <div className="absolute inset-0 bg-radial from-transparent to-black/90 pointer-events-none" />

          {/* Yellow Auto-Focus Target Box (Centered, classic iOS pulse) */}
          <div className="size-16 border border-[#FFD60A]/70 rounded-xs pointer-events-none relative animate-pulse flex items-center justify-center">
            {/* Small center dot */}
            <div className="size-1 rounded-full bg-[#FFD60A]/80" />
            {/* Sun exposure slider on right */}
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-[#FFD60A]/80 text-[10px]">
              ☀
            </div>
          </div>

          {/* Shutter Black/White flash feedback */}
          {shutterFlash && (
            <div className="absolute inset-0 bg-black z-30 animate-in fade-in duration-75" />
          )}
        </div>
      </div>

      {/* 3. BOTTOM SHUTTER BAR */}
      <div className="h-[96px] bg-black px-6 flex items-center justify-center shrink-0 pb-3 relative">
        {/* Shutter Button (Center: Classic iPhone white ring with solid button) */}
        <button
          onClick={handleShutter}
          aria-label="Chụp ảnh"
          className="size-[68px] rounded-full border-[4px] border-white p-1 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        >
          <div className="size-full rounded-full bg-white active:scale-90 transition-transform shadow-md" />
        </button>
      </div>
    </div>
  );
}
