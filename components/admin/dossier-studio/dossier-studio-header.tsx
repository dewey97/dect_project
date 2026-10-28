'use client'

import React from 'react'
import {
  Briefcase,
  Edit3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Save,
  Printer,
  Compass
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DbCase } from '@/lib/types/database'

interface DossierStudioHeaderProps {
  caseId: string
  setCaseId: (id: string) => void
  initialCases: DbCase[]
  highlightEditable: boolean
  setHighlightEditable: React.Dispatch<React.SetStateAction<boolean>>
  zoomScale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onSetPhysicalScale?: () => void
  onSaveData: () => void
  isSavingDb: boolean
  savedNotification: boolean
  onPrint: () => void
  onOpen360Config?: () => void
}

export function DossierStudioHeader({
  caseId,
  setCaseId,
  initialCases,
  highlightEditable,
  setHighlightEditable,
  zoomScale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSetPhysicalScale,
  onSaveData,
  isSavingDb,
  savedNotification,
  onPrint,
  onOpen360Config
}: DossierStudioHeaderProps) {
  return (
    <header className="no-print h-14 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md px-4 flex items-center justify-between z-30 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Bộ lọc Vụ Án (Case Selector từ Database) */}
        <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10 text-xs">
          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-1"
          >
            {initialCases.length > 0 ? (
              initialCases.map(c => (
                <option key={c.id} value={c.slug} className="bg-[#141618] text-white">
                  {c.title}
                </option>
              ))
            ) : (
              <option value="case_000" className="bg-[#141618] text-white">
                TRỐN TÌM
              </option>
            )}
          </select>
        </div>

        {/* Nút Cấu hình Không gian Hiện Trường 360 */}
        {onOpen360Config && (
          <button
            type="button"
            onClick={onOpen360Config}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 transition-all shadow-sm active:scale-95"
            title="Xem & Cấu hình không gian Khám xét Hiện trường 360"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hiện Trường 360</span>
          </button>
        )}


      </div>

      <div className="flex items-center gap-3">
        {/* Toggle Chế Độ Soạn Thảo: EDIT ON / OFF */}
        <button
          onClick={() => setHighlightEditable(prev => !prev)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
            highlightEditable
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10"
              : "bg-black/50 border-white/10 text-neutral-400 hover:text-white"
          )}
          title="Bật/Tắt chế độ chỉnh sửa trực tiếp trên tài liệu"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>EDIT: {highlightEditable ? 'ON' : 'OFF'}</span>
        </button>

        {/* Zoom Controls (Figma / Vector Canvas) */}
        <div className="flex items-center bg-black/50 p-1 rounded-lg border border-white/10 text-xs">
          <button
            onClick={onZoomOut}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-all"
            title="Thu nhỏ (Ctrl + Cuộn xuống)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetZoom}
            className="px-2 py-1 font-mono font-bold text-[11px] text-amber-400 hover:text-amber-300 hover:bg-white/10 rounded transition-all min-w-[48px] text-center"
            title="Đặt lại 100% (Reset Zoom)"
          >
            {Math.round(zoomScale * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-all"
            title="Phóng to (Ctrl + Cuộn lên)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {onSetPhysicalScale && (
            <button
              onClick={onSetPhysicalScale}
              className="px-2 py-1 ml-0.5 border-l border-white/10 text-[11px] font-mono font-bold text-neutral-300 hover:text-amber-400 hover:bg-white/10 rounded transition-all"
              title="Tỉ lệ thực 1:1 ngoài đời (1 cm trên màn hình = 1 cm thước kẻ thật)"
            >
              1:1
            </button>
          )}
          <button
            onClick={onResetZoom}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-all ml-0.5 border-l border-white/10"
            title="Về vị trí gốc (Reset Pan & Zoom)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        <div className="h-5 w-px bg-white/10" />

        {/* Save Button (Database Supabase) */}
        <button
          onClick={onSaveData}
          disabled={isSavingDb}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm",
            savedNotification
              ? "bg-emerald-500 text-black shadow-emerald-500/20"
              : isSavingDb
                ? "bg-blue-800 text-white/70 cursor-wait"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95"
          )}
          title="Lưu lại toàn bộ dữ liệu vào Database Supabase"
        >
          {savedNotification ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{savedNotification ? 'Đã lưu DB!' : isSavingDb ? 'Đang lưu...' : 'Lưu'}</span>
        </button>

        {/* Print PDF Button */}
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Xuất</span>
        </button>
      </div>
    </header>
  )
}
