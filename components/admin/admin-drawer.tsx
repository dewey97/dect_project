'use client'

import React from 'react'
import { X } from 'lucide-react'

export type AdminDrawerProps = {
  isOpen: boolean
  onClose: () => void
  title: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  width?: string
  className?: string
}

export function AdminDrawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 'w-[420px]',
  className = ''
}: AdminDrawerProps) {
  if (!isOpen) return null

  return (
    <div 
      className={`absolute top-0 bottom-0 right-0 ${width} z-[200] bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${className}`}
    >
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-zinc-900/40">
        <div className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
          {title}
        </div>
        <button 
          type="button" 
          onClick={onClose} 
          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-4">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-white/10 flex gap-2 shrink-0 bg-zinc-950">
          {footer}
        </div>
      )}
    </div>
  )
}
