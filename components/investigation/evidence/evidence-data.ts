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
    id: 'pdf-03',
    title: '03. Báo cáo tiến độ điều tra ban đầu',
    code: 'f1-3',
    url: '/documents/case_000/phase_0_initial/03_bao_cao_tien_do_dieu_tra.pdf',
    phase: 0,
    order: 30
  },
  {
    id: 'pdf-04',
    title: '04. Báo cáo xác minh nhân thân nạn nhân Khang',
    code: 'f1-4',
    url: '/documents/case_000/phase_0_initial/04_bao_cao_xac_minh_nhan_than_khang.pdf',
    phase: 0,
    order: 40
  },
  {
    id: 'pdf-05',
    title: '05. Báo cáo chuyên đề mâu thuẫn & mối quan hệ',
    code: 'f1-5',
    url: '/documents/case_000/phase_0_initial/05_bao_cao_chuyen_de_mau_thuan_va_quan_he.pdf',
    phase: 0,
    order: 50
  },
  {
    id: 'pdf-06',
    title: '06. Biên bản lấy lời khai hàng xóm',
    code: 'f1-6',
    url: '/documents/case_000/phase_0_initial/06_bien_ban_lay_loi_khai_hang_xom.pdf',
    phase: 0,
    order: 60
  },
  {
    id: 'pdf-07a',
    title: '07a. Lời khai Q&A: Trần Ngọc Mai',
    code: '07a',
    url: '/documents/case_000/phase_0_initial/07a_bien_ban_loi_khai_tran_ngoc_mai.pdf',
    phase: 0,
    order: 70
  },
  {
    id: 'pdf-07b',
    title: '07b. Lời khai Q&A: Lê Quang Vũ',
    code: '07b',
    url: '/documents/case_000/phase_0_initial/07b_bien_ban_loi_khai_le_quang_vu.pdf',
    phase: 0,
    order: 80
  },
  {
    id: 'pdf-07c',
    title: '07c. Lời khai Q&A: Nguyễn Thanh Tùng',
    code: '07c',
    url: '/documents/case_000/phase_0_initial/07c_bien_ban_loi_khai_tung.pdf',
    phase: 0,
    order: 90
  },
  {
    id: 'pdf-07d',
    title: '07d. Lời khai Q&A: Trần Thị Hà (Lời khai đầu)',
    code: '07d',
    url: '/documents/case_000/phase_0_initial/07d_bien_ban_loi_khai_tran_thi_ha.pdf',
    phase: 0,
    order: 100
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
    id: 'pdf-10',
    title: '10. Bản đồ địa chính đất gốc 75m2 & Giấy nợ 350M',
    code: 'f2-3',
    url: '/documents/case_000/phase_1_inheritance/10_ban_do_dia_chinh_va_giay_no_vu.pdf',
    phase: 1,
    order: 130
  },

  // Phase 2: Past Secret & Hide-and-Seek
  {
    id: 'pdf-11',
    title: '11. Biên bản camera cây xăng & Mật mã trốn tìm 1998',
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
    preview: 'Hiện trường phòng khách xáo trộn, bộ bình trà bị đập vỡ vụn trên sàn gỗ kèm đốm máu loang.',
    timestamp: '20:00',
    evidenceId: 'EV-SCENE-OVERVIEW',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/evidence-board-bg.png',
    phase: 0,
    order: 21
  },
  {
    id: 'ev-p3',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p3. Mảnh thủy tinh ceramic 8cm dính máu (Hung khí)',
    preview: 'Mảnh vỡ sắc nhọn 8cm dính vết máu khô và dấu vân tay miết (vật chứng đâm đứt động mạch cảnh).',
    timestamp: '21:00',
    evidenceId: 'EV-GLASS-SHARD',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/means_evidence.png',
    phase: 0,
    order: 22
  },
  {
    id: 'ev-p4',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p4. Khung ảnh gỗ bị đập vỡ & nứt kính (1998)',
    preview: 'Bức ảnh lồng kính gỗ bị đập vỡ vụn dưới sàn phòng khách, mặt kính rạn nứt nếp hình được cho là Cụ Thành đang bế Khang chụp cùng những đứa trẻ hàng xóm năm 1998.',
    timestamp: '20:00',
    evidenceId: 'EV-CHILDHOOD-BROKEN-FRAME',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/trontim.jpg',
    phase: 0,
    order: 23
  },
  {
    id: 'ev-p2',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p2. Ảnh hiện trường các giấy tờ di chúc văng vãi',
    preview: 'Bản vẽ địa chính 75m2 và tờ di chúc bị cày xới nằm gần khoang tủ gỗ âm tường.',
    timestamp: '19:30',
    evidenceId: 'EV-SCATTERED-DOCS',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/motive_evidence.png',
    phase: 1,
    order: 131
  },
  {
    id: 'ev-p5',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p5. Bài báo cũ 1998 về tai nạn ngạt khí tủ gỗ',
    preview: 'Trang nhật báo cắt năm 1998 đưa tin tai nạn ngạt khí tủ gỗ thương tâm của bé Gia Huy.',
    timestamp: '15/10/1998',
    evidenceId: 'EV-OLD-NEWSPAPER',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/newspaper_clipping.png',
    phase: 2,
    order: 141
  },
  {
    id: 'ev-p6',
    caseId: 'case-000',
    kind: 'photo',
    title: 'p6. Ảnh tin nhắn điện thoại tình nhân mới (20:40)',
    preview: 'Màn hình điện thoại nạn nhân sáng tin nhắn tình nhân mới rủ đi du lịch lúc 20:40 PM.',
    timestamp: '20:40',
    evidenceId: 'EV-CHEATING-SMS',
    recoveredBy: 'ĐIỀU TRA VIÊN',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
    thumbnail: '/opportunity_evidence.png',
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
    'Đọc Kết quả giám định 09 để xem phân tích vết tẩy xóa hóa chất và tuổi mực bi dầu 2024.',
    'Khang tẩy tên Mai trên di chúc 2018. Mai có chứng cứ ngoại phạm tại văn phòng luật sư, Vũ có chứng cứ ngoại phạm tại quán nhậu.'
  ],
  'cp-000-2': [
    'Kiểm tra lại báo cáo vết bầm tím sau gáy nạn nhân.',
    'So sánh mốc thời gian Tùng hoảng sợ tháo chạy trên camera (20:15) với mốc giờ tử vong thực tế.'
  ],
  'cp-000-3': [
    'Đối chiếu chi tiết lỡ lời trong lời khai ban đầu của Trần Thị Hà với hiện trường.',
    'Hà khai ở nhà cả tối nhưng lại mô tả chính xác Khang gục ngã cạnh bộ bình trà vỡ (vỡ lúc 20:00 bởi Tùng).'
  ]
}
