"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useRoomSync,
  type ToastNotice,
} from "@/components/investigation/room/room-sync-context";
import { emitInvestigationEvent } from "@/lib/investigation/investigation-events";
import { getStorageItem, setStorageItem } from "@/lib/investigation/storage";
import type { PublicRoomEvent } from "@/lib/types/room";

/**
 * Thông báo phòng (spec 2.7): tối đa 3 toast góc dưới phải, chuông chứa mọi thông báo,
 * số chưa đọc lưu theo thiết bị. Key lưu đi qua lib/storage nên tự tách theo phòng.
 */

const LAST_READ_KEY = "room_last_read_event";

/** Bấm một thông báo: mở thẳng nội dung tương ứng. */
export function openRoomEventTarget(event: PublicRoomEvent): void {
  switch (event.type) {
    case "checkpoint_solved":
    case "dossier_unlocked":
      emitInvestigationEvent("OPEN_BOARD", { targetRef: event.targetRef });
      break;
    case "phone_solved":
      emitInvestigationEvent("OPEN_PHONE");
      break;
    case "conclusion_submitted":
      emitInvestigationEvent("OPEN_EPILOGUE");
      break;
    default:
      break;
  }
}

function hasTarget(event?: PublicRoomEvent): boolean {
  return (
    !!event &&
    [
      "checkpoint_solved",
      "dossier_unlocked",
      "phone_solved",
      "conclusion_submitted",
    ].includes(event.type)
  );
}

export function RoomToastStack({ toasts }: { toasts: ToastNotice[] }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const clickable = hasTarget(t.event);
        const content = (
          <>
            <span className="text-xl" aria-hidden>
              🕵️
            </span>
            <span className="flex-1 text-left font-mono text-xs">
              {t.actorName && (
                <span className="font-bold text-white">{t.actorName} </span>
              )}
              <span className="text-zinc-300">{t.actionText}</span>
            </span>
          </>
        );
        const cls =
          "pointer-events-auto flex min-h-11 items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900/95 px-4 py-3 text-zinc-100 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-300";
        return clickable ? (
          <button
            key={t.id}
            type="button"
            className={cn(cls, "cursor-pointer hover:border-zinc-500")}
            onClick={() => t.event && openRoomEventTarget(t.event)}
          >
            {content}
          </button>
        ) : (
          <div key={t.id} role="status" className={cls}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Icon chuông: danh sách thông báo của phòng, có số chưa đọc. */
export function RoomBell({ className }: { className?: string }) {
  const { room, me, events } = useRoomSync();
  const [lastRead, setLastRead] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLastRead(Number(getStorageItem(LAST_READ_KEY)) || 0);
  }, [room?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!room) return null;

  const unread = events.filter(
    (e) => e.id > lastRead && e.actorParticipantId !== me?.id,
  ).length;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && events.length > 0) {
      const max = events[events.length - 1].id;
      setLastRead(max);
      setStorageItem(LAST_READ_KEY, String(max));
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={
          unread > 0 ? `Thông báo phòng, ${unread} chưa đọc` : "Thông báo phòng"
        }
        className="relative inline-flex size-11 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white"
      >
        <Bell className="size-4" aria-hidden />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-amber-500 px-1 text-center font-mono text-[10px] font-bold leading-4 text-zinc-950">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Đóng thông báo"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
            {events.length === 0 ? (
              <p className="p-3 text-sm text-zinc-400">Chưa có thông báo.</p>
            ) : (
              <ul className="space-y-1">
                {[...events].reverse().map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      disabled={!hasTarget(e)}
                      onClick={() => {
                        openRoomEventTarget(e);
                        setOpen(false);
                      }}
                      className="flex w-full min-h-11 items-start gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900 disabled:cursor-default disabled:hover:bg-transparent"
                    >
                      <span className="mt-0.5 font-mono text-[11px] text-zinc-500">
                        {formatTime(e.createdAt)}
                      </span>
                      <span className="flex-1">{e.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
