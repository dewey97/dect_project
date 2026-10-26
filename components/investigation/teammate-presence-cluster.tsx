'use client'

import React, { useState } from 'react'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoomSync } from '@/components/investigation/room-sync-context'
import { DetectiveAvatar } from '@/components/investigation/detective-avatar'
import { RoomModal } from '@/components/investigation/room-modal'

interface TeammatePresenceClusterProps {
  className?: string
  variant?: 'header' | 'compact' | 'floating'
}

/**
 * Cụm hiển thị hiện diện thám tử thời gian thực (Live Teammate Presence)
 * Thiết kế chuẩn phong cách cộng tác Figma / Linear / Google Docs:
 * Hiển thị mã phòng và Avatar Stack của các đồng đội đang trực tuyến mà không cần mở modal.
 */
export function TeammatePresenceCluster({
  className,
  variant = 'header',
}: TeammatePresenceClusterProps) {
  const { roomCode, isConnected, members, memberCount, currentUser, deviceId, nickname } = useRoomSync()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Nếu chưa vào phòng
  if (!isConnected || !roomCode) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={cn(
            'inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs font-medium py-1 px-2 rounded-lg hover:bg-zinc-800/60',
            className
          )}
          title="Chơi nhóm đồng bộ thời gian thực"
        >
          <Users className="size-3.5 text-zinc-400" />
          <span>Chơi nhóm</span>
        </button>

        <RoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  // Danh sách thành viên hiển thị (nếu mảng members chưa sync về nhưng đã kết nối, hiển thị bản thân)
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

  const maxVisibleAvatars = 4
  const visibleMembers = displayMembers.slice(0, maxVisibleAvatars)
  const remainingCount = Math.max(0, displayMembers.length - maxVisibleAvatars)

  const namesTooltip = displayMembers.map((m) => m.nickname).join(', ')

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group shadow-sm select-none',
          className
        )}
        title={`Tổ chuyên án (${displayMembers.length} trực tuyến): ${namesTooltip}`}
      >
        {/* Mã phòng rút gọn */}
        <span className="font-mono text-[11px] font-bold text-zinc-300 tracking-wider group-hover:text-white transition-colors">
          {roomCode}
        </span>

        {/* Vách ngăn mảnh */}
        <span className="w-px h-3.5 bg-zinc-700/60" />

        {/* Avatar Stack chồng lớp */}
        <div className="flex items-center -space-x-1.5 overflow-visible">
          {visibleMembers.map((m) => {
            const isMe =
              (deviceId && m.key === deviceId) ||
              m.nickname === nickname ||
              (currentUser?.id && m.userId === currentUser.id)

            const effectiveAvatar = isMe
              ? currentUser?.avatarUrl || m.avatarUrl
              : m.avatarUrl

            return (
              <div
                key={m.key}
                className="relative rounded-full ring-2 ring-zinc-950 transition-transform group-hover:scale-105"
                title={`${m.nickname}${isMe ? ' (Bạn)' : ''}`}
              >
                <DetectiveAvatar
                  src={effectiveAvatar}
                  name={m.nickname}
                  size="xs"
                />
              </div>
            )
          })}

          {remainingCount > 0 && (
            <div
              className="size-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-mono font-bold flex items-center justify-center ring-2 ring-zinc-950 shrink-0"
              title={`Còn thêm ${remainingCount} thám tử khác`}
            >
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Đèn xanh trực tuyến */}
        <span
          className="size-2 rounded-full bg-emerald-500 animate-pulse ml-0.5"
          title={`${memberCount} thám tử đang trực tuyến`}
        />
      </button>

      <RoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
