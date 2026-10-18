'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  UserSearch,
  Scale,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { detectiveAudio } from '@/lib/investigation-audio'
import { GAMEPLAY_GUIDE_CONFIG } from '@/lib/guides/gameplay-guide-data'
import { emitInvestigationEvent } from '@/lib/investigation-events'

interface GameplayGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStartWalkthrough?: () => void
  initialSectionId?: string
}

const SECTION_ID_TO_PAGE: Record<string, number> = {
  overview: 0,
  suspects: 1,
  indictment: 2,
}

const CHAPTER_TABS = [
  { id: 'overview', label: 'TỔNG QUAN', page: 0, icon: Compass },
  { id: 'suspects', label: 'NGHI PHẠM', page: 1, icon: UserSearch },
  { id: 'indictment', label: 'KẾT LUẬN', page: 2, icon: Scale },
]

export function GameplayGuideModal({
  isOpen,
  onClose,
  onStartWalkthrough,
  initialSectionId = 'overview',
}: GameplayGuideModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(() => {
    return SECTION_ID_TO_PAGE[initialSectionId] ?? 0
  })
  const [flipDirection, setFlipDirection] = useState<1 | -1>(1)

  // Đồng bộ trang khởi tạo khi modal mở
  useEffect(() => {
    if (isOpen && initialSectionId) {
      const targetPage = SECTION_ID_TO_PAGE[initialSectionId] ?? 0
      setCurrentPage(targetPage)
    }
  }, [isOpen, initialSectionId])

  const flipToPage = useCallback(
    (targetPage: number) => {
      if (targetPage === currentPage || targetPage < 0 || targetPage > 2) return
      detectiveAudio.playPaperRustle()
      setFlipDirection(targetPage > currentPage ? 1 : -1)
      setCurrentPage(targetPage)
    },
    [currentPage],
  )

  const goToNextPage = useCallback(() => {
    if (currentPage < 2) {
      flipToPage(currentPage + 1)
    }
  }, [currentPage, flipToPage])

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      flipToPage(currentPage - 1)
    }
  }, [currentPage, flipToPage])

  // Điều hướng bằng phím mũi tên & phím ESC
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        detectiveAudio.playPaperRustle()
        onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, goToNextPage, goToPrevPage])

  if (!isOpen) return null

  const handleLaunchWalkthrough = () => {
    detectiveAudio.playTypewriterClick()
    onClose()
    if (onStartWalkthrough) {
      onStartWalkthrough()
    } else {
      emitInvestigationEvent('OPEN_WALKTHROUGH')
    }
  }

  // Lấy dữ liệu section theo từng trang
  const suspectsSection = GAMEPLAY_GUIDE_CONFIG.sections[0]
  const indictmentSection = GAMEPLAY_GUIDE_CONFIG.sections[1]

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 font-sans select-none overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            detectiveAudio.playPaperRustle()
            onClose()
          }
        }}
      >
        {/* KHUNG BÌA SỔ TAY DA NÂU CỔ ĐIỂN */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#1c130c] p-2.5 sm:p-4 rounded-xl shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_30px_rgba(217,160,102,0.15)] border-2 border-[#4a3321] flex flex-col"
        >
          {/* HÀNG TAB CHỈ MỤC GẮN TRÊN MÉP SỔ (BOOKMARK TABS) */}
          <div className="flex items-center justify-between mb-1 sm:mb-2 px-1">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
              {CHAPTER_TABS.map((tab) => {
                const isActive = currentPage === tab.page
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => flipToPage(tab.page)}
                    className={cn(
                      'px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 rounded-t-md border-t-2 border-x',
                      isActive
                        ? 'bg-[#f6f1e5] text-[#1a120b] border-[#4a3321] shadow-md -translate-y-0.5'
                        : 'bg-[#2b1d12] text-[#c9a783] hover:text-[#f6f1e5] hover:bg-[#3d2919] border-[#382315]'
                    )}
                  >
                    <Icon className="size-3.5 shrink-0 opacity-80" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* NÚT ĐÓNG SỔ TAY */}
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playPaperRustle()
                onClose()
              }}
              className="p-1 sm:p-1.5 rounded bg-[#2b1d12] text-[#c9a783] hover:text-white hover:bg-[#8c1d1d] transition-all cursor-pointer border border-[#4a3321]"
              title="Đóng sổ tay (ESC)"
              aria-label="Đóng sổ tay"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* RUỘT SỔ TAY: HIỆU ỨNG 3D VÀ GÁY LÒ XO KIM LOẠI */}
          <div className="relative w-full h-[540px] sm:h-[580px] max-h-[78vh] bg-[#f6f1e5] text-[#1a120b] border border-[#2b1f14]/60 shadow-[inset_0_0_40px_rgba(74,51,33,0.12)] rounded-sm overflow-hidden flex flex-col">
            
            {/* GÁY SỔ BÊN TRÁI: DÃY CÒNG / VÒNG SẮT KIM LOẠI TRÒN 3D */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-r from-[#ebdcc4] via-[#f1e6d4] to-transparent pointer-events-none z-30 flex flex-col justify-around py-5 items-start pl-0.5 sm:pl-1">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="relative flex items-center h-6 w-full">
                  {/* LỖ ĐỤC TRÒN TRÊN GIẤY */}
                  <div className="absolute left-4 sm:left-5 size-2.5 sm:size-3 rounded-full bg-[#1b130c] shadow-[inset_0_2px_3px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.4)] border border-[#3d2919]" />

                  {/* VÒNG SẮT TRÒN KIM LOẠI 3D */}
                  <svg
                    viewBox="0 0 36 20"
                    className="absolute left-0 sm:left-0.5 w-7 sm:w-8 h-4 sm:h-5 drop-shadow-[0_3px_3px_rgba(0,0,0,0.65)]"
                  >
                    <defs>
                      <linearGradient id={`metal-ring-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#374151" />
                        <stop offset="25%" stopColor="#9ca3af" />
                        <stop offset="50%" stopColor="#ffffff" />
                        <stop offset="75%" stopColor="#4b5563" />
                        <stop offset="100%" stopColor="#1f2937" />
                      </linearGradient>
                    </defs>
                    {/* Bóng đổ vòng sắt */}
                    <path
                      d="M 2,10 C 2,16 26,16 26,10"
                      fill="none"
                      stroke="rgba(27,19,12,0.3)"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    {/* Vòng sắt kim loại uốn cong xỏ xuyên qua lỗ */}
                    <path
                      d="M 26,9.5 C 26,2.5 3,2.5 3,10 C 3,17.5 26,17.5 26,10.5"
                      fill="none"
                      stroke={`url(#metal-ring-${i})`}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Vết lóe sáng kim loại */}
                    <path
                      d="M 8,4.5 C 12,3.5 18,3.5 22,4.5"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  </svg>
                </div>
              ))}
            </div>

            {/* VÙNG NỘI DUNG LẬT TRANG (3D PAGE FLIP WRAPPER) */}
            <div className="relative w-full flex-1 min-h-0 pl-7 sm:pl-10 pr-3 sm:pr-6 py-4 flex flex-col overflow-hidden perspective-[1400px]">
              <AnimatePresence custom={flipDirection} mode="wait">
                <motion.div
                  key={currentPage}
                  custom={flipDirection}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -40) goToNextPage()
                    else if (info.offset.x > 40) goToPrevPage()
                  }}
                  variants={{
                    enter: (dir: number) => ({
                      rotateY: dir > 0 ? 55 : -55,
                      opacity: 0,
                      x: dir > 0 ? 40 : -40,
                      transformOrigin: dir > 0 ? 'left center' : 'right center',
                    }),
                    center: {
                      rotateY: 0,
                      opacity: 1,
                      x: 0,
                      transition: {
                        duration: 0.32,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    },
                    exit: (dir: number) => ({
                      rotateY: dir > 0 ? -55 : 55,
                      opacity: 0,
                      x: dir > 0 ? -40 : 40,
                      transformOrigin: dir > 0 ? 'left center' : 'right center',
                      transition: {
                        duration: 0.22,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full h-full flex flex-col overflow-y-auto paper-scrollbar pr-2"
                >
                  {/* TRANG 0: TỔNG QUAN VỤ ÁN & QUY TẮC ĐIỀU TRA */}
                  {currentPage === 0 && (
                    <div className="space-y-4">
                      {/* HEADER TRANG BÌA TRONG */}
                      <div className="border-b-2 border-[#2b1f14] pb-3">
                        <h2 className="font-mono font-bold text-lg sm:text-xl text-[#1a120b] uppercase tracking-wide">
                          {GAMEPLAY_GUIDE_CONFIG.manualTitle}
                        </h2>
                        <p className="text-xs sm:text-[13px] text-[#5c4026] italic mt-0.5">
                          Sổ tay nghiệp vụ dành cho Điều tra viên phụ trách vụ án
                        </p>
                      </div>

                      {/* MỤC LỤC SỔ TAY */}
                      <div className="space-y-2">
                        <h3 className="font-mono font-bold text-xs sm:text-sm text-[#1a120b] uppercase tracking-wider">
                          MỤC LỤC HÀNH TRÌNH PHÁ ÁN
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {CHAPTER_TABS.slice(1).map((item, idx) => {
                            const Icon = item.icon
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => flipToPage(item.page)}
                                className="p-3 bg-[#fbf8f1] border border-[#2b1f14]/20 hover:border-[#8c1d1d] hover:bg-[#ede3d1] transition-all text-left cursor-pointer group rounded-none"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="size-5 rounded-full bg-[#2b1f14] text-[#f6f1e5] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </div>
                                  <Icon className="size-4 text-[#8c1d1d] group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="font-mono text-xs font-bold uppercase text-[#1a120b] block">
                                  {item.label}
                                </span>
                                <span className="text-[11px] text-[#5c4026] mt-0.5 block">
                                  Chạm để xem trang {item.page + 1} →
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* NGUYÊN TẮC SUY LUẬN TRINH THÁM */}
                      <div className="p-3.5 bg-[#ede3d1] border border-[#2b1f14]/25 space-y-2">
                        <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-[#8c1d1d] flex items-center gap-2">
                          <AlertCircle className="size-4 text-[#8c1d1d]" />
                          Nguyên Tắc Trọng Tâm:
                        </h4>
                        <p className="text-xs sm:text-[13px] text-[#2b1f14] leading-relaxed">
                          Hệ thống không chấp nhận suy đoán mơ hồ. Mọi kết luận về nghi phạm, động cơ và hành vi phạm tội đều bắt buộc phải được đối chiếu bằng <strong>chuỗi mã vật chứng xác thực</strong> thu thập từ tài liệu Google Docs, điện thoại nạn nhân và hiện trường 360 độ.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TRANG 1 (TRANG 2 TRONG SỔ): HỒ SƠ NGHI PHẠM */}
                  {currentPage === 1 && (
                    <div className="space-y-4">
                      <div className="border-b-2 border-[#2b1f14] pb-2">
                        <h2 className="font-mono font-bold text-base sm:text-lg text-[#1a120b] uppercase">
                          {suspectsSection.title}
                        </h2>
                      </div>

                      {suspectsSection.summary && (
                        <p className="text-xs sm:text-[13px] text-[#5c4026] italic leading-relaxed">
                          {suspectsSection.summary}
                        </p>
                      )}

                      <div className="space-y-3">
                        {suspectsSection.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 border border-[#2b1f14]/20 bg-[#fbf8f1] space-y-1 relative"
                          >
                            <div className="flex items-center gap-2">
                              <div className="size-5 bg-[#2b1f14] text-[#f6f1e5] flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                                {idx + 1}
                              </div>
                              <h4 className="font-mono font-bold text-xs sm:text-sm text-[#1a120b] uppercase tracking-wider">
                                {step.title}
                              </h4>
                            </div>
                            <p className="text-xs sm:text-[13px] text-[#2b1f14] leading-relaxed font-sans pl-7 whitespace-pre-line">
                              {step.desc}
                            </p>
                          </div>
                        ))}
                      </div>

                      {suspectsSection.proTip && (
                        <div className="p-3 bg-[#fef3c7] border border-[#d97706]/40 text-[#78350f] text-xs leading-relaxed flex items-start gap-2.5">
                          <Lightbulb className="size-4 text-[#b45309] shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-mono uppercase font-bold text-[11px] block tracking-wide text-[#92400e] mb-0.5">
                              Mẹo Nghiệp Vụ:
                            </strong>
                            <span>{suspectsSection.proTip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TRANG 2 (TRANG 3 TRONG SỔ): KẾT LUẬN ĐIỀU TRA */}
                  {currentPage === 2 && (
                    <div className="space-y-4">
                      <div className="border-b-2 border-[#2b1f14] pb-2">
                        <h2 className="font-mono font-bold text-base sm:text-lg text-[#1a120b] uppercase">
                          {indictmentSection.title}
                        </h2>
                      </div>

                      {indictmentSection.summary && (
                        <p className="text-xs sm:text-[13px] text-[#5c4026] italic leading-relaxed">
                          {indictmentSection.summary}
                        </p>
                      )}

                      <div className="space-y-3">
                        {indictmentSection.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 border border-[#2b1f14]/20 bg-[#fbf8f1] space-y-1 relative"
                          >
                            <div className="flex items-center gap-2">
                              <div className="size-5 bg-[#2b1f14] text-[#f6f1e5] flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                                {idx + 1}
                              </div>
                              <h4 className="font-mono font-bold text-xs sm:text-sm text-[#1a120b] uppercase tracking-wider">
                                {step.title}
                              </h4>
                            </div>
                            <p className="text-xs sm:text-[13px] text-[#2b1f14] leading-relaxed font-sans pl-7 whitespace-pre-line">
                              {step.desc}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* CTA HƯỚNG DẪN TƯƠNG TÁC TẬP SỰ */}
                      <div className="p-4 bg-[#ede3d1] border-2 border-[#8c1d1d]/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                        <div className="space-y-0.5 text-center sm:text-left">
                          <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider block">
                            TOUR THỰC CHIẾN TẬP SỰ
                          </span>
                          <p className="text-xs text-[#5c4026]">
                            Kích hoạt chế độ dẫn dắt trực tiếp trên hiện trường vụ án.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleLaunchWalkthrough}
                          className="px-4 py-2 bg-[#8c1d1d] hover:bg-[#a32222] text-[#fbf8f1] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#501010] shadow-sm shrink-0 flex items-center gap-1.5 active:scale-95"
                        >
                          <Sparkles className="size-3.5" />
                          <span>Mở Tour Tương Tác</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* THANH ĐIỀU HƯỚNG LẬT TRANG DƯỚI ĐÁY SỔ */}
            <div className="bg-[#ede3d1] px-4 py-2.5 sm:px-6 sm:py-3 border-t border-[#2b1f14]/20 flex items-center justify-between shrink-0">
              {/* NÚT LẬT TRANG TRƯỚC */}
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                className="px-3 py-1.5 bg-[#fbf8f1] text-[#1a120b] border border-[#2b1f14]/30 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Trang trước</span>
              </button>

              {/* CHỈ SỐ TRANG HIỆN TẠI (DẠNG SỔ GHI CHÉP) */}
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#5c4026]">
                <span>Trang {currentPage + 1} / 3</span>
                <div className="flex items-center gap-1 ml-1">
                  {[0, 1, 2].map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => flipToPage(page)}
                      className={cn(
                        'size-2 rounded-full transition-all cursor-pointer',
                        currentPage === page
                          ? 'bg-[#8c1d1d] scale-125'
                          : 'bg-[#2b1f14]/25 hover:bg-[#2b1f14]/60'
                      )}
                      title={`Tới trang ${page + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* NÚT LẬT TRANG SAU */}
              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === 2}
                className="px-3 py-1.5 bg-[#2b1f14] text-[#f6f1e5] border border-[#140d08] hover:bg-[#433020] disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span className="hidden sm:inline">Trang sau</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
