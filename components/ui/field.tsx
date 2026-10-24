import React from "react";
import { cn } from "@/lib/utils";

export interface FieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Standard form field wrapper for Studio and admin forms.
 * Label 12px, optional concise hint (<= 1 line), clean hierarchy.
 */
export function Field({
  label,
  hint,
  required,
  className,
  children,
}: FieldProps) {
  return (
    <label className={cn("block min-w-0 space-y-1", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex items-baseline gap-1 text-xs font-medium text-zinc-300">
          {label}
          {required && <span className="text-amber-400">*</span>}
        </span>
        {hint && (
          <span className="truncate text-[11px] font-normal text-zinc-500">
            {hint}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}
