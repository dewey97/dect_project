"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCheckpoints } from "@/components/investigation/checkpoints-context";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
import type { Checkpoint } from "@/lib/types";
import { detectiveAudio } from "@/lib/investigation-audio";
import {
  CASE_000_PDFS,
  CASE_000_EVIDENCE,
} from "@/components/investigation/evidence/evidence-data";
import { BoardGameCompanionView } from "@/components/investigation/evidence/board-game-companion-view";
import {
  PhaseUnlockedModal,
  UnlockedModalData,
} from "@/components/investigation/evidence/phase-unlocked-modal";
import { EpilogueModal } from "@/components/investigation/epilogue-modal";
import { JumpscareEndgame } from "@/components/investigation/jumpscare-endgame";
import { QuickActionFab } from "@/components/investigation/evidence/quick-action-fab";
import { PhoneModal } from "@/components/investigation/evidence/phone-modal";
import { ReinvestigationModal } from "@/components/investigation/evidence/reinvestigation-modal";
import { HintModal } from "@/components/investigation/hint-modal";
import {
  getStorageItem,
  setStorageItem,
  clearInvestigationStorage,
} from "@/lib/storage";
import { useInvestigationEvent } from "@/lib/investigation-events";

type ActiveModal = "phone" | "reinvestigate" | "epilogue" | "hint" | null;

export default function BoardGameCompanionPage() {
  const router = useRouter();
  const { completedCheckpointIds, completeCheckpoint } = useCheckpoints();
  const { checkpoints } = useCaseCheckpoints("case-000");

  // Single modal state
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isJumpscareActive, setIsJumpscareActive] = useState(false);

  // Checkpoint questions state
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [checkpointErrors, setCheckpointErrors] = useState<
    Record<string, boolean>
  >({});
  const [checkpointSuccesses, setCheckpointSuccesses] = useState<
    Record<string, boolean>
  >({});

  // Hint system state
  const [unlockedHintLevel, setUnlockedHintLevel] = useState<
    Record<string, number>
  >({});

  // Phase Unlocked Modal state
  const [unlockedModalData, setUnlockedModalData] =
    useState<UnlockedModalData | null>(null);

  // Event bus listeners
  useInvestigationEvent("OPEN_EPILOGUE", () => setActiveModal("epilogue"));
  useInvestigationEvent("OPEN_PHONE", () => setActiveModal("phone"));
  useInvestigationEvent("OPEN_HINT", () => setActiveModal("hint"));
  useInvestigationEvent("OPEN_REINVESTIGATE", () => setActiveModal("reinvestigate"));

  useEffect(() => {
    setStorageItem("play_experience", "boardgame");
    const isIntroSeen = getStorageItem("intro_seen");
    if (isIntroSeen !== "true") {
      setUnlockedModalData({
        unlockedPhase: 0,
        newPdfs: CASE_000_PDFS.filter((d) => d.phase === 0),
        newEvidence: CASE_000_EVIDENCE.filter((e) => e.phase === 0),
      });
    }
  }, [completedCheckpointIds.length]);

  const handleAnswerSelect = (cpId: string, option: string) => {
    detectiveAudio.playTypewriterClick();
    setSelectedAnswers((prev) => ({ ...prev, [cpId]: option }));
    setCheckpointErrors((prev) => ({ ...prev, [cpId]: false }));
  };

  const handleSubmitAnswer = (cp: Checkpoint) => {
    const userAnswer = selectedAnswers[cp.id];
    if (!userAnswer) return;

    if (
      userAnswer === "VALID_ANSWER" ||
      (cp.correctAnswer && userAnswer === cp.correctAnswer)
    ) {
      detectiveAudio.playStampSound();
      detectiveAudio.playUnlockJingle();
      setCheckpointSuccesses((prev) => ({ ...prev, [cp.id]: true }));
      setCheckpointErrors((prev) => ({ ...prev, [cp.id]: false }));
    } else {
      detectiveAudio.playGlassSound();
      setCheckpointErrors((prev) => ({ ...prev, [cp.id]: true }));
    }
  };

  const unlockNextHint = (cpId: string, maxHints: number) => {
    if (maxHints <= 0) return;
    detectiveAudio.playTypewriterClick();
    setUnlockedHintLevel((prev) => {
      const current = prev[cpId] || 0;
      const next = current >= maxHints ? 1 : current + 1;
      return {
        ...prev,
        [cpId]: next,
      };
    });
  };

  const handleProceedNextPhase = (cpId: string) => {
    const nextPhase =
      cpId === "cp-000-0"
        ? 1
        : cpId === "cp-000-1a" || cpId === "cp-000-1b"
          ? 2
          : cpId === "cp-000-2a"
            ? 3
            : null;

    completeCheckpoint(cpId);
    if (nextPhase !== null) {
      detectiveAudio.playHeartbeat();
      const newPdfs = CASE_000_PDFS.filter((d) => d.phase === nextPhase);
      const newEvidence = CASE_000_EVIDENCE.filter(
        (e) => e.phase === nextPhase,
      );
      setUnlockedModalData({
        unlockedPhase: nextPhase,
        newPdfs,
        newEvidence,
      });
    } else if (cpId === "cp-000-2b" || cpId === "cp-000-3") {
      setIsJumpscareActive(true);
    }
  };

  const handleSwitchToWebMode = () => {
    setStorageItem("play_experience", "web");
    router.push("/evidence/web");
  };

  const resetFindingsProgress = () => {
    clearInvestigationStorage();
    window.location.reload();
  };

  return (
    <div
      suppressHydrationWarning
      className="h-full w-full bg-[#0b0704] text-[#e5d8cb] font-sans selection:bg-[#d9a066]/30 selection:text-[#f4e8d8] overflow-hidden flex flex-col justify-start items-center p-0 sm:p-2 relative box-border flex-1 min-h-0"
    >
      {/* AMBIENT NOIR BANKERS SPOTLIGHT */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(217,160,102,0.13),transparent_75%)] z-0" />
      <div className="noir-scanlines pointer-events-none fixed inset-0 opacity-15 z-0" />

      <BoardGameCompanionView
        checkpoints={checkpoints}
        completedCheckpointIds={completedCheckpointIds}
        selectedAnswers={selectedAnswers}
        checkpointErrors={checkpointErrors}
        checkpointSuccesses={checkpointSuccesses}
        unlockedHintLevel={unlockedHintLevel}
        onAnswerSelect={handleAnswerSelect}
        onSubmitAnswer={handleSubmitAnswer}
        onUnlockNextHint={unlockNextHint}
        onOpenEpilogue={() => setActiveModal("epilogue")}
        onOpenPhoneSimulator={() => setActiveModal("phone")}
        onOpenReinvestigation={() => setActiveModal("reinvestigate")}
        onSwitchToWebMode={handleSwitchToWebMode}
        onProceedNextPhase={handleProceedNextPhase}
      />

      {/* PHASE UNLOCKED CINEMATIC STORY MODAL */}
      <PhaseUnlockedModal
        unlockedModalData={unlockedModalData}
        playExperience="boardgame"
        onClose={() => setUnlockedModalData(null)}
        onSelectPdf={() => {}}
        onSelectEvidence={() => {}}
        onSetPhaseFilter={() => {}}
      />

      {/* JUMPSCARE ENDGAME SEQUENCE */}
      <JumpscareEndgame
        isActive={isJumpscareActive}
        onComplete={() => {
          setIsJumpscareActive(false);
          setActiveModal("epilogue");
        }}
      />

      {/* POST-CASE EPILOGUE STORIES MODAL */}
      <EpilogueModal
        isOpen={activeModal === "epilogue"}
        onClose={() => setActiveModal(null)}
      />

      {/* QUICK ACTION FAB MENU */}
      <QuickActionFab
        onOpenHint={() => setActiveModal("hint")}
        onOpenPhone={() => setActiveModal("phone")}
        onResetCase={resetFindingsProgress}
      />

      {/* HINT SYSTEM MODAL */}
      <HintModal
        isOpen={activeModal === "hint"}
        onClose={() => setActiveModal(null)}
      />

      {/* VICTIM PHONE SIMULATOR MODAL */}
      <PhoneModal
        isOpen={activeModal === "phone"}
        onClose={() => setActiveModal(null)}
      />

      {/* RE-INVESTIGATION CRIME SCENE MODAL */}
      <ReinvestigationModal
        isOpen={activeModal === "reinvestigate"}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
