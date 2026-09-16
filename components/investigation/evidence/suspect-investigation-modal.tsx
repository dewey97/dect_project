'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert,
  FileText,
  User,
  Check,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { detectiveAudio } from '@/lib/investigation-audio'

export interface SuspectProfile {
  id: string
  name: string
  role: string
  avatar: string
  statusTag: string
  bio: string
  alibi: string
  requiredEvidenceIds: string[]
  evidenceOptions: { id: string; label: string; code: string; description: string }[]
  verificationResult: {
    title: string
    summary: string
    alibiStatus: 'cleared' | 'culprit' | 'partial'
  }
}

const SUSPECTS_DATA: SuspectProfile[] = [
  {
    id: 'vu',
    name: 'Lê Quang Vũ',
    role: 'Nghi phạm 2 — Chồng Mai (Kỹ sư điện)',
    avatar: '👷',
    statusTag: 'Chưa bóc trần mốc giờ 19:30',
    bio: 'Khai cùng Mai đến đòi đất lúc 18:30 và ra cổng về cùng Mai lúc 19:00. Tuy nhiên giấu Mai bốc họ nợ Khang 300 triệu đồng.',
    alibi: 'Khai rời đi lúc 19:00 về nhà, nhưng có nghi vấn nán lại xin hoãn nợ bị Khang đe dọa.',
    requiredEvidenceIds: ['doc_10_so_no', 'sms_dev00', 'p6_anh_vu', 'doc_06_loi_khai_lua', 'p10_app_xe'],
    evidenceOptions: [
      { id: 'doc_10_so_no', label: 'Sổ tay ghi nợ của Khang', code: '10', description: 'Khoản nợ 300M biệt danh Lệch Pha' },
      { id: 'sms_dev00', label: 'SMS đòi nợ trên điện thoại Khang', code: 'dev-00', description: 'Tin nhắn đe dọa mách gia đình vợ Vũ' },
      { id: 'p6_anh_vu', label: 'Ảnh chân dung Lê Quang Vũ', code: 'p6', description: 'Nhân dạng kỹ sư điện' },
      { id: 'doc_06_loi_khai_lua', label: 'Lời khai bà Lụa (06/11)', code: '06', description: 'Nghe tiếng xe máy Mai nổ máy rời đi 19:00' },
      { id: 'p10_app_xe', label: 'Screenshot App đặt xe của Vũ', code: 'p10', description: 'Đón xe lúc 19:30:15 ra Quán Bia 88' },
      { id: 'doc_14_loi_khai_tung', label: 'Lời khai Nguyễn Thanh Tùng lần 1', code: '14', description: 'Lời khai của Tùng' }
    ],
    verificationResult: {
      title: 'BÓC TRẦN LỜI KHAI LÊ QUANG VŨ',
      summary: 'Vũ bị bắt thóp nán lại 30 phút (19:00 - 19:30) xin hoãn nợ. Nhưng Vũ có ngoại phạm lúc 21:00 nhờ hóa đơn chuyển khoản Quán Bia 88.',
      alibiStatus: 'cleared'
    }
  },
  {
    id: 'tung',
    name: 'Nguyễn Thanh Tùng',
    role: 'Nghi phạm 3 — Anh trai bé Gia Huy (Thợ nề)',
    avatar: '👨',
    statusTag: 'Chưa đối chất hiện trường vỡ kính',
    bio: 'Anh trai bé Gia Huy tử vong trong tủ gỗ năm 1996. Khai chỉ gọi điện 19:55, không sang gặp Khang.',
    alibi: 'Khai ở nhà bán hàng, chỉ gọi điện hỏi chuyện cũ chứ không sang nhà Khang.',
    requiredEvidenceIds: ['doc_14_loi_khai_tung', 'p4_van_tay', 'p5_manh_bao', 'p4_anh_1996'],
    evidenceOptions: [
      { id: 'doc_14_loi_khai_tung', label: 'Lời khai Nguyễn Thanh Tùng lần 1', code: '14', description: 'Khai không sang nhà Khang' },
      { id: 'p4_van_tay', label: 'Dấu vân tay trên khung ảnh vỡ', code: 'p4', description: 'Trùng khớp 100% vân tay ngón trỏ Tùng' },
      { id: 'p5_manh_bao', label: 'Mảnh báo cũ 1996 xé vụn ghép lại', code: 'p5', description: 'Bài báo vụ án tủ gỗ năm 1996' },
      { id: 'p4_anh_1996', label: 'Ảnh kỷ niệm hè 1996', code: 'p4', description: 'Bức ảnh Tùng bế em trai Gia Huy' },
      { id: 'p10_app_xe', label: 'Screenshot App đặt xe của Vũ', code: 'p10', description: 'Lịch sử chuyến xe Vũ' }
    ],
    verificationResult: {
      title: 'BÓC TRẦN LỜI KHAI NGUYỄN THANH TÙNG',
      summary: 'Tùng sang đối chất lúc 20:00, xô Khang ngã ngất xỉu rồi hoảng sợ bỏ chạy lúc 20:15 (Khang chưa bị đâm cổ).',
      alibiStatus: 'cleared'
    }
  },
  {
    id: 'mai',
    name: 'Nguyễn Ngọc Mai',
    role: 'Nghi phạm 1 — Em họ Khang',
    avatar: '👩',
    statusTag: 'Đã xác minh ngoại phạm TV 20:10',
    bio: 'Đến đòi đất 200m² lúc 18:30, ném đơn tố cáo p2 xuống sàn và nổ máy xe phóng về nhà lúc 19:00.',
    alibi: 'Nổ máy xe rời đi đúng 19:00 (lời khai bà Lụa), về nhà xem TV mất cáp 20:10 (Bảng tin 18).',
    requiredEvidenceIds: [],
    evidenceOptions: [],
    verificationResult: {
      title: 'XÁC MINH NGOẠI PHẠM NGUYỄN NGỌC MAI',
      summary: 'Mai có bằng chứng ngoại phạm khách quan lúc ~21:00 tại Phố Đoàn Kết (sự cố đứt cáp truyền hình).',
      alibiStatus: 'cleared'
    }
  },
  {
    id: 'ha',
    name: 'Trần Thị Hà',
    role: 'Nghi phạm 4 — Kế toán (Bạn gái Khang)',
    avatar: '👩‍💼',
    statusTag: 'Đang theo dõi ngoại phạm VTV3',
    bio: 'Khai ở phòng trọ xem phim bộ VTV3 cả tối. Tuy nhiên voice 20:32 lọt tiếng còi tàu gác chắn trước nhà Khang.',
    alibi: 'Khai ở phòng trọ xem VTV3, không có mặt tại hiện trường.',
    requiredEvidenceIds: [],
    evidenceOptions: [],
    verificationResult: {
      title: 'BÓC TRẦN THỦ PHẠM TRẦN THỊ HÀ',
      summary: 'Hà đứng rình từ 19:25, lẻn vào 20:45 ghen tuông điên dại đâm Khang tử vong lúc ~21:00.',
      alibiStatus: 'culprit'
    }
  }
]

interface SuspectInvestigationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SuspectInvestigationModal({ isOpen, onClose }: SuspectInvestigationModalProps) {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>('vu')
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([])
  const [verifiedSuspectIds, setVerifiedSuspectIds] = useState<string[]>([])
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('veritas_verified_suspects')
      if (saved) {
        setVerifiedSuspectIds(JSON.parse(saved))
      }
    } catch {}
  }, [isOpen])

  if (!isOpen) return null

  const currentSuspect = SUSPECTS_DATA.find((s) => s.id === selectedSuspectId) || SUSPECTS_DATA[0]
  const isVerified = verifiedSuspectIds.includes(currentSuspect.id)

  const toggleEvidence = (id: string) => {
    detectiveAudio.playPaperRustle()
    setSelectedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
    setSubmitFeedback(null)
  }

  const handleVerifySuspect = () => {
    // Check evidence requirements
    const missing = currentSuspect.requiredEvidenceIds.filter((id) => !selectedEvidenceIds.includes(id))

    if (missing.length === 0 || currentSuspect.requiredEvidenceIds.length === 0) {
      detectiveAudio.playStampSound()
      detectiveAudio.playUnlockJingle()

      const updated = [...new Set([...verifiedSuspectIds, currentSuspect.id])]
      setVerifiedSuspectIds(updated)
      try {
        localStorage.setItem('veritas_verified_suspects', JSON.stringify(updated))
      } catch {}

      setSubmitFeedback({
        type: 'success',
        msg: `Thẩm tra thành công! ${currentSuspect.verificationResult.summary}`
      })
    } else {
      detectiveAudio.playGlassSound()
      setSubmitFeedback({
        type: 'error',
        msg: `Chứng cứ chưa đủ! Cần chọn đúng các tài liệu mấu chốt để bóc trần lời khai của ${currentSuspect.name}.`
      })
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-4xl bg-[#140e0a] border-2 border-[#4d3624] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#e6d3c1]"
        >
          {/* HEADER */}
          <div className="px-5 py-4 bg-[#21160e] border-b border-[#3d2a1c] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#332014] border border-[#593a24] text-[#d9a066] rounded-xl">
                <UserCheck className="size-5" />
              </div>
              <div>
                <h2 className="font-mono text-sm sm:text-base font-bold uppercase tracking-wider text-[#f4e8d8]">
                  HỒ SƠ & THẨM TRA ĐỐI TƯỢNG TÌNH NGHI
                </h2>
                <p className="text-xs text-[#a38d7a]">
                  Điều tra đối tượng tình nghi tự do — Bóc tách mâu thuẫn ngoại phạm bất cứ lúc nào
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#2a1b11] hover:bg-[#3d2719] border border-[#4d3523] text-[#ad9885] hover:text-[#f4e8d8] transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* MAIN BODY: 2 COLUMNS */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
            {/* LEFT SIDEBAR: SUSPECT LIST */}
            <div className="w-full md:w-72 bg-[#18100b] border-r border-[#382619] p-3 space-y-2 overflow-y-auto custom-scrollbar shrink-0">
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-[#a88a6f] px-2 block mb-1">
                DANH SÁCH NGHI PHẠM ({SUSPECTS_DATA.length})
              </span>

              {SUSPECTS_DATA.map((s) => {
                const isSelected = s.id === selectedSuspectId
                const isVerifiedSuspect = verifiedSuspectIds.includes(s.id)

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      detectiveAudio.playTypewriterClick()
                      setSelectedSuspectId(s.id)
                      setSelectedEvidenceIds([])
                      setSubmitFeedback(null)
                    }}
                    className={cn(
                      'w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5',
                      isSelected
                        ? 'bg-[#2c1d12] border-[#d9a066] shadow-md'
                        : 'bg-[#1e140d] border-[#382517] hover:bg-[#24180f] hover:border-[#4d3420]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{s.avatar}</span>
                      <div className="min-w-0">
                        <h4 className={cn('text-xs font-bold truncate', isSelected ? 'text-[#f4e8d8]' : 'text-[#c7b5a3]')}>
                          {s.name}
                        </h4>
                        <span className="text-[0.65rem] text-[#9c8572] block truncate">{s.role}</span>
                      </div>
                    </div>

                    {isVerifiedSuspect && (
                      <span title="Đã thẩm tra thành công">
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* RIGHT MAIN PANEL: SUSPECT DETAILS & INTERROGATION FORM */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 bg-[#120b07]">
              {/* PROFILE HEADER CARD */}
              <div className="p-4 bg-[#1b120b] border border-[#3b2718] rounded-xl space-y-3 relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-[#281a10] rounded-xl border border-[#4a3220]">
                      {currentSuspect.avatar}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-[#f4e8d8] font-serif">{currentSuspect.name}</h3>
                      <p className="text-xs text-[#d9a066] font-mono">{currentSuspect.role}</p>
                    </div>
                  </div>

                  {isVerified ? (
                    <span className="px-3 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 font-mono text-[0.65rem] font-bold rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> ĐÃ BÓC TRẦN
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-950/60 text-amber-400 border border-amber-800/60 font-mono text-[0.65rem] font-bold rounded-lg">
                      {currentSuspect.statusTag}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#c4b19e] leading-relaxed border-t border-[#332114] pt-2.5">
                  {currentSuspect.bio}
                </p>

                <div className="p-2.5 bg-[#24170e] border border-[#422a1a] rounded-lg text-xs text-[#d0bead]">
                  <strong className="text-amber-400 font-mono">Lời khai ngoại phạm: </strong>
                  {currentSuspect.alibi}
                </div>
              </div>

              {/* VERIFICATION FORM OR RESULT */}
              {isVerified ? (
                <div className="p-4 bg-[#142117] border border-emerald-800/60 rounded-xl space-y-2 text-emerald-200">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 uppercase">
                    <Award className="size-4" />
                    <span>{currentSuspect.verificationResult.title}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-100">
                    {currentSuspect.verificationResult.summary}
                  </p>
                </div>
              ) : currentSuspect.evidenceOptions.length > 0 ? (
                <div className="space-y-3 border-t border-[#332114] pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono text-xs font-bold uppercase text-[#d9a066] tracking-wider flex items-center gap-1.5">
                      <FileText className="size-3.5" />
                      CHỌN TÀI LIỆU & VẬT CHỨNG ĐỂ THẨM TRA:
                    </h4>
                    <span className="font-mono text-[0.65rem] text-[#a38c78]">
                      Đã chọn: {selectedEvidenceIds.length} vật chứng
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentSuspect.evidenceOptions.map((opt) => {
                      const isChecked = selectedEvidenceIds.includes(opt.id)

                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleEvidence(opt.id)}
                          className={cn(
                            'p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5',
                            isChecked
                              ? 'bg-[#332014] border-[#d9a066] text-[#f4e8d8]'
                              : 'bg-[#1a110a] border-[#362315] text-[#b8a695] hover:bg-[#22170f]'
                          )}
                        >
                          <div
                            className={cn(
                              'size-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-colors',
                              isChecked ? 'bg-[#d9a066] border-[#d9a066] text-black' : 'border-[#523924]'
                            )}
                          >
                            {isChecked && <Check className="size-3 stroke-[3]" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-mono text-[0.65rem] text-[#d9a066] font-bold">[{opt.code}]</span>
                            </div>
                            <h5 className="text-xs font-bold leading-snug">{opt.label}</h5>
                            <p className="text-[0.65rem] text-[#9c8673] line-clamp-1 mt-0.5">{opt.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* SUBMIT FEEDBACK ALERT */}
                  {submitFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'p-3 rounded-xl border text-xs font-mono font-bold flex items-center gap-2',
                        submitFeedback.type === 'success'
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                          : 'bg-red-950/80 border-red-800 text-red-300'
                      )}
                    >
                      {submitFeedback.type === 'success' ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertCircle className="size-4 shrink-0 text-red-400" />
                      )}
                      <span>{submitFeedback.msg}</span>
                    </motion.div>
                  )}

                  {/* ACTION BUTTON */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleVerifySuspect}
                      className="px-5 py-2.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#140e0a] font-mono text-xs font-bold transition-all cursor-pointer rounded-xl shadow-lg active:scale-95 flex items-center gap-2"
                    >
                      <UserCheck className="size-4" />
                      <span>XÁC NHẬN NỘP BÁO CÁO THẨM TRA ➔</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#1a110a] border border-[#382416] rounded-xl text-xs text-[#a38c78] italic font-mono text-center">
                  Đối tượng này không yêu cầu form chọn chips vật chứng trực tiếp ở giai đoạn ban đầu.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
