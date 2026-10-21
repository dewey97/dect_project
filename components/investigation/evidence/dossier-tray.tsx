import React from 'react'
import { FileText, ImageIcon, Target } from 'lucide-react'
import { cn, normalizeImageUrl } from '@/lib/utils'
import { useEvidenceTheme } from './evidence-theme-context'
import type {
  CombinedItem,
  PDFDocument,
  PhysicalEvidence,
  SelectedView,
} from '@/components/investigation/evidence/evidence-types'

interface DossierTrayProps {
  dossierWidth: number
  isDossierCollapsed: boolean
  isViewerExpanded: boolean
  mobileTab: 'board' | 'dossier'
  filterTab: 'pdf' | 'evidence'
  onSetFilterTab: (tab: 'pdf' | 'evidence') => void
  selectedPhaseFilter: 'all' | number
  onSetPhaseFilter: (val: 'all' | number) => void
  isPhaseUnlocked: (phase: number) => boolean
  pdfItems: CombinedItem[]
  evidenceItems: CombinedItem[]
  selectedView: SelectedView
  onSelectPdf: (item: PDFDocument) => void
  onSelectEvidence: (item: PhysicalEvidence) => void
  activePing?: {
    actorName: string
    targetId: string
  } | null
  onBroadcastPing: (
    targetId: string,
    label: string,
    pos?: { x: number; y: number },
    meta?: {
      targetType: 'doc' | 'evidence'
      docType?: 'pdf' | 'evidence'
      page?: number
      highlightText?: string
    }
  ) => void
}

export function DossierTray({
  dossierWidth,
  isDossierCollapsed,
  isViewerExpanded,
  mobileTab,
  filterTab,
  onSetFilterTab,
  selectedPhaseFilter,
  onSetPhaseFilter,
  isPhaseUnlocked,
  pdfItems,
  evidenceItems,
  selectedView,
  onSelectPdf,
  onSelectEvidence,
  activePing,
  onBroadcastPing,
}: DossierTrayProps) {
  const { theme } = useEvidenceTheme()
  const isNoir = theme === 'noir'
  return (
    <div
      style={{
        width: isDossierCollapsed ? 0 : `${dossierWidth}px`,
      }}
      className={cn(
        'w-full lg:w-auto shrink-0 rounded-none overflow-hidden flex flex-col h-full min-h-0 transition-colors duration-200 border-r',
        isNoir ? 'bg-[#0a0a0d] border-[#1e1e24]' : 'bg-[#140e0a] border-[#2d1e13]',
        isDossierCollapsed && 'lg:hidden',
        isViewerExpanded && 'hidden xl:flex',
        mobileTab === 'dossier' ? 'flex' : 'hidden lg:flex'
      )}
    >
      {/* HEADER: 2 TABS TÀI LIỆU VÀ ẢNH CHUẨN BIÊN MỤC HỒ SƠ */}
      <div className={cn(
        "hidden lg:flex shrink-0 p-2 border-b items-center gap-1.5 transition-colors",
        isNoir ? "bg-[#101014] border-[#1e1e24]" : "bg-[#1b120c] border-[#2d1e13]"
      )}>
        <button
          type="button"
          onClick={() => onSetFilterTab('pdf')}
          className={cn(
            'flex-1 py-1.5 px-3 font-mono text-xs tracking-wider font-bold transition-all cursor-pointer rounded-xs flex items-center justify-center gap-1.5 border',
            filterTab === 'pdf'
              ? 'bg-[#241e17] text-[#e8a86a] border-[#e8a86a]/60 shadow-[inset_0_1px_0_rgba(232,168,106,0.25)] font-extrabold'
              : 'bg-[#121216] text-[#94949e] hover:text-[#f4f4f5] hover:bg-[#1c1c22] border-[#23232a]'
          )}
        >
          <FileText className="size-3.5" />
          <span>HỒ SƠ TÀI LIỆU</span>
        </button>
        <button
          type="button"
          onClick={() => onSetFilterTab('evidence')}
          className={cn(
            'flex-1 py-1.5 px-3 font-mono text-xs tracking-wider font-bold transition-all cursor-pointer rounded-xs flex items-center justify-center gap-1.5 border',
            filterTab === 'evidence'
              ? 'bg-[#241e17] text-[#e8a86a] border-[#e8a86a]/60 shadow-[inset_0_1px_0_rgba(232,168,106,0.25)] font-extrabold'
              : 'bg-[#121216] text-[#94949e] hover:text-[#f4f4f5] hover:bg-[#1c1c22] border-[#23232a]'
          )}
        >
          <ImageIcon className="size-3.5" />
          <span>VẬT CHỨNG</span>
        </button>
      </div>

      {/* PHASE FILTER TABS: TAB CHỈ MỤC NGĂN KÉO LƯU TRỮ */}
      <div className={cn(
        "shrink-0 px-2 py-1.5 border-b flex items-center gap-1 overflow-x-auto font-mono custom-scrollbar transition-colors",
        isNoir ? "border-[#1e1e24] bg-[#0c0c10]" : "border-[#291b12] bg-[#120c08]"
      )}>
        {[
          { label: 'TẤT CẢ', val: 'all' as const },
          { label: 'BAN ĐẦU', val: 0 },
          { label: 'BỘ A', val: 1 },
          { label: 'BỘ B', val: 2 },
          { label: 'BỘ C', val: 3 },
        ].map((p) => {
          const isLocked = typeof p.val === 'number' && !isPhaseUnlocked(p.val)
          const isSelected = selectedPhaseFilter === p.val
          return (
            <button
              key={p.label}
              disabled={isLocked}
              onClick={() => onSetPhaseFilter(p.val)}
              className={cn(
                'px-2.5 py-1 rounded-xs transition-all whitespace-nowrap text-[0.72rem] tracking-wide font-bold min-h-[26px] flex items-center justify-center border',
                isLocked
                  ? 'opacity-30 cursor-not-allowed text-zinc-600 border-transparent'
                  : isSelected
                  ? isNoir
                    ? 'bg-[#38bdf8] text-[#050507] border-[#38bdf8] font-black shadow-xs'
                    : 'bg-[#d9a066] text-[#140e0a] border-[#d9a066] font-black shadow-xs'
                  : isNoir
                    ? 'bg-[#131318] text-[#a1a1aa] hover:text-white hover:bg-[#1c1c24] border-[#22222c] cursor-pointer'
                    : 'bg-[#1a120c] text-[#9b8572] hover:text-[#f0e4d7] hover:bg-[#251a12] border-[#2d1e14] cursor-pointer'
              )}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* DANH SÁCH THẺ HỒ SƠ LƯU TRỮ (MANILA ARCHIVAL DOSSIER FOLDERS) */}
      <div className={cn(
        "flex-1 overflow-y-auto custom-scrollbar min-h-0 p-2 space-y-2 transition-colors",
        isNoir ? "bg-[#060608]" : "bg-[#0e0906]"
      )}>
        {filterTab === 'evidence' ? (
          /* NẾU LÀ VẬT CHỨNG: HIỂN THỊ DẠNG GRID */
          evidenceItems.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-zinc-500">
              Chưa thu thập vật chứng nào.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {evidenceItems.map((item) => {
                const isSelected =
                  selectedView.type === item.type &&
                  selectedView.data.id === item.data.id
                const evItem = item.data as PhysicalEvidence
                const isPinged =
                  activePing?.targetId === item.data.id ||
                  Boolean(evItem.evidenceId && activePing?.targetId === evItem.evidenceId)

                return (
                  <div
                    id={`doc-card-${item.data.id}`}
                    key={`evidence-${item.data.id}`}
                    className={cn(
                      'w-full aspect-[4/3] text-left border transition-all cursor-pointer relative overflow-hidden group shadow-md active:scale-[0.98]',
                      isNoir ? 'bg-[#0e0e13]' : 'bg-[#0a0705]',
                      isPinged
                        ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse'
                        : isSelected
                        ? isNoir
                          ? 'border-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.35)] ring-1 ring-[#38bdf8]'
                          : 'border-[#d9a066] shadow-[0_0_15px_rgba(217,160,102,0.35)] ring-1 ring-[#d9a066]'
                        : isNoir
                          ? 'border-[#1e1e26] hover:border-[#383848]'
                          : 'border-[#2d1e13] hover:border-[#4d3422]'
                    )}
                    onClick={() => onSelectEvidence(evItem)}
                  >
                    <img
                      src={normalizeImageUrl(evItem?.thumbnail) || '/photo_scene_overview.jpg'}
                      alt="Vật chứng"
                      className="w-full h-full object-cover select-none transition-transform duration-200 group-hover:scale-105"
                    />
                    {evItem?.evidenceId && (
                      <div className={cn("absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/85 text-[0.65rem] font-mono font-bold tracking-wider border border-white/10 z-10", isNoir ? "text-zinc-200" : "text-[#e5d8cb]")}>
                        {evItem.evidenceId}
                      </div>
                    )}

                    {/* NÚT CHỈ ĐIỂM NHANH KHI HOVER */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onBroadcastPing(evItem.evidenceId || item.data.id, item.data.title, undefined, {
                          targetType: 'evidence',
                          docType: 'evidence',
                        })
                      }}
                      className="absolute top-1 right-1 p-1 rounded bg-black/75 hover:bg-amber-500/80 text-white/70 hover:text-black border border-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                      title="Chỉ điểm vật chứng này cho đồng đội"
                    >
                      <Target className="size-3.5" />
                    </button>

                    {/* BADGE THÁM TỬ ĐANG CHỈ ĐIỂM */}
                    {isPinged && activePing && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-500 text-black font-mono text-[0.6rem] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 z-20 animate-bounce">
                        <Target className="size-3" />
                        <span className="truncate max-w-[80px]">{activePing.actorName}</span>
                      </div>
                    )}

                    {isSelected && !isPinged && (
                      <div className={cn("absolute inset-0 border-2 pointer-events-none", isNoir ? "border-[#38bdf8]" : "border-[#d9a066]")} />
                    )}
                  </div>
                )
              })}
            </div>
          )
        ) : (
          /* NẾU LÀ HỒ SƠ: THẺ BÌA MANILA CỔ ĐIỂN VỚI TAB GÁY VÀ VẠCH CHỈ THỊ */
          pdfItems.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-500">
              Không tìm thấy tài liệu trong danh mục này.
            </div>
          ) : (
            pdfItems.map((item) => {
              const isSelected =
                selectedView.type === item.type &&
                selectedView.data.id === item.data.id
              const pdfDoc = item.data as PDFDocument
              const code = pdfDoc?.code || 'DOC'
              const title = item.data.title || ''
              const titleLower = title.toLowerCase()

              // Nhận diện kiểu văn bản để gắn nhãn phân loại (Type badge & Accent bar)
              const isLyLich = titleLower.includes('lý lịch') || titleLower.includes('nhân thân')
              const isLoiKhai = titleLower.includes('lời khai') || titleLower.includes('hỏi cung') || titleLower.includes('tự thú')
              const isHuongDan = code === '00-HD' || titleLower.includes('hướng dẫn')

              const badgeText = isLyLich
                ? 'LÝ LỊCH'
                : isLoiKhai
                ? 'HỎI CUNG'
                : isHuongDan
                ? 'CHỈ DẪN'
                : 'HỒ SƠ'

              const badgeColor = isLyLich
                ? 'text-[#f87171] border-[#7f1d1d] bg-[#450a0a]/40'
                : isLoiKhai
                ? 'text-[#60a5fa] border-[#1e3a8a] bg-[#172554]/40'
                : isHuongDan
                ? 'text-[#34d399] border-[#065f46] bg-[#022c22]/40'
                : isNoir
                ? 'text-[#38bdf8] border-[#0369a1] bg-[#0c4a6e]/30'
                : 'text-[#d9a066] border-[#78350f] bg-[#451a03]/40'

              const accentBorder = isSelected
                ? isNoir
                  ? 'border-l-4 border-l-[#38bdf8]'
                  : 'border-l-4 border-l-[#d9a066]'
                : isLyLich
                ? 'border-l-2 border-l-[#ef4444]/60'
                : isLoiKhai
                ? 'border-l-2 border-l-[#3b82f6]/60'
                : isNoir
                ? 'border-l-2 border-l-[#0284c7]/50'
                : 'border-l-2 border-l-[#78350f]/60'

              const isPinged =
                activePing?.targetId === item.data.id ||
                Boolean(code && activePing?.targetId === code)

              return (
                <div
                  id={`doc-card-${item.data.id}`}
                  key={`pdf-${item.data.id}`}
                  onClick={() => onSelectPdf(pdfDoc)}
                  className={cn(
                    'w-full text-left transition-all duration-150 cursor-pointer overflow-hidden group select-none relative p-3 rounded-xs border shadow-sm',
                    accentBorder,
                    isPinged
                      ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse'
                      : isSelected
                      ? 'bg-[#1f1b14] border-[#d9a066] shadow-[0_4px_16px_rgba(0,0,0,0.8)] ring-1 ring-[#d9a066]/30'
                      : 'bg-[#141419] hover:bg-[#1b1b22] border-[#23232a] hover:border-[#3f3f4c]'
                  )}
                >
                  {/* DÒNG 1: MÃ HỒ SƠ + BADGE PHÂN LOẠI + NÚT CHỈ ĐIỂM NHANH */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'font-mono text-xs font-black tracking-wider transition-colors',
                          isSelected
                            ? isNoir ? 'text-[#38bdf8]' : 'text-[#d9a066]'
                            : isNoir ? 'text-[#94a3b8] group-hover:text-white' : 'text-[#c29668] group-hover:text-[#e8b988]'
                        )}
                      >
                        {code}
                      </span>

                      <span
                        className={cn(
                          'font-mono text-[0.62rem] font-bold px-1.5 py-0.5 rounded-2xs border tracking-wider',
                          badgeColor
                        )}
                      >
                        {badgeText}
                      </span>
                    </div>

                    {/* NÚT CHỈ ĐIỂM NHANH (HOVER HOẶC ĐANG CHỌN) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onBroadcastPing(item.data.id, title, undefined, {
                          targetType: 'doc',
                          docType: 'pdf',
                        })
                      }}
                      className="p-1 rounded hover:bg-amber-500/20 text-stone-400 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1 font-mono text-[0.65rem]"
                      title="Chỉ điểm tài liệu này cho đồng đội"
                    >
                      <Target className="size-3.5" />
                    </button>
                  </div>

                  {/* BADGE BÁO ĐỒNG ĐỘI ĐANG CHỈ ĐIỂM */}
                  {isPinged && activePing && (
                    <div className="mb-2 px-2 py-0.5 rounded bg-amber-500 text-black font-mono text-[0.65rem] font-black flex items-center gap-1.5 shadow-md">
                      <Target className="size-3 animate-spin" />
                      <span>🎯 {activePing.actorName} đang chỉ điểm văn bản này</span>
                    </div>
                  )}

                  {/* DÒNG 2: TIÊU ĐỀ TÀI LIỆU */}
                  <p
                    className={cn(
                      'font-normal text-xs sm:text-[0.82rem] leading-snug line-clamp-2 transition-colors',
                      isSelected
                        ? 'text-white font-medium'
                        : isNoir ? 'text-[#d4d4d8] group-hover:text-white' : 'text-[#c2b29f] group-hover:text-white'
                    )}
                  >
                    {title}
                  </p>

                  {/* Hướng dẫn trên mobile khi mở */}
                  {isSelected && (
                    <p className={cn("block lg:hidden mt-2 text-[0.65rem] font-mono text-right font-medium", isNoir ? "text-sky-400" : "text-[#d9a066]")}>
                      Chạm để mở toàn màn hình ❯
                    </p>
                  )}
                </div>
              )
            })
          ))}
      </div>
    </div>
  )
}
