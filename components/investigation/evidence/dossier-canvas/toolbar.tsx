"use client";

import React from "react";
import {
  Search,
  Highlighter,
  Eraser,
  BookOpen,
  Volume2,
  VolumeX,
  Hand,
  Pen,
  StickyNote,
  ChevronDown,
  Scissors,
  Minus,
  Plus,
  ClipboardCheck,
  Palette,
  HelpCircle,
  Sun,
  Moon,
  SquareKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  emitInvestigationEvent,
} from "@/lib/investigation/investigation-events";
import {
  type AnnotationTool,
  type EraserMode,
} from "../dossier-annotation-layer";
import {
  HIGHLIGHTER_PALETTE,
  HIGHLIGHTER_SIZES,
  PEN_PALETTE,
  PEN_SIZES,
  STICKY_NOTE_COLORS,
} from "./presets";

export interface DossierCanvasToolbarProps {
  isLight: boolean;
  isBoardFullscreen: boolean;
  isSearchOpen: boolean;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setCurrentSearchIndex: React.Dispatch<React.SetStateAction<number>>;
  handlePrevSearch: () => void;
  handleNextSearch: () => void;
  searchResults: { id: string; code: string; title: string; elementId: string; snippet: string; count: number; }[];
  currentSearchIndex: number;
  handleSelectSearchResult: (item: { id: string; code: string; title: string; elementId: string; snippet: string; count: number; }, index?: number) => void;
  setActiveTool: React.Dispatch<React.SetStateAction<AnnotationTool>>;
  setIsPenPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsHighlighterPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNotePopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsThemePopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeTool: AnnotationTool;
  penRef: React.RefObject<HTMLDivElement | null>;
  isPenPopupOpen: boolean;
  setPenColor: React.Dispatch<React.SetStateAction<string>>;
  penColor: string;
  setPenSize: React.Dispatch<React.SetStateAction<number>>;
  penSize: number;
  highlighterRef: React.RefObject<HTMLDivElement | null>;
  isHighlighterPopupOpen: boolean;
  setHighlighterColor: React.Dispatch<React.SetStateAction<string>>;
  highlighterColor: string;
  setHighlighterSize: React.Dispatch<React.SetStateAction<number>>;
  highlighterSize: number;
  eraserRef: React.RefObject<HTMLDivElement | null>;
  setIsEraserPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  eraserMode: EraserMode;
  isEraserPopupOpen: boolean;
  setEraserMode: React.Dispatch<React.SetStateAction<EraserMode>>;
  noteRef: React.RefObject<HTMLDivElement | null>;
  handleNoteMouseEnter: () => void;
  handleNoteMouseLeave: () => void;
  handleAddStickyNote: (color?: string) => void;
  currentNoteColor: string;
  isNotePopupOpen: boolean;
  setCurrentNoteColor: React.Dispatch<React.SetStateAction<string>>;
  searchButtonRef: React.RefObject<HTMLButtonElement | null>;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenNotebook: (() => void) | undefined;
  renderInvestigationBoard: React.ReactNode;
  focusOnElement: (elementId: string, smoothZoom?: number) => void;
  handleToggleAudio: () => void;
  isAudioMuted: boolean;
  handleZoomOut: () => void;
  handleResetZoom: () => void;
  zoomScale: number;
  handleZoomIn: () => void;
  onToggleUiTheme: (() => void) | undefined;
  isThemePopupOpen: boolean;
  onOpenIndictment: (() => void) | undefined;
}

export function DossierCanvasToolbar({
  isLight,
  isBoardFullscreen,
  isSearchOpen,
  searchContainerRef,
  searchInputRef,
  searchQuery,
  setSearchQuery,
  setCurrentSearchIndex,
  handlePrevSearch,
  handleNextSearch,
  searchResults,
  currentSearchIndex,
  handleSelectSearchResult,
  setActiveTool,
  setIsPenPopupOpen,
  setIsHighlighterPopupOpen,
  setIsNotePopupOpen,
  setIsThemePopupOpen,
  activeTool,
  penRef,
  isPenPopupOpen,
  setPenColor,
  penColor,
  setPenSize,
  penSize,
  highlighterRef,
  isHighlighterPopupOpen,
  setHighlighterColor,
  highlighterColor,
  setHighlighterSize,
  highlighterSize,
  eraserRef,
  setIsEraserPopupOpen,
  eraserMode,
  isEraserPopupOpen,
  setEraserMode,
  noteRef,
  handleNoteMouseEnter,
  handleNoteMouseLeave,
  handleAddStickyNote,
  currentNoteColor,
  isNotePopupOpen,
  setCurrentNoteColor,
  searchButtonRef,
  setIsSearchOpen,
  onOpenNotebook,
  renderInvestigationBoard,
  focusOnElement,
  handleToggleAudio,
  isAudioMuted,
  handleZoomOut,
  handleResetZoom,
  zoomScale,
  handleZoomIn,
  onToggleUiTheme,
  isThemePopupOpen,
  onOpenIndictment,
}: DossierCanvasToolbarProps) {
  return (
    <div
        id="dossier-floating-toolbar"
        data-tour="canvas-bottom-toolbar"
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          "fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl w-max max-w-[calc(100vw-2rem)] select-none overflow-visible transition-all duration-300 ease-in-out backdrop-blur-2xl",
          isLight
            ? "bg-white/98 border border-zinc-200 shadow-[0_16px_40px_rgba(0,0,0,0.12)] text-zinc-800"
            : "bg-[#121418]/98 border border-[#353945] shadow-[0_16px_48px_rgba(0,0,0,0.9)] text-zinc-300",
          isBoardFullscreen
            ? "opacity-0 pointer-events-none translate-y-8 scale-95"
            : "opacity-100 pointer-events-auto translate-y-0 scale-100"
        )}
      >
        {/* BẢNG TÌM KIẾM CHỮ TRONG TÀI LIỆU FLOATING (KHÔNG VIỀN, KHÔNG DẤU X, CLICK RA NGOÀI LÀ TỰ ĐÓNG) */}
        {isSearchOpen && (
          <div
            ref={searchContainerRef}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[420px] max-w-[calc(100vw-2rem)] bg-[#121418]/98 backdrop-blur-2xl rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.95)] p-2.5 flex flex-col gap-2 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Input bar (Không viền, Không nút X) */}
            <div className="flex items-center gap-2.5 bg-[#1b1e26] px-3 py-2 rounded-xl">
              <Search className="size-4 text-zinc-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentSearchIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (e.shiftKey) {
                      handlePrevSearch();
                    } else {
                      handleNextSearch();
                    }
                  }
                }}
                placeholder="Tìm từ khóa trong hồ sơ (VD: dao, vân tay, 21h30...)"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 outline-none font-sans"
              />
            </div>

            {/* Kết quả tìm kiếm */}
            {searchQuery.trim().length >= 2 && (
              <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto custom-scrollbar pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1 pb-1 border-b border-zinc-800/80">
                  <span>
                    {searchResults.length > 0
                      ? `Tìm thấy trong ${searchResults.length} tài liệu`
                      : "Không tìm thấy kết quả phù hợp"}
                  </span>
                  {searchResults.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>
                        {currentSearchIndex + 1}/{searchResults.length}
                      </span>
                      <button
                        type="button"
                        onClick={handlePrevSearch}
                        className="size-5 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-300 cursor-pointer"
                        title="Tài liệu trước"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={handleNextSearch}
                        className="size-5 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-300 cursor-pointer"
                        title="Tài liệu tiếp theo"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>

                {searchResults.map((res, idx) => {
                  const isCurrent = idx === currentSearchIndex;
                  return (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(res, idx)}
                      className={cn(
                        "w-full text-left p-2 rounded-lg transition-colors cursor-pointer flex flex-col gap-0.5",
                        isCurrent
                          ? "bg-zinc-800/90 text-white"
                          : "hover:bg-zinc-800/40 text-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {res.code}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">
                          {res.count} lần xuất hiện
                        </span>
                      </div>
                      <span className="text-xs font-medium text-zinc-200 truncate">
                        {res.title}
                      </span>
                      <p className="text-[11px] font-sans text-zinc-400 line-clamp-1 italic">
                        {res.snippet}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 1. CỤM CÔNG CỤ VẼ & TƯƠNG TÁC */}
        {/* NÚT BÀN TAY (PAN / CON TRỎ CHUỘT) */}
        <button
          type="button"
          onClick={() => {
            setActiveTool("cursor");
            setIsPenPopupOpen(false);
            setIsHighlighterPopupOpen(false);
            setIsNotePopupOpen(false);
            setIsThemePopupOpen(false);
          }}
          className={cn(
            "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
            activeTool === "cursor"
              ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
              : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70")
          )}
          title="Bàn tay (Di chuyển góc nhìn & kéo tài liệu)"
        >
          <Hand className="size-4.5" />
        </button>

        {/* NÚT BÚT VẼ (PEN TOOL) & POPUP CHỌN MÀU + ĐỘ DÀY (FIGMA STYLE) */}
        <div className="relative shrink-0 flex items-center gap-0.5" ref={penRef}>
          {/* Icon chính: Chỉ kích hoạt bút, không mở popup màu */}
          <button
            type="button"
            onClick={() => {
              setActiveTool("pen");
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
            }}
            className={cn(
              "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
              activeTool === "pen"
                ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
                : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70")
            )}
            title="Bút vẽ hồ sơ"
          >
            <Pen className="size-4.5" />
          </button>

          {/* Mũi tên nhỏ tách rời: Ấn vào mới mở bảng đổi màu */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTool("pen");
              setIsHighlighterPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              setIsPenPopupOpen((prev) => !prev);
            }}
            className={cn(
              "p-1 rounded-md transition-all cursor-pointer flex items-center justify-center shrink-0",
              isLight
                ? (isPenPopupOpen ? "text-amber-600 bg-zinc-100 rotate-180" : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100")
                : (isPenPopupOpen ? "text-[#f5c344] bg-zinc-800/90 rotate-180" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80")
            )}
            title="Chọn màu & độ dày nét vẽ"
          >
            <ChevronDown className="size-3 stroke-[2.5]" />
          </button>

          {/* BẢNG CHỌN MÀU & ĐỘ DÀY BÚT VẼ (KHÔNG CHỮ - PURE FIGMA STYLE) */}
          {isPenPopupOpen && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute bottom-full left-0 mb-3 p-2 bg-[#121418]/98 backdrop-blur-2xl rounded-xl shadow-2xl flex flex-col gap-2 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100 border-0"
            >
              {/* 6 màu nét vẽ */}
              <div className="flex items-center gap-1.5 px-0.5">
                {PEN_PALETTE.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPenColor(p.color);
                      setActiveTool("pen");
                    }}
                    style={{ backgroundColor: p.color }}
                    className={cn(
                      "size-6 rounded-full transition-transform cursor-pointer border border-white/20 hover:scale-115 shadow-sm",
                      penColor === p.color &&
                        "scale-125 ring-2 ring-[#f5c344] ring-offset-2 ring-offset-[#121418]"
                    )}
                    title={p.label}
                  />
                ))}
              </div>

              {/* Phân cách */}
              <div className="w-full h-[1px] bg-zinc-800 my-0.5" />

              {/* 4 độ dày nét */}
              <div className="flex items-center justify-between gap-1 px-0.5">
                {PEN_SIZES.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPenSize(s.size);
                      setActiveTool("pen");
                    }}
                    className={cn(
                      "size-7 flex items-center justify-center rounded-lg transition-all cursor-pointer",
                      penSize === s.size
                        ? "bg-zinc-800 text-[#f5c344] ring-1 ring-[#f5c344]"
                        : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
                    )}
                    title={`Nét ${s.label} (${s.size}px)`}
                  >
                    <span
                      style={{ backgroundColor: penColor }}
                      className={cn("rounded-full", s.dot)}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* NÚT BÚT DẠ QUANG HIGHLIGHTER & POPUP CHỌN MÀU + BẢN TÔ (FIGMA STYLE) */}
        <div className="relative shrink-0 flex items-center gap-0.5" ref={highlighterRef}>
          {/* Icon chính: Chỉ kích hoạt dạ quang, không mở popup màu */}
          <button
            type="button"
            onClick={() => {
              setActiveTool("highlighter");
              setIsPenPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
            }}
            className={cn(
              "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
              activeTool === "highlighter"
                ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
                : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70")
            )}
            title="Bút nhớ dạ quang"
          >
            <Highlighter className="size-4.5" />
          </button>

          {/* Mũi tên nhỏ tách rời: Ấn vào mới mở bảng đổi màu */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTool("highlighter");
              setIsPenPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              setIsHighlighterPopupOpen((prev) => !prev);
            }}
            className={cn(
              "p-1 rounded-md transition-all cursor-pointer flex items-center justify-center shrink-0",
              isLight
                ? (isHighlighterPopupOpen ? "text-amber-600 bg-zinc-100 rotate-180" : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100")
                : (isHighlighterPopupOpen ? "text-[#f5c344] bg-zinc-800/90 rotate-180" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80")
            )}
            title="Chọn màu & bản tô dạ quang"
          >
            <ChevronDown className="size-3 stroke-[2.5]" />
          </button>

          {/* BẢNG CHỌN MÀU & BẢN TÔ HIGHLIGHTER (KHÔNG CHỮ - PURE FIGMA STYLE) */}
          {isHighlighterPopupOpen && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute bottom-full left-0 mb-3 p-2 bg-[#121418]/98 backdrop-blur-2xl rounded-xl shadow-2xl flex flex-col gap-2 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100 border-0"
            >
              {/* 5 màu dạ quang */}
              <div className="flex items-center gap-1.5 px-0.5">
                {HIGHLIGHTER_PALETTE.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHighlighterColor(p.color);
                      setActiveTool("highlighter");
                    }}
                    style={{ backgroundColor: p.color }}
                    className={cn(
                      "size-6 rounded-full transition-transform cursor-pointer border border-white/20 hover:scale-115 shadow-sm",
                      highlighterColor === p.color &&
                        "scale-125 ring-2 ring-[#f5c344] ring-offset-2 ring-offset-[#121418]"
                    )}
                    title={p.label}
                  />
                ))}
              </div>

              {/* Phân cách */}
              <div className="w-full h-[1px] bg-zinc-800 my-0.5" />

              {/* 3 bản tô */}
              <div className="flex items-center justify-between gap-1.5 px-0.5">
                {HIGHLIGHTER_SIZES.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHighlighterSize(s.size);
                      setActiveTool("highlighter");
                    }}
                    className={cn(
                      "h-7 px-2 flex items-center justify-center rounded-lg transition-all cursor-pointer",
                      highlighterSize === s.size
                        ? "bg-zinc-800 ring-1 ring-[#f5c344]"
                        : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
                    )}
                    title={`Bản ${s.label} (${s.size}px)`}
                  >
                    <span
                      style={{ backgroundColor: highlighterColor }}
                      className={cn("rounded-sm opacity-85", s.bar)}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* NÚT TẨY XÓA NÉT VẼ & POPUP CHỌN CHẾ ĐỘ TẨY (FIGMA STYLE) */}
        <div className="relative shrink-0 flex items-center gap-0.5" ref={eraserRef}>
          {/* Icon chính: Chỉ kích hoạt tẩy, không mở popup chế độ */}
          <button
            type="button"
            onClick={() => {
              setActiveTool("eraser");
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              setIsEraserPopupOpen(false);
            }}
            className={cn(
              "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
              activeTool === "eraser"
                ? "bg-[#f5c344] text-[#121316] font-bold shadow-md scale-105"
                : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70")
            )}
            title={eraserMode === "freeform" ? "Tẩy nét tùy ý (Gọt tỉa nét)" : "Tẩy trọn nét liền (Chạm là xóa cả nét)"}
          >
            <Eraser className="size-4.5" />
          </button>

          {/* Mũi tên nhỏ tách rời: Ấn vào mới mở bảng chọn chế độ tẩy */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTool("eraser");
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              setIsEraserPopupOpen((prev) => !prev);
            }}
            className={cn(
              "p-1 rounded-md transition-all cursor-pointer flex items-center justify-center shrink-0",
              isLight
                ? (isEraserPopupOpen ? "text-amber-600 bg-zinc-100 rotate-180" : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100")
                : (isEraserPopupOpen ? "text-[#f5c344] bg-zinc-800/90 rotate-180" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80")
            )}
            title="Chọn chế độ tẩy xóa"
          >
            <ChevronDown className="size-3 stroke-[2.5]" />
          </button>

          {/* BẢNG CHỌN CHẾ ĐỘ TẨY (FIGMA POPUP) */}
          {isEraserPopupOpen && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-1.5 bg-[#121418]/98 backdrop-blur-2xl rounded-xl shadow-2xl flex flex-col gap-1 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100 border-0 min-w-[175px]"
            >
              <button
                type="button"
                onClick={() => {
                  setEraserMode("freeform");
                  setActiveTool("eraser");
                  setIsEraserPopupOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer",
                  eraserMode === "freeform"
                    ? "bg-zinc-800 text-[#f5c344] font-semibold"
                    : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                )}
              >
                <Scissors className="size-3.5 shrink-0" />
                <span>Xóa nét tùy ý</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEraserMode("stroke");
                  setActiveTool("eraser");
                  setIsEraserPopupOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer",
                  eraserMode === "stroke"
                    ? "bg-zinc-800 text-[#f5c344] font-semibold"
                    : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                )}
              >
                <Eraser className="size-3.5 shrink-0" />
                <span>Xóa trọn nét liền</span>
              </button>
            </div>
          )}
        </div>

        {/* NÚT DÁN NOTE VUÔNG (STICKY NOTE) - HOVER HOẶC BẤM MŨI TÊN ĐỂ CHỌN MÀU */}
        <div
          className="relative shrink-0 flex items-center gap-0.5"
          ref={noteRef}
          onMouseEnter={handleNoteMouseEnter}
          onMouseLeave={handleNoteMouseLeave}
        >
          {/* Icon chính - bấm vào tạo note ngay với màu hiện tại */}
          <button
            type="button"
            onClick={() => {
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsEraserPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              handleAddStickyNote(currentNoteColor);
            }}
            className={cn(
              "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95",
              isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
            )}
            title="Dán giấy ghi chú vuông (Hover để chọn màu)"
          >
            <StickyNote className="size-4.5" />
          </button>

          {/* Mũi tên nhỏ tách rời: Bấm vào mở chọn màu */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsEraserPopupOpen(false);
              setIsThemePopupOpen(false);
              setIsNotePopupOpen((prev) => !prev);
            }}
            className={cn(
              "p-1 rounded-md transition-all cursor-pointer flex items-center justify-center shrink-0",
              isLight
                ? (isNotePopupOpen ? "text-amber-600 bg-zinc-100 rotate-180" : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100")
                : (isNotePopupOpen ? "text-[#f5c344] bg-zinc-800/90 rotate-180" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80")
            )}
            title="Chọn màu giấy note"
          >
            <ChevronDown className="size-3 stroke-[2.5]" />
          </button>

          {/* BẢNG CHỌN MÀU NOTE (KHÔNG CHỮ - PURE FIGMA STYLE) */}
          {isNotePopupOpen && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              onMouseEnter={handleNoteMouseEnter}
              onMouseLeave={handleNoteMouseLeave}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-2 bg-[#121418]/98 backdrop-blur-2xl rounded-xl shadow-2xl flex items-center gap-1.5 z-50 text-zinc-200 animate-in fade-in zoom-in-95 duration-100 border-0 pointer-events-auto"
            >
              {STICKY_NOTE_COLORS.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentNoteColor(c.color);
                    handleAddStickyNote(c.color);
                    setIsNotePopupOpen(false);
                  }}
                  style={{ backgroundColor: c.color }}
                  className={cn(
                    "size-6 rounded-md transition-transform cursor-pointer border border-black/20 hover:scale-120 shadow-sm",
                    currentNoteColor === c.color &&
                      "ring-2 ring-[#f5c344] ring-offset-1 ring-offset-[#121418] scale-110"
                  )}
                  title={`Note ${c.label}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* VÁCH NGĂN */}
        <div className={cn("w-[1px] h-5 mx-1 shrink-0", isLight ? "bg-zinc-200" : "bg-zinc-700/60")} />

        {/* 2. CỤM TIỆN ÍCH: TÌM KIẾM, SỔ TAY, ÂM THANH */}
        {/* NÚT TÌM KIẾM (KÍNH LÚP) */}
        <button
          ref={searchButtonRef}
          type="button"
          onClick={() => {
            setIsPenPopupOpen(false);
            setIsHighlighterPopupOpen(false);
            setIsEraserPopupOpen(false);
            setIsNotePopupOpen(false);
            setIsThemePopupOpen(false);
            setIsSearchOpen((prev) => {
              const next = !prev;
              if (next) {
                setTimeout(() => searchInputRef.current?.focus(), 80);
              }
              return next;
            });
          }}
          className={cn(
            "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0",
            isSearchOpen
              ? (isLight ? "bg-zinc-100 text-zinc-950 shadow-sm" : "bg-zinc-800 text-white shadow-sm")
              : (isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70")
          )}
          title="Tìm chữ trong toàn bộ hồ sơ vụ án (Ctrl+F)"
        >
          <Search className="size-4.5" />
        </button>

        {/* NÚT SỔ TAY THÁM TỬ */}
        <button
          type="button"
          onClick={() => {
            if (onOpenNotebook) {
              onOpenNotebook();
            } else {
              emitInvestigationEvent("OPEN_NOTEBOOK");
            }
          }}
          className={cn(
            "p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
          )}
          title="Ghi chép bàn hồ sơ"
        >
          <BookOpen className="size-4.5 text-amber-500 hover:text-amber-400 transition-colors" />
        </button>

        {/* NÚT TẬP TRUNG VÀO BẢNG ĐIỀU TRA TRÊN BÀN */}
        {renderInvestigationBoard && (
          <button
            type="button"
            onClick={() => {
              setIsPenPopupOpen(false);
              setIsHighlighterPopupOpen(false);
              setIsEraserPopupOpen(false);
              setIsNotePopupOpen(false);
              setIsThemePopupOpen(false);
              focusOnElement("board-investigation-canvas", 0.75);
            }}
            className={cn(
              "p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0",
              isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
            )}
            title="Đến vị trí Bảng điều tra trên bàn"
          >
            <SquareKanban className="size-4.5 text-amber-500 hover:text-amber-400 transition-colors" />
          </button>
        )}

        {/* NÚT BẬT / TẮT ÂM THANH */}
        <button
          type="button"
          onClick={handleToggleAudio}
          className={cn(
            "p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
          )}
          title={isAudioMuted ? "Bật âm thanh trinh thám" : "Tắt âm thanh trinh thám"}
        >
          {isAudioMuted ? (
            <VolumeX className="size-4.5 text-zinc-500" />
          ) : (
            <Volume2 className="size-4.5 text-amber-400" />
          )}
        </button>

        {/* VÁCH NGĂN */}
        <div className={cn("w-[1px] h-4 mx-0.5 shrink-0", isLight ? "bg-zinc-200" : "bg-zinc-700/60")} />

        {/* 3. CỤM THU PHÓNG ZOOM */}
        <button
          type="button"
          onClick={handleZoomOut}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
          )}
          title="Thu nhỏ (Zoom out • hoặc lăn chuột xuống)"
        >
          <Minus className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetZoom}
          className={cn(
            "px-2 py-0.5 font-sans text-xs font-semibold min-w-[42px] text-center cursor-pointer transition-colors shrink-0",
            isLight ? "text-zinc-800 hover:text-zinc-950 font-bold" : "text-zinc-300 hover:text-white"
          )}
          title="Đặt lại tỉ lệ chuẩn 80%"
        >
          {Math.round(zoomScale * 100)}%
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isLight ? "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
          )}
          title="Phóng to (Zoom in • hoặc lăn chuột lên)"
        >
          <Plus className="size-3.5" />
        </button>

        {/* NÚT CẨM NANG HƯỚNG DẪN BÀN HỒ SƠ */}
        <button
          type="button"
          onClick={() => emitInvestigationEvent("OPEN_CANVAS_GUIDE")}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isLight ? "text-zinc-500 hover:text-amber-600 hover:bg-zinc-100" : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/70"
          )}
          title="Cẩm nang hướng dẫn Bàn hồ sơ"
        >
          <HelpCircle className="size-3.5" />
        </button>

        {/* NÚT CHUYỂN ĐỔI GIAO DIỆN SÁNG / TỐI (LIGHT / DARK THEME) */}
        {onToggleUiTheme && (
          <button
            type="button"
            onClick={onToggleUiTheme}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0",
              isLight
                ? "text-amber-600 hover:text-amber-800 hover:bg-zinc-100"
                : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/70"
            )}
            title={isLight ? "Chuyển sang giao diện Tối (Dark)" : "Chuyển sang giao diện Sáng (Light)"}
          >
            {isLight ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          </button>
        )}

        {/* NÚT BẢNG MÀU MẶT BÀN HỒ SƠ */}
        <button
          type="button"
          onClick={() => setIsThemePopupOpen((prev) => !prev)}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0",
            isThemePopupOpen
              ? (isLight ? "bg-zinc-100 text-amber-700 font-bold" : "bg-zinc-800 text-amber-300 font-bold")
              : (isLight ? "text-zinc-500 hover:text-amber-600 hover:bg-zinc-100" : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/70")
          )}
          title="Tùy chọn màu mặt bàn hồ sơ"
        >
          <Palette className="size-3.5" />
        </button>

        {/* VÁCH NGĂN */}
        <div className={cn("w-[1px] h-4 mx-0.5 shrink-0", isLight ? "bg-zinc-200" : "bg-zinc-700/60")} />

        {/* 4. NÚT KẾT LUẬN */}
        <button
          type="button"
          onClick={() => {
            if (onOpenIndictment) {
              onOpenIndictment();
            } else {
              emitInvestigationEvent("OPEN_EPILOGUE");
            }
          }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 shrink-0",
            isLight
              ? "text-red-700 hover:text-red-800 hover:bg-red-100/70"
              : "text-red-400 hover:text-red-300 hover:bg-red-950/40"
          )}
          title="Kết luận vụ án & Đưa ra phán quyết"
        >
          <ClipboardCheck className="size-4 text-red-400" />
          <span className="tracking-wide">KẾT LUẬN</span>
        </button>
      </div>
  );
}
