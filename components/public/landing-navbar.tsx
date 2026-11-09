"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { BrandMark } from "@/components/investigation/brand-mark";
import { UserNav } from "@/components/auth/user-nav";
import { LandingBanner } from "@/components/public/landing-banner";
import { NotificationBell } from "@/components/public/notification-bell";
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
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-[oklch(0.21_0.009_265/0.9)] backdrop-blur-md font-sans">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6 lg:py-4">
          {/* Left Side: Brand + Left-aligned Navigation (Desktop) */}
          <div className="flex items-center gap-5 sm:gap-7">
            <BrandMark href="/" />

            <nav className="flex items-center gap-4 sm:gap-6 font-sans text-sm font-medium text-muted-foreground">
              <Link
                href="/cases"
                className={cn(
                  "hidden md:inline whitespace-nowrap transition-colors hover:text-primary",
                  active === "cases" ? "text-primary font-semibold" : ""
                )}
              >
                Kho Vụ án
              </Link>
              <Link
                href="/#tinh-nang"
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
                className="hidden md:inline transition-colors hover:text-primary"
              >
                Hỏi & Đáp
              </Link>
            </nav>
          </div>

          {/* Right Side: Notification Bell + Kho Vụ Án (icon chỉ hiện mobile) + Avatar Dropdown (tích hợp điều hướng mobile) */}
          <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground md:text-zinc-300">
            {/* Notification Bell + dropdown */}
            <NotificationBell />

            {/* Kho vụ án icon: Chỉ hiện trên mobile (dưới md) vì desktop đã có text link ở nav bên trái */}
            <Link
              href="/cases"
              className="flex md:hidden size-9 items-center justify-center rounded-full transition-colors hover:bg-card hover:text-primary"
              title="Kho vụ án"
              aria-label="Kho vụ án"
            >
              <ShoppingBag className="size-[18px]" />
            </Link>

            {/* Optional extra slot */}
            {rightSlot}

            {/* User Avatar Dropdown */}
            <UserNav />
          </div>
        </div>
      </header>
    </>
  );
}
