'use client'

import { useState } from 'react'
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
  ChevronLeft,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePhoneData } from '@/lib/hooks/use-phone-data'

interface VoicemailAppProps {
  onBackToHome?: () => void
}

export function VoicemailApp({ onBackToHome }: VoicemailAppProps) {
  const [activeTab, setActiveTab] = useState<'recents' | 'keypad'>('recents')
  const [keypadInput, setKeypadInput] = useState('')

  const { data: callsData, loading, error } = usePhoneData('calls')

  const recents = callsData.map((item: any) => ({
    name: item.contact_name || item.caller_name || item.phone_number || 'Không rõ',
    phone: item.phone_number || '',
    type: item.call_type === 'INCOMING_MISSED' ? '↙ Gọi đến (Nhỡ)' : item.call_type === 'OUTGOING' ? '↗ Gọi đi' : '↙ Gọi đến',
    time: item.timestamp || item.time || '',
    isMissed: item.call_type === 'INCOMING_MISSED' || item.is_missed === 'TRUE' || item.is_missed === true,
    duration: item.duration || ''
  }))

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
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center p-6 text-[#8E8E93]">
                <Loader2 className="size-6 animate-spin mb-2 text-[#0A84FF]" />
                <span className="text-xs">Đang tải lịch sử cuộc gọi...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-xs text-red-400">Lỗi: {error}</div>
            ) : (
              <div className="divide-y divide-[#1C1C1E]">
                {recents.map((call: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between px-1">
                    <div>
                      <div className={cn('text-[13px] font-semibold', call.isMissed ? 'text-[#FF453A]' : 'text-white')}>
                        {call.name}
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
