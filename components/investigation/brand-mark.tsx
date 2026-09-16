import { cn } from '@/lib/utils'

/**
 * The NOCTURNE wordmark: an evidence-amber status dot beside the mono
 * wordmark. Shared so the brand reads identically everywhere (see
 * PROJECT_RULES.md §6 typography — `.label-brand`).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
      <span className="label-brand text-foreground">Nocturne</span>
    </div>
  )
}
