'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, Paperclip, ImageIcon, Volume2, VolumeX } from 'lucide-react'
import { PDFViewerModal } from '@/components/investigation/pdf-viewer-modal'
import { useCheckpoints } from '@/components/investigation/checkpoints-context'
import { CASES } from '@/lib/mock-data'
import { checkpoints000 } from '@/content/cases/case-000/checkpoints'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

import type { PDFDocument, PhysicalEvidence, SelectedView, CombinedItem } from '@/components/investigation/evidence/evidence-types'
import { CASE_000_PDFS, CASE_000_EVIDENCE } from '@/components/investigation/evidence/evidence-data'
import { CASE_000_NARRATOR } from '@/content/cases/case-000/narrator'
import { CASE_000_FINDINGS, Finding } from '@/content/cases/case-000/findings'
import { TypewriterNarrator } from '@/components/investigation/evidence/typewriter-narrator'
import { PhaseUnlockedModal, UnlockedModalData } from '@/components/investigation/evidence/phase-unlocked-modal'
import { DetectiveJournalDrawer } from '@/components/investigation/evidence/detective-journal-drawer'
import { CaseCheckpointsSection } from '@/components/investigation/evidence/case-checkpoints-section'
import { InvestigationModeModal, InvestigationMode } from '@/components/investigation/evidence/investigation-mode-modal'
import { EvidenceDetailInspector } from '@/components/investigation/evidence/evidence-detail-inspector'

export default function EvidencePage() {
  const activeCase = CASES.find((c) => c.id === 'case-000')
  const { completedCheckpointIds, completeCheckpoint } = useCheckpoints()
  
  // Audio Mute State
  const [isAudioMuted, setIsAudioMuted] = useState(detectiveAudio.isMuted)

  // Discovered Findings State
  const [discoveredFindingIds, setDiscoveredFindingIds] = useState<string[]>([])

  // Investigation Game Mode State ('casual' | 'hardcore' | null)
  const [investigationMode, setInvestigationMode] = useState<InvestigationMode | null>(null)
  const [isModeModalOpen, setIsModeModalOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('veritas_discovered_findings')
      if (saved) {
        setDiscoveredFindingIds(JSON.parse(saved))
      }

      const savedMode = localStorage.getItem('veritas_investigation_mode') as InvestigationMode | null
      if (savedMode) {
        setInvestigationMode(savedMode)
      } else {
        setIsModeModalOpen(true)
      }
    } catch {
      setIsModeModalOpen(true)
    }
  }, [])

  const handleSelectMode = (mode: InvestigationMode) => {
    setInvestigationMode(mode)
    setIsModeModalOpen(false)
    try {
      localStorage.setItem('veritas_investigation_mode', mode)
    } catch {}
  }

  // Checkpoint questions state
  const [checkpoints, setCheckpoints] = useState(checkpoints000)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [checkpointErrors, setCheckpointErrors] = useState<Record<string, boolean>>({})
  const [checkpointSuccesses, setCheckpointSuccesses] = useState<Record<string, boolean>>({})
  
  // Hint system state
  const [unlockedHintLevel, setUnlockedHintLevel] = useState<Record<string, number>>({})

  // Right column selection state (Default: First PDF)
  const [selectedView, setSelectedView] = useState<SelectedView>({
    type: 'pdf',
    data: CASE_000_PDFS[0]
  })

  // Mobile PDF modal state
  const [isMobilePdfOpen, setIsMobilePdfOpen] = useState(false)

  // Category filter: 'all' | 'pdf' | 'evidence'
  const [filterTab, setFilterTab] = useState<'all' | 'pdf' | 'evidence'>('all')

  // Phase filter: 'all' | 0 | 1 | 2 | 3
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<'all' | number>('all')

  // Unlocked Modal state
  const [unlockedModalData, setUnlockedModalData] = useState<UnlockedModalData | null>(null)

  useEffect(() => {
    if (checkpoints000 && checkpoints000.length > 0) {
      setCheckpoints(checkpoints000)
    }

    // On initial start or reset (Phase 0), open the unified PhaseUnlockedModal for Phase 0
    if (completedCheckpointIds.length === 0) {
      const initialPdfs = CASE_000_PDFS.filter((d) => d.phase === 0)
      const initialEvidence = CASE_000_EVIDENCE.filter((e) => e.phase === 0)
      setUnlockedModalData({
        unlockedPhase: 0,
        newPdfs: initialPdfs,
        newEvidence: initialEvidence
      })
    }

    const handleFirstUserInteraction = () => {
      detectiveAudio.startRainSound()
      window.removeEventListener('click', handleFirstUserInteraction)
    }
    window.addEventListener('click', handleFirstUserInteraction)

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction)
      detectiveAudio.stopRainSound()
    }
  }, [completedCheckpointIds])

  // Helper check if phase is unlocked
  const isPhaseUnlocked = (phase: number) => {
    if (phase === 0) return true
    if (phase === 1) return completedCheckpointIds.includes('cp-000-0')
    if (phase === 2) return completedCheckpointIds.includes('cp-000-1')
    if (phase === 3) return completedCheckpointIds.includes('cp-000-2')
    return false
  }

  const handleSelectPdf = (doc: PDFDocument) => {
    if (!isPhaseUnlocked(doc.phase)) return
    detectiveAudio.playTypewriterClick()
    setSelectedView({ type: 'pdf', data: doc })
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobilePdfOpen(true)
    }
  }

  const handleSelectEvidence = (item: PhysicalEvidence) => {
    if (!isPhaseUnlocked(item.phase)) return
    detectiveAudio.playGlassSound()
    setSelectedView({ type: 'evidence', data: item })
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobilePdfOpen(false)
    }
  }

  const currentPhaseIndex = completedCheckpointIds.length // 0, 1, 2, 3

  const handleFindingDiscovered = (finding: Finding) => {
    setDiscoveredFindingIds((prev) => {
      if (prev.includes(finding.id)) return prev
      const next = [...prev, finding.id]
      try {
        localStorage.setItem('veritas_discovered_findings', JSON.stringify(next))
      } catch {}

      // If this is a KEY FINDING for the current active phase, trigger phase advancement!
      if (finding.isKeyFinding && finding.phase === currentPhaseIndex) {
        const cpId = `cp-000-${finding.phase}`
        completeCheckpoint(cpId)

        const nextPhase = finding.phase + 1
        if (nextPhase <= 3) {
          setTimeout(() => {
            const newPdfs = CASE_000_PDFS.filter((d) => d.phase === nextPhase)
            const newEvidence = CASE_000_EVIDENCE.filter((e) => e.phase === nextPhase)
            setUnlockedModalData({
              unlockedPhase: nextPhase,
              newPdfs,
              newEvidence
            })
          }, 800)
        }
      }

      return next
    })
  }

  const resetFindingsProgress = () => {
    try {
      localStorage.removeItem('veritas_discovered_findings')
      localStorage.removeItem('veritas_completed_checkpoints')
      window.location.reload()
    } catch {}
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

  const handleAnswerSelect = (cpId: string, option: string) => {
    detectiveAudio.playTypewriterClick()
    setSelectedAnswers((prev) => ({ ...prev, [cpId]: option }))
    setCheckpointErrors((prev) => ({ ...prev, [cpId]: false }))
  }

  const handleSubmitAnswer = (cp: (typeof checkpoints000)[0]) => {
    const userAnswer = selectedAnswers[cp.id]
    if (!userAnswer) return

    // Hide narrator monologue box when entering active checkpoint solving / submitting
    setShowMainNarrator(false)

    if (userAnswer === cp.correctAnswer) {
      detectiveAudio.playStampSound()
      detectiveAudio.playUnlockJingle()
      setCheckpointSuccesses((prev) => ({ ...prev, [cp.id]: true }))
      const nextPhase = cp.id === 'cp-000-0' ? 1 : cp.id === 'cp-000-1' ? 2 : cp.id === 'cp-000-2' ? 3 : null

      setTimeout(() => {
        completeCheckpoint(cp.id)
        if (nextPhase !== null) {
          detectiveAudio.playHeartbeat()
          const newPdfs = CASE_000_PDFS.filter((d) => d.phase === nextPhase)
          const newEvidence = CASE_000_EVIDENCE.filter((e) => e.phase === nextPhase)
          setUnlockedModalData({
            unlockedPhase: nextPhase,
            newPdfs,
            newEvidence
          })
        }
      }, 1000)
    } else {
      detectiveAudio.playGlassSound()
      setCheckpointErrors((prev) => ({ ...prev, [cp.id]: true }))
    }
  }

  // State controlling whether the narrative monologue is visible on main page
  const [showMainNarrator, setShowMainNarrator] = useState(true)

  // Filter items to ONLY include unlocked ones and match phase/tab filters
  const filteredPdfs = CASE_000_PDFS.filter((doc) => {
    if (!isPhaseUnlocked(doc.phase)) return false
    if (filterTab === 'evidence') return false
    if (selectedPhaseFilter !== 'all' && doc.phase !== selectedPhaseFilter) return false
    return true
  })

  const filteredEvidence = CASE_000_EVIDENCE.filter((item) => {
    if (!isPhaseUnlocked(item.phase)) return false
    if (filterTab === 'pdf') return false
    if (selectedPhaseFilter !== 'all' && item.phase !== selectedPhaseFilter) return false
    return true
  })

  const combinedItems: CombinedItem[] = [
    ...filteredPdfs.map((doc): CombinedItem => ({ type: 'pdf', data: doc, phase: doc.phase, order: doc.order })),
    ...filteredEvidence.map((item): CombinedItem => ({ type: 'evidence', data: item, phase: item.phase, order: item.order }))
  ].sort((a, b) => a.order - b.order)

  return (
    <div className="h-screen w-full bg-[#0d0a08] text-[#e5d8cb] font-sans selection:bg-[#d9a066]/30 selection:text-[#f4e8d8] overflow-hidden flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-[1700px] h-full flex flex-col lg:flex-row gap-5 items-stretch justify-center">
        
        {/* LEFT COLUMN: UNIFIED VINTAGE DOSSIER INDEX & ACTIVE QUESTION */}
        <div className="w-full lg:w-[48%] xl:w-[46%] shrink-0 bg-[#16120e] border-2 border-[#3d2c1e] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-y-auto h-full flex flex-col custom-scrollbar">
          {/* STICKY HEADER */}
          <header className="sticky top-0 z-20 border-b border-[#3d2c1e] p-5 sm:p-6 bg-[#241a12] shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-[#d4a373] font-bold block mb-1">
                  HỒ SƠ ĐIỀU TRA CHUYÊN ÁN MẬT // CASE #000
                </span>
                
                <div className="inline-block mt-0.5">
                  <span className="font-[family-name:var(--font-handwriting)] text-2xl sm:text-3xl font-bold text-[#1a0f07] tracking-wide leading-none bg-[#f4e8d8] px-3.5 py-1 rounded border border-[#2b1b0e]/20 inline-block rotate-[-1deg]">
                    {activeCase?.title || 'Trốn Tìm'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-start">
                <button
                  type="button"
                  onClick={() => setIsModeModalOpen(true)}
                  className="px-2 py-1 bg-[#18120c] hover:bg-[#342417] border border-[#3e2e20] text-[0.6rem] font-mono font-bold text-[#d9a066] transition-colors cursor-pointer flex items-center gap-1"
                  title="Đổi chế độ điều tra"
                >
                  <span>{investigationMode === 'hardcore' ? '🔴 THÁM TỬ THÂM NIÊN' : '🟢 CHẾ ĐỘ TẬP SỰ'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAudioMuted(detectiveAudio.toggleMute())}
                  className="p-1.5 bg-[#18120c] hover:bg-[#342417] border border-[#3e2e20] text-[#d9a066] transition-colors cursor-pointer"
                  title={isAudioMuted ? 'Bật âm thanh trinh thám' : 'Tắt âm thanh trinh thám'}
                >
                  {isAudioMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
                <div className="inline-flex border-2 border-red-800 text-red-700 bg-red-950/20 font-mono text-[0.65rem] uppercase tracking-widest px-2.5 py-1 rotate-[-3deg] rounded font-black shadow-sm shrink-0 select-none">
                  🔴 BẢO MẬT HỒ SƠ
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-[#ad9885] leading-relaxed font-sans border-t border-[#3b2b1e] pt-2.5">
              {activeCase?.briefing || 'Hồ sơ lưu trữ các biên bản khám nghiệm, tài liệu lời khai và chứng cứ liên quan đến vụ tử vong nghi vấn của Nguyễn Văn Khang.'}
            </p>
          </header>

          <div className="p-4 sm:p-6 space-y-6">
            {/* DOSSIER INDEX WITH PHASE UNLOCK FILTERS */}
            <section className="space-y-3">
              <div className="flex flex-col gap-3 border-b border-[#3d2c1e] pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="size-4 text-[#d9a066]" />
                    <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#e6d3c1]">
                      DANH MỤC HỒ SƠ & TANG CHỨNG THEO GIAI ĐOẠN
                    </h2>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[0.6rem]">
                    <button
                      onClick={() => setFilterTab('all')}
                      className={cn(
                        'px-2 py-0.5 font-bold transition-all cursor-pointer border',
                        filterTab === 'all'
                          ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                          : 'bg-[#241a12] text-[#ad9885] border-[#4a3625]'
                      )}
                    >
                      TẤT CẢ
                    </button>
                    <button
                      onClick={() => setFilterTab('pdf')}
                      className={cn(
                        'px-2 py-0.5 font-bold transition-all cursor-pointer border',
                        filterTab === 'pdf'
                          ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                          : 'bg-[#241a12] text-[#ad9885] border-[#4a3625]'
                      )}
                    >
                      📄 VĂN BẢN
                    </button>
                    <button
                      onClick={() => setFilterTab('evidence')}
                      className={cn(
                        'px-2 py-0.5 font-bold transition-all cursor-pointer border',
                        filterTab === 'evidence'
                          ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                          : 'bg-[#241a12] text-[#ad9885] border-[#4a3625]'
                      )}
                    >
                      📸 TANG VẬT
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 font-mono text-[0.625rem]">
                  <button
                    onClick={() => setSelectedPhaseFilter('all')}
                    className={cn(
                      'px-2.5 py-1 font-bold transition-all cursor-pointer shrink-0 border',
                      selectedPhaseFilter === 'all'
                        ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                        : 'bg-[#1e1711] text-[#ad9885] hover:text-[#e6d3c1] border-[#3d2c1e]'
                    )}
                  >
                    TẤT CẢ GIAI ĐOẠN
                  </button>

                  {[0, 1, 2, 3]
                    .filter((p) => isPhaseUnlocked(p))
                    .map((p) => {
                      const isSelected = selectedPhaseFilter === p
                      return (
                        <button
                          key={p}
                          onClick={() => setSelectedPhaseFilter(p)}
                          className={cn(
                            'px-2.5 py-1 font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1',
                            isSelected
                              ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                              : 'bg-[#1e1711] text-[#e6d3c1] hover:bg-[#2e2319] border-[#4a3625]'
                          )}
                        >
                          <span>GIAI ĐOẠN {p}</span>
                        </button>
                      )
                    })}
                </div>
              </div>

              {/* Combined Items List */}
              <div className="grid grid-cols-1 gap-2">
                {combinedItems.map((item) => {
                  if (item.type === 'pdf') {
                    const doc = item.data
                    const isSelected = selectedView.type === 'pdf' && selectedView.data.id === doc.id

                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleSelectPdf(doc)}
                        className={cn(
                          'group flex items-center justify-between p-3 rounded-none border transition-all shadow-sm cursor-pointer',
                          isSelected
                            ? 'bg-[#38271a] border-[#6b4b32] text-amber-200'
                            : 'bg-[#241b13] hover:bg-[#2d2218] border-[#3e2e20] text-[#e5d8cb]'
                        )}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={cn(
                            'size-8 rounded-none flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                            isSelected
                              ? 'bg-[#d9a066] text-[#1a0f07]'
                              : 'bg-[#18120c] text-[#d9a066] border border-[#3e2e20]'
                          )}>
                            <FileText className="size-4" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className={cn(
                              'font-sans font-semibold text-xs truncate transition-colors',
                              isSelected ? 'text-[#f4e8d8] font-bold' : 'text-[#e5d8cb] group-hover:text-[#d9a066]'
                            )}>
                              {doc.title}
                            </span>
                            <span className="font-mono text-[0.6rem] text-[#ad9885] flex items-center gap-1.5">
                              <span className="text-[#d9a066] font-bold">[GIAI ĐOẠN {doc.phase}]</span>
                              <span>📄 HỒ SƠ // {doc.code}</span>
                            </span>
                          </div>
                        </div>

                        <span className={cn(
                          'flex items-center gap-1 px-2.5 py-1 text-[0.65rem] font-bold font-mono rounded-none transition-all shrink-0 border',
                          isSelected
                            ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                            : 'text-[#d9a066] bg-[#18120c] border-[#3e2e20] group-hover:bg-[#d9a066] group-hover:text-[#1a0f07]'
                        )}>
                          <Search className="size-3" />
                          <span>{isSelected ? 'ĐANG XEM' : 'CHI TIẾT'}</span>
                        </span>
                      </div>
                    )
                  } else {
                    const ev = item.data
                    const isSelected = selectedView.type === 'evidence' && selectedView.data.id === ev.id

                    return (
                      <div
                        key={ev.id}
                        onClick={() => handleSelectEvidence(ev)}
                        className={cn(
                          'group flex items-center justify-between p-3 rounded-none border transition-all shadow-sm cursor-pointer',
                          isSelected
                            ? 'bg-[#38271a] border-[#6b4b32] text-amber-200'
                            : 'bg-[#241b13] hover:bg-[#2d2218] border-[#3e2e20] text-[#e5d8cb]'
                        )}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={cn(
                            'size-8 rounded-none flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                            isSelected
                              ? 'bg-[#d9a066] text-[#1a0f07]'
                              : 'bg-[#18120c] text-[#d9a066] border border-[#3e2e20]'
                          )}>
                            <ImageIcon className="size-4" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className={cn(
                              'font-sans font-semibold text-xs truncate transition-colors',
                              isSelected ? 'text-[#f4e8d8] font-bold' : 'text-[#e5d8cb] group-hover:text-[#d9a066]'
                            )}>
                              {ev.title}
                            </span>
                            <span className="font-mono text-[0.6rem] text-[#ad9885] flex items-center gap-1.5">
                              <span className="text-[#d9a066] font-bold">[GIAI ĐOẠN {ev.phase}]</span>
                              <span>📸 TANG CHỨNG // {ev.evidenceId}</span>
                            </span>
                          </div>
                        </div>

                        <span className={cn(
                          'flex items-center gap-1 px-2.5 py-1 text-[0.65rem] font-bold font-mono rounded-none transition-all shrink-0 border',
                          isSelected
                            ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                            : 'text-[#d9a066] bg-[#18120c] border-[#3e2e20] group-hover:bg-[#d9a066] group-hover:text-[#1a0f07]'
                        )}>
                          <Search className="size-3" />
                          <span>{isSelected ? 'ĐANG XEM' : 'CHI TIẾT'}</span>
                        </span>
                      </div>
                    )
                  }
                })}
              </div>
            </section>

            {/* CASUAL MODE: INLINE CHECKPOINT QUESTIONS */}
            {investigationMode === 'casual' && (
              <CaseCheckpointsSection
                checkpoints={checkpoints}
                completedCheckpointIds={completedCheckpointIds}
                selectedAnswers={selectedAnswers}
                checkpointErrors={checkpointErrors}
                checkpointSuccesses={checkpointSuccesses}
                unlockedHintLevel={unlockedHintLevel}
                onAnswerSelect={handleAnswerSelect}
                onSubmitAnswer={handleSubmitAnswer}
                onUnlockNextHint={unlockNextHint}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: EVIDENCE DETAIL INSPECTOR */}
        <EvidenceDetailInspector selectedView={selectedView} />
      </div>

      {/* HARDCORE MODE: FLOATING DETECTIVE LEATHER JOURNAL DRAWER */}
      {investigationMode === 'hardcore' && (
        <DetectiveJournalDrawer
          currentPhase={currentPhaseIndex > 3 ? 3 : currentPhaseIndex}
          allFindings={CASE_000_FINDINGS}
          discoveredFindingIds={discoveredFindingIds}
          onFindingDiscovered={handleFindingDiscovered}
          onResetProgress={resetFindingsProgress}
        />
      )}

      {/* INITIAL INVESTIGATION MODE SELECTION MODAL */}
      <InvestigationModeModal
        isOpen={isModeModalOpen}
        onSelectMode={handleSelectMode}
      />

      {/* MOBILE FULL SCREEN PDF MODAL */}
      <PDFViewerModal
        isOpen={isMobilePdfOpen}
        pdfUrl={selectedView.type === 'pdf' ? selectedView.data.url : null}
        title={selectedView.type === 'pdf' ? selectedView.data.title : null}
        onClose={() => setIsMobilePdfOpen(false)}
      />

      {/* PHASE UNLOCKED CELEBRATION MODAL */}
      <PhaseUnlockedModal
        unlockedModalData={unlockedModalData}
        onClose={() => {
          setUnlockedModalData(null)
          setShowMainNarrator(true)
        }}
        onSelectPdf={handleSelectPdf}
        onSelectEvidence={handleSelectEvidence}
        onSetPhaseFilter={(phase) => setSelectedPhaseFilter(phase)}
      />
    </div>
  )
}
