"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  FolderOpen,
  X,
  ExternalLink,
  Minimize2,
  GripHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MainInvestigationCanvas } from "@/components/investigation/mindmap/main-investigation-canvas";
import { DossierCanvasBoard } from "@/components/investigation/evidence/dossier-canvas-board";
import { DossierTray } from "@/components/investigation/evidence/dossier-tray";
import { PhoneSimulator } from "@/components/phone-engine/phone-simulator";
import { useInvestigationEvent } from "@/lib/investigation-events";
import type {
  CombinedItem,
  PDFDocument,
  PhysicalEvidence,
  SelectedView,
} from "@/components/investigation/evidence/evidence-types";
import type { DbDossierDocument } from "@/lib/actions/dossier-actions";
import type { DbCaseDossier } from "@/lib/types/database";
import type { InvestigationActiveModal } from "./mobile-investigation-workspace";

export interface CanvasInvestigationWorkspaceProps {
  caseId: string;
  filterTab: "pdf" | "evidence";
  onSetFilterTab: (tab: "pdf" | "evidence") => void;
  selectedPhaseFilter: "all" | string | number;
  onSetPhaseFilter: (val: "all" | string | number) => void;
  pdfItems: CombinedItem[];
  evidenceItems: CombinedItem[];
  dossierDocs: DbDossierDocument[];
  dossiers: DbCaseDossier[];
  selectedView: SelectedView | null;
  onSelectPdf: (item: PDFDocument) => void;
  onSelectEvidence: (item: PhysicalEvidence) => void;
  isPhaseUnlocked: (phase: number) => boolean;
  isDossierUnlocked: (key: string) => boolean;
  activePing: any;
  broadcastPing: any;
  activeModal: InvestigationActiveModal;
  setActiveModal: (modal: InvestigationActiveModal) => void;
  setSelectedView: (view: SelectedView | null) => void;
  onSwitchToSingleView: () => void;
}

/**
 * WORKSPACE KIỂU XEM: BÀN HỒ SƠ (Canvas Mode - Desktop Only)
 * - Bàn hồ sơ phẳng trải rộng 100% màn hình, không viền ngăn cách.
 * - Bảng điều tra: Floating nổi góc trái, có thể ẩn/hiện tự do. Không có nút âm lượng / sổ tay trên bảng.
 * - Khay hồ sơ: Floating trượt nổi góc phải.
 * - Thanh công cụ vẽ, sổ tay, âm thanh, zoom: Cố định chính giữa đáy màn hình (fixed bottom-4).
 */
export function CanvasInvestigationWorkspace({
  caseId,
  filterTab,
  onSetFilterTab,
  selectedPhaseFilter,
  onSetPhaseFilter,
  pdfItems,
  evidenceItems,
  dossierDocs,
  dossiers,
  selectedView,
  onSelectPdf,
  onSelectEvidence,
  isPhaseUnlocked,
  isDossierUnlocked,
  activePing,
  broadcastPing,
  activeModal,
  setActiveModal,
  setSelectedView,
  onSwitchToSingleView,
}: CanvasInvestigationWorkspaceProps) {
  const [isBoardOpen, setIsBoardOpen] = useState(true);
  const [isDossierCollapsed, setIsDossierCollapsed] = useState(false);

  // Kích thước co kéo của Bảng điều tra (chiều cao tính theo % hoặc px, chiều rộng tự động khóa tỉ lệ 896/1200)
  // Mặc định chiếm ~56-58% chiều cao màn hình (rộng ~370-400px), vừa vặn mắt nhìn và không che mặt bàn
  const [boardHeight, setBoardHeight] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Math.max(450, Math.min(Math.round(window.innerHeight * 0.58), 540));
    }
    return 500;
  });
  const isResizingRef = React.useRef(false);
  const startDragYRef = React.useRef(0);
  const startHeightRef = React.useRef(0);

  // Bắt đầu resize khi kéo góc dưới phải của Bảng điều tra
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    startDragYRef.current = e.clientY;
    startHeightRef.current = boardHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const deltaY = moveEvent.clientY - startDragYRef.current;
      const maxHeight = window.innerHeight - 80;
      const minHeight = 400;
      const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeightRef.current + deltaY));
      setBoardHeight(newHeight);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Kéo thả di chuyển tự do cho modal điện thoại nạn nhân
  const [phonePos, setPhonePos] = useState<{ x: number; y: number }>({ x: 16, y: 16 });
  const [isDraggingPhone, setIsDraggingPhone] = useState(false);
  const phoneDragRef = React.useRef({
    startX: 0,
    startY: 0,
    startPosX: 16,
    startPosY: 16,
  });

  const handlePhonePointerDown = (e: React.PointerEvent) => {
    // Không drag nếu bấm vào button, link hoặc input
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }
    e.preventDefault();
    setIsDraggingPhone(true);
    phoneDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: phonePos.x,
      startPosY: phonePos.y,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      const deltaX = ev.clientX - phoneDragRef.current.startX;
      const deltaY = ev.clientY - phoneDragRef.current.startY;

      const maxX = Math.max(0, window.innerWidth - 320);
      const maxY = Math.max(0, window.innerHeight - 80);

      const nextX = Math.max(0, Math.min(maxX, phoneDragRef.current.startPosX + deltaX));
      const nextY = Math.max(0, Math.min(maxY, phoneDragRef.current.startPosY + deltaY));

      setPhonePos({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDraggingPhone(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Tỷ lệ chuẩn của điện thoại kèm header thanh điều khiển
  const PHONE_ASPECT_RATIO = 1.78;
  const PHONE_HEADER_H = 30;

  // Kích thước co kéo tự do cho modal điện thoại nạn nhân (khóa tỷ lệ chuẩn chassis)
  const [phoneSize, setPhoneSize] = useState<{ width: number; height: number }>(() => {
    const defaultW = 300;
    const defaultH = Math.round(defaultW * PHONE_ASPECT_RATIO) + PHONE_HEADER_H;
    return { width: defaultW, height: defaultH };
  });
  const [isResizingPhone, setIsResizingPhone] = useState(false);
  const phoneResizeRef = React.useRef({
    startX: 0,
    startY: 0,
    startW: 300,
    startH: 564,
  });

  const handlePhoneResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingPhone(true);
    phoneResizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: phoneSize.width,
      startH: phoneSize.height,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      const deltaX = ev.clientX - phoneResizeRef.current.startX;
      const deltaY = ev.clientY - phoneResizeRef.current.startY;

      // Khóa đúng tỷ lệ máy (Aspect Ratio Locked): tính toán theo hướng kéo chủ đạo
      const deltaScale =
        Math.abs(deltaX) >= Math.abs(deltaY / PHONE_ASPECT_RATIO)
          ? deltaX
          : deltaY / PHONE_ASPECT_RATIO;

      const minW = 230;
      const maxW = Math.max(minW, Math.min(window.innerWidth - phonePos.x - 16, 440));

      const nextW = Math.max(minW, Math.min(maxW, phoneResizeRef.current.startW + deltaScale));
      const nextH = Math.round(nextW * PHONE_ASPECT_RATIO) + PHONE_HEADER_H;

      setPhoneSize({ width: nextW, height: nextH });
    };

    const handlePointerUp = () => {
      setIsResizingPhone(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Lắng nghe sự kiện mở bảng từ header hoặc các tương tác khác
  useInvestigationEvent("OPEN_BOARD", () => {
    setIsBoardOpen(true);
  });
  useInvestigationEvent("TOGGLE_BOARD", () => {
    setIsBoardOpen((prev) => !prev);
  });

  return (
    <div className="w-full h-full flex-1 min-h-0 flex items-stretch justify-start overflow-hidden min-w-0 relative gap-0 p-0 select-none">
      {/* 1. NÚT MỞ BẢNG ĐIỀU TRA NỔI (GÓC TRÁI TRÊN) */}
      {!isBoardOpen && (
        <button
          type="button"
          onClick={() => setIsBoardOpen(true)}
          className="flex items-center gap-2 absolute top-3 left-3 z-30 px-3.5 py-2 rounded-lg bg-[#18110b]/90 hover:bg-[#2e1d11] border border-[#5a3e26]/80 hover:border-amber-500/60 text-[#d9a066] hover:text-[#fdebd7] shadow-2xl backdrop-blur-md font-mono text-xs font-bold transition-all cursor-pointer group active:scale-95"
          title="Mở Bảng điều tra (Ghim manh mối)"
        >
          <Layers className="size-4 text-amber-500 transition-transform group-hover:scale-110" />
          <span>Bảng điều tra</span>
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        </button>
      )}

      {/* 2. BẢNG ĐIỀU TRA FLOATING (NỔI GÓC TRÁI, TỶ LỆ DỌC CHUẨN 896/1200, CÓ 2 DÂY TREO BẢNG TỰ NHIÊN) */}
      {isBoardOpen && (
        <div
          style={{ height: `${boardHeight}px` }}
          className="flex absolute top-3 left-3 z-30 max-h-[calc(100%-24px)] w-auto max-w-[48vw] aspect-[896/1200] rounded-none border-0 bg-transparent shadow-2xl shadow-black/95 flex-col overflow-visible transition-[height] duration-75"
        >
          {/* 2 DÂY THỪNG / DÂY TREO BẢNG (KÉO DÀI TỪ TRÊN XUỐNG KHUNG GỖ, ĐỘ DÀI TỰ NHIÊN, BỎ NÚT TRÒN) */}
          {/* Dây bên trái */}
          <div className="absolute -top-12 left-[18%] z-50 flex flex-col items-center pointer-events-none">
            {/* Sợi dây thừng bện / cáp treo dài hơn một chút xíu, ăn thẳng vào mép khung gỗ */}
            <div className="w-[3px] h-14 bg-gradient-to-b from-[#150e09] via-[#4d3824] to-[#241a11] shadow-[1px_0_3px_rgba(0,0,0,0.9)]" />
          </div>

          {/* Dây bên phải */}
          <div className="absolute -top-12 right-[18%] z-50 flex flex-col items-center pointer-events-none">
            {/* Sợi dây thừng bện / cáp treo dài hơn một chút xíu, ăn thẳng vào mép khung gỗ */}
            <div className="w-[3px] h-14 bg-gradient-to-b from-[#150e09] via-[#4d3824] to-[#241a11] shadow-[1px_0_3px_rgba(0,0,0,0.9)]" />
          </div>

          {/* Nút gập / cất bảng điều tra (Dạng icon thu nhỏ gập bảng thẩm mỹ) */}
          <button
            type="button"
            onClick={() => setIsBoardOpen(false)}
            className="flex absolute top-2 right-2 z-40 size-7 items-center justify-center rounded bg-[#1b140e]/90 hover:bg-[#382315] text-[#d9a066] hover:text-[#fdebd7] transition-all shadow-md cursor-pointer border border-[#3e2e20]/60 group"
            title="Gập / Thu gọn Bảng điều tra"
          >
            <Minimize2 className="size-3.5 transition-transform group-hover:scale-110" />
          </button>

          {/* Canvas Bảng Điều Tra (Ẩn title, group play, audio, notebook) */}
          <div className="flex-1 w-full h-full min-h-0 relative overflow-hidden">
            <MainInvestigationCanvas
              caseId={caseId}
              isBoardGame={false}
              hideTitleBadge={true}
              hideGroupPlay={true}
              hideAudio={true}
              hideNotebook={true}
              onOpenPhoneSimulator={() => setActiveModal("phone")}
              onOpenReinvestigation={() => setActiveModal("reinvestigate")}
              onOpenEpilogue={() => setActiveModal("epilogue")}
            />
          </div>

          {/* GÓC RESIZE CO KÉO BẢNG ĐIỀU TRA (GIỮ NGUYÊN TỈ LỆ ASPECT-[896/1200]) */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 z-40 size-5 cursor-nwse-resize flex items-end justify-end p-1 group select-none hover:bg-amber-500/20 rounded-tl transition-colors"
            title="Kéo để thay đổi kích thước bảng điều tra (giữ đúng tỉ lệ)"
          >
            <svg
              className="size-3 text-[#d9a066]/60 group-hover:text-amber-400"
              viewBox="0 0 6 6"
              fill="currentColor"
            >
              <circle cx="5" cy="5" r="0.75" />
              <circle cx="5" cy="2.5" r="0.75" />
              <circle cx="2.5" cy="5" r="0.75" />
            </svg>
          </div>
        </div>
      )}

      {/* 2.5. ĐIỆN THOẠI NẠN NHÂN FLOATING (KÉO THẢ & CO KÉO RESIZE KHÓA ĐÚNG TỶ LỆ, ÔM KHÍT THÂN MÁY) */}
      {activeModal === "phone" && (
        <div
          style={{
            transform: `translate3d(${phonePos.x}px, ${phonePos.y}px, 0)`,
            width: `${phoneSize.width}px`,
            height: `${phoneSize.height}px`,
            transition: isDraggingPhone || isResizingPhone ? "none" : undefined,
          }}
          className="flex fixed top-0 left-0 z-40 max-h-[calc(100vh-16px)] max-w-[calc(100vw-16px)] rounded-2xl border border-white/15 bg-black/60 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-md flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 group/phone"
        >
          {/* Header thanh điều khiển điện thoại (vùng nắm kéo thả mỏng gọn, không che bàn) */}
          <div
            onPointerDown={handlePhonePointerDown}
            className={cn(
              "shrink-0 h-[30px] px-2.5 flex items-center justify-between bg-[#0f1218]/95 border-b border-white/10 select-none",
              isDraggingPhone ? "cursor-grabbing" : "cursor-grab"
            )}
            title="Nhấn giữ để di chuyển điện thoại tự do trên màn hình"
          >
            <div className="flex items-center gap-1.5 pointer-events-none">
              <GripHorizontal className="size-3 text-zinc-500" />
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 font-bold truncate">
                Điện thoại nạn nhân
              </span>
            </div>
            <div className="flex items-center gap-1 pointer-events-auto">
              <Link
                href="/evidence/victim-phone"
                target="_blank"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-100 border border-white/10 text-[10px] font-sans transition-all"
                title="Mở trong tab mới"
              >
                <ExternalLink className="size-2.5" />
                <span className="hidden sm:inline">Mở riêng</span>
              </Link>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="size-5 rounded flex items-center justify-center bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 transition-all cursor-pointer"
                title="Cất điện thoại"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>

          {/* Màn hình điện thoại tương tác: Ôm sát thân máy, không viền đen thừa */}
          <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden p-0 bg-transparent relative">
            <PhoneSimulator
              onClose={() => setActiveModal(null)}
              device={caseId ? { caseId } : undefined}
            />
          </div>

          {/* Tay cầm co kéo Resize ở góc dưới phải */}
          <div
            onPointerDown={handlePhoneResizeStart}
            className="absolute bottom-0.5 right-0.5 size-4 flex items-end justify-end p-0.5 cursor-se-resize z-50 group/handle select-none"
            title="Kéo để thay đổi kích thước theo đúng tỷ lệ"
          >
            <svg
              className="size-2.5 text-zinc-500 group-hover/handle:text-amber-400 transition-colors"
              viewBox="0 0 6 6"
              fill="currentColor"
            >
              <circle cx="5" cy="5" r="0.75" />
              <circle cx="5" cy="2.5" r="0.75" />
              <circle cx="2.5" cy="5" r="0.75" />
            </svg>
          </div>
        </div>
      )}

      {/* 3. MẶT BÀN HỒ SƠ PHẲNG (DOSSIER CANVAS TRẢI TOÀN MÀN HÌNH - KHÔNG BỊ PHONE ĐÈ MẤT NỮA) */}
      <div className="h-full flex-col flex-1 min-w-[320px] min-h-0 overflow-hidden relative flex">
        <DossierCanvasBoard
          caseId={caseId}
          pdfItems={pdfItems}
          evidenceItems={evidenceItems}
          dossierDocuments={dossierDocs}
          selectedView={selectedView}
          onSelectPdf={onSelectPdf}
          onSelectEvidence={onSelectEvidence}
          onOpenInspectModal={(view) => {
            setSelectedView(view);
            setActiveModal("mobile_pdf");
          }}
          onSwitchToSingleView={onSwitchToSingleView}
          isExpanded={false}
          onToggleExpand={() => {}}
          activeFilter={String(selectedPhaseFilter)}
          onOpenNotebook={() => setActiveModal("notebook")}
          onToggleDossierTray={() => setIsDossierCollapsed((prev) => !prev)}
          onOpenIndictment={() => setActiveModal("indictment")}
        />
      </div>

      {/* 4. NÚT MỞ LẠI KHAY HỒ SƠ NỔI (GÓC PHẢI TRÊN KHI ĐANG THU GỌN) */}
      {isDossierCollapsed && (
        <button
          type="button"
          onClick={() => setIsDossierCollapsed(false)}
          className="flex items-center gap-2 absolute top-3 right-3 z-30 px-3.5 py-2 rounded-lg bg-[#11141b]/95 hover:bg-[#1a1f29] border border-[#262e3b] hover:border-zinc-400/50 text-zinc-200 hover:text-white shadow-2xl backdrop-blur-md font-mono text-xs font-bold transition-all cursor-pointer group active:scale-95"
          title="Mở Khay hồ sơ & Vật chứng"
        >
          <FolderOpen className="size-4 text-zinc-300 transition-transform group-hover:scale-110" />
          <span>Khay hồ sơ</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-zinc-700/50 text-zinc-300">
            {pdfItems.length + evidenceItems.length}
          </span>
        </button>
      )}

      {/* 5. KHAY HỒ SƠ FLOATING (TRƯỢT RA TỪ BÊN PHẢI) */}
      <DossierTray
        className="absolute top-0 right-0 bottom-0 z-30 h-full shadow-2xl"
        dossierWidth={340}
        isDossierCollapsed={isDossierCollapsed}
        onToggleCollapse={() => setIsDossierCollapsed((prev) => !prev)}
        isViewerExpanded={false}
        mobileTab="dossier"
        filterTab={filterTab}
        onSetFilterTab={onSetFilterTab}
        selectedPhaseFilter={selectedPhaseFilter}
        onSetPhaseFilter={onSetPhaseFilter}
        isPhaseUnlocked={isPhaseUnlocked}
        isDossierUnlocked={isDossierUnlocked}
        dossiers={dossiers}
        pdfItems={pdfItems}
        evidenceItems={evidenceItems}
        selectedView={selectedView}
        onSelectPdf={onSelectPdf}
        onSelectEvidence={onSelectEvidence}
        activePing={activePing}
        onBroadcastPing={broadcastPing}
      />
    </div>
  );
}
