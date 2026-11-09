"use client";

import { useEffect, useState } from "react";
import { EvidenceMarker } from "./evidence-marker";

const PLAYERS = ["Minh", "An", "Khoa"];
const CHECKPOINTS = [
  "Mở khóa điện thoại",
  "Đối chiếu lời khai",
  "Xác định động cơ",
  "Nộp kết luận",
];

/**
 * Illustration only: three devices in the same room. Every few seconds one player solves
 * the next checkpoint and it lights up on every device at once (shared progress).
 */
export function LandingGroupSyncShowcase() {
  const [solved, setSolved] = useState(1);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    if (media.matches) {
      setSolved(3);
      return;
    }
    const id = window.setInterval(() => {
      setSolved((s) => (s >= CHECKPOINTS.length ? 1 : s + 1));
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  const solver = PLAYERS[(solved - 1) % PLAYERS.length];

  return (
    <div id="choi-nhom" className="relative w-full pt-6 sm:pt-8 select-none">
      <div className="w-full flex flex-col gap-4 sm:gap-5">
        {/* Visual: three devices sharing one progress */}
        <div
          aria-hidden="true"
          className="relative w-full flex items-center justify-center md:justify-start py-2 order-2"
        >
          <div className="relative flex items-end gap-3">
            {PLAYERS.map((name, i) => {
              const isSolver = name === solver && !reduced;
              return (
                <div
                  key={name}
                  className={`w-[92px] sm:w-[120px] lg:w-[132px] xl:w-[148px] rounded-2xl border bg-zinc-950/90 p-2.5 shadow-[0_16px_32px_rgba(0,0,0,0.6)] transition-colors duration-500 ${
                    isSolver ? "border-amber-400/70" : "border-zinc-700/80"
                  } ${i === 1 ? "-translate-y-4" : ""}`}
                >
                  <div className="mb-2 flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSolver ? "bg-amber-400" : "bg-emerald-400/80"
                      }`}
                    />
                    <span className="text-[0.65rem] font-mono text-zinc-300">
                      {name}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {CHECKPOINTS.map((cp, j) => {
                      const done = j < solved;
                      return (
                        <li
                          key={cp}
                          className={`h-2.5 rounded-full transition-colors duration-500 ${
                            done ? "bg-amber-400/90" : "bg-zinc-800"
                          }`}
                        />
                      );
                    })}
                  </ul>
                  <div className="mt-2 text-[0.6rem] font-mono text-zinc-500 tabular-nums">
                    {solved}/{CHECKPOINTS.length}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-start text-left gap-3 max-w-lg z-10 order-1">
          <div className="flex items-end gap-3">
            <EvidenceMarker n={3} className="shrink-0 -rotate-[3deg]" />
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-200 font-sans">
              Chơi nhóm, đồng bộ tiến trình
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
