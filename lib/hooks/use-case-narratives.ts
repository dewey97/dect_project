"use client";

import { useMemo } from "react";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import {
  transformSheetNarratives,
  type SheetNarrativeRow,
} from "@/lib/cms/narrative-cms";
import type { PhaseNarrative } from "@/lib/types";
import { CASE_000_NARRATOR } from "@/content/cases/case-000/narrator";

export interface CaseNarrativesState {
  narratives: PhaseNarrative[];
  loading: boolean;
  source: "sheet" | "local";
  refetch: () => void;
  getPhaseNarrative: (phase: number) => {
    date: string;
    monologue: string;
  } | null;
}

/** Fallback tĩnh từ `content/cases/case-000/narrator.ts`. */
function getLocalFallbackNarratives(caseId: string): PhaseNarrative[] {
  if (caseId === "case-000" || caseId === "case_000") {
    return Object.values(CASE_000_NARRATOR).map((item) => ({
      caseId: "case-000",
      phase: item.phase,
      date: item.date,
      monologue: item.monologue,
    }));
  }
  return [];
}

/**
 * Hook kết nối trực tiếp tab `narratives` từ Google Sheets Live CMS,
 * tự động cập nhật lời dẫn mở đầu và dẫn truyện các bộ hồ sơ theo thời gian thực.
 */
export function useCaseNarratives(
  caseId: string = "case-000",
): CaseNarrativesState {
  const {
    data: rows,
    loading,
    refetch,
  } = usePhoneData<SheetNarrativeRow>("narratives");

  const { narratives, source } = useMemo(() => {
    const transformed = transformSheetNarratives(rows, caseId);
    if (transformed.length > 0) {
      return { narratives: transformed, source: "sheet" as const };
    }
    return {
      narratives: getLocalFallbackNarratives(caseId),
      source: "local" as const,
    };
  }, [rows, caseId]);

  const getPhaseNarrative = (phase: number) => {
    const match = narratives.find((n) => n.phase === phase);
    if (match) {
      return {
        date: match.date || "",
        monologue: match.monologue,
      };
    }
    const fallback = CASE_000_NARRATOR[phase];
    if (fallback) {
      return {
        date: fallback.date || "",
        monologue: fallback.monologue,
      };
    }
    return null;
  };

  return {
    narratives,
    loading,
    source,
    refetch,
    getPhaseNarrative,
  };
}
