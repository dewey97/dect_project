import React, { useMemo } from "react";
import {
  FileText,
  ImageIcon,
  Target,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { emitInvestigationEvent } from "@/lib/investigation-events";
import type {
  CombinedItem,
  PDFDocument,
  PhysicalEvidence,
  SelectedView,
} from "@/components/investigation/evidence/evidence-types";
import type { DbCaseDossier } from "@/lib/types/database";

export type DossierFilterTab = "pdf" | "evidence";

export interface ActiveInspectorInfo {
  type: "suspect" | "followup" | "custom_pin" | "notebook";
  label: string;
}

interface DossierTrayProps {
  className?: string;
  uiTheme?: "dark" | "light";
  dossierWidth: number;
  isDossierCollapsed: boolean;
  highlightSelected?: boolean;
  onToggleCollapse?: () => void;
  resizable?: "left" | "right" | boolean;
  onResizeWidth?: (width: number) => void;
  onResetWidth?: () => void;
  minWidth?: number;
  maxWidth?: number;
  isViewerExpanded: boolean;
  mobileTab: "board" | "dossier";
  filterTab: DossierFilterTab;
  onSetFilterTab: (tab: any) => void;
  activeInspector?: ActiveInspectorInfo | null;
  onCloseInspector?: () => void;
  inspectorContent?: React.ReactNode;
  selectedPhaseFilter?: "all" | string | number;
  onSetPhaseFilter?: (val: "all" | string | number) => void;
  selectedDossierFilter?: string;
  onSetDossierFilter?: (val: string) => void;
  isPhaseUnlocked?: (phase: number) => boolean;
  isDossierUnlocked?: (key: string) => boolean;
  dossiers?: DbCaseDossier[];
  pdfItems: CombinedItem[];
  evidenceItems: CombinedItem[];
  selectedView: SelectedView | null;
  onSelectPdf: (item: PDFDocument) => void;
  onSelectEvidence: (item: PhysicalEvidence) => void;
  activePing?: {
    actorName: string;
    targetId: string;
  } | null;
  onBroadcastPing: (
    targetId: string,
    label: string,
    pos?: { x: number; y: number },
    meta?: {
      targetType: "doc" | "evidence";
      docType?: "pdf" | "evidence";
      page?: number;
      highlightText?: string;
    },
  ) => void;
}

export function DossierTray({
  className,
  uiTheme = "dark",
  dossierWidth,
  isDossierCollapsed,
  highlightSelected = true,
  onToggleCollapse,
  resizable,
  onResizeWidth,
  onResetWidth,
  minWidth = 280,
  maxWidth = 750,
  isViewerExpanded,
  mobileTab,
  filterTab,
  onSetFilterTab,
  activeInspector,
  onCloseInspector,
  inspectorContent,
  selectedPhaseFilter,
  onSetPhaseFilter,
  selectedDossierFilter,
  onSetDossierFilter,
  isPhaseUnlocked,
  isDossierUnlocked,
  dossiers = [],
  pdfItems,
  evidenceItems,
  selectedView,
  onSelectPdf,
  onSelectEvidence,
  activePing,
  onBroadcastPing,
}: DossierTrayProps) {
  const resizableSide =
    resizable === true ? "left" : typeof resizable === "string" ? resizable : undefined;

  const [isResizing, setIsResizing] = React.useState(false);
  const isLight = uiTheme === "light";
  const resizeRef = React.useRef({
    startX: 0,
    startWidth: dossierWidth,
  });

  const handlePointerDownResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startWidth: dossierWidth,
    };

    const targetEl = e.currentTarget;
    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch {}

    const handlePointerMove = (ev: PointerEvent) => {
      const deltaX =
        resizableSide === "left"
          ? resizeRef.current.startX - ev.clientX
          : ev.clientX - resizeRef.current.startX;
      const effectiveMin = minWidth;
      const effectiveMax = Math.min(maxWidth, typeof window !== "undefined" ? window.innerWidth - 300 : maxWidth);
      const nextWidth = Math.max(
        effectiveMin,
        Math.min(effectiveMax, resizeRef.current.startWidth + deltaX)
      );
      onResizeWidth?.(nextWidth);
    };

    const handlePointerUp = (ev: PointerEvent) => {
      setIsResizing(false);
      try {
        targetEl.releasePointerCapture(ev.pointerId);
      } catch {}
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Nhóm tài liệu theo từng tập hồ sơ (hiển thị nối tiếp từ trên xuống dưới)
  const groupedPdfs = useMemo(() => {
    const orderedDossiers = [...dossiers].sort((a, b) => {
      const slotA =
        typeof (a as any).slot_index === "number" ? (a as any).slot_index : 0;
      const slotB =
        typeof (b as any).slot_index === "number" ? (b as any).slot_index : 0;
      return slotA - slotB;
    });

    const groupsMap = new Map<
      string,
      { key: string; title: string; items: CombinedItem[] }
    >();

    orderedDossiers.forEach((d) => {
      groupsMap.set(d.dossier_key, {
        key: d.dossier_key,
        title: d.title,
        items: [],
      });
    });

    if (groupsMap.size === 0) {
      [
        { key: "ban_dau", title: "Hồ sơ ban đầu" },
        { key: "bo_a", title: "Bộ A - Hiện trường" },
        { key: "bo_b", title: "Bộ B - Lời khai & Pháp y" },
        { key: "bo_c", title: "Bộ C - Mở rộng điều tra" },
        { key: "ket_luan", title: "Hồ sơ kết luận" },
      ].forEach((g) => {
        groupsMap.set(g.key, { ...g, items: [] });
      });
    }

    const unassignedGroup: {
      key: string;
      title: string;
      items: CombinedItem[];
    } = {
      key: "unassigned",
      title: "Chưa phân loại",
      items: [],
    };

    pdfItems.forEach((item) => {
      const pdfDoc = item.data as PDFDocument;
      const dKey = item.dossierKey || pdfDoc?.dossierKey;
      const dTitle = item.dossierTitle || pdfDoc?.dossierTitle;

      if (dKey && groupsMap.has(dKey)) {
        groupsMap.get(dKey)!.items.push(item);
      } else if (dKey) {
        groupsMap.set(dKey, {
          key: dKey,
          title: dTitle || dKey,
          items: [item],
        });
      } else {
        let mappedKey: string | null = null;
        if (item.phase === 0) mappedKey = "ban_dau";
        else if (item.phase === 1) mappedKey = "bo_a";
        else if (item.phase === 2) mappedKey = "bo_b";
        else if (item.phase === 3) mappedKey = "bo_c";
        else if (item.phase === 4) mappedKey = "ket_luan";

        if (mappedKey && groupsMap.has(mappedKey)) {
          groupsMap.get(mappedKey)!.items.push(item);
        } else {
          unassignedGroup.items.push(item);
        }
      }
    });

    const filterKey =
      selectedPhaseFilter && selectedPhaseFilter !== "all"
        ? String(selectedPhaseFilter)
        : null;

    const result: { key: string; title: string; items: CombinedItem[] }[] = [];
    groupsMap.forEach((g) => {
      if (filterKey && g.key !== filterKey) return;
      if (g.items.length > 0) {
        g.items.sort((a, b) => a.order - b.order);
        result.push(g);
      }
    });

    if (!filterKey || filterKey === "unassigned") {
      if (unassignedGroup.items.length > 0) {
        unassignedGroup.items.sort((a, b) => a.order - b.order);
        result.push(unassignedGroup);
      }
    }

    return result;
  }, [dossiers, pdfItems, selectedPhaseFilter]);

  const chips = useMemo(() => {
    const list: { label: string; val: string }[] = [
      { label: "Tất cả", val: "all" },
    ];
    if (dossiers && dossiers.length > 0) {
      dossiers.forEach((d) => {
        list.push({ label: d.title, val: d.dossier_key });
      });
    } else {
      list.push(
        { label: "Ban Đầu", val: "ban_dau" },
        { label: "Bộ A", val: "bo_a" },
        { label: "Bộ B", val: "bo_b" },
        { label: "Bộ C", val: "bo_c" },
        { label: "Kết Luận", val: "ket_luan" },
      );
    }
    list.push({ label: "Chưa gán bộ", val: "unassigned" });
    return list;
  }, [dossiers]);

  const filteredPdfs = pdfItems;
  const filteredEvidence = evidenceItems;

  return (
    <div
      data-tour="canvas-dossier-tray"
      style={{
        width: isDossierCollapsed ? 0 : `${dossierWidth}px`,
        transition: isResizing ? "none" : undefined,
      }}
      className={cn(
        "w-full lg:w-auto shrink-0 rounded-none flex flex-col h-full min-h-0 select-none relative transition-[width] duration-150 ease-out",
        isLight
          ? (resizableSide === "right" ? "border-r border-zinc-200 bg-white text-zinc-900" : "border-l border-zinc-200 bg-white text-zinc-900")
          : (resizableSide === "right" ? "border-r border-[#1e232b] bg-[#0f1115] text-zinc-300" : "border-l border-[#1e232b] bg-[#0f1115] text-zinc-300"),
        isDossierCollapsed && "lg:hidden",
        isViewerExpanded && "hidden xl:flex",
        mobileTab === "dossier" ? "flex" : "hidden lg:flex",
        className
      )}
    >
      {/* THANH KÉO CO GIÃN ĐỘ RỘNG KHAY (MÉP TRÁI) */}
      {resizableSide && !isDossierCollapsed && (
        <div
          onPointerDown={handlePointerDownResize}
          onDoubleClick={onResetWidth}
          className={cn(
            "absolute top-0 bottom-0 z-40 w-3 cursor-ew-resize flex items-center justify-center select-none group touch-none transition-colors",
            resizableSide === "left" ? "left-0 -translate-x-1.5" : "right-0 translate-x-1.5",
            isResizing && (isLight ? "bg-zinc-200" : "bg-zinc-500/20")
          )}
          title="Kéo sang hai bên để thay đổi độ rộng khay (Nhấp đúp để đặt lại mặc định)"
        >
          <div
            className={cn(
              "w-[2px] h-12 rounded-full transition-all group-hover:h-24 group-hover:w-[3px] drop-shadow-[0_0_6px_rgba(0,0,0,0.2)]",
              isResizing
                ? (isLight ? "bg-zinc-600 h-full w-[2px]" : "bg-zinc-300 h-full w-[2px]")
                : (isLight ? "bg-zinc-300 group-hover:bg-zinc-600" : "bg-white/20 group-hover:bg-zinc-300")
            )}
          />
        </div>
      )}

      {/* 2. PHẦN TRÊN: PANEL CÂU HỎI / THẨM TRA (TỰ ÔM KHÍT NỘI DUNG, KHÔNG BỊ HỞ KHOẢNG TRỐNG) */}
      {activeInspector && inspectorContent && (
        <div className={cn(
          "shrink-0 max-h-[52vh] flex flex-col overflow-y-auto shadow-md relative animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar",
          isLight ? "bg-zinc-50 border-b border-zinc-200" : "bg-[#16181d] border-b border-[#262c37]"
        )}>
          {inspectorContent}
        </div>
      )}

      {/* 3. PHẦN DƯỚI: KHAY HỒ SƠ & VẬT CHỨNG (HIỆN BÊN DƯỚI) */}
      <div className={cn("flex-1 min-h-0 flex flex-col overflow-hidden", isLight ? "bg-white" : "bg-[#0f1115]")}>
        {/* 1. SIDEBAR HEADER: TÊN DANH MỤC */}
        <div className={cn(
          "shrink-0 px-3.5 pt-3 pb-2 flex items-center justify-between border-b",
          isLight ? "border-zinc-200 bg-zinc-50" : "border-[#1b2029]"
        )}>
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className={cn("size-4 shrink-0", isLight ? "text-zinc-500" : "text-zinc-400")} />
            <span className={cn(
              "font-sans text-xs font-semibold tracking-wide uppercase truncate",
              isLight ? "text-zinc-900" : "text-zinc-200"
            )}>
              Hồ sơ & Vật chứng
            </span>
          </div>
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                "hidden lg:flex size-6 items-center justify-center rounded transition-colors cursor-pointer border",
                isLight
                  ? "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 border-zinc-200"
                  : "hover:bg-[#1b202a] text-zinc-400 hover:text-zinc-100 border-[#262c37]"
              )}
              title="Thu gọn khay tài liệu"
            >
              {resizableSide === "right" ? (
                <ChevronLeft className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </button>
          )}
        </div>

      {/* 2. MODERN SEGMENTED TABS (TÀI LIỆU | VẬT CHỨNG | THẨM TRA) */}
      <div className="shrink-0 px-3 pt-2.5 pb-2">
        <div className={cn(
          "p-1 rounded-md border flex items-center gap-1",
          isLight ? "bg-zinc-100 border-zinc-200" : "bg-[#090b0e] border-[#1b2029]"
        )}>
          <button
            type="button"
            onClick={() => onSetFilterTab("pdf")}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-sm font-sans text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              filterTab === "pdf"
                ? (isLight
                    ? "bg-white text-zinc-950 font-bold border border-zinc-300 shadow-xs"
                    : "bg-[#1c2330] text-zinc-100 font-semibold border border-[#2d3748] shadow-xs")
                : (isLight
                    ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/70"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-[#13171f]"),
            )}
          >
            <FileText className="size-3.5 shrink-0" />
            <span className="truncate">Tài liệu</span>
          </button>

          <button
            type="button"
            onClick={() => onSetFilterTab("evidence")}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-sm font-sans text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              filterTab === "evidence"
                ? (isLight
                    ? "bg-white text-zinc-950 font-bold border border-zinc-300 shadow-xs"
                    : "bg-[#1c2330] text-zinc-100 font-semibold border border-[#2d3748] shadow-xs")
                : (isLight
                    ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/70"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-[#13171f]"),
            )}
          >
            <ImageIcon className="size-3.5 shrink-0" />
            <span className="truncate">Vật chứng</span>
          </button>
        </div>
      </div>

      {/* 2.5. CHIP LỌC TẬP HỒ SƠ (Tất cả, Ban Đầu, Bộ A, ...) */}
      {filterTab === "pdf" && chips.length > 1 && (
        <div className="shrink-0 px-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {chips.map((chip) => {
            const isActive = (selectedPhaseFilter || "all") === chip.val;
            return (
              <button
                key={chip.val}
                type="button"
                onClick={() => {
                  if (onSetPhaseFilter) {
                    onSetPhaseFilter(chip.val);
                  }
                }}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-sans font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 border",
                  isActive
                    ? (isLight
                        ? "bg-amber-600/20 text-amber-900 border-amber-600/40 font-bold"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold")
                    : (isLight
                        ? "bg-zinc-100 text-zinc-700 border-zinc-200 hover:text-zinc-950 hover:bg-zinc-200/80"
                        : "bg-[#141820] text-zinc-400 border-[#262c37] hover:text-zinc-200 hover:bg-[#1a202c]"),
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. DANH SÁCH CUỘN CHÍNH: TÀI LIỆU NHÓM THEO TẬP HỒ SƠ TỪ TRÊN XUỐNG, VẬT CHỨNG HIỂN THỊ LƯỚI KHÔNG NHÓM */}
      <div
        className={cn(
          "flex-1 overflow-y-auto custom-scrollbar min-h-0",
          filterTab === "evidence" ? "p-2" : "p-0",
        )}
      >
        {filterTab === "evidence" ? (
          /* DANH SÁCH VẬT CHỨNG: 2 CỘT GRID HIỆN ĐẠI (KHÔNG NHÓM) */
          filteredEvidence.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <ImageIcon className="size-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-sans text-zinc-500">
                Chưa thu thập vật chứng nào.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredEvidence.map((item) => {
                const isSelected =
                  highlightSelected &&
                  selectedView?.type === item.type &&
                  selectedView?.data.id === item.data.id;
                const evItem = item.data as PhysicalEvidence;
                const isPinged =
                  activePing?.targetId === item.data.id ||
                  Boolean(
                    evItem.code &&
                    activePing?.targetId === evItem.code,
                  );

                return (
                  <div
                    id={`doc-card-${item.data.id}`}
                    key={`evidence-${item.data.id}`}
                    onClick={() => {
                      onSelectEvidence(evItem);
                      emitInvestigationEvent("FOCUS_CANVAS_DOC", {
                        code: evItem.code || evItem.id,
                        id: item.data.id,
                      });
                    }}
                    className={cn(
                      "w-full aspect-[4/3] text-left rounded-md border transition-all duration-150 cursor-pointer relative overflow-hidden group",
                      isLight ? "bg-zinc-100" : "bg-[#0c0e12]",
                      isPinged
                        ? "border-rose-500/70 ring-1 ring-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                        : isSelected
                          ? (isLight ? "border-zinc-900 ring-1 ring-zinc-900/40 shadow-md" : "border-zinc-300 ring-1 ring-zinc-300/40 shadow-[0_4px_16px_rgba(0,0,0,0.8)]")
                          : (isLight ? "border-zinc-200 hover:border-zinc-300" : "border-[#1f2530] hover:border-[#323d4e]"),
                    )}
                  >
                    <img
                      src={
                        normalizeImageUrl(evItem?.thumbnail) ||
                        "/photo_scene_overview.jpg"
                      }
                      alt={item.data.title || "Vật chứng"}
                      className="w-full h-full object-cover select-none"
                    />

                    {/* Gradient overlay nhẹ cho chân ảnh */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                    {/* Nhãn mã số + tiêu đề ở chân thẻ */}
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 pointer-events-none">
                      {evItem?.code && (
                        <span className={cn(
                          "inline-block px-1.5 py-0.5 rounded-xs text-[0.6rem] font-mono font-bold tracking-wider mb-0.5 border",
                          isLight ? "bg-white/95 text-zinc-900 border-zinc-200" : "bg-[#141820]/95 text-zinc-200 border-[#2b3545]"
                        )}>
                          {evItem.code}
                        </span>
                      )}
                      <p className="text-[11px] font-sans text-zinc-200 truncate leading-tight">
                        {item.data.title}
                      </p>
                    </div>

                    {/* Nút chỉ điểm nhanh khi hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBroadcastPing(
                          evItem.code || item.data.id,
                          item.data.title,
                          undefined,
                          {
                            targetType: "evidence",
                            docType: "evidence",
                          },
                        );
                      }}
                      className="absolute top-1.5 right-1.5 size-6 rounded bg-black/80 hover:bg-rose-600 text-zinc-300 hover:text-white border border-white/15 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer shadow-sm z-10"
                      title="Chỉ điểm vật chứng này cho đồng đội"
                    >
                      <Target className="size-3.5" />
                    </button>

                    {/* Badge đồng đội đang chỉ điểm (gọn gàng, tinh tế) */}
                    {isPinged && activePing && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md border border-rose-500/40 text-rose-300 font-mono text-[9px] leading-tight flex items-center gap-1 z-10 shadow-sm animate-pulse">
                        <span className="size-1.5 rounded-full bg-rose-400 animate-ping" />
                        <span className="truncate max-w-[70px]">
                          {activePing.actorName}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : /* DANH SÁCH HỒ SƠ TÀI LIỆU: NHÓM THEO TẬP HỒ SƠ, NGĂN BẰNG LINE, MÃ + TÊN CÙNG DÒNG */
        groupedPdfs.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <FileText className="size-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-sans text-zinc-500">
              Chưa có tài liệu trong giai đoạn này.
            </p>
          </div>
        ) : (
          <div className={cn("divide-y", isLight ? "divide-zinc-100" : "divide-[#1c222b]")}>
            {groupedPdfs.map((group) => (
              <div key={`pdf-group-${group.key}`} className="w-full">
                {/* Tiêu đề nhóm tập hồ sơ */}
                <div className={cn(
                  "sticky top-0 z-10 px-3.5 py-1.5 backdrop-blur-sm border-b flex items-center justify-between",
                  isLight ? "bg-zinc-50/95 border-zinc-200" : "bg-[#12151c]/95 border-[#1c222b]"
                )}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FolderOpen className={cn("size-3 shrink-0", isLight ? "text-zinc-500" : "text-zinc-400")} />
                    <span className={cn(
                      "font-mono text-[11px] font-bold uppercase tracking-wider truncate",
                      isLight ? "text-zinc-900" : "text-zinc-300"
                    )}>
                      {group.title}
                    </span>
                  </div>
                  <span className={cn(
                    "font-mono text-[10px] px-1.5 py-0.5 rounded border shrink-0 leading-none",
                    isLight ? "text-zinc-500 bg-zinc-100 border-zinc-200" : "text-zinc-400 bg-[#181d26] border-[#262f3e]"
                  )}>
                    {group.items.length}
                  </span>
                </div>

                {/* Danh sách tài liệu trong nhóm */}
                <div>
                  {group.items.map((item) => {
                    const isSelected =
                      highlightSelected &&
                      selectedView?.type === item.type &&
                      selectedView?.data.id === item.data.id;
                    const pdfDoc = item.data as PDFDocument;
                    const code = pdfDoc?.code || "DOC";
                    const title = item.data.title || "";

                    const isPinged =
                      activePing?.targetId === item.data.id ||
                      Boolean(code && activePing?.targetId === code);

                    return (
                      <div
                        id={`doc-card-${item.data.id}`}
                        key={`pdf-${item.data.id}`}
                        onClick={() => {
                          onSelectPdf(pdfDoc);
                          emitInvestigationEvent("FOCUS_CANVAS_DOC", {
                            code: pdfDoc.code || pdfDoc.id,
                            id: item.data.id,
                          });
                        }}
                        className={cn(
                          "w-full text-left px-3.5 py-3 transition-colors duration-150 cursor-pointer relative group select-none border-b last:border-b-0 flex items-center justify-between gap-2.5",
                          isLight ? "border-zinc-100" : "border-[#1c222b]",
                          isPinged
                            ? (isLight ? "bg-rose-100/60" : "bg-rose-950/20")
                            : isSelected
                              ? (isLight ? "bg-zinc-100" : "bg-white/[0.06]")
                              : (isLight ? "bg-transparent hover:bg-zinc-50" : "bg-transparent hover:bg-white/[0.03]"),
                        )}
                      >
                        {/* Vạch chỉ thị active / ping bên trái */}
                        {isSelected ? (
                          <div className={cn("absolute left-0 top-0 bottom-0 w-[2.5px]", isLight ? "bg-zinc-900" : "bg-zinc-200")} />
                        ) : isPinged ? (
                          <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-rose-400 animate-pulse" />
                        ) : null}

                        {/* Khối chính trên 1 dòng: Mã + Tiêu đề */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span
                            className={cn(
                              "font-mono text-xs font-bold tracking-wide shrink-0",
                              isSelected
                                ? (isLight ? "text-zinc-950 font-bold" : "text-zinc-100")
                                : (isLight ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-400 group-hover:text-zinc-200"),
                            )}
                          >
                            {code}
                          </span>

                          <span
                            className={cn(
                              "font-sans text-[13px] truncate transition-colors flex-1",
                              isSelected
                                ? (isLight ? "text-zinc-950 font-bold" : "text-zinc-100 font-semibold")
                                : (isLight ? "text-zinc-900 group-hover:text-zinc-950 font-normal" : "text-zinc-300 group-hover:text-white font-normal"),
                            )}
                            title={title}
                          >
                            {title}
                          </span>

                          {/* Chỉ điểm đồng đội: Gọn gàng ngay cùng dòng */}
                          {isPinged && activePing && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[9px] leading-tight animate-pulse shrink-0">
                              <span className="size-1.5 rounded-full bg-rose-400 animate-ping" />
                              <span className="truncate max-w-[65px]">
                                {activePing.actorName}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Nút chỉ điểm nhanh */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onBroadcastPing(item.data.id, title, undefined, {
                              targetType: "doc",
                              docType: "pdf",
                            });
                          }}
                          className="size-6 rounded hover:bg-rose-500/15 text-zinc-500 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title="Chỉ điểm tài liệu này cho đồng đội"
                        >
                          <Target className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
}

