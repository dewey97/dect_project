'use client'

import { ChevronRight, Lock, MapPin, Calendar, Clock, Award } from 'lucide-react'
import type { Case } from '@/lib/types'
import { cn } from '@/lib/utils'

function DifficultyRating({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Difficulty ${level} of 5`}>
      <span className="font-mono text-[0.625rem] text-muted-foreground mr-1">DIFF:</span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            'size-2 rotate-45 border transition-colors',
            i < level
              ? 'bg-primary border-primary shadow-[0_0_5px_var(--primary)]'
              : 'bg-transparent border-border'
          )}
        />
      ))}
    </div>
  )
}

interface CaseCardProps {
  caseFile: Case
  onSelect?: () => void
}

export function CaseCard({ caseFile, onSelect }: CaseCardProps) {
  const isLocked = caseFile.status === 'locked'
  const isActive = caseFile.status === 'active'
  const isSolved = caseFile.status === 'solved'
  const isSealed = caseFile.status === 'sealed'

  const STATUS_LABELS = {
    active: 'ĐANG ĐIỀU TRA',
    locked: 'ĐÃ KHÓA',
    solved: 'ĐÃ PHÁ ÁN',
    sealed: 'NIÊM PHONG'
  }

  return (
    <article
      onClick={onSelect}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-r-lg rounded-bl-lg border bg-card p-4 transition-all duration-300 cursor-pointer',
        'hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30 active:translate-y-0',
        isActive ? 'border-primary/45 shadow-[inset_0_0_12px_rgba(199,145,55,0.05)]' : 'border-border/80',
        isLocked && 'opacity-65 grayscale-[30%]',
        isSealed && 'opacity-50 border-dashed border-muted-foreground/30'
      )}
    >
      {/* Folder Tab Overlay on top left */}
      <div className="absolute top-0 left-0 -mt-[1px] h-5 px-3 rounded-tr-md bg-accent/40 border-r border-b border-border/80 flex items-center font-mono text-[0.55rem] text-muted-foreground tracking-wider uppercase">
        MÃ HỒ SƠ // {caseFile.code}
      </div>

      {/* Sealed/Classified Scanlines Vignette */}
      {(isSealed || caseFile.hidden) && (
        <div
          aria-hidden="true"
          className="noir-scanlines pointer-events-none absolute inset-0 z-0 opacity-20"
        />
      )}

      {/* Top section: Case Metadata (starts lower to clear the tab) */}
      <div className="mt-4 flex items-center justify-between gap-2 z-10">
        <span className="font-mono text-[0.6rem] text-primary uppercase tracking-widest">
          {caseFile.location}
        </span>
        
        {/* Status Text Label */}
        <span
          className={cn(
            'label-tag px-2 py-0.5 rounded border text-[0.55rem] font-bold',
            isActive && 'text-primary border-primary/30 bg-primary/5',
            isLocked && 'text-muted-foreground border-border bg-muted/10',
            isSolved && 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5',
            isSealed && 'text-destructive border-destructive/30 bg-destructive/5'
          )}
        >
          {STATUS_LABELS[caseFile.status]}
        </span>
      </div>

      {/* Title & Description */}
      <div className="mt-3.5 z-10">
        <h3 className={cn(
          "font-sans text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors",
          isSealed && 'font-mono tracking-wide'
        )}>
          {caseFile.title}
        </h3>
        <p className="mt-1.5 text-pretty text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {caseFile.logline}
        </p>
      </div>

      {/* Middle section: Active Case Progress or Objective */}
      {isActive && (
        <div className="mt-4 pt-3 border-t border-border/40 z-10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[0.65rem] font-mono">
            <span className="text-muted-foreground">TIẾN ĐỘ ĐIỀU TRA</span>
            <span className="text-primary font-bold">{caseFile.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/65">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${caseFile.progress}%` }}
            />
          </div>
          {caseFile.objective && (
            <p className="text-[0.65rem] text-muted-foreground leading-normal mt-1 italic">
              <span className="font-semibold text-foreground font-mono not-italic mr-1 text-[0.6rem]">MỤC TIÊU:</span>
              "{caseFile.objective}"
            </p>
          )}
        </div>
      )}

      {/* SOLVED STAMP WITH REALISTIC STAMP ANIMATION */}
      {isSolved && (
        <div className="absolute right-6 bottom-4 z-20 pointer-events-none select-none">
          <div className="animate-stamp flex flex-col items-center justify-center border-4 border-destructive/70 bg-background/80 px-4 py-1.5 text-destructive rounded font-mono font-black text-sm uppercase tracking-[0.25em] shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <span>ĐÃ PHÁ ÁN</span>
            <span className="text-[0.5rem] font-semibold mt-0.5 opacity-80">HỆ THỐNG NOCTURNE</span>
          </div>
        </div>
      )}

      {/* Bottom section: Details & Action */}
      <div className="mt-4 pt-3.5 border-t border-border/40 flex items-center justify-between gap-4 z-10 text-[0.65rem] text-muted-foreground font-mono">
        <div className="flex items-center gap-3">
          <DifficultyRating level={caseFile.difficulty} />
          {caseFile.estimatedTime && (
            <span className="flex items-center gap-1">
              <Clock className="size-3 text-muted-foreground/75" />
              ƯỚC TÍNH: {caseFile.estimatedTime}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-primary font-semibold text-[0.6rem] uppercase tracking-wider">
          {isLocked ? (
            <span className="flex items-center gap-1 text-muted-foreground font-medium">
              <Lock className="size-3" />
              ĐÃ KHÓA
            </span>
          ) : isSealed ? (
            <span className="flex items-center gap-1 text-destructive font-medium">
              HẠN CHẾ
            </span>
          ) : (
            <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              MỞ HỒ SƠ
              <ChevronRight className="size-3" />
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
