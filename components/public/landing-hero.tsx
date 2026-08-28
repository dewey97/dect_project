'use client'

import { useRouter } from 'next/navigation'
import { BrandMark } from '@/components/investigation/brand-mark'
import { HeroInteractive } from '@/components/investigation/hero-interactive'
import { Button } from '@/components/ui/button'
import { Search, ShoppingCart } from 'lucide-react'
import { UserNav } from '@/components/auth/user-nav'
import { LandingBanner } from '@/components/public/landing-banner'

interface LandingHeroProps {
  activePoster: number
}

export function LandingHero({ activePoster }: LandingHeroProps) {
  const router = useRouter()

  return (
    <>
      {/* TOP ANNOUNCEMENT TAPE BANNER (DYNAMIC FROM DB) */}
      <LandingBanner />

      {/* STICKY HEADER NAV */}
      <header className="sticky top-0 w-full z-50 border-b border-border/10 bg-card/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <BrandMark className="scale-90 origin-left" />

          {/* Quick links navigation on the right side */}
          <nav className="hidden md:flex items-center gap-6 font-sans text-sm font-medium text-muted-foreground">
            <a href="#bocanh" className="hover:text-primary transition-colors">Bối cảnh</a>
            <a href="#mm-opportunity" className="hover:text-primary transition-colors">Cách chơi</a>
            <a href="/cases" className="hover:text-primary transition-colors">Vụ án</a>
            <a href="#danhgia" className="hover:text-primary transition-colors">Đánh giá</a>
            <a href="#faq" className="hover:text-primary transition-colors">Hỏi & Đáp</a>
          </nav>

          {/* Action controls (Search, Cart, LogIn) */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <button
              onClick={() => alert('Chức năng tìm kiếm dữ liệu vụ án đang được kết nối.')}
              className="p-2 hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
              title="Tìm kiếm hồ sơ"
            >
              <Search className="size-4.5" />
            </button>

            <button
              onClick={() => router.push('/cases')}
              className="p-2 hover:text-primary transition-colors relative cursor-pointer flex items-center justify-center"
              title="Giỏ hàng"
            >
              <ShoppingCart className="size-4.5" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-destructive text-[0.5rem] font-bold text-white rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                1
              </span>
            </button>

            <UserNav />
          </div>
        </div>
      </header>

      {/* HERO SECTION — FULL WIDTH & HEIGHT INTERACTIVE EVIDENCE BOARD */}
      <section className="relative w-full h-[80vh] min-h-[580px] lg:h-[85vh] flex items-center justify-center border-b border-border/10 overflow-hidden">
        {/* Background Interactive Board */}
        <div className="absolute inset-0 w-full h-full z-0">
          <HeroInteractive
            className="w-full h-full rounded-none border-none"
            controlledCaseId={['case-01', 'case-02', 'case-03', 'case-02', 'case-01'][activePoster]}
          />
        </div>

        {/* Foreground Content overlay */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex justify-start lg:pl-0 pointer-events-none">
          <div className="w-full max-w-md flex flex-col items-start gap-5 pointer-events-auto lg:translate-x-[-1.5rem]">
            <h1 className="text-balance text-3xl lg:text-4xl font-black leading-tight tracking-tight uppercase">
              Những vụ án chưa có lời giải...
            </h1>
            <p className="text-pretty text-xs lg:text-sm leading-relaxed text-muted-foreground font-mono italic">
              "Khi bạn đã loại bỏ tất cả những điều không thể, thì điều còn lại, dù vô lý đến đâu, cũng chính là sự thật."
              <span className="block mt-1 not-italic text-primary/60">— Sherlock Holmes</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
              <Button
                onClick={() => router.push('/cabinet-demo')}
                size="lg"
                className="h-12 px-6 font-mono text-xs font-bold uppercase tracking-widest transition-transform active:scale-[0.98]"
              >
                Phá Án Online
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/cases')}
                className="h-12 px-6 font-mono text-xs font-bold uppercase tracking-widest border-zinc-800 dark:border-zinc-800 text-zinc-100 bg-zinc-950 dark:bg-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-900 hover:text-white"
              >
                Khám Phá Các Vụ Án
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
