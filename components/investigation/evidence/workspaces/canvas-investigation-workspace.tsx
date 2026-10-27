"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  SquareKanban,
  FolderOpen,
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  Minus,
  GripHorizontal,
  Smartphone,
  Compass,
  BookOpen,
  Users,
  HelpCircle,
  MessageSquareWarning,
  FileText,
  Sparkles,
} from "lucide-react";
import { CanvasGuideModal } from "@/components/investigation/evidence/canvas-guide/canvas-guide-modal";
import { CanvasWalkthroughTour } from "@/components/investigation/evidence/canvas-guide/canvas-walkthrough-tour";
import { BrandMark } from "@/components/investigation/brand-mark";
import { UserNav } from "@/components/auth/user-nav";
import { RoomModal } from "@/components/investigation/room-modal";
import { cn } from "@/lib/utils";
import { MainInvestigationCanvas } from "@/components/investigation/mindmap/main-investigation-canvas";
import { DossierCanvasBoard } from "@/components/investigation/evidence/dossier-canvas-board";
import { DossierTray, type ActiveInspectorInfo } from "@/components/investigation/evidence/dossier-tray";
import { PhoneSimulator } from "@/components/phone-engine/phone-simulator";
import { useInvestigationEvent, emitInvestigationEvent } from "@/lib/investigation-events";
import { AddSuspectModal } from "@/components/investigation/mindmap/add-suspect-modal";
import { FollowupQuestionModal } from "@/components/investigation/mindmap/followup-question-modal";
import { CustomPinModal } from "@/components/investigation/mindmap/custom-pin-modal";
import { DetectiveNotebookModal } from "@/components/investigation/detective-notebook-modal";
import type { PinPoint } from "@/components/investigation/hero-interactive";
import { getStorageJson, setStorageItem } from "@/lib/storage";
import { caseStorageKey } from "@/lib/cases/case-id";
import { getCanonicalSuspectKey } from "@/lib/cases/characters";
import { isVictimReference } from "@/lib/cases/case-characters";
import { detectiveAudio } from "@/lib/investigation-audio";
import { toast } from "@/components/ui/toast";
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
  const [isBoardFullscreen, setIsBoardFullscreen] = useState(false);
  const [isDossierCollapsed, setIsDossierCollapsed] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showFirstTimePill, setShowFirstTimePill] = useState(false);

  React.useEffect(() => {
    try {
      const seen = localStorage.getItem("dect_canvas_guide_seen_v1");
      if (!seen) {
        const timer = setTimeout(() => setShowFirstTimePill(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleDismissPill = () => {
    setShowFirstTimePill(false);
    try {
      localStorage.setItem("dect_canvas_guide_seen_v1", "true");
    } catch {}
  };

  const handleStartTourFromPill = () => {
    handleDismissPill();
    setIsTourOpen(true);
  };

  type InspectorItem =
    | { type: "suspect"; data: any; label: string; pinId?: string }
    | { type: "followup"; data: string | null; label: string; pinId?: string }
    | { type: "custom_pin"; data: PinPoint; label: string; pinId?: string }
    | null;

  const [activeInspector, setActiveInspector] = useState<InspectorItem>(null);

  const [customDossierWidth, setCustomDossierWidth] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dect_canvas_dossier_width");
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 280 && parsed <= 800) return parsed;
        }
      } catch {}
    }
    return null;
  });

  const defaultDossierWidth = activeInspector ? 440 : 340;
  const currentDossierWidth = customDossierWidth ?? defaultDossierWidth;

  const handleResizeDossier = (newWidth: number) => {
    setCustomDossierWidth(newWidth);
    try {
      localStorage.setItem("dect_canvas_dossier_width", String(newWidth));
    } catch {}
  };

  const handleResetDossierWidth = () => {
    setCustomDossierWidth(null);
    try {
      localStorage.removeItem("dect_canvas_dossier_width");
    } catch {}
  };

  const handleOpenSuspectInspector = (suspect: any, pinId?: string) => {
    setActiveInspector({
      type: "suspect",
      data: suspect,
      label: suspect?.name ? `Nghi phạm: ${suspect.name}` : "Nghi phạm",
      pinId,
    });
    setIsDossierCollapsed(false);
  };

  const handleOpenFollowupInspector = (culprit: string | null, pinId?: string) => {
    setActiveInspector({
      type: "followup",
      data: culprit,
      label: culprit ? `Nghi vấn: ${culprit}` : "Nghi vấn",
      pinId,
    });
    setIsDossierCollapsed(false);
  };

  const handleOpenPinInspector = (pin: PinPoint, pinId?: string) => {
    setActiveInspector({
      type: "custom_pin",
      data: pin,
      label: pin?.label ? `Ghim: ${pin.label}` : "Manh mối",
      pinId: pinId || pin?.id,
    });
    setIsDossierCollapsed(false);
  };

  // Sổ tay thám tử hiển thị modal riêng biệt (giống như điện thoại nạn nhân), không chèn vào sidebar khay hồ sơ
  const handleOpenNotebook = () => {
    setActiveModal("notebook");
  };

  const handleCloseInspector = () => {
    setActiveInspector(null);
  };

  useInvestigationEvent("OPEN_NOTEBOOK", () => {
    handleOpenNotebook();
  });

  const renderInspectorContent = () => {
    if (!activeInspector) return null;

    if (activeInspector.type === "suspect") {
      return (
        <AddSuspectModal
          key={`inspector-suspect-${activeInspector.data?.id || "new"}`}
          caseId={caseId}
          isOpen={true}
          embedded={true}
          editingSuspect={activeInspector.data}
          onClose={handleCloseInspector}
          onSave={(savedSuspect) => {
            const sKey = (k: string) => caseStorageKey(caseId, k);
            const { canonicalId, canonicalName } = getCanonicalSuspectKey(savedSuspect);
            if (!isVictimReference(canonicalId)) {
              const rawSuspects = getStorageJson<any[]>(sKey("canvas_suspects"), []);
              const normalizedItem = {
                ...savedSuspect,
                id: canonicalId,
                name: canonicalName || savedSuspect.name,
              };
              const existingIndex = rawSuspects.findIndex(
                (s) => s.id === canonicalId || s.id === savedSuspect.id
              );
              let updated: any[];
              if (existingIndex >= 0) {
                updated = [...rawSuspects];
                updated[existingIndex] = normalizedItem;
              } else {
                updated = [...rawSuspects, normalizedItem];
              }
              setStorageItem(sKey("canvas_suspects"), JSON.stringify(updated));
              emitInvestigationEvent("REFRESH_CANVAS_STATE");
              toast.success("Đã lưu hồ sơ nghi phạm!");
            }
          }}
          onDelete={(id) => {
            const sKey = (k: string) => caseStorageKey(caseId, k);
            const rawSuspects = getStorageJson<any[]>(sKey("canvas_suspects"), []);
            const updated = rawSuspects.filter((s) => s.id !== id);
            setStorageItem(sKey("canvas_suspects"), JSON.stringify(updated));
            emitInvestigationEvent("REFRESH_CANVAS_STATE");
            handleCloseInspector();
          }}
          onSubmitConclusion={(culprit) => {
            detectiveAudio.playStampSound();
            detectiveAudio.playUnlockJingle();
            const sKey = (k: string) => caseStorageKey(caseId, k);
            const prev = getStorageJson<string[]>(sKey("investigated_suspects"), []);
            const next = Array.from(new Set([...prev, culprit]));
            setStorageItem(sKey("investigated_suspects"), JSON.stringify(next));
            emitInvestigationEvent("REFRESH_CANVAS_STATE");
            setActiveModal("epilogue");
          }}
        />
      );
    }

    if (activeInspector.type === "followup") {
      return (
        <FollowupQuestionModal
          key={`inspector-followup-${activeInspector.data}`}
          caseId={caseId}
          isOpen={true}
          embedded={true}
          subjectKey={activeInspector.data}
          culprit={activeInspector.data}
          onClose={handleCloseInspector}
          onSuccess={(culprit, choice) => {
            const sKey = (k: string) => caseStorageKey(caseId, k);
            const prev = getStorageJson<string[]>(sKey("solved_followups"), []);
            const next = Array.from(new Set([...prev, culprit]));
            setStorageItem(sKey("solved_followups"), JSON.stringify(next));
            setStorageItem(sKey(`followup_${culprit}`), "true");
            if (choice) {
              setStorageItem(sKey(`followup_${culprit}_choice`), choice);
            }
            emitInvestigationEvent("REFRESH_CANVAS_STATE");
          }}
        />
      );
    }

    if (activeInspector.type === "custom_pin") {
      return (
        <CustomPinModal
          key={`inspector-pin-${activeInspector.data?.id || "custom"}`}
          caseId={caseId}
          isOpen={true}
          embedded={true}
          pin={activeInspector.data}
          onClose={handleCloseInspector}
          onSolve={(_pinId) => {
            toast.success("Đã hoàn thành câu hỏi ghim!");
            emitInvestigationEvent("REFRESH_CANVAS_STATE");
          }}
        />
      );
    }



    return null;
  };

  const defaultBoardHeight = () => {
    if (typeof window !== "undefined") {
      return Math.max(450, Math.min(Math.round(window.innerHeight * 0.58), 540));
    }
    return 500;
  };

  // Kích thước co kéo của Bảng điều tra (chiều cao tính theo % hoặc px, chiều rộng tự động khóa tỉ lệ 896/1200)
  // Mặc định chiếm ~56-58% chiều cao màn hình (rộng ~370-400px), vừa vặn mắt nhìn và không che mặt bàn
  const [boardHeight, setBoardHeight] = useState<number>(defaultBoardHeight);
  const isResizingRef = React.useRef(false);
  const startDragYRef = React.useRef(0);
  const startHeightRef = React.useRef(0);

  // Phím tắt ESC để thoát chế độ xem toàn màn hình của bảng điều tra
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isBoardFullscreen) {
        setIsBoardFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBoardFullscreen]);

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

  // Vị trí kéo thả tự do của Sổ tay thám tử
  const [notebookPos, setNotebookPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== "undefined") {
      const defaultX = Math.max(80, Math.min(window.innerWidth - 440, 380));
      return { x: defaultX, y: 70 };
    }
    return { x: 380, y: 70 };
  });
  const [isDraggingNotebook, setIsDraggingNotebook] = useState(false);
  const notebookDragRef = React.useRef({
    startX: 0,
    startY: 0,
    startPosX: 380,
    startPosY: 70,
  });

  const handleNotebookPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input") || target.closest("textarea")) {
      return;
    }
    e.preventDefault();
    setIsDraggingNotebook(true);
    notebookDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: notebookPos.x,
      startPosY: notebookPos.y,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      const deltaX = ev.clientX - notebookDragRef.current.startX;
      const deltaY = ev.clientY - notebookDragRef.current.startY;

      const maxX = Math.max(0, window.innerWidth - 200);
      const maxY = Math.max(0, window.innerHeight - 80);

      const nextX = Math.max(0, Math.min(maxX, notebookDragRef.current.startPosX + deltaX));
      const nextY = Math.max(0, Math.min(maxY, notebookDragRef.current.startPosY + deltaY));

      setNotebookPos({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDraggingNotebook(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Kích thước co kéo tự do của Sổ tay thám tử
  const [notebookSize, setNotebookSize] = useState<{ width: number; height: number }>({
    width: 400,
    height: 480,
  });
  const [isResizingNotebook, setIsResizingNotebook] = useState(false);
  const notebookResizeRef = React.useRef({
    startX: 0,
    startY: 0,
    startW: 400,
    startH: 480,
  });

  const handleNotebookResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingNotebook(true);
    notebookResizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: notebookSize.width,
      startH: notebookSize.height,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      const deltaX = ev.clientX - notebookResizeRef.current.startX;
      const deltaY = ev.clientY - notebookResizeRef.current.startY;

      const minW = 280;
      const maxW = Math.max(minW, Math.min(window.innerWidth - notebookPos.x - 16, 750));
      const minH = 280;
      const maxH = Math.max(minH, Math.min(window.innerHeight - notebookPos.y - 16, 800));

      const nextW = Math.max(minW, Math.min(maxW, notebookResizeRef.current.startW + deltaX));
      const nextH = Math.max(minH, Math.min(maxH, notebookResizeRef.current.startH + deltaY));

      setNotebookSize({ width: nextW, height: nextH });
    };

    const handlePointerUp = () => {
      setIsResizingNotebook(false);
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
  useInvestigationEvent("OPEN_CANVAS_GUIDE", () => {
    setIsGuideModalOpen(true);
  });
  useInvestigationEvent("OPEN_CANVAS_TOUR", () => {
    setIsTourOpen(true);
  });

  // Xác định node cần highlight trên bảng điều tra khi modal/inspector đang mở
  const boardActivePinId = useMemo(() => {
    if (activeInspector) {
      if (activeInspector.pinId) return activeInspector.pinId;
      if (activeInspector.type === "suspect") {
        return activeInspector.data?.id || activeInspector.data?.subjectKey || null;
      }
      if (activeInspector.type === "followup") {
        return activeInspector.data || null;
      }
      if (activeInspector.type === "custom_pin") {
        return activeInspector.data?.id || null;
      }
    }
    if (activeModal === "phone") return "phone";
    if (activeModal === "reinvestigate") return "reinvestigate";
    if (activeModal === "indictment") return "indictment";
    return null;
  }, [activeInspector, activeModal]);

  return (
    <div className="w-full h-full flex-1 min-h-0 flex items-stretch justify-start overflow-hidden min-w-0 relative gap-0 p-0 select-none">
      {/* 0. SIDEBAR LIỀN BÊN TRÁI: DOCK CỐ ĐỊNH TẤT CẢ LỐI TẮT NGHIỆP VỤ & HỆ THỐNG */}
      <aside
        id="canvas-left-sidebar"
        data-tour="canvas-left-dock"
        aria-label="Thanh điều hướng nghiệp vụ điều tra"
        className={cn(
          "w-16 sm:w-[68px] h-full shrink-0 z-30 bg-[#0d0f14]/98 border-r border-[#262c38] backdrop-blur-xl flex flex-col justify-between items-center py-2 px-1 select-none transition-all duration-200 overflow-y-auto overflow-x-hidden scrollbar-none",
          isBoardFullscreen && "opacity-20 pointer-events-none"
        )}
      >
        {/* PHẦN TRÊN: LOGO THƯƠNG HIỆU + CÁC CÔNG CỤ ĐIỀU TRA CHÍNH */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {/* Logo XPLORE (phiên bản favicon) ở đỉnh sidebar */}
          <div className="pt-0.5 pb-1 w-full flex items-center justify-center">
            <BrandMark
              href="/"
              variant="favicon"
              className="flex items-center justify-center p-1 rounded-xl hover:bg-zinc-800/60 transition-colors"
              imageClassName="size-7.5 sm:size-8 object-contain"
            />
          </div>

          {/* 1. Khay tài liệu */}
          <button
            type="button"
            onClick={() => setIsDossierCollapsed((prev) => !prev)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 active:scale-95 transition-all cursor-pointer group select-none",
              !isDossierCollapsed && "bg-zinc-800/70 text-zinc-100 font-semibold shadow-xs"
            )}
            title={!isDossierCollapsed ? "Thu gọn Khay tài liệu" : "Mở Khay tài liệu"}
          >
            <FolderOpen
              className={cn(
                "size-5 transition-transform group-hover:scale-105",
                !isDossierCollapsed ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"
              )}
            />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Tài liệu
            </span>
          </button>

          {/* 2. Bảng điều tra */}
          <button
            type="button"
            onClick={() => setIsBoardOpen((prev) => !prev)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 active:scale-95 transition-all cursor-pointer group select-none",
              isBoardOpen && "bg-zinc-800/70 text-zinc-100 font-semibold shadow-xs"
            )}
            title={isBoardOpen ? "Thu gọn Bảng điều tra" : "Mở Bảng điều tra"}
          >
            <SquareKanban
              className={cn(
                "size-5 transition-transform group-hover:scale-105",
                isBoardOpen ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"
              )}
            />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Bảng
            </span>
          </button>

          {/* 3. Điện thoại nạn nhân */}
          <button
            type="button"
            onClick={() => setActiveModal(activeModal === "phone" ? null : "phone")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 active:scale-95 transition-all cursor-pointer group select-none",
              activeModal === "phone" && "bg-zinc-800/70 text-zinc-100 font-semibold shadow-xs"
            )}
            title="Điện thoại nạn nhân"
          >
            <Smartphone
              className={cn(
                "size-5 transition-transform group-hover:scale-105",
                activeModal === "phone" ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"
              )}
            />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Điện thoại
            </span>
          </button>

          {/* 4. Khám xét lại hiện trường 360 */}
          <button
            type="button"
            onClick={() => setActiveModal(activeModal === "reinvestigate" ? null : "reinvestigate")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 active:scale-95 transition-all cursor-pointer group select-none",
              activeModal === "reinvestigate" && "bg-zinc-800/70 text-zinc-100 font-semibold shadow-xs"
            )}
            title="Khám xét lại hiện trường 360"
          >
            <Compass
              className={cn(
                "size-5 transition-transform group-hover:scale-105",
                activeModal === "reinvestigate" ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"
              )}
            />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Hiện trường
            </span>
          </button>

          {/* 5. Sổ tay điều tra */}
          <button
            type="button"
            onClick={handleOpenNotebook}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 active:scale-95 transition-all cursor-pointer group select-none",
              activeModal === "notebook" && "bg-zinc-800/70 text-zinc-100 font-semibold shadow-xs"
            )}
            title="Sổ tay ghi chép nghiệp vụ"
          >
            <BookOpen
              className={cn(
                "size-5 transition-transform group-hover:scale-105",
                activeModal === "notebook" ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"
              )}
            />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Sổ tay
            </span>
          </button>
        </div>

        {/* PHẦN DƯỚI: TIỆN ÍCH HỆ THỐNG, CHƠI NHÓM & USER PROFILE */}
        <div className="flex flex-col items-center gap-1.5 w-full pt-1">
          {/* 6. Chơi nhóm */}
          <button
            type="button"
            onClick={() => setIsRoomModalOpen(true)}
            className="flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 active:scale-95 transition-all cursor-pointer group select-none relative"
            title="Chơi nhóm đồng bộ thời gian thực"
          >
            <Users className="size-4.5 text-zinc-400 group-hover:text-zinc-200 transition-transform group-hover:scale-105" />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Nhóm
            </span>
          </button>

          {/* 7. Chuyển sang Xem lẻ */}
          <button
            type="button"
            onClick={onSwitchToSingleView}
            className="flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 active:scale-95 transition-all cursor-pointer group select-none"
            title="Chuyển sang chế độ Xem lẻ"
          >
            <FileText className="size-4.5 text-zinc-400 group-hover:text-zinc-200 transition-transform group-hover:scale-105" />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Xem lẻ
            </span>
          </button>

          {/* 8. Hướng dẫn nghiệp vụ Bàn hồ sơ */}
          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className="flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 active:scale-95 transition-all cursor-pointer group select-none"
            title="Cẩm nang tác nghiệp Bàn hồ sơ"
          >
            <HelpCircle className="size-4.5 text-zinc-400 group-hover:text-zinc-200 transition-transform group-hover:scale-105" />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Chỉ dẫn
            </span>
          </button>

          {/* 9. Báo lỗi */}
          <button
            type="button"
            onClick={() => emitInvestigationEvent("OPEN_FEEDBACK")}
            className="flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 active:scale-95 transition-all cursor-pointer group select-none"
            title="Báo lỗi & Góp ý"
          >
            <MessageSquareWarning className="size-4.5 text-zinc-400 group-hover:text-zinc-200 transition-transform group-hover:scale-105" />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Báo lỗi
            </span>
          </button>

          {/* 10. Avatar Profile (UserNav) */}
          <div className="pt-1.5 pb-0.5 flex items-center justify-center w-full">
            <UserNav size="sm" placement="sidebar" />
          </div>
        </div>
      </aside>

      {/* KHÔNG GIAN BÀN HỒ SƠ & CÁC CỬA SỔ FLOATING */}
      <div className="h-full flex-1 min-w-0 min-h-0 relative flex flex-col overflow-hidden">
        {/* GỢI Ý KHÁM PHÁ LẦN ĐẦU CHO NGƯỜI CHƠI MỚI (TỰ ĐỘNG BIẾN MẤT HOẶC BỎ QUA) */}
        {showFirstTimePill && !isTourOpen && !isGuideModalOpen && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#16120e]/95 border border-[#4a3625] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200 text-xs font-sans text-zinc-200 select-none">
            <Sparkles className="size-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-medium text-amber-100 hidden sm:inline">
              Lần đầu dùng Bàn hồ sơ?
            </span>
            <button
              type="button"
              onClick={handleStartTourFromPill}
              className="px-2.5 py-1 rounded-full bg-[#d9a066] hover:bg-[#e6b986] active:bg-[#c89257] text-[#140e08] font-semibold text-[11px] transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Xem hướng dẫn (1 phút)
            </button>
            <button
              type="button"
              onClick={handleDismissPill}
              className="size-5 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Bỏ qua"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        {/* 1. NÚT MỞ BẢNG ĐIỀU TRA NỔI (GÓC PHẢI TRÊN KHI ĐANG ĐÓNG) */}
        {!isBoardOpen && (
          <button
            type="button"
            onClick={() => setIsBoardOpen(true)}
            className={cn(
              "flex items-center gap-2 absolute top-3 right-3 z-30 px-3.5 py-2 rounded-lg bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-500/80 text-zinc-200 hover:text-white shadow-xl backdrop-blur-md font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer group active:scale-95",
              isBoardFullscreen && "opacity-0 pointer-events-none"
            )}
            title="Mở Bảng điều tra (Ghim manh mối)"
          >
            <SquareKanban className="size-4 text-zinc-400 group-hover:text-zinc-100 transition-transform group-hover:scale-105" />
            <span>Bảng điều tra</span>
          </button>
        )}

      {/* 1.5. LỚP PHỦ NỀN KHI XEM BẢNG TOÀN MÀN HÌNH */}
      {isBoardOpen && isBoardFullscreen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsBoardFullscreen(false)}
        />
      )}

      {/* 2. BẢNG ĐIỀU TRA FLOATING / TOÀN MÀN HÌNH (TỶ LỆ DỌC CHUẨN 896/1200 - GÓC PHẢI BÀN) */}
      {isBoardOpen && (
        <div
          data-tour="canvas-floating-board"
          style={
            isBoardFullscreen
              ? { height: "calc(100vh - 36px)", maxHeight: "calc(100vh - 36px)" }
              : { height: `${boardHeight}px` }
          }
          className={cn(
            "flex aspect-[896/1200] rounded-md border-0 bg-transparent flex-col overflow-visible transition-[height,transform] duration-150",
            isBoardFullscreen
              ? "fixed inset-0 m-auto z-50 shadow-[0_30px_90px_rgba(0,0,0,0.98)]"
              : "absolute top-3 right-3 z-30 max-h-[calc(100%-24px)] w-auto max-w-[48vw] shadow-2xl shadow-black/95"
          )}
        >
          {/* 2 DÂY THỪNG / DÂY TREO BẢNG (CHỈ HIỆN KHI Ở DẠNG TREO GÓC BÀN) */}
          {!isBoardFullscreen && (
            <>
              {/* Dây bên trái */}
              <div className="absolute -top-12 left-[18%] z-50 flex flex-col items-center pointer-events-none">
                <div className="w-[3px] h-14 bg-gradient-to-b from-[#150e09] via-[#4d3824] to-[#241a11] shadow-[1px_0_3px_rgba(0,0,0,0.9)]" />
              </div>

              {/* Dây bên phải */}
              <div className="absolute -top-12 right-[18%] z-50 flex flex-col items-center pointer-events-none">
                <div className="w-[3px] h-14 bg-gradient-to-b from-[#150e09] via-[#4d3824] to-[#241a11] shadow-[1px_0_3px_rgba(0,0,0,0.9)]" />
              </div>
            </>
          )}

          {/* DẢI NÚT ĐIỀU KHIỂN DỌC Ở VIỀN TRÁI BẢNG (DOCKED LEFT-EDGE BUTTONS) */}
          <div className="absolute top-2 -left-6 z-40 flex flex-col gap-0.5 p-0.5 bg-zinc-900/95 border border-r-0 border-zinc-700/60 rounded-l shadow-xl backdrop-blur-md select-none">
            {/* 1. Xem toàn màn hình / Thu nhỏ lại */}
            <button
              type="button"
              onClick={() => setIsBoardFullscreen((prev) => !prev)}
              className="size-5.5 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer group"
              title={isBoardFullscreen ? "Thu nhỏ về góc bàn (Esc)" : "Xem toàn màn hình"}
            >
              {isBoardFullscreen ? (
                <Minimize2 className="size-3 transition-transform group-hover:scale-110 text-zinc-200" />
              ) : (
                <Maximize2 className="size-3 transition-transform group-hover:scale-110 text-zinc-400 group-hover:text-zinc-200" />
              )}
            </button>

            {/* 2. Thu gọn / Cất bảng điều tra */}
            <button
              type="button"
              onClick={() => {
                setIsBoardFullscreen(false);
                setIsBoardOpen(false);
              }}
              className="size-5.5 flex items-center justify-center rounded hover:bg-rose-950/70 text-zinc-400 hover:text-rose-300 transition-all cursor-pointer group"
              title="Thu gọn / Cất bảng điều tra"
            >
              <Minus className="size-3 transition-transform group-hover:scale-110" />
            </button>
          </div>

          {/* Canvas Bảng Điều Tra (Ẩn title, group play, audio, notebook) */}
          <div className="flex-1 w-full h-full min-h-0 relative overflow-hidden rounded-md border border-black/40">
            <MainInvestigationCanvas
              caseId={caseId}
              isBoardGame={false}
              hideTitleBadge={true}
              hideGroupPlay={true}
              hideAudio={true}
              hideNotebook={true}
              activePinId={boardActivePinId}
              onOpenPhoneSimulator={() => setActiveModal("phone")}
              onOpenReinvestigation={() => setActiveModal("reinvestigate")}
              onOpenEpilogue={() => setActiveModal("epilogue")}
              onSelectSuspectInspector={handleOpenSuspectInspector}
              onSelectFollowupInspector={handleOpenFollowupInspector}
              onSelectPinInspector={handleOpenPinInspector}
            />
          </div>

          {/* GÓC RESIZE CO KÉO BẢNG ĐIỀU TRA (GÓC DƯỚI TRÁI KHI Ở BÊN PHẢI) */}
          {!isBoardFullscreen && (
            <div
              onMouseDown={handleResizeStart}
              className="absolute bottom-0 left-0 z-40 size-7 sm:size-8 cursor-nesw-resize flex items-end justify-start p-1.5 group select-none transition-colors"
              title="Kéo để thay đổi kích thước bảng điều tra (giữ đúng tỉ lệ)"
            >
              <svg
                className="size-4 text-zinc-400 group-hover:text-zinc-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-colors rotate-90"
                viewBox="0 0 10 10"
                fill="currentColor"
              >
                <circle cx="8.5" cy="8.5" r="1.1" />
                <circle cx="8.5" cy="5" r="1.1" />
                <circle cx="8.5" cy="1.5" r="1.1" />
                <circle cx="5" cy="8.5" r="1.1" />
                <circle cx="5" cy="5" r="1.1" />
                <circle cx="1.5" cy="8.5" r="1.1" />
              </svg>
            </div>
          )}
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
            className="absolute bottom-0 right-0 size-6 flex items-end justify-end p-1 cursor-se-resize z-50 group/handle select-none transition-colors"
            title="Kéo để thay đổi kích thước theo đúng tỷ lệ"
          >
            <svg
              className="size-3 text-zinc-400 group-hover/handle:text-amber-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-colors"
              viewBox="0 0 10 10"
              fill="currentColor"
            >
              <circle cx="8.5" cy="8.5" r="1.1" />
              <circle cx="8.5" cy="5" r="1.1" />
              <circle cx="8.5" cy="1.5" r="1.1" />
              <circle cx="5" cy="8.5" r="1.1" />
              <circle cx="5" cy="5" r="1.1" />
              <circle cx="1.5" cy="8.5" r="1.1" />
            </svg>
          </div>
        </div>
      )}

      {/* 2.6. SỔ TAY THÁM TỬ FLOATING (KÉO THẢ TỰ DO KHÔNG LÀM MỜ ĐẰNG SAU, RESIZE TỰ DO) */}
      {activeModal === "notebook" && (
        <div
          style={{
            transform: `translate3d(${notebookPos.x}px, ${notebookPos.y}px, 0)`,
            width: `${notebookSize.width}px`,
            height: `${notebookSize.height}px`,
            transition: isDraggingNotebook || isResizingNotebook ? "none" : undefined,
          }}
          className="flex fixed top-0 left-0 z-40 max-h-[calc(100vh-16px)] max-w-[calc(100vw-16px)] rounded-xl border border-[#3d2c1e]/70 bg-[#f8f6f0] shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 group/notebook select-none"
        >
          {/* Header thanh điều khiển sổ tay (vùng nắm kéo thả mỏng gọn, không che bàn) */}
          <div
            onPointerDown={handleNotebookPointerDown}
            className={cn(
              "shrink-0 h-[32px] px-3 flex items-center justify-between bg-[#eae5d9] border-b border-[#d8d0c2] select-none",
              isDraggingNotebook ? "cursor-grabbing" : "cursor-grab"
            )}
            title="Nhấn giữ để di chuyển sổ tay tự do trên màn hình"
          >
            <div className="flex items-center gap-1.5 pointer-events-none">
              <GripHorizontal className="size-3 text-[#6e5845]" />
              <BookOpen className="size-3.5 text-[#5c4938]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#3d2f24] font-bold truncate">
                Sổ tay thám tử
              </span>
            </div>
            <div className="flex items-center gap-1 pointer-events-auto">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="size-5 rounded flex items-center justify-center bg-black/5 hover:bg-rose-500/20 text-[#6e5845] hover:text-rose-700 transition-all cursor-pointer"
                title="Đóng sổ tay"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Ruột sổ tay tương tác */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-0 bg-transparent relative">
            <DetectiveNotebookModal
              caseId={caseId}
              isOpen={true}
              embedded={true}
              hideHeader={true}
              onClose={() => setActiveModal(null)}
            />
          </div>

          {/* Tay cầm co kéo Resize ở góc dưới phải */}
          <div
            onPointerDown={handleNotebookResizeStart}
            className="absolute bottom-0 right-0 size-6 flex items-end justify-end p-1 cursor-se-resize z-50 group/handle select-none transition-colors"
            title="Kéo để thay đổi kích thước sổ tay"
          >
            <svg
              className="size-3 text-[#8c735d] group-hover/handle:text-amber-700 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-colors"
              viewBox="0 0 10 10"
              fill="currentColor"
            >
              <circle cx="8.5" cy="8.5" r="1.1" />
              <circle cx="8.5" cy="5" r="1.1" />
              <circle cx="8.5" cy="1.5" r="1.1" />
              <circle cx="5" cy="8.5" r="1.1" />
              <circle cx="5" cy="5" r="1.1" />
              <circle cx="1.5" cy="8.5" r="1.1" />
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
          onOpenNotebook={handleOpenNotebook}
          onToggleDossierTray={() => setIsDossierCollapsed((prev) => !prev)}
          onOpenIndictment={() => setActiveModal("indictment")}
          isBoardFullscreen={isBoardFullscreen}
        />
      </div>

      {/* 5. KHAY HỒ SƠ FLOATING (TRƯỢT RA TỪ BÊN TRÁI CẠNH SIDEBAR) */}
      <DossierTray
        className={cn(
          "absolute top-0 left-0 bottom-0 z-30 h-full shadow-2xl transition-all duration-300",
          isBoardFullscreen && "opacity-0 pointer-events-none"
        )}
        highlightSelected={false}
        dossierWidth={currentDossierWidth}
        resizable="right"
        onResizeWidth={handleResizeDossier}
        onResetWidth={handleResetDossierWidth}
        minWidth={280}
        maxWidth={750}
        isDossierCollapsed={isDossierCollapsed}
        onToggleCollapse={() => setIsDossierCollapsed((prev) => !prev)}
        isViewerExpanded={false}
        mobileTab="dossier"
        filterTab={filterTab}
        onSetFilterTab={onSetFilterTab}
        activeInspector={activeInspector}
        onCloseInspector={handleCloseInspector}
        inspectorContent={renderInspectorContent()}
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

      {/* MODAL PHÒNG CHƠI NHÓM */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
      />

      {/* CẨM NANG HƯỚNG DẪN BÀN HỒ SƠ */}
      <CanvasGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onStartTour={() => setIsTourOpen(true)}
      />

      {/* TOUR TRỰC QUAN TƯƠNG TÁC TỪNG BƯỚC */}
      <CanvasWalkthroughTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={() => {
          try {
            localStorage.setItem("dect_canvas_guide_seen_v1", "true");
          } catch {}
        }}
      />
    </div>
  );
}
