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
} from "lucide-react";
import { cn, normalizeImageUrl } from "@/lib/utils";
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

const COLOR_PALETTE: { color: AnnotationColor; label: string }[] = [
  { color: "#dc2626", label: "Bút đỏ nghiệp vụ" },
  { color: "#2563eb", label: "Bút xanh mực máy" },
  { color: "#eab308", label: "Bút nhớ vàng chanh" },
  { color: "#16a34a", label: "Bút xanh lá cây" },
  { color: "#9333ea", label: "Bút tím ghi chú" },
  { color: "#171717", label: "Bút chì đen" },
];

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
}

export function DossierCanvasBoard({
  caseId = "case-000",
  pdfItems,
  evidenceItems,
  dossierDocuments,
  selectedView,
  onSelectPdf,
  onSelectEvidence,
  onOpenInspectModal,
}: DossierCanvasBoardProps) {
  // Canvas viewport container ref
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [zoomScale, setZoomScale] = useState(0.8);
  const [pan, setPan] = useState({ x: 80, y: 50 });
  const zoomScaleRef = useRef(zoomScale);
  zoomScaleRef.current = zoomScale;
  const panRef = useRef(pan);
  panRef.current = pan;

  const isPanningRef = useRef(false);
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
    startX: number;
    startY: number;
    initialItemX: number;
    initialItemY: number;
  } | null>(null);

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
  const [activeColor, setActiveColor] = useState<AnnotationColor>("#dc2626");
  const [activeSize, setActiveSize] = useState<number>(2.5);
  const [clearTrigger, setClearTrigger] = useState<number>(0);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false);

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
      return customPositions[key] || defaultPositions[key] || { x: 100, y: 100 };
    },
    [customPositions, defaultPositions]
  );

  // Kéo di chuyển tài liệu
  const handleItemDragStart = useCallback(
    (e: React.PointerEvent, key: string) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}

      const currentPos = getItemPosition(key);
      setActiveDraggingId(key);
      draggingItemRef.current = {
        id: key,
        startX: e.clientX,
        startY: e.clientY,
        initialItemX: currentPos.x,
        initialItemY: currentPos.y,
      };
    },
    [getItemPosition]
  );

  const handleItemPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingItemRef.current) return;
    e.stopPropagation();
    const { id, startX, startY, initialItemX, initialItemY } = draggingItemRef.current;
    const currentZoom = zoomScaleRef.current;
    const deltaX = (e.clientX - startX) / currentZoom;
    const deltaY = (e.clientY - startY) / currentZoom;

    const newX = Math.round(initialItemX + deltaX);
    const newY = Math.round(initialItemY + deltaY);

    setCustomPositions((prev) => ({
      ...prev,
      [id]: { x: newX, y: newY },
    }));
  }, []);

  const handleItemPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingItemRef.current) return;
      e.stopPropagation();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}

      draggingItemRef.current = null;
      setActiveDraggingId(null);

      // Lưu vị trí vào localStorage
      setCustomPositions((latest) => {
        try {
          localStorage.setItem(storagePosKey, JSON.stringify(latest));
        } catch {}
        return latest;
      });
    },
    [storagePosKey]
  );

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

  // Tự động focus khi `selectedView` thay đổi từ bên ngoài (ví dụ click từ DossierTray)
  useEffect(() => {
    if (!selectedView) return;
    const code = selectedView.data.code || selectedView.data.id;
    if (!code) return;

    // 1. Kiểm tra xem có khớp với Dossier Studio Tag không
    const cleanCode = code.trim().toUpperCase();
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
  }, [selectedView, focusOnElement]);

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
        const deltaX = e.shiftKey ? e.deltaY : e.deltaX;
        const deltaY = e.shiftKey ? 0 : e.deltaY;

        const newPan = {
          x: currentPan.x - deltaX,
          y: currentPan.y - deltaY,
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

  // Mouse Drag to Pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target?.tagName === "BUTTON" ||
      target?.closest("button") ||
      target?.tagName === "A" ||
      target?.closest("a")
    ) {
      return;
    }

    // Nếu đang chọn công cụ vẽ (bút, dạ quang, tẩy) và bấm trên canvas vẽ thì nhường tương tác cho nét vẽ
    if (activeTool !== "cursor" && target?.tagName === "CANVAS") {
      return;
    }

    if (e.button === 1 || isSpacePressedRef.current || e.button === 0) {
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX - panRef.current.x,
        y: e.clientY - panRef.current.y,
      };
    }
  }, [activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    const newPan = {
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    };
    panRef.current = newPan;
    setPan(newPan);
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
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
    <div className="flex-1 min-w-0 min-h-0 bg-[#0c0a08] border-2 border-[#3d2c1e] rounded-none shadow-2xl overflow-hidden flex flex-col h-full relative select-none">
      {/* Center Interactive Surface (Vector Workspace) */}
      <main
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={cn(
          "flex-1 h-full min-h-0 overflow-hidden relative select-none bg-[#090806]",
          isSpacePressed
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-default"
        )}
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(30, 22, 16, 0.4) 0%, transparent 80%),
            linear-gradient(to right, rgba(45, 32, 22, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(45, 32, 22, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 48px 48px, 48px 48px",
        }}
      >
        {/* Transform Surface Layer */}
        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoomScale})`,
            transformOrigin: "0 0",
            willChange: "transform",
            transition: isPanningRef.current
              ? "none"
              : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            width: "8000px",
            height: "5000px",
          }}
          className="absolute top-0 left-0 relative select-text"
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
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isDragging ? 50 : isSelected ? 30 : 10,
                }}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-shadow duration-150",
                  isDragging && "shadow-[0_25px_60px_rgba(0,0,0,0.85)] scale-[1.01]",
                  isSelected
                    ? "border-[#d9a066] bg-[#d9a066]/10 shadow-[0_0_35px_rgba(217,160,102,0.25)] ring-4 ring-[#d9a066]/20"
                    : "border-transparent hover:border-[#4a3523] hover:bg-[#1a130d]/50"
                )}
              >
                {/* Document Card Header Bar with Drag Handle */}
                <div
                  onPointerDown={(e) => handleItemDragStart(e, key)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  className="flex items-center justify-between w-full px-2.5 py-1.5 bg-[#19130d] border border-[#38281b] text-xs font-mono cursor-grab active:cursor-grabbing select-none"
                  title="Nhấn giữ và kéo để di chuyển tài liệu này trên bàn làm việc"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <GripHorizontal className="size-4 text-[#8a7768] hover:text-[#d9a066] transition-colors shrink-0" />
                    <span
                      className={cn(
                        "font-bold px-2 py-0.5 rounded text-[11px]",
                        isSelected
                          ? "bg-[#d9a066] text-black"
                          : "bg-[#291e14] text-[#d9a066]"
                      )}
                    >
                      {docItem.tag_code}
                    </span>
                    <span className="font-semibold text-[#e5d8cb] truncate max-w-[200px]">
                      {docData.subjectName || docItem.subject_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        focusOnElement(`board-dossier-${docItem.tag_code}`, 1.0);
                        setFocusedTag(docItem.tag_code);
                        const matchingPdf = findMatchingPdfItem(docItem.tag_code);
                        if (matchingPdf) {
                          onSelectPdf(matchingPdf.data as PDFDocument);
                        }
                      }}
                      className="p-1 text-[#ad9885] hover:text-[#f4e8d8] hover:bg-[#2f2015] transition-colors cursor-pointer"
                      title="Căn giữa tài liệu này"
                    >
                      <Search className="size-3.5" />
                    </button>
                    {onOpenInspectModal && (
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          const matchingPdf = findMatchingPdfItem(docItem.tag_code);
                          onOpenInspectModal({
                            type: "pdf",
                            data: matchingPdf
                              ? (matchingPdf.data as PDFDocument)
                              : {
                                  id: docItem.id,
                                  code: docItem.tag_code,
                                  title: docData.docTitle || docItem.subject_name,
                                  url: "",
                                  phase: 1,
                                  order: 0,
                                },
                          });
                        }}
                        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-[#d9a066] hover:bg-[#2f2015] border border-[#4a3523] transition-colors cursor-pointer"
                        title="Soi tài liệu trong khung phóng to"
                      >
                        <ExternalLink className="size-3" />
                        <span>Soi chi tiết</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Diegetic Dossier Sheet Component with Annotation Layer */}
                <div
                  onClick={() => {
                    setFocusedTag(docItem.tag_code);
                    if (activeTool === "cursor") {
                      focusOnElement(`board-dossier-${docItem.tag_code}`, 0.95);
                    }
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
                    activeColor={activeColor}
                    activeSize={activeSize}
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
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isDragging ? 50 : isSelected ? 30 : 10,
                }}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-shadow duration-150",
                  isDragging && "shadow-[0_25px_60px_rgba(0,0,0,0.85)] scale-[1.01]",
                  isSelected
                    ? "border-[#d9a066] bg-[#d9a066]/10 shadow-[0_0_35px_rgba(217,160,102,0.25)] ring-4 ring-[#d9a066]/20"
                    : "border-transparent hover:border-[#4a3523] hover:bg-[#1a130d]/50"
                )}
              >
                {/* Document Card Header Bar with Drag Handle */}
                <div
                  onPointerDown={(e) => handleItemDragStart(e, key)}
                  onPointerMove={handleItemPointerMove}
                  onPointerUp={handleItemPointerUp}
                  className="flex items-center justify-between w-full px-2.5 py-1.5 bg-[#19130d] border border-[#38281b] text-xs font-mono cursor-grab active:cursor-grabbing select-none"
                  title="Nhấn giữ và kéo để di chuyển tài liệu này trên bàn làm việc"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <GripHorizontal className="size-4 text-[#8a7768] hover:text-[#d9a066] transition-colors shrink-0" />
                    <span
                      className={cn(
                        "font-bold px-2 py-0.5 rounded text-[11px]",
                        isSelected
                          ? "bg-[#d9a066] text-black"
                          : "bg-[#291e14] text-[#d9a066]"
                      )}
                    >
                      {docItem.tag_code}
                    </span>
                    <span className="font-semibold text-[#e5d8cb] truncate max-w-[200px]">
                      {docData.fullName || docItem.subject_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        focusOnElement(`board-dossier-${docItem.tag_code}`, 1.0);
                        setFocusedTag(docItem.tag_code);
                        const matchingPdf = findMatchingPdfItem(docItem.tag_code);
                        if (matchingPdf) {
                          onSelectPdf(matchingPdf.data as PDFDocument);
                        }
                      }}
                      className="p-1 text-[#ad9885] hover:text-[#f4e8d8] hover:bg-[#2f2015] transition-colors cursor-pointer"
                      title="Căn giữa tài liệu này"
                    >
                      <Search className="size-3.5" />
                    </button>
                    {onOpenInspectModal && (
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          const matchingPdf = findMatchingPdfItem(docItem.tag_code);
                          onOpenInspectModal({
                            type: "pdf",
                            data: matchingPdf
                              ? (matchingPdf.data as PDFDocument)
                              : {
                                  id: docItem.id,
                                  code: docItem.tag_code,
                                  title: docData.fullName || docItem.subject_name,
                                  url: "",
                                  phase: 1,
                                  order: 0,
                                },
                          });
                        }}
                        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-[#d9a066] hover:bg-[#2f2015] border border-[#4a3523] transition-colors cursor-pointer"
                        title="Soi tài liệu trong khung phóng to"
                      >
                        <ExternalLink className="size-3" />
                        <span>Soi chi tiết</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Diegetic Dossier Sheet Component with Annotation Layer */}
                <div
                  onClick={() => {
                    setFocusedTag(docItem.tag_code);
                    if (activeTool === "cursor") {
                      focusOnElement(`board-dossier-${docItem.tag_code}`, 0.95);
                    }
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
                    activeColor={activeColor}
                    activeSize={activeSize}
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
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isDragging ? 50 : isSelected ? 30 : 10,
                }}
                className={cn(
                  "w-[340px] bg-[#16120d] border-2 transition-shadow duration-150 p-5 rounded-lg flex flex-col justify-between group shadow-xl",
                  isDragging && "shadow-[0_25px_60px_rgba(0,0,0,0.85)] scale-[1.02]",
                  isSelected
                    ? "border-[#d9a066] bg-[#d9a066]/10 shadow-[0_0_30px_rgba(217,160,102,0.25)] ring-4 ring-[#d9a066]/20"
                    : "border-[#38281b] hover:border-[#5a402a] hover:bg-[#1e1711]"
                )}
              >
                {/* Drag handle header */}
                <div
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
                    if (activeTool === "cursor") {
                      focusOnElement(`board-pdf-${itemCode}`, 1.0);
                    }
                    onSelectPdf(pdf);
                  }}
                  className="flex-1 py-2 cursor-pointer"
                >
                  <h4 className="font-mono font-bold text-[#e5d8cb] text-sm group-hover:text-[#f4e8d8] transition-colors leading-snug line-clamp-2">
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
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isDragging ? 50 : isSelected ? 30 : 10,
                }}
                className={cn(
                  "w-[280px] bg-[#14100c] border-2 transition-shadow duration-150 p-3 rounded-lg flex flex-col justify-between group shadow-xl",
                  isDragging && "shadow-[0_25px_60px_rgba(0,0,0,0.85)] scale-[1.02]",
                  isSelected
                    ? "border-[#d9a066] bg-[#d9a066]/10 shadow-[0_0_30px_rgba(217,160,102,0.25)] ring-4 ring-[#d9a066]/20"
                    : "border-[#38281b] hover:border-[#5a402a] hover:bg-[#1a1410]"
                )}
              >
                {/* Drag handle header */}
                <div
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
                    if (activeTool === "cursor") {
                      focusOnElement(`board-evidence-${itemCode}`, 1.0);
                    }
                    onSelectEvidence(ev);
                  }}
                  className="w-full aspect-[4/3] bg-black/60 border border-[#2d2015] relative overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ImageIcon className="size-8 text-[#5a402a]" />
                  )}
                </div>

                {/* Photo Title & Code */}
                <div
                  onClick={() => {
                    setFocusedTag(itemCode);
                    if (activeTool === "cursor") {
                      focusOnElement(`board-evidence-${itemCode}`, 1.0);
                    }
                    onSelectEvidence(ev);
                  }}
                  className="py-2.5 cursor-pointer"
                >
                  <h4 className="font-mono font-bold text-[#e5d8cb] text-xs group-hover:text-[#f4e8d8] transition-colors truncate">
                    {ev.title}
                  </h4>
                  <p className="font-sans text-[11px] text-[#8a7768] mt-1 line-clamp-2">
                    {ev.preview || "Tang vật thu thập tại hiện trường phục vụ công tác điều tra."}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-2 border-t border-[#2d2015] flex items-center justify-end">
                  {onOpenInspectModal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInspectModal({ type: "evidence", data: ev });
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium text-[#d9a066] bg-[#291e14] border border-[#4a3523] hover:bg-[#38281b] transition-colors cursor-pointer"
                    >
                      <Search className="size-3" />
                      <span>Soi ảnh</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* FLOATING TOOLBAR PHÍA DƯỚI MÀN HÌNH (GỒM CÔNG CỤ VẼ VỜI & BỘ THU PHÓNG ZOOM) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-[#1a120b]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#4a3625] shadow-2xl text-[#d9a066] max-w-[calc(100%-2rem)]">
        {/* NÚT CHUỘT THƯỜNG / DI CHUYỂN */}
        <button
          type="button"
          onClick={() => setActiveTool("cursor")}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
            activeTool === "cursor"
              ? "bg-[#d9a066] text-[#1a0f07] font-bold shadow-sm"
              : "hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec]"
          )}
          title="Con trỏ chuột (Bấm chọn & Kéo tài liệu)"
        >
          <MousePointer className="size-4" />
        </button>

        {/* NÚT BÚT VẼ / KHOANH TRÒN */}
        <button
          type="button"
          onClick={() => {
            setActiveTool("pen");
            setActiveSize(2.5);
          }}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
            activeTool === "pen"
              ? "bg-[#d9a066] text-[#1a0f07] font-bold shadow-sm"
              : "hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec]"
          )}
          title="Bút vẽ & khoanh tròn tài liệu"
        >
          <PenTool className="size-4" />
        </button>

        {/* NÚT BÚT DẠ QUANG HIGHLIGHTER */}
        <button
          type="button"
          onClick={() => {
            setActiveTool("highlighter");
            setActiveSize(6);
          }}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
            activeTool === "highlighter"
              ? "bg-[#d9a066] text-[#1a0f07] font-bold shadow-sm"
              : "hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec]"
          )}
          title="Bút nhớ highlight tô màu chữ"
        >
          <Highlighter className="size-4" />
        </button>

        {/* Ô CHỌN MÀU GỌN GÀNG (TỰ ĐÓNG KHI DI CHUỘT RA NGOÀI) */}
        {activeTool !== "cursor" && activeTool !== "eraser" && (
          <div
            className="relative"
            onMouseLeave={() => setIsColorPickerOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsColorPickerOpen((prev) => !prev)}
              className="p-1 rounded-lg hover:bg-[#342417] transition-colors cursor-pointer flex items-center justify-center"
              title="Đổi màu bút"
            >
              <span
                style={{ backgroundColor: activeColor }}
                className="size-4 rounded-full border-2 border-white/60 shadow-sm"
              />
            </button>

            {isColorPickerOpen && (
              <div
                onMouseLeave={() => setIsColorPickerOpen(false)}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 bg-[#1e150f] border border-[#523924] rounded-xl shadow-2xl flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                {COLOR_PALETTE.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => {
                      setActiveColor(p.color);
                      setIsColorPickerOpen(false);
                    }}
                    style={{ backgroundColor: p.color }}
                    className={cn(
                      "size-5 rounded-full transition-transform cursor-pointer border border-white/20 hover:scale-110",
                      activeColor === p.color &&
                        "scale-125 ring-2 ring-[#d9a066] ring-offset-1 ring-offset-[#1e150f]"
                    )}
                    title={p.label}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* NÚT TẨY XÓA NÉT VẼ */}
        <button
          type="button"
          onClick={() => setActiveTool("eraser")}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
            activeTool === "eraser"
              ? "bg-[#d9a066] text-[#1a0f07] font-bold shadow-sm"
              : "hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec]"
          )}
          title="Tẩy nét vẽ (Chạm vào nét vẽ để xóa)"
        >
          <Eraser className="size-4" />
        </button>

        {/* NÚT XÓA TOÀN BỘ NÉT VẼ */}
        <button
          type="button"
          onClick={() => {
            setClearTrigger((prev) => prev + 1);
          }}
          className="p-1.5 rounded-lg hover:bg-[#342417] text-[#ad9885] hover:text-red-400 transition-colors cursor-pointer"
          title="Xóa tất cả nét vẽ trên tài liệu đang chọn"
        >
          <Trash2 className="size-4" />
        </button>

        {/* VÁCH NGĂN CÁCH BIỆT GIỮA VẼ VÀ ZOOM */}
        <div className="w-[1px] h-4 bg-[#4a3625] mx-1" />

        {/* THU PHÓNG ZOOM IN / ZOOM OUT & RESET ĐƯỢC CHUYỂN XUỐNG DƯỚI */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec] transition-colors cursor-pointer"
          title="Thu nhỏ (Zoom out • hoặc lăn chuột xuống)"
        >
          <ZoomOut className="size-4" />
        </button>

        <button
          type="button"
          onClick={handleResetZoom}
          className="px-2 py-0.5 font-mono text-xs font-bold text-[#e8a86a] hover:text-[#f3caa1] min-w-[42px] text-center cursor-pointer"
          title="Đặt lại tỉ lệ đọc chuẩn 80%"
        >
          {Math.round(zoomScale * 100)}%
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec] transition-colors cursor-pointer"
          title="Phóng to (Zoom in • hoặc lăn chuột lên)"
        >
          <ZoomIn className="size-4" />
        </button>

        <button
          type="button"
          onClick={handleResetZoom}
          className="p-1.5 rounded-lg hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec] transition-colors cursor-pointer"
          title="Đặt lại góc nhìn và tỉ lệ chuẩn"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
