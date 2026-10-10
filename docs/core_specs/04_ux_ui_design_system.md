# HỆ THỐNG THIẾT KẾ GIAO DIỆN (UX/UI DESIGN SYSTEM)

> **Aesthetic Cốt lõi:** Neo-noir · Crime Investigation · Secret Intelligence · Detective Workstation · Premium Board Game Companion.

---

## 🏛️ 1. Triết Lý Trải Nghiệm Cốt Lõi (UX Principles)

1. **One screen, one job:** Mỗi màn hình / tuyến route giải quyết chính xác 1 câu hỏi điều tra.
2. **Thumb-first (Mobile Priority):** Các thao tác chính nằm trong 2/3 dưới màn hình điện thoại (~390–430px). Desktop căn giữa dạng cột `max-w-[30rem]` hoặc bảng điều tra mở rộng.
3. **Trạng thái minh bạch:** Khóa / Mở khóa / Đã thu thập / Cảnh báo mâu thuẫn hiển thị rõ ràng, không mập mờ.
4. **Không ngõ cụt (No dead ends):** Mọi trạng thái trống hoặc bị khóa đều chỉ dẫn bước tiếp theo để tiến bộ.
5. **Văn phong Diegetic (Trong thế giới game):** Sử dụng thuật ngữ nghiệp vụ: _hồ sơ vụ án, thiết bị thu giữ, vật chứng phục hồi, cấp độ bảo mật, thẻ ngành_ (không dùng _trang, điểm số, item_).
6. **Tiến trình bất biến:** Không giả lập thao tác phá hủy; các nút phụ thuộc backend có trạng thái disabled kèm lý do rõ ràng.
7. **Cấm Auto-Focus trên Modal (No Auto Virtual Keyboard):** Tuyệt đối không gắn `autoFocus` hoặc `.focus()` tự động khi modal vừa mở. Bàn phím ảo trên điện thoại chỉ được kích hoạt khi người dùng chủ động chạm tay vào ô nhập liệu, bảo toàn 100% tầm nhìn và bố cục tài liệu.

---

## 🎨 2. Bảng Màu Chuẩn (Color Tokens)

Hệ thống màu tối đa tầng, sử dụng biến ngữ nghĩa Tailwind / CSS Variables:

| Token                            | Tên màu                | Mục đích sử dụng                                  |
| :------------------------------- | :--------------------- | :------------------------------------------------ |
| `--background`                   | Obsidian Deep Charcoal | Nền phòng điều tra trinh thám, không gian tối sâu |
| `--card` / `--secondary`         | Flat Matte Panels      | Mặt thẻ hồ sơ, mặt kính thiết bị thu giữ          |
| `--foreground`                   | Bone White / Soft Zinc | Văn bản tài liệu chính, lời khai rõ nét           |
| `--muted` / `--muted-foreground` | Steel Gray             | Mốc thời gian, mã định danh, metadata phụ         |
| `--primary`                      | Evidence Amber         | Điểm nhấn hành động, manh mối đang kích hoạt      |
| `--destructive`                  | Classified Crimson     | Cảnh báo khẩn cấp, Alibi Clash, dấu vết xung đột  |

> **Quy tắc cấm:** Tuyệt đối không dùng gradient màu tím AI rác, màu neon quá chói, hoặc các hình khối vector trang trí vô hồn.

---

## 🔤 3. Typography & Nhãn Hệ Thống

Sử dụng 2 họ font chính:

- **Geist Sans (`font-sans`):** Nội dung tài liệu, tiêu đề hồ sơ, mô tả vụ án, nút bấm.
- **Geist Mono (`font-mono`):** Dành riêng cho dữ liệu máy tính: Mã SHA-256, mốc thời gian ISO, tọa độ GPS, mã vật chứng, thẻ trạng thái.

### Nhãn chuẩn (System Labels):

- `.label-system`: Mono uppercase, chữ nhỏ `0.65rem`, `tracking-[0.2em]`, màu `muted-foreground`.
- `.label-tag`: Pill trạng thái (LOCKED, OPEN, CLUE, FLAG).
- `.label-brand`: Wordmark thương hiệu.

---

## 📱 4. Cấu Trúc Khung Thiết Bị & Điện Thoại Thu Giữ

### Các Ứng Dụng Điện Thoại Mô Phỏng (`components/investigation/iphone/apps/`):

- **`PhoneApp` (`phone-app.tsx`):** Nhật ký cuộc gọi (`Recents` - Frame `22:582`) với đánh dấu cuộc gọi nhỡ màu đỏ (`#BA1A1A`) & Bàn phím số bấm gọi (`Keypad` - Frame `22:453`) nút tròn 75px, âm phím DTMF & nút gọi xanh (`#34C759`).
- **`MessagesApp` (`messages-app.tsx`):** Danh sách hội thoại SMS (Frame `22:755`), parse tin nhắn đa dòng kèm tag `[CLUE: Tiêu đề | Phân tích]`, avatar tròn kèm badge chưa đọc.
- **`NotesApp` (`notes-app.tsx`):** Ghi chú cá nhân nạn nhân & nghi phạm, phân loại folder iCloud/Local.
- **`SafariApp` (`safari-app.tsx`):** Lịch sử tìm kiếm & trang web đã truy cập (kết nối tab `notes_and_browser`).
- **`PhotosApp` (`photos-app.tsx`):** Thư viện ảnh chụp hiện trường, ảnh chụp lén kèm metadata EXIF.
- **`BankingApp` (`banking-app.tsx`):** Biến động số dư tài khoản ngân hàng, hóa đơn chuyển tiền bất thường.
- **`MapsApp` (`maps-app.tsx`):** Bản đồ tọa độ di chuyển GPS của nạn nhân trước giờ tử vong.
