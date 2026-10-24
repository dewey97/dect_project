import React, { useState, useMemo } from "react";
import {
  FileText,
  ImageIcon,
  Target,
  FolderOpen,
  Search,
  X,
} from "lucide-react";
import { cn, normalizeImageUrl } from "@/lib/utils";
import type {
  CombinedItem,
  PDFDocument,
  PhysicalEvidence,
  SelectedView,
} from "@/components/investigation/evidence/evidence-types";
import type { DbCaseDossier } from "@/lib/types/database";

interface DossierTrayProps {
  dossierWidth: number;
  isDossierCollapsed: boolean;
  isViewerExpanded: boolean;
  mobileTab: "board" | "dossier";
  filterTab: "pdf" | "evidence";
  onSetFilterTab: (tab: "pdf" | "evidence") => void;
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
  dossierWidth,
  isDossierCollapsed,
  isViewerExpanded,
  mobileTab,
  filterTab,
  onSetFilterTab,
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
  const [searchQuery, setSearchQuery] = useState("");

  const activeFilter = String(
    selectedDossierFilter || selectedPhaseFilter || "all",
  );

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
        { label: "Khởi đầu", val: "ban_dau" },
        { label: "Bộ A", val: "bo_a" },
        { label: "Bộ B", val: "bo_b" },
        { label: "Bộ C", val: "bo_c" },
      );
    }
    list.push(
      { label: "Vật chứng", val: "evidence" },
      { label: "Chưa gán bộ", val: "unassigned" },
    );
    return list;
  }, [dossiers]);

  const handleFilterSelect = (val: string) => {
    if (val === "evidence") {
      onSetFilterTab("evidence");
    }
    if (onSetDossierFilter) {
      onSetDossierFilter(val);
    }
    if (onSetPhaseFilter) {
      onSetPhaseFilter(val);
    }
  };

  // Lọc tài liệu theo từ khóa tìm kiếm
  const filteredPdfs = useMemo(() => {
    if (!searchQuery.trim()) return pdfItems;
    const q = searchQuery.toLowerCase().trim();
    return pdfItems.filter((item) => {
      const pdf = item.data as PDFDocument;
      const code = (pdf.code || "").toLowerCase();
      const title = (item.data.title || "").toLowerCase();
      return code.includes(q) || title.includes(q);
    });
  }, [pdfItems, searchQuery]);

  // Lọc vật chứng theo từ khóa tìm kiếm
  const filteredEvidence = useMemo(() => {
    if (!searchQuery.trim()) return evidenceItems;
    const q = searchQuery.toLowerCase().trim();
    return evidenceItems.filter((item) => {
      const ev = item.data as PhysicalEvidence;
      const code = (ev.code || "").toLowerCase();
      const title = (item.data.title || "").toLowerCase();
      return code.includes(q) || title.includes(q);
    });
  }, [evidenceItems, searchQuery]);

  return (
    <div
      style={{
        width: isDossierCollapsed ? 0 : `${dossierWidth}px`,
      }}
      className={cn(
        "w-full lg:w-auto shrink-0 bg-[#130f0c] border-r border-[#261b12] rounded-none overflow-hidden flex flex-col h-full min-h-0 select-none transition-[width] duration-150 ease-out",
        isDossierCollapsed && "lg:hidden",
        isViewerExpanded && "hidden xl:flex",
        mobileTab === "dossier" ? "flex" : "hidden lg:flex",
      )}
    >
      {/* 1. SIDEBAR HEADER: TÊN DANH MỤC + TỔNG SỐ LƯỢNG */}
      <div className="shrink-0 px-3 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FolderOpen className="size-4 text-[#d9a066] shrink-0" />
          <span className="font-sans text-xs font-semibold tracking-wide text-[#e8dcce] uppercase truncate">
            Hồ sơ & Vật chứng
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#9c8472] bg-[#1d1510] px-1.5 py-0.5 rounded border border-[#302115] shrink-0">
          {filterTab === "pdf"
            ? `${filteredPdfs.length} tài liệu`
            : `${filteredEvidence.length} vật chứng`}
        </span>
      </div>

      {/* 2. MODERN SEGMENTED TABS (TÀI LIỆU | VẬT CHỨNG) */}
      <div className="shrink-0 px-3 pb-2">
        <div className="p-1 bg-[#0b0806] rounded-md border border-[#23170e] flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSetFilterTab("pdf")}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-sm font-sans text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              filterTab === "pdf"
                ? "bg-[#291b12] text-[#f4e8d8] font-semibold border border-[#442e1f] shadow-xs"
                : "text-[#846f5d] hover:text-[#d4c3b3] hover:bg-[#160f09]",
            )}
          >
            <FileText className="size-3.5 shrink-0" />
            <span className="truncate">Tài liệu</span>
            <span
              className={cn(
                "font-mono text-[10px] px-1.5 py-0.2 rounded-full leading-none",
                filterTab === "pdf"
                  ? "bg-[#3d2719] text-[#e8a86a]"
                  : "bg-[#18110b] text-[#6d5b4d]",
              )}
            >
              {pdfItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSetFilterTab("evidence")}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-sm font-sans text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              filterTab === "evidence"
                ? "bg-[#291b12] text-[#f4e8d8] font-semibold border border-[#442e1f] shadow-xs"
                : "text-[#846f5d] hover:text-[#d4c3b3] hover:bg-[#160f09]",
            )}
          >
            <ImageIcon className="size-3.5 shrink-0" />
            <span className="truncate">Vật chứng</span>
            <span
              className={cn(
                "font-mono text-[10px] px-1.5 py-0.2 rounded-full leading-none",
                filterTab === "evidence"
                  ? "bg-[#3d2719] text-[#e8a86a]"
                  : "bg-[#18110b] text-[#6d5b4d]",
              )}
            >
              {evidenceItems.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. TÌM KIẾM NHANH (SEARCH INPUT) */}
      <div className="shrink-0 px-3 pb-2">
        <div className="relative flex items-center">
          <Search className="size-3.5 absolute left-2.5 text-[#6c5746] pointer-events-none shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              filterTab === "pdf"
                ? "Tìm mã hoặc tên tài liệu..."
                : "Tìm tên hoặc mã vật chứng..."
            }
            className="w-full pl-8 pr-7 py-1.5 bg-[#0b0806] border border-[#23170e] focus:border-[#d9a066]/60 rounded-md text-xs text-[#e5d8cb] placeholder:text-[#5e4b3c] outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 p-0.5 text-[#846f5d] hover:text-[#f4e8d8] cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* 4. DOSSIER FILTER CHIPS (TẤT CẢ / CÁC BỘ HỒ SƠ / VẬT CHỨNG / CHƯA GÁN BỘ) */}
      <div className="shrink-0 px-3 pb-2.5 flex items-center gap-1 overflow-x-auto custom-scrollbar border-b border-[#23170e]">
        {chips.map((chip) => {
          const isLocked = isDossierUnlocked
            ? !isDossierUnlocked(chip.val)
            : false;
          const isSelected = activeFilter === chip.val;
          return (
            <button
              key={chip.val}
              disabled={isLocked}
              onClick={() => handleFilterSelect(chip.val)}
              className={cn(
                "px-2 py-1 rounded text-[11px] font-sans font-medium transition-all whitespace-nowrap",
                isLocked
                  ? "opacity-25 cursor-not-allowed text-[#5a483a]"
                  : isSelected
                    ? "bg-[#d9a066] text-[#120a05] font-bold shadow-xs cursor-default"
                    : "text-[#846f5d] hover:text-[#d4c3b3] hover:bg-[#1a120b] cursor-pointer",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* 5. DANH SÁCH CUỘN CHÍNH (MAIN SCROLLABLE CONTENT) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 p-2 space-y-1.5">
        {filterTab === "evidence" ? (
          /* DANH SÁCH VẬT CHỨNG: 2 CỘT GRID HIỆN ĐẠI */
          filteredEvidence.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <ImageIcon className="size-8 text-[#3d2c1e] mx-auto mb-2" />
              <p className="text-xs font-sans text-[#78614e]">
                {searchQuery
                  ? "Không tìm thấy vật chứng phù hợp."
                  : "Chưa thu thập vật chứng nào."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredEvidence.map((item) => {
                const isSelected =
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
                    onClick={() => onSelectEvidence(evItem)}
                    className={cn(
                      "w-full aspect-[4/3] text-left rounded-md border transition-all duration-150 cursor-pointer relative overflow-hidden group bg-[#090705]",
                      isPinged
                        ? "border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_16px_rgba(245,158,11,0.5)] animate-pulse"
                        : isSelected
                          ? "border-[#d9a066] ring-1 ring-[#d9a066] shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
                          : "border-[#261b12] hover:border-[#4d3624]",
                    )}
                  >
                    <img
                      src={
                        normalizeImageUrl(evItem?.thumbnail) ||
                        "/photo_scene_overview.jpg"
                      }
                      alt={item.data.title || "Vật chứng"}
                      className="w-full h-full object-cover select-none transition-transform duration-200 group-hover:scale-105"
                    />

                    {/* Gradient overlay nhẹ cho chân ảnh */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                    {/* Nhãn mã số + tiêu đề ở chân thẻ */}
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 pointer-events-none">
                      {evItem?.code && (
                        <span className="inline-block px-1.5 py-0.5 rounded-xs bg-[#1a120c]/90 text-[0.6rem] font-mono font-bold tracking-wider text-[#e8a86a] border border-[#3d2719] mb-0.5">
                          {evItem.code}
                        </span>
                      )}
                      <p className="text-[11px] font-sans text-stone-200 truncate leading-tight">
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
                      className="absolute top-1.5 right-1.5 size-6 rounded bg-black/75 hover:bg-amber-500 text-stone-300 hover:text-black border border-white/15 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer shadow-sm z-10"
                      title="Chỉ điểm vật chứng này cho đồng đội"
                    >
                      <Target className="size-3.5" />
                    </button>

                    {/* Badge đồng đội đang chỉ điểm */}
                    {isPinged && activePing && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-black font-mono text-[0.6rem] font-bold tracking-wider shadow-md flex items-center gap-1 z-10 animate-bounce">
                        <Target className="size-2.5" />
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
        ) : /* DANH SÁCH HỒ SƠ TÀI LIỆU: SIDEBAR LIST ITEMS HIỆN ĐẠI */
        filteredPdfs.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <FileText className="size-8 text-[#3d2c1e] mx-auto mb-2" />
            <p className="text-xs font-sans text-[#78614e]">
              {searchQuery
                ? "Không tìm thấy tài liệu phù hợp."
                : "Chưa có tài liệu trong giai đoạn này."}
            </p>
          </div>
        ) : (
          filteredPdfs.map((item) => {
            const isSelected =
              selectedView?.type === item.type &&
              selectedView?.data.id === item.data.id;
            const pdfDoc = item.data as PDFDocument;
            const code = pdfDoc?.code || "DOC";
            const title = item.data.title || "";
            const titleLower = title.toLowerCase();

            const isLyLich =
              titleLower.includes("lý lịch") ||
              titleLower.includes("nhân thân");
            const isLoiKhai =
              titleLower.includes("lời khai") ||
              titleLower.includes("hỏi cung") ||
              titleLower.includes("tự thú");
            const isHuongDan =
              code === "00-HD" || titleLower.includes("hướng dẫn");

            const badgeText = isLyLich
              ? "Lý lịch"
              : isLoiKhai
                ? "Lời khai"
                : isHuongDan
                  ? "Chỉ dẫn"
                  : "Hồ sơ";

            const badgeColor = isLyLich
              ? "text-rose-400 bg-rose-950/40 border-rose-900/40"
              : isLoiKhai
                ? "text-sky-400 bg-sky-950/40 border-sky-900/40"
                : isHuongDan
                  ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/40"
                  : "text-amber-400 bg-amber-950/40 border-amber-900/40";

            const isPinged =
              activePing?.targetId === item.data.id ||
              Boolean(code && activePing?.targetId === code);

            return (
              <div
                id={`doc-card-${item.data.id}`}
                key={`pdf-${item.data.id}`}
                onClick={() => onSelectPdf(pdfDoc)}
                className={cn(
                  "w-full text-left p-2.5 rounded-md transition-all duration-150 cursor-pointer relative overflow-hidden group select-none border",
                  isPinged
                    ? "bg-amber-950/30 border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_16px_rgba(245,158,11,0.4)] animate-pulse"
                    : isSelected
                      ? "bg-[#21160e] border-[#d9a066]/70 shadow-xs ring-1 ring-[#d9a066]/20"
                      : "bg-[#150f0a] hover:bg-[#1b130d] border-[#241910] hover:border-[#382618]",
                )}
              >
                {/* Vạch chỉ thị active bên trái */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#d9a066]" />
                )}

                {/* Dòng 1: Mã hồ sơ + Badge phân loại + Nút Ping */}
                <div className="flex items-center justify-between gap-1.5 mb-1 pl-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={cn(
                        "font-mono text-[11px] font-bold tracking-wide transition-colors shrink-0",
                        isSelected
                          ? "text-[#d9a066]"
                          : "text-[#b88c60] group-hover:text-[#e0ad7b]",
                      )}
                    >
                      {code}
                    </span>
                    <span
                      className={cn(
                        "font-sans text-[10px] px-1.5 py-0.2 rounded border font-medium shrink-0",
                        badgeColor,
                      )}
                    >
                      {badgeText}
                    </span>
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
                    className="size-5 rounded hover:bg-amber-500/20 text-[#846f5d] hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center shrink-0"
                    title="Chỉ điểm tài liệu này cho đồng đội"
                  >
                    <Target className="size-3" />
                  </button>
                </div>

                {/* Badge báo đồng đội đang ping */}
                {isPinged && activePing && (
                  <div className="mb-1.5 ml-1 px-1.5 py-0.5 rounded bg-amber-500 text-black font-mono text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <Target className="size-2.5 animate-spin shrink-0" />
                    <span className="truncate">
                      {activePing.actorName} đang chỉ điểm
                    </span>
                  </div>
                )}

                {/* Dòng 2: Tiêu đề tài liệu */}
                <p
                  className={cn(
                    "font-sans text-xs leading-snug line-clamp-2 pl-1 transition-colors",
                    isSelected
                      ? "text-[#fbf4eb] font-medium"
                      : "text-[#beb09f] group-hover:text-[#f2e7db]",
                  )}
                >
                  {title}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
