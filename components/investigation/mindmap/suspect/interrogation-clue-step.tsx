'use client'

import React from 'react'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { ClueCodePicker, type PendingClueInputs } from '../clue-code-picker'
import { CheckpointHintSection } from '@/components/investigation/checkpoint-hint-section'

interface InterrogationClueStepProps {
  category: 'motive' | 'alibi' | 'contradiction'
  clueIds: string[]
  reason?: string
  onReasonChange?: (val: string) => void
  onAddClueId: (id: string) => void
  onRemoveClueId: (id: string) => void
  onPendingChange: (pending: PendingClueInputs) => void
  checkpointId?: string
  caseId?: string
  onBack: () => void
  onConfirm: () => void
  isLoading?: boolean
}

const CATEGORY_CONFIG = {
  motive: {
    reasonLabel: 'LÝ DO & CĂN CỨ VỀ ĐỘNG CƠ GÂY ÁN',
    reasonPlaceholder: 'Nhập phân tích lý do đối tượng có động cơ gây án (tùy chọn)...',
    clueLabel: 'TÀI LIỆU / MANH MỐI MINH CHỨNG CHO ĐỘNG CƠ',
    cluePlaceholder: 'Nhập mã chứng cứ minh chứng...',
    emptyStateText: 'Chưa có bằng chứng nào được nhập.',
  },
  alibi: {
    reasonLabel: 'LÝ DO & CĂN CỨ XÁC MINH NGOẠI PHẠM',
    reasonPlaceholder: 'Nhập phân tích mốc thời gian hoặc tình tiết ngoại phạm (tùy chọn)...',
    clueLabel: 'TÀI LIỆU / MANH MỐI MINH CHỨNG CHO NGOẠI PHẠM',
    cluePlaceholder: 'Nhập mã chứng cứ minh chứng...',
    emptyStateText: 'Chưa có bằng chứng ngoại phạm nào được nhập.',
  },
  contradiction: {
    reasonLabel: 'LÝ DO & CĂN CỨ VỀ MÂU THUẪN LỜI KHAI',
    reasonPlaceholder: 'Nhập phân tích điểm mâu thuẫn trong lời khai (tùy chọn)...',
    clueLabel: 'TÀI LIỆU / MANH MỐI MINH CHỨNG CHO MÂU THUẪN',
    cluePlaceholder: 'Nhập mã chứng cứ minh chứng...',
    emptyStateText: 'Chưa có bằng chứng mâu thuẫn nào được nhập.',
  },
}

export function InterrogationClueStep({
  category,
  clueIds,
  reason = '',
  onReasonChange,
  onAddClueId,
  onRemoveClueId,
  onPendingChange,
  checkpointId,
  caseId,
  onBack,
  onConfirm,
  isLoading = false,
}: InterrogationClueStepProps) {
  const cfg = CATEGORY_CONFIG[category]

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Ô LÝ DO & LẬP LUẬN (TÙY CHỌN, KHÔNG BỌC BOX NGOÀI) */}
      {onReasonChange && (
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
            {cfg.reasonLabel}:
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => onReasonChange?.(e.target.value)}
            placeholder={cfg.reasonPlaceholder}
            disabled={isLoading}
            className="w-full bg-[#fdfbf7] border-2 border-[#5c4026]/40 p-2.5 text-xs text-[#1a120b] font-sans leading-relaxed focus:outline-none focus:border-[#2b1f14] placeholder:text-[#8c7355]/60 placeholder:text-xs disabled:opacity-50"
          />
        </div>
      )}

      {/* 2. Ô CHỌN MÃ CHỨNG CỨ PHÍA DƯỚI */}
      <div className="space-y-1.5">
        <ClueCodePicker
          selectedClueIds={clueIds}
          customPhoneEvidences={[]}
          onAddClueId={onAddClueId}
          onRemoveClueId={onRemoveClueId}
          onAddCustomPhone={() => {}}
          onPendingChange={onPendingChange}
          label={cfg.clueLabel}
          placeholder={cfg.cluePlaceholder}
          emptyStateText={cfg.emptyStateText}
        />
      </div>

      {Boolean(checkpointId) && (
        <CheckpointHintSection
          checkpointId={checkpointId!}
          caseId={caseId}
          category={category}
        />
      )}

      {/* FOOTER ACTIONS */}
      <div className="pt-3 border-t border-[#d4c5b0]/60 flex items-center justify-between gap-2 select-none">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            detectiveAudio.playPaperRustle()
            onBack()
          }}
          className="h-10 px-3 sm:px-4 bg-[#f4ebd9] hover:bg-[#ede3cf] text-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 border-[#2b1f14] whitespace-nowrap shrink-0 shadow-xs active:scale-95 disabled:opacity-50"
        >
          <ArrowLeft className="size-3.5 text-[#4a3520] shrink-0" />
          <span>QUAY LẠI</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="h-10 px-4 sm:px-5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 border-[#2b1f14] shadow-sm active:scale-95 whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 text-[#d9a066] animate-spin shrink-0" />
                <span>ĐANG THẨM ĐỊNH...</span>
              </>
            ) : (
              <>
                <Check className="size-3.5 text-[#d9a066] shrink-0" />
                <span>XÁC NHẬN</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
