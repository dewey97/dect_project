"use client";

import React from "react";
import { InvestigationMobileNav } from "@/components/investigation/evidence/investigation-mobile-nav";
import { MainInvestigationCanvas } from "@/components/investigation/mindmap/main-investigation-canvas";
import { DossierTray } from "@/components/investigation/evidence/dossier-tray";
import type {
  CombinedItem,
  PDFDocument,
  PhysicalEvidence,
  SelectedView,
} from "@/components/investigation/evidence/evidence-types";
import type { DbCaseDossier } from "@/lib/types/database";

export type InvestigationActiveModal =
  | "phone"
  | "reinvestigate"
  | "indictment"
  | "epilogue"
  | "hint"
  | "mobile_pdf"
  | "notebook"
  | null;

export interface MobileInvestigationWorkspaceProps {
  caseId: string;
  mobileTab: "board" | "dossier";
  onSelectBoard: () => void;
  onSelectDossierTab: (tab: "pdf" | "evidence") => void;
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
 * WORKSPACE CHUYÊN BIỆT CHO THIẾT BỊ DI ĐỘNG (< LG)
 * - Điều hướng bằng tabbar dưới đáy (InvestigationMobileNav).
 * - Chuyển đổi giữa 2 tab:
 *   1. Bảng điều tra vụ án (Mindmap / Pins)
 *   2. Khay hồ sơ & Vật chứng dạng danh sách manila
 * - Đọc tài liệu qua modal toàn màn hình (mobile_pdf).
 */
export function MobileInvestigationWorkspace({
  caseId,
  mobileTab,
  onSelectBoard,
  onSelectDossierTab,
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
  setActiveModal,
}: MobileInvestigationWorkspaceProps) {
  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-hidden relative">
      {/* MOBILE TABBAR DƯỚI ĐÁY */}
      <InvestigationMobileNav
        mobileTab={mobileTab}
        filterTab={filterTab}
        onSelectBoard={onSelectBoard}
        onSelectDossierTab={onSelectDossierTab}
        onOpenNotebook={() => setActiveModal("notebook")}
      />

      {/* KHÔNG GIAN NỘI DUNG THEO TAB TRÊN MOBILE */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden">
        {/* TAB 1: BẢNG ĐIỀU TRA */}
        <div
          className={`w-full h-full ${
            mobileTab === "board" ? "block" : "hidden"
          }`}
        >
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

        {/* TAB 2: KHAY HỒ SƠ & VẬT CHỨNG */}
        <div
          className={`w-full h-full ${
            mobileTab === "dossier" ? "block" : "hidden"
          }`}
        >
          <DossierTray
            className="w-full h-full"
            dossierWidth={340}
            isDossierCollapsed={false}
            isViewerExpanded={false}
            mobileTab={mobileTab}
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
            onSelectPdf={(pdf) => {
              onSelectPdf(pdf);
              setActiveModal("mobile_pdf");
            }}
            onSelectEvidence={(ev) => {
              onSelectEvidence(ev);
              setActiveModal("mobile_pdf");
            }}
            activePing={activePing}
            onBroadcastPing={broadcastPing}
          />
        </div>
      </div>
    </div>
  );
}
