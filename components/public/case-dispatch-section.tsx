"use client";

import { Shield, Sparkles, FileText, Bell } from "lucide-react";
import { WaitlistForm } from "@/components/public/waitlist-form";

export function CaseDispatchSection() {
  return (
    <section className="relative w-full py-20 px-6 border-b border-border/10 bg-gradient-to-b from-card/30 via-zinc-950/80 to-background flex flex-col items-center justify-center overflow-hidden z-10">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
        {/* Top classified stamp tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[0.7rem] uppercase tracking-widest backdrop-blur-sm">
          <Shield className="size-3.5" />
          <span>HỒ SƠ NIÊM PHONG ĐẶC BIỆT // XPLORE DISPATCH</span>
        </div>

        {/* Section Heading */}
        <div className="flex flex-col gap-3 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-balance text-zinc-100 font-sans">
            Đăng Ký Nhận Hồ Sơ Chuyên Án Tiếp Theo & Bản In Giới Hạn
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono leading-relaxed text-pretty">
            Gia nhập cộng đồng thám tử XPLORE. Chúng tôi sẽ gửi mật mã mở khóa sớm, tư liệu hiện trường độc quyền của các vụ án tiếp theo và quyền ưu tiên đặt trước bản Board Game vật lý.
          </p>
        </div>

        {/* Value props badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-left">
          <div className="p-3.5 rounded-lg border border-border/20 bg-zinc-950/60 backdrop-blur-sm flex items-start gap-2.5">
            <FileText className="size-4.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-200">Hồ Sơ Vụ Án Mới</span>
              <span className="text-[0.7rem] text-muted-foreground font-mono">Thông báo ngay khi ra mắt Case #001 & #002.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border/20 bg-zinc-950/60 backdrop-blur-sm flex items-start gap-2.5">
            <Sparkles className="size-4.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-200">Manh Mối Độc Quyền</span>
              <span className="text-[0.7rem] text-muted-foreground font-mono">Nhận gợi ý ẩn & lời giải mật mã qua email.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border/20 bg-zinc-950/60 backdrop-blur-sm flex items-start gap-2.5">
            <Bell className="size-4.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-200">Ưu Đãi Đặt Trước</span>
              <span className="text-[0.7rem] text-muted-foreground font-mono">Giảm 25% cho đợt phát hành hộp Boardgame đầu tiên.</span>
            </div>
          </div>
        </div>

        {/* Waitlist Form Card */}
        <WaitlistForm
          source="dispatch_banner"
          variant="card"
          placeholder="Nhập email của bạn (ví dụ: detective@xplore.vn)..."
          buttonLabel="ĐĂNG KÝ HỒ SƠ"
          className="mt-2"
        />
      </div>
    </section>
  );
}
