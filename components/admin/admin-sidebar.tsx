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
  Play,
  Bell,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getUnreadFeedbackCount } from "@/lib/actions/feedback-actions";

const globalNavItems = [
  { name: "Dashboard", href: "/studio", icon: LayoutDashboard },
  { name: "Danh sách Vụ Án", href: "/studio/cases", icon: Folders },
  { name: "Người chơi", href: "/studio/players", icon: Users },
  { name: "Góp ý & Báo lỗi", href: "/studio/feedbacks", icon: MessageSquare },
  { name: "Cài đặt Hệ thống", href: "/studio/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUnreadFeedbackCount().then((res) => {
      if (res.success) setUnreadCount(res.count);
    });
  }, [pathname]);

  return (
    <aside className="w-64 border-r border-border/40 bg-zinc-950/50 backdrop-blur-sm flex flex-col h-full z-20 relative transition-all duration-300">
      {/* HEADER */}
      <div className="p-6 h-24 flex items-center shrink-0 border-b border-border/20">
        <Link
          href="/studio"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="size-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="font-mono text-primary font-bold text-xs tracking-tighter">
              AS
            </span>
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight text-zinc-100">
              Admin Studio
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
              Live CMS Hub
            </p>
          </div>
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {globalNavItems.map((item) => {
          const isActive =
            item.href === "/studio"
              ? pathname === "/studio"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200",
                isActive
                  ? "bg-zinc-800/80 text-zinc-100 shadow-sm border border-white/5 font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40",
              )}
            >
              <item.icon
                className={cn(
                  "size-4",
                  isActive ? "text-primary" : "text-zinc-500",
                )}
              />
              {item.name}
            </Link>
          );
        })}

        {/* GOOGLE SHEETS LIVE CMS EXTERNAL LINK */}
        <a
          href="https://docs.google.com/spreadsheets/d/1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all duration-200 mt-4"
        >
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Google Sheet CMS
          </span>
          <ExternalLink className="size-3.5 opacity-70" />
        </a>
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="p-4 border-t border-border/40 space-y-2">
        {/* Launch Game / Playtest */}
        <Link
          href="/evidence/web"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all text-xs tracking-wider"
        >
          <Play className="size-4" fill="currentColor" />
          PLAYTEST CASE_000
        </Link>

        <div className="flex items-center gap-2 pt-2">
          {/* Exit Studio */}
          <Link
            href="/"
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
          >
            <LogOut className="size-4" />
            Exit
          </Link>

          {/* Notifications */}
          <Link
            href="/studio/feedbacks"
            className="relative p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800/50"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 animate-pulse border border-zinc-950" />
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}
