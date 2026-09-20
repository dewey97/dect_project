'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  Search,
  ChevronRight,
  Info,
  CheckCircle2,
  Circle,
  Pin,
  Trash2,
  CheckCheck,
  Play,
  Pause,
  BellOff,
  BookmarkCheck,
  X,
  ShieldAlert,
  Loader2
} from 'lucide-react'
import type { Conversation, Message } from '@/lib/types'
import { cn } from '@/lib/utils'
import { detectiveAudio } from '@/lib/investigation-audio'
import { usePhoneData } from '@/lib/hooks/use-phone-data'

interface MessagesAppProps {
  threads?: Conversation[]
  onBackToHome?: () => void
}

export function MessagesApp({ onBackToHome }: MessagesAppProps) {
  const [selectedThread, setSelectedThread] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>([])

  // Voice note interactive playback
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [playbackProgress, setPlaybackProgress] = useState(0)

  // Modals
  const [inspectingClue, setInspectingClue] = useState<any | null>(null)
  const [previewImage, setPreviewImage] = useState<{ url: string; title?: string } | null>(null)
  const [pinnedClueIds, setPinnedClueIds] = useState<string[]>([])
  const [pinnedNotification, setPinnedNotification] = useState<string | null>(null)

  // Fetch conversations live from Google Sheets
  const { data: rawMessagesData, loading, error } = usePhoneData('messages')

  // Map 1-row-per-person human-readable schema into conversation threads
  const threads = rawMessagesData.map((item: any, idx: number) => {
    let parsedMessages: any[] = []

    // 1. Support legacy JSON if present
    if (item.messages_json) {
      try {
        parsedMessages = typeof item.messages_json === 'string' ? JSON.parse(item.messages_json) : item.messages_json
      } catch {}
    }

    // 2. Support Proposal 1 Multiline Text Format: "> (Timestamp) Text [CLUE: Title | Analysis]" or "(Timestamp) Text"
    if (parsedMessages.length === 0 && item.messages_text) {
      const lines = String(item.messages_text).split('\n').map((l) => l.trim()).filter(Boolean)
      parsedMessages = lines.map((line, mIdx) => {
        let isSent = line.startsWith('>')
        let cleanLine = isSent ? line.substring(1).trim() : line

        // Extract clue if present at end of line: [CLUE: Title | Analysis]
        let clueTitle = ''
        let clueAnalysis = ''
        let isClue = false

        const clueMatch = cleanLine.match(/\[CLUE:\s*([^|]+)\s*\|\s*([^\]]+)\]$/i)
        if (clueMatch) {
          isClue = true
          clueTitle = clueMatch[1].trim()
          clueAnalysis = clueMatch[2].trim()
          cleanLine = cleanLine.replace(/\[CLUE:\s*([^|]+)\s*\|\s*([^\]]+)\]$/i, '').trim()
        }

        // Extract timestamp in parentheses at start: (04/05 • 14:15) or (14:15)
        let timestamp = ''
        const tsMatch = cleanLine.match(/^\(([^)]+)\)\s*(.*)$/)
        let text = cleanLine

        if (tsMatch) {
          timestamp = tsMatch[1].trim()
          text = tsMatch[2].trim()
        }

        const sender = isSent ? 'Khang' : (item.contact_name || 'Khác')

        return {
          id: `msg-${idx}-${mIdx}`,
          sender,
          role: isSent ? 'sent' : 'received',
          text,
          timestamp,
          isClue,
          clueTitle,
          clueAnalysis
        }
      })
    }

    return {
      id: item.message_id || `conv-${idx + 1}`,
      name: item.contact_name || item.name || 'Không tên',
      phoneNumber: item.phone_number || '',
      avatarColor: item.avatar_color || 'from-[#3A3A3C] to-[#636366]',
      unread: item.unread === 'TRUE' || item.unread === true,
      timestamp: item.timestamp || '',
      previewText: item.preview_text || (parsedMessages.length > 0 ? parsedMessages[parsedMessages.length - 1].text : ''),
      messages: parsedMessages.map((m: any, mIdx: number) => ({
        id: m.id || `msg-${idx}-${mIdx}`,
        sender: m.sender || m.role || item.contact_name,
        role: m.role || (m.sender === 'Khang' ? 'sent' : 'received'),
        text: m.text || m.content || '',
        timestamp: m.timestamp || '',
        isClue: m.isClue || m.is_clue === 'TRUE' || m.is_clue === true,
        clueTitle: m.clueTitle || m.clue_title || '',
        clueAnalysis: m.clueAnalysis || m.clue_analysis || ''
      }))
    }
  })

  // Load pinned clues from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('khang_phone_pinned_clues')
      if (saved) setPinnedClueIds(JSON.parse(saved))
    } catch {}
  }, [])

  // Audio playback ticker
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (playingAudioId) {
      timer = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setPlayingAudioId(null)
            return 0
          }
          return prev + 3
        })
      }, 250)
    }
    return () => clearInterval(timer)
  }, [playingAudioId])

  const togglePlayAudio = (msg: any) => {
    if (playingAudioId === msg.id) {
      setPlayingAudioId(null)
    } else {
      setPlayingAudioId(msg.id)
      setPlaybackProgress(0)
      detectiveAudio.playRadioBeep()
    }
  }

  const togglePinClue = (clueId: string, title?: string) => {
    setPinnedClueIds((prev) => {
      const next = prev.includes(clueId) ? prev.filter((id) => id !== clueId) : [...prev, clueId]
      try {
        localStorage.setItem('khang_phone_pinned_clues', JSON.stringify(next))
      } catch {}
      return next
    })
    setPinnedNotification(pinnedClueIds.includes(clueId) ? 'Đã gỡ manh mối' : `Đã ghim: ${title || 'Manh mối'}`)
    setTimeout(() => setPinnedNotification(null), 2500)
  }

  const filteredThreads = threads.filter(
    (t: any) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.previewText.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans relative">
      {pinnedNotification && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[#1C1C1E]/95 border border-[#30D158]/40 shadow-xl text-[11px] text-[#30D158] font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <BookmarkCheck className="size-3.5 text-[#30D158]" />
          <span>{pinnedNotification}</span>
        </div>
      )}

      {/* THREAD DETAIL VIEW */}
      {selectedThread ? (
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between px-3 pt-2 pb-2 bg-[#161618]/95 backdrop-blur-md border-b border-[#2C2C2E] shrink-0 z-10">
            <button
              onClick={() => {
                setSelectedThread(null)
                setPlayingAudioId(null)
              }}
              className="flex items-center gap-0.5 text-[#0A84FF] text-[13px] font-medium active:opacity-60 transition-opacity"
            >
              <ArrowLeft className="size-4" />
              <span>Tin nhắn</span>
            </button>

            <div className="flex flex-col items-center max-w-[170px]">
              <div className="size-7 rounded-full text-white flex items-center justify-center font-bold text-[11px] border border-white/10 shadow-sm bg-gradient-to-tr from-[#3A3A3C] to-[#636366]">
                {selectedThread.name.slice(0, 1)}
              </div>
              <span className="text-[11px] font-semibold text-white truncate mt-0.5">
                {selectedThread.name}
              </span>
            </div>

            <button
              onClick={() => {
                const firstClue = selectedThread.messages.find((m: any) => m.isClue)
                if (firstClue) setInspectingClue(firstClue)
              }}
              className="text-[#0A84FF] active:opacity-60 p-1"
              title="Thông tin hội thoại"
            >
              <Info className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 flex flex-col justify-start pb-10">
            <div className="text-center my-1.5">
              <span className="text-[9px] text-[#8E8E93] bg-[#1C1C1E]/80 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Tin nhắn SMS
              </span>
            </div>

            {selectedThread.messages.map((msg: any) => {
              const isMe = msg.role === 'sent'
              const isPinned = pinnedClueIds.includes(msg.id)

              return (
                <div key={msg.id} className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2 text-[12.5px] leading-relaxed shadow-sm relative group transition-all',
                      isMe
                        ? 'bg-[#0A84FF] text-white rounded-br-sm'
                        : 'bg-[#2C2C2E] text-white rounded-bl-sm'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    {isPinned && (
                      <span className="absolute -top-1 -right-1 size-3 bg-[#30D158] rounded-full flex items-center justify-center text-[7px] font-bold text-black shadow">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-[8.5px] text-[#8E8E93] font-mono mt-0.5 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* THREADS LIST VIEW */
        <div className="flex flex-col h-full">
          <div className="px-4 pt-3 pb-2 bg-[#000000] shrink-0 border-b border-[#1C1C1E]">
            <div className="flex items-center justify-between mb-2">
              {onBackToHome ? (
                <button
                  onClick={onBackToHome}
                  className="flex items-center gap-0.5 text-[#0A84FF] text-[12.5px] font-medium hover:opacity-80 active:opacity-60 cursor-pointer"
                  title="Thoát ứng dụng về Màn hình chính"
                >
                  <ChevronLeft className="size-4" />
                  <span>Trang chính</span>
                </button>
              ) : (
                <span className="w-12" />
              )}
              <span className="text-[17px] font-bold tracking-tight text-white">Tin nhắn</span>
              <span className="w-12" />
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Tìm kiếm tin nhắn"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-7 rounded-lg bg-[#1C1C1E] pl-8 pr-3 text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#0A84FF]"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-[#8E8E93]">
              <Loader2 className="size-6 animate-spin mb-2 text-[#0A84FF]" />
              <span className="text-xs">Đang tải tin nhắn từ Google Sheets...</span>
            </div>
          ) : error ? (
            <div className="flex-1 p-4 text-center text-xs text-red-400">Lỗi: {error}</div>
          ) : (
            <div className="flex-1 overflow-y-auto px-2 py-1 divide-y divide-[#1C1C1E] pb-10">
              {filteredThreads.map((thread: any) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className="flex items-center gap-3 py-2.5 px-2 hover:bg-[#1C1C1E]/50 active:bg-[#2C2C2E]/60 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="size-10 rounded-full text-white flex items-center justify-center font-bold text-xs border border-white/10 shadow bg-gradient-to-tr from-[#3A3A3C] to-[#545458] shrink-0">
                    {thread.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-white truncate">
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
                  <ChevronRight className="size-3.5 text-[#48484A] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Clue Inspector */}
      {inspectingClue && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex flex-col justify-center items-center animate-in fade-in-50">
          <div className="w-full max-w-[300px] rounded-2xl bg-[#1C1C1E] border border-[#FFD60A]/40 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[11.5px] font-bold text-[#FFD60A] flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="size-4 text-[#FFD60A]" /> Báo Cáo Manh Mối
              </span>
              <button onClick={() => setInspectingClue(null)} className="text-[#8E8E93] hover:text-white p-1">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-2 text-left">
              <div className="text-[12.5px] font-bold text-white">
                {inspectingClue.clueTitle || 'Manh mối mấu chốt'}
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 text-[11px] text-white/90 italic">
                "{inspectingClue.text}"
              </div>
              <div className="text-[11px] text-[#A1A1A6] leading-relaxed">
                {inspectingClue.clueAnalysis}
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  togglePinClue(inspectingClue.id, inspectingClue.clueTitle)
                  setInspectingClue(null)
                }}
                className={cn(
                  'flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5',
                  pinnedClueIds.includes(inspectingClue.id)
                    ? 'bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/40'
                    : 'bg-[#0A84FF] text-white hover:bg-[#0077ED]'
                )}
              >
                <BookmarkCheck className="size-3.5" />
                {pinnedClueIds.includes(inspectingClue.id) ? 'Đã ghim sổ tay' : 'Ghim vào sổ tay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
