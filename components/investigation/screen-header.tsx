import type { ReactNode } from 'react'

interface ScreenHeaderProps {
  /** System code shown as an eyebrow, e.g. "CASE FILES". */
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}

/** Consistent title block used at the top of every OS screen. */
export function ScreenHeader({
  eyebrow,
  title,
  description,
  action,
}: ScreenHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 pt-2 pb-2">
      <div className="min-w-0">
        {eyebrow && <p className="label-system text-primary">{eyebrow}</p>}
        <h1 className="mt-1 text-balance font-sans text-2xl font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </div>
  )
}
