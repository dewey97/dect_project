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

### 📋 GIAI ĐOẠN 0 — TÀI LIỆU NHIỄU & THÔNG TIN NỀN BAN ĐẦU
- **Bối cảnh:** Toàn bộ các văn bản hành chính tố tụng và thông tin bối cảnh mở đầu vụ án (không trực tiếp dùng làm manh mối suy luận).

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Phiếu tiếp nhận tin báo** (`01`) | Tin báo từ bà Lụa (06:45 sáng 25/07) | Thông tin nền hành chính ban đầu (Nhiễu) | Hồ sơ điều tra ban đầu |
| **Quyết định khởi tố** (`02`) | Quyết định khởi tố vụ án hình sự | Thủ tục tố tụng hành chính (Nhiễu) | Hồ sơ điều tra ban đầu |
| **Báo cáo tiến độ** (`06`) | Báo cáo tiến độ ban đầu chuyên án | Báo cáo hành chính nội bộ (Nhiễu) | Hồ sơ điều tra ban đầu |
| **Nhân thân nạn nhân** (`07`) | Khang làm vay nặng lãi, mồ côi | Bối cảnh nghề nghiệp & quan hệ Khang (Nhiễu) | Hồ sơ điều tra ban đầu |
| **Hồ sơ lý lịch Trần Ngọc Mai** (`08a`) | Lý lịch nhân thân em họ Trần Ngọc Mai | Thông tin nhân thân đối tượng (Nhiễu) | Hồ sơ điều tra ban đầu |
| **Hồ sơ lý lịch Lê Quang Vũ** (`08b`) | Lý lịch nhân thân em rể Lê Quang Vũ | Thông tin nhân thân đối tượng (Nhiễu) | Hồ sơ điều tra ban đầu |
| **Hồ sơ lý lịch Trần Thị Hà** (`08c`) | Lý lịch nhân thân bạn gái Trần Thị Hà | Thông tin nhân thân đối tượng (Nhiễu) | Hồ sơ điều tra ban đầu |
| **Ma trận mâu thuẫn** (`09`) | Phân lập 4 hướng mâu thuẫn | Bảng tóm tắt định hướng 2 tuyến A/B (Nhiễu) | Hồ sơ điều tra ban đầu |

---

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
| **Lời khai Vũ (lần 1)** (`13`) | Khai vợ vừa đi thì rời đi ngay để đi uống bia một mình | Lời khai rời đi ban đầu (bắt thóp nán lại) | Hồ sơ điều tra ban đầu |
| **Ảnh Screenshot App đặt xe** (`p10`) | Ảnh chụp màn hình app cho thấy Vũ đặt xe lúc 19:25 và đón 19:30 | Bắt thóp Vũ nói dối mốc giờ (chênh 30p) | Screenshot do Vũ tự xuất trình khi lấy lời khai |
| **Trích sao Sổ ghi nợ** (`05`) | Sổ nợ 300M (con nợ biệt danh *"Lệch Pha"*, quá hạn trả) | Xác định động cơ mâu thuẫn nợ nần | Thu thập tại hiện trường |
| **SMS đòi nợ của Khang** (`dev-00`) | SMS Khang gửi đòi nợ 300M (đe dọa mách bố vợ) | Manh mối khoanh vùng nghi phạm quá hạn | Điện thoại giả lập của Khang (`dev-00`) |
| **Ảnh chân dung Lê Quang Vũ** (`p6`) | Ảnh chân dung Vũ (hiển thị đặc điểm mắt lác nhẹ) | Manh mối nhận diện biệt danh "Lệch Pha" | Hồ sơ điều tra ban đầu |

  - **Suy luận đối chiếu:**
    - ➔ Lời khai bà Lụa (`11`) (Mai đi 19:00) vs Screenshot App đặt xe (`p10`) (Vũ đặt xe 19:30): Bắt thóp Vũ nói dối mốc giờ rời đi, chứng minh Vũ nán lại hiện trường 30 phút (19:00 – 19:30).
    - ➔ Đối chiếu Ảnh chân dung Vũ (`p6`) (kỹ sư điện + mắt lác), SĐT đặt xe & SMS đòi nợ (trên điện thoại dev-00) đe dọa *"mách bố vợ"* với Sổ nợ (`05`): Bóc trần con nợ quá hạn 300M biệt danh *"Lệch Pha"* chính là Lê Quang Vũ!
    - ➔ Xác định động cơ thực sự khiến Vũ nán lại 30 phút là do khoản nợ 300M.

---

* 🧩 **CÂU HỎI 1:**
  - **Hình thức trả lời (3 bước):**
    - **Bước 1 (Nhập tên nghi vấn):** `Lê Quang Vũ` (hoặc `Vũ`).
    - **Bước 2 (Chọn loại mâu thuẫn):**
      - [x] ⏰ **Thời gian**
      - [ ] 📍 **Địa điểm**
      - [ ] 🤝 **Mối quan hệ**
    - **Bước 3 (Chọn tài liệu chứng minh):** `Lời khai bà Lụa` (`11`) + `Ảnh Screenshot App đặt xe` (`p10`).

---

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

* **Giai đoạn 0 — Thu thập manh mối ban đầu & Truy tìm danh tính SĐT 19:55:**
  - **Bối cảnh ban đầu:** Tùng **chưa có tên trong danh sách nghi phạm** chính thức. Mục tiêu giai đoạn này là phân tích `Nhật ký cuộc gọi` (trên điện thoại dev-00) để tra cứu danh tính 3 SĐT không tên và tìm ra Tùng.
  - **Phân tích 5 SĐT trong Nhật ký cuộc gọi trên điện thoại Khang (`dev-00`):**
    - 📞 **2 SĐT có tên (Nhiễu):** `Chị Lan Quán Nước` (17:30) & `Bình Còi` (18:00) ➔ Có sẵn Biên bản lấy thông tin (`16a`, `16b`).
    - ❓ **3 SĐT ẩn danh (Cần giải mã):** `0988.20.09.91` (18:15), `0912.xxx.888` (18:45), và `0984.xxx.357` (19:55).

  - **Danh mục tài liệu & Vật chứng manh mối:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Nhật ký cuộc gọi** (`dev-00`) | Trích xuất cuộc gọi: 5 SĐT (2 số có tên sẵn, 3 số không tên) | Manh mối khởi đầu truy tìm danh tính Tùng | Điện thoại giả lập của Khang (`dev-00`) |
| **Biên bản lấy thông tin Chị Lan** (`16a`) | Bản tự thuật thông tin người liên quan Chị Lan Quán Nước | Nhiễu | Hồ sơ điều tra ban đầu |
| **Biên bản lấy thông tin Bình Còi** (`16b`) | Bản tự thuật thông tin người liên quan Bình Còi | Nhiễu | Hồ sơ điều tra ban đầu |
| **Trích sao Sổ ghi nợ** (`05`) | Danh sách con nợ (khớp SĐT ẩn danh Lê Quang Vũ & 18:45) | Tra cứu danh tính các SĐT ẩn danh nợ nần | Thu thập tại hiện trường nhà Khang |
| **Bảng thông tin khu phố** (`18`) | Mục tin rao vặt bán vật liệu xây dựng (chứa SĐT Tùng) | Tra cứu SĐT 19:55 ➔ Tìm ra Nguyễn Thanh Tùng | Thu thập tại Bảng thông tin khu phố Đoàn Kết |
| **Phỏng vấn bố mẹ Tùng** (`11`) | Lời khai bố mẹ Tùng: Khang từng chơi với 2 con trai nhà bà đến khi em út qua đời | Gieo ấn tượng mơ hồ về mối quan hệ quá khứ & sự xuất hiện của con lớn (Nhiễu) | Lời khai hàng xóm (Hồ sơ ban đầu) |
| **Mảnh báo cũ xé vụn** (`p5`) | Các mảnh báo xé rải rác trên sàn, ghép lại thành bài báo 30 năm trước | Manh mối bi kịch Trốn Tìm 1996 & bằng chứng có người mang báo đến xé | Khám nghiệm hiện trường sàn nhà Khang |
| **Ảnh kỷ niệm 1996** (`p4`) | Ảnh Lễ Đại Đoàn Kết 30 năm trước (Khang, Mai, Tùng bế Huy), vỡ khung kính | Manh mối khớp Tùng là anh trai bé Huy & nhận diện sẹo lông mày | Thu thập trong khung ảnh vỡ dưới sàn nhà Khang |
| **Dấu vân tay tách trà** (`p1`) | Dấu vân tay lạ trên tách trà phòng khách Khang | Manh mối sinh học chờ đối chiếu | Khám nghiệm hiện trường phòng khách |

  - **Suy luận đối chiếu:**
    - ➔ Đối chiếu SĐT `0988.20.09.91` (18:15) với `Trích sao Sổ ghi nợ` (`05`): Tra ra **Lê Quang Vũ** *(Đã có hồ sơ ở Tuyến A)*.
    - ➔ Đối chiếu SĐT `0912.xxx.888` (18:45) với `Trích sao Sổ ghi nợ` (`05`): Tra ra **Đạt Gà Chợ Cảng**.
    - ➔ Đối chiếu SĐT `0984.xxx.357` (19:55) với `Bảng thông tin khu phố` (`18`): Tra ra **Nguyễn Thanh Tùng**.

---

* 🧩 **CÂU HỎI 2A:**
  - **Hình thức trả lời:** Nhập đúng tên 3 người chủ nhân của các SĐT ẩn danh: `Lê Quang Vũ`, `Đạt Gà Chợ Cảng` (hoặc `Đạt Gà`), `Nguyễn Thanh Tùng` (hoặc `Tùng`).

---

* 🔓 **GIAI ĐOẠN 1 — Lấy thông tin người liên quan sau khi tìm ra tên:**
  - **Danh mục tài liệu tiếp cận:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Hồ sơ lý lịch Nguyễn Thanh Tùng** (`14_ly_lich`) | Trích sao lý lịch nhân thân, nghề nghiệp thợ nề, đặc điểm nhận dạng sẹo lông mày (khớp Ảnh kỷ niệm `p4`) | Manh mối xác minh nhân thân & đặc điểm nhận dạng | Mở khóa sau khi tra đủ danh tính SĐT 19:55 |
| **Lời khai Tùng (lần 1)** (`14`) | Khai gọi 19:55 hỏi hẹn gặp vay tiền sửa nhà; Khai về quê làm đám giỗ 30 năm em trai; **Khẳng định CHỈ GỌI ĐIỆN, KHÔNG GẶP MẶT Khang** | Lời khai chối bỏ việc có mặt tại hiện trường | Mở khóa sau khi tra đủ danh tính SĐT 19:55 |
| **Hồ sơ lý lịch Đạt Gà** (`14a_ly_lich`) | Lý lịch nhân thân tiền án nợ nần; **Xác minh ngoại phạm:** Bán hàng tại Chợ Cảng từ 18:00 – 22:00 có 3 tiểu thương xác nhận | Bóc trần ngoại phạm khách quan của Đạt Gà (Nhiễu) | Mở khóa sau khi tra cứu SĐT ẩn danh 18:45 |
| **Lời khai Đạt Gà Chợ Cảng** (`14a`) | Khai bị Khang siết nợ gắt gao, buông lời thù địch cay cú cãi nhau gay gắt qua điện thoại lúc 18:45 | Lời khai thù địch gay gắt định hướng sai nghi phạm (Nhiễu) | Mở khóa sau khi tra cứu SĐT ẩn danh 18:45 |

  - **Suy luận đối chiếu & Bóc trần:**
    - ➔ Ghép nối Mảnh báo xé vụn (`p5`) (tai nạn bé N.G.H tử vong trong tủ khi chơi trốn tìm) + Ảnh kỷ niệm (`p4`) (Tùng bế Huy đeo còi cam) + Lời khai Tùng (`14`) (về quê làm đám giỗ 30 năm em trai): Xác định Tùng chính là anh trai bé Huy.
    - ➔ **Nghi vấn chí mạng**: Bài báo bị xé vụn ngay tại vị trí Khang ngã đập đầu ➔ Tùng có khả năng cao đã mang bài báo này đến gặp Khang đối chất và xé ném xuống sàn trong lúc xô xát bộc phát!
    - ➔ **Hành động điều tra**: Tiến hành xét nghiệm đối chiếu Dấu vân tay Tùng với Dấu vân tay trên tách trà (`p1`) ➔ **Kết quả trùng khớp 100%**!
    - ➔ **Bóc trần Tùng nói dối**: Chứng minh Tùng đã trực tiếp bước vào nhà Khang ngồi uống trà, không phải "chỉ gọi điện không gặp mặt".

---

* 🧩 **CÂU HỎI 2B:**
  - **Hình thức trả lời (3 bước):**
    - **Bước 1 (Nhập tên nghi phạm hiện trường):** `Nguyễn Thanh Tùng` (hoặc `Tùng`).
    - **Bước 2 (Chọn loại mâu thuẫn):**
      - [ ] ⏰ **Thời gian**
      - [x] 📍 **Địa điểm** *(Chứng minh Tùng có mặt ngồi uống trà tại phòng khách, bóc trần lời khai "chỉ gọi điện không gặp")*
      - [x] 🤝 **Mối quan hệ** *(Chứng minh động cơ ân oán thù hận bi kịch 1996 của em trai thay vì lý do "vay tiền sửa nhà")*
    - **Bước 3 (Chọn vật chứng chứng minh tương ứng):**
      - *Nếu chọn Địa điểm:* `Dấu vân tay tách trà` (`p1`) đối chiếu `Lời khai Tùng lần 1` (`14`).
      - *Nếu chọn Mối quan hệ:* `Mảnh báo cũ xé vụn` (`p5`) + `Ảnh kỷ niệm 1996` (`p4`).

---

* 🔓 **GIAI ĐOẠN 2 — Mở khóa Thẻ tài liệu tự thú & Bế tắc:**
  - **Danh mục tài liệu mở khóa:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Thẻ tự thú của Tùng** (`01`) | Tùng tự thú mang bài báo sang đối chất 1996, xô Khang ngã đập đầu ngất lúc 20:00 rồi hoảng sợ tháo chạy lúc 20:15 | Xác nhận xô xát bộc phát, hoảng sợ tháo chạy | Trả lời đúng câu hỏi tương tác lý do Tùng gặp Khang |

  - **Suy luận đối chiếu & Bế tắc:**
    - ➔ Lời tự thú của Tùng (`01`): Thừa nhận mang bài báo sang đối chất, xô Khang ngã đập đầu ngất lúc 20:00 rồi hoảng sợ bỏ chạy lúc 20:15.
    - 🚨 **Suy luận bế tắc:** Lời tự thú của Tùng chỉ xác nhận hành vi xô ngã; thương tích chí mạng đâm chết Khang diễn ra lúc ~21:00 bằng mảnh thủy tinh vỡ `p3`. Không thể kết tội Tùng giết người nếu không có chứng cứ bổ sung.
    - ➔ Tuyến B rơi vào ngõ cụt bế tắc (`isTuyenBCompleted = true`).

* 👉 **Kết luận Tập hồ sơ Tuyến B:** Tùng rơi vào bế tắc 1 chiều (`isTuyenBCompleted = true`).

---

### 🔑 NÚT HỘI TỤ — KÍCH HOẠT LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG

* **Điều kiện mở khóa:** Hoàn thành toàn bộ điều tra Tập hồ sơ Tuyến A (Mai & Vũ) và Tuyến B (Tùng).
* **Cơ chế tương tác Point-and-Click hiện trường:**
  1. Quét mã QR Thẻ cứng *"LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG"*.
  2. Màn hình ứng dụng hiển thị Sơ đồ bối cảnh 2D căn nhà Khang với các điểm tương tác (`•` hotspots).
  3. Người chơi ấn vào từng điểm `•` để đọc thông tin kiểm tra chi tiết kèm hiệu ứng âm thanh môi trường tương ứng:
     - `•` **Hũ trà hoa cúc phòng khách:** Âm thanh mở nắp hũ trà.
     - `•` **Tủ quần áo phòng ngủ:** Âm thanh lật mở cánh tủ *(Ghi nhận dấu vết)*.
     - `•` **Cánh cửa sổ hướng ra ngõ gác chắn (Điểm mấu chốt):** Âm thanh thực nghiệm rú vang **tiếng còi tàu hỏa & chuông gác chắn đường sắt lúc 20:30**!
* **Kết quả mở khóa:** Âm thanh còi tàu gác chắn 20:30 khớp 100% với tạp âm nền trong `Voice tin nhắn thoại của Hà` (`01`), chính thức bẻ gãy ngoại phạm ở nhà và mở khóa Tập hồ sơ Tuyến C (Trần Thị Hà).

---

### 🔴 GIAI ĐOẠN 2: TẬP HỒ SƠ TUYẾN C — THỦ PHẠM TRẦN THỊ HÀ (`03_nhanh_ha/`)

* **Giai đoạn 1 — Bóc trần ngoại phạm & Lệnh khám xét:**
  - **Danh mục tài liệu tiếp cận:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Lời khai Trần Thị Hà** (`15`) | Khai ở phòng trọ xem phim bộ VTV3 cả tối | Lời khai ngụy trang bằng chứng TV | Hồ sơ điều tra ban đầu |
| **Voice tin nhắn thoại Hà** (`01`) | Voice lúc 20:32 lọt tiếng còi tàu & chuông gác chắn | Bằng chứng âm thanh tại hiện trường | Quét QR Lệnh khám xét hiện trường |
| **Lịch phát sóng VTV3** (`02`) | Lịch VTV3 24/07: Trò chơi truyền hình, không có phim bộ | Bẻ gãy ngoại phạm VTV3 của Hà | Trích xuất lịch phát sóng đài truyền hình |

  - **Suy luận đối chiếu:**
    - ➔ Chứng minh Hà đang đứng ngay trước cửa nhà Khang lúc 20:32 chứ không ở phòng trọ.

---

* 🧩 **CÂU HỎI 3A:**
  - **Hình thức trả lời (3 bước):**
    - **Bước 1 (Nhập tên nghi phạm):** `Trần Thị Hà` (hoặc `Hà`).
    - **Bước 2 (Chọn loại mâu thuẫn):**
      - [ ] ⏰ **Thời gian**
      - [x] 📍 **Địa điểm**
      - [ ] 🤝 **Mối quan hệ**
    - **Bước 3 (Chọn tài liệu bẻ gãy lời khai):** `Voice tin nhắn thoại Hà` (`01`) + `Lịch phát sóng VTV3` (`02`).

---

* 🔓 **GIAI ĐOẠN 2 — Thi hành Lệnh khám xét phòng trọ Hà:**
  - **Danh mục tài liệu mở khóa:**

| Tên tài liệu / Mã | Nội dung | Mục đích | Cách xuất hiện |
| :--- | :--- | :--- | :--- |
| **Áo gió dính phấn hoa** (`03`) | Áo gió dính phấn hoa xoan tại phòng trọ Hà | Khớp bóng người rình rập gốc cây xoan | Khám xét tủ quần áo phòng trọ Hà |
| **Lọn tóc mai dính máu** (`04`) | Lọn tóc mai dính máu (`EV-HAIR-DNA`) của Hà | **Chứng cứ chí mạng:** ADN trùng 100% Khang | Khám xét thu giữ giấu trong lớp đệm áo ngực của Hà |

  - **Suy luận đối chiếu:**
    - ➔ Áo gió dính phấn hoa xoan khớp bóng người rình rập trước cổng.
    - ➔ Lọn tóc mai dính máu trùng khớp 100% ADN Khang đập tan sự chối cãi.
    - ➔ Kết án Trần Thị Hà thủ phạm cứa cổ Khang lúc 21:00 do cơn cuồng ghen.

---

* 🧩 **CÂU HỎI 3B:**
  - **Hình thức trả lời (3 bước buộc tội & định tội thủ phạm):**
    - **Bước 1 (Chỉ danh thủ phạm):** `Trần Thị Hà` (hoặc `Hà`).
    - **Bước 2 (Xác định động cơ gây án chính xác):**
      - [ ] Tranh chấp di sản thừa kế 200m² đất của gia tộc
      - [ ] Nợ nần bốc họ bị chủ nợ dồn vào đường cùng
      - [ ] Thù hận cái chết của em trai trong bi kịch trốn tìm 1996
      - [x] Cuồng yêu, ghen tuông bệnh hoạn khi phát hiện Khang chuẩn bị tiền bỏ trốn với bồ mới
    - **Bước 3 (Chọn bộ vật chứng buộc tội chí mạng):** `Lọn tóc mai dính máu` (`04` / `EV-HAIR-DNA`) + `Áo gió dính phấn hoa` (`03`).

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
