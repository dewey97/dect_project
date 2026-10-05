import { getActiveCase } from '@/lib/mock-data'
import { DeviceSimulatorClient } from '@/components/investigation/device-simulator-client'
import type { Device } from '@/lib/types'

const DEFAULT_VICTIM_DEVICE: Device = {
  id: 'dev-000-1',
  caseId: 'case-000',
  evidenceId: 'EV-PHONE-KHANG',
  label: 'iPhone 6s Plus (Vàng Hồng)',
  kind: 'phone',
  owner: 'Nguyễn Văn Khang',
  locked: false,
  status: 'unlocked',
  recoveryLevel: 100,
  lastUpdated: '24/07/2016 // 17:55',
  description: 'Điện thoại cá nhân của nạn nhân Khang'
}

export default async function DeviceSimulatorPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const activeCase = await getActiveCase()

  const device: Device = {
    ...DEFAULT_VICTIM_DEVICE,
    id
  }

  return (
    <DeviceSimulatorClient
      activeCase={activeCase}
      device={device}
      threads={[]}
      photos={[]}
      emails={[]}
      notes={[]}
      history={[]}
      files={[]}
    />
  )
}

