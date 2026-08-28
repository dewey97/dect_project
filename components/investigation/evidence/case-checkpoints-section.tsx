'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Search,
  FileQuestion,
  Flame,
  Check
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
    tag: 'HIỆN TRƯỜNG PHÒNG KHÁCH // 20:00 PM',
    subtitle: 'Nạn nhân ngã gục cạnh bàn trà, bộ bình gốm sứ vỡ vụn và hồ sơ rơi vãi khắp sàn.',
    badgeColor: 'border-amber-700/80 bg-amber-950/90 text-amber-300'
  },
  'cp-000-1': {
    imageUrl: '/photo_scattered_docs.jpg',
    tag: 'TRANH CHẤP DI CHÚC & ĐỊA CHÍNH 2018',
    subtitle: 'Tờ di chúc bị tẩy xóa bằng cồn và bản trích đo đất đền bù mâu thuẫn 75m² vs 120m².',
    badgeColor: 'border-orange-700/80 bg-orange-950/90 text-orange-300'
  },
  'cp-000-2': {
    imageUrl: '/photo_old_newspaper.jpg',
    tag: 'TÀI LIỆU QUÁ KHỨ 1998 // VỤ NGẠT KHÍ',
    subtitle: 'Trang nhật báo cũ 1998 về tai nạn ngạt khí tủ gỗ & cuống vé xe khách rời bến lúc 19:30.',
    badgeColor: 'border-sky-700/80 bg-sky-950/90 text-sky-300'
  },
  'cp-000-3': {
    imageUrl: '/photo_glass_shard.jpg',
    tag: 'VẬT CHỨNG QUYẾT ĐỊNH // 21:00 PM',
    subtitle: 'Mảnh thủy tinh sắc nhọn 8cm dính máu khô & tin nhắn tình nhân rủ đi du lịch lúc 20:40.',
    badgeColor: 'border-red-700/80 bg-red-950/90 text-red-300'
  }
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']

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

  const resetProgress = () => {
    try {
      localStorage.removeItem('veritas_completed_checkpoints')
      window.location.reload()
    } catch {}
  }

  const handleSelectOption = (cpId: string, opt: string) => {
    detectiveAudio.playPaperRustle()
    onAnswerSelect(cpId, opt)
  }

  const handleHintClick = (cpId: string, maxHints: number) => {
    detectiveAudio.playTypewriterClick()
    onUnlockNextHint(cpId, maxHints)
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
            <span>BẢN KẾT LUẬN THẨM TRA</span>
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
          className="p-6 bg-[#16100b] border-2 border-[#b87333] shadow-2xl space-y-5 relative overflow-hidden"
        >
          <div className="flex items-center gap-2.5 text-amber-400 font-mono text-sm font-bold uppercase tracking-wider border-b border-[#382618] pb-3">
            <CheckCircle2 className="size-5 text-emerald-400" />
            <span>HỒ SƠ KHÓA ÁN // ĐÃ GIẢI MÃ TOÀN BỘ CHUYÊN ÁN</span>
          </div>

          <p className="text-xs sm:text-sm text-[#dfd0bf] font-serif leading-relaxed">
            Toàn bộ mâu thuẫn mốc giờ, động cơ trục lợi và vật chứng cốt lõi của vụ án <strong className="text-amber-300">TRỐN TÌM</strong> đã được bóc tách chuẩn xác. Bạn đã vạch trần kẻ thủ ác thực sự và giải mã bi kịch quá khứ.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                try {
                  window.dispatchEvent(new CustomEvent('open-epilogue-modal'))
                } catch {}
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <span>📖 ĐỌC KÝ SỰ HẬU ÁN (EPILOGUE)</span>
            </button>

            <button
              onClick={resetProgress}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#261d15] hover:bg-[#382b1f] text-[#d9a066] border border-[#4a3a2c] font-mono text-xs font-bold transition-all cursor-pointer"
            >
              <span>🔄 PHÁ ÁN LẠI (RESET)</span>
            </button>
          </div>
        </motion.div>
      ) : currentCp ? (
        (() => {
          const cp = currentCp
          const idx = currentIdx
          const selectedOpt = selectedAnswers[cp.id]
          const hasError = checkpointErrors[cp.id]
          const hasSuccess = checkpointSuccesses[cp.id]

          const hints = HINTS_MAP[cp.id] || (cp.hint ? [cp.hint] : [])
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
                <div className="relative h-48 sm:h-56 w-full overflow-hidden border-b border-[#3e2b1b] group bg-black rounded-t-2xl">
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
                    <span className="font-mono text-[0.6rem] text-[#ad9885] bg-black/80 px-2.5 py-1 border border-[#3e2c1e] rounded-md shrink-0 hidden sm:inline">
                      MANH MỐI #{idx + 1}
                    </span>
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

                {/* QUESTION BODY & OPTIONS */}
                <div className="p-5 sm:p-7 space-y-6">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <span className="font-mono text-[0.65rem] text-[#d9a066] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <FileQuestion className="size-3.5 text-[#d9a066]" />
                      CÂU HỎI KẾT LUẬN THẨM TRA:
                    </span>
                    <h3 className="font-sans text-sm sm:text-base font-bold text-[#fef5ec] leading-relaxed">
                      {cp.question}
                    </h3>
                  </div>

                  {/* Hypothesis Option Cards (A, B, C, D) */}
                  <div className="space-y-3 pt-2 border-t border-[#382619]">
                    <span className="font-mono text-[0.625rem] text-[#a89583] uppercase font-bold tracking-wider block">
                      CHỌN LẬP LUẬN PHÁ ÁN PHÙ HỢP:
                    </span>

                    <div className="flex flex-col gap-2.5">
                      {cp.options.map((opt, optIdx) => {
                        const isSelected = selectedOpt === opt
                        const letter = OPTION_LETTERS[optIdx] || String(optIdx + 1)

                        return (
                          <button
                            key={opt}
                            disabled={hasSuccess}
                            onClick={() => handleSelectOption(cp.id, opt)}
                            className={cn(
                              'w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer relative group shadow-sm',
                              isSelected
                                ? 'border-[#d9a066] bg-[#2d1c10] text-[#fef5ec] font-semibold shadow-[0_4px_20px_rgba(217,160,102,0.2)] ring-1 ring-[#d9a066]/60 -translate-y-0.5'
                                : 'border-[#382618] bg-[#17100a] hover:border-[#634329] hover:bg-[#20150d] text-[#dcd0c2] hover:-translate-y-0.5'
                            )}
                          >
                            {/* Letter Badge */}
                            <span
                              className={cn(
                                'font-mono text-xs font-bold px-2.5 py-1 shrink-0 border rounded-lg transition-colors mt-0.5',
                                isSelected
                                  ? 'bg-amber-950 border-amber-600 text-amber-300'
                                  : 'bg-[#22170e] border-[#443021] text-[#ad9885] group-hover:text-[#d9a066]'
                              )}
                            >
                              [{letter}]
                            </span>

                            {/* Option text */}
                            <span className="text-xs sm:text-sm font-sans leading-relaxed flex-1 pt-0.5">
                              {opt}
                            </span>

                            {/* Right selection indicator */}
                            <div className="shrink-0 pt-1">
                              {isSelected ? (
                                <div className="size-5 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md">
                                  <Check className="size-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="size-5 rounded-full border border-[#443021] group-hover:border-[#6e4e35]" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* ERROR FEEDBACK BANNER */}
                  {hasError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-950/70 border border-red-700/80 text-red-200 font-mono text-xs flex items-center gap-3 shadow-md"
                    >
                      <AlertCircle className="size-4 text-red-400 shrink-0" />
                      <span>⚠️ LẬP LUẬN BỊ BÁC BỎ: Mâu thuẫn với lời khai và mốc thời gian. Hãy đối chiếu lại vật chứng hoặc mở gợi ý!</span>
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
                      disabled={!selectedOpt || hasSuccess}
                      onClick={() => onSubmitAnswer(cp)}
                      className={cn(
                        'font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 border shadow-lg',
                        selectedOpt && !hasSuccess
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
