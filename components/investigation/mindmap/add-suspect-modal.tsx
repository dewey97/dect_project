'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Trash2, Check, Save } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'
import { checkpoints000 } from '@/content/cases/case-000/checkpoints'

interface SuspectItemData {
  id: string
  name: string
  clueIds: string[]
}

interface AddSuspectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (suspect: SuspectItemData) => void
  onDelete?: (id: string) => void
  editingSuspect?: SuspectItemData | null
}

// Lấy danh sách chứng cứ chuẩn từ checkpoints000 (ưu tiên cp-000-1a hoặc cp-000-2a)
const AVAILABLE_EVIDENCES =
  checkpoints000.find((cp) => cp.id === 'cp-000-1a')?.pickerConfig?.availableEvidences ||
  checkpoints000.find((cp) => cp.id === 'cp-000-2a')?.pickerConfig?.availableEvidences ||
  []

export function AddSuspectModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingSuspect
}: AddSuspectModalProps) {
  const [name, setName] = useState('')
  const [subTileView, setSubTileView] = useState<'overview' | 'motive' | 'alibi'>('overview')
  const [motiveClueIds, setMotiveClueIds] = useState<string[]>([])
  const [alibiClueIds, setAlibiClueIds] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (editingSuspect) {
      setName(editingSuspect.name)
      const clues = editingSuspect.clueIds || []
      setMotiveClueIds(clues)
      setAlibiClueIds([])
    } else {
      setName('')
      setMotiveClueIds([])
      setAlibiClueIds([])
    }
    setSubTileView('overview')
    setErrorMsg('')
  }, [editingSuspect, isOpen])

  if (!isOpen) return null

  // NÚT 1: LƯU HỒ SƠ (Chỉ cập nhật / lưu nghi phạm lên Sơ đồ mà không cần kiểm tra kết luận)
  const handleSaveProfile = () => {
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên đối tượng tình nghi!')
      detectiveAudio.playGlassSound()
      return
    }

    const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds]))

    detectiveAudio.playStampSound()
    onSave({
      id: editingSuspect ? editingSuspect.id : `suspect-${Date.now()}`,
      name: name.trim(),
      clueIds: combinedClues
    })
    onClose()
  }

  // NÚT 2: NỘP KẾT LUẬN (Yêu cầu đúng cả căn cứ động cơ và tài liệu bóc trần ngoại phạm)
  const handleSubmitConclusion = () => {
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên đối tượng tình nghi!')
      detectiveAudio.playGlassSound()
      return
    }

    if (motiveClueIds.length === 0) {
      setErrorMsg('Nộp kết luận yêu cầu chọn ít nhất 1 Căn cứ động cơ gây án!')
      detectiveAudio.playGlassSound()
      return
    }

    if (alibiClueIds.length === 0) {
      setErrorMsg('Nộp kết luận yêu cầu chọn ít nhất 1 Tài liệu bóc trần ngoại phạm!')
      detectiveAudio.playGlassSound()
      return
    }

    const normalizedName = name.trim().toLowerCase()
    const isVu = ['lê quang vũ', 'vũ', 'le quang vu', 'vu'].includes(normalizedName)
    const isTung = ['nguyễn thanh tùng', 'tùng', 'nguyen thanh tung', 'tung'].includes(normalizedName)

    if (!isVu && !isTung) {
      setErrorMsg('Đối tượng chưa thuộc danh sách nghi phạm trọng điểm (Lê Quang Vũ hoặc Nguyễn Thanh Tùng)!')
      detectiveAudio.playGlassSound()
      return
    }

    if (isVu) {
      const vuMotiveValid = motiveClueIds.some((id) => ['doc_10_so_no', 'sms_dev00', 'p6_anh_vu'].includes(id))
      const vuAlibiValid = alibiClueIds.some((id) => ['doc_06_loi_khai_lua', 'p10_app_xe', 'doc_07b_loi_khai_vu'].includes(id))
      if (!vuMotiveValid || !vuAlibiValid) {
        setErrorMsg('Kết luận chưa chính xác! Vui lòng kiểm tra lại căn cứ động cơ & tài liệu ngoại phạm của Lê Quang Vũ.')
        detectiveAudio.playGlassSound()
        return
      }
    }

    if (isTung) {
      const tungMotiveValid = motiveClueIds.some((id) => ['doc_14_loi_khai_tung', 'p4_van_tay', 'doc_10_so_no'].includes(id))
      const tungAlibiValid = alibiClueIds.some((id) => ['p5_manh_bao', 'p4_anh_1996'].includes(id))
      if (!tungMotiveValid || !tungAlibiValid) {
        setErrorMsg('Kết luận chưa chính xác! Vui lòng kiểm tra lại căn cứ động cơ & tài liệu ngoại phạm của Nguyễn Thanh Tùng.')
        detectiveAudio.playGlassSound()
        return
      }
    }

    const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds]))

    detectiveAudio.playStampSound()
    onSave({
      id: editingSuspect ? editingSuspect.id : `suspect-${Date.now()}`,
      name: name.trim(),
      clueIds: combinedClues
    })
    onClose()
  }

  // TỰ ĐỘNG LƯU KHI ẤN NÚT X (Nếu đã nhập tên đối tượng)
  const handleAutoSaveAndClose = () => {
    if (name.trim()) {
      const combinedClues = Array.from(new Set([...motiveClueIds, ...alibiClueIds]))
      detectiveAudio.playPaperRustle()
      onSave({
        id: editingSuspect ? editingSuspect.id : `suspect-${Date.now()}`,
        name: name.trim(),
        clueIds: combinedClues
      })
    }
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 rounded-none font-sans select-text max-h-[90vh] overflow-y-auto"
        >
          {/* TOP RIGHT X CLOSE WITH AUTO-SAVE */}
          <button
            type="button"
            onClick={handleAutoSaveAndClose}
            className="absolute top-4 right-4 p-1 text-[#2b1f14] hover:bg-[#2b1f14]/10 transition-colors cursor-pointer z-20"
            title="Đóng & Tự động lưu"
          >
            <X className="size-5" />
          </button>

          {/* DOCUMENT HEADER & QUESTION */}
          <div className="space-y-1.5 border-b border-[#2b1f14]/20 pb-3 pr-8">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6b4e2e] block">
              Biên Bản Xác Định Đối Tượng Tình Nghi
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#1a120b] leading-relaxed">
              Điền danh tính đối tượng tình nghi và bóc tách các căn cứ động cơ, ngoại phạm:
            </h3>
          </div>

          {/* FORM BODY */}
          <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4 pt-4">
            {/* 2-TILE OVERVIEW VIEW */}
            {subTileView === 'overview' && (
              <>
                {/* SUSPECT NAME INPUT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                    Đối tượng tình nghi:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errorMsg) setErrorMsg('')
                      }}
                      className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-4 py-2.5 text-base sm:text-lg text-[#0e2b5c] font-[family-name:var(--font-handwriting)] font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
                      autoFocus
                    />
                  </div>
                  {errorMsg && (
                    <p className="text-xs text-red-700 font-mono font-bold mt-1">
                      ⚠️ {errorMsg}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                    DANH MỤC THẨM TRA & BÓC TÁCH MANH MỐI:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                    {/* Tile 1: CĂN CỨ ĐỘNG CƠ GÂY ÁN */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!name.trim()) {
                          setErrorMsg('Vui lòng nhập tên đối tượng tình nghi trước!')
                          detectiveAudio.playGlassSound()
                          return
                        }
                        detectiveAudio.playTypewriterClick()
                        setSubTileView('motive')
                      }}
                      className={cn(
                        'w-full text-left p-3.5 border-2 transition-all flex flex-col justify-between cursor-pointer select-none relative group h-full min-h-[76px]',
                        motiveClueIds.length > 0
                          ? 'bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm'
                          : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22]'
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={cn(
                            'size-5 border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors mt-0.5',
                            motiveClueIds.length > 0
                              ? 'bg-[#2e5220] border-[#193310] text-white'
                              : 'bg-white border-[#4a3520]'
                          )}
                        >
                          {motiveClueIds.length > 0 && '✓'}
                        </div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b] leading-tight flex-1">
                          CĂN CỨ ĐỘNG CƠ GÂY ÁN
                        </span>
                      </div>
                      {motiveClueIds.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-[#2e5220]/20 flex items-center text-[0.725rem] font-sans leading-snug">
                          <span className="font-bold text-[#1f4014] flex items-center gap-1">
                            <Check className="size-3.5 shrink-0" /> Đã chọn {motiveClueIds.length} tài liệu chứng minh
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Tile 2: BÓC TRẦN LỜI KHAI NGOẠI PHẠM */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!name.trim()) {
                          setErrorMsg('Vui lòng nhập tên đối tượng tình nghi trước!')
                          detectiveAudio.playGlassSound()
                          return
                        }
                        detectiveAudio.playTypewriterClick()
                        setSubTileView('alibi')
                      }}
                      className={cn(
                        'w-full text-left p-3.5 border-2 transition-all flex flex-col justify-between cursor-pointer select-none relative group h-full min-h-[76px]',
                        alibiClueIds.length > 0
                          ? 'bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm'
                          : 'bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22]'
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={cn(
                            'size-5 border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors mt-0.5',
                            alibiClueIds.length > 0
                              ? 'bg-[#2e5220] border-[#193310] text-white'
                              : 'bg-white border-[#4a3520]'
                          )}
                        >
                          {alibiClueIds.length > 0 && '✓'}
                        </div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b] leading-tight flex-1">
                          BÓC TRẦN LỜI KHAI NGOẠI PHẠM
                        </span>
                      </div>
                      {alibiClueIds.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-[#2e5220]/20 flex items-center text-[0.725rem] font-sans leading-snug">
                          <span className="font-bold text-[#1f4014] flex items-center gap-1">
                            <Check className="size-3.5 shrink-0" /> Đã chọn {alibiClueIds.length} tài liệu bẻ gãy ngoại phạm
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Sub-View for Tile 1: MOTIVE */}
            {subTileView === 'motive' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-[#2b1f14]/20 pb-2">
                  <span className="text-xs font-mono font-bold text-[#1a120b] uppercase flex items-center gap-1.5">
                    TÀI LIỆU: CĂN CỨ ĐỘNG CƠ GÂY ÁN ({name})
                  </span>
                  <button
                    type="button"
                    onClick={() => setSubTileView('overview')}
                    className="p-1 bg-[#2b1f14] text-[#d9a066] hover:bg-[#3d2b1c] transition-colors cursor-pointer"
                    title="Quay lại"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                  {AVAILABLE_EVIDENCES.map((ev) => {
                    const isChecked = motiveClueIds.includes(ev.id)
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          detectiveAudio.playPaperRustle()
                          setMotiveClueIds((prev) =>
                            prev.includes(ev.id) ? prev.filter((id) => id !== ev.id) : [...prev, ev.id]
                          )
                        }}
                        className={cn(
                          'text-left p-2.5 rounded-none border-2 transition-all flex items-center gap-2.5 cursor-pointer relative select-none',
                          isChecked
                            ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] font-bold shadow-sm'
                            : 'bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]'
                        )}
                      >
                        <div className={cn(
                          'size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white',
                          isChecked ? 'border-[#2b1f14] text-[#0e2b5c]' : 'border-[#4a3520]'
                        )}>
                          {isChecked && <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none">✓</span>}
                        </div>
                        <span className="text-xs leading-snug flex-1">{ev.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSubTileView('overview')}
                    className="px-5 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-2 border-[#2b1f14]"
                  >
                    <Check className="size-3.5 text-[#d9a066]" /> XÁC NHẬN CĂN CỨ ĐỘNG CƠ
                  </button>
                </div>
              </div>
            )}

            {/* Sub-View for Tile 2: ALIBI */}
            {subTileView === 'alibi' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-[#2b1f14]/20 pb-2">
                  <span className="text-xs font-mono font-bold text-[#1a120b] uppercase flex items-center gap-1.5">
                    TÀI LIỆU: BÓC TRẦN LỜI KHAI NGOẠI PHẠM ({name})
                  </span>
                  <button
                    type="button"
                    onClick={() => setSubTileView('overview')}
                    className="p-1 bg-[#2b1f14] text-[#d9a066] hover:bg-[#3d2b1c] transition-colors cursor-pointer"
                    title="Quay lại"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                  {AVAILABLE_EVIDENCES.map((ev) => {
                    const isChecked = alibiClueIds.includes(ev.id)
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          detectiveAudio.playPaperRustle()
                          setAlibiClueIds((prev) =>
                            prev.includes(ev.id) ? prev.filter((id) => id !== ev.id) : [...prev, ev.id]
                          )
                        }}
                        className={cn(
                          'text-left p-2.5 rounded-none border-2 transition-all flex items-center gap-2.5 cursor-pointer relative select-none',
                          isChecked
                            ? 'bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] font-bold shadow-sm'
                            : 'bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]'
                        )}
                      >
                        <div className={cn(
                          'size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white',
                          isChecked ? 'border-[#2b1f14] text-[#0e2b5c]' : 'border-[#4a3520]'
                        )}>
                          {isChecked && <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none">✓</span>}
                        </div>
                        <span className="text-xs leading-snug flex-1">{ev.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSubTileView('overview')}
                    className="px-5 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-2 border-[#2b1f14]"
                  >
                    <Check className="size-3.5 text-[#d9a066]" /> XÁC NHẬN BÁC BỎ NGOẠI PHẠM
                  </button>
                </div>
              </div>
            )}

            {/* ACTION TOOLBAR: SAVE & SUBMIT (ONLY VISIBLE ON OVERVIEW) */}
            {subTileView === 'overview' && (
              <div className="pt-3 border-t-2 border-[#2b1f14]/20 flex flex-wrap items-center justify-between gap-2">
                {editingSuspect && onDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      detectiveAudio.playGlassSound()
                      onDelete(editingSuspect.id)
                      onClose()
                    }}
                    className="text-xs uppercase tracking-wider px-4 py-2.5 rounded-none font-bold transition-all cursor-pointer flex items-center gap-1.5 border-2 border-[#a81c1c] bg-[#fce8e6] hover:bg-[#f8d7d4] text-[#a81c1c] active:scale-95"
                  >
                    <Trash2 className="size-3.5" />
                    <span>XÓA KHỎI SƠ ĐỒ</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="text-xs uppercase tracking-wider px-4 py-2.5 rounded-none font-bold transition-all cursor-pointer flex items-center gap-1.5 border-2 border-[#2b1f14] bg-[#f4ebd9] hover:bg-[#ede3cf] text-[#2b1f14]"
                  >
                    <Save className="size-3.5 text-[#4a3520]" />
                    <span>LƯU HỒ SƠ</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitConclusion}
                    className="text-xs uppercase tracking-wider px-5 py-2.5 rounded-none font-bold transition-all cursor-pointer flex items-center gap-1.5 border-2 shadow-md bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-[#2b1f14] active:scale-95"
                  >
                    <span>NỘP KẾT LUẬN</span>
                    <ArrowRight className="size-3.5 text-[#d9a066]" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
