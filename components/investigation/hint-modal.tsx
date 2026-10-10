"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  X,
  Unlock,
  Compass,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Target,
  Clock,
} from "lucide-react";
import { detectiveAudio } from "@/lib/investigation-audio";
import { cn } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import {
  getCheckpointHints,
  getCategorizedCheckpointHints,
  type SheetCheckpointRow,
} from "@/lib/cms/checkpoint-cms";
import { getStorageItem, getStorageJson, setStorageJson } from "@/lib/storage";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkpointId?: string;
  category?: "motive" | "alibi" | "all";
}

interface CheckpointGroupData {
  checkpointId: string;
  title: string;
  dossier: string;
  hints: string[];
  motiveHints: string[];
  alibiHints: string[];
  hasCategories: boolean;
}

/**
 * Chuẩn hóa checkpointId sang mã chuẩn vụ án Case #000.
 */
export function normalizeCheckpointId(id?: string): string {
  if (!id) return "";
  const clean = id.trim().toLowerCase();
  if (clean === "phone" || clean.includes("phone") || clean === "cp-000-0")
    return "cp-000-0";
  if (clean === "vu" || clean.includes("vu") || clean === "cp-000-1a")
    return "cp-000-1a";
  if (clean === "tung" || clean.includes("tung") || clean === "cp-000-1b")
    return "cp-000-1b";
  if (clean === "ha" || clean.includes("ha") || clean === "cp-000-1c")
    return "cp-000-1c";
  if (
    clean === "indictment" ||
    clean.includes("indictment") ||
    clean.includes("cao-trang") ||
    clean === "cp-000-2b"
  )
    return "cp-000-2b";
  return clean;
}

/**
 * Tự động nhận diện checkpoint đang điều tra dở theo tương tác gần nhất và tiến trình thực tế.
 */
export function getLatestActiveCheckpointId(): string {
  if (typeof window !== "undefined") {
    const winCp = (window as any).__ACTIVE_INVESTIGATION_CHECKPOINT__;
    if (winCp) return normalizeCheckpointId(winCp);
  }

  // 1. Kiểm tra checkpoint người chơi vừa tương tác gần nhất
  const activeCp = getStorageItem("active_investigation_checkpoint");
  if (activeCp) return normalizeCheckpointId(activeCp);

  const lastInteracted = getStorageItem("last_interacted_checkpoint");
  if (lastInteracted) return normalizeCheckpointId(lastInteracted);

  const lastSuspect = getStorageItem("last_viewed_suspect");
  if (lastSuspect) {
    const normSuspect = lastSuspect.toLowerCase().trim();
    if (normSuspect === "vu" || normSuspect.includes("vũ")) return "cp-000-1a";
    if (normSuspect === "tung" || normSuspect.includes("tùng")) return "cp-000-1b";
    if (normSuspect === "ha" || normSuspect.includes("hà")) return "cp-000-1c";
  }

  // 2. Kiểm tra tiến trình giải đố thực tế trong storage
  const isPhoneSolved = getStorageItem("phone_solved") === "true";
  if (!isPhoneSolved) return "cp-000-0";

  const isVuSolved = Boolean(getStorageItem("followup_vu"));
  if (!isVuSolved) return "cp-000-1a";

  const isTungSolved = Boolean(getStorageItem("followup_tung"));
  if (!isTungSolved) return "cp-000-1b";

  const isHaSolved = Boolean(getStorageItem("followup_ha"));
  if (!isHaSolved) return "cp-000-1c";

  const isIndictmentSolved = getStorageItem("indictment_solved") === "true";
  if (!isIndictmentSolved) return "cp-000-2b";

  return "cp-000-2b";
}

/**
 * Gom nhóm hints từ tab 'checkpoints' trên Google Sheets theo checkpoint_id,
 * tự động bóc tách 2 nhóm [ĐỘNG CƠ] và [NGOẠI PHẠM].
 */
function buildGroupedCheckpointsMap(
  sheetCheckpoints: SheetCheckpointRow[],
): Map<string, CheckpointGroupData> {
  const map = new Map<string, CheckpointGroupData>();
  let currentCpId = "";

  for (const row of sheetCheckpoints) {
    let id = normalizeCheckpointId(row.checkpoint_id);
    const title = (row.title || "").trim().toLowerCase();

    // Nhận diện theo ngữ cảnh nếu dòng con để trống checkpoint_id
    if (!id) {
      if (title.includes("hà") || title.includes("ha")) {
        id = "cp-000-1c";
      } else if (title.includes("tùng") || title.includes("tung")) {
        id = "cp-000-1b";
      } else if (title.includes("vũ") || title.includes("vu")) {
        id = "cp-000-1a";
      } else if (currentCpId) {
        id = currentCpId;
      }
    }

    if (id) {
      currentCpId = id;
      if (!map.has(id)) {
        map.set(id, {
          checkpointId: id,
          title: row.title || id,
          dossier: row.dossier || "",
          hints: [],
          motiveHints: [],
          alibiHints: [],
          hasCategories: false,
        });
      }
      const entry = map.get(id)!;
      if (row.title && (!entry.title || entry.title === id)) {
        entry.title = row.title;
      }
      if (row.dossier && !entry.dossier) {
        entry.dossier = row.dossier;
      }

      // Trích xuất phân nhóm Động cơ & Ngoại phạm
      const categorized = getCategorizedCheckpointHints(row);
      if (categorized.hasCategories) {
        entry.hasCategories = true;
        for (const h of categorized.motive) {
          if (!entry.motiveHints.includes(h)) entry.motiveHints.push(h);
        }
        for (const h of categorized.alibi) {
          if (!entry.alibiHints.includes(h)) entry.alibiHints.push(h);
        }
      }

      const rowHints = getCheckpointHints(row);
      for (const hint of rowHints) {
        const trimmed = hint.trim();
        if (
          trimmed &&
          trimmed !== "Động cơ" &&
          trimmed !== "Ngoại phạm mâu thuẫn" &&
          !entry.hints.includes(trimmed)
        ) {
          entry.hints.push(trimmed);
        }
      }
    }
  }

  return map;
}

export function HintModal({
  isOpen,
  onClose,
  checkpointId,
  category,
}: HintModalProps) {
  const { data: sheetCheckpoints } =
    usePhoneData<SheetCheckpointRow>("checkpoints");

  // Xây dựng map gợi ý gom từ Google Sheet
  const groupedMap = useMemo(() => {
    return buildGroupedCheckpointsMap(sheetCheckpoints);
  }, [sheetCheckpoints]);

  // Nhận diện đồng bộ checkpoint ID ngay lập tức
  const effectiveCpId = useMemo(() => {
    if (checkpointId) return normalizeCheckpointId(checkpointId);
    return getLatestActiveCheckpointId() || "cp-000-0";
  }, [checkpointId, isOpen]);

  const currentGroup = useMemo(() => {
    return (
      groupedMap.get(effectiveCpId) || {
        checkpointId: effectiveCpId,
        title: `CÂU HỎI CHECKPOINT // ${effectiveCpId.toUpperCase()}`,
        dossier: "Hồ sơ chuyên án",
        hints: [],
        motiveHints: [],
        alibiHints: [],
        hasCategories: false,
      }
    );
  }, [groupedMap, effectiveCpId]);

  // Nhận diện phân nhóm độc lập (Motive vs Alibi vs All) mà KHÔNG dùng toggle
  const activeCategory = useMemo<"motive" | "alibi" | "all">(() => {
    // Nếu checkpoint không hỗ trợ tách nhóm Động cơ & Ngoại phạm (ví dụ cp-000-0 3 SĐT)
    // thì BẮT BUỘC là 'all', tuyệt đối không hiển thị nhãn Động cơ / Ngoại phạm
    if (!currentGroup.hasCategories) {
      return "all";
    }

    if (category === "motive" || category === "alibi") return category;

    const rawId = (checkpointId || "").toLowerCase();
    if (rawId.includes("motive") || rawId.includes("dong_co")) return "motive";
    if (rawId.includes("alibi") || rawId.includes("ngoai_pham")) return "alibi";

    const savedCat = getStorageItem("active_suspect_category");
    if (savedCat === "motive" || savedCat === "alibi") return savedCat;

    return "motive";
  }, [category, checkpointId, currentGroup.hasCategories]);

  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, number>>({});
  const [activeHintIdx, setActiveHintIdx] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setUnlockedLevels(
        getStorageJson<Record<string, number>>("hint_unlocked_levels", {}),
      );
      setActiveHintIdx(0);
    }
  }, [isOpen, activeCategory, effectiveCpId]);

  if (!isOpen) return null;

  // Lấy danh sách gợi ý đang hiển thị riêng biệt theo nhóm (Không bao giờ gộp chung)
  const displayHints =
    activeCategory === "motive" && currentGroup.motiveHints.length > 0
      ? currentGroup.motiveHints
      : activeCategory === "alibi" && currentGroup.alibiHints.length > 0
        ? currentGroup.alibiHints
        : currentGroup.hints;

  const storageKey =
    currentGroup.hasCategories && activeCategory !== "all"
      ? `${effectiveCpId}_${activeCategory}`
      : effectiveCpId;

  const totalHints = displayHints.length;
  const unlockedCount = Math.min(
    unlockedLevels[storageKey] || 1,
    Math.max(totalHints, 1),
  );
  const viewIdx = Math.min(activeHintIdx, Math.max(unlockedCount - 1, 0));

  const handleUnlockNext = () => {
    if (totalHints === 0) return;
    detectiveAudio.playTypewriterClick();
    const nextCount = Math.min(unlockedCount + 1, totalHints);
    const updated = {
      ...unlockedLevels,
      [storageKey]: nextCount,
    };
    setUnlockedLevels(updated);
    setActiveHintIdx(nextCount - 1);
    setStorageJson("hint_unlocked_levels", updated);
  };

  const isMotiveGroup = activeCategory === "motive";
  const isAlibiGroup = activeCategory === "alibi";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-none overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* HEADER */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8c1d1d] flex items-center gap-1.5">
                <Lightbulb className="size-3.5 text-[#8c1d1d]" />
                SỔ TAY GỢI Ý ĐIỀU TRA // CASE 000
              </span>
              <h3 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wider">
                {isMotiveGroup
                  ? "Gợi Ý Động Cơ Gây Án"
                  : isAlibiGroup
                    ? "Gợi Ý Mâu Thuẫn Ngoại Phạm"
                    : "Gợi Ý Manh Mối Checkpoint"}
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

          {/* ACTIVE CONTENT AREA */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5] custom-scrollbar">
            {/* STAGE TITLE BAR */}
            <div className="border-b-2 border-[#2b1f14]/20 pb-3">
              <div className="space-y-1">
                {(isMotiveGroup || isAlibiGroup) && (
                  <div className="flex items-center gap-1.5 text-[#8c1d1d] font-mono text-[11px] font-bold uppercase tracking-wider">
                    {isMotiveGroup ? (
                      <Target className="size-3.5" />
                    ) : (
                      <Clock className="size-3.5" />
                    )}
                    <span>
                      {isMotiveGroup
                        ? "MỤC TIÊU // BẰNG CHỨNG ĐỘNG CƠ"
                        : "MỤC TIÊU // BẰNG CHỨNG NGOẠI PHẠM"}
                    </span>
                  </div>
                )}
                <h4 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wide">
                  {currentGroup.title}
                  {isMotiveGroup
                    ? " — [ĐỘNG CƠ]"
                    : isAlibiGroup
                      ? " — [NGOẠI PHẠM]"
                      : ""}
                </h4>
              </div>
            </div>

            {/* TRƯỜNG HỢP: CHƯA CÓ GỢI Ý HOẶC ĐANG TẢI */}
            {totalHints === 0 ? (
              <div className="p-5 border-2 border-[#2b1f14]/30 bg-[#fdfbf7] text-[#1a120b] rounded-none font-sans text-xs sm:text-[13px] leading-relaxed space-y-2">
                <div className="flex items-center gap-2 text-[#8c6b45] font-mono font-bold uppercase text-xs">
                  <HelpCircle className="size-4" />
                  <span>Chưa có gợi ý bổ sung cho mục này</span>
                </div>
                <p className="text-[#3d2c1e]">
                  Vui lòng vận dụng các tài liệu hồ sơ, lời khai và chứng cứ đã thu thập để tiến hành suy luận phá án.
                </p>
              </div>
            ) : (
              /* TRƯỜNG HỢP: CÓ GỢI Ý TỪ GOOGLE SHEETS */
              <>
                <div className="pt-1">
                  <div className="p-4 border-2 border-[#2b1f14] bg-[#fdfbf7] text-[#1a120b] shadow-sm rounded-none font-sans text-xs sm:text-[13px] leading-relaxed">
                    <div className="flex items-center justify-between border-b border-[#2b1f14]/15 pb-1.5 mb-2.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase">
                      <span className="flex items-center gap-1.5 text-[#8c1d1d]">
                        <Unlock className="size-3.5" />
                        Gợi ý mức {viewIdx + 1}/{totalHints}
                      </span>
                      {currentGroup.hasCategories && (
                        <span className="text-[#6b4e2e] text-[10px]">
                          [
                          {isMotiveGroup
                            ? "ĐỘNG CƠ GÂY ÁN"
                            : "MÂU THUẪN NGOẠI PHẠM"}
                          ]
                        </span>
                      )}
                    </div>

                    <div className="grid">
                      {displayHints.map((hintText, hIdx) => (
                        <p
                          key={hIdx}
                          aria-hidden={hIdx !== viewIdx}
                          className={cn(
                            "col-start-1 row-start-1 text-[#1a120b] whitespace-pre-line leading-relaxed transition-opacity duration-200 ease-out",
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
                    {displayHints.map((_, hIdx) => (
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
