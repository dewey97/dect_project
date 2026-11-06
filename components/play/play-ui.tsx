"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Khối giao diện dùng chung cho màn vào game và phòng chờ (phong cách hồ sơ trinh thám). */

export function PlayShell({
  children,
  wide = false,
  className,
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[#0d0c0a] text-zinc-100">
      <div
        className={cn(
          "mx-auto flex min-h-full w-full flex-col gap-5 px-4 py-6 sm:py-8",
          wide ? "max-w-6xl" : "max-w-[30rem]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function PlayLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-zinc-500">
      {children}
    </div>
  );
}

export function PlayCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost";

export function PlayButton({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-amber-500 text-zinc-950 hover:bg-amber-400",
        variant === "secondary" &&
          "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
        variant === "danger" &&
          "border border-red-900/60 bg-red-950/30 text-red-200 hover:bg-red-900/40",
        variant === "ghost" &&
          "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
        className,
      )}
    />
  );
}

export function PlayError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200"
    >
      {children}
    </p>
  );
}

export const inputClass =
  "w-full min-h-11 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-base text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none";
