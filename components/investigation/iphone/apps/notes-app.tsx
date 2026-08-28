'use client'

import { useState } from 'react'
import { FileText, ArrowLeft, Search, ChevronRight, Edit3, Folder } from 'lucide-react'
import type { Document } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NotesAppProps {
  notes: Document[]
}

export function NotesApp({ notes }: NotesAppProps) {
  const [selectedNote, setSelectedNote] = useState<Document | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Default rich notes for Khang if empty
  const allNotes: Document[] = notes.length > 0 ? notes : [
    {
      id: 'n-01',
      title: 'Sổ nợ bốc họ & Lãi ngoài tháng 7/2026',
      content: '1. Lê Quang Vũ (Đo đạc): 350.000.000đ — Lãi tính 3.000đ/triệu/ngày. Đã hẹn tối 24/7 sang chốt dứt điểm.\n2. Nam "Còi": 80.000.000đ — Quá hạn 2 tháng.\n3. Hưng đồ gỗ: 120.000.000đ.',
      timestamp: '24/07/2026'
    },
    {
      id: 'n-02',
      title: 'Kế hoạch đền bù đất Bờ Sông (Thửa 2021-BS14)',
      content: 'Diện tích gốc: 75m2.\nBắt thằng Vũ vẽ lại trích đo lên 120m2 để ăn tiền đền bù đợt 1 Ban QLDA.\nTờ di chúc ông nội đã sửa xong ngày, con Mai không có cửa tranh.',
      timestamp: '22/07/2026'
    }
  ]

  const filteredNotes = allNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {selectedNote ? (
        /* NOTE DETAIL VIEW */
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between px-3 pt-2 pb-2 bg-[#161618] border-b border-[#2C2C2E] shrink-0">
            <button
              onClick={() => setSelectedNote(null)}
              className="flex items-center gap-0.5 text-[#FFD60A] text-[13px] font-medium active:opacity-60"
            >
              <ArrowLeft className="size-4" />
              <span>Ghi chú</span>
            </button>
            <span className="text-[10px] text-[#8E8E93] font-mono">{selectedNote.timestamp}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <h1 className="text-[17px] font-bold text-[#FFD60A] leading-snug">
              {selectedNote.title}
            </h1>
            <div className="text-[12.5px] leading-relaxed text-[#E5E5EA] whitespace-pre-line font-sans">
              {selectedNote.content}
            </div>
          </div>
        </div>
      ) : (
        /* NOTE LIST VIEW */
        <div className="flex flex-col h-full">
          <div className="px-4 pt-3 pb-2 bg-[#000000] shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[20px] font-bold tracking-tight text-white">Ghi chú</span>
              <span className="text-[12px] font-medium text-[#FFD60A]">Sửa</span>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Tìm kiếm ghi chú"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-7 rounded-lg bg-[#1C1C1E] pl-8 pr-3 text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#FFD60A]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-10 space-y-2">
            <div className="text-[11px] font-semibold text-[#8E8E93] px-2 uppercase tracking-wider">iCloud</div>
            <div className="divide-y divide-[#2C2C2E] rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] overflow-hidden">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className="p-3 hover:bg-[#2C2C2E]/60 active:bg-[#3A3A3C] cursor-pointer transition-colors"
                >
                  <div className="text-[13px] font-bold text-white truncate">{note.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[#8E8E93] font-mono shrink-0">{note.timestamp}</span>
                    <span className="text-[11px] text-[#A1A1A6] truncate">{note.content.replace(/\n/g, ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
