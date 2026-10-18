'use client'

import React from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LyLichData, PaperConfig } from '@/types/dossier'
import type { DbDossierDocument } from '@/lib/actions/dossier-actions'

interface DossierLyLichSheetProps {
  docItem: DbDossierDocument
  docData: LyLichData
  docPaper: PaperConfig
  isSelected?: boolean
  highlightEditable?: boolean
  showSeal?: boolean
  sealAngle?: number
  canMoveLeft?: boolean
  canMoveRight?: boolean
  onMoveLeft?: () => void
  onMoveRight?: () => void
  onSelect?: () => void
  onUpdateDoc?: (tagCode: string, updater: (prev: LyLichData) => LyLichData) => void
  readOnly?: boolean
}

export function DossierLyLichSheet({
  docItem,
  docData,
  docPaper,
  isSelected = false,
  highlightEditable = false,
  showSeal = true,
  sealAngle = -5,
  canMoveLeft = false,
  canMoveRight = false,
  onMoveLeft,
  onMoveRight,
  onSelect = () => {},
  onUpdateDoc = () => {},
  readOnly = false
}: DossierLyLichSheetProps) {
  return (
    <div
      id={`doc-sheet-${docItem.tag_code}`}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-6 transition-all",
        !readOnly && "cursor-pointer group p-3 rounded-2xl border-2",
        !readOnly && (isSelected
          ? "border-amber-500/80 bg-amber-500/5 shadow-2xl ring-4 ring-amber-500/10"
          : "border-transparent hover:border-white/20 hover:bg-white/[0.02]"
        )
      )}
    >
      {/* Header Label & Reorder Buttons */}
      {!readOnly && (
        <div className="flex items-center justify-between w-full px-2 py-1 text-xs">
          <div className="flex items-center gap-2">
            {/* Nút Đẩy Trái / Đẩy Phải */}
            <div className="flex items-center bg-black/60 rounded-md border border-white/10 p-0.5">
              <button
                type="button"
                disabled={!canMoveLeft}
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveLeft?.()
                }}
                title="Đẩy sang trái (Di chuyển hồ sơ lên trước)"
                className={cn(
                  "p-1 rounded transition-all",
                  canMoveLeft
                    ? "text-neutral-300 hover:text-white hover:bg-white/15 active:scale-95"
                    : "text-neutral-600 cursor-not-allowed opacity-40"
                )}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                disabled={!canMoveRight}
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveRight?.()
                }}
                title="Đẩy sang phải (Di chuyển hồ sơ về sau)"
                className={cn(
                  "p-1 rounded transition-all",
                  canMoveRight
                    ? "text-neutral-300 hover:text-white hover:bg-white/15 active:scale-95"
                    : "text-neutral-600 cursor-not-allowed opacity-40"
                )}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <span
              className={cn(
                "font-mono font-bold px-2 py-0.5 rounded text-[11px]",
                isSelected ? "bg-amber-500 text-black font-extrabold" : "bg-zinc-800 text-zinc-300"
              )}
            >
              {docItem.tag_code}
            </span>
            <span className="font-semibold text-zinc-200 text-sm max-w-[160px] truncate">
              {docData.fullName || docItem.subject_name}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Lý Lịch
          </span>
        </div>
      )}

      {/* Document Render */}
      {docPaper.size === 'A5' && docPaper.orientation === 'portrait' ? (
        <div className="flex flex-col items-center gap-8">
          {/* Sheet 1 */}
          <div className="print-canvas-hs print-page-break w-[559px] min-h-[794px] bg-[#FAF7EE] p-6 shadow-2xl relative select-text text-[#171717] flex flex-col justify-between border border-[#171717]">
            <div>
              <div className="text-center space-y-0.5 mb-3">
                <div className="font-sans font-bold text-[11px] uppercase tracking-[0.05em] text-[#262626]">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div style={{ fontFamily: 'EB Garamond, serif' }} className="font-bold text-[12px] text-[#262626]">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="w-24 h-px bg-[#262626] mx-auto my-1" />
              </div>

              <div className="text-center mb-4">
                <h2 style={{ fontFamily: 'EB Garamond, serif' }} className="font-bold text-[17px] uppercase tracking-[-0.025em] text-[#171717] leading-tight">
                  BẢNG TRÍCH LỤC LÝ LỊCH TƯ PHÁP
                </h2>
                <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-[11.5px] text-[#404040]">
                  Cơ quan Cảnh sát Điều tra TP. Hà Nội
                </p>
              </div>

              <div className="flex gap-4 items-start mb-4">
                <div className="w-[100px] h-[133px] border border-[#D4D4D4] shadow-sm relative flex-shrink-0 bg-neutral-200 overflow-hidden">
                  {docData.photoUrl ? (
                    <img src={docData.photoUrl} alt="Ảnh nhận diện" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-[10px]">
                      <ImageIcon className="w-6 h-6 mb-1 text-neutral-400" />
                      <span>Ảnh 3x4</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2 text-[13px]" style={{ fontFamily: 'EB Garamond, serif' }}>
                  <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                    <span className="text-[#171717] font-medium flex-shrink-0">Họ và tên:</span>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, fullName: val }))
                      }}
                      style={{ fontFamily: 'Dancing Script, cursive' }}
                      className={cn(
                        "text-[#1A365D] font-bold text-[17px] leading-none outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                      )}
                    >
                      {docData.fullName}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                    <span className="text-[#404040] text-[12px]">Tên thường gọi:</span>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, nickname: val }))
                      }}
                      style={{ fontFamily: 'Dancing Script, cursive' }}
                      className={cn(
                        "text-[#1A365D] font-medium text-[16px] leading-none outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                      )}
                    >
                      {docData.nickname}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-[#D4D4D4] pb-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#171717]">Sinh ngày:</span>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          const val = e.currentTarget.textContent || ''
                          onUpdateDoc(docItem.tag_code, prev => ({ ...prev, dob: val }))
                        }}
                        style={{ fontFamily: 'Dancing Script, cursive' }}
                        className={cn(
                          "text-[#1A365D] font-medium text-[15px] outline-none rounded transition-all",
                          highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                        )}
                      >
                        {docData.dob}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#171717]">Giới tính:</span>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          const val = e.currentTarget.textContent || ''
                          onUpdateDoc(docItem.tag_code, prev => ({ ...prev, gender: val }))
                        }}
                        style={{ fontFamily: 'Dancing Script, cursive' }}
                        className={cn(
                          "text-[#1A365D] font-medium text-[15px] outline-none rounded transition-all",
                          highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                        )}
                      >
                        {docData.gender}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                    <span className="text-[#171717]">Số CMND:</span>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, cmnd: val }))
                      }}
                      style={{ fontFamily: 'Dancing Script, cursive' }}
                      className={cn(
                        "text-[#1A365D] font-medium text-[15px] outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                      )}
                    >
                      {docData.cmnd}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-[13px]" style={{ fontFamily: 'EB Garamond, serif' }}>
                <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                  <span className="text-[#171717] flex-shrink-0">Nơi ĐKHKTT:</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, permanentAddress: val }))
                    }}
                    style={{ fontFamily: 'Dancing Script, cursive' }}
                    className={cn(
                      "text-[#1A365D] font-medium text-[15.5px] leading-tight outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.permanentAddress}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                  <span className="text-[#171717] flex-shrink-0">Nơi ở hiện nay:</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, currentAddress: val }))
                    }}
                    style={{ fontFamily: 'Dancing Script, cursive' }}
                    className={cn(
                      "text-[#1A365D] font-medium text-[15.5px] leading-tight outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.currentAddress}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-b border-[#D4D4D4] pb-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[#171717]">Nghề nghiệp:</span>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, job: val }))
                      }}
                      style={{ fontFamily: 'Dancing Script, cursive' }}
                      className={cn(
                        "text-[#1A365D] font-medium text-[15.5px] outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                      )}
                    >
                      {docData.job}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[#171717]">SĐT:</span>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, phone: val }))
                      }}
                      style={{ fontFamily: 'Dancing Script, cursive' }}
                      className={cn(
                        "text-[#1A365D] font-medium text-[15px] outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                      )}
                    >
                      {docData.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center text-[12px] border-t border-neutral-300">
              <span className="font-mono">{docData.idCode}</span>
              <span className="text-neutral-500 font-mono">Tờ 1/2</span>
            </div>
          </div>

          {/* Sheet 2 */}
          <div className="print-canvas-hs print-page-break w-[559px] min-h-[794px] bg-[#FAF7EE] p-6 shadow-2xl relative select-text text-[#171717] flex flex-col justify-between border border-[#171717]">
            <div>
              <div className="text-center mb-4 space-y-0.5">
                <h2 style={{ fontFamily: 'EB Garamond, serif' }} className="font-bold text-[14px] uppercase tracking-wide text-[#171717]">
                  BẢNG TRÍCH LỤC LÝ LỊCH TƯ PHÁP
                </h2>
              </div>
              <div className="space-y-3 text-[13px] leading-relaxed text-justify text-[#171717]" style={{ fontFamily: 'EB Garamond, serif' }}>
                <p>
                  <span className="font-bold">1. Tiền án, tiền sự:</span>{' '}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, criminalRecord: val }))
                    }}
                    className={cn(
                      "outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.criminalRecord}
                  </span>
                </p>
                <p>
                  <span className="font-bold">2. Mối quan hệ với nạn nhân:</span>{' '}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, relationWithVictim: val }))
                    }}
                    className={cn(
                      "outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.relationWithVictim}
                  </span>
                </p>
                <p>
                  <span className="font-bold">3. Hồ sơ lưu trữ:</span>{' '}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, archiveNote: val }))
                    }}
                    className={cn(
                      "outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.archiveNote}
                  </span>
                </p>
              </div>
            </div>

            <div className="border-t border-[#D4D4D4] pt-4">
              <div className="flex justify-between items-center pt-4 border-t border-neutral-300 mt-4">
                <span className="text-neutral-500 font-mono text-[12px]">Tờ 2/2</span>
                <div className={cn(
                  "bg-[#D9D9D9] border border-black rounded-[90px] px-3.5 py-0.5 text-black font-medium text-[13px] leading-tight min-w-[50px] text-center transition-all",
                  highlightEditable && "editable-field-indicator ring-2 ring-amber-400 ring-offset-2 ring-offset-[#FAF7EE]"
                )}>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, tagCode: val }))
                    }}
                    className="outline-none font-medium"
                  >
                    {docData.tagCode || docItem.tag_code}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Landscape Format */
        <div
          style={{
            width: docPaper.size === 'A4' ? '1050px' : '794px',
            height: docPaper.size === 'A4' ? '730px' : '559px'
          }}
          className="print-canvas-hs bg-[#FAF7EE] p-[14px] shadow-2xl relative select-text text-[#171717] flex justify-between items-stretch overflow-hidden print-page-break"
        >
          {/* LEFT HALF */}
          <div className={cn(
            "border border-[#171717] p-5 flex flex-col justify-between bg-[#FAF7EE] relative",
            docPaper.size === 'A4' ? "w-[500px]" : "w-[370px]"
          )}>
            <div>
              <div className="text-center space-y-0.5 mb-3">
                <div className="font-sans font-bold text-[11px] uppercase tracking-[0.05em] text-[#262626]">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div style={{ fontFamily: 'EB Garamond, serif' }} className="font-bold text-[12px] text-[#262626]">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="w-24 h-px bg-[#262626] mx-auto my-1" />
              </div>
              <div className="text-center mb-4">
                <h2 style={{ fontFamily: 'EB Garamond, serif' }} className="font-bold text-[17px] uppercase tracking-[-0.025em] text-[#171717] leading-tight">
                  BẢNG TRÍCH LỤC LÝ LỊCH TƯ PHÁP
                </h2>
              </div>
              <div className="flex gap-4 items-start mb-3">
                <div className="w-[96px] h-[128px] border border-[#D4D4D4] shadow-sm relative flex-shrink-0 bg-neutral-200 overflow-hidden">
                  {docData.photoUrl ? (
                    <img src={docData.photoUrl} alt="Ảnh nhận diện" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-[10px]">
                      <ImageIcon className="w-6 h-6 mb-1 text-neutral-400" />
                      <span>Ảnh 3x4</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5 text-[12px]" style={{ fontFamily: 'EB Garamond, serif' }}>
                  <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                    <span className="text-[#171717] font-medium flex-shrink-0">Họ và tên:</span>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, fullName: val }))
                      }}
                      style={{ fontFamily: 'Dancing Script, cursive' }}
                      className={cn(
                        "text-[#1A365D] font-bold text-[16px] leading-none outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                      )}
                    >
                      {docData.fullName}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                    <span className="text-[#404040] text-[11.5px]">Tên thường gọi:</span>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, nickname: val }))
                      }}
                      style={{ fontFamily: 'Dancing Script, cursive' }}
                      className={cn(
                        "text-[#1A365D] font-medium text-[15px] leading-none outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                      )}
                    >
                      {docData.nickname}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-[#D4D4D4] pb-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#171717]">Sinh ngày:</span>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          const val = e.currentTarget.textContent || ''
                          onUpdateDoc(docItem.tag_code, prev => ({ ...prev, dob: val }))
                        }}
                        style={{ fontFamily: 'Dancing Script, cursive' }}
                        className={cn(
                          "text-[#1A365D] font-medium text-[14px] outline-none rounded transition-all",
                          highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                        )}
                      >
                        {docData.dob}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#171717]">Giới tính:</span>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          const val = e.currentTarget.textContent || ''
                          onUpdateDoc(docItem.tag_code, prev => ({ ...prev, gender: val }))
                        }}
                        style={{ fontFamily: 'Dancing Script, cursive' }}
                        className={cn(
                          "text-[#1A365D] font-medium text-[14px] outline-none rounded transition-all",
                          highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                        )}
                      >
                        {docData.gender}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                    <span className="text-[#171717]">Số CMND:</span>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, cmnd: val }))
                      }}
                      style={{ fontFamily: 'Dancing Script, cursive' }}
                      className={cn(
                        "text-[#1A365D] font-medium text-[14px] outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                      )}
                    >
                      {docData.cmnd}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-[11.5px]" style={{ fontFamily: 'EB Garamond, serif' }}>
              <div className="flex items-center gap-1">
                <span className="text-neutral-600">Mã định danh:</span>
                <span className="font-sans font-medium text-[#171717]">{docData.idCode}</span>
              </div>
            </div>
          </div>

          {/* RIGHT HALF */}
          <div className={cn(
            "border border-[#171717] p-5 flex flex-col justify-between bg-[#FAF7EE] relative",
            docPaper.size === 'A4' ? "w-[500px]" : "w-[370px]"
          )}>
            <div>
              <div className="text-center mb-4 space-y-0.5">
                <h2 style={{ fontFamily: 'EB Garamond, serif' }} className="font-bold text-[13.5px] uppercase tracking-wide text-[#171717]">
                  BẢNG TRÍCH LỤC LÝ LỊCH TƯ PHÁP
                </h2>
              </div>
              <div className="space-y-2.5 text-[12px] leading-relaxed text-justify text-[#171717]" style={{ fontFamily: 'EB Garamond, serif' }}>
                <p>
                  <span className="font-bold">1. Tiền án, tiền sự:</span>{' '}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, criminalRecord: val }))
                    }}
                    className={cn(
                      "outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.criminalRecord}
                  </span>
                </p>
                <p>
                  <span className="font-bold">2. Mối quan hệ với nạn nhân:</span>{' '}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, relationWithVictim: val }))
                    }}
                    className={cn(
                      "outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.relationWithVictim}
                  </span>
                </p>
                <p>
                  <span className="font-bold">3. Hồ sơ lưu trữ:</span>{' '}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, archiveNote: val }))
                    }}
                    className={cn(
                      "outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.archiveNote}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <div className={cn(
                "bg-[#D9D9D9] border border-black rounded-[90px] px-3 py-0.5 text-black font-medium text-[12.5px] leading-tight min-w-[45px] text-center transition-all",
                highlightEditable && "editable-field-indicator ring-2 ring-amber-400 ring-offset-2 ring-offset-[#FAF7EE]"
              )}>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => {
                    const val = e.currentTarget.textContent || ''
                    onUpdateDoc(docItem.tag_code, prev => ({ ...prev, tagCode: val }))
                  }}
                  className="outline-none"
                >
                  {docData.tagCode || docItem.tag_code}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
