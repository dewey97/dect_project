import { getActiveCase, getDevices, getEvidence } from '@/lib/mock-data'
import { ScreenHeader } from '@/components/investigation/screen-header'
import { EvidenceDeviceCard } from '@/components/investigation/evidence-device-card'
import { EvidenceItemCard } from '@/components/investigation/evidence-item-card'
import { EmptyState } from '@/components/investigation/empty-state'
import { ShieldAlert, Cpu, FileText, Mic, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function EvidencePage() {
  const activeCase = await getActiveCase()
  const devices = activeCase ? await getDevices(activeCase.id) : []
  const evidence = activeCase ? await getEvidence(activeCase.id) : []

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
          eyebrow="Evidence Locker"
          title="Forensics Lab"
          description="Confiscated digital devices and intelligence files."
        />
        <EmptyState
          icon={ShieldAlert}
          title="Forensics Offline"
          description="No digital evidence has been recovered."
        />
      </div>
    )
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        eyebrow={`FILE: ${activeCase.code}`}
        title="Forensic Workspace"
        description="Review decrypted devices, text records, audio pings, and tracking files."
      />

      <div className="flex flex-col gap-6 px-4">
        
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
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Audio Evidence ({audioEvidence.length})
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
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Location Evidence ({locationEvidence.length})
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
