'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ImageIcon, Search } from 'lucide-react'
import { PDFDocument, PhysicalEvidence } from './evidence-types'
import { CASE_000_NARRATOR } from '@/content/cases/case-000/narrator'
import { TypewriterNarrator } from './typewriter-narrator'
import { detectiveAudio } from '@/lib/investigation-audio'

export interface UnlockedModalData {
  unlockedPhase: number
  newPdfs: PDFDocument[]
  newEvidence: PhysicalEvidence[]
}

interface PhaseUnlockedModalProps {
  unlockedModalData: UnlockedModalData | null
  onClose: () => void
  onSelectPdf: (pdf: PDFDocument) => void
  onSelectEvidence: (item: PhysicalEvidence) => void
  onSetPhaseFilter: (phase: number) => void
  playExperience?: 'web' | 'boardgame'
}

export function PhaseUnlockedModal({
  unlockedModalData,
  onClose,
  onSelectPdf,
  onSelectEvidence,
  onSetPhaseFilter,
  playExperience = 'web',
}: PhaseUnlockedModalProps) {
  const [isStoryStarted, setIsStoryStarted] = React.useState(false)

  React.useEffect(() => {
    setIsStoryStarted(false)
  }, [unlockedModalData])

  const handleStartStory = () => {
    setIsStoryStarted(true)
    if (unlockedModalData && unlockedModalData.unlockedPhase === 0) {
      setTimeout(() => {
        detectiveAudio.playCeramicShatterSound()
      }, 3000)
    }
  }

  return (
    <AnimatePresence>
      {unlockedModalData && (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none">
          {/* CRT Background scanlines */}
          <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

          {/* Main Fullscreen Content Area */}
          {playExperience === 'boardgame' ? (
            /* BOARD GAME MODE: PURE IMMERSIVE CINEMATIC STORYTELLING (NO RIGHT DIRECTIVE COLUMN) */
            <div className="relative z-20 flex-1 flex flex-col justify-between items-center p-6 sm:p-12 max-w-3xl mx-auto w-full overflow-y-auto custom-scrollbar">
              {CASE_000_NARRATOR[unlockedModalData.unlockedPhase] && (
                <div className="space-y-6 w-full flex flex-col items-start my-auto py-8">
                  <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-widest uppercase border-b border-[#261b12] pb-3 w-full flex items-center justify-between">
                    <span>{CASE_000_NARRATOR[unlockedModalData.unlockedPhase].date}</span>
                    <span className="text-[0.65rem] text-[#8f7a68] font-semibold">
                      {CASE_000_NARRATOR[unlockedModalData.unlockedPhase].title}
                    </span>
                  </div>

                  <div className="pt-2 w-full">
                    {unlockedModalData.unlockedPhase === 0 && !isStoryStarted ? (
                      <div className="py-16 flex flex-col items-center justify-center w-full">
                        <button
                          onClick={handleStartStory}
                          className="px-8 py-4 bg-[#221810] hover:bg-[#342418] border border-[#d9a066]/50 hover:border-[#d9a066] text-[#d9a066] font-mono text-sm font-bold tracking-[0.3em] uppercase transition-all cursor-pointer shadow-xl rounded hover:scale-105 active:scale-95"
                        >
                          [ TRỐN TÌM ]
                        </button>
                      </div>
                    ) : (
                      <TypewriterNarrator
                        text={CASE_000_NARRATOR[unlockedModalData.unlockedPhase].monologue}
                        speed={12}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Clean Bottom Button */}
              <div className="w-full pt-6 pb-2 shrink-0 max-w-md mx-auto">
                <button
                  onClick={() => {
                    onSetPhaseFilter(unlockedModalData.unlockedPhase)
                    onClose()
                  }}
                  className="w-full py-3.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Search className="size-4.5" />
                  <span>BẮT ĐẦU THẨM TRA</span>
                </button>
              </div>
            </div>
          ) : (
            /* WEB DIGITAL MODE: SPLIT VIEW (LEFT: STORY, RIGHT: DIGITAL ARCHIVES) */
            <div className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
              {/* Left Column (60% width): Clean Pure Storytelling Screen */}
              <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#261b12] p-6 lg:p-12 flex flex-col justify-start items-center bg-black overflow-y-auto custom-scrollbar">
                {CASE_000_NARRATOR[unlockedModalData.unlockedPhase] && (
                  <div className="space-y-6 max-w-xl mx-auto w-full flex flex-col items-start py-6 sm:py-10">
                    <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-widest uppercase border-b border-[#261b12] pb-3 w-full flex items-center justify-between">
                      <span>{CASE_000_NARRATOR[unlockedModalData.unlockedPhase].date}</span>
                    </div>

                    <div className="pt-2 w-full">
                      {unlockedModalData.unlockedPhase === 0 && !isStoryStarted ? (
                        <div className="py-12 flex flex-col items-center justify-center w-full">
                          <button
                            onClick={handleStartStory}
                            className="px-8 py-4 bg-[#221810] hover:bg-[#342418] border border-[#d9a066]/50 hover:border-[#d9a066] text-[#d9a066] font-mono text-sm font-bold tracking-[0.3em] uppercase transition-all cursor-pointer shadow-xl rounded hover:scale-105 active:scale-95"
                          >
                            [ TRỐN TÌM ]
                          </button>
                        </div>
                      ) : (
                        <TypewriterNarrator
                          text={CASE_000_NARRATOR[unlockedModalData.unlockedPhase].monologue}
                          speed={12}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (40% width): Unlocked Archives */}
              <div className="lg:col-span-5 p-6 lg:p-10 bg-[#160f0a] flex flex-col justify-between overflow-hidden">
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#3d2a1b] pb-3 mb-4">
                    <span className="font-mono text-xs text-[#d9a066] uppercase font-bold tracking-wider flex items-center gap-2">
                      <FileText className="size-4" />
                      TÀI LIỆU & TANG VẬT MỚI
                    </span>
                    <span className="font-mono text-xs text-[#ad9885] bg-[#221810] px-2 py-0.5 border border-[#3e2c1e]">
                      {unlockedModalData.newPdfs.length + unlockedModalData.newEvidence.length} VẬT PHẨM
                    </span>
                  </div>

                  {/* Evidence List Scroll Container */}
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    {unlockedModalData.newPdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className="group flex items-start gap-3 p-3.5 bg-[#221810] border border-[#3e2c1e] shadow-md"
                      >
                        <div className="p-2 bg-[#170f0a] border border-[#443021] text-[#d9a066]">
                          <FileText className="size-5" />
                        </div>
                        <div className="flex flex-col overflow-hidden flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[0.65rem] text-[#d9a066] uppercase font-semibold">
                              VĂN BẢN HỒ SƠ
                            </span>
                            <span className="font-mono text-[0.65rem] text-[#ad9885]">
                              {pdf.code}
                            </span>
                          </div>
                          <span className="font-sans font-bold text-sm text-[#f2e6d8] truncate">
                            {pdf.title}
                          </span>
                        </div>
                      </div>
                    ))}

                    {unlockedModalData.newEvidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="group flex items-start gap-3 p-3.5 bg-[#221810] border border-[#3e2c1e] shadow-md"
                      >
                        <div className="p-2 bg-[#170f0a] border border-[#443021] text-[#d9a066]">
                          <ImageIcon className="size-5" />
                        </div>
                        <div className="flex flex-col overflow-hidden flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[0.65rem] text-amber-500 uppercase font-semibold">
                              TANG CHỨNG VẬT LÝ
                            </span>
                            <span className="font-mono text-[0.65rem] text-[#ad9885]">
                              {ev.evidenceId}
                            </span>
                          </div>
                          <span className="font-sans font-bold text-sm text-[#f2e6d8] truncate">
                            {ev.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action Section */}
                  <div className="pt-4 border-t border-[#3d2a1b] mt-4">
                    <button
                      onClick={() => {
                        if (unlockedModalData.newPdfs.length > 0) {
                          onSelectPdf(unlockedModalData.newPdfs[0])
                        } else if (unlockedModalData.newEvidence.length > 0) {
                          onSelectEvidence(unlockedModalData.newEvidence[0])
                        }
                        onSetPhaseFilter(unlockedModalData.unlockedPhase)
                        onClose()
                      }}
                      className="w-full py-3.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
                    >
                      <Search className="size-4.5" />
                      <span>PHÁ ÁN</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}

