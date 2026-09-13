# 🕵️ THIẾT KẾ GAMEPLAY & LUỒNG ĐIỀU TRA VỤ ÁN #000

## 🧭 I. SƠ ĐỒ LUỒNG ĐIỀU TRA & MỞ KHÓA GIAI ĐOẠN

```text
 🎯 GIAI ĐOẠN 0: KHỞI ĐẦU — TRUY TÌM DANH TÍNH 3 SỐ ĐIỆN THOẠI ẨN DANH
  │ (Phân tích Nhật ký cuộc gọi dev-00 + Sổ nợ 05 + Bảng tin rao vặt 18)
  ▼
 🧩 CÂU HỎI 1 (Truy tìm danh tính): Lê Quang Vũ, Đạt Gà Chợ Cảng, Nguyễn Thanh Tùng
  ▼
 🔓 MỞ KHÓA TOÀN BỘ HỒ SƠ LÝ LỊCH & LỜI KHAI BAN ĐẦU (Tùng, Đạt Gà, Vũ, Mai, Hà)
  │ (Xác minh ngoại phạm Đạt Gà Chợ Cảng 18:00 - 22:00 -> Nhiễu)
  │
  ├─────────────────────────────────────────┐
  ▼                                         ▼
 🟢 LỰA CHỌN 1: TUYẾN A (LÊ QUANG VŨ)      🟡 LỰA CHỌN 2: TUYẾN B (NGUYỄN THANH TÙNG)
 ├───────────────────────────────────┤      ├──────────────────────────────────────────┤
 │ 🧩 CÂU HỎI 2A (Thẩm tra Vũ):      │      │ 🧩 CÂU HỎI 2B (Thẩm tra Tùng):           │
 │  • Tên: Lê Quang Vũ               │      │  • Tên: Nguyễn Thanh Tùng                │
 │  • Động cơ + Ngoại phạm không rõ  │      │  • Lời khai (14) + Vân tay khung ảnh p4  │
 │  • Tài liệu: 05, dev-00, p6, 11, p10     │  • Báo xé p5 + Ảnh kỷ niệm 1996 p4        │
 ├───────────────────────────────────┤      ├──────────────────────────────────────────┤
 │ 🔓 Mở khóa Lời khai 2 (07) &      │      │ 🔓 Mở khóa Thẻ tự thú (01)               │
 │    Sổ Quán Bia 88 (06)            │      │    (Xô ngã 20:00, bỏ đi 20:15)           │
 │ ➔ Minh oan Vũ (isTuyenADone)      │      │ ➔ Bế tắc 1 chiều (isTuyenBDone)          │
 └─────────────────┬─────────────────┘      └────────────────────┬─────────────────────┘
                   │                                             │
                    └──────────────────────┬──────────────────────┘
                                          │ (Hoàn thành CẢ 2 Tuyến A & B)
                                          ▼
                         🔑 NÚT HỘI TỤ: CÂU HỎI LOẠI TRỪ 3 NGHI PHẠM
                          │ (Nhập tên & lý do loại trừ Mai, Vũ, Tùng)
                          ▼
                         🔓 KÍCH HOẠT LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG
                          │ (Âm thanh còi tàu 20:30 & Phấn hoa xoan)
                          ▼
                         🔴 GIAI ĐOẠN 2: TUYẾN C (THỦ PHẠM TRẦN THỊ HÀ)
                          │ (Bóc trần ngoại phạm VTV3 + Lọn tóc ADN)
                          ▼
                         ⚖️ BẢN CÁO TRẠNG ĐỊNH TỘI & KẾT ÁN
```

---

## 🔒 ĐIỀU KIỆN KÍCH HOẠT LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG

- **Vị trí:** Nút hội tụ chuyển từ Phase 1 ➔ Phase 2.
- **Kích hoạt:** $\text{PermitActivation} = \text{isTuyenACompleted} \land \text{isTuyenBCompleted}$
  - `isTuyenACompleted`: Minh oan Vũ (Quán Bia 88 lúc 21:15).
  - `isTuyenBCompleted`: Bóc trần Tùng (Vân tay khung ảnh vỡ p4 + Tự thú xô xát).
- **Thông báo hệ thống:**
  - 🛑 *Chưa đủ:* Yêu cầu hoàn thành điều tra Mai, Vũ, Tùng trước.
  - 🔔 *Đủ điều kiện:* Gợi ý quét QR Thẻ cứng "LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG".

---

## 🎮 II. TIẾN TRÌNH ĐIỀU TRA CHI TIẾT

### 📋 GIAI ĐOẠN 0 — KHỞI ĐẦU: TRUY TÌM DANH TÍNH 3 SĐT ẨN DANH

#### 🔍 1. Phân tích thông tin nền & Nhật ký cuộc gọi
- **Bối cảnh:** Người tiếp cận hồ sơ ban đầu thu thập được `Nhật ký cuộc gọi` trên điện thoại của Khang (`dev-00`) gồm 6 cuộc gọi:
  - 📞 **3 SĐT đã lưu tên:** `Chị Lan Quán Nước` (17:30) & `Bình Còi` (18:00) (Nhiễu); `Hà Kế Toán` (20:31 - Cuộc gọi nhỡ ➔ Mở đầu Tuyến C).
  - ❓ **3 SĐT ẩn danh cần tra cứu:** `0988.20.09.91` (18:15), `0912.331.888` (18:45), và `0984.180.357` (19:55).

#### 📄 Danh mục tài liệu tiếp cận ban đầu:

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Nhật ký cuộc gọi** (`dev-00`) | Trích xuất 6 cuộc gọi (3 số lưu tên, 3 số lạ chưa lưu tên) | Manh mối tra cứu danh tính các nghi phạm | Điện thoại giả lập của Khang (`dev-00`) |
| **Sổ ghi nợ** (`05`) | Khớp SĐT con nợ `0988.20.09.91` (300M) và `0912.331.888` | Tra cứu danh tính Vũ & Đạt Gà | Thu thập tại hiện trường |
| **Bảng tin rao vặt** (`18`) | Tin rao VLXD chứa SĐT `0984.180.357` | Tra cứu danh tính Nguyễn Thanh Tùng | Thu thập tại Bảng tin trước cổng |
| **Lời khai bà Lụa** (`11`) | Nhắc đến 2 con trai nhà bà xóm bên | Manh mối nền về mối quan hệ Tùng & Huy | Hồ sơ điều tra ban đầu |

#### 💡 Suy luận đối chiếu danh tính:
- ➔ `0988.20.09.91` (18:15) đối chiếu Sổ nợ (`05`) ➔ **Lê Quang Vũ** (Chồng Mai).
- ➔ `0912.331.888` (18:45) đối chiếu Sổ nợ (`05`) ➔ **Đạt Gà Chợ Cảng**.
- ➔ `0984.180.357` (19:55) đối chiếu Bảng tin (`18`) ➔ **Nguyễn Thanh Tùng** (Thợ nề).

---

* 🧩 **CÂU HỎI 1 (Khởi Đầu — Truy tìm danh tính 3 SĐT ẩn danh):**
  - **Mục tiêu:** Nhập đúng danh tính 3 người chủ sở hữu các SĐT ẩn danh.
  - **Hình thức trả lời:** Nhập tên 3 đối tượng: `Lê Quang Vũ`, `Đạt Gà Chợ Cảng` (hoặc `Đạt Gà`), `Nguyễn Thanh Tùng` (hoặc `Tùng`).

---

* 🔓 **MỞ KHÓA TOÀN BỘ HỒ SƠ LÝ LỊCH & LỜI KHAI BAN ĐẦU:**
  - Sau khi giải đúng **CÂU HỎI 1**, hệ thống cung cấp toàn bộ Tập hồ sơ lý lịch & Lời khai ban đầu của các đối tượng liên quan:
    - **Hồ sơ & Lời khai Đạt Gà Chợ Cảng (`14a_ly_lich`, `14a`):** Xác minh ngoại phạm khách quan (Đạt Gà bán hàng ở Chợ Cảng từ 18:00 – 22:00 có 3 tiểu thương làm chứng ➔ Loại trừ Đạt Gà khỏi diện nghi vấn - Nhiễu).
    - **Hồ sơ & Lời khai Mai (`08a`, `12`), Vũ (`08b`, `13`), Tùng (`14_ly_lich`, `14`), Hà (`08c`, `15`).**

---

### 🔀 PHASE 1 — 2 LỰA CHỌN TUYẾN ĐIỀU TRA SONG SONG

Sau khi hoàn thành Giai đoạn 0, người chơi có thể tự do chọn 1 trong 2 tuyến điều tra song song bên dưới:

---

### 🟢 LỰA CHỌN 1: TUYẾN A — MAI & VŨ (`01_nhanh_mai_vu/`)

#### 👩 Nhánh 1A — Nguyễn Ngọc Mai (Tranh chấp Đất đai)
* **Xác minh ngoại phạm:**
  - **Suy luận đối chiếu:**
    - ➔ Lời khai Mai (`12`): Khai cãi nhau xong nổ máy về nhà ở Phố Đoàn Kết, xem TV đến 20:10 thì mất sóng cáp.
    - ➔ Lời khai bà Lụa (`11`): Thấy Mai dắt xe nổ máy phóng đi đúng lúc Thời sự VTV1 cất lên (19:00).
    - ➔ Bảng tin rao vặt (`18`): Thông báo sự cố đứt cáp quang lúc 20:10 ở Phố Đoàn Kết khớp 100% lời khai Mai.
    - ➔ **Kết luận:** Mai có ngoại phạm khách quan ➔ Minh oan cho Mai.

#### 👷 Nhánh 1B — Lê Quang Vũ (Khoản nợ Bí mật)
* **Bắt thóp mâu thuẫn & Bóc trần động cơ nợ nần:**
  - **Suy luận đối chiếu:**
    - ➔ Lời khai bà Lụa (`11`) (Mai đi 19:00) vs Screenshot App đặt xe (`p10`) (Vũ đặt xe 19:30): Bắt thóp Vũ nói dối rời đi ngay, chứng minh Vũ nán lại hiện trường khoảng 30 phút.
    - ➔ Đối chiếu Ảnh chân dung Vũ (`p6`) (kỹ sư điện + mắt lác) với Sổ nợ (`05`) & SMS đòi nợ (`dev-00`): Bóc trần con nợ 300M biệt danh *"Lệch Pha"* chính là Lê Quang Vũ.

---

* 🧩 **CÂU HỎI 2A (Thẩm tra Lê Quang Vũ):**
  - **Hình thức trả lời (2 bước & câu dẫn định hướng):**
    - **Bước 1 (Nhập tên nghi vấn):** `Lê Quang Vũ` (hoặc `Vũ`).
    - **Câu dẫn định hướng:** *"Dựa trên 2 tiêu chí điều tra là Động cơ và Bằng chứng ngoại phạm không rõ ràng"*
    - **Bước 2 (Chọn tài liệu chứng minh):** `Sổ tay ghi nợ của Khang` (`05`) + `SMS đòi nợ của Khang` (`dev-00`) + `Ảnh chân dung Lê Quang Vũ` (`p6`) + `Lời khai bà Lụa` (`11`) + `Ảnh Screenshot App đặt xe` (`p10`).

---

* 🔓 **GIAI ĐOẠN 1 — Mở khóa Lời khai 2 & Xác minh Quán bia:**
  - **Suy luận đối chiếu & Minh oan:**
    - ➔ Lời khai lần 2 (`07`): Vũ thừa nhận nán lại khoảng 30 phút xin hoãn nợ 300M, khai gọi 1 đĩa nem + 5 lon bia, và thấy bóng người trùm áo gió đứng rình dưới gốc cây xoan trước khi đón xe đi Quán Bia 88.
    - ➔ Khớp nối Lời khai (`07`) với Sổ thu chi Quán Bia 88 (`06`): Bàn `B7 (1 khách): 195k (Tiền mặt 21:15)` (suy ra từ 1 nem chua 95k + 5 lon bia 100k) chính là bàn của Vũ.
    - ➔ Xác nhận Vũ ở Quán Bia 88 từ 19:49 đến 21:15 cách hiện trường 3.8km ➔ **Minh oan cho Vũ (`isTuyenACompleted = true`)**.

---

### 🟡 LỰA CHỌN 2: TUYẾN B — NGUYỄN THANH TÙNG (`02_nhanh_tung/`)

#### 🧱 Nhánh 2 — Nguyễn Thanh Tùng (Ân oán bi kịch 1996)
* **Bóc trần lời khai nói dối & Động cơ thù hận:**
  - **Suy luận đối chiếu:**
    - ➔ Ghép nối Mảnh báo xé vụn (`p5`) (tai nạn bé N.G.H tử vong trong tủ gỗ chiều 24/07/1996) + Ảnh kỷ niệm (`p4`) (Tùng bế Huy, sẹo mày chữ V) + Lý lịch Tùng (`14_ly_lich`): Khóa chặt Tùng là anh trai bé Huy và ngày xảy ra án mạng (24/07/2016) đúng ngày giỗ 20 năm.
    - ➔ Lời khai Tùng lần 1 (`14`): Khẳng định *"chỉ gọi điện 19:55, không gặp mặt Khang"*.
    - ➔ Đối chiếu Dấu vân tay trên khung bức ảnh vỡ (`p4`): Kết quả trùng khớp 100% với Tùng ➔ **Bóc trần Tùng nói dối "chỉ gọi điện không gặp", chứng minh Tùng đã trực tiếp đến hiện trường và cầm khung ảnh**.

---

* 🧩 **CÂU HỎI 2B (Thẩm tra Nguyễn Thanh Tùng):**
  - **Hình thức trả lời (2 bước & câu dẫn định hướng):**
    - **Bước 1 (Nhập tên nghi phạm hiện trường):** `Nguyễn Thanh Tùng` (hoặc `Tùng`).
    - **Câu dẫn định hướng:** *"Dựa trên mâu thuẫn giữa lời khai chối bỏ với dấu vết hiện trường và động cơ bi kịch 1996"*
    - **Bước 2 (Chọn 4 tài liệu & vật chứng chứng minh):** `Lời khai Tùng lần 1` (`14`) + `Dấu vân tay trên khung bức ảnh vỡ` (`p4`) + `Mảnh báo cũ xé vụn` (`p5`) + `Ảnh kỷ niệm 1996` (`p4`).

---

* 🔓 **GIAI ĐOẠN 2 — Mở khóa Thẻ tự thú & Bế tắc:**
  - **Suy luận đối chiếu & Bế tắc:**
    - ➔ Thẻ tự thú của Tùng (`01`): Thừa nhận mang bài báo sang đối chất, xô Khang ngã ngất lúc 20:00 rồi hoảng sợ bỏ chạy lúc 20:15.
    - 🚨 **Bế tắc:** Thương tích chí mạng đâm chết Khang diễn ra lúc ~21:00 bằng mảnh thủy tinh vỡ `p3`. Tùng không phải thủ phạm đâm chết Khang ➔ **Tuyến B bế tắc 1 chiều (`isTuyenBCompleted = true`)**.

---

### 🔑 NÚT HỘI TỤ — CÂU HỎI LOẠI TRỪ NGHI PHẠM & KÍCH HOẠT LỆNH KHÁM XÉT

* **Điều kiện kích hoạt:** Hoàn thành cả Tuyến A (Mai & Vũ) và Tuyến B (Tùng) (`isTuyenACompleted && isTuyenBCompleted`).

* 🧩 **CÂU HỎI HỘI TỤ (Thẩm tra loại trừ 3 nghi phạm ban đầu):**
  - **Mục tiêu:** Nhập tên và chọn bằng chứng/lý do loại trừ từng nghi phạm (Mai, Vũ, Tùng) khỏi diện hung thủ trực tiếp gây án lúc ~21:00:
    1. **Nguyễn Ngọc Mai:**
       - **Tên nghi phạm:** `Nguyễn Ngọc Mai` (hoặc `Mai`).
       - **Lý do & Bằng chứng loại trừ:** Ngoại phạm khách quan ở nhà Phố Đoàn Kết xem TV bị đứt cáp quang lúc 20:10 (`Lời khai Mai 12` + `Bảng tin rao vặt 18`).
    2. **Lê Quang Vũ:**
       - **Tên nghi phạm:** `Lê Quang Vũ` (hoặc `Vũ`).
       - **Lý do & Bằng chứng loại trừ:** Thanh toán chuyển khoản 195k tại Quán Bia 88 lúc 21:15 cách hiện trường 3.8km (`Lời khai Vũ 2 07` + `Sổ thu chi Quán Bia 88 06`).
    3. **Nguyễn Thanh Tùng:**
       - **Tên nghi phạm:** `Nguyễn Thanh Tùng` (hoặc `Tùng`).
       - **Lý do & Bằng chứng loại trừ:** Tự thú xô ngã nạn nhân ngất lúc 20:00 rồi bỏ chạy lúc 20:15, không có mặt lúc nạn nhân bị đâm chết ~21:00 (`Thẻ tự thú của Tùng 01`).

---

* 🔓 **KÍCH HOẠT LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG:**
  - Trả lời đúng **CÂU HỎI HỘI TỤ** ➔ Hệ thống xác nhận loại trừ cả 3 nghi phạm ban đầu ➔ Gợi ý quét mã QR Thẻ cứng *"LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG"*.
  - **Cơ chế khám xét Point-and-Click:**
    1. Quét mã QR Thẻ cứng *"LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG"*.
    2. Khám xét các điểm tương tác (`•`) tại hiện trường:
       - `•` **Cánh cửa sổ hướng ra gác chắn đường sắt:** Âm thanh còi tàu hỏa & chuông gác chắn rú vang lúc **20:30**.
  - **Kết quả:** Âm thanh còi tàu 20:30 khớp 100% tạp âm nền trong `Voice tin nhắn thoại Hà` (`01`) ➔ Bẻ gãy ngoại phạm VTV3 và mở khóa Tập hồ sơ Tuyến C (Trần Thị Hà).

---

### 🔴 GIAI ĐOẠN 2: TẬP HỒ SƠ TUYẾN C — THỦ PHẠM TRẦN THỊ HÀ (`03_nhanh_ha/`)

#### 👩‍💼 1. Bóc trần ngoại phạm còi tàu & Lịch VTV3
- **Suy luận đối chiếu:**
  - ➔ Voice nhắn thoại của Hà (`01`): Có tạp âm còi tàu gác chắn lúc 20:32 ➔ Hà đang đứng trước cổng nhà Khang chứ không ở phòng trọ.
  - ➔ Lịch VTV3 (`02`): Thứ Sáu ngày 24/07 chỉ phát Gameshow Trò chơi truyền hình, không chiếu phim bộ ➔ Lời khai xem phim bộ ngụy trang của Hà sụp đổ.

---

* 🧩 **CÂU HỎI 3A (Bóc trần ngoại phạm Trần Thị Hà):**
  - **Hình thức trả lời (3 bước):**
    - **Bước 1 (Nhập tên nghi phạm):** `Trần Thị Hà` (hoặc `Hà`).
    - **Bước 2 (Chọn loại mâu thuẫn):** 📍 **Địa điểm**.
    - **Bước 3 (Chọn tài liệu bẻ gãy lời khai):** `Voice tin nhắn thoại Hà` (`01`) + `Lịch phát sóng VTV3` (`02`).

---

* 🔓 **MỞ KHÓA KHÁM XÉT PHÒNG TRỌ HÀ:**
  - Thu giữ `Áo gió dính phấn hoa xoan` (`03`) (Khớp nhân chứng Vũ thấy bóng người rình gốc cây xoan).
  - Thu giữ `Lọn tóc mai dính máu` (`04` / `EV-HAIR-DNA`) giấu trong áo ngực (Kết quả ADN trùng khớp 100% Khang).

---

* 🧩 **CÂU HỎI 3B (Cáo Trạng Định Tội & Bắt giữ Thủ phạm):**
  - **Hình thức trả lời (3 bước):**
    - **Bước 1 (Chỉ danh thủ phạm):** `Trần Thị Hà` (hoặc `Hà`).
    - **Bước 2 (Xác định động cơ gây án):** Cuồng yêu, ghen tuông bệnh hoạn khi mở điện thoại phát hiện Khang chuẩn bị tiền bỏ trốn với bồ mới.
    - **Bước 3 (Bộ vật chứng chí mạng):** `Lọn tóc mai dính máu` (`04` / `EV-HAIR-DNA`) + `Áo gió dính phấn hoa` (`03`).

---

## ⚖️ IV. BẢN CÁO TRẠNG ĐỊNH TỘI

```text
┌─────────────────────────────────────────────────────────────────────────┐
│              BIÊN BẢN KẾT LUẬN ĐIỀU TRA CHUYÊN ÁN #000                  │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. THỦ PHẠM CHÍNH : [◉] TRẦN THỊ HÀ (`ha`)                              │
│ 2. ĐỘNG CƠ GÂY ÁN : [◉] Cuồng yêu, ghen tuông bệnh hoạn khi mở điện thoại │
│                         phát hiện Khang chuẩn bị tiền bỏ trốn với bồ mới │
│ 3. HUNG KHÍ GÂY ÁN: [◉] Mảnh thủy tinh vỡ từ bình trà (`p3`)             │
│ 4. THỜI ĐIỂM GÂY ÁN: [◉] Khoảng 20:45 – 21:15 (ước tính ~21:00)          │
│ 5. BỘ CHỨNG CỨ BUỘC TỘI CHÍ MẠNG:                                       │
│    • Chứng cứ 1: Lọn tóc dính máu khớp 100% ADN Khang (`EV-HAIR-DNA`)   │
│    • Chứng cứ 2: Bóc trần ngoại phạm giả mạo bằng Còi tàu 20:32 & VTV3  │
│    • Chứng cứ 3: Áo gió dính phấn hoa xoan khớp nhân chứng hiện trường │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎬 V. MÀN KẾT & HỒ SƠ HẬU ÁN

1. **Biên bản hỏi cung & Lời tự thú của Trần Thị Hà (`05_hoi_cung_tran_thi_ha.md`):**
   - Bị đập tan hoàn toàn trước chứng cứ ADN và còi tàu, Hà tự thú hành vi cứa cổ Khang lúc 21:00 do ghen tuông.
2. **Bản Cáo Trạng vi phạm hình sự (`04_ban_cao_trang_dinh_toi.md`).**
3. **3 Ký Sự Hậu Án (`05_ky_su_hau_an.md`):** Mai & Vũ, Tùng & Bi kịch 1996, và Tâm lý Hà.
