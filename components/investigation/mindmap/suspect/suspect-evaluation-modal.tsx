"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { detectiveAudio } from "@/lib/investigation-audio";
import { findValidCaseCharacter } from "@/lib/cases/characters";
import { cn } from "@/lib/utils";

export interface EvaluationModalState {
  isOpen: boolean;
  isSuccess: boolean;
  title: string;
  heading: string;
  message: string;
  subMessage?: string;
  suspectName: string;
  selectedCount: number;
  avatarUrl?: string;
}

interface SuspectEvaluationModalProps {
  evalModal: EvaluationModalState | null;
  onCloseSuccess: () => void;
  onCloseFailure: () => void;
}

export function SuspectEvaluationModal({
  evalModal,
  onCloseSuccess,
  onCloseFailure,
}: SuspectEvaluationModalProps) {
  if (!evalModal || !evalModal.isOpen) return null;

  const resolvedAvatar =
    evalModal.avatarUrl ||
    (evalModal.suspectName
      ? findValidCaseCharacter(evalModal.suspectName)?.avatarUrl
      : undefined);

  return (
    <AnimatePresence>
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          className={cn(
            "relative w-full max-w-md p-6 border-2 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-[#1a120b]",
            evalModal.isSuccess
              ? "bg-[#f5f9f2] border-[#2e5220]"
              : "bg-[#fcf3f2] border-[#a81c1c]",
          )}
        >
          <div className="flex items-start gap-3.5 pb-4">
            <div
              className={cn(
                "p-2.5 rounded-none border-2 flex items-center justify-center shrink-0",
                evalModal.isSuccess
                  ? "bg-[#e7f0dc] border-[#2e5220] text-[#2e5220]"
                  : "bg-[#fce8e6] border-[#a81c1c] text-[#a81c1c]",
              )}
            >
              {evalModal.isSuccess ? (
                <CheckCircle2 className="size-6" />
              ) : (
                <AlertTriangle className="size-6" />
              )}
            </div>
            <div className="flex-1 min-w-0 font-sans space-y-1.5 pt-0.5">
              {evalModal.suspectName && (
                <div className="flex items-center gap-2 mb-1">
                  {resolvedAvatar && (
                    <img
                      src={resolvedAvatar}
                      alt={evalModal.suspectName}
                      className="size-7 rounded-full object-cover border border-black/15 shrink-0"
                    />
                  )}
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6b5847] truncate">
                    {evalModal.suspectName}
                  </span>
                </div>
              )}
              <p
                className={cn(
                  "font-bold leading-snug text-sm sm:text-base",
                  evalModal.isSuccess ? "text-[#193310]" : "text-[#a81c1c]",
                )}
              >
                {evalModal.message}
              </p>
              {evalModal.subMessage && (
                <p className="text-xs text-[#6b5847] leading-relaxed">
                  {evalModal.subMessage}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            {evalModal.isSuccess ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  detectiveAudio.playPaperRustle();
                  onCloseSuccess();
                }}
                className="px-5 py-2.5 bg-[#2e5220] hover:bg-[#203a16] text-[#f6f1e5] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border-2 border-[#193310] shadow-md active:scale-95"
              >
                <span>TIẾP TỤC ĐIỀU TRA</span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  detectiveAudio.playPaperRustle();
                  onCloseFailure();
                }}
                className="px-5 py-2.5 bg-[#a81c1c] hover:bg-[#851414] text-[#f6f1e5] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border-2 border-[#5c0f0f] shadow-md active:scale-95"
              >
                <span>RÀ SOÁT LẠI</span>
                <ArrowLeft className="size-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
