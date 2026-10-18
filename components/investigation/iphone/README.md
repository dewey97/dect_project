# 📱 Phone Engine & Digital Evidence Module

> **Cross-Case Modular Phone Simulator**  
> Dùng chung cho toàn bộ các vụ án (`case_000`, `case_001`, `case_002`,...) và mọi kiểu dáng thiết bị (iPhone tai thỏ / Dynamic Island, iPhone Classic nút Home, Android nốt ruồi, điện thoại phổ thông).

---

## 🎯 Tổng Quan

Thư mục này quản lý toàn bộ hệ thống giả lập thiết bị cá nhân (điện thoại nạn nhân / nghi phạm) phục vụ điều tra kỹ thuật số.

Kiến trúc được thiết kế theo nguyên tắc **4 Tầng Độc Lập**:
1. **Data Layer**: Dữ liệu tin nhắn, ảnh, cuộc gọi, ngân hàng được nạp từ Google Sheets CMS hoặc API `/api/phone`.
2. **Core Engine**: Quản lý state mở khóa, nhập PIN, ngăn xếp ứng dụng (navigation stack), ghim manh mối số lên Mindmap.
3. **Generic Apps**: Toàn bộ ứng dụng điều tra (Tin nhắn, Thư viện ảnh + EXIF, Bản đồ GPS, Sổ ghi chú, Sao kê ngân hàng) được viết độc lập với loại máy.
4. **Hardware Chassis**: Khung vỏ vật lý (iPhone viền mỏng, iPhone Classic, Android...) bọc ngoài và có thể tráo đổi tùy theo vụ án.

---

## 🏗️ Cấu Trúc Thư Mục

```text
components/investigation/iphone/ (hoặc components/phone-engine/)
├── apps/                        # Các ứng dụng điều tra nghiệp vụ
│   ├── banking-app.tsx          # Sao kê ngân hàng & biến động số dư
│   ├── camera-app.tsx           # Trình xem camera
│   ├── contacts-app.tsx         # Danh bạ danh sách liên hệ
│   ├── maps-app.tsx             # Bản đồ số & Dấu vết di chuyển nạn nhân
│   ├── messages-app.tsx         # Tin nhắn iMessage / SMS / Zalo
│   ├── notes-app.tsx            # Ghi chú cá nhân & nhật ký
│   ├── phone-app.tsx            # Lịch sử cuộc gọi & Bàn phím số
│   ├── photos-app.tsx           # Thư viện ảnh kèm bộ đọc EXIF GPS
│   ├── safari-app.tsx           # Lịch sử duyệt web
│   ├── vector-map-canvas.tsx    # Canvas vector render bản đồ số
│   └── voicemail-app.tsx        # Hòm thư thoại ghi âm
├── iphone-frame.tsx             # Khung vỏ máy & điều hướng Home / Lock
├── iphone-home-screen.tsx       # Lưới icon ứng dụng (App Grid)
└── ...
```

---

## 💡 Cách Tích Hợp Cho Vụ Án Mới (Quickstart)

### 1. Định nghĩa `PhoneDeviceProfile`
Khai báo cấu hình chiếc điện thoại trong vụ án:
```typescript
import type { PhoneDeviceProfile } from '@/lib/types/phone'

export const victimPhoneProfile: PhoneDeviceProfile = {
  id: "case_001_victim_phone",
  caseId: "case_001",
  label: "Samsung Galaxy S22 (Đen)",
  owner: "Trần Minh Đức",
  model: "android_vintage",
  timeFreeze: "23:45",
  isLocked: true,
  passcode: "1995",
  passcodeHint: "Năm sinh chủ nhân",
  installedApps: ["messages", "photos", "banking", "maps", "notes"]
}
```

### 2. Sử dụng Component
```tsx
import { PhoneSimulator } from '@/components/investigation/phone-simulator'

export function CaseInvestigationScreen() {
  return (
    <PhoneSimulator 
      device={victimPhoneProfile}
      onClose={() => console.log('Đóng điện thoại')}
    />
  )
}
```

### 3. Ghim Manh Mối Số Lên Bảng Phá Án
Mỗi mẩu dữ liệu (tin nhắn, ảnh, giao dịch) đều hỗ trợ thuộc tính `DigitalClueLink`:
- `isClue: true`: Đánh dấu là vật chứng.
- `clueId: "CLUE_CODE"`: Mã manh mối đồng bộ sang canvas Mindmap.
- Khi người chơi bấm nút 📌, hệ thống tự động kích hoạt callback đưa chứng cứ lên bàn suy luận.

---

## 📚 Tài Liệu Đặc Tả Chi Tiết
Xem toàn bộ kiến trúc và roadmap tại:  
👉 [`docs/core_specs/15_cross_case_phone_simulator_spec.md`](../../docs/core_specs/15_cross_case_phone_simulator_spec.md)
