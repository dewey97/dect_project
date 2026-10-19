'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { DbDossierDocument } from '@/lib/actions/dossier-actions'
import type { LoiKhaiData, LyLichData } from '@/types/dossier'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoomSync } from '@/components/investigation/room-sync-context'
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
  const { roomCode } = useRoomSync()

  // Annotation states
  const [activeTool, setActiveTool] = useState<AnnotationTool>('cursor')
  const [activeColor, setActiveColor] = useState<AnnotationColor>('#dc2626')
  const [activeSize, setActiveSize] = useState<number>(3)
  const [clearTrigger, setClearTrigger] = useState<number>(0)

  // Tính toán scale ban đầu để tờ giấy vừa vặn chiều rộng khung nhìn
  useEffect(() => {
    if (externalScale !== undefined) {
      setInternalZoom(externalScale)
      return
    }
    const updateFitZoom = () => {
      if (!containerRef.current) return
      const availableWidth = containerRef.current.clientWidth - 32 // trừ padding 16px mỗi bên
      if (availableWidth <= 0) return

      // Chiều rộng thiết kế của văn bản
      const docBaseWidth = isLoiKhai
        ? paperConfig.orientation === 'portrait' ? 794 : 1123
        : 1050 // Lý Lịch đôi

      if (availableWidth < docBaseWidth) {
        const fitScale = Math.max(0.4, Math.min(1, Math.floor((availableWidth / docBaseWidth) * 100) / 100))
        setInternalZoom(fitScale)
      } else {
        setInternalZoom(1)
      }
    }

    updateFitZoom()
    window.addEventListener('resize', updateFitZoom)
    return () => window.removeEventListener('resize', updateFitZoom)
  }, [docItem.id, isLoiKhai, paperConfig.orientation, externalScale])

  // Lắng nghe Ctrl + Wheel để Zoom In / Out mượt mà
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08
        setInternalZoom((prev) => Math.min(2.0, Math.max(0.4, Math.round((prev + zoomDelta) * 100) / 100)))
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const zoomIn = useCallback(() => {
    setInternalZoom((prev) => Math.min(2.0, Math.round((prev + 0.1) * 10) / 10))
  }, [])

  const zoomOut = useCallback(() => {
    setInternalZoom((prev) => Math.max(0.4, Math.round((prev - 0.1) * 10) / 10))
  }, [])

  const resetZoom = useCallback(() => {
    if (!containerRef.current) {
      setInternalZoom(1)
      return
    }
    const availableWidth = containerRef.current.clientWidth - 32
    const docBaseWidth = isLoiKhai
      ? paperConfig.orientation === 'portrait' ? 794 : 1123
      : 1050
    if (availableWidth > 0 && availableWidth < docBaseWidth) {
      setInternalZoom(Math.max(0.4, Math.min(1, Math.floor((availableWidth / docBaseWidth) * 100) / 100)))
    } else {
      setInternalZoom(1)
    }
  }, [isLoiKhai, paperConfig.orientation])

  const activeZoom = externalScale ?? internalZoom

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
      {/* FLOATING ANNOTATION & ZOOM TOOLBAR (Góc dưới bên phải giống Adobe Acrobat & Studio) */}
      <div className="absolute bottom-4 right-4 z-40 flex items-center gap-1.5 bg-[#1a120b]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#4a3625] shadow-2xl text-[#d9a066]">
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
            if (activeColor === '#eab308') setActiveColor('#dc2626')
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
            setActiveColor('#eab308')
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

        {/* BẢNG CHỌN MÀU BÚT KHI ĐANG VẼ / TÔ */}
        {activeTool !== 'cursor' && activeTool !== 'eraser' && (
          <div className="flex items-center gap-1 px-1 border-l border-r border-[#4a3625]/80 mx-0.5">
            {COLOR_PALETTE.map((p) => (
              <button
                key={p.color}
                type="button"
                onClick={() => setActiveColor(p.color)}
                style={{ backgroundColor: p.color }}
                className={cn(
                  "size-4 rounded-full transition-transform cursor-pointer border border-white/20",
                  activeColor === p.color && "scale-125 ring-2 ring-[#d9a066] ring-offset-1 ring-offset-[#1a120b]"
                )}
                title={p.label}
              />
            ))}
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

        {/* NÚT XÓA TOÀN BỘ GHI CHÚ TRÊN VĂN BẢN NÀY */}
        <button
          type="button"
          onClick={() => setClearTrigger(Date.now())}
          className="p-1.5 rounded-lg hover:bg-red-950/80 text-[#ad9885] hover:text-red-400 transition-colors cursor-pointer"
          title="Xóa hết toàn bộ hình vẽ trên hồ sơ này"
        >
          <Trash2 className="size-4" />
        </button>

        {roomCode && (
          <span
            className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/50 text-[0.62rem] text-emerald-300 font-mono select-none"
            title={`Nét vẽ đang được đồng bộ trực tiếp với tổ chuyên án phòng ${roomCode}`}
          >
            <Users className="size-3 text-emerald-400" />
            <span>Phòng {roomCode}</span>
          </span>
        )}

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

        <span className="font-mono text-xs font-bold px-1 min-w-[38px] text-center text-[#e5d8cb] select-none">
          {Math.round(activeZoom * 100)}%
        </span>

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
      </div>

      {/* SCROLLABLE CANVAS FOR PAPERS */}
      <div className="w-full flex-1 overflow-auto custom-scrollbar p-4 sm:p-6 flex flex-col items-center">
        <div
          style={{
            transform: `scale(${activeZoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            marginBottom: `${Math.max(0, (activeZoom - 1) * 800)}px`,
          }}
          className="shrink-0 flex flex-col items-center relative"
        >
          {/* LỚP VẼ ĐÈ TƯƠNG TÁC (ANNOTATION OVERLAY LAYER) */}
          <DossierAnnotationLayer
            documentId={docItem.tag_code || docItem.id || 'default_doc'}
            activeTool={activeTool}
            activeColor={activeColor}
            activeSize={activeSize}
            scale={activeZoom}
            onClearTrigger={clearTrigger}
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
  )
}
