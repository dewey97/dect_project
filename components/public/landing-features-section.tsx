import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

export function LandingFeaturesSection() {
  return (
    <>
      {/* VALUE PROPOSITION & FEATURES */}
      <section id="loiich" className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20 bg-card/5">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
          <h2 className="text-2xl lg:text-3xl font-black mt-2 uppercase">
            Tại Sao Nên Chọn XPLORE?
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-center items-stretch mt-8">
          {/* Card 1: Forensic Document Form */}
          <div className="relative bg-[#ebe4d5] text-[#2d251f] rounded-sm p-6 lg:p-8 shadow-[0_12px_24px_rgba(0,0,0,0.4)] border border-[#d6cbaf] -rotate-1 hover:rotate-0 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between min-h-[300px]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-7 bg-amber-100/30 border border-amber-250/20 shadow-sm rotate-2 backdrop-blur-[1px] mix-blend-multiply pointer-events-none" />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-dashed border-[#a3977c] pb-2.5">
                <span className="font-typewriter text-[0.6rem] uppercase tracking-widest font-bold text-red-850">
                  HỒ SƠ VẬT CHỨNG #01
                </span>
                <span className="text-[0.55rem] font-mono border border-red-850/30 text-red-850 px-1 rounded uppercase">
                  Tuyệt Mật
                </span>
              </div>
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                <span className="font-typewriter text-xs text-zinc-600/80 uppercase tracking-widest font-bold">
                  [ Fill sau ]
                </span>
              </div>
            </div>
            <div className="mt-6 font-typewriter text-[0.55rem] text-[#7c6f56] flex justify-between items-center border-t border-[#d6cbaf] pt-3">
              <span>MÃ HỒ SƠ: DECT-991A</span>
              <span>PHÒNG LƯU TRỮ VẬT CHỨNG</span>
            </div>
          </div>

          {/* Card 2: Newspaper Clipping Form */}
          <div className="relative bg-[#f8f6f0] text-zinc-900 rounded-sm p-6 lg:p-8 shadow-[0_12px_24px_rgba(0,0,0,0.4)] border border-zinc-350 rotate-1 hover:rotate-0 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between min-h-[300px]">
            <div className="absolute -top-3.5 left-8 w-4 h-4 bg-red-600 rounded-full shadow-[2px_3px_5px_rgba(0,0,0,0.4)] pointer-events-none after:content-[''] after:absolute after:top-1.5 after:left-1.5 after:w-1 after:h-1 after:bg-white after:rounded-full" />

            <div className="flex flex-col gap-4">
              <div className="border-b-2 border-double border-zinc-900 pb-2 text-center">
                <span className="font-serif text-[0.7rem] uppercase tracking-wider font-black block">
                  CHRONICLE DAILY NEWS
                </span>
                <span className="text-[0.45rem] font-sans text-zinc-500 uppercase tracking-widest">
                  TRANG TIN AN NINH // SỐ ĐẶC BIỆT
                </span>
              </div>
              <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
                <span className="font-serif text-sm font-bold text-zinc-700 uppercase tracking-wider">
                  [ Fill sau ]
                </span>
              </div>
            </div>

            <div className="mt-6 font-serif text-[0.55rem] text-zinc-500 flex justify-between items-center border-t border-zinc-300 pt-3">
              <span>XUẤT BẢN TOÀN QUỐC</span>
              <span>LƯU CHIỂU BẢN TIN</span>
            </div>
          </div>

          {/* Card 3: Evidence Note Form */}
          <div className="relative bg-[#fbfaf6] text-zinc-900 rounded-sm p-6 lg:p-8 shadow-[0_12px_24px_rgba(0,0,0,0.4)] border border-zinc-200 -rotate-1 hover:rotate-0 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between min-h-[300px]">
            <div className="absolute -top-3.5 right-8 w-4 h-4 bg-amber-600 rounded-full shadow-[2px_3px_5px_rgba(0,0,0,0.4)] pointer-events-none after:content-[''] after:absolute after:top-1.5 after:left-1.5 after:w-1 after:h-1 after:bg-white after:rounded-full" />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-dashed border-zinc-300 pb-2.5">
                <span className="font-mono text-[0.6rem] uppercase tracking-widest font-bold text-zinc-700">
                  BIÊN BẢN GHI CHÚ #03
                </span>
                <span className="text-[0.55rem] font-mono border border-zinc-400 text-zinc-600 px-1 rounded uppercase">
                  Hiện Trường
                </span>
              </div>
              <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
                <span className="font-handwriting text-xl text-zinc-700 block">
                  [ Fill sau ]
                </span>
              </div>
            </div>

            <div className="mt-6 font-mono text-[0.55rem] text-zinc-500 flex justify-between items-center border-t border-zinc-200 pt-3">
              <span>TỔ ĐIỀU TRA ĐẶC NHIỆM</span>
              <span>GHI CHÚ THỰC ĐỊA</span>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY ENGAGEMENT */}
      <section className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20 bg-card/5">
        <div className="max-w-4xl mx-auto border border-primary/20 bg-primary/5 rounded-lg p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
          <div className="max-w-xl">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">CỘNG ĐỒNG MÊ TRINH THÁM</h3>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed font-sans">
              Kết nối với hàng nghìn thám tử có cùng đam mê, cùng thảo luận các giả thuyết phá án kỳ lạ và chia sẻ manh mối tại cộng đồng XPLORE chính thức trên Group Facebook.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Button
              onClick={() => window.open('https://facebook.com', '_blank')}
              className="font-mono text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/25 border border-amber-400/60 transition-all active:scale-[0.98] cursor-pointer px-5 py-2.5 h-10 flex items-center gap-2"
            >
              <MessageSquare className="size-4 text-zinc-950" />
              <span>Tham Gia Group Facebook</span>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
