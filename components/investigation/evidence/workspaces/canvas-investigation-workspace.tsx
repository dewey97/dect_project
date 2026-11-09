"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  SquareKanban,
  X,
  Users,
  HelpCircle,
  MessageSquareWarning,
  FileText,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { CanvasGuideModal } from "@/components/investigation/evidence/canvas-guide/canvas-guide-modal";
import { CanvasWalkthroughTour } from "@/components/investigation/evidence/canvas-guide/canvas-walkthrough-tour";
import { BrandMark } from "@/components/investigation/brand-mark";
import { UserNav } from "@/components/auth/user-nav";
import { RoomModal } from "@/components/investigation/room/room-modal";
import { RoomPresenceBar } from "@/components/investigation/room/room-presence-bar";
import { cn } from "@/lib/utils";
import { MainInvestigationCanvas } from "@/components/investigation/board/main-investigation-canvas";
import { DossierCanvasBoard } from "@/components/investigation/evidence/dossier-canvas-board";
import { DossierTray } from "@/components/investigation/evidence/dossier-tray";
import { PhoneSimulator } from "@/components/phone-engine/phone-simulator";
import { useInvestigationEvent, emitInvestigationEvent } from "@/lib/investigation/investigation-events";
import { AddSuspectModal } from "@/components/investigation/board/add-suspect-modal";
import { FollowupQuestionModal } from "@/components/investigation/board/followup-question-modal";
import { CustomPinModal } from "@/components/investigation/board/custom-pin-modal";
import { DetectiveNotebookModal } from "@/components/investigation/modals/detective-notebook-modal";
import type { PinPoint } from "@/components/investigation/board/renderer/hero-interactive";
import { getStorageJson, setStorageItem } from "@/lib/investigation/storage";
import { caseStorageKey } from "@/lib/cases/case-id";
import { getCanonicalSuspectKey } from "@/lib/cases/characters";
import { isVictimReference } from "@/lib/cases/case-characters";
import { detectiveAudio } from "@/lib/investigation/investigation-audio";
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
import { CanvasNotebookWindow } from "./canvas/notebook-window";
import { CanvasPhoneWindow } from "./canvas/phone-window";
import { CanvasBoardWindow } from "./canvas/board-window";
import { CanvasSidebar } from "./canvas/sidebar";
import { CanvasReaderPanel, type ReaderMode } from "./canvas/reader-panel";

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
  onBoardReady?: () => void;
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
  onBoardReady,
}: CanvasInvestigationWorkspaceProps) {
  const [isBoardOpen, setIsBoardOpen] = useState(true);
  const [isBoardFullscreen, setIsBoardFullscreen] = useState(false);
  const [isDossierCollapsed, setIsDossierCollapsed] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  // Khung đọc tài liệu (thay kiểu xem "Xem lẻ"): chọn tài liệu trong khay là mở cạnh bàn.
  const [readerMode, setReaderMode] = useState<ReaderMode>("closed");
  const openInReader = useCallback(() => {
    setReaderMode((m) => (m === "closed" ? "docked" : m));
  }, []);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showFirstTimePill, setShowFirstTimePill] = useState(false);

  // Bàn hồ sơ chỉ có giao diện tối (đã bỏ theme sáng). Nhánh isLight còn sót: docs/TECHDEBT.md #27.
  const uiTheme = "dark" as const;
  const isLight = false;

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

  const defaultDossierWidth = 340;
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
  };

  const handleOpenFollowupInspector = (culprit: string | null, pinId?: string) => {
    setActiveInspector({
      type: "followup",
      data: culprit,
      label: culprit ? `Nghi vấn: ${culprit}` : "Nghi vấn",
      pinId,
    });
  };

  const handleOpenPinInspector = (pin: PinPoint, pinId?: string) => {
    setActiveInspector({
      type: "custom_pin",
      data: pin,
      label: pin?.label ? `Ghim: ${pin.label}` : "Manh mối",
      pinId: pinId || pin?.id,
    });
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

  // Phím tắt ESC để đóng inspector câu hỏi hoặc thoát chế độ xem toàn màn hình của bảng điều tra
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeInspector) {
          handleCloseInspector();
          return;
        }
        if (isBoardFullscreen) {
          setIsBoardFullscreen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeInspector, isBoardFullscreen]);

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
      <CanvasSidebar
  isLight={isLight}
  isBoardFullscreen={isBoardFullscreen}
  setIsDossierCollapsed={setIsDossierCollapsed}
  isDossierCollapsed={isDossierCollapsed}
  setIsBoardOpen={setIsBoardOpen}
  isBoardOpen={isBoardOpen}
  setActiveModal={setActiveModal}
  activeModal={activeModal}
  handleOpenNotebook={handleOpenNotebook}
  setIsRoomModalOpen={setIsRoomModalOpen}
  onOpenReader={() => setReaderMode((m) => (m === "closed" ? "docked" : "closed"))}
  isReaderOpen={readerMode !== "closed"}
  setIsGuideModalOpen={setIsGuideModalOpen}
/>

      {/* KHÔNG GIAN BÀN HỒ SƠ & CÁC CỬA SỔ FLOATING */}
      <div className="h-full flex-1 min-w-0 min-h-0 relative flex flex-col overflow-hidden">
        {/* GỢI Ý KHÁM PHÁ LẦN ĐẦU CHO NGƯỜI CHƠI MỚI (TỰ ĐỘNG BIẾN MẤT HOẶC BỎ QUA) */}
        {showFirstTimePill && !isTourOpen && !isGuideModalOpen && !activeInspector && (
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

        {/* TOP-DOCKED NODE INSPECTOR (DÍNH VIỀN TRÊN, CĂN GIỮA CANVAS) */}
        {activeInspector && (
          <div
            data-tour="canvas-top-inspector"
            style={{ top: 0 }}
            className={cn(
              "absolute top-0 left-1/2 -translate-x-1/2 z-35 w-[680px] max-w-[calc(100vw-220px)] max-h-[78vh] flex flex-col rounded-b-2xl border-x-2 border-b-2 border-t-0 border-[#2b1f14] bg-[#f6f1e5] shadow-[0_25px_70px_rgba(0,0,0,0.92)] overflow-hidden animate-in fade-in duration-150 select-none",
              isBoardFullscreen && "opacity-0 pointer-events-none"
            )}
          >
            {/* Ruột nội dung câu hỏi thẩm tra */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {renderInspectorContent()}
            </div>
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
        <CanvasBoardWindow
  isBoardFullscreen={isBoardFullscreen}
  boardHeight={boardHeight}
  setIsBoardFullscreen={setIsBoardFullscreen}
  setIsBoardOpen={setIsBoardOpen}
  caseId={caseId}
  boardActivePinId={boardActivePinId}
  setActiveModal={setActiveModal}
  handleOpenSuspectInspector={handleOpenSuspectInspector}
  handleOpenFollowupInspector={handleOpenFollowupInspector}
  handleOpenPinInspector={handleOpenPinInspector}
  onBoardReady={onBoardReady}
  handleResizeStart={handleResizeStart}
/>
      )}

      {/* 2.5. ĐIỆN THOẠI NẠN NHÂN FLOATING (KÉO THẢ & CO KÉO RESIZE KHÓA ĐÚNG TỶ LỆ, ÔM KHÍT THÂN MÁY) */}
      {activeModal === "phone" && (
        <CanvasPhoneWindow
  phonePos={phonePos}
  phoneSize={phoneSize}
  isDraggingPhone={isDraggingPhone}
  isResizingPhone={isResizingPhone}
  handlePhonePointerDown={handlePhonePointerDown}
  setActiveModal={setActiveModal}
  caseId={caseId}
  handlePhoneResizeStart={handlePhoneResizeStart}
/>
      )}

      {/* 2.6. SỔ TAY THÁM TỬ FLOATING (KÉO THẢ TỰ DO KHÔNG LÀM MỜ ĐẰNG SAU, RESIZE TỰ DO) */}
      {activeModal === "notebook" && (
        <CanvasNotebookWindow
  notebookPos={notebookPos}
  notebookSize={notebookSize}
  isDraggingNotebook={isDraggingNotebook}
  isResizingNotebook={isResizingNotebook}
  handleNotebookPointerDown={handleNotebookPointerDown}
  setActiveModal={setActiveModal}
  caseId={caseId}
  handleNotebookResizeStart={handleNotebookResizeStart}
/>
      )}

      {/* 3. MẶT BÀN HỒ SƠ PHẲNG (DOSSIER CANVAS TRẢI TOÀN MÀN HÌNH - KHÔNG BỊ PHONE ĐÈ MẤT NỮA) */}
      <div className="h-full flex-col flex-1 min-w-[320px] min-h-0 overflow-hidden relative flex">
        <DossierCanvasBoard
          caseId={caseId}
          uiTheme={uiTheme}
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
          isExpanded={false}
          onToggleExpand={() => {}}
          activeFilter={String(selectedPhaseFilter)}
          onOpenNotebook={handleOpenNotebook}
          onToggleDossierTray={() => setIsDossierCollapsed((prev) => !prev)}
          onOpenIndictment={() => setActiveModal("indictment")}
          isBoardFullscreen={isBoardFullscreen}
          renderInvestigationBoard={
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
              onBoardReady={onBoardReady}
            />
          }
        />
      </div>

      {/* Người đang online khi chơi nhóm (trước nằm ở header ngang của kiểu Xem lẻ) */}
      <div
        className={cn(
          "absolute top-3 z-20 transition-[right] duration-150",
          readerMode === "docked" ? "right-[calc(max(400px,min(46%,760px))+12px)]" : "right-3",
          isBoardFullscreen && "hidden",
        )}
      >
        <RoomPresenceBar onOpenModal={() => setIsRoomModalOpen(true)} />
      </div>

      {/* 4. KHUNG ĐỌC TÀI LIỆU: gắn cạnh phải mặt bàn hoặc phủ màn hình khi đọc tập trung */}
      <CanvasReaderPanel
        mode={readerMode}
        onModeChange={setReaderMode}
        selectedView={selectedView}
        caseId={caseId}
      />

      {/* 5. KHAY HỒ SƠ FLOATING (TRƯỢT RA TỪ BÊN TRÁI CẠNH SIDEBAR) */}
      <DossierTray
        uiTheme={uiTheme}
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
        activeInspector={null}
        onCloseInspector={handleCloseInspector}
        inspectorContent={null}
        selectedPhaseFilter={selectedPhaseFilter}
        onSetPhaseFilter={onSetPhaseFilter}
        isPhaseUnlocked={isPhaseUnlocked}
        isDossierUnlocked={isDossierUnlocked}
        dossiers={dossiers}
        pdfItems={pdfItems}
        evidenceItems={evidenceItems}
        selectedView={selectedView}
        onSelectPdf={(item) => {
          onSelectPdf(item);
          openInReader();
        }}
        onSelectEvidence={(item) => {
          onSelectEvidence(item);
          openInReader();
        }}
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
