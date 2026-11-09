"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, Menu, ShoppingBag } from "lucide-react";
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
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-[oklch(0.21_0.009_265/0.9)] backdrop-blur-md font-sans">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6 lg:py-4">
          {/* Left Side: Brand + Left-aligned Navigation */}
          <div className="flex items-center gap-5 sm:gap-7">
            <BrandMark href="/" />

            <nav className="flex items-center gap-4 sm:gap-6 font-sans text-sm font-medium text-muted-foreground">
              <Link
                href="/cases"
                className={cn(
                  "whitespace-nowrap transition-colors hover:text-primary",
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

          {/* Mobile menu: native popover, chỉ hiện dưới md */}
          <div
            id="landing-mobile-menu"
            popover="auto"
            className="m-0 mt-14 ml-auto mr-4 w-56 rounded-lg border border-border/40 bg-card p-2 font-sans text-base text-foreground shadow-xl"
          >
            {[
              { href: "/#tinh-nang", label: "Trải nghiệm phá án" },
              { href: "/how-to-play", label: "Cách chơi" },
              { href: "/#faq", label: "Hỏi & Đáp" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => document.getElementById("landing-mobile-menu")?.hidePopover()}
                className="flex min-h-11 items-center rounded-md px-3 hover:bg-secondary hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side: Notification Bell + Shopping Bag + User Avatar (No Search icon, no 'Vào chơi' or 'Chưa sở hữu') */}
          <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
            {/* Notification Bell */}
            <Link
              href="/#faq"
              className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-card hover:text-primary"
              title="Thông báo vụ án"
              aria-label="Thông báo vụ án"
            >
              <Bell className="size-5" />
            </Link>

            {/* Shopping Bag / Orders */}
            <Link
              href="/cases"
              className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-card hover:text-primary"
              title="Bộ hồ sơ vụ án"
              aria-label="Bộ hồ sơ vụ án"
            >
              <ShoppingBag className="size-5" />
            </Link>

            {/* Optional extra slot (if needed in specific standalone pages) */}
            {rightSlot}

            <button
              type="button"
              popoverTarget="landing-mobile-menu"
              className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-card hover:text-primary md:hidden"
              aria-label="Mở menu"
            >
              <Menu className="size-5" />
            </button>

            {/* User Avatar Dropdown */}
            <UserNav />
          </div>
        </div>
      </header>
    </>
  );
}
