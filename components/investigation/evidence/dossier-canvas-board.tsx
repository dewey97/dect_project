"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  DOSSIER_CANVAS_PRESETS,
  buildCanvasBackground,
  createCustomCanvasTheme,
  type CanvasThemeConfig,
  type GridType,
  type LampTone,
} from "./dossier-canvas-themes";
import { detectiveAudio } from "@/lib/investigation/investigation-audio";
import {
  useInvestigationEvent,
} from "@/lib/investigation/investigation-events";
import {
  popAnnotationUndo,
  popAnnotationRedo,
} from "@/lib/investigation/annotation-history";
import type {
  CombinedItem,
  PDFDocument,
  PhysicalEvidence,
  SelectedView,
} from "./evidence-types";
import type { DbDossierDocument } from "@/lib/actions/dossier-actions";
import {
  type AnnotationTool,
  type EraserMode,
} from "./dossier-annotation-layer";
import { CASE_000_DOSSIER_MAP } from "@/lib/hooks/use-dossier-documents";
import { useRoomSync } from "@/components/investigation/room/room-sync-context";
import type { CanvasStickyNote } from "@/lib/types/room";
import {
  HIGHLIGHTER_SIZES,
  PEN_PALETTE,
  PEN_SIZES,
  STICKY_NOTE_COLORS,
} from "./dossier-canvas/presets";
import { DossierCanvasToolbar } from "./dossier-canvas/toolbar";
import { DossierCanvasThemePopup } from "./dossier-canvas/theme-popup";
import { DossierCanvasSurface } from "./dossier-canvas/surface";


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
  const [clearTrigger] = useState<number>(0);

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
      <DossierCanvasSurface
  containerRef={containerRef}
  handleMouseDown={handleMouseDown}
  handleMouseMove={handleMouseMove}
  handleMouseUp={handleMouseUp}
  isPanningState={isPanningState}
  isSpacePressed={isSpacePressed}
  activeTool={activeTool}
  canvasBackgroundStyle={canvasBackgroundStyle}
  pan={pan}
  zoomScale={zoomScale}
  activeDraggingId={activeDraggingId}
  renderInvestigationBoard={renderInvestigationBoard}
  getItemPosition={getItemPosition}
  handleItemDragStart={handleItemDragStart}
  handleItemPointerMove={handleItemPointerMove}
  handleItemPointerUp={handleItemPointerUp}
  lkDocuments={lkDocuments}
  focusedTag={focusedTag}
  currentSelectedCode={currentSelectedCode}
  selectedView={selectedView}
  setFocusedTag={setFocusedTag}
  findMatchingPdfItem={findMatchingPdfItem}
  onSelectPdf={onSelectPdf}
  activeAnnotationColor={activeAnnotationColor}
  activeAnnotationSize={activeAnnotationSize}
  eraserMode={eraserMode}
  clearTrigger={clearTrigger}
  hsDocuments={hsDocuments}
  unmappedPdfItems={unmappedPdfItems}
  evidenceItems={evidenceItems}
  onSelectEvidence={onSelectEvidence}
  stickyNotes={stickyNotes}
  customPositions={customPositions}
  handleChangeNoteColor={handleChangeNoteColor}
  handleDeleteStickyNote={handleDeleteStickyNote}
  typingNoteIdRef={typingNoteIdRef}
  handleBlurStickyNote={handleBlurStickyNote}
  handleUpdateStickyNote={handleUpdateStickyNote}
/>

      {/* FLOATING TOOLBAR PHÍA DƯỚI MÀN HÌNH (THIẾT KẾ GỌN GÀNG, KHÔNG BAO GIỜ BỊ TRÀN HAY THỌT NÚT) */}
      <DossierCanvasToolbar
  isLight={isLight}
  isBoardFullscreen={isBoardFullscreen}
  isSearchOpen={isSearchOpen}
  searchContainerRef={searchContainerRef}
  searchInputRef={searchInputRef}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  setCurrentSearchIndex={setCurrentSearchIndex}
  handlePrevSearch={handlePrevSearch}
  handleNextSearch={handleNextSearch}
  searchResults={searchResults}
  currentSearchIndex={currentSearchIndex}
  handleSelectSearchResult={handleSelectSearchResult}
  setActiveTool={setActiveTool}
  setIsPenPopupOpen={setIsPenPopupOpen}
  setIsHighlighterPopupOpen={setIsHighlighterPopupOpen}
  setIsNotePopupOpen={setIsNotePopupOpen}
  setIsThemePopupOpen={setIsThemePopupOpen}
  activeTool={activeTool}
  penRef={penRef}
  isPenPopupOpen={isPenPopupOpen}
  setPenColor={setPenColor}
  penColor={penColor}
  setPenSize={setPenSize}
  penSize={penSize}
  highlighterRef={highlighterRef}
  isHighlighterPopupOpen={isHighlighterPopupOpen}
  setHighlighterColor={setHighlighterColor}
  highlighterColor={highlighterColor}
  setHighlighterSize={setHighlighterSize}
  highlighterSize={highlighterSize}
  eraserRef={eraserRef}
  setIsEraserPopupOpen={setIsEraserPopupOpen}
  eraserMode={eraserMode}
  isEraserPopupOpen={isEraserPopupOpen}
  setEraserMode={setEraserMode}
  noteRef={noteRef}
  handleNoteMouseEnter={handleNoteMouseEnter}
  handleNoteMouseLeave={handleNoteMouseLeave}
  handleAddStickyNote={handleAddStickyNote}
  currentNoteColor={currentNoteColor}
  isNotePopupOpen={isNotePopupOpen}
  setCurrentNoteColor={setCurrentNoteColor}
  searchButtonRef={searchButtonRef}
  setIsSearchOpen={setIsSearchOpen}
  onOpenNotebook={onOpenNotebook}
  renderInvestigationBoard={renderInvestigationBoard}
  focusOnElement={focusOnElement}
  handleToggleAudio={handleToggleAudio}
  isAudioMuted={isAudioMuted}
  handleZoomOut={handleZoomOut}
  handleResetZoom={handleResetZoom}
  zoomScale={zoomScale}
  handleZoomIn={handleZoomIn}
  onToggleUiTheme={onToggleUiTheme}
  isThemePopupOpen={isThemePopupOpen}
  onOpenIndictment={onOpenIndictment}
/>

      {/* BẢNG CHỌN & SO SÁNH MÀU MẶT BÀN HỒ SƠ (CANVAS THEME POPUP - ĐẶT NGOÀI TOOLBAR ĐỂ FIXED VIEWPORT KHÔNG BỊ LỆCH) */}
      {isThemePopupOpen && (
        <DossierCanvasThemePopup
  themePopupRef={themePopupRef}
  isLight={isLight}
  canvasTheme={canvasTheme}
  handleResetDefaultTheme={handleResetDefaultTheme}
  setIsThemePopupOpen={setIsThemePopupOpen}
  setThemeActiveTab={setThemeActiveTab}
  themeActiveTab={themeActiveTab}
  handleApplyTheme={handleApplyTheme}
  customBaseColor={customBaseColor}
  handleUpdateCustomTheme={handleUpdateCustomTheme}
  customLampTone={customLampTone}
  customLampIntensity={customLampIntensity}
  customGridType={customGridType}
/>
      )}
    </div>
  );
}
