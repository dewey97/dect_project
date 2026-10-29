"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  ImageIcon,
  Eye,
  Search,
  ExternalLink,
  Shield,
  MousePointer,
  PenTool,
  Highlighter,
  Eraser,
  Trash2,
  GripHorizontal,
  BookOpen,
  Volume2,
  VolumeX,
  X,
  Hand,
  Pen,
  GitCommit,
  StickyNote,
  ChevronDown,
  Scissors,
  Minus,
  Plus,
  Maximize2,
  MoreHorizontal,
  ClipboardCheck,
  Stamp,
  Palette,
  Check,
  HelpCircle,
  Sun,
  Moon,
  SquareKanban,
  Compass,
} from "lucide-react";
import {
  DOSSIER_CANVAS_PRESETS,
  QUICK_CUSTOM_COLORS,
  buildCanvasBackground,
  createCustomCanvasTheme,
  type CanvasThemeConfig,
  type GridType,
  type LampTone,
} from "./dossier-canvas-themes";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { detectiveAudio } from "@/lib/investigation-audio";
import {
  emitInvestigationEvent,
  useInvestigationEvent,
} from "@/lib/investigation-events";
import {
  popAnnotationUndo,
  popAnnotationRedo,
} from "@/lib/annotation-history";
import type {
  CombinedItem,
  PDFDocument,
  PhysicalEvidence,
  SelectedView,
} from "./evidence-types";
import type { DbDossierDocument } from "@/lib/actions/dossier-actions";
import type { LoiKhaiData, LyLichData } from "@/lib/types/dossier";
import { DossierLoiKhaiSheet } from "@/components/admin/dossier-studio/dossier-loi-khai-sheet";
import { DossierLyLichSheet } from "@/components/admin/dossier-studio/dossier-ly-lich-sheet";
import {
  DossierAnnotationLayer,
  type AnnotationTool,
  type AnnotationColor,
  type EraserMode,
} from "./dossier-annotation-layer";
import { CASE_000_DOSSIER_MAP } from "@/lib/hooks/use-dossier-documents";
import { useRoomSync } from "@/components/investigation/room-sync-context";
import type { CanvasStickyNote } from "@/lib/types/room";

// Bảng màu & Kích thước chuyên biệt cho Bút vẽ (Pen)
const PEN_PALETTE = [
  { color: "#dc2626", label: "Đỏ điều tra" },
  { color: "#171717", label: "Bút chì đen" },
  { color: "#2563eb", label: "Xanh mực máy" },
  { color: "#16a34a", label: "Xanh lá cây" },
  { color: "#9333ea", label: "Tím ghi chú" },
  { color: "#ea580c", label: "Cam cảnh báo" },
];

const PEN_SIZES = [
  { size: 1.5, label: "Mảnh", dot: "size-1.5" },
  { size: 2.5, label: "Vừa", dot: "size-2.5" },
  { size: 4.5, label: "Đậm", dot: "size-3.5" },
  { size: 7.0, label: "Cọ lớn", dot: "size-5" },
];

// Bảng màu & Kích thước chuyên biệt cho Bút nhớ dạ quang (Highlighter)
const HIGHLIGHTER_PALETTE = [
  { color: "#facc15", label: "Vàng dạ quang" },
  { color: "#4ade80", label: "Xanh lục dạ quang" },
  { color: "#38bdf8", label: "Xanh dương sáng" },
  { color: "#f472b6", label: "Hồng dạ quang" },
  { color: "#fb923c", label: "Cam dạ quang" },
];

const HIGHLIGHTER_SIZES = [
  { size: 8, label: "Hẹp", bar: "h-2 w-6" },
  { size: 14, label: "Vừa", bar: "h-3.5 w-6" },
  { size: 22, label: "Rộng", bar: "h-5 w-6" },
];

// Bảng màu cho Giấy dán note (Sticky Note)
const STICKY_NOTE_COLORS = [
  { color: "#fef08a", border: "#facc15", text: "#713f12", label: "Vàng pastel" },
  { color: "#bae6fd", border: "#7dd3fc", text: "#0369a1", label: "Xanh dương" },
  { color: "#bbf7d0", border: "#86efac", text: "#15803d", label: "Xanh lá" },
  { color: "#fbcfe8", border: "#f472b6", text: "#be185d", label: "Hồng pastel" },
  { color: "#fed7aa", border: "#fb923c", text: "#c2410c", label: "Cam pastel" },
  { color: "#f5f5f4", border: "#d6d3d1", text: "#44403c", label: "Trắng ngà" },
];

export type { CanvasStickyNote };

interface DossierCanvasBoardProps {
  caseId: string;
  uiTheme?: "dark" | "light";
  onToggleUiTheme?: () => void;
  pdfItems: CombinedItem[];
  evidenceItems: CombinedItem[];
  dossierDocuments: DbDossierDocument[];
  selectedView: SelectedView | null;
  onSelectPdf: (item: PDFDocument) => void;
  onSelectEvidence: (item: PhysicalEvidence) => void;
  onOpenInspectModal?: (view: SelectedView) => void;
  onSwitchToSingleView?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  activeFilter?: string;
  onOpenNotebook?: () => void;
  onToggleDossierTray?: () => void;
  onOpenIndictment?: () => void;
  isBoardFullscreen?: boolean;
  renderInvestigationBoard?: React.ReactNode;
}

export function DossierCanvasBoard({
  caseId,
  uiTheme = "dark",
  onToggleUiTheme,
  pdfItems,
  evidenceItems,
  dossierDocuments,
  selectedView,
  onSelectPdf,
  onSelectEvidence,
  onOpenInspectModal,
  onOpenNotebook,
  onToggleDossierTray,
  onOpenIndictment,
  isBoardFullscreen = false,
  renderInvestigationBoard,
}: DossierCanvasBoardProps) {
  const isLight = uiTheme === "light";
  // Đồng bộ Realtime Group Play
  const { roomCode, roomState, syncUpdate, nickname } = useRoomSync();

  // Canvas viewport container ref
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio system state
  const [isAudioMuted, setIsAudioMuted] = useState(() => detectiveAudio.isMuted);
  const handleToggleAudio = useCallback(() => {
    const next = detectiveAudio.toggleMute();
    setIsAudioMuted(next);
  }, []);

  // Pan & Zoom state
  const [zoomScale, setZoomScale] = useState(0.8);
  const [pan, setPan] = useState({ x: 80, y: 50 });
  const zoomScaleRef = useRef(zoomScale);
  zoomScaleRef.current = zoomScale;
  const panRef = useRef(pan);
  panRef.current = pan;

  const isPanningRef = useRef(false);
  const [isPanningState, setIsPanningState] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const isSpacePressedRef = useRef(false);

  // Active focus target tag or code
  const [focusedTag, setFocusedTag] = useState<string | null>(null);

  // Dragging individual document state
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const draggingItemRef = useRef<{
    id: string;
    grabOffsetX: number;
    grabOffsetY: number;
  } | null>(null);
  const autoPanRafRef = useRef<number | null>(null);
  const edgeVelocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const autoPanLoopRunningRef = useRef(false);
  const lastPointerPosRef = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });

  const storagePosKey = `dect_dossier_canvas_pos_${caseId}`;

  // Nạp vị trí tài liệu đã lưu từ localStorage sau khi mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storagePosKey);
      if (saved) {
        setCustomPositions(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [storagePosKey]);

  // Annotation states (Công cụ vẽ vời ở dưới màn hình)
  const [activeTool, setActiveTool] = useState<AnnotationTool>("cursor");
  const [clearTrigger, setClearTrigger] = useState<number>(0);

  // Bút vẽ riêng biệt (Pen)
  const [penColor, setPenColor] = useState<string>("#dc2626");
  const [penSize, setPenSize] = useState<number>(2.5);
  const [isPenPopupOpen, setIsPenPopupOpen] = useState<boolean>(false);
  const penRef = useRef<HTMLDivElement>(null);

  // Bút nhớ dạ quang riêng biệt (Highlighter)
  const [highlighterColor, setHighlighterColor] = useState<string>("#facc15");
  const [highlighterSize, setHighlighterSize] = useState<number>(14);
  const [isHighlighterPopupOpen, setIsHighlighterPopupOpen] = useState<boolean>(false);
  const highlighterRef = useRef<HTMLDivElement>(null);

  // Bút tẩy riêng biệt (Eraser) - Hỗ trợ 2 chế độ: Freeform (tùy ý) và Stroke (trọn nét liền)
  const [eraserMode, setEraserMode] = useState<EraserMode>("freeform");
  const [isEraserPopupOpen, setIsEraserPopupOpen] = useState<boolean>(false);
  const eraserRef = useRef<HTMLDivElement>(null);

  // Dán note vuông riêng biệt (Sticky Notes)
  const [currentNoteColor, setCurrentNoteColor] = useState<string>("#fef08a");
  const [isNotePopupOpen, setIsNotePopupOpen] = useState<boolean>(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const noteHoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleNoteMouseEnter = useCallback(() => {
    if (noteHoverTimerRef.current) {
      clearTimeout(noteHoverTimerRef.current);
      noteHoverTimerRef.current = null;
    }
    setIsNotePopupOpen(true);
  }, []);

  const handleNoteMouseLeave = useCallback(() => {
    if (noteHoverTimerRef.current) {
      clearTimeout(noteHoverTimerRef.current);
    }
    noteHoverTimerRef.current = setTimeout(() => {
      setIsNotePopupOpen(false);
    }, 300);
  }, []);
  const storageNotesKey = `dect_dossier_canvas_notes_${caseId}`;

  // Canvas Theme states (Tùy chọn màu & ánh sáng mặt bàn hồ sơ)
  const [canvasTheme, setCanvasTheme] = useState<CanvasThemeConfig>(DOSSIER_CANVAS_PRESETS[0]);

  // Tự động căn chỉnh mặt bàn hồ sơ phù hợp với chế độ Sáng / Tối khi đổi UI Theme
  useEffect(() => {
    if (uiTheme === "light") {
      setCanvasTheme((prev) => {
        if (prev.id === "mahogany-warm" || prev.id === "noir-leather" || prev.id === "obsidian-minimal") {
          const lightPreset = DOSSIER_CANVAS_PRESETS.find((p) => p.id === "light-linen");
          return lightPreset || prev;
        }
        return prev;
      });
    } else if (uiTheme === "dark") {
      setCanvasTheme((prev) => {
        if (prev.id === "light-linen" || prev.id === "architect-vellum") {
          return DOSSIER_CANVAS_PRESETS[0];
        }
        return prev;
      });
    }
  }, [uiTheme]);
  const [isThemePopupOpen, setIsThemePopupOpen] = useState<boolean>(false);
  const [themeActiveTab, setThemeActiveTab] = useState<"presets" | "custom">("presets");
  const [customBaseColor, setCustomBaseColor] = useState<string>("#130f0b");
  const [customLampTone, setCustomLampTone] = useState<LampTone>("warm");
  const [customLampIntensity, setCustomLampIntensity] = useState<number>(1);
  const [customGridType, setCustomGridType] = useState<GridType>("crosses");
  const themePopupRef = useRef<HTMLDivElement>(null);

  // Nạp theme đã lưu từ localStorage sau khi mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("dect_dossier_canvas_theme");
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme) as CanvasThemeConfig;
        if (parsed && parsed.baseColor) {
          setCanvasTheme(parsed);
          if (parsed.isCustom) {
            setCustomBaseColor(parsed.baseColor);
            setCustomLampTone(parsed.lampTone || "warm");
            setCustomLampIntensity(parsed.lampIntensity ?? 1);
            setCustomGridType(parsed.gridType || "crosses");
            setThemeActiveTab("custom");
          }
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleApplyTheme = useCallback((theme: CanvasThemeConfig) => {
    setCanvasTheme(theme);
    try {
      localStorage.setItem("dect_dossier_canvas_theme", JSON.stringify(theme));
    } catch {
      // Ignore
    }
  }, []);

  const handleUpdateCustomTheme = useCallback(
    (base: string, lamp: LampTone, intensity: number, grid: GridType) => {
      setCustomBaseColor(base);
      setCustomLampTone(lamp);
      setCustomLampIntensity(intensity);
      setCustomGridType(grid);
      const customTheme = createCustomCanvasTheme(base, lamp, intensity, grid);
      handleApplyTheme(customTheme);
    },
    [handleApplyTheme]
  );

  const handleResetDefaultTheme = useCallback(() => {
    handleApplyTheme(DOSSIER_CANVAS_PRESETS[0]);
    setCustomBaseColor("#130f0b");
    setCustomLampTone("warm");
    setCustomLampIntensity(1);
    setCustomGridType("crosses");
  }, [handleApplyTheme]);

  const [stickyNotes, setStickyNotes] = useState<CanvasStickyNote[]>([]);
  const stickyNotesRef = useRef<CanvasStickyNote[]>(stickyNotes);
  const typingNoteIdRef = useRef<string | null>(null);
  const saveNoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    stickyNotesRef.current = stickyNotes;
  }, [stickyNotes]);

  // Nạp sticky notes từ localStorage khi chơi đơn
  useEffect(() => {
    if (!roomCode) {
      try {
        const saved = localStorage.getItem(storageNotesKey);
        if (saved) {
          setStickyNotes(JSON.parse(saved));
        }
      } catch {
        // Ignore
      }
    }
  }, [storageNotesKey, roomCode]);

  // Đồng bộ sticky notes theo thời gian thực từ Room Group Play
  useEffect(() => {
    if (roomCode && roomState.canvasNotes !== undefined) {
      setStickyNotes((prev) => {
        const remote = roomState.canvasNotes || [];
        const editingId = typingNoteIdRef.current;
        if (editingId) {
          return remote.map((rn) => {
            if (rn.id === editingId) {
              const currentLocal = prev.find((n) => n.id === editingId);
              return currentLocal ? { ...rn, content: currentLocal.content } : rn;
            }
            return rn;
          });
        }
        return remote;
      });
    }
  }, [roomCode, roomState.canvasNotes]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveNoteTimeoutRef.current) {
        clearTimeout(saveNoteTimeoutRef.current);
      }
    };
  }, []);

  // Đóng toàn bộ popup công cụ khi xem bảng điều tra toàn màn hình
  useEffect(() => {
    if (isBoardFullscreen) {
      setIsPenPopupOpen(false);
      setIsHighlighterPopupOpen(false);
      setIsEraserPopupOpen(false);
      setIsNotePopupOpen(false);
      setIsSearchOpen(false);
      setIsThemePopupOpen(false);
    }
  }, [isBoardFullscreen]);

  const saveStickyNotes = useCallback((notes: CanvasStickyNote[]) => {
    setStickyNotes(notes);
    try {
      localStorage.setItem(storageNotesKey, JSON.stringify(notes));
    } catch {
      // Ignore
    }
  }, [storageNotesKey]);

  // Màu và kích thước nét vẽ đang áp dụng cho canvas
  const activeAnnotationColor = activeTool === "highlighter" ? highlighterColor : penColor;
  const activeAnnotationSize = activeTool === "highlighter" ? highlighterSize : penSize;

  // Thêm một giấy dán note mới
  const handleAddStickyNote = useCallback(
    (color = "#fef08a") => {
      const container = containerRef.current;
      const zoom = zoomScaleRef.current;
      const currentPan = panRef.current;
      const rect = container?.getBoundingClientRect() || {
        width: 1000,
        height: 700,
        left: 0,
        top: 0,
      };

      const screenCenterX = rect.width / 2;
      const screenCenterY = rect.height / 2;
      const jitterX = (Math.random() - 0.5) * 60;
      const jitterY = (Math.random() - 0.5) * 60;
      const canvasX = Math.round((screenCenterX - currentPan.x) / zoom - 110 + jitterX);
      const canvasY = Math.round((screenCenterY - currentPan.y) / zoom - 110 + jitterY);

      const newId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newNote: CanvasStickyNote = {
        id: newId,
        x: canvasX,
        y: canvasY,
        content: "",
        color,
        createdAt: Date.now(),
        authorName: nickname || "Thám tử",
      };

      setCustomPositions((prev) => {
        const next = { ...prev, [newId]: { x: canvasX, y: canvasY } };
        try {
          localStorage.setItem(storagePosKey, JSON.stringify(next));
        } catch {}
        return next;
      });

      const nextNotes = [...stickyNotesRef.current, newNote];
      saveStickyNotes(nextNotes);
      if (roomCode) {
        syncUpdate({ canvasNotes: nextNotes }, "vừa dán một mẩu note lên bàn");
      }
      setIsNotePopupOpen(false);
      setActiveTool("cursor");
    },
    [saveStickyNotes, storagePosKey, roomCode, syncUpdate, nickname]
  );

  const handleUpdateStickyNote = useCallback(
    (id: string, content: string) => {
      typingNoteIdRef.current = id;
      const nextNotes = stickyNotesRef.current.map((n) => (n.id === id ? { ...n, content } : n));
      setStickyNotes(nextNotes);
      try {
        localStorage.setItem(storageNotesKey, JSON.stringify(nextNotes));
      } catch {}

      if (saveNoteTimeoutRef.current) {
        clearTimeout(saveNoteTimeoutRef.current);
      }
      saveNoteTimeoutRef.current = setTimeout(() => {
        if (roomCode) {
          syncUpdate({ canvasNotes: nextNotes }, "vừa cập nhật ghi chú");
        }
        typingNoteIdRef.current = null;
      }, 500);
    },
    [storageNotesKey, roomCode, syncUpdate]
  );

  const handleBlurStickyNote = useCallback(
    (id: string) => {
      if (saveNoteTimeoutRef.current) {
        clearTimeout(saveNoteTimeoutRef.current);
        saveNoteTimeoutRef.current = null;
      }
      typingNoteIdRef.current = null;
      if (roomCode) {
        syncUpdate({ canvasNotes: stickyNotesRef.current }, "vừa cập nhật ghi chú");
      }
    },
    [roomCode, syncUpdate]
  );

  const handleChangeNoteColor = useCallback(
    (id: string) => {
      const nextNotes = stickyNotesRef.current.map((n) => {
        if (n.id !== id) return n;
        const currentIdx = STICKY_NOTE_COLORS.findIndex((c) => c.color === n.color);
        const nextIdx = (currentIdx + 1) % STICKY_NOTE_COLORS.length;
        return { ...n, color: STICKY_NOTE_COLORS[nextIdx].color };
      });
      saveStickyNotes(nextNotes);
      if (roomCode) {
        syncUpdate({ canvasNotes: nextNotes }, "vừa đổi màu giấy note");
      }
    },
    [saveStickyNotes, roomCode, syncUpdate]
  );

  const handleDeleteStickyNote = useCallback(
    (id: string) => {
      const nextNotes = stickyNotesRef.current.filter((n) => n.id !== id);
      saveStickyNotes(nextNotes);
      if (roomCode) {
        syncUpdate({ canvasNotes: nextNotes }, "vừa gỡ một mẩu note");
      }
      setCustomPositions((prev) => {
        const copy = { ...prev };
        delete copy[id];
        try {
          localStorage.setItem(storagePosKey, JSON.stringify(copy));
        } catch {}
        return copy;
      });
    },
    [saveStickyNotes, roomCode, syncUpdate, storagePosKey]
  );

  // Tìm kiếm nội dung văn bản trong toàn bộ hồ sơ vụ án (Ctrl+F)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  // Phân tách tài liệu số hóa (Dossier Studio) thành 2 nhóm: Lời Khai và Lý Lịch
  const lkDocuments = useMemo(() => {
    return dossierDocuments.filter((doc) => doc.mode === "loi_khai");
  }, [dossierDocuments]);

  const hsDocuments = useMemo(() => {
    return dossierDocuments.filter((doc) => doc.mode === "ly_lich");
  }, [dossierDocuments]);

  // Tìm các tài liệu PDF chưa được số hóa trên Dossier Studio để hiển thị dưới dạng card hồ sơ
  const unmappedPdfItems = useMemo(() => {
    const mappedTags = new Set(dossierDocuments.map((d) => d.tag_code.toUpperCase()));
    return pdfItems.filter((item) => {
      const code = item.data.code?.trim().toUpperCase();
      if (!code) return true;
      const mappedTag = CASE_000_DOSSIER_MAP[code];
      if (mappedTag && mappedTags.has(mappedTag.toUpperCase())) {
        return false;
      }
      return !mappedTags.has(code);
    });
  }, [pdfItems, dossierDocuments]);

  // Tính toán vị trí mặc định cho từng tài liệu
  const defaultPositions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};

    // 0. Bảng Điều Tra (Đặt ở vị trí trang trọng đầu bàn hồ sơ)
    map["inv_board"] = { x: 80, y: 80 };

    // Hàng 1: Biên bản Lời khai (A4 portrait ~860px bước nhảy, bắt đầu ngay sau Bảng điều tra)
    lkDocuments.forEach((doc, idx) => {
      map[`lk_${doc.tag_code}`] = { x: 1040 + idx * 920, y: 80 };
    });

    // Hàng 2: Lý lịch bị can (A4 landscape ~1180px bước nhảy, ngay dưới Bảng điều tra)
    hsDocuments.forEach((doc, idx) => {
      map[`hs_${doc.tag_code}`] = { x: 80 + idx * 1180, y: 1380 };
    });

    // Hàng 3: Tài liệu lưu trữ & Kết quả giám định (A4 portrait ~920px bước nhảy)
    unmappedPdfItems.forEach((item, idx) => {
      const code = item.data.code || item.data.id;
      map[`pdf_${code}`] = { x: 80 + idx * 920, y: 2350 };
    });

    // Hàng 4: Tang vật hiện trường
    evidenceItems.forEach((item, idx) => {
      const code = item.data.code || item.data.id;
      map[`ev_${code}`] = { x: 80 + idx * 320, y: 3300 };
    });

    return map;
  }, [lkDocuments, hsDocuments, unmappedPdfItems, evidenceItems]);

  const getItemPosition = useCallback(
    (key: string) => {
      if (activeDraggingId === key && customPositions[key]) {
        return customPositions[key];
      }
      const note = stickyNotes.find((n) => n.id === key);
      if (note) {
        return { x: note.x, y: note.y };
      }
      return customPositions[key] || defaultPositions[key] || { x: 100, y: 100 };
    },
    [activeDraggingId, customPositions, defaultPositions, stickyNotes]
  );

  // Vòng lặp cuộn bàn mượt mà khi người chơi kéo tài liệu ra sát cạnh màn hình (Edge Auto-Pan)
  const startAutoPanLoop = useCallback(() => {
    const loop = () => {
      if (!draggingItemRef.current) {
        autoPanLoopRunningRef.current = false;
        return;
      }

      const { vx, vy } = edgeVelocityRef.current;
      if (vx === 0 && vy === 0) {
        autoPanLoopRunningRef.current = false;
        return;
      }

      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const currentZoom = zoomScaleRef.current;

        // Giới hạn biên độ di chuyển của bàn làm việc (Canvas rộng rãi 8000x5000px)
        const minPanX = -(8000 * currentZoom - rect.width * 0.5);
        const maxPanX = rect.width * 0.5;
        const minPanY = -(5000 * currentZoom - rect.height * 0.5);
        const maxPanY = rect.height * 0.5;

        const nextPanX = Math.min(maxPanX, Math.max(minPanX, panRef.current.x + vx));
        const nextPanY = Math.min(maxPanY, Math.max(minPanY, panRef.current.y + vy));

        panRef.current = { x: nextPanX, y: nextPanY };
        setPan({ x: nextPanX, y: nextPanY });

        // Đồng thời cập nhật toạ độ tài liệu theo vị trí chuột hiện tại trên màn hình
        const { id, grabOffsetX, grabOffsetY } = draggingItemRef.current;
        const { clientX, clientY } = lastPointerPosRef.current;

        const newDocX = Math.round(
          (clientX - rect.left - nextPanX) / currentZoom - grabOffsetX
        );
        const newDocY = Math.round(
          (clientY - rect.top - nextPanY) / currentZoom - grabOffsetY
        );

        setCustomPositions((prev) => ({
          ...prev,
          [id]: { x: newDocX, y: newDocY },
        }));
      }

      autoPanRafRef.current = requestAnimationFrame(loop);
    };

    autoPanRafRef.current = requestAnimationFrame(loop);
  }, []);

  // Kiểm tra con trỏ chuột có đang ở sát mép khung nhìn không (ngưỡng 40px, tốc độ êm ái)
  const checkAndTriggerEdgePan = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container || !draggingItemRef.current) return;
      const rect = container.getBoundingClientRect();

      const EDGE_THRESHOLD = 40;
      const MAX_SPEED = 7;

      let vx = 0;
      let vy = 0;

      // Kéo sát mép trái -> bàn di chuyển sang phải (pan.x tăng)
      if (clientX < rect.left + EDGE_THRESHOLD && clientX >= rect.left - 40) {
        const dist = Math.max(0, clientX - rect.left);
        const ratio = 1 - dist / EDGE_THRESHOLD;
        vx = Math.round(MAX_SPEED * Math.max(0.2, Math.min(1, ratio)));
      } else if (clientX > rect.right - EDGE_THRESHOLD && clientX <= rect.right + 40) {
        // Kéo sát mép phải -> bàn di chuyển sang trái (pan.x giảm)
        const dist = Math.max(0, rect.right - clientX);
        const ratio = 1 - dist / EDGE_THRESHOLD;
        vx = -Math.round(MAX_SPEED * Math.max(0.2, Math.min(1, ratio)));
      }

      // Kéo sát mép trên -> bàn di chuyển xuống dưới (pan.y tăng)
      if (clientY < rect.top + EDGE_THRESHOLD && clientY >= rect.top - 40) {
        const dist = Math.max(0, clientY - rect.top);
        const ratio = 1 - dist / EDGE_THRESHOLD;
        vy = Math.round(MAX_SPEED * Math.max(0.2, Math.min(1, ratio)));
      } else if (clientY > rect.bottom - EDGE_THRESHOLD && clientY <= rect.bottom + 40) {
        // Kéo sát mép dưới -> bàn di chuyển lên trên (pan.y giảm)
        const dist = Math.max(0, rect.bottom - clientY);
        const ratio = 1 - dist / EDGE_THRESHOLD;
        vy = -Math.round(MAX_SPEED * Math.max(0.2, Math.min(1, ratio)));
      }

      edgeVelocityRef.current = { vx, vy };

      if ((vx !== 0 || vy !== 0) && !autoPanLoopRunningRef.current) {
        autoPanLoopRunningRef.current = true;
        startAutoPanLoop();
      }
    },
    [startAutoPanLoop]
  );

  // Kéo di chuyển tài liệu với window listeners toàn cục (không bao giờ mất dấu dù lia chuột siêu nhanh)
  const handleItemDragStart = useCallback(
    (e: React.PointerEvent, key: string) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const currentZoom = zoomScaleRef.current;
      const currentPan = panRef.current;
      const currentPos = getItemPosition(key);

      const cursorCanvasX = (e.clientX - rect.left - currentPan.x) / currentZoom;
      const cursorCanvasY = (e.clientY - rect.top - currentPan.y) / currentZoom;

      const grabOffsetX = cursorCanvasX - currentPos.x;
      const grabOffsetY = cursorCanvasY - currentPos.y;

      setActiveDraggingId(key);
      draggingItemRef.current = {
        id: key,
        grabOffsetX,
        grabOffsetY,
      };
      lastPointerPosRef.current = { clientX: e.clientX, clientY: e.clientY };

      const onGlobalPointerMove = (moveEvt: PointerEvent) => {
        if (!draggingItemRef.current) return;
        lastPointerPosRef.current = { clientX: moveEvt.clientX, clientY: moveEvt.clientY };

        const c = containerRef.current;
        if (!c) return;
        const r = c.getBoundingClientRect();
        const zoom = zoomScaleRef.current;
        const panVal = panRef.current;
        const { id, grabOffsetX: offX, grabOffsetY: offY } = draggingItemRef.current;

        const newDocX = Math.round(
          (moveEvt.clientX - r.left - panVal.x) / zoom - offX
        );
        const newDocY = Math.round(
          (moveEvt.clientY - r.top - panVal.y) / zoom - offY
        );

        setCustomPositions((prev) => ({
          ...prev,
          [id]: { x: newDocX, y: newDocY },
        }));

        checkAndTriggerEdgePan(moveEvt.clientX, moveEvt.clientY);
      };

      const onGlobalPointerUp = () => {
        window.removeEventListener("pointermove", onGlobalPointerMove);
        window.removeEventListener("pointerup", onGlobalPointerUp);
        window.removeEventListener("pointercancel", onGlobalPointerUp);

        if (autoPanRafRef.current) {
          cancelAnimationFrame(autoPanRafRef.current);
          autoPanRafRef.current = null;
        }
        edgeVelocityRef.current = { vx: 0, vy: 0 };
        autoPanLoopRunningRef.current = false;

        draggingItemRef.current = null;
        setActiveDraggingId(null);

        // Lưu vị trí vào localStorage
        setCustomPositions((latest) => {
          try {
            localStorage.setItem(storagePosKey, JSON.stringify(latest));
          } catch {}

          // Nếu đây là sticky note, đồng bộ toạ độ mới x, y vào stickyNotes và sync qua Group Play
          if (key.startsWith("note_") || stickyNotesRef.current.some((n) => n.id === key)) {
            const finalPos = latest[key];
            if (finalPos) {
              const updatedNotes = stickyNotesRef.current.map((n) =>
                n.id === key ? { ...n, x: finalPos.x, y: finalPos.y } : n
              );
              setStickyNotes(updatedNotes);
              try {
                localStorage.setItem(storageNotesKey, JSON.stringify(updatedNotes));
              } catch {}
              if (roomCode) {
                syncUpdate({ canvasNotes: updatedNotes });
              }
            }
          }

          return latest;
        });
      };

      window.addEventListener("pointermove", onGlobalPointerMove);
      window.addEventListener("pointerup", onGlobalPointerUp);
      window.addEventListener("pointercancel", onGlobalPointerUp);
    },
    [getItemPosition, checkAndTriggerEdgePan, storagePosKey, storageNotesKey, roomCode, syncUpdate]
  );

  const handleItemPointerMove = useCallback((_e: React.PointerEvent) => {
    // Được xử lý qua global pointermove
  }, []);

  const handleItemPointerUp = useCallback((_e: React.PointerEvent) => {
    // Được xử lý qua global pointerup
  }, []);

  // Huỷ RAF khi unmount
  useEffect(() => {
    return () => {
      if (autoPanRafRef.current) {
        cancelAnimationFrame(autoPanRafRef.current);
      }
    };
  }, []);

  // Xác định mã đang được chọn (Selected Tag / Code)
  const currentSelectedCode = useMemo(() => {
    if (!selectedView) return null;
    return selectedView.data.code || selectedView.data.id || null;
  }, [selectedView]);

  // Function to smoothly center & focus camera onto a document element
  const focusOnElement = useCallback((elementId: string, smoothZoom = 0.85) => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
      const el = document.getElementById(elementId);
      if (!container || !el) return;

      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const currentZoom = zoomScaleRef.current;
      const currentPan = panRef.current;

      const elementLocalX =
        (elRect.left - containerRect.left - currentPan.x) / currentZoom;
      const elementLocalY =
        (elRect.top - containerRect.top - currentPan.y) / currentZoom;
      const elementWidth = elRect.width / currentZoom;
      const elementHeight = elRect.height / currentZoom;

      const targetZoom = Math.min(1.2, Math.max(0.65, smoothZoom));

      const targetPanX = Math.round(
        containerRect.width / 2 - (elementLocalX + elementWidth / 2) * targetZoom
      );
      const targetPanY = Math.round(
        containerRect.height / 2 -
          (elementLocalY + Math.min(elementHeight, 650) / 2) * targetZoom
      );

      const newPan = { x: targetPanX, y: targetPanY };
      panRef.current = newPan;
      zoomScaleRef.current = targetZoom;
      setPan(newPan);
      setZoomScale(targetZoom);
    });
  }, []);

  // Tìm kiếm nội dung văn bản / chữ trong toàn bộ hồ sơ vụ án
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results: {
      id: string;
      code: string;
      title: string;
      elementId: string;
      snippet: string;
      count: number;
    }[] = [];

    // 1. Tìm trong Biên bản Lời Khai
    lkDocuments.forEach((doc) => {
      const code = doc.tag_code || "";
      const rawContent: any = doc.content || {};
      const title = rawContent.docTitle || `Lời khai: ${doc.subject_name}`;

      let allText = `${code} ${title} ${doc.subject_name || ""} ${rawContent.summary || ""}`;
      if (Array.isArray(rawContent.statements)) {
        rawContent.statements.forEach((st: any) => {
          allText += ` ${st.question || ""} ${st.answer || ""} ${st.note || ""}`;
        });
      }

      const lowerText = allText.toLowerCase();
      if (lowerText.includes(q)) {
        const matchIdx = lowerText.indexOf(q);
        const start = Math.max(0, matchIdx - 25);
        const end = Math.min(allText.length, matchIdx + q.length + 35);
        const snippet =
          (start > 0 ? "..." : "") +
          allText.slice(start, end).trim() +
          (end < allText.length ? "..." : "");
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const count = (lowerText.match(new RegExp(escaped, "g")) || []).length;

        results.push({
          id: `lk_${code}`,
          code,
          title,
          elementId: `board-doc-${code}`,
          snippet,
          count,
        });
      }
    });

    // 2. Tìm trong Lý Lịch Bị Can
    hsDocuments.forEach((doc) => {
      const code = doc.tag_code || "";
      const rawContent: any = doc.content || {};
      const title = `Lý lịch: ${rawContent.fullName || doc.subject_name || code}`;

      let allText = `${code} ${title} ${doc.subject_name || ""} ${rawContent.fullName || ""} ${rawContent.alias || ""} ${rawContent.job || ""} ${rawContent.motiveNotes || ""} ${rawContent.alibiNotes || ""} ${rawContent.contradictionNotes || ""}`;
      if (Array.isArray(rawContent.timeline)) {
        rawContent.timeline.forEach((t: any) => {
          allText += ` ${t.time || ""} ${t.action || ""} ${t.location || ""}`;
        });
      }

      const lowerText = allText.toLowerCase();
      if (lowerText.includes(q)) {
        const matchIdx = lowerText.indexOf(q);
        const start = Math.max(0, matchIdx - 25);
        const end = Math.min(allText.length, matchIdx + q.length + 35);
        const snippet =
          (start > 0 ? "..." : "") +
          allText.slice(start, end).trim() +
          (end < allText.length ? "..." : "");
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const count = (lowerText.match(new RegExp(escaped, "g")) || []).length;

        results.push({
          id: `hs_${code}`,
          code,
          title,
          elementId: `board-dossier-${code}`,
          snippet,
          count,
        });
      }
    });

    // 3. Tìm trong Tài liệu PDF
    unmappedPdfItems.forEach((item) => {
      const pdf = item.data as PDFDocument;
      const code = pdf.code || "";
      const title = pdf.title || "";
      const allText = `${code} ${title} ${(pdf as any).core_content || ""}`;
      const lowerText = allText.toLowerCase();

      if (lowerText.includes(q)) {
        const matchIdx = lowerText.indexOf(q);
        const start = Math.max(0, matchIdx - 25);
        const end = Math.min(allText.length, matchIdx + q.length + 35);
        const snippet =
          (start > 0 ? "..." : "") +
          allText.slice(start, end).trim() +
          (end < allText.length ? "..." : "");
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const count = (lowerText.match(new RegExp(escaped, "g")) || []).length;

        results.push({
          id: `pdf_${code || pdf.id}`,
          code,
          title,
          elementId: `board-unmapped-${code || pdf.id}`,
          snippet,
          count,
        });
      }
    });

    // 4. Tìm trong Vật Chứng Hiện Trường
    evidenceItems.forEach((item) => {
      const ev = item.data as PhysicalEvidence;
      const code = ev.code || "";
      const title = ev.title || "";
      const allText = `${code} ${title} ${ev.preview || ""} ${(ev as any).description || ""}`;
      const lowerText = allText.toLowerCase();

      if (lowerText.includes(q)) {
        const matchIdx = lowerText.indexOf(q);
        const start = Math.max(0, matchIdx - 25);
        const end = Math.min(allText.length, matchIdx + q.length + 35);
        const snippet =
          (start > 0 ? "..." : "") +
          allText.slice(start, end).trim() +
          (end < allText.length ? "..." : "");
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const count = (lowerText.match(new RegExp(escaped, "g")) || []).length;

        results.push({
          id: `ev_${code || ev.id}`,
          code,
          title,
          elementId: `board-evidence-${code || ev.id}`,
          snippet,
          count,
        });
      }
    });

    return results;
  }, [searchQuery, lkDocuments, hsDocuments, unmappedPdfItems, evidenceItems]);

  const handleSelectSearchResult = useCallback(
    (item: (typeof searchResults)[0], index?: number) => {
      if (typeof index === "number") {
        setCurrentSearchIndex(index);
      }
      setFocusedTag(item.code);
      focusOnElement(item.elementId, 0.95);
    },
    [focusOnElement]
  );

  const handleNextSearch = useCallback(() => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentSearchIndex + 1) % searchResults.length;
    handleSelectSearchResult(searchResults[nextIdx], nextIdx);
  }, [searchResults, currentSearchIndex, handleSelectSearchResult]);

  const handlePrevSearch = useCallback(() => {
    if (searchResults.length === 0) return;
    const prevIdx =
      (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    handleSelectSearchResult(searchResults[prevIdx], prevIdx);
  }, [searchResults, currentSearchIndex, handleSelectSearchResult]);

  // Hoàn tác (Undo) nét vẽ gần nhất
  const handleUndo = useCallback(() => {
    const item = popAnnotationUndo();
    if (item) {
      window.dispatchEvent(
        new CustomEvent("dossier:annotation-undo", {
          detail: { documentId: item.documentId, strokeId: item.stroke.id },
        })
      );
    } else if (focusedTag) {
      // Fallback: nếu undoStack trống (ví dụ sau reload), hoàn tác nét cuối trên tài liệu đang focus
      window.dispatchEvent(
        new CustomEvent("dossier:annotation-undo", {
          detail: { documentId: focusedTag },
        })
      );
    }
  }, [focusedTag]);

  // Làm lại (Redo) nét vẽ vừa hoàn tác
  const handleRedo = useCallback(() => {
    const item = popAnnotationRedo();
    if (item) {
      window.dispatchEvent(
        new CustomEvent("dossier:annotation-redo", {
          detail: { documentId: item.documentId, stroke: item.stroke },
        })
      );
    }
  }, []);

  // Phím tắt bàn phím toàn cục: Ctrl+F (Tìm kiếm), Ctrl+Z (Hoàn tác nét vẽ), Ctrl+Shift+Z / Ctrl+Y (Làm lại nét vẽ)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        Boolean(target?.isContentEditable);

      // Nếu đang gõ văn bản trong input/textarea, nhường phím tắt cho trình duyệt xử lý văn bản
      if (isTyping) {
        if (e.key === "Escape" && isSearchOpen) {
          setIsSearchOpen(false);
        }
        return;
      }

      // 1. Phím tắt Ctrl+Z (Undo) & Ctrl+Shift+Z / Ctrl+Y (Redo) nét vẽ
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          return;
        }
        if (key === "y") {
          e.preventDefault();
          handleRedo();
          return;
        }
        if (key === "f") {
          e.preventDefault();
          setIsSearchOpen((prev) => {
            const next = !prev;
            if (next) {
              setTimeout(() => searchInputRef.current?.focus(), 80);
            }
            return next;
          });
          return;
        }
      }

      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, handleUndo, handleRedo]);

  // Tự động đóng hộp tìm kiếm và các menu popup khi nhấp chuột ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target) &&
        searchButtonRef.current &&
        !searchButtonRef.current.contains(target)
      ) {
        setIsSearchOpen(false);
      }
      if (penRef.current && !penRef.current.contains(target)) {
        setIsPenPopupOpen(false);
      }
      if (highlighterRef.current && !highlighterRef.current.contains(target)) {
        setIsHighlighterPopupOpen(false);
      }
      if (eraserRef.current && !eraserRef.current.contains(target)) {
        setIsEraserPopupOpen(false);
      }
      if (noteRef.current && !noteRef.current.contains(target)) {
        setIsNotePopupOpen(false);
      }
      if (
        themePopupRef.current &&
        !themePopupRef.current.contains(target) &&
        !(target as HTMLElement)?.closest?.("[data-user-nav]")
      ) {
        setIsThemePopupOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  // Lắng nghe sự kiện mở bảng màu từ Menu Avatar Admin
  useInvestigationEvent("OPEN_CANVAS_THEME", () => {
    setIsThemePopupOpen(true);
  });

  // CHỈ FOCUS LIA CAMERA KHI ĐƯỢC KÍCH HOẠT TỪ KHAY TÀI LIỆU (qua sự kiện FOCUS_CANVAS_DOC)
  // Khi người chơi ấn trực tiếp trên canvas: HOÀN TOÀN KHÔNG focus hay giật camera!
  useInvestigationEvent("FOCUS_CANVAS_DOC", (e: any) => {
    const code = e?.detail?.code || e?.detail?.id;
    if (!code) return;

    // 1. Kiểm tra xem có khớp với Dossier Studio Tag không
    const cleanCode = String(code).trim().toUpperCase();
    const mappedTag = CASE_000_DOSSIER_MAP[cleanCode] || cleanCode;
    const docEl = document.getElementById(`board-dossier-${mappedTag}`);
    if (docEl) {
      setFocusedTag(mappedTag);
      focusOnElement(`board-dossier-${mappedTag}`);
      return;
    }

    // 2. Kiểm tra xem có phải PDF Card không
    const pdfEl = document.getElementById(`board-pdf-${code}`);
    if (pdfEl) {
      setFocusedTag(code);
      focusOnElement(`board-pdf-${code}`);
      return;
    }

    // 3. Kiểm tra xem có phải Evidence Card không
    const evEl = document.getElementById(`board-evidence-${code}`);
    if (evEl) {
      setFocusedTag(code);
      focusOnElement(`board-evidence-${code}`);
    }
  });

  // Keyboard shortcut listener for Space (Hold Space to Pan canvas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space" && !e.repeat) {
        setIsSpacePressed(true);
        isSpacePressedRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        isSpacePressedRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Vector Zoom & Wheel Listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
        const currentZoom = zoomScaleRef.current;
        const newZoom = Math.min(
          2.0,
          Math.max(0.25, Math.round(currentZoom * zoomFactor * 100) / 100)
        );
        if (newZoom === currentZoom) return;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const currentPan = panRef.current;
        const newPan = {
          x: mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom),
          y: mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom),
        };

        panRef.current = newPan;
        zoomScaleRef.current = newZoom;
        setPan(newPan);
        setZoomScale(newZoom);
      } else {
        const currentPan = panRef.current;
        const currentZoom = zoomScaleRef.current;
        const rect = container.getBoundingClientRect();
        const deltaX = e.shiftKey ? e.deltaY : e.deltaX;
        const deltaY = e.shiftKey ? 0 : e.deltaY;

        // Giới hạn biên pan theo kích thước bàn hồ sơ 8000x5000
        const minPanX = -(8000 * currentZoom - rect.width * 0.5);
        const maxPanX = rect.width * 0.5;
        const minPanY = -(5000 * currentZoom - rect.height * 0.5);
        const maxPanY = rect.height * 0.5;

        const nextPanX = Math.min(maxPanX, Math.max(minPanX, currentPan.x - deltaX));
        const nextPanY = Math.min(maxPanY, Math.max(minPanY, currentPan.y - deltaY));

        const newPan = {
          x: nextPanX,
          y: nextPanY,
        };
        panRef.current = newPan;
        setPan(newPan);
      }
    };

    container.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onNativeWheel);
    };
  }, []);

  // Mouse Drag to Pan với global listeners (không bao giờ khựng/mất chuột)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Nếu đang trong quá trình kéo tài liệu -> tuyệt đối không pan bàn
    if (draggingItemRef.current) return;

    const target = e.target as HTMLElement;
    if (
      target?.tagName === "BUTTON" ||
      target?.closest("button") ||
      target?.tagName === "A" ||
      target?.closest("a") ||
      target?.closest("[data-dossier-card]") ||
      target?.closest("[data-drag-handle]") ||
      target?.closest("#dossier-floating-toolbar")
    ) {
      return;
    }

    // Nếu đang chọn công cụ vẽ (bút, dạ quang, tẩy) và bấm trên canvas vẽ thì nhường tương tác cho nét vẽ
    if (activeTool !== "cursor" && target?.tagName === "CANVAS") {
      return;
    }

    if (e.button === 1 || isSpacePressedRef.current || e.button === 0) {
      isPanningRef.current = true;
      setIsPanningState(true);
      const startX = e.clientX;
      const startY = e.clientY;
      const startPanX = panRef.current.x;
      const startPanY = panRef.current.y;

      const onWindowMouseMove = (moveEvent: MouseEvent) => {
        if (!isPanningRef.current) return;
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const currentZoom = zoomScaleRef.current;

        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        const rawPanX = startPanX + deltaX;
        const rawPanY = startPanY + deltaY;

        const minPanX = -(8000 * currentZoom - rect.width * 0.5);
        const maxPanX = rect.width * 0.5;
        const minPanY = -(5000 * currentZoom - rect.height * 0.5);
        const maxPanY = rect.height * 0.5;

        const clampedPanX = Math.min(maxPanX, Math.max(minPanX, rawPanX));
        const clampedPanY = Math.min(maxPanY, Math.max(minPanY, rawPanY));

        const nextPan = { x: clampedPanX, y: clampedPanY };
        panRef.current = nextPan;
        setPan(nextPan);
      };

      const onWindowMouseUp = () => {
        isPanningRef.current = false;
        setIsPanningState(false);
        window.removeEventListener("mousemove", onWindowMouseMove);
        window.removeEventListener("mouseup", onWindowMouseUp);
      };

      window.addEventListener("mousemove", onWindowMouseMove);
      window.addEventListener("mouseup", onWindowMouseUp);
    }
  }, [activeTool]);

  const handleMouseMove = useCallback((_e: React.MouseEvent) => {
    // Được xử lý qua global mousemove
  }, []);

  const handleMouseUp = useCallback(() => {
    // Được xử lý qua global mouseup
  }, []);

  // Zoom button helpers
  const handleZoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const currentZoom = zoomScaleRef.current;
    const newZoom = Math.min(2.0, Math.round(currentZoom * 1.2 * 10) / 10);
    const currentPan = panRef.current;
    const newPan = {
      x: centerX - (centerX - currentPan.x) * (newZoom / currentZoom),
      y: centerY - (centerY - currentPan.y) * (newZoom / currentZoom),
    };
    panRef.current = newPan;
    zoomScaleRef.current = newZoom;
    setPan(newPan);
    setZoomScale(newZoom);
  }, []);

  const handleZoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const currentZoom = zoomScaleRef.current;
    const newZoom = Math.max(0.25, Math.round((currentZoom / 1.2) * 10) / 10);
    const currentPan = panRef.current;
    const newPan = {
      x: centerX - (centerX - currentPan.x) * (newZoom / currentZoom),
      y: centerY - (centerY - currentPan.y) * (newZoom / currentZoom),
    };
    panRef.current = newPan;
    zoomScaleRef.current = newZoom;
    setPan(newPan);
    setZoomScale(newZoom);
  }, []);

  const handleResetZoom = useCallback(() => {
    panRef.current = { x: 80, y: 50 };
    zoomScaleRef.current = 0.8;
    setPan({ x: 80, y: 50 });
    setZoomScale(0.8);
  }, []);

  // Helper tìm item PDF trong danh sách tương ứng với Tag Code
  const findMatchingPdfItem = useCallback(
    (tagCode: string) => {
      const cleanTag = tagCode.trim().toUpperCase();
      return pdfItems.find((item) => {
        const code = item.data.code?.trim().toUpperCase();
        if (!code) return false;
        return (
          code === cleanTag ||
          CASE_000_DOSSIER_MAP[code]?.toUpperCase() === cleanTag
        );
      });
    },
    [pdfItems]
  );

  // Dynamic canvas background style based on active theme
  const canvasBackgroundStyle = useMemo(() => {
    return buildCanvasBackground(canvasTheme, zoomScale, pan);
  }, [canvasTheme, zoomScale, pan]);

  return (
    <div
      className="flex-1 min-w-0 min-h-0 border-0 rounded-none overflow-hidden flex flex-col h-full relative select-none transition-colors duration-300"
      style={{ backgroundColor: canvasTheme.outerBg }}
    >
      {/* Center Interactive Surface (Vector Workspace with customizable theme & lighting) */}
      <main
        data-tour="canvas-workspace"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={cn(
          "flex-1 h-full min-h-0 overflow-hidden relative select-none transition-colors duration-300",
          isPanningState
            ? "cursor-grabbing"
            : isSpacePressed
              ? "cursor-grab"
              : activeTool === "cursor"
                ? "cursor-grab"
                : "cursor-crosshair"
        )}
        style={canvasBackgroundStyle}
      >
        {/* Transform Surface Layer */}
        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoomScale})`,
            transformOrigin: "0 0",
            willChange: "transform",
            transition: isPanningState || Boolean(activeDraggingId)
              ? "none"
              : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            width: "8000px",
            height: "5000px",
          }}
          className="absolute top-0 left-0 relative select-none"
        >
          {/* ============================================================== */}
          {/* PHÂN KHU 0: BẢNG ĐIỀU TRA TRÊN MẶT BÀN (MAIN INVESTIGATION CANVAS) */}
          {/* ============================================================== */}
          {renderInvestigationBoard && (() => {
            const key = "inv_board";
            const pos = getItemPosition(key);
            const isDragging = activeDraggingId === key;

            return (
              <div
                key="inv_board"
                id="board-investigation-canvas"
                data-dossier-card="true"
                data-tour="canvas-desk-investigation-board"
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isDragging ? 55 : 12,
                  width: "896px",
                  height: "1200px",
                }}
                className={cn(
                  "relative select-none border-0 bg-transparent transition-shadow duration-150 group/board-item shadow-[0_20px_50px_rgba(0,0,0,0.85)]",
                  isDragging && "shadow-[0_35px_90px_rgba(0,0,0,0.95)] scale-[1.01]"
                )}
              >
                {/* Tay nắm kéo di chuyển nổi tinh tế (chỉ hiện khi hover ở đỉnh bảng) */}
                <div
                  data-drag-handle="true"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => handleItemDragStart(e, key)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 opacity-0 group-hover/board-item:opacity-100 transition-all duration-200 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/95 border border-amber-600/50 text-amber-200 shadow-xl cursor-grab active:cursor-grabbing text-[11px] font-mono whitespace-nowrap backdrop-blur-md select-none"
                  title="Nhấn giữ và kéo để di chuyển Bảng điều tra trên bàn"
                >
                  <GripHorizontal className="size-3.5 text-amber-400" />
                  <span>KÉO DI CHUYỂN BẢNG</span>
                </div>

                {/* Bảng điều tra Fullsize Không Viền */}
                <div className="w-full h-full relative overflow-hidden">
                  {renderInvestigationBoard}
                </div>
              </div>
            );
          })()}

          {/* ============================================================== */}
          {/* PHÂN KHU 1: HỒ SƠ & BIÊN BẢN LẤY LỜI KHAI (STATEMENTS)        */}
          {/* ============================================================== */}
          {lkDocuments.map((docItem) => {
            const key = `lk_${docItem.tag_code}`;
            const pos = getItemPosition(key);
            const isDragging = activeDraggingId === key;
            const docData = docItem.content as LoiKhaiData;
            const isSelected =
              focusedTag === docItem.tag_code ||
              currentSelectedCode === docItem.tag_code ||
              (selectedView?.type === "pdf" &&
                CASE_000_DOSSIER_MAP[selectedView.data.code?.toUpperCase() || ""] ===
                  docItem.tag_code);

            return (
              <div
                key={docItem.id}
                id={`board-dossier-${docItem.tag_code}`}
                data-dossier-card="true"
                data-tour="canvas-desk-cards"
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isDragging ? 50 : 10,
                }}
                className={cn(
                  "flex flex-col items-stretch gap-0 transition-shadow duration-150 select-none group/dossier-card",
                  isDragging && "shadow-[0_25px_60px_rgba(0,0,0,0.85)] scale-[1.01]"
                )}
              >
                {/* Document Card Header Bar with Drag Handle */}
                <div
                  data-drag-handle="true"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => handleItemDragStart(e, key)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  className="flex items-center justify-between w-full px-4 py-2.5 min-h-[46px] bg-[#16181d] border border-[#2d3139] border-b-0 rounded-t-lg text-xs font-mono cursor-grab active:cursor-grabbing select-none shadow-md transition-colors hover:bg-[#1e222a]"
                  title="Nhấn giữ và kéo để di chuyển tài liệu này trên bàn làm việc"
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 pr-3">
                    <GripHorizontal className="size-5 text-zinc-400 group-hover/dossier-card:text-zinc-200 transition-colors shrink-0" />
                    <span className="font-mono font-bold px-2.5 py-1 rounded text-xs bg-zinc-800/90 text-zinc-200 border border-zinc-700/80 shrink-0 tracking-wider shadow-sm">
                      {docItem.tag_code}
                    </span>
                    <span className="font-semibold text-sm sm:text-[15px] text-zinc-100 truncate tracking-wide">
                      {docData.docTitle
                        ? `${docData.docTitle} — ${docData.subjectName || docItem.subject_name}`
                        : `Biên bản ghi lời khai: ${docData.subjectName || docItem.subject_name}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-400 hidden md:inline">
                      KÉO ĐỂ DI CHUYỂN
                    </span>
                  </div>
                </div>

                {/* Diegetic Dossier Sheet Component with Annotation Layer */}
                <div
                  onClick={() => {
                    setFocusedTag(docItem.tag_code);
                    const matchingPdf = findMatchingPdfItem(docItem.tag_code);
                    if (matchingPdf) {
                      onSelectPdf(matchingPdf.data as PDFDocument);
                    }
                  }}
                  className="cursor-pointer relative"
                >
                  <DossierAnnotationLayer
                    documentId={docItem.tag_code || docItem.id}
                    activeTool={activeTool}
                    activeColor={activeAnnotationColor}
                    activeSize={activeAnnotationSize}
                    scale={zoomScale}
                    eraserMode={eraserMode}
                    eraserSize={18}
                    onClearTrigger={focusedTag === docItem.tag_code ? clearTrigger : undefined}
                  />
                  <DossierLoiKhaiSheet
                    docItem={docItem}
                    docData={docData}
                    docPaper={
                      docItem.paper_config || {
                        size: "A4",
                        orientation: "portrait",
                      }
                    }
                    isSelected={isSelected}
                    highlightEditable={false}
                    readOnly={true}
                  />
                </div>
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* PHÂN KHU 2: BẢN LÝ LỊCH BỊ CAN & HỒ SƠ TƯ PHÁP (RECORDS)       */}
          {/* ============================================================== */}
          {hsDocuments.map((docItem) => {
            const key = `hs_${docItem.tag_code}`;
            const pos = getItemPosition(key);
            const isDragging = activeDraggingId === key;
            const docData = docItem.content as LyLichData;
            const isSelected =
              focusedTag === docItem.tag_code ||
              currentSelectedCode === docItem.tag_code ||
              (selectedView?.type === "pdf" &&
                CASE_000_DOSSIER_MAP[selectedView.data.code?.toUpperCase() || ""] ===
                  docItem.tag_code);

            return (
              <div
                key={docItem.id}
                id={`board-dossier-${docItem.tag_code}`}
                data-dossier-card="true"
                data-tour="canvas-desk-cards"
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isDragging ? 50 : 10,
                }}
                className={cn(
                  "flex flex-col items-stretch gap-0 transition-shadow duration-150 select-none group/dossier-card",
                  isDragging && "shadow-[0_25px_60px_rgba(0,0,0,0.85)] scale-[1.01]"
                )}
              >
                {/* Document Card Header Bar with Drag Handle */}
                <div
                  data-drag-handle="true"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => handleItemDragStart(e, key)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  className="flex items-center justify-between w-full px-4 py-2.5 min-h-[46px] bg-[#16181d] border border-[#2d3139] border-b-0 rounded-t-lg text-xs font-mono cursor-grab active:cursor-grabbing select-none shadow-md transition-colors hover:bg-[#1e222a]"
                  title="Nhấn giữ và kéo để di chuyển tài liệu này trên bàn làm việc"
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 pr-3">
                    <GripHorizontal className="size-5 text-zinc-400 group-hover/dossier-card:text-zinc-200 transition-colors shrink-0" />
                    <span className="font-mono font-bold px-2.5 py-1 rounded text-xs bg-zinc-800/90 text-zinc-200 border border-zinc-700/80 shrink-0 tracking-wider shadow-sm">
                      {docItem.tag_code}
                    </span>
                    <span className="font-semibold text-sm sm:text-[15px] text-zinc-100 truncate tracking-wide">
                      {`Lý lịch bị can: ${docData.fullName || docItem.subject_name}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-400 hidden md:inline">
                      KÉO ĐỂ DI CHUYỂN
                    </span>
                  </div>
                </div>

                {/* Diegetic Dossier Sheet Component with Annotation Layer */}
                <div
                  onClick={() => {
                    setFocusedTag(docItem.tag_code);
                    const matchingPdf = findMatchingPdfItem(docItem.tag_code);
                    if (matchingPdf) {
                      onSelectPdf(matchingPdf.data as PDFDocument);
                    }
                  }}
                  className="cursor-pointer relative"
                >
                  <DossierAnnotationLayer
                    documentId={docItem.tag_code || docItem.id}
                    activeTool={activeTool}
                    activeColor={activeAnnotationColor}
                    activeSize={activeAnnotationSize}
                    scale={zoomScale}
                    eraserMode={eraserMode}
                    eraserSize={18}
                    onClearTrigger={focusedTag === docItem.tag_code ? clearTrigger : undefined}
                  />
                  <DossierLyLichSheet
                    docItem={docItem}
                    docData={docData}
                    docPaper={
                      docItem.paper_config || {
                        size: "A4",
                        orientation: "landscape",
                      }
                    }
                    isSelected={isSelected}
                    highlightEditable={false}
                    readOnly={true}
                    showSeal={true}
                  />
                </div>
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* PHÂN KHU 3: CÁC VĂN BẢN VỤ ÁN & PHÁP Y (A4 DIEGETIC SHEETS)    */}
          {/* ============================================================== */}
          {unmappedPdfItems.map((item) => {
            const pdf = item.data as PDFDocument;
            const itemCode = pdf.code || pdf.id;
            const key = `pdf_${itemCode}`;
            const pos = getItemPosition(key);
            const isDragging = activeDraggingId === key;
            const isSelected =
              focusedTag === itemCode || currentSelectedCode === itemCode;

            const normItemCode = itemCode?.toUpperCase().replace(/-/g, "");
            const isA01 = normItemCode === "A01" || pdf.title.toLowerCase().includes("cẩm nang");
            const isA04 = normItemCode === "A04" || pdf.title.toLowerCase().includes("khám nghiệm tử thi") || pdf.title.toLowerCase().includes("pháp y");
            const isA05 = normItemCode === "A05" || pdf.title.toLowerCase().includes("khám nghiệm hiện trường");

            return (
              <div
                key={`unmapped_pdf_${itemCode}`}
                id={`board-pdf-${itemCode}`}
                data-dossier-card="true"
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isDragging ? 50 : 10,
                }}
                className={cn(
                  "flex flex-col items-stretch gap-0 transition-shadow duration-150 select-none group/dossier-card",
                  isDragging && "shadow-[0_25px_60px_rgba(0,0,0,0.85)] scale-[1.01]"
                )}
              >
                {/* Document Card Header Bar with Drag Handle */}
                <div
                  data-drag-handle="true"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => handleItemDragStart(e, key)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  className="flex items-center justify-between w-full px-4 py-2.5 min-h-[46px] bg-[#16181d] border border-[#2d3139] border-b-0 rounded-t-lg text-xs font-mono cursor-grab active:cursor-grabbing select-none shadow-md transition-colors hover:bg-[#1e222a]"
                  title="Nhấn giữ và kéo để di chuyển tài liệu này trên bàn làm việc"
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 pr-3">
                    <GripHorizontal className="size-5 text-zinc-400 group-hover/dossier-card:text-zinc-200 transition-colors shrink-0" />
                    <span className="font-mono font-bold px-2.5 py-1 rounded text-xs bg-zinc-800/90 text-zinc-200 border border-zinc-700/80 shrink-0 tracking-wider shadow-sm">
                      {itemCode}
                    </span>
                    <span className="font-semibold text-sm sm:text-[15px] text-zinc-100 truncate tracking-wide">
                      {pdf.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-400 hidden md:inline">
                      KÉO ĐỂ DI CHUYỂN
                    </span>
                  </div>
                </div>

                {/* Diegetic Paper Sheet with Annotation Layer */}
                <div
                  onClick={() => {
                    setFocusedTag(itemCode);
                    onSelectPdf(pdf);
                  }}
                  className="cursor-pointer relative"
                >
                  <DossierAnnotationLayer
                    documentId={itemCode}
                    activeTool={activeTool}
                    activeColor={activeAnnotationColor}
                    activeSize={activeAnnotationSize}
                    scale={zoomScale}
                    eraserMode={eraserMode}
                    eraserSize={18}
                    onClearTrigger={focusedTag === itemCode ? clearTrigger : undefined}
                  />

                  {/* A4 Sheet Body */}
                  <div
                    style={{ width: "794px", minHeight: "1123px" }}
                    className={cn(
                      "bg-[#fbf7ee] text-[#1b1510] shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-[#d6c7b2] p-12 relative font-serif select-text flex flex-col justify-between transition-all",
                      isSelected && "ring-2 ring-amber-500/70 shadow-[0_20px_50px_rgba(217,160,102,0.25)]"
                    )}
                  >
                    <div>
                      {/* Administrative Header */}
                      <div className="text-center pb-6 border-b-2 border-[#1b1510] flex flex-col gap-1">
                        <p className="text-[12px] font-sans font-bold tracking-widest text-[#3d2c1e] uppercase">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </p>
                        <p className="text-[13px] font-sans font-medium tracking-wide text-[#594231] underline underline-offset-4">
                          Độc lập - Tự do - Hạnh phúc
                        </p>
                        <div className="mt-3 flex items-center justify-between text-[11px] font-sans text-[#6e533d]">
                          <span>CƠ QUAN CSĐT — CÔNG AN TP</span>
                          <span className="font-mono font-bold text-[#b91c1c] uppercase border border-[#b91c1c] px-2 py-0.5">
                            TÀI LIỆU MẬT #{itemCode}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="py-6 text-center flex flex-col gap-1.5">
                        <h1 className="text-2xl font-bold tracking-wide uppercase text-[#1b1510]">
                          {pdf.title}
                        </h1>
                        <p className="text-xs font-sans text-[#82654c]">
                          Bộ hồ sơ lưu trữ: <span className="font-semibold text-[#1b1510]">{pdf.dossierTitle || "Ban Đầu"}</span>
                        </p>
                      </div>

                      {/* Content */}
                      <div className="space-y-4 text-[15px] leading-relaxed text-[#2c221a] font-serif">
                        {isA01 ? (
                          <>
                            <div className="p-3 bg-[#ebe2d3] border-l-4 border-[#8c6b4f] text-xs font-sans text-[#4a3625]">
                              <strong>QUY TRÌNH TIẾP NHẬN VỤ ÁN & CHỈ ĐẠO ĐIỀU TRA:</strong> Yêu cầu Điều tra viên phụ trách tuân thủ nghiêm ngặt 5 bước tác chiến nghiệp vụ ban đầu dưới đây.
                            </div>
                            <div className="space-y-3 pt-2">
                              <div className="flex gap-2">
                                <span className="font-bold text-[#8c6b4f]">1.</span>
                                <p><strong>Khám nghiệm hiện trường & vật chứng:</strong> Tiến hành rà soát kỹ lưỡng các vật chứng tại hiện trường số 14 Đường Bờ Sông. Khai thác ảnh tư liệu hiện trường để phát hiện dấu vết mâu thuẫn.</p>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-bold text-[#8c6b4f]">2.</span>
                                <p><strong>Khai thác thiết bị số:</strong> Mở khóa và đối chiếu tin nhắn, lịch sử cuộc gọi và dữ liệu ngân hàng trên điện thoại nạn nhân để định vị các mối liên hệ khả nghi.</p>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-bold text-[#8c6b4f]">3.</span>
                                <p><strong>Thẩm tra đối tượng tình nghi:</strong> Triệu tập các nghi can trọng tâm, đối chiếu mâu thuẫn lời khai và chứng cứ ngoại phạm đã thu thập.</p>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-bold text-[#8c6b4f]">4.</span>
                                <p><strong>Thiết lập bảng điều tra:</strong> Nối kết các đường dây quan hệ, làm sáng tỏ động cơ và phương tiện gây án trên Bàn Điều Tra.</p>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-bold text-[#8c6b4f]">5.</span>
                                <p><strong>Hoàn tất hồ sơ cáo trạng:</strong> Kết luận hung thủ và nộp bản cáo trạng chính xác lên Viện Kiểm sát.</p>
                              </div>
                            </div>
                          </>
                        ) : isA04 ? (
                          <>
                            <div className="p-3 bg-[#ebe2d3] border-l-4 border-[#b91c1c] text-xs font-sans text-[#4a3625]">
                              <strong>KẾT LUẬN GIÁM ĐỊNH PHÁP Y TỬ THI:</strong> Căn cứ biên bản giám định pháp y số 48/GĐPY-TTPY ngày 25/07/2016 đối với tử thi Nguyễn Văn Khang.
                            </div>
                            <div className="space-y-3 pt-2 text-sm leading-relaxed">
                              <div>
                                <p className="font-bold text-[#1b1510]">I. THÔNG TIN NẠN NHÂN:</p>
                                <p>Họ và tên: <span className="font-semibold">Nguyễn Văn Khang</span> — Sinh ngày: 04/08/1988.</p>
                                <p>Nơi cư trú: Số 14 Đường Bờ Sông, Phường Vĩnh Tuy, TP Hà Nội.</p>
                              </div>
                              <div>
                                <p className="font-bold text-[#1b1510]">II. DẤU VẾT THƯƠNG TÍCH NGOÀI DA:</p>
                                <p>• Vết bầm tím kích thước 3x2cm ở vùng trán trái và gò má, bờ mép không rách da, hình thành do va đập với vật tày diện rộng.</p>
                                <p>• Vùng cổ: Xuất hiện các điểm xuất huyết li ti dưới da; không phát hiện rãnh hằn dây thắt hay vết siết cơ học bằng dây.</p>
                                <p>• Các đầu ngón tay tím tái, niêm mạc mắt và vòm họng xuất huyết dạng chấm điển hình của tình trạng ngạt cấp.</p>
                              </div>
                              <div>
                                <p className="font-bold text-[#1b1510]">III. KẾT LUẬN NGUYÊN NHÂN TỬ VONG:</p>
                                <p>• <strong>Nguyên nhân tử vong:</strong> Ngạt thở cấp do thiếu dưỡng khí trong không gian kín (ngạt cơ học / ngạt khí).</p>
                                <p>• <strong>Thời gian tử vong ước tính:</strong> Trong khoảng từ <span className="font-bold text-[#b91c1c]">20:30 đến 21:00 ngày 24/07/2016</span>.</p>
                                <p>• Không phát hiện nồng độ độc chất hay thuốc an thần trong máu và dịch dạ dày.</p>
                              </div>
                            </div>
                          </>
                        ) : isA05 ? (
                          <>
                            <div className="p-3 bg-[#ebe2d3] border-l-4 border-[#8c6b4f] text-xs font-sans text-[#4a3625]">
                              <strong>BIÊN BẢN KHÁM NGHIỆM HIỆN TRƯỜNG:</strong> Lập hồi 07:00 ngày 25/07/2016 tại căn nhà cấp 4 số 14 Đường Bờ Sông.
                            </div>
                            <div className="space-y-3 pt-2 text-sm leading-relaxed">
                              <div>
                                <p className="font-bold text-[#1b1510]">I. TÌNH TRẠNG HIỆN TRƯỜNG:</p>
                                <p>• Cửa chính khép nhưng không khóa chốt trong. Cửa sổ hông hướng ra đường ray tàu hỏa hé mở 15cm.</p>
                                <p>• Phòng khách: Bàn uống nước bị xô lệch, một ấm trà gốm hoa cúc vỡ vụn dưới sàn gạch men, nước chè đã khô quánh, dính vết máu nhỏ văng (ký hiệu mẫu M1).</p>
                                <p>• Phòng ngủ: Chiếc tủ gỗ đứng cao 1m80, then cài kim loại bên ngoài đang ở trạng thái sập chốt đóng chặt.</p>
                              </div>
                              <div>
                                <p className="font-bold text-[#1b1510]">II. TANG VẬT VÀ DẤU VẾT THU GIỮ BAN ĐẦU:</p>
                                <p>1. 01 điện thoại di động iPhone dính dấu vân tay mờ rơi gần chân ghế sô-pha (ký hiệu ev-10).</p>
                                <p>2. Xấp tài liệu giấy tờ liên quan đơn từ tranh chấp quyền sử dụng đất vương vãi trên sàn.</p>
                                <p>3. Các mảnh sành sứ vỡ của ấm trà dính dấu vết sinh học gửi giám định AND phòng KTHS.</p>
                              </div>
                                {/* Nút CTA Khám xét 360 trực tiếp từ biên bản hiện trường */}
                                <div className="mt-4 pt-3 border-t border-[#8c6b4f]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#ebe2d3]/50 p-2.5 rounded">
                                  <div className="text-[11px] font-mono text-[#5c4033]">
                                    Tư liệu ảnh 360° toàn cảnh hiện trường vụ án:
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      detectiveAudio.playGlassSound();
                                      emitInvestigationEvent("OPEN_REINVESTIGATE");
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2b170c] hover:bg-[#422413] border border-[#8c6b4f] text-[#f5ebd9] text-xs font-mono font-bold rounded shadow transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                                    title="Mở toàn cảnh khám xét hiện trường 360 độ"
                                  >
                                    <Compass className="size-3.5 text-amber-400" />
                                    <span>Khám xét hiện trường 360°</span>
                                  </button>
                                </div>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-3">
                            <p className="italic text-[#7a6452]">
                              Tài liệu nghiệp vụ lưu chiểu chính thức của cơ quan điều tra. Đang được niêm phong theo hồ sơ số {itemCode}.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Official Stamp & Signature */}
                    <div className="mt-12 pt-6 border-t border-[#d6c7b2] flex items-center justify-between">
                      <div className="flex items-center gap-2 border-2 border-[#b91c1c] text-[#b91c1c] px-3 py-1.5 rounded rotate-[-4deg]">
                        <Stamp className="size-4" />
                        <div className="flex flex-col text-[10px] font-sans font-bold leading-tight">
                          <span>CƠ QUAN CSĐT</span>
                          <span>ĐÃ DUYỆT LƯU TRỮ</span>
                        </div>
                      </div>

                      <div className="text-right text-xs font-sans text-[#594231]">
                        <p className="font-bold">THỦ TRƯỞNG CƠ QUAN ĐIỀU TRA</p>
                        <p className="text-[10px] italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                        <div className="h-8 flex items-center justify-end font-serif italic text-base text-[#1b1510] opacity-80">
                          Thượng tá Nguyễn Văn Q.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* PHÂN KHU 4: VẬT CHỨNG & ẢNH ĐIỀU TRA (EVIDENCE PHOTOS)         */}
          {/* ============================================================== */}
          {evidenceItems.map((item) => {
            const ev = item.data as PhysicalEvidence;
            const itemCode = ev.code || ev.id;
            const key = `ev_${itemCode}`;
            const pos = getItemPosition(key);
            const isDragging = activeDraggingId === key;
            const isSelected =
              focusedTag === itemCode || currentSelectedCode === itemCode;
            const photoUrl = normalizeImageUrl(ev.thumbnail);

            return (
              <div
                key={`evidence_${itemCode}`}
                id={`board-evidence-${itemCode}`}
                data-dossier-card="true"
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isDragging ? 50 : isSelected ? 20 : 10,
                }}
                className={cn(
                  "w-[280px] bg-[#16181d] rounded-lg overflow-hidden flex flex-col shadow-xl transition-all duration-150 select-none group/evidence-card",
                  isSelected
                    ? "ring-2 ring-amber-500/90 shadow-[0_12px_32px_rgba(245,158,11,0.25)]"
                    : "border border-zinc-800/80 hover:border-zinc-700",
                  isDragging && "shadow-[0_25px_60px_rgba(0,0,0,0.95)] scale-[1.02]"
                )}
              >
                {/* Header thanh tiêu đề trên cùng (kiêm drag handle) */}
                <div
                  data-drag-handle="true"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => handleItemDragStart(e, key)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  className="flex items-center justify-between px-2.5 py-2 min-h-[36px] bg-[#1a1d24] border-b border-zinc-800/90 text-xs font-mono cursor-grab active:cursor-grabbing select-none group-hover/evidence-card:bg-[#20242d] transition-colors"
                  title="Nhấn giữ và kéo để di chuyển ảnh trên bàn làm việc"
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 pr-1">
                    <GripHorizontal className="size-4 text-zinc-400 group-hover/evidence-card:text-zinc-200 transition-colors shrink-0" />
                    {ev.code && (
                      <span className="font-mono text-[11px] font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60 shrink-0">
                        {ev.code}
                      </span>
                    )}
                    <span className="font-sans font-semibold text-xs text-zinc-200 truncate tracking-wide">
                      {ev.title}
                    </span>
                  </div>
                </div>

                {/* Ảnh vật chứng tràn viền clean, không khung viền thừa, không mô tả */}
                <div
                  onClick={() => {
                    setFocusedTag(itemCode);
                    onSelectEvidence(ev);
                  }}
                  className="w-full aspect-[4/3] bg-black/80 relative overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover select-none"
                    />
                  ) : (
                    <ImageIcon className="size-8 text-zinc-600" />
                  )}
                </div>
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* PHÂN KHU 5: CÁC GIẤY DÁN NOTE VUÔNG (STICKY NOTES)            */}
          {/* ============================================================== */}
          {stickyNotes.map((note) => {
            const pos =
              activeDraggingId === note.id && customPositions[note.id]
                ? customPositions[note.id]
                : { x: note.x, y: note.y };
            const isDragging = activeDraggingId === note.id;
            const colorConfig = STICKY_NOTE_COLORS.find((c) => c.color === note.color) || STICKY_NOTE_COLORS[0];

            return (
              <div
                key={note.id}
                id={`sticky-note-${note.id}`}
                data-dossier-card="true"
                data-drag-handle="true"
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === "TEXTAREA" || target.closest("button")) return;
                  handleItemDragStart(e, note.id);
                }}
                onPointerMove={handleItemPointerMove}
                onPointerUp={handleItemPointerUp}
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  backgroundColor: colorConfig.color,
                  zIndex: isDragging ? 60 : 25,
                }}
                className={cn(
                  "w-56 min-h-56 p-3.5 pt-2.5 rounded-sm shadow-[0_4px_16px_rgba(0,0,0,0.25),0_1px_4px_rgba(0,0,0,0.12)] flex flex-col group transition-shadow select-none border border-black/10 relative cursor-grab active:cursor-grabbing",
                  isDragging && "shadow-[0_12px_28px_rgba(0,0,0,0.4)] scale-[1.02]"
                )}
              >
                {/* Nút đổi màu nhanh - Chỉ hiện khi hover ở góc trên trái, bấm vào xoay vòng 6 màu */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeNoteColor(note.id);
                  }}
                  className="absolute top-1.5 left-1.5 z-20 size-4 rounded-full border border-black/25 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:scale-125 transition-all cursor-pointer shadow-xs"
                  style={{ backgroundColor: colorConfig.border }}
                  title="Nhấn để đổi màu giấy note"
                />

                {/* Nút xóa note - Hoàn toàn ẩn, CHỈ HIỆN KHI HOVER ở góc trên phải (không đẩy dòng chữ xuống) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStickyNote(note.id);
                  }}
                  className="absolute top-1.5 right-1.5 z-20 size-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-black/15 transition-all cursor-pointer"
                  title="Xóa ghi chú này"
                >
                  <X className="size-3.5" style={{ color: colorConfig.text }} />
                </button>

                {/* Dải mép trên nhẹ để kéo thả note */}
                <div
                  className="w-full h-2 cursor-grab active:cursor-grabbing shrink-0"
                  title="Nhấn giữ để kéo di chuyển tờ note trên bàn"
                />

                {/* Textarea nhập nội dung ghi chú - BẮT ĐẦU NGAY TỪ DÒNG ĐẦU TIÊN */}
                <textarea
                  value={note.content}
                  onFocus={() => {
                    typingNoteIdRef.current = note.id;
                  }}
                  onBlur={() => handleBlurStickyNote(note.id)}
                  onChange={(e) => handleUpdateStickyNote(note.id, e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder="Ghi chú điều tra... (Nhập văn bản tại đây)"
                  style={{ color: colorConfig.text }}
                  className="w-full flex-1 bg-transparent resize-none outline-none font-sans text-xs leading-relaxed placeholder:opacity-40 cursor-text select-text pr-3"
                  rows={8}
                />

                {note.authorName && (
                  <div
                    style={{ color: colorConfig.text }}
                    className="text-[9px] font-mono tracking-wider opacity-40 mt-1 select-none pointer-events-none text-right truncate shrink-0"
                  >
                    — {note.authorName}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* FLOATING TOOLBAR PHÍA DƯỚI MÀN HÌNH (THIẾT KẾ GỌN GÀNG, KHÔNG BAO GIỜ BỊ TRÀN HAY THỌT NÚT) */}
      <div
        id="dossier-floating-toolbar"
        data-tour="canvas-bottom-toolbar"
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          "fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl w-max max-w-[calc(100vw-2rem)] select-none overflow-visible transition-all duration-300 ease-in-out backdrop-blur-2xl",
          isLight
            ? "bg-white/98 border border-zinc-200 shadow-[0_16px_40px_rgba(0,0,0,0.12)] text-zinc-800"
            : "bg-[#121418]/98 border border-[#353945] shadow-[0_16px_48px_rgba(0,0,0,0.9)] text-zinc-300",
          isBoardFullscreen
            ? "opacity-0 pointer-events-none translate-y-8 scale-95"
            : "opacity-100 pointer-events-auto translate-y-0 scale-100"
        )}
      >
        {/* BẢNG TÌM KIẾM CHỮ TRONG TÀI LIỆU FLOATING (KHÔNG VIỀN, KHÔNG DẤU X, CLICK RA NGOÀI LÀ TỰ ĐÓNG) */}
        {isSearchOpen && (
          <div
            ref={searchContainerRef}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[420px] max-w-[calc(100vw-2rem)] bg-[#121418]/98 backdrop-blur-2xl rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.95)] p-2.5 flex flex-col gap-2 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Input bar (Không viền, Không nút X) */}
            <div className="flex items-center gap-2.5 bg-[#1b1e26] px-3 py-2 rounded-xl">
              <Search className="size-4 text-zinc-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentSearchIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (e.shiftKey) {
                      handlePrevSearch();
                    } else {
                      handleNextSearch();
                    }
                  }
                }}
                placeholder="Tìm từ khóa trong hồ sơ (VD: dao, vân tay, 21h30...)"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 outline-none font-sans"
              />
            </div>

            {/* Kết quả tìm kiếm */}
            {searchQuery.trim().length >= 2 && (
              <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto custom-scrollbar pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1 pb-1 border-b border-zinc-800/80">
                  <span>
                    {searchResults.length > 0
                      ? `Tìm thấy trong ${searchResults.length} tài liệu`
                      : "Không tìm thấy kết quả phù hợp"}
                  </span>
                  {searchResults.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>
                        {currentSearchIndex + 1}/{searchResults.length}
                      </span>
                      <button
                        type="button"
                        onClick={handlePrevSearch}
                        className="size-5 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-300 cursor-pointer"
                        title="Tài liệu trước"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={handleNextSearch}
                        className="size-5 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-300 cursor-pointer"
                        title="Tài liệu tiếp theo"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>

                {searchResults.map((res, idx) => {
                  const isCurrent = idx === currentSearchIndex;
                  return (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(res, idx)}
                      className={cn(
                        "w-full text-left p-2 rounded-lg transition-colors cursor-pointer flex flex-col gap-0.5",
                        isCurrent
                          ? "bg-zinc-800/90 text-white"
                          : "hover:bg-zinc-800/40 text-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {res.code}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">
                          {res.count} lần xuất hiện
                        </span>
                      </div>
                      <span className="text-xs font-medium text-zinc-200 truncate">
                        {res.title}
                      </span>
                      <p className="text-[11px] font-sans text-zinc-400 line-clamp-1 italic">
                        {res.snippet}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 1. CỤM CÔNG CỤ VẼ & TƯƠNG TÁC */}
        {/* NÚT BÀN TAY (PAN / CON TRỎ CHUỘT) */}
        <button
          type="button"
          onClick={() => {
            setActiveTool("cursor");
            setIsPenPopupOpen(false);
            setIsHighlighterPopupOpen(false);
            setIsNotePopupOpen(false);
            setIsThemePopupOpen(false);
          }}
          className={cn(
            "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
            activeTool === "cursor"
              ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
              : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70")
          )}
          title="Bàn tay (Di chuyển góc nhìn & kéo tài liệu)"
        >
          <Hand className="size-4.5" />
        </button>

        {/* NÚT BÚT VẼ (PEN TOOL) & POPUP CHỌN MÀU + ĐỘ DÀY (FIGMA STYLE) */}
        <div className="relative shrink-0 flex items-center gap-0.5" ref={penRef}>
          {/* Icon chính: Chỉ kích hoạt bút, không mở popup màu */}
          <button
            type="button"
            onClick={() => {
              setActiveTool("pen");
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
            }}
            className={cn(
              "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
              activeTool === "pen"
                ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
                : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70")
            )}
            title="Bút vẽ hồ sơ"
          >
            <Pen className="size-4.5" />
          </button>

          {/* Mũi tên nhỏ tách rời: Ấn vào mới mở bảng đổi màu */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTool("pen");
              setIsHighlighterPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              setIsPenPopupOpen((prev) => !prev);
            }}
            className={cn(
              "p-1 rounded-md transition-all cursor-pointer flex items-center justify-center shrink-0",
              isLight
                ? (isPenPopupOpen ? "text-amber-600 bg-zinc-100 rotate-180" : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100")
                : (isPenPopupOpen ? "text-[#f5c344] bg-zinc-800/90 rotate-180" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80")
            )}
            title="Chọn màu & độ dày nét vẽ"
          >
            <ChevronDown className="size-3 stroke-[2.5]" />
          </button>

          {/* BẢNG CHỌN MÀU & ĐỘ DÀY BÚT VẼ (KHÔNG CHỮ - PURE FIGMA STYLE) */}
          {isPenPopupOpen && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute bottom-full left-0 mb-3 p-2 bg-[#121418]/98 backdrop-blur-2xl rounded-xl shadow-2xl flex flex-col gap-2 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100 border-0"
            >
              {/* 6 màu nét vẽ */}
              <div className="flex items-center gap-1.5 px-0.5">
                {PEN_PALETTE.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPenColor(p.color);
                      setActiveTool("pen");
                    }}
                    style={{ backgroundColor: p.color }}
                    className={cn(
                      "size-6 rounded-full transition-transform cursor-pointer border border-white/20 hover:scale-115 shadow-sm",
                      penColor === p.color &&
                        "scale-125 ring-2 ring-[#f5c344] ring-offset-2 ring-offset-[#121418]"
                    )}
                    title={p.label}
                  />
                ))}
              </div>

              {/* Phân cách */}
              <div className="w-full h-[1px] bg-zinc-800 my-0.5" />

              {/* 4 độ dày nét */}
              <div className="flex items-center justify-between gap-1 px-0.5">
                {PEN_SIZES.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPenSize(s.size);
                      setActiveTool("pen");
                    }}
                    className={cn(
                      "size-7 flex items-center justify-center rounded-lg transition-all cursor-pointer",
                      penSize === s.size
                        ? "bg-zinc-800 text-[#f5c344] ring-1 ring-[#f5c344]"
                        : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
                    )}
                    title={`Nét ${s.label} (${s.size}px)`}
                  >
                    <span
                      style={{ backgroundColor: penColor }}
                      className={cn("rounded-full", s.dot)}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* NÚT BÚT DẠ QUANG HIGHLIGHTER & POPUP CHỌN MÀU + BẢN TÔ (FIGMA STYLE) */}
        <div className="relative shrink-0 flex items-center gap-0.5" ref={highlighterRef}>
          {/* Icon chính: Chỉ kích hoạt dạ quang, không mở popup màu */}
          <button
            type="button"
            onClick={() => {
              setActiveTool("highlighter");
              setIsPenPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
            }}
            className={cn(
              "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
              activeTool === "highlighter"
                ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
                : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70")
            )}
            title="Bút nhớ dạ quang"
          >
            <Highlighter className="size-4.5" />
          </button>

          {/* Mũi tên nhỏ tách rời: Ấn vào mới mở bảng đổi màu */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTool("highlighter");
              setIsPenPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              setIsHighlighterPopupOpen((prev) => !prev);
            }}
            className={cn(
              "p-1 rounded-md transition-all cursor-pointer flex items-center justify-center shrink-0",
              isLight
                ? (isHighlighterPopupOpen ? "text-amber-600 bg-zinc-100 rotate-180" : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100")
                : (isHighlighterPopupOpen ? "text-[#f5c344] bg-zinc-800/90 rotate-180" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80")
            )}
            title="Chọn màu & bản tô dạ quang"
          >
            <ChevronDown className="size-3 stroke-[2.5]" />
          </button>

          {/* BẢNG CHỌN MÀU & BẢN TÔ HIGHLIGHTER (KHÔNG CHỮ - PURE FIGMA STYLE) */}
          {isHighlighterPopupOpen && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute bottom-full left-0 mb-3 p-2 bg-[#121418]/98 backdrop-blur-2xl rounded-xl shadow-2xl flex flex-col gap-2 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100 border-0"
            >
              {/* 5 màu dạ quang */}
              <div className="flex items-center gap-1.5 px-0.5">
                {HIGHLIGHTER_PALETTE.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHighlighterColor(p.color);
                      setActiveTool("highlighter");
                    }}
                    style={{ backgroundColor: p.color }}
                    className={cn(
                      "size-6 rounded-full transition-transform cursor-pointer border border-white/20 hover:scale-115 shadow-sm",
                      highlighterColor === p.color &&
                        "scale-125 ring-2 ring-[#f5c344] ring-offset-2 ring-offset-[#121418]"
                    )}
                    title={p.label}
                  />
                ))}
              </div>

              {/* Phân cách */}
              <div className="w-full h-[1px] bg-zinc-800 my-0.5" />

              {/* 3 bản tô */}
              <div className="flex items-center justify-between gap-1.5 px-0.5">
                {HIGHLIGHTER_SIZES.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHighlighterSize(s.size);
                      setActiveTool("highlighter");
                    }}
                    className={cn(
                      "h-7 px-2 flex items-center justify-center rounded-lg transition-all cursor-pointer",
                      highlighterSize === s.size
                        ? "bg-zinc-800 ring-1 ring-[#f5c344]"
                        : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
                    )}
                    title={`Bản ${s.label} (${s.size}px)`}
                  >
                    <span
                      style={{ backgroundColor: highlighterColor }}
                      className={cn("rounded-sm opacity-85", s.bar)}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* NÚT TẨY XÓA NÉT VẼ & POPUP CHỌN CHẾ ĐỘ TẨY (FIGMA STYLE) */}
        <div className="relative shrink-0 flex items-center gap-0.5" ref={eraserRef}>
          {/* Icon chính: Chỉ kích hoạt tẩy, không mở popup chế độ */}
          <button
            type="button"
            onClick={() => {
              setActiveTool("eraser");
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              setIsEraserPopupOpen(false);
            }}
            className={cn(
              "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
              activeTool === "eraser"
                ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
                : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70")
            )}
            title={eraserMode === "freeform" ? "Tẩy nét tùy ý (Gọt tỉa nét)" : "Tẩy trọn nét liền (Chạm là xóa cả nét)"}
          >
            <Eraser className="size-4.5" />
          </button>

          {/* Mũi tên nhỏ tách rời: Ấn vào mới mở bảng chọn chế độ tẩy */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTool("eraser");
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              setIsEraserPopupOpen((prev) => !prev);
            }}
            className={cn(
              "p-1 rounded-md transition-all cursor-pointer flex items-center justify-center shrink-0",
              isLight
                ? (isEraserPopupOpen ? "text-amber-600 bg-zinc-100 rotate-180" : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100")
                : (isEraserPopupOpen ? "text-[#f5c344] bg-zinc-800/90 rotate-180" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80")
            )}
            title="Chọn chế độ tẩy xóa"
          >
            <ChevronDown className="size-3 stroke-[2.5]" />
          </button>

          {/* BẢNG CHỌN CHẾ ĐỘ TẨY (FIGMA POPUP) */}
          {isEraserPopupOpen && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-1.5 bg-[#121418]/98 backdrop-blur-2xl rounded-xl shadow-2xl flex flex-col gap-1 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100 border-0 min-w-[175px]"
            >
              <button
                type="button"
                onClick={() => {
                  setEraserMode("freeform");
                  setActiveTool("eraser");
                  setIsEraserPopupOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer",
                  eraserMode === "freeform"
                    ? "bg-zinc-800 text-[#f5c344] font-semibold"
                    : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                )}
              >
                <Scissors className="size-3.5 shrink-0" />
                <span>Xóa nét tùy ý</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEraserMode("stroke");
                  setActiveTool("eraser");
                  setIsEraserPopupOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer",
                  eraserMode === "stroke"
                    ? "bg-zinc-800 text-[#f5c344] font-semibold"
                    : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                )}
              >
                <Eraser className="size-3.5 shrink-0" />
                <span>Xóa trọn nét liền</span>
              </button>
            </div>
          )}
        </div>

        {/* NÚT DÁN NOTE VUÔNG (STICKY NOTE) - HOVER HOẶC BẤM MŨI TÊN ĐỂ CHỌN MÀU */}
        <div
          className="relative shrink-0 flex items-center gap-0.5"
          ref={noteRef}
          onMouseEnter={handleNoteMouseEnter}
          onMouseLeave={handleNoteMouseLeave}
        >
          {/* Icon chính - bấm vào tạo note ngay với màu hiện tại */}
          <button
            type="button"
            onClick={() => {
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsEraserPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              handleAddStickyNote(currentNoteColor);
            }}
            className={cn(
              "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95",
              isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
            )}
            title="Dán giấy ghi chú vuông (Hover để chọn màu)"
          >
            <StickyNote className="size-4.5" />
          </button>

          {/* Mũi tên nhỏ tách rời: Bấm vào mở chọn màu */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsEraserPopupOpen(false);
              setIsThemePopupOpen(false);
              setIsNotePopupOpen((prev) => !prev);
            }}
            className={cn(
              "p-1 rounded-md transition-all cursor-pointer flex items-center justify-center shrink-0",
              isLight
                ? (isNotePopupOpen ? "text-amber-600 bg-zinc-100 rotate-180" : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100")
                : (isNotePopupOpen ? "text-[#f5c344] bg-zinc-800/90 rotate-180" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80")
            )}
            title="Chọn màu giấy note"
          >
            <ChevronDown className="size-3 stroke-[2.5]" />
          </button>

          {/* BẢNG CHỌN MÀU NOTE (KHÔNG CHỮ - PURE FIGMA STYLE) */}
          {isNotePopupOpen && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              onMouseEnter={handleNoteMouseEnter}
              onMouseLeave={handleNoteMouseLeave}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-2 bg-[#121418]/98 backdrop-blur-2xl rounded-xl shadow-2xl flex items-center gap-1.5 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100 border-0 pointer-events-auto"
            >
              {STICKY_NOTE_COLORS.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentNoteColor(c.color);
                    handleAddStickyNote(c.color);
                    setIsNotePopupOpen(false);
                  }}
                  style={{ backgroundColor: c.color }}
                  className={cn(
                    "size-6 rounded-md transition-transform cursor-pointer border border-black/20 hover:scale-120 shadow-sm",
                    currentNoteColor === c.color &&
                      "ring-2 ring-[#f5c344] ring-offset-1 ring-offset-[#121418] scale-110"
                  )}
                  title={`Note ${c.label}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* VÁCH NGĂN */}
        <div className={cn("w-[1px] h-5 mx-1 shrink-0", isLight ? "bg-zinc-200" : "bg-zinc-700/60")} />

        {/* 2. CỤM TIỆN ÍCH: TÌM KIẾM, SỔ TAY, ÂM THANH */}
        {/* NÚT TÌM KIẾM (KÍNH LÚP) */}
        <button
          ref={searchButtonRef}
          type="button"
          onClick={() => {
            setIsPenPopupOpen(false);
            setIsHighlighterPopupOpen(false);
            setIsEraserPopupOpen(false);
            setIsNotePopupOpen(false);
            setIsThemePopupOpen(false);
            setIsSearchOpen((prev) => {
              const next = !prev;
              if (next) {
                setTimeout(() => searchInputRef.current?.focus(), 80);
              }
              return next;
            });
          }}
          className={cn(
            "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
            isSearchOpen
              ? (isLight ? "bg-zinc-100 text-zinc-950 shadow-sm" : "bg-zinc-800 text-white shadow-sm")
              : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70")
          )}
          title="Tìm chữ trong toàn bộ hồ sơ vụ án (Ctrl+F)"
        >
          <Search className="size-4.5" />
        </button>

        {/* NÚT SỔ TAY THÁM TỬ */}
        <button
          type="button"
          onClick={() => {
            if (onOpenNotebook) {
              onOpenNotebook();
            } else {
              emitInvestigationEvent("OPEN_NOTEBOOK");
            }
          }}
          className={cn(
            "p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
          )}
          title="Ghi chép bàn hồ sơ"
        >
          <BookOpen className="size-4.5 text-amber-500 hover:text-amber-400 transition-colors" />
        </button>

        {/* NÚT TẬP TRUNG VÀO BẢNG ĐIỀU TRA TRÊN BÀN */}
        {renderInvestigationBoard && (
          <button
            type="button"
            onClick={() => {
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsEraserPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              focusOnElement("board-investigation-canvas", 0.75);
            }}
            className={cn(
              "p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0",
              isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
            )}
            title="Đến vị trí Bảng điều tra trên bàn"
          >
            <SquareKanban className="size-4.5 text-amber-500 hover:text-amber-400 transition-colors" />
          </button>
        )}

        {/* NÚT BẬT / TẮT ÂM THANH */}
        <button
          type="button"
          onClick={handleToggleAudio}
          className={cn(
            "p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
          )}
          title={isAudioMuted ? "Bật âm thanh trinh thám" : "Tắt âm thanh trinh thám"}
        >
          {isAudioMuted ? (
            <VolumeX className="size-4.5 text-zinc-500" />
          ) : (
            <Volume2 className="size-4.5 text-amber-400" />
          )}
        </button>

        {/* VÁCH NGĂN */}
        <div className={cn("w-[1px] h-4 mx-0.5 shrink-0", isLight ? "bg-zinc-200" : "bg-zinc-700/60")} />

        {/* 3. CỤM THU PHÓNG ZOOM */}
        <button
          type="button"
          onClick={handleZoomOut}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
          )}
          title="Thu nhỏ (Zoom out • hoặc lăn chuột xuống)"
        >
          <Minus className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetZoom}
          className={cn(
            "px-2 py-0.5 font-sans text-xs font-semibold min-w-[42px] text-center cursor-pointer transition-colors shrink-0",
            isLight ? "text-zinc-800 hover:text-zinc-950 font-bold" : "text-zinc-300 hover:text-white"
          )}
          title="Đặt lại tỉ lệ chuẩn 80%"
        >
          {Math.round(zoomScale * 100)}%
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
          )}
          title="Phóng to (Zoom in • hoặc lăn chuột lên)"
        >
          <Plus className="size-3.5" />
        </button>

        {/* NÚT CẨM NANG HƯỚNG DẪN BÀN HỒ SƠ */}
        <button
          type="button"
          onClick={() => emitInvestigationEvent("OPEN_CANVAS_GUIDE")}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isLight ? "text-zinc-500 hover:text-amber-600 hover:bg-zinc-100" : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/70"
          )}
          title="Cẩm nang hướng dẫn Bàn hồ sơ"
        >
          <HelpCircle className="size-3.5" />
        </button>

        {/* NÚT CHUYỂN ĐỔI GIAO DIỆN SÁNG / TỐI (LIGHT / DARK THEME) */}
        {onToggleUiTheme && (
          <button
            type="button"
            onClick={onToggleUiTheme}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0",
              isLight
                ? "text-amber-600 hover:text-amber-800 hover:bg-zinc-100"
                : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/70"
            )}
            title={isLight ? "Chuyển sang giao diện Tối (Dark)" : "Chuyển sang giao diện Sáng (Light)"}
          >
            {isLight ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          </button>
        )}

        {/* NÚT BẢNG MÀU MẶT BÀN HỒ SƠ */}
        <button
          type="button"
          onClick={() => setIsThemePopupOpen((prev) => !prev)}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isThemePopupOpen
              ? (isLight ? "bg-zinc-100 text-amber-700 font-bold" : "bg-zinc-800 text-amber-300 font-bold")
              : (isLight ? "text-zinc-500 hover:text-amber-600 hover:bg-zinc-100" : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/70")
          )}
          title="Tùy chọn màu mặt bàn hồ sơ"
        >
          <Palette className="size-3.5" />
        </button>

        {/* VÁCH NGĂN */}
        <div className={cn("w-[1px] h-4 mx-0.5 shrink-0", isLight ? "bg-zinc-200" : "bg-zinc-700/60")} />

        {/* 4. NÚT KẾT LUẬN */}
        <button
          type="button"
          onClick={() => {
            if (onOpenIndictment) {
              onOpenIndictment();
            } else {
              emitInvestigationEvent("OPEN_EPILOGUE");
            }
          }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 shrink-0",
            isLight
              ? "text-red-700 hover:text-red-800 hover:bg-red-100/70"
              : "text-red-400 hover:text-red-300 hover:bg-red-950/40"
          )}
          title="Kết luận vụ án & Đưa ra phán quyết"
        >
          <ClipboardCheck className="size-4 text-red-400" />
          <span className="tracking-wide">KẾT LUẬN</span>
        </button>
      </div>

      {/* BẢNG CHỌN & SO SÁNH MÀU MẶT BÀN HỒ SƠ (CANVAS THEME POPUP - ĐẶT NGOÀI TOOLBAR ĐỂ FIXED VIEWPORT KHÔNG BỊ LỆCH) */}
      {isThemePopupOpen && (
        <div
          ref={themePopupRef}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "fixed top-16 right-4 sm:right-6 w-[420px] max-w-[calc(100vw-2rem)] backdrop-blur-2xl rounded-2xl p-3.5 flex flex-col gap-3 z-50 animate-in fade-in zoom-in-95 duration-100 select-none",
            isLight
              ? "bg-white/98 border border-zinc-200 shadow-[0_25px_60px_rgba(0,0,0,0.15)] text-zinc-900"
              : "bg-[#121418]/98 border border-[#353945] shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-zinc-200"
          )}
        >
          {/* Header: Title + Reset + Close */}
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-amber-400 shrink-0" />
              <span className="font-mono text-xs font-bold tracking-wider text-amber-300 uppercase">
                Mặt bàn hồ sơ
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded truncate max-w-[130px]">
                {canvasTheme.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {(canvasTheme.id !== "mahogany-warm" || canvasTheme.isCustom) && (
                <button
                  type="button"
                  onClick={handleResetDefaultTheme}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors cursor-pointer"
                  title="Khôi phục mặt bàn gỗ gụ mặc định"
                >
                  <RotateCcw className="size-3" />
                  <span>Mặc định</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsThemePopupOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Đóng bảng màu"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Tab navigation: [Mẫu sẵn có] / [Tùy biến tự do] */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-900/90 rounded-xl border border-zinc-800/80 text-xs font-mono">
            <button
              type="button"
              onClick={() => setThemeActiveTab("presets")}
              className={cn(
                "py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer",
                themeActiveTab === "presets"
                  ? "bg-zinc-800 text-amber-300 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Mẫu sẵn có ({DOSSIER_CANVAS_PRESETS.length})
            </button>
            <button
              type="button"
              onClick={() => setThemeActiveTab("custom")}
              className={cn(
                "py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer",
                themeActiveTab === "custom"
                  ? "bg-zinc-800 text-amber-300 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Tùy biến tự do
            </button>
          </div>

          {/* TAB 1: PRESETS (Chuyển đổi & So sánh nhanh) */}
          {themeActiveTab === "presets" && (
            <div className="flex flex-col gap-1.5 max-h-[310px] overflow-y-auto pr-1 scrollbar-thin">
              <div className="text-[11px] text-zinc-400 px-0.5 flex items-center justify-between">
                <span>Nhấp để đổi ngay & so sánh màu:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {DOSSIER_CANVAS_PRESETS.map((preset) => {
                  const isActive = canvasTheme.id === preset.id && !canvasTheme.isCustom;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyTheme(preset)}
                      className={cn(
                        "group relative flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer border text-xs",
                        isActive
                          ? "bg-zinc-800/95 border-amber-500/80 shadow-[0_0_12px_rgba(245,195,68,0.25)] ring-1 ring-amber-500/50"
                          : "bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700"
                      )}
                    >
                      {/* Mini spotlight swatch */}
                      <div
                        className="size-7 rounded-lg shrink-0 shadow-inner border border-white/20 relative overflow-hidden flex items-center justify-center"
                        style={{ background: preset.swatchGradient }}
                      >
                        {isActive && (
                          <Check className="size-3.5 text-amber-300 stroke-[3] drop-shadow" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={cn(
                            "font-medium truncate leading-tight",
                            isActive
                              ? "text-amber-300 font-bold"
                              : "text-zinc-200 group-hover:text-white"
                          )}
                        >
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {preset.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TÙY BIẾN TỰ DO (Custom Color Picker & Spotlight) */}
          {themeActiveTab === "custom" && (
            <div className="flex flex-col gap-3 text-xs">
              {/* 1. Chọn màu nền mặt bàn */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-zinc-400">1. Màu nền bàn (Base Color)</span>
                  <span className="font-mono text-[11px] text-amber-400 uppercase font-semibold">
                    {customBaseColor}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-amber-500/60 cursor-pointer transition-colors shrink-0">
                    <div
                      className="size-5 rounded-md border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: customBaseColor }}
                    />
                    <span className="font-mono text-[11px] text-zinc-200 font-medium">Bảng màu...</span>
                    <input
                      type="color"
                      value={customBaseColor}
                      onChange={(e) =>
                        handleUpdateCustomTheme(
                          e.target.value,
                          customLampTone,
                          customLampIntensity,
                          customGridType
                        )
                      }
                      className="opacity-0 absolute inset-0 size-full cursor-pointer"
                    />
                  </label>

                  {/* Quick color dots */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none flex-1">
                    {QUICK_CUSTOM_COLORS.map((qc) => (
                      <button
                        key={qc.color}
                        type="button"
                        onClick={() =>
                          handleUpdateCustomTheme(
                            qc.color,
                            customLampTone,
                            customLampIntensity,
                            customGridType
                          )
                        }
                        style={{ backgroundColor: qc.color }}
                        className={cn(
                          "size-6 rounded-md border transition-transform cursor-pointer shrink-0 shadow-sm",
                          customBaseColor.toLowerCase() === qc.color.toLowerCase()
                            ? "border-amber-400 scale-115 ring-2 ring-amber-400/40"
                            : "border-zinc-700 hover:scale-110"
                        )}
                        title={qc.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Ánh đèn bàn rọi (Spotlight Lamp) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-zinc-400">2. Ánh đèn rọi tâm bàn (Spotlight)</span>
                  <span className="font-mono text-[11px] text-zinc-300">
                    {customLampTone === "warm"
                      ? "Vàng ấm"
                      : customLampTone === "cool"
                        ? "Trắng dịu"
                        : customLampTone === "cyan"
                          ? "Xanh pháp y"
                          : "Không đèn"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(
                    [
                      { id: "warm", label: "Vàng ấm" },
                      { id: "cool", label: "Trắng dịu" },
                      { id: "cyan", label: "Xanh pháp y" },
                      { id: "none", label: "Tắt đèn" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        handleUpdateCustomTheme(
                          customBaseColor,
                          t.id,
                          customLampIntensity,
                          customGridType
                        )
                      }
                      className={cn(
                        "py-1 px-1.5 rounded-lg font-mono text-[11px] transition-all cursor-pointer border text-center truncate",
                        customLampTone === t.id
                          ? "bg-zinc-800 border-amber-500/80 text-amber-300 font-semibold"
                          : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {customLampTone !== "none" && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">Độ sáng:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={customLampIntensity}
                      onChange={(e) =>
                        handleUpdateCustomTheme(
                          customBaseColor,
                          customLampTone,
                          parseFloat(e.target.value),
                          customGridType
                        )
                      }
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                    />
                    <span className="text-[10px] font-mono text-zinc-300 w-8 text-right">
                      {Math.round(customLampIntensity * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* 3. Kiểu lưới định vị (Grid Style) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-zinc-400">3. Kiểu lưới định vị (Grid)</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(
                    [
                      { id: "crosses", label: "Dấu thập (+)" },
                      { id: "dots", label: "Điểm chấm (•)" },
                      { id: "grid", label: "Kẻ ô (#)" },
                      { id: "none", label: "Ẩn lưới" },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() =>
                        handleUpdateCustomTheme(
                          customBaseColor,
                          customLampTone,
                          customLampIntensity,
                          g.id
                        )
                      }
                      className={cn(
                        "py-1 px-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer border text-center truncate",
                        customGridType === g.id
                          ? "bg-zinc-800 border-amber-500/80 text-amber-300 font-semibold"
                          : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
