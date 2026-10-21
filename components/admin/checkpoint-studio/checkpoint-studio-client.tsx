"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DbCase, DbCaseCheckpoint } from "@/lib/types/database";
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
import {
  buildDependencyEdges,
  suggestDependencyEdges,
  wouldCreateCycle,
  type CheckpointGraphEdge,
} from "@/lib/cms/checkpoint-graph";
import { toast } from "@/components/ui/toast";
import { CheckpointListSidebar } from "./checkpoint-list-sidebar";
import { CheckpointEditor } from "./checkpoint-editor";
import { CheckpointFlowView } from "./checkpoint-flow-view";

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

const CASE_KEY_ALIAS: Record<string, string> = {
  "7edde065-c9ea-4f41-875e-5526a29f5804": "case_000",
};

function toCaseKey(id: string): string {
  return CASE_KEY_ALIAS[id] || id;
}

interface CheckpointStudioClientProps {
  initialCaseId?: string;
  initialCases?: DbCase[];
  initialRows?: DbCaseCheckpoint[];
}

export function CheckpointStudioClient({
  initialCaseId = "case_000",
  initialCases = [],
  initialRows = [],
}: CheckpointStudioClientProps) {
  const [caseId, setCaseId] = useState(initialCaseId);
  const [rows, setRows] = useState<DbCaseCheckpoint[]>(initialRows);
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
    for (const item of initialCases) {
      map.set(toCaseKey(item.id), item.title);
    }
    if (!map.has(caseId)) {
      map.set(caseId, caseId === "case_000" ? "Vụ án #000" : caseId);
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [initialCases, caseId]);

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
      const result = await getCheckpointsByCase(nextCaseId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setRows(result.data);
      setPendingEdges(buildDependencyEdges(result.data));
      setPendingPositions({});
      setFocusRequest(null);
      const first = result.data[0] ?? null;
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
    setDraft((current) => (current ? { ...current, ...patch } : current));
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
        const result = await updateCheckpointPositions(
          caseId,
          positionUpdates,
        );
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
    } catch (error: any) {
      toast.error(error?.message || "Không lưu được sơ đồ.");
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
    } catch (error: any) {
      toast.error(error?.message || "Không lưu được checkpoint.");
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
    } catch (error: any) {
      toast.error(error?.message || "Không xóa được checkpoint.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col md:flex-row">
      <div className="order-1 flex min-h-0 min-w-0 flex-1 flex-col">
        <CheckpointFlowView
          caseId={caseId}
          rows={rows}
          selectedId={selectedId}
          pendingEdges={pendingEdges}
          suggestions={suggestions}
          flowDirty={flowDirty}
          isSaving={isSavingDependencies}
          focusRequest={focusRequest}
          onSelect={selectRow}
          onCreate={createRow}
          onAddEdge={addDependency}
          onDeleteEdge={deleteDependency}
          onApplySuggestions={applySuggestions}
          onNodePositionChange={updateNodePosition}
          onSaveFlow={handleSaveFlow}
        />
      </div>

      <div className="order-2 flex h-[55%] min-h-0 shrink-0 flex-col md:h-full md:w-[380px] lg:w-[420px]">
        <CheckpointListSidebar
          cases={caseOptions}
          caseId={caseId}
          onCaseChange={changeCase}
          rows={rows}
          selectedId={selectedId}
          onSelect={selectFromList}
          onCreate={createRow}
          isLoading={isLoading}
        >
          {draft && (
            <CheckpointEditor
              draft={draft}
              onChange={updateDraft}
              onSave={handleSave}
              onDelete={handleDelete}
              isSaving={isSaving}
              isDirty={formDirty}
            />
          )}
        </CheckpointListSidebar>
      </div>
    </div>
  );
}
