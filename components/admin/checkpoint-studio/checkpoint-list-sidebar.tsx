"use client";

import { MousePointerClick, Plus } from "lucide-react";
import type { DbCaseCheckpoint } from "@/lib/types/database";

interface CaseOption {
  value: string;
  label: string;
}

interface CheckpointListSidebarProps {
  cases: CaseOption[];
  caseId: string;
  onCaseChange: (caseId: string) => void;
  rows?: DbCaseCheckpoint[];
  selectedId?: string | null;
  onSelect?: (row: DbCaseCheckpoint) => void;
  onCreate: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function CheckpointListSidebar({
  cases,
  caseId,
  onCaseChange,
  onCreate,
  children,
}: CheckpointListSidebarProps) {
  return (
    <aside className="flex h-full w-full min-h-0 shrink-0 flex-col border-t border-white/10 bg-[#0c0c10] md:border-l md:border-t-0">
      {/* Header: Chọn vụ án & Nút tạo nhanh */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 p-2.5 bg-[#0e0e13]">
        <select
          value={caseId}
          onChange={(event) => onCaseChange(event.target.value)}
          className="h-8 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
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
          title="Tạo checkpoint mới"
        >
          <Plus className="size-3.5" />
          <span>+ Checkpoint</span>
        </button>
      </div>

      {/* Main Content: Hộp biên tập Checkpoint Editor chiếm trọn 100% chiều cao */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children ? (
          children
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-zinc-500">
            <MousePointerClick className="size-8 text-zinc-600 mb-2" />
            <p className="text-xs font-medium text-zinc-300">Chưa chọn checkpoint</p>
            <p className="mt-1 text-[11px] text-zinc-500 max-w-[240px]">
              Bấm vào bất kỳ node checkpoint nào trên sơ đồ để chỉnh sửa thông tin.
            </p>
            <button
              type="button"
              onClick={onCreate}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
            >
              <Plus className="size-3.5" />
              Tạo checkpoint mới
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
