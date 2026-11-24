'use client'

import { useState } from 'react'
import {
  Download,
} from 'lucide-react'
import { LandingNavbar } from '@/components/public/landing-navbar'
import { LandingFooter } from '@/components/public/landing-footer'

export default function BrandGuidelinesPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [logoTheme, setLogoTheme] = useState<'dark' | 'light'>('dark')
  const copyToClipboard = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  const COLOR_TOKENS = [
    {
      name: 'Obsidian Noir',
      hex: '#0A0A0D',
      bgClass: 'bg-[#0A0A0D]',
      textClass: 'text-white',
      borderClass: 'border-zinc-800'
    },
    {
      name: 'Card Charcoal',
      hex: '#12131A',
      bgClass: 'bg-[#12131A]',
      textClass: 'text-white',
      borderClass: 'border-zinc-700/60'
    },
    {
      name: 'Evidence Amber',
      hex: '#C79137',
      bgClass: 'bg-[#C79137]',
      textClass: 'text-black',
      borderClass: 'border-amber-600'
    },
    {
      name: 'Classified Crimson',
      hex: '#DC2626',
      bgClass: 'bg-[#DC2626]',
      textClass: 'text-white',
      borderClass: 'border-red-700'
    },
    {
      name: 'Bone White',
      hex: '#F4F4F5',
      bgClass: 'bg-[#F4F4F5]',
      textClass: 'text-black',
      borderClass: 'border-zinc-300'
    },
    {
      name: 'Steel Gray',
      hex: '#71717A',
      bgClass: 'bg-[#71717A]',
      textClass: 'text-white',
      borderClass: 'border-zinc-600'
    }
  ]

  const FONT_FAMILIES = [
    {
      name: 'Inter',
      category: 'Sans-Serif',
      role: 'Giao diện & Tiêu đề',
      weights: 'Regular 400 · Bold 700 · Black 900',
      glyphClass: 'font-sans font-black',
      sampleClass: 'font-sans',
      headline: 'Nền tảng điều tra kỳ án',
      specimen: 'Tất cả lời khai, chứng cứ và manh mối đều được số hóa trực tiếp trên bàn điều tra.',
    },
    {
      name: 'EB Garamond',
      category: 'Serif',
      role: 'Hồ sơ & Trích dẫn',
      weights: 'Regular 400 Italic',
      glyphClass: 'font-serif italic font-normal',
      sampleClass: 'font-serif italic',
      headline: '“Mọi tiếp xúc đều để lại dấu vết.”',
      specimen: 'Trích dẫn nguyên lý trao đổi Edmond Locard trong khoa học hình sự cổ điển.',
    },
    {
      name: 'Roboto Mono',
      category: 'Monospace',
      role: 'Mã số & Kỹ thuật',
      weights: 'Medium 500',
      glyphClass: 'font-mono font-medium',
      sampleClass: 'font-mono',
      headline: 'CASE #000 · PHASE 01',
      specimen: 'STATUS: ACTIVE // TIMESTAMP: 21:45:00 UTC // EVIDENCE_ID: DOC_14',
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative flex flex-col justify-between">
      {/* Sticky Header Nav Synced 100% */}
      <LandingNavbar />

      {/* Hero Header */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-12 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight font-sans">
            BỘ NHẬN DIỆN THƯƠNG HIỆU <span className="text-primary">XPLORE</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-sans">
            Quy chuẩn biểu tượng, bảng màu tài liệu và kiểu chữ chính thức.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex flex-col gap-14 flex-1">
        {/* 1. LOGO & ASSETS */}
        <section id="logo" className="flex flex-col gap-6 scroll-mt-20">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <h2 className="text-lg sm:text-xl font-bold uppercase font-sans">
              1. Logo & Biểu Tượng
            </h2>

            <div className="flex items-center gap-1.5 p-1 bg-card/60 border border-border/40 rounded-none">
              <button
                type="button"
                onClick={() => setLogoTheme('dark')}
                className={`px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider rounded-none transition-colors cursor-pointer ${
                  logoTheme === 'dark' ? 'bg-primary text-black font-bold' : 'text-muted-foreground hover:text-white'
                }`}
              >
                Nền Tối
              </button>
              <button
                type="button"
                onClick={() => setLogoTheme('light')}
                className={`px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider rounded-none transition-colors cursor-pointer ${
                  logoTheme === 'light' ? 'bg-zinc-200 text-black font-bold' : 'text-muted-foreground hover:text-white'
                }`}
              >
                Nền Sáng
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Logo Chính */}
            <div
              className={`rounded-none border p-6 flex flex-col justify-between gap-4 transition-all min-h-[220px] ${
                logoTheme === 'dark'
                  ? 'bg-[#0a0a0d] border-zinc-800 text-white'
                  : 'bg-[#f4efe6] border-[#d8d0c2] text-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest opacity-60">
                  LOGO CHÍNH
                </span>
                <span className="text-[11px] font-mono opacity-50">
                  1914 × 463 px
                </span>
              </div>

              <div className="flex items-center justify-center py-6">
                <img
                  src={logoTheme === 'light' ? '/brand/logo-light.png' : '/brand/logo-dark.png'}
                  alt="XPLORE Logo"
                  className="max-h-16 w-auto object-contain transition-all"
                />
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-current/10">
                <a
                  href={logoTheme === 'light' ? '/brand/logo-light.png' : '/brand/logo-dark.png'}
                  download={logoTheme === 'light' ? 'xplore_logo_light.png' : 'xplore_logo_dark.png'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                >
                  <Download className="size-3.5" />
                  <span>Tải PNG ({logoTheme === 'light' ? 'Sáng' : 'Tối'})</span>
                </a>
              </div>
            </div>

            {/* Biểu Tượng */}
            <div
              className={`rounded-none border p-6 flex flex-col justify-between gap-4 transition-all min-h-[220px] ${
                logoTheme === 'dark'
                  ? 'bg-[#0a0a0d] border-zinc-800 text-white'
                  : 'bg-[#f4efe6] border-[#d8d0c2] text-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest opacity-60">
                  BIỂU TƯỢNG
                </span>
                <span className="text-[11px] font-mono opacity-50">
                  512 × 512 px
                </span>
              </div>

              <div className="flex items-center justify-center py-6">
                <img
                  src={logoTheme === 'light' ? '/brand/mark-light.png' : '/brand/mark-dark.png'}
                  alt="XPLORE Mark"
                  className="max-h-16 w-auto object-contain transition-all"
                />
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-current/10">
                <a
                  href={logoTheme === 'light' ? '/brand/mark-light.png' : '/brand/mark-dark.png'}
                  download={logoTheme === 'light' ? 'xplore_mark_light.png' : 'xplore_mark_dark.png'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                >
                  <Download className="size-3.5" />
                  <span>Tải PNG ({logoTheme === 'light' ? 'Sáng' : 'Tối'})</span>
                </a>
              </div>
            </div>
          </div>

          {/* Tài nguyên phụ trợ: Favicon & OpenGraph */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bộ Favicon */}
            <div className="rounded-none border border-border/40 bg-card/40 p-4 flex items-center justify-between gap-4 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-none bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                  <img
                    src="/brand/favicon-dark.png"
                    alt="Favicon"
                    className="size-6 object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-foreground uppercase tracking-wider truncate">
                    Favicon Trình Duyệt
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground truncate">
                    ICO · 16×16, 32×32, 48×48
                  </span>
                </div>
              </div>

              <a
                href="/favicon.ico"
                download="favicon.ico"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border border-border/60 bg-card hover:border-primary text-foreground hover:text-primary font-mono text-xs font-bold transition-all shrink-0 active:scale-95"
              >
                <Download className="size-3.5" />
                <span>Tải ICO</span>
              </a>
            </div>

            {/* Social Share / OpenGraph */}
            <div className="rounded-none border border-border/40 bg-card/40 p-4 flex items-center justify-between gap-4 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-11 rounded-none bg-black/60 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src="/brand/og-image.jpg"
                    alt="OpenGraph Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-foreground uppercase tracking-wider truncate">
                    Ảnh Chia Sẻ (OpenGraph)
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground truncate">
                    JPG · 1200 × 630 px
                  </span>
                </div>
              </div>

              <a
                href="/brand/og-image.jpg"
                download="xplore_og_image.jpg"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border border-border/60 bg-card hover:border-primary text-foreground hover:text-primary font-mono text-xs font-bold transition-all shrink-0 active:scale-95"
              >
                <Download className="size-3.5" />
                <span>Tải JPG</span>
              </a>
            </div>
          </div>
        </section>

        {/* 2. COLORS */}
        <section id="colors" className="flex flex-col gap-3 scroll-mt-20">
          <div className="border-b border-border/30 pb-3">
            <h2 className="text-lg sm:text-xl font-bold uppercase font-sans">
              2. Bảng Màu Chuẩn
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {/* Seamless Color Ribbon Bar */}
            <div className="w-full h-10 flex rounded-none border border-border/50 overflow-hidden divide-x divide-white/10 shadow-xs">
              {COLOR_TOKENS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => copyToClipboard(c.hex, c.hex)}
                  className={`flex-1 h-full ${c.bgClass} cursor-pointer focus:outline-hidden`}
                />
              ))}
            </div>

            {/* Hex labels row */}
            <div className="grid grid-cols-6 gap-1 sm:gap-2">
              {COLOR_TOKENS.map((c) => {
                const isCopied = copiedKey === c.hex
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => copyToClipboard(c.hex, c.hex)}
                    className="py-1 text-center font-mono text-[11px] sm:text-xs transition-colors cursor-pointer select-none text-muted-foreground hover:text-foreground focus:outline-hidden"
                  >
                    {isCopied ? (
                      <span className="text-emerald-400 font-bold">COPIED</span>
                    ) : (
                      c.hex
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* 3. TYPOGRAPHY */}
        <section id="typography" className="flex flex-col gap-6 scroll-mt-20">
          <div className="border-b border-border/30 pb-3 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold uppercase font-sans">
              3. Typography
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              3 Họ Font Chuẩn
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FONT_FAMILIES.map((font) => (
              <div
                key={font.name}
                className="rounded-none border border-border/40 bg-card/30 p-5 flex flex-col justify-between gap-6 hover:border-primary/50 transition-all shadow-xs"
              >
                {/* Header: Glyph & Font info */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between border-b border-border/20 pb-4">
                    <span className={`text-5xl text-foreground select-none leading-none ${font.glyphClass}`}>
                      Aa
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground px-2 py-0.5 border border-border/40 bg-background/50">
                      {font.category}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-base text-foreground font-sans">
                      {font.name}
                    </h3>
                    <p className="text-xs text-primary font-medium">
                      {font.role}
                    </p>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Trọng số: {font.weights}
                    </span>
                  </div>
                </div>

                {/* Specimen text */}
                <div className="flex flex-col gap-2 pt-4 border-t border-border/20">
                  <div className={`text-base text-foreground font-bold leading-snug ${font.sampleClass}`}>
                    {font.headline}
                  </div>
                  <div className={`text-xs text-muted-foreground leading-relaxed ${font.sampleClass}`}>
                    {font.specimen}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Synced Landing Footer */}
      <LandingFooter />
    </div>
  )
}
