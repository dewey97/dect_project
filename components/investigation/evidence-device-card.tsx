'use client'

import { Lock, Unlock, ShieldAlert, Cpu, Eye, Hourglass } from 'lucide-react'
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
        'group relative flex flex-col justify-between overflow-hidden rounded-lg border bg-card/45 backdrop-blur-md p-4 transition-all duration-200 cursor-pointer',
        'hover:-translate-y-0.5 hover:rotate-[0.5deg] hover:shadow-md hover:shadow-primary/5 active:translate-y-0 active:rotate-0',
        isLocked && 'border-border/80 opacity-75',
        isUnlocking && 'border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.05)]',
        isAnalyzing && 'border-primary/45 shadow-[0_0_12px_rgba(199,145,55,0.08)]',
        (isUnlocked || isCompleted) && 'border-emerald-500/30'
      )}
    >
      {/* Forensic Scanning Overlay (Only on analyzing/unlocking) */}
      {(isAnalyzing || isUnlocking) && (
        <div className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-0 animate-scan-line" />
      )}

      {/* Case ID / Barcode Tape Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-2.5 z-10">
        <div className="flex flex-col">
          <span className="font-sans text-[0.65rem] font-bold text-primary tracking-wide uppercase">
            Mã bằng chứng: {device.evidenceId}
          </span>
          <span className="font-sans text-[0.55rem] text-muted-foreground mt-0.5">
            Thời gian ghi nhận: {device.lastUpdated}
          </span>
        </div>
      </div>

      {/* Main Info */}
      <div className="mt-3 z-10">
        <h4 className="font-sans text-sm font-bold text-foreground group-hover:text-primary transition-colors">
          {device.label}
        </h4>
        <span className="font-sans text-[0.6rem] text-muted-foreground uppercase">
          Sở hữu: {device.owner}
        </span>
      </div>

      {/* Middle State Status Block */}
      <div className="mt-4 p-2.5 rounded bg-muted/40 border border-border/50 z-10 flex flex-col gap-1.5 min-h-[60px] justify-center">
        {isLocked && (
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-destructive/85 shrink-0" />
            <div className="min-w-0">
              <p className="font-sans text-[0.65rem] font-bold text-destructive uppercase tracking-wider">
                ĐÃ KHÓA MẬT MÃ
              </p>
              <p className="font-sans text-[0.65rem] text-muted-foreground leading-none">
                Yêu cầu giải quyết mục tiêu để mở
              </p>
            </div>
          </div>
        )}

        {isUnlocking && (
          <div className="flex items-center gap-2">
            <Hourglass className="size-4 text-amber-500 animate-spin shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[0.625rem] font-bold text-amber-500 uppercase tracking-wider">
                UNLOCKING
              </p>
              <p className="font-sans text-[0.65rem] text-muted-foreground truncate leading-none">
                {device.previewStats}
              </p>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-primary animate-pulse shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[0.625rem] font-bold text-primary uppercase tracking-wider">
                ANALYZING SECTORS
              </p>
              <p className="font-sans text-[0.65rem] text-muted-foreground truncate leading-none">
                {device.previewStats}
              </p>
            </div>
          </div>
        )}

        {(isUnlocked || isCompleted) && (
          <div className="flex items-center gap-2">
            <Unlock className="size-4 text-emerald-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[0.625rem] font-bold text-emerald-500 uppercase tracking-wider">
                DECRYPTED // ONLINE
              </p>
              <p className="font-sans text-[0.65rem] text-muted-foreground truncate leading-none">
                {device.previewStats}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Progress & Custody Details */}
      <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between z-10 text-[0.6rem] font-mono text-muted-foreground">
        <div>
          <span>RECOVERY: </span>
          <span className={cn(
            'font-bold',
            isCompleted && 'text-emerald-500',
            isLocked && 'text-destructive',
            (isAnalyzing || isUnlocking) && 'text-primary'
          )}>
            {device.recoveryLevel}%
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isLocked ? (
            <span className="text-destructive font-bold text-[0.55rem] tracking-wider">SECURE_LOCK</span>
          ) : isCompleted || isUnlocked ? (
            <span className="text-emerald-500 font-bold text-[0.55rem] tracking-wider flex items-center gap-0.5">
              <Eye className="size-3" />
              INSPECT
            </span>
          ) : (
            <span className="text-primary font-bold text-[0.55rem] tracking-wider">BUSY</span>
          )}
        </div>
      </div>
    </div>
  )
}
