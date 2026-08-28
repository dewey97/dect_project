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
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function VoicemailApp() {
  const [activeTab, setActiveTab] = useState<'voicemail' | 'recents' | 'keypad'>('voicemail')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>('vm-01')
  const [keypadInput, setKeypadInput] = useState('')

  // Simulated playback timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 5
        })
      }, 700)
    }
    return () => clearInterval(timer)
  }, [isPlaying])

  const togglePlay = () => {
    if (!isPlaying && playbackProgress >= 100) {
      setPlaybackProgress(0)
    }
    setIsPlaying(!isPlaying)
  }

  const voicemails = [
    {
      id: 'vm-01',
      sender: 'Trần Thị Hà',
      phone: '0912.481.xxx',
      time: '20:32 (24/07)',
      duration: '0:14',
      transcript:
        '"Anh Khang à, sao em gọi mãi anh không nghe máy? Thôi nếu anh mệt thì ngủ sớm đi nhé, mai em sang..."',
      audioClue:
        '⚠️ Tạp âm nền lọt tiếng còi tàu hỏa diesel hú 2 hồi dài và tiếng chuông rào chắn đường sắt leng keng (Khoảng cách < 30m).'
    },
    {
      id: 'vm-02',
      sender: 'Lê Quang Vũ',
      phone: '0903.114.xxx',
      time: '19:20 (24/07)',
      duration: '0:08',
      transcript:
        '"Khang, nghe máy đi! Đừng có ép tôi vào đường cùng như thế!"',
      audioClue: 'Tạp âm tiếng xe cộ đường phố đông đúc.'
    }
  ]

  const recents = [
    { name: '0919.332.xxx (Số lạ)', type: 'Nhỡ', time: '20:55', count: 1, isMissed: true },
    { name: 'Trần Thị Hà', type: 'Nhỡ', time: '20:31', count: 3, isMissed: true },
    { name: 'Lê Quang Vũ', type: 'Nhỡ', time: '19:20', count: 1, isMissed: true },
    { name: 'Trần Ngọc Mai', type: 'Cuộc gọi đến', time: '18:30', duration: '1:45', isMissed: false },
    { name: 'Tuấn "Bia"', type: 'Cuộc gọi đi', time: '17:15', duration: '0:32', isMissed: false },
  ]

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {/* Top Header */}
      <div className="px-4 pt-3 pb-2 bg-[#000000] shrink-0 border-b border-[#1C1C1E]">
        <div className="flex items-center justify-between">
          <span className="text-[20px] font-bold tracking-tight text-white">
            {activeTab === 'voicemail' && 'Thư thoại'}
            {activeTab === 'recents' && 'Gần đây'}
            {activeTab === 'keypad' && 'Bàn phím'}
          </span>
          <span className="text-[12px] font-medium text-[#0A84FF]">Sửa</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 pb-14">
        {/* VOICEMAIL TAB */}
        {activeTab === 'voicemail' && (
          <div className="space-y-3">
            {voicemails.map((vm) => {
              const isExpanded = expandedId === vm.id
              return (
                <div
                  key={vm.id}
                  className="rounded-xl border border-[#2C2C2E] bg-[#1C1C1E]/80 overflow-hidden transition-all"
                >
                  {/* Item Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : vm.id)}
                    className="p-3 cursor-pointer hover:bg-[#2C2C2E]/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-[#0A84FF]/20 text-[#0A84FF] flex items-center justify-center">
                        <Mic className="size-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-white">{vm.sender}</div>
                        <div className="text-[10px] text-[#8E8E93]">{vm.time}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#8E8E93]">{vm.duration}</span>
                  </div>

                  {/* Expanded Player */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-[#2C2C2E]/60 bg-[#161618] space-y-3">
                      {/* Transcript */}
                      <div className="p-2.5 rounded-lg bg-[#000000]/60 border border-[#2C2C2E] text-[11.5px] leading-relaxed text-[#D1D1D6] italic">
                        {vm.transcript}
                      </div>

                      {/* Waveform / Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={togglePlay}
                            className="size-8 rounded-full bg-[#0A84FF] text-white flex items-center justify-center active:scale-95 transition-transform shrink-0 shadow-md"
                          >
                            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
                          </button>

                          {/* Waveform animation */}
                          <div className="flex-1 h-7 rounded-md bg-[#2C2C2E]/60 px-2 flex items-center gap-1 overflow-hidden relative">
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-[#0A84FF]/20 border-r border-[#0A84FF] transition-all duration-300"
                              style={{ width: `${playbackProgress}%` }}
                            />
                            {[40, 70, 90, 30, 80, 100, 50, 85, 60, 45, 95, 75, 50, 80, 60, 30, 90, 100, 70, 40].map(
                              (h, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    'w-1 rounded-full bg-[#8E8E93] transition-all',
                                    isPlaying && 'animate-pulse bg-[#0A84FF]'
                                  )}
                                  style={{ height: `${h * 0.2}px` }}
                                />
                              )
                            )}
                          </div>

                          <Volume2 className="size-4 text-[#8E8E93] shrink-0" />
                        </div>

                        <div className="flex justify-between text-[9px] font-mono text-[#8E8E93] px-1">
                          <span>0:0{Math.floor((playbackProgress / 100) * 14)}</span>
                          <span>{vm.duration}</span>
                        </div>
                      </div>

                      {/* Forensic Audio Note */}
                      <div className="p-2 rounded bg-[#FF453A]/10 border border-[#FF453A]/30 text-[10.5px] text-[#FF453A] leading-normal flex items-start gap-1.5">
                        <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                        <span>{vm.audioClue}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* RECENTS TAB */}
        {activeTab === 'recents' && (
          <div className="divide-y divide-[#1C1C1E]">
            {recents.map((call, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between px-1">
                <div>
                  <div className={cn('text-[13px] font-semibold', call.isMissed ? 'text-[#FF453A]' : 'text-white')}>
                    {call.name} {call.count > 1 && `(${call.count})`}
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
                  className="size-14 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] active:bg-[#545458] text-white text-[20px] font-medium flex items-center justify-center transition-colors shadow"
                >
                  {k}
                </button>
              ))}
            </div>
            {keypadInput && (
              <button
                onClick={() => setKeypadInput('')}
                className="text-[11px] text-[#0A84FF] font-medium pt-1"
              >
                Xóa
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Phone Tabs */}
      <div className="h-12 bg-[#161618]/90 backdrop-blur-md border-t border-[#2C2C2E] grid grid-cols-3 items-center px-4 shrink-0 text-[#8E8E93]">
        <button
          onClick={() => setActiveTab('recents')}
          className={cn('flex flex-col items-center gap-0.5', activeTab === 'recents' && 'text-[#0A84FF]')}
        >
          <Clock className="size-4" />
          <span className="text-[9px]">Gần đây</span>
        </button>
        <button
          onClick={() => setActiveTab('keypad')}
          className={cn('flex flex-col items-center gap-0.5', activeTab === 'keypad' && 'text-[#0A84FF]')}
        >
          <Grid3X3 className="size-4" />
          <span className="text-[9px]">Bàn phím</span>
        </button>
        <button
          onClick={() => setActiveTab('voicemail')}
          className={cn('flex flex-col items-center gap-0.5 relative', activeTab === 'voicemail' && 'text-[#0A84FF]')}
        >
          <Mic className="size-4" />
          <span className="text-[9px]">Thư thoại</span>
          <span className="absolute -top-1 right-5 size-2 bg-[#FF453A] rounded-full" />
        </button>
      </div>
    </div>
  )
}
