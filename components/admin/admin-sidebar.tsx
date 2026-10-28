"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Folders,
  Users,
  Settings,
  MessageSquare,
  Map,
  Files,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Archive,
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
        name: "Tài Liệu",
        shortName: "Tài liệu",
        href: "/studio/dossier",
        icon: Files,
      },
      {
        name: "Phone Studio",
        shortName: "Điện thoại",
        href: "/studio/phone",
        icon: Smartphone,
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
          "h-16 flex items-center shrink-0 border-b border-white/5",
          isCollapsed
            ? "justify-center px-2 py-3 h-14"
            : "justify-between px-4",
        )}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="group relative size-9 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 hover:border-primary/50 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Mở rộng thanh điều hướng"
          >
            <span className="font-mono text-primary font-bold text-xs tracking-tighter transition-all duration-200 group-hover:opacity-0 group-hover:scale-75">
              AS
            </span>
            <ChevronRight className="size-4 text-primary absolute opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="group flex items-center gap-2.5 transition-opacity hover:opacity-90 min-w-0 text-left cursor-pointer"
              title="Thu gọn thanh điều hướng"
            >
              <div className="relative size-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0 group-hover:bg-primary/30 group-hover:border-primary/50 transition-all">
                <span className="font-mono text-primary font-bold text-xs tracking-tighter transition-all duration-200 group-hover:opacity-0 group-hover:scale-75">
                  AS
                </span>
                <ChevronLeft className="size-4 text-primary absolute opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200" />
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold text-sm leading-tight text-zinc-100 truncate group-hover:text-primary transition-colors">
                  Admin Studio
                </h1>
              </div>
            </button>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                title="Thu gọn thanh điều hướng"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* NAVIGATION */}
      <nav
        className={cn(
          "flex-1 py-4 pb-6 space-y-4 overflow-y-auto overflow-x-hidden",
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
    </aside>
  );
}
