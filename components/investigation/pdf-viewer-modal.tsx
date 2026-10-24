'use client'

import { useEffect, useRef } from 'react'
import { X, FileText, ImageIcon, ShieldCheck } from 'lucide-react'
import type { SelectedView } from '@/components/investigation/evidence/evidence-types'
import { normalizeDrivePdfUrl, normalizeImageUrl } from '@/lib/utils'
import { useDossierDocuments } from '@/lib/hooks/use-dossier-documents'
import { trackDossierView, trackPhotoInspected } from '@/lib/analytics'
import { DiegeticDossierSheet } from './evidence/diegetic-dossier-sheet'
import { EvidencePhotoAnnotator } from './evidence/evidence-photo-annotator'
import { NativePdfAnnotator } from './evidence/native-pdf-annotator'

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

  // Tracking thời gian xem tài liệu hoặc soi ảnh
  const openTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = Date.now()
    } else {
      const durationSeconds = Math.round((Date.now() - openTimeRef.current) / 1000)
      if (durationSeconds >= 1) {
        if (isEvidence && selectedView) {
          trackPhotoInspected({
            photoId: selectedView.data.code || selectedView.data.id || 'unknown_photo',
            title: activeTitle,
            durationSeconds,
          })
        } else if (isPdf || pdfUrl) {
          trackDossierView({
            docId: selectedView?.type === 'pdf' ? (selectedView.data.code || selectedView.data.id) : (title || 'document'),
            docTitle: activeTitle,
            docType: isPdf ? 'pdf_dossier' : 'legacy_pdf',
            durationSeconds,
            caseId,
          })
        }
      }
    }
  }, [isOpen, isEvidence, isPdf, selectedView, activeTitle, pdfUrl, caseId])

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
            <EvidencePhotoAnnotator
              photoUrl={normalizeImageUrl(selectedView.data.thumbnail) || "/photo_scene_overview.jpg"}
              title={selectedView.data.title || "Vật chứng"}
              evidenceId={selectedView.data.code}
            />
          ) : isPdf && matchedDossier ? (
            /* Hiển thị trực tiếp bản in Diegetic Dossier Sheet */
            <div className="w-full h-full min-h-0 min-w-0 bg-[#0f0c09] relative flex flex-col">
              <DiegeticDossierSheet document={matchedDossier} />
            </div>
          ) : normalizedPdfUrl ? (
            <NativePdfAnnotator
              url={normalizedPdfUrl}
              title={activeTitle}
              docCode={selectedView?.type === 'pdf' ? selectedView.data.code : undefined}
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
