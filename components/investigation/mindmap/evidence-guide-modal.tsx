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
  CheckCircle2,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

interface EvidenceGuideModalProps {
  isOpen: boolean
  onClose: () => void
  isPhoneSolved: boolean
  isReinvestigateUnlocked: boolean
  onOpenPhoneLookup: () => void
  onOpenReinvestigation?: () => void
}

export function EvidenceGuideModal({
  isOpen,
  onClose,
  isPhoneSolved,
  isReinvestigateUnlocked,
  onOpenPhoneLookup,
  onOpenReinvestigation
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
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1a120b] uppercase tracking-wide">
                Hướng Dẫn Bổ Sung & Bóc Tách Chứng Cứ
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
            {/* OVERVIEW INTRO */}
            <div className="p-3.5 bg-[#ebdcc4] border border-[#a88c6f] text-xs text-[#2b1f14] leading-relaxed space-y-1 shadow-sm">
              <p className="font-serif text-[13px] font-semibold text-[#1a120b]">
                Từ các vật chứng và tài liệu sơ bộ ban đầu, điều tra viên cần tiến hành bóc tách thông qua <strong>2 nhánh nghiệp vụ bổ trợ</strong> bên dưới để thu thập bằng chứng quyết định:
              </p>
            </div>

            {/* BRANCH 1: MỞ RỘNG ĐIỀU TRA */}
            <div
              className={cn(
                'p-4 border-2 transition-all space-y-3 relative',
                isPhoneSolved
                  ? 'border-blue-800/60 bg-[#e8eef7]'
                  : 'border-[#b89569] bg-[#fbf8f1]'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-7 bg-[#2b1f14] text-[#f6f1e5] flex items-center justify-center font-mono font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-xs sm:text-sm text-[#1a120b] uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone className="size-4 text-[#8c592b]" />
                      MỞ RỘNG ĐIỀU TRA (TRUY VẾT SĐT)
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

              <div className="text-xs sm:text-[13px] text-[#2b1f14] leading-relaxed space-y-2">
                <p>
                  <strong>Nhiệm vụ:</strong> Đòi hỏi truy vết các số điện thoại lạ trong đêm 24/07 và bóc tách các mối liên hệ phức tạp của nạn nhân Khang (khoản nợ cá độ, mối làm ăn vật liệu xây dựng, ân oán quá khứ).
                </p>
                <p className="text-[12px] text-[#5c4026] bg-[#eedfc8] p-2 border border-[#d2bf9f] font-mono">
                  💡 <strong>Cách thực hiện:</strong> Đối chiếu dữ liệu giữa <strong>Hồ sơ tài liệu</strong> và <strong>Điện thoại nạn nhân Khang</strong> để xác định danh tính 3 chủ thuê bao.
                </p>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    detectiveAudio.playPaperRustle()
                    onClose()
                    onOpenPhoneLookup()
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow active:scale-95"
                >
                  <Smartphone className="size-3.5 text-amber-300" />
                  <span>{isPhoneSolved ? 'XEM LẠI KẾT QUẢ SĐT' : 'MỞ TRA CỨU SĐT NGAY'}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* BRANCH 2: KHÁM XÉT LẠI */}
            <div
              className={cn(
                'p-4 border-2 transition-all space-y-3 relative',
                isReinvestigateUnlocked
                  ? 'border-amber-700/60 bg-[#fdf9f0]'
                  : 'border-zinc-400 bg-[#ebe7df] opacity-85'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-7 bg-[#2b1f14] text-[#f6f1e5] flex items-center justify-center font-mono font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-xs sm:text-sm text-[#1a120b] uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="size-4 text-[#2b1f14]" />
                      KHÁM XÉT LẠI HIỆN TRƯỜNG
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

              <div className="text-xs sm:text-[13px] text-[#2b1f14] leading-relaxed space-y-2">
                <p>
                  <strong>Nhiệm vụ:</strong> Rà soát lại hiện trường vụ án để tìm kiếm các dấu vết vi mô và vật chứng bị bỏ sót sau lời khai mâu thuẫn của các đối tượng.
                </p>
                <div className="text-[12px] p-2 bg-[#dfd6c8] border border-[#c5b7a3] font-mono space-y-1">
                  <div className="font-bold text-[#6b1e1e] flex items-center gap-1">
                    <AlertCircle className="size-3.5 text-[#8c1d1d]" />
                    ĐIỀU KIỆN MỞ KHÓA:
                  </div>
                  <p className="text-[#3b2b1a] pl-1">
                    Hoàn thành trả lời các câu hỏi suy luận đối với cả 2 đối tượng <strong>Lê Quang Vũ</strong> và <strong>Nguyễn Thanh Tùng</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                {isReinvestigateUnlocked && onOpenReinvestigation ? (
                  <button
                    type="button"
                    onClick={() => {
                      detectiveAudio.playGlassSound()
                      onClose()
                      onOpenReinvestigation()
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#d97706] hover:bg-[#b45309] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow active:scale-95 border border-[#b45309]"
                  >
                    <Search className="size-3.5 text-black" />
                    <span>MỞ BIÊN BẢN KHÁM XÉT LẠI</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                ) : (
                  <div className="text-[11px] font-mono text-zinc-600 italic">
                    🔒 Chưa đủ điều kiện mở khóa — Cần trả lời xong câu hỏi của Vũ & Tùng
                  </div>
                )}
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
