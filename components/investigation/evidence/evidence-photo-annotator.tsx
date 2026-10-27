'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  PenTool,
  Highlighter,
  Eraser,
  MousePointer,
  Trash2,
  Target,
  PenLine,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoomSync } from '../room-sync-context'
import { detectiveAudio } from '@/lib/investigation-audio'
import { emitInvestigationEvent } from '@/lib/investigation-events'
import {
  DossierAnnotationLayer,
  type AnnotationTool,
  type AnnotationColor,
} from './dossier-annotation-layer'

interface EvidencePhotoAnnotatorProps {
  photoUrl: string
  title: string
  evidenceId?: string
  className?: string
}

const COLOR_PALETTE: { color: AnnotationColor; label: string }[] = [
  { color: '#dc2626', label: 'Bút đỏ nghiệp vụ' },
  { color: '#2563eb', label: 'Bút xanh' },
  { color: '#eab308', label: 'Bút vàng dạ quang' },
  { color: '#16a34a', label: 'Bút xanh lá' },
  { color: '#9333ea', label: 'Bút tím ghi chú' },
  { color: '#171717', label: 'Bút đen' },
]

export function EvidencePhotoAnnotator({
  photoUrl,
  title,
  evidenceId,
  className,
}: EvidencePhotoAnnotatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { broadcastPing } = useRoomSync()
  const [isAudioMuted, setIsAudioMuted] = useState(() => detectiveAudio.isMuted)
  const handleToggleAudio = useCallback(() => {
    const next = detectiveAudio.toggleMute()
    setIsAudioMuted(next)
  }, [])
  const [zoom, setZoom] = useState<number>(1)
  const [activeTool, setActiveTool] = useState<AnnotationTool>('cursor')
  const [activeColor, setActiveColor] = useState<AnnotationColor>('#dc2626')
  const [activeSize, setActiveSize] = useState<number>(3)
  const [clearTrigger, setClearTrigger] = useState<number>(0)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false)

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(2.5, Math.round((prev + 0.15) * 100) / 100))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(0.5, Math.round((prev - 0.15) * 100) / 100))
  }, [])

  const resetZoom = useCallback(() => {
    setZoom(1)
  }, [])

  // Ctrl + Wheel to zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1
        setZoom((prev) => Math.min(2.5, Math.max(0.5, Math.round((prev + zoomDelta) * 100) / 100)))
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const docId = evidenceId || photoUrl.split('/').pop()?.split('?')[0] || 'evidence_photo'

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full relative overflow-hidden flex flex-col items-center justify-center bg-[#0d0906]",
        activeTool === 'cursor' ? "select-auto" : "select-none",
        className
      )}
    >
      {/* Background Texture Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#3d2c1e_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

      {/* FLOATING ANNOTATION & ZOOM TOOLBAR (Căn giữa phía dưới màn hình) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-[#1a120b]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#4a3625] shadow-2xl text-[#d9a066] max-w-[calc(100%-2rem)]">
        {/* NÚT CHỌN CHUỘT THƯỜNG */}
        <button
          type="button"
          onClick={() => setActiveTool('cursor')}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
            activeTool === 'cursor'
              ? "bg-[#d9a066] text-[#1a0f07] font-bold shadow-sm"
              : "hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec]"
          )}
          title="Con trỏ bình thường"
        >
          <MousePointer className="size-4" />
        </button>

        {/* NÚT BÚT VẼ / KHOANH TRÒN */}
        <button
          type="button"
          onClick={() => {
            setActiveTool('pen')
            setActiveSize(2.5)
          }}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
            activeTool === 'pen'
              ? "bg-[#d9a066] text-[#1a0f07] font-bold shadow-sm"
              : "hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec]"
          )}
          title="Bút vẽ & khoanh vùng ảnh vật chứng"
        >
          <PenTool className="size-4" />
        </button>

        {/* NÚT BÚT DẠ QUANG HIGHLIGHTER */}
        <button
          type="button"
          onClick={() => {
            setActiveTool('highlighter')
            setActiveSize(6)
          }}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
            activeTool === 'highlighter'
              ? "bg-[#d9a066] text-[#1a0f07] font-bold shadow-sm"
              : "hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec]"
          )}
          title="Bút nhớ highlight tô sáng"
        >
          <Highlighter className="size-4" />
        </button>

        {/* Ô CHỌN MÀU GỌN GÀNG (TỰ ĐÓNG KHI DI CHUỘT RA NGOÀI) */}
        {activeTool !== 'cursor' && activeTool !== 'eraser' && (
          <div
            className="relative"
            onMouseLeave={() => setIsColorPickerOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsColorPickerOpen((prev) => !prev)}
              className="p-1 rounded-lg hover:bg-[#342417] transition-colors cursor-pointer flex items-center justify-center"
              title="Đổi màu bút"
            >
              <span
                style={{ backgroundColor: activeColor }}
                className="size-4 rounded-full border-2 border-white/60 shadow-sm"
              />
            </button>

            {isColorPickerOpen && (
              <div
                onMouseLeave={() => setIsColorPickerOpen(false)}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 bg-[#1e150f] border border-[#523924] rounded-xl shadow-2xl flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                {COLOR_PALETTE.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => {
                      setActiveColor(p.color)
                      setIsColorPickerOpen(false)
                    }}
                    style={{ backgroundColor: p.color }}
                    className={cn(
                      "size-5 rounded-full transition-transform cursor-pointer border border-white/20 hover:scale-110",
                      activeColor === p.color && "scale-125 ring-2 ring-[#d9a066] ring-offset-1 ring-offset-[#1e150f]"
                    )}
                    title={p.label}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TẨY XÓA */}
        <button
          type="button"
          onClick={() => setActiveTool('eraser')}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
            activeTool === 'eraser'
              ? "bg-[#d9a066] text-[#1a0f07] font-bold shadow-sm"
              : "hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec]"
          )}
          title="Tẩy nét vẽ (Chạm vào nét vẽ để xóa)"
        >
          <Eraser className="size-4" />
        </button>

        {/* VÁCH NGĂN CÁCH BIỆT GIỮA VẼ VÀ SỔ TAY / ÂM THANH */}
        <div className="w-[1px] h-4 bg-[#4a3625] mx-1" />

        {/* NÚT SỔ TAY THÁM TỬ */}
        <button
          type="button"
          onClick={() => emitInvestigationEvent("OPEN_NOTEBOOK")}
          className="p-1.5 rounded-lg hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono font-medium"
          title="Ghi chép vật chứng"
        >
          <PenLine className="size-4 text-amber-500" />
          <span className="hidden sm:inline">Sổ tay</span>
        </button>

        {/* NÚT BẬT / TẮT ÂM THANH TRINH THÁM */}
        <button
          type="button"
          onClick={handleToggleAudio}
          className="p-1.5 rounded-lg hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec] transition-colors cursor-pointer flex items-center justify-center"
          title={isAudioMuted ? "Bật âm thanh trinh thám" : "Tắt âm thanh trinh thám"}
        >
          {isAudioMuted ? (
            <VolumeX className="size-4 text-amber-500/60" />
          ) : (
            <Volume2 className="size-4 text-amber-400" />
          )}
        </button>

        <div className="w-[1px] h-4 bg-[#4a3625] mx-1" />

        {/* ZOOM CONTROLS */}
        <button
          type="button"
          onClick={zoomOut}
          disabled={zoom <= 0.5}
          className="p-1.5 rounded hover:bg-[#342417] hover:text-[#fef5ec] disabled:opacity-40 transition-colors cursor-pointer"
          title="Thu nhỏ (Zoom out)"
        >
          <ZoomOut className="size-4" />
        </button>

        <button
          type="button"
          onClick={zoomIn}
          disabled={zoom >= 2.5}
          className="p-1.5 rounded hover:bg-[#342417] hover:text-[#fef5ec] disabled:opacity-40 transition-colors cursor-pointer"
          title="Phóng to (Zoom in)"
        >
          <ZoomIn className="size-4" />
        </button>

        <button
          type="button"
          onClick={resetZoom}
          className="p-1.5 rounded hover:bg-[#342417] hover:text-[#fef5ec] transition-colors cursor-pointer"
          title="Đặt lại kích thước (100%)"
        >
          <RotateCcw className="size-3.5" />
        </button>

        {/* NÚT CHỈ ĐIỂM VẬT CHỨNG / ẢNH CHO ĐỒNG ĐỘI */}
        <div className="w-[1px] h-4 bg-[#4a3625] mx-1" />
        <button
          type="button"
          onClick={() => {
            const targetId = evidenceId || title
            broadcastPing(targetId, title, undefined, {
              targetType: 'evidence',
              docType: 'evidence',
            })
          }}
          className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/60 transition-colors flex items-center gap-1.5 font-mono text-xs font-bold cursor-pointer"
          title="Chỉ điểm vật chứng này cho toàn bộ đồng đội đang cùng phá án"
        >
          <Target className="size-3.5 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Chỉ điểm</span>
        </button>
      </div>

      {/* PHOTO CONTAINER WITH ANNOTATION LAYER */}
      <div className="w-full flex-1 overflow-auto custom-scrollbar p-4 flex flex-col items-center justify-center">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className="relative max-w-sm sm:max-w-md xl:max-w-lg p-2 bg-[#1b140e] border border-[#3d2c1e] rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200 shrink-0"
        >
          {/* Lớp vẽ trực tiếp đè lên khung ảnh */}
          <DossierAnnotationLayer
            documentId={docId}
            activeTool={activeTool}
            activeColor={activeColor}
            activeSize={activeSize}
            scale={zoom}
            onClearTrigger={clearTrigger}
          />

          <img
            src={photoUrl}
            alt={title}
            className="max-w-full max-h-[55vh] object-contain rounded-none shadow-md select-none pointer-events-none"
          />

          
        </div>
      </div>
    </div>
  )
}
