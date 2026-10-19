'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, CheckCircle2, ArrowRight, ShieldCheck, Check, Sparkles, Lightbulb } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { emitInvestigationEvent } from '@/lib/investigation-events'

import { ClueCodePicker } from './clue-code-picker'
import { isAdminBypassCode, hasAdminBypassInArray } from '@/lib/cases/admin-bypass'
import { isEvidenceMatching } from '@/lib/cases/case-000-clues'
import { getStorageItem, setStorageItem, getStorageJson, setStorageJson } from '@/lib/storage'
import { normalizeImageUrl } from '@/lib/utils'
import { usePhoneData } from '@/lib/hooks/use-phone-data'
import { useCaseCheckpoints } from '@/lib/hooks/use-case-checkpoints'
import { CheckpointHintSection } from '@/components/investigation/checkpoint-hint-section'
import { HaDiscoveredPhotosPopup } from './followup/ha-discovered-photos-popup'

interface FollowupQuestionModalProps {
  caseId?: string
  isOpen: boolean
  culprit: string | null
  onClose: () => void
  onSuccess?: (culprit: string, choice?: string) => void
  onOpenDossier?: (dossierType: 'A' | 'B' | 'C') => void
  isPhoneSolved?: boolean
}

const DEFAULT_OPTIONS_TUNG = [
  { id: 'tin', label: 'CÓ' },
  { id: 'khong_tin', label: 'KHÔNG' }
]

export function FollowupQuestionModal({
  caseId = 'case-000',
  isOpen,
  culprit,
  onClose,
  onSuccess,
  onOpenDossier,
  isPhoneSolved
}: FollowupQuestionModalProps) {
  const normalizedCaseId = useMemo(() => caseId.replace(/-/g, '_'), [caseId])
  const { checkpoints } = useCaseCheckpoints(caseId)

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

  // State for Dynamic Custom Suspects
  const [customTextInput, setCustomTextInput] = useState<string>('')
  const [customSelectedOption, setCustomSelectedOption] = useState<string | null>(null)
  
  // Fetch photos dynamically from Google Sheets Live CMS ('evidences' tab)
  const { data: rawSheetPhotos } = usePhoneData('evidences', normalizedCaseId)

  const isVu = culprit === 'vu'
  const isTung = culprit === 'tung'
  const isHa = culprit === 'ha'
  const isCustom = !isVu && !isTung && !isHa

  // Live Checkpoint metadata for Ha followup (cp-000-1c-followup or cp-000-2a or cp-000-1c)
  const haCheckpoint = useMemo(() => {
    return (
      checkpoints.find((cp) => cp.followupOf?.toLowerCase().trim() === 'ha') ||
      checkpoints.find((cp) => cp.id === 'cp-000-1c-followup') ||
      checkpoints.find((cp) => cp.id === 'cp-000-2a') ||
      checkpoints.find((cp) => cp.id === 'cp-000-1c')
    )
  }, [checkpoints])

  // Live Checkpoint metadata for Vu followup (cp-000-1a-followup or cp-000-1a)
  const vuCheckpoint = useMemo(() => {
    return (
      checkpoints.find((cp) => cp.followupOf?.toLowerCase().trim() === 'vu') ||
      checkpoints.find((cp) => cp.id === 'cp-000-1a-followup') ||
      checkpoints.find((cp) => cp.id === 'cp-000-1a')
    )
  }, [checkpoints])

  // Live Checkpoint metadata for Tung followup (cp-000-1b-followup or cp-000-1b)
  const tungCheckpoint = useMemo(() => {
    return (
      checkpoints.find((cp) => cp.followupOf?.toLowerCase().trim() === 'tung') ||
      checkpoints.find((cp) => cp.id === 'cp-000-1b-followup') ||
      checkpoints.find((cp) => cp.id === 'cp-000-1b')
    )
  }, [checkpoints])

  // Live Checkpoint metadata for Custom Suspect
  const customCheckpoint = useMemo(() => {
    if (!culprit || isVu || isTung || isHa) return null
    const cLow = culprit.toLowerCase().trim()
    return (
      checkpoints.find((cp) => cp.followupOf?.toLowerCase().trim() === cLow) ||
      checkpoints.find((cp) => cp.id === `cp-${culprit}-followup`) ||
      checkpoints.find((cp) => cp.id === `cp-${culprit}`) ||
      checkpoints.find((cp) => {
        const titleLower = (cp.title || '').toLowerCase()
        const qLower = (cp.question || '').toLowerCase()
        return titleLower.includes(culprit) || qLower.includes(culprit)
      }) ||
      null
    )
  }, [checkpoints, culprit, isVu, isTung, isHa])

  const customCharacterName = useMemo(() => {
    if (!culprit || isVu || isTung || isHa) return ''
    if (Array.isArray(rawSheetPhotos)) {
      const match = rawSheetPhotos.find((p: any) => {
        const code = String(p.code || p.photo_code || '').toLowerCase()
        return code === culprit || code === `avatar_${culprit}`
      })
      if (match) {
        return String(match.label || match.title || '')
          .replace(/^(Ảnh chân dung|Ảnh thẻ|Ảnh|Chân dung|Nạn nhân|Nghi phạm|Nhân chứng)\s+/i, '')
          .replace(/\s*\([^)]*\)/g, '')
          .trim()
      }
    }
    return culprit
  }, [culprit, rawSheetPhotos, isVu, isTung, isHa])

  // Lấy 3 ảnh từ sheet photos cho popup kết quả (100% Live CMS)
  // Lấy 3 vật chứng (D-06, D-05, D-04) từ sheet photos cho popup kết quả (100% Live CMS)
  const haDiscoveredPhotos = useMemo(() => {
    if (!rawSheetPhotos || rawSheetPhotos.length === 0) return []

    // Chuẩn hóa danh sách ảnh từ sheet photos
    const mappedPhotos = rawSheetPhotos
      .filter((p: any) => Boolean(p.drive_url || p.direct_cdn_url || p.url || p.local_file_path))
      .map((p: any, idx: number) => ({
        id: (p.code || p.photo_code || `photo-ha-${idx}`).trim(),
        title: (p.label || p.title || p.file_name || `Vật chứng #${idx + 1}`).trim(),
        url: normalizeImageUrl(p.direct_cdn_url || p.drive_url || p.url || p.local_file_path || ''),
      }))

    // Thứ tự ưu tiên mở khóa chính xác: D-06 (Túi bùa đỏ), D-05 (Chiếc kéo dính máu), D-04 (Túi zip chứa tóc dính máu)
    const TARGET_CODES =
      haCheckpoint?.photoCodes && haCheckpoint.photoCodes.length >= 3
        ? haCheckpoint.photoCodes
        : ['D-06', 'D-05', 'D-04']

    const discovered: Array<{ id: string; title: string; url: string }> = []

    // 1. Quét tìm chính xác theo mã photo_code (D-06, D-05, D-04)
    for (const code of TARGET_CODES) {
      const cleanCode = code.trim().toLowerCase()
      const normCode = cleanCode.replace(/[-_\s]/g, '')

      const found = mappedPhotos.find((p) => {
        const pid = p.id.toLowerCase()
        const pidNorm = pid.replace(/[-_\s]/g, '')
        const ptitle = p.title.toLowerCase()
        return (
          pid === cleanCode ||
          pidNorm === normCode ||
          ptitle.startsWith(cleanCode) ||
          ptitle.startsWith(`${cleanCode}:`) ||
          ptitle.includes(`[${cleanCode}]`) ||
          ptitle.includes(`(${cleanCode})`)
        )
      })

      if (found && !discovered.some((item) => item.id === found.id)) {
        discovered.push(found)
      }
    }

    // 2. Nếu thiếu, bổ sung theo từ khóa đặc trưng tương ứng với D-06 (bùa), D-05 (kéo), D-04 (tóc)
    if (discovered.length < 3) {
      const codeFallbacks: Array<{ code: string; keywords: string[] }> = [
        { code: 'D-06', keywords: ['d-06', 'd06', 'bùa', 'túi bùa'] },
        { code: 'D-05', keywords: ['d-05', 'd05', 'kéo'] },
        { code: 'D-04', keywords: ['d-04', 'd04', 'tóc', 'túi zip'] },
      ]

      for (const fb of codeFallbacks) {
        if (discovered.length >= 3) break
        const alreadyHas = discovered.some((d) => {
          const did = d.id.toLowerCase()
          return (
            did.includes(fb.code.toLowerCase()) ||
            fb.keywords.some((kw) => did.includes(kw) || d.title.toLowerCase().includes(kw))
          )
        })
        if (alreadyHas) continue

        const found = mappedPhotos.find((p) => {
          const pid = p.id.toLowerCase()
          const ptitle = p.title.toLowerCase()
          return (
            fb.keywords.some((kw) => pid.includes(kw) || ptitle.includes(kw)) &&
            !discovered.some((d) => d.id === p.id)
          )
        })

        if (found) {
          discovered.push(found)
        }
      }
    }

    // 3. Fallback an toàn nếu vẫn chưa đủ 3 ảnh: lấy các ảnh hợp lệ khác ngoại trừ avatar chân dung
    if (discovered.length < 3) {
      for (const p of mappedPhotos) {
        const t = p.title.toLowerCase()
        if (t.includes('chân dung') || p.id.toLowerCase().startsWith('avatar_')) continue
        if (!discovered.some((item) => item.id === p.id)) {
          discovered.push(p)
        }
        if (discovered.length >= 3) break
      }
    }

    return discovered.slice(0, 3)
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
      // Luôn đặt false khi mở modal: Người chơi phải thao tác mở khóa xong mới bật popup 3 vật chứng
      setShowHaPhotoPopup(false)
      setHaPasswordInput('')
    } else if (culprit === 'vu') {
      const savedVu = getStorageItem('followup_vu')
      if (savedVu) {
        setVuTimeInput(savedVu)
      } else {
        setVuTimeInput('')
      }
    } else if (culprit === 'tung') {
      const saved = getStorageItem('followup_tung')
      if (saved) {
        setSelectedOption(saved)
      } else {
        setSelectedOption(null)
      }
    } else {
      const saved = getStorageItem(`followup_${culprit}`)
      if (saved) {
        setCustomTextInput(saved)
        setCustomSelectedOption(saved)
      } else {
        setCustomTextInput('')
        setCustomSelectedOption(null)
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

  const handleSubmitVu = (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = vuTimeInput.trim().toLowerCase().replace(/\s+/g, '')
    if (!normalized) {
      setErrorMsg('Vui lòng nhập mốc thời gian!')
      detectiveAudio.playGlassSound()
      return
    }

    const isBypass = isAdminBypassCode(normalized)
    const expectedFromSheet = (vuCheckpoint?.correctAnswer || '21:15')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')

    const isMatch =
      isBypass ||
      normalized === expectedFromSheet ||
      normalized === expectedFromSheet.replace(':', 'h') ||
      normalized === expectedFromSheet.replace('h', ':') ||
      normalized === '21:15' ||
      normalized === '21h15'

    if (isMatch) {
      detectiveAudio.playStampSound()
      setErrorMsg('')
      const finalVuAnswer = vuCheckpoint?.correctAnswer || '21:15'
      setStorageItem('followup_vu', finalVuAnswer)
      if (onSuccess) {
        onSuccess('vu', finalVuAnswer)
      }
      onClose()
    } else {
      detectiveAudio.playGlassSound()
      setErrorMsg('⚠️ Đáp án chưa chính xác. Vui lòng kiểm tra lại mốc thời gian trong Hồ sơ B!')
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

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!culprit) return

    if (!customCheckpoint) {
      detectiveAudio.playStampSound()
      setStorageItem(`followup_${culprit}`, 'solved')
      if (onSuccess) {
        onSuccess(culprit, 'solved')
      }
      onClose()
      return
    }

    if (customCheckpoint?.options && customCheckpoint.options.length > 0) {
      if (!customSelectedOption) {
        setErrorMsg('Vui lòng tích chọn một phương án!')
        detectiveAudio.playGlassSound()
        return
      }

      const expected = (customCheckpoint.correctAnswer || '').trim().toLowerCase()
      const isBypass = isAdminBypassCode(customSelectedOption)
      const isCorrect =
        !expected ||
        isBypass ||
        customSelectedOption.toLowerCase().includes(expected)

      if (isCorrect) {
        detectiveAudio.playStampSound()
        setErrorMsg('')
        setStorageItem(`followup_${culprit}`, customSelectedOption)
        if (onSuccess) {
          onSuccess(culprit, customSelectedOption)
        }
        onClose()
      } else {
        detectiveAudio.playGlassSound()
        setErrorMsg('⚠️ Đáp án chưa chính xác. Vui lòng rà soát lại các manh mối!')
      }
      return
    }

    // Text input
    const rawVal = customTextInput.trim()
    if (!rawVal) {
      setErrorMsg('Vui lòng nhập câu trả lời!')
      detectiveAudio.playGlassSound()
      return
    }

    const expected = (customCheckpoint?.correctAnswer || '').trim().toLowerCase()
    const isBypass = isAdminBypassCode(rawVal)
    const isCorrect =
      !expected ||
      isBypass ||
      rawVal.toLowerCase().replace(/\s+/g, '') === expected.replace(/\s+/g, '')

    if (isCorrect) {
      detectiveAudio.playStampSound()
      setErrorMsg('')
      setStorageItem(`followup_${culprit}`, rawVal)
      if (onSuccess) {
        onSuccess(culprit, rawVal)
      }
      onClose()
    } else {
      detectiveAudio.playGlassSound()
      setErrorMsg('⚠️ Đáp án chưa chính xác. Vui lòng kiểm tra lại tài liệu điều tra!')
    }
  }

  const handleSubmitHa = (e: React.FormEvent) => {
    e.preventDefault()
    const rawVal = haPasswordInput.trim().toLowerCase().replace(/\s+/g, '')
    if (!rawVal) {
      setErrorMsg('Vui lòng nhập mật mã hộp thiếc!')
      detectiveAudio.playGlassSound()
      return
    }

    // Lấy đáp án chuẩn từ Live CMS (checkpoints: 120713)
    const expectedFromSheet = (haCheckpoint?.correctAnswer || '120713')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')

    const isMasterBypass = isAdminBypassCode(rawVal)
    const isCorrect =
      isMasterBypass ||
      rawVal === expectedFromSheet ||
      rawVal === '120713' ||
      (expectedFromSheet.length >= 6 && expectedFromSheet.includes(rawVal))

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

  const questionTextTung =
    tungCheckpoint?.question ||
    'Toàn bộ hành tung của Nguyễn Thanh Tùng trong đêm xảy ra vụ án đã được thu thập & phân tích. Các mảnh ghép đã dần lộ diện.\n\nDựa vào những gì đang nắm giữ, bạn có tin đối tượng này vô tội?'

  const optionsTung = useMemo(() => {
    if (tungCheckpoint?.options && tungCheckpoint.options.length > 0) {
      return tungCheckpoint.options.map((opt, idx) => ({
        id: opt.toLowerCase().includes('không')
          ? 'khong_tin'
          : opt.toLowerCase().includes('có')
          ? 'tin'
          : `opt_${idx}`,
        label: opt,
      }))
    }
    return DEFAULT_OPTIONS_TUNG
  }, [tungCheckpoint])

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
                    : isTung
                    ? 'HỒ SƠ MỞ RỘNG // CÂU HỎI SUY LUẬN'
                    : (customCheckpoint?.title || 'HỒ SƠ MỞ RỘNG // CÂU HỎI SUY LUẬN')}
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
                {isCustom && (
                  <span className="font-mono text-xs font-bold text-[#8c1d1d] block mt-0.5">
                    Đối tượng: {customCheckpoint?.suspectLabel || customCharacterName || culprit}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
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
            <form onSubmit={handleSubmitVu} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5] paper-scrollbar">
              {errorMsg && (
                <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {/* MỞ TÚI HỒ SƠ B INSTRUCTION */}
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

              {/* GỢI Ý ĐIỀU TRA ĐẨY XUỐNG DƯỚI FORM NHẬP */}
              <CheckpointHintSection
                checkpointId="cp-000-1a-followup"
                caseId={caseId}
              />

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
            <form onSubmit={handleSubmitHa} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5] paper-scrollbar">
              {errorMsg && (
                <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* TÚI HỒ SƠ D */}
              <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
                  📂 MỞ TÚI HỒ SƠ D
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
              </div>

              {/* GỢI Ý ĐIỀU TRA ĐẨY XUỐNG DƯỚI FORM NHẬP */}
              <CheckpointHintSection
                checkpointId="cp-000-1c-followup"
                caseId={caseId}
              />

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
          ) : isTung ? (
            /* FORM FOR TUNG */
            <form onSubmit={handleSubmitTung} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5] paper-scrollbar">
              {errorMsg && (
                <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* MỞ TÚI HỒ SƠ B04 */}
              <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm">
                <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
                  📂 MỞ TÚI HỒ SƠ B04
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
                  {optionsTung.map((opt) => {
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

              {/* GỢI Ý ĐIỀU TRA ĐẨY XUỐNG DƯỚI FORM */}
              <CheckpointHintSection
                checkpointId="cp-000-1b"
                caseId={caseId}
              />

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
          ) : (
            /* FORM FOR DYNAMIC CUSTOM SUSPECT */
            <form onSubmit={handleSubmitCustom} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5] paper-scrollbar">
              {errorMsg && (
                <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* TÚI HỒ SƠ */}
              <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
                  📂 {customCheckpoint?.dossier || 'TÀI LIỆU ĐIỀU TRA MỞ RỘNG'}
                </span>
              </div>

              {/* QUESTION BOX */}
              <div className="p-4 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
                <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
                  YÊU CẦU ĐIỀU TRA:
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed whitespace-pre-line">
                  {customCheckpoint?.question ||
                    'Hồ sơ tình nghi của đối tượng đã được tiếp nhận. Hãy hoàn tất điều tra đối tượng này.'}
                </p>
              </div>

              {/* OPTIONS HOẶC TEXT INPUT */}
              {customCheckpoint?.options && customCheckpoint.options.length > 0 ? (
                <div className="space-y-3">
                  <span className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
                    LỰA CHỌN KẾT LUẬN CỦA ĐIỀU TRA VIÊN:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customCheckpoint.options.map((opt, idx) => {
                      const isSelected = customSelectedOption === opt
                      return (
                        <button
                          key={`custom-opt-${idx}`}
                          type="button"
                          onClick={() => {
                            detectiveAudio.playTypewriterClick()
                            setCustomSelectedOption(opt)
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
                            {opt}
                          </span>
                          {isSelected && (
                            <Check className="size-4 text-[#2e5220] stroke-[2.5]" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <label className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
                    Nhập câu trả lời / mã số suy luận:
                  </label>
                  <input
                    type="text"
                    value={customTextInput}
                    onChange={(e) => {
                      setCustomTextInput(e.target.value)
                      setErrorMsg('')
                    }}
                    placeholder="Nhập đáp án hoặc kết luận..."
                    className="w-full p-3.5 bg-[#fdfcf9] border-2 border-[#2b1f14] text-[#1a120b] font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]"
                  />
                </div>
              )}

              {/* GỢI Ý ĐIỀU TRA ĐẨY XUỐNG DƯỚI FORM */}
              <CheckpointHintSection
                checkpointId={customCheckpoint?.id || (culprit ? `cp-${culprit}-followup` : '')}
                caseId={caseId}
              />

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
          )}

        </motion.div>
      </div>

      {/* POPUP 3 ẢNH TOÀN MÀN HÌNH (KHÔNG BỊ BỌC TRONG KHUNG MODAL, ZERO-SCROLL OVERLAY) */}
      <HaDiscoveredPhotosPopup
        isOpen={showHaPhotoPopup}
        photos={haDiscoveredPhotos}
        onContinue={handleFinishHaAfterPopup}
      />
    </AnimatePresence>
  )
}

