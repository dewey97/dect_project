'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, CheckCircle2, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { checkpoints000 } from '@/content/cases/case-000/checkpoints'

import { PHONE_LOOKUP_EVIDENCE_IDS } from './add-suspect-modal'
import { ClueCodePicker } from './clue-code-picker'
import { isAdminBypassCode, hasAdminBypassInArray } from '@/lib/cases/admin-bypass'
import { isEvidenceMatching } from '@/lib/cases/case-000-clues'

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

// Lấy danh sách chứng cứ ban đầu chuẩn từ checkpoints000
const AVAILABLE_EVIDENCES =
  checkpoints000.find((cp) => cp.id === 'cp-000-1a')?.pickerConfig?.availableEvidences ||
  checkpoints000.find((cp) => cp.id === 'cp-000-2a')?.pickerConfig?.availableEvidences ||
  []

export function FollowupQuestionModal({
  isOpen,
  culprit,
  onClose,
  onSuccess,
  onOpenDossier,
  isPhoneSolved
}: FollowupQuestionModalProps) {
  // State for Vu time input
  const [vuTimeInput, setVuTimeInput] = useState<string>('')

  // State for Tung
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  
  // State for Ha 3-Tile Matching
  const [activeHaTileId, setActiveHaTileId] = useState<string>('tile_ao_gio')
  const [haTileSelections, setHaTileSelections] = useState<Record<string, string[]>>({
    tile_ao_gio: [],
    tile_lon_toc: [],
    tile_thuoc_an_than: [],
  })
  const [customPhoneEvidences, setCustomPhoneEvidences] = useState<Array<{ id: string; label: string }>>([])

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
      try {
        const savedPhone = localStorage.getItem('veritas_phone_inputs')
        if (savedPhone) {
          const parsed = JSON.parse(savedPhone)
          if (parsed.phone1 || parsed.phone2 || parsed.phone3) {
            setHasPhoneSolvedState(true)
          }
        }
      } catch {}
    }
  }, [isPhoneSolved, isOpen])

  const displayedEvidences = AVAILABLE_EVIDENCES.filter((ev) => {
    if (PHONE_LOOKUP_EVIDENCE_IDS.includes(ev.id)) {
      const allHaSelected = Object.values(haTileSelections).flat()
      return hasPhoneSolvedState || allHaSelected.includes(ev.id)
    }
    return true
  })

  useEffect(() => {
    if (!culprit || !isOpen) return
    setErrorMsg('')
    try {
      if (culprit === 'ha') {
        const savedHa = localStorage.getItem('veritas_followup_ha_matches')
        if (savedHa) {
          setHaTileSelections(JSON.parse(savedHa))
        }
      } else if (culprit === 'vu') {
        const savedVu = localStorage.getItem('veritas_followup_vu')
        if (savedVu) {
          setVuTimeInput(savedVu)
        } else {
          setVuTimeInput('')
        }
      } else {
        const saved = localStorage.getItem(`veritas_followup_${culprit}`)
        if (saved) {
          setSelectedOption(saved)
        } else {
          setSelectedOption(null)
        }
      }
    } catch {}
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

  // Helper check if tile is matched correctly
  const isTileMatched = (tileId: string): boolean => {
    const tile = HA_CLUE_TILES.find((t) => t.id === tileId)
    if (!tile) return false
    const selected = haTileSelections[tileId] || []
    if (hasAdminBypassInArray(selected)) return true
    return selected.some((id) => isEvidenceMatching(id, tile.validDocIds))
  }

  const allHaTilesMatched = HA_CLUE_TILES.every((tile) => isTileMatched(tile.id))

  const handleToggleHaEvidence = (evidenceId: string) => {
    detectiveAudio.playPaperRustle()
    setErrorMsg('')
    const tile = HA_CLUE_TILES.find((t) => t.id === activeHaTileId)
    if (!tile) return

    setHaTileSelections((prev) => {
      const current = prev[activeHaTileId] || []
      const nextList = current.includes(evidenceId)
        ? current.filter((id) => id !== evidenceId)
        : [...current, evidenceId]

      const updated = {
        ...prev,
        [activeHaTileId]: nextList,
      }

      try {
        localStorage.setItem('veritas_followup_ha_matches', JSON.stringify(updated))
      } catch {}

      // Play success audio if just matched
      const nowMatched = nextList.some((id) => isEvidenceMatching(id, tile.validDocIds))
      if (nowMatched && !current.some((id) => isEvidenceMatching(id, tile.validDocIds))) {
        detectiveAudio.playStampSound()
      }

      return updated
    })
  }

  const handleBypassAll = () => {
    detectiveAudio.playStampSound()
    const bypassedMatches: Record<string, string[]> = {
      tile_ao_gio: ['45'],
      tile_lon_toc: ['4'],
      tile_thuoc_an_than: ['49'],
    }
    setHaTileSelections(bypassedMatches)
    try {
      localStorage.setItem('veritas_followup_ha_matches', JSON.stringify(bypassedMatches))
    } catch {}
  }

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
      try {
        localStorage.setItem('veritas_followup_vu', '21:15')
      } catch {}
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
    try {
      localStorage.setItem('veritas_followup_tung', selectedOption)
    } catch {}
    if (onSuccess) {
      onSuccess('tung', selectedOption)
    }
    onClose()
  }

  const handleSubmitHa = (e: React.FormEvent) => {
    e.preventDefault()
    if (!allHaTilesMatched) {
      setErrorMsg('Vui lòng nhập đúng chứng cứ đối soát cho cả 3 manh mối!')
      detectiveAudio.playGlassSound()
      return
    }

    detectiveAudio.playStampSound()
    setErrorMsg('')
    try {
      localStorage.setItem('veritas_followup_ha_matches', JSON.stringify(haTileSelections))
      localStorage.setItem('veritas_followup_ha', 'matched_3_tiles')
    } catch {}
    if (onSuccess) {
      onSuccess('ha', 'matched_3_tiles')
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
                    ? 'HỒ SƠ MỞ RỘNG // ĐỐI SOÁT CHỨNG CỨ KHÁM XÉT'
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
              </div>
            </div>

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
            /* FORM BODY FOR HA */
            <form onSubmit={handleSubmitHa} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5]">
              {errorMsg && (
                <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* TÚI HỒ SƠ C */}
              <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm">
                <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
                  📂 MỞ TÚI HỒ SƠ C
                </span>
              </div>

              {/* QUESTION BOX */}
              <div className="p-3.5 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
                <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
                  YÊU CẦU ĐIỀU TRA:
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed">
                  Khớp nối các vật chứng quan trọng thu giữ tại phòng trọ và thân thể Trần Thị Hà với các tài liệu, dấu vết ban đầu tại hiện trường:
                </p>
              </div>

              {/* 3 TILES MANH MỐI NẰM NGANG (100% CÙNG 1 HÀNG) */}
              <div className="space-y-2">
                <span className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
                  1. CHỌN MANH MỐI CẦN KHỚP NỐI:
                </span>

                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {HA_CLUE_TILES.map((tile) => {
                    const isSelected = activeHaTileId === tile.id
                    const isMatched = isTileMatched(tile.id)

                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => {
                          detectiveAudio.playTypewriterClick()
                          setActiveHaTileId(tile.id)
                          setErrorMsg('')
                        }}
                        className={cn(
                          'text-center p-2.5 sm:p-3 rounded-none border-2 transition-all cursor-pointer relative select-none flex items-center justify-center min-h-[48px] sm:min-h-[52px]',
                          isSelected
                            ? 'bg-[#eae0cd] border-[#2b1f14] shadow-md ring-2 ring-[#2b1f14]/40'
                            : isMatched
                            ? 'bg-[#e7f0dc] border-[#2e5220] hover:bg-[#dcedcf]'
                            : 'bg-[#fdfcf9] border-[#d4c5b0] hover:bg-[#f4ebd9]'
                        )}
                      >
                        <span className="text-xs sm:text-sm font-mono font-bold text-[#1a120b] leading-tight">
                          {tile.title}
                        </span>
                        {isMatched && (
                          <span className="absolute top-1.5 right-1.5 text-[#2e5220] font-bold text-xs flex items-center">
                            <Check className="size-3.5 text-[#2e5220]" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* KHU VỰC NHẬP MÃ & SĐT CHỨNG CỨ KHỚP NỐI */}
              <div className="space-y-2 pt-2 border-t-2 border-[#2b1f14]/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
                    2. CHỨNG CỨ KHỚP NỐI VỚI [
                    <span className="text-[#8c1d1d]">
                      {HA_CLUE_TILES.find((t) => t.id === activeHaTileId)?.title}
                    </span>
                    ]:
                  </span>
                </div>

                <ClueCodePicker
                  selectedClueIds={haTileSelections[activeHaTileId] || []}
                  hidePhoneInputs={true}
                  onAddClueId={(id) => {
                    setHaTileSelections((prev) => {
                      const current = prev[activeHaTileId] || []
                      if (current.includes(id)) return prev
                      const nextList = [...current, id]
                      const updated = { ...prev, [activeHaTileId]: nextList }
                      try {
                        localStorage.setItem('veritas_followup_ha_matches', JSON.stringify(updated))
                      } catch {}
                      const tile = HA_CLUE_TILES.find((t) => t.id === activeHaTileId)
                      const isMaster = id === 'doc_000' || id === '000' || id === '0000' || id.includes('000') || id.includes('0000')
                      if (tile && (isMaster || tile.validDocIds.includes(id))) {
                        detectiveAudio.playStampSound()
                      }
                      return updated
                    })
                    if (errorMsg) setErrorMsg('')
                  }}
                  onRemoveClueId={(id) => {
                    setHaTileSelections((prev) => {
                      const current = prev[activeHaTileId] || []
                      const nextList = current.filter((item) => item !== id)
                      const updated = { ...prev, [activeHaTileId]: nextList }
                      try {
                        localStorage.setItem('veritas_followup_ha_matches', JSON.stringify(updated))
                      } catch {}
                      return updated
                    })
                  }}
                  label="MÃ CHỨNG CỨ ĐÃ NHẬP"
                  placeholder="Nhập mã chứng cứ..."
                  emptyStateText="Chưa có mã chứng cứ nào được nhập."
                />
              </div>

              {/* FOOTER */}
              <div className="pt-2 flex items-center justify-between border-t border-[#2b1f14]/20">
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
                  <span>HOÀN TẤT ĐỐI SOÁT CHỨNG CỨ</span>
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
    </AnimatePresence>
  )
}

