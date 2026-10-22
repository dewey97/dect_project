"use client";

import React, { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Textarea bắt đầu 1 dòng, tự cao thêm theo số dòng nội dung (không thanh cuộn).
 * Không gắn style giao diện; nơi dùng tự truyền `className`.
 */
export function AutoGrowTextarea({
  value,
  rows = 1,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

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
      rows={rows}
      className={cn("resize-none overflow-hidden", className)}
      {...props}
    />
  );
}
