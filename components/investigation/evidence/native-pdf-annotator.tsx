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
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DossierAnnotationLayer,
  type AnnotationTool,
  type AnnotationColor,
} from './dossier-annotation-layer'

interface NativePdfAnnotatorProps {
  url: string
  title: string
  docCode?: string
  className?: string
}

const COLOR_PALETTE: { color: AnnotationColor; label: string }[] = [
  { color: '#dc2626', label: 'Bút đỏ nghiệp vụ' },
  { color: '#2563eb', label: 'Bút xanh mực máy' },
  { color: '#eab308', label: 'Bút nhớ vàng chanh' },
  { color: '#16a34a', label: 'Bút xanh lá cây' },
  { color: '#9333ea', label: 'Bút tím ghi chú' },
  { color: '#171717', label: 'Bút chì đen' },
]

export function NativePdfAnnotator({
  url,
  title,
  docCode,
  className,
}: NativePdfAnnotatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [zoom, setZoom] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Annotation states
  const [activeTool, setActiveTool] = useState<AnnotationTool>('cursor')
  const [activeColor, setActiveColor] = useState<AnnotationColor>('#dc2626')
  const [activeSize, setActiveSize] = useState<number>(3)
  const [clearTrigger, setClearTrigger] = useState<number>(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfDocRef = useRef<any>(null)
  const renderTaskRef = useRef<any>(null)

  // Extract clean URL without fragment #...
  const cleanUrl = url.split('#')[0]
  const documentId = `pdf_${docCode || title.replace(/[^a-zA-Z0-9]/g, '_')}_p${currentPage}`

  // Load PDF Document via PDF.js
  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setError(null)

    async function loadPdf() {
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs')
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
        }

        const loadingTask = pdfjs.getDocument({
          url: cleanUrl,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
          cMapPacked: true,
        })

        const pdf = await loadingTask.promise
        if (isCancelled) return

        pdfDocRef.current = pdf
        setNumPages(pdf.numPages)
        setCurrentPage(1)
        setLoading(false)
      } catch (err: any) {
        if (!isCancelled) {
          console.error('PDF.js failed to load, falling back:', err)
          setError(err?.message || 'Không thể nạp nội dung PDF trực tiếp.')
          setLoading(false)
        }
      }
    }

    loadPdf()

    return () => {
      isCancelled = true
    }
  }, [cleanUrl])

  // Render current page to Canvas
  const renderPage = useCallback(async (pageNumber: number, targetScale: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
      }

      const page = await pdfDocRef.current.getPage(pageNumber)
      const viewport = page.getViewport({ scale: targetScale * 1.5 }) // 1.5x resolution for sharp text on retina screens

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (!context) return

      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.style.width = `${viewport.width / 1.5}px`
      canvas.style.height = `${viewport.height / 1.5}px`

      const renderContext = {
        canvasContext: context,
        viewport,
      }

      const task = page.render(renderContext)
      renderTaskRef.current = task
      await task.promise
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering PDF page:', err)
      }
    }
  }, [])

  useEffect(() => {
    if (pdfDocRef.current && !loading) {
      renderPage(currentPage, zoom)
    }
  }, [currentPage, zoom, loading, renderPage])

  // Auto fit width on mount
  useEffect(() => {
    const updateFitZoom = () => {
      if (!containerRef.current) return
      const availableWidth = containerRef.current.clientWidth - 48
      if (availableWidth > 0 && availableWidth < 800) {
        setZoom(Math.max(0.4, Math.min(1.2, Math.round((availableWidth / 800) * 100) / 100)))
      }
    }
    updateFitZoom()
    window.addEventListener('resize', updateFitZoom)
    return () => window.removeEventListener('resize', updateFitZoom)
  }, [])

  // Ctrl + Wheel to Zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08
        setZoom((prev) => Math.min(2.5, Math.max(0.4, Math.round((prev + zoomDelta) * 100) / 100)))
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const zoomIn = () => setZoom((prev) => Math.min(2.5, Math.round((prev + 0.1) * 10) / 10))
  const zoomOut = () => setZoom((prev) => Math.max(0.4, Math.round((prev - 0.1) * 10) / 10))
  const resetZoom = () => setZoom(1)

  // Nếu lỗi (ví dụ file Drive không có CORS hoặc link preview), fallback về iframe chuẩn
  if (error) {
    return (
      <iframe
        src={url}
        className={cn('w-full h-full border-0 block', className)}
        title={title}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full flex flex-col relative overflow-hidden bg-[#0d0906]",
        activeTool === 'cursor' ? "select-auto" : "select-none",
        className
      )}
    >
      {/* FLOATING ANNOTATION & ZOOM TOOLBAR */}
      <div className="absolute bottom-4 right-4 z-40 flex items-center gap-1.5 bg-[#1a120b]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#4a3625] shadow-2xl text-[#d9a066]">
        {/* NÚT CHỌN CON TRỎ */}
        <button
          type="button"
          onClick={() => setActiveTool('cursor')}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
            activeTool === 'cursor'
              ? "bg-[#d9a066] text-[#1a0f07] font-bold shadow-sm"
              : "hover:bg-[#342417] text-[#ad9885] hover:text-[#fef5ec]"
          )}
          title="Con trỏ thông thường"
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
          title="Bút vẽ & khoanh tròn PDF"
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
          title="Bút dạ quang highlight chữ trong PDF"
        >
          <Highlighter className="size-4" />
        </button>

        {/* BẢNG CHỌN MÀU */}
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

        {/* TẨY NÉT VẼ */}
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

        {/* XÓA TẤT CẢ NÉT VẼ */}
        <button
          type="button"
          onClick={() => setClearTrigger(Date.now())}
          className="p-1.5 rounded-lg hover:bg-red-950/80 text-[#ad9885] hover:text-red-400 transition-colors cursor-pointer"
          title="Xóa hết hình vẽ trên trang PDF này"
        >
          <Trash2 className="size-4" />
        </button>

        <div className="w-[1px] h-4 bg-[#4a3625] mx-1" />

        {/* CHUYỂN TRANG PDF NẾU CÓ NHIỀU TRANG */}
        {numPages > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded hover:bg-[#342417] hover:text-[#fef5ec] disabled:opacity-40 transition-colors cursor-pointer"
              title="Trang trước"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-mono text-xs font-bold text-[#e5d8cb] select-none">
              {currentPage}/{numPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              className="p-1.5 rounded hover:bg-[#342417] hover:text-[#fef5ec] disabled:opacity-40 transition-colors cursor-pointer"
              title="Trang tiếp"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="w-[1px] h-4 bg-[#4a3625] mx-1" />
          </>
        )}

        {/* ZOOM CONTROLS */}
        <button
          type="button"
          onClick={zoomOut}
          disabled={zoom <= 0.4}
          className="p-1.5 rounded hover:bg-[#342417] hover:text-[#fef5ec] disabled:opacity-40 transition-colors cursor-pointer"
          title="Thu nhỏ (Zoom out)"
        >
          <ZoomOut className="size-4" />
        </button>

        <span className="font-mono text-xs font-bold px-1 min-w-[38px] text-center text-[#e5d8cb] select-none">
          {Math.round(zoom * 100)}%
        </span>

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
          title="Đặt lại kích thước vừa vặn (Reset zoom)"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* PDF CANVAS BODY */}
      <div className="w-full flex-1 overflow-auto custom-scrollbar p-4 sm:p-6 flex flex-col items-center">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#d9a066]">
            <Loader2 className="size-6 animate-spin text-[#d9a066]" />
            <span className="font-mono text-xs text-[#ad9885]">Đang giải mã trang PDF điều tra...</span>
          </div>
        ) : (
          <div className="relative shadow-2xl bg-white shrink-0 my-auto">
            {/* Lớp vẽ khoanh tròn và tô màu dạ quang */}
            <DossierAnnotationLayer
              documentId={documentId}
              activeTool={activeTool}
              activeColor={activeColor}
              activeSize={activeSize}
              scale={1}
              onClearTrigger={clearTrigger}
            />

            {/* Canvas render nội dung trang PDF */}
            <canvas ref={canvasRef} className="block select-none" />
          </div>
        )}
      </div>
    </div>
  )
}
