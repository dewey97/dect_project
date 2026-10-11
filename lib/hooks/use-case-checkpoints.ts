"use client";

import { useMemo } from "react";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import {
  transformSheetCheckpoints,
  type SheetCheckpointRow,
} from "@/lib/cms/checkpoint-cms";
import type { Checkpoint, CheckpointOptionItem } from "@/lib/types";

export interface CaseCheckpointsState {
  checkpoints: Checkpoint[];
  loading: boolean;
  refetch: () => void;
}

export interface SheetEvidenceRow {
  case_id?: string;
  code?: string;
  label?: string;
  type?: string;
  category?: string;
  description?: string;
  unlocked_by_phase?: string;
  position_x?: string | number;
  position_y?: string | number;
  logic_data?: string;
  [key: string]: any;
}

function normalizeCaseId(caseId: string): string {
  return (caseId || "").trim().replace(/-/g, "_").toLowerCase();
}

/**
 * Bổ sung label & description từ danh mục `evidences` vào các chip vật chứng trong `availableEvidences`
 * khi GM chỉ nhập danh sách mã code ngắn trên Google Sheet.
 */
function enrichCheckpointsWithEvidences(
  checkpoints: Checkpoint[],
  evidenceRows: SheetEvidenceRow[],
): Checkpoint[] {
  if (!evidenceRows || evidenceRows.length === 0) return checkpoints;

  const evidenceMap = new Map<string, SheetEvidenceRow>();
  evidenceRows.forEach((ev) => {
    const code = (ev.code || "").trim();
    if (code) {
      evidenceMap.set(code.toLowerCase(), ev);
    }
  });

  return checkpoints.map((cp) => {
    if (!cp.pickerConfig?.availableEvidences) return cp;

    const enrichedAvailable: CheckpointOptionItem[] =
      cp.pickerConfig.availableEvidences.map((item) => {
        const key = (item.code || item.id || "").trim().toLowerCase();
        const meta = evidenceMap.get(key);
        if (meta) {
          return {
            ...item,
            id: item.id || meta.code || key,
            code: meta.code || item.code,
            label:
              item.label && item.label !== item.id
                ? item.label
                : meta.label || item.id,
            description: item.description || meta.description,
          };
        }
        return item;
      });

    return {
      ...cp,
      pickerConfig: {
        ...cp.pickerConfig,
        availableEvidences: enrichedAvailable,
      },
    };
  });
}

/**
 * Hook kết nối trực tiếp tab `checkpoints` & `evidences` từ Google Sheets Live CMS 100%,
 * tự động đồng bộ danh sách câu hỏi, đáp án, gợi ý.
 */
export function useCaseCheckpoints(caseId: string = "case-000"): CaseCheckpointsState {
  const {
    data: checkpointRows,
    loading: cpLoading,
    refetch: refetchCp,
  } = usePhoneData<SheetCheckpointRow>("checkpoints", caseId);

  const {
    data: evidenceRows,
    loading: evLoading,
    refetch: refetchEv,
  } = usePhoneData<SheetEvidenceRow>("evidences", caseId);

  const refetch = () => {
    refetchCp();
    refetchEv();
  };

  const checkpoints = useMemo(() => {
    const targetId = normalizeCaseId(caseId);
    const matchingRows = checkpointRows.filter(
      (row) => !row.case_id || normalizeCaseId(row.case_id) === targetId,
    );

    if (matchingRows.length > 0) {
      const transformed = transformSheetCheckpoints(matchingRows);
      return enrichCheckpointsWithEvidences(transformed, evidenceRows);
    }

    return [];
  }, [checkpointRows, evidenceRows, caseId]);

  return {
    checkpoints,
    loading: cpLoading || evLoading,
    refetch,
  };
}

