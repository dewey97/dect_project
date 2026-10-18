"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  X,
  EyeOff,
  Home,
  ArrowLeft,
} from "lucide-react";
import type { Device, Conversation, Photo, Email, Document, BrowserHistory, RecoveredFile } from "@/lib/types";

// Context & Engine
import { PhoneProvider, usePhone, type ActivePhoneApp } from "./core/phone-context";

// Chassis
import { IPhoneClassicChassis } from "./chassis/iphone-classic-chassis";
import { ModernPhoneChassis } from "./chassis/modern-phone-chassis";

// System Views
import { PhoneStatusBar } from "./system/status-bar";
import { LockScreen } from "./system/lock-screen";
import { IPhoneHomeScreen } from "./system/home-screen";

// Generic Apps
import { MessagesApp } from "./apps/messages-app";
import { PhoneApp } from "./apps/phone-app";
import { SafariApp } from "./apps/safari-app";
import { NotesApp } from "./apps/notes-app";
import { PhotosApp } from "./apps/photos-app";
import { MapsApp } from "./apps/maps-app";
import { BankingApp } from "./apps/banking-app";
import { CameraApp } from "./apps/camera-app";
import { SnakeApp } from "./apps/snake-game-app";
import { Game2048App } from "./apps/game-2048-app";
import { MinesweeperApp } from "./apps/minesweeper-app";
import { FlappyBirdApp } from "./apps/flappy-bird-app";
import { TetrisApp } from "./apps/tetris-app";

export interface PhoneSimulatorProps {
  device?: Partial<Device>;
  threads?: Conversation[];
  photos?: Photo[];
  emails?: Email[];
  notes?: Document[];
  history?: BrowserHistory[];
  files?: RecoveredFile[];
  frameless?: boolean;
  onClose?: () => void;
  onPinClue?: (clueId: string, metadata?: Record<string, unknown>) => void;
}

const DEFAULT_VICTIM_DEVICE: Device = {
  id: "dev-000-1",
  caseId: "case-000",
  evidenceId: "DEV-000-1",
  label: "Điện thoại nạn nhân",
  kind: "phone",
  owner: "Nguyễn Văn Khang",
  locked: false,
  status: "unlocked",
  recoveryLevel: 100,
  lastUpdated: "24/07/2016 // 17:55",
  description: "Điện thoại cá nhân của nạn nhân Khang",
};

/**
 * Nội dung hiển thị bên trong màn hình điện thoại (Screen Controller)
 */
function PhoneScreenContent({
  frameless = false,
  onClose,
}: {
  frameless?: boolean;
  onClose?: () => void;
}) {
  const {
    device,
    isLocked,
    activeApp,
    threads,
    photos,
    notes,
    history,
    unlock,
    openApp,
    goHome,
  } = usePhone();

  const isLightStatusBar =
    !isLocked && (activeApp === "messages" || activeApp === "notes");

  return (
    <>
      {/* iOS Status Bar */}
      <PhoneStatusBar
        time="21:30"
        isLight={isLightStatusBar}
        batteryLevel={15}
        serviceText="Không có Dịch vụ"
      />

      {/* Screen View Area */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
        {isLocked ? (
          <LockScreen
            time="21:30"
            date="Thứ Bảy, 23 tháng 7"
            onUnlock={unlock}
          />
        ) : activeApp ? (
          <div className="flex-1 min-h-0 flex flex-col h-full bg-black overflow-hidden">
            {activeApp === "messages" && (
              <MessagesApp onBackToHome={goHome} />
            )}
            {activeApp === "phone" && (
              <PhoneApp initialTab="keypad" onBackToHome={goHome} />
            )}
            {activeApp === "safari" && (
              <SafariApp history={history} onBackToHome={goHome} />
            )}
            {activeApp === "notes" && (
              <NotesApp notes={notes} onBackToHome={goHome} />
            )}
            {activeApp === "photos" && (
              <PhotosApp photos={photos} onBackToHome={goHome} />
            )}
            {activeApp === "camera" && (
              <CameraApp onBackToHome={goHome} />
            )}
            {activeApp === "maps" && (
              <MapsApp onBackToHome={goHome} />
            )}
            {activeApp === "contacts" && (
              <PhoneApp initialTab="contacts" onBackToHome={goHome} />
            )}
            {activeApp === "banking" && (
              <BankingApp onBackToHome={goHome} />
            )}
            {activeApp === "snake" && (
              <SnakeApp onBackToHome={goHome} />
            )}
            {activeApp === "game2048" && (
              <Game2048App onBackToHome={goHome} />
            )}
            {activeApp === "minesweeper" && (
              <MinesweeperApp onBackToHome={goHome} />
            )}
            {activeApp === "flappybird" && (
              <FlappyBirdApp onBackToHome={goHome} />
            )}
            {activeApp === "tetris" && (
              <TetrisApp onBackToHome={goHome} />
            )}
            {activeApp === "settings" && (
              <div className="p-4 text-white space-y-4 font-sans overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#2C2C2E] pb-2">
                  <span className="w-8" />
                  <div className="text-[17px] font-bold">Cài đặt</div>
                  <span className="w-8" />
                </div>
                <div className="p-3.5 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] text-[12px] space-y-3">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[#8E8E93]">Chủ sở hữu:</span>
                    <span className="font-semibold text-white">
                      {device.owner || "Nguyễn Văn Khang"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[#8E8E93]">Kiểu máy:</span>
                    <span className="font-semibold">
                      {device.label || "iPhone 6s Plus (64GB, Space Gray)"}
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
          <IPhoneHomeScreen
            onOpenApp={(app) => openApp(app as ActivePhoneApp)}
            unreadMessages={1}
            missedCalls={1}
          />
        )}
      </div>
    </>
  );
}

/**
 * Shell kết nối Engine + Chassis thích hợp (Facade Component)
 */
function PhoneSimulatorShell({
  frameless = false,
  onClose,
}: {
  frameless?: boolean;
  onClose?: () => void;
}) {
  const { isLocked, unlock, goHome } = usePhone();

  const handleHomePress = () => {
    if (isLocked) {
      unlock();
    } else {
      goHome();
    }
  };

  return (
    <IPhoneClassicChassis
      frameless={frameless}
      onHomePress={handleHomePress}
    >
      <PhoneScreenContent frameless={frameless} onClose={onClose} />
    </IPhoneClassicChassis>
  );
}

/**
 * PhoneSimulator: Entry point module hóa dùng chung cho mọi Case
 */
export function PhoneSimulator({
  device = DEFAULT_VICTIM_DEVICE,
  threads = [],
  photos = [],
  notes = [],
  history = [],
  files = [],
  frameless = false,
  onClose,
  onPinClue,
}: PhoneSimulatorProps) {
  const activeDevice: Device = {
    ...DEFAULT_VICTIM_DEVICE,
    ...device,
  };

  return (
    <PhoneProvider
      device={activeDevice}
      threads={threads}
      photos={photos}
      notes={notes}
      history={history}
      files={files}
      onClose={onClose}
      onPinClue={onPinClue}
    >
      <PhoneSimulatorShell frameless={frameless} onClose={onClose} />
    </PhoneProvider>
  );
}
export default PhoneSimulator;
