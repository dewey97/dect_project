'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { resolveEvidenceCode, getSortedClues } from '@/lib/cases/case-000-clues'

export interface PendingClueInputs {
  code?: string
  textPhone?: string
  voicePhone?: string
}

interface ClueCodePickerProps {
  selectedClueIds: string[]
  customPhoneEvidences?: Array<{ id: string; label: string }>
  onAddClueId: (id: string) => void
  onRemoveClueId: (id: string) => void
  onAddCustomPhone?: (phoneEvidence: { id: string; label: string }) => void
  onPendingChange?: (pending: PendingClueInputs) => void
  label?: string
  placeholder?: string
  emptyStateText?: string
  hidePhoneInputs?: boolean
}

export function ClueCodePicker({
  selectedClueIds,
  customPhoneEvidences = [],
  onAddClueId,
  onRemoveClueId,
  onPendingChange,
  label = 'BẰNG CHỨNG ĐÃ CHỌN',
  placeholder = 'Nhập mã chứng cứ...',
  emptyStateText = 'Chưa có bằng chứng nào được chọn.',
}: ClueCodePickerProps) {
  const [codeInput, setCodeInput] = useState('')

  const handleAddCode = (codeStr: string) => {
    if (!codeStr || !codeStr.trim()) return

    const raw = codeStr.trim()
    const direct = resolveEvidenceCode(raw)
    let addedCount = 0

    if (direct) {
      onAddClueId(direct.id)
      addedCount++
    } else {
      const tokens = raw
        .split(/[,;\n\r]+/)
        .flatMap((token) => token.trim().split(/\s+/))
        .map((t) => t.trim())
        .filter(Boolean)

      tokens.forEach((token) => {
        const resolved = resolveEvidenceCode(token)
        if (resolved) {
          onAddClueId(resolved.id)
          addedCount++
        }
      })
    }

    if (addedCount > 0) {
      detectiveAudio.playPaperRustle()
      setCodeInput('')
      onPendingChange?.({
        code: '',
      })
    }
  }

  const sortedClues = getSortedClues(selectedClueIds, customPhoneEvidences)

  return (
    <div className="space-y-3">
      {/* 1. THANH NHẬP MÃ BẰNG CHỨNG */}
      <div className="space-y-1">
        <label className="text-[11px] font-mono font-bold text-[#1a120b] flex items-center gap-1.5">
          🔍 Mã bằng chứng:
        </label>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                const val = e.target.value
                if (val.includes(',') || val.includes(';')) {
                  handleAddCode(val)
                } else {
                  setCodeInput(val)
                  onPendingChange?.({
                    code: val,
                  })
                }
              }}
              onBlur={() => {
                if (codeInput.trim()) {
                  handleAddCode(codeInput)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCode(codeInput)
                }
              }}
              placeholder={placeholder}
              className="w-full px-3 py-2 bg-white border-2 border-[#2b1f14] text-xs font-mono text-[#1a120b] focus:outline-none focus:border-black placeholder:text-[#8c7355]/60 shadow-inner"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddCode(codeInput)}
            className={cn(
              "px-4 py-2 font-mono text-xs uppercase shrink-0 cursor-pointer shadow-sm transition-all active:scale-95 flex items-center justify-center",
              codeInput.trim().length > 0
                ? "bg-amber-600 hover:bg-amber-700 text-white font-black shadow-md ring-2 ring-amber-400/80 animate-pulse"
                : "bg-[#2b1f14] text-[#f6f1e5] font-bold hover:bg-[#140d08]"
            )}
          >
            Thêm
          </button>
        </div>
      </div>

      {/* 3. DANH SÁCH BẰNG CHỨNG ĐÃ CHỌN (BADGES CONTAINER) */}
      <div className="space-y-1.5">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase text-[#1a120b]">
            {label}:
          </span>
        </div>

        <div className="max-h-[140px] overflow-y-auto custom-scrollbar p-2 bg-[#ede4d0]/80 border-2 border-dashed border-[#8c7355]/70 rounded-sm flex flex-col gap-2 shadow-inner">
          {selectedClueIds.length === 0 ? (
            <p className="text-xs text-[#8c7355] italic self-center font-sans">
              {emptyStateText}
            </p>
          ) : (
            <>
              {/* DÒNG TÀI LIỆU / SỐ (XẾP TỪ THẤP ĐẾN CAO) */}
              {sortedClues.docClues.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {sortedClues.docClues.map(({ id, info }) => (
                    <div
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2b1f14] border border-[#140d08] text-[#f6f1e5] text-xs font-mono rounded-none shadow-xs select-none"
                    >
                      <span className="font-mono font-bold text-xs text-[#d9a066] px-0.5 tracking-wider">
                        {info.displayCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveClueId(id)}
                        title="Xóa khỏi danh sách"
                        className="p-0.5 text-[#fca5a5] hover:text-white hover:bg-red-900/50 cursor-pointer ml-0.5 transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* DÒNG RIÊNG DƯỚI CÙNG: TIN NHẮN / CUỘC GỌI VỚI SĐT */}
              {sortedClues.phoneClues.length > 0 && (
                <div
                  className={cn(
                    'flex flex-col gap-1.5',
                    sortedClues.docClues.length > 0 && 'pt-2 border-t border-[#8c7355]/30'
                  )}
                >
                  {sortedClues.phoneClues.map(({ id, info }) => (
                    <div
                      key={id}
                      className="inline-flex items-center justify-between gap-2 px-2.5 py-1.5 bg-[#2b1f14] border border-[#140d08] text-[#f6f1e5] text-xs font-sans rounded-none shadow-xs select-none"
                    >
                      <span className="font-mono text-xs text-[#f6f1e5] font-medium truncate" title={info.label}>
                        {info.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveClueId(id)}
                        title="Xóa khỏi danh sách"
                        className="p-0.5 text-[#fca5a5] hover:text-white hover:bg-red-900/50 cursor-pointer ml-0.5 shrink-0 transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
