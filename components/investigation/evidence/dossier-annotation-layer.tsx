'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { getStorageJson, setStorageJson } from '@/lib/storage'
import { useRoomSync } from '@/components/investigation/room-sync-context'
import type { AnnotationStroke } from '@/lib/types/room'

export type AnnotationTool = 'cursor' | 'pen' | 'highlighter' | 'eraser'
export type AnnotationColor = '#dc2626' | '#2563eb' | '#16a34a' | '#eab308' | '#9333ea' | '#171717'
export type { AnnotationStroke }

interface DossierAnnotationLayerProps {
  documentId: string
  activeTool: AnnotationTool
  activeColor: AnnotationColor
  activeSize: number
  scale: number
  onClearTrigger?: number
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

  // Render canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Helper render stroke
    const drawStroke = (s: AnnotationStroke) => {
      if (s.points.length < 2) return

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(s.points[0].x, s.points[0].y)

      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y)
      }

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (s.tool === 'highlighter') {
        ctx.strokeStyle = s.color
        ctx.globalAlpha = 0.4
        ctx.lineWidth = s.size * 3.5
        ctx.globalCompositeOperation = 'multiply'
      } else {
        ctx.strokeStyle = s.color
        ctx.globalAlpha = 0.95
        ctx.lineWidth = s.size
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

  // Auto resize canvas to match parent DOM container exactly
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !canvas.parentElement) return

    const updateSize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.scrollWidth || parent.clientWidth
      const h = parent.scrollHeight || parent.clientHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        redrawCanvas()
      }
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(canvas.parentElement)

    return () => observer.disconnect()
  }, [redrawCanvas])

  // Pointer coordinate relative to canvas
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    // Tọa độ tính trên canvas element chuẩn
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale
    return { x, y }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'cursor') return
    e.currentTarget.setPointerCapture(e.pointerId)
    isDrawingRef.current = true

    const pt = getCanvasPoint(e)

    if (activeTool === 'eraser') {
      // Find stroke closest to eraser point and delete it
      const remaining = strokes.filter((s) => {
        return !s.points.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < 16)
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
    const pt = getCanvasPoint(e)

    if (activeTool === 'eraser') {
      const remaining = strokes.filter((s) => {
        return !s.points.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < 16)
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

    if (currentStrokeRef.current && currentStrokeRef.current.points.length >= 2) {
      // Tối ưu dung lượng: làm tròn tọa độ số nguyên
      const roundedStroke: AnnotationStroke = {
        ...currentStrokeRef.current,
        points: currentStrokeRef.current.points.map((p) => ({
          x: Math.round(p.x),
          y: Math.round(p.y),
        })),
      }
      const newStrokes = [...strokes, roundedStroke]
      setStrokes(newStrokes)
      setStorageJson(storageKey, newStrokes)

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
      }}
      className="absolute inset-0 w-full h-full z-30"
    />
  )
}
