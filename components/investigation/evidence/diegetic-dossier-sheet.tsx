'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { DbDossierDocument } from '@/lib/actions/dossier-actions'
import type { LoiKhaiData, LyLichData } from '@/lib/types/dossier'
import { DossierLoiKhaiSheet } from '@/components/admin/dossier-studio/dossier-loi-khai-sheet'
import { DossierLyLichSheet } from '@/components/admin/dossier-studio/dossier-ly-lich-sheet'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  PenTool,
  Highlighter,
  Eraser,
  MousePointer,
  Trash2,
  Users,
  Target,
  PenLine,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoomSync } from '@/components/investigation/room-sync-context'
import { detectiveAudio } from '@/lib/investigation-audio'
import { emitInvestigationEvent } from '@/lib/investigation-events'
import {
  DossierAnnotationLayer,
  type AnnotationTool,
  type AnnotationColor,
} from './dossier-annotation-layer'

interface DiegeticDossierSheetProps {
  document: DbDossierDocument
  className?: string
  scale?: number
}

const COLOR_PALETTE: { color: AnnotationColor; label: string }[] = [
  { color: '#dc2626', label: 'Bút đỏ nghiệp vụ' },
  { color: '#2563eb', label: 'Bút xanh mực máy' },
  { color: '#eab308', label: 'Bút nhớ vàng chanh' },
  { color: '#16a34a', label: 'Bút xanh lá cây' },
  { color: '#9333ea', label: 'Bút tím ghi chú' },
  { color: '#171717', label: 'Bút chì đen' },
]

/**
 * Tái sử dụng 100% component gốc từ Dossier Studio:
 * - DossierLoiKhaiSheet (chuẩn phân trang, dóng lề, căn dấu ':' và typography)
 * - DossierLyLichSheet (chuẩn bố cục ảnh thẻ 3x4, con dấu mộc, chữ ký tay)
 * Tích hợp bộ điều khiển Zoom in / Zoom out và thanh công cụ vẽ, khoanh tròn, tô màu bút nhớ trực tiếp trên hồ sơ!
 */
export function DiegeticDossierSheet({
  document: docItem,
  className,
  scale: externalScale,
}: DiegeticDossierSheetProps) {
  const isLoiKhai = docItem.mode === 'loi_khai'
  const paperConfig = docItem.paper_config || {
    size: 'A4',
    orientation: isLoiKhai ? 'portrait' : 'landscape',
  }

  // Khởi tạo mức zoom tự động vừa vặn ban đầu (Fit width thông minh)
  const [internalZoom, setInternalZoom] = useState<number>(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const paperWrapperRef = useRef<HTMLDivElement>(null)
  const [unscaledHeight, setUnscaledHeight] = useState<number>(isLoiKhai ? 1123 : 730)
  const { roomCode, broadcastPing, activePing } = useRoomSync()
  const [isAudioMuted, setIsAudioMuted] = useState(() => detectiveAudio.isMuted)
  const handleToggleAudio = useCallback(() => {
    const next = detectiveAudio.toggleMute()
    setIsAudioMuted(next)
  }, [])

  // Annotation states
  const [activeTool, setActiveTool] = useState<AnnotationTool>('cursor')
  const [activeColor, setActiveColor] = useState<AnnotationColor>('#dc2626')
  const [activeSize, setActiveSize] = useState<number>(3)
  const [clearTrigger, setClearTrigger] = useState<number>(0)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false)

  // Chiều rộng thiết kế chuẩn của văn bản
  const docBaseWidth = isLoiKhai
    ? paperConfig.orientation === 'portrait' ? 794 : 1123
    : 1050 // Lý Lịch đôi

  // Dynamic measure of unscaled paper height for exact Sizer Box calculation
  useEffect(() => {
    const el = paperWrapperRef.current
    if (!el) return
    const updateHeight = () => {
      const h = el.scrollHeight || el.offsetHeight
      if (h > 0) {
        setUnscaledHeight((prev) => (Math.abs(h - prev) > 2 ? h : prev))
      }
    }
    updateHeight()
    const ro = new ResizeObserver(updateHeight)
    ro.observe(el)
    return () => ro.disconnect()
  }, [docItem, isLoiKhai])

  // Tính toán scale vừa vặn khung nhìn với ResizeObserver (chống tràn màn hình 100%)
  useEffect(() => {
    if (externalScale !== undefined) {
      setInternalZoom(externalScale)
      return
    }
    const el = containerRef.current
    if (!el) return

    const updateFitZoom = () => {
      const pad = el.clientWidth < 640 ? 16 : 32
      const availableWidth = el.clientWidth - pad
      if (availableWidth <= 0) return

      if (availableWidth < docBaseWidth) {
        // Cho phép scale co giãn xuống 0.22 để vừa khít cả màn hình nhỏ mà không bị tràn
        const fitScale = Math.max(0.22, Math.min(1.2, Math.floor((availableWidth / docBaseWidth) * 100) / 100))
        setInternalZoom(fitScale)
      } else {
        setInternalZoom(1)
      }
    }

    updateFitZoom()
    const ro = new ResizeObserver(updateFitZoom)
    ro.observe(el)
    return () => ro.disconnect()
  }, [docItem.id, isLoiKhai, paperConfig.orientation, externalScale, docBaseWidth])

  // Lắng nghe Ctrl + Wheel để Zoom In / Out mượt mà
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08
        setInternalZoom((prev) => Math.min(2.0, Math.max(0.25, Math.round((prev + zoomDelta) * 100) / 100)))
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const zoomIn = useCallback(() => {
    setInternalZoom((prev) => Math.min(2.0, Math.round((prev + 0.1) * 10) / 10))
  }, [])

  const zoomOut = useCallback(() => {
    setInternalZoom((prev) => Math.max(0.25, Math.round((prev - 0.1) * 10) / 10))
  }, [])

  const resetZoom = useCallback(() => {
    if (!containerRef.current) {
      setInternalZoom(1)
      return
    }
    const pad = containerRef.current.clientWidth < 640 ? 16 : 32
    const availableWidth = containerRef.current.clientWidth - pad
    if (availableWidth > 0 && availableWidth < docBaseWidth) {
      setInternalZoom(Math.max(0.22, Math.min(1.2, Math.floor((availableWidth / docBaseWidth) * 100) / 100)))
    } else {
      setInternalZoom(1)
    }
  }, [docBaseWidth])

  const activeZoom = externalScale ?? internalZoom
  const scaledWidth = Math.round(docBaseWidth * activeZoom)
  const scaledHeight = Math.round(unscaledHeight * activeZoom)

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full flex flex-col relative overflow-hidden",
        activeTool === 'cursor' ? "select-text" : "select-none",
        // Force selection màu bút nhớ vàng ấm tự nhiên chuẩn tài liệu điều tra
        "[&_::selection]:bg-[#ffe58f] [&_::selection]:text-[#111111]",
        "[&_*::selection]:bg-[#ffe58f] [&_*::selection]:text-[#111111]",
        className
      )}
    >
      {/* FLOATING ANNOTATION & ZOOM TOOLBAR (Căn giữa phía dưới màn hình) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-[#1a120b]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#4a3625] shadow-2xl text-[#d9a066] max-w-[calc(100%-2rem)]">
        {/* NÚT CHỌN CHUỘT THƯỜNG / SELECT TEXT */}
        <button
          type="button"
          onClick={() => setActiveTool('cursor')}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
            activeTool === 'cursor'
              ? "bg-[#d9a066] text-[#1a0f07] font-bold shadow-sm"
              : "hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec]"
          )}
          title="Con trỏ chuột (Bôi đen & sao chép chữ)"
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
          title="Bút vẽ & khoanh tròn tài liệu"
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
          title="Bút nhớ highlight tô màu chữ"
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

        {/* NÚT TẨY XÓA NÉT VẼ */}
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
          title="Ghi chép hồ sơ"
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
          disabled={activeZoom <= 0.4}
          className="p-1.5 rounded hover:bg-[#342417] hover:text-[#fef5ec] disabled:opacity-40 transition-colors cursor-pointer"
          title="Thu nhỏ (Zoom out)"
        >
          <ZoomOut className="size-4" />
        </button>

        <button
          type="button"
          onClick={zoomIn}
          disabled={activeZoom >= 2.0}
          className="p-1.5 rounded hover:bg-[#342417] hover:text-[#fef5ec] disabled:opacity-40 transition-colors cursor-pointer"
          title="Phóng to (Zoom in)"
        >
          <ZoomIn className="size-4" />
        </button>

        <button
          type="button"
          onClick={resetZoom}
          className="p-1.5 rounded hover:bg-[#342417] hover:text-[#fef5ec] transition-colors cursor-pointer"
          title="Đặt lại kích thước vừa vặn (Reset zoom)"
        >
          <RotateCcw className="size-3.5" />
        </button>

        {/* NÚT CHỈ ĐIỂM TÀI LIỆU (PING VĂN BẢN CHO ĐỒNG ĐỘI) */}
        <div className="w-[1px] h-4 bg-[#4a3625] mx-1" />
        <button
          type="button"
          onClick={() => {
            const title = docItem.subject_name ? `Lời khai: ${docItem.subject_name}` : `Hồ sơ #${docItem.tag_code || ''}`
            broadcastPing(`dossier-${docItem.id}`, title, undefined, {
              targetType: 'doc',
              docType: 'pdf',
            })
          }}
          className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/60 transition-colors flex items-center gap-1.5 font-mono text-xs font-bold cursor-pointer"
          title="Chỉ điểm tài liệu này cho toàn bộ đồng đội đang cùng phá án"
        >
          <Target className="size-3.5 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Chỉ điểm</span>
        </button>
      </div>

      {/* SCROLLABLE CANVAS FOR PAPERS */}
      <div className="w-full flex-1 overflow-auto custom-scrollbar p-2 sm:p-5 flex flex-col items-center">
        {/* SIZER BOX: Có kích thước DOM khớp 100% với kích thước đã scale (chống tràn lề và lỗi flex center) */}
        <div
          style={{
            width: `${scaledWidth}px`,
            minWidth: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            minHeight: `${scaledHeight}px`,
            position: 'relative',
          }}
          className="shrink-0 flex justify-center"
        >
          {/* BẢN IN GỐC: Scale từ góc trên bên trái của Sizer Box */}
          <div
            ref={paperWrapperRef}
            style={{
              width: `${docBaseWidth}px`,
              transform: `scale(${activeZoom})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            className="shrink-0 flex flex-col items-center"
          >
            {/* LỚP VẼ ĐÈ TƯƠNG TÁC (ANNOTATION OVERLAY LAYER) */}
            <DossierAnnotationLayer
              documentId={docItem.tag_code || docItem.id || 'default_doc'}
              activeTool={activeTool}
              activeColor={activeColor}
              activeSize={activeSize}
              scale={activeZoom}
              onClearTrigger={clearTrigger}
              width={docBaseWidth}
              height={unscaledHeight}
            />

            {isLoiKhai ? (
              <DossierLoiKhaiSheet
                docItem={docItem}
                docData={docItem.content as LoiKhaiData}
                docPaper={paperConfig}
                readOnly={true}
                isSelected={false}
                highlightEditable={false}
              />
            ) : (
              <DossierLyLichSheet
                docItem={docItem}
                docData={docItem.content as LyLichData}
                docPaper={paperConfig}
                readOnly={true}
                isSelected={false}
                highlightEditable={false}
                showSeal={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
