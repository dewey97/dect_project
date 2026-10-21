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
    <aside className="flex h-full w-full shrink-0 flex-col border-l border-white/10 bg-[#0c0c10] md:w-80">
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

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
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
          <ul className="space-y-1">
            {visibleRows.map((row) => {
              const active = row.id === selectedId;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(row)}
                    className={cn(
                      "w-full rounded-lg border px-2.5 py-2 text-left transition-colors",
                      active
                        ? "border-amber-500/40 bg-amber-500/10"
                        : "border-transparent hover:border-white/10 hover:bg-white/5",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate font-mono text-[11px]",
                          active ? "text-amber-300" : "text-zinc-500",
                        )}
                      >
                        {row.node_id?.trim() || row.checkpoint_id}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-0.5 truncate text-xs",
                        active ? "text-zinc-100" : "text-zinc-300",
                      )}
                    >
                      {row.title || "(Chưa có tiêu đề)"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
