"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import type { PDFDocument, PhysicalEvidence } from "./evidence-types";
import { TypewriterNarrator } from "./typewriter-narrator";
import { detectiveAudio } from "@/lib/investigation-audio";
import { useCaseNarratives } from "@/lib/hooks/use-case-narratives";
import { setStorageItem } from "@/lib/storage";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { getActiveCaseId } from "@/lib/cases/case-characters";

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
  autoStartStory?: boolean;
}

export function PhaseUnlockedModal({
  unlockedModalData,
  onClose,
  onSelectPdf,
  onSelectEvidence,
  onSetPhaseFilter,
  playExperience = "web",
  autoStartStory = false,
}: PhaseUnlockedModalProps) {
  const [isStoryStarted, setIsStoryStarted] = React.useState(autoStartStory);
  const [isNarrativeComplete, setIsNarrativeComplete] = React.useState(false);

  // Đọc danh sách dẫn truyện cinematic trực tiếp từ tab `narratives` trên Google Sheet Live CMS
  const { getPhaseNarrative } = useCaseNarratives(normalizeCaseId(getActiveCaseId()));

  const currentNarrative = React.useMemo(() => {
    if (!unlockedModalData) return null;
    return getPhaseNarrative(unlockedModalData.unlockedPhase);
  }, [unlockedModalData, getPhaseNarrative]);

  const fallbackNarrative = React.useMemo(() => {
    const p = unlockedModalData?.unlockedPhase ?? 0;
    return getPhaseNarrative(p);
  }, [unlockedModalData?.unlockedPhase, getPhaseNarrative]);

  const activeNarrative = currentNarrative || fallbackNarrative;

  React.useEffect(() => {
    setIsStoryStarted(autoStartStory);
    setIsNarrativeComplete(false);
    if (autoStartStory && unlockedModalData && unlockedModalData.unlockedPhase === 0) {
      setTimeout(() => {
        detectiveAudio.playCeramicShatterSound();
      }, 3000);
    }
  }, [unlockedModalData, autoStartStory]);

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
        <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none pt-safe">
          {/* CRT Background scanlines */}
          <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

          {/* Main Fullscreen Content Area - PURE IMMERSIVE CINEMATIC STORYTELLING (TEXT ONLY) */}
          <div className="relative z-20 flex-1 h-full flex flex-col justify-between items-center p-4 sm:p-8 max-w-3xl mx-auto w-full overflow-hidden">
            <div className="space-y-6 w-full flex-1 flex flex-col items-start my-auto py-4 overflow-y-auto custom-scrollbar pr-1">
              {unlockedModalData.unlockedPhase === 0 && !isStoryStarted ? (
                <div className="py-16 flex flex-col items-center justify-center w-full my-auto">
                  <button
                    onClick={handleStartStory}
                    className="px-8 py-4 bg-[#221810] hover:bg-[#342418] border border-[#d9a066]/50 hover:border-[#d9a066] text-[#d9a066] font-mono text-base sm:text-lg font-bold tracking-[0.25em] uppercase transition-all cursor-pointer shadow-xl rounded hover:scale-105 active:scale-95"
                  >
                    TRỐN TÌM
                  </button>
                </div>
              ) : (
                <>
                  <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-widest uppercase border-b border-[#261b12] pb-3 w-full flex items-center justify-between shrink-0">
                    <span>{activeNarrative.date}</span>
                  </div>

                  <div className="pt-2 w-full flex-1 overflow-y-auto custom-scrollbar">
                    <TypewriterNarrator
                      key={`narrative-${unlockedModalData.unlockedPhase}-${activeNarrative.monologue}`}
                      text={activeNarrative.monologue}
                      speed={12}
                      onComplete={() => setIsNarrativeComplete(true)}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Clean Bottom Button - ONLY VISIBLE AFTER NARRATION COMPLETES */}
            {isNarrativeComplete && (
              <div className="w-full pt-4 pb-2 shrink-0 max-w-md mx-auto">
                <button
                  onClick={() => {
                    if (unlockedModalData.unlockedPhase === 0) {
                      setStorageItem("intro_seen", "true");
                    }
                    onSetPhaseFilter(unlockedModalData.unlockedPhase);
                    onClose();
                  }}
                  className="w-full py-3.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] animate-fade-in"
                >
                  <Search className="size-4.5" />
                  <span>ĐIỀU TRA</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
