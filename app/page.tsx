'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BrandMark } from '@/components/investigation/brand-mark'
import { HeroInteractive } from '@/components/investigation/hero-interactive'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FolderOpen,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Lock,
  CheckCircle2,
  ChevronDown,
  Quote,
  HelpCircle,
  FileWarning,
  Eye,
  Star,
  Users,
  Award,
  BookOpen,
  Compass,
  MessageSquare,
  LifeBuoy,
  Heart,
  Zap,
  RotateCcw,
  Truck,
  CreditCard,
  User,
  LogIn,
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { UserNav } from '@/components/auth/user-nav'
import { LandingBanner } from '@/components/public/landing-banner'
import { cn } from '@/lib/utils'

export default function MarketingLandingPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeShowcase, setActiveShowcase] = useState<'dossier' | 'phone' | 'key'>('dossier')
  const [activeCategory, setActiveCategory] = useState<'single' | 'combo' | 'accessories'>('single')


  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  // Showcase items list
  const SHOWCASE_ITEMS = {
    dossier: {
      title: 'Tệp Hồ Sơ Vụ Án Giấy',
      desc: 'Bản in hiện vật chứa biên bản khám nghiệm, sơ đồ hiện trường vụ án và thông tin cá nhân nạn nhân.',
      digitalTitle: 'Hồ Sơ Vụ Án Trực Tuyến',
      digitalDesc: 'Dữ liệu được số hóa tự động khi bạn nhập mã kích hoạt, giúp bạn đối chiếu dòng thời gian thám tử.',
      badgeText: 'HỒ SƠ GỐC CẢNG BẮC'
    },
    phone: {
      title: 'Điện Thoại Phụ (Burner Phone)',
      desc: 'Một mẫu điện thoại phím bấm thực tế đi kèm hộp game chứa mã vạch mở khóa đính sau pin.',
      digitalTitle: 'Trình Giả Lập Pháp Y Di Động',
      digitalDesc: 'Giao diện trích xuất chip-off, giải mã tin nhắn đã xóa, xem email nội bộ cảng và định vị GPS di chuyển.',
      badgeText: 'THIẾT BỊ TANG VẬT'
    },
    key: {
      title: 'Chìa Khóa Đồng Đúc',
      desc: 'Mẫu chìa khóa đồng nặng trĩu của cảnh sát chứa mã số chìm khắc trên bề mặt.',
      digitalTitle: 'Hệ Thống Bẻ Khóa Két Sắt',
      digitalDesc: 'Nhập mã số chìa khóa để mở phân vùng bảo mật của máy chủ cảng biển, tìm tệp tin ghi âm lầm bầm của Marsh.',
      badgeText: 'VẬT THỂ LIÊN KẾT'
    }
  }



  // FAQ list
  const FAQ_DATA = [
    {
      q: 'Trò chơi dành cho mấy người chơi?',
      a: 'Bạn có thể chơi một mình như một thám tử độc hành hoặc chơi nhóm từ 2 - 4 người dưới dạng thảo luận, phân chia nhiệm vụ (ví dụ: một người đọc hồ sơ giấy, một người thao tác bẻ khóa trên Web).'
    },
    {
      q: 'Tôi có bắt buộc phải mua hộp game vật lý không?',
      a: 'Có. Trình giả lập trực tuyến này là một phần của trải nghiệm Nocturne. Bạn cần có các tài liệu giấy, mã số chìa khóa và mã kích hoạt in độc quyền trong hộp game vật lý để giải mã các câu đố trên Web.'
    },
    {
      q: 'Thời gian chơi game trung bình là bao lâu?',
      a: 'Vụ án đầu tiên "Ánh Sáng Cảng Biển" có thời gian phá án trung bình từ 60 - 90 phút tùy thuộc vào khả năng lập luận logic và xâu chuỗi manh mối của bạn.'
    },
    {
      q: 'Mạng internet có bắt buộc để chơi game không?',
      a: 'Có, bạn cần kết nối internet để truy cập vào trình giả lập pháp y này. Máy trạm hỗ trợ mượt mà trên cả trình duyệt máy tính, máy tính bảng và điện thoại di động.'
    },
    {
      q: 'Chính sách giao hàng và phí ship thế nào?',
      a: 'Chúng tôi miễn phí vận chuyển tiêu chuẩn toàn quốc cho tất cả các đơn hàng hộp hồ sơ vụ án vật lý. Đơn hàng nội thành Hà Nội/TP.HCM dự kiến nhận trong 1 - 2 ngày, các tỉnh thành khác từ 3 - 4 ngày.'
    },
    {
      q: 'Chính sách đổi trả hàng vật lý nếu thiếu linh kiện?',
      a: 'Nếu hộp hồ sơ nhận được bị rách niêm phong, thiếu linh kiện vật lý (chìa khóa, burner phone mô hình, thẻ bài), chúng tôi sẽ gửi bù linh kiện miễn phí hoặc đổi bộ mới 100% trong vòng 7 ngày kể từ khi nhận hàng.'
    }
  ]

  return (
    <main className="noir-spotlight relative flex flex-col min-h-dvh w-full items-center overflow-x-clip bg-background text-foreground font-sans">
      {/* CRT scanlines overlay */}
      <div
        aria-hidden="true"
        className="noir-scanlines pointer-events-none absolute inset-0 opacity-15 z-20"
      />

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

          {/* Action controls (Search, Cart, LogIn) - Clean uniform spacing */}
          <div className="flex items-center gap-3 text-muted-foreground">
            {/* Search tang vật / hồ sơ */}
            <button 
              onClick={() => alert('Chức năng tìm kiếm dữ liệu vụ án đang được kết nối.')}
              className="p-2 hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
              title="Tìm kiếm hồ sơ"
            >
              <Search className="size-4.5" />
            </button>

            {/* Giỏ hàng mua hộp tang vật */}
            <button 
              onClick={() => router.push('/cases')}
              className="p-2 hover:text-primary transition-colors relative cursor-pointer flex items-center justify-center"
              title="Giỏ hàng"
            >
              <ShoppingCart className="size-4.5" />
              {/* Badge số lượng vật phẩm trong giỏ hàng (ví dụ: đang chọn 1 vụ án) */}
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-destructive text-[0.5rem] font-bold text-white rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                1
              </span>
            </button>

            {/* Nút Đăng nhập / Đăng xuất (Tự động thay đổi theo trạng thái) */}
            <UserNav />
          </div>
        </div>
      </header>

      {/* HERO SECTION — FULL WIDTH & HEIGHT INTERACTIVE EVIDENCE BOARD */}
      <section className="relative w-full h-[80vh] min-h-[580px] lg:h-[85vh] flex items-center justify-center border-b border-border/10 overflow-hidden">
        {/* Background Interactive Board */}
        <div className="absolute inset-0 w-full h-full z-0">
          <HeroInteractive className="w-full h-full rounded-none border-none" controlledCaseId={['case-01','case-02','case-03','case-02','case-01'][activePoster]} />
        </div>

        {/* Foreground Content overlay (No background wrapper) */}
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

      {/* SOCIAL PROOF & IMPRESSIVE METRICS (Tạm ẩn)
      <section className="w-full border-t border-b border-border/10 bg-card/5 py-10 z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-widest">ĐƯỢC ĐỀ CẬP & ĐÁNH GIÁ TRÊN</span>
            <div className="flex flex-wrap gap-x-6 gap-y-2 items-center opacity-40 grayscale">
              <span className="font-mono text-sm font-black tracking-tighter">BUZZFEED</span>
              <span className="font-mono text-sm font-black tracking-wide">FAST COMPANY</span>
              <span className="font-mono text-sm font-black">BUSTLE</span>
              <span className="font-mono text-sm font-bold tracking-tight">BOARDGAMEGEEK</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-l border-border/10 pl-0 md:pl-8 font-mono">
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-primary">12.000+</span>
              <span className="text-[0.55rem] text-muted-foreground uppercase mt-1">Hồ sơ đã gửi</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-primary">4.9/5★</span>
              <span className="text-[0.55rem] text-muted-foreground uppercase mt-1">Đánh giá chung</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-primary">94.2%</span>
              <span className="text-[0.55rem] text-muted-foreground uppercase mt-1">Phá án thành công</span>
            </div>
          </div>
        </div>
      </section>
      */}





      {/* 3D FILM-POSTER CASE CAROUSEL */}
      <section className="w-full max-w-6xl px-6 py-2 z-10 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="relative w-full md:max-w-3xl max-w-xl flex items-center justify-center h-[240px] select-none">
          {/* Navigation Arrows */}
          <button
            onClick={() => setActivePoster((prev) => (prev === 0 ? 4 : prev - 1))}
            className="absolute left-2 md:left-6 z-40 p-2 rounded-full border border-primary/20 bg-background/80 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-all cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            onClick={() => setActivePoster((prev) => (prev === 4 ? 0 : prev + 1))}
            className="absolute right-2 md:right-6 z-40 p-2 rounded-full border border-primary/20 bg-background/80 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-all cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>

          {/* 3D Perspective container */}
          <div className="relative w-full flex items-center justify-center h-[240px]" style={{ perspective: '900px' }}>
            {[
              { id: 0, img: '/nocturne_case_9.png', title: 'Bóng Ma Cầu Cảng Số 9' },
              { id: 1, img: '/nocturne_case_north.png', title: 'Mật Mã Cảng Bắc' },
              { id: 2, img: '/suspect_marsh.png', title: 'Bí Mật Xí Nghiệp Đường Sắt' },
              { id: 3, img: '/newspaper_clipping.png', title: 'Vụ Án Tẩy Xóa Hồ Sơ' },
              { id: 4, img: '/victim_thomas.png', title: 'Hồ Sơ Mất Tích Phân Khu 4' },
            ].map((poster, index) => {
              const total = 5
              const isActive = activePoster === index
              const isLeft = (activePoster - 1 + total) % total === index
              const isRight = (activePoster + 1) % total === index
              const isFarLeft = (activePoster - 2 + total) % total === index
              const isFarRight = (activePoster + 2) % total === index

              const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
              const leftOffset = isMobile ? -120 : -170
              const rightOffset = isMobile ? 120 : 170
              const farLeftOffset = isMobile ? -200 : -320
              const farRightOffset = isMobile ? 200 : 320

              let transformStyle = 'scale(0) translate3d(0, 0, -200px)'
              let opacity = 0
              let zIndex = 5

              if (isActive) {
                transformStyle = 'translate3d(0, 0, 0) scale(1) rotateY(0deg)'
                opacity = 1
                zIndex = 30
              } else if (isLeft) {
                transformStyle = `translate3d(${leftOffset}px, 0, -80px) scale(0.8) rotateY(20deg)`
                opacity = 0.45
                zIndex = 20
              } else if (isRight) {
                transformStyle = `translate3d(${rightOffset}px, 0, -80px) scale(0.8) rotateY(-20deg)`
                opacity = 0.45
                zIndex = 20
              } else if (isFarLeft) {
                transformStyle = `translate3d(${farLeftOffset}px, 0, -140px) scale(0.65) rotateY(35deg)`
                opacity = 0.18
                zIndex = 10
              } else if (isFarRight) {
                transformStyle = `translate3d(${farRightOffset}px, 0, -140px) scale(0.65) rotateY(-35deg)`
                opacity = 0.18
                zIndex = 10
              }

              return (
                <div
                  key={poster.id}
                  onClick={() => setActivePoster(index)}
                  style={{
                    transform: transformStyle,
                    opacity: opacity,
                    zIndex: zIndex,
                    transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                    transformStyle: 'preserve-3d',
                  }}
                  className="absolute w-[150px] h-[212px] aspect-[1/1.414] shadow-[0_12px_30px_rgba(0,0,0,0.85)] border border-border/30 rounded-md overflow-hidden cursor-pointer group"
                >
                  <img 
                    src={poster.img} 
                    alt={poster.title} 
                    className="w-full h-full object-cover filter brightness-[0.85] contrast-105 group-hover:brightness-100 transition-all duration-300"
                  />
                  {/* Subtle paper grain texture overlay */}
                  <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.08, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* WORLD ARCHIVE / LORE SECTION */}
      <section id="bocanh" className="w-full max-w-6xl px-6 py-20 z-10 border-t border-border/20 bg-card/5 relative min-h-[700px] flex items-center justify-center">
        {/* Background ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-[140px] pointer-events-none" />

        {/* 5 SCATTERED PHOTOS — left side */}

        {/* Photo 1: Top Left — lớn, nghiêng mạnh */}
        <div className="hidden lg:block absolute top-20 left-2 w-44 shadow-xl rotate-[-13deg] hover:rotate-[-6deg] hover:scale-105 hover:z-30 transition-all duration-300 select-none cursor-pointer overflow-hidden">
          <img src="/newspaper_clipping.png" alt="" className="w-full h-full object-cover filter sepia-[0.25] brightness-85" />
        </div>

        {/* Photo 2: Mid Left top — chồng lên photo 1 */}
        <div className="hidden lg:block absolute top-[28%] left-0 w-36 shadow-lg rotate-[7deg] hover:rotate-[3deg] hover:scale-105 hover:z-35 transition-all duration-300 select-none cursor-pointer overflow-hidden z-10">
          <img src="/nocturne_case_9.png" alt="" className="w-full h-full object-cover filter grayscale contrast-110" />
        </div>

        {/* Photo 3: Mid Left bottom — lẻ, tách biệt */}
        <div className="hidden lg:block absolute top-[55%] left-14 w-32 shadow-md rotate-[-5deg] hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-300 select-none cursor-pointer overflow-hidden">
          <img src="/suspect_marsh.png" alt="" className="w-full aspect-square object-cover filter grayscale contrast-125" />
        </div>

        {/* Photo 4: Bottom Left — nhỏ, chồng lên photo 3 */}
        <div className="hidden lg:block absolute bottom-16 left-4 w-40 shadow-lg rotate-[9deg] hover:rotate-[4deg] hover:scale-105 hover:z-35 transition-all duration-300 select-none cursor-pointer overflow-hidden z-10">
          <img src="/nocturne_case_north.png" alt="" className="w-full h-full object-cover filter sepia-[0.15] brightness-88" />
        </div>


        {/* 2 PHOTOS ON TOP OF FOLDER STACK — right side, high z-index */}
        {/* Overlay Photo A: nghiêng trái, nằm trên folder phía trái */}
        <div className="hidden lg:block absolute bottom-[420px] right-[80px] w-36 shadow-xl rotate-[-11deg] hover:rotate-[-5deg] hover:scale-105 hover:z-[60] transition-all duration-300 select-none cursor-pointer overflow-hidden z-[55]">
          <img src="/newspaper_clipping.png" alt="" className="w-full h-full object-cover filter sepia-[0.2] brightness-88" />
        </div>
        {/* Overlay Photo B: nghiêng phải, nằm trên folder giữa */}
        <div className="hidden lg:block absolute bottom-[400px] right-[-10px] w-32 shadow-lg rotate-[8deg] hover:rotate-[3deg] hover:scale-105 hover:z-[60] transition-all duration-300 select-none cursor-pointer overflow-hidden z-[55]">
          <img src="/opportunity_evidence.png" alt="" className="w-full aspect-square object-cover filter grayscale brightness-80 contrast-115" />
        </div>

        {/* MANILA FOLDER STACK — right side */}
        <div className="hidden lg:block absolute bottom-16 right-[-20px] w-[290px] h-[400px]">
          {[
            { label: 'NX-4471', title: 'BÓNG MA CẦU CẢNG SỐ 9', status: 'TẠM ĐÌNH CHỈ', idx: 0, defaultR: '16deg',  right: '10px' },
            { label: 'NX-4472', title: 'MẬT MÃ CẢNG BẮC',       status: 'ĐANG MỞ ĐT',   idx: 1, defaultR: '4deg',   right: '44px' },
            { label: 'NX-4473', title: 'BÍ MẬT XÍ NGHIỆP ĐS',   status: 'PHONG TỎA',    idx: 2, defaultR: '-8deg',  right: '78px' },
          ].map((f) => (
            <button
              key={f.idx}
              style={{
                position: 'absolute', bottom: 0, right: f.right,
                rotate: f.defaultR,
                zIndex: (f.idx + 1) * 10,
                transition: 'all 0.55s cubic-bezier(0.25,0.46,0.45,0.94)',
                transformOrigin: 'bottom center', outline: 'none',
              }}
              className="w-[190px] h-[265px] flex flex-col select-none cursor-pointer hover:-translate-y-5 hover:scale-[1.04] hover:z-50"
            >
              {/* Tab */}
              <div style={{ alignSelf:'flex-start', marginLeft:'18px', width:'80px', height:'18px', borderRadius:'4px 4px 0 0', background:'linear-gradient(to bottom,#c8a96e,#b8935a)', border:'1px solid #a07840', borderBottom:'none', boxShadow:'inset 0 1px 0 rgba(255,240,200,0.25)' }} />
              {/* Body */}
              <div style={{ flex:1, borderRadius:'0 4px 3px 3px', border:'1px solid #9a7040', background:'linear-gradient(155deg,#c9a460,#bb9448 45%,#ad8030)', boxShadow:'0 6px 18px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,240,180,0.18)', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'16px 14px 14px', transition:'background .5s,box-shadow .5s' }}>
                {/* Grain */}
                <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.16, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:'160px 160px' }} />
                {/* Bottom fade */}
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'36px', background:'linear-gradient(to top,rgba(80,45,0,0.22),transparent)', pointerEvents:'none' }} />
                {/* Stamp */}
                <div style={{ position:'absolute', top:12, right:10, border:'1.5px solid rgba(180,30,30,0.6)', color:'rgba(175,28,28,0.68)', fontFamily:'monospace', fontSize:'0.38rem', textTransform:'uppercase', letterSpacing:'0.17em', padding:'2px 5px', transform:'rotate(10deg)', fontWeight:900, borderRadius:'2px' }}>{f.status}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  <span style={{ fontFamily:'monospace', fontSize:'0.45rem', color:'rgba(60,35,5,0.6)', letterSpacing:'0.2em', textTransform:'uppercase' }}>{f.label}</span>
                  <h3 style={{ fontFamily:'monospace', fontSize:'0.68rem', fontWeight:900, color:'rgba(25,12,0,0.86)', lineHeight:1.35, textTransform:'uppercase', letterSpacing:'0.04em' }}>{f.title}</h3>
                </div>
                <div style={{ width:'100%', height:'1px', background:'rgba(80,45,0,0.15)' }} />
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
            
            {/* Red Stamp Overlay */}
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

          {/* Mobile: raw images, no border, quick grid */}
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

      {/* HOW TO PLAY & THREE GOLDEN RULES */}
      <section id="mm-opportunity" className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20">
        <div className="text-left mb-10">
          <span className="font-typewriter text-[0.7rem] text-primary uppercase tracking-[0.25em] font-bold">
            HƯỚNG DẪN PHÁ ÁN // HOW TO PLAY
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold font-typewriter mt-3 uppercase text-foreground">
            BẮT ĐẦU CUỘC ĐIỀU TRA
          </h2>
        </div>

        {/* Split Layout: Text on the Left, Image on the Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Descriptions only */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              {/* Introduction Text on the left */}
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

          {/* Right Column: Selector at the top, Interactive Polaroid Photo below */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start gap-4">
            {/* Selection part moved above the Polaroid on the right */}
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
              {/* Simulated Pin */}
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
                
                {/* Micro instructions */}
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[0.5rem] font-mono text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                  {showEvidenceStamp ? "Ấn để ẩn con dấu" : "Ấn để giải mật nhãn"}
                </div>

                {/* Animated Red Stamp Overlay */}
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
          
          {/* Card 1: Forensic Torn Document */}
          <div className="relative bg-[#ebe4d5] text-[#2d251f] rounded-sm p-6 lg:p-8 shadow-[0_12px_24px_rgba(0,0,0,0.4)] border border-[#d6cbaf] -rotate-1 hover:rotate-0 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between min-h-[320px]">
            {/* Simulated Tape strip */}
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
            {/* Pinned pushpin effect */}
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
            
            {/* Small newspaper thumbnail element */}
            <div className="mt-4 border border-zinc-300 rounded overflow-hidden relative aspect-[16/6] bg-zinc-200">
              <img src="/newspaper_clipping.png" alt="Newspaper clipping" className="w-full h-full object-cover grayscale opacity-90 contrast-125" />
              <div className="absolute inset-0 bg-amber-900/5 mix-blend-multiply" />
            </div>
          </div>

          {/* Card 3: Polaroid Evidence Photo */}
          <div className="relative polaroid-frame -rotate-1 hover:rotate-0 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between min-h-[320px] bg-[#fbfaf6] p-4 pb-6 border border-zinc-200 shadow-[0_12px_24px_rgba(0,0,0,0.4)] text-zinc-900">
            {/* Simulated Red string pin */}
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
          {/* Join community card */}
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

          {/* Help & hints support card */}
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

      {/* DETECTIVE TESTIMONIALS (Social Proof) */}
      <section id="danhgia" className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
          <h2 className="text-2xl lg:text-3xl font-black mt-2 uppercase">
            Đánh Giá Từ Thám Tử Đi Trước
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {[
            {
              author: 'Thám tử Blackwood',
              div: 'Phân khu 9 // Tỉnh Cảng Bắc',
              stars: 5,
              quote: 'Việc kết hợp tài liệu giấy và máy trạm số tạo ra trải nghiệm cực kỳ lôi cuốn. Khi bạn tìm thấy mã PIN viết tay trên mép tài liệu giấy và nhập vào bẻ khóa điện thoại trên web, cảm giác nhập vai vượt trội.'
            },
            {
              author: 'Thám tử V. Dung',
              div: 'Phân khu 4 // Tỉnh Cảng Bắc',
              stars: 5,
              quote: 'Bộ công cụ đối chiếu dòng thời gian (Timeline Tool) rất tuyệt vời. Việc so sánh lời khai nói dối của nghi phạm với nhật ký GPS thật để phát hiện điểm mâu thuẫn chớp đỏ làm tôi có cảm giác như thám tử thực thụ.'
            },
            {
              author: 'Thám tử L. Quốc',
              div: 'Tổ Đặc Nhiệm // Tỉnh Cảng Bắc',
              stars: 4,
              quote: 'Các thông số pháp y như mã băm SHA-256, phân vùng khôi phục dữ liệu burner mang lại chiều sâu công nghệ tuyệt vời. Tuy nhiên việc có nút ẩn bớt các thông số này giúp người chơi không bị ngợp.'
            }
          ].map((t, idx) => (
            <div key={idx} className="relative bg-[#ebe4d5] text-[#2d251e] border border-[#d6cbaf] p-6 shadow-[0_8px_16px_rgba(0,0,0,0.3)] rounded-sm min-h-[240px] flex flex-col justify-between hover:scale-[1.01] hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)] transition-all duration-300">
              <Quote className="absolute top-4 right-4 size-8 text-amber-900/10 pointer-events-none" />
              
              <div>
                {/* File Header */}
                <div className="flex items-center justify-between border-b border-dashed border-[#a3977c] pb-2 mb-4 font-mono">
                  <span className="text-[0.55rem] font-bold text-red-850 uppercase tracking-widest">
                    BÁO CÁO CÔNG TÁC
                  </span>
                </div>
                
                {/* Report content */}
                <p className="font-typewriter text-xs text-zinc-800 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Investigator signature */}
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

      {/* COMPREHENSIVE FOOTER */}
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



    </main>
  )
}

