'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function GameRulesShowcase() {
  const [activeRule, setActiveRule] = useState<'means' | 'motive' | 'opportunity'>('means')

  return (
    <section id="mm-opportunity" className="w-full max-w-6xl px-6 py-16 z-10">
      <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
        <h2 className="text-2xl lg:text-3xl font-black uppercase text-foreground">
          HƯỚNG DẪN PHÁ ÁN
        </h2>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* Left Column: Descriptions */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="text-xs text-muted-foreground leading-relaxed font-sans mb-1">
              <p>
                Để phá giải vụ án, mọi suy luận phải hội tụ đủ <strong className="text-foreground font-semibold">3 quy tắc vàng</strong> trong điều tra: <strong className="text-primary font-bold uppercase tracking-wider">Hung khí, Động cơ và Cơ hội</strong>. Kẻ thủ ác duy nhất là kẻ nắm giữ cả 3 yếu tố này.
              </p>
            </div>

            {/* Active Rule Details Panel */}
            <div className="paper-texture border border-amber-900/10 rounded-sm p-5 lg:p-7 shadow-[0_8px_16px_rgba(0,0,0,0.3)] mt-2">
              <h3 className="font-typewriter text-lg font-bold text-zinc-900 uppercase mb-3">
                {activeRule === 'means' ? 'Hung Khí Gây Án' : activeRule === 'motive' ? 'Động Cơ Phạm Tội' : 'Cơ Hội Tiếp Cận'}
              </h3>

              <p className="text-xs text-zinc-700 leading-relaxed font-sans min-h-[70px]">
                {activeRule === 'means' && (
                  "Hung khí là chữ ký của kẻ thủ ác — phương pháp và công cụ tước đoạt mạng sống nạn nhân. Đối chiếu biên bản pháp y, dấu vết hiện trường và hồ sơ vật chứng để xác định chính xác vật gây án."
                )}
                {activeRule === 'motive' && (
                  "Động cơ là ngòi nổ tội ác — tiền bạc, tình ái, thù hận hay bí mật cần chôn giấu. Xâu chuỗi lời khai, tin nhắn riêng tư và các mối quan hệ để bóc tách lý do khiến nghi phạm ra tay."
                )}
                {activeRule === 'opportunity' && (
                  "Cơ hội là khả năng tiếp cận và thời điểm gây án. Dựng lại dòng thời gian, đối chiếu lịch trình di chuyển và lật tẩy các chứng cứ ngoại phạm giả mạo vào thời khắc then chốt."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Rule selection & Interactive Polaroid */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start gap-4">
          <div className="grid grid-cols-3 gap-2 font-mono uppercase w-full max-w-sm">
            {[
              { id: 'means' as const, label: 'Hung Khí' },
              { id: 'motive' as const, label: 'Động Cơ' },
              { id: 'opportunity' as const, label: 'Cơ Hội' }
            ].map((rule) => (
              <button
                key={rule.id}
                onClick={() => {
                  setActiveRule(rule.id)
                }}
                className={cn(
                  "px-2 py-3 border rounded-sm transition-all cursor-pointer text-center flex items-center justify-center font-bold text-xs tracking-wider",
                  activeRule === rule.id
                    ? "bg-[#ebe4d5] border-[#d6cbaf] text-[#2d251e] shadow-sm font-black"
                    : "bg-[#ebe4d5]/30 border-dashed border-[#d6cbaf]/40 text-muted-foreground hover:text-foreground hover:bg-[#ebe4d5]/55"
                )}
              >
                {rule.label}
              </button>
            ))}
          </div>

          <div className="relative polaroid-frame rotate-1 hover:rotate-0 hover:scale-[1.01] hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all duration-300 bg-[#fbfaf6] p-3 sm:p-4 border border-zinc-200 shadow-[0_12px_24px_rgba(0,0,0,0.4)] text-zinc-900 w-full max-w-sm flex flex-col justify-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-red-800 rounded-full shadow-[1px_2px_4px_rgba(0,0,0,0.4)] pointer-events-none z-20" />

            <div className="w-full aspect-[4/3] overflow-hidden border border-black/10 rounded-sm bg-zinc-150 shadow-inner relative select-none">
              <img
                src={activeRule === 'means' ? '/images/landing/means_evidence.png' : activeRule === 'motive' ? '/images/landing/motive_evidence.png' : '/images/landing/opportunity_evidence.png'}
                alt="Evidence Item"
                className="w-full h-full object-cover grayscale brightness-95"
              />
              <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
