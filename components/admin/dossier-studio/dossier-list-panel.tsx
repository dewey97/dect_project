"use client";

import React, { useState } from "react";
import { Folder, FolderOpen, Plus, Settings2, Trash2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DbCaseDossier } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface DossierListPanelProps {
  dossiers: DbCaseDossier[];
  caseId: string;
  onEditDossier: (dossier: DbCaseDossier) => void;
  onCreateDossier: () => void;
  onDeleteDossier: (dossierKey: string) => void;
  activeDossierKey?: string | null;
  onSelectDossier?: (dossier: DbCaseDossier) => void;
}

export function DossierListPanel({
  dossiers,
  caseId,
  onEditDossier,
  onCreateDossier,
  onDeleteDossier,
  activeDossierKey,
  onSelectDossier,
}: DossierListPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <aside className="no-print w-12 border-r border-white/10 bg-[#121316] flex flex-col items-center py-4 z-20 shrink-0">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-white/5 transition-all"
          title="Mở rộng danh mục Bộ Hồ Sơ"
        >
          <ChevronRight className="size-5" />
        </button>
        <div className="mt-8 [writing-mode:vertical-lr] text-neutral-400 text-xs tracking-wider uppercase font-bold flex items-center gap-2">
          <Folder className="size-3.5 text-amber-500" />
          <span>Bộ Hồ Sơ ({dossiers.length})</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="no-print w-72 h-full min-h-0 border-r border-white/10 bg-[#121316] flex flex-col flex-shrink-0 z-20 text-xs">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between gap-2 bg-[#16171b]">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-4 text-amber-400" />
          <div>
            <h2 className="font-bold text-neutral-200 text-xs uppercase tracking-wider">
              Bộ Hồ Sơ ({dossiers.length})
            </h2>
            <p className="text-[10px] text-neutral-400">Giai đoạn & tài liệu</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            onClick={onCreateDossier}
            className="h-7 px-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] gap-1 shadow-sm"
          >
            <Plus className="size-3.5" />
            <span>Thêm</span>
          </Button>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Thu gọn"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2">
        {dossiers.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 space-y-2">
            <p className="text-xs">Chưa có bộ hồ sơ nào.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCreateDossier}
              className="text-xs border-dashed border-white/20 hover:border-amber-400 hover:text-amber-400"
            >
              + Tạo bộ hồ sơ đầu tiên
            </Button>
          </div>
        ) : (
          dossiers.map((d) => {
            const isActive = activeDossierKey === d.dossier_key;
            const docCount = d.document_codes?.length || 0;

            return (
              <div
                key={d.dossier_key}
                onClick={() => onSelectDossier?.(d)}
                className={cn(
                  "group relative rounded-lg border p-2.5 transition-all cursor-pointer",
                  isActive
                    ? "border-amber-500/60 bg-amber-950/20 shadow-sm"
                    : "border-white/10 bg-[#18191e] hover:border-white/20 hover:bg-[#1e2026]",
                )}
              >
                {/* Top Row: Title + Key */}
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Folder className="size-3.5 text-amber-400/80 shrink-0" />
                    <span className="font-semibold text-neutral-200 text-xs truncate">
                      {d.title || d.dossier_key}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono text-[9px] px-1 py-0 border-white/15 text-neutral-400 shrink-0"
                  >
                    {d.dossier_key}
                  </Badge>
                </div>

                {/* Description */}
                {d.description && (
                  <p className="text-[11px] text-neutral-400 line-clamp-1 mt-1">
                    {d.description}
                  </p>
                )}

                {/* Document Codes Chips */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                    <FileText className="size-3" />
                    <span>{docCount} tài liệu</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditDossier(d);
                      }}
                      className="p-1 rounded bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-neutral-300 transition-colors"
                      title="Chỉnh sửa & Gán tài liệu"
                    >
                      <Settings2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            `Bạn có chắc muốn xóa bộ hồ sơ "${d.title}" không?`,
                          )
                        ) {
                          onDeleteDossier(d.dossier_key);
                        }
                      }}
                      className="p-1 rounded bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-neutral-400 transition-colors"
                      title="Xóa bộ hồ sơ"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preview codes */}
                {docCount > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {d.document_codes.slice(0, 5).map((code) => (
                      <span
                        key={code}
                        className="px-1 py-0.5 rounded bg-black/40 border border-white/5 font-mono text-[9px] text-neutral-400"
                      >
                        {code}
                      </span>
                    ))}
                    {docCount > 5 && (
                      <span className="text-[9px] text-neutral-500">
                        +{docCount - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
