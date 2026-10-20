"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DbCase, DbCaseCheckpoint } from "@/lib/types/database";
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
import { toast } from "@/components/ui/toast";
import { CheckpointListSidebar } from "./checkpoint-list-sidebar";
import { CheckpointEditor } from "./checkpoint-editor";

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
  const [isLoading, setIsLoading] = useState(false);

  const isDirty = useMemo(
    () => (draft ? JSON.stringify(draft) !== baseline : false),
    [draft, baseline],
  );

  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

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

  const confirmDiscard = useCallback(() => {
    if (!isDirty) return true;
    return window.confirm("Bạn có thay đổi chưa lưu. Bỏ các thay đổi này?");
  }, [isDirty]);

  const loadCase = useCallback(async (nextCaseId: string) => {
    setIsLoading(true);
    try {
      const result = await getCheckpointsByCase(nextCaseId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setRows(result.data);
      const first = result.data[0] ?? null;
      setSelectedId(first?.id ?? null);
      const nextDraft = first ? toDraft(first) : null;
      setDraft(nextDraft);
      setBaseline(nextDraft ? JSON.stringify(nextDraft) : "");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectRow = (row: DbCaseCheckpoint) => {
    if (!confirmDiscard()) return;
    const nextDraft = toDraft(row);
    setSelectedId(row.id);
    setDraft(nextDraft);
    setBaseline(JSON.stringify(nextDraft));
  };

  const createRow = () => {
    if (!confirmDiscard()) return;
    const nextDraft = createEmptyDraft(caseId);
    setSelectedId(null);
    setDraft(nextDraft);
    setBaseline(JSON.stringify(nextDraft));
  };

  const changeCase = async (nextCaseId: string) => {
    if (nextCaseId === caseId) return;
    if (!confirmDiscard()) return;
    setCaseId(nextCaseId);
    setSelectedId(null);
    setDraft(null);
    setBaseline("");
    await loadCase(nextCaseId);
  };

  const updateDraft = (patch: Partial<CheckpointStudioDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.checkpointId.trim()) {
      toast.error("Nhập mã checkpoint trước khi lưu.");
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
        `Xóa checkpoint "${draft.checkpointId}"? Thao tác này không thể hoàn tác.`,
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

      const remaining = rows.filter((row) => row.id !== draft.id);
      setRows(remaining);
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
      <div className="h-72 shrink-0 md:h-full md:w-80">
        <CheckpointListSidebar
          cases={caseOptions}
          caseId={caseId}
          onCaseChange={changeCase}
          rows={rows}
          selectedId={selectedId}
          onSelect={selectRow}
          onCreate={createRow}
          isLoading={isLoading}
        />
      </div>
      <CheckpointEditor
        draft={draft}
        onChange={updateDraft}
        onSave={handleSave}
        onDelete={handleDelete}
        isSaving={isSaving}
        isDirty={isDirty}
      />
    </div>
  );
}
