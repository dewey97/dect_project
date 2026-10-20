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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getUnreadFeedbackCount } from "@/lib/actions/feedback-actions";

interface NavGroup {
  groupName: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    groupName: "TỔNG QUAN",
    items: [
      { name: "Dashboard", href: "/studio", icon: LayoutDashboard },
      { name: "Danh sách Vụ Án", href: "/studio/cases", icon: Folders },
    ],
  },
  {
    groupName: "STUDIO ENGINES",
    items: [
      { name: "Map Studio", href: "/studio/map", icon: Map },
      { name: "Dossier Studio", href: "/studio/dossier", icon: FileText },
      {
        name: "Checkpoint Studio",
        href: "/studio/checkpoints",
        icon: ListChecks,
      },
    ],
  },
  {
    groupName: "VẬN HÀNH",
    items: [
      { name: "Người chơi", href: "/studio/players", icon: Users },
      {
        name: "Góp ý & Báo lỗi",
        href: "/studio/feedbacks",
        icon: MessageSquare,
      },
      { name: "Cài đặt Hệ thống", href: "/studio/settings", icon: Settings },
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
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* HEADER */}
      <div className="p-4 h-16 flex items-center justify-between shrink-0 border-b border-white/10">
        <Link
          href="/studio"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80 min-w-0"
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
              isCollapsed && "mx-auto mt-0",
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
      <nav className="flex-1 px-2.5 py-4 space-y-5 overflow-y-auto overflow-x-hidden">
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
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary/15 text-primary font-medium border border-primary/25 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 hover:bg-zinc-800/40",
                    isCollapsed && "justify-center px-0",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-zinc-400 group-hover:text-zinc-200",
                    )}
                  />

                  {!isCollapsed && (
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
      <div className="p-3 border-t border-white/10">
        <div
          className={cn("flex items-center gap-1.5", isCollapsed && "flex-col")}
        >
          {/* Exit Studio */}
          <Link
            href="/"
            title={isCollapsed ? "Thoát Studio" : undefined}
            className={cn(
              "flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors",
              isCollapsed && "justify-center w-full px-0",
            )}
          >
            <LogOut className="size-3.5 shrink-0" />
            {!isCollapsed && <span>Thoát</span>}
          </Link>

          {/* Notifications */}
          <Link
            href="/studio/feedbacks"
            title="Góp ý & Báo lỗi"
            className="relative p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800/50"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500 animate-pulse border border-zinc-950" />
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}
