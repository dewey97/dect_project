'use client'

import { useState, useRef } from 'react'
import {
  Wifi,
  BatteryMedium,
  BatteryLow,
  Fingerprint,
  ShieldCheck,
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
  X,
  Eye,
  EyeOff,
  Power,
  Smartphone,
  Maximize2
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
    <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center select-none overflow-hidden py-0 sm:py-0.5">
      {/* Top Quick Control Bar (Desktop controls, Home button on mobile when app active) */}
      <div
        className={cn(
          "items-center justify-between w-full max-w-[395px] px-2 text-[11px] font-mono shrink-0",
          activeApp ? "flex mb-1 sm:mb-1.5" : "hidden sm:flex mb-1 sm:mb-1.5"
        )}
      >
        <div className="hidden sm:flex items-center gap-1.5">
          {/* Lock / Unlock Screen */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 shadow-sm cursor-pointer",
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
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 shadow-sm cursor-pointer",
              showAssistiveTouch
                ? "bg-[#0A84FF]/15 text-[#0A84FF] border-[#0A84FF]/40 font-medium hover:bg-[#0A84FF]/25"
                : "bg-[#1C1C1E] text-zinc-400 hover:text-zinc-200 border-white/10 hover:border-white/20"
            )}
            title={showAssistiveTouch ? "Ẩn nút Home ảo (AssistiveTouch)" : "Hiện nút Home ảo (AssistiveTouch)"}
          >
            {showAssistiveTouch ? <EyeOff className="size-3 text-[#0A84FF]" /> : <Eye className="size-3 text-zinc-400" />}
            <span>{showAssistiveTouch ? 'Ẩn Home ảo' : 'Bật Home ảo'}</span>
          </button>

          {/* Frameless vs Framed Toggle */}
          <button
            onClick={() => setFrameless(!frameless)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 shadow-sm cursor-pointer",
              frameless
                ? "bg-[#AF52DE]/15 text-[#AF52DE] border-[#AF52DE]/40 font-medium hover:bg-[#AF52DE]/25"
                : "bg-[#1C1C1E] text-zinc-400 hover:text-zinc-200 border-white/10 hover:border-white/20"
            )}
            title="Chuyển đổi giữa Chế độ Tràn viền và Khung máy cổ điển"
          >
            <Smartphone className="size-3 text-[#AF52DE]" />
            <span>{frameless ? 'Tràn viền' : 'Có khung'}</span>
          </button>
        </div>

        {activeApp && (
          <button
            onClick={() => setActiveApp(null)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#0A84FF]/40 bg-[#0A84FF]/15 text-[#0A84FF] hover:bg-[#0A84FF]/25 active:scale-95 font-semibold transition-all shadow-sm cursor-pointer ml-auto"
            title="Thoát ứng dụng về Màn hình chính"
          >
            <Home className="size-3" />
            <span>Về Home</span>
          </button>
        )}
      </div>

      {/* PHONE CONTAINER: Fixed Aspect Ratio 9:19.5, Scales Uniformly without distorting! */}
      <div
        style={{ aspectRatio: '9 / 19.5' }}
        className={cn(
          "relative flex-1 min-h-0 max-h-full w-auto max-w-[min(395px,100%)] transition-all flex flex-col justify-between overflow-hidden",
          frameless
            ? "bg-[#000000] rounded-none sm:rounded-[36px] border-0 sm:border sm:border-white/15 shadow-2xl"
            : "bg-[#121214] rounded-[44px] sm:rounded-[52px] p-2 sm:p-3 shadow-2xl border-[6px] sm:border-[8px] border-[#2C2C30] ring-1 ring-white/10"
        )}
      >
        {!frameless && (
          <>
            {/* Hardware Sleep / Lock Button (Right Edge — Tap to Lock/Unlock screen) */}
            <button
              onClick={() => setIsLocked(!isLocked)}
              title={isLocked ? "Nút Nguồn vật lý: Bấm để Mở khóa" : "Nút Nguồn vật lý: Bấm để Khóa máy"}
              className="absolute -right-[7px] sm:-right-[9px] top-24 w-2 sm:w-2.5 h-12 sm:h-14 bg-[#3A3A3C] hover:bg-[#0A84FF] active:bg-[#0A84FF] rounded-r-md cursor-pointer border-y border-r border-white/20 shadow-md transition-colors z-30 group flex items-center justify-center"
            >
              <span className="sr-only">Nút Nguồn vật lý</span>
            </button>

            {/* Hardware Volume Buttons (Left Edge - Cosmetic) */}
            <div className="absolute -left-[6px] sm:-left-[8px] top-20 w-1.5 sm:w-2 h-6 bg-[#2C2C2E] rounded-l-sm border-y border-l border-white/20" />
            <div className="absolute -left-[6px] sm:-left-[8px] top-30 w-1.5 sm:w-2 h-9 bg-[#3A3A3C] rounded-l-md border-y border-l border-white/20" />
            <div className="absolute -left-[6px] sm:-left-[8px] top-42 w-1.5 sm:w-2 h-9 bg-[#3A3A3C] rounded-l-md border-y border-l border-white/20" />

            {/* Subtle Metallic Bezel Highlights */}
            <div className="absolute inset-0 rounded-[38px] sm:rounded-[46px] pointer-events-none border border-white/10" />
          </>
        )}

        {/* SCREEN CONTAINER */}
        <div
          className={cn(
            "relative w-full h-full bg-[#000000] overflow-hidden flex flex-col justify-between",
            !frameless && "rounded-[34px] sm:rounded-[40px]"
          )}
        >
          {/* iOS TOP STATUS BAR */}
          <div className="relative z-30 h-8 sm:h-9 px-4 sm:px-6 flex items-center justify-between text-white text-[11px] sm:text-[12px] font-semibold tracking-tight shrink-0 bg-[#000000] border-b border-white/5">
            {/* Carrier & Signal */}
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-[11px] font-medium text-white/90">Viettel</span>
              <span className="text-[9px] font-bold text-white/80">4G</span>
              <Wifi className="size-2.5 sm:size-3 text-white/80" />
            </div>

            {/* Top Speaker Grille (Only when framed) */}
            {!frameless && (
              <div className="h-1.5 w-12 bg-[#2C2C2E] rounded-full shadow-inner" />
            )}

            {/* Battery Status: 18% per crime scene report */}
            <div className="flex items-center gap-1 font-mono text-[10px] text-[#FF453A] font-bold">
              <span>18%</span>
              <BatteryLow className="size-3.5 text-[#FF453A] fill-[#FF453A]" />
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
                className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-[#1C1C1E] via-[#000000] to-[#0A0A0C]"
              >
                {/* Lock icon & Time */}
                <div className="flex flex-col items-center pt-3 space-y-1">
                  <Lock className="size-4 text-white/60 mb-0.5" />
                  <span className="text-[12px] font-medium text-white/80">Thứ Sáu, 24 tháng 7</span>
                  <span className="text-[52px] font-light text-white tracking-tighter leading-none">
                    20:45
                  </span>
                  <span className="text-[9.5px] text-[#FF453A] font-mono bg-[#FF453A]/10 px-2 py-0.5 rounded-full border border-[#FF453A]/20">
                    PIN YẾU (18%) // THU GIỮ TẠI HIỆN TRƯỜNG
                  </span>
                </div>

                {/* Lockscreen Notifications */}
                <div className="space-y-2 max-w-[290px] mx-auto w-full my-auto">
                  {/* Notification 1: Trần Thị Hà */}
                  <div className="p-2.5 rounded-2xl bg-[#1C1C1E]/90 backdrop-blur-md border border-white/10 shadow-lg animate-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between text-[10.5px] text-white/70 mb-0.5">
                      <span className="font-semibold flex items-center gap-1 text-[#FF453A]">
                        <Phone className="size-3 text-[#FF453A]" /> Cuộc gọi nhỡ (1) • Trần Thị Hà
                      </span>
                      <span className="font-mono text-[9px]">20:31</span>
                    </div>
                    <p className="text-[11px] text-white/90">
                      Trần Thị Hà đã để lại 1 thư thoại (0:18)
                    </p>
                  </div>

                  {/* Notification 2: Bé Vy */}
                  <div className="p-2.5 rounded-2xl bg-[#1C1C1E]/90 backdrop-blur-md border border-white/10 shadow-lg animate-in slide-in-from-bottom-3">
                    <div className="flex items-center justify-between text-[10.5px] text-white/70 mb-0.5">
                      <span className="font-semibold flex items-center gap-1 text-white">
                        <MessageSquare className="size-3 text-[#30D158]" /> Tin nhắn • Bé Vy ❤️
                      </span>
                      <span className="font-mono text-[9px]">17:55</span>
                    </div>
                    <p className="text-[11px] text-white/90 line-clamp-2 leading-relaxed">
                      Nhớ lời anh đó nha! Em chuẩn bị xong hết vali rồi, sáng mai em đợi anh ở sân bay Nội Bài đấy! ✈️❤️
                    </p>
                  </div>

                  {/* Notification 3: Thợ nề Tùng */}
                  <div className="p-2.5 rounded-2xl bg-[#1C1C1E]/90 backdrop-blur-md border border-white/10 shadow-lg animate-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between text-[10.5px] text-white/70 mb-0.5">
                      <span className="font-semibold flex items-center gap-1 text-[#FF9F0A]">
                        <MessageSquare className="size-3 text-[#FF9F0A]" /> Tin nhắn • 0913.882.901 (Số lạ)
                      </span>
                      <span className="font-mono text-[9px]">15:30</span>
                    </div>
                    <p className="text-[11px] text-white/90">
                      Tròn 30 năm rồi đó. M không có gì muốn nói với Huy à?
                    </p>
                  </div>
                </div>

                {/* Unlock hint (Touch ID) */}
                <div
                  onClick={() => setIsLocked(false)}
                  className="flex flex-col items-center pb-2 text-white/70 text-[11px] hover:text-white transition-colors cursor-pointer group"
                >
                  <div className="size-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center mb-1 group-hover:scale-105 group-hover:border-[#0A84FF] transition-all">
                    <Fingerprint className="size-5 text-[#0A84FF] animate-pulse" />
                  </div>
                  <span className="font-medium text-[10px]">Chạm nút Home để mở khóa Touch ID</span>
                </div>
              </div>
            ) : activeApp ? (
              /* 2. ACTIVE APP RUNNING */
              <div className="flex-1 min-h-0 flex flex-col h-full bg-[#000000] overflow-hidden">
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
                  <div className="p-4 text-white space-y-4 font-sans overflow-y-auto">
                    <div className="text-[18px] font-bold">Cài đặt thiết bị</div>
                    <div className="p-3.5 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] text-[12px] space-y-3">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Chủ sở hữu:</span>
                        <span className="font-semibold text-white">Nguyễn Văn Khang</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Kiểu máy:</span>
                        <span className="font-semibold">iPhone 8 Plus (64GB, Space Gray)</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Số thuê bao:</span>
                        <span className="font-mono text-[#0A84FF]">0983.291.802</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Số IMEI:</span>
                        <span className="font-mono text-[11px]">356984110294812</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Tình trạng pin:</span>
                        <span className="text-[#FF453A] font-bold">18% (Rơi úp mặt sàn phòng khách)</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Cảm biến bảo mật:</span>
                        <span className="text-white">Touch ID (Nút Home cơ học)</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-[#8E8E93]">Trích xuất pháp y:</span>
                        <span className="text-[#30D158] font-bold flex items-center gap-1">
                          <ShieldCheck className="size-3.5" /> UFED Cellebrite 100%
                        </span>
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
                  className="absolute z-50 size-11 right-3.5 bottom-14 rounded-full bg-black/70 backdrop-blur-md border border-white/30 shadow-2xl flex items-center justify-center cursor-pointer active:scale-90 transition-transform group"
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

                        {/* Hide AssistiveTouch Button right inside Menu */}
                        <button
                          onClick={() => {
                            setShowAssistiveTouch(false)
                            setAssistiveMenuOpen(false)
                          }}
                          className="p-2.5 rounded-2xl bg-[#2C2C2E]/80 hover:bg-[#3A3A3C] active:bg-[#3A3A3C] flex items-center justify-center gap-2 text-zinc-300 hover:text-white transition-colors col-span-2 border border-white/10"
                        >
                          <EyeOff className="size-3.5 text-[#8E8E93]" />
                          <span className="text-[10px]">Tạm ẩn nút Home ảo</span>
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

          {/* Bottom Home Navigation: Modern Indicator Bar when frameless, Touch ID when framed */}
          {frameless ? (
            <div
              onClick={() => {
                if (isLocked) {
                  setIsLocked(false)
                } else if (activeApp) {
                  setActiveApp(null)
                }
              }}
              className="relative z-30 h-6 sm:h-7 flex items-center justify-center cursor-pointer group shrink-0 bg-[#000000] border-t border-white/5"
              title="Thanh Home (Bấm để Về Màn hình chính / Mở khóa)"
            >
              <div className="w-28 sm:w-32 h-1 bg-white/40 group-hover:bg-white/80 rounded-full transition-all active:scale-90 shadow-sm" />
            </div>
          ) : (
            <div
              onClick={() => {
                if (isLocked) {
                  setIsLocked(false)
                } else if (activeApp) {
                  setActiveApp(null)
                }
              }}
              className="relative z-30 h-12 flex items-center justify-center cursor-pointer group shrink-0 bg-[#000000] border-t border-white/5"
              title="Nút Home Touch ID (Bấm để Mở khóa / Về Home)"
            >
              <div className="size-9 sm:size-10 rounded-full border-[1.5px] border-[#3A3A3C] group-hover:border-[#0A84FF] flex items-center justify-center shadow-inner transition-all active:scale-90 bg-[#121214]">
                <div className="size-6 sm:size-7 rounded-full border border-white/10 flex items-center justify-center">
                  <Fingerprint className="size-3.5 text-white/40 group-hover:text-[#0A84FF] transition-colors" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
