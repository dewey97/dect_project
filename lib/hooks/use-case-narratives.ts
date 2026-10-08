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

const DEFAULT_NARRATIVES: Record<number, { date: string; monologue: string }> = {
  0: {
    date: "20.10.1996 // 16:30 - Xóm Bờ Sông",
    monologue: `Chiều nay em lại được đi chơi cùng anh chị, vui quá đi. Hôm nay anh chị sẽ đưa em đi chơi trốn tìm. Hì hì may quá lần này em được đi trốn chứ không cần đi tìm.

Nhưng mà lạ quá, anh Khang bình thường hay bắt nạt em vì em không nói được, thế mà nay anh lại chủ động cầm tay em:

"Đây để anh đưa em đi trốn chỗ này, đảm bảo không ai tìm thấy"

Em vâng lời để anh Khang dẫn đi. Anh dẫn em đến trước một chiếc tủ gỗ cạnh bờ sông, trông nó cũ lắm rồi.

"Em cứ vào đây trốn, chắc chắn không ai tìm được đâu. Đưa còi đây anh cầm, nếu có ai đến gần tủ, anh sẽ thổi còi đánh lạc hướng cho. Đảm bảo em thắng trò này nhé"

Thế thì tốt quá! Em cũng muốn thắng lắm, để mọi người không coi em là đồ yếu đuối chỉ biết dựa dẫm vào anh trai em nữa. Em vội chui vào tủ luôn. Sắp hết thời gian rồi...

Nhưng sao lâu thế mà vẫn không thấy ai đến tìm em?
Có khi nào chiếc tủ này ở xa quá nên mọi người quên mất nó không?
Hay là anh chị vẫn đang tìm những người khác nhỉ?

Lâu quá... lâu quá rồi. Em bắt đầu thấy thật khó thở. Em lấy tay gõ liên tục vào cánh tủ.
Có ai không... Có ai ở gần đây không... Mở cửa cho em ra với...

Tự nhiên ngực em đau nhói. Hình như em lại phát bệnh tim rồi. Thuốc... Thuốc của em…
Còi... Chiếc còi của em đâu rồi... .

Em không cần thắng trò chơi này nữa đâu...
Anh Tùng ơi...Sao anh vẫn chưa đến tìm em....`,
  },
  1: {
    date: "HỒ SƠ GIAI ĐOẠN 1 // LỜI KHAI & HIỆN TRƯỜNG",
    monologue: "Cảnh sát bắt đầu tiếp nhận hiện trường và lấy lời khai ban đầu của các nhân chứng. Khang đã tử vong tại hiện trường, chiếc bình gốm vỡ vụn bên cạnh.",
  },
  2: {
    date: "HỒ SƠ GIAI ĐOẠN 2 // ĐIỀU TRA MỞ RỘNG",
    monologue: "Các mâu thuẫn trong lời khai dần lộ diện. Các mối quan hệ ngầm và dấu vết tài chính của nạn nhân bắt đầu được làm sáng tỏ.",
  },
  3: {
    date: "HỒ SƠ GIAI ĐOẠN 3 // KẾT ÁN",
    monologue: "Mọi mắt xích của vụ án đã được xâu chuỗi. Hãy chỉ ra hung thủ thực sự và động cơ gây án.",
  },
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
    return DEFAULT_NARRATIVES[phase] || null;
  };

  return {
    narratives,
    loading,
    refetch,
    getPhaseNarrative,
  };
}


