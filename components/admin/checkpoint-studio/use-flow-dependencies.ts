"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import type { CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";
import {
  updateCheckpointDependencies,
  updateCheckpointPositions,
} from "@/lib/actions/checkpoint-actions";
import {
  buildDependencyEdges,
  wouldCreateCycle,
} from "@/lib/checkpoints/graph";
import { toast } from "@/components/ui/toast";

interface FlowDependencyArgs {
  caseId: string;
  rows: DbCaseCheckpoint[];
  setRows: Dispatch<SetStateAction<DbCaseCheckpoint[]>>;
  draft: CheckpointStudioDraft | null;
  setDraft: Dispatch<SetStateAction<CheckpointStudioDraft | null>>;
}

/** Edits made on the flow diagram: depends_on edges and node positions. */
export function useFlowDependencies({
  caseId,
  rows,
  setRows,
  draft,
  setDraft,
}: FlowDependencyArgs) {
  // Updates local rows (and the open draft) right away, then saves.
  const applyDeps = async (targetId: string, dependsOn: string[]) => {
    setRows((prev) =>
      prev.map((r) =>
        r.checkpoint_id === targetId ? { ...r, depends_on: dependsOn } : r,
      ),
    );
    if (draft?.checkpointId === targetId) {
      setDraft((d) => (d ? { ...d, dependsOn } : d));
    }
    return updateCheckpointDependencies(caseId, [
      { checkpointId: targetId, dependsOn },
    ]);
  };

  const handleConnectDependencyFromFlow = async (
    sourceCpId: string,
    targetCpId: string,
  ) => {
    const target = rows.find((r) => r.checkpoint_id === targetCpId);
    const source = rows.find((r) => r.checkpoint_id === sourceCpId);
    if (!target || !source) return;

    const current = target.depends_on || [];
    if (current.includes(sourceCpId)) {
      toast.info("Quan hệ phụ thuộc này đã tồn tại.");
      return;
    }
    if (
      wouldCreateCycle(buildDependencyEdges(rows), {
        source: sourceCpId,
        target: targetCpId,
      })
    ) {
      toast.error("Liên kết tạo chu trình vòng lặp phụ thuộc.");
      return;
    }

    const res = await applyDeps(targetCpId, [...current, sourceCpId]);
    if (res.success) {
      toast.success(
        `Đã nối phụ thuộc: "${target.title || targetCpId}" phụ thuộc vào "${source.title || sourceCpId}"`,
      );
    } else {
      toast.error(res.error || "Lỗi khi lưu quan hệ phụ thuộc.");
    }
  };

  const handleDeleteDependencyFromFlow = async (
    sourceCpId: string,
    targetCpId: string,
  ) => {
    const target = rows.find((r) => r.checkpoint_id === targetCpId);
    if (!target) return;
    await applyDeps(
      targetCpId,
      (target.depends_on || []).filter((id) => id !== sourceCpId),
    );
    toast.info("Đã xóa quan hệ phụ thuộc.");
  };

  const handleFlowNodePositionChange = useCallback(
    async (checkpointId: string, pos: { x: number; y: number }) => {
      setRows((prev) =>
        prev.map((r) =>
          r.checkpoint_id === checkpointId ? { ...r, flow_position: pos } : r,
        ),
      );
      try {
        const res = await updateCheckpointPositions(caseId, [
          { checkpointId, position: pos },
        ]);
        if (!res.success) console.error("Lỗi khi lưu vị trí flow:", res.error);
      } catch (err) {
        console.error("Lỗi khi lưu vị trí flow:", err);
      }
    },
    [caseId, setRows],
  );

  return {
    handleConnectDependencyFromFlow,
    handleDeleteDependencyFromFlow,
    handleFlowNodePositionChange,
  };
}
