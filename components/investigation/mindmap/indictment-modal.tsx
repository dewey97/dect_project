'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gavel, AlertTriangle, Lightbulb } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { emitInvestigationEvent } from '@/lib/investigation-events'
import { PHONE_LOOKUP_EVIDENCE_IDS } from '@/lib/cases/case-000-clues'
import { setStorageItem } from '@/lib/storage'

interface IndictmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitIndictment: (data: {
    culprit: 'vu' | 'tung' | 'ha'
    suspectName: string
    motive: string
    selectedClueIds: string[]
    reasoning: string
  }) => void
  isPhoneSolved?: boolean
}
const MOTIVE_OPTIONS = [
  { id: 'motive-1', label: 'Mâu thuẫn tài chính (ra tay do lợi ích kinh tế)' },
  { id: 'motive-2', label: 'Báo thù (ra tay do một mâu thuẫn từ quá khứ)' },
  { id: 'motive-3', label: 'Mâu thuẫn tình cảm (thuần túy do cảm xúc)' },
  { id: 'motive-4', label: 'Diệt khẩu (ra tay do bí mật bị nắm giữ)' },
  { id: 'motive-5', label: 'Tự vệ (xuất phát từ sự sợ hãi & phản kháng)' },
  { id: 'motive-6', label: 'Tâm thần (xuất phát từ vấn đề tâm lý của hung thủ)' },
]

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

import { isAdminBypassCode, hasAdminBypassInArray } from '@/lib/cases/admin-bypass'

export function isCulpritValid(inputName: string): 'vu' | 'tung' | 'ha' | false {
  if (isAdminBypassCode(inputName)) return 'ha'
  const norm = normalizeName(inputName)
  if (norm.includes('vu') || norm.includes('lequangvu')) {
    return 'vu'
  }
  if (norm.includes('tung') || norm.includes('nguyenthanhtung')) {
    return 'tung'
  }
  if (norm.includes('ha') || norm.includes('tranthiha')) {
    return 'ha'
  }
  return false
}export function checkIndictmentEvidenceMatch(val: string, targetCodes: string[]): boolean {
  if (isAdminBypassCode(val)) return true
  const trimmed = val.trim().toLowerCase()
  if (!trimmed) return false

  // Tách các token do người dùng nhập (hỗ trợ phân tách bằng dấu phẩy, khoảng trắng, gạch nối)
  const tokens = trimmed.split(/[\s,;]+/).map((t) => t.trim().toLowerCase()).filter(Boolean)
  const nums: string[] = val.match(/\d+/g) || []

  return targetCodes.some((tc) => {
    const targetNorm = tc.trim().toLowerCase()
    const targetClean = targetNorm.replace(/[^a-z0-9]/g, '')
    // 1. Trùng chính xác mã (ví dụ: '53', 'c-02', 'd-04', 'd-05', 'd-02')
    if (tokens.some((tok) => tok === targetNorm || tok.replace(/[^a-z0-9]/g, '') === targetClean)) {
      return true
    }
    // 2. Trùng chuỗi số
    const targetNum = targetNorm.match(/\d+/)?.[0]
    if (targetNum && nums.includes(targetNum)) {
      return true
    }
    return false
  })
}

export function IndictmentModal({
  isOpen,
  onClose,
  onSubmitIndictment,
  isPhoneSolved
}: IndictmentModalProps) {
  const [suspectName, setSuspectName] = useState('')
  const [selectedMotiveOption, setSelectedMotiveOption] = useState<string>('')
  const [cluesEvidenceInput, setCluesEvidenceInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suspectName.trim()) {
      setErrorMsg('Vui lòng nhập Tên bị can bị đề nghị truy tố!')
      detectiveAudio.playGlassSound()
      return
    }

    const isAdmin000 =
      isAdminBypassCode(suspectName) ||
      isAdminBypassCode(cluesEvidenceInput)

    const culprit = isAdmin000 ? 'ha' : isCulpritValid(suspectName)
    if (!culprit || (culprit !== 'ha' && !isAdmin000)) {
      setErrorMsg('Kết luận chưa chính xác. Vui lòng đối chiếu lại toàn bộ chứng cứ.')
      detectiveAudio.playGlassSound()
      return
    }

    if (!selectedMotiveOption && !isAdmin000) {
      setErrorMsg('Vui lòng chọn Động cơ gây án chính của bị can!')
      detectiveAudio.playGlassSound()
      return
    }

    // Validation mục 2 (chứng minh dấu vết vụ án):
    // Chấp nhận mã số 53 (tài liệu dấu vết cũ) hoặc các mã vật chứng C-02, D-04, D-05, D-02 (hoa xoan, lọn tóc, kéo, hộp sắt)
    if (!isAdmin000) {
      if (!cluesEvidenceInput.trim()) {
        setErrorMsg('Vui lòng nhập Mã chứng cứ chứng minh dấu vết phạm tội!')
        detectiveAudio.playGlassSound()
        return
      }
      const validEvidenceCodes = ['53', 'c-02', 'c02', 'c2', 'd-04', 'd04', 'd4', 'd-05', 'd05', 'd5', 'd-02', 'd02', 'd2']
      if (!checkIndictmentEvidenceMatch(cluesEvidenceInput, validEvidenceCodes)) {
        setErrorMsg('Mã chứng cứ mục 2 chưa chính xác!')
        detectiveAudio.playGlassSound()
        return
      }
    }

    const combinedClueInputs = [cluesEvidenceInput]
      .filter((s) => s.trim().length > 0)

    detectiveAudio.playStampSound()
    setStorageItem('indictment_solved', 'true')
    setStorageItem('indictment_culprit', 'ha')

    const selectedOptionLabel = MOTIVE_OPTIONS.find((m) => m.id === selectedMotiveOption)?.label || ''

    onSubmitIndictment({
      culprit,
      suspectName: suspectName.trim(),
      motive: selectedOptionLabel,
      selectedClueIds: combinedClueInputs,
      reasoning: `Động cơ: ${selectedOptionLabel}`
    })
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-none overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* HEADER */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#7f1d1d] block">
                VIỆN KIỂM SÁT // CÁO TRẠNG TRUY TỐ
              </span>
              <h3 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wider">
                BẢN KẾT LUẬN ĐIỀU TRA VÀ ĐỀ NGHỊ TRUY TỐ
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  detectiveAudio.playTypewriterClick()
                  emitInvestigationEvent('OPEN_HINT', { checkpointId: 'cp-000-2b' })
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

          {/* FORM BODY */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5]">
            {errorMsg && (
              <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-red-800" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. THÔNG TIN VỤ ÁN */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider border-b border-[#2b1f14]/20 pb-1.5">
                1. THÔNG TIN VỤ ÁN:
              </h4>
              <div className="space-y-3 text-xs text-[#1a120b]">
                {/* 1.1 Bị can bị đề nghị truy tố */}
                <div className="space-y-1">
                  <label className="font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                    • Bị can bị đề nghị truy tố: <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    value={suspectName}
                    onChange={(e) => {
                      setSuspectName(e.target.value)
                      if (errorMsg) setErrorMsg('')
                    }}
                    className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-3.5 py-2 text-sm sm:text-base text-[#0e2b5c] font-sans font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
                  />
                </div>

                {/* 1.2 - 1.5 Static Case Details */}
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-sans text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase">Tội danh:</span>
                    <span className="font-bold text-[#1a120b]">Giết người</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase">Thời gian gây án:</span>
                    <span className="font-bold text-[#8c1d1d] font-mono">20:45 - 21:15</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-baseline gap-1.5 font-sans text-xs">
                  <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase shrink-0">Địa điểm:</span>
                  <span className="font-bold text-[#1a120b] leading-tight">
                    Phòng khách tại nhà riêng, số 14, Đường Bờ Sông, Phường Phân khu Cảng, Quận Sông Hồng, TP. Hà Nội
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-sans text-xs">
                  <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase shrink-0">Hung khí:</span>
                  <span className="font-bold text-[#1a120b]">Mảnh gốm vỡ dài :8.2 cm</span>
                </div>

                {/* 1.6 ĐỘNG CƠ GÂY ÁN CHÍNH */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-mono text-xs font-bold text-[#4a3520] block uppercase tracking-wider">
                    • Động cơ gây án chính: <span className="text-red-700">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MOTIVE_OPTIONS.map((opt) => {
                      const isSelected = selectedMotiveOption === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            detectiveAudio.playTypewriterClick()
                            setSelectedMotiveOption(opt.id)
                            if (errorMsg) setErrorMsg('')
                          }}
                          className={cn(
                            'text-left p-2.5 border-2 transition-all flex items-center gap-2 cursor-pointer select-none rounded-none',
                            isSelected
                              ? 'bg-[#2b1f14] border-[#2b1f14] text-[#f6f1e5] font-bold shadow-sm'
                              : 'bg-[#fdfcf9] border-[#d4c5b0] text-[#2b1f14] hover:bg-[#ede3cf]'
                          )}
                        >
                          <div
                            className={cn(
                              'size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                              isSelected ? 'border-[#d9a066] bg-[#d9a066]' : 'border-[#4a3520] bg-white'
                            )}
                          />
                          <span className="text-xs leading-tight flex-1">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CĂN CỨ CHỨNG MINH HÀNH VI PHẠM TỘI */}
            <div className="space-y-1.5 pt-1">
              <label className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider block border-b border-[#2b1f14]/20 pb-1.5">
                2. CĂN CỨ CHỨNG MINH BỊ CAN ĐỂ LẠI HOẶC MANG THEO DẤU VẾT VỤ ÁN: <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={cluesEvidenceInput}
                onChange={(e) => {
                  setCluesEvidenceInput(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                placeholder="Nhập mã chứng cứ (ví dụ: C-02, D-04, D-05, D-02 hoặc 53)..."
                className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-3.5 py-2 text-xs sm:text-sm text-[#0e2b5c] font-mono font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
              />
            </div>

            {/* FOOTER / CTA */}
            <div className="pt-3 flex items-center justify-end border-t-2 border-[#2b1f14]/15">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-red-800 hover:bg-red-900 text-[#fff5f5] font-mono font-black text-xs tracking-wider rounded-none transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer uppercase border-2 border-[#450a0a]"
              >
                <Gavel className="size-4" />
                <span>ĐỀ NGHỊ TRUY TỐ</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
