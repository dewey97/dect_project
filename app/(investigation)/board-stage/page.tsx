"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCheckpoints } from "@/components/investigation/checkpoints-context";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
import { useCaseEvidence } from "@/lib/hooks/use-case-evidence";
import type { Checkpoint } from "@/lib/types";
import { detectiveAudio } from "@/lib/investigation-audio";
import { MainInvestigationCanvas } from "@/components/investigation/mindmap/main-investigation-canvas";
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
import { caseStorageKey } from "@/lib/cases/case-id";
import { useInvestigationEvent } from "@/lib/investigation-events";
import {
  Lightbulb,
  Sliders,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
// Modal khám xét hiện trường kéo theo three.js (Scene360Viewer) — chỉ tải khi cần.
const ReinvestigationModal = nextDynamic(
  () =>
    import("@/components/investigation/evidence/reinvestigation-modal").then(
      (m) => m.ReinvestigationModal,
    ),
  { ssr: false },
);

type ActiveModal = "phone" | "reinvestigate" | "epilogue" | "hint" | null;

const BG_OPTIONS = [
  {
    id: "pbr_3d_frame",
    name: "Khung gỗ 3D Bevel nẹp đồng (PBR Mockup)",
    url: "/images/backgrounds/pure_cork_texture_vertical.jpg",
    hasPbrFrame: true,
  },
  {
    id: "vintage_framed",
    name: "Khung gỗ nẹp đồng cổ điển (Full)",
    url: "/images/backgrounds/vintage_framed_corkboard_vertical.jpg",
    hasPbrFrame: false,
  },
  {
    id: "pure_cork",
    name: "Mặt nỉ bần macro nguyên bản",
    url: "/images/backgrounds/pure_cork_texture_vertical.jpg",
    hasPbrFrame: false,
  },
  {
    id: "cork_empty",
    name: "Ảnh cũ mặc định",
    url: "/images/backgrounds/corkboard_vertical_empty.jpg",
    hasPbrFrame: false,
  },
];

function BoardStageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCaseId =
    searchParams.get("case_id") || searchParams.get("caseId") || "case-000";
  const caseId =
    rawCaseId === "case_000" || rawCaseId === "case-000"
      ? "case-000"
      : rawCaseId;

  const { completedCheckpointIds, completeCheckpoint } = useCheckpoints();
  const { checkpoints } = useCaseCheckpoints(caseId);

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

  const [activeHintCheckpointId, setActiveHintCheckpointId] = useState<
    string | undefined
  >(undefined);
  const [activeHintCategory, setActiveHintCategory] = useState<
    "motive" | "alibi" | undefined
  >(undefined);

  // ──────────────────────────────────────────────
  // TÙY CHỈNH BACKGROUND & NÓN ÁNH SÁNG TESTING
  // ──────────────────────────────────────────────
  const [selectedBgId, setSelectedBgId] = useState(BG_OPTIONS[0].id);
  const currentBgOption =
    BG_OPTIONS.find((b) => b.id === selectedBgId) || BG_OPTIONS[0];
  const [lampOn, setLampOn] = useState(true);
  const [coneSpread, setConeSpread] = useState(65); // Độ mở nón (35° -> 90°)
  const [lampIntensity, setLampIntensity] = useState(85); // 20% -> 100%
  const [showControls, setShowControls] = useState(false);

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

  const { pdfs: casePdfs, evidence: caseEvs } = useCaseEvidence(caseId);

  useEffect(() => {
    setStorageItem("play_experience", "boardgame");
    const isIntroSeen = getStorageItem(caseStorageKey(caseId, "intro_seen"));
    const initPdfs = casePdfs.filter((d) => d.phase === 0);
    const initEvidence = caseEvs.filter((e) => e.phase === 0);
    if (isIntroSeen !== "true" && (initPdfs.length > 0 || initEvidence.length > 0)) {
      setUnlockedModalData({
        unlockedPhase: 0,
        newPdfs: initPdfs,
        newEvidence: initEvidence,
      });
    }
  }, [completedCheckpointIds.length, caseId, casePdfs, caseEvs]);

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
      completeCheckpoint(cp.id);
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

  const handleProceedNextPhase = (currentPhaseStr: string) => {
    const phaseNum = parseInt(currentPhaseStr.replace(/\D/g, ""), 10);
    const nextPhase = isNaN(phaseNum) ? 1 : phaseNum + 1;
    if (nextPhase <= 4) {
      setUnlockedModalData({
        unlockedPhase: nextPhase,
        newPdfs: casePdfs.filter((d) => d.phase === nextPhase),
        newEvidence: caseEvs.filter((e) => e.phase === nextPhase),
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
      className="h-full w-full bg-[#0b0704] text-[#e5d8cb] font-sans selection:bg-[#d9a066]/30 selection:text-[#f4e8d8] overflow-hidden flex flex-col justify-start items-center p-0 relative box-border flex-1 min-h-0"
    >
      {/* ─────────────────────────────────────────────────────────────
          2. THANH TEST CONTROL: CHUYỂN BACKGROUND & NÓN ÁNH SÁNG
      ───────────────────────────────────────────────────────────── */}
      <header className="z-40 w-full max-w-4xl px-3 py-2 flex items-center justify-between bg-black/80 backdrop-blur-md border-b border-amber-950/40 text-stone-300 text-xs">
        <div className="flex items-center gap-2">
          <Link
            href="/evidence/boardgame"
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-[11px]">Bảng gốc</span>
          </Link>
          <span className="font-mono text-[11px] text-amber-500 font-semibold tracking-wider uppercase">
            TEST LAB: EVIDENCE BOARD
          </span>
        </div>

        {/* Nút bật tắt nón đèn & mở bộ tùy chỉnh */}
        <div className="flex items-center gap-2">
          {/* Menu chọn Background */}
          <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded border border-stone-800">
            <ImageIcon className="w-3.5 h-3.5 text-stone-400 ml-1" />
            <select
              value={selectedBgId}
              onChange={(e) => setSelectedBgId(e.target.value)}
              className="bg-transparent text-[10.5px] text-stone-200 outline-none cursor-pointer pr-1"
            >
              {BG_OPTIONS.map((opt) => (
                <option
                  key={opt.id}
                  value={opt.id}
                  className="bg-stone-900 text-stone-200"
                >
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowControls((prev) => !prev)}
            title="Tùy chỉnh nón ánh sáng rọi đỉnh"
            className={`p-1.5 rounded border transition-all ${
              showControls
                ? "bg-amber-600/30 text-amber-300 border-amber-500"
                : "bg-stone-900 text-stone-400 border-stone-800 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setLampOn((prev) => !prev)}
            title="Bật/Tắt nón ánh sáng"
            className={`p-1.5 rounded border transition-all ${
              lampOn
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                : "bg-stone-900 text-stone-500 border-stone-800"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Drawer chỉnh thông số nón ánh sáng */}
      {showControls && (
        <div className="z-40 w-full max-w-4xl px-4 py-3 bg-stone-950/95 border-b border-amber-900/40 backdrop-blur-md animate-in slide-in-from-top-2 duration-150 shadow-2xl">
          <div className="text-[11px] font-mono text-amber-400 uppercase font-semibold mb-2 flex items-center justify-between">
            <span>Tùy chỉnh Nón Ánh Sáng Chiếu Đỉnh (Tâm chính giữa)</span>
            <span className="text-[10px] text-stone-400 font-normal">
              Realtime Spotlight Cone
            </span>
          </div>
          <div className="grid grid-cols-2 gap-6 text-[10px] text-stone-300">
            <div>
              <span className="text-stone-400 block mb-1">
                Độ mở nón sáng: {coneSpread}°
              </span>
              <input
                type="range"
                min="35"
                max="90"
                value={coneSpread}
                onChange={(e) => setConeSpread(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded"
              />
            </div>
            <div>
              <span className="text-stone-400 block mb-1">
                Cường độ ánh sáng: {lampIntensity}%
              </span>
              <input
                type="range"
                min="20"
                max="100"
                value={lampIntensity}
                onChange={(e) => setLampIntensity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. CONTAINER BẢNG ĐIỀU TRA CHÍNH THỨC CỦA GAME
          (Dùng 100% component MainInvestigationCanvas và logic của boardgame)
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-none sm:max-w-6xl mx-auto h-full flex-1 min-h-0 flex items-center justify-center relative z-10 overflow-hidden p-0 pb-0 sm:pb-2">
        {/* Bảng điều tra canvas thực tế (tự render nón ánh sáng lọt lòng bên trong bounds) */}
        <div className="relative w-full h-full flex items-center justify-center">
          <MainInvestigationCanvas
            caseId={caseId}
            isBoardGame={true}
            customBgImage={currentBgOption.url}
            onOpenPhoneSimulator={() => setActiveModal("phone")}
            onOpenReinvestigation={() => setActiveModal("reinvestigate")}
            onOpenEpilogue={() => setActiveModal("epilogue")}
            lightConeConfig={{
              enabled: lampOn,
              coneSpread,
              intensity: lampIntensity,
            }}
          />

          {/* Khung 3D PBR chỉ hiển thị khi chọn tùy chọn PBR */}
          {currentBgOption.hasPbrFrame && (
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center p-0">
              <div
                className="relative w-full h-full max-h-full aspect-[896/1200] overflow-hidden"
                style={{
                  WebkitMaskImage: `linear-gradient(black, black), linear-gradient(black, black)`,
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              >
                <Image
                  src="/images/backgrounds/pbr_3d_frame.jpg"
                  alt="Khung gỗ 3D PBR"
                  fill
                  priority
                  className="object-contain pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]"
                  style={{
                    clipPath: `polygon(
                      0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                      14% 12%, 14% 88%, 86% 88%, 86% 12%, 14% 12%
                    )`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

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

export default function BoardStagePage() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full bg-[#0d0a08] flex items-center justify-center text-[#d9a066] font-mono text-xs">
          Đang nạp bàn điều tra...
        </div>
      }
    >
      <BoardStageContent />
    </Suspense>
  );
}
