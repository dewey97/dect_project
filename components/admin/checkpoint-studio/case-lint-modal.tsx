"use client";

import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ArrowRight,
  X,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  CaseLintResult,
  CaseLintIssue,
} from "@/lib/checkpoints/case-linter";

interface CaseLintModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CaseLintResult;
  onSelectCheckpoint?: (checkpointId: string) => void;
  onRefresh?: () => void;
}

const RULE_TITLES: Record<string, string> = {
  cycle_detected: "Chu trình phụ thuộc vòng quanh",
  missing_dependency: "Thiếu checkpoint phụ thuộc",
  unreachable_node: "Node không thể tiếp cận",
  missing_answer: "Thiếu cấu hình đáp án",
  missing_victim: "Chưa thiết lập nạn nhân",
  suspect_without_interrogation: "Nghi phạm thiếu thẩm tra",
  unknown_evidence_code: "Mã chứng cứ không tồn tại",
};

export function CaseLintModal({
  isOpen,
  onClose,
  result,
  onSelectCheckpoint,
  onRefresh,
}: CaseLintModalProps) {
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "info">(
    "all",
  );

  const filteredIssues = useMemo(() => {
    if (filter === "all") return result.issues;
    return result.issues.filter((i) => i.level === filter);
  }, [result.issues, filter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col rounded-xl border border-white/10 bg-[#0e0e14] shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
                Kiểm tra kịch bản vụ án
              </h2>
              <p className="text-[11px] text-zinc-400">
                Phân tích đồ thị, tính hợp lệ logic và danh mục vật chứng
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
                title="Kiểm tra lại"
              >
                <RefreshCw className="size-3.5" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Status Summary Banner */}
        <div className="px-5 pt-4 pb-2">
          {result.isValid && result.warningCount === 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300">
              <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
              <div>
                <p className="text-xs font-semibold">
                  Kịch bản vụ án hoàn toàn hợp lệ!
                </p>
                <p className="text-[11px] text-emerald-300/80">
                  Không phát hiện chu trình, thiếu sót đáp án hay node cô lập
                  nào.
                </p>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border p-3",
                result.errorCount > 0
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-200",
              )}
            >
              <div className="flex items-center gap-3">
                {result.errorCount > 0 ? (
                  <XCircle className="size-5 shrink-0 text-red-400" />
                ) : (
                  <AlertTriangle className="size-5 shrink-0 text-amber-400" />
                )}
                <div>
                  <p className="text-xs font-semibold">
                    {result.errorCount > 0
                      ? `Phát hiện ${result.errorCount} lỗi cần xử lý`
                      : `Phát hiện ${result.warningCount} cảnh báo cần lưu ý`}
                  </p>
                  <p className="text-[11px] opacity-80">
                    Vui lòng rà soát danh sách bên dưới trước khi xuất bản vụ
                    án.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {result.errorCount > 0 && (
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-red-300 font-bold">
                    {result.errorCount} Lỗi
                  </span>
                )}
                {result.warningCount > 0 && (
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300 font-semibold">
                    {result.warningCount} Cảnh báo
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 border-b border-white/5 px-5 py-2 text-xs">
          {(
            [
              { key: "all", label: `Tất cả (${result.issues.length})` },
              { key: "error", label: `Lỗi (${result.errorCount})` },
              { key: "warning", label: `Cảnh báo (${result.warningCount})` },
              {
                key: "info",
                label: `Gợi ý (${result.issues.length - result.errorCount - result.warningCount})`,
              },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                filter === item.key
                  ? "bg-amber-400/20 text-amber-300 font-semibold border border-amber-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5 custom-scrollbar min-h-0">
          {filteredIssues.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Không có vấn đề nào trong danh mục này.
            </div>
          ) : (
            filteredIssues.map((issue, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors",
                  issue.level === "error"
                    ? "border-red-500/20 bg-red-950/20 hover:border-red-500/40"
                    : issue.level === "warning"
                      ? "border-amber-500/20 bg-amber-950/20 hover:border-amber-500/40"
                      : "border-blue-500/20 bg-blue-950/20 hover:border-blue-500/40",
                )}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {issue.level === "error" ? (
                    <XCircle className="size-4 shrink-0 text-red-400 mt-0.5" />
                  ) : issue.level === "warning" ? (
                    <AlertTriangle className="size-4 shrink-0 text-amber-400 mt-0.5" />
                  ) : (
                    <Info className="size-4 shrink-0 text-blue-400 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold text-zinc-200">
                        {RULE_TITLES[issue.rule] || issue.rule}
                      </span>
                      {issue.checkpointId && (
                        <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 border border-white/10">
                          {issue.checkpointId}
                        </span>
                      )}
                      {issue.characterKey && (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300 border border-amber-500/20">
                          @{issue.characterKey}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {issue.message}
                    </p>
                  </div>
                </div>

                {issue.checkpointId && onSelectCheckpoint && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSelectCheckpoint(issue.checkpointId!);
                      onClose();
                    }}
                    className="shrink-0 h-7 text-[11px] border-white/10 bg-white/5 hover:bg-amber-400 hover:text-black gap-1 cursor-pointer"
                  >
                    <span>Xem</span>
                    <ArrowRight className="size-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/10 bg-zinc-950/60 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-white/10 bg-white/5 text-zinc-300 hover:text-zinc-100"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
