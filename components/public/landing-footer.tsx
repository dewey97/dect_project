'use client'

import { BrandMark } from '@/components/investigation/brand-mark'

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-border/10 bg-card/5 py-10 z-10 font-sans">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand & Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <BrandMark href="/" />
          <span className="hidden sm:inline text-border/40">|</span>
          <p className="text-xs text-muted-foreground/80 font-mono">
            Hệ sinh thái trinh thám tương tác đa nền tảng đầu tiên tại Việt Nam.
          </p>
        </div>

        {/* Right: Socials (Facebook & TikTok only) */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground/80 font-mono uppercase tracking-wider hidden sm:inline mr-1">
            Theo dõi:
          </span>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-border/40 bg-card/30 hover:bg-card hover:border-amber-500/50 text-muted-foreground hover:text-amber-400 transition-all flex items-center justify-center cursor-pointer shadow-xs"
            title="Facebook"
            aria-label="Facebook"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-border/40 bg-card/30 hover:bg-card hover:border-amber-500/50 text-muted-foreground hover:text-amber-400 transition-all flex items-center justify-center cursor-pointer shadow-xs"
            title="TikTok"
            aria-label="TikTok"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 1 0 6.34 6.34V9.08a8.27 8.27 0 0 0 4.83 1.54V7.17a4.85 4.85 0 0 1-1.06-.48z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Bottom Sub-bar: Essential Legal & Copyright */}
      <div className="max-w-6xl mx-auto px-6 border-t border-border/10 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.7rem] text-muted-foreground/60 font-mono">
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground transition-colors">Điều khoản dịch vụ</a>
          <span>·</span>
          <a href="#" className="hover:text-foreground transition-colors">Chính sách bảo mật</a>
        </div>
        <span>© 2026 XPLORE</span>
      </div>
    </footer>
  )
}
