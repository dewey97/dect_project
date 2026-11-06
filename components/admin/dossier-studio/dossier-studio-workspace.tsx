"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type {
  LoiKhaiData,
  LyLichData,
} from "@/lib/types/dossier";
import {
  reorderDossierDocuments,
  saveDossierDocumentsBatch,
  type DbDossierDocument,
} from "@/lib/actions/dossier-actions";
import type {
  DbCase,
  DbCaseDossier,
  DbCaseEvidence,
  DbCaseWithEvidenceConfig,
} from "@/lib/types/database";
import {
  getCaseDossiers,
  getAllCaseDocumentsCatalog,
  deleteCaseDossier,
  type AvailableDocumentItem,
} from "@/lib/actions/dossier-config-actions";
import {
  getCaseEvidence,
  deleteCaseEvidence,
  getCase360Config,
  upsertMultipleCaseEvidence,
} from "@/lib/actions/evidence-actions";
import { DossierListPanel } from "./dossier-list-panel";
import { DossierConfigModal } from "./dossier-config-modal";
import { DossierStudioHeader } from "./dossier-studio-header";
import { DossierLoiKhaiSheet } from "./dossier-loi-khai-sheet";
import { DossierLyLichSheet } from "./dossier-ly-lich-sheet";
import { DossierStudioSidebar } from "./dossier-studio-sidebar";
import { DossierEvidenceCard } from "./dossier-evidence-card";
import { Scene360ConfigModal } from "@/components/admin/dossier-studio/evidence/scene-360-config-modal";
import { UserCheck, FileText, Camera, Plus, X } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { FIXED_HS_PAPER, FIXED_LK_PAPER } from "./paper-presets";

export interface DossierStudioWorkspaceProps {
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  isSpacePressed: boolean;
  pan: { x: number; y: number; };
  zoomScale: number;
  isPanningRef: React.RefObject<boolean>;
  activeDossier: DbCaseDossier | null;
  displayedHsDocs: DbDossierDocument[];
  displayedLkDocs: DbDossierDocument[];
  displayedEvidence: DbCaseEvidence[];
  setActiveDossierFilterKey: React.Dispatch<React.SetStateAction<string | null>>;
  activeSectionType: "ly_lich" | "loi_khai" | "evidence";
  selectedTagCode: string;
  hsData: LyLichData;
  highlightEditable: boolean;
  showSeal: boolean;
  sealAngle: number;
  setSelectedTagCode: React.Dispatch<React.SetStateAction<string>>;
  setActiveSectionType: React.Dispatch<React.SetStateAction<"ly_lich" | "loi_khai" | "evidence">>;
  setHsData: React.Dispatch<React.SetStateAction<LyLichData>>;
  updateMatrixHsDocument: (tagCode: string, updater: (prev: LyLichData) => LyLichData) => void;
  lkData: LoiKhaiData;
  setLkData: React.Dispatch<React.SetStateAction<LoiKhaiData>>;
  updateMatrixLkDocument: (tagCode: string, updater: (prev: LoiKhaiData) => LoiKhaiData) => void;
  handleCreateNewEvidence: () => void;
  selectedEvidenceId: string | null;
  handleSelectEvidence: (item: DbCaseEvidence) => void;
  setLightboxUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

export function DossierStudioWorkspace({
  canvasContainerRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  isSpacePressed,
  pan,
  zoomScale,
  isPanningRef,
  activeDossier,
  displayedHsDocs,
  displayedLkDocs,
  displayedEvidence,
  setActiveDossierFilterKey,
  activeSectionType,
  selectedTagCode,
  hsData,
  highlightEditable,
  showSeal,
  sealAngle,
  setSelectedTagCode,
  setActiveSectionType,
  setHsData,
  updateMatrixHsDocument,
  lkData,
  setLkData,
  updateMatrixLkDocument,
  handleCreateNewEvidence,
  selectedEvidenceId,
  handleSelectEvidence,
  setLightboxUrl,
}: DossierStudioWorkspaceProps) {
  return (
    <main
          ref={canvasContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={cn(
            "flex-1 h-full min-h-0 overflow-hidden bg-[#0a0c0e] relative select-none",
            isSpacePressed
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-default",
          )}
        >
          {/* Infinite Vector Surface Transform Layer */}
          <div
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoomScale})`,
              transformOrigin: "0 0",
              willChange: "transform",
              transition: isPanningRef.current
                ? "none"
                : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="absolute top-0 left-0 min-w-fit min-h-fit p-10 flex flex-col gap-16 select-text"
          >
            {/* Thanh thông báo đang lọc theo bộ hồ sơ (nếu có) */}
            {activeDossier && (
              <div className="sticky left-0 top-0 z-20 flex items-center gap-2.5 bg-amber-950/80 border border-amber-500/50 text-amber-200 px-4 py-2 rounded-xl backdrop-blur-md text-xs font-semibold w-fit shadow-lg">
                <span>
                  Đang xem bộ hồ sơ:{" "}
                  <strong className="text-white text-sm">
                    {activeDossier.title || activeDossier.dossier_key}
                  </strong>{" "}
                  ({displayedHsDocs.length + displayedLkDocs.length + displayedEvidence.length} tài liệu & vật chứng)
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDossierFilterKey(null)}
                  className="ml-2 px-2 py-0.5 rounded bg-black/50 hover:bg-black/80 text-amber-300 hover:text-white text-[11px] font-bold transition-all border border-amber-400/30"
                >
                  ✕ Xem tất cả
                </button>
              </div>
            )}

            {/* PHÂN KHU 1: HỒ SƠ LÝ LỊCH (A4 NGANG) */}
            <div id="canvas-ly-lich-section" className="flex flex-col gap-4">
              <div className="sticky left-0 z-10 flex items-center gap-2.5 bg-[#141618]/90 border border-white/10 px-3.5 py-1.5 rounded-lg w-fit backdrop-blur-md shadow-sm">
                <UserCheck className="size-4 text-amber-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">
                  Hồ Sơ Lý Lịch ({displayedHsDocs.length})
                </span>
                <span className="text-[10px] text-neutral-400 font-mono border-l border-white/10 pl-2">
                  A4 Ngang
                </span>
              </div>
              <div className="flex flex-row items-start gap-12">
                {displayedHsDocs.map((docItem) => {
                  const isSelected =
                    activeSectionType === "ly_lich" &&
                    selectedTagCode === docItem.tag_code;
                  const docData = (
                    isSelected ? hsData : docItem.content
                  ) as LyLichData;

                  return (
                    <DossierLyLichSheet
                      key={docItem.id}
                      docItem={docItem}
                      docData={docData}
                      docPaper={FIXED_HS_PAPER}
                      isSelected={isSelected}
                      highlightEditable={highlightEditable}
                      showSeal={showSeal}
                      sealAngle={sealAngle}
                      onSelect={() => {
                        setSelectedTagCode(docItem.tag_code);
                        setActiveSectionType("ly_lich");
                        setHsData(docItem.content as LyLichData);
                      }}
                      onUpdateDoc={updateMatrixHsDocument}
                    />
                  );
                })}
              </div>
            </div>

            {/* PHÂN KHU 2: BIÊN BẢN GHI LỜI KHAI (A4 DỌC) */}
            <div id="canvas-loi-khai-section" className="flex flex-col gap-4">
              <div className="sticky left-0 z-10 flex items-center gap-2.5 bg-[#141618]/90 border border-white/10 px-3.5 py-1.5 rounded-lg w-fit backdrop-blur-md shadow-sm">
                <FileText className="size-4 text-amber-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">
                  Biên Bản Ghi Lời Khai ({displayedLkDocs.length})
                </span>
                <span className="text-[10px] text-neutral-400 font-mono border-l border-white/10 pl-2">
                  A4 Dọc
                </span>
              </div>
              <div className="flex flex-row items-start gap-12">
                {displayedLkDocs.map((docItem) => {
                  const isSelected =
                    activeSectionType === "loi_khai" &&
                    selectedTagCode === docItem.tag_code;
                  const docData = (
                    isSelected ? lkData : docItem.content
                  ) as LoiKhaiData;

                  return (
                    <DossierLoiKhaiSheet
                      key={docItem.id}
                      docItem={docItem}
                      docData={docData}
                      docPaper={FIXED_LK_PAPER}
                      isSelected={isSelected}
                      highlightEditable={highlightEditable}
                      onSelect={() => {
                        setSelectedTagCode(docItem.tag_code);
                        setActiveSectionType("loi_khai");
                        setLkData(docItem.content as LoiKhaiData);
                      }}
                      onUpdateDoc={updateMatrixLkDocument}
                    />
                  );
                })}
              </div>
            </div>

            {/* PHÂN KHU 3: VẬT CHỨNG & ẢNH HIỆN TRƯỜNG */}
            <div id="canvas-evidence-section" className="flex flex-col gap-4">
              <div className="sticky left-0 z-10 flex items-center justify-between bg-[#141618]/90 border border-white/10 px-3.5 py-1.5 rounded-lg w-fit backdrop-blur-md shadow-sm gap-4">
                <div className="flex items-center gap-2">
                  <Camera className="size-4 text-amber-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">
                    Vật Chứng & Ảnh Hiện Trường ({displayedEvidence.length})
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono border-l border-white/10 pl-2">
                    Ảnh / PDF
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCreateNewEvidence}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 ml-2"
                >
                  <Plus className="size-3" /> Thêm chứng cứ
                </button>
              </div>

              <div className="flex flex-row items-start gap-8">
                {displayedEvidence.map((item) => {
                  const isSelected =
                    activeSectionType === "evidence" &&
                    (selectedEvidenceId === item.id ||
                      selectedTagCode === item.code);

                  return (
                    <DossierEvidenceCard
                      key={item.id}
                      item={item}
                      isSelected={isSelected}
                      onSelect={() => handleSelectEvidence(item)}
                      onViewImage={(url) => setLightboxUrl(url)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </main>
  );
}
