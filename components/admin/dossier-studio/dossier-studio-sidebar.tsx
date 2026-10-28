'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { DossierMode, LoiKhaiData, LyLichData } from '@/types/dossier'
import type { DbDossierDocument } from '@/lib/actions/dossier-actions'
import type { DbCaseEvidence } from '@/lib/types/database'
import { UserCheck, FileText, Plus, Camera, Image as ImageIcon, Volume2, Package, Sparkles } from 'lucide-react'
import { EvidenceForm } from '@/components/admin/evidence-studio/evidence-form'

interface DossierStudioSidebarProps {
  caseId: string
  activeSectionType: 'ly_lich' | 'loi_khai' | 'evidence'
  hsDocuments: DbDossierDocument[]
  lkDocuments: DbDossierDocument[]
  evidenceList: DbCaseEvidence[]
  selectedTagCode: string
  selectedEvidence: DbCaseEvidence | null
  onSelectDossier: (tagCode: string) => void
  onSelectEvidence: (item: DbCaseEvidence) => void
  onCreateNewDocument?: (type: DossierMode) => void
  onCreateNewEvidence?: () => void
  onEvidenceChange?: (updated: Partial<DbCaseEvidence>) => void
  onSaveEvidence?: (saved: DbCaseEvidence) => void
  onDeleteEvidence?: (id: string) => void
  onReorderDocuments?: (mode: DossierMode, sourceIndex: number, targetIndex: number) => void
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
  caseId,
  activeSectionType,
  hsDocuments = [],
  lkDocuments = [],
  evidenceList = [],
  selectedTagCode,
  selectedEvidence,
  onSelectDossier,
  onSelectEvidence,
  onCreateNewDocument,
  onCreateNewEvidence,
  onEvidenceChange,
  onSaveEvidence,
  onDeleteEvidence,
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
  const [draggedMode, setDraggedMode] = React.useState<DossierMode | null>(null)
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  const renderDocList = (docs: DbDossierDocument[], listMode: DossierMode) => {
    return (
      <div className="space-y-1">
        {docs.map((d, index) => {
          const isSelected = activeSectionType !== 'evidence' && selectedTagCode === d.tag_code
          const isDragging = draggedMode === listMode && draggedIndex === index
          const isDragOver = draggedMode === listMode && dragOverIndex === index

          return (
            <div
              key={d.id}
              draggable
              onDragStart={(e) => {
                setDraggedMode(listMode)
                setDraggedIndex(index)
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', String(index))
              }}
              onDragOver={(e) => {
                if (draggedMode !== listMode) return
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
                if (draggedMode !== listMode) return
                const sourceIdxStr = e.dataTransfer.getData('text/plain')
                const sourceIdx = sourceIdxStr ? parseInt(sourceIdxStr, 10) : draggedIndex
                if (sourceIdx !== null && sourceIdx !== undefined && sourceIdx !== index) {
                  onReorderDocuments?.(listMode, sourceIdx, index)
                }
                setDraggedMode(null)
                setDraggedIndex(null)
                setDragOverIndex(null)
              }}
              onDragEnd={() => {
                setDraggedMode(null)
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
          )
        })}
      </div>
    )
  }

  const renderEvidenceKindIcon = (kind: string) => {
    switch (kind) {
      case 'image':
      case 'photo':
        return <ImageIcon className="size-3 text-amber-400 shrink-0" />
      case 'pdf':
        return <FileText className="size-3 text-rose-400 shrink-0" />
      case 'audio':
        return <Volume2 className="size-3 text-emerald-400 shrink-0" />
      case 'object':
        return <Package className="size-3 text-blue-400 shrink-0" />
      default:
        return <Sparkles className="size-3 text-amber-400 shrink-0" />
    }
  }

  return (
    <aside className="no-print w-80 h-full min-h-0 border-l border-white/10 bg-[#141618] flex flex-col flex-shrink-0 z-20 p-4 space-y-4 text-xs overflow-y-auto">
      {/* Top Header & Create Buttons */}
      <div className="flex items-center justify-between pb-1 gap-1">
        <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px] truncate">
          {activeSectionType === 'evidence'
            ? '📸 Vật Chứng & Ảnh'
            : activeSectionType === 'ly_lich'
              ? '📋 Lý Lịch'
              : '📝 Lời Khai'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {onCreateNewDocument && (
            <>
              <button
                type="button"
                onClick={() => onCreateNewDocument('ly_lich')}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-neutral-300 border border-white/10 font-medium text-[10px] transition-all active:scale-95"
                title="Tạo hồ sơ Lý Lịch mới"
              >
                <Plus className="size-3" />
                <span>Lý Lịch</span>
              </button>
              <button
                type="button"
                onClick={() => onCreateNewDocument('loi_khai')}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-neutral-300 border border-white/10 font-medium text-[10px] transition-all active:scale-95"
                title="Tạo biên bản Lời Khai mới"
              >
                <Plus className="size-3" />
                <span>Lời Khai</span>
              </button>
            </>
          )}
          {onCreateNewEvidence && (
            <button
              type="button"
              onClick={onCreateNewEvidence}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] transition-all shadow-sm active:scale-95"
              title="Thêm chứng cứ / ảnh hiện trường mới"
            >
              <Plus className="size-3" />
              <span>Chứng Cứ</span>
            </button>
          )}
        </div>
      </div>

      {/* Danh sách Hồ sơ & Vật chứng */}
      <div className="space-y-3.5">
        {/* Nhóm Hồ sơ Lý Lịch */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <label className="text-amber-400 font-semibold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <UserCheck className="size-3.5" />
              <span>Lý Lịch ({hsDocuments.length})</span>
            </label>
          </div>
          {hsDocuments.length === 0 ? (
            <p className="text-[11px] text-neutral-500 italic px-1">Chưa có hồ sơ lý lịch</p>
          ) : (
            renderDocList(hsDocuments, 'ly_lich')
          )}
        </div>

        {/* Nhóm Biên Bản Lời Khai */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <label className="text-amber-400 font-semibold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <FileText className="size-3.5" />
              <span>Lời Khai ({lkDocuments.length})</span>
            </label>
          </div>
          {lkDocuments.length === 0 ? (
            <p className="text-[11px] text-neutral-500 italic px-1">Chưa có biên bản lời khai</p>
          ) : (
            renderDocList(lkDocuments, 'loi_khai')
          )}
        </div>

        {/* Nhóm Vật Chứng & Ảnh Hiện Trường (Chỉ gồm Ảnh & PDF từ bên ngoài) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <label className="text-amber-400 font-semibold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Camera className="size-3.5" />
              <span>Vật Chứng & Ảnh ({evidenceList.length})</span>
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">Ảnh & PDF ngoài</span>
          </div>
          {evidenceList.length === 0 ? (
            <p className="text-[11px] text-neutral-500 italic px-1">Chưa có vật chứng (Ảnh / PDF ngoài)</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
              {evidenceList.map((item) => {
                const isSelected = activeSectionType === 'evidence' && (selectedEvidence?.id === item.id || selectedTagCode === item.code)
                const isPdf = item.kind === 'pdf'
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectEvidence(item)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded transition-all flex items-center justify-between text-xs border cursor-pointer select-none",
                      isSelected
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold shadow-sm"
                        : "bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {renderEvidenceKindIcon(item.kind)}
                      <span className="truncate">{item.title || item.code}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={cn(
                        "font-mono text-[9px] px-1 py-0.5 rounded font-bold uppercase",
                        isPdf
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      )}>
                        {isPdf ? "PDF" : "Ảnh"}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-neutral-400">
                        {item.code}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chi tiết biểu mẫu theo đối tượng được chọn */}
      <div className="pt-2 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
          <span>
            {activeSectionType === 'evidence'
              ? `Vật Chứng: ${selectedEvidence?.code || selectedTagCode || 'Mới'}`
              : `Chi Tiết: ${selectedTagCode || '...'}`}
          </span>
          <span className="font-mono text-amber-400/90 text-[10px]">
            {activeSectionType === 'evidence'
              ? 'Tang vật'
              : activeSectionType === 'ly_lich'
                ? 'A4 Ngang'
                : 'A4 Dọc'}
          </span>
        </div>

        {/* Form Vật Chứng */}
        {activeSectionType === 'evidence' ? (
          <div className="rounded-lg bg-black/30 border border-white/5 p-2.5">
            <EvidenceForm
              caseId={caseId}
              evidence={selectedEvidence}
              onChange={onEvidenceChange}
              onDelete={onDeleteEvidence}
            />
          </div>
        ) : activeSectionType === 'loi_khai' ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <label className="text-neutral-400 whitespace-nowrap">Mã Tag chứng cứ:</label>
              <input
                type="text"
                value={lkData.tagCode}
                onChange={e => setLkData(prev => ({ ...prev, tagCode: e.target.value }))}
                className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded px-2.5 py-1 font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500 text-right"
              />
            </div>

            <div>
              <label className="text-neutral-400 mb-1 block">Tên người được lấy lời khai</label>
              <input
                type="text"
                value={lkData.subjectName}
                onChange={e => setLkData(prev => ({ ...prev, subjectName: e.target.value }))}
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
                onChange={e => setHsData(prev => ({ ...prev, tagCode: e.target.value }))}
                className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded px-2.5 py-1 font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500 text-right"
              />
            </div>

            <div>
              <label className="text-neutral-400 mb-1 block">Ảnh chân dung 3x4 (URL / Path)</label>
              <input
                type="text"
                value={hsData.photoUrl}
                onChange={e => setHsData(prev => ({ ...prev, photoUrl: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 font-mono text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 mb-1 block">Họ và tên đối tượng</label>
              <input
                type="text"
                value={hsData.fullName}
                onChange={e => setHsData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400 mb-1 block">Sinh ngày</label>
                <input
                  type="text"
                  value={hsData.dob}
                  onChange={e => setHsData(prev => ({ ...prev, dob: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-neutral-200"
                />
              </div>
              <div>
                <label className="text-neutral-400 mb-1 block">Giới tính</label>
                <input
                  type="text"
                  value={hsData.gender}
                  onChange={e => setHsData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-neutral-200"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 mb-1 block">Số CMND / Thẻ căn cước</label>
              <input
                type="text"
                value={hsData.cmnd}
                onChange={e => setHsData(prev => ({ ...prev, cmnd: e.target.value }))}
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
      </div>
    </aside>
  )
}
