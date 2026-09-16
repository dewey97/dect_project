# CẨM NANG HỆ THỐNG ADMIN STUDIO: ĐẶC TẢ TÍNH NĂNG & GIAO DIỆN UI/UX
**(CASE & UNIVERSE CREATOR WORKSPACE)**
*Phiên bản 2.0 — Standardized Creator Workflow*

---

## I. TỔNG QUAN HỆ THỐNG & NGUYÊN TẮC THIẾT KẾ

### 1. Tư tưởng Cốt lõi (Story-Driven Creator Workflow)
Admin Studio là công cụ biên tập dữ liệu chuyên biệt dành cho Admin/Tác giả để sáng tác, cấu trúc hóa, liên kết và kiểm thử các kịch bản trinh thám tương tác.
Hệ thống hoạt động như một **Động cơ Dữ liệu Cấu trúc (Structured Data Engine)** tích hợp thuật toán kiểm toán logic thời gian thực và đếm chỉ số cân bằng trò chơi.

**Workflow 3 Giai đoạn của Tác giả:**
1. **Giai đoạn 1 (Story & Truth):** Nhào nặn Ý tưởng, Nạn nhân, Hung thủ, Sự thật kịch bản và Ma trận Nhân vật.
2. **Giai đoạn 2 (Interactive Game Design):** Đắp thêm Manh mối, Hiện trường, Khung tiến trình gameplay và Bằng chứng.
3. **Giai đoạn 3 (Meta-Universe & QA):** Kết nối vụ án lẻ vào Vũ Trụ Truyện Mở và Playtest Sandbox.

### 2. Nguyên tắc Thiết kế UX (Power-User Tool)
- **Information Density (Mật độ thông tin cao):** Sử dụng các bảng Grid, Split-pane (chia màn hình) cho phép nhìn toàn cảnh vụ án.
- **Visual Mapping (Sơ đồ hóa trực quan):** Giao diện kéo thả (Drag & Drop), Node-based và Timeline trực quan.
- **Real-time Audit Feedback:** Phát hiện mâu thuẫn thời gian/không gian trong 0.001s và cảnh báo ngay lập tức.
- **Sandbox QA:** Nút **[ ⏵ PLAYTEST ]** tức thì để xem trước trải nghiệm độc giả.

---

## II. CHI TIẾT MÔ-ĐUN & KIẾN TRÚC GIAO DIỆN UI/UX

```text
┌─────────────────────────────────────────────────────────────────────────┐
│              GIAI ĐOẠN 1: XÂY DỰNG CÂU CHUYỆN & SỰ THẬT                 │
├─────────────────────────────────────────────────────────────────────────┤
│ ► MÔ-ĐUN 1: Cấu hình Vụ án Lẻ (Case Metadata & Status)                  │
│ ► MÔ-ĐUN 2: Quản lý Nhân vật & Sự thật (Character & Truth Matrix)       │
│ ► MÔ-ĐUN 3: Multi-Track Timeline & Kiểm tra Logic (Logic Audit Engine)  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              GIAI ĐOẠN 2: THIẾT KẾ GAMEPLAY TƯƠNG TÁC                   │
├─────────────────────────────────────────────────────────────────────────┤
│ ► MÔ-ĐUN 4: Manh mối, Bằng chứng & Bộ đếm Cơ chế (Clue & Analytics)     │
│ ► MÔ-ĐUN 5: Sơ đồ Hiện trường & Tầm nhìn (Hotspots & Sight Line)        │
│ ► MÔ-ĐUN 6: Tiến trình Phân nhánh & Đáp án (Progression & Quiz)         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           GIAI ĐOẠN 3: LIÊN KẾT VŨ TRỤ TRUYỆN & TESTING                 │
├─────────────────────────────────────────────────────────────────────────┤
│ ► MÔ-ĐUN 7: Kho Vũ trụ Truyện chung (Global Lore & Meta-Flags)           │
│ ► MÔ-ĐUN 8: Sandbox QA & Export (Realtime Debug Panel & JSON Export)    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## III. NGUYÊN TẮC GIAO DIỆN UI/UX CHUẨN (GLOBAL LAYOUT)

Giao diện Admin Studio tuân theo chuẩn **Desktop-First**, kiến trúc **Sidebar + Main Workspace + Inspector Panel**:

- **Left Sidebar (Navigation):** Chuyển đổi giữa các Mô-đun: Metadata, Characters, Timeline, Clues, Settings. Hiển thị Tree View kịch bản.
- **Top Bar (Action & Status):**
  - Breadcrumb kịch bản.
  - Trạng thái vòng đời: `Draft` ➔ `In Review` ➔ `Published`.
  - Nút nổi bật: **[ ⏵ PLAYTEST ]**.
  - Cảnh báo Logic thời gian thực (vd: 🔴 *2 Lỗi Logic đang tồn tại*).
- **Main Workspace (Center):** Vùng làm việc chính dạng Split-pane hoặc Node-board.
- **Right Panel (Contextual Inspector):** Mở ra cấu hình chi tiết khi chọn một Nhân vật hoặc Node trên sơ đồ.

---

## IV. CƠ SỞ DỮ LIỆU CỐT LÕI (CORE DATABASE SCHEMA)

1. **`cases`**: Metadata vụ án (`id`, `title`, `synopsis`, `difficulty`, `status`, `req_detective_level`).
2. **`characters`**: Danh sách nhân vật (`id`, `case_id`, `name`, `role`, `is_global`).
3. **`truth_profiles`**: Bộ 3 thuộc tính bản chất (`character_id`, `real_motive`, `real_alibi`, `red_herring_secret`).
4. **`relationships`**: Ma trận quan hệ nhân vật (`character_1_id`, `character_2_id`, `relation_type`, `affinity_score`).

---

## V. TÍCH HỢP VỚI GIAO DIỆN PHÁ ÁN (INVESTIGATION FRONTEND)

1. **Data-Driven Gameplay:** Frontend đọc dữ liệu JSON/Supabase động xuất từ Admin Studio.
2. **Chất vấn lật tẩy Lời khai (Truth vs Lies):** Người chơi đập bằng chứng vào `red_herring_secret` để buộc nhân vật khai ra `real_alibi`.
3. **Mô-đun Sandbox QA:** Tác giả thử nghiệm vụ án dưới góc nhìn độc giả ngay trong quá trình biên tập.
