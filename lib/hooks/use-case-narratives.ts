"use client";

import { useMemo, useCallback } from "react";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
import type { PhaseNarrative } from "@/lib/types";

export const DEFAULT_NARRATIVES: Record<
  number,
  { date: string; monologue: string }
> = {
  0: {
    date: "BAN ĐẦU",
    monologue:
      "Căn nhà cũ số 14 Đường Bờ Sông chìm trong bóng tối...\nChỉ có mùi máu bốc lên và ấm trà vỡ vụn dưới sàn phòng khách...\n\nNạn nhân Khang đã gục xuống. Tiếng bước chân lẩn khuất ngoài ngõ vắng vừa biến mất.\n\nHung thủ đã kịp trốn vào màn đêm. Tội ác giờ đây đang bị ẩn giấu đằng sau những manh mối ngổn ngang.\n\nTrò chơi trốn tìm sinh tử chính thức bắt đầu - và bạn chính là người đi tìm sự thật.",
  },
  1: {
    date: "BỘ A - BƯỚC NGOẶT I",
    monologue:
      "Vỏ bọc ngoại phạm của Lê Quang Vũ đã chính thức sụp đổ sau khi mâu thuẫn lời khai và nhật ký điện thoại bị phanh phui.\n\nTại bàn ăn số 3 quán nhậu Bờ Sông, Vũ buộc phải khai nhận về một cuộc hẹn bí mật trong bóng tối...\n\nMột mắt xích quan trọng tiếp theo của vụ án đã hé lộ.",
  },
  2: {
    date: "BỘ B - BƯỚC NGOẶT II",
    monologue:
      "Nguyễn Thanh Tùng đã chính thức đầu thú về hành vi xô xát tại hiện trường lúc 20:45.\n\nTuy nhiên, vết thương do anh ta gây ra không phải nhát chém chí mạng đoạt mạng Khang.\n\nKẻ thủ ác thực sự vẫn đang lẩn khuất trong bóng tối, và manh mối mấu chốt giờ đây dồn về phía người phụ nữ cuối cùng rời khỏi ngõ Bờ Sông...",
  },
  3: {
    date: "BỘ C - BƯỚC NGOẶT III",
    monologue:
      "Đối tượng Trần Thị Hà có thái độ bất hợp tác, không giải trình được mâu thuẫn tiếng còi tàu 68 dB trong hộp thư thoại lúc 20:32.\n\nĐể ngăn chặn nguy cơ tẩu tán chứng cứ, căn cứ Điều 140 Bộ luật Tố tụng hình sự, Lệnh khám xét khẩn cấp chỗ ở đối với Trần Thị Hà chính thức được phê duyệt.\n\nTổ công tác khẩn trương lên đường thu giữ vật chứng giấu kín...",
  },
};

export interface CaseNarrativesState {
  narratives: PhaseNarrative[];
  loading: boolean;
  refetch: () => void;
  getPhaseNarrative: (phase: number) => {
    date: string;
    monologue: string;
  };
}

const PHASE_TO_CHECKPOINT: Record<number, string> = {
  0: "cp-000-0",
  1: "cp-000-1a",
  2: "cp-000-1b",
  3: "cp-000-1c",
};

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
    date: "HỒ SƠ BỘ A",
    monologue:
      "Lời khai của đối tượng đầu tiên đã được cập nhật vào hồ sơ vụ án.\n\nHãy phân tích kỹ lưỡng các mâu thuẫn để tiếp tục mở rộng hướng điều tra.",
  },
  2: {
    date: "HỒ SƠ BỘ B",
    monologue:
      "Đối tượng thứ hai đã cung cấp các tình tiết mới liên quan đến thời điểm xảy ra vụ án.\n\nCác mắt xích logic đang dần thu hẹp vòng nghi vấn.",
  },
  3: {
    date: "HỒ SƠ BỘ C",
    monologue:
      "Manh mối then chốt đã xuất hiện. Mọi chứng cứ dường như đang hướng về đối tượng có nhiều biểu hiện bất thường nhất.\n\nHãy chuẩn bị các chứng cứ pháp lý đanh thép để tiến hành định tội.",
  },
};

function resolveCheckpointForPhase(
  checkpoints: any[],
  phase: number,
  caseId: string,
) {
  if (caseId === "case-000") {
    const fixedId = PHASE_TO_CHECKPOINT[phase];
    return checkpoints.find((c) => c.id === fixedId);
  }

  const dossierMap: Record<number, string> = { 0: "0", 1: "A", 2: "B", 3: "C" };
  const targetDossier = dossierMap[phase];
  if (targetDossier) {
    const byDossier = checkpoints.find(
      (c) => (c.dossier || "").toUpperCase() === targetDossier,
    );
    if (byDossier) return byDossier;
  }

  if (phase === 0) {
    const p0 = checkpoints.find(
      (c) =>
        c.id.includes("-0") ||
        c.id.includes("phone") ||
        c.id.includes("start"),
    );
    if (p0) return p0;
  } else if (phase === 1) {
    const p1 = checkpoints.find(
      (c) => c.id.includes("-1a") || c.id.includes("phase-1"),
    );
    if (p1) return p1;
  } else if (phase === 2) {
    const p2 = checkpoints.find(
      (c) => c.id.includes("-1b") || c.id.includes("phase-2"),
    );
    if (p2) return p2;
  } else if (phase === 3) {
    const p3 = checkpoints.find(
      (c) => c.id.includes("-1c") || c.id.includes("phase-3"),
    );
    if (p3) return p3;
  }

  return checkpoints[phase];
}

/**
 * Hook kết nối trực tiếp cột `narrative` từ tab `checkpoints` trên Google Sheets Live CMS 100%,
 * tự động cập nhật lời dẫn mở đầu và dẫn truyện các bộ hồ sơ theo thời gian thực.
 * Luôn có fallback an toàn để không bao giờ bị màn hình đen khi mạng đang fetch.
 */
export function useCaseNarratives(
  caseId: string = "case-000",
): CaseNarrativesState {
  const { checkpoints, loading, refetch } = useCaseCheckpoints(caseId);

  const fallbackRecord =
    caseId === "case-000" ? DEFAULT_NARRATIVES : GENERIC_FALLBACK_NARRATIVES;

  const narratives: PhaseNarrative[] = useMemo(() => {
    const list: PhaseNarrative[] = [];
    [0, 1, 2, 3].forEach((phase) => {
      const cp = resolveCheckpointForPhase(checkpoints, phase, caseId);
      if (cp && cp.storyConfig?.monologue) {
        list.push({
          caseId,
          phase,
          date: cp.storyConfig.date || fallbackRecord[phase]?.date || "",
          monologue: cp.storyConfig.monologue,
        });
      }
    });
    return list;
  }, [checkpoints, caseId, fallbackRecord]);

  const getPhaseNarrative = useCallback(
    (phase: number) => {
      const cp = resolveCheckpointForPhase(checkpoints, phase, caseId);
      if (cp && cp.storyConfig?.monologue) {
        return {
          date: cp.storyConfig.date || fallbackRecord[phase]?.date || "",
          monologue: cp.storyConfig.monologue,
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


