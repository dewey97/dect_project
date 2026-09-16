'use client'

import React from 'react'
import { Target, BookOpen, ShieldAlert, Sparkles, Check } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'

export type InvestigationMode = 'casual' | 'hardcore'

interface InvestigationModeModalProps {
  isOpen: boolean
  onSelectMode: (mode: InvestigationMode) => void
}

export function InvestigationModeModal({ isOpen, onSelectMode }: InvestigationModeModalProps) {
  if (!isOpen) return null

  const handleSelect = (mode: InvestigationMode) => {
    detectiveAudio.playPaperRustle()
    onSelectMode(mode)
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#17100b] border-2 border-[#66462c] shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative overflow-hidden text-[#f4e8d8] font-mono">
        {/* LEATHER BORDER STITCHING EFFECT */}
        <div className="absolute inset-1.5 border border-dashed border-[#8c6239]/40 pointer-events-none" />

        {/* HEADER */}
        <div className="text-center space-y-2 relative z-10 border-b border-[#4d3623] pb-4">
          <div className="inline-flex items-center gap-2 bg-[#2a1b10] px-3 py-1 border border-[#523c28] text-xs text-[#d9a066]">
            <ShieldAlert className="size-4 text-[#d9a066]" />
            <span className="font-bold uppercase tracking-wider">THIẾT LẬP HỒ SƠ CHUYÊN ÁN #000</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-[#f4e8d8]">
            LỰA CHỌN CHẾ ĐỘ ĐIỀU TRA
          </h2>
          <p className="text-xs font-sans text-[#a38f7e]">
            Chọn phong cách trinh thám của bạn trước khi bước vào phòng lưu trữ chứng cứ
          </p>
        </div>

        {/* MODE OPTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          {/* CASUAL / STANDARD MODE */}
          <button
            type="button"
            onClick={() => handleSelect('casual')}
            className="bg-[#241a13] hover:bg-[#33241a] border border-[#523d2b] hover:border-emerald-600/80 p-4 text-left space-y-3 transition-all cursor-pointer group shadow-md relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
                <Target className="size-5" />
              </div>
              <span className="text-[0.6rem] font-bold px-2 py-0.5 bg-emerald-950 border border-emerald-700/80 text-emerald-300 uppercase">
                DỄ / TRUNG BÌNH
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#f4e8d8] group-hover:text-emerald-300 transition-colors uppercase">
                🟢 CHẾ ĐỘ TẬP SỰ
              </h3>
              <p className="text-[0.7rem] text-[#b5a291] font-sans leading-relaxed">
                Hệ thống câu hỏi trắc nghiệm A/B/C/D sẵn ở các mốc kiểm tra. Thích hợp để khám phá cốt truyện nhẹ nhàng.
              </p>
            </div>

            <div className="text-[0.625rem] text-emerald-400/90 font-mono pt-2 border-t border-[#3b2a1e] flex items-center gap-1">
              <Check className="size-3" />
              <span>Gợi ý đáp án rõ ràng</span>
            </div>
          </button>

          {/* HARDCORE DETECTIVE MODE */}
          <button
            type="button"
            onClick={() => handleSelect('hardcore')}
            className="bg-[#241a13] hover:bg-[#33241a] border border-[#523d2b] hover:border-amber-600/80 p-4 text-left space-y-3 transition-all cursor-pointer group shadow-md relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-950/80 text-amber-400 border border-amber-700/60">
                <BookOpen className="size-5" />
              </div>
              <span className="text-[0.6rem] font-bold px-2 py-0.5 bg-amber-950 border border-amber-700/80 text-amber-300 uppercase flex items-center gap-1">
                <Sparkles className="size-2.5" /> CAO THỦ / AI
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#f4e8d8] group-hover:text-amber-300 transition-colors uppercase">
                🔴 CHẾ ĐỘ THÁM TỬ THÂM NIÊN
              </h3>
              <p className="text-[0.7rem] text-[#b5a291] font-sans leading-relaxed">
                Khóa hoàn toàn trắc nghiệm. Sử dụng **Sổ Tay Bìa Da**, tự do gõ suy luận cá nhân (Gemini AI đối soát).
              </p>
            </div>

            <div className="text-[0.625rem] text-amber-400/90 font-mono pt-2 border-t border-[#3b2a1e] flex items-center gap-1">
              <Check className="size-3" />
              <span>Tự do gõ suy luận vô hạn</span>
            </div>
          </button>
        </div>

        {/* FOOTER NOTE */}
        <p className="text-[0.625rem] text-center font-mono text-[#8c7866] relative z-10 italic">
          * Lựa chọn này sẽ được áp dụng cho toàn bộ Chuyên án #000. Bạn có thể reset lại ở nút Reset trong game.
        </p>
      </div>
    </div>
  )
}
