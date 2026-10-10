'use client'

import React from 'react'

export default function CabinetDemoPage() {
  return (
    <main className="w-screen h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-stone-400 font-mono text-center select-none">
      <div className="max-w-md border border-stone-800 bg-stone-900/80 p-8 rounded-lg shadow-2xl backdrop-blur">
        <div className="w-10 h-10 mx-auto mb-4 border border-amber-600/50 bg-amber-950/30 rounded-full flex items-center justify-center text-amber-500 font-bold">
          !
        </div>
        <h2 className="text-stone-200 text-sm font-bold mb-2 uppercase tracking-widest">[Kho Lưu Trữ 3D — Tạm Khóa]</h2>
        <p className="text-xs text-stone-400 leading-relaxed mb-4">
          Phân hệ 3D WebGL đã được đóng băng và chuyển vào kho lưu trữ bảo mật (archive_3d_vault) theo quy trình vận hành.
        </p>
        <div className="text-[10px] text-stone-500 border-t border-stone-800 pt-3">
          Trạng thái: INACTIVE &bull; Chỉ mở lại khi có yêu cầu trực tiếp từ người dùng.
        </div>
      </div>
    </main>
  )
}
