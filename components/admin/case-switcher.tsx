"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Folders, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDIO_CASE_COOKIE, isCaseScopedPath } from "@/lib/studio/case-scope";

export interface SwitcherCase {
  slug: string;
  title: string;
}

/**
 * Sidebar Case picker. The chosen case is saved in a cookie and carried as
 * `?case=` so every case-scoped Studio page follows it.
 */
export function CaseSwitcher({
  cases,
  currentCaseId,
  isCollapsed,
}: {
  cases: SwitcherCase[];
  currentCaseId: string;
  isCollapsed: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = cases.find((c) => c.slug === currentCaseId);

  const choose = (slug: string) => {
    setOpen(false);
    document.cookie = `${STUDIO_CASE_COOKIE}=${encodeURIComponent(slug)}; path=/; max-age=31536000; samesite=lax`;
    // Stay on the same section; non-case pages go to Checkpoint Studio.
    const target = isCaseScopedPath(pathname)
      ? pathname
      : "/studio/checkpoints";
    router.push(`${target}?case=${encodeURIComponent(slug)}`);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={`Case: ${current?.title ?? currentCaseId}`}
        className={cn(
          "w-full rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-200 transition-colors hover:bg-amber-500/15",
          isCollapsed
            ? "flex flex-col items-center gap-1 px-1 py-2"
            : "flex items-center gap-2.5 px-2.5 py-2 text-left",
        )}
      >
        <Folders
          className={cn(
            "shrink-0 text-amber-400",
            isCollapsed ? "size-4.5" : "size-4",
          )}
        />
        {isCollapsed ? (
          <span className="block max-w-full truncate text-[10px] font-semibold leading-none">
            Case
          </span>
        ) : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-amber-400/70">
                Case
              </span>
              <span className="block truncate text-sm font-semibold">
                {current?.title ?? currentCaseId}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-amber-400/70" />
          </>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Chọn case"
          className={cn(
            "absolute z-50 mt-1 w-64 overflow-hidden rounded-lg border border-white/10 bg-zinc-950 shadow-2xl",
            isCollapsed ? "left-full top-0 ml-2 mt-0" : "left-0 right-0 w-auto",
          )}
        >
          <ul className="max-h-80 overflow-y-auto py-1">
            {cases.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.slug === currentCaseId}
                  onClick={() => choose(c.slug)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      c.slug === currentCaseId ? "text-amber-400" : "invisible",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{c.title}</span>
                  <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                    {c.slug}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/studio/cases"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-white/10 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Settings2 className="size-4" />
            Quản lý case
          </Link>
        </div>
      )}
    </div>
  );
}
