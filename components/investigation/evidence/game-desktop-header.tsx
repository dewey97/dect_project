"use client";

import { useState, useRef, useEffect } from "react";
import { BrandMark } from "@/components/investigation/brand-mark";
import { UserNav } from "@/components/auth/user-nav";
import { GoogleSheetsPresenceBar } from "@/components/investigation/google-sheets-presence-bar";
import { RoomModal } from "@/components/investigation/room-modal";
import { emitInvestigationEvent } from "@/lib/investigation-events";
import { cn } from "@/lib/utils";
import { FileText, Layers, ChevronDown, Eye } from "lucide-react";

interface GameDesktopHeaderProps {
  className?: string;
  viewMode?: "single" | "canvas";
  onViewModeChange?: (mode: "single" | "canvas") => void;
  isBoardOpen?: boolean;
  onToggleBoard?: () => void;
}

/**
 * Desktop Header dành riêng cho màn hình chơi game trực tuyến (/evidence/web).
 * Bố cục 3 cột đối xứng đảm bảo cụm Nav ở giữa luôn căn chính giữa tuyệt đối.
 * Hiển thị các lối tắt gameplay thiết yếu: Bảng điều tra, Sổ tay hướng dẫn, Chơi nhóm, Báo lỗi.
 * Định dạng chữ proper case, không dùng uppercase, không kèm icon rườm rà.
 * Cột phải tích hợp bộ chuyển đổi chế độ xem Soi đơn / Bàn hồ sơ và avatar profile.
 */
export function GameDesktopHeader({
  className,
  viewMode = "single",
  onViewModeChange,
  isBoardOpen,
  onToggleBoard,
}: GameDesktopHeaderProps) {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const viewDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        viewDropdownRef.current &&
        !viewDropdownRef.current.contains(e.target as Node)
      ) {
        setIsViewDropdownOpen(false);
      }
    };
    if (isViewDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isViewDropdownOpen]);

  return (
    <>
      <header
        className={cn(
          "hidden lg:flex w-full shrink-0 z-40 border-b border-[#261b12]/80 bg-[#0d0a08]/95 backdrop-blur-md h-11",
          className
        )}
      >
        <div className="w-full px-4 sm:px-6 h-full flex items-center justify-between">
          {/* CỘT TRÁI: Logo XPLORE căn giữa trục dọc hoàn hảo */}
          <div className="w-64 h-full flex items-center justify-start">
            <BrandMark
              href="/"
              className="h-full flex items-center"
              imageClassName="h-3.5 w-auto block object-contain"
            />
          </div>

          {/* CỘT GIỮA: Điều hướng gameplay tinh gọn (Proper case, không icon) */}
          <nav className="flex-1 flex items-center justify-center gap-6 font-sans text-[13px] font-medium text-zinc-400">
            {/* 1. Kiểu xem: Dropdown chọn Bàn hồ sơ hoặc Xem lẻ */}
            {onViewModeChange && (
              <div className="relative" ref={viewDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsViewDropdownOpen((prev) => !prev)}
                  className={cn(
                    "hover:text-[#d9a066] transition-colors cursor-pointer inline-flex items-center gap-1.5",
                    isViewDropdownOpen && "text-[#d9a066]"
                  )}
                >
                  <span>Kiểu xem</span>
                  <ChevronDown
                    className={cn(
                      "size-3 text-zinc-500 transition-transform duration-200",
                      isViewDropdownOpen && "rotate-180 text-[#d9a066]"
                    )}
                  />
                </button>

                {isViewDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-36 bg-[#16100c]/98 border border-[#3e2e20] rounded-xl shadow-2xl p-1 z-50 text-xs font-sans backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        onViewModeChange("canvas");
                        setIsViewDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer",
                        viewMode === "canvas"
                          ? "bg-[#d9a066]/20 text-[#f4e8d8] font-semibold"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-[#201710]"
                      )}
                    >
                      <span>Bàn hồ sơ</span>
                      {viewMode === "canvas" && (
                        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onViewModeChange("single");
                        setIsViewDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer mt-0.5",
                        viewMode === "single"
                          ? "bg-[#d9a066]/20 text-[#f4e8d8] font-semibold"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-[#201710]"
                      )}
                    >
                      <span>Xem lẻ</span>
                      {viewMode === "single" && (
                        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. Sổ tay hướng dẫn (mở modal cẩm nang nghiệp vụ gameplay) */}
            <button
              type="button"
              onClick={() => emitInvestigationEvent("OPEN_GUIDE")}
              className="hover:text-[#d9a066] transition-colors cursor-pointer"
            >
              Sổ tay hướng dẫn
            </button>

            {/* 4. Chơi nhóm đồng bộ thời gian thực */}
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(true)}
              className="hover:text-[#d9a066] transition-colors cursor-pointer"
            >
              Chơi nhóm
            </button>

            {/* 5. Báo lỗi & Góp ý */}
            <button
              type="button"
              onClick={() => emitInvestigationEvent("OPEN_FEEDBACK")}
              className="hover:text-[#d9a066] transition-colors cursor-pointer"
            >
              Báo lỗi
            </button>
          </nav>

          {/* CỘT PHẢI: Dải Avatar đồng đội trực tuyến chuẩn Google Sheets + User Profile */}
          <div className="min-w-64 h-full flex items-center justify-end gap-3 text-zinc-400">
            <GoogleSheetsPresenceBar onOpenModal={() => setIsRoomModalOpen(true)} />
            <div className="w-px h-4 bg-border/20" />
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
