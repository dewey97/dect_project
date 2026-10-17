import { DeviceSimulatorClient } from '@/components/investigation/device-simulator-client'
import type { Case, Device } from '@/lib/types'

const ACTIVE_CASE_000: Case = {
  id: 'case-000',
  code: 'TEST-99',
  title: 'Trốn Tìm',
  logline: 'Một vụ án mạng xảy ra tại căn nhà chuẩn bị giải tỏa, mở ra những mâu thuẫn tranh chấp thừa kế và bí mật quá khứ đen tối.',
  briefing: 'Liệu bí mật nào đang ẩn sau cái chết của Khang. Trò chơi trốn tìm có liên quan gì? Hãy bóc tách từng manh mối nhỏ nhất để tìm ra lời giải cho vụ án hóc búa này.',
  objective: 'Phân tích di chúc bị tráo, hồ sơ đo đạc sai lệch và tìm ra thủ phạm sát hại Khang.',
  estimatedTime: '60-90 phút',
  status: 'active',
  difficulty: 2,
  progress: 0,
  location: 'Khu giải tỏa Bờ Sông',
  coverImage: '/poster_c0.png'
}

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
  const activeCase = ACTIVE_CASE_000

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

