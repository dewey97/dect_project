"use client";

import { Package, Globe2, Check } from "lucide-react";

export function LandingDualPlaySection() {
  return (
    <section
      id="trai-nghiem-dieu-tra"
      className="relative w-full max-w-5xl px-5 sm:px-6 py-12 sm:py-16 z-10 flex flex-col items-center select-none scroll-mt-16"
    >
      {/* Tiêu đề ngắn gọn, đúng trọng tâm */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-2 mb-10">
        <span className="text-[0.7rem] font-mono font-bold tracking-widest uppercase text-amber-400">
          Hình Thức Trải Nghiệm
        </span>
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-foreground tracking-tight font-sans">
          Hộp Hồ Sơ Vật Lý × Bàn Điều Tra Trực Tuyến
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-sans">
          Bạn có thể chơi hoàn toàn trên Web hoặc sở hữu trọn bộ Hộp hồ sơ thực tế gửi về tận nhà.
        </p>
      </div>

      {/* 2 Cột so sánh giá trị súc tích */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {/* CỘT 1: HỘP HỒ SƠ VẬT LÝ */}
        <div className="rounded-lg border border-border/70 bg-card/40 p-6 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-8 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                <Package className="size-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-foreground font-sans">
                  Hộp Hồ Sơ Vật Lý
                </h3>
                <span className="text-[0.68rem] font-mono text-amber-400/80">Bộ Kit gửi tận nhà</span>
              </div>
            </div>

            <ul className="flex flex-col gap-3 text-xs sm:text-[0.82rem] text-muted-foreground font-sans">
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Cầm nắm hồ sơ thật: biên bản pháp y, lời khai, ảnh chụp và túi tang vật niêm phong.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Trải nghiệm bàn tròn trực tiếp cho nhóm 1–4 người, chuyền tay xâu chuỗi manh mối.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Bộ sưu tập trinh thám cao cấp với chất liệu in và thiết kế nghiệp vụ chân thực.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CỘT 2: BÀN ĐIỀU TRA TRỰC TUYẾN */}
        <div className="rounded-lg border border-border/70 bg-card/40 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-8 rounded-md bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
                <Globe2 className="size-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-foreground font-sans">
                  Bàn Điều Tra Trực Tuyến
                </h3>
                <span className="text-[0.68rem] font-mono text-cyan-400/80">Chơi trên máy tính & điện thoại</span>
              </div>
            </div>

            <ul className="flex flex-col gap-3 text-xs sm:text-[0.82rem] text-muted-foreground font-sans">
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Chơi cùng bạn bè từ xa, tự động lưu và đồng bộ tiến trình theo thời gian thực.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Bảng xếp hạng thám tử: cạnh tranh thời gian phá án và độ chuẩn xác suy luận.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Mức giá ưu đãi, truy cập phá án tức thì mà không cần chờ đợi giao hàng.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dòng chốt thông điệp tinh gọn */}
      <p className="mt-6 text-center text-xs font-mono text-muted-foreground">
        ✦ Bạn có thể trải nghiệm hoàn toàn qua Web, hoặc dùng Web như trung tâm hỗ trợ bẻ khóa khi chơi bộ hồ sơ vật lý.
      </p>
    </section>
  );
}
