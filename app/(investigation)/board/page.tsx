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
          className="flex items-center gap-1.5 font-mono text-[0.65rem] border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive px-3 py-1 rounded transition-all cursor-pointer font-bold uppercase active:scale-95"
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
            return (
              <div
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={cn(
                  'absolute rounded shadow-lg transition-transform border cursor-move z-30 select-none overflow-hidden touch-none flex flex-col group',
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
                    <div className="size-1 rounded-full bg-white/60 absolute top-0.5 left-0.5" />
                  </div>
                </div>

                {/* Unpin button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnpinClue(item.id)
                  }}
                  className="absolute top-1 right-1 z-40 p-0.5 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
                  title="Gỡ khỏi bảng"
                >
                  <X className="size-3" />
                </button>

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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {unlockedClues.map((clue) => {
              const isPinned = items.some(item => item.id === clue.id)
              
              return (
                <div
                  key={clue.id}
                  className={cn(
                    "rounded-lg border p-3 flex flex-col justify-between transition-all bg-card/45 relative overflow-hidden",
                    isPinned ? "border-primary/20 opacity-55" : "border-border/60 hover:border-primary/45"
                  )}
                >
                  <div className="min-w-0">
                    <span className={cn(
                      "text-[0.55rem] font-mono font-black uppercase px-1 rounded inline-block mb-1.5",
                      clue.type === 'victim' && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                      clue.type === 'suspect' && "bg-sky-500/10 text-sky-400 border border-sky-500/20",
                      clue.type === 'newspaper' && "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
                      clue.type === 'note' && "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    )}>
                      {clue.type}
                    </span>
                    <h4 className="font-sans text-[0.7rem] font-bold text-foreground truncate" title={clue.title}>
                      {clue.title}
                    </h4>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    {isPinned ? (
                      <span className="text-[0.6rem] font-mono text-primary font-bold">
                        Đã ghim
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePinClue(clue.id)}
                        className="flex items-center gap-1 text-[0.6rem] font-mono font-bold bg-primary/10 hover:bg-primary/25 border border-primary/25 text-primary px-2 py-0.5 rounded transition-all w-full justify-center cursor-pointer"
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
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-lg w-full bg-card border border-border rounded-xl shadow-2xl p-6 flex flex-col gap-4">
            
            <button
              onClick={() => setZoomedItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-border bg-card/65 text-muted-foreground hover:text-foreground transition-all active:scale-95"
            >
              <X className="size-4" />
            </button>

            <div className="border-b border-border/40 pb-2 flex items-center gap-2">
              <Pin className="size-4 text-red-500" />
              <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
                {zoomedItem.title}
              </span>
            </div>

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
