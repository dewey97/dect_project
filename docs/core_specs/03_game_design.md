
<!-- START OF MERGED FILE: 03_GAME_DESIGN/03_game_design.md -->

---
# TÀI LIỆU THIẾT KẾ GAME CHÍNH (GAME DESIGN DOCUMENT - GDD) — VERITAS

> **Tầm nhìn Game Design:** VERITAS là một nền tảng điều tra số kết hợp linh hoạt giữa tương tác vật lý (Board Game) và máy trạm kỹ thuật số, nơi người chơi giành chiến thắng bằng cách chứng minh sự thật thông qua chuỗi chứng cứ logic hợp lệ.

---

## 01. Trụ Cột Trải Nghiệm (Core Experience Pillars)

*Chi tiết định hướng 5 Trụ cột Sản phẩm xem tại **[01_product_vision.md](./01_product_vision.md#03-product-pillars)**.*

1. **Evidence Before Conclusion (Bằng chứng trước kết luận):** Mọi báo cáo kết luận đều yêu cầu đính kèm mã chứng cứ chứng minh. Không thưởng điểm cho việc chọn đáp án ngẫu nhiên.
2. **Investigation Feels Real (Cảm giác điều tra chân thực):** Mô phỏng công việc pháp y thực tế (phục hồi dữ liệu bị xóa, đối chiếu tháp sóng di động, soi mâu thuẫn lời khai).
3. **Dual-Layer Engagement (Mô hình tương tác kép):** Phục vụ tối ưu cho cả nhóm chơi Board Game quanh bàn (**Companion Mode**) và game thủ Solo trên Web (**Investigation OS Mode**).
4. **Decoupled Case Engine:** Tách biệt hoàn toàn mã nguồn trò chơi khỏi tập dữ liệu vụ án (Case Data Schema JSON).

---

## 02. Phân Tách 2 Chế Độ Chơi (Game Modes Overview)

```
                                CHẾ ĐỘ CHƠI VERITAS
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
CHẾ ĐỘ TRỢ LÝ (Companion Mode)                                CHẾ ĐỘ MÁY TRẠM (Digital OS Mode)
------------------------------                                ---------------------------------
• Dành cho nhóm 3-4 người chơi Board Game                     • Dành cho 1 người chơi Solo trên Web
• Tương tác chính trên tài liệu giấy ngoài đời                 • Thao tác 100% trên giao diện máy trạm
• Web hỗ trợ:                                                 • Web cung cấp:
  - Nhập mã vật chứng (Unlock)                                  - Giả lập điện thoại Nokia / SMS / Call logs
  - Kiểm tra Checkpoints câu hỏi                                - Tự động phát hiện Alibi Clash trên Timeline
  - Nhận gợi ý phân tầng (Progressive Hints)                    - Phân tích mã SHA-256 & metadata EXIF
```
---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 03_GAME_DESIGN/03_game_design.md -->

---
# ĐẶC TẢ VÒNG LẶP GAMEPLAY (GAME LOOP) — VERITAS

Tài liệu này quy định chi tiết 3 cấp độ vòng lặp trải nghiệm trong VERITAS: Vòng lặp tức thì (Moment-to-moment), Vòng lặp vụ án (Case Loop), và Vòng lặp tiến trình tổng (Meta Game Loop).

---

## 01. Vòng Lặp Tức Thì (Moment-to-Moment Loop)

```
[Đọc/Quan sát Bằng chứng thô] ──► [Phân tích Metadata/Lời khai] ──► [Kéo-thả Soi Timeline] ──► [Báo động Alibi Clash]
```

1. Người chơi xem một vật chứng mới (tin nhắn SMS, file ghi âm, nhật ký GPS).
2. Phát hiện chi tiết mâu thuẫn với lời khai của nghi phạm.
3. Kéo thả vật chứng vào bảng Timeline để xác nhận mâu thuẫn ngoại phạm (**Alibi Clash**).

---

## 02. Vòng Lặp Vụ Án (Case Loop — 2 đến 4 tiếng)

```
[Nhập Mã Vụ Án] ──► [Chặng 1: Thu thập Dữ liệu] ──► [Chặng 2: Phục hồi File/SMS] ──► [Chặng 3: Lập Giả thuyết] ──► [Báo cáo HQ & Đánh giá]
```

---

## 03. Vòng Lặp Meta Game (Meta-Game Loop)

```
[Hoàn thành Vụ án] ──► [Nhận Efficiency Rating (S-D)] ──► [Mở khóa Danh hiệu & Huy hiệu] ──► [Mở khóa Vụ án tiếp theo]
```
---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 03_GAME_DESIGN/03_game_design.md -->

---
# CHẾ ĐỘ CHƠI COMPANION MODE & DIGITAL OS MODE — VERITAS

> **Mục tiêu:** Đáp ứng hoàn hảo cả hai trải nghiệm: chơi nhóm Board Game vật lý quanh bàn và chơi Solo kỹ thuật số trên máy tính.

---

## 01. Level 1: Companion Mode (Chế Độ Trợ Lý Web)
* **Đối tượng:** Nhóm 3-4 người chơi Board Game vật lý.
* **Giao diện:** Tối giản, dạng thẻ di động.
* **Chức năng:**
  * Nhập mã hiện vật (`Code Input Gateway`).
  * Xem các câu hỏi chặng Checkpoints.
  * Nhận gợi ý phân tầng 3 bước từ Trợ lý Minh.
  * Nộp kết luận chặng để mở khóa bì thư hiện vật tiếp theo.

---

## 02. Level 2: Investigation OS Mode (Chế Độ Máy Trạm Kỹ Thuật Số)
* **Đối tượng:** Game thủ Solo trên máy tính / Digital Cases.
* **Giao diện:** 3 phân khu đa cửa sổ máy trạm pháp y chuyên nghiệp.
* **Chức năng:**
  * Trình giả lập điện thoại Nokia (SMS, Gọi điện, Duyệt web, Ảnh).
  * Khung dựng trục thời gian Timeline & Chớp hiệu ứng báo động **Alibi Clash**.
  * Soi mã băm SHA-256, tọa độ GPS và tam giác tháp sóng di động.

---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 03_GAME_DESIGN/03_game_design.md -->

---
# CÂN BẰNG ĐỘ KHÓ — VERITAS

---

## 01. Cấp Độ Khó Tiêu Chuẩn
* **Rookie Investigator:** Hỗ trợ hiển thị gợi ý mâu thuẫn sơ bộ, chế độ đơn giản hóa chi tiết pháp y.
* **Senior Investigator (Tiêu chuẩn):** Bắt buộc đính kèm mã chứng cứ xác thực khi nộp Báo cáo.
* **Chief Forensic Officer (Thử thách):** Giải mã Hex/PIN thủ công, giới hạn số lần nộp báo cáo.

---

> Pricing details moved to **[10_BUSINESS/08_playtest_and_business.md](../10_BUSINESS/08_playtest_and_business.md)**.


---

<!-- END OF MERGED FILE: {src} -->
