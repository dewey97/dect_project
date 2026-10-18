"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Trash2, Check, PenLine, Sparkles } from "lucide-react";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import { cn } from "@/lib/utils";

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
  const storageKey = `detective_notebook_${caseId}`;
  const [content, setContent] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing notes on open / case change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = getStorageItem(storageKey) || "";
      setContent(saved);
      setIsSaved(true);
      setShowClearConfirm(false);
    }
  }, [storageKey, isOpen]);

  // Handle text edit with auto-save debounce
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setContent(nextVal);
    setIsSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setStorageItem(storageKey, nextVal);
      setIsSaved(true);
    }, 600);
  };

  // Immediate save on blur or close
  const handleBlur = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setStorageItem(storageKey, content);
    setIsSaved(true);
  };

  const handleClear = () => {
    setContent("");
    setStorageItem(storageKey, "");
    setIsSaved(true);
    setShowClearConfirm(false);
  };

  const handleInsertQuickTemplate = () => {
    const template = `\n---\n[MỐC THỜI GIAN]: \n[NGHI PHẠM]: \n[MANH MỐI ĐÁNG NGỜ]: \n`;
    const nextVal = content ? `${content.trimEnd()}${template}` : template.trimStart();
    setContent(nextVal);
    setStorageItem(storageKey, nextVal);
    setIsSaved(true);
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
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl h-[85vh] max-h-[680px] bg-[#1e150f] rounded-xl border-2 border-[#543b27] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(217,160,102,0.15)] flex flex-col overflow-hidden z-10"
          >
            {/* NOTEBOOK LEATHER BINDING HEADER */}
            <div className="shrink-0 px-4 py-3 bg-[#2a1d14] border-b-2 border-[#453020] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-[#18100a] border border-[#523924] flex items-center justify-center shadow-inner">
                  <BookOpen className="size-4 text-[#d9a066]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-mono font-bold tracking-wider text-[#f5ebd9] uppercase flex items-center gap-1.5">
                    <span>SỔ TAY THÁM TỬ</span>
                    <span className="text-[0.62rem] px-1.5 py-0.2 rounded bg-[#150e08] border border-[#4a3422] text-[#d9a066]">
                      {caseId.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-[0.68rem] text-[#9e836b] font-mono">
                    Ghi chép & suy luận cá nhân • Tự động lưu
                  </p>
                </div>
              </div>

              {/* ACTIONS: AUTO-SAVE STATUS & CLOSE */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[0.65rem] font-mono transition-opacity flex items-center gap-1 px-2 py-0.5 rounded",
                    isSaved
                      ? "text-[#85a86d] bg-[#121c0e] border border-[#2b4221]"
                      : "text-[#d9a066] bg-[#22160b] border border-[#523820] animate-pulse"
                  )}
                >
                  {isSaved ? (
                    <>
                      <Check className="size-3" /> Đã lưu
                    </>
                  ) : (
                    <>
                      <PenLine className="size-3" /> Đang lưu...
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={onClose}
                  className="size-8 rounded-lg bg-[#1a120c] hover:bg-[#382619] border border-[#483321] text-[#ad9885] hover:text-[#fef5ec] flex items-center justify-center transition-colors cursor-pointer"
                  title="Đóng sổ tay"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* QUICK ACTIONS TOOLBAR */}
            <div className="shrink-0 px-4 py-2 bg-[#1b130d] border-b border-[#3b2718] flex items-center justify-between text-xs font-mono">
              <button
                type="button"
                onClick={handleInsertQuickTemplate}
                className="px-2.5 py-1 rounded bg-[#271910] hover:bg-[#3a2618] border border-[#4a3422] text-[#d9a066] hover:text-[#fdebd7] transition-all flex items-center gap-1.5 text-[0.72rem] font-bold cursor-pointer active:scale-95"
                title="Chèn mẫu phân tích (Timeline, Nghi phạm, Manh mối)"
              >
                <Sparkles className="size-3 text-[#d9a066]" />
                <span>+ Mẫu ghi chép</span>
              </button>

              {/* CLEAR BUTTON */}
              {showClearConfirm ? (
                <div className="flex items-center gap-1.5 animate-fadeIn">
                  <span className="text-[0.68rem] text-red-400">Xóa hết?</span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2 py-0.5 rounded bg-red-950/80 border border-red-700/80 text-red-300 text-[0.68rem] font-bold hover:bg-red-900 cursor-pointer"
                  >
                    Xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-0.5 rounded bg-[#22160d] border border-[#422c1b] text-[#ad9885] text-[0.68rem] hover:text-[#fef5ec] cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={!content.trim()}
                  className="px-2 py-1 rounded hover:bg-[#2e1915] text-[#8c6753] hover:text-red-400 transition-colors flex items-center gap-1 text-[0.7rem] cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  title="Xóa toàn bộ ghi chép"
                >
                  <Trash2 className="size-3" />
                  <span>Xóa trắng</span>
                </button>
              )}
            </div>

            {/* RULED NOTEBOOK PAPER AREA */}
            <div className="flex-1 relative overflow-hidden bg-[#150f0a] flex flex-col p-4 sm:p-6">
              {/* VINTAGE NOTEBOOK LINED BACKGROUND */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(transparent, transparent 27px, #d9a066 28px)",
                }}
              />
              {/* RED MARGIN LINE */}
              <div className="absolute top-0 bottom-0 left-9 sm:left-12 w-[1px] bg-red-800/30 pointer-events-none" />

              <textarea
                value={content}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={`Ghi lại các mốc thời gian, điểm nghi vấn, lời khai mâu thuẫn...\n\nVí dụ:\n- 21:00: Nạn nhân gặp đối tượng X ở sảnh.\n- Vết bầm ở cổ tay có dấu hiệu giằng co...\n- Manh mối A-01 mâu thuẫn với lời khai của lễ tân.`}
                className="w-full h-full bg-transparent resize-none border-0 outline-none text-[#e8ded1] placeholder:text-[#6a5441] text-xs sm:text-sm font-sans leading-[28px] pl-7 sm:pl-9 relative z-10 custom-scrollbar selection:bg-[#d9a066]/30 selection:text-[#fff]"
                spellCheck={false}
              />
            </div>

            {/* FOOTER BAR */}
            <div className="shrink-0 px-4 py-2 bg-[#20160e] border-t border-[#3d2c1e] flex items-center justify-between text-[0.65rem] font-mono text-[#8a725b]">
              <span>Ký tự: {content.length}</span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded bg-[#d9a066] hover:bg-[#ebaf74] text-[#1a0f07] font-bold tracking-wider cursor-pointer transition-colors active:scale-95"
              >
                XONG
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
