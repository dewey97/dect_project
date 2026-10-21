"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CaseOption {
  value: string;
  label: string;
}

interface CheckpointListSidebarProps {
  cases: CaseOption[];
  caseId: string;
  onCaseChange: (caseId: string) => void;
  rows: DbCaseCheckpoint[];
  selectedId: string | null;
  onSelect: (row: DbCaseCheckpoint) => void;
  onCreate: () => void;
  isLoading: boolean;
  /** Hộp biên tập gắn ngay dưới danh sách node. */
  children?: React.ReactNode;
}

export function CheckpointListSidebar({
  cases,
  caseId,
  onCaseChange,
  rows,
  selectedId,
  onSelect,
  onCreate,
  isLoading,
  children,
}: CheckpointListSidebarProps) {
  const [search, setSearch] = useState("");

  const visibleRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (!keyword) return true;
      return (
        (row.node_id || row.checkpoint_id).toLowerCase().includes(keyword) ||
        row.checkpoint_id.toLowerCase().includes(keyword) ||
        row.title.toLowerCase().includes(keyword) ||
        row.question.toLowerCase().includes(keyword)
      );
    });
  }, [rows, search]);

  return (
    <aside className="flex h-full w-full min-h-0 shrink-0 flex-col border-t border-white/10 bg-[#0c0c10] md:border-l md:border-t-0">
      <div className="shrink-0 space-y-2.5 border-b border-white/10 p-3">
        <div className="flex items-center gap-2">
          <select
            value={caseId}
            onChange={(event) => onCaseChange(event.target.value)}
            className="h-8 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
          >
            {cases.map((item) => (
              <option
                key={item.value}
                value={item.value}
                className="bg-[#141618]"
              >
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-amber-500 px-2.5 text-xs font-bold text-black transition-colors hover:bg-amber-400"
          >
            <Plus className="size-3.5" />
            Tạo
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm node hoặc tiêu đề…"
            className="h-8 border-white/10 bg-black/40 pl-8 text-xs"
          />
        </div>
      </div>

      <div
        className={cn(
          "min-h-0 overflow-y-auto",
          children
            ? "basis-[42%] shrink-0 border-b border-white/10"
            : "flex-1",
        )}
      >
        {isLoading ? (
          <p className="px-2 py-6 text-center text-xs text-zinc-500">
            Đang tải…
          </p>
        ) : visibleRows.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-zinc-500">
              {rows.length === 0
                ? "Chưa có checkpoint nào trong Studio."
                : "Không khớp bộ lọc."}
            </p>
            {rows.length === 0 && (
              <button
                type="button"
                onClick={onCreate}
                className="mt-3 text-xs font-semibold text-amber-300 hover:text-amber-200"
              >
                Tạo checkpoint đầu tiên
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {visibleRows.map((row) => {
              const active = row.id === selectedId;
              const label =
                row.title?.trim() ||
                row.question?.trim() ||
                "(Chưa có tiêu đề)";
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(row)}
                    className={cn(
                      "w-full truncate border-l-2 px-3 py-1.5 text-left text-xs transition-colors",
                      active
                        ? "border-amber-400 bg-amber-500/10 text-zinc-100"
                        : "border-transparent text-zinc-300 hover:bg-white/5 hover:text-zinc-100",
                    )}
                    title={label}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {children && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      )}
    </aside>
  );
}
