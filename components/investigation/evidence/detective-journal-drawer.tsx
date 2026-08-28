'use client'

import React, { useState, useEffect } from 'react'
import { Search, CheckCircle2, BookOpen, Bookmark, FileText, Trash2, Edit3, X, ChevronRight } from 'lucide-react'
import { Finding } from '@/content/cases/case-000/findings'
import { findMatchingFinding } from '@/lib/finding-matcher'
import { detectiveAudio } from '@/lib/investigation-audio'

export interface CustomNote {
  id: string
  text: string
  createdAt: string
}

interface DetectiveJournalDrawerProps {
  currentPhase: number
  allFindings: Finding[]
  discoveredFindingIds: string[]
  onFindingDiscovered: (finding: Finding) => void
  onResetProgress: () => void
}

export function DetectiveJournalDrawer({
  currentPhase,
  allFindings,
  discoveredFindingIds,
  onFindingDiscovered,
  onResetProgress,
}: DetectiveJournalDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [matchStatus, setMatchStatus] = useState<'idle' | 'verified' | 'custom_note' | 'already'>('idle')
  const [lastDiscoveredTitle, setLastDiscoveredTitle] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Custom Personal Notes state (Infinite notes)
  const [customNotes, setCustomNotes] = useState<CustomNote[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('veritas_custom_notes')
      if (saved) {
        setCustomNotes(JSON.parse(saved))
      }
    } catch {}
  }, [])

  const toggleDrawer = () => {
    detectiveAudio.playPaperRustle()
    setIsOpen(!isOpen)
  }

  const saveCustomNote = (text: string) => {
    const newNote: CustomNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
    const updated = [newNote, ...customNotes]
    setCustomNotes(updated)
    try {
      localStorage.setItem('veritas_custom_notes', JSON.stringify(updated))
    } catch {}
  }

  const deleteCustomNote = (id: string) => {
    detectiveAudio.playPaperRustle()
    const updated = customNotes.filter((n) => n.id !== id)
    setCustomNotes(updated)
    try {
      localStorage.setItem('veritas_custom_notes', JSON.stringify(updated))
    } catch {}
  }

  const phaseFindings = allFindings.filter((f) => f.phase === currentPhase)
  const undiscoveredPhaseFindings = phaseFindings.filter((f) => !discoveredFindingIds.includes(f.id))

  const handleVerifyInput = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || isAnalyzing) return

    setIsAnalyzing(true)
    setMatchStatus('idle')

    try {
      const allUndiscovered = allFindings.filter((f) => !discoveredFindingIds.includes(f.id))

      // 1. Try Gemini AI API Semantic Matcher
      const res = await fetch('/api/verify-finding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText: trimmed,
          currentPhase,
          findings: allUndiscovered
        })
      })

      const data = await res.json()
      let matched: Finding | null = null

      if (data.matched) {
        // AI dynamically extracted & synthesized finding from Master Storyline!
        const existingFinding = allFindings.find((f) => f.id === data.findingId)
        matched = {
          id: data.findingId || `ai-finding-${Date.now()}`,
          phase: currentPhase,
          title: data.title || existingFinding?.title || 'Phán đoán đã được xác minh',
          description: data.description || existingFinding?.description || 'AI bóc tách thành công sự thật từ cốt truyện.',
          evidenceRef: existingFinding?.evidenceRef || 'Hồ sơ chuyên án #000',
          keywordGroups: [],
          hint: '',
          isKeyFinding: data.isKeyFinding !== undefined ? data.isKeyFinding : (existingFinding?.isKeyFinding ?? true)
        }
      } else if (data.fallback) {
        matched = findMatchingFinding(trimmed, undiscoveredPhaseFindings) || findMatchingFinding(trimmed, allUndiscovered)
      }

      if (matched) {
        if (discoveredFindingIds.includes(matched.id)) {
          setMatchStatus('already')
          detectiveAudio.playGlassSound()
        } else {
          detectiveAudio.playStampSound()
          detectiveAudio.playUnlockJingle()
          setMatchStatus('verified')
          setLastDiscoveredTitle(matched.title)
          onFindingDiscovered(matched)
          setInputText('')
        }
      } else {
        // Save as Personal Infinite Note!
        detectiveAudio.playPaperRustle()
        saveCustomNote(trimmed)
        setMatchStatus('custom_note')
        setInputText('')
      }
    } catch {
      // Local Keyword Fallback or Custom Note
      const allUndiscovered = allFindings.filter((f) => !discoveredFindingIds.includes(f.id))
      const matched = findMatchingFinding(trimmed, undiscoveredPhaseFindings) || findMatchingFinding(trimmed, allUndiscovered)

      if (matched) {
        if (!discoveredFindingIds.includes(matched.id)) {
          detectiveAudio.playStampSound()
          detectiveAudio.playUnlockJingle()
          setMatchStatus('verified')
          setLastDiscoveredTitle(matched.title)
          onFindingDiscovered(matched)
          setInputText('')
        } else {
          setMatchStatus('already')
        }
      } else {
        detectiveAudio.playPaperRustle()
        saveCustomNote(trimmed)
        setMatchStatus('custom_note')
        setInputText('')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const discoveredFindingsList = allFindings.filter((f) => discoveredFindingIds.includes(f.id))
  const totalEntriesCount = discoveredFindingsList.length + customNotes.length

  return (
    <>
      {/* FLOATING DETECTIVE JOURNAL BUTTON (STUCK TO BOTTOM RIGHT, LEFT OF FEEDBACK BUTTON) */}
      <div className="fixed bottom-6 right-24 z-40">
        <button
          type="button"
          onClick={toggleDrawer}
          className="bg-[#24170d] hover:bg-[#332113] border-2 border-[#66462c] text-[#f4e8d8] font-mono text-xs font-bold px-4 py-3 shadow-2xl rounded-none flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer relative group"
        >
          {/* STITCHED BORDER EFFECT */}
          <div className="absolute inset-0.5 border border-dashed border-[#8c6239]/50 pointer-events-none" />
          
          <BookOpen className="size-4 text-[#d9a066] animate-pulse" />
          <span className="tracking-wide uppercase">📓 SỔ TAY TRINH THÁM</span>

          {totalEntriesCount > 0 && (
            <span className="bg-[#8c2518] text-[#f4e8d8] font-mono text-[0.65rem] font-bold px-2 py-0.5 border border-[#aa3426] rounded-full">
              {totalEntriesCount}
            </span>
          )}

          <ChevronRight className="size-4 text-[#d9a066] transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* BACKDROP OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
          onClick={toggleDrawer}
        />
      )}

      {/* SLIDE-OVER DETECTIVE LEATHER JOURNAL PANEL */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[540px] bg-[#17100b] border-l-4 border-[#5c4028] shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* LEATHER BORDER STITCHING EFFECT */}
        <div className="absolute inset-1.5 border border-dashed border-[#8c6239]/40 pointer-events-none z-10" />

        {/* BOOKMARK TAB IN CORNER */}
        <div className="absolute top-0 right-12 bg-[#8c2518] text-[#f4e8d8] font-mono text-[0.6rem] font-bold px-3 py-1 flex items-center gap-1 shadow-md z-20 border-b border-x border-[#61160d]">
          <Bookmark className="size-3 fill-amber-200 text-amber-200" />
          <span>NHẬT KÝ VÔ HẠN</span>
        </div>

        {/* DRAWER HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#4d3623] bg-[#20150d] relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="size-5 text-[#d9a066]" />
            <div>
              <h2 className="font-mono text-sm sm:text-base font-bold uppercase tracking-wider text-[#f4e8d8]">
                📓 SỔ TAY TRINH THÁM BÌA DA
              </h2>
              <p className="text-[0.65rem] font-sans text-[#a38f7e]">
                Ghi chép tự do suy luận cá nhân & manh mối vụ án
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleDrawer}
            className="p-1.5 text-[#a38f7e] hover:text-[#f4e8d8] hover:bg-[#382516] transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* DRAWER CONTENT SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 relative z-20 custom-scrollbar">
          {/* STATS BAR */}
          <div className="flex items-center justify-between bg-[#241a13] p-2.5 border border-[#4d3623] text-xs font-mono">
            <span className="text-[#e6c29c] font-bold">
              {totalEntriesCount} GHI CHÚ ĐÃ LƯU TRONG SỔ TAY
            </span>
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playPaperRustle()
                try {
                  localStorage.removeItem('veritas_custom_notes')
                } catch {}
                onResetProgress()
              }}
              className="text-[0.65rem] font-mono font-bold text-[#b5a08d] hover:text-[#d9a066] transition-colors cursor-pointer"
            >
              [ 🔄 LÀM LẠI ]
            </button>
          </div>

          {/* INPUT FORM ON AGED PAPER BACKGROUND */}
          <form onSubmit={handleVerifyInput} className="space-y-2.5">
            <div className="flex flex-col gap-2">
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value)
                  if (matchStatus !== 'idle') setMatchStatus('idle')
                }}
                placeholder="Nhập bất kỳ phán đoán, quan sát hoặc suy luận nào của bạn vào sổ tay..."
                className="w-full bg-[#241a13] border border-[#523d2b] focus:border-[#d9a066] text-xs text-[#f4e8d8] placeholder:text-[#8c7866] p-3 font-mono focus:outline-none transition-colors shadow-inner resize-none"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isAnalyzing}
                className="w-full py-2.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
              >
                {isAnalyzing ? (
                  <>
                    <Search className="size-3.5 animate-spin text-[#1a0f07]" />
                    <span>ĐANG ĐỐI SOÁT...</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="size-3.5" />
                    <span>GHI VÀO SỔ TAY</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* DISCOVERED FINDINGS & CUSTOM NOTES CARDS */}
          <div className="space-y-2 pt-2">
            <span className="font-mono text-[0.65rem] text-[#c9b3a0] uppercase font-bold block">
              Trang nhật ký ghi chép điều tra ({totalEntriesCount} mục):
            </span>

            {discoveredFindingsList.length === 0 && customNotes.length === 0 ? (
              <div className="p-5 bg-[#231a12] border border-dashed border-[#4d3725] text-center font-mono text-xs text-[#9e8876]">
                [ Trang sổ tay đang trống. Hãy nhập bất kỳ phán đoán hoặc ghi chú nào ở trên để lưu trữ vô hạn! ]
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* OFFICIAL VERIFIED FINDINGS */}
                {discoveredFindingsList.map((finding) => (
                  <div
                    key={finding.id}
                    className="p-3.5 bg-[#241a13] border border-[#4f3827] text-xs font-mono space-y-1.5 shadow-md relative overflow-hidden group hover:border-[#d9a066] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#f4e8d8] text-xs flex items-center gap-2 overflow-hidden">
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{finding.title}</span>
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {finding.isKeyFinding && (
                          <span className="border border-amber-500/80 text-amber-300 bg-amber-950/80 text-[0.6rem] font-bold px-2 py-0.5 rounded shadow-sm">
                            🔑 CHÌA KHÓA
                          </span>
                        )}
                        <span className="border border-red-800 text-red-300 bg-red-950/70 text-[0.6rem] font-bold px-2 py-0.5 rotate-[-2deg] rounded shadow-sm">
                          🔴 ĐÃ XÁC MINH
                        </span>
                      </div>
                    </div>

                    <p className="text-[0.725rem] text-[#d6c4b4] leading-relaxed font-sans pl-5">
                      {finding.description}
                    </p>

                    <div className="pl-5 text-[0.625rem] text-[#d9a066] font-mono flex items-center justify-between border-t border-[#382619] pt-1.5 mt-1">
                      <span>📑 Căn cứ tài liệu: {finding.evidenceRef}</span>
                      <span className="text-[#a38e7c]">[GIAI ĐOẠN {finding.phase}]</span>
                    </div>
                  </div>
                ))}

                {/* CUSTOM PERSONAL NOTES */}
                {customNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-[#1e150f] border border-[#3e2b1d] text-xs font-mono space-y-1 shadow-sm relative overflow-hidden group hover:border-[#8c6239] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#e8d5c4] text-xs flex items-center gap-2">
                        <FileText className="size-3.5 text-[#d9a066] shrink-0" />
                        <span className="italic font-sans text-amber-100/90">"{note.text}"</span>
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="border border-[#523d2b] text-[#ad9885] bg-[#140e0a] text-[0.6rem] font-bold px-2 py-0.5 rounded">
                          📝 SUY LUẬN CÁ NHÂN
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteCustomNote(note.id)}
                          className="text-[#8c7866] hover:text-red-400 transition-colors p-0.5 cursor-pointer"
                          title="Xóa ghi chú này"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
