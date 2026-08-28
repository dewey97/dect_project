import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-muted/65',
        className
      )}
    />
  )
}

export function EvidenceSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Devices Section Skeleton */}
      <div>
        <Skeleton className="h-4 w-28 mb-3" />
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3"
            >
              <Skeleton className="size-10 rounded-md shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Section Skeleton */}
      <div>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3"
            >
              <Skeleton className="size-10 rounded-md shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="size-4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TraceSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-4 w-24 mb-1" />
      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card/50 p-4 flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AssistantSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 h-[60vh] justify-end">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'flex flex-col max-w-[80%] gap-1.5',
            i % 2 === 0 ? 'self-end items-end' : 'self-start items-start'
          )}
        >
          <Skeleton className="h-3 w-16" />
          <div
            className={cn(
              'rounded-lg p-3 w-full min-w-[150px] border',
              i % 2 === 0
                ? 'bg-primary/5 border-primary/20'
                : 'bg-card/50 border-border'
            )}
          >
            <Skeleton className="h-3 w-full mb-1.5" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  )
}
