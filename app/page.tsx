'use client'

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
  Palette
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MarketingLandingPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeShowcase, setActiveShowcase] = useState<'dossier' | 'phone' | 'key'>('dossier')
  const [activeCategory, setActiveCategory] = useState<'single' | 'combo' | 'accessories'>('single')
  const [theme, setTheme] = useState<'noir' | 'cyber' | 'federal' | 'sepia' | 'crimson'>('noir')
  const [showThemeSelector, setShowThemeSelector] = useState(false)


  // Apply theme to document element
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    // Remove all possible themes
    root.classList.remove('theme-cyber', 'theme-federal', 'theme-sepia', 'theme-crimson')
    // Add active theme class (except default 'noir')
    if (theme !== 'noir') {
      root.classList.add(`theme-${theme}`)
    }
  }, [theme])

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

  // Showcase cases list
  const CASES_DATA = {
    single: [
      {
        id: 'case-9',
        title: 'Bóng Ma Cầu Cảng Số 9',
        difficulty: 3, // out of 5
        age: '16+',
        duration: '60 - 90 phút',
        price: '890.000đ',
        originalPrice: '1.100.000đ',
        badge: 'Được chơi nhiều nhất',
        desc: 'Vụ mất tích đầy bí ẩn của quản đốc Thomas Vance tại cảng biển hoang vắng.',
        image: '/nocturne_case_9.png'
      },
      {
        id: 'case-north',
        title: 'Mật Mã Cảng Bắc',
        difficulty: 5,
        age: '16+',
        duration: '90 - 120 phút',
        price: '950.000đ',
        originalPrice: '1.200.000đ',
        badge: 'Độ khó cao',
        desc: 'Giải mã mạng lưới buôn lậu và các vụ ám hại có tổ chức sâu bên dưới Cảng Bắc.',
        image: '/nocturne_case_north.png'
      }
    ],
    combo: [
      {
        id: 'combo-dual',
        title: 'Tập Hồ Sơ Đặc Nhiệm Dual Case',
        difficulty: 4,
        age: '16+',
        duration: '150 - 210 phút',
        price: '1.650.000đ',
        originalPrice: '2.050.000đ',
        badge: 'Tiết kiệm 15%',
        desc: 'Trọn bộ 2 vụ án Cầu Cảng Số 9 & Mật Mã Cảng Bắc. Trải nghiệm điều tra xuyên suốt từ sơ cấp đến cao cấp.',
        image: '/nocturne_combo_dual.png'
      }
    ],
    accessories: [
      {
        id: 'acc-magnifier',
        title: 'Kính Lúp Thám Tử Nocturne',
        difficulty: 0,
        age: 'Mọi độ tuổi',
        duration: 'Bền bỉ',
        price: '120.000đ',
        originalPrice: '150.000đ',
        badge: 'Phụ kiện',
        desc: 'Kính lúp phóng đại quang học chuyên dụng giúp đọc các mã số cực nhỏ khắc trên chìa khóa vật lý.',
        image: '/nocturne_acc_magnifier.png'
      }
    ]
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

      {/* STICKY HEADER NAV */}
      <header className="sticky top-0 w-full z-50 border-b border-border/10 bg-card/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <BrandMark className="scale-90 origin-left" />
          
          {/* Quick links navigation on the right side */}
          <nav className="hidden md:flex items-center gap-6 font-sans text-sm font-medium text-muted-foreground">
            <a href="#bocanh" className="hover:text-primary transition-colors">Bối cảnh</a>
            <a href="#mm-opportunity" className="hover:text-primary transition-colors">Yếu tố phá án</a>
            <a href="#tuongtac" className="hover:text-primary transition-colors">Tính năng lai</a>
            <a href="#loiich" className="hover:text-primary transition-colors">Lợi ích</a>
            <a href="#phong-pha-an" className="hover:text-primary transition-colors">Vụ án</a>
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
              onClick={() => {
                const el = document.getElementById('phong-pha-an')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="p-2 hover:text-primary transition-colors relative cursor-pointer flex items-center justify-center"
              title="Giỏ hàng"
            >
              <ShoppingCart className="size-4.5" />
              {/* Badge số lượng vật phẩm trong giỏ hàng (ví dụ: đang chọn 1 vụ án) */}
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-destructive text-[0.5rem] font-bold text-white rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                1
              </span>
            </button>

            {/* Nút Đăng nhập máy trạm (Chỉ để icon User/LogIn) */}
            <button 
              onClick={() => router.push('/activate')}
              className="p-2 hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
              title="Đăng nhập máy trạm"
            >
              <User className="size-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION — FULL WIDTH & HEIGHT INTERACTIVE EVIDENCE BOARD */}
      <section className="relative w-full h-[80vh] min-h-[580px] lg:h-[85vh] flex items-center justify-center border-b border-border/10 overflow-hidden">
        {/* Background Interactive Board */}
        <div className="absolute inset-0 w-full h-full z-0">
          <HeroInteractive className="w-full h-full rounded-none border-none" />
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
                onClick={() => router.push('/activate')}
                size="lg"
                className="h-12 px-6 font-mono text-xs font-bold uppercase tracking-widest transition-transform active:scale-[0.98]"
              >
                Khởi Chạy Máy Trạm <ArrowRight className="size-4 ml-1.5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('phong-pha-an')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="h-12 px-6 font-mono text-xs font-bold uppercase tracking-widest border-border/80 text-muted-foreground hover:text-foreground bg-transparent"
              >
                Khám Phá Các Vụ Án
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF & IMPRESSIVE METRICS */}
      <section className="w-full border-t border-b border-border/10 bg-card/5 py-10 z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Trust Media logos */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-widest">ĐƯỢC ĐỀ CẬP & ĐÁNH GIÁ TRÊN</span>
            <div className="flex flex-wrap gap-x-6 gap-y-2 items-center opacity-40 grayscale">
              <span className="font-mono text-sm font-black tracking-tighter">BUZZFEED</span>
              <span className="font-mono text-sm font-black tracking-wide">FAST COMPANY</span>
              <span className="font-mono text-sm font-black">BUSTLE</span>
              <span className="font-mono text-sm font-bold tracking-tight">BOARDGAMEGEEK</span>
            </div>
          </div>
          
          {/* Statistics Grid */}
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

      {/* STORY HOOK SECTION */}
      <section id="bocanh" className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20 bg-card/5">
        <div className="max-w-4xl mx-auto rounded-xl border border-destructive/20 bg-card/30 p-6 lg:p-10 shadow-[0_0_30px_rgba(239,68,68,0.03)] relative">
          <div className="absolute top-4 right-4 text-destructive flex items-center gap-1 font-mono text-[0.6rem] border border-destructive/20 bg-destructive/5 px-2 py-0.5 rounded uppercase font-bold animate-pulse">
            <FileWarning className="size-3" /> Vụ Án Đang Hoạt Động
          </div>

          <span className="font-mono text-[0.6rem] text-destructive uppercase tracking-[0.25em] font-bold block mb-2">
            HỒ SƠ ĐIỀU TRA // VỤ ÁN SỐ NX-4471
          </span>
          <h2 className="text-2xl lg:text-3xl font-black uppercase text-foreground">
            Bóng Ma Cầu Cảng Số 9
          </h2>
          
          <div className="mt-6 border-l-2 border-destructive/60 pl-4 py-1 flex flex-col gap-3.5 text-sm text-muted-foreground leading-relaxed font-sans">
            <p>
              Vào lúc 02:14 sáng ngày 19 tháng 7, hệ thống giám sát tại Cầu cảng số 9 đột ngột mất tín hiệu trong 15 phút. Sáng hôm sau, chiếc áo khoác và cuốn sổ tay ghi chép hàng hóa của quản đốc bến cảng <strong className="text-foreground">Thomas Vance</strong> được tìm thấy trôi dạt trên bãi đá ven bờ.
            </p>
            <p>
              Cảnh sát thu hồi được một chiếc điện thoại di động phụ (burner phone) bị hỏng phân nửa mạch nguồn được giấu trong tủ locker. Toàn bộ tin nhắn trao đổi trong đêm định mệnh đó đã bị xóa sạch hoặc mã hóa bằng thuật toán quân đội.
            </p>
            <p className="italic text-primary/90">
              "Thomas đã phát hiện ra điều gì trong bản kê khai vận đơn container? Ai là kẻ đã gửi tin nhắn burner cuối cùng hẹn anh ta ra mép nước mà không được phép mang điện thoại?"
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 items-center font-mono text-[0.625rem] text-muted-foreground/80 border-t border-border/20 pt-6">
            <div>
              <span className="text-muted-foreground block uppercase">NẠN NHÂN</span>
              <span className="text-foreground font-bold text-xs">Thomas Vance (34T)</span>
            </div>
            <div className="h-6 w-[1px] bg-border/40 hidden sm:block" />
            <div>
              <span className="text-muted-foreground block uppercase">ĐỊA ĐIỂM XẢY RA</span>
              <span className="text-foreground font-bold text-xs">Cầu cảng số 9, Phân khu bến tàu 12</span>
            </div>
            <div className="h-6 w-[1px] bg-border/40 hidden sm:block" />
            <div>
              <span className="text-muted-foreground block uppercase">TANG VẬT THU GIỮ</span>
              <span className="text-foreground font-bold text-xs">1x Burner Phone, 1x Chìa khóa đồng</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES / MEANS MOTIVE OPPORTUNITY (MMO) */}
      <section id="mm-opportunity" className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
          <span className="font-mono text-[0.6rem] text-primary uppercase tracking-[0.22em] font-bold">
            BA YẾU TỐ CỐT LÕI
          </span>
          <h2 className="text-2xl lg:text-3xl font-black mt-2 uppercase">
            Học Thuyết Tam Giác Hình Sự
          </h2>
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            Để khép lại một hồ sơ vụ án, mọi thám tử của hệ thống Nocturne đều phải làm sáng tỏ 3 góc độ:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-border bg-card/10 rounded-lg p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-md w-fit">
              <Zap className="size-5 text-primary" />
            </div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              01 // Phương Tiện (Means)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-mono">
              Nghi phạm có vũ khí gì, công cụ gì hoặc kiến thức chuyên môn nào phù hợp để thực hiện hành vi phạm tội? Tìm kiếm các manh mối vật lý và kỹ thuật trong đống đổ nát.
            </p>
          </div>

          <div className="border border-border bg-card/10 rounded-lg p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-md w-fit">
              <Heart className="size-5 text-primary" />
            </div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              02 // Động Cơ (Motive)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-mono">
              Tại sao hung thủ lại ra tay? Sự thù hận, tranh giành tài sản hay che giấu một vụ bê bối hối lộ cảng biển lớn hơn? Hãy giải mã tin nhắn bí mật để lộ bản chất tâm lý.
            </p>
          </div>

          <div className="border border-border bg-card/10 rounded-lg p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-md w-fit">
              <Compass className="size-5 text-primary" />
            </div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              03 // Cơ Hội (Opportunity)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-mono">
              Hung thủ có mặt ở hiện trường vào đúng thời khắc định mệnh hay không? Đối chiếu dòng thời gian (Timeline) và vị trí của các thiết bị để phá vỡ các chứng cứ ngoại phạm giả.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full max-w-6xl px-6 py-12 z-10 border-t border-border/20">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
          <span className="font-mono text-[0.6rem] text-primary uppercase tracking-[0.22em] font-bold">
            VÒNG LẶP CHƠI GAME
          </span>
          <h2 className="text-2xl lg:text-3xl font-black mt-2 uppercase">
            3 Bước Tham Gia Điều Tra
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[0.625rem] text-muted-foreground">
          <div className="flex flex-col gap-2 p-6 border border-border/50 rounded bg-card/10 relative">
            <span className="absolute top-4 right-4 text-primary/30 text-lg font-black font-sans">01</span>
            <span className="text-primary font-bold text-xs">NHẬN HỘP HỒ SƠ</span>
            <p className="leading-relaxed text-xs mt-1">Một tập hồ sơ vật chứng thực tế được đóng gói chuyên nghiệp sẽ được giao đến tận nhà bạn, chứa các tài liệu thô, hình ảnh hiện trường và các vật thể manh mối.</p>
          </div>
          <div className="flex flex-col gap-2 p-6 border border-border/50 rounded bg-card/10 relative">
            <span className="absolute top-4 right-4 text-primary/30 text-lg font-black font-sans">02</span>
            <span className="text-primary font-bold text-xs">PHÂN TÍCH TANG VẬT TỔNG HỢP</span>
            <p className="leading-relaxed text-xs mt-1">Kết hợp phân tích vật lý với việc đăng nhập vào Máy Trạm Pháp Y trực tuyến để bẻ khóa điện thoại tang vật, định vị GPS, phân tích dữ liệu khôi phục.</p>
          </div>
          <div className="flex flex-col gap-2 p-6 border border-border/50 rounded bg-card/10 relative">
            <span className="absolute top-4 right-4 text-primary/30 text-lg font-black font-sans">03</span>
            <span className="text-primary font-bold text-xs">VẠCH MẶT THỦ PHẠM</span>
            <p className="leading-relaxed text-xs mt-1">Khi đã đối chiếu đủ bằng chứng ngoại phạm và tìm ra M.M.O của hung thủ, truyền báo cáo phá án hoàn chỉnh về trung tâm chỉ huy để hoàn thành nhiệm vụ.</p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PRODUCT SHOWCASE SECTION */}
      <section id="tuongtac" className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20">
        <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col items-center">
          <span className="font-mono text-[0.6rem] text-primary uppercase tracking-[0.22em] font-bold">
            TƯƠNG TÁC LAI ĐỘC QUYỀN
          </span>
          <h2 className="text-2xl lg:text-3xl font-black mt-2 uppercase">
            Liên Kết Vật Lý & Kỹ Thuật Số
          </h2>
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            Nhấp vào từng vật phẩm dưới đây để xem cách bạn tương tác giữa đời thực và máy trạm pháp y trực tuyến.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-3 mb-8 font-mono text-[0.625rem] uppercase">
          {[
            { id: 'dossier' as const, label: 'Tệp hồ sơ giấy' },
            { id: 'phone' as const, label: 'Điện thoại tang vật' },
            { id: 'key' as const, label: 'Chìa khóa đồng đúc' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveShowcase(item.id)}
              className={cn(
                "px-4 py-2 border rounded-md transition-all cursor-pointer font-bold",
                activeShowcase === item.id 
                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_8px_rgba(199,145,55,0.15)]"
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dynamic Comparison Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Physical Side */}
          <div className="border border-border bg-card/25 rounded-lg p-6 flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="font-mono text-[0.55rem] text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded uppercase font-bold">
                {SHOWCASE_ITEMS[activeShowcase].badgeText} // NGOÀI ĐỜI THỰC
              </span>
              <h3 className="text-lg font-black text-foreground mt-3.5 uppercase">
                {SHOWCASE_ITEMS[activeShowcase].title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2 font-mono">
                {SHOWCASE_ITEMS[activeShowcase].desc}
              </p>
            </div>
            <div className="mt-8 relative h-48 overflow-hidden rounded border border-border/40 bg-accent/10">
              <img
                src="/nocturne_game_box.png"
                alt="Nocturne Detective Game Box"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Digital Workspace Side */}
          <div className="border border-primary/30 bg-primary/5 rounded-lg p-6 flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="font-mono text-[0.55rem] text-emerald-500 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold">
                MÁY TRẠM PHÁP Y // TRÊN TRÌNH DUYỆT
              </span>
              <h3 className="text-lg font-black text-foreground mt-3.5 uppercase">
                {SHOWCASE_ITEMS[activeShowcase].digitalTitle}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2 font-mono">
                {SHOWCASE_ITEMS[activeShowcase].digitalDesc}
              </p>
            </div>
            <div className="mt-8 h-32 bg-card/45 border border-primary/20 rounded p-4 flex flex-col justify-between font-mono text-[0.6rem] text-muted-foreground">
              <div className="flex items-center gap-1.5 text-primary">
                <Eye className="size-3.5" /> <span>ĐANG PHÂN TÍCH TỔNG HỢP...</span>
              </div>
              <div className="flex justify-between items-center text-[0.55rem] border-t border-border/20 pt-2 mt-auto">
                <span>DỮ LIỆU ĐỒNG BỘ: OK</span>
                <span>SHA-256 MATCHED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION & FEATURES */}
      <section id="loiich" className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20 bg-card/5">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
          <span className="font-mono text-[0.6rem] text-primary uppercase tracking-[0.22em] font-bold">
            ĐẶC TRƯNG NỔI BẬT
          </span>
          <h2 className="text-2xl lg:text-3xl font-black mt-2 uppercase">
            Tại Sao Nên Chọn Nocturne?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="border border-border bg-card/20 rounded-lg p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-bold">
              <ShieldCheck className="size-5 shrink-0" />
              <span>THIẾT KẾ CHÂN THỰC 100%</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[0.7rem]">
              Mọi tài liệu, ghi chép tay từ nhân chứng đến bản đồ cảnh sát đều được sản xuất và in ấn với chi tiết tỉ mỉ như hồ sơ điều tra thực tế ngoài đời.
            </p>
          </div>

          <div className="border border-border bg-card/20 rounded-lg p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Users className="size-5 shrink-0" />
              <span>PHÙ HỢP CHO MỌI CUỘC VUI</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[0.7rem]">
              Là sự lựa chọn hoàn hảo cho các đêm tụ họp bạn bè (Game Night), những buổi hẹn hò lãng mạn đầy kịch tính (Date Night), hay hành trình phá án độc hành.
            </p>
          </div>

          <div className="border border-border bg-card/20 rounded-lg p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Award className="size-5 shrink-0" />
              <span>MỞ HỘP VÀ CHƠI NGAY</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[0.7rem]">
              Không đòi hỏi đọc những cuốn luật chơi dày đặc phức tạp. Chỉ cần mở bao thư bảo mật, nhập mã kích hoạt trực tuyến và bắt đầu hành trình phá án lập tức.
            </p>
          </div>
        </div>
      </section>

      {/* CASES SHOWCASE / PRODUCT LIST */}
      <section id="phong-pha-an" className="w-full max-w-6xl px-6 py-16 z-10 border-t border-border/20">
        <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col items-center">
          <span className="font-mono text-[0.6rem] text-primary uppercase tracking-[0.22em] font-bold">
            DANH MỤC HỒ SƠ
          </span>
          <h2 className="text-2xl lg:text-3xl font-black mt-2 uppercase">
            Danh Sách Vụ Án Đang Mở
          </h2>
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            Hãy chọn một vụ án phù hợp với năng lực suy luận của bạn. Bản in vật lý sẽ được chuyển tới tay bạn miễn phí.
          </p>
        </div>

        {/* Collection Category Tabs */}
        <div className="flex justify-center gap-3 mb-10 font-mono text-[0.625rem] uppercase">
          {[
            { id: 'single' as const, label: 'Vụ án đơn lẻ' },
            { id: 'combo' as const, label: 'Bộ sưu tập Combo' },
            { id: 'accessories' as const, label: 'Phụ kiện thám tử' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 border rounded-md transition-all cursor-pointer font-bold",
                activeCategory === cat.id 
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {CASES_DATA[activeCategory].map((product) => (
            <div key={product.id} className={cn(
              "border bg-card/30 rounded-lg p-5 flex flex-col justify-between transition-all font-mono",
              product.difficulty >= 4 
                ? "border-destructive/20 hover:border-destructive/50 shadow-[inset_0_0_12px_rgba(239,68,68,0.02)]" 
                : "border-border hover:border-primary/40"
            )}>
              <div>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className={cn(
                    "text-[0.55rem] uppercase px-2 py-0.5 rounded font-bold",
                    product.difficulty >= 3 
                      ? "border-destructive/30 text-destructive bg-destructive/5" 
                      : "border-primary/30 text-primary"
                  )}>
                    {product.badge}
                  </Badge>
                  {product.difficulty > 0 && (
                    <div className={cn(
                      "flex items-center gap-0.5 text-[0.6rem] font-bold",
                      product.difficulty >= 4 ? "text-destructive" : "text-primary"
                    )}>
                      <span>Độ khó:</span>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-2.5 fill-current",
                            i >= product.difficulty && "opacity-20"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Image */}
                {product.image && (
                  <div className="mt-3.5 relative h-40 w-full overflow-hidden rounded border border-border/20 bg-accent/5">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                )}

                <h3 className={cn(
                  "text-base font-black mt-3.5 uppercase tracking-tight",
                  product.difficulty >= 4 ? "text-destructive" : "text-foreground"
                )}>
                  {product.title}
                </h3>
                <p className="text-[0.65rem] text-muted-foreground mt-2 leading-relaxed font-sans">
                  {product.desc}
                </p>

                {/* Case stats */}
                <div className="mt-4 flex gap-4 text-[0.55rem] text-muted-foreground border-t border-b border-border/10 py-2 my-4">
                  <div>
                    <span className="block uppercase text-[0.45rem]">Thời lượng</span>
                    <span className="text-foreground font-bold">{product.duration}</span>
                  </div>
                  <div className="h-6 w-[1px] bg-border/10" />
                  <div>
                    <span className="block uppercase text-[0.45rem]">Độ tuổi</span>
                    <span className="text-foreground font-bold">{product.age}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mt-2">
                  <div>
                    <span className="text-xs text-muted-foreground line-through mr-1.5">{product.originalPrice}</span>
                    <span className="text-base font-bold text-primary">{product.price}</span>
                  </div>
                  <span className="text-[0.45rem] text-emerald-500 font-bold uppercase tracking-wider">MIỄN PHÍ SHIP</span>
                </div>

                <Button
                  onClick={() => alert(`Cảm ơn bạn đã quan tâm đến vụ án "${product.title}". Giao diện thanh toán mẫu đang được kết nối.`)}
                  className="w-full mt-4 h-10 text-[0.65rem] font-bold uppercase tracking-wider"
                >
                  Đặt Mua Ngay
                </Button>
              </div>
            </div>
          ))}
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
          <span className="font-mono text-[0.6rem] text-primary uppercase tracking-[0.22em] font-bold">
            BÁO CÁO NHẬN XÉT
          </span>
          <h2 className="text-2xl lg:text-3xl font-black mt-2 uppercase">
            Đánh Giá Từ Thám Tử Đi Trước
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {[
            {
              author: 'Thám tử Blackwood',
              div: 'Phân khu 9 // Cấp bậc II',
              stars: 5,
              quote: 'Việc kết hợp tài liệu giấy và máy trạm số tạo ra trải nghiệm cực kỳ lôi cuốn. Khi bạn tìm thấy mã PIN viết tay trên mép tài liệu giấy và nhập vào bẻ khóa điện thoại trên web, cảm giác nhập vai vượt trội.'
            },
            {
              author: 'Thám tử V. Dung',
              div: 'Phân khu 4 // Hiện trường vụ án',
              stars: 5,
              quote: 'Bộ công cụ đối chiếu dòng thời gian (Timeline Tool) rất tuyệt vời. Việc so sánh lời khai nói dối của nghi phạm với nhật ký GPS thật để phát hiện điểm mâu thuẫn chớp đỏ làm tôi có cảm giác như thám tử thực thụ.'
            },
            {
              author: 'Thám tử L. Quốc',
              div: 'Tổ Đặc Nhiệm // Điều tra kỹ thuật',
              stars: 4,
              quote: 'Các thông số pháp y như mã băm SHA-256, phân vùng khôi phục dữ liệu burner mang lại chiều sâu công nghệ tuyệt vời. Tuy nhiên việc có nút ẩn bớt các thông số này giúp người chơi không bị ngợp.'
            }
          ].map((t, idx) => (
            <div key={idx} className="p-6 rounded-lg border border-border bg-card/25 flex flex-col justify-between relative">
              <Quote className="absolute top-4 right-4 size-8 text-primary/10 animate-pulse" />
              <div>
                <div className="flex gap-0.5 text-primary mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3 fill-current",
                        i >= t.stars && "opacity-20"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic z-10 font-mono">
                  "{t.quote}"
                </p>
              </div>
              <div className="mt-6 border-t border-border/40 pt-4 flex flex-col font-mono text-[0.6rem]">
                <span className="text-foreground font-bold">{t.author}</span>
                <span className="text-muted-foreground/80 mt-0.5">{t.div}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION (Accordions) */}
      <section id="faq" className="w-full max-w-4xl px-6 py-16 z-10 border-t border-border/20 flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col items-center">
          <span className="font-mono text-[0.6rem] text-primary uppercase tracking-[0.22em] font-bold flex items-center gap-1">
            <HelpCircle className="size-3.5 text-primary" /> GIẢI ĐÁP THẮC MẮC
          </span>
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
              <a href="#faq" className="hover:text-primary transition-colors">Hướng dẫn mua sỉ</a>
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

          {/* Col 4: Payments & Socials */}
          <div className="flex flex-col gap-3 text-xs text-muted-foreground">
            <span className="text-foreground font-bold tracking-tight text-sm">Phương Thức Thanh Toán</span>
            <div className="flex flex-wrap gap-2 text-primary opacity-90">
              <span className="px-2 py-1 border border-border bg-card/20 rounded flex items-center gap-1.5 text-[0.65rem] font-mono">
                <CreditCard className="size-3" /> VISA
              </span>
              <span className="px-2 py-1 border border-border bg-card/20 rounded flex items-center gap-1.5 text-[0.65rem] font-mono">
                <CreditCard className="size-3" /> MASTER
              </span>
              <span className="px-2 py-1 border border-border bg-card/20 rounded flex items-center gap-1.5 text-[0.65rem] font-mono">
                <Truck className="size-3" /> SHIP COD
              </span>
            </div>
            <span className="text-foreground font-bold tracking-tight text-sm mt-3">Theo Dõi Chúng Tôi</span>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="https://facebook.com" className="hover:text-primary transition-colors">Facebook</a>
              <a href="https://youtube.com" className="hover:text-primary transition-colors">YouTube</a>
              <a href="https://tiktok.com" className="hover:text-primary transition-colors">TikTok</a>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto px-6 border-t border-border/10 pt-6 text-center text-xs text-muted-foreground/60">
          <span>© 2026 Nocturne Inc. Bảo lưu mọi quyền truy cập hệ thống.</span>
        </div>
      </footer>

      {/* FLOATING CONTROL PANELS */}
      <div className="fixed bottom-6 right-6 z-50 font-mono text-[0.6rem] flex flex-col items-end gap-2.5">
        {/* Toggle options popover */}
        {showThemeSelector && (
          <div className="bg-card/95 backdrop-blur-md border border-primary/30 rounded-lg p-3 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col gap-1.5 w-44 animate-fade-slide-up">
            <span className="text-primary font-bold uppercase tracking-wider block border-b border-border/10 pb-1 mb-1 text-center text-[0.55rem]">
              STYLE BỘ NHẬN DIỆN
            </span>
            {[
              { id: 'noir' as const, label: 'Classic Noir', desc: 'Mặc định thám tử' },
              { id: 'cyber' as const, label: 'Neon Cyber', desc: 'Hacker tương lai' },
              { id: 'federal' as const, label: 'Federal Navy', desc: 'FBI chính thống' },
              { id: 'sepia' as const, label: 'Vintage Sepia', desc: 'Hồ sơ hoài cổ' },
              { id: 'crimson' as const, label: 'Crimson Forensic', desc: 'Hồ sơ đỏ cấp mật' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id)
                  setShowThemeSelector(false)
                }}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded transition-all cursor-pointer flex flex-col border",
                  theme === t.id
                    ? "bg-primary/20 text-primary border-primary/40 font-bold"
                    : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/10 hover:text-foreground"
                )}
              >
                <span className="text-[0.65rem]">{t.label}</span>
                <span className="text-[0.5rem] opacity-75">{t.desc}</span>
              </button>
            ))}
          </div>
        )}

        {/* Circular Floating Button */}
        <button
          onClick={() => setShowThemeSelector(!showThemeSelector)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border text-muted-foreground shadow-lg hover:text-foreground transition-all cursor-pointer bg-card/90 backdrop-blur-md",
            showThemeSelector ? "border-primary text-primary" : "border-border/60"
          )}
          title="Chọn style bộ nhận diện"
        >
          <Palette className="size-4.5" />
        </button>
      </div>

    </main>
  )
}

