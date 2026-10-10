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
import { BankingApp } from './apps/banking-app'

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
  | 'banking'
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
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const [screenPage, setScreenPage] = useState<number>(0)

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

      {/* PHONE CONTAINER: Exact iPhone 6s Plus 16:9 Aspect Ratio */}
      <div
        className={cn(
          "relative w-full h-full max-h-[740px] sm:w-[380px] aspect-[9/16] transition-all flex flex-col justify-between overflow-hidden shadow-2xl shrink-0 my-auto",
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

        {/* SCREEN CONTAINER (Uses Authentic iOS 9 Wave Wallpaper) */}
        <div
          className={cn(
            "relative w-full h-full bg-[#0d2a45] bg-[url('/images/backgrounds/ios9_wave_wallpaper.jpg')] bg-cover bg-center overflow-hidden flex flex-col justify-between",
            !frameless && "rounded-[34px] sm:rounded-[38px]"
          )}
        >
          {/* iOS TOP STATUS BAR (Exact 20pt Status Bar Height) */}
          <div className="relative z-30 h-6 px-3 flex items-center justify-between text-white text-[11px] font-sans tracking-tight shrink-0 bg-transparent select-none pt-1">
            {/* Left: 5 Signal Dots + Carrier + Wi-Fi */}
            <div className="flex items-center gap-1.5" title="Trạng thái mạng: giffgaff">
              <div className="flex items-center gap-[2.5px]">
                <span className="size-1.5 rounded-full bg-white shadow-sm inline-block" />
                <span className="size-1.5 rounded-full bg-white shadow-sm inline-block" />
                <span className="size-1.5 rounded-full bg-white shadow-sm inline-block" />
                <span className="size-1.5 rounded-full bg-white shadow-sm inline-block" />
                <span className="size-1.5 rounded-full bg-white shadow-sm inline-block" />
              </div>
              <span className="font-medium text-[10px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ml-0.5">giffgaff</span>
              <svg className="size-3 text-white fill-current drop-shadow" viewBox="0 0 24 24">
                <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0012 4zm0 4.5c3.31 0 6.3 1.34 8.49 3.51L12 20.49 3.51 12.01A11.91 11.91 0 0112 8.5z" />
              </svg>
            </div>

            {/* Center: Clock 12:35 */}
            <div className="absolute left-1/2 -translate-x-1/2 font-semibold text-[11.5px] text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-sans">
              12:35
            </div>

            {/* Right: Bluetooth + 20% + Solid Battery */}
            <div className="flex items-center gap-1 text-white font-semibold">
              <span className="text-[9.5px] font-sans text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium">20%</span>
              <div className="w-5 h-2.5 rounded-[3px] border border-white/90 p-[1px] relative flex items-center shadow-sm bg-black/20">
                <div className="h-full w-[20%] bg-[#FF3B30] rounded-[1px]" />
                <div className="absolute -right-[3px] top-[2px] w-[2px] h-[4px] bg-white/90 rounded-r-[1px]" />
              </div>
            </div>
          </div>

          {/* MAIN SCREEN AREA */}
          <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
            
            {/* 1. LOCK SCREEN (iOS 9 Spec: Clock, Ocean Waves Ambient Music Widget, Slide to Unlock, Camera) */}
            {isLocked ? (
              <div
                onTouchStart={handleLockTouchStart}
                onTouchEnd={handleLockTouchEnd}
                onMouseDown={handleLockTouchStart}
                onMouseUp={handleLockTouchEnd}
                className="flex-1 flex flex-col justify-between p-4 sm:p-5 relative overflow-hidden bg-black/25 backdrop-blur-xs select-none"
              >
                <style>{`
                  @keyframes iosSlideShimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                  }
                  .ios-shimmer-text {
                    background: linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.98) 50%, rgba(255,255,255,0.25) 100%);
                    background-size: 200% 100%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: iosSlideShimmer 2.6s infinite linear;
                  }
                `}</style>

                {/* Top Notification Grabber Hint */}
                <div className="w-10 h-1 bg-white/40 rounded-full mx-auto -mt-1 mb-1 shadow-xs" />

                {/* Lock Screen Header & Clock */}
                <div className="flex flex-col items-center pt-1 space-y-0.5 relative z-10">
                  <span className="text-[13px] font-normal text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-sans tracking-tight">
                    Thứ Sáu, 12 tháng 9
                  </span>
                  <span className="text-[64px] sm:text-[70px] font-extralight text-white tracking-tighter leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] font-sans">
                    12:35
                  </span>
                </div>

                {/* Center Widgets Container */}
                <div className="space-y-2.5 max-w-[310px] mx-auto w-full my-auto relative z-10">
                  {/* Figma Ocean Waves Ambient / Cupertino Sounds Music Widget */}
                  <div className="p-3 rounded-2xl bg-black/35 backdrop-blur-2xl border border-white/20 shadow-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-9 rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#5856D6] flex items-center justify-center text-white shadow-md shrink-0">
                        <svg className="size-4.5 fill-white" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-white tracking-tight truncate">
                          Ocean Waves Ambient
                        </div>
                        <div className="text-[10px] text-white/70 tracking-tight truncate">
                          Now Playing • Cupertino Sounds
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsPlayingMusic(!isPlayingMusic)
                      }}
                      className="size-7 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer shrink-0 ml-2"
                      title={isPlayingMusic ? "Tạm dừng phát" : "Phát nhạc"}
                    >
                      {isPlayingMusic ? (
                        <span className="text-[11px] font-bold">❚❚</span>
                      ) : (
                        <span className="text-[11px] font-bold ml-0.5">▶</span>
                      )}
                    </button>
                  </div>

                  {/* Lockscreen Clue Notifications */}
                  <div className="p-2.5 rounded-2xl bg-black/35 backdrop-blur-xl border border-white/15 shadow-xl">
                    <div className="flex items-center justify-between text-[10px] text-white/70 mb-0.5">
                      <span className="font-semibold flex items-center gap-1 text-[#FF453A]">
                        <Phone className="size-3 text-[#FF453A]" /> Cuộc gọi nhỡ (1) • Hà
                      </span>
                      <span className="font-mono text-[9px]">12:15</span>
                    </div>
                    <p className="text-[11px] text-white/95">
                      Hà đã để lại 1 thư thoại (0:08)
                    </p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-black/35 backdrop-blur-xl border border-white/15 shadow-xl">
                    <div className="flex items-center justify-between text-[10px] text-white/70 mb-0.5">
                      <span className="font-semibold flex items-center gap-1 text-white">
                        <MessageSquare className="size-3 text-[#30D158]" /> Tin nhắn • Thảo Vy
                      </span>
                      <span className="font-mono text-[9px]">12:30</span>
                    </div>
                    <p className="text-[11px] text-white/95 line-clamp-2 leading-relaxed">
                      Ok, vậy hẹn anh ở địa chỉ cũ trên bản đồ nhé.
                    </p>
                  </div>
                </div>

                {/* Bottom Bar: Classic iOS 9 "slide to unlock" + Camera Glyph */}
                <div className="relative z-10 w-full flex items-center justify-between px-2 pt-2 pb-1">
                  {/* Subtle Control Center Grabber (Bottom left) */}
                  <div className="w-6 h-1 bg-white/30 rounded-full" />

                  {/* Shimmer "slide to unlock" Action */}
                  <div
                    onClick={() => setIsLocked(false)}
                    className="flex items-center gap-1 cursor-pointer group active:opacity-60 transition-opacity"
                    title="Bấm hoặc vuốt để mở khóa"
                  >
                    <span className="ios-shimmer-text font-normal text-[15px] sm:text-[16px] tracking-wide select-none">
                      › trượt để mở khóa
                    </span>
                  </div>

                  {/* Bottom-right Camera Quick-Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsLocked(false)
                      setActiveApp('photos')
                    }}
                    className="size-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                    title="Mở nhanh Thư viện ảnh / Máy ảnh"
                  >
                    <svg className="size-4.5 fill-white/80 hover:fill-white" viewBox="0 0 24 24">
                      <path d="M4 4h3l2-2h6l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm8 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
                    </svg>
                  </button>
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
                {activeApp === 'banking' && <BankingApp onBackToHome={() => setActiveApp(null)} />}
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
              /* 3. EXACT PIXEL-PERFECT iOS 9 HOME SCREEN (Figma Spec: 4x4 Grid + Page Dots + Frosted Dock) */
              <div className="flex-1 flex flex-col justify-between px-3.5 pt-2 pb-1 relative overflow-hidden select-none">
                
                {screenPage === 0 ? (
                  /* PAGE 1: AUTHENTIC 4x4 SPRINGBOARD APPS (MATCHES FIGMA FRAME 92:300 EXACTLY) */
                  <div className="grid grid-cols-4 gap-x-3.5 gap-y-3 pt-0.5 relative z-10 animate-in fade-in-50 duration-200">
                    
                    {/* Row 1, Icon 1: Messages (Tin nhắn) */}
                    <button
                      onClick={() => setActiveApp('messages')}
                      className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    >
                      <div className="relative w-full aspect-square max-w-[56px] rounded-[13.5px] bg-gradient-to-b from-[#60E450] to-[#28CA36] flex items-center justify-center text-white shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/20">
                        <svg className="w-[58%] h-[58%] text-white fill-white" viewBox="0 0 32 32">
                          <path d="M16 4C9.37 4 4 8.7 4 14.5c0 3.32 1.77 6.27 4.54 8.21L7 27.5l5.65-2.26c1.07.31 2.2.48 3.35.48 6.63 0 12-4.7 12-10.5S22.63 4 16 4z" />
                        </svg>
                        <span className="absolute -top-[4%] -right-[4%] size-[28%] rounded-full bg-[#FF3B30] text-white text-[9px] font-bold flex items-center justify-center border-[1.5px] border-white shadow font-sans">
                          1
                        </span>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Messages
                      </span>
                    </button>

                    {/* Row 1, Icon 2: Calendar (Lịch Thứ Sáu 12 - Figma Spec) */}
                    <div className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer">
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-white flex flex-col items-center justify-between overflow-hidden shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/40 pb-0.5">
                        <div className="w-full bg-[#FF3B30] text-white text-[7.5px] font-bold tracking-wider uppercase py-0.5 text-center">
                          FRIDAY
                        </div>
                        <div className="text-[26px] font-light text-[#1C1C1E] tracking-tighter leading-none -mt-1 font-sans">
                          12
                        </div>
                        <div className="h-0.5" />
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Calendar
                      </span>
                    </div>

                    {/* Row 1, Icon 3: Photos (Ảnh) */}
                    <button
                      onClick={() => setActiveApp('photos')}
                      className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    >
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-white flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/40 relative">
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
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Photos
                      </span>
                    </button>

                    {/* Row 1, Icon 4: Camera (Máy ảnh) */}
                    <button
                      onClick={() => setActiveApp('photos')}
                      className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    >
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-gradient-to-b from-[#C6C9CE] to-[#8E959E] flex items-center justify-center text-white shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/30">
                        <svg className="w-[60%] h-[60%] text-[#2C2C2E]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4 4h3l2-2h6l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm8 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Camera
                      </span>
                    </button>

                    {/* Row 2, Icon 1: Weather (Thời tiết) */}
                    <div className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer">
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-gradient-to-b from-[#54C5D8] to-[#0A84FF] flex items-center justify-center text-white shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/30 relative overflow-hidden">
                        <div className="size-5 rounded-full bg-[#FFCC00] absolute top-2 right-2.5 shadow" />
                        <div className="w-7 h-4 bg-white/90 rounded-full absolute bottom-2.5 left-2 shadow-sm" />
                        <div className="size-4 bg-white/90 rounded-full absolute bottom-3.5 left-4" />
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Weather
                      </span>
                    </div>

                    {/* Row 2, Icon 2: Clock (Đồng hồ mặt trắng iOS 9) */}
                    <div className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer">
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-white flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/60 relative">
                        <div className="size-9 rounded-full border border-black/10 relative flex items-center justify-center bg-white">
                          <div className="absolute top-0.5 text-[5.5px] text-black font-semibold font-sans">12</div>
                          <div className="absolute right-0.5 text-[5.5px] text-black font-semibold font-sans">3</div>
                          <div className="absolute bottom-0.5 text-[5.5px] text-black font-semibold font-sans">6</div>
                          <div className="absolute left-0.5 text-[5.5px] text-black font-semibold font-sans">9</div>
                          <div className="absolute w-[2px] h-2.5 bg-black origin-bottom rotate-[240deg] -translate-y-1 rounded-sm" />
                          <div className="absolute w-[1.2px] h-3.5 bg-black origin-bottom rotate-[270deg] -translate-y-1.5 rounded-sm" />
                          <div className="absolute w-[0.8px] h-4 bg-[#FF3B30] origin-bottom rotate-[45deg] -translate-y-1.5" />
                          <div className="size-1 rounded-full bg-[#FF3B30] z-10" />
                        </div>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Clock
                      </span>
                    </div>

                    {/* Row 2, Icon 3: Maps (Bản đồ) */}
                    <button
                      onClick={() => setActiveApp('maps')}
                      className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    >
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-white flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/40 relative overflow-hidden p-1.5">
                        <svg className="w-full h-full" viewBox="0 0 48 48">
                          <path d="M24 4C14.06 4 6 12.06 6 22c0 13.5 18 22 18 22s18-8.5 18-22c0-9.94-8.06-18-18-18z" fill="#EA4335" />
                          <path d="M24 4C14.06 4 6 12.06 6 22c0 4.8 1.9 9.17 5 12.35l13-12.35V4z" fill="#4285F4" />
                          <path d="M24 22l13-12.35C33.9 6.47 29.2 4 24 4v18z" fill="#FBBC04" />
                          <path d="M24 22v22s18-8.5 18-22c0-4.8-1.9-9.17-5-12.35L24 22z" fill="#34A853" />
                          <circle cx="24" cy="19" r="6" fill="#FFFFFF" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Maps
                      </span>
                    </button>

                    {/* Row 2, Icon 4: Videos (Video) */}
                    <div className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer">
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-gradient-to-b from-[#54C5D8] to-[#40A8C4] flex flex-col justify-between overflow-hidden shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/30">
                        <div className="w-full h-4 bg-[#1C1C1E] flex items-center justify-around px-1">
                          <span className="w-1.5 h-3 bg-white skew-x-[20deg]" />
                          <span className="w-1.5 h-3 bg-white skew-x-[20deg]" />
                          <span className="w-1.5 h-3 bg-white skew-x-[20deg]" />
                        </div>
                        <div className="flex-1 flex items-center justify-center text-white text-[10px] font-bold">
                          ▶
                        </div>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Videos
                      </span>
                    </div>

                    {/* Row 3, Icon 1: Notes (Ghi chú iCloud) */}
                    <button
                      onClick={() => setActiveApp('notes')}
                      className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    >
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-white flex flex-col justify-between overflow-hidden shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/40">
                        <div className="w-full bg-[#FFD600] h-[24%] border-b border-dashed border-[#CCA800]" />
                        <div className="flex-1 p-1 flex flex-col gap-1 justify-center">
                          <div className="h-[1.5px] w-full bg-[#D1C485]" />
                          <div className="h-[1.5px] w-4/5 bg-[#D1C485]" />
                          <div className="h-[1.5px] w-3/4 bg-[#D1C485]" />
                        </div>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Notes
                      </span>
                    </button>

                    {/* Row 3, Icon 2: Reminders (Nhắc nhở) */}
                    <div className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer">
                      <div className="relative w-full aspect-square max-w-[56px] rounded-[13.5px] bg-white flex flex-col justify-center p-2 shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/40 gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-[#FF9500]" />
                          <span className="h-[2px] w-5 bg-[#D1D1D6] rounded" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-[#007AFF]" />
                          <span className="h-[2px] w-6 bg-[#D1D1D6] rounded" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-[#34C759]" />
                          <span className="h-[2px] w-4 bg-[#D1D1D6] rounded" />
                        </div>
                        <span className="absolute -top-[4%] -right-[4%] size-[28%] rounded-full bg-[#FF3B30] text-white text-[9px] font-bold flex items-center justify-center border-[1.5px] border-white shadow font-sans">
                          1
                        </span>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Reminders
                      </span>
                    </div>

                    {/* Row 3, Icon 3: Stocks (Chứng khoán) */}
                    <div className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer">
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-black flex flex-col justify-center items-center shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/20 p-1 relative overflow-hidden">
                        <svg className="w-full h-7 text-[#0A84FF]" viewBox="0 0 32 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 14 L8 10 L14 12 L20 4 L26 8 L30 2" />
                        </svg>
                        <div className="size-1.5 rounded-full bg-[#64D2FF] shadow-[0_0_6px_#64D2FF] absolute top-2 right-2.5" />
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Stocks
                      </span>
                    </div>

                    {/* Row 3, Icon 4: Wallet / Banking (Ví tiền & Ngân hàng) */}
                    <button
                      onClick={() => setActiveApp('banking')}
                      className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    >
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-gradient-to-b from-[#1C1C1E] to-[#000000] flex flex-col items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/20 p-1.5">
                        <div className="w-full h-2 rounded-t bg-[#30D158] opacity-90 mb-0.5" />
                        <div className="w-full h-2 bg-[#FF9F0A] opacity-90 mb-0.5" />
                        <div className="w-full h-2 rounded-b bg-[#0A84FF] opacity-90" />
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Wallet
                      </span>
                    </button>

                    {/* Row 4, Icon 1: iBooks */}
                    <div className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer">
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-gradient-to-b from-[#FF9500] to-[#FF5E3A] flex items-center justify-center text-white shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/30">
                        <svg className="w-[60%] h-[60%] fill-white" viewBox="0 0 24 24">
                          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        iBooks
                      </span>
                    </div>

                    {/* Row 4, Icon 2: iTunes Store */}
                    <div className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer">
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-gradient-to-b from-[#FF2D55] to-[#AF52DE] flex items-center justify-center text-white shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/30">
                        <div className="size-7 rounded-full border border-white flex items-center justify-center">
                          <span className="text-white text-xs">♫</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        iTunes Store
                      </span>
                    </div>

                    {/* Row 4, Icon 3: App Store */}
                    <div className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer">
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-gradient-to-b from-[#33A2FF] to-[#007AFF] flex items-center justify-center text-white shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/30">
                        <svg className="w-[60%] h-[60%]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 4v16m-7-6l14-4M5 14l14 4" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        App Store
                      </span>
                    </div>

                    {/* Row 4, Icon 4: Health (Sức khỏe) */}
                    <div className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer">
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-white flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/40">
                        <svg className="w-[55%] h-[55%] text-[#FF2D55] fill-[#FF2D55]" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Health
                      </span>
                    </div>

                  </div>
                ) : (
                  /* PAGE 2: UTILITIES & FORENSIC APPS (SETTINGS, CONTACTS, ETC.) */
                  <div className="grid grid-cols-4 gap-x-3.5 gap-y-3 pt-0.5 relative z-10 animate-in fade-in-50 duration-200">
                    
                    {/* Settings (Cài đặt) */}
                    <button
                      onClick={() => setActiveApp('settings')}
                      className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    >
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-gradient-to-b from-[#C0C5CA] to-[#7F8C8D] flex items-center justify-center text-white shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/30">
                        <svg className="w-[60%] h-[60%] text-[#2C2C2E]" viewBox="0 0 32 32" fill="currentColor">
                          <path d="M16 10a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8z" />
                          <path d="M28.3 14.5l-2.4-.7c-.2-.7-.5-1.4-.9-2l1.3-2.1c.4-.6.3-1.4-.2-1.9l-1.9-1.9c-.5-.5-1.3-.6-1.9-.2l-2.1 1.3c-.6-.4-1.3-.7-2-.9l-.7-2.4C17.3 3.1 16.7 2.5 16 2.5s-1.3.6-1.5 1.2l-.7 2.4c-.7.2-1.4.5-2 .9L9.7 5.7c-.6-.4-1.4-.3-1.9.2L5.9 7.8c-.5.5-.6 1.3-.2 1.9l1.3 2.1c-.4.6-.7 1.3-.9 2l-2.4.7C3.1 14.7 2.5 15.3 2.5 16s.6 1.3 1.2 1.5l2.4.7c.2.7.5 1.4.9 2l-1.3 2.1c-.4.6-.3 1.4.2 1.9l1.9 1.9c.5.5 1.3.6 1.9.2l2.1-1.3c.6.4 1.3.7 2 .9l.7 2.4c.2.6.8 1.2 1.5 1.2s1.3-.6 1.5-1.2l.7-2.4c.7-.2 1.4-.5 2-.9l2.1 1.3c.6.4 1.4.3 1.9-.2l1.9-1.9c.5-.5.6-1.3.2-1.9l-1.3-2.1c.4-.6.7-1.3.9-2l2.4-.7c.6-.2 1.2-.8 1.2-1.5s-.6-1.3-1.2-1.5z" opacity="0.85" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Settings
                      </span>
                    </button>

                    {/* Contacts (Danh bạ) */}
                    <button
                      onClick={() => setActiveApp('contacts')}
                      className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    >
                      <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-gradient-to-b from-[#8E8E93] to-[#636366] flex items-center justify-center text-white shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/30">
                        <svg className="w-[60%] h-[60%]" viewBox="0 0 32 32" fill="currentColor">
                          <circle cx="16" cy="11" r="5" fill="white" />
                          <path d="M6 26c0-5.5 4.5-8 10-8s10 2.5 10 8" fill="white" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                        Contacts
                      </span>
                    </button>

                    {/* Forensic extraction indicator */}
                    {onSwitchToForensics && (
                      <button
                        onClick={onSwitchToForensics}
                        className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                        title="Chuyển sang chế độ Pháp y số"
                      >
                        <div className="w-full aspect-square max-w-[56px] rounded-[13.5px] bg-gradient-to-b from-[#30D158] to-[#1C7E32] flex items-center justify-center text-white shadow-[0_3px_8px_rgba(0,0,0,0.3)] border border-white/30">
                          <ShieldCheck className="size-7 text-white" />
                        </div>
                        <span className="text-[11px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate w-full">
                          Pháp Y
                        </span>
                      </button>
                    )}

                  </div>
                )}

                {/* Page Indicator Dots (Spotlight Search + Page 1 active + Page 2) */}
                <div className="flex items-center justify-center gap-1.5 py-1 z-10">
                  <button
                    onClick={() => setScreenPage(0)}
                    className="p-1 cursor-pointer transition-transform active:scale-75"
                    title="Tìm kiếm Spotlight"
                  >
                    <svg className="size-2 text-white/70 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setScreenPage(0)}
                    className={cn(
                      "size-1.5 rounded-full transition-all cursor-pointer shadow-sm",
                      screenPage === 0 ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
                    )}
                    title="Trang 1: Ứng dụng chính"
                  />
                  <button
                    onClick={() => setScreenPage(1)}
                    className={cn(
                      "size-1.5 rounded-full transition-all cursor-pointer shadow-sm",
                      screenPage === 1 ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
                    )}
                    title="Trang 2: Tiện ích & Cài đặt"
                  />
                </div>

                {/* AUTHENTIC iOS 9 FROSTED GLASS DOCK (4 Quick-Launch Apps with Text Labels) */}
                <div className="w-[96%] mx-auto h-[84px] rounded-[24px] bg-white/30 backdrop-blur-2xl border border-white/40 p-2 flex items-center justify-around px-1 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden z-10 mt-auto mb-1">
                  {/* Glossy top highlight reflection line */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                  {/* Dock Item 1: Phone */}
                  <button
                    onClick={() => setActiveApp('phone')}
                    className="w-[22%] flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    title="Điện thoại"
                  >
                    <div className="relative w-full aspect-square max-w-[50px] rounded-[22.5%] bg-gradient-to-b from-[#60E450] to-[#28CA36] flex items-center justify-center text-white shadow-md border border-white/30">
                      <svg className="w-[55%] h-[55%] text-white fill-white" viewBox="0 0 24 24">
                        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                      <span className="absolute -top-[4%] -right-[4%] size-[32%] rounded-full bg-[#FF3B30] text-white text-[9px] font-bold flex items-center justify-center border-[1.5px] border-white shadow font-sans">
                        3
                      </span>
                    </div>
                    <span className="text-[10.5px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Phone
                    </span>
                  </button>

                  {/* Dock Item 2: Mail (Hộp thư 2,017) */}
                  <button
                    onClick={() => setActiveApp('messages')}
                    className="w-[22%] flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    title="Mail"
                  >
                    <div className="relative w-full aspect-square max-w-[50px] rounded-[22.5%] bg-gradient-to-b from-[#33A2FF] to-[#0A84FF] flex items-center justify-center text-white shadow-md border border-white/30">
                      <svg className="w-[60%] h-[60%]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      {/* Pill Badge for 2,017 */}
                      <span className="absolute -top-[6%] -right-[12%] px-1.5 h-[16px] rounded-full bg-[#FF3B30] text-white text-[8.5px] font-bold flex items-center justify-center border-[1.5px] border-white shadow font-mono">
                        2,017
                      </span>
                    </div>
                    <span className="text-[10.5px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Mail
                    </span>
                  </button>

                  {/* Dock Item 3: Safari */}
                  <button
                    onClick={() => setActiveApp('safari')}
                    className="w-[22%] flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    title="Safari"
                  >
                    <div className="w-full aspect-square max-w-[50px] rounded-[22.5%] bg-gradient-to-b from-[#54C5D8] to-[#0A84FF] flex items-center justify-center text-white shadow-md border border-white/30 relative overflow-hidden">
                      <svg className="w-[65%] h-[65%]" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="11" stroke="white" strokeWidth="1" fill="none" />
                        <polygon points="16,6 20,16 16,14 12,16" fill="#FF3B30" />
                        <polygon points="16,26 20,16 16,18 12,16" fill="white" />
                      </svg>
                    </div>
                    <span className="text-[10.5px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Safari
                    </span>
                  </button>

                  {/* Dock Item 4: Music (Nhạc) */}
                  <button
                    onClick={() => setActiveApp('phone')}
                    className="w-[22%] flex flex-col items-center group active:scale-90 transition-transform cursor-pointer"
                    title="Music"
                  >
                    <div className="w-full aspect-square max-w-[50px] rounded-[22.5%] bg-gradient-to-b from-[#FF2D55] to-[#FA114F] flex items-center justify-center text-white shadow-md border border-white/30 relative">
                      <svg className="w-[58%] h-[58%] fill-white" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                    <span className="text-[10.5px] font-normal text-white mt-1 tracking-tight text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Music
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
