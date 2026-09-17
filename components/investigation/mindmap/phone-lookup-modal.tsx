'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

interface PhoneLookupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (phone: string, info: string) => void
  onOpenPhoneSimulator?: () => void
}

export function PhoneLookupModal({
  isOpen,
  onClose,
  onSuccess,
  onOpenPhoneSimulator
}: PhoneLookupModalProps) {
  const [phone1, setPhone1] = useState('')
  const [phone2, setPhone2] = useState('')
  const [phone3, setPhone3] = useState('')
  const [isApproved, setIsApproved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('veritas_phone_inputs')
      if (saved) {
        const data = JSON.parse(saved)
        setPhone1(data.phone1 || '')
        setPhone2(data.phone2 || '')
        setPhone3(data.phone3 || '')
      }
      const approved = localStorage.getItem('veritas_reinvestigate_unlocked')
      if (approved === 'true') {
        setIsApproved(true)
      }
    } catch {}
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone1.trim() && !phone2.trim() && !phone3.trim()) {
      setErrorMsg('Vui lòng điền danh tính chủ thể cho ít nhất 1 số điện thoại!')
      detectiveAudio.playGlassSound()
      return
    }

    detectiveAudio.playStampSound()
    setIsApproved(true)
    try {
      localStorage.setItem('veritas_phone_inputs', JSON.stringify({ phone1, phone2, phone3 }))
      localStorage.setItem('veritas_reinvestigate_unlocked', 'true')
    } catch {}

    onSuccess('0988200991', 'Đã xác minh danh tính SĐT thành công.')
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-none overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* HEADER BAR */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#6b4e2e] block">
                MỞ RỘNG ĐIỀU TRA
              </span>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1a120b] uppercase tracking-wide">
                Truy Vết Liên Lạc
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* FORM BODY (Y HỆT BẢN CŨ CỦA CHECKPOINT 0) */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5]">
            {/* QUESTION TEXT */}
            <div className="space-y-1.5">
              <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed">
                Hãy đọc các tài liệu Hồ sơ và tra cứu Điện thoại nạn nhân Khang để xác định danh tính 3 đối tượng liên quan đến 3 SĐT lạ gọi tới trong đêm 24/07:
              </p>
            </div>

            {/* ONBOARDING INITIAL EVIDENCE CALLOUT */}
            <div className="p-3.5 bg-[#ebdcc4] border-2 border-[#a88c6f] rounded-none text-xs text-[#3b2b1a] space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2 font-bold font-mono text-[#5c4026] uppercase tracking-wider">
                <Smartphone className="size-4 text-[#8c592b]" />
                <span>HƯỚNG DẪN BẮT ĐẦU ĐIỀU TRA:</span>
              </div>
              <p className="text-xs leading-relaxed">
                Trước tiên, bạn hãy đối chiếu dữ liệu giữa <strong>Hồ sơ tài liệu</strong> và <strong>Điện thoại nạn nhân Khang</strong> để tìm ra danh tính 3 SĐT ẩn danh.
              </p>
              {onOpenPhoneSimulator && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenPhoneSimulator()
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#2c1d12] hover:bg-[#3d291a] text-[#f4e8d8] font-mono text-xs font-bold transition-all cursor-pointer rounded-none shadow border border-[#523924]"
                >
                  <Smartphone className="size-3.5 text-amber-400" />
                  <span>📱 MỞ ĐIỆN THOẠI NẠN NHÂN KHANG</span>
                </button>
              )}
            </div>

            <span className="font-mono text-xs text-[#4a3520] uppercase font-bold tracking-wider block">
              ĐIỀN DANH TÍNH CHỦ THỂ THỤ LÝ SĐT VÀO Ô:
            </span>

            {/* 3 PHONE INPUT FIELDS */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2b1f14] block font-mono">
                  SĐT 0988.20.09.91:
                </label>
                <input
                  type="text"
                  value={phone1}
                  onChange={(e) => {
                    setPhone1(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-3.5 py-2 text-base text-[#0e2b5c] font-[family-name:var(--font-handwriting)] font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2b1f14] block font-mono">
                  SĐT 0984.180.357:
                </label>
                <input
                  type="text"
                  value={phone2}
                  onChange={(e) => {
                    setPhone2(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-3.5 py-2 text-base text-[#0e2b5c] font-[family-name:var(--font-handwriting)] font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2b1f14] block font-mono">
                  SĐT 0912.331.888:
                </label>
                <input
                  type="text"
                  value={phone3}
                  onChange={(e) => {
                    setPhone3(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-3.5 py-2 text-base text-[#0e2b5c] font-[family-name:var(--font-handwriting)] font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-700 font-mono font-bold mt-1">
                ⚠️ {errorMsg}
              </p>
            )}

            {/* ACTION FOOTER */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                className={cn(
                  'text-xs uppercase tracking-wider px-6 py-2.5 rounded-none font-bold transition-all cursor-pointer flex items-center gap-2 border-2 shadow-md font-mono',
                  !isApproved
                    ? 'bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-[#2b1f14] active:scale-95'
                    : 'bg-emerald-900 hover:bg-emerald-950 text-white border-emerald-950'
                )}
              >
                <span>LIÊN LẠC LẤY THÔNG TIN</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
