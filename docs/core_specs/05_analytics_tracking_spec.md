# Đặc Tả Đo Lường & Phân Tích Chỉ Số (Analytics Tracking Spec)

> **Dự án: dect_project** — Hệ thống đo lường hành vi người chơi, tiến độ điều tra và tương tác tài liệu qua Firebase Analytics (Google Analytics 4).

---

## 📌 1. Mục Tiêu Đo Lường (Measurement Objectives)

1. **Phân tích Phễu Tiến Độ (Investigation Funnel)**: Theo dõi tỷ lệ người chơi hoàn thành từng Phase (Phase 1 $\rightarrow$ Phase 2 $\rightarrow$ Phase 3 $\rightarrow$ Final Conclusion).
2. **Đánh giá Độ Khó của Checkpoints (Puzzle Friction)**: Đo lường số lần giải sai (`failed_attempts`), thời gian giải và tần suất sử dụng gợi ý (`hint_used`) để cân bằng độ khó.
3. **Mức Độ Tương Tác Tài Liệu (Evidence Engagement)**: Xác định hồ sơ, lời khai nhân chứng hoặc vật chứng nào được đọc nhiều nhất, thời lượng đọc trung bình.
4. **Điểm Rơi Người Chơi (Drop-off Rate)**: Phát hiện vị trí/câu hỏi khiến người chơi bỏ cuộc để tối ưu trải nghiệm.

---

## ⚙️ 2. Cấu Trúc Kỹ Thuật & Cấu Hình (Technical Setup)

- **Công cụ**: Firebase Analytics (Google Analytics 4 - GA4)
- **Measurement ID**: `G-MJNW2MDLND`
- **Firebase Project ID**: `lrp-dectective`
- **Tệp khởi tạo**: [`lib/firebase.ts`](../../lib/firebase.ts)
- **Tệp điều phối Event**: [`lib/analytics.ts`](../../lib/analytics.ts)
- **Biến môi trường**: Cấu hình tại `.env.local` với tiền tố `NEXT_PUBLIC_FIREBASE_*`

---

## 📊 3. Danh Mục Sự Kiện (Event Dictionary)

### 3.1. Sự kiện Mặc định (Automatically Collected)

| Event Name | Kích Hoạt | Mục Đích |
| :--- | :--- | :--- |
| `first_visit` | Lần đầu người dùng truy cập web | Đo lượng người chơi mới (User Acquisition) |
| `session_start` | Bắt đầu một phiên truy cập | Đo tổng số phiên và tần suất quay lại |
| `page_view` | Mỗi khi chuyển URL / tải trang | Đo lưu lượng truy cập từng màn hình |
| `user_engagement` | Người dùng chủ động tương tác trên trang | Đo thời gian active thực tế |

---

### 3.2. Sự kiện Tùy Chỉnh Nghiệp Vụ (Custom Game Events)

| Event Name | Vị Trí / Trigger | Tham Số (Parameters) | Ý Nghĩa / KPI |
| :--- | :--- | :--- | :--- |
| **`landing_page_view`** | Mở trang chủ giới thiệu game | `source: string`, `timestamp: string` | Đo lưu lượng tiếp cận đầu phễu |
| **`case_start`** | Người chơi bấm bắt đầu điều tra một vụ án | `case_id: string` (vd: `case_000`) | Tỷ lệ chuyển đổi từ landing page vào game |
| **`document_opened`** | Mở xem chi tiết hồ sơ / lời khai / báo cáo | `doc_id: string`, `doc_type: string`, `phase: number` | Mức độ quan tâm từng tài liệu |
| **`checkpoint_attempt`** | Người chơi nộp câu trả lời suy luận | `checkpoint_id: string`, `is_correct: boolean`, `attempt_number: number` | Đo độ khó và tỷ lệ trả lời đúng/sai |
| **`checkpoint_solved`** | Giải thành công một checkpoint | `checkpoint_id: string`, `phase: number`, `total_attempts: number` | Đánh dấu mốc tiến độ hoàn thành |
| **`hint_requested`** | Bấm mở gợi ý hỗ trợ | `checkpoint_id: string`, `hint_index: number` | Đo nhu cầu trợ giúp tại từng câu hỏi |
| **`phase_completed`** | Hoàn thành toàn bộ checkpoint trong 1 Phase | `case_id: string`, `phase: number`, `time_spent_seconds: number` | Đo thời gian và tỷ lệ vượt qua từng Phase |
| **`case_completed`** | Hoàn thành toàn bộ vụ án | `case_id: string`, `total_score: number`, `total_time_seconds: number` | Tỷ lệ hoàn thành toàn bộ game (End-to-End Conversion) |

---

## 🛠️ 4. Quy Chuẩn Đặt Tên & Phát Triển (Best Practices)

1. **Naming Convention**:
   - Tên sự kiện: Viết thường cách nhau bằng dấu gạch dưới (`snake_case`), không quá 40 ký tự.
   - Tên tham số: `snake_case`, súc tích, tái sử dụng được trên nhiều event.
2. **Quyền riêng tư (Privacy & GDPR)**:
   - Tuyệt đối không gửi PII (Personally Identifiable Information) như email, tên thật, mật khẩu vào Event Parameters.
3. **Cách gọi chuẩn trong Code**:
   ```typescript
   import { trackEvent } from "@/lib/analytics";

   // Ví dụ khi người chơi mở tài liệu
   trackEvent("document_opened", {
     doc_id: "DOC-FORENSIC-01",
     doc_type: "forensic_report",
     phase: 1
   });
   ```

---

## 📈 5. Hướng Dẫn Xem Báo Cáo

- **Kiểm thử thời gian thực**: Mở **Firebase Console $\rightarrow$ Analytics $\rightarrow$ Realtime** (hoặc **DebugView**).
- **Phân tích Phễu & Báo cáo nâng cao**: Mở **Google Analytics 4 (GA4) Console $\rightarrow$ Explore $\rightarrow$ Funnel Exploration**.
