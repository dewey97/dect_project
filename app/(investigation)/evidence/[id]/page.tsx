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
import { DeviceSimulatorClient } from '@/components/investigation/device-simulator-client'
import { EmptyState } from '@/components/investigation/empty-state'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default async function DeviceSimulatorPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [activeCase, device] = await Promise.all([
    getActiveCase(),
    getDevice(id)
  ])

  if (!device) {
    return (
      <div suppressHydrationWarning className="pb-6 px-4">
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

  const [threads, photos, emails, notes, history, files] = await Promise.all([
    getDeviceConversations(id),
    getDevicePhotos(id),
    getDeviceEmails(id),
    getDeviceDocuments(id),
    getDeviceBrowserHistory(id),
    getDeviceFiles(id)
  ])

  return (
    <DeviceSimulatorClient
      activeCase={activeCase}
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
