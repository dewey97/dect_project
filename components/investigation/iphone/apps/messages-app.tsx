'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  Home,
  Search,
  ChevronRight,
  Camera,
  Mic,
  Info,
  CheckCircle2,
  Circle,
  Pin,
  Trash2,
  CheckCheck,
  Play,
  Pause,
  Volume2,
  BellOff,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  X,
  Maximize2,
  ShieldAlert,
  AlertCircle
} from 'lucide-react'
import type { Conversation, Message } from '@/lib/types'
import { cn } from '@/lib/utils'
import { detectiveAudio } from '@/lib/investigation-audio'

interface MessagesAppProps {
  threads: Conversation[]
  onBackToHome?: () => void
}

export function MessagesApp({ threads, onBackToHome }: MessagesAppProps) {
  const [selectedThread, setSelectedThread] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>([])
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)

  // Voice note interactive playback
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [playbackProgress, setPlaybackProgress] = useState(0)

  // Modals
  const [inspectingClue, setInspectingClue] = useState<Message | null>(null)
  const [previewImage, setPreviewImage] = useState<{ url: string; title?: string } | null>(null)
  const [pinnedClueIds, setPinnedClueIds] = useState<string[]>([])
  const [pinnedNotification, setPinnedNotification] = useState<string | null>(null)

  // Load pinned clues from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('khang_phone_pinned_clues')
      if (saved) setPinnedClueIds(JSON.parse(saved))
    } catch {}
  }, [])

  // Audio countdown calculator helper
  const formatCountdown = (durationStr?: string, progress: number = 0, isPlaying: boolean = false): string => {
    if (!durationStr) return '0:08'
    const parts = durationStr.split(':')
    const totalSeconds = parts.length === 2 ? parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) : 8
    if (!isPlaying || progress === 0) return durationStr
    const remaining = Math.max(0, Math.ceil(totalSeconds * (1 - progress / 100)))
    const m = Math.floor(remaining / 60)
    const s = remaining % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Audio playback ticker (10 updates per second for smooth countdown)
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

  const togglePlayAudio = (msg: Message) => {
    if (playingAudioId === msg.id) {
      setPlayingAudioId(null)
    } else {
      setPlayingAudioId(msg.id)
      setPlaybackProgress(0)
      // Play voice audio or realistic acoustic sound clue
      if (msg.id === 'm1-25') {
        detectiveAudio.playVoiceVy()
      } else if (msg.id === 'm9-7') {
        detectiveAudio.playVoiceKhang()
      } else if (msg.attachment?.audioClue?.includes('còi tàu') || msg.id.includes('m2-voice') || msg.id.includes('ha-voice')) {
        detectiveAudio.playHaVoicemail()
      } else {
        detectiveAudio.playRadioBeep()
      }
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
      setSelectedThread(null)
      setPlayingAudioId(null)
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
      {/* Pinned Toast Notification */}
      {pinnedNotification && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[#1C1C1E]/95 border border-[#30D158]/40 shadow-xl text-[11px] text-[#30D158] font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <BookmarkCheck className="size-3.5 text-[#30D158]" />
          <span>{pinnedNotification}</span>
        </div>
      )}

      {/* THREAD DETAIL VIEW */}
      {selectedThread ? (
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
          {/* iOS Chat Top Navigation Bar */}
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
              <div
                className={cn(
                  'size-7 rounded-full text-white flex items-center justify-center font-bold text-[11px] border border-white/10 shadow-sm bg-gradient-to-tr',
                  selectedThread.avatarColor || 'from-[#3A3A3C] to-[#636366]'
                )}
              >
                {selectedThread.name.slice(0, 1)}
              </div>
              <div className="flex items-center gap-1 mt-0.5 max-w-full">
                <span className="text-[11px] font-semibold text-white truncate">
                  {selectedThread.name}
                </span>
                {selectedThread.isMuted && (
                  <span title="Đã tắt thông báo" className="inline-flex shrink-0">
                    <BellOff className="size-2.5 text-[#8E8E93]" />
                  </span>
                )}
              </div>
              {selectedThread.phoneNumber && selectedThread.phoneNumber !== selectedThread.name && (
                <span className="text-[8.5px] text-[#8E8E93] font-mono leading-none">
                  {selectedThread.phoneNumber}
                </span>
              )}
            </div>

            <button
              onClick={() => {
                if (selectedThread.messages.some((m) => m.isClue)) {
                  const firstClue = selectedThread.messages.find((m) => m.isClue)
                  if (firstClue) setInspectingClue(firstClue)
                }
              }}
              className="text-[#0A84FF] active:opacity-60 p-1"
              title="Thông tin hội thoại"
            >
              <Info className="size-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 flex flex-col justify-start pb-10">
            <div className="text-center my-1.5">
              <span className="text-[9px] text-[#8E8E93] bg-[#1C1C1E]/80 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Tin nhắn SMS
              </span>
            </div>

            {selectedThread.messages.map((msg: Message, idx: number) => {
              const isMe = msg.role === 'sent'
              const isFirstOfDate =
                idx === 0 ||
                (msg.timestamp.includes('•') &&
                  !selectedThread.messages[idx - 1]?.timestamp.includes(msg.timestamp.split('•')[0]))

              const isPlayingThis = playingAudioId === msg.id
              const isPinned = pinnedClueIds.includes(msg.id)

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
                    className={cn(
                      'flex flex-col max-w-[84%] group',
                      isMe ? 'self-end items-end ml-auto' : 'self-start items-start'
                    )}
                  >
                    {!isMe && (
                      <span className="text-[9px] text-[#8E8E93] ml-2 mb-0.5 font-medium">
                        {msg.sender}
                      </span>
                    )}

                    {/* Chat Bubble Container */}
                    <div
                      onClick={() => setActiveMessageId(activeMessageId === msg.id ? null : msg.id)}
                      className={cn(
                        'px-3 py-2 rounded-[18px] text-[12px] leading-relaxed break-words shadow-sm transition-all cursor-pointer relative',
                        isMe
                          ? 'bg-[#0A84FF] text-white rounded-br-[4px]'
                          : 'bg-[#26252A] text-[#F2F2F7] rounded-bl-[4px] border border-white/5'
                      )}
                    >
                      {/* Image Attachment Preview */}
                      {msg.attachment?.type === 'image' && msg.attachment.thumbnail && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewImage({
                              url: msg.attachment?.thumbnail || '',
                              title: msg.attachment?.title
                            })
                          }}
                          className="mb-2 rounded-xl overflow-hidden border border-white/10 relative group/img cursor-pointer active:scale-95 transition-transform"
                        >
                          <img
                            src={msg.attachment.thumbnail}
                            alt={msg.attachment.title || 'Ảnh đính kèm'}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[11px] font-semibold text-white">
                            <Maximize2 className="size-3.5" /> Soi chi tiết
                          </div>
                          {msg.attachment.title && (
                            <div className="p-1.5 bg-black/80 text-[10px] text-white/90 truncate font-mono">
                              📎 {msg.attachment.title}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Audio Voice Note Bubble (Messenger/iMessage Style) */}
                      {msg.attachment?.type === 'audio' && (
                        <div className="flex items-center gap-2.5 py-1 min-w-[170px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              togglePlayAudio(msg)
                            }}
                            className={cn(
                              'size-8 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0 cursor-pointer',
                              isMe
                                ? 'bg-white text-[#0A84FF]'
                                : isPlayingThis
                                  ? 'bg-[#30D158] text-white animate-pulse'
                                  : 'bg-[#30D158] text-black'
                            )}
                            title={isPlayingThis ? 'Tạm dừng' : 'Phát tin nhắn thoại'}
                          >
                            {isPlayingThis ? (
                              <Pause className="size-4 fill-current" />
                            ) : (
                              <Play className="size-4 fill-current ml-0.5" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            {/* Waveform with progress fill */}
                            <div className="flex items-center gap-[2.5px] h-4 relative">
                              {[40, 75, 95, 50, 100, 80, 45, 90, 65, 35, 95, 55, 75, 90, 45, 65, 80, 40].map(
                                (h, i) => {
                                  const barPercent = (i / 18) * 100
                                  const isFilled = isPlayingThis && playbackProgress >= barPercent
                                  return (
                                    <span
                                      key={i}
                                      style={{ height: `${h}%` }}
                                      className={cn(
                                        'w-[2.5px] rounded-full transition-colors duration-150',
                                        isFilled
                                          ? isMe
                                            ? 'bg-white'
                                            : 'bg-[#30D158]'
                                          : isMe
                                            ? 'bg-white/40'
                                            : 'bg-white/30'
                                      )}
                                    />
                                  )
                                }
                              )}
                            </div>

                            {/* Countdown Timer (starts at duration and counts down to 0:00 when playing) */}
                            <div className="flex items-center justify-between text-[10px] font-mono mt-1 opacity-90">
                              <span className={cn('font-semibold', isPlayingThis ? (isMe ? 'text-white' : 'text-[#30D158]') : '')}>
                                {formatCountdown(msg.attachment.duration, playbackProgress, isPlayingThis)}
                              </span>
                              {isPlayingThis && (
                                <span className="text-[8.5px] tracking-wider animate-pulse flex items-center gap-0.5 font-sans">
                                  <Volume2 className="size-2.5" /> Đang phát
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Main Message Text (only rendered if text is non-empty) */}
                      {msg.text ? <p className="text-[12px]">{msg.text}</p> : null}
                    </div>

                    {/* Detailed Metadata / Status sub-bar */}
                    <div className="flex items-center gap-1.5 text-[8.5px] text-[#8E8E93] mt-0.5 px-1 font-mono">
                      <span>{msg.timestamp}</span>
                      {msg.status && <span>• {msg.status}</span>}
                    </div>
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
            <div className="flex-1 h-7 rounded-full bg-[#1C1C1E] border border-[#2C2C2E] px-3 flex items-center justify-between text-[#8E8E93] text-[11px] font-mono">
              <span>Thiết bị tang vật [Chế độ chỉ đọc]</span>
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
                placeholder="Tìm kiếm theo tên hoặc nội dung..."
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
                    <div
                      className={cn(
                        'size-10 rounded-full text-white flex items-center justify-center font-bold text-xs border border-white/10 shadow bg-gradient-to-tr',
                        thread.avatarColor || 'from-[#3A3A3C] to-[#545458]'
                      )}
                    >
                      {thread.name.slice(0, 1)}
                    </div>
                    {thread.unread && (
                      <span className="absolute -top-0.5 -right-0.5 size-3 bg-[#0A84FF] rounded-full ring-2 ring-black" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={cn(
                            'text-[13px] font-semibold text-white truncate',
                            thread.unread && 'text-[#0A84FF]'
                          )}
                        >
                          {thread.name}
                        </span>
                        {thread.isMuted && (
                          <span title="Đã tắt thông báo" className="inline-flex shrink-0">
                            <BellOff className="size-3 text-[#8E8E93]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8E8E93] font-mono shrink-0 ml-1">
                        {thread.timestamp}
                      </span>
                    </div>

                    {thread.phoneNumber && thread.phoneNumber !== thread.name && (
                      <span className="text-[9.5px] text-[#636366] font-mono block">
                        {thread.phoneNumber}
                      </span>
                    )}

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

      {/* MODAL 1: Forensic Clue Inspector */}
      {inspectingClue && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex flex-col justify-center items-center animate-in fade-in-50">
          <div className="w-full max-w-[300px] rounded-2xl bg-[#1C1C1E] border border-[#FFD60A]/40 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[11.5px] font-bold text-[#FFD60A] flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="size-4 text-[#FFD60A]" /> Báo Cáo Manh Mối
              </span>
              <button
                onClick={() => setInspectingClue(null)}
                className="text-[#8E8E93] hover:text-white p-1"
              >
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

              <div className="text-[9.5px] font-mono text-[#8E8E93] pt-1">
                Thời gian: {inspectingClue.timestamp} // Người gửi: {inspectingClue.sender}
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

      {/* MODAL 2: Image Lightbox Preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex flex-col justify-center items-center animate-in fade-in-50 cursor-pointer"
        >
          <div className="w-full max-w-[310px] space-y-2">
            <div className="flex justify-between items-center text-white text-[12px] px-1 font-mono">
              <span className="truncate">{previewImage.title || 'Ảnh tang vật đính kèm'}</span>
              <button onClick={() => setPreviewImage(null)} className="p-1 text-[#8E8E93] hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <img
              src={previewImage.url}
              alt={previewImage.title || 'Preview'}
              className="w-full max-h-[380px] object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
            <p className="text-center text-[10px] text-[#8E8E93]">Chạm vào màn hình để đóng</p>
          </div>
        </div>
      )}
    </div>
  )
}

