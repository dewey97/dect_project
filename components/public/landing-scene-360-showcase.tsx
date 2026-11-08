"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  CAMERA_FOV,
  REST_DISTANCE,
  SLOT_CX,
  SLOT_CY,
  SLOT_PATH,
} from "./landing-keyhole-geometry";

// three.js / R3F chỉ tải sau khi trang đã hydrate, không nằm trong bundle đầu.
const LandingKeyholeModel = dynamic(
  () => import("./landing-keyhole-model").then((m) => m.LandingKeyholeModel),
  { ssr: false },
);
const LandingMagnifierModel = dynamic(
  () => import("./landing-magnifier-model").then((m) => m.LandingMagnifierModel),
  { ssr: false },
);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const PANORAMA = "/images/cases/case_000/PANORAMA.webp";

export function LandingScene360Showcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

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
      const viewportH = window.innerHeight;
      const start = viewportH * 0.85;
      const end = viewportH * 0.25;
      const p = (start - rect.top) / (start - end);
      setProgress(clamp01(p));
      if (portalRef.current) {
        const portalRect = portalRef.current.getBoundingClientRect();
        setSize({ w: portalRect.width, h: portalRect.height });
      } else {
        setSize({ w: window.innerWidth, h: window.innerHeight });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Normalized mouse offset from screen center (-1 to +1)
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setMouse({
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    handleScroll();

    let ro: ResizeObserver | null = null;
    if (portalRef.current) {
      ro = new ResizeObserver(() => {
        if (portalRef.current) {
          const rect = portalRef.current.getBoundingClientRect();
          setSize({ w: rect.width, h: rect.height });
        }
      });
      ro.observe(portalRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      if (ro) ro.disconnect();
    };
  }, [reduced]);

  // Reduced motion: already inside the room, no scroll hijack.
  const p = reduced ? 0.92 : progress;

  // Head-on straight view from the start (no top-down tilt)
  const pitch = 0;
  const lookY = 0;

  // Deep camera dolly straight into and through the 3D keyway tunnel into the room
  const zoomRaw = clamp01(p / 0.88);
  const eased =
    zoomRaw < 0.5
      ? 4 * zoomRaw * zoomRaw * zoomRaw
      : 1 - Math.pow(-2 * zoomRaw + 2, 3) / 2;

  // Approach distance from outside down to entrance lip (5.2 -> 0.02)
  const approach = REST_DISTANCE * Math.pow(0.02 / REST_DISTANCE, eased);
  // Physical travel into and through the brass tunnel (depth 0.40, entering inside at p > 0.62)
  const tunnelProgress = clamp01((p - 0.62) / 0.38);
  const tunnelDepth = 0.40 * Math.pow(tunnelProgress, 1.4);
  const distance = approach - tunnelDepth;
  const brightness = 0.45 + eased * 0.65;

  // The 3D solid brass lock NEVER fades; camera flies straight through the physical keyway opening
  const modelOpacity = 1;

  // Deep optical room zoom: from a peephole view to full immersive room scale
  const roomScale =
    1.12 + Math.pow(eased, 1.8) * 3.8 + clamp01((p - 0.68) / 0.32) * 1.2;

  // Follow up by opening the black surround into full 360 panorama view
  const maskOpacity = 1 - clamp01((p - 0.72) / 0.22);
  const portalRadius = size.w > 0 ? size.w / 2 : 240;

  // Blow the aperture open around the screen centre as camera enters and passes through
  const apertureBurst = Math.pow(clamp01((p - 0.62) / 0.38), 2.2);
  const maskSpread = 1 + apertureBurst * 18.0;

  // Dynamic optical depth-of-field: as camera approaches the keyhole,
  // the metal rim blurs and dissolves smoothly, removing harsh cut edges.
  const blurAmount = 2.0 + clamp01(p / 0.7) * 14;

  // Project the slot through the head-on camera onto the viewport,
  // compensating subtly with mouse parallax to track the 3D lock's tilt.
  const { w, h } = size;
  let maskPath = "";
  if (w > 0 && h > 0) {
    const focal = h / (2 * Math.tan((CAMERA_FOV * Math.PI) / 360));
    const mouseWeight = Math.max(0, Math.min(1, (distance - 0.15) / 1.2));
    const mx = mouse.x * mouseWeight;
    const my = mouse.y * mouseWeight;
    const effDepth = Math.max(0.015, distance);
    const pts = SLOT_PATH.map(([x, y]) => {
      const px = x - SLOT_CX;
      const py = y - SLOT_CY;
      const sx = w / 2 + ((focal * px) / effDepth) * maskSpread + mx * 28;
      const sy = h / 2 - ((focal * py) / effDepth) * maskSpread + my * 22;
      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
    });
    maskPath = `M${pts.join("L")}Z`;
  }

  return (
    <div
      ref={sectionRef}
      id="hien-truong-360"
      aria-label="Hiện trường vụ án 000 — không gian 360 độ"
      className="relative w-full rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/20 via-zinc-900/60 to-zinc-950/80 p-5 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 hover:border-cyan-500/40 select-none"
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Right Column: Story / Context (Mobile: order-1, Desktop: order-2) */}
        <div className="flex flex-col items-start text-left gap-3 max-w-lg z-10 order-1 md:order-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-cyan-200 font-sans">
              Hiện Trường 360°
            </h3>
            <span className="text-[0.68rem] font-mono text-cyan-400/70 uppercase tracking-wider">
              Khám nghiệm hiện trường phòng kín khóa trái
            </span>
          </div>

          <p className="text-xs sm:text-[0.84rem] text-muted-foreground font-sans leading-relaxed">
            Căn phòng án mạng bị khóa trái từ bên trong. Ghé mắt nhìn vào không gian hiện trường 360 độ: xoay chuyển góc nhìn, soi tìm từng vết máu ẩn và lật mở cơ chế phòng kín bí ẩn.
          </p>
        </div>

        {/* Left Column: Detective Magnifying Glass Stage (Mobile: order-2, Desktop: order-1) */}
        <div className="relative w-full flex items-center justify-center md:justify-start py-2 order-2 md:order-1">
            <div
              className="relative transition-transform duration-150 ease-out"
              style={{
                transform: `translate(${mouse.x * 16}px, ${mouse.y * 12}px)`,
              }}
            >
              {/* 1. Circular Magnifying Glass Lens Portal (Khung nhìn tròn qua thấu kính) */}
              <div
                ref={portalRef}
                className="relative z-10 w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] lg:w-[390px] lg:h-[390px] xl:w-[420px] xl:h-[420px] rounded-full overflow-hidden bg-[#070503]"
                style={{
                  boxShadow: "0 0 50px rgba(245,158,11,0.12)",
                }}
              >
                {/* Room seen through the keyway with interactive optical peephole parallax */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-0 transition-transform duration-100 ease-out"
                  style={{
                    backgroundImage: `url(${PANORAMA})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transform: `scale(${roomScale}) translate(${mouse.x * -72}px, ${mouse.y * -52}px)`,
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
                  mouseX={mouse.x}
                  mouseY={mouse.y}
                  zoomProgress={zoomRaw}
                />

                {/* Glass Glare Sheen Reflection (Vệt phản quang mặt kính quang học) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full z-25 transition-transform duration-100 ease-out"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 32%, transparent 48%, rgba(245,158,11,0.07) 100%)",
                    transform: `translate(${mouse.x * 20}px, ${mouse.y * 16}px)`,
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
              <LandingMagnifierModel
                portalRadius={portalRadius}
                mouseX={mouse.x}
                mouseY={mouse.y}
              />
            </div>
          </div>
        </div>
      </div>
  );
}
