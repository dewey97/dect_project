"use client";

import { useMemo } from "react";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import {
  transformSheetCheckpoints,
  type SheetCheckpointRow,
} from "@/lib/cms/checkpoint-cms";
import type { Checkpoint } from "@/lib/types";

export interface CaseCheckpointsState {
  checkpoints: Checkpoint[];
  loading: boolean;
  source: "sheet" | "local";
  refetch: () => void;
}

function normalizeCaseId(caseId: string): string {
  return (caseId || "").trim().replace(/-/g, "_").toLowerCase();
}

/**
 * Hook kết nối trực tiếp tab `checkpoints` từ Google Sheets Live CMS,
 * tự động đồng bộ danh sách câu hỏi, đáp án, gợi ý và fallback an toàn về danh sách tĩnh.
 */
export function useCaseCheckpoints(
  caseId: string,
  fallback: Checkpoint[] = [],
): CaseCheckpointsState {
  const { data, loading, refetch } =
    usePhoneData<SheetCheckpointRow>("checkpoints");

  const { checkpoints, source } = useMemo(() => {
    const targetId = normalizeCaseId(caseId);
    const matchingRows = data.filter(
      (row) => normalizeCaseId(row.case_id || "") === targetId,
    );

    if (matchingRows.length > 0) {
      return {
        checkpoints: transformSheetCheckpoints(matchingRows, fallback),
        source: "sheet" as const,
      };
    }

    return { checkpoints: fallback, source: "local" as const };
  }, [data, caseId, fallback]);

  return { checkpoints, loading, source, refetch };
}
