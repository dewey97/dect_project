# ⚙️ License System — Technical Specification

> **Trạng thái:** Draft — chưa implement  
> **Cập nhật lần cuối:** 2026-10-10  
> **Tài liệu nghiệp vụ:** xem `07_license_access_system.md`

---

## 1. Offline Mode — Physical Boardgame Companion (Zero-Auth / Static QR)

### 1.1 Triết Lý Thiết Kế (Pragmatic Architecture)
- **Tài liệu mật nằm trên giấy vật lý:** Toàn bộ lời khai, ảnh tử thi, mẫu vật chứng nằm trong hộp giấy. Web app chỉ đóng vai trò công cụ phụ trợ (bẻ khóa điện thoại Khang, máy nghe audio, nhập đáp án checkpoint).
- **Không cần bảo mật RSA / JWT phức tạp:** Người không có hộp giấy dù có link web cũng không thể giải được vụ án. Việc chia sẻ link còn đóng vai trò phễu marketing miễn phí (Upsell mua hộp thật).
- **Tối ưu chi phí in ấn:** Toàn bộ lô hàng (500 – 1.000 hộp) in **chung một mã QR tĩnh duy nhất**, không cần in mã biến đổi đắt đỏ.

### 1.2 QR Code & Activation Flow
- **Định dạng QR:** In bên trong nắp hộp, trỏ trực tiếp về:
  ```
  https://dect.vn/play/case-000?mode=box
  ```
- **Kích hoạt Client-side:**
  - Khi quét QR vào app, client lưu cờ trạng thái:
    `investigation_mode: 'box'` vào `localStorage`.
  - Không cần đăng ký tài khoản, không cần gọi API xác thực, vào thẳng bàn chơi trong 1 giây.
- **Tạo phòng nhóm từ bản hộp:**
  - Người cầm hộp có thể tạo phòng chơi nhóm trực tiếp mà không cần trừ credit, sinh mã 4 chữ (VD: `SHER`) để bạn bè cùng bàn quét vào chơi đồng bộ.

---

## 2. Online Mode — Auth & License

### 2.1 Auth Stack
| Layer | Công nghệ |
|---|---|
| Auth & Account | Supabase Auth (email / Google OAuth) |
| Session token | JWT — expiry ngắn (1-2h) + refresh token rotation |
| JWT library | `jose` |

### 2.2 License Table

```sql
licenses (
  id              UUID PRIMARY KEY,
  account_id      UUID REFERENCES auth.users(id),
  game_id         TEXT,                        -- 'case_000', 'case_001', ...
  tier            TEXT,                        -- 'solo' | 'duo' | 'party'
  solo_access     BOOLEAN DEFAULT true,
  group_credits   INTEGER DEFAULT 0,           -- số lượt tạo phòng nhóm còn lại
  order_id        TEXT,                        -- ref từ payment gateway
  created_at      TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ                  -- null = vĩnh viễn
)
```

### 2.3 Authorization Flow
Mọi API call trả về nội dung phải kiểm tra:
```
account_id → license.game_id === requested_game_id → cho phép
                                                    → từ chối 403
```

---

## 3. Group Play — Room System

### 3.1 DB Schema

```sql
-- Phòng chơi nhóm
game_rooms (
  id              UUID PRIMARY KEY,
  room_code       TEXT UNIQUE,                 -- "DECT-4829" (6 ký tự)
  host_license_id UUID REFERENCES licenses(id),
  game_id         TEXT,
  status          TEXT,                        -- 'waiting' | 'active' | 'finished'
  created_at      TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  max_guests      INTEGER
)

-- Thành viên trong phòng
room_participants (
  id          UUID PRIMARY KEY,
  room_id     UUID REFERENCES game_rooms(id),
  account_id  UUID REFERENCES auth.users(id) NULLABLE,  -- null nếu guest
  nickname    TEXT,
  role        TEXT,                            -- 'host' | 'guest'
  joined_at   TIMESTAMPTZ
)
```

### 3.2 Tạo Phòng — Credit Check
```
POST /api/rooms/create
  → Check license.group_credits > 0
  → Decrement group_credits -= 1
  → Insert game_rooms (status: 'waiting')
  → Return room_code
```

### 3.3 Realtime Sync
- Dùng **Supabase Realtime** để sync trạng thái phòng
- Khi ai submit đáp án → broadcast → tất cả member nhận event → phòng đóng

---

## 4. Bảo Mật Nội Dung (Anti-Scrape)

### 4.1 Rate Limiting
- Tối đa N requests/phút per account cho các endpoint tài liệu
- Implement tại **Next.js Edge Middleware**

### 4.2 Watermark Tài Liệu
- **Chưa chốt:** watermark tĩnh (theo game) hay động (in `account_id` vào PDF)
- Dynamic watermark tốn resource hơn nhưng truy vết được nguồn leak

---

## 5. Payment Integration

| | |
|---|---|
| **Ưu tiên** | PayOS (VN-friendly, hỗ trợ QR banking) |
| **Dự phòng** | Stripe (quốc tế) |
| **Webhook** | Sau payment success → tạo license record |

---

## 6. Lỗ Hổng Kỹ Thuật

> Rủi ro vận hành & chính sách xem tại `07_license_access_system.md`

#### [SEC-01] Phiên Đăng Nhập Bị Đánh Cắp
```
XSS hoặc network attack → lấy được JWT → dùng đến khi hết hạn
```
- **Giải pháp:** Access token expiry ngắn (1–2h) + refresh token rotation
- **Lưu ý:** Refresh token chỉ dùng được 1 lần — sau khi rotate, token cũ bị vô hiệu

#### [SEC-02] Tài Liệu Bị Scrape Hàng Loạt
```
Mua 1 license → viết script → tải hết toàn bộ PDF/evidence → share lên mạng
```
- **Giải pháp 1:** Rate limiting — tối đa N requests/phút per account tại Edge Middleware
- **Giải pháp 2:** Watermark động — in `account_id` vào PDF khi serve → truy vết được nguồn leak
- **Trạng thái:** Watermark tĩnh hay động — chưa chốt (xem open decisions)

#### [SEC-03] Truy Cập Nội Dung Chưa Mua
```
Mua Case #000 → tự ý gọi API với case_id=case_001 → xem được nội dung chưa mua?
```
- **Giải pháp:** Mọi API endpoint trả nội dung phải enforce:
  ```
  account_id → licenses WHERE game_id = :requested_game_id → 200 OK hoặc 403
  ```
- **Trạng thái:** Phải thiết kế từ đầu, không được để lọt

---

## 7. Quyết Định Kỹ Thuật Còn Mở

- [ ] **Watermark tài liệu:** Tĩnh (theo game) hay động (theo account_id)?
- [ ] **Rate limit ngưỡng:** Bao nhiêu requests/phút là hợp lý?
- [ ] **Offline QR expiry:** Có đặt `exp` trong JWT không? Bao lâu?

---

## 8. Stack Tổng Thể

| Layer | Công nghệ |
|---|---|
| Auth & Account | Supabase Auth |
| License DB | Supabase PostgreSQL |
| JWT Online | `jose` library |
| QR Offline (Hộp giấy) | Static QR trỏ URL mode=box + localStorage |
| Payment | PayOS / Stripe |
| Rate limiting | Next.js Edge Middleware |
| Realtime (phòng nhóm) | Supabase Realtime |
