'use client'

import { useState, useRef } from 'react'
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Camera,
  Mic,
  Info,
  CheckCircle2,
  Circle,
  Pin,
  Trash2,
  CheckCheck
} from 'lucide-react'
import type { Conversation, Message } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MessagesAppProps {
  threads: Conversation[]
  onBackToHome: () => void
}

export function MessagesApp({ threads, onBackToHome }: MessagesAppProps) {
  const [selectedThread, setSelectedThread] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>([])
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)

  // Touch/Drag swipe-to-back ref
  const touchStartX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    touchStartX.current = clientX
  }

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX.current === null) return
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
    const diffX = clientX - touchStartX.current
    if (diffX > 60 && selectedThread) {
      // Swiped right -> go back
      setSelectedThread(null)
    }
    touchStartX.current = null
  }

  const toggleSelectThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedThreadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const filteredThreads = threads.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.previewText.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div
      className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
    >
      {/* THREAD DETAIL VIEW */}
      {selectedThread ? (
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
          {/* iOS Chat Top Navigation Bar */}
          <div className="flex items-center justify-between px-3 pt-2 pb-2 bg-[#161618]/95 backdrop-blur-md border-b border-[#2C2C2E] shrink-0 z-10">
            <button
              onClick={() => setSelectedThread(null)}
              className="flex items-center gap-0.5 text-[#0A84FF] text-[13px] font-medium active:opacity-60 transition-opacity"
            >
              <ArrowLeft className="size-4" />
              <span>Tin nhắn</span>
            </button>

            <div className="flex flex-col items-center max-w-[160px]">
              <div className="size-7 rounded-full bg-gradient-to-tr from-[#3A3A3C] to-[#636366] text-white flex items-center justify-center font-bold text-[11px] border border-white/10 shadow-sm">
                {selectedThread.name.slice(0, 1)}
              </div>
              <span className="text-[11px] font-semibold text-white truncate mt-0.5 max-w-full">
                {selectedThread.name}
              </span>
            </div>

            <button className="text-[#0A84FF] active:opacity-60 p-1">
              <Info className="size-4" />
            </button>
          </div>

          {/* Messages Stream - Long Multi-day Scrollable */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 flex flex-col justify-start">
            <div className="text-center my-2">
              <span className="text-[9.5px] text-[#8E8E93] bg-[#1C1C1E]/80 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Lịch sử hội thoại mã hóa đầu cuối iMessage
              </span>
            </div>

            {selectedThread.messages.map((msg: Message, idx: number) => {
              const isMe = msg.role === 'sent'
              const isFirstOfDate =
                idx === 0 ||
                (msg.timestamp.includes('•') &&
                  !selectedThread.messages[idx - 1]?.timestamp.includes(msg.timestamp.split('•')[0]))

              return (
                <div key={msg.id} className="space-y-1">
                  {/* Date separator header */}
                  {isFirstOfDate && (
                    <div className="text-center my-2">
                      <span className="text-[9.5px] text-[#8E8E93] font-semibold">
                        {msg.timestamp.includes('•')
                          ? msg.timestamp.split('•')[0].trim()
                          : 'Hôm nay'}
                      </span>
                    </div>
                  )}

                  <div
                    onClick={() =>
                      setActiveMessageId(activeMessageId === msg.id ? null : msg.id)
                    }
                    className={cn(
                      'flex flex-col max-w-[80%] group cursor-pointer',
                      isMe ? 'self-end items-end ml-auto' : 'self-start items-start'
                    )}
                  >
                    {!isMe && (
                      <span className="text-[9px] text-[#8E8E93] ml-2 mb-0.5 font-medium">
                        {msg.sender}
                      </span>
                    )}
                    <div
                      className={cn(
                        'px-3 py-1.5 rounded-[18px] text-[12px] leading-relaxed break-words shadow-sm transition-all',
                        isMe
                          ? 'bg-[#0A84FF] text-white rounded-br-[4px]'
                          : 'bg-[#26252A] text-[#F2F2F7] rounded-bl-[4px] border border-white/5'
                      )}
                    >
                      {msg.text}
                    </div>

                    {/* Detailed timestamp reveal */}
                    <span
                      className={cn(
                        'text-[8.5px] text-[#8E8E93] mt-0.5 px-1 font-mono transition-opacity',
                        activeMessageId === msg.id ? 'opacity-100' : 'opacity-60'
                      )}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Fake iOS Input Bar */}
          <div className="px-3 py-2 bg-[#161618]/95 backdrop-blur-md border-t border-[#2C2C2E] flex items-center gap-2 shrink-0 pb-6">
            <button className="size-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] active:bg-[#3A3A3C]">
              <Camera className="size-3.5" />
            </button>
            <div className="flex-1 h-7 rounded-full bg-[#1C1C1E] border border-[#2C2C2E] px-3 flex items-center justify-between text-[#8E8E93] text-[12px]">
              <span>iMessage</span>
              <Mic className="size-3.5" />
            </div>
          </div>
        </div>
      ) : (
        /* CONVERSATION LIST VIEW */
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 pt-3 pb-2 bg-[#000000] shrink-0 border-b border-[#1C1C1E]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[20px] font-bold tracking-tight text-white">Tin nhắn</span>
              <button
                onClick={() => {
                  setIsEditMode(!isEditMode)
                  setSelectedThreadIds([])
                }}
                className="text-[12px] font-medium text-[#0A84FF] active:opacity-60"
              >
                {isEditMode ? 'Xong' : 'Sửa'}
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Tìm kiếm tin nhắn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-7 rounded-lg bg-[#1C1C1E] pl-8 pr-3 text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#0A84FF]"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1C1C1E] px-2 pb-14">
            {filteredThreads.map((thread) => {
              const isSelected = selectedThreadIds.includes(thread.id)
              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    if (isEditMode) {
                      setSelectedThreadIds((prev) =>
                        isSelected ? prev.filter((i) => i !== thread.id) : [...prev, thread.id]
                      )
                    } else {
                      setSelectedThread(thread)
                    }
                  }}
                  className="flex items-center gap-3 py-2.5 px-2 hover:bg-[#1C1C1E]/50 active:bg-[#2C2C2E]/60 rounded-xl cursor-pointer transition-colors"
                >
                  {/* Selection Checkbox in Edit Mode */}
                  {isEditMode && (
                    <button
                      onClick={(e) => toggleSelectThread(thread.id, e)}
                      className="text-[#0A84FF] shrink-0"
                    >
                      {isSelected ? (
                        <CheckCircle2 className="size-5 fill-[#0A84FF] text-black" />
                      ) : (
                        <Circle className="size-5 text-[#8E8E93]" />
                      )}
                    </button>
                  )}

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#3A3A3C] to-[#545458] text-white flex items-center justify-center font-bold text-xs border border-white/10 shadow">
                      {thread.name.slice(0, 1)}
                    </div>
                    {thread.unread && (
                      <span className="absolute -top-0.5 -right-0.5 size-3 bg-[#0A84FF] rounded-full ring-2 ring-black" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'text-[13px] font-semibold text-white truncate',
                          thread.unread && 'text-[#0A84FF]'
                        )}
                      >
                        {thread.name}
                      </span>
                      <span className="text-[10px] text-[#8E8E93] font-mono shrink-0 ml-1">
                        {thread.timestamp}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#8E8E93] truncate mt-0.5 leading-snug">
                      {thread.previewText}
                    </p>
                  </div>

                  {!isEditMode && <ChevronRight className="size-3.5 text-[#48484A] shrink-0" />}
                </div>
              )
            })}
          </div>

          {/* Edit Mode Bottom Action Bar */}
          {isEditMode && (
            <div className="h-11 bg-[#161618] border-t border-[#2C2C2E] flex items-center justify-between px-6 shrink-0 text-[#0A84FF] text-[12px] font-medium animate-in slide-in-from-bottom-2">
              <button
                onClick={() => setSelectedThreadIds(filteredThreads.map((t) => t.id))}
                className="hover:opacity-75 flex items-center gap-1"
              >
                <CheckCheck className="size-3.5" /> Đọc tất cả
              </button>
              <button
                onClick={() => setSelectedThreadIds([])}
                className="hover:opacity-75 flex items-center gap-1"
              >
                <Pin className="size-3.5" /> Ghim ({selectedThreadIds.length})
              </button>
              <button
                onClick={() => setSelectedThreadIds([])}
                className="text-[#FF453A] hover:opacity-75 flex items-center gap-1"
              >
                <Trash2 className="size-3.5" /> Xóa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
