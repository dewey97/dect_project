'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

interface FollowupQuestionModalProps {
  isOpen: boolean
  culprit: 'vu' | 'tung' | null
  onClose: () => void
  onOpenDossier?: (dossierType: 'A' | 'B') => void
  onSuccess?: (culprit: 'vu' | 'tung') => void
}

const MOCK_OPTIONS_VU = [
  { id: 'opt-1', label: 'Phương án A: Khai man diện tích đất từ 75m2 thành 120m2 để trục lợi đền bù.' },
  { id: 'opt-2', label: 'Phương án B: Lén đột nhập vào nhà Khang qua cửa sau để tiêu hủy giấy vay nợ 350 triệu.' },
  { id: 'opt-3', label: 'Phương án C: Tống tiền nạn nhân Khang bằng các bằng chứng gian lận địa chính.' },
  { id: 'opt-4', label: 'Phương án D: Cả phương án A và B đều đúng.' }
]

const MOCK_OPTIONS_TUNG = [
  { id: 'opt-1', label: 'Phương án A: Trả thù cho em trai Gia Huy bị Khang nhốt tủ tử vong năm 1998.' },
  { id: 'opt-2', label: 'Phương án B: Mâu thuẫn tranh chấp số tiền cờ bạc nợ nần tại quán nhậu.' },
  { id: 'opt-3', label: 'Phương án C: Giằng co xô xát sau khi Khang xé nát bài báo và bức ảnh kỷ niệm.' },
  { id: 'opt-4', label: 'Phương án D: Cả phương án A và C đều đúng.' }
]

export function FollowupQuestionModal({
  isOpen,
  culprit,
  onClose,
  onOpenDossier,
  onSuccess
}: FollowupQuestionModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  React.useEffect(() => {
    if (!culprit || !isOpen) return
    try {
      const saved = localStorage.getItem(`veritas_followup_${culprit}`)
      if (saved) {
        setSelectedOption(saved)
        setIsSubmitted(true)
      } else {
        setSelectedOption(null)
        setIsSubmitted(false)
      }
    } catch {}
  }, [culprit, isOpen])

  if (!isOpen || !culprit) return null

  const isVu = culprit === 'vu'
  const title = isVu ? 'CÂU HỎI — TRUY VẤN ĐỐI TƯỢNG LÊ QUANG VŨ' : 'CÂU HỎI — TRUY VẤN ĐỐI TƯỢNG NGUYỄN THANH TÙNG'
  const questionText = isVu
    ? 'Hành vi và động cơ mấu chốt nào dẫn tới sự hiện diện của Lê Quang Vũ tại hiện trường vào đêm xảy ra án mạng 24/07?'
    : 'Yếu tố tâm lý và xung đột cốt lõi nào đã kích hoạt cơn thịnh nộ của Nguyễn Thanh Tùng trước khi án mạng xảy ra?'
  const options = isVu ? MOCK_OPTIONS_VU : MOCK_OPTIONS_TUNG

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOption) {
      setErrorMsg('Vui lòng tích chọn một phương án trả lời!')
      detectiveAudio.playGlassSound()
      return
    }

    detectiveAudio.playStampSound()
    setIsSubmitted(true)
    setErrorMsg('')
    try {
      localStorage.setItem(`veritas_followup_${culprit}`, selectedOption)
    } catch {}
    if (onSuccess) {
      onSuccess(culprit)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_30px_90px_rgba(0,0,0,0.98)] rounded-none overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* HEADER */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="size-5 text-amber-800" />
              <div>
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#7f1d1d] block">
                  HỒ SƠ MỞ RỘNG // CÂU HỎI SUY LUẬN
                </span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#1a120b] uppercase tracking-wide">
                  {title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer border border-[#5c4026]"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5]">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-950/15 border-2 border-emerald-800 text-emerald-900 font-mono text-xs sm:text-sm font-bold flex items-center gap-2.5"
              >
                <CheckCircle2 className="size-5 text-emerald-700 shrink-0" />
                <span>ĐÃ GHI NHẬN KẾT LUẬN CÂU HỎI THÀNH CÔNG!</span>
              </motion.div>
            ) : null}

            {errorMsg && (
              <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* HƯỚNG DẪN MỞ TÚI HỒ SƠ */}
            <div className="p-4 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider block">
                  📂 HƯỚNG DẪN MỞ TÚI HỒ SƠ {isVu ? 'A' : 'B'}
                </span>
                <span className="px-2 py-0.5 bg-red-900/10 border border-[#8c1d1d] text-[#8c1d1d] font-mono text-[10px] font-bold uppercase">
                  VẬT PHẨM MỚI
                </span>
              </div>
              <p className="text-xs text-[#2b1f14] leading-relaxed">
                Vui lòng mở <strong>Túi {isVu ? 'Hồ sơ A (Đối tượng Lê Quang Vũ)' : 'Hồ sơ B (Đối tượng Nguyễn Thanh Tùng)'}</strong> trong bộ Kit trò chơi để đọc các biên bản lời khai & tài liệu giám định mới trước khi trả lời câu hỏi dưới đây.
              </p>
              {onOpenDossier && (
                <button
                  type="button"
                  onClick={() => onOpenDossier(isVu ? 'A' : 'B')}
                  className="mt-1 px-3.5 py-1.5 bg-[#8c1d1d] hover:bg-[#a82424] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow border border-[#5c1313]"
                >
                  <span>📄 XEM HỒ SƠ {isVu ? 'A' : 'B'} TRÊN WEB</span>
                </button>
              )}
            </div>

            {/* QUESTION BOX */}
            <div className="p-4 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
              <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
                CÂU HỎI:
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed">
                {questionText}
              </p>
            </div>

            {/* OPTIONS (TICK CHỌN) */}
            <div className="space-y-2.5">
              <span className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
                TÍCH CHỌN PHƯƠNG ÁN ĐÚNG:
              </span>

              {options.map((opt) => {
                const isSelected = selectedOption === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      detectiveAudio.playPaperRustle()
                      setSelectedOption(opt.id)
                      setErrorMsg('')
                    }}
                    className={cn(
                      'w-full text-left p-3.5 rounded-none border-2 transition-all flex items-start gap-3 cursor-pointer select-none',
                      isSelected
                        ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] shadow-sm'
                        : 'bg-[#fdfcf9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#f4ebd9]'
                    )}
                  >
                    <div
                      className={cn(
                        'size-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all bg-white',
                        isSelected ? 'border-[#2b1f14] bg-[#2b1f14]' : 'border-[#4a3520]'
                      )}
                    >
                      {isSelected && <div className="size-2 rounded-full bg-white" />}
                    </div>

                    <span className="text-xs sm:text-sm font-medium leading-snug">
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* FOOTER */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#dfd3bd] hover:bg-[#d4c5ab] border-2 border-[#4a3520] text-[#2b1f14] text-xs font-mono font-bold rounded-none transition-colors cursor-pointer"
              >
                ĐÓNG
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider rounded-none transition-all flex items-center gap-2 border-2 border-[#2b1f14] shadow-md cursor-pointer"
              >
                <span>{isSubmitted ? 'CẬP NHẬT KẾT LUẬN' : 'NỘP KẾT LUẬN'}</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
