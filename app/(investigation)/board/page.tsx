'use client'

import { useState, useEffect, useRef } from 'react'
import { ScreenHeader } from '@/components/investigation/screen-header'
import { getActiveCase } from '@/lib/mock-data'
import type { Case } from '@/lib/types'
import { ZoomIn, RotateCcw, X, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const DEFAULT_ITEMS: Record<string, BoardItem[]> = {
  'case-000': [
    {
      id: 'item-victim',
      type: 'victim',
      title: 'Nạn nhân: Thomas Vance',
      imgUrl: '/victim_thomas.png',
      x: 80,
      y: 80,
      width: 160,
      height: 210
    },
    {
      id: 'item-suspect',
      type: 'suspect',
      title: 'Nghi phạm: V. Marsh',
      imgUrl: '/suspect_marsh.png',
      x: 480,
      y: 70,
      width: 160,
      height: 210
    },
    {
      id: 'item-newspaper',
      type: 'newspaper',
      title: 'Mẩu báo: Pier 9 Mystery',
      imgUrl: '/newspaper_clipping.png',
      x: 60,
      y: 350,
      width: 200,
      height: 180
    },
    {
      id: 'item-note',
      type: 'note',
      title: 'Ghi chú: Lời khai mâu thuẫn',
      content: 'V. Marsh tuyên bố ở nhà ngủ lúc xảy ra vụ việc, nhưng tin nhắn gửi đi lúc 22:15 lại xác nhận có mặt tại Cầu cảng số 9. Marsh chắc chắn đang che giấu điều gì đó!',
      x: 460,
      y: 360,
      width: 220,
      height: 160
    }
  ],
  'case-01': [
    {
      id: 'item-victim',
      type: 'victim',
      title: 'Nạn nhân: Thomas Vance',
      imgUrl: '/victim_thomas.png',
      x: 100,
      y: 80,
      width: 160,
      height: 210
    },
    {
      id: 'item-suspect',
      type: 'suspect',
      title: 'Nghi phạm: V. Marsh',
      imgUrl: '/suspect_marsh.png',
      x: 480,
      y: 70,
      width: 160,
      height: 210
    },
    {
      id: 'item-newspaper',
      type: 'newspaper',
      title: 'Mẩu báo: Pier 9 Mystery',
      imgUrl: '/newspaper_clipping.png',
      x: 80,
      y: 350,
      width: 200,
      height: 180
    },
    {
      id: 'item-note',
      type: 'note',
      title: 'Manh mối: Hợp đồng vận đơn',
      content: 'Nhật ký cảng và vận đơn hàng hóa cho thấy Marsh đã cố tình sửa đổi các container số hiệu 104 và 209 để vận chuyển hàng cấm.',
      x: 460,
      y: 350,
      width: 220,
      height: 160
    }
  ]
}

const CONNECTIONS = [
  { from: 'item-victim', to: 'item-newspaper' },
  { from: 'item-suspect', to: 'item-note' },
  { from: 'item-victim', to: 'item-suspect' }
]

export default function EvidenceBoardPage() {
  const [activeCase, setActiveCase] = useState<Case | null>(null)
  const [items, setItems] = useState<BoardItem[]>([])
  const [zoomedItem, setZoomedItem] = useState<BoardItem | null>(null)
  
  const boardRef = useRef<HTMLDivElement>(null)
  const dragInfo = useRef<{ itemId: string; startX: number; startY: number } | null>(null)

  useEffect(() => {
    async function loadData() {
      const currentCase = await getActiveCase()
      if (currentCase) {
        setActiveCase(currentCase)
        const caseId = currentCase.id
        
        // Try load from localStorage
        try {
          const saved = localStorage.getItem(`veritas_board_${caseId}`)
          if (saved) {
            setItems(JSON.parse(saved))
            return
          }
        } catch {}

        setItems(DEFAULT_ITEMS[caseId] || DEFAULT_ITEMS['case-000'])
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

  // Reset to default positions
  const handleReset = () => {
    if (!activeCase) return
    const defaults = DEFAULT_ITEMS[activeCase.id] || DEFAULT_ITEMS['case-000']
    setItems(defaults)
    savePositions(defaults)
  }

  // Drag handlers using Pointer Events for Mobile + Desktop support
  const handlePointerDown = (e: React.PointerEvent, itemId: string) => {
    e.preventDefault()
    const item = items.find((it) => it.id === itemId)
    if (!item) return

    // Bring clicked item to front by placing it at the end of the array
    const filtered = items.filter((it) => it.id !== itemId)
    const updated = [...filtered, item]
    setItems(updated)

    dragInfo.current = {
      itemId,
      startX: e.clientX - item.x,
      startY: e.clientY - item.y
    }
    
    // Set pointer capture to tracking dragging outside elements
    const element = e.currentTarget as HTMLElement
    element.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragInfo.current) return
    const { itemId, startX, startY } = dragInfo.current

    // Calculate new position bounded inside container
    let newX = e.clientX - startX
    let newY = e.clientY - startY

    // Constraints
    if (newX < 10) newX = 10
    if (newY < 10) newY = 10

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
    dragInfo.current = null
    savePositions(items)
  }

  // Helper to find absolute coordinate for pins (top middle of the item)
  const getPinCenter = (itemId: string) => {
    const item = items.find((it) => it.id === itemId)
    if (!item) return { x: 0, y: 0 }
    return {
      x: item.x + item.width / 2,
      y: item.y + 15 // Pin offset from top border of card
    }
  }

  return (
    <div className="pb-10 min-h-dvh flex flex-col">
      <div className="px-4">
        <ScreenHeader
          eyebrow="BẰNG CHỨNG HÌNH SỰ"
          title="Evidence Board"
          description="Kéo thả sắp xếp tài liệu, xâu chuỗi thông tin vụ án bằng dây chỉ đỏ. Click để xem chi tiết."
        />
      </div>

      {/* Toolbar */}
      <div className="mx-4 mb-4 flex items-center justify-between border-b border-border/40 pb-3">
        <span className="font-mono text-[0.6rem] text-muted-foreground uppercase tracking-widest">
          Sơ đồ liên kết chứng cứ // BẢNG TỰ DO
        </span>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 font-mono text-[0.65rem] border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary px-3 py-1 rounded transition-all cursor-pointer font-bold uppercase active:scale-95"
        >
          <RotateCcw className="size-3" /> Reset Vị Trí
        </button>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 px-4 relative">
        <div
          ref={boardRef}
          className="relative w-full h-[600px] rounded-xl border border-border/80 overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] select-none"
          style={{
            backgroundImage: "url('/evidence_board_cork.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* CRT Scanline Overlay */}
          <div
            aria-hidden="true"
            className="noir-scanlines pointer-events-none absolute inset-0 z-10 opacity-15"
          />

          {/* SVG red strings layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            {/* Shadow filters for realistic cords */}
            <defs>
              <filter id="string-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.8" />
              </filter>
            </defs>

            {CONNECTIONS.map((conn, idx) => {
              const p1 = getPinCenter(conn.from)
              const p2 = getPinCenter(conn.to)
              if (p1.x === 0 || p2.x === 0) return null

              // Draw a slightly saggy bezier curve instead of a strict straight line
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
            return (
              <div
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={cn(
                  'absolute rounded shadow-lg transition-transform border cursor-move z-30 select-none overflow-hidden touch-none flex flex-col',
                  isNote
                    ? 'bg-amber-100/95 border-amber-300 text-amber-950 font-sans shadow-amber-950/20'
                    : 'bg-card border-border/80 text-card-foreground'
                )}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height
                }}
              >
                {/* Red Pin Header */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center">
                  <div className="size-4 rounded-full bg-red-600 border border-red-700 shadow-[0_2px_4px_rgba(0,0,0,0.6)] flex items-center justify-center relative">
                    {/* Pin pinhole shine */}
                    <div className="size-1 rounded-full bg-white/60 absolute top-0.5 left-0.5" />
                  </div>
                </div>

                {/* Content body */}
                {isNote ? (
                  <div className="flex-1 p-3 pt-6 flex flex-col justify-between">
                    <p className="text-[0.7rem] font-bold uppercase tracking-wider font-mono opacity-80 border-b border-amber-300/40 pb-1 mb-2">
                      {item.title}
                    </p>
                    <p className="flex-1 text-[0.7rem] font-medium leading-relaxed italic overflow-hidden">
                      "{item.content}"
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setZoomedItem(item)
                      }}
                      className="mt-2 text-[0.55rem] font-mono font-bold uppercase bg-amber-200/50 hover:bg-amber-300/60 transition-colors py-1 rounded text-center"
                    >
                      Phóng to
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    {/* Polaroid paper margin layout */}
                    <div className="flex-1 bg-white p-2.5 pt-6 flex flex-col justify-between">
                      {item.imgUrl ? (
                        <div
                          className="flex-1 bg-zinc-200 border border-zinc-300 overflow-hidden relative"
                          style={{
                            backgroundImage: `url(${item.imgUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                      ) : (
                        <div className="flex-1 bg-zinc-100 flex items-center justify-center text-[0.6rem] font-mono text-muted-foreground">
                          NO PREVIEW
                        </div>
                      )}
                      
                      <div className="mt-2 pt-2 border-t border-zinc-200 flex items-center justify-between">
                        <span className="text-[0.65rem] font-mono font-bold text-zinc-800 truncate max-w-[120px]">
                          {item.title}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setZoomedItem(item)
                          }}
                          className="p-1 rounded hover:bg-zinc-100 text-zinc-600 transition-colors"
                        >
                          <ZoomIn className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Lightbox / Zoom Overlay Modal */}
      {zoomedItem && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-lg w-full bg-card border border-border rounded-xl shadow-2xl p-6 flex flex-col gap-4">
            
            {/* Close button */}
            <button
              onClick={() => setZoomedItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-border bg-card/65 text-muted-foreground hover:text-foreground transition-all active:scale-95"
            >
              <X className="size-4" />
            </button>

            {/* Header info */}
            <div className="border-b border-border/40 pb-2 flex items-center gap-2">
              <Pin className="size-4 text-red-500" />
              <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
                {zoomedItem.title}
              </span>
            </div>

            {/* Main content display */}
            <div className="flex justify-center items-center rounded overflow-hidden border border-border/60 bg-muted/20">
              {zoomedItem.type === 'note' ? (
                <div className="bg-amber-100 border border-amber-300 text-amber-950 p-8 w-full min-h-[220px] font-sans flex items-center justify-center text-center">
                  <p className="text-sm font-semibold leading-relaxed italic">
                    "{zoomedItem.content}"
                  </p>
                </div>
              ) : zoomedItem.imgUrl ? (
                <img
                  src={zoomedItem.imgUrl}
                  alt={zoomedItem.title}
                  className="max-h-[380px] w-auto object-contain"
                />
              ) : (
                <div className="py-24 text-muted-foreground font-mono text-xs">
                  Không có hình ảnh hiển thị.
                </div>
              )}
            </div>

            {/* Footer description */}
            <div className="text-center">
              <span className="font-mono text-[0.65rem] text-muted-foreground uppercase">
                Bằng chứng thuộc Hồ sơ vụ án: {activeCase?.title}
              </span>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
