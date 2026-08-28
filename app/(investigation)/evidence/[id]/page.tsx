'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getDevice,
  getDeviceConversations,
  getDevicePhotos,
  getDeviceEmails,
  getDeviceDocuments,
  getDeviceBrowserHistory,
  getDeviceFiles
} from '@/lib/content-service'
import { getActiveCase } from '@/lib/mock-data'
import { PhoneSimulator } from '@/components/investigation/phone-simulator'
import { EvidenceHeader } from '@/components/investigation/viewers/evidence-header'
import { MetadataPanel } from '@/components/investigation/viewers/metadata-panel'
import { RecoveryStatusPanel } from '@/components/investigation/viewers/recovery-status-panel'
import { IntegrityIndicator } from '@/components/investigation/viewers/integrity-indicator'
import { EmptyState } from '@/components/investigation/empty-state'
import { useCheckpoints } from '@/components/investigation/checkpoints-context'
import { ArrowLeft, Cpu, ShieldAlert, Lock, AlertCircle } from 'lucide-react'
import type { Case, Device, Conversation, Photo, Email, Document, BrowserHistory, RecoveredFile } from '@/lib/types'
import Link from 'next/link'

export default function DeviceSimulatorPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [activeCase, setActiveCase] = useState<Case | null>(null)
  const [device, setDevice] = useState<Device | null>(null)
  const [threads, setThreads] = useState<Conversation[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [emails, setEmails] = useState<Email[]>([])
  const [notes, setNotes] = useState<Document[]>([])
  const [history, setHistory] = useState<BrowserHistory[]>([])
  const [files, setFiles] = useState<RecoveredFile[]>([])
  const [loading, setLoading] = useState(true)

  const { isDeviceLockedByCheckpoint } = useCheckpoints()

  useEffect(() => {
    async function loadDeviceData() {
      if (!id) return
      
      const currentCase = await getActiveCase()
      setActiveCase(currentCase || null)

      const dev = await getDevice(id)
      if (dev) {
        setDevice(dev)
        const [t, p, e, n, h, f] = await Promise.all([
          getDeviceConversations(id),
          getDevicePhotos(id),
          getDeviceEmails(id),
          getDeviceDocuments(id),
          getDeviceBrowserHistory(id),
          getDeviceFiles(id)
        ])
        setThreads(t)
        setPhotos(p)
        setEmails(e)
        setNotes(n)
        setHistory(h)
        setFiles(f)
      }
      setLoading(false)
    }
    loadDeviceData()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center font-sans text-xs text-primary animate-pulse">
        ĐANG TẢI DỮ LIỆU VẬT CHỨNG...
      </div>
    )
  }

  if (!device) {
    return (
      <div className="pb-6 px-4">
        <div className="pt-4">
          <Link
            href="/evidence"
            className="flex items-center gap-1.5 font-sans text-[0.65rem] text-primary uppercase tracking-wider hover:-translate-x-0.5 active:scale-95 transition-all w-fit"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại Kho Vật chứng
          </Link>
        </div>
        <EmptyState
          icon={ShieldAlert}
          title="Không tìm thấy vật chứng"
          description="Vật chứng yêu cầu không tồn tại trong sổ đăng ký tiếp nhận."
        />
      </div>
    )
  }

  // Check if device is locked by Checkpoints
  const isLocked = activeCase ? isDeviceLockedByCheckpoint(activeCase.id, device.id) : false

  if (isLocked) {
    return (
      <div className="pb-6 px-4 flex flex-col gap-6">
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
      <PhoneSimulator
        device={device}
        threads={threads}
        photos={photos}
        emails={emails}
        notes={notes}
        history={history}
        files={files}
      />
    )
  }

  return (
    <div className="pb-10 px-4 flex flex-col gap-5">
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
        statusText={`ĐANG TRÍCH XUẤT DỮ LIỆU`}
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
