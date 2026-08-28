'use client'

import { useState, useRef } from 'react'
import {
  Wifi,
  BatteryMedium,
  MessageSquare,
  Phone,
  Globe,
  FileText,
  Image as ImageIcon,
  Settings,
  Lock,
  Unlock,
  ChevronUp,
  CreditCard,
  MapPin,
  Users,
  Compass,
  Home,
  Terminal,
  Grid,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Device, Conversation, Photo, Document, BrowserHistory, RecoveredFile } from '@/lib/types'

// Apps
import { MessagesApp } from './apps/messages-app'
import { VoicemailApp } from './apps/voicemail-app'
import { SafariApp } from './apps/safari-app'
import { NotesApp } from './apps/notes-app'
import { PhotosApp } from './apps/photos-app'
import { BankingApp } from './apps/banking-app'
import { MapsApp } from './apps/maps-app'
import { ContactsApp } from './apps/contacts-app'

interface IPhoneFrameProps {
  device: Device
  threads: Conversation[]
  photos: Photo[]
  notes: Document[]
  history: BrowserHistory[]
  files: RecoveredFile[]
  onSwitchToForensics?: () => void
}

type IPhoneApp =
  | 'messages'
  | 'phone'
  | 'safari'
  | 'notes'
  | 'photos'
  | 'banking'
  | 'maps'
  | 'contacts'
  | 'settings'
  | null

export function IPhoneFrame({
  device,
  threads,
  photos,
  notes,
  history,
  files,
  onSwitchToForensics
}: IPhoneFrameProps) {
  const [isLocked, setIsLocked] = useState(false)
  const [activeApp, setActiveApp] = useState<IPhoneApp>(null)
  const [showAssistiveTouch, setShowAssistiveTouch] = useState(true)
  const [assistiveMenuOpen, setAssistiveMenuOpen] = useState(false)

  // AssistiveTouch Position (percentage or px)
  const [assistivePos, setAssistivePos] = useState({ x: 260, y: 380 })
  const isDraggingAssistive = useRef(false)

  // Lockscreen drag to unlock
  const lockDragStartY = useRef<number | null>(null)

  const handleLockTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    lockDragStartY.current = clientY
  }

  const handleLockTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (lockDragStartY.current === null) return
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY
    const diffY = lockDragStartY.current - clientY
    if (diffY > 50) {
      setIsLocked(false)
    }
    lockDragStartY.current = null
  }

  return (
    <div className="flex flex-col items-center justify-center py-1 sm:py-4 select-none w-full max-w-full">
      {/* iPhone Hardware Outer Shell */}
      <div className="relative w-[min(345px,94vw)] h-[min(690px,calc(100dvh-140px))] min-h-[520px] bg-[#121214] rounded-[42px] sm:rounded-[52px] p-2 sm:p-3 shadow-2xl border-[5px] sm:border-[7px] border-[#2C2C30] ring-1 ring-white/10 flex flex-col justify-between overflow-hidden">
        
        {/* Subtle Metallic Bezel Highlights */}
        <div className="absolute inset-0 rounded-[38px] sm:rounded-[46px] pointer-events-none border border-white/10" />

        {/* SCREEN CONTAINER */}
        <div className="relative w-full h-full bg-[#000000] rounded-[34px] sm:rounded-[40px] overflow-hidden flex flex-col justify-between">
          
          {/* iOS TOP STATUS BAR & DYNAMIC ISLAND */}
          <div className="relative z-30 h-8 sm:h-10 px-4 sm:px-6 flex items-center justify-between text-white text-[11px] sm:text-[12px] font-semibold tracking-tight shrink-0 bg-[#000000]">
            {/* Clock */}
            <span className="font-sans ml-0.5 sm:ml-1 text-[12px] sm:text-[13px]">20:45</span>

            {/* Dynamic Island */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1.5 sm:top-2 h-5 sm:h-6 w-20 sm:w-24 bg-[#000000] rounded-full flex items-center justify-between px-2 shadow-inner border border-white/10">
              <div className="size-2 sm:size-2.5 rounded-full bg-[#1C1C1E] border border-[#2C2C2E]" />
              <div className="size-1.5 sm:size-2 rounded-full bg-[#0A84FF]/40 animate-pulse" />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1 sm:gap-1.5 mr-0.5 sm:mr-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-white/90">5G</span>
              <Wifi className="size-2.5 sm:size-3 text-white" />
              <div className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px] text-white">
                <BatteryMedium className="size-3 sm:size-3.5 text-white fill-white" />
              </div>
            </div>
          </div>

          {/* MAIN SCREEN AREA */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            
            {/* 1. LOCK SCREEN (Drag / Swipe to unlock) */}
            {isLocked ? (
              <div
                onTouchStart={handleLockTouchStart}
                onTouchEnd={handleLockTouchEnd}
                onMouseDown={handleLockTouchStart}
                onMouseUp={handleLockTouchEnd}
                onClick={() => setIsLocked(false)}
                className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#1C1C1E] via-[#000000] to-[#0A0A0C] cursor-pointer"
              >
                {/* Lock icon & Time */}
                <div className="flex flex-col items-center pt-6 space-y-1">
                  <Lock className="size-4 text-white/60 mb-1" />
                  <span className="text-[12px] font-medium text-white/80">Thứ Sáu, 24 tháng 7</span>
                  <span className="text-[54px] font-light text-white tracking-tighter leading-none">
                    20:45
                  </span>
                </div>

                {/* Lockscreen Notifications */}
                <div className="space-y-2 max-w-[280px] mx-auto w-full">
                  <div className="p-3 rounded-2xl bg-[#1C1C1E]/85 backdrop-blur-md border border-white/10 shadow-lg animate-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between text-[11px] text-white/70 mb-1">
                      <span className="font-semibold flex items-center gap-1 text-white">
                        <MessageSquare className="size-3 text-[#30D158]" /> Tin nhắn • Yến Nhi
                      </span>
                      <span className="font-mono text-[9px]">20:40</span>
                    </div>
                    <p className="text-[11.5px] text-white/90 line-clamp-2 leading-relaxed">
                      Anh yêu nhớ book phòng view đồi thông ở Đà Lạt nhé, em chuẩn bị xong hết vali rồi đấy ❤️
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#1C1C1E]/85 backdrop-blur-md border border-white/10 shadow-lg animate-in slide-in-from-bottom-3">
                    <div className="flex items-center justify-between text-[11px] text-white/70 mb-1">
                      <span className="font-semibold flex items-center gap-1 text-[#FF453A]">
                        <Phone className="size-3 text-[#FF453A]" /> Cuộc gọi nhỡ (3)
                      </span>
                      <span className="font-mono text-[9px]">20:31</span>
                    </div>
                    <p className="text-[11.5px] text-white/90">Trần Thị Hà (đã để lại 1 thư thoại)</p>
                  </div>
                </div>

                {/* Unlock hint */}
                <div className="flex flex-col items-center pb-4 text-white/50 text-[11px] animate-bounce">
                  <ChevronUp className="size-4" />
                  <span>Vuốt lên để mở khóa</span>
                </div>
              </div>
            ) : activeApp ? (
              /* 2. ACTIVE APP RUNNING */
              <div className="flex-1 flex flex-col h-full bg-[#000000]">
                {activeApp === 'messages' && (
                  <MessagesApp threads={threads} onBackToHome={() => setActiveApp(null)} />
                )}
                {activeApp === 'phone' && <VoicemailApp />}
                {activeApp === 'safari' && <SafariApp history={history} />}
                {activeApp === 'notes' && <NotesApp notes={notes} />}
                {activeApp === 'photos' && <PhotosApp photos={photos} />}
                {activeApp === 'banking' && <BankingApp />}
                {activeApp === 'maps' && <MapsApp />}
                {activeApp === 'contacts' && <ContactsApp />}
                {activeApp === 'settings' && (
                  <div className="p-4 text-white space-y-4 font-sans">
                    <div className="text-[18px] font-bold">Cài đặt thiết bị</div>
                    <div className="p-3 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] text-[12px] space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-[#8E8E93]">Chủ sở hữu:</span>
                        <span className="font-semibold">{device.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8E8E93]">Kiểu máy:</span>
                        <span>iPhone 15 Pro (256GB)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8E8E93]">Số thuê bao:</span>
                        <span className="font-mono">0983.291.xxx</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8E8E93]">Tình trạng pháp y:</span>
                        <span className="text-[#30D158] font-bold">Đã giải mã 100%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 3. HOME SCREEN APP GRID */
              <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 bg-gradient-to-b from-[#141416] to-[#000000] overflow-hidden">
                {/* Apps Grid - 8 core apps */}
                <div className="grid grid-cols-4 gap-y-3 sm:gap-y-4 gap-x-2 pt-1 sm:pt-2">
                  {/* Messages */}
                  <button
                    onClick={() => setActiveApp('messages')}
                    className="flex flex-col items-center group active:scale-90 transition-transform"
                  >
                    <div className="relative size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#34C759] to-[#28A745] flex items-center justify-center text-white shadow-lg border border-white/20">
                      <MessageSquare className="size-5 sm:size-5.5 fill-white" />
                      <span className="absolute -top-1 -right-1 size-3.5 sm:size-4 rounded-full bg-[#FF3B30] text-white text-[8.5px] sm:text-[9.5px] font-bold flex items-center justify-center ring-2 ring-black">
                        1
                      </span>
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-medium text-white/90 mt-1">Tin nhắn</span>
                  </button>

                  {/* Phone / Voicemail */}
                  <button
                    onClick={() => setActiveApp('phone')}
                    className="flex flex-col items-center group active:scale-90 transition-transform"
                  >
                    <div className="relative size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#30D158] to-[#248A3D] flex items-center justify-center text-white shadow-lg border border-white/20">
                      <Phone className="size-5 sm:size-5.5 fill-white" />
                      <span className="absolute -top-1 -right-1 size-3.5 sm:size-4 rounded-full bg-[#FF3B30] text-white text-[8.5px] sm:text-[9.5px] font-bold flex items-center justify-center ring-2 ring-black">
                        3
                      </span>
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-medium text-white/90 mt-1">Điện thoại</span>
                  </button>

                  {/* Safari */}
                  <button
                    onClick={() => setActiveApp('safari')}
                    className="flex flex-col items-center group active:scale-90 transition-transform"
                  >
                    <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#0A84FF] to-[#0066CC] flex items-center justify-center text-white shadow-lg border border-white/20">
                      <Globe className="size-5 sm:size-5.5" />
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-medium text-white/90 mt-1">Safari</span>
                  </button>

                  {/* Notes */}
                  <button
                    onClick={() => setActiveApp('notes')}
                    className="flex flex-col items-center group active:scale-90 transition-transform"
                  >
                    <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#FFD60A] to-[#D4A800] flex items-center justify-center text-black shadow-lg border border-white/20">
                      <FileText className="size-5 sm:size-5.5" />
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-medium text-white/90 mt-1">Ghi chú</span>
                  </button>

                  {/* Photos */}
                  <button
                    onClick={() => setActiveApp('photos')}
                    className="flex flex-col items-center group active:scale-90 transition-transform"
                  >
                    <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#FF2D55] via-[#AF52DE] to-[#5856D6] flex items-center justify-center text-white shadow-lg border border-white/20">
                      <ImageIcon className="size-5 sm:size-5.5" />
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-medium text-white/90 mt-1">Ảnh</span>
                  </button>

                  {/* Banking */}
                  <button
                    onClick={() => setActiveApp('banking')}
                    className="flex flex-col items-center group active:scale-90 transition-transform"
                  >
                    <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#0A84FF] via-[#30D158] to-[#1C1C1E] flex items-center justify-center text-white shadow-lg border border-white/20">
                      <CreditCard className="size-5 sm:size-5.5" />
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-medium text-white/90 mt-1">Ngân hàng</span>
                  </button>

                  {/* Maps */}
                  <button
                    onClick={() => setActiveApp('maps')}
                    className="flex flex-col items-center group active:scale-90 transition-transform"
                  >
                    <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#30D158] via-[#FF9F0A] to-[#0A84FF] flex items-center justify-center text-white shadow-lg border border-white/20">
                      <MapPin className="size-5 sm:size-5.5" />
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-medium text-white/90 mt-1">Bản đồ</span>
                  </button>

                  {/* Contacts */}
                  <button
                    onClick={() => setActiveApp('contacts')}
                    className="flex flex-col items-center group active:scale-90 transition-transform"
                  >
                    <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#5856D6] to-[#3A3A3C] flex items-center justify-center text-white shadow-lg border border-white/20">
                      <Users className="size-5 sm:size-5.5" />
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-medium text-white/90 mt-1">Danh bạ</span>
                  </button>
                </div>

                {/* iOS Glassmorphic Dock */}
                <div className="h-14 sm:h-16 rounded-[22px] sm:rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/15 px-2.5 sm:px-3 py-1 flex items-center justify-around shadow-2xl mb-0.5 sm:mb-1">
                  <button
                    onClick={() => setActiveApp('phone')}
                    className="size-10 sm:size-11 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#30D158] to-[#248A3D] flex items-center justify-center text-white active:scale-90 transition-transform shadow"
                  >
                    <Phone className="size-4.5 sm:size-5 fill-white" />
                  </button>
                  <button
                    onClick={() => setActiveApp('safari')}
                    className="size-10 sm:size-11 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#0A84FF] to-[#0066CC] flex items-center justify-center text-white active:scale-90 transition-transform shadow"
                  >
                    <Globe className="size-4.5 sm:size-5" />
                  </button>
                  <button
                    onClick={() => setActiveApp('messages')}
                    className="size-10 sm:size-11 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#34C759] to-[#28A745] flex items-center justify-center text-white active:scale-90 transition-transform shadow"
                  >
                    <MessageSquare className="size-4.5 sm:size-5 fill-white" />
                  </button>
                  <button
                    onClick={() => setActiveApp('photos')}
                    className="size-10 sm:size-11 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#FF2D55] via-[#AF52DE] to-[#5856D6] flex items-center justify-center text-white active:scale-90 transition-transform shadow"
                  >
                    <ImageIcon className="size-4.5 sm:size-5" />
                  </button>
                </div>
              </div>
            )}

            {/* 4. FLOATING ASSISTIVETOUCH (Nút Home ảo) */}
            {showAssistiveTouch && !isLocked && (
              <>
                {/* AssistiveTouch Button */}
                <button
                  onClick={() => setAssistiveMenuOpen(!assistiveMenuOpen)}
                  style={{ left: `${assistivePos.x}px`, top: `${assistivePos.y}px` }}
                  className="absolute z-50 size-11 rounded-full bg-black/70 backdrop-blur-md border border-white/30 shadow-2xl flex items-center justify-center cursor-pointer active:scale-90 transition-transform group"
                >
                  <div className="size-7 rounded-full bg-white/40 group-hover:bg-white/70 border border-white/60 flex items-center justify-center">
                    <div className="size-3.5 rounded-full bg-white shadow" />
                  </div>
                </button>

                {/* AssistiveTouch Popup Menu */}
                {assistiveMenuOpen && (
                  <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
                    <div className="relative w-[210px] rounded-3xl bg-[#1C1C1E]/95 border border-white/20 p-4 shadow-2xl space-y-3">
                      <div className="text-[11px] font-bold text-center text-white/90">
                        ASSISTIVE TOUCH
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => {
                            setActiveApp(null)
                            setAssistiveMenuOpen(false)
                          }}
                          className="p-3 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors"
                        >
                          <Home className="size-5 text-[#0A84FF]" />
                          <span className="text-[9.5px]">Màn hình chính</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsLocked(true)
                            setAssistiveMenuOpen(false)
                          }}
                          className="p-3 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors"
                        >
                          <Lock className="size-5 text-[#FF9F0A]" />
                          <span className="text-[9.5px]">Khóa máy</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveApp('messages')
                            setAssistiveMenuOpen(false)
                          }}
                          className="p-3 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors"
                        >
                          <MessageSquare className="size-5 text-[#30D158]" />
                          <span className="text-[9.5px]">Tin nhắn</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onSwitchToForensics) onSwitchToForensics()
                            setAssistiveMenuOpen(false)
                          }}
                          className="p-3 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors"
                        >
                          <Terminal className="size-5 text-[#AF52DE]" />
                          <span className="text-[9.5px]">Bảng Pháp y</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setAssistiveMenuOpen(false)}
                        className="w-full py-1.5 text-[11px] text-[#8E8E93] hover:text-white font-medium text-center"
                      >
                        Đóng Menu
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* iOS HOME INDICATOR BAR */}
          <div
            onClick={() => {
              if (activeApp) setActiveApp(null)
              else setIsLocked(!isLocked)
            }}
            className="relative z-30 h-6 flex items-center justify-center cursor-pointer group shrink-0 bg-[#000000]"
          >
            <div className="h-1 w-28 bg-white/40 group-hover:bg-white rounded-full transition-colors active:scale-95" />
          </div>
        </div>
      </div>

      {/* Under-phone Control Instructions */}
      <div className="flex items-center gap-2 mt-3 text-[11px] text-muted-foreground font-mono">
        <button
          onClick={() => setIsLocked(!isLocked)}
          className="flex items-center gap-1 hover:text-primary transition-colors border border-border/60 rounded px-2 py-1 bg-card/40"
        >
          {isLocked ? <Unlock className="size-3" /> : <Lock className="size-3" />}
          <span>{isLocked ? 'Mở khóa' : 'Khóa máy'}</span>
        </button>
        <button
          onClick={() => setShowAssistiveTouch(!showAssistiveTouch)}
          className="hover:text-primary transition-colors border border-border/60 rounded px-2 py-1 bg-card/40"
        >
          {showAssistiveTouch ? 'Ẩn Home ảo' : 'Bật Home ảo'}
        </button>
        {activeApp && (
          <button
            onClick={() => setActiveApp(null)}
            className="hover:text-primary transition-colors border border-border/60 rounded px-2 py-1 bg-card/40"
          >
            Về Home
          </button>
        )}
      </div>
    </div>
  )
}
