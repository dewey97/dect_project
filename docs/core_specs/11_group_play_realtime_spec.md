# 👥 Đặc Tả Hệ Thống Chơi Nhóm Đồng Bộ Tiến Trình (Group Play Realtime Specification)

> **Tài liệu Kỹ thuật Tầng 1 (Technical Spec #11)**  
> **Trạng thái:** Approved Architecture  
> **Cập nhật lần cuối:** 2026-10-14  
> **Tài liệu liên quan:** [`07_license_access_system.md`](07_license_access_system.md), [`08_license_technical_spec.md`](08_license_technical_spec.md), [`02_database_schema.md`](02_database_schema.md)

---

## 🧭 PHẦN 1: TỔNG QUAN HỆ THỐNG & TRIẾT LÝ THIẾT KẾ (OVERVIEW)

### 1.1. Bối cảnh & Mục đích
Hệ thống **Group Play (Chơi Nhóm)** cho phép một nhóm bạn (2 – 6 người) cùng tham gia điều tra phá án một vụ án trên nhiều thiết bị cá nhân (điện thoại hoặc máy tính). Nhóm có thể ngồi cùng quanh một bàn chơi trực tiếp (kèm bộ hộp Boardgame vật lý) hoặc chơi từ xa qua các kênh đàm thoại (Discord, Google Meet, Zalo).

### 1.2. Triết lý Thiết kế Cốt Lõi (Core Principles)
1. **Zero-Friction Access (Vào phòng không rào cản):**
   * Người tạo phòng (Host) sinh mã phòng 4 chữ cái (VD: `SHER`) và mã QR / Link mời.
   * Khách mời (Guests) quét QR hoặc bấm link, nhập Nickname là vào bàn chơi ngay trong 3 giây.
   * **Tuyệt đối không bắt khách mời tạo tài khoản, xác thực email hay tải app.**
2. **Strict Silo Separation (Cách ly tuyệt đối Solo vs Room):**
   * Chế độ **Solo (Cá nhân)** và chế độ **Room (Nhóm)** là hai thế giới tách biệt hoàn toàn.
   * Khi tạo phòng mới, tiến trình phòng luôn xuất phát từ **0% (Vụ án mới tinh)** để đảm bảo công bằng và nguyên vẹn trải nghiệm cho cả nhóm.
   * Vào phòng chơi nhóm **không bao giờ ảnh hưởng hoặc làm bẩn savegame Solo** của từng cá nhân.
3. **Shared Truth vs. Private Viewport (Tiến trình chung vs. Góc nhìn riêng):**
   * **Đồng bộ chung:** Trạng thái bẻ khóa điện thoại, mở khóa manh mối, giải đúng checkpoint, kích hoạt lệnh khám xét lại, nộp Cáo trạng kết án.
   * **Độc lập riêng:** Vị trí cuộn trang, zoom tài liệu, popup đọc hồ sơ lời khai. Ai đọc gì tùy ý, không bị cướp màn hình của nhau.
4. **Curated Board Layout (Bố cục do Game Master định hình):**
   * Người chơi không kéo thả ghim tự do hay can thiệp bố cục Canvas. Vị trí các manh mối trên bảng điều tra do kịch bản và Admin thiết kế sẵn, chỉ hiển thị mở dần khi nhóm mở khóa thành công.
5. **Dual Entry Model (Bản Hộp Giấy vs Bản Online):**
   * **Bản Hộp Giấy (Physical Companion):** Quét Static QR in trong nắp hộp (`?mode=box`) ➔ Vào thẳng công cụ hỗ trợ mà không cần tài khoản; người cầm hộp có thể bấm [Tạo phòng] để đồng bộ máy cho bạn bè cùng bàn.
   * **Bản Online (Digital Access):** Đăng nhập Supabase Auth ➔ Quản lý license và số lượt tạo phòng; chia sẻ link Discord cho bạn bè chơi từ xa.

---

## 🗄️ PHẦN 2: CƠ SỞ DỮ LIỆU & KIẾN TRÚC BACKEND (DATABASE SCHEMA)

Hệ thống tận dụng nền tảng **Supabase PostgreSQL** đã có sẵn trong dự án.

### 2.1. Bảng `game_rooms`

```sql
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(4) NOT NULL,               -- Mã phòng 4 ký tự Crockford Base32 (VD: "SHER")
  game_id VARCHAR(50) NOT NULL DEFAULT 'case_000',
  host_nickname VARCHAR(100) NOT NULL,        -- Tên người tạo phòng
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'completed' | 'archived'
  
  -- Single Source of Truth cho tiến trình vụ án
  state_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  version INTEGER NOT NULL DEFAULT 1,          -- Version counter phục vụ sync chống rớt mạng
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index tra cứu phòng đang hoạt động
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_rooms_active_code 
ON game_rooms(room_code) 
WHERE status = 'active';
```

### 2.2. Cấu trúc Tiến Trình `state_json`

```ts
export interface RoomInvestigationState {
  // Giai đoạn 0: Bẻ khóa điện thoại nạn nhân
  phoneSolved: boolean
  phoneInputs: {
    phone1?: string
    phone2?: string
    phone3?: string
  }

  // Giai đoạn 1: Thẩm vấn nghi phạm & Checkpoints
  investigatedSuspects: ('vu' | 'tung' | 'ha')[]
  solvedFollowups: ('vu' | 'tung' | 'ha')[]
  completedCheckpoints: string[]     // ID các checkpoint đã giải (VD: ["cp-000-1", "cp-000-2a"])

  // Giai đoạn 2: Khám xét lại hiện trường
  reinvestigateUnlocked: boolean
  reinvestigateOpened: boolean

  // Giai đoạn kết: Cáo trạng & Thủ phạm
  indictmentSolved: boolean
  indictmentCulprit: 'vu' | 'tung' | 'ha' | null

  // Nhật ký hành động gần nhất để hiển thị Toast thông báo
  lastAction?: {
    actorName: string
    actionText: string
    timestamp: number
  }
}
```

---

## 🔄 PHẦN 3: GIAO THỨC ĐỒNG BỘ REALTIME & LUỒNG DỮ LIỆU (DATA FLOW)

```
[ Client A (Nam) ] ──────── Bấm giải đúng ────────┐
       │                                         │
       ▼ (1. Local Optimistic Update)            │
  Giao diện Nam mở khóa                          │
                                                 ▼
                                     [ POST /api/rooms/progress ]
                                     (Server Route bảo mật bằng Service Role)
                                                 │
                                                 ├────────────────────────┐
                                                 ▼ (2. JSON Patch DB)     ▼ (3. Supabase Broadcast)
                                         [ Postgres game_rooms ]   [ Kênh room:SHER ]
                                         state_json || :patch      bắn event PROGRESS_UPDATE
                                         version = version + 1                    │
                                                                  ┌───────────────┴───────────────┐
                                                                  ▼                               ▼
                                                          [ Client B (Vy) ]               [ Client C (Tuấn) ]
                                                          Merge state                     Merge state
                                                          Toast: "Nam vừa..."             Toast: "Nam vừa..."
```

### 3.1. Kênh Supabase Realtime Channel
* Mỗi phòng lắng nghe trên 1 kênh duy nhất: `room:${room_code}`.
* **Payload Event `PROGRESS_UPDATE`:**
  ```json
  {
    "type": "PROGRESS_UPDATE",
    "version": 4,
    "senderId": "client_abc123",
    "patch": { "phoneSolved": true },
    "actorName": "Nam",
    "actionText": "đã bẻ khóa thành công điện thoại của Khang"
  }
  ```

### 3.2. Cơ chế Vá Dữ Liệu (JSON Patch Merge) chống Race Condition
Khi nhiều người chơi submit hành động gần như đồng thời, Server không ghi đè toàn bộ `state_json`. Server áp dụng phép merge của PostgreSQL:
```sql
UPDATE game_rooms 
SET 
  state_json = state_json || $1::jsonb,
  version = version + 1,
  updated_at = NOW()
WHERE room_code = $2 AND status = 'active'
RETURNING state_json, version;
```
Đối với các mảng (như `completedCheckpoints`), server thực hiện phép hợp (Union) để bảo toàn đáp án của mọi thành viên.

### 3.3. Cơ chế Khôi Phục Mạng (Sleep / Reconnect Fallback)
Khi người chơi tắt màn hình điện thoại hoặc mạng 4G bị gián đoạn:
1. Khi tab trình duyệt active trở lại (`visibilitychange` hoặc sự kiện `online`):
2. Client gửi một truy vấn nhẹ kiểm tra: `GET /api/rooms/state?code=SHER`.
3. Nếu `serverVersion > localVersion`, Client tự động nạp lại bản Snapshot mới nhất từ DB.

---

## 🎨 PHẦN 4: THIẾT KẾ TRẢI NGHIỆM NGƯỜI CHÙNG (UI/UX SPECIFICATION)

### 4.1. Mã Phòng (Room Code Generator)
* Sử dụng bộ ký tự an toàn **Crockford Base32**: `23456789ABCDEFGHJKMNPQRSTUVWXYZ`.
* Loại bỏ hoàn toàn các ký tự gây nhầm lẫn: `0`, `O`, `1`, `I`, `L`.
* Độ dài: đúng **4 ký tự** (VD: `SHER`, `W9TK`, `7KAP`).

### 4.2. Giao Diện Tương Tác
1. **Nút `[ 👥 Chơi Nhóm ]`:** Đặt trên Header điều tra chính.
2. **Modal Quản Lý Phòng (`RoomModal`):**
   * **Tab Tạo phòng:** Bấm nút ➔ Sinh mã to bản + Nút *[Sao chép Link mời Discord]* + Nút *[Hiện mã QR]*.
   * **Tab Vào phòng:** Ô nhập mã 4 ký tự + Ô nhập Nickname thám tử.
3. **Thanh Trạng Thái Phòng (`RoomBadge`):**
   * Hiển thị gọn gàng góc trên: `[ 🟢 Phòng: SHER ]`.
   * Bấm vào để sao chép lại link mời hoặc chọn *[Rời phòng]*.
4. **Thông Báo Vinh Danh Đồng Đội (Team Toast):**
   * Khi thành viên giải xong mục tiêu, góc màn hình hiện Toast thông báo màu vàng/xanh kèm âm thanh hiệu ứng nhẹ:  
     `🕵️ Nam vừa bẻ khóa thành công tin nhắn của Khang!`

### 4.3. Cơ Chế Room Token & Phục Hồi Session (Handshake Protocol)
1. **Phân quyền Host vs Guest:**
   * Khi Host tạo phòng (`POST /api/rooms/create`): Server cấp `host_token` lưu trong `localStorage` của Host. Chỉ Host mới có quyền đóng phòng/kết thúc phiên.
   * Khi Guest tham gia (`POST /api/rooms/join`): Server cấp `guest_token` tạm thời.
2. **Chống trùng lặp & Tự hồi phục khi F5 / Mất mạng:**
   * Client lưu session: `{ roomCode: "SHER", participantToken: "tok_...", nickname: "Vy" }`.
   * Khi người chơi reload trang hoặc mở lại Safari: App tự động gọi `POST /api/rooms/reconnect` với token cũ ➔ Server nhận diện đúng người cũ, không bắt nhập lại tên, không sinh ra "Vy (1)".

---

## 🔒 PHẦN 5: BẢO MẬT & XỬ LÝ NGOẠI LỆ (SECURITY & EDGE CASES)

1. **Chống can thiệp Client (No Anon Direct Writes):**
   * Quyền `UPDATE` trên bảng `game_rooms` bị vô hiệu hóa đối với `anon role`.
   * Mọi cập nhật trạng thái bắt buộc phải thông qua Next.js Server Route (`/api/rooms/progress`) được xác thực.
2. **Chống Vòng Lặp Vô Tận (Echo Loop Guard):**
   * Mỗi client sinh một UUID tạm thời `clientId` khi mount.
   * Khi nhận event Broadcast: Nếu `senderId === myClientId` ➔ Bỏ qua ngay lập tức.
3. **Cách Ly Tuyệt Đối LocalStorage:**
   * Khi đang ở trong phòng (`roomCode !== null`), toàn bộ state điều tra chỉ tồn tại trong React Context/Memory và đồng bộ qua Supabase.
   * Không bao giờ đọc/ghi đè vào các key lưu trữ của chế độ Solo.
4. **Hết Hạn Phòng (Room Expiration):**
   * Phòng tự động lưu trữ (`status = 'archived'`) sau 24 giờ kể từ khi tạo hoặc khi nhóm nộp xong Bản Cáo Trạng thành công.
