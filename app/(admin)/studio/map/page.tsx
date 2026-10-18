import type { Metadata } from 'next'
import { MapStudioClient } from '@/components/admin/map-studio/map-studio-client'

export const metadata: Metadata = {
  title: 'Map Studio | Detective Case System',
  description: 'Biên tập bản đồ vector đa lớp, sông ngòi, đại lộ, đường sắt ray tà-vẹt và 31 tọa độ mốc điều tra Case #000',
}

export const dynamic = 'force-dynamic'

export default function MapStudioPage() {
  return <MapStudioClient />
}
