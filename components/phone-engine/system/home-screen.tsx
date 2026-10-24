"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import type { DbCasePhoneApp } from "@/lib/types/database";

export type IPhoneApp =
  | "messages"
  | "phone"
  | "safari"
  | "notes"
  | "photos"
  | "camera"
  | "maps"
  | "contacts"
  | "banking"
  | "settings"
  | "snake"
  | "game2048"
  | "minesweeper"
  | "flappybird"
  | "tetris"
  | null;

export const DEFAULT_APP_ICONS: Record<string, string> = {
  photos: "/images/phone/icons/photos.png",
  camera: "/images/phone/icons/camera.png",
  maps: "/images/phone/icons/maps.png",
  notes: "/images/phone/icons/notes.png",
  banking: "/images/phone/icons/banking.svg",
  flappybird: "/images/phone/icons/flappybird.svg",
  tetris: "/images/phone/icons/tetris.svg",
  snake: "/images/phone/icons/snake.svg",
  game2048: "/images/phone/icons/game2048.svg",
  minesweeper: "/images/phone/icons/minesweeper.svg",
  settings: "/images/phone/icons/settings.png",
  phone: "/images/phone/icons/phone.png",
  messages: "/images/phone/icons/messages.png",
  contacts: "/images/phone/icons/contacts.png",
  safari: "/images/phone/icons/safari.png",
};

interface IPhoneHomeScreenProps {
  onOpenApp: (app: IPhoneApp) => void;
  unreadMessages?: number;
  missedCalls?: number;
  apps?: DbCasePhoneApp[];
  completedCheckpoints?: Set<string>;
}

interface AppItem {
  id: string;
  name: string;
  icon?: string;
  emojiIcon?: string;
  appTarget: IPhoneApp;
  badge?: number | string;
  isLocked?: boolean;
}

export function IPhoneHomeScreen({
  onOpenApp,
  apps,
  completedCheckpoints,
}: IPhoneHomeScreenProps) {
  // If apps passed from DB, resolve dynamically
  const resolvedGridApps: AppItem[] = React.useMemo(() => {
    if (apps && apps.length > 0) {
      return apps
        .filter((a) => !a.is_dock)
        .sort((a, b) => a.slot_index - b.slot_index)
        .map((a) => {
          const isLocked = Boolean(
            a.is_locked &&
            a.unlock_checkpoint_id &&
            !completedCheckpoints?.has(a.unlock_checkpoint_id),
          );
          return {
            id: a.id || a.app_type,
            name: a.display_name,
            icon:
              a.icon_url ||
              DEFAULT_APP_ICONS[a.app_type] ||
              DEFAULT_APP_ICONS.settings,
            appTarget: a.app_type as IPhoneApp,
            isLocked,
          };
        });
    }

    return [
      // Row 1: Core Forensic Apps
      {
        id: "photos",
        name: "Ảnh",
        icon: DEFAULT_APP_ICONS.photos,
        appTarget: "photos",
      },
      {
        id: "camera",
        name: "Camera",
        icon: DEFAULT_APP_ICONS.camera,
        appTarget: "camera",
      },
      {
        id: "maps",
        name: "Bản đồ",
        icon: DEFAULT_APP_ICONS.maps,
        appTarget: "maps",
      },
      {
        id: "notes",
        name: "Ghi chú",
        icon: DEFAULT_APP_ICONS.notes,
        appTarget: "notes",
      },
      // Row 2: Finance & Retro Classics
      {
        id: "banking",
        name: "Ngân hàng",
        icon: DEFAULT_APP_ICONS.banking,
        appTarget: "banking",
      },
      {
        id: "flappybird",
        name: "Flappy Bird",
        icon: DEFAULT_APP_ICONS.flappybird,
        appTarget: "flappybird",
      },
      {
        id: "tetris",
        name: "Xếp Gạch",
        icon: DEFAULT_APP_ICONS.tetris,
        appTarget: "tetris",
      },
      {
        id: "snake",
        name: "Snake '97",
        icon: DEFAULT_APP_ICONS.snake,
        appTarget: "snake",
      },
      // Row 3: 2048, Dò Mìn & Cài đặt
      {
        id: "game2048",
        name: "2048",
        icon: DEFAULT_APP_ICONS.game2048,
        appTarget: "game2048",
      },
      {
        id: "minesweeper",
        name: "Dò Mìn",
        icon: DEFAULT_APP_ICONS.minesweeper,
        appTarget: "minesweeper",
      },
      {
        id: "settings",
        name: "Cài đặt",
        icon: DEFAULT_APP_ICONS.settings,
        appTarget: "settings",
      },
    ];
  }, [apps, completedCheckpoints]);

  const resolvedDockApps: AppItem[] = React.useMemo(() => {
    if (apps && apps.length > 0) {
      return apps
        .filter((a) => a.is_dock)
        .sort((a, b) => a.slot_index - b.slot_index)
        .map((a) => {
          const isLocked = Boolean(
            a.is_locked &&
            a.unlock_checkpoint_id &&
            !completedCheckpoints?.has(a.unlock_checkpoint_id),
          );
          return {
            id: a.id || a.app_type,
            name: a.display_name,
            icon:
              a.icon_url ||
              DEFAULT_APP_ICONS[a.app_type] ||
              DEFAULT_APP_ICONS.phone,
            appTarget: a.app_type as IPhoneApp,
            isLocked,
          };
        });
    }

    return [
      {
        id: "phone",
        name: "Điện thoại",
        icon: DEFAULT_APP_ICONS.phone,
        appTarget: "phone",
      },
      {
        id: "messages",
        name: "Tin nhắn",
        icon: DEFAULT_APP_ICONS.messages,
        appTarget: "messages",
      },
      {
        id: "contacts",
        name: "Danh bạ",
        icon: DEFAULT_APP_ICONS.contacts,
        appTarget: "contacts",
      },
      {
        id: "safari",
        name: "Safari",
        icon: DEFAULT_APP_ICONS.safari,
        appTarget: "safari",
      },
    ];
  }, [apps, completedCheckpoints]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden z-10 font-sans">
      {/* 1. TOP MAIN APP GRID: 4 columns x 4 rows */}
      <div className="absolute inset-x-0 top-[16px] grid grid-cols-4">
        {resolvedGridApps.map((app) => (
          <div
            key={app.id}
            className="h-[106px] flex flex-col items-center justify-start"
          >
            <button
              onClick={() =>
                !app.isLocked && app.appTarget && onOpenApp(app.appTarget)
              }
              disabled={!app.appTarget || app.isLocked}
              className={cn(
                "group flex flex-col items-center focus:outline-none transition-transform duration-100",
                app.appTarget && !app.isLocked
                  ? "cursor-pointer active:scale-95 active:brightness-90"
                  : "cursor-default opacity-60",
              )}
              title={app.isLocked ? `${app.name} (Bị khóa)` : app.name}
            >
              {/* KÍCH THƯỚC ĐỒNG BỘ 100%: 60px x 60px chuẩn Squircle Apple iOS */}
              <div className="relative size-[60px] shrink-0 flex items-center justify-center rounded-[14px] overflow-hidden shadow-[0_3px_8px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
                <img
                  src={app.icon}
                  alt={app.name}
                  className={cn(
                    "w-full h-full object-cover pointer-events-none select-none",
                    app.isLocked && "grayscale brightness-75",
                  )}
                  draggable={false}
                />
                {app.isLocked && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock className="size-4 text-white drop-shadow" />
                  </div>
                )}
              </div>
              <span className="mt-[5px] text-[11px] font-sans font-medium text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate max-w-[80px] text-center">
                {app.name}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* 2. PAGE INDICATOR (Sits neatly right above the Dock) */}
      <div className="absolute inset-x-0 bottom-[100px] flex items-center justify-center gap-[6px]">
        <span className="size-[6px] rounded-full bg-white shadow-xs" />
        <span className="size-[6px] rounded-full bg-white/40 shadow-xs" />
      </div>

      {/* 3. AUTHENTIC iOS 9 DOCK (Exact Figma Node 14:40) */}
      <div className="absolute inset-x-0 bottom-0 h-[111px] bg-white/25 backdrop-blur-2xl border-t border-white/20 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
        {/* Dock Highlight Reflection on top edge */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        <div className="w-full h-full grid grid-cols-4 pt-[9px]">
          {resolvedDockApps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col items-center justify-start"
            >
              <button
                onClick={() =>
                  !app.isLocked && app.appTarget && onOpenApp(app.appTarget)
                }
                disabled={!app.appTarget || app.isLocked}
                className={cn(
                  "group flex flex-col items-center focus:outline-none transition-transform duration-100",
                  app.appTarget && !app.isLocked
                    ? "cursor-pointer active:scale-95 active:brightness-90"
                    : "cursor-default opacity-60",
                )}
                title={app.isLocked ? `${app.name} (Bị khóa)` : app.name}
              >
                <div className="relative size-[60px] shrink-0 flex items-center justify-center rounded-[14px] overflow-hidden shadow-[0_3px_8px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
                  <img
                    src={app.icon}
                    alt={app.name}
                    className={cn(
                      "w-full h-full object-cover pointer-events-none select-none",
                      app.isLocked && "grayscale brightness-75",
                    )}
                    draggable={false}
                  />
                  {app.isLocked && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Lock className="size-4 text-white drop-shadow" />
                    </div>
                  )}
                </div>
                <span className="mt-[5px] text-[11px] font-sans font-medium text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate max-w-[80px] text-center">
                  {app.name}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
