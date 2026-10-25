'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, X, Copy, Check, LogOut, ArrowRight, Sparkles, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoomSync } from '@/components/investigation/room-sync-context'
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
  } = useRoomSync()

  const [inputCode, setInputCode] = useState('')
  const [inputNick, setInputNick] = useState(nickname)
  const [isEditingNick, setIsEditingNick] = useState(false)
  const [editNickVal, setEditNickVal] = useState(nickname)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
    } else {
      onClose()
    }
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md bg-[#18130e] border-2 border-[#593c26] text-[#e8d5b5] rounded-xl shadow-2xl overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#593c26]/60 bg-[#120e0a]">
              <div className="flex items-center gap-2.5">
                <Users className="size-5 text-amber-500" />
                <h3 className="font-bold text-sm tracking-wide text-amber-400 uppercase">
                  Chơi Nhóm Đồng Bộ (Group ID)
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[#a89078] hover:text-amber-400 p-1 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {isConnected && roomCode ? (
                /* Already connected state */
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#241a12] border border-emerald-500/50 flex flex-col items-center text-center space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>ĐANG KẾT NỐI PHÒNG • {memberCount} ONLINE</span>
                    </div>
                    <div className="text-3xl font-extrabold text-amber-400 tracking-widest font-mono">
                      {roomCode}
                    </div>
                    {isEditingNick ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const clean = editNickVal.trim().slice(0, 20)
                          if (clean) {
                            setNickname(clean)
                            syncUpdate({}, `đã đổi tên hiển thị thành ${clean}`)
                            setIsEditingNick(false)
                          }
                        }}
                        className="flex items-center gap-1.5 mt-1"
                      >
                        <input
                          type="text"
                          value={editNickVal}
                          onChange={(e) => setEditNickVal(e.target.value)}
                          maxLength={20}
                          placeholder="Tên thám tử..."
                          className="px-2 py-1 bg-[#120e0a] border border-amber-500 text-amber-200 text-xs rounded font-mono focus:outline-none w-36"
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded cursor-pointer transition-colors"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingNick(false)}
                          className="px-1.5 py-1 text-[#a89078] hover:text-[#fff] text-xs cursor-pointer transition-colors"
                        >
                          Hủy
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-[#a89078]">
                        <span>Thám tử của bạn:</span>
                        <span className="text-amber-300 font-bold">{nickname}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditNickVal(nickname)
                            setIsEditingNick(true)
                          }}
                          className="text-[11px] text-amber-500 hover:text-amber-300 underline cursor-pointer ml-1"
                        >
                          (Đổi tên)
                        </button>
                      </div>
                    )}

                    {/* DANH SÁCH THÁM TỬ ĐANG TRỰC TUYẾN TRONG PHÒNG */}
                    <div className="w-full pt-2.5 border-t border-[#4a3422]/60 flex flex-col items-center gap-1.5">
                      <span className="text-[11px] text-[#a89078] uppercase tracking-wider font-bold flex items-center gap-1">
                        <Users className="size-3 text-amber-500" />
                        <span>Tổ chuyên án trực tuyến ({memberCount}):</span>
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 max-h-24 overflow-y-auto custom-scrollbar px-1">
                        {members.length > 0 ? (
                          members.map((m) => {
                            const isMe = m.nickname === nickname
                            return (
                              <span
                                key={m.key}
                                className={cn(
                                  "px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 border",
                                  isMe
                                    ? "bg-amber-950/70 border-amber-500/80 text-amber-300 font-bold shadow-sm"
                                    : "bg-[#18110b] border-[#483321] text-[#d9c5af]"
                                )}
                              >
                                <span className={cn("size-1.5 rounded-full", isMe ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
                                <span>{m.nickname}</span>
                                {isMe && <span className="text-[9px] text-amber-400/80">(Bạn)</span>}
                              </span>
                            )
                          })
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/70 border-amber-500/80 text-amber-300 font-bold flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>{nickname} (Bạn)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#c2ad93] leading-relaxed text-center">
                    Bất kỳ ai mở khóa điện thoại, giải xong checkpoint hay nộp Cáo Trạng sẽ tự động đồng bộ tức thì trên màn hình của cả nhóm.
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 py-2.5 px-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/60 rounded-lg text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="size-4 text-emerald-400" />
                          <span>Đã sao chép link mời!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          <span>Sao chép Link mời Discord / Bạn bè</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        leaveRoom()
                        onClose()
                      }}
                      className="py-2.5 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-700/60 rounded-lg text-red-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      title="Rời phòng và trở về chế độ Solo"
                    >
                      <LogOut className="size-4" />
                      <span>Rời</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Connect / Join form */
                <form onSubmit={handleJoin} className="space-y-4">
                  <p className="text-xs text-[#b8a38b] leading-relaxed">
                    Nhập cùng một mã phòng để phá án chung cùng bạn bè qua Discord hoặc cùng một bàn chơi.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                      Tên thám tử của bạn:
                    </label>
                    <input
                      type="text"
                      value={inputNick}
                      onChange={(e) => setInputNick(e.target.value)}
                      placeholder="VD: Minh, Vy, An..."
                      maxLength={20}
                      className="w-full px-3 py-2 bg-[#120e0a] border border-[#593c26] text-amber-200 text-sm rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                        Mã phòng (Group ID):
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className="text-[11px] text-amber-500 hover:text-amber-300 flex items-center gap-1"
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
                      className="w-full px-3 py-2 bg-[#120e0a] border border-[#593c26] text-amber-200 text-base font-bold tracking-widest rounded-lg focus:outline-none focus:border-amber-500 uppercase"
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-xs text-red-400 font-medium bg-red-950/40 p-2 rounded border border-red-800/50">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
}
