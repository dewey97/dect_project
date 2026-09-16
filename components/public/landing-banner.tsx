'use client'

import { useEffect, useState } from 'react'
import { getAppSettings } from '@/lib/actions/settings-actions'
import { DbAppSettings } from '@/lib/types/database'

export function LandingBanner() {
  const [settings, setSettings] = useState<DbAppSettings | null>(null)

  useEffect(() => {
    getAppSettings().then(res => {
      if (res.success && res.data) {
        setSettings(res.data)
      }
    })
  }, [])

  if (!settings || !settings.banner_active) return null

  return (
    <div className="w-full relative z-50 overflow-hidden flex items-center justify-center pointer-events-none animate-in slide-in-from-top-4 duration-500">
      <div 
        className="w-full h-6.5 bg-amber-500 text-black flex items-center justify-center px-6 font-mono text-[0.72rem] font-black uppercase tracking-[0.15em] border-b border-black/80"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.06) 10px, rgba(0,0,0,0.06) 20px)'
        }}
      >
        <span>✦ {settings.banner_text} ✦</span>
      </div>
    </div>
  )
}
