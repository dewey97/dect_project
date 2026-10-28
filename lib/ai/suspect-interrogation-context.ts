/**
 * Bối cảnh & Tiêu chí thẩm tra AI phân lập theo từng đối tượng và từng hạng mục.
 * Đảm bảo Zero-Spoiler và lấy 100% bối cảnh từ dữ liệu Checkpoint Studio / Supabase.
 */

export interface SuspectCategoryCriteria {
  context: string;
  validCases: { text: string; reason: string }[];
  invalidCases: { text: string; reason: string }[];
}

export interface SuspectCriteriaMap {
  motive?: SuspectCategoryCriteria;
  contradiction?: SuspectCategoryCriteria;
}

/**
 * Trả về bối cảnh thẩm tra động cho bất kỳ nghi phạm nào.
 * 100% dữ liệu lấy từ cấu hình Checkpoint (aiContext, aiValidCases, aiInvalidCases, pickerConfig).
 * Chỉ chạy ở server (`/api/scan-answer`); tiêu chí không gửi xuống client.
 */
export function getInterrogationCriteria(
  suspectId: string,
  category: "motive" | "contradiction",
  checkpointData?: {
    title?: string;
    question?: string;
    hint?: string;
    aiContext?: string;
    aiValidCases?: string[];
    aiInvalidCases?: string[];
    motiveContext?: string;
    contradictionContext?: string;
  },
): SuspectCategoryCriteria {
  const categoryLabel =
    category === "motive" ? "Động cơ gây án" : "Mâu thuẫn lời khai";

  // 1. Ưu tiên cao nhất: Bối cảnh riêng biệt từng hạng mục được biên soạn trong Checkpoint Studio
  const specificCategoryContext =
    category === "motive"
      ? checkpointData?.motiveContext?.trim()
      : checkpointData?.contradictionContext?.trim();

  if (specificCategoryContext) {
    return {
      context:
        `${specificCategoryContext}\n` +
        `Nghi phạm: ${suspectId}. Hạng mục thẩm tra: ${categoryLabel}.`,
      validCases: (checkpointData?.aiValidCases || []).map((text) => ({
        text,
        reason: "",
      })),
      invalidCases: (checkpointData?.aiInvalidCases || []).map((text) => ({
        text,
        reason: "",
      })),
    };
  }

  // 2. Bối cảnh chung aiContext từ Checkpoint (đã biên soạn trong DB)
  if (checkpointData?.aiContext?.trim()) {
    return {
      context:
        `${checkpointData.aiContext.trim()}\n` +
        `Nghi phạm: ${suspectId}. Hạng mục thẩm tra: ${categoryLabel}.`,
      validCases: (checkpointData.aiValidCases || []).map((text) => ({
        text,
        reason: "",
      })),
      invalidCases: (checkpointData.aiInvalidCases || []).map((text) => ({
        text,
        reason: "",
      })),
    };
  }

  // 3. Fallback tổng quát cho các nhân vật phụ hoặc khi chưa nạp xong
  const baseTitle = checkpointData?.title || `Thẩm tra ${categoryLabel}`;
  const baseQuestion =
    checkpointData?.question ||
    `Xác minh ${categoryLabel} của đối tượng trong vụ án.`;

  return {
    context: `Nghi phạm: ${suspectId}. Hạng mục thẩm tra: ${categoryLabel}.\nTiêu điểm điều tra: ${baseTitle}. ${baseQuestion}\nYêu cầu: Lời giải thích của người chơi phải chỉ rõ đối tượng, đưa ra lý do và căn cứ hợp lý, không được phán đoán vu vơ.`,
    validCases: [],
    invalidCases: [
      {
        text: "Đối tượng này không liên quan hoặc người hiền lành",
        reason: "Nhận xét cảm tính, không có căn cứ chứng minh",
      },
    ],
  };
}
