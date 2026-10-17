'use client'

import React from 'react'
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
    <div className="hidden lg:flex flex-1 min-w-0 min-h-0 bg-[#16120e] border-2 border-[#3d2c1e] rounded-none shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex-col h-full relative">

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

            {/* Photo Showcase Frame - Neat framed photo without over-enlarging */}
            <div className="relative max-w-sm sm:max-w-md xl:max-w-lg max-h-[75%] p-2 bg-[#1b140e] border border-[#3d2c1e] rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
              <img
                src={photoUrl}
                alt={selectedView.data.title}
                className="max-w-full max-h-[55vh] object-contain rounded-none shadow-md select-none"
              />
              {displayCode && (
                <div className="mt-2 text-center flex items-center gap-1.5 font-mono text-[0.68rem] font-bold text-[#d9a066] tracking-wider uppercase">
                  <span>📸</span>
                  <span>VẬT CHỨNG [{displayCode}]</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
