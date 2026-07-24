'use client'

import type { Device } from '@/lib/types'
import { Unlock, Lock, Battery, Shield, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/components/investigation/settings-context'

interface EvidenceHeaderProps {
  device: Device
}

export function EvidenceHeader({ device }: EvidenceHeaderProps) {
  const isLocked = device.status === 'locked'
  const { showTechDetails } = useSettings()

  return (
    <div className="rounded-xl border border-primary/30 bg-card/65 p-4 shadow-[0_0_20px_rgba(199,145,55,0.05)] relative overflow-hidden">
      {showTechDetails && (
        <div className="absolute top-0 right-0 h-4 bg-primary/10 border-l border-b border-primary/20 px-3 py-0.5 rounded-bl font-mono text-[0.55rem] text-primary tracking-widest uppercase">
          ẢNH PHÁP Y HOẠT ĐỘNG
        </div>
      )}

      <div className={cn(
        "grid gap-4 mt-2",
        showTechDetails ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"
      )}>
        <div>
          <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">MÃ SỐ VẬT CHỨNG</span>
          <span className="font-mono text-sm font-bold text-foreground">{device.evidenceId}</span>
        </div>
        <div>
          <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">CHỦ THIẾT BỊ</span>
          <span className="font-sans text-sm font-bold text-foreground">{device.owner}</span>
        </div>
        <div>
          <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">PHƯƠNG THỨC GIẢI MÃ</span>
          <span className="font-mono text-xs font-semibold text-emerald-500 uppercase flex items-center gap-1 mt-0.5">
            {isLocked ? (
              <span className="text-destructive flex items-center gap-1">
                <Lock className="size-3" /> KHÓA_BẢO_MẬT
              </span>
            ) : (
              <span className="text-emerald-500 flex items-center gap-1">
                <Unlock className="size-3" /> ĐÃ_VƯỢT_PIN
              </span>
            )}
          </span>
        </div>
        {showTechDetails && (
          <div className="flex flex-col">
            <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">PIN KHI THU GIỮ</span>
            <span className="font-mono text-sm font-bold text-destructive flex items-center gap-1">
              <Battery className="size-4 shrink-0 text-destructive rotate-90" />
              12% [YẾU]
            </span>
          </div>
        )}
      </div>

      {/* Chain of Custody / Integrity details */}
      {showTechDetails && (
        <div className="mt-4 pt-3.5 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-3 text-[0.65rem] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="size-3.5 text-emerald-500 shrink-0" />
            <span>KIỂM TRA TOÀN VẸN: <span className="text-emerald-500 font-bold">KHỚP MÃ HẤP SHA-256 (SECURED)</span></span>
          </div>
          <div className="flex items-center gap-1.5 md:justify-end">
            <Clock className="size-3.5 text-primary shrink-0" />
            <span>ĐỒNG BỘ LẦN CUỐI: <span className="text-foreground">{device.lastUpdated}</span></span>
          </div>
        </div>
      )}
    </div>
  )
}
