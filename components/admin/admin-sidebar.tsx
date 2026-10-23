"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Folders,
  Users,
  Settings,
  LogOut,
  MessageSquare,
  Bell,
  ExternalLink,
  Map,
  FileText,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  UserRound,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getUnreadFeedbackCount } from "@/lib/actions/feedback-actions";

interface NavGroup {
  groupName: string;
  items: {
    name: string;
    shortName: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    groupName: "TỔNG QUAN",
    items: [
      {
        name: "Dashboard",
        shortName: "Tổng quan",
        href: "/studio",
        icon: LayoutDashboard,
      },
      {
        name: "Danh sách Vụ Án",
        shortName: "Vụ án",
        href: "/studio/cases",
        icon: Folders,
      },
    ],
  },
  {
    groupName: "STUDIO ENGINES",
    items: [
      { name: "Map Studio", shortName: "Map", href: "/studio/map", icon: Map },
      {
        name: "Dossier Studio",
        shortName: "Hồ sơ",
        href: "/studio/dossier",
        icon: FileText,
      },
      {
        name: "Phone Studio",
        shortName: "Điện thoại",
        href: "/studio/phone",
        icon: Smartphone,
      },
      {
        name: "Nhân vật",
        shortName: "Nhân vật",
        href: "/studio/characters",
        icon: UserRound,
      },
      {
        name: "Checkpoint Studio",
        shortName: "Checkpoint",
        href: "/studio/checkpoints",
        icon: ListChecks,
      },
    ],
  },
  {
    groupName: "VẬN HÀNH",
    items: [
      {
        name: "Người chơi",
        shortName: "Players",
        href: "/studio/players",
        icon: Users,
      },
      {
        name: "Góp ý & Báo lỗi",
        shortName: "Góp ý",
        href: "/studio/feedbacks",
        icon: MessageSquare,
      },
      {
        name: "Cài đặt Hệ thống",
        shortName: "Cài đặt",
        href: "/studio/settings",
        icon: Settings,
      },
    ],
  },
];

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUnreadFeedbackCount().then((res) => {
      if (res.success) setUnreadCount(res.count);
    });
  }, [pathname]);

  return (
    <aside
      className={cn(
        "border-r border-white/10 bg-zinc-950/80 backdrop-blur-md flex flex-col h-full z-20 relative transition-all duration-300 shrink-0",
        isCollapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* HEADER */}
      <div
        className={cn(
          "p-4 h-16 flex items-center shrink-0 border-b border-white/10",
          isCollapsed
            ? "flex-col justify-center gap-1.5 p-2 h-auto py-3"
            : "justify-between",
        )}
      >
        <Link
          href="/studio"
          className={cn(
            "flex items-center gap-2.5 transition-opacity hover:opacity-80 min-w-0",
            isCollapsed && "flex-col gap-1 text-center",
          )}
        >
          <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
            <span className="font-mono text-primary font-bold text-xs tracking-tighter">
              AS
            </span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-semibold text-sm leading-tight text-zinc-100 truncate">
                Admin Studio
              </h1>
            </div>
          )}
        </Link>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              "p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors",
              isCollapsed && "mx-auto mt-0.5",
            )}
            title={
              isCollapsed
                ? "Mở rộng thanh điều hướng"
                : "Thu gọn thanh điều hướng"
            }
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav
        className={cn(
          "flex-1 py-4 space-y-4 overflow-y-auto overflow-x-hidden",
          isCollapsed ? "px-1.5 space-y-3" : "px-2.5 space-y-5",
        )}
      >
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-semibold">
                {group.groupName}
              </div>
            )}
            {isCollapsed && groupIdx > 0 && (
              <div className="mx-2 my-2 h-px bg-white/5" />
            )}
            {group.items.map((item) => {
              const isActive =
                item.href === "/studio"
                  ? pathname === "/studio"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={cn(
                    "rounded-lg text-sm transition-all duration-200 group relative",
                    isCollapsed
                      ? "flex flex-col items-center justify-center py-2 px-1 text-center gap-1"
                      : "flex items-center gap-3 px-2.5 py-2",
                    isActive
                      ? "bg-primary/15 text-primary font-medium border border-primary/25 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 hover:bg-zinc-800/40",
                  )}
                >
                  <item.icon
                    className={cn(
                      "transition-colors",
                      isCollapsed ? "size-4.5" : "size-4 shrink-0",
                      isActive
                        ? "text-primary"
                        : "text-zinc-400 group-hover:text-zinc-200",
                    )}
                  />

                  {isCollapsed ? (
                    <span
                      className={cn(
                        "text-[10px] font-medium leading-none tracking-tight block max-w-full truncate scale-95 origin-center",
                        isActive
                          ? "text-primary font-semibold"
                          : "text-zinc-400 group-hover:text-zinc-200",
                      )}
                    >
                      {item.shortName}
                    </span>
                  ) : (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span
                      className={cn(
                        "text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold",
                        isActive
                          ? "bg-primary/25 text-primary"
                          : "bg-zinc-800 text-zinc-400",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Feedback Notification Pill inside button */}
                  {item.href === "/studio/feedbacks" && unreadCount > 0 && (
                    <span
                      className={cn(
                        "size-2 rounded-full bg-red-500 animate-pulse",
                        isCollapsed ? "absolute top-1.5 right-1.5" : "ml-auto",
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="p-2.5 border-t border-white/10">
        <div
          className={cn(
            "flex items-center gap-1.5",
            isCollapsed && "flex-col gap-2",
          )}
        >
          {/* Exit Studio */}
          <Link
            href="/"
            title="Thoát Studio"
            className={cn(
              "rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors",
              isCollapsed
                ? "flex flex-col items-center justify-center py-1.5 w-full gap-1 text-[10px]"
                : "flex-1 flex items-center gap-2 px-2.5 py-1.5",
            )}
          >
            <LogOut className="size-3.5 shrink-0" />
            <span>Thoát</span>
          </Link>

          {/* Notifications */}
          <Link
            href="/studio/feedbacks"
            title="Góp ý & Báo lỗi"
            className={cn(
              "relative text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800/50",
              isCollapsed
                ? "flex flex-col items-center justify-center py-1.5 w-full gap-1 text-[10px]"
                : "p-1.5",
            )}
          >
            <div className="relative">
              <Bell className="size-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-red-500 animate-pulse border border-zinc-950" />
              )}
            </div>
            {isCollapsed && <span>Thông báo</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
