"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CodeChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

/** Ô nhập mã chứng cứ dạng chip: Enter, dấu phẩy hoặc dán nhiều mã cùng lúc. */
export function CodeChipInput({
  value,
  onChange,
  placeholder = "",
  className,
}: CodeChipInputProps) {
  const [text, setText] = useState("");

  const commit = (raw: string) => {
    const separator = /[,;\n]/;
    const parts = separator.test(raw)
      ? raw.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean)
      : [raw.trim()].filter(Boolean);
    if (parts.length === 0) return;

    const next = [...value];
    for (const part of parts) {
      if (!next.includes(part)) next.push(part);
    }
    onChange(next);
    setText("");
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div
      className={cn(
        "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 focus-within:border-amber-500/50",
        className,
      )}
    >
      {value.map((code, index) => (
        <span
          key={`${code}-${index}`}
          className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[11px] text-amber-200"
        >
          {code}
          <button
            type="button"
            onClick={() => removeAt(index)}
            className="text-amber-300/70 transition-colors hover:text-amber-100"
            aria-label={`Xóa mã ${code}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      <Input
        value={text}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit(text);
          } else if (event.key === "Backspace" && !text && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => commit(text)}
        onPaste={(event) => {
          const pasted = event.clipboardData.getData("text");
          if (/[\s,;\n]/.test(pasted.trim())) {
            event.preventDefault();
            commit(pasted);
          }
        }}
        className="h-6 min-w-28 flex-1 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
    </div>
  );
}
