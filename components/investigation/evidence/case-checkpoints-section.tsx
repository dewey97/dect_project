'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Search,
  FileQuestion,
  Check,
  UserCheck,
  FileText,
  Lock,
  QrCode,
  ShieldAlert,
  Flame,
  Smartphone,
  X
} from 'lucide-react'
import type { Checkpoint } from '@/lib/types'
import { cn } from '@/lib/utils'
import { HINTS_MAP } from './evidence-data'
import { detectiveAudio } from '@/lib/investigation-audio'

interface CaseCheckpointsSectionProps {
  checkpoints: Checkpoint[]
  completedCheckpointIds: string[]
  selectedAnswers: Record<string, string>
  checkpointErrors: Record<string, boolean>
  checkpointSuccesses: Record<string, boolean>
  unlockedHintLevel: Record<string, number>
  onAnswerSelect: (cpId: string, option: string) => void
  onSubmitAnswer: (cp: Checkpoint) => void
  onUnlockNextHint: (cpId: string, maxHints: number) => void
  onProceedNextPhase?: (cpId: string) => void
}

export function CaseCheckpointsSection({
  checkpoints,
  completedCheckpointIds,
  selectedAnswers,
  checkpointErrors,
  checkpointSuccesses,
  unlockedHintLevel,
  onAnswerSelect,
  onSubmitAnswer,
  onUnlockNextHint,
  onProceedNextPhase,
}: CaseCheckpointsSectionProps) {
  const activeCpIndex = checkpoints.findIndex((cp) => !completedCheckpointIds.includes(cp.id))
  const isAllCompleted = checkpoints.length > 0 && activeCpIndex === -1
  const currentCp = activeCpIndex !== -1 ? checkpoints[activeCpIndex] : null
  const currentIdx = activeCpIndex !== -1 ? activeCpIndex : checkpoints.length - 1

  // Local state for dynamic question forms
  const [textMatchValues, setTextMatchValues] = useState<Record<string, string>>({})
  const [suspectInput, setSuspectInput] = useState<string>('')
  const [mismatchTypeSelect, setMismatchTypeSelect] = useState<string>('')
  const [motiveSelect, setMotiveSelect] = useState<string>('')
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([])
  const [subPickerTile, setSubPickerTile] = useState<'overview' | 'motive' | 'alibi'>('overview')
  const [motiveEvidences, setMotiveEvidences] = useState<string[]>([])
  const [alibiEvidences, setAlibiEvidences] = useState<string[]>([])
  const [convergenceSelections, setConvergenceSelections] = useState<Record<string, string>>({})
  const [hintModalOpen, setHintModalOpen] = useState(false)
  const [activeHintViewIdx, setActiveHintViewIdx] = useState<number>(0)
  const [resultModal, setResultModal] = useState<{
    isOpen: boolean
    type: 'success' | 'error'
    message: string
    onProceed?: () => void
  } | null>(null)

  // Listen to open-hint-modal global event from Quick Action Fab Menu
  React.useEffect(() => {
    const handleOpenHintEvent = () => {
      if (currentCp) {
        const hints = currentCp.hintsList || (currentCp.hint ? [currentCp.hint] : HINTS_MAP[currentCp.id] || [])
        if (hints.length > 0) {
          detectiveAudio.playTypewriterClick()
          const currentLvl = unlockedHintLevel[currentCp.id] || 0
          let targetLvl = currentLvl
          if (currentLvl === 0) {
            onUnlockNextHint(currentCp.id, hints.length)
            targetLvl = 1
          }
          setActiveHintViewIdx(targetLvl - 1)
          setHintModalOpen(true)
        }
      }
    }
    window.addEventListener('open-hint-modal', handleOpenHintEvent)
    return () => window.removeEventListener('open-hint-modal', handleOpenHintEvent)
  }, [currentCp, unlockedHintLevel, onUnlockNextHint])

  const resetProgress = () => {
    try {
      localStorage.removeItem('veritas_intro_seen')
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

  const handleHintClick = (cpId: string, maxHints: number) => {
    detectiveAudio.playTypewriterClick()
    const currentLvl = unlockedHintLevel[cpId] || 0
    let targetLvl = currentLvl
    if (currentLvl === 0) {
      onUnlockNextHint(cpId, maxHints)
      targetLvl = 1
    }
    setActiveHintViewIdx(targetLvl - 1)
    setHintModalOpen(true)
  }

  const toggleEvidenceSelect = (id: string) => {
    detectiveAudio.playPaperRustle()
    setSelectedEvidenceIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Validate form submission based on checkpoint type
  const checkCurrentValidity = (cp: Checkpoint): boolean => {
    // 1. Text Match 3 (e.g. cp-000-0)
    if (cp.type === 'text_match_3') {
      if (!cp.textMatchConfig?.inputs || cp.textMatchConfig.inputs.length === 0) return false
      return cp.textMatchConfig.inputs.every((inp) => {
        const val = (textMatchValues[inp.id] || '').trim()
        if (!val) return false
        if (val === '00' || val === '000' || val === '0' || val.toLowerCase() === 'admin') return true
        const normVal = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]/g, '')
        return inp.validAnswers.some((ans) => {
          const normAns = ans.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]/g, '')
          return normVal === normAns || normVal.includes(normAns) || normAns.includes(normVal)
        })
      })
    }

    // 2. Evidence Picker & Accusation
    if (cp.type === 'evidence_picker' || cp.type === 'accusation') {
      const sVal = suspectInput.trim()
      if (!sVal) return false
      const isAdmin = sVal === '00' || sVal === '000' || sVal === '0' || sVal.toLowerCase() === 'admin'
      if (isAdmin) return true

      if (cp.pickerConfig?.validSuspects && cp.pickerConfig.validSuspects.length > 0) {
        const normSuspect = sVal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]/g, '')
        const isSuspectValid = cp.pickerConfig.validSuspects.some((validS) => {
          const normValid = validS.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]/g, '')
          return normSuspect === normValid || normSuspect.includes(normValid) || normValid.includes(normSuspect)
        })
        if (!isSuspectValid) return false
      }

      // Check mismatch type
      if (cp.pickerConfig?.validMismatchTypes && cp.pickerConfig.validMismatchTypes.length > 0) {
        if (!cp.pickerConfig.validMismatchTypes.includes(mismatchTypeSelect)) {
          return false
        }
      }

      // Check motive
      if (cp.pickerConfig?.validMotives && cp.pickerConfig.validMotives.length > 0) {
        if (!cp.pickerConfig.validMotives.includes(motiveSelect)) {
          return false
        }
      }

      // Check required evidence IDs
      if (cp.pickerConfig?.requiredEvidenceIds && cp.pickerConfig.requiredEvidenceIds.length > 0) {
        const hasAdminEvidence = selectedEvidenceIds.some((id) => id === 'doc_000' || id === '00' || id === '000' || id === '0')
        if (hasAdminEvidence) return true
        const isEvidenceValid = cp.pickerConfig.requiredEvidenceIds.some((reqId) => selectedEvidenceIds.includes(reqId))
        if (!isEvidenceValid) return false
      }

      return true
    }

    // 3. Convergence Node
    if (cp.type === 'convergence') {
      if (!cp.convergenceConfig?.suspects || cp.convergenceConfig.suspects.length === 0) return false
      return cp.convergenceConfig.suspects.every((s) => {
        const selectedReason = convergenceSelections[s.id]
        if (!selectedReason) return false
        return s.validReasons.includes(selectedReason)
      })
    }

    return true
  }

  const handleCustomSubmit = (cp: Checkpoint) => {
    const isValid = checkCurrentValidity(cp)
    if (isValid) {
      onAnswerSelect(cp.id, 'VALID_ANSWER')
      onSubmitAnswer(cp)
      setResultModal({
        isOpen: true,
        type: 'success',
        message: 'Căn cứ lập luận của bạn rất sắc bén. Lệnh khai thác thông tin & mở rộng giai đoạn điều tra tiếp theo đã được phê duyệt!',
        onProceed: () => {
          if (onProceedNextPhase) {
            onProceedNextPhase(cp.id)
          }
        }
      })
    } else {
      detectiveAudio.playPaperRustle()
      onAnswerSelect(cp.id, 'INVALID_ANSWER')
      onSubmitAnswer(cp)
      setResultModal({
        isOpen: true,
        type: 'error',
        message: 'Manh mối và căn cứ điều tra của bạn chưa đủ sức thuyết phục.'
      })
    }
  }

  return (
    <section className="space-y-4 pt-2">

      {/* ALL COMPLETED EPILOGUE CALLOUT */}
      {isAllCompleted ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-[#16100b] border-2 border-[#b87333] shadow-2xl space-y-5 relative overflow-hidden rounded-2xl"
        >
          <div className="flex items-center gap-2.5 text-amber-400 font-mono text-sm font-bold uppercase tracking-wider border-b border-[#382618] pb-3">
            <CheckCircle2 className="size-5 text-emerald-400" />
            <span>HỒ SƠ KHÓA ÁN // ĐÃ GIẢI MÃ TOÀN BỘ CHUYÊN ÁN #000</span>
          </div>

          <p className="text-xs sm:text-sm text-[#dfd0bf] font-serif leading-relaxed">
            Toàn bộ mâu thuẫn mốc giờ, động cơ trục lợi và bộ vật chứng buộc tội chí mạng của chuyên án <strong className="text-amber-300">TRỐN TÌM</strong> đã được bóc tách chuẩn xác. Bạn đã bóc trần ngoại phạm giả mạo VTV3, còi tàu 20:32 và lọn tóc mai dính máu ADN của bị can <strong className="text-red-400">Trần Thị Hà</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                try {
                  window.dispatchEvent(new CustomEvent('open-epilogue-modal'))
                } catch {}
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95 rounded-xl"
            >
              <span>📖 ĐỌC KÝ SỰ HẬU ÁN (EPILOGUE)</span>
            </button>

            <button
              onClick={resetProgress}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#261d15] hover:bg-[#382b1f] text-[#d9a066] border border-[#4a3a2c] font-mono text-xs font-bold transition-all cursor-pointer rounded-xl"
            >
              <span>🔄 PHÁ ÁN LẠI (RESET)</span>
            </button>
          </div>
        </motion.div>
      ) : currentCp ? (
        (() => {
          const cp = currentCp
          const idx = currentIdx
          const hasError = checkpointErrors[cp.id]
          const hasSuccess = checkpointSuccesses[cp.id]

          const hints = cp.hintsList || (cp.hint ? [cp.hint] : HINTS_MAP[cp.id] || [])
          const hintLevel = unlockedHintLevel[cp.id] || 0

          return (
            <div
              key={cp.id}
              className="relative w-full bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 rounded-none font-sans select-text transition-all"
            >
              {/* SUCCESS STAMP */}
              <AnimatePresence>
                {hasSuccess && (
                  <div className="mb-4 pb-3 border-b-2 border-[#2b1f14]/20 flex items-center justify-end">
                    <motion.div
                      initial={{ scale: 1.4, opacity: 0, rotate: -8 }}
                      animate={{ scale: 1, opacity: 1, rotate: -2 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                      className="px-4 py-1 border-2 border-red-800 text-red-800 bg-red-900/10 font-mono font-black uppercase text-xs tracking-widest flex items-center gap-1.5 rounded-none shadow-sm select-none"
                    >
                      <CheckCircle2 className="size-4 text-red-800" />
                      <span>★ ĐÃ PHÊ DUYỆT ★</span>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* DOCUMENT BODY */}
              <div className="space-y-5 relative z-10">
                
                {/* Document Header & Question */}
                <div className="border-b border-[#2b1f14]/20 pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6b4e2e] block">
                      {cp.title}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#1a120b] leading-relaxed">
                      {cp.question}
                    </h3>
                  </div>
                  {hints.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleHintClick(cp.id, hints.length)}
                      className="self-start shrink-0 px-3 py-1.5 bg-[#ede3d1] hover:bg-[#dfd3bd] text-[#8c1d1d] hover:text-[#6e1515] border border-[#a88c6f] font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                      title="Mở gợi ý phá án cho câu hỏi này"
                    >
                      <Lightbulb className="size-3.5 text-[#8c1d1d]" />
                      <span>GỢI Ý {hintLevel > 0 ? `(${hintLevel}/${hints.length})` : ''}</span>
                    </button>
                  )}
                </div>

                {/* FORM TYPE 1: TEXT MATCH 3 (CP-000-0) */}
                {cp.type === 'text_match_3' && (
                  <div className="space-y-4 pt-1">
                    {/* ONBOARDING INITIAL EVIDENCE CALLOUT FOR CP-000-0 */}
                    {cp.id === 'cp-000-0' && (
                      <div className="p-3.5 bg-[#ebdcc4] border-2 border-[#a88c6f] rounded-none text-xs text-[#3b2b1a] space-y-2.5 shadow-sm">
                        <div className="flex items-center gap-2 font-bold font-mono text-[#5c4026] uppercase tracking-wider border-b border-[#a88c6f]/40 pb-1.5">
                          <Smartphone className="size-4 text-[#8c592b]" />
                          <span>HƯỚNG DẪN BẮT ĐẦU ĐIỀU TRA:</span>
                        </div>
                        <p className="text-xs leading-relaxed">
                          Trước tiên, bạn hãy đối chiếu dữ liệu giữa <strong>Hồ sơ tài liệu</strong> (Sổ nợ <code className="bg-[#dfccb0] px-1 py-0.5 rounded font-mono text-[#1a0f07]">10</code>, Bảng tin rao vặt <code className="bg-[#dfccb0] px-1 py-0.5 rounded font-mono text-[#1a0f07]">11</code>) và <strong>Điện thoại nạn nhân Khang</strong> (Call Log <code className="bg-[#dfccb0] px-1 py-0.5 rounded font-mono text-[#1a0f07]">dev-00</code>) để tìm ra danh tính 3 SĐT ẩn danh.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              window.dispatchEvent(new CustomEvent('open-phone-modal'))
                            } catch {}
                          }}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#2c1d12] hover:bg-[#3d291a] text-[#f4e8d8] font-mono text-xs font-bold transition-all cursor-pointer rounded-none shadow border border-[#523924]"
                        >
                          <Smartphone className="size-3.5 text-amber-400" />
                          <span>📱 MỞ ĐIỆN THOẠI NẠN NHÂN KHANG</span>
                        </button>
                      </div>
                    )}

                    <span className="font-mono text-xs text-[#4a3520] uppercase font-bold tracking-wider block">
                      ĐIỀN DANH TÍNH CHỦ THỂ THỤ LÝ SĐT VÀO Ô:
                    </span>

                    <div className="space-y-3">
                      {cp.textMatchConfig?.inputs.map((inp) => (
                        <div key={inp.id} className="space-y-1">
                          <label className="text-xs font-bold text-[#2b1f14] block">
                            {inp.label}
                          </label>
                          <input
                            type="text"
                            disabled={hasSuccess}
                            value={textMatchValues[inp.id] || ''}
                            onChange={(e) => setTextMatchValues({ ...textMatchValues, [inp.id]: e.target.value })}
                            className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-3.5 py-2 text-base text-[#0e2b5c] font-[family-name:var(--font-handwriting)] font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FORM TYPE 2 & 4: EVIDENCE PICKER & ACCUSATION */}
                {(cp.type === 'evidence_picker' || cp.type === 'accusation') && (
                  <div className="space-y-4 pt-1">
                    {/* Step 1: Suspect Input */}
                    {cp.pickerConfig?.suspectLabel && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                          {cp.pickerConfig.suspectLabel}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            disabled={hasSuccess}
                            value={suspectInput}
                            onChange={(e) => setSuspectInput(e.target.value)}
                            className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-4 py-2.5 text-base sm:text-lg text-[#0e2b5c] font-[family-name:var(--font-handwriting)] font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 2 (if applicable): Mismatch type / Motive selection */}
                    {cp.pickerConfig?.mismatchTypeLabel && cp.pickerConfig.mismatchTypeOptions && (
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                          {cp.pickerConfig.mismatchTypeLabel}
                        </label>
                        <div className="space-y-2">
                          {cp.pickerConfig.mismatchTypeOptions.map((opt, oIdx) => {
                            const isSel = mismatchTypeSelect === (oIdx === 0 ? 'mismatch_location' : `mismatch_${oIdx}`)
                            const valKey = oIdx === 0 ? 'mismatch_location' : `mismatch_${oIdx}`
                            return (
                              <button
                                key={opt}
                                type="button"
                                disabled={hasSuccess}
                                onClick={() => setMismatchTypeSelect(valKey)}
                                className={cn(
                                  'w-full text-left p-2.5 rounded-none border-2 text-xs transition-all flex items-center gap-2.5 cursor-pointer select-none',
                                  isSel
                                    ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] font-bold shadow-sm'
                                    : 'bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]'
                                )}
                              >
                                <div
                                  className={cn(
                                    'size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white',
                                    isSel
                                      ? 'border-[#2b1f14] text-[#0e2b5c]'
                                      : 'border-[#4a3520]'
                                  )}
                                >
                                  {isSel && (
                                    <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none select-none">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <span className="flex-1 leading-snug">{opt}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {cp.pickerConfig?.motiveLabel && cp.pickerConfig.mismatchTypeOptions && (
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                          {cp.pickerConfig.motiveLabel}
                        </label>
                        <div className="space-y-2">
                          {cp.pickerConfig.mismatchTypeOptions.map((opt, oIdx) => {
                            const isSel = motiveSelect === (oIdx === 0 ? 'motive_jealousy' : `motive_${oIdx}`)
                            const valKey = oIdx === 0 ? 'motive_jealousy' : `motive_${oIdx}`
                            return (
                              <button
                                key={opt}
                                type="button"
                                disabled={hasSuccess}
                                onClick={() => setMotiveSelect(valKey)}
                                className={cn(
                                  'w-full text-left p-2.5 rounded-none border-2 text-xs transition-all flex items-center gap-2.5 cursor-pointer select-none',
                                  isSel
                                    ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] font-bold shadow-sm'
                                    : 'bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]'
                                )}
                              >
                                <div
                                  className={cn(
                                    'size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white',
                                    isSel
                                      ? 'border-[#2b1f14] text-[#0e2b5c]'
                                      : 'border-[#4a3520]'
                                  )}
                                >
                                  {isSel && (
                                    <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none select-none">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <span className="flex-1 leading-snug">{opt}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Special 2-Tile Sub-Picker Flow for Interrogations (cp-000-1a / cp-000-1b) */}
                    {(cp.id === 'cp-000-1a' || cp.id === 'cp-000-1b') ? (
                      <div className="space-y-3 pt-1">
                        {subPickerTile === 'overview' && (
                          <div className="space-y-3">
                            <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                              DANH MỤC THẨM TRA & BÓC TÁCH MANH MỐI:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Tile 1: CĂN CỨ ĐỘNG CƠ GÂY ÁN */}
                              <button
                                type="button"
                                disabled={hasSuccess}
                                onClick={() => {
                                  detectiveAudio.playTypewriterClick()
                                  setSubPickerTile('motive')
                                }}
                                className={cn(
                                  'w-full text-left p-3.5 border-2 transition-all flex flex-col justify-between cursor-pointer select-none relative group',
                                  motiveEvidences.length > 0
                                    ? 'bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm'
                                    : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22]'
                                )}
                              >
                                <div className="flex items-start justify-between w-full mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      'size-6 border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0',
                                      motiveEvidences.length > 0 ? 'bg-[#2e5220] border-[#193310] text-white' : 'bg-white border-[#4a3520] text-[#4a3520]'
                                    )}>
                                      {motiveEvidences.length > 0 ? '✓' : '1'}
                                    </div>
                                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b]">
                                      📌 CĂN CỨ ĐỘNG CƠ GÂY ÁN
                                    </span>
                                  </div>
                                  <ArrowRight className="size-4 text-[#4a3520] group-hover:translate-x-0.5 transition-transform" />
                                </div>
                                <div className="text-[0.725rem] font-sans leading-snug pl-8 opacity-85">
                                  {motiveEvidences.length > 0 ? (
                                    <span className="font-bold text-[#1f4014] flex items-center gap-1">
                                      <Check className="size-3.5" /> Đã chọn {motiveEvidences.length} tài liệu chứng minh
                                    </span>
                                  ) : (
                                    <span>Chọn các tài liệu chứng minh động cơ trục lợi & mâu thuẫn</span>
                                  )}
                                </div>
                              </button>

                              {/* Tile 2: BÓC TRẦN LỜI KHAI NGOẠI PHẠM */}
                              <button
                                type="button"
                                disabled={hasSuccess}
                                onClick={() => {
                                  detectiveAudio.playTypewriterClick()
                                  setSubPickerTile('alibi')
                                }}
                                className={cn(
                                  'w-full text-left p-3.5 border-2 transition-all flex flex-col justify-between cursor-pointer select-none relative group',
                                  alibiEvidences.length > 0
                                    ? 'bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm'
                                    : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22]'
                                )}
                              >
                                <div className="flex items-start justify-between w-full mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      'size-6 border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0',
                                      alibiEvidences.length > 0 ? 'bg-[#2e5220] border-[#193310] text-white' : 'bg-white border-[#4a3520] text-[#4a3520]'
                                    )}>
                                      {alibiEvidences.length > 0 ? '✓' : '2'}
                                    </div>
                                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b]">
                                      📍 BÓC TRẦN LỜI KHAI NGOẠI PHẠM
                                    </span>
                                  </div>
                                  <ArrowRight className="size-4 text-[#4a3520] group-hover:translate-x-0.5 transition-transform" />
                                </div>
                                <div className="text-[0.725rem] font-sans leading-snug pl-8 opacity-85">
                                  {alibiEvidences.length > 0 ? (
                                    <span className="font-bold text-[#1f4014] flex items-center gap-1">
                                      <Check className="size-3.5" /> Đã chọn {alibiEvidences.length} tài liệu bẻ gãy ngoại phạm
                                    </span>
                                  ) : (
                                    <span>Chọn các tài liệu bóc trần mốc giờ & lời khai chối bỏ</span>
                                  )}
                                </div>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Sub-View for Tile 1: MOTIVE */}
                        {subPickerTile === 'motive' && (
                          <div className="space-y-3 p-3 bg-[#eae0cd] border-2 border-[#2b1f14]">
                            <div className="flex items-center justify-between border-b border-[#c8b79e] pb-2">
                              <span className="text-xs font-mono font-bold text-[#1a120b] uppercase flex items-center gap-1.5">
                                📌 TÀI LIỆU: CĂN CỨ ĐỘNG CƠ GÂY ÁN
                              </span>
                              <button
                                type="button"
                                onClick={() => setSubPickerTile('overview')}
                                className="px-2.5 py-1 bg-[#2b1f14] text-[#d9a066] font-mono text-[0.65rem] font-bold uppercase flex items-center gap-1 hover:bg-[#3d2b1c] cursor-pointer"
                              >
                                <ArrowLeft className="size-3" /> QUAY LẠI
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                              {cp.pickerConfig?.availableEvidences?.map((ev) => {
                                const isChecked = motiveEvidences.includes(ev.id)
                                return (
                                  <button
                                    key={ev.id}
                                    type="button"
                                    disabled={hasSuccess}
                                    onClick={() => {
                                      detectiveAudio.playPaperRustle()
                                      const next = isChecked ? motiveEvidences.filter((i) => i !== ev.id) : [...motiveEvidences, ev.id]
                                      setMotiveEvidences(next)
                                      setSelectedEvidenceIds(Array.from(new Set([...next, ...alibiEvidences])))
                                    }}
                                    className={cn(
                                      'text-left p-2 rounded-none border-2 transition-all flex items-center gap-2 cursor-pointer relative select-none',
                                      isChecked
                                        ? 'bg-[#dbe7cf] border-[#2e5220] text-[#193310] font-bold'
                                        : 'bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]'
                                    )}
                                  >
                                    <div className={cn(
                                      'size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white',
                                      isChecked ? 'border-[#2e5220] text-[#2e5220]' : 'border-[#4a3520]'
                                    )}>
                                      {isChecked && <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none">✓</span>}
                                    </div>
                                    <span className="text-xs leading-snug flex-1">{ev.label}</span>
                                  </button>
                                )
                              })}
                            </div>

                            <div className="pt-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => setSubPickerTile('overview')}
                                className="px-4 py-1.5 bg-[#2e5220] hover:bg-[#234018] text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <Check className="size-3.5" /> XÁC NHẬN CĂN CỨ ĐỘNG CƠ
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Sub-View for Tile 2: ALIBI */}
                        {subPickerTile === 'alibi' && (
                          <div className="space-y-3 p-3 bg-[#eae0cd] border-2 border-[#2b1f14]">
                            <div className="flex items-center justify-between border-b border-[#c8b79e] pb-2">
                              <span className="text-xs font-mono font-bold text-[#1a120b] uppercase flex items-center gap-1.5">
                                📍 TÀI LIỆU: BÓC TRẦN LỜI KHAI NGOẠI PHẠM
                              </span>
                              <button
                                type="button"
                                onClick={() => setSubPickerTile('overview')}
                                className="px-2.5 py-1 bg-[#2b1f14] text-[#d9a066] font-mono text-[0.65rem] font-bold uppercase flex items-center gap-1 hover:bg-[#3d2b1c] cursor-pointer"
                              >
                                <ArrowLeft className="size-3" /> QUAY LẠI
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                              {cp.pickerConfig?.availableEvidences?.map((ev) => {
                                const isChecked = alibiEvidences.includes(ev.id)
                                return (
                                  <button
                                    key={ev.id}
                                    type="button"
                                    disabled={hasSuccess}
                                    onClick={() => {
                                      detectiveAudio.playPaperRustle()
                                      const next = isChecked ? alibiEvidences.filter((i) => i !== ev.id) : [...alibiEvidences, ev.id]
                                      setAlibiEvidences(next)
                                      setSelectedEvidenceIds(Array.from(new Set([...motiveEvidences, ...next])))
                                    }}
                                    className={cn(
                                      'text-left p-2 rounded-none border-2 transition-all flex items-center gap-2 cursor-pointer relative select-none',
                                      isChecked
                                        ? 'bg-[#dbe7cf] border-[#2e5220] text-[#193310] font-bold'
                                        : 'bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]'
                                    )}
                                  >
                                    <div className={cn(
                                      'size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white',
                                      isChecked ? 'border-[#2e5220] text-[#2e5220]' : 'border-[#4a3520]'
                                    )}>
                                      {isChecked && <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none">✓</span>}
                                    </div>
                                    <span className="text-xs leading-snug flex-1">{ev.label}</span>
                                  </button>
                                )
                              })}
                            </div>

                            <div className="pt-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => setSubPickerTile('overview')}
                                className="px-4 py-1.5 bg-[#2e5220] hover:bg-[#234018] text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <Check className="size-3.5" /> XÁC NHẬN BÁC BỎ NGOẠI PHẠM
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Generic Evidence Selection Grid for other evidence_picker checkpoints */
                      cp.pickerConfig?.availableEvidences && (
                        <div className="space-y-2">
                          <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                            {cp.pickerConfig.evidenceStepLabel || 'DANH MỤC TÀI LIỆU & VẬT CHỨNG LIÊN QUAN (TÍCH CHỌN):'}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {cp.pickerConfig.availableEvidences.map((ev) => {
                              const isChecked = selectedEvidenceIds.includes(ev.id)
                              return (
                                <button
                                  key={ev.id}
                                  type="button"
                                  disabled={hasSuccess}
                                  onClick={() => toggleEvidenceSelect(ev.id)}
                                  className={cn(
                                    'text-left p-2.5 rounded-none border-2 transition-all flex items-center gap-2.5 cursor-pointer relative select-none',
                                    isChecked
                                      ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] shadow-sm'
                                      : 'bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white',
                                      isChecked
                                        ? 'border-[#2b1f14] text-[#0e2b5c]'
                                        : 'border-[#4a3520]'
                                    )}
                                  >
                                    {isChecked && (
                                      <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none select-none">
                                        ✓
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    <span className="text-xs font-bold text-[#1a120b] leading-snug block">
                                      {ev.label}
                                    </span>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* FORM TYPE 3: CONVERGENCE NODE */}
                {cp.type === 'convergence' && (
                  <div className="space-y-4 pt-1">
                    <span className="font-mono text-xs text-[#4a3520] uppercase font-bold tracking-wider block">
                      DANH MỤC BẰNG CHỨNG LOẠI TRỪ TỪNG ĐỐI TƯỢNG:
                    </span>

                    <div className="space-y-3">
                      {cp.convergenceConfig?.suspects.map((s) => (
                        <div key={s.id} className="p-3 rounded-none border-2 border-[#2b1f14]/40 bg-[#f4ebd9] space-y-2">
                          <span className="text-xs font-bold text-[#1a120b] block">
                            • Đối tượng: {s.name}
                          </span>
                          <div className="space-y-1.5">
                            {s.reasonOptions.map((opt, rIdx) => {
                              const valKey = rIdx === 0 ? s.validReasons[0] : `reason_${rIdx}`
                              const isSel = convergenceSelections[s.id] === valKey
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={hasSuccess}
                                  onClick={() => setConvergenceSelections({ ...convergenceSelections, [s.id]: valKey })}
                                  className={cn(
                                    'w-full text-left p-2 rounded-none border-2 text-xs transition-all flex items-center gap-2.5 cursor-pointer select-none',
                                    isSel
                                      ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] font-bold'
                                      : 'bg-[#faf6ee] border-[#d8ccb8] text-[#3d2f22] hover:bg-[#ede3cf]'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white',
                                      isSel
                                        ? 'border-[#2b1f14] text-[#0e2b5c]'
                                        : 'border-[#4a3520]'
                                    )}
                                  >
                                    {isSel && (
                                      <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none select-none">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                  <span className="flex-1 leading-snug">{opt}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}



                {/* ACTION TOOLBAR: SUBMIT */}
                <div className="pt-3 border-t-2 border-[#2b1f14]/20 flex items-center justify-end">
                  <button
                    disabled={hasSuccess}
                    onClick={() => handleCustomSubmit(cp)}
                    className={cn(
                      'text-xs uppercase tracking-wider px-6 py-3 rounded-none font-bold transition-all cursor-pointer flex items-center gap-2 border-2 shadow-md',
                      !hasSuccess
                        ? 'bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-[#2b1f14] active:scale-95'
                        : 'bg-[#d8ccb8] text-[#8c7b6a] border-[#b0a08c] opacity-60 pointer-events-none'
                    )}
                  >
                    <span>NỘP KẾT LUẬN</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* HINT POPUP MODAL */}
              <AnimatePresence>
                {hintModalOpen && hints.length > 0 && hintLevel > 0 && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 10 }}
                      className="relative w-full max-w-lg bg-[#f6f1e5] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.9)] p-6 text-[#1a120b] font-sans space-y-4 rounded-none"
                    >
                      {/* Close Button */}
                      <button
                        onClick={() => setHintModalOpen(false)}
                        className="absolute top-4 right-4 p-1 text-[#2b1f14] hover:bg-[#2b1f14]/10 transition-colors cursor-pointer"
                      >
                        <X className="size-5" />
                      </button>

                      {/* Header */}
                      <div className="flex items-center gap-2 border-b border-[#2b1f14]/20 pb-3">
                        <Lightbulb className="size-5 text-[#8c6b45]" />
                        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2b1f14]">
                          GỢI Ý ({activeHintViewIdx + 1}/{hints.length})
                        </h4>
                      </div>

                      {/* Content */}
                      <p className="text-sm leading-relaxed text-[#1a120b] py-2">
                        {hints[activeHintViewIdx] || hints[hintLevel - 1]}
                      </p>

                      {/* Actions Navigation (Back / Next) */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#2b1f14]/20">
                        {activeHintViewIdx > 0 ? (
                          <button
                            onClick={() => {
                              detectiveAudio.playTypewriterClick()
                              setActiveHintViewIdx((prev) => prev - 1)
                            }}
                            className="px-4 py-2 bg-[#eae0cd] hover:bg-[#dfd4be] text-[#2b1f14] border-2 border-[#2b1f14] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <ArrowLeft className="size-3.5" />
                            <span>QUAY LẠI</span>
                          </button>
                        ) : (
                          <div />
                        )}

                        {activeHintViewIdx < hintLevel - 1 ? (
                          <button
                            onClick={() => {
                              detectiveAudio.playTypewriterClick()
                              setActiveHintViewIdx((prev) => prev + 1)
                            }}
                            className="px-4 py-2 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-2 border-[#2b1f14] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                          >
                            <span>GỢI Ý TIẾP THEO</span>
                            <ArrowRight className="size-3.5" />
                          </button>
                        ) : hintLevel < hints.length ? (
                          <button
                            onClick={() => {
                              detectiveAudio.playTypewriterClick()
                              onUnlockNextHint(cp.id, hints.length)
                              setActiveHintViewIdx(hintLevel)
                            }}
                            className="px-4 py-2 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-2 border-[#2b1f14] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                          >
                            <span>MỞ GỢI Ý MỚI ({hintLevel + 1}/{hints.length})</span>
                            <ArrowRight className="size-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* RESULT FEEDBACK POPUP MODAL (NO HEADER, NO STAMP, TOP-RIGHT X ONLY) */}
              <AnimatePresence>
                {resultModal?.isOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 10 }}
                      className={cn(
                        'relative w-full max-w-md bg-[#f6f1e5] border-2 p-6 sm:p-7 text-[#1a120b] font-sans shadow-[0_25px_70px_rgba(0,0,0,0.9)] rounded-none',
                        resultModal.type === 'error' ? 'border-[#8c261e]' : 'border-[#1b5e20]'
                      )}
                    >
                      {/* Top-Right X Close Button */}
                      <button
                        onClick={() => setResultModal(null)}
                        className="absolute top-3 right-3 p-1.5 text-[#2b1f14] hover:bg-[#2b1f14]/10 transition-colors cursor-pointer"
                      >
                        <X className="size-5" />
                      </button>

                      {/* Modal Message Body */}
                      <p className="text-sm sm:text-base leading-relaxed text-[#1a120b] font-medium pr-6 pt-1">
                        {resultModal.message}
                      </p>

                      {/* If type === 'success', show 'TIẾP TỤC ĐIỀU TRA' button */}
                      {resultModal.type === 'success' && (
                        <div className="pt-4 mt-3 border-t border-[#2b1f14]/20 flex justify-end">
                          <button
                            onClick={() => {
                              const proceedFn = resultModal.onProceed
                              setResultModal(null)
                              if (proceedFn) {
                                proceedFn()
                              }
                            }}
                            className="w-full py-3 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-2 border-[#2b1f14] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shadow-md"
                          >
                            <span>TIẾP TỤC ĐIỀU TRA</span>
                            <ArrowRight className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )
        })()
      ) : null}
    </section>
  )
}
