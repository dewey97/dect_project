"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectiveAudio } from "@/lib/investigation-audio";
import { cn } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import {
  type SheetCheckpointRow,
} from "@/lib/cms/checkpoint-cms";
import { getStorageJson, setStorageJson, getStorageItem } from "@/lib/storage";
import {
  buildGroupedCheckpointsMap,
  normalizeCheckpointId,
} from "@/components/investigation/hint-modal";

interface CheckpointHintSectionProps {
  checkpointId: string;
  caseId?: string;
  category?: "motive" | "alibi" | "contradiction" | "all";
  className?: string;
}

export function CheckpointHintSection({
  checkpointId,
  caseId = "case-000",
  category,
  className,
}: CheckpointHintSectionProps) {
  const normalizedCaseId = caseId.replace(/-/g, "_");
  const { data: sheetCheckpoints } = usePhoneData<SheetCheckpointRow>(
    "checkpoints",
    normalizedCaseId,
  );

  const groupedMap = useMemo(() => {
    return buildGroupedCheckpointsMap(sheetCheckpoints);
  }, [sheetCheckpoints]);

  const effectiveCpId = useMemo(() => {
    return normalizeCheckpointId(checkpointId, caseId);
  }, [checkpointId, caseId]);

  const currentGroup = useMemo(() => {
    return (
      groupedMap.get(effectiveCpId) || {
        checkpointId: effectiveCpId,
        title: `CÂU HỎI CHECKPOINT // ${effectiveCpId.toUpperCase()}`,
        dossier: "Hồ sơ chuyên án",
        hints: [],
        motiveHints: [],
        alibiHints: [],
        contradictionHints: [],
        hasCategories: false,
      }
    );
  }, [groupedMap, effectiveCpId]);

  const activeCategory = useMemo<"motive" | "alibi" | "contradiction" | "all">(() => {
    if (!currentGroup.hasCategories) {
      return "all";
    }
    if (category === "motive" || category === "alibi" || category === "contradiction") return category;

    const rawId = (checkpointId || "").toLowerCase();
    if (rawId.includes("motive") || rawId.includes("dong_co")) return "motive";
    if (rawId.includes("alibi") || rawId.includes("ngoai_pham")) return "alibi";
    if (rawId.includes("contradiction") || rawId.includes("mau_thuan")) return "contradiction";

    const savedCat = getStorageItem("active_suspect_category");
    if (savedCat === "motive" || savedCat === "alibi" || savedCat === "contradiction") return savedCat;

    return "motive";
  }, [category, checkpointId, currentGroup.hasCategories]);

  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, number>>({});
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);
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
    setUnlockedLevels(
      getStorageJson<Record<string, number>>("hint_unlocked_levels", {}),
    );
    cancelHold();
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, [effectiveCpId, activeCategory]);

  const displayHints = useMemo(() => {
    if (activeCategory === "motive" && currentGroup.motiveHints.length > 0) {
      return currentGroup.motiveHints;
    }
    if (activeCategory === "alibi" && currentGroup.alibiHints.length > 0) {
      return currentGroup.alibiHints;
    }
    if (activeCategory === "contradiction" && currentGroup.contradictionHints.length > 0) {
      return currentGroup.contradictionHints;
    }
    return currentGroup.hints;
  }, [activeCategory, currentGroup]);

  const storageKey =
    currentGroup.hasCategories && activeCategory !== "all"
      ? `${effectiveCpId}_${activeCategory}`
      : effectiveCpId;

  const totalHints = displayHints.length;
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

  const startHold = () => {
    if (totalHints === 0 || unlockedCount >= totalHints) return;
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

  // Nếu checkpoint không có gợi ý nào trên Sheet, không render section này
  if (totalHints === 0) {
    return null;
  }

  const nextLevel = unlockedCount + 1;
  const isFullyUnlocked = unlockedCount >= totalHints;

  return (
    <div
      className={cn(
        "rounded-none bg-[#f6f1e5] text-[#1a120b] pt-2 space-y-3",
        className,
      )}
    >
      {/* DANH SÁCH GỢI Ý ĐÃ MỞ (XẾP DỌC TUẦN TỰ XUỐNG DƯỚI) */}
      {unlockedCount > 0 && (
        <div className="space-y-3">
          {displayHints.slice(0, unlockedCount).map((hintText, index) => (
            <motion.div
              key={`hint-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="p-3.5 sm:p-4 bg-[#fffdfa] border border-[#d6c7b2] rounded-none shadow-sm text-xs sm:text-sm text-[#1a120b] leading-relaxed font-sans font-medium"
            >
              <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider mr-1.5 inline">
                Gợi ý {index + 1}:
              </span>
              <span className="inline whitespace-pre-line">
                {hintText}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* KHU VỰC BẤM GIỮ ĐỂ BÓC GỢI Ý TIẾP THEO */}
      {!isFullyUnlocked && (
        <div className="pt-1">
          <button
            type="button"
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            onTouchCancel={cancelHold}
            className={cn(
              "relative w-full overflow-hidden py-3 px-4 border-2 font-mono font-bold text-xs uppercase tracking-wider transition-all select-none cursor-pointer text-center",
              isHolding
                ? "border-[#8c1d1d] bg-[#fdf8f0] text-[#8c1d1d] scale-[0.99]"
                : "border-[#a88c6f] bg-[#ede3d1] hover:bg-[#e4d8c3] text-[#2b1f14] hover:border-[#8c1d1d]",
            )}
          >
            {/* Thanh Progress chạy khi giữ 1.2s */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#8c1d1d]/20 transition-all duration-75 ease-linear pointer-events-none"
              style={{ width: `${holdProgress}%` }}
            />

            <span className="relative z-10 block pointer-events-none">
              {isHolding
                ? `ĐANG MỞ KHÓA... ${Math.round(holdProgress)}%`
                : `GIỮ ĐỂ MỞ MỨC ${nextLevel}`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
