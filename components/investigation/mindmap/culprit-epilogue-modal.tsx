'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { TypewriterNarrator } from '@/components/investigation/evidence/typewriter-narrator'
import { detectiveAudio } from '@/lib/investigation-audio'

interface CulpritEpilogueModalProps {
  isOpen: boolean
  culprit: 'vu' | 'tung' | 'ha' | null
  choice?: string | null
  onClose: () => void
  onOpenDossier?: (dossierType: 'A' | 'B' | 'C') => void
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
  const [internalChoice, setInternalChoice] = useState<'tin' | 'khong_tin' | null>(
    (choice === 'tin' || choice === 'khong_tin') ? choice : null
  )

  React.useEffect(() => {
    setIsNarrativeComplete(false)
    if (choice === 'tin' || choice === 'khong_tin') {
      setInternalChoice(choice)
    } else {
      setInternalChoice(null)
    }
  }, [culprit, choice, isOpen])

  if (!isOpen || !culprit) return null

  const isVu = culprit === 'vu'
  const isTung = culprit === 'tung'
  const isHa = culprit === 'ha'
  const isHaMatchedAll = isHa && choice === 'matched_3_tiles'
  const suspectName = isVu ? 'Lê Quang Vũ' : isTung ? 'Nguyễn Thanh Tùng' : 'Trần Thị Hà'

  let dateLabel = isVu
    ? 'QUYẾT ĐỊNH ĐIỀU TRA ĐỐI TƯỢNG LÊ QUANG VŨ'
    : isTung
    ? 'QUYẾT ĐỊNH ĐIỀU TRA ĐỐI TƯỢNG NGUYỄN THANH TÙNG'
    : isHaMatchedAll
    ? 'DẪN TRUYỆN BUỘC TỘI — TRẦN THỊ HÀ (25/07/2016)'
    : 'QUYẾT ĐỊNH ĐIỀU TRA ĐỐI TƯỢNG TRẦN THỊ HÀ'

  let storyText = ''

  if (internalChoice === 'tin') {
    storyText = `Bạn lựa chọn tạm thời tin tưởng ${suspectName}.\n\nHãy chuyển hướng điều tra vụ án.\nTuy nhiên, xin các thám tử nhớ rằng: Một người chỉ được kết luận vô tội khi bạn tìm ra được hung thủ thực sự.`
  } else if (internalChoice === 'khong_tin') {
    storyText = `Bạn không tin đối tượng ${suspectName} vô tội.\n\nHãy lập tức mở rộng điều tra, truy quét thêm các manh mối để chứng minh suy luận của mình.`
  } else if (isHaMatchedAll) {
    storyText =
      'Chiếc áo gió màu xám đen dính bụi đất cây xoan khớp chính xác nhân dạng kẻ rình rập trước cổng nhà Khang lúc 19:25. Vỉ thuốc an thần Diazepam bóc dở 4 viên trùng khớp hoạt chất trong cặn ấm trà hoa cúc và dịch dạ dày nạn nhân. Và trên hết, lọn tóc mai dính máu giấu trong áo ngực có kết quả giám định sinh học trùng khớp 100% mẫu ADN của nạn nhân Nguyễn Văn Khang.\n\nTrước chuỗi chứng cứ đanh thép không thể chối cãi, bức tường ngoại phạm của Trần Thị Hà hoàn toàn sụp đổ. Cơn cuồng ghen bệnh hoạn khi phát hiện Khang chuẩn bị tiền bỏ trốn cùng nhân tình mới đã biến tình yêu mù quáng thành tội ác giết người man rợ lúc 21:00.\n\nToàn bộ sự thật đã được phơi bày ra ánh sáng. Đã đủ căn cứ pháp lý để lập hồ sơ đề nghị Viện Kiểm sát truy tố thủ phạm trước pháp luật.'
  } else if (isVu) {
    storyText =
      'Vỏ bọc vô can của Lê Quang Vũ đã chính thức sụp đổ.\n\nNhững mối thù hằn âm ỉ với nạn nhân bị phơi bày, cùng lời khai gian dối về bằng chứng ngoại phạm đã biến Vũ trở thành đối tượng tình nghi trọng điểm.\n\nHãy mở ngay Hồ sơ A để nắm bắt toàn bộ tiến trình điều tra tiếp theo.'
  } else if (isTung) {
    storyText =
      'Vỏ bọc vô can của Nguyễn Thanh Tùng đã chính thức sụp đổ.\n\nNhững mối thù hằn âm ỉ với nạn nhân bị phơi bày, cùng lời khai gian dối về bằng chứng ngoại phạm đã biến Tùng trở thành đối tượng tình nghi trọng điểm.\n\nHãy mở ngay Hồ sơ B để thực hiện thẩm vấn đối tượng.'
  } else if (isHa) {
    storyText =
      'Vỏ bọc vô can của Trần Thị Hà đã chính thức sụp đổ.\n\nNhững mối thù hằn âm ỉ với nạn nhân bị phơi bày, cùng lời khai gian dối về bằng chứng ngoại phạm đã biến Hà trở thành đối tượng tình nghi trọng điểm.\n\nHãy mở ngay Hồ sơ C để nắm bắt toàn bộ tiến trình điều tra tiếp theo.'
  } else {
    storyText =
      'Biên bản lấy lời khai ban đầu cho thấy Trần Thị Hà khẳng định mình ở phòng trọ xem phim bộ VTV3 suốt buổi tối định mệnh.\n\nThế nhưng những mâu thuẫn bất thường bắt đầu lộ diện: lịch phát sóng tối thứ Sáu của VTV3 chỉ phát Gameshow truyền hình chứ không có bất kỳ bộ phim nào. Cùng lúc đó, tin nhắn thoại gửi lúc 20:32 lọt rõ tiếng còi tàu hỏa và chuông cảnh báo rào chắn — âm thanh chỉ xuất hiện ngay trước ngõ nhà Khang.\n\nCần tiến hành đối soát và khớp nối toàn bộ vật chứng thu giữ tại nơi ở của đối tượng để bóc trần sự thật.'
  }

  let ctaButtonText = 'TIẾP TỤC ĐIỀU TRA'
  if (!choice && !internalChoice) {
    ctaButtonText = 'Bắt đầu điều tra'
  } else if (internalChoice === 'tin') {
    ctaButtonText = 'Chuyển hướng điều tra'
  } else if (internalChoice === 'khong_tin') {
    ctaButtonText = 'Mở rộng điều tra'
  } else if (isHaMatchedAll) {
    ctaButtonText = 'Đề nghị truy tố'
  }

  const handleCtaClick = () => {
    detectiveAudio.playStampSound()
    onClose()
    if (!choice && !internalChoice && onOpenDossier) {
      if (isVu) onOpenDossier('A')
      else if (isTung) onOpenDossier('B')
      else if (isHa) onOpenDossier('C')
    } else if (isHa && internalChoice === 'khong_tin' && onOpenFollowupQuestion) {
      onOpenFollowupQuestion()
    } else if (isHaMatchedAll && onOpenIndictment) {
      onOpenIndictment()
    }
  }

  const showTwoChoiceButtons = (isVu || isTung) && !internalChoice

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none">
        {/* CRT Scanlines effect */}
        <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

        {/* Main Fullscreen Cinematic Container */}
        <div className="relative z-20 flex-1 h-full flex flex-col justify-between items-center p-4 sm:p-8 max-w-3xl mx-auto w-full overflow-hidden">
          <div className="space-y-6 w-full flex-1 flex flex-col items-start my-auto py-4 overflow-y-auto custom-scrollbar pr-1">
            {/* Top Date / Subject Header */}
            <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-widest uppercase border-b border-[#261b12] pb-3 w-full flex items-center justify-between shrink-0">
              <span>{dateLabel}</span>
            </div>

            {/* Typewriter Monologue */}
            <div className="pt-2 w-full flex-1 overflow-y-auto custom-scrollbar">
              <TypewriterNarrator
                key={`${culprit}-${internalChoice || 'default'}`}
                text={storyText}
                speed={12}
                onComplete={() => setIsNarrativeComplete(true)}
              />
            </div>
          </div>

          {/* Bottom Action Area */}
          {showTwoChoiceButtons ? (
            <div className="w-full pt-4 pb-2 shrink-0 max-w-md mx-auto grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playPaperRustle()
                  setInternalChoice('tin')
                }}
                className="py-3.5 bg-[#2e5220] hover:bg-[#203a16] text-[#f6f1e5] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 border-2 border-[#193310] active:scale-[0.99]"
              >
                <span>TIN</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playGlassSound()
                  setInternalChoice('khong_tin')
                }}
                className="py-3.5 bg-[#8c1d1d] hover:bg-[#a82424] text-[#fff5f5] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 border-2 border-[#5c1313] active:scale-[0.99]"
              >
                <span>KHÔNG TIN</span>
              </button>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </AnimatePresence>
  )
}
