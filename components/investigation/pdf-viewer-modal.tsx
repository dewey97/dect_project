'use client'

import { X, Download, FileText, ExternalLink } from 'lucide-react'

interface PDFViewerModalProps {
  pdfUrl: string | null
  title: string | null
  isOpen: boolean
  onClose: () => void
}

export function PDFViewerModal({ pdfUrl, title, isOpen, onClose }: PDFViewerModalProps) {
  if (!isOpen || !pdfUrl) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative flex flex-col w-full max-w-4xl h-[90vh] bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <FileText className="size-5 text-primary shrink-0" />
            <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
              {title || 'Tài liệu PDF'}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="size-5" />
            </button>
          </div>

        </div>

        {/* PDF Body */}
        <div className="flex-1 w-full h-full bg-neutral-900 relative">
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full border-0"
            title={title || 'Document Viewer'}
          />

        </div>
      </div>
    </div>
  )
}
