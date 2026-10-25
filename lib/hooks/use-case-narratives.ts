"use client";

import { useMemo, useCallback } from "react";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
import type { Checkpoint, PhaseNarrative } from "@/lib/types";

export interface CaseNarrativesState {
  narratives: PhaseNarrative[];
  loading: boolean;
  refetch: () => void;
  getPhaseNarrative: (phase: number) => {
    date: string;
    monologue: string;
  };
}

const GENERIC_FALLBACK_NARRATIVES: Record<
  number,
  { date: string; monologue: string }
> = {
  0: {
    date: "KHỞI ĐẦU CHUYÊN ÁN",
    monologue:
      "Hiện trường vụ án vừa được phong tỏa. Toàn bộ tài liệu, manh mối ban đầu đã được chuyển tới bàn điều tra.\n\nHãy phân tích nhật ký liên lạc và các manh mối đầu tiên để mở rộng diện điều tra.",
  },
  1: {
    date: "GIAI ĐOẠN I",
    monologue:
      "Lời khai ban đầu của đối tượng thứ nhất đã được thu thập. Các tình tiết và tài liệu liên quan đang hé lộ những mâu thuẫn mới.",
  },
  2: {
    date: "GIAI ĐOẠN II",
    monologue:
      "Tiến trình điều tra đối tượng thứ hai ghi nhận thêm nhiều tình tiết phức tạp. Hãy đối chiếu lời khai với các chứng cứ tại hiện trường.",
  },
  3: {
    date: "GIAI ĐOẠN III",
    monologue:
      "Tập trung thẩm tra đối tượng mấu chốt. Toàn bộ mâu thuẫn đang dần hội tụ về các tình tiết quyết định vụ án.",
  },
};

/**
 * Tìm checkpoint tương ứng với từng giai đoạn / phase của vụ án
 */
function resolveCheckpointForPhase(
  checkpoints: Checkpoint[],
  phase: number,
  caseId: string,
): Checkpoint | undefined {
  if (!checkpoints || checkpoints.length === 0) return undefined;

  // 1. Khớp chính xác theo thuộc tính dossier/phase nếu có
  const phaseLetters = ["0", "A", "B", "C"];
  const targetLetter = phaseLetters[phase];
  const byDossier = checkpoints.find(
    (c) =>
      c.dossier?.toUpperCase() === targetLetter ||
      c.dossier?.toUpperCase() === `BỘ ${targetLetter}`,
  );
  if (byDossier) return byDossier;

  // 2. Khởi đầu: Phone lookup hoặc root checkpoint (không có phụ thuộc)
  if (phase === 0) {
    return (
      checkpoints.find(
        (c) =>
          c.kind === "phone_lookup" ||
          c.id.includes("phone") ||
          !c.dependsOn ||
          c.dependsOn.length === 0,
      ) || checkpoints[0]
    );
  }

  // 3. Các giai đoạn tiếp theo: suspects hoặc interrogation checkpoints
  const suspects = checkpoints.filter(
    (c) =>
      c.kind === "suspect_interrogation" ||
      c.kind === "choice" ||
      c.type === "mcq" ||
      c.type === "evidence_picker",
  );
  if (suspects.length >= phase) {
    return suspects[phase - 1];
  }

  return checkpoints[phase] || checkpoints[0];
}

export function useCaseNarratives(
  caseId: string = "case_000",
): CaseNarrativesState {
  const { checkpoints, loading, refetch } = useCaseCheckpoints(caseId);

  const fallbackRecord = GENERIC_FALLBACK_NARRATIVES;

  const narratives: PhaseNarrative[] = useMemo(() => {
    const list: PhaseNarrative[] = [];
    [0, 1, 2, 3].forEach((phase) => {
      const cp = resolveCheckpointForPhase(checkpoints, phase, caseId);
      const monologue = cp?.narrative || cp?.storyConfig?.monologue;
      if (cp && monologue) {
        list.push({
          caseId,
          phase,
          date: cp.storyConfig?.date || fallbackRecord[phase]?.date || "",
          monologue,
        });
      }
    });
    return list;
  }, [checkpoints, caseId, fallbackRecord]);

  const getPhaseNarrative = useCallback(
    (phase: number) => {
      const cp = resolveCheckpointForPhase(checkpoints, phase, caseId);
      const monologue = cp?.narrative || cp?.storyConfig?.monologue;
      if (cp && monologue) {
        return {
          date: cp.storyConfig?.date || fallbackRecord[phase]?.date || "",
          monologue,
        };
      }
      const match = narratives.find((n) => n.phase === phase);
      if (match) {
        return {
          date: match.date || fallbackRecord[phase]?.date || "",
          monologue: match.monologue,
        };
      }
      return (
        fallbackRecord[phase] || {
          date: "KHỞI ĐẦU",
          monologue: fallbackRecord[0].monologue,
        }
      );
    },
    [checkpoints, narratives, caseId, fallbackRecord],
  );

  return {
    narratives,
    loading,
    refetch,
    getPhaseNarrative,
  };
}
