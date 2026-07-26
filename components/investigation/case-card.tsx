'use client'

import { Lock, Clock } from 'lucide-react'
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

  return (
    <article
      onClick={onSelect}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all duration-300 cursor-pointer',
        'hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30 active:translate-y-0',
        isActive ? 'border-primary/45 shadow-[inset_0_0_12px_rgba(199,145,55,0.05)]' : 'border-border/80',
        isLocked && 'opacity-65 grayscale-[30%]',
        isSealed && 'opacity-50 border-dashed border-muted-foreground/30'
      )}
    >
      {/* Sealed/Classified Scanlines Vignette */}
      {(isSealed || caseFile.hidden) && (
        <div
          aria-hidden="true"
          className="noir-scanlines pointer-events-none absolute inset-0 z-0 opacity-20"
        />
      )}

      {/* Case Cover Image */}
      {caseFile.coverImage && (
        <div className="relative h-48 w-full overflow-hidden border-b border-border/20 shrink-0">
          <img 
            src={caseFile.coverImage} 
            alt={caseFile.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 justify-between z-10 relative">
        <div>
          {/* Location */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[0.6rem] text-primary uppercase tracking-widest">
              {caseFile.location}
            </span>
          </div>

          {/* Title & Description */}
          <div className="mt-2">
            <h3 className={cn(
              "font-sans text-xl font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors",
              isSealed && 'font-mono tracking-wide'
            )}>
              {caseFile.title}
            </h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {caseFile.logline}
            </p>
          </div>
        </div>

        {/* SOLVED STAMP WITH REALISTIC STAMP ANIMATION */}
        {isSolved && (
          <div className="absolute right-4 bottom-14 z-20 pointer-events-none select-none">
            <div className="animate-stamp flex flex-col items-center justify-center border-4 border-destructive/70 bg-background/80 px-4 py-1.5 text-destructive rounded font-mono font-black text-sm uppercase tracking-[0.25em] shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              <span>ĐÃ PHÁ ÁN</span>
              <span className="text-[0.5rem] font-semibold mt-0.5 opacity-80">CƠ QUAN ĐIỀU TRA NOCTURNE</span>
            </div>
          </div>
        )}

        {/* Bottom section: Details & Action */}
        <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between gap-4 text-[0.65rem] text-muted-foreground font-mono">
          <div className="flex items-center gap-4">
            <DifficultyRating level={caseFile.difficulty} />
            {caseFile.estimatedTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground/75" />
                ƯỚC TÍNH: {caseFile.estimatedTime}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-primary font-semibold text-[0.6rem] uppercase tracking-wider">
            {isLocked && (
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Lock className="size-3.5" />
                ĐÃ KHÓA
              </span>
            )}
            {isSealed && (
              <span className="flex items-center gap-1.5 text-destructive font-medium">
                HẠN CHẾ
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
