"use client";

import React from "react";
import { cn } from "@/lib/utils";

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

interface IPhoneHomeScreenProps {
  onOpenApp: (app: IPhoneApp) => void;
  unreadMessages?: number;
  missedCalls?: number;
}

interface AppItem {
  id: string;
  name: string;
  icon?: string;
  emojiIcon?: string;
  appTarget: IPhoneApp;
  badge?: number | string;
}

export function IPhoneHomeScreen({
  onOpenApp,
}: IPhoneHomeScreenProps) {
  // Only apps with REAL investigation / gameplay functionality
  const gridApps: AppItem[] = [
    // Row 1: Core Forensic Apps
    {
      id: "photos",
      name: "Ảnh",
      icon: "/images/cases/case_000/phone/icons/photos.png",
      appTarget: "photos",
    },
    {
      id: "camera",
      name: "Camera",
      icon: "/images/cases/case_000/phone/icons/camera.png",
      appTarget: "camera",
    },
    {
      id: "maps",
      name: "Bản đồ",
      icon: "/images/cases/case_000/phone/icons/maps.png",
      appTarget: "maps",
    },
    {
      id: "notes",
      name: "Ghi chú",
      icon: "/images/cases/case_000/phone/icons/notes.png",
      appTarget: "notes",
    },

    // Row 2: Finance & Retro Classics
    {
      id: "banking",
      name: "Ngân hàng",
      icon: "/images/cases/case_000/phone/icons/banking.svg",
      appTarget: "banking",
    },
    {
      id: "flappybird",
      name: "Flappy Bird",
      icon: "/images/cases/case_000/phone/icons/flappybird.svg",
      appTarget: "flappybird",
    },
    {
      id: "tetris",
      name: "Xếp Gạch",
      icon: "/images/cases/case_000/phone/icons/tetris.svg",
      appTarget: "tetris",
    },
    {
      id: "snake",
      name: "Snake '97",
      icon: "/images/cases/case_000/phone/icons/snake.svg",
      appTarget: "snake",
    },

    // Row 3: 2048, Dò Mìn & Cài đặt
    {
      id: "game2048",
      name: "2048",
      icon: "/images/cases/case_000/phone/icons/game2048.svg",
      appTarget: "game2048",
    },
    {
      id: "minesweeper",
      name: "Dò Mìn",
      icon: "/images/cases/case_000/phone/icons/minesweeper.svg",
      appTarget: "minesweeper",
    },
    {
      id: "settings",
      name: "Cài đặt",
      icon: "/images/cases/case_000/phone/icons/settings.png",
      appTarget: "settings",
    },
  ];

  // 4 Classic Dock Apps: Điện thoại, Tin nhắn, Danh bạ, Safari
  const dockApps: AppItem[] = [
    {
      id: "phone",
      name: "Điện thoại",
      icon: "/images/cases/case_000/phone/icons/phone.png",
      appTarget: "phone",
    },
    {
      id: "messages",
      name: "Tin nhắn",
      icon: "/images/cases/case_000/phone/icons/messages.png",
      appTarget: "messages",
    },
    {
      id: "contacts",
      name: "Danh bạ",
      icon: "/images/cases/case_000/phone/icons/contacts.png",
      appTarget: "contacts",
    },
    {
      id: "safari",
      name: "Safari",
      icon: "/images/cases/case_000/phone/icons/safari.png",
      appTarget: "safari",
    },
  ];

  return (
    <div className="relative w-full h-full select-none overflow-hidden z-10 font-sans">
      {/* 1. TOP MAIN APP GRID: 4 columns x 4 rows */}
      <div className="absolute inset-x-0 top-[16px] grid grid-cols-4">
        {gridApps.map((app) => (
          <div
            key={app.id}
            className="h-[106px] flex flex-col items-center justify-start"
          >
            <button
              onClick={() => app.appTarget && onOpenApp(app.appTarget)}
              disabled={!app.appTarget}
              className={cn(
                "group flex flex-col items-center focus:outline-none transition-transform duration-100",
                app.appTarget
                  ? "cursor-pointer active:scale-95 active:brightness-90"
                  : "cursor-default",
              )}
              title={app.name}
            >
              {/* KÍCH THƯỚC ĐỒNG BỘ 100%: 60px x 60px chuẩn Squircle Apple iOS */}
              <div className="relative size-[60px] shrink-0 flex items-center justify-center rounded-[14px] overflow-hidden shadow-[0_3px_8px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
                <img
                  src={app.icon}
                  alt={app.name}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
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
          {dockApps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col items-center justify-start"
            >
              <button
                onClick={() => app.appTarget && onOpenApp(app.appTarget)}
                className={cn(
                  "group flex flex-col items-center focus:outline-none transition-transform duration-100 cursor-pointer",
                  "active:scale-95 active:brightness-90",
                )}
                title={app.name}
              >
                <div className="relative size-[60px] shrink-0 flex items-center justify-center rounded-[14px] overflow-hidden shadow-[0_3px_8px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    draggable={false}
                  />
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
