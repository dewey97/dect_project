import { HelpCircle, User, MapPin, Package, Clock } from 'lucide-react'
import type { TraceCard } from '@/lib/types'
import { cn } from '@/lib/utils'

const CATEGORY_ICON: Record<TraceCard['category'], typeof User> = {
  suspect: User,
  location: MapPin,
  object: Package,
  event: Clock,
}

function TraceTile({ card }: { card: TraceCard }) {
  const Icon = card.collected ? CATEGORY_ICON[card.category] : HelpCircle
  return (
    <article
      className={cn(
        'relative flex flex-col rounded-lg border p-4',
        card.collected
          ? 'border-border bg-card'
          : 'border-dashed border-border bg-card/40',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="label-system">{card.code}</span>
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-md',
            card.collected ? 'bg-primary/15 text-primary' : 'bg-accent text-muted-foreground',
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <h2 className="mt-3 text-sm font-semibold leading-tight">
        {card.collected ? card.name : 'Undiscovered'}
      </h2>
      <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
        {card.collected ? card.description : 'Collect this Trace during play to reveal it.'}
      </p>
    </article>
  )
}

interface TracePanelProps {
  cards: TraceCard[]
  className?: string
}

export function TracePanel({ cards, className }: TracePanelProps) {
  const collected = cards.filter((c) => c.collected).length

  return (
    <div className={className}>
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <span className="label-system">Collected</span>
        <span className="font-mono text-sm">
          <span className="text-primary">{collected}</span>
          <span className="text-muted-foreground"> / {cards.length}</span>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <TraceTile key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}
