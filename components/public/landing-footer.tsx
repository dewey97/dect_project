'use client'

import { BrandMark } from '@/components/investigation/brand-mark'
import Link from 'next/link'
import { WaitlistForm } from '@/components/public/waitlist-form'

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-border/30 bg-[oklch(0.21_0.009_265/0.9)] py-8 z-10 font-sans">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-5">
        {/* Hàng trên: thương hiệu bên trái, đăng ký email bên phải */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-zinc-700">
          <div className="flex flex-col items-start gap-3 max-w-xl">
            <BrandMark href="/" />
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              Nền tảng chơi game trinh thám đa phương thức tại Việt Nam, phá án cùng bạn bè ngay trên màn hình hoặc mở bộ hồ sơ vật lý chân thực.
            </p>
          </div>

          <div id="footer-newsletter" className="w-full md:w-auto flex flex-col items-start md:items-end gap-3 scroll-mt-12">
            <span className="text-sm font-bold uppercase tracking-wider text-zinc-200 md:text-right md:whitespace-nowrap">
              Nhận tin và ưu đãi khi có vụ án mới
            </span>
            <WaitlistForm
              source="footer"
              variant="compact"
              placeholder="Email của bạn"
              className="w-full"
            />
          </div>
        </div>

        {/* Hàng dưới: bản quyền + pháp lý bên trái, mạng xã hội bên phải */}
        <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© 2026 XPLORE</span>
            <span aria-hidden="true">|</span>
            <Link href="/terms" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Điều khoản dịch vụ</Link>
            <span aria-hidden="true">|</span>
            <Link href="/privacy" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Chính sách bảo mật</Link>
            <span aria-hidden="true">|</span>
            <Link href="/brand" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Bộ nhận diện</Link>
          </div>

          <div className="-mr-2.5 flex items-center gap-1">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-11 items-center justify-center text-zinc-100 hover:text-amber-400 transition-colors"
              title="Facebook"
              aria-label="Facebook"
            >
              <svg className="size-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-11 items-center justify-center text-zinc-100 hover:text-amber-400 transition-colors"
              title="Instagram"
              aria-label="Instagram"
            >
              <svg className="size-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-11 items-center justify-center text-zinc-100 hover:text-amber-400 transition-colors"
              title="TikTok"
              aria-label="TikTok"
            >
              <svg className="size-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 1 0 6.34 6.34V9.08a8.27 8.27 0 0 0 4.83 1.54V7.17a4.85 4.85 0 0 1-1.06-.48z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
