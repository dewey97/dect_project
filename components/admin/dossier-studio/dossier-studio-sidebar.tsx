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
  lkData,
  setLkData,
  hsData,
  setHsData,
  showSeal,
  setShowSeal,
  sealAngle,
  setSealAngle
}: DossierStudioSidebarProps) {
  return (
    <aside className="no-print w-72 h-full min-h-0 border-l border-white/10 bg-[#141618] flex flex-col flex-shrink-0 z-20 p-4 space-y-4 text-xs overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
          Tùy Chỉnh {mode === 'loi_khai' ? 'Lời Khai' : 'Lý Lịch'}
        </span>
      </div>

      {/* Chọn nhanh Hồ sơ nhân vật (Kho án mẫu) */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg space-y-1.5">
        <label className="text-amber-400 font-semibold block text-[11px] uppercase tracking-wider">
          📂 Chọn Hồ Sơ Nhân Vật:
        </label>
        <select
          value={mode === 'loi_khai' ? lkData.tagCode : hsData.tagCode}
          onChange={(e) => onSelectDossier(e.target.value)}
          className="w-full bg-[#1c1f24] border border-amber-500/30 rounded px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer text-xs"
        >
          <option value="" disabled>-- Chọn hồ sơ vụ án --</option>
          {dbDocuments.map(d => (
            <option key={d.id} value={d.tag_code} className="bg-[#141618] text-white py-1">
              {d.tag_code} - {d.subject_name}
            </option>
          ))}
        </select>
      </div>

      {/* Cấu hình Khổ giấy & Hướng in (Lưu riêng theo từng loại văn bản) */}
      <div className="bg-black/40 border border-white/10 p-2.5 rounded-lg space-y-2">
        <span className="text-neutral-400 font-semibold block text-[11px] uppercase tracking-wider">
          📄 Khổ Giấy & Hướng In:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex bg-black/60 p-0.5 rounded border border-white/10">
            <button
              type="button"
              onClick={() => setPaperSize('A4')}
              className={cn(
                "flex-1 py-1 rounded text-center font-mono font-bold transition-all",
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
                "flex-1 py-1 rounded text-center font-mono font-bold transition-all",
                paperSize === 'A5'
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              A5
            </button>
          </div>

          <div className="flex bg-black/60 p-0.5 rounded border border-white/10">
            <button
              type="button"
              onClick={() => setPaperOrientation('portrait')}
              className={cn(
                "flex-1 py-1 rounded text-center font-semibold transition-all",
                paperOrientation === 'portrait'
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              Dọc
            </button>
            <button
              type="button"
              onClick={() => setPaperOrientation('landscape')}
              className={cn(
                "flex-1 py-1 rounded text-center font-semibold transition-all",
                paperOrientation === 'landscape'
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              Ngang
            </button>
          </div>
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

          <div>
            <label className="text-neutral-400 mb-1 block">Mối quan hệ với nạn nhân</label>
            <input
              type="text"
              value={lkData.relationText}
              onChange={e => setLkData({ ...lkData, relationText: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-neutral-400 mb-1 block">Điều tra viên</label>
            <input
              type="text"
              value={lkData.investigatorText}
              onChange={e => setLkData({ ...lkData, investigatorText: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-amber-500"
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
            <label className="text-neutral-400 mb-1 block">Mã định danh (Góc trái)</label>
            <input
              type="text"
              value={hsData.idCode}
              onChange={e => setHsData({ ...hsData, idCode: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 font-mono text-neutral-300 focus:outline-none focus:border-amber-500"
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
