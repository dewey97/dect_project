'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  FolderOpen, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  ImageIcon,
  Paperclip,
  Clock,
  FileCheck2,
  Lock
} from 'lucide-react'
import { PDFViewerModal } from '@/components/investigation/pdf-viewer-modal'
import { useCheckpoints } from '@/components/investigation/checkpoints-context'
import { CASES, EVIDENCE } from '@/lib/mock-data'
import { checkpoints000 } from '@/content/cases/case-000/checkpoints'
import type { Evidence, Checkpoint } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PDFDocument {
  id: string
  title: string
  code: string
  url: string
}

const CASE_000_PDFS: PDFDocument[] = [
  {
    id: 'pdf-01',
    title: 'Báo cáo khám nghiệm tử thi sơ bộ',
    code: 'PDF-001',
    url: '/pdf/case_000/phase_0_initial/01_bao_cao_kham_nghiem_tu_thi.pdf'
  },
  {
    id: 'pdf-02',
    title: 'Biên bản khám nghiệm hiện trường vụ án',
    code: 'PDF-002',
    url: '/pdf/case_000/phase_0_initial/02_bien_ban_kham_nghiem_hien_truong.pdf'
  },
  {
    id: 'pdf-03',
    title: 'Báo cáo tiến độ điều tra ban đầu',
    code: 'PDF-003',
    url: '/pdf/case_000/phase_0_initial/03_bao_cao_tien_do_dieu_tra.pdf'
  },
  {
    id: 'pdf-04',
    title: 'Biên bản lấy lời khai: Trần Ngọc Mai',
    code: 'PDF-004',
    url: '/pdf/case_000/phase_0_initial/07a_bien_ban_loi_khai_tran_ngoc_mai.pdf'
  },
  {
    id: 'pdf-05',
    title: 'Biên bản lấy lời khai: Lê Quang Vũ',
    code: 'PDF-005',
    url: '/pdf/case_000/phase_0_initial/07b_bien_ban_loi_khai_le_quang_vu.pdf'
  },
  {
    id: 'pdf-06',
    title: 'Biên bản lấy lời khai: Tùng',
    code: 'PDF-006',
    url: '/pdf/case_000/phase_0_initial/07c_bien_ban_loi_khai_tung.pdf'
  },
  {
    id: 'pdf-07',
    title: 'Biên bản lấy lời khai: Trần Thị Hà',
    code: 'PDF-007',
    url: '/pdf/case_000/phase_0_initial/07d_bien_ban_loi_khai_tran_thi_ha.pdf'
  }
]

// Types for right column view
type SelectedView = 
  | { type: 'pdf'; data: PDFDocument }
  | { type: 'evidence'; data: Evidence }

// Hardcoded hint maps for case-000 checkpoints
const HINTS_MAP: Record<string, string[]> = {
  'cp-000-1': [
    'Đối soát kỹ mốc thời gian trong Biên bản khám nghiệm tử thi và Lời khai của Trần Ngọc Mai.',
    'Chú ý chi tiết bản di chúc gốc giấu sau tủ âm tường cũ.'
  ],
  'cp-000-2': [
    'Kiểm tra lại báo cáo vết bầm tím sau gáy nạn nhân.',
    'So sánh mốc thời gian Tùng hoảng sợ bỏ đi lúc 20:15 với mảnh vỡ bình trà.'
  ],
  'cp-000-3': [
    'Đối chiếu chi tiết lỡ lời trong lời khai ban đầu của Trần Thị Hà với hiện trường.',
    'Hà khai ở nhà cả tối nhưng lại mô tả chính xác Khang gục ngã cạnh bộ bình trà vỡ.'
  ]
}

export default function EvidencePage() {
  const activeCase = CASES.find((c) => c.id === 'case-000')
  const { completedCheckpointIds, completeCheckpoint } = useCheckpoints()
  
  // Checkpoint questions state
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(checkpoints000)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [checkpointErrors, setCheckpointErrors] = useState<Record<string, boolean>>({})
  const [checkpointSuccesses, setCheckpointSuccesses] = useState<Record<string, boolean>>({})
  
  // Hint system state
  const [unlockedHintLevel, setUnlockedHintLevel] = useState<Record<string, number>>({})

  // Right column selection state (Default: First PDF)
  const [selectedView, setSelectedView] = useState<SelectedView>({
    type: 'pdf',
    data: CASE_000_PDFS[0]
  })

  // Mobile PDF modal state
  const [isMobilePdfOpen, setIsMobilePdfOpen] = useState(false)

  // Unified index filter tab: 'all' | 'pdf' | 'evidence'
  const [filterTab, setFilterTab] = useState<'all' | 'pdf' | 'evidence'>('all')

  useEffect(() => {
    if (checkpoints000 && checkpoints000.length > 0) {
      setCheckpoints(checkpoints000)
    }
  }, [completedCheckpointIds])

  const handleSelectPdf = (doc: PDFDocument) => {
    setSelectedView({ type: 'pdf', data: doc })
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobilePdfOpen(true)
    }
  }

  const handleSelectEvidence = (item: Evidence) => {
    setSelectedView({ type: 'evidence', data: item })
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobilePdfOpen(false)
    }
  }

  const unlockNextHint = (cpId: string, maxHints: number) => {
    if (maxHints <= 0) return
    setUnlockedHintLevel((prev) => {
      const current = prev[cpId] || 0
      const next = current >= maxHints ? 1 : current + 1
      return {
        ...prev,
        [cpId]: next
      }
    })
  }

  const handleAnswerSelect = (cpId: string, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [cpId]: option }))
    setCheckpointErrors((prev) => ({ ...prev, [cpId]: false }))
  }

  const handleSubmitAnswer = (cp: Checkpoint) => {
    const userAnswer = selectedAnswers[cp.id]
    if (!userAnswer) return

    if (userAnswer === cp.correctAnswer) {
      setCheckpointSuccesses((prev) => ({ ...prev, [cp.id]: true }))
      setTimeout(() => {
        completeCheckpoint(cp.id)
      }, 1000)
    } else {
      setCheckpointErrors((prev) => ({ ...prev, [cp.id]: true }))
    }
  }

  return (
    <div className="h-screen w-full bg-[#0d0a08] text-[#e5d8cb] font-sans selection:bg-[#d9a066]/30 selection:text-[#f4e8d8] overflow-hidden flex items-center justify-center p-2 sm:p-4">
      
      <div className="w-full max-w-[1700px] h-full flex flex-col lg:flex-row gap-5 items-stretch justify-center">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: UNIFIED VINTAGE DOSSIER INDEX & SINGLE ACTIVE QUESTION */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[48%] xl:w-[46%] shrink-0 bg-[#16120e] border-2 border-[#3d2c1e] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-y-auto h-full flex flex-col custom-scrollbar">
            
          {/* VINTAGE KRAFT DOSSIER COVER STICKY HEADER (NO GLOW) */}
          <header className="sticky top-0 z-20 border-b border-[#3d2c1e] p-5 sm:p-6 bg-[#241a12] shadow-md">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-[#d4a373] font-bold block mb-1">
                  HỒ SƠ ĐIỀU TRA CHUYÊN ÁN MẬT // CASE #000
                </span>
                
                {/* Handwritten Sharpie Title on Vintage Paper Tape Label */}
                <div className="inline-block mt-0.5">
                  <span className="font-[family-name:var(--font-handwriting)] text-2xl sm:text-3xl font-bold text-[#1a0f07] tracking-wide leading-none bg-[#f4e8d8] px-3.5 py-1 rounded border border-[#2b1b0e]/20 inline-block rotate-[-1deg]">
                    {activeCase?.title || 'Trốn Tìm'}
                  </span>
                </div>
              </div>

              {/* Authentic Archival Red Stamp */}
              <div className="inline-flex sm:self-start border-2 border-red-800 text-red-700 bg-red-950/20 font-mono text-[0.65rem] uppercase tracking-widest px-2.5 py-1 rotate-[-3deg] rounded font-black shadow-sm shrink-0 select-none">
                🔴 BẢO MẬT HỒ SƠ
              </div>
            </div>

            <p className="mt-3 text-xs text-[#ad9885] leading-relaxed font-sans border-t border-[#3b2b1e] pt-2.5">
              {activeCase?.summary || 'Hồ sơ lưu trữ các biên bản khám nghiệm, tài liệu lời khai và chứng cứ liên quan đến vụ tử vong nghi vấn của Nguyễn Văn Khang.'}
            </p>

          </header>

          <div className="p-4 sm:p-6 space-y-6">
            
            {/* UNIFIED DOSSIER INDEX WITH VINTAGE FILTER CHIPS */}
            <section className="space-y-3">
              
              {/* Header & Filter Chips */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#3d2c1e] pb-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="size-4 text-[#d9a066]" />
                  <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#e6d3c1]">
                    DANH MỤC HỒ SƠ & TANG CHỨNG
                  </h2>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 font-mono text-[0.65rem]">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={cn(
                      'px-2.5 py-1 rounded font-bold transition-all cursor-pointer border',
                      filterTab === 'all'
                        ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                        : 'bg-[#241a12] text-[#ad9885] hover:text-[#e6d3c1] border-[#4a3625]'
                    )}
                  >
                    TẤT CẢ ({CASE_000_PDFS.length + EVIDENCE.length})
                  </button>

                  <button
                    onClick={() => setFilterTab('pdf')}
                    className={cn(
                      'px-2.5 py-1 rounded font-bold transition-all cursor-pointer border',
                      filterTab === 'pdf'
                        ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                        : 'bg-[#241a12] text-[#ad9885] hover:text-[#e6d3c1] border-[#4a3625]'
                    )}
                  >
                    📄 FILE PDF ({CASE_000_PDFS.length})
                  </button>

                  <button
                    onClick={() => setFilterTab('evidence')}
                    className={cn(
                      'px-2.5 py-1 rounded font-bold transition-all cursor-pointer border',
                      filterTab === 'evidence'
                        ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                        : 'bg-[#241a12] text-[#ad9885] hover:text-[#e6d3c1] border-[#4a3625]'
                    )}
                  >
                    📸 TANG VẬT ({EVIDENCE.length})
                  </button>
                </div>
              </div>

              {/* Combined Items List (Vintage Flat Paper Cards) */}
              <div className="grid grid-cols-1 gap-2">
                
                {/* Render PDFs */}
                {(filterTab === 'all' || filterTab === 'pdf') &&
                  CASE_000_PDFS.map((doc) => {
                    const isSelected = selectedView.type === 'pdf' && selectedView.data.id === doc.id
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleSelectPdf(doc)}
                        className={cn(
                          'group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer shadow-sm',
                          isSelected
                            ? 'bg-[#38271a] border-[#6b4b32] text-amber-200'
                            : 'bg-[#241b13] hover:bg-[#2d2218] border-[#3e2e20] text-[#e5d8cb]'
                        )}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={cn(
                            'size-8 rounded flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                            isSelected ? 'bg-[#d9a066] text-[#1a0f07]' : 'bg-[#18120c] text-[#d9a066] border border-[#3e2e20]'
                          )}>
                            <FileText className="size-4" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className={cn(
                              'font-sans font-semibold text-xs truncate transition-colors',
                              isSelected ? 'text-[#f4e8d8] font-bold' : 'text-[#e5d8cb] group-hover:text-[#d9a066]'
                            )}>
                              {doc.title}
                            </span>
                            <span className="font-mono text-[0.6rem] text-[#ad9885]">
                              📄 HỒ SƠ BIÊN BẢN // {doc.code}
                            </span>
                          </div>
                        </div>

                        <button className={cn(
                          'flex items-center gap-1 px-2.5 py-1 text-[0.65rem] font-bold font-mono rounded transition-all shrink-0 border',
                          isSelected
                            ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                            : 'text-[#d9a066] bg-[#18120c] border-[#3e2e20] group-hover:bg-[#d9a066] group-hover:text-[#1a0f07]'
                        )}>
                          <Search className="size-3" />
                          <span>{isSelected ? 'ĐANG XEM' : 'CHI TIẾT'}</span>
                        </button>
                      </div>
                    )
                  })}

                {/* Render Evidence Items */}
                {(filterTab === 'all' || filterTab === 'evidence') &&
                  EVIDENCE.map((item) => {
                    const isSelected = selectedView.type === 'evidence' && selectedView.data.id === item.id
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectEvidence(item)}
                        className={cn(
                          'group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer shadow-sm',
                          isSelected
                            ? 'bg-[#38271a] border-[#6b4b32] text-amber-200'
                            : 'bg-[#241b13] hover:bg-[#2d2218] border-[#3e2e20] text-[#e5d8cb]'
                        )}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={cn(
                            'size-8 rounded flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                            isSelected ? 'bg-[#d9a066] text-[#1a0f07]' : 'bg-[#18120c] text-[#d9a066] border border-[#3e2e20]'
                          )}>
                            <ImageIcon className="size-4" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className={cn(
                              'font-sans font-semibold text-xs truncate transition-colors',
                              isSelected ? 'text-[#f4e8d8] font-bold' : 'text-[#e5d8cb] group-hover:text-[#d9a066]'
                            )}>
                              {item.title}
                            </span>
                            <span className="font-mono text-[0.6rem] text-[#ad9885]">
                              📸 TANG CHỨNG VẬT LÝ // {item.evidenceId}
                            </span>
                          </div>
                        </div>

                        <button className={cn(
                          'flex items-center gap-1 px-2.5 py-1 text-[0.65rem] font-bold font-mono rounded transition-all shrink-0 border',
                          isSelected
                            ? 'bg-[#d9a066] text-[#1a0f07] border-[#d9a066]'
                            : 'text-[#d9a066] bg-[#18120c] border-[#3e2e20] group-hover:bg-[#d9a066] group-hover:text-[#1a0f07]'
                        )}>
                          <Search className="size-3" />
                          <span>{isSelected ? 'ĐANG XEM' : 'CHI TIẾT'}</span>
                        </button>
                      </div>
                    )
                  })}

              </div>
            </section>

            {/* STRICT SINGLE ACTIVE QUESTION FORM CONTAINER */}
            <section className="space-y-4 pt-4 border-t border-[#3d2c1e]">
              {(() => {
                const activeCpIndex = checkpoints.findIndex((cp) => !completedCheckpointIds.includes(cp.id))
                const isAllCompleted = checkpoints.length > 0 && activeCpIndex === -1
                const currentCp = activeCpIndex !== -1 ? checkpoints[activeCpIndex] : null
                const currentIdx = activeCpIndex !== -1 ? activeCpIndex : checkpoints.length - 1

                const resetProgress = () => {
                  try {
                    localStorage.removeItem('veritas_completed_checkpoints')
                    window.location.reload()
                  } catch {}
                }

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-[#3d2c1e] pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-[#d9a066]" />
                        <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#e6d3c1]">
                          🛡️ KẾT LUẬN & PHÁ ÁN {!isAllCompleted && `(${currentIdx + 1}/${checkpoints.length})`}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={resetProgress}
                        className="text-[0.65rem] font-mono font-bold text-[#ad9885] hover:text-[#d9a066] transition-colors cursor-pointer"
                      >
                        [ 🔄 LÀM LẠI TỪ ĐẦU ]
                      </button>
                    </div>

                    {isAllCompleted ? (
                      /* VICTORY CARD WHEN ALL QUESTIONS SOLVED */
                      <div className="p-6 bg-[#1b261b] border border-emerald-800/60 rounded-xl text-center space-y-3 shadow-md">
                        <div className="size-12 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 mx-auto flex items-center justify-center">
                          <CheckCircle2 className="size-6" />
                        </div>
                        <h3 className="font-serif text-lg font-bold text-emerald-300 uppercase tracking-tight">
                          ĐÃ HOÀN THÀNH TẤT CẢ KẾT LUẬN CHUYÊN ÁN
                        </h3>
                        <p className="text-xs text-[#d4c3b3] max-w-md mx-auto leading-relaxed">
                          Chúc mừng điều tra viên! Bạn đã bóc tách toàn bộ mâu thuẫn, đối soát tang chứng và đưa ra đáp án chính xác phá giải vụ án Trốn Tìm.
                        </p>
                        <button
                          onClick={resetProgress}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-xs font-bold rounded transition-all cursor-pointer shadow-md"
                        >
                          🔄 THỰC HIỆN LẠI CHUYÊN ÁN
                        </button>
                      </div>
                    ) : currentCp ? (
                      /* STRICT SINGLE ACTIVE QUESTION CARD (VINTAGE FORM STYLE) */
                      (() => {
                        const cp = currentCp
                        const idx = currentIdx
                        const selectedOpt = selectedAnswers[cp.id]
                        const hasError = checkpointErrors[cp.id]
                        const hasSuccess = checkpointSuccesses[cp.id]

                        const hints = HINTS_MAP[cp.id] || (cp.hint ? [cp.hint] : [])
                        const hintLevel = unlockedHintLevel[cp.id] || 0

                        return (
                          <div
                            key={cp.id}
                            className="p-4 sm:p-5 bg-[#201812] border border-[#443324] rounded-xl flex flex-col gap-3.5 shadow-md"
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[0.65rem] text-[#d9a066] font-bold uppercase tracking-wider">
                                CÂU HỎI HIỆN TẠI ({idx + 1}/{checkpoints.length})
                              </span>
                              <span className="font-mono text-[0.6rem] text-[#d9a066] bg-[#140e0a] px-2 py-0.5 rounded border border-[#38271a] font-bold uppercase">
                                ĐANG PHÁ ÁN
                              </span>
                            </div>

                            {/* Question text */}
                            <p className="text-xs sm:text-sm font-bold text-[#f2e6d8] leading-relaxed">
                              {cp.question}
                            </p>

                            {/* Options & Submit */}
                            <div className="space-y-2 pt-2 border-t border-[#36271c]">
                              <span className="font-mono text-[0.625rem] text-[#ad9885] uppercase font-bold block mb-1.5">
                                Lựa chọn phương án kết luận:
                              </span>

                              <div className="flex flex-col gap-2">
                                {cp.options.map((opt) => {
                                  const isSelected = selectedOpt === opt
                                  return (
                                    <button
                                      key={opt}
                                      disabled={hasSuccess}
                                      onClick={() => handleAnswerSelect(cp.id, opt)}
                                      className={cn(
                                        'w-full text-left p-2.5 rounded border text-xs font-sans transition-all flex justify-between items-center cursor-pointer',
                                        isSelected
                                          ? 'border-[#6b4b32] bg-[#342417] text-amber-200 font-semibold shadow-sm'
                                          : 'border-[#3a2b1e] bg-[#18120c] hover:border-[#523d2b] text-[#d4c3b3]'
                                      )}
                                    >
                                      <span>{opt}</span>
                                      {isSelected && <ArrowRight className="size-3 text-[#d9a066]" />}
                                    </button>
                                  )
                                })}
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-[#36271c]">
                                {/* Left Fixed Hint Button (Pure text font-mono, no icon, loops back to 1 when max reached) */}
                                {hints.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => unlockNextHint(cp.id, hints.length)}
                                    className="font-mono text-xs uppercase tracking-wider text-[#d9a066] bg-[#18120c] hover:bg-[#d9a066] hover:text-[#1a0f07] border border-[#3e2e20] px-3 py-2 rounded font-bold transition-all cursor-pointer shrink-0"
                                  >
                                    {hintLevel === 0 
                                      ? `GỢI Ý (1/${hints.length})` 
                                      : `GỢI Ý KẾ TIẾP (${hintLevel >= hints.length ? 1 : hintLevel + 1}/${hints.length})`}
                                  </button>
                                ) : (
                                  <span />
                                )}

                                {/* Right Fixed Submit Button */}
                                <button
                                  disabled={!selectedOpt || hasSuccess}
                                  onClick={() => handleSubmitAnswer(cp)}
                                  className={cn(
                                    'font-mono text-xs uppercase tracking-wider px-4 py-2 rounded font-bold transition-all cursor-pointer shrink-0 ml-auto border',
                                    selectedOpt
                                      ? 'bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] border-[#d9a066] shadow-md active:scale-95'
                                      : 'bg-[#18120c] text-[#6b5847] border-[#2e2318] opacity-50 pointer-events-none'
                                  )}
                                >
                                  XÁC NHẬN KẾT LUẬN
                                </button>
                              </div>

                              {/* Error / Success Feedback */}
                              {hasError && (
                                <p className="text-[0.65rem] font-mono text-red-400 flex items-center gap-1 mt-1">
                                  <AlertCircle className="size-3.5" /> ĐÁP ÁN KHÔNG CHÍNH XÁC.
                                </p>
                              )}
                              {hasSuccess && (
                                <p className="text-[0.65rem] font-mono text-emerald-400 flex items-center gap-1 mt-1">
                                  <CheckCircle2 className="size-3.5" /> CHÍNH XÁC! CHUYỂN CÂU TIẾP...
                                </p>
                              )}
                            </div>

                            {/* Opened Hint Display Container */}
                            {hints.length > 0 && hintLevel > 0 && (
                              <div className="p-3 rounded-lg border bg-[#2d2015] border-[#5e432c] text-amber-200 transition-all text-xs space-y-1 shadow-inner">
                                <span className="font-mono text-[0.65rem] uppercase font-bold text-[#d9a066] block">
                                  GỢI Ý TƯ DUY ({hintLevel}/{hints.length})
                                </span>
                                <p className="leading-relaxed font-sans">{hints[hintLevel - 1]}</p>
                              </div>
                            )}

                          </div>
                        )
                      })()
                    ) : null}
                  </>
                )
              })()}
            </section>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: VINTAGE EVIDENCE INSPECTION DESK (PDF or EVIDENCE DETAIL) */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex flex-1 h-full bg-[#16120e] border-2 border-[#3d2c1e] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex-col">
          
          {selectedView.type === 'pdf' ? (
            /* PDF READER VIEW */
            <div className="flex flex-col w-full h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#3d2c1e] bg-[#241a12]">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="size-4 text-[#d9a066] shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <h3 className="font-sans font-bold text-xs sm:text-sm text-[#f2e6d8] truncate">
                      {selectedView.data.title}
                    </h3>
                    <span className="font-mono text-[0.6rem] text-[#ad9885]">
                      MÃ TỆP: {selectedView.data.code}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full h-full bg-[#0d0a08] relative">
                <iframe
                  src={`${selectedView.data.url}#toolbar=0&navpanes=0`}
                  className="w-full h-full border-0"
                  title={selectedView.data.title}
                />
              </div>
            </div>
          ) : (
            /* PHYSICAL EVIDENCE DETAIL VIEW (VINTAGE TYPEWRITER DOSSIER THEME) */
            <div className="flex flex-col w-full h-full overflow-y-auto custom-scrollbar p-6 bg-[#16120e]">
              
              {/* Evidence Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#3d2b1c] pb-4 mb-6 gap-3">
                <div>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-[#d9a066] font-bold block mb-1">
                    CHI TIẾT TANG CHỨNG VẬT LÝ // {selectedView.data.evidenceId || 'EV-ITEM'}
                  </span>
                  <h2 className="font-[family-name:var(--font-handwriting)] text-2xl sm:text-3xl font-bold text-amber-200 tracking-wide mt-0.5">
                    {selectedView.data.title}
                  </h2>
                </div>

                <div className="border border-red-800/80 text-red-400 bg-red-950/20 font-mono text-[0.6rem] uppercase px-3 py-1.5 rounded font-black flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-sm select-none">
                  <Shield className="size-3.5 text-red-500" /> 🔴 NIÊM PHONG BẢO QUẢN
                </div>
              </div>

              {/* Evidence Photo Container */}
              <div className="w-full h-72 sm:h-80 bg-[#120f0c] border border-[#3d2b1c] rounded-xl overflow-hidden relative mb-6 flex items-center justify-center p-3 shadow-inner group">
                <img
                  src={selectedView.data.thumbnail}
                  alt={selectedView.data.title}
                  className="max-h-full max-w-full object-contain rounded transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Custody Info Table (Vintage Form Style) */}
              <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-[#221a13] border border-[#443324] rounded-xl font-mono text-xs shadow-inner">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.6rem] text-[#ad9885] uppercase tracking-wider font-bold">Loại vật chứng:</span>
                  <span className="text-[#d9a066] font-bold uppercase">{selectedView.data.kind}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.6rem] text-[#ad9885] uppercase tracking-wider font-bold">Thời gian thu giữ:</span>
                  <span className="text-[#e5d8cb] font-bold">{selectedView.data.timestamp || '24-07-2026'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.6rem] text-[#ad9885] uppercase tracking-wider font-bold">Cán bộ niêm phong:</span>
                  <span className="text-[#e5d8cb] font-bold">{selectedView.data.recoveredBy || 'ĐIỀU TRA VIÊN'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.6rem] text-[#ad9885] uppercase tracking-wider font-bold">Trạng thái bảo quản:</span>
                  <span className="text-emerald-400 font-bold">{selectedView.data.chainOfCustody || 'VERIFIED'}</span>
                </div>
              </div>

              {/* Detailed Forensic Typewriter Analysis Notes */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-[#d9a066]" />
                  <span className="font-mono text-xs font-bold text-[#d9a066] uppercase tracking-wider">
                    BIÊN BẢN PHÂN TÍCH PHÁP Y & VẾT TÍCH:
                  </span>
                </div>
                <div className="p-4 sm:p-5 bg-[#221a13] border border-[#443324] rounded-xl font-mono text-xs leading-relaxed text-amber-100/90 shadow-inner relative overflow-hidden space-y-3">
                  {/* Notebook Ruled Background Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_19px,#3b599815_20px)] bg-[size:100%_20px] pointer-events-none" />

                  <p className="relative z-10 font-bold italic text-amber-200/90">
                    "{selectedView.data.preview || selectedView.data.description}"
                  </p>
                  <p className="relative z-10 text-[0.68rem] text-[#ad9885] not-italic border-t border-[#3d2b1c] pt-2.5 font-mono">
                    * Mẫu vật chứng này đã được chụp ảnh lưu hồ sơ và đưa vào túi bảo quản chuyên dụng của Ban chuyên án.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MOBILE FULL SCREEN PDF MODAL (Triggered only on small screens) */}
      <PDFViewerModal
        isOpen={isMobilePdfOpen}
        pdfUrl={selectedView.type === 'pdf' ? selectedView.data.url : null}
        title={selectedView.type === 'pdf' ? selectedView.data.title : null}
        onClose={() => setIsMobilePdfOpen(false)}
      />

    </div>
  )
}
