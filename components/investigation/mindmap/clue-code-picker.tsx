'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { resolveEvidenceCode, getSortedClues } from '@/lib/cases/case-000-clues'

interface ClueCodePickerProps {
  selectedClueIds: string[]
  customPhoneEvidences?: Array<{ id: string; label: string }>
  onAddClueId: (id: string) => void
  onRemoveClueId: (id: string) => void
  onAddCustomPhone?: (phoneEvidence: { id: string; label: string }) => void
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
  onAddCustomPhone,
  label = 'BẰNG CHỨNG ĐÃ CHỌN',
  placeholder = 'Nhập mã chứng cứ...',
  emptyStateText = 'Chưa có bằng chứng nào được chọn.',
  hidePhoneInputs = false,
}: ClueCodePickerProps) {
  const [codeInput, setCodeInput] = useState('')
  const [showTextPhoneInput, setShowTextPhoneInput] = useState(false)
  const [showVoicePhoneInput, setShowVoicePhoneInput] = useState(false)
  const [textPhoneInputValue, setTextPhoneInputValue] = useState('')
  const [voicePhoneInputValue, setVoicePhoneInputValue] = useState('')

  const handleAddCode = (codeStr: string) => {
    const resolved = resolveEvidenceCode(codeStr)
    if (!resolved) return
    detectiveAudio.playPaperRustle()
    setCodeInput('')
    onAddClueId(resolved.id)
  }

  const handleAddTextPhoneNumber = () => {
    const raw = textPhoneInputValue.trim()
    if (!raw) return
    const digits = raw.replace(/\D/g, '')
    if (digits.length < 3) return
    const id = `sms_phone_${digits}`
    const labelStr = `Tin nhắn văn bản với SĐT: ${raw}`
    if (onAddCustomPhone) {
      onAddCustomPhone({ id, label: labelStr })
    }
    detectiveAudio.playTypewriterClick()
    onAddClueId(id)
    setTextPhoneInputValue('')
    setShowTextPhoneInput(false)
  }

  const handleAddVoicePhoneNumber = () => {
    const raw = voicePhoneInputValue.trim()
    if (!raw) return
    const digits = raw.replace(/\D/g, '')
    if (digits.length < 3) return
    const id = `voice_phone_${digits}`
    const labelStr = `Tin nhắn thoại với SĐT: ${raw}`
    if (onAddCustomPhone) {
      onAddCustomPhone({ id, label: labelStr })
    }
    detectiveAudio.playTypewriterClick()
    onAddClueId(id)
    setVoicePhoneInputValue('')
    setShowVoicePhoneInput(false)
  }

  const sortedClues = getSortedClues(selectedClueIds, customPhoneEvidences)

  return (
    <div className="space-y-3">
      {/* 1. THANH NHẬP MÃ SỐ TÀI LIỆU CHỨNG CỨ */}
      <div className="space-y-1">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
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
            className="px-4 py-2 bg-[#2b1f14] text-[#f6f1e5] font-mono text-xs font-bold uppercase hover:bg-[#140d08] active:scale-95 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Thêm
          </button>
        </div>
      </div>

      {/* 2. KHU VỰC NHẬP SĐT LIÊN QUAN CHUYÊN DỤNG (CHỈ HIỂN THỊ KHI CẦN) */}
      {!hidePhoneInputs && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* CARD 1: TIN NHẮN VĂN BẢN VỚI SĐT */}
          <div
            className={cn(
              'p-2.5 border-2 transition-all flex flex-col justify-start gap-1.5 select-none',
              showTextPhoneInput
                ? 'bg-[#eae0cd] border-[#2b1f14] shadow-xs'
                : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520]'
            )}
          >
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playPaperRustle()
                setShowTextPhoneInput((prev) => {
                  if (prev) setTextPhoneInputValue('')
                  return !prev
                })
              }}
              className="w-full flex items-center justify-between gap-2 text-left cursor-pointer focus:outline-none"
            >
              <span className="text-xs font-mono font-bold text-[#1a120b] flex items-center gap-1.5">
                📱 Tin nhắn văn bản với SĐT
              </span>
              <span
                className={cn(
                  'text-[11px] font-mono font-bold',
                  showTextPhoneInput ? 'text-[#8b3a3a] hover:text-[#a81c1c]' : 'text-[#6b4e2e]'
                )}
              >
                {showTextPhoneInput ? 'Hủy' : '+ Nhập SĐT'}
              </span>
            </button>

            {showTextPhoneInput && (
              <div className="flex gap-1.5 items-center pt-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="tel"
                  value={textPhoneInputValue}
                  onChange={(e) => setTextPhoneInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTextPhoneNumber()
                    } else if (e.key === 'Escape') {
                      setShowTextPhoneInput(false)
                      setTextPhoneInputValue('')
                    }
                  }}
                  placeholder="Nhập SĐT..."
                  className="flex-1 min-w-0 px-2 py-1 bg-white border border-[#2b1f14] text-xs font-mono text-[#1a120b] focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddTextPhoneNumber}
                  className="px-3 py-1 bg-[#2b1f14] text-[#f6f1e5] font-mono text-xs font-bold uppercase cursor-pointer hover:bg-[#140d08] shrink-0 active:scale-95"
                >
                  Thêm
                </button>
              </div>
            )}
          </div>

          {/* CARD 2: TIN NHẮN THOẠI VỚI SĐT */}
          <div
            className={cn(
              'p-2.5 border-2 transition-all flex flex-col justify-start gap-1.5 select-none',
              showVoicePhoneInput
                ? 'bg-[#eae0cd] border-[#2b1f14] shadow-xs'
                : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520]'
            )}
          >
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playPaperRustle()
                setShowVoicePhoneInput((prev) => {
                  if (prev) setVoicePhoneInputValue('')
                  return !prev
                })
              }}
              className="w-full flex items-center justify-between gap-2 text-left cursor-pointer focus:outline-none"
            >
              <span className="text-xs font-mono font-bold text-[#1a120b] flex items-center gap-1.5">
                🎙️ Tin nhắn thoại với SĐT
              </span>
              <span
                className={cn(
                  'text-[11px] font-mono font-bold',
                  showVoicePhoneInput ? 'text-[#8b3a3a] hover:text-[#a81c1c]' : 'text-[#6b4e2e]'
                )}
              >
                {showVoicePhoneInput ? 'Hủy' : '+ Nhập SĐT'}
              </span>
            </button>

            {showVoicePhoneInput && (
              <div className="flex gap-1.5 items-center pt-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="tel"
                  value={voicePhoneInputValue}
                  onChange={(e) => setVoicePhoneInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddVoicePhoneNumber()
                    } else if (e.key === 'Escape') {
                      setShowVoicePhoneInput(false)
                      setVoicePhoneInputValue('')
                    }
                  }}
                  placeholder="Nhập SĐT..."
                  className="flex-1 min-w-0 px-2 py-1 bg-white border border-[#2b1f14] text-xs font-mono text-[#1a120b] focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddVoicePhoneNumber}
                  className="px-3 py-1 bg-[#2b1f14] text-[#f6f1e5] font-mono text-xs font-bold uppercase cursor-pointer hover:bg-[#140d08] shrink-0 active:scale-95"
                >
                  Thêm
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. DANH SÁCH BẰNG CHỨNG ĐÃ CHỌN (BADGES CONTAINER) */}
      <div className="space-y-1.5">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase text-[#1a120b]">
            {label} ({selectedClueIds.length}):
          </span>
        </div>

        <div className="min-h-[58px] max-h-[140px] overflow-y-auto custom-scrollbar p-2 bg-white border-2 border-[#2b1f14] flex flex-col gap-2">
          {selectedClueIds.length === 0 ? (
            <p className="text-xs text-[#8c7355] italic self-center m-auto font-sans">
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
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f4ebd9] border border-[#2b1f14] text-[#1a120b] text-xs font-mono shadow-xs select-none"
                    >
                      <span className="font-mono font-bold text-xs text-[#1a120b] px-0.5">
                        {info.displayCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveClueId(id)}
                        title="Xóa khỏi danh sách"
                        className="p-0.5 text-[#8b3a3a] hover:text-[#a81c1c] hover:bg-[#a81c1c]/10 cursor-pointer ml-0.5"
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
                    sortedClues.docClues.length > 0 && 'pt-1.5 border-t border-[#d4c5b0]/60'
                  )}
                >
                  {sortedClues.phoneClues.map(({ id, info }) => (
                    <div
                      key={id}
                      className="inline-flex items-center justify-between gap-2 px-2.5 py-1 bg-[#f4ebd9] border border-[#2b1f14] text-[#1a120b] text-xs font-sans shadow-xs select-none"
                    >
                      <span className="font-sans text-xs text-[#2b1f14] font-medium truncate" title={info.label}>
                        {info.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveClueId(id)}
                        title="Xóa khỏi danh sách"
                        className="p-0.5 text-[#8b3a3a] hover:text-[#a81c1c] hover:bg-[#a81c1c]/10 cursor-pointer ml-0.5 shrink-0"
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
