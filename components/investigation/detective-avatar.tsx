'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface DetectiveAvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showOnlineDot?: boolean
  isOnline?: boolean
}

const SIZE_MAP = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
}

const ICON_SIZE_MAP = {
  xs: 14,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 32,
}

// Bảng màu trung tính (neutral / zinc / slate monochrome)
const NEUTRAL_PALETTES = [
  {
    bg: 'bg-zinc-800/80',
    border: 'border-zinc-700/60',
    iconColor: '#d4d4d8', // zinc-300
  },
  {
    bg: 'bg-zinc-900',
    border: 'border-zinc-700/80',
    iconColor: '#e4e4e7', // zinc-200
  },
  {
    bg: 'bg-neutral-800',
    border: 'border-neutral-700',
    iconColor: '#a1a1aa', // zinc-400
  },
  {
    bg: 'bg-stone-900',
    border: 'border-stone-700/70',
    iconColor: '#f4f4f5', // zinc-100
  },
]

function getNeutralPalette(name: string = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return NEUTRAL_PALETTES[Math.abs(hash) % NEUTRAL_PALETTES.length]
}

/** Biểu tượng silhouette thám tử tối giản - đường nét trung tính */
export function DetectiveSilhouetteSvg({ size = 20, color = '#d4d4d8' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none"
    >
      {/* Vành mũ Fedora trên */}
      <path
        d="M8.5 7.2C8.5 4.8 10 3.8 12 3.8C14 3.8 15.5 4.8 15.5 7.2H8.5Z"
        fill={color}
      />
      {/* Dải nẹp nơ mũ */}
      <path
        d="M8.5 6.6H15.5V7.4H8.5V6.6Z"
        fill="#09090b"
        opacity="0.5"
      />
      {/* Vành nón rộng phía dưới */}
      <path
        d="M4.5 8.6C7.5 8 16.5 8 19.5 8.6C20.5 8.8 19.8 9.8 18 9.8C14 9.8 10 9.8 6 9.8C4.2 9.8 3.5 9 4.5 8.6Z"
        fill={color}
      />
      {/* Kính tối giản */}
      <rect x="7.8" y="11" width="3.4" height="2.2" rx="0.8" fill={color} opacity="0.9" />
      <rect x="12.8" y="11" width="3.4" height="2.2" rx="0.8" fill={color} opacity="0.9" />
      <path d="M11.2 12.1H12.8" stroke={color} strokeWidth="1" strokeLinecap="round" />
      {/* Áo măng tô & cổ áo trench coat */}
      <path
        d="M5.5 19.5L8.5 14.5L12 16L15.5 14.5L18.5 19.5C18.5 19.5 14.5 20.2 12 20.2C9.5 20.2 5.5 19.5 5.5 19.5Z"
        fill={color}
        opacity="0.8"
      />
    </svg>
  )
}

export function DetectiveAvatar({
  src,
  name = 'Thám tử',
  size = 'md',
  className,
  showOnlineDot = false,
  isOnline = true,
}: DetectiveAvatarProps) {
  const [hasError, setHasError] = useState(false)
  const palette = getNeutralPalette(name)
  const iconSize = ICON_SIZE_MAP[size]

  const showRealAvatar = Boolean(src && !hasError)

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden flex items-center justify-center border transition-all',
          SIZE_MAP[size],
          showRealAvatar
            ? 'border-zinc-700 bg-zinc-900'
            : cn(palette.bg, palette.border)
        )}
        title={name}
      >
        {showRealAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt={name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <DetectiveSilhouetteSvg size={iconSize} color={palette.iconColor} />
          </div>
        )}
      </div>

      {/* Đèn trạng thái trực tuyến */}
      {showOnlineDot && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-zinc-950',
            size === 'xs' ? 'size-2' : size === 'sm' ? 'size-2.5' : 'size-3',
            isOnline ? 'bg-emerald-500' : 'bg-zinc-500'
          )}
          title={isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
        />
      )}
    </div>
  )
}
