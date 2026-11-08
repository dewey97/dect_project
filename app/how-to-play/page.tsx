import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Search,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Users2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { LandingNavbar } from "@/components/public/landing-navbar";
import { GameRulesShowcase } from "@/components/public/game-rules-showcase";
import { LandingFooter } from "@/components/public/landing-footer";

export const metadata: Metadata = {
  title: "Hướng Dẫn Phá Án & Quy Tắc Vàng | XPLORE",
  description:
    "Cẩm nang điều tra phá án: 3 quy tắc vàng Hung khí, Động cơ, Cơ hội và quy trình 3 bước bóc tách mâu thuẫn đối tượng tình nghi.",
};

export default function HowToPlayPage() {
  return (
    <div className="min-h-dvh w-full flex flex-col justify-between bg-background text-foreground font-sans antialiased selection:bg-amber-500 selection:text-zinc-950">
      {/* Sticky Top Header Nav Synced 100% across the platform */}
      <LandingNavbar active="how-to-play" />

      {/* Main Container */}
      <main className="flex-1 w-full flex flex-col items-center pb-20">
        {/* Hero Header */}
        <div className="w-full max-w-4xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-12 text-center flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[11px] font-bold tracking-widest uppercase">
            <ShieldAlert className="size-3.5 text-amber-400" />
            <span>CẨM NANG NGHIỆP VỤ THỰC CHIẾN</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-balance leading-tight text-zinc-100">
            QUY TẮC VÀNG & HƯỚNG DẪN PHÁ ÁN
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 font-mono max-w-2xl leading-relaxed">
            Mỗi vụ án trong XPLORE là một hiện trường được tái hiện chân thực. Hãy nắm vững phương pháp luận suy luận và tam giác tội ác để bóc trần hung thủ thật sự.
          </p>
        </div>

        {/* Section 1: 3 Golden Rules Showcase */}
        <section className="w-full flex justify-center py-4">
          <GameRulesShowcase />
        </section>

        {/* Section 2: 3-Step Forensic Investigation Process */}
        <section className="w-full max-w-5xl px-4 sm:px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-amber-400">
              TRÌNH TỰ ĐIỀU TRA
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-100">
              QUY TRÌNH 3 BƯỚC PHÁ ÁN
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-mono">
              Trình tự bóc tách kỳ án từ hiện trường sơ khai đến bản kết luận điều tra hoàn chỉnh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="p-6 rounded-none border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="size-9 rounded-none bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                    01
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    BƯỚC KHỞI ĐẦU
                  </span>
                </div>

                <div className="flex items-center gap-2 text-zinc-100 font-bold uppercase text-sm">
                  <FileText className="size-4 text-amber-400" />
                  <span>Khám Nghiệm & Đọc Hồ Sơ</span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Nghiên cứu kỹ biên bản hiện trường ban đầu, báo cáo giám định pháp y và ảnh chụp toàn cảnh 360°. Ghi chú vị trí then cửa, vết ố và vật dụng bị xáo trộn.
                </p>
              </div>

              <div className="border-t border-zinc-900 pt-3 text-[11px] font-mono text-zinc-500">
                Mục tiêu: Xác định thời điểm và cơ chế tử vong.
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-none border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="size-9 rounded-none bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                    02
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    BÓC TÁCH MANH MỐI
                  </span>
                </div>

                <div className="flex items-center gap-2 text-zinc-100 font-bold uppercase text-sm">
                  <Search className="size-4 text-amber-400" />
                  <span>Giải Mã Tang Vật & Lời Khai</span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Bẻ khóa mật khẩu điện thoại tang vật, trích xuất tin nhắn và cuộc gọi bị ẩn. Đối chiếu lời khai các nghi phạm để tìm ra những điểm mâu thuẫn thời gian và động cơ che giấu.
                </p>
              </div>

              <div className="border-t border-zinc-900 pt-3 text-[11px] font-mono text-zinc-500">
                Mục tiêu: Lật tẩy các bằng chứng ngoại phạm giả tạo.
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-none border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="size-9 rounded-none bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                    03
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    KHÉP LẠI CHUYÊN ÁN
                  </span>
                </div>

                <div className="flex items-center gap-2 text-zinc-100 font-bold uppercase text-sm">
                  <UserCheck className="size-4 text-amber-400" />
                  <span>Chỉ Danh Thủ Phạm & Hậu Án</span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Hung thủ duy nhất là kẻ hội tụ đủ: Nắm giữ hung khí, có động cơ rõ ràng và có cơ hội tại hiện trường. Soạn thảo kết luận điều tra và mở khóa tài liệu Hậu Án độc quyền.
                </p>
              </div>

              <div className="border-t border-zinc-900 pt-3 text-[11px] font-mono text-zinc-500">
                Mục tiêu: Đưa sự thật ra ánh sáng và khép lại vụ án.
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Detective Critical Tips */}
        <section className="w-full max-w-5xl px-4 sm:px-6 py-6">
          <div className="rounded-none border border-zinc-800/80 bg-zinc-900/30 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest mb-4">
              <AlertTriangle className="size-4" />
              <span>3 NGUYÊN TẮC BẤT DI BẤT DỊCH CỦA ĐIỀU TRA VIÊN</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs uppercase">
                  <Eye className="size-3.5 text-amber-400" />
                  <span>Không Có Chi Tiết Thừa</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Một mẩu giấy rách, một cốc nước vơi hay một cuộc gọi nhỡ lúc nửa đêm đều có thể là mấu chốt lật ngược toàn bộ thế cờ.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs uppercase">
                  <HelpCircle className="size-3.5 text-amber-400" />
                  <span>Tuyệt Đối Không Đoán Mò</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Hệ thống kiểm tra đáp án nghiêm ngặt qua 2 lớp chứng cứ. Mọi suy đoán thiếu tài liệu đối chứng sẽ bị ban chuyên án bác bỏ.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs uppercase">
                  <Users2 className="size-3.5 text-amber-400" />
                  <span>Sức Mạnh Đồng Đội Realtime</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tạo phòng chơi nhóm để cùng bạn bè soi chứng cứ, vẽ sơ đồ và chỉ điểm manh mối theo thời gian thực trên cùng một bàn phá án.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Call To Action */}
        <section className="w-full max-w-3xl px-4 sm:px-6 pt-14 pb-4 text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-100 sm:text-3xl">
            BẠN ĐÃ SẴN SÀNG BƯỚC VÀO HIỆN TRƯỜNG?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono max-w-lg leading-relaxed">
            Chọn một kỳ án trong kho lưu trữ và bắt đầu bóc tách từng lớp mặt nạ của kẻ thủ ác ngay hôm nay.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/cases"
              className="inline-flex items-center justify-center gap-2 rounded-none bg-amber-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400"
            >
              <span>Xem Tất Cả Vụ Án</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/cases/case_000"
              className="inline-flex items-center justify-center gap-2 rounded-none border border-zinc-700 bg-zinc-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
            >
              <span>Vụ Án Trốn Tìm (#000)</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Synced Landing Footer */}
      <LandingFooter />
    </div>
  );
}
