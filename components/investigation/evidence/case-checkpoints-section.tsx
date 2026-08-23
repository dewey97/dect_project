'use client'

import React from 'react'
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import type { Checkpoint } from '@/lib/types'
import { cn } from '@/lib/utils'
import { HINTS_MAP } from './evidence-data'

interface CaseCheckpointsSectionProps {
  checkpoints: Checkpoint[]
  completedCheckpointIds: string[]
  selectedAnswers: Record<string, string>
  checkpointErrors: Record<string, boolean>
  checkpointSuccesses: Record<string, boolean>
  unlockedHintLevel: Record<string, number>
  onAnswerSelect: (cpId: string, option: string) => void
  onSubmitAnswer: (cp: Checkpoint) => void
  onUnlockNextHint: (cpId: string, maxHints: number) => void
}

export function CaseCheckpointsSection({
  checkpoints,
  completedCheckpointIds,
  selectedAnswers,
  checkpointErrors,
  checkpointSuccesses,
  unlockedHintLevel,
  onAnswerSelect,
  onSubmitAnswer,
  onUnlockNextHint,
}: CaseCheckpointsSectionProps) {
  const activeCpIndex = checkpoints.findIndex((cp) => !completedCheckpointIds.includes(cp.id))
  const isAllCompleted = checkpoints.length > 0 && activeCpIndex === -1
  const currentCp = activeCpIndex !== -1 ? checkpoints[activeCpIndex] : null
  const currentIdx = activeCpIndex !== -1 ? activeCpIndex : checkpoints.length - 1

  const resetProgress = () => {
    try {
      localStorage.removeItem('veritas_completed_checkpoints')
      window.location.reload()
    } catch {}
  }

  return (
    <section className="space-y-4 pt-4 border-t border-[#3d2c1e]">
      <div className="flex items-center justify-between border-b border-[#3d2c1e] pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#d9a066]" />
          <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#e6d3c1]">
            🛡️ KẾT LUẬN & PHÁ ÁN {!isAllCompleted && `(${currentIdx + 1}/${checkpoints.length})`}
          </h2>
        </div>

        <button
          type="button"
          onClick={resetProgress}
          className="text-[0.65rem] font-mono font-bold text-[#ad9885] hover:text-[#d9a066] transition-colors cursor-pointer"
        >
          [ 🔄 LÀM LẠI TỪ ĐẦU ]
        </button>
      </div>

      {isAllCompleted ? (
        <div className="p-5 bg-[#14100c] border border-[#3e2e20] rounded-none space-y-4 shadow-md">
          <p className="text-xs text-[#ad9885] font-serif leading-relaxed">
            Toàn bộ mâu thuẫn mốc giờ và tang chứng đã được bóc tách hoàn toàn. Bạn có thể xem lại ký sự hậu án hoặc tiến hành thực hiện lại chuyên án.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => {
                // Dispatch event or reload to open Epilogue Modal
                try {
                  window.dispatchEvent(new CustomEvent('open-epilogue-modal'))
                } catch {}
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-xs font-bold rounded-none transition-all cursor-pointer shadow-md"
            >
              📖 ĐỌC KÝ SỰ HẬU ÁN
            </button>

            <button
              onClick={resetProgress}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#261d15] hover:bg-[#382b1f] text-[#d9a066] border border-[#4a3a2c] font-mono text-xs font-bold rounded-none transition-all cursor-pointer"
            >
              🔄 PHÁ ÁN LẠI (RESET)
            </button>

            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#17130f] hover:bg-[#211b15] text-zinc-400 hover:text-zinc-200 border border-[#2e241a] font-mono text-xs font-bold rounded-none transition-all ml-auto"
            >
              🚪 THOÁT VỀ TRANG CHỦ
            </a>
          </div>
        </div>
      ) : currentCp ? (
        (() => {
          const cp = currentCp
          const idx = currentIdx
          const selectedOpt = selectedAnswers[cp.id]
          const hasError = checkpointErrors[cp.id]
          const hasSuccess = checkpointSuccesses[cp.id]

          const hints = HINTS_MAP[cp.id] || (cp.hint ? [cp.hint] : [])
          const hintLevel = unlockedHintLevel[cp.id] || 0

          return (
            <div
              key={cp.id}
              className="p-4 sm:p-5 bg-[#201812] border border-[#443324] rounded-none flex flex-col gap-3.5 shadow-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.65rem] text-[#d9a066] font-bold uppercase tracking-wider">
                  CÂU HỎI KẾT LUẬN GIAI ĐOẠN {idx} ({idx + 1}/{checkpoints.length})
                </span>
                <span className="font-mono text-[0.6rem] text-[#d9a066] bg-[#140e0a] px-2 py-0.5 rounded-none border border-[#38271a] font-bold uppercase">
                  ĐANG PHÁ ÁN
                </span>
              </div>

              {/* Question text */}
              <p className="text-xs sm:text-sm font-bold text-[#f2e6d8] leading-relaxed">
                {cp.question}
              </p>

              {/* Options & Submit */}
              <div className="space-y-2 pt-2 border-t border-[#36271c]">
                <span className="font-mono text-[0.625rem] text-[#ad9885] uppercase font-bold block mb-1.5">
                  Lựa chọn phương án kết luận:
                </span>

                <div className="flex flex-col gap-2">
                  {cp.options.map((opt) => {
                    const isSelected = selectedOpt === opt
                    return (
                      <button
                        key={opt}
                        disabled={hasSuccess}
                        onClick={() => onAnswerSelect(cp.id, opt)}
                        className={cn(
                          'w-full text-left p-2.5 rounded-none border text-xs font-sans transition-all flex justify-between items-center cursor-pointer',
                          isSelected
                            ? 'border-[#6b4b32] bg-[#342417] text-amber-200 font-semibold shadow-sm'
                            : 'border-[#3a2b1e] bg-[#18120c] hover:border-[#523d2b] text-[#d4c3b3]'
                        )}
                      >
                        <span>{opt}</span>
                        {isSelected && <ArrowRight className="size-3 text-[#d9a066]" />}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-[#36271c]">
                  {/* Left Fixed Hint Button */}
                  {hints.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => onUnlockNextHint(cp.id, hints.length)}
                      className="font-mono text-xs uppercase tracking-wider text-[#d9a066] bg-[#18120c] hover:bg-[#d9a066] hover:text-[#1a0f07] border border-[#3e2e20] px-3 py-2 rounded-none font-bold transition-all cursor-pointer shrink-0"
                    >
                      {hintLevel === 0 
                        ? `GỢI Ý (1/${hints.length})` 
                        : `GỢI Ý KẾ TIẾP (${hintLevel >= hints.length ? 1 : hintLevel + 1}/${hints.length})`}
                    </button>
                  ) : (
                    <span />
                  )}

                  {/* Right Fixed Submit Button */}
                  <button
                    disabled={!selectedOpt || hasSuccess}
                    onClick={() => onSubmitAnswer(cp)}
                    className={cn(
                      'font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-none font-bold transition-all cursor-pointer shrink-0 ml-auto border',
                      selectedOpt
                        ? 'bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] border-[#d9a066] shadow-md active:scale-95'
                        : 'bg-[#18120c] text-[#6b5847] border-[#2e2318] opacity-50 pointer-events-none'
                    )}
                  >
                    XÁC NHẬN KẾT LUẬN
                  </button>
                </div>

                {/* Error / Success Feedback */}
                {hasError && (
                  <p className="text-[0.65rem] font-mono text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="size-3.5" /> ĐÁP ÁN KHÔNG CHÍNH XÁC.
                  </p>
                )}
                {hasSuccess && (
                  <p className="text-[0.65rem] font-mono text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="size-3.5" /> CHÍNH XÁC! MỞ KHÓA TÀI LIỆU PHASE KẾ TIẾP...
                  </p>
                )}
              </div>

              {/* Opened Hint Display Container */}
              {hints.length > 0 && hintLevel > 0 && (
                <div className="p-3 rounded-none border bg-[#2d2015] border-[#5e432c] text-amber-200 transition-all text-xs space-y-1 shadow-inner">
                  <span className="font-mono text-[0.65rem] uppercase font-bold text-[#d9a066] block">
                    GỢI Ý TƯ DUY ({hintLevel}/{hints.length})
                  </span>
                  <p className="leading-relaxed font-sans">{hints[hintLevel - 1]}</p>
                </div>
              )}

            </div>
          )
        })()
      ) : null}
    </section>
  )
}
