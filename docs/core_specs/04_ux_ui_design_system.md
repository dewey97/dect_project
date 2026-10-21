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

---

## 🗄️ 5. Không Gian Phòng Vật Chứng & Dynamic Pin Cards

### 1. Không Gian Phòng Vật Chứng 3 Vùng (Evidence Workspace — 3-Region Layout):
Áp dụng tại `app/(investigation)/evidence/web/page.tsx` nhằm tối ưu hóa khả năng đối chiếu hồ sơ song song:
- **Vùng 1 (Dossier Selector - ~180px Desktop)**: Thanh điều hướng chọn danh mục hồ sơ theo từng chặng vụ án (`Tất cả`, `Ban Đầu`, `Bộ A`, `Bộ B`, `Bộ C`) kèm chỉ báo số lượng tài liệu đã mở khóa. Hỗ trợ nút thu gọn trên màn hình hẹp.
- **Vùng 2 (Evidence & Document Grid - ~260px Desktop)**: Danh sách cuộn độc lập hiển thị thẻ vật chứng:
  - *Vật chứng ảnh*: Hiển thị thumbnail ảnh chụp hiện trường thực tế, overlay mã vật chứng (`📸 A-06`...).
  - *Hồ sơ văn bản*: Hiển thị badge icon `PDF` màu amber viền nâu cổ điển, mã hồ sơ và trích yếu tiêu đề.
  - *Dải chỉ báo Active*: Strip dọc màu hổ phách (`#d9a066`) đánh dấu tài liệu đang xem.
- **Vùng 3 (Inspector Viewer - Flex-1 mở rộng)**: Khung soi chi tiết tài liệu toàn màn hình:
  - *Vật chứng hiện trường*: Hiển thị ảnh chụp độ nét cao ở tỉ lệ tối đa (Full Viewport Object-Contain), nền tối sâu có họa tiết grid tế vi, khử hoàn toàn viền rườm rà.
  - *Hồ sơ pháp y PDF*: Nhúng trực tiếp iframe Google Drive hoặc PDF local đã chuẩn hóa URL (triệt tiêu thanh công cụ trình duyệt bằng `#toolbar=0&navpanes=0`).
  - *Nút Mở Rộng / Chuẩn*: Cho phép phóng to vùng soi tài liệu chiếm trọn toàn bộ khung nhìn bên phải để đọc văn bản cỡ chữ nhỏ.

### 2. Thẻ Ghim Điều Tra Động (Dynamic Pin Cards & Canvas Composite):
Áp dụng tại `HeroInteractive` và `MainInvestigationCanvas`:
- **Vẽ thẻ ảnh động trên Canvas**: Khung ảnh Polaroid kèm băng dính dán tường răng cưa được dựng trực tiếp bằng `card-composite.ts` và lưu vào `OffscreenCanvas` trong bộ nhớ RAM, đạt tốc độ kết xuất 60 FPS mà không cần phụ thuộc vào ảnh tĩnh pre-render.
- **Avatar Placeholder Chuẩn (`/images/avatar_placeholder.svg`)**: Đảm bảo nhân vật mới hoặc nghi phạm mở rộng từ Live CMS luôn có hình đại diện đồng nhất trước khi gắn ảnh hồ sơ chính thức.

---

## 📑 6. Các Thành Phần Giao Diện Nâng Cao (Advanced UI Components)

### 1. Hiệu Ứng Tập Tài Liệu Xếp Chồng Gối Đầu (Overlapping Dossier Paper Stack):
Áp dụng tại danh sách hồ sơ PDF trong `app/(investigation)/evidence/web/page.tsx`:
- **Gối đầu tự nhiên (`-mt-2`)**: Các tài liệu không được chọn xếp chồng gối đầu lên nhau như một tệp hồ sơ lưu trữ thật trong ngăn kéo điều tra viên.
- **Thanh Header kẹp ghim (`Paperclip`)**: Luôn hiển thị mã số hồ sơ (`DOC A-01`...), tên tài liệu vắn tắt và giai đoạn vụ án (`BAN ĐẦU` / `BỘ A` / `BỘ B`).
- **Mở rộng linh hoạt (Expanded State)**: Khi người chơi click chọn một tài liệu, tấm thẻ bung rộng với viền amber nổi bật (`#d9a066`), đổ bóng đa tầng (`shadow-[0_8px_24px_rgba(0,0,0,0.7)]`), hiện trích yếu và nút gọi hành động mở đọc toàn văn hồ sơ.

### 2. Sổ Tay Trinh Thám Lật Trang 3 Tầng (Detective Flip Notebook Modal):
Áp dụng tại `components/investigation/mindmap/gameplay-guide-modal.tsx`:
- **Cấu trúc lật sách (Book Page Flipping)**: Mô phỏng cuốn sổ tay bìa da/giấy bồi ghi chép nghiệp vụ của điều tra viên kỳ cựu với 3 trang nội dung chuyên sâu:
  - **Trang 1 / 3 (Quy Trình Nghiệp Vụ)**: 4 bước điều tra cốt lõi (Rà soát hiện trường ➔ Bóc tách lời khai ➔ Đối chiếu mâu thuẫn ➔ Kết luận điều tra).
  - **Trang 2 / 3 (Sơ Đồ Manh Mối)**: Giải thích hệ thống đường nối chỉ đỏ, logic liên kết vật chứng và cách suy luận từ các mẩu tin nhắn điện thoại.
  - **Trang 3 / 3 (Thao Tác Thực Chiến & Tour Hướng Dẫn)**: Hướng dẫn kéo thả canvas, zoom bản đồ, và nút kích hoạt Tour thực chiến tập sự (`Walkthrough Tour`) dẫn dắt trực tiếp trên bàn điều tra.
- **Chỉ báo trang sách**: Dãy chấm tròn (dots indicator) và nút lật trang trước/sau có âm thanh bấm tactile typewriter.

### 3. Thanh Cuộn Tài Liệu Trinh Thám & Giấy Cũ (Detective & Paper Scrollbars):
Áp dụng trong `app/globals.css`:
- **Dark Mode Workspace Scrollbar**: Thanh cuộn siêu mảnh ($6\text{ px}$), không nút bấm, nền trong suốt hoàn toàn, thanh trượt màu hổ phách mờ (`rgba(180, 130, 80, 0.35)`) và sáng lên khi hover.
- **Paper Scrollbar (`.paper-scrollbar`, `[data-paper-modal]`)**: Dành riêng cho các modal tài liệu giấy cũ (`AddSuspectModal`, `FollowupQuestionModal`), sử dụng tông màu nâu gỗ đất cổ điển (`rgba(92, 64, 38, 0.3)`), hài hòa 100% với nền giấy kraft vàng.

### 4. Hiệu Ứng Nhìn Qua Ổ Khoá — Landing 360 (`LandingScene360Showcase`):
Áp dụng tại `components/public/landing-scene-360-showcase.tsx`:
- **Một SVG duy nhất**: mặt khoá đồng thau và lỗ aperture nằm trong cùng một hệ toạ độ + cùng một `<mask>`, nên mép cắt luôn khớp tuyệt đối ở mọi mức zoom.
- **Scale tính theo viewport**: `scaleEnd = (w / 34) × 1.08` để hết scroll thì lỗ keyhole phủ kín màn hình; zoom dùng nội suy mũ (tốc độ zoom cảm nhận không đổi).
- **Hardware fade**: mặt khoá + bevel mờ dần khi `eased > 0.6` để vòng bevel không trôi lơ lửng trên cảnh sau khi đã xuyên qua.
- **Sticky & overflow**: `html, body` phải dùng `overflow-x: clip`, **tuyệt đối không dùng `hidden`** — `hidden` biến body thành scroll container không cuộn và vô hiệu hoá toàn bộ `position: sticky` trong app.
- **Asset**: dùng `PANORAMA.webp` (0.46MB) cho landing; `PANORAMA.png` giữ cho `Scene360Viewer`.

### 5. Trung Tâm Tải Tài Nguyên & Banner Mạng Xã Hội (Brand Asset Download Center):Áp dụng tại trang `app/brand/page.tsx`:
- **OpenGraph Social Banner (Featured)**: Hiển thị khung xem trước độ nét cao tỉ lệ vàng $1.91 : 1$ ($1200 \times 630\text{ px}$) kèm nút tải trực tiếp file `xplore_og_image.jpg`.
- **Bộ nhận diện chuẩn hóa 3 khối**: Khung tải Logo chính ($1920 \times 1080$), Biểu tượng X ($512 \times 512$), và Gói Favicon trình duyệt đa kích thước ($16\times16$, $32\times32$, $48\times48$).

