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
  Maximize2,
  Mail,
  FolderOpen,
  Calendar,
  Clock,
  Calculator,
  HeartPulse,
  Camera,
  Sun,
  Film,
  CheckSquare,
  TrendingUp,
  Gamepad2,
  Newspaper,
  Music,
  Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Device, Conversation, Photo, Email, Document, BrowserHistory, RecoveredFile } from '@/lib/types'

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
  emails?: Email[]
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
  | 'files'
  | 'emails'
  | 'calendar'
  | 'clock'
  | 'calculator'
  | 'health'
  | 'camera'
  | null

export function IPhoneFrame({
  device,
  threads,
  photos,
  emails = [],
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
    <div className="flex-1 min-h-0 w-full h-full flex flex-col items-center justify-center select-none overflow-hidden py-0 sm:py-1">
      {/* Top Quick Control Bar (Desktop controls only) */}
      <div
        className={cn(
          "items-center justify-between w-full max-w-[440px] px-2 text-[11px] font-mono shrink-0 hidden sm:flex mb-1"
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

      {/* PHONE CONTAINER: Fixed 9:16 Aspect Ratio Container */}
      <div
        className={cn(
          "relative shrink-0 h-full max-h-[740px] aspect-[9/16] transition-all flex flex-col justify-between overflow-hidden shadow-2xl mx-auto my-auto",
          frameless
            ? "bg-[#000000] rounded-[28px] sm:rounded-[36px] border border-white/15"
            : "bg-[#121214] rounded-[36px] sm:rounded-[48px] p-2 sm:p-2.5 border-[6px] sm:border-[8px] border-[#2C2C30] ring-1 ring-white/10"
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
          {/* iOS 8 CLASSIC TOP STATUS BAR */}
          <div className="relative z-30 h-6 px-3 flex items-center justify-between text-white text-[11px] font-sans tracking-tight shrink-0 bg-transparent shadow-sm">
            {/* Left: Signal Dots & Wifi */}
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                <span className="size-1.5 rounded-full bg-white" />
                <span className="size-1.5 rounded-full bg-white" />
                <span className="size-1.5 rounded-full bg-white" />
                <span className="size-1.5 rounded-full bg-white" />
                <span className="size-1.5 rounded-full bg-white/40" />
              </div>
              <Wifi className="size-3 text-white ml-0.5" />
            </div>

            {/* Center: Clock Time */}
            <span className="text-[11.5px] font-semibold text-white tracking-tight drop-shadow">9:41 PM</span>

            {/* Right: Battery % & Icon */}
            <div className="flex items-center gap-1 font-mono text-[10.5px] text-white font-semibold">
              <span>100%</span>
              <div className="w-5 h-2.5 rounded-[3px] border border-white p-[1px] flex items-center">
                <div className="h-full w-full bg-white rounded-[1px]" />
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
                      <span className="font-mono text-[9px]">20:35</span>
                    </div>
                    <p className="text-[11px] text-white/90 line-clamp-2 leading-relaxed">
                      Dạaaa, vậy sáng mai anh qua đón e nhé 😘😘
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
                        <span className="font-semibold">iPhone 6s Plus (64GB, Space Gray)</span>
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
                {activeApp === 'files' && (
                  <div className="p-4 text-white space-y-3 font-sans overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-[18px] font-bold">Tệp tin trích xuất</span>
                      <span className="text-[10px] text-[#30D158] font-mono bg-[#30D158]/10 px-2 py-0.5 rounded border border-[#30D158]/20">UFED 100%</span>
                    </div>
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div key={file.id} className="p-3 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-between text-[11.5px]">
                          <div className="flex items-center gap-2.5">
                            <FolderOpen className="size-5 text-[#0A84FF]" />
                            <div>
                              <div className="font-semibold text-white">{file.name}</div>
                              <div className="text-[9.5px] text-[#8E8E93] font-mono">{file.size} • {file.status}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeApp === 'emails' && (
                  <div className="p-4 text-white space-y-3 font-sans overflow-y-auto">
                    <div className="text-[18px] font-bold">Hộp thư Mail</div>
                    {emails && emails.length > 0 ? (
                      <div className="space-y-2">
                        {emails.map((email) => (
                          <div key={email.id} className="p-3 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] space-y-1">
                            <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono">
                              <span>Từ: {email.sender}</span>
                              <span>{email.timestamp}</span>
                            </div>
                            <div className="text-[12px] font-bold text-white">{email.subject}</div>
                            <div className="text-[11px] text-[#8E8E93] line-clamp-2">{email.body}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-[11px] text-[#8E8E93] bg-[#1C1C1E] rounded-xl border border-[#2C2C2E]">
                        Không có thư mới nào trong hộp thư đến.
                      </div>
                    )}
                  </div>
                )}
                {activeApp === 'calendar' && (
                  <div className="p-4 text-white space-y-3 font-sans overflow-y-auto">
                    <div className="text-[18px] font-bold text-[#FF3B30]">Lịch biểu — 24/07/2016</div>
                    <div className="space-y-2 text-[11.5px]">
                      <div className="p-3 rounded-xl bg-[#1C1C1E] border-l-4 border-l-[#FF9F0A] border border-[#2C2C2E]">
                        <span className="font-mono text-[10px] text-[#FF9F0A] block">17:30</span>
                        <span className="font-semibold text-white">Chốt cọc 2 tỷ mua bán đất</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#1C1C1E] border-l-4 border-l-[#0A84FF] border border-[#2C2C2E]">
                        <span className="font-mono text-[10px] text-[#0A84FF] block">19:00</span>
                        <span className="font-semibold text-white">Hẹn giải quyết nợ với Lê Quang Vũ & Mai</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#1C1C1E] border-l-4 border-l-[#30D158] border border-[#2C2C2E]">
                        <span className="font-mono text-[10px] text-[#30D158] block">06:15 Sáng mai</span>
                        <span className="font-semibold text-white">Chuyến bay VN125 đi TP.HCM cùng Bé Vy</span>
                      </div>
                    </div>
                  </div>
                )}
                {activeApp === 'clock' && (
                  <div className="p-4 text-white space-y-3 font-sans overflow-y-auto text-center">
                    <div className="text-[18px] font-bold">Đồng hồ tử vong</div>
                    <div className="p-6 rounded-2xl bg-[#1C1C1E] border border-[#FF453A]/30 space-y-2">
                      <div className="font-mono text-[36px] font-bold text-[#FF453A]">21:00:00</div>
                      <div className="text-[11px] text-[#8E8E93]">Mốc thời gian nạn nhân ngừng tim / Ngạt khí</div>
                    </div>
                  </div>
                )}
                {activeApp === 'calculator' && (
                  <div className="p-4 text-white space-y-3 font-sans overflow-y-auto">
                    <div className="text-[18px] font-bold">Máy tính tài chính</div>
                    <div className="p-4 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] space-y-2 font-mono text-[12px]">
                      <div className="flex justify-between text-[#8E8E93]"><span>Tiền mặt cọc đất:</span><span className="text-[#30D158]">+2.100.000.000 VNĐ</span></div>
                      <div className="flex justify-between text-[#8E8E93]"><span>Nợ bốc họ Lê Quang Vũ:</span><span className="text-[#FF9F0A]">+300.000.000 VNĐ</span></div>
                      <div className="flex justify-between border-t border-white/10 pt-2 text-white font-bold"><span>Tổng ngân sách trốn đi:</span><span className="text-[#30D158]">2.400.000.000 VNĐ</span></div>
                    </div>
                  </div>
                )}
                {activeApp === 'health' && (
                  <div className="p-4 text-white space-y-3 font-sans overflow-y-auto">
                    <div className="text-[18px] font-bold text-[#FF2D55] flex items-center gap-1.5">
                      <HeartPulse className="size-5" /> <span>Dữ liệu Sinh học</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] text-[11.5px] space-y-2 font-mono">
                      <div className="flex justify-between"><span>Nhịp tim 20:30:</span><span className="text-[#30D158]">72 bpm</span></div>
                      <div className="flex justify-between"><span>Nhịp tim 20:50:</span><span className="text-[#FF9F0A]">42 bpm (Suy hô hấp)</span></div>
                      <div className="flex justify-between"><span>Nhịp tim 21:00:</span><span className="text-[#FF453A] font-bold">0 bpm (Tử vong)</span></div>
                    </div>
                  </div>
                )}
                {activeApp === 'camera' && (
                  <div className="p-4 text-white space-y-3 font-sans overflow-y-auto text-center">
                    <div className="text-[18px] font-bold flex items-center justify-center gap-1.5"><Camera className="size-5 text-[#0A84FF]" /> Camera Tang Vật</div>
                    <div className="p-3 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] text-[11px] text-[#8E8E93]">
                      Camera điện thoại lưu trữ 12 ảnh chụp tang vật và góc phòng khách. Mở ứng dụng <strong>Ảnh</strong> để xem toàn bộ chi tiết.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 3. HOME SCREEN APP GRID (Exact iOS 8 iPhone 6 Plus Replica) */
              <div className="flex-1 flex flex-col justify-between p-2.5 pt-1.5 bg-gradient-to-b from-[#257be5] via-[#1a61c4] to-[#0f3b7d] overflow-hidden relative">
                {/* Ambient iOS Bokeh Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.18),transparent_45%)] pointer-events-none" />

                {/* Main Apps Grid - 5 Rows matching iOS 8 reference image */}
                <div className="grid grid-cols-4 gap-y-2 gap-x-1.5 relative z-10">
                  {/* ROW 1 */}
                  {/* Messages */}
                  <button onClick={() => setActiveApp('messages')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="relative size-11 rounded-[13px] bg-gradient-to-b from-[#34C759] to-[#28A745] flex items-center justify-center text-white shadow-md border border-white/20">
                      <MessageSquare className="size-5 fill-white" />
                      <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-[#FF3B30] text-white text-[8.5px] font-bold flex items-center justify-center ring-2 ring-black">1</span>
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Messages</span>
                  </button>

                  {/* Calendar */}
                  <button onClick={() => setActiveApp('calendar')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-white text-black shadow-md border border-white/20 flex flex-col items-center justify-center leading-none overflow-hidden">
                      <span className="text-[7.5px] font-bold text-[#FF3B30] uppercase tracking-tighter pt-0.5">Monday</span>
                      <span className="text-[17px] font-light font-sans text-black leading-none pb-0.5">10</span>
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Calendar</span>
                  </button>

                  {/* Photos */}
                  <button onClick={() => setActiveApp('photos')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-white flex items-center justify-center text-white shadow-md border border-white/20">
                      <ImageIcon className="size-5 text-[#FF2D55]" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Photos</span>
                  </button>

                  {/* Camera */}
                  <button onClick={() => setActiveApp('camera')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#9A9A9E] via-[#5A5A5E] to-[#3A3A3C] flex items-center justify-center text-white shadow-md border border-white/20">
                      <Camera className="size-5" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Camera</span>
                  </button>

                  {/* ROW 2 */}
                  {/* Weather */}
                  <button onClick={() => setActiveApp('safari')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#0A84FF] to-[#0055B3] flex items-center justify-center text-white shadow-md border border-white/20">
                      <Sun className="size-5 text-[#FFD60A]" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Weather</span>
                  </button>

                  {/* Clock */}
                  <button onClick={() => setActiveApp('clock')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-black text-white shadow-md border border-white/20 flex items-center justify-center">
                      <Clock className="size-5 text-[#FF9F0A]" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Clock</span>
                  </button>

                  {/* Maps */}
                  <button onClick={() => setActiveApp('maps')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#30D158] via-[#FF9F0A] to-[#0A84FF] flex items-center justify-center text-white shadow-md border border-white/20">
                      <MapPin className="size-5" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Maps</span>
                  </button>

                  {/* Videos */}
                  <button onClick={() => setActiveApp('photos')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#5856D6] to-[#3A3A3C] flex items-center justify-center text-white shadow-md border border-white/20">
                      <Film className="size-5" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Videos</span>
                  </button>

                  {/* ROW 3 */}
                  {/* Notes */}
                  <button onClick={() => setActiveApp('notes')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-[#FFD60A] text-black shadow-md border border-white/20 flex flex-col items-center justify-center">
                      <FileText className="size-5" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Notes</span>
                  </button>

                  {/* Reminders */}
                  <button onClick={() => setActiveApp('notes')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-white text-black shadow-md border border-white/20 flex items-center justify-center">
                      <CheckSquare className="size-5 text-[#0A84FF]" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Reminders</span>
                  </button>

                  {/* Stocks */}
                  <button onClick={() => setActiveApp('calculator')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-[#1C1C1E] text-white shadow-md border border-white/20 flex items-center justify-center">
                      <TrendingUp className="size-5 text-[#30D158]" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Stocks</span>
                  </button>

                  {/* Game Center */}
                  <button onClick={() => setActiveApp('contacts')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-white text-black shadow-md border border-white/20 flex items-center justify-center">
                      <Gamepad2 className="size-5 text-[#FF2D55]" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Game Center</span>
                  </button>

                  {/* ROW 4 */}
                  {/* Newsstand */}
                  <button onClick={() => setActiveApp('files')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#8E8E93] to-[#48484A] flex items-center justify-center text-white shadow-md border border-white/20">
                      <Newspaper className="size-5" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Newsstand</span>
                  </button>

                  {/* iTunes Store */}
                  <button onClick={() => setActiveApp('emails')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#FF2D55] to-[#AF52DE] flex items-center justify-center text-white shadow-md border border-white/20">
                      <Music className="size-5" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">iTunes Store</span>
                  </button>

                  {/* App Store */}
                  <button onClick={() => setActiveApp('safari')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#0A84FF] to-[#0055B3] flex items-center justify-center text-white shadow-md border border-white/20 font-mono font-bold text-base">
                      A
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">App Store</span>
                  </button>

                  {/* Passbook */}
                  <button onClick={() => setActiveApp('banking')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#30D158] via-[#FF9F0A] to-[#0A84FF] flex items-center justify-center text-white shadow-md border border-white/20">
                      <Wallet className="size-5" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Passbook</span>
                  </button>

                  {/* ROW 5 */}
                  {/* Compass */}
                  <button onClick={() => setActiveApp('maps')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-black text-white shadow-md border border-white/20 flex items-center justify-center">
                      <Compass className="size-5 text-[#FF3B30]" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Compass</span>
                  </button>

                  {/* Settings */}
                  <button onClick={() => setActiveApp('settings')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#8E8E93] to-[#3A3A3C] flex items-center justify-center text-white shadow-md border border-white/20">
                      <Settings className="size-5" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Settings</span>
                  </button>
                </div>

                {/* Page Indicator Dots */}
                <div className="flex items-center justify-center gap-1.5 py-0.5 relative z-10">
                  <span className="size-1.5 rounded-full bg-white shadow-sm" />
                  <span className="size-1.5 rounded-full bg-white/40 shadow-sm" />
                </div>

                {/* iOS 8 FROSTED GLASS DOCK (4 Bottom Apps - Guaranteed 100% Fully Visible) */}
                <div className="h-16 rounded-[22px] bg-white/20 backdrop-blur-xl border border-white/25 px-2 py-1 flex items-center justify-around shadow-2xl shrink-0 relative z-10 mb-0.5">
                  {/* Phone */}
                  <button onClick={() => setActiveApp('phone')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#34C759] to-[#248A3D] flex items-center justify-center text-white shadow-md border border-white/20">
                      <Phone className="size-5 fill-white" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Phone</span>
                  </button>

                  {/* Mail */}
                  <button onClick={() => setActiveApp('emails')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#0A84FF] to-[#0055B3] flex items-center justify-center text-white shadow-md border border-white/20">
                      <Mail className="size-5" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Mail</span>
                  </button>

                  {/* Safari */}
                  <button onClick={() => setActiveApp('safari')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#0A84FF] via-[#0066CC] to-[#004080] flex items-center justify-center text-white shadow-md border border-white/20">
                      <Globe className="size-5" />
                    </div>
                    <span className="text-[9.5px] font-medium text-white mt-0.5 drop-shadow">Safari</span>
                  </button>

                  {/* Music */}
                  <button onClick={() => setActiveApp('photos')} className="flex flex-col items-center active:scale-90 transition-transform">
                    <div className="size-11 rounded-[13px] bg-gradient-to-b from-[#FF2D55] to-[#D70015] flex items-center justify-center text-white shadow-md border border-white/20">
                      <Music className="size-5" />
                    </div>
                    <span className="text-[9px] font-medium text-white mt-0.5 drop-shadow">Music</span>
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
