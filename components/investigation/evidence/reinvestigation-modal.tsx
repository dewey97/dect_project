'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Search,
  Save,
  Move,
  Link2,
  FileText
} from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { checkIsAdmin } from '@/lib/actions/auth-guard'
import { usePhoneData } from '@/lib/hooks/use-phone-data'
import { normalizeImageUrl } from '@/lib/utils'
import { toast } from '@/components/ui/toast'

interface ReinvestigationModalProps {
  isOpen: boolean
  onClose: () => void
}

export interface ReinvestigationHotspot2D {
  id: string
  num: number
  photoId?: string // Mã photo_code trong Google Sheets (VD: photo_bua_yeu, p1, photo_keo_toc...)
  title?: string
  x: number // percentage 0-100
  y: number // percentage 0-100
  imageUrl: string
  driveUrl?: string
  soundFile: string
  soundCaption: string
}

// SFX HIỆU ỨNG ÂM THANH CÓ SẴN
const SFX_OPTIONS = [
  { file: 'train_sound.mp3', label: 'Còi tàu & chuông đường sắt', caption: '*Tu tu... Xình xịch...*' },
  { file: 'sound_tu.mp3', label: 'Kẹt then cửa sắt / Tủ gỗ', caption: '*Két... Cạch...*' },
  { file: 'breaking.mp3', label: 'Mảnh ấm chén rơi vỡ', caption: '*Choang! Xoảng...*' },
  { file: 'Clack.mp3', label: 'Cạch then cửa hậu', caption: '*Cạch... cạch...*' },
  { file: 'sat_soat.mp3', label: 'Giấy sột soạt / Khăn giấy', caption: '*Sột soạt... sột soạt...*' },
  { file: 'ceramic_shatter.mp3', label: 'Gốm sứ vỡ vụn', caption: '*Xoảng...*' },
  { file: 'glass_break.mp3', label: 'Thủy tinh vỡ', caption: '*Choang!*' },
  { file: 'ha_voicemail_2032.mp3', label: 'Thì thầm ma mị', caption: '*Thì thào...*' },
  { file: 'heartbeat.mp3', label: 'Nhịp tim dồn dập', caption: '*Thình thịch...*' },
  { file: 'paper_rustle.mp3', label: 'Lật trang hồ sơ', caption: '*Xào xạc...*' }
]

// 5 ĐIỂM KHÁM XÉT KHỞI TẠO BAN ĐẦU
export const HOTSPOTS_2D_LIST: ReinvestigationHotspot2D[] = [
  {
    id: 'spot-1',
    num: 1,
    photoId: 'hotspot_window',
    title: 'Khung cửa sổ hướng trạm tàu (Trạm số 2)',
    x: 20.2,
    y: 34,
    imageUrl: '/images/cases/case_000/15.png',
    soundFile: 'train_sound.mp3',
    soundCaption: '*Tu tu... Xình xịch...*'
  },
  {
    id: 'spot-2',
    num: 2,
    photoId: 'p1',
    title: 'Tủ gỗ lim 1996 then sắt',
    x: 58.5,
    y: 56,
    imageUrl: '/images/cases/case_000/17.png',
    soundFile: 'sound_tu.mp3',
    soundCaption: '*Két... Cạch...*'
  },
  {
    id: 'spot-3',
    num: 3,
    photoId: 'p3',
    title: 'Mảnh ấm chén vỡ gờ bàn',
    x: 6.4,
    y: 62,
    imageUrl: '/images/cases/case_000/9.png',
    soundFile: 'breaking.mp3',
    soundCaption: '*Choang! Xoảng...*'
  },
  {
    id: 'spot-4',
    num: 4,
    photoId: 'photo_hop_thiec',
    title: 'Thùng rác & chốt cửa hậu',
    x: 15.4,
    y: 62,
    imageUrl: '/images/cases/case_000/18.png',
    soundFile: 'Clack.mp3',
    soundCaption: '*Cạch... cạch...*'
  },
  {
    id: 'spot-5',
    num: 5,
    photoId: 'p2',
    title: 'Đơn đòi đất 200m² & tài liệu',
    x: 9.6,
    y: 78,
    imageUrl: '/images/cases/case_000/11.png',
    soundFile: 'sat_soat.mp3',
    soundCaption: '*Sột soạt... sột soạt...*'
  }
]

export function ReinvestigationModal({ isOpen, onClose }: ReinvestigationModalProps) {
  // Hotspots list with server + localStorage persistence
  const [hotspots, setHotspots] = useState<ReinvestigationHotspot2D[]>(HOTSPOTS_2D_LIST)
  const [selectedSpot, setSelectedSpot] = useState<ReinvestigationHotspot2D | null>(null)
  const [activeAudioToast, setActiveAudioToast] = useState<string | null>(null)
  const dragDistanceRef = useRef(0)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Infinite horizontal pan state & refs
  const [offsetX, setOffsetX] = useState(0)
  const isDraggingRef = useRef(false)
  const lastXRef = useRef(0)
  const velocityRef = useRef(0)
  const animFrameRef = useRef<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 })

  // Admin & Calibrator states
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCalibrateMode, setIsCalibrateMode] = useState(false)
  const [selectedCalibrateSpotId, setSelectedCalibrateSpotId] = useState<string | null>(null)
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false)
  const [photoSearchQuery, setPhotoSearchQuery] = useState('')
  const [isSavingDb, setIsSavingDb] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch live photos from Google Sheets
  const { data: rawSheetPhotos, loading: isPhotosLoading } = usePhoneData('photos')

  // Load hotspots from Server API, falling back to localStorage
  useEffect(() => {
    let mounted = true
    async function loadSavedHotspots() {
      try {
        const res = await fetch('/api/reinvestigation', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (mounted && data.success && Array.isArray(data.hotspots) && data.hotspots.length > 0) {
            setHotspots(data.hotspots)
            return
          }
        }
      } catch {}

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('reinvestigate_custom_hotspots')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0 && mounted) {
              setHotspots(parsed)
            }
          } catch {}
        }
      }
    }

    if (isOpen) {
      loadSavedHotspots()
    }

    return () => {
      mounted = false
    }
  }, [isOpen])

  // Check admin role
  useEffect(() => {
    let mounted = true
    async function verifyAdmin() {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        if (
          urlParams.get('admin') === 'true' ||
          localStorage.getItem('is_admin') === 'true' ||
          localStorage.getItem('admin') === 'true'
        ) {
          if (mounted) setIsAdmin(true)
          return
        }
      }
      try {
        const adminRole = await checkIsAdmin()
        if (mounted && adminRole) setIsAdmin(true)
      } catch {}
    }
    verifyAdmin()
    return () => {
      mounted = false
    }
  }, [])

  // Process Google Sheets photos: Map by photo_code ID & Title
  const sheetPhotosList = useMemo(() => {
    if (!Array.isArray(rawSheetPhotos)) return []
    return rawSheetPhotos
      .filter((item: any) =>
        Boolean(item.drive_url || item.direct_cdn_url || item.url || item.photo_url || item.link_anh || item.image_url)
      )
      .map((item: any, idx: number) => {
        const photoCode = item.photo_code || item.photo_id || item.id || `photo-${idx + 1}`
        const driveUrl = item.drive_url || ''
        const rawUrl =
          item.direct_cdn_url ||
          item.drive_url ||
          item.url ||
          item.photo_url ||
          item.link_anh ||
          item.image_url ||
          ''
        const normUrl = normalizeImageUrl(rawUrl)
        const title =
          item.title ||
          item.Title ||
          item.file_name ||
          item.filename ||
          item.ten_anh ||
          item['tên ảnh'] ||
          `Ảnh #${idx + 1}`
        return {
          id: photoCode, // ID photo_code chuẩn trong sheet
          title,
          url: normUrl,
          driveUrl,
          description: item.description_prompt || item.description || item.note || '',
          location: item.location || '',
          category: item.category || 'VẬT CHỨNG'
        }
      })
  }, [rawSheetPhotos])

  // Filtered photos for picker (Text only list)
  const filteredSheetPhotos = useMemo(() => {
    if (!photoSearchQuery.trim()) return sheetPhotosList
    const q = photoSearchQuery.toLowerCase()
    return sheetPhotosList.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  }, [sheetPhotosList, photoSearchQuery])

  // Active hotspot in calibrate mode
  const activeCalibrateSpot = useMemo(() => {
    return hotspots.find((s) => s.id === selectedCalibrateSpotId) || hotspots[0] || null
  }, [hotspots, selectedCalibrateSpotId])

  // DYNAMICALLY SYNC HOTSPOTS FROM GOOGLE SHEETS BY photoId
  // Nếu Sheet cập nhật link Drive hay title cho photoId, game tự động đọc theo photoId mới nhất!
  const resolvedHotspots = useMemo(() => {
    if (sheetPhotosList.length === 0) return hotspots

    return hotspots.map((spot) => {
      if (!spot.photoId) return spot
      const matched = sheetPhotosList.find((p) => p.id === spot.photoId)
      if (matched) {
        return {
          ...spot,
          title: matched.title || spot.title,
          imageUrl: matched.url || spot.imageUrl,
          driveUrl: matched.driveUrl || spot.driveUrl,
          soundCaption: matched.description ? `*${matched.description}*` : spot.soundCaption
        }
      }
      return spot
    })
  }, [hotspots, sheetPhotosList])

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

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

  const playCustomSfx = (_filename: string) => {
    // Tạm ẩn âm thanh theo yêu cầu
  }

  // Handle clicking a hotspot pin on the scene
  const handleSpotClick = (spot: ReinvestigationHotspot2D) => {
    if (isCalibrateMode) {
      // Trong chế độ hiệu chỉnh: Nhấp vào số là mở luôn danh sách ảnh từ Sheet để chọn gán!
      setSelectedCalibrateSpotId(spot.id)
      setIsPhotoPickerOpen(true)
      return
    }

    if (dragDistanceRef.current > 8) return

    // Tạm ẩn âm thanh SFX và toast phụ đề âm thanh
    // playCustomSfx(spot.soundFile)
    // setActiveAudioToast(spot.soundCaption)
    setSelectedSpot(spot)
  }

  // Pointer drag event handlers for smooth infinite horizontal loop
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    isDraggingRef.current = true
    lastXRef.current = e.clientX
    dragDistanceRef.current = 0
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    try {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - lastXRef.current
    lastXRef.current = e.clientX
    dragDistanceRef.current += Math.abs(dx)
    velocityRef.current = dx
    setOffsetX((prev) => prev + dx)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}

    const applyMomentum = () => {
      velocityRef.current *= 0.92
      if (Math.abs(velocityRef.current) > 0.3) {
        setOffsetX((prev) => prev + velocityRef.current)
        animFrameRef.current = requestAnimationFrame(applyMomentum)
      }
    }
    if (Math.abs(velocityRef.current) > 1.2) {
      animFrameRef.current = requestAnimationFrame(applyMomentum)
    }
  }

  const handlePointerCancel = () => {
    isDraggingRef.current = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY
    setOffsetX((prev) => prev - delta * 0.9)
  }

  const handleNudge = (direction: 'left' | 'right') => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    velocityRef.current = direction === 'left' ? 22 : -22
    const applyMomentum = () => {
      velocityRef.current *= 0.92
      if (Math.abs(velocityRef.current) > 0.3) {
        setOffsetX((prev) => prev + velocityRef.current)
        animFrameRef.current = requestAnimationFrame(applyMomentum)
      }
    }
    animFrameRef.current = requestAnimationFrame(applyMomentum)
  }

  // --- CALIBRATOR ACTION HANDLERS ---
  const handleAddNewHotspot = () => {
    const nextNum = hotspots.length > 0 ? Math.max(...hotspots.map((s) => s.num)) + 1 : 1
    const newSpot: ReinvestigationHotspot2D = {
      id: `spot-${Date.now().toString().slice(-4)}`,
      num: nextNum,
      photoId: '',
      title: `Điểm #${nextNum}`,
      x: 50.0,
      y: 50.0,
      imageUrl: '/images/cases/case_000/photo-reinvestigation-room-realistic.jpg',
      soundFile: 'sat_soat.mp3',
      soundCaption: '*Kiểm tra vật chứng...*'
    }
    const updated = [...hotspots, newSpot]
    setHotspots(updated)
    setSelectedCalibrateSpotId(newSpot.id)
    setHasUnsavedChanges(true)
    setIsPhotoPickerOpen(true) // Mở luôn danh sách để gán ảnh
    toast.success(`Đã thêm điểm ${nextNum}. Chọn ảnh từ Sheet để gán!`)
  }

  const handleDeleteHotspot = (id: string) => {
    if (hotspots.length <= 1) {
      toast.error('Phải giữ lại ít nhất 1 điểm!')
      return
    }
    const updated = hotspots.filter((s) => s.id !== id)
    setHotspots(updated)
    setHasUnsavedChanges(true)
    if (selectedCalibrateSpotId === id) {
      setSelectedCalibrateSpotId(updated[0]?.id || null)
    }
    toast.info('Đã xóa điểm!')
  }

  // NÚT LƯU RIÊNG DÀNH CHO ADMIN: LƯU CẢ VỊ TRÍ (X, Y) VÀ ẢNH GÁN VÀO SERVER VÀ LOCAL
  const handleSaveToSystem = async () => {
    setIsSavingDb(true)
    try {
      localStorage.setItem('reinvestigate_custom_hotspots', JSON.stringify(hotspots))

      const res = await fetch('/api/reinvestigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotspots })
      })

      if (res.ok) {
        setHasUnsavedChanges(false)
        toast.success('Đã lưu thành công toàn bộ vị trí và danh sách ảnh gán!')
      } else {
        const data = await res.json()
        toast.error('Lỗi khi lưu lên Server: ' + (data.error || 'Server error'))
      }
    } catch (e: any) {
      toast.error('Lỗi khi lưu: ' + e.message)
    } finally {
      setIsSavingDb(false)
    }
  }

  const handleResetToDefault = () => {
    setHotspots(HOTSPOTS_2D_LIST)
    setSelectedCalibrateSpotId(HOTSPOTS_2D_LIST[0]?.id || null)
    setHasUnsavedChanges(true)
    localStorage.removeItem('reinvestigate_custom_hotspots')
    toast.info('Đã khôi phục danh sách điểm mặc định! Bấm "Lưu" để xác nhận lên hệ thống.')
  }

  // GÁN ẢNH THEO ID (PHOTO_CODE) TỪ GOOGLE SHEETS
  const handleSelectSheetPhoto = (photo: {
    id: string
    title: string
    url: string
    driveUrl?: string
    description: string
  }) => {
    if (!activeCalibrateSpot) return
    const updated = hotspots.map((s) =>
      s.id === activeCalibrateSpot.id
        ? {
            ...s,
            photoId: photo.id, // Đọc chính xác theo ID (photo_code) của Sheet!
            title: photo.title,
            imageUrl: photo.url,
            driveUrl: photo.driveUrl,
            soundCaption: photo.description ? `*${photo.description}*` : s.soundCaption
          }
        : s
    )
    setHotspots(updated)
    setHasUnsavedChanges(true)
    setIsPhotoPickerOpen(false)
    toast.success(`Đã gán ảnh [${photo.id}] "${photo.title}" cho Điểm ${activeCalibrateSpot.num}! Bấm "Lưu" để hoàn tất.`)
  }

  // Calculate dynamic dimensions for seamless wrapping
  const imageAspect = 4096 / 2286
  const renderedHeight = containerSize.height || 800
  const renderedWidth = renderedHeight * imageAspect

  // Calculate seamless normalized offset in range [-renderedWidth, 0]
  const normalizedX =
    renderedWidth > 0
      ? (((offsetX % renderedWidth) + renderedWidth) % renderedWidth) - renderedWidth
      : 0

  return (
    <div className="fixed inset-0 bg-[#080503] z-[100] flex flex-col font-mono text-[#f4e8d8] select-none overflow-hidden w-screen h-[100dvh] pt-safe">
      {/* SCANLINES EFFECT */}
      <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-15 z-10" />

      {/* TOP HEADER / STATUS BAR */}
      <div className="relative z-30 bg-[#160d07] border-b-2 border-[#3d2412] px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#f5ebd9] tracking-wider uppercase">
                KHÁM XÉT LẠI HIỆN TRƯỜNG
              </span>
              {isCalibrateMode && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse">
                  CHẾ ĐỘ HIỆU CHỈNH ADMIN
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#9e7a56] hidden sm:block">
              {isCalibrateMode
                ? 'Nhấp vào chấm số 1, 2, 3... để chọn ảnh theo ID từ Sheet • Kéo thả để đổi vị trí • Bấm "Lưu" để hoàn tất'
                : 'Kéo ảnh sang trái/phải để quay 360° nối vòng quanh phòng • Bấm vào các điểm đỏ để soi chi tiết'}
            </p>
          </div>
        </div>

        {/* CONTROLS (ADMIN + CLOSE) */}
        <div className="flex items-center gap-2">
          {/* ADMIN TOGGLE CALIBRATOR BUTTON */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playTypewriterClick()
                setIsCalibrateMode(!isCalibrateMode)
                if (!isCalibrateMode && !selectedCalibrateSpotId) {
                  setSelectedCalibrateSpotId(hotspots[0]?.id || null)
                }
              }}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold tracking-wider rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
                isCalibrateMode
                  ? 'bg-amber-500 text-black border-amber-300 ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                  : 'bg-[#2b170c] text-amber-400 border-amber-500/40 hover:bg-[#3d2212]'
              }`}
              title="Bật/Tắt chế độ kéo thả tọa độ và gán ảnh từ Google Sheets"
            >
              <Settings2 className="size-3.5" />
              <span className="hidden sm:inline">
                {isCalibrateMode ? 'THOÁT HIỆU CHỈNH' : 'HIỆU CHỈNH HOTSPOT'}
              </span>
            </button>
          )}

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              detectiveAudio.playPaperRustle()
              onClose()
            }}
            className="p-2 bg-[#2b170c] hover:bg-[#422413] border border-[#59341c] text-[#d9a066] hover:text-white rounded-none transition-colors cursor-pointer ml-1 pointer-events-auto"
            title="Đóng bảng khám xét"
          >
            <X className="size-5 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* ADMIN CALIBRATOR TOOLBAR (ONLY SHOWN IN CALIBRATE MODE) */}
      {isCalibrateMode && (
        <div className="relative z-30 bg-[#1e1108]/95 border-b border-amber-600/40 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xl backdrop-blur-md">
          {/* HOTSPOT SELECTOR TABS: JUST 1 2 3 4... */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <span className="text-xs text-amber-300/80 uppercase font-bold shrink-0 mr-1 flex items-center gap-1">
              <Move className="size-3.5 text-amber-400" />
              Điểm:
            </span>
            {hotspots.map((spot) => {
              const isActive = activeCalibrateSpot?.id === spot.id
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => {
                    setSelectedCalibrateSpotId(spot.id)
                    setIsPhotoPickerOpen(true) // Nhấp vào số là mở luôn danh sách ảnh từ Sheet!
                  }}
                  className={`size-7 text-xs rounded-full border transition-all cursor-pointer shrink-0 font-bold flex items-center justify-center font-mono ${
                    isActive
                      ? 'bg-amber-400 text-black border-amber-100 ring-2 ring-amber-400/90 shadow-md scale-110'
                      : 'bg-[#2e180d] text-[#e8d5c4] border-[#59341c] hover:bg-[#422212]'
                  }`}
                  title={`Điểm ${spot.num} (Đang gán: ${spot.photoId || 'chưa gán'}) - Bấm để chọn ảnh từ Sheet`}
                >
                  {spot.num}
                </button>
              )
            })}

            <button
              type="button"
              onClick={handleAddNewHotspot}
              className="p-1 px-2 text-xs rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 hover:bg-emerald-900 transition-colors flex items-center gap-1 shrink-0 cursor-pointer font-bold ml-1"
              title="Thêm điểm khám xét mới"
            >
              <Plus className="size-3.5" /> Thêm điểm
            </button>
          </div>

          {/* ACTIVE HOTSPOT ACTIONS & DEDICATED SAVE BUTTON */}
          <div className="flex items-center gap-2 shrink-0">
            {activeCalibrateSpot && (
              <>
                {/* SELECT PHOTO FROM GOOGLE SHEETS */}
                <button
                  type="button"
                  onClick={() => setIsPhotoPickerOpen(true)}
                  className="px-2.5 py-1 text-xs rounded bg-amber-600/30 text-amber-200 border border-amber-500 hover:bg-amber-600/50 transition-colors flex items-center gap-1.5 cursor-pointer font-bold shadow-sm"
                  title="Mở danh sách ảnh theo ID trong Sheet photos"
                >
                  <FileText className="size-3.5 text-amber-400" />
                  <span className="truncate max-w-[200px]">
                    {activeCalibrateSpot.photoId
                      ? `[${activeCalibrateSpot.photoId}] ${activeCalibrateSpot.title || ''}`
                      : `Gán ảnh cho điểm ${activeCalibrateSpot.num}`}
                  </span>
                </button>

                {/* SELECT SFX SOUND (TẠM ẨN THEO YÊU CẦU) */}
                {/*
                <select
                  value={activeCalibrateSpot.soundFile}
                  onChange={(e) => {
                    const sfx = SFX_OPTIONS.find((s) => s.file === e.target.value)
                    if (sfx) {
                      setHotspots((prev) =>
                        prev.map((s) =>
                          s.id === activeCalibrateSpot.id
                            ? { ...s, soundFile: sfx.file, soundCaption: sfx.caption }
                            : s
                        )
                      )
                      setHasUnsavedChanges(true)
                      playCustomSfx(sfx.file)
                    }
                  }}
                  className="bg-[#2a160c] text-amber-200 border border-[#59341c] text-xs px-2 py-1 rounded cursor-pointer font-mono outline-none"
                  title="Âm thanh SFX kích hoạt"
                >
                  {SFX_OPTIONS.map((s) => (
                    <option key={s.file} value={s.file}>
                      {s.label}
                    </option>
                  ))}
                </select>
                */}

                {/* DELETE ACTIVE SPOT */}
                <button
                  type="button"
                  onClick={() => handleDeleteHotspot(activeCalibrateSpot.id)}
                  className="p-1 text-xs rounded bg-red-950/80 text-red-300 border border-red-700/60 hover:bg-red-900 transition-colors cursor-pointer"
                  title="Xóa điểm này"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </>
            )}

            <div className="h-4 w-px bg-white/20 mx-1" />

            {/* DEDICATED SAVE BUTTON: LƯU TẤT CẢ VỊ TRÍ & ẢNH ĐÃ GÁN */}
            <button
              type="button"
              disabled={isSavingDb}
              onClick={handleSaveToSystem}
              className={`px-3 py-1 text-xs rounded font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                hasUnsavedChanges
                  ? 'bg-amber-400 hover:bg-amber-300 text-black ring-2 ring-amber-300 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-black border border-emerald-400'
              }`}
              title="Lưu toàn bộ vị trí và ảnh gán vào hệ thống"
            >
              <Save className="size-3.5" />
              <span>{isSavingDb ? 'Đang lưu...' : hasUnsavedChanges ? 'LƯU THAY ĐỔI' : 'ĐÃ LƯU'}</span>
            </button>

            {/* RESET DEFAULTS */}
            <button
              type="button"
              onClick={handleResetToDefault}
              className="p-1 text-xs rounded bg-zinc-800 text-zinc-300 border border-zinc-600 hover:bg-zinc-700 transition-colors cursor-pointer"
              title="Khôi phục mặc định"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEW AREA: 2D INFINITE SEAMLESS LOOP PANORAMA */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onWheel={handleWheel}
        className="relative flex-1 w-full h-full overflow-hidden bg-[#060402] cursor-grab active:cursor-grabbing touch-none select-none"
      >
        {/* NUDGE LEFT ARROW */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleNudge('left')
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-40 size-10 rounded-full bg-black/60 hover:bg-black/85 border border-[#59341c] text-[#d9a066] hover:text-white flex items-center justify-center backdrop-blur-sm transition-all active:scale-90 cursor-pointer shadow-lg"
          title="Lia sang trái"
        >
          <ChevronLeft className="size-6 pointer-events-none" />
        </button>

        {/* NUDGE RIGHT ARROW */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleNudge('right')
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-40 size-10 rounded-full bg-black/60 hover:bg-black/85 border border-[#59341c] text-[#d9a066] hover:text-white flex items-center justify-center backdrop-blur-sm transition-all active:scale-90 cursor-pointer shadow-lg"
          title="Lia sang phải"
        >
          <ChevronRight className="size-6 pointer-events-none" />
        </button>

        {/* REPEATED PANORAMIC SEGMENTS TO FORM AN INFINITE 360° WRAP */}
        {[-1, 0, 1, 2].map((copyIndex) => {
          const leftOffset = normalizedX + copyIndex * renderedWidth
          return (
            <div
              key={copyIndex}
              data-panorama-segment="true"
              onClick={(e) => {
                if (!isCalibrateMode || !activeCalibrateSpot || dragDistanceRef.current > 6) return
                const rect = e.currentTarget.getBoundingClientRect()
                const rawX = ((e.clientX - rect.left) / rect.width) * 100
                const rawY = ((e.clientY - rect.top) / rect.height) * 100
                const clampedX = Math.max(0.5, Math.min(99.5, Math.round(rawX * 10) / 10))
                const clampedY = Math.max(0.5, Math.min(99.5, Math.round(rawY * 10) / 10))
                setHotspots((prev) =>
                  prev.map((s) => (s.id === activeCalibrateSpot.id ? { ...s, x: clampedX, y: clampedY } : s))
                )
                setHasUnsavedChanges(true)
                toast.info(`Đã cập nhật vị trí cho điểm ${activeCalibrateSpot.num}`)
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: renderedWidth,
                height: renderedHeight,
                transform: `translate3d(${leftOffset}px, 0, 0)`,
                willChange: 'transform'
              }}
              className="shrink-0 select-none touch-none"
            >
              {/* CRIME SCENE REALISTIC ROOM 2D IMAGE */}
              <img
                src="/images/cases/case_000/PANORAMA.png"
                alt="Toàn cảnh phòng khách hiện trường"
                draggable={false}
                className="w-full h-full object-cover pointer-events-none rounded-none shadow-2xl border-r border-black/40"
              />

              {/* HOTSPOT PINS OVERLAY */}
              {resolvedHotspots.map((spot) => {
                const isSelected = selectedSpot?.id === spot.id
                const isCalibrateActive = isCalibrateMode && activeCalibrateSpot?.id === spot.id

                return (
                  <div
                    key={`${spot.id}-${copyIndex}`}
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
                  >
                    <div
                      onPointerDown={(e) => {
                        if (!isCalibrateMode) return
                        e.stopPropagation()
                        setSelectedCalibrateSpotId(spot.id)

                        const segmentEl = (e.currentTarget as HTMLElement).closest(
                          '[data-panorama-segment="true"]'
                        ) as HTMLElement
                        if (!segmentEl) return

                        const handlePinMove = (moveEv: PointerEvent) => {
                          const rect = segmentEl.getBoundingClientRect()
                          const rawX = ((moveEv.clientX - rect.left) / rect.width) * 100
                          const rawY = ((moveEv.clientY - rect.top) / rect.height) * 100
                          const clampedX = Math.max(0.5, Math.min(99.5, Math.round(rawX * 10) / 10))
                          const clampedY = Math.max(0.5, Math.min(99.5, Math.round(rawY * 10) / 10))

                          setHotspots((prev) =>
                            prev.map((s) => (s.id === spot.id ? { ...s, x: clampedX, y: clampedY } : s))
                          )
                          setHasUnsavedChanges(true)
                        }

                        const handlePinUp = () => {
                          window.removeEventListener('pointermove', handlePinMove)
                          window.removeEventListener('pointerup', handlePinUp)
                        }

                        window.addEventListener('pointermove', handlePinMove)
                        window.addEventListener('pointerup', handlePinUp)
                      }}
                      className="group relative flex items-center justify-center cursor-pointer focus:outline-none p-2"
                    >
                      {/* Numbered Solid Red Pin: 1, 2, 3... */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSpotClick(spot)
                        }}
                        className={`size-6 sm:size-7 rounded-full text-white font-bold text-xs sm:text-[13px] font-mono flex items-center justify-center shadow-lg transition-transform duration-150 group-hover:scale-125 border ${
                          isCalibrateActive
                            ? 'bg-amber-400 border-white text-neutral-950 ring-4 ring-amber-400/90 scale-125 animate-pulse'
                            : isSelected
                            ? 'bg-amber-500 border-amber-200 text-neutral-950 ring-2 ring-amber-400/80 scale-125'
                            : 'bg-[#cc1818] group-hover:bg-[#ee2222] border-[#ffe4e4]/80'
                        }`}
                        aria-label={`Điểm khám xét #${spot.num}`}
                      >
                        {spot.num}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* LIGHTBOX PHOTO ZOOM MODAL (REGULAR PLAYER VIEW) */}
      <AnimatePresence>
        {!isCalibrateMode && selectedSpot && (
          <div
            onClick={() => setSelectedSpot(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-8 cursor-zoom-out select-none"
          >
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[92vw] max-h-[88vh] flex flex-col items-center justify-center"
            >
              {/* CLOSE BUTTON */}
              <button
                type="button"
                onClick={() => setSelectedSpot(null)}
                className="absolute -top-3 -right-3 z-30 p-2 bg-[#1a0f08] hover:bg-[#331c0e] border-2 border-[#59341c] text-[#f4e8d8] rounded-full shadow-2xl transition-all cursor-pointer"
                title="Đóng ảnh"
              >
                <X className="size-5" />
              </button>

              {/* HIGH-RES EVIDENCE PHOTO FROM GOOGLE SHEETS */}
              <img
                src={selectedSpot.imageUrl}
                alt={selectedSpot.title || `Vật chứng #${selectedSpot.num}`}
                className="max-w-[92vw] max-h-[82vh] object-contain shadow-[0_30px_90px_rgba(0,0,0,0.98)] border-2 border-[#3d2412] rounded-none bg-[#0a0604]"
              />

              {/* CAPTION INFO BELOW PHOTO */}
              {selectedSpot.title && (
                <div className="mt-2.5 px-4 py-1.5 bg-[#140e08]/90 border border-[#59341c] rounded text-xs text-[#e8d5c4] font-mono text-center max-w-xl backdrop-blur-sm">
                  <span className="font-bold text-amber-300">Điểm {selectedSpot.num}:</span> {selectedSpot.title}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GOOGLE SHEETS PHOTO PICKER MODAL (TEXT ONLY - NO IMAGE PREVIEW) */}
      <AnimatePresence>
        {isPhotoPickerOpen && activeCalibrateSpot && (
          <div
            onClick={() => setIsPhotoPickerOpen(false)}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] bg-[#140e09] border-2 border-[#59341c] rounded-xl flex flex-col overflow-hidden shadow-2xl font-mono text-[#f4e8d8]"
            >
              {/* PICKER HEADER */}
              <div className="px-5 py-3.5 bg-[#1e130b] border-b border-[#3d2412] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-amber-300 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="size-5 text-amber-400" />
                    CHỌN ẢNH SHEET PHOTOS CHO ĐIỂM {activeCalibrateSpot.num}
                  </h3>
                  <p className="text-xs text-[#a88a6d] mt-0.5">
                    Hệ thống sẽ lưu và đọc theo mã ID (`photo_code`). Bấm để gán.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoPickerOpen(false)}
                  className="p-1.5 hover:bg-[#341b0e] text-[#d9a066] hover:text-white rounded border border-[#59341c] transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* SEARCH INPUT */}
              <div className="p-3 bg-[#180f08] border-b border-[#331c0e] flex items-center gap-2">
                <Search className="size-4 text-amber-400 shrink-0 ml-1" />
                <input
                  type="text"
                  value={photoSearchQuery}
                  onChange={(e) => setPhotoSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên ảnh hoặc mã ID (VD: bua_yeu, p1, keo_toc...)"
                  className="w-full bg-transparent border-0 text-sm text-[#f4e8d8] placeholder:text-neutral-500 focus:outline-none font-mono"
                  autoFocus={false}
                />
                {photoSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPhotoSearchQuery('')}
                    className="text-xs text-neutral-400 hover:text-white px-2 cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* PHOTOS LIST (TEXT ONLY LIST - COMPACT & FAST) */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {isPhotosLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-2 text-amber-400">
                    <RefreshCw className="size-6 animate-spin" />
                    <span className="text-xs">Đang nạp danh sách từ Google Sheets...</span>
                  </div>
                ) : filteredSheetPhotos.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-500">
                    Không tìm thấy mục nào khớp với từ khóa.
                  </div>
                ) : (
                  filteredSheetPhotos.map((photo) => {
                    const isAssigned = activeCalibrateSpot.photoId === photo.id
                    const hasDrive = Boolean(photo.driveUrl && photo.driveUrl.includes('drive.google.com'))

                    return (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => handleSelectSheetPhoto(photo)}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                          isAssigned
                            ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                            : 'bg-[#180e07] hover:bg-[#2b170c] border-[#382010] hover:border-amber-600/70 text-[#e6d6c6]'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {/* Mã photo_code ID */}
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-700/60 text-[11px] font-mono font-bold text-amber-300 shrink-0">
                              {photo.id}
                            </span>

                            {/* Title ảnh */}
                            <span className="font-bold text-xs sm:text-sm text-[#f5ebd9] group-hover:text-amber-200 truncate">
                              {photo.title}
                            </span>

                            {hasDrive && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 text-[10px] border border-emerald-700/50 shrink-0 flex items-center gap-1 font-bold">
                                <Link2 className="size-2.5" /> Drive
                              </span>
                            )}
                          </div>

                          {/* Mô tả vật chứng */}
                          {photo.description && (
                            <p className="text-[11px] text-[#9e7a56] truncate mt-1 italic pl-0.5">
                              {photo.description}
                            </p>
                          )}
                        </div>

                        {/* Selected Indicator */}
                        {isAssigned && (
                          <div className="shrink-0 text-amber-400 font-bold text-xs flex items-center gap-1">
                            <Check className="size-4 text-amber-400" />
                            <span className="hidden sm:inline">Đang gán</span>
                          </div>
                        )}
                      </button>
                    )
                  })
                )}
              </div>

              {/* FOOTER */}
              <div className="px-5 py-2.5 bg-[#190f08] border-t border-[#3d2412] text-xs text-[#a88a6d] flex items-center justify-between">
                <span>Tổng cộng: {filteredSheetPhotos.length} ảnh trong Sheet</span>
                <span className="italic text-amber-400">Bấm vào mục để gán cho điểm {activeCalibrateSpot.num}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUDIO SUBTITLE TOAST AT BOTTOM LEFT (TẠM ẨN THEO YÊU CẦU) */}
      {/*
      <AnimatePresence>
        {!isCalibrateMode && activeAudioToast && (
          <motion.div
            initial={{ opacity: 0, y: 15, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-6 z-50 bg-[#120a05]/95 border border-[#59341c] text-[#f4e8d8] px-4 py-2.5 rounded shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-sm pointer-events-none"
          >
            <Volume2 className="size-4 text-amber-400 shrink-0" />
            <motion.span
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="font-mono text-sm text-[#f5ebd9] italic font-semibold tracking-wider"
            >
              {activeAudioToast}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      */}
    </div>
  )
}
