'use client'

import { useState } from 'react'
import { User, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineSlot {
  time: string
  label: string
  expectedId: string // The correct card ID that belongs here
  currentCardId: string | null // The card currently placed by user
  clashCardId?: string // A card ID that, if placed, triggers a logical conflict
  conflictMsg?: string // Custom conflict message
}

interface EvidenceCard {
  id: string
  title: string
  owner: string
  type: 'testimony' | 'forensic'
  content: string
}

export function TimelineTool() {
  const [activeSuspect, setActiveSuspect] = useState<'khang' | 'mai' | 'vu'>('khang')

  // Initial timeline slots configuration for the active suspect
  const [slots, setSlots] = useState<Record<string, TimelineSlot[]>>({
    khang: [
      { 
        time: '08:30', 
        label: 'Lập di chúc', 
        expectedId: 'k-1', 
        currentCardId: null 
      },
      { 
        time: '20:10', 
        label: 'Lời khai ngoại phạm', 
        expectedId: 'k-2', 
        currentCardId: null,
        clashCardId: 'k-3',
        conflictMsg: 'Khang nhắn tin báo đang xem bóng đá tại nhà riêng, nhưng định vị GPS thực tế lại ghi nhận điện thoại của anh ta đang di chuyển tại khu giải tỏa Bờ Sông!'
      },
      { 
        time: '21:00', 
        label: 'Mất tín hiệu', 
        expectedId: 'k-4', 
        currentCardId: null 
      }
    ],
    mai: [
      { 
        time: '11:30', 
        label: 'Lịch sử tìm kiếm', 
        expectedId: 'm-1', 
        currentCardId: null 
      },
      { 
        time: '20:15', 
        label: 'Ngoại phạm tại Spa', 
        expectedId: 'm-2', 
        currentCardId: null,
        clashCardId: 'm-3',
        conflictMsg: 'Mai khai đang làm liệu trình tại Spa từ 19:30 đến 21:30, nhưng lại phát hiện vé gửi xe máy của cô ấy tại bãi đất gần hiện trường lúc 20:15!'
      }
    ],
    vu: [
      { 
        time: '18:20', 
        label: 'Hồ sơ đo đạc khống', 
        expectedId: 'v-1', 
        currentCardId: null 
      },
      { 
        time: '20:30', 
        label: 'Camera an ninh', 
        expectedId: 'v-2', 
        currentCardId: null 
      }
    ]
  })

  // Available evidence cards to be placed
  const [cards, setCards] = useState<EvidenceCard[]>([
    // Khang cards
    { id: 'k-1', title: 'Bản di chúc viết tay', owner: 'Khang', type: 'forensic', content: 'Di chúc tự viết tay để lại toàn bộ tài sản cho bố mẹ đẻ.' },
    { id: 'k-2', title: 'Tin nhắn: "Tôi đang ở nhà"', owner: 'Khang', type: 'testimony', content: 'Khang nhắn tin cho bạn báo đang ở nhà xem bóng đá.' },
    { id: 'k-3', title: 'GPS: Khu giải tỏa Bờ Sông', owner: 'Khang', type: 'forensic', content: 'Định vị GPS ghi nhận thiết bị tại căn nhà cũ lúc 20:10.' },
    { id: 'k-4', title: 'Mất tín hiệu điện thoại', owner: 'Khang', type: 'forensic', content: 'Điện thoại của Khang bị tắt nguồn đột ngột từ 21:00.' },
    
    // Mai cards
    { id: 'm-1', title: 'Lịch sử tìm kiếm giám định', owner: 'Trần Ngọc Mai', type: 'forensic', content: 'Tìm kiếm dịch vụ giám định chữ viết tư nhân lúc 11:30.' },
    { id: 'm-2', title: 'Lời khai: Đi Spa chăm sóc da', owner: 'Trần Ngọc Mai', type: 'testimony', content: 'Mai khai đi làm đẹp tại Spa quận Hai Bà Trưng cả tối.' },
    { id: 'm-3', title: 'Vé gửi xe gần hiện trường', owner: 'Trần Ngọc Mai', type: 'forensic', content: 'Phát hiện vé gửi xe máy của Mai tại bãi đất gần hiện trường lúc 20:15.' },

    // Vũ cards
    { id: 'v-1', title: 'Bản vẽ đo đạc sai lệch', owner: 'Lê Quang Vũ', type: 'forensic', content: 'Vũ ký biên bản khống diện tích đất đền bù.' },
    { id: 'v-2', title: 'Camera ghi nhận bóng người', owner: 'Lê Quang Vũ', type: 'forensic', content: 'Camera nhà đối diện ghi nhận bóng dáng giống Vũ lúc 20:45.' }
  ])

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [conflictAlert, setConflictAlert] = useState<string | null>(null)
  const [solvedState, setSolvedState] = useState<boolean>(false)

  // Handle placing a card into a timeline slot
  const handlePlaceCard = (slotIndex: number) => {
    if (!selectedCardId) return

    const currentSuspectSlots = [...slots[activeSuspect]]
    const targetSlot = currentSuspectSlots[slotIndex]
    const cardToPlace = cards.find(c => c.id === selectedCardId)

    if (!cardToPlace) return

    // Set card in slot
    targetSlot.currentCardId = selectedCardId
    
    // Trigger check
    const updatedSlots = { ...slots, [activeSuspect]: currentSuspectSlots }
    setSlots(updatedSlots)
    setSelectedCardId(null)

    // Check for conflict (Clash detection)
    if (targetSlot.clashCardId && targetSlot.currentCardId === targetSlot.clashCardId) {
      setConflictAlert(targetSlot.conflictMsg || 'Phát hiện mâu thuẫn ngoại phạm!')
    } else {
      setConflictAlert(null)
    }

    // Check if the current suspect timeline is fully solved
    const allFilledCorrectly = currentSuspectSlots.every(s => s.currentCardId === s.expectedId)
    if (allFilledCorrectly) {
      setSolvedState(true)
    } else {
      setSolvedState(false)
    }
  }

  // Clear slot
  const handleClearSlot = (slotIndex: number) => {
    const currentSuspectSlots = [...slots[activeSuspect]]
    currentSuspectSlots[slotIndex].currentCardId = null
    const updatedSlots = { ...slots, [activeSuspect]: currentSuspectSlots }
    setSlots(updatedSlots)
    setConflictAlert(null)
    setSolvedState(false)
  }

  return (
    <div className="flex flex-col gap-4 px-1">
      {/* 1. Suspect Avatars Selector */}
      <div className="flex items-center justify-between border border-border bg-card/40 rounded-lg p-3">
        <span className="font-mono text-[0.6rem] text-muted-foreground uppercase tracking-widest">
          CHỌN ĐỐI TƯỢNG ĐỐI CHIẾU
        </span>
        <div className="flex items-center gap-3">
          {[
            { id: 'khang' as const, name: 'N.V. Khang (Nạn nhân)', color: 'border-primary' },
            { id: 'mai' as const, name: 'T.N. Mai (Vợ)', color: 'border-destructive' },
            { id: 'vu' as const, name: 'L.Q. Vũ (Em rể)', color: 'border-amber-600' }
          ].map((suspect) => (
            <button
              key={suspect.id}
              onClick={() => {
                setActiveSuspect(suspect.id)
                setConflictAlert(null)
                setSolvedState(false)
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded border text-[0.625rem] font-mono transition-all cursor-pointer",
                activeSuspect === suspect.id 
                  ? "bg-primary/10 border-primary text-primary font-bold shadow-[0_0_8px_rgba(199,145,55,0.15)]"
                  : "bg-transparent border-border/80 text-muted-foreground"
              )}
            >
              <span className={cn("size-2 rounded-full border bg-card", suspect.color)} />
              {suspect.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        
        {/* Left Side: Interactive Timeline Spine */}
        <div className="border border-border bg-card/25 rounded-lg p-4 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
          
          {/* Timeline header */}
          <div className="flex justify-between items-center border-b border-border/30 pb-2 mb-4">
            <span className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
              <Clock className="size-4 text-primary" /> TRỤC THỜI GIAN DIỄN BIẾN SỰ VIỆC
            </span>
            <span className="font-mono text-[0.55rem] text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
              ĐỐI CHIẾU NGOẠI PHẠM (ALIBI CLASH)
            </span>
          </div>

          {/* Spine Nodes */}
          <div className="relative pl-6 flex-1 flex flex-col gap-6 py-2">
            {/* The Spine Line */}
            <div className="absolute left-[33px] top-4 bottom-4 w-[1px] bg-border/60" />

            {slots[activeSuspect].map((slot, index) => {
              const currentCard = cards.find(c => c.id === slot.currentCardId)
              const hasClash = slot.currentCardId === slot.clashCardId
              const isCorrect = slot.currentCardId === slot.expectedId

              return (
                <div key={index} className="flex gap-4 items-start relative z-10">
                  {/* Spine Node Pin */}
                  <div className={cn(
                    "size-6 rounded-full border bg-card flex items-center justify-center font-mono text-[0.55rem] font-bold shrink-0 shadow-sm transition-all",
                    isCorrect && "border-emerald-500 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]",
                    hasClash && "border-destructive text-destructive animate-ping-once shadow-[0_0_8px_rgba(239,68,68,0.2)]",
                    !slot.currentCardId && "border-border text-muted-foreground"
                  )}>
                    {slot.time}
                  </div>

                  {/* Slot Target */}
                  <div 
                    onClick={() => handlePlaceCard(index)}
                    className={cn(
                      "flex-1 rounded-lg border p-3 flex flex-col justify-between min-h-[68px] transition-all duration-200 cursor-pointer",
                      hasClash && "border-destructive/40 bg-destructive/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]",
                      isCorrect && "border-emerald-500/25 bg-emerald-500/5",
                      !slot.currentCardId && "border-dashed border-border/80 bg-card/20 hover:bg-card/45 hover:border-primary/30"
                    )}
                  >
                    <div>
                      <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">
                        {slot.label}
                      </span>
                      {currentCard ? (
                        <div className="mt-1 flex flex-col">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1">
                            {currentCard.title}
                            {isCorrect && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                          </span>
                          <span className="text-[0.65rem] text-muted-foreground mt-0.5">
                            {currentCard.content}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[0.65rem] text-muted-foreground/60 italic block mt-1">
                          [ Nhấp vào đây để đặt mảnh ghép bằng chứng ]
                        </span>
                      )}
                    </div>

                    {currentCard && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleClearSlot(index)
                        }}
                        className="self-end font-mono text-[0.5rem] text-destructive hover:underline mt-2 uppercase"
                      >
                        Gỡ bỏ mảnh ghép
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </div>

        {/* Right Side: Evidence Fragments Deck */}
        <div className="flex flex-col gap-3">
          <div className="border border-border bg-card/40 rounded-lg p-3">
            <span className="font-mono text-[0.6rem] text-muted-foreground uppercase tracking-widest block mb-2">
              KHO MẢNH GHÉP TANG VẬT (DECK)
            </span>
            <p className="text-[0.625rem] text-muted-foreground leading-relaxed">
              Chọn một mảnh ghép bằng chứng bên dưới, sau đó click vào một ô trống trên trục thời gian để xâu chuỗi thông tin.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[300px] pr-1">
            {cards
              .filter(card => {
                if (activeSuspect === 'khang') return card.owner.toLowerCase().includes('khang')
                if (activeSuspect === 'mai') return card.owner.toLowerCase().includes('mai')
                return card.owner.toLowerCase().includes('vũ') || card.owner.toLowerCase().includes('vu')
              })
              .map((card) => {
                const isPlaced = Object.values(slots).flat().some(s => s.currentCardId === card.id)

                return (
                  <button
                    key={card.id}
                    disabled={isPlaced}
                    onClick={() => setSelectedCardId(selectedCardId === card.id ? null : card.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer",
                      isPlaced && "opacity-30 border-border bg-muted/5 cursor-not-allowed",
                      selectedCardId === card.id 
                        ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(199,145,55,0.1)] scale-102"
                        : "border-border/80 bg-card hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-foreground">{card.title}</span>
                      <span className={cn(
                        "font-mono text-[0.5rem] px-1 py-0.5 rounded border uppercase",
                        card.type === 'forensic' ? "text-primary border-primary/20 bg-primary/5" : "text-muted-foreground border-border"
                      )}>
                        {card.type === 'forensic' ? 'Vật chứng' : 'Lời khai'}
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      {card.content}
                    </p>
                  </button>
                )
              })}
          </div>
        </div>

      </div>

      {/* 3. Logic Conflict Alert / Assistant Callout */}
      {conflictAlert && (
        <div className="border border-destructive/40 bg-destructive/5 rounded-lg p-4 flex gap-3.5 items-start animate-pulse-slow">
          <ShieldAlert className="size-6 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-mono text-[0.6rem] text-destructive uppercase tracking-widest font-bold block">
              CẢNH BÁO MÂU THUẪN NGOẠI PHẠM (ALIBI CLASH DETECTED)
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              {conflictAlert}
            </p>
            <div className="mt-3 border-t border-destructive/20 pt-2 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary shrink-0" />
              <p className="text-[0.65rem] text-primary font-mono font-bold uppercase">
                TRỢ LÝ MINH: "Sơ hở logic này chứng tỏ nghi phạm đang cung cấp lời khai giả tạo!"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Solved Success Banner */}
      {solvedState && !conflictAlert && (
        <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-4 flex gap-3.5 items-start">
          <CheckCircle2 className="size-6 text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-mono text-[0.6rem] text-emerald-500 uppercase tracking-widest font-bold block flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> XÁC THỰC LỘ TRÌNH THÀNH CÔNG
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Bạn đã xếp đặt chính xác các mốc thời gian và bằng chứng cho đối tượng này. Dòng thời gian đã được khóa và đồng bộ với cơ sở dữ liệu pháp y của tổng cục.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
