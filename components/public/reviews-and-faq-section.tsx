'use client'

import { useState } from 'react'
import { Quote, ChevronDown, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TESTIMONIALS_DATA, FAQ_DATA } from '@/lib/data/landing-data'

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function ReviewsAndFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {/* COMMUNITY ENGAGEMENT (ĐẶT NGAY TRÊN ĐÁNH GIÁ) */}
      <section className="w-full max-w-6xl px-6 pt-14 pb-4 z-10">
        <div className="max-w-4xl mx-auto border border-border/80 bg-card/30 rounded-lg p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.04] rounded-bl-full pointer-events-none" />
          <div className="max-w-xl">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight font-sans">
              CỘNG ĐỒNG MÊ TRINH THÁM
            </h3>
            <p className="text-xs sm:text-[0.84rem] text-muted-foreground mt-2 leading-relaxed font-sans">
              Gia nhập mạng lưới hàng nghìn thám tử toàn quốc. Cập nhật bản tin kỳ án trên <strong className="text-zinc-200">Fanpage Facebook</strong>, xem video dựng lại hiện trường tại <strong className="text-zinc-200">TikTok</strong>, và soi chi tiết ảnh bằng chứng trên <strong className="text-zinc-200">Instagram</strong>.
            </p>
          </div>

          {/* Social Channels Buttons (Theo chiều dọc) */}
          <div className="flex flex-col gap-2 w-full sm:w-44 shrink-0">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <FacebookIcon className="size-3.5 fill-current" />
              <span>Fanpage FB</span>
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary/60 hover:bg-secondary text-zinc-200 border border-border/70 font-mono text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              <TikTokIcon className="size-3.5 fill-current" />
              <span>TikTok</span>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary/60 hover:bg-secondary text-zinc-200 border border-border/70 font-mono text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              <InstagramIcon className="size-3.5" />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </section>

      {/* DETECTIVE TESTIMONIALS (Auto-scrolling Marquee & Social Proof) */}
      <section id="danhgia" className="w-full py-12 z-10 overflow-hidden flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto mb-8 px-6 flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-foreground font-sans">
            Đánh Giá Từ Thám Tử Đi Trước
          </h2>
        </div>

        {/* Marquee Wrapper with Edge Fade Gradients */}
        <div className="relative w-full overflow-hidden select-none py-2">
          {/* Left/Right Edge Shadows for Smooth Fade */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-background to-transparent z-10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-background to-transparent z-10"
          />

          <div className="animate-marquee flex gap-5 font-sans">
            {[...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA].map((t, idx) => (
              <div
                key={idx}
                className="w-[280px] sm:w-[320px] shrink-0 relative bg-[#ebe4d5] text-[#2d251f] border border-[#d6cbaf] p-5 shadow-[0_8px_16px_rgba(0,0,0,0.35)] rounded-sm flex flex-col justify-between hover:scale-[1.02] hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)] transition-all duration-300"
              >
                <Quote className="absolute top-3 right-3 size-7 text-amber-900/10 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between border-b border-dashed border-[#a3977c] pb-2 mb-3 font-mono">
                    <span className="text-[0.7rem] font-bold text-zinc-900 uppercase tracking-wide">
                      {t.author}
                    </span>
                    <span className="text-[0.65rem] text-amber-700">★★★★★</span>
                  </div>

                  <p className="text-xs text-zinc-800 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#a3977c]/30 text-[0.65rem] font-mono text-zinc-600 truncate">
                  {t.div}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION (Accordions) */}
      <section id="faq" className="w-full max-w-4xl px-6 py-12 z-10 flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto mb-8 flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-foreground font-sans">
            Có Thể Bạn Thắc Mắc
          </h2>
        </div>

        {FAQ_DATA.length > 0 ? (
          <div className="w-full flex flex-col gap-3 font-sans">
            {FAQ_DATA.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="border border-border/60 bg-card/20 rounded-lg overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-xs lg:text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={cn(
                      "size-4 text-muted-foreground transition-transform duration-300 shrink-0 ml-4",
                      isOpen && "rotate-180 text-primary"
                    )} />
                  </button>
                  <div className={cn(
                    "px-5 overflow-hidden transition-all duration-300 ease-in-out font-mono text-[0.65rem] text-muted-foreground leading-relaxed border-t border-border/10",
                    isOpen ? "max-h-40 py-3.5 opacity-100" : "max-h-0 py-0 opacity-0 pointer-events-none border-t-transparent"
                  )}>
                    {faq.a}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="w-full py-8 px-6 rounded-lg border border-dashed border-border/60 bg-card/10 text-center font-mono text-xs text-muted-foreground/70">
            [ MỤC CÂU HỎI THƯỜNG GẶP ĐANG ĐƯỢC TỔ ĐIỀU TRA BIÊN SOẠN & CẬP NHẬT ]
          </div>
        )}
      </section>
    </>
  )
}
