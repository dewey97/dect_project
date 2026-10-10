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

/**
 * Hook kết nối trực tiếp cột `narrative` từ tab `checkpoints` trên Google Sheets Live CMS 100%,
 * tự động cập nhật lời dẫn mở đầu và dẫn truyện các bộ hồ sơ theo thời gian thực.
 * Luôn có fallback an toàn từ DEFAULT_NARRATIVES để không bao giờ bị màn hình đen khi mạng đang fetch.
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
          date: cp.storyConfig.date || DEFAULT_NARRATIVES[phase]?.date || "",
          monologue: cp.storyConfig.monologue,
        });
      }
    });
    return list;
  }, [checkpoints, caseId]);

  const getPhaseNarrative = useCallback(
    (phase: number) => {
      const targetCpId = PHASE_TO_CHECKPOINT[phase];
      const cp = checkpoints.find((c) => c.id === targetCpId);
      if (cp && cp.storyConfig?.monologue) {
        return {
          date: cp.storyConfig.date || DEFAULT_NARRATIVES[phase]?.date || "",
          monologue: cp.storyConfig.monologue,
        };
      }
      const match = narratives.find((n) => n.phase === phase);
      if (match) {
        return {
          date: match.date || DEFAULT_NARRATIVES[phase]?.date || "",
          monologue: match.monologue,
        };
      }
      return (
        DEFAULT_NARRATIVES[phase] || {
          date: "BAN ĐẦU",
          monologue: DEFAULT_NARRATIVES[0].monologue,
        }
      );
    },
    [checkpoints, narratives],
  );

  return {
    narratives,
    loading,
    refetch,
    getPhaseNarrative,
  };
}


