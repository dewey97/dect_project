"use client";

import React from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

interface LandingLogoMotionProps {
  /**
   * Progress of the logo animation (0 to 1).
   * 0.00 - 0.15: Hold the app emblem — glass centred on the Yellow X, emblem size, cut-out stroke.
   * 0.15 - 0.60: Glass travels from the X to its home slot (letter O), growing to wordmark size;
   *              P and L are pulled out behind it while the whole mark slides from centre to left.
   * 0.60 - 0.75: R and E are pulled out, wordmark settles.
   * 0.75 - 0.95: "Có Gì Đặc Biệt?" reveals.
   */
  progress: MotionValue<number>;
  className?: string;
}

/*
 * Geometry (980x250 wordmark space, measured from public/brand/logo_*_layer.png
 * and the app emblem public/brand/logo-x.png):
 * - Yellow X: x 0..272, y 7..243 → centre (136, 125).
 * - Glass home (letter O): ring centre (597.5, 124), outer radius 77, ring width 15.5.
 * - Emblem: glass centred on X centre, scale 0.79 of home size,
 *   background-coloured stroke ≈ 0.8 × ring width around ring + handle.
 */
const GLASS_CX = 597.5;
const GLASS_CY = 124;
const EMBLEM_SCALE = 0.79;
const EMBLEM_SHIFT = `${(((136.5 - GLASS_CX) / 980) * 100).toFixed(3)}%`; // glass → X centre
const CENTER_SHIFT = `${(((980 - 272) / 2 / 980) * 100).toFixed(3)}%`; // X → container centre

const RING_R = 69.25;
const RING_W = 15.5;
const HANDLE_W = 24;
const STROKE = 12.5;
const HANDLE = { x1: 650, y1: 176.5, x2: 703, y2: 230 };

function arc(r: number, from: number, to: number) {
  const p = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(GLASS_CX + r * Math.cos(a)).toFixed(2)} ${(GLASS_CY + r * Math.sin(a)).toFixed(2)}`;
  };
  return `M ${p(from)} A ${r} ${r} 0 0 1 ${p(to)}`;
}

const GLINT_TOP = arc(50, -122, -72);
const GLINT_SIDE = arc(50, -50, -24);

export function LandingLogoMotion({
  progress,
  className,
}: LandingLogoMotionProps) {
  // Whole mark: emblem starts centred, slides back to its left-aligned home while letters pull out.
  const markX = useTransform(progress, [0.15, 0.75], [CENTER_SHIFT, "0%"]);

  // Glass: emblem slot on X → home slot on O.
  const glassX = useTransform(progress, [0.15, 0.6], [EMBLEM_SHIFT, "0%"]);
  const glassScale = useTransform(progress, [0.15, 0.6], [EMBLEM_SCALE, 1]);

  // Letters pulled out trailing the glass' right edge, then the rest (R, E).
  const lettersClipRight = useTransform(
    progress,
    [0.15, 0.6, 0.75],
    ["80%", "31.2%", "0%"],
  );
  const lettersClip = useTransform(
    lettersClipRight,
    (v) => `inset(0 ${v} 0 0)`,
  );

  const coGiOpacity = useTransform(progress, [0.75, 0.95], [0, 1]);
  const coGiY = useTransform(progress, [0.75, 0.95], [14, 0]);

  return (
    <div
      className={`relative flex flex-col items-start select-none ${className || ""}`}
    >
      <motion.div
        style={{ x: markX }}
        className="relative w-[240px] sm:w-[280px] lg:w-[320px] aspect-[980/250] overflow-visible will-change-transform"
        role="img"
        aria-label="XPLORE"
      >
        {/* Layer 1: Yellow X */}
        <img
          src="/brand/logo_x_layer.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          draggable={false}
        />

        {/* Layer 2: Letters P L R E, pulled out behind the glass */}
        <motion.img
          src="/brand/logo_letters_layer.png"
          alt=""
          style={{ clipPath: lettersClip }}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          draggable={false}
        />

        {/* Layer 3: Magnifying glass (vector) with background-coloured cut-out stroke */}
        <motion.div
          // origin = glass ring centre so scaling keeps it locked on the X / O centre
          style={{
            x: glassX,
            scale: glassScale,
            originX: GLASS_CX / 980,
            originY: GLASS_CY / 250,
          }}
          className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
        >
          <svg
            viewBox="0 0 980 250"
            className="w-full h-full overflow-visible"
            aria-hidden="true"
          >
            {/* Stroke: same shapes, wider, in page background colour (emblem cut-out) */}
            <g stroke="var(--background)" fill="none" strokeLinecap="round">
              <circle
                cx={GLASS_CX}
                cy={GLASS_CY}
                r={RING_R}
                fill="var(--background)"
                strokeWidth={RING_W + STROKE * 2}
              />
              <line {...HANDLE} strokeWidth={HANDLE_W + STROKE * 2} />
            </g>
            {/* Glass */}
            <g stroke="#dbdbdb" fill="none" strokeLinecap="round">
              <line {...HANDLE} strokeWidth={HANDLE_W} />
              <circle
                cx={GLASS_CX}
                cy={GLASS_CY}
                r={RING_R}
                strokeWidth={RING_W}
              />
              <path d={GLINT_TOP} strokeWidth={8} />
              <path d={GLINT_SIDE} strokeWidth={8} />
            </g>
          </svg>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: coGiOpacity, y: coGiY }}
        className="mt-2.5 sm:mt-3 flex items-center will-change-transform"
      >
        <span className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-foreground tracking-tight font-sans whitespace-nowrap">
          Có Gì Đặc Biệt?
        </span>
      </motion.div>
    </div>
  );
}
