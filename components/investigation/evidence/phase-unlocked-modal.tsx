'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, FileText, ImageIcon, Search } from 'lucide-react'
import { PDFDocument, PhysicalEvidence } from './evidence-types'
import { CASE_000_NARRATOR } from '@/content/cases/case-000/narrator'
import { TypewriterNarrator } from './typewriter-narrator'

export interface UnlockedModalData {
  unlockedPhase: number
  newPdfs: PDFDocument[]
  newEvidence: PhysicalEvidence[]
}

interface PhaseUnlockedModalProps {
  unlockedModalData: UnlockedModalData | null
  onClose: () => void
  onSelectPdf: (pdf: PDFDocument) => void
  onSelectEvidence: (item: PhysicalEvidence) => void
  onSetPhaseFilter: (phase: number) => void
}

export function PhaseUnlockedModal({
  unlockedModalData,
  onClose,
  onSelectPdf,
  onSelectEvidence,
  onSetPhaseFilter,
}: PhaseUnlockedModalProps) {
  return (
    <AnimatePresence>
      {unlockedModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#1e1610] border-2 border-[#5c4028] text-[#e5d8cb] p-6 rounded-none shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden font-mono flex flex-col gap-5"
          >
            {/* Header Title */}
            <div className="border-b border-[#422e1d] pb-3 space-y-1">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#f4e8d8] tracking-tight">
                {unlockedModalData.unlockedPhase === 0
                  ? 'BẮT ĐẦU CHUYÊN ÁN: GIAI ĐOẠN 0'
                  : `ĐÃ MỞ KHÓA TÀI LIỆU GIAI ĐOẠN ${unlockedModalData.unlockedPhase}`}
              </h3>
              <p className="text-xs text-[#ad9885] font-sans">
                Ban chuyên án đã cấp phép truy cập các văn bản hồ sơ và vật chứng tang vật thu thập được.
              </p>
            </div>

            {/* Horror Narrator Monologue Box */}
            {CASE_000_NARRATOR[unlockedModalData.unlockedPhase] && (
              <TypewriterNarrator
                text={CASE_000_NARRATOR[unlockedModalData.unlockedPhase].monologue}
              />
            )}

            {/* Unlocked Items List Container */}
            <div className="space-y-2 bg-[#140e0a] p-3.5 border border-[#38271a] max-h-[200px] overflow-y-auto custom-scrollbar">
              <span className="font-mono text-[0.65rem] text-[#d9a066] uppercase font-bold block mb-1">
                Danh mục tài liệu & tang vật mới nhận:
              </span>

              {unlockedModalData.newPdfs.map((pdf) => (
                <div key={pdf.id} className="flex items-center gap-2.5 p-2 bg-[#221810] border border-[#3e2c1e]">
                  <FileText className="size-4 text-[#d9a066] shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-sans font-semibold text-xs text-[#f2e6d8] truncate">{pdf.title}</span>
                    <span className="font-mono text-[0.6rem] text-[#ad9885]">📄 VĂN BẢN HỒ SƠ // {pdf.code}</span>
                  </div>
                </div>
              ))}

              {unlockedModalData.newEvidence.map((ev) => (
                <div key={ev.id} className="flex items-center gap-2.5 p-2 bg-[#221810] border border-[#3e2c1e]">
                  <ImageIcon className="size-4 text-[#d9a066] shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-sans font-semibold text-xs text-[#f2e6d8] truncate">{ev.title}</span>
                    <span className="font-mono text-[0.6rem] text-[#ad9885]">📸 TANG CHỨNG // {ev.evidenceId}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-end pt-2 border-t border-[#3e2c1e]">
              <button
                onClick={() => {
                  if (unlockedModalData.newPdfs.length > 0) {
                    onSelectPdf(unlockedModalData.newPdfs[0])
                  } else if (unlockedModalData.newEvidence.length > 0) {
                    onSelectEvidence(unlockedModalData.newEvidence[0])
                  }
                  onSetPhaseFilter(unlockedModalData.unlockedPhase)
                  onClose()
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-xs font-bold rounded-none transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Search className="size-4" />
                <span>TIẾP TỤC ĐIỀU TRA</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
