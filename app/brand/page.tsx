'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Copy,
  Download,
  ShieldAlert
} from 'lucide-react'

export default function BrandGuidelinesPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [logoTheme, setLogoTheme] = useState<'dark' | 'light'>('dark')
  const [sampleText, setSampleText] = useState(
    'Vụ án #000: Trốn Tìm — Mọi manh mối rồi sẽ được đưa ra ánh sáng.'
  )

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

  const FONT_SPECIMENS = [
    {
      type: 'Sans / Giao diện & Nội dung',
      family: 'Inter / Geist Sans',
      fontClass: 'font-sans'
    },
    {
      type: 'Monospace / Kỹ thuật & Mốc thời gian',
      family: 'Roboto Mono / Geist Mono',
      fontClass: 'font-mono'
    },
    {
      type: 'Handwriting / Ghi chú viết tay',
      family: 'Playpen Sans / Caveat',
      fontClass: 'font-handwriting'
    },
    {
      type: 'Typewriter / Biên bản pháp y',
      family: 'Courier Prime / Special Elite',
      fontClass: 'font-typewriter'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative">
      {/* Background noir scanlines */}
      <div
        aria-hidden="true"
        className="noir-scanlines pointer-events-none fixed inset-0 opacity-10 z-0"
      />

      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/85 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Trang Chủ</span>
            </Link>
            <span className="text-border/60">/</span>
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
              BRAND ASSETS
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <a href="#logo" className="hover:text-primary transition-colors">Logo</a>
            <span>•</span>
            <a href="#colors" className="hover:text-primary transition-colors">Màu Sắc</a>
            <span>•</span>
            <a href="#typography" className="hover:text-primary transition-colors">Typography</a>
            <span>•</span>
            <a href="#downloads" className="hover:text-primary transition-colors">Tải File</a>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-12 pb-8 border-b border-border/20">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight font-sans">
            TÀI NGUYÊN THƯƠNG HIỆU <span className="text-primary">XPLORE</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Quy chuẩn logo, bảng màu, kiểu chữ và kho tài nguyên số hóa.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col gap-16">

        {/* 1. LOGO */}
        <section id="logo" className="flex flex-col gap-6 scroll-mt-20">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <h2 className="text-lg sm:text-xl font-bold uppercase font-sans">
              1. Logo & Biểu Tượng
            </h2>

            <div className="flex items-center gap-1.5 p-1 bg-card/60 border border-border/40 rounded-lg">
              <button
                type="button"
                onClick={() => setLogoTheme('dark')}
                className={`px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider rounded transition-colors ${
                  logoTheme === 'dark' ? 'bg-primary text-black font-bold' : 'text-muted-foreground hover:text-white'
                }`}
              >
                Nền Tối
              </button>
              <button
                type="button"
                onClick={() => setLogoTheme('light')}
                className={`px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider rounded transition-colors ${
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
              className={`rounded-xl border p-6 flex flex-col justify-between gap-4 transition-all min-h-[220px] ${
                logoTheme === 'dark'
                  ? 'bg-[#0a0a0d] border-zinc-800 text-white'
                  : 'bg-[#f4efe6] border-[#d8d0c2] text-zinc-900'
              }`}
            >
              <span className="font-mono text-[0.65rem] uppercase tracking-widest opacity-60">
                LOGO CHÍNH
              </span>

              <div className="flex items-center justify-center py-6">
                <img
                  src="/brand/logo.png"
                  alt="XPLORE Logo"
                  className={`max-h-16 w-auto object-contain transition-all ${
                    logoTheme === 'light' ? 'invert hue-rotate-180 brightness-90' : ''
                  }`}
                />
              </div>

              <div />
            </div>

            {/* Biểu Tượng */}
            <div
              className={`rounded-xl border p-6 flex flex-col justify-between gap-4 transition-all min-h-[220px] ${
                logoTheme === 'dark'
                  ? 'bg-[#0a0a0d] border-zinc-800 text-white'
                  : 'bg-[#f4efe6] border-[#d8d0c2] text-zinc-900'
              }`}
            >
              <span className="font-mono text-[0.65rem] uppercase tracking-widest opacity-60">
                BIỂU TƯỢNG
              </span>

              <div className="flex items-center justify-center py-6">
                <img
                  src="/brand/logo-x.png"
                  alt="XPLORE Mark"
                  className={`max-h-16 w-auto object-contain transition-all ${
                    logoTheme === 'light' ? 'invert brightness-50' : ''
                  }`}
                />
              </div>

              <div />
            </div>
          </div>

          {/* Quy chuẩn tên thương hiệu */}
          <div className="rounded-lg border border-border/40 bg-card/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <ShieldAlert className="size-4 text-primary shrink-0" />
              <span>Quy chuẩn viết tên:</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-emerald-400 font-bold">✓ XPLORE &nbsp; ✓ xplore</span>
              <span className="text-destructive line-through opacity-80">✕ X-PLORE &nbsp; ✕ X_PLORE</span>
            </div>
          </div>
        </section>

        {/* 2. COLORS */}
        <section id="colors" className="flex flex-col gap-6 scroll-mt-20">
          <div className="border-b border-border/30 pb-3">
            <h2 className="text-lg sm:text-xl font-bold uppercase font-sans">
              2. Bảng Màu Chuẩn
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {COLOR_TOKENS.map((c) => {
              const isCopied = copiedKey === c.hex
              return (
                <div
                  key={c.hex}
                  onClick={() => copyToClipboard(c.hex, c.hex)}
                  className="group relative cursor-pointer rounded-lg border border-border/40 bg-card/40 hover:border-primary/60 transition-all p-3 flex flex-col gap-2 select-none"
                >
                  <div
                    className={`h-14 w-full rounded border ${c.borderClass} ${c.bgClass} flex items-end justify-center pb-1`}
                  >
                    {isCopied ? (
                      <span className="text-[0.65rem] font-mono font-bold text-emerald-400 bg-black/80 px-1 rounded">
                        ĐÃ COPY
                      </span>
                    ) : (
                      <Copy className="size-3.5 opacity-0 group-hover:opacity-100 text-white drop-shadow transition-opacity" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-foreground truncate">{c.name}</span>
                    <span className="text-[0.7rem] font-mono text-muted-foreground">{c.hex}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 3. TYPOGRAPHY */}
        <section id="typography" className="flex flex-col gap-6 scroll-mt-20">
          <div className="border-b border-border/30 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold uppercase font-sans">
              3. Typography & Văn Bản Mẫu
            </h2>

            {/* Live Input tester */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">Văn bản mẫu:</span>
              <input
                type="text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="w-full sm:w-80 bg-card border border-border/60 rounded px-2.5 py-1 text-xs text-foreground focus:outline-hidden focus:border-primary font-mono"
                placeholder="Nhập văn bản mẫu để kiểm tra..."
              />
            </div>
          </div>

          {/* Typography Specimen Grid — Same sample text across all styles */}
          <div className="flex flex-col gap-3">
            {FONT_SPECIMENS.map((f) => (
              <div
                key={f.type}
                className="rounded-lg border border-border/40 bg-card/30 p-4 sm:p-5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-border/15 pb-2">
                  <span className="font-bold text-primary">{f.type}</span>
                  <span>{f.family}</span>
                </div>

                <div className={`text-base sm:text-xl text-foreground pt-1 ${f.fontClass}`}>
                  {sampleText || 'Vụ án #000: Trốn Tìm — Mọi manh mối rồi sẽ được đưa ra ánh sáng.'}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. DOWNLOADS WITH LARGE VISUAL PREVIEWS */}
        <section id="downloads" className="flex flex-col gap-6 scroll-mt-20">
          <div className="border-b border-border/30 pb-3">
            <h2 className="text-lg sm:text-xl font-bold uppercase font-sans">
              4. Kho Tải Tài Nguyên
            </h2>
          </div>

          <div className="flex flex-col gap-5">
            {/* FEATURED: OpenGraph Social Banner (Large, High-Clarity View) */}
            <div className="rounded-xl border border-border/40 bg-card/40 p-5 sm:p-6 flex flex-col gap-4 hover:border-primary/50 transition-all shadow-md group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-foreground font-sans">
                    Ảnh Chia Sẻ Mạng Xã Hội (OpenGraph Image)
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground">
                    1200 × 630 px
                  </span>
                </div>

                <a
                  href="/brand/og-image.jpg"
                  download="xplore_og_image.jpg"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-sm active:scale-95 w-fit"
                >
                  <Download className="size-4" />
                  <span>Tải File (1200×630)</span>
                </a>
              </div>

              {/* Large Image Preview Box */}
              <div className="w-full aspect-[1.91/1] max-h-[380px] rounded-lg bg-black/80 border border-white/10 overflow-hidden relative flex items-center justify-center">
                <img
                  src="/brand/og-image.jpg"
                  alt="OpenGraph Preview"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>
            </div>

            {/* 3 Brand Mark & Icon Assets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Logo Ngang */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 flex flex-col justify-between gap-4 hover:border-primary/50 transition-all shadow-sm group">
                <div className="w-full h-32 rounded-lg bg-black/60 border border-white/5 flex items-center justify-center p-4 overflow-hidden relative">
                  <img
                    src="/brand/logo.png"
                    alt="Logo Ngang"
                    className="max-h-full max-w-full object-contain drop-shadow transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-foreground truncate">
                      Logo Chính
                    </h3>
                    <span className="text-[0.7rem] font-mono text-muted-foreground mt-0.5">
                      1920 × 1080 px
                    </span>
                  </div>

                  <a
                    href="/brand/logo.png"
                    download="xplore_logo.png"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                  >
                    <Download className="size-3.5" />
                    <span>Tải File</span>
                  </a>
                </div>
              </div>

              {/* Biểu Tượng X */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 flex flex-col justify-between gap-4 hover:border-primary/50 transition-all shadow-sm group">
                <div className="w-full h-32 rounded-lg bg-black/60 border border-white/5 flex items-center justify-center p-4 overflow-hidden relative">
                  <img
                    src="/brand/logo-x.png"
                    alt="Biểu Tượng X"
                    className="max-h-full max-w-full object-contain drop-shadow transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-foreground truncate">
                      Biểu Tượng
                    </h3>
                    <span className="text-[0.7rem] font-mono text-muted-foreground mt-0.5">
                      512 × 512 px
                    </span>
                  </div>

                  <a
                    href="/brand/logo-x.png"
                    download="xplore_mark.png"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                  >
                    <Download className="size-3.5" />
                    <span>Tải File</span>
                  </a>
                </div>
              </div>

              {/* Bộ Favicon */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 flex flex-col justify-between gap-4 hover:border-primary/50 transition-all shadow-sm group">
                <div className="w-full h-32 rounded-lg bg-black/60 border border-white/5 flex items-center justify-center p-4 overflow-hidden relative">
                  <img
                    src="/brand/icon-dark-32x32.png"
                    alt="Favicon"
                    className="size-10 object-contain drop-shadow transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-foreground truncate">
                      Bộ Favicon Trình Duyệt
                    </h3>
                    <span className="text-[0.7rem] font-mono text-muted-foreground mt-0.5">
                      16x16, 32x32, 48x48
                    </span>
                  </div>

                  <a
                    href="/brand/favicon.ico"
                    download="favicon.ico"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                  >
                    <Download className="size-3.5" />
                    <span>Tải File</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-background/80 py-6 px-6 text-center text-xs font-mono text-muted-foreground/60">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 XPLORE Inc.</span>
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:text-primary transition-colors">
              Trang Chủ
            </Link>
            <span>•</span>
            <Link href="/activate" className="hover:text-primary transition-colors">
              Kích Hoạt
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
