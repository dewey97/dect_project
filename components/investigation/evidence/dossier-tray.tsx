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

    const result: { key: string; title: string; items: CombinedItem[] }[] = [];
    groupsMap.forEach((g) => {
      if (g.items.length > 0) {
        g.items.sort((a, b) => a.order - b.order);
        result.push(g);
      }
    });

    if (unassignedGroup.items.length > 0) {
      unassignedGroup.items.sort((a, b) => a.order - b.order);
      result.push(unassignedGroup);
    }

    return result;
  }, [dossiers, pdfItems]);

  const filteredPdfs = pdfItems;
  const filteredEvidence = evidenceItems;

  return (
    <div
      style={{
        width: isDossierCollapsed ? 0 : `${dossierWidth}px`,
        transition: isResizing ? "none" : undefined,
      }}
      className={cn(
        "w-full lg:w-auto shrink-0 bg-[#0f1115] rounded-none flex flex-col h-full min-h-0 select-none relative transition-[width] duration-150 ease-out",
        resizableSide === "right" ? "border-r border-[#1e232b]" : "border-l border-[#1e232b]",
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
            isResizing && "bg-zinc-500/20"
          )}
          title="Kéo sang hai bên để thay đổi độ rộng khay (Nhấp đúp để đặt lại mặc định)"
        >
          <div
            className={cn(
              "w-[2px] h-12 rounded-full transition-all group-hover:h-24 group-hover:w-[3px] group-hover:bg-zinc-300 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]",
              isResizing ? "bg-zinc-300 h-full w-[2px]" : "bg-white/20 group-hover:bg-zinc-300"
            )}
          />
        </div>
      )}

      {/* 2. PHẦN TRÊN: PANEL CÂU HỎI / THẨM TRA (TỰ ÔM KHÍT NỘI DUNG, KHÔNG BỊ HỞ KHOẢNG TRỐNG) */}
      {activeInspector && inspectorContent && (
        <div className="shrink-0 max-h-[52vh] flex flex-col bg-[#16181d] border-b border-[#262c37] overflow-y-auto shadow-md relative animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
          {inspectorContent}
        </div>
      )}

      {/* 3. PHẦN DƯỚI: KHAY HỒ SƠ & VẬT CHỨNG (HIỆN BÊN DƯỚI) */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0f1115]">
        {/* 1. SIDEBAR HEADER: TÊN DANH MỤC */}
        <div className="shrink-0 px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-[#1b2029]">
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="size-4 text-zinc-400 shrink-0" />
            <span className="font-sans text-xs font-semibold tracking-wide text-zinc-200 uppercase truncate">
              Hồ sơ & Vật chứng
            </span>
          </div>
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex size-6 items-center justify-center rounded hover:bg-[#1b202a] text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer border border-[#262c37]"
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
        <div className="p-1 bg-[#090b0e] rounded-md border border-[#1b2029] flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSetFilterTab("pdf")}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-sm font-sans text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              filterTab === "pdf"
                ? "bg-[#1c2330] text-zinc-100 font-semibold border border-[#2d3748] shadow-xs"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-[#13171f]",
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
                ? "bg-[#1c2330] text-zinc-100 font-semibold border border-[#2d3748] shadow-xs"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-[#13171f]",
            )}
          >
            <ImageIcon className="size-3.5 shrink-0" />
            <span className="truncate">Vật chứng</span>
          </button>
        </div>
      </div>

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
                      "w-full aspect-[4/3] text-left rounded-md border transition-all duration-150 cursor-pointer relative overflow-hidden group bg-[#0c0e12]",
                      isPinged
                        ? "border-rose-500/70 ring-1 ring-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                        : isSelected
                          ? "border-zinc-300 ring-1 ring-zinc-300/40 shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
                          : "border-[#1f2530] hover:border-[#323d4e]",
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
                        <span className="inline-block px-1.5 py-0.5 rounded-xs bg-[#141820]/95 text-[0.6rem] font-mono font-bold tracking-wider text-zinc-200 border border-[#2b3545] mb-0.5">
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
          <div className="divide-y divide-[#1c222b]">
            {groupedPdfs.map((group) => (
              <div key={`pdf-group-${group.key}`} className="w-full">
                {/* Tiêu đề nhóm tập hồ sơ */}
                <div className="sticky top-0 z-10 px-3.5 py-1.5 bg-[#12151c]/95 backdrop-blur-sm border-b border-[#1c222b] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FolderOpen className="size-3 text-zinc-400 shrink-0" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-300 truncate">
                      {group.title}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400 bg-[#181d26] px-1.5 py-0.5 rounded border border-[#262f3e] shrink-0 leading-none">
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
                          "w-full text-left px-3.5 py-3 transition-colors duration-150 cursor-pointer relative group select-none border-b border-[#1c222b] last:border-b-0 flex items-center justify-between gap-2.5",
                          isPinged
                            ? "bg-rose-950/20"
                            : isSelected
                              ? "bg-white/[0.06]"
                              : "bg-transparent hover:bg-white/[0.03]",
                        )}
                      >
                        {/* Vạch chỉ thị active / ping bên trái */}
                        {isSelected ? (
                          <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-zinc-200" />
                        ) : isPinged ? (
                          <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-rose-400 animate-pulse" />
                        ) : null}

                        {/* Khối chính trên 1 dòng: Mã + Tiêu đề */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span
                            className={cn(
                              "font-mono text-xs font-bold tracking-wide shrink-0",
                              isSelected
                                ? "text-zinc-100"
                                : "text-zinc-400 group-hover:text-zinc-200",
                            )}
                          >
                            {code}
                          </span>

                          <span
                            className={cn(
                              "font-sans text-[13px] truncate transition-colors flex-1",
                              isSelected
                                ? "text-zinc-100 font-semibold"
                                : "text-zinc-300 group-hover:text-white font-normal",
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

