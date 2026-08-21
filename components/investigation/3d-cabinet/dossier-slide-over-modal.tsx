'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Paperclip, ShieldAlert, FolderOpen, Search, KeyRound, FileCheck2 } from 'lucide-react'
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
        <div className="fixed inset-y-0 right-0 sm:right-6 lg:right-10 z-50 w-full sm:w-[440px] p-4 sm:p-6 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full bg-[#d9a066] border-4 border-[#2b1b0e] text-[#2b1b0e] rounded-2xl p-6 sm:p-8 shadow-[0_35px_95px_rgba(0,0,0,0.98)] flex flex-col gap-4 pointer-events-auto overflow-hidden font-mono"
          >
            {/* Classified Watermark Stamp */}
            <div className="absolute top-6 right-12 border-2 border-red-800 text-red-800 bg-red-950/10 font-mono text-[0.65rem] font-black uppercase tracking-widest px-2.5 py-1 rotate-[-6deg] rounded shadow-sm opacity-90 pointer-events-none select-none">
              🔴 HỒ SƠ ĐIỀU TRA // {inspectingFile.date || '1998'}
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-[#2b1b0e] hover:bg-[#2b1b0e]/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Paperclip & Code Badge */}
            <div className="border-b border-[#2b1b0e]/30 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#2b1b0e]/80" />
                <span className="text-xs bg-[#2b1b0e] text-amber-300 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  {inspectingFile.code}
                </span>
              </div>

              {/* Handwritten Marker Title on Vintage Paper Tape */}
              <div className="mt-3 inline-block">
                <span className="text-xl sm:text-2xl font-bold text-[#1a0f07] tracking-wide leading-none bg-[#d8c4a9] px-3.5 py-1.5 rounded shadow-sm border border-[#2b1b0e]/20 inline-block rotate-[-1.8deg]">
                  {inspectingFile.title}
                </span>
              </div>

              <div className="text-[11px] text-[#2b1b0e]/80 mt-2.5 flex items-center gap-3 font-bold">
                <span>Năm lưu trữ: {inspectingFile.date}</span>
                {inspectingFile.estimatedTime && <span>• {inspectingFile.estimatedTime}</span>}
                {inspectingFile.difficulty && <span>• Độ khó: {inspectingFile.difficulty}</span>}
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <h4 className="font-bold text-[11px] uppercase text-[#2b1b0e] tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#2b1b0e]" /> Tóm tắt hồ sơ điều tra:
                </h4>
                <p className="text-[#2b1b0e] mt-1.5 leading-relaxed bg-[#c8b396]/70 p-3 rounded-lg border border-[#2b1b0e]/20 font-sans font-medium">
                  {inspectingFile.summary}
                </p>
              </div>

              {inspectingFile.details && (
                <div className="bg-[#d8c4a9] p-3 rounded-lg border border-[#2b1b0e]/20">
                  <h4 className="font-bold text-[11px] uppercase text-[#2b1b0e] tracking-wider">
                    Ghi chú chuyên môn:
                  </h4>
                  <p className="text-[#2b1b0e] text-[11px] mt-1 leading-relaxed font-sans font-medium">
                    {inspectingFile.details}
                  </p>
                </div>
              )}

              {/* Ô FORM XÁC THỰC MÃ KÍCH HOẠT VỤ ÁN */}
              {inspectingFile.validCodes && inspectingFile.validCodes.length > 0 && (
                <div className="mt-3 p-3.5 bg-[#1a0f07] text-stone-100 rounded-xl border border-[#2b1b0e] shadow-inner">
                  <div className="flex items-center gap-2 mb-2 text-[11px] font-bold text-amber-400">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    <span>NHẬP MÃ XÁC THỰC MỞ KHÓA VỤ ÁN:</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => onChangeInputCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onVerifyCode(inspectingFile)
                        }
                      }}
                      placeholder="Ví dụ: TEST-99, NX-4471..."
                      className="flex-1 px-3 py-2 bg-[#0d0703] border border-stone-700 focus:border-amber-500 rounded text-xs font-mono uppercase tracking-wider text-amber-300 outline-none"
                    />
                    <button
                      onClick={() => onVerifyCode(inspectingFile)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded text-xs font-black transition-colors"
                    >
                      XÁC THỰC
                    </button>
                  </div>

                  {activationError && (
                    <div className="mt-2 text-[11px] text-red-400 font-sans flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                      {activationError}
                    </div>
                  )}

                  {activatedCase === inspectingFile.id && (
                    <div className="mt-3 p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-lg text-xs text-emerald-300 font-sans flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold">
                        <FileCheck2 className="w-4 h-4 text-emerald-400" />
                        MÃ HỢP LỆ! XÁC THỰC THÀNH CÔNG.
                      </span>
                      <button
                        onClick={() => router.push('/evidence')}
                        className="px-3.5 py-1.5 bg-emerald-500 text-stone-950 font-black rounded text-[11px] hover:bg-emerald-400 transition-colors flex items-center gap-1"
                      >
                        VÀO KHO MANH MỐI →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#2b1b0e]/30 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#f4e8d8] text-[#2b1b0e] rounded-lg text-xs font-bold hover:bg-[#e6d8c4] transition-colors border border-[#2b1b0e]/20"
              >
                ĐÓNG HỒ SƠ
              </button>

              {inspectingFile.caseUrl ? (
                <button
                  onClick={() => router.push('/evidence')}
                  className="px-5 py-2 bg-[#2b1b0e] text-amber-300 rounded-lg text-xs font-black hover:bg-[#3d2714] shadow-lg transition-all flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" /> VÀO KHO MANH MỐI (/evidence)
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-[#2b1b0e] text-amber-300 rounded-lg text-xs font-bold hover:bg-[#3d2714] shadow-lg transition-colors"
                >
                  CẤT HỒ SƠ VÀO TỦ 3D
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
