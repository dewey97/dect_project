'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamic import for WebGL Canvas to prevent SSR hydration issues
const FileCabinet3D = dynamic(
  () => import('@/components/investigation/file_cabinet_3d'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex flex-col items-center justify-center bg-stone-950 text-amber-500 font-mono text-sm">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
        Đang tải mô hình tủ 3D WebGL (Three.js)...
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

