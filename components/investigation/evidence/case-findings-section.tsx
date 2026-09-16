'use client'

import React, { useState, useEffect } from 'react'
import { Search, CheckCircle2, BookOpen, Bookmark, FileText, Trash2, Edit3 } from 'lucide-react'
import { Finding } from '@/content/cases/case-000/findings'
import { findMatchingFinding } from '@/lib/finding-matcher'
import { detectiveAudio } from '@/lib/investigation-audio'

export interface CustomNote {
  id: string
  text: string
  createdAt: string
}

interface CaseFindingsSectionProps {
  currentPhase: number
  allFindings: Finding[]
  discoveredFindingIds: string[]
  onFindingDiscovered: (finding: Finding) => void
  onResetProgress: () => void
}

export function CaseFindingsSection({
  currentPhase,
  allFindings,
  discoveredFindingIds,
  onFindingDiscovered,
  onResetProgress,
}: CaseFindingsSectionProps) {
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
          findings: allUndiscovered
        })
      })

      const data = await res.json()
      let matched: Finding | null = null

      if (data.matched && data.findingId) {
        matched = allFindings.find((f) => f.id === data.findingId) || null
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

  return (
    <section className="pt-4 border-t border-[#3d2c1e]">
      {/* PHYSICAL VINTAGE DETECTIVE LEATHER JOURNAL CONTAINER */}
      <div className="bg-[#17100b] border-2 border-[#5c4028] shadow-2xl p-4 sm:p-5 relative overflow-hidden space-y-4">
        
        {/* LEATHER BORDER STITCHING EFFECT */}
        <div className="absolute inset-1 border border-dashed border-[#8c6239]/40 pointer-events-none" />

        {/* BOOKMARK TAB IN CORNER */}
        <div className="absolute top-0 right-6 bg-[#8c2518] text-[#f4e8d8] font-mono text-[0.6rem] font-bold px-2 py-1 flex items-center gap-1 shadow-md z-10 border-b border-x border-[#61160d]">
          <Bookmark className="size-3 fill-amber-200 text-amber-200" />
          <span>SỔ TAY NGUYÊN BẢN</span>
        </div>

        {/* SECTION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#4d3623] pb-3 gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-[#d9a066]" />
            <div>
              <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#f4e8d8]">
                📓 SỔ TAY GHI CHÉP VÔ HẠN ĐIỀU TRA VIÊN
              </h2>
              <p className="text-[0.65rem] font-sans text-[#a38f7e]">
                Ghi chép tự do mọi phán đoán, quan sát & manh mối trong vụ án
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-[0.65rem] text-[#e6c29c] font-bold bg-[#261b12] px-2.5 py-1 border border-[#523c28] shadow-inner">
              {discoveredFindingsList.length + customNotes.length} GHI CHÚ ĐÃ LƯU
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
        </div>

        {/* INPUT FORM ON AGED PAPER BACKGROUND */}
        <form onSubmit={handleVerifyInput} className="space-y-2.5 relative z-10">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value)
                  if (matchStatus !== 'idle') setMatchStatus('idle')
                }}
                placeholder="Nhập bất kỳ phán đoán, ghi chú hoặc suy luận nào của bạn vào sổ tay..."
                className="w-full bg-[#241a13] border border-[#523d2b] focus:border-[#d9a066] text-xs text-[#f4e8d8] placeholder:text-[#8c7866] px-3.5 py-2.5 font-mono focus:outline-none transition-colors shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isAnalyzing}
              className="px-4 py-2.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 shrink-0"
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

          {/* STATUS FEEDBACK */}
          {matchStatus === 'verified' && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-700/80 text-emerald-200 text-xs font-mono flex items-center gap-2 shadow-sm">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
              <span>
                XÁC NHẬN CHÍNH XÁC! Đã ghi nhận manh mối mấu chốt: <strong>{lastDiscoveredTitle}</strong>
              </span>
            </div>
          )}

          {matchStatus === 'custom_note' && (
            <div className="p-2.5 bg-amber-950/50 border border-amber-700/70 text-amber-200 text-xs font-mono flex items-center gap-2 shadow-sm">
              <FileText className="size-4 shrink-0 text-amber-400" />
              <span>Đã lưu suy luận cá nhân vào sổ tay ghi chép!</span>
            </div>
          )}

          {matchStatus === 'already' && (
            <div className="p-2.5 bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs font-mono flex items-center gap-2 shadow-sm">
              <FileText className="size-4 shrink-0 text-amber-400" />
              <span>Manh mối này đã được khám phá và lưu trong sổ tay rồi!</span>
            </div>
          )}
        </form>

        {/* DISCOVERED FINDINGS & CUSTOM NOTES CARDS */}
        <div className="space-y-2 pt-2 relative z-10">
          <span className="font-mono text-[0.65rem] text-[#c9b3a0] uppercase font-bold block">
            Trang nhật ký ghi chép điều tra ({discoveredFindingsList.length + customNotes.length} mục):
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
    </section>
  )
}
