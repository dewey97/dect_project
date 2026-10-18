'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  MousePointer,
  Waves,
  Milestone,
  TrainTrack,
  LandPlot,
  MapPin,
  Type,
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  Layers,
  Sliders,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Copy,
  Sparkles,
  RefreshCw,
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  Point,
  MapVectorData,
  MapStudioTool,
  WaterFeature,
  WaterType,
  RoadFeature,
  RoadType,
  RailwayFeature,
  ZoneFeature,
  ZoneCategory,
  PoiFeature,
  PoiCategory,
  LabelFeature
} from '@/types/map-vector'
import {
  pointsToSvgPath,
  generateRailwayPaths,
  snapPoint,
  getDefaultMapVectorData
} from '@/lib/map-vector-utils'

// Color palettes for authentic urban vector map aesthetic
const WATER_COLORS = ['#97C8EB', '#71B4EC', '#55CBE8', '#3498DB', '#1D4ED8', '#A4CEEC']
const ROAD_COLORS = ['#FFFFFF', '#F8FAFC', '#FEF3C7', '#FDE047', '#E2E8F0', '#94A3B8']
const ZONE_COLORS = ['#E2E8F0', '#D1E7DD', '#FEF3C7', '#FCE7F3', '#E0E7FF', '#F1F5F9']
const POI_CATEGORY_CONFIG: Record<
  PoiCategory,
  { label: string; color: string; badgeBg: string }
> = {
  crime_scene: { label: 'Hiện trường vụ án', color: '#EA4335', badgeBg: 'bg-red-500' },
  residential: { label: 'Nhà ở / Nhà trọ', color: '#1A73E8', badgeBg: 'bg-blue-500' },
  transit: { label: 'Giao thông / Bến bãi', color: '#0F9D58', badgeBg: 'bg-emerald-500' },
  dock: { label: 'Cảng biển / Bến đò', color: '#0284C7', badgeBg: 'bg-sky-500' },
  warehouse: { label: 'Kho hàng / Xưởng', color: '#F59E0B', badgeBg: 'bg-amber-500' },
  food: { label: 'Quán ăn / Nhà hàng', color: '#EA580C', badgeBg: 'bg-orange-500' },
  secret: { label: 'Điểm bí mật / Khả nghi', color: '#9333EA', badgeBg: 'bg-purple-500' }
}

export default function MapStudioPage() {
  // Core Map Vector Data
  const [mapData, setMapData] = useState<MapVectorData>(() => getDefaultMapVectorData('case_000'))
  const [history, setHistory] = useState<MapVectorData[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)

  // Canvas Viewport Pan & Zoom
  const [zoom, setZoom] = useState<number>(0.75)
  const [pan, setPan] = useState<Point>({ x: 80, y: 50 })
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  const panRef = useRef(pan)
  panRef.current = pan
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef<Point>({ x: 0, y: 0 })

  // Active Tool & State
  const [activeTool, setActiveTool] = useState<MapStudioTool>('select')
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null)
  const [isDraggingVertex, setIsDraggingVertex] = useState(false)

  // In-progress Drawing State
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([])
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0, y: 0 })

  // Tool Sub-options
  const [waterType, setWaterType] = useState<WaterType>('river')
  const [roadType, setRoadType] = useState<RoadType>('highway')
  const [zoneCategory, setZoneCategory] = useState<ZoneCategory>('port')
  const [poiCategory, setPoiCategory] = useState<PoiCategory>('crime_scene')

  // Canvas Settings
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(25)
  const [hiddenFeatureIds, setHiddenFeatureIds] = useState<Record<string, boolean>>({})
  const [showPhoneOverlay, setShowPhoneOverlay] = useState(false)
  const [viewMode, setViewMode] = useState<'admin' | 'player'>('admin')
  const [filterLayer, setFilterLayer] = useState<'all' | 'water' | 'roads' | 'railways' | 'zones' | 'pois' | 'labels'>('all')
  const [layerSearchText, setLayerSearchText] = useState('')

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activeSidebarTab, setActiveSidebarTab] = useState<'inspector' | 'layers'>('inspector')

  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const isSpacePressedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 1. Load initial data from API
  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const res = await fetch('/api/admin/map-vector?caseId=case_000')
        const json = await res.json()
        if (json.success && json.data && isMounted) {
          setMapData(json.data)
          setHistory([json.data])
          setHistoryIndex(0)
        }
      } catch (err) {
        console.warn('Could not load map vector from server, using default seed:', err)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  // Push state to undo/redo history
  const pushHistory = useCallback(
    (newData: MapVectorData) => {
      setMapData(newData)
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1)
        return [...sliced, newData]
      })
      setHistoryIndex((prev) => prev + 1)
      setSaveStatus('idle')
    },
    [historyIndex]
  )

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setMapData(history[newIndex])
      setSelectedFeatureId(null)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setMapData(history[newIndex])
      setSelectedFeatureId(null)
    }
  }

  // Save map data to API
  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    try {
      const res = await fetch('/api/admin/map-vector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: mapData.caseId || 'case_000',
          mapData
        })
      })
      const json = await res.json()
      if (json.success) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mapData, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${mapData.caseId}_vector_map.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (parsed.water && parsed.roads) {
          pushHistory(parsed)
          alert('Đã nạp bản đồ thành công!')
        } else {
          alert('File JSON không đúng định dạng Map Vector!')
        }
      } catch {
        alert('Lỗi đọc file JSON!')
      }
    }
    reader.readAsText(file)
  }

  // Khôi phục bản đồ Figma Master đầy đủ từ database
  const handleResetToFigmaMaster = async () => {
    if (
      window.confirm(
        'Nạp lại toàn bộ Bản đồ Figma Master quét từ database? Các chỉnh sửa chưa lưu sẽ bị ghi đè.'
      )
    ) {
      try {
        const res = await fetch('/api/admin/map-vector?caseId=case_000')
        const json = await res.json()
        if (json.success && json.data) {
          pushHistory(json.data)
          return
        }
      } catch (err) {
        console.warn('Could not re-fetch from API, using default seed fallback:', err)
      }
      const figmaData = getDefaultMapVectorData(mapData.caseId || 'case_000')
      pushHistory(figmaData)
    }
  }

  // Nhân bản đối tượng đang chọn (Ctrl+D)
  const handleDuplicateSelected = () => {
    if (!selectedFeatureId) return
    const offset = 40
    const offsetPoints = (pts: Point[]) => pts.map((p) => ({ x: p.x + offset, y: p.y + offset }))

    const newWater = mapData.water.find((w) => w.id === selectedFeatureId)
    if (newWater) {
      const dup = {
        ...newWater,
        id: `water-${Date.now()}`,
        name: `${newWater.name} (Bản sao)`,
        points: offsetPoints(newWater.points)
      }
      pushHistory({ ...mapData, water: [...mapData.water, dup] })
      setSelectedFeatureId(dup.id)
      return
    }
    const newRoad = mapData.roads.find((r) => r.id === selectedFeatureId)
    if (newRoad) {
      const dup = {
        ...newRoad,
        id: `road-${Date.now()}`,
        name: `${newRoad.name} (Bản sao)`,
        points: offsetPoints(newRoad.points)
      }
      pushHistory({ ...mapData, roads: [...mapData.roads, dup] })
      setSelectedFeatureId(dup.id)
      return
    }
    const newRw = mapData.railways.find((rw) => rw.id === selectedFeatureId)
    if (newRw) {
      const dup = {
        ...newRw,
        id: `railway-${Date.now()}`,
        name: `${newRw.name} (Bản sao)`,
        points: offsetPoints(newRw.points)
      }
      pushHistory({ ...mapData, railways: [...mapData.railways, dup] })
      setSelectedFeatureId(dup.id)
      return
    }
    const newZone = mapData.zones.find((z) => z.id === selectedFeatureId)
    if (newZone) {
      const dup = {
        ...newZone,
        id: `zone-${Date.now()}`,
        name: `${newZone.name} (Bản sao)`,
        points: offsetPoints(newZone.points)
      }
      pushHistory({ ...mapData, zones: [...mapData.zones, dup] })
      setSelectedFeatureId(dup.id)
      return
    }
    const newPoi = mapData.pois.find((p) => p.id === selectedFeatureId)
    if (newPoi) {
      const dup = {
        ...newPoi,
        id: `poi-${Date.now()}`,
        name: `${newPoi.name} (Bản sao)`,
        x: newPoi.x + offset,
        y: newPoi.y + offset
      }
      pushHistory({ ...mapData, pois: [...mapData.pois, dup] })
      setSelectedFeatureId(dup.id)
      return
    }
    const newLabel = mapData.labels.find((l) => l.id === selectedFeatureId)
    if (newLabel) {
      const dup = {
        ...newLabel,
        id: `label-${Date.now()}`,
        text: `${newLabel.text} (Bản sao)`,
        x: newLabel.x + offset,
        y: newLabel.y + offset
      }
      pushHistory({ ...mapData, labels: [...mapData.labels, dup] })
      setSelectedFeatureId(dup.id)
      return
    }
  }

  // Screen to Canvas Coordinates Converter
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | React.TouchEvent | MouseEvent): Point => {
      if (!containerRef.current) return { x: 0, y: 0 }
      const rect = containerRef.current.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      const rawX = (clientX - rect.left - pan.x) / zoom
      const rawY = (clientY - rect.top - pan.y) / zoom

      // Collect all existing vertices for magnetic snapping
      const allPoints: Point[] = []
      if (snapToGrid) {
        mapData.roads.forEach((r) => allPoints.push(...r.points))
        mapData.railways.forEach((rw) => allPoints.push(...rw.points))
        mapData.water.forEach((w) => allPoints.push(...w.points))
        mapData.pois.forEach((p) => allPoints.push({ x: p.x, y: p.y }))
      }

      return snapPoint({ x: rawX, y: rawY }, gridSize, snapToGrid, allPoints, 14)
    },
    [pan, zoom, snapToGrid, gridSize, mapData]
  )

  // Find currently selected feature
  const selectedFeature = useMemo(() => {
    if (!selectedFeatureId) return null
    return (
      mapData.water.find((w) => w.id === selectedFeatureId) ||
      mapData.zones.find((z) => z.id === selectedFeatureId) ||
      mapData.roads.find((r) => r.id === selectedFeatureId) ||
      mapData.railways.find((rw) => rw.id === selectedFeatureId) ||
      mapData.pois.find((p) => p.id === selectedFeatureId) ||
      mapData.labels.find((l) => l.id === selectedFeatureId) ||
      null
    )
  }, [selectedFeatureId, mapData])

  // Native Non-Passive Wheel Event Listener on Canvas Container:
  // - Vị trí chuột ở TRONG Canvas:
  //   + Ctrl / Command + Wheel: Zoom Canvas mượt mà theo vị trí con trỏ chuột, chặn hoàn toàn Browser Zoom
  //   + Cuộn chuột thông thường (không Ctrl): Pan / di chuyển góc nhìn Canvas (Shift + Wheel = cuộn ngang)
  // - Vị trí chuột ở NGOÀI Canvas (Topbar, Toolbar trái, Sidebar phải):
  //   + Hệ thống không can thiệp, trình duyệt tự bắt Ctrl + Wheel để Zoom tổng thể toàn trang (Browser Zoom)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Chặn hoàn toàn trình duyệt zoom toàn trang khi chuột đang ở trong Canvas
        e.preventDefault()
        e.stopPropagation()

        const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89
        const currentZoom = zoomRef.current
        const currentPan = panRef.current
        const newZoom = Math.min(4.0, Math.max(0.15, currentZoom * zoomFactor))

        const rect = container.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        setPan({
          x: mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom),
          y: mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom)
        })
        setZoom(newZoom)
      } else {
        // Cuộn chuột bình thường trong canvas: Pan góc nhìn
        e.preventDefault()
        setPan((prev) => ({
          x: prev.x - (e.shiftKey ? e.deltaY : e.deltaX),
          y: prev.y - (e.shiftKey ? 0 : e.deltaY)
        }))
      }
    }

    container.addEventListener('wheel', onNativeWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', onNativeWheel)
    }
  }, [])

  // Pointer Down on Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Middle click or Spacebar or Pan tool triggers panning
    if (e.button === 1 || activeTool === 'pan' || isSpacePressedRef.current) {
      setIsPanning(true)
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
      return
    }

    if (e.button !== 0) return
    const pt = getCanvasCoords(e)

    // Tool: SELECT
    if (activeTool === 'select') {
      const target = e.target as HTMLElement
      // If clicking directly on empty canvas background
      if (target.id === 'map-canvas-bg' || target.tagName === 'svg') {
        setSelectedFeatureId(null)
        setSelectedVertexIndex(null)
      }
      return
    }

    // Tool: POI (One-click pin drop)
    if (activeTool === 'poi') {
      const newPoi: PoiFeature = {
        id: `poi-${Date.now()}`,
        name: `Địa danh mới #${mapData.pois.length + 1}`,
        category: poiCategory,
        x: Math.round(pt.x),
        y: Math.round(pt.y),
        address: 'Đang cập nhật địa chỉ...',
        description: 'Ghi chú nghiệp vụ điều tra...',
        badgeNumber: mapData.pois.length + 1,
        zIndex: 30
      }
      pushHistory({
        ...mapData,
        pois: [...mapData.pois, newPoi]
      })
      setSelectedFeatureId(newPoi.id)
      setActiveTool('select')
      return
    }

    // Tool: LABEL (One-click text drop)
    if (activeTool === 'label') {
      const newLabel: LabelFeature = {
        id: `label-${Date.now()}`,
        text: 'TÊN ĐỊA DANH / PHÂN KHU',
        x: Math.round(pt.x),
        y: Math.round(pt.y),
        fontSize: 16,
        color: '#475569',
        letterSpacing: 4,
        fontWeight: 'bold',
        zIndex: 25
      }
      pushHistory({
        ...mapData,
        labels: [...mapData.labels, newLabel]
      })
      setSelectedFeatureId(newLabel.id)
      setActiveTool('select')
      return
    }

    // Tool: WATER / ROAD / RAILWAY / ZONE (Multi-point drawing)
    setDrawingPoints((prev) => [...prev, pt])
  }

  // Pointer Move on Canvas
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y
      })
      return
    }

    const pt = getCanvasCoords(e)
    setCursorPos(pt)

    // Dragging an existing vertex
    if (isDraggingVertex && selectedFeatureId && selectedVertexIndex !== null) {
      updateVertex(selectedFeatureId, selectedVertexIndex, pt)
    }
  }

  // Pointer Up
  const handleCanvasMouseUp = () => {
    if (isPanning) {
      setIsPanning(false)
    }
    if (isDraggingVertex) {
      setIsDraggingVertex(false)
    }
  }

  // Finish multi-point drawing (Double click or Enter)
  const finishDrawing = () => {
    if (drawingPoints.length < 2) {
      setDrawingPoints([])
      return
    }

    const id = `${activeTool}-${Date.now()}`

    if (activeTool === 'water') {
      const isLake = waterType === 'lake' || waterType === 'ocean'
      const newWater: WaterFeature = {
        id,
        name: isLake ? `Hồ nước #${mapData.water.length + 1}` : `Sông #${mapData.water.length + 1}`,
        type: waterType,
        points: drawingPoints,
        closed: isLake,
        width: isLake ? undefined : 80,
        color: '#71B4EC',
        opacity: 0.95,
        smooth: true,
        zIndex: 2
      }
      pushHistory({ ...mapData, water: [...mapData.water, newWater] })
      setSelectedFeatureId(newWater.id)
    } else if (activeTool === 'road') {
      const newRoad: RoadFeature = {
        id,
        name: `Tuyến đường #${mapData.roads.length + 1}`,
        type: roadType,
        points: drawingPoints,
        width: roadType === 'highway' ? 14 : roadType === 'avenue' ? 10 : 6,
        color: roadType === 'highway' ? '#FFFFFF' : '#FFFFFF',
        casingColor: roadType === 'highway' ? '#94A3B8' : '#CBD5E1',
        casingWidth: 2,
        smooth: true,
        zIndex: 12
      }
      pushHistory({ ...mapData, roads: [...mapData.roads, newRoad] })
      setSelectedFeatureId(newRoad.id)
    } else if (activeTool === 'railway') {
      const newRailway: RailwayFeature = {
        id,
        name: `Tuyến đường sắt #${mapData.railways.length + 1}`,
        points: drawingPoints,
        width: 8,
        color: '#334155',
        sleeperSpacing: 12,
        smooth: true,
        zIndex: 14
      }
      pushHistory({ ...mapData, railways: [...mapData.railways, newRailway] })
      setSelectedFeatureId(newRailway.id)
    } else if (activeTool === 'zone') {
      const newZone: ZoneFeature = {
        id,
        name: `Phân khu #${mapData.zones.length + 1}`,
        category: zoneCategory,
        points: drawingPoints,
        fillColor: zoneCategory === 'park' ? '#D1E7DD' : '#E2E8F0',
        strokeColor: '#CBD5E1',
        strokeWidth: 1.5,
        opacity: 0.85,
        zIndex: 4
      }
      pushHistory({ ...mapData, zones: [...mapData.zones, newZone] })
      setSelectedFeatureId(newZone.id)
    }

    setDrawingPoints([])
    setActiveTool('select')
  }

  // Update vertex of selected feature
  const updateVertex = (featureId: string, vertexIdx: number, newPoint: Point) => {
    setMapData((prev) => {
      const updatePts = (pts: Point[]) => {
        const copy = [...pts]
        copy[vertexIdx] = newPoint
        return copy
      }

      return {
        ...prev,
        water: prev.water.map((w) => (w.id === featureId ? { ...w, points: updatePts(w.points) } : w)),
        zones: prev.zones.map((z) => (z.id === featureId ? { ...z, points: updatePts(z.points) } : z)),
        roads: prev.roads.map((r) => (r.id === featureId ? { ...r, points: updatePts(r.points) } : r)),
        railways: prev.railways.map((rw) =>
          rw.id === featureId ? { ...rw, points: updatePts(rw.points) } : rw
        )
      }
    })
  }

  // Delete selected feature or active vertex
  const handleDeleteSelected = () => {
    if (!selectedFeatureId) return

    pushHistory({
      ...mapData,
      water: mapData.water.filter((w) => w.id !== selectedFeatureId),
      zones: mapData.zones.filter((z) => z.id !== selectedFeatureId),
      roads: mapData.roads.filter((r) => r.id !== selectedFeatureId),
      railways: mapData.railways.filter((rw) => rw.id !== selectedFeatureId),
      pois: mapData.pois.filter((p) => p.id !== selectedFeatureId),
      labels: mapData.labels.filter((l) => l.id !== selectedFeatureId)
    })
    setSelectedFeatureId(null)
    setSelectedVertexIndex(null)
  }

  // Reorder Layer Z-Index (Bring forward / Send backward)
  const handleReorder = (direction: 'up' | 'down') => {
    if (!selectedFeatureId) return

    const delta = direction === 'up' ? 1 : -1
    const updateZ = (item: { id: string; zIndex: number }) =>
      item.id === selectedFeatureId ? { ...item, zIndex: Math.max(1, item.zIndex + delta) } : item

    pushHistory({
      ...mapData,
      water: mapData.water.map(updateZ) as WaterFeature[],
      zones: mapData.zones.map(updateZ) as ZoneFeature[],
      roads: mapData.roads.map(updateZ) as RoadFeature[],
      railways: mapData.railways.map(updateZ) as RailwayFeature[],
      pois: mapData.pois.map(updateZ) as PoiFeature[],
      labels: mapData.labels.map(updateZ) as LabelFeature[]
    })
  }

  // Keyboard Shortcuts (Delete, Undo, Redo, Finish Drawing, Space Panning)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA')
        return

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        isSpacePressedRef.current = true
        setIsSpacePressed(true)
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected()
      } else if (e.key === 'Enter') {
        finishDrawing()
      } else if (e.key === 'Escape') {
        setDrawingPoints([])
        setSelectedFeatureId(null)
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) handleRedo()
        else handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        handleDuplicateSelected()
      } else if (e.key === 'v') setActiveTool('select')
      else if (e.key === 'w') setActiveTool('water')
      else if (e.key === 'r') setActiveTool('road')
      else if (e.key === 't') setActiveTool('railway')
      else if (e.key === 'z') setActiveTool('zone')
      else if (e.key === 'p') setActiveTool('poi')
      else if (e.key === 'l') setActiveTool('label')
      else if (e.key === 'h') setActiveTool('pan')
      else if (e.key === '+' || e.key === '=') {
        if (e.ctrlKey || e.metaKey) e.preventDefault()
        setZoom((z) => Math.min(4.0, z + 0.15))
      } else if (e.key === '-' || e.key === '_') {
        if (e.ctrlKey || e.metaKey) e.preventDefault()
        setZoom((z) => Math.max(0.15, z - 0.15))
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        setZoom(0.75)
        setPan({ x: 80, y: 50 })
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [selectedFeatureId, drawingPoints, historyIndex, history])

  // Sorting all features for z-index order
  const allFeaturesSorted = useMemo(() => {
    const list: { type: string; item: any }[] = []
    mapData.water.forEach((item) => list.push({ type: 'water', item }))
    mapData.zones.forEach((item) => list.push({ type: 'zone', item }))
    mapData.roads.forEach((item) => list.push({ type: 'road', item }))
    mapData.railways.forEach((item) => list.push({ type: 'railway', item }))
    mapData.labels.forEach((item) => list.push({ type: 'label', item }))
    mapData.pois.forEach((item) => list.push({ type: 'poi', item }))

    return list.sort((a, b) => (a.item.zIndex || 0) - (b.item.zIndex || 0))
  }, [mapData])

  // Filtered features for layers list
  const filteredLayers = useMemo(() => {
    return allFeaturesSorted.filter(({ type, item }) => {
      if (filterLayer !== 'all') {
        if (filterLayer === 'water' && type !== 'water') return false
        if (filterLayer === 'roads' && type !== 'road') return false
        if (filterLayer === 'railways' && type !== 'railway') return false
        if (filterLayer === 'zones' && type !== 'zone') return false
        if (filterLayer === 'pois' && type !== 'poi') return false
        if (filterLayer === 'labels' && type !== 'label') return false
      }
      if (layerSearchText.trim()) {
        const q = layerSearchText.toLowerCase()
        const name = (item.name || item.text || item.id || '').toLowerCase()
        return name.includes(q)
      }
      return true
    })
  }, [allFeaturesSorted, filterLayer, layerSearchText])

  return (
    <div className="flex flex-col h-screen w-screen bg-[#1E293B] text-slate-100 select-none overflow-hidden font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER TOOLBAR                                                     */}
      {/* ========================================================================= */}
      <header className="h-14 bg-[#0F172A] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-bold tracking-wider uppercase text-white font-mono flex items-center gap-2">
              <span>MAP STUDIO</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                VECTOR ENGINE
              </span>
            </h1>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* History Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo2 className="size-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Làm lại (Ctrl+Y)"
            >
              <Redo2 className="size-4" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Grid & Snapping Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border',
                snapToGrid
                  ? 'bg-blue-600/30 text-blue-400 border-blue-500/50'
                  : 'text-slate-400 border-slate-800 hover:bg-slate-800'
              )}
              title="Bật/Tắt hít điểm lưới (Magnetic Snap)"
            >
              <Grid3X3 className="size-3.5" />
              <span>Hít lưới</span>
            </button>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border',
                showGrid
                  ? 'bg-slate-800 text-slate-200 border-slate-700'
                  : 'text-slate-500 border-slate-800 hover:bg-slate-800'
              )}
            >
              <span>{showGrid ? 'Ẩn lưới' : 'Hiện lưới'}</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* View Mode Toggle: Admin Edit vs Player Clean Preview */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700/80 p-0.5 shadow-inner">
            <button
              onClick={() => setViewMode('admin')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                viewMode === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
              title="Chế độ Admin: Hiển thị đầy đủ mốc án, số thứ tự, ghim POI và công cụ biên tập"
            >
              <Wrench className="size-3.5" />
              <span>Admin (Hiện mốc)</span>
            </button>
            <button
              onClick={() => {
                setViewMode('player')
                setSelectedFeatureId(null)
                setSelectedVertexIndex(null)
              }}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                viewMode === 'player'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
              title="Chế độ Người chơi: Xem bản đồ dân sự sạch sẽ như trong game, ẩn toàn bộ số mốc và ghim án"
            >
              <Eye className="size-3.5" />
              <span>Người chơi (Ẩn mốc)</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Layer Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-mono">Lọc:</span>
            <select
              value={filterLayer}
              onChange={(e) => setFilterLayer(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-1 outline-none cursor-pointer"
            >
              <option value="all">Hiện tất cả</option>
              <option value="water">Sông / Hồ</option>
              <option value="roads">Đường & Cầu</option>
              <option value="railways">Đường Sắt & Metro</option>
              <option value="zones">Phân Khu</option>
              <option value="pois">Mốc Án (POIs)</option>
              <option value="labels">Nhãn Chữ</option>
            </select>
          </div>

          <button
            onClick={() => setShowPhoneOverlay(!showPhoneOverlay)}
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border',
              showPhoneOverlay
                ? 'bg-sky-600/30 text-sky-400 border-sky-500/50'
                : 'text-slate-400 border-slate-800 hover:bg-slate-800'
            )}
            title="Bật/Tắt khung mô phỏng màn hình iPhone trong Game"
          >
            <span>📱 Khung iPhone</span>
          </button>
        </div>

        {/* Center: Quick Action Status or In-drawing alert */}
        <div className="flex items-center gap-2">
          {drawingPoints.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-600/60 rounded-full text-amber-300 text-xs font-medium animate-pulse">
              <span>Đang vẽ ({drawingPoints.length} điểm) — Bấm đúp hoặc Enter để chốt</span>
              <button
                onClick={finishDrawing}
                className="ml-1 px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px]"
              >
                Hoàn tất
              </button>
              <button
                onClick={() => setDrawingPoints([])}
                className="px-1 text-amber-400 hover:text-white"
                title="Hủy vẽ"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Right actions: Import / Export / Reset & Save */}
        <div className="flex items-center gap-2">
          {/* Reset to Figma Master Preset */}
          <button
            onClick={handleResetToFigmaMaster}
            className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 border border-amber-800/40 cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Khôi phục toàn bộ bản đồ chuẩn đồ họa Figma Master (2800x2000, 13 sông hồ, 13 cầu đường, 31 mốc án)"
          >
            <Sparkles className="size-3.5" />
            <span className="hidden sm:inline">Nạp Figma Master</span>
          </button>

          <label className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-1.5 text-xs">
            <Upload className="size-4" />
            <span className="hidden sm:inline">Nạp JSON</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={handleExportJson}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-1.5 text-xs"
            title="Tải file JSON dự phòng về máy"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Xuất JSON</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95',
              saveStatus === 'success'
                ? 'bg-emerald-600 text-white'
                : saveStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            )}
          >
            {isSaving ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check className="size-3.5" />
                <span>Đã lưu thành công!</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="size-3.5" />
                <span>Lỗi khi lưu!</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>LƯU BẢN ĐỒ</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE (TOOLS PALETTE + CANVAS + INSPECTOR)                     */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT VERTICAL TOOLBAR */}
        <aside className="w-14 bg-[#0F172A] border-r border-slate-800 flex flex-col items-center py-3 gap-2 shrink-0 z-20">
          <ToolButton
            active={activeTool === 'select'}
            onClick={() => setActiveTool('select')}
            icon={<MousePointer className="size-5" />}
            label="Chọn / Sửa đỉnh (V)"
          />

          <div className="w-8 h-[1px] bg-slate-800 my-1" />

          <ToolButton
            active={activeTool === 'water'}
            onClick={() => {
              setActiveTool('water')
              setDrawingPoints([])
            }}
            icon={<Waves className="size-5" />}
            label="Vẽ Hồ & Sông (W)"
            indicatorColor="bg-sky-500"
          />
          <ToolButton
            active={activeTool === 'road'}
            onClick={() => {
              setActiveTool('road')
              setDrawingPoints([])
            }}
            icon={<Milestone className="size-5" />}
            label="Vẽ Tuyến Đường (R)"
            indicatorColor="bg-amber-400"
          />
          <ToolButton
            active={activeTool === 'railway'}
            onClick={() => {
              setActiveTool('railway')
              setDrawingPoints([])
            }}
            icon={<TrainTrack className="size-5" />}
            label="Vẽ Đường Sắt (T)"
            indicatorColor="bg-slate-400"
          />
          <ToolButton
            active={activeTool === 'zone'}
            onClick={() => {
              setActiveTool('zone')
              setDrawingPoints([])
            }}
            icon={<LandPlot className="size-5" />}
            label="Vẽ Phân Khu (Z)"
            indicatorColor="bg-emerald-500"
          />

          <div className="w-8 h-[1px] bg-slate-800 my-1" />

          <ToolButton
            active={activeTool === 'poi'}
            onClick={() => setActiveTool('poi')}
            icon={<MapPin className="size-5" />}
            label="Cắm Địa Danh / Hotspot (P)"
            indicatorColor="bg-red-500"
          />
          <ToolButton
            active={activeTool === 'label'}
            onClick={() => setActiveTool('label')}
            icon={<Type className="size-5" />}
            label="Đặt Nhãn Chữ (L)"
          />

          {/* Zoom controls at bottom */}
          <div className="mt-auto flex flex-col items-center gap-1.5 pt-2 border-t border-slate-800 w-full">
            <button
              onClick={() => setZoom((z) => Math.min(4.0, z + 0.15))}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Phóng to Canvas (Ctrl + Cuộn chuột hoặc phím +)"
            >
              <ZoomIn className="size-4" />
            </button>
            <span className="text-[10px] font-mono text-slate-500 font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.15, z - 0.15))}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Thu nhỏ Canvas (Ctrl + Cuộn chuột hoặc phím -)"
            >
              <ZoomOut className="size-4" />
            </button>
            <button
              onClick={() => {
                setZoom(0.75)
                setPan({ x: 80, y: 50 })
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Reset góc nhìn Canvas (Ctrl + 0)"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </aside>

        {/* ACTIVE TOOL OPTIONS STRIP (Top floating pill) */}
        <div className="absolute top-3 left-20 z-10 bg-[#0F172A]/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-3 text-xs">
          {activeTool === 'water' && (
            <div className="flex items-center gap-2">
              <span className="text-sky-400 font-semibold">Sông / Hồ:</span>
              <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  onClick={() => setWaterType('river')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    waterType === 'river' ? 'bg-sky-600 text-white' : 'text-slate-400'
                  )}
                >
                  Sông lớn (Đường)
                </button>
                <button
                  onClick={() => setWaterType('lake')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    waterType === 'lake' ? 'bg-sky-600 text-white' : 'text-slate-400'
                  )}
                >
                  Hồ nước (Đa giác)
                </button>
                <button
                  onClick={() => setWaterType('stream')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    waterType === 'stream' ? 'bg-sky-600 text-white' : 'text-slate-400'
                  )}
                >
                  Con suối (Nét nhỏ)
                </button>
              </div>
            </div>
          )}

          {activeTool === 'road' && (
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold">Loại đường:</span>
              <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  onClick={() => setRoadType('highway')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    roadType === 'highway' ? 'bg-amber-600 text-white' : 'text-slate-400'
                  )}
                >
                  Đại lộ lớn
                </button>
                <button
                  onClick={() => setRoadType('avenue')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    roadType === 'avenue' ? 'bg-amber-600 text-white' : 'text-slate-400'
                  )}
                >
                  Đường phố
                </button>
                <button
                  onClick={() => setRoadType('alley')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    roadType === 'alley' ? 'bg-amber-600 text-white' : 'text-slate-400'
                  )}
                >
                  Ngõ hẻm
                </button>
                <button
                  onClick={() => setRoadType('bridge')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    roadType === 'bridge' ? 'bg-amber-600 text-white' : 'text-slate-400'
                  )}
                >
                  Cầu vượt sông
                </button>
              </div>
            </div>
          )}

          {activeTool === 'zone' && (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">Phân khu:</span>
              <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  onClick={() => setZoneCategory('port')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    zoneCategory === 'port' ? 'bg-slate-600 text-white' : 'text-slate-400'
                  )}
                >
                  Cảng biển
                </button>
                <button
                  onClick={() => setZoneCategory('park')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    zoneCategory === 'park' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  )}
                >
                  Công viên
                </button>
                <button
                  onClick={() => setZoneCategory('industrial')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    zoneCategory === 'industrial' ? 'bg-slate-600 text-white' : 'text-slate-400'
                  )}
                >
                  Khu công nghiệp
                </button>
                <button
                  onClick={() => setZoneCategory('residential')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    zoneCategory === 'residential' ? 'bg-amber-700 text-white' : 'text-slate-400'
                  )}
                >
                  Khu dân cư
                </button>
              </div>
            </div>
          )}

          {activeTool === 'poi' && (
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-semibold">Loại địa danh:</span>
              <select
                value={poiCategory}
                onChange={(e) => setPoiCategory(e.target.value as PoiCategory)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 outline-none cursor-pointer"
              >
                {Object.entries(POI_CATEGORY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Coordinate Readout */}
          <div className="ml-auto flex items-center">
            <span className="font-mono text-[11px] text-slate-400">
              X: {Math.round(cursorPos.x)} Y: {Math.round(cursorPos.y)}
            </span>
          </div>
        </div>

        {/* MAIN CANVAS VIEWPORT */}
        <div
          ref={containerRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onDoubleClick={finishDrawing}
          className={cn(
            'flex-1 h-full relative overflow-hidden bg-[#0A0F1D]',
            activeTool === 'pan' || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
          )}
        >
          {/* Floating Player Mode Indicator Pill */}
          {viewMode === 'player' && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-emerald-950/90 border border-emerald-500/60 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs text-emerald-200 pointer-events-auto backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Đang ở Chế độ Người chơi (Preview)</span>
              <span className="text-emerald-400/80 text-[11px] hidden sm:inline">— Bản đồ sạch sẽ, ẩn toàn bộ số mốc & ghim án</span>
              <button
                onClick={() => setViewMode('admin')}
                className="ml-2 px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
              >
                Về Admin
              </button>
            </div>
          )}

          {/* THE SVG WORLD LAYER (Infinite Canvas) */}
          <svg
            id="map-canvas-svg"
            className="absolute origin-top-left overflow-visible"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`
            }}
          >
            <defs>
              {/* Infinite Studio Grid Pattern */}
              <pattern
                id="infinite-grid-pattern"
                width={gridSize}
                height={gridSize}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="0.8"
                  strokeOpacity="0.35"
                />
              </pattern>
            </defs>

            {/* Infinite Background Canvas Board (Unbounded 600,000 x 600,000 Universe) */}
            <rect
              id="map-canvas-bg"
              x="-300000"
              y="-300000"
              width="600000"
              height="600000"
              fill={mapData.backgroundColor || '#F3F4F3'}
            />

            {/* Infinite Grid Overlay (Chỉ hiện trong chế độ Admin) */}
            {showGrid && viewMode === 'admin' && (
              <rect
                x="-300000"
                y="-300000"
                width="600000"
                height="600000"
                fill="url(#infinite-grid-pattern)"
                pointerEvents="none"
              />
            )}

            {/* ================================================================= */}
            {/* RENDER ALL ORDERED FEATURES (WATER, ZONES, ROADS, RAILS, POIS)    */}
            {/* ================================================================= */}
            {allFeaturesSorted.map(({ type, item }) => {
              if (hiddenFeatureIds[item.id]) return null
              if (filterLayer !== 'all') {
                if (filterLayer === 'water' && type !== 'water') return null
                if (filterLayer === 'roads' && type !== 'road') return null
                if (filterLayer === 'railways' && type !== 'railway') return null
                if (filterLayer === 'zones' && type !== 'zone') return null
                if (filterLayer === 'pois' && type !== 'poi') return null
                if (filterLayer === 'labels' && type !== 'label') return null
              }
              const isSelected = selectedFeatureId === item.id

              // 1. WATER BODIES
              if (type === 'water') {
                const w = item as WaterFeature
                const d = pointsToSvgPath(w.points, w.closed, w.smooth)
                return (
                  <g
                    key={w.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFeatureId(w.id)
                    }}
                    className="cursor-pointer group"
                  >
                    {w.closed ? (
                      <path
                        d={d}
                        fill={w.color}
                        opacity={w.opacity}
                        stroke={isSelected ? '#2563EB' : '#7BB6E8'}
                        strokeWidth={isSelected ? 3 : 1}
                      />
                    ) : (
                      <path
                        d={d}
                        fill="none"
                        stroke={w.color}
                        strokeWidth={w.width || 80}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={w.opacity}
                      />
                    )}
                  </g>
                )
              }

              // 2. ZONES
              if (type === 'zone') {
                const z = item as ZoneFeature
                const d = pointsToSvgPath(z.points, true, false)
                return (
                  <path
                    key={z.id}
                    d={d}
                    fill={z.fillColor}
                    stroke={isSelected ? '#2563EB' : z.strokeColor || '#CBD5E1'}
                    strokeWidth={isSelected ? 3 : z.strokeWidth || 1.5}
                    opacity={z.opacity}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFeatureId(z.id)
                    }}
                    className="cursor-pointer"
                  />
                )
              }

              // 3. ROADS (Casing + Surface + Bridge Shadows)
              if (type === 'road') {
                const r = item as RoadFeature
                const d = pointsToSvgPath(r.points, false, r.smooth)
                return (
                  <g
                    key={r.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFeatureId(r.id)
                    }}
                    className="cursor-pointer"
                  >
                    {/* Bridge Drop Shadow */}
                    {r.isBridge && (
                      <path
                        d={d}
                        fill="none"
                        stroke="#000000"
                        strokeWidth={r.width + (r.casingWidth || 2) * 2 + 6}
                        strokeLinecap="round"
                        opacity="0.25"
                      />
                    )}
                    {/* Road Casing (Border) */}
                    <path
                      d={d}
                      fill="none"
                      stroke={isSelected ? '#2563EB' : r.casingColor || '#94A3B8'}
                      strokeWidth={r.width + (r.casingWidth || 2) * 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Road Center Surface */}
                    <path
                      d={d}
                      fill="none"
                      stroke={r.color || '#FFFFFF'}
                      strokeWidth={r.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={r.dashed ? '8 6' : undefined}
                    />
                  </g>
                )
              }

              // 4. RAILWAYS (Cross-ties & Steel Rails)
              if (type === 'railway') {
                const rw = item as RailwayFeature
                const { railsPath, sleepersPath } = generateRailwayPaths(
                  rw.points,
                  rw.width,
                  rw.sleeperSpacing
                )
                return (
                  <g
                    key={rw.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFeatureId(rw.id)
                    }}
                    className="cursor-pointer"
                  >
                    {/* Sleepers */}
                    <path d={sleepersPath} stroke="#1E293B" strokeWidth="2.5" strokeLinecap="butt" />
                    {/* Steel Rails */}
                    <path d={railsPath} stroke={rw.color || '#475569'} strokeWidth="1.8" fill="none" />
                  </g>
                )
              }

              // 5. LABELS (Text Annotations)
              if (type === 'label') {
                const l = item as LabelFeature
                return (
                  <text
                    key={l.id}
                    x={l.x}
                    y={l.y}
                    fill={l.color}
                    fontSize={l.fontSize}
                    letterSpacing={l.letterSpacing ? `${l.letterSpacing}px` : undefined}
                    fontWeight={l.fontWeight || 'bold'}
                    transform={`rotate(${l.rotation || 0}, ${l.x}, ${l.y})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFeatureId(l.id)
                    }}
                    className="cursor-pointer select-none font-sans"
                  >
                    {l.text}
                  </text>
                )
              }

              // 6. POIS / HOTSPOTS
              if (type === 'poi') {
                if (viewMode === 'player') return null
                const p = item as PoiFeature
                const cfg = POI_CATEGORY_CONFIG[p.category] || POI_CATEGORY_CONFIG.crime_scene
                return (
                  <g
                    key={p.id}
                    transform={`translate(${p.x}, ${p.y})`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFeatureId(p.id)
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for crime scene */}
                    {p.category === 'crime_scene' && (
                      <circle r="22" fill="#EA4335" opacity="0.25" className="animate-ping" />
                    )}

                    {/* Outer selection ring */}
                    {isSelected && (
                      <circle r="20" fill="none" stroke="#2563EB" strokeWidth="3" strokeDasharray="4 3" />
                    )}

                    {/* Marker badge circle */}
                    <circle
                      r="14"
                      fill={p.iconColor || cfg.color}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="shadow-md"
                    />

                    {/* Badge number or icon */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {p.badgeNumber || '•'}
                    </text>

                    {/* Compact POI Title Pill underneath */}
                    <g transform="translate(0, 22)">
                      <rect
                        x={-(p.name.length * 3.5 + 8)}
                        y="-8"
                        width={p.name.length * 7 + 16}
                        height="16"
                        rx="4"
                        fill="#FFFFFF"
                        stroke="#CBD5E1"
                        strokeWidth="1"
                        className="shadow-xs"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#1E293B"
                      >
                        {p.shortName || p.name}
                      </text>
                    </g>
                  </g>
                )
              }

              return null
            })}

            {/* ================================================================= */}
            {/* LIVE DRAWING PREVIEW PATH (IN-PROGRESS)                           */}
            {/* ================================================================= */}
            {drawingPoints.length > 0 && (
              <g pointerEvents="none">
                {/* Points joined so far */}
                <path
                  d={pointsToSvgPath(drawingPoints, false, false)}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />

                {/* Candidate line from last point to current mouse position */}
                {drawingPoints.length > 0 && (
                  <line
                    x1={drawingPoints[drawingPoints.length - 1].x}
                    y1={drawingPoints[drawingPoints.length - 1].y}
                    x2={cursorPos.x}
                    y2={cursorPos.y}
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Drawn vertex dots */}
                {drawingPoints.map((pt, i) => (
                  <circle key={`dp-${i}`} cx={pt.x} cy={pt.y} r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                ))}

                {/* Current cursor target dot */}
                <circle cx={cursorPos.x} cy={cursorPos.y} r="6" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2" />
              </g>
            )}

            {/* ================================================================= */}
            {/* SELECTED FEATURE EDITABLE VERTEX HANDLES                          */}
            {/* ================================================================= */}
            {viewMode === 'admin' && selectedFeature && 'points' in selectedFeature && (
              <g>
                {(selectedFeature as { points: Point[] }).points.map((pt, idx) => (
                  <circle
                    key={`v-${idx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={selectedVertexIndex === idx ? '8' : '6'}
                    fill={selectedVertexIndex === idx ? '#EA580C' : '#2563EB'}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    className="cursor-move shadow-md"
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      setSelectedVertexIndex(idx)
                      setIsDraggingVertex(true)
                    }}
                  />
                ))}
              </g>
            )}

            {/* Phone Viewport Simulator Overlay */}
            {showPhoneOverlay && (
              <g pointerEvents="none" opacity="0.9">
                <rect
                  x="1450"
                  y="200"
                  width="500"
                  height="888"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  rx="40"
                />
                <rect x="1630" y="210" width="140" height="24" rx="12" fill="#38BDF8" opacity="0.35" />
                <text x="1700" y="260" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                  MÔ PHỎNG KHUNG NHÌN IPHONE TRONG GAME
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* 3. RIGHT SIDEBAR (INSPECTOR & LAYERS HIERARCHY)                           */}
        {/* ========================================================================= */}
        <aside className="w-80 bg-[#0F172A] border-l border-slate-800 flex flex-col shrink-0 z-20 shadow-xl">
          {/* Tabs header */}
          <div className="flex border-b border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveSidebarTab('inspector')}
              className={cn(
                'flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors border-b-2',
                activeSidebarTab === 'inspector'
                  ? 'border-blue-500 text-white bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-white'
              )}
            >
              <Sliders className="size-4" />
              <span>Thuộc tính</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('layers')}
              className={cn(
                'flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors border-b-2',
                activeSidebarTab === 'layers'
                  ? 'border-blue-500 text-white bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-white'
              )}
            >
              <Layers className="size-4" />
              <span>Danh sách Layer ({allFeaturesSorted.length})</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeSidebarTab === 'inspector' ? (
              selectedFeature ? (
                /* FEATURE PROPERTIES FORM */
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                      Loại: {selectedFeature.id.split('-')[0]}
                    </span>
                    <button
                      onClick={handleDeleteSelected}
                      className="px-2 py-1 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 rounded flex items-center gap-1 cursor-pointer transition-colors"
                      title="Xóa đối tượng này (Delete)"
                    >
                      <Trash2 className="size-3" />
                      <span>Xóa</span>
                    </button>
                  </div>

                  {/* Name field */}
                  {'name' in selectedFeature && (
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold block">Tên hiển thị:</label>
                      <input
                        type="text"
                        value={selectedFeature.name || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setMapData((prev) => ({
                            ...prev,
                            water: prev.water.map((w) => (w.id === selectedFeature.id ? { ...w, name: val } : w)),
                            zones: prev.zones.map((z) => (z.id === selectedFeature.id ? { ...z, name: val } : z)),
                            roads: prev.roads.map((r) => (r.id === selectedFeature.id ? { ...r, name: val } : r)),
                            railways: prev.railways.map((rw) =>
                              rw.id === selectedFeature.id ? { ...rw, name: val } : rw
                            ),
                            pois: prev.pois.map((p) => (p.id === selectedFeature.id ? { ...p, name: val } : p))
                          }))
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Label Text field */}
                  {'text' in selectedFeature && (
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold block">Nội dung chữ:</label>
                      <input
                        type="text"
                        value={selectedFeature.text || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setMapData((prev) => ({
                            ...prev,
                            labels: prev.labels.map((l) => (l.id === selectedFeature.id ? { ...l, text: val } : l))
                          }))
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* POI Specific Fields */}
                  {'category' in selectedFeature && 'phone' in selectedFeature && (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold block">Phân loại:</label>
                        <select
                          value={(selectedFeature as PoiFeature).category}
                          onChange={(e) => {
                            const cat = e.target.value as PoiCategory
                            setMapData((prev) => ({
                              ...prev,
                              pois: prev.pois.map((p) =>
                                p.id === selectedFeature.id ? { ...p, category: cat } : p
                              )
                            }))
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none"
                        >
                          {Object.entries(POI_CATEGORY_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold block">Số điện thoại liên hệ:</label>
                        <input
                          type="text"
                          value={(selectedFeature as PoiFeature).phone || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setMapData((prev) => ({
                              ...prev,
                              pois: prev.pois.map((p) =>
                                p.id === selectedFeature.id ? { ...p, phone: val } : p
                              )
                            }))
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold block">Địa chỉ:</label>
                        <input
                          type="text"
                          value={(selectedFeature as PoiFeature).address || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setMapData((prev) => ({
                              ...prev,
                              pois: prev.pois.map((p) =>
                                p.id === selectedFeature.id ? { ...p, address: val } : p
                              )
                            }))
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold block">Ghi chú điều tra / Manh mối:</label>
                        <textarea
                          rows={3}
                          value={(selectedFeature as PoiFeature).clueNotes || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setMapData((prev) => ({
                              ...prev,
                              pois: prev.pois.map((p) =>
                                p.id === selectedFeature.id ? { ...p, clueNotes: val } : p
                              )
                            }))
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Width slider (for rivers & roads) */}
                  {'width' in selectedFeature && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="flex justify-between text-slate-400">
                        <span>Độ rộng nét:</span>
                        <span className="font-mono">{selectedFeature.width}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="200"
                        value={selectedFeature.width || 10}
                        onChange={(e) => {
                          const w = Number(e.target.value)
                          setMapData((prev) => ({
                            ...prev,
                            water: prev.water.map((item) => (item.id === selectedFeature.id ? { ...item, width: w } : item)),
                            roads: prev.roads.map((item) => (item.id === selectedFeature.id ? { ...item, width: w } : item))
                          }))
                        }}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Curve Smoothing Toggle */}
                  {'smooth' in selectedFeature && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-300">Uốn lượn mềm mại:</span>
                      <input
                        type="checkbox"
                        checked={Boolean(selectedFeature.smooth)}
                        onChange={(e) => {
                          const sm = e.target.checked
                          setMapData((prev) => ({
                            ...prev,
                            water: prev.water.map((item) => (item.id === selectedFeature.id ? { ...item, smooth: sm } : item)),
                            roads: prev.roads.map((item) => (item.id === selectedFeature.id ? { ...item, smooth: sm } : item)),
                            railways: prev.railways.map((item) => (item.id === selectedFeature.id ? { ...item, smooth: sm } : item))
                          }))
                        }}
                        className="size-4 rounded accent-blue-600"
                      />
                    </div>
                  )}

                  {/* Bridge Toggle */}
                  {'isBridge' in selectedFeature && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-300">Là cầu vượt sông (có bóng):</span>
                      <input
                        type="checkbox"
                        checked={Boolean((selectedFeature as RoadFeature).isBridge)}
                        onChange={(e) => {
                          const br = e.target.checked
                          setMapData((prev) => ({
                            ...prev,
                            roads: prev.roads.map((item) =>
                              item.id === selectedFeature.id ? { ...item, isBridge: br, zIndex: br ? 16 : 10 } : item
                            )
                          }))
                        }}
                        className="size-4 rounded accent-blue-600"
                      />
                    </div>
                  )}

                  {/* Layer Z-Order Controls */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-slate-400 font-semibold block">Thứ tự đè lớp (Z-Order):</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleReorder('up')}
                        className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 flex items-center justify-center gap-1 font-semibold"
                      >
                        <ArrowUp className="size-3.5" />
                        <span>Nổi lên trên</span>
                      </button>
                      <button
                        onClick={() => handleReorder('down')}
                        className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 flex items-center justify-center gap-1 font-semibold"
                      >
                        <ArrowDown className="size-3.5" />
                        <span>Chìm xuống dưới</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* NO SELECTION EMPTY STATE */
                <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 gap-2">
                  <MousePointer className="size-8 stroke-1 text-slate-600" />
                  <p className="text-xs">Chưa chọn đối tượng nào</p>
                  <p className="text-[11px] text-slate-600 max-w-[200px]">
                    Click vào bất kỳ con sông, con đường hoặc điểm trên bản đồ để chỉnh sửa thông số.
                  </p>
                </div>
              )
            ) : (
              /* LAYERS TREE LIST */
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm lớp..."
                    value={layerSearchText}
                    onChange={(e) => setLayerSearchText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                  {layerSearchText && (
                    <button
                      onClick={() => setLayerSearchText('')}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
                  <span>Hiển thị:</span>
                  <span className="font-mono text-slate-300">
                    {filteredLayers.length} / {allFeaturesSorted.length} lớp
                  </span>
                </div>
                <div className="space-y-1.5 text-xs max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
                  {filteredLayers.map(({ type, item }, idx) => {
                    const isSelected = selectedFeatureId === item.id
                    const isHidden = hiddenFeatureIds[item.id]

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedFeatureId(item.id)}
                        className={cn(
                          'p-2 rounded-lg flex items-center justify-between gap-2 border transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-mono text-slate-500 w-4">{idx + 1}</span>
                          <span
                            className={cn(
                              'size-2.5 rounded-full shrink-0',
                              type === 'water'
                                ? 'bg-sky-400'
                                : type === 'road'
                                ? 'bg-amber-400'
                                : type === 'railway'
                                ? 'bg-slate-400'
                                : type === 'zone'
                                ? 'bg-emerald-400'
                                : 'bg-red-500'
                            )}
                          />
                          <span className="truncate font-medium">{item.name || item.text || item.id}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setHiddenFeatureIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                          }}
                          className="p-1 text-slate-500 hover:text-white"
                          title={isHidden ? 'Hiện layer' : 'Ẩn layer'}
                        >
                          {isHidden ? <EyeOff className="size-3.5 text-amber-500" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function ToolButton({
  active,
  onClick,
  icon,
  label,
  indicatorColor
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  indicatorColor?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'size-10 rounded-xl flex items-center justify-center relative transition-all cursor-pointer group',
        active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/40'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      )}
      title={label}
    >
      {icon}
      {indicatorColor && (
        <span
          className={cn('absolute top-1.5 right-1.5 size-1.5 rounded-full ring-1 ring-slate-900', indicatorColor)}
        />
      )}
    </button>
  )
}
