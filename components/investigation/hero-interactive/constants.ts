import type { CaseData } from "./types";

export const BOARD_FRAME_SRC = "/images/hero/evidence-board-frame.png";

export const CASES_LIST: CaseData[] = [
  {
    id: "case-000",
    title: "TRỐN TÌM (1996)",
    description:
      "Chuyên án 000 — Bi kịch trốn tìm 20 năm trước tại xóm Bờ Sông",
    status: "active",
    bgImage: "/images/backgrounds/corkboard_vertical_empty.jpg",
    pins: [
      {
        id: "c0-pin-evidence",
        x: 0.22,
        y: 0.18,
        label: "BỔ SUNG CHỨNG CỨ",
        detail: "Chỉ dẫn nghiệp vụ & hướng dẫn các thao tác mở rộng điều tra",
        noteColor: "yellow",
      },
      {
        id: "c0-pin-question",
        x: 0.42,
        y: 0.18,
        label: "NGHI VẤN",
        detail: "Danh sách các nghi vấn & câu hỏi điều tra cần làm rõ",
        noteColor: "yellow",
      },
      {
        id: "c0-pin-suspects",
        x: 0.68,
        y: 0.32,
        label: "NGHI PHẠM",
        detail: "Tập hợp danh tính & thẩm tra nghi phạm (Tùng, Hà, Mai...)",
        noteColor: "yellow",
      },
      {
        id: "c0-pin-phone",
        x: 0.42,
        y: 0.27,
        label: "MỞ RỘNG ĐIỀU TRA",
        detail: "Tra cứu SĐT & khai thác dữ liệu điện thoại nạn nhân Khang",
        noteColor: "white",
      },
      {
        id: "c0-pin-reinvestigate",
        x: 0.22,
        y: 0.35,
        label: "BIÊN BẢN XIN KHÁM XÉT LẠI",
        detail: "Khám xét lại hiện trường để rà soát manh mối bổ sung",
        noteColor: "white",
      },
      {
        id: "c0-pin-indictment",
        x: 0.22,
        y: 0.8,
        label: "BẢN KẾT LUẬN ĐIỀU TRA",
        detail: "Bản kết luận điều tra và buộc tội thủ phạm vụ án",
        noteColor: "white",
        pinColor: "red",
      },
    ],
    connections: [
      {
        id: "c0-conn-1",
        fromPinId: "c0-pin-evidence",
        toPinId: "c0-pin-phone",
      },
      {
        id: "c0-conn-2",
        fromPinId: "c0-pin-evidence",
        toPinId: "c0-pin-reinvestigate",
      },
    ],
  },
  {
    id: "case-01",
    title: "VẬN ĐƠN BẤT THƯỜNG",
    description: "Vụ mất tích bí ẩn tại Cầu cảng số 9",
    status: "active",
    bgImage: "/images/hero/evidence-board-bg.png",
    pins: [
      {
        id: "c1-pin-0",
        x: 0.22,
        y: 0.24,
        label: "NẠN NHÂN",
        detail: "Nạn nhân chính của vụ án",
      },
      {
        id: "c1-pin-1",
        x: 0.5,
        y: 0.18,
        label: "VẬN ĐƠN",
        detail: "Container #7722 — Trọng tải bất thường 24.5T",
      },
      {
        id: "c1-pin-2",
        x: 0.78,
        y: 0.26,
        label: "TANG VẬT",
        detail: "Ứng dụng nhắn tin lưu payload mã hóa AES-256",
      },
      {
        id: "c1-pin-3",
        x: 0.5,
        y: 0.5,
        label: "HIỆN TRƯỜNG",
        detail: "Cầu cảng #9 — Camera mất tín hiệu 15 phút",
      },
      {
        id: "c1-pin-4",
        x: 0.18,
        y: 0.74,
        label: "CHÌA KHÓA",
        detail: "Chìa khóa đồng — mã số chìm: NX-4471",
      },
      {
        id: "c1-pin-5",
        x: 0.78,
        y: 0.72,
        label: "NGHI PHẠM",
        detail: "[DỮ LIỆU BỊ KHÓA — CẦN MÃ KÍCH HOẠT]",
      },
      {
        id: "c1-pin-6",
        x: 0.36,
        y: 0.78,
        label: "SỔ TAY",
        detail: "Ghi chép hàng hóa — phát hiện 02:14 AM",
      },
      {
        id: "c1-pin-7",
        x: 0.64,
        y: 0.38,
        label: "BẢN ĐỒ",
        detail: "Phân khu bến tàu 12 — lối thoát hiểm B",
      },
    ],
    connections: [
      { id: "c1-conn-0", fromPinId: "c1-pin-0", toPinId: "c1-pin-3" },
      { id: "c1-conn-1", fromPinId: "c1-pin-1", toPinId: "c1-pin-3" },
      { id: "c1-conn-2", fromPinId: "c1-pin-2", toPinId: "c1-pin-3" },
      { id: "c1-conn-3", fromPinId: "c1-pin-3", toPinId: "c1-pin-4" },
      { id: "c1-conn-4", fromPinId: "c1-pin-3", toPinId: "c1-pin-5" },
      { id: "c1-conn-5", fromPinId: "c1-pin-0", toPinId: "c1-pin-5" },
      { id: "c1-conn-6", fromPinId: "c1-pin-2", toPinId: "c1-pin-5" },
      { id: "c1-conn-7", fromPinId: "c1-pin-1", toPinId: "c1-pin-7" },
      { id: "c1-conn-8", fromPinId: "c1-pin-4", toPinId: "c1-pin-6" },
      { id: "c1-conn-9", fromPinId: "c1-pin-0", toPinId: "c1-pin-6" },
      { id: "c1-conn-10", fromPinId: "c1-pin-7", toPinId: "c1-pin-3" },
    ],
  },
  {
    id: "case-02",
    title: "BÓNG MA PHÒNG THÍ NGHIỆM",
    description:
      "Rò rỉ dữ liệu sinh học đột biến tại tổ hợp phân tích bio-tech",
    status: "active",
    bgImage: "/images/hero/evidence-board-bg2.jpg",
    pins: [
      {
        id: "c2-pin-0",
        x: 0.25,
        y: 0.3,
        label: "BẢN THIẾT KẾ",
        detail: "Sơ đồ phòng Lab Bio-Safety Cấp 4",
      },
      {
        id: "c2-pin-1",
        x: 0.55,
        y: 0.2,
        label: "MẪU THỬ",
        detail: "Ống nghiệm vỡ chứa hợp chất Fluoro-green",
      },
      {
        id: "c2-pin-2",
        x: 0.75,
        y: 0.35,
        label: "MÁY PHÂN TÍCH",
        detail: "Hệ thống sắc ký khí ghi nhận sự biến dạng chuỗi",
      },
      {
        id: "c2-pin-3",
        x: 0.45,
        y: 0.6,
        label: "NHẬT KÝ CA",
        detail: "Tiến sĩ K. Vy biến mất bất thường lúc 03:00 AM",
      },
      {
        id: "c2-pin-4",
        x: 0.8,
        y: 0.75,
        label: "BỒN CHỨA",
        detail: "Hệ thống thông gió bị tắt thủ công từ phòng máy chủ",
      },
    ],
    connections: [
      { id: "c2-conn-0", fromPinId: "c2-pin-0", toPinId: "c2-pin-3" },
      { id: "c2-conn-1", fromPinId: "c2-pin-1", toPinId: "c2-pin-3" },
      { id: "c2-conn-2", fromPinId: "c2-pin-2", toPinId: "c2-pin-3" },
      { id: "c2-conn-3", fromPinId: "c2-pin-3", toPinId: "c2-pin-4" },
    ],
  },
  {
    id: "case-03",
    title: "DẤU VẾT KỸ THUẬT SỐ",
    description:
      "Vụ tấn công ransomware mã hóa toàn bộ dữ liệu máy chủ tài chính",
    status: "active",
    bgImage: "/images/hero/evidence-board-bg3.jpg",
    pins: [
      {
        id: "c3-pin-0",
        x: 0.2,
        y: 0.2,
        label: "CỔNG VÀO",
        detail: "VPN Gateway bị dò thông tin xác thực từ 3 IP lạ",
      },
      {
        id: "c3-pin-1",
        x: 0.5,
        y: 0.25,
        label: "MÃ ĐỘC",
        detail: "Biến thể WannaDie v3.1 tìm thấy trong bộ nhớ RAM",
      },
      {
        id: "c3-pin-2",
        x: 0.8,
        y: 0.3,
        label: "VÍ ĐIỆN TỬ",
        detail: "Địa chỉ nhận tiền chuộc: 3AbCd...9FqP",
      },
      {
        id: "c3-pin-3",
        x: 0.5,
        y: 0.65,
        label: "MÁY CHỦ SỞ ĐỒNG",
        detail: "Cơ sở dữ liệu giao dịch bị đổi đuôi sang .locked",
      },
    ],
    connections: [
      { id: "c3-conn-0", fromPinId: "c3-pin-0", toPinId: "c3-pin-1" },
      { id: "c3-conn-1", fromPinId: "c3-pin-1", toPinId: "c3-pin-3" },
      { id: "c3-conn-2", fromPinId: "c3-pin-2", toPinId: "c3-pin-3" },
    ],
  },
];

export const ZOOM_SCALE = 2.2;
export const MAX_DEVICE_PIXEL_RATIO = 2;

export const FRAME_INNER_LEFT = 0.3879;
export const FRAME_INNER_TOP = 0.2079;
export const FRAME_INNER_WIDTH = 0.5284;
export const FRAME_INNER_HEIGHT = 0.5461;

export const PIN_HIT_RADIUS = 38;
export const PIN_GLOW_RADIUS = 50;

export const FLASHLIGHT_RADIUS = 260;
export const CENTER_LIGHT_RADIUS_RATIO = 0.75;

export const DRAG_THRESHOLD = 5;
export const MAX_PAN_RATIO = 0.45;
export const PIN_COLORS = [
  { base: "#cc2222", highlight: "#ff6666" },
  { base: "#2255cc", highlight: "#6699ff" },
  { base: "#cc2222", highlight: "#ff6666" },
  { base: "#ccaa22", highlight: "#ffdd66" },
  { base: "#2255cc", highlight: "#6699ff" },
  { base: "#cc2222", highlight: "#ff6666" },
  { base: "#22aa44", highlight: "#66dd88" },
  { base: "#ccaa22", highlight: "#ffdd66" },
];

export const BOARD_BASE_WIDTH = 896;
export const BOARD_BASE_HEIGHT = 1200;
export const BOARD_ASPECT = BOARD_BASE_WIDTH / BOARD_BASE_HEIGHT;
