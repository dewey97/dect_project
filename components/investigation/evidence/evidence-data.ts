import { PDFDocument, PhysicalEvidence } from './evidence-types'

export const CASE_000_PDFS: PDFDocument[] = [
  // Phase 0: Initial
  {
    id: 'pdf-01',
    title: '01. Báo cáo khám nghiệm tử thi sơ bộ',
    code: 'f1-1',
    url: '/documents/case_000/phase_0_initial/01_bao_cao_kham_nghiem_tu_thi.pdf',
    phase: 0,
    order: 10
  },
  {
    id: 'pdf-02',
    title: '02. Biên bản khám nghiệm hiện trường vụ án',
    code: 'f1-2',
    url: '/documents/case_000/phase_0_initial/02_bien_ban_kham_nghiem_hien_truong.pdf',
    phase: 0,
    order: 20
  },
  {
    id: 'pdf-04a',
    title: '03. Bản trích yếu lý lịch và nhân thân nạn nhân Khang',
    code: 'f1-4a',
    url: '/documents/case_000/phase_0_initial/04_bao_cao_xac_minh_nhan_than_khang.pdf',
    phase: 0,
    order: 30
  },
  {
    id: 'pdf-04b',
    title: '04. Báo cáo rà soát sơ yếu lý lịch người liên quan',
    code: 'f1-4b',
    url: '/documents/case_000/phase_0_initial/04b_bao_cao_ra_soat_ly_lich_nghi_pham.pdf',
    phase: 0,
    order: 35
  },
  {
    id: 'pdf-08-tx',
    title: '05. Báo cáo trích xuất tin nhắn điện thoại Khang',
    code: '08-tx',
    url: '/documents/case_000/phase_0_initial/08_trich_xuat_tin_nhan_dieu_tra_ban_dau.pdf',
    phase: 0,
    order: 40
  },
  {
    id: 'pdf-06',
    title: '05. Biên bản lấy lời khai: Nguyễn Thị Lụa',
    code: 'f1-6',
    url: '/documents/case_000/phase_0_initial/06_bien_ban_lay_loi_khai_hang_xom.pdf',
    phase: 0,
    order: 50
  },
  {
    id: 'pdf-07d',
    title: '06. Biên bản lấy lời khai: Trần Thị Hà',
    code: '07d',
    url: '/documents/case_000/phase_0_initial/07d_bien_ban_loi_khai_tran_thi_ha.pdf',
    phase: 0,
    order: 60
  },
  {
    id: 'pdf-07a',
    title: '07. Biên bản lấy lời khai: Nguyễn Ngọc Mai',
    code: '07a',
    url: '/documents/case_000/phase_0_initial/07a_bien_ban_loi_khai_tran_ngoc_mai.pdf',
    phase: 0,
    order: 70
  },
  {
    id: 'pdf-07b',
    title: '08. Biên bản lấy lời khai: Lê Quang Vũ',
    code: '07b',
    url: '/documents/case_000/phase_0_initial/07b_bien_ban_loi_khai_le_quang_vu.pdf',
    phase: 0,
    order: 80
  },
  {
    id: 'pdf-07c',
    title: '09. Biên bản lấy lời khai: Nguyễn Thanh Tùng',
    code: '07c',
    url: '/documents/case_000/phase_0_initial/07c_bien_ban_loi_khai_tung.pdf',
    phase: 0,
    order: 90
  },
  {
    id: 'pdf-03',
    title: '10. Báo cáo tổng hợp tiến độ điều tra ban đầu',
    code: 'f1-3',
    url: '/documents/case_000/phase_0_initial/03_bao_cao_tien_do_dieu_tra.pdf',
    phase: 0,
    order: 100
  },
  {
    id: 'pdf-05',
    title: '11. Báo cáo chuyên đề mâu thuẫn & mối quan hệ',
    code: 'f1-5',
    url: '/documents/case_000/phase_0_initial/05_bao_cao_chuyen_de_mau_thuan_va_quan_he.pdf',
    phase: 0,
    order: 110
  },

  // Phase 1: Inheritance & Land Dispute
  {
    id: 'pdf-08',
    title: '08. Tờ di chúc ông nội bị tẩy xóa làm giả',
    code: 'f2-1',
    url: '/documents/case_000/phase_1_inheritance/08_di_chuc_ong_noi_gia_mao.pdf',
    phase: 1,
    order: 110
  },
  {
    id: 'pdf-09',
    title: '09. Kết quả giám định tuổi mực & vết tẩy xóa (Viện KHHS)',
    code: 'f2-2',
    url: '/documents/case_000/phase_1_inheritance/09_ket_qua_giam_dinh_chu_ky.pdf',
    phase: 1,
    order: 120
  },
  {
    id: 'pdf-10a',
    title: '10a. Trích lục bản đồ địa chính & Sổ đỏ gốc (75.0m2)',
    code: 'f2-3a',
    url: '/documents/case_000/phase_1_inheritance/10a_trich_luc_ban_do_dia_chinh_goc_75m2.pdf',
    phase: 1,
    order: 130
  },
  {
    id: 'pdf-10b',
    title: '10b. Bản trích đo kỹ thuật đền bù giải tỏa đợt 1 (120.0m2)',
    code: 'f2-3b',
    url: '/documents/case_000/phase_1_inheritance/10b_ban_trich_do_ky_thuat_den_bu_120m2.pdf',
    phase: 1,
    order: 131
  },

  // Phase 2: Past Secret & Hide-and-Seek
  {
    id: 'pdf-11',
    title: '11. Biên bản camera & Bi kịch trốn tìm 1996',
    code: 'f3-1',
    url: '/documents/case_000/phase_2_altercation/11_bien_ban_trich_xuat_camera_va_tro_tron_tim.pdf',
    phase: 2,
    order: 140
  },

  // Phase 3: Conclusion & Forensic Breakthrough
  {
    id: 'pdf-12',
    title: '12. Báo cáo pháp y bổ sung giờ tử vong 21:00',
    code: 'f4-1',
    url: '/documents/case_000/phase_3_conclusion/12_bao_cao_phap_y_bo_sung_va_loi_khai_ha_lo_loi.pdf',
    phase: 3,
    order: 150
  },
  {
    id: 'pdf-13',
    title: '13. Tổng hợp SMS, Email & Tin nhắn tình nhân 20:40',
    code: 'f4-3',
    url: '/documents/case_000/phase_3_conclusion/13_tong_hop_tin_nhan_sms_va_email.pdf',
    phase: 3,
    order: 160
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

