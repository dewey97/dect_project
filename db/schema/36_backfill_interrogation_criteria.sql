-- ==============================================================================
-- 36. BACKFILL INTERROGATION CRITERIA & PHONE INPUTS (Case 000)
-- ==============================================================================
-- Mục tiêu:
-- 1. Bổ sung `textMatchInputs` vào `answer_config` của `cp-000-0` để server-grader
--    chấm điểm phone lookup hoàn toàn từ DB, bỏ fallback tĩnh trong mã nguồn.
-- 2. Backfill bối cảnh thẩm tra (`motiveContext`, `alibiContext`, `contradictionContext`)
--    và các mẫu AI check (`ai_context`, `ai_valid_cases`, `ai_invalid_cases`) cho
--    các checkpoint thẩm tra đối tượng (`cp-000-1a`, `cp-000-1b`, `cp-000-1c`).
-- ==============================================================================

-- 1. Checkpoint Tra cứu SĐT: cp-000-0
UPDATE public.case_checkpoints
SET answer_config = jsonb_set(
  COALESCE(answer_config, '{}'::jsonb),
  '{textMatchInputs}',
  '[
    {
      "id": "phone1",
      "label": "SĐT 0988.200.991:",
      "placeholder": "Nhập tên nghi phạm...",
      "validAnswers": ["vu", "le quang vu", "vũ", "lê quang vũ"]
    },
    {
      "id": "phone2",
      "label": "SĐT 0912.331.888:",
      "placeholder": "Nhập tên nghi phạm...",
      "validAnswers": ["tung", "nguyen thanh tung", "tùng", "nguyễn thanh tùng"]
    },
    {
      "id": "phone3",
      "label": "SĐT 0984.180.357:",
      "placeholder": "Nhập tên nghi phạm...",
      "validAnswers": ["dat", "dat ga", "tran van dat", "đạt", "đạt gà", "trần văn đạt"]
    }
  ]'::jsonb,
  true
)
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-0';

-- 2. Thẩm tra Lê Quang Vũ: cp-000-1a
UPDATE public.case_checkpoints
SET
  answer_config = jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(answer_config, '{}'::jsonb),
        '{motiveContext}',
        '"Lê Quang Vũ là em rể/chồng Mai. Vũ có động cơ gây án là đang nợ Nguyễn Văn Khang khoản tiền 300 triệu đồng (bốc họ/vay nặng lãi) thể hiện trong Sổ ghi nợ có chữ ký và biệt danh \"Lệch Pha\", đồng thời có các tin nhắn đòi nợ đe dọa từ Khang. Vũ đến nhà Khang lúc 19:00 xin khất nợ nhưng bị Khang đe dọa."'::jsonb,
        true
      ),
      '{alibiContext}',
      '"Lê Quang Vũ có bằng chứng ngoại phạm khách quan vững chắc: Sau khi xin khất nợ bất thành, Vũ rời khỏi nhà Khang lúc 19:25 bắt xe ôm ra Quán Bia 88. Vũ ngồi uống bia tại Quán Bia 88 từ 19:40 đến 21:15 có sổ chấm bia của chủ quán ghi nhận và chủ quán làm chứng. Án mạng xảy ra vào khoảng 21:00, thời điểm đó Vũ đang ở Quán Bia 88 nên không thể là thủ phạm giết Khang."'::jsonb,
      true
    ),
    '{contradictionContext}',
    '"Lời khai của Lê Quang Vũ ban đầu có mâu thuẫn: Vũ khai chỉ đến chơi rồi về nhà ngay, nhưng thực tế sổ nợ và lời khai của bà Lụa/chủ quán bia chứng minh Vũ nợ 300 triệu và hoảng loạn chạy ra quán bia uống đến đêm."'::jsonb,
    true
  ),
  ai_context = 'Lê Quang Vũ nợ Khang 300 triệu đồng bốc họ, rời hiện trường lúc 19:25 và uống ở Quán Bia 88 từ 19:40 đến 21:15 (có sổ chấm bia).',
  ai_valid_cases = '[
    "Vũ nợ Khang 300 triệu trong sổ nợ với biệt danh Lệch Pha và bị Khang nhắn tin đe dọa đòi tiền",
    "Vũ bốc bát họ 300 triệu của Khang không có tiền trả nên đến xin khất nợ bị đe dọa",
    "Vũ ngoại phạm vì lúc 21h án mạng xảy ra anh ta đang ngồi uống ở Quán Bia 88 có sổ chấm bia của chủ quán làm chứng từ 19h40 đến 21h15",
    "Vũ rời nhà Khang từ 19:25 ra quán bia 88 uống tới hơn 21h có chủ quán xác nhận",
    "Vũ giấu chuyện nợ nần 300 triệu và nói dối về thời gian rời đi"
  ]'::jsonb,
  ai_invalid_cases = '[
    "Vũ ghét Khang nên muốn giết",
    "Vũ muốn cướp đất 200m2 của Khang",
    "Vũ ở nhà với vợ suốt đêm",
    "Vũ không giết người vì là người hiền lành",
    "Vũ nói dối là không quen Khang"
  ]'::jsonb
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1a';

-- 3. Thẩm tra Nguyễn Thanh Tùng: cp-000-1b
UPDATE public.case_checkpoints
SET
  answer_config = jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(answer_config, '{}'::jsonb),
        '{motiveContext}',
        '"Nguyễn Thanh Tùng ôm hận thù Khang suốt 20 năm qua. Ngày 24/07/1996, trong trò chơi trốn tìm, Khang đã gài then cài ngoài tủ gỗ nhốt bé Gia Huy (em trai Tùng) khiến Gia Huy ngạt thở tử vong. Đêm 24/07/2016 đúng ngày giỗ 20 năm của Gia Huy, Tùng mang mẩu báo cũ năm 1996 sang bắt Khang phải tạ tội. Mối quan hệ và bi kịch này được nhân chứng là ông Tiến/bác Tiến nhắc đến."'::jsonb,
        true
      ),
      '{alibiContext}',
      '"Tùng có mặt tại nhà Khang khoảng 20:00 - 20:15 và xảy ra xô xát làm Khang ngã đập đầu vỡ bình trà ngất xỉu. Tùng tưởng Khang đã chết nên hoảng sợ bỏ chạy lúc 20:15 về Cầu Bươu. Tuy nhiên giám định pháp y kết luận Khang chết vào khoảng 21:00 do vết cắt đứt động mạch cảnh bởi mảnh sành. Thời điểm Tùng bỏ đi lúc 20:15 Khang mới chỉ bị ngất xỉu chứ chưa tử vong."'::jsonb,
      true
    ),
    '{contradictionContext}',
    '"Tùng ban đầu chối không sang nhà Khang, nhưng dấu vân tay trên khung ảnh kỷ niệm bị vỡ và mẩu báo năm 1996 bỏ lại hiện trường đã tố cáo Tùng có mặt và xô xát với nạn nhân."'::jsonb,
    true
  ),
  ai_context = 'Nguyễn Thanh Tùng đòi nợ máu cho em trai Gia Huy (chết trong tủ gỗ 20 năm trước). Tùng xô xát lúc 20:15 làm Khang ngất xỉu rồi bỏ chạy về Cầu Bươu; án mạng thực sự xảy ra lúc 21:00 do đâm mảnh sành.',
  ai_valid_cases = '[
    "Tùng là anh trai Gia Huy - cậu bé chết ngạt trong tủ gỗ 20 năm trước do trò trốn tìm của Khang, theo lời ông Tiến kể",
    "Tùng sang đòi công lý cho em trai Gia Huy chết oan trong tủ gỗ năm 1996 ngày giỗ 20 năm",
    "Tùng là anh Huy do ông Tiến nhắc đến",
    "Tùng xô Khang ngất xỉu lúc 20:00 rồi hoảng sợ bỏ chạy lúc 20:15, nhưng pháp y xác định nạn nhân chết lúc 21:00 do bị đâm đứt động mạch cổ",
    "Tùng đã bỏ đi từ 20h15 về Cầu Bươu trước khi Khang bị đâm chết lúc 21h",
    "Tùng khai không đến nhưng dấu vân tay trên khung ảnh và mẩu báo 1996 chứng minh Tùng có mặt"
  ]'::jsonb,
  ai_invalid_cases = '[
    "Tùng là anh cậu bé chết hồi trước",
    "Tùng giết Khang để cướp tiền xây nhà",
    "Tùng không có mặt ở hiện trường đêm đó",
    "Tùng nhận tội ngay từ đầu"
  ]'::jsonb
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1b';

-- 4. Thẩm tra Trần Thị Hà: cp-000-1c
UPDATE public.case_checkpoints
SET
  answer_config = jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(answer_config, '{}'::jsonb),
        '{motiveContext}',
        '"Trần Thị Hà là người yêu/kế toán của Khang. Hà phát hiện Khang lén lút quan hệ tình cảm với Thảo Vy qua tin nhắn trên điện thoại iPhone 6s Plus (dùng Touch ID vân tay mở khóa khi Khang ngất). Trong tin nhắn, Khang và Thảo Vy lên kế hoạch bay chuyến bay 06:15 đi Đà Lạt và bỏ rơi Hà. Cơn ghen tuông cùng cảm giác bị phản bội đã thúc đẩy Hà ra tay sát hại Khang lúc 21:00."'::jsonb,
        true
      ),
      '{alibiContext}',
      '"Hà khai báo ngoại phạm là ở nhà xem phim VTV3 từ 20:00 đến 21:30. Tuy nhiên bằng chứng bóc trần ngoại phạm: Tin nhắn thoại (voice message) gửi lúc 20:32 bị lọt tiếng còi tàu hỏa (chỉ có ở đoạn đường tàu gần nhà Khang lúc 20:30) và phấn hoa xoan bám trên áo ngực của Hà (trùng với cây xoan trước cổng nhà Khang nơi Hà đứng rình từ 19:25)."'::jsonb,
      true
    ),
    '{contradictionContext}',
    '"Hà khai không hề đến nhà Khang đêm đó, nhưng lọn tóc mai dính máu của Khang giấu trong áo ngực cùng vết máu bắn trên quần áo đã vạch trần việc Hà trực tiếp ra tay đâm Khang lúc 21:00."'::jsonb,
    true
  ),
  ai_context = 'Trần Thị Hà ghen tuông vì Khang phản bội đi Đà Lạt với Thảo Vy. Ngoại phạm VTV3 bị bóc trần bởi tiếng còi tàu 20:32 và phấn hoa xoan. Hà trực tiếp sát hại Khang lúc 21:00 và giấu lọn tóc dính máu.',
  ai_valid_cases = '[
    "Hà mở điện thoại Khang phát hiện tin nhắn Khang lăng nhăng hẹn trốn đi Đà Lạt với Thảo Vy chuyến 6h15",
    "Hà ghen tuông vì bị Khang phản bội bỏ rơi để đi với bồ nhí Thảo Vy",
    "Ngoại phạm xem tivi VTV3 là giả vì trong tin nhắn thoại lúc 20:32 có lọt tiếng còi tàu hỏa và trên áo có phấn hoa xoan trước cổng nhà Khang",
    "Hà không ở nhà xem phim mà đứng rình dưới cây xoan nhà Khang lọt tiếng còi tàu lúc 20:32",
    "Hà khai không đến hiện trường nhưng lọn tóc dính máu giấu trong áo ngực và ADN đã tố cáo Hà"
  ]'::jsonb,
  ai_invalid_cases = '[
    "Hà giết Khang vì Khang nợ tiền công ty",
    "Hà có ngoại phạm chuẩn không ai phủ nhận được",
    "Hà để quên chìa khóa nhà"
  ]'::jsonb
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1c';
