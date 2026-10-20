'use client'

import React, { useState, useEffect, useRef } from 'react'
import { LandingKeyholeModel } from './landing-keyhole-model'

export function LandingScene360Showcase() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [dims, setDims] = useState({ w: 1920, h: 1080 })

  useEffect(() => {
    const recalc = () => setDims({ w: window.innerWidth, h: window.innerHeight })
    recalc()

    const handleScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = el.clientHeight - window.innerHeight
      if (scrollable <= 0) return
      setProgress(Math.max(0, Math.min(1, -rect.top / scrollable)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', recalc, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', recalc)
    }
  }, [])

  // ── PHASE MAP ──────────────────────────────────────
  //  0.00 → 0.08   Keyhole frame fades in, tiny peek
  //  0.05 → 0.78   Camera drifts through the key slot and keeps zooming
  //  0.78 → 1.00   Fully inside the scene, CTA fades in

  const tRaw = Math.max(0, Math.min(1, (progress - 0.03) / 0.75))
  const eased =
    tRaw < 0.5
      ? 4 * tRaw * tRaw * tRaw
      : 1 - Math.pow(-2 * tRaw + 2, 3) / 2

  // ── Keyhole scale ──
  // Base keyhole is ~100px tall. Scale it until it exceeds viewport diagonal.
  // The visible aperture is the actual key slot, not the outer lock plate.
  // Keep it synchronized with the imported GLB so the room can only leak
  // through the slot while the camera pushes into it.
  const keyholeScale = 0.38 + eased * 4.2

  // ── Keep the room behind a solid aperture: the camera zooms through it ──
  // The reveal comes from the keyhole aperture moving past the camera,
  // never from fading the darkness layer away.
  const darknessAlpha = 1

  // ── Decorative keyhole frame ──
  // The 3D lock must be visible on the first frame; scrolling only controls zoom.
  const frameOpacity = 1

  // ── Camera push-in through the keyhole ──
  const sceneScale = 1.12 + eased * 2.25
  const scenePanX = 50 + eased * 4
  const sceneBright = 0.42 + eased * 0.58

  // ── Header ──
  const headerOpacity =
    progress > 0.75 ? Math.max(0, 1 - (progress - 0.75) / 0.15)
    : Math.min(1, progress / 0.06)

  // ── CTA ──
  const ctaOpacity = progress < 0.78 ? 0 : Math.min(1, (progress - 0.78) / 0.14)

  // ── Scroll hint ──
  const hintOpacity = progress < 0.78 ? 0.7 : Math.max(0, 0.7 - (progress - 0.78) / 0.15)

  const cx = dims.w / 2
  const cy = dims.h / 2

  return (
    <section
      ref={sectionRef}
      id="hien-truong-360"
      className="relative w-full h-[360vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#080604] select-none">

        {/* ──────── LAYER 1: Crime Scene Panorama ──────── */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              backgroundImage: 'url(/images/cases/case_000/PANORAMA.png)',
              backgroundSize: 'cover',
              backgroundPosition: `${scenePanX}% 42%`,
              backgroundRepeat: 'no-repeat',
              transform: `scale(${sceneScale})`,
              filter: `brightness(${sceneBright}) contrast(1.08) saturate(0.85)`,
            }}
          />
        </div>

        {/* ──────── LAYER 2: Cinematic Vignette ──────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, rgba(5,4,3,${0.3 + (1 - eased) * 0.5}) 100%)`,
          }}
        />

        {/* ──────── LAYER 3: SVG Keyhole-Shaped Darkness Mask ──────── */}
        {/*
          How it works:
          - SVG fills the viewport, viewBox matches pixel dimensions
          - <mask>: white rect = overlay visible (dark), black keyhole = overlay hidden (hole)
          - <g transform="scale(...)"> grows the keyhole cutout from tiny to massive
          - feGaussianBlur softens the edge like light bleeding through
        */}
        {darknessAlpha > 0.004 && (
          <svg
            className="absolute inset-0 z-20 w-full h-full pointer-events-none"
            viewBox={`0 0 ${dims.w} ${dims.h}`}
            aria-hidden="true"
          >
            <defs>
              <filter id="kh-soft">
                <feGaussianBlur stdDeviation="2" />
              </filter>
              <mask id="kh-mask">
                {/* Full white = dark overlay visible everywhere */}
                <rect width={dims.w} height={dims.h} fill="white" />
                {/* Black keyhole shape = dark overlay hidden = scene peeks through */}
                <g transform={`translate(${cx}, ${cy}) scale(${keyholeScale})`}>
                  {/* The only transparent area: the irregular key slot */}
                  <path
                    d="M-8,-22 L8,-22 L8,-4 L14,2 L14,28 L7,38 L-7,38 L-14,28 L-14,2 L-8,-4 Z"
                    fill="black"
                    filter="url(#kh-soft)"
                  />
                </g>
              </mask>
            </defs>
            <rect
              width={dims.w}
              height={dims.h}
              fill={`rgba(8,6,4,${darknessAlpha})`}
              mask="url(#kh-mask)"
            />
          </svg>
        )}

        {/* ──────── LAYER 4: Decorative Keyhole Frame SVG ──────── */}
        {frameOpacity > 0.01 && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-30 pointer-events-none"
            style={{ opacity: frameOpacity }}
          >
            <LandingKeyholeModel zoom={eased} />
          </div>
        )}

        {/* ──────── LAYER 5: Top Header Badge ──────── */}
        <div
          className="absolute top-5 sm:top-8 inset-x-0 z-40 flex flex-col items-center text-center gap-1.5 pointer-events-none px-4"
          style={{ opacity: headerOpacity }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-red-500/25 bg-black/60 backdrop-blur-sm text-red-400 font-mono text-[0.6rem] font-bold tracking-[0.2em] uppercase">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
            Vụ Án #000 — Hiện Trường Phòng Làm Việc Tầng 2
          </div>
        </div>

        {/* ──────── LAYER 6: CTA (after full reveal) ──────── */}
        {ctaOpacity > 0 && (
          <div
            className="absolute bottom-14 sm:bottom-16 inset-x-0 z-40 flex flex-col items-center gap-3 pointer-events-auto px-4"
            style={{ opacity: ctaOpacity }}
          >
            <a
              href="/evidence/boardgame"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs font-bold tracking-widest uppercase transition-colors duration-200"
            >
              Khám Phá Toàn Bộ Hiện Trường →
            </a>
          </div>
        )}

        {/* ──────── LAYER 7: Scroll Hint ──────── */}
        <div
          className="absolute bottom-4 sm:bottom-5 inset-x-0 z-40 flex justify-center pointer-events-none"
          style={{ opacity: hintOpacity }}
        >
          <span className="font-mono text-[0.56rem] text-zinc-500 uppercase tracking-[0.22em]">
            {progress < 0.08
              ? 'Nhìn qua ổ khóa...'
              : progress < 0.78
                ? 'Cuộn để mở cửa ↓'
                : 'Đã bước vào hiện trường'}
          </span>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────
   KEYHOLE DECORATIVE SVG FRAME
   Ornamental outline that sits over the peephole.
   Circle top + trapezoid slot = classic keyhole shape.
   Crosshair ticks + corner brackets for forensic feel.
   ────────────────────────────────────────────────────── */
function KeyholeFrame() {
  const s1 = 'rgba(238,190,104,0.78)'
  const s2 = 'rgba(210,160,80,0.28)'
  const tk = 'rgba(210,160,80,0.30)'

  return (
    <svg
      width="120"
      height="210"
      viewBox="0 0 120 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_0_20px_rgba(245,158,11,0.22)]"
    >
      <defs>
        <linearGradient id="kh-metal" x1="20" y1="12" x2="100" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff0b0" stopOpacity="0.95" />
          <stop offset="0.22" stopColor="#a8752c" stopOpacity="0.9" />
          <stop offset="0.52" stopColor="#f6d17b" stopOpacity="0.72" />
          <stop offset="0.78" stopColor="#6b4318" stopOpacity="0.9" />
          <stop offset="1" stopColor="#e3aa4c" stopOpacity="0.68" />
        </linearGradient>
        <radialGradient id="kh-depth" cx="50%" cy="38%" r="68%">
          <stop offset="0" stopColor="#050403" stopOpacity="0.2" />
          <stop offset="0.72" stopColor="#050403" stopOpacity="0.72" />
          <stop offset="1" stopColor="#000" stopOpacity="0.98" />
        </radialGradient>
        <filter id="kh-depth-shadow" x="-40%" y="-30%" width="180%" height="180%">
          <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.8" />
        </filter>
        <filter id="kh-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
      </defs>

      {/* Recessed, shadowed keyhole cavity */}
      <g filter="url(#kh-depth-shadow)">
        <circle cx="60" cy="48" r="34" fill="url(#kh-depth)" stroke="#241608" strokeWidth="5" />
        <path d="M46,74 L36,195 L84,195 L74,74 Z" fill="url(#kh-depth)" stroke="#241608" strokeWidth="5" strokeLinejoin="round" />
      </g>

      {/* Thick bevel: dark underside + lit upper rim */}
      <circle cx="60" cy="46" r="34" stroke="#5a3714" strokeWidth="4" opacity="0.9" />
      <path d="M46,72 L36,193 L84,193 L74,72" stroke="#5a3714" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="60" cy="45" r="32" stroke="url(#kh-metal)" strokeWidth="1.7" />
      <path d="M47,71 L38,191 L82,191 L73,71" stroke="url(#kh-metal)" strokeWidth="1.7" strokeLinejoin="round" />

      {/* Soft reflected light on the metal edge */}
      <circle cx="60" cy="43" r="32" stroke="#ffe8a0" strokeWidth="0.8" opacity="0.7" filter="url(#kh-glow)" />
      <path d="M47,70 L39,188" stroke="#ffe8a0" strokeWidth="0.8" opacity="0.7" filter="url(#kh-glow)" />

      {/* Inner keyhole silhouette */}
      <path
        d="M49,72 L41,190 L79,190 L71,72"
        stroke={s2} strokeWidth="0.6" strokeLinejoin="round"
      />
      <circle cx="60" cy="48" r="27" stroke={s2} strokeWidth="0.6" />

      {/* Technical outer ring and focus marks */}
      <circle cx="60" cy="48" r="37" stroke={s1} strokeWidth="0.7" strokeDasharray="1 5" opacity="0.55" />

      {/* Crosshair ticks */}
      <line x1="60" y1="20" x2="60" y2="8" stroke={tk} strokeWidth="0.5" />
      <line x1="60" y1="76" x2="60" y2="88" stroke={tk} strokeWidth="0.5" />
      <line x1="32" y1="48" x2="20" y2="48" stroke={tk} strokeWidth="0.5" />
      <line x1="88" y1="48" x2="100" y2="48" stroke={tk} strokeWidth="0.5" />

      {/* Corner brackets */}
      <polyline points="6,14 6,4 16,4" stroke={tk} strokeWidth="0.5" fill="none" />
      <polyline points="114,14 114,4 104,4" stroke={tk} strokeWidth="0.5" fill="none" />
      <polyline points="6,196 6,206 16,206" stroke={tk} strokeWidth="0.5" fill="none" />
      <polyline points="114,196 114,206 104,206" stroke={tk} strokeWidth="0.5" fill="none" />
    </svg>
  )
}
