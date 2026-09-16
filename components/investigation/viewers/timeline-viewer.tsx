'use client'

import { cn } from '@/lib/utils'

export interface TimelineEvent {
  id: string
  time: string
  label: string
  details?: string
  status?: string
  redacted?: boolean
}

interface TimelineViewerProps {
  events: TimelineEvent[]
}

export function TimelineViewer({ events }: TimelineViewerProps) {
  return (
    <div className="flex flex-col gap-2 font-mono text-xs">
      {events.map((event) => (
        <div
          key={event.id}
          className={cn(
            'flex items-start gap-3 rounded border p-2.5',
            event.redacted 
              ? 'border-destructive/25 bg-destructive/5'
              : 'border-border bg-card/40'
          )}
        >
          <span className={cn(
            'select-none',
            event.redacted ? 'text-destructive/80' : 'text-muted-foreground'
          )}>
            {event.time}
          </span>
          <div className="flex-1 min-w-0">
            {event.redacted ? (
              <span className="text-destructive font-bold block truncate select-none">
                {event.label}
              </span>
            ) : (
              <span className="text-primary hover:underline block truncate cursor-pointer">
                {event.label}
              </span>
            )}
            
            {(event.details || event.status) && (
              <span className="text-[0.6rem] text-muted-foreground uppercase block mt-0.5">
                {event.status ? `STATUS // ${event.status}` : ''} {event.details ? `(${event.details})` : ''}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
