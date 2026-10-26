"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  DbCase,
  DbCaseCheckpoint,
  DbCaseDossier,
  DbCaseCharacter,
  BoardConfig,
} from "@/lib/types/database";
import { lintCase } from "@/lib/checkpoints/case-linter";
import { launchPlaytestFromCheckpoint } from "@/lib/checkpoints/case-playtest";
import { CaseLintModal } from "./case-lint-modal";
import {
  createEmptyDraft,
  toDraft,
  type CheckpointStudioDraft,
} from "@/lib/types/checkpoint-studio";
import {
  deleteCheckpoint,
  getCheckpointsByCase,
  saveCheckpoint,
} from "@/lib/actions/checkpoint-actions";
import { updateCheckpointBoardConfig } from "@/lib/actions/board-actions";
import { getCharactersByCase } from "@/lib/actions/character-actions";
import {
  getCaseDossiers,
  getAllCaseDocumentsCatalog,
  type AvailableDocumentItem,
} from "@/lib/actions/dossier-config-actions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { CheckpointListSidebar } from "./checkpoint-list-sidebar";
import { CheckpointEditor } from "./checkpoint-editor";
import { OffBoardTray } from "./off-board-tray";
import { HeroInteractive } from "@/components/investigation/hero-interactive";
import { useBoardEditor } from "./board/use-board-editor";
import { BoardNodeForm } from "./board/board-node-form";
import { Button } from "@/components/ui/button";
import {
  Undo2,
  Redo2,
  Save,
  Plus,
  Play,
  RotateCcw,
  RotateCw,
  Minus,
  Sparkles,
  Layers,
} from "lucide-react";

interface CheckpointStudioClientProps {
  initialCaseId?: string;
  initialCases?: DbCase[];
  initialRows?: DbCaseCheckpoint[];
  initialDossiers?: DbCaseDossier[];
  initialAvailableDocuments?: AvailableDocumentItem[];
  initialCharacters?: DbCaseCharacter[];
  initialView?: "flow" | "board";
}

export function CheckpointStudioClient({
  initialCaseId = "case_000",
  initialCases = [],
  initialRows = [],
  initialDossiers = [],
  initialAvailableDocuments = [],
  initialCharacters = [],
  initialView = "flow",
}: CheckpointStudioClientProps) {
  const [caseId, setCaseId] = useState(initialCaseId);
  const [activeView, setActiveView] = useState<"flow" | "board">(initialView);

  // Giữ vụ án và view đang chọn trên URL (?case=...&view=...) để tương thích ngược 100% với URL query cũ
  useEffect(() => {
    const url = new URL(window.location.href);
    let changed = false;
    if (url.searchParams.get("case") !== caseId) {
      url.searchParams.set("case", caseId);
      changed = true;
    }
    if (activeView === "board") {
      if (url.searchParams.get("view") !== "board") {
        url.searchParams.set("view", "board");
        changed = true;
      }
    } else {
      if (url.searchParams.has("view")) {
        url.searchParams.delete("view");
        changed = true;
      }
    }
    if (changed) {
      window.history.replaceState(null, "", url);
    }
  }, [caseId, activeView]);

  const [sidebarWidth, setSidebarWidth] = useState<number>(420);
  useEffect(() => {
    const saved = Number(
      localStorage.getItem("checkpoint_studio_sidebar_width"),
    );
    if (saved) setSidebarWidth(Math.max(320, Math.min(800, saved)));
  }, []);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 320 && newWidth <= 900) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      try {
        localStorage.setItem(
          "checkpoint_studio_sidebar_width",
          String(sidebarWidth),
        );
      } catch {}
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  const router = useRouter();
  const [allCases, setAllCases] = useState<DbCase[]>(initialCases);
  const [rows, setRows] = useState<DbCaseCheckpoint[]>(initialRows);
  const [dossiers, setDossiers] = useState<DbCaseDossier[]>(initialDossiers);
  const [availableDocs, setAvailableDocs] = useState<AvailableDocumentItem[]>(
    initialAvailableDocuments,
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialRows[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<CheckpointStudioDraft | null>(
    initialRows[0] ? toDraft(initialRows[0]) : null,
  );
  const [baseline, setBaseline] = useState<string>(
    initialRows[0] ? JSON.stringify(toDraft(initialRows[0])) : "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState<DbCaseCharacter[]>(initialCharacters);
  const [isLintModalOpen, setIsLintModalOpen] = useState(false);
  const [isCreatingCustomNode, setIsCreatingCustomNode] = useState(false);

  // Hook Board Editor thống nhất
  const {
    isLoading: isBoardLoading,
    isSaving: isBoardSaving,
    hasUnsavedChanges: boardHasUnsavedChanges,
    displayPins,
    connections,
    selectedNodeId,
    selectedNode,
    setSelectedNodeId,
    refreshBoardModel,
    handlePositionChange,
    handleConnectPins,
    handleDeleteConnection,
    handleSaveNode,
    handleDeleteNode,
    handleSaveAll: handleSaveBoardLayout,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleAdjustNodeTransform,
  } = useBoardEditor(caseId, { checkpoints: rows, characters });

  useEffect(() => {
    let cancelled = false;
    getCharactersByCase(caseId)
      .then((res) => {
        if (!cancelled && res.success && res.data) {
          setCharacters(res.data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const lintResult = useMemo(() => {
    return lintCase({
      checkpoints: rows,
      characters,
      availableEvidenceCodes: availableDocs.map((d) => d.code),
    });
  }, [rows, characters, availableDocs]);

  const handlePlaytest = (checkpointId?: string) => {
    const targetCp = checkpointId
      ? rows.find((r) => r.checkpoint_id === checkpointId)
      : rows[0];
    if (targetCp) {
      launchPlaytestFromCheckpoint({
        caseId,
        targetCheckpoint: targetCp,
        allCheckpoints: rows,
      });
      toast.success("Đang mở màn chơi thử nghiệm");
    } else {
      window.open(`/evidence/web?case_id=${caseId}`, "_blank");
    }
  };

  const formDirty = useMemo(
    () => (draft ? JSON.stringify(draft) !== baseline : false),
    [draft, baseline],
  );

  const hasUnsaved = formDirty || boardHasUnsavedChanges;

  useEffect(() => {
    if (!hasUnsaved) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  const caseOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of allCases) {
      map.set(item.slug, item.title);
    }
    if (!map.has(caseId)) {
      const currentCase = allCases.find((c) => c.slug === caseId);
      map.set(caseId, currentCase?.title || caseId);
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [allCases, caseId]);

  const confirmDiscardForm = useCallback(() => {
    if (!formDirty) return true;
    return window.confirm(
      "Checkpoint có thay đổi chưa lưu. Bỏ các thay đổi này?",
    );
  }, [formDirty]);

  const confirmDiscardAll = useCallback(() => {
    if (!hasUnsaved) return true;
    return window.confirm(
      "Có thay đổi chưa lưu ở checkpoint hoặc bố cục bảng. Bỏ tất cả thay đổi này?",
    );
  }, [hasUnsaved]);

  const loadCase = useCallback(async (nextCaseId: string) => {
    setIsLoading(true);
    try {
      const [cpRes, dossierList, docsList, charsRes] = await Promise.all([
        getCheckpointsByCase(nextCaseId),
        getCaseDossiers(nextCaseId),
        getAllCaseDocumentsCatalog(nextCaseId),
        getCharactersByCase(nextCaseId),
      ]);
      if (!cpRes.success) {
        toast.error(cpRes.error);
        return;
      }
      setRows(cpRes.data);
      setDossiers(dossierList);
      setAvailableDocs(docsList);
      if (charsRes.success && charsRes.data) {
        setCharacters(charsRes.data);
      }
      const first = cpRes.data[0] ?? null;
      setSelectedId(first?.id ?? null);
      const nextDraft = first ? toDraft(first) : null;
      setDraft(nextDraft);
      setBaseline(nextDraft ? JSON.stringify(nextDraft) : "");
      setSelectedNodeId(null);
    } finally {
      setIsLoading(false);
    }
  }, [setSelectedNodeId]);

  const selectRow = (row: DbCaseCheckpoint): boolean => {
    if (row.id === selectedId && draft) return true;
    if (!confirmDiscardForm()) return false;
    const nextDraft = toDraft(row);
    setSelectedId(row.id);
    setDraft(nextDraft);
    setBaseline(JSON.stringify(nextDraft));
    return true;
  };

  const createRow = () => {
    if (!confirmDiscardForm()) return;
    const nextDraft = createEmptyDraft(caseId);
    setSelectedId(null);
    setSelectedNodeId(null);
    setDraft(nextDraft);
    setBaseline(JSON.stringify(nextDraft));
  };

  const changeCase = async (nextCaseId: string) => {
    if (nextCaseId === caseId) return;
    if (!confirmDiscardAll()) return;
    setCaseId(nextCaseId);
    setSelectedId(null);
    setDraft(null);
    setBaseline("");
    setSelectedNodeId(null);
    await loadCase(nextCaseId);
  };

  const updateDraft = (patch: Partial<CheckpointStudioDraft>) => {
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };

      // Cập nhật live vào rows ngay lập tức để Canvas phản ánh theo thời gian thực (0s độ trễ)
      setRows((prevRows) => {
        const selectedDossier =
          patch.unlocksDossier !== undefined
            ? patch.unlocksDossier.trim()
            : next.unlocksDossier
              ? next.unlocksDossier.trim()
              : "";

        return prevRows.map((r) => {
          const isTarget =
            (current.id && r.id === current.id) ||
            r.checkpoint_id === current.checkpointId;

          if (isTarget) {
            return {
              ...r,
              title: next.title,
              type: next.type,
              kind: next.kind,
              subject_key: next.subjectKey || null,
              question: next.question,
              board_config: next.boardConfig || r.board_config,
              answer_config: {
                ...(r.answer_config as Record<string, unknown>),
                ...next.answerConfig,
                ...(patch.unlocksDossier !== undefined
                  ? { unlocksDossier: patch.unlocksDossier }
                  : {}),
              },
            };
          }

          const rConfig = r.answer_config as Record<string, unknown> | null;
          if (
            selectedDossier &&
            typeof rConfig?.unlocksDossier === "string" &&
            rConfig.unlocksDossier.trim() === selectedDossier
          ) {
            return {
              ...r,
              answer_config: {
                ...(r.answer_config as Record<string, unknown>),
                unlocksDossier: "",
              },
            };
          }

          return r;
        });
      });

      return next;
    });
  };

  const handleSave = async () => {
    if (!draft) return;
    const effectiveTitle =
      draft.title.trim() || (draft.kind === "epilogue" ? "Hậu án" : "");
    if (!effectiveTitle) {
      toast.error("Nhập tiêu đề checkpoint trước khi lưu.");
      return;
    }
    const draftToSave = draft.title.trim()
      ? draft
      : { ...draft, title: effectiveTitle };

    setIsSaving(true);
    try {
      const result = await saveCheckpoint(draftToSave);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const saved = result.data;
      setRows((current) => {
        const exists = current.some((row) => row.id === saved.id);
        const next = exists
          ? current.map((row) => (row.id === saved.id ? saved : row))
          : [...current, saved];
        return next.sort((a, b) =>
          a.checkpoint_id.localeCompare(b.checkpoint_id),
        );
      });

      const nextDraft = toDraft(saved);
      setSelectedId(saved.id);
      setDraft(nextDraft);
      setBaseline(JSON.stringify(nextDraft));
      toast.success("Đã lưu checkpoint.");
      await refreshBoardModel();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không lưu được checkpoint.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!draft?.id) return;
    if (
      !window.confirm(
        `Xóa checkpoint "${draft.title || draft.checkpointId}"? Thao tác này không thể hoàn tác.`,
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await deleteCheckpoint(draft.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const deletedCheckpointId = draft.checkpointId;
      const remaining = rows
        .filter((row) => row.id !== draft.id)
        .map((row) => ({
          ...row,
          depends_on: (row.depends_on || []).filter(
            (dependency) => dependency !== deletedCheckpointId,
          ),
        }));
      setRows(remaining);
      const first = remaining[0] ?? null;
      const nextDraft = first ? toDraft(first) : null;
      setSelectedId(first?.id ?? null);
      setDraft(nextDraft);
      setBaseline(nextDraft ? JSON.stringify(nextDraft) : "");
      toast.success("Đã xóa checkpoint.");
      await refreshBoardModel();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không xóa được checkpoint.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectPinOnBoard = (pinId: string | null) => {
    setSelectedNodeId(pinId);
    if (!pinId) return;

    const pin = displayPins.find((p) => p.id === pinId);
    if (!pin) return;

    // 1. Nếu pin có checkpointId
    if (pin.checkpointId) {
      const cp = rows.find(
        (r) => r.id === pin.checkpointId || r.checkpoint_id === pin.checkpointId,
      );
      if (cp) {
        selectRow(cp);
        return;
      }
    }

    // 2. Tìm theo nodeKind đặc thù của checkpoint
    if (pin.nodeKind === "phone_lookup") {
      const cp = rows.find((r) => r.kind === "phone_lookup");
      if (cp) {
        selectRow(cp);
        return;
      }
    }

    if (pin.nodeKind === "suspect" && pin.subjectKey) {
      const cp = rows.find(
        (r) => r.kind === "suspect_interrogation" && r.subject_key === pin.subjectKey,
      );
      if (cp) {
        selectRow(cp);
        return;
      }
    }

    if (pin.nodeKind === "followup") {
      const cp = rows.find((r) => r.kind === "followup");
      if (cp) {
        selectRow(cp);
        return;
      }
    }

    if (pin.nodeKind === "indictment") {
      const cp = rows.find((r) => r.kind === "indictment");
      if (cp) {
        selectRow(cp);
        return;
      }
    }

    // 3. Nếu là custom node (không gắn checkpoint)
    if (pin.id.includes(":custom:") || pin.nodeKind === "custom") {
      setDraft(null);
      setSelectedId(null);
    }
  };

  const handleCreateNewCustomNode = async () => {
    if (isLoading || isBoardLoading || isCreatingCustomNode) return;
    setIsCreatingCustomNode(true);
    try {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const newId = `${caseId}:custom:node_${randomSuffix}`;
      const draftNode = {
        id: newId,
        caseId,
        nodeKind: "custom" as const,
        title: "Ghim mới",
        config: {
          pin_title: "Ghim mới",
          position: {
            desktop: { x: 0.5, y: 0.5 },
            mobile: { x: 0.5, y: 0.5 },
          },
        },
      };
      const ok = await handleSaveNode(draftNode);
      if (ok) {
        setSelectedId(null);
        setDraft(null);
        setSelectedNodeId(newId);
      }
    } finally {
      setIsCreatingCustomNode(false);
    }
  };

  const handleMoveToBoard = async (checkpointId: string) => {
    const cp = rows.find(
      (r) => r.id === checkpointId || r.checkpoint_id === checkpointId,
    );
    if (!cp) return;

    const nextBoardConfig: BoardConfig = {
      ...((cp.board_config as BoardConfig) || {}),
      hidden: false,
    };

    const res = await updateCheckpointBoardConfig(cp.id, nextBoardConfig);
    if (res.success) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === cp.id ? { ...r, board_config: nextBoardConfig } : r,
        ),
      );
      if (draft && draft.id === cp.id) {
        setDraft((d) => (d ? { ...d, boardConfig: nextBoardConfig } : d));
      }
      toast.success(`Đã đưa "${cp.title || cp.checkpoint_id}" lên bảng điều tra.`);
      await refreshBoardModel();
    } else {
      toast.error(res.error || "Lỗi khi đưa checkpoint lên bảng.");
    }
  };

  const isEditingCustomNode = Boolean(
    selectedNode &&
      !("checkpoint_id" in selectedNode && selectedNode.checkpoint_id) &&
      selectedNode.id.includes(":custom:"),
  );

  return (
    <div
      data-studio-ready={isSaving || isBoardSaving ? "false" : "true"}
      className="flex h-full min-h-0 w-full flex-col bg-[#0c0d12]"
    >
      {/* 1. Header Toolbar của Checkpoint Studio & Board Studio gộp */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#090a0f] px-3 z-30">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-amber-400" />
          <span className="text-xs font-bold text-zinc-100 tracking-wide uppercase">
            Checkpoint Studio
          </span>
          <span className="hidden sm:inline-block text-[11px] font-semibold text-zinc-400">
            • Bảng điều tra (Board Studio)
          </span>

          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            {displayPins.length} nodes
          </span>

          {hasUnsaved && (
            <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              Chưa lưu
            </span>
          )}
        </div>

        {/* Thanh công cụ giữa & phải */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Chuyển nhanh param ?view=... phục vụ kiểm thử E2E */}
          <div className="flex items-center gap-1 bg-black/40 rounded border border-white/5 p-0.5 mr-1">
            <button
              type="button"
              onClick={() => setActiveView("flow")}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                activeView === "flow"
                  ? "bg-white/15 text-white"
                  : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              Sơ đồ luồng (Flow)
            </button>
            <button
              type="button"
              onClick={() => setActiveView("board")}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                activeView === "board"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              Bảng điều tra (Board)
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Hoàn tác (Ctrl+Z)"
            className="size-7 p-0 text-zinc-400 hover:text-white"
          >
            <Undo2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Làm lại (Ctrl+Shift+Z)"
            className="size-7 p-0 text-zinc-400 hover:text-white"
          >
            <Redo2 className="size-3.5" />
          </Button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Nút Tạo Checkpoint Mới */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={createRow}
            disabled={isSaving}
            className="gap-1 text-xs border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 h-7 px-2.5"
          >
            <Plus className="size-3.5 text-amber-400" />
            + Checkpoint
          </Button>

          {/* Nút Thêm Node Custom Ghim */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCreateNewCustomNode}
            disabled={isLoading || isCreatingCustomNode}
            className="gap-1 text-xs border-white/10 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 h-7 px-2.5"
          >
            <Plus className="size-3.5 text-zinc-300" />
            Thêm Node
          </Button>

          {/* Nút Lưu Bố Cục Bảng */}
          <Button
            type="button"
            size="sm"
            onClick={handleSaveBoardLayout}
            disabled={isBoardSaving || !boardHasUnsavedChanges}
            className="gap-1 text-xs bg-amber-500 text-black font-semibold hover:bg-amber-600 disabled:opacity-50 h-7 px-2.5"
          >
            <Save className="size-3.5" />
            {isBoardSaving ? "Đang lưu..." : "Lưu Bố Cục"}
          </Button>

          {/* Nút Chơi Thử */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePlaytest(draft?.checkpointId)}
            className="gap-1 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30 h-7 px-2.5"
          >
            <Play className="size-3.5 fill-current" />
            Chơi Thử
          </Button>

          {/* Nút Linter Vụ Án */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsLintModalOpen(true)}
            className={cn(
              "gap-1 text-xs h-7 px-2",
              lintResult.errorCount > 0
                ? "text-rose-400 bg-rose-950/20"
                : "text-zinc-400 hover:text-zinc-200",
            )}
            title="Kiểm tra logic vụ án (Case Linter)"
          >
            <Sparkles className="size-3.5" />
            <span>Linter</span>
            {lintResult.errorCount > 0 && (
              <span className="rounded bg-rose-500/30 px-1 text-[10px] text-rose-300 font-mono">
                {lintResult.errorCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* 2. Main Workspace: Canvas Bảng Điều Tra + Inspector */}
      <div className="flex flex-1 min-h-0 w-full flex-col md:flex-row overflow-hidden relative">
        {/* Khung Canvas Bảng Điều Tra ở giữa */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col relative h-full">
          {/* Thanh công cụ Quick Transform nổi trên Canvas */}
          {selectedNode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-[#16120e]/95 backdrop-blur-md rounded-lg border border-amber-500/50 shadow-2xl font-mono text-xs select-none">
              <span className="text-amber-200/90 font-bold max-w-[140px] truncate pr-1">
                {("title" in selectedNode ? selectedNode.title : ("label" in selectedNode ? selectedNode.label : "")) || "Ghim"}
              </span>

              <div className="h-4 w-px bg-white/15 mx-0.5" />

              <button
                type="button"
                onClick={() => handleAdjustNodeTransform(selectedNode.id, -2, 0)}
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Xoay nghiêng trái (-2°)"
              >
                <RotateCcw className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleAdjustNodeTransform(selectedNode.id, 2, 0)}
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Xoay nghiêng phải (+2°)"
              >
                <RotateCw className="size-3.5" />
              </button>

              <div className="h-4 w-px bg-white/15 mx-0.5" />

              <button
                type="button"
                onClick={() => handleAdjustNodeTransform(selectedNode.id, 0, -0.1)}
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Thu nhỏ (-0.1x)"
              >
                <Minus className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleAdjustNodeTransform(selectedNode.id, 0, 0.1)}
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Phóng to (+0.1x)"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          )}

          {/* Canvas chính */}
          <div className="flex-1 h-full min-h-0 relative">
            <HeroInteractive
              className="w-full h-full"
              controlledCaseId={caseId}
              customPins={displayPins}
              customConnections={connections}
              isEditMode={true}
              selectedPinId={selectedNodeId}
              onSelectPin={handleSelectPinOnBoard}
              onPinClick={handleSelectPinOnBoard}
              onPinPositionChange={handlePositionChange}
              onConnectPins={handleConnectPins}
              onDeleteConnection={handleDeleteConnection}
            />
          </div>

          {/* Khay "Ngoài bảng" (Off-board Tray) ở đáy canvas */}
          <OffBoardTray
            checkpoints={rows}
            dossiers={dossiers}
            selectedCheckpointId={selectedId}
            onSelectCheckpoint={(cp) => {
              selectRow(cp);
              setSelectedNodeId(null);
            }}
            onSelectDossier={() => {
              router.push(`/studio/dossier?case=${encodeURIComponent(caseId)}`);
            }}
            onMoveToBoard={handleMoveToBoard}
          />
        </div>

        {/* Đường viền kéo dãn độ rộng sidebar bên phải */}
        <div
          onMouseDown={startResizing}
          className={cn(
            "hidden md:block relative z-30 w-1 -mr-0.5 cursor-col-resize select-none shrink-0 bg-white/10 transition-colors hover:bg-amber-400 active:bg-amber-500",
            isResizing && "bg-amber-500",
          )}
          title="Kéo sang trái/phải để điều chỉnh độ rộng"
        />

        {/* Hộp biên tập Inspector bên phải */}
        <div
          style={{ width: `${sidebarWidth}px` }}
          className={cn(
            "flex h-[55%] min-h-0 shrink-0 flex-col md:h-full max-w-[85vw]",
            !isResizing && "transition-[width] duration-75 ease-out",
          )}
        >
          {isEditingCustomNode && selectedNode ? (
            <BoardNodeForm
              caseId={caseId}
              node={selectedNode}
              onSave={handleSaveNode}
              onDelete={handleDeleteNode}
              onClose={() => setSelectedNodeId(null)}
            />
          ) : (
            <CheckpointListSidebar onCreate={createRow} isLoading={isLoading}>
              {draft ? (
                <CheckpointEditor
                  draft={draft}
                  dossiers={dossiers}
                  characters={characters}
                  checkpoints={rows}
                  onChange={updateDraft}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onPlaytest={() => handlePlaytest(draft.checkpointId)}
                  isSaving={isSaving}
                  isDirty={formDirty}
                />
              ) : null}
            </CheckpointListSidebar>
          )}
        </div>
      </div>

      {/* Modal Case Linter */}
      <CaseLintModal
        isOpen={isLintModalOpen}
        onClose={() => setIsLintModalOpen(false)}
        result={lintResult}
        onSelectCheckpoint={(cpId) => {
          const row = rows.find((r) => r.checkpoint_id === cpId);
          if (row) selectRow(row);
        }}
      />
    </div>
  );
}
