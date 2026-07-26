# TÀI LIỆU ĐẶC TẢ TÍNH NĂNG: HỆ THỐNG ADMIN STUDIO
**(ĐỘNG CƠ BIÊN TẬP VỤ ÁN & VŨ TRỤ TRUYỆN TRINH THÁM TƯƠNG TÁC)**
*Phiên bản 2.0 — Chuẩn hóa Luồng Tư Duy Sáng Tác (Story-First Creator Workflow)*

---

## I. TỔNG QUAN HỆ THỐNG & THIẾT KẾ ĐỘNG CƠ

Admin Studio (Case & Universe Editor) là công cụ biên tập dữ liệu chuyên biệt dành cho Admin/Tác giả để sáng tác, cấu trúc hóa, liên kết và kiểm thử các kịch bản trinh thám tương tác đa tuyến.
Khác với các CMS truyền thống chỉ lưu trữ văn bản thuần túy, Admin Studio hoạt động như một Động cơ Dữ liệu Cấu trúc (Structured Data Engine) tích hợp các thuật toán kiểm toán logic thời gian thực và đếm chỉ số cân bằng trò chơi.

**TƯ TƯỞNG THIẾT KẾ CỐT LÕI: STORY-DRIVEN CREATOR WORKFLOW**
Tài liệu đặc tả phiên bản 2.0 được tái cấu trúc hoàn toàn theo Luồng Tư Duy Sáng Tác Thực Tế của Tác Giả (Story-First): Tác giả bắt đầu từ việc nhào nặn Ý tưởng, Nạn nhân, Hung thủ và Sự thật kịch bản. Sau khi bức tranh sự thật hoàn chỉnh, họ mới đắp thêm Manh mối, Hiện trường, Khung tiến trình gameplay, và cuối cùng mới kết nối vụ án lẻ đó vào Đại Án / Vũ Trụ Truyện Mở.

**Mục tiêu chiến lược:**
1. **Chuẩn hóa Kịch bản (Structured Data):** Biến văn bản sáng tác tự do thành dữ liệu máy có thể đọc (JSON Schema), sẵn sàng cung cấp dữ liệu cho ứng dụng Độc giả.
2. **Kiểm soát Logic Tuyệt đối (Pure Rule-Based Audit):** Thuật toán quét thời gian thực (0.001s, không dùng AI) phát hiện 100% các lỗi mâu thuẫn thời gian, không gian, trạng thái nhân vật và lời khai ngay khi nhập liệu.
3. **Cân bằng Trò chơi Fair-Play (Mechanics Analytics):** Tự động phân tích chỉ số Fair-Play (0 - 100%), tổng hợp và đếm tần suất 32 cơ chế rải manh mối cổ điển, 9 cơ chế hiện đại và cơ chế tùy biến (Custom).
4. **Liên kết Vũ trụ Truyện (Meta-Universe):** Cho phép truyền dữ liệu trạng thái (World State Flags) và kết quả lựa chọn từ vụ án trước sang vụ án sau, phục vụ việc xây dựng "Đại Án Trùm Cuối".

---

## II. SƠ ĐỒ KIẾN TRÚC MÔ-ĐUN THEO LUỒNG SÁNG TÁC

```text
┌─────────────────────────────────────────────────────────────────────────┐
│              GIAI ĐOẠN 1: XÂY DỰNG CÂU CHUYỆN & SỰ THẬT                 │
│                          (THE CORE STORY)                               │
├─────────────────────────────────────────────────────────────────────────┤
│ ► MÔ-ĐUN 1: Cấu hình Vụ án Lẻ & Ý tưởng Cốt lõi (Case Metadata)         │
│ ► MÔ-ĐUN 2: Quản lý Nhân vật, Động cơ & Sự thật (Character Matrix)      │
│ ► MÔ-ĐUN 3: Multi-Track Timeline & Lời khai (Truth vs Lies Audit)       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              GIAI ĐOẠN 2: THIẾT KẾ GAMEPLAY TƯƠNG TÁC                   │
│                      (INTERACTIVE GAME DESIGN)                          │
├─────────────────────────────────────────────────────────────────────────┤
│ ► MÔ-ĐUN 4: Manh mối, Bằng chứng & Bộ đếm Cơ chế (Clue & Analytics)     │
│ ► MÔ-ĐUN 5: Sơ đồ Hiện trường & Không gian (Hotspots & Sight Line)      │
│ ► MÔ-ĐUN 6: Tiến trình, Phân nhánh & Đáp án (Progression & Quiz)        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           GIAI ĐOẠN 3: LIÊN KẾT VŨ TRỤ TRUYỆN & TESTING                 │
│                          (META-UNIVERSE & QA)                           │
├─────────────────────────────────────────────────────────────────────────┤
│ ► MÔ-ĐUN 7: Kho Vũ trụ Truyện chung & Đại Án (Global Lore & Meta)       │
│ ► MÔ-ĐUN 8: Sandbox QA (Realtime Debug Panel) & Xuất Dữ liệu            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## III. CHI TIẾT TÍNH NĂNG CÁC MÔ-ĐUN

### GIAI ĐOẠN 1: XÂY DỰNG CÂU CHUYỆN & SỰ THẬT (THE CORE STORY)

#### MÔ-ĐUN 1: CẤU HÌNH VỤ ÁN LẺ (CASE METADATA)
- **Thông tin cơ bản:** Tên vụ án, Tóm tắt cốt truyện chính (Synopsis), Ảnh bìa đại diện, Độ khó (1 → 5 sao), Thể loại (Phòng kín, Đầu độc, Tuyết rơi, Biến mất bí ẩn, Âm mưu gia tộc...).
- **Điều kiện mở khóa (Prerequisites):** Quy định cấp độ Thám tử tối thiểu (req_detective_level) hoặc yêu cầu Độc giả phải hoàn tất các Vụ án tiền đề cụ thể.
- **Quản lý Vòng đời Kịch bản (Case Lifecycle Status):**
  - Draft (Bản nháp): Tác giả tự do sáng tác và chỉnh sửa cấu trúc.
  - In Review (Kiểm duyệt): Thuật toán tự động chạy kiểm tra 100% logic không lỗi mới được chuyển trạng thái.
  - Published (Xuất bản): Khóa dữ liệu kịch bản và đồng bộ lên ứng dụng cho độc giả.

#### MÔ-ĐUN 2: QUẢN LÝ NHÂN VẬT, ĐỘNG CƠ & SỰ THẬT (CHARACTER & MOTIVE MATRIX)
- **Phân loại Vai trò (Role Classification):** Nạn nhân (Victim), Hung thủ (Killer), Nghi phạm (Suspect), Nhân chứng (Witness), Điều tra viên (Detective).
- **Bộ Ba Thuộc Tính Bản Chất (Triple Truth Profile):**
  - Động cơ thực tế (Real Motive): Lý do sâu xa khiến nhân vật muốn gây hại nạn nhân (Tiền bạc, Thù hận, Tình cảm, Tẩy xóa quá khứ...).
  - Chứng cứ ngoại phạm thực tế (Real Alibi): Sự thật chính xác 100% nhân vật làm gì, ở đâu trong suốt khoảng thời gian diễn ra án mạng.
  - Bí mật ngụy tạo (Red Herring Secret): Hành vi mờ ám/phi pháp khác mà nhân vật muốn che giấu (VD: Ngoại tình, Trộm cắp tiền, buôn lậu...) khiến họ khai dối với thám tử, vô tình tạo ra tình huống nghi binh cho hung thủ thật.
- **Ma trận Quan hệ (Relationship Matrix):** Giao diện trực quan cho phép vẽ các đường nối chỉ quan hệ giữa các cặp nhân vật (Thù hận, Tình nhân, Nợ nần, Đồng phạm, Ruột thịt) kèm chỉ số độ thân thiết/căng thẳng (-100 → +100).

#### MÔ-ĐUN 3: MULTI-TRACK TIMELINE & THUẬT TOÁN KIỂM TRA LOGIC THUẦN
- **Quản lý song song 3 luồng thời gian (Multi-track Timeline) đến từng phút:**
  - Master Timeline (Luồng Sự Thật): Diễn biến chính xác tuyệt đối xảy ra trong thực tế theo thiết kế của tác giả.
  - Alibi Timelines (Luồng Lời Khai): Lời khai dối trá hoặc thật thà của từng nhân vật khi thám tử thẩm vấn.
  - Investigation Timeline (Luồng Khám Phá): Mốc thời gian thám tử tiếp cận hiện trường và thu thập thông tin.
- **THUẬT TOÁN KIỂM TRA XUNG ĐỘT TỰ ĐỘNG (PURE RULE-BASED AUDIT ENGINE):** Thuật toán thuần quy tắc chạy ngầm thời gian thực (tốc độ xử lý < 0.001 giây, không dùng AI) để tự động phát hiện và cảnh báo đỏ các lỗi phi logic:
  - Lỗi Phân Thân (Location Overlap): Phát hiện nếu cùng một Actor_ID xuất hiện tại 2 Location_ID khác nhau trong cùng khoảng thời gian T1 → T2.
  - Lỗi Hành Động Hậu Tử Vong (Post-Mortem Action): Báo lỗi nếu nhân vật (Nạn nhân) có bất kỳ sự kiện hành động/lời khai nào xảy ra sau mốc thời gian tử vong chính thức (TimeOfDeath).
  - Lỗi Mâu Thuẫn Tầm Nhìn & Lời Khai: So sánh thẻ nhân chứng WitnessedActor trong lời khai nhân chứng A với vị trí alibi tự nhận của B.

*(Các giai đoạn 2 và 3 giữ nguyên theo đặc tả gốc của tác giả)*

---

## IV. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA) - PHASE 1

Dưới đây là thiết kế cấu trúc CSDL trên Supabase (PostgreSQL) nhằm hiện thực hóa Giai đoạn 1 (Mô-đun 1 & 2).

### 1. Bảng `cases` (Cấu hình Vụ án)
- `id` (UUID, Primary Key)
- `title` (Text) - Tên vụ án
- `synopsis` (Text) - Tóm tắt cốt truyện
- `cover_url` (Text) - Ảnh bìa
- `difficulty` (Int) - Độ khó từ 1 đến 5
- `category` (Enum) - Thể loại (Closed Room, Poisoning...)
- `req_detective_level` (Int) - Level yêu cầu tối thiểu
- `status` (Enum) - Trạng thái: DRAFT, IN_REVIEW, PUBLISHED
- `created_at` / `updated_at` (Timestamps)

### 2. Bảng `characters` (Nhân vật & Vai trò)
- `id` (UUID, Primary Key)
- `case_id` (UUID, Foreign Key -> `cases.id`)
- `name` (Text) - Tên nhân vật
- `role` (Enum) - Phân loại: VICTIM, KILLER, SUSPECT, WITNESS, DETECTIVE
- `avatar_url` (Text)
- `is_global` (Boolean) - Đánh dấu nhân vật xuyên suốt vũ trụ

### 3. Bảng `truth_profiles` (Bộ Ba Thuộc Tính Bản Chất)
Liên kết 1-1 với `characters`. Tách bảng để đảm bảo bảo mật RLS (chỉ Admin mới đọc được sự thật).
- `id` (UUID, Primary Key)
- `character_id` (UUID, Foreign Key -> `characters.id`, Unique)
- `real_motive` (Text) - Động cơ thực tế
- `real_alibi` (JSONB) - Chứng cứ ngoại phạm thực tế (100% đúng)
- `red_herring_secret` (Text) - Bí mật mờ ám muốn che giấu

### 4. Bảng `relationships` (Ma trận Quan hệ)
- `id` (UUID, Primary Key)
- `case_id` (UUID, Foreign Key -> `cases.id`)
- `character_1_id` (UUID, Foreign Key -> `characters.id`)
- `character_2_id` (UUID, Foreign Key -> `characters.id`)
- `relation_type` (Text) - Loại quan hệ (Thù hận, Tình nhân...)
- `affinity_score` (Int) - Độ thân thiết/Căng thẳng (-100 đến 100)

---

## V. TÍCH HỢP VỚI GIAO DIỆN PHÁ ÁN (INVESTIGATION FRONTEND)

Sự kết hợp giữa Admin Studio và Giao diện Phá án Online tạo thành một hệ sinh thái **Sáng tạo - Trải nghiệm (Creator - Player)** hoàn chỉnh. Admin Studio đóng vai trò là "Động cơ" (Engine) sản xuất dữ liệu, trong khi Giao diện Phá án là "Trình phát" (Player) tiêu thụ và hiển thị dữ liệu đó dưới dạng gameplay.

### 1. Kiến trúc Hướng Dữ Liệu (Data-Driven Gameplay)
- Thay vì hardcode kịch bản cho từng vụ án, Giao diện Phá án được thiết kế dưới dạng các UI Component linh hoạt (Dynamic Components) đọc trực tiếp dữ liệu (JSON Schema/Supabase) do Admin Studio xuất ra.
- Các bảng `cases`, `characters`, `truth_profiles`, `timeline_events` sẽ thay thế hoàn toàn dữ liệu giả (mock data), cho phép cập nhật nội dung vụ án realtime mà không cần deploy lại frontend.

### 2. Hiện thực hóa Cơ chế "Sự thật & Lời khai giả" (Truth vs Lies)
Admin Studio định nghĩa **Bí mật ngụy tạo (Red Herring Secret)** và **Sự thật (Real Alibi)**. Giao diện Phá án sẽ chuyển hóa cấu hình này thành cơ chế **Chất vấn (Interrogation)**:
- Độc giả tiếp cận Lời khai ban đầu (có thể chứa lời nói dối để che giấu Red Herring).
- Người chơi sử dụng **Bằng chứng** thu thập được đập vào lời khai mâu thuẫn.
- Nếu bằng chứng lật tẩy được `Red Herring Secret`, giao diện kích hoạt animation (vd: Glass-break, text gạch xóa) và nhân vật buộc phải khai ra `Real Alibi`.

### 3. Giao diện Phá án đóng vai trò "Sandbox QA" (Mô-đun 8)
- Giao diện Phá án chính là nền tảng cốt lõi phục vụ cho **Mô-đun 8 (Sandbox QA)** của Admin Studio.
- Ngay trong lúc sáng tác tại Admin Studio, tác giả có thể nhấn nút **"Playtest"**. Hệ thống lập tức load dữ liệu bản nháp (Draft) vào Giao diện Phá án, cho phép tác giả tự nhập vai thám tử để kiểm tra nhịp độ (pacing), độ khó manh mối và tính hợp lý của tiến trình.

### 4. Chuyển hóa Ma trận Quan hệ thành Sơ đồ Tư duy (Mindmap/Miro-board)
- Dữ liệu từ bảng `relationships` (loại quan hệ, độ thân thiết) được Giao diện Phá án sử dụng để tạo ra một **Bảng Không Gian (Miro-board/Detective Board)**.
- Người chơi tương tác trực quan: kéo thả avatar nhân vật, dán giấy ghi chú, và hệ thống tự động vẽ dây nối (dựa trên data) hoặc để người chơi tự nối nhằm mô phỏng trải nghiệm phá án thực tế.
