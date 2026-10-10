'use client'

import { useState } from 'react'
import {
  Phone,
  Clock,
  Grid3X3,
  ChevronLeft,
  Loader2,
  Delete,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePhoneData } from '@/lib/hooks/use-phone-data'

interface VoicemailAppProps {
  onBackToHome?: () => void
}

const KEYPAD_BUTTONS = [
  { num: '1', sub: '' },
  { num: '2', sub: 'A B C' },
  { num: '3', sub: 'D E F' },
  { num: '4', sub: 'G H I' },
  { num: '5', sub: 'J K L' },
  { num: '6', sub: 'M N O' },
  { num: '7', sub: 'P Q R S' },
  { num: '8', sub: 'T U V' },
  { num: '9', sub: 'W X Y Z' },
  { num: '*', sub: '' },
  { num: '0', sub: '+' },
  { num: '#', sub: '' },
]

export function VoicemailApp({ onBackToHome }: VoicemailAppProps) {
  const [activeTab, setActiveTab] = useState<'recents' | 'keypad'>('recents')
  const [keypadInput, setKeypadInput] = useState('')

  const { data: callsData, loading, error } = usePhoneData('calls')

  const recents = callsData.map((item: any) => ({
    name: item.contact_name || item.caller_name || item.phone_number || 'Không rõ',
    phone: item.phone_number || '',
    type: item.call_type === 'INCOMING_MISSED' ? 'Cuộc gọi nhỡ' : item.call_type === 'OUTGOING' ? 'Cuộc gọi đi' : 'Cuộc gọi đến',
    time: item.timestamp || item.time || '',
    isMissed: item.call_type === 'INCOMING_MISSED' || item.is_missed === 'TRUE' || item.is_missed === true,
    duration: item.duration || ''
  }))

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {/* Top Header */}
      <div className="px-3 pt-2.5 pb-2 bg-[#000000] shrink-0 border-b border-[#1C1C1E]">
        <div className="flex items-center justify-between">
          {onBackToHome ? (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-0.5 text-[#0A84FF] text-[13px] font-medium hover:opacity-80 active:opacity-60 cursor-pointer"
              title="Thoát ứng dụng về Màn hình chính"
            >
              <ChevronLeft className="size-4" />
              <span>Trang chính</span>
            </button>
          ) : (
            <span className="w-12" />
          )}
          <span className="text-[17px] font-semibold tracking-tight text-white">
            {activeTab === 'recents' ? 'Gần đây' : 'Bàn phím'}
          </span>
          <span className="text-[13px] font-medium text-[#0A84FF]">Sửa</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-1 pb-12">
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
                  <div key={idx} className="py-2.5 flex items-center justify-between px-1 hover:bg-[#1C1C1E]/40 rounded-lg">
                    <div>
                      <div className={cn('text-[14px] font-semibold', call.isMissed ? 'text-[#FF453A]' : 'text-white')}>
                        {call.name}
                      </div>
                      <div className="text-[11px] text-[#8E8E93]">{call.type}</div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <div className="text-[11px] text-[#8E8E93] font-sans">{call.time}</div>
                        {call.duration && <div className="text-[9.5px] text-[#636366] font-sans">{call.duration}</div>}
                      </div>
                      <Info className="size-4 text-[#0A84FF] opacity-80" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KEYPAD TAB */}
        {activeTab === 'keypad' && (
          <div className="flex flex-col items-center justify-center pt-2 space-y-3">
            <div className="h-8 text-[24px] font-light tracking-wider text-white text-center font-sans">
              {keypadInput || ' '}
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-2.5 max-w-[230px]">
              {KEYPAD_BUTTONS.map((k) => (
                <button
                  key={k.num}
                  onClick={() => setKeypadInput((p) => (p.length < 13 ? p + k.num : p))}
                  className="size-[58px] rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] active:bg-[#545458] text-white flex flex-col items-center justify-center transition-colors shadow-sm cursor-pointer"
                >
                  <span className="text-[23px] font-light leading-none">{k.num}</span>
                  {k.sub && (
                    <span className="text-[7.5px] font-bold tracking-widest text-[#AEAEB2] mt-0.5 leading-none">
                      {k.sub}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bottom Row with Green Call Button */}
            <div className="grid grid-cols-3 gap-x-4 items-center max-w-[230px] pt-1">
              <div />
              <button
                onClick={() => {}}
                className="size-[58px] rounded-full bg-[#34C759] hover:bg-[#30D158] active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform cursor-pointer mx-auto"
                title="Gọi"
              >
                <Phone className="size-7 fill-current" />
              </button>
              {keypadInput ? (
                <button
                  onClick={() => setKeypadInput((p) => p.slice(0, -1))}
                  className="p-2 text-[#8E8E93] hover:text-white active:opacity-60 flex items-center justify-center cursor-pointer"
                  title="Xóa"
                >
                  <Delete className="size-6" />
                </button>
              ) : (
                <div />
              )}
            </div>
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
          <span className="text-[10px]">Gần đây</span>
        </button>
        <button
          onClick={() => setActiveTab('keypad')}
          className={cn('flex flex-col items-center gap-0.5 cursor-pointer', activeTab === 'keypad' && 'text-[#0A84FF]')}
        >
          <Grid3X3 className="size-4" />
          <span className="text-[10px]">Bàn phím</span>
        </button>
      </div>
    </div>
  )
}
