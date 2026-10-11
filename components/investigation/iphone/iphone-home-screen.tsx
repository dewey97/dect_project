"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type IPhoneApp =
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

interface IPhoneHomeScreenProps {
  onOpenApp: (app: IPhoneApp) => void;
  unreadMessages?: number;
  missedCalls?: number;
}

interface AppItem {
  id: string;
  name: string;
  icon: string;
  appTarget: IPhoneApp;
  badge?: number | string;
}

export function IPhoneHomeScreen({
  onOpenApp,
  unreadMessages = 1,
  missedCalls = 0,
}: IPhoneHomeScreenProps) {
  // Only apps with REAL investigation / gameplay functionality
  const gridApps: AppItem[] = [
    // Row 1
    {
      id: "messages",
      name: "Messages",
      icon: "/images/cases/case_000/phone/icons/messages.png",
      appTarget: "messages",
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
      id: "photos",
      name: "Photos",
      icon: "/images/cases/case_000/phone/icons/photos.png",
      appTarget: null,
    },
    {
      id: "camera",
      name: "Camera",
      icon: "/images/cases/case_000/phone/icons/camera.png",
      appTarget: null,
    },
    {
      id: "maps",
      name: "Maps",
      icon: "/images/cases/case_000/phone/icons/maps.png",
      appTarget: "maps",
    },

    // Row 2
    {
      id: "notes",
      name: "Notes",
      icon: "/images/cases/case_000/phone/icons/notes.png",
      appTarget: "notes",
    },
    {
      id: "settings",
      name: "Settings",
      icon: "/images/cases/case_000/phone/icons/settings.png",
      appTarget: "settings",
    },
  ];

  // 4 Dock Apps at the bottom (Figma Node 14:40: w:74, h:74)
  const dockApps: AppItem[] = [
    {
      id: "phone",
      name: "Phone",
      icon: "/images/cases/case_000/phone/icons/phone.png",
      appTarget: "phone",
      badge: missedCalls > 0 ? missedCalls : undefined,
    },
    {
      id: "contacts",
      name: "Contacts",
      icon: "/images/cases/case_000/phone/icons/contacts.png",
      appTarget: "contacts",
    },
    {
      id: "safari",
      name: "Safari",
      icon: "/images/cases/case_000/phone/icons/safari.png",
      appTarget: "safari",
    },
    {
      id: "music",
      name: "Music",
      icon: "/images/cases/case_000/phone/icons/music.png",
      appTarget: "phone",
    },
  ];

  return (
    <div className="relative w-full h-full select-none overflow-hidden z-10 font-sans">
      {/* 1. TOP MAIN APP GRID: 4 columns x 4 rows
          Exact Figma AST metrics:
          - Screen: 375px width
          - 4 columns, each 93.75px (25% width)
          - Icon size: exactly 74px x 74px (centered in 93.75px column, leaving ~9.8px side margins)
          - Row pitch: 111px per row
          - Top offset: 16px below status bar (y = 36px from screen top)
      */}
      <div className="absolute inset-x-0 top-[16px] grid grid-cols-4">
        {gridApps.map((app) => (
          <div
            key={app.id}
            className="h-[111px] flex flex-col items-center justify-start"
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
              <div className="relative w-[74px] h-[74px] shrink-0">
                <img
                  src={app.icon}
                  alt={app.name}
                  className="w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
                {/* Dynamic Notification Badge (if not already baked into icon) */}
                {app.badge && app.id !== "messages" && (
                  <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-[#FF3B30] text-white text-[12px] font-sans font-bold flex items-center justify-center border-2 border-white shadow-sm z-20">
                    {app.badge}
                  </span>
                )}
              </div>
              <span className="mt-[4px] text-[12px] font-sans font-medium text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate max-w-[84px] text-center">
                {app.name}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* 2. PAGE INDICATOR (Exact Figma Node between Apps and Dock: y ≈ 485px) */}
      <div className="absolute inset-x-0 top-[470px] flex items-center justify-center gap-[6px]">
        <span className="size-[6px] rounded-full bg-white shadow-xs" />
        <span className="size-[6px] rounded-full bg-white/40 shadow-xs" />
      </div>

      {/* 3. AUTHENTIC iOS 9 DOCK (Exact Figma Node 14:40)
          - Height: 111px
          - Bottom: 0 (pinned to screen bottom)
          - 4 columns, each 93.75px
          - Icon size: 74px x 74px
          - Frosted glass: bg-white/25 backdrop-blur-2xl
      */}
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
                <div className="relative w-[74px] h-[74px] shrink-0">
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                  {/* Dynamic Badge for dock app */}
                  {app.badge && (
                    <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-[#FF3B30] text-white text-[12px] font-sans font-bold flex items-center justify-center border-2 border-white shadow-sm z-20">
                      {app.badge}
                    </span>
                  )}
                </div>
                <span className="mt-[4px] text-[12px] font-sans font-medium text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate max-w-[84px] text-center">
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
