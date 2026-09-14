'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  Search,
  FileQuestion,
  Check,
  UserCheck,
  FileText,
  Lock,
  QrCode,
  ShieldAlert,
  Flame
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
}

interface PhaseVisualClue {
  imageUrl: string
  tag: string
  subtitle: string
  badgeColor: string
}

const PHASE_VISUAL_CLUES: Record<string, PhaseVisualClue> = {
  'cp-000-0': {
    imageUrl: '/photo_scene_overview.jpg',
    tag: 'GIAI ĐOẠN 0 // TRUY TÌM 3 SĐT ẨN DANH',
    subtitle: 'Nhật ký cuộc gọi dev-00 ghi nhận 3 cuộc gọi lạ từ Vũ, Tùng và Đạt Gà Chợ Cảng.',
    badgeColor: 'border-amber-700/80 bg-amber-950/90 text-amber-300'
  },
  'cp-000-1a': {
    imageUrl: '/photo_scattered_docs.jpg',
    tag: 'PHASE 1A // THẨM TRA LÊ QUANG VŨ',
    subtitle: 'Món nợ 300M biệt danh Lệch Pha và sơ hở app đặt xe p10 nán lại hiện trường 30 phút.',
    badgeColor: 'border-orange-700/80 bg-orange-950/90 text-orange-300'
  },
  'cp-000-1b': {
    imageUrl: '/photo_old_newspaper.jpg',
    tag: 'PHASE 1B // THẨM TRA NGUYỄN THANH TÙNG',
    subtitle: 'Vết vân tay ngón trỏ trên khung ảnh p4 và mẩu báo cũ 1996 về bi kịch tủ gỗ.',
    badgeColor: 'border-sky-700/80 bg-sky-950/90 text-sky-300'
  },
  'cp-000-convergence': {
    imageUrl: '/photo_childhood_group.jpg',
    tag: 'NÚT HỘI TỤ // LOẠI TRỪ 3 NGHI PHẠM BAN ĐẦU',
    subtitle: 'Mai có ngoại phạm TV đứt cáp, Vũ ở Quán Bia 88, Tùng tự thú bỏ đi lúc 20:15.',
    badgeColor: 'border-emerald-700/80 bg-emerald-950/90 text-emerald-300'
  },
  'cp-000-2a': {
    imageUrl: '/photo_glass_shard.jpg',
    tag: 'PHASE 2A // BÓC TRẦN TRẦN THỊ HÀ',
    subtitle: 'Tạp âm còi tàu 20:32 lọt vào voice note và lịch phát sóng VTV3 chỉ chiếu Gameshow.',
    badgeColor: 'border-rose-700/80 bg-rose-950/90 text-rose-300'
  },
  'cp-000-2b': {
    imageUrl: '/photo_glass_shard.jpg',
    tag: 'PHASE 2B // CÁO TRẠNG ĐỊNH TỘI CHÍ MẠNG',
    subtitle: 'Lọn tóc mai dính máu ADN Khang và áo gió dính phấn hoa xoan thu tại phòng Hà.',
    badgeColor: 'border-red-700/80 bg-red-950/90 text-red-300'
  }
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
  const [convergenceSelections, setConvergenceSelections] = useState<Record<string, string>>({})

  const resetProgress = () => {
    try {
      localStorage.removeItem('veritas_completed_checkpoints')
      window.location.reload()
    } catch {}
  }

  const handleHintClick = (cpId: string, maxHints: number) => {
    detectiveAudio.playTypewriterClick()
    onUnlockNextHint(cpId, maxHints)
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
    if (cp.type === 'text_match_3') {
      const inputs = cp.textMatchConfig?.inputs || []
      return inputs.every((inp) => {
        const val = (textMatchValues[inp.id] || '').trim().toLowerCase()
        return inp.validAnswers.some((ans) => ans.toLowerCase() === val || val.includes(ans.toLowerCase()))
      })
    }

    if (cp.type === 'evidence_picker') {
      const validSuspects = cp.pickerConfig?.validSuspects || []
      const suspectValid = suspectInput.trim() !== '' && (validSuspects.length === 0 || validSuspects.some((s) => suspectInput.trim().toLowerCase().includes(s.toLowerCase())))
      
      const reqEvs = cp.pickerConfig?.requiredEvidenceIds || []
      const evsValid = reqEvs.length === 0 || (reqEvs.every((req) => selectedEvidenceIds.includes(req)) && selectedEvidenceIds.length === reqEvs.length)

      const reqMismatch = cp.pickerConfig?.validMismatchTypes || []
      const mismatchValid = reqMismatch.length === 0 || reqMismatch.includes(mismatchTypeSelect)

      return suspectValid && evsValid && mismatchValid
    }

    if (cp.type === 'convergence') {
      const suspects = cp.convergenceConfig?.suspects || []
      return suspects.every((s) => {
        const selected = convergenceSelections[s.id]
        return s.validReasons.includes(selected)
      })
    }

    if (cp.type === 'accusation') {
      const validSuspects = cp.pickerConfig?.validSuspects || []
      const suspectValid = suspectInput.trim() !== '' && validSuspects.some((s) => suspectInput.trim().toLowerCase().includes(s.toLowerCase()))

      const validMotives = cp.pickerConfig?.validMotives || []
      const motiveValid = validMotives.length === 0 || validMotives.includes(motiveSelect)

      const reqEvs = cp.pickerConfig?.requiredEvidenceIds || []
      const evsValid = reqEvs.length === 0 || (reqEvs.every((req) => selectedEvidenceIds.includes(req)) && selectedEvidenceIds.length === reqEvs.length)

      return suspectValid && motiveValid && evsValid
    }

    // Default MCQ fallback
    return !!selectedAnswers[cp.id]
  }

  const handleCustomSubmit = (cp: Checkpoint) => {
    const isValid = checkCurrentValidity(cp)
    if (isValid) {
      onAnswerSelect(cp.id, 'VALID_ANSWER')
      onSubmitAnswer(cp)
    } else {
      detectiveAudio.playPaperRustle()
      onAnswerSelect(cp.id, 'INVALID_ANSWER')
      onSubmitAnswer(cp)
    }
  }

  return (
    <section className="space-y-4 pt-2">
      {/* SECTION TOP HEADER */}
      <div className="flex items-center justify-between border-b border-[#3d2c1e] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#261a11] border border-[#523d2b] text-[#d9a066]">
            <ShieldCheck className="size-4" />
          </div>
          <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#e6d3c1] flex items-center gap-2">
            <span>BẢN KẾT LUẬN THẨM TRA COMPANION</span>
            {!isAllCompleted && (
              <span className="text-[0.65rem] font-normal text-[#ad9885] bg-[#221810] px-2 py-0.5 border border-[#3e2c1e]">
                GIAI ĐOẠN {currentIdx + 1}/{checkpoints.length}
              </span>
            )}
          </h2>
        </div>

        <button
          type="button"
          onClick={resetProgress}
          className="text-[0.65rem] font-mono font-bold text-[#ad9885] hover:text-[#d9a066] transition-colors cursor-pointer flex items-center gap-1"
          title="Xóa tiến trình và thực hiện lại từ Giai đoạn 0"
        >
          <span>[ 🔄 LÀM LẠI TỪ ĐẦU ]</span>
        </button>
      </div>

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
          const visualClue = PHASE_VISUAL_CLUES[cp.id] || PHASE_VISUAL_CLUES['cp-000-0']

          return (
            <div
              key={cp.id}
              className="rounded-3xl p-1.5 sm:p-2 bg-[#25180f]/70 border border-[#543a26]/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all"
            >
              <div
                className={cn(
                  'rounded-2xl bg-[#140d08] border transition-all relative overflow-hidden flex flex-col',
                  hasError
                    ? 'border-red-600/80 ring-2 ring-red-500/40'
                    : hasSuccess
                    ? 'border-emerald-600/80 ring-2 ring-emerald-500/40'
                    : 'border-[#3e2b1b]'
                )}
              >
                {/* HERO VISUAL CLUE BANNER */}
                <div className="relative h-44 sm:h-52 w-full overflow-hidden border-b border-[#3e2b1b] group bg-black rounded-t-2xl">
                  <img
                    src={visualClue.imageUrl}
                    alt={visualClue.tag}
                    className="w-full h-full object-cover object-center filter contrast-115 brightness-90 saturate-85 group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                  
                  {/* Vignette Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140d08] via-[#140d08]/60 to-black/50" />
                  <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-15" />

                  {/* Top Clue Tag */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className={cn('px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-wider border rounded-lg shadow-md flex items-center gap-1.5 backdrop-blur-sm', visualClue.badgeColor)}>
                      <Search className="size-3" />
                      <span>{visualClue.tag}</span>
                    </span>
                  </div>

                  {/* Top Right Stage Badge */}
                  <div className="absolute top-3.5 right-3.5">
                    <span className="font-mono text-[0.625rem] text-[#d9a066] bg-[#140d08]/90 px-3 py-1 border border-[#523d2b] rounded-lg font-bold uppercase tracking-wider shadow-md backdrop-blur-sm">
                      CHUYÊN ÁN #000 // GĐ {idx}
                    </span>
                  </div>

                  {/* Bottom Subtitle / Context Note */}
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-3">
                    <p className="font-sans text-xs sm:text-sm text-[#fef5ec] italic drop-shadow-md line-clamp-2 leading-relaxed font-medium">
                      "{visualClue.subtitle}"
                    </p>
                  </div>

                  {/* RED APPROVAL STAMP (WHEN SUCCESSFUL) */}
                  <AnimatePresence>
                    {hasSuccess && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                        <motion.div
                          initial={{ scale: 2.5, opacity: 0, rotate: -25 }}
                          animate={{ scale: 1, opacity: 1, rotate: -7 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                          className="px-6 py-3 border-4 border-red-600 bg-red-950/85 text-red-400 font-mono font-black uppercase text-sm sm:text-base tracking-[0.25em] shadow-[0_0_35px_rgba(220,38,38,0.7)] flex items-center gap-2 rounded-xl backdrop-blur-sm"
                        >
                          <CheckCircle2 className="size-6 text-red-500" />
                          <span>★ ĐÃ PHÊ DUYỆT // VERIFIED ★</span>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* QUESTION BODY & DYNAMIC FORM */}
                <div className="p-5 sm:p-7 space-y-6">
                  {/* Question Title & Prompt */}
                  <div className="space-y-2">
                    <span className="font-mono text-[0.65rem] text-[#d9a066] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <FileQuestion className="size-3.5 text-[#d9a066]" />
                      {cp.title}
                    </span>
                    <h3 className="font-sans text-sm sm:text-base font-bold text-[#fef5ec] leading-relaxed">
                      {cp.question}
                    </h3>
                  </div>

                  {/* FORM TYPE 1: TEXT MATCH 3 (CP-000-0) */}
                  {cp.type === 'text_match_3' && (
                    <div className="space-y-4 pt-2 border-t border-[#382619]">
                      <span className="font-mono text-[0.625rem] text-[#a89583] uppercase font-bold tracking-wider block">
                        NHẬP DANH TÍNH 3 NGHI PHẠM CHỦ SỞ HỮU SĐT:
                      </span>

                      <div className="space-y-3">
                        {cp.textMatchConfig?.inputs.map((inp) => (
                          <div key={inp.id} className="space-y-1">
                            <label className="text-xs font-mono font-bold text-[#d9a066] block">
                              {inp.label}
                            </label>
                            <input
                              type="text"
                              disabled={hasSuccess}
                              value={textMatchValues[inp.id] || ''}
                              onChange={(e) => setTextMatchValues({ ...textMatchValues, [inp.id]: e.target.value })}
                              placeholder={inp.placeholder}
                              className="w-full bg-[#1c120a] border border-[#4d3522] focus:border-[#d9a066] rounded-xl px-4 py-2.5 text-xs text-[#fef5ec] font-sans placeholder-[#6e5a48] focus:outline-none transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FORM TYPE 2 & 4: EVIDENCE PICKER & ACCUSATION */}
                  {(cp.type === 'evidence_picker' || cp.type === 'accusation') && (
                    <div className="space-y-5 pt-2 border-t border-[#382619]">
                      {/* Step 1: Suspect Input */}
                      {cp.pickerConfig?.suspectLabel && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono font-bold text-[#d9a066] block uppercase tracking-wider">
                            {cp.pickerConfig.suspectLabel}
                          </label>
                          <input
                            type="text"
                            disabled={hasSuccess}
                            value={suspectInput}
                            onChange={(e) => setSuspectInput(e.target.value)}
                            placeholder="Nhập tên đối tượng nghi vấn (VD: Lê Quang Vũ, Nguyễn Thanh Tùng, Trần Thị Hà)..."
                            className="w-full bg-[#1c120a] border border-[#4d3522] focus:border-[#d9a066] rounded-xl px-4 py-2.5 text-xs text-[#fef5ec] font-sans placeholder-[#6e5a48] focus:outline-none transition-colors"
                          />
                        </div>
                      )}

                      {/* Step 2 (if applicable): Mismatch type / Motive selection */}
                      {cp.pickerConfig?.mismatchTypeLabel && cp.pickerConfig.mismatchTypeOptions && (
                        <div className="space-y-2">
                          <label className="text-xs font-mono font-bold text-[#d9a066] block uppercase tracking-wider">
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
                                    'w-full text-left p-3 rounded-xl border text-xs font-sans transition-all flex items-center justify-between cursor-pointer',
                                    isSel
                                      ? 'bg-[#2d1c10] border-[#d9a066] text-[#fef5ec] font-bold ring-1 ring-[#d9a066]/50'
                                      : 'bg-[#18110a] border-[#382618] text-[#c9bba9] hover:bg-[#22170f]'
                                  )}
                                >
                                  <span>{opt}</span>
                                  {isSel && <Check className="size-4 text-[#d9a066]" />}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {cp.pickerConfig?.motiveLabel && cp.pickerConfig.mismatchTypeOptions && (
                        <div className="space-y-2">
                          <label className="text-xs font-mono font-bold text-[#d9a066] block uppercase tracking-wider">
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
                                    'w-full text-left p-3 rounded-xl border text-xs font-sans transition-all flex items-center justify-between cursor-pointer',
                                    isSel
                                      ? 'bg-[#2d1c10] border-[#d9a066] text-[#fef5ec] font-bold ring-1 ring-[#d9a066]/50'
                                      : 'bg-[#18110a] border-[#382618] text-[#c9bba9] hover:bg-[#22170f]'
                                  )}
                                >
                                  <span>{opt}</span>
                                  {isSel && <Check className="size-4 text-[#d9a066]" />}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Evidence Selection Grid */}
                      {cp.pickerConfig?.availableEvidences && (
                        <div className="space-y-2.5">
                          <label className="text-xs font-mono font-bold text-[#d9a066] block uppercase tracking-wider">
                            {cp.pickerConfig.evidenceStepLabel || 'Chọn các tài liệu & vật chứng liên quan:'}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {cp.pickerConfig.availableEvidences.map((ev) => {
                              const isChecked = selectedEvidenceIds.includes(ev.id)
                              return (
                                <button
                                  key={ev.id}
                                  type="button"
                                  disabled={hasSuccess}
                                  onClick={() => toggleEvidenceSelect(ev.id)}
                                  className={cn(
                                    'text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 cursor-pointer relative',
                                    isChecked
                                      ? 'bg-[#2d1c10] border-[#d9a066] text-[#fef5ec] shadow-md ring-1 ring-[#d9a066]/50'
                                      : 'bg-[#17100a] border-[#382618] text-[#ad9885] hover:bg-[#22160e]'
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-[0.625rem] text-[#d9a066] font-bold uppercase border border-[#523d2b] px-1.5 py-0.5 rounded bg-[#130b06]">
                                      {ev.code}
                                    </span>
                                    <div className={cn('size-4 rounded border flex items-center justify-center transition-colors', isChecked ? 'bg-[#d9a066] border-[#d9a066] text-black' : 'border-[#4e3827]')}>
                                      {isChecked && <Check className="size-3 stroke-[3]" />}
                                    </div>
                                  </div>
                                  <span className="text-xs font-sans font-bold text-[#fef5ec] leading-snug">
                                    {ev.label}
                                  </span>
                                  <span className="text-[0.65rem] text-[#a18c7a] line-clamp-1 font-sans">
                                    {ev.description}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FORM TYPE 3: CONVERGENCE NODE */}
                  {cp.type === 'convergence' && (
                    <div className="space-y-4 pt-2 border-t border-[#382619]">
                      <span className="font-mono text-[0.625rem] text-[#a89583] uppercase font-bold tracking-wider block">
                        CHỌN BẰNG CHỨNG / LÝ DO LOẠI TRỪ TỪNG NGHI PHẠM LÚC ~21:00:
                      </span>

                      <div className="space-y-4">
                        {cp.convergenceConfig?.suspects.map((s) => (
                          <div key={s.id} className="p-3.5 rounded-xl border border-[#3e2b1c] bg-[#1a110a] space-y-2">
                            <span className="font-mono text-xs font-bold text-[#d9a066] block">
                              {s.name}
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
                                      'w-full text-left p-2.5 rounded-lg border text-xs font-sans transition-all flex items-center justify-between cursor-pointer',
                                      isSel
                                        ? 'bg-[#2d1c10] border-[#d9a066] text-[#fef5ec] font-bold'
                                        : 'bg-[#120b06] border-[#302114] text-[#ad9885] hover:bg-[#1c120a]'
                                    )}
                                  >
                                    <span>{opt}</span>
                                    {isSel && <Check className="size-3.5 text-[#d9a066]" />}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ERROR FEEDBACK BANNER */}
                  {hasError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-950/70 border border-red-700/80 text-red-200 font-mono text-xs flex items-center gap-3 shadow-md"
                    >
                      <AlertCircle className="size-4 text-red-400 shrink-0" />
                      <span>⚠️ LẬP LUẬN HOẶC DỮ LIỆU BỊ BÁC BỎ: Kết quả chưa khớp với bằng chứng và hồ sơ nghiệp vụ. Hãy kiểm tra lại hoặc mở gợi ý!</span>
                    </motion.div>
                  )}

                  {/* SUCCESS FEEDBACK BANNER */}
                  {hasSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-700/80 text-emerald-200 font-mono text-xs flex items-center gap-3 shadow-md"
                    >
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      <span>CHÍNH XÁC! Kết luận hoàn toàn trùng khớp với hồ sơ nghiệp vụ. Đang mở khóa Giai đoạn kế tiếp...</span>
                    </motion.div>
                  )}

                  {/* OPENED HINT DISPLAY CONTAINER */}
                  {hints.length > 0 && hintLevel > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 rounded-xl border-l-4 border-amber-500 bg-[#25170d] border-t border-r border-b border-[#4d321c] text-amber-200 text-xs space-y-1.5 shadow-inner relative"
                    >
                      <div className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase font-bold text-[#d9a066]">
                        <Lightbulb className="size-3.5 text-amber-400" />
                        <span>GỢI Ý TƯ DUY PHÁ ÁN ({hintLevel}/{hints.length})</span>
                      </div>
                      <p className="leading-relaxed font-sans text-[#f2e2d0] text-xs sm:text-[0.8rem]">
                        {hints[hintLevel - 1]}
                      </p>
                    </motion.div>
                  )}

                  {/* ACTION TOOLBAR: HINT + SUBMIT */}
                  <div className="pt-3 border-t border-[#382619] flex items-center justify-between gap-3 flex-wrap">
                    {/* Left Hint Button */}
                    {hints.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleHintClick(cp.id, hints.length)}
                        className="font-mono text-xs uppercase tracking-wider text-[#d9a066] hover:text-amber-200 bg-[#1e130b] hover:bg-[#2d1c10] border border-[#4d3420] hover:border-[#735135] px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm active:scale-95"
                      >
                        <Lightbulb className="size-3.5 text-amber-400" />
                        <span>
                          {hintLevel === 0
                            ? `MỞ GỢI Ý (1/${hints.length})`
                            : `GỢI Ý KẾ TIẾP (${hintLevel >= hints.length ? 1 : hintLevel + 1}/${hints.length})`}
                        </span>
                      </button>
                    ) : (
                      <span />
                    )}

                    {/* Right Submit Button */}
                    <button
                      disabled={hasSuccess || !checkCurrentValidity(cp)}
                      onClick={() => handleCustomSubmit(cp)}
                      className={cn(
                        'font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 border shadow-lg',
                        checkCurrentValidity(cp) && !hasSuccess
                          ? 'bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] border-[#d9a066] shadow-[0_0_20px_rgba(217,160,102,0.35)] active:scale-95 hover:scale-[1.02]'
                          : 'bg-[#1c140e] text-[#6e5a48] border-[#332417] opacity-60 pointer-events-none'
                      )}
                    >
                      <span>XÁC NHẬN KẾT LUẬN</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()
      ) : null}
    </section>
  )
}
