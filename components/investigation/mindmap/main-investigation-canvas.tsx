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
import { useInvestigationState, type SuspectItem } from "./canvas/use-investigation-state";
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
  caseId?: string;
  onOpenPhoneSimulator?: () => void;
  onOpenReinvestigation?: () => void;
  onOpenEpilogue?: () => void;
  customBgImage?: string;
  lightConeConfig?: {
    enabled: boolean;
    coneSpread: number;
    intensity: number;
  };
}

export function MainInvestigationCanvas({
  caseId = "case-000",
  onOpenPhoneSimulator,
  onOpenReinvestigation,
  onOpenEpilogue,
  customBgImage,
  lightConeConfig,
}: MainInvestigationCanvasProps) {
  const layout = useBoardLayout(caseId);
  const state = useInvestigationState({
    caseId,
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
      const sName = (state.editingSuspect?.name || "").toLowerCase().trim();
      const sId = (state.editingSuspect?.id || "").toLowerCase().trim();
      if (sName === "vũ" || sName === "vu" || sName === "lê quang vũ" || sId === "vu")
        currentCp = "cp-000-1a";
      else if (
        sName === "tùng" ||
        sName === "tung" ||
        sName === "nguyễn thanh tùng" ||
        sId === "tung"
      )
        currentCp = "cp-000-1b";
      else if (sName === "hà" || sName === "ha" || sName === "trần thị hà" || sId === "ha")
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

  const normalizedSheetCaseId = useMemo(
    () => caseId.replace(/-/g, "_"),
    [caseId],
  );
  const { data: sheetEvidences } = usePhoneData("evidences", normalizedSheetCaseId);

  const victimItem = useMemo(() => {
    if (!Array.isArray(sheetEvidences)) return null;
    return sheetEvidences.find((item: any) => {
      const code = String(item.code || item.photo_code || "").toLowerCase().trim();
      const cat = String(item.category || "").toUpperCase().trim();
      const label = String(item.label || item.title || "").toLowerCase().trim();
      return (
        code === "avatar_khang" ||
        code === "khang" ||
        cat === "VICTIM" ||
        label.includes("nạn nhân")
      );
    });
  }, [sheetEvidences]);

  const victimName = useMemo(() => {
    if (victimItem) {
      const label = String(victimItem.label || victimItem.title || "").trim();
      const clean = label
        .replace(/^(Ảnh chân dung|Ảnh thẻ|Ảnh|Chân dung|Nạn nhân)\s+/i, "")
        .replace(/\s*\([^)]*\)/g, "")
        .trim();
      if (clean) return clean;
    }
    return "Nguyễn Văn Khang";
  }, [victimItem]);
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
        const rawCode = String(item.code || item.photo_code || "").toLowerCase().trim();
        const rawLabel = String(item.label || item.title || "").toLowerCase().trim();
        const category = String(item.category || "").toUpperCase().trim();
        const isAvatar = rawCode.startsWith("avatar_") || category === "AVATAR" || rawLabel.includes("chân dung");

        // 1. Suspect / Character avatars
        if (rawCode === "avatar_vu" || (isAvatar && (rawCode === "vu" || rawLabel.includes("vũ"))))
          map.vu = normUrl;
        if (rawCode === "avatar_tung" || (isAvatar && (rawCode === "tung" || rawLabel.includes("tùng"))))
          map.tung = normUrl;
        if (rawCode === "avatar_ha" || (isAvatar && (rawCode === "ha" || rawLabel.includes("hà"))))
          map.ha = normUrl;
        if (rawCode === "avatar_mai" || (isAvatar && (rawCode === "mai" || rawLabel.includes("mai"))))
          map.mai = normUrl;
        if (rawCode === "avatar_khang" || (isAvatar && (rawCode === "khang" || rawLabel.includes("khang"))))
          map.khang = normUrl;
        if (rawCode === "avatar_dat" || (isAvatar && (rawCode === "dat" || rawLabel.includes("đạt"))))
          map.dat = normUrl;
        if (rawCode === "avatar_lua" || (isAvatar && (rawCode === "lua" || rawLabel.includes("lụa"))))
          map.lua = normUrl;
        if (rawCode === "avatar_vy" || (isAvatar && (rawCode === "vy" || rawLabel.includes("vy"))))
          map.vy = normUrl;

        // 2. Crime scene
        if (
          rawCode === "crime_scene" ||
          rawCode === "chalk_outline" ||
          rawCode === "thi_the" ||
          rawCode === "a-06" ||
          rawCode.includes("chalk") ||
          rawLabel.includes("thi thể") ||
          (rawLabel.includes("hiện trường") && !rawLabel.includes("phòng khách"))
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
    const suspectVal = String(
      item.is_suspect ||
      item["is suspect"] ||
      item.suspect ||
      item.nghi_pham ||
      item["nghi pham"] ||
      "",
    ).toUpperCase().trim();
    const cat = String(item.category || "").toUpperCase().trim();
    return (
      suspectVal === "TRUE" ||
      suspectVal === "1" ||
      suspectVal === "YES" ||
      cat === "SUSPECT"
    );
  }, []);

  const parsePinOnBoardFlag = useCallback((item: any): boolean => {
    if (!item) return false;
    const pinVal = String(
      item.pin_on_board ||
      item["pin on board"] ||
      item.pin ||
      item.ghim ||
      item.ghim_len_bang ||
      item["ghim len bang"] ||
      "",
    ).toUpperCase().trim();
    return pinVal === "TRUE" || pinVal === "1" || pinVal === "YES";
  }, []);

  const effectiveSuspects = useMemo(() => {
    const list: SuspectItem[] = [];
    const seen = new Set<string>();

    const hasExplicitSuspectOnSheet =
      Array.isArray(sheetEvidences) &&
      sheetEvidences.some(parseSuspectFlag);

    if (Array.isArray(sheetEvidences) && sheetEvidences.length > 0) {
      sheetEvidences.forEach((item: any) => {
        const isPinned = parsePinOnBoardFlag(item);
        const isExplicit = parseSuspectFlag(item);
        const code = String(item.code || item.photo_code || "").toLowerCase().trim();

        // Nếu trên Sheet có đánh dấu tường minh is_suspect: TRUE hoặc category: SUSPECT thì ưu tiên 100%
        // Nếu Sheet chưa cấu hình cột is_suspect (tất cả đều trống), giữ fallback cho 3 nhân vật kinh điển của Case #000
        const isSuspect = hasExplicitSuspectOnSheet
          ? isExplicit
          : isExplicit || (isPinned && (code === "avatar_vu" || code === "avatar_tung" || code === "avatar_ha"));

        if (!isSuspect || code === "avatar_khang" || code === "khang") return;

        const charId = code.replace(/^avatar_/, "");
        const label = String(item.label || item.title || "").trim();
        const cleanName =
          label
            .replace(/^(Ảnh chân dung|Ảnh thẻ|Ảnh|Chân dung|Nạn nhân|Nghi phạm|Nhân chứng)\s+/i, "")
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
          });
        }
      });
    }

    // Nếu đã nạp từ Sheet thì ưu tiên 100% Sheet
    if (list.length > 0) {
      return list;
    }

    // Fallback tạm thời nếu Sheet đang load và local state đã có sẵn
    return state.suspects;
  }, [state.suspects, sheetEvidences]);

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

  // Tập hợp toàn bộ culprit IDs có câu hỏi mở rộng
  const followupCulpritIds = useMemo(() => {
    if (state.isShowAllPinsPreview) {
      return effectiveSuspects.map(
        (s) => getCanonicalSuspectKey(s).canonicalId,
      );
    }
    return state.investigatedSuspects.map((c) => String(c));
  }, [state.isShowAllPinsPreview, effectiveSuspects, state.investigatedSuspects]);

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

      const code = String(item.code || item.photo_code || "").toLowerCase().trim();
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
  }, [sheetEvidences, effectiveSuspects, parsePinOnBoardFlag, parseSuspectFlag]);

  const basePins = useMemo(
    () =>
      buildCustomPins({
        isMobile,
        effectiveSuspects,
        sheetPhotoMap,
        sheetPinnedItems,
        followupCulpritIds,
        hasVuFollowup,
        hasTungFollowup,
        hasHaFollowup,
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
      effectiveSuspects,
      sheetPhotoMap,
      sheetPinnedItems,
      followupCulpritIds,
      hasVuFollowup,
      hasTungFollowup,
      hasHaFollowup,
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
        hasVuFollowup,
        hasTungFollowup,
        hasHaFollowup,
        vuSuspect,
        tungSuspect,
        haSuspect,
        activePins: displayPins,
        adminConnections: layout.adminConnections,
      }),
    [
      effectiveSuspects,
      followupCulpritIds,
      hasVuFollowup,
      hasTungFollowup,
      hasHaFollowup,
      vuSuspect,
      tungSuspect,
      haSuspect,
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

      if (id === "c0-pin-suspects") {
        // Node note 'Nghi phạm' giữ làm điểm neo nối dây chỉ đỏ nghiệp vụ, không bật modal nhập tên nữa
        detectiveAudio.playPaperRustle();
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
      } else if (
        id === "c0-pin-reinvestigate" ||
        id === "reinvestigate-prop" ||
        (pin?.photoUrl && pin.photoUrl.includes("crime_scene")) ||
        (pin?.photoUrl && pin.photoUrl.includes("reinvestigation_crime_scene_prop"))
      ) {
        if (state.effectiveReinvestigateUnlocked) {
          detectiveAudio.playGlassSound();
          if (onOpenReinvestigation) onOpenReinvestigation();
          else state.handleOpenReinvestigation();
        } else {
          detectiveAudio.playGlassSound();
        }
      } else if (id === "c0-pin-phone") {
        if (state.phoneLookupSuccess) state.setIsDossierEOpen(true);
        else state.setIsPhoneLookupOpen(true);
      } else if (
        id.startsWith("node-suspect-") ||
        id.startsWith("suspect-")
      ) {
        // Thẻ chân dung nghi phạm/nhân vật trên bảng: Mở thẳng modal Thẩm tra Căn cứ tình nghi (Động cơ & Ngoại phạm)
        const charName = (pin?.label || "")
          .replace(/^(Ảnh chân dung|Ảnh thẻ|Ảnh|Chân dung|Nạn nhân|Nghi phạm|Nhân chứng)\s+/i, "")
          .replace(/\s*\([^)]*\)/g, "")
          .trim();
        const existing = state.suspects.find(
          (s) => s.id === id || s.name.toLowerCase() === charName.toLowerCase(),
        );
        state.setEditingSuspect(
          existing || {
            id,
            name: charName || pin?.label || "Nghi phạm",
            clueIds: [],
          },
        );
        state.setIsAddSuspectOpen(true);
      } else if (
        id.startsWith("c0-pin-evidence-") ||
        id.startsWith("sheet-pin-") ||
        pin?.photoUrl
      ) {
        if (pin?.photoUrl) {
          handleOpenPhotoZoom(pin.photoUrl, coords);
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
            sheetPhotoMap.khang || "/images/avatar_placeholder.svg",
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
