"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Zap, RefreshCw, Camera, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraAppProps {
  onBackToHome?: () => void;
}

export function CameraApp({ onBackToHome }: CameraAppProps) {
  const [flashMode, setFlashMode] = useState<"auto" | "on" | "off">("auto");
  const [hdrMode, setHdrMode] = useState<"auto" | "on" | "off">("auto");
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);
  const [showMonkey, setShowMonkey] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<"pending" | "granted" | "denied">("pending");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const monkeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Âm thanh Shutter tiếng 'tách' chụp ảnh cơ học của iOS
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  }, []);

  // Khởi động Camera stream
  const startCamera = useCallback(async (facing: "user" | "environment") => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermission("denied");
      return;
    }

    try {
      setCameraPermission("pending");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraPermission("granted");
    } catch (err) {
      console.warn("Không thể truy cập camera:", err);
      setCameraPermission("denied");
    }
  }, []);

  useEffect(() => {
    startCamera(cameraFacing);

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (monkeyTimeoutRef.current) {
        clearTimeout(monkeyTimeoutRef.current);
      }
    };
  }, [cameraFacing, startCamera]);

  const toggleCameraFacing = () => {
    setShowMonkey(false);
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Bấm chụp: Nháy sáng một cái rồi hiện ra hình con khỉ siêu hài hước
  const handleShutter = () => {
    playShutterSound();
    setShutterFlash(true);

    if (monkeyTimeoutRef.current) {
      clearTimeout(monkeyTimeoutRef.current);
    }

    // Sau khi nháy sáng 120ms -> Hiện con khỉ
    setTimeout(() => {
      setShutterFlash(false);
      setShowMonkey(true);

      // Tự động biến mất sau 3.5 giây quay lại camera bình thường
      monkeyTimeoutRef.current = setTimeout(() => {
        setShowMonkey(false);
      }, 3500);
    }, 120);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white select-none overflow-hidden font-sans relative">
      {/* 1. TOP CAMERA CONTROLS BAR (Classic iOS Camera Bar) */}
      <div className="h-[44px] px-3 bg-black/80 flex items-center justify-between shrink-0 z-20 border-b border-white/10">
        <button
          onClick={() =>
            setFlashMode((prev) =>
              prev === "auto" ? "on" : prev === "on" ? "off" : "auto"
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

        <button
          onClick={() =>
            setHdrMode((prev) =>
              prev === "auto" ? "on" : prev === "on" ? "off" : "auto"
            )
          }
          className={cn(
            "text-[12px] font-semibold px-2 py-0.5 rounded cursor-pointer",
            hdrMode === "on"
              ? "text-[#FFD60A]"
              : hdrMode === "auto"
              ? "text-white"
              : "text-white/40"
          )}
          title="HDR"
        >
          HDR {hdrMode.toUpperCase()}
        </button>

        <button
          onClick={toggleCameraFacing}
          className="text-white hover:opacity-80 active:opacity-60 p-1 cursor-pointer min-h-[36px]"
          title="Đổi camera trước / sau"
        >
          <RefreshCw className="size-4.5" />
        </button>
      </div>

      {/* 2. CAMERA VIEWFINDER */}
      <div className="flex-1 min-h-0 bg-black relative flex items-center justify-center overflow-hidden">
        {/* LIVE WEBCAM VIDEO STREAM */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300",
            cameraPermission === "granted" ? "opacity-100" : "opacity-0",
            cameraFacing === "user" && "-scale-x-100"
          )}
        />

        {/* FALLBACK / TRẠNG THÁI KHÔNG CÓ QUYỀN CAMERA */}
        {cameraPermission !== "granted" && (
          <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center relative p-6 text-center z-10">
            <div className="absolute inset-0 bg-radial from-transparent to-black/90 pointer-events-none" />

            {cameraPermission === "denied" ? (
              <div className="flex flex-col items-center space-y-2 relative z-10">
                <AlertCircle className="size-8 text-[#FF453A]" />
                <div className="text-sm font-semibold text-zinc-300">
                  Không thể mở Camera
                </div>
                <div className="text-[11px] text-zinc-500 max-w-[200px]">
                  Cần cấp quyền truy cập Camera trong trình duyệt để chụp ảnh
                </div>
                <button
                  onClick={() => startCamera(cameraFacing)}
                  className="mt-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs hover:bg-white/20 active:scale-95 transition-all"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 relative z-10">
                <Camera className="size-8 text-zinc-600 animate-pulse" />
                <div className="text-xs text-zinc-400">Đang bật Camera...</div>
              </div>
            )}

            <div className="size-16 border border-[#FFD60A]/70 rounded-xs pointer-events-none relative animate-pulse flex items-center justify-center mt-4">
              <div className="size-1 rounded-full bg-[#FFD60A]/80" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-[#FFD60A]/80 text-[10px]">
                ☀
              </div>
            </div>
          </div>
        )}

        {/* Focus Box Overlay */}
        {cameraPermission === "granted" && !showMonkey && (
          <div className="size-16 border border-[#FFD60A]/80 rounded-xs pointer-events-none relative flex items-center justify-center z-10">
            <div className="size-1 rounded-full bg-[#FFD60A]" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-[#FFD60A] text-[10px]">
              ☀
            </div>
          </div>
        )}

        {/* HÌNH CON KHỈ EASTER EGG (Sau cú nháy sáng shutter) */}
        {showMonkey && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-25 overflow-hidden animate-in zoom-in-95 fade-in duration-150">
            <img
              src="/images/cases/case_000/phone/monkey_selfie.png"
              alt="Chú khỉ bất ngờ"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
        )}

        {/* Shutter White Flash Effect */}
        {shutterFlash && (
          <div className="absolute inset-0 bg-white z-40 animate-in fade-in duration-75" />
        )}
      </div>

      {/* 3. BOTTOM SHUTTER BAR */}
      <div className="h-[96px] bg-black px-6 flex items-center justify-center shrink-0 pb-3 relative">
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
export default CameraApp;
