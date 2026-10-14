# 📋 Kế Hoạch Triển Khai Kỹ Thuật: Hệ Thống Chơi Nhóm Đồng Bộ (Group Play Implementation Plan)

> **Tài liệu Kỹ thuật Tầng 1 (Technical Spec #12)**  
> **Trạng thái:** Ready for Execution  
> **Cập nhật lần cuối:** 2026-10-14  
> **Tài liệu tham chiếu:** [`11_group_play_realtime_spec.md`](11_group_play_realtime_spec.md)

---

## 🎯 MỤC TIÊU TRIỂN KHAI
Hiện thực hóa tính năng chơi nhóm đồng bộ tiến trình (Group ID qua Supabase Realtime) cho Vụ án #000, cho phép 2 - 6 người chơi cùng phá án qua điện thoại hoặc Discord mà không cần đăng ký tài khoản cho khách mời.

---

## 🛠️ CÁC GIAI ĐOẠN THỰC THI (IMPLEMENTATION PHASES)

### 📌 Giai Đoạn 1: Hạ Tầng Cơ Sở Dữ Liệu & Server Routes
1. **Task 1.1: Database Migration trên Supabase (`game_rooms`)**
   * Tạo bảng `game_rooms` với các trường: `id`, `room_code`, `game_id`, `host_nickname`, `status`, `state_json`, `version`, `created_at`, `updated_at`.
   * Cấu hình Index và phân quyền RLS (Public Read cho phòng active, Service Role Write).
2. **Task 1.2: Server API Routes (`app/api/rooms/...`)**
   * `POST /api/rooms/create`:
     * Sinh mã phòng 4 chữ cái Crockford Base32 (không chứa `0, O, 1, I, L`).
     * Khởi tạo `state_json` mặc định (0% tiến trình).
     * Trả về `{ roomCode, roomId }`.
   * `GET /api/rooms/state?code=...`:
     * Lấy `state_json` và `version` hiện tại của phòng.
   * `POST /api/rooms/progress`:
     * Nhận payload: `{ roomCode, patch, actorName, actionText, senderId }`.
     * Áp dụng JSONB Patch Merge trong Postgres.
     * Kích hoạt phát Broadcast qua Supabase Realtime Channel `room:${roomCode}`.

---

### 📌 Giai Đoạn 2: Client Realtime Engine (`useRoomSync`)
1. **Task 2.1: Xây dựng Hook `useRoomSync.ts` (`lib/hooks/use-room-sync.ts`)**
   * Quản lý kết nối tới Supabase Realtime Channel `room:${roomCode}`.
   * Lắng nghe sự kiện `PROGRESS_UPDATE`.
   * Quản lý `clientId` tạm thời để lọc bỏ echo loop.
   * Lắng nghe `visibilitychange` và sự kiện `online` để tự động kéo lại Snapshot khi có mạng lại.
   * Cung cấp hàm `submitRoomProgress(patch, actionText)`.
2. **Task 2.2: Phân Tách Context Tiến Trình (Storage Isolation)**
   * Cập nhật `CheckpointsProvider` (`components/investigation/checkpoints-context.tsx`) và `useInvestigationState`:
     * Nếu không có `roomCode` ➔ Đọc/ghi `localStorage` bình thường (Solo Mode).
     * Nếu có `roomCode` ➔ Đọc/ghi từ Room State được nạp từ Supabase, **tuyệt đối không can thiệp vào `localStorage` cá nhân**.

---

### 📌 Giai Đoạn 3: Giao Diện Người Chơi (UI Components)
1. **Task 3.1: Component Modal Quản Lý Phòng (`components/investigation/room/room-modal.tsx`)**
   * Tab "Tạo phòng": Sinh mã 4 chữ, nút copy link mời Discord (`?room=CODE`), mã QR hiển thị nhanh.
   * Tab "Vào phòng": Ô nhập mã 4 ký tự + Ô nhập Nickname.
2. **Task 3.2: Component Huy Hiệu Phòng (`components/investigation/room/room-badge.tsx`)**
   * Hiển thị trạng thái gọn gàng trên Header: `[ 🟢 Phòng: SHER ]`.
   * Menu bấm nhanh: Sao chép link mời / Rời phòng.
3. **Task 3.3: Component Thông Báo Vinh Danh (`components/investigation/room/room-toast.tsx`)**
   * Toast notification góc màn hình hiển thị khi đồng đội bẻ khóa hoặc vượt qua checkpoint:
     `🕵️ Nam vừa bẻ khóa thành công tin nhắn của Khang!`

---

### 📌 Giai Đoạn 4: Tích Hợp Luồng Gameplay & Kiểm Thử Toàn Diện
1. **Task 4.1: Tích Hợp Vào Các Nút Hành Động Gameplay**
   * Đồng bộ khi bẻ khóa điện thoại (`usePhoneData` / `phone_inputs`).
   * Đồng bộ khi giải xong các Checkpoint Giai đoạn 0, 1, 2.
   * Đồng bộ khi kích hoạt Lệnh khám xét lại hiện trường.
   * Đồng bộ khi nộp Bản Cáo Trạng kết án.
2. **Task 4.2: Kịch Bản Kiểm Thử & Nghiệm Thu (Multi-Device Testing)**
   * **Test Case 1 (2 Tab song song):** Tab A tạo phòng, Tab B join qua link. Tab A giải đố ➔ Tab B tự động mở khóa tức thì < 50ms kèm Toast.
   * **Test Case 2 (Chống rớt mạng):** Tắt Tab B, Tab A giải thêm 2 manh mối. Mở lại Tab B ➔ Tab B tự động sync đủ 100% tiến trình mới.
   * **Test Case 3 (Cách ly Solo):** Thoát phòng ➔ Xác nhận tiến trình Solo ban đầu vẫn nguyên vẹn.
   * **Test Case 4 (Typecheck & Build Guard):** Chạy `npm run lint` (`tsc --noEmit`) xác nhận không phát sinh bất kỳ lỗi compile nào.
