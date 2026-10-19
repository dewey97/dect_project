'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { DossierMode, PaperConfig, LoiKhaiData, LyLichData } from '@/types/dossier'
import type { DbDossierDocument } from '@/lib/actions/dossier-actions'

interface DossierStudioSidebarProps {
  mode: DossierMode
  paperSize: 'A4' | 'A5'
  paperOrientation: 'portrait' | 'landscape'
  setPaperSize: (size: 'A4' | 'A5') => void
  setPaperOrientation: (orientation: 'portrait' | 'landscape') => void
  dbDocuments: DbDossierDocument[]
  selectedTagCode: string
  onSelectDossier: (tagCode: string) => void
  onCreateNewDocument?: () => void
  onReorderDocuments?: (sourceIndex: number, targetIndex: number) => void
  // LK Form States
  lkData: LoiKhaiData
  setLkData: React.Dispatch<React.SetStateAction<LoiKhaiData>>
  addLkQuestion?: (index?: number) => void
  lkPageCount?: number
  // HS Form States
  hsData: LyLichData
  setHsData: React.Dispatch<React.SetStateAction<LyLichData>>
  showSeal: boolean
  setShowSeal: React.Dispatch<React.SetStateAction<boolean>>
  sealAngle: number
  setSealAngle: React.Dispatch<React.SetStateAction<number>>
}

export function DossierStudioSidebar({
  mode,
  paperSize,
  paperOrientation,
  setPaperSize,
  setPaperOrientation,
  dbDocuments,
  selectedTagCode,
  onSelectDossier,
  onCreateNewDocument,
  onReorderDocuments,
  lkData,
  setLkData,
  hsData,
  setHsData,
  showSeal,
  setShowSeal,
  sealAngle,
  setSealAngle
}: DossierStudioSidebarProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  return (
    <aside className="no-print w-72 h-full min-h-0 border-l border-white/10 bg-[#141618] flex flex-col flex-shrink-0 z-20 p-4 space-y-4 text-xs overflow-y-auto">
      <div className="flex items-center justify-between pb-1">
        <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
          Tùy Chỉnh {mode === 'loi_khai' ? 'Lời Khai' : 'Lý Lịch'}
        </span>
        {onCreateNewDocument && (
          <button
            type="button"
            onClick={onCreateNewDocument}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-all shadow-sm active:scale-95"
            title="Tạo văn bản mới trống để nhập liệu"
          >
            <span>+ Tạo Mới</span>
          </button>
        )}
      </div>

      {/* Cấu hình Khổ giấy (Chung một dòng, không viền ngoài, bỏ dọc/ngang) */}
      <div className="flex items-center justify-between gap-2 py-1">
        <span className="text-neutral-400 font-semibold text-[11px] uppercase tracking-wider">
          📄 Khổ Giấy:
        </span>
        <div className="flex bg-black/60 p-0.5 rounded border border-white/10 w-28">
          <button
            type="button"
            onClick={() => setPaperSize('A4')}
            className={cn(
              "flex-1 py-1 rounded text-center font-mono font-bold transition-all text-xs",
              paperSize === 'A4'
                ? "bg-amber-500 text-black shadow-sm"
                : "text-neutral-400 hover:text-white"
            )}
          >
            A4
          </button>
          <button
            type="button"
            onClick={() => setPaperSize('A5')}
            className={cn(
              "flex-1 py-1 rounded text-center font-mono font-bold transition-all text-xs",
              paperSize === 'A5'
                ? "bg-amber-500 text-black shadow-sm"
                : "text-neutral-400 hover:text-white"
            )}
          >
            A5
          </button>
        </div>
      </div>

      {/* Danh sách Hồ sơ nhân vật (Kéo thả di chuyển thứ tự hồ sơ, không dùng thanh cuộn riêng) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-amber-400 font-semibold block text-[11px] uppercase tracking-wider">
            📂 Danh Sách Hồ Sơ ({dbDocuments.length}):
          </label>
        </div>
        <div className="space-y-1">
          {dbDocuments.map((d, index) => {
            const isSelected = (mode === 'loi_khai' ? lkData.tagCode : hsData.tagCode) === d.tag_code;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={d.id}
                draggable
                onDragStart={(e) => {
                  setDraggedIndex(index)
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/plain', String(index))
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  if (dragOverIndex !== index) {
                    setDragOverIndex(index)
                  }
                }}
                onDragLeave={() => {
                  if (dragOverIndex === index) {
                    setDragOverIndex(null)
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const sourceIdxStr = e.dataTransfer.getData('text/plain')
                  const sourceIdx = sourceIdxStr ? parseInt(sourceIdxStr, 10) : draggedIndex
                  if (sourceIdx !== null && sourceIdx !== undefined && sourceIdx !== index) {
                    onReorderDocuments?.(sourceIdx, index)
                  }
                  setDraggedIndex(null)
                  setDragOverIndex(null)
                }}
                onDragEnd={() => {
                  setDraggedIndex(null)
                  setDragOverIndex(null)
                }}
                onClick={() => onSelectDossier(d.tag_code)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded transition-all flex items-center justify-between text-xs border cursor-grab active:cursor-grabbing select-none",
                  isDragging && "opacity-40 scale-95 border-dashed border-amber-400",
                  isDragOver && !isDragging && "border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/30",
                  isSelected
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold shadow-sm"
                    : "bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-neutral-500 cursor-grab hover:text-neutral-300">⋮⋮</span>
                  <span className="truncate">{d.subject_name || 'Chưa đặt tên'}</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-neutral-400 flex-shrink-0">
                  {d.tag_code}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {mode === 'loi_khai' ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <label className="text-neutral-400 whitespace-nowrap">Mã Tag chứng cứ:</label>
            <input
              type="text"
              value={lkData.tagCode}
              onChange={e => setLkData({ ...lkData, tagCode: e.target.value })}
              className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded px-2.5 py-1 font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500 text-right"
            />
          </div>

          <div>
            <label className="text-neutral-400 mb-1 block">Tên người được lấy lời khai</label>
            <input
              type="text"
              value={lkData.subjectName}
              onChange={e => setLkData({ ...lkData, subjectName: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <label className="text-neutral-400 whitespace-nowrap">Mã Tag chứng cứ:</label>
            <input
              type="text"
              value={hsData.tagCode}
              onChange={e => setHsData({ ...hsData, tagCode: e.target.value })}
              className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded px-2.5 py-1 font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500 text-right"
            />
          </div>

          <div>
            <label className="text-neutral-400 mb-1 block">Ảnh chân dung 3x4 (URL / Path)</label>
            <input
              type="text"
              value={hsData.photoUrl}
              onChange={e => setHsData({ ...hsData, photoUrl: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 font-mono text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-neutral-400 mb-1 block">Họ và tên đối tượng</label>
            <input
              type="text"
              value={hsData.fullName}
              onChange={e => setHsData({ ...hsData, fullName: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-neutral-400 mb-1 block">Sinh ngày</label>
              <input
                type="text"
                value={hsData.dob}
                onChange={e => setHsData({ ...hsData, dob: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-neutral-200"
              />
            </div>
            <div>
              <label className="text-neutral-400 mb-1 block">Giới tính</label>
              <input
                type="text"
                value={hsData.gender}
                onChange={e => setHsData({ ...hsData, gender: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-neutral-200"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 mb-1 block">Số CMND / Thẻ căn cước</label>
            <input
              type="text"
              value={hsData.cmnd}
              onChange={e => setHsData({ ...hsData, cmnd: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-neutral-200"
            />
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-300 font-medium">Dấu đỏ giáp lai & PC02</span>
              <input
                type="checkbox"
                checked={showSeal}
                onChange={e => setShowSeal(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
            </div>
            {showSeal && (
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Độ nghiêng con dấu</span>
                  <span className="font-mono text-amber-400">{sealAngle}°</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  value={sealAngle}
                  onChange={e => setSealAngle(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  )
}
