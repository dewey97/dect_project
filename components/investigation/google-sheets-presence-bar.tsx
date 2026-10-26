'use client'

import React, { useState } from 'react'
import { Users, Copy, Check, ShieldCheck, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoomSync } from '@/components/investigation/room-sync-context'
import { DetectiveAvatar } from '@/components/investigation/detective-avatar'
import { RoomModal } from '@/components/investigation/room-modal'
import { normalizeCaseId } from '@/lib/cases/case-id'

interface GoogleSheetsPresenceBarProps {
  className?: string
  showShareButton?: boolean
  onOpenModal?: () => void
}

/**
 * Thanh hiện diện đồng đội chuẩn phong cách Google Sheets / Google Docs:
 * Hiển thị hàng avatar tròn của tất cả các thám tử đang cùng mở vụ án ở góc trên màn hình.
 * - Rê chuột vào từng avatar: Tooltip nổi hiển thị tên và trạng thái
 * - Nhấp vào avatar hoặc nút phòng: Mở modal quản lý phòng / chia sẻ
 * - Màu sắc hoàn toàn trung tính (zinc / slate)
 */
export function GoogleSheetsPresenceBar({
  className,
  showShareButton = true,
  onOpenModal,
}: GoogleSheetsPresenceBarProps) {
  const {
    roomCode,
    isConnected,
    members,
    memberCount,
    currentUser,
    deviceId,
    nickname,
  } = useRoomSync()

  const [internalModalOpen, setInternalModalOpen] = useState(false)
  const isModalOpen = onOpenModal ? false : internalModalOpen
  const handleOpen = () => {
    if (onOpenModal) {
      onOpenModal()
    } else {
      setInternalModalOpen(true)
    }
  }
  const [copied, setCopied] = useState(false)

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation()
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

  // Khi chưa kết nối vào phòng: Hiển thị nút "Chơi nhóm" tối giản
  if (!isConnected || !roomCode) {
    return (
      <>
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer',
            className
          )}
          title="Tạo hoặc tham gia phòng chơi nhóm đồng bộ"
        >
          <Users className="size-3.5 text-zinc-400" />
          <span>Chơi nhóm</span>
        </button>

        {!onOpenModal && (
          <RoomModal isOpen={isModalOpen} onClose={() => setInternalModalOpen(false)} />
        )}
      </>
    )
  }

  // Danh sách thành viên hiển thị
  const displayMembers =
    members.length > 0
      ? members
      : [
          {
            key: deviceId || 'me',
            nickname,
            joinedAt: Date.now(),
            avatarUrl: currentUser?.avatarUrl || null,
            userId: currentUser?.id || null,
            email: currentUser?.email || null,
            isAuthenticated: !!currentUser,
          },
        ]

  const maxVisible = 5
  const visibleMembers = displayMembers.slice(0, maxVisible)
  const overflowCount = Math.max(0, displayMembers.length - maxVisible)

  return (
    <>
      <div className={cn('flex items-center gap-2 select-none', className)}>
        {/* Dải Avatar phong cách Google Sheets (nằm ngang, xếp lớp tinh tế) */}
        <div className="flex items-center -space-x-1.5 hover:space-x-0.5 transition-all duration-200">
          {visibleMembers.map((m, index) => {
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
                onClick={handleOpen}
                className="group relative cursor-pointer"
              >
                {/* Avatar tròn với viền ring bảo vệ */}
                <div className="relative rounded-full ring-2 ring-zinc-950 transition-transform duration-150 group-hover:scale-115 group-hover:z-20">
                  <DetectiveAvatar
                    src={effectiveAvatar}
                    name={m.nickname}
                    size="sm"
                    showOnlineDot={true}
                    isOnline={true}
                  />
                </div>

                {/* Tooltip nổi phong cách Google Sheets khi hover */}
                <div className="pointer-events-none absolute right-0 top-full mt-2 hidden min-w-[140px] max-w-[200px] flex-col rounded-lg bg-zinc-900 border border-zinc-750 px-2.5 py-1.5 text-left text-xs shadow-xl z-50 group-hover:flex animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-100 truncate">
                    <span className="truncate">{m.nickname}</span>
                    {isMe && (
                      <span className="text-[10px] text-zinc-400 font-normal">
                        (Bạn)
                      </span>
                    )}
                    {isHost && (
                      <span className="text-[10px] text-zinc-400 font-normal">
                        ★
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>
                      {m.isAuthenticated ? 'Đã xác thực' : 'Khách trực tuyến'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Badge số lượng thành viên dư (+N) nếu nhiều hơn maxVisible */}
          {overflowCount > 0 && (
            <button
              type="button"
              onClick={handleOpen}
              className="size-8 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center ring-2 ring-zinc-950 transition-all cursor-pointer z-10"
              title={`Còn ${overflowCount} thám tử khác đang trực tuyến`}
            >
              +{overflowCount}
            </button>
          )}
        </div>

        {/* Nút Phòng & Chia sẻ nhanh (kiểu nút Share góc phải của Google Sheets) */}
        {showShareButton && (
          <button
            type="button"
            onClick={handleOpen}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm group"
            title={`Phòng ${roomCode} • ${memberCount} người đang trực tuyến. Nhấp để xem danh sách hoặc đổi tên.`}
          >
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="tracking-wider">{roomCode}</span>
            <span
              onClick={handleCopyLink}
              className="p-0.5 -mr-0.5 rounded text-zinc-400 hover:text-white transition-colors"
              title="Sao chép link mời phòng"
            >
              {copied ? (
                <Check className="size-3 text-emerald-400" />
              ) : (
                <Copy className="size-3" />
              )}
            </span>
          </button>
        )}
      </div>

      {!onOpenModal && (
        <RoomModal isOpen={isModalOpen} onClose={() => setInternalModalOpen(false)} />
      )}
    </>
  )
}
