'use client'

import { CASE_FOLDERS } from '@/lib/data/landing-data'

export function WorldArchiveSection() {
  return (
    <section id="bocanh" className="w-full max-w-6xl px-6 py-20 z-10 border-t border-border/20 bg-card/5 relative min-h-[700px] flex items-center justify-center">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 5 SCATTERED PHOTOS — left side */}
      <div className="hidden lg:block absolute top-20 left-2 w-44 shadow-xl rotate-[-13deg] hover:rotate-[-6deg] hover:scale-105 hover:z-30 transition-all duration-300 select-none cursor-pointer overflow-hidden">
        <img src="/newspaper_clipping.png" alt="" className="w-full h-full object-cover filter sepia-[0.25] brightness-85" />
      </div>

      <div className="hidden lg:block absolute top-[28%] left-0 w-36 shadow-lg rotate-[7deg] hover:rotate-[3deg] hover:scale-105 hover:z-35 transition-all duration-300 select-none cursor-pointer overflow-hidden z-10">
        <img src="/nocturne_case_9.png" alt="" className="w-full h-full object-cover filter grayscale contrast-110" />
      </div>

      <div className="hidden lg:block absolute top-[55%] left-14 w-32 shadow-md rotate-[-5deg] hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-300 select-none cursor-pointer overflow-hidden">
        <img src="/suspect_marsh.png" alt="" className="w-full aspect-square object-cover filter grayscale contrast-125" />
      </div>

      <div className="hidden lg:block absolute bottom-16 left-4 w-40 shadow-lg rotate-[9deg] hover:rotate-[4deg] hover:scale-105 hover:z-35 transition-all duration-300 select-none cursor-pointer overflow-hidden z-10">
        <img src="/nocturne_case_north.png" alt="" className="w-full h-full object-cover filter sepia-[0.15] brightness-88" />
      </div>

      {/* 2 PHOTOS ON TOP OF FOLDER STACK — right side */}
      <div className="hidden lg:block absolute bottom-[420px] right-[80px] w-36 shadow-xl rotate-[-11deg] hover:rotate-[-5deg] hover:scale-105 hover:z-[60] transition-all duration-300 select-none cursor-pointer overflow-hidden z-[55]">
        <img src="/newspaper_clipping.png" alt="" className="w-full h-full object-cover filter sepia-[0.2] brightness-88" />
      </div>
      <div className="hidden lg:block absolute bottom-[400px] right-[-10px] w-32 shadow-lg rotate-[8deg] hover:rotate-[3deg] hover:scale-105 hover:z-[60] transition-all duration-300 select-none cursor-pointer overflow-hidden z-[55]">
        <img src="/opportunity_evidence.png" alt="" className="w-full aspect-square object-cover filter grayscale brightness-80 contrast-115" />
      </div>

      {/* MANILA FOLDER STACK — right side */}
      <div className="hidden lg:block absolute bottom-16 right-[-20px] w-[290px] h-[400px]">
        {CASE_FOLDERS.map((f) => (
          <button
            key={f.idx}
            style={{
              position: 'absolute',
              bottom: 0,
              right: f.right,
              rotate: f.defaultR,
              zIndex: (f.idx + 1) * 10,
              transition: 'all 0.55s cubic-bezier(0.25,0.46,0.45,0.94)',
              transformOrigin: 'bottom center',
              outline: 'none',
            }}
            className="w-[190px] h-[265px] flex flex-col select-none cursor-pointer hover:-translate-y-5 hover:scale-[1.04] hover:z-50"
          >
            {/* Tab */}
            <div style={{ alignSelf: 'flex-start', marginLeft: '18px', width: '80px', height: '18px', borderRadius: '4px 4px 0 0', background: 'linear-gradient(to bottom,#c8a96e,#b8935a)', border: '1px solid #a07840', borderBottom: 'none', boxShadow: 'inset 0 1px 0 rgba(255,240,200,0.25)' }} />
            {/* Body */}
            <div style={{ flex: 1, borderRadius: '0 4px 3px 3px', border: '1px solid #9a7040', background: 'linear-gradient(155deg,#c9a460,#bb9448 45%,#ad8030)', boxShadow: '0 6px 18px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,240,180,0.18)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 14px 14px', transition: 'background .5s,box-shadow .5s' }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.16, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '160px 160px' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '36px', background: 'linear-gradient(to top,rgba(80,45,0,0.22),transparent)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 12, right: 10, border: '1.5px solid rgba(180,30,30,0.6)', color: 'rgba(175,28,28,0.68)', fontFamily: 'monospace', fontSize: '0.38rem', textTransform: 'uppercase', letterSpacing: '0.17em', padding: '2px 5px', transform: 'rotate(10deg)', fontWeight: 900, borderRadius: '2px' }}>{f.status}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.45rem', color: 'rgba(60,35,5,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{f.label}</span>
                <h3 style={{ fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 900, color: 'rgba(25,12,0,0.86)', lineHeight: 1.35, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.title}</h3>
              </div>
              <div style={{ width: '100%', height: '1px', background: 'rgba(80,45,0,0.15)' }} />
            </div>
          </button>
        ))}
      </div>

      {/* Centered Text Container */}
      <div className="max-w-xl mx-auto text-center flex flex-col gap-6 items-center z-10 relative">
        <div className="relative inline-block">
          <span className="font-mono text-[0.6rem] text-amber-500 uppercase tracking-[0.25em] font-bold block mb-2">
            HỒ SƠ THUYẾT MINH // BAN CHUYÊN ÁN HỒ SƠ LẠNH
          </span>
          <h2 className="text-3xl lg:text-4xl font-black uppercase text-foreground tracking-tight leading-none mb-4">
            THÀNH PHỐ BÓNG TỐI
          </h2>
          <div className="absolute -top-7 right-[-72px] border-3 border-red-700/50 text-red-700/70 font-mono text-[0.95rem] uppercase tracking-widest px-4.5 py-2 rotate-[12deg] rounded-sm pointer-events-none font-black shadow-[0_0_8px_rgba(185,28,28,0.15)] z-20">
            Tài Liệu Mật
          </div>
        </div>

        <div className="border-t border-b border-primary/20 py-6 px-4 flex flex-col gap-4 text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
          <p>
            Chào mừng bạn đến với <strong className="text-foreground">Đô thị cảng Đông Bình</strong> — nơi những cơn mưa rào nhiệt đới dai dẳng trút xuống các con hẻm sâu hút và những khu tập thể cũ kỹ loang lổ vôi vữa. Đằng sau ánh đèn neon vàng vọt nhấp nháy bên những quán cà phê cóc ven sông và làn sương ẩm dày đặc từ bến cảng, là một mạng lưới ngầm phức tạp nơi sự thật dễ dàng bị mua bán và chìm vào im lặng.
          </p>
          <p>
            Tại đây, mỗi năm có hàng tá hồ sơ chuyên án bị đóng dấu đỏ <span className="text-destructive font-mono font-bold">"TẠM ĐÌNH CHỈ"</span> rồi xếp xó vào những ngăn tủ sắt bám bụi của phòng hồ sơ lạnh. Một vụ mất tích không dấu vết của người quản đốc ngay trong đêm mưa bão tại Cầu cảng số 9, chiếc điện thoại burner bị đập vỡ góc giấu dưới gầm tủ locker, hay những bản kê khai vận đơn container bị tẩy xóa cẩu thả... Tất cả dường như đều bị thời gian và dư luận bỏ quên.
          </p>
          <p>
            Nhưng hiện trường luôn để lại tiếng nói của nó. Kẻ thủ ác dù có xóa sạch dấu vết đến đâu cũng không thể phủ nhận sự thật vật lý. Chuyên án đang rất cần những thám tử độc lập có bộ óc nhạy bén, sẵn sàng rà soát lại từng bức ảnh đen trắng, đối chiếu biên bản hỏi cung và xâu chuỗi những manh mối nhỏ nhất để trả lại công lý cho nạn nhân. Bạn đã sẵn sàng dấn thân vào hành trình này?
          </p>
        </div>

        {/* Mobile quick grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 lg:hidden w-full max-w-md">
          <div className="overflow-hidden shadow-md rotate-[-2deg]">
            <img src="/newspaper_clipping.png" alt="" className="w-full h-full object-cover filter sepia-[0.2] brightness-90" />
          </div>
          <div className="overflow-hidden shadow-md rotate-[3deg]">
            <img src="/nocturne_case_9.png" alt="" className="w-full h-full object-cover filter grayscale contrast-110" />
          </div>
        </div>
      </div>
    </section>
  )
}
