"use client";

import React from "react";
import {
  SquareKanban,
  FolderOpen,
  Smartphone,
  Compass,
  BookOpen,
  Users,
  HelpCircle,
  MessageSquareWarning,
  FileText,
} from "lucide-react";
import { BrandMark } from "@/components/investigation/brand-mark";
import { UserNav } from "@/components/auth/user-nav";
import { cn } from "@/lib/utils";
import { emitInvestigationEvent } from "@/lib/investigation/investigation-events";
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
import { CanvasBoardWindow } from "./board-window";

export interface CanvasSidebarProps {
  isLight: boolean;
  isBoardFullscreen: boolean;
  setIsDossierCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isDossierCollapsed: boolean;
  setIsBoardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isBoardOpen: boolean;
  setActiveModal: (modal: InvestigationActiveModal) => void;
  activeModal: InvestigationActiveModal;
  handleOpenNotebook: () => void;
  setIsRoomModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenReader: () => void;
  isReaderOpen: boolean;
  setIsGuideModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CanvasSidebar({
  isLight,
  isBoardFullscreen,
  setIsDossierCollapsed,
  isDossierCollapsed,
  setIsBoardOpen,
  isBoardOpen,
  setActiveModal,
  activeModal,
  handleOpenNotebook,
  setIsRoomModalOpen,
  onOpenReader,
  isReaderOpen,
  setIsGuideModalOpen,
}: CanvasSidebarProps) {
  return (
    <aside
        id="canvas-left-sidebar"
        data-tour="canvas-left-dock"
        aria-label="Thanh điều hướng nghiệp vụ điều tra"
        className={cn(
          "w-16 sm:w-[68px] h-full shrink-0 z-30 flex flex-col justify-between items-center py-2 px-1 select-none transition-all duration-200 overflow-y-auto overflow-x-hidden scrollbar-none",
          isLight
            ? "bg-white border-r border-zinc-200 shadow-sm text-zinc-900"
            : "bg-[#0d0f14]/98 border-r border-[#262c38] text-zinc-300 backdrop-blur-xl",
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
              className={cn(
                "flex items-center justify-center p-1 rounded-xl transition-colors",
                isLight ? "hover:bg-zinc-100" : "hover:bg-zinc-800/60"
              )}
              imageClassName="size-7.5 sm:size-8 object-contain"
            />
          </div>

          {/* 1. Khay tài liệu */}
          <button
            type="button"
            onClick={() => setIsDossierCollapsed((prev) => !prev)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl active:scale-95 transition-all cursor-pointer group select-none",
              !isDossierCollapsed
                ? (isLight ? "bg-zinc-100 text-zinc-950 font-bold border border-zinc-200 shadow-xs" : "bg-zinc-800/70 text-zinc-100 font-semibold shadow-xs")
                : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50")
            )}
            title={!isDossierCollapsed ? "Thu gọn Khay tài liệu" : "Mở Khay tài liệu"}
          >
            <FolderOpen
              className={cn(
                "size-5 transition-transform group-hover:scale-105",
                !isDossierCollapsed
                  ? (isLight ? "text-zinc-950" : "text-zinc-100")
                  : (isLight ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-400 group-hover:text-zinc-200")
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
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl active:scale-95 transition-all cursor-pointer group select-none",
              isBoardOpen
                ? (isLight ? "bg-zinc-100 text-zinc-950 font-bold border border-zinc-200 shadow-xs" : "bg-zinc-800/70 text-zinc-100 font-semibold shadow-xs")
                : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50")
            )}
            title={isBoardOpen ? "Thu gọn Bảng điều tra" : "Mở Bảng điều tra"}
          >
            <SquareKanban
              className={cn(
                "size-5 transition-transform group-hover:scale-105",
                isBoardOpen
                  ? (isLight ? "text-zinc-950" : "text-zinc-100")
                  : (isLight ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-400 group-hover:text-zinc-200")
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
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl active:scale-95 transition-all cursor-pointer group select-none",
              activeModal === "phone"
                ? (isLight ? "bg-zinc-100 text-zinc-950 font-bold border border-zinc-200 shadow-xs" : "bg-zinc-800/70 text-zinc-100 font-semibold shadow-xs")
                : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50")
            )}
            title="Điện thoại nạn nhân"
          >
            <Smartphone
              className={cn(
                "size-5 transition-transform group-hover:scale-105",
                activeModal === "phone"
                  ? (isLight ? "text-zinc-950" : "text-zinc-100")
                  : (isLight ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-400 group-hover:text-zinc-200")
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
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl active:scale-95 transition-all cursor-pointer group select-none",
              activeModal === "reinvestigate"
                ? (isLight ? "bg-zinc-100 text-zinc-950 font-bold border border-zinc-200 shadow-xs" : "bg-zinc-800/70 text-zinc-100 font-semibold shadow-xs")
                : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50")
            )}
            title="Khám xét lại hiện trường 360"
          >
            <Compass
              className={cn(
                "size-5 transition-transform group-hover:scale-105",
                activeModal === "reinvestigate"
                  ? (isLight ? "text-zinc-950" : "text-zinc-100")
                  : (isLight ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-400 group-hover:text-zinc-200")
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
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl active:scale-95 transition-all cursor-pointer group select-none",
              activeModal === "notebook"
                ? (isLight ? "bg-zinc-100 text-zinc-950 font-bold border border-zinc-200 shadow-xs" : "bg-zinc-800/70 text-zinc-100 font-semibold shadow-xs")
                : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50")
            )}
            title="Sổ tay ghi chép nghiệp vụ"
          >
            <BookOpen
              className={cn(
                "size-5 transition-transform group-hover:scale-105",
                activeModal === "notebook"
                  ? (isLight ? "text-zinc-950" : "text-zinc-100")
                  : (isLight ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-400 group-hover:text-zinc-200")
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
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl active:scale-95 transition-all cursor-pointer group select-none relative",
              isLight ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
            title="Chơi nhóm đồng bộ thời gian thực"
          >
            <Users className={cn("size-4.5 transition-transform group-hover:scale-105", isLight ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-400 group-hover:text-zinc-200")} />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Nhóm
            </span>
          </button>

          {/* 7. Khung đọc tài liệu (thay kiểu xem "Xem lẻ") */}
          <button
            type="button"
            onClick={onOpenReader}
            aria-pressed={isReaderOpen}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl active:scale-95 transition-all cursor-pointer group select-none",
              isReaderOpen
                ? isLight ? "text-zinc-900 bg-zinc-100" : "text-amber-300 bg-zinc-800/70"
                : isLight ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
            title="Mở khung đọc tài liệu đang chọn"
          >
            <FileText className={cn("size-4.5 transition-transform group-hover:scale-105", isLight ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-400 group-hover:text-zinc-200")} />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Đọc
            </span>
          </button>

          {/* 8. Hướng dẫn nghiệp vụ Bàn hồ sơ */}
          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl active:scale-95 transition-all cursor-pointer group select-none",
              isLight ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
            title="Cẩm nang tác nghiệp Bàn hồ sơ"
          >
            <HelpCircle className={cn("size-4.5 transition-transform group-hover:scale-105", isLight ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-400 group-hover:text-zinc-200")} />
            <span className="text-[10px] font-sans font-medium tracking-tight text-center leading-none">
              Chỉ dẫn
            </span>
          </button>

          {/* 9. Báo lỗi */}
          <button
            type="button"
            onClick={() => emitInvestigationEvent("OPEN_FEEDBACK")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-xl active:scale-95 transition-all cursor-pointer group select-none",
              isLight ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
            title="Báo lỗi & Góp ý"
          >
            <MessageSquareWarning className={cn("size-4.5 transition-transform group-hover:scale-105", isLight ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-400 group-hover:text-zinc-200")} />
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
  );
}
