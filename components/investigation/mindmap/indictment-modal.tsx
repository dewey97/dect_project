'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gavel, ArrowRight, AlertTriangle } from 'lucide-react'
import { CASE_000_EVIDENCE } from '@/components/investigation/evidence/evidence-data'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

interface IndictmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitIndictment: (data: {
    culprit: 'vu' | 'tung'
    suspectName: string
    motive: string
    selectedClueIds: string[]
    reasoning: string
  }) => void
}

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

export function isCulpritValid(inputName: string): 'vu' | 'tung' | false {
  const norm = normalizeName(inputName)
  if (norm.includes('vu') || norm.includes('lequangvu')) {
    return 'vu'
  }
  if (norm.includes('tung') || norm.includes('nguyenthanhtung')) {
    return 'tung'
  }
  return false
}

export function IndictmentModal({
  isOpen,
  onClose,
  onSubmitIndictment
}: IndictmentModalProps) {
  const [suspectName, setSuspectName] = useState('')
  const [motive, setMotive] = useState('')
  const [selectedClueIds, setSelectedClueIds] = useState<string[]>([])
  const [reasoning, setReasoning] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const toggleClue = (clueId: string) => {
    detectiveAudio.playPaperRustle()
    setSelectedClueIds((prev) =>
      prev.includes(clueId) ? prev.filter((id) => id !== clueId) : [...prev, clueId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suspectName.trim()) {
      setErrorMsg('Vui lòng nhập Tên thủ phạm bị đề nghị truy tố!')
      detectiveAudio.playGlassSound()
      return
    }

    const culprit = isCulpritValid(suspectName)
    if (!culprit) {
      setErrorMsg('Kết luận không chính xác! Viện Kiểm sát đã bác bỏ bản cáo trạng này. Đối tượng phải là Lê Quang Vũ hoặc Nguyễn Thanh Tùng.')
      detectiveAudio.playGlassSound()
      return
    }

    if (selectedClueIds.length === 0) {
      setErrorMsg('Vui lòng tích chọn ít nhất 1 manh mối/chứng cứ!')
      detectiveAudio.playGlassSound()
      return
    }

    detectiveAudio.playStampSound()
    try {
      localStorage.setItem('veritas_indictment_solved', 'true')
      localStorage.setItem('veritas_indictment_culprit', culprit)
    } catch {}

    onSubmitIndictment({
      culprit,
      suspectName: suspectName.trim(),
      motive: motive.trim() || 'Động cơ điều tra trọng điểm',
      selectedClueIds,
      reasoning: reasoning.trim() || 'Căn cứ theo toàn bộ manh mối đã thu thập.'
    })
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-none overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* HEADER */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#7f1d1d] block">
                VIỆN KIỂM SÁT // CÁO TRẠNG TRUY TỐ
              </span>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1a120b] uppercase tracking-wide">
                BẢN ĐỀ NGHỊ TRUY TỐ THỦ PHẠM
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* FORM BODY */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5]">
            {errorMsg && (
              <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-red-800" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. SUSPECT NAME */}
            <div className="space-y-1.5 border-b border-[#2b1f14]/20 pb-4">
              <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                1. TÊN THỦ PHẠM BỊ TRUY TỐ: <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={suspectName}
                onChange={(e) => {
                  setSuspectName(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-4 py-2 text-base sm:text-lg text-[#0e2b5c] font-sans font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
                autoFocus
              />
            </div>

            {/* 2. MOTIVE */}
            <div className="space-y-1.5 border-b border-[#2b1f14]/20 pb-4">
              <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                2. ĐỘNG CƠ GÂY ÁN: <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={motive}
                onChange={(e) => {
                  setMotive(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-4 py-2 text-base text-[#0e2b5c] font-sans font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
              />
            </div>

            {/* 3. KEY EVIDENCE SELECTION */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                3. CHỨNG CỨ CỐT LÕI BUỘC TỘI:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {CASE_000_EVIDENCE.map((evidence) => {
                  const isChecked = selectedClueIds.includes(evidence.id)
                  return (
                    <button
                      key={evidence.id}
                      type="button"
                      onClick={() => toggleClue(evidence.id)}
                      className={cn(
                        'text-left p-2.5 rounded-none border-2 transition-all flex items-start gap-2.5 cursor-pointer relative select-none',
                        isChecked
                          ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] shadow-sm'
                          : 'bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]'
                      )}
                    >
                      <div
                        className={cn(
                          'size-4 rounded-none border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all bg-white',
                          isChecked ? 'border-[#2b1f14] text-[#0e2b5c]' : 'border-[#4a3520]'
                        )}
                      >
                        {isChecked && (
                          <span className="text-sm font-sans font-black leading-none select-none">
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <span className="text-xs font-bold text-[#1a120b] leading-snug truncate block">
                          {evidence.title}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 4. REASONING */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                4. LÝ LUẬN BUỘC TỘI & TÓM TẮT DIỄN TIẾN:
              </label>
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                rows={2}
                className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-3 py-2 text-sm text-[#0e2b5c] font-sans font-bold focus:outline-none focus:border-black transition-colors shadow-inner resize-none"
              />
            </div>

            {/* FOOTER */}
            <div className="pt-4 border-t-2 border-[#2b1f14]/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#dfd3bd] hover:bg-[#d4c5ab] border-2 border-[#4a3520] text-[#2b1f14] text-xs font-mono font-bold rounded-none transition-colors cursor-pointer"
              >
                HỦY
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-800 hover:bg-red-900 text-[#fff5f5] font-mono font-black text-xs tracking-wider rounded-none transition-all flex items-center gap-2 shadow-lg active:scale-98 cursor-pointer uppercase border-2 border-[#450a0a]"
              >
                <Gavel className="size-4" />
                <span>★ GỬI CÁO TRẠNG ★</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
