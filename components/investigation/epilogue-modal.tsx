'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Heart, ShieldAlert, Scale, BookOpen, RotateCcw, X, Home } from 'lucide-react'
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
    monologue: `Trò chơi trốn tìm 12 năm trước chưa bao giờ thực sự kết thúc...\n\nKhang từ nhỏ đã bốc đồng và ganh tị với tình bạn giữa Tùng và Gia Huy. Ngày hôm đó năm 1998, Khang cố tình gài chốt gỗ nhốt Gia Huy (cậu bé câm bẩm sinh, mắc bệnh tim) vào tủ rồi bỏ đi chơi. Gia Huy hoảng sợ đập tủ trong vô vọng rồi phát bệnh tử vong.\n\nSuốt 12 năm qua, Tùng sống dằn dặt trong nỗi tự trách vì đã không tìm thấy em trai. Cho đến hai hôm trước đêm án mạng, trong cơn say ngà ngà tại bàn nhậu, Khang vô tình buông lời đùa cợt khoe "chiến tích" gài chốt nhốt tủ năm xưa. Tùng bàng hoàng nhận ra sự thật đau đớn.\n\nĐêm 24/07/2016, Tùng mang bài báo cũ và bức ảnh 2 anh em sang nhà Khang chất vấn. Khang thờ ơ xé nát bài báo thách thức khiến Tùng bùng nổ cơn thịnh nộ. Cú xô ngã trong lúc giằng co chỉ làm Khang bất tỉnh tạm thời...\n\nTrò chơi trốn tìm năm 1998 cuối cùng đã khép lại bằng một tấn bi kịch kéo dài suốt hai thế hệ.`
  },
  {
    id: 'ha',
    title: 'Hà — Ký Sự Biệt Giam',
    subtitle: 'Trần Thị Hà — Linh hồn điên dại vì tình',
    icon: Heart,
    monologue: ` "Trò chơi trốn tìm năm 1998 đã chôn vùi một đứa trẻ...\nCòn trò trốn tìm năm 2016 đã giam cầm một linh hồn điên dại.\nKhang ơi, anh trốn đi đâu được nữa?\nMáu của anh đang ở trên môi em..."\n\nNgồi trong phòng biệt giam số 4, hai bàn tay bị còng chặt vào thanh sắt, ánh mắt Hà không hề có chút ăn năn. Hà ngửa đầu nhìn lên ô thông gió nhỏ xíu trên cao, nơi ánh trăng lạnh lẽo hắt vào tường bê tông xám xịt và lẩm bẩm hát lại bài đồng dao thuở nhỏ.\n\nVới một kẻ mang tâm lý ái kỷ chiếm hữu bệnh hoạn, cái chết của Khang không phải là sự kết thúc, mà là sự "bảo quản vĩnh cửu" cho một tình yêu lệch lạc. Hà đã biến người mình yêu thành một bức tượng bất tử không bao giờ có thể phản bội hay rời xa mình.\n\nNhưng cái giá phải trả là bản án nghiêm khắc của pháp luật và một linh hồn vĩnh viễn mục rữa sau song sắt nhà tù...`
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
    title: 'Mai — Lời Tạ Tội Muộn Màng',
    subtitle: 'Nguyễn Ngọc Mai — Di chúc của ông nội',
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
      <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none">
        {/* CRT Background scanlines */}
        <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

        {/* Top Header / Bar */}
        <header className="relative z-20 shrink-0 px-4 py-3 sm:px-6 bg-[#160f0a] border-b border-[#2e2015] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#d9a066]">
            <BookOpen className="size-4 sm:size-5" />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase">
              KÝ SỰ TÂM LÝ CÁC NHÂN VẬT
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#a8927d] hover:text-[#f4e8d8] bg-[#221810] hover:bg-[#342418] border border-[#3e2c1e] rounded transition-all cursor-pointer"
            title="Đóng"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Mobile Horizontal Tabs Selector */}
        <nav className="relative z-20 flex lg:hidden overflow-x-auto custom-scrollbar bg-[#120c08] border-b border-[#2e2015] p-2 gap-2 shrink-0">
          {EPILOGUE_STORIES.map((s, idx) => {
            const Icon = s.icon
            const isSelected = activeStoryIdx === idx
            return (
              <button
                key={s.id}
                onClick={() => handleSelectStory(idx)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-mono whitespace-nowrap transition-all shrink-0 cursor-pointer',
                  isSelected
                    ? 'bg-[#2a1d13] border-[#d9a066] text-[#d9a066] font-bold shadow-md'
                    : 'bg-[#1b130c] border-[#2e2015] text-[#9e8876] hover:text-[#e5d8cb]'
                )}
              >
                <Icon className="size-3.5" />
                <span>{s.title.split('—')[0].trim()}</span>
              </button>
            )
          })}
        </nav>

        {/* Main Content Area */}
        <div className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden min-h-0">
          
          {/* Left / Main Typewriter Story Canvas */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#261b12] p-4 sm:p-8 lg:p-12 flex flex-col justify-start items-center bg-black overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-4 sm:space-y-6 max-w-xl mx-auto w-full flex flex-col items-start py-2 sm:py-4">
              
              {/* Story Subtitle Header */}
              <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-wider border-b border-[#261b12] pb-3 w-full flex items-center justify-between">
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

          {/* Right Column (Desktop Story Selector) */}
          <div className="hidden lg:flex lg:col-span-5 p-6 lg:p-10 bg-[#160f0a] flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="flex flex-col space-y-4">
              <div className="border-b border-[#3d2a1b] pb-3">
                <span className="font-mono text-xs text-[#d9a066] uppercase font-bold tracking-wider">
                  CHỌN NHÂN VẬT THEO DÕI
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
                        'w-full text-left p-4 border rounded-xl transition-all flex items-center justify-between cursor-pointer group',
                        isSelected
                          ? 'bg-[#2a1d13] border-[#d9a066] text-[#f4e8d8] shadow-lg scale-[1.01]'
                          : 'bg-[#1b130c] border-[#36271c] hover:border-[#573f2c] text-[#ad9885] hover:text-[#f4e8d8]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2.5 rounded-lg border transition-colors',
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
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bottom Desktop Actions */}
            <div className="pt-6 border-t border-[#3d2a1b] flex items-center justify-between gap-3 mt-6">
              <button
                onClick={resetProgress}
                className="flex-1 py-3 px-4 bg-[#201710] hover:bg-[#312318] border border-[#4a3626] text-[#d9a066] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer rounded-xl"
              >
                <RotateCcw className="size-3.5" />
                <span>PHÁ ÁN LẠI</span>
              </button>

              <button
                onClick={() => {
                  try {
                    window.location.href = '/'
                  } catch {
                    onClose()
                  }
                }}
                className="flex-1 py-3 px-4 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 rounded-xl"
              >
                <Home className="size-3.5" />
                <span>TRANG CHỦ</span>
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Bottom Control Bar */}
        <footer className="relative z-20 lg:hidden shrink-0 p-3 bg-[#120c08] border-t border-[#2e2015] flex items-center gap-2">
          <button
            onClick={resetProgress}
            className="flex-1 py-2.5 px-3 bg-[#201710] hover:bg-[#312318] border border-[#4a3626] text-[#d9a066] font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 rounded-lg cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>PHÁ ÁN LẠI</span>
          </button>

          <button
            onClick={() => {
              try {
                window.location.href = '/'
              } catch {
                onClose()
              }
            }}
            className="flex-1 py-2.5 px-3 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 rounded-lg cursor-pointer"
          >
            <Home className="size-3.5" />
            <span>TRANG CHỦ</span>
          </button>
        </footer>

      </div>
    </AnimatePresence>
  )
}
