'use client'

import { Button } from '@/components/ui/button'
import { MessageSquare, LifeBuoy, Lock } from 'lucide-react'

export function LandingFeaturesSection() {
  return (
    <>
      {/* WHAT'S IN THE BOX SECTION */}
      <section className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20 bg-card/5">
        <div className="max-w-4xl mx-auto rounded-lg border border-border bg-card/25 p-6 lg:p-10 shadow-[0_8px_24px_rgba(0,0,0,0.5)] relative overflow-hidden text-left">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/5 rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-1">
              <span className="font-typewriter text-[0.7rem] text-primary uppercase tracking-[0.25em] font-bold block mb-3">
                CÓ GÌ TRONG BOARD GAME
              </span>
              <h2 className="text-xl lg:text-2xl font-bold font-typewriter uppercase text-foreground mb-4">
                Lật giở từng trang tài liệu hiện trường
              </h2>
              <div className="text-xs lg:text-sm text-muted-foreground leading-relaxed font-sans space-y-4">
                <p>
                  Trước khi lao đầu vào đống hỗn loạn này, hãy xem có những gì bên trong hộp hồ sơ vật lý. Bạn sẽ tìm thấy một kho tàng tài liệu, vật thể, và các manh mối hiện trường được thiết kế để đưa bạn đến gần hơn với sự thật.
                </p>
                <p>
                  Nhưng trước hết, bạn <strong className="text-primary uppercase tracking-wider text-xs font-mono">bắt buộc</strong> phải bắt đầu với <strong className="text-foreground">Bức thư ngỏ</strong>. Đây không phải lời chào hỏi xã giao; nó thiết lập bối cảnh, giới thiệu vụ án, và chỉ ra mục tiêu đầu tiên của bạn. Bỏ qua nó, và bạn sẽ lạc lối hơn một nhân chứng mất trí nhớ.
                </p>
                <p>
                  Sau đó, lựa chọn đi tiếp là ở bạn. Mỗi hồ sơ vụ án đều khác nhau: lật giở bức thư cuối cùng của nạn nhân, khám nghiệm hình ảnh hiện trường, hay nghiền ngẫm biên bản khám nghiệm tử thi. Mỗi chi tiết trong hộp đều là một mẩu bánh mì dẫn lối đến kẻ thủ ác. Bạn chỉ cần quyết định xem mình sẽ theo dấu vết nào đầu tiên.
                </p>
              </div>
            </div>

            <div className="w-full md:w-72 shrink-0 relative aspect-[4/3] rounded border border-border/40 overflow-hidden bg-accent/10 shadow-lg">
              <img
                src="/nocturne_game_box.png"
                alt="Nocturne Case Files Box"
                className="w-full h-full object-cover filter brightness-[0.85] sepia-[0.1]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION & FEATURES */}
      <section id="loiich" className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20 bg-card/5">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
          <h2 className="text-2xl lg:text-3xl font-black mt-2 uppercase">
            Tại Sao Nên Chọn Nocturne?
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-center items-stretch mt-8">
          {/* Card 1: Forensic Document */}
          <div className="relative bg-[#ebe4d5] text-[#2d251f] rounded-sm p-6 lg:p-8 shadow-[0_12px_24px_rgba(0,0,0,0.4)] border border-[#d6cbaf] -rotate-1 hover:rotate-0 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between min-h-[320px]">
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
              <h3 className="font-typewriter text-base font-bold uppercase tracking-tight text-[#1c1612]">
                Thiết kế chân thực 100%
              </h3>
              <p className="font-typewriter text-xs leading-relaxed text-zinc-800">
                Mọi tài liệu, biên bản lời khai nhân chứng, bản đồ pháp y và sơ đồ hiện trường được thiết kế chi tiết tỉ mỉ, in ấn giả lập chất liệu hồ sơ lưu trữ thật ngoài đời của cảnh sát. Bạn đang cầm trên tay những mảnh ghép thực sự của vụ án.
              </p>
            </div>
            <div className="mt-6 font-typewriter text-[0.55rem] text-[#7c6f56] flex justify-between items-center border-t border-[#d6cbaf] pt-3">
              <span>MÃ HỒ SƠ: DECT-991A</span>
              <span>PHÒNG LƯU TRỮ VẬT CHỨNG</span>
            </div>
          </div>

          {/* Card 2: Newspaper Clipping */}
          <div className="relative bg-[#f8f6f0] text-zinc-900 rounded-sm p-6 lg:p-8 shadow-[0_12px_24px_rgba(0,0,0,0.4)] border border-zinc-350 rotate-1 hover:rotate-0 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between min-h-[320px]">
            <div className="absolute -top-3.5 left-8 w-4 h-4 bg-red-600 rounded-full shadow-[2px_3px_5px_rgba(0,0,0,0.4)] pointer-events-none after:content-[''] after:absolute after:top-1.5 after:left-1.5 after:w-1 after:h-1 after:bg-white after:rounded-full" />

            <div className="flex flex-col gap-4">
              <div className="border-b-2 border-double border-zinc-900 pb-2 text-center">
                <span className="font-serif text-[0.7rem] uppercase tracking-wider font-black block">
                  CHRONICLE DAILY NEWS
                </span>
                <span className="text-[0.45rem] font-sans text-zinc-500 uppercase tracking-widest">
                  Thứ Bảy, 25 Tháng 7, 2026 // TRANG TIN AN NINH
                </span>
              </div>
              <h3 className="font-serif text-lg font-black uppercase tracking-tight text-zinc-900 mt-1">
                TIN KHẨN: MỞ HỘP LÀ PHÁ ÁN NGAY
              </h3>
              <p className="font-sans text-xs leading-relaxed text-zinc-700">
                Hãy quên đi những cuốn luật chơi dày cộp tẻ nhạt. Với Nocturne, bạn chỉ cần xé bao bì niêm phong tang vật, mở cuốn thư từ ngỏ và bắt đầu cuộc truy vết lập tức. Bản tin ghi nhận: Trải nghiệm nhập vai tức thì đang gây nghiện diện rộng.
              </p>
            </div>

            <div className="mt-4 border border-zinc-300 rounded overflow-hidden relative aspect-[16/6] bg-zinc-200">
              <img src="/newspaper_clipping.png" alt="Newspaper clipping" className="w-full h-full object-cover grayscale opacity-90 contrast-125" />
              <div className="absolute inset-0 bg-amber-900/5 mix-blend-multiply" />
            </div>
          </div>

          {/* Card 3: Polaroid Evidence Photo */}
          <div className="relative polaroid-frame -rotate-1 hover:rotate-0 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between min-h-[320px] bg-[#fbfaf6] p-4 pb-6 border border-zinc-200 shadow-[0_12px_24px_rgba(0,0,0,0.4)] text-zinc-900">
            <div className="absolute -top-3 right-1/4 w-3 h-3 bg-red-800 rounded-full shadow-[1px_2px_4px_rgba(0,0,0,0.4)] pointer-events-none" />

            <div className="w-full aspect-[4/3] overflow-hidden border border-black/10 rounded-sm bg-zinc-100 shadow-inner relative">
              <img
                src="/choi.jpg"
                alt="Group investigation session"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-4 text-center">
              <span className="font-handwriting text-xl text-zinc-800 block mb-1">
                Độc hành hay cùng Đồng Đội?
              </span>
              <p className="font-sans text-[0.65rem] leading-relaxed text-zinc-600 px-1">
                Lựa chọn lý tưởng cho các đêm tụ họp nhóm thám tử (2-5 người) hoặc tự mình nghiền ngẫm manh mối trong không gian yên tĩnh. Bất kỳ phương thức nào cũng đưa bạn vào tâm điểm sự kịch tính.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY ENGAGEMENT & HINTS SUPPORT */}
      <section className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20 bg-card/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="border border-primary/20 bg-primary/5 rounded-lg p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
            <div>
              <span className="font-mono text-[0.55rem] text-primary uppercase font-bold tracking-widest block mb-2">ĐẶC KHU THẢO LUẬN // CỘNG ĐỒNG</span>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Hội Nhóm Thám Tử Tìm Manh Mối</h3>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed font-sans">
                Bạn bị bí? Bạn muốn thảo luận các giả thuyết phá án kỳ lạ cùng hàng nghìn người chơi khác? Hãy tham gia mạng lưới cộng đồng thám tử của chúng tôi trên Facebook và Discord.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => window.open('https://facebook.com', '_blank')}
                className="font-mono text-[0.65rem] border-primary/20 hover:border-primary text-primary font-bold uppercase tracking-wider"
              >
                <MessageSquare className="size-3.5 mr-1.5" /> Group Facebook
              </Button>
              <Button
                onClick={() => window.open('https://discord.com', '_blank')}
                className="font-mono text-[0.65rem] font-bold uppercase tracking-wider"
              >
                Tham gia Kênh Discord
              </Button>
            </div>
          </div>

          <div className="border border-border bg-card/20 rounded-lg p-6 lg:p-8 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[0.55rem] text-muted-foreground uppercase font-bold tracking-widest block mb-2">HỖ TRỢ TRỰC TUYẾN // HINTS</span>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Góc Trợ Giúp & Két Bằng Chứng</h3>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed font-sans">
                Hệ thống hỗ trợ gợi ý bảo mật từng bước của Nocturne sẽ giúp bạn khai mở manh mối mà không làm mất đi niềm vui tự mình khám phá. Hoặc truy cập Két Bằng Chứng trực tuyến để xem các bản vá dữ liệu.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 font-mono text-[0.65rem]">
              <a
                href="#faq"
                className="px-4 py-2.5 border border-border/80 hover:text-primary hover:border-primary rounded-md flex items-center justify-center font-bold text-muted-foreground transition-colors uppercase"
              >
                <LifeBuoy className="size-3.5 mr-1.5" /> Hướng Dẫn & Gợi Ý
              </a>
              <a
                href="/activate"
                className="px-4 py-2.5 border border-border/80 hover:text-primary hover:border-primary rounded-md flex items-center justify-center font-bold text-muted-foreground transition-colors uppercase"
              >
                <Lock className="size-3.5 mr-1.5" /> Két Bằng Chứng (Locker)
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
