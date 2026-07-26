'use client'

import { Lock, Unlock, Cpu, Hourglass } from 'lucide-react'
import type { Device } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EvidenceDeviceCardProps {
  device: Device
  onClick?: () => void
}

export function EvidenceDeviceCard({ device, onClick }: EvidenceDeviceCardProps) {
  const isLocked = device.status === 'locked'
  const isUnlocking = device.status === 'unlocking'
  const isUnlocked = device.status === 'unlocked'
  const isAnalyzing = device.status === 'analyzing'
  const isCompleted = device.status === 'completed'

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-4 overflow-hidden rounded-lg border bg-card/60 backdrop-blur-md p-3 transition-all duration-300 cursor-pointer',
        'hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5 active:translate-y-0',
        isLocked && 'border-border/80 opacity-75',
        isUnlocking && 'border-amber-500/40',
        isAnalyzing && 'border-primary/45',
        (isUnlocked || isCompleted) && 'border-emerald-500/30'
      )}
    >
      {/* Thumbnail Area - Square */}
      <div className={cn(
        "relative size-20 shrink-0 overflow-hidden rounded bg-muted/30 border border-border/40",
        isLocked && "grayscale opacity-80"
      )}>
        {device.thumbnail ? (
          <img
            src={device.thumbnail}
            alt={device.label}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-card">
            <Cpu className="size-8 text-muted-foreground/30" />
          </div>
        )}


      </div>

      {/* Info Section */}
      <div className="flex flex-col min-w-0 flex-1 justify-center">
        <h4 className="font-sans text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
          {device.label}
        </h4>

        {/* Status text / Description */}
        <p className="mt-1.5 font-sans text-[0.7rem] text-muted-foreground line-clamp-3 leading-relaxed">
          {device.description}
          <span className="block mt-0.5 font-semibold">
            {isLocked && "Trạng thái: Đang bị khóa mã bảo mật."}
            {isUnlocking && "Trạng thái: Đang tiến hành bẻ khóa..."}
            {isAnalyzing && "Trạng thái: Đang phân tích dữ liệu..."}
            {(isUnlocked || isCompleted) && "Trạng thái: Đã mở khóa thành công."}
          </span>
        </p>
      </div>
    </div>
  )
}
