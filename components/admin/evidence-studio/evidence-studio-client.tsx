"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  RotateCcw,
  FileText,
  Image as ImageIcon,
  Volume2,
  Package,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type {
  DbCase,
  DbCaseEvidence,
  DbCaseWithEvidenceConfig,
} from "@/lib/types/database";
import { EvidenceForm } from "./evidence-form";
import { EvidencePreview } from "./evidence-preview";
import { Scene360ConfigModal } from "./scene-360-config-modal";
import { Scene360Viewer } from "@/components/investigation/scene-360-viewer";
import { cn } from "@/lib/utils";
import { getCaseEvidence } from "@/lib/actions/evidence-actions";
import { toast } from "@/components/ui/toast";

interface EvidenceStudioClientProps {
  initialCaseId: string;
  initialCases: DbCase[];
  initialEvidence: DbCaseEvidence[];
  initial360Config: DbCaseWithEvidenceConfig | null;
}

export function EvidenceStudioClient({
  initialCaseId,
  initialCases,
  initialEvidence,
  initial360Config,
}: EvidenceStudioClientProps) {
  const router = useRouter();

  const [currentCaseId, setCurrentCaseId] = useState(initialCaseId);
  const [evidenceList, setEvidenceList] =
    useState<DbCaseEvidence[]>(initialEvidence);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialEvidence.length > 0 ? initialEvidence[0].id : null,
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);
  const [config360, setConfig360] = useState(initial360Config);
  const [previewTab, setPreviewTab] = useState<"card" | "scene360">("card");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Switch case
  const handleCaseChange = (newCaseSlug: string) => {
    setCurrentCaseId(newCaseSlug);
    router.push(`/studio/evidence?case=${encodeURIComponent(newCaseSlug)}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await getCaseEvidence(currentCaseId);
      if (res.success && res.data) {
        setEvidenceList(res.data);
        if (res.data.length > 0 && !selectedId) {
          setSelectedId(res.data[0].id);
        }
        toast.success("Đã làm mới danh sách chứng cứ");
      }
    } catch {
      toast.error("Lỗi khi làm mới");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered evidence items
  const filteredItems = useMemo(() => {
    return evidenceList.filter((item) => {
      // Kind filter
      if (kindFilter !== "all" && item.kind !== kindFilter) {
        if (!(kindFilter === "photo" && item.kind === "image")) return false;
      }
      // Phase filter
      if (phaseFilter !== "all" && item.phase !== Number(phaseFilter)) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = item.code.toLowerCase().includes(q);
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = (item.description || "").toLowerCase().includes(q);
        return codeMatch || titleMatch || descMatch;
      }
      return true;
    });
  }, [evidenceList, kindFilter, phaseFilter, searchQuery]);

  // Selected item
  const selectedEvidence = useMemo(() => {
    if (isCreatingNew) {
      return {
        case_slug: currentCaseId,
        code: "",
        title: "",
        kind: "photo" as const,
        phase: 0,
        slot_index: (evidenceList.length + 1) * 10,
        description: "",
        metadata: {
          recoveredBy: "ĐIỀU TRA VIÊN",
          chainOfCustody: "VERIFIED",
          integrityStatus: "secured",
          timestamp: "20:00",
        },
      };
    }
    return evidenceList.find((e) => e.id === selectedId) || null;
  }, [isCreatingNew, evidenceList, selectedId, currentCaseId]);

  const handleSaveEvidence = (saved: DbCaseEvidence) => {
    setEvidenceList((prev) => {
      const idx = prev.findIndex(
        (e) =>
          e.id === saved.id ||
          (e.case_slug === saved.case_slug && e.code === saved.code),
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
    setSelectedId(saved.id);
    setIsCreatingNew(false);
  };

  const handleDeleteEvidence = (deletedId: string) => {
    setEvidenceList((prev) => prev.filter((e) => e.id !== deletedId));
    setSelectedId((prev) => (prev === deletedId ? null : prev));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* ── TOP HEADER / TOOLBAR ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400">
              <Archive className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-wide text-zinc-100">
                  Evidence Studio
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                  M1 / M2 / M3 / M10 / M12
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Quản lý hồ sơ chứng cứ, tài liệu PDF, vật chứng ảnh hiện trường
                và ảnh 360
              </p>
            </div>
          </div>

          {/* Case Selector Dropdown */}
          <div className="relative ml-4">
            <select
              value={currentCaseId}
              onChange={(e) => handleCaseChange(e.target.value)}
              className="appearance-none bg-zinc-900 border border-zinc-700 hover:border-amber-500/60 text-zinc-200 text-xs rounded-lg pl-3 pr-8 py-1.5 font-mono focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
            >
              {initialCases.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.slug}: {c.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Làm mới dữ liệu từ Supabase"
          >
            <RefreshCw
              className={cn("size-3.5", isRefreshing && "animate-spin")}
            />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => setIs360ModalOpen(true)}
            className="px-3 py-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="size-3.5" />
            <span>Cấu hình Hiện Trường 360</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsCreatingNew(true);
              setSelectedId(null);
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-950/50 transition-colors"
          >
            <Plus className="size-3.5" />
            <span>Thêm Chứng Cứ</span>
          </button>
        </div>
      </div>

      {/* ── 3-COLUMN WORKSPACE LAYOUT ── */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* CỘT 1: DANH SÁCH CHỨNG CỨ & BỘ LỌC (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 border-r border-zinc-800 flex flex-col bg-zinc-950/70 overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-zinc-800/80 space-y-2.5 bg-zinc-900/20">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo mã, tên chứng cứ..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Filter Chips: Kind */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: "all", label: "Tất cả" },
                { id: "photo", label: "Ảnh", icon: ImageIcon },
                { id: "pdf", label: "PDF", icon: FileText },
                { id: "audio", label: "Audio", icon: Volume2 },
                { id: "object", label: "Vật phẩm", icon: Package },
              ].map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKindFilter(k.id)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-colors",
                    kindFilter === k.id
                      ? "bg-amber-950/70 text-amber-300 border border-amber-800/60 font-semibold"
                      : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-transparent",
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>

            {/* Filter Chips: Phase */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">
                Phase:
              </span>
              {[
                { id: "all", label: "All" },
                { id: "0", label: "P0" },
                { id: "1", label: "P1" },
                { id: "2", label: "P2" },
                { id: "3", label: "P3" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPhaseFilter(p.id)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-mono transition-colors",
                    phaseFilter === p.id
                      ? "bg-zinc-800 text-amber-400 border border-zinc-700 font-semibold"
                      : "text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  {p.label}
                </button>
              ))}
              <span className="ml-auto text-[11px] font-mono text-zinc-500">
                {filteredItems.length} mục
              </span>
            </div>
          </div>

          {/* List of Evidence Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-xs">
                Không tìm thấy chứng cứ nào phù hợp bộ lọc.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = !isCreatingNew && selectedId === item.id;
                const kind = item.kind;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      setIsCreatingNew(false);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 group",
                      isSelected
                        ? "bg-amber-950/20 border-amber-600/80 shadow-md shadow-amber-950/20"
                        : "bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700",
                    )}
                  >
                    {/* Kind Icon Badge */}
                    <div
                      className={cn(
                        "p-2 rounded mt-0.5 shrink-0",
                        kind === "pdf" &&
                          "bg-rose-950/60 text-rose-400 border border-rose-900/50",
                        (kind === "photo" || kind === "image") &&
                          "bg-sky-950/60 text-sky-400 border border-sky-900/50",
                        kind === "audio" &&
                          "bg-emerald-950/60 text-emerald-400 border border-emerald-900/50",
                        kind === "object" &&
                          "bg-amber-950/60 text-amber-400 border border-amber-900/50",
                      )}
                    >
                      {kind === "pdf" && <FileText className="size-4" />}
                      {(kind === "photo" || kind === "image") && (
                        <ImageIcon className="size-4" />
                      )}
                      {kind === "audio" && <Volume2 className="size-4" />}
                      {kind === "object" && <Package className="size-4" />}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-mono font-bold text-amber-400 truncate">
                          #{item.code}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                          <span className="bg-zinc-800/80 px-1.5 py-0.5 rounded">
                            P{item.phase}
                          </span>
                          <span className="bg-zinc-800/80 px-1.5 py-0.5 rounded">
                            S{item.slot_index}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-200 font-medium truncate group-hover:text-amber-100 transition-colors">
                        {item.title}
                      </p>

                      {item.description && (
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT 2: FORM BIÊN SOẠN CHỨNG CỨ (4 hoặc 5 Cols) */}
        <div className="col-span-12 lg:col-span-4 border-r border-zinc-800 p-5 overflow-y-auto bg-zinc-950">
          <EvidenceForm
            caseId={currentCaseId}
            evidence={selectedEvidence}
            onSave={handleSaveEvidence}
            onDelete={handleDeleteEvidence}
            onCancel={isCreatingNew ? () => setIsCreatingNew(false) : undefined}
          />
        </div>

        {/* CỘT 3: LIVE PREVIEW SIMULATOR (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 p-5 flex flex-col overflow-hidden bg-zinc-950/50">
          {/* Preview Tabs */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
            <h4 className="text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
              Bản Mô Phỏng Thực Tế (Live Preview)
            </h4>

            <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setPreviewTab("card")}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-mono rounded transition-colors",
                  previewTab === "card"
                    ? "bg-amber-950/80 text-amber-300 font-medium border border-amber-800/60"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                Hồ sơ tang vật
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("scene360")}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-mono rounded transition-colors",
                  previewTab === "scene360"
                    ? "bg-amber-950/80 text-amber-300 font-medium border border-amber-800/60"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                Hiện trường 360
              </button>
            </div>
          </div>

          {/* Preview Content Area */}
          <div className="flex-1 overflow-hidden">
            {previewTab === "card" ? (
              <EvidencePreview evidence={selectedEvidence} />
            ) : (
              <div className="h-full rounded-xl overflow-hidden border border-zinc-800 relative bg-black">
                <Scene360Viewer
                  imageUrl={config360?.scene_360_url || undefined}
                  fallbackImageUrl={config360?.panorama_url || undefined}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL CẤU HÌNH HIỆN TRƯỜNG 360 ── */}
      <Scene360ConfigModal
        caseId={currentCaseId}
        initialConfig={config360}
        isOpen={is360ModalOpen}
        onClose={() => setIs360ModalOpen(false)}
        onSave={(newCfg) =>
          setConfig360((prev) =>
            prev ? { ...prev, ...newCfg } : (newCfg as any),
          )
        }
      />
    </div>
  );
}
