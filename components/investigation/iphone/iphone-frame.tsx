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
  const [showAssistiveTouch, setShowAssistiveTouch] = useState(false)
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

      {/* PHONE CONTAINER: Exact iPhone 375x667 Canvas Aspect Ratio */}
      <div
        className={cn(
          "relative w-[375px] max-w-full h-[667px] max-h-full aspect-[375/667] transition-all flex flex-col overflow-hidden shadow-2xl shrink-0 my-auto",
          frameless
            ? "bg-black rounded-[36px] border border-white/20"
            : "bg-[#121214] rounded-[44px] p-2.5 border-[8px] border-[#2C2C30] ring-1 ring-white/10"
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

        {/* SCREEN CONTAINER (Uses Authentic Figma Beach Wallpaper & Vignette) */}
        <div
          className={cn(
            "relative w-full h-full bg-[#0d2a45] bg-[url('/images/cases/case_000/phone/clean_beach_wallpaper.png')] bg-cover bg-center overflow-hidden flex flex-col",
            !frameless && "rounded-[34px] sm:rounded-[38px]"
          )}
        >
          {/* Authentic iOS Vignette Gradient (Figma Node 14:39) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/15 pointer-events-none z-0" />

          {/* iOS TOP STATUS BAR (Only shown when inside an app or on lockscreen) */}
          {(activeApp !== null || isLocked) && (
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
          )}

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
              /* 3. EXACT PIXEL-PERFECT iOS 9 HOME SCREEN (Figma Workflow 2: 100% Master Render + Interactive Hotspots) */
              <div className="absolute inset-0 select-none overflow-hidden">
                {/* 100% Pixel-Perfect Figma Master Render */}
                <img
                  src="/images/cases/case_000/phone/ios9_home_master_pixel_perfect.png"
                  alt="iOS 9 Springboard"
                  className="w-full h-full object-cover select-none pointer-events-none absolute inset-0 z-0"
                />

                {/* INTERACTIVE HOTSPOTS LAYER (Overlayed exactly on top of each Figma app icon) */}
                <div className="absolute inset-0 z-10">
                  {/* Row 1 */}
                  {/* Messages */}
                  <button
                    onClick={() => setActiveApp('messages')}
                    className="absolute left-[2.5%] top-[5.0%] w-[20%] h-[13%] rounded-2xl active:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    title="Messages (Tin nhắn)"
                  />
                  {/* Photos */}
                  <button
                    onClick={() => setActiveApp('photos')}
                    className="absolute left-[52.0%] top-[5.0%] w-[20%] h-[13%] rounded-2xl active:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    title="Photos (Ảnh)"
                  />
                  {/* Camera */}
                  <button
                    onClick={() => setActiveApp('photos')}
                    className="absolute left-[77.0%] top-[5.0%] w-[20%] h-[13%] rounded-2xl active:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    title="Camera (Máy ảnh)"
                  />

                  {/* Row 2 */}
                  {/* Maps */}
                  <button
                    onClick={() => setActiveApp('maps')}
                    className="absolute left-[52.0%] top-[21.6%] w-[20%] h-[13%] rounded-2xl active:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    title="Maps (Bản đồ)"
                  />

                  {/* Row 3 */}
                  {/* Notes */}
                  <button
                    onClick={() => setActiveApp('notes')}
                    className="absolute left-[2.5%] top-[38.2%] w-[20%] h-[13%] rounded-2xl active:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    title="Notes (Ghi chú iCloud)"
                  />
                  {/* Wallet / Banking */}
                  <button
                    onClick={() => setActiveApp('banking')}
                    className="absolute left-[77.0%] top-[38.2%] w-[20%] h-[13%] rounded-2xl active:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    title="Wallet (Ví tiền / Ngân hàng)"
                  />

                  {/* Dock Items (4 Ứng dụng thanh Dock đáy) */}
                  {/* Phone */}
                  <button
                    onClick={() => setActiveApp('phone')}
                    className="absolute left-[2.5%] bottom-[1.5%] w-[21.5%] h-[14.5%] rounded-3xl active:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    title="Phone (Điện thoại & Hộp thư thoại)"
                  />
                  {/* Mail */}
                  <button
                    onClick={() => setActiveApp('messages')}
                    className="absolute left-[27.0%] bottom-[1.5%] w-[21.5%] h-[14.5%] rounded-3xl active:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    title="Mail (Hộp thư)"
                  />
                  {/* Safari */}
                  <button
                    onClick={() => setActiveApp('safari')}
                    className="absolute left-[51.5%] bottom-[1.5%] w-[21.5%] h-[14.5%] rounded-3xl active:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    title="Safari (Trình duyệt)"
                  />
                  {/* Music */}
                  <button
                    onClick={() => setActiveApp('phone')}
                    className="absolute left-[76.0%] bottom-[1.5%] w-[21.5%] h-[14.5%] rounded-3xl active:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    title="Music (Âm thanh)"
                  />
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
