"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CAMERA_FOV,
  END_DISTANCE,
  LandingKeyholeModel,
  PITCH_REST,
  PLATE_DEPTH,
  REST_DISTANCE,
  SLOT_CX,
  SLOT_CY,
  SLOT_PATH,
} from "./landing-keyhole-model";
import { LandingMagnifierModel } from "./landing-magnifier-model";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const PANORAMA = "/images/cases/case_000/PANORAMA.webp";

export function LandingScene360Showcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.clientHeight - window.innerHeight;
      setProgress(scrollable <= 0 ? 0 : clamp01(-rect.top / scrollable));
      if (portalRef.current) {
        const portalRect = portalRef.current.getBoundingClientRect();
        setSize({ w: portalRect.width, h: portalRect.height });
      } else {
        setSize({ w: window.innerWidth, h: window.innerHeight });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [reduced]);

  // Reduced motion: already inside the room, no scroll hijack.
  const p = reduced ? 0.92 : progress;

  // Phase 1 — tilted top view rotates down to a head-on look.
  const rotRaw = clamp01((p - 0.01) / 0.42);
  const rot = rotRaw * rotRaw * (3 - 2 * rotRaw);
  const pitch = PITCH_REST * (1 - rot);
  // Aim slightly below the keyway at rest so the whole escutcheon fits the
  // frame, then re-centre on the keyway before the camera reaches the plate.
  const lookY = -0.3 * (1 - clamp01((p - 0.42) / 0.18));

  // Phase 2 — head-on camera dollies through the keyway.
  const zoomRaw = clamp01((p - 0.46) / 0.5);
  const eased =
    zoomRaw < 0.5
      ? 4 * zoomRaw * zoomRaw * zoomRaw
      : 1 - Math.pow(-2 * zoomRaw + 2, 3) / 2;

  // Exponential dolly keeps the perceived zoom speed constant.
  const distance =
    REST_DISTANCE * Math.pow(END_DISTANCE / REST_DISTANCE, eased);
  const brightness = 0.42 + eased * 0.68;

  // Dissolve the brass plate as camera approaches keyway
  const fadeRaw = clamp01((p - 0.72) / 0.11);
  const modelOpacity = 1 - fadeRaw * fadeRaw * (3 - 2 * fadeRaw);
  // Follow up by opening the black surround
  const maskOpacity = 1 - clamp01((p - 0.87) / 0.08);
  const portalRadius = size.w > 0 ? size.w / 2 : 240;
  // Blow the aperture open around the screen centre
  const maskSpread = 1 + clamp01((p - 0.78) / 0.07) * 2.6;

  // Dynamic optical depth-of-field: as camera approaches the keyhole,
  // the metal rim blurs and dissolves smoothly, removing harsh cut edges.
  const blurAmount = 2.5 + clamp01((p - 0.3) / 0.5) * 14;

  // Project the slot through the live camera onto the viewport.
  const { w, h } = size;
  let maskPath = "";
  if (w > 0 && h > 0) {
    const focal = h / (2 * Math.tan((CAMERA_FOV * Math.PI) / 360));
    const sin = Math.sin(pitch);
    const cos = Math.cos(pitch);
    const pts = SLOT_PATH.map(([x, y]) => {
      const px = x - SLOT_CX;
      const py = y - SLOT_CY - lookY;
      // Camera space: forward (0,-sin,-cos), right (1,0,0), up (0,cos,-sin).
      const depth = distance - sin * py - PLATE_DEPTH * cos;
      const camYp = cos * py - PLATE_DEPTH * sin;
      const sx = w / 2 + ((focal * px) / depth) * maskSpread;
      const sy = h / 2 - ((focal * camYp) / depth) * maskSpread;
      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
    });
    maskPath = `M${pts.join("L")}Z`;
  }

  return (
    <section
      ref={sectionRef}
      id="hien-truong-360"
      aria-label="Hiện trường vụ án 000 — nhìn qua kính lúp thám tử"
      className={
        reduced ? "relative h-[100dvh] w-full" : "relative h-[280vh] w-full"
      }
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-background flex items-center justify-center px-6 sm:px-8 select-none">
        {/* Ambient backlight glow */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-amber-500/[0.05] blur-[160px] pointer-events-none"
        />

        <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center z-10">
          {/* Left Column: Story / Context */}
          <div className="flex flex-col items-start text-left gap-4 max-w-lg">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-foreground tracking-tight font-sans text-balance leading-tight">
              Ánh Mắt Nhìn Thấu Qua Khe Cửa
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-mono leading-relaxed">
              Căn phòng nơi nạn nhân tử vong bị khóa trái từ bên trong. Ghé mắt qua kính lúp quang học để soi chiếu từng góc cạnh hiện trường 360 độ và phát hiện các dấu vết chưa từng được ghi nhận.
            </p>

            {/* Sleek Progress Line */}
            <div className="w-full max-w-xs mt-3 flex flex-col gap-1.5 font-mono">
              <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground tracking-wider uppercase">
                <span>Tiến độ phóng đại kính lúp</span>
                <span className="text-amber-400 font-semibold">{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-zinc-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-150 rounded-full"
                  style={{ width: `${Math.max(2, Math.min(100, progress * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Detective Magnifying Glass Stage */}
          <div className="relative w-full flex items-center justify-center lg:justify-end py-6">
            <div className="relative">
              {/* 1. Circular Magnifying Glass Lens Portal (Khung nhìn tròn qua thấu kính) */}
              <div
                ref={portalRef}
                className="relative z-10 w-[310px] h-[310px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px] xl:w-[520px] xl:h-[520px] rounded-full overflow-hidden bg-[#070503]"
                style={{
                  boxShadow: "0 0 50px rgba(245,158,11,0.12)",
                }}
              >
                {/* Room seen through the keyway */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundImage: `url(${PANORAMA})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transform: `scale(${1.04 + eased * 0.5 + clamp01((p - 0.72) / 0.28) * 0.26})`,
                    filter: `brightness(${brightness}) saturate(1.05)`,
                    willChange: "transform, filter",
                  }}
                />

                {/* Everything outside the projected keyway stays softly shadowed */}
                <svg
                  aria-hidden="true"
                  className="absolute inset-0 z-10 h-full w-full pointer-events-none"
                  viewBox={`0 0 ${Math.max(1, w)} ${Math.max(1, h)}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <filter id="keyhole-soft-blur" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation={blurAmount.toFixed(1)} />
                    </filter>
                    <mask id="keyhole-mask" maskUnits="userSpaceOnUse">
                      <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
                      {maskPath ? (
                        <path
                          d={maskPath}
                          fill="#000"
                          filter="url(#keyhole-soft-blur)"
                        />
                      ) : null}
                    </mask>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="#070503"
                    fillOpacity={maskOpacity}
                    mask="url(#keyhole-mask)"
                  />

                  {/* Subtle light leak / warm amber rim glow around the keyhole opening */}
                  {maskPath && maskOpacity > 0.05 ? (
                    <path
                      d={maskPath}
                      fill="none"
                      stroke="rgba(245, 158, 11, 0.4)"
                      strokeWidth={Math.max(1.5, 3 * (1 - p * 0.8))}
                      opacity={Math.min(1, Math.max(0, 1 - p * 1.2))}
                      style={{ filter: "blur(2.5px)" }}
                    />
                  ) : null}
                </svg>

                <LandingKeyholeModel
                  distance={distance}
                  pitch={pitch}
                  lookY={lookY}
                  opacity={modelOpacity}
                />

                {/* Glass Glare Sheen Reflection (Vệt phản quang mặt kính quang học) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full z-25"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 32%, transparent 48%, rgba(245,158,11,0.06) 100%)",
                  }}
                />

                {/* Cinematic vignette inside the lens */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-30 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, transparent 45%, rgba(5,4,3,0.55) 85%, rgba(0,0,0,0.85) 100%)",
                  }}
                />
              </div>

              {/* 2. Genuine 3D Magnifying Glass Model (Model 3D kính lúp với tay cầm cố định góc dưới trái) */}
              <LandingMagnifierModel portalRadius={portalRadius} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
