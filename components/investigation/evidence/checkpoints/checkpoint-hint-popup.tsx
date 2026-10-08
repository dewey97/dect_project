"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ArrowLeft, ArrowRight, X } from "lucide-react";
import { detectiveAudio } from "@/lib/investigation-audio";

interface CheckpointHintPopupProps {
  isOpen: boolean;
  hints: string[];
  hintLevel: number;
  activeHintViewIdx: number;
  onClose: () => void;
  onViewIdxChange: (idx: number) => void;
  onUnlockNext: () => void;
}

export function CheckpointHintPopup({
  isOpen,
  hints,
  hintLevel,
  activeHintViewIdx,
  onClose,
  onViewIdxChange,
  onUnlockNext,
}: CheckpointHintPopupProps) {
  if (!isOpen || hints.length === 0 || hintLevel === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-lg bg-[#f6f1e5] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.9)] p-6 text-[#1a120b] font-sans space-y-4 rounded-none"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-[#2b1f14] hover:bg-[#2b1f14]/10 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 border-b border-[#2b1f14]/20 pb-3">
            <Lightbulb className="size-5 text-[#8c6b45]" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2b1f14]">
              GỢI Ý ({activeHintViewIdx + 1}/{hints.length})
            </h4>
          </div>

          {/* Content */}
          <p className="text-sm leading-relaxed text-[#1a120b] py-2">
            {hints[activeHintViewIdx] || hints[hintLevel - 1]}
          </p>

          {/* Actions Navigation (Back / Next) */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#2b1f14]/20">
            {activeHintViewIdx > 0 ? (
              <button
                onClick={() => {
                  detectiveAudio.playTypewriterClick();
                  onViewIdxChange(activeHintViewIdx - 1);
                }}
                className="px-4 py-2 bg-[#eae0cd] hover:bg-[#dfd4be] text-[#2b1f14] border-2 border-[#2b1f14] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>QUAY LẠI</span>
              </button>
            ) : (
              <div />
            )}

            {activeHintViewIdx < hintLevel - 1 ? (
              <button
                onClick={() => {
                  detectiveAudio.playTypewriterClick();
                  onViewIdxChange(activeHintViewIdx + 1);
                }}
                className="px-4 py-2 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-2 border-[#2b1f14] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
              >
                <span>GỢI Ý TIẾP THEO</span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : hintLevel < hints.length ? (
              <button
                onClick={() => {
                  detectiveAudio.playTypewriterClick();
                  onUnlockNext();
                }}
                className="px-4 py-2 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-2 border-[#2b1f14] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
              >
                <span>
                  MỞ GỢI Ý MỚI ({hintLevel + 1}/{hints.length})
                </span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
