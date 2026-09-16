'use client'

import { useState } from 'react'
import { Quote, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TESTIMONIALS_DATA, FAQ_DATA } from '@/lib/data/landing-data'

export function ReviewsAndFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <>
      {/* DETECTIVE TESTIMONIALS (Social Proof) */}
      <section id="danhgia" className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
          <h2 className="text-2xl lg:text-3xl font-black mt-2 uppercase">
            Đánh Giá Từ Thám Tử Đi Trước
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {TESTIMONIALS_DATA.map((t, idx) => (
            <div key={idx} className="relative bg-[#ebe4d5] text-[#2d251e] border border-[#d6cbaf] p-6 shadow-[0_8px_16px_rgba(0,0,0,0.3)] rounded-sm min-h-[240px] flex flex-col justify-between hover:scale-[1.01] hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)] transition-all duration-300">
              <Quote className="absolute top-4 right-4 size-8 text-amber-900/10 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between border-b border-dashed border-[#a3977c] pb-2 mb-4 font-mono">
                  <span className="text-[0.55rem] font-bold text-red-850 uppercase tracking-widest">
                    BÁO CÁO CÔNG TÁC
                  </span>
                </div>

                <p className="font-typewriter text-xs text-zinc-800 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[#d6cbaf] flex justify-between items-end font-typewriter text-[0.55rem]">
                <div className="flex flex-col">
                  <span className="text-[0.45rem] uppercase text-zinc-500 font-sans font-bold">ĐIỀU TRA VIÊN</span>
                  <span className="text-zinc-900 font-bold text-[0.7rem]">{t.author}</span>
                </div>
                <div className="text-right">
                  <span className="text-[0.45rem] uppercase text-zinc-500 font-sans block font-bold">ĐƠN VỊ</span>
                  <span className="text-zinc-700">{t.div}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION (Accordions) */}
      <section id="faq" className="w-full max-w-4xl px-6 py-16 z-10 border-t border-border/20 flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col items-center">
          <h2 className="text-2xl lg:text-3xl font-black mt-2 uppercase">
            Hỏi Đáp Nhanh
          </h2>
        </div>

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
      </section>
    </>
  )
}
