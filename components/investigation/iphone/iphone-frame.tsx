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
  const [isLocked, setIsLocked] = useState(false);
  const [activeApp, setActiveApp] = useState<IPhoneApp>(null);
  const [showAssistiveTouch, setShowAssistiveTouch] = useState(true);
  const [assistiveMenuOpen, setAssistiveMenuOpen] = useState(false);
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
    <div className="w-full h-full flex flex-col items-center justify-center select-none overflow-hidden py-0 sm:py-1">
      {/* Top Quick Control Bar (Về Home khi đang trong app, Đóng X) */}
      <div className="flex items-center justify-between w-full max-w-[390px] px-2 text-[11px] font-mono shrink-0 mb-1.5 z-40">
        <div>
          {activeApp && (
            <button
              onClick={() => setActiveApp(null)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#0A84FF]/40 bg-[#0A84FF]/15 text-[#0A84FF] hover:bg-[#0A84FF]/25 active:scale-95 font-semibold transition-all shadow-sm cursor-pointer"
              title="Thoát ứng dụng về Màn hình chính"
            >
              <Home className="size-3" />
              <span>Về Home</span>
            </button>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="size-7 rounded-lg flex items-center justify-center bg-[#1C1C1E] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10 active:scale-95 transition-all cursor-pointer shadow-sm ml-auto"
            title="Đóng điện thoại"
            aria-label="Đóng điện thoại"
          >
            <X className="size-4 text-[#d9a066]" />
          </button>
        )}
      </div>

      {/* PHONE CONTAINER: Exact iPhone 375x667 Canvas Aspect Ratio */}
      <div
        className={cn(
          "relative w-[375px] max-w-full h-[667px] max-h-full aspect-[375/667] transition-all flex flex-col overflow-hidden shadow-2xl shrink-0 my-auto",
          frameless
            ? "bg-black rounded-lg border border-white/20"
            : "bg-[#121214] rounded-xl p-2.5 border-[6px] border-[#2C2C30] ring-1 ring-white/10",
        )}
      >
        {!frameless && (
          <>
            {/* Hardware Sleep / Lock Button */}
            <button
              onClick={() => setIsLocked(!isLocked)}
              title={
                isLocked
                  ? "Nút Nguồn vật lý: Bấm để Mở khóa"
                  : "Nút Nguồn vật lý: Bấm để Khóa máy"
              }
              className="absolute -right-[7px] sm:-right-[9px] top-24 w-2 sm:w-2.5 h-12 sm:h-14 bg-[#3A3A3C] hover:bg-[#0A84FF] active:bg-[#0A84FF] rounded-r-md cursor-pointer border-y border-r border-white/20 shadow-md transition-colors z-30 group flex items-center justify-center"
            >
              <span className="sr-only">Nút Nguồn vật lý</span>
            </button>

            {/* Hardware Volume Buttons */}
            <div className="absolute -left-[6px] sm:-left-[8px] top-20 w-1.5 sm:w-2 h-6 bg-[#2C2C2E] rounded-l-sm border-y border-l border-white/20" />
            <div className="absolute -left-[6px] sm:-left-[8px] top-30 w-1.5 sm:w-2 h-9 bg-[#3A3A3C] rounded-l-md border-y border-l border-white/20" />
            <div className="absolute -left-[6px] sm:-left-[8px] top-42 w-1.5 sm:w-2 h-9 bg-[#3A3A3C] rounded-l-md border-y border-l border-white/20" />

            {/* Subtle Metallic Bezel Highlights */}
            <div className="absolute inset-0 rounded-lg pointer-events-none border border-white/10" />
          </>
        )}

        {/* SCREEN CONTAINER (Uses Authentic Figma Beach Wallpaper & Vignette) */}
        <div
          className={cn(
            "relative w-full h-full bg-[#0d2a45] bg-[url('/images/cases/case_000/phone/clean_beach_wallpaper.png')] bg-cover bg-center overflow-hidden flex flex-col",
            !frameless && "rounded-md",
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
              {/* Left: 5 Signal Dots + Carrier + Wi-Fi */}
              <div
                className="flex items-center gap-1.5"
                title="Trạng thái mạng: giffgaff"
              >
                <div className="flex items-center gap-[2.5px]">
                  <span
                    className={cn(
                      "size-1.5 rounded-full shadow-sm inline-block",
                      isLightStatusBar ? "bg-black" : "bg-white",
                    )}
                  />
                  <span
                    className={cn(
                      "size-1.5 rounded-full shadow-sm inline-block",
                      isLightStatusBar ? "bg-black" : "bg-white",
                    )}
                  />
                  <span
                    className={cn(
                      "size-1.5 rounded-full shadow-sm inline-block",
                      isLightStatusBar ? "bg-black" : "bg-white",
                    )}
                  />
                  <span
                    className={cn(
                      "size-1.5 rounded-full shadow-sm inline-block",
                      isLightStatusBar ? "bg-black" : "bg-white",
                    )}
                  />
                  <span
                    className={cn(
                      "size-1.5 rounded-full shadow-sm inline-block",
                      isLightStatusBar ? "bg-black" : "bg-white",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "font-medium text-[10px] ml-0.5",
                    isLightStatusBar
                      ? "text-black"
                      : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                  )}
                >
                  giffgaff
                </span>
                <svg
                  className={cn(
                    "size-3 fill-current",
                    isLightStatusBar ? "text-black" : "text-white drop-shadow",
                  )}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0012 4zm0 4.5c3.31 0 6.3 1.34 8.49 3.51L12 20.49 3.51 12.01A11.91 11.91 0 0112 8.5z" />
                </svg>
              </div>

              {/* Center: Clock 12:35 */}
              <div
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 font-semibold text-[11.5px] tracking-tight font-sans",
                  isLightStatusBar
                    ? "text-black"
                    : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                )}
              >
                12:35
              </div>

              {/* Right: Bluetooth + 20% + Solid Battery */}
              <div
                className={cn(
                  "flex items-center gap-1 font-semibold",
                  isLightStatusBar ? "text-black" : "text-white",
                )}
              >
                <span
                  className={cn(
                    "text-[9.5px] font-sans font-medium",
                    !isLightStatusBar &&
                      "drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                  )}
                >
                  20%
                </span>
                <div
                  className={cn(
                    "w-5 h-2.5 rounded-[3px] p-[1px] relative flex items-center shadow-sm",
                    isLightStatusBar
                      ? "border border-black/80 bg-black/10"
                      : "border border-white/90 bg-black/20",
                  )}
                >
                  <div className="h-full w-[20%] bg-[#FF3B30] rounded-[1px]" />
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

                {/* Lock Screen Header & Clock (Figma Spec 22:389) */}
                <div className="flex flex-col items-center pt-2 space-y-1 relative z-10">
                  <span className="text-[17px] font-normal text-white/95 tracking-[0.425px] drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] font-sans">
                    Thứ Sáu, 12 tháng 9
                  </span>
                  <span className="text-[76px] sm:text-[80px] font-extralight text-white tracking-[-1.9px] leading-[80px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)] font-sans">
                    12:35
                  </span>
                </div>

                {/* Center Empty Space (Không hiện thông báo/widget, giữ màn hình khóa sạch) */}
                <div className="flex-1 my-auto" />

                {/* Bottom Bar: Classic iOS 9 "slide to unlock" + Camera Glyph (Figma Node 22:417) */}
                <div className="relative z-10 w-full flex flex-col items-center pb-2 pt-1">
                  {/* Control Center Drag Indicator (Node 22:419: 36x4px, blur 12px, margin-bottom 24px) */}
                  <div className="w-[36px] h-[4px] bg-white/35 rounded-full backdrop-blur-[12px] mb-4" />

                  {/* Shimmer Slider Row */}
                  <div className="w-full flex items-center justify-between px-3 relative">
                    <div className="w-11" />{" "}
                    {/* Spacer to center the shimmer text */}
                    {/* Shimmer "slide to unlock" Action (Node 22:424) */}
                    <div
                      onClick={() => setIsLocked(false)}
                      className="flex items-center gap-1 cursor-pointer group active:opacity-60 transition-opacity select-none"
                      title="Bấm hoặc vuốt để mở khóa"
                    >
                      <span className="ios-shimmer-text font-extralight text-[16px] sm:text-[18px] tracking-[0.5px]">
                        › trượt để mở khóa
                      </span>
                    </div>
                    {/* Bottom-right Camera Quick-Action Glyph (Node 22:421) */}
                    <div
                      className="size-[44px] rounded-full bg-white/10 backdrop-blur-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-white/10 flex items-center justify-center text-white/70 select-none opacity-60"
                      title="Máy ảnh (Tạm thời khóa)"
                    >
                      <svg
                        className="w-[18.33px] h-[16.5px] fill-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                        viewBox="0 0 19 17"
                      >
                        <path d="M4 4h3l2-2h6l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm8 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeApp ? (
              /* 2. ACTIVE APP RUNNING */
              <div className="flex-1 min-h-0 flex flex-col h-full bg-black overflow-hidden">
                {activeApp === "messages" && (
                  <MessagesApp onBackToHome={() => setActiveApp(null)} />
                )}
                {activeApp === "phone" && (
                  <PhoneApp
                    initialTab="recents"
                    onBackToHome={() => setActiveApp(null)}
                  />
                )}
                {activeApp === "safari" && (
                  <SafariApp
                    history={history}
                    onBackToHome={() => setActiveApp(null)}
                  />
                )}
                {activeApp === "notes" && (
                  <NotesApp
                    notes={notes}
                    onBackToHome={() => setActiveApp(null)}
                  />
                )}
                {activeApp === "photos" && (
                  <PhotosApp
                    photos={photos}
                    onBackToHome={() => setActiveApp(null)}
                  />
                )}
                {activeApp === "maps" && (
                  <MapsApp onBackToHome={() => setActiveApp(null)} />
                )}
                {activeApp === "contacts" && (
                  <PhoneApp
                    initialTab="contacts"
                    onBackToHome={() => setActiveApp(null)}
                  />
                )}
                {activeApp === "banking" && (
                  <BankingApp onBackToHome={() => setActiveApp(null)} />
                )}
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
                            setActiveApp(null);
                            setAssistiveMenuOpen(false);
                          }}
                          className="p-3 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors cursor-pointer"
                        >
                          <Home className="size-5 text-[#0A84FF]" />
                          <span className="text-[9.5px]">Màn hình chính</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsLocked(true);
                            setAssistiveMenuOpen(false);
                          }}
                          className="p-3 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors cursor-pointer"
                        >
                          <Lock className="size-5 text-[#FF9F0A]" />
                          <span className="text-[9.5px]">Khóa máy</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveApp("messages");
                            setAssistiveMenuOpen(false);
                          }}
                          className="p-3 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors cursor-pointer"
                        >
                          <MessageSquare className="size-5 text-[#30D158]" />
                          <span className="text-[9.5px]">Tin nhắn</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveApp("contacts");
                            setAssistiveMenuOpen(false);
                          }}
                          className="p-3 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex flex-col items-center gap-1.5 text-white transition-colors cursor-pointer"
                        >
                          <Users className="size-5 text-[#0A84FF]" />
                          <span className="text-[9.5px]">Danh bạ</span>
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
        </div>
      </div>
    </div>
  );
}
