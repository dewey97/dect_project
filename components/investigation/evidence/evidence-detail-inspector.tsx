'use client'

import React from 'react'
import { FileText, ImageIcon, ShieldCheck } from 'lucide-react'
import { SelectedView } from './evidence-types'

interface EvidenceDetailInspectorProps {
  selectedView: SelectedView
}

export function EvidenceDetailInspector({ selectedView }: EvidenceDetailInspectorProps) {
  return (
    <div className="w-full lg:w-[52%] xl:w-[54%] shrink-0 bg-[#16120e] border-2 border-[#3d2c1e] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col h-full">
      {/* Header Info Bar */}
      <div className="border-b border-[#3d2c1e] p-4 bg-[#241a12] flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedView.type === 'pdf' ? (
            <FileText className="size-4 text-[#d9a066] shrink-0" />
          ) : (
            <ImageIcon className="size-4 text-[#d9a066] shrink-0" />
          )}
          <span className="font-mono text-xs font-bold text-[#e5d8cb] truncate">
            {selectedView.type === 'pdf' ? selectedView.data.title : selectedView.data.title}
          </span>
        </div>
        <span className="font-mono text-[0.6rem] text-[#d9a066] bg-[#140e0a] px-2 py-0.5 border border-[#3e2e20] shrink-0 uppercase font-bold">
          {selectedView.type === 'pdf' ? `📄 HỒ SƠ // ${selectedView.data.code}` : `📸 VẬT CHỨNG // ${selectedView.data.evidenceId}`}
        </span>
      </div>

      {/* Main View Container */}
      <div className={`flex-1 custom-scrollbar bg-[#120d09] ${selectedView.type === 'pdf' ? 'p-0 overflow-hidden' : 'p-4 sm:p-6 overflow-y-auto'}`}>
        {selectedView.type === 'pdf' ? (
          <iframe
            src={`${selectedView.data.url}#toolbar=0&navpanes=0`}
            className="w-full h-full border-0 block"
            title={selectedView.data.title}
          />
        ) : (
          <div className="space-y-5">
            {/* Physical Evidence Photo Showcase Frame */}
            <div className="relative w-full aspect-video bg-[#0d0906] border-2 border-[#3d2c1e] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center group">
              <img
                src={selectedView.data.thumbnail}
                alt={selectedView.data.title}
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#1e1610]/90 backdrop-blur-md px-3 py-1 border border-[#4a3625] text-amber-200 font-mono text-[0.65rem] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="size-3.5 text-[#d9a066]" />
                <span>MÃ NIÊM PHONG: {selectedView.data.evidenceId}</span>
              </div>
            </div>

            {/* Evidence Chain of Custody & Metadata Card */}
            <div className="p-4 bg-[#1b140e] border border-[#3e2e20] rounded-xl space-y-3 font-mono text-xs shadow-inner">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#3d2c1e] text-[0.7rem]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#ad9885] uppercase tracking-wider font-bold">Mốc thời gian ghi nhận:</span>
                  <span className="text-[#f4e8d8] font-bold">{selectedView.data.timestamp || '24/07/2026'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#ad9885] uppercase tracking-wider font-bold">Người thu thập vật chứng:</span>
                  <span className="text-[#d9a066] font-bold">{selectedView.data.recoveredBy || 'ĐIỀU TRA VIÊN'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#ad9885] uppercase tracking-wider font-bold">Trạng thái toàn vẹn:</span>
                  <span className="text-emerald-400 font-bold">{selectedView.data.integrityStatus?.toUpperCase() || 'SECURED'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#ad9885] uppercase tracking-wider font-bold">Trạng thái bảo quản:</span>
                  <span className="text-emerald-400 font-bold">{selectedView.data.chainOfCustody || 'VERIFIED'}</span>
                </div>
              </div>

              {/* Detailed Forensic Typewriter Analysis Notes */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-[#d9a066]" />
                  <span className="font-mono text-xs font-bold text-[#d9a066] uppercase tracking-wider">
                    BIÊN BẢN PHÂN TÍCH PHÁP Y & VẾT TÍCH:
                  </span>
                </div>
                <div className="p-4 sm:p-5 bg-[#221a13] border border-[#443324] rounded-xl font-mono text-xs leading-relaxed text-amber-100/90 shadow-inner relative overflow-hidden space-y-3">
                  {/* Notebook Ruled Background Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_19px,#3b599815_20px)] bg-[size:100%_20px] pointer-events-none" />

                  <p className="relative z-10 font-bold italic text-amber-200/90">
                    "{selectedView.data.preview}"
                  </p>
                  <p className="relative z-10 text-[0.68rem] text-[#ad9885] not-italic border-t border-[#3d2b1c] pt-2.5 font-mono">
                    * Mẫu vật chứng này đã được chụp ảnh lưu hồ sơ và đưa vào túi bảo quản chuyên dụng của Ban chuyên án.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
