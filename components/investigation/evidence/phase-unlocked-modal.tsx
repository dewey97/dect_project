"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ImageIcon, Search, X } from "lucide-react";
import { PDFDocument, PhysicalEvidence } from "./evidence-types";
import { TypewriterNarrator } from "./typewriter-narrator";
import { detectiveAudio } from "@/lib/investigation-audio";
import { useCaseNarratives } from "@/lib/hooks/use-case-narratives";
import { setStorageItem } from "@/lib/storage";

export interface UnlockedModalData {
  unlockedPhase: number;
  newPdfs: PDFDocument[];
  newEvidence: PhysicalEvidence[];
}

interface PhaseUnlockedModalProps {
  unlockedModalData: UnlockedModalData | null;
  onClose: () => void;
  onSelectPdf: (pdf: PDFDocument) => void;
  onSelectEvidence: (item: PhysicalEvidence) => void;
  onSetPhaseFilter: (phase: number) => void;
  playExperience?: "web" | "boardgame";
}

export function PhaseUnlockedModal({
  unlockedModalData,
  onClose,
  onSelectPdf,
  onSelectEvidence,
  onSetPhaseFilter,
  playExperience = "web",
}: PhaseUnlockedModalProps) {
  const [isStoryStarted, setIsStoryStarted] = React.useState(false);
  const [isNarrativeComplete, setIsNarrativeComplete] = React.useState(false);

  // Đọc danh sách dẫn truyện cinematic trực tiếp từ tab `narratives` trên Google Sheet Live CMS
  const { getPhaseNarrative } = useCaseNarratives("case-000");

  const currentNarrative = React.useMemo(() => {
    if (!unlockedModalData) return null;
    return getPhaseNarrative(unlockedModalData.unlockedPhase);
  }, [unlockedModalData, getPhaseNarrative]);

  React.useEffect(() => {
    setIsStoryStarted(false);
    setIsNarrativeComplete(false);
  }, [unlockedModalData]);

  React.useEffect(() => {
    if (!unlockedModalData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [unlockedModalData, onClose]);

  const handleStartStory = () => {
    setIsStoryStarted(true);
    setIsNarrativeComplete(false);
    if (unlockedModalData && unlockedModalData.unlockedPhase === 0) {
      setTimeout(() => {
        detectiveAudio.playCeramicShatterSound();
      }, 3000);
    }
  };

  return (
    <AnimatePresence>
      {unlockedModalData && (
        <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none">
          {/* CRT Background scanlines */}
          <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

          {/* Top Bar with Case Identity & Direct Skip */}
          <div className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-[#261b12] bg-[#120c08]/90 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 text-[0.65rem] font-mono font-bold uppercase bg-[#26180f] text-[#d9a066] border border-[#4a3221] rounded">
                HỒ SƠ #000
              </span>
              <span className="font-mono text-xs text-[#ad9885] tracking-wider uppercase hidden sm:inline">
                CHUYÊN ÁN: TRỐN TÌM (1996)
              </span>
            </div>
            <button
              onClick={() => {
                if (unlockedModalData.unlockedPhase === 0) {
                  setStorageItem("intro_seen", "true");
                }
                onSetPhaseFilter(unlockedModalData.unlockedPhase);
                onClose();
              }}
              className="text-xs font-mono text-[#ad9885] hover:text-[#d9a066] px-3 py-1 bg-[#1d130c] hover:bg-[#2a1d13] border border-[#3e2c1e] transition-colors flex items-center gap-1.5 cursor-pointer rounded"
            >
              <span>Vào bàn điều tra</span>
              <span>➔</span>
            </button>
          </div>

          {/* Main Fullscreen Content Area */}
          {playExperience === "boardgame" ? (
            /* BOARD GAME MODE: PURE IMMERSIVE CINEMATIC STORYTELLING (NO RIGHT DIRECTIVE COLUMN) */
            <div className="relative z-20 flex-1 h-full flex flex-col justify-between items-center p-4 sm:p-8 max-w-3xl mx-auto w-full overflow-hidden">
              {currentNarrative && (
                <div className="space-y-6 w-full flex-1 flex flex-col items-center justify-center my-auto py-4 overflow-y-auto custom-scrollbar pr-1">
                  {unlockedModalData.unlockedPhase === 0 && !isStoryStarted ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 animate-fade-in">
                      <div className="space-y-2">
                        <div className="text-[0.7rem] font-mono uppercase tracking-[0.3em] text-[#d9a066]">
                          CỤC CẢNH SÁT ĐIỀU TRA • HỒ SƠ 1996
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f2e6d8] tracking-wide">
                          VỤ ÁN MẠNG XÓM BỜ SÔNG
                        </h2>
                        <p className="text-xs sm:text-sm text-[#ad9885] font-sans leading-relaxed max-w-md">
                          Bạn sắp tiếp nhận lời khai hiện trường và hồ sơ nhân chứng đầu tiên. Hãy bật âm thanh để trải nghiệm trọn vẹn.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col items-center gap-3 w-full max-w-xs">
                        <button
                          onClick={handleStartStory}
                          className="w-full px-6 py-4 bg-[#2a1c12] hover:bg-[#3d2a1b] border-2 border-[#d9a066] text-[#d9a066] hover:text-white font-mono text-sm font-bold tracking-[0.2em] uppercase transition-all cursor-pointer shadow-[0_0_25px_rgba(217,160,102,0.25)] rounded hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <span>▶</span>
                          <span>BẮT ĐẦU [ TRỐN TÌM ]</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setStorageItem("intro_seen", "true");
                            onSetPhaseFilter(0);
                            onClose();
                          }}
                          className="text-xs font-mono text-[#8c7a6b] hover:text-[#d9a066] underline underline-offset-4 transition-colors cursor-pointer"
                        >
                          Bỏ qua lời dẫn & Mở bảng điều tra ngay
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex-1 flex flex-col">
                      <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-widest uppercase border-b border-[#261b12] pb-3 w-full flex items-center justify-between shrink-0">
                        <span>{currentNarrative.date}</span>
                        {!isNarrativeComplete && (
                          <button
                            onClick={() => setIsNarrativeComplete(true)}
                            className="text-[0.7rem] text-[#8c7a6b] hover:text-[#d9a066] font-mono tracking-normal underline"
                          >
                            Bỏ qua hiệu ứng gõ chữ
                          </button>
                        )}
                      </div>

                      <div className="pt-4 w-full flex-1 overflow-y-auto custom-scrollbar">
                        <TypewriterNarrator
                          key={`bg-${unlockedModalData.unlockedPhase}-${currentNarrative.monologue}`}
                          text={currentNarrative.monologue}
                          speed={12}
                          onComplete={() => setIsNarrativeComplete(true)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Clean Bottom Button - ONLY VISIBLE AFTER NARRATION COMPLETES */}
              {isNarrativeComplete && (
                <div className="w-full pt-4 pb-2 shrink-0 max-w-md mx-auto animate-fade-in">
                  <button
                    onClick={() => {
                      if (unlockedModalData.unlockedPhase === 0) {
                        setStorageItem("intro_seen", "true");
                      }
                      onSetPhaseFilter(unlockedModalData.unlockedPhase);
                      onClose();
                    }}
                    className="w-full py-3.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <Search className="size-4.5" />
                    <span>MỞ BẢNG ĐIỀU TRA</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* WEB DIGITAL MODE: SPLIT VIEW (LEFT: STORY, RIGHT: DIGITAL ARCHIVES) */
            <div className="relative z-20 flex-1 h-full flex flex-col lg:grid lg:grid-cols-12 gap-0 overflow-hidden">
              {/* Left Column (60% width): Clean Pure Storytelling Screen */}
              <div className="h-[45vh] lg:h-full lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#261b12] p-4 lg:p-10 flex flex-col justify-start items-center bg-black overflow-y-auto custom-scrollbar shrink-0">
                {currentNarrative && (
                  <div className="space-y-6 max-w-xl mx-auto w-full flex flex-col items-center justify-center py-4 sm:py-6 h-full">
                    {unlockedModalData.unlockedPhase === 0 && !isStoryStarted ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in my-auto">
                        <div className="space-y-2">
                          <div className="text-[0.7rem] font-mono uppercase tracking-[0.3em] text-[#d9a066]">
                            CỤC CẢNH SÁT ĐIỀU TRA • HỒ SƠ 1996
                          </div>
                          <h2 className="text-2xl font-serif font-bold text-[#f2e6d8]">
                            VỤ ÁN MẠNG XÓM BỜ SÔNG
                          </h2>
                          <p className="text-xs text-[#ad9885] font-sans leading-relaxed max-w-sm">
                            Bắt đầu tiếp nhận lời khai và giải mã các đầu mối tài liệu.
                          </p>
                        </div>

                        <div className="pt-2 flex flex-col items-center gap-3 w-full max-w-xs">
                          <button
                            onClick={handleStartStory}
                            className="w-full px-6 py-3.5 bg-[#2a1c12] hover:bg-[#3d2a1b] border-2 border-[#d9a066] text-[#d9a066] hover:text-white font-mono text-sm font-bold tracking-[0.2em] uppercase transition-all cursor-pointer shadow-[0_0_20px_rgba(217,160,102,0.25)] rounded flex items-center justify-center gap-2"
                          >
                            <span>▶</span>
                            <span>BẮT ĐẦU [ TRỐN TÌM ]</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setStorageItem("intro_seen", "true");
                              onSetPhaseFilter(0);
                              onClose();
                            }}
                            className="text-xs font-mono text-[#8c7a6b] hover:text-[#d9a066] underline underline-offset-4 transition-colors cursor-pointer"
                          >
                            Bỏ qua & Vào tài liệu vụ án
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex-1 flex flex-col">
                        <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-widest uppercase border-b border-[#261b12] pb-3 w-full flex items-center justify-between">
                          <span>{currentNarrative.date}</span>
                          {!isNarrativeComplete && (
                            <button
                              onClick={() => setIsNarrativeComplete(true)}
                              className="text-[0.7rem] text-[#8c7a6b] hover:text-[#d9a066] font-mono tracking-normal underline"
                            >
                              Bỏ qua hiệu ứng
                            </button>
                          )}
                        </div>

                        <div className="pt-4 w-full flex-1 overflow-y-auto custom-scrollbar">
                          <TypewriterNarrator
                            key={`web-${unlockedModalData.unlockedPhase}-${currentNarrative.monologue}`}
                            text={currentNarrative.monologue}
                            speed={12}
                            onComplete={() => setIsNarrativeComplete(true)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column (40% width): Unlocked Archives */}
              <div className="flex-1 lg:col-span-5 p-4 lg:p-8 bg-[#160f0a] flex flex-col justify-between overflow-hidden min-h-0">
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#3d2a1b] pb-3 mb-4">
                    <span className="font-mono text-xs text-[#d9a066] uppercase font-bold tracking-wider flex items-center gap-2">
                      <FileText className="size-4" />
                      TÀI LIỆU & TANG VẬT MỚI
                    </span>
                    <span className="font-mono text-xs text-[#ad9885] bg-[#221810] px-2 py-0.5 border border-[#3e2c1e]">
                      {unlockedModalData.newPdfs.length +
                        unlockedModalData.newEvidence.length}{" "}
                      VẬT PHẨM
                    </span>
                  </div>

                  {/* Evidence List Scroll Container */}
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    {unlockedModalData.newPdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className="group flex items-start gap-3 p-3.5 bg-[#221810] border border-[#3e2c1e] shadow-md"
                      >
                        <div className="p-2 bg-[#170f0a] border border-[#443021] text-[#d9a066]">
                          <FileText className="size-5" />
                        </div>
                        <div className="flex flex-col overflow-hidden flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[0.65rem] text-[#d9a066] uppercase font-semibold">
                              VĂN BẢN HỒ SƠ
                            </span>
                            <span className="font-mono text-[0.65rem] text-[#ad9885]">
                              {pdf.code}
                            </span>
                          </div>
                          <span className="font-sans font-bold text-sm text-[#f2e6d8] truncate">
                            {pdf.title}
                          </span>
                        </div>
                      </div>
                    ))}

                    {unlockedModalData.newEvidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="group flex items-start gap-3 p-3.5 bg-[#221810] border border-[#3e2c1e] shadow-md"
                      >
                        <div className="p-2 bg-[#170f0a] border border-[#443021] text-[#d9a066]">
                          <ImageIcon className="size-5" />
                        </div>
                        <div className="flex flex-col overflow-hidden flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[0.65rem] text-amber-500 uppercase font-semibold">
                              TANG CHỨNG VẬT LÝ
                            </span>
                            <span className="font-mono text-[0.65rem] text-[#ad9885]">
                              {ev.evidenceId}
                            </span>
                          </div>
                          <span className="font-sans font-bold text-sm text-[#f2e6d8] truncate">
                            {ev.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action Section - ONLY VISIBLE AFTER NARRATION COMPLETES */}
                  {isNarrativeComplete && (
                    <div className="pt-4 border-t border-[#3d2a1b] mt-4">
                      <button
                        onClick={() => {
                          if (unlockedModalData.newPdfs.length > 0) {
                            onSelectPdf(unlockedModalData.newPdfs[0]);
                          } else if (unlockedModalData.newEvidence.length > 0) {
                            onSelectEvidence(unlockedModalData.newEvidence[0]);
                          }
                          onSetPhaseFilter(unlockedModalData.unlockedPhase);
                          onClose();
                        }}
                        className="w-full py-3.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] animate-fade-in"
                      >
                        <Search className="size-4.5" />
                        <span>MỞ TÀI LIỆU ĐIỀU TRA</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
