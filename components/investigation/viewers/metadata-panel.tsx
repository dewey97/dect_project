'use client'

import type { Device } from '@/lib/types'
import { Activity } from 'lucide-react'
import { useSettings } from '@/components/investigation/settings-context'

interface MetadataPanelProps {
  device: Device
}

export function MetadataPanel({ device }: MetadataPanelProps) {
  const { showTechDetails } = useSettings()
  const kindLabel = device.kind.toUpperCase()

  if (!showTechDetails) return null

  return (
    <div className="rounded-lg border border-border/50 bg-card/25 p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between border-b border-border/30 pb-1.5">
        <span className="font-mono text-[0.625rem] text-primary font-bold uppercase tracking-widest flex items-center gap-1">
          <Activity className="size-3.5" /> CHỈ SỐ HỆ THỐNG // {kindLabel}
        </span>
        <span className="font-mono text-[0.55rem] text-muted-foreground uppercase">SYS_REV // 4.10a</span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[0.65rem] font-mono">
        <div className="flex justify-between border-b border-border/10 pb-0.5">
          <span className="text-muted-foreground">DÒNG MÁY:</span>
          <span className="text-foreground">{device.label}</span>
        </div>
        <div className="flex justify-between border-b border-border/10 pb-0.5">
          <span className="text-muted-foreground">HỆ ĐIỀU HÀNH:</span>
          <span className="text-foreground">D-OS 8.4.1</span>
        </div>
        <div className="flex justify-between border-b border-border/10 pb-0.5">
          <span className="text-muted-foreground">IMEI/UUID:</span>
          <span className="text-foreground">359902100486{device.evidenceId.replace('-', '')}</span>
        </div>
        <div className="flex justify-between border-b border-border/10 pb-0.5">
          <span className="text-muted-foreground">TRẠNG THÁI SIM:</span>
          <span className="text-emerald-500">ĐÃ_PHÁT_HIỆN_SIM</span>
        </div>
      </div>
    </div>
  )
}
