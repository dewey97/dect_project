'use client'

import { X, FileText, ImageIcon, ShieldCheck } from 'lucide-react'
import type { SelectedView } from '@/components/investigation/evidence/evidence-types'

interface PDFViewerModalProps {
  pdfUrl?: string | null
  title?: string | null
  selectedView?: SelectedView | null
  isOpen: boolean
  onClose: () => void
}

export function PDFViewerModal({ pdfUrl, title, selectedView, isOpen, onClose }: PDFViewerModalProps) {
  if (!isOpen) return null

  const isEvidence = selectedView?.type === 'evidence'
  const activeTitle = title || (selectedView ? selectedView.data.title : 'Tài liệu')
  const activePdfUrl = pdfUrl || (selectedView?.type === 'pdf' ? selectedView.data.url : null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative flex flex-col w-full max-w-4xl h-[90vh] bg-[#16120e] border-2 border-[#3d2c1e] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
              className="p-1.5 text-[#ad9885] hover:text-[#e5d8cb] hover:bg-[#342417] border border-[#3e2e20] rounded-md transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 w-full h-full bg-[#120d09] relative overflow-hidden flex flex-col">
          {isEvidence && selectedView ? (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5">
              <div className="relative w-full aspect-video bg-[#0d0906] border-2 border-[#3d2c1e] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center group">
                <img
                  src={selectedView.data.thumbnail}
                  alt={selectedView.data.title}
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute top-3 left-3 bg-[#1e1610]/90 backdrop-blur-md px-3 py-1 border border-[#4a3625] text-amber-200 font-mono text-[0.65rem] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <ShieldCheck className="size-3.5 text-[#d9a066]" />
                  <span>MÃ NIÊM PHONG: {selectedView.data.evidenceId}</span>
                </div>
              </div>

              <div className="p-4 bg-[#1b140e] border border-[#3e2e20] rounded-xl space-y-3 font-mono text-xs shadow-inner">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#3d2c1e] text-[0.7rem]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[#ad9885] uppercase tracking-wider font-bold">Mốc thời gian:</span>
                    <span className="text-[#f4e8d8] font-bold">{selectedView.data.timestamp || '24/07/2016'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[#ad9885] uppercase tracking-wider font-bold">Người thu thập:</span>
                    <span className="text-[#d9a066] font-bold">{selectedView.data.recoveredBy || 'ĐIỀU TRA VIÊN'}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-[#d9a066]" />
                    <span className="font-mono text-xs font-bold text-[#d9a066] uppercase tracking-wider">
                      BIÊN BẢN PHÂN TÍCH PHÁP Y:
                    </span>
                  </div>
                  <div className="p-4 bg-[#221a13] border border-[#443324] rounded-xl font-mono text-xs leading-relaxed text-amber-100/90 shadow-inner">
                    <p className="font-bold italic text-amber-200/90">
                      "{selectedView.data.preview}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : activePdfUrl ? (
            <iframe
              src={`${activePdfUrl}#toolbar=0&navpanes=0`}
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
