"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  HelpCircle,
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
  caseId?: string;
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
 * Chuẩn hóa checkpointId: hỗ trợ cả Case 000 legacy và case động
 */
export function normalizeCheckpointId(id?: string, caseId?: string): string {
  if (!id) return "";
  const clean = id.trim().toLowerCase();
  if (caseId && caseId !== "case-000") {
    return clean;
  }
  if (clean.includes("followup")) {
    if (clean.includes("vu") || clean.includes("1a")) return "cp-000-1a-followup";
    if (clean.includes("ha") || clean.includes("1c")) return "cp-000-1c-followup";
    return clean;
  }
  if (
    clean === "phone" ||
    clean === "cp-000-0" ||
    clean === "c0-pin-phone" ||
    clean.startsWith("phone")
  )
    return "cp-000-0";
  if (clean === "vu" || clean === "vũ" || clean === "cp-000-1a" || clean.endsWith("-vu"))
    return "cp-000-1a";
  if (clean === "tung" || clean === "tùng" || clean === "cp-000-1b" || clean.endsWith("-tung"))
    return "cp-000-1b";
  if (clean === "ha" || clean === "hà" || clean === "cp-000-1c" || clean.endsWith("-ha"))
    return "cp-000-1c";
  if (
    clean === "indictment" ||
    clean === "cao-trang" ||
    clean === "cp-000-2b" ||
    clean.includes("indictment")
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
export function buildGroupedCheckpointsMap(
  sheetCheckpoints: SheetCheckpointRow[],
): Map<string, CheckpointGroupData> {
  const map = new Map<string, CheckpointGroupData>();
  let currentCpId = "";

  for (const row of sheetCheckpoints) {
    let id = normalizeCheckpointId(row.checkpoint_id);
    const title = (row.title || "").trim().toLowerCase();

    // Nhận diện theo ngữ cảnh nếu dòng con để trống checkpoint_id
    if (!id) {
      if (title.includes("hộp thiếc") || title.includes("mật khẩu")) {
        id = "cp-000-1c-followup";
      } else if (title.includes("quán bia") || title.includes("thanh toán")) {
        id = "cp-000-1a-followup";
      } else if (title.includes("hà") || title.includes("ha")) {
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

export function HintModal(_props: HintModalProps) {
  // Gợi ý đã được tích hợp trực tiếp vào bên dưới màn nhập mã (CheckpointHintSection)
  // Bỏ hoàn toàn modal nảy riêng theo yêu cầu của người chơi
  return null;
}

function _LegacyHintModal({
  isOpen,
  onClose,
  checkpointId,
  category,
  caseId = "case-000",
}: HintModalProps) {
  const normalizedCaseId = caseId.replace(/-/g, "_");
  const { data: sheetCheckpoints } =
    usePhoneData<SheetCheckpointRow>("checkpoints", normalizedCaseId);

  // Xây dựng map gợi ý gom từ Google Sheet
  const groupedMap = useMemo(() => {
    return buildGroupedCheckpointsMap(sheetCheckpoints);
  }, [sheetCheckpoints]);

  // Nhận diện đồng bộ checkpoint ID: CHỈ hiển thị nếu có checkpointId truyền vào
  const effectiveCpId = useMemo(() => {
    if (checkpointId) return normalizeCheckpointId(checkpointId, caseId);
    return "";
  }, [checkpointId, isOpen, caseId]);

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

  // Cơ chế Giữ 3 giây (Hold-to-Reveal) để phá niêm phong gợi ý
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const HOLD_DURATION_MS = 1200;

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    if (isOpen) {
      setUnlockedLevels(
        getStorageJson<Record<string, number>>("hint_unlocked_levels", {}),
      );
    }
    cancelHold();
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, [isOpen, activeCategory, effectiveCpId]);

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
  // Mặc định ban đầu chưa mở khóa (0) — người chơi bắt buộc phải bóc niêm phong
  const unlockedCount = Math.min(
    unlockedLevels[storageKey] || 0,
    totalHints,
  );

  const handleUnlockNext = () => {
    if (totalHints === 0) return;
    detectiveAudio.playPaperRustle();
    const currentUnlocked = unlockedLevels[storageKey] || 0;
    const nextCount = Math.min(currentUnlocked + 1, totalHints);
    const updated = {
      ...unlockedLevels,
      [storageKey]: nextCount,
    };
    setUnlockedLevels(updated);
    setStorageJson("hint_unlocked_levels", updated);
  };

  useEffect(() => {
    if (isOpen && unlockedCount > 0 && scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [isOpen, unlockedCount]);

  const startHold = () => {
    if (totalHints === 0) return;
    setIsHolding(true);
    setHoldProgress(0);
    holdStartRef.current = Date.now();

    if (holdTimerRef.current) clearInterval(holdTimerRef.current);

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdTimerRef.current) {
          clearInterval(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        setIsHolding(false);
        setHoldProgress(0);
        handleUnlockNext();
      }
    }, 40);
  };

  const isMotiveGroup = activeCategory === "motive";
  const isAlibiGroup = activeCategory === "alibi";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-lg bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-none overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* COMPACT HEADER - NỐI LIỀN MÀU NỀN */}
          <div className="bg-[#f6f1e5] px-4 pt-3.5 pb-1 sm:px-5 sm:pt-4 sm:pb-1.5 flex items-center justify-between">
            <h3 className="font-mono font-bold text-xs sm:text-sm text-[#1a120b] uppercase tracking-wide truncate pr-2">
              {currentGroup.title}
            </h3>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cancelHold();
                detectiveAudio.playPaperRustle();
                onClose();
              }}
              className="p-1.5 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer border border-[#5c4026]/40 pointer-events-auto shrink-0"
              title="Đóng"
            >
              <X className="size-4 pointer-events-none" />
            </button>
          </div>

          {/* ACTIVE CONTENT AREA */}
          <div ref={scrollContainerRef} className="p-4 sm:p-5 pt-2 sm:pt-2.5 flex-1 overflow-y-auto space-y-3 bg-[#f6f1e5] custom-scrollbar">
            {/* TRƯỜNG HỢP 1: CHƯA CÓ GỢI Ý HOẶC ĐANG TẢI */}
            {totalHints === 0 ? (
              <div className="p-4 border-2 border-[#2b1f14]/30 bg-[#fdfbf7] text-[#1a120b] rounded-none font-sans text-xs sm:text-[13px] leading-relaxed space-y-2">
                <div className="flex items-center gap-2 text-[#8c6b45] font-mono font-bold uppercase text-xs">
                  <HelpCircle className="size-4" />
                  <span>Chưa có gợi ý bổ sung cho mục này</span>
                </div>
                <p className="text-[#3d2c1e]">
                  Vui lòng vận dụng các tài liệu hồ sơ, lời khai và chứng cứ đã thu thập để tiến hành suy luận phá án.
                </p>
              </div>
            ) : unlockedCount === 0 ? (
              /* TRƯỜNG HỢP 2: CHƯA MỞ GỢI Ý MỨC 1 (COMPACT HOLD TO REVEAL) */
              <div className="space-y-3 pt-1">
                <div className="p-4 sm:p-5 border-2 border-[#2b1f14]/25 bg-[#fdfbf7] shadow-sm relative overflow-hidden">
                  {/* Redacted lines mockup */}
                  <div className="space-y-2.5 py-1 opacity-25 select-none pointer-events-none" aria-hidden="true">
                    <div className="h-3 bg-[#2b1f14] w-3/4 rounded-none" />
                    <div className="h-3 bg-[#2b1f14] w-full rounded-none" />
                    <div className="h-3 bg-[#2b1f14] w-5/6 rounded-none" />
                    <div className="h-3 bg-[#2b1f14] w-1/2 rounded-none" />
                  </div>
                </div>

                {/* HOLD TO REVEAL BUTTON LEVEL 1 */}
                <button
                  type="button"
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onMouseLeave={cancelHold}
                  onTouchStart={startHold}
                  onTouchEnd={cancelHold}
                  onTouchCancel={cancelHold}
                  onContextMenu={(e) => e.preventDefault()}
                  className={cn(
                    "relative w-full overflow-hidden select-none touch-none py-3 px-4 border-2 font-mono text-xs font-bold uppercase transition-all rounded-none flex items-center justify-center gap-2",
                    isHolding
                      ? "border-[#8c1d1d] bg-[#2b1f14] text-[#f6f1e5] scale-[0.99]"
                      : "border-[#2b1f14] bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] shadow cursor-pointer active:scale-95"
                  )}
                >
                  {/* Progress fill */}
                  <div
                    className="absolute inset-0 bg-[#8c1d1d] transition-all ease-linear pointer-events-none"
                    style={{ width: `${holdProgress}%` }}
                  />
                  <div className="relative z-10 flex items-center gap-2 pointer-events-none">
                    <Lock className={cn("size-4 transition-transform", isHolding && "animate-pulse text-amber-300")} />
                    <span>
                      {isHolding
                        ? `ĐANG MỞ MỨC 1... ${Math.round(holdProgress)}%`
                        : "GIỮ ĐỂ MỞ MỨC 1"}
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              /* TRƯỜNG HỢP 3: ĐÃ BÓC NIÊM PHONG — HIỂN THỊ DỌC TỪ TRÊN XUỐNG DƯỚI */
              <div className="space-y-3 pt-1">
                {displayHints.slice(0, unlockedCount).map((hintText, hIdx) => (
                  <div
                    key={hIdx}
                    className="p-3.5 sm:p-4 border-2 border-[#2b1f14] bg-[#fdfbf7] text-[#1a120b] shadow-sm rounded-none font-sans text-xs sm:text-[13px] leading-relaxed space-y-1.5"
                  >
                    <div className="font-mono text-[10px] sm:text-[11px] font-bold uppercase text-[#8c1d1d]">
                      Gợi ý {hIdx + 1}
                    </div>

                    <p className="text-[#1a120b] whitespace-pre-line leading-relaxed">
                      {hintText}
                    </p>
                  </div>
                ))}

                {/* NÚT MỞ GỢI Ý TIẾP THEO (NẰM Ở ĐÁY DANH SÁCH) */}
                {unlockedCount < totalHints && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onMouseDown={startHold}
                      onMouseUp={cancelHold}
                      onMouseLeave={cancelHold}
                      onTouchStart={startHold}
                      onTouchEnd={cancelHold}
                      onTouchCancel={cancelHold}
                      onContextMenu={(e) => e.preventDefault()}
                      className={cn(
                        "relative w-full overflow-hidden select-none touch-none py-2.5 px-4 border-2 font-mono text-xs font-bold uppercase transition-all rounded-none flex items-center justify-center gap-2",
                        isHolding
                          ? "border-[#8c1d1d] bg-[#2b1f14] text-[#f6f1e5] scale-[0.99]"
                          : "border-[#2b1f14] bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] shadow cursor-pointer active:scale-95"
                      )}
                      title={`Nhấn và giữ để mở gợi ý mức ${unlockedCount + 1}`}
                    >
                      <div
                        className="absolute inset-0 bg-[#8c1d1d] transition-all ease-linear pointer-events-none"
                        style={{ width: `${holdProgress}%` }}
                      />
                      <div className="relative z-10 flex items-center gap-2 pointer-events-none">
                        <Lock className={cn("size-3.5 text-[#d9a066]", isHolding && "animate-pulse text-amber-300")} />
                        <span>
                          {isHolding
                            ? `ĐANG MỞ MỨC ${unlockedCount + 1}... ${Math.round(holdProgress)}%`
                            : `GIỮ ĐỂ MỞ MỨC ${unlockedCount + 1}`}
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

