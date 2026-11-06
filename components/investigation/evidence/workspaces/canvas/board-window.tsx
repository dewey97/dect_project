"use client";

import React from "react";
import {
  Maximize2,
  Minimize2,
  Minus,
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
import { CanvasNotebookWindow } from "./notebook-window";
import { CanvasPhoneWindow } from "./phone-window";

export interface CanvasBoardWindowProps {
  isBoardFullscreen: boolean;
  boardHeight: number;
  setIsBoardFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBoardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  caseId: string;
  boardActivePinId: any;
  setActiveModal: (modal: InvestigationActiveModal) => void;
  handleOpenSuspectInspector: (suspect: any, pinId?: string) => void;
  handleOpenFollowupInspector: (culprit: string | null, pinId?: string) => void;
  handleOpenPinInspector: (pin: PinPoint, pinId?: string) => void;
  onBoardReady: (() => void) | undefined;
  handleResizeStart: (e: React.MouseEvent) => void;
}

export function CanvasBoardWindow({
  isBoardFullscreen,
  boardHeight,
  setIsBoardFullscreen,
  setIsBoardOpen,
  caseId,
  boardActivePinId,
  setActiveModal,
  handleOpenSuspectInspector,
  handleOpenFollowupInspector,
  handleOpenPinInspector,
  onBoardReady,
  handleResizeStart,
}: CanvasBoardWindowProps) {
  return (
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
              onBoardReady={onBoardReady}
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
  );
}
