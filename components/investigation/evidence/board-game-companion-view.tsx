'use client'

import React from 'react'
import { MainInvestigationCanvas } from '@/components/investigation/mindmap/main-investigation-canvas'

interface BoardGameCompanionViewProps {
  checkpoints?: any[]
  completedCheckpointIds?: string[]
  selectedAnswers?: Record<string, string>
  checkpointErrors?: Record<string, boolean>
  checkpointSuccesses?: Record<string, boolean>
  unlockedHintLevel?: Record<string, number>
  onAnswerSelect?: (cpId: string, option: string) => void
  onSubmitAnswer?: (cp: any) => void
  onUnlockNextHint?: (cpId: string, maxHints: number) => void
  onOpenEpilogue?: () => void
  onSwitchToWebMode?: () => void
  onProceedNextPhase?: (cpId: string) => void
  onOpenPhoneSimulator?: () => void
  onOpenReinvestigation?: () => void
}

export function BoardGameCompanionView({
  onOpenPhoneSimulator,
  onOpenReinvestigation,
  onOpenEpilogue
}: BoardGameCompanionViewProps) {
  return (
    <div className="w-full max-w-none sm:max-w-6xl mx-auto h-full flex flex-col relative z-10 overflow-hidden p-0 pb-0 sm:pb-4">
      <MainInvestigationCanvas
        onOpenPhoneSimulator={onOpenPhoneSimulator}
        onOpenReinvestigation={onOpenReinvestigation}
        onOpenEpilogue={onOpenEpilogue}
      />
    </div>
  )
}


