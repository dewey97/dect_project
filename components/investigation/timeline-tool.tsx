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
  const [activeSuspect, setActiveSuspect] = useState<'thomas' | 'marsh' | 'foreman'>('thomas')

  // Initial timeline slots configuration for the active suspect
  const [slots, setSlots] = useState<Record<string, TimelineSlot[]>>({
    thomas: [
      { 
        time: '18:20', 
        label: 'Nhật ký bến cảng', 
        expectedId: 't-1', 
        currentCardId: null 
      },
      { 
        time: '23:14', 
        label: 'Lời khai ngoại phạm', 
        expectedId: 't-2', 
        currentCardId: null,
        clashCardId: 't-3',
        conflictMsg: 'Thomas khai đang ngủ ở nhà, nhưng dữ liệu định vị GPS lại ghi nhận thiết bị di động của anh ta đang di chuyển tại Cầu cảng số 9!'
      },
      { 
        time: '23:41', 
        label: 'Tin nhắn Burner Phone', 
        expectedId: 't-4', 
        currentCardId: null 
      },
      { 
        time: '00:30', 
        label: '[ĐIỂM MÙ THỜI GIAN]', 
        expectedId: 't-5', 
        currentCardId: null 
      }
    ],
    marsh: [
      { 
        time: '18:20', 
        label: 'Gửi Email báo cáo', 
        expectedId: 'm-1', 
        currentCardId: null 
      },
      { 
        time: '23:58', 
        label: 'Ghi âm Cầu cảng', 
        expectedId: 'm-2', 
        currentCardId: null,
        clashCardId: 'm-3',
        conflictMsg: 'Marsh khai rằng ông ta đã về nhà lúc 23:30, nhưng file ghi âm tang vật thu được tại Cầu cảng lúc 23:58 vẫn ghi nhận tiếng nói lầm bầm cùng tiếng hải âu ở nền!'
      }
    ],
    foreman: [
      { 
        time: '18:20', 
        label: 'Ký sổ sách bến cảng', 
        expectedId: 'f-1', 
        currentCardId: null 
      },
      { 
        time: '23:14', 
        label: 'Camera Cổng kho 12', 
        expectedId: 'f-2', 
        currentCardId: null 
      }
    ]
  })

  // Available evidence cards to be placed
  const [cards, setCards] = useState<EvidenceCard[]>([
    // Thomas cards
    { id: 't-1', title: 'Bản vận đơn sai lệch', owner: 'Thomas', type: 'forensic', content: 'Số container không khớp sổ sách tại cầu cảng.' },
    { id: 't-2', title: 'Tin nhắn: "Tôi đang ngủ"', owner: 'Thomas', type: 'testimony', content: 'Thomas nhắn cho Marsh báo đã về nhà ngủ sớm.' },
    { id: 't-3', title: 'GPS: Cầu cảng số 9', owner: 'Thomas', type: 'forensic', content: 'Định vị GPS ghi nhận thiết bị tại Cầu cảng số 9 lúc 23:14.' },
    { id: 't-4', title: 'Tin nhắn hẹn gặp', owner: 'Thomas', type: 'forensic', content: 'Tin nhắn từ Marsh yêu cầu gặp mặt không mang điện thoại.' },
    { id: 't-5', title: 'Mất tín hiệu hoàn toàn', owner: 'Thomas', type: 'forensic', content: 'Điện thoại bị tắt nguồn/hủy sim đột ngột.' },
    
    // Marsh cards
    { id: 'm-1', title: 'Email: Sửa đổi bản kê', owner: 'V. Marsh', type: 'forensic', content: 'Marsh gửi email từ chối xác nhận lỗi hàng hóa.' },
    { id: 'm-2', title: 'Tệp ghi âm 004', owner: 'V. Marsh', type: 'forensic', content: 'Ghi âm âm thanh nói chuyện lầm bầm của Marsh.' },
    { id: 'm-3', title: 'Lời khai: Về nhà lúc 23:30', owner: 'V. Marsh', type: 'testimony', content: 'Marsh khai đã lái xe về nhà nghỉ ngơi từ 23:30.' }
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
            { id: 'thomas' as const, name: 'T. Vance (Nạn nhân)', color: 'border-primary' },
            { id: 'marsh' as const, name: 'V. Marsh (Quản lý)', color: 'border-destructive' },
            { id: 'foreman' as const, name: 'Quản Đốc (Bến tàu)', color: 'border-amber-600' }
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
              .filter(card => card.owner.toLowerCase().includes(activeSuspect === 'thomas' ? 'thomas' : activeSuspect === 'marsh' ? 'marsh' : 'foreman'))
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
