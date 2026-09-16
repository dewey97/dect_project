'use client'

import { useState } from 'react'
import { FileText, ArrowLeft, ChevronLeft, Search, Lock, Unlock, Folder } from 'lucide-react'
import type { Document } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NotesAppProps {
  notes: Document[]
  onBackToHome?: () => void
}

interface RichNote extends Document {
  isLocked?: boolean
  pinCode?: string
  hint?: string
  folder?: string
}

export function NotesApp({ notes, onBackToHome }: NotesAppProps) {
  const [selectedNote, setSelectedNote] = useState<RichNote | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [unlockedNoteIds, setUnlockedNoteIds] = useState<string[]>([])

  const defaultNotes: RichNote[] = [
    {
      id: 'n-01',
      title: 'Sổ nợ bốc họ & Lãi ngoài tháng 7/2016',
      content: '1. Lê Quang Vũ (Đo đạc): 350.000.000đ — Lãi tính 3.000đ/triệu/ngày. Đã hẹn tối 24/7 sang chốt dứt điểm.\n2. Nam "Còi": 80.000.000đ — Quá hạn 2 tháng.\n3. Hưng đồ gỗ: 120.000.000đ.',
      meta: '24/07/2016',
      timestamp: '24/07/2016',
      folder: 'Tài chính & Nợ'
    },
    {
      id: 'n-02',
      title: 'Kế hoạch đền bù đất Bờ Sông (Thửa 2021-BS14)',
      content: 'Diện tích gốc: 75m2.\nBắt thằng Vũ vẽ lại trích đo lên 120m2 để ăn tiền đền bù đợt 1 Ban QLDA.\nTờ di chúc ông nội đã sửa xong ngày, con Mai không có cửa tranh.',
      meta: '22/07/2016',
      timestamp: '22/07/2016',
      folder: 'Công việc Bờ Sông'
    },
    {
      id: 'n-03',
      title: '🔒 MẬT KHẨU TÀI KHOẢN & VÉ MÁY BAY CHẠY TRỐN',
      content: '1. Mã cọc Tour Đà Lạt (25/7): VNB-98102 (Đón Nội Bài 06:30 sáng).\n2. Mật khẩu két sắt nhà trọ: 1988 (Năm sinh Vy).\n3. Tài khoản Vietcombank phụ: 00110029104 (Đã gửi 150tr cho Vy giữ trước).\n4. Nếu Vũ không nhượng bộ trích đo: Tung chứng cứ bốc họ lên công an huyện.',
      meta: '24/07/2016',
      timestamp: '24/07/2016 18:10',
      isLocked: true,
      pinCode: '2407',
      hint: 'Mật khẩu là Ngày/Tháng định mệnh (4 chữ số: DDMM)',
      folder: 'Bảo mật'
    }
  ]

  const allNotes: RichNote[] = notes.length > 0 ? (notes as RichNote[]) : defaultNotes

  const filteredNotes = allNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedNote && pinInput === selectedNote.pinCode) {
      setUnlockedNoteIds((prev) => [...prev, selectedNote.id])
      setPinError(false)
      setPinInput('')
    } else {
      setPinError(true)
      setPinInput('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {selectedNote ? (
        /* NOTE DETAIL VIEW */
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between px-3 pt-2 pb-2 bg-[#161618] border-b border-[#2C2C2E] shrink-0">
            <button
              onClick={() => {
                setSelectedNote(null)
                setPinError(false)
                setPinInput('')
              }}
              className="flex items-center gap-0.5 text-[#FFD60A] text-[13px] font-medium active:opacity-60"
            >
              <ArrowLeft className="size-4" />
              <span>Ghi chú</span>
            </button>
            <span className="text-[10px] text-[#8E8E93] font-mono">{selectedNote.timestamp || selectedNote.meta}</span>
          </div>

          {selectedNote.isLocked && !unlockedNoteIds.includes(selectedNote.id) ? (
            /* PIN UNLOCK CHALLENGE VIEW */
            <div className="flex-1 p-5 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="size-14 rounded-full bg-[#FFD60A]/20 text-[#FFD60A] flex items-center justify-center border border-[#FFD60A]/40 shadow-lg animate-pulse">
                <Lock className="size-7" />
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-white">Ghi chú bị khóa</h3>
                <p className="text-[11px] text-[#8E8E93] mt-1 max-w-[220px]">
                  {selectedNote.hint || 'Nhập mã PIN 4 chữ số để xem nội dung mật này.'}
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-3 w-full max-w-[200px]">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center text-[22px] tracking-[0.5em] font-mono h-11 rounded-xl bg-[#1C1C1E] border border-[#3A3A3C] text-[#FFD60A] focus:outline-none focus:border-[#FFD60A]"
                />
                {pinError && (
                  <div className="text-[10.5px] text-[#FF453A] font-medium">Mật khẩu sai! Hãy kiểm tra gợi ý.</div>
                )}
                <button
                  type="submit"
                  className="w-full h-9 rounded-xl bg-[#FFD60A] text-black font-bold text-[12px] active:scale-95 transition-transform cursor-pointer"
                >
                  Mở khóa
                </button>
              </form>
            </div>
          ) : (
            /* UNLOCKED / PUBLIC NOTE CONTENT */
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-[#FFD60A]">
                {selectedNote.isLocked && <Unlock className="size-4 shrink-0 text-[#30D158]" />}
                <h1 className="text-[17px] font-bold leading-snug">
                  {selectedNote.title}
                </h1>
              </div>
              <div className="text-[12.5px] leading-relaxed text-[#E5E5EA] whitespace-pre-line font-sans p-3 rounded-xl bg-[#1C1C1E]/60 border border-white/5">
                {selectedNote.content}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* NOTE LIST VIEW */
        <div className="flex flex-col h-full">
          <div className="px-4 pt-3 pb-2 bg-[#000000] shrink-0">
            <div className="flex items-center justify-between mb-2">
              {onBackToHome ? (
                <button
                  onClick={onBackToHome}
                  className="flex items-center gap-0.5 text-[#FFD60A] text-[12.5px] font-medium hover:opacity-80 active:opacity-60 cursor-pointer"
                  title="Thoát ứng dụng về Màn hình chính"
                >
                  <ChevronLeft className="size-4" />
                  <span>Trang chính</span>
                </button>
              ) : (
                <span className="w-12" />
              )}
              <span className="text-[17px] font-bold tracking-tight text-white">Ghi chú</span>
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

          <div className="flex-1 overflow-y-auto px-2 pb-10 space-y-3">
            <div className="text-[11px] font-semibold text-[#8E8E93] px-2 uppercase tracking-wider flex items-center gap-1">
              <Folder className="size-3 text-[#FFD60A]" /> iCloud • Thư mục Ghi chú
            </div>

            <div className="divide-y divide-[#2C2C2E] rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] overflow-hidden">
              {filteredNotes.map((note) => {
                const isLocked = note.isLocked && !unlockedNoteIds.includes(note.id)
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className="p-3 hover:bg-[#2C2C2E]/60 active:bg-[#3A3A3C] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[13px] font-bold text-white truncate flex items-center gap-1.5">
                        {note.isLocked && (
                          <Lock className={cn('size-3.5 shrink-0', isLocked ? 'text-[#FFD60A]' : 'text-[#30D158]')} />
                        )}
                        <span className="truncate">{note.title}</span>
                      </div>
                      {note.folder && (
                        <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/20 shrink-0">
                          {note.folder}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#8E8E93] font-mono shrink-0">{note.timestamp || note.meta}</span>
                      <span className="text-[11px] text-[#A1A1A6] truncate">
                        {isLocked ? '•••••••• (Ghi chú bị khóa bằng mật khẩu)' : note.content.replace(/\n/g, ' ')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
