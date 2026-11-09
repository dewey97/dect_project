"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { EvidenceMarker } from "./evidence-marker";

// three.js / R3F chỉ tải sau khi trang đã hydrate, không nằm trong bundle đầu.
const LandingMagnifierModel = dynamic(
  () => import("./landing-magnifier-model").then((m) => m.LandingMagnifierModel),
  { ssr: false },
);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const PANORAMA = "/images/cases/case_000/PANORAMA.webp";
const LandingLensPanorama = dynamic(
  () => import("./landing-lens-panorama").then((m) => m.LandingLensPanorama),
  { ssr: false },
);
// View direction that frames the room when the mouse is at screen centre.
const BASE_LON = 0;

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
      const viewportH = window.innerHeight;
      // Gentle zoom while the lens travels from fully on screen up to the header.
      const lens = (portalRef.current ?? el).getBoundingClientRect();
      const start = viewportH - lens.height - 24;
      const end = Math.min(start - 1, viewportH * 0.06);
      const p = (start - lens.top) / (start - end);
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

  // Reduced motion: fixed framing, no scroll-driven zoom.
  const p = reduced ? 0.5 : progress;

  // Static still shown until the 360° texture is ready (no black lens while loading).
  const roomScale = 1.1 + p * 0.35;
  const brightness = 0.85;
  // 360° view: mouse sweeps across the screen width = one full turn; scroll pushes in (FOV 85° -> 65°).
  const panoLon = BASE_LON + mouse.x * 180;
  const panoLat = -mouse.y * 30;
  const panoFov = 85 - p * 20;
  const portalRadius = size.w > 0 ? size.w / 2 : 240;

  return (
    <div
      ref={sectionRef}
      id="hien-truong-360"
      aria-label="Hiện trường vụ án 000 — không gian 360 độ"
      className="relative w-full pt-6 sm:pt-8 select-none"
    >
      <div className="w-full flex flex-col gap-4 sm:gap-5">
        {/* Story / Context */}
        <div className="flex flex-col items-start text-left gap-3 max-w-lg z-10 order-1">
          <div>
            <div className="flex items-end gap-3">
              <EvidenceMarker n={2} className="shrink-0 rotate-[5deg]" />
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-200 font-sans">
                Hiện trường 360°
              </h3>
            </div>
          </div>

        </div>

        {/* Detective Magnifying Glass Stage */}
        <div className="relative w-full flex items-center justify-center md:justify-start py-2 order-2">
            <div
              className="relative transition-transform duration-150 ease-out"
              style={{
                transform: `translate(${mouse.x * 16}px, ${mouse.y * 12}px)`,
              }}
            >
              {/* 1. Circular Magnifying Glass Lens Portal (Khung nhìn tròn qua thấu kính) */}
              <div
                ref={portalRef}
                className="relative z-10 w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[270px] lg:h-[270px] xl:w-[320px] xl:h-[320px] rounded-full overflow-hidden bg-[#070503]"
                style={{
                  boxShadow: "0 0 50px rgba(245,158,11,0.12)",
                }}
              >
                {/* Crime-scene room seen through the lens, with optical parallax */}
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

                {/* Real 360° panorama, rotated by the mouse */}
                <div aria-hidden="true" className="absolute inset-0 z-[1]">
                  <LandingLensPanorama
                    src={PANORAMA}
                    lon={panoLon}
                    lat={panoLat}
                    fov={panoFov}
                  />
                </div>

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
