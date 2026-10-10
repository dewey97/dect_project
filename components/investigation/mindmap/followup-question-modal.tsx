'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, CheckCircle2, ArrowRight, ShieldCheck, Check, Sparkles, Lightbulb } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { emitInvestigationEvent } from '@/lib/investigation-events'

import { PHONE_LOOKUP_EVIDENCE_IDS } from './add-suspect-modal'
import { ClueCodePicker } from './clue-code-picker'
import { isAdminBypassCode, hasAdminBypassInArray } from '@/lib/cases/admin-bypass'
import { isEvidenceMatching } from '@/lib/cases/case-000-clues'
import { getStorageItem, setStorageItem, getStorageJson, setStorageJson } from '@/lib/storage'
import { normalizeImageUrl } from '@/lib/utils'
import { usePhoneData } from '@/lib/hooks/use-phone-data'

interface FollowupQuestionModalProps {
  isOpen: boolean
  culprit: 'vu' | 'tung' | 'ha' | null
  onClose: () => void
  onSuccess?: (culprit: 'vu' | 'tung' | 'ha', choice?: string) => void
  onOpenDossier?: (dossierType: 'A' | 'B' | 'C') => void
  isPhoneSolved?: boolean
}

const MOCK_OPTIONS_TUNG = [
  { id: 'tin', label: 'CÓ' },
  { id: 'khong_tin', label: 'KHÔNG' }
]

// 3 TILES MANH MỐI THU ĐƯỢC TẠI NHÀ VÀ THÂN THỂ TRẦN THỊ HÀ
export const HA_CLUE_TILES = [
  {
    id: 'tile_ao_gio',
    number: '01',
    title: 'Áo khoác gió',
    subtitle: 'Thu giữ sau cánh cửa phòng trọ',
    description: 'Áo khoác gió xám đen dính bụi mùn đất đặc trưng quanh gốc cây xoan trước ngõ nhà Khang.',
    validDocIds: ['45', '10', '6'],
    matchHint: 'Khớp nối lời khai: bóng người mặc áo gió trùm đầu rình rập dưới gốc cây xoan trước cổng (45, 10, 6).',
  },
  {
    id: 'tile_lon_toc',
    number: '02',
    title: 'Kéo và nhúm tóc',
    subtitle: 'Thu giữ giấu trong áo ngực',
    description: 'Lọn tóc mai dính máu cắt bằng kéo, kết quả giám định sinh học trùng khớp 100% mẫu ADN của Khang.',
    validDocIds: ['4'],
    matchHint: 'Khớp nối Khám nghiệm tử thi: mảng tóc mai bên trái bị cắt tỉa sát da đầu & vết đâm cổ lúc 21:00 (4).',
  },
  {
    id: 'tile_thuoc_an_than',
    number: '03',
    title: 'Bùa yêu',
    subtitle: 'Thu giữ tại phòng & thân thể',
    description: 'Lá bùa yêu nhuộm đỏ cùng các vật phẩm mê tín được chuẩn bị từ trước.',
    validDocIds: ['49'],
    matchHint: 'Khớp nối vật chứng bùa yêu thu được (49).',
  },
]

import { useCaseCheckpoints } from '@/lib/hooks/use-case-checkpoints'

export function FollowupQuestionModal({
  isOpen,
  culprit,
  onClose,
  onSuccess,
  onOpenDossier,
  isPhoneSolved
}: FollowupQuestionModalProps) {
  const { checkpoints } = useCaseCheckpoints('case-000')

  const availableEvidences = useMemo(() => {
    return (
      checkpoints.find((cp) => cp.id === 'cp-000-1a')?.pickerConfig?.availableEvidences ||
      checkpoints.find((cp) => cp.id === 'cp-000-2a')?.pickerConfig?.availableEvidences ||
      []
    )
  }, [checkpoints])
  // State for Vu time input
  const [vuTimeInput, setVuTimeInput] = useState<string>('')

  // State for Tung
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  
  // State for Ha Password & Photo Popup (Live CMS)
  const [haPasswordInput, setHaPasswordInput] = useState<string>('')
  const [showHaPhotoPopup, setShowHaPhotoPopup] = useState<boolean>(false)
  
  // Fetch photos dynamically from Google Sheets Live CMS ('photos' tab)
  const { data: rawSheetPhotos } = usePhoneData('photos')

  // Live Checkpoint metadata for Ha followup (cp-000-1c-followup or cp-000-2a or cp-000-1c)
  const haCheckpoint = useMemo(() => {
    return (
      checkpoints.find((cp) => cp.id === 'cp-000-1c-followup') ||
      checkpoints.find((cp) => cp.id === 'cp-000-2a') ||
      checkpoints.find((cp) => cp.id === 'cp-000-1c')
    )
  }, [checkpoints])

  // Lấy 3 ảnh từ sheet photos cho popup kết quả (100% Live CMS)
  const haDiscoveredPhotos = useMemo(() => {
    if (!rawSheetPhotos || rawSheetPhotos.length === 0) return []

    // Chuẩn hóa danh sách ảnh từ sheet photos
    const mappedPhotos = rawSheetPhotos
      .filter((p: any) => Boolean(p.drive_url || p.direct_cdn_url || p.url || p.local_file_path))
      .map((p: any, idx: number) => ({
        id: (p.photo_code || p.code || `photo-ha-${idx}`).trim(),
        title: (p.title || p.file_name || `Vật chứng #${idx + 1}`).trim(),
        url: normalizeImageUrl(p.direct_cdn_url || p.drive_url || p.url || p.local_file_path || ''),
      }))

    // 1. Nếu trên checkpoint có cấu hình danh sách photoCodes (ví dụ photos: photo_bua_yeu, photo_keo_toc, photo_tui_toc_mai)
    if (haCheckpoint?.photoCodes && haCheckpoint.photoCodes.length > 0) {
      const explicitPhotos: Array<{ id: string; title: string; url: string }> = []
      for (const code of haCheckpoint.photoCodes) {
        const found = mappedPhotos.find(
          (p) => p.id.toLowerCase() === code.toLowerCase() || p.title.toLowerCase().includes(code.toLowerCase())
        )
        if (found) {
          explicitPhotos.push(found)
        }
      }
      if (explicitPhotos.length > 0) {
        return explicitPhotos.slice(0, 3)
      }
    }

    // 2. Ưu tiên 3 vật chứng thu giữ bên trong hộp thiếc nhà Hà: Bùa yêu, Kéo cắt tóc, Túi zip đựng tóc
    const targetKeywords = ['bùa yêu', 'kéo', 'tóc']
    const matchedByKeywords: Array<{ id: string; title: string; url: string }> = []

    targetKeywords.forEach((kw) => {
      const found = mappedPhotos.find(
        (p) =>
          (p.title.toLowerCase().includes(kw) || p.id.toLowerCase().includes(kw)) &&
          !matchedByKeywords.some((item) => item.id === p.id)
      )
      if (found) matchedByKeywords.push(found)
    })

    if (matchedByKeywords.length >= 3) {
      return matchedByKeywords.slice(0, 3)
    }

    // 3. Nếu chưa đủ 3, lấy các ảnh có link hợp lệ trong danh mục vật chứng mới của Hà
    const combined = [...matchedByKeywords]
    for (const p of mappedPhotos) {
      const t = p.title.toLowerCase()
      // Bỏ qua avatar nhân vật để tránh hiển thị nhầm ảnh chân dung Khang/Mai/Vũ
      if (t.includes('chân dung') || p.id.startsWith('avatar_')) continue
      if (!combined.some((item) => item.id === p.id)) {
        combined.push(p)
      }
      if (combined.length >= 3) break
    }

    return combined.slice(0, 3)
  }, [rawSheetPhotos, haCheckpoint])

  const [errorMsg, setErrorMsg] = useState('')
  const [hasPhoneSolvedState, setHasPhoneSolvedState] = useState(false)
  const openTimeRef = useRef(0)

  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = Date.now()
    }
  }, [isOpen])

  useEffect(() => {
    if (isPhoneSolved) {
      setHasPhoneSolvedState(true)
    } else {
      const parsed = getStorageJson<Record<string, string>>('phone_inputs', {})
      if (parsed.phone1 || parsed.phone2 || parsed.phone3) {
        setHasPhoneSolvedState(true)
      }
    }
  }, [isPhoneSolved, isOpen])

  useEffect(() => {
    if (!isOpen || culprit !== 'ha' || haDiscoveredPhotos.length === 0) return
    // Tự động Preload trước 3 ảnh vào browser cache ngay khi mở modal câu hỏi
    // Giúp khi nhập xong mật khẩu, ảnh đã nằm sẵn trong bộ nhớ đệm và hiển thị tức thì (0ms trễ)
    haDiscoveredPhotos.forEach((photo) => {
      if (photo.url) {
        const img = new Image()
        img.src = photo.url
      }
    })
  }, [isOpen, culprit, haDiscoveredPhotos])

  useEffect(() => {
    if (!culprit || !isOpen) return
    setErrorMsg('')
    if (culprit === 'ha') {
      const savedHa = getStorageItem('followup_ha_password')
      if (savedHa) {
        setHaPasswordInput(savedHa)
        setShowHaPhotoPopup(true)
      } else {
        setHaPasswordInput('')
        setShowHaPhotoPopup(false)
      }
    } else if (culprit === 'vu') {
      const savedVu = getStorageItem('followup_vu')
      if (savedVu) {
        setVuTimeInput(savedVu)
      } else {
        setVuTimeInput('')
      }
    } else {
      const saved = getStorageItem(`followup_${culprit}`)
      if (saved) {
        setSelectedOption(saved)
      } else {
        setSelectedOption(null)
      }
    }
  }, [culprit, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !culprit) return null

  const isVu = culprit === 'vu'
  const isTung = culprit === 'tung'
  const isHa = culprit === 'ha'

  const handleSubmitVu = (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = vuTimeInput.trim().toLowerCase().replace(/\s+/g, '')
    if (!normalized) {
      setErrorMsg('Vui lòng nhập mốc thời gian!')
      detectiveAudio.playGlassSound()
      return
    }

    const is000 = normalized === '000' || normalized === '00' || normalized === '0'

    if (normalized === '21:15' || normalized === '21h15' || is000) {
      detectiveAudio.playStampSound()
      setErrorMsg('')
      setStorageItem('followup_vu', '21:15')
      if (onSuccess) {
        onSuccess('vu', '21:15')
      }
      onClose()
    } else {
      detectiveAudio.playGlassSound()
      setErrorMsg('⚠️ Đáp án chưa chính xác. Vui lòng kiểm tra lại mốc thời gian trong Hồ sơ A!')
    }
  }

  const handleSubmitTung = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOption) {
      setErrorMsg('Vui lòng tích chọn một phương án trả lời!')
      detectiveAudio.playGlassSound()
      return
    }

    detectiveAudio.playStampSound()
    setErrorMsg('')
    setStorageItem('followup_tung', selectedOption)
    if (onSuccess) {
      onSuccess('tung', selectedOption)
    }
    onClose()
  }

  const handleSubmitHa = (e: React.FormEvent) => {
    e.preventDefault()
    const rawVal = haPasswordInput.trim().toLowerCase().replace(/\s+/g, '')
    if (!rawVal) {
      setErrorMsg('Vui lòng nhập mật mã hộp thiếc!')
      detectiveAudio.playGlassSound()
      return
    }

    // Lấy đáp án chuẩn từ Live CMS (checkpoints)
    const expectedFromSheet = (haCheckpoint?.correctAnswer || '18100909')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')

    const isMasterBypass = rawVal === '000' || rawVal === '0000' || rawVal === 'admin'
    const isCorrect = isMasterBypass || rawVal === expectedFromSheet || (expectedFromSheet.includes(rawVal) && rawVal.length >= 6)

    if (isCorrect) {
      detectiveAudio.playStampSound()
      setErrorMsg('')
      setStorageItem('followup_ha_password', rawVal)
      setStorageItem('followup_ha', 'solved')
      // Mở popup 3 ảnh lộn xộn
      setShowHaPhotoPopup(true)
    } else {
      detectiveAudio.playGlassSound()
      setErrorMsg('⚠️ Mật khẩu chưa chính xác. Hãy rà soát lại các manh mối và ghi chú liên quan!')
    }
  }

  const handleFinishHaAfterPopup = () => {
    detectiveAudio.playStampSound()
    setShowHaPhotoPopup(false)
    if (onSuccess) {
      onSuccess('ha', 'solved_box')
    }
    onClose()
  }

  const questionTextTung = 'Toàn bộ hành tung của Nguyễn Thanh Tùng trong đêm xảy ra vụ án đã được thu thập & phân tích. Các mảnh ghép đã dần lộ diện.\n\nDựa vào những gì đang nắm giữ, bạn có tin đối tượng này vô tội?'

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (Date.now() - openTimeRef.current < 350) return
    onClose()
  }

  return (
    <AnimatePresence>
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_30px_90px_rgba(0,0,0,0.98)] rounded-none overflow-hidden flex flex-col max-h-[92vh] cursor-default"
        >
          {/* HEADER */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="size-5 text-amber-800" />
              <div>
                <h3 className="font-mono font-bold text-xs sm:text-sm md:text-base text-[#1a120b] uppercase tracking-wider">
                  {isHa
                    ? (haCheckpoint?.title || 'HỒ SƠ MỞ RỘNG // HỘP THIẾC ĐÁNG NGỜ')
                    : isVu
                    ? 'CÂU HỎI ĐIỀU TRA'
                    : 'HỒ SƠ MỞ RỘNG // CÂU HỎI SUY LUẬN'}
                </h3>
                {isVu && (
                  <span className="font-mono text-xs font-bold text-[#8c1d1d] block mt-0.5">
                    Đối tượng: Lê Quang Vũ
                  </span>
                )}
                {isTung && (
                  <span className="font-mono text-xs font-bold text-[#8c1d1d] block mt-0.5">
                    Đối tượng: Nguyễn Thanh Tùng
                  </span>
                )}
                {isHa && (
                  <span className="font-mono text-xs font-bold text-[#8c1d1d] block mt-0.5">
                    Đối tượng: Trần Thị Hà
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  detectiveAudio.playTypewriterClick()
                  const cpId = isVu ? 'cp-000-1a' : isTung ? 'cp-000-1b' : 'cp-000-1c'
                  emitInvestigationEvent('OPEN_HINT', { checkpointId: cpId })
                }}
                className="px-2.5 py-1.5 bg-[#dfd3bd] hover:bg-[#d4c5ab] text-[#8c1d1d] hover:text-[#6e1515] border border-[#a88c6f] font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                title="Xem gợi ý phá án cho câu hỏi này"
              >
                <Lightbulb className="size-3.5 text-[#8c1d1d]" />
                <span className="hidden sm:inline">GỢI Ý</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  detectiveAudio.playPaperRustle()
                  onClose()
                }}
                className="p-2 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer border border-[#5c4026] pointer-events-auto"
                title="Đóng"
              >
                <X className="size-5 pointer-events-none" />
              </button>
            </div>
          </div>

          {/* FORM BODY FOR VU */}
          {isVu ? (
            <form onSubmit={handleSubmitVu} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5]">
              {errorMsg && (
                <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {/* MỞ TÚI HỒ SƠ A INSTRUCTION */}
              <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm">
                <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
                  📂 MỞ TÚI HỒ SƠ A
                </span>
              </div>

              {/* QUESTION BOX */}
              <div className="p-4 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
                <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
                  CÂU HỎI:
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed">
                  Xác định mốc thời gian Vũ rời khỏi Quán Bia 88
                </p>
              </div>

              {/* ANSWER INPUT */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
                  Cách trả lời: Nhập text format &quot;hh:mm&quot; (giờ:phút)
                </label>
                <p className="text-xs text-[#6b4e2e] font-mono italic">
                  Ví dụ: 12:00, 13:30,...
                </p>
                <input
                  type="text"
                  value={vuTimeInput}
                  onChange={(e) => {
                    setVuTimeInput(e.target.value)
                    setErrorMsg('')
                  }}
                  className="w-full p-3.5 bg-[#fdfcf9] border-2 border-[#2b1f14] text-[#1a120b] font-mono text-base font-bold placeholder-[#a88c6f]/60 focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]"
                />
              </div>

              {/* FOOTER */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    detectiveAudio.playPaperRustle()
                    onClose()
                  }}
                  className="px-4 py-2 bg-[#dfd3bd] hover:bg-[#d4c5ab] border-2 border-[#4a3520] text-[#2b1f14] text-xs font-mono font-bold rounded-none transition-colors cursor-pointer"
                >
                  ĐÓNG
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider rounded-none transition-all flex items-center gap-2 border-2 border-[#2b1f14] shadow-md cursor-pointer active:scale-95"
                >
                  <span>CẬP NHẬT KẾT LUẬN</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </form>
          ) : isHa ? (
            /* FORM BODY FOR HA - LIVE CMS PASSWORD INPUT */
            <form onSubmit={handleSubmitHa} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5]">
              {errorMsg && (
                <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* TÚI HỒ SƠ C */}
              <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
                  📂 MỞ TÚI HỒ SƠ C // VẬT CHỨNG KHÁM XÉT
                </span>
                <span className="font-mono text-[11px] font-bold text-[#6b4e2e]">
                  VẬT PHẨM: HỘP THIẾC KHÓA MÃ
                </span>
              </div>

              {/* QUESTION BOX (LIVE CMS) */}
              <div className="p-3.5 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
                <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
                  YÊU CẦU ĐIỀU TRA:
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed">
                  {haCheckpoint?.question || 'Xác định khoá mật khẩu hộp thiếc đáng ngờ thu giữ trong phòng trọ của Trần Thị Hà.'}
                </p>
              </div>

              {/* PASSWORD INPUT BOX */}
              <div className="space-y-2 pt-1">
                <label className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
                  MẬT KHẨU MỞ KHÓA HỘP THIẾC:
                </label>
                <input
                  type="text"
                  value={haPasswordInput}
                  onChange={(e) => {
                    setHaPasswordInput(e.target.value)
                    setErrorMsg('')
                  }}
                  placeholder="Nhập mật khẩu..."
                  className="w-full p-3.5 bg-[#fdfcf9] border-2 border-[#2b1f14] text-[#1a120b] font-mono text-base font-bold placeholder-[#a88c6f]/60 tracking-wider focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]"
                />
                <p className="text-[11px] text-[#6b4e2e] font-mono italic">
                  💡 Gợi ý: Tra cứu thông tin, ghi chú hoặc ngày kỷ niệm bí mật của đối tượng.
                </p>
              </div>

              {/* FOOTER */}
              <div className="pt-3 flex items-center justify-between border-t border-[#2b1f14]/20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    detectiveAudio.playPaperRustle()
                    onClose()
                  }}
                  className="px-4 py-2 bg-[#dfd3bd] hover:bg-[#d4c5ab] border-2 border-[#4a3520] text-[#2b1f14] text-xs font-mono font-bold rounded-none transition-colors cursor-pointer"
                >
                  ĐÓNG
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 font-mono font-bold text-xs uppercase tracking-wider rounded-none transition-all flex items-center gap-2 border-2 shadow-md bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-[#2b1f14] cursor-pointer active:scale-95"
                >
                  <Sparkles className="size-3.5 text-amber-400" />
                  <span>XÁC NHẬN MẬT KHẨU</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* FORM FOR TUNG */
            <form onSubmit={handleSubmitTung} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5]">
              {errorMsg && (
                <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* MỞ TÚI HỒ SƠ B */}
              <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm">
                <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
                  📂 MỞ TÚI HỒ SƠ B
                </span>
              </div>

              {/* QUESTION BOX */}
              <div className="p-4 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
                <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
                  CÂU HỎI:
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed whitespace-pre-line">
                  {questionTextTung}
                </p>
              </div>

              {/* OPTIONS LIST */}
              <div className="space-y-3">
                <span className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
                  LỰA CHỌN KẾT LUẬN CỦA ĐIỀU TRA VIÊN:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MOCK_OPTIONS_TUNG.map((opt) => {
                    const isSelected = selectedOption === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          detectiveAudio.playTypewriterClick()
                          setSelectedOption(opt.id)
                          setErrorMsg('')
                        }}
                        className={cn(
                          'p-4 text-left border-2 transition-all cursor-pointer select-none rounded-none relative flex items-center justify-between',
                          isSelected
                            ? 'bg-[#e7f0dc] border-[#2e5220] shadow-sm text-[#193310]'
                            : 'bg-[#fdfcf9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22]'
                        )}
                      >
                        <span className="font-mono text-xs sm:text-sm font-bold">
                          {opt.label}
                        </span>
                        {isSelected && (
                          <Check className="size-4 text-[#2e5220] stroke-[2.5]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* FOOTER */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    detectiveAudio.playPaperRustle()
                    onClose()
                  }}
                  className="px-4 py-2 bg-[#dfd3bd] hover:bg-[#d4c5ab] border-2 border-[#4a3520] text-[#2b1f14] text-xs font-mono font-bold rounded-none transition-colors cursor-pointer"
                >
                  ĐÓNG
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider rounded-none transition-all flex items-center gap-2 border-2 border-[#2b1f14] shadow-md cursor-pointer"
                >
                  <span>CẬP NHẬT KẾT LUẬN</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </div>

      {/* POPUP 3 ẢNH TOÀN MÀN HÌNH (KHÔNG BỊ BỌC TRONG KHUNG MODAL, ZERO-SCROLL OVERLAY) */}
      <AnimatePresence>
        {showHaPhotoPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 select-none"
          >
            {/* Header: Bỏ dấu X theo yêu cầu */}
            <div className="flex items-center justify-between border-b border-[#a88c6f]/30 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-5 text-amber-400" />
                <div>
                  <h4 className="font-mono font-bold text-sm sm:text-base text-amber-300 uppercase tracking-wider">
                    KHÓA HỘP THIẾC ĐÃ ĐƯỢC MỞ
                  </h4>
                  <p className="text-xs font-mono text-[#a88c6f]">
                    3 vật chứng giấu kín thu giữ bên trong hộp
                  </p>
                </div>
              </div>
            </div>

            {/* VÙNG CHÍNH GIỮA: 3 ẢNH LỘN XỘN XẾP CHỒNG + 3 GẠCH ĐẦU DÒNG GÓC DƯỚI TRÁI */}
            <div className="my-auto flex flex-col items-center justify-center w-full py-2">
              <div className="relative w-full max-w-[540px] aspect-[1/1] sm:h-[460px] flex items-center justify-center">
                {/* Ảnh 1: Phía trên bên phải (rotate-6) */}
                {haDiscoveredPhotos[0] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                    animate={{ opacity: 1, scale: 1, rotate: 6 }}
                    transition={{ duration: 0.4 }}
                    className="absolute top-0 right-2 sm:right-4 w-[56%] sm:w-[54%] aspect-[4/3] z-10 shadow-[0_15px_40px_rgba(0,0,0,0.95)] hover:z-30 hover:scale-105 transition-transform cursor-pointer overflow-hidden rounded-none"
                  >
                    <img
                      src={haDiscoveredPhotos[0].url}
                      alt={haDiscoveredPhotos[0].title}
                      className="w-full h-full object-cover block"
                      onError={(e) => {
                        e.currentTarget.src = '/images/cases/case_000/clue_notes/rendered_notes/note_cau_hoi_ha.png'
                      }}
                    />
                  </motion.div>
                )}

                {/* Ảnh 2: Phía giữa chếch bên trái (-rotate-2) */}
                {haDiscoveredPhotos[1] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                    animate={{ opacity: 1, scale: 1, rotate: -2 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="absolute top-[28%] left-0 sm:left-2 w-[56%] sm:w-[54%] aspect-[4/3] z-20 shadow-[0_18px_45px_rgba(0,0,0,0.98)] hover:z-30 hover:scale-105 transition-transform cursor-pointer overflow-hidden rounded-none"
                  >
                    <img
                      src={haDiscoveredPhotos[1].url}
                      alt={haDiscoveredPhotos[1].title}
                      className="w-full h-full object-cover block"
                      onError={(e) => {
                        e.currentTarget.src = '/images/cases/case_000/clue_notes/rendered_notes/note_cau_hoi_ha.png'
                      }}
                    />
                  </motion.div>
                )}

                {/* Ảnh 3: Phía dưới chếch bên phải (rotate-2) */}
                {haDiscoveredPhotos[2] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                    animate={{ opacity: 1, scale: 1, rotate: 2 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="absolute bottom-4 right-0 sm:right-4 w-[58%] sm:w-[56%] aspect-[4/3] z-25 shadow-[0_20px_50px_rgba(0,0,0,0.98)] hover:z-30 hover:scale-105 transition-transform cursor-pointer overflow-hidden rounded-none"
                  >
                    <img
                      src={haDiscoveredPhotos[2].url}
                      alt={haDiscoveredPhotos[2].title}
                      className="w-full h-full object-cover block"
                      onError={(e) => {
                        e.currentTarget.src = '/images/cases/case_000/clue_notes/rendered_notes/note_cau_hoi_ha.png'
                      }}
                    />
                  </motion.div>
                )}

                {/* 3 GẠCH ĐẦU DÒNG NẰM GÓC DƯỚI BÊN TRÁI ĐÚNG THEO ẢNH PHÁC THẢO */}
                <div className="absolute bottom-2 left-2 sm:left-4 z-30 max-w-[42%] text-left space-y-1.5">
                  {haDiscoveredPhotos.map((photo, idx) => (
                    <div key={`bullet-${photo.id || idx}`} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-amber-400 font-mono text-xs select-none">•</span>
                      <span className="font-mono text-xs text-[#f6f1e5] font-medium tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        {photo.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FOOTER CTA TIẾP TỤC */}
            <div className="shrink-0 flex items-center justify-end pt-3 border-t border-[#a88c6f]/30">
              <button
                type="button"
                onClick={handleFinishHaAfterPopup}
                className="w-full sm:w-auto px-7 py-3 bg-[#8c1d1d] hover:bg-[#6e1515] text-[#f6f1e5] font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 border-2 border-[#4a0e0e] shadow-lg active:scale-95 cursor-pointer"
              >
                <span>TIẾP TỤC</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}

