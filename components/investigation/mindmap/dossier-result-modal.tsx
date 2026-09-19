'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, ShieldAlert, CheckCircle2, Award } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'

interface DossierResultModalProps {
  isOpen: boolean
  dossierType: 'A' | 'B' | 'C' | null
  onClose: () => void
  onOpenFollowupQuestion?: () => void
}

export function DossierResultModal({
  isOpen,
  dossierType,
  onClose,
  onOpenFollowupQuestion
}: DossierResultModalProps) {
  if (!isOpen || !dossierType) return null

  const isA = dossierType === 'A'
  const isB = dossierType === 'B'
  const isC = dossierType === 'C'

  const title = isA
    ? 'HỒ SƠ A — BIÊN BẢN KẾT LUẬN ĐỐI TƯỢNG LÊ QUANG VŨ'
    : isB
    ? 'HỒ SƠ B — BIÊN BẢN KẾT LUẬN ĐỐI TƯỢNG NGUYỄN THANH TÙNG'
    : 'HỒ SƠ C — ĐỀ XUẤT LỆNH KHÁM XẾT CHỖ Ở TRẦN THỊ HÀ'

  const code = isA
    ? 'HỒ SƠ A // CÁO TRẠNG 001'
    : isB
    ? 'HỒ SƠ B // CÁO TRẠNG 002'
    : 'HỒ SƠ C // LỆNH KHÁM XẾT 003'

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
                <span>{isC ? 'ĐỀ XUẤT LỆNH KHÁM XẾT KHẨN CẤP' : 'BIÊN BẢN KẾT THÚC CHUYÊN ÁN #000'}</span>
              </div>
              <div className="px-3 py-1 border-2 border-[#8c1d1d] text-[#8c1d1d] bg-red-900/10 font-mono text-[11px] font-black uppercase tracking-wider">
                {isC ? '★ MẬT // ĐỀ XUẤT KHÁM XẾT ★' : '★ CHÍNH THỨC NIÊM PHONG ★'}
              </div>
            </div>

            {/* CONTENT CARD */}
            <div className="p-5 bg-[#ebdcc4] border-2 border-[#a88c6f] text-[#2b1f14] font-mono text-xs sm:text-sm leading-relaxed space-y-3 shadow-inner">
              <div className="font-bold text-[#6b1e1e] uppercase tracking-wide border-b border-[#a88c6f]/40 pb-2 flex items-center justify-between">
                <span>NỘI DUNG {isC ? 'ĐỀ XUẤT' : 'CHI TIẾT'} {isA ? 'HỒ SƠ A' : isB ? 'HỒ SƠ B' : 'HỒ SƠ C'}:</span>
                <span>ĐỐI TƯỢNG: {isA ? 'LÊ QUANG VŨ' : isB ? 'NGUYỄN THANH TÙNG' : 'TRẦN THỊ HÀ'}</span>
              </div>
              <div className="text-xs sm:text-sm text-[#1a120b] font-medium leading-relaxed whitespace-pre-line space-y-2">
                {isA &&
                  'Đây là Hồ sơ A ghi nhận đầy đủ diễn tiến vụ án, biên bản hỏi cung đối tượng Lê Quang Vũ cùng toàn bộ lời khai và bằng chứng buộc tội chính thức đã được Viện Kiểm sát phê chuẩn.'}
                {isB &&
                  'Đây là Hồ sơ B ghi nhận đầy đủ diễn tiến vụ án, biên bản hỏi cung đối tượng Nguyễn Thanh Tùng cùng toàn bộ lời khai và bằng chứng buộc tội chính thức đã được Viện Kiểm sát phê chuẩn.'}
                {isC && (
                  <>
                    <p>Đối tượng Trần Thị Hà có thái độ bất hợp tác, không giải trình được các mâu thuẫn trong lời khai ban đầu.</p>
                    <p>Qua đánh giá dấu vết nghiệp vụ, có căn cứ nhận định nhiều khả năng các vật chứng, tư trang hoặc công cụ gây án hiện đang được cất giấu tại nơi ở của đối tượng.</p>
                    <p>Để ngăn chặn nguy cơ tẩu tán chứng cứ, căn cứ Điều 140 và Điều 141 Bộ luật Tố tụng hình sự, Đội 5 kính đề xuất:</p>
                    <p className="font-bold text-[#8c1d1d] italic">Phê duyệt Lệnh khám xét khẩn cấp chỗ ở đối với Trần Thị Hà, giao Tổ công tác phối hợp cùng Công an phường Phân khu Cảng và VKSND TP. Hà Nội thực hiện theo quy định.</p>
                  </>
                )}
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-3 border-t-2 border-[#2b1f14]/20 flex flex-wrap items-center justify-between gap-3">
              {onOpenFollowupQuestion ? (
                <button
                  type="button"
                  onClick={() => {
                    detectiveAudio.playPaperRustle()
                    onClose()
                    onOpenFollowupQuestion()
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-2 border-amber-400 shadow-md"
                >
                  {isC ? 'Tiến hành khám xét' : '⚡ TIẾP TỤC: MỞ CÂU HỎI'}
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border-2 border-[#2b1f14]"
              >
                ĐÓNG HỒ SƠ
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
