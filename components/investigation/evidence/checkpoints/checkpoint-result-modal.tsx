"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckpointResultModalState } from "./types";

interface CheckpointResultModalProps {
  modalState: CheckpointResultModalState | null;
  onClose: () => void;
}

export function CheckpointResultModal({
  modalState,
  onClose,
}: CheckpointResultModalProps) {
  if (!modalState?.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className={cn(
            "relative w-full max-w-md bg-[#f6f1e5] border-2 p-6 sm:p-7 text-[#1a120b] font-sans shadow-[0_25px_70px_rgba(0,0,0,0.9)] rounded-none",
            modalState.type === "error"
              ? "border-[#8c261e]"
              : "border-[#1b5e20]",
          )}
        >
          {/* Top-Right X Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-[#2b1f14] hover:bg-[#2b1f14]/10 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>

          {/* Modal Message Body */}
          <p className="text-sm sm:text-base leading-relaxed text-[#1a120b] font-medium pr-6 pt-1">
            {modalState.message}
          </p>

          {/* If type === 'success', show 'TIẾP TỤC ĐIỀU TRA' button */}
          {modalState.type === "success" && (
            <div className="pt-4 mt-3 border-t border-[#2b1f14]/20 flex justify-end">
              <button
                onClick={() => {
                  const proceedFn = modalState.onProceed;
                  onClose();
                  if (proceedFn) {
                    proceedFn();
                  }
                }}
                className="w-full py-3 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-2 border-[#2b1f14] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shadow-md"
              >
                <span>TIẾP TỤC ĐIỀU TRA</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
