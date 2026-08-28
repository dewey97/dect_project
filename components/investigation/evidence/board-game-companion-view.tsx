'use client'

import React from 'react'
import {
  Box,
  CheckCircle2,
  Lock,
  Radio,
  ChevronRight,
  ShieldAlert,
  Flame,
  Globe
} from 'lucide-react'
import { Checkpoint } from '@/lib/types'
import { CaseCheckpointsSection } from './case-checkpoints-section'
import { cn } from '@/lib/utils'

interface BoardGameCompanionViewProps {
  checkpoints: Checkpoint[]
  completedCheckpointIds: string[]
  selectedAnswers: Record<string, string>
  checkpointErrors: Record<string, boolean>
  checkpointSuccesses: Record<string, boolean>
  unlockedHintLevel: Record<string, number>
  onAnswerSelect: (cpId: string, option: string) => void
  onSubmitAnswer: (cp: Checkpoint) => void
  onUnlockNextHint: (cpId: string, maxHints: number) => void
  onOpenEpilogue: () => void
  onSwitchToWebMode: () => void
}

const PHASE_TITLES = [
  'Màn sương hiện trường',
  'Tranh chấp di chúc',
  'Bẫy quá khứ 1998',
  'Phán quyết kết án'
]

export function BoardGameCompanionView({
  checkpoints,
  completedCheckpointIds,
  selectedAnswers,
  checkpointErrors,
  checkpointSuccesses,
  unlockedHintLevel,
  onAnswerSelect,
  onSubmitAnswer,
  onUnlockNextHint,
  onOpenEpilogue,
  onSwitchToWebMode
}: BoardGameCompanionViewProps) {
  const activeCpIndex = checkpoints.findIndex((cp) => !completedCheckpointIds.includes(cp.id))
  const currentPhase = activeCpIndex !== -1 ? activeCpIndex : 3
  const isAllCompleted = checkpoints.length > 0 && activeCpIndex === -1

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col space-y-6 pb-28 relative z-10">
      {/* COMPANION FIELD TERMINAL HEADER — DOUBLE-BEZEL ARCHITECTURE */}
      <div className="rounded-2xl p-1.5 bg-[#23180f]/70 border border-[#523b2b]/80 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <div className="rounded-xl bg-[#150e09] border border-[#3b2a1c] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#24170e] border border-[#543b27] text-[#d9a066] rounded-xl shadow-inner shrink-0 flex items-center justify-center">
              <Box className="size-5 text-[#d9a066]" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[0.625rem] font-mono text-[#ad9885] tracking-widest uppercase font-semibold">
                  HỒ SƠ ĐIỀU TRA // VỤ ÁN #000
                </span>
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-[#fef5ec] font-mono uppercase tracking-wider">
                TRỐN TÌM
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onSwitchToWebMode}
            className="self-start sm:self-center px-4 py-2.5 bg-[#24160d] hover:bg-[#382315] border border-[#6b4e34] hover:border-[#a17249] rounded-xl text-xs font-mono font-bold text-[#d9a066] hover:text-amber-200 transition-all cursor-pointer flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] shrink-0"
            title="Chuyển sang chế độ xem tài liệu trực tiếp trên web"
          >
            <Globe className="size-3.5 text-[#d9a066]" />
            <span>CHUYỂN SANG BẢN WEB</span>
          </button>
        </div>
      </div>

      {/* PHASE PROGRESS TIMELINE — TACTICAL MILESTONE RIBBON */}
      <div className="rounded-2xl p-1.5 bg-[#20150d]/60 border border-[#442f1f]/80 shadow-xl backdrop-blur-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[0, 1, 2, 3].map((phase) => {
            const isDone = completedCheckpointIds.includes(`cp-000-${phase}`)
            const isCurrent = currentPhase === phase && !isAllCompleted
            const isLocked = !isDone && !isCurrent

            return (
              <div
                key={phase}
                className={cn(
                  'p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 relative overflow-hidden',
                  isDone
                    ? 'bg-[#152317]/80 border-emerald-700/60 text-emerald-300 shadow-sm'
                    : isCurrent
                    ? 'bg-[#2e1d10] border-[#d9a066] text-amber-200 shadow-[0_0_20px_rgba(217,160,102,0.25)] ring-1 ring-[#d9a066]/50'
                    : 'bg-[#130d08]/90 border-[#302114] text-[#735e4d]'
                )}
              >
                <div className="flex items-center justify-between text-[0.625rem] font-mono font-bold tracking-wider">
                  <span className="uppercase">GIAI ĐOẠN {phase}</span>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                    </span>
                  ) : isCurrent ? (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                      <span className="size-2 rounded-full bg-amber-400" />
                    </span>
                  ) : (
                    <Lock className="size-3 text-[#544132]" />
                  )}
                </div>

                <span className="text-xs font-sans font-semibold truncate text-[#e6d8cb]">
                  {PHASE_TITLES[phase]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* CHECKPOINTS SECTION (INLINE QUESTIONS & VERIFICATION) */}
      <CaseCheckpointsSection
        checkpoints={checkpoints}
        completedCheckpointIds={completedCheckpointIds}
        selectedAnswers={selectedAnswers}
        checkpointErrors={checkpointErrors}
        checkpointSuccesses={checkpointSuccesses}
        unlockedHintLevel={unlockedHintLevel}
        onAnswerSelect={onAnswerSelect}
        onSubmitAnswer={onSubmitAnswer}
        onUnlockNextHint={onUnlockNextHint}
      />
    </div>
  )
}
