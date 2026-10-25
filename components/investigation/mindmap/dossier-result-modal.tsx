'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Award } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'

interface DossierResultModalProps {
  isOpen: boolean
  dossierType: 'A' | 'B' | 'C' | null
  onClose: () => void
  onOpenFollowupQuestion?: () => void
  caseId?: string
  suspectName?: string
}

export function DossierResultModal({
  isOpen,
  dossierType,
  onClose,
  onOpenFollowupQuestion,
  caseId = "case_000",
  suspectName
}: DossierResultModalProps) {
  if (!isOpen || !dossierType) return null

  const isA = dossierType === 'A'
  const isB = dossierType === 'B'
  const isC = dossierType === 'C'

  const effectiveSuspectName =
    suspectName ||
    (isA ? 'Nghi phạm Bộ A' : isB ? 'Nghi phạm Bộ B' : 'Nghi phạm Bộ C')

  const title = `HỒ SƠ ${dossierType} — BIÊN BẢN ${isC ? 'ĐỀ XUẤT LỆNH KHÁM XẾT' : 'KẾT LUẬN'} ĐỐI TƯỢNG ${effectiveSuspectName.toUpperCase()}`
  const code = `HỒ SƠ ${dossierType} // ${(caseId || 'case').toUpperCase()}`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-4 border-[#2b1f14] shadow-[0_30px_90px_rgba(0,0,0,0.98)] rounded-none overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* TOP OFFICIAL WATERMARK STAMP */}
          <div className="bg-[#ede3d1] px-5 py-4 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8c1d1d] block">
                🔴 HỒ SƠ TÀI LIỆU MẬT // {code}
              </span>
              <h3 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wider">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                detectiveAudio.playPaperRustle()
                onClose()
              }}
              className="p-2 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer border border-[#5c4026] pointer-events-auto"
              title="Đóng"
            >
              <X className="size-5 pointer-events-none" />
            </button>
          </div>

          {/* DOSSIER DOCUMENT BODY */}
          <div className="p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5]">
            <div className="flex items-center justify-between border-b-2 border-[#2b1f14]/20 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#4a3520] uppercase">
                <FileText className="size-4 text-[#8c1d1d]" />
                <span>
                  {isC ? 'ĐỀ XUẤT LỆNH KHÁM XẾT KHẨN CẤP' : `BIÊN BẢN ĐIỀU TRA HỒ SƠ ${dossierType}`}
                </span>
              </div>
              <div className="px-3 py-1 border-2 border-[#8c1d1d] text-[#8c1d1d] bg-red-900/10 font-mono text-[11px] font-black uppercase tracking-wider">
                {isC ? '★ MẬT // ĐỀ XUẤT KHÁM XẾT ★' : '★ CHÍNH THỨC NIÊM PHONG ★'}
              </div>
            </div>

            {/* CONTENT CARD */}
            <div className="p-5 bg-[#ebdcc4] border-2 border-[#a88c6f] text-[#2b1f14] font-mono text-xs sm:text-sm leading-relaxed space-y-3 shadow-inner">
              <div className="font-bold text-[#6b1e1e] uppercase tracking-wide border-b border-[#a88c6f]/40 pb-2 flex items-center justify-between">
                <span>NỘI DUNG {isC ? 'ĐỀ XUẤT' : 'CHI TIẾT'} HỒ SƠ {dossierType}:</span>
                <span>ĐỐI TƯỢNG: {effectiveSuspectName.toUpperCase()}</span>
              </div>
              <div className="text-xs sm:text-sm text-[#1a120b] font-medium leading-relaxed whitespace-pre-line space-y-2">
                {isC ? (
                  <>
                    <p>Đối tượng {effectiveSuspectName} có thái độ bất hợp tác, không giải trình được các mâu thuẫn trong lời khai ban đầu.</p>
                    <p>Qua đánh giá dấu vết nghiệp vụ, có căn cứ nhận định nhiều khả năng các vật chứng, tư trang hoặc công cụ gây án hiện đang được cất giấu tại nơi ở của đối tượng.</p>
                    <p>Để ngăn chặn nguy cơ tẩu tán chứng cứ, căn cứ quy định tố tụng hình sự, Ban chuyên án đề xuất:</p>
                    <p className="font-bold text-[#8c1d1d] italic">Phê duyệt Lệnh khám xét khẩn cấp chỗ ở đối với đối tượng {effectiveSuspectName}, giao Tổ công tác phối hợp cùng Viện Kiểm sát thực hiện theo quy định.</p>
                  </>
                ) : (
                  <p>
                    Đây là Hồ sơ {dossierType} ghi nhận đầy đủ diễn tiến vụ án, biên bản hỏi cung đối tượng {effectiveSuspectName} cùng toàn bộ lời khai và bằng chứng buộc tội chính thức đã được Viện Kiểm sát phê chuẩn.
                  </p>
                )}
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-3 border-t-2 border-[#2b1f14]/20 flex flex-wrap items-center justify-between gap-3">
              {onOpenFollowupQuestion ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    detectiveAudio.playPaperRustle()
                    onOpenFollowupQuestion()
                  }}
                  className="px-5 py-2.5 bg-[#8c1d1d] hover:bg-[#a82525] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-md rounded-none flex items-center gap-2 cursor-pointer border border-[#6b1414] active:scale-[0.99] pointer-events-auto"
                >
                  <Award className="size-4 pointer-events-none" />
                  <span>Mở câu hỏi mở rộng {isC ? '(Lệnh khám xét)' : ''}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  detectiveAudio.playPaperRustle()
                  onClose()
                }}
                className="px-4 py-2 border border-[#5c4026] text-[#5c4026] hover:bg-[#dfd3bd] font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer pointer-events-auto"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
