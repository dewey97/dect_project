"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ExternalLink, FolderOpen } from "lucide-react";
import { MainInvestigationCanvas } from "@/components/investigation/mindmap/main-investigation-canvas";
import { EvidenceDetailInspector } from "@/components/investigation/evidence/evidence-detail-inspector";
import { DossierTray } from "@/components/investigation/evidence/dossier-tray";
import { PhoneSimulator } from "@/components/phone-engine/phone-simulator";
import type {
  CombinedItem,
  PDFDocument,
  PhysicalEvidence,
  SelectedView,
} from "@/components/investigation/evidence/evidence-types";
import type { DbCaseDossier } from "@/lib/types/database";
import type { InvestigationActiveModal } from "./mobile-investigation-workspace";

export interface SingleInvestigationWorkspaceProps {
  caseId: string;
  filterTab: "pdf" | "evidence";
  onSetFilterTab: (tab: "pdf" | "evidence") => void;
  selectedPhaseFilter: "all" | string | number;
  onSetPhaseFilter: (val: "all" | string | number) => void;
  pdfItems: CombinedItem[];
  evidenceItems: CombinedItem[];
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
}

/**
 * WORKSPACE KIỂU XEM: XEM LẺ (Single Mode - Desktop Only)
 * - Bố cục chuẩn 3 cột cố định cạnh nhau (Desktop 3-Column Triage):
 *   1. Cột 1 (Trái): Bảng điều tra cố định tỉ lệ 896/1200.
 *   2. Cột 2 (Giữa): Preview chi tiết tài liệu đơn lẻ / ảnh vật chứng / điện thoại.
 *   3. Cột 3 (Phải): Khay hồ sơ & vật chứng cố định (luôn mở để duyệt danh mục).
 */
export function SingleInvestigationWorkspace({
  caseId,
  filterTab,
  onSetFilterTab,
  selectedPhaseFilter,
  onSetPhaseFilter,
  pdfItems,
  evidenceItems,
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
}: SingleInvestigationWorkspaceProps) {
  const [dossierWidth] = useState<number>(340);
  const [isDossierCollapsed, setIsDossierCollapsed] = useState<boolean>(false);

  return (
    <div className="w-full h-full flex-1 min-h-0 flex items-stretch justify-start overflow-hidden min-w-0 relative gap-0 p-0 select-none">
      {/* CỘT 1: BẢNG GHIM ĐIỀU TRA (CỐ ĐỊNH TỶ LỆ 896/1200) */}
      <div className="h-full shrink-0 aspect-[896/1200] max-w-full relative overflow-hidden flex flex-col min-h-0 select-none border-r border-[#261b12]">
        <div className="flex-1 w-full h-full min-h-0 relative overflow-hidden">
          <MainInvestigationCanvas
            caseId={caseId}
            isBoardGame={false}
            hideTitleBadge={true}
            hideGroupPlay={true}
            hideAudio={false}
            hideNotebook={false}
            onOpenPhoneSimulator={() => setActiveModal("phone")}
            onOpenReinvestigation={() => setActiveModal("reinvestigate")}
            onOpenEpilogue={() => setActiveModal("epilogue")}
            onOpenNotebook={() => setActiveModal("notebook")}
          />
        </div>
      </div>

      {/* CỘT 2: PREVIEW CHI TIẾT TÀI LIỆU / ĐIỆN THOẠI (Ở GIỮA) */}
      <div className="h-full flex-col flex-1 min-w-[320px] min-h-0 overflow-hidden relative flex">
        {activeModal === "phone" ? (
          <div className="flex-1 h-full flex flex-col min-h-0 overflow-hidden bg-[#0A0A0C]">
            <div className="shrink-0 h-10 px-3 flex items-center justify-between bg-[#0A0A0C] border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#FF453A] animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                  Điện thoại nạn nhân
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  href="/evidence/victim-phone"
                  className="flex items-center gap-1 px-2 py-1 rounded bg-[#1C1C1E] text-zinc-400 hover:text-white border border-white/10 text-[11px] font-sans transition-all"
                >
                  <ExternalLink className="size-3" />
                  <span>Mở riêng</span>
                </Link>
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-[#1C1C1E] text-zinc-400 hover:text-white border border-white/10 text-[11px] font-sans transition-all cursor-pointer"
                >
                  <X className="size-3" />
                  <span>Đóng</span>
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
              <PhoneSimulator
                onClose={() => setActiveModal(null)}
                device={caseId ? { caseId } : undefined}
              />
            </div>
          </div>
        ) : (
          <EvidenceDetailInspector
            selectedView={selectedView}
            caseId={caseId}
          />
        )}
      </div>

      {/* NÚT MỞ LẠI KHAY TÀI LIỆU NỔI (GÓC PHẢI TRÊN KHI ĐANG THU GỌN) */}
      {isDossierCollapsed && (
        <button
          type="button"
          onClick={() => setIsDossierCollapsed(false)}
          className="flex items-center gap-2 absolute top-3 right-3 z-30 px-3.5 py-2 rounded-lg bg-[#141210]/95 hover:bg-[#221c16] border border-[#3e2e20] hover:border-amber-500/50 text-[#d9a066] hover:text-[#f4e8d8] shadow-2xl backdrop-blur-md font-mono text-xs font-bold transition-all cursor-pointer group active:scale-95"
          title="Mở Khay tài liệu"
        >
          <FolderOpen className="size-4 text-[#d9a066] transition-transform group-hover:scale-110" />
          <span>Khay tài liệu</span>
        </button>
      )}

      {/* CỘT 3: KHAY HỒ SƠ & VẬT CHỨNG (BÊN PHẢI) */}
      <DossierTray
        dossierWidth={dossierWidth}
        isDossierCollapsed={isDossierCollapsed}
        onToggleCollapse={() => setIsDossierCollapsed(true)}
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
