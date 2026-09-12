# 🕵️ THIẾT KẾ GAMEPLAY & LUỒNG ĐIỀU TRA VỤ ÁN #000

## 🧭 I. SƠ ĐỒ LUỒNG ĐIỀU TRA & MỞ KHÓA GIAI ĐOẠN

```text
                  ┌────────────────────────────┴────────────────────────────┐
            [LỰA CHỌN 1: MAI & VŨ]                                    [LỰA CHỌN 2: TÙNG]
                  │                                                         │
                  ▼                                                         ▼
 ┌──────────────────────────────────┐                     ┌──────────────────────────────────┐
 │ 🟢 TUYẾN ĐIỀU TRA A              │                     │ 🟡 TUYẾN ĐIỀU TRA B              │
 ├──────────────────────────────────┤                     ├──────────────────────────────────┤
 │ • Giai đoạn 0: Lời khai lần 1    │                     │ • Giai đoạn 0: Tra SĐT 19:55     │
 │ • Giai đoạn 1: Minh oan Mai     │                     │ • Giai đoạn 1: Vân tay & Báo cũ  │
 │ • Giai đoạn 2: Minh oan Vũ      │                     │ • Giai đoạn 2: Tự thú (Bế tắc)   │
 └────────────────┬─────────────────┘                     └────────────────┬─────────────────┘
                  │                                                        │
                  └────────────────────────────┬───────────────────────────┘
                                               │ (Hoàn thành CẢ 2 Lựa chọn)
                                               ▼
                      ┌─────────────────────────────────────────────────┐
                      │ 🔑 NÚT HỘI TỤ (QUÉT QR LỆNH KHÁM XÉT HIỆN TRƯỜNG)│
                      └────────────────────────┬────────────────────────┘
                                               │ (Âm thanh còi tàu 20:30 & Lịch VTV3)
                                               ▼
                          ┌──────────────────────────────────────────┐
                          │ 🔴 GIAI ĐOẠN 2: ĐIỀU TRA THỦ PHẠM HÀ     │
                          ├──────────────────────────────────────────┤
                          │ • Bóc trần ngoại phạm còi tàu & VTV3     │
                          │ • Áo gió dính phấn hoa xoan khớp rình rập│
                          │ • Lọn tóc dính máu trùng 100% ADN Khang  │
                          └────────────────────┬─────────────────────┘
                                               │
                                               ▼
                          ┌──────────────────────────────────────────┐
                          │ ⚖️ BẢN CÁO TRẠNG ĐỊNH TỘI                │
                          └────────────────────┬─────────────────────┘
                                               │
                                               ▼
                          ┌──────────────────────────────────────────┐
                          │ 🎬 MÀN KẾT (3 KÝ SỰ HẬU ÁN)              │
                          └──────────────────────────────────────────┘
```

---

## 🔒 ĐIỀU KIỆN KÍCH HOẠT LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG

- **Vị trí:** Nút hội tụ chuyển từ Phase 1 ➔ Phase 2.
- **Kích hoạt:** $\text{PermitActivation} = \text{isTuyenACompleted} \land \text{isTuyenBCompleted}$
  - `isTuyenACompleted`: Minh oan Vũ (Quán Bia 88 lúc 20:45).
  - `isTuyenBCompleted`: Bóc trần Tùng (Vân tay tách trà + Tự thú xô xát).
- **Thông báo hệ thống:**
  - 🛑 *Chưa đủ:* Yêu cầu hoàn thành điều tra Mai, Vũ, Tùng trước.
  - 🔔 *Đủ điều kiện:* Gợi ý quét QR Thẻ cứng "LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG".


---

## 🎮 II. TIẾN TRÌNH ĐIỀU TRA THEO CÁC TẬP HỒ SƠ

### 🟢 LỰA CHỌN 1: TẬP HỒ SƠ TUYẾN A — MAI & VŨ (`01_nhanh_mai_vu/`)

#### 👩 Nhánh 1A — Trần Ngọc Mai (Tranh chấp Đất đai)
* **Giai đoạn 0 — Lời khai ban đầu & Xác minh ngoại phạm:**
  - **Danh mục tài liệu tiếp cận:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Lời khai Mai** (`12`) | Khai ném hồ sơ rồi phóng xe về thẳng nhà (đến nơi ~19:45), xem TV đến 20:10 thì mất sóng cáp | Timeline di chuyển & ngoại phạm TV | Hồ sơ điều tra ban đầu |
| **Lời khai bà Lụa** (`11`) | Thấy Mai nổ máy xe phóng đi đúng lúc Thời sự VTV1 cất lên (19:00) | Xác nhận mốc giờ Mai rời hiện trường | Hồ sơ điều tra ban đầu |
| **Bảng tin rao vặt** (`18`) | Thông báo đứt cáp quang lúc 20:10 ở Phố Đoàn Kết | Chứng cứ xác thực ngoại phạm ở nhà | Thu thập tại Bảng tin khu phố Đoàn Kết |
| **Đơn đòi đất 200m²** (`p2`) | Xấp đơn đòi đất 200m² tại hiện trường | Động cơ mâu thuẫn tranh chấp đất | Văng vãi dưới sàn cửa chính hiện trường |

  - **Suy luận đối chiếu:**
    - ➔ Lời khai Mai (`12`): Khai cãi nhau xong nổ máy về thẳng nhà ở Phố Đoàn Kết lúc ~19:45, không ghi nhớ chính xác mốc giờ rời nhà Khang.
    - ➔ Lời khai bà Lụa (`11`): Thấy cô gái (Mai) dắt xe nổ máy phóng đi đúng lúc nhạc Thời sự VTV1 cất lên (19:00), xác định chính xác mốc giờ Mai rời hiện trường là 19:00.
    - ➔ Lời khai Mai về nhà xem tivi đến 20:10 thì mất sóng cáp khớp với Thông báo sự cố đứt cáp quang trên Bảng tin rao vặt (`18`).
    - ➔ Xác nhận ngoại phạm khách quan: Mai di chuyển về Phố Đoàn Kết (cách 4km) và ở nhà suốt đêm, không thể có mặt tại hiện trường lúc ~21:00.
    - ➔ Minh oan & loại trừ Mai khỏi danh sách nghi phạm.

---

#### 👷 Nhánh 1B — Lê Quang Vũ (Khoản nợ Bí mật)
* **Giai đoạn 0 — Bắt thóp mâu thuẫn & Bóc trần động cơ nợ nần:**
  - **Danh mục tài liệu tiếp cận:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Lời khai Vũ (lần 1)** (`13`) | Khai vợ vừa đi thì rời đi ngay để đi uống bia một mình | Lời khai rời đi ban đầu | Hồ sơ điều tra ban đầu |
| **Lịch sử App đặt xe** (`16`) | Lịch sử app cho thấy Vũ đặt xe lúc 19:30 | Bắt thóp Vũ nói dối mốc giờ (chênh 30p) | Vũ tự xuất trình khi lấy lời khai |
| **Trích sao Sổ ghi nợ** (`05`) | Sổ nợ 300M (con nợ biệt danh *"Lệch Pha"*, quá hạn trả) | Xác định động cơ mâu thuẫn nợ nần | Thu thập tại hiện trường |
| **SMS đòi nợ của Khang** (`10`) | SMS Khang gửi đòi nợ 300M (đe dọa mách bố vợ) | Manh mối khoanh vùng nghi phạm quá hạn | Điện thoại giả lập của Khang |
| **Ảnh chân dung Lê Quang Vũ** (`p6`) | Ảnh chân dung Vũ (hiển thị đặc điểm mắt lác nhẹ) | Manh mối nhận diện biệt danh "Lệch Pha" | Hồ sơ điều tra ban đầu |

  - **Suy luận đối chiếu:**
    - ➔ Lời khai bà Lụa (`11`) (Mai đi 19:00) vs App đặt xe (`16`) (Vũ đặt xe 19:30): Bắt thóp Vũ nói dối mốc giờ rời đi, chứng minh Vũ nán lại hiện trường 30 phút (19:00 – 19:30).
    - ➔ Đối chiếu Ảnh chân dung Vũ (`p6`) (kỹ sư điện + mắt lác), SĐT đặt xe (`16`) & SMS đòi nợ (`10`) đe dọa *"mách bố vợ"* với Sổ nợ (`05`): Bóc trần con nợ quá hạn 300M biệt danh *"Lệch Pha"* chính là Lê Quang Vũ!
    - ➔ Xác định động cơ thực sự khiến Vũ nán lại 30 phút là do khoản nợ 300M.

* 🔓 **GIAI ĐOẠN 1 — Mở khóa Lời khai 2 & Xác minh Quán bia:**
  - **Danh mục tài liệu mở khóa:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Lời khai Vũ (lần 2)** (`07`) | Thừa nhận nán lại 30p xin hoãn nợ 300M; Khai gọi 1 đĩa nem + uống đúng nửa thùng bia; Khai thấy bóng người áo gió rình dưới gốc cây xoan lúc 19:25 | Tháo gỡ 30p ẩn số; Cung cấp manh mối đồ gọi (1 đĩa nem + nửa thùng bia) để khớp Sổ thu chi & bóng người cây xoan | Công an tiến hành hỏi cung động cơ gây án |
| **Sổ thu chi Quán Bia 88** (`06`) | Danh sách bàn thanh toán trong ngày | Manh mối tra cứu mốc giờ thanh toán của Vũ (B7: 195k lúc 20:45) | Công an đến Quán Bia 88 xác minh theo Lời khai 2; chủ quán xuất trình sổ |

  - **Suy luận đối chiếu & Minh oan:**
    - ➔ Lời khai lần 2 (`07`): Vũ thừa nhận nán lại 30 phút (19:00 – 19:30) van xin hoãn nợ 300M, đồng thời khai báo nhìn thấy một bóng người mặc áo gió xám rình rập dưới gốc cây xoan lúc 19:25 trước khi đón xe đi Quán Bia 88.
    - ➔ Khớp nối Lời khai (`07`) với Sổ thu chi Quán Bia 88 (`06`): Từ chi tiết Vũ khai gọi *1 đĩa nem + nửa thùng bia* (1 khách), suy ra dòng **B7 (1 khách): -> 195k (CK 20:45)** chính là bàn của Vũ, xác định mốc giờ thanh toán ra về là **20:45**.
    - ➔ Xác nhận Vũ ở Quán Bia 88 (cách 3.8km) từ 19:40 đến 20:45 ➔ Vũ không thể có mặt gây án tại nhà Khang lúc ~21:00.
    - ➔ Minh oan cho Vũ (`isTuyenACompleted = true`).

* 👉 **Kết luận Tập hồ sơ Tuyến A:** Mai và Vũ đều được minh oan (`isTuyenACompleted = true`).

---

### 🟡 LỰA CHỌN 2: TẬP HỒ SƠ TUYẾN B — NGUYỄN THANH TÙNG (`02_nhanh_tung/`)

#### 👨 Nguyễn Thanh Tùng (Mâu thuẫn Án cũ 20 năm trước)
* **Giai đoạn 0 — Mở Tập hồ sơ ban đầu:**
  - **Danh mục tài liệu tiếp cận:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Lời khai Nguyễn Thanh Tùng** (`14`) | Khai gọi điện lúc 19:55, chối không sang nhà Khang | Lời khai chối tới hiện trường | Hồ sơ điều tra ban đầu |
| **Dấu vân tay tách trà** (`p1`) | Vân tay lạ trên tách trà phòng khách Khang | Chứng minh Tùng đã vào nhà uống trà | Khám nghiệm dấu vết tách trà phòng khách |
| **Bức ảnh kỷ niệm 1996** (`p4`) | Ảnh 1996: Tùng (sẹo lông mày), Gia Huy (còi cam) | Manh mối nhận diện án cũ 1996 | Tìm thấy trong khung ảnh vỡ dưới sàn nhà |
| **Bài báo cũ năm 1996** (`p5`) | Bài báo 1996 vụ án bé Gia Huy bị nhốt tủ | Động cơ trả thù cá nhân của Tùng | Tra cứu SĐT 19:55 trên Bảng tin `18` |

  - **Suy luận đối chiếu:**
    - ➔ Tùng chính là anh trai bé Gia Huy bị nhốt tủ năm 1996.
    - ➔ Vân tay tách trà (`p1`) trùng khớp vân tay Tùng.
    - ➔ Bóc trần Tùng nói dối: Tùng đã trực tiếp sang nhà Khang đối chất!

* 🔓 **GIAI ĐOẠN 1 — Mở Thẻ tài liệu tự thú (`01_tu_thu_xo_xat_tung`):**
  - **Danh mục tài liệu mở khóa:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Thẻ tự thú của Tùng** (`01`) | Tùng tự thú xô Khang ngất lúc 20:00 rồi bỏ chạy 20:15 | Xác nhận xô xát, nạn nhân vẫn thở khi đi | Giải đố chữ & bóc trần Tùng 1996 |

  - **Suy luận đối chiếu & Bế tắc:**
    - ➔ Mở Lời tự thú: Tùng khai xô Khang ngã đập đầu ngất lúc 20:00 rồi bỏ chạy lúc 20:15.
    - 🚨 **Suy luận bế tắc:** Lời khai *"Tôi bỏ đi khi Khang còn thở"* là lời khai 1 chiều, không thể xác minh Tùng có quay lại hay không.
    - ➔ Vụ án rơi vào ngõ cụt bế tắc (`isTuyenBCompleted = true`).

* 👉 **Kết luận Tập hồ sơ Tuyến B:** Tùng rơi vào bế tắc 1 chiều (`isTuyenBCompleted = true`).

---

### 🔑 NÚT HỘI TỤ CHUYỂN TIẾP (QUÉT QR LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG)

* **Điều kiện:** Đã hoàn thành cả 2 Tập hồ sơ Tuyến A & Tuyến B (`isTuyenACompleted && isTuyenBCompleted`).
* **Hành động:** Quét mã QR Thẻ cứng "LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG".
* **Manh mối âm thanh mở khóa:** Phát tiếng còi tàu hỏa & chuông gác chắn đường sắt rú vang tại hiện trường lúc 20:30.

---

### 🔴 GIAI ĐOẠN 2: TẬP HỒ SƠ TUYẾN C — THỦ PHẠM TRẦN THỊ HÀ (`03_nhanh_ha/`)
*(Mở khóa sau khi thực nghiệm âm thanh còi tàu và bẻ gãy bằng chứng ngoại phạm VTV3)*

* **Giai đoạn 1 — Bóc trần ngoại phạm & Lệnh khám xét:**
  - **Danh mục tài liệu tiếp cận:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Lời khai Trần Thị Hà** (`15`) | Khai ở phòng trọ xem phim bộ VTV3 cả tối | Lời khai ngụy trang bằng chứng TV | Hồ sơ điều tra ban đầu |
| **Voice tin nhắn thoại Hà** (`01`) | Voice lúc 20:32 lọt tiếng còi tàu & chuông gác chắn | Bằng chứng âm thanh tại hiện trường | Quét QR Lệnh khám xét hiện trường |
| **Lịch phát sóng VTV3** (`02`) | Lịch VTV3 24/07: Trò chơi truyền hình, không có phim bộ | Bẻ gãy ngoại phạm VTV3 của Hà | Trích xuất lịch phát sóng đài truyền hình |

  - **Suy luận đối chiếu:**
    - ➔ Chứng minh Hà đang đứng ngay trước cửa nhà Khang lúc 20:32 chứ không ở phòng trọ.

* 🔓 **GIAI ĐOẠN 2 — Thi hành Lệnh khám xét phòng trọ Hà:**
  - **Danh mục tài liệu mở khóa:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Áo gió dính phấn hoa** (`03`) | Áo gió dính phấn hoa xoan tại phòng trọ Hà | Khớp bóng người rình rập gốc cây xoan | Khám xét tủ quần áo phòng trọ Hà |
| **Biên bản tử thi bổ sung** (`04`) | Tử thi bổ sung: Khang bị cắt một lọn tóc mai | Manh mối hung thủ lấy vật kỷ niệm | Trích sao biên bản pháp y tử thi Khang |
| **Lọn tóc mai dính máu** (`05`) | Lọn tóc mai dính máu (`EV-HAIR-DNA`) phòng Hà | **Chứng cứ chí mạng:** ADN trùng 100% Khang | Thu giữ trong hộp trang sức phòng trọ Hà |

  - **Suy luận đối chiếu:**
    - ➔ Áo gió dính phấn hoa xoan khớp bóng người rình rập trước cổng.
    - ➔ Lọn tóc mai dính máu trùng khớp 100% ADN Khang đập tan sự chối cãi.
    - ➔ Kết án Trần Thị Hà thủ phạm cứa cổ Khang lúc 21:00 do cơn cuồng ghen.

---

## ⚖️ IV. BẢN CÁO TRẠNG ĐỊNH TỘI

Người chơi tổng hợp toàn bộ suy luận để điền biểu mẫu kết án tại `04_ban_cao_trang_dinh_toi.md`:

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

* **Kết quả:** Điền chính xác toàn bộ cáo trạng ➔ Hoàn tất phá án thành công!

---

## 🎬 V. MÀN KẾT & HỒ SƠ HẬU ÁN

Sau khi nộp Cáo Trạng chính xác, hệ thống mở khóa các nội dung kết thúc câu chuyện:

1. **Biên bản hỏi cung & Lời tự thú của Trần Thị Hà (`05_hoi_cung_tran_thi_ha.md`):**
   - Bị đập tan hoàn toàn trước các chứng cứ khoa học, Hà sụp đổ và tự thú toàn bộ:
     + Đứng rình ngoài cổng lúc 20:32 (gửi voice lọt tiếng tàu hàng), thấy Tùng chạy đi lúc 20:15 nên lẻn vào nhà lúc 20:45.
     + Thấy Khang ngất mê man dưới sàn, Hà lấy tay Khang mở khóa điện thoại phát hiện tin nhắn Khang hẹn bỏ trốn đi xa với người tình mới Thảo Vy ➔ Cơn cuồng yêu và thù hận bùng nổ.
     + Đến đúng **21:00**, Hà cầm mảnh vỡ bình trà `p3` đâm cứa đứt động mạch cảnh của Khang, cắt lấy lọn tóc mai dính máu rồi tẩu thoát lúc 21:08.
2. **Bản Cáo Trạng Chính Thức Của Viện Kiểm Sát Nhân Dân (`04_ban_cao_trang_dinh_toi.md`):**
   - Truy tố Trần Thị Hà về tội *"Giết người có tính chất man rợ"*.
3. **3 Ký Sự Hậu Án (`05_ky_su_hau_an.md`):**
   - *Ký sự 1 (Mai & Vũ):* Bản di chúc của ông nội hàn gắn tình thân và bài học dứt điểm nợ nần.
   - *Ký sự 2 (Tùng & Bi kịch 1996):* Nỗi đau 30 năm và nén hương muộn màng cho Gia Huy.
   - *Ký sự 3 (Trần Thị Hà):* Tâm lý ái kỷ biến thái trong phòng biệt giam pháp y.
