"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Paperclip,
  ImageIcon,
  Volume2,
  VolumeX,
  Box,
  X,
  Home,
} from "lucide-react";
import { PDFViewerModal } from "@/components/investigation/pdf-viewer-modal";
import { CASES } from "@/lib/mock-data";
import { detectiveAudio } from "@/lib/investigation-audio";
import { cn } from "@/lib/utils";

import type {
  PDFDocument,
  PhysicalEvidence,
  SelectedView,
  CombinedItem,
} from "@/components/investigation/evidence/evidence-types";
import {
  CASE_000_PDFS,
  CASE_000_EVIDENCE,
} from "@/components/investigation/evidence/evidence-data";
import {
  PhaseUnlockedModal,
  UnlockedModalData,
} from "@/components/investigation/evidence/phase-unlocked-modal";
import { EvidenceDetailInspector } from "@/components/investigation/evidence/evidence-detail-inspector";
import { EpilogueModal } from "@/components/investigation/epilogue-modal";
import { JumpscareEndgame } from "@/components/investigation/jumpscare-endgame";
import { QuickActionFab } from "@/components/investigation/evidence/quick-action-fab";
import { PhoneModal } from "@/components/investigation/evidence/phone-modal";
import { ReinvestigationModal } from "@/components/investigation/evidence/reinvestigation-modal";
import { PhoneSimulator } from "@/components/investigation/phone-simulator";
import { HintModal } from "@/components/investigation/hint-modal";
import { MainInvestigationCanvas } from "@/components/investigation/mindmap/main-investigation-canvas";
import {
  getStorageItem,
  setStorageItem,
  clearInvestigationStorage,
  getStorageJson,
} from "@/lib/storage";
import { useInvestigationEvent } from "@/lib/investigation-events";

type ActiveModal =
  | "phone"
  | "reinvestigate"
  | "epilogue"
  | "hint"
  | "mobile_pdf"
  | null;

export default function WebEvidencePage() {
  const router = useRouter();
  const activeCase = CASES.find((c) => c.id === "case-000");

  // Single modal registry
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isJumpscareActive, setIsJumpscareActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(detectiveAudio.isMuted);

  // Unlocked phase tracking (read from storage / boardgame progress)
  const [unlockedPhase, setUnlockedPhase] = useState<number>(0);
  const [unlockedModalData, setUnlockedModalData] =
    useState<UnlockedModalData | null>(null);

  // Right column selection state (Default: First PDF)
  const [selectedView, setSelectedView] = useState<SelectedView>({
    type: "pdf",
    data: CASE_000_PDFS[0],
  });

  // Category filter: 'all' | 'pdf' | 'evidence'
  const [filterTab, setFilterTab] = useState<"all" | "pdf" | "evidence">("all");

  // Phase filter: 'all' | 0 | 1 | 2 | 3
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<
    "all" | number
  >("all");

  const [activeHintCheckpointId, setActiveHintCheckpointId] = useState<string | undefined>(undefined);

  // Event bus listeners
  useInvestigationEvent("OPEN_EPILOGUE", () => setActiveModal("epilogue"));
  useInvestigationEvent("OPEN_PHONE", () => setActiveModal("phone"));
  useInvestigationEvent("OPEN_HINT", (e: any) => {
    const cpId = e?.detail?.checkpointId || (typeof e?.detail === "string" ? e.detail : undefined);
    setActiveHintCheckpointId(cpId);
    setActiveModal("hint");
  });
  useInvestigationEvent("OPEN_REINVESTIGATE", () => setActiveModal("reinvestigate"));

  useEffect(() => {
    setStorageItem("play_experience", "web");

    const isIntroSeen = getStorageItem("intro_seen");
    if (isIntroSeen !== "true") {
      setUnlockedModalData({
        unlockedPhase: 0,
        newPdfs: CASE_000_PDFS.filter((d) => d.phase === 0),
        newEvidence: CASE_000_EVIDENCE.filter((e) => e.phase === 0),
      });
    }

    // Check current unlocked phase from boardgame progress
    const solvedFollowups = getStorageJson<string[]>("solved_followups", []);
    const isReinvestigateUnlocked =
      getStorageItem("reinvestigate_unlocked") === "true";
    const isIndictmentSolved =
      getStorageItem("indictment_solved") === "true";

    if (isIndictmentSolved) {
      setUnlockedPhase(3);
    } else if (isReinvestigateUnlocked || solvedFollowups.length >= 2) {
      setUnlockedPhase(2);
    } else {
      setUnlockedPhase(1);
    }
  }, []);

  const isPhaseUnlocked = useCallback(
    (phase: number) => {
      if (phase === 0) return true;
      return phase <= unlockedPhase;
    },
    [unlockedPhase],
  );

  const handleSelectPdf = (doc: PDFDocument) => {
    if (!isPhaseUnlocked(doc.phase)) return;
    detectiveAudio.playTypewriterClick();
    setSelectedView({ type: "pdf", data: doc });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setActiveModal("mobile_pdf");
    } else if (activeModal === "phone") {
      setActiveModal(null);
    }
  };

  const handleSelectEvidence = (item: PhysicalEvidence) => {
    if (!isPhaseUnlocked(item.phase)) return;
    detectiveAudio.playGlassSound();
    setSelectedView({ type: "evidence", data: item });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setActiveModal("mobile_pdf");
    } else if (activeModal === "phone") {
      setActiveModal(null);
    }
  };

  const resetAllProgress = () => {
    clearInvestigationStorage();
    window.location.reload();
  };

  const filteredPdfs = CASE_000_PDFS.filter((doc) => {
    if (!isPhaseUnlocked(doc.phase)) return false;
    if (filterTab === "evidence") return false;
    if (selectedPhaseFilter !== "all" && doc.phase !== selectedPhaseFilter)
      return false;
    return true;
  });

  const filteredEvidence = CASE_000_EVIDENCE.filter((item) => {
    if (!isPhaseUnlocked(item.phase)) return false;
    if (filterTab === "pdf") return false;
    if (selectedPhaseFilter !== "all" && item.phase !== selectedPhaseFilter)
      return false;
    return true;
  });

  const combinedItems: CombinedItem[] = [
    ...filteredPdfs.map((doc): CombinedItem => ({
      type: "pdf",
      data: doc,
      phase: doc.phase,
      order: doc.order,
    })),
    ...filteredEvidence.map((item): CombinedItem => ({
      type: "evidence",
      data: item,
      phase: item.phase,
      order: item.order,
    })),
  ].sort((a, b) => a.order - b.order);

  return (
    <div
      suppressHydrationWarning
      className="h-full w-full bg-[#0d0a08] text-[#e5d8cb] font-sans selection:bg-[#d9a066]/30 selection:text-[#f4e8d8] overflow-hidden flex items-center justify-center p-2 sm:p-3 box-border min-h-0 min-w-0"
    >
      <div className="w-full max-w-[1900px] h-full flex flex-col lg:flex-row gap-3 xl:gap-4 items-stretch justify-center overflow-hidden min-h-0 min-w-0">
        {/* LEFT COLUMN: FULL BOARDGAME INVESTIGATION CANVAS */}
        <div className="w-full lg:w-[58%] xl:w-[60%] shrink-0 bg-[#16120e] border-2 border-[#3d2c1e] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden h-full flex flex-col min-h-0 relative">
          {/* MAIN CANVAS */}
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <MainInvestigationCanvas
              onOpenPhoneSimulator={() => setActiveModal("phone")}
              onOpenReinvestigation={() => setActiveModal("reinvestigate")}
              onOpenEpilogue={() => setActiveModal("epilogue")}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: DOSSIER LIST (TOP) + DOCUMENT PREVIEW / INSPECTOR (BOTTOM) */}
        <div className="flex-1 min-w-0 h-full flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* TOP SECTION: DOSSIER INDEX WITH FILTER TABS */}
          <div className="h-[38%] shrink-0 bg-[#16120e] border-2 border-[#3d2c1e] rounded-xl shadow-lg overflow-hidden flex flex-col min-h-0">
            <div className="shrink-0 border-b border-[#3d2c1e] px-4 py-2.5 bg-[#241a12] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Paperclip className="size-3.5 text-[#d9a066]" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#e6d3c1]">
                  DANH MỤC HỒ SƠ & TANG CHỨNG
                </h2>
              </div>

              <div className="flex items-center gap-1 font-mono text-[0.6rem]">
                <button
                  onClick={() => setFilterTab("all")}
                  className={cn(
                    "px-2 py-0.5 font-bold transition-all cursor-pointer border rounded-xs",
                    filterTab === "all"
                      ? "bg-[#d9a066] text-[#1a0f07] border-[#d9a066]"
                      : "bg-[#241a12] text-[#ad9885] border-[#4a3625]",
                  )}
                >
                  TẤT CẢ
                </button>
                <button
                  onClick={() => setFilterTab("pdf")}
                  className={cn(
                    "px-2 py-0.5 font-bold transition-all cursor-pointer border rounded-xs",
                    filterTab === "pdf"
                      ? "bg-[#d9a066] text-[#1a0f07] border-[#d9a066]"
                      : "bg-[#241a12] text-[#ad9885] border-[#4a3625]",
                  )}
                >
                  HỒ SƠ
                </button>
                <button
                  onClick={() => setFilterTab("evidence")}
                  className={cn(
                    "px-2 py-0.5 font-bold transition-all cursor-pointer border rounded-xs",
                    filterTab === "evidence"
                      ? "bg-[#d9a066] text-[#1a0f07] border-[#d9a066]"
                      : "bg-[#241a12] text-[#ad9885] border-[#4a3625]",
                  )}
                >
                  VẬT CHỨNG
                </button>
              </div>
            </div>

            {/* DOSSIER PACKET FILTER PILLS */}
            <div className="shrink-0 px-3 py-1.5 border-b border-[#3d2c1e]/60 bg-[#1a1410] flex items-center gap-1.5 overflow-x-auto text-[0.62rem] font-mono">
              <span className="text-[#8c735d] uppercase tracking-wider pr-1">
                HỒ SƠ:
              </span>
              {[
                { label: "TẤT CẢ", val: "all" as const },
                { label: "BAN ĐẦU", val: 0 },
                { label: "BỘ A", val: 1 },
                { label: "BỘ B", val: 2 },
                { label: "BỘ C", val: 3 },
              ].map((p) => {
                const isLocked =
                  typeof p.val === "number" && !isPhaseUnlocked(p.val);
                const isSelected = selectedPhaseFilter === p.val;
                return (
                  <button
                    key={p.label}
                    disabled={isLocked}
                    onClick={() => setSelectedPhaseFilter(p.val)}
                    className={cn(
                      "px-2 py-0.5 rounded transition-all whitespace-nowrap",
                      isLocked
                        ? "opacity-35 cursor-not-allowed text-[#6b5847]"
                        : isSelected
                          ? "bg-[#d9a066] text-[#1a0f07] font-bold"
                          : "bg-[#241a12] text-[#ad9885] hover:text-[#e6d3c1] hover:bg-[#342417] cursor-pointer",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* SCROLLABLE LIST */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 min-h-0">
              {combinedItems.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-[#8c735d]">
                  Không có tài liệu nào phù hợp với bộ lọc.
                </div>
              ) : (
                combinedItems.map((item) => {
                  const isSelected =
                    selectedView.type === item.type &&
                    selectedView.data.id === item.data.id;
                  const isPdf = item.type === "pdf";
                  const dossierName =
                    item.phase === 0
                      ? "Ban Đầu"
                      : item.phase === 1
                        ? "Bộ A"
                        : item.phase === 2
                          ? "Bộ B"
                          : "Bộ C";

                  return (
                    <button
                      key={`${item.type}-${item.data.id}`}
                      onClick={() =>
                        isPdf
                          ? handleSelectPdf(item.data as PDFDocument)
                          : handleSelectEvidence(item.data as PhysicalEvidence)
                      }
                      className={cn(
                        "w-full text-left p-2 rounded border transition-all cursor-pointer flex items-center justify-between gap-2 text-xs",
                        isSelected
                          ? "bg-[#2e2014] border-[#d9a066] text-[#fef5ec] shadow-sm"
                          : "bg-[#1c1611] hover:bg-[#251d16] border-[#3d2c1e] text-[#ad9885] hover:text-[#e6d3c1]",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isPdf ? (
                          <FileText
                            className={cn(
                              "size-3.5 shrink-0",
                              isSelected ? "text-[#d9a066]" : "text-[#8c735d]",
                            )}
                          />
                        ) : (
                          <ImageIcon
                            className={cn(
                              "size-3.5 shrink-0",
                              isSelected ? "text-[#d9a066]" : "text-[#8c735d]",
                            )}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold truncate leading-tight">
                            {item.data.title}
                          </p>
                          <span className="font-mono text-[0.6rem] text-[#8c735d] block">
                            {item.data.id} // {dossierName}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* BOTTOM SECTION: DOCUMENT PREVIEW OR INLINE PHONE SIMULATOR */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {activeModal === "phone" ? (
              <div className="flex-1 bg-[#120c08] border-2 border-[#543b27] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden h-full flex flex-col relative items-center justify-center p-2 pt-10 min-h-0">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-2 right-2 z-50 p-1.5 px-2.5 text-[#ad9885] hover:text-[#fef5ec] bg-[#24170e]/95 hover:bg-[#382618] rounded-full transition-colors cursor-pointer border border-[#543b27] shadow-lg flex items-center gap-1 text-[0.65rem] font-mono font-bold"
                  title="Đóng điện thoại"
                >
                  <X className="size-3 text-[#d9a066]" />
                  <span>ĐÓNG PHONE</span>
                </button>

                <div className="flex-1 w-full min-h-0 flex items-center justify-center p-1 overflow-hidden">
                  <PhoneSimulator />
                </div>
              </div>
            ) : (
              <EvidenceDetailInspector selectedView={selectedView} />
            )}
          </div>
        </div>
      </div>

      {/* PHASE UNLOCKED CINEMATIC STORY MODAL */}
      <PhaseUnlockedModal
        unlockedModalData={unlockedModalData}
        playExperience="web"
        onClose={() => setUnlockedModalData(null)}
        onSelectPdf={handleSelectPdf}
        onSelectEvidence={handleSelectEvidence}
        onSetPhaseFilter={(phase) => setSelectedPhaseFilter(phase)}
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
        onOpenPhone={() => setActiveModal("phone")}
        onOpenBoardGame={() => {
          detectiveAudio.playPaperRustle();
          router.push("/evidence/boardgame");
        }}
        onResetCase={resetAllProgress}
      />

      {/* HINT SYSTEM MODAL */}
      <HintModal
        isOpen={activeModal === "hint"}
        checkpointId={activeHintCheckpointId}
        onClose={() => {
          setActiveModal(null);
          setActiveHintCheckpointId(undefined);
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

      {/* MOBILE FULL SCREEN MODAL */}
      <PDFViewerModal
        isOpen={activeModal === "mobile_pdf"}
        selectedView={selectedView}
        pdfUrl={selectedView.type === "pdf" ? selectedView.data.url : null}
        title={selectedView.data.title}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
