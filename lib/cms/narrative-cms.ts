import type { PhaseNarrative } from "@/lib/types";

/**
 * Interface đại diện cho một dòng trong tab `narratives` trên Google Sheet.
 *
 * Mỗi dòng là dẫn truyện cinematic của MỘT CHẶNG điều tra (bộ hồ sơ),
 * không gắn với checkpoint riêng lẻ.
 */
export interface SheetNarrativeRow {
  case_id?: string;
  /** Số thứ tự chặng: `0` = Ban Đầu, `1` = Bộ A, `2` = Bộ B, `3` = Bộ C. */
  phase?: string | number;
  /** Nhãn bộ hồ sơ cho biên kịch — code không đọc cột này. */
  dossier?: string;
  /** Mốc thời gian in trên header modal, ví dụ `Đêm 24/07/2016`. */
  date?: string;
  /** Đoạn độc thoại dẫn truyện (Alt+Enter ngắt dòng, dòng đôi ngắt đoạn). */
  monologue?: string;
  [key: string]: unknown;
}

/** Chuẩn hoá `case_id` để so khớp giữa Sheet (`case_000`) và code (`case-000`). */
function normalizeCaseId(caseId: string): string {
  return (caseId || "").trim().replace(/-/g, "_").toLowerCase();
}

/** Bóc số thứ tự chặng từ ô `phase`; trả về `null` nếu không phải số hợp lệ. */
function parsePhase(raw?: string | number): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : null;
}

/**
 * Chuyển danh sách dòng tab `narratives` thành mảng `PhaseNarrative` đã chuẩn hoá.
 * Dòng thiếu `phase` hoặc thiếu `monologue` bị loại bỏ.
 */
export function transformSheetNarratives(
  rows: SheetNarrativeRow[],
  caseId: string,
): PhaseNarrative[] {
  if (!rows || rows.length === 0) return [];

  const targetId = normalizeCaseId(caseId);
  const result: PhaseNarrative[] = [];

  rows.forEach((row) => {
    if (normalizeCaseId(row.case_id || "") !== targetId) return;

    const phase = parsePhase(row.phase);
    const monologue = (row.monologue || "").trim();
    if (phase === null || !monologue) return;

    result.push({
      caseId: row.case_id || caseId,
      phase,
      dossier: row.dossier || undefined,
      date: row.date || undefined,
      monologue,
    });
  });

  return result.sort((a, b) => a.phase - b.phase);
}

/** Tra cứu dẫn truyện theo số chặng; trả về `undefined` nếu Sheet không có chặng đó. */
export function getNarrativeByPhase(
  narratives: PhaseNarrative[],
  phase: number,
): PhaseNarrative | undefined {
  return narratives.find((item) => item.phase === phase);
}
