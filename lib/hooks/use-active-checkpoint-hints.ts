"use client";

import { useMemo } from "react";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import {
  getCheckpointHints,
  getCheckpointOptions,
  getSheetHintLevel,
  type SheetCheckpointRow,
} from "@/lib/cms/checkpoint-cms";

export interface ActiveCheckpointHints {
  /** Toàn bộ danh sách gợi ý đọc trực tiếp từ Google Sheet (số lượng tùy ý). */
  hints: string[];
  /** Lựa chọn trắc nghiệm (nếu có) đọc từ Google Sheet. */
  options: string[];
  /** Dòng checkpoint đang hoạt động trên Sheet. */
  row?: SheetCheckpointRow;
  loading: boolean;
}

/**
 * Hook đọc gợi ý/đáp án của MỘT checkpoint đang hoạt động trực tiếp từ Google Sheet.
 * Không giới hạn số lượng gợi ý — Sheet có bao nhiêu cấp độ thì trả về bấy nhiêu.
 * Tự động fallback về danh sách gợi ý tĩnh khi Sheet chưa có dữ liệu.
 */
export function useActiveCheckpointHints(
  checkpointId: string,
  fallbackHints: string[] = [],
): ActiveCheckpointHints {
  const { data, loading } = usePhoneData<SheetCheckpointRow>("checkpoints");

  return useMemo(() => {
    const row = data.find(
      (r) => (r.checkpoint_id || "").trim() === checkpointId,
    );

    if (!row) {
      return { hints: fallbackHints, options: [], row: undefined, loading };
    }

    const sheetHints = getCheckpointHints(row);
    const options = getCheckpointOptions(row);

    return {
      hints: sheetHints.length > 0 ? sheetHints : fallbackHints,
      options,
      row,
      loading,
    };
  }, [data, checkpointId, fallbackHints, loading]);
}

/** Lấy gợi ý cấp `level` (bắt đầu từ 1) của checkpoint đang hoạt động từ Google Sheet. */
export function useActiveCheckpointHint(
  checkpointId: string,
  level: number,
  fallbackHints: string[] = [],
): { hint: string; total: number } {
  const { hints } = useActiveCheckpointHints(checkpointId, fallbackHints);
  return { hint: getSheetHintLevel(hints, level), total: hints.length };
}
