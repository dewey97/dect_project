"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { BookOpen, X } from "lucide-react";
import { TypewriterNarrator } from "./evidence/typewriter-narrator";
import { detectiveAudio } from "@/lib/investigation-audio";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
import { cn } from "@/lib/utils";

interface EpilogueModalProps {
  isOpen: boolean;
  onClose?: () => void;
  caseId: string;
}

export function EpilogueModal({
  isOpen,
  onClose,
  caseId,
}: EpilogueModalProps) {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const { checkpoints, loading } = useCaseCheckpoints(caseId);

  // Đọc các bài Hậu Án từ Checkpoint Studio (Supabase) qua useCaseCheckpoints
  const epilogueStories = useMemo(() => {
    // 1. Tìm checkpoint epilogue tổng kết (kind = epilogue hoặc id cp-*-epilogue)
    const mergedCp = checkpoints.find(
      (c) =>
        c.kind === "epilogue" ||
        c.id.includes("epilogue") ||
        (c.epilogueStories && c.epilogueStories.length > 0),
    );

    if (mergedCp?.epilogueStories && mergedCp.epilogueStories.length > 0) {
      return mergedCp.epilogueStories.map((story, idx) => ({
        id: story.id || `epilogue-${idx}`,
        title: story.title || `Hậu Án ${idx + 1}`,
        monologue: story.monologue || "",
      }));
    }

    // 2. Tìm toàn bộ checkpoints có hậu án hoặc epilogue riêng lẻ
    const dynamicEpilogues = checkpoints.filter(
      (c) =>
        c.kind === "epilogue" ||
        c.id.includes("epilogue") ||
        c.id.includes("hau-an") ||
        c.title?.toLowerCase().includes("hậu án"),
    );

    if (dynamicEpilogues.length > 0) {
      return dynamicEpilogues.map((cp, idx) => ({
        id: cp.id,
        title: cp.title || `Hậu Án ${idx + 1}`,
        monologue: cp.storyConfig?.monologue || "",
      }));
    }

    // 3. Fallback nếu case chưa cấu hình epilogue riêng: Lấy checkpoint kết án cuối
    const lastCp = checkpoints[checkpoints.length - 1];
    return [
      {
        id: lastCp?.id || "epilogue-final",
        title: lastCp?.title || "Khép lại chuyên án",
        monologue:
          lastCp?.storyConfig?.monologue ||
          "Chuyên án điều tra chính thức khép lại. Mọi chứng cứ và diễn biến đã được thu thập đầy đủ.",
      },
    ];
  }, [checkpoints]);

  if (!isOpen) return null;

  const currentStory = epilogueStories[activeStoryIdx] || epilogueStories[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none pt-safe">
        {/* CRT Scanlines effect */}
        <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full z-0" />

        {/* Header Bar */}
        <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-amber-900/30 bg-[#0c0805]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-400">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase text-amber-200">
                KÝ SỰ HẬU ÁN — TỔNG KẾT CHUYÊN ÁN
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                {caseId.toUpperCase()} // BÁO CÁO KẾT THÚC ĐIỀU TRA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Đóng hậu án"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </header>

        {/* Story tabs navigation */}
        {epilogueStories.length > 1 && (
          <nav className="relative z-20 flex gap-2 px-6 py-3 border-b border-amber-900/20 bg-[#120c08]/60 overflow-x-auto custom-scrollbar shrink-0">
            {epilogueStories.map((story, idx) => (
              <button
                key={story.id || idx}
                type="button"
                onClick={() => {
                  detectiveAudio.playPaperRustle();
                  setActiveStoryIdx(idx);
                }}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-mono tracking-wide uppercase transition-all whitespace-nowrap",
                  activeStoryIdx === idx
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                )}
              >
                {story.title}
              </button>
            ))}
          </nav>
        )}

        {/* Story content area */}
        <main className="relative z-20 flex-1 overflow-y-auto custom-scrollbar px-6 py-8 max-w-3xl mx-auto w-full flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-l-2 border-amber-500/50 pl-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/80 block">
                PHẦN {activeStoryIdx + 1} / {epilogueStories.length}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-amber-100 tracking-tight mt-1">
                {currentStory?.title}
              </h1>
            </div>

            <div className="text-zinc-200 leading-relaxed text-sm sm:text-base font-serif whitespace-pre-line bg-black/40 border border-amber-950/40 rounded-xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
              <TypewriterNarrator
                text={currentStory?.monologue || ""}
                speed={20}
              />
            </div>
          </div>

          {/* Footer Controls */}
          <footer className="mt-8 pt-4 border-t border-amber-900/20 flex items-center justify-between shrink-0">
            <button
              type="button"
              disabled={activeStoryIdx === 0}
              onClick={() => {
                detectiveAudio.playPaperRustle();
                setActiveStoryIdx((prev) => Math.max(0, prev - 1));
              }}
              className="px-4 py-2 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
            >
              ← Phần trước
            </button>

            {activeStoryIdx < epilogueStories.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playPaperRustle();
                  setActiveStoryIdx((prev) =>
                    Math.min(epilogueStories.length - 1, prev + 1),
                  );
                }}
                className="px-5 py-2 rounded bg-amber-500 text-black font-semibold text-xs tracking-wide hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"
              >
                Phần tiếp theo →
              </button>
            ) : (
              onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded bg-emerald-600 text-white font-semibold text-xs tracking-wide hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Hoàn tất chuyên án ✓
                </button>
              )
            )}
          </footer>
        </main>
      </div>
    </AnimatePresence>
  );
}
