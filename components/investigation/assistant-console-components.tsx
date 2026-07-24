'use client'

import type { ReactNode } from 'react'
import { Terminal, KeyRound, AlertOctagon, HelpCircle, Link as LinkIcon, FileCheck2, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ComponentProps {
  children: ReactNode
  className?: string
}

// 1. AssistantMessage
export function AssistantMessage({ children, className }: ComponentProps) {
  return (
    <div className={cn('flex flex-col gap-1 max-w-[85%] self-start bg-card/65 border border-border/80 p-3.5 rounded-r-lg rounded-bl-lg shadow-sm font-sans', className)}>
      <span className="font-mono text-[0.55rem] text-primary uppercase tracking-widest font-bold">
        OPERATOR // MINH
      </span>
      <p className="text-xs leading-relaxed text-foreground">{children}</p>
    </div>
  )
}

// 2. DetectiveAction
export function DetectiveAction({ children, className }: ComponentProps) {
  return (
    <div className={cn('flex flex-col gap-1 max-w-[80%] self-end bg-primary/5 border border-primary/20 p-3 rounded-l-lg rounded-br-lg shadow-sm font-mono text-right', className)}>
      <span className="font-mono text-[0.55rem] text-primary/70 uppercase tracking-widest">
        DETECTIVE // INPUT
      </span>
      <div className="flex items-center justify-end gap-1.5 text-xs text-foreground font-semibold">
        <Terminal className="size-3 text-primary shrink-0" />
        <span>{children}</span>
      </div>
    </div>
  )
}

// 3. SuggestionChip
interface SuggestionChipProps {
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function SuggestionChip({ label, onClick, disabled, className }: SuggestionChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border bg-card p-3.5 text-left text-xs font-bold text-foreground transition-all duration-150',
        'hover:-translate-y-0.5 hover:border-primary/45 hover:text-primary active:translate-y-0',
        'disabled:opacity-40 disabled:hover:translate-y-0 disabled:border-border disabled:text-muted-foreground w-full font-mono uppercase tracking-wider',
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
      <span className="flex-1 truncate">{label}</span>
    </button>
  )
}

// 4. HintCard
interface HintCardProps {
  level: 1 | 2 | 3
  hint: string
  className?: string
}

export function HintCard({ level, hint, className }: HintCardProps) {
  const borderColors = {
    1: 'border-amber-500/40 bg-amber-500/5',
    2: 'border-orange-500/50 bg-orange-500/5 shadow-[0_0_12px_rgba(249,115,22,0.05)]',
    3: 'border-destructive/50 bg-destructive/5 shadow-[0_0_15px_rgba(220,38,38,0.08)] animate-pulse-slow',
  }

  const levelLabels = {
    1: 'LEVEL 1 // SUBTLE GUIDANCE',
    2: 'LEVEL 2 // SPECIFIC EVIDENCE POINTER',
    3: 'LEVEL 3 // DIRECT FIELD OPERATION',
  }

  return (
    <div className={cn(
      'flex flex-col gap-2 max-w-[85%] self-start rounded-r-lg rounded-bl-lg border p-4 shadow-sm font-sans',
      borderColors[level],
      className
    )}>
      <div className="flex items-center gap-1.5 font-mono text-[0.55rem] font-bold text-primary tracking-widest uppercase">
        <HelpCircle className="size-3.5 shrink-0 text-primary" />
        <span>{levelLabels[level]}</span>
      </div>
      <p className="text-xs leading-relaxed text-foreground italic">
        "{hint}"
      </p>
    </div>
  )
}

// 5. EvidenceReference
interface EvidenceReferenceProps {
  evidenceId: string
  title: string
  previewText: string
  className?: string
}

export function EvidenceReference({ evidenceId, title, previewText, className }: EvidenceReferenceProps) {
  return (
    <div className={cn('flex flex-col gap-2 max-w-[85%] self-start bg-card/65 border border-border p-3.5 rounded-r-lg rounded-bl-lg shadow-sm font-sans', className)}>
      <span className="font-mono text-[0.55rem] text-primary uppercase tracking-widest font-bold">
        OPERATOR // ATTACHED_LOG
      </span>
      <Link
        href="/evidence"
        className="group flex items-center gap-2 rounded border border-border/80 bg-background/50 p-2.5 hover:border-primary/30 transition-colors"
      >
        <LinkIcon className="size-4 text-primary shrink-0 group-hover:scale-105 transition-transform" />
        <div className="min-w-0">
          <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">{evidenceId}</span>
          <span className="block text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{title}</span>
          <span className="block text-[0.65rem] text-muted-foreground truncate">{previewText}</span>
        </div>
      </Link>
    </div>
  )
}

// 6. CaseWarning
export function CaseWarning({ children, className }: ComponentProps) {
  return (
    <div className={cn('flex items-start gap-2.5 max-w-[85%] self-start border border-destructive/35 bg-destructive/5 p-3.5 rounded-r-lg rounded-bl-lg shadow-sm font-sans', className)}>
      <AlertOctagon className="size-4 text-destructive shrink-0 mt-0.5 animate-pulse" />
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-mono text-[0.55rem] text-destructive uppercase tracking-widest font-bold">
          SECURITY WARNING // ANOMALY
        </span>
        <p className="text-xs leading-relaxed text-foreground">{children}</p>
      </div>
    </div>
  )
}

// 7. RecoveredInformation
interface RecoveredInformationProps {
  title: string
  dataRows: { label: string; value: string }[]
  className?: string
}

export function RecoveredInformation({ title, dataRows, className }: RecoveredInformationProps) {
  return (
    <div className={cn('flex flex-col gap-2 max-w-[90%] self-start bg-card/75 border border-border/90 p-3.5 rounded-r-lg rounded-bl-lg shadow-md font-sans w-full', className)}>
      <span className="font-mono text-[0.55rem] text-primary uppercase tracking-widest font-bold flex items-center gap-1">
        <Cpu className="size-3.5" /> RECONSTRUCTED INTELLIGENCE
      </span>
      <div className="rounded border border-border/60 bg-background/50 p-2.5 flex flex-col gap-1.5">
        <span className="font-mono text-[0.6rem] text-muted-foreground uppercase block border-b border-border/20 pb-1 mb-1 font-bold">
          FILE: {title}
        </span>
        <div className="flex flex-col gap-1 font-mono text-[0.625rem] leading-normal text-muted-foreground">
          {dataRows.map((row, idx) => (
            <div key={idx} className="flex justify-between gap-4 border-b border-border/10 pb-0.5">
              <span>{row.label.toUpperCase()}:</span>
              <span className="text-foreground font-semibold">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 8. SystemAlert
export function SystemAlert({ children, className }: ComponentProps) {
  return (
    <div className={cn('w-full flex justify-center my-2', className)}>
      <div className="rounded border border-border/40 bg-muted/20 px-3 py-1 font-mono text-[0.55rem] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
        <span className="size-1 bg-emerald-500 rounded-full animate-ping" />
        <span>{children}</span>
      </div>
    </div>
  )
}
