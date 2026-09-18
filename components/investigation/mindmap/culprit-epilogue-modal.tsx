'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Search, X, Gavel } from 'lucide-react'
import { TypewriterNarrator } from '@/components/investigation/evidence/typewriter-narrator'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

interface CulpritEpilogueModalProps {
  isOpen: boolean
  culprit: 'vu' | 'tung' | 'ha' | null
  choice?: string | null
  onClose: () => void
  onOpenDossier?: (dossierType: 'A' | 'B') => void
  onOpenFollowupQuestion?: () => void
  onOpenIndictment?: () => void
}

export function CulpritEpilogueModal({
  isOpen,
  culprit,
  choice,
  onClose,
  onOpenDossier,
  onOpenFollowupQuestion,
  onOpenIndictment
}: CulpritEpilogueModalProps) {
  const [isNarrativeComplete, setIsNarrativeComplete] = useState(false)

  React.useEffect(() => {
    setIsNarrativeComplete(false)
  }, [culprit, choice, isOpen])

  if (!isOpen || !culprit) return null

  const isVu = culprit === 'vu'
  const isTung = culprit === 'tung'
  const isHa = culprit === 'ha'
  const isTin = isTung && choice === 'tin'
  const isKhongTin = isTung && choice === 'khong_tin'
  const isHaMatchedAll = isHa && choice === 'matched_3_tiles'

  let dateLabel = isVu
    ? 'DẪN TRUYỆN — LÊ QUANG VŨ (25/07/2016)'
    : isTung
    ? 'DẪN TRUYỆN — NGUYỄN THANH TÙNG (25/07/2016)'
    : isHaMatchedAll
    ? 'DẪN TRUYỆN BUỘC TỘI — TRẦN THỊ HÀ (25/07/2016)'
    : 'DẪN TRUYỆN — TRẦN THỊ HÀ (25/07/2016)'

  let storyText = isVu
    ? 'Dẫn truyện Vũ - tôi thay vào sau'
    : isTung
    ? 'Dẫn truyện Tùng - tôi thay vào sau'
    : 'Biên bản lấy lời khai ban đầu cho thấy Trần Thị Hà khẳng định mình ở phòng trọ xem phim bộ VTV3 suốt buổi tối định mệnh.\n\nThế nhưng những mâu thuẫn bất thường bắt đầu lộ diện: lịch phát sóng tối thứ Sáu của VTV3 chỉ phát Gameshow truyền hình chứ không có bất kỳ bộ phim nào. Cùng lúc đó, tin nhắn thoại gửi lúc 20:32 lọt rõ tiếng còi tàu hỏa và chuông cảnh báo rào chắn — âm thanh chỉ xuất hiện ngay trước ngõ nhà Khang.\n\nCần tiến hành đối soát và khớp nối toàn bộ vật chứng thu giữ tại nơi ở của đối tượng để bóc trần sự thật.'

  if (isTin) {
    storyText =
      'Nếu Tùng thực sự chỉ xô ngã Khang trong cơn kích động rồi hoảng loạn bỏ chạy lúc 20:15, thì vết thương chí mạng ở cổ vào lúc 21:00 chắc chắn do một kẻ khác gây ra sau đó.\n\nMảnh thủy tinh cắm sâu vào cổ họng là một đòn kết liễu tàn nhẫn, mang đầy tính thù hận cá nhân. Tùng không có lý do gì để quay lại sát hại bạn cũ sau khi đã hoảng sợ bỏ trốn.\n\nHướng điều tra cần tập trung làm rõ các đối tượng còn lại xuất hiện quanh hiện trường trong khung giờ định mệnh.'
  } else if (isKhongTin) {
    storyText =
      'Dấu vân tay của Tùng in đậm trên khung ảnh vỡ tại hiện trường, cùng với mối thù sâu đậm từ cái chết của người em trai Gia Huy năm 1996 khiến Tùng trở thành kẻ có động cơ trả thù lớn nhất.\n\nLiệu lời khai bỏ chạy lúc 20:15 có phải là bức bình phong che giấu việc hắn đã quay lại ra tay tàn độc? Hay hắn đang cố tình che giấu một hung khí hoặc hành vi khác chưa được làm sáng tỏ?\n\nNếu nghi ngờ Tùng là kẻ thủ ác, ta cần tiếp tục đào sâu hiện trường, thu thập thêm chứng cứ vật chất để bóc trần tội ác.'
  } else if (isHaMatchedAll) {
    storyText =
      'Chiếc áo gió màu xám đen dính bụi đất cây xoan khớp chính xác nhân dạng kẻ rình rập trước cổng nhà Khang lúc 19:25. Vỉ thuốc an thần Diazepam bóc dở 4 viên trùng khớp hoạt chất trong cặn ấm trà hoa cúc và dịch dạ dày nạn nhân. Và trên hết, lọn tóc mai dính máu giấu trong áo ngực có kết quả giám định sinh học trùng khớp 100% mẫu ADN của nạn nhân Nguyễn Văn Khang.\n\nTrước chuỗi chứng cứ đanh thép không thể chối cãi, bức tường ngoại phạm của Trần Thị Hà hoàn toàn sụp đổ. Cơn cuồng ghen bệnh hoạn khi phát hiện Khang chuẩn bị tiền bỏ trốn cùng nhân tình mới đã biến tình yêu mù quáng thành tội ác giết người man rợ lúc 21:00.\n\nToàn bộ sự thật đã được phơi bày ra ánh sáng. Đã đủ căn cứ pháp lý để lập hồ sơ đề nghị Viện Kiểm sát truy tố thủ phạm trước pháp luật.'
  }

  let ctaButtonText = 'TIẾP TỤC ĐIỀU TRA'
  if (isTin) {
    ctaButtonText = 'Điều tra nghi phạm khác'
  } else if (isKhongTin) {
    ctaButtonText = 'Tìm thêm chứng cứ chứng minh tội ác'
  }

  const handleCtaClick = () => {
    detectiveAudio.playStampSound()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none">
        {/* CRT Scanlines effect */}
        <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

        {/* Main Fullscreen Cinematic Container (Matching Opening Day 25/07) */}
        <div className="relative z-20 flex-1 h-full flex flex-col justify-between items-center p-4 sm:p-8 max-w-3xl mx-auto w-full overflow-hidden">
          <div className="space-y-6 w-full flex-1 flex flex-col items-start my-auto py-4 overflow-y-auto custom-scrollbar pr-1">
            {/* Top Date / Subject Header */}
            <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-widest uppercase border-b border-[#261b12] pb-3 w-full flex items-center justify-between shrink-0">
              <span>{dateLabel}</span>
            </div>

            {/* Typewriter Monologue */}
            <div className="pt-2 w-full flex-1 overflow-y-auto custom-scrollbar">
              <TypewriterNarrator
                key={`${culprit}-${choice || 'default'}`}
                text={storyText}
                speed={12}
                onComplete={() => setIsNarrativeComplete(true)}
              />
            </div>
          </div>

          {/* Clean Bottom Action Button: Standard Amber CTA */}
          <div className="w-full pt-4 pb-2 shrink-0 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleCtaClick}
              className="w-full py-3.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] animate-fade-in"
            >
              <Search className="size-4.5" />
              <span>{ctaButtonText}</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}
