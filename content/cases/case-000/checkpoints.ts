import { Checkpoint } from '@/lib/types'

export const checkpoints000: Checkpoint[] = [
  {
    id: 'cp-000-0',
    caseId: 'case-000',
    title: 'Giai đoạn 0: Truy Tìm Danh Tính 3 Số Điện Thoại Ẩn Danh',
    question: 'Nhật ký cuộc gọi thu thập trên máy nạn nhân Khang (dev-00) có 3 SĐT lạ chưa lưu tên. Hãy đối chiếu Sổ ghi nợ 10 và Bảng tin rao vặt 11 để nhập đúng tên 3 nghi phạm chủ sở hữu:',
    hint: 'Đối chiếu SĐT 0988.20.09.91 (nợ 300M) ➔ Lê Quang Vũ; 0984.180.357 (tin rao VLXD) ➔ Nguyễn Thanh Tùng; 0912.331.888 (nợ 80M) ➔ Đạt Gà Chợ Cảng.',
    hintsList: [
      'Gợi ý 1: Tra cứu SĐT 0988.20.09.91 trong Sổ nợ 10 (con nợ 300M biệt danh "Lệch Pha").',
      'Gợi ý 2: Tra cứu SĐT 0984.180.357 trên Bảng tin 11 (tin rao đục phá bê tông em Tùng).',
      'Gợi ý 3: Nhập tên 3 đối tượng: Lê Quang Vũ, Nguyễn Thanh Tùng, Đạt Gà Chợ Cảng (hoặc Đạt Gà).'
    ],
    type: 'text_match_3',
    status: 'active',
    unlockedEvidenceId: 'f1-all-dossiers',
    textMatchConfig: {
      inputs: [
        {
          id: 'phone_1',
          label: 'SĐT 0988.20.09.91 (Gọi 18:15 — Nợ 300M):',
          placeholder: 'Nhập tên nghi phạm (VD: Lê Quang Vũ)...',
          validAnswers: ['Lê Quang Vũ', 'Vũ', 'Le Quang Vu', 'Vu']
        },
        {
          id: 'phone_2',
          label: 'SĐT 0984.180.357 (Gọi 19:00 — Rao VLXD):',
          placeholder: 'Nhập tên nghi phạm (VD: Nguyễn Thanh Tùng)...',
          validAnswers: ['Nguyễn Thanh Tùng', 'Tùng', 'Nguyen Thanh Tung', 'Tung']
        },
        {
          id: 'phone_3',
          label: 'SĐT 0912.331.888 (Gọi 20:09 — Nợ 80M):',
          placeholder: 'Nhập tên nghi phạm (VD: Đạt Gà Chợ Cảng)...',
          validAnswers: ['Đạt Gà Chợ Cảng', 'Đạt Gà', 'Đạt', 'Dat Ga Cho Cang', 'Dat Ga', 'Dat']
        }
      ]
    }
  },
  {
    id: 'cp-000-1a',
    caseId: 'case-000',
    title: 'Phase 1 — Tuyến A: Thẩm Tra Lê Quang Vũ (Món Nợ Bí Mật)',
    question: 'Thẩm tra Lê Quang Vũ dựa trên 2 tiêu chí điều tra: Động cơ nợ nần bí mật và Bằng chứng mâu thuẫn về mốc thời gian rời hiện trường.',
    hint: 'Vũ khai rời đi ngay cùng Mai lúc 19:00, nhưng app xe p10 chứng tỏ Vũ bấm đặt xe lúc 19:25:40 ➔ nán lại 30 phút. Chọn đủ 5 tài liệu/vật chứng.',
    hintsList: [
      'Gợi ý 1: Nhập tên nghi phạm là Lê Quang Vũ (hoặc Vũ).',
      'Gợi ý 2: Vũ nợ Khang 300M ("Lệch Pha" trong Sổ nợ 10 & SMS dev-00, khớp ảnh p6).',
      'Gợi ý 3: Chọn 5 tài liệu: Sổ nợ (10), SMS (dev-00), Ảnh Vũ (p6), Lời khai bà Lụa (06/11), App đặt xe (p10).'
    ],
    type: 'evidence_picker',
    status: 'locked',
    unlockedEvidenceId: 'f2-loi-khai-2-vu',
    pickerConfig: {
      suspectLabel: 'Bước 1: Nhập tên nghi phạm thẩm tra:',
      validSuspects: ['Lê Quang Vũ', 'Vũ', 'Le Quang Vu', 'Vu'],
      evidenceStepLabel: 'Bước 2: Chọn 5 tài liệu & vật chứng chứng minh động cơ & mâu thuẫn ngoại phạm:',
      requiredEvidenceIds: ['doc_10_so_no', 'sms_dev00', 'p6_anh_vu', 'doc_06_loi_khai_lua', 'p10_app_xe'],
      availableEvidences: [
        { id: 'doc_10_so_no', label: 'Sổ tay ghi nợ của Khang', code: '10 / 05', description: 'Khoản nợ 300M biệt danh Lệch Pha' },
        { id: 'sms_dev00', label: 'SMS đòi nợ trên điện thoại Khang', code: 'dev-00', description: 'SMS đe dọa báo gia đình vợ Vũ' },
        { id: 'p6_anh_vu', label: 'Ảnh chân dung Lê Quang Vũ', code: 'p6', description: 'Kỹ sư điện, mắt trái lác nhẹ' },
        { id: 'doc_06_loi_khai_lua', label: 'Lời khai bà Lụa', code: '06 / 11', description: 'Mai nổ máy xe phóng đi đúng 19:00' },
        { id: 'p10_app_xe', label: 'Screenshot App đặt xe của Vũ', code: 'p10', description: 'Đặt xe lúc 19:25:40, tài xế đón 19:30:15' },
        { id: 'doc_13_don_dat', label: 'Đơn khởi kiện tranh chấp đất đai', code: '13 / p2', description: 'Đơn đòi đất 200m² của Mai' },
        { id: 'p4_anh_ky_niem', label: 'Ảnh kỷ niệm xóm Bờ Sông 1996', code: 'p4', description: 'Ảnh kỷ niệm nhóm trẻ xóm Bờ Sông' }
      ]
    }
  },
  {
    id: 'cp-000-1b',
    caseId: 'case-000',
    title: 'Phase 1 — Tuyến B: Thẩm Tra Nguyễn Thanh Tùng (Bi Kịch 1996)',
    question: 'Thẩm tra Nguyễn Thanh Tùng dựa trên mâu thuẫn giữa lời khai chối bỏ gặp mặt với dấu vết hiện trường và động cơ thù hận từ bi kịch 1996.',
    hint: 'Tùng khai chỉ gọi điện lúc 19:55 không gặp mặt, nhưng dấu vân tay trên khung ảnh p4 trùng khớp 100% với Tùng. Chọn đủ 4 chứng cứ.',
    hintsList: [
      'Gợi ý 1: Nhập tên nghi phạm hiện trường là Nguyễn Thanh Tùng (hoặc Tùng).',
      'Gợi ý 2: Tùng là anh trai bé Gia Huy tử vong trong tủ gỗ chiều 24/07/1996 (mẩu báo p5).',
      'Gợi ý 3: Chọn 4 chứng cứ: Lời khai Tùng (14), Vân tay khung ảnh (p4), Mảnh báo 1996 (p5), Ảnh kỷ niệm 1996 (p4).'
    ],
    type: 'evidence_picker',
    status: 'locked',
    unlockedEvidenceId: 'f2-tu-thu-tung',
    pickerConfig: {
      suspectLabel: 'Bước 1: Nhập tên nghi phạm hiện trường:',
      validSuspects: ['Nguyễn Thanh Tùng', 'Tùng', 'Nguyen Thanh Tung', 'Tung'],
      evidenceStepLabel: 'Bước 2: Chọn 4 tài liệu & vật chứng bóc trần lời khai chối bỏ:',
      requiredEvidenceIds: ['doc_14_loi_khai_tung', 'p4_van_tay', 'p5_manh_bao', 'p4_anh_1996'],
      availableEvidences: [
        { id: 'doc_14_loi_khai_tung', label: 'Lời khai Nguyễn Thanh Tùng lần 1', code: '14', description: 'Khai chỉ gọi điện 19:55, không sang gặp Khang' },
        { id: 'p4_van_tay', label: 'Dấu vân tay trên khung bức ảnh vỡ', code: 'p4', description: 'Dấu vân tay ngón trỏ miết trùng 100% với Tùng' },
        { id: 'p5_manh_bao', label: 'Mảnh báo cũ 1996 xé vụn ghép lại', code: 'p5', description: 'Vụ tai nạn ngạt khí tử vong bé N.G.H trong tủ gỗ' },
        { id: 'p4_anh_1996', label: 'Ảnh kỷ niệm hè 1996', code: 'p4', description: 'Tùng bế em trai Gia Huy, sẹo mày chữ V' },
        { id: 'doc_10_so_no', label: 'Sổ tay ghi nợ của Khang', code: '10', description: 'Danh sách con nợ bốc họ' },
        { id: 'p10_app_xe', label: 'Screenshot App đặt xe', code: 'p10', description: 'Lịch sử chuyến xe của Vũ' }
      ]
    }
  },
  {
    id: 'cp-000-convergence',
    caseId: 'case-000',
    title: '🔑 Nút Hội Tụ: Loại Trừ 3 Nghi Phạm Ban Đầu & Khám Xét Lại',
    question: 'Xác nhận lý do & bằng chứng loại trừ 3 nghi phạm ban đầu (Mai, Vũ, Tùng) khỏi diện hung thủ đâm chết Khang lúc ~21:00 để kích hoạt Lệnh khám xét lại hiện trường:',
    hint: 'Mai ở nhàxem TV bị đứt cáp quang 20:10; Vũ nhậu ở Quán Bia 88 lúc 21:15; Tùng tự thú xô ngã 20:00 rồi bỏ chạy 20:15 khi Khang chưa bị đâm.',
    hintsList: [
      'Gợi ý 1: Mai có ngoại phạm khách quan ở Phố Đoàn Kết (xem TV bị đứt cáp 20:10).',
      'Gợi ý 2: Vũ có chuyển khoản 195k tại Quán Bia 88 lúc 21:15 cách hiện trường 3.8km.',
      'Gợi ý 3: Tùng tự thú xô Khang ngất lúc 20:00 rồi bỏ chạy 20:15; thương tích chí mạng đâm cổ diễn ra lúc ~21:00.'
    ],
    type: 'convergence',
    status: 'locked',
    unlockedEvidenceId: 'f3-lenh-kham-xet',
    convergenceConfig: {
      suspects: [
        {
          id: 'mai',
          name: '1. Nguyễn Ngọc Mai',
          validReasons: ['mai_alibi_tv'],
          reasonOptions: [
            'Ngoại phạm xem TV tại nhà Phố Đoàn Kết, gặp sự cố đứt cáp quang lúc 20:10 (Lời khai Mai 12 + Bảng tin 18)',
            'Không có động cơ tranh chấp đất đai với nạn nhân',
            'Được bà Lụa làm chứng có mặt ở Quán Bia 88 lúc 21:00'
          ]
        },
        {
          id: 'vu',
          name: '2. Lê Quang Vũ',
          validReasons: ['vu_alibi_pub'],
          reasonOptions: [
            'Thanh toán chuyển khoản 195k tại Quán Bia 88 lúc 21:15 cách hiện trường 3.8km (Lời khai Vũ 2 + Sổ Quán Bia 88)',
            'Được tài xế xe ôm xác nhận ở lại nhà Khang suốt đêm',
            'Không có mâu thuẫn tiền bạc hay vay mượn gì với Khang'
          ]
        },
        {
          id: 'tung',
          name: '3. Nguyễn Thanh Tùng',
          validReasons: ['tung_confession_left'],
          reasonOptions: [
            'Tự thú xô ngã nạn nhân ngất lúc 20:00 rồi bỏ đi lúc 20:15; thương tích đâm cổ chết xảy ra sau đó lúc ~21:00 (Thẻ tự thú 01)',
            'Có chứng cứ ngoại phạm bán hàng ở Chợ Cảng từ 18:00 đến 22:00',
            'Đã hòa giải xong mâu thuẫn 1996 và đi nhậu cùng bạn bè'
          ]
        }
      ]
    }
  },
  {
    id: 'cp-000-2a',
    caseId: 'case-000',
    title: 'Phase 2 — Tuyến C: Bóc Trần Ngoại Phạm Trần Thị Hà',
    question: 'Bóc trần lời khai ngoại phạm giả mạo xem phim bộ VTV3 tại phòng trọ của nghi phạm Trần Thị Hà:',
    hint: 'Hà khai ở phòng trọ xem VTV3, nhưng voice 20:32 lọt tiếng còi tàu gác chắn (khoảng cách <30m trước nhà Khang) và VTV3 tối thứ Sáu chỉ phát Gameshow.',
    hintsList: [
      'Gợi ý 1: Nhập tên nghi phạm là Trần Thị Hà (hoặc Hà).',
      'Gợi ý 2: Loại mâu thuẫn là Mâu thuẫn Địa điểm (khai ở phòng trọ nhưng thực chất đứng rình trước cổng nhà Khang).',
      'Gợi ý 3: Tài liệu bẻ gãy lời khai: Voice tin nhắn 20:32 (lọt còi tàu) + Lịch phát sóng VTV3 (Gameshow).'
    ],
    type: 'evidence_picker',
    status: 'locked',
    unlockedEvidenceId: 'f4-kham-xet-phong-ha',
    pickerConfig: {
      suspectLabel: 'Bước 1: Nhập tên nghi phạm:',
      validSuspects: ['Trần Thị Hà', 'Hà', 'Tran Thi Ha', 'Ha'],
      mismatchTypeLabel: 'Bước 2: Chọn loại mâu thuẫn trong lời khai:',
      validMismatchTypes: ['mismatch_location'],
      mismatchTypeOptions: [
        '📍 Mâu thuẫn Địa điểm (Khai ở phòng trọ nhưng thực chất có mặt trước cổng nhà Khang)',
        '🕒 Mâu thuẫn Nhân dạng (Khai mặc áo dài nhưng mặc áo bảo hộ)',
        '💰 Mâu thuẫn Tiền bạc (Khai không vay mượn nhưng nợ 300 triệu)'
      ],
      evidenceStepLabel: 'Bước 3: Chọn 2 tài liệu bẻ gãy lời khai ngoại phạm:',
      requiredEvidenceIds: ['doc_voice_coi_tau', 'doc_lich_vtv3'],
      availableEvidences: [
        { id: 'doc_voice_coi_tau', label: 'Voice tin nhắn thoại của Hà (20:32)', code: '01', description: 'Lọt tạp âm còi tàu gác chắn HBN-203 cường độ 68 dB' },
        { id: 'doc_lich_vtv3', label: 'Lịch phát sóng VTV3 tối Thứ Sáu', code: '02', description: 'VTV3 chỉ phát Gameshow Trò chơi truyền hình, không chiếu phim bộ' },
        { id: 'p10_app_xe', label: 'Screenshot App đặt xe', code: 'p10', description: 'Lịch sử chuyến xe của Vũ' },
        { id: 'doc_10_so_no', label: 'Sổ tay ghi nợ của Khang', code: '10', description: 'Danh sách nợ bốc họ' }
      ]
    }
  },
  {
    id: 'cp-000-2b',
    caseId: 'case-000',
    title: 'Phase 2 — Bản Cáo Trạng Định Tội & Bắt Giữ Thủ Phạm',
    question: 'Lập Bản Cáo Trạng Định Tội chính thức kết án thủ phạm gây ra cái chết của Nguyễn Văn Khang:',
    hint: 'Chỉ danh thủ phạm Trần Thị Hà; động cơ ghen tuông cuồng loạn do Khang chuẩn bị tiền bỏ trốn với bồ mới; bộ chứng cứ chí mạng là Lọn tóc mai ADN & Áo gió dính phấn hoa.',
    hintsList: [
      'Gợi ý 1: Thủ phạm là Trần Thị Hà.',
      'Gợi ý 2: Động cơ: Cuồng yêu, ghen tuông bệnh hoạn khi mở điện thoại phát hiện Khang chuẩn bị tiền bỏ trốn với bồ mới Thảo Vy.',
      'Gợi ý 3: Bộ chứng cứ chí mạng: Lọn tóc mai dính máu (EV-HAIR-DNA) + Áo gió dính phấn hoa xoan (03).'
    ],
    type: 'accusation',
    status: 'locked',
    unlockedEvidenceId: 'rewards-case-000',
    pickerConfig: {
      suspectLabel: 'Bước 1: Chỉ danh thủ phạm chính:',
      validSuspects: ['Trần Thị Hà', 'Hà', 'Tran Thi Ha', 'Ha', 'ha'],
      motiveLabel: 'Bước 2: Xác định động cơ gây án thực sự:',
      validMotives: ['motive_jealousy'],
      mismatchTypeOptions: [
        'Cuồng yêu, ghen tuông bệnh hoạn khi mở điện thoại phát hiện Khang chuẩn bị tiền bỏ trốn với bồ mới',
        'Tranh chấp quyền thừa kế mảnh đất 200m² của gia đình',
        'Đòi lại món nợ tín dụng đen 300 triệu đồng',
        'Trả thù cho bi kịch vụ án nhốt tủ gỗ năm 1996'
      ],
      evidenceStepLabel: 'Bước 3: Chọn bộ vật chứng buộc tội chí mạng:',
      requiredEvidenceIds: ['ev_hair_dna', 'ev_ao_gio_xoan'],
      availableEvidences: [
        { id: 'ev_hair_dna', label: 'Lọn tóc mai dính máu thu tại phòng Hà', code: '04 / EV-HAIR-DNA', description: 'Kết quả giám định khớp 100% ADN của Khang' },
        { id: 'ev_ao_gio_xoan', label: 'Áo gió xám đen dính phấn hoa xoan', code: '03', description: 'Thu giữ tại phòng Hà, khớp nhân dạng rình rập trước cổng' },
        { id: 'doc_13_don_dat', label: 'Đơn khởi kiện đòi đất', code: '13', description: 'Tranh chấp đất đai của Mai' },
        { id: 'p5_manh_bao', label: 'Mảnh báo cũ 1996', code: 'p5', description: 'Vụ án tủ gỗ 1996' }
      ]
    }
  }
]
