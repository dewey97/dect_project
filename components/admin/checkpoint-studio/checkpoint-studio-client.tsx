"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  DbCase,
  DbCaseCheckpoint,
  DbCaseDossier,
  DbCaseCharacter,
} from "@/lib/types/database";
import { lintCase } from "@/lib/checkpoints/case-linter";
import { launchPlaytestFromCheckpoint } from "@/lib/checkpoints/case-playtest";
import { CaseLintModal } from "./case-lint-modal";
import {
  createEmptyDraft,
  toDraft,
  type CheckpointDependencyUpdate,
  type CheckpointFlowPosition,
  type CheckpointPositionUpdate,
  type CheckpointStudioDraft,
} from "@/lib/types/checkpoint-studio";
import {
  deleteCheckpoint,
  getCheckpointsByCase,
  saveCheckpoint,
  updateCheckpointDependencies,
  updateCheckpointPositions,
} from "@/lib/actions/checkpoint-actions";
import { getCharactersByCase } from "@/lib/actions/character-actions";
import { slugifyVietnamese } from "@/lib/text";
import {
  getCaseDossiers,
  getAllCaseDocumentsCatalog,
  type AvailableDocumentItem,
} from "@/lib/actions/dossier-config-actions";
import {
  buildDependencyEdges,
  suggestDependencyEdges,
  wouldCreateCycle,
  type CheckpointGraphEdge,
} from "@/lib/cms/checkpoint-graph";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { CheckpointListSidebar } from "./checkpoint-list-sidebar";
import { CheckpointEditor } from "./checkpoint-editor";
import { CheckpointFlowView } from "./checkpoint-flow-view";
import { BoardEditor } from "./board/board-editor";

/** Mỗi lần click danh sách tăng nonce để Flow căn lại node, kể cả node đang chọn. */
interface NodeFocusRequest {
  checkpointId: string;
  nonce: number;
}

function edgeKey(edge: CheckpointGraphEdge): string {
  return `${edge.source}->${edge.target}`;
}

function edgeSignature(edges: CheckpointGraphEdge[]): string {
  return edges.map(edgeKey).sort().join("|");
}

function depsFor(checkpointId: string, edges: CheckpointGraphEdge[]): string[] {
  return edges
    .filter((edge) => edge.target === checkpointId)
    .map((edge) => edge.source)
    .sort();
}

function sameList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

interface CheckpointStudioClientProps {
  initialCaseId?: string;
  initialCases?: DbCase[];
  initialRows?: DbCaseCheckpoint[];
  initialDossiers?: DbCaseDossier[];
  initialAvailableDocuments?: AvailableDocumentItem[];
  initialCharacters?: DbCaseCharacter[];
}

export function CheckpointStudioClient({
  initialCaseId = "case_000",
  initialCases = [],
  initialRows = [],
  initialDossiers = [],
  initialAvailableDocuments = [],
  initialCharacters = [],
}: CheckpointStudioClientProps) {
  const [caseId, setCaseId] = useState(initialCaseId);
  const [activeView, setActiveView] = useState<"flow" | "board">(() => {
    if (typeof window !== "undefined") {
      const v = new URLSearchParams(window.location.search).get("view");
      if (v === "board") return "board";
    }
    return "flow";
  });

  // Giữ vụ án và view đang chọn trên URL (?case=...&view=...) để tải lại trang không mất view.
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
  // Đọc độ rộng đã lưu sau khi mount để HTML server và client khớp nhau.
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
      // Sidebar nằm ở bên phải màn hình
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
  const [isSavingDependencies, setIsSavingDependencies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusRequest, setFocusRequest] = useState<NodeFocusRequest | null>(
    null,
  );
  const [pendingEdges, setPendingEdges] = useState<CheckpointGraphEdge[]>(() =>
    buildDependencyEdges(initialRows),
  );
  const [pendingPositions, setPendingPositions] = useState<
    Record<string, CheckpointFlowPosition>
  >({});
  const [characters, setCharacters] = useState<DbCaseCharacter[]>(initialCharacters);
  const [isLintModalOpen, setIsLintModalOpen] = useState(false);

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

  const handlePlaytest = (checkpointId: string) => {
    const targetCp = rows.find((r) => r.checkpoint_id === checkpointId);
    if (!targetCp) return;
    launchPlaytestFromCheckpoint({
      caseId,
      targetCheckpoint: targetCp,
      allCheckpoints: rows,
    });
    toast.success(`Đã chuẩn bị tiến trình chơi thử cho node ${checkpointId}`);
  };

  const formDirty = useMemo(
    () => (draft ? JSON.stringify(draft) !== baseline : false),
    [draft, baseline],
  );

  const baselineEdges = useMemo(() => buildDependencyEdges(rows), [rows]);
  const edgesDirty = useMemo(
    () => edgeSignature(pendingEdges) !== edgeSignature(baselineEdges),
    [pendingEdges, baselineEdges],
  );
  const positionsDirty = Object.keys(pendingPositions).length > 0;
  const flowDirty = edgesDirty || positionsDirty;
  const hasUnsaved = formDirty || flowDirty;

  const suggestions = useMemo(() => {
    const pending = new Set(pendingEdges.map(edgeKey));
    return suggestDependencyEdges(rows).filter(
      (edge) => !pending.has(edgeKey(edge)),
    );
  }, [rows, pendingEdges]);

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
      map.set(caseId, caseId === "case_000" ? "Vụ án #000" : caseId);
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
      "Có thay đổi chưa lưu ở checkpoint hoặc sơ đồ. Bỏ tất cả thay đổi này?",
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
      setPendingEdges(buildDependencyEdges(cpRes.data));
      setPendingPositions({});
      setFocusRequest(null);
      const first = cpRes.data[0] ?? null;
      setSelectedId(first?.id ?? null);
      const nextDraft = first ? toDraft(first) : null;
      setDraft(nextDraft);
      setBaseline(nextDraft ? JSON.stringify(nextDraft) : "");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectRow = (row: DbCaseCheckpoint): boolean => {
    if (row.id === selectedId) return true;
    if (!confirmDiscardForm()) return false;
    const nextDraft = toDraft(row);
    setSelectedId(row.id);
    setDraft(nextDraft);
    setBaseline(JSON.stringify(nextDraft));
    return true;
  };

  const selectFromList = (row: DbCaseCheckpoint) => {
    if (!selectRow(row)) return;
    setFocusRequest((current) => ({
      checkpointId: row.checkpoint_id,
      nonce: (current?.nonce ?? 0) + 1,
    }));
  };

  const createRow = () => {
    if (!confirmDiscardForm()) return;
    const nextDraft = createEmptyDraft(caseId);
    setSelectedId(null);
    setDraft(nextDraft);
    setBaseline(JSON.stringify(nextDraft));
    setFocusRequest(null);
  };

  const changeCase = async (nextCaseId: string) => {
    if (nextCaseId === caseId) return;
    if (!confirmDiscardAll()) return;
    setCaseId(nextCaseId);
    setSelectedId(null);
    setDraft(null);
    setBaseline("");
    setPendingEdges([]);
    setPendingPositions({});
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
              question: next.question,
              answer_config: {
                ...(r.answer_config as Record<string, unknown>),
                ...next.answerConfig,
                ...(patch.unlocksDossier !== undefined
                  ? { unlocksDossier: patch.unlocksDossier }
                  : {}),
              },
            };
          }

          // Nguyên tắc 1 bộ hồ sơ chỉ tồn tại ở 1 node duy nhất:
          // Nếu node hiện tại lấy selectedDossier (khác rỗng), bất kỳ node nào khác đang giữ bộ đó phải nhả ra!
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

  const addDependency = useCallback(
    (source: string, target: string) => {
      if (source === target) {
        toast.error("Checkpoint không thể phụ thuộc chính nó.");
        return;
      }
      if (!rows.some((row) => row.checkpoint_id === source)) return;
      if (!rows.some((row) => row.checkpoint_id === target)) return;
      if (
        pendingEdges.some((edge) => edgeKey(edge) === `${source}->${target}`)
      ) {
        toast.error("Liên kết này đã tồn tại.");
        return;
      }
      if (wouldCreateCycle(pendingEdges, { source, target })) {
        toast.error("Liên kết tạo vòng lặp phụ thuộc.");
        return;
      }
      setPendingEdges((current) => [...current, { source, target }]);
    },
    [rows, pendingEdges],
  );

  const deleteDependency = useCallback((source: string, target: string) => {
    setPendingEdges((current) =>
      current.filter(
        (edge) => !(edge.source === source && edge.target === target),
      ),
    );
  }, []);

  const handleDossierClick = useCallback(
    () => {
      router.push(`/studio/dossier?case=${encodeURIComponent(caseId)}`);
    },
    [router, caseId],
  );

  const handleCreateDossier = useCallback(() => {
    router.push(`/studio/dossier?case=${encodeURIComponent(caseId)}`);
  }, [router, caseId]);

  const applySuggestions = useCallback(() => {
    if (suggestions.length === 0) return;
    setPendingEdges((current) => {
      const next = [...current];
      for (const suggestion of suggestions) {
        const exists = next.some(
          (edge) => edgeKey(edge) === edgeKey(suggestion),
        );
        if (exists) continue;
        if (wouldCreateCycle(next, suggestion)) continue;
        next.push({ source: suggestion.source, target: suggestion.target });
      }
      return next;
    });
  }, [suggestions]);

  const updateNodePosition = useCallback(
    (checkpointId: string, position: CheckpointFlowPosition) => {
      const rounded = {
        x: Math.round(position.x),
        y: Math.round(position.y),
      };
      setPendingPositions((current) => {
        const row = rows.find((item) => item.checkpoint_id === checkpointId);
        if (!row) return current;

        const next = { ...current };
        if (
          row.flow_position &&
          row.flow_position.x === rounded.x &&
          row.flow_position.y === rounded.y
        ) {
          delete next[checkpointId];
          return next;
        }
        next[checkpointId] = rounded;
        return next;
      });
    },
    [rows],
  );

  const handleSaveFlow = async () => {
    if (!flowDirty) return;

    const dependencyUpdates: CheckpointDependencyUpdate[] = [];
    for (const row of rows) {
      const nextDeps = depsFor(row.checkpoint_id, pendingEdges);
      const currentDeps = [...(row.depends_on || [])].sort();
      if (!sameList(nextDeps, currentDeps)) {
        dependencyUpdates.push({
          checkpointId: row.checkpoint_id,
          dependsOn: nextDeps,
        });
      }
    }

    const positionUpdates: CheckpointPositionUpdate[] = Object.entries(
      pendingPositions,
    )
      .filter(([checkpointId]) =>
        rows.some((row) => row.checkpoint_id === checkpointId),
      )
      .map(([checkpointId, position]) => ({ checkpointId, position }));

    if (dependencyUpdates.length === 0 && positionUpdates.length === 0) {
      return;
    }

    setIsSavingDependencies(true);
    try {
      if (dependencyUpdates.length > 0) {
        const result = await updateCheckpointDependencies(
          caseId,
          dependencyUpdates,
        );
        if (!result.success) {
          toast.error(result.error);
          return;
        }
      }

      if (positionUpdates.length > 0) {
        const result = await updateCheckpointPositions(caseId, positionUpdates);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
      }

      setRows((current) =>
        current.map((row) => {
          const dependencyUpdate = dependencyUpdates.find(
            (item) => item.checkpointId === row.checkpoint_id,
          );
          const position = pendingPositions[row.checkpoint_id];
          return {
            ...row,
            ...(dependencyUpdate
              ? { depends_on: dependencyUpdate.dependsOn }
              : {}),
            ...(position ? { flow_position: position } : {}),
          };
        }),
      );
      setPendingPositions({});

      setDraft((current) =>
        current
          ? {
              ...current,
              dependsOn: depsFor(current.checkpointId, pendingEdges),
            }
          : current,
      );
      setBaseline((current) => {
        if (!current) return current;
        try {
          const parsed = JSON.parse(current) as CheckpointStudioDraft;
          return JSON.stringify({
            ...parsed,
            dependsOn: depsFor(parsed.checkpointId, pendingEdges),
          });
        } catch {
          return current;
        }
      });

      toast.success("Đã lưu sơ đồ.");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không lưu được sơ đồ.";
      toast.error(message);
    } finally {
      setIsSavingDependencies(false);
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error("Nhập tiêu đề checkpoint trước khi lưu.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveCheckpoint(draft);
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
      setPendingEdges((current) =>
        current.filter(
          (edge) =>
            edge.source !== deletedCheckpointId &&
            edge.target !== deletedCheckpointId,
        ),
      );
      const first = remaining[0] ?? null;
      const nextDraft = first ? toDraft(first) : null;
      setSelectedId(first?.id ?? null);
      setDraft(nextDraft);
      setBaseline(nextDraft ? JSON.stringify(nextDraft) : "");
      toast.success("Đã xóa checkpoint.");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không xóa được checkpoint.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!hasUnsaved) {
      toast.info("Không có thay đổi nào cần lưu.");
      return;
    }

    setIsSaving(true);
    let savedAny = false;
    try {
      if (formDirty && draft) {
        if (!draft.title.trim()) {
          toast.error("Nhập tiêu đề checkpoint trước khi lưu.");
          setIsSaving(false);
          return;
        }
        const result = await saveCheckpoint(draft);
        if (!result.success) {
          toast.error(result.error);
          setIsSaving(false);
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
        savedAny = true;
      }

      if (flowDirty) {
        await handleSaveFlow();
        savedAny = true;
      }

      if (savedAny) {
        toast.success("Đã lưu tất cả thay đổi!");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi lưu dữ liệu.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* Thanh chuyển đổi View (Flow vs Board) */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 bg-[#090a0f] px-3 z-20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-300 mr-1.5 tracking-wide">
            Checkpoint Studio
          </span>
          <button
            type="button"
            onClick={() => setActiveView("flow")}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-semibold transition-colors",
              activeView === "flow"
                ? "bg-white/15 text-white shadow-xs"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
            )}
          >
            Sơ đồ luồng (Flow)
          </button>
          <button
            type="button"
            onClick={() => setActiveView("board")}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-semibold transition-colors",
              activeView === "board"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
            )}
          >
            Bảng điều tra (Board)
          </button>
        </div>
      </div>

      {activeView === "board" ? (
        <div className="flex-1 min-h-0 min-w-0">
          <BoardEditor caseId={caseId} checkpoints={rows} />
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 w-full flex-col md:flex-row">
      {/* 1. Sơ đồ FlowView bên trái */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <CheckpointFlowView
          caseId={caseId}
          cases={caseOptions}
          onCaseChange={changeCase}
          rows={rows}
          dossiers={dossiers}
          selectedId={selectedId}
          pendingEdges={pendingEdges}
          suggestions={suggestions}
          flowDirty={flowDirty}
          hasUnsaved={hasUnsaved}
          isSaving={isSaving || isSavingDependencies}
          focusRequest={focusRequest}
          onSelect={selectRow}
          onCreate={createRow}
          onAddEdge={addDependency}
          onDeleteEdge={deleteDependency}
          onApplySuggestions={applySuggestions}
          onNodePositionChange={updateNodePosition}
          onSaveFlow={handleSaveFlow}
          onSaveAll={handleSaveAll}
          onDossierClick={handleDossierClick}
          onCreateDossier={handleCreateDossier}
          lintResult={lintResult}
          onOpenLintModal={() => setIsLintModalOpen(true)}
        />
      </div>

      {/* 2. Đường viền kéo dãn độ rộng sidebar bên phải (Desktop only, ẩn grip, chỉ hiện cursor khi hover) */}
      <div
        onMouseDown={startResizing}
        className={cn(
          "hidden md:block relative z-30 w-1 -mr-0.5 cursor-col-resize select-none shrink-0 bg-white/10 transition-colors hover:bg-amber-400 active:bg-amber-500",
          isResizing && "bg-amber-500",
        )}
        title="Kéo sang trái/phải để điều chỉnh độ rộng"
      />

      {/* 3. Hộp biên tập Checkpoint / Dossier bên phải */}
      <div
        style={{ width: `${sidebarWidth}px` }}
        className={cn(
          "flex h-[55%] min-h-0 shrink-0 flex-col md:h-full max-w-[85vw]",
          !isResizing && "transition-[width] duration-75 ease-out",
        )}
      >
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
      </div>
        </div>
      )}

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
