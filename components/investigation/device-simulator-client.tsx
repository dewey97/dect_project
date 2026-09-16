'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Cpu, Lock, AlertCircle } from 'lucide-react'
import { useCheckpoints } from '@/components/investigation/checkpoints-context'
import { PhoneSimulator } from '@/components/investigation/phone-simulator'
import { EvidenceHeader } from '@/components/investigation/viewers/evidence-header'
import { MetadataPanel } from '@/components/investigation/viewers/metadata-panel'
import { RecoveryStatusPanel } from '@/components/investigation/viewers/recovery-status-panel'
import { IntegrityIndicator } from '@/components/investigation/viewers/integrity-indicator'
import type { Case, Device, Conversation, Photo, Email, Document, BrowserHistory, RecoveredFile } from '@/lib/types'

interface DeviceSimulatorClientProps {
  activeCase?: Case
  device: Device
  threads: Conversation[]
  photos: Photo[]
  emails: Email[]
  notes: Document[]
  history: BrowserHistory[]
  files: RecoveredFile[]
}

export function DeviceSimulatorClient({
  activeCase,
  device,
  threads,
  photos,
  emails,
  notes,
  history,
  files
}: DeviceSimulatorClientProps) {
  const router = useRouter()
  const { isDeviceLockedByCheckpoint } = useCheckpoints()

  // Check if device is locked by Checkpoints
  const isLocked = activeCase ? isDeviceLockedByCheckpoint(activeCase.id, device.id) : false

  if (isLocked) {
    return (
      <div suppressHydrationWarning className="pb-6 px-4 flex flex-col gap-6">
        <div className="pt-4">
          <Link
            href="/evidence"
            className="flex items-center gap-1.5 font-sans text-[0.65rem] text-primary uppercase tracking-wider hover:-translate-x-0.5 active:scale-95 transition-all w-fit"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại Kho Vật chứng
          </Link>
        </div>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center text-center p-12 relative overflow-hidden min-h-[350px]">
          <div className="flex size-14 items-center justify-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20 mb-5 z-10 animate-pulse">
            <Lock className="size-7" />
          </div>

          <h3 className="font-sans text-sm font-bold text-destructive uppercase tracking-widest z-10 flex items-center gap-1.5">
            <AlertCircle className="size-4" /> TRUY CẬP BỊ TỪ CHỐI // THIẾT BỊ ĐANG KHÓA
          </h3>

          <p className="mt-3 text-pretty text-xs text-muted-foreground max-w-[320px] leading-relaxed z-10 font-sans">
            Thiết bị này ({device.label}) hiện đang bị khóa mật mã an ninh. Bạn cần thu thập đủ bằng chứng và hoàn thành câu hỏi chặng liên quan trong phần <strong>Mục tiêu (Checkpoints)</strong> để mở khóa thiết bị này.
          </p>

          <button
            onClick={() => router.push('/checkpoints')}
            className="mt-6 font-mono text-xs uppercase tracking-wider border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 px-5 py-2.5 rounded font-bold transition-all z-10 active:scale-95"
          >
            Đi đến Checkpoints
          </button>
        </div>
      </div>
    )
  }

  // Render high-fidelity simulator for phone
  if (device.kind === 'phone') {
    return (
      <div suppressHydrationWarning className="w-full h-full overflow-hidden">
        <PhoneSimulator
          device={device}
          threads={threads}
          photos={photos}
          emails={emails}
          notes={notes}
          history={history}
          files={files}
        />
      </div>
    )
  }

  return (
    <div suppressHydrationWarning className="pb-10 px-4 flex flex-col gap-5">
      <div className="pt-2">
        <Link
          href="/evidence"
          className="flex items-center gap-1.5 font-sans text-[0.65rem] text-primary uppercase tracking-wider hover:-translate-x-0.5 active:scale-95 transition-all w-fit"
        >
          <ArrowLeft className="size-3.5" />
          Quay lại Kho Vật chứng
        </Link>
      </div>

      {/* 1. Evidence Header */}
      <EvidenceHeader device={device} />

      {/* 2. Metadata Panel */}
      <MetadataPanel device={device} />

      {/* 3. Recovered Content Placeholder (Reconstruction warning) */}
      <div className="min-h-[260px] rounded-xl border border-dashed border-border/80 bg-card/10 flex flex-col items-center justify-center text-center p-8 relative">
        <div className="flex size-12 items-center justify-center rounded bg-accent/40 text-primary border border-primary/20 mb-4 z-10 animate-pulse">
          <Cpu className="size-6 text-primary" />
        </div>

        <span className="font-sans text-xs font-bold text-foreground uppercase tracking-widest z-10">
          ĐANG PHỤC HỒI DỮ LIỆU TÀI LIỆU
        </span>

        <p className="mt-2 text-pretty text-xs text-muted-foreground max-w-[260px] leading-relaxed z-10 font-sans">
          Thiết bị này đang được tiến hành phân tích nghiệp vụ. Các tệp tin, hình ảnh và lịch sử liên lạc sẽ được tự động hiển thị đầy đủ khi hoàn tất.
        </p>

        <span className="font-sans text-[0.6rem] text-primary mt-4 border border-primary/30 bg-primary/5 rounded px-2 py-0.5 animate-pulse z-10">
          THỜI GIAN DỰ KIẾN: 5 PHÚT
        </span>
      </div>

      {/* 4. Recovery Status Panel */}
      <RecoveryStatusPanel
        progress={device.recoveryLevel}
        statusText="ĐANG TRÍCH XUẤT DỮ LIỆU"
      />

      {/* 5. Chain of Custody / Integrity Indicator */}
      <IntegrityIndicator
        recoveredBy="ĐTV. NOCTURNE"
        timestamp={device.lastUpdated}
        integrityStatus={device.recoveryLevel === 100 ? 'secured' : 'analyzing'}
        chainOfCustody="BIÊN BẢN HỢP LỆ"
      />
    </div>
  )
}
