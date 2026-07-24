'use client'

import { cn } from '@/lib/utils'

interface RecoveryStatusPanelProps {
  progress: number
  statusText?: string
  className?: string
}

export function RecoveryStatusPanel({
  progress,
  statusText,
  className
}: RecoveryStatusPanelProps) {
  return (
    <div className={cn(
      'rounded-lg border border-border/60 bg-card/25 p-3 flex flex-col gap-2 font-mono text-[0.65rem] text-muted-foreground',
      className
    )}>
      <div className="flex items-center justify-between font-bold text-foreground">
        <span>TIẾN ĐỘ KHÔI PHỤC PHÁP Y</span>
        <span className="text-primary">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden relative">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        {progress < 100 && progress > 0 && (
          <div className="absolute inset-x-0 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        )}
      </div>

      {statusText && (
        <span className="text-[0.6rem] text-muted-foreground/80 uppercase">
          TRẠNG THÁI PHÂN VÙNG // {statusText}
        </span>
      )}
    </div>
  )
}
