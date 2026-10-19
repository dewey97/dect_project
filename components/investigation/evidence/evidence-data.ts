import { PDFDocument, PhysicalEvidence } from './evidence-types'

export const CASE_000_PDFS: PDFDocument[] = [
  // 1 PDF duy nhất để kiểm thử kết xuất PDF gốc & tính năng vẽ/đánh dấu
  {
    id: 'pdf-00-hd',
    title: '00. Cẩm nang hướng dẫn điều tra ban đầu',
    code: '00-HD',
    url: '/documents/case_000/00_khoi_dau/00_huong_dan_ban_dau.pdf',
    phase: 0,
    order: 5
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

