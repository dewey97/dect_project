"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { EvidenceSideAnchors } from "../core/evidence-side-anchors";
import {
  getDevicePreset,
  type PhoneDevicePreset,
  type PhonePresetId,
} from "@/lib/phone/devices";

export interface ChassisProps {
  children: React.ReactNode;
  modelId?: PhonePresetId | string;
  preset?: PhoneDevicePreset | string;
  onHomePress?: () => void;
  onPowerPress?: () => void;
  frameless?: boolean;
  className?: string;
  wallpaperUrl?: string;
}

/**
 * Unified Phone Device Chassis Renderer
 *
 * Tự động ánh xạ kiểu dáng (Touch ID vs Tai thỏ vs Dynamic Island)
 * dựa trên model_id / preset với ResizeObserver scale clamp linh hoạt.
 */
export function DeviceChassis({
  children,
  modelId,
  preset: presetProp,
  onHomePress,
  frameless = false,
  className,
  wallpaperUrl,
}: ChassisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  const presetId =
    typeof presetProp === "string"
      ? presetProp
      : presetProp?.id || modelId || "iphone_classic";

  const preset: PhoneDevicePreset =
    typeof presetProp === "object" &&
    presetProp !== null &&
    "frameW" in presetProp
      ? presetProp
      : getDevicePreset(presetId);

  const TARGET_W = preset.frameW;
  const TARGET_H = preset.frameH;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const rect = container.getBoundingClientRect();
      const vpW = window.visualViewport?.width || window.innerWidth;
      const vpH = window.visualViewport?.height || window.innerHeight;

      const availW = rect && rect.width > 50 ? rect.width : vpW;
      const availH = rect && rect.height > 50 ? rect.height : vpH;

      const isMobile = vpW < 640;
      const padX = isMobile ? 8 : 24;
      const padY = isMobile ? 8 : 24;

      const maxUsableW = Math.max(availW - padX * 2, 280);
      const maxUsableH = Math.max(availH - padY * 2, 380);

      const scaleX = maxUsableW / TARGET_W;
      const scaleY = maxUsableH / TARGET_H;

      const fitScale = Math.min(scaleX, scaleY);
      // Clamp scale theo tỷ lệ màn hình và khung máy
      const clampedScale = Math.min(Math.max(fitScale, 0.4), 1.05);

      setScale(clampedScale);
    };

    updateScale();

    // ResizeObserver hỗ trợ chuẩn xác khi kéo thanh split-pane / resize container
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateScale());
      ro.observe(container);
    }

    window.addEventListener("resize", updateScale);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateScale);
    }

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", updateScale);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateScale);
      }
    };
  }, [TARGET_W, TARGET_H]);

  const hasWallpaper = Boolean(wallpaperUrl && wallpaperUrl.trim().length > 0);
  const wallpaperStyle = hasWallpaper
    ? {
        backgroundImage: `url('${wallpaperUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  // ── 1. Kiểu dáng cổ điển (Touch ID bezel) ──
  if (preset.chassis === "iphone_classic") {
    const topBezelH = preset.topBezelHeight ?? 72;
    const botBezelH = preset.bottomBezelHeight ?? 72;

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden p-0",
          className,
        )}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: `${TARGET_W * scale}px`,
            height: `${TARGET_H * scale}px`,
          }}
        >
          <div
            data-iphone-frame="true"
            data-model-id={preset.id}
            data-bezel-kind={preset.bezelKind}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              width: `${TARGET_W}px`,
              height: `${TARGET_H}px`,
              borderRadius: frameless ? "8px" : `${preset.borderRadius}px`,
            }}
            className={cn(
              "relative transition-transform duration-75 flex flex-col items-center shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] shrink-0 no-scrollbar",
              frameless
                ? "bg-black border border-white/20 h-auto"
                : "bg-[#D8D8DC] pt-3 pb-3 px-[20px] border-[2.5px] border-[#A1A1A6] ring-1 ring-black/25 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_25px_60px_rgba(0,0,0,0.6)]",
            )}
          >
            {!frameless && (
              <>
                {/* Top Bezel: Cảm biến tiệm cận, Camera trước & Loa thoại */}
                <div
                  style={{ height: `${topBezelH}px` }}
                  className="w-full flex flex-col items-center justify-center shrink-0 relative"
                >
                  <div className="size-1.5 rounded-full bg-[#3F3F46] opacity-80 mb-2 shadow-inner" />
                  <div className="flex items-center justify-center relative w-full">
                    <div className="absolute left-1/2 -translate-x-14 size-3 rounded-full bg-[#27272A] border border-black/30 shadow-inner flex items-center justify-center">
                      <div className="size-1 rounded-full bg-[#0369a1]/60" />
                    </div>
                    <div className="w-14 h-1.5 rounded-full bg-[#52525B] border border-black/30 shadow-inner" />
                  </div>
                </div>
                <div
                  style={{ borderRadius: `${preset.borderRadius}px` }}
                  className="absolute inset-0 pointer-events-none border border-white/40 shadow-[inset_0_0_3px_rgba(0,0,0,0.1)]"
                />
              </>
            )}

            {/* SCREEN CONTAINER: Nền trung tính khi không có ảnh nền */}
            <div
              data-phone-screen="true"
              style={{
                width: `${preset.screenW}px`,
                height: `${preset.screenH}px`,
                ...wallpaperStyle,
              }}
              className={cn(
                "relative max-w-full shrink-0 overflow-hidden flex flex-col no-scrollbar",
                hasWallpaper
                  ? "bg-cover bg-center"
                  : "bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white",
                !frameless && "rounded-lg border border-black/50 shadow-inner",
              )}
            >
              {children}
            </div>

            {/* Dải thẻ mã chứng cứ nổi bên ngoài viền phải điện thoại */}
            <EvidenceSideAnchors />

            {!frameless && preset.hasPhysicalHomeButton && (
              /* Bottom Bezel: Physical Home Button (Touch ID) */
              <div
                style={{ height: `${botBezelH}px` }}
                className="w-full flex items-center justify-center shrink-0"
              >
                <button
                  type="button"
                  data-touch-id-btn="true"
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

  // ── 2. Kiểu dáng hiện đại (Tai thỏ Notch hoặc Dynamic Island) ──
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden p-0",
        className,
      )}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: `${TARGET_W * scale}px`,
          height: `${TARGET_H * scale}px`,
        }}
      >
        <div
          data-iphone-frame="true"
          data-model-id={preset.id}
          data-bezel-kind={preset.bezelKind}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            width: `${TARGET_W}px`,
            height: `${TARGET_H}px`,
            borderRadius: `${preset.borderRadius}px`,
          }}
          className="relative transition-transform duration-75 flex flex-col items-center shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] shrink-0 bg-[#1C1C1E] rounded-[52px] p-[10px] border-[3px] border-[#38383A] ring-1 ring-white/10"
        >
          {/* Dynamic Island Pill hoặc Notch Tai Thỏ */}
          {preset.bezelKind === "dynamic_island" ? (
            <div
              data-dynamic-island="true"
              className="absolute top-[16px] left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-between px-3 border border-white/5 shadow-md"
            >
              <div className="size-2.5 rounded-full bg-[#09090b] border border-[#27272a]" />
              <div className="size-2 rounded-full bg-[#1e293b]" />
            </div>
          ) : preset.bezelKind === "notch" ? (
            <div
              data-notch="true"
              className="absolute top-[10px] left-1/2 -translate-x-1/2 w-36 h-6 bg-black rounded-b-2xl z-40 flex items-center justify-center border-b border-x border-white/5 shadow-md"
            >
              <div className="w-12 h-1 rounded-full bg-[#27272a] mb-1" />
              <div className="size-2.5 rounded-full bg-[#09090b] border border-[#27272a] absolute right-4 top-1.5" />
            </div>
          ) : null}

          {/* Screen Content: Viền trong bo cong, nền trung tính khi thiếu wallpaper */}
          <div
            data-phone-screen="true"
            style={{
              borderRadius: `${preset.screenRadius}px`,
              ...wallpaperStyle,
            }}
            className={cn(
              "relative w-full h-full overflow-hidden flex flex-col",
              hasWallpaper
                ? "bg-cover bg-center"
                : "bg-gradient-to-b from-slate-900 via-zinc-950 to-black text-white",
            )}
          >
            {children}

            {/* Bottom Home Indicator Bar */}
            {preset.hasHomeIndicator && (
              <div className="absolute bottom-1 left-0 right-0 h-6 flex items-center justify-center z-40 pointer-events-auto">
                <button
                  type="button"
                  onClick={onHomePress}
                  className="w-32 h-1 bg-white/60 hover:bg-white active:scale-95 transition-all rounded-full cursor-pointer"
                  title="Gạt về màn hình chính"
                />
              </div>
            )}
          </div>

          {/* Dải thẻ mã chứng cứ nổi bên ngoài viền phải điện thoại */}
          <EvidenceSideAnchors />
        </div>
      </div>
    </div>
  );
}

// Legacy exports để giữ tương thích ngược
export function IPhoneClassicChassis(props: ChassisProps) {
  return <DeviceChassis {...props} preset="iphone_classic" />;
}

export function ModernPhoneChassis(props: ChassisProps) {
  return <DeviceChassis {...props} preset="iphone_15" />;
}
