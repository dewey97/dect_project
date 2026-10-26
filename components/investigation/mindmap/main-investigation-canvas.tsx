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
import { getCanonicalSuspectKey } from "@/lib/cases/characters";
import { detectiveAudio } from "@/lib/investigation-audio";
import { normalizeImageUrl } from "@/lib/utils";
import { useCaseEvidence } from "@/lib/hooks/use-case-evidence";
import { useOptionalCaseCharacters } from "@/components/investigation/case-characters-context";
import { setStorageItem, getStorageItem } from "@/lib/storage";
import { useInvestigationEvent } from "@/lib/investigation-events";

import { useBoardLayout } from "./canvas/use-board-layout";
import {
  useInvestigationState,
  type SuspectItem,
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
import { caseStorageKey } from "@/lib/cases/case-id";

interface MainInvestigationCanvasProps {
  caseId?: string;
  onOpenPhoneSimulator?: () => void;
  onOpenReinvestigation?: () => void;
  onOpenEpilogue?: () => void;
  /** Mở sổ tay ghi chép; nút nằm cạnh nút âm lượng trên toolbar. */
  onOpenNotebook?: () => void;
  customBgImage?: string;
  lightConeConfig?: {
    enabled: boolean;
    coneSpread: number;
    intensity: number;
  };
  hideTitleBadgeOnMobile?: boolean;
  hideTitleBadge?: boolean;
  hideGroupPlay?: boolean;
  hideAudio?: boolean;
  hideNotebook?: boolean;
  isBoardGame?: boolean;
}

export function MainInvestigationCanvas({
  caseId = "case_000",
  onOpenPhoneSimulator,
  onOpenReinvestigation,
  onOpenEpilogue,
  onOpenNotebook,
  customBgImage,
  lightConeConfig,
  hideTitleBadgeOnMobile = false,
  hideTitleBadge = false,
  hideGroupPlay = false,
  hideAudio = false,
  hideNotebook = false,
  isBoardGame,
}: MainInvestigationCanvasProps) {
  const isBoardGameMode =
    isBoardGame !== undefined
      ? isBoardGame
      : typeof window !== "undefined" &&
        getStorageItem("play_experience") === "boardgame";

  const layout = useBoardLayout(caseId);
  const state = useInvestigationState({
    caseId,
    onOpenReinvestigation,
    onOpenEpilogue,
  });

  const charactersValue = useOptionalCaseCharacters();
  const characters = charactersValue?.characters || [];

  const [isAudioMuted, setIsAudioMuted] = useState(false);
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
    let viewedSuspectKey: string | null = null;

    if (state.isFollowupQuestionOpen) {
      const c =
        state.activeFollowupCulprit ||
        state.narrativeCulprit ||
        state.solvedCulprit ||
        "";
      viewedSuspectKey = c;
      const matched = state.checkpoints?.find(
        (cp) =>
          (cp.kind === "followup" || (cp as any).type === "followup") &&
          (((cp as any).subject_key || cp.subjectKey || "")
            .toLowerCase() === c.toLowerCase()),
      );
      currentCp = matched ? matched.id : null;
    } else if (state.isPhoneLookupOpen) {
      const matched = state.checkpoints?.find(
        (cp) => cp.kind === "phone_lookup" || (cp as any).type === "phone_lookup",
      );
      currentCp = matched ? matched.id : null;
    } else if (state.isIndictmentOpen) {
      const matched = state.checkpoints?.find(
        (cp) => cp.kind === "indictment" || (cp as any).type === "indictment",
      );
      currentCp = matched ? matched.id : null;
    } else if (state.isAddSuspectOpen || state.editingSuspect) {
      const sName = (state.editingSuspect?.name || "").toLowerCase().trim();
      const sId = (state.editingSuspect?.id || "").toLowerCase().trim();
      viewedSuspectKey = sId || sName;
      const matched = state.checkpoints?.find(
        (cp) =>
          (cp.kind === "suspect_interrogation" ||
            cp.kind === "suspect" ||
            (cp as any).type === "suspect_interrogation") &&
          (((cp as any).subject_key || cp.subjectKey || "")
            .toLowerCase() === sId ||
           ((cp as any).subject_key || cp.subjectKey || "")
            .toLowerCase() === sName),
      );
      currentCp = matched ? matched.id : null;
    } else if (activeCustomPinModal) {
      currentCp = detectCheckpointForPin(activeCustomPinModal);
    }

    if (currentCp) {
      if (typeof window !== "undefined") {
        (window as any).__ACTIVE_INVESTIGATION_CHECKPOINT__ = currentCp;
      }
      setStorageItem("active_investigation_checkpoint", currentCp);
      setStorageItem("last_interacted_checkpoint", currentCp);
    }
    if (viewedSuspectKey) {
      setStorageItem("last_viewed_suspect", viewedSuspectKey);
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
    state.checkpoints,
  ]);

  const normalizedSheetCaseId = useMemo(
    () => caseId.replace(/-/g, "_"),
    [caseId],
  );
  const { rawEvidence: sheetEvidences, loading: isEvidenceLoading } =
    useCaseEvidence(caseId);

  const victimChar = useMemo(() => {
    return characters.find((c) => c.role === "victim");
  }, [characters]);

  const victimItem = useMemo(() => {
    if (!Array.isArray(sheetEvidences)) return null;
    return sheetEvidences.find((item: any) => {
      const code = String(item.code || item.photo_code || "")
        .toLowerCase()
        .trim();
      const cat = String(item.category || "")
        .toUpperCase()
        .trim();
      const label = String(item.label || item.title || "")
        .toLowerCase()
        .trim();
      return (
        item.role === "victim" || item.metadata?.role === "victim" ||
        cat === "VICTIM" ||
        label.includes("nạn nhân")
      );
    });
  }, [sheetEvidences]);

  const victimName = useMemo(() => {
    if (victimChar?.name) return victimChar.name;
    if (victimItem) {
      const label = String(
        (victimItem as any).label || victimItem.title || "",
      ).trim();
      const clean = label
        .replace(/^(Ảnh chân dung|Ảnh thẻ|Ảnh|Chân dung|Nạn nhân)\s+/i, "")
        .replace(/\s*\([^)]*\)/g, "")
        .trim();
      if (clean) return clean;
    }
    return "Nạn nhân";
  }, [victimChar, victimItem]);
  const sheetPhotoMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (Array.isArray(sheetEvidences)) {
      sheetEvidences.forEach((item: any) => {
        const rawUrl =
          item.drive_url ||
          item.direct_cdn_url ||
          item.url ||
          item.photo_url ||
          "";
        if (!rawUrl) return;
        const normUrl = normalizeImageUrl(rawUrl);
        const rawCode = String(item.code || item.photo_code || "")
          .toLowerCase()
          .trim();
        const rawLabel = String(item.label || item.title || "")
          .toLowerCase()
          .trim();
        const category = String(item.category || "")
          .toUpperCase()
          .trim();
        const isAvatar =
          rawCode.startsWith("avatar_") ||
          category === "AVATAR" ||
          rawLabel.includes("chân dung");

        // 1. Suspect / Character avatars
        if (rawCode.startsWith("avatar_")) {
          const charKey = rawCode.replace(/^avatar_/, "");
          map[charKey] = normUrl;
        } else if (isAvatar && rawCode) {
          map[rawCode] = normUrl;
        }
        if (
          rawCode === "avatar_victim" || (isAvatar && (item.role === "victim" || rawLabel.includes("nạn nhân")))
        )
          map.victim = normUrl;
        if (
          rawCode === "avatar_dat" ||
          (isAvatar && (rawCode === "dat" || rawLabel.includes("đạt")))
        )
          map.dat = normUrl;
        if (
          rawCode === "avatar_lua" ||
          (isAvatar && (rawCode === "lua" || rawLabel.includes("lụa")))
        )
          map.lua = normUrl;
        if (
          rawCode === "avatar_vy" ||
          (isAvatar && (rawCode === "vy" || rawLabel.includes("vy")))
        )
          map.vy = normUrl;

        // 2. Crime scene
        if (
          rawCode === "crime_scene" ||
          rawCode === "chalk_outline" ||
          rawCode === "thi_the" ||
          rawCode === "a-06" ||
          rawCode.includes("chalk") ||
          rawLabel.includes("thi thể") ||
          (rawLabel.includes("hiện trường") &&
            !rawLabel.includes("phòng khách"))
        ) {
          map.crime_scene = normUrl;
        }

        // Direct code mapping
        if (rawCode) {
          map[rawCode] = normUrl;
          if (rawCode.startsWith("avatar_")) {
            map[rawCode.replace("avatar_", "")] = normUrl;
          }
        }
      });
    }
    return map;
  }, [sheetEvidences]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const parseSuspectFlag = useCallback((item: any): boolean => {
    if (!item) return false;
    const meta = (item.metadata as Record<string, unknown>) || {};
    const suspectVal = String(
      item.is_suspect ??
        meta.is_suspect ??
        item["is suspect"] ??
        meta["is suspect"] ??
        item.suspect ??
        item.nghi_pham ??
        "",
    )
      .toUpperCase()
      .trim();
    const cat = String(item.category || meta.category || "")
      .toUpperCase()
      .trim();
    return (
      suspectVal === "TRUE" ||
      suspectVal === "1" ||
      suspectVal === "YES" ||
      cat === "SUSPECT"
    );
  }, []);

  const parsePinOnBoardFlag = useCallback((item: any): boolean => {
    if (!item) return false;
    const meta = (item.metadata as Record<string, unknown>) || {};
    const pinVal = String(
      item.pin_on_board ??
        meta.pin_on_board ??
        item["pin on board"] ??
        meta["pin on board"] ??
        item.pin ??
        item.ghim ??
        item.ghim_len_bang ??
        item["ghim len bang"] ??
        "",
    )
      .toUpperCase()
      .trim();
    return pinVal === "TRUE" || pinVal === "1" || pinVal === "YES";
  }, []);

  const effectiveSuspects = useMemo(() => {
    const list: SuspectItem[] = [];
    const seen = new Set<string>();

    const hasExplicitSuspectOnSheet =
      Array.isArray(sheetEvidences) && sheetEvidences.some(parseSuspectFlag);

    if (Array.isArray(sheetEvidences) && sheetEvidences.length > 0) {
      sheetEvidences.forEach((item: any) => {
        const isPinned = parsePinOnBoardFlag(item);
        const isExplicit = parseSuspectFlag(item);
        const code = String(item.code || item.photo_code || "")
          .toLowerCase()
          .trim();

        // Nếu trên Sheet có đánh dấu tường minh is_suspect: TRUE hoặc category: SUSPECT thì ưu tiên 100%
        // Nếu Sheet chưa cấu hình cột is_suspect (tất cả đều trống), giữ fallback cho 3 nhân vật kinh điển của Case #000
        const isSuspect = hasExplicitSuspectOnSheet
          ? isExplicit
          : isExplicit ||
            (isPinned &&
              (code === "avatar_vu" ||
                code === "avatar_tung" ||
                code === "avatar_ha"));

        if (!isSuspect || item.role === "victim" || item.metadata?.role === "victim") return;

        const charId = code.replace(/^avatar_/, "");
        const label = String(item.label || item.title || "").trim();
        const cleanName =
          label
            .replace(
              /^(Ảnh chân dung|Ảnh thẻ|Ảnh|Chân dung|Nạn nhân|Nghi phạm|Nhân chứng)\s+/i,
              "",
            )
            .replace(/\s*\([^)]*\)/g, "")
            .trim() || charId;

        // Bảo lưu tiến trình điều tra manh mối từ local state nếu có
        const saved = state.suspects.find(
          (s) =>
            s.id === charId ||
            s.id === `suspect-${charId}` ||
            s.name.toLowerCase() === cleanName.toLowerCase(),
        );

        if (!seen.has(charId)) {
          seen.add(charId);
          list.push({
            id: `suspect-${charId}`,
            name: cleanName,
            clueIds: saved?.clueIds || [],
            motiveClueIds: saved?.motiveClueIds,
            alibiClueIds: saved?.alibiClueIds,
            contradictionClueIds: saved?.contradictionClueIds,
          });
        }
      });
    }

    // Nếu không có sheetEvidences (case Studio/Multi-case), nạp danh sách nghi phạm từ characters DB
    if (list.length === 0 && Array.isArray(characters) && characters.length > 0) {
      characters.forEach((char) => {
        if (char.role === "victim") return;
        const charId = char.key;
        if (!seen.has(charId)) {
          seen.add(charId);
          const saved = state.suspects.find(
            (s) =>
              s.id === charId ||
              s.id === `suspect-${charId}` ||
              s.name.toLowerCase() === char.name.toLowerCase(),
          );
          list.push({
            id: `suspect-${charId}`,
            name: char.name,
            clueIds: saved?.clueIds || [],
            motiveClueIds: saved?.motiveClueIds,
            alibiClueIds: saved?.alibiClueIds,
            contradictionClueIds: saved?.contradictionClueIds,
          });
        }
      });
    }

    // Nếu đã nạp từ Sheet hoặc Characters DB thì ưu tiên
    if (list.length > 0) {
      return list;
    }

    // Fallback tạm thời nếu Sheet đang load và local state đã có sẵn
    return state.suspects;
  }, [state.suspects, sheetEvidences, characters]);

  // Suspects list for connections and pins

  // Tập hợp toàn bộ culprit IDs có câu hỏi mở rộng
  const followupCulpritIds = useMemo(() => {
    return state.investigatedSuspects.map((c) => String(c));
  }, [state.investigatedSuspects]);



  const isReinvestigateBlinking =
    state.effectiveReinvestigateUnlocked && !state.hasOpenedReinvestigation;

  const sheetPinnedItems = useMemo(() => {
    if (!Array.isArray(sheetEvidences)) return [];
    const suspectIdSet = new Set(
      effectiveSuspects.map((s) =>
        getCanonicalSuspectKey(s).canonicalId.toLowerCase(),
      ),
    );

    return sheetEvidences.filter((item: any) => {
      const isPinned = parsePinOnBoardFlag(item);
      if (!isPinned) return false;

      const code = String(item.code || item.photo_code || "")
        .toLowerCase()
        .trim();
      const charId = code.replace(/^avatar_/, "");

      // NẾU ĐÃ LÀ NGHI PHẠM trong effectiveSuspects THÌ LOẠI TRỪ NGAY LẬP TỨC
      // (Bởi vì nghi phạm đã được sinh ghim node-suspect-* với chỉ đỏ nối từ note 'Nghi phạm')
      if (suspectIdSet.has(charId) || suspectIdSet.has(code)) {
        return false;
      }

      if (parseSuspectFlag(item)) {
        return false;
      }

      return true;
    });
  }, [
    sheetEvidences,
    effectiveSuspects,
    parsePinOnBoardFlag,
    parseSuspectFlag,
  ]);

  const basePins = useMemo(
    () =>
      buildCustomPins({
        isMobile,
        boardNodes: layout.boardNodes,
        effectiveSuspects,
        characters,
        sheetPhotoMap,
        sheetPinnedItems,
        followupCulpritIds,
        effectiveReinvestigateUnlocked: state.effectiveReinvestigateUnlocked,
        effectivePhoneSolved: state.effectivePhoneSolved,
        effectiveIndictmentSolved: state.effectiveIndictmentSolved,
        isReinvestigateBlinking,
        caseCheckpoints: state.checkpoints,
        victimName,
        caseId,
      }),
    [
      isMobile,
      layout.boardNodes,
      effectiveSuspects,
      characters,
      sheetPhotoMap,
      sheetPinnedItems,
      followupCulpritIds,
      state.effectiveReinvestigateUnlocked,
      state.effectivePhoneSolved,
      state.effectiveIndictmentSolved,
      isReinvestigateBlinking,
      state.checkpoints,
      victimName,
      caseId,
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
        followupCulpritIds,
        activePins: displayPins,
        adminConnections: layout.adminConnections,
      }),
    [
      effectiveSuspects,
      followupCulpritIds,
      displayPins,
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
      }
      if (pin?.subjectKey) {
        setStorageItem("last_viewed_suspect", pin.subjectKey);
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

      const nodeKind = pin?.nodeKind;

      switch (nodeKind) {
        case "suspects_hub": {
          detectiveAudio.playPaperRustle();
          return;
        }
        case "evidence_hub": {
          state.setIsEvidenceGuideOpen(true);
          return;
        }
        case "victim_phone": {
          detectiveAudio.playPaperRustle();
          if (onOpenPhoneSimulator) onOpenPhoneSimulator();
          else state.setIsInternalPhoneOpen(true);
          return;
        }
        case "reinvestigate": {
          if (state.effectiveReinvestigateUnlocked) {
            detectiveAudio.playGlassSound();
            if (onOpenReinvestigation) onOpenReinvestigation();
            else state.handleOpenReinvestigation();
          } else {
            detectiveAudio.playGlassSound();
          }
          return;
        }
        case "phone_lookup": {
          if (state.phoneLookupSuccess) state.setIsDossierEOpen(true);
          else state.setIsPhoneLookupOpen(true);
          return;
        }
        case "indictment": {
          if (state.isIndictmentSolved) {
            state.setIsFinalEpilogueOpen(true);
            if (onOpenEpilogue) onOpenEpilogue();
          } else {
            state.setIsIndictmentOpen(true);
          }
          return;
        }
        case "suspect": {
          const subjectKey = pin?.subjectKey;
          const charName = (pin?.label || "")
            .replace(
              /^(Ảnh chân dung|Ảnh thẻ|Ảnh|Chân dung|Nạn nhân|Nghi phạm|Nhân chứng)\s+/i,
              "",
            )
            .replace(/\s*\([^)]*\)/g, "")
            .trim();
          const existing = state.suspects.find(
            (s) =>
              (subjectKey && s.id === subjectKey) ||
              s.id === id ||
              s.name.toLowerCase() === charName.toLowerCase(),
          );
          if (subjectKey) {
            setStorageItem("last_viewed_suspect", subjectKey);
          }
          state.setEditingSuspect(
            existing || {
              id: subjectKey || id,
              name: charName || pin?.label || "Nghi phạm",
              clueIds: [],
            },
          );
          state.setIsAddSuspectOpen(true);
          return;
        }
        case "followup": {
          const c = pin?.subjectKey || findFollowupCulprit(id, detail);
          state.setActiveFollowupCulprit(c);
          if (c) {
            setStorageItem("last_viewed_suspect", c);
          }
          const isAlreadySolved =
            state.solvedFollowupQuestions.includes(c) ||
            Boolean(getStorageItem(caseStorageKey(caseId, `followup_${c}`)));

          if (isAlreadySolved) {
            const savedChoice = getStorageItem(caseStorageKey(caseId, `followup_${c}_choice`));
            if (savedChoice) {
              state.setNarrativeChoice(savedChoice);
              state.setNarrativeCulprit(c);
              state.setIsEpilogueOpen(true);
            } else {
              state.setIsFollowupQuestionOpen(true);
            }
          } else {
            state.setIsFollowupQuestionOpen(true);
          }
          return;
        }
        case "photo":
        case "victim": {
          if (pin?.photoUrl) {
            handleOpenPhotoZoom(pin.photoUrl, coords);
          }
          return;
        }
        case "note": {
          detectiveAudio.playPaperRustle();
          return;
        }
        case "custom": {
          if (pin?.photoUrl && pin.actionType !== "sheet_checkpoint") {
            handleOpenPhotoZoom(pin.photoUrl, coords);
          } else {
            setActiveCustomPinModal(pin || null);
          }
          return;
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

  const isBoardReady = Boolean(
    state.isProgressLoaded &&
      !state.isCheckpointsLoading &&
      !isEvidenceLoading &&
      displayPins.length > 0,
  );

  return (
    <div
      ref={layout.canvasWrapperRef}
      data-board-ready={isBoardReady ? "true" : "false"}
      suppressHydrationWarning
      className="relative w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center select-none transition-all duration-300"
    >
      {/* 1. Header Toolbar & Floating Node Toolbar */}
      {!state.isReinvestigateModalOpen && (
        <CanvasToolbar
          layout={layout}
          state={state}
          isAudioMuted={isAudioMuted}
          onToggleAudio={() => {
            const next = detectiveAudio.toggleMute();
            setIsAudioMuted(next);
          }}
          selectedPin={selectedPin}
          hideTitleBadgeOnMobile={hideTitleBadgeOnMobile}
          hideTitleBadge={hideTitleBadge}
          hideGroupPlay={hideGroupPlay}
          hideAudio={hideAudio}
          hideNotebook={hideNotebook}
          isBoardGame={isBoardGameMode}
          onOpenNotebook={onOpenNotebook}
        />
      )}

      {/* 2. Interactive Pinboard Canvas */}
      <HeroInteractive
        className="w-full h-full flex-1 min-h-0"
        controlledCaseId={caseId}
        customPins={displayPins}
        customConnections={customConnections}
        customBgImage={customBgImage}
        selectedPinId={layout.selectedPinId}
        onSelectPin={layout.setSelectedPinId}
        onConnectPins={layout.handleConnectPins}
        onDeleteConnection={layout.handleDeleteConnection}
        onPinClick={handlePinClick}
        isEditMode={layout.isEditMode}
        onPinPositionChange={layout.handlePinPositionChange}
        lightConeConfig={lightConeConfig}
        isBoardReady={isBoardReady}
      />

      {/* 3. Modals & Narrative Layers */}
      <CanvasModals
        layout={layout}
        state={state}
        displayPins={displayPins}
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
