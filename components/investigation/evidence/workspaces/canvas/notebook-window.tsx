"use client";

import React from "react";
import {
  X,
  GripHorizontal,
  BookOpen,
} from "lucide-react";
import { CanvasWalkthroughTour } from "@/components/investigation/evidence/canvas-guide/canvas-walkthrough-tour";
import { BrandMark } from "@/components/investigation/brand-mark";
import { UserNav } from "@/components/auth/user-nav";
import { RoomModal } from "@/components/investigation/room/room-modal";
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
import type { InvestigationActiveModal } from "../mobile-investigation-workspace";

export interface CanvasNotebookWindowProps {
  notebookPos: { x: number; y: number; };
  notebookSize: { width: number; height: number; };
  isDraggingNotebook: boolean;
  isResizingNotebook: boolean;
  handleNotebookPointerDown: (e: React.PointerEvent) => void;
  setActiveModal: (modal: InvestigationActiveModal) => void;
  caseId: string;
  handleNotebookResizeStart: (e: React.PointerEvent) => void;
}

export function CanvasNotebookWindow({
  notebookPos,
  notebookSize,
  isDraggingNotebook,
  isResizingNotebook,
  handleNotebookPointerDown,
  setActiveModal,
  caseId,
  handleNotebookResizeStart,
}: CanvasNotebookWindowProps) {
  return (
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
  );
}
