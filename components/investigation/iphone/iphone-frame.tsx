'use client'

import { useState, useRef } from 'react'
import {
  Lock,
  Unlock,
  Home,
  Eye,
  EyeOff,
  Smartphone,
  Fingerprint,
  ShieldCheck,
  Phone,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Device, Conversation, Photo, Document, BrowserHistory, RecoveredFile } from '@/lib/types'

// Apps
import { MessagesApp } from './apps/messages-app'
import { VoicemailApp } from './apps/voicemail-app'
import { SafariApp } from './apps/safari-app'
import { NotesApp } from './apps/notes-app'
import { PhotosApp } from './apps/photos-app'
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
  const [frameless, setFrameless] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  const [activeApp, setActiveApp] = useState<IPhoneApp>(null)
  const [showAssistiveTouch, setShowAssistiveTouch] = useState(true)
  const [assistiveMenuOpen, setAssistiveMenuOpen] = useState(false)

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
    <div className="w-full h-full flex flex-col items-center justify-center select-none overflow-hidden py-0 sm:py-1">
      {/* Top Quick Control Bar (Desktop controls only) */}
      <div
        className={cn(
          "items-center justify-between w-full max-w-[390px] px-2 text-[11px] font-mono shrink-0 hidden sm:flex mb-1"
        )}
      >
        <div className="flex items-center gap-1.5">
          {/* Lock / Unlock Screen */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all active:scale-95 shadow-sm cursor-pointer",
              isLocked
                ? "bg-[#30D158]/15 text-[#30D158] border-[#30D158]/40 font-semibold hover:bg-[#30D158]/25"
                : "bg-[#1C1C1E] text-zinc-300 hover:text-white border-white/10 hover:border-white/20"
            )}
            title={isLocked ? "Bấm để Mở khóa màn hình" : "Bấm để Khóa màn hình"}
          >
            {isLocked ? <Unlock className="size-3 text-[#30D158]" /> : <Lock className="size-3 text-[#FF453A]" />}
            <span>{isLocked ? 'Mở khóa' : 'Khóa máy'}</span>
          </button>

          {/* AssistiveTouch Toggle */}
          <button
            onClick={() => setShowAssistiveTouch(!showAssistiveTouch)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg border transition-all active:scale-95 shadow-sm cursor-pointer",
              showAssistiveTouch
                ? "bg-[#0A84FF]/15 text-[#0A84FF] border-[#0A84FF]/40 font-medium hover:bg-[#0A84FF]/25"
                : "bg-[#1C1C1E] text-zinc-400 hover:text-zinc-200 border-white/10 hover:border-white/20"
            )}
            title={showAssistiveTouch ? "Ẩn nút Home ảo (AssistiveTouch)" : "Hiện nút Home ảo (AssistiveTouch)"}
          >
            {showAssistiveTouch ? <EyeOff className="size-3 text-[#0A84FF]" /> : <Eye className="size-3 text-zinc-400" />}
            <span>{showAssistiveTouch ? 'Home ảo' : 'Bật Home'}</span>
          </button>

          {/* Frameless vs Framed Toggle */}
          <button
            onClick={() => setFrameless(!frameless)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg border transition-all active:scale-95 shadow-sm cursor-pointer",
              frameless
                ? "bg-[#AF52DE]/15 text-[#AF52DE] border-[#AF52DE]/40 font-medium hover:bg-[#AF52DE]/25"
                : "bg-[#1C1C1E] text-zinc-400 hover:text-zinc-200 border-white/10 hover:border-white/20"
            )}
            title="Chuyển đổi giữa Chế độ Tràn viền và Khung máy cổ điển"
          >
            <Smartphone className="size-3 text-[#AF52DE]" />
            <span>{frameless ? 'Tràn viền' : 'Khung'}</span>
          </button>
        </div>

        {activeApp && (
          <button
            onClick={() => setActiveApp(null)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#0A84FF]/40 bg-[#0A84FF]/15 text-[#0A84FF] hover:bg-[#0A84FF]/25 active:scale-95 font-semibold transition-all shadow-sm cursor-pointer ml-auto"
            title="Thoát ứng dụng về Màn hình chính"
          >
            <Home className="size-3" />
            <span>Về Home</span>
          </button>
        )}
      </div>

      {/* PHONE CONTAINER: Exact iOS 7 Point Ratio (320:568 = 9:16) */}
      <div
        className={cn(
          "relative w-full h-full max-h-[770px] sm:w-[390px] aspect-[320/568] transition-all flex flex-col justify-between overflow-hidden shadow-2xl shrink-0 my-auto",
          frameless
            ? "bg-black rounded-none sm:rounded-[36px] border-0 sm:border sm:border-white/20"
            : "bg-[#121214] rounded-none sm:rounded-[44px] p-0 sm:p-2.5 border-0 sm:border-[8px] border-[#2C2C30] ring-1 ring-white/10"
        )}
      >
        {!frameless && (
          <>
            {/* Hardware Sleep / Lock Button */}
            <button
              onClick={() => setIsLocked(!isLocked)}
              title={isLocked ? "Nút Nguồn vật lý: Bấm để Mở khóa" : "Nút Nguồn vật lý: Bấm để Khóa máy"}
              className="absolute -right-[7px] sm:-right-[9px] top-24 w-2 sm:w-2.5 h-12 sm:h-14 bg-[#3A3A3C] hover:bg-[#0A84FF] active:bg-[#0A84FF] rounded-r-md cursor-pointer border-y border-r border-white/20 shadow-md transition-colors z-30 group flex items-center justify-center"
            >
              <span className="sr-only">Nút Nguồn vật lý</span>
            </button>

            {/* Hardware Volume Buttons */}
            <div className="absolute -left-[6px] sm:-left-[8px] top-20 w-1.5 sm:w-2 h-6 bg-[#2C2C2E] rounded-l-sm border-y border-l border-white/20" />
            <div className="absolute -left-[6px] sm:-left-[8px] top-30 w-1.5 sm:w-2 h-9 bg-[#3A3A3C] rounded-l-md border-y border-l border-white/20" />
            <div className="absolute -left-[6px] sm:-left-[8px] top-42 w-1.5 sm:w-2 h-9 bg-[#3A3A3C] rounded-l-md border-y border-l border-white/20" />

            {/* Subtle Metallic Bezel Highlights */}
            <div className="absolute inset-0 rounded-[38px] sm:rounded-[42px] pointer-events-none border border-white/10" />
          </>
        )}

        {/* SCREEN CONTAINER (Uses Authentic iOS 7 Wallpaper) */}
        <div
          className={cn(
            "relative w-full h-full bg-[#09111e] bg-[url('/images/ios7_wallpaper.jpg')] bg-cover bg-center overflow-hidden flex flex-col justify-between",
            !frameless && "rounded-[34px] sm:rounded-[38px]"
          )}
        >
          {/* iOS TOP STATUS BAR (Exact 20pt Status Bar Height) */}
          <div className="relative z-30 h-6 px-3 flex items-center justify-between text-white text-[11px] font-sans tracking-tight shrink-0 bg-transparent select-none pt-1">
            {/* Left: No Service (0 Signal Dots / Offline) */}
            <div className="flex items-center gap-1.5" title="Trạng thái mạng: Không có dịch vụ">
              <div className="flex items-center gap-[2.5px]">
                <span className="size-1.5 rounded-full border border-white/60 inline-block" />
                <span className="size-1.5 rounded-full border border-white/60 inline-block" />
                <span className="size-1.5 rounded-full border border-white/60 inline-block" />
                <span className="size-1.5 rounded-full border border-white/60 inline-block" />
                <span className="size-1.5 rounded-full border border-white/60 inline-block" />
              </div>
              <span className="font-medium text-[10px] text-white/90 ml-0.5">Không có dịch vụ</span>
            </div>

            {/* Center: Clock 20:45 */}
            <div className="absolute left-1/2 -translate-x-1/2 font-semibold text-[11.5px] text-white tracking-tight">
              20:45
            </div>

            {/* Right: Solid White Battery Icon (18% Low Battery) */}
            <div className="flex items-center gap-1 text-white font-semibold">
              <span className="text-[9px] font-mono text-[#FF453A] font-bold">18%</span>
              <div className="w-5 h-2.5 rounded-[3px] border border-[#FF453A] p-[1px] relative flex items-center shadow-sm">
                <div className="h-full w-[18%] bg-[#FF453A] rounded-[1px]" />
                <div className="absolute -right-[3px] top-[2px] w-[2px] h-[4px] bg-[#FF453A] rounded-r-[1px]" />
              </div>
            </div>
          </div>

          {/* MAIN SCREEN AREA */}
          <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
            
            {/* 1. LOCK SCREEN (Touch ID to unlock) */}
            {isLocked ? (
              <div
                onTouchStart={handleLockTouchStart}
                onTouchEnd={handleLockTouchEnd}
                onMouseDown={handleLockTouchStart}
                onMouseUp={handleLockTouchEnd}
                className="flex-1 flex flex-col justify-between p-5 relative overflow-hidden bg-black/30 backdrop-blur-sm"
              >
                {/* Lock icon & Time */}
                <div className="flex flex-col items-center pt-3 space-y-1 relative z-10">
                  <Lock className="size-4 text-white/80 mb-0.5" />
                  <span className="text-[12px] font-medium text-white drop-shadow">Thứ Sáu, 24 tháng 7</span>
                  <span className="text-[54px] font-light text-white tracking-tighter leading-none drop-shadow-md font-sans">
                    20:45
                  </span>
                  <span className="text-[9.5px] text-[#FF453A] font-mono bg-[#FF453A]/25 px-2.5 py-0.5 rounded-full border border-[#FF453A]/40 font-bold backdrop-blur-md shadow">
                    PIN YẾU (18%)
                  </span>
                </div>

                {/* Lockscreen Notifications */}
                <div className="space-y-2 max-w-[290px] mx-auto w-full my-auto relative z-10">
                  <div className="p-2.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 shadow-xl">
                    <div className="flex items-center justify-between text-[10.5px] text-white/70 mb-0.5">
                      <span className="font-semibold flex items-center gap-1 text-[#FF453A]">
                        <Phone className="size-3 text-[#FF453A]" /> Cuộc gọi nhỡ (1) • Hà
                      </span>
                      <span className="font-mono text-[9px]">20:31</span>
                    </div>
                    <p className="text-[11px] text-white/95">
                      Hà đã để lại 1 thư thoại (0:08)
                    </p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 shadow-xl">
                    <div className="flex items-center justify-between text-[10.5px] text-white/70 mb-0.5">
                      <span className="font-semibold flex items-center gap-1 text-white">
                        <MessageSquare className="size-3 text-[#30D158]" /> Tin nhắn • Thảo Vy
                      </span>
                      <span className="font-mono text-[9px]">20:40</span>
                    </div>
                    <p className="text-[11px] text-white/95 line-clamp-2 leading-relaxed">
                      Ok, vậy hẹn anh 9h tối ở địa chỉ cũ.
                    </p>
                  </div>
                </div>

                {/* Unlock hint */}
                <div
                  onClick={() => setIsLocked(false)}
                  className="flex flex-col items-center pb-2 text-white text-[11px] hover:text-white transition-colors cursor-pointer group relative z-10"
                >
                  <div className="size-10 rounded-full border border-white/30 bg-white/15 backdrop-blur-md flex items-center justify-center mb-1 group-hover:scale-105 group-hover:border-[#0A84FF] transition-all shadow-lg">
                    <Fingerprint className="size-5 text-[#0A84FF] animate-pulse" />
                  </div>
                  <span className="font-medium text-[10px] drop-shadow">Chạm nút Home để mở khóa Touch ID</span>
                </div>
              </div>
            ) : activeApp ? (
              /* 2. ACTIVE APP RUNNING */
              <div className="flex-1 min-h-0 flex flex-col h-full bg-black overflow-hidden">
                {activeApp === 'messages' && (
                  <MessagesApp threads={threads} onBackToHome={() => setActiveApp(null)} />
                )}
                {activeApp === 'phone' && <VoicemailApp onBackToHome={() => setActiveApp(null)} />}
                {activeApp === 'safari' && <SafariApp history={history} onBackToHome={() => setActiveApp(null)} />}
                {activeApp === 'notes' && <NotesApp notes={notes} onBackToHome={() => setActiveApp(null)} />}
                {activeApp === 'photos' && <PhotosApp photos={photos} onBackToHome={() => setActiveApp(null)} />}
                {activeApp === 'maps' && <MapsApp onBackToHome={() => setActiveApp(null)} />}
                {activeApp === 'contacts' && <ContactsApp onBackToHome={() => setActiveApp(null)} />}
                {activeApp === 'settings' && (
                  <div className="p-4 text-white space-y-4 font-sans overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-[#2C2C2E] pb-2">
                      <button
                        onClick={() => setActiveApp(null)}
                        className="flex items-center gap-0.5 text-[#0A84FF] text-[13px] font-medium cursor-pointer hover:opacity-80 active:opacity-60"
                        title="Về màn hình chính"
                      >
                        <Home className="size-4" />
                        <span>Trang chính</span>
                      </button>
                      <div className="text-[17px] font-bold">Cài đặt</div>
                      <span className="w-8" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] text-[12px] space-y-3">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Chủ sở hữu:</span>
                        <span className="font-semibold text-white">Nguyễn Văn Khang</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Kiểu máy:</span>
                        <span className="font-semibold">iPhone 6s Plus (64GB, Space Gray)</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Số thuê bao:</span>
                        <span className="font-mono text-[#0A84FF]">0904.888.666 (Viettel)</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Trạng thái mạng:</span>
                        <span className="text-[#FF453A] font-semibold">Không có dịch vụ (No Service)</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Số IMEI:</span>
                        <span className="font-mono text-[11px]">356984110294812</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Tình trạng pin:</span>
                        <span className="text-[#FF453A] font-bold">18%</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Cảm biến bảo mật:</span>
                        <span className="text-white">Touch ID</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-[#8E8E93]">Trích xuất pháp y:</span>
                        <span className="text-[#30D158] font-bold flex items-center gap-1">
                          <ShieldCheck className="size-3.5" /> Đã trích xuất dữ liệu
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 3. CLEAN REALISTIC 8-APP HOME SCREEN (100% Functional Case Apps Only) */
              <div className="flex-1 flex flex-col justify-between px-[5%] pt-3 pb-3 relative overflow-hidden select-none">
                
                {/* 8 Essential Working Case Apps Grid: 2 Rows x 4 Columns */}
                <div className="grid grid-cols-4 gap-x-[5%] gap-y-5 pt-2 relative z-10">
                  
                  {/* Row 1, Icon 1: Messages */}
                  <button
                    onClick={() => setActiveApp('messages')}
                    className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                  >
                    <div className="relative w-full aspect-square rounded-[22.5%] bg-gradient-to-b from-[#60E450] to-[#28CA36] flex items-center justify-center text-white shadow-[0_4px_10px_rgba(0,0,0,0.35)] border border-white/20">
                      <svg className="w-[60%] h-[60%] text-white fill-white" viewBox="0 0 32 32">
                        <path d="M16 4C9.37 4 4 8.7 4 14.5c0 3.32 1.77 6.27 4.54 8.21L7 27.5l5.65-2.26c1.07.31 2.2.48 3.35.48 6.63 0 12-4.7 12-10.5S22.63 4 16 4z" />
                      </svg>
                      <span className="absolute -top-[5%] -right-[5%] size-[32%] rounded-full bg-[#FF3B30] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow">
                        1
                      </span>
                    </div>
                    <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Messages
                    </span>
                  </button>

                  {/* Row 1, Icon 2: Contacts */}
                  <button
                    onClick={() => setActiveApp('contacts')}
                    className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-[22.5%] bg-gradient-to-b from-[#8E8E93] to-[#636366] flex items-center justify-center text-white shadow-[0_4px_10px_rgba(0,0,0,0.35)] border border-white/30">
                      <svg className="w-[60%] h-[60%]" viewBox="0 0 32 32" fill="currentColor">
                        <circle cx="16" cy="11" r="5" fill="white" />
                        <path d="M6 26c0-5.5 4.5-8 10-8s10 2.5 10 8" fill="white" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Contacts
                    </span>
                  </button>


                  {/* Row 1, Icon 4: Notes */}
                  <button
                    onClick={() => setActiveApp('notes')}
                    className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-[22.5%] bg-white flex flex-col justify-between overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.35)] border border-white/40">
                      <div className="w-full bg-[#FFD600] h-[22%] border-b border-dashed border-[#CCA800]" />
                      <div className="flex-1 p-2 flex flex-col gap-1.5 justify-center">
                        <div className="h-[1.5px] w-full bg-[#D1C485]" />
                        <div className="h-[1.5px] w-4/5 bg-[#D1C485]" />
                        <div className="h-[1.5px] w-3/4 bg-[#D1C485]" />
                      </div>
                    </div>
                    <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Notes
                    </span>
                  </button>

                  {/* Row 2, Icon 1: Photos */}
                  <button
                    onClick={() => setActiveApp('photos')}
                    className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-[22.5%] bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.35)] border border-white/40 relative">
                      <svg className="w-[62%] h-[62%]" viewBox="0 0 32 32">
                        <ellipse cx="16" cy="10" rx="3.5" ry="6" fill="#FF2D55" opacity="0.85" />
                        <ellipse cx="20.2" cy="11.8" rx="3.5" ry="6" fill="#FF9F0A" opacity="0.85" transform="rotate(45 20.2 11.8)" />
                        <ellipse cx="22" cy="16" rx="3.5" ry="6" fill="#FFD60A" opacity="0.85" transform="rotate(90 22 16)" />
                        <ellipse cx="20.2" cy="20.2" rx="3.5" ry="6" fill="#30D158" opacity="0.85" transform="rotate(135 20.2 20.2)" />
                        <ellipse cx="16" cy="22" rx="3.5" ry="6" fill="#64D2FF" opacity="0.85" transform="rotate(180 16 22)" />
                        <ellipse cx="11.8" cy="20.2" rx="3.5" ry="6" fill="#0A84FF" opacity="0.85" transform="rotate(225 11.8 20.2)" />
                        <ellipse cx="10" cy="16" rx="3.5" ry="6" fill="#5856D6" opacity="0.85" transform="rotate(270 10 16)" />
                        <ellipse cx="11.8" cy="11.8" rx="3.5" ry="6" fill="#AF52DE" opacity="0.85" transform="rotate(315 11.8 11.8)" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Photos
                    </span>
                  </button>

                  {/* Row 2, Icon 2: Maps */}
                  <button
                    onClick={() => setActiveApp('maps')}
                    className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-[22.5%] bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.35)] border border-white/40 relative overflow-hidden p-1.5">
                      {/* Authentic Google Maps Pin Icon */}
                      <svg className="w-full h-full" viewBox="0 0 48 48">
                        <path d="M24 4C14.06 4 6 12.06 6 22c0 13.5 18 22 18 22s18-8.5 18-22c0-9.94-8.06-18-18-18z" fill="#EA4335" />
                        <path d="M24 4C14.06 4 6 12.06 6 22c0 4.8 1.9 9.17 5 12.35l13-12.35V4z" fill="#4285F4" />
                        <path d="M24 22l13-12.35C33.9 6.47 29.2 4 24 4v18z" fill="#FBBC04" />
                        <path d="M24 22v22s18-8.5 18-22c0-4.8-1.9-9.17-5-12.35L24 22z" fill="#34A853" />
                        <circle cx="24" cy="19" r="6" fill="#FFFFFF" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Google Maps
                    </span>
                  </button>

                  {/* Row 2, Icon 3: Safari */}
                  <button
                    onClick={() => setActiveApp('safari')}
                    className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-[22.5%] bg-gradient-to-b from-[#54C5D8] to-[#0A84FF] flex items-center justify-center text-white shadow-[0_4px_10px_rgba(0,0,0,0.35)] border border-white/30 relative overflow-hidden">
                      <svg className="w-[65%] h-[65%]" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="11" stroke="white" strokeWidth="1" fill="none" />
                        <polygon points="16,6 20,16 16,14 12,16" fill="#FF3B30" />
                        <polygon points="16,26 20,16 16,18 12,16" fill="white" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Safari
                    </span>
                  </button>

                  {/* Row 2, Icon 4: Settings */}
                  <button
                    onClick={() => setActiveApp('settings')}
                    className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-[22.5%] bg-gradient-to-b from-[#C0C5CA] to-[#7F8C8D] flex items-center justify-center text-white shadow-[0_4px_10px_rgba(0,0,0,0.35)] border border-white/30">
                      <svg className="w-[60%] h-[60%] text-[#2C2C2E]" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M16 10a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8z" />
                        <path d="M28.3 14.5l-2.4-.7c-.2-.7-.5-1.4-.9-2l1.3-2.1c.4-.6.3-1.4-.2-1.9l-1.9-1.9c-.5-.5-1.3-.6-1.9-.2l-2.1 1.3c-.6-.4-1.3-.7-2-.9l-.7-2.4C17.3 3.1 16.7 2.5 16 2.5s-1.3.6-1.5 1.2l-.7 2.4c-.7.2-1.4.5-2 .9L9.7 5.7c-.6-.4-1.4-.3-1.9.2L5.9 7.8c-.5.5-.6 1.3-.2 1.9l1.3 2.1c-.4.6-.7 1.3-.9 2l-2.4.7C3.1 14.7 2.5 15.3 2.5 16s.6 1.3 1.2 1.5l2.4.7c.2.7.5 1.4.9 2l-1.3 2.1c-.4.6-.3 1.4.2 1.9l1.9 1.9c.5.5 1.3.6 1.9.2l2.1-1.3c.6.4 1.3.7 2 .9l.7 2.4c.2.6.8 1.2 1.5 1.2s1.3-.6 1.5-1.2l.7-2.4c.7-.2 1.4-.5 2-.9l2.1 1.3c.6.4 1.4.3 1.9-.2l1.9-1.9c.5-.5.6-1.3.2-1.9l-1.3-2.1c.4-.6.7-1.3.9-2l2.4-.7c.6-.2 1.2-.8 1.2-1.5s-.6-1.3-1.2-1.5z" opacity="0.85" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Settings
                    </span>
                  </button>
                </div>

                {/* AUTHENTIC iOS FROSTED CYAN GLASS DOCK */}
                <div className="w-full mx-auto h-[16.5%] rounded-[26px] bg-[#6ad1e3]/45 backdrop-blur-md border-t border-white/40 p-2 flex items-center justify-between px-[5%] shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden z-10 mt-auto mb-1">
                  {/* Glossy top highlight line */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                  {/* Dock Item 1: Phone */}
                  <button
                    onClick={() => setActiveApp('phone')}
                    className="w-[18.75%] flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                  >
                    <div className="relative w-full aspect-square rounded-[22.5%] bg-gradient-to-b from-[#60E450] to-[#28CA36] flex items-center justify-center text-white shadow-md border border-white/30">
                      <svg className="w-[55%] h-[55%] text-white fill-white" viewBox="0 0 24 24">
                        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                      <span className="absolute -top-[5%] -right-[5%] size-[32%] rounded-full bg-[#FF3B30] text-white text-[9px] font-bold flex items-center justify-center border border-white shadow">
                        3
                      </span>
                    </div>
                    <span className="text-[10px] font-normal text-white mt-0.5 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Phone
                    </span>
                  </button>

                  {/* Dock Item 2: Messages */}
                  <button
                    onClick={() => setActiveApp('messages')}
                    className="w-[18.75%] flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                  >
                    <div className="relative w-full aspect-square rounded-[22.5%] bg-gradient-to-b from-[#60E450] to-[#28CA36] flex items-center justify-center text-white shadow-md border border-white/30">
                      <svg className="w-[55%] h-[55%] text-white fill-white" viewBox="0 0 32 32">
                        <path d="M16 4C9.37 4 4 8.7 4 14.5c0 3.32 1.77 6.27 4.54 8.21L7 27.5l5.65-2.26c1.07.31 2.2.48 3.35.48 6.63 0 12-4.7 12-10.5S22.63 4 16 4z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-normal text-white mt-0.5 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Messages
                    </span>
                  </button>

                  {/* Dock Item 3: Safari */}
                  <button
                    onClick={() => setActiveApp('safari')}
                    className="w-[18.75%] flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-[22.5%] bg-gradient-to-b from-[#54C5D8] to-[#0A84FF] flex items-center justify-center text-white shadow-md border border-white/30 relative overflow-hidden">
                      <svg className="w-[65%] h-[65%]" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="11" stroke="white" strokeWidth="1" fill="none" />
                        <polygon points="16,6 20,16 16,14 12,16" fill="#FF3B30" />
                        <polygon points="16,26 20,16 16,18 12,16" fill="white" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-normal text-white mt-0.5 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Safari
                    </span>
                  </button>

                  {/* Dock Item 4: Settings */}
                  <button
                    onClick={() => setActiveApp('settings')}
                    className="w-[18.75%] flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-[22.5%] bg-gradient-to-b from-[#C0C5CA] to-[#7F8C8D] flex items-center justify-center text-white shadow-md border border-white/30">
                      <svg className="w-[55%] h-[55%] text-[#2C2C2E]" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M16 10a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8z" />
                        <path d="M28.3 14.5l-2.4-.7c-.2-.7-.5-1.4-.9-2l1.3-2.1c.4-.6.3-1.4-.2-1.9l-1.9-1.9c-.5-.5-1.3-.6-1.9-.2l-2.1 1.3c-.6-.4-1.3-.7-2-.9l-.7-2.4C17.3 3.1 16.7 2.5 16 2.5s-1.3.6-1.5 1.2l-.7 2.4c-.7.2-1.4.5-2 .9L9.7 5.7c-.6-.4-1.4-.3-1.9.2L5.9 7.8c-.5.5-.6 1.3-.2 1.9l1.3 2.1c-.4.6-.7 1.3-.9 2l-2.4.7C3.1 14.7 2.5 15.3 2.5 16s.6 1.3 1.2 1.5l2.4.7c.2.7.5 1.4.9 2l-1.3 2.1c-.4.6-.3 1.4.2 1.9l1.9 1.9c.5.5 1.3.6 1.9.2l2.1-1.3c.6.4 1.3.7 2 .9l.7 2.4c.2.6.8 1.2 1.5 1.2s1.3-.6 1.5-1.2l.7-2.4c.7-.2 1.4-.5 2-.9l2.1 1.3c.6.4 1.4.3 1.9-.2l1.9-1.9c.5-.5.6-1.3.2-1.9l-1.3-2.1c.4-.6.7-1.3.9-2l2.4-.7c.6-.2 1.2-.8 1.2-1.5s-.6-1.3-1.2-1.5z" opacity="0.85" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-normal text-white mt-0.5 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Settings
                    </span>
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
                  className="absolute z-50 size-11 right-3.5 bottom-16 rounded-full bg-black/70 backdrop-blur-md border border-white/30 shadow-2xl flex items-center justify-center cursor-pointer active:scale-90 transition-transform group"
                  title="Nút Home ảo AssistiveTouch (Bấm để mở Menu)"
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
                          className="p-3 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors cursor-pointer"
                        >
                          <Home className="size-5 text-[#0A84FF]" />
                          <span className="text-[9.5px]">Màn hình chính</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsLocked(true)
                            setAssistiveMenuOpen(false)
                          }}
                          className="p-3 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors cursor-pointer"
                        >
                          <Lock className="size-5 text-[#FF9F0A]" />
                          <span className="text-[9.5px]">Khóa máy</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveApp('messages')
                            setAssistiveMenuOpen(false)
                          }}
                          className="p-3 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors cursor-pointer"
                        >
                          <MessageSquare className="size-5 text-[#30D158]" />
                          <span className="text-[9.5px]">Tin nhắn</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowAssistiveTouch(false)
                            setAssistiveMenuOpen(false)
                          }}
                          className="p-3 rounded-2xl bg-[#2C2C2E]/80 hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors cursor-pointer"
                        >
                          <EyeOff className="size-5 text-[#FF3B30]" />
                          <span className="text-[9.5px]">Ẩn Home ảo</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setAssistiveMenuOpen(false)}
                        className="w-full py-1.5 text-center text-[11px] text-[#0A84FF] font-semibold hover:underline cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* HOME INDICATOR (Bottom Bar - Clickable Home Action) */}
          <div
            onClick={() => setActiveApp(null)}
            className="h-4 w-full flex items-center justify-center shrink-0 bg-transparent hover:bg-white/10 active:bg-white/20 cursor-pointer transition-colors group"
            title="Bấm để về Màn hình chính (Home)"
          >
            <div className="w-28 h-1 bg-white/40 group-hover:bg-white/80 rounded-full shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}
