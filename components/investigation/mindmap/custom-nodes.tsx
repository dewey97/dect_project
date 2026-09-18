'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'

export interface DotNodeData {
  label: string
  isLocked?: boolean
  isActive?: boolean
  isMain?: boolean
  onClick?: () => void
}

// Detective Pin Node (Matching exact HeroInteractive map pinheads on Landing Page board)
export const DotNode = memo(({ data }: NodeProps) => {
  const nodeData = data as unknown as DotNodeData
  const isLocked = nodeData.isLocked
  const isMain = nodeData.isMain

  return (
    <div
      onClick={() => {
        if (!isLocked && nodeData.onClick) {
          nodeData.onClick()
        }
      }}
      className={cn(
        'group relative flex flex-col items-center justify-center select-none transition-all duration-200 cursor-pointer',
        isLocked ? 'cursor-not-allowed opacity-50' : 'hover:scale-115 active:scale-95'
      )}
    >
      {/* Invisible centered connection handles for smooth bezier curves */}
      <Handle id="top" type="target" position={Position.Top} className="!opacity-0 !w-1 !h-1 !border-0" />
      <Handle id="bottom" type="source" position={Position.Bottom} className="!opacity-0 !w-1 !h-1 !border-0" />
      <Handle id="left" type="target" position={Position.Left} className="!opacity-0 !w-1 !h-1 !border-0" />
      <Handle id="right" type="source" position={Position.Right} className="!opacity-0 !w-1 !h-1 !border-0" />

      {/* LANDING PAGE HEROINTERACTIVE 3D MAP PINHEAD */}
      <div className="relative flex items-center justify-center">
        {/* Active main node pulsing halo */}
        {isMain && !isLocked && (
          <span className="absolute size-7 rounded-full bg-red-600/40 animate-ping pointer-events-none" />
        )}

        {isLocked ? (
          /* Locked Dark Slate Pin */
          <img
            src="/images/pins/pin-dark.png"
            alt="Locked Pin"
            className="w-[30px] h-[30px] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] opacity-80 pointer-events-none select-none"
            draggable={false}
          />
        ) : isMain ? (
          /* Red Main 3D Pushpin */
          <img
            src="/images/pins/pin-red.png"
            alt="Main Target Pin"
            className="w-[30px] h-[30px] object-contain drop-shadow-[0_3px_10px_rgba(239,68,68,0.6)] group-hover:drop-shadow-[0_5px_14px_rgba(239,68,68,0.85)] group-hover:scale-110 transition-all duration-200 pointer-events-none select-none"
            draggable={false}
          />
        ) : (
          /* Yellow/Amber 3D Pushpin */
          <img
            src="/images/pins/pin-yellow.png"
            alt="Clue Pin"
            className="w-[30px] h-[30px] object-contain drop-shadow-[0_3px_8px_rgba(245,158,11,0.45)] group-hover:drop-shadow-[0_4px_12px_rgba(245,158,11,0.8)] group-hover:scale-110 transition-all duration-200 pointer-events-none select-none"
            draggable={false}
          />
        )}
      </div>

      {/* COMPACT BADGE LABEL */}
      <div
        className={cn(
          'mt-1 px-2.5 py-0.5 rounded transition-all duration-200 pointer-events-none shadow-md border',
          isMain
            ? 'bg-zinc-950/95 border-red-500/60 group-hover:border-red-400 group-hover:bg-zinc-950'
            : 'bg-black/80 border-amber-500/30 group-hover:border-amber-400/60 group-hover:bg-black/95'
        )}
      >
        <span
          className={cn(
            'block whitespace-nowrap tracking-wider font-sans',
            isMain
              ? 'font-extrabold text-xs sm:text-sm text-red-100 group-hover:text-white uppercase'
              : 'font-mono text-[10px] sm:text-[11px] text-amber-200/95 group-hover:text-amber-100',
            isLocked && 'text-zinc-400'
          )}
        >
          {nodeData.label}
          {isLocked && ' 🔒'}
        </span>
      </div>
    </div>
  )
})

DotNode.displayName = 'DotNode'
