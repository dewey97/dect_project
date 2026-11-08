"use client";

import { Package, Globe2, Check } from "lucide-react";

export function LandingDualPlaySection() {
  return (
    <section
      id="trai-nghiem-dieu-tra"
      className="relative w-full max-w-5xl px-5 sm:px-6 py-12 sm:py-16 z-10 flex flex-col items-center select-none scroll-mt-16"
    >
      {/* Tiêu đề ngắn gọn, đúng trọng tâm */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-foreground tracking-tight font-sans">
          Hình Thức Trải Nghiệm
        </h2>
      </div>

      {/* 2 Cột so sánh giá trị súc tích */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {/* CỘT 1: HỘP HỒ SƠ VẬT LÝ */}
        <div className="relative rounded-xl border border-amber-500/35 bg-gradient-to-br from-amber-950/35 via-zinc-900/90 to-amber-950/20 p-5 sm:p-6 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.06)] hover:border-amber-500/60 transition-all duration-300 overflow-hidden">
          {/* Subtle top-left warm illumination */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 w-48 h-48 bg-amber-500/10 blur-2xl rounded-full pointer-events-none"
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-9 rounded-lg bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                <Package className="size-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-amber-100 font-sans">
                Hộp Hồ Sơ Vật Lý
              </h3>
            </div>

            <ul className="flex flex-col gap-2.5 text-xs sm:text-[0.84rem] text-zinc-300 font-sans">
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Hồ sơ giấy, ảnh hiện trường & túi tang vật niêm phong.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Họp bàn phá án trực tiếp cùng nhóm 1–4 người.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span>In ấn mỹ thuật công phu, chuẩn nghiệp vụ trinh thám.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CỘT 2: BÀN ĐIỀU TRA TRỰC TUYẾN */}
        <div className="relative rounded-xl border border-cyan-500/35 bg-gradient-to-br from-cyan-950/35 via-zinc-900/90 to-cyan-950/20 p-5 sm:p-6 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.06)] hover:border-cyan-500/60 transition-all duration-300 overflow-hidden">
          {/* Subtle top-left cool illumination */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 w-48 h-48 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none"
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-9 rounded-lg bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
                <Globe2 className="size-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-cyan-100 font-sans">
                Bàn Điều Tra Trực Tuyến
              </h3>
            </div>

            <ul className="flex flex-col gap-2.5 text-xs sm:text-[0.84rem] text-zinc-300 font-sans">
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Truy cập phá án tức thì trên máy tính & điện thoại mọi lúc.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Chơi nhóm từ xa, đồng bộ tiến trình theo thời gian thực.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Chi phí tối ưu, thi đua bảng xếp hạng thám tử.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
