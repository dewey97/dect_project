import type { EvidenceDevice, Evidence, Case } from '@/lib/types'
import { EvidenceDeviceCard } from '@/components/investigation/evidence-device-card'
import { EvidenceItemCard } from '@/components/investigation/evidence-item-card'
import { EmptyState } from '@/components/investigation/empty-state'
import { ShieldAlert, Cpu, FileText, Mic, MapPin } from 'lucide-react'
import Link from 'next/link'

interface EvidencePanelProps {
  activeCase?: Case
  devices: EvidenceDevice[]
  evidence: Evidence[]
  className?: string
}

export function EvidencePanel({ activeCase, devices, evidence, className }: EvidencePanelProps) {
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
      <div className={className}>
        <EmptyState
          icon={ShieldAlert}
          title="Forensics Offline"
          description="No digital evidence has been recovered."
        />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-6">
        
        {/* Category 1: Digital Devices */}
        {devices.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <Cpu className="size-4 text-primary" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Digital Devices ({devices.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {devices.map((device) => (
                <Link key={device.id} href={`/evidence/${device.id}`}>
                  <EvidenceDeviceCard device={device} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Category 2: Documents */}
        {documents.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <FileText className="size-4 text-primary" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Documents ({documents.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Audio Evidence ({audioEvidence.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Location Evidence ({locationEvidence.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
