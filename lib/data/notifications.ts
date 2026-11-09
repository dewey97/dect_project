// Thông báo giả lập cho hộp thông báo trên navbar.
// Khi có bảng thông báo trên Supabase, thay mảng này bằng dữ liệu fetch từ API.
export type NotificationKind = "case" | "promo" | "teaser" | "update";

export interface SiteNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Nhãn thời gian tĩnh để không lệch hydration */
  time: string;
  href?: string;
}

export const MOCK_NOTIFICATIONS: SiteNotification[] = [
  {
    id: "n-2026-11-case-000",
    kind: "case",
    title: "Vụ án #000 · Trốn Tìm đã mở",
    body: "Hồ sơ đầu tiên đã sẵn sàng. Mở hồ sơ và bắt đầu điều tra.",
    time: "2 giờ trước",
    href: "/cases/case_000",
  },
  {
    id: "n-2026-11-promo-box",
    kind: "promo",
    title: "Ưu đãi ra mắt bản hộp hồ sơ",
    body: "Đặt sớm trong tuần đầu để nhận giá ưu đãi cho bộ hồ sơ vật lý.",
    time: "Hôm qua",
    href: "/cases",
  },
  {
    id: "n-2026-11-teaser-001",
    kind: "teaser",
    title: "Hồ sơ #001 đang được niêm phong",
    body: "Một vụ án mới sắp được giải mật. Đăng ký email để biết đầu tiên.",
    time: "3 ngày trước",
    href: "/#footer-newsletter",
  },
  {
    id: "n-2026-10-update-sync",
    kind: "update",
    title: "Chơi nhóm từ xa đã có mặt",
    body: "Cả nhóm thấy cùng một tiến độ khi phá án trên nhiều thiết bị.",
    time: "1 tuần trước",
    href: "/#tinh-nang",
  },
];
