"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCheckpoints } from "@/components/investigation/checkpoints-context";
import {
  CASE_000_PDFS,
  CASE_000_EVIDENCE,
} from "@/components/investigation/evidence/evidence-data";
import { BoardGameCompanionView } from "@/components/investigation/evidence/board-game-companion-view";
import {
  PhaseUnlockedModal,
  type UnlockedModalData,
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
  const { completedCheckpointIds } = useCheckpoints();

  // Gatekeeper: Always require clicking [ TRỐN TÌM ] when coming into the game session!
  const [hasEnteredSession, setHasEnteredSession] = useState(false);

  // Single modal state
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isJumpscareActive, setIsJumpscareActive] = useState(false);

  // Phase Unlocked Modal state
  const [unlockedModalData, setUnlockedModalData] =
    useState<UnlockedModalData | null>(null);

  const [activeHintCheckpointId, setActiveHintCheckpointId] = useState<string | undefined>(undefined);
  const [activeHintCategory, setActiveHintCategory] = useState<"motive" | "alibi" | undefined>(undefined);

  // Event bus listeners
  useInvestigationEvent("OPEN_EPILOGUE", () => setActiveModal("epilogue"));
  useInvestigationEvent("OPEN_PHONE", () => setActiveModal("phone"));
  useInvestigationEvent("OPEN_HINT", (e: any) => {
    const cpId = e?.detail?.checkpointId || (typeof e?.detail === "string" ? e.detail : undefined);
    const cat = e?.detail?.category || (typeof e?.detail === "object" ? e.detail?.category : undefined);
    setActiveHintCheckpointId(cpId);
    setActiveHintCategory(cat);
    setActiveModal("hint");
  });
  useInvestigationEvent("OPEN_REINVESTIGATE", () => setActiveModal("reinvestigate"));

  useEffect(() => {
    setStorageItem("play_experience", "boardgame");
  }, []);

  const handleEnterGame = () => {
    setHasEnteredSession(true);
    const isIntroSeen = getStorageItem("intro_seen");
    if (isIntroSeen !== "true") {
      setUnlockedModalData({
        unlockedPhase: 0,
        newPdfs: CASE_000_PDFS.filter((d) => d.phase === 0),
        newEvidence: CASE_000_EVIDENCE.filter((e) => e.phase === 0),
      });
    }
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

      {/* ENTRY GATE: ALWAYS PRESENTS THE CENTERED [ TRỐN TÌM ] BUTTON BEFORE CONTINUING */}
      {!hasEnteredSession && (
        <div className="fixed inset-0 z-50 bg-[#0c0805] text-[#e5d8cb] flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-300">
          <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-0" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(217,160,102,0.14),transparent_70%)] z-0" />

          <button
            onClick={handleEnterGame}
            className="relative z-10 px-8 py-4 bg-[#221810] hover:bg-[#342418] border border-[#d9a066]/50 hover:border-[#d9a066] text-[#d9a066] font-mono text-sm sm:text-base font-bold tracking-[0.3em] uppercase transition-all cursor-pointer shadow-2xl rounded hover:scale-105 active:scale-95"
          >
            [ TRỐN TÌM ]
          </button>
        </div>
      )}

      <BoardGameCompanionView
        onOpenEpilogue={() => setActiveModal("epilogue")}
        onOpenPhoneSimulator={() => setActiveModal("phone")}
        onOpenReinvestigation={() => setActiveModal("reinvestigate")}
      />

      {/* PHASE UNLOCKED CINEMATIC STORY MODAL */}
      <PhaseUnlockedModal
        unlockedModalData={unlockedModalData}
        playExperience="boardgame"
        autoStartStory={true}
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
      {activeModal !== "reinvestigate" && (
        <QuickActionFab
          onResetCase={resetFindingsProgress}
          onGoHome={() => router.push("/")}
        />
      )}

      {/* HINT SYSTEM MODAL */}
      <HintModal
        isOpen={activeModal === "hint"}
        checkpointId={activeHintCheckpointId}
        category={activeHintCategory}
        onClose={() => {
          setActiveModal(null);
          setActiveHintCheckpointId(undefined);
          setActiveHintCategory(undefined);
        }}
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
