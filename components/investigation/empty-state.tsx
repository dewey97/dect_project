import type { ReactNode } from 'react'
import { EyeOff, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: typeof EyeOff
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = EyeOff,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/60 rounded-xl bg-card/10 my-6 mx-4 min-h-[220px]',
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted/30 border border-border/80 text-muted-foreground mb-4">
        <Icon className="size-6 text-muted-foreground/80" aria-hidden="true" />
      </div>
      
      <span className="label-system text-muted-foreground/90 tracking-[0.2em] text-xs">
        {title}
      </span>
      
      <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground/75 max-w-[260px]">
        {description}
      </p>

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
