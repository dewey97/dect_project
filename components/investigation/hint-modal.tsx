'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, X, Unlock, Lock, Compass } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

interface HintModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ActiveHintGroup {
  id: string
  title: string
  statusText: string
  hints: string[]
}

function getContextAwareHintStage(): ActiveHintGroup {
  let isIndictmentSolved = false
  let isPhoneSolved = false
  let isReinvestigateUnlocked = false
  let investigatedSuspects: string[] = []
  let solvedFollowups: string[] = []
  let completedCheckpoints: string[] = []

  try {
    isIndictmentSolved = localStorage.getItem('veritas_indictment_solved') === 'true'
    isPhoneSolved =
      localStorage.getItem('veritas_phone_solved') === 'true' ||
      !!localStorage.getItem('veritas_phone_inputs')
    isReinvestigateUnlocked = localStorage.getItem('veritas_reinvestigate_unlocked') === 'true'

    const inv = localStorage.getItem('veritas_investigated_suspects')
    if (inv) investigatedSuspects = JSON.parse(inv)

    const fol = localStorage.getItem('veritas_solved_followups')
    if (fol) solvedFollowups = JSON.parse(fol)

    const cp = localStorage.getItem('veritas_completed_checkpoints')
    if (cp) completedCheckpoints = JSON.parse(cp)
  } catch {}

  // 1. CHUYÊN ÁN ĐÃ HOÀN TẤT
  if (
    isIndictmentSolved ||
    completedCheckpoints.includes('cp-000-2b') ||
    completedCheckpoints.includes('cp-000-3')
  ) {
    return {
      id: 'stage-completed',
      title: 'Chuyên Án Đã Hoàn Tất',
      statusText: 'Bản cáo trạng đã được Viện Kiểm sát phê chuẩn',
      hints: [
        'Chuyên án đã được phá thành công xuất sắc!',
        'Bạn có thể mở Ký sự Hậu án (Epilogue) để theo dõi toàn bộ lời tự thú và diễn biến sau xét xử.'
      ]
    }
  }

  // 2. LẬP BẢN CÁO TRẠNG
  if (
    solvedFollowups.includes('ha') ||
    completedCheckpoints.includes('cp-000-2a') ||
    completedCheckpoints.includes('cp-000-2')
  ) {
    return {
      id: 'stage-indictment',
      title: 'Lập Bản Cáo Trạng & Kết Án',
      statusText: 'Đã thu thập đủ chứng cứ định tội',
      hints: [
        'Thủ phạm chính là Trần Thị Hà, động cơ do mâu thuẫn tình cảm và ghen tuông cực đoan khi Khang chuẩn bị tiền bỏ trốn với Vy.',
        'Nhập chính xác các mã vật chứng: Mục 2.1 là 52; Mục 2.2 là 50 hoặc 51; Mục 2.3 là 53.',
        'Đệ trình bản cáo trạng lên Viện Kiểm sát để hoàn tất chuyên án.'
      ]
    }
  }

  // 3. THẨM TRA HÀ & KHỚP NỐI VẬT CHỨNG
  if (
    investigatedSuspects.includes('ha') ||
    isReinvestigateUnlocked ||
    completedCheckpoints.includes('cp-000-convergence') ||
    completedCheckpoints.includes('cp-000-1b')
  ) {
    return {
      id: 'stage-ha',
      title: 'Thẩm Tra Trần Thị Hà & Khớp Nối Vật Chứng',
      statusText: 'Đang làm rõ ngoại phạm và chứng cứ phòng trọ',
      hints: [
        'Hà khai ngồi xem phim truyện phát trên VTV3 từ 20:30 đến 21:30. Nhưng kiểm tra Lịch phát sóng VTV3 tối thứ Sáu thực tế chỉ chiếu Gameshow truyền hình.',
        'Trong đoạn tin nhắn thoại lúc 20:32 có lẫn tiếng còi tàu hỏa đặc trưng chỉ nghe thấy rõ khi đứng ngay tại khu vực trước nhà Khang sát đường ray.',
        'Đối chiếu 3 vật phẩm thu tại phòng Hà: Áo gió dính phấn hoa (45, 10, 6), Kéo và lọn tóc mai dính máu (4), Bùa yêu (49).'
      ]
    }
  }

  // 4. BÓC TÁCH MÂU THUẪN VŨ & TÙNG (CÂU HỎI SUY LUẬN)
  if (
    (investigatedSuspects.includes('vu') && investigatedSuspects.includes('tung')) ||
    completedCheckpoints.includes('cp-000-1a') ||
    completedCheckpoints.includes('cp-000-1')
  ) {
    return {
      id: 'stage-reinvestigate',
      title: 'Bóc Tách Mâu Thuẫn Vũ & Tùng',
      statusText: 'Đang xác định mốc giờ rời đi và biến cố năm 1996',
      hints: [
        'Hãy mở câu hỏi suy luận của Lê Quang Vũ (mốc rời Quán Bia 88 lúc 21:15) và Nguyễn Thanh Tùng (rời đi lúc 20:15 trước chuyến tàu 20:30).',
        'Lấy vụ ẩu đả và số tiền thanh toán chuyển khoản làm mốc đối chiếu thời gian cho Vũ.',
        'Sau khi trả lời xong câu hỏi của Vũ và Tùng, Lệnh Tái Khám Xét Hiện Trường sẽ được phê duyệt tự động.'
      ]
    }
  }

  // 5. THẨM TRA NGHI PHẠM BƯỚC ĐẦU (VŨ / TÙNG)
  if (isPhoneSolved || completedCheckpoints.includes('cp-000-0')) {
    return {
      id: 'stage-suspects',
      title: 'Thẩm Tra Nghi Phạm Bước Đầu',
      statusText: 'Đã xác định 3 SĐT, bắt đầu thẩm tra',
      hints: [
        'Hãy chọn Lê Quang Vũ hoặc Nguyễn Thanh Tùng để thẩm tra động cơ và bóc tách mâu thuẫn ngoại phạm.',
        'Nếu thẩm tra Vũ: chú ý Sổ nợ (13, 10), SMS dev-00 và thời gian xe đón 42. Nếu thẩm tra Tùng: chú ý biến cố năm 1996 (18, 40) và mâu thuẫn hiện trường (20, 41).',
        'Tiếp tục hoàn tất thẩm tra cả 2 đối tượng để mở rộng sang các câu hỏi suy luận.'
      ]
    }
  }

  // 6. KHỞI ĐẦU: TRUY TÌM DANH TÍNH 3 SĐT
  return {
    id: 'stage-phone',
    title: 'Truy Tìm Danh Tính 3 SĐT Ẩn Danh',
    statusText: 'Giai đoạn khởi đầu điều tra',
    hints: [
      'Hãy mở Điện thoại nạn nhân Khang kiểm tra Nhật ký cuộc gọi và đối chiếu với Sổ nợ, Bảng tin để xác định 3 số lạ trong đêm.',
      'Nạn nhân Nguyễn Văn Khang sinh ngày 04/08/1988 (Mã PIN mở máy: 0408). Đối chiếu Call log với Sổ nợ (10) và Bảng tin (11).',
      'Ba số điện thoại: 0988.200.991 (Lê Quang Vũ - nợ 350M), 0912.331.888 (Nguyễn Thanh Tùng), 0984.180.357 (Đạt Gà Chợ Cảng).'
    ]
  }
}

export function HintModal({ isOpen, onClose }: HintModalProps) {
  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, number>>({})
  const [activeStage, setActiveStage] = useState<ActiveHintGroup | null>(null)

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('veritas_hint_unlocked_levels')
        if (saved) {
          setUnlockedLevels(JSON.parse(saved))
        }
      } catch {}
      setActiveStage(getContextAwareHintStage())
    }
  }, [isOpen])

  if (!isOpen || !activeStage) return null

  const currentUnlockedCount = unlockedLevels[activeStage.id] || 1

  const handleUnlockNext = () => {
    detectiveAudio.playTypewriterClick()
    const nextCount = Math.min(currentUnlockedCount + 1, activeStage.hints.length)
    const updated = {
      ...unlockedLevels,
      [activeStage.id]: nextCount
    }
    setUnlockedLevels(updated)
    try {
      localStorage.setItem('veritas_hint_unlocked_levels', JSON.stringify(updated))
    } catch {}
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-none overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* HEADER */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8c1d1d] flex items-center gap-1.5">
                <Lightbulb className="size-3.5 text-[#8c1d1d]" />
                SỔ TAY GỢI Ý ĐIỀU TRA // CASE 000
              </span>
              <h3 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wider">
                Gợi Ý & Manh Mối Phá Án
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                detectiveAudio.playPaperRustle()
                onClose()
              }}
              className="p-1.5 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer border border-[#5c4026]/40"
              title="Đóng"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* ACTIVE STAGE CONTENT AREA */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5] custom-scrollbar">
            {/* STAGE TITLE BAR */}
            <div className="border-b-2 border-[#2b1f14]/20 pb-3 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#8c1d1d] font-mono text-[11px] font-bold uppercase tracking-wider">
                  <Compass className="size-3.5" />
                  <span>TIẾN TRÌNH HIỆN TẠI</span>
                </div>
                <h4 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wide">
                  {activeStage.title}
                </h4>
              </div>
            </div>

            {/* HINTS LIST */}
            <div className="space-y-3 pt-1">
              {activeStage.hints.map((hintText, hIdx) => {
                const isUnlocked = hIdx < currentUnlockedCount
                return (
                  <div
                    key={hIdx}
                    className={cn(
                      'p-3.5 border-2 transition-all rounded-none relative font-sans text-xs sm:text-[13px] leading-relaxed',
                      isUnlocked
                        ? 'bg-[#fdfbf7] border-[#2b1f14] text-[#1a120b] shadow-sm'
                        : 'bg-[#ede3d1]/50 border-dashed border-[#a69177] text-[#7a6b5c] select-none'
                    )}
                  >
                    <div className="flex items-center gap-2 border-b border-[#2b1f14]/15 pb-1.5 mb-2 font-mono text-[10px] sm:text-[11px] font-bold uppercase">
                      <span className="flex items-center gap-1.5 text-[#8c1d1d]">
                        {isUnlocked ? <Unlock className="size-3.5" /> : <Lock className="size-3.5" />}
                        Gợi ý mức {hIdx + 1}
                      </span>
                    </div>

                    {isUnlocked ? (
                      <p className="text-[#1a120b]">{hintText}</p>
                    ) : (
                      <p className="italic text-[#7a6b5c]">
                        Manh mối này đang bị ẩn. Nhấn nút mở gợi ý tiếp theo bên dưới nếu bạn gặp bế tắc.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* UNLOCK NEXT HINT BUTTON */}
            {currentUnlockedCount < activeStage.hints.length && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleUnlockNext}
                  className="px-5 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border-2 border-[#2b1f14] shadow-md active:scale-95 rounded-none"
                >
                  <Unlock className="size-3.5 text-[#d9a066]" />
                  <span>MỞ GỢI Ý TIẾP THEO ({currentUnlockedCount + 1}/{activeStage.hints.length})</span>
                </button>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="bg-[#ede3d1] px-4 py-3 border-t-2 border-[#2b1f14] flex items-center justify-end text-xs font-mono text-[#5c4026]">
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playPaperRustle()
                onClose()
              }}
              className="px-5 py-1.5 bg-[#2b1f14] text-[#f6f1e5] font-bold uppercase cursor-pointer rounded-none hover:bg-[#140d08]"
            >
              ĐÓNG
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
