'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamic import for WebGL Canvas to prevent SSR hydration issues
const FileCabinet3D = dynamic(
  () => import('@/components/investigation/file_cabinet_3d'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center bg-stone-950">
        <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }
)

export default function CabinetDemoPage() {
  return (
    <main className="w-screen h-screen bg-stone-950 overflow-hidden relative">
      <FileCabinet3D />
    </main>
  )
}
