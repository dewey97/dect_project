'use client'

import { useState, useEffect } from 'react'
import { ScreenHeader } from '@/components/investigation/screen-header'
import { getActiveCase } from '@/lib/mock-data'
import { getCheckpoints } from '@/lib/content-service'
import { useCheckpoints } from '@/components/investigation/checkpoints-context'
import type { Case, Checkpoint } from '@/lib/types'
import { FolderSearch, Lock, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CheckpointsPage() {
  const [activeCase, setActiveCase] = useState<Case | null>(null)
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const { completedCheckpointIds, completeCheckpoint } = useCheckpoints()
  
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [successes, setSuccesses] = useState<Record<string, boolean>>({})
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function loadData() {
      const currentCase = await getActiveCase()
      if (currentCase) {
        setActiveCase(currentCase)
        // Convert case-01 to case-001 mapping for content-service
        const queryId = currentCase.id === 'case-01' ? 'case-001' : currentCase.id
        const list = await getCheckpoints(queryId)
        setCheckpoints(list)
      }
    }
    loadData()
  }, [completedCheckpointIds])

  // Get active status dynamically based on completed checkpoints
  const getCheckpointStatus = (cp: Checkpoint, index: number) => {
    if (completedCheckpointIds.includes(cp.id)) {
      return 'completed'
    }
    // If it is the first one, or the previous one is completed, it is active
    if (index === 0) {
      return 'active'
    }
    const prevCp = checkpoints[index - 1]
    if (prevCp && completedCheckpointIds.includes(prevCp.id)) {
      return 'active'
    }
    return 'locked'
  }

  const handleAnswerSelect = (cpId: string, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [cpId]: option }))
    setErrors((prev) => ({ ...prev, [cpId]: false }))
  }

  const handleSubmitAnswer = (cp: Checkpoint) => {
    const userAnswer = selectedAnswers[cp.id]
    if (!userAnswer) return

    if (userAnswer === cp.correctAnswer) {
      setSuccesses((prev) => ({ ...prev, [cp.id]: true }))
      setTimeout(() => {
        completeCheckpoint(cp.id)
      }, 1000)
    } else {
      setErrors((prev) => ({ ...prev, [cp.id]: true }))
      // Shake effect timeout
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, [cp.id]: false }))
      }, 500)
    }
  }

  return (
    <div className="pb-6 px-4">
      <ScreenHeader
        eyebrow="Mục tiêu điều tra"
        title="Checkpoints"
        description="Giải quyết các câu hỏi chặng bằng chứng để mở khóa các phân vùng tiếp theo của vụ án."
      />

      <div className="mt-6 flex flex-col gap-4">
        {checkpoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl bg-card/10">
            <FolderSearch className="size-10 text-muted-foreground/60 mb-3" />
            <span className="font-mono text-xs text-muted-foreground uppercase">Không có mục tiêu chặng</span>
          </div>
        ) : (
          checkpoints.map((cp, idx) => {
            const status = getCheckpointStatus(cp, idx)
            const isLocked = status === 'locked'
            const isActive = status === 'active'
            const isCompleted = status === 'completed'
            
            const selectedOpt = selectedAnswers[cp.id]
            const hasError = errors[cp.id]
            const hasSuccess = successes[cp.id]

            return (
              <div
                key={cp.id}
                className={cn(
                  'relative rounded-lg border bg-card p-5 transition-all duration-300 flex flex-col gap-3',
                  isActive && 'border-primary/50 shadow-[inset_0_0_15px_rgba(199,145,55,0.04)]',
                  isCompleted && 'border-emerald-500/20 bg-emerald-500/5 opacity-85',
                  isLocked && 'border-border/40 opacity-40 select-none pointer-events-none'
                )}
              >


                {/* Content */}
                {isLocked ? (
                  <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
                    <Lock className="size-5" />
                    <span className="font-mono text-xs uppercase tracking-wider">Hoàn thành mục tiêu trước để mở khóa</span>
                  </div>
                ) : (
                  <div className={cn("flex flex-col gap-4", hasError && "animate-shake")}>
                    <p className="text-foreground text-sm font-semibold leading-relaxed">
                      {cp.question}
                    </p>

                    {/* Hint section */}
                    {isActive && cp.hint && (
                      <div className="flex flex-col gap-2 mt-1">
                        {!expandedHints[cp.id] ? (
                          <button
                            onClick={() => setExpandedHints(prev => ({ ...prev, [cp.id]: true }))}
                            className="flex items-center gap-1.5 text-[0.65rem] font-mono font-bold text-primary/70 hover:text-primary transition-colors cursor-pointer w-fit"
                          >
                            <Lightbulb className="size-3.5" /> Xem gợi ý
                          </button>
                        ) : (
                          <div className="flex gap-2 items-start bg-primary/5 border border-primary/10 rounded-md p-3 text-[0.7rem] text-muted-foreground animate-fade-in">
                            <Lightbulb className="size-4 text-primary shrink-0 mt-0.5" />
                            <div>
                              <span className="font-mono font-bold text-primary mr-1">GỢI Ý:</span>
                              {cp.hint}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Options list */}
                    <div className="flex flex-col gap-2 mt-2">
                      {cp.options.map((opt) => {
                        const isSelected = selectedOpt === opt
                        return (
                          <button
                            key={opt}
                            disabled={isCompleted || hasSuccess}
                            onClick={() => handleAnswerSelect(cp.id, opt)}
                            className={cn(
                              'w-full text-left p-3 rounded border text-xs font-sans transition-all flex justify-between items-center',
                              isSelected
                                ? 'border-primary/60 bg-primary/10 text-foreground font-semibold'
                                : 'border-border/60 hover:border-border hover:bg-accent/30 text-muted-foreground',
                              isCompleted && isSelected && 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            )}
                          >
                            <span>{opt}</span>
                            {isSelected && <ArrowRight className="size-3 text-primary" />}
                          </button>
                        )
                      })}
                    </div>

                    {/* Submit action */}
                    {isActive && (
                      <div className="mt-2 flex items-center justify-between gap-4">
                        {hasError && (
                          <span className="text-[0.65rem] font-mono text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3.5" /> ĐÁP ÁN KHÔNG CHÍNH XÁC. VUI LÒNG THỬ LẠI.
                          </span>
                        )}
                        {hasSuccess && (
                          <span className="text-[0.65rem] font-mono text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="size-3.5" /> CHÍNH XÁC! ĐANG CẬP NHẬT TRẠNG THÁI...
                          </span>
                        )}
                        {!hasError && !hasSuccess && <span />}

                        <button
                          disabled={!selectedOpt || hasSuccess}
                          onClick={() => handleSubmitAnswer(cp)}
                          className={cn(
                            'font-mono text-xs uppercase tracking-wider px-4 py-2 rounded font-bold border transition-all cursor-pointer',
                            selectedOpt
                              ? 'border-primary bg-primary text-background shadow-[0_0_10px_var(--primary)] active:scale-98'
                              : 'border-border text-muted-foreground opacity-50 pointer-events-none'
                          )}
                        >
                          Xác nhận đáp án
                        </button>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-1 flex items-center gap-1.5 text-[0.65rem] font-mono text-emerald-500">
                        <CheckCircle2 className="size-3.5" />
                        <span>Đã mở khóa: {cp.unlockedEvidenceId === 'conclusion' ? 'Báo cáo kết án' : `Mã tang vật ${cp.unlockedEvidenceId?.toUpperCase()}`}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
