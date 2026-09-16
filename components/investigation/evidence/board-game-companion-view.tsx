'use client'

import React from 'react'
import { Box } from 'lucide-react'
import { Checkpoint } from '@/lib/types'
import { CaseCheckpointsSection } from './case-checkpoints-section'

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
  onSwitchToWebMode?: () => void
  onProceedNextPhase?: (cpId: string) => void
}

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
  onSwitchToWebMode,
  onProceedNextPhase
}: BoardGameCompanionViewProps) {
  const activeCpIndex = checkpoints.findIndex((cp) => !completedCheckpointIds.includes(cp.id))
  const isAllCompleted = checkpoints.length > 0 && activeCpIndex === -1

  return (
    <div className="w-full max-w-3xl mx-auto h-full flex flex-col space-y-4 relative z-10 overflow-y-auto custom-scrollbar pr-1 pb-12">
      {/* CHECKPOINTS SECTION (DYNAMIC FORM & VERIFICATION) */}
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
        onProceedNextPhase={onProceedNextPhase}
      />
    </div>
  )
}
