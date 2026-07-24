'use client'

import { Shield, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/components/investigation/settings-context'

interface IntegrityIndicatorProps {
  recoveredBy: string
  timestamp: string
  integrityStatus: 'secured' | 'corrupted' | 'analyzing'
  chainOfCustody: string
  className?: string
}

export function IntegrityIndicator({
  recoveredBy,
  timestamp,
  integrityStatus,
  chainOfCustody,
  className
}: IntegrityIndicatorProps) {
  const { showTechDetails } = useSettings()

  if (!showTechDetails) return null

  const INTEGRITY_TRANSLATIONS = {
    secured: 'AN TOÀN',
    analyzing: 'ĐANG PHÂN TÍCH',
    corrupted: 'BỊ HỎNG'
  }

  return (
    <div className={cn(
      'rounded-lg border border-border/50 bg-card/20 p-3 flex flex-col gap-2 font-mono text-[0.6rem] text-muted-foreground',
      className
    )}>
      <div className="flex items-center justify-between border-b border-border/20 pb-1.5">
        <span className="font-bold text-foreground tracking-wider uppercase flex items-center gap-1">
          <Shield className="size-3.5 text-primary" /> NHẬT KÝ GIÁM SÁT TANG VẬT
        </span>
        <span className={cn(
          'text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded border',
          integrityStatus === 'secured' && 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
          integrityStatus === 'analyzing' && 'text-primary border-primary/20 bg-primary/5',
          integrityStatus === 'corrupted' && 'text-destructive border-destructive/20 bg-destructive/5'
        )}>
          TOÀN VẸN: {INTEGRITY_TRANSLATIONS[integrityStatus]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[0.625rem]">
        <div>
          <span className="block text-muted-foreground/75">SĨ QUAN PHÁP Y:</span>
          <span className="text-foreground font-semibold">{recoveredBy}</span>
        </div>
        <div className="text-right">
          <span className="block text-muted-foreground/75">THỜI GIAN GHI NHẬN:</span>
          <span className="text-foreground font-semibold flex items-center justify-end gap-1">
            <Clock className="size-3 text-primary shrink-0" /> {timestamp}
          </span>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-1.5 text-[0.55rem] font-bold text-emerald-500 border-t border-border/10 pt-1.5 justify-between">
        <span>XÁC MINH BẢO MẬT HASH: KHỚP_SHA256_OK</span>
        <span className="flex items-center gap-0.5 uppercase">
          <CheckCircle2 className="size-3" /> {chainOfCustody}
        </span>
      </div>
    </div>
  )
}
