'use client'

import { FileText, Mic, MapPin, Mail, MessageSquare } from 'lucide-react'
import type { Evidence, EvidenceKind } from '@/lib/types'
import { cn } from '@/lib/utils'

const EVIDENCE_ICON: Record<EvidenceKind, typeof FileText> = {
  message: MessageSquare,
  email: Mail,
  voice: Mic,
  photo: FileText, // fallback
  gps: MapPin,
  document: FileText,
}

interface EvidenceItemCardProps {
  item: Evidence
  onClick?: () => void
}

export function EvidenceItemCard({ item, onClick }: EvidenceItemCardProps) {
  const Icon = EVIDENCE_ICON[item.kind] || FileText
  const isFlagged = item.flagged

  // Distinct visual filters based on evidence type
  const filterClass = cn(
    item.kind === 'document' || item.kind === 'email' || item.kind === 'message'
      ? 'sepia-[0.3] contrast-125'
      : item.kind === 'voice'
      ? 'contrast-150 grayscale-[0.5]'
      : 'saturate-50 contrast-125' // gps, photo
  )

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 overflow-hidden rounded-lg border bg-card/60 transition-all duration-300 cursor-pointer p-2.5',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 active:translate-y-0',
        isFlagged ? 'border-destructive/40 bg-destructive/5' : 'border-border/80'
      )}
    >
      {/* Thumbnail Area - Compact Square */}
      <div className="relative size-14 shrink-0 overflow-hidden rounded bg-muted/30 border border-border/40">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className={cn('w-full h-full object-cover transition-transform duration-700 group-hover:scale-110', filterClass)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-card">
            <Icon className="size-6 text-muted-foreground/30" />
          </div>
        )}

        {/* Gradient Overlay & Icon Badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-sm bg-background/90 backdrop-blur border border-border/50 text-foreground group-hover:text-primary group-hover:border-primary/40 transition-colors">
          <Icon className="size-2.5" aria-hidden="true" />
        </div>
      </div>

      {/* Metadata / Details */}
      <div className="flex flex-col min-w-0 flex-1 justify-center py-0.5">
        <h5 className="font-sans text-[0.75rem] font-bold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
          {item.title}
        </h5>
        <p className="mt-0.5 text-pretty text-[0.65rem] text-muted-foreground leading-relaxed line-clamp-1">
          {item.preview}
        </p>
      </div>
    </div>
  )
}

