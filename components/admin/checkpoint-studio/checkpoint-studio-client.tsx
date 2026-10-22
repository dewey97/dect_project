"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DbCase, DbCaseCheckpoint, DbCaseDossier, DbCaseCharacter } from "@/lib/types/database";
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
import { createNewCase } from "@/lib/actions/case-actions";
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
import { DossierEditor } from "./dossier-editor";
import { CheckpointFlowView } from "./checkpoint-flow-view";
import { DossierConfigModal } from "./dossier-config-modal";

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
}

export function CheckpointStudioClient({
  initialCaseId = "case_000",
  initialCases = [],
  initialRows = [],
  initialDossiers = [],
  initialAvailableDocuments = [],
}: CheckpointStudioClientProps) {
  const [caseId, setCaseId] = useState(initialCaseId);

  // Giữ vụ án đang chọn trên URL (?case=) để tải lại trang không quay về case_000.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("case") === caseId) return;
    url.searchParams.set("case", caseId);
    window.history.replaceState(null, "", url);
  }, [caseId]);
  const [sidebarWidth, setSidebarWidth] = useState<number>(420);
  // Đọc độ rộng đã lưu sau khi mount để HTML server và client khớp nhau.
  useEffect(() => {
    const saved = Number(localStorage.getItem("checkpoint_studio_sidebar_width"));
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
        localStorage.setItem("checkpoint_studio_sidebar_width", String(sidebarWidth));
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
  const [allCases, setAllCases] = useState<DbCase[]>(initialCases);
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCaseCode, setNewCaseCode] = useState("");
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [rows, setRows] = useState<DbCaseCheckpoint[]>(initialRows);
  const [dossiers, setDossiers] = useState<DbCaseDossier[]>(initialDossiers);
  const [availableDocs, setAvailableDocs] = useState<AvailableDocumentItem[]>(
    initialAvailableDocuments,
  );
  const [activeDossierForEdit, setActiveDossierForEdit] =
    useState<DbCaseDossier | null>(null);
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
  const [characters, setCharacters] = useState<DbCaseCharacter[]>([]);
  const [isLintModalOpen, setIsLintModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/characters?caseId=${caseId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setCharacters(json.data);
      })
      .catch(() => {});
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

  const handleCreateCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) {
      toast.error("Vui lòng nhập tên vụ án");
      return;
    }

    setIsCreatingCase(true);
    try {
      const res = await createNewCase(newCaseTitle, newCaseCode || undefined);
      if (!res.success || !res.caseId) {
        toast.error(res.error || "Không tạo được vụ án mới");
        return;
      }

      toast.success(`Đã tạo vụ án "${newCaseTitle}" thành công!`);
      if (res.data) {
        setAllCases((prev) => [res.data as DbCase, ...prev]);
      }
      setIsCreateCaseOpen(false);
      setNewCaseTitle("");
      setNewCaseCode("");

      setCaseId(res.caseId);
      setSelectedId(null);
      setDraft(null);
      setBaseline("");
      setPendingEdges([]);
      setPendingPositions({});
      await loadCase(res.caseId);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi tạo vụ án");
    } finally {
      setIsCreatingCase(false);
    }
  };

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
      const [cpRes, dossierList, docsList] = await Promise.all([
        getCheckpointsByCase(nextCaseId),
        getCaseDossiers(nextCaseId),
        getAllCaseDocumentsCatalog(nextCaseId),
      ]);
      if (!cpRes.success) {
        toast.error(cpRes.error);
        return;
      }
      setRows(cpRes.data);
      setDossiers(dossierList);
      setAvailableDocs(docsList);
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
    setActiveDossierForEdit(null); // Đóng dossier editor nếu đang mở để quay về checkpoint
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
    setActiveDossierForEdit(null);
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
            : (next.unlocksDossier ? next.unlocksDossier.trim() : "");

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
          if (
            selectedDossier &&
            (r.answer_config as any)?.unlocksDossier?.trim() === selectedDossier
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
    (dossierOrName: DbCaseDossier | string) => {
      // Khi mở cấu hình dossier trong sidebar, tạm bỏ chọn checkpoint để sidebar hiển thị DossierEditor
      if (typeof dossierOrName === "object" && dossierOrName !== null) {
        setActiveDossierForEdit(dossierOrName);
        return;
      }

      const label = String(dossierOrName).trim();
      const found = dossiers.find(
        (d) =>
          d.title.toLowerCase() === label.toLowerCase() ||
          d.dossier_key.toLowerCase() === label.toLowerCase(),
      );

      if (found) {
        setActiveDossierForEdit(found);
      } else {
        const generatedKey = slugifyVietnamese(label);

        setActiveDossierForEdit({
          id: "",
          case_id: caseId,
          dossier_key: generatedKey || "bo_moi",
          title: label,
          document_codes: [] as string[],
          description: "",
          flow_position: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    },
    [dossiers, caseId],
  );

  const handleCreateDossier = useCallback(() => {
    setActiveDossierForEdit({
      id: "",
      case_id: caseId,
      dossier_key: "",
      title: "",
      document_codes: [] as string[],
      description: "",
      flow_position: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }, [caseId]);

  const handleDossierSaved = useCallback((saved: DbCaseDossier) => {
    setDossiers((prev) => {
      const exists = prev.some((d) => d.dossier_key === saved.dossier_key);
      if (exists) {
        return prev.map((d) =>
          d.dossier_key === saved.dossier_key ? saved : d,
        );
      }
      return [...prev, saved];
    });
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
    } catch (error: any) {
      toast.error(error?.message || "Lỗi khi lưu dữ liệu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col md:flex-row">
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
          onCreateCase={() => setIsCreateCaseOpen(true)}
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
        <CheckpointListSidebar
          onCreate={createRow}
          isLoading={isLoading}
        >
          {activeDossierForEdit ? (
            <DossierEditor
              caseId={caseId}
              dossier={activeDossierForEdit}
              availableDocuments={availableDocs}
              onSaved={(saved) => {
                handleDossierSaved(saved);
                setActiveDossierForEdit(saved);
              }}
              onClose={() => setActiveDossierForEdit(null)}
            />
          ) : draft ? (
            <CheckpointEditor
              draft={draft}
              dossiers={dossiers}
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

      {/* Modal Tạo Vụ Án Mới */}
      {isCreateCaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#0e0e14] p-4 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3">
              Tạo vụ án mới
            </h3>
            <form onSubmit={handleCreateCaseSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-zinc-500">
                  Tên vụ án *
                </label>
                <input
                  type="text"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-amber-500/50"
                  autoFocus={false}
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-zinc-500">
                  Mã vụ án (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={newCaseCode}
                  onChange={(e) => setNewCaseCode(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 font-mono text-xs text-zinc-200 outline-none focus:border-amber-500/50"
                  autoFocus={false}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateCaseOpen(false)}
                  disabled={isCreatingCase}
                  className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/5"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCase || !newCaseTitle.trim()}
                  className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
                >
                  {isCreatingCase ? "Đang tạo…" : "Tạo vụ án"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
