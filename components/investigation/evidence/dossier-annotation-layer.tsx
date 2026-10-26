'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { getStorageJson, setStorageJson } from '@/lib/storage'
import { useRoomSync } from '@/components/investigation/room-sync-context'
import { recordAnnotationStroke } from '@/lib/annotation-history'
import type { AnnotationStroke } from '@/lib/types/room'

export type AnnotationTool = 'cursor' | 'pen' | 'highlighter' | 'eraser'
export type AnnotationColor = string
export type { AnnotationStroke }

interface DossierAnnotationLayerProps {
  documentId: string
  activeTool: AnnotationTool
  activeColor: AnnotationColor
  activeSize: number
  scale: number
  onClearTrigger?: number
  width?: number
  height?: number
}

/**
 * Lớp phủ vẽ, khoanh tròn, đánh dấu bút nhớ (Highlighter) trên văn bản hồ sơ.
 * Tọa độ lưu theo pixel chuẩn gốc của văn bản, tự động co giãn theo tỉ lệ zoom.
 * Hỗ trợ đồng bộ Realtime đa thiết bị qua RoomSync (nhóm thám tử cùng soi tài liệu).
 */
export function DossierAnnotationLayer({
  documentId,
  activeTool,
  activeColor,
  activeSize,
  scale,
  onClearTrigger,
  width: explicitWidth,
  height: explicitHeight,
}: DossierAnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [strokes, setStrokes] = useState<AnnotationStroke[]>([])
  const isDrawingRef = useRef(false)
  const hasErasedRef = useRef(false)
  const currentStrokeRef = useRef<AnnotationStroke | null>(null)

  const { roomCode, roomState, syncUpdate } = useRoomSync()
  const storageKey = `dossier_annotations_${documentId}`

  // Load saved strokes from localStorage (Solo) or Room state (Group)
  useEffect(() => {
    if (roomCode && roomState.annotations) {
      const roomStrokes = roomState.annotations[documentId] || []
      setStrokes(roomStrokes)
    } else {
      const saved = getStorageJson<AnnotationStroke[]>(storageKey, [])
      setStrokes(saved)
    }
  }, [storageKey, roomCode, documentId])

  // Realtime sync from room updates
  useEffect(() => {
    if (roomCode && roomState.annotations && !isDrawingRef.current) {
      const remote = roomState.annotations[documentId] || []
      setStrokes(remote)
    }
  }, [roomCode, roomState.annotations, documentId])

  // Clear all annotations when trigger changes
  useEffect(() => {
    if (onClearTrigger && onClearTrigger > 0) {
      setStrokes([])
      setStorageJson(storageKey, [])
      if (roomCode) {
        syncUpdate(
          { annotations: { [documentId]: [] } },
          `đã xóa toàn bộ ghi chú trên hồ sơ ${documentId}`
        )
      }
    }
  }, [onClearTrigger, storageKey, roomCode, documentId, syncUpdate])

  // Lắng nghe sự kiện Hoàn tác (Undo Ctrl+Z) và Làm lại (Redo Ctrl+Y)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleUndo = (e: Event) => {
      const customEvent = e as CustomEvent<{ documentId: string; strokeId?: string }>
      if (customEvent.detail?.documentId !== documentId) return

      setStrokes((prev) => {
        if (prev.length === 0) return prev
        let next: AnnotationStroke[]
        if (customEvent.detail?.strokeId) {
          next = prev.filter((s) => s.id !== customEvent.detail.strokeId)
        } else {
          next = prev.slice(0, -1)
        }
        setStorageJson(storageKey, next)
        if (roomCode) {
          syncUpdate(
            { annotations: { [documentId]: next } },
            `đã hoàn tác nét vẽ trên hồ sơ ${documentId}`
          )
        }
        return next
      })
    }

    const handleRedo = (e: Event) => {
      const customEvent = e as CustomEvent<{ documentId: string; stroke: AnnotationStroke }>
      if (customEvent.detail?.documentId !== documentId) return
      if (!customEvent.detail?.stroke) return

      setStrokes((prev) => {
        const next = [...prev, customEvent.detail.stroke]
        setStorageJson(storageKey, next)
        if (roomCode) {
          syncUpdate(
            { annotations: { [documentId]: next } },
            `đã làm lại nét vẽ trên hồ sơ ${documentId}`
          )
        }
        return next
      })
    }

    window.addEventListener('dossier:annotation-undo', handleUndo)
    window.addEventListener('dossier:annotation-redo', handleRedo)
    return () => {
      window.removeEventListener('dossier:annotation-undo', handleUndo)
      window.removeEventListener('dossier:annotation-redo', handleRedo)
    }
  }, [documentId, storageKey, roomCode, syncUpdate])

  // Render canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const w = canvas.width
    const h = canvas.height
    if (w <= 0 || h <= 0) return

    // Tỉ lệ scale độ dày nét bút theo độ rộng chuẩn 800px của tài liệu
    const strokeScale = Math.max(0.4, Math.min(2.5, w / 800))

    // Helper render stroke
    const drawStroke = (s: AnnotationStroke) => {
      if (!s.points || s.points.length === 0) return

      // Tương thích ngược: Nếu tọa độ cũ lưu dạng pixel tuyệt đối (> 1.05) thì giữ nguyên, ngược lại nhân với w, h
      const isLegacy = s.points.some((p) => p.x > 1.05 || p.y > 1.05)
      const getX = (p: { x: number; y: number }) => (isLegacy ? p.x : p.x * w)
      const getY = (p: { x: number; y: number }) => (isLegacy ? p.y : p.y * h)

      const effectiveLineWidth = Math.max(1, s.size * strokeScale)

      ctx.save()

      // Trường hợp chấm điểm đơn (1 point)
      if (s.points.length === 1) {
        ctx.fillStyle = s.color
        ctx.beginPath()
        const radius = (s.tool === 'highlighter' ? effectiveLineWidth * 2 : effectiveLineWidth) / 2
        ctx.arc(getX(s.points[0]), getY(s.points[0]), Math.max(1.5, radius), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        return
      }

      ctx.beginPath()
      ctx.moveTo(getX(s.points[0]), getY(s.points[0]))

      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(getX(s.points[i]), getY(s.points[i]))
      }

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (s.tool === 'highlighter') {
        ctx.strokeStyle = s.color
        ctx.globalAlpha = 0.4
        ctx.lineWidth = effectiveLineWidth * 3.5
        ctx.globalCompositeOperation = 'multiply'
      } else {
        ctx.strokeStyle = s.color
        ctx.globalAlpha = 0.95
        ctx.lineWidth = effectiveLineWidth
        ctx.globalCompositeOperation = 'source-over'
      }

      ctx.stroke()
      ctx.restore()
    }

    strokes.forEach(drawStroke)

    if (currentStrokeRef.current) {
      drawStroke(currentStrokeRef.current)
    }
  }, [strokes])

  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas, strokes])

  // Auto resize canvas to match explicit dimensions or parent DOM container exactly
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (explicitWidth && explicitHeight && explicitWidth > 0 && explicitHeight > 0) {
      const w = Math.round(explicitWidth)
      const h = Math.round(explicitHeight)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        redrawCanvas()
      }
      return
    }

    if (!canvas.parentElement) return

    const updateSize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.scrollWidth || parent.clientWidth
      const h = parent.scrollHeight || parent.clientHeight
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w
        canvas.height = h
        redrawCanvas()
      }
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(canvas.parentElement)

    return () => observer.disconnect()
  }, [explicitWidth, explicitHeight, redrawCanvas])

  // Tọa độ chuẩn hóa [0..1] độc lập với zoom, độ phân giải và co giãn cửa sổ
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 }
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    return { x, y }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'cursor') return
    e.currentTarget.setPointerCapture(e.pointerId)
    isDrawingRef.current = true

    const canvas = canvasRef.current
    const w = canvas?.width || 800
    const h = canvas?.height || 1100
    const pt = getCanvasPoint(e)

    if (activeTool === 'eraser') {
      // Find stroke closest to eraser point (ngưỡng 22px thực tế)
      const remaining = strokes.filter((s) => {
        const isLegacy = s.points.some((p) => p.x > 1.05 || p.y > 1.05)
        return !s.points.some((p) => {
          const px = isLegacy ? p.x : p.x * w
          const py = isLegacy ? p.y : p.y * h
          const ptx = pt.x * w
          const pty = pt.y * h
          return Math.hypot(px - ptx, py - pty) < 22
        })
      })
      if (remaining.length !== strokes.length) {
        setStrokes(remaining)
        setStorageJson(storageKey, remaining)
        hasErasedRef.current = true
      }
      return
    }

    currentStrokeRef.current = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tool: activeTool,
      color: activeColor,
      size: activeSize,
      points: [pt],
    }
    redrawCanvas()
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    const w = canvas?.width || 800
    const h = canvas?.height || 1100
    const pt = getCanvasPoint(e)

    if (activeTool === 'eraser') {
      const remaining = strokes.filter((s) => {
        const isLegacy = s.points.some((p) => p.x > 1.05 || p.y > 1.05)
        return !s.points.some((p) => {
          const px = isLegacy ? p.x : p.x * w
          const py = isLegacy ? p.y : p.y * h
          const ptx = pt.x * w
          const pty = pt.y * h
          return Math.hypot(px - ptx, py - pty) < 22
        })
      })
      if (remaining.length !== strokes.length) {
        setStrokes(remaining)
        setStorageJson(storageKey, remaining)
        hasErasedRef.current = true
      }
      return
    }

    if (currentStrokeRef.current) {
      currentStrokeRef.current.points.push(pt)
      redrawCanvas()
    }
  }

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false

    if (currentStrokeRef.current && currentStrokeRef.current.points.length >= 1) {
      // Tối ưu dung lượng: làm tròn tọa độ số thập phân 4 chữ số (độ chính xác 1/10000)
      const roundedStroke: AnnotationStroke = {
        ...currentStrokeRef.current,
        points: currentStrokeRef.current.points.map((p) => ({
          x: Math.round(p.x * 10000) / 10000,
          y: Math.round(p.y * 10000) / 10000,
        })),
      }
      const newStrokes = [...strokes, roundedStroke]
      setStrokes(newStrokes)
      setStorageJson(storageKey, newStrokes)
      recordAnnotationStroke(documentId, roundedStroke)

      if (roomCode) {
        syncUpdate(
          { annotations: { [documentId]: newStrokes } },
          `đã đánh dấu trên hồ sơ ${documentId}`
        )
      }
    } else if (hasErasedRef.current) {
      hasErasedRef.current = false
      if (roomCode) {
        syncUpdate(
          { annotations: { [documentId]: strokes } },
          `đã tẩy bớt ghi chú trên hồ sơ ${documentId}`
        )
      }
    }

    currentStrokeRef.current = null
    redrawCanvas()
  }

  const getCursorStyle = (): React.CSSProperties => {
    switch (activeTool) {
      case 'pen':
        // Con trỏ hình bút bi đỏ/mực điều tra với đầu ngòi ở góc dưới trái (hotspot: 2, 22)
        return {
          cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4-12 12H6v-4L18 2z"/><path d="m14 6 4 4"/></svg>') 2 22, crosshair`,
        }
      case 'highlighter':
        // Con trỏ hình bút dạ quang highlight (hotspot: 2, 22)
        return {
          cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23facc15" stroke="%23854d0e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h3l6-6"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>') 2 22, cell`,
        }
      case 'eraser':
        // Con trỏ hình cục tẩy điều tra (hotspot: 6, 18)
        return {
          cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23fca5a5" stroke="%23991b1b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>') 6 18, pointer`,
        }
      default:
        return { cursor: 'default' }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        pointerEvents: activeTool === 'cursor' ? 'none' : 'auto',
        touchAction: 'none',
        ...getCursorStyle(),
      }}
      className="absolute inset-0 w-full h-full z-30"
    />
  )
}
