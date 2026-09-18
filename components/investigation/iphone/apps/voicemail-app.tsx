'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Phone,
  Mic,
  Star,
  Clock,
  Users,
  Grid3X3,
  Play,
  Pause,
  Volume2,
  Trash2,
  PhoneCall,
  AlertCircle,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { detectiveAudio } from '@/lib/investigation-audio'

interface VoicemailAppProps {
  onBackToHome?: () => void
}

export function VoicemailApp({ onBackToHome }: VoicemailAppProps) {
  const [activeTab, setActiveTab] = useState<'recents' | 'keypad'>('recents')
  const [keypadInput, setKeypadInput] = useState('')

  interface RecentCall {
    name: string
    phone: string
    type: string
    time: string
    isMissed: boolean
    count?: number
    duration?: string
  }

  const recents: RecentCall[] = [
    // 1. Ngày 24/07/2016 (Ngày Xảy Ra Vụ Án)
    { name: 'Hà', phone: '0984.112.568', type: '↙ Gọi đến (Nhỡ)', time: '20:31', isMissed: true },
    { name: '0984.180.357', phone: '0984.180.357', type: '↙ Gọi đến', time: '20:09', isMissed: false },
    { name: '0912.331.888', phone: '0912.331.888', type: '↙ Gọi đến', time: '19:03', isMissed: false },
    { name: '0988.200.991', phone: '0988.200.991', type: '↗ Gọi đi', time: '18:15', isMissed: false },
    { name: 'Bình Còi Ba Gác', phone: '0915.223.789', type: '↙ Gọi đến', time: '18:00', isMissed: false },
    { name: 'Chị Lan Quán Nước', phone: '0932.889.102', type: '↙ Gọi đến', time: '17:30', isMissed: false },
    { name: 'Bác Bảy', phone: '0908.441.229', type: '↙ Gọi đến', time: '16:20', isMissed: false },
    { name: 'Thảo Vy', phone: '0978.552.109', type: '↙ Gọi đến', time: '14:05', isMissed: false },
    { name: 'Cơm Chị Ba', phone: '0908.334.991', type: '↗ Gọi đi', time: '11:30', isMissed: false },
    { name: 'Chú Sáu Xe Ôm', phone: '0913.667.228', type: '↗ Gọi đi', time: '10:15', isMissed: false },
    { name: 'Thảo Vy', phone: '0978.552.109', type: '↗ Gọi đi', time: '08:45', isMissed: false },

    // 2. Ngày 23/07/2016 (Ngày N-1)
    { name: 'Thảo Vy', phone: '0978.552.109', type: '↙ Gọi đến', time: '23/07 — 21:40', isMissed: false },
    { name: 'Long Sẹo', phone: '0979.441.223', type: '↗ Gọi đi', time: '23/07 — 18:10', isMissed: false },
    { name: 'Cô Sáu', phone: '0972.334.881', type: '↙ Gọi đến', time: '23/07 — 15:40', isMissed: false },
    { name: 'Thảo Vy', phone: '0978.552.109', type: '↗ Gọi đi', time: '23/07 — 12:15', isMissed: false },
    { name: 'Dũng Lò Mổ', phone: '0904.778.221', type: '↗ Gọi đi', time: '23/07 — 09:20', isMissed: false },

    // 3. Ngày 22/07/2016 Trở Về Trước
    { name: 'Thảo Vy', phone: '0978.552.109', type: '↙ Gọi đến', time: '22/07 — 22:20', isMissed: false },
    { name: 'Hà', phone: '0984.112.568', type: '↙ Gọi đến', time: '22/07 — 20:30', isMissed: false },
    { name: 'Thảo Vy', phone: '0978.552.109', type: '↙ Gọi đến (Nhỡ)', time: '22/07 — 17:45', isMissed: true },
    { name: 'Cường Mũi Két', phone: '0973.665.412', type: '↙ Gọi đến', time: '22/07 — 16:30', isMissed: false },
    { name: 'Thím Tư', phone: '0964.881.332', type: '↙ Gọi đến', time: '22/07 — 11:45', isMissed: false },
    { name: 'Bà Hai', phone: '0913.552.771', type: '↙ Gọi đến', time: '22/07 — 08:30', isMissed: false },
    { name: 'Thảo Vy', phone: '0978.552.109', type: '↗ Gọi đi', time: '21/07 — 21:15', isMissed: false },
    { name: 'Tuấn Bia 88', phone: '0945.888.188', type: '↗ Gọi đi', time: '21/07 — 19:15', isMissed: false },
    { name: 'Chị Hạnh Giặt Là', phone: '0914.556.789', type: '↙ Gọi đến', time: '21/07 — 14:00', isMissed: false },
    { name: 'Tuấn Béo Xưởng Mộc', phone: '0902.998.114', type: '↗ Gọi đi', time: '21/07 — 10:15', isMissed: false },
    { name: 'Thảo Vy', phone: '0978.552.109', type: '↙ Gọi đến', time: '20/07 — 22:50', isMissed: false },
    { name: 'Hoàng Cắt Tóc', phone: '0948.332.115', type: '↗ Gọi đi', time: '20/07 — 15:30', isMissed: false },
    { name: 'Hải Lác Bến Phà', phone: '0918.776.543', type: '↗ Gọi đi (Không được)', time: '20/07 — 09:00', isMissed: true },
    { name: 'Hùng Đen Cửu Vạn', phone: '0936.445.882', type: '↗ Gọi đi', time: '19/07 — 17:00', isMissed: false },
    { name: 'Thảo Vy', phone: '0978.552.109', type: '↗ Gọi đi', time: '19/07 — 11:30', isMissed: false },
    { name: 'Anh Hùng Sửa Nước', phone: '0988.665.123', type: '↙ Gọi đến', time: '19/07 — 10:10', isMissed: false },
    { name: 'Cô Mai Thuốc Tây', phone: '0962.771.889', type: '↗ Gọi đi', time: '18/07 — 21:00', isMissed: false },
    { name: 'Thảo Vy', phone: '0978.552.109', type: '↙ Gọi đến', time: '18/07 — 20:45', isMissed: false },
    { name: 'Thắng Sửa Xe', phone: '0977.112.445', type: '↙ Gọi đến', time: '18/07 — 14:20', isMissed: false }
  ]

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {/* Top Header */}
      <div className="px-4 pt-3 pb-2 bg-[#000000] shrink-0 border-b border-[#1C1C1E]">
        <div className="flex items-center justify-between">
          {onBackToHome ? (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-0.5 text-[#0A84FF] text-[12.5px] font-medium hover:opacity-80 active:opacity-60 cursor-pointer"
              title="Thoát ứng dụng về Màn hình chính"
            >
              <ChevronLeft className="size-4" />
              <span>Trang chính</span>
            </button>
          ) : (
            <span className="w-12" />
          )}
          <span className="text-[17px] font-bold tracking-tight text-white">
            {activeTab === 'recents' ? 'Gần đây' : 'Bàn phím'}
          </span>
          <span className="text-[12px] font-medium text-[#0A84FF]">Sửa</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 pb-14">
        {/* RECENTS TAB */}
        {activeTab === 'recents' && (
          <div className="divide-y divide-[#1C1C1E]">
            {recents.map((call, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between px-1">
                <div>
                  <div className={cn('text-[13px] font-semibold', call.isMissed ? 'text-[#FF453A]' : 'text-white')}>
                    {call.name} {call.count != null && call.count > 1 && `(${call.count})`}
                  </div>
                  <div className="text-[10px] text-[#8E8E93]">{call.type}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#8E8E93] font-mono">{call.time}</div>
                  {call.duration && <div className="text-[9px] text-[#636366] font-mono">{call.duration}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KEYPAD TAB */}
        {activeTab === 'keypad' && (
          <div className="flex flex-col items-center justify-center pt-4 space-y-4">
            <div className="h-9 text-[22px] font-mono tracking-widest text-white">{keypadInput || ' '}</div>
            <div className="grid grid-cols-3 gap-3.5 max-w-[210px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                <button
                  key={k}
                  onClick={() => setKeypadInput((p) => (p.length < 11 ? p + k : p))}
                  className="size-14 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] active:bg-[#545458] text-white text-[20px] font-medium flex items-center justify-center transition-colors shadow cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>
            {keypadInput && (
              <button
                onClick={() => setKeypadInput('')}
                className="text-[11px] text-[#0A84FF] font-medium pt-1 cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Phone Tabs */}
      <div className="h-12 bg-[#161618]/90 backdrop-blur-md border-t border-[#2C2C2E] grid grid-cols-2 items-center px-8 shrink-0 text-[#8E8E93]">
        <button
          onClick={() => setActiveTab('recents')}
          className={cn('flex flex-col items-center gap-0.5 cursor-pointer', activeTab === 'recents' && 'text-[#0A84FF]')}
        >
          <Clock className="size-4" />
          <span className="text-[9px]">Gần đây</span>
        </button>
        <button
          onClick={() => setActiveTab('keypad')}
          className={cn('flex flex-col items-center gap-0.5 cursor-pointer', activeTab === 'keypad' && 'text-[#0A84FF]')}
        >
          <Grid3X3 className="size-4" />
          <span className="text-[9px]">Bàn phím</span>
        </button>
      </div>
    </div>
  )
}
