"use client";

import Link from "next/link";
import { BrandMark } from "@/components/investigation/brand-mark";
import { UserNav } from "@/components/auth/user-nav";
import { cn } from "@/lib/utils";

interface GameDesktopHeaderProps {
  className?: string;
}

/**
 * Desktop Header dành riêng cho màn hình chơi game trực tuyến (/evidence/web).
 * Bố cục 3 cột đối xứng (Logo trái, Nav giữa, Avatar phải) giúp menu ở giữa luôn được căn chính giữa tuyệt đối.
 * Logo và Avatar được thu gọn thanh thoát để tối ưu không gian cho màn hình phá án.
 */
export function GameDesktopHeader({ className }: GameDesktopHeaderProps) {
  return (
    <header
      className={cn(
        "hidden lg:flex w-full shrink-0 z-40 border-b border-border/10 bg-card/90 backdrop-blur-md h-12",
        className
      )}
    >
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* CỘT TRÁI: Logo XPLORE thu nhỏ gọn */}
        <div className="w-56 flex items-center justify-start">
          <BrandMark href="/" imageClassName="h-5 w-auto" />
        </div>

        {/* CỘT GIỮA: Cụm Navigation căn giữa tuyệt đối */}
        <nav className="flex-1 flex items-center justify-center gap-6 font-sans text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          <Link href="/#bocanh" className="hover:text-primary transition-colors">
            Bối cảnh
          </Link>
          <Link href="/#vuan" className="hover:text-primary transition-colors">
            Vụ án
          </Link>
          <Link
            href="/#trai-nghiem-dieu-tra"
            className="hover:text-primary transition-colors"
          >
            Trải nghiệm phá án
          </Link>
          <Link
            href="/how-to-play"
            className="hover:text-primary transition-colors"
          >
            Cách chơi
          </Link>
          <Link href="/#danhgia" className="hover:text-primary transition-colors">
            Đánh giá
          </Link>
          <Link href="/#faq" className="hover:text-primary transition-colors">
            Hỏi & Đáp
          </Link>
        </nav>

        {/* CỘT PHẢI: Avatar & Profile kích thước nhỏ gọn */}
        <div className="w-56 flex items-center justify-end gap-3 text-muted-foreground">
          <UserNav size="sm" />
        </div>
      </div>
    </header>
  );
}
