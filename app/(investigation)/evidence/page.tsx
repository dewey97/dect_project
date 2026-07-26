'use client'

import { useState, useEffect } from 'react'
import { getActiveCase, getDevices, getEvidence } from '@/lib/mock-data'
import { ScreenHeader } from '@/components/investigation/screen-header'
import { EvidenceDeviceCard } from '@/components/investigation/evidence-device-card'
import { EvidenceItemCard } from '@/components/investigation/evidence-item-card'
import { EmptyState } from '@/components/investigation/empty-state'
import { useCheckpoints } from '@/components/investigation/checkpoints-context'
import type { Case, Device, Evidence } from '@/lib/types'
import { ShieldAlert, Cpu, FileText, Mic, MapPin, Lock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function EvidencePage() {
  const [activeCase, setActiveCase] = useState<Case | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const { isDeviceLockedByCheckpoint } = useCheckpoints()

  useEffect(() => {
    async function loadData() {
      const currentCase = await getActiveCase()
      if (currentCase) {
        setActiveCase(currentCase)
        const devs = await getDevices(currentCase.id)
        const evids = await getEvidence(currentCase.id)
        setDevices(devs)
        setEvidence(evids)
      }
    }
    loadData()
  }, [])

  // Group evidence into categories
  const documents = evidence.filter(
    (e) => e.kind === 'document' || e.kind === 'email' || e.kind === 'message'
  )
  const audioEvidence = evidence.filter((e) => e.kind === 'voice')
  const locationEvidence = evidence.filter((e) => e.kind === 'gps')

  const hasAnyEvidence =
    devices.length > 0 ||
    documents.length > 0 ||
    audioEvidence.length > 0 ||
    locationEvidence.length > 0

  if (!activeCase || !hasAnyEvidence) {
    return (
      <div className="pb-6">
        <ScreenHeader
          eyebrow="Tủ Vật Chứng"
          title="Phòng Vật Chứng"
          description="Nơi lưu trữ các tài liệu điều tra và tang vật thu giữ."
        />
        <EmptyState
          icon={ShieldAlert}
          title="Chưa Có Vật Chứng"
          description="Chưa có tài liệu hoặc thiết bị vật chứng nào được thu thập."
        />
      </div>
    )
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Kho Tài Liệu & Vật Chứng"
        description="Xem xét các thiết bị vật chứng, hồ sơ văn bản, ghi âm và dấu vết di chuyển thu thập được."
      />

      <div className="flex flex-col gap-6 px-4">
        
        {/* Category 1: Digital Devices */}
        {devices.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <Cpu className="size-4 text-primary" />
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-foreground">
                Thiết bị vật chứng ({devices.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {devices.map((device) => {
                const isLocked = isDeviceLockedByCheckpoint(activeCase.id, device.id)
                const displayDevice = isLocked
                  ? {
                      ...device,
                      status: 'locked' as const,
                      locked: true,
                      previewStats: 'YÊU CẦU GIẢI QUYẾT CHECKPOINT'
                    }
                  : device

                if (isLocked) {
                  return (
                    <div key={device.id} className="relative select-none cursor-not-allowed">
                      <EvidenceDeviceCard device={displayDevice} />
                      <div className="absolute top-2 right-2 bg-destructive/10 border border-destructive/20 text-destructive text-[0.55rem] font-sans font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Lock className="size-3" />
                        ĐANG KHÓA CẦN MỞ KHÓA
                      </div>
                    </div>
                  )
                }

                return (
                  <Link key={device.id} href={`/evidence/${device.id}`}>
                    <EvidenceDeviceCard device={displayDevice} />
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Category 2: Documents */}
        {documents.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <FileText className="size-4 text-primary" />
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-foreground">
                Tài liệu & Thư từ ({documents.length})
              </h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {documents.map((item) => (
                <EvidenceItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Category 3: Audio Evidence */}
        {audioEvidence.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <Mic className="size-4 text-primary" />
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-foreground">
                Tệp ghi âm ({audioEvidence.length})
              </h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {audioEvidence.map((item) => (
                <EvidenceItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Category 4: Location Evidence */}
        {locationEvidence.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <MapPin className="size-4 text-primary" />
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-foreground">
                Dấu vết di chuyển ({locationEvidence.length})
              </h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {locationEvidence.map((item) => (
                <EvidenceItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
