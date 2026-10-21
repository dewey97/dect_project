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

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const PANORAMA = "/images/cases/case_000/PANORAMA.webp";

export function LandingScene360Showcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
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
      setSize({ w: window.innerWidth, h: window.innerHeight });
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

  // The keyway narrows mid-way, so its rim can never fill the frame corners.
  // Dissolve the plate as the camera reaches the cut, so no blurry brass
  // wedges linger while the room takes over.
  const fadeRaw = clamp01((p - 0.72) / 0.11);
  const modelOpacity = 1 - fadeRaw * fadeRaw * (3 - 2 * fadeRaw);
  // Follow up by opening the black surround, otherwise its edge survives as a
  // hard triangle in the frame corners once the plate is gone.
  const maskOpacity = 1 - clamp01((p - 0.87) / 0.08);
  // Below the cut, blow the aperture open around the screen centre so the
  // narrow keyway rim stops slicing hard triangles out of the frame corners.
  const maskSpread = 1 + clamp01((p - 0.78) / 0.07) * 2.6;

  // The black overlay's hole must match the 3D keyway silhouette exactly.
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
      aria-label="Hiện trường vụ án 000 — nhìn qua ổ khoá"
      className={
        reduced ? "relative h-[100dvh] w-full" : "relative h-[300vh] w-full"
      }
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-[#070503] select-none">
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

        {/* Everything outside the projected keyway stays pitch black */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 z-10 h-full w-full pointer-events-none"
          viewBox={`0 0 ${Math.max(1, w)} ${Math.max(1, h)}`}
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="keyhole-mask" maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
              {maskPath ? (
                <path
                  d={maskPath}
                  fill="#000"
                  style={{ filter: "blur(0.6px)" }}
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
        </svg>

        <LandingKeyholeModel
          distance={distance}
          pitch={pitch}
          lookY={lookY}
          opacity={modelOpacity}
        />

        {/* Cinematic vignette */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 72% 62% at 50% 50%, transparent 0%, rgba(5,4,3,0.6) 100%)",
          }}
        />
      </div>
    </section>
  );
}
