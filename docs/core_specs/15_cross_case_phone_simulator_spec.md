# Phone Engine Architecture & Multi-Device Modular Guide

> **Mã tài liệu**: `docs/core_specs/15_cross_case_phone_simulator_spec.md`  
> **Trạng thái**: Đã chuẩn hóa Kiến trúc 4 Tầng & Định hướng Tách Module dùng chung cho mọi Case  
> **Áp dụng cho**: Toàn bộ các vụ án (Case #000, #001, #002,...) và các dòng thiết bị (iOS, Android, Dumbphone)

---

## 🎯 1. Tầm Nhìn & Mục Tiêu Module Hóa

Trong game trinh thám, thiết bị di động (điện thoại của nạn nhân, điện thoại của các đối tượng tình nghi, máy burner dùng một lần) là trung tâm của các **Bằng chứng số (Digital Evidence)**.

### Thách thức thực tế:
- **Case #000 (Án mạng 2016)**: Chiếc iPhone 6s Plus Rose Gold viền dày, nút Home tròn.
- **Case hiện đại**: iPhone 15 Pro / Dynamic Island hoặc điện thoại màn hình tràn viền.
- **Case nghi phạm / tội phạm chuyên nghiệp**: Máy Android phổ thông (Samsung/Xiaomi) hoặc Nokia "cục gạch" bàn phím T9.
- **Tuy nhiên, nghiệp vụ phá án không đổi**: Người chơi luôn cần đọc **Tin nhắn, Lịch sử cuộc gọi, Album ảnh & EXIF, Ghi chú, Bản đồ số, Biến động ngân hàng** và **Ghim bằng chứng lên Mindmap**.

Do đó, Phone Engine được thiết kế tách rời **Khung vỏ phần cứng (Hardware Chassis)** khỏi **Ứng dụng nghiệp vụ (Generic Apps)** và **Trạng thái máy (Headless Engine)**.

---

## 🏗️ 2. Mô Hình Phân Tách 4 Tầng (Clean Decoupled Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. DATA LAYER (Data-Driven / Case-Agnostic)                            │
│    - API & Live CMS: /api/phone?caseId=...&deviceId=...                │
│    - Schema thuần dữ liệu: messages, calls, photos, notes, banking     │
│    - Không chứa mã giao diện, dễ dàng nạp từ Google Sheets             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 2. CORE HEADLESS ENGINE (usePhoneEngine / PhoneContext)                │
│    - Quản lý trạng thái logic: isLocked, passcodeAttempt, PIN hint     │
│    - Điều hướng màn hình: activeApp, openApp, goHome, goBack           │
│    - Cầu nối Mindmap: isCluePinned, togglePinClue(clueId)              │
│    - Cơ chế pin ảo, đồng hồ đóng băng theo mốc thời gian vụ án         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 3. GENERIC APPS RUNTIME (Design System Phù Hợp)                        │
│    - <MessagesApp />, <PhotosApp />, <BankingApp />, <NotesApp />      │
│    - <MapsApp /> (Vector Map Engine tích hợp điều tra số)              │
│    - Tự động thích ứng style theo OS (iOS style hoặc Material)        │
│    - Nhận dữ liệu và callback ghim bằng chứng qua Context/Props        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 4. HARDWARE CHASSIS / SHELL (Vỏ phần cứng tách biệt hoàn toàn)         │
│    - <IPhoneClassicChassis />: iPhone 6s/7/8 (Bezel dày + nút Home)    │
│    - <IPhoneModernChassis />: Dynamic Island, viền siêu mỏng          │
│    - <AndroidChassis />: Camera đục lỗ, thanh 3 nút điều hướng        │
│    - <FeaturePhoneChassis />: Màn hình 2.4 inch + Bàn phím số T9      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 3. Sơ Đồ Cấu Trúc Thư Mục Chuẩn Hóa (`components/phone-engine/`)

Khi tách thành module độc lập, cây thư mục sẽ được tổ chức như sau:

```text
components/phone-engine/
├── chassis/                     # Khung vỏ vật lý (Chỉ bọc ngoài & nhận {children})
│   ├── iphone-modern-chassis.tsx# iPhone tai thỏ / Dynamic Island
│   ├── iphone-classic-chassis.tsx# iPhone đời cũ có phím Home vật lý
│   └── android-chassis.tsx      # Khung máy Android
├── core/                        # Headless State & Logic
│   ├── phone-context.tsx        # React Context chia sẻ state máy cho mọi App
│   ├── use-phone-engine.ts      # Hook điều khiển khóa, pin, stack app, pin clue
│   └── phone-data-provider.tsx  # Cung cấp dữ liệu tin nhắn, ảnh, cuộc gọi
├── apps/                        # Bộ ứng dụng nghiệp vụ dùng chung 100%
│   ├── messages/                # Tin nhắn SMS / iMessage / Zalo
│   ├── photos/                  # Thư viện ảnh + Inspector EXIF GPS
│   ├── calls/                   # Nhật ký cuộc gọi & Bàn phím quay số
│   ├── notes/                   # Sổ ghi chép cá nhân
│   ├── banking/                 # Sao kê tài chính / Biến động số dư
│   └── maps/                    # Bản đồ số & Dấu vết di chuyển
├── system/                      # Màn hình hệ điều hành
│   ├── lock-screen.tsx          # Màn hình khóa (nhập PIN, passcode)
│   ├── home-screen.tsx          # Lưới ứng dụng (Grid App Icons)
│   └── status-bar.tsx           # Đồng hồ đóng băng, pin, cột sóng
├── phone-simulator.tsx          # Facade Entrypoint: Cắm Chassis + Engine + Screen
└── README.md                    # Tài liệu hướng dẫn tích hợp nhanh cho Case mới
```

---

## ⚙️ 4. Chuẩn Định Nghĩa Thiết Bị (`PhoneDeviceProfile`)

Mỗi chiếc điện thoại trong vụ án được khai báo bằng một Profile độc lập:

```typescript
export interface PhoneDeviceProfile {
  id: string;                      // vd: "case_000_victim_phone"
  caseId: string;                  // vd: "case_000"
  label: string;                   // "iPhone 6s Plus (Vàng Hồng)"
  owner: string;                   // "Nguyễn Văn Khang"
  model: 'iphone_modern' | 'iphone_classic' | 'android_modern' | 'feature_phone';
  osTheme: 'ios' | 'android';
  
  // Thời gian & Trạng thái vật lý
  timeFreeze: string;              // "17:55"
  dateFreeze?: string;             // "Chủ Nhật, 24 tháng 7"
  batteryLevel?: number;           // 14 (%)
  wallpaperUrl?: string;
  
  // Bảo mật & Giải mã
  isLocked: boolean;
  passcode?: string;               // "2407"
  passcodeHint?: string;           // "Ngày sinh nhật hoặc ngày kỷ niệm"
  
  // Danh sách ứng dụng cài sẵn
  installedApps: PhoneAppId[];     // ['messages', 'banking', 'photos', 'notes', 'maps']
}
```

---

## 📌 5. Cơ Chế Ghim Bằng Chứng Số Lên Mindmap (`DigitalClueLink`)

Bất kỳ item nào trong điện thoại (một tin nhắn đe dọa, một tấm ảnh chụp hiện trường lúc 16:30, một giao dịch chuyển khoản 500 triệu) đều có thể được biến thành chứng cứ:

```typescript
export interface DigitalClueLink {
  isClue?: boolean;                // true nếu là vật chứng phá án
  clueId?: string;                 // Mã chứng cứ trên canvas (vd: "CLUE_MSG_THREAT_01")
  clueTitle?: string;              // Tiêu đề tóm tắt hiển thị trên thẻ Mindmap
  clueAnalysis?: string;           // Ghi chú nghiệp vụ của điều tra viên
  leadsToCardId?: string;          // Mở khóa hoặc liên kết đến Card nào trên bảng
}
```

Người chơi chỉ cần nhấn vào nút **📌 Ghim** trên thanh công cụ của tin nhắn/ảnh, hệ thống tự động đồng bộ sang Canvas Bảng Phá Án thông qua `togglePinClue(clue)`.

---

## 🚀 6. Lộ Trình Triển Khai Module Hóa (Roadmap)

1. **Giai đoạn 1 (Chassis Extraction)**:
   - Tách phần khung vỏ iPhone ra thành `IPhoneFrameWrapper` / `IPhoneChassis`.
   - Giữ nguyên toàn bộ logic hoạt động của Case #000 hiện tại, đảm bảo không hồi quy (zero regression).
2. **Giai đoạn 2 (PhoneContext & Decoupled Apps)**:
   - Các component `messages-app.tsx`, `photos-app.tsx`, `banking-app.tsx` lấy dữ liệu qua Hook/Context thay vì nhận props cồng kềnh từ component cha.
3. **Giai đoạn 3 (Multi-Device Plug & Play)**:
   - Tạo thêm chassis Android mẫu (`android-chassis.tsx`).
   - Hỗ trợ switch đổi profile thiết bị ngay trên dev mode / testbed để dễ dàng kiểm thử các vụ án tiếp theo.
