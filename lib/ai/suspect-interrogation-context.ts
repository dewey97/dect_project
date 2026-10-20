/**
 * Bối cảnh & Tiêu chí thẩm tra AI phân lập theo từng đối tượng và từng hạng mục.
 * Đảm bảo Zero-Spoiler (không lộ plot twist của nhân vật khác) và hỗ trợ Few-Shot Learning.
 */

export interface SuspectCategoryCriteria {
  context: string;
  validCases: { text: string; reason: string }[];
  invalidCases: { text: string; reason: string }[];
}

export interface SuspectCriteriaMap {
  motive?: SuspectCategoryCriteria;
  alibi?: SuspectCategoryCriteria;
  contradiction?: SuspectCategoryCriteria;
}

export const CASE_000_INTERROGATION_CRITERIA: Record<
  string,
  SuspectCriteriaMap
> = {
  // 1. LÊ QUANG VŨ
  vu: {
    motive: {
      context: `Lê Quang Vũ là em rể/chồng Mai. Vũ có động cơ gây án là đang nợ Nguyễn Văn Khang khoản tiền 300 triệu đồng (bốc họ/vay nặng lãi) thể hiện trong Sổ ghi nợ có chữ ký và biệt danh "Lệch Pha", đồng thời có các tin nhắn đòi nợ đe dọa từ Khang. Vũ đến nhà Khang lúc 19:00 xin khất nợ nhưng bị Khang đe dọa.`,
      validCases: [
        {
          text: "Vũ nợ Khang 300 triệu trong sổ nợ với biệt danh Lệch Pha và bị Khang nhắn tin đe dọa đòi tiền",
          reason: "Chỉ rõ khoản nợ 300 triệu, sổ nợ và tin nhắn đòi nợ",
        },
        {
          text: "Vũ bốc bát họ 300 triệu của Khang không có tiền trả nên đến xin khất nợ bị đe dọa",
          reason: "Nêu đúng bản chất khoản nợ và cuộc cãi vã lúc 19:00",
        },
      ],
      invalidCases: [
        {
          text: "Vũ ghét Khang nên muốn giết",
          reason:
            "Cảm tính, không nêu được nguồn gốc khoản nợ 300M hay tài liệu chứng cứ",
        },
        {
          text: "Vũ muốn cướp đất 200m2 của Khang",
          reason: "Nhầm lẫn động cơ tranh chấp đất của Mai sang Vũ",
        },
      ],
    },
    alibi: {
      context: `Lê Quang Vũ có bằng chứng ngoại phạm khách quan vững chắc: Sau khi xin khất nợ bất thành, Vũ rời khỏi nhà Khang lúc 19:25 bắt xe ôm ra Quán Bia 88. Vũ ngồi uống bia tại Quán Bia 88 từ 19:40 đến 21:15 có sổ chấm bia của chủ quán ghi nhận và chủ quán làm chứng. Án mạng xảy ra vào khoảng 21:00, thời điểm đó Vũ đang ở Quán Bia 88 nên không thể là thủ phạm giết Khang.`,
      validCases: [
        {
          text: "Vũ ngoại phạm vì lúc 21h án mạng xảy ra anh ta đang ngồi uống ở Quán Bia 88 có sổ chấm bia của chủ quán làm chứng từ 19h40 đến 21h15",
          reason:
            "Khớp mốc giờ án mạng 21h và địa điểm Quán bia 88 có sổ chấm bia xác nhận",
        },
        {
          text: "Vũ rời nhà Khang từ 19:25 ra quán bia 88 uống tới hơn 21h có chủ quán xác nhận",
          reason: "Nêu đúng thời điểm rời đi và chứng cứ quán bia",
        },
      ],
      invalidCases: [
        {
          text: "Vũ ở nhà với vợ suốt đêm",
          reason: "Sai sự thật, Vũ không ở nhà",
        },
        {
          text: "Vũ không giết người vì là người hiền lành",
          reason: "Cảm tính, không có mốc thời gian hay địa điểm ngoại phạm",
        },
      ],
    },
    contradiction: {
      context: `Lời khai của Lê Quang Vũ ban đầu có mâu thuẫn: Vũ khai chỉ đến chơi rồi về nhà ngay, nhưng thực tế sổ nợ và lời khai của bà Lụa/chủ quán bia chứng minh Vũ nợ 300 triệu và hoảng loạn chạy ra quán bia uống đến đêm.`,
      validCases: [
        {
          text: "Vũ giấu chuyện nợ nần 300 triệu và nói dối về thời gian rời đi",
          reason: "Chỉ rõ việc che giấu khoản nợ và mâu thuẫn lịch trình",
        },
      ],
      invalidCases: [
        {
          text: "Vũ nói dối là không quen Khang",
          reason: "Sai lệch hoàn toàn nội dung lời khai",
        },
      ],
    },
  },

  // 2. NGUYỄN THANH TÙNG
  tung: {
    motive: {
      context: `Nguyễn Thanh Tùng ôm hận thù Khang suốt 20 năm qua. Ngày 24/07/1996, trong trò chơi trốn tìm, Khang đã gài then cài ngoài tủ gỗ nhốt bé Gia Huy (em trai Tùng) khiến Gia Huy ngạt thở tử vong. Đêm 24/07/2016 đúng ngày giỗ 20 năm của Gia Huy, Tùng mang mẩu báo cũ năm 1996 sang bắt Khang phải tạ tội. Mối quan hệ và bi kịch này được nhân chứng là ông Tiến/bác Tiến nhắc đến.`,
      validCases: [
        {
          text: "Tùng là anh trai Gia Huy - cậu bé chết ngạt trong tủ gỗ 20 năm trước do trò trốn tìm của Khang, theo lời ông Tiến kể",
          reason:
            "Đầy đủ quan hệ anh em, nguyên nhân cái chết trong tủ gỗ và nhân chứng ông Tiến",
        },
        {
          text: "Tùng sang đòi công lý cho em trai Gia Huy chết oan trong tủ gỗ năm 1996 ngày giỗ 20 năm",
          reason: "Nêu đúng mối hận 20 năm ngày giỗ và bi kịch tủ gỗ",
        },
        {
          text: "Tùng là anh Huy do ông Tiến nhắc đến",
          reason: "Có quan hệ anh em và viện dẫn đúng nhân chứng ông Tiến",
        },
      ],
      invalidCases: [
        {
          text: "Tùng là anh cậu bé chế hồi trước",
          reason:
            "Nói quá chung chung mù mờ, không tên, không nhân chứng, không rõ hoàn cảnh",
        },
        {
          text: "Tùng giết Khang để cướp tiền xây nhà",
          reason: "Bịa đặt động cơ không có trong hồ sơ",
        },
      ],
    },
    alibi: {
      context: `Tùng có mặt tại nhà Khang khoảng 20:00 - 20:15 và xảy ra xô xát làm Khang ngã đập đầu vỡ bình trà ngất xỉu. Tùng tưởng Khang đã chết nên hoảng sợ bỏ chạy lúc 20:15 về Cầu Bươu. Tuy nhiên giám định pháp y kết luận Khang chết vào khoảng 21:00 do vết cắt đứt động mạch cảnh bởi mảnh sành. Thời điểm Tùng bỏ đi lúc 20:15 Khang mới chỉ bị ngất xỉu chứ chưa tử vong.`,
      validCases: [
        {
          text: "Tùng xô Khang ngất xỉu lúc 20:00 rồi hoảng sợ bỏ chạy lúc 20:15, nhưng pháp y xác định nạn nhân chết lúc 21:00 do bị đâm đứt động mạch cổ",
          reason:
            "Phân biệt rõ thời điểm Tùng rời đi 20:15 và mốc tử vong 21:00",
        },
        {
          text: "Tùng đã bỏ đi từ 20h15 về Cầu Bươu trước khi Khang bị đâm chết lúc 21h",
          reason: "Nêu đúng mốc giờ rời đi trước khi án mạng thực sự xảy ra",
        },
      ],
      invalidCases: [
        {
          text: "Tùng không có mặt ở hiện trường đêm đó",
          reason: "Sai sự thật, Tùng có mặt và để lại dấu vân tay",
        },
      ],
    },
    contradiction: {
      context: `Tùng ban đầu chối không sang nhà Khang, nhưng dấu vân tay trên khung ảnh kỷ niệm bị vỡ và mẩu báo năm 1996 bỏ lại hiện trường đã tố cáo Tùng có mặt và xô xát với nạn nhân.`,
      validCases: [
        {
          text: "Tùng khai không đến nhưng dấu vân tay trên khung ảnh và mẩu báo 1996 chứng minh Tùng có mặt",
          reason: "Bóc trần mâu thuẫn bằng dấu vân tay và mẩu báo hiện trường",
        },
      ],
      invalidCases: [
        {
          text: "Tùng nhận tội ngay từ đầu",
          reason: "Sai thực tế lời khai",
        },
      ],
    },
  },

  // 3. TRẦN THỊ HÀ (HUNG THỦ THỰC SỰ)
  ha: {
    motive: {
      context: `Trần Thị Hà là người yêu/kế toán của Khang. Hà phát hiện Khang lén lút quan hệ tình cảm với Thảo Vy qua tin nhắn trên điện thoại iPhone 6s Plus (dùng Touch ID vân tay mở khóa khi Khang ngất). Trong tin nhắn, Khang và Thảo Vy lên kế hoạch bay chuyến bay 06:15 đi Đà Lạt và bỏ rơi Hà. Cơn ghen tuông cùng cảm giác bị phản bội đã thúc đẩy Hà ra tay sát hại Khang lúc 21:00.`,
      validCases: [
        {
          text: "Hà mở điện thoại Khang phát hiện tin nhắn Khang lăng nhăng hẹn trốn đi Đà Lạt với Thảo Vy chuyến 6h15",
          reason:
            "Chỉ rõ bằng chứng tin nhắn tình nhân trên điện thoại và chuyến bay đi Đà Lạt",
        },
        {
          text: "Hà ghen tuông vì bị Khang phản bội bỏ rơi để đi với bồ nhí Thảo Vy",
          reason: "Nêu đúng bản chất ghen tuông tình cảm và nhân vật Thảo Vy",
        },
      ],
      invalidCases: [
        {
          text: "Hà giết Khang vì Khang nợ tiền công ty",
          reason: "Bịa đặt động cơ tiền bạc, động cơ thực sự là ghen tuông",
        },
      ],
    },
    alibi: {
      context: `Hà khai báo ngoại phạm là ở nhà xem phim VTV3 từ 20:00 đến 21:30. Tuy nhiên bằng chứng bóc trần ngoại phạm: Tin nhắn thoại (voice message) gửi lúc 20:32 bị lọt tiếng còi tàu hỏa (chỉ có ở đoạn đường tàu gần nhà Khang lúc 20:30) và phấn hoa xoan bám trên áo ngực của Hà (trùng với cây xoan trước cổng nhà Khang nơi Hà đứng rình từ 19:25).`,
      validCases: [
        {
          text: "Ngoại phạm xem tivi VTV3 là giả vì trong tin nhắn thoại lúc 20:32 có lọt tiếng còi tàu hỏa và trên áo có phấn hoa xoan trước cổng nhà Khang",
          reason:
            "Chỉ rõ tiếng còi tàu lúc 20:32 và phấn hoa xoan bóc trần ngoại phạm VTV3",
        },
        {
          text: "Hà không ở nhà xem phim mà đứng rình dưới cây xoan nhà Khang lọt tiếng còi tàu lúc 20:32",
          reason: "Bóc trần ngoại phạm bằng tiếng còi tàu và cây xoan",
        },
      ],
      invalidCases: [
        {
          text: "Hà có ngoại phạm chuẩn không ai phủ nhận được",
          reason: "Không biết bóc trần ngoại phạm giả của thủ phạm",
        },
      ],
    },
    contradiction: {
      context: `Hà khai không hề đến nhà Khang đêm đó, nhưng lọn tóc mai dính máu của Khang giấu trong áo ngực cùng vết máu bắn trên quần áo đã vạch trần việc Hà trực tiếp ra tay đâm Khang lúc 21:00.`,
      validCases: [
        {
          text: "Hà khai không đến hiện trường nhưng lọn tóc dính máu giấu trong áo ngực và ADN đã tố cáo Hà",
          reason: "Chỉ rõ vật chứng lọn tóc dính máu giấu trong người",
        },
      ],
      invalidCases: [
        {
          text: "Hà để quên chìa khóa nhà",
          reason: "Sai chi tiết mâu thuẫn",
        },
      ],
    },
  },
};

/**
 * Trả về bối cảnh thẩm tra động cho bất kỳ nghi phạm nào.
 * Ưu tiên 1: Bối cảnh biên soạn trực tiếp trên Google Sheets Live CMS
 *            (các cột `ai_context`, `ai_valid_cases`, `ai_invalid_cases`).
 * Ưu tiên 2: Từ điển tĩnh chuyên biệt trong file này.
 * Ưu tiên 3: Bối cảnh tổng quát dựng từ title/question/hint của Checkpoint.
 */
export function getInterrogationCriteria(
  suspectId: string,
  category: "motive" | "alibi" | "contradiction",
  checkpointData?: {
    title?: string;
    question?: string;
    hint?: string;
    aiContext?: string;
    aiValidCases?: string[];
    aiInvalidCases?: string[];
  },
): SuspectCategoryCriteria {
  const normId = (suspectId || "").toLowerCase().trim();
  const custom = CASE_000_INTERROGATION_CRITERIA[normId]?.[category];
  const categoryLabel =
    category === "motive"
      ? "Động cơ gây án"
      : category === "alibi"
        ? "Xác minh ngoại phạm"
        : "Mâu thuẫn lời khai";

  // Live CMS ghi đè toàn bộ (không cần sửa code khi đổi kịch bản)
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

  if (custom) return custom;

  // Fallback tổng quát cho các nhân vật phụ khác (Mai, Đạt, Bà Lụa...)
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
