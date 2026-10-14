# Đặc Tả Kỹ Thuật: Module Điện Thoại & Bằng Chứng Số Dùng Chung (Cross-Case Phone Simulator Spec)

> **Mã tài liệu**: `docs/core_specs/15_cross_case_phone_simulator_spec.md`  
> **Trạng thái**: Đã chuẩn hóa Schema & State Hook (Đang hoàn thiện View Layer & Clean UI)  
> **Áp dụng cho**: Toàn bộ các vụ án (Case #000, #001, #002,...)

---

## 🎯 1. Mục Tiêu & Tầm Nhìn Kiến Trúc

Trong bất kỳ vụ án trinh thám hiện đại nào, **Điện thoại / Thiết bị cá nhân của nạn nhân hoặc nghi phạm** luôn là một trong những trung tâm bằng chứng số (Digital Evidence) quan trọng nhất.

Kiến trúc Module Điện Thoại được thiết kế theo nguyên tắc **Data-Driven & Plug-and-Play**:
1. **Dùng chung 1 Engine cho mọi Case**: Logic máy (mở khóa passcode, pin, sóng, navigation giữa các app, ghim bằng chứng) hoàn toàn độc lập với nội dung vụ án.
2. **Hỗ trợ Đa Thiết Bị**: 1 case có thể có nhiều điện thoại khác nhau (điện thoại nạn nhân, điện thoại nghi phạm A, v.v.) chỉ cần truyền `deviceId` hoặc `PhoneDeviceProfile`.
3. **Kết nối trực tiếp Bảng Phá Án (Evidence Mindmap)**: Bất kỳ mẩu tin nhắn, ảnh chụp EXIF, cuộc gọi ghi âm hoặc ghi chú nào cũng có thể đóng vai trò là một mẩu bằng chứng được ghim lên bảng suy luận.

---

## 🏗️ 2. Mô Hình Kiến Trúc 3 Tầng (3-Tier Engine)

```
┌────────────────────────────────────────────────────────┐
│  1. DATA LAYER (Live CMS & Case Spec)                  │
│     - Google Sheets / Database API: /api/phone         │
│     - Schema: PhoneDeviceProfile, Message, Photo, etc. │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  2. CORE STATE ENGINE (usePhoneEngine)                 │
│     - Trạng thái khóa: isLocked, passcodeAttempt, PIN  │
│     - Điều hướng: activeApp, openApp, goHome, goBack   │
│     - Tương tác phá án: togglePinClue, isCluePinned    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  3. VIEW SHELL & APPS (Presentation Layer)             │
│     - IPhoneFrame: Khung vỏ vật lý + Dynamic Status Bar│
│     - IPhoneHomeScreen: Grid ứng dụng theo installedApps│
│     - Modular Apps: Messages, Photos, Phone, Notes,... │
└────────────────────────────────────────────────────────┘
```

---

## 📑 3. Danh Mục Tệp Đã Chuẩn Hóa

| Tệp tin | Vai trò | Trạng thái |
| :--- | :--- | :--- |
| [`lib/types/phone.ts`](file:///d:/code_world/dect_project/lib/types/phone.ts) | Định nghĩa Type: `PhoneAppId`, `PhoneDeviceModel`, `PhoneDeviceProfile`, `DigitalClueLink` | ✅ Đã hoàn thành |
| [`lib/hooks/use-phone-engine.ts`](file:///d:/code_world/dect_project/lib/hooks/use-phone-engine.ts) | Controller Hook: passcode, navigation stack, clue pinning | ✅ Đã hoàn thành |
| [`lib/hooks/use-phone-data.ts`](file:///d:/code_world/dect_project/lib/hooks/use-phone-data.ts) | Hook nạp dữ liệu động từ Google Sheets / API theo tab & caseId | ✅ Sẵn sàng |
| [`components/investigation/iphone/iphone-home-screen.tsx`](file:///d:/code_world/dect_project/components/investigation/iphone/iphone-home-screen.tsx) | Màn hình Home, đã kích hoạt `appTarget: "photos"` | ✅ Đã sửa |
| [`components/investigation/iphone/iphone-frame.tsx`](file:///d:/code_world/dect_project/components/investigation/iphone/iphone-frame.tsx) | Khung máy iPhone, thanh điều hướng nhanh và các App view | ⏳ Đang đợi dọn dẹp UI |

---

## 📋 4. Hạng Mục Cần Clean Up Giao Diện Hiện Tại (UI Debt & Polish Checklist)

Theo phản hồi từ người dùng, trước khi gắn thêm tính năng mới, cần rà soát và clean lại UI của màn hình hiện tại:

1. **Khung máy & Tỷ lệ hiển thị (Phone Frame & Viewport)**:
   - Đảm bảo khung máy hiển thị vừa vặn trên cả màn hình nhỏ (laptop 13-14 inch và mobile) mà không bị che khuất thanh điều hướng.
   - Bỏ các viền thừa hoặc padding gây chật chội.
2. **Thanh Header / Quick Actions**:
   - Tối giản nút `Về Home` và nút `Đóng X` để giao diện nhìn thanh thoát, đúng chất thiết bị thật.
3. **Các Màn Hình App Chưa Đồng Nhất**:
   - Rà soát giao diện Messages, Photos, Phone, Notes để đảm bảo phong cách iOS đồng bộ, chữ rõ ràng, không bị vỡ layout hoặc tràn chữ.
   - Thao tác cuộn mượt mà (smooth scrolling) và không bị giật lag.
