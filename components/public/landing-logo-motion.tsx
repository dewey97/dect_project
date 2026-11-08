"use client";

import React from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

interface LandingLogoMotionProps {
  /**
   * Progress of the logo animation (0 to 1).
   * 0.0 - 0.20: Glass zooms out from inside the Yellow X.
   * 0.20 - 0.70: Glass sweeps rightward from X to O, revealing P, L, then R, E.
   * 0.70 - 1.00: Full logo is settled, "Có Gì?" reveals with subtle amber glow.
   */
  progress: MotionValue<number>;
  className?: string;
}

export function LandingLogoMotion({ progress, className }: LandingLogoMotionProps) {
  // 1. Magnifying Glass Scale: zooms out / lifts forward, then settles down
  const glassScale = useTransform(progress, [0, 0.18, 0.65, 0.85], [1.0, 1.32, 1.25, 1.0]);

  // 2. Magnifying Glass Translation (percentage of logo width):
  // -48.163% places the glass directly over the center of the Yellow X
  // 0% places the glass at its exact home position (letter O) in the official logo
  const glassX = useTransform(progress, [0.18, 0.7], ["-48.163%", "0%"]);

  // Subtle vertical bounce/glide during the sweep
  const glassY = useTransform(
    progress,
    [0, 0.18, 0.45, 0.7, 0.85],
    ["6%", "0%", "-3%", "0%", "0%"]
  );

  // Optical sheen & glow around the moving magnifying glass lens
  const glassGlowOpacity = useTransform(progress, [0.1, 0.25, 0.65, 0.85], [0, 0.85, 0.85, 0]);

  // 3. Letters Reveal Clip-Path (P, L, R, E) tracking right behind the glass sweep
  // At progress 0.2: 0% revealed (inset from right 100%)
  // At progress 0.75: 100% revealed (inset from right 0%)
  const lettersClipRight = useTransform(progress, [0.22, 0.75], ["100%", "0%"]);

  // 4. "Có Gì?" text reveal after XPLORE is complete
  const coGiOpacity = useTransform(progress, [0.7, 0.95], [0, 1]);
  const coGiY = useTransform(progress, [0.7, 0.95], [14, 0]);

  return (
    <div className={`relative flex flex-col items-start select-none ${className || ""}`}>
      {/* ========================================================================= */}
      {/* LOGO CONTAINER: Maintains exact 980x250 aspect ratio (3.92 : 1)            */}
      {/* ========================================================================= */}
      <div className="relative w-[240px] sm:w-[280px] lg:w-[320px] aspect-[980/250] overflow-visible">
        {/* Layer 1: The Yellow X (Base anchor on the left) */}
        <img
          src="/brand/logo_x_layer.png"
          alt="XPLORE X"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_0_24px_rgba(245,158,11,0.2)]"
          draggable={false}
        />

        {/* Layer 2: The Letters (P, L, R, E) revealed dynamically by the sweep */}
        <motion.div
          style={{
            clipPath: useTransform(lettersClipRight, (v) => `inset(0 ${v} 0 0)`),
          }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <img
            src="/brand/logo_letters_layer.png"
            alt="XPLORE letters"
            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.12)]"
            draggable={false}
          />
        </motion.div>

        {/* Layer 3: The Animated Magnifying Glass */}
        <motion.div
          style={{
            x: glassX,
            y: glassY,
            scale: glassScale,
          }}
          className="absolute inset-0 w-full h-full pointer-events-none origin-[62.04%_44%] will-change-transform"
        >
          {/* Glass Image Layer */}
          <img
            src="/brand/logo_glass_layer.png"
            alt="XPLORE Magnifying Glass"
            className="w-full h-full object-contain"
            draggable={false}
          />

          {/* Forensic Light Glare behind the lens during travel */}
          <motion.div
            style={{ opacity: glassGlowOpacity }}
            className="absolute top-[18%] left-[53%] w-[26%] h-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/30 blur-md pointer-events-none mix-blend-screen"
          />
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* TEXT: "CÓ GÌ ĐẶC BIỆT?" REVEALS UNDERNEATH OR ALONGSIDE                    */}
      {/* ========================================================================= */}
      <motion.div
        style={{
          opacity: coGiOpacity,
          y: coGiY,
        }}
        className="mt-2.5 sm:mt-3 flex items-center will-change-transform"
      >
        <span className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-foreground tracking-tight font-sans whitespace-nowrap">
          Có Gì Đặc Biệt?
        </span>
      </motion.div>
    </div>
  );
}
