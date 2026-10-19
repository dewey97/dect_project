"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Trash2, Check, PenLine, Sparkles, Users, User, ArrowRightLeft } from "lucide-react";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import { useRoomSync } from "@/components/investigation/room-sync-context";
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
  const { roomCode, nickname, roomState, syncUpdate } = useRoomSync();
  const storageKey = `detective_notebook_${caseId}`;

  const [activeTab, setActiveTab] = useState<"solo" | "team">(roomCode ? "team" : "solo");
  const [soloContent, setSoloContent] = useState<string>("");
  const [teamContent, setTeamContent] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingTeamRef = useRef<boolean>(false);

  // If roomCode activates/deactivates, align tab
  useEffect(() => {
    if (!roomCode) {
      setActiveTab("solo");
    }
  }, [roomCode]);

  // Load existing notes on open / case change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSolo = getStorageItem(storageKey) || "";
      setSoloContent(savedSolo);
      setTeamContent(roomState.teamNotes || "");
      setIsSaved(true);
      setShowClearConfirm(false);
    }
  }, [storageKey, isOpen, roomState.teamNotes]);

  // Realtime update from team when someone else edits
  useEffect(() => {
    if (roomCode && !isTypingTeamRef.current) {
      setTeamContent(roomState.teamNotes || "");
    }
  }, [roomCode, roomState.teamNotes]);

  const activeContent = activeTab === "team" ? teamContent : soloContent;

  // Handle text edit with auto-save debounce
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setIsSaved(false);

    if (activeTab === "team") {
      setTeamContent(nextVal);
      isTypingTeamRef.current = true;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        syncUpdate({ teamNotes: nextVal }, "đã cập nhật sổ tay chuyên án");
        isTypingTeamRef.current = false;
        setIsSaved(true);
      }, 700);
    } else {
      setSoloContent(nextVal);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        setStorageItem(storageKey, nextVal);
        setIsSaved(true);
      }, 600);
    }
  };

  // Immediate save on blur or close
  const handleBlur = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (activeTab === "team" && roomCode) {
      syncUpdate({ teamNotes: teamContent }, "đã cập nhật sổ tay chuyên án");
      isTypingTeamRef.current = false;
    } else {
      setStorageItem(storageKey, soloContent);
    }
    setIsSaved(true);
  };

  const handleClear = () => {
    if (activeTab === "team" && roomCode) {
      setTeamContent("");
      syncUpdate({ teamNotes: "" }, "đã xóa trắng sổ tay chuyên án");
    } else {
      setSoloContent("");
      setStorageItem(storageKey, "");
    }
    setIsSaved(true);
    setShowClearConfirm(false);
  };

  const handleInsertQuickTemplate = () => {
    const template = `\n---\n[MỐC THỜI GIAN]: \n[NGHI PHẠM]: \n[MANH MỐI ĐÁNG NGỜ]: \n`;
    const cur = activeTab === "team" ? teamContent : soloContent;
    const nextVal = cur ? `${cur.trimEnd()}${template}` : template.trimStart();

    if (activeTab === "team" && roomCode) {
      setTeamContent(nextVal);
      syncUpdate({ teamNotes: nextVal }, "đã thêm mẫu phân tích vào sổ chuyên án");
    } else {
      setSoloContent(nextVal);
      setStorageItem(storageKey, nextVal);
    }
    setIsSaved(true);
  };

  // Copy solo notes into team journal
  const handleCopySoloToTeam = () => {
    if (!soloContent.trim() || !roomCode) return;
    const combined = teamContent
      ? `${teamContent.trimEnd()}\n\n--- [GHI CHÉP TỪ ${nickname.toUpperCase()}] ---\n${soloContent}`
      : soloContent;
    setTeamContent(combined);
    setActiveTab("team");
    syncUpdate({ teamNotes: combined }, `đã đồng bộ ghi chép cá nhân vào sổ chuyên án`);
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
                    {activeTab === "team" && roomCode
                      ? `Nhật ký Tổ chuyên án (${roomCode}) • Tự động đồng bộ`
                      : "Ghi chép & suy luận cá nhân • Tự động lưu"}
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
                      <Check className="size-3" /> {activeTab === "team" ? "Đã đồng bộ" : "Đã lưu"}
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

            {/* TAB SELECTOR (WHEN IN ROOM) */}
            {roomCode && (
              <div className="shrink-0 px-4 py-1.5 bg-[#20150e] border-b border-[#3b2718] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("team")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                    activeTab === "team"
                      ? "bg-[#3d2717] text-[#f5ebd9] border border-[#d9a066]/60 shadow-sm"
                      : "text-[#9e836b] hover:text-[#f5ebd9] hover:bg-[#2b1b11]"
                  )}
                >
                  <Users className="size-3.5 text-emerald-400" />
                  <span>Tổ Chuyên Án ({roomCode})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("solo")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                    activeTab === "solo"
                      ? "bg-[#3d2717] text-[#f5ebd9] border border-[#d9a066]/60 shadow-sm"
                      : "text-[#9e836b] hover:text-[#f5ebd9] hover:bg-[#2b1b11]"
                  )}
                >
                  <User className="size-3.5 text-amber-400" />
                  <span>Sổ Riêng Của Tôi</span>
                </button>

                {/* COPY SOLO TO TEAM SHORTCUT */}
                {activeTab === "solo" && soloContent.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={handleCopySoloToTeam}
                    className="ml-auto px-2 py-0.5 rounded bg-[#18100a] hover:bg-[#342215] border border-[#523924] text-[#d9a066] hover:text-[#fff] text-[0.65rem] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                    title="Chép nội dung sổ riêng này sang sổ chung của Tổ chuyên án"
                  >
                    <ArrowRightLeft className="size-3" />
                    <span className="hidden sm:inline">Chép sang Sổ chung</span>
                  </button>
                )}
              </div>
            )}

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
                  disabled={!activeContent.trim()}
                  className="px-2 py-1 rounded hover:bg-[#2e1915] text-[#8c6753] hover:text-red-400 transition-colors flex items-center gap-1 text-[0.7rem] cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  title="Xóa toàn bộ ghi chép của mục này"
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
                value={activeContent}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={
                  activeTab === "team"
                    ? `[NHẬT KÝ TỔ CHUYÊN ÁN - PHÒNG ${roomCode}]\nCả nhóm cùng ghi chép, suy luận các manh mối quan trọng...\n\nVí dụ:\n- Đồng đội A: Nạn nhân bị sát hại trước 23h.\n- Đồng đội B: Kiểm tra lại biên bản khám nghiệm #14...`
                    : `Ghi lại các mốc thời gian, điểm nghi vấn, lời khai mâu thuẫn...\n\nVí dụ:\n- 21:00: Nạn nhân gặp đối tượng X ở sảnh.\n- Vết bầm ở cổ tay có dấu hiệu giằng co...\n- Manh mối A-01 mâu thuẫn với lời khai của lễ tân.`
                }
                className="w-full h-full bg-transparent resize-none border-0 outline-none text-[#e8ded1] placeholder:text-[#6a5441] text-xs sm:text-sm font-sans leading-[28px] pl-7 sm:pl-9 relative z-10 custom-scrollbar selection:bg-[#d9a066]/30 selection:text-[#fff]"
                spellCheck={false}
              />
            </div>

            {/* FOOTER BAR */}
            <div className="shrink-0 px-4 py-2 bg-[#20160e] border-t border-[#3d2c1e] flex items-center justify-between text-[0.65rem] font-mono text-[#8a725b]">
              <div className="flex items-center gap-3">
                <span>Ký tự: {activeContent.length}</span>
                {activeTab === "team" && roomCode && (
                  <span className="text-emerald-400/90 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Đang đồng bộ phòng {roomCode}
                  </span>
                )}
              </div>
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
