"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AutoExpandingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
}

export function AutoExpandingTextarea({
  value,
  minRows = 1,
  className,
  onChange,
  ...props
}: AutoExpandingTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset về auto để tính đúng scrollHeight khi xóa ký tự
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={minRows}
      onChange={onChange}
      className={cn(
        "w-full resize-none overflow-hidden rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs leading-relaxed text-zinc-100 outline-none transition-[border-color] focus:border-amber-500/50",
        className,
      )}
      {...props}
    />
  );
}
