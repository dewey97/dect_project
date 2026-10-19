'use client'

import React from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { ClueCodePicker, type PendingClueInputs } from '../clue-code-picker'
import { CheckpointHintSection } from '@/components/investigation/checkpoint-hint-section'

interface InterrogationClueStepProps {
  category: 'motive' | 'alibi' | 'contradiction'
  clueIds: string[]
  onAddClueId: (id: string) => void
  onRemoveClueId: (id: string) => void
  onPendingChange: (pending: PendingClueInputs) => void
  checkpointId?: string
  caseId?: string
  onBack: () => void
  onConfirm: () => void
}

const CATEGORY_CONFIG = {
  motive: {
    label: 'BẰNG CHỨNG ĐÃ NHẬP',
    placeholder: 'Nhập mã chứng cứ...',
    emptyStateText: 'Chưa có bằng chứng nào được nhập.',
  },
  alibi: {
    label: 'BẰNG CHỨNG NGOẠI PHẠM ĐÃ NHẬP',
    placeholder: 'Nhập mã chứng cứ...',
    emptyStateText: 'Chưa có bằng chứng ngoại phạm nào được nhập.',
  },
  contradiction: {
    label: 'BẰNG CHỨNG MÂU THUẪN ĐÃ NHẬP',
    placeholder: 'Nhập mã chứng cứ...',
    emptyStateText: 'Chưa có bằng chứng mâu thuẫn nào được nhập.',
  },
}

export function InterrogationClueStep({
  category,
  clueIds,
  onAddClueId,
  onRemoveClueId,
  onPendingChange,
  checkpointId,
  caseId,
  onBack,
  onConfirm,
}: InterrogationClueStepProps) {
  const cfg = CATEGORY_CONFIG[category]

  return (
    <div className="space-y-3 pt-1">
      <ClueCodePicker
        selectedClueIds={clueIds}
        customPhoneEvidences={[]}
        onAddClueId={onAddClueId}
        onRemoveClueId={onRemoveClueId}
        onAddCustomPhone={() => {}}
        onPendingChange={onPendingChange}
        label={cfg.label}
        placeholder={cfg.placeholder}
        emptyStateText={cfg.emptyStateText}
      />

      {Boolean(checkpointId) && (
        <CheckpointHintSection
          checkpointId={checkpointId!}
          caseId={caseId}
          category={category}
        />
      )}

      <div className="pt-3 border-t border-[#d4c5b0]/60 flex items-center justify-between gap-2 select-none">
        <button
          type="button"
          onClick={() => {
            detectiveAudio.playPaperRustle()
            onBack()
          }}
          className="h-10 px-3 sm:px-4 bg-[#f4ebd9] hover:bg-[#ede3cf] text-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 border-[#2b1f14] whitespace-nowrap shrink-0 shadow-xs active:scale-95"
        >
          <ArrowLeft className="size-3.5 text-[#4a3520] shrink-0" />
          <span>QUAY LẠI</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 px-4 sm:px-5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 border-[#2b1f14] shadow-sm active:scale-95 whitespace-nowrap shrink-0"
          >
            <Check className="size-3.5 text-[#d9a066] shrink-0" />
            <span>XÁC NHẬN</span>
          </button>
        </div>
      </div>
    </div>
  )
}
