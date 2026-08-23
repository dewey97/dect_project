'use client'

import { BrandMark } from '@/components/investigation/brand-mark'

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-border/10 bg-card/5 pt-12 pb-6 z-10 font-sans">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1: About */}
        <div className="flex flex-col gap-3">
          <BrandMark className="scale-75 origin-left" />
          <p className="text-xs text-muted-foreground leading-relaxed mt-2 max-w-[25ch]">
            Hệ thống trò chơi điều tra lai độc đáo, kết hợp hiện vật hữu hình và không gian số để giải mã tội phạm.
          </p>
        </div>

        {/* Col 2: Support menu */}
        <div className="flex flex-col gap-3 text-xs text-muted-foreground">
          <span className="text-foreground font-bold tracking-tight text-sm">Hỗ Trợ Người Chơi</span>
          <div className="flex flex-col gap-2.5">
            <a href="#faq" className="hover:text-primary transition-colors">Liên hệ bộ phận hỗ trợ</a>
            <a href="#bocanh" className="hover:text-primary transition-colors">Câu chuyện thương hiệu</a>
            <a href="#faq" className="hover:text-primary transition-colors">Nhật ký thám tử (Blog)</a>
          </div>
        </div>

        {/* Col 3: Legal Policy menu */}
        <div className="flex flex-col gap-3 text-xs text-muted-foreground">
          <span className="text-foreground font-bold tracking-tight text-sm">Chính Sách Pháp Lý</span>
          <div className="flex flex-col gap-2.5">
            <a href="#faq" className="hover:text-primary transition-colors">Chính sách bảo mật thông tin</a>
            <a href="#faq" className="hover:text-primary transition-colors">Điều khoản sử dụng dịch vụ</a>
            <a href="#faq" className="hover:text-primary transition-colors">Chính sách đổi trả & hoàn tiền</a>
          </div>
        </div>

        {/* Col 4: Socials */}
        <div className="flex flex-col gap-3 text-xs text-muted-foreground">
          <span className="text-foreground font-bold tracking-tight text-sm">Theo Dõi Chúng Tôi</span>
          <div className="flex gap-4 mt-1">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all flex items-center justify-center cursor-pointer"
              title="Facebook"
            >
              <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all flex items-center justify-center cursor-pointer"
              title="YouTube"
            >
              <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C22 8.68 22 12 22 12s0 3.32-.42 4.814a2.44 2.44 0 0 1-1.768 1.768C18.32 19 12 19 12 19s-6.32 0-7.814-.418a2.44 2.44 0 0 1-1.768-1.768C2 15.32 2 12 2 12s0-3.32.418-4.814a2.44 2.44 0 0 1 1.768-1.768C5.68 5 12 5 12 5s6.32 0 7.812.418zM9.75 15.002L15.5 12 9.75 8.998v6.004z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all flex items-center justify-center cursor-pointer"
              title="TikTok"
            >
              <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.2 1.15 1.15 2.64 1.72 4.22 1.72v3.9c-1.39-.01-2.77-.38-3.99-1.09-.32-.19-.62-.41-.9-.65V15c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.34 0 .68.02 1.02.06v3.96c-.34-.05-.68-.07-1.02-.07-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5V0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 border-t border-border/10 pt-6 text-center text-xs text-muted-foreground/60">
        <span>© 2026 Nocturne Inc. Bảo lưu mọi quyền truy cập hệ thống.</span>
      </div>
    </footer>
  )
}
