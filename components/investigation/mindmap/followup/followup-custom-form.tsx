import React from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { CheckpointHintSection } from '@/components/investigation/checkpoint-hint-section'
import type { Checkpoint } from '@/lib/types/case'

interface FollowupCustomFormProps {
  caseId: string
  culprit: string | null
  customCheckpoint?: Checkpoint | null
  customSelectedOption: string | null
  onSelectCustomOption: (opt: string) => void
  customTextInput: string
  onCustomTextInputChange: (val: string) => void
  errorMsg: string
  onClearError: () => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function FollowupCustomForm({
  caseId,
  culprit,
  customCheckpoint,
  customSelectedOption,
  onSelectCustomOption,
  customTextInput,
  onCustomTextInputChange,
  errorMsg,
  onClearError,
  onSubmit,
  onClose,
}: FollowupCustomFormProps) {
  return (
    <form onSubmit={onSubmit} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5] paper-scrollbar">
      {errorMsg && (
        <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* TÚI HỒ SƠ */}
      <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
          📂 {customCheckpoint?.dossier || 'TÀI LIỆU ĐIỀU TRA MỞ RỘNG'}
        </span>
      </div>

      {/* QUESTION BOX */}
      <div className="p-4 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
        <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
          YÊU CẦU ĐIỀU TRA:
        </span>
        <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed whitespace-pre-line">
          {customCheckpoint?.question ||
            'Hồ sơ tình nghi của đối tượng đã được tiếp nhận. Hãy hoàn tất điều tra đối tượng này.'}
        </p>
      </div>

      {/* OPTIONS HOẶC TEXT INPUT */}
      {customCheckpoint?.options && customCheckpoint.options.length > 0 ? (
        <div className="space-y-3">
          <span className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
            LỰA CHỌN KẾT LUẬN CỦA ĐIỀU TRA VIÊN:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customCheckpoint.options.map((opt: string, idx: number) => {
              const isSelected = customSelectedOption === opt
              return (
                <button
                  key={`custom-opt-${idx}`}
                  type="button"
                  onClick={() => {
                    detectiveAudio.playTypewriterClick()
                    onSelectCustomOption(opt)
                    onClearError()
                  }}
                  className={cn(
                    'p-4 text-left border-2 transition-all cursor-pointer select-none rounded-none relative flex items-center justify-between',
                    isSelected
                      ? 'bg-[#e7f0dc] border-[#2e5220] shadow-sm text-[#193310]'
                      : 'bg-[#fdfcf9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22]'
                  )}
                >
                  <span className="font-mono text-xs sm:text-sm font-bold">
                    {opt}
                  </span>
                  {isSelected && (
                    <Check className="size-4 text-[#2e5220] stroke-[2.5]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          <label className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
            Nhập câu trả lời / mã số suy luận:
          </label>
          <input
            type="text"
            value={customTextInput}
            onChange={(e) => {
              onCustomTextInputChange(e.target.value)
              onClearError()
            }}
            placeholder="Nhập đáp án hoặc kết luận..."
            className="w-full p-3.5 bg-[#fdfcf9] border-2 border-[#2b1f14] text-[#1a120b] font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]"
          />
        </div>
      )}

      {/* GỢI Ý ĐIỀU TRA ĐẨY XUỐNG DƯỚI FORM */}
      <CheckpointHintSection
        checkpointId={customCheckpoint?.id || (culprit ? `cp-${culprit}-followup` : '')}
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
