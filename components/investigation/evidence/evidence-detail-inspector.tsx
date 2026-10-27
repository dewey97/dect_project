"use client";

import React from "react";
import type { SelectedView } from "./evidence-types";
import { normalizeImageUrl } from "@/lib/utils";
import { useDossierDocuments } from "@/lib/hooks/use-dossier-documents";
import { useCaseDossiers } from "@/lib/hooks/use-case-dossiers";
import { DiegeticDossierSheet } from "./diegetic-dossier-sheet";
import { EvidencePhotoAnnotator } from "./evidence-photo-annotator";
import { DiegeticDocumentReader } from "./diegetic-document-reader";

interface EvidenceDetailInspectorProps {
  selectedView: SelectedView | null;
  caseId?: string;
}

export function EvidenceDetailInspector({
  selectedView,
  caseId = "case_000",
}: EvidenceDetailInspectorProps) {
  // Hooks MUST be called unconditionally at the top level
  const { findMatchingDocument } = useDossierDocuments(caseId);
  const { dossierOf } = useCaseDossiers(caseId);

  if (!selectedView) {
    return (
      <div className="hidden lg:flex flex-1 min-w-0 min-h-0 bg-[#16120e] border-0 rounded-none items-center justify-center p-8 text-center text-[#8c745f] h-full">
        <p className="font-mono text-xs uppercase tracking-wider">
          Chọn một tài liệu trong khay tài liệu để bắt đầu điều tra
        </p>
      </div>
    );
  }

  const isPdf = selectedView.type === "pdf";
  const displayCode = isPdf
    ? selectedView.data.code || "HỒ SƠ"
    : selectedView.data.code || "VẬT CHỨNG";

  const photoUrl = !isPdf ? normalizeImageUrl(selectedView.data.thumbnail) : "";

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
    <div className="hidden lg:flex flex-1 min-w-0 min-h-0 bg-[#16120e] border-0 rounded-none overflow-hidden flex-col h-full relative">
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
            /* Hiển thị tài liệu nghiệp vụ dạng văn bản diegetic chính thức (ví dụ cẩm nang A-01, pháp y A-04, hiện trường A-05) */
            <DiegeticDocumentReader
              title={selectedView.data.title}
              code={displayCode}
              dossierTitle={dossierTitle}
              description={
                (selectedView.data as { preview?: string; description?: string }).preview ||
                (selectedView.data as { preview?: string; description?: string }).description
              }
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
