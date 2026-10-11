"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  HeroInteractive,
  type PinPoint,
} from "@/components/investigation/hero-interactive";
import { getCanonicalSuspectKey } from "@/lib/cases/case-000-suspects";
import { detectiveAudio } from "@/lib/investigation-audio";
import { normalizeImageUrl } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import { setStorageItem, getStorageItem } from "@/lib/storage";
import { useInvestigationEvent } from "@/lib/investigation-events";

import { useBoardLayout } from "./canvas/use-board-layout";
import {
  useInvestigationState,
  ALL_CASE_000_SUSPECTS,
} from "./canvas/use-investigation-state";
import {
  buildCustomPins,
  buildCustomConnections,
  applyLayoutOverrides,
  findFollowupCulprit,
  detectCheckpointForPin,
} from "./canvas/pin-builder";
import { CanvasToolbar } from "./canvas/canvas-toolbar";
import { CanvasModals } from "./canvas/canvas-modals";
import { CanvasPhotoZoom } from "./canvas/canvas-photo-zoom";

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
          const category = (item.category || "").toUpperCase().trim();
          const isAvatar = rawCode.startsWith("avatar_") || category === "AVATAR";

          // 1. Prioritize explicit avatar codes (avatar_<id>)
          if (rawCode === "avatar_vu" || (isAvatar && (code === "vu" || code.includes("lê quang vũ"))))
            map.vu = normUrl;
          if (rawCode === "avatar_tung" || (isAvatar && (code === "tung" || code.includes("nguyễn thanh tùng"))))
            map.tung = normUrl;
          if (rawCode === "avatar_ha" || (isAvatar && (code === "ha" || code.includes("trần thị hà"))))
            map.ha = normUrl;
          if (rawCode === "avatar_mai" || (isAvatar && (code === "mai" || code.includes("nguyễn ngọc mai"))))
            map.mai = normUrl;
          if (rawCode === "avatar_khang" || (isAvatar && (code === "khang" || code.includes("nguyễn văn khang"))))
            map.khang = normUrl;
          if (rawCode === "avatar_dat" || (isAvatar && (code === "dat" || code.includes("trần văn đạt"))))
            map.dat = normUrl;
          if (rawCode === "avatar_lua" || (isAvatar && (code === "lua" || code.includes("nguyễn thị lụa"))))
            map.lua = normUrl;
          if (rawCode === "avatar_vy" || (isAvatar && (code === "vy" || code.includes("thảo vy"))))
            map.vy = normUrl;

          // 2. Crime scene
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

        // Kiểm tra xem câu hỏi mở rộng của đối tượng này đã được giải xong chưa
        const isAlreadySolved =
          state.solvedFollowupQuestions.includes(c) ||
          getStorageItem(`followup_${c}`) === 'solved' ||
          (c === 'ha' && !!getStorageItem('followup_ha_password')) ||
          (c === 'vu' && !!getStorageItem('followup_vu'))

        if (isAlreadySolved) {
          if (c === 'ha') {
            // Hà: Mở modal câu hỏi kèm kích hoạt ngay popup 3 vật chứng hộp thiếc
            state.setIsFollowupQuestionOpen(true);
          } else {
            // Vũ / Tùng: Mở thẳng narrative lời khai sau khi giải xong
            const savedChoice = getStorageItem(`followup_${c}_choice`) || (c === 'vu' ? '21:15' : 'question_solved');
            state.setNarrativeCulprit(c);
            state.setNarrativeChoice(savedChoice);
            state.setIsEpilogueOpen(true);
          }
        } else {
          state.setIsFollowupQuestionOpen(true);
        }
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
      {/* 1. Header Toolbar & Floating Node Toolbar */}
      <CanvasToolbar
        layout={layout}
        state={state}
        isAudioMuted={isAudioMuted}
        onToggleAudio={() => {
          const next = detectiveAudio.toggleMute();
          setIsAudioMuted(next);
        }}
        selectedPin={selectedPin}
        displayPins={displayPins}
        onOpenCreatePinModal={() => {
          setEditingCustomPin(null);
          setIsCreatePinModalOpen(true);
        }}
        onEditSelectedPin={(pin) => {
          setEditingCustomPin(pin);
          setIsCreatePinModalOpen(true);
        }}
      />

      {/* 2. Interactive Pinboard Canvas */}
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

      {/* 3. Modals & Narrative Layers */}
      <CanvasModals
        layout={layout}
        state={state}
        displayPins={displayPins}
        isCreatePinModalOpen={isCreatePinModalOpen}
        setIsCreatePinModalOpen={setIsCreatePinModalOpen}
        editingCustomPin={editingCustomPin}
        setEditingCustomPin={setEditingCustomPin}
        activeCustomPinModal={activeCustomPinModal}
        setActiveCustomPinModal={setActiveCustomPinModal}
        onOpenPhoneSimulator={onOpenPhoneSimulator}
      />

      {/* 4. Zoomed Photo Lightbox Modal */}
      <CanvasPhotoZoom
        zoomedPhotoUrl={zoomedPhotoUrl}
        zoomOrigin={zoomOrigin}
        zoomOpenTimeRef={zoomOpenTimeRef}
        onClose={() => setZoomedPhotoUrl(null)}
      />
    </div>
  );
}
