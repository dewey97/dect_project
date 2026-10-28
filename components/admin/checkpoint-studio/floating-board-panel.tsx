"use client";

import React, { useState, useRef, useEffect } from "react";
import nextDynamic from "next/dynamic";
import {
  RotateCcw,
  RotateCw,
  Minus,
  Plus,
  Move,
  Edit3,
  Play,
  X,
} from "lucide-react";
import {
  HeroInteractive,
  type CaseConnection,
  type PinPoint,
} from "@/components/investigation/hero-interactive";
import { BOARD_ASPECT } from "@/components/investigation/hero-interactive/constants";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { CustomPinModal } from "@/components/investigation/board/custom-pin-modal";
import { AddSuspectModal } from "@/components/investigation/board/add-suspect-modal";
import { IndictmentModal } from "@/components/investigation/board/indictment-modal";
import { PhoneLookupModal } from "@/components/investigation/board/phone-lookup-modal";

const ReinvestigationModal = nextDynamic(
  () =>
    import("@/components/investigation/evidence/reinvestigation-modal").then(
      (m) => m.ReinvestigationModal,
    ),
  { ssr: false },
);

const PhoneModal = nextDynamic(
  () =>
    import("@/components/investigation/evidence/phone-modal").then(
      (m) => m.PhoneModal,
    ),
  { ssr: false },
);

interface FloatingBoardPanelProps {
  caseId: string;
  displayPins: PinPoint[];
  activeConnections: CaseConnection[];
  selectedNodeId: string | null;
  selectedNode: any;
  isOpen: boolean;
  onClose?: () => void;
  onSelectPin: (pinId: string | null) => void;
  onPinPositionChange: (pinId: string, newX: number, newY: number) => void;
  onConnectPins: (fromId: string, toId: string) => void;
  onDeleteConnection: (connId: string) => void;
  onAdjustNodeTransform: (nodeId: string, deltaRot: number, deltaScale: number) => void;
}

const STORAGE_KEY = "xplore_checkpoint_studio_floating_board";

// Giới hạn kích thước chiều rộng
const MIN_WIDTH = 220;
const MAX_WIDTH = 800;

/** Tính chiều cao từ chiều rộng chuẩn 100% theo tỷ lệ BOARD_ASPECT của bảng điều tra */
function calcHeight(w: number): number {
  return Math.round(w / BOARD_ASPECT);
}

export function FloatingBoardPanel({
  caseId,
  displayPins,
  activeConnections,
  selectedNodeId,
  selectedNode,
  isOpen,
  onSelectPin,
  onPinPositionChange,
  onConnectPins,
  onDeleteConnection,
  onAdjustNodeTransform,
}: FloatingBoardPanelProps) {
  // Mặc định rộng 380px -> cao 509px chuẩn 100% tỷ lệ bảng
  const defaultW = 380;
  const defaultH = calcHeight(defaultW);

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: defaultW,
    height: defaultH,
  });
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 30, y: 30 });

  // ── Chế độ Test Bảng trực tiếp trong Studio ──
  const [isTestMode, setIsTestMode] = useState(false);
  const [activeTestPin, setActiveTestPin] = useState<PinPoint | null>(null);
  const [isAddSuspectOpen, setIsAddSuspectOpen] = useState(false);
  const [activeSuspect, setActiveSuspect] = useState<{ id: string; name: string; clueIds: string[] } | null>(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isPhoneLookupOpen, setIsPhoneLookupOpen] = useState(false);
  const [isReinvestigateOpen, setIsReinvestigateOpen] = useState(false);
  const [isIndictmentOpen, setIsIndictmentOpen] = useState(false);
  const [activePhotoZoom, setActivePhotoZoom] = useState<string | null>(null);

  const handleTestPinClick = (pinId: string, clickedPin?: PinPoint) => {
    const pin = clickedPin || displayPins.find((p) => p.id === pinId);
    if (!pin) return;

    // 1. Điện thoại nạn nhân (Vật chứng túi điện thoại nạn nhân -> mở Phone Simulator)
    if (
      pin.nodeKind === "victim_phone" ||
      pin.id.includes("victim_phone") ||
      pin.id.includes("victim-phone") ||
      pin.photoUrl?.includes("phone.png") ||
      pin.label?.toLowerCase() === "điện thoại nạn nhân"
    ) {
      setIsPhoneOpen(true);
      return;
    }

    // 1b. Tra cứu số điện thoại / Mở rộng điều tra (Giấy note nghiệp vụ -> mở Phone Lookup)
    if (
      (pin.nodeKind === "phone_lookup" ||
        pin.id.includes(":phone_lookup:") ||
        pin.label === "Mở rộng điều tra") &&
      !pin.photoUrl?.includes("phone.png")
    ) {
      setIsPhoneLookupOpen(true);
      return;
    }

    // 2. Khám xét hiện trường 360
    if (pin.nodeKind === "reinvestigate") {
      setIsReinvestigateOpen(true);
      return;
    }

    // 3. Bản kết luận điều tra / Cáo trạng
    if (pin.nodeKind === "indictment") {
      setIsIndictmentOpen(true);
      return;
    }

    // 4. Nghi phạm (Thẩm tra)
    if (pin.nodeKind === "suspect") {
      const subjectKey = pin.subjectKey || pin.id.split(":").pop();
      setActiveSuspect({
        id: subjectKey || pin.id,
        name: pin.label,
        clueIds: [],
      });
      setIsAddSuspectOpen(true);
      return;
    }

    // 5. Ảnh vật chứng hoặc chân dung không gắn checkpoint
    if (
      (pin.nodeKind === "photo" || pin.isAvatar) &&
      pin.photoUrl &&
      !pin.checkpointId &&
      pin.actionType !== "sheet_checkpoint"
    ) {
      setActivePhotoZoom(pin.photoUrl);
      return;
    }

    // 6. Checkpoint / Câu hỏi tương tác / Phone lookup / Followup
    setActiveTestPin(pin);
  };

  // Ref lưu giá trị mới nhất liên tục để tránh stale closure khi mouseup/pointerup
  const currentPosRef = useRef(pos);
  currentPosRef.current = pos;
  const currentSizeRef = useRef(size);
  currentSizeRef.current = size;

  // Đọc cấu hình vị trí/kích thước đã lưu từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.width) {
          const w = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsed.width));
          setSize({ width: w, height: calcHeight(w) });
        }
        if (parsed.x !== undefined && parsed.y !== undefined) {
          const x = Math.max(10, Math.min(window.innerWidth - 100, parsed.x));
          const y = Math.max(10, Math.min(window.innerHeight - 100, parsed.y));
          setPos({ x, y });
        }
      } else {
        // Mặc định đặt ở góc dưới-phải màn hình
        const w = defaultW;
        const h = defaultH;
        setPos({
          x: Math.max(20, window.innerWidth - w - 440),
          y: Math.max(20, window.innerHeight - h - 50),
        });
      }
    } catch {
      // ignore
    }
  }, [defaultW, defaultH]);

  const saveLayout = (p: { x: number; y: number }, s: { width: number; height: number }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, ...s }));
    } catch {
      // ignore
    }
  };

  // ── 1. Kéo di chuyển tấm bảng (Drag bằng tay nắm di chuyển ở mép trên) ──
  const handleDragPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = currentPosRef.current.x;
    const origY = currentPosRef.current.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const newX = Math.max(10, Math.min(window.innerWidth - 100, origX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 60, origY + dy));
      setPos({ x: newX, y: newY });
    };

    const onPointerUp = () => {
      saveLayout(currentPosRef.current, currentSizeRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // ── 2. Kéo co giãn kích thước ở góc (Resize ở góc dưới-phải SE chuẩn 100% tỷ lệ) ──
  const handleCornerResizePointerDown = (e: React.PointerEvent, corner: "se" | "sw" | "ne" | "nw") => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const origX = currentPosRef.current.x;
    const origY = currentPosRef.current.y;
    const origW = currentSizeRef.current.width;
    const origH = currentSizeRef.current.height;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;

      let newW = origW;
      let newH = origH;
      let newX = origX;
      let newY = origY;

      if (corner === "se") {
        newW = Math.max(MIN_WIDTH, Math.min(window.innerWidth - origX - 20, origW + dx));
        newH = calcHeight(newW);
      } else if (corner === "sw") {
        newW = Math.max(MIN_WIDTH, Math.min(origX + origW - 20, origW - dx));
        newH = calcHeight(newW);
        newX = origX + origW - newW;
      } else if (corner === "ne") {
        newW = Math.max(MIN_WIDTH, Math.min(window.innerWidth - origX - 20, origW + dx));
        newH = calcHeight(newW);
        newY = origY + origH - newH;
      } else if (corner === "nw") {
        newW = Math.max(MIN_WIDTH, Math.min(origX + origW - 20, origW - dx));
        newH = calcHeight(newW);
        newX = origX + origW - newW;
        newY = origY + origH - newH;
      }

      setSize({ width: newW, height: newH });
      setPos({ x: newX, y: newY });
    };

    const onPointerUp = () => {
      saveLayout(currentPosRef.current, currentSizeRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      className="absolute z-40 flex flex-col rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] select-none group"
    >
      {/* ── Vùng kéo di chuyển cửa sổ ở mép trên (Kéo trực tiếp không cần hover) ── */}
      <div
        onPointerDown={handleDragPointerDown}
        className="absolute top-0 left-0 right-14 h-7 z-20 cursor-move"
        title="Kéo để di chuyển bảng điều tra"
      />

      {/* ── Canvas Bảng điều tra HeroInteractive (Phủ kín 100%, không viền, không phần đen) ── */}
      <div className="flex-1 w-full h-full relative bg-[#1c140d] overflow-hidden">
        {/* Nút chuyển chế độ icon siêu nhỏ gọn ở góc trên phải */}
        <div className="absolute top-2 right-2 z-30 flex items-center bg-[#14100c]/90 backdrop-blur-md rounded-md border border-white/10 p-0.5 shadow-xl select-none">
          <button
            type="button"
            onClick={() => setIsTestMode(false)}
            className={cn(
              "p-1 rounded transition-colors",
              !isTestMode
                ? "bg-amber-500/30 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200",
            )}
            title="Chế độ Chỉnh sửa"
          >
            <Edit3 className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => setIsTestMode(true)}
            className={cn(
              "p-1 rounded transition-colors",
              isTestMode
                ? "bg-emerald-500/30 text-emerald-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200",
            )}
            title="Chế độ Test bảng (Click vào ghim để mở câu hỏi/hồ sơ)"
          >
            <Play className="size-3 fill-current" />
          </button>
        </div>

        {/* Quick Transform Toolbar cho node đang chọn (chỉ hiện ở chế độ chỉnh sửa) */}
        {!isTestMode && selectedNode && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-1 bg-[#16120e]/95 backdrop-blur-md rounded-lg border border-amber-500/50 shadow-2xl font-mono text-[11px] select-none">
            <button
              type="button"
              onClick={() => onAdjustNodeTransform(selectedNode.id, -2, 0)}
              className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
              title="Xoay nghiêng trái (-2°)"
            >
              <RotateCcw className="size-3" />
            </button>

            <button
              type="button"
              onClick={() => onAdjustNodeTransform(selectedNode.id, 2, 0)}
              className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
              title="Xoay nghiêng phải (+2°)"
            >
              <RotateCw className="size-3" />
            </button>

            <div className="h-3.5 w-px bg-white/15 mx-0.5" />

            <button
              type="button"
              onClick={() => onAdjustNodeTransform(selectedNode.id, 0, -0.1)}
              className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
              title="Thu nhỏ (-0.1x)"
            >
              <Minus className="size-3" />
            </button>

            <button
              type="button"
              onClick={() => onAdjustNodeTransform(selectedNode.id, 0, 0.1)}
              className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
              title="Phóng to (+0.1x)"
            >
              <Plus className="size-3" />
            </button>
          </div>
        )}

        <HeroInteractive
          className="w-full h-full bg-[#1c140d]"
          controlledCaseId={caseId}
          customPins={displayPins}
          customConnections={activeConnections}
          isEditMode={!isTestMode}
          selectedPinId={isTestMode ? null : selectedNodeId}
          onSelectPin={isTestMode ? undefined : onSelectPin}
          onPinClick={isTestMode ? handleTestPinClick : onSelectPin}
          onPinPositionChange={isTestMode ? undefined : onPinPositionChange}
          onConnectPins={isTestMode ? undefined : onConnectPins}
          onDeleteConnection={isTestMode ? undefined : onDeleteConnection}
        />
      </div>

      {/* ── Tay cầm Resize ở góc dưới phải (SE) tinh tế, đúng tỉ lệ ── */}
      <div
        onPointerDown={(e) => handleCornerResizePointerDown(e, "se")}
        className="absolute bottom-0 right-0 size-6 z-30 cursor-nwse-resize flex items-end justify-end p-1 hover:bg-amber-500/20 transition-colors rounded-tl"
        title="Kéo để thay đổi kích thước bảng (tự động khóa chuẩn tỉ lệ)"
      >
        <div className="size-3 border-r-2 border-b-2 border-amber-400/80 drop-shadow-md" />
      </div>

      {/* Tay cầm Resize ở góc dưới trái (SW) hỗ trợ thêm */}
      <div
        onPointerDown={(e) => handleCornerResizePointerDown(e, "sw")}
        className="absolute bottom-0 left-0 size-6 z-30 cursor-nesw-resize flex items-end justify-start p-1 hover:bg-amber-500/20 transition-colors rounded-tr"
        title="Kéo để thay đổi kích thước bảng (tự động khóa chuẩn tỉ lệ)"
      >
        <div className="size-3 border-l-2 border-b-2 border-amber-400/80 drop-shadow-md" />
      </div>

      {/* ── Các Modal Chơi thử (Interactive Test Modals) ── */}
      {activeTestPin && (
        <CustomPinModal
          isOpen={Boolean(activeTestPin)}
          onClose={() => setActiveTestPin(null)}
          pin={activeTestPin}
          caseId={caseId}
          onSolve={() => {
            toast.success(`Đã thử nghiệm hoàn thành checkpoint "${activeTestPin.label}"`);
          }}
        />
      )}

      {isAddSuspectOpen && activeSuspect && (
        <AddSuspectModal
          isOpen={isAddSuspectOpen}
          onClose={() => {
            setIsAddSuspectOpen(false);
            setActiveSuspect(null);
          }}
          caseId={caseId}
          editingSuspect={activeSuspect}
          onSave={() => {
            setIsAddSuspectOpen(false);
            setActiveSuspect(null);
            toast.success(`Đã lưu thử nghiệm thẩm tra nghi phạm "${activeSuspect.name}"`);
          }}
        />
      )}

      {isPhoneOpen && (
        <PhoneModal
          isOpen={isPhoneOpen}
          onClose={() => setIsPhoneOpen(false)}
          caseId={caseId}
        />
      )}

      {isPhoneLookupOpen && (
        <PhoneLookupModal
          caseId={caseId}
          isOpen={isPhoneLookupOpen}
          onClose={() => setIsPhoneLookupOpen(false)}
          onSuccess={(phone, info) => {
            toast.success(`Đã xác minh thông tin SĐT thành công: ${info || phone}`);
            setIsPhoneLookupOpen(false);
          }}
          onOpenPhoneSimulator={() => {
            setIsPhoneLookupOpen(false);
            setIsPhoneOpen(true);
          }}
        />
      )}

      {isReinvestigateOpen && (
        <ReinvestigationModal
          isOpen={isReinvestigateOpen}
          onClose={() => setIsReinvestigateOpen(false)}
          caseId={caseId}
        />
      )}

      {isIndictmentOpen && (
        <IndictmentModal
          isOpen={isIndictmentOpen}
          onClose={() => setIsIndictmentOpen(false)}
          caseId={caseId}
          onSubmitIndictment={() => {
            toast.success("Đã nộp bản cáo trạng thử nghiệm thành công!");
          }}
        />
      )}

      {activePhotoZoom && (
        <div
          onClick={() => setActivePhotoZoom(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhotoZoom}
              alt="Ảnh phóng to"
              className="max-h-[80vh] max-w-full rounded-lg shadow-2xl object-contain border border-white/10"
            />
            <button
              onClick={() => setActivePhotoZoom(null)}
              className="mt-3 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <X className="size-3" />
              <span>Đóng</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
