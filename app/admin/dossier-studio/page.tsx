'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  FileText,
  Printer,
  Download,
  Plus,
  Trash2,
  Bold,
  Italic,
  Underline,
  Sparkles,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  Stamp,
  Sliders,
  Palette,
  Check,
  Copy,
  FolderOpen,
  Highlighter,
  MoveUp,
  MoveDown,
  Layers,
  FileCheck,
  UserCheck,
  Image as ImageIcon,
  Save,
  Upload,
  FileDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Data models matching Figma master file
export type DossierMode = 'loi_khai' | 'ly_lich'

export interface PaperConfig {
  size: 'A4' | 'A5'
  orientation: 'portrait' | 'landscape'
}

export interface QABlock {
  id: string
  question: string
  answer: string
  isClue?: boolean
}

export interface LoiKhaiData {
  tagCode: string // e.g. A-19
  docTitle: string
  caseSubtitle: string
  recordLead: string
  investigatorText: string
  subjectName: string
  reasonText: string
  relationText: string
  qaList: QABlock[]
  paperConfig?: PaperConfig
}

export interface LyLichData {
  tagCode: string // e.g. A-17
  idCode: string // e.g. B-381762904
  photoUrl: string
  fullName: string
  nickname: string
  dob: string
  gender: string
  cmnd: string
  permanentAddress: string
  currentAddress: string
  job: string
  phone: string
  maritalStatus: string
  identifyingTraits: string
  criminalRecord: string
  relationWithVictim: string
  archiveNote: string
  caseFileNumber: string
  archiveStatus: string
  signingCity: string
  signingDay: string
  signingMonth: string
  signingYear: string
  investigatorRankAndName: string
  paperConfig?: PaperConfig
}

// Master Presets extracted 1:1 from Figma nodes
const PRESET_LK_VU: LoiKhaiData = {
  tagCode: 'A-19',
  docTitle: 'BIÊN BẢN LẤY LỜI KHAI',
  caseSubtitle: '(Vụ án mạng tại số 14 đường Bờ Sông, Phân khu Cảng)',
  recordLead: 'Vào hồi 16 giờ 00 phút, ngày 25 tháng 07 năm 2016, tại Phòng hỏi cung số 3, Công an TP. Hà Nội.',
  investigatorText: 'Đại úy Lê Minh – Đội Điều tra Vụ án.',
  subjectName: 'Lê Quang Vũ',
  reasonText: 'Triệu tập làm rõ việc có mặt tại nhà nạn nhân chiều tối 24/07',
  relationText: 'Em rể (Chồng của Nguyễn Ngọc Mai)',
  qaList: [
    {
      id: 'q1',
      question: 'Tối ngày 24/07/2016, anh cùng vợ đến nhà nạn nhân Khang lúc mấy giờ và rời đi khi nào?',
      answer: 'Khoảng 18h30 hai vợ chồng tôi đi chung xe máy sang nhà anh Khang. Nói chuyện một lúc thì vợ tôi bực tức ném giấy tờ rồi nổ máy xe phóng về trước. Lúc vợ tôi dắt xe ra thì tôi cũng đi bộ theo ra cổng cùng lúc với vợ tôi, rồi tôi đi bộ ra đầu ngõ mở app đặt xe ôm công nghệ đi nhậu giải sầu. Vợ tôi vừa phóng xe đi là tôi cũng bắt xe đi luôn!'
    },
    {
      id: 'q2',
      question: 'Anh có biết về mâu thuẫn tranh chấp đất đai giữa vợ anh và nạn nhân không?',
      answer: 'Tôi có biết. Mảnh đất 200m² ông nội để lại, anh Khang muốn chiếm trọn để gán nợ cờ bạc nên hai bên cãi vã suốt mấy tháng nay. Vợ tôi chỉ muốn lấy lại phần thừa kế chính đáng.'
    },
    {
      id: 'q3',
      question: 'Anh khai bắt xe đi nhậu, vậy cụ thể anh đi với ai và từ mấy giờ đến mấy giờ?',
      answer: 'Tôi bắt xe ôm ra mấy quán bia hơi vỉa hè ven bờ kè. Đi một mình thôi. Ngồi uống từ tầm 19h15 đến gần 21h00 thì say quá nên đón xe về.',
      isClue: true
    },
    {
      id: 'q4',
      question: 'Sau khi uống bia xong, anh về nhà bằng phương tiện gì và có ai làm chứng không?',
      answer: 'Lúc uống xong tầm gần 21h. Lúc đấy say quá, điện thoại thì hết pin sập nguồn nên tôi vẫy đại một xe ôm dọc đường chở về. Về đến nhà thì lăn ra ngủ, không để ý gì nữa.'
    },
    {
      id: 'q5',
      question: 'Ngoài vợ anh, nạn nhân Khang có mâu thuẫn với ai khác không?',
      answer: 'Anh Khang cho vay nặng lãi nên gây thù chuốc oán nhiều người. Mấy hôm trước tôi còn thấy bức tường trước cổng nhà anh ấy bị xịt sơn đỏ chửi bới dọa mạng nữa cơ.'
    },
    {
      id: 'q6',
      question: 'Còn bản thân anh thì sao, anh có mâu thuẫn gì với nạn nhân Khang không?',
      answer: 'Dạ không... tôi chỉ hỗ trợ vợ trong vụ kiện tụng đất đai thôi chứ không có mâu thuẫn gì với anh Khang cả thưa cán bộ...'
    }
  ],
  paperConfig: { size: 'A4', orientation: 'portrait' }
}

const PRESET_LK_MAI: LoiKhaiData = {
  tagCode: 'A-07',
  docTitle: 'BIÊN BẢN LẤY LỜI KHAI',
  caseSubtitle: '(Vụ án mạng tại số 14 đường Bờ Sông, Phân khu Cảng)',
  recordLead: 'Vào hồi 14 giờ 00 phút, ngày 25 tháng 07 năm 2016, tại Phòng Cảnh sát Hình sự Công an TP. Hà Nội.',
  investigatorText: 'Đại úy Lê Minh – Đội Điều tra Trọng án.',
  subjectName: 'Nguyễn Ngọc Mai',
  reasonText: 'Triệu tập làm rõ việc tranh chấp đất đai và có mặt tại nhà nạn nhân chiều 24/07',
  relationText: 'Em họ (Con chú ruột của nạn nhân Nguyễn Văn Khang)',
  qaList: [
    {
      id: 'qm1',
      question: 'Chiều và tối ngày 24/07/2016, chị ở đâu, làm gì? Hãy trình bày lý do đến nhà nạn nhân Khang.',
      answer: 'Tôi đến nhà anh Khang để giải quyết tranh chấp quyền sở hữu mảnh đất 200m² tại số 14 Đường Bờ Sông. Khoảng 18:30 chiều 24/07, tôi đi xe máy cùng chồng tôi (Lê Quang Vũ) sang đưa Cam kết tự nguyện trả lại đất ép anh Khang ký nhận. Anh Khang thản nhiên cười thách thức. Trong lúc tức giận, tôi ném toàn bộ tài liệu xuống sàn rồi nổ máy xe phóng về nhà trước một mình.'
    },
    {
      id: 'qm2',
      question: 'Chị có thể trình bày rõ hơn về nguồn gốc mảnh đất 200m² và mâu thuẫn tranh chấp giữa hai bên?',
      answer: 'Mảnh đất 200m² tại số 14 Đường Bờ Sông là ông nội để lại cho bố tôi và bố anh Khang. Sau khi ông mất, anh Khang lén lút làm Giấy ủy quyền giả mạo chữ ký của ông nội để mang toàn bộ Sổ đỏ đi thế chấp Ngân hàng vay khoản tiền 1,2 tỷ đồng cho vay nặng lãi. Ngân hàng gửi giấy báo nợ về thì gia đình tôi mới phát hiện. Chúng tôi yêu cầu anh Khang rút sổ đỏ về chia lại thì anh ấy trơ tráo thách thức đi kiện.'
    },
    {
      id: 'qm3',
      question: 'Khi chị rời nhà nạn nhân thì ai ở lại và chị về nhà lúc mấy giờ?',
      answer: 'Tôi nổ máy xe phóng thẳng một mạch về nhà ở số 45 Phố Đoàn Kết lúc khoảng 19:15 - 19:30. Còn chồng tôi (anh Vũ) thì bảo ở lại đi bộ ra đầu ngõ bắt xe ôm đi uống bia với bạn. Về đến nhà tôi tắm rửa rồi bật tivi lên xem, đến khoảng 20h10 thì tivi bị mất tín hiệu do đứt cáp quang ngoài đường.'
    },
    {
      id: 'qm4',
      question: 'Chị có quay lại hiện trường hay trực tiếp gây thương tích cho nạn nhân không?',
      answer: 'Tôi thề danh dự là không bao giờ làm chuyện đó! Tôi là người làm văn phòng, chỉ muốn giải quyết tranh chấp theo pháp luật nên đã thuê luật sư soạn sẵn hồ sơ định nộp đơn kiện lên Tòa án vào tuần tới.'
    }
  ],
  paperConfig: { size: 'A4', orientation: 'portrait' }
}

const PRESET_LK_HA: LoiKhaiData = {
  tagCode: 'A-09',
  docTitle: 'BIÊN BẢN LẤY LỜI KHAI',
  caseSubtitle: '(Vụ án mạng tại số 14 đường Bờ Sông, Phân khu Cảng)',
  recordLead: 'Vào hồi 19 giờ 00 phút, ngày 25 tháng 07 năm 2016, tại Phòng Cảnh sát Hình sự Công an TP. Hà Nội.',
  investigatorText: 'Đại úy Lê Minh – Đội Điều tra Trọng án.',
  subjectName: 'Trần Thị Hà',
  reasonText: 'Lấy lời khai nhân thân bạn gái và xác minh quan hệ tình cảm với nạn nhân',
  relationText: 'Bạn gái (Quan hệ yêu đương 3 năm với nạn nhân)',
  qaList: [
    {
      id: 'qh1',
      question: 'Chị có quan hệ thế nào với nạn nhân Khang và tối hôm qua 24/07 chị ở đâu, làm gì?',
      answer: 'Em và anh Khang yêu nhau được hơn 3 năm rồi thưa cán bộ... Bọn em còn dự định cuối năm nay kết hôn. Tối qua sau khi ăn cơm xong, em ở một mình trong phòng trọ xem phim bộ trên VTV3 cho đỡ buồn. Xem xong phim em khóc rồi đi ngủ chứ không đi đâu cả.'
    },
    {
      id: 'qh2',
      question: 'Dạo gần đây mối quan hệ tình cảm giữa chị và nạn nhân Khang có điều gì bất thường không?',
      answer: 'Dạo gần đây anh Khang hay gắt gỏng vô cớ, đi đêm về hôm và giấu em nhiều chuyện. Em thường phải làm tăng ca kế toán đến 20h tối nên cũng ít gặp anh ấy hơn trước, chứ chúng em không có cãi vã lớn gì cả...'
    },
    {
      id: 'qh3',
      question: 'Chị có biết ai có mâu thuẫn hay thù oán nặng nề với nạn nhân Khang không?',
      answer: 'Anh Khang làm nghề cho vay lãi nặng phức tạp lắm... Mấy con nợ bị siết tiền chắc căm thù anh ấy lắm. Mấy hôm trước tường rào trước cổng nhà còn bị người ta xịt sơn đỏ chửi bới đòi mạng. Em nghi là con nợ giang hồ tìm đến trả thù anh ấy!'
    }
  ],
  paperConfig: { size: 'A4', orientation: 'portrait' }
}

const PRESET_LK_TUNG: LoiKhaiData = {
  tagCode: 'B-02',
  docTitle: 'BIÊN BẢN LẤY LỜI KHAI',
  caseSubtitle: '(Đối tượng nghi vấn: Nguyễn Thanh Tùng)',
  recordLead: 'Vào hồi 19 giờ 30 phút, ngày 25 tháng 07 năm 2016, tại Phòng Cảnh sát Hình sự Công an TP. Hà Nội.',
  investigatorText: 'Đại úy Lê Minh – Đội Điều tra Trọng án.',
  subjectName: 'Nguyễn Thanh Tùng',
  reasonText: 'Xác minh cuộc gọi đến số điện thoại nạn nhân trước thời điểm xảy ra án mạng',
  relationText: 'Bạn thuở nhỏ (Cùng lớn lên tại ngõ Bờ Sông)',
  qaList: [
    {
      id: 'qt1',
      question: 'Nhật ký cuộc gọi cho thấy anh đã gọi cho nạn nhân Khang lúc 19:00 tối 24/07. Cuộc gọi này có nội dung gì?',
      answer: 'Dạ thưa cán bộ... Tối qua lúc 19h00 tôi có gọi điện cho Khang định hỏi vay tạm ít tiền để gửi về quê chữa bệnh cho mẹ. Nhưng Khang gạt phắt đi bảo đang bận việc rồi dập máy cái rụp. Sau đó tôi bắt xe ôm về thẳng phòng trọ ở Cầu Bươu ngủ suốt đêm!'
    },
    {
      id: 'qt2',
      question: 'Sau cuộc gọi đó anh có sang nhà Khang hay gặp mặt Khang vào đêm qua không?',
      answer: 'Tôi thề là không hề gặp mặt nó đêm qua! Bị nó dập máy tôi bực mình đi uống trà đá một lúc rồi về phòng trọ công nhân ở Cầu Bươu ngủ đến sáng hôm sau đi làm.'
    }
  ],
  paperConfig: { size: 'A4', orientation: 'portrait' }
}

const PRESET_HS_VU: LyLichData = {
  tagCode: 'A-17',
  idCode: 'B-381762904',
  photoUrl: '/images/cases/case_000/17.png',
  fullName: 'Lê Quang Vũ',
  nickname: 'Vũ',
  dob: '20-09-1991',
  gender: 'Nam',
  cmnd: '381762904',
  permanentAddress: 'Số 16, Đường Vĩnh Hà, P. Cảng Đông, Q. Hoàng Mai, Hà Nội',
  currentAddress: 'Số 45, Đường Đoàn Kết, P.Cảng Đông, Q. Hoàng Mai, Hà Nội',
  job: 'Kỹ sư điện dân dụng',
  phone: '0967.452.183',
  maritalStatus: 'Đã kết hôn (Vợ: Nguyễn Ngọc Mai, sinh năm 1993)',
  identifyingTraits: 'Cao 1m70, dáng người hơi gầy, nốt ruồi 0.5cm dưới đuôi mắt phải',
  criminalRecord: 'Tiền án: Không có; Tiền sự: Không có.',
  relationWithVictim: 'Em rể (Chồng của Nguyễn Ngọc Mai, em gái nạn nhân Khang)',
  archiveNote: 'Bản trích lục này được lập phục vụ công tác điều tra vụ án hình sự thụ lý số 14/QĐ-ĐT ngày 24/07/2016.',
  caseFileNumber: '14/QĐ-ĐT',
  archiveStatus: 'Đã đối chiếu tàng thư',
  signingCity: 'Hà Nội',
  signingDay: '25',
  signingMonth: '07',
  signingYear: '2016',
  investigatorRankAndName: 'Đại úy Lê Minh',
  paperConfig: { size: 'A4', orientation: 'landscape' }
}

const PRESET_HS_MAI: LyLichData = {
  tagCode: 'A-05',
  idCode: 'B-275190483',
  photoUrl: '/images/cases/case_000/05.png',
  fullName: 'Nguyễn Ngọc Mai',
  nickname: 'Mai',
  dob: '15-05-1992',
  gender: 'Nữ',
  cmnd: '275190483',
  permanentAddress: 'Số 45, Đường Đoàn Kết, P. Cảng Đông, Q. Hoàng Mai, Hà Nội',
  currentAddress: 'Số 45, Đường Đoàn Kết, P. Cảng Đông, Q. Hoàng Mai, Hà Nội',
  job: 'Chuyên viên Hành chính - Nhân sự',
  phone: '0912.456.789',
  maritalStatus: 'Đã kết hôn (Chồng: Lê Quang Vũ)',
  identifyingTraits: 'Nữ, cao 1m62, tóc dài ngang lưng, đeo kính cận gọng đen',
  criminalRecord: 'Tiền án: Không có; Tiền sự: Không có.',
  relationWithVictim: 'Em họ (Con chú ruột của nạn nhân Nguyễn Văn Khang)',
  archiveNote: 'Bản trích lục lập phục vụ điều tra làm rõ mâu thuẫn tranh chấp quyền thừa kế nhà đất.',
  caseFileNumber: '14/QĐ-ĐT',
  archiveStatus: 'Đã đối chiếu tàng thư',
  signingCity: 'Hà Nội',
  signingDay: '25',
  signingMonth: '07',
  signingYear: '2016',
  investigatorRankAndName: 'Đại úy Lê Minh',
  paperConfig: { size: 'A4', orientation: 'landscape' }
}

const PRESET_HS_HA: LyLichData = {
  tagCode: 'A-05C',
  idCode: 'B-001190008271',
  photoUrl: '/images/cases/case_000/07.png',
  fullName: 'Trần Thị Hà',
  nickname: 'Hà "Kế toán"',
  dob: '22-09-1990',
  gender: 'Nữ',
  cmnd: '001190008271',
  permanentAddress: 'Số 8, Ngõ 12, Đường Bờ Kè, P. Phân khu Cảng, Hà Nội',
  currentAddress: 'Số 8, Ngõ 12, Đường Bờ Kè, P. Phân khu Cảng, Hà Nội',
  job: 'Kế toán tổng hợp (Công ty Vận tải Sông Hồng)',
  phone: '0984.112.568',
  maritalStatus: 'Độc thân',
  identifyingTraits: 'Nữ, cao 1m56, dáng người nhỏ gầy, nốt ruồi nhỏ cánh mũi trái',
  criminalRecord: 'Tiền án: Không có; Tiền sự: Không có.',
  relationWithVictim: 'Bạn gái (Có quan hệ tình cảm 3 năm với nạn nhân)',
  archiveNote: 'Bản trích lục nhân thân phục vụ xác minh mối quan hệ tình cảm và di biến động của nạn nhân.',
  caseFileNumber: '14/QĐ-ĐT',
  archiveStatus: 'Đã đối chiếu tàng thư',
  signingCity: 'Hà Nội',
  signingDay: '25',
  signingMonth: '07',
  signingYear: '2016',
  investigatorRankAndName: 'Đại úy Lê Minh',
  paperConfig: { size: 'A4', orientation: 'landscape' }
}

const PRESET_HS_TUNG: LyLichData = {
  tagCode: 'B-03',
  idCode: 'B-412879360',
  photoUrl: '/images/cases/case_000/14.png',
  fullName: 'Nguyễn Thanh Tùng',
  nickname: 'Tùng',
  dob: '18-03-1988',
  gender: 'Nam',
  cmnd: '412879360',
  permanentAddress: 'Số 10, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội',
  currentAddress: 'Phòng trọ công nhân số 18, Phố Cầu Bươu, Hà Nội',
  job: 'Thợ nề / Lao động tự do',
  phone: '0912.331.888',
  maritalStatus: 'Độc thân',
  identifyingTraits: 'Nam, cao 1m72, da ngăm đen, có vết sẹo chữ V ở đuôi lông mày phải',
  criminalRecord: 'Tiền án: Không có; Tiền sự: 01 tiền sự cố ý gây thương tích (2012).',
  relationWithVictim: 'Bạn thuở nhỏ (Cùng lớn lên tại khu Bờ Sông)',
  archiveNote: 'Trích lục hồ sơ xác minh đối tượng có cuộc gọi đến cho nạn nhân lúc 19:03 tối xảy ra án mạng.',
  caseFileNumber: '14/QĐ-ĐT',
  archiveStatus: 'Đã đối chiếu tàng thư',
  signingCity: 'Hà Nội',
  signingDay: '25',
  signingMonth: '07',
  signingYear: '2016',
  investigatorRankAndName: 'Đại úy Lê Minh',
  paperConfig: { size: 'A4', orientation: 'landscape' }
}

// Danh mục tất cả hồ sơ trong kho lưu trữ án
const ALL_LK_PRESETS = [
  { id: 'vu', name: 'Lê Quang Vũ (Lần 1 - [08])', data: PRESET_LK_VU },
  { id: 'mai', name: 'Nguyễn Ngọc Mai (Lần 1 - [07])', data: PRESET_LK_MAI },
  { id: 'ha', name: 'Trần Thị Hà (Lần 1 - [09])', data: PRESET_LK_HA },
  { id: 'tung', name: 'Nguyễn Thanh Tùng (Lần 1 - [B02])', data: PRESET_LK_TUNG },
]

const ALL_HS_PRESETS = [
  { id: 'vu', name: 'Lê Quang Vũ (Em rể - [05b])', data: PRESET_HS_VU },
  { id: 'mai', name: 'Nguyễn Ngọc Mai (Em họ - [05a])', data: PRESET_HS_MAI },
  { id: 'ha', name: 'Trần Thị Hà (Bạn gái - [05c])', data: PRESET_HS_HA },
  { id: 'tung', name: 'Nguyễn Thanh Tùng (Bạn cũ - [B03])', data: PRESET_HS_TUNG },
]

const STORAGE_KEY_LK = 'xplore_dossier_studio_lk_v1'
const STORAGE_KEY_HS = 'xplore_dossier_studio_hs_v1'

export default function DossierStudioPage() {
  const [mode, setMode] = useState<DossierMode>('loi_khai')
  const [lkData, setLkData] = useState<LoiKhaiData>(PRESET_LK_VU)
  const [hsData, setHsData] = useState<LyLichData>(PRESET_HS_VU)

  // Khổ giấy & Hướng lưu riêng biệt cho từng loại hồ sơ:
  // - Biên bản lời khai (LK): Mặc định A4 Dọc
  // - Lý lịch tư pháp (HS): Mặc định A4 Ngang
  const [lkPaper, setLkPaper] = useState<PaperConfig>({ size: 'A4', orientation: 'portrait' })
  const [hsPaper, setHsPaper] = useState<PaperConfig>({ size: 'A4', orientation: 'landscape' })

  // Paper config đang active theo mode hiện tại
  const paperSize = mode === 'loi_khai' ? lkPaper.size : hsPaper.size
  const paperOrientation = mode === 'loi_khai' ? lkPaper.orientation : hsPaper.orientation

  const setPaperSize = (size: 'A4' | 'A5') => {
    if (mode === 'loi_khai') {
      setLkPaper(prev => ({ ...prev, size }))
    } else {
      setHsPaper(prev => ({ ...prev, size }))
    }
  }

  const setPaperOrientation = (orientation: 'portrait' | 'landscape') => {
    if (mode === 'loi_khai') {
      setLkPaper(prev => ({ ...prev, orientation }))
    } else {
      setHsPaper(prev => ({ ...prev, orientation }))
    }
  }

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedLk = localStorage.getItem(STORAGE_KEY_LK)
        if (savedLk) {
          const parsed = JSON.parse(savedLk)
          setLkData(parsed)
          if (parsed.paperConfig) setLkPaper(parsed.paperConfig)
        }
        const savedHs = localStorage.getItem(STORAGE_KEY_HS)
        if (savedHs) {
          const parsed = JSON.parse(savedHs)
          setHsData(parsed)
          if (parsed.paperConfig) setHsPaper(parsed.paperConfig)
        }
      }
    } catch (e) {
      console.warn('Could not load saved dossier from localStorage:', e)
    }
  }, [])

  // Zoom & UI state
  const [zoomScale, setZoomScale] = useState(1)
  const zoomScaleRef = useRef(zoomScale)
  zoomScaleRef.current = zoomScale

  const [showSeal, setShowSeal] = useState(true)
  const [sealAngle, setSealAngle] = useState(-5)
  const [copiedNotification, setCopiedNotification] = useState(false)
  const [savedNotification, setSavedNotification] = useState(false)

  // Nút Lưu Dữ Liệu vào LocalStorage
  const handleSaveData = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        if (mode === 'loi_khai') {
          const toSave = { ...lkData, paperConfig: lkPaper }
          localStorage.setItem(STORAGE_KEY_LK, JSON.stringify(toSave))
        } else {
          const toSave = { ...hsData, paperConfig: hsPaper }
          localStorage.setItem(STORAGE_KEY_HS, JSON.stringify(toSave))
        }
        setSavedNotification(true)
        setTimeout(() => setSavedNotification(false), 2500)
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }, [mode, lkData, hsData, lkPaper, hsPaper])

  // Khôi phục về mẫu gốc ban đầu (Reset preset)
  const handleResetPreset = useCallback(() => {
    if (!window.confirm('Bạn có chắc muốn khôi phục về mẫu ban đầu? Toàn bộ thay đổi chưa lưu vào file sẽ bị ghi đè.')) return
    if (mode === 'loi_khai') {
      setLkData(PRESET_LK_VU)
      setLkPaper({ size: 'A4', orientation: 'portrait' })
      localStorage.removeItem(STORAGE_KEY_LK)
    } else {
      setHsData(PRESET_HS_VU)
      setHsPaper({ size: 'A4', orientation: 'landscape' })
      localStorage.removeItem(STORAGE_KEY_HS)
    }
  }, [mode])

  // Tải về file JSON lưu trữ lâu dài
  const handleDownloadJson = useCallback(() => {
    const payload = mode === 'loi_khai' ? { ...lkData, paperConfig: lkPaper } : { ...hsData, paperConfig: hsPaper }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${mode === 'loi_khai' ? 'bien_ban_loi_khai' : 'ly_lich_tu_phap'}_${(mode === 'loi_khai' ? lkData.tagCode : hsData.tagCode) || 'doc'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [mode, lkData, hsData, lkPaper, hsPaper])

  // Nạp tệp JSON từ máy tính
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (mode === 'loi_khai' && parsed.qaList) {
          setLkData(parsed)
          if (parsed.paperConfig) setLkPaper(parsed.paperConfig)
          alert('Đã nạp thành công Biên bản lời khai từ tệp!')
        } else if (mode === 'ly_lich' && (parsed.fullName || parsed.cmnd)) {
          setHsData(parsed)
          if (parsed.paperConfig) setHsPaper(parsed.paperConfig)
          alert('Đã nạp thành công Bảng trích lục lý lịch từ tệp!')
        } else {
          alert('Tệp JSON không đúng định dạng của loại hồ sơ đang chọn!')
        }
      } catch (err) {
        alert('Lỗi nạp tệp JSON: định dạng không hợp lệ!')
      }
    }
  }

  // Canvas viewport container ref
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // Context-aware Zoom listener (Chung chuẩn với Map Studio):
  // - Khi chuột ở TRONG Canvas: Ctrl / Command + Wheel: Zoom Canvas mượt mà, chặn Browser Zoom
  // - Khi chuột ở NGOÀI Canvas: Hệ thống không can thiệp, trình duyệt tự do nhận Ctrl + Wheel để Browser Zoom tổng thể
  useEffect(() => {
    const container = canvasContainerRef.current
    if (!container) return

    const onNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        e.stopPropagation()

        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92
        const currentZoom = zoomScaleRef.current
        const newZoom = Math.min(2.5, Math.max(0.35, Math.round(currentZoom * zoomFactor * 100) / 100))
        setZoomScale(newZoom)
      }
    }

    container.addEventListener('wheel', onNativeWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', onNativeWheel)
    }
  }, [])

  // Print PDF trigger
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // Manipulation for LK
  const addLkQuestion = (index?: number) => {
    const newQ: QABlock = {
      id: `q_${Date.now()}`,
      question: '............................................................................',
      answer: '............................................................................'
    }
    const updated = [...lkData.qaList]
    if (typeof index === 'number') {
      updated.splice(index + 1, 0, newQ)
    } else {
      updated.push(newQ)
    }
    setLkData(prev => ({ ...prev, qaList: updated }))
  }

  const removeLkQuestion = (id: string) => {
    if (lkData.qaList.length <= 1) return
    setLkData(prev => ({
      ...prev,
      qaList: prev.qaList.filter(item => item.id !== id)
    }))
  }

  const moveLkQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= lkData.qaList.length) return
    const updated = [...lkData.qaList]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp
    setLkData(prev => ({ ...prev, qaList: updated }))
  }

  // Tùy chỉnh số câu hỏi trên mỗi trang (Items per page) hoặc tự động tính theo khổ giấy
  // Khổ A4 Dọc thường chứa ~4 câu ở Trang 1 (vì có tiêu đề hành chính) và ~5 câu ở các trang sau
  // Khổ A5 Dọc nhỏ hơn nên Trang 1 chỉ chứa ~2 câu, trang sau chứa ~3 câu
  const [itemsPerPageConfig, setItemsPerPageConfig] = useState<number>(0) // 0: Auto

  const defaultPage1Capacity = paperSize === 'A4' ? (paperOrientation === 'portrait' ? 4 : 2) : (paperOrientation === 'portrait' ? 2 : 1)
  const defaultSubsequentCapacity = paperSize === 'A4' ? (paperOrientation === 'portrait' ? 5 : 3) : (paperOrientation === 'portrait' ? 3 : 2)

  const page1Capacity = itemsPerPageConfig > 0 ? itemsPerPageConfig : defaultPage1Capacity
  const subsequentCapacity = itemsPerPageConfig > 0 ? itemsPerPageConfig + 1 : defaultSubsequentCapacity

  // Thuật toán cắt trang hợp lý cho Biên bản Lời Khai:
  // - Trang 1: Chứa Quốc hiệu, Tiêu đề, Căn cứ vụ án, Thành phần tham gia, NỘI DUNG LỜI KHAI và page1Capacity câu hỏi đầu tiên.
  // - Trang 2, 3...: Chứa tiếp tục các câu hỏi theo subsequentCapacity.
  // - Trang cuối: Chứa khối cam kết, xác nhận của người khai và điều tra viên, chữ ký và Pill Tag mã chứng cứ.
  const lkPages = React.useMemo(() => {
    const list = lkData.qaList
    if (list.length <= page1Capacity) {
      return [{ pageNumber: 1, items: list, isFirst: true, isLast: true }]
    }

    const pages: { pageNumber: number; items: QABlock[]; isFirst: boolean; isLast: boolean }[] = []
    // Page 1
    pages.push({
      pageNumber: 1,
      items: list.slice(0, page1Capacity),
      isFirst: true,
      isLast: false
    })

    let currentIndex = page1Capacity
    let pageNum = 2
    while (currentIndex < list.length) {
      const nextSlice = list.slice(currentIndex, currentIndex + subsequentCapacity)
      currentIndex += subsequentCapacity
      pages.push({
        pageNumber: pageNum,
        items: nextSlice,
        isFirst: false,
        isLast: currentIndex >= list.length
      })
      pageNum++
    }

    return pages
  }, [lkData.qaList, page1Capacity, subsequentCapacity])

  return (
    <div className="h-screen h-dvh w-full bg-[#111315] text-[#e0e2e5] flex flex-col overflow-hidden antialiased selection:bg-amber-500/30">
      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          /* Reset tất cả các wrapper bên ngoài để không ảnh hưởng đến tỷ lệ in */
          div[class*="h-screen"],
          main,
          div[class*="flex-1"],
          div[class*="min-w-fit"] {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            display: block !important;
            width: 100% !important;
          }
          /* Khử transform scale của zoom controls khi in */
          div[style*="transform"] {
            transform: none !important;
            gap: 0 !important;
            display: block !important;
          }
          .print-page-break {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-canvas-lk {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            min-height: 100vh !important;
            height: 100% !important;
            max-width: 100% !important;
            padding: ${paperSize === 'A4' ? '18mm 20mm' : '12mm 12mm'} !important;
            margin: 0 !important;
            transform: none !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .print-canvas-hs {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            min-height: 100vh !important;
            height: 100% !important;
            max-width: 100% !important;
            padding: ${paperSize === 'A4' ? '8mm 8mm' : '5mm 5mm'} !important;
            margin: 0 !important;
            transform: none !important;
            box-sizing: border-box !important;
            display: flex !important;
          }
          @page {
            size: ${paperSize} ${paperOrientation};
            margin: 0mm;
          }
        }
      `}</style>

      {/* Top Header Navigation */}
      <header className="no-print h-14 border-b border-white/10 bg-[#16181b] px-4 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Admin</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />

          {/* Document Type Selector (2 Loại Hồ Sơ Cốt Lõi) */}
          <div className="flex items-center bg-black/50 p-1 rounded-lg border border-white/10 text-xs font-medium">
            <button
              onClick={() => setMode('loi_khai')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all",
                mode === 'loi_khai'
                  ? "bg-amber-500 text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Biên bản Lời khai (LK)</span>
            </button>
            <button
              onClick={() => setMode('ly_lich')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all",
                mode === 'ly_lich'
                  ? "bg-amber-500 text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>2. Lý lịch tư pháp (HS)</span>
            </button>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Quick Preset Selector for Characters */}
          <div className="flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-lg border border-white/10 text-xs">
            <span className="text-[11px] text-neutral-400 select-none">Hồ sơ:</span>
            <select
              value={mode === 'loi_khai' ? (ALL_LK_PRESETS.find(p => p.data.subjectName === lkData.subjectName)?.id || '') : (ALL_HS_PRESETS.find(p => p.data.fullName === hsData.fullName)?.id || '')}
              onChange={(e) => {
                const selectedId = e.target.value
                if (mode === 'loi_khai') {
                  const target = ALL_LK_PRESETS.find(p => p.id === selectedId)
                  if (target) {
                    setLkData(target.data)
                    if (target.data.paperConfig) setLkPaper(target.data.paperConfig)
                  }
                } else {
                  const target = ALL_HS_PRESETS.find(p => p.id === selectedId)
                  if (target) {
                    setHsData(target.data)
                    if (target.data.paperConfig) setHsPaper(target.data.paperConfig)
                  }
                }
              }}
              className="bg-black/60 border border-white/15 rounded px-2 py-0.5 text-amber-300 font-medium focus:outline-none focus:border-amber-500 cursor-pointer text-xs"
            >
              <option value="" disabled>-- Chọn hồ sơ vụ án --</option>
              {mode === 'loi_khai' ? (
                ALL_LK_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              ) : (
                ALL_HS_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Paper Size & Orientation Selector */}
          <div className="flex items-center bg-black/50 p-1 rounded-lg border border-white/10 text-xs font-medium gap-1">
            <span className="text-[11px] text-neutral-400 px-1 select-none">Khổ:</span>
            <button
              onClick={() => setPaperSize('A4')}
              className={cn(
                "px-2.5 py-1 rounded transition-all font-mono",
                paperSize === 'A4'
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              A4
            </button>
            <button
              onClick={() => setPaperSize('A5')}
              className={cn(
                "px-2.5 py-1 rounded transition-all font-mono",
                paperSize === 'A5'
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              A5
            </button>
          </div>

          {/* Orientation Selector */}
          <div className="flex items-center bg-black/50 p-1 rounded-lg border border-white/10 text-xs font-medium gap-1">
            <button
              onClick={() => setPaperOrientation('portrait')}
              className={cn(
                "px-2.5 py-1 rounded transition-all",
                paperOrientation === 'portrait'
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              Dọc
            </button>
            <button
              onClick={() => setPaperOrientation('landscape')}
              className={cn(
                "px-2.5 py-1 rounded transition-all",
                paperOrientation === 'landscape'
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              Ngang
            </button>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-black/40 rounded-lg p-0.5 border border-white/10 text-xs text-neutral-400">
            <button
              onClick={() => setZoomScale(z => Math.max(0.5, z - 0.1))}
              className="p-1 hover:text-white hover:bg-white/5 rounded"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono min-w-[36px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(z => Math.min(1.4, z + 0.1))}
              className="p-1 hover:text-white hover:bg-white/5 rounded"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(paperSize === 'A5' ? 1.1 : (mode === 'loi_khai' ? 1 : 0.85))}
              className="p-1 hover:text-white hover:bg-white/5 rounded text-[10px]"
            >
              Fit
            </button>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Hidden File Input for Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
            title="Nạp tệp JSON từ máy tính"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nạp</span>
          </button>

          {/* Export JSON File */}
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
            title="Tải về tệp JSON để lưu trữ"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải JSON</span>
          </button>

          {/* Reset Preset */}
          <button
            onClick={handleResetPreset}
            className="p-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-colors"
            title="Khôi phục mẫu gốc ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Save Button (LocalStorage) */}
          <button
            onClick={handleSaveData}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm",
              savedNotification
                ? "bg-emerald-500 text-black shadow-emerald-500/20"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95"
            )}
            title="Lưu lại toàn bộ dữ liệu và cấu hình khổ giấy vào trình duyệt"
          >
            {savedNotification ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedNotification ? 'Đã lưu!' : 'Lưu'}</span>
          </button>

          {/* Print PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Xuất PDF {paperSize} Vector</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 min-h-0 w-full flex overflow-hidden">
        {/* Left Sidebar: Quick Config */}
        <aside className="no-print w-72 h-full min-h-0 border-r border-white/10 bg-[#141618] flex flex-col flex-shrink-0 z-20 p-4 space-y-4 text-xs overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Tùy Chỉnh {mode === 'loi_khai' ? 'Lời Khai' : 'Lý Lịch'}
            </span>
          </div>

          {/* Chọn nhanh Hồ sơ nhân vật (Kho án mẫu) */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg space-y-1.5">
            <label className="text-amber-400 font-semibold block text-[11px] uppercase tracking-wider">
              📂 Chọn Hồ Sơ Nhân Vật:
            </label>
            <select
              value={mode === 'loi_khai' ? (ALL_LK_PRESETS.find(p => p.data.subjectName === lkData.subjectName)?.id || '') : (ALL_HS_PRESETS.find(p => p.data.fullName === hsData.fullName)?.id || '')}
              onChange={(e) => {
                const selectedId = e.target.value
                if (mode === 'loi_khai') {
                  const target = ALL_LK_PRESETS.find(p => p.id === selectedId)
                  if (target) {
                    setLkData(target.data)
                    if (target.data.paperConfig) setLkPaper(target.data.paperConfig)
                  }
                } else {
                  const target = ALL_HS_PRESETS.find(p => p.id === selectedId)
                  if (target) {
                    setHsData(target.data)
                    if (target.data.paperConfig) setHsPaper(target.data.paperConfig)
                  }
                }
              }}
              className="w-full bg-[#1c1f24] border border-amber-500/30 rounded px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer text-xs"
            >
              <option value="" disabled>-- Chọn hồ sơ mẫu vụ án --</option>
              {mode === 'loi_khai' ? (
                ALL_LK_PRESETS.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#141618] text-white py-1">{p.name}</option>
                ))
              ) : (
                ALL_HS_PRESETS.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#141618] text-white py-1">{p.name}</option>
                ))
              )}
            </select>
          </div>

          {mode === 'loi_khai' ? (
            <>
              <div>
                <label className="text-neutral-400 mb-1 block">Mã Tag chứng cứ (Pill Tag)</label>
                <input
                  type="text"
                  value={lkData.tagCode}
                  onChange={e => setLkData({ ...lkData, tagCode: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 mb-1 block">Tên người được lấy lời khai</label>
                <input
                  type="text"
                  value={lkData.subjectName}
                  onChange={e => setLkData({ ...lkData, subjectName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 mb-1 block">Mối quan hệ với nạn nhân</label>
                <input
                  type="text"
                  value={lkData.relationText}
                  onChange={e => setLkData({ ...lkData, relationText: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 mb-1 block">Điều tra viên</label>
                <input
                  type="text"
                  value={lkData.investigatorText}
                  onChange={e => setLkData({ ...lkData, investigatorText: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-300">Danh sách câu hỏi ({lkData.qaList.length})</span>
                  <button
                    onClick={() => addLkQuestion()}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm câu</span>
                  </button>
                </div>

                <div className="bg-black/30 p-2.5 rounded border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Số trang ước tính:</span>
                    <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                      {lkPages.length} trang
                    </span>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Cắt câu hỏi / trang:</label>
                    <select
                      value={itemsPerPageConfig}
                      onChange={e => setItemsPerPageConfig(parseInt(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-neutral-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>Tự động ({paperSize === 'A4' ? '4 câu trang đầu / 5 câu trang sau' : '2 câu trang đầu / 3 câu trang sau'})</option>
                      <option value={1}>Cực thoáng (1-2 câu/trang)</option>
                      <option value={2}>Thoáng (2-3 câu/trang)</option>
                      <option value={3}>Tiêu chuẩn (3-4 câu/trang)</option>
                      <option value={4}>Dày dặn (4-5 câu/trang)</option>
                      <option value={5}>Rất dày (5-6 câu/trang)</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-neutral-400 mb-1 block">Mã Tag chứng cứ (Góc phải)</label>
                <input
                  type="text"
                  value={hsData.tagCode}
                  onChange={e => setHsData({ ...hsData, tagCode: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 mb-1 block">Mã định danh (Góc trái)</label>
                <input
                  type="text"
                  value={hsData.idCode}
                  onChange={e => setHsData({ ...hsData, idCode: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 font-mono text-neutral-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 mb-1 block">Ảnh chân dung 3x4 (URL / Path)</label>
                <input
                  type="text"
                  value={hsData.photoUrl}
                  onChange={e => setHsData({ ...hsData, photoUrl: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 font-mono text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 mb-1 block">Họ và tên đối tượng</label>
                <input
                  type="text"
                  value={hsData.fullName}
                  onChange={e => setHsData({ ...hsData, fullName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 mb-1 block">Sinh ngày</label>
                  <input
                    type="text"
                    value={hsData.dob}
                    onChange={e => setHsData({ ...hsData, dob: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 mb-1 block">Giới tính</label>
                  <input
                    type="text"
                    value={hsData.gender}
                    onChange={e => setHsData({ ...hsData, gender: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 mb-1 block">Số CMND / Thẻ căn cước</label>
                <input
                  type="text"
                  value={hsData.cmnd}
                  onChange={e => setHsData({ ...hsData, cmnd: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300 font-medium">Dấu đỏ giáp lai & PC02</span>
                  <input
                    type="checkbox"
                    checked={showSeal}
                    onChange={e => setShowSeal(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                </div>
                {showSeal && (
                  <div>
                    <div className="flex justify-between text-neutral-400 mb-1">
                      <span>Độ nghiêng con dấu</span>
                      <span className="font-mono text-amber-400">{sealAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="-15"
                      max="15"
                      value={sealAngle}
                      onChange={e => setSealAngle(parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

        {/* Center Workspace: Realistic Pixel-Perfect Figma Documents */}
        <main
          ref={canvasContainerRef}
          className="flex-1 h-full min-h-0 overflow-y-auto overflow-x-auto bg-[#0a0c0e] py-8 px-6"
        >
          <div className="min-w-fit min-h-fit flex flex-col items-center mx-auto pb-20">
            {mode === 'loi_khai' ? (
            /* ========================================================================= */
            /* 1. BIÊN BẢN LẤY LỜI KHAI (LK) - MULTI-PAGE PAGINATION FOR A4 & A5         */
            /* ========================================================================= */
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className="flex flex-col items-center gap-10"
            >
              {lkPages.map((page) => (
                <div
                  key={`lk_page_${page.pageNumber}`}
                  style={{
                    fontFamily: 'EB Garamond, serif',
                    width: paperSize === 'A4'
                      ? (paperOrientation === 'portrait' ? '794px' : '1123px')
                      : (paperOrientation === 'portrait' ? '559px' : '794px'),
                    minHeight: paperSize === 'A4'
                      ? (paperOrientation === 'portrait' ? '1123px' : '794px')
                      : (paperOrientation === 'portrait' ? '794px' : '559px')
                  }}
                  className={cn(
                    "print-canvas-lk bg-white shadow-2xl relative select-text text-[#171717] flex flex-col justify-between print-page-break",
                    paperSize === 'A4' ? "p-[55px]" : "p-[35px]"
                  )}
                >
                  <div>
                    {/* Header: Chỉ hiện ở Trang 1 (Hoặc tiêu đề rút gọn ở các trang sau) */}
                    {page.isFirst ? (
                      <>
                        <div className="text-center space-y-1.5 mb-5">
                          <h1
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={e => setLkData({ ...lkData, docTitle: e.currentTarget.textContent || '' })}
                            className={cn(
                              "font-bold tracking-[0.05em] uppercase text-[#171717] leading-[1.33] outline-none",
                              paperSize === 'A4' ? "text-[24px]" : "text-[20px]"
                            )}
                          >
                            {lkData.docTitle}
                          </h1>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={e => setLkData({ ...lkData, caseSubtitle: e.currentTarget.textContent || '' })}
                            className={cn(
                              "text-[#404040] leading-[1.37] outline-none",
                              paperSize === 'A4' ? "text-[16px]" : "text-[14px]"
                            )}
                          >
                            {lkData.caseSubtitle}
                          </p>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={e => setLkData({ ...lkData, recordLead: e.currentTarget.textContent || '' })}
                            className={cn(
                              "text-[#1A1A1A] leading-[1.27] text-left pt-1.5 outline-none",
                              paperSize === 'A4' ? "text-[15.5px]" : "text-[13.5px]"
                            )}
                          >
                            {lkData.recordLead}
                          </p>
                        </div>

                        {/* Section - Administrative and Officers Info */}
                        <div className={cn(
                          "space-y-1.5 mb-5 text-[#1A1A1A]",
                          paperSize === 'A4' ? "text-[15.5px] leading-[1.37]" : "text-[13.5px] leading-[1.3]"
                        )}>
                          <div className="font-bold uppercase tracking-[0.02em] text-[#171717]">
                            CHÚNG TÔI GỒM:
                          </div>
                          <div className="pl-4 space-y-1">
                            <div>
                              <span>Điều tra viên: </span>
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={e => setLkData({ ...lkData, investigatorText: e.currentTarget.textContent || '' })}
                                className="outline-none"
                              >
                                {lkData.investigatorText}
                              </span>
                            </div>
                            <div>
                              <span>Người được lấy lời khai: </span>
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={e => setLkData({ ...lkData, subjectName: e.currentTarget.textContent || '' })}
                                className="font-bold text-[#171717] outline-none"
                              >
                                {lkData.subjectName}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold tracking-[0.02em] uppercase text-[#262626]">
                                Lý do lấy lời khai:{' '}
                              </span>
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={e => setLkData({ ...lkData, reasonText: e.currentTarget.textContent || '' })}
                                className="text-[#171717] outline-none"
                              >
                                {lkData.reasonText}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold tracking-[0.02em] uppercase text-[#262626]">
                                Mối quan hệ với nạn nhân:{' '}
                              </span>
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={e => setLkData({ ...lkData, relationText: e.currentTarget.textContent || '' })}
                                className="text-[#171717] outline-none"
                              >
                                {lkData.relationText}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Section Title Header: NỘI DUNG LỜI KHAI (HỎI VÀ ĐÁP) */}
                        <div className="mb-3.5 pb-1 border-b-2 border-[#262626]">
                          <h2 className={cn(
                            "font-bold uppercase tracking-[0.04em] text-[#171717]",
                            paperSize === 'A4' ? "text-[16px]" : "text-[14px]"
                          )}>
                            NỘI DUNG LỜI KHAI (HỎI VÀ ĐÁP)
                          </h2>
                        </div>
                      </>
                    ) : (
                      /* Header trang tiếp theo */
                      <div className="mb-4 pb-2 border-b border-[#262626]/20 flex justify-between items-baseline text-neutral-500">
                        <span className="text-[12px] uppercase font-bold tracking-wider text-[#171717]">
                          {lkData.docTitle} (TIẾP THEO)
                        </span>
                        <span className="text-[11px] font-mono">
                          Trang {page.pageNumber}/{lkPages.length}
                        </span>
                      </div>
                    )}

                    {/* Q&A Content Cards for this Page */}
                    <div className="space-y-3">
                      {page.items.map((item) => {
                        const globalIndex = lkData.qaList.findIndex(q => q.id === item.id)
                        return (
                          <div
                            key={item.id}
                            className="group relative rounded-[4px] border border-[#E5E5E5] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden"
                          >
                            {/* Floating actions on hover */}
                            <div className="no-print absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white rounded px-1.5 py-0.5 flex items-center gap-1 text-[11px] z-10">
                              <button
                                onClick={() => moveLkQuestion(globalIndex, 'up')}
                                disabled={globalIndex === 0}
                                className="p-1 hover:bg-white/20 rounded disabled:opacity-30"
                                title="Lên trên"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveLkQuestion(globalIndex, 'down')}
                                disabled={globalIndex === lkData.qaList.length - 1}
                                className="p-1 hover:bg-white/20 rounded disabled:opacity-30"
                                title="Xuống dưới"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => addLkQuestion(globalIndex)}
                                className="p-1 hover:bg-white/20 rounded text-emerald-400"
                                title="Chèn câu hỏi dưới"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => removeLkQuestion(item.id)}
                                className="p-1 hover:bg-red-500/30 rounded text-red-400"
                                title="Xóa câu này"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Question Row (Gray Header Bar with 2px Left Accent) */}
                            <div className={cn(
                              "bg-[#E5E5E5] border-l-2 border-[#262626] px-4 py-2 text-[#171717] leading-[1.35] text-justify font-normal flex items-start gap-2",
                              paperSize === 'A4' ? "text-[15.5px]" : "text-[13.5px]"
                            )}>
                              <span className="font-bold select-none flex-shrink-0" contentEditable={false}>
                                Hỏi:
                              </span>
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={e => {
                                  const val = e.currentTarget.textContent || ''
                                  setLkData(prev => ({
                                    ...prev,
                                    qaList: prev.qaList.map(q => q.id === item.id ? { ...q, question: val } : q)
                                  }))
                                }}
                                className="outline-none flex-1 min-w-0"
                              >
                                {item.question.replace(/^Hỏi:\s*/i, '')}
                              </div>
                            </div>

                            {/* Answer Row (White Content Bar with 2px Left Accent) */}
                            <div className={cn(
                              "bg-white border-l-2 border-[#262626] px-4 py-2.5 text-[#262626] leading-[1.35] text-justify font-normal flex items-start gap-2",
                              paperSize === 'A4' ? "text-[15.5px]" : "text-[13.5px]"
                            )}>
                              <span className="font-bold select-none flex-shrink-0" contentEditable={false}>
                                Đáp:
                              </span>
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={e => {
                                  const val = e.currentTarget.textContent || ''
                                  setLkData(prev => ({
                                    ...prev,
                                    qaList: prev.qaList.map(q => q.id === item.id ? { ...q, answer: val } : q)
                                  }))
                                }}
                                className="outline-none flex-1 min-w-0"
                              >
                                {item.answer.replace(/^Đáp:\s*/i, '')}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bottom Footer Section: Page Counter & Tag Pill */}
                  <div className="pt-6 border-t border-neutral-200/60 mt-6 flex justify-between items-center text-[12px] text-neutral-500">
                    <span className="font-mono">
                      Trang {page.pageNumber} / {lkPages.length}
                    </span>

                    {/* Bottom Right Evidence Tag Pill: Exact Figma Frame 5 */}
                    <div className="bg-[#D9D9D9] border border-black rounded-[90px] px-3.5 py-0.5 text-black font-medium text-[15px] leading-tight min-w-[50px] text-center">
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => setLkData({ ...lkData, tagCode: e.currentTarget.textContent || '' })}
                        className="outline-none font-medium"
                      >
                        {lkData.tagCode}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ========================================================================= */
            /* 2. BẢNG TRÍCH LỤC LÝ LỊCH TƯ PHÁP (HS) - EXACT FIGMA & A4/A5 SPLIT         */
            /* ========================================================================= */
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className={cn(
                "flex items-center justify-center",
                paperSize === 'A5' && paperOrientation === 'portrait' ? "flex-col gap-10" : ""
              )}
            >
              {/* Nếu là A5 Dọc: Cắt thành 2 tờ A5 riêng biệt (Sheet 1: Thông tin cá nhân, Sheet 2: Căn cứ & Chứng nhận)
                  Nếu là A4 Ngang hoặc A5 Ngang: Giữ nguyên 2 nửa song song trên 1 trang trải rộng */}
              {paperSize === 'A5' && paperOrientation === 'portrait' ? (
                <>
                  {/* Sheet 1: THÔNG TIN CÁ NHÂN & ẢNH NGHI PHẠM (A5 Dọc: 559px x 794px) */}
                  <div className="print-canvas-hs print-page-break w-[559px] min-h-[794px] bg-[#FAF7EE] p-6 shadow-2xl relative select-text text-[#171717] flex flex-col justify-between border border-[#171717]">
                    <div>
                      {/* National Header */}
                      <div className="text-center space-y-0.5 mb-3">
                        <div className="font-sans font-bold text-[11px] uppercase tracking-[0.05em] text-[#262626]">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </div>
                        <div style={{ fontFamily: 'EB Garamond, serif' }} className="font-bold text-[12px] text-[#262626]">
                          Độc lập - Tự do - Hạnh phúc
                        </div>
                        <div className="w-24 h-px bg-[#262626] mx-auto my-1" />
                      </div>

                      {/* Title */}
                      <div className="text-center mb-4">
                        <h2
                          style={{ fontFamily: 'EB Garamond, serif' }}
                          className="font-bold text-[17px] uppercase tracking-[-0.025em] text-[#171717] leading-tight"
                        >
                          BẢNG TRÍCH LỤC LÝ LỊCH TƯ PHÁP
                        </h2>
                        <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-[11.5px] text-[#404040]">
                          Cơ quan Cảnh sát Điều tra TP. Hà Nội
                        </p>
                      </div>

                      {/* Identity Section: Photo (3x4) + Details */}
                      <div className="flex gap-4 items-start mb-4">
                        {/* Suspect Photo 3x4 */}
                        <div className="w-[96px] h-[128px] border border-[#D4D4D4] shadow-sm relative flex-shrink-0 bg-neutral-200 overflow-hidden">
                          {hsData.photoUrl ? (
                            <img
                              src={hsData.photoUrl}
                              alt="Ảnh nhận diện"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-[10px]">
                              <ImageIcon className="w-6 h-6 mb-1 text-neutral-400" />
                              <span>Ảnh 3x4</span>
                            </div>
                          )}

                          {/* Giáp Lai Stamp */}
                          {showSeal && (
                            <div
                              style={{
                                transform: `rotate(${sealAngle}deg)`,
                                transformOrigin: 'center center'
                              }}
                              className="absolute -right-10 top-6 w-24 h-24 pointer-events-none select-none opacity-85 mix-blend-multiply"
                            >
                              <svg viewBox="0 0 200 200" className="w-full h-full text-red-600" fill="currentColor">
                                <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="3" fill="none" />
                                <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="3 1" />
                                <circle cx="100" cy="100" r="54" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <polygon points="100,65 108,82 128,82 112,95 118,114 100,103 82,114 88,95 72,82 92,82" fill="currentColor" />
                                <path id="topCurveMini1" d="M 22 100 A 78 78 0 0 1 178 100" fill="none" />
                                <text className="text-[14px] font-bold uppercase tracking-[2px]" fill="currentColor">
                                  <textPath href="#topCurveMini1" startOffset="50%" textAnchor="middle">
                                    CÔNG AN TP. HÀ NỘI
                                  </textPath>
                                </text>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Right of Photo Fields */}
                        <div className="flex-1 space-y-2 text-[13px]" style={{ fontFamily: 'EB Garamond, serif' }}>
                          <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                            <span className="text-[#171717] font-medium flex-shrink-0">Họ và tên:</span>
                            <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-bold text-[17px] leading-none">
                              {hsData.fullName}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                            <span className="text-[#404040] text-[12px]">Tên thường gọi:</span>
                            <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[16px] leading-none">
                              {hsData.nickname}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between border-b border-[#D4D4D4] pb-0.5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-[#171717]">Sinh ngày:</span>
                              <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[15px]">
                                {hsData.dob}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-[#171717]">Giới tính:</span>
                              <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[15px]">
                                {hsData.gender}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                            <span className="text-[#171717]">Số CMND:</span>
                            <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[15px]">
                              {hsData.cmnd}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lower Details */}
                      <div className="space-y-2 text-[13px]" style={{ fontFamily: 'EB Garamond, serif' }}>
                        <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                          <span className="text-[#171717] flex-shrink-0">Nơi ĐKHKTT:</span>
                          <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[15.5px] leading-tight">
                            {hsData.permanentAddress}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                          <span className="text-[#171717] flex-shrink-0">Nơi ở hiện nay:</span>
                          <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[15.5px] leading-tight">
                            {hsData.currentAddress}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#D4D4D4] pb-0.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[#171717]">Nghề nghiệp:</span>
                            <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[15.5px]">
                              {hsData.job}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[#171717]">SĐT:</span>
                            <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[15px]">
                              {hsData.phone}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                          <span className="text-[#171717] flex-shrink-0">Hôn nhân:</span>
                          <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[14.5px] leading-tight">
                            {hsData.maritalStatus}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                          <span className="text-[#171717] flex-shrink-0">Đặc điểm nhận diện:</span>
                          <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[14.5px] leading-tight">
                            {hsData.identifyingTraits}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-[12px] border-t border-neutral-300">
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-neutral-600">Mã định danh:</span>
                        <span className="font-bold text-[#171717]">{hsData.idCode}</span>
                      </div>
                      <span className="text-neutral-500 font-mono">Tờ 1/2</span>
                    </div>
                  </div>

                  {/* Sheet 2: ĐIỀU KHOẢN CĂN CỨ & CHỨNG NHẬN ĐIỀU TRA (A5 Dọc: 559px x 794px) */}
                  <div className="print-canvas-hs print-page-break w-[559px] min-h-[794px] bg-[#FAF7EE] p-6 shadow-2xl relative select-text text-[#171717] flex flex-col justify-between border border-[#171717]">
                    <div>
                      {/* Top Section Header */}
                      <div className="text-center mb-4 space-y-0.5">
                        <h2
                          style={{ fontFamily: 'EB Garamond, serif' }}
                          className="font-bold text-[14px] uppercase tracking-wide text-[#171717]"
                        >
                          BẢNG TRÍCH LỤC LÝ LỊCH TƯ PHÁP
                        </h2>
                        <p
                          style={{ fontFamily: 'EB Garamond, serif' }}
                          className="font-bold text-[13.5px] uppercase tracking-wide text-[#404040]"
                        >
                          VỤ ÁN MẠNG TẠI SỐ 14 ĐƯỜNG BỜ SÔNG
                        </p>
                      </div>

                      {/* 3 Điều khoản căn cứ xác minh */}
                      <div className="space-y-3 text-[13px] leading-relaxed text-justify text-[#171717]" style={{ fontFamily: 'EB Garamond, serif' }}>
                        <p>
                          <span className="font-bold">1. Tiền án, tiền sự:</span> {hsData.criminalRecord}
                        </p>
                        <p>
                          <span className="font-bold">2. Mối quan hệ với nạn nhân:</span> {hsData.relationWithVictim}
                        </p>
                        <p>
                          <span className="font-bold">3. Hồ sơ lưu trữ:</span> {hsData.archiveNote}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Section: Chứng nhận của cơ quan điều tra */}
                    <div className="border-t border-[#D4D4D4] pt-4">
                      <h3
                        style={{ fontFamily: 'EB Garamond, serif' }}
                        className="font-bold text-[13px] uppercase text-[#171717] mb-3"
                      >
                        CHỨNG NHẬN CỦA ĐƠN VỊ ĐIỀU TRA / CƠ QUAN CẢNH SÁT ĐIỀU TRA
                      </h3>

                      <div className="flex justify-between items-start text-[12px]" style={{ fontFamily: 'EB Garamond, serif' }}>
                        {/* Left Meta Column */}
                        <div className="space-y-1.5">
                          <p className="font-semibold text-[#171717]">Cơ quan CSĐT Công an TP. Hà Nội</p>
                          <p>
                            <span>Hồ sơ vụ án: </span>
                            <span className="font-bold font-mono">{hsData.caseFileNumber}</span>
                          </p>
                          <p className="text-neutral-600 italic">
                            Tình trạng: {hsData.archiveStatus}
                          </p>
                        </div>

                        {/* Right Officer Signature & Red Stamp Block */}
                        <div className="text-center relative w-48">
                          <p className="text-[11.5px] italic">
                            {hsData.signingCity}, ngày {hsData.signingDay} tháng {hsData.signingMonth} năm {hsData.signingYear}
                          </p>
                          <p className="font-bold text-[12.5px] uppercase mt-0.5">
                            ĐIỀU TRA VIÊN LẬP TRÍCH LỤC
                          </p>
                          <p className="text-[10px] italic text-neutral-600">
                            (Ký, ghi rõ họ tên)
                          </p>

                          {/* Handwritten Signature */}
                          <div className="h-12 flex items-center justify-center pt-2">
                            <span
                              style={{ fontFamily: 'Dancing Script, cursive' }}
                              className="font-bold text-[20px] text-[#1A365D] -rotate-3"
                            >
                              Minh
                            </span>
                          </div>

                          {/* Full Name */}
                          <p className="font-medium text-[13px] text-[#171717]">
                            {hsData.investigatorRankAndName}
                          </p>

                          {/* Authentic Circular PC02 Red Seal Stamp */}
                          {showSeal && (
                            <div
                              style={{
                                transform: `rotate(${sealAngle}deg)`,
                                transformOrigin: 'center center'
                              }}
                              className="absolute -top-2 left-3 w-32 h-32 pointer-events-none select-none opacity-90 mix-blend-multiply"
                            >
                              <svg viewBox="0 0 200 200" className="w-full h-full text-red-600" fill="currentColor">
                                <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="3.5" fill="none" />
                                <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="3 1" />
                                <circle cx="100" cy="100" r="54" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <polygon points="100,62 108,82 130,82 112,95 119,116 100,103 81,116 88,95 70,82 92,82" fill="currentColor" />
                                <path id="topCurveRightA5" d="M 22 100 A 78 78 0 0 1 178 100" fill="none" />
                                <text className="text-[12px] font-bold uppercase tracking-[2px]" fill="currentColor">
                                  <textPath href="#topCurveRightA5" startOffset="50%" textAnchor="middle">
                                    CÔNG AN TP. HÀ NỘI
                                  </textPath>
                                </text>
                                <path id="bottomCurveRightA5" d="M 175 108 A 78 78 0 0 1 25 108" fill="none" />
                                <text className="text-[11px] font-bold uppercase tracking-[2px]" fill="currentColor">
                                  <textPath href="#bottomCurveRightA5" startOffset="50%" textAnchor="middle">
                                    PHÒNG CSHS PC02
                                  </textPath>
                                </text>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Right Evidence Tag Pill: Frame 4 */}
                      <div className="flex justify-between items-center pt-4 border-t border-neutral-300 mt-4">
                        <span className="text-neutral-500 font-mono text-[12px]">Tờ 2/2</span>
                        <div className="bg-[#D9D9D9] border border-black rounded-[90px] px-3.5 py-0.5 text-black font-medium text-[13px] leading-tight min-w-[50px] text-center">
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={e => setHsData({ ...hsData, tagCode: e.currentTarget.textContent || '' })}
                            className="outline-none"
                          >
                            {hsData.tagCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Khổ Ngang Chuẩn (A4 Landscape hoặc A5 Landscape: 2 nửa song song trên 1 trang trải rộng) */
                <div
                  style={{
                    width: paperSize === 'A4' ? '1050px' : '794px',
                    height: paperSize === 'A4' ? '730px' : '559px'
                  }}
                  className="print-canvas-hs bg-[#FAF7EE] p-[14px] shadow-2xl relative select-text text-[#171717] flex justify-between items-stretch overflow-hidden print-page-break"
                >
                  {/* Subtle Fold Marks at Top & Bottom Center */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#A3A3A3] pointer-events-none" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#A3A3A3] pointer-events-none" />

                  {/* Vertical Fold Crease Line in the Center */}
                  <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-px border-r border-dashed border-[#A3A3A3]/50 pointer-events-none" />

                  {/* LEFT HALF: THÔNG TIN CÁ NHÂN & ẢNH NGHI PHẠM */}
                  <div className={cn(
                    "border border-[#171717] p-5 flex flex-col justify-between bg-[#FAF7EE] relative",
                    paperSize === 'A4' ? "w-[500px]" : "w-[370px]"
                  )}>
                    <div>
                      {/* National Header */}
                      <div className="text-center space-y-0.5 mb-3">
                        <div className="font-sans font-bold text-[11px] uppercase tracking-[0.05em] text-[#262626]">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </div>
                        <div style={{ fontFamily: 'EB Garamond, serif' }} className="font-bold text-[12px] text-[#262626]">
                          Độc lập - Tự do - Hạnh phúc
                        </div>
                        <div className="w-24 h-px bg-[#262626] mx-auto my-1" />
                      </div>

                      {/* Title */}
                      <div className="text-center mb-4">
                        <h2
                          style={{ fontFamily: 'EB Garamond, serif' }}
                          className="font-bold text-[17px] uppercase tracking-[-0.025em] text-[#171717] leading-tight"
                        >
                          BẢNG TRÍCH LỤC LÝ LỊCH TƯ PHÁP
                        </h2>
                        <p style={{ fontFamily: 'EB Garamond, serif' }} className="text-[11.5px] text-[#404040]">
                          Cơ quan Cảnh sát Điều tra TP. Hà Nội
                        </p>
                      </div>

                      {/* Identity Section: Photo (3x4) + Details */}
                      <div className="flex gap-4 items-start mb-3">
                        <div className="w-[96px] h-[128px] border border-[#D4D4D4] shadow-sm relative flex-shrink-0 bg-neutral-200 overflow-hidden">
                          {hsData.photoUrl ? (
                            <img
                              src={hsData.photoUrl}
                              alt="Ảnh nhận diện"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-[10px]">
                              <ImageIcon className="w-6 h-6 mb-1 text-neutral-400" />
                              <span>Ảnh 3x4</span>
                            </div>
                          )}

                          {showSeal && (
                            <div
                              style={{
                                transform: `rotate(${sealAngle}deg)`,
                                transformOrigin: 'center center'
                              }}
                              className="absolute -right-10 top-6 w-24 h-24 pointer-events-none select-none opacity-85 mix-blend-multiply"
                            >
                              <svg viewBox="0 0 200 200" className="w-full h-full text-red-600" fill="currentColor">
                                <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="3" fill="none" />
                                <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="3 1" />
                                <circle cx="100" cy="100" r="54" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <polygon points="100,65 108,82 128,82 112,95 118,114 100,103 82,114 88,95 72,82 92,82" fill="currentColor" />
                                <path id="topCurveMini" d="M 22 100 A 78 78 0 0 1 178 100" fill="none" />
                                <text className="text-[14px] font-bold uppercase tracking-[2px]" fill="currentColor">
                                  <textPath href="#topCurveMini" startOffset="50%" textAnchor="middle">
                                    CÔNG AN TP. HÀ NỘI
                                  </textPath>
                                </text>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Right of Photo Fields */}
                        <div className="flex-1 space-y-1.5 text-[12px]" style={{ fontFamily: 'EB Garamond, serif' }}>
                          <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                            <span className="text-[#171717] font-medium flex-shrink-0">Họ và tên:</span>
                            <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-bold text-[16px] leading-none">
                              {hsData.fullName}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                            <span className="text-[#404040] text-[11.5px]">Tên thường gọi:</span>
                            <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[15px] leading-none">
                              {hsData.nickname}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between border-b border-[#D4D4D4] pb-0.5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-[#171717]">Sinh ngày:</span>
                              <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[14px]">
                                {hsData.dob}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-[#171717]">Giới tính:</span>
                              <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[14px]">
                                {hsData.gender}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                            <span className="text-[#171717]">Số CMND:</span>
                            <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[14px]">
                              {hsData.cmnd}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lower Details */}
                      <div className="space-y-1.5 text-[12px]" style={{ fontFamily: 'EB Garamond, serif' }}>
                        <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                          <span className="text-[#171717] flex-shrink-0">Nơi ĐKHKTT:</span>
                          <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[14.5px] leading-tight">
                            {hsData.permanentAddress}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                          <span className="text-[#171717] flex-shrink-0">Nơi ở hiện nay:</span>
                          <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[14.5px] leading-tight">
                            {hsData.currentAddress}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#D4D4D4] pb-0.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[#171717]">Nghề nghiệp:</span>
                            <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[14.5px]">
                              {hsData.job}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[#171717]">SĐT:</span>
                            <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[14px]">
                              {hsData.phone}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                          <span className="text-[#171717] flex-shrink-0">Hôn nhân:</span>
                          <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[13.5px] leading-tight">
                            {hsData.maritalStatus}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 border-b border-[#D4D4D4] pb-0.5">
                          <span className="text-[#171717] flex-shrink-0">Đặc điểm nhận diện:</span>
                          <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-medium text-[13.5px] leading-tight">
                            {hsData.identifyingTraits}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-[11.5px]" style={{ fontFamily: 'EB Garamond, serif' }}>
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-600">Mã định danh:</span>
                        <span className="font-sans font-medium text-[#171717]">{hsData.idCode}</span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT HALF: ĐIỀU KHOẢN CĂN CỨ & CHỨNG NHẬN ĐIỀU TRA */}
                  <div className={cn(
                    "border border-[#171717] p-5 flex flex-col justify-between bg-[#FAF7EE] relative",
                    paperSize === 'A4' ? "w-[500px]" : "w-[370px]"
                  )}>
                    <div>
                      <div className="text-center mb-4 space-y-0.5">
                        <h2
                          style={{ fontFamily: 'EB Garamond, serif' }}
                          className="font-bold text-[13.5px] uppercase tracking-wide text-[#171717]"
                        >
                          BẢNG TRÍCH LỤC LÝ LỊCH TƯ PHÁP
                        </h2>
                        <p
                          style={{ fontFamily: 'EB Garamond, serif' }}
                          className="font-bold text-[13px] uppercase tracking-wide text-[#404040]"
                        >
                          VỤ ÁN MẠNG TẠI SỐ 14 ĐƯỜNG BỜ SÔNG
                        </p>
                      </div>

                      <div className="space-y-2.5 text-[12px] leading-relaxed text-justify text-[#171717]" style={{ fontFamily: 'EB Garamond, serif' }}>
                        <p>
                          <span className="font-bold">1. Tiền án, tiền sự:</span> {hsData.criminalRecord}
                        </p>
                        <p>
                          <span className="font-bold">2. Mối quan hệ với nạn nhân:</span> {hsData.relationWithVictim}
                        </p>
                        <p>
                          <span className="font-bold">3. Hồ sơ lưu trữ:</span> {hsData.archiveNote}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#D4D4D4] pt-3">
                      <h3
                        style={{ fontFamily: 'EB Garamond, serif' }}
                        className="font-bold text-[12.5px] uppercase text-[#171717] mb-2"
                      >
                        CHỨNG NHẬN CỦA ĐƠN VỊ ĐIỀU TRA / CƠ QUAN CẢNH SÁT ĐIỀU TRA
                      </h3>

                      <div className="flex justify-between items-start text-[11.5px]" style={{ fontFamily: 'EB Garamond, serif' }}>
                        <div className="space-y-1">
                          <p className="font-semibold text-[#171717]">Cơ quan CSĐT Công an TP. Hà Nội</p>
                          <p>
                            <span>Hồ sơ vụ án: </span>
                            <span className="font-bold font-mono">{hsData.caseFileNumber}</span>
                          </p>
                          <p className="text-neutral-600 italic">
                            Tình trạng: {hsData.archiveStatus}
                          </p>
                        </div>

                        <div className="text-center relative w-44">
                          <p className="text-[11px] italic">
                            {hsData.signingCity}, ngày {hsData.signingDay} tháng {hsData.signingMonth} năm {hsData.signingYear}
                          </p>
                          <p className="font-bold text-[12px] uppercase mt-0.5">
                            ĐIỀU TRA VIÊN LẬP TRÍCH LỤC
                          </p>
                          <p className="text-[9.5px] italic text-neutral-600">
                            (Ký, ghi rõ họ tên)
                          </p>

                          <div className="h-12 flex items-center justify-center pt-2">
                            <span
                              style={{ fontFamily: 'Dancing Script, cursive' }}
                              className="font-bold text-[18.5px] text-[#1A365D] -rotate-3"
                            >
                              Minh
                            </span>
                          </div>

                          <p className="font-medium text-[12.5px] text-[#171717]">
                            {hsData.investigatorRankAndName}
                          </p>

                          {showSeal && (
                            <div
                              style={{
                                transform: `rotate(${sealAngle}deg)`,
                                transformOrigin: 'center center'
                              }}
                              className="absolute -top-2 left-2 w-32 h-32 pointer-events-none select-none opacity-90 mix-blend-multiply"
                            >
                              <svg viewBox="0 0 200 200" className="w-full h-full text-red-600" fill="currentColor">
                                <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="3.5" fill="none" />
                                <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="3 1" />
                                <circle cx="100" cy="100" r="54" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <polygon points="100,62 108,82 130,82 112,95 119,116 100,103 81,116 88,95 70,82 92,82" fill="currentColor" />
                                <path id="topCurveRight" d="M 22 100 A 78 78 0 0 1 178 100" fill="none" />
                                <text className="text-[12px] font-bold uppercase tracking-[2px]" fill="currentColor">
                                  <textPath href="#topCurveRight" startOffset="50%" textAnchor="middle">
                                    CÔNG AN TP. HÀ NỘI
                                  </textPath>
                                </text>
                                <path id="bottomCurveRight" d="M 175 108 A 78 78 0 0 1 25 108" fill="none" />
                                <text className="text-[11px] font-bold uppercase tracking-[2px]" fill="currentColor">
                                  <textPath href="#bottomCurveRight" startOffset="50%" textAnchor="middle">
                                    PHÒNG CSHS PC02
                                  </textPath>
                                </text>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <div className="bg-[#D9D9D9] border border-black rounded-[90px] px-3 py-0.5 text-black font-medium text-[12.5px] leading-tight min-w-[45px] text-center">
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={e => setHsData({ ...hsData, tagCode: e.currentTarget.textContent || '' })}
                            className="outline-none"
                          >
                            {hsData.tagCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  )
}

