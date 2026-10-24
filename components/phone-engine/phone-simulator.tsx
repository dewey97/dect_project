"use client";

import React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { ShieldCheck, X, EyeOff, Home, ArrowLeft } from "lucide-react";
import type {
  Device,
  Conversation,
  Photo,
  Email,
  Document,
  BrowserHistory,
  RecoveredFile,
} from "@/lib/types";

// Context & Engine
import {
  PhoneProvider,
  usePhone,
  type ActivePhoneApp,
} from "./core/phone-context";
import { EvidenceAnchorProvider } from "./core/evidence-anchor-context";

// Chassis
import { DeviceChassis } from "./chassis/device-chassis";

// System Views
import { PhoneStatusBar } from "./system/status-bar";
import { LockScreen } from "./system/lock-screen";
import { IPhoneHomeScreen } from "./system/home-screen";

// Light apps — always eagerly imported (small, used frequently)
import { MessagesApp } from "./apps/messages-app";
import { PhoneApp } from "./apps/phone-app";
import { SafariApp } from "./apps/safari-app";
import { NotesApp } from "./apps/notes-app";
import { PhotosApp } from "./apps/photos-app";
import { BankingApp } from "./apps/banking-app";
import { CameraApp } from "./apps/camera-app";
import { getActiveCaseId, getActiveVictim } from "@/lib/cases/case-characters";
import { usePhoneApps } from "@/lib/hooks/use-phone-apps";

// Heavy apps — lazy loaded only when the user opens them (cuts initial JS bundle significantly)
// MapsApp: 970 lines, fetches 1.5MB map JSON, contains full SVG renderer
const MapsApp = dynamic(
  () => import("./apps/maps-app").then((m) => ({ default: m.MapsApp })),
  { ssr: false },
);
// Game apps: large canvas-based bundles, rarely opened, no SSR needed
const SnakeApp = dynamic(
  () => import("./apps/snake-game-app").then((m) => ({ default: m.SnakeApp })),
  { ssr: false },
);
const Game2048App = dynamic(
  () =>
    import("./apps/game-2048-app").then((m) => ({ default: m.Game2048App })),
  { ssr: false },
);
const MinesweeperApp = dynamic(
  () =>
    import("./apps/minesweeper-app").then((m) => ({
      default: m.MinesweeperApp,
    })),
  { ssr: false },
);
const FlappyBirdApp = dynamic(
  () =>
    import("./apps/flappy-bird-app").then((m) => ({
      default: m.FlappyBirdApp,
    })),
  { ssr: false },
);
const TetrisApp = dynamic(
  () => import("./apps/tetris-app").then((m) => ({ default: m.TetrisApp })),
  { ssr: false },
);

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

const BASE_DEVICE: Device = {
  id: "dev-victim",
  caseId: "",
  code: "DEV-VICTIM",
  evidenceId: "DEV-VICTIM",
  label: "Điện thoại nạn nhân",
  kind: "phone",
  owner: "",
  locked: false,
  status: "unlocked",
  recoveryLevel: 100,
  lastUpdated: "",
  description: "",
};

/** Thông tin máy lấy từ nạn nhân của vụ án (bảng `case_characters`). */
function getCaseVictimDevice(): Partial<Device> {
  const victim = getActiveVictim();
  if (!victim) return {};
  return {
    caseId: getActiveCaseId() || "",
    owner: victim.name,
    ...(victim.device?.label ? { label: victim.device.label } : {}),
    lastUpdated: victim.device?.lastUpdated || "",
    description: victim.device?.description || "",
    model_id: victim.device?.model_id,
    chassis: victim.device?.chassis || "iphone_classic",
    wallpaper_url: victim.device?.wallpaper_url,
    lockscreen_url: victim.device?.lockscreen_url,
    selfie_url: victim.device?.selfie_url,
    passcode: victim.device?.passcode,
    status_bar: victim.device?.status_bar,
    lock_screen: victim.device?.lock_screen,
    settings_info: victim.device?.settings_info,
  };
}

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

  const { apps } = usePhoneApps(
    device.caseId || getActiveCaseId() || "case_000",
  );

  const isLightStatusBar =
    !isLocked && (activeApp === "messages" || activeApp === "notes");

  const statusBarTime = device.status_bar?.time || "21:30";
  const statusBarBattery = device.status_bar?.battery ?? 15;
  const statusBarService =
    device.status_bar?.service_text || "Không có Dịch vụ";

  const lockScreenTime = device.lock_screen?.time || statusBarTime;
  const lockScreenDate = device.lock_screen?.date || "Thứ Bảy, 23 tháng 7";

  return (
    <>
      {/* iOS Status Bar */}
      <PhoneStatusBar
        time={statusBarTime}
        isLight={isLightStatusBar}
        batteryLevel={statusBarBattery}
        serviceText={statusBarService}
      />

      {/* Screen View Area */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
        {isLocked ? (
          <LockScreen
            time={lockScreenTime}
            date={lockScreenDate}
            onUnlock={unlock}
          />
        ) : activeApp ? (
          <div className="flex-1 min-h-0 flex flex-col h-full bg-black overflow-hidden">
            {activeApp === "messages" && <MessagesApp onBackToHome={goHome} />}
            {activeApp === "phone" && (
              <PhoneApp initialTab="keypad" onBackToHome={goHome} />
            )}
            {activeApp === "safari" && (
              <SafariApp history={history} onBackToHome={goHome} />
            )}
            {activeApp === "notes" && (
              <NotesApp notes={notes} onBackToHome={goHome} />
            )}
            {activeApp === "photos" && <PhotosApp onBackToHome={goHome} />}
            {activeApp === "camera" && (
              <CameraApp onBackToHome={goHome} selfieUrl={device.selfie_url} />
            )}
            {activeApp === "maps" && <MapsApp onBackToHome={goHome} />}
            {activeApp === "contacts" && (
              <PhoneApp initialTab="contacts" onBackToHome={goHome} />
            )}
            {activeApp === "banking" && <BankingApp onBackToHome={goHome} />}
            {activeApp === "snake" && <SnakeApp onBackToHome={goHome} />}
            {activeApp === "game2048" && <Game2048App onBackToHome={goHome} />}
            {activeApp === "minesweeper" && (
              <MinesweeperApp onBackToHome={goHome} />
            )}
            {activeApp === "flappybird" && (
              <FlappyBirdApp onBackToHome={goHome} />
            )}
            {activeApp === "tetris" && <TetrisApp onBackToHome={goHome} />}
            {activeApp === "settings" &&
              (() => {
                const sInfo = device.settings_info || {};
                const standardKeys = new Set([
                  "owner",
                  "model",
                  "phone_number",
                  "network_status",
                  "imei",
                  "battery",
                  "security",
                ]);
                const extraEntries = Object.entries(sInfo).filter(
                  ([k]) => !standardKeys.has(k),
                );
                return (
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
                          {sInfo.owner ||
                            device.owner ||
                            getActiveVictim()?.name ||
                            "Nguyễn Văn Khang"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Kiểu máy:</span>
                        <span className="font-semibold">
                          {sInfo.model ||
                            device.label ||
                            "iPhone 6s Plus (64GB, Space Gray)"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Số thuê bao:</span>
                        <span className="font-mono text-[#0A84FF]">
                          {sInfo.phone_number || "0904.888.666 (Viettel)"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Trạng thái mạng:</span>
                        <span className="text-[#FF453A] font-semibold">
                          {sInfo.network_status ||
                            device.status_bar?.service_text ||
                            "Không có dịch vụ (No Service)"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Số IMEI:</span>
                        <span className="font-mono text-[11px]">
                          {sInfo.imei || "356984110294812"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">Tình trạng pin:</span>
                        <span className="text-[#FF453A] font-bold">
                          {sInfo.battery ||
                            (device.status_bar?.battery != null
                              ? `${device.status_bar.battery}%`
                              : "18%")}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8E8E93]">
                          Cảm biến bảo mật:
                        </span>
                        <span className="text-white">
                          {sInfo.security || "Touch ID"}
                        </span>
                      </div>
                      {extraEntries.map(([key, val]) => (
                        <div
                          key={key}
                          className="flex justify-between border-b border-white/5 pb-2"
                        >
                          <span className="text-[#8E8E93] capitalize">
                            {key.replace(/_/g, " ")}:
                          </span>
                          <span className="text-white font-medium">
                            {String(val)}
                          </span>
                        </div>
                      ))}
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
                );
              })()}
          </div>
        ) : (
          <IPhoneHomeScreen
            onOpenApp={(app) => openApp(app as ActivePhoneApp)}
            unreadMessages={1}
            missedCalls={1}
            apps={apps}
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
  const { isLocked, unlock, goHome, device } = usePhone();

  const handleHomePress = () => {
    if (isLocked) {
      unlock();
    } else {
      goHome();
    }
  };

  const wallpaperUrl = device.wallpaper_url;
  const modelId =
    device.model_id ||
    (device.chassis === "iphone_modern" ? "iphone_15" : "iphone_classic");

  return (
    <DeviceChassis
      modelId={modelId}
      frameless={frameless}
      onHomePress={handleHomePress}
      wallpaperUrl={wallpaperUrl}
    >
      <PhoneScreenContent frameless={frameless} onClose={onClose} />
    </DeviceChassis>
  );
}

/**
 * PhoneSimulator: Entry point module hóa dùng chung cho mọi Case
 */
export function PhoneSimulator({
  device,
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
    ...BASE_DEVICE,
    ...getCaseVictimDevice(),
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
      <EvidenceAnchorProvider>
        <PhoneSimulatorShell frameless={frameless} onClose={onClose} />
      </EvidenceAnchorProvider>
    </PhoneProvider>
  );
}
export default PhoneSimulator;
