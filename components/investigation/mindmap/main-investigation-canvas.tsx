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
  Home,
  ArrowLeft,
  Lightbulb,
  Settings,
  Save,
  Move,
  Check,
  X,
  Plus,
  StickyNote,
  RotateCcw,
  RotateCw,
  Minus,
  Pencil,
  Trash2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
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
import { EpilogueModal } from "@/components/investigation/epilogue-modal";
import {
  getCanonicalSuspectKey,
  findValidCaseCharacter,
} from "@/lib/cases/case-000-suspects";
import { detectiveAudio } from "@/lib/investigation-audio";
import { createClient } from "@/lib/supabase/client";
import {
  getBoardgamePinPositions,
  saveBoardgamePinPositions,
} from "@/lib/actions/board-actions";
import { toast } from "@/components/ui/toast";
import { normalizeImageUrl } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";

interface SuspectItem {
  id: string;
  name: string;
  clueIds: string[];
  motiveClueIds?: string[];
  alibiClueIds?: string[];
}

const ALL_CASE_000_SUSPECTS: SuspectItem[] = [
  { id: "suspect-vu", name: "Lê Quang Vũ", clueIds: ["c0-clue-01", "c0-clue-02"] },
  { id: "suspect-tung", name: "Nguyễn Thanh Tùng", clueIds: ["c0-clue-03"] },
  { id: "suspect-ha", name: "Trần Thị Hà", clueIds: ["c0-clue-04"] },
  { id: "suspect-mai", name: "Nguyễn Ngọc Mai", clueIds: [] },
  { id: "suspect-dat", name: "Trần Văn Đạt", clueIds: [] },
  { id: "suspect-lua", name: "Nguyễn Thị Lụa", clueIds: [] },
];

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
  const [suspects, setSuspects] = useState<SuspectItem[]>([]);
  const [isReinvestigateUnlocked, setIsReinvestigateUnlocked] = useState(false);
  const [isReinvestigateModalOpen, setIsReinvestigateModalOpen] =
    useState(false);
  const [hasOpenedReinvestigation, setHasOpenedReinvestigation] =
    useState(false);
  const [phoneLookupSuccess, setPhoneLookupSuccess] = useState(false);
  const [isShowAllPinsPreview, setIsShowAllPinsPreview] = useState(false);

  // Indictment & Epilogue state
  const [isIndictmentSolved, setIsIndictmentSolved] = useState(false);
  const [solvedCulprit, setSolvedCulprit] = useState<
    "vu" | "tung" | "ha" | null
  >(null);
  const [isEpilogueOpen, setIsEpilogueOpen] = useState(false);
  const [isFinalEpilogueOpen, setIsFinalEpilogueOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [activeDossierType, setActiveDossierType] = useState<
    "A" | "B" | "C" | null
  >(null);
  const [isFollowupQuestionOpen, setIsFollowupQuestionOpen] = useState(false);
  const [isEvidenceGuideOpen, setIsEvidenceGuideOpen] = useState(false);
  const [isGameplayGuideOpen, setIsGameplayGuideOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isPhoneNarrativeOpen, setIsPhoneNarrativeOpen] = useState(false);
  const [isDossierEOpen, setIsDossierEOpen] = useState(false);
  const [zoomedPhotoUrl, setZoomedPhotoUrl] = useState<string | null>(null);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number } | null>(
    null,
  );
  const zoomOpenTimeRef = React.useRef<number>(0);

  // Listen for open-gameplay-guide-modal and open-interactive-walkthrough custom events
  useEffect(() => {
    const handleOpenGuide = () => {
      detectiveAudio.playPaperRustle();
      setIsGameplayGuideOpen(true);
    };
    const handleOpenWalkthrough = () => {
      detectiveAudio.playPaperRustle();
      setIsWalkthroughOpen(true);
    };
    window.addEventListener("open-gameplay-guide-modal", handleOpenGuide);
    window.addEventListener("open-interactive-walkthrough", handleOpenWalkthrough);
    return () => {
      window.removeEventListener("open-gameplay-guide-modal", handleOpenGuide);
      window.removeEventListener("open-interactive-walkthrough", handleOpenWalkthrough);
    };
  }, []);

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

  // Global shortcut '?' or 'H' to toggle gameplay guide
  useEffect(() => {
    const handleGuideShortcut = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      if (e.key === "?" || (e.key.toLowerCase() === "h" && !e.ctrlKey && !e.metaKey && !e.altKey)) {
        e.preventDefault();
        detectiveAudio.playPaperRustle();
        setIsGameplayGuideOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGuideShortcut);
    return () => window.removeEventListener("keydown", handleGuideShortcut);
  }, []);

  const [investigatedSuspects, setInvestigatedSuspects] = useState<
    ("vu" | "tung" | "ha")[]
  >([]);
  const [solvedFollowupQuestions, setSolvedFollowupQuestions] = useState<
    ("vu" | "tung" | "ha")[]
  >([]);
  const [activeFollowupCulprit, setActiveFollowupCulprit] = useState<
    "vu" | "tung" | "ha" | null
  >(null);
  const [narrativeCulprit, setNarrativeCulprit] = useState<
    "vu" | "tung" | "ha" | null
  >(null);
  const [narrativeChoice, setNarrativeChoice] = useState<string | null>(null);

  // Modals state
  const [isAddSuspectOpen, setIsAddSuspectOpen] = useState(false);
  const [editingSuspect, setEditingSuspect] = useState<SuspectItem | null>(
    null,
  );
  const [isPhoneLookupOpen, setIsPhoneLookupOpen] = useState(false);
  const [isIndictmentOpen, setIsIndictmentOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [customPinPositions, setCustomPinPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  // Admin-created custom pins (sticky notes, blank A4 dossiers, pinned photos)
  const [adminCustomPins, setAdminCustomPins] = useState<PinPoint[]>([]);
  const [adminConnections, setAdminConnections] = useState<CaseConnection[]>(
    [],
  );
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isCreatePinModalOpen, setIsCreatePinModalOpen] = useState(false);
  const [editingCustomPin, setEditingCustomPin] = useState<PinPoint | null>(
    null,
  );
  const [activeCustomPinModal, setActiveCustomPinModal] =
    useState<PinPoint | null>(null);

  // Synchronize photos directly from Google Sheets Live CMS
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
          if (code.includes("vu") || code.includes("vũ")) map.vu = normUrl;
          if (code.includes("tung") || code.includes("tùng"))
            map.tung = normUrl;
          if (code.includes("ha") || code.includes("hà")) map.ha = normUrl;
          if (code.includes("mai")) map.mai = normUrl;
          if (code.includes("khang")) map.khang = normUrl;
          if (code.includes("dat") || code.includes("đạt")) map.dat = normUrl;
          if (code.includes("lua") || code.includes("lụa")) map.lua = normUrl;
          if (
            code.includes("crime") ||
            code.includes("thi_the") ||
            code.includes("hien_truong")
          )
            map.crime_scene = normUrl;
        }
      });
    }
    return map;
  }, [sheetPhotos]);

  // Ghim đang được chọn trên bảng (chế độ Setup) + tâm điều khiển nhanh
  const [pinTransforms, setPinTransforms] = useState<
    Record<string, { rotation: number; scale: number }>
  >({});
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectionAnchor, setSelectionAnchor] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  // ---- Undo / Redo history (Ctrl+Z / Ctrl+Shift+Z) ----
  type LayoutSnapshot = {
    posMap: Record<string, { x: number; y: number }>;
    adminPins: PinPoint[];
    transforms: Record<string, { rotation: number; scale: number }>;
    connections: CaseConnection[];
  };
  const layoutRef = useRef<LayoutSnapshot>({
    posMap: {},
    adminPins: [],
    transforms: {},
    connections: [],
  });
  const historyRef = useRef<{
    past: LayoutSnapshot[];
    future: LayoutSnapshot[];
  }>({ past: [], future: [] });
  // Gom nhóm thao tác kéo thả liên tục của cùng một ghim thành 1 bước hoàn tác
  const lastGestureRef = useRef<{ key: string; time: number }>({
    key: "",
    time: 0,
  });

  useEffect(() => {
    layoutRef.current.posMap = customPinPositions;
  }, [customPinPositions]);

  useEffect(() => {
    layoutRef.current.adminPins = adminCustomPins;
  }, [adminCustomPins]);

  useEffect(() => {
    layoutRef.current.transforms = pinTransforms;
  }, [pinTransforms]);

  useEffect(() => {
    layoutRef.current.connections = adminConnections;
  }, [adminConnections]);

  const cloneLayout = (
    src: LayoutSnapshot = layoutRef.current,
  ): LayoutSnapshot => ({
    posMap: { ...src.posMap },
    adminPins: src.adminPins.map((p) => ({ ...p })),
    transforms: { ...src.transforms },
    connections: [...src.connections],
  });

  const applyLayout = useCallback((snapshot: LayoutSnapshot) => {
    setCustomPinPositions(snapshot.posMap);
    setAdminCustomPins(snapshot.adminPins);
    setPinTransforms(snapshot.transforms);
    setAdminConnections(snapshot.connections);
    setHasUnsavedChanges(true);
  }, []);

  /** Ghi 1 bước vào lịch sử. gestureKey dùng để gộp thao tác kéo thả liên tục. */
  const commitLayout = useCallback(
    (mutate: (draft: LayoutSnapshot) => LayoutSnapshot, gestureKey: string) => {
      const before = cloneLayout();
      const after = mutate(cloneLayout());

      const now = Date.now();
      const sameGesture =
        gestureKey !== "" &&
        lastGestureRef.current.key === gestureKey &&
        now - lastGestureRef.current.time < 800;
      lastGestureRef.current = { key: gestureKey, time: now };

      if (!sameGesture) {
        historyRef.current.past.push(before);
        if (historyRef.current.past.length > 100) {
          historyRef.current.past.shift();
        }
        historyRef.current.future = [];
      }

      layoutRef.current = after;
      applyLayout(after);
    },
    [applyLayout],
  );

  const handleUndo = useCallback(() => {
    const h = historyRef.current;
    if (h.past.length === 0) return;
    const previous = h.past.pop()!;
    h.future.push(cloneLayout());
    lastGestureRef.current = { key: "", time: 0 };
    layoutRef.current = previous;
    detectiveAudio.playPaperRustle();
    applyLayout(previous);
    toast.info("Đã hoàn tác (Ctrl+Z)");
  }, [applyLayout]);

  const handleRedo = useCallback(() => {
    const h = historyRef.current;
    if (h.future.length === 0) return;
    const next = h.future.pop()!;
    h.past.push(cloneLayout());
    lastGestureRef.current = { key: "", time: 0 };
    layoutRef.current = next;
    detectiveAudio.playTypewriterClick();
    applyLayout(next);
    toast.info("Đã làm lại (Ctrl+Shift+Z)");
  }, [applyLayout]);

  // Phím tắt Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y khi đang ở chế độ Setup
  useEffect(() => {
    if (!isAdmin || !isEditMode) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAdmin, isEditMode, handleUndo, handleRedo]);

  // Check admin role and load custom pin layout from DB on mount
  useEffect(() => {
    async function initAdminAndLayout() {
      // Tự động bật quyền Admin trên Môi trường Local Dev để dễ setup
      if (process.env.NODE_ENV === "development") {
        setIsAdmin(true);
      } else {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();
            if (profile && profile.role === "admin") {
              setIsAdmin(true);
            }
          }
        } catch {}
      }

      // 1. Tải cache cục bộ từ localStorage trước (đáp ứng ngay lập tức)
      try {
        const localSaved = localStorage.getItem(
          "veritas_boardgame_pins_case-000",
        );
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (parsed && typeof parsed === "object") {
            setCustomPinPositions(parsed);
          }
        }
        const localCustomPins = localStorage.getItem(
          "veritas_admin_custom_pins_case-000",
        );
        if (localCustomPins) {
          const parsed = JSON.parse(localCustomPins);
          if (Array.isArray(parsed)) {
            setAdminCustomPins(parsed);
          }
        }
        const localTransforms = localStorage.getItem(
          "veritas_boardgame_transforms_case-000",
        );
        if (localTransforms) {
          const parsed = JSON.parse(localTransforms);
          if (parsed && typeof parsed === "object") {
            setPinTransforms(parsed);
          }
        }
        const localConnections = localStorage.getItem(
          "veritas_admin_connections_case-000",
        );
        if (localConnections) {
          const parsed = JSON.parse(localConnections);
          if (Array.isArray(parsed)) {
            setAdminConnections(parsed);
          }
        }
      } catch {}

      // 2. Tải đồng bộ từ Supabase Database nếu có
      try {
        const res = await getBoardgamePinPositions("case-000");
        if (res.success && res.pins.length > 0) {
          const posMap: Record<string, { x: number; y: number }> = {};
          const dbCustomPins: PinPoint[] = [];
          res.pins.forEach((p) => {
            posMap[p.id] = { x: p.x, y: p.y };
            if (
              p.id.startsWith("admin-pin-") ||
              p.id.startsWith("custom-pin-")
            ) {
              dbCustomPins.push(p);
            }
          });
          setCustomPinPositions(posMap);
          if (dbCustomPins.length > 0) {
            setAdminCustomPins(dbCustomPins);
          }
          try {
            localStorage.setItem(
              "veritas_boardgame_pins_case-000",
              JSON.stringify(posMap),
            );
            if (dbCustomPins.length > 0) {
              localStorage.setItem(
                "veritas_admin_custom_pins_case-000",
                JSON.stringify(dbCustomPins),
              );
            }
          } catch {}
        }
      } catch {}
    }

    initAdminAndLayout();
  }, []);

  const handleSaveAdminPin = useCallback(
    (pin: PinPoint) => {
      commitLayout((draft) => {
        const exists = draft.adminPins.some((p) => p.id === pin.id);
        const nextAdminPins = exists
          ? draft.adminPins.map((p) => (p.id === pin.id ? pin : p))
          : [...draft.adminPins, pin];
        const nextPosMap = {
          ...draft.posMap,
          [pin.id]: { x: pin.x, y: pin.y },
        };
        try {
          localStorage.setItem(
            "veritas_admin_custom_pins_case-000",
            JSON.stringify(nextAdminPins),
          );
        } catch {}
        return {
          posMap: nextPosMap,
          adminPins: nextAdminPins,
          transforms: draft.transforms,
          connections: draft.connections,
        };
      }, `save-pin-${pin.id}`);
      toast.success("Đã thêm ghim vào bảng!");
    },
    [commitLayout],
  );

  const handleDeleteAdminPin = useCallback(
    (pinId: string) => {
      commitLayout((draft) => {
        const nextAdminPins = draft.adminPins.filter((p) => p.id !== pinId);
        const nextPosMap = { ...draft.posMap };
        const nextTransforms = { ...draft.transforms };
        delete nextPosMap[pinId];
        delete nextTransforms[pinId];
        const nextConns = draft.connections.filter(
          (c) => c.fromPinId !== pinId && c.toPinId !== pinId,
        );
        try {
          localStorage.setItem(
            "veritas_admin_custom_pins_case-000",
            JSON.stringify(nextAdminPins),
          );
          localStorage.setItem(
            "veritas_boardgame_transforms_case-000",
            JSON.stringify(nextTransforms),
          );
          localStorage.setItem(
            "veritas_admin_connections_case-000",
            JSON.stringify(nextConns),
          );
        } catch {}
        return {
          posMap: nextPosMap,
          adminPins: nextAdminPins,
          transforms: nextTransforms,
          connections: nextConns,
        };
      }, `delete-pin-${pinId}`);
      toast.info("Đã xoá ghim khỏi bảng!");
    },
    [commitLayout],
  );

  /** Xoay / phóng to thu nhỏ node đang chọn ngay trên bảng (không cần mở modal) */
  const handleAdjustNodeTransform = useCallback(
    (pinId: string, deltaRot: number, deltaScale: number) => {
      detectiveAudio.playTypewriterClick();
      commitLayout((draft) => {
        const adminPin = draft.adminPins.find((p) => p.id === pinId);
        const current = draft.transforms[pinId];
        const curRot = current?.rotation ?? adminPin?.rotation ?? 0;
        const curScale = current?.scale ?? adminPin?.scale ?? 1.0;

        const nextTransforms = {
          ...draft.transforms,
          [pinId]: {
            rotation: Math.round(curRot + deltaRot),
            scale: Math.max(
              0.3,
              Math.min(2.5, Math.round((curScale + deltaScale) * 10) / 10),
            ),
          },
        };

        try {
          localStorage.setItem(
            "veritas_boardgame_transforms_case-000",
            JSON.stringify(nextTransforms),
          );
        } catch {}

        return {
          posMap: draft.posMap,
          adminPins: draft.adminPins,
          transforms: nextTransforms,
          connections: draft.connections,
        };
      }, `transform-${pinId}`);
    },
    [commitLayout],
  );

  const handleConnectPins = useCallback(
    (fromPinId: string, toPinId: string) => {
      if (fromPinId === toPinId) return;
      const connId1 = `admin-conn-${fromPinId}-${toPinId}`;
      const connId2 = `admin-conn-${toPinId}-${fromPinId}`;
      commitLayout((draft) => {
        const existingIndex = draft.connections.findIndex(
          (c) =>
            c.id === connId1 ||
            c.id === connId2 ||
            (c.fromPinId === fromPinId && c.toPinId === toPinId) ||
            (c.fromPinId === toPinId && c.toPinId === fromPinId),
        );
        const exists = existingIndex !== -1;
        const nextConns = exists
          ? draft.connections.filter((_, idx) => idx !== existingIndex)
          : [...draft.connections, { id: connId1, fromPinId, toPinId }];
        try {
          localStorage.setItem(
            "veritas_admin_connections_case-000",
            JSON.stringify(nextConns),
          );
        } catch {}
        if (exists) {
          toast.info("Đã tháo dây chỉ đỏ giữa 2 node!");
        } else {
          toast.success("Đã nối dây chỉ đỏ giữa 2 node!");
        }
        return {
          ...draft,
          connections: nextConns,
        };
      }, `toggle-connect-${fromPinId}-${toPinId}`);
    },
    [commitLayout],
  );

  const handleDeleteConnection = useCallback(
    (connId: string) => {
      commitLayout((draft) => {
        const nextConns = draft.connections.filter((c) => c.id !== connId);
        try {
          localStorage.setItem(
            "veritas_admin_connections_case-000",
            JSON.stringify(nextConns),
          );
        } catch {}
        return {
          ...draft,
          connections: nextConns,
        };
      }, `delete-conn-${connId}`);
      toast.info("Đã tháo dây chỉ đỏ!");
    },
    [commitLayout],
  );

  const handlePinPositionChange = useCallback(
    (pinId: string, newX: number, newY: number) => {
      commitLayout((draft) => {
        return {
          ...draft,
          posMap: {
            ...draft.posMap,
            [pinId]: { x: newX, y: newY },
          },
        };
      }, `drag-${pinId}`);
    },
    [commitLayout],
  );

  const handleSavePinLayout = async (pinsToSave: PinPoint[]) => {
    setIsSavingLayout(true);
    // 1. Luôn lưu ngay vào localStorage làm cache trình duyệt
    try {
      const posMap: Record<string, { x: number; y: number }> = {};
      pinsToSave.forEach((p) => {
        posMap[p.id] = { x: p.x, y: p.y };
      });
      localStorage.setItem(
        "veritas_boardgame_pins_case-000",
        JSON.stringify(posMap),
      );
      setCustomPinPositions(posMap);
    } catch {}

    // 2. Đồng bộ lên Supabase Database
    try {
      const res = await saveBoardgamePinPositions("case-000", pinsToSave);
      if (res.success) {
        toast.success("Đã lưu vị trí ghim lên Supabase DB & Cục bộ!");
        setHasUnsavedChanges(false);
      } else {
        toast.error(
          "Đã lưu cục bộ! (Supabase lỗi: " +
            (res.error || "Chưa tạo bảng boardgame_pins") +
            ")",
        );
        setHasUnsavedChanges(false);
      }
    } catch (err: any) {
      toast.error("Đã lưu cục bộ! (Supabase lỗi: " + err.message + ")");
      setHasUnsavedChanges(false);
    } finally {
      setIsSavingLayout(false);
    }
  };
  const sanitizeSuspectsList = (items: SuspectItem[]): SuspectItem[] => {
    const map = new Map<string, SuspectItem>();
    for (const s of items) {
      if (!s || !s.name) continue;
      const matchedChar = findValidCaseCharacter(s.name || s.id);
      if (!matchedChar || matchedChar.id === "khang") continue;
      const { canonicalId, canonicalName } = getCanonicalSuspectKey(s);
      map.set(canonicalId, {
        ...s,
        id: canonicalId,
        name: canonicalName || s.name,
      });
    }
    return Array.from(map.values());
  };

  // Restore saved state from localStorage if available
  useEffect(() => {
    try {
      const savedSuspects = localStorage.getItem("veritas_canvas_suspects");
      if (savedSuspects) {
        const parsed = JSON.parse(savedSuspects);
        const validList = parsed.filter(
          (s: any) => s.id !== "suspect-default-1",
        );
        const sanitized = sanitizeSuspectsList(validList);
        setSuspects(sanitized);
      }
      const savedSolvedFollowups = localStorage.getItem(
        "veritas_solved_followups",
      );
      if (savedSolvedFollowups) {
        try {
          const parsed = JSON.parse(savedSolvedFollowups);
          setSolvedFollowupQuestions(parsed);
          if (parsed.includes("vu") && parsed.includes("tung")) {
            setIsReinvestigateUnlocked(true);
          }
        } catch {}
      }
      const savedReinvestigateUnlocked = localStorage.getItem(
        "veritas_reinvestigate_unlocked",
      );
      if (savedReinvestigateUnlocked === "true") {
        setIsReinvestigateUnlocked(true);
      }
      const savedReinvestigateOpened = localStorage.getItem(
        "veritas_reinvestigate_opened",
      );
      if (savedReinvestigateOpened === "true") {
        setHasOpenedReinvestigation(true);
      }
      const savedPhone = localStorage.getItem("veritas_phone_inputs");
      const isPhoneSolved =
        localStorage.getItem("veritas_phone_solved") === "true";
      if (savedPhone || isPhoneSolved) {
        try {
          if (savedPhone) {
            const parsed = JSON.parse(savedPhone);
            if (parsed.phone1 || parsed.phone2 || parsed.phone3) {
              setPhoneLookupSuccess(true);
            } else if (isPhoneSolved) {
              setPhoneLookupSuccess(true);
            }
          } else if (isPhoneSolved) {
            setPhoneLookupSuccess(true);
          }
        } catch {
          setPhoneLookupSuccess(true);
        }
      }
      const savedInvestigated = localStorage.getItem(
        "veritas_investigated_suspects",
      );
      if (savedInvestigated) {
        setInvestigatedSuspects(JSON.parse(savedInvestigated));
      }
      const savedSolved = localStorage.getItem("veritas_indictment_solved");
      const savedCulprit = localStorage.getItem(
        "veritas_indictment_culprit",
      ) as "vu" | "tung" | "ha" | null;
      if (savedSolved === "true" && savedCulprit) {
        setIsIndictmentSolved(true);
        setSolvedCulprit(savedCulprit);
      }
    } catch {}
  }, []);

  const saveSuspectsState = (newSuspects: SuspectItem[]) => {
    const sanitized = sanitizeSuspectsList(newSuspects);
    setSuspects(sanitized);
    try {
      localStorage.setItem(
        "veritas_canvas_suspects",
        JSON.stringify(sanitized),
      );
    } catch {}
  };

  const handleSaveSuspect = (savedSuspect: SuspectItem) => {
    const matchedChar = findValidCaseCharacter(
      savedSuspect.name || savedSuspect.id,
    );
    if (!matchedChar || matchedChar.id === "khang") return;

    const { canonicalId, canonicalName } = getCanonicalSuspectKey(savedSuspect);
    const normalizedItem: SuspectItem = {
      ...savedSuspect,
      id: canonicalId,
      name: canonicalName || savedSuspect.name,
    };

    setSuspects((prev) => {
      const existingIndex = prev.findIndex((s) => {
        const sKey = getCanonicalSuspectKey(s);
        return sKey.canonicalId === canonicalId || s.id === canonicalId;
      });
      let updated: SuspectItem[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = normalizedItem;
      } else {
        updated = [...prev, normalizedItem];
      }
      const sanitized = sanitizeSuspectsList(updated);
      try {
        localStorage.setItem(
          "veritas_canvas_suspects",
          JSON.stringify(sanitized),
        );
      } catch {}
      return sanitized;
    });
  };

  const handleDeleteSuspect = (id: string) => {
    const { canonicalId } = getCanonicalSuspectKey({ id, name: id });
    const suspectToDelete = suspects.find(
      (s) =>
        s.id === id || getCanonicalSuspectKey(s).canonicalId === canonicalId,
    );
    const updated = suspects.filter(
      (s) =>
        s.id !== id && getCanonicalSuspectKey(s).canonicalId !== canonicalId,
    );
    saveSuspectsState(updated);

    if (suspectToDelete) {
      const { canonicalId } = getCanonicalSuspectKey(suspectToDelete);
      const culpritType: "vu" | "tung" | "ha" | null =
        canonicalId === "vu" || canonicalId === "tung" || canonicalId === "ha"
          ? (canonicalId as "vu" | "tung" | "ha")
          : null;

      if (culpritType) {
        const remainingHasCulprit = updated.some(
          (s) => getCanonicalSuspectKey(s).canonicalId === culpritType,
        );
        if (!remainingHasCulprit) {
          setInvestigatedSuspects((prev) => {
            const next = prev.filter((c) => c !== culpritType);
            try {
              localStorage.setItem(
                "veritas_investigated_suspects",
                JSON.stringify(next),
              );
            } catch {}
            return next;
          });
          if (solvedCulprit === culpritType) {
            setSolvedCulprit(null);
            setIsIndictmentSolved(false);
            try {
              localStorage.removeItem("veritas_indictment_solved");
              localStorage.removeItem("veritas_indictment_culprit");
            } catch {}
          }
        }
      }
    }
  };

  const handlePhoneLookupSuccess = (phone: string, info: string) => {
    setPhoneLookupSuccess(true);
    try {
      localStorage.setItem("veritas_phone_solved", "true");
    } catch {}
    setIsPhoneLookupOpen(false);
    setIsPhoneNarrativeOpen(true);
  };

  const handleFollowupSuccess = (
    culprit: "vu" | "tung" | "ha",
    choice?: string,
  ) => {
    const updated = Array.from(new Set([...solvedFollowupQuestions, culprit]));
    setSolvedFollowupQuestions(updated);
    try {
      localStorage.setItem("veritas_solved_followups", JSON.stringify(updated));
      if (choice) {
        localStorage.setItem(`veritas_followup_${culprit}_choice`, choice);
      }
    } catch {}

    if (updated.includes("vu") && updated.includes("tung")) {
      setIsReinvestigateUnlocked(true);
      try {
        localStorage.setItem("veritas_reinvestigate_unlocked", "true");
      } catch {}
    }

    // Đóng câu hỏi và mở DẪN TRUYỆN toàn màn hình của đối tượng
    setIsFollowupQuestionOpen(false);
    setNarrativeCulprit(culprit);
    setNarrativeChoice(choice || null);
    setIsEpilogueOpen(true);
  };

  const handleSubmitIndictment = (data: {
    culprit: "vu" | "tung" | "ha";
    suspectName: string;
    motive: string;
    selectedClueIds: string[];
    reasoning: string;
  }) => {
    setIsIndictmentSolved(true);
    setSolvedCulprit(data.culprit);
    setIsIndictmentOpen(false);
    try {
      localStorage.setItem("veritas_indictment_solved", "true");
      localStorage.setItem("veritas_indictment_culprit", data.culprit);
    } catch {}
    setIsFinalEpilogueOpen(true);
    if (onOpenEpilogue) {
      onOpenEpilogue();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-epilogue-modal"));
    }
  };

  const handleOpenDossier = (dossierType: "A" | "B" | "C") => {
    setActiveDossierType(dossierType);
    setIsDossierOpen(true);
  };

  const handleResetAll = () => {
    detectiveAudio.playGlassSound();
    setSuspects([]);
    setPhoneLookupSuccess(false);
    setInvestigatedSuspects([]);
    setSolvedFollowupQuestions([]);
    setActiveFollowupCulprit(null);
    setNarrativeChoice(null);
    setIsIndictmentSolved(false);
    setSolvedCulprit(null);
    setIsReinvestigateUnlocked(false);
    setIsReinvestigateModalOpen(false);
    setHasOpenedReinvestigation(false);
    setIsEpilogueOpen(false);
    setIsFinalEpilogueOpen(false);
    setIsDossierOpen(false);
    setIsFollowupQuestionOpen(false);
    setIsPhoneNarrativeOpen(false);
    try {
      localStorage.removeItem("veritas_canvas_suspects");
      localStorage.removeItem("veritas_investigated_suspects");
      localStorage.removeItem("veritas_solved_followups");
      localStorage.removeItem("veritas_followup_vu");
      localStorage.removeItem("veritas_followup_tung");
      localStorage.removeItem("veritas_followup_ha");
      localStorage.removeItem("veritas_followup_ha_matches");
      localStorage.removeItem("veritas_followup_tung_choice");
      localStorage.removeItem("veritas_followup_vu_choice");
      localStorage.removeItem("veritas_followup_ha_choice");
      localStorage.removeItem("veritas_indictment_solved");
      localStorage.removeItem("veritas_indictment_culprit");
      localStorage.removeItem("veritas_reinvestigate_unlocked");
      localStorage.removeItem("veritas_reinvestigate_opened");
      localStorage.removeItem("veritas_phone_inputs");
      localStorage.removeItem("khang_phone_pinned_clues");
      localStorage.removeItem("veritas_custom_notes");
      localStorage.removeItem("veritas_discovered_findings");
      localStorage.removeItem("veritas_completed_checkpoints");
    } catch {}
  };

  const handleOpenReinvestigation = useCallback(() => {
    setIsReinvestigateModalOpen(true);
    setHasOpenedReinvestigation(true);
    try {
      localStorage.setItem("veritas_reinvestigate_opened", "true");
    } catch {}
    if (onOpenReinvestigation) {
      onOpenReinvestigation();
    }
  }, [onOpenReinvestigation]);

  // Handle pin clicks directly on HeroInteractive canvas
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

      // Chế độ Setup: chọn node để hiển thị thanh điều chỉnh nhanh (xoay, resize, sửa, xoá)
      if (isEditMode) {
        setSelectedPinId(id);
        if (coords) {
          const rect = canvasWrapperRef.current?.getBoundingClientRect();
          setSelectionAnchor(
            rect
              ? { x: coords.clientX - rect.left, y: coords.clientY - rect.top }
              : null,
          );
        }
        return;
      }

      // Check if clicked pin is an Admin custom pin (Sticky Note, A4 Dossier, Photo)
      if (id.startsWith("admin-pin-") || id.startsWith("custom-pin-")) {
        const targetPin =
          pin || adminCustomPins.find((p) => p.id === id) || null;

        if (!targetPin) return;

        // Ghim có câu hỏi tự soạn: mở modal giải đố
        if (targetPin.actionType === "custom_question") {
          setActiveCustomPinModal(targetPin);
          return;
        }

        // Ghim ảnh thuần: mở lightbox phóng to ảnh
        if (targetPin.photoUrl && targetPin.actionType !== "sheet_checkpoint") {
          handleOpenPhotoZoom(targetPin.photoUrl, coords);
          return;
        }

        // Mặc định: mở hồ sơ đọc thông tin
        setActiveCustomPinModal(targetPin);
        return;
      }

      if (id === "c0-pin-suspects" || id === "c0-pin-question") {
        setEditingSuspect(null);
        setIsAddSuspectOpen(true);
      } else if (id === "c0-pin-evidence") {
        setIsEvidenceGuideOpen(true);
      } else if (id === "c0-pin-phone") {
        if (phoneLookupSuccess) {
          setIsDossierEOpen(true);
        } else {
          setIsPhoneLookupOpen(true);
        }
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
        if (isReinvestigateUnlocked) {
          detectiveAudio.playGlassSound();
          handleOpenReinvestigation();
        } else {
          detectiveAudio.playGlassSound();
        }
      } else if (id === "c0-pin-indictment") {
        if (isIndictmentSolved) {
          setIsFinalEpilogueOpen(true);
          if (onOpenEpilogue) onOpenEpilogue();
        } else {
          setIsIndictmentOpen(true);
        }
      } else if (
        id === "c0-pin-followup-vu" ||
        id === "followup-vu" ||
        id === "c0-pin-question-vu" ||
        (id.startsWith("c0-pin-followup") &&
          (id.includes("vu") || detail.includes("vũ") || detail.includes("vu")))
      ) {
        setActiveFollowupCulprit("vu");
        setIsFollowupQuestionOpen(true);
      } else if (
        id === "c0-pin-followup-tung" ||
        id === "followup-tung" ||
        id === "c0-pin-question-tung" ||
        (id.startsWith("c0-pin-followup") &&
          (id.includes("tung") ||
            detail.includes("tùng") ||
            detail.includes("tung")))
      ) {
        setActiveFollowupCulprit("tung");
        setIsFollowupQuestionOpen(true);
      } else if (
        id === "c0-pin-followup-ha" ||
        id === "followup-ha" ||
        id === "c0-pin-question-ha" ||
        (id.startsWith("c0-pin-followup") &&
          (id.includes("ha") || detail.includes("hà") || detail.includes("ha")))
      ) {
        setActiveFollowupCulprit("ha");
        setIsFollowupQuestionOpen(true);
      } else if (
        id.startsWith("c0-pin-followup") ||
        id.startsWith("followup-") ||
        id.startsWith("c0-pin-question") ||
        label.includes("nghi vấn")
      ) {
        const c =
          id.includes("ha") || detail.includes("hà")
            ? "ha"
            : id.includes("tung") || detail.includes("tùng")
              ? "tung"
              : "vu";
        setActiveFollowupCulprit(c);
        setIsFollowupQuestionOpen(true);
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
        const foundSuspect = suspects.find((s) => {
          const key = getCanonicalSuspectKey(s);
          return (
            s.id === targetId ||
            key.canonicalId === targetId ||
            s.id === `node-suspect-${targetId}`
          );
        });
        if (foundSuspect) {
          setEditingSuspect(foundSuspect);
          setIsAddSuspectOpen(true);
        }
      }
    },
    [
      suspects,
      isReinvestigateUnlocked,
      handleOpenReinvestigation,
      isIndictmentSolved,
      solvedCulprit,
      phoneLookupSuccess,
      activeFollowupCulprit,
      isEditMode,
      adminCustomPins,
      handleOpenPhotoZoom,
      onOpenEpilogue,
    ],
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // CỐ ĐỊNH CÁC VỊ TRÍ SLOT NGHI PHẠM (Được căn lề chuẩn theo phác thảo sketch, an toàn bên trong khung gỗ)
  const DESKTOP_SUSPECT_SLOTS = React.useMemo(
    () => [
      { x: 0.44, y: 0.58 }, // Slot 0: Lê Quang Vũ
      { x: 0.6, y: 0.54 }, // Slot 1: Nguyễn Thanh Tùng
      { x: 0.76, y: 0.62 }, // Slot 2: Trần Thị Hà (đẩy xuống 0.62)
      { x: 0.76, y: 0.44 }, // Slot 3: Nguyễn Ngọc Mai
      { x: 0.23, y: 0.62 }, // Slot 4: Trần Văn Đạt — Nằm dưới Bà Lụa
      { x: 0.26, y: 0.48 }, // Slot 5: Nguyễn Thị Lụa
      { x: 0.64, y: 0.24 }, // Slot 6: Nguyễn Văn Khang (Nạn nhân)
      { x: 0.76, y: 0.44 }, // Slot 7: Thảo Vy
    ],
    [],
  );

  const MOBILE_SUSPECT_SLOTS = React.useMemo(
    () => [
      { x: 0.44, y: 0.58 }, // Slot 0: Lê Quang Vũ
      { x: 0.6, y: 0.54 }, // Slot 1: Nguyễn Thanh Tùng
      { x: 0.76, y: 0.62 }, // Slot 2: Trần Thị Hà (đẩy xuống 0.62)
      { x: 0.76, y: 0.44 }, // Slot 3: Nguyễn Ngọc Mai
      { x: 0.23, y: 0.62 }, // Slot 4: Trần Văn Đạt
      { x: 0.26, y: 0.48 }, // Slot 5: Nguyễn Thị Lụa
      { x: 0.64, y: 0.24 }, // Slot 6: Nguyễn Văn Khang
      { x: 0.76, y: 0.44 }, // Slot 7: Thảo Vy
    ],
    [],
  );

  // Construct dynamic suspect pins with 100% deterministic, stationary slots
  const SUSPECT_PHOTO_MAP: Record<string, string> = {
    vu: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_vu.png",
    tung: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_tung.png",
    ha: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_ha.png",
    mai: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_mai.png",
    khang:
      "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png",
    dat: "/images/cases/case_000/photo-dat-ga.png",
    lua: "/images/cases/case_000/photo-lua.png",
  };

  const SUSPECT_CHECKPOINT_MAP: Record<string, string> = {
    vu: "cp-000-1a",
    tung: "cp-000-1b",
    ha: "cp-000-1c",
  };

  const effectiveSuspects =
    isAdmin && isShowAllPinsPreview ? ALL_CASE_000_SUSPECTS : suspects;

  const mobileSuspectPins: PinPoint[] = effectiveSuspects.map((suspect) => {
    const { canonicalId, slotIndex, canonicalName } =
      getCanonicalSuspectKey(suspect);
    const slot = MOBILE_SUSPECT_SLOTS[slotIndex] || MOBILE_SUSPECT_SLOTS[0];
    const cpId = SUSPECT_CHECKPOINT_MAP[canonicalId];
    return {
      id: `node-suspect-${canonicalId}`,
      x: slot.x,
      y: slot.y,
      label: canonicalName || suspect.name,
      detail: `Nghi phạm: ${canonicalName || suspect.name} (${suspect.clueIds.length} manh mối liên quan)`,
      color: "blue" as const,
      photoUrl:
        sheetPhotoMap[canonicalId] ||
        SUSPECT_PHOTO_MAP[canonicalId] ||
        undefined,
      actionType: cpId ? ("sheet_checkpoint" as const) : ("info" as const),
      checkpointId: cpId || undefined,
    };
  });

  const desktopSuspectPins: PinPoint[] = effectiveSuspects.map((suspect) => {
    const { canonicalId, slotIndex, canonicalName } =
      getCanonicalSuspectKey(suspect);
    const slot = DESKTOP_SUSPECT_SLOTS[slotIndex] || DESKTOP_SUSPECT_SLOTS[0];
    const cpId = SUSPECT_CHECKPOINT_MAP[canonicalId];
    return {
      id: `node-suspect-${canonicalId}`,
      x: slot.x,
      y: slot.y,
      label: canonicalName || suspect.name,
      detail: `Nghi phạm: ${canonicalName || suspect.name} (${suspect.clueIds.length} manh mối liên quan)`,
      color: "blue" as const,
      photoUrl:
        sheetPhotoMap[canonicalId] ||
        SUSPECT_PHOTO_MAP[canonicalId] ||
        undefined,
      actionType: cpId ? ("sheet_checkpoint" as const) : ("info" as const),
      checkpointId: cpId || undefined,
    };
  });

  // Tìm node suspect của Vũ, Tùng và Hà để nối dây
  const vuSuspect = effectiveSuspects.find(
    (s) => getCanonicalSuspectKey(s).canonicalId === "vu",
  );
  const tungSuspect = effectiveSuspects.find(
    (s) => getCanonicalSuspectKey(s).canonicalId === "tung",
  );
  const haSuspect = effectiveSuspects.find(
    (s) => getCanonicalSuspectKey(s).canonicalId === "ha",
  );

  // Dynamic Followup Pins cho Vũ, Tùng và Hà (Kéo xuống vùng dưới đáy bảng): CHỈ hiển thị sau khi đã bấm "ĐIỀU TRA" (hoặc Admin Preview)
  const hasVuFollowup = isShowAllPinsPreview || investigatedSuspects.includes("vu");
  const hasTungFollowup = isShowAllPinsPreview || investigatedSuspects.includes("tung");
  const hasHaFollowup = isShowAllPinsPreview || investigatedSuspects.includes("ha");

  const followupPinsMobile: PinPoint[] = [
    ...(hasVuFollowup
      ? [
          {
            id: "c0-pin-followup-vu",
            x: 0.44,
            y: 0.82,
            label: "Nghi vấn",
            detail: "Nghi vấn suy luận mở rộng đối tượng Lê Quang Vũ",
            color: "purple" as const,
            noteColor: "yellow" as const,
            actionType: "sheet_checkpoint" as const,
            checkpointId: "cp-000-1a",
          },
        ]
      : []),
    ...(hasTungFollowup
      ? [
          {
            id: "c0-pin-followup-tung",
            x: 0.6,
            y: 0.75,
            label: "Nghi vấn",
            detail: "Nghi vấn suy luận mở rộng đối tượng Nguyễn Thanh Tùng",
            color: "purple" as const,
            noteColor: "yellow" as const,
            actionType: "sheet_checkpoint" as const,
            checkpointId: "cp-000-1b",
          },
        ]
      : []),
    ...(hasHaFollowup
      ? [
          {
            id: "c0-pin-followup-ha",
            x: 0.76,
            y: 0.77,
            label: "Nghi vấn",
            detail: "Khớp nối chứng cứ đối tượng Trần Thị Hà",
            color: "purple" as const,
            noteColor: "yellow" as const,
            actionType: "sheet_checkpoint" as const,
            checkpointId: "cp-000-1c",
          },
        ]
      : []),
  ];

  const followupPinsDesktop: PinPoint[] = [
    ...(hasVuFollowup
      ? [
          {
            id: "c0-pin-followup-vu",
            x: 0.44,
            y: 0.82,
            label: "Nghi vấn",
            detail: "Nghi vấn suy luận mở rộng đối tượng Lê Quang Vũ",
            color: "purple" as const,
            noteColor: "yellow" as const,
            actionType: "sheet_checkpoint" as const,
            checkpointId: "cp-000-1a",
          },
        ]
      : []),
    ...(hasTungFollowup
      ? [
          {
            id: "c0-pin-followup-tung",
            x: 0.6,
            y: 0.75,
            label: "Nghi vấn",
            detail: "Nghi vấn suy luận mở rộng đối tượng Nguyễn Thanh Tùng",
            color: "purple" as const,
            noteColor: "yellow" as const,
            actionType: "sheet_checkpoint" as const,
            checkpointId: "cp-000-1b",
          },
        ]
      : []),
    ...(hasHaFollowup
      ? [
          {
            id: "c0-pin-followup-ha",
            x: 0.76,
            y: 0.77,
            label: "Nghi vấn",
            detail: "Khớp nối chứng cứ đối tượng Trần Thị Hà",
            color: "purple" as const,
            noteColor: "yellow" as const,
            actionType: "sheet_checkpoint" as const,
            checkpointId: "cp-000-1c",
          },
        ]
      : []),
  ];

  // Construct dynamic pins and connections combining main category pins, sub action pins, and suspect pins
  const effectiveReinvestigateUnlocked =
    isShowAllPinsPreview || isReinvestigateUnlocked;
  const effectivePhoneSolved = isShowAllPinsPreview || phoneLookupSuccess;
  const effectiveIndictmentSolved = isShowAllPinsPreview || isIndictmentSolved;

  const isReinvestigateBlinking =
    effectiveReinvestigateUnlocked && !hasOpenedReinvestigation;

  const customPins: PinPoint[] = isMobile
    ? [
        {
          id: "c0-pin-evidence",
          x: 0.2,
          y: 0.18,
          label: "Bổ sung chứng cứ",
          detail: "Chỉ dẫn nghiệp vụ & hướng dẫn các thao tác mở rộng điều tra",
          color: "red" as const,
          noteColor: "yellow" as const,
        },
        {
          id: "c0-pin-phone",
          x: 0.42,
          y: 0.27,
          label: "Mở rộng điều tra",
          detail: effectivePhoneSolved
            ? "Đã xác minh danh tính SĐT thành công"
            : "Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang",
          color: effectivePhoneSolved ? ("cyan" as const) : ("yellow" as const),
          noteColor: "white" as const,
          isSolved: effectivePhoneSolved,
        },
        {
          id: "c0-pin-victim-khang",
          x: 0.55,
          y: 0.12,
          label: "Nạn nhân Nguyễn Văn Khang",
          detail:
            "Nạn nhân vụ án — Thi thể được phát hiện tại bờ sông xóm Chài",
          color: "red" as const,
          photoUrl:
            sheetPhotoMap.khang ||
            "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png",
        },
        {
          id: "c0-pin-crime-scene",
          x: 0.73,
          y: 0.21,
          label: "Hiện trường thi thể",
          detail: "Ảnh hiện trường khám nghiệm tử thi và vệt máu trên sàn",
          color: "orange" as const,
          photoUrl:
            sheetPhotoMap.crime_scene ||
            "/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_v2.png",
        },
        {
          id: "c0-pin-reinvestigate",
          x: 0.2,
          y: 0.35,
          label: effectiveReinvestigateUnlocked
            ? "Khám xét lại"
            : "Khám xét lại (Chờ phê duyệt)",
          detail: effectiveReinvestigateUnlocked
            ? "Mở biên bản tái khám xét hiện trường"
            : "Khám xét lại hiện trường [Chờ phê duyệt lệnh — Cần trả lời xong câu hỏi của Vũ & Tùng]",
          color: effectiveReinvestigateUnlocked
            ? ("yellow" as const)
            : ("dark" as const),
          noteColor: "white" as const,
          pinColor: effectiveReinvestigateUnlocked
            ? ("yellow" as const)
            : ("dark" as const),
          pulseBorder: isReinvestigateBlinking,
          isLocked: !effectiveReinvestigateUnlocked,
        },
        {
          id: "c0-pin-suspects",
          x: 0.58,
          y: 0.38,
          label: "Nghi phạm",
          detail: "Thêm & xem danh sách nghi phạm vụ án",
          color: "red" as const,
          pinColor: "red" as const,
          noteColor: "yellow" as const,
        },
        {
          id: "c0-pin-indictment",
          x: 0.22,
          y: 0.8,
          label: "Bản kết luận điều tra",
          detail: effectiveIndictmentSolved
            ? "Bản cáo trạng đã được Viện Kiểm sát phê chuẩn!"
            : "Lập bản cáo trạng gửi Viện Kiểm sát",
          color: "red" as const,
          pinColor: "red" as const,
          noteColor: "white" as const,
        },
        ...followupPinsMobile,
        ...mobileSuspectPins,
      ]
    : [
        {
          id: "c0-pin-evidence",
          x: 0.2,
          y: 0.18,
          label: "Bổ sung chứng cứ",
          detail: "Chỉ dẫn nghiệp vụ & hướng dẫn các thao tác mở rộng điều tra",
          color: "red" as const,
          pinColor: "red" as const,
          noteColor: "yellow" as const,
        },
        {
          id: "c0-pin-phone",
          x: 0.42,
          y: 0.27,
          label: "Mở rộng điều tra",
          detail: effectivePhoneSolved
            ? "Đã xác minh danh tính SĐT thành công"
            : "Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang",
          color: "yellow" as const,
          pinColor: "yellow" as const,
          noteColor: "white" as const,
          isSolved: effectivePhoneSolved,
        },
        {
          id: "c0-pin-victim-khang",
          x: 0.55,
          y: 0.12,
          label: "Nạn nhân Nguyễn Văn Khang",
          detail:
            "Nạn nhân vụ án — Thi thể được phát hiện tại bờ sông xóm Chài",
          color: "yellow" as const,
          pinColor: "yellow" as const,
          photoUrl:
            sheetPhotoMap.khang ||
            "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png",
        },
        {
          id: "c0-pin-crime-scene",
          x: 0.73,
          y: 0.21,
          label: "Hiện trường thi thể",
          detail: "Ảnh hiện trường khám nghiệm tử thi và vệt máu trên sàn",
          color: "yellow" as const,
          pinColor: "yellow" as const,
          photoUrl:
            sheetPhotoMap.crime_scene ||
            "/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_v2.png",
        },
        {
          id: "c0-pin-reinvestigate",
          x: 0.2,
          y: 0.35,
          label: effectiveReinvestigateUnlocked
            ? "Khám xét lại"
            : "Khám xét lại (Chờ phê duyệt)",
          detail: effectiveReinvestigateUnlocked
            ? "Mở biên bản tái khám xét hiện trường"
            : "Khám xét lại hiện trường [Chờ phê duyệt lệnh — Cần trả lời xong câu hỏi của Vũ & Tùng]",
          color: effectiveReinvestigateUnlocked
            ? ("yellow" as const)
            : ("dark" as const),
          noteColor: "white" as const,
          pinColor: effectiveReinvestigateUnlocked
            ? ("yellow" as const)
            : ("dark" as const),
          pulseBorder: isReinvestigateBlinking,
          isLocked: !effectiveReinvestigateUnlocked,
        },
        {
          id: "c0-pin-suspects",
          x: 0.58,
          y: 0.38,
          label: "Nghi phạm",
          detail: "Thêm & xem danh sách nghi phạm vụ án",
          color: "yellow" as const,
          pinColor: "yellow" as const,
          noteColor: "yellow" as const,
        },
        {
          id: "c0-pin-indictment",
          x: 0.22,
          y: 0.8,
          label: "Bản kết luận điều tra",
          detail: effectiveIndictmentSolved
            ? "Bản cáo trạng đã được Viện Kiểm sát phê chuẩn!"
            : "Lập bản cáo trạng gửi Viện Kiểm sát",
          color: "red" as const,
          pinColor: "red" as const,
          noteColor: "white" as const,
        },
        ...followupPinsDesktop,
        ...desktopSuspectPins,
      ];

  // Apply admin-saved positions & transforms over the built-in defaults
  const allPins: PinPoint[] = [...customPins, ...adminCustomPins];
  const displayPins: PinPoint[] = allPins.map((pin) => {
    const override = customPinPositions[pin.id];
    const tf = pinTransforms[pin.id];
    return {
      ...pin,
      ...(override ? { x: override.x, y: override.y } : {}),
      rotation: tf?.rotation !== undefined ? tf.rotation : pin.rotation,
      scale: tf?.scale !== undefined ? tf.scale : pin.scale,
    };
  });
  const selectedPin = displayPins.find((p) => p.id === selectedPinId) || null;

  // Tất cả các ghim (bao gồm ghim hệ thống, ảnh nghi phạm node-suspect-* và nghi vấn mở rộng) đều được lưu vị trí
  const persistablePins = displayPins;

  const customConnections: CaseConnection[] = [
    {
      id: "c0-conn-phone",
      fromPinId: "c0-pin-evidence",
      toPinId: "c0-pin-phone",
    },
    {
      id: "c0-conn-reinvestigate",
      fromPinId: "c0-pin-evidence",
      toPinId: "c0-pin-reinvestigate",
    },
    ...(hasVuFollowup && vuSuspect
      ? [
          {
            id: "c0-conn-followup-vu",
            fromPinId: `node-suspect-${getCanonicalSuspectKey(vuSuspect).canonicalId}`,
            toPinId: "c0-pin-followup-vu",
          },
        ]
      : []),
    ...(hasTungFollowup && tungSuspect
      ? [
          {
            id: "c0-conn-followup-tung",
            fromPinId: `node-suspect-${getCanonicalSuspectKey(tungSuspect).canonicalId}`,
            toPinId: "c0-pin-followup-tung",
          },
        ]
      : []),
    ...(hasHaFollowup && haSuspect
      ? [
          {
            id: "c0-conn-followup-ha",
            fromPinId: `node-suspect-${getCanonicalSuspectKey(haSuspect).canonicalId}`,
            toPinId: "c0-pin-followup-ha",
          },
        ]
      : []),
    ...effectiveSuspects.map((suspect) => {
      const { canonicalId } = getCanonicalSuspectKey(suspect);
      return {
        id: `c0-conn-${canonicalId}`,
        fromPinId: "c0-pin-suspects",
        toPinId: `node-suspect-${canonicalId}`,
      };
    }),
    ...adminConnections,
  ];

  return (
    <div
      ref={canvasWrapperRef}
      suppressHydrationWarning
      className={`relative w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center select-none transition-all duration-300 ${
        isEditMode
          ? "ring-4 ring-amber-500/80 ring-inset shadow-[inset_0_0_90px_rgba(245,158,11,0.22)]"
          : ""
      }`}
    >
      {/* Top Banner Toolbar */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#1b140e]/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#593c26]/60 text-xs text-[#d9a066] font-mono shadow-lg pointer-events-auto">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold tracking-wide">BẢNG ĐIỀU TRA</span>
        </div>

        {/* Sound Toggle Icon Button next to BẢNG ĐIỀU TRA badge */}
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

        {/* Admin Setup Controls */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 bg-[#141419]/90 backdrop-blur-md p-1 rounded-lg border border-amber-500/40 text-xs shadow-xl pointer-events-auto">
            {/* Mode Setup Button (Icon only) */}
            <button
              onClick={() => {
                detectiveAudio.playTypewriterClick();
                setIsEditMode((prev) => {
                  const next = !prev;
                  if (!next) setSelectedPinId(null);
                  return next;
                });
              }}
              className={`p-1.5 rounded-lg border transition-all ${
                isEditMode
                  ? "bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.55)] ring-1 ring-amber-400/60"
                  : "bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
              title={
                isEditMode
                  ? "Thoát chế độ di chuyển & setup"
                  : "Bật chế độ di chuyển & setup node"
              }
            >
              <Move className="size-4" />
            </button>

            {/* Toggle Show All Case Pins Button (Always visible for Admin) */}
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playTypewriterClick();
                setIsShowAllPinsPreview((prev) => {
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
                isShowAllPinsPreview
                  ? "bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.55)] ring-1 ring-amber-400/60"
                  : "bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
              title={
                isShowAllPinsPreview
                  ? "Tắt hiển thị tất cả node (về theo cốt truyện)"
                  : "Hiển thị tất cả node ghim (phục vụ căn chỉnh setup)"
              }
            >
              {isShowAllPinsPreview ? (
                <EyeOff className="size-4 text-amber-300" />
              ) : (
                <Eye className="size-4 text-zinc-400 hover:text-zinc-200" />
              )}
            </button>

            {isEditMode && (
              <>
                {/* Add Pin Button (Icon only) */}
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

                {/* Save Pin Layout Button (Icon only) */}
                <button
                  disabled={isSavingLayout}
                  onClick={() => handleSavePinLayout(persistablePins)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    hasUnsavedChanges
                      ? "bg-emerald-600/80 border-emerald-400 text-white hover:bg-emerald-500 shadow-sm animate-pulse"
                      : "bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                  title={
                    isSavingLayout ? "Đang lưu vị trí..." : "Lưu vị trí ghim"
                  }
                >
                  <Save className="size-4" />
                </button>

                {/* Undo Unsaved Changes Button (Icon only) */}
                {hasUnsavedChanges && (
                  <button
                    onClick={() => {
                      detectiveAudio.playPaperRustle();
                      setCustomPinPositions({});
                      setHasUnsavedChanges(false);
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

      {/* On-Canvas Floating Quick Node Adjustment Toolbar (Edit Mode) */}
      <AnimatePresence>
        {isEditMode && selectedPin && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 p-0.5 bg-[#1b140e]/95 backdrop-blur-md rounded-lg border border-amber-500/60 shadow-[0_12px_40px_rgba(0,0,0,0.85)] font-mono text-xs select-none pointer-events-auto"
          >
            {/* Tilt Left (-1 deg) */}
            <button
              type="button"
              onClick={() => handleAdjustNodeTransform(selectedPin.id, -1, 0)}
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Xoay nghiêng trái (-1°)"
            >
              <RotateCcw className="size-3.5" />
            </button>

            {/* Tilt Right (+1 deg) */}
            <button
              type="button"
              onClick={() => handleAdjustNodeTransform(selectedPin.id, 1, 0)}
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Xoay nghiêng phải (+1°)"
            >
              <RotateCw className="size-3.5" />
            </button>

            <div className="h-3.5 w-px bg-white/15" />

            {/* Zoom Out (-10%) */}
            <button
              type="button"
              onClick={() => handleAdjustNodeTransform(selectedPin.id, 0, -0.1)}
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Thu nhỏ kích thước"
            >
              <Minus className="size-3.5" />
            </button>

            {/* Zoom In (+10%) */}
            <button
              type="button"
              onClick={() => handleAdjustNodeTransform(selectedPin.id, 0, 0.1)}
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Phóng to kích thước"
            >
              <Plus className="size-3.5" />
            </button>

            <div className="h-3.5 w-px bg-white/15" />

            {/* Edit Node Modal trigger */}
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

      {/* Main Interactive Pinboard Canvas */}
      <HeroInteractive
        className="w-full h-full flex-1 min-h-0"
        controlledCaseId="case-000"
        customPins={displayPins}
        customConnections={customConnections}
        selectedPinId={selectedPinId}
        onSelectPin={setSelectedPinId}
        onConnectPins={handleConnectPins}
        onDeleteConnection={handleDeleteConnection}
        onPinClick={handlePinClick}
        isEditMode={isEditMode}
        onPinPositionChange={handlePinPositionChange}
      />

      {/* Modals & Narrative Layers */}
      <AddSuspectModal
        key={
          isAddSuspectOpen
            ? editingSuspect
              ? `suspect-${editingSuspect.id}`
              : "new-suspect-form"
            : "suspect-modal-closed"
        }
        isOpen={isAddSuspectOpen}
        onClose={() => {
          setIsAddSuspectOpen(false);
          setEditingSuspect(null);
        }}
        onSave={handleSaveSuspect}
        onDelete={handleDeleteSuspect}
        editingSuspect={editingSuspect}
        existingSuspects={suspects}
        onSelectSuspect={(s) => setEditingSuspect(s)}
        isPhoneSolved={phoneLookupSuccess}
        onSubmitConclusion={(culprit) => {
          detectiveAudio.playStampSound();
          detectiveAudio.playUnlockJingle();
          setInvestigatedSuspects((prev) => {
            const next = Array.from(new Set([...prev, culprit])) as (
              "vu" | "tung" | "ha"
            )[];
            try {
              localStorage.setItem(
                "veritas_investigated_suspects",
                JSON.stringify(next),
              );
            } catch {}
            return next;
          });
          setNarrativeCulprit(culprit);
          setActiveFollowupCulprit(culprit);
          setIsEpilogueOpen(true);
        }}
      />

      <PhoneLookupModal
        isOpen={isPhoneLookupOpen}
        onClose={() => setIsPhoneLookupOpen(false)}
        onSuccess={handlePhoneLookupSuccess}
        onOpenPhoneSimulator={onOpenPhoneSimulator}
      />

      <PhoneNarrativeModal
        isOpen={isPhoneNarrativeOpen}
        onClose={() => setIsPhoneNarrativeOpen(false)}
        onTakeTestimony={() => setIsDossierEOpen(true)}
      />

      <DossierEModal
        isOpen={isDossierEOpen}
        onClose={() => setIsDossierEOpen(false)}
      />

      <EvidenceGuideModal
        isOpen={isEvidenceGuideOpen}
        onClose={() => setIsEvidenceGuideOpen(false)}
        isPhoneSolved={phoneLookupSuccess}
        isReinvestigateUnlocked={isReinvestigateUnlocked}
      />

      <ReinvestigationModal
        isOpen={isReinvestigateModalOpen}
        onClose={() => setIsReinvestigateModalOpen(false)}
      />

      <IndictmentModal
        isOpen={isIndictmentOpen}
        onClose={() => setIsIndictmentOpen(false)}
        onSubmitIndictment={handleSubmitIndictment}
        isPhoneSolved={phoneLookupSuccess}
      />

      <CulpritEpilogueModal
        isOpen={isEpilogueOpen}
        culprit={narrativeCulprit || activeFollowupCulprit || solvedCulprit}
        choice={narrativeChoice}
        onClose={() => {
          setIsEpilogueOpen(false);
          setNarrativeCulprit(null);
          setNarrativeChoice(null);
        }}
        onOpenDossier={handleOpenDossier}
        onOpenFollowupQuestion={(targetCulprit) => {
          const c =
            targetCulprit ||
            narrativeCulprit ||
            activeFollowupCulprit ||
            solvedCulprit ||
            "vu";
          setActiveFollowupCulprit(c);
          setIsEpilogueOpen(false);
          setNarrativeCulprit(null);
          setNarrativeChoice(null);
          setIsFollowupQuestionOpen(true);
        }}
        onOpenIndictment={() => {
          setIsEpilogueOpen(false);
          setNarrativeCulprit(null);
          setNarrativeChoice(null);
          setIsIndictmentOpen(true);
        }}
      />

      <DossierResultModal
        isOpen={isDossierOpen}
        dossierType={activeDossierType}
        onClose={() => setIsDossierOpen(false)}
        onOpenFollowupQuestion={() => {
          setIsDossierOpen(false);
          const c =
            activeDossierType === "A"
              ? "vu"
              : activeDossierType === "B"
                ? "tung"
                : "ha";
          setActiveFollowupCulprit(c);
          setIsFollowupQuestionOpen(true);
        }}
      />

      <FollowupQuestionModal
        key={
          isFollowupQuestionOpen
            ? `followup-${activeFollowupCulprit || narrativeCulprit || solvedCulprit || "vu"}`
            : "followup-modal-closed"
        }
        isOpen={isFollowupQuestionOpen}
        culprit={
          activeFollowupCulprit || narrativeCulprit || solvedCulprit || "vu"
        }
        onClose={() => {
          setIsFollowupQuestionOpen(false);
          setActiveFollowupCulprit(null);
        }}
        onSuccess={handleFollowupSuccess}
        onOpenDossier={handleOpenDossier}
        isPhoneSolved={phoneLookupSuccess}
      />

      {/* Full-Screen Final Epilogue Narrative Modal */}
      <EpilogueModal
        isOpen={isFinalEpilogueOpen}
        onClose={() => setIsFinalEpilogueOpen(false)}
      />

      {/* Admin Custom Pin / Note / Dossier / Photo Creation Modal */}
      <AdminCreatePinModal
        isOpen={isCreatePinModalOpen}
        onClose={() => {
          setIsCreatePinModalOpen(false);
          setEditingCustomPin(null);
        }}
        onSavePin={handleSaveAdminPin}
        onDeletePin={handleDeleteAdminPin}
        initialPin={editingCustomPin}
      />

      {/* Interactive Custom Pin Solving / Info Modal */}
      <CustomPinModal
        isOpen={activeCustomPinModal !== null}
        onClose={() => setActiveCustomPinModal(null)}
        pin={activeCustomPinModal}
        onSolve={(pinId) => {
          toast.success("Đã hoàn thành câu hỏi ghim!");
        }}
      />

      {/* Sổ tay Nghiệp vụ & Thao tác điều tra (Universal Field Manual) */}
      <GameplayGuideModal
        isOpen={isGameplayGuideOpen}
        onClose={() => setIsGameplayGuideOpen(false)}
        onStartWalkthrough={() => {
          setIsGameplayGuideOpen(false);
          setIsWalkthroughOpen(true);
        }}
      />

      {/* Chế độ Hướng dẫn từng bước (Interactive Walkthrough Spotlight Tour) */}
      <InteractiveWalkthrough
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        pins={displayPins}
        canvasWrapperRef={canvasWrapperRef}
      />

      {/* Zoomed Photo Lightbox Modal with Morph Effect */}
      <AnimatePresence>
        {zoomedPhotoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => {
              e.stopPropagation();
              if (Date.now() - zoomOpenTimeRef.current < 120) {
                return;
              }
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
