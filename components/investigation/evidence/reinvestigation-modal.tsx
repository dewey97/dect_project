'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MoveHorizontal,
  Volume2,
  FileSearch,
  Eye,
  Box,
  Layers
} from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { CrimeSceneRoom3D, RoomHotspot } from './crime-scene-room-3d'

interface ReinvestigationModalProps {
  isOpen: boolean
  onClose: () => void
}

export interface ReinvestigationHotspot2D {
  id: string
  num: number
  x: number // percentage 0-100
  y: number // percentage 0-100
  shortName: string
  title: string
  caption: string
  detail: string
  imageUrl?: string
  soundType?: 'train' | 'shatter' | 'paper' | 'default'
}

// 8 ĐIỂM KHÁM XÉT CHI TIẾT TRÊN ẢNH 2D PHÒNG KHÁCH
export const HOTSPOTS_2D_LIST: ReinvestigationHotspot2D[] = [
  {
    id: 'spot-1',
    num: 1,
    x: 74,
    y: 34,
    shortName: 'Cửa sổ ray tàu',
    title: 'GÓC CỬA SỔ PHÍA ĐÔNG — HƯỚNG ĐƯỜNG RAY TÀU',
    caption: 'Ảnh hiện trường #01-KX: Góc nhìn trực diện ra cột đèn tín hiệu đường sắt',
    detail: 'Từ cửa sổ phòng khách nhìn thẳng ra cột đèn ray tàu cách 150m. Thời điểm 20:30 đêm xảy ra vụ án, tiếng còi tàu hỏa rúc lớn trùng khớp với bản thu âm trong máy tính của Khang.',
    imageUrl: '/images/cases/case_000/trontim.jpg',
    soundType: 'train'
  },
  {
    id: 'spot-2',
    num: 2,
    x: 24,
    y: 60,
    shortName: 'Cửa chính & Gốc xoan',
    title: 'CỬA CHÍNH NAM — BẬC THỀM & HƯỚNG GỐC XOAN',
    caption: 'Ảnh hiện trường #02-KX: Dấu vết phấn hoa xoan và vệt nước mưa trên thềm gạch',
    detail: 'Cửa chính hé mở. Bậc thềm còn lưu lại vệt nước mưa và bột phấn hoa xoan bám dính — đặc điểm trùng khớp với chiếc áo gió màu xám đen thu giữ. Dưới gốc xoan có dấu chân đế giày nữ size 37.',
    imageUrl: '/images/cases/case_000/photo_cheating_sms.jpg',
    soundType: 'paper'
  },
  {
    id: 'spot-3',
    num: 3,
    x: 49,
    y: 68,
    shortName: 'Bàn trà & Chén vỡ',
    title: 'BÀN TRÀ PHÒNG KHÁCH — MẢNH ẤM CHÉN VỠ & XÔ XÁT',
    caption: 'Ảnh hiện trường #03-KX: Bộ ấm chén gốm vỡ trên sàn gạch và ghế bị xô lệch',
    detail: 'Bộ ấm chén gốm vỡ trên sàn gạch bông, ghế đơn bị xô lệch khoảng 40cm. Cặn ấm trà hoa cúc còn lưu vết thuốc an thần Diazepam. Nạn nhân đã xảy ra xô xát giằng co dữ dội trước lúc tử vong.',
    imageUrl: '/images/cases/case_000/avatar_khang.jpg',
    soundType: 'shatter'
  },
  {
    id: 'spot-4',
    num: 4,
    x: 84,
    y: 56,
    shortName: 'Tủ gỗ lim 1996',
    title: 'KHE TỦ GỖ LIM GÓC PHÒNG — VỤ ÁN TRỐN TÌM 1996',
    caption: 'Ảnh hiện trường #04-KX: Khe tủ hé mở có dấu vết người ẩn nấp quan sát',
    detail: 'Khe tủ gỗ lim hé mở khoảng 5cm, then cài sắt đã hoen gỉ. Bên trong phát hiện dấu vải cọ xát và dấu vân tay mờ — có người đã nấp bên trong quan sát toàn bộ diễn biến. Trên nóc tủ hằn vết đập bàn tay kích động.',
    imageUrl: '/images/cases/case_000/wardrobe_eyes.jpg',
    soundType: 'paper'
  },
  {
    id: 'spot-5',
    num: 5,
    x: 13,
    y: 72,
    shortName: 'Giỏ rác cửa sau',
    title: 'GIỎ RÁC CẠNH CỬA RA VÀO — CUỐNG VÉ XE KHÁCH',
    caption: 'Ảnh hiện trường #05-KX: Cuống vé xe khách liên tỉnh bị vò nát dưới đáy giỏ',
    detail: 'Dưới đáy giỏ rác thu giữ 01 cuống vé xe khách liên tỉnh tuyến Hà Nội — Nam Định có ghi thời gian xuất bến lúc 20:15, cùng mẩu khăn giấy dính son dưỡng và phấn hoa xoan.',
    imageUrl: '/images/cases/case_000/cuong_ve_xe_tung.png',
    soundType: 'paper'
  },
  {
    id: 'spot-6',
    num: 6,
    x: 58,
    y: 62,
    shortName: 'Khe ghế sofa',
    title: 'KHE ĐỆM GHẾ SOFA — THỎI SON & SỢI TÓC VÀNG',
    caption: 'Ảnh hiện trường #06-KX: Thỏi son mạ vàng rơi kẹt dính sợi tóc uốn nhuộm',
    detail: '01 Thỏi son trang điểm nắp mạ vàng bị đánh rơi mắc kẹt trong rãnh đệm ghế sofa. Dính chặt trên thân thỏi son là 01 sợi tóc dài nhuộm vàng kim — phơi bày mối quan hệ tình cảm mờ ám ngoài luồng.',
    imageUrl: '/images/cases/case_000/photo-reinvestigation-room-realistic.jpg',
    soundType: 'default'
  },
  {
    id: 'spot-7',
    num: 7,
    x: 89,
    y: 45,
    shortName: 'Di thư chia đất',
    title: 'KHE BÀN LÀM VIỆC — TỜ DI THƯ CHIA ĐẤT 50:50',
    caption: 'Ảnh hiện trường #07-KX: Tờ giấy dó chép tay di thư di sản của Ông Nội',
    detail: 'Tờ di thư chép tay bằng mực tàu đã ố vàng của Ông Nội kẹp trong cuốn sổ cũ, phân chia 200m² đất đồng đều cho 2 cháu Khang và Mai (50:50), vạch trần việc Khang giấu giếm chiếm đoạt tài sản.',
    imageUrl: '/images/cases/case_000/photo-reinvestigation-room-realistic.jpg',
    soundType: 'paper'
  },
  {
    id: 'spot-8',
    num: 8,
    x: 36,
    y: 78,
    shortName: 'Gối nằm & Bùa yêu',
    title: 'RUỘT GỐI NẰM PHÒNG NGỦ — LÁ BÙA YÊU YẾM CHỈ ĐỎ',
    caption: 'Ảnh hiện trường #08-KX: Ruột gối bị rạch khóa giấu bùa vải đỏ buộc lọn tóc',
    detail: 'Trong ruột gối bông phát hiện 01 lá bùa vải đỏ gấp tam giác ghi họ tên Khang & Hà bằng mực son, quấn chặt 01 lọn tóc bằng chỉ đỏ — minh chứng sự cuồng yêu mù quáng và ám ảnh tâm lý của Trần Thị Hà.',
    imageUrl: '/images/cases/case_000/avatar_ha.png',
    soundType: 'default'
  }
]

export function ReinvestigationModal({ isOpen, onClose }: ReinvestigationModalProps) {
  const [viewMode, setViewMode] = useState<'flat2d' | 'room3d'>('flat2d')
  const [selectedSpot, setSelectedSpot] = useState<ReinvestigationHotspot2D | null>(null)
  const [scale, setScale] = useState<number>(1.55) // Default zoom in for panoramic dragging
  const [isDragging, setIsDragging] = useState(false)
  const dragDistanceRef = useRef(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 })

  // Track container dimensions on resize
  useEffect(() => {
    if (!isOpen) return
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 1200,
          height: containerRef.current.clientHeight || 800
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [isOpen])

  if (!isOpen) return null

  const handleSpotClick = (spot: ReinvestigationHotspot2D) => {
    // If user was dragging across the scene, prevent opening modal
    if (dragDistanceRef.current > 6) return

    if (spot.soundType === 'train') {
      detectiveAudio.playTrainHornAndBellSound()
    } else if (spot.soundType === 'shatter') {
      detectiveAudio.playCeramicShatterSound()
    } else {
      detectiveAudio.playPaperRustle()
    }

    setSelectedSpot(spot)
  }

  const handle3DSpotClick = (spot: RoomHotspot) => {
    const match = HOTSPOTS_2D_LIST.find((h) => h.id === spot.id || h.num === spot.num)
    if (match) {
      handleSpotClick(match)
    } else {
      setSelectedSpot({
        id: spot.id,
        num: spot.num,
        x: 50,
        y: 50,
        shortName: spot.shortName,
        title: spot.title,
        caption: spot.caption,
        detail: spot.detail,
        imageUrl: spot.imageUrl,
        soundType: 'default'
      })
    }
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.4, Number((prev + 0.25).toFixed(2))))
    detectiveAudio.playPaperRustle()
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(1.0, Number((prev - 0.25).toFixed(2))))
    detectiveAudio.playPaperRustle()
  }

  const handleResetZoom = () => {
    setScale(1.55)
    detectiveAudio.playPaperRustle()
  }

  const playSpotSound = (spot: ReinvestigationHotspot2D) => {
    if (spot.soundType === 'train') {
      detectiveAudio.playTrainHornAndBellSound()
    } else if (spot.soundType === 'shatter') {
      detectiveAudio.playCeramicShatterSound()
    } else {
      detectiveAudio.playPaperRustle()
    }
  }

  // Calculate dynamic drag bounds based on scale & container dimensions
  const imageAspect = 16 / 9
  const renderedWidth = Math.max(containerSize.width * scale, containerSize.height * imageAspect * scale)
  const renderedHeight = renderedWidth / imageAspect
  const maxDragX = Math.max(0, (renderedWidth - containerSize.width) / 2)
  const maxDragY = Math.max(0, (renderedHeight - containerSize.height) / 2)

  return (
    <div className="fixed inset-0 bg-[#080503] z-50 flex flex-col font-mono text-[#f4e8d8] select-none overflow-hidden w-screen h-[100dvh]">
      {/* SCANLINES EFFECT */}
      <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-15 z-10" />

      {/* TOP HEADER / STATUS BAR */}
      <div className="relative z-30 bg-[#160d07] border-b-2 border-[#3d2412] px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="size-8 rounded bg-[#2b170c] border border-[#693e1e] flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
            <FileSearch className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#f5ebd9] tracking-wider uppercase">
                TÁI KHÁM XÉT HIỆN TRƯỜNG // SỐ 14 ĐƯỜNG BỜ SÔNG
              </span>
            </div>
            <p className="text-[11px] text-[#9e7a56] hidden sm:block">
              {viewMode === 'flat2d'
                ? 'Giữ và kéo ảnh sang trái/phải để lia góc nhìn • Bấm vào các điểm [🔴 1-8] để soi chi tiết'
                : 'Xoay và tương tác với các vật thể trong không gian 3D'}
            </p>
          </div>

          {/* VIEW MODE TOGGLE SWITCHER (2D MẶC ĐỊNH & 3D) */}
          <div className="flex items-center bg-[#0d0805] border border-[#59341c] rounded p-0.5 ml-1 sm:ml-2">
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playPaperRustle()
                setViewMode('flat2d')
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'flat2d'
                  ? 'bg-[#5c371d] text-amber-300 shadow border border-amber-600/40'
                  : 'text-[#8c6a48] hover:text-[#d9a066]'
              }`}
            >
              <Layers className="size-3.5" />
              <span>Ảnh 2D</span>
            </button>

            <button
              type="button"
              onClick={() => {
                detectiveAudio.playPaperRustle()
                setViewMode('room3d')
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'room3d'
                  ? 'bg-[#5c371d] text-amber-300 shadow border border-amber-600/40'
                  : 'text-[#8c6a48] hover:text-[#d9a066]'
              }`}
            >
              <Box className="size-3.5" />
              <span>Phòng 3D</span>
            </button>
          </div>
        </div>

        {/* ZOOM CONTROLS (IF 2D) & CLOSE */}
        <div className="flex items-center gap-2">
          {/* Zoom buttons for 2D mode */}
          {viewMode === 'flat2d' && (
            <div className="flex items-center bg-[#0d0805] border border-[#4a2b15] rounded-none p-0.5 text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 1.0}
                className="p-1.5 text-[#a8825c] hover:text-amber-300 disabled:opacity-30 transition-colors cursor-pointer"
                title="Thu nhỏ"
              >
                <ZoomOut className="size-4" />
              </button>
              <span className="px-2 font-mono text-[11px] text-amber-200 min-w-[44px] text-center font-bold">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 2.4}
                className="p-1.5 text-[#a8825c] hover:text-amber-300 disabled:opacity-30 transition-colors cursor-pointer"
                title="Phóng to"
              >
                <ZoomIn className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 text-[11px] text-[#a8825c] hover:text-amber-300 border-l border-[#4a2b15] transition-colors cursor-pointer hidden sm:flex items-center gap-1"
                title="Đặt lại mức chuẩn"
              >
                <RotateCcw className="size-3" />
                <span>Chuẩn</span>
              </button>
            </div>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              detectiveAudio.playPaperRustle()
              onClose()
            }}
            className="p-1.5 bg-[#2b170c] hover:bg-[#422413] border border-[#59341c] text-[#d9a066] hover:text-white rounded-none transition-colors cursor-pointer ml-1"
            title="Đóng bảng khám xét"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* MAIN VIEW AREA: 3D OR 2D */}
      {viewMode === 'room3d' ? (
        <div className="relative flex-1 w-full h-full overflow-hidden bg-black">
          <CrimeSceneRoom3D onSelectSpot={handle3DSpotClick} />
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative flex-1 w-full h-full overflow-hidden bg-[#060402] flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          {/* DRAGGABLE 2D PANORAMIC CANVAS AREA */}
          <motion.div
          drag
          dragMomentum={true}
          dragElastic={0.08}
          dragConstraints={{
            left: -maxDragX,
            right: maxDragX,
            top: -maxDragY,
            bottom: maxDragY
          }}
          onDragStart={() => {
            setIsDragging(true)
            dragDistanceRef.current = 0
          }}
          onDrag={(_, info) => {
            dragDistanceRef.current += Math.abs(info.delta.x) + Math.abs(info.delta.y)
          }}
          onDragEnd={() => {
            setTimeout(() => {
              setIsDragging(false)
              dragDistanceRef.current = 0
            }, 50)
          }}
          style={{
            width: renderedWidth,
            height: renderedHeight
          }}
          className="relative shrink-0 select-none touch-none flex items-center justify-center"
        >
          {/* CRIME SCENE REALISTIC ROOM 2D IMAGE */}
          <img
            src="/images/cases/case_000/photo-reinvestigation-room-realistic.jpg"
            alt="Toàn cảnh phòng khách hiện trường khám xét lại 2D"
            draggable={false}
            className="w-full h-full object-cover pointer-events-none rounded-none shadow-2xl border border-[#26150b]"
          />

          {/* HOTSPOT PINS OVERLAY */}
          {HOTSPOTS_2D_LIST.map((spot) => {
            const isSelected = selectedSpot?.id === spot.id
            return (
              <div
                key={spot.id}
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <button
                  type="button"
                  onClick={() => handleSpotClick(spot)}
                  className="group relative flex items-center justify-center cursor-pointer focus:outline-none"
                  title={`[#${spot.num}] ${spot.title}`}
                >
                  {/* Outer Pulsing Ping Ring */}
                  <span className="absolute -inset-2 rounded-full bg-red-600/40 animate-ping pointer-events-none" />

                  {/* Red Badge Marker */}
                  <div
                    className={`relative flex items-center justify-center size-8 sm:size-9 rounded-full border-2 transition-transform duration-200 group-hover:scale-125 shadow-lg ${
                      isSelected
                        ? 'bg-amber-400 border-amber-200 text-black ring-4 ring-amber-400/50 scale-125'
                        : 'bg-[#991b1b] border-[#fecaca] text-[#fef2f2] group-hover:bg-[#dc2626]'
                    }`}
                  >
                    <span className="font-mono text-xs sm:text-sm font-black leading-none drop-shadow">
                      {spot.num}
                    </span>
                  </div>

                  {/* Hotspot Floating Pill Label */}
                  <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#120a05]/95 text-amber-200 border border-[#59341c] px-2 py-0.5 text-[10px] sm:text-[11px] font-bold rounded shadow-md pointer-events-none opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
                    {spot.shortName}
                  </div>
                </button>
              </div>
            )
          })}
        </motion.div>

        {/* BOTTOM DRAG INSTRUCTION BAR & HOTSPOT QUICK SELECTOR */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-4xl bg-[#140c06]/95 border-2 border-[#3d2412] p-2 sm:p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xl backdrop-blur-md">
          {/* Guidance text */}
          <div className="flex items-center gap-2 text-xs text-[#d4b08c]">
            <MoveHorizontal className="size-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-xs">
              Kéo chuột/vuốt ngón tay để lia phòng • Chọn điểm nghi vấn:
            </span>
          </div>

          {/* Quick Pill Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 custom-scrollbar">
            {HOTSPOTS_2D_LIST.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => {
                    handleSpotClick(spot)
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-bold whitespace-nowrap border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    isSelected
                      ? 'bg-amber-400 text-black border-amber-300 shadow'
                      : 'bg-[#241309] text-[#e0caa7] border-[#4a2a15] hover:bg-[#3d200e] hover:text-amber-200'
                  }`}
                >
                  <span className="size-3.5 rounded-full bg-red-800 text-white text-[9px] flex items-center justify-center font-black">
                    {spot.num}
                  </span>
                  <span>{spot.shortName}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )}

      {/* SPOT DETAIL INSPECTION MODAL */}
      <AnimatePresence>
        {selectedSpot && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_30px_90px_rgba(0,0,0,0.98)] rounded-none overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* MODAL HEADER */}
              <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded bg-[#8c1d1d] text-white font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                    {selectedSpot.num}
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-xs sm:text-sm text-[#1a120b] uppercase tracking-wider">
                      {selectedSpot.title}
                    </h3>
                    <span className="font-mono text-[11px] text-[#6b4e2e] block">
                      HỒ SƠ KHÁM XÉT HIỆN TRƯỜNG // VẬT CHỨNG #{selectedSpot.num}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSpot(null)}
                  className="p-1.5 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer border border-[#5c4026]"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5]">
                {/* PHOTO CONTAINER (IF AVAILABLE) */}
                {selectedSpot.imageUrl && (
                  <div className="relative w-full max-h-[260px] bg-[#1a1008] border-2 border-[#2b1f14] rounded-none overflow-hidden flex items-center justify-center">
                    <img
                      src={selectedSpot.imageUrl}
                      alt={selectedSpot.title}
                      className="w-full h-full object-contain max-h-[250px]"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-[#f5ebd9] font-mono text-[10px] px-2 py-0.5 border border-[#4a2a15]">
                      CHỨNG CỨ ẢNH #{selectedSpot.num}
                    </div>
                  </div>
                )}

                {/* CAPTION */}
                <div className="p-3 bg-[#ebdcc4] border-l-4 border-[#8c1d1d] text-xs font-mono font-bold text-[#4a2f18]">
                  📸 {selectedSpot.caption}
                </div>

                {/* DETAILED OBSERVATION */}
                <div className="p-4 bg-[#fdfcf9] border-2 border-[#d4c5b0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="size-3.5" />
                      KẾT QUẢ QUAN SÁT & ĐỐI SOÁT:
                    </span>
                    {selectedSpot.soundType && selectedSpot.soundType !== 'default' && (
                      <button
                        type="button"
                        onClick={() => playSpotSound(selectedSpot)}
                        className="px-2 py-1 bg-[#2b1f14] hover:bg-[#452e1d] text-[#f5ebd9] font-mono text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Volume2 className="size-3 text-amber-400" />
                        <span>Phát âm thanh hiện trường</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#2b1f14] leading-relaxed font-serif">
                    {selectedSpot.detail}
                  </p>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="p-3 bg-[#ede3d1] border-t-2 border-[#2b1f14] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSpot(null)}
                  className="px-5 py-2 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider rounded-none transition-all border-2 border-[#2b1f14] shadow-md cursor-pointer"
                >
                  ĐÃ RÕ // TIẾP TỤC QUAN SÁT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

