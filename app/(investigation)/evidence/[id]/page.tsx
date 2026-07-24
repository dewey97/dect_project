import {
  getDevice,
  getDeviceConversations,
  getDevicePhotos,
  getDeviceEmails,
  getDeviceDocuments,
  getDeviceBrowserHistory,
  getDeviceFiles
} from '@/lib/content-service'
import { PhoneSimulator } from '@/components/investigation/phone-simulator'
import { EvidenceHeader } from '@/components/investigation/viewers/evidence-header'
import { MetadataPanel } from '@/components/investigation/viewers/metadata-panel'
import { RecoveryStatusPanel } from '@/components/investigation/viewers/recovery-status-panel'
import { IntegrityIndicator } from '@/components/investigation/viewers/integrity-indicator'
import { EmptyState } from '@/components/investigation/empty-state'
import { ArrowLeft, Cpu, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DeviceSimulatorPage({ params }: PageProps) {
  const { id } = await params

  // Load device dynamically from Content Engine Loading Layer
  const device = await getDevice(id)

  if (!device) {
    return (
      <div className="pb-6 px-4">
        <div className="pt-4">
          <Link
            href="/evidence"
            className="flex items-center gap-1.5 font-mono text-[0.65rem] text-primary uppercase tracking-wider hover:-translate-x-0.5 active:scale-95 transition-all w-fit"
          >
            <ArrowLeft className="size-3.5" />
            Back to Evidence Locker
          </Link>
        </div>
        <EmptyState
          icon={ShieldAlert}
          title="Device Not Found"
          description="The requested device is not registered in the custody log."
        />
      </div>
    )
  }

  // Load device logs dynamically from Content Engine Loading Layer
  const [threads, photos, emails, notes, history, files] = await Promise.all([
    getDeviceConversations(id),
    getDevicePhotos(id),
    getDeviceEmails(id),
    getDeviceDocuments(id),
    getDeviceBrowserHistory(id),
    getDeviceFiles(id)
  ])

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
          className="flex items-center gap-1.5 font-mono text-[0.65rem] text-primary uppercase tracking-wider hover:-translate-x-0.5 active:scale-95 transition-all w-fit"
        >
          <ArrowLeft className="size-3.5" />
          Back to Evidence Locker
        </Link>
      </div>

      {/* 1. Evidence Header */}
      <EvidenceHeader device={device} />

      {/* 2. Metadata Panel */}
      <MetadataPanel device={device} />

      {/* 3. Recovered Content Placeholder (Reconstruction warning) */}
      <div className="min-h-[260px] rounded-xl border border-dashed border-border/80 bg-card/10 flex flex-col items-center justify-center text-center p-8 relative">
        <div aria-hidden="true" className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-0" />
        
        <div className="flex size-12 items-center justify-center rounded bg-accent/40 text-primary border border-primary/20 mb-4 z-10 animate-pulse">
          <Cpu className="size-6 text-primary" />
        </div>
        
        <span className="font-mono text-xs font-bold text-foreground uppercase tracking-widest z-10">
          SECTOR RECONSTRUCTION IN PROGRESS
        </span>
        
        <p className="mt-2 text-pretty text-xs text-muted-foreground max-w-[260px] leading-relaxed z-10">
          This partition ({device.kind.toUpperCase()}) is currently being decrypted via brute-force dictionary attacks. Reconstructed data blocks will populate upon completion.
        </p>

        <span className="font-mono text-[0.6rem] text-primary mt-4 border border-primary/30 bg-primary/5 rounded px-2 py-0.5 animate-pulse z-10">
          ESTIMATED TIME REMAINING: 4H 12M
        </span>
      </div>

      {/* 4. Recovery Status Panel */}
      <RecoveryStatusPanel
        progress={device.recoveryLevel}
        statusText={`PARTITION BRUTE-FORCE IN PROGRESS`}
      />

      {/* 5. Chain of Custody / Integrity Indicator */}
      <IntegrityIndicator
        recoveredBy="DET. NIGHTJAR"
        timestamp={device.lastUpdated}
        integrityStatus={device.recoveryLevel === 100 ? 'secured' : 'analyzing'}
        chainOfCustody="VERIFIED LOG"
      />
    </div>
  )
}
