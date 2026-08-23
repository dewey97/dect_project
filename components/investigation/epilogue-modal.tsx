'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Heart, ShieldAlert, Scale, Sparkles, BookOpen, RotateCcw, ArrowRight } from 'lucide-react'
import { TypewriterNarrator } from './evidence/typewriter-narrator'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

interface EpilogueModalProps {
  isOpen: boolean
  onClose: () => void
}

const EPILOGUE_STORIES = [
  {
    id: 'tron-tim',
    title: '1998 — Bi Kịch Trốn Tìm',
    subtitle: 'Nguyễn Thanh Tùng & Chiếc còi đồng im lìm',
    icon: Radio,
    monologue: `Trò chơi trốn tìm 12 năm trước chưa bao giờ thực sự kết thúc...\n\nKhang từ nhỏ đã bốc đồng và ganh tị với tình bạn giữa Tùng và Gia Huy. Ngày hôm đó năm 1998, Khang cố tình gài chốt gỗ nhốt Gia Huy vào tủ âm tường phòng khách rồi bỏ đi chơi. Gia Huy hoảng sợ đập tủ trong vô vọng, chiếc còi đồng đeo trên cổ không thể thổi ra tiếng kêu cứu trong chiếc tủ bọc gỗ kín khí.\n\nSuốt 12 năm qua, Tùng sống dằn dặt trong nỗi tự trách vì đã không tìm thấy em trai. Đêm 24/07/2026, Tùng mang bài báo cũ và bức ảnh 2 anh em đến đối chất với Khang. Cú xô ngã trong cơn phẫn nộ chỉ khiến Khang ngất xỉu tạm thời...\n\nTrò chơi trốn tìm năm 1998 cuối cùng đã khép lại bằng một tấn bi kịch kéo dài suốt hai thế hệ.`
  },
  {
    id: 'ha',
    title: 'Hà — Cơn Ghen Cuồng Sở Hữu',
    subtitle: 'Trần Thị Hà — Nỗi sợ bị bỏ rơi độc hại',
    icon: Heart,
    monologue: `Hà không phải kẻ ác lên kịch bản giết người từ đầu. Hà yêu Khang cuồng nhiệt nhưng luôn sống trong hoảng loạn và sợ bị bỏ rơi.\n\nĐêm 24/07, Hà rình rập ngoài ngõ rồi lén chui vào nhà lúc 20:45 thì thấy Khang đang nằm ngất xỉu bên bộ bình trà vỡ. Đúng lúc này, màn hình điện thoại của Khang sáng lên tin nhắn rủ đi du lịch từ người tình mới.\n\nSự phản bội đâm thấu tim Hà. Cơn ghen cuồng loạn kết hợp với tâm lý cuồng sở hữu độc hại bộc phát — Hà vơ mảnh thủy tinh vỡ đâm chết Khang với dòng suy nghĩ điên dại:\n\n"Nếu anh không thuộc về em, thì không ai có thể có được anh..."`
  },
  {
    id: 'vu',
    title: 'Vũ — Gánh Nặng Sĩ Diện',
    subtitle: 'Lê Quang Vũ — Chuỗi sai lầm nối tiếp',
    icon: ShieldAlert,
    monologue: `Vũ là người chồng sĩ diện nhưng bất lực. Nhìn gia đình nhà vợ (Mai) coi thường, Vũ sa lầy vào bốc họ 350M từ Khang để xoay xở làm ăn rồi dính bẫy lãi mẹ đẻ lãi con.\n\nBị Khang dùng giấy nợ đe dọa ép làm giả bản vẽ đo đạc từ 75m2 lên 120m2 và dọa tung chuyện cho Mai biết, Vũ sống trong sợ hãi tột cùng. Đêm 24/07, Vũ giả vờ cho vợ về trước để lén chui cửa sau tìm giấy nợ tiêu hủy.\n\nVũ không trực tiếp ra tay đâm người, nhưng sự lén lút và gian dối của Vũ đã vô tình đẩy chuỗi sự kiện đêm đó vào kịch bản án mạng đẫm máu.`
  },
  {
    id: 'mai',
    title: 'Mai — Bản Di Chúc Ông Nội',
    subtitle: 'Trần Ngọc Mai — Lời tạ tội muộn màng',
    icon: Scale,
    monologue: `Mai luôn nghi ngờ Khang cướp di chúc, nhưng khi cầm bản di chúc gốc đến văn phòng luật sư, Mai mới bàng hoàng biết ông nội vốn đã chia đều căn nhà cho cả 2 anh em từ năm 2018.\n\nKhang vì lòng tham đã dùng hóa chất tẩy tên Mai để chiếm trọn khoản tiền đền bù. Sự tham lam của Khang và sự nghi hận của Mai đã phá nát tình anh em ruột thịt.\n\nMai nhận lại mảnh đất đền bù nhưng mất đi người anh họ và đối mặt với người chồng (Vũ) đang vướng vào vòng lao lý vì gian lận đo đạc địa chính.`
  }
]

export function EpilogueModal({ isOpen, onClose }: EpilogueModalProps) {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0)

  if (!isOpen) return null

  const currentStory = EPILOGUE_STORIES[activeStoryIdx]

  const handleSelectStory = (idx: number) => {
    detectiveAudio.playTypewriterClick()
    setActiveStoryIdx(idx)
  }

  const resetProgress = () => {
    try {
      localStorage.removeItem('veritas_completed_checkpoints')
      window.location.reload()
    } catch {}
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 w-screen h-screen bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none">
        {/* CRT Background scanlines */}
        <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

        {/* Main Fullscreen Split View Content Area */}
        <div className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          
          {/* Left Column (60% width): Pure Storytelling Typewriter Canvas */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#261b12] p-8 lg:p-14 flex flex-col justify-center items-center bg-black overflow-y-auto custom-scrollbar">
            <div className="space-y-6 max-w-xl mx-auto w-full flex flex-col items-start">
              
              {/* Header Badge */}
              <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-widest uppercase border-b border-[#261b12] pb-3 w-full flex items-center justify-between">
                <span>{currentStory.title}</span>
                <span className="text-[0.65rem] text-[#ad9885] px-2 py-0.5 bg-[#1f150e] border border-[#3e2c1e]">
                  {currentStory.subtitle}
                </span>
              </div>

              {/* Typewriter Story Display */}
              <div className="pt-2 w-full">
                <TypewriterNarrator key={currentStory.id} text={currentStory.monologue} speed={12} />
              </div>
            </div>
          </div>

          {/* Right Column (40% width): Story Options Selector */}
          <div className="lg:col-span-5 p-6 lg:p-10 bg-[#160f0a] flex flex-col justify-between overflow-hidden">
            <div className="flex flex-col h-full justify-between">
              
              {/* Header Title */}
              <div>
                <div className="flex items-center justify-between border-b border-[#3d2a1b] pb-3 mb-6">
                  <span className="font-mono text-xs text-[#d9a066] uppercase font-bold tracking-wider flex items-center gap-2">
                    <BookOpen className="size-4" />
                    KÝ SỰ TÂM LÝ CÁC NHÂN VẬT
                  </span>
                </div>

                {/* 4 Story Option Cards */}
                <div className="space-y-3">
                  {EPILOGUE_STORIES.map((s, idx) => {
                    const Icon = s.icon
                    const isSelected = activeStoryIdx === idx
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSelectStory(idx)}
                        className={cn(
                          'w-full text-left p-4 border transition-all flex items-center justify-between cursor-pointer group',
                          isSelected
                            ? 'bg-[#2a1d13] border-[#d9a066] text-[#f4e8d8] shadow-lg scale-[1.02]'
                            : 'bg-[#1b130c] border-[#36271c] hover:border-[#573f2c] text-[#ad9885] hover:text-[#f4e8d8]'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded border transition-colors',
                            isSelected ? 'bg-[#3b291a] border-[#d9a066] text-[#d9a066]' : 'bg-[#120d08] border-[#2e2015] text-[#806f60]'
                          )}>
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <p className="font-serif text-sm font-bold tracking-wide">
                              {s.title}
                            </p>
                            <p className="text-[0.7rem] font-sans opacity-70">
                              {s.subtitle}
                            </p>
                          </div>
                        </div>

                        <ArrowRight className={cn('size-4 transition-transform', isSelected ? 'text-[#d9a066] translate-x-1' : 'opacity-0 group-hover:opacity-100')} />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Bottom Action Controls */}
              <div className="pt-6 border-t border-[#3d2a1b] flex items-center justify-between gap-3">
                <button
                  onClick={resetProgress}
                  className="flex-1 py-3 px-4 bg-[#201710] hover:bg-[#312318] border border-[#4a3626] text-[#d9a066] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  PHÁ ÁN LẠI
                </button>

                <button
                  onClick={() => {
                    try {
                      window.location.href = '/'
                    } catch {
                      onClose()
                    }
                  }}
                  className="flex-1 py-3 px-4 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  THOÁT VỀ TRANG CHỦ
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </AnimatePresence>
  )
}
