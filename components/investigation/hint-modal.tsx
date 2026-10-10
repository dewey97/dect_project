"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  X,
  Unlock,
  Lock,
  Compass,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { detectiveAudio } from "@/lib/investigation-audio";
import { cn } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import {
  getCheckpointHints,
  type SheetCheckpointRow,
} from "@/lib/cms/checkpoint-cms";
import { getStorageItem, setStorageItem, getStorageJson, setStorageJson } from "@/lib/storage";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkpointId?: string;
}

interface ActiveHintGroup {
  id: string;
  title: string;
  statusText: string;
  hints: string[];
  checkpointId?: string;
  isGeneralBoard?: boolean;
}

/**
 * Trích xuất nhóm gợi ý tương ứng trực tiếp từ tab 'checkpoints' của Google Sheets.
 * Tuyệt đối không dùng mảng fallback tĩnh.
 */
function resolveDynamicHintStage(
  checkpointId: string | undefined,
  sheetCheckpoints: SheetCheckpointRow[],
): ActiveHintGroup {
  // 1. Khi đang ở bảng phá án tổng quan (không có checkpointId cụ thể)
  if (!checkpointId) {
    return {
      id: "general-board",
      title: "BẢNG ĐIỀU TRA CHUYÊN ÁN",
      statusText: "Tổng quan tiến trình vụ án",
      hints: [],
      isGeneralBoard: true,
    };
  }

  // 2. Tìm dòng checkpoint trên Google Sheet (hỗ trợ checkpoint_id, node_id, hoặc từ khóa tiêu đề)
  const cleanId = checkpointId.trim().toLowerCase();
  const row = sheetCheckpoints.find((r) => {
    const cpId = (r.checkpoint_id || "").trim().toLowerCase();
    const nodeId = (r.node_id || "").trim().toLowerCase();
    const title = (r.title || "").trim().toLowerCase();
    if (cpId === cleanId || nodeId === cleanId) return true;

    // Mapping linh hoạt theo ngữ cảnh câu hỏi
    if (cleanId === "phone" || cleanId.includes("phone")) {
      return cpId === "cp-000-0" || nodeId.includes("phone");
    }
    if (cleanId === "vu" || cleanId.includes("vu")) {
      return cpId === "cp-000-1a" || title.includes("vũ") || nodeId.includes("vu");
    }
    if (cleanId === "tung" || cleanId.includes("tung")) {
      return cpId === "cp-000-1b" || title.includes("tùng") || nodeId.includes("tung");
    }
    if (cleanId === "ha" || cleanId.includes("ha")) {
      return cpId === "cp-000-1c" || title.includes("hà") || nodeId.includes("ha");
    }
    if (cleanId === "indictment" || cleanId.includes("indictment") || cleanId.includes("cao-trang")) {
      return cpId === "cp-000-2b" || title.includes("cáo trạng") || nodeId.includes("accusation");
    }
    return false;
  });

  const sheetHints = getCheckpointHints(row);

  return {
    id: `cp-${cleanId}`,
    checkpointId: row?.checkpoint_id || checkpointId,
    title: row?.title || `CÂU HỎI CHECKPOINT // ${checkpointId.toUpperCase()}`,
    statusText: row?.dossier ? `Hồ sơ ${row.dossier}` : "Câu hỏi điều tra",
    hints: sheetHints,
    isGeneralBoard: false,
  };
}

export function HintModal({
  isOpen,
  onClose,
  checkpointId,
}: HintModalProps) {
  const { data: sheetCheckpoints } =
    usePhoneData<SheetCheckpointRow>("checkpoints");

  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, number>>(
    {},
  );
  const [activeStage, setActiveStage] = useState<ActiveHintGroup | null>(null);
  const [activeHintIdx, setActiveHintIdx] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setUnlockedLevels(
        getStorageJson<Record<string, number>>("hint_unlocked_levels", {}),
      );
      const stage = resolveDynamicHintStage(checkpointId, sheetCheckpoints);
      setActiveStage(stage);
      setActiveHintIdx(0);
    }
  }, [isOpen, checkpointId, sheetCheckpoints]);

  if (!isOpen || !activeStage) return null;

  const totalHints = activeStage.hints.length;
  const unlockedCount = Math.min(
    unlockedLevels[activeStage.id] || 1,
    Math.max(totalHints, 1),
  );
  // Chỉ cho phép xem trong phạm vi các mức đã mở khóa.
  const viewIdx = Math.min(activeHintIdx, Math.max(unlockedCount - 1, 0));

  const handleUnlockNext = () => {
    if (totalHints === 0) return;
    detectiveAudio.playTypewriterClick();
    const nextCount = Math.min(unlockedCount + 1, totalHints);
    const updated = {
      ...unlockedLevels,
      [activeStage.id]: nextCount,
    };
    setUnlockedLevels(updated);
    setActiveHintIdx(nextCount - 1);
    setStorageJson("hint_unlocked_levels", updated);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-none overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* HEADER */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8c1d1d] flex items-center gap-1.5">
                <Lightbulb className="size-3.5 text-[#8c1d1d]" />
                SỔ TAY GỢI Ý ĐIỀU TRA // CASE 000
              </span>
              <h3 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wider">
                Gợi Ý & Manh Mối Phá Án
              </h3>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                detectiveAudio.playPaperRustle();
                onClose();
              }}
              className="p-2 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer border border-[#5c4026]/40 pointer-events-auto"
              title="Đóng"
            >
              <X className="size-5 pointer-events-none" />
            </button>
          </div>

          {/* ACTIVE STAGE CONTENT AREA */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5] custom-scrollbar">
            {/* STAGE TITLE BAR */}
            <div className="border-b-2 border-[#2b1f14]/20 pb-3 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#8c1d1d] font-mono text-[11px] font-bold uppercase tracking-wider">
                  <Compass className="size-3.5" />
                  <span>TIẾN TRÌNH HIỆN TẠI</span>
                </div>
                <h4 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wide">
                  {activeStage.title}
                </h4>
              </div>
            </div>

            {/* TRƯỜNG HỢP 1: Ở BẢNG PHÁ ÁN (KHÔNG CÓ GỢI Ý ĐỂ TRÁNH SPOILER) */}
            {activeStage.isGeneralBoard ? (
              <div className="p-5 border-2 border-dashed border-[#2b1f14]/40 bg-[#fdfbf7] text-[#1a120b] rounded-none font-sans text-xs sm:text-[13px] leading-relaxed space-y-3">
                <div className="flex items-center gap-2 text-[#8c1d1d] font-mono font-bold uppercase text-xs">
                  <Lock className="size-4" />
                  <span>Chế độ quan sát bảng điều tra</span>
                </div>
                <p className="text-[#3d2c1e]">
                  Bạn đang ở chế độ bao quát Bảng điều tra. Tại đây hệ thống không hiển thị gợi ý đáp án để đảm bảo tính suy luận khách quan của hồ sơ.
                </p>
                <div className="p-3 bg-[#ede3d1] border border-[#2b1f14]/20 font-mono text-[11px] text-[#4a3520] space-y-1">
                  <p className="font-bold uppercase text-[#8c1d1d]">
                    💡 Cách nhận gợi ý theo từng câu hỏi:
                  </p>
                  <p>
                    1. Nhấp trực tiếp vào các ghim câu hỏi (màu cam/đỏ) trên bảng.
                  </p>
                  <p>
                    2. Mỗi màn câu hỏi Checkpoint đều tích hợp sẵn gợi ý phân cấp trực tiếp từ tài liệu điều tra.
                  </p>
                </div>
              </div>
            ) : totalHints === 0 ? (
              /* TRƯỜNG HỢP 2: CÂU HỎI CHƯA CÓ GỢI Ý TRÊN GOOGLE SHEETS */
              <div className="p-5 border-2 border-[#2b1f14]/30 bg-[#fdfbf7] text-[#1a120b] rounded-none font-sans text-xs sm:text-[13px] leading-relaxed space-y-2">
                <div className="flex items-center gap-2 text-[#8c6b45] font-mono font-bold uppercase text-xs">
                  <Lightbulb className="size-4" />
                  <span>Chưa có gợi ý bổ sung</span>
                </div>
                <p className="text-[#3d2c1e]">
                  Câu hỏi này yêu cầu điều tra viên tự đối soát tài liệu, biên bản và vật chứng đã thu thập. Không có gợi ý khả dụng trên hệ thống Live CMS.
                </p>
              </div>
            ) : (
              /* TRƯỜNG HỢP 3: CÓ GỢI Ý THEO CHECKPOINT TỪ GOOGLE SHEETS */
              <>
                <div className="pt-1">
                  <div className="p-4 border-2 border-[#2b1f14] bg-[#fdfbf7] text-[#1a120b] shadow-sm rounded-none font-sans text-xs sm:text-[13px] leading-relaxed">
                    <div className="flex items-center gap-2 border-b border-[#2b1f14]/15 pb-1.5 mb-2.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase">
                      <span className="flex items-center gap-1.5 text-[#8c1d1d]">
                        <Unlock className="size-3.5" />
                        Gợi ý mức {viewIdx + 1}/{totalHints}
                      </span>
                    </div>

                    <div className="grid">
                      {activeStage.hints.map((hintText, hIdx) => (
                        <p
                          key={hIdx}
                          aria-hidden={hIdx !== viewIdx}
                          className={cn(
                            "col-start-1 row-start-1 text-[#1a120b] transition-opacity duration-200 ease-out",
                            hIdx === viewIdx
                              ? "opacity-100"
                              : "opacity-0 pointer-events-none select-none",
                          )}
                        >
                          {hintText}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Tiến độ mở khóa các mức gợi ý */}
                  <div className="flex items-center gap-1.5 pt-3">
                    {activeStage.hints.map((_, hIdx) => (
                      <button
                        key={hIdx}
                        type="button"
                        disabled={hIdx >= unlockedCount}
                        onClick={() => {
                          if (hIdx >= unlockedCount) return;
                          detectiveAudio.playTypewriterClick();
                          setActiveHintIdx(hIdx);
                        }}
                        title={
                          hIdx < unlockedCount
                            ? `Xem gợi ý mức ${hIdx + 1}`
                            : `Gợi ý mức ${hIdx + 1} chưa mở khóa`
                        }
                        className={cn(
                          "h-2 flex-1 rounded-none transition-colors",
                          hIdx === viewIdx
                            ? "bg-[#8c1d1d]"
                            : hIdx < unlockedCount
                              ? "bg-[#8c1d1d]/40 hover:bg-[#8c1d1d]/60 cursor-pointer"
                              : "bg-[#2b1f14]/15 cursor-not-allowed",
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* ĐIỀU HƯỚNG LÙI / TIẾN GIỮA CÁC MỨC GỢI Ý */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#2b1f14]/20">
                  {viewIdx > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        detectiveAudio.playTypewriterClick();
                        setActiveHintIdx((prev) => Math.max(prev - 1, 0));
                      }}
                      className="px-4 py-2 bg-[#eae0cd] hover:bg-[#dfd4be] text-[#2b1f14] border-2 border-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 rounded-none active:scale-95"
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>GỢI Ý TRƯỚC</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {viewIdx < unlockedCount - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        detectiveAudio.playTypewriterClick();
                        setActiveHintIdx((prev) => prev + 1);
                      }}
                      className="px-4 py-2 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-2 border-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 rounded-none active:scale-95 ml-auto"
                    >
                      <span>GỢI Ý SAU</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  ) : unlockedCount < totalHints ? (
                    <button
                      type="button"
                      onClick={handleUnlockNext}
                      className="px-4 py-2 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-2 border-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 rounded-none active:scale-95 ml-auto"
                    >
                      <Unlock className="size-3.5 text-[#d9a066]" />
                      <span>
                        MỞ GỢI Ý MỚI ({unlockedCount + 1}/{totalHints})
                      </span>
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
