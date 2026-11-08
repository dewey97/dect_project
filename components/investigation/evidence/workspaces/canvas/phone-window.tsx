"use client";

import { normalizeCaseId } from "@/lib/cases/case-id";
import React from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  GripHorizontal,
} from "lucide-react";
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

export interface CanvasPhoneWindowProps {
  phonePos: { x: number; y: number; };
  phoneSize: { width: number; height: number; };
  isDraggingPhone: boolean;
  isResizingPhone: boolean;
  handlePhonePointerDown: (e: React.PointerEvent) => void;
  setActiveModal: (modal: InvestigationActiveModal) => void;
  caseId: string;
  handlePhoneResizeStart: (e: React.PointerEvent) => void;
}

export function CanvasPhoneWindow({
  phonePos,
  phoneSize,
  isDraggingPhone,
  isResizingPhone,
  handlePhonePointerDown,
  setActiveModal,
  caseId,
  handlePhoneResizeStart,
}: CanvasPhoneWindowProps) {
  return (
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
                href={`/evidence/victim-phone?case_id=${normalizeCaseId(caseId)}`}
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
  );
}
