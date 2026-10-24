"use client";

import { useState } from "react";
import { BrandMark } from "@/components/investigation/brand-mark";
import { UserNav } from "@/components/auth/user-nav";
import { useRoomSync } from "@/components/investigation/room-sync-context";
import { RoomModal } from "@/components/investigation/room-modal";
import { emitInvestigationEvent } from "@/lib/investigation-events";
import { cn } from "@/lib/utils";

interface GameDesktopHeaderProps {
  className?: string;
}

/**
 * Desktop Header dành riêng cho màn hình chơi game trực tuyến (/evidence/web).
 * Bố cục 3 cột đối xứng đảm bảo cụm Nav ở giữa luôn căn chính giữa tuyệt đối.
 * Hiển thị 3 lối tắt gameplay thiết yếu: Sổ tay hướng dẫn, Chơi nhóm, Báo lỗi.
 * Định dạng chữ proper case, không dùng uppercase, không kèm icon rườm rà.
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

          {/* CỘT GIỮA: Điều hướng gameplay tinh gọn (Proper case, không icon) */}
          <nav className="flex-1 flex items-center justify-center gap-7 font-sans text-sm font-medium text-muted-foreground">
            {/* 1. Sổ tay hướng dẫn (mở modal cẩm nang nghiệp vụ gameplay) */}
            <button
              type="button"
              onClick={() => emitInvestigationEvent("OPEN_GUIDE")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Sổ tay hướng dẫn
            </button>

            {/* 2. Chơi nhóm đồng bộ thời gian thực */}
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(true)}
              className="hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <span>Chơi nhóm</span>
              {roomCode && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold">
                  {roomCode}
                </span>
              )}
            </button>

            {/* 3. Báo lỗi & Góp ý */}
            <button
              type="button"
              onClick={() => emitInvestigationEvent("OPEN_FEEDBACK")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Báo lỗi
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
