"use client";

import { useMemo } from "react";
import { useStudioCheckpoints } from "@/lib/hooks/use-studio-checkpoints";
import { toRuntimeCheckpoint } from "@/lib/cms/checkpoint-runtime";
import type { DbCaseCheckpoint } from "@/lib/types/database";

export interface ActiveCheckpointHints {
  /** Toàn bộ danh sách gợi ý đọc từ Checkpoint Studio (số lượng tùy ý). */
  hints: string[];
  /** Lựa chọn trắc nghiệm (nếu có) đọc từ Checkpoint Studio. */
  options: string[];
  /** Dòng checkpoint đang hoạt động trong Studio. */
  row?: DbCaseCheckpoint;
  loading: boolean;
}

/**
 * Hook đọc gợi ý/đáp án của MỘT checkpoint đang hoạt động từ Checkpoint Studio.
 * Không giới hạn số lượng gợi ý — Studio có bao nhiêu cấp độ thì trả về bấy nhiêu.
 */
export function useActiveCheckpointHints(
  checkpointId: string,
  fallbackHints: string[] = [],
  caseId: string = "case-000",
): ActiveCheckpointHints {
  const { rows, loading } = useStudioCheckpoints(caseId);

  return useMemo(() => {
    const row = rows.find(
      (item) =>
        item.checkpoint_id === checkpointId || item.node_id === checkpointId,
    );

    if (!row) {
      return { hints: fallbackHints, options: [], row: undefined, loading };
    }

    const checkpoint = toRuntimeCheckpoint(row);
    const hints = checkpoint.hintsList || [];
    const options = checkpoint.options || [];

    return {
      hints: hints.length > 0 ? hints : fallbackHints,
      options,
      row,
      loading,
    };
  }, [rows, checkpointId, fallbackHints, loading]);
}

/** Lấy gợi ý cấp `level` (bắt đầu từ 1) của checkpoint đang hoạt động. */
export function useActiveCheckpointHint(
  checkpointId: string,
  level: number,
  fallbackHints: string[] = [],
  caseId: string = "case-000",
): { hint: string; total: number } {
  const { hints } = useActiveCheckpointHints(
    checkpointId,
    fallbackHints,
    caseId,
  );
  return {
    hint: level > 0 ? hints[level - 1] || "" : "",
    total: hints.length,
  };
}
