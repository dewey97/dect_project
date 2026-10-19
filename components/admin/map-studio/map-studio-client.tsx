'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  MousePointer,
  ChevronLeft,
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
  Wrench,
  Pencil
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
import { snapPoint, getEmptyMapVectorData, pointsToSvgPath } from '@/lib/map-vector-utils'
import { simplifyPolyline } from '@/lib/geometry/simplify-polyline'
import {
  POI_CATEGORY_CONFIG,
  MemoWaterFeature,
  MemoRoadFeature,
  RoadCasingItem,
  RoadSurfaceItem,
  MemoRailwayFeature,
  MemoZoneFeature,
  MemoPoiFeature,
  MemoLabelFeature,
  ActiveDrawingPreview
} from './map-features'
import { MapStudioSidebar } from './map-studio-sidebar'
import { MapStudioHeader, MapStudioToolsPalette } from './map-studio-toolbar'

// Color palettes for authentic urban vector map aesthetic
const WATER_COLORS = ['#97C8EB', '#71B4EC', '#55CBE8', '#3498DB', '#1D4ED8', '#A4CEEC']
const ROAD_COLORS = ['#FFFFFF', '#F8FAFC', '#FEF3C7', '#FDE047', '#E2E8F0', '#94A3B8']
const ZONE_COLORS = ['#E2E8F0', '#D1E7DD', '#FEF3C7', '#FCE7F3', '#E0E7FF', '#F1F5F9']

export function MapStudioClient() {
  // Core Map Vector Data (Khởi tạo rỗng, nạp 100% dữ liệu thật từ Database)
  const [mapData, setMapData] = useState<MapVectorData>(() => getEmptyMapVectorData('case_000'))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [history, setHistory] = useState<MapVectorData[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const mapDataRef = useRef<MapVectorData>(mapData)
  const historyRef = useRef<MapVectorData[]>([])
  const historyIndexRef = useRef<number>(-1)

  useEffect(() => {
    mapDataRef.current = mapData
  }, [mapData])

  useEffect(() => {
    historyRef.current = history
  }, [history])

  useEffect(() => {
    historyIndexRef.current = historyIndex
  }, [historyIndex])

  // Canvas Viewport Pan & Zoom
  const [zoom, setZoom] = useState<number>(0.75)
  const [pan, setPan] = useState<Point>({ x: 80, y: 50 })
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  const panRef = useRef(pan)
  panRef.current = pan
  const [isPanning, setIsPanning] = useState(false)
  const isPanningRef = useRef(false)
  const panStart = useRef<Point>({ x: 0, y: 0 })
  const currentPanRef = useRef<Point>({ x: 80, y: 50 })
  const rafPanId = useRef<number | null>(null)
  const rafZoomId = useRef<number | null>(null)
  const zoomDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Active Tool & State
  const [activeTool, setActiveTool] = useState<MapStudioTool>('select')
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null)
  const [isDraggingVertex, setIsDraggingVertex] = useState(false)
  const [isDraggingFeature, setIsDraggingFeature] = useState(false)
  const dragFeatureStartRef = useRef<Point>({ x: 0, y: 0 })
  const initialFeatureRef = useRef<any>(null)
  const hasFeatureMovedRef = useRef<boolean>(false)

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
  const [draftStatus, setDraftStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const [draftRecoveryAvailable, setDraftRecoveryAvailable] = useState<{ timestamp: number; data: MapVectorData } | null>(null)
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingLayerName, setEditingLayerName] = useState('')

  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const isSpacePressedRef = useRef(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const draftCheckedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const containerRectRef = useRef<DOMRect | null>(null)
  const coordRef = useRef<HTMLSpanElement>(null)
  const candidateLineRef = useRef<SVGLineElement>(null)
  const candidateDotRef = useRef<SVGCircleElement>(null)

  const handleSelectFeature = useCallback((id: string) => {
    setSelectedFeatureId(id)
    setSelectedVertexIndex(null)
  }, [])



  // Key định danh localStorage bản nháp theo Case ID
  const draftStorageKey = `map_studio_draft_${mapData.caseId || 'case_000'}`

  // 1. Load initial data from API and check LocalStorage draft
  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const res = await fetch('/api/admin/map-vector')
        const json = await res.json()
        if (json.success && json.data && isMounted) {
          setMapData(json.data)
          mapDataRef.current = json.data
          setHistory([json.data])
          historyRef.current = [json.data]
          setHistoryIndex(0)
          historyIndexRef.current = 0

          // Kiểm tra xem trong LocalStorage có bản nháp chưa lưu không
          if (typeof window !== 'undefined' && !draftCheckedRef.current) {
            draftCheckedRef.current = true
            try {
              const rawDraft = localStorage.getItem(`map_studio_draft_${json.data.caseId || 'case_000'}`)
              if (rawDraft) {
                const parsed = JSON.parse(rawDraft)
                if (parsed && parsed.data && parsed.timestamp) {
                  // Nếu bản nháp mới hơn hoặc có dữ liệu, hiển thị cảnh báo cứu hộ bản nháp
                  setDraftRecoveryAvailable(parsed)
                }
              }
            } catch {
              // LocalStorage quota or parse error ignored
            }
          }
        }
      } catch (err) {
        console.warn('Could not load map vector from server:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  // Cache container bounding rect to eliminate synchronous layout reflows during pointermove
  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        containerRectRef.current = containerRef.current.getBoundingClientRect()
      }
    }
    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)
    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [])

  // Auto-Save ngầm vào LocalStorage (Debounce 2s sau khi người dùng dừng thao tác)
  useEffect(() => {
    if (isLoading || typeof window === 'undefined') return

    // Không auto-save khi history ở trạng thái khởi đầu chưa có thay đổi nào
    if (history.length <= 1) return

    setDraftStatus('saving')
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        const draftPayload = {
          timestamp: Date.now(),
          data: mapDataRef.current
        }
        localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload))
        setDraftStatus('saved')
      } catch {
        // QuotaExceededError handling
        setDraftStatus('idle')
      }
    }, 2000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [mapData, history.length, isLoading, draftStorageKey])

  // Khôi phục bản nháp từ LocalStorage
  const handleRestoreDraft = () => {
    if (!draftRecoveryAvailable) return
    const restoredData = draftRecoveryAvailable.data
    setMapData(restoredData)
    mapDataRef.current = restoredData
    pushHistory(restoredData)
    setDraftRecoveryAvailable(null)
  }

  // Bỏ qua / xóa bản nháp cũ
  const handleDismissDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(draftStorageKey)
    }
    setDraftRecoveryAvailable(null)
  }

  // Push state to undo/redo history
  const pushHistory = useCallback(
    (newData: MapVectorData) => {
      setMapData(newData)
      mapDataRef.current = newData
      const currentIdx = historyIndexRef.current
      const currentHist = historyRef.current
      const sliced = currentHist.slice(0, currentIdx + 1)
      const nextHist = [...sliced, newData]
      const nextIdx = sliced.length

      historyRef.current = nextHist
      historyIndexRef.current = nextIdx
      setHistory(nextHist)
      setHistoryIndex(nextIdx)
      setSaveStatus('idle')
    },
    []
  )

  const handleUndo = useCallback(() => {
    const currentIdx = historyIndexRef.current
    const currentHist = historyRef.current
    if (currentIdx > 0) {
      const newIndex = currentIdx - 1
      historyIndexRef.current = newIndex
      setHistoryIndex(newIndex)
      const targetState = currentHist[newIndex]
      mapDataRef.current = targetState
      setMapData(targetState)
      setSelectedFeatureId(null)
      setSelectedVertexIndex(null)
    }
  }, [])

  const handleRedo = useCallback(() => {
    const currentIdx = historyIndexRef.current
    const currentHist = historyRef.current
    if (currentIdx < currentHist.length - 1) {
      const newIndex = currentIdx + 1
      historyIndexRef.current = newIndex
      setHistoryIndex(newIndex)
      const targetState = currentHist[newIndex]
      mapDataRef.current = targetState
      setMapData(targetState)
      setSelectedFeatureId(null)
      setSelectedVertexIndex(null)
    }
  }, [])

  // Đổi tên layer trực tiếp từ danh sách layers
  const handleRenameFeature = useCallback(
    (id: string, newName: string) => {
      const trimmed = newName.trim()
      if (!trimmed) return

      pushHistory({
        ...mapDataRef.current,
        water: mapDataRef.current.water.map((w) => (w.id === id ? { ...w, name: trimmed } : w)),
        zones: mapDataRef.current.zones.map((z) => (z.id === id ? { ...z, name: trimmed } : z)),
        roads: mapDataRef.current.roads.map((r) => (r.id === id ? { ...r, name: trimmed } : r)),
        railways: mapDataRef.current.railways.map((rw) => (rw.id === id ? { ...rw, name: trimmed } : rw)),
        pois: mapDataRef.current.pois.map((p) => (p.id === id ? { ...p, name: trimmed } : p)),
        labels: mapDataRef.current.labels.map((l) => (l.id === id ? { ...l, text: trimmed } : l))
      })
    },
    [pushHistory]
  )

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
        // Xóa bản nháp LocalStorage sau khi đã lưu thành công lên Server Database
        if (typeof window !== 'undefined') {
          localStorage.removeItem(draftStorageKey)
        }
        setDraftStatus('idle')
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

  // Spatial Hash Grid for O(1) localized vertex magnetic snapping (cell size: 80px)
  const vertexSpatialGrid = useMemo(() => {
    const cellSize = 80
    const grid = new Map<string, Point[]>()

    const addPoint = (p: Point) => {
      const cx = Math.floor(p.x / cellSize)
      const cy = Math.floor(p.y / cellSize)
      const key = `${cx},${cy}`
      let cell = grid.get(key)
      if (!cell) {
        cell = []
        grid.set(key, cell)
      }
      cell.push(p)
    }

    mapData.roads.forEach((r) => r.points.forEach(addPoint))
    mapData.railways.forEach((rw) => rw.points.forEach(addPoint))
    mapData.water.forEach((w) => w.points.forEach(addPoint))
    mapData.pois.forEach((p) => addPoint({ x: p.x, y: p.y }))

    return { grid, cellSize }
  }, [mapData])

  // Screen to Canvas Coordinates Converter (Zero layout thrashing & O(1) snapping)
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | React.TouchEvent | MouseEvent): Point => {
      if (!containerRef.current) return { x: 0, y: 0 }
      const rect = containerRectRef.current || containerRef.current.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      const curPan = currentPanRef.current
      const curZoom = zoomRef.current
      const rawX = (clientX - rect.left - curPan.x) / curZoom
      const rawY = (clientY - rect.top - curPan.y) / curZoom

      // O(1) Snap candidates: check only 3x3 surrounding spatial cells (10-20 points max instead of 10,000)
      const candidatePoints: Point[] = []
      if (snapToGrid) {
        const { grid, cellSize } = vertexSpatialGrid
        const cx = Math.floor(rawX / cellSize)
        const cy = Math.floor(rawY / cellSize)
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const cell = grid.get(`${cx + dx},${cy + dy}`)
            if (cell) {
              candidatePoints.push(...cell)
            }
          }
        }
      }

      return snapPoint({ x: rawX, y: rawY }, gridSize, snapToGrid, candidatePoints, 14)
    },
    [snapToGrid, gridSize, vertexSpatialGrid]
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
  //   + Ctrl / Command + Wheel: Zoom Canvas mượt mà (Exponential Continuous Zoom) theo vị trí con trỏ chuột
  //   + Cuộn chuột thông thường (không Ctrl): Pan / di chuyển góc nhìn Canvas (Shift + Wheel = cuộn ngang)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Chặn hoàn toàn trình duyệt zoom toàn trang khi chuột đang ở trong Canvas
        e.preventDefault()
        e.stopPropagation()

        // Tính toán tỉ lệ zoom mượt mà theo deltaY chuẩn hóa (hỗ trợ cả trackpad pinch và con lăn chuột vật lý)
        const delta = Math.max(-100, Math.min(100, e.deltaY))
        const zoomFactor = Math.exp(-delta * 0.0035)

        const currentZoom = zoomRef.current
        const currentPan = currentPanRef.current
        const newZoom = Math.min(4.0, Math.max(0.15, currentZoom * zoomFactor))

        const rect = container.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const newPan = {
          x: mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom),
          y: mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom)
        }

        currentPanRef.current = newPan
        panRef.current = newPan
        zoomRef.current = newZoom

        // 144Hz direct GPU transform update: loại bỏ hoàn toàn glitch và khựng hình do React reconciliation
        if (!rafZoomId.current) {
          rafZoomId.current = requestAnimationFrame(() => {
            if (svgRef.current) {
              svgRef.current.style.transform = `translate3d(${currentPanRef.current.x}px, ${currentPanRef.current.y}px, 0px) scale(${zoomRef.current})`
            }
            rafZoomId.current = null
          })
        }

        // Debounce commit state về React sau khi ngừng lăn bánh xe chuột để Viewport Culling cập nhật chính xác
        if (zoomDebounceTimerRef.current) {
          clearTimeout(zoomDebounceTimerRef.current)
        }
        zoomDebounceTimerRef.current = setTimeout(() => {
          setPan({ ...currentPanRef.current })
          setZoom(zoomRef.current)
        }, 80)
      } else {
        // Cuộn chuột bình thường trong canvas: Pan góc nhìn mượt mà
        e.preventDefault()
        const newPan = {
          x: currentPanRef.current.x - (e.shiftKey ? e.deltaY : e.deltaX),
          y: currentPanRef.current.y - (e.shiftKey ? 0 : e.deltaY)
        }
        currentPanRef.current = newPan
        panRef.current = newPan

        if (!rafPanId.current) {
          rafPanId.current = requestAnimationFrame(() => {
            if (svgRef.current) {
              svgRef.current.style.transform = `translate3d(${currentPanRef.current.x}px, ${currentPanRef.current.y}px, 0px) scale(${zoomRef.current})`
            }
            rafPanId.current = null
          })
        }

        if (zoomDebounceTimerRef.current) {
          clearTimeout(zoomDebounceTimerRef.current)
        }
        zoomDebounceTimerRef.current = setTimeout(() => {
          setPan({ ...currentPanRef.current })
        }, 80)
      }
    }

    container.addEventListener('wheel', onNativeWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', onNativeWheel)
      if (zoomDebounceTimerRef.current) clearTimeout(zoomDebounceTimerRef.current)
      if (rafZoomId.current) cancelAnimationFrame(rafZoomId.current)
    }
  }, [])

  // Start dragging an entire feature (Move Tool)
  const handleFeatureMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (e.button !== 0) return
      if (isSpacePressedRef.current || activeTool === 'pan') return
      if (activeTool !== 'select') return

      e.stopPropagation()
      setSelectedFeatureId(id)
      setSelectedVertexIndex(null)

      const pt = getCanvasCoords(e)
      setIsDraggingFeature(true)
      dragFeatureStartRef.current = pt

      const feat =
        mapDataRef.current.water.find((w) => w.id === id) ||
        mapDataRef.current.zones.find((z) => z.id === id) ||
        mapDataRef.current.roads.find((r) => r.id === id) ||
        mapDataRef.current.railways.find((rw) => rw.id === id) ||
        mapDataRef.current.pois.find((p) => p.id === id) ||
        mapDataRef.current.labels.find((l) => l.id === id)

      if (feat) {
        initialFeatureRef.current = JSON.parse(JSON.stringify(feat))
        hasFeatureMovedRef.current = false
      }
    },
    [activeTool, getCanvasCoords]
  )

  // Pointer Down on Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Middle click or Spacebar or Pan tool triggers panning
    if (e.button === 1 || activeTool === 'pan' || isSpacePressedRef.current) {
      setIsPanning(true)
      isPanningRef.current = true
      panStart.current = {
        x: e.clientX - currentPanRef.current.x,
        y: e.clientY - currentPanRef.current.y
      }
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
    setDrawingPoints((prev) => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1]
        // Distance filter: ignore duplicate/accidental clicks within 3px of last vertex
        if (Math.hypot(pt.x - last.x, pt.y - last.y) < 3) {
          return prev
        }
      }
      return [...prev, pt]
    })
  }

  // Pointer Move on Canvas
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // 144Hz Zero-Latency Pan Engine: bypass React reconciliation loop during drag
    if (isPanningRef.current) {
      const newX = e.clientX - panStart.current.x
      const newY = e.clientY - panStart.current.y
      currentPanRef.current = { x: newX, y: newY }
      panRef.current = currentPanRef.current

      if (!rafPanId.current) {
        rafPanId.current = requestAnimationFrame(() => {
          if (svgRef.current) {
            svgRef.current.style.transform = `translate3d(${currentPanRef.current.x}px, ${currentPanRef.current.y}px, 0px) scale(${zoomRef.current})`
          }
          rafPanId.current = null
        })
      }
      return
    }

    const pt = getCanvasCoords(e)

    // Direct DOM update for zero-cost coordinate tracking (no React re-renders during hover)
    if (coordRef.current) {
      coordRef.current.textContent = `X: ${Math.round(pt.x)} Y: ${Math.round(pt.y)}`
    }

    // Direct 144Hz DOM mutation for candidate drawing preview (Zero React reconciliation overhead)
    if (drawingPoints.length > 0) {
      if (candidateLineRef.current) {
        candidateLineRef.current.setAttribute('x2', pt.x.toString())
        candidateLineRef.current.setAttribute('y2', pt.y.toString())
      }
      if (candidateDotRef.current) {
        candidateDotRef.current.setAttribute('cx', pt.x.toString())
        candidateDotRef.current.setAttribute('cy', pt.y.toString())
      }
    }

    // Dragging an existing vertex
    if (isDraggingVertex && selectedFeatureId && selectedVertexIndex !== null) {
      updateVertex(selectedFeatureId, selectedVertexIndex, pt)
      return
    }

    // Dragging an entire feature (Move Tool)
    if (isDraggingFeature && selectedFeatureId && initialFeatureRef.current) {
      const dx = pt.x - dragFeatureStartRef.current.x
      const dy = pt.y - dragFeatureStartRef.current.y

      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        hasFeatureMovedRef.current = true
        const initial = initialFeatureRef.current
        setMapData((prev) => {
          if ('points' in initial) {
            const newPoints = (initial.points as Point[]).map((p) => ({
              x: Math.round(p.x + dx),
              y: Math.round(p.y + dy)
            }))
            return {
              ...prev,
              water: prev.water.map((w) => (w.id === selectedFeatureId ? { ...w, points: newPoints } : w)),
              zones: prev.zones.map((z) => (z.id === selectedFeatureId ? { ...z, points: newPoints } : z)),
              roads: prev.roads.map((r) => (r.id === selectedFeatureId ? { ...r, points: newPoints } : r)),
              railways: prev.railways.map((rw) => (rw.id === selectedFeatureId ? { ...rw, points: newPoints } : rw))
            }
          } else if ('x' in initial && 'y' in initial) {
            const newX = Math.round(initial.x + dx)
            const newY = Math.round(initial.y + dy)
            return {
              ...prev,
              pois: prev.pois.map((p) => (p.id === selectedFeatureId ? { ...p, x: newX, y: newY } : p)),
              labels: prev.labels.map((l) => (l.id === selectedFeatureId ? { ...l, x: newX, y: newY } : l))
            }
          }
          return prev
        })
      }
      return
    }
  }

  // Pointer Up
  const handleCanvasMouseUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false
      setIsPanning(false)
      if (rafPanId.current) {
        cancelAnimationFrame(rafPanId.current)
        rafPanId.current = null
      }
      // Đồng bộ React state 1 lần duy nhất khi thả tay để Viewport Culling tính toán lại bounds chính xác
      setPan({ ...currentPanRef.current })
    }
    if (isDraggingVertex) {
      setIsDraggingVertex(false)
      // Lưu lại vị trí đỉnh sau khi kéo vào lịch sử Undo
      pushHistory(mapDataRef.current)
    }
    if (isDraggingFeature) {
      setIsDraggingFeature(false)
      if (hasFeatureMovedRef.current) {
        pushHistory(mapDataRef.current)
      }
      initialFeatureRef.current = null
    }
  }

  // Finish multi-point drawing (Double click or Enter)
  const finishDrawing = () => {
    if (drawingPoints.length < 2) {
      setDrawingPoints([])
      return
    }

    // Auto-simplify polyline using RDP & Radial distance (simplify-js algorithm)
    // Compresses redundant collinear vertices by 70-85% while preserving true visual curves
    const simplified = simplifyPolyline(drawingPoints, 1.2, false)
    const pts = simplified.length >= 2 ? simplified : drawingPoints

    const id = `${activeTool}-${Date.now()}`

    if (activeTool === 'water') {
      const isLake = waterType === 'lake' || waterType === 'ocean'
      const newWater: WaterFeature = {
        id,
        name: isLake ? `Hồ nước #${mapData.water.length + 1}` : `Sông #${mapData.water.length + 1}`,
        type: waterType,
        points: pts,
        closed: isLake,
        width: isLake ? undefined : 80,
        color: '#76C3E8',
        opacity: 1.0,
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
        points: pts,
        width: roadType === 'highway' ? 14 : roadType === 'avenue' ? 10 : 6,
        color: '#FFFFFF',
        casingColor: '#CBD5E1',
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
        points: pts,
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
        points: pts,
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
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) handleRedo()
        else handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
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

    const handleWindowBlur = () => {
      isSpacePressedRef.current = false
      setIsSpacePressed(false)
      if (isPanningRef.current) {
        handleCanvasMouseUp()
      }
    }

    const handleWindowMouseUp = () => {
      if (isPanningRef.current || isDraggingVertex || isDraggingFeature) {
        handleCanvasMouseUp()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('mouseup', handleWindowMouseUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }
  }, [selectedFeatureId, drawingPoints, historyIndex, history, isDraggingVertex, isDraggingFeature])

  // Sorting all features for z-index order
  const allFeaturesSorted = useMemo(() => {
    const list: { type: string; item: any }[] = []
    mapData.water.forEach((item) => list.push({ type: 'water', item }))
    mapData.zones.forEach((item) => list.push({ type: 'zone', item }))
    mapData.buildings?.forEach((item) => list.push({ type: 'building', item }))
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
        if (filterLayer === 'zones' && type !== 'zone' && type !== 'building') return false
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

  // =========================================================================
  // VIEWPORT CULLING ENGINE (LEVEL 2 OPTIMIZATION)
  // Chỉ render các đối tượng vector nằm trong tầm nhìn thực tế của người dùng
  // =========================================================================
  const [viewportSize, setViewportSize] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      setViewportSize({
        width: container.clientWidth || window.innerWidth || 1920,
        height: container.clientHeight || window.innerHeight || 1080
      })
    }

    updateSize()
    const ro = new ResizeObserver(updateSize)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // Khung chữ nhật toạ độ thế giới thực tế đang nhìn thấy (+ đệm 1200px an toàn tránh giật hình/popping khi zoom nhanh)
  const visibleBounds = useMemo(() => {
    const safeZoom = Math.max(0.15, zoom)
    const buffer = 1200 / safeZoom
    return {
      minX: -pan.x / safeZoom - buffer,
      minY: -pan.y / safeZoom - buffer,
      maxX: (viewportSize.width - pan.x) / safeZoom + buffer,
      maxY: (viewportSize.height - pan.y) / safeZoom + buffer
    }
  }, [pan.x, pan.y, zoom, viewportSize])

  // Tính trước AABB Bounding Box cho từng đối tượng để truy vấn siêu tốc O(1)
  const featureBBoxes = useMemo(() => {
    const map = new Map<string, { minX: number; minY: number; maxX: number; maxY: number }>()

    const addPointsBBox = (id: string, points: Point[], extra = 40) => {
      if (!points || points.length === 0) return
      let minX = points[0].x
      let maxX = points[0].x
      let minY = points[0].y
      let maxY = points[0].y
      for (let i = 1; i < points.length; i++) {
        const pt = points[i]
        if (pt.x < minX) minX = pt.x
        if (pt.x > maxX) maxX = pt.x
        if (pt.y < minY) minY = pt.y
        if (pt.y > maxY) maxY = pt.y
      }
      map.set(id, {
        minX: minX - extra,
        minY: minY - extra,
        maxX: maxX + extra,
        maxY: maxY + extra
      })
    }

    mapData.water.forEach((w) => addPointsBBox(w.id, w.points, (w.width || 80) + 50))
    mapData.zones.forEach((z) => addPointsBBox(z.id, z.points, 50))
    mapData.roads.forEach((r) => addPointsBBox(r.id, r.points, (r.width || 14) + (r.casingWidth || 2) * 2 + 40))
    mapData.railways.forEach((rw) => addPointsBBox(rw.id, rw.points, (rw.width || 8) + 40))
    mapData.pois.forEach((p) => {
      map.set(p.id, { minX: p.x - 80, minY: p.y - 80, maxX: p.x + 80, maxY: p.y + 80 })
    })
    mapData.labels.forEach((l) => {
      map.set(l.id, { minX: l.x - 250, minY: l.y - 80, maxX: l.x + 250, maxY: l.y + 80 })
    })

    return map
  }, [mapData])

  // Kiểm tra đối tượng có giao với khung nhìn hay không
  const isFeatureInView = useCallback(
    (id: string) => {
      // Đối tượng đang chọn luôn luôn được hiển thị
      if (selectedFeatureId === id) return true

      const bbox = featureBBoxes.get(id)
      if (!bbox) return true

      return (
        bbox.minX <= visibleBounds.maxX &&
        bbox.maxX >= visibleBounds.minX &&
        bbox.minY <= visibleBounds.maxY &&
        bbox.maxY >= visibleBounds.minY
      )
    },
    [selectedFeatureId, featureBBoxes, visibleBounds]
  )

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0a0d] text-zinc-100 select-none overflow-hidden font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER TOOLBAR                                                     */}
      {/* ========================================================================= */}
      <MapStudioHeader
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        historyIndex={historyIndex}
        historyLength={history.length}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showPhoneOverlay={showPhoneOverlay}
        setShowPhoneOverlay={setShowPhoneOverlay}
        drawingPoints={drawingPoints}
        finishDrawing={finishDrawing}
        setDrawingPoints={setDrawingPoints}
        draftRecoveryAvailable={draftRecoveryAvailable}
        handleRestoreDraft={handleRestoreDraft}
        handleDismissDraft={handleDismissDraft}
        draftStatus={draftStatus}
        handleSave={handleSave}
        isSaving={isSaving}
        saveStatus={saveStatus}
        setSelectedFeatureId={setSelectedFeatureId}
        setSelectedVertexIndex={setSelectedVertexIndex}
      />

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE (TOOLS PALETTE + CANVAS + INSPECTOR)                     */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* FLOATING TOOLS PALETTE & OPTIONS STRIP */}
        <MapStudioToolsPalette
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          setDrawingPoints={setDrawingPoints}
          waterType={waterType}
          setWaterType={setWaterType}
          roadType={roadType}
          setRoadType={setRoadType}
          zoneCategory={zoneCategory}
          setZoneCategory={setZoneCategory}
          poiCategory={poiCategory}
          setPoiCategory={setPoiCategory}
          coordRef={coordRef}
        />

        {/* MAIN CANVAS VIEWPORT */}
        <div
          ref={containerRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onDoubleClick={finishDrawing}
          className={cn(
            'flex-1 h-full relative overflow-hidden bg-[#0A0F1D]',
            isDraggingFeature
              ? 'cursor-grabbing'
              : activeTool === 'pan' || isSpacePressed
              ? 'cursor-grab active:cursor-grabbing'
              : 'cursor-crosshair'
          )}
          style={{
            contain: 'paint layout'
          }}
        >
          {/* Loading State Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0d] backdrop-blur-md text-zinc-400 gap-3">
              <div className="relative">
                <div className="size-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-zinc-400 tracking-wider uppercase">
                  Đang đồng bộ dữ liệu bản đồ Vector...
                </p>
              </div>
            </div>
          )}

          {/* THE SVG WORLD LAYER (Infinite Canvas) */}
          <svg
            ref={svgRef}
            id="map-canvas-svg"
            className="absolute origin-top-left overflow-visible"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
              willChange: 'transform'
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
            <g
              id="map-static-features-group"
              style={{
                pointerEvents: activeTool === 'select' && !isSpacePressed ? 'auto' : 'none'
              }}
            >
              {allFeaturesSorted.map(({ type, item }) => {
                if (hiddenFeatureIds[item.id]) return null
                // Viewport Culling: Loại bỏ các node SVG nằm ngoài khung nhìn để giữ 60-120 FPS
                if (!isFeatureInView(item.id)) return null

                const isSelected = selectedFeatureId === item.id

                if (type === 'water') {
                  return (
                    <MemoWaterFeature
                      key={item.id}
                      feature={item}
                      isSelected={isSelected}
                      onSelect={handleSelectFeature}
                      onStartDrag={handleFeatureMouseDown}
                    />
                  )
                }
                if (type === 'zone') {
                  return (
                    <MemoZoneFeature
                      key={item.id}
                      feature={item}
                      isSelected={isSelected}
                      onSelect={handleSelectFeature}
                      onStartDrag={handleFeatureMouseDown}
                    />
                  )
                }
                if (type === 'building') {
                  const d = pointsToSvgPath(item.points, true, false)
                  return (
                    <path
                      key={item.id}
                      d={d}
                      fill={isSelected ? '#FDE68A' : item.color || '#E2E8F0'}
                      stroke={isSelected ? '#D97706' : item.strokeColor || '#CBD5E1'}
                      strokeWidth={isSelected ? 1.5 : item.strokeWidth || 0.8}
                      opacity={item.opacity ?? 0.85}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectFeature(item.id)
                      }}
                      className="cursor-pointer transition-colors"
                    >
                      {item.name && <title>{item.name}</title>}
                    </path>
                  )
                }
                if (type === 'road') {
                  // Pass 1: Render casing border under the surface
                  return (
                    <RoadCasingItem
                      key={`casing-${item.id}`}
                      feature={item}
                      isSelected={isSelected}
                    />
                  )
                }
                if (type === 'railway') {
                  return (
                    <MemoRailwayFeature
                      key={item.id}
                      feature={item}
                      isSelected={isSelected}
                      onSelect={handleSelectFeature}
                      onStartDrag={handleFeatureMouseDown}
                    />
                  )
                }
                if (type === 'label') {
                  return (
                    <MemoLabelFeature
                      key={item.id}
                      feature={item}
                      isSelected={isSelected}
                      onSelect={handleSelectFeature}
                      onStartDrag={handleFeatureMouseDown}
                    />
                  )
                }
                if (type === 'poi') {
                  return (
                    <MemoPoiFeature
                      key={item.id}
                      feature={item}
                      isSelected={isSelected}
                      viewMode={viewMode}
                      onSelect={handleSelectFeature}
                      onStartDrag={handleFeatureMouseDown}
                    />
                  )
                }
                return null
              })}

              {/* PASS 2 FOR ROADS: All white surfaces rendered ON TOP of all casings */}
              {/* This completely eliminates cutting lines at any crossroads / T-junctions */}
              {allFeaturesSorted
                .filter(({ type, item }) => type === 'road' && !hiddenFeatureIds[item.id] && isFeatureInView(item.id))
                .map(({ item }) => (
                  <RoadSurfaceItem
                    key={`surface-${item.id}`}
                    feature={item}
                    isSelected={selectedFeatureId === item.id}
                    onSelect={handleSelectFeature}
                    onStartDrag={handleFeatureMouseDown}
                  />
                ))}
            </g>

            {/* ================================================================= */}
            {/* LIVE DRAWING PREVIEW PATH (IN-PROGRESS)                           */}
            {/* ================================================================= */}
            <ActiveDrawingPreview
              drawingPoints={drawingPoints}
              candidateLineRef={candidateLineRef}
              candidateDotRef={candidateDotRef}
            />

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
        {/* 3. RIGHT SIDEBAR (UNIFIED LAYERS HIERARCHY + BOTTOM INSPECTOR)           */}
        {/* ========================================================================= */}
        <MapStudioSidebar
          allFeaturesSorted={allFeaturesSorted}
          filteredLayers={filteredLayers}
          selectedFeatureId={selectedFeatureId}
          selectedFeature={selectedFeature}
          hiddenFeatureIds={hiddenFeatureIds}
          editingLayerId={editingLayerId}
          editingLayerName={editingLayerName}
          filterLayer={filterLayer}
          layerSearchText={layerSearchText}
          setFilterLayer={setFilterLayer}
          setLayerSearchText={setLayerSearchText}
          setSelectedFeatureId={setSelectedFeatureId}
          setHiddenFeatureIds={setHiddenFeatureIds}
          setEditingLayerId={setEditingLayerId}
          setEditingLayerName={setEditingLayerName}
          handleRenameFeature={handleRenameFeature}
          handleDeleteSelected={handleDeleteSelected}
          handleReorder={handleReorder}
          setMapData={setMapData}
        />
      </div>
    </div>
  )
}
