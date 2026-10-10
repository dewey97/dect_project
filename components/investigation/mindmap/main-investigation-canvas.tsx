"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  Move,
  Plus,
  Save,
  RotateCcw,
  RotateCw,
  Minus,
  Pencil,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeroInteractive,
  type PinPoint,
  type CaseConnection,
} from "@/components/investigation/hero-interactive";
import { AddSuspectModal } from "./add-suspect-modal";
import { PhoneLookupModal } from "./phone-lookup-modal";
import { PhoneNarrativeModal } from "./phone-narrative-modal";
import { DossierEModal } from "./dossier-e-modal";
import { EvidenceGuideModal } from "./evidence-guide-modal";
import { GameplayGuideModal } from "./gameplay-guide-modal";
import { InteractiveWalkthrough } from "./interactive-walkthrough";
import { IndictmentModal } from "./indictment-modal";
import { CulpritEpilogueModal } from "./culprit-epilogue-modal";
import { DossierResultModal } from "./dossier-result-modal";
import { FollowupQuestionModal } from "./followup-question-modal";
import { AdminCreatePinModal } from "./admin-create-pin-modal";
import { CustomPinModal } from "./custom-pin-modal";
import { ReinvestigationModal } from "@/components/investigation/evidence/reinvestigation-modal";
import { PhoneModal } from "@/components/investigation/evidence/phone-modal";
import { EpilogueModal } from "@/components/investigation/epilogue-modal";
import { getCanonicalSuspectKey } from "@/lib/cases/case-000-suspects";
import { detectiveAudio } from "@/lib/investigation-audio";
import { toast } from "@/components/ui/toast";
import { normalizeImageUrl } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import { setStorageItem } from "@/lib/storage";
import { useInvestigationEvent } from "@/lib/investigation-events";

import { useBoardLayout } from "./canvas/use-board-layout";
import {
  useInvestigationState,
  ALL_CASE_000_SUSPECTS,
  type CulpritKey,
} from "./canvas/use-investigation-state";
import {
  buildCustomPins,
  buildCustomConnections,
  applyLayoutOverrides,
  findFollowupCulprit,
  detectCheckpointForPin,
} from "./canvas/pin-builder";

interface MainInvestigationCanvasProps {
  onOpenPhoneSimulator?: () => void;
  onOpenReinvestigation?: () => void;
  onOpenEpilogue?: () => void;
}

export function MainInvestigationCanvas({
  onOpenPhoneSimulator,
  onOpenReinvestigation,
  onOpenEpilogue,
}: MainInvestigationCanvasProps) {
  const router = useRouter();

  const layout = useBoardLayout();
  const state = useInvestigationState({
    onOpenReinvestigation,
    onOpenEpilogue,
  });

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isCreatePinModalOpen, setIsCreatePinModalOpen] = useState(false);
  const [editingCustomPin, setEditingCustomPin] = useState<PinPoint | null>(
    null,
  );
  const [activeCustomPinModal, setActiveCustomPinModal] =
    useState<PinPoint | null>(null);

  const [zoomedPhotoUrl, setZoomedPhotoUrl] = useState<string | null>(null);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number } | null>(
    null,
  );
  const zoomOpenTimeRef = useRef<number>(0);

  useInvestigationEvent("OPEN_GUIDE", () => {
    detectiveAudio.playPaperRustle();
    state.setIsGameplayGuideOpen(true);
  });

  useInvestigationEvent("OPEN_WALKTHROUGH", () => {
    detectiveAudio.playPaperRustle();
    state.setIsWalkthroughOpen(true);
  });

  const handleOpenPhotoZoom = useCallback(
    (url: string, coords?: { clientX: number; clientY: number }) => {
      zoomOpenTimeRef.current = Date.now();
      if (coords && typeof window !== "undefined") {
        setZoomOrigin({
          x: coords.clientX - window.innerWidth / 2,
          y: coords.clientY - window.innerHeight / 2,
        });
      } else {
        setZoomOrigin(null);
      }
      setZoomedPhotoUrl(normalizeImageUrl(url));
    },
    [],
  );

  useEffect(() => {
    if (!zoomedPhotoUrl) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        detectiveAudio.playPaperRustle();
        setZoomedPhotoUrl(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomedPhotoUrl]);

  useEffect(() => {
    const handleGuideShortcut = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      if (
        e.key === "?" ||
        (e.key.toLowerCase() === "h" && !e.ctrlKey && !e.metaKey && !e.altKey)
      ) {
        e.preventDefault();
        detectiveAudio.playPaperRustle();
        state.setIsGameplayGuideOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGuideShortcut);
    return () => window.removeEventListener("keydown", handleGuideShortcut);
  }, [state]);

  // Đồng bộ active checkpoint cho hint context
  useEffect(() => {
    let currentCp: string | null = null;
    if (state.isFollowupQuestionOpen) {
      const c =
        state.activeFollowupCulprit ||
        state.narrativeCulprit ||
        state.solvedCulprit ||
        "vu";
      currentCp =
        c === "vu" ? "cp-000-1a" : c === "tung" ? "cp-000-1b" : "cp-000-1c";
    } else if (state.isPhoneLookupOpen) {
      currentCp = "cp-000-0";
    } else if (state.isIndictmentOpen) {
      currentCp = "cp-000-2b";
    } else if (state.isAddSuspectOpen || state.editingSuspect) {
      const sName = (state.editingSuspect?.name || "").toLowerCase();
      const sId = (state.editingSuspect?.id || "").toLowerCase();
      if (sName.includes("vũ") || sName.includes("vu") || sId === "vu")
        currentCp = "cp-000-1a";
      else if (
        sName.includes("tùng") ||
        sName.includes("tung") ||
        sId === "tung"
      )
        currentCp = "cp-000-1b";
      else if (sName.includes("hà") || sName.includes("ha") || sId === "ha")
        currentCp = "cp-000-1c";
    } else if (activeCustomPinModal) {
      currentCp = detectCheckpointForPin(activeCustomPinModal);
    }

    if (currentCp) {
      if (typeof window !== "undefined") {
        (window as any).__ACTIVE_INVESTIGATION_CHECKPOINT__ = currentCp;
      }
      setStorageItem("active_investigation_checkpoint", currentCp);
      setStorageItem("last_interacted_checkpoint", currentCp);
      if (currentCp === "cp-000-1a")
        setStorageItem("last_viewed_suspect", "vu");
      else if (currentCp === "cp-000-1b")
        setStorageItem("last_viewed_suspect", "tung");
      else if (currentCp === "cp-000-1c")
        setStorageItem("last_viewed_suspect", "ha");
    }
  }, [
    state.isFollowupQuestionOpen,
    state.activeFollowupCulprit,
    state.narrativeCulprit,
    state.solvedCulprit,
    state.isPhoneLookupOpen,
    state.isIndictmentOpen,
    activeCustomPinModal,
    state.isAddSuspectOpen,
    state.editingSuspect,
  ]);

  const { data: sheetPhotos } = usePhoneData("photos");
  const sheetPhotoMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (Array.isArray(sheetPhotos)) {
      sheetPhotos.forEach((item: any) => {
        const rawUrl =
          item.drive_url ||
          item.url ||
          item.photo_url ||
          item.direct_cdn_url ||
          "";
        const normUrl = normalizeImageUrl(rawUrl);
        const code = (
          item.photo_code ||
          item.code ||
          item.title ||
          item.filename ||
          ""
        ).toLowerCase();
        if (normUrl) {
          const rawCode = (item.photo_code || "").toLowerCase().trim();
          if (
            rawCode === "avatar_vu" ||
            code.includes("vu") ||
            code.includes("vũ")
          )
            map.vu = normUrl;
          if (
            rawCode === "avatar_tung" ||
            code.includes("tung") ||
            code.includes("tùng")
          )
            map.tung = normUrl;
          if (
            rawCode === "avatar_ha" ||
            code.includes("ha") ||
            code.includes("hà")
          )
            map.ha = normUrl;
          if (rawCode === "avatar_mai" || code.includes("mai"))
            map.mai = normUrl;
          if (rawCode === "avatar_khang" || code.includes("khang"))
            map.khang = normUrl;
          if (
            rawCode === "avatar_dat" ||
            code.includes("dat") ||
            code.includes("đạt")
          )
            map.dat = normUrl;
          if (
            rawCode === "avatar_lua" ||
            code.includes("lua") ||
            code.includes("lụa")
          )
            map.lua = normUrl;
          if (rawCode === "avatar_vy" || code.includes("vy")) map.vy = normUrl;
          if (
            rawCode === "crime_scene" ||
            rawCode === "chalk_outline" ||
            rawCode === "thi_the" ||
            code.includes("chalk") ||
            code.includes("thi_the") ||
            code.includes("thi thể") ||
            (code.includes("crime") && !code.includes("room")) ||
            (code.includes("hien_truong") &&
              !code.includes("phong_khach") &&
              !code.includes("phòng khách"))
          )
            map.crime_scene = normUrl;
        }
      });
    }
    return map;
  }, [sheetPhotos]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const effectiveSuspects =
    layout.isAdmin && state.isShowAllPinsPreview
      ? ALL_CASE_000_SUSPECTS
      : state.suspects;

  const vuSuspect = effectiveSuspects.find(
    (s) => getCanonicalSuspectKey(s).canonicalId === "vu",
  );
  const tungSuspect = effectiveSuspects.find(
    (s) => getCanonicalSuspectKey(s).canonicalId === "tung",
  );
  const haSuspect = effectiveSuspects.find(
    (s) => getCanonicalSuspectKey(s).canonicalId === "ha",
  );

  const hasVuFollowup =
    state.isShowAllPinsPreview || state.investigatedSuspects.includes("vu");
  const hasTungFollowup =
    state.isShowAllPinsPreview || state.investigatedSuspects.includes("tung");
  const hasHaFollowup =
    state.isShowAllPinsPreview || state.investigatedSuspects.includes("ha");

  const isReinvestigateBlinking =
    state.effectiveReinvestigateUnlocked && !state.hasOpenedReinvestigation;

  const basePins = useMemo(
    () =>
      buildCustomPins({
        isMobile,
        effectiveSuspects,
        sheetPhotoMap,
        hasVuFollowup,
        hasTungFollowup,
        hasHaFollowup,
        effectiveReinvestigateUnlocked: state.effectiveReinvestigateUnlocked,
        effectivePhoneSolved: state.effectivePhoneSolved,
        effectiveIndictmentSolved: state.effectiveIndictmentSolved,
        isReinvestigateBlinking,
      }),
    [
      isMobile,
      effectiveSuspects,
      sheetPhotoMap,
      hasVuFollowup,
      hasTungFollowup,
      hasHaFollowup,
      state.effectiveReinvestigateUnlocked,
      state.effectivePhoneSolved,
      state.effectiveIndictmentSolved,
      isReinvestigateBlinking,
    ],
  );

  const displayPins = useMemo(
    () =>
      applyLayoutOverrides(
        basePins,
        layout.adminCustomPins,
        layout.customPinPositions,
        layout.pinTransforms,
      ),
    [
      basePins,
      layout.adminCustomPins,
      layout.customPinPositions,
      layout.pinTransforms,
    ],
  );

  const selectedPin =
    displayPins.find((p) => p.id === layout.selectedPinId) || null;

  const customConnections = useMemo(
    () =>
      buildCustomConnections({
        effectiveSuspects,
        hasVuFollowup,
        hasTungFollowup,
        hasHaFollowup,
        vuSuspect,
        tungSuspect,
        haSuspect,
        adminConnections: layout.adminConnections,
      }),
    [
      effectiveSuspects,
      hasVuFollowup,
      hasTungFollowup,
      hasHaFollowup,
      vuSuspect,
      tungSuspect,
      haSuspect,
      layout.adminConnections,
    ],
  );

  const handlePinClick = useCallback(
    (
      pinId: string,
      pin?: PinPoint,
      coords?: { clientX: number; clientY: number },
    ) => {
      detectiveAudio.playPaperRustle();
      const id = pinId || pin?.id || "";
      const label = (pin?.label || "").toLowerCase();
      const detail = (pin?.detail || "").toLowerCase();

      const clickedCp = detectCheckpointForPin(pin);
      if (clickedCp) {
        if (typeof window !== "undefined") {
          (window as any).__ACTIVE_INVESTIGATION_CHECKPOINT__ = clickedCp;
        }
        setStorageItem("active_investigation_checkpoint", clickedCp);
        setStorageItem("last_interacted_checkpoint", clickedCp);
        if (clickedCp === "cp-000-1a")
          setStorageItem("last_viewed_suspect", "vu");
        else if (clickedCp === "cp-000-1b")
          setStorageItem("last_viewed_suspect", "tung");
        else if (clickedCp === "cp-000-1c")
          setStorageItem("last_viewed_suspect", "ha");
      }

      if (layout.isEditMode) {
        layout.setSelectedPinId(id);
        if (coords) {
          const rect = layout.canvasWrapperRef.current?.getBoundingClientRect();
          layout.setSelectionAnchor(
            rect
              ? { x: coords.clientX - rect.left, y: coords.clientY - rect.top }
              : null,
          );
        }
        return;
      }

      if (id.startsWith("admin-pin-") || id.startsWith("custom-pin-")) {
        const targetPin =
          pin || layout.adminCustomPins.find((p) => p.id === id) || null;
        if (!targetPin) return;

        if (targetPin.actionType === "custom_question") {
          setActiveCustomPinModal(targetPin);
          return;
        }
        if (targetPin.photoUrl && targetPin.actionType !== "sheet_checkpoint") {
          handleOpenPhotoZoom(targetPin.photoUrl, coords);
          return;
        }
        setActiveCustomPinModal(targetPin);
        return;
      }

      if (id === "c0-pin-suspects" || id === "c0-pin-question") {
        state.setEditingSuspect(null);
        state.setIsAddSuspectOpen(true);
      } else if (id === "c0-pin-evidence") {
        state.setIsEvidenceGuideOpen(true);
      } else if (
        id === "c0-pin-victim-phone" ||
        id === "victim-phone" ||
        (pin?.photoUrl && pin.photoUrl.includes("phone"))
      ) {
        detectiveAudio.playPaperRustle();
        if (onOpenPhoneSimulator) onOpenPhoneSimulator();
        else state.setIsInternalPhoneOpen(true);
      } else if (id === "c0-pin-phone") {
        if (state.phoneLookupSuccess) state.setIsDossierEOpen(true);
        else state.setIsPhoneLookupOpen(true);
      } else if (
        id === "c0-pin-crime-scene" ||
        id.includes("crime-scene") ||
        id.includes("thi-the")
      ) {
        handleOpenPhotoZoom(
          sheetPhotoMap.crime_scene ||
            "/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_v2.png",
          coords,
        );
      } else if (id === "c0-pin-victim-khang" || id === "khang") {
        handleOpenPhotoZoom(
          sheetPhotoMap.khang ||
            "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png",
          coords,
        );
      } else if (id === "c0-pin-reinvestigate") {
        if (state.isReinvestigateUnlocked) {
          detectiveAudio.playGlassSound();
          state.handleOpenReinvestigation();
        } else {
          detectiveAudio.playGlassSound();
        }
      } else if (id === "c0-pin-indictment") {
        if (state.isIndictmentSolved) {
          state.setIsFinalEpilogueOpen(true);
          if (onOpenEpilogue) onOpenEpilogue();
        } else {
          state.setIsIndictmentOpen(true);
        }
      } else if (
        id.startsWith("c0-pin-followup") ||
        id.startsWith("followup-") ||
        id.startsWith("c0-pin-question") ||
        label.includes("nghi vấn")
      ) {
        const c = findFollowupCulprit(id, detail);
        state.setActiveFollowupCulprit(c);
        state.setIsFollowupQuestionOpen(true);
      } else if (id.startsWith("node-suspect-") || id.startsWith("suspect-")) {
        const targetId = id
          .replace("node-suspect-", "")
          .replace("suspect-", "");
        if (
          targetId === "suspect-khang" ||
          targetId === "khang" ||
          id.includes("khang")
        ) {
          handleOpenPhotoZoom(
            sheetPhotoMap.khang ||
              "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png",
            coords,
          );
          return;
        }
        const foundSuspect = state.suspects.find((s) => {
          const key = getCanonicalSuspectKey(s);
          return (
            s.id === targetId ||
            key.canonicalId === targetId ||
            s.id === `node-suspect-${targetId}`
          );
        });
        if (foundSuspect) {
          state.setEditingSuspect(foundSuspect);
          state.setIsAddSuspectOpen(true);
        }
      }
    },
    [
      layout,
      state,
      handleOpenPhotoZoom,
      onOpenPhoneSimulator,
      onOpenEpilogue,
      sheetPhotoMap,
    ],
  );

  return (
    <div
      ref={layout.canvasWrapperRef}
      suppressHydrationWarning
      className={`relative w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center select-none transition-all duration-300 ${
        layout.isEditMode
          ? "ring-4 ring-amber-500/80 ring-inset shadow-[inset_0_0_90px_rgba(245,158,11,0.22)]"
          : ""
      }`}
    >
      <div
        className="absolute left-4 z-20 flex items-center gap-2 pointer-events-none"
        style={{ top: "max(12px, env(safe-area-inset-top, 12px))" }}
      >
        <div className="flex items-center gap-2 bg-[#1b140e]/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#593c26]/60 text-xs text-[#d9a066] font-mono shadow-lg pointer-events-auto">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold tracking-wide">BẢNG ĐIỀU TRA</span>
        </div>

        <button
          type="button"
          onClick={() => {
            const next = detectiveAudio.toggleMute();
            setIsAudioMuted(next);
          }}
          className="p-1.5 bg-[#1b140e]/85 hover:bg-[#342417] backdrop-blur-md border border-[#593c26]/60 text-[#d9a066] transition-colors cursor-pointer rounded-lg shadow-lg pointer-events-auto flex items-center justify-center"
          title={
            isAudioMuted ? "Bật âm thanh trinh thám" : "Tắt âm thanh trinh thám"
          }
        >
          {isAudioMuted ? (
            <VolumeX className="size-4 text-amber-500/60" />
          ) : (
            <Volume2 className="size-4 text-amber-400" />
          )}
        </button>

        {layout.isAdmin && (
          <div className="flex items-center gap-1.5 bg-[#141419]/90 backdrop-blur-md p-1 rounded-lg border border-amber-500/40 text-xs shadow-xl pointer-events-auto">
            <button
              onClick={() => {
                detectiveAudio.playTypewriterClick();
                layout.setIsEditMode((prev) => {
                  const next = !prev;
                  if (!next) layout.setSelectedPinId(null);
                  return next;
                });
              }}
              className={`p-1.5 rounded-lg border transition-all ${
                layout.isEditMode
                  ? "bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.55)] ring-1 ring-amber-400/60"
                  : "bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
              title={
                layout.isEditMode
                  ? "Thoát chế độ di chuyển & setup"
                  : "Bật chế độ di chuyển & setup node"
              }
            >
              <Move className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                detectiveAudio.playTypewriterClick();
                state.setIsShowAllPinsPreview((prev) => {
                  const next = !prev;
                  toast.info(
                    next
                      ? "Đã hiển thị toàn bộ node vụ án (Preview Setup)"
                      : "Đã trở về chế độ hiển thị theo tiến trình cốt truyện",
                  );
                  return next;
                });
              }}
              className={`p-1.5 rounded-lg border transition-all ${
                state.isShowAllPinsPreview
                  ? "bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.55)] ring-1 ring-amber-400/60"
                  : "bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
              title={
                state.isShowAllPinsPreview
                  ? "Tắt hiển thị tất cả node (về theo cốt truyện)"
                  : "Hiển thị tất cả node ghim (phục vụ căn chỉnh setup)"
              }
            >
              {state.isShowAllPinsPreview ? (
                <EyeOff className="size-4 text-amber-300" />
              ) : (
                <Eye className="size-4 text-zinc-400 hover:text-zinc-200" />
              )}
            </button>

            {layout.isEditMode && (
              <>
                <button
                  onClick={() => {
                    detectiveAudio.playTypewriterClick();
                    setEditingCustomPin(null);
                    setIsCreatePinModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors shadow-sm"
                  title="Thêm ghi chú dính, giấy trắng A4 hoặc ảnh Polaroid"
                >
                  <Plus className="size-4" />
                </button>

                <button
                  disabled={layout.isSavingLayout}
                  onClick={() => layout.handleSavePinLayout(displayPins)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    layout.hasUnsavedChanges
                      ? "bg-emerald-600/80 border-emerald-400 text-white hover:bg-emerald-500 shadow-sm animate-pulse"
                      : "bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                  title={
                    layout.isSavingLayout
                      ? "Đang lưu vị trí..."
                      : "Lưu vị trí ghim"
                  }
                >
                  <Save className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={layout.handleForceResetLayout}
                  className="p-1.5 rounded-lg border border-white/10 bg-black/40 text-zinc-400 hover:text-amber-300 hover:border-amber-400/40 hover:bg-zinc-800 transition-colors"
                  title="Ép cập nhật & Khôi phục layout mới nhất từ hệ thống (Xóa cache cục bộ)"
                >
                  <RefreshCw className="size-4" />
                </button>

                {layout.hasUnsavedChanges && (
                  <button
                    onClick={() => {
                      detectiveAudio.playPaperRustle();
                      layout.setCustomPinPositions({});
                      layout.setHasUnsavedChanges(false);
                    }}
                    className="p-1.5 rounded-lg border border-red-500/30 bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-red-200 transition-colors"
                    title="Hoàn tác (hủy các vị trí vừa kéo thả chưa lưu)"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {layout.isEditMode && selectedPin && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 p-0.5 bg-[#1b140e]/95 backdrop-blur-md rounded-lg border border-amber-500/60 shadow-[0_12px_40px_rgba(0,0,0,0.85)] font-mono text-xs select-none pointer-events-auto"
            style={{
              top: "calc(max(12px, env(safe-area-inset-top, 12px)) + 44px)",
            }}
          >
            <button
              type="button"
              onClick={() =>
                layout.handleAdjustNodeTransform(selectedPin.id, -1, 0)
              }
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Xoay nghiêng trái (-1°)"
            >
              <RotateCcw className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                layout.handleAdjustNodeTransform(selectedPin.id, 1, 0)
              }
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Xoay nghiêng phải (+1°)"
            >
              <RotateCw className="size-3.5" />
            </button>

            <div className="h-3.5 w-px bg-white/15" />

            <button
              type="button"
              onClick={() =>
                layout.handleAdjustNodeTransform(selectedPin.id, 0, -0.1)
              }
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Thu nhỏ kích thước"
            >
              <Minus className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                layout.handleAdjustNodeTransform(selectedPin.id, 0, 0.1)
              }
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Phóng to kích thước"
            >
              <Plus className="size-3.5" />
            </button>

            <div className="h-3.5 w-px bg-white/15" />

            <button
              type="button"
              onClick={() => {
                detectiveAudio.playTypewriterClick();
                setEditingCustomPin(selectedPin);
                setIsCreatePinModalOpen(true);
              }}
              className="p-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 transition-colors"
              title="Chỉnh sửa chi tiết nội dung node"
            >
              <Pencil className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <HeroInteractive
        className="w-full h-full flex-1 min-h-0"
        controlledCaseId="case-000"
        customPins={displayPins}
        customConnections={customConnections}
        selectedPinId={layout.selectedPinId}
        onSelectPin={layout.setSelectedPinId}
        onConnectPins={layout.handleConnectPins}
        onDeleteConnection={layout.handleDeleteConnection}
        onPinClick={handlePinClick}
        isEditMode={layout.isEditMode}
        onPinPositionChange={layout.handlePinPositionChange}
      />

      <AddSuspectModal
        key={
          state.isAddSuspectOpen
            ? state.editingSuspect
              ? `suspect-${state.editingSuspect.id}`
              : "new-suspect-form"
            : "suspect-modal-closed"
        }
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

      <PhoneLookupModal
        isOpen={state.isPhoneLookupOpen}
        onClose={() => state.setIsPhoneLookupOpen(false)}
        onSuccess={state.handlePhoneLookupSuccess}
        onOpenPhoneSimulator={
          onOpenPhoneSimulator || (() => state.setIsInternalPhoneOpen(true))
        }
      />

      <PhoneNarrativeModal
        isOpen={state.isPhoneNarrativeOpen}
        onClose={() => state.setIsPhoneNarrativeOpen(false)}
        onTakeTestimony={() => state.setIsDossierEOpen(true)}
      />

      <PhoneModal
        isOpen={state.isInternalPhoneOpen}
        onClose={() => state.setIsInternalPhoneOpen(false)}
      />

      <DossierEModal
        isOpen={state.isDossierEOpen}
        onClose={() => state.setIsDossierEOpen(false)}
      />

      <EvidenceGuideModal
        isOpen={state.isEvidenceGuideOpen}
        onClose={() => state.setIsEvidenceGuideOpen(false)}
        isPhoneSolved={state.phoneLookupSuccess}
        isReinvestigateUnlocked={state.isReinvestigateUnlocked}
      />

      <ReinvestigationModal
        isOpen={state.isReinvestigateModalOpen}
        onClose={() => state.setIsReinvestigateModalOpen(false)}
      />

      <IndictmentModal
        isOpen={state.isIndictmentOpen}
        onClose={() => state.setIsIndictmentOpen(false)}
        onSubmitIndictment={state.handleSubmitIndictment}
        isPhoneSolved={state.phoneLookupSuccess}
      />

      <CulpritEpilogueModal
        isOpen={state.isEpilogueOpen}
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
            "vu";
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

      <DossierResultModal
        isOpen={state.isDossierOpen}
        dossierType={state.activeDossierType}
        onClose={() => state.setIsDossierOpen(false)}
        onOpenFollowupQuestion={() => {
          state.setIsDossierOpen(false);
          const c =
            state.activeDossierType === "A"
              ? "vu"
              : state.activeDossierType === "B"
                ? "tung"
                : "ha";
          state.setActiveFollowupCulprit(c);
          state.setIsFollowupQuestionOpen(true);
        }}
      />

      <FollowupQuestionModal
        key={
          state.isFollowupQuestionOpen
            ? `followup-${state.activeFollowupCulprit || state.narrativeCulprit || state.solvedCulprit || "vu"}`
            : "followup-modal-closed"
        }
        isOpen={state.isFollowupQuestionOpen}
        culprit={
          state.activeFollowupCulprit ||
          state.narrativeCulprit ||
          state.solvedCulprit ||
          "vu"
        }
        onClose={() => {
          state.setIsFollowupQuestionOpen(false);
          state.setActiveFollowupCulprit(null);
        }}
        onSuccess={state.handleFollowupSuccess}
        onOpenDossier={state.handleOpenDossier}
        isPhoneSolved={state.phoneLookupSuccess}
      />

      <EpilogueModal
        isOpen={state.isFinalEpilogueOpen}
        onClose={() => state.setIsFinalEpilogueOpen(false)}
      />

      <AdminCreatePinModal
        isOpen={isCreatePinModalOpen}
        onClose={() => {
          setIsCreatePinModalOpen(false);
          setEditingCustomPin(null);
        }}
        onSavePin={layout.handleSaveAdminPin}
        onDeletePin={layout.handleDeleteAdminPin}
        initialPin={editingCustomPin}
      />

      <CustomPinModal
        isOpen={activeCustomPinModal !== null}
        onClose={() => setActiveCustomPinModal(null)}
        pin={activeCustomPinModal}
        onSolve={(_pinId) => {
          toast.success("Đã hoàn thành câu hỏi ghim!");
        }}
      />

      <GameplayGuideModal
        isOpen={state.isGameplayGuideOpen}
        onClose={() => state.setIsGameplayGuideOpen(false)}
        onStartWalkthrough={() => {
          state.setIsGameplayGuideOpen(false);
          state.setIsWalkthroughOpen(true);
        }}
      />

      <InteractiveWalkthrough
        isOpen={state.isWalkthroughOpen}
        onClose={() => {
          state.setIsWalkthroughOpen(false);
          layout.setSelectedPinId(null);
        }}
        pins={displayPins}
        canvasWrapperRef={layout.canvasWrapperRef}
        onStepChange={(targetPinId) => {
          layout.setSelectedPinId(targetPinId);
        }}
      />

      <AnimatePresence>
        {zoomedPhotoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => {
              e.stopPropagation();
              if (Date.now() - zoomOpenTimeRef.current < 120) return;
              detectiveAudio.playPaperRustle();
              setZoomedPhotoUrl(null);
            }}
            className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-pointer select-none"
          >
            <motion.div
              initial={{
                scale: 0.2,
                opacity: 0.2,
                x: zoomOrigin?.x ?? 0,
                y: zoomOrigin?.y ?? 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                x: 0,
                y: 0,
              }}
              exit={{
                scale: 0.2,
                opacity: 0,
                x: zoomOrigin?.x ?? 0,
                y: zoomOrigin?.y ?? 0,
              }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 320,
                mass: 0.8,
              }}
              className="relative max-w-[92vw] max-h-[90vh] flex items-center justify-center"
            >
              <img
                src={zoomedPhotoUrl}
                alt="Ảnh tư liệu phóng to"
                className="max-h-[85vh] max-w-[85vw] object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] pointer-events-none select-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
