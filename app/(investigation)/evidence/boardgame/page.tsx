'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCheckpoints } from '@/components/investigation/checkpoints-context'
import { checkpoints000 } from '@/content/cases/case-000/checkpoints'
import { detectiveAudio } from '@/lib/investigation-audio'
import { CASE_000_PDFS, CASE_000_EVIDENCE } from '@/components/investigation/evidence/evidence-data'
import { BoardGameCompanionView } from '@/components/investigation/evidence/board-game-companion-view'
import { PhaseUnlockedModal, UnlockedModalData } from '@/components/investigation/evidence/phase-unlocked-modal'
import { EpilogueModal } from '@/components/investigation/epilogue-modal'
import { JumpscareEndgame } from '@/components/investigation/jumpscare-endgame'
import { QuickActionFab } from '@/components/investigation/evidence/quick-action-fab'
import { PhoneModal } from '@/components/investigation/evidence/phone-modal'
import { ReinvestigationModal } from '@/components/investigation/evidence/reinvestigation-modal'

export default function BoardGameCompanionPage() {
  const router = useRouter()
  const { completedCheckpointIds, completeCheckpoint } = useCheckpoints()

  // Phone and Reinvestigation modals
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [isReinvestigateModalOpen, setIsReinvestigateModalOpen] = useState(false)
  const [isEpilogueOpen, setIsEpilogueOpen] = useState(false)
  const [isJumpscareActive, setIsJumpscareActive] = useState(false)

  // Checkpoint questions state
  const [checkpoints, setCheckpoints] = useState(checkpoints000)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [checkpointErrors, setCheckpointErrors] = useState<Record<string, boolean>>({})
  const [checkpointSuccesses, setCheckpointSuccesses] = useState<Record<string, boolean>>({})

  // Hint system state
  const [unlockedHintLevel, setUnlockedHintLevel] = useState<Record<string, number>>({})

  // Phase Unlocked Modal state
  const [unlockedModalData, setUnlockedModalData] = useState<UnlockedModalData | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem('veritas_play_experience', 'boardgame')
    } catch {}

    const handleOpenEpilogue = () => setIsEpilogueOpen(true)
    const handleOpenPhone = () => setIsPhoneModalOpen(true)

    window.addEventListener('open-epilogue-modal', handleOpenEpilogue)
    window.addEventListener('open-phone-modal', handleOpenPhone)

    const handleFirstUserInteraction = () => {
      detectiveAudio.startRainSound()
      window.removeEventListener('click', handleFirstUserInteraction)
    }
    window.addEventListener('click', handleFirstUserInteraction)

    return () => {
      window.removeEventListener('open-epilogue-modal', handleOpenEpilogue)
      window.removeEventListener('open-phone-modal', handleOpenPhone)
      window.removeEventListener('click', handleFirstUserInteraction)
      detectiveAudio.stopRainSound()
    }
  }, [completedCheckpointIds.length])

  const handleAnswerSelect = (cpId: string, option: string) => {
    detectiveAudio.playTypewriterClick()
    setSelectedAnswers((prev) => ({ ...prev, [cpId]: option }))
    setCheckpointErrors((prev) => ({ ...prev, [cpId]: false }))
  }

  const handleSubmitAnswer = (cp: (typeof checkpoints000)[0]) => {
    const userAnswer = selectedAnswers[cp.id]
    if (!userAnswer) return

    if (userAnswer === 'VALID_ANSWER' || (cp.correctAnswer && userAnswer === cp.correctAnswer)) {
      detectiveAudio.playStampSound()
      detectiveAudio.playUnlockJingle()
      setCheckpointSuccesses((prev) => ({ ...prev, [cp.id]: true }))
      setCheckpointErrors((prev) => ({ ...prev, [cp.id]: false }))
    } else {
      detectiveAudio.playGlassSound()
      setCheckpointErrors((prev) => ({ ...prev, [cp.id]: true }))
    }
  }

  const unlockNextHint = (cpId: string, maxHints: number) => {
    if (maxHints <= 0) return
    detectiveAudio.playTypewriterClick()
    setUnlockedHintLevel((prev) => {
      const current = prev[cpId] || 0
      const next = current >= maxHints ? 1 : current + 1
      return {
        ...prev,
        [cpId]: next
      }
    })
  }

  const handleProceedNextPhase = (cpId: string) => {
    const nextPhase = cpId === 'cp-000-0' ? 1 : cpId === 'cp-000-convergence' ? 2 : cpId === 'cp-000-2a' ? 3 : null

    completeCheckpoint(cpId)
    if (nextPhase !== null) {
      detectiveAudio.playHeartbeat()
      const newPdfs = CASE_000_PDFS.filter((d) => d.phase === nextPhase)
      const newEvidence = CASE_000_EVIDENCE.filter((e) => e.phase === nextPhase)
      setUnlockedModalData({
        unlockedPhase: nextPhase,
        newPdfs,
        newEvidence
      })
    } else if (cpId === 'cp-000-2b' || cpId === 'cp-000-3') {
      setIsJumpscareActive(true)
    }
  }

  const handleSwitchToWebMode = () => {
    try {
      localStorage.setItem('veritas_play_experience', 'web')
    } catch {}
    router.push('/evidence/web')
  }

  const resetFindingsProgress = () => {
    try {
      localStorage.removeItem('veritas_discovered_findings')
      localStorage.removeItem('veritas_completed_checkpoints')
      localStorage.removeItem('veritas_canvas_suspects')
      localStorage.removeItem('veritas_investigated_suspects')
      localStorage.removeItem('veritas_solved_followups')
      localStorage.removeItem('veritas_followup_vu')
      localStorage.removeItem('veritas_followup_tung')
      localStorage.removeItem('veritas_followup_ha')
      localStorage.removeItem('veritas_followup_ha_matches')
      localStorage.removeItem('veritas_followup_tung_choice')
      localStorage.removeItem('veritas_followup_vu_choice')
      localStorage.removeItem('veritas_followup_ha_choice')
      localStorage.removeItem('veritas_reinvestigate_unlocked')
      localStorage.removeItem('veritas_reinvestigate_opened')
      localStorage.removeItem('veritas_indictment_solved')
      localStorage.removeItem('veritas_indictment_culprit')
      localStorage.removeItem('veritas_phone_inputs')
      localStorage.removeItem('veritas_phone_solved')
      localStorage.removeItem('khang_phone_pinned_clues')
      localStorage.removeItem('veritas_custom_notes')
      window.location.reload()
    } catch {}
  }

  return (
    <div suppressHydrationWarning className="h-full w-full bg-[#0b0704] text-[#e5d8cb] font-sans selection:bg-[#d9a066]/30 selection:text-[#f4e8d8] overflow-hidden flex flex-col justify-start items-center p-0 sm:p-2 relative box-border flex-1 min-h-0">
      {/* AMBIENT NOIR BANKERS SPOTLIGHT */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(217,160,102,0.13),transparent_75%)] z-0" />
      <div className="noir-scanlines pointer-events-none fixed inset-0 opacity-15 z-0" />

      <BoardGameCompanionView
        checkpoints={checkpoints}
        completedCheckpointIds={completedCheckpointIds}
        selectedAnswers={selectedAnswers}
        checkpointErrors={checkpointErrors}
        checkpointSuccesses={checkpointSuccesses}
        unlockedHintLevel={unlockedHintLevel}
        onAnswerSelect={handleAnswerSelect}
        onSubmitAnswer={handleSubmitAnswer}
        onUnlockNextHint={unlockNextHint}
        onOpenEpilogue={() => setIsEpilogueOpen(true)}
        onOpenPhoneSimulator={() => setIsPhoneModalOpen(true)}
        onOpenReinvestigation={() => setIsReinvestigateModalOpen(true)}
        onSwitchToWebMode={handleSwitchToWebMode}
        onProceedNextPhase={handleProceedNextPhase}
      />

      {/* PHASE UNLOCKED CINEMATIC STORY MODAL */}
      <PhaseUnlockedModal
        unlockedModalData={unlockedModalData}
        playExperience="boardgame"
        onClose={() => setUnlockedModalData(null)}
        onSelectPdf={() => {}}
        onSelectEvidence={() => {}}
        onSetPhaseFilter={() => {}}
      />

      {/* JUMPSCARE ENDGAME SEQUENCE */}
      <JumpscareEndgame
        isActive={isJumpscareActive}
        onComplete={() => {
          setIsJumpscareActive(false)
          setIsEpilogueOpen(true)
        }}
      />

      {/* POST-CASE EPILOGUE STORIES MODAL */}
      <EpilogueModal
        isOpen={isEpilogueOpen}
        onClose={() => setIsEpilogueOpen(false)}
      />

      {/* QUICK ACTION FAB MENU */}
      <QuickActionFab
        onOpenPhone={() => setIsPhoneModalOpen(true)}
        onResetCase={resetFindingsProgress}
      />

      {/* VICTIM PHONE SIMULATOR MODAL */}
      <PhoneModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
      />

      {/* RE-INVESTIGATION CRIME SCENE MODAL */}
      <ReinvestigationModal
        isOpen={isReinvestigateModalOpen}
        onClose={() => setIsReinvestigateModalOpen(false)}
      />
    </div>
  )
}
