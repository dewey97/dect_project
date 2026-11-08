"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, ShoppingBag } from "lucide-react";
import { BrandMark } from "@/components/investigation/brand-mark";
import { UserNav } from "@/components/auth/user-nav";
import { LandingBanner } from "@/components/public/landing-banner";
import { cn } from "@/lib/utils";

export function LandingNavbar({
  active = "none",
  rightSlot,
}: {
  active?: "cases" | "home" | "how-to-play" | "none";
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}) {
  return (
    <>
      <LandingBanner />
      <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-card/90 backdrop-blur-md font-sans">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6 lg:py-4">
          {/* Left Side: Brand + Left-aligned Navigation */}
          <div className="flex items-center gap-5 sm:gap-7">
            <BrandMark href="/" />

            <nav className="flex items-center gap-4 sm:gap-6 font-sans text-xs sm:text-sm font-medium text-muted-foreground">
              <Link
                href="/cases"
                className={cn(
                  "transition-colors hover:text-primary",
                  active === "cases" ? "text-primary font-semibold" : ""
                )}
              >
                Kho Vụ án
              </Link>
              <Link
                href="/#trai-nghiem-dieu-tra"
                className={cn(
                  "hidden md:inline transition-colors hover:text-primary",
                  active === "home" ? "hover:text-primary" : ""
                )}
              >
                Trải nghiệm phá án
              </Link>
              <Link
                href="/how-to-play"
                className={cn(
                  "hidden md:inline transition-colors hover:text-primary",
                  active === "how-to-play" ? "text-primary font-semibold" : ""
                )}
              >
                Cách chơi
              </Link>
              <Link
                href="/#faq"
                className="hidden sm:inline transition-colors hover:text-primary"
              >
                Hỏi & Đáp
              </Link>
            </nav>
          </div>

          {/* Right Side: Notification Bell + Shopping Bag + User Avatar (No Search icon, no 'Vào chơi' or 'Chưa sở hữu') */}
          <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
            {/* Notification Bell */}
            <Link
              href="/#faq"
              className="relative flex size-8 items-center justify-center rounded-full transition-colors hover:bg-card hover:text-primary"
              title="Thông báo vụ án"
              aria-label="Thông báo vụ án"
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-amber-500 ring-2 ring-background" />
            </Link>

            {/* Shopping Bag / Orders */}
            <Link
              href="/cases"
              className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-card hover:text-primary"
              title="Bộ hồ sơ vụ án"
              aria-label="Bộ hồ sơ vụ án"
            >
              <ShoppingBag className="size-4" />
            </Link>

            {/* Optional extra slot (if needed in specific standalone pages) */}
            {rightSlot}

            {/* User Avatar Dropdown */}
            <UserNav />
          </div>
        </div>
      </header>
    </>
  );
}
