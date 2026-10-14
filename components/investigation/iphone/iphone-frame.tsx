"use client";

import { useState, useRef } from "react";
import {
  Lock,
  Home,
  ShieldCheck,
  MessageSquare,
  Users,
  X,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Device,
  Conversation,
  Photo,
  Document,
  BrowserHistory,
  RecoveredFile,
} from "@/lib/types";

// Apps
import { MessagesApp } from "./apps/messages-app";
import { PhoneApp } from "./apps/phone-app";
import { SafariApp } from "./apps/safari-app";
import { NotesApp } from "./apps/notes-app";
import { PhotosApp } from "./apps/photos-app";
import { MapsApp } from "./apps/maps-app";
import { BankingApp } from "./apps/banking-app";
import { IPhoneHomeScreen } from "./iphone-home-screen";

interface IPhoneFrameProps {
  device: Device;
  threads: Conversation[];
  photos: Photo[];
  notes: Document[];
  history: BrowserHistory[];
  files: RecoveredFile[];
  onSwitchToForensics?: () => void;
  onClose?: () => void;
}

type IPhoneApp =
  | "messages"
  | "phone"
  | "safari"
  | "notes"
  | "photos"
  | "maps"
  | "contacts"
  | "banking"
  | "settings"
  | null;

export function IPhoneFrame({
  device,
  threads,
  photos,
  notes,
  history,
  files,
  onSwitchToForensics,
  onClose,
}: IPhoneFrameProps) {
  const frameless = false;
  // Mới mở điện thoại luôn xuất hiện màn hình khóa (Lockscreen) đầu tiên
  const [isLocked, setIsLocked] = useState(true);
  const [activeApp, setActiveApp] = useState<IPhoneApp>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [screenPage, setScreenPage] = useState<number>(0);

  // Lockscreen drag to unlock
  const lockDragStartY = useRef<number | null>(null);

  const handleLockTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    lockDragStartY.current = clientY;
  };

  const handleLockTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (lockDragStartY.current === null) return;
    const clientY =
      "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;
    const diffY = lockDragStartY.current - clientY;
    if (diffY > 50) {
      setIsLocked(false);
    }
    lockDragStartY.current = null;
  };

  // Light status bar (black text) on light-theme apps per Figma spec
  const isLightStatusBar =
    !isLocked && (activeApp === "phone" || activeApp === "messages");

  return (
    <div className="w-full h-full flex flex-col items-center justify-center select-none overflow-y-auto no-scrollbar py-2">
      {/* Top Header Bar: Tiêu đề "ĐIỆN THOẠI NẠN NHÂN" & Nút "Quay lại" */}
      <div className="flex items-center justify-between w-full max-w-[415px] px-2 shrink-0 mb-2 z-40">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#FF453A] animate-pulse" />
          <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-300 font-semibold drop-shadow">
            Điện thoại nạn nhân
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1C1E]/90 text-zinc-300 hover:text-white hover:bg-white/15 border border-white/10 active:scale-95 transition-all cursor-pointer shadow-md text-[12px] font-sans font-medium"
            title="Quay lại hiện trường"
            aria-label="Quay lại"
          >
            <ArrowLeft className="size-3.5 text-[#d9a066]" />
            <span>Quay lại</span>
          </button>
        )}
      </div>

      {/* PHONE CHASSIS: Classic Anodized Silver/Grey iPhone Faceplate (Full 100% Scale) */}
      <div
        data-iphone-frame="true"
        className={cn(
          "relative w-[415px] max-w-full transition-all flex flex-col items-center shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] shrink-0 my-auto iphone-frame no-scrollbar",
          frameless
            ? "bg-black rounded-lg border border-white/20 h-[667px]"
            : "bg-[#D8D8DC] rounded-[48px] pt-3 pb-3 px-[20px] border-[2.5px] border-[#A1A1A6] ring-1 ring-black/25 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_25px_60px_rgba(0,0,0,0.6)]",
        )}
      >
        {!frameless && (
          <>
            {/* Top Bezel: Authentic Classic iPhone (Proximity sensor, Front Camera & Speaker) */}
            <div className="w-full h-[72px] flex flex-col items-center justify-center shrink-0 relative">
              {/* Proximity / Light Sensor dot */}
              <div className="size-1.5 rounded-full bg-[#3F3F46] opacity-80 mb-2 shadow-inner" />
              
              <div className="flex items-center justify-center relative w-full">
                {/* Front Camera Lens (Positioned to the left of ear speaker) */}
                <div className="absolute left-1/2 -translate-x-14 size-3 rounded-full bg-[#27272A] border border-black/30 shadow-inner flex items-center justify-center">
                  <div className="size-1 rounded-full bg-[#0369a1]/60" />
                </div>
                {/* Ear Speaker Grill (Silver/Grey mesh) */}
                <div className="w-14 h-1.5 rounded-full bg-[#52525B] border border-black/30 shadow-inner" />
              </div>
            </div>

            {/* Subtle Metallic Chamfer Edge Highlight */}
            <div className="absolute inset-0 rounded-[48px] pointer-events-none border border-white/40 shadow-[inset_0_0_3px_rgba(0,0,0,0.1)]" />
          </>
        )}

        {/* SCREEN CONTAINER: Compact 375x600 iOS Screen Dimension */}
        <div
          className={cn(
            "relative w-[375px] max-w-full h-[600px] shrink-0 bg-[#0d2a45] bg-[url('/images/cases/case_000/phone/clean_beach_wallpaper.png')] bg-cover bg-center overflow-hidden flex flex-col iphone-screen no-scrollbar",
            !frameless && "rounded-lg border border-black/50 shadow-inner",
          )}
        >
          {/* Authentic iOS Vignette Gradient (Figma Node 14:39) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/15 pointer-events-none z-0" />

          {/* iOS TOP STATUS BAR (Figma spec: height 20px, pad [0,8px]) */}
          <div
            className={cn(
              "relative z-30 h-[20px] px-2 flex items-center justify-between text-[11px] font-sans tracking-tight shrink-0 select-none",
                isLightStatusBar
                  ? "bg-[#FFFFFF] text-black"
                  : "bg-transparent text-white",
              )}
            >
              {/* Left: Empty Signal Dots + "Không có Dịch vụ" (No Service) */}
              <div
                className="flex items-center gap-1.5"
                title="Trạng thái mạng: Không có Dịch vụ"
              >
                <div className="flex items-center gap-[2.5px]">
                  <span
                    className={cn(
                      "size-1.5 rounded-full inline-block border",
                      isLightStatusBar ? "border-black/50 bg-transparent" : "border-white/50 bg-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      "size-1.5 rounded-full inline-block border",
                      isLightStatusBar ? "border-black/50 bg-transparent" : "border-white/50 bg-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      "size-1.5 rounded-full inline-block border",
                      isLightStatusBar ? "border-black/50 bg-transparent" : "border-white/50 bg-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      "size-1.5 rounded-full inline-block border",
                      isLightStatusBar ? "border-black/50 bg-transparent" : "border-white/50 bg-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      "size-1.5 rounded-full inline-block border",
                      isLightStatusBar ? "border-black/50 bg-transparent" : "border-white/50 bg-transparent",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "font-medium text-[9.5px] ml-0.5 tracking-tight",
                    isLightStatusBar
                      ? "text-black"
                      : "text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                  )}
                >
                  Không có Dịch vụ
                </span>
              </div>

              {/* Center: Frozen Evidence Clock 21:30 */}
              <div
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 font-semibold text-[11.5px] tracking-tight font-sans",
                  isLightStatusBar
                    ? "text-black"
                    : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                )}
              >
                21:30
              </div>

              {/* Right: Critical Battery Icon (No percentage, No Bluetooth) */}
              <div
                className={cn(
                  "flex items-center gap-1",
                  isLightStatusBar ? "text-black" : "text-white",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-2.5 rounded-[3px] p-[1px] relative flex items-center shadow-sm",
                    isLightStatusBar
                      ? "border border-black/80 bg-black/10"
                      : "border border-white/90 bg-black/20",
                  )}
                >
                  <div className="h-full w-[15%] bg-[#FF3B30] rounded-[1px]" />
                  <div
                    className={cn(
                      "absolute -right-[3px] top-[2px] w-[2px] h-[4px] rounded-r-[1px]",
                      isLightStatusBar ? "bg-black/80" : "bg-white/90",
                    )}
                  />
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

                {/* Lock Screen Header & Clock (Frozen at Crime Scene Timestamp) */}
                <div className="flex flex-col items-center pt-2 space-y-1 relative z-10">
                  <span className="text-[17px] font-normal text-white/95 tracking-[0.425px] drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] font-sans">
                    Thứ Bảy, 23 tháng 7
                  </span>
                  <span className="text-[76px] sm:text-[80px] font-extralight text-white tracking-[-1.9px] leading-[80px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)] font-sans">
                    21:30
                  </span>
                </div>

                {/* Center Empty Space (Không hiện thông báo/widget, giữ màn hình khóa sạch) */}
                <div className="flex-1 my-auto" />

                {/* Bottom Bar: Clean subtle prompt for physical Home button */}
                <div className="relative z-10 w-full flex flex-col items-center pb-3 pt-1">
                  <div className="text-white/70 font-sans text-[13px] font-normal tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] animate-pulse">
                    Nhấn nút Home để mở khóa
                  </div>
                </div>
              </div>
            ) : activeApp ? (
              /* 2. ACTIVE APP RUNNING */
              <div className="flex-1 min-h-0 flex flex-col h-full bg-black overflow-hidden">
                {activeApp === "messages" && <MessagesApp />}
                {activeApp === "phone" && <PhoneApp initialTab="recents" />}
                {activeApp === "safari" && <SafariApp history={history} />}
                {activeApp === "notes" && <NotesApp notes={notes} />}
                {activeApp === "photos" && <PhotosApp photos={photos} />}
                {activeApp === "maps" && <MapsApp />}
                {activeApp === "contacts" && <PhoneApp initialTab="contacts" />}
                {activeApp === "banking" && <BankingApp />}
                {activeApp === "settings" && (
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
                        <span className="font-semibold text-white">
                          Nguyễn Văn Khang
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Kiểu máy:</span>
                        <span className="font-semibold">
                          iPhone 6s Plus (64GB, Space Gray)
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Số thuê bao:</span>
                        <span className="font-mono text-[#0A84FF]">
                          0904.888.666 (Viettel)
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Trạng thái mạng:</span>
                        <span className="text-[#FF453A] font-semibold">
                          Không có dịch vụ (No Service)
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Số IMEI:</span>
                        <span className="font-mono text-[11px]">
                          356984110294812
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Tình trạng pin:</span>
                        <span className="text-[#FF453A] font-bold">18%</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">
                          Cảm biến bảo mật:
                        </span>
                        <span className="text-white">Touch ID</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-[#8E8E93]">
                          Trích xuất pháp y:
                        </span>
                        <span className="text-[#30D158] font-bold flex items-center gap-1">
                          <ShieldCheck className="size-3.5" /> Đã trích xuất dữ
                          liệu
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 3. 100% CODE DOM AUTHENTIC iOS 9 HOME SCREEN (Figma individual icons + Grid + Frosted Glass Dock) */
              <IPhoneHomeScreen
                onOpenApp={(app) => setActiveApp(app)}
                unreadMessages={1}
                missedCalls={1}
              />
            )}

          </div>
        </div>

        {!frameless && (
          /* Bottom Bezel: Authentic Classic iPhone Touch ID (Symmetrical 72px Height) */
          <div className="w-full h-[72px] flex items-center justify-center shrink-0">
            <button
              onClick={() => {
                if (isLocked) {
                  // Mở khóa nếu đang ở lockscreen
                  setIsLocked(false);
                } else {
                  // Thoát về màn hình chính
                  setActiveApp(null);
                }
              }}
              className="group size-14 rounded-full bg-[#D8D8DC] border-[2px] border-[#A1A1A6] hover:border-[#71717A] active:scale-95 transition-all flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(0,0,0,0.06)] cursor-pointer relative"
              title="Nút Home vật lý (Touch ID): Bấm để về Màn hình chính hoặc Mở khóa"
            >
              {/* Touch ID Silver Chamfer Ring Accent */}
              <div className="absolute inset-[1.5px] rounded-full border-[1.5px] border-[#8E8E93] group-hover:border-[#52525B] pointer-events-none" />
              {/* Inner concave center */}
              <div className="size-9 rounded-full bg-[#D8D8DC] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] group-active:brightness-90 transition-all" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
