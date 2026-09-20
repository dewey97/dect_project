"use client";

import { useMemo } from "react";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import {
  transformSheetEvaluation,
  type SheetEvaluationRow,
} from "@/lib/cms/evaluation-cms";
import type { Evaluation } from "@/lib/types";

export interface CaseEvaluationState {
  evaluation: Evaluation | undefined;
  loading: boolean;
  /** 'sheet' = dữ liệu đáp án lấy từ Google Sheets Live CMS, 'local' = fallback file nội bộ */
  source: "sheet" | "local";
  refetch: () => void;
}

/** Chuẩn hóa caseId giữa code (`case-000`) và Google Sheet (`case_000`). */
function normalizeCaseId(caseId: string): string {
  return (caseId || "").trim().replace(/-/g, "_").toLowerCase();
}

/**
 * Lấy Bảng Đáp Án (Evaluation) của vụ án từ Google Sheets Live CMS,
 * tự động fallback về đáp án cục bộ khi tab `evaluations` chưa tồn tại hoặc rỗng.
 */
export function useCaseEvaluation(
  caseId: string,
  fallback?: Evaluation,
): CaseEvaluationState {
  const { data, loading, refetch } =
    usePhoneData<SheetEvaluationRow>("evaluations");

  const { evaluation, source } = useMemo(() => {
    const targetId = normalizeCaseId(caseId);
    const sheetRow = data.find(
      (row) => normalizeCaseId(row.case_id || "") === targetId,
    );

    if (sheetRow) {
      return {
        evaluation: transformSheetEvaluation(sheetRow, fallback),
        source: "sheet" as const,
      };
    }
    return { evaluation: fallback, source: "local" as const };
  }, [data, caseId, fallback]);

  return { evaluation, loading, source, refetch };
}
