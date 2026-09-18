'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, CheckCircle2, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { checkpoints000 } from '@/content/cases/case-000/checkpoints'

interface FollowupQuestionModalProps {
  isOpen: boolean
  culprit: 'vu' | 'tung' | 'ha' | null
  onClose: () => void
  onSuccess?: (culprit: 'vu' | 'tung' | 'ha', choice?: string) => void
}

const MOCK_OPTIONS_VU = [
  { id: 'opt-1', label: 'Phương án A: Khai man diện tích đất từ 75m2 thành 120m2 để trục lợi đền bù.' },
  { id: 'opt-2', label: 'Phương án B: Lén đột nhập vào nhà Khang qua cửa sau để tiêu hủy giấy vay nợ 350 triệu.' },
  { id: 'opt-3', label: 'Phương án C: Tống tiền nạn nhân Khang bằng các bằng chứng gian lận địa chính.' },
  { id: 'opt-4', label: 'Phương án D: Cả phương án A và B đều đúng.' }
]

const MOCK_OPTIONS_TUNG = [
  { id: 'tin', label: 'TIN' },
  { id: 'khong_tin', label: 'KHÔNG TIN' }
]

// 3 TILES MANH MỐI THU ĐƯỢC TẠI NHÀ VÀ THÂN THỂ TRẦN THỊ HÀ
export const HA_CLUE_TILES = [
  {
    id: 'tile_ao_gio',
    number: '01',
    title: 'ÁO GIÓ DÍNH BỤI CÂY XOAN',
    subtitle: 'Thu giữ sau cánh cửa phòng trọ',
    description: 'Áo khoác gió xám đen dính bụi mùn đất đặc trưng quanh gốc cây xoan trước ngõ nhà Khang.',
    validDocIds: ['doc_07b_loi_khai_vu', 'doc_06_loi_khai_lua'],
    matchHint: 'Khớp nối lời khai Lê Quang Vũ / bà Lụa: bóng người mặc áo gió trùm đầu rình rập dưới gốc cây xoan trước cổng.',
  },
  {
    id: 'tile_lon_toc',
    number: '02',
    title: 'LỌN TÓC MAI DÍNH MÁU (ADN 100%)',
    subtitle: 'Thu giữ giấu trong áo ngực',
    description: 'Lọn tóc mai dính máu cắt bằng kéo, kết quả giám định sinh học trùng khớp 100% mẫu ADN của Khang.',
    validDocIds: ['doc_04_tu_thi'],
    matchHint: 'Khớp nối Khám nghiệm tử thi: mảng tóc mai bên trái bị cắt tỉa sát da đầu & vết đâm cổ lúc 21:00.',
  },
  {
    id: 'tile_thuoc_an_than',
    number: '03',
    title: 'VỈ THUỐC DIAZEPAM & VẾT RÁCH TAY',
    subtitle: 'Thu giữ tại phòng & thân thể',
    description: 'Vỉ thuốc an thần Diazepam 5mg bóc dở 4 viên & vết rách sâu 2.5cm ở lòng bàn tay phải của Hà.',
    validDocIds: ['doc_05_kham_nghiem', 'p3_hung_khi'],
    matchHint: 'Khớp nối Khám nghiệm hiện trường: cặn ấm trà hoa cúc chứa hoạt chất Diazepam & mảnh thủy tinh bình trà vỡ.',
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
  onSuccess
}: FollowupQuestionModalProps) {
  // State for Vu / Tung
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  
  // State for Ha 3-Tile Matching
  const [activeHaTileId, setActiveHaTileId] = useState<string>('tile_ao_gio')
  const [haTileSelections, setHaTileSelections] = useState<Record<string, string[]>>({
    tile_ao_gio: [],
    tile_lon_toc: [],
    tile_thuoc_an_than: [],
  })

  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!culprit || !isOpen) return
    setErrorMsg('')
    try {
      if (culprit === 'ha') {
        const savedHa = localStorage.getItem('veritas_followup_ha_matches')
        if (savedHa) {
          setHaTileSelections(JSON.parse(savedHa))
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

  if (!isOpen || !culprit) return null

  const isVu = culprit === 'vu'
  const isTung = culprit === 'tung'
  const isHa = culprit === 'ha'

  // Helper check if tile is matched correctly
  const isTileMatched = (tileId: string): boolean => {
    const tile = HA_CLUE_TILES.find((t) => t.id === tileId)
    if (!tile) return false
    const selected = haTileSelections[tileId] || []
    return tile.validDocIds.some((validId) => selected.includes(validId))
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
      const nowMatched = tile.validDocIds.some((validId) => nextList.includes(validId))
      if (nowMatched && !tile.validDocIds.some((validId) => current.includes(validId))) {
        detectiveAudio.playStampSound()
      }

      return updated
    })
  }

  const handleBypassAll = () => {
    detectiveAudio.playStampSound()
    const bypassedMatches: Record<string, string[]> = {
      tile_ao_gio: ['doc_07b_loi_khai_vu'],
      tile_lon_toc: ['doc_04_tu_thi'],
      tile_thuoc_an_than: ['doc_05_kham_nghiem'],
    }
    setHaTileSelections(bypassedMatches)
    try {
      localStorage.setItem('veritas_followup_ha_matches', JSON.stringify(bypassedMatches))
    } catch {}
  }

  const handleSubmitVuTung = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOption) {
      setErrorMsg('Vui lòng tích chọn một phương án trả lời!')
      detectiveAudio.playGlassSound()
      return
    }

    detectiveAudio.playStampSound()
    setErrorMsg('')
    try {
      localStorage.setItem(`veritas_followup_${culprit}`, selectedOption)
    } catch {}
    if (onSuccess) {
      onSuccess(culprit, selectedOption)
    }
    onClose()
  }

  const handleSubmitHa = (e: React.FormEvent) => {
    e.preventDefault()
    // Auto-fill bypass if not all matched yet
    const finalSelections = allHaTilesMatched
      ? haTileSelections
      : {
          tile_ao_gio: ['doc_07b_loi_khai_vu'],
          tile_lon_toc: ['doc_04_tu_thi'],
          tile_thuoc_an_than: ['doc_05_kham_nghiem'],
        }

    detectiveAudio.playStampSound()
    setErrorMsg('')
    try {
      localStorage.setItem('veritas_followup_ha_matches', JSON.stringify(finalSelections))
      localStorage.setItem('veritas_followup_ha', 'matched_3_tiles')
    } catch {}
    if (onSuccess) {
      onSuccess('ha', 'matched_3_tiles')
    }
    onClose()
  }

  const questionText = isVu
    ? 'Hành vi và động cơ mấu chốt nào dẫn tới sự hiện diện của Lê Quang Vũ tại hiện trường vào đêm xảy ra án mạng 24/07?'
    : isTung
    ? 'Bạn có tin Tùng thực sự vô tội không?'
    : 'Khớp nối các vật chứng quan trọng thu giữ tại phòng trọ và thân thể Trần Thị Hà với các tài liệu, dấu vết ban đầu tại hiện trường:'

  const options = isVu ? MOCK_OPTIONS_VU : MOCK_OPTIONS_TUNG

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_30px_90px_rgba(0,0,0,0.98)] rounded-none overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* HEADER */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="size-5 text-amber-800" />
              <h3 className="font-mono font-bold text-xs sm:text-sm md:text-base text-[#1a120b] uppercase tracking-wider">
                {isHa
                  ? 'HỒ SƠ MỞ RỘNG // ĐỐI SOÁT CHỨNG CỨ KHÁM XÉT TRẦN THỊ HÀ'
                  : 'HỒ SƠ MỞ RỘNG // CÂU HỎI SUY LUẬN'}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer border border-[#5c4026]"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* FORM BODY FOR HA */}
          {isHa ? (
            <form onSubmit={handleSubmitHa} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5]">
              {errorMsg && (
                <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* TÚI HỒ SƠ C */}
              <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
                  📂 MỞ TÚI HỒ SƠ C (TRẦN THỊ HÀ)
                </span>
              </div>

              {/* QUESTION BOX */}
              <div className="p-3.5 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
                <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
                  YÊU CẦU ĐIỀU TRA:
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed">
                  {questionText}
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
                          'text-left p-2 sm:p-2.5 rounded-none border-2 transition-all cursor-pointer relative select-none flex flex-col justify-between min-h-[64px] sm:min-h-[70px]',
                          isSelected
                            ? 'bg-[#eae0cd] border-[#2b1f14] shadow-md ring-2 ring-[#2b1f14]/40'
                            : isMatched
                            ? 'bg-[#e7f0dc] border-[#2e5220] hover:bg-[#dcedcf]'
                            : 'bg-[#fdfcf9] border-[#d4c5b0] hover:bg-[#f4ebd9]'
                        )}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono text-[9px] sm:text-[10px] font-bold px-1 py-0.5 bg-[#2b1f14]/10 text-[#2b1f14] uppercase shrink-0">
                            MANH MỐI {tile.number}
                          </span>
                          {isMatched && (
                            <span className="text-[#2e5220] font-bold text-xs shrink-0 flex items-center gap-0.5 font-mono">
                              <Check className="size-3 text-[#2e5220]" />
                            </span>
                          )}
                        </div>

                        <h4 className="text-[10.5px] sm:text-xs font-mono font-bold text-[#1a120b] leading-tight">
                          {tile.title}
                        </h4>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* TÀI LIỆU BAN ĐẦU ĐỐI ỨNG (TICK CHỌN BÊN DƯỚI) */}
              <div className="space-y-2 pt-2 border-t-2 border-[#2b1f14]/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
                    2. TICK CHỌN TÀI LIỆU BAN ĐẦU KHỚP VỚI [
                    <span className="text-[#8c1d1d]">
                      {HA_CLUE_TILES.find((t) => t.id === activeHaTileId)?.title}
                    </span>
                    ]:
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {AVAILABLE_EVIDENCES.map((ev) => {
                    const currentSelected = haTileSelections[activeHaTileId] || []
                    const isChecked = currentSelected.includes(ev.id)

                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => handleToggleHaEvidence(ev.id)}
                        className={cn(
                          'text-left p-2.5 rounded-none border-2 transition-all flex items-center gap-2.5 cursor-pointer relative select-none',
                          isChecked
                            ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] font-bold shadow-sm'
                            : 'bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]'
                        )}
                      >
                        <div
                          className={cn(
                            'size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white',
                            isChecked ? 'border-[#2b1f14] text-[#0e2b5c]' : 'border-[#4a3520]'
                          )}
                        >
                          {isChecked && (
                            <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="text-xs leading-snug flex-1">{ev.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* FOOTER */}
              <div className="pt-2 flex items-center justify-between border-t border-[#2b1f14]/20">
                <button
                  type="button"
                  onClick={onClose}
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
            /* FORM FOR VU / TUNG */
            <form onSubmit={handleSubmitVuTung} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5]">
              {errorMsg && (
                <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* MỞ TÚI HỒ SƠ */}
              <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
                  📂 MỞ TÚI HỒ SƠ {isVu ? 'A' : 'B'}
                </span>
              </div>

              {/* QUESTION BOX */}
              <div className="p-4 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
                <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
                  CÂU HỎI:
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed">
                  {questionText}
                </p>
              </div>

              {/* OPTIONS (TICK CHỌN) */}
              <div className="space-y-2.5">
                <span className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
                  TÍCH CHỌN PHƯƠNG ÁN ĐÚNG:
                </span>

                {options.map((opt) => {
                  const isSelected = selectedOption === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        detectiveAudio.playPaperRustle()
                        setSelectedOption(opt.id)
                        setErrorMsg('')
                      }}
                      className={cn(
                        'w-full text-left p-3.5 rounded-none border-2 transition-all flex items-start gap-3 cursor-pointer select-none',
                        isSelected
                          ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] shadow-sm'
                          : 'bg-[#fdfcf9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#f4ebd9]'
                      )}
                    >
                      <div
                        className={cn(
                          'size-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all bg-white',
                          isSelected ? 'border-[#2b1f14] bg-[#2b1f14]' : 'border-[#4a3520]'
                        )}
                      >
                        {isSelected && <div className="size-2 rounded-full bg-white" />}
                      </div>

                      <span className="text-xs sm:text-sm font-medium leading-snug">
                        {opt.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* FOOTER */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-[#dfd3bd] hover:bg-[#d4c5ab] border-2 border-[#4a3520] text-[#2b1f14] text-xs font-mono font-bold rounded-none transition-colors cursor-pointer"
                >
                  ĐÓNG
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider rounded-none transition-all flex items-center gap-2 border-2 border-[#2b1f14] shadow-md cursor-pointer"
                >
                  <span>NỘP KẾT LUẬN</span>
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

