'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function GameRulesShowcase() {
  const [activeRule, setActiveRule] = useState<'means' | 'motive' | 'opportunity'>('means')
  const [showEvidenceStamp, setShowEvidenceStamp] = useState<boolean>(false)

  return (
    <section id="mm-opportunity" className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20">
      <div className="text-left mb-10">
        <span className="font-typewriter text-[0.7rem] text-primary uppercase tracking-[0.25em] font-bold">
          HƯỚNG DẪN PHÁ ÁN // HOW TO PLAY
        </span>
        <h2 className="text-2xl lg:text-3xl font-bold font-typewriter mt-3 uppercase text-foreground">
          BẮT ĐẦU CUỘC ĐIỀU TRA
        </h2>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* Left Column: Descriptions */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="text-xs text-muted-foreground leading-relaxed font-sans space-y-3 mb-2">
              <p>
                <strong className="text-foreground">Chào mừng thám tử.</strong> Bạn đang nắm trong tay hồ sơ vật chứng, danh sách nghi phạm, và một khát khao cháy bỏng được thực thi công lý. Hoặc đơn giản là muốn chứng minh mình là người thông minh nhất phòng. Dù bằng cách nào, bạn cũng sắp dấn thân vào thế giới đen tối đầy rẫy uẩn khúc của một vụ án mạng chưa có lời giải.
              </p>
              <p>
                Tin tốt là gì? Kẻ thủ ác dù có khôn ngoan đến đâu cũng sẽ để lại dấu vết. Để tóm được chúng, bạn chỉ cần tuân theo 3 quy tắc vàng trong điều tra: <strong className="text-primary font-typewriter uppercase text-[0.625rem] tracking-wider">Hung khí, Động cơ, và Cơ hội</strong>. Chỉ duy nhất một kẻ sở hữu cả ba yếu tố này. Nhiệm vụ của bạn là tìm ra kẻ đó.
              </p>
            </div>

            {/* Active Rule Details Panel */}
            <div className="paper-texture border border-amber-900/10 rounded-sm p-6 lg:p-8 shadow-[0_8px_16px_rgba(0,0,0,0.3)] mt-2">
              <span className="font-typewriter text-[0.55rem] uppercase tracking-wider text-red-850 font-bold block border-b border-amber-900/20 pb-2 mb-4">
                {activeRule === 'means' ? 'YẾU TỐ SỐ 01 // CÁCH THỨC' : activeRule === 'motive' ? 'YẾU TỐ SỐ 02 // TÂM LÝ BỊ CÁO' : 'YẾU TỐ SỐ 03 // BẰNG CHỨNG NGOẠI PHẠM'}
              </span>

              <h3 className="font-typewriter text-xl font-bold text-zinc-900 uppercase mb-4">
                {activeRule === 'means' ? 'Hung Khí Gây Án' : activeRule === 'motive' ? 'Động Cơ Phạm Tội' : 'Cơ Hội Tiếp Cận'}
              </h3>

              <p className="text-xs text-zinc-700 leading-relaxed font-sans min-h-[140px]">
                {activeRule === 'means' && (
                  "Một cây nến bằng đồng nằm trơ trọi trong nhà kính? Hay một cú ngã \"vô tình\" được dàn dựng tỉ mỉ nơi cầu thang tối? Hung khí không chỉ là thứ đoạt mạng nạn nhân, đó là chữ ký của kẻ thủ ác — là công cụ, phương pháp và toàn bộ kịch bản mà hắn đã dày công sắp đặt. Từ báo cáo pháp y lạnh ngắt, lời khai quanh co của nhân chứng cho đến những hóa đơn mua sắm tưởng chừng vô hại, tất cả đều giấu kín câu trả lời. Hãy nhớ: dù xảo quyệt đến đâu, không kẻ sát nhân nào có thể hoàn thành tội ác nếu thiếu đi công cụ phù hợp."
                )}
                {activeRule === 'motive' && (
                  "Điều gì khiến một con người sẵn sàng tước đoạt mạng sống của kẻ khác? Một mối tình bị gạt bỏ? Món tiền thừa kế kếch xù? Hay chỉ là nỗi oán hận thâm căn cố đế? Động cơ chính là ngòi nổ bí ẩn — nơi những ham muốn đớn hẹp và đen tối nhất bùng nổ thành tội ác. Đã đến lúc bạn nhập vai một nhà phân tích tâm lý. Hãy rà soát từng dòng tin nhắn riêng tư, giải mã những thương vụ \"đâm sau lưng\", xâu chuỗi các mối tình tay ba và những ân oán tộc họ. Khám phá động cơ không chỉ là tìm hiểu về cái chết, mà là phơi bày toàn bộ bí mật giấu kín đằng sau nó."
                )}
                {activeRule === 'opportunity' && (
                  "Trong điều tra tội phạm, thời gian chính là sự thật. Cơ hội là sự kết hợp hoàn hảo giữa thời điểm và khả năng tiếp cận: Liệu nghi phạm có ở cùng không gian với nạn nhân? Họ có nắm trong tay chiếc chìa khóa két sắt bí mật? Đây là lúc bạn dựng lại dòng thời gian, bóc tách từng chứng cứ ngoại phạm và xác định ai đã ở đâu vào khoảnh khắc định mệnh. Một nghi phạm có thể nắm giữ cả hung khí lẫn động cơ, nhưng nếu họ đang vi vu trên chuyến bay đến Bermuda lúc án mạng xảy ra, họ hoàn toàn vô can — trừ khi, kẻ đó là một bậc thầy thao túng."
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
                  setShowEvidenceStamp(false)
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

          <div className="relative polaroid-frame rotate-1 hover:rotate-0 hover:scale-[1.01] hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all duration-300 bg-[#fbfaf6] p-4 pb-8 border border-zinc-200 shadow-[0_12px_24px_rgba(0,0,0,0.4)] text-zinc-900 w-full max-w-sm flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-red-800 rounded-full shadow-[1px_2px_4px_rgba(0,0,0,0.4)] pointer-events-none z-20" />

            <div
              onClick={() => setShowEvidenceStamp(!showEvidenceStamp)}
              className="w-full aspect-[4/3] overflow-hidden border border-black/10 rounded-sm bg-zinc-150 shadow-inner relative cursor-pointer select-none group"
            >
              <img
                src={activeRule === 'means' ? '/means_evidence.png' : activeRule === 'motive' ? '/motive_evidence.png' : '/opportunity_evidence.png'}
                alt="Evidence Item"
                className="w-full h-full object-cover grayscale brightness-95"
              />
              <div className="absolute inset-0 bg-black/5" />

              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[0.5rem] font-mono text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                {showEvidenceStamp ? "Ấn để ẩn con dấu" : "Ấn để giải mật nhãn"}
              </div>

              {showEvidenceStamp && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-950/20 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-[3px] border-red-700 text-red-650 bg-[#fbfaf6] font-black px-4 py-1.5 uppercase tracking-widest text-xs md:text-sm font-sans rotate-[-8deg] shadow-[0_0_15px_rgba(220,38,38,0.2)] flex flex-col items-center select-none border-double">
                    <span className="text-[0.45rem] font-mono tracking-normal text-red-700">VẬT CHỨNG QUAN TRỌNG</span>
                    <span className="text-base mt-0.5 leading-none">
                      {activeRule === 'means' ? 'HUNG KHÍ' : activeRule === 'motive' ? 'ĐỘNG CƠ' : 'CƠ HỘI'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <span className="font-handwriting text-lg text-zinc-700 block mb-1">
                {activeRule === 'means' ? 'Tang vật thu được tại hiện trường' : activeRule === 'motive' ? 'Nghiên cứu tâm lý hành vi' : 'Đối chiếu sơ đồ ngoại phạm'}
              </span>
              <span className="font-mono text-[0.55rem] text-zinc-400 block uppercase">
                Bản ghi pháp y số: 009-CA-B{activeRule === 'means' ? '1' : activeRule === 'motive' ? '2' : '3'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
