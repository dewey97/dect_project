# 🖼️ DANH MỤC QUY HOẠCH TÀI NGUYÊN HÌNH ẢNH (ASSET CATALOG)

> **Phạm vi:** Tài liệu mô tả chi tiết toàn bộ cấu trúc quy hoạch tài nguyên hình ảnh (`/public/brand/`, `/public/images/`), mục đích sử dụng, vị trí hiển thị trên giao diện người chơi và các quy chuẩn kỹ thuật.

---

## 🏛️ 1. Cấu Trúc Tổng Quan Thư Mục Public

Toàn bộ tài nguyên phục vụ client runtime được quy hoạch thành các phân khu rõ ràng:

```
public/
├── brand/                          # Nhận diện thương hiệu, Logo & Icons
├── documents/                      # File PDF xuất bản từ Google Docs (case_000/...)
├── fonts/                          # Font viết tay phục vụ render nhãn sticky note
├── images/
│   ├── backgrounds/                # Hình nền bàn điều tra, wallpaper corkboard
│   ├── cases/                      # Ảnh phục vụ án (hiện trường, polaroid, clue notes)
│   │   └── case_000/
│   ├── hero/                       # Asset khung bàn điều tra interactive ở Hero
│   ├── landing/                    # Ảnh minh họa thẻ án, bìa báo trên Landing Page
│   └── pins/                       # Ghim các màu (pin-blue, pin-red, pin-brass...)
├── models/                         # Mô hình 3D (.glb) phục vụ phòng điều tra 3D
├── textures/                       # Textures giấy kraft
└── audio/                          # Âm thanh hiệu ứng & Voice thoại
```

---

## 🎨 2. Phân Hệ Nhận Diện Thương Hiệu (`/public/brand/`)

| Tên File                      | Mục Đích Sử Dụng                            | Vị Trí Hiển Thị Trong Code / UI       |
| :---------------------------- | :------------------------------------------ | :------------------------------------ |
| `logo.png`                    | Banner Logo thương hiệu chính thức (XPLORE) | Navbar, Header, Component `BrandMark` |
| `logo-x.png`                  | Biểu tượng X kính lúp (Noir Emblem Master)  | Thẻ ngành, tem niêm phong, sidebar    |
| `logo-xplore.png`             | Icon/Logo ứng dụng chính (512x512)          | Favicon source, icon hệ thống         |
| `icon.png`                    | App Icon độ phân giải cao (512x512)         | PWA Manifest, Web App Metadata        |
| `icon-light-32x32.png`        | Favicon chế độ sáng (32x32)                 | Browser Tab Bar (`app/layout.tsx`)    |
| `icon-dark-32x32.png`         | Favicon chế độ tối (32x32)                  | Browser Tab Bar (`app/layout.tsx`)    |
| `apple-icon.png`              | Icon cảm ứng trên iOS / iPadOS (180x180)    | Màn hình chính thiết bị Apple         |
| `favicon.png` / `favicon.ico` | Favicon chuẩn đa kích thước (16, 32, 48)    | Bookmark & trình duyệt                |

---

## 🌐 3. Phân Hệ Landing Page & Trưng Bày Vụ Án (`/public/images/landing/`)

| Tên File                   | Mục Đích Sử Dụng                          | Vị Trí Hiển Thị Trong Code / UI                 |
| :------------------------- | :---------------------------------------- | :---------------------------------------------- |
| `xplore_case_9.png`        | Poster thẻ án "Bóng Ma Cầu Cảng Số 9"     | Danh mục vụ án (`app/cases`), Showcase Landing  |
| `xplore_case_north.png`    | Poster thẻ án "Mật Mã Cảng Bắc"           | Danh mục vụ án (`app/cases`), Showcase Landing  |
| `suspect_marsh.png`        | Ảnh thẻ nghi phạm Marsh (Vụ xí nghiệp ĐS) | Danh mục vụ án (`app/cases`), Showcase Landing  |
| `newspaper_clipping.webp`  | Mẩu báo cũ điều tra xé dán cổ điển        | Section thế giới ngầm (`WorldArchiveSection`)   |
| `victim_thomas.png`        | Ảnh thẻ nạn nhân Thomas                   | Poster demo vụ án                               |
| `means_evidence.png`       | Minh họa yếu tố "Công Cụ Gây Án"          | Showcase luật chơi (`GameRulesShowcase`)        |
| `motive_evidence.png`      | Minh họa yếu tố "Động Cơ"                 | Showcase luật chơi (`GameRulesShowcase`)        |
| `opportunity_evidence.png` | Minh họa yếu tố "Thời Cơ & Ngoại Phạm"    | Showcase luật chơi (`GameRulesShowcase`)        |
| `xplore_game_box.png`      | Ảnh hộp game vật lý bản đặc biệt          | Thuyết minh sản phẩm (`LandingFeaturesSection`) |

---

## 🕹️ 4. Phân Hệ Bàn Điều Tra Interactive & Hero (`/public/images/hero/`)

| Tên File                   | Mục Đích Sử Dụng                          | Vị Trí Hiển Thị Trong Code / UI         |
| :------------------------- | :---------------------------------------- | :-------------------------------------- |
| `evidence-board-frame.png` | Khung viền gỗ/kính bàn điều tra tương tác | Canvas bàn điều tra (`HeroInteractive`) |
| `evidence-board-bg.png`    | Hình nền bảng án Vận Đơn Bất Thường       | Bảng điều tra Case #01                  |
| `evidence-board-bg2.jpg`   | Hình nền bảng án Phòng Thí Nghiệm         | Bảng điều tra Case #02                  |
| `evidence-board-bg3.jpg`   | Hình nền bảng án Dấu Vết Số               | Bảng điều tra Case #03                  |

---

## 🪵 5. Phân Hệ Hình Nền & Không Gian Điều Tra (`/public/images/backgrounds/`)

| Tên File                                | Mục Đích Sử Dụng                                   | Vị Trí Hiển Thị Trong Code / UI                                |
| :-------------------------------------- | :------------------------------------------------- | :------------------------------------------------------------- |
| `corkboard_vertical_empty.jpg`          | Mặt bảng gỗ bần dọc trống để cắm ghim              | Bảng ghim án Boardgame (`/evidence/boardgame`)                 |
| `crime_scene_outline_bg.jpg`            | Hình nền hiện trường kẻ vệt phấn                   | Background màn hình phân tích hiện trường                      |
| `mobile_evidence_board_bg.jpg`          | Hình nền tối ưu cho giao diện di động              | Bảng điều tra Mobile View                                      |
| `ios7_wallpaper.jpg`                    | Hình nền màn hình khóa điện thoại tang vật         | Trình giả lập iPhone (`components/investigation/iphone`)       |
| `detective_desk_ambient_vertical.jpg`   | Bàn điều tra góc dọc với ánh sáng đèn chụp ambient | Thử nghiệm bảng án khổ dọc (`app/(investigation)/board-stage`) |
| `pure_cork_texture_vertical.jpg`        | Texture gỗ bần nguyên chất liền mạch khổ dọc       | Thử nghiệm bảng án khổ dọc (`app/(investigation)/board-stage`) |
| `vintage_framed_corkboard_vertical.jpg` | Khung bảng gỗ bần viền gỗ vintage cổ điển khổ dọc  | Thử nghiệm bảng án khổ dọc (`app/(investigation)/board-stage`) |

---

## 📜 5.1. Phân Hệ Texture Giấy Kraft (`/public/textures/`)

| Tên File                         | Mục Đích Sử Dụng                           | Vị Trí Hiển Thị Trong Code / UI                   |
| :------------------------------- | :----------------------------------------- | :------------------------------------------------ |
| `kraft_paper_texture_large.webp` | Texture giấy kraft 4K lặp phủ bìa hồ sơ án | Modal kích hoạt chuyên án (`case-activation.tsx`) |
| `kraft_paper_texture.webp`       | Texture giấy kraft kích thước thường       | Dự phòng phủ nền giấy bìa nâu                     |

---

## 📌 6. Phân Hệ Ghim Án Màu (`/public/images/pins/`)

Hệ thống ghim cắm bảng phân loại theo màu sắc nghiệp vụ (mỗi màu có 1 bản thẳng và 1 bản lật góc `flipped`):

- `pin-red.png` / `pin-red-flipped.png`: Ghim đỏ — Điểm chí mạng, thủ phạm, kết luận điều tra.
- `pin-blue.png` / `pin-blue-flipped.png`: Ghim xanh dương — Manh mối pháp y, trích xuất dữ liệu.
- `pin-yellow.png` / `pin-yellow-flipped.png`: Ghim vàng — Lời khai nhân chứng, ghi chú nghi vấn.
- `pin-green.png` / `pin-green-flipped.png`: Ghim xanh lá — Bằng chứng ngoại phạm đã xác thực.
- `pin-brass.png` / `pin-brass-flipped.png`: Ghim đồng cổ điển — Vật chứng vật lý tại hiện trường.
- `pin-cyan.png`, `pin-dark.png`, `pin-orange.png`, `pin-purple.png`, `pin-silver.png`: Phân loại mở rộng.

---

## 🕵️ 7. Phân Hệ Vụ Án #000: TRỐN TÌM (`/public/images/cases/case_000/`)

### 7.1. Ảnh Thẻ Nhân Vật, Avatar Placeholder & Dynamic Canvas Composite

- **`/public/images/avatar_placeholder.svg`**: Hình bóng avatar điều tra trung tính chuẩn, hiển thị mặc định cho mọi nghi phạm và nhân chứng khi chưa có ảnh chân dung từ Live CMS Google Sheets.
- **Loại bỏ ảnh tĩnh `pinned_photos_with_tape/`**: Toàn bộ các ảnh PNG ghép sẵn băng dính giấy tĩnh trước đây (`pinned_tape_khang.png`, `pinned_tape_vu.png`...) đã được gỡ bỏ khỏi `public/` để tối ưu dung lượng và chuyển sang kiến trúc **Dynamic Card Composite**.
- **Cơ chế Dựng Thẻ Động (`card-composite.ts`)**: Trình duyệt nạp ảnh chân dung gốc từ Google Drive Live CMS, tự động ghép khung Polaroid và vẽ băng dính giấy răng cưa trên Canvas bộ nhớ (Offscreen Canvas 60 FPS), đảm bảo nội dung luôn đồng bộ với dữ liệu bảng tính mà không cần re-build code.

### 7.2. Giấy Ghi Chú Nghiệp Vụ (`clue_notes/rendered_notes/`)

Giấy note vàng/trắng viết tay đã kết xuất sẵn nét mực để cắm lên bảng:

- `note_bo_sung_chung_cu.png`: Hướng dẫn bổ sung tài liệu.
- `note_nghi_van.png`: Danh sách các điểm nghi vấn mở màn.
- `note_nghi_pham.png`: Danh mục nghi phạm cần thẩm tra.
- `note_cau_hoi_vu.png` / `note_cau_hoi_tung.png` / `note_cau_hoi_ha.png`: Phiếu thẩm vấn từng đối tượng.
- `note_mo_rong_dieu_tra.png`: Manh mối nhật ký cuộc gọi & sổ nợ.
- `note_kham_xet_lai.png`: Lệnh khám xét lại hiện trường.
- `note_ket_luan_dieu_tra.png`: Bản kết luận điều tra và cáo trạng.

### 7.3. Ảnh Hiện Trường & Manh Mối Chi Tiết

- `crime_scene.png`: Toàn cảnh 2D hiện trường căn phòng khách nhà Khang số 14 Đường Bờ Sông (dùng cho `HeroInteractive` và chế độ 2D khám nghiệm).
- `PANORAMA.png`: Ảnh toàn cảnh hình cầu equirectangular phục vụ `Scene360Viewer` (chế độ khám xét lại hiện trường 360 WebGL trong `ReinvestigationModal`).
- `PANORAMA.webp`: Bản nén `3072×1715` (0.46MB) của panorama dùng riêng cho hiệu ứng nhìn qua ổ khoá ở landing page (`LandingScene360Showcase`).
- `keyhole_plate_albedo.webp`: Mặt khoá đồng thau `910×1725` (120KB) trích từ ảnh chính diện gốc (`docs/cases/case_000/02_photos/reference/keyhole_front_ref.png`, vùng `left:36, top:4, 364×690`), phóng 2.5× Lanczos, sharpen nhẹ và nén WebP q90. Ảnh có **alpha cut-out theo đúng silhouette đồng thau** (flood-fill nền xám studio + feather 1.6px) để mép mô hình không lộ nền xám. Dùng làm texture bề mặt cho `LandingKeyholeModel` (mô hình 3D ổ khoá ở landing).
- `reinvestigation_crime_scene_prop.png`: Vật thể vật lý khám xét hiện trường (ảnh chụp toàn cảnh phòng khách, dải băng niêm phong cảnh sát vàng đen, thước đo pháp y Forensic Scale và dấu mộc tái khám nghiệm) đặt trên mặt bàn điều tra thay thế tờ note giấy.
- `photo_cheating_sms.jpg`: Ảnh chụp màn hình tin nhắn Khang hẹn hò Thảo Vy.
- `cuong_ve_xe_tung.png`: Cuống vé xe buýt của Tùng lúc 20:15.
- `wardrobe_eyes.jpg`: Tủ gỗ lim 1996 then cài sắt.
- `choi.jpg`: Ảnh chụp buổi chơi nhóm phá án thực tế.
- `9.webp`, `11.webp`, `14.webp`, `15.webp`, `16.webp`, `17.webp`, `18.webp`: Các ảnh cận cảnh điểm khám xét lại và các góc nhìn phục vụ tạo panorama. Đã tối ưu WebP chất lượng 80.

### 7.4. Ảnh Thiết Bị Tang Vật & Bản Đồ Master

- `poster_c0.webp`: Poster chính thức vụ án #000 Trốn Tìm (thay thế bản PNG 3.48MB bằng WebP 186KB).
- `phone.png` / `victim_phone_node.png`: Ảnh kết xuất thiết bị iPhone tang vật kèm ghim đỏ cắm trên bảng điều tra Canvas (`HeroInteractive` & `MainInvestigationCanvas`). Cho phép click mở trực tiếp `PhoneModal` / trình giả lập iPhone.
- `phone/*.webp`: Các ảnh nền, lockscreen và homescreen iPhone của nạn nhân đã được chuyển sang định dạng WebP gọn nhẹ.
- `hanoi_master_map.png`: Bản đồ đồ họa toàn thành phố và phân khu cảng Hà Nội kết xuất độ phân giải cao (`2474 x 1732px`) từ Figma Frame `96:9215`. Dùng làm Single Source of Truth cho ứng dụng Maps trong điện thoại, radar theo dõi di chuyển và hệ tọa độ vụ án. Cập nhật tự động qua lệnh `npm run sync:map`.

---

## 🗄️ 8. Lưu Trữ Tài Liệu Thiết Kế Nháp (`docs/cases/case_000/02_photos/test_notes_archive/`)

Toàn bộ các file kết xuất thử nghiệm font chữ (`test_Caveat-Bold.png`, `test_Pangolin.png`...) và các bản nháp trung gian đã được **di dời khỏi `public/`** và lưu trữ an toàn tại thư mục tài liệu thiết kế này để tránh gây nặng bộ cài đặt web.
