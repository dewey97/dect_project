import React from 'react'
import { FileText, ImageIcon, Layers, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InvestigationMobileNavProps {
  mobileTab: 'board' | 'dossier'
  filterTab: 'pdf' | 'evidence'
  onSelectBoard: () => void
  onSelectDossierTab: (tab: 'pdf' | 'evidence') => void
  onOpenNotebook: () => void
}

export function InvestigationMobileNav({
  mobileTab,
  filterTab,
  onSelectBoard,
  onSelectDossierTab,
  onOpenNotebook,
}: InvestigationMobileNavProps) {
  return (
    <div className="flex lg:hidden shrink-0 items-center justify-between p-2 bg-[#16120e] border-b border-[#3d2c1e] shadow-md w-full z-30 gap-2">
      <button
        type="button"
        onClick={onSelectBoard}
        className={cn(
          'flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap min-h-[44px]',
          mobileTab === 'board'
            ? 'bg-[#d9a066] text-[#1a0f07] shadow-sm font-extrabold'
            : 'text-[#ad9885] hover:text-[#e5d8cb] hover:bg-[#201710] bg-[#1a130d] border border-[#2f2015]'
        )}
      >
        <Layers className="size-4 shrink-0" />
        <span className="truncate">BẢNG ĐIỀU TRA</span>
      </button>
      <button
        type="button"
        onClick={() => onSelectDossierTab('pdf')}
        className={cn(
          'flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer relative whitespace-nowrap min-h-[44px]',
          mobileTab === 'dossier' && filterTab === 'pdf'
            ? 'bg-[#d9a066] text-[#1a0f07] shadow-sm font-extrabold'
            : 'text-[#ad9885] hover:text-[#e5d8cb] hover:bg-[#201710] bg-[#1a130d] border border-[#2f2015]'
        )}
      >
        <FileText className="size-4 shrink-0" />
        <span className="truncate">TÀI LIỆU</span>
      </button>
      <button
        type="button"
        onClick={() => onSelectDossierTab('evidence')}
        className={cn(
          'flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer relative whitespace-nowrap min-h-[44px]',
          mobileTab === 'dossier' && filterTab === 'evidence'
            ? 'bg-[#d9a066] text-[#1a0f07] shadow-sm font-extrabold'
            : 'text-[#ad9885] hover:text-[#e5d8cb] hover:bg-[#201710] bg-[#1a130d] border border-[#2f2015]'
        )}
      >
        <ImageIcon className="size-4 shrink-0" />
        <span className="truncate">ẢNH</span>
      </button>
      <button
        type="button"
        onClick={onOpenNotebook}
        className="size-11 shrink-0 flex items-center justify-center rounded-lg bg-[#24170e] hover:bg-[#382315] border border-[#4d3420] text-[#d9a066] hover:text-[#fdebd7] transition-all cursor-pointer shadow-sm active:scale-95"
        title="Sổ tay thám tử"
      >
        <PenLine className="size-4" />
      </button>
    </div>
  )
}
