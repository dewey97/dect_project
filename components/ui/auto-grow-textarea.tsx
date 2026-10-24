"use client";

import React, { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface AutoGrowTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
}

/**
 * Textarea bắt đầu 1 dòng, tự cao thêm theo số dòng nội dung (không thanh cuộn).
 * Hỗ trợ minRows (mặc định 1) và style cơ bản có thể ghi đè qua className.
 */
export function AutoGrowTextarea({
  value,
  rows = 1,
  minRows,
  className,
  ...props
}: AutoGrowTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const effectiveRows = minRows ?? rows ?? 1;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Về "auto" trước để scrollHeight co lại khi xóa bớt dòng.
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={effectiveRows}
      className={cn(
        "w-full rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs leading-relaxed text-zinc-100 outline-none transition-[border-color] focus:border-amber-500/50 resize-none overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}
