"use client";

import React from "react";
import {
  ImageIcon,
  GripHorizontal,
  X,
  Stamp,
  Compass,
} from "lucide-react";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { detectiveAudio } from "@/lib/investigation/investigation-audio";
import {
  emitInvestigationEvent,
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
} from "../evidence-types";
import type { DbDossierDocument } from "@/lib/actions/dossier-actions";
import type { LoiKhaiData, LyLichData } from "@/lib/types/dossier";
import { DossierLoiKhaiSheet } from "@/components/admin/dossier-studio/dossier-loi-khai-sheet";
import { DossierLyLichSheet } from "@/components/admin/dossier-studio/dossier-ly-lich-sheet";
import {
  DossierAnnotationLayer,
  type AnnotationTool,
  type AnnotationColor,
  type EraserMode,
} from "../dossier-annotation-layer";
import { CASE_000_DOSSIER_MAP } from "@/lib/hooks/use-dossier-documents";
import { useRoomSync } from "@/components/investigation/room/room-sync-context";
import type { CanvasStickyNote } from "@/lib/types/room";
import {
  HIGHLIGHTER_PALETTE,
  HIGHLIGHTER_SIZES,
  PEN_PALETTE,
  PEN_SIZES,
  STICKY_NOTE_COLORS,
} from "./presets";
import { DossierCanvasToolbar } from "./toolbar";
import { DossierCanvasThemePopup } from "./theme-popup";

export interface DossierCanvasSurfaceProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (_e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  isPanningState: boolean;
  isSpacePressed: boolean;
  activeTool: AnnotationTool;
  canvasBackgroundStyle: React.CSSProperties;
  pan: { x: number; y: number; };
  zoomScale: number;
  activeDraggingId: string | null;
  renderInvestigationBoard: React.ReactNode;
  getItemPosition: (key: string) => { x: number; y: number; };
  handleItemDragStart: (e: React.PointerEvent, key: string) => void;
  handleItemPointerMove: (_e: React.PointerEvent) => void;
  handleItemPointerUp: (_e: React.PointerEvent) => void;
  lkDocuments: DbDossierDocument[];
  focusedTag: string | null;
  currentSelectedCode: string | null;
  selectedView: SelectedView | null;
  setFocusedTag: React.Dispatch<React.SetStateAction<string | null>>;
  findMatchingPdfItem: (tagCode: string) => CombinedItem | undefined;
  onSelectPdf: (item: PDFDocument) => void;
  activeAnnotationColor: string;
  activeAnnotationSize: number;
  eraserMode: EraserMode;
  clearTrigger: number;
  hsDocuments: DbDossierDocument[];
  unmappedPdfItems: CombinedItem[];
  evidenceItems: CombinedItem[];
  onSelectEvidence: (item: PhysicalEvidence) => void;
  stickyNotes: CanvasStickyNote[];
  customPositions: Record<string, { x: number; y: number; }>;
  handleChangeNoteColor: (id: string) => void;
  handleDeleteStickyNote: (id: string) => void;
  typingNoteIdRef: React.RefObject<string | null>;
  handleBlurStickyNote: (id: string) => void;
  handleUpdateStickyNote: (id: string, content: string) => void;
}

export function DossierCanvasSurface({
  containerRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  isPanningState,
  isSpacePressed,
  activeTool,
  canvasBackgroundStyle,
  pan,
  zoomScale,
  activeDraggingId,
  renderInvestigationBoard,
  getItemPosition,
  handleItemDragStart,
  handleItemPointerMove,
  handleItemPointerUp,
  lkDocuments,
  focusedTag,
  currentSelectedCode,
  selectedView,
  setFocusedTag,
  findMatchingPdfItem,
  onSelectPdf,
  activeAnnotationColor,
  activeAnnotationSize,
  eraserMode,
  clearTrigger,
  hsDocuments,
  unmappedPdfItems,
  evidenceItems,
  onSelectEvidence,
  stickyNotes,
  customPositions,
  handleChangeNoteColor,
  handleDeleteStickyNote,
  typingNoteIdRef,
  handleBlurStickyNote,
  handleUpdateStickyNote,
}: DossierCanvasSurfaceProps) {
  return (
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
  );
}
