'use client'

import type { ReactNode } from 'react'
import { Terminal, KeyRound, AlertOctagon, HelpCircle, Link as LinkIcon, FileCheck2, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ComponentProps {
  children: ReactNode
  className?: string
}

// 1. AssistantMessage (Messenger Received Bubble style)
export function AssistantMessage({ children, className }: ComponentProps) {
  return (
    <div className={cn('flex flex-col gap-1 max-w-[85%] self-start bg-muted/90 text-foreground p-3 rounded-2xl rounded-tl-sm shadow-sm font-sans text-xs leading-relaxed', className)}>
      <p>{children}</p>
    </div>
  )
}

// 2. DetectiveAction (Messenger Sent Bubble style)
export function DetectiveAction({ children, className }: ComponentProps) {
  return (
    <div className={cn('flex flex-col gap-1 max-w-[80%] self-end bg-primary text-background p-3 rounded-2xl rounded-tr-sm shadow-sm font-sans text-xs leading-relaxed text-left', className)}>
      <span>{children}</span>
    </div>
  )
}

// 3. SuggestionChip (Messenger Pill Button style)
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
        'flex items-center justify-center text-center rounded-full border border-primary/20 bg-primary/5 p-3 text-xs font-semibold text-primary transition-all duration-150',
        'hover:-translate-y-0.5 hover:bg-primary/10 active:translate-y-0',
        'disabled:opacity-40 disabled:hover:translate-y-0 disabled:border-border disabled:text-muted-foreground w-full font-sans',
        className
      )}
    >
      <span className="truncate">{label}</span>
    </button>
  )
}

// 4. HintCard (Soft Warning Bubble style)
interface HintCardProps {
  level: 1 | 2 | 3
  hint: string
  className?: string
}

export function HintCard({ level, hint, className }: HintCardProps) {
  const borderColors = {
    1: 'border-amber-200 bg-amber-50/90 text-amber-950 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-200',
    2: 'border-orange-200 bg-orange-50/90 text-orange-950 dark:bg-orange-950/20 dark:border-orange-900/50 dark:text-orange-200',
    3: 'border-rose-200 bg-rose-50/90 text-rose-950 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-200',
  }

  const levelLabels = {
    1: 'Gợi ý cấp 1',
    2: 'Gợi ý cấp 2',
    3: 'Chỉ dẫn trực tiếp',
  }

  return (
    <div className={cn(
      'flex flex-col gap-1.5 max-w-[85%] self-start rounded-2xl rounded-tl-sm border p-3.5 shadow-sm font-sans',
      borderColors[level],
      className
    )}>
      <div className="flex items-center gap-1.5 text-[0.65rem] font-bold tracking-wide uppercase opacity-85">
        <HelpCircle className="size-3.5 shrink-0" />
        <span>{levelLabels[level]}</span>
      </div>
      <p className="text-xs leading-relaxed italic">
        "{hint}"
      </p>
    </div>
  )
}

// 5. EvidenceReference (Messenger Link Share style)
interface EvidenceReferenceProps {
  evidenceId: string
  title: string
  previewText: string
  className?: string
}

export function EvidenceReference({ evidenceId, title, previewText, className }: EvidenceReferenceProps) {
  return (
    <div className={cn('flex flex-col gap-2 max-w-[85%] self-start bg-muted/90 p-3 rounded-2xl rounded-tl-sm shadow-sm font-sans', className)}>
      <span className="text-[0.6rem] text-muted-foreground font-bold tracking-wide uppercase">
        Tài liệu đính kèm
      </span>
      <Link
        href="/evidence"
        className="group flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/70 p-2.5 hover:border-primary/30 transition-colors"
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

// 6. CaseWarning (Messenger Soft Warning Alert style)
export function CaseWarning({ children, className }: ComponentProps) {
  return (
    <div className={cn('flex items-start gap-2.5 max-w-[85%] self-start border border-destructive/20 bg-destructive/5 p-3.5 rounded-2xl rounded-tl-sm shadow-sm font-sans', className)}>
      <AlertOctagon className="size-4 text-destructive shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-[0.6rem] text-destructive uppercase tracking-wide font-bold">
          Cảnh báo hồ sơ
        </span>
        <p className="text-xs leading-relaxed text-foreground">{children}</p>
      </div>
    </div>
  )
}

// 7. RecoveredInformation (Messenger Data Table style)
interface RecoveredInformationProps {
  title: string
  dataRows: { label: string; value: string }[]
  className?: string
}

export function RecoveredInformation({ title, dataRows, className }: RecoveredInformationProps) {
  return (
    <div className={cn('flex flex-col gap-2 max-w-[90%] self-start bg-muted/95 p-3.5 rounded-2xl rounded-tl-sm shadow-md font-sans w-full', className)}>
      <span className="text-[0.6rem] text-primary tracking-wide font-bold flex items-center gap-1">
        <Cpu className="size-3.5 animate-pulse" /> DỮ LIỆU KHÔI PHỤC
      </span>
      <div className="rounded-xl border border-border/60 bg-background/80 p-2.5 flex flex-col gap-1.5">
        <span className="text-[0.6rem] text-muted-foreground uppercase block border-b border-border/20 pb-1 mb-1 font-bold">
          Tệp: {title}
        </span>
        <div className="flex flex-col gap-1 font-sans text-xs leading-normal text-muted-foreground">
          {dataRows.map((row, idx) => (
            <div key={idx} className="flex justify-between gap-4 border-b border-border/10 pb-0.5">
              <span>{row.label}:</span>
              <span className="text-foreground font-semibold">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 8. SystemAlert (Centered Info text style)
export function SystemAlert({ children, className }: ComponentProps) {
  return (
    <div className={cn('w-full flex justify-center my-2', className)}>
      <div className="rounded-full bg-muted/50 px-3 py-1 font-sans text-[0.6rem] text-muted-foreground flex items-center gap-1.5 shadow-sm border border-border/30">
        <span className="size-1.5 bg-emerald-500 rounded-full" />
        <span>{children}</span>
      </div>
    </div>
  )
}
