'use client'

import { useState, useEffect, useRef } from 'react'
import { ScreenHeader } from '@/components/investigation/screen-header'
import { getActiveCase } from '@/lib/mock-data'
import type { Case } from '@/lib/types'
import { ZoomIn, RotateCcw, X, Pin, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCheckpoints } from '@/components/investigation/checkpoints-context'

interface BoardItem {
  id: string
  type: 'suspect' | 'victim' | 'newspaper' | 'note'
  title: string
  imgUrl?: string
  content?: string
  x: number
  y: number
  width: number
  height: number
}

// All possible clues pool
const ALL_CLUES_POOL: Record<string, (completedCheckpointIds: string[]) => (BoardItem & { unlocked: boolean })[]> = {
  'case-000': (completedCheckpointIds) => [
    {
      id: 'item-victim',
      type: 'victim',
      title: 'Nạn nhân: Nguyễn Văn Khang',
      imgUrl: '/victim_khang.png',
      x: 80,
      y: 80,
      width: 165,
      height: 220,
      unlocked: true
    },
    {
      id: 'item-newspaper',
      type: 'newspaper',
      title: 'Mẩu báo: Bí ẩn căn nhà giải tỏa',
      imgUrl: '/newspaper_clipping.png',
      x: 80,
      y: 340,
      width: 200,
      height: 180,
      unlocked: true
    },
    {
      id: 'item-tung',
      type: 'suspect',
      title: 'Nghi phạm: Tùng (Bạn cũ)',
      imgUrl: '/victim_thomas.png',
      x: 320,
      y: 80,
      width: 165,
      height: 220,
      unlocked: true
    },
    {
      id: 'item-mai',
      type: 'suspect',
      title: 'Nghi phạm: Trần Ngọc Mai',
      imgUrl: '/suspect_marsh.png',
      x: 560,
      y: 80,
      width: 165,
      height: 220,
      unlocked: completedCheckpointIds.includes('cp-000-1')
    },
    {
      id: 'item-will',
      type: 'note',
      title: 'Bản sao di chúc bị tráo',
      content: 'Bản sao di chúc viết tay để lại căn nhà cho Khang, được Trần Ngọc Mai tráo vào hộp sắt để lấy di chúc thật đi giám định chữ viết.',
      x: 560,
      y: 340,
      width: 220,
      height: 170,
      unlocked: completedCheckpointIds.includes('cp-000-1')
    },
    {
      id: 'item-vu',
      type: 'suspect',
      title: 'Nghi phạm: Lê Quang Vũ',
      imgUrl: '/victim_thomas.png',
      x: 800,
      y: 80,
      width: 165,
      height: 220,
      unlocked: completedCheckpointIds.includes('cp-000-2')
    },
    {
      id: 'item-map',
      type: 'note',
      title: 'Bản vẽ sửa nhà gốc',
      content: 'Bản vẽ sửa nhà gốc Khang dùng để khống chế Lê Quang Vũ, đe dọa tố cáo sai phạm đo vẽ thêm diện tích đền bù.',
      x: 800,
      y: 340,
      width: 220,
      height: 170,
      unlocked: completedCheckpointIds.includes('cp-000-2')
    },
    {
      id: 'item-whistle',
      type: 'note',
      title: 'Còi đồng Gia Huy',
      content: 'Chiếc còi đồng cũ của đứa trẻ mất tích Gia Huy, chứng cứ then chốt cho thấy Khang tống tiền cả nhóm bạn bằng bí mật quá khứ.',
      x: 320,
      y: 340,
      width: 220,
      height: 170,
      unlocked: completedCheckpointIds.includes('cp-000-3')
    }
  ],
  'case-01': () => [
    {
      id: 'item-victim',
      type: 'victim',
      title: 'Nạn nhân: Thomas Vance',
      imgUrl: '/victim_thomas.png',
      x: 100,
      y: 80,
      width: 160,
      height: 210,
      unlocked: true
    },
    {
      id: 'item-suspect',
      type: 'suspect',
      title: 'Nghi phạm: V. Marsh',
      imgUrl: '/suspect_marsh.png',
      x: 480,
      y: 70,
      width: 160,
      height: 210,
      unlocked: true
    },
    {
      id: 'item-newspaper',
      type: 'newspaper',
      title: 'Mẩu báo: Pier 9 Mystery',
      imgUrl: '/newspaper_clipping.png',
      x: 80,
      y: 350,
      width: 200,
      height: 180,
      unlocked: true
    },
    {
      id: 'item-note',
      type: 'note',
      title: 'Manh mối: Hợp đồng vận đơn',
      content: 'Nhật ký cảng và vận đơn hàng hóa cho thấy Marsh đã cố tình sửa đổi các container số hiệu 104 và 209 để vận chuyển hàng cấm.',
      x: 460,
      y: 350,
      width: 220,
      height: 160,
      unlocked: true
    }
  ]
}

const CONNECTIONS = [
  { from: 'item-victim', to: 'item-newspaper' },
  { from: 'item-tung', to: 'item-whistle' },
  { from: 'item-mai', to: 'item-will' },
  { from: 'item-vu', to: 'item-map' },
  { from: 'item-victim', to: 'item-tung' },
  { from: 'item-victim', to: 'item-mai' },
  { from: 'item-victim', to: 'item-vu' }
]

export default function EvidenceBoardPage() {
  const [activeCase, setActiveCase] = useState<Case | null>(null)
  const [items, setItems] = useState<BoardItem[]>([])
  const [zoomedItem, setZoomedItem] = useState<BoardItem | null>(null)
  const { completedCheckpointIds } = useCheckpoints()
  
  const boardRef = useRef<HTMLDivElement>(null)
  const dragInfo = useRef<{ itemId: string; startX: number; startY: number } | null>(null)
  const [zoomedActive, setZoomedActive] = useState(false)
  const hasDragged = useRef(false)
  const [morphOrigin, setMorphOrigin] = useState<{
    tx: number;
    ty: number;
    sx: number;
    sy: number;
  } | null>(null)

  const triggerZoom = (item: BoardItem, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    
    let tw = 0
    let th = 0
    
    if (item.type === 'note') {
      tw = Math.min(380, window.innerWidth - 32)
      th = 220
    } else {
      const maxW = window.innerWidth * 0.9
      const maxH = window.innerHeight * 0.8
      const ratio = rect.width / rect.height
      tw = maxW
      th = maxW / ratio
      if (th > maxH) {
        th = maxH
        tw = maxH * ratio
      }
    }
    
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    const ix = rect.left + rect.width / 2
    const iy = rect.top + rect.height / 2
    const tx = ix - cx
    const ty = iy - cy
    const sx = rect.width / tw
    const sy = rect.height / th
    
    setMorphOrigin({ tx, ty, sx, sy })
    setZoomedItem(item)
  }

  // Trigger zoom opening transition
  useEffect(() => {
    if (zoomedItem) {
      const timer = setTimeout(() => setZoomedActive(true), 20)
      return () => clearTimeout(timer)
    } else {
      setZoomedActive(false)
    }
  }, [zoomedItem])

  // Load active case and saved layout from localStorage
  useEffect(() => {
    async function loadData() {
      const currentCase = await getActiveCase()
      if (currentCase) {
        setActiveCase(currentCase)
        const caseId = currentCase.id
        
        try {
          const saved = localStorage.getItem(`veritas_board_${caseId}`)
          if (saved) {
            setItems(JSON.parse(saved))
            return
          }
        } catch {}
        
        // Default is EMPTY board (empty array)
        setItems([])
      }
    }
    loadData()
  }, [])

  // Save layout positions
  const savePositions = (newItems: BoardItem[]) => {
    if (!activeCase) return
    try {
      localStorage.setItem(`veritas_board_${activeCase.id}`, JSON.stringify(newItems))
    } catch {}
  }

  // Get current case clues pool
  const currentCaseId = activeCase?.id || 'case-000'
  const clueGenerator = ALL_CLUES_POOL[currentCaseId] || ALL_CLUES_POOL['case-000']
  const allClues = clueGenerator(completedCheckpointIds)
  const unlockedClues = allClues.filter(c => c.unlocked)

  // Pin a clue onto the board at default center coordinate
  const handlePinClue = (clueId: string) => {
    if (items.some(item => item.id === clueId)) return // Already pinned
    const clue = allClues.find(c => c.id === clueId)
    if (!clue) return

    // Position it at a random/default center on screen
    const newItems = [
      ...items,
      {
        id: clue.id,
        type: clue.type,
        title: clue.title,
        imgUrl: clue.imgUrl,
        content: clue.content,
        x: clue.x,
        y: clue.y,
        width: clue.width,
        height: clue.height
      }
    ]
    setItems(newItems)
    savePositions(newItems)
  }

  // Unpin a clue from the board
  const handleUnpinClue = (clueId: string) => {
    const newItems = items.filter(item => item.id !== clueId)
    setItems(newItems)
    savePositions(newItems)
  }

  // Reset: Clear entire board
  const handleReset = () => {
    setItems([])
    savePositions([])
  }

  // Drag handlers using Pointer Events
  const handlePointerDown = (e: React.PointerEvent, itemId: string) => {
    e.preventDefault()
    const item = items.find((it) => it.id === itemId)
    if (!item) return

    // Bring to front
    const filtered = items.filter((it) => it.id !== itemId)
    const updated = [...filtered, item]
    setItems(updated)

    hasDragged.current = false

    dragInfo.current = {
      itemId,
      startX: e.clientX - item.x,
      startY: e.clientY - item.y
    }
    
    const element = e.currentTarget as HTMLElement
    element.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragInfo.current) return
    const { itemId, startX, startY } = dragInfo.current

    let newX = e.clientX - startX
    let newY = e.clientY - startY

    if (newX < 10) newX = 10
    if (newY < 10) newY = 10

    const item = items.find((it) => it.id === itemId)
    if (item && (Math.abs(newX - item.x) > 4 || Math.abs(newY - item.y) > 4)) {
      hasDragged.current = true
    }

    const updated = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, x: newX, y: newY }
      }
      return item
    })
    setItems(updated)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragInfo.current) return
    const { itemId } = dragInfo.current
    dragInfo.current = null
    savePositions(items)

    // If it was a simple click down & up, zoom it!
    if (!hasDragged.current) {
      const item = items.find((it) => it.id === itemId)
      if (item) {
        triggerZoom(item, e.currentTarget as HTMLElement)
      }
    }
  }

  const getPinCenter = (itemId: string) => {
    const item = items.find((it) => it.id === itemId)
    if (!item) return { x: 0, y: 0 }
    return {
      x: item.x + item.width / 2,
      y: item.y + 15
    }
  }

  return (
    <div className="pb-10 min-h-dvh flex flex-col">
      <div className="px-4">
        <ScreenHeader
          eyebrow="BẰNG CHỨNG HÌNH SỰ"
          title="Bảng Chứng Cứ"
          description="Kéo thả sắp xếp tài liệu, xâu chuỗi thông tin vụ án bằng dây chỉ đỏ. Click để xem chi tiết."
        />
      </div>

      {/* Toolbar */}
      <div className="mx-4 mb-4 flex items-center justify-between border-b border-border/40 pb-3 font-sans">
        <span className="text-[0.6rem] text-muted-foreground uppercase tracking-widest font-bold">
          Sơ đồ liên kết chứng cứ // BẢN ĐỒ CHUYÊN ÁN
        </span>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-[0.65rem] border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive px-3 py-1 rounded transition-all cursor-pointer font-bold uppercase active:scale-95"
        >
          <RotateCcw className="size-3" /> Dọn sạch bảng
        </button>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 px-4 relative">
        <div
          ref={boardRef}
          className="relative w-full h-[580px] rounded-xl border border-border/80 overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] select-none"
          style={{
            backgroundImage: "url('/evidence_board_cork.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* SVG red strings layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            <defs>
              <filter id="string-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.8" />
              </filter>
            </defs>

            {CONNECTIONS.map((conn, idx) => {
              const p1 = getPinCenter(conn.from)
              const p2 = getPinCenter(conn.to)
              // Only draw if both clues are currently pinned on the board
              if (p1.x === 0 || p2.x === 0) return null

              const controlY = Math.max(p1.y, p2.y) + 30
              const controlX = (p1.x + p2.x) / 2

              return (
                <path
                  key={idx}
                  d={`M ${p1.x} ${p1.y} Q ${controlX} ${controlY} ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke="rgba(220, 38, 38, 0.85)"
                  strokeWidth="2.5"
                  filter="url(#string-shadow)"
                  className="animate-pulse"
                />
              )
            })}
          </svg>

          {/* Draggable items */}
          {items.map((item) => {
            const isNote = item.type === 'note'
            const isZoomed = zoomedItem?.id === item.id
            return (
              <div
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={cn(
                  'absolute rounded shadow-lg transition-transform cursor-move z-30 select-none overflow-hidden touch-none flex flex-col group',
                  isNote
                    ? 'bg-amber-100/95 border border-amber-300 text-amber-950 font-sans shadow-lg shadow-amber-950/20 p-3.5 pt-6'
                    : 'bg-transparent text-card-foreground hover:scale-102 transition-transform duration-200',
                  isZoomed && 'opacity-0 pointer-events-none'
                )}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height
                }}
              >
                {/* Red Pin Header */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none">
                  <div className="size-4 rounded-full bg-red-600 border border-red-700 shadow-[0_2px_4px_rgba(0,0,0,0.6)] flex items-center justify-center relative">
                    <div className="size-1 rounded-full bg-white/60 absolute top-0.5 left-0.5" />
                  </div>
                </div>

                {/* Unpin button */}
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnpinClue(item.id)
                  }}
                  className="absolute top-1.5 right-1.5 z-40 p-0.5 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
                  title="Gỡ khỏi bảng"
                >
                  <X className="size-3.5" />
                </button>

                {/* Content body */}
                {isNote ? (
                  <div className="flex-1 flex flex-col justify-between h-full pointer-events-none">
                    <p className="text-[0.75rem] font-bold uppercase tracking-wider font-sans opacity-85 border-b border-amber-300/40 pb-1 mb-2">
                      {item.title}
                    </p>
                    <p className="flex-1 text-[0.75rem] font-medium leading-relaxed italic overflow-hidden">
                      "{item.content}"
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col pointer-events-none">
                    {item.imgUrl ? (
                      <div
                        className="w-full h-full overflow-hidden relative rounded border border-primary/20 shadow-md group-hover:shadow-xl group-hover:border-primary/50 transition-all duration-200"
                        style={{
                          backgroundImage: `url(${item.imgUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {/* Hover Overlay with ZoomIn Icon */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors duration-200">
                          <ZoomIn className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90 group-hover:scale-100" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-zinc-800 border border-border flex items-center justify-center text-[0.65rem] font-sans text-muted-foreground">
                        KHÔNG CÓ HÌNH ẢNH
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Clue Inventory / Tray Section */}
      <div className="mt-6 px-4">
        <h3 className="font-sans text-xs font-bold text-primary uppercase tracking-wider mb-3">
          Khay Manh Mối Thu Thập Được ({unlockedClues.length} đã mở khóa)
        </h3>
        
        {unlockedClues.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/40 p-6 text-center text-xs text-muted-foreground">
            Chưa phát hiện manh mối nào để đưa lên bảng.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {unlockedClues.map((clue) => {
              const isPinned = items.some(item => item.id === clue.id)
              
              return (
                <div
                  key={clue.id}
                  className={cn(
                    "relative aspect-[4/3] rounded-lg p-4 flex flex-col justify-between transition-all overflow-hidden shadow-[0_4px_8px_rgba(0,0,0,0.3)] select-none border border-amber-950/10 group",
                    isPinned ? "opacity-45 scale-98" : "hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.5)] active:scale-98"
                  )}
                  style={{
                    backgroundImage: "url('/manila_folder.png')",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div className="min-w-0 flex-1 flex flex-col pt-3 pointer-events-none">
                    <span className={cn(
                      "text-[0.55rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border w-fit mb-2 text-center",
                      clue.type === 'victim' && "border-red-600/30 text-red-800 bg-red-500/5",
                      clue.type === 'suspect' && "border-blue-600/30 text-blue-800 bg-blue-500/5",
                      clue.type === 'newspaper' && "border-yellow-600/30 text-yellow-900 bg-yellow-500/5",
                      clue.type === 'note' && "border-amber-600/30 text-amber-950 bg-amber-500/5"
                    )}>
                      {clue.type === 'victim' ? 'Nạn nhân' : clue.type === 'suspect' ? 'Nghi phạm' : clue.type === 'newspaper' ? 'Tin báo' : 'Ghi chú'}
                    </span>
                    <h4 className="font-sans text-[0.7rem] font-black text-amber-950 leading-snug line-clamp-2 max-h-[34px] overflow-hidden">
                      {clue.title}
                    </h4>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between z-10">
                    {isPinned ? (
                      <span className="text-[0.6rem] font-sans text-amber-900/60 font-bold mx-auto">
                        Đã ghim lên bảng
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePinClue(clue.id)}
                        className="flex items-center gap-1 text-[0.6rem] font-sans font-bold bg-amber-950/10 hover:bg-amber-950/20 border border-amber-950/20 text-amber-950 px-2 py-1 rounded transition-all w-full justify-center cursor-pointer shadow-sm active:scale-95"
                      >
                        <Plus className="size-3" /> Ghim lên bảng
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Overlay Modal */}
      {zoomedItem && (
        <div 
          onClick={() => {
            setZoomedActive(false)
            setTimeout(() => setZoomedItem(null), 250)
          }}
          className={cn(
            "fixed inset-0 bg-transparent z-50 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ease-out cursor-zoom-out",
            zoomedActive ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {zoomedItem.type === 'note' ? (
            <div 
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative max-w-sm w-full bg-amber-100 border border-amber-300 text-amber-950 p-8 rounded shadow-2xl font-sans flex items-center justify-center text-center transition-all duration-300 ease-out cursor-default",
                zoomedActive ? "opacity-100" : "opacity-0"
              )}
              style={
                morphOrigin
                  ? {
                      transform: zoomedActive
                        ? 'translate(0px, 0px) scale(1)'
                        : `translate(${morphOrigin.tx}px, ${morphOrigin.ty}px) scale(${morphOrigin.sx}, ${morphOrigin.sy})`,
                      transformOrigin: 'center center',
                    }
                  : undefined
              }
            >
              <p className="text-sm font-semibold leading-relaxed italic">
                "{zoomedItem.content}"
              </p>
            </div>
          ) : (
            <div 
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative transition-all duration-300 ease-out transform cursor-default flex items-center justify-center",
                zoomedActive ? "opacity-100" : "opacity-0"
              )}
              style={
                morphOrigin
                  ? {
                      transform: zoomedActive
                        ? 'translate(0px, 0px) scale(1)'
                        : `translate(${morphOrigin.tx}px, ${morphOrigin.ty}px) scale(${morphOrigin.sx}, ${morphOrigin.sy})`,
                      transformOrigin: 'center center',
                    }
                  : undefined
              }
            >
              {zoomedItem.imgUrl ? (
                <img
                  src={zoomedItem.imgUrl}
                  alt={zoomedItem.title}
                  className="max-h-[80vh] max-w-[90vw] w-auto h-auto rounded-lg shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-primary/20 select-none pointer-events-none"
                />
              ) : (
                <div className="py-24 text-muted-foreground font-sans text-xs bg-card p-6 rounded border border-border">
                  Không có hình ảnh hiển thị.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
