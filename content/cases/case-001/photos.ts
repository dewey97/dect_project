import { Photo } from '@/lib/types'

export const photos001: Record<string, Photo[]> = {
  'dev-01': [
    { id: 'p1', filename: 'IMG_0089.JPG', size: '1.4MB', location: 'Cổng Cầu cảng số 9', status: 'recovered' },
    { id: 'p2', filename: 'IMG_0090.JPG', size: 'LỖI_TÍNH_TOÀN_VẸN', location: 'Không rõ', status: 'corrupted' },
    { id: 'p3', filename: 'IMG_0091.PNG.ENC', size: 'YÊU_CẦU_MÃ_PIN', location: 'Không rõ', status: 'encrypted' },
  ]
}
