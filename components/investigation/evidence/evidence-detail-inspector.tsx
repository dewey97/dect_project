"use client";

import React from "react";
import type { SelectedView } from "./evidence-types";
import { normalizeDrivePdfUrl, normalizeImageUrl } from "@/lib/utils";
import { useDossierDocuments } from "@/lib/hooks/use-dossier-documents";
import { useCaseDossiers } from "@/lib/hooks/use-case-dossiers";
import { DiegeticDossierSheet } from "./diegetic-dossier-sheet";
import { EvidencePhotoAnnotator } from "./evidence-photo-annotator";
import { NativePdfAnnotator } from "./native-pdf-annotator";

interface EvidenceDetailInspectorProps {
  selectedView: SelectedView | null;
  caseId?: string;
}

export function EvidenceDetailInspector({
  selectedView,
  caseId = "case_000",
}: EvidenceDetailInspectorProps) {
  if (!selectedView) return null;

  const isPdf = selectedView.type === "pdf";
  const displayCode = isPdf
    ? selectedView.data.code || "HỒ SƠ"
    : selectedView.data.code || "VẬT CHỨNG";

  const pdfUrl = isPdf ? normalizeDrivePdfUrl(selectedView.data.url) : "";
  const photoUrl = !isPdf ? normalizeImageUrl(selectedView.data.thumbnail) : "";

  // Tra cứu xem hồ sơ này đã được biên soạn trên Dossier Studio chưa
  const { findMatchingDocument } = useDossierDocuments(caseId);
  const { dossierOf } = useCaseDossiers(caseId);
  const dossierTitle =
    selectedView.data.dossierTitle ||
    (selectedView.data.code ? dossierOf(selectedView.data.code)?.title : undefined);

  const matchedDossier = isPdf
    ? findMatchingDocument({
        code: selectedView.data.code,
        title: selectedView.data.title,
        id: selectedView.data.id,
      })
    : undefined;

  return (
    <div className="hidden lg:flex flex-1 min-w-0 min-h-0 bg-[#16120e] border-2 border-[#3d2c1e] rounded-none shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex-col h-full relative">
      {dossierTitle && (
        <div
          data-testid="evidence-inspector-breadcrumb"
          className="shrink-0 px-4 py-2 bg-[#191410] border-b border-[#2d2015] flex items-center gap-2 text-xs font-mono text-[#a89078]"
        >
          <span className="text-[#6d5b4d]">Bộ hồ sơ:</span>
          <span className="text-[#e8a86a] font-medium">{dossierTitle}</span>
          <span className="text-[#6d5b4d]">/</span>
          <span className="text-[#e5d8cb] truncate">{selectedView.data.title}</span>
        </div>
      )}
      {/* Main View Container */}
      <div className="flex-1 min-h-0 min-w-0 bg-[#120d09] p-0 overflow-hidden flex flex-col">
        {isPdf ? (
          matchedDossier ? (
            /* Hiển thị trực tiếp bản in Diegetic Dossier Sheet với zoom controls */
            <div className="w-full h-full min-h-0 min-w-0 bg-[#0f0c09] relative flex flex-col">
              <DiegeticDossierSheet document={matchedDossier} />
            </div>
          ) : (
            /* Hiển thị PDF dạng Native Canvas Annotator cho phép vẽ và tô màu */
            <NativePdfAnnotator
              url={pdfUrl}
              title={selectedView.data.title}
              docCode={selectedView.data.code}
            />
          )
        ) : (
          <EvidencePhotoAnnotator
            photoUrl={photoUrl || "/photo_scene_overview.jpg"}
            title={selectedView.data.title || "Vật chứng"}
            evidenceId={displayCode}
          />
        )}
      </div>
    </div>
  );
}
