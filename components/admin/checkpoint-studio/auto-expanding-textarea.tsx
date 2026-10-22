"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";

interface AutoExpandingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
}

/** Textarea tự giãn theo nội dung, style của Checkpoint Studio. */
export function AutoExpandingTextarea({
  minRows = 1,
  className,
  ...props
}: AutoExpandingTextareaProps) {
  return (
    <AutoGrowTextarea
      rows={minRows}
      className={cn(
        "w-full rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs leading-relaxed text-zinc-100 outline-none transition-[border-color] focus:border-amber-500/50",
        className,
      )}
      {...props}
    />
  );
}
