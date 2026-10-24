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
  Maximize2,
  Minimize2,
  FileText,
  ImageIcon,
  Eye,
  Layers,
  Search,
  ExternalLink,
  Shield,
  FolderOpen,
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
import { CASE_000_DOSSIER_MAP } from "@/lib/hooks/use-dossier-documents";

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
  onSwitchToSingleView,
  isExpanded = false,
  onToggleExpand,
  activeFilter = "all",
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

    if (e.button === 1 || isSpacePressedRef.current || e.button === 0) {
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX - panRef.current.x,
        y: e.clientY - panRef.current.y,
      };
    }
  }, []);

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

  const handleFitAll = useCallback(() => {
    panRef.current = { x: 40, y: 60 };
    zoomScaleRef.current = 0.45;
    setPan({ x: 40, y: 60 });
    setZoomScale(0.45);
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
      {/* Canvas Top Bar Indicator */}
      <div className="shrink-0 px-4 py-2.5 bg-[#17120e] border-b border-[#2d2015] flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-[#e8a86a]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#e5d8cb]">
              Bàn Hồ Sơ Trinh Thám
            </span>
          </div>
          <span className="text-[11px] text-[#8a7768] font-mono hidden md:inline">
            • Giữ <kbd className="px-1.5 py-0.5 bg-[#251b14] border border-[#3e2e20] text-[#d9a066] rounded text-[10px]">Space</kbd> hoặc chuột trái để kéo bàn • Lăn chuột để thu phóng
          </span>
        </div>

        {/* Quick Zoom Bar */}
        <div className="flex items-center gap-1.5 bg-[#120d09] px-2 py-1 border border-[#38281b] rounded-none">
          <button
            onClick={handleZoomOut}
            className="p-1 text-[#ad9885] hover:text-[#f4e8d8] hover:bg-[#251b14] transition-colors cursor-pointer"
            title="Thu nhỏ (Ctrl + Cuộn xuống)"
          >
            <ZoomOut className="size-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-0.5 font-mono text-[11px] font-bold text-[#e8a86a] hover:text-[#f3caa1] min-w-[44px] text-center cursor-pointer"
            title="Đặt lại tỉ lệ đọc chuẩn"
          >
            {Math.round(zoomScale * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 text-[#ad9885] hover:text-[#f4e8d8] hover:bg-[#251b14] transition-colors cursor-pointer"
            title="Phóng to (Ctrl + Cuộn lên)"
          >
            <ZoomIn className="size-3.5" />
          </button>
          <div className="h-3.5 w-px bg-[#38281b] mx-0.5" />
          <button
            onClick={handleFitAll}
            className="px-2 py-0.5 text-[11px] font-mono text-[#ad9885] hover:text-[#f4e8d8] hover:bg-[#251b14] transition-colors cursor-pointer"
            title="Xem toàn cảnh tất cả hồ sơ"
          >
            Toàn cảnh
          </button>
          {onSwitchToSingleView && (
            <>
              <div className="h-3.5 w-px bg-[#38281b] mx-0.5" />
              <button
                onClick={onSwitchToSingleView}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-[#ad9885] hover:text-[#e8a86a] hover:bg-[#251b14] transition-colors cursor-pointer"
                title="Chuyển sang chế độ soi 1 tài liệu đơn"
              >
                <FileText className="size-3" />
                <span>Soi đơn</span>
              </button>
            </>
          )}
          {onToggleExpand && (
            <>
              <div className="h-3.5 w-px bg-[#38281b] mx-0.5" />
              <button
                onClick={onToggleExpand}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-[#ad9885] hover:text-[#f4e8d8] hover:bg-[#251b14] transition-colors cursor-pointer"
                title={isExpanded ? "Thu gọn về cột bên phải" : "Phóng to toàn màn hình"}
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="size-3" />
                    <span>Thu gọn</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="size-3" />
                    <span>Toàn bàn</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

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
          }}
          className="absolute top-0 left-0 min-w-fit min-h-fit p-16 flex flex-col items-start gap-16 select-text"
        >
          {/* ============================================================== */}
          {/* PHÂN KHU 1: HỒ SƠ & BIÊN BẢN LẤY LỜI KHAI (STATEMENTS)        */}
          {/* ============================================================== */}
          {lkDocuments.length > 0 && (
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-[#1e150e]/90 border border-[#4a3523] text-[#e8a86a] font-mono text-xs tracking-wider uppercase shadow-md">
                <FileText className="size-3.5" />
                <span className="font-bold">Khu Vực I • Biên Bản Lấy Lời Khai & Lời Khai Nhân Chứng</span>
                <span className="text-[#8a7768]">({lkDocuments.length} biên bản)</span>
              </div>

              <div className="flex flex-row items-start gap-12">
                {lkDocuments.map((docItem) => {
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
                      className={cn(
                        "relative group flex flex-col items-center gap-4 transition-all duration-300 p-4 rounded-xl border-2",
                        isSelected
                          ? "border-[#d9a066] bg-[#d9a066]/10 shadow-[0_0_35px_rgba(217,160,102,0.25)] ring-4 ring-[#d9a066]/20"
                          : "border-transparent hover:border-[#4a3523] hover:bg-[#1a130d]/50"
                      )}
                    >
                      {/* Document Card Header Bar */}
                      <div className="flex items-center justify-between w-full px-2 py-1 bg-[#19130d] border border-[#38281b] text-xs font-mono">
                        <div className="flex items-center gap-2 overflow-hidden">
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

                      {/* Diegetic Dossier Sheet Component */}
                      <div
                        onClick={() => {
                          setFocusedTag(docItem.tag_code);
                          focusOnElement(`board-dossier-${docItem.tag_code}`, 0.95);
                          const matchingPdf = findMatchingPdfItem(docItem.tag_code);
                          if (matchingPdf) {
                            onSelectPdf(matchingPdf.data as PDFDocument);
                          }
                        }}
                        className="cursor-pointer"
                      >
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
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* PHÂN KHU 2: BẢN LÝ LỊCH BỊ CAN & HỒ SƠ TƯ PHÁP (RECORDS)       */}
          {/* ============================================================== */}
          {hsDocuments.length > 0 && (
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-[#1e150e]/90 border border-[#4a3523] text-[#e8a86a] font-mono text-xs tracking-wider uppercase shadow-md">
                <Shield className="size-3.5" />
                <span className="font-bold">Khu Vực II • Trích Lục Lý Lịch Đối Tượng Tình Nghi & Nhân Thân</span>
                <span className="text-[#8a7768]">({hsDocuments.length} hồ sơ)</span>
              </div>

              <div className="flex flex-row items-start gap-12">
                {hsDocuments.map((docItem) => {
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
                      className={cn(
                        "relative group flex flex-col items-center gap-4 transition-all duration-300 p-4 rounded-xl border-2",
                        isSelected
                          ? "border-[#d9a066] bg-[#d9a066]/10 shadow-[0_0_35px_rgba(217,160,102,0.25)] ring-4 ring-[#d9a066]/20"
                          : "border-transparent hover:border-[#4a3523] hover:bg-[#1a130d]/50"
                      )}
                    >
                      {/* Document Card Header Bar */}
                      <div className="flex items-center justify-between w-full px-2 py-1 bg-[#19130d] border border-[#38281b] text-xs font-mono">
                        <div className="flex items-center gap-2 overflow-hidden">
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

                      {/* Diegetic Dossier Sheet Component */}
                      <div
                        onClick={() => {
                          setFocusedTag(docItem.tag_code);
                          focusOnElement(`board-dossier-${docItem.tag_code}`, 0.95);
                          const matchingPdf = findMatchingPdfItem(docItem.tag_code);
                          if (matchingPdf) {
                            onSelectPdf(matchingPdf.data as PDFDocument);
                          }
                        }}
                        className="cursor-pointer"
                      >
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
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* PHÂN KHU 3: CÁC VĂN BẢN VỤ ÁN & PHÁP Y KHÁC (CASE ARCHIVES)   */}
          {/* ============================================================== */}
          {unmappedPdfItems.length > 0 && (
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-[#1e150e]/90 border border-[#4a3523] text-[#e8a86a] font-mono text-xs tracking-wider uppercase shadow-md">
                <FolderOpen className="size-3.5" />
                <span className="font-bold">Khu Vực III • Tài Liệu Lưu Trữ Vụ Án & Kết Quả Giám Định Pháp Y</span>
                <span className="text-[#8a7768]">({unmappedPdfItems.length} tài liệu)</span>
              </div>

              <div className="flex flex-row items-start gap-8">
                {unmappedPdfItems.map((item) => {
                  const pdf = item.data as PDFDocument;
                  const itemCode = pdf.code || pdf.id;
                  const isSelected =
                    focusedTag === itemCode || currentSelectedCode === itemCode;

                  return (
                    <div
                      key={`unmapped_pdf_${itemCode}`}
                      id={`board-pdf-${itemCode}`}
                      onClick={() => {
                        setFocusedTag(itemCode);
                        focusOnElement(`board-pdf-${itemCode}`, 1.0);
                        onSelectPdf(pdf);
                      }}
                      className={cn(
                        "w-[340px] bg-[#16120d] border-2 transition-all duration-300 p-5 rounded-lg flex flex-col justify-between cursor-pointer group shadow-xl",
                        isSelected
                          ? "border-[#d9a066] bg-[#d9a066]/10 shadow-[0_0_30px_rgba(217,160,102,0.25)] ring-4 ring-[#d9a066]/20"
                          : "border-[#38281b] hover:border-[#5a402a] hover:bg-[#1e1711]"
                      )}
                    >
                      {/* Paper folder header */}
                      <div className="flex items-start justify-between border-b border-[#38281b] pb-3 mb-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-[#d9a066] bg-[#291e14] px-2 py-0.5 border border-[#4a3523] w-fit">
                            {pdf.code || "HỒ SƠ"}
                          </span>
                          <span className="text-[11px] font-mono text-[#8a7768] mt-1">
                            {pdf.dossierTitle || pdf.dossierKey || `Giai đoạn ${pdf.phase}`}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-red-950/60 border border-red-700/60 text-red-400 font-bold">
                          Tối Mật
                        </span>
                      </div>

                      {/* Content summary */}
                      <div className="flex-1 py-2">
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
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* PHÂN KHU 4: VẬT CHỨNG & ẢNH ĐIỀU TRA (EVIDENCE PHOTOS)         */}
          {/* ============================================================== */}
          {evidenceItems.length > 0 && (
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-[#1e150e]/90 border border-[#4a3523] text-[#e8a86a] font-mono text-xs tracking-wider uppercase shadow-md">
                <ImageIcon className="size-3.5" />
                <span className="font-bold">Khu Vực IV • Tang Vật Hiện Trường & Bản Ảnh Giám Định</span>
                <span className="text-[#8a7768]">({evidenceItems.length} vật chứng)</span>
              </div>

              <div className="flex flex-row items-start gap-8">
                {evidenceItems.map((item) => {
                  const ev = item.data as PhysicalEvidence;
                  const itemCode = ev.code || ev.id;
                  const isSelected =
                    focusedTag === itemCode || currentSelectedCode === itemCode;
                  const photoUrl = normalizeImageUrl(ev.thumbnail);

                  return (
                    <div
                      key={`evidence_${itemCode}`}
                      id={`board-evidence-${itemCode}`}
                      onClick={() => {
                        setFocusedTag(itemCode);
                        focusOnElement(`board-evidence-${itemCode}`, 1.0);
                        onSelectEvidence(ev);
                      }}
                      className={cn(
                        "w-[280px] bg-[#14100c] border-2 transition-all duration-300 p-3 rounded-lg flex flex-col justify-between cursor-pointer group shadow-xl",
                        isSelected
                          ? "border-[#d9a066] bg-[#d9a066]/10 shadow-[0_0_30px_rgba(217,160,102,0.25)] ring-4 ring-[#d9a066]/20"
                          : "border-[#38281b] hover:border-[#5a402a] hover:bg-[#1a1410]"
                      )}
                    >
                      {/* Photo Thumbnail */}
                      <div className="w-full aspect-[4/3] bg-black/60 border border-[#2d2015] relative overflow-hidden flex items-center justify-center">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={ev.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <ImageIcon className="size-8 text-[#5a402a]" />
                        )}
                        <span className="absolute top-2 left-2 font-mono text-[10px] font-bold text-[#e8a86a] bg-black/80 px-2 py-0.5 border border-[#4a3523]">
                          {ev.code || "TANG VẬT"}
                        </span>
                      </div>

                      {/* Photo Title & Code */}
                      <div className="py-2.5">
                        <h4 className="font-mono font-bold text-[#e5d8cb] text-xs group-hover:text-[#f4e8d8] transition-colors truncate">
                          {ev.title}
                        </h4>
                        <p className="font-sans text-[11px] text-[#8a7768] mt-1 line-clamp-2">
                          {ev.preview || "Tang vật thu thập tại hiện trường phục vụ công tác điều tra."}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-2 border-t border-[#2d2015] flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#786454]">
                          {ev.kind || "Ảnh hiện trường"}
                        </span>
                        {onOpenInspectModal && (
                          <button
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
