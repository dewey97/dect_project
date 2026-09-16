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
          /* Locked Gray Pinhead */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] opacity-70">
            <defs>
              <radialGradient id="grayPinGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#d4d4d8" />
                <stop offset="60%" stopColor="#71717a" />
                <stop offset="100%" stopColor="#27272a" />
              </radialGradient>
            </defs>
            <ellipse cx="14" cy="15" rx="7" ry="4" fill="rgba(0,0,0,0.4)" />
            <circle cx="12" cy="12" r="9" fill="url(#grayPinGrad)" stroke="#3f3f46" strokeWidth="1.2" />
            <ellipse cx="9.5" cy="9.5" rx="3" ry="1.8" fill="rgba(255,255,255,0.6)" transform="rotate(-30 9.5 9.5)" />
          </svg>
        ) : isMain ? (
          /* Red Main Map Pinhead (Exact HeroInteractive Landing Page Style) */
          <svg width="28" height="28" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_10px_rgba(239,68,68,0.7)] group-hover:drop-shadow-[0_4px_16px_rgba(239,68,68,1)] transition-all">
            <defs>
              <radialGradient id="redMainPinGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ff7777" />
                <stop offset="50%" stopColor="#cc2222" />
                <stop offset="85%" stopColor="#880000" />
                <stop offset="100%" stopColor="#440000" />
              </radialGradient>
            </defs>
            {/* Ground Shadow */}
            <ellipse cx="15" cy="16" rx="9" ry="5" fill="rgba(0,0,0,0.55)" />
            {/* Outer Ring */}
            <circle cx="13" cy="13" r="11" fill="rgba(200, 35, 35, 0.25)" stroke="rgba(255, 100, 100, 0.4)" strokeWidth="1" />
            {/* 3D Sphere Pin Dome */}
            <circle cx="13" cy="13" r="9" fill="url(#redMainPinGrad)" stroke="#660000" strokeWidth="1.5" />
            {/* Specular White Highlight */}
            <ellipse cx="10" cy="9.5" rx="3.5" ry="2" fill="rgba(255,255,255,0.85)" transform="rotate(-30 10 9.5)" />
          </svg>
        ) : (
          /* Yellow Sub Map Pinhead (Exact HeroInteractive Landing Page Style) */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_3px_6px_rgba(245,158,11,0.6)] group-hover:drop-shadow-[0_3px_10px_rgba(245,158,11,0.95)] transition-all">
            <defs>
              <radialGradient id="yellowSubPinGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffdd66" />
                <stop offset="50%" stopColor="#ccaa22" />
                <stop offset="85%" stopColor="#886600" />
                <stop offset="100%" stopColor="#443300" />
              </radialGradient>
            </defs>
            {/* Ground Shadow */}
            <ellipse cx="14" cy="15" rx="7.5" ry="4" fill="rgba(0,0,0,0.45)" />
            {/* Outer Ring */}
            <circle cx="12" cy="12" r="9" fill="rgba(204, 170, 34, 0.2)" stroke="rgba(255, 221, 102, 0.4)" strokeWidth="1" />
            {/* 3D Sphere Pin Dome */}
            <circle cx="12" cy="12" r="7.5" fill="url(#yellowSubPinGrad)" stroke="#554400" strokeWidth="1.2" />
            {/* Specular White Highlight */}
            <ellipse cx="9.5" cy="9" rx="3" ry="1.6" fill="rgba(255,255,255,0.85)" transform="rotate(-30 9.5 9)" />
          </svg>
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
