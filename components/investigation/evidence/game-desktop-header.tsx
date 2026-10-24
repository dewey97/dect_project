"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Users } from "lucide-react";
import { BrandMark } from "@/components/investigation/brand-mark";
import { UserNav } from "@/components/auth/user-nav";
import { useRoomSync } from "@/components/investigation/room-sync-context";
import { RoomModal } from "@/components/investigation/room-modal";
import { cn } from "@/lib/utils";

interface GameDesktopHeaderProps {
  className?: string;
}

/**
 * Desktop Header dành riêng cho màn hình chơi game trực tuyến (/evidence/web).
 * Bố cục 3 cột đối xứng đảm bảo cụm Nav ở giữa luôn căn chính giữa tuyệt đối.
 * Chiều cao h-14 (56px) tạo độ thoáng và logo/avatar được căn giữa trục dọc hoàn hảo.
 */
export function GameDesktopHeader({ className }: GameDesktopHeaderProps) {
  const { roomCode } = useRoomSync();
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "hidden lg:flex w-full shrink-0 z-40 border-b border-border/10 bg-card/90 backdrop-blur-md h-14",
          className
        )}
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* CỘT TRÁI: Logo XPLORE căn giữa trục dọc hoàn hảo */}
          <div className="w-56 h-full flex items-center justify-start">
            <BrandMark
              href="/"
              className="h-full flex items-center"
              imageClassName="h-5.5 w-auto block object-contain"
            />
          </div>

          {/* CỘT GIỮA: 2 mục gameplay thiết yếu (Cẩm nang & Chơi nhóm) căn giữa tuyệt đối */}
          <nav className="flex-1 flex items-center justify-center gap-3 font-sans text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            {/* 1. Cẩm nang phá án */}
            <Link
              href="/how-to-play"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-white/5 hover:text-primary transition-all cursor-pointer"
              title="Mở cẩm nang quy tắc phá án trong tab mới"
            >
              <BookOpen className="size-3.5 text-amber-500/80" />
              <span>Cẩm nang</span>
            </Link>

            {/* 2. Chơi nhóm đồng bộ thời gian thực */}
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer",
                roomCode
                  ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
                  : "hover:bg-white/5 hover:text-primary"
              )}
              title={
                roomCode
                  ? `Đang trong phòng đồng bộ: ${roomCode}`
                  : "Tạo hoặc tham gia phòng chơi nhóm nhiều người"
              }
            >
              <Users
                className={cn(
                  "size-3.5",
                  roomCode ? "text-emerald-400" : "text-amber-500/80"
                )}
              />
              <span>Chơi nhóm</span>
              {roomCode && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold tracking-normal">
                  {roomCode}
                </span>
              )}
            </button>
          </nav>

          {/* CỘT PHẢI: Avatar Profile thu nhỏ, cân bằng chiều rộng đối xứng */}
          <div className="w-56 h-full flex items-center justify-end gap-3 text-muted-foreground">
            <UserNav size="sm" />
          </div>
        </div>
      </header>

      {/* MODAL PHÒNG CHƠI NHÓM */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
      />
    </>
  );
}
