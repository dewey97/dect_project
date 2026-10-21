'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

export type EvidenceTheme = 'vintage' | 'noir'

interface EvidenceThemeContextValue {
  theme: EvidenceTheme
  setTheme: (theme: EvidenceTheme) => void
  toggleTheme: () => void
}

const EvidenceThemeContext = createContext<EvidenceThemeContextValue>({
  theme: 'noir',
  setTheme: () => {},
  toggleTheme: () => {},
})

export function EvidenceThemeProvider({
  children,
  defaultTheme = 'noir',
}: {
  children: React.ReactNode
  defaultTheme?: EvidenceTheme
}) {
  const [theme, setThemeState] = useState<EvidenceTheme>(defaultTheme)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const saved = getStorageItem('evidence_theme') as EvidenceTheme | null
    if (saved === 'vintage' || saved === 'noir') {
      setThemeState(saved)
    }
  }, [])

  const setTheme = useCallback((t: EvidenceTheme) => {
    setThemeState(t)
    detectiveAudio.playPaperRustle()
    setStorageItem('evidence_theme', t)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'noir' ? 'vintage' : 'noir')
  }, [theme, setTheme])

  return (
    <EvidenceThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </EvidenceThemeContext.Provider>
  )
}

export function useEvidenceTheme() {
  return useContext(EvidenceThemeContext)
}

/**
 * Nút chuyển đổi giao diện ĐEN NOIR / NÂU CỔ ĐIỂN
 */
export function EvidenceThemeSwitcher({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const { theme, setTheme } = useEvidenceTheme()

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setTheme(theme === 'noir' ? 'vintage' : 'noir')}
        className={cn(
          'size-8 sm:size-9 rounded-lg border transition-all cursor-pointer flex items-center justify-center font-mono text-xs shadow-sm active:scale-95',
          theme === 'noir'
            ? 'bg-[#121620] hover:bg-[#1a2030] border-[#38bdf8]/40 text-[#38bdf8]'
            : 'bg-[#2b1b11] hover:bg-[#3d2618] border-[#523824] text-[#d9a066]',
          className
        )}
        title={theme === 'noir' ? 'Đang bật: Đen Noir (Nhấn để đổi sang Nâu)' : 'Đang bật: Nâu Cổ Điển (Nhấn để đổi sang Đen)'}
      >
        <span>{theme === 'noir' ? '🌑' : '🍂'}</span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center p-0.5 rounded-lg border backdrop-blur-md transition-all shadow-sm',
        theme === 'noir'
          ? 'bg-[#0e0e13]/90 border-[#23232c]'
          : 'bg-[#1b120c]/90 border-[#4a3625]',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setTheme('noir')}
        className={cn(
          'px-2 py-1 rounded font-mono text-[0.62rem] font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer',
          theme === 'noir'
            ? 'bg-[#38bdf8] text-[#050507] shadow-sm font-black'
            : 'text-zinc-400 hover:text-white'
        )}
        title="Giao diện Đen Noir: Triệt tiêu ám vàng/nâu, tone đen tuyền lạnh kết hợp điểm nhấn xanh thép"
      >
        <span>🌑 ĐEN NOIR</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme('vintage')}
        className={cn(
          'px-2 py-1 rounded font-mono text-[0.62rem] font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer',
          theme === 'vintage'
            ? 'bg-[#d9a066] text-[#1a0f07] shadow-sm font-black'
            : 'text-stone-400 hover:text-stone-200'
        )}
        title="Giao diện Nâu Cổ Điển: Tone gỗ bần, giấy ngả vàng, phong cách trinh thám analog thập niên 90"
      >
        <span>🍂 NÂU CỔ ĐIỂN</span>
      </button>
    </div>
  )
}
