'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  FolderSearch,
  Smartphone,
  Search,
  Lock,
  Unlock,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EvidenceGuideModalProps {
  isOpen: boolean
  onClose: () => void
  isPhoneSolved: boolean
  isReinvestigateUnlocked: boolean
  onOpenPhoneLookup?: () => void
  onOpenReinvestigation?: () => void
}

export function EvidenceGuideModal({
  isOpen,
  onClose,
  isPhoneSolved,
  isReinvestigateUnlocked
}: EvidenceGuideModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-none overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* HEADER BAR */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8c1d1d] flex items-center gap-1.5">
                <FolderSearch className="size-3.5 text-[#8c1d1d]" />
                CHỈ DẪN NGHIỆP VỤ // CASE 000
              </span>
              <h3 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wider">
                Hướng Dẫn Các Thao Tác Mở Rộng Điều Tra
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer border border-[#5c4026]/40"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* BODY */}
          <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5]">
            {/* BRANCH 1: BỔ SUNG CHỨNG CỨ */}
            <div
              className={cn(
                'p-4 border-2 transition-all space-y-3 relative',
                isPhoneSolved
                  ? 'border-blue-800/60 bg-[#e8eef7]'
                  : 'border-[#b89569] bg-[#fbf8f1]'
              )}
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#2b1f14]/15 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="size-7 bg-[#2b1f14] text-[#f6f1e5] flex items-center justify-center font-mono font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-xs sm:text-sm text-[#1a120b] uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone className="size-4 text-[#8c592b]" />
                      1. BỔ SUNG CHỨNG CỨ
                    </h4>
                  </div>
                </div>

                {isPhoneSolved ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-900 text-blue-100 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="size-3 text-blue-300" />
                    ĐÃ HOÀN THÀNH
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-700/20 text-amber-900 border border-amber-700/40 font-mono text-[10px] font-bold uppercase tracking-wider">
                    CHƯA HOÀN THÀNH
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-[13px] text-[#2b1f14] leading-relaxed space-y-2 font-sans">
                <p>
                  <strong className="text-[#8c1d1d] font-mono uppercase text-[11px]">Thao tác cụ thể:</strong> Truy vết liên lạc
                </p>
                <p className="text-[#1a120b]">
                  Tổ chức rà soát, tra cứu dữ liệu viễn thông nhằm xác minh, làm rõ thông tin lai lịch của các đầu số không lưu tên trong nhật ký cuộc gọi
                </p>
              </div>
            </div>

            {/* BRANCH 2: KHÁM XÉT LẠI HIỆN TRƯỜNG */}
            <div
              className={cn(
                'p-4 border-2 transition-all space-y-3 relative',
                isReinvestigateUnlocked
                  ? 'border-amber-700/60 bg-[#fdf9f0]'
                  : 'border-zinc-400 bg-[#ebe7df] opacity-85'
              )}
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#2b1f14]/15 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="size-7 bg-[#2b1f14] text-[#f6f1e5] flex items-center justify-center font-mono font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-xs sm:text-sm text-[#1a120b] uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="size-4 text-[#2b1f14]" />
                      2. KHÁM XÉT LẠI HIỆN TRƯỜNG
                    </h4>
                  </div>
                </div>

                {isReinvestigateUnlocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-800 text-amber-100 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <Unlock className="size-3 text-amber-300" />
                    ĐÃ MỞ KHÓA
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-700 text-zinc-200 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <Lock className="size-3 text-zinc-400" />
                    ĐANG KHÓA
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-[13px] text-[#2b1f14] leading-relaxed space-y-2.5 font-sans">
                <p className="text-[#1a120b]">
                  Là thao tác tiến hành xem xét, đo đạc, thu thập lại dấu vết tại nơi xảy ra vụ án khi lần khám nghiệm trước đó có thiếu sót, chưa đầy đủ hoặc phát sinh tình tiết mới cần làm rõ.
                </p>
                <div className="pt-1 space-y-1.5">
                  <p>
                    <strong className="text-[#8c1d1d] font-mono uppercase text-[11px] block">Điều kiện kích hoạt:</strong>
                    Hoàn thành toàn bộ câu hỏi suy luận hoặc khai thác hết tài liệu, chứng cứ hiện có nhưng chưa đủ căn cứ xác định thủ phạm.
                  </p>
                  <p>
                    <strong className="text-[#8c1d1d] font-mono uppercase text-[11px] block">Cơ chế:</strong>
                    Lệnh tự động khả dụng (sáng lên) khi thỏa mãn các điều kiện trên.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 bg-[#ede3d1] border-t-2 border-[#2b1f14] flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#2b1f14]"
            >
              ĐÓNG HƯỚNG DẪN
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
