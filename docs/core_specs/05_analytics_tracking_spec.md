# Đặc Tả Đo Lường & Phân Tích Chỉ Số (Analytics Tracking Spec)

> **Dự án: dect_project** — Hệ thống đo lường hành vi người chơi, đo thời lượng đọc hồ sơ, tương tác điện thoại tang vật và phễu tiến độ vụ án qua Firebase Analytics (Google Analytics 4).

---

## 📌 1. Mục Tiêu Đo Lường (Measurement Objectives)

1. **Phân tích Phễu Tiến Độ & Tỷ lệ Rơi Rụng (Drop-off Funnel)**: Đo tỷ lệ người chơi hoàn thành từng Phase (Landing $\rightarrow$ Phase 1 $\rightarrow$ Phase 2 $\rightarrow$ Phase 3 $\rightarrow$ Cáo trạng kết luận), chỉ ra chính xác vị trí người chơi nản lòng bỏ cuộc.
2. **Đo Thời Gian Tiêu Thụ Nội Dung (Engagement & Time Spent)**: Bấm giờ chính xác từng giây người chơi đọc từng tài liệu pháp y, biên bản lời khai, soi ảnh vật chứng và khám nghiệm 360 độ.
3. **Đo Hành Vi Trên Điện Thoại Tang Vật (Phone Simulator Usage)**: Thống kê thời gian người chơi lục lọi từng app (`messages`, `photos`, `notes`, `banking`, `safari`, `maps`).
4. **Đánh Giá Độ Khó & Sự Ức Chế (Puzzle Friction)**: Đo số lần thử sai, tỷ lệ đoán mò và cấp độ gợi ý (`hint_tier: 1, 2, 3`) người chơi phải sử dụng.

---

## ⚙️ 2. Cấu Trúc Kỹ Thuật & Cấu Hình (Technical Setup)

- **Nền tảng**: Firebase Analytics / Google Analytics 4 (GA4)
- **Measurement ID**: `G-MJNW2MDLND`
- **Firebase Project ID**: `lrp-dectective`
- **Khởi tạo Singleton & SSR Safe**: [`lib/firebase.ts`](../../lib/firebase.ts)
- **Module điều phối Event & Bấm giờ**: [`lib/analytics.ts`](../../lib/analytics.ts)
- **Nguyên tắc lọc rác**: Tự động bỏ qua các hành vi click mở rồi đóng ngay dưới **1 giây** (tránh làm nhiễu dữ liệu bởi click nhầm).

---

## 📊 3. Danh Mục Sự Kiện Đầy Đủ (Master Event Dictionary)

### 3.1. Sự kiện Tự Động Thu Thập (Automatically Collected)

| Event Name | Kích Hoạt Khi Nào | Ý Nghĩa / Mục Đích |
| :--- | :--- | :--- |
| **`first_visit`** | Lần đầu người dùng truy cập web game | Đo lượng người chơi mới (New Users) |
| **`session_start`** | Bắt đầu một phiên chơi mới (sau 30p không active) | Đo tổng số phiên và tần suất quay lại |
| **`page_view`** | Mỗi khi tải trang hoặc chuyển URL | Đo lưu lượng truy cập màn hình |
| **`user_engagement`** | Người dùng chủ động tương tác trên giao diện | Đo thời gian active thực tế ngầm |

---

### 3.2. Sự Kiện Đọc Hồ Sơ, Tài Liệu & Soi Ảnh Vật Chứng

| Event Name | Trigger / Vị trí Code | Tham Số (Parameters) | Đơn Vị Đo & Mục Đích |
| :--- | :--- | :--- | :--- |
| **`dossier_viewed`** | Khi đóng modal xem tài liệu ([`PDFViewerModal`](../../components/investigation/pdf-viewer-modal.tsx)) | • `doc_id`: Mã tài liệu (vd: `DOC-01`, `14`)<br>• `doc_title`: Tên tài liệu<br>• `doc_type`: `pdf_dossier` \| `legacy_pdf`<br>• `duration_seconds`: Thời gian mở đọc<br>• `case_id`: Mã vụ án | **Giây**.<br>Biết tài liệu nào được đọc kỹ, tài liệu nào bị lướt qua. |
| **`evidence_photo_inspected`** | Khi đóng modal xem ảnh vật chứng phóng to | • `photo_id`: Mã ảnh/vật chứng<br>• `title`: Tên ảnh<br>• `duration_seconds`: Thời gian soi ảnh<br>• `has_annotated`: Có dùng bút vẽ/note không | **Giây**.<br>Biết ảnh nào chứa chi tiết mấu chốt được người chơi quan sát kỹ. |
| **`scene_360_viewed`** | Khi thoát khỏi phòng khám nghiệm 360 ([`ReinvestigationModal`](../../components/investigation/evidence/reinvestigation-modal.tsx)) | • `case_id`: Mã vụ án<br>• `duration_seconds`: Thời gian ở trong phòng<br>• `hotspots_visited_count`: Số điểm nghi vấn đã xem | **Giây**, **Số lượng**.<br>Đo mức độ tò mò tại hiện trường 360. |
| **`scene_360_hotspot_clicked`** | Mỗi khi click vào một điểm nghi vấn trong 360 | • `hotspot_id`: Mã điểm (vd: `spot-1`, `tu_go`)<br>• `title`: Tên điểm nóng<br>• `has_audio`: Có phát âm thanh sfx không | **ID**.<br>Xem điểm nghi vấn nào thu hút người chơi nhất. |

---

### 3.3. Sự Kiện Giả Lập Điện Thoại Tang Vật (Phone Simulator)

| Event Name | Trigger / Vị trí Code | Tham Số (Parameters) | Đơn Vị Đo & Mục Đích |
| :--- | :--- | :--- | :--- |
| **`phone_session`** | Khi người chơi cất điện thoại ([`PhoneContext`](../../components/phone-engine/core/phone-context.tsx)) | • `device_id`: Mã điện thoại<br>• `device_name`: Tên thiết bị nạn nhân/nghi phạm<br>• `duration_seconds`: Tổng thời gian mở điện thoại | **Giây**.<br>Đo tỷ trọng thời gian phá án dành cho thiết bị số. |
| **`phone_app_used`** | Khi thoát khỏi một app để về Home ([`PhoneContext`](../../components/phone-engine/core/phone-context.tsx)) | • `app_id`: `messages`, `photos`, `notes`, `banking`, `safari`, `maps`<br>• `duration_seconds`: Thời gian ở trong app đó<br>• `case_id`: Mã vụ án | **Giây**.<br>Xác định ứng dụng nào trên điện thoại được điều tra nhiều nhất. |

---

### 3.4. Sự Kiện Thử Sai Checkpoint, Xem Gợi Ý & Luận Tội

| Event Name | Trigger / Vị trí Code | Tham Số (Parameters) | Đơn Vị Đo & Mục Đích |
| :--- | :--- | :--- | :--- |
| **`checkpoint_attempt`** | Khi người chơi bấm "Kiểm tra suy luận" | • `checkpoint_id`: Mã câu hỏi (vd: `c0-cp-01`)<br>• `is_correct`: `true` hoặc `false`<br>• `attempt_number`: Lần thử thứ n<br>• `selected_clues_count`: Số manh mối đã chọn | **Boolean, Đếm**.<br>Đo tỷ lệ giải đúng ngay lần đầu vs tỷ lệ đoán mò. |
| **`checkpoint_solved`** | Khi giải đúng một Checkpoint | • `checkpoint_id`: Mã câu hỏi<br>• `total_attempts`: Tổng số lần đã thử<br>• `time_to_solve_seconds`: Thời gian từ lúc mở đến lúc giải xong | **Giây, Đếm**.<br>Đánh giá độ khó thực tế của từng nút thắt logic. |
| **`hint_viewed`** | Khi giữ nút mở khóa gợi ý ([`CheckpointHintSection`](../../components/investigation/checkpoint-hint-section.tsx)) | • `checkpoint_id`: Mã câu hỏi<br>• `hint_tier`: Cấp độ gợi ý (`1`, `2`, hoặc `3`) | **Cấp độ**.<br>Phát hiện câu hỏi nào gây bí bách buộc người chơi phải xem giải. |
| **`indictment_submitted`** | Khi đóng dấu nộp Cáo trạng bắt hung thủ ([`IndictmentModal`](../../components/investigation/mindmap/indictment-modal.tsx)) | • `culprit`: Mã hung thủ bị chỉ điểm (`ha`, `vu`, `tung`)<br>• `suspect_name`: Tên nghi phạm nhập tay<br>• `motive`: Động cơ đã chọn | **Nghiệp vụ**.<br>Tỷ lệ phá án thành công và các ngộ nhận phổ biến. |

---

### 3.5. Sự Kiện Phễu Tiến Độ Vụ Án (Case Progression)

| Event Name | Trigger / Vị trí Code | Tham Số (Parameters) | Đơn Vị Đo & Mục Đích |
| :--- | :--- | :--- | :--- |
| **`landing_page_view`** | Mở trang chủ giới thiệu game ([`app/page.tsx`](../../app/page.tsx)) | • `source`: Nguồn truy cập<br>• `timestamp`: Thời gian tải | Đầu phễu chuyển đổi (Traffic). |
| **`case_started`** | Bấm nút bắt đầu điều tra một vụ án | • `case_id`: `case_000`<br>• `mode`: `solo` \| `room` | Tỷ lệ bắt đầu game. |
| **`phase_started`** | Mở khóa bước vào Phase mới | • `case_id`: Mã vụ án<br>• `phase_number`: Phase `1`, `2`, `3` | Mốc bắt đầu tính giờ cho Phase. |
| **`phase_completed`** | Hoàn thành tất cả suy luận trong Phase | • `case_id`: Mã vụ án<br>• `phase_number`: Phase `1`, `2`, `3`<br>• `duration_seconds`: Tổng thời gian hoàn thành Phase | **Vẽ biểu đồ Phễu Drop-off** qua từng chương của vụ án. |

---

## 🛠️ 4. Hướng Dẫn Sử Dụng Trong Mã Nguồn (Developer Guidelines)

Mọi hàm tracking đã được đóng gói định kiểu chặt chẽ (Type-Safe) tại [`lib/analytics.ts`](../../lib/analytics.ts). Lập trình viên chỉ cần gọi trực tiếp:

```typescript
import {
  trackDossierView,
  trackPhotoInspected,
  trackPhoneAppUsed,
  trackCheckpointAttempt,
  trackHintViewed,
  trackPhaseProgress,
} from "@/lib/analytics";

// 1. Đo đọc tài liệu:
trackDossierView({
  docId: "DOC-08",
  docTitle: "Biên bản hỏi cung nhân chứng",
  docType: "testimony",
  durationSeconds: 45,
});

// 2. Đo sử dụng app điện thoại:
trackPhoneAppUsed({
  appId: "messages",
  durationSeconds: 68,
});

// 3. Đo giải đố checkpoint:
trackCheckpointAttempt({
  checkpointId: "c0-cp-02",
  isCorrect: false,
  attemptNumber: 3,
});
```

---

## 📈 5. Hướng Dẫn Khai Thác Trên Google Analytics 4 (GA4 Console)

1. **Xem Báo Cáo Thời Gian Thực (Realtime)**:
   * Vào **Firebase Console $\rightarrow$ Analytics $\rightarrow$ Realtime**: Kiểm tra tức thì khi đang test game.
2. **Tạo Biểu Đồ Phễu Rơi Rụng (Funnel Exploration)**:
   * Vào **GA4 $\rightarrow$ Khám phá (Explore) $\rightarrow$ Khám phá kênh (Funnel exploration)**.
   * Tạo các bước: `landing_page_view` $\rightarrow$ `phase_started (phase=1)` $\rightarrow$ `phase_completed (phase=1)` $\rightarrow$ `phase_completed (phase=2)` $\rightarrow$ `indictment_submitted`.
   * GA4 sẽ tự động vẽ bậc thang tỷ lệ % người chơi rơi rụng qua từng chặng.
3. **Đăng ký Custom Dimensions**:
   * Vào **GA4 $\rightarrow$ Admin $\rightarrow$ Custom definitions $\rightarrow$ Create custom dimension**:
   * Đăng ký các tham số: `doc_id`, `checkpoint_id`, `app_id`, `culprit`, `hint_tier` để đưa vào bảng thống kê chi tiết.
