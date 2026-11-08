"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Khối giao diện dùng chung cho màn vào game và phòng chờ (phong cách hồ sơ trinh thám cao cấp). */

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
    <div className="min-h-screen w-full overflow-y-auto bg-[#0d0c0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(180,120,40,0.12),rgba(0,0,0,0))] text-zinc-100 relative">
      {/* Lớp hạt mờ tinh tế */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />
      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full flex-col justify-center px-4 py-8 sm:py-12",
          wide ? "max-w-4xl" : "max-w-2xl",
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
  highlight = false,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border bg-[#18181b]/95 p-5 sm:p-7 md:p-8 backdrop-blur-xl shadow-2xl transition",
        highlight
          ? "border-amber-500/70 shadow-amber-500/10 ring-1 ring-amber-500/20"
          : "border-amber-500/30",
        className,
      )}
    >
      {children}
    </section>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost" | "amber-gradient";

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
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold tracking-wide transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99] cursor-pointer",
        variant === "primary" &&
          "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/20 hover:brightness-105",
        variant === "amber-gradient" &&
          "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/20 hover:brightness-105",
        variant === "secondary" &&
          "border border-zinc-700/80 bg-zinc-900/90 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600",
        variant === "danger" &&
          "border border-red-900/60 bg-red-950/40 text-red-200 hover:bg-red-900/50",
        variant === "ghost" &&
          "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100",
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
      className="rounded-xl border border-red-900/50 bg-red-950/30 px-3.5 py-2.5 text-sm text-red-200"
    >
      {children}
    </p>
  );
}

export const inputClass =
  "w-full min-h-12 rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-base text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition";
