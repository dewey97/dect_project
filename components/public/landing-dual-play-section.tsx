"use client";

import { motion, useReducedMotion } from "framer-motion";

const BOX_POINTS = [
  "Hồ sơ giấy, ảnh hiện trường và túi vật chứng niêm phong.",
  "Ngồi quanh một bàn, 1–4 người cùng phá án.",
  "Giấy dày, in sắc nét, cầm lên là thấy thật.",
];

const ONLINE_POINTS = [
  "Mở ngay trên điện thoại hoặc máy tính, không cần cài đặt.",
  "Chơi nhóm từ xa, mọi người thấy cùng một tiến độ.",
  "Giá mềm hơn bản hộp. Đua thứ hạng với thám tử khác.",
];

export function LandingDualPlaySection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="hinh-thuc-choi"
      className="relative w-full max-w-5xl px-5 sm:px-6 py-12 sm:py-16 z-10 flex flex-col items-center select-none scroll-mt-16"
    >
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight font-sans">
          Chơi theo cách của bạn
        </h2>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
        {/* Physical edition: an open-topped manila case folder with papers inside */}
        <div className="relative pt-6 flex flex-col">
          <div className="relative flex-1 flex flex-col -rotate-[0.8deg]">
            {/* Back panel tab with typed case number */}
            <div
              aria-hidden="true"
              className="absolute -top-6 left-0 flex h-7 w-36 items-start justify-center rounded-t-lg bg-[#b8a274] pt-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#2b1f14]/70"
            >
              HS-000
            </div>
            {/* Back panel */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-sm rounded-tl-none bg-[#b8a274] shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
            />
            {/* Papers tucked inside, peeking over the front cover */}
            <div
              aria-hidden="true"
              className="absolute left-[7%] right-[12%] top-2 h-24 -rotate-[2.2deg] bg-[#e6dfcc] shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
            />
            <div
              aria-hidden="true"
              className="absolute left-[11%] right-[6%] top-3.5 h-24 rotate-[1.4deg] bg-[#f3eee2] shadow-[0_1px_3px_rgba(0,0,0,0.25)] bg-[repeating-linear-gradient(0deg,transparent_0_9px,rgba(43,31,20,0.18)_9px_10px)] bg-[length:70%_100%] bg-[position:12px_8px] bg-no-repeat"
            />
            {/* Paper clip */}
            <div
              aria-hidden="true"
              className="absolute right-[16%] -top-1.5 h-9 w-3.5 rotate-[6deg] rounded-full border-2 border-zinc-400 shadow-[1px_1px_2px_rgba(0,0,0,0.35)]"
            >
              <div className="absolute inset-x-[2px] top-1 bottom-2 rounded-full border-2 border-zinc-400" />
            </div>

            {/* Front cover */}
            <div className="relative mt-9 flex-1 rounded-sm bg-[#d4c198] p-5 sm:p-6 text-[#2b1f14] shadow-[0_-3px_6px_rgba(0,0,0,0.18)]">
              {/* Cover shading */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-sm bg-[radial-gradient(ellipse_at_center,rgba(255,250,235,0.16),rgba(60,40,20,0.2))]"
              />

              <div className="relative">
                {/* Typed label sticker */}
                <div className="mb-5 inline-block bg-[#f4efe3] px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
                  <h3 className="font-sans text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                    Hồ sơ vật lý
                  </h3>
                </div>

                <ul className="flex flex-col gap-3 font-sans text-sm sm:text-base leading-relaxed">
                  {BOX_POINTS.map((text) => (
                    <li key={text} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-[0.2rem] flex size-3.5 shrink-0 items-center justify-center border border-[#2b1f14]/70 text-[0.6rem] font-bold leading-none"
                      >
                        ✓
                      </span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Online edition: an open laptop */}
        <div className="relative pt-5 flex flex-col">
          {/* Lid with bezel and camera */}
          <div className="relative flex-1 flex flex-col rounded-t-2xl border border-zinc-600/70 bg-gradient-to-b from-zinc-800 to-zinc-900 px-2 pt-4 pb-2 sm:px-2.5 sm:pt-5 sm:pb-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
            <span
              aria-hidden="true"
              className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-zinc-950 ring-1 ring-zinc-600/60"
            />
            <div className="relative flex-1 overflow-hidden rounded-md bg-zinc-950 p-5 sm:p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
              {/* Scanlines */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.025)_0_1px,transparent_1px_3px)]"
              />
              {/* Screen glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-cyan-500/10 blur-3xl"
              />

              <div className="relative">
                <div className="flex items-center justify-end font-mono text-xs uppercase tracking-[0.25em]">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="relative flex size-2">
                      {!reduced && (
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60" />
                      )}
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                    </span>
                    Online
                  </span>
                </div>
                <h3 className="mt-1 mb-5 font-sans text-2xl sm:text-[1.7rem] font-bold leading-tight tracking-tight text-cyan-100">
                  Bản trực tuyến
                </h3>

                <ul className="flex flex-col gap-3 border-t border-zinc-800 pt-4 font-sans text-sm sm:text-base leading-relaxed text-zinc-300">
                  {ONLINE_POINTS.map((text, i) => (
                    <motion.li
                      key={text}
                      className="flex items-start gap-2.5"
                      initial={reduced ? false : { opacity: 0, x: -6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.35, delay: 0.15 + i * 0.3 }}
                    >
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-cyan-400"
                      >
                        &gt;
                      </span>
                      <span>{text}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Base / keyboard deck with thumb notch */}
          <div
            aria-hidden="true"
            className="relative -mx-[5%] h-3 sm:h-3.5 rounded-b-2xl rounded-t-sm bg-gradient-to-b from-zinc-500 via-zinc-700 to-zinc-800 shadow-[0_14px_24px_rgba(0,0,0,0.6)]"
          >
            <span className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-16 sm:w-20 rounded-b-md bg-zinc-800" />
          </div>
        </div>
      </div>
    </section>
  );
}
