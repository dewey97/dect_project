'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, X, Copy, Check, LogOut, ArrowRight, Sparkles, Pencil, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoomSync } from '@/components/investigation/room-sync-context'
import { DetectiveAvatar } from '@/components/investigation/detective-avatar'
import { normalizeCaseId } from '@/lib/cases/case-id'

interface RoomModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RoomModal({ isOpen, onClose }: RoomModalProps) {
  const {
    roomCode,
    nickname,
    isConnected,
    isConnecting,
    joinRoom,
    leaveRoom,
    setNickname,
    syncUpdate,
    members,
    memberCount,
    currentUser,
    deviceId,
  } = useRoomSync()

  const [isMounted, setIsMounted] = useState(false)
  const [inputCode, setInputCode] = useState('')
  const [inputNick, setInputNick] = useState(nickname)
  const [isEditingNick, setIsEditingNick] = useState(false)
  const [editNickVal, setEditNickVal] = useState(nickname)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setInputNick(nickname)
      setEditNickVal(nickname)
      setIsEditingNick(false)
      setErrorMsg(null)
      if (roomCode) {
        setInputCode(roomCode)
      }
    }
  }, [isOpen, nickname, roomCode])

  const generateRandomCode = () => {
    const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
    let res = ''
    for (let i = 0; i < 4; i++) {
      res += chars[Math.floor(Math.random() * chars.length)]
    }
    setInputCode(res)
    setErrorMsg(null)
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim()) {
      setErrorMsg('Vui lòng nhập mã phòng')
      return
    }
    setErrorMsg(null)
    const res = await joinRoom(inputCode, inputNick)
    if (!res.success) {
      setErrorMsg(res.error || 'Không thể kết nối phòng')
    }
    // Khi tham gia thành công, modal chuyển sang chế độ "Đang kết nối phòng"
    // để người dùng nhìn thấy mã phòng và danh sách tổ chuyên án ngay lập tức
  }

  const handleCopyLink = () => {
    if (typeof window === 'undefined' || !roomCode) return
    const url = new URL(window.location.href)
    url.searchParams.set('room', roomCode)
    const rawCase = url.searchParams.get('case_id') || url.searchParams.get('caseId')
    if (rawCase) {
      url.searchParams.set('case_id', normalizeCaseId(rawCase))
      url.searchParams.delete('caseId')
    }
    navigator.clipboard.writeText(url.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = editNickVal.trim().slice(0, 20)
    if (clean) {
      setNickname(clean)
      syncUpdate({}, `đã đổi tên hiển thị thành ${clean}`)
      setIsEditingNick(false)
    }
  }

  // Danh sách hiển thị: nếu mảng members rỗng nhưng đang kết nối, hiển thị ít nhất chính mình
  const displayMembers =
    members.length > 0
      ? members
      : [
          {
            key: deviceId || 'me',
            nickname,
            joinedAt: 0,
            avatarUrl: currentUser?.avatarUrl || null,
            userId: currentUser?.id || null,
            email: currentUser?.email || null,
            isAuthenticated: !!currentUser,
          },
        ]

  if (!isMounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl overflow-hidden font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <Users className="size-4 text-zinc-400" />
                <h3 className="font-semibold text-sm tracking-wide text-zinc-100 uppercase font-mono">
                  Chơi Nhóm Đồng Bộ
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800/60 transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {isConnected && roomCode ? (
                /* Đang kết nối trong phòng */
                <div className="space-y-4">
                  {/* Thẻ mã phòng */}
                  <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col items-center text-center space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>ĐANG KẾT NỐI PHÒNG • {memberCount} TRỰC TUYẾN</span>
                    </div>

                    <div className="text-3xl font-extrabold text-white tracking-widest font-mono select-all">
                      {roomCode}
                    </div>

                    <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                      Tiến trình điều tra, manh mối và cáo trạng sẽ tự động đồng bộ giữa các thành viên.
                    </p>
                  </div>

                  {/* DANH SÁCH THÀNH VIÊN (MỖI NGƯỜI LÀ MỘT DÒNG) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-400 px-0.5">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <Users className="size-3.5" />
                        <span>Tổ chuyên án ({displayMembers.length})</span>
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">Supabase Realtime</span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5 custom-scrollbar">
                      {displayMembers.map((m, index) => {
                        const isMe =
                          (deviceId && m.key === deviceId) ||
                          m.nickname === nickname ||
                          (currentUser?.id && m.userId === currentUser.id)

                        const effectiveAvatar = isMe
                          ? currentUser?.avatarUrl || m.avatarUrl
                          : m.avatarUrl

                        const isHost = index === 0

                        return (
                          <div
                            key={m.key}
                            className={cn(
                              'flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-colors',
                              isMe
                                ? 'bg-zinc-900 border-zinc-700/80 shadow-sm'
                                : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/60'
                            )}
                          >
                            {/* Cột trái: Avatar + Tên */}
                            <div className="flex items-center gap-3 min-w-0">
                              <DetectiveAvatar
                                src={effectiveAvatar}
                                name={m.nickname}
                                size="md"
                                showOnlineDot={true}
                                isOnline={true}
                              />

                              <div className="min-w-0">
                                {isMe && isEditingNick ? (
                                  <form onSubmit={handleSaveNickname} className="flex items-center gap-1.5 py-0.5">
                                    <input
                                      type="text"
                                      value={editNickVal}
                                      onChange={(e) => setEditNickVal(e.target.value)}
                                      maxLength={20}
                                      placeholder="Tên thám tử..."
                                      className="px-2 py-0.5 bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs rounded font-sans focus:outline-none focus:border-zinc-500 w-28 sm:w-36"
                                    />
                                    <button
                                      type="submit"
                                      className="px-2 py-0.5 bg-zinc-200 hover:bg-white text-zinc-950 text-xs font-semibold rounded cursor-pointer transition-colors"
                                    >
                                      Lưu
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setIsEditingNick(false)}
                                      className="px-1.5 py-0.5 text-zinc-400 hover:text-white text-xs cursor-pointer"
                                    >
                                      Hủy
                                    </button>
                                  </form>
                                ) : (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-sm text-zinc-100 truncate">
                                      {m.nickname}
                                    </span>

                                    {isMe && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
                                        Bạn
                                      </span>
                                    )}

                                    {isHost && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800/70 border border-zinc-700/60 text-zinc-400">
                                        Chỉ huy
                                      </span>
                                    )}

                                    {m.isAuthenticated && (
                                      <span
                                        className="text-zinc-400 inline-flex items-center"
                                        title="Tài khoản đã xác thực"
                                      >
                                        <ShieldCheck className="size-3.5 text-zinc-400" />
                                      </span>
                                    )}
                                  </div>
                                )}

                                {!isEditingNick && (
                                  <div className="text-[11px] text-zinc-400 truncate">
                                    {m.isAuthenticated
                                      ? 'Đã đăng nhập • Đang trực tuyến'
                                      : 'Khách • Đang trực tuyến'}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Cột phải: Thao tác */}
                            {isMe && !isEditingNick && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditNickVal(nickname)
                                  setIsEditingNick(true)
                                }}
                                className="px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-md transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                title="Đổi tên hiển thị của bạn"
                              >
                                <Pencil className="size-3" />
                                <span>Đổi tên</span>
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-100 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="size-4 text-emerald-400" />
                          <span>Đã sao chép link mời!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-4 text-zinc-300" />
                          <span>Sao chép Link mời bạn bè</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        leaveRoom()
                        onClose()
                      }}
                      className="py-2.5 px-3 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/60 rounded-xl text-zinc-300 hover:text-red-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Rời phòng và trở về chế độ Solo"
                    >
                      <LogOut className="size-4" />
                      <span>Rời</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Form Kết nối / Tạo phòng */
                <form onSubmit={handleJoin} className="space-y-4">
                  {/* Trạng thái tài khoản người chơi */}
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
                    <DetectiveAvatar
                      src={currentUser?.avatarUrl}
                      name={currentUser?.displayName || inputNick}
                      size="md"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-zinc-200 truncate">
                        {currentUser ? (
                          <span className="flex items-center gap-1.5">
                            <span>{currentUser.displayName || currentUser.email}</span>
                            <ShieldCheck className="size-3.5 text-zinc-400 shrink-0" />
                          </span>
                        ) : (
                          'Chế độ Khách (Chưa đăng nhập)'
                        )}
                      </div>
                      {!currentUser && (
                        <div className="text-[11px] text-zinc-500 truncate">
                          Chơi ẩn danh với avatar mặc định
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tên thám tử */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-300 font-semibold uppercase tracking-wider font-mono">
                      Tên thám tử của bạn:
                    </label>
                    <input
                      type="text"
                      value={inputNick}
                      onChange={(e) => setInputNick(e.target.value)}
                      placeholder="VD: Minh, Vy, An..."
                      maxLength={20}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-xl focus:outline-none focus:border-zinc-500 placeholder-zinc-500 transition-colors"
                    />
                  </div>

                  {/* Mã phòng */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-300 font-semibold uppercase tracking-wider font-mono">
                        Mã phòng (Group ID):
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Sparkles className="size-3" />
                        Tạo mã mới
                      </button>
                    </div>
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => {
                        setInputCode(e.target.value.toUpperCase())
                        setErrorMsg(null)
                      }}
                      placeholder="VD: 8888 hoặc SHER"
                      maxLength={10}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 text-base font-bold tracking-widest rounded-xl focus:outline-none focus:border-zinc-500 uppercase font-mono placeholder-zinc-600 transition-colors"
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-xs text-red-400 bg-red-950/30 p-2.5 rounded-xl border border-red-900/40">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <span>Đang kết nối...</span>
                    ) : (
                      <>
                        <span>Tham Gia / Tạo Phòng</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}
