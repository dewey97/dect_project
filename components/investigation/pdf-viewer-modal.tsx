'use client'

import { X, FileText, ImageIcon, ShieldCheck } from 'lucide-react'
import type { SelectedView } from '@/components/investigation/evidence/evidence-types'
import { normalizeDrivePdfUrl, normalizeImageUrl } from '@/lib/utils'
import { useDossierDocuments } from '@/lib/hooks/use-dossier-documents'
import { DiegeticDossierSheet } from './evidence/diegetic-dossier-sheet'

interface PDFViewerModalProps {
  pdfUrl?: string | null
  title?: string | null
  selectedView?: SelectedView | null
  isOpen: boolean
  onClose: () => void
  caseId?: string
}

export function PDFViewerModal({ pdfUrl, title, selectedView, isOpen, onClose, caseId = 'case_000' }: PDFViewerModalProps) {
  const isEvidence = selectedView?.type === 'evidence'
  const isPdf = selectedView?.type === 'pdf'
  const activeTitle = title || (selectedView ? selectedView.data.title : 'Tài liệu')
  const rawPdfUrl = pdfUrl || (isPdf ? selectedView.data.url : null)
  const normalizedPdfUrl = rawPdfUrl ? normalizeDrivePdfUrl(rawPdfUrl) : null

  // Tra cứu xem hồ sơ này đã được số hóa trên Dossier Studio chưa
  const { findMatchingDocument } = useDossierDocuments(caseId)
  const matchedDossier = isPdf ? findMatchingDocument({
    code: selectedView?.data.code,
    title: selectedView?.data.title,
    id: selectedView?.data.id
  }) : undefined

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative flex flex-col w-full max-w-4xl h-[90vh] bg-[#16120e] border-2 border-[#3d2c1e] rounded-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3d2c1e] bg-[#241a12]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {isEvidence ? (
              <ImageIcon className="size-5 text-[#d9a066] shrink-0" />
            ) : (
              <FileText className="size-5 text-[#d9a066] shrink-0" />
            )}
            <h3 className="font-semibold text-sm sm:text-base text-[#e5d8cb] truncate font-mono">
              {activeTitle}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="p-1.5 text-[#ad9885] hover:text-[#e5d8cb] hover:bg-[#342417] border border-[#3e2e20] rounded-none transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 w-full h-full bg-[#120d09] relative overflow-hidden flex flex-col">
          {isEvidence && selectedView ? (
            <div className="flex-1 p-3 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center bg-[#0d0906]">
              <div className="relative max-w-sm sm:max-w-lg max-h-[75vh] p-2 bg-[#1b140e] border border-[#3d2c1e] rounded-none shadow-2xl flex flex-col items-center justify-center">
                <img
                  src={normalizeImageUrl(selectedView.data.thumbnail) || "/photo_scene_overview.jpg"}
                  alt={selectedView.data.title || "Vật chứng"}
                  className="max-w-full max-h-[60vh] object-contain rounded-none select-none shadow-md"
                />
                {selectedView.data.evidenceId && (
                  <div className="mt-2 text-center">
                    <span className="font-mono text-xs font-bold text-[#d9a066] tracking-wider uppercase">
                      📸 VẬT CHỨNG [{selectedView.data.evidenceId}]
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : isPdf && matchedDossier ? (
            /* Hiển thị trực tiếp bản in Diegetic Dossier Sheet */
            <div className="w-full h-full overflow-y-auto custom-scrollbar bg-[#0f0c09] p-3 sm:p-6 flex flex-col items-center">
              <div className="w-full max-w-full overflow-x-auto flex justify-center pb-4">
                <DiegeticDossierSheet document={matchedDossier} />
              </div>
            </div>
          ) : normalizedPdfUrl ? (
            <iframe
              src={normalizedPdfUrl.includes('drive.google.com') ? normalizedPdfUrl : `${normalizedPdfUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title={activeTitle}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
              Không tìm thấy nội dung tài liệu.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
