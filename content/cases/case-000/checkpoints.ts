import { Checkpoint } from '@/lib/types'

export const checkpoints000: Checkpoint[] = [
  {
    id: 'cp-000-0',
    caseId: 'case-000',
    title: 'Truy Tìm Danh Tính 3 Số Điện Thoại Ẩn Danh',
    question: 'Hãy đọc các tài liệu Hồ sơ (Sổ nợ 10, Bảng tin 11) và tra cứu Điện thoại nạn nhân Khang (Call Log dev-00) để xác định danh tính 3 nghi phạm liên quan đến 3 SĐT lạ gọi tới trong đêm 24/07:',
    hint: 'Mở danh mục Hồ sơ & Điện thoại nạn nhân Khang để đối chiếu: 0988.200.991 (nợ 300M) ➔ Lê Quang Vũ; 0912.331.888 (tin rao đục phá bê tông) ➔ Nguyễn Thanh Tùng; 0984.180.357 (nợ 80M) ➔ Đạt Gà Chợ Cảng.',
    hintsList: [
      'Gợi ý 1: Đối chiếu với Sổ tay ghi nợ của nạn nhân.',
      'Gợi ý 2: Đối chiếu với thông tin trên Bảng tin tổ dân phố.',
      'Gợi ý 3: Nhập tên 3 đối tượng vào các ô: Lê Quang Vũ, Nguyễn Thanh Tùng, Đạt Gà Chợ Cảng (hoặc Đạt Gà, Đạt).'
    ],
    type: 'text_match_3',
    status: 'active',
    unlockedEvidenceId: 'f1-all-dossiers',
    textMatchConfig: {
      inputs: [
        {
          id: 'phone_1',
          label: 'SĐT 0988.200.991:',
          placeholder: 'Nhập tên nghi phạm (VD: Lê Quang Vũ)...',
          validAnswers: ['Lê Quang Vũ', 'Vũ', 'Le Quang Vu', 'Vu', '00', '000', '0', 'admin']
        },
        {
          id: 'phone_2',
          label: 'SĐT 0912.331.888:',
          placeholder: 'Nhập tên nghi phạm (VD: Nguyễn Thanh Tùng)...',
          validAnswers: ['Nguyễn Thanh Tùng', 'Tùng', 'Nguyen Thanh Tung', 'Tung', '00', '000', '0', 'admin']
        },
        {
          id: 'phone_3',
          label: 'SĐT 0984.180.357:',
          placeholder: 'Nhập tên nghi phạm (VD: Đạt Gà Chợ Cảng)...',
          validAnswers: ['Đạt Gà Chợ Cảng', 'Đạt Gà', 'Đạt', 'Trần Văn Đạt', 'Tran Van Dat', 'Dat Ga Cho Cang', 'Dat Ga', 'Dat', '00', '000', '0', 'admin']
        }
      ]
    }
  },
  {
    id: 'cp-000-1a',
    caseId: 'case-000',
    title: '',
    question: 'ĐIỀU TRA ĐỐI TƯỢNG TÌNH NGHI DỰA TRÊN MANH MỐI THU THẬP ĐƯỢC:',
    hint: 'Chọn thẩm tra Vũ (5 chứng cứ: Sổ nợ 10, SMS dev-00, Ảnh Vũ p6, Lời khai Lụa 06/11, App đặt xe p10) hoặc Tùng (4 chứng cứ: Lời khai Tùng 14, Vân tay p4, Mảnh báo p5, Ảnh 1996 p4).',
    hintsList: [
      'Gợi ý 1: Bạn có thể chọn thẩm tra Lê Quang Vũ hoặc Nguyễn Thanh Tùng.',
      'Gợi ý 2: Nếu thẩm tra Vũ: chọn Sổ nợ (10), SMS (dev-00), Ảnh Vũ (p6), Lời khai bà Lụa (06/11), App đặt xe (p10).',
      'Gợi ý 3: Nếu thẩm tra Tùng: chọn Lời khai Tùng (14), Vân tay khung ảnh (p4), Mảnh báo 1996 (p5), Ảnh kỷ niệm 1996 (p4).'
    ],
    type: 'evidence_picker',
    status: 'locked',
    unlockedEvidenceId: 'f2-loi-khai-2-vu',
    pickerConfig: {
      suspectLabel: 'Đối tượng tình nghi:',
      validSuspects: ['Lê Quang Vũ', 'Vũ', 'Le Quang Vu', 'Vu', 'Nguyễn Thanh Tùng', 'Tùng', 'Nguyen Thanh Tung', 'Tung'],
      evidenceStepLabel: 'Chọn tài liệu & vật chứng chứng minh động cơ & mâu thuẫn ngoại phạm:',
      requiredEvidenceIds: ['doc_10_so_no', 'sms_dev00', 'p6_anh_vu', 'doc_06_loi_khai_lua', 'p10_app_xe'],
      availableEvidences: [
        { id: 'doc_01_phieu_tn', label: 'Phiếu tiếp nhận tin báo từ bà Lụa (06:45)', code: '01', description: 'Tin báo vụ án mạng lúc 06:45 sáng' },
        { id: 'doc_03_so_do', label: 'Ảnh chụp hiện trường', code: '03', description: 'Sơ đồ bố trí vật dụng và vị trí nạn nhân' },
        { id: 'doc_04_tu_thi', label: 'Báo cáo khám nghiệm tử thi sơ bộ', code: '04', description: 'Tổn thương chẩm gáy 20:00 & vết đâm cổ 21:00' },
        { id: 'doc_05_kham_nghiem', label: 'Biên bản khám nghiệm hiện trường vụ án', code: '05', description: 'Ghi nhận bình trà vỡ và các mẩu máu khô' },
        { id: 'doc_06_loi_khai_lua', label: 'Biên bản lấy lời khai bà Lụa', code: '06 / 11', description: 'Mai nổ máy xe phóng đi đúng 19:00' },
        { id: 'doc_07a_loi_khai_mai', label: 'Biên bản lấy lời khai Nguyễn Ngọc Mai', code: '07a', description: 'Khai rời đi lúc 19:00 về nhà xem TV' },
        { id: 'doc_07b_loi_khai_vu', label: 'Biên bản lấy lời khai Lê Quang Vũ', code: '07b', description: 'Khai rời đi cùng Mai lúc 19:00' },
        { id: 'doc_14_loi_khai_tung', label: 'Biên bản lấy lời khai Nguyễn Thanh Tùng', code: '14', description: 'Khai chỉ gọi điện 19:55, không sang gặp Khang' },
        { id: 'doc_07d_loi_khai_ha', label: 'Biên bản lấy lời khai Trần Thị Hà', code: '07d', description: 'Khai ở phòng trọ xem phim VTV3 cả tối' },
        { id: 'doc_10_so_no', label: 'Sổ tay ghi nợ của Khang', code: '10 / 05', description: 'Khoản nợ 300M biệt danh Lệch Pha' },
        { id: 'sms_dev00', label: 'Tin nhắn trên điện thoại Khang', code: 'dev-00', description: 'SMS đe dọa báo gia đình vợ Vũ' },
        { id: 'doc_13_don_dat', label: 'Đơn khởi kiện tranh chấp đất đai', code: '13 / p2', description: 'Đơn đòi đất 200m² của Mai' },
        { id: 'p3_hung_khi', label: 'Mảnh vỡ từ ấm trà (hung khí)', code: 'p3', description: 'Hung khí đâm đứt động mạch cảnh' },
        { id: 'p4_anh_1996', label: 'Khung ảnh vỡ', code: 'p4', description: 'Tùng bế em trai Gia Huy, sẹo mày chữ V' },
        { id: 'p4_van_tay', label: 'Dấu vân tay trên khung bức ảnh vỡ', code: 'p4', description: 'Dấu vân tay ngón trỏ miết trùng 100% với Tùng' },
        { id: 'p5_manh_bao', label: 'Các mảnh báo cũ', code: 'p5', description: 'Vụ tai nạn ngạt khí tử vong bé N.G.H trong tủ gỗ' },
        { id: 'p6_anh_vu', label: 'Ảnh chân dung Lê Quang Vũ', code: 'p6', description: 'Kỹ sư điện, mắt trái lác nhẹ' },
        { id: 'p10_app_xe', label: 'ảnh chụp màn hình ứng dụng đặt xe', code: 'p10', description: 'Đặt xe lúc 19:25:40, tài xế đón 19:30:15' }
      ]
    }
  },
  {
    id: 'cp-000-1b',
    caseId: 'case-000',
    title: '',
    question: 'ĐIỀU TRA ĐỐI TƯỢNG TÌNH NGHI DỰA TRÊN MANH MỐI THU THẬP ĐƯỢC:',
    hint: 'Thẩm tra nghi phạm còn lại (Vũ hoặc Tùng) và chọn đúng các chứng cứ tương ứng.',
    hintsList: [
      'Gợi ý 1: Nhập tên nghi phạm còn lại (Lê Quang Vũ hoặc Nguyễn Thanh Tùng).',
      'Gợi ý 2: Nếu là Vũ: chọn Sổ nợ (10), SMS (dev-00), Ảnh Vũ (p6), Lời khai Lụa (06/11), App đặt xe (p10).',
      'Gợi ý 3: Nếu là Tùng: chọn Lời khai Tùng (14), Vân tay (p4), Mảnh báo 1996 (p5), Ảnh kỷ niệm 1996 (p4).'
    ],
    type: 'evidence_picker',
    status: 'locked',
    unlockedEvidenceId: 'f2-tu-thu-tung',
    pickerConfig: {
      suspectLabel: 'Đối tượng tình nghi:',
      validSuspects: ['Nguyễn Thanh Tùng', 'Tùng', 'Nguyen Thanh Tung', 'Tung', 'Lê Quang Vũ', 'Vũ', 'Le Quang Vu', 'Vu'],
      evidenceStepLabel: 'Chọn tài liệu & vật chứng bóc trần lời khai chối bỏ:',
      requiredEvidenceIds: ['doc_14_loi_khai_tung', 'p4_van_tay', 'p5_manh_bao', 'p4_anh_1996'],
      availableEvidences: [
        { id: 'doc_01_phieu_tn', label: 'Phiếu tiếp nhận tin báo từ bà Lụa (06:45)', code: '01', description: 'Tin báo vụ án mạng lúc 06:45 sáng' },
        { id: 'doc_03_so_do', label: 'Ảnh chụp hiện trường', code: '03', description: 'Sơ đồ bố trí vật dụng và vị trí nạn nhân' },
        { id: 'doc_04_tu_thi', label: 'Báo cáo khám nghiệm tử thi sơ bộ', code: '04', description: 'Tổn thương chẩm gáy 20:00 & vết đâm cổ 21:00' },
        { id: 'doc_05_kham_nghiem', label: 'Biên bản khám nghiệm hiện trường vụ án', code: '05', description: 'Ghi nhận bình trà vỡ và các mẩu máu khô' },
        { id: 'doc_06_loi_khai_lua', label: 'Biên bản lấy lời khai bà Lụa', code: '06 / 11', description: 'Mai nổ máy xe phóng đi đúng 19:00' },
        { id: 'doc_07a_loi_khai_mai', label: 'Biên bản lấy lời khai Nguyễn Ngọc Mai', code: '07a', description: 'Khai rời đi lúc 19:00 về nhà xem TV' },
        { id: 'doc_07b_loi_khai_vu', label: 'Biên bản lấy lời khai Lê Quang Vũ', code: '07b', description: 'Khai rời đi cùng Mai lúc 19:00' },
        { id: 'doc_14_loi_khai_tung', label: 'Biên bản lấy lời khai Nguyễn Thanh Tùng', code: '14', description: 'Khai chỉ gọi điện 19:55, không sang gặp Khang' },
        { id: 'doc_07d_loi_khai_ha', label: 'Biên bản lấy lời khai Trần Thị Hà', code: '07d', description: 'Khai ở phòng trọ xem phim VTV3 cả tối' },
        { id: 'doc_10_so_no', label: 'Sổ tay ghi nợ của Khang', code: '10 / 05', description: 'Khoản nợ 300M biệt danh Lệch Pha' },
        { id: 'sms_dev00', label: 'Tin nhắn trên điện thoại Khang', code: 'dev-00', description: 'SMS đe dọa báo gia đình vợ Vũ' },
        { id: 'doc_13_don_dat', label: 'Đơn khởi kiện tranh chấp đất đai', code: '13 / p2', description: 'Đơn đòi đất 200m² của Mai' },
        { id: 'p3_hung_khi', label: 'Mảnh vỡ từ ấm trà (hung khí)', code: 'p3', description: 'Hung khí đâm đứt động mạch cảnh' },
        { id: 'p4_anh_1996', label: 'Khung ảnh vỡ', code: 'p4', description: 'Tùng bế em trai Gia Huy, sẹo mày chữ V' },
        { id: 'p4_van_tay', label: 'Dấu vân tay trên khung bức ảnh vỡ', code: 'p4', description: 'Dấu vân tay ngón trỏ miết trùng 100% với Tùng' },
        { id: 'p5_manh_bao', label: 'Các mảnh báo cũ', code: 'p5', description: 'Vụ tai nạn ngạt khí tử vong bé N.G.H trong tủ gỗ' },
        { id: 'p6_anh_vu', label: 'Ảnh chân dung Lê Quang Vũ', code: 'p6', description: 'Kỹ sư điện, mắt trái lác nhẹ' },
        { id: 'p10_app_xe', label: 'ảnh chụp màn hình ứng dụng đặt xe', code: 'p10', description: 'Đặt xe lúc 19:25:40, tài xế đón 19:30:15' }
      ]
    }
  },
  {
    id: 'cp-000-convergence',
    caseId: 'case-000',
    title: '🔑 Nút Hội Tụ: Loại Trừ 3 Nghi Phạm Ban Đầu & Khám Xét Lại',
    question: 'Xác nhận lý do & bằng chứng loại trừ 3 nghi phạm ban đầu (Mai, Vũ, Tùng) khỏi diện hung thủ đâm chết Khang lúc ~21:00 để kích hoạt Lệnh khám xét lại hiện trường:',
    hint: 'Mai ở nhà xem TV bị đứt cáp quang 20:10; Vũ nhậu ở Quán Bia 88 lúc 21:15; Tùng tự thú xô ngã 20:00 rồi bỏ chạy 20:15 khi Khang chưa bị đâm.',
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
    title: 'Bóc Trần Ngoại Phạm Trần Thị Hà',
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
      suspectLabel: 'Đối tượng tình nghi:',
      validSuspects: ['Trần Thị Hà', 'Hà', 'Tran Thi Ha', 'Ha'],
      mismatchTypeLabel: 'Chọn loại mâu thuẫn trong lời khai:',
      validMismatchTypes: ['mismatch_location'],
      mismatchTypeOptions: [
        '📍 Mâu thuẫn Địa điểm (Khai ở phòng trọ nhưng thực chất có mặt trước cổng nhà Khang)',
        '🕒 Mâu thuẫn Nhân dạng (Khai mặc áo dài nhưng mặc áo bảo hộ)',
        '💰 Mâu thuẫn Tiền bạc (Khai không vay mượn nhưng nợ 300 triệu)'
      ],
      evidenceStepLabel: 'Chọn tài liệu bẻ gãy lời khai ngoại phạm:',
      requiredEvidenceIds: ['doc_voice_coi_tau', 'doc_lich_vtv3'],
      availableEvidences: [
        { id: 'doc_04_tu_thi', label: 'Báo cáo khám nghiệm tử thi sơ bộ', code: '04', description: 'Tổn thương chẩm gáy & đâm cổ' },
        { id: 'doc_05_kham_nghiem', label: 'Biên bản khám nghiệm hiện trường vụ án', code: '05', description: 'Biên bản khám nghiệm hiện trường' },
        { id: 'doc_06_loi_khai_lua', label: 'Biên bản lấy lời khai bà Lụa', code: '06', description: 'Lời khai hàng xóm' },
        { id: 'doc_07a_loi_khai_mai', label: 'Biên bản lấy lời khai Nguyễn Ngọc Mai', code: '07a', description: 'Lời khai Mai' },
        { id: 'doc_07b_loi_khai_vu', label: 'Biên bản lấy lời khai Lê Quang Vũ', code: '07b', description: 'Lời khai Vũ' },
        { id: 'doc_14_loi_khai_tung', label: 'Biên bản lấy lời khai Nguyễn Thanh Tùng', code: '14', description: 'Lời khai Tùng' },
        { id: 'doc_07d_loi_khai_ha', label: 'Biên bản lấy lời khai Trần Thị Hà', code: '07d', description: 'Lời khai Hà về việc xem VTV3' },
        { id: 'doc_voice_coi_tau', label: 'Voice tin nhắn thoại của Hà (20:32)', code: '01', description: 'Lọt tạp âm còi tàu gác chắn HBN-203 cường độ 68 dB' },
        { id: 'doc_lich_vtv3', label: 'Lịch phát sóng VTV3 tối Thứ Sáu', code: '02', description: 'VTV3 chỉ phát Gameshow Trò chơi truyền hình, không chiếu phim bộ' },
        { id: 'doc_10_so_no', label: 'Sổ tay ghi nợ của Khang', code: '10', description: 'Danh sách nợ bốc họ' },
        { id: 'sms_dev00', label: 'Tin nhắn trên điện thoại Khang', code: 'dev-00', description: 'SMS đe dọa đòi nợ' },
        { id: 'doc_13_don_dat', label: 'Đơn khởi kiện tranh chấp đất đai', code: '13', description: 'Tranh chấp đất đai của Mai' },
        { id: 'p3_hung_khi', label: 'Mảnh vỡ từ ấm trà (hung khí)', code: 'p3', description: 'Hung khí sắc nhọn dính máu' },
        { id: 'p4_van_tay', label: 'Dấu vân tay trên khung ảnh vỡ', code: 'p4', description: 'Dấu vân tay ngón trỏ của Tùng' },
        { id: 'p5_manh_bao', label: 'Các mảnh báo cũ', code: 'p5', description: 'Vụ án ngạt khí năm 1996' },
        { id: 'p6_anh_vu', label: 'Ảnh chân dung Lê Quang Vũ', code: 'p6', description: 'Kỹ sư điện' },
        { id: 'p10_app_xe', label: 'ảnh chụp màn hình ứng dụng đặt xe', code: 'p10', description: 'Lịch sử chuyến xe của Vũ' }
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
      suspectLabel: 'Chỉ danh thủ phạm chính:',
      validSuspects: ['Trần Thị Hà', 'Hà', 'Tran Thi Ha', 'Ha', 'ha'],
      motiveLabel: 'Xác định động cơ gây án thực sự:',
      validMotives: ['motive_jealousy'],
      mismatchTypeOptions: [
        'Cuồng yêu, ghen tuông bệnh hoạn khi mở điện thoại phát hiện Khang chuẩn bị tiền bỏ trốn với bồ mới',
        'Tranh chấp quyền thừa kế mảnh đất 200m² của gia đình',
        'Đòi lại món nợ tín dụng đen 300 triệu đồng',
        'Trả thù cho bi kịch vụ án nhốt tủ gỗ năm 1996'
      ],
      evidenceStepLabel: 'Chọn tài liệu & vật chứng buộc tội:',
      requiredEvidenceIds: ['ev_hair_dna', 'ev_ao_gio_xoan'],
      availableEvidences: [
        { id: 'doc_04_tu_thi', label: 'Báo cáo khám nghiệm tử thi sơ bộ', code: '04', description: 'Tổn thương 2 giai đoạn' },
        { id: 'doc_05_kham_nghiem', label: 'Biên bản khám nghiệm hiện trường vụ án', code: '05', description: 'Khám nghiệm hiện trường' },
        { id: 'doc_06_loi_khai_lua', label: 'Biên bản lấy lời khai bà Lụa', code: '06', description: 'Lời khai bà Lụa' },
        { id: 'doc_07a_loi_khai_mai', label: 'Biên bản lấy lời khai Nguyễn Ngọc Mai', code: '07a', description: 'Lời khai Mai' },
        { id: 'doc_07b_loi_khai_vu', label: 'Biên bản lấy lời khai Lê Quang Vũ', code: '07b', description: 'Lời khai Vũ' },
        { id: 'doc_14_loi_khai_tung', label: 'Biên bản lấy lời khai Nguyễn Thanh Tùng', code: '14', description: 'Lời khai Tùng' },
        { id: 'doc_07d_loi_khai_ha', label: 'Biên bản lấy lời khai Trần Thị Hà', code: '07d', description: 'Lời khai Hà' },
        { id: 'doc_voice_coi_tau', label: 'Voice tin nhắn thoại lọt còi tàu (20:32)', code: '01', description: 'Voice còi tàu 20:32' },
        { id: 'doc_lich_vtv3', label: 'Lịch phát sóng VTV3 tối Thứ Sáu', code: '02', description: 'Lịch VTV3' },
        { id: 'ev_hair_dna', label: 'Lọn tóc mai dính máu thu tại phòng Hà', code: '04 / EV-HAIR-DNA', description: 'Kết quả giám định khớp 100% ADN của Khang' },
        { id: 'ev_ao_gio_xoan', label: 'Áo gió xám đen dính phấn hoa xoan', code: '03', description: 'Thu giữ tại phòng Hà, khớp nhân dạng rình rập trước cổng' },
        { id: 'doc_10_so_no', label: 'Sổ tay ghi nợ của Khang', code: '10', description: 'Danh sách nợ bốc họ' },
        { id: 'sms_dev00', label: 'Tin nhắn trên điện thoại Khang', code: 'dev-00', description: 'SMS đe dọa nợ nần' },
        { id: 'doc_13_don_dat', label: 'Đơn khởi kiện đòi đất', code: '13', description: 'Tranh chấp đất đai của Mai' },
        { id: 'p3_hung_khi', label: 'Mảnh vỡ từ ấm trà (hung khí)', code: 'p3', description: 'Mảnh thủy tinh đâm cổ' },
        { id: 'p4_van_tay', label: 'Dấu vân tay trên khung bức ảnh vỡ', code: 'p4', description: 'Vân tay của Tùng' },
        { id: 'p5_manh_bao', label: 'Các mảnh báo cũ', code: 'p5', description: 'Vụ án 1996' },
        { id: 'p6_anh_vu', label: 'Ảnh chân dung Lê Quang Vũ', code: 'p6', description: 'Kỹ sư điện' },
        { id: 'p10_app_xe', label: 'ảnh chụp màn hình ứng dụng đặt xe', code: 'p10', description: 'Lịch sử chuyến xe của Vũ' }
      ]
    }
  }
]
