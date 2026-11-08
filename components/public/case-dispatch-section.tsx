"use client";

import { Check } from "lucide-react";
import { WaitlistForm } from "@/components/public/waitlist-form";

export function CaseDispatchSection() {
  return (
    <section className="relative w-full py-12 sm:py-16 px-6 z-10 bg-gradient-to-r from-amber-950/35 via-zinc-900/60 to-amber-950/20 border-y border-amber-500/20 select-none">
      {/* Background subtle light blur */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[200px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"
      />

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative z-10">
        {/* Left Column: Heading & Concise Copy */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-100 font-sans leading-tight">
            Chuyên Án Tiếp Theo & Bản In Giới Hạn
          </h2>
          <p className="text-xs sm:text-[0.84rem] text-muted-foreground font-sans leading-relaxed mt-2.5">
            Gia nhập cộng đồng thám tử XPLORE để nhận mật mã mở khóa sớm, tư liệu hiện trường độc quyền và quyền ưu tiên đặt trước bản Board Game vật lý.
          </p>
        </div>

        {/* Right Column: Benefits Checklist directly above the Email Input Form */}
        <div className="w-full lg:w-auto shrink-0 flex flex-col items-center lg:items-start gap-2.5">
          {/* Lợi ích đặt ngay trên ô nhập email */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3.5 gap-y-1.5 text-[0.72rem] text-zinc-300 font-sans">
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-amber-400 shrink-0" />
              <span>Hồ sơ vụ án mới</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-amber-400 shrink-0" />
              <span>Tư liệu độc quyền</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-amber-400 shrink-0" />
              <span>Ưu đãi bản in giới hạn</span>
            </div>
          </div>

          {/* Ô nhập Email */}
          <WaitlistForm
            source="dispatch_banner"
            variant="inline"
            placeholder="Nhập email của bạn..."
            buttonLabel="ĐĂNG KÝ"
            className="w-full sm:w-[380px] md:w-[420px]"
          />
        </div>
      </div>
    </section>
  );
}
