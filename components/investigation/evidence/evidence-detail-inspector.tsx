'use client'

import React from 'react'
import { FileText, ImageIcon } from 'lucide-react'
import { SelectedView } from './evidence-types'
import { normalizeDrivePdfUrl, normalizeImageUrl } from '@/lib/utils'

interface EvidenceDetailInspectorProps {
  selectedView: SelectedView
}

export function EvidenceDetailInspector({ selectedView }: EvidenceDetailInspectorProps) {
  const isPdf = selectedView.type === 'pdf'
  const displayCode = isPdf 
    ? (selectedView.data.code || 'HỒ SƠ')
    : (selectedView.data.evidenceId || 'VẬT CHỨNG')

  const pdfUrl = isPdf ? normalizeDrivePdfUrl(selectedView.data.url) : ''
  const photoUrl = !isPdf ? normalizeImageUrl(selectedView.data.thumbnail) : ''

  return (
    <div className="hidden lg:flex flex-1 min-w-0 min-h-0 bg-[#16120e] border-2 border-[#3d2c1e] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex-col h-full">
      {/* Header Info Bar */}
      <div className="shrink-0 border-b border-[#3d2c1e] p-3 sm:p-3.5 bg-[#241a12] flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          {isPdf ? (
            <FileText className="size-4 text-[#d9a066] shrink-0" />
          ) : (
            <ImageIcon className="size-4 text-[#d9a066] shrink-0" />
          )}
          <span className="font-mono text-xs font-bold text-[#e5d8cb] truncate">
            {selectedView.data.title}
          </span>
        </div>
        <span className="font-mono text-[0.6rem] text-[#d9a066] bg-[#140e0a] px-2 py-0.5 border border-[#3e2e20] shrink-0 uppercase font-bold">
          {isPdf ? `📄 ${displayCode}` : `📸 ${displayCode}`}
        </span>
      </div>

      {/* Main View Container */}
      <div className="flex-1 min-h-0 min-w-0 bg-[#120d09] p-0 overflow-hidden flex flex-col">
        {isPdf ? (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0 block"
            title={selectedView.data.title}
          />
        ) : (
          <div className="w-full h-full p-3 sm:p-4 flex flex-col items-center justify-center bg-[#0d0906] relative overflow-hidden">
            {/* Background Texture / Subtle Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#3d2c1e_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

            {/* Photo Showcase Frame - Maximum Viewport */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
              <img
                src={photoUrl}
                alt={selectedView.data.title}
                className="max-w-full max-h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] select-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
