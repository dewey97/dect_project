import { PDFDocument, PhysicalEvidence } from './evidence-types'

export const CASE_000_PDFS: PDFDocument[] = [
  // Phase 0: Initial Investigation (00_khoi_dau)
  {
    id: 'pdf-00-hd',
    title: '00. Cẩm nang hướng dẫn điều tra ban đầu',
    code: '00-HD',
    url: '/documents/case_000/00_khoi_dau/00_huong_dan_ban_dau.pdf',
    phase: 0,
    order: 5
  },
  {
    id: 'pdf-01',
    title: '01. Phiếu tiếp nhận nguồn tin về tội phạm (06:45)',
    code: '01-TB',
    url: '/documents/case_000/00_khoi_dau/01_tiep_nhan_tin_bao.pdf',
    phase: 0,
    order: 10
  },
  {
    id: 'pdf-02',
    title: '02. Quyết định khởi tố vụ án hình sự',
    code: '02-KT',
    url: '/documents/case_000/00_khoi_dau/02_quyet_dinh_khoi_to.pdf',
    phase: 0,
    order: 20
  },
  {
    id: 'pdf-03a',
    title: '03a. Biên bản khám nghiệm hiện trường vụ án',
    code: '03a-HT',
    url: '/documents/case_000/00_khoi_dau/03a_bien_ban_kham_nghiem_hien_truong.pdf',
    phase: 0,
    order: 30
  },
  {
    id: 'pdf-03b',
    title: '03b. Báo cáo khám nghiệm tử thi sơ bộ',
    code: '03b-TT',
    url: '/documents/case_000/00_khoi_dau/03b_bao_cao_kham_nghiem_tu_thi_so_bo.pdf',
    phase: 0,
    order: 35
  },
  {
    id: 'pdf-04',
    title: '04. Lý lịch & Nhân thân nạn nhân Khang',
    code: '04-NN',
    url: '/documents/case_000/00_khoi_dau/04_nhan_than_nan_nhan.pdf',
    phase: 0,
    order: 40
  },
  {
    id: 'pdf-05a',
    title: '05a. Lý lịch tư pháp: Nguyễn Ngọc Mai',
    code: '05a-LL',
    url: '/documents/case_000/00_khoi_dau/05a_ly_lich_nguyen_ngoc_mai.pdf',
    phase: 0,
    order: 45
  },
  {
    id: 'pdf-05b',
    title: '05b. Lý lịch tư pháp: Lê Quang Vũ',
    code: '05b-LL',
    url: '/documents/case_000/00_khoi_dau/05b_ly_lich_le_quang_vu.pdf',
    phase: 0,
    order: 50
  },
  {
    id: 'pdf-05c',
    title: '05c. Lý lịch tư pháp: Trần Thị Hà',
    code: '05c-LL',
    url: '/documents/case_000/00_khoi_dau/05c_ly_lich_tran_thi_ha.pdf',
    phase: 0,
    order: 55
  },
  {
    id: 'pdf-06',
    title: '06. Lời khai nhân chứng: Nguyễn Thị Lụa',
    code: '06-LK',
    url: '/documents/case_000/00_khoi_dau/06_loi_khai_nhan_chung.pdf',
    phase: 0,
    order: 60
  },
  {
    id: 'pdf-07',
    title: '07. Lời khai: Nguyễn Ngọc Mai (Lần 1)',
    code: '07-LK',
    url: '/documents/case_000/00_khoi_dau/07_loi_khai_mai.pdf',
    phase: 0,
    order: 70
  },
  {
    id: 'pdf-08',
    title: '08. Lời khai: Lê Quang Vũ (Lần 1)',
    code: '08-LK',
    url: '/documents/case_000/00_khoi_dau/08_loi_khai_vu.pdf',
    phase: 0,
    order: 80
  },
  {
    id: 'pdf-09',
    title: '09. Lời khai: Trần Thị Hà (Lần 1)',
    code: '09-LK',
    url: '/documents/case_000/00_khoi_dau/09_loi_khai_ha.pdf',
    phase: 0,
    order: 90
  },
  {
    id: 'pdf-10',
    title: '10. Sổ ghi nợ cá nhân của Khang',
    code: '10-SN',
    url: '/documents/case_000/00_khoi_dau/10_so_ghi_no.pdf',
    phase: 0,
    order: 100
  },
  {
    id: 'pdf-11',
    title: '11. Bảng tin dân cư rao vặt',
    code: '11-BT',
    url: '/documents/case_000/00_khoi_dau/11_bang_tin_rao_vat.pdf',
    phase: 0,
    order: 105
  },
  {
    id: 'pdf-12',
    title: '12. Biên bản xác minh nhật ký cuộc gọi',
    code: '12-CG',
    url: '/documents/case_000/00_khoi_dau/12_tong_hop_loi_khai_cuoc_goi.pdf',
    phase: 0,
    order: 110
  },
  {
    id: 'pdf-13',
    title: '13. Đơn khởi kiện tranh chấp đất đai',
    code: '13-ĐK',
    url: '/documents/case_000/00_khoi_dau/13_don_khoi_kien_tranh_chap.pdf',
    phase: 0,
    order: 115
  },
  {
    id: 'pdf-14',
    title: '14. Thông báo quá hạn nợ ngân hàng',
    code: '14-NH',
    url: '/documents/case_000/00_khoi_dau/14_thong_bao_no_ngan_hang.pdf',
    phase: 0,
    order: 120
  },
  {
    id: 'pdf-15',
    title: '15. Trích đoạn bài báo cũ năm 1996',
    code: '15-BC',
    url: '/documents/case_000/00_khoi_dau/15_trich_doan_bai_bao_1996.pdf',
    phase: 0,
    order: 125
  },

  // Phase 1: Branch Mai & Vu (01_nhanh_mai_vu)
  {
    id: 'pdf-a01',
    title: '01. Sổ bán hàng & Thu chi Quán Bia 88',
    code: 'A-01',
    url: '/documents/case_000/01_nhanh_mai_vu/01_so_thu_chi_quan_bia.pdf',
    phase: 1,
    order: 130
  },
  {
    id: 'pdf-a02',
    title: '02. Lời khai lần 2: Lê Quang Vũ',
    code: 'A-02',
    url: '/documents/case_000/01_nhanh_mai_vu/02_loi_khai_lan_2_vu.pdf',
    phase: 1,
    order: 135
  },
  {
    id: 'pdf-a03',
    title: '03. Biên bản làm việc chủ Quán Bia 88',
    code: 'A-03',
    url: '/documents/case_000/01_nhanh_mai_vu/03_bien_ban_lam_viec_chu_quan_bia.pdf',
    phase: 1,
    order: 140
  },

  // Phase 2: Branch Nguyen Thanh Tung (02_nhanh_tung)
  {
    id: 'pdf-b01',
    title: '01. Biên bản tự thú xô xát: Nguyễn Thanh Tùng',
    code: 'B-01',
    url: '/documents/case_000/02_nhanh_tung/01_tu_thu_xo_xat_tung.pdf',
    phase: 2,
    order: 150
  },
  {
    id: 'pdf-b02',
    title: '02. Lời khai: Nguyễn Thanh Tùng (Lần 1)',
    code: 'B-02',
    url: '/documents/case_000/02_nhanh_tung/02_loi_khai_tung.pdf',
    phase: 2,
    order: 155
  },
  {
    id: 'pdf-b03',
    title: '03. Lý lịch tư pháp: Nguyễn Thanh Tùng',
    code: 'B-03',
    url: '/documents/case_000/02_nhanh_tung/03_ly_lich_nguyen_thanh_tung.pdf',
    phase: 2,
    order: 160
  },
  {
    id: 'pdf-b04',
    title: '04. Lời khai: Đạt Gà Chợ Cảng',
    code: 'B-04',
    url: '/documents/case_000/02_nhanh_tung/04_loi_khai_dat_ga.pdf',
    phase: 2,
    order: 165
  },
  {
    id: 'pdf-b05',
    title: '05. Lý lịch tư pháp: Đạt Gà Chợ Cảng',
    code: 'B-05',
    url: '/documents/case_000/02_nhanh_tung/05_ly_lich_dat_ga.pdf',
    phase: 2,
    order: 170
  },

  // Phase 3: Branch Tran Thi Ha & Conclusion (03_nhanh_ha & 04_ket_luan)
  {
    id: 'pdf-c01',
    title: '01. Lời khai lần 2: Trần Thị Hà',
    code: 'C-01',
    url: '/documents/case_000/03_nhanh_ha/01_loi_khai_lan_2_tran_thi_ha.pdf',
    phase: 3,
    order: 180
  },
  {
    id: 'pdf-c03',
    title: '03. Biên bản khám xét khẩn cấp phòng trọ Hà',
    code: 'C-03',
    url: '/documents/case_000/03_nhanh_ha/03_kham_xet_phong_ha.pdf',
    phase: 3,
    order: 185
  },
  {
    id: 'pdf-d01',
    title: '04. Bản kết luận điều tra & Đề nghị truy tố',
    code: 'D-01',
    url: '/documents/case_000/04_ket_luan/de_nghi_truy_to.pdf',
    phase: 3,
    order: 190
  },
  {
    id: 'pdf-d02',
    title: '05. Ký sự hậu án & Lời thú tội',
    code: 'D-02',
    url: '/documents/case_000/04_ket_luan/05_ky_su_hau_an.pdf',
    phase: 3,
    order: 195
  }
]

export const CASE_000_EVIDENCE: PhysicalEvidence[] = [
  {
    id: 'ev-p1',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p1. Ảnh hiện trường phòng khách & bộ bình trà vỡ',
    preview: 'Hiện trường phòng khách xáo trộn, bộ bình trà thủy tinh pha hoa cúc bị vỡ vụn trên sàn gạch.',
    timestamp: '20:00',
    evidenceId: 'EV-SCENE-OVERVIEW',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/photo_scene_overview.jpg',
    phase: 0,
    order: 21
  },
  {
    id: 'ev-p3',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p3. Mảnh thủy tinh 8.2cm dính máu (Hung khí)',
    preview: 'Mảnh vỡ bình trà sắc nhọn 8.2cm dính vết máu khô và dấu vân tay miết trượt (vật chứng đâm đứt động mạch cảnh).',
    timestamp: '21:00',
    evidenceId: 'EV-GLASS-SHARD',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/photo_glass_shard.jpg',
    phase: 0,
    order: 22
  },
  {
    id: 'ev-p4',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p4. Khung ảnh kỷ niệm xóm Bờ Sông hè 1996 bị vỡ kính',
    preview: 'Bức ảnh chụp kỷ niệm xóm Bờ Sông hè 1996: Khang ngỗ ngược, Tùng (sẹo chữ V lông mày), bé Huy nhỏ thó đeo còi đồng nép sau lưng Tùng, bé Hà váy hoa và bé Mai được ông bế.',
    timestamp: '20:00',
    evidenceId: 'EV-CHILDHOOD-BROKEN-FRAME',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/images/cases/case_000/trontim.jpg',
    phase: 0,
    order: 23
  },
  {
    id: 'ev-p10',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p10. Ảnh chụp màn hình ứng dụng đặt xe ôm của Vũ',
    preview: 'Lệnh đặt xe ôm của Vũ lúc 19:25:40, tài xế đón lúc 19:30:15 chạy ra Quán Bia 88.',
    timestamp: '19:25',
    evidenceId: 'EV-RIDE-VU',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/images/cases/case_000/cuong_ve_xe_tung.png',
    phase: 0,
    order: 24
  },
  {
    id: 'ev-p2',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p2. Ảnh hiện trường xấp Đơn tố cáo đòi đất 200m²',
    preview: 'Xấp Đơn tố cáo đòi lại đất của Mai văng vãi dưới sàn phòng khách, trên góc mép có dính 02 giọt máu khô (M1).',
    timestamp: '18:50',
    evidenceId: 'EV-SCATTERED-DOCS',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/photo_scattered_docs.jpg',
    phase: 0,
    order: 25
  },
  {
    id: 'ev-p5',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p5. Mẩu báo cũ 1996 về tai nạn ngạt khí tủ gỗ',
    preview: 'Trang nhật báo cắt năm 1996 đưa tin tai nạn ngạt khí tủ gỗ thương tâm của bé Gia Huy (7 tuổi) chiều 24/07/1996.',
    timestamp: '24/07/1996',
    evidenceId: 'EV-OLD-NEWSPAPER',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/photo_old_newspaper.jpg',
    phase: 2,
    order: 141
  },
  {
    id: 'ev-p6',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p6. Ảnh chuỗi chat Khang & Thảo Vy hẹn trốn đi Đà Lạt',
    preview: 'Chuỗi tin nhắn trích xuất từ iPhone 6s Plus: Thảo Vy hẹn vé 06:15 sáng mai, Khang gom hơn 2 tỷ tiền mặt bỏ trốn và ruồng rẫy Hà.',
    timestamp: '17:55',
    evidenceId: 'EV-CHEATING-SMS',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/images/cases/case_000/photo_cheating_sms.jpg',
    phase: 3,
    order: 161
  }
]

export const HINTS_MAP: Record<string, string[]> = {
  'cp-000-0': [
    'Báo cáo tử thi chỉ rõ 2 vùng tổn thương: Cú va đập chẩm gáy (20:00) gây ngất & Vết đâm đứt động mạch cảnh (21:00).',
    'Ma trận mâu thuẫn khoanh vùng 4 đối tượng có động cơ: Mai, Vũ, Tùng và Hà.'
  ],
  'cp-000-1': [
    'Đọc Báo cáo giám định chữ ký DOC-A1 để xem phân tích chữ ký đồ nét tracing trên Giấy ủy quyền đất 200m².',
    'Mai có chứng cứ rời đi lúc 19:00, Vũ có hóa đơn chuyển khoản Quán Bia 88 lúc 20:45 cách hiện trường 3.8km.'
  ],
  'cp-000-2': [
    'Kiểm tra mốc ngày giỗ tròn 20 năm của bé Gia Huy (24/07/1996 - 24/07/2016).',
    'So sánh mốc thời gian Tùng rời đi lúc 20:15 trước khi chuyến tàu hàng 20:30 chạy qua.'
  ],
  'cp-000-3': [
    'Đối chiếu âm thanh còi tàu 20:32 trong Voicemail và lịch phát sóng VTV3 thứ Sáu (chỉ chiếu Gameshow) với lời khai của Hà.',
    'Lọn tóc dính máu trong áo ngực của Hà khớp 100% ADN Khang là chứng cứ định tội tuyệt đối.'
  ]
}

export interface PhysicalDirective {
  envelopeName: string
  envelopeType: 'folder' | 'envelope'
  documents: { code: string; title: string }[]
  instructions: string
  badgeText: string
}

export const PHYSICAL_DIRECTIVES: Record<number, PhysicalDirective> = {
  0: {
    envelopeName: 'BÌA KẸP HỒ SƠ CHÍNH // KHỞI ĐIỂM VỤ ÁN (MANILA FOLDER)',
    envelopeType: 'folder',
    badgeText: '📦 TẬP HỒ SƠ BAN ĐẦU TRÊN BÀN',
    documents: [
      { code: '01', title: 'Phiếu tiếp nhận tin báo từ bà Lụa (06:45)' },
      { code: '02', title: 'Quyết định khởi tố vụ án hình sự' },
      { code: '03', title: 'Sơ đồ mặt bằng hiện trường phòng khách' },
      { code: '04', title: 'Báo cáo khám nghiệm tử thi sơ bộ' },
      { code: '05', title: 'Biên bản khám nghiệm hiện trường vụ án' },
      { code: '06', title: 'Báo cáo điều tra ban đầu' },
      { code: '07 & 08', title: 'Nhân thân nạn nhân Khang & Lý lịch 4 nghi phạm' },
      { code: '10', title: 'Sơ đồ địa lý di chuyển' },
      { code: '11 - 15', title: '05 Biên bản lời khai ban đầu (Bà Lụa, Mai, Vũ, Tùng, Hà)' },
      { code: '16', title: 'Biên bản trích xuất dữ liệu điện thoại Khang' },
      { code: '17', title: 'Mẩu giấy note dán trên hũ trà hoa cúc' },
      { code: '18', title: 'Bảng tin rao vặt trước cổng nhà Khang' }
    ],
    instructions:
      'Cả nhóm cùng mở Bìa hồ sơ chính trên bàn cờ, chia nhau các biên bản lời khai và tài liệu hiện trường. Hãy đối chiếu tiếng vỡ xoảng bình trà lúc ~20:00 của hàng xóm với hiện trường để nhận diện vụ xô xát bất thường, sau đó chọn danh sách nghi phạm cần triệu tập bên dưới.'
  },
  1: {
    envelopeName: 'PHONG BÌ 01: HỒ SƠ TUYẾN A (TRẦN NGỌC MAI & LÊ QUANG VŨ)',
    envelopeType: 'envelope',
    badgeText: '✉️ XÉ NIÊM PHONG PHONG BÌ TRÊN BÀN CỜ',
    documents: [
      { code: '01', title: 'Kết quả giám định chữ ký đồ nét tracing (DOC-A1)' },
      { code: '02', title: 'Giấy ủy quyền đất 200m² bị làm giả (EV-SIGN-01)' },
      { code: '03', title: 'Biên bản họp gia đình 2014 có chữ ký thật (EV-SIGN-02)' },
      { code: '04', title: 'Đơn tố cáo lừa đảo mang chữ ký 2016 của Mai (EV-SIGN-03)' },
      { code: '05', title: 'Sổ ghi nợ tín dụng đen 300M của Vũ (DOC-A5)' },
      { code: '06', title: 'Sổ thu chi Quán Bia 88 xác nhận thanh toán 20:45 (DOC-A6)' },
      { code: '07', title: 'Biên bản hỏi cung lần 2 đối với Lê Quang Vũ (DOC-A7)' }
    ],
    instructions:
      'Hãy tìm và xé tem niêm phong Phong bì Tuyến A trên bàn cờ. Đọc kết quả giám định chữ ký đồ nét tracing và giải câu đố Sổ thu chi Quán Bia 88 để tìm bằng chứng minh oan cho Mai & Vũ lúc 20:45.'
  },
  2: {
    envelopeName: 'PHONG BÌ 02: HỒ SƠ TUYẾN B (NGUYỄN THANH TÙNG & BI KỊCH 1996)',
    envelopeType: 'envelope',
    badgeText: '✉️ XÉ NIÊM PHONG PHONG BÌ TRÊN BÀN CỜ',
    documents: [
      { code: '01', title: 'Biên bản hỏi cung / Lời tự thú của Nguyễn Thanh Tùng (DOC-B1)' },
      { code: 'p4', title: 'Khung ảnh kỷ niệm 5 đứa trẻ hè 1996 bị vỡ kính' },
      { code: 'p5', title: 'Mẩu báo cũ năm 1996 về vụ ngạt khí tủ gỗ của bé Gia Huy' }
    ],
    instructions:
      'Hãy tìm và xé tem niêm phong Phong bì Tuyến B trên bàn cờ. Đọc mẩu báo cũ 1996, đối chiếu khung ảnh kỷ niệm và xem lời tự thú của Tùng để làm rõ bi kịch quá khứ và mốc giờ rời đi lúc 20:15 trước khi tàu hàng 20:30 chạy qua.'
  },
  3: {
    envelopeName: 'PHONG BÌ 03: HỒ SƠ TUYẾN C (TRẦN THỊ HÀ - HỒ SƠ ĐỊNH TỘI)',
    envelopeType: 'envelope',
    badgeText: '✉️ XÉ NIÊM PHONG PHONG BÌ TRÊN BÀN CỜ',
    documents: [
      { code: '01', title: 'Báo cáo pháp y tổn thương 2 giai đoạn (DOC-C1)' },
      { code: '02', title: 'Giám định phổ âm thanh còi tàu trong Voicemail 20:32 (DOC-C2)' },
      { code: '03', title: 'Biên bản khám xét phòng trọ: Áo gió & Kéo bấm (DOC-C3)' },
      { code: '04', title: 'Giám định ADN 16 locus STR lọn tóc trong áo ngực (EV-HAIR-DNA)' },
      { code: '05', title: 'Biên bản hỏi cung / Lời thú tội toàn bộ của Trần Thị Hà (DOC-C5)' },
      { code: '06', title: 'Lịch phát sóng VTV3 tối thứ Sáu 24/07 (DOC-C6)' }
    ],
    instructions:
      'Hãy xé tem niêm phong Phong bì cuối cùng: [TRẦN THỊ HÀ] trên bàn cờ. Đọc Báo cáo pháp y 2 giai đoạn, phân tích âm thanh còi tàu 20:32 và lọn tóc ADN để hoàn thành Bản Cáo Trạng Định Tội!'
  }
}

