'use client'

import React from 'react'
import { MainInvestigationCanvas } from '@/components/investigation/mindmap/main-investigation-canvas'

interface BoardGameCompanionViewProps {
  onOpenPhoneSimulator?: () => void
  onOpenReinvestigation?: () => void
  onOpenEpilogue?: () => void
}

export function BoardGameCompanionView({
  onOpenPhoneSimulator,
  onOpenReinvestigation,
  onOpenEpilogue
}: BoardGameCompanionViewProps) {
  return (
    <div className="w-full max-w-none sm:max-w-6xl mx-auto h-full flex-1 min-h-0 flex flex-col relative z-10 overflow-hidden p-0 pb-0 sm:pb-2">
      <MainInvestigationCanvas
        onOpenPhoneSimulator={onOpenPhoneSimulator}
        onOpenReinvestigation={onOpenReinvestigation}
        onOpenEpilogue={onOpenEpilogue}
      />
    </div>
  )
}


