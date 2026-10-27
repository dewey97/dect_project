'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Keyboard,
  PenTool,
  Lightbulb,
  Sparkles,
  Layers,
  ChevronRight,
  BookOpen,
  MousePointer,
  Highlighter,
  StickyNote,
  Maximize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { detectiveAudio } from '@/lib/investigation-audio'
import {
  CANVAS_SHORTCUTS,
  CANVAS_INVESTIGATION_TIPS,
} from '@/lib/guides/canvas-guide-data'

interface CanvasGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStartTour: () => void
}

type TabKey = 'shortcuts' | 'annotations' | 'strategy'

const TABS: { id: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'shortcuts', label: 'PHÍM TẮT & CỬ CHỈ', icon: Keyboard },
  { id: 'annotations', label: 'GHI CHÚ & HIGHLIGHT', icon: Highlighter },
  { id: 'strategy', label: 'MẸO TÁC NGHIỆP', icon: Lightbulb },
]

export function CanvasGuideModal({
  isOpen,
  onClose,
  onStartTour,
}: CanvasGuideModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('shortcuts')

  // Phím ESC đóng modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        detectiveAudio.playPaperRustle()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleTabChange = useCallback((tab: TabKey) => {
    detectiveAudio.playPaperRustle()
    setActiveTab(tab)
  }, [])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cẩm nang tác nghiệp Bàn hồ sơ"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-[#14100c] border border-[#3e2e20] shadow-[0_30px_90px_rgba(0,0,0,0.98)] text-zinc-200 overflow-hidden"
      >
        {/* HEADER MODAL */}
        <div className="shrink-0 px-6 py-4 border-b border-[#2a1f16] bg-[#1a140f]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#d9a066]/15 border border-[#d9a066]/30 flex items-center justify-center text-[#d9a066]">
              <BookOpen className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold tracking-tight text-[#f4ebd9] font-sans">
                  CẨM NANG BÀN HỒ SƠ TÁC NGHIỆP
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/60 text-amber-400 border border-amber-800/40">
                  CANVAS MODE
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Quy chuẩn thao tác dành riêng cho không gian mặt bàn điều tra
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              detectiveAudio.playPaperRustle()
              onClose()
            }}
            className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Đóng cẩm nang (Esc)"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="shrink-0 px-6 pt-3 border-b border-[#261c14] bg-[#16110d] flex items-center gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-sans text-xs font-medium tracking-wide transition-all cursor-pointer -mb-px',
                  isActive
                    ? 'border-[#d9a066] text-[#f4ebd9] font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                )}
              >
                <Icon className={cn('size-3.5', isActive ? 'text-[#d9a066]' : 'text-zinc-500')} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB CONTENT (SCROLLABLE) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 custom-scrollbar text-xs sm:text-sm">
          {/* TAB 1: PHÍM TẮT & CỬ CHỈ */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-amber-300 text-xs flex items-center gap-2.5">
                <Sparkles className="size-4 shrink-0 text-amber-400" />
                <span>
                  Bàn hồ sơ hỗ trợ thao tác tự do bằng cả bàn phím, con lăn chuột và trackpad.
                </span>
              </div>

              <div className="divide-y divide-[#261c14] rounded-xl border border-[#2a1f16] bg-[#1a140f]/50 overflow-hidden">
                {CANVAS_SHORTCUTS.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:px-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-zinc-200">{sc.label}</div>
                      <div className="text-xs text-zinc-400">{sc.desc}</div>
                    </div>
                    <kbd className="px-2.5 py-1 rounded-md bg-[#241a12] border border-[#3e2e20] text-amber-300 font-mono text-xs font-bold shrink-0 shadow-inner">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: GHI CHÚ & HIGHLIGHT */}
          {activeTab === 'annotations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Bút mực */}
                <div className="p-4 rounded-xl bg-[#1a140f]/60 border border-[#2a1f16] space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold">
                    <PenTool className="size-4" />
                    <span>Bút mực điều tra (Pen)</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Dùng để khoanh tròn các mâu thuẫn, nối mũi tên suy luận giữa hai văn bản hoặc ký hiệu trực tiếp lên ảnh vật chứng. Hỗ trợ 6 màu và 4 cỡ nét.
                  </p>
                </div>

                {/* 2. Bút dạ quang */}
                <div className="p-4 rounded-xl bg-[#1a140f]/60 border border-[#2a1f16] space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <Highlighter className="size-4" />
                    <span>Bút dạ quang (Highlighter)</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Dùng để tô sáng các dòng lời khai đắt giá, khung giờ có mặt tại hiện trường hoặc các số hiệu biển số xe mà không che khuất chữ viết bên dưới.
                  </p>
                </div>

                {/* 3. Giấy dán note */}
                <div className="p-4 rounded-xl bg-[#1a140f]/60 border border-[#2a1f16] space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold">
                    <StickyNote className="size-4" />
                    <span>Giấy dán Sticky Note</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Ghi lại giả thuyết vụ án, danh sách việc cần làm (to-do) hoặc tổng hợp mốc thời gian. Có thể dán ở bất cứ đâu trên mặt bàn.
                  </p>
                </div>

                {/* 4. Quản lý tài liệu */}
                <div className="p-4 rounded-xl bg-[#1a140f]/60 border border-[#2a1f16] space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Layers className="size-4" />
                    <span>Ghim & Khóa vị trí</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Nhấn vào biểu tượng Ghim trên thanh đầu thẻ để khóa tập hồ sơ cố định trên mặt bàn, tránh bị chuột vô tình làm xê dịch khi phác thảo nét vẽ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MẸO TÁC NGHIỆP */}
          {activeTab === 'strategy' && (
            <div className="space-y-3">
              {CANVAS_INVESTIGATION_TIPS.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#1a140f]/70 border border-[#2a1f16] space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-[#d9a066] font-semibold">
                    <span className="size-5 rounded-full bg-[#d9a066]/20 border border-[#d9a066]/40 flex items-center justify-center text-[11px] font-mono font-bold">
                      {idx + 1}
                    </span>
                    <span>{tip.title}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed pl-7">
                    {tip.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER MODAL */}
        <div className="shrink-0 px-6 py-3.5 border-t border-[#2a1f16] bg-[#16110d] flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Có thể mở lại cẩm nang bất kỳ lúc nào qua nút <span className="text-amber-400">?</span> ở đáy bàn.
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose()
                onStartTour()
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#d9a066] hover:bg-[#e2af7b] active:bg-[#c89257] text-[#1a120b] text-xs font-semibold shadow-lg shadow-amber-950/40 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="size-3.5" />
              <span>Bắt đầu tour trực quan (6 bước)</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
