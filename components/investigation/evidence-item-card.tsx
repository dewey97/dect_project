'use client'

import { FileText, Mic, MapPin, Mail, MessageSquare, ShieldAlert, CheckCircle } from 'lucide-react'
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

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex items-start gap-3 rounded-lg border border-border/80 bg-card/30 p-3.5 transition-all duration-200 cursor-pointer',
        'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm active:translate-y-0',
        isFlagged && 'border-destructive/30 bg-destructive/5'
      )}
    >
      {/* Evidence Type Icon with forensic box */}
      <span className="flex size-10 shrink-0 items-center justify-center rounded border border-border/70 bg-accent/40 text-muted-foreground group-hover:text-primary transition-colors">
        <Icon className="size-5" aria-hidden="true" />
      </span>

      {/* Main Metadata dossier sheet layout */}
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          {/* Evidence ID Code */}
          <span className="font-mono text-[0.6rem] text-primary uppercase tracking-widest">
            LOG // {item.evidenceId}
          </span>
          
          {/* Integrity status pill */}
          <span className={cn(
            'font-mono text-[0.55rem] uppercase tracking-wider px-1.5 py-0.5 rounded border',
            item.integrityStatus === 'secured' && 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
            item.integrityStatus === 'analyzing' && 'text-primary border-primary/20 bg-primary/5',
            item.integrityStatus === 'corrupted' && 'text-destructive border-destructive/20 bg-destructive/5'
          )}>
            {item.integrityStatus}
          </span>
        </div>

        {/* Title */}
        <h5 className="mt-1.5 font-sans text-sm font-bold text-foreground leading-snug truncate">
          {item.title}
        </h5>

        {/* Preview description */}
        <p className="mt-1 text-pretty text-xs text-muted-foreground leading-relaxed line-clamp-1">
          {item.preview}
        </p>

        {/* Chain of Custody Forensic footer */}
        <div className="mt-3.5 pt-2 border-t border-border/30 flex items-center justify-between text-[0.55rem] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>BY: {item.recoveredBy}</span>
            <span className="opacity-40">|</span>
            <span>TIME: {item.timestamp}</span>
          </div>

          <div className="flex items-center gap-1">
            {isFlagged ? (
              <span className="text-destructive font-bold flex items-center gap-0.5 animate-pulse">
                <ShieldAlert className="size-3" />
                FLAGGED
              </span>
            ) : (
              <span className="text-emerald-500 font-medium flex items-center gap-0.5">
                <CheckCircle className="size-2.5" />
                {item.chainOfCustody}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
