"use client";

import React from "react";
import type { PinPoint } from "@/components/investigation/hero-interactive";
import { AddSuspectModal } from "../add-suspect-modal";
import { PhoneLookupModal } from "../phone-lookup-modal";
import { PhoneNarrativeModal } from "../phone-narrative-modal";
import { DossierEModal } from "../dossier-e-modal";
import { GameplayGuideModal } from "../gameplay-guide-modal";
import { InteractiveWalkthrough } from "../interactive-walkthrough";
import { IndictmentModal } from "../indictment-modal";
import { CulpritEpilogueModal } from "../culprit-epilogue-modal";
import { DossierResultModal } from "../dossier-result-modal";
import { FollowupQuestionModal } from "../followup-question-modal";
import { CustomPinModal } from "../custom-pin-modal";
import nextDynamic from "next/dynamic";
import { PhoneModal } from "@/components/investigation/evidence/phone-modal";
import { EpilogueModal } from "@/components/investigation/epilogue-modal";
import { detectiveAudio } from "@/lib/investigation-audio";
import { toast } from "@/components/ui/toast";
import { setStorageItem } from "@/lib/storage";
import type { useBoardLayout } from "./use-board-layout";
import type { useInvestigationState, CulpritKey } from "./use-investigation-state";
// Modal khám xét hiện trường kéo theo three.js (Scene360Viewer) — chỉ tải khi cần.
const ReinvestigationModal = nextDynamic(
  () =>
    import("@/components/investigation/evidence/reinvestigation-modal").then(
      (m) => m.ReinvestigationModal,
    ),
  { ssr: false },
);

export interface CanvasModalsProps {
  layout: ReturnType<typeof useBoardLayout>;
  state: ReturnType<typeof useInvestigationState>;
  displayPins: PinPoint[];
  activeCustomPinModal: PinPoint | null;
  setActiveCustomPinModal: (pin: PinPoint | null) => void;
  onOpenPhoneSimulator?: () => void;
}

export function CanvasModals({
  layout,
  state,
  displayPins,
  activeCustomPinModal,
  setActiveCustomPinModal,
  onOpenPhoneSimulator,
}: CanvasModalsProps) {
  return (
    <>
      {/* 1. Modal Thêm / Chỉnh Sửa Nghi Phạm */}
      {state.isAddSuspectOpen && (
        <AddSuspectModal
          key={
            state.editingSuspect
              ? `suspect-${state.editingSuspect.id}`
              : "suspect-modal"
          }
          caseId={state.caseId}
          isOpen={state.isAddSuspectOpen}
          onClose={() => {
            state.setIsAddSuspectOpen(false);
            state.setEditingSuspect(null);
          }}
          onSave={state.handleSaveSuspect}
          onDelete={state.handleDeleteSuspect}
          editingSuspect={state.editingSuspect}
          existingSuspects={state.suspects}
          onSelectSuspect={(s) => state.setEditingSuspect(s)}
          isPhoneSolved={state.phoneLookupSuccess}
          onSubmitConclusion={(culprit) => {
            detectiveAudio.playStampSound();
            detectiveAudio.playUnlockJingle();
            state.setInvestigatedSuspects((prev) => {
              const next = Array.from(
                new Set([...prev, culprit]),
              ) as CulpritKey[];
              setStorageItem("investigated_suspects", JSON.stringify(next));
              return next;
            });
            state.setNarrativeCulprit(culprit);
            state.setActiveFollowupCulprit(culprit);
            state.setIsEpilogueOpen(true);
          }}
        />
      )}

      {/* 2. Modal Tra Cứu Số Điện Thoại */}
      {state.isPhoneLookupOpen && (
        <PhoneLookupModal
          caseId={state.caseId}
          isOpen={state.isPhoneLookupOpen}
          onClose={() => state.setIsPhoneLookupOpen(false)}
          onSuccess={state.handlePhoneLookupSuccess}
          onOpenPhoneSimulator={
            onOpenPhoneSimulator || (() => state.setIsInternalPhoneOpen(true))
          }
        />
      )}

      {/* 3. Modal Dẫn Truyện Điện Thoại Tang Vật */}
      {state.isPhoneNarrativeOpen && (
        <PhoneNarrativeModal
          caseId={state.caseId}
          isOpen={state.isPhoneNarrativeOpen}
          onClose={() => state.setIsPhoneNarrativeOpen(false)}
          onTakeTestimony={() => state.setIsDossierEOpen(true)}
        />
      )}

      {/* 4. Modal Giả Lập Điện Thoại Tang Vật Nội Bộ */}
      {state.isInternalPhoneOpen && (
        <PhoneModal
          caseId={state.caseId}
          isOpen={state.isInternalPhoneOpen}
          onClose={() => state.setIsInternalPhoneOpen(false)}
        />
      )}

      {/* 5. Modal Hồ Sơ E */}
      {state.isDossierEOpen && (
        <DossierEModal
          isOpen={state.isDossierEOpen}
          onClose={() => state.setIsDossierEOpen(false)}
        />
      )}

      {/* 7. Modal Tái Khám Xét Hiện Trường */}
      {state.isReinvestigateModalOpen && (
        <ReinvestigationModal
          caseId={state.caseId}
          isOpen={state.isReinvestigateModalOpen}
          onClose={() => state.setIsReinvestigateModalOpen(false)}
        />
      )}

      {/* 8. Modal Bản Kết Luận Điều Tra / Cáo Trạng */}
      {state.isIndictmentOpen && (
        <IndictmentModal
          caseId={state.caseId}
          isOpen={state.isIndictmentOpen}
          onClose={() => state.setIsIndictmentOpen(false)}
          onSubmitIndictment={state.handleSubmitIndictment}
          isPhoneSolved={state.phoneLookupSuccess}
        />
      )}

      {/* 9. Modal Lời Khai / Epilogue Hung Thủ */}
      {state.isEpilogueOpen && (
        <CulpritEpilogueModal
          caseId={state.caseId}
          isOpen={state.isEpilogueOpen}
          subjectKey={
            state.activeFollowupCulprit ||
            state.narrativeCulprit ||
            state.solvedCulprit ||
            (state.suspects[0]?.id || "")
          }
          culprit={
            state.narrativeCulprit ||
            state.activeFollowupCulprit ||
            state.solvedCulprit
          }
          choice={state.narrativeChoice}
          onClose={() => {
            state.setIsEpilogueOpen(false);
            state.setNarrativeCulprit(null);
            state.setNarrativeChoice(null);
          }}
          onOpenDossier={state.handleOpenDossier}
          onOpenFollowupQuestion={(targetCulprit) => {
            const c =
              targetCulprit ||
              state.narrativeCulprit ||
              state.activeFollowupCulprit ||
              state.solvedCulprit ||
              (state.suspects[0]?.id || "");
            state.setActiveFollowupCulprit(c);
            state.setIsEpilogueOpen(false);
            state.setNarrativeCulprit(null);
            state.setNarrativeChoice(null);
            state.setIsFollowupQuestionOpen(true);
          }}
          onOpenIndictment={() => {
            state.setIsEpilogueOpen(false);
            state.setNarrativeCulprit(null);
            state.setNarrativeChoice(null);
            state.setIsIndictmentOpen(true);
          }}
        />
      )}

      {/* 10. Modal Kết Quả Hồ Sơ Nghi Phạm (A, B, C) */}
      {state.isDossierOpen && (
        <DossierResultModal
          caseId={state.caseId}
          suspectName={
            state.activeDossierType === "A"
              ? state.suspects[0]?.name
              : state.activeDossierType === "B"
                ? state.suspects[1]?.name
                : state.suspects[2]?.name
          }
          isOpen={state.isDossierOpen}
          dossierType={state.activeDossierType}
          onClose={() => state.setIsDossierOpen(false)}
          onOpenFollowupQuestion={() => {
            state.setIsDossierOpen(false);
            const c =
              state.activeDossierType === "A"
                ? (state.suspects[0]?.id || "")
                : state.activeDossierType === "B"
                  ? (state.suspects[1]?.id || "")
                  : (state.suspects[2]?.id || "");
            state.setActiveFollowupCulprit(c);
            state.setIsFollowupQuestionOpen(true);
          }}
        />
      )}

      {/* 11. Modal Câu Hỏi Đào Sâu Nghi Vấn */}
      {state.isFollowupQuestionOpen && (
        <FollowupQuestionModal
          key={`followup-${state.activeFollowupCulprit || state.narrativeCulprit || state.solvedCulprit || state.suspects[0]?.id || "active"}`}
          caseId={state.caseId}
          isOpen={state.isFollowupQuestionOpen}
          subjectKey={
            state.activeFollowupCulprit ||
            state.narrativeCulprit ||
            state.solvedCulprit ||
            (state.suspects[0]?.id || "")
          }
          culprit={
            state.activeFollowupCulprit ||
            state.narrativeCulprit ||
            state.solvedCulprit ||
            (state.suspects[0]?.id || "")
          }
          onClose={() => {
            state.setIsFollowupQuestionOpen(false);
            state.setActiveFollowupCulprit(null);
          }}
          onSuccess={state.handleFollowupSuccess}
          onOpenDossier={state.handleOpenDossier}
          isPhoneSolved={state.phoneLookupSuccess}
        />
      )}

      {/* 12. Modal Khép Lại Vụ Án (Final Epilogue) */}
      {state.isFinalEpilogueOpen && (
        <EpilogueModal
          caseId={state.caseId}
          isOpen={state.isFinalEpilogueOpen}
          onClose={() => state.setIsFinalEpilogueOpen(false)}
        />
      )}

      {/* 14. Modal Trả Lời Câu Hỏi Của Node Tự Tạo */}
      {activeCustomPinModal !== null && (
        <CustomPinModal
          caseId={state.caseId}
          isOpen={activeCustomPinModal !== null}
          onClose={() => setActiveCustomPinModal(null)}
          pin={activeCustomPinModal}
          onSolve={(_pinId) => {
            toast.success("Đã hoàn thành câu hỏi ghim!");
          }}
        />
      )}

      {/* 15. Modal Sổ Tay / Cẩm Nang Hướng Dẫn Gameplay */}
      {state.isGameplayGuideOpen && (
        <GameplayGuideModal
          isOpen={state.isGameplayGuideOpen}
          onClose={() => state.setIsGameplayGuideOpen(false)}
          onStartWalkthrough={() => {
            state.setIsGameplayGuideOpen(false);
            state.setIsWalkthroughOpen(true);
          }}
        />
      )}

      {/* 16. Hướng Dẫn Từng Bước (Interactive Walkthrough) */}
      {state.isWalkthroughOpen && (
        <InteractiveWalkthrough
          isOpen={state.isWalkthroughOpen}
          onClose={() => {
            state.setIsWalkthroughOpen(false);
            layout.setSelectedPinId(null);
          }}
          pins={displayPins}
          canvasWrapperRef={layout.canvasWrapperRef}
          onStepChange={layout.setSelectedPinId}
        />
      )}
    </>
  );
}
