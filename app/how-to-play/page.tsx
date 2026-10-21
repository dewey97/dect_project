import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight, FileText, Search, UserCheck, ShieldAlert } from "lucide-react";
import { BrandMark } from "@/components/investigation/brand-mark";
import { UserNav } from "@/components/auth/user-nav";
import { GameRulesShowcase } from "@/components/public/game-rules-showcase";
import { LandingFooter } from "@/components/public/landing-footer";

export const metadata: Metadata = {
  title: "Hướng Dẫn Phá Án | XPLORE Detective System",
  description:
    "Cẩm nang và quy tắc điều tra phá án: 3 quy tắc vàng Hung khí, Động cơ, Cơ hội và quy trình bóc tách mâu thuẫn đối tượng tình nghi.",
};

export default function HowToPlayPage() {
  return (
    <main className="noir-spotlight min-h-dvh w-full flex flex-col items-center bg-background text-foreground font-sans select-none">
      {/* Sticky Top Header */}
      <header className="sticky top-0 w-full z-50 border-b border-border/10 bg-card/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-border/40">/</span>
            <BrandMark href="/" />
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/evidence/web"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 transition-colors"
            >
              <span>Vào phá án</span>
              <ChevronRight className="size-3" />
            </Link>
            <UserNav />
          </div>
        </div>
      </header>

      {/* Hero Header of Guide */}
      <div className="w-full max-w-4xl px-6 pt-16 pb-6 text-center flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[0.68rem] font-bold tracking-widest uppercase">
          <ShieldAlert className="size-3.5 text-amber-400" />
          <span>Cẩm Nang Thám Tử</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-balance leading-tight">
          Quy Tắc Vàng & Hướng Dẫn Phá Án
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-mono max-w-xl leading-relaxed">
          Mỗi vụ án trong XPLORE là một hiện trường sống động. Hãy nắm vững 3 yếu tố cốt lõi và phương pháp luận suy luận để không bị kẻ thủ ác đánh lừa.
        </p>
      </div>

      {/* Section 1: 3 Golden Rules Showcase */}
      <div className="w-full flex justify-center">
        <GameRulesShowcase />
      </div>

      {/* Section 2: 3-Step Forensic Investigation Process */}
      <section className="w-full max-w-6xl px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center gap-2">
          <h2 className="text-2xl lg:text-3xl font-black uppercase text-foreground">
            QUY TRÌNH 3 BƯỚC ĐIỀU TRA
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono">
            Trình tự bóc tách vụ án từ hiện trường đến bản kết luận điều tra
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-card/40 backdrop-blur-sm flex flex-col gap-4 shadow-sm">
            <div className="size-10 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                  Khám Nghiệm & Đọc Hồ Sơ
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed mt-1">
                Kiểm tra biên bản hiện trường, báo cáo giám định pháp y và trích xuất dữ liệu điện thoại nạn nhân để xác định thời điểm tử vong và hung khí gây án.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-card/40 backdrop-blur-sm flex flex-col gap-4 shadow-sm">
            <div className="size-10 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Search className="size-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                  Thẩm Tra & Bóc Tách Lời Khai
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed mt-1">
                Đối chiếu lời khai các nghi phạm với lịch trình di chuyển thực tế. Tìm ra các mâu thuẫn thời gian và lật tẩy các bằng chứng ngoại phạm giả mạo.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-card/40 backdrop-blur-sm flex flex-col gap-4 shadow-sm">
            <div className="size-10 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <UserCheck className="size-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                  Kết Luận & Chỉ Danh Thủ Phạm
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed mt-1">
                Kẻ thủ ác duy nhất là kẻ hội tụ đủ cả 3 yếu tố: nắm giữ hung khí, có động cơ rõ ràng và có cơ hội gây án tại hiện trường. Hoàn thành bản án và mở khóa phần Hậu Án.
              </p>
            </div>
          </div>
        </div>

        {/* CTA to start case */}
        <div className="mt-14 w-full flex flex-col items-center gap-3 text-center">
          <Link
            href="/evidence/web"
            className="group inline-flex items-center justify-center gap-2.5 h-13 px-10 font-mono text-sm sm:text-base font-black uppercase tracking-wider rounded-md bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] border border-amber-300 transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <span>Bắt Đầu Phá Án Vụ #000</span>
            <ChevronRight className="size-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <span className="text-[0.7rem] font-mono text-muted-foreground">
            Miễn phí trải nghiệm trực tuyến • Không cần cài đặt phần mềm
          </span>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </main>
  );
}
