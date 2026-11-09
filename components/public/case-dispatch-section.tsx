"use client";

import { Check } from "lucide-react";
import { WaitlistForm } from "@/components/public/waitlist-form";

// Sọc mép: giống banner thông báo trên header. Sọc nền: cùng nhịp nhưng vàng rất mờ trên nâu tối.
const SEAL_STRIPES =
  "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.06) 10px, rgba(0,0,0,0.06) 20px)";
const BAND_STRIPES =
  "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245,158,11,0.03) 10px, rgba(245,158,11,0.03) 20px)";

export function CaseDispatchSection() {
  return (
    <section
      className="relative w-full py-10 sm:py-12 px-6 z-10 bg-[#1c1407] select-none"
      style={{ backgroundImage: BAND_STRIPES }}
    >
      {/* Hai mép băng niêm phong vàng */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-4 bg-amber-500" style={{ backgroundImage: SEAL_STRIPES }} />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-4 bg-amber-500" style={{ backgroundImage: SEAL_STRIPES }} />

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative z-10">
        {/* Left Column: Heading & Concise Copy */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-50 font-sans leading-tight text-balance">
            Đừng bỏ lỡ vụ án tiếp theo
          </h2>
          <p className="text-sm sm:text-base text-amber-100/70 font-sans leading-relaxed mt-2">
            Để lại email, bạn sẽ là người đầu tiên biết khi hồ sơ mới được mở, kèm ưu đãi dành riêng cho thám tử.
          </p>
        </div>

        {/* Right Column: Benefits Checklist directly above the Email Input Form */}
        <div className="w-full lg:w-auto shrink-0 flex flex-col items-center lg:items-start gap-2.5">
          {/* Lợi ích đặt ngay trên ô nhập email */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3.5 gap-y-1.5 text-sm font-medium text-amber-100/90 font-sans">
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-amber-400 shrink-0 stroke-[3]" />
              <span>Thông tin mới nhất</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-amber-400 shrink-0 stroke-[3]" />
              <span>Ưu đãi giảm giá</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-amber-400 shrink-0 stroke-[3]" />
              <span>Tư liệu độc quyền</span>
            </div>
          </div>

          {/* Ô nhập Email */}
          <WaitlistForm
            source="dispatch_banner"
            variant="inline"
            placeholder="Email của bạn"
            buttonLabel="Đăng ký"
            className="w-full sm:w-[380px] md:w-[420px]"
          />
        </div>
      </div>
    </section>
  );
}
