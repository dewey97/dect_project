'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Layers, Box } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { Hotspot3D } from './scene-360-viewer'
import { CrimeSceneRoom3D, RoomHotspot } from './crime-scene-room-3d'

interface ReinvestigationModalProps {
  isOpen: boolean
  onClose: () => void
}

const HOTSPOTS_3D: Hotspot3D[] = [
  {
    id: 'spot-1',
    yaw: 70,
    pitch: 6,
    title: 'GÓC CỬA SỔ PHÍA SAU — HƯỚNG ĐƯỜNG RAY TÀU',
    caption: 'Ảnh hiện trường #01-KX: Góc nhìn trực diện ra cột đèn tín hiệu đường sắt',
    detail: 'Từ cửa sổ phòng khách nhìn thẳng ra cột đèn ray tàu cách 150m. Thời điểm 20:30 đêm xảy ra vụ án, tiếng còi tàu hỏa rúc lớn trùng khớp với bản thu âm trong máy tính của Khang.',
    imageUrl: '/images/cases/case_000/trontim.jpg'
  },
  {
    id: 'spot-2',
    yaw: -115,
    pitch: -12,
    title: 'CỬA CHÍNH — BẬC THỀM & HƯỚNG GỐC XOAN',
    caption: 'Ảnh hiện trường #02-KX: Dấu vết phấn hoa xoan và vệt nước mưa',
    detail: 'Cửa chính hé mở. Bậc thềm còn lưu lại vệt nước mưa và bột phấn hoa xoan bám dính — đặc điểm trùng khớp với chiếc áo gió màu xám đen thu được.',
    imageUrl: '/images/cases/case_000/photo_cheating_sms.jpg'
  },
  {
    id: 'spot-3',
    yaw: 8,
    pitch: -20,
    title: 'BÀN TRÀ TRUNG TÂM — DẤU VẾT XÔ XÁT',
    caption: 'Ảnh hiện trường #03-KX: Ấm chén vỡ và vết xô xát vật lộn',
    detail: 'Bộ ấm chén gốm vỡ trên sàn gạch, ghế mây bị xô lệch khoảng 40cm. Nạn nhân đã xảy ra xô xát giằng co với ai đó trước thời điểm tử vong.',
    imageUrl: '/images/cases/case_000/avatar_khang.jpg'
  },
  {
    id: 'spot-4',
    yaw: 145,
    pitch: -6,
    title: 'KHE TỦ GỖ LIM GẦN GÓC PHÒNG',
    caption: 'Ảnh hiện trường #04-KX: Khe tủ hé mở có dấu vết người ẩn nấp',
    detail: 'Khe tủ gỗ lim hé mở khoảng 5cm. Bên trong phát hiện dấu vải cọ xát và dấu vân tay mờ — có người đã nấp bên trong quan sát toàn bộ diễn biến.',
    imageUrl: '/images/cases/case_000/wardrobe_eyes.jpg'
  },
  {
    id: 'spot-5',
    yaw: -68,
    pitch: -28,
    title: 'GIỎ RÁC NHỰA CẠNH CỬA RA VÀO',
    caption: 'Ảnh hiện trường #05-KX: Cuống vé xe khách liên tỉnh bị vò nát',
    detail: 'Dưới đáy giỏ rác thu giữ 01 cuống vé xe khách liên tỉnh tuyến Hà Nội — Nam Định có ghi thời gian xuất bến, làm bộc lộ lịch trình di chuyển thực tế.',
    imageUrl: '/images/cases/case_000/cuong_ve_xe_tung.png'
  }
]

export function ReinvestigationModal({ isOpen, onClose }: ReinvestigationModalProps) {
  const [selectedSpot, setSelectedSpot] = useState<Hotspot3D | RoomHotspot | null>(null)
  const [viewMode, setViewMode] = useState<'room3d' | 'flat2d'>('room3d')
  const container2DRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const handleSpotClick = (spot: Hotspot3D | RoomHotspot) => {
    detectiveAudio.playTypewriterClick()
    setSelectedSpot(spot)
  }

  const handleCloseDetail = () => {
    detectiveAudio.playPaperRustle()
    setSelectedSpot(null)
  }

  return (
    <div className="fixed inset-0 bg-[#140e0a] z-50 flex flex-col font-mono text-[#f4e8d8] select-none overflow-hidden w-screen h-[100dvh]">
      <div className="w-full h-full flex flex-col relative overflow-hidden">
        {/* TOP STATUS BAR */}
        <div className="relative z-30 bg-[#1e130a]/95 border-b border-[#3d2716] px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center bg-[#0d0906] border border-[#593c26] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('room3d')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'room3d'
                    ? 'bg-[#5c371d] text-amber-300 shadow border border-amber-600/40'
                    : 'text-[#8c6a48] hover:text-[#d9a066]'
                }`}
              >
                <Box className="size-3.5" />
                <span>Phòng 3D</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('flat2d')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'flat2d'
                    ? 'bg-[#5c371d] text-amber-300 shadow border border-amber-600/40'
                    : 'text-[#8c6a48] hover:text-[#d9a066]'
                }`}
              >
                <Layers className="size-3.5" />
                <span>Ảnh 2D</span>
              </button>
            </div>
          </div>

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={() => {
              detectiveAudio.playPaperRustle()
              onClose()
            }}
            className="p-1.5 bg-[#2d1b10] hover:bg-[#422918] border border-[#593c26] text-[#d9a066] hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Đóng khám xét"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* MAIN DISPLAY AREA */}
        <div className="relative flex-1 w-full h-full overflow-hidden bg-black">
          {viewMode === 'room3d' && (
            <CrimeSceneRoom3D onSelectSpot={handleSpotClick} />
          )}

          {viewMode === 'flat2d' && (
            <div ref={container2DRef} className="relative w-full h-full bg-[#0a0705] flex items-center justify-center overflow-hidden">
              <img
                src="/images/cases/case_000/photo-reinvestigation-room-realistic.jpg"
                alt="Ảnh hiện trường khám xét lại 2D"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

