# 20. Phone Studio & Dynamic Phone Engine Architecture

> **Phạm vi:** Module quản trị `/studio/phone` cho phép biên tập thiết bị tang vật điện thoại (chassis iPhone/Android, lock screen, status bar, wallpaper, passcode), launcher 15 ứng dụng và toàn bộ chứng cứ số (tin nhắn, cuộc gọi ghi âm, danh bạ, ảnh thư viện, ghi chú, sao kê ngân hàng, lịch sử duyệt web) lưu trữ trực tiếp trên Supabase.
>
> **Trạng thái:** Runtime hỗ trợ Dual-source querying (ưu tiên đọc Supabase qua `/api/phone-data/*`, tự động fallback về Google Sheets `/api/phone` nếu chưa migrate).

---

## 1. Bối cảnh & Lý do thay thế Google Sheets

Trước đây, toàn bộ dữ liệu ứng dụng điện thoại được quản lý qua Google Sheets tab `phone`:

- Dữ liệu bị giới hạn bởi bảng tính 2 chiều, khó quản lý media (ảnh, audio ghi âm, file đính kèm).
- Cấu hình thiết bị (chassis iPhone 6s Plus, hình nền, màn hình khóa, passcode) bị hardcode trong mã nguồn TypeScript (`components/phone-engine/chassis/*`).
- 15 ứng dụng trên màn hình chính (`home-screen.tsx`) bị cố định, không thể tùy biến layout hay thêm/bớt app theo từng vụ án.
- Không thể nhân bản điện thoại khi clone vụ án mới.

**Phone Studio** giải quyết triệt để:

- Lưu trữ toàn bộ dữ liệu trong các bảng Supabase chuyên biệt theo `case_slug`.
- Cấu hình thiết bị linh hoạt qua JSONB `case_characters.device` của nạn nhân.
- Giao diện WYSIWYG 3 cột trực quan: sửa form bên trái, xem mô phỏng iPhone live bên phải.
- Nhân bản tự động 1-click qua `duplicateCase()`.

---

## 2. Nguồn dữ liệu Runtime (Dual-Source Architecture)

Hệ thống áp dụng cơ chế chuyển dịch an toàn, không làm gián đoạn Case #000:

```
[Phone Component / App]
       │
       ▼
usePhoneData(tab, caseId)
       │
       ├─► 1. Gọi /api/phone-data/[tab]?caseId=[caseId] (Supabase)
       │      │
       │      ├─ Có data (> 0 rows) ──► Trả về runtime render
       │      └─ Rỗng / Lỗi / Chưa migrate
       │             │
       │             ▼
       └─► 2. Fallback: Gọi /api/phone?tab=[tab]&caseId=[caseId] (Google Sheets)
```

### Các Endpoint API:

- `GET /api/phone-data/apps?caseId=<slug>`: Danh sách app launcher sắp xếp theo `is_dock`, `slot_index`.
- `GET /api/phone-data/[tab]?caseId=<slug>`: Trả dữ liệu `contacts | calls | messages | photos | notes | bank | browser`.
- Header: `cache: no-store`, `dynamic = 'force-dynamic'`.

---

## 3. Cấu trúc Database Supabase

### 3.1. Danh mục bảng:

1. `case_phone_apps`: Cấu hình 15 ứng dụng launcher (tên, icon, dock, locked, checkpoint_id).
2. `phone_contacts`: Danh bạ điện thoại, avatar, phân loại, cờ nghi vấn (`is_suspicious`).
3. `phone_calls`: Lịch sử cuộc gọi (đến/đi/nhỡ), file audio ghi âm thoại (`audio_url`), cờ manh mối.
4. `phone_messages`: Tin nhắn SMS / Chat iMessage theo thread (`thread_key`), file đính kèm ảnh, manh mối.
5. `phone_photos`: Album ảnh thư viện, EXIF JSON (tọa độ, thiết bị), cờ bằng chứng (`is_evidence`).
6. `phone_notes`: Ứng dụng ghi chú, cờ ghim (`is_pinned`), nội dung (`body`), cờ manh mối.
7. `phone_bank_transactions`: Sao kê ngân hàng, loại giao dịch (`in`/`out`), số tiền, đối tác, cờ manh mối.
8. `phone_browser_history`: Lịch sử duyệt web Safari, URL, thời gian truy cập, cờ manh mối.

### 3.2. Cấu hình thiết bị trong `case_characters.device`:

```json
{
  "chassis": "iphone_classic",
  "wallpaper_url": "/images/cases/case_000/phone/clean_beach_wallpaper.png",
  "selfie_url": "/images/cases/case_000/phone/monkey_selfie.png",
  "passcode": "120713",
  "status_bar": {
    "time": "21:30",
    "battery": 15,
    "service_text": "Không có Dịch vụ"
  },
  "lock_screen": {
    "time": "21:30",
    "date": "Thứ Bảy, 23 tháng 7"
  },
  "settings_info": {
    "owner": "Nguyễn Văn Khang",
    "model": "iPhone 6s Plus (64GB)",
    "imei": "356984110294812",
    "battery": "18%"
  }
}
```

---

## 4. Kiến trúc Studio WYSIWYG (`/studio/phone`)

Giao diện quản trị 3 cột tại `app/(admin)/studio/phone/`:

1. **Cột 1 — Case Picker & Stats Bar**:
   - Chọn vụ án cần biên soạn.
   - Hiển thị thống kê tổng số chứng cứ số, tin nhắn, cuộc gọi, ảnh.
   - Nút nạp template mặc định 15 apps iOS chuẩn.

2. **Cột 2 — Editor Tabs chuyên biệt**:
   - **Thiết bị**: Đổi chassis (`iphone_classic`, `iphone_modern`, `android_vintage`), ảnh nền, ảnh selfie, pin, sóng, passcode.
   - **Launcher Apps**: Bật/tắt app, đổi tên, icon, toggle Dock, khóa app theo Checkpoint ID.
   - **Tin nhắn**: Quản lý thread hội thoại, chat bubble `me`/`them`, đính kèm ảnh, gắn thẻ manh mối.
   - **Cuộc gọi**: Lịch sử gọi, upload file ghi âm thoại `.mp3`/`.wav`.
   - **Danh bạ**: Điền nhanh từ hồ sơ nhân vật (`DbCaseCharacter`), đánh dấu nghi vấn.
   - **Thư viện Ảnh**: Upload hàng loạt ảnh vào bucket `phone-assets`, gắn cờ chứng cứ phá án.
   - **Ghi chú & Khác**: Quản lý Notes, sao kê ngân hàng và lịch sử Safari.

3. **Cột 3 — PhoneSimulator Live Preview**:
   - Khung điện thoại tương tác 100% thời gian thực.
   - Thử nghiệm mở app, đọc tin nhắn, duyệt ảnh ngay trong trình duyệt admin.

---

## 5. Quy trình Nhân bản Vụ án (Deep Clone)

Hàm `duplicatePhoneData(sourceSlug, targetSlug)` trong `lib/actions/phone-actions.ts` được tích hợp trực tiếp vào `duplicateCase()`:

- Sao chép toàn bộ danh mục ứng dụng `case_phone_apps`.
- Sao chép toàn bộ tin nhắn, cuộc gọi, danh bạ, ảnh, ghi chú, giao dịch và lịch sử duyệt web.
- Tự động cấp ID mới cho mọi bản ghi, gán khóa ngoại `case_slug = targetSlug`.

---

## 6. Storage Bucket & Quản lý Asset

- Bucket: `phone-assets` (public read, authenticated/admin write).
- Phân thư mục theo vụ án: `phone-assets/<case_slug>/<folder>/<filename>`.
- Client upload trực tiếp qua Server Action `uploadPhoneAsset(formData)` với kiểm tra MIME type và kích thước an toàn.

---

## 7. Kiểm thử Tự động E2E & Xác thực Admin

- **Playwright Setup Project (`auth.setup.ts`)**: Lưu `storageState` admin vào `e2e/.auth/admin.json` trước khi chạy các spec admin. Nếu thiếu biến môi trường `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`, ghi storageState rỗng và dùng `test.skip` để không làm fail test suite.
- **P28 — Runtime Case #000 (`e2e/phone-runtime.spec.ts`)**: Mở điện thoại nạn nhân, xác minh 15 ứng dụng hiển thị đầy đủ và ứng dụng Tin nhắn hiển thị ít nhất 1 thread hội thoại.
- **P29 — Deep Clone & Custom App (`e2e/phone-case-create.spec.ts`)**: Kiểm tra khả năng tạo vụ án mới, thêm ứng dụng launcher tùy biến và hiển thị tức thì trên Phone Simulator preview.
