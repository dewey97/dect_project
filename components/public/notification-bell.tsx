"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, FolderOpen, Megaphone, Lock, Sparkles } from "lucide-react";
import {
  MOCK_NOTIFICATIONS,
  type NotificationKind,
} from "@/lib/data/notifications";
import { cn } from "@/lib/utils";

const READ_KEY = "xplore:notifications:read";

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  case: FolderOpen,
  promo: Megaphone,
  teaser: Lock,
  update: Sparkles,
};

function loadRead(): string[] {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRead(ids: string[]) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  } catch {
    /* private mode: bỏ qua */
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  // Mặc định coi như đã đọc hết cho tới khi mount, tránh lệch hydration.
  const [read, setRead] = useState<string[] | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setRead(loadRead()), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isUnread = (id: string) => read !== null && !read.includes(id);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => isUnread(n.id)).length;

  const markRead = (ids: string[]) => {
    const next = Array.from(new Set([...(read ?? []), ...ids]));
    setRead(next);
    saveRead(next);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          unreadCount ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"
        }
        className={cn(
          "relative flex size-9 md:size-10 items-center justify-center rounded-full transition-colors hover:bg-card hover:text-primary",
          open && "bg-card text-primary",
        )}
      >
        <Bell className="size-[18px] md:size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-zinc-950 ring-2 ring-[oklch(0.21_0.009_265)]">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Thông báo"
          className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 z-[60] overflow-hidden rounded-xl border border-zinc-700 bg-[oklch(0.19_0.009_265)] text-left font-sans shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <p className="text-base font-bold text-zinc-100">Thông báo</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markRead(MOCK_NOTIFICATIONS.map((n) => n.id))}
                className="text-sm text-amber-400 hover:underline underline-offset-4"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <ul className="max-h-[min(70vh,28rem)] overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((n) => {
              const Icon = KIND_ICON[n.kind];
              const unread = isUnread(n.id);
              const content = (
                <div className="flex gap-3 px-4 py-3.5">
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                      unread
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-zinc-800 text-zinc-500",
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold leading-snug",
                        unread ? "text-zinc-100" : "text-zinc-400",
                      )}
                    >
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-zinc-400">
                      {n.body}
                    </p>
                    <p className="mt-1.5 text-xs text-zinc-500">{n.time}</p>
                  </div>
                  {unread && (
                    <span
                      aria-label="Chưa đọc"
                      className="mt-2 size-2 shrink-0 rounded-full bg-amber-500"
                    />
                  )}
                </div>
              );
              return (
                <li
                  key={n.id}
                  className="border-b border-zinc-800/70 last:border-b-0"
                >
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={() => {
                        markRead([n.id]);
                        setOpen(false);
                      }}
                      className="block transition-colors hover:bg-white/[0.04]"
                    >
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
