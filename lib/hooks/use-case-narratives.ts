"use client";

import { useMemo } from "react";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
import type { PhaseNarrative } from "@/lib/types";

export interface CaseNarrativesState {
  narratives: PhaseNarrative[];
  loading: boolean;
  refetch: () => void;
  getPhaseNarrative: (phase: number) => {
    date: string;
    monologue: string;
  } | null;
}

const PHASE_TO_CHECKPOINT: Record<number, string> = {
  0: "cp-000-0",
  1: "cp-000-1a",
  2: "cp-000-1b",
  3: "cp-000-1c",
};

/**
 * Hook kết nối trực tiếp cột `narrative` từ tab `checkpoints` trên Google Sheets Live CMS 100%,
 * tự động cập nhật lời dẫn mở đầu và dẫn truyện các bộ hồ sơ theo thời gian thực.
 */
export function useCaseNarratives(
  caseId: string = "case-000",
): CaseNarrativesState {
  const { checkpoints, loading, refetch } = useCaseCheckpoints(caseId);

  const narratives: PhaseNarrative[] = useMemo(() => {
    const list: PhaseNarrative[] = [];
    Object.entries(PHASE_TO_CHECKPOINT).forEach(([phaseStr, cpId]) => {
      const phase = Number(phaseStr);
      const cp = checkpoints.find((c) => c.id === cpId);
      if (cp && cp.storyConfig?.monologue) {
        list.push({
          caseId,
          phase,
          date: cp.storyConfig.date || "",
          monologue: cp.storyConfig.monologue,
        });
      }
    });
    return list;
  }, [checkpoints, caseId]);

  const getPhaseNarrative = (phase: number) => {
    const targetCpId = PHASE_TO_CHECKPOINT[phase];
    const cp = checkpoints.find((c) => c.id === targetCpId);
    if (cp && cp.storyConfig?.monologue) {
      return {
        date: cp.storyConfig.date || "",
        monologue: cp.storyConfig.monologue,
      };
    }
    const match = narratives.find((n) => n.phase === phase);
    if (match) {
      return {
        date: match.date || "",
        monologue: match.monologue,
      };
    }
    return null;
  };

  return {
    narratives,
    loading,
    refetch,
    getPhaseNarrative,
  };
}


