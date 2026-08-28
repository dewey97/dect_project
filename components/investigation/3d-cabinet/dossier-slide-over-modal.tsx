'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CaseFile } from './cabinet-types'

export function DossierSlideOverModal({
  inspectingFile,
  inputCode,
  activationError,
  activatedCase,
  onClose,
  onChangeInputCode,
  onVerifyCode,
}: {
  inspectingFile: CaseFile | null
  inputCode: string
  activationError: string | null
  activatedCase: string | null
  onClose: () => void
  onChangeInputCode: (code: string) => void
  onVerifyCode: (targetFile: CaseFile) => void
}) {
  const router = useRouter()

  return (
    <AnimatePresence>
      {inspectingFile && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 p-4 sm:p-6 flex items-center justify-end sm:pr-8 lg:pr-12 pointer-events-auto bg-transparent"
        >
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:w-[440px] bg-[#d9a066] border-4 border-[#2b1b0e] text-[#2b1b0e] rounded-2xl p-6 sm:p-7 shadow-[0_35px_95px_rgba(0,0,0,0.98)] flex flex-col gap-4 pointer-events-auto overflow-hidden font-mono"
          >
            {/* Classified Watermark Stamp */}
            <div className="absolute top-5 right-6 border-2 border-red-800 text-red-800 bg-red-950/10 font-mono text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-0.5 rotate-[-6deg] rounded shadow-sm opacity-90 pointer-events-none select-none">
              🔴 HỒ SƠ ĐIỀU TRA // {inspectingFile.date || '1998'}
            </div>

            {/* Header: XÁC THỰC KÍCH HOẠT // CASE CODE */}
            <div className="border-b border-[#2b1b0e]/30 pb-3 relative z-10 pr-28 sm:pr-32">
              <span className="font-mono text-[0.65rem] text-[#2b1b0e] font-black uppercase tracking-widest block mb-1">
                XÁC THỰC KÍCH HOẠT // {inspectingFile.code}
              </span>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#1a0f07] tracking-wide leading-tight">
                {inspectingFile.title}
              </h2>

              {/* Metadata Info Line: Năm, Thời gian, Độ khó */}
              <div className="text-[11px] text-[#2b1b0e]/80 mt-2 flex flex-wrap items-center gap-2.5 font-bold">
                <span>Năm lưu trữ: {inspectingFile.date}</span>
                {inspectingFile.estimatedTime && <span>• {inspectingFile.estimatedTime}</span>}
                {inspectingFile.difficulty && <span>• Độ khó: {inspectingFile.difficulty}</span>}
              </div>
            </div>

            {/* Case Summary Quote Box */}
            <div className="p-3.5 bg-[#c8b396]/80 border border-[#2b1b0e]/30 rounded-xl text-xs leading-relaxed italic font-sans font-medium text-[#2b1b0e] shadow-inner relative z-10">
              "{inspectingFile.summary}"
            </div>

            {/* Activation Form y hệt màn Activate */}
            {inspectingFile.isLocked ? (
              <div className="space-y-3 pt-1 relative z-10">
                <div className="p-3.5 bg-[#2b1b0e] border border-red-900/40 rounded-xl text-center space-y-1 shadow-inner">
                  <span className="font-mono text-xs font-black text-red-400 uppercase flex items-center justify-center gap-1.5">
                    <Lock className="w-4 h-4" /> CHUYÊN ÁN ĐANG ĐƯỢC NIÊM PHONG
                  </span>
                  <p className="text-[0.7rem] text-[#ad9885] font-sans">
                    Vụ án này chưa được phát hành. Vui lòng quay lại sau!
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  onVerifyCode(inspectingFile)
                }}
                className="space-y-3 pt-1 relative z-10"
              >
                <div>
                  <label className="font-mono text-xs font-black text-[#2b1b0e] uppercase block mb-1.5">
                    Nhập mã kích hoạt vụ án ({inspectingFile.title}):
                  </label>

                  <input
                    type="text"
                    autoFocus
                    spellCheck={false}
                    placeholder="NX-4471"
                    value={inputCode}
                    onChange={(e) => onChangeInputCode(e.target.value.toUpperCase())}
                    className="w-full h-13 bg-[#2b1b0e] border-2 border-[#1f1309] focus:border-[#0d0703] rounded-xl px-4 text-center font-mono text-xl tracking-[0.3em] uppercase text-[#f2e6d8] placeholder:text-[#a8907b] outline-none transition-all"
                  />
                </div>

                {activationError && (
                  <p className="text-xs font-mono text-red-950 font-black flex items-center gap-1.5 justify-center">
                    <ShieldAlert className="w-4 h-4" /> {activationError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="w-full h-12 bg-[#2b1b0e] hover:bg-[#1a1008] text-[#f2e6d8] font-mono text-sm font-black uppercase tracking-wider transition-all cursor-pointer rounded-xl shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>PHÁ ÁN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
