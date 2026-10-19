"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Users } from "lucide-react";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import { useRoomSync } from "@/components/investigation/room-sync-context";

interface DetectiveNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
}

export function DetectiveNotebookModal({
  isOpen,
  onClose,
  caseId = "case-000",
}: DetectiveNotebookModalProps) {
  const { roomCode, roomState, syncUpdate } = useRoomSync();
  const storageKey = `detective_notebook_${caseId}`;

  const [content, setContent] = useState<string>("");
  const isTypingRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Nạp nội dung sổ tay:
  // Nếu đang trong phòng chơi nhóm (roomCode), ưu tiên lấy roomState.teamNotes
  // Nếu chơi đơn (solo), lấy từ local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (roomCode) {
        if (!isTypingRef.current) {
          setContent(roomState.teamNotes || "");
        }
      } else {
        const saved = getStorageItem(storageKey) || "";
        setContent(saved);
      }
    }
  }, [storageKey, isOpen, roomCode, roomState.teamNotes]);

  // Cập nhật nội dung theo thời gian thực khi đồng đội trong phòng chỉnh sửa
  useEffect(() => {
    if (roomCode && !isTypingRef.current) {
      setContent(roomState.teamNotes || "");
    }
  }, [roomCode, roomState.teamNotes]);

  // Handle text edit with auto-save & realtime sync debounce
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setContent(nextVal);
    isTypingRef.current = true;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (roomCode) {
        syncUpdate({ teamNotes: nextVal }, "đã cập nhật sổ tay");
      }
      setStorageItem(storageKey, nextVal);
      isTypingRef.current = false;
    }, 500);
  };

  // Immediate save on blur or close
  const handleBlur = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (roomCode) {
      syncUpdate({ teamNotes: content }, "đã cập nhật sổ tay");
    }
    setStorageItem(storageKey, content);
    isTypingRef.current = false;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />

          {/* NOTEBOOK CONTAINER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl h-[85vh] max-h-[640px] bg-[#f8f6f0] rounded-lg border border-[#3d2c1e] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden z-10"
          >
            {/* MINIMAL HEADER */}
            <div className="shrink-0 px-4 py-2.5 bg-[#eae5d9] border-b border-[#d8d0c2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-[#6e5845]" />
                <h3 className="text-xs sm:text-sm font-mono font-bold tracking-wider text-[#3d2f24] uppercase">
                  SỔ TAY
                </h3>
                {roomCode && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-900/15 border border-emerald-700/40 text-[0.65rem] text-emerald-800 font-mono font-medium">
                    <Users className="size-3 text-emerald-700" />
                    <span>Phòng {roomCode}</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-7 rounded bg-[#ded6c7] hover:bg-[#cfc6b5] text-[#5c4938] hover:text-[#261d15] flex items-center justify-center transition-colors cursor-pointer"
                title="Đóng sổ tay"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* WARM OFF-WHITE PAPER WITH SUBTLE RULED LINES */}
            <div className="flex-1 relative overflow-hidden bg-[#faf8f3] flex flex-col p-4 sm:p-6">
              {/* SUBTLE HORIZONTAL NOTEBOOK LINES */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(transparent, transparent 27px, #c9bfaf 28px)",
                }}
              />
              {/* FAINT RED MARGIN LINE */}
              <div className="absolute top-0 bottom-0 left-8 sm:left-10 w-[1px] bg-red-400/20 pointer-events-none" />

              <textarea
                value={content}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full h-full bg-transparent resize-none border-0 outline-none text-[#2b221a] text-sm sm:text-[0.95rem] font-sans leading-[28px] pl-6 sm:pl-8 relative z-10 custom-scrollbar selection:bg-[#ffe58f] selection:text-[#111111]"
                spellCheck={false}
                autoFocus={false}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
