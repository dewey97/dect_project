import React from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { CheckpointHintSection } from '@/components/investigation/checkpoint-hint-section'
import type { Checkpoint } from '@/lib/types/case'

export interface OptionItem {
  id: string
  label: string
}

interface FollowupChoiceFormProps {
  caseId: string
  checkpoint?: Checkpoint | null
  dossierLabel?: string
  questionText?: string
  options: Array<OptionItem | string>
  selectedOption: string | null
  onSelectOption: (id: string) => void
  errorMsg: string
  onClearError?: () => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function FollowupChoiceForm({
  caseId,
  checkpoint,
  dossierLabel,
  questionText,
  options,
  selectedOption,
  onSelectOption,
  errorMsg,
  onClearError,
  onSubmit,
  onClose,
}: FollowupChoiceFormProps) {
  const displayDossier = dossierLabel || checkpoint?.dossier || '📂 MỞ TÚI HỒ SƠ B04'
  const displayQuestion =
    questionText ||
    checkpoint?.question ||
    'Dựa vào những gì đang nắm giữ, bạn đưa ra nhận định thế nào về đối tượng này?'
  const targetCheckpointId = checkpoint?.id || 'cp-000-1b'

  // Chuẩn hóa options dạng { id, label }
  const normalizedOptions: OptionItem[] = options.map((opt, idx) => {
    if (typeof opt === 'string') {
      return { id: opt, label: opt }
    }
    return opt
  })

  return (
    <form onSubmit={onSubmit} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5] paper-scrollbar">
      {errorMsg && (
        <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* MỞ TÚI HỒ SƠ */}
      <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm">
        <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
          {displayDossier.startsWith('📂') ? displayDossier : `📂 ${displayDossier}`}
        </span>
      </div>

      {/* QUESTION BOX */}
      <div className="p-4 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
        <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
          CÂU HỎI ĐIỀU TRA:
        </span>
        <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed whitespace-pre-line">
          {displayQuestion}
        </p>
      </div>

      {/* OPTIONS LIST */}
      <div className="space-y-3">
        <span className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
          LỰA CHỌN KẾT LUẬN CỦA ĐIỀU TRA VIÊN:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {normalizedOptions.map((opt) => {
            const isSelected = selectedOption === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  detectiveAudio.playTypewriterClick()
                  onSelectOption(opt.id)
                  if (onClearError) onClearError()
                }}
                className={cn(
                  'p-4 text-left border-2 transition-all cursor-pointer select-none rounded-none relative flex items-center justify-between',
                  isSelected
                    ? 'bg-[#e7f0dc] border-[#2e5220] shadow-sm text-[#193310]'
                    : 'bg-[#fdfcf9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22]'
                )}
              >
                <span className="font-mono text-xs sm:text-sm font-bold">
                  {opt.label}
                </span>
                {isSelected && (
                  <Check className="size-4 text-[#2e5220] stroke-[2.5]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* GỢI Ý ĐIỀU TRA ĐẨY XUỐNG DƯỚI FORM */}
      <CheckpointHintSection
        checkpointId={targetCheckpointId}
        caseId={caseId}
      />

      {/* FOOTER */}
      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            detectiveAudio.playPaperRustle()
            onClose()
          }}
          className="px-4 py-2 bg-[#dfd3bd] hover:bg-[#d4c5ab] border-2 border-[#4a3520] text-[#2b1f14] text-xs font-mono font-bold rounded-none transition-colors cursor-pointer"
        >
          ĐÓNG
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider rounded-none transition-all flex items-center gap-2 border-2 border-[#2b1f14] shadow-md cursor-pointer active:scale-95"
        >
          <span>CẬP NHẬT KẾT LUẬN</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </form>
  )
}
