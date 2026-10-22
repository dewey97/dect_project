"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { caseStorageKey } from "@/lib/cases/case-id";
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
import nextDynamic from "next/dynamic";
import { HintModal } from "@/components/investigation/hint-modal";
import {
  getStorageItem,
  setStorageItem,
  clearInvestigationStorage,
} from "@/lib/storage";
import { useInvestigationEvent } from "@/lib/investigation-events";
// Modal khám xét hiện trường kéo theo three.js (Scene360Viewer) — chỉ tải khi cần.
const ReinvestigationModal = nextDynamic(
  () =>
    import("@/components/investigation/evidence/reinvestigation-modal").then(
      (m) => m.ReinvestigationModal,
    ),
  { ssr: false },
);

type ActiveModal = "phone" | "reinvestigate" | "epilogue" | "hint" | null;

function BoardGameCompanionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCaseId =
    searchParams.get("case_id") || searchParams.get("caseId") || "case-000";
  const caseId =
    rawCaseId === "case_000" || rawCaseId === "case-000"
      ? "case-000"
      : rawCaseId;

  const { completedCheckpointIds } = useCheckpoints();

  // Single modal state
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isJumpscareActive, setIsJumpscareActive] = useState(false);

  // Phase Unlocked Modal state
  const [unlockedModalData, setUnlockedModalData] =
    useState<UnlockedModalData | null>(null);

  const [activeHintCheckpointId, setActiveHintCheckpointId] = useState<
    string | undefined
  >(undefined);
  const [activeHintCategory, setActiveHintCategory] = useState<
    "motive" | "alibi" | undefined
  >(undefined);

  // Event bus listeners
  useInvestigationEvent("OPEN_EPILOGUE", () => setActiveModal("epilogue"));
  useInvestigationEvent("OPEN_PHONE", () => setActiveModal("phone"));
  useInvestigationEvent("OPEN_HINT", (e: any) => {
    const cpId =
      e?.detail?.checkpointId ||
      (typeof e?.detail === "string" ? e.detail : undefined);
    const cat =
      e?.detail?.category ||
      (typeof e?.detail === "object" ? e.detail?.category : undefined);
    setActiveHintCheckpointId(cpId);
    setActiveHintCategory(cat);
    setActiveModal("hint");
  });
  useInvestigationEvent("OPEN_REINVESTIGATE", () =>
    setActiveModal("reinvestigate"),
  );

  const isCase000 = caseId === "case-000" || caseId === "case_000";

  useEffect(() => {
    setStorageItem("play_experience", "boardgame");
    const isIntroSeen = getStorageItem(caseStorageKey(caseId, "intro_seen"));
    if (isIntroSeen !== "true" && isCase000) {
      setUnlockedModalData({
        unlockedPhase: 0,
        newPdfs: CASE_000_PDFS.filter((d) => d.phase === 0),
        newEvidence: CASE_000_EVIDENCE.filter((e) => e.phase === 0),
      });
    }
  }, [caseId, isCase000]);

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
        onOpenEpilogue={() => setActiveModal("epilogue")}
        onOpenPhoneSimulator={() => setActiveModal("phone")}
        onOpenReinvestigation={() => setActiveModal("reinvestigate")}
      />

      {/* PHASE UNLOCKED CINEMATIC STORY MODAL */}
      <PhaseUnlockedModal
        unlockedModalData={unlockedModalData}
        playExperience="boardgame"
        autoStartStory={false}
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
        caseId={caseId}
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

export default function BoardGameCompanionPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full bg-[#0d0a08] flex items-center justify-center text-[#d9a066] font-mono text-xs">
          Đang nạp hồ sơ board game...
        </div>
      }
    >
      <BoardGameCompanionContent />
    </Suspense>
  );
}
