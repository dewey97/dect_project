"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, Lightbulb } from "lucide-react";
import type { Checkpoint } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HINTS_MAP } from "./evidence-data";
import { detectiveAudio } from "@/lib/investigation-audio";
import { useActiveCheckpointHints } from "@/lib/hooks/use-active-checkpoint-hints";
import { clearInvestigationStorage } from "@/lib/storage";
import { useInvestigationEvent } from "@/lib/investigation-events";
import {
  CheckpointEpilogueCallout,
  CheckpointTextMatchForm,
  CheckpointPickerForm,
  CheckpointConvergenceForm,
  CheckpointHintPopup,
  CheckpointResultModal,
  validateCheckpointAnswer,
  type CheckpointResultModalState,
} from "./checkpoints";

interface CaseCheckpointsSectionProps {
  checkpoints: Checkpoint[];
  completedCheckpointIds: string[];
  selectedAnswers: Record<string, string>;
  checkpointErrors: Record<string, boolean>;
  checkpointSuccesses: Record<string, boolean>;
  unlockedHintLevel: Record<string, number>;
  onAnswerSelect: (cpId: string, option: string) => void;
  onSubmitAnswer: (cp: Checkpoint) => void;
  onUnlockNextHint: (cpId: string, maxHints: number) => void;
  onProceedNextPhase?: (cpId: string) => void;
}

export function CaseCheckpointsSection({
  checkpoints,
  completedCheckpointIds,
  checkpointSuccesses,
  unlockedHintLevel,
  onAnswerSelect,
  onSubmitAnswer,
  onUnlockNextHint,
  onProceedNextPhase,
}: CaseCheckpointsSectionProps) {
  const activeCpIndex = checkpoints.findIndex(
    (cp) => !completedCheckpointIds.includes(cp.id),
  );
  const isAllCompleted = checkpoints.length > 0 && activeCpIndex === -1;
  const currentCp = activeCpIndex !== -1 ? checkpoints[activeCpIndex] : null;

  // Gợi ý động đọc trực tiếp từ Google Sheet cho checkpoint đang hoạt động.
  const { hints: sheetHints } = useActiveCheckpointHints(currentCp?.id ?? "");

  const resolveHints = (cp: Checkpoint): string[] => {
    if (sheetHints.length > 0) return sheetHints;
    return cp.hintsList || (cp.hint ? [cp.hint] : HINTS_MAP[cp.id] || []);
  };

  // Local state for dynamic question forms
  const [textMatchValues, setTextMatchValues] = useState<Record<string, string>>({});
  const [suspectInput, setSuspectInput] = useState<string>("");
  const [mismatchTypeSelect, setMismatchTypeSelect] = useState<string>("");
  const [motiveSelect, setMotiveSelect] = useState<string>("");
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [subPickerTile, setSubPickerTile] = useState<"overview" | "motive" | "alibi">("overview");
  const [motiveEvidences, setMotiveEvidences] = useState<string[]>([]);
  const [alibiEvidences, setAlibiEvidences] = useState<string[]>([]);
  const [convergenceSelections, setConvergenceSelections] = useState<Record<string, string>>({});
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [activeHintViewIdx, setActiveHintViewIdx] = useState<number>(0);
  const [resultModal, setResultModal] = useState<CheckpointResultModalState | null>(null);

  // Listen to OPEN_HINT event from Quick Action Fab Menu
  useInvestigationEvent("OPEN_HINT", () => {
    if (currentCp) {
      const hints = resolveHints(currentCp);
      if (hints.length > 0) {
        detectiveAudio.playTypewriterClick();
        const currentLvl = unlockedHintLevel[currentCp.id] || 0;
        let targetLvl = currentLvl;
        if (currentLvl === 0) {
          onUnlockNextHint(currentCp.id, hints.length);
          targetLvl = 1;
        }
        setActiveHintViewIdx(targetLvl - 1);
        setHintModalOpen(true);
      }
    }
  });

  const resetProgress = () => {
    clearInvestigationStorage();
    window.location.reload();
  };

  const handleHintClick = (cpId: string, maxHints: number) => {
    detectiveAudio.playTypewriterClick();
    const currentLvl = unlockedHintLevel[cpId] || 0;
    let targetLvl = currentLvl;
    if (currentLvl === 0) {
      onUnlockNextHint(cpId, maxHints);
      targetLvl = 1;
    }
    setActiveHintViewIdx(targetLvl - 1);
    setHintModalOpen(true);
  };

  const toggleEvidenceSelect = (id: string) => {
    detectiveAudio.playPaperRustle();
    setSelectedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCustomSubmit = (cp: Checkpoint) => {
    const isValid = validateCheckpointAnswer(cp, {
      textMatchValues,
      suspectInput,
      mismatchTypeSelect,
      motiveSelect,
      selectedEvidenceIds,
      convergenceSelections,
    });

    if (isValid) {
      onAnswerSelect(cp.id, "VALID_ANSWER");
      onSubmitAnswer(cp);
      setResultModal({
        isOpen: true,
        type: "success",
        message:
          "Căn cứ lập luận của bạn rất sắc bén. Lệnh khai thác thông tin & mở rộng giai đoạn điều tra tiếp theo đã được phê duyệt!",
        onProceed: () => {
          if (onProceedNextPhase) {
            onProceedNextPhase(cp.id);
          }
        },
      });
    } else {
      detectiveAudio.playPaperRustle();
      onAnswerSelect(cp.id, "INVALID_ANSWER");
      onSubmitAnswer(cp);
      setResultModal({
        isOpen: true,
        type: "error",
        message: "Manh mối và căn cứ điều tra của bạn chưa đủ sức thuyết phục.",
      });
    }
  };

  return (
    <section className="space-y-4 pt-2">
      {/* ALL COMPLETED EPILOGUE CALLOUT */}
      {isAllCompleted ? (
        <CheckpointEpilogueCallout onReset={resetProgress} />
      ) : currentCp ? (
        (() => {
          const cp = currentCp;
          const hasSuccess = checkpointSuccesses[cp.id];
          const hints = resolveHints(cp);
          const hintLevel = unlockedHintLevel[cp.id] || 0;

          return (
            <div
              key={cp.id}
              className="relative w-full bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 rounded-none font-sans select-text transition-all"
            >
              {/* SUCCESS STAMP */}
              <AnimatePresence>
                {hasSuccess && (
                  <div className="mb-4 pb-3 border-b-2 border-[#2b1f14]/20 flex items-center justify-end">
                    <motion.div
                      initial={{ scale: 1.4, opacity: 0, rotate: -8 }}
                      animate={{ scale: 1, opacity: 1, rotate: -2 }}
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 20,
                      }}
                      className="px-4 py-1 border-2 border-red-800 text-red-800 bg-red-900/10 font-mono font-black uppercase text-xs tracking-widest flex items-center gap-1.5 rounded-none shadow-sm select-none"
                    >
                      <CheckCircle2 className="size-4 text-red-800" />
                      <span>★ ĐÃ PHÊ DUYỆT ★</span>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* DOCUMENT BODY */}
              <div className="space-y-5 relative z-10">
                {/* Document Header & Question */}
                <div className="border-b border-[#2b1f14]/20 pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6b4e2e] block">
                      {cp.title}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#1a120b] leading-relaxed">
                      {cp.question}
                    </h3>
                  </div>
                  {hints.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleHintClick(cp.id, hints.length)}
                      className="self-start shrink-0 px-3 py-1.5 bg-[#ede3d1] hover:bg-[#dfd3bd] text-[#8c1d1d] hover:text-[#6e1515] border border-[#a88c6f] font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                      title="Mở gợi ý phá án cho câu hỏi này"
                    >
                      <Lightbulb className="size-3.5 text-[#8c1d1d]" />
                      <span>
                        GỢI Ý{" "}
                        {hintLevel > 0 ? `(${hintLevel}/${hints.length})` : ""}
                      </span>
                    </button>
                  )}
                </div>

                {/* FORM TYPE 1: TEXT MATCH 3 (CP-000-0) */}
                {cp.type === "text_match_3" && (
                  <CheckpointTextMatchForm
                    checkpoint={cp}
                    hasSuccess={hasSuccess}
                    values={textMatchValues}
                    onChange={(id, val) =>
                      setTextMatchValues((prev) => ({ ...prev, [id]: val }))
                    }
                  />
                )}

                {/* FORM TYPE 2 & 4: EVIDENCE PICKER & ACCUSATION */}
                {(cp.type === "evidence_picker" || cp.type === "accusation") && (
                  <CheckpointPickerForm
                    checkpoint={cp}
                    hasSuccess={hasSuccess}
                    suspectInput={suspectInput}
                    onSuspectInputChange={setSuspectInput}
                    mismatchTypeSelect={mismatchTypeSelect}
                    onMismatchTypeSelectChange={setMismatchTypeSelect}
                    motiveSelect={motiveSelect}
                    onMotiveSelectChange={setMotiveSelect}
                    selectedEvidenceIds={selectedEvidenceIds}
                    onToggleEvidenceSelect={toggleEvidenceSelect}
                    subPickerTile={subPickerTile}
                    onSubPickerTileChange={setSubPickerTile}
                    motiveEvidences={motiveEvidences}
                    onMotiveEvidencesChange={setMotiveEvidences}
                    alibiEvidences={alibiEvidences}
                    onAlibiEvidencesChange={setAlibiEvidences}
                    onBulkEvidenceSelect={setSelectedEvidenceIds}
                  />
                )}

                {/* FORM TYPE 3: CONVERGENCE NODE */}
                {cp.type === "convergence" && (
                  <CheckpointConvergenceForm
                    checkpoint={cp}
                    hasSuccess={hasSuccess}
                    selections={convergenceSelections}
                    onSelectChange={(suspectId, reasonKey) =>
                      setConvergenceSelections((prev) => ({
                        ...prev,
                        [suspectId]: reasonKey,
                      }))
                    }
                  />
                )}

                {/* ACTION TOOLBAR: SUBMIT */}
                <div className="pt-3 border-t-2 border-[#2b1f14]/20 flex items-center justify-end">
                  <button
                    disabled={hasSuccess}
                    onClick={() => handleCustomSubmit(cp)}
                    className={cn(
                      "text-xs uppercase tracking-wider px-6 py-3 rounded-none font-bold transition-all cursor-pointer flex items-center gap-2 border-2 shadow-md",
                      !hasSuccess
                        ? "bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-[#2b1f14] active:scale-95"
                        : "bg-[#d8ccb8] text-[#8c7b6a] border-[#b0a08c] opacity-60 pointer-events-none",
                    )}
                  >
                    <span>NỘP KẾT LUẬN</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* HINT POPUP MODAL */}
              <CheckpointHintPopup
                isOpen={hintModalOpen}
                hints={hints}
                hintLevel={hintLevel}
                activeHintViewIdx={activeHintViewIdx}
                onClose={() => setHintModalOpen(false)}
                onViewIdxChange={setActiveHintViewIdx}
                onUnlockNext={() => {
                  onUnlockNextHint(cp.id, hints.length);
                  setActiveHintViewIdx(hintLevel);
                }}
              />

              {/* RESULT FEEDBACK POPUP MODAL */}
              <CheckpointResultModal
                modalState={resultModal}
                onClose={() => setResultModal(null)}
              />
            </div>
          );
        })()
      ) : null}
    </section>
  );
}
