'use client'

import { useState } from 'react'
import { Quote, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TESTIMONIALS_DATA, FAQ_DATA } from '@/lib/data/landing-data'

export function ReviewsAndFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {/* DETECTIVE TESTIMONIALS (Auto-scrolling Marquee & Social Proof) */}
      <section id="danhgia" className="w-full py-12 z-10 overflow-hidden flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto mb-8 px-6 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground font-sans">
            Thám tử đi trước nói gì
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
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                      {t.author}
                    </span>
                    <span className="text-xs text-amber-700">★★★★★</span>
                  </div>

                  <p className="text-sm text-zinc-800 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#a3977c]/30 text-xs font-mono text-zinc-600 truncate">
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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground font-sans">
            Câu hỏi thường gặp
          </h2>
        </div>

        {FAQ_DATA.length > 0 ? (
          <div className="w-full flex flex-col gap-3 font-sans">
            {FAQ_DATA.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="border border-zinc-700 bg-card/40 rounded-lg overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full min-h-11 px-5 py-4 flex items-center justify-between text-left font-bold text-sm lg:text-base text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={cn(
                      "size-4 text-muted-foreground transition-transform duration-300 shrink-0 ml-4",
                      isOpen && "rotate-180 text-primary"
                    )} />
                  </button>
                  <div className={cn(
                    "px-5 overflow-hidden transition-all duration-300 ease-in-out font-sans text-sm text-muted-foreground leading-relaxed border-t border-border/10",
                    isOpen ? "max-h-60 py-3.5 opacity-100" : "max-h-0 py-0 opacity-0 pointer-events-none border-t-transparent"
                  )}>
                    {faq.a}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="w-full py-8 px-6 rounded-lg border border-dashed border-border/60 bg-card/10 text-center font-sans text-sm text-muted-foreground/70">
            [ MỤC CÂU HỎI THƯỜNG GẶP ĐANG ĐƯỢC TỔ ĐIỀU TRA BIÊN SOẠN & CẬP NHẬT ]
          </div>
        )}
      </section>
    </>
  )
}
