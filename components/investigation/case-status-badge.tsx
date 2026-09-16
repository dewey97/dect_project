import { Lock, Radio, CheckCircle2 } from 'lucide-react'
import type { CaseStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const CONFIG: Record<
  CaseStatus,
  { label: string; icon: typeof Lock; className: string }
> = {
  locked: {
    label: 'Locked',
    icon: Lock,
    className: 'text-muted-foreground border-border',
  },
  active: {
    label: 'Active',
    icon: Radio,
    className: 'text-primary border-primary/40 bg-primary/10',
  },
  solved: {
    label: 'Solved',
    icon: CheckCircle2,
    className: 'text-foreground border-border bg-accent',
  },
  sealed: {
    label: 'Sealed',
    icon: Lock,
    className: 'text-destructive border-destructive/40 bg-destructive/10 animate-pulse-slow',
  },
}

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const { label, icon: Icon, className } = CONFIG[status]
  return (
    <span
      className={cn(
        'label-tag inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}
