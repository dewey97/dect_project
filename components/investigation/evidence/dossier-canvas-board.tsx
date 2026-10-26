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
  FolderOpen,
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
  Minus,
  Plus,
  Maximize2,
  MoreHorizontal,
  ClipboardCheck,
  Undo2,
  Redo2,
} from "lucide-react";
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
import type { LoiKhaiData, LyLichData } from "@/types/dossier";
import { DossierLoiKhaiSheet } from "@/components/admin/dossier-studio/dossier-loi-khai-sheet";
import { DossierLyLichSheet } from "@/components/admin/dossier-studio/dossier-ly-lich-sheet";
import {
  DossierAnnotationLayer,
  type AnnotationTool,
  type AnnotationColor,
} from "./dossier-annotation-layer";
import { CASE_000_DOSSIER_MAP } from "@/lib/hooks/use-dossier-documents";

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

export interface CanvasStickyNote {
  id: string;
  x: number;
  y: number;
  content: string;
  color: string;
  createdAt: number;
}

interface DossierCanvasBoardProps {
  caseId?: string;
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
}

export function DossierCanvasBoard({
  caseId = "case_000",
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
}: DossierCanvasBoardProps) {
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

  // Dán note vuông riêng biệt (Sticky Notes)
  const [isNotePopupOpen, setIsNotePopupOpen] = useState<boolean>(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const storageNotesKey = `dect_dossier_canvas_notes_${caseId}`;
  const [stickyNotes, setStickyNotes] = useState<CanvasStickyNote[]>([]);

  // Nạp sticky notes từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageNotesKey);
      if (saved) {
        setStickyNotes(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [storageNotesKey]);

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
      };

      setCustomPositions((prev) => {
        const next = { ...prev, [newId]: { x: canvasX, y: canvasY } };
        try {
          localStorage.setItem(storagePosKey, JSON.stringify(next));
        } catch {}
        return next;
      });

      saveStickyNotes([...stickyNotes, newNote]);
      setIsNotePopupOpen(false);
      setActiveTool("cursor");
    },
    [stickyNotes, saveStickyNotes, storagePosKey]
  );

  const handleUpdateStickyNote = useCallback(
    (id: string, content: string) => {
      setStickyNotes((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, content } : n));
        try {
          localStorage.setItem(storageNotesKey, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });
    },
    [storageNotesKey]
  );

  const handleUpdateStickyNoteColor = useCallback(
    (id: string, color: string) => {
      setStickyNotes((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, color } : n));
        try {
          localStorage.setItem(storageNotesKey, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });
    },
    [storageNotesKey]
  );

  const handleDeleteStickyNote = useCallback(
    (id: string) => {
      setStickyNotes((prev) => {
        const next = prev.filter((n) => n.id !== id);
        try {
          localStorage.setItem(storageNotesKey, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });
      setCustomPositions((prev) => {
        const copy = { ...prev };
        delete copy[id];
        try {
          localStorage.setItem(storagePosKey, JSON.stringify(copy));
        } catch {}
        return copy;
      });
    },
    [storageNotesKey, storagePosKey]
  );

  // Tìm kiếm nội dung văn bản trong toàn bộ hồ sơ vụ án (Ctrl+F)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Hàng 1: Biên bản Lời khai (A4 portrait ~860px bước nhảy)
    lkDocuments.forEach((doc, idx) => {
      map[`lk_${doc.tag_code}`] = { x: 80 + idx * 920, y: 80 };
    });

    // Hàng 2: Lý lịch bị can (A4 landscape ~1180px bước nhảy)
    hsDocuments.forEach((doc, idx) => {
      map[`hs_${doc.tag_code}`] = { x: 80 + idx * 1180, y: 1300 };
    });

    // Hàng 3: Tài liệu lưu trữ & Kết quả giám định
    unmappedPdfItems.forEach((item, idx) => {
      const code = item.data.code || item.data.id;
      map[`pdf_${code}`] = { x: 80 + idx * 380, y: 2250 };
    });

    // Hàng 4: Tang vật hiện trường
    evidenceItems.forEach((item, idx) => {
      const code = item.data.code || item.data.id;
      map[`ev_${code}`] = { x: 80 + idx * 320, y: 2720 };
    });

    return map;
  }, [lkDocuments, hsDocuments, unmappedPdfItems, evidenceItems]);

  const getItemPosition = useCallback(
    (key: string) => {
      const note = stickyNotes.find((n) => n.id === key);
      if (note) {
        return customPositions[key] || { x: note.x, y: note.y };
      }
      return customPositions[key] || defaultPositions[key] || { x: 100, y: 100 };
    },
    [customPositions, defaultPositions, stickyNotes]
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
          return latest;
        });
      };

      window.addEventListener("pointermove", onGlobalPointerMove);
      window.addEventListener("pointerup", onGlobalPointerUp);
      window.addEventListener("pointercancel", onGlobalPointerUp);
    },
    [getItemPosition, checkAndTriggerEdgePan, storagePosKey]
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

  return (
    <div className="flex-1 min-w-0 min-h-0 bg-[#0d0a07] border-0 rounded-none overflow-hidden flex flex-col h-full relative select-none">
      {/* Center Interactive Surface (Vector Workspace - Aged Mahogany & Dark Leather with Warm White-Gold Lamp Glow) */}
      <main
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={cn(
          "flex-1 h-full min-h-0 overflow-hidden relative select-none bg-[#130f0b]",
          isPanningState
            ? "cursor-grabbing"
            : isSpacePressed
              ? "cursor-grab"
              : activeTool === "cursor"
                ? "cursor-grab"
                : "cursor-crosshair"
        )}
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 48%, rgba(250, 232, 195, 0.14) 0%, rgba(195, 142, 85, 0.32) 32%, rgba(26, 19, 14, 0.88) 68%, #090705 100%),
            url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 20v8M20 24h8' stroke='rgba(238,214,172,0.42)' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E")
          `,
          backgroundSize: `100% 100%, ${48 * zoomScale}px ${48 * zoomScale}px`,
          backgroundPosition: `center center, ${pan.x}px ${pan.y}px`,
        }}
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
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isDragging ? 50 : 10,
                }}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-shadow duration-150 border-transparent",
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
                  className="flex items-center justify-between w-full px-2.5 py-1.5 bg-[#19130d] border border-[#38281b] text-xs font-mono cursor-grab active:cursor-grabbing select-none"
                  title="Nhấn giữ và kéo để di chuyển tài liệu này trên bàn làm việc"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <GripHorizontal className="size-4 text-[#8a7768] hover:text-[#d9a066] transition-colors shrink-0" />
                    <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-[#291e14] text-[#d9a066]">
                      {docItem.tag_code}
                    </span>
                    <span className="font-semibold text-[#e5d8cb] truncate max-w-[200px]">
                      {docData.subjectName || docItem.subject_name}
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
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isDragging ? 50 : 10,
                }}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-shadow duration-150 border-transparent",
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
                  className="flex items-center justify-between w-full px-2.5 py-1.5 bg-[#19130d] border border-[#38281b] text-xs font-mono cursor-grab active:cursor-grabbing select-none"
                  title="Nhấn giữ và kéo để di chuyển tài liệu này trên bàn làm việc"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <GripHorizontal className="size-4 text-[#8a7768] hover:text-[#d9a066] transition-colors shrink-0" />
                    <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-[#291e14] text-[#d9a066]">
                      {docItem.tag_code}
                    </span>
                    <span className="font-semibold text-[#e5d8cb] truncate max-w-[200px]">
                      {docData.fullName || docItem.subject_name}
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
          {/* PHÂN KHU 3: CÁC VĂN BẢN VỤ ÁN & PHÁP Y KHÁC (CASE ARCHIVES)   */}
          {/* ============================================================== */}
          {unmappedPdfItems.map((item) => {
            const pdf = item.data as PDFDocument;
            const itemCode = pdf.code || pdf.id;
            const key = `pdf_${itemCode}`;
            const pos = getItemPosition(key);
            const isDragging = activeDraggingId === key;
            const isSelected =
              focusedTag === itemCode || currentSelectedCode === itemCode;

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
                  "w-[340px] bg-[#16120d] border-2 transition-shadow duration-150 p-5 rounded-lg flex flex-col justify-between shadow-xl border-[#38281b]",
                  isDragging && "shadow-[0_25px_60px_rgba(0,0,0,0.85)] scale-[1.02]"
                )}
              >
                {/* Drag handle header */}
                <div
                  data-drag-handle="true"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => handleItemDragStart(e, key)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  className="flex items-start justify-between border-b border-[#38281b] pb-3 mb-3 cursor-grab active:cursor-grabbing select-none"
                  title="Nhấn giữ và kéo để di chuyển tài liệu này trên bàn làm việc"
                >
                  <div className="flex items-center gap-2">
                    <GripHorizontal className="size-4 text-[#8a7768] hover:text-[#d9a066] transition-colors shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-[#d9a066] bg-[#291e14] px-2 py-0.5 border border-[#4a3523] w-fit">
                        {pdf.code || "HỒ SƠ"}
                      </span>
                      <span className="text-[11px] font-mono text-[#8a7768] mt-1">
                        {pdf.dossierTitle || pdf.dossierKey || `Giai đoạn ${pdf.phase}`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-red-950/60 border border-red-700/60 text-red-400 font-bold">
                    Tối Mật
                  </span>
                </div>

                {/* Content summary */}
                <div
                  onClick={() => {
                    setFocusedTag(itemCode);
                    onSelectPdf(pdf);
                  }}
                  className="flex-1 py-2 cursor-pointer"
                >
                  <h4 className="font-mono font-bold text-[#e5d8cb] text-sm leading-snug line-clamp-2">
                    {pdf.title}
                  </h4>
                  <p className="font-sans text-xs text-[#a89078] mt-2 line-clamp-3 leading-relaxed">
                    Tài liệu lưu trữ chính thức thuộc hồ sơ vụ án hình sự.
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-[#38281b] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#786454]">
                    Định dạng: PDF Gốc
                  </span>
                  {onOpenInspectModal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInspectModal({ type: "pdf", data: pdf });
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono font-medium text-[#d9a066] bg-[#291e14] border border-[#4a3523] hover:bg-[#38281b] transition-colors cursor-pointer"
                    >
                      <Eye className="size-3" />
                      <span>Xem toàn văn</span>
                    </button>
                  )}
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
                  zIndex: isDragging ? 50 : 10,
                }}
                className={cn(
                  "w-[280px] bg-[#14100c] border-2 transition-shadow duration-150 p-3 rounded-lg flex flex-col justify-between shadow-xl border-[#38281b]",
                  isDragging && "shadow-[0_25px_60px_rgba(0,0,0,0.85)] scale-[1.02]"
                )}
              >
                {/* Drag handle header */}
                <div
                  data-drag-handle="true"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => handleItemDragStart(e, key)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d2015] cursor-grab active:cursor-grabbing select-none"
                  title="Nhấn giữ và kéo để di chuyển vật chứng này trên bàn làm việc"
                >
                  <div className="flex items-center gap-1.5">
                    <GripHorizontal className="size-4 text-[#8a7768] hover:text-[#d9a066] transition-colors shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-[#e8a86a] bg-black/80 px-2 py-0.5 border border-[#4a3523]">
                      {ev.code || "TANG VẬT"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#786454]">
                    {ev.kind || "Ảnh"}
                  </span>
                </div>

                {/* Photo Thumbnail */}
                <div
                  onClick={() => {
                    setFocusedTag(itemCode);
                    onSelectEvidence(ev);
                  }}
                  className="w-full aspect-[4/3] bg-black/60 border border-[#2d2015] relative overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="size-8 text-[#5a402a]" />
                  )}
                </div>

                {/* Photo Title & Code */}
                <div
                  onClick={() => {
                    setFocusedTag(itemCode);
                    onSelectEvidence(ev);
                  }}
                  className="py-2.5 cursor-pointer"
                >
                  <h4 className="font-mono font-bold text-[#e5d8cb] text-xs truncate">
                    {ev.title}
                  </h4>
                  <p className="font-sans text-[11px] text-[#8a7768] mt-1 line-clamp-2">
                    {ev.preview || "Tang vật thu thập tại hiện trường phục vụ công tác điều tra."}
                  </p>
                </div>
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* PHÂN KHU 5: CÁC GIẤY DÁN NOTE VUÔNG (STICKY NOTES)            */}
          {/* ============================================================== */}
          {stickyNotes.map((note) => {
            const pos = customPositions[note.id] || { x: note.x, y: note.y };
            const isDragging = activeDraggingId === note.id;
            const colorConfig = STICKY_NOTE_COLORS.find((c) => c.color === note.color) || STICKY_NOTE_COLORS[0];

            return (
              <div
                key={note.id}
                id={`sticky-note-${note.id}`}
                data-dossier-card="true"
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  backgroundColor: colorConfig.color,
                  zIndex: isDragging ? 60 : 25,
                }}
                className={cn(
                  "w-56 min-h-56 p-3.5 rounded-sm shadow-[0_12px_32px_rgba(0,0,0,0.65)] flex flex-col justify-between group transition-shadow select-none border border-black/15",
                  isDragging && "shadow-[0_24px_50px_rgba(0,0,0,0.85)] scale-[1.02]"
                )}
              >
                {/* Drag Header / Grip Bar & Color dots */}
                <div
                  data-drag-handle="true"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => handleItemDragStart(e, note.id)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  className="flex items-center justify-between pb-2 cursor-grab active:cursor-grabbing border-b border-black/10 select-none"
                  title="Nhấn giữ để kéo note di chuyển trên bàn"
                >
                  <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    <GripHorizontal className="size-3.5" style={{ color: colorConfig.text }} />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: colorConfig.text }}>
                      Ghi chú
                    </span>
                  </div>

                  {/* Bảng chấm màu nhanh trên note */}
                  <div className="flex items-center gap-1">
                    {STICKY_NOTE_COLORS.map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStickyNoteColor(note.id, c.color);
                        }}
                        style={{ backgroundColor: c.color }}
                        className={cn(
                          "size-3 rounded-full border border-black/20 hover:scale-125 transition-transform cursor-pointer",
                          note.color === c.color && "ring-1 ring-black/70 scale-110"
                        )}
                        title={`Đổi sang ${c.label}`}
                      />
                    ))}
                  </div>

                  {/* Nút xóa note */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStickyNote(note.id);
                    }}
                    className="size-5 rounded flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-black/10 transition-all cursor-pointer ml-1"
                    title="Xóa ghi chú này"
                  >
                    <X className="size-3.5" style={{ color: colorConfig.text }} />
                  </button>
                </div>

                {/* Textarea nhập nội dung ghi chú */}
                <textarea
                  value={note.content}
                  onChange={(e) => handleUpdateStickyNote(note.id, e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder="Ghi chú điều tra... (Nhập văn bản tại đây)"
                  style={{ color: colorConfig.text }}
                  className="w-full flex-1 bg-transparent resize-none outline-none font-sans text-xs leading-relaxed mt-2.5 placeholder:opacity-50 cursor-text select-text"
                  rows={7}
                />
              </div>
            );
          })}
        </div>
      </main>

      {/* FLOATING TOOLBAR PHÍA DƯỚI MÀN HÌNH (KÍCH THƯỚC RỘNG RÃI, THẨM MỸ CAO CẤP) */}
      <div
        id="dossier-floating-toolbar"
        onMouseDown={(e) => e.stopPropagation()}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-[#121418]/98 backdrop-blur-2xl px-4 py-2.5 rounded-2xl border border-[#353945] shadow-[0_16px_48px_rgba(0,0,0,0.9)] text-zinc-300 max-w-[calc(100%-2rem)] pointer-events-auto select-none overflow-visible"
      >
        {/* BẢNG TÌM KIẾM CHỮ TRONG TÀI LIỆU FLOATING (NỔI TRÊN THANH CÔNG CỤ) */}
        {isSearchOpen && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[420px] max-w-[calc(100vw-2rem)] bg-[#10141b]/98 backdrop-blur-xl border border-[#2b3545] rounded-xl shadow-2xl p-2.5 flex flex-col gap-2 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Input bar */}
            <div className="flex items-center gap-2 bg-[#0c0f14] px-2.5 py-1.5 rounded-lg border border-[#263140]">
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
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentSearchIndex(0);
                  }}
                  className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer border-l border-zinc-700 pl-1.5"
                title="Đóng tìm kiếm (Esc)"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Kết quả tìm kiếm */}
            {searchQuery.trim().length >= 2 && (
              <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto custom-scrollbar pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1 pb-1 border-b border-[#1e2733]">
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
                          ? "bg-zinc-800/80 border border-zinc-500/40 text-white"
                          : "hover:bg-zinc-800/40 text-zinc-300 border border-transparent"
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
          }}
          className={cn(
            "p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
            activeTool === "cursor"
              ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
          )}
          title="Bàn tay (Di chuyển góc nhìn & kéo tài liệu)"
        >
          <Hand className="size-5" />
        </button>

        {/* NÚT BÚT VẼ (PEN TOOL) & POPUP CHỌN MÀU + ĐỘ DÀY RIÊNG BIỆT */}
        <div className="relative shrink-0" ref={penRef}>
          <button
            type="button"
            onClick={() => {
              setIsHighlighterPopupOpen(false);
              setIsNotePopupOpen(false);
              if (activeTool !== "pen") {
                setActiveTool("pen");
                setIsPenPopupOpen(true);
              } else {
                setIsPenPopupOpen((prev) => !prev);
              }
            }}
            className={cn(
              "p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
              activeTool === "pen"
                ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
            )}
            title="Bút vẽ hồ sơ (Bấm để chọn màu & độ dày nét)"
          >
            <Pen className="size-5" />
          </button>

          {/* BẢNG CHỌN MÀU & ĐỘ DÀY BÚT VẼ */}
          {activeTool === "pen" && isPenPopupOpen !== false && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute bottom-full left-0 mb-3 p-3 bg-[#16171b]/98 backdrop-blur-xl border border-[#353945] rounded-xl shadow-2xl flex flex-col gap-2.5 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100 w-64"
            >
              {/* Tiêu đề & Thông số */}
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Bút vẽ hồ sơ
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  {penSize}px
                </span>
              </div>

              {/* Chọn màu bút */}
              <div className="flex items-center justify-between gap-1.5 px-0.5">
                {PEN_PALETTE.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPenColor(p.color);
                    }}
                    style={{ backgroundColor: p.color }}
                    className={cn(
                      "size-6 rounded-full transition-transform cursor-pointer border border-white/20 hover:scale-110 shadow-sm",
                      penColor === p.color &&
                        "scale-125 ring-2 ring-[#f5c344] ring-offset-2 ring-offset-[#16171b]"
                    )}
                    title={p.label}
                  />
                ))}
              </div>

              {/* Phân cách */}
              <div className="w-full h-[1px] bg-zinc-800/80 my-0.5" />

              {/* Chọn độ dày nét bút */}
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Độ dày nét
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {PEN_SIZES.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPenSize(s.size);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border transition-all cursor-pointer",
                      penSize === s.size
                        ? "bg-zinc-800/90 border-[#f5c344] text-[#f5c344] font-bold shadow-sm"
                        : "border-zinc-800/60 hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
                    )}
                    title={`Nét ${s.label} (${s.size}px)`}
                  >
                    <div className="h-4 flex items-center justify-center">
                      <span
                        style={{ backgroundColor: penColor }}
                        className={cn("rounded-full", s.dot)}
                      />
                    </div>
                    <span className="text-[10px] font-sans mt-0.5">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* NÚT BÚT DẠ QUANG HIGHLIGHTER & POPUP CHỌN MÀU + BẢN TÔ RIÊNG BIỆT */}
        <div className="relative shrink-0" ref={highlighterRef}>
          <button
            type="button"
            onClick={() => {
              setIsPenPopupOpen(false);
              setIsNotePopupOpen(false);
              if (activeTool !== "highlighter") {
                setActiveTool("highlighter");
                setIsHighlighterPopupOpen(true);
              } else {
                setIsHighlighterPopupOpen((prev) => !prev);
              }
            }}
            className={cn(
              "p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
              activeTool === "highlighter"
                ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
            )}
            title="Bút nhớ dạ quang (Bấm để chọn màu & bản tô)"
          >
            <Highlighter className="size-5" />
          </button>

          {/* BẢNG CHỌN MÀU & BẢN TÔ DẠ QUANG */}
          {activeTool === "highlighter" && isHighlighterPopupOpen !== false && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute bottom-full left-0 mb-3 p-3 bg-[#16171b]/98 backdrop-blur-xl border border-[#353945] rounded-xl shadow-2xl flex flex-col gap-2.5 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100 w-60"
            >
              {/* Tiêu đề & Thông số */}
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Bút nhớ dạ quang
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  {highlighterSize}px
                </span>
              </div>

              {/* Chọn màu dạ quang */}
              <div className="flex items-center justify-between gap-1.5 px-0.5">
                {HIGHLIGHTER_PALETTE.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHighlighterColor(p.color);
                    }}
                    style={{ backgroundColor: p.color }}
                    className={cn(
                      "size-6 rounded-full transition-transform cursor-pointer border border-white/20 hover:scale-110 shadow-sm",
                      highlighterColor === p.color &&
                        "scale-125 ring-2 ring-[#f5c344] ring-offset-2 ring-offset-[#16171b]"
                    )}
                    title={p.label}
                  />
                ))}
              </div>

              {/* Phân cách */}
              <div className="w-full h-[1px] bg-zinc-800/80 my-0.5" />

              {/* Chọn bản tô dạ quang */}
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Bản tô dạ quang
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {HIGHLIGHTER_SIZES.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHighlighterSize(s.size);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border transition-all cursor-pointer",
                      highlighterSize === s.size
                        ? "bg-zinc-800/90 border-[#f5c344] text-[#f5c344] font-bold shadow-sm"
                        : "border-zinc-800/60 hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
                    )}
                    title={`Bản ${s.label} (${s.size}px)`}
                  >
                    <div className="h-5 flex items-center justify-center">
                      <span
                        style={{ backgroundColor: highlighterColor }}
                        className={cn("rounded-sm opacity-85", s.bar)}
                      />
                    </div>
                    <span className="text-[10px] font-sans mt-0.5">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* NÚT TẨY XÓA NÉT VẼ */}
        <button
          type="button"
          onClick={() => {
            setActiveTool("eraser");
            setIsPenPopupOpen(false);
            setIsHighlighterPopupOpen(false);
            setIsNotePopupOpen(false);
          }}
          className={cn(
            "p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
            activeTool === "eraser"
              ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
          )}
          title="Tẩy nét vẽ (Chạm vào nét vẽ để xóa)"
        >
          <Eraser className="size-5" />
        </button>

        {/* NÚT HOÀN TÁC NÉT VẼ (UNDO • CTRL + Z) */}
        <button
          type="button"
          onClick={handleUndo}
          className="p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 active:scale-95"
          title="Hoàn tác nét vẽ (Ctrl + Z)"
        >
          <Undo2 className="size-5" />
        </button>

        {/* NÚT DÁN NOTE VUÔNG (STICKY NOTE) */}
        <div className="relative shrink-0" ref={noteRef}>
          <button
            type="button"
            onClick={() => {
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              handleAddStickyNote("#fef08a");
            }}
            className="p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/70 active:scale-95"
            title="Dán giấy ghi chú vuông (Sticky Note) lên bàn điều tra"
          >
            <StickyNote className="size-5 text-amber-300/90" />
          </button>
        </div>

        {/* VÁCH NGĂN */}
        <div className="w-[1px] h-5 bg-zinc-700/60 mx-1 shrink-0" />

        {/* 2. CỤM TIỆN ÍCH: TÌM KIẾM, SỔ TAY, ÂM THANH */}
        {/* NÚT TÌM KIẾM (KÍNH LÚP) */}
        <button
          type="button"
          onClick={() => {
            setIsSearchOpen((prev) => {
              const next = !prev;
              if (next) {
                setTimeout(() => searchInputRef.current?.focus(), 80);
              }
              return next;
            });
          }}
          className={cn(
            "p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
            isSearchOpen
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
          )}
          title="Tìm chữ trong toàn bộ hồ sơ vụ án (Ctrl+F)"
        >
          <Search className="size-5" />
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
          className="p-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          title="Mở sổ tay ghi chép thám tử"
        >
          <BookOpen className="size-5 text-amber-500 hover:text-amber-400 transition-colors" />
        </button>

        {/* NÚT BẬT / TẮT ÂM THANH */}
        <button
          type="button"
          onClick={handleToggleAudio}
          className="p-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          title={isAudioMuted ? "Bật âm thanh trinh thám" : "Tắt âm thanh trinh thám"}
        >
          {isAudioMuted ? (
            <VolumeX className="size-5 text-zinc-500" />
          ) : (
            <Volume2 className="size-5 text-amber-400" />
          )}
        </button>

        {/* VÁCH NGĂN */}
        <div className="w-[1px] h-5 bg-zinc-700/60 mx-1 shrink-0" />

        {/* 3. CỤM THU PHÓNG ZOOM */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          title="Thu nhỏ (Zoom out • hoặc lăn chuột xuống)"
        >
          <Minus className="size-4" />
        </button>

        <button
          type="button"
          onClick={handleResetZoom}
          className="px-2.5 py-1 font-sans text-xs font-semibold text-zinc-300 hover:text-white min-w-[48px] text-center cursor-pointer transition-colors shrink-0"
          title="Đặt lại tỉ lệ chuẩn 80%"
        >
          {Math.round(zoomScale * 100)}%
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          title="Phóng to (Zoom in • hoặc lăn chuột lên)"
        >
          <Plus className="size-4" />
        </button>

        {/* VÁCH NGĂN */}
        <div className="w-[1px] h-5 bg-zinc-700/60 mx-1 shrink-0" />

        {/* 4. NÚT KHAY TÀI LIỆU (ĐẨY SANG PHẢI) */}
        <button
          type="button"
          onClick={() => {
            if (onToggleDossierTray) {
              onToggleDossierTray();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-colors cursor-pointer active:scale-95 shrink-0"
          title="Mở / Đóng khay tài liệu và vật chứng"
        >
          <FolderOpen className="size-4 text-amber-500/80" />
          <span>Khay tài liệu</span>
        </button>

        {/* 5. NÚT KẾT LUẬN */}
        <button
          type="button"
          onClick={() => {
            if (onOpenIndictment) {
              onOpenIndictment();
            } else {
              emitInvestigationEvent("OPEN_EPILOGUE");
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-colors cursor-pointer active:scale-95 shrink-0"
          title="Kết luận vụ án & Đưa ra phán quyết"
        >
          <ClipboardCheck className="size-4 text-emerald-400" />
          <span>Kết luận</span>
        </button>
      </div>
    </div>
  );
}
