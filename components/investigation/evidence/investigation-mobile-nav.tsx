import React from 'react'
import { FileText, ImageIcon, Layers, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEvidenceTheme, EvidenceThemeSwitcher } from './evidence-theme-context'

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
  const { theme } = useEvidenceTheme()
  const isNoir = theme === 'noir'
  return (
    <div className={cn(
        "flex lg:hidden shrink-0 items-center justify-between p-2 border-b shadow-md w-full z-30 gap-1.5 transition-colors",
        isNoir ? "bg-[#0a0a0d] border-[#1e1e24]" : "bg-[#16120e] border-[#3d2c1e]"
      )}>
      <button
        type="button"
        onClick={onSelectBoard}
        className={cn(
          'flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap min-h-[44px]',
          mobileTab === 'board'
            ? isNoir ? 'bg-[#38bdf8] text-[#050507] shadow-sm font-extrabold' : 'bg-[#d9a066] text-[#1a0f07] shadow-sm font-extrabold'
            : isNoir ? 'text-[#a1a1aa] hover:text-white hover:bg-[#16161d] bg-[#0e0e13] border border-[#1e1e24]' : 'text-[#ad9885] hover:text-[#e5d8cb] hover:bg-[#201710] bg-[#1a130d] border border-[#2f2015]'
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
            ? 'bg-[#d9a066] text-[#09090b] shadow-sm font-extrabold'
            : 'text-[#a1a1aa] hover:text-white hover:bg-[#1f1f27] bg-[#141419] border border-[#23232a]'
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
            ? 'bg-[#d9a066] text-[#09090b] shadow-sm font-extrabold'
            : 'text-[#a1a1aa] hover:text-white hover:bg-[#1f1f27] bg-[#141419] border border-[#23232a]'
        )}
      >
        <ImageIcon className="size-4 shrink-0" />
        <span className="truncate">ẢNH</span>
      </button>
      {/* THEME TOGGLE FOR MOBILE */}
      <EvidenceThemeSwitcher compact />

      <button
        type="button"
        onClick={onOpenNotebook}
        className={cn(
          "size-10 shrink-0 flex items-center justify-center rounded-lg border transition-all cursor-pointer shadow-sm active:scale-95",
          isNoir ? "bg-[#141824] hover:bg-[#1a2234] border-[#38bdf8]/40 text-[#38bdf8]" : "bg-[#24170e] hover:bg-[#382315] border-[#4d3420] text-[#d9a066]"
        )}
        title="Sổ tay thám tử"
      >
        <PenLine className="size-4" />
      </button>
    </div>
  )
}
