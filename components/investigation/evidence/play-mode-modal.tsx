'use client'

import React from 'react'
import { Globe, Box, Check, ShieldAlert, Sparkles } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'

export type PlayExperience = 'web' | 'boardgame'

interface PlayModeModalProps {
  isOpen: boolean
  currentMode?: PlayExperience
  onSelectMode: (mode: PlayExperience) => void
  onClose?: () => void
}

export function PlayModeModal({ isOpen, currentMode, onSelectMode, onClose }: PlayModeModalProps) {
  if (!isOpen) return null

  const handleSelect = (mode: PlayExperience) => {
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
            <span className="font-bold uppercase tracking-wider">THIẾT LẬP PHÒNG CHUYÊN ÁN #000</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-[#f4e8d8]">
            CHỌN HÌNH THỨC TRẢI NGHIỆM
          </h2>
          <p className="text-xs font-sans text-[#a38f7e]">
            Bạn đang phá án trực tiếp trên thiết bị hay đang ngồi cùng đồng đội trước bàn cờ vật lý?
          </p>
        </div>

        {/* MODE OPTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          {/* DIGITAL WEB STANDALONE MODE */}
          <button
            type="button"
            onClick={() => handleSelect('web')}
            className={`bg-[#241a13] hover:bg-[#33241a] border ${
              currentMode === 'web' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-[#523d2b]'
            } hover:border-amber-600/80 p-4 text-left space-y-3 transition-all cursor-pointer group shadow-md relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-950/80 text-amber-400 border border-amber-700/60">
                <Globe className="size-5" />
              </div>
              <span className="text-[0.6rem] font-bold px-2 py-0.5 bg-amber-950 border border-amber-700/80 text-amber-300 uppercase">
                FULL DIGITAL
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#f4e8d8] group-hover:text-amber-300 transition-colors uppercase flex items-center gap-1.5">
                <span>🌐 CHƠI HOÀN TOÀN TRÊN WEB</span>
              </h3>
              <p className="text-[0.7rem] text-[#b5a291] font-sans leading-relaxed">
                Mở đầy đủ trình xem văn bản PDF, phóng to chữ ký, xem ảnh hiện trường và tra cứu toàn bộ hồ sơ điện tử trực tiếp trên màn hình.
              </p>
            </div>

            <div className="text-[0.625rem] text-amber-400/90 font-mono pt-2 border-t border-[#3b2a1e] flex items-center gap-1">
              <Check className="size-3" />
              <span>Xem trước toàn bộ PDF & Tang vật</span>
            </div>
          </button>

          {/* TABLETOP BOARD GAME COMPANION MODE */}
          <button
            type="button"
            onClick={() => handleSelect('boardgame')}
            className={`bg-[#241a13] hover:bg-[#33241a] border ${
              currentMode === 'boardgame' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-[#523d2b]'
            } hover:border-emerald-600/80 p-4 text-left space-y-3 transition-all cursor-pointer group shadow-md relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
                <Box className="size-5" />
              </div>
              <span className="text-[0.6rem] font-bold px-2 py-0.5 bg-emerald-950 border border-emerald-700/80 text-emerald-300 uppercase flex items-center gap-1">
                <Sparkles className="size-2.5" /> BÀN CỜ VẬT LÝ
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#f4e8d8] group-hover:text-emerald-300 transition-colors uppercase">
                🎲 ĐỒNG HÀNH CÙNG BOARD GAME
              </h3>
              <p className="text-[0.7rem] text-[#b5a291] font-sans leading-relaxed">
                Tắt hoàn toàn xem trước tài liệu trên app để tập trung vào tài liệu giấy thật trên bàn. Màn hình chỉ dẫn truyện, cấp lệnh xé phong bì và đặt câu hỏi.
              </p>
            </div>

            <div className="text-[0.625rem] text-emerald-400/90 font-mono pt-2 border-t border-[#3b2a1e] flex items-center gap-1">
              <Check className="size-3" />
              <span>Chỉ Dẫn truyện + Câu hỏi + Lệnh mở phong bì</span>
            </div>
          </button>
        </div>

        {/* FOOTER NOTE */}
        <div className="flex items-center justify-between text-[0.625rem] font-mono text-[#8c7866] relative z-10 pt-2 border-t border-[#3b2a1e]">
          <span className="italic">* Bạn có thể chuyển đổi linh hoạt chế độ này bất cứ lúc nào ở góc trên màn hình.</span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-[#d9a066] hover:underline cursor-pointer ml-auto"
            >
              [ ĐÓNG ]
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
