"use client";

import { Package, Globe2, Check } from "lucide-react";

export function LandingDualPlaySection() {
  return (
    <section
      id="hinh-thuc-choi"
      className="relative w-full max-w-5xl px-5 sm:px-6 py-12 sm:py-16 z-10 flex flex-col items-center select-none scroll-mt-16"
    >
      {/* Tiêu đề ngắn gọn, đúng trọng tâm */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight font-sans">
          Chơi theo cách của bạn
        </h2>
      </div>

      {/* 2 Cột so sánh giá trị súc tích */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {/* CỘT 1: HỘP HỒ SƠ VẬT LÝ */}
        <div className="relative border-t-4 border-amber-500 bg-[oklch(0.21_0.009_265)] p-5 sm:p-6 flex flex-col justify-between">

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-9 rounded-lg bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                <Package className="size-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-amber-100 font-sans">
                Bản hộp hồ sơ
              </h3>
            </div>

            <ul className="flex flex-col gap-2.5 text-sm sm:text-base text-zinc-300 font-sans">
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Hồ sơ giấy, ảnh hiện trường và túi vật chứng niêm phong.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Ngồi quanh một bàn, 1–4 người cùng phá án.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Giấy dày, in sắc nét, cầm lên là thấy thật.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CỘT 2: BÀN ĐIỀU TRA TRỰC TUYẾN */}
        <div className="relative border-t-4 border-cyan-500 bg-[oklch(0.21_0.009_265)] p-5 sm:p-6 flex flex-col justify-between">

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-9 rounded-lg bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
                <Globe2 className="size-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-cyan-100 font-sans">
                Bản trực tuyến
              </h3>
            </div>

            <ul className="flex flex-col gap-2.5 text-sm sm:text-base text-zinc-300 font-sans">
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Mở ngay trên điện thoại hoặc máy tính, không cần cài đặt.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Chơi nhóm từ xa, mọi người thấy cùng một tiến độ.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Giá mềm hơn bản hộp. Đua thứ hạng với thám tử khác.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
