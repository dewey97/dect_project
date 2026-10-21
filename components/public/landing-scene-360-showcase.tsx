"use client";

import React, { useEffect, useRef, useState } from "react";

const PANORAMA = "/images/cases/case_000/PANORAMA.webp";

const KEYHOLE_CIRCLE = { cy: -42, r: 34 };
const KEYHOLE_SLOT =
  "M -16 -12 L -30 94 Q -30 112 -13 112 L 13 112 Q 30 112 30 94 L 16 -12 Z";
const PLATE_R = 118;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function LandingScene360Showcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [dims, setDims] = useState({ w: 1440, h: 900 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const recalc = () =>
      setDims({ w: window.innerWidth, h: window.innerHeight });
    recalc();

    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.clientHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      setProgress(clamp01(-rect.top / scrollable));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", recalc, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", recalc);
    };
  }, [reduced]);

  // Reduced motion: show the room already unlocked, no scroll hijack.
  const p = reduced ? 0.88 : progress;

  // ── Zoom curve ────────────────────────────────────
  // t: 0 → plate at rest, 1 → aperture wider than the viewport.
  const t = clamp01((p - 0.02) / 0.96);
  const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const { w, h } = dims;

  // Plate starts at a comfortable on-screen size…
  const scaleStart = Math.max(
    0.45,
    Math.min(1.3, (Math.min(w, h) * 0.16) / PLATE_R),
  );
  // …and must end with the trapezoid slot just wider than the screen.
  // Half-width of the slot at mid-height is ~17 keyhole units, so w/34
  // plus a small safety margin clears the viewport without wasting scroll.
  const scaleEnd = Math.max(scaleStart * 1.5, (w / 34) * 1.08);
  // Exponential interpolation keeps the perceived zoom speed constant.
  const scale = scaleStart * Math.pow(scaleEnd / scaleStart, eased);

  // Local viewport in keyhole units (the darkness rect lives inside the
  // same scaled group, so it has to be drawn this large).
  const localW = w / scale;
  const localH = h / scale;
  const maskSpan = Math.max(localW, localH) / 2 + 420;
  // Once the plate is larger than the viewport its bevel rings would float
  // over the revealed scene — fade the hardware out before that happens.
  const plateOpacity = 1 - clamp01((eased - 0.6) / 0.18);

  // ── Scene behind the lock ─────────────────────────
  const sceneScale = 1.06 + eased * 0.72;
  const scrimOpacity = 0.62 * (1 - eased);
  const sceneBrightness = 0.72 + eased * 0.36;

  // ── UI chrome ─────────────────────────────────────
  const headerOpacity = p < 0.16 ? 1 : clamp01(1 - (p - 0.16) / 0.12);
  const hintOpacity =
    p < 0.86
      ? p < 0.06
        ? 0
        : Math.min(1, (p - 0.06) / 0.08)
      : clamp01(1 - (p - 0.86) / 0.08);
  const ctaOpacity = clamp01((p - 0.8) / 0.12);

  return (
    <section
      ref={sectionRef}
      id="hien-truong-360"
      aria-label="Hiện trường vụ án 000 — nhìn qua ổ khoá"
      className={
        reduced ? "relative h-[100dvh] w-full" : "relative h-[340vh] w-full"
      }
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-[#070503] select-none">
        {/* ── Layer 1: crime scene panorama (zooms in behind the lock) ── */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              backgroundImage: `url(${PANORAMA})`,
              backgroundSize: "cover",
              backgroundPosition: "50% 46%",
              backgroundRepeat: "no-repeat",
              transform: `scale(${sceneScale})`,
              filter: `brightness(${sceneBrightness}) contrast(1.06) saturate(0.9)`,
            }}
          />
          {/* Dark scrim: fades as we push through the slot */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#070503]"
            style={{ opacity: scrimOpacity }}
          />
        </div>

        {/* ── Layer 2: keyhole plate + darkness with a real aperture ── */}
        <svg
          className="absolute inset-0 z-20 h-full w-full pointer-events-none"
          viewBox={`0 0 ${w} ${h}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="kh-brass"
              x1={-PLATE_R}
              y1={-PLATE_R}
              x2={PLATE_R}
              y2={PLATE_R}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#f8e3ae" />
              <stop offset="0.18" stopColor="#c79a55" />
              <stop offset="0.38" stopColor="#7d5524" />
              <stop offset="0.55" stopColor="#e7c37c" />
              <stop offset="0.72" stopColor="#6b4519" />
              <stop offset="0.88" stopColor="#cfa25c" />
              <stop offset="1" stopColor="#8a5f28" />
            </linearGradient>
            <radialGradient id="kh-patina" cx="42%" cy="36%" r="66%">
              <stop offset="0" stopColor="#fff2cd" stopOpacity="0.28" />
              <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="1" stopColor="#1b1004" stopOpacity="0.55" />
            </radialGradient>
            <radialGradient id="kh-screw" cx="35%" cy="30%" r="75%">
              <stop offset="0" stopColor="#f4dc9f" />
              <stop offset="0.6" stopColor="#a97c3d" />
              <stop offset="1" stopColor="#4a2f10" />
            </radialGradient>
            <filter
              id="kh-hole-soft"
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
            <filter
              id="kh-plate-shadow"
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="12" />
            </filter>
            <filter
              id="kh-slot-glow"
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur stdDeviation="10" />
            </filter>

            <mask
              id="kh-aperture"
              maskUnits="userSpaceOnUse"
              x={-maskSpan}
              y={-maskSpan}
              width={maskSpan * 2}
              height={maskSpan * 2}
            >
              <rect
                x={-maskSpan}
                y={-maskSpan}
                width={maskSpan * 2}
                height={maskSpan * 2}
                fill="white"
              />
              <circle
                cx={0}
                cy={KEYHOLE_CIRCLE.cy}
                r={KEYHOLE_CIRCLE.r}
                fill="black"
                filter="url(#kh-hole-soft)"
              />
              <path d={KEYHOLE_SLOT} fill="black" filter="url(#kh-hole-soft)" />
            </mask>
          </defs>

          <g transform={`translate(${w / 2} ${h / 2}) scale(${scale})`}>
            {/* Darkness around the plate. Its hole is the actual aperture. */}
            <rect
              x={-localW / 2}
              y={-localH / 2}
              width={localW}
              height={localH}
              fill="#070503"
              mask="url(#kh-aperture)"
            />

            {/* Hardware (glow, plate, cut bevel) fades as we pass through it */}
            <g opacity={plateOpacity}>
            {/* Warm light bleeding through the slot onto the plate */}
            <path
              d={KEYHOLE_SLOT}
              fill="none"
              stroke="#f6c877"
              strokeWidth={7}
              opacity={0.22}
              filter="url(#kh-slot-glow)"
            />
            <circle
              cx={0}
              cy={KEYHOLE_CIRCLE.cy}
              r={KEYHOLE_CIRCLE.r}
              fill="none"
              stroke="#f6c877"
              strokeWidth={5}
              opacity={0.18}
              filter="url(#kh-slot-glow)"
            />

            {/* Brass escutcheon — masked by the same aperture, so the cut is exact */}
            <g mask="url(#kh-aperture)">
              <circle
                r={PLATE_R + 8}
                fill="#000"
                opacity={0.55}
                filter="url(#kh-plate-shadow)"
              />
              <circle r={PLATE_R} fill="url(#kh-brass)" />
              <circle r={PLATE_R} fill="url(#kh-patina)" />

              {/* Bevels — non-scaling so they stay a crisp rim at any zoom */}
              <circle
                r={PLATE_R - 2}
                fill="none"
                stroke="#201305"
                strokeWidth={5}
                opacity={0.85}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                r={PLATE_R - 7}
                fill="none"
                stroke="#ffe7ae"
                strokeWidth={1.4}
                opacity={0.5}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                r={PLATE_R - 16}
                fill="none"
                stroke="#2c1b09"
                strokeWidth={1.6}
                opacity={0.55}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                r={PLATE_R - 17}
                fill="none"
                stroke="#f3d392"
                strokeWidth={1}
                opacity={0.28}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                r={PLATE_R - 27}
                fill="none"
                stroke="#3a250d"
                strokeWidth={1}
                opacity={0.45}
                strokeDasharray="1 7"
                vectorEffect="non-scaling-stroke"
              />

              {/* Specular sweep */}
              <path
                d="M -98 -38 A 105 105 0 0 1 34 -100"
                fill="none"
                stroke="#fff6d8"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0.32}
              />

              {/* Patina speckles */}
              <circle cx={-58} cy={62} r={13} fill="#1d2a16" opacity={0.12} />
              <circle cx={72} cy={-52} r={9} fill="#1d2a16" opacity={0.1} />
              <circle cx={-84} cy={-18} r={6} fill="#0f1a10" opacity={0.1} />

              {/* Screws */}
              {[
                [-74, -74, 45],
                [74, -74, -45],
                [-74, 74, -45],
                [74, 74, 45],
              ].map(([sx, sy, rot]) => (
                <g
                  key={`${sx}-${sy}`}
                  transform={`translate(${sx} ${sy}) rotate(${rot})`}
                >
                  <circle
                    r={9.5}
                    fill="url(#kh-screw)"
                    stroke="#2a1a08"
                    strokeWidth={1}
                  />
                  <rect
                    x={-7}
                    y={-1.1}
                    width={14}
                    height={2.2}
                    rx={1}
                    fill="#2a1a08"
                    opacity={0.85}
                  />
                </g>
              ))}
            </g>

            {/* Cut edge: dark inner bevel + lit lip */}
            <circle
              cx={0}
              cy={KEYHOLE_CIRCLE.cy}
              r={KEYHOLE_CIRCLE.r}
              fill="none"
              stroke="#160d03"
              strokeWidth={4}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={KEYHOLE_SLOT}
              fill="none"
              stroke="#160d03"
              strokeWidth={4}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={0}
              cy={KEYHOLE_CIRCLE.cy}
              r={KEYHOLE_CIRCLE.r + 2.4}
              fill="none"
              stroke="#ffe1a0"
              strokeWidth={1.1}
              opacity={0.45}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={KEYHOLE_SLOT}
              fill="none"
              stroke="#ffe1a0"
              strokeWidth={1.1}
              opacity={0.38}
              transform="translate(0 -1.6)"
              vectorEffect="non-scaling-stroke"
            />
            </g>
          </g>
        </svg>

        {/* ── Layer 3: vignette ── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(5,4,3,0.55) 100%)",
          }}
        />

        {/* ── Layer 4: header badge ── */}
        <div
          className="absolute top-[4.25rem] sm:top-20 inset-x-0 z-40 flex flex-col items-center text-center pointer-events-none px-4"
          style={{ opacity: headerOpacity }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-red-500/25 bg-black/60 backdrop-blur-sm text-red-400 font-mono text-[0.6rem] font-bold tracking-[0.2em] uppercase">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
            Vụ Án #000 — Hiện Trường Phòng Làm Việc Tầng 2
          </div>
        </div>

        {/* ── Layer 5: scroll hint ── */}
        <div
          className="absolute bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4"
          style={{ opacity: hintOpacity }}
        >
          <span className="font-mono text-[0.58rem] text-amber-100/50 uppercase tracking-[0.24em]">
            {p < 0.04 ? "Nhìn qua ổ khoá…" : "Cuộn để tiến vào hiện trường ↓"}
          </span>
        </div>

        {/* ── Layer 6: CTA once inside ── */}
        <div
          className="absolute bottom-16 sm:bottom-20 inset-x-0 z-40 flex flex-col items-center gap-3 px-4"
          style={{
            opacity: ctaOpacity,
            pointerEvents: ctaOpacity > 0.5 ? "auto" : "none",
          }}
        >
          <p className="max-w-md text-center text-[0.72rem] sm:text-xs text-zinc-300/80 font-mono tracking-wide">
            Bạn đang đứng giữa hiện trường. Mọi chi tiết đều có thể là manh mối.
          </p>
          <a
            href="/evidence/boardgame"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs font-bold tracking-widest uppercase transition-colors duration-200"
          >
            Khám Phá Toàn Bộ Hiện Trường →
          </a>
        </div>
      </div>
    </section>
  );
}
