# 🕵️ HỒ SƠ TÀI LIỆU LUỒNG NGƯỜI CHƠI, ĐOẠN DẪN TRUYỆN & CÁC KỊCH BẢN TƯƠNG TÁC

---

## 📱 I. CHI TIẾT GIAO DIỆN WEB THỰC TẾ & LUỒNG THAO TÁC CỦA NGƯỜI CHƠI (ACTUAL WEB UI FLOW)

### 🗺️ Sơ đồ Luồng Tương tác Thực tế trên Web (Interface Interaction Flowchart)

```text
====================================================================================================
                        🕵️ SƠ ĐỒ LUỒNG ĐIỀU TRA GAME TRINH THÁM (CASE #000)
====================================================================================================

 [📱 GIAI ĐOẠN 0: DẪN TRUYỆN BAN ĐẦU & TRUY TÌM 3 SĐT ẨN DANH]
  │
  ├── 🎙️ Monologue Giai đoạn 0 (Đêm 24/07/2016)
  ├── 📱 Mở Điện thoại Khang (dev-00) ➔ Tra Call Log thấy 3 SĐT ẩn danh
  ├── 🔍 Đối chiếu: Sổ ghi nợ Khang (Vật chứng 10) & Bảng tin rao vặt (Vật chứng 11)
  ├── 📝 Nhập dữ liệu 3 ô:
  │    ├─ Ô 1 (SĐT 0988.20.09.91) ➔ Lê Quang Vũ
  │    ├─ Ô 2 (SĐT 0984.180.357) ➔ Nguyễn Thanh Tùng
  │    └─ Ô 3 (SĐT 0912.331.888) ➔ Đạt Gà Chợ Cảng
  └── 🔘 Click: [GỬI CĂN CỨ VÀ NỘP BÁO CÁO ➔]
        │
        ▼ (Con dấu đỏ ★ ĐÃ PHÊ DUYỆT ★ ➔ Bóc niêm phong tệp PHASE 1)
  ┌──────────────────────────────────────────────────────────────────────────────────┐
  │ 🔍 GIAI ĐOẠN 1: THẨM TRA SONG SONG CÁC NGHI PHẠM (PHASE 1)                      │
  └─────────────────────────────────────────┬────────────────────────────────────────┘
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
  [BRANCH A: THẨM TRA LÊ QUANG VŨ]                          [BRANCH B: THẨM TRA NGUYỄN THANH TÙNG]
   │                                                         │
   ├─ 📖 Đọc: Lời khai Vũ (07b) & App xe (p10)               ├─ 📖 Đọc: Lời khai Tùng (14), Ảnh vỡ (p4), Báo (p5)
   ├─ ✍️ Nhập tên: Lê Quang Vũ                              ├─ ✍️ Nhập tên: Nguyễn Thanh Tùng
   ├─ 🧩 Tick Chips vật chứng:                              ├─ 🧩 Tick Chips vật chứng:
   │    • Sổ nợ Khang (10)                                   │    • Lời khai Tùng (14)
   │    • Tin nhắn SMS (dev-00)                              │    • Vân tay trên khung ảnh (p4)
   │    • Ảnh chụp Vũ (p6)                                   │    • Mảnh báo cũ 1996 (p5)
   │    • Lời khai bà Lụa (06)                               │    • Ảnh kỷ niệm 2 anh em 1996 (p4)
   │    • App đặt xe (p10)                                   │
   ├─ 🔘 Click: [GỬI CĂN CỨ VÀ NỘP BÁO CÁO ➔]              ├─ 🔘 Click: [GỬI CĂN CỨ VÀ NỘP BÁO CÁO ➔]
   │                                                         │
   ▼                                                         ▼
  (Mở khóa Sổ Quán Bia 06 ➔ Minh oan cho Vũ)                (Mở khóa Thẻ Tự Thú 01 ➔ Bế tắc 1 chiều)
   └────────────────────────────┬────────────────────────────┘
                                │
                                ▼
 [🔑 NÚT HỘI TỤ: LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG (cp-000-convergence)]
  │
  ├── 📋 Chọn 3 lý do loại trừ nghi phạm ban đầu:
  │    ├─ 1. Nguyễn Ngọc Mai: Xem TV bị đứt cáp quang lúc 20:10 (Bảng tin 18)
  │    ├─ 2. Lê Quang Vũ: Hóa đơn chuyển khoản 195k tại Quán Bia 88 lúc 21:15 (Sổ 06)
  │    └─ 3. Nguyễn Thanh Tùng: Tự thú xô ngã 20:00 rồi bỏ đi 20:15 (Án mạng ~21:00)
  ├── 🏷️ Thao tác vật lý: Lấy Thẻ cứng [LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG] trong hộp game
  └── 📱 Thao tác Web: Click [QUÉT MÃ QR KHÁM XÉT] hoặc nhập chuỗi `REINVESTIGATE-CASE00`
        │
        ▼ (Bóc Phong bì niêm phong KẾT QUẢ KHÁM XÉT - TẬP C)
 [🔴 GIAI ĐOẠN 2: BÓC TRẦN THỦ PHẠM TRẦN THỊ HÀ (cp-000-2a)]
  │
  ├── 🎙️ Monologue Giai đoạn 2 (Chiều 25/07/2016)
  ├── 🔊 Thao tác Web: Phát Voicemail 20:32 trên dev-00 ➔ Nghe thấy tiếng còi tàu D19E
  ├── 📝 Nhập liệu Form cp-000-2a:
  │    ├─ Đối tượng tình nghi: Trần Thị Hà
  │    ├─ Chọn mâu thuẫn: 📍 Mâu thuẫn Địa điểm (Khai ở phòng trọ nhưng ở trước cổng)
  │    └─ Chọn tài liệu bẻ gãy: Voice 20:32 (lọt còi tàu) + Lịch phát sóng VTV3 (Gameshow)
  └── 🔘 Click: [GỬI CĂN CỨ VÀ NỘP BÁO CÁO ➔]
        │
        ▼
 [⚖️ GIAI ĐOẠN 3: BẢN CÁO TRẠNG ĐỊNH TỘI & KẾT ÁN (cp-000-2b)]
  │
  ├── 🎙️ Monologue Giai đoạn 3 (Đêm 25/07/2016)
  ├── 📝 Nhập liệu Form BẢN CÁO TRẠNG ĐỊNH TỘI CHUYÊN ÁN #000:
  │    ├─ Thủ phạm chính: Trần Thị Hà
  │    ├─ Động cơ gây án: Cuồng yêu, ghen tuông bệnh hoạn khi biết Khang định bỏ trốn
  │    └─ Chứng cứ buộc tội: Lọn tóc dính máu (DNA) + Áo gió dính phấn hoa xoan
  └── 🔘 Click: [GỬI BẢN CÁO TRẠNG & TUYÊN ÁN ➔]
        │
        ▼
 [🏆 KẾT ÁN THÀNH CÔNG & MỞ KHÓA KÝ SỰ HẬU ÁN (EPILOGUE)]
  ├── 🏁 Hiển thị Banner Đã Khóa Án & Nút [📖 ĐỌC KÝ SỰ HẬU ÁN (EPILOGUE)]
  └── 📖 Mở Modal Ký sự hậu án gồm 4 chương bi kịch (Tùng - Hà - Vũ - Mai)
====================================================================================================
```

---

## 📖 II. DẪN TRUYỆN & TOÀN BỘ NGUYÊN VĂN NARRATIVE TEXTS TRONG GAME

Dưới đây là danh sách **100% toàn bộ các đoạn văn bản dẫn truyện (Lời thoại độc thoại dẫn chuyện), Thông báo Hệ thống và Ký sự Hậu án** xuất hiện trong ứng dụng Web của Vụ án #000:

### 📋 Bảng Đối Chiếu Các Lần Nộp Báo Cáo & Văn Bản Dẫn Truyện Kích Hoạt

| STT | Lần Nộp Báo Cáo Kết Luận | Văn Bản / Phản Hồi Hiển Thị Trên Màn Hình Web |
| :--- | :--- | :--- |
| **0** | **Bắt đầu chuyên án** | 🎙️ **Đoạn dẫn truyện Giai đoạn 0** (Đêm 24/07/2016) |
| **1** | Nộp đúng danh tính 3 SĐT ẩn danh | 🎙️ **Đoạn dẫn truyện Giai đoạn 1** (Sáng 25/07/2016) |
| **2** | Nộp đúng hồ sơ Thẩm tra Nghi phạm 1 | 💬 Thông báo hệ thống (Chuyển tiếp sang thẩm tra nghi phạm thứ 2) |
| **3** | Nộp đúng hồ sơ Thẩm tra Nghi phạm 2 | 💬 Thông báo hệ thống (Mở Thẻ Lệnh khám xét - Nút Hội Tụ) |
| **4** | Nộp đúng Nút Hội Tụ loại trừ nghi phạm | 🎙️ **Đoạn dẫn truyện Giai đoạn 2** (Chiều 25/07/2016) |
| **5** | Nộp đúng mâu thuẫn bóc trần Hà | 🎙️ **Đoạn dẫn truyện Giai đoạn 3** (Đêm 25/07/2016 - Bản Cáo Trạng) |
| **6** | Nộp đúng Bản Cáo Trạng & Kết án | 🏁 **Thông báo kết án thành công** |

---

### 1. Văn bản Dẫn truyện các Giai đoạn

#### 🎙️ Giai đoạn 0 — Đêm 24/07/2016:
> *"Căn nhà cũ số 14 Đường Bờ Sông chìm trong bóng tối...*  
> *Chỉ có mùi máu bốc lên và ấm trà vỡ vụn dưới sàn phòng khách...*  
>  
> *Nạn nhân Khang đã gục xuống. Tiếng bước chân lẩn khuất ngoài ngõ vắng vừa biến mất.*  
>  
> *Hung thủ đã kịp trốn vào màn đêm. Tội ác giờ đây đang bị ẩn giấu đằng sau những manh mối ngổn ngang.*  
>  
> *Trò chơi trốn tìm sinh tử chính thức bắt đầu - và bạn chính là người đi tìm sự thật."*

#### 🎙️ Giai đoạn 1 — Sáng 25/07/2016:
> *"Manh mối thu thập từ điện thoại nạn nhân đã mở ra những dấu vết đầu tiên.*  
> *Từ những khoản nợ mờ ám cho đến mối ân oán kéo dài nhiều năm, các đối tượng liên quan dần lộ diện với những lời khai đầy mâu thuẫn.*  
> *Đã đến lúc tiến hành thẩm tra trực diện các đối tượng tình nghi để bóc tách mâu thuẫn ngoại phạm và tìm ra ngọn nguồn sự thật..."*

#### 🎙️ Giai đoạn 2 — Chiều 25/07/2016:
> *"Cả 3 nghi phạm ban đầu đều có căn cứ loại trừ khỏi thời điểm gây án chí mạng lúc ~21:00. Vụ án tưởng chừng đi vào ngõ tàng, nhưng hiện trường vẫn còn những vật chứng bị bỏ sót.*  
> *Lệnh khám xét bổ sung đã được phê duyệt. Những chi tiết kỹ thuật từ âm thanh thu âm cho đến mốc thời gian sinh hoạt sẽ là chìa khóa bóc trần vỏ bọc ngoại phạm thực sự..."*

#### 🎙️ Giai đoạn 3 — Đêm 25/07/2016 (Bản Cáo Trạng):
> *"Mọi lời khai giả mạo đã sụp đổ trước dữ liệu giám định thực tế. Mối quan hệ phức tạp và động cơ ẩn giấu đằng sau vụ án mạng đêm mưa giờ đây đã hoàn toàn phát lộ.*  
> *Đã đến lúc lập Bản Cáo Trạng Định Tội chính thức, chỉ danh thủ phạm và khép lại hồ sơ chuyên án..."*

---

### 2. Thông báo Kết quả & Phản hồi Hệ thống

- **Khi trả lời Đúng:**  
  > 🏆 *Con dấu đỏ:* `★ ĐÃ PHÊ DUYỆT ★`  
  > 💬 *Thông báo:* `"Căn cứ lập luận của bạn rất sắc bén. Lệnh khai thác thông tin & mở rộng giai đoạn điều tra tiếp theo đã được phê duyệt!"*

- **Khi trả lời Sai:**  
  > ⚠️ *Thông báo:* `"Manh mối và căn cứ điều tra của bạn chưa đủ sức thuyết phục. Hãy kiểm tra lại mốc thời gian và danh mục chứng cứ!"`

- **Khi Hoàn thành Toàn bộ Vụ án:**  
  > 🏁 *Tiêu đề:* `HỒ SƠ KHÓA ÁN // ĐÃ GIẢI MÃ TOÀN BỘ CHUYÊN ÁN #000`  
  > 📝 *Nội dung:* `"Toàn bộ mâu thuẫn mốc giờ, động cơ trục lợi và bộ vật chứng buộc tội chí mạng của chuyên án TRỐN TÌM đã được bóc tách chuẩn xác. Bạn đã bóc trần ngoại phạm giả mạo VTV3, còi tàu 20:32 và lọn tóc mai dính máu ADN của bị can Trần Thị Hà."`

---

## 💡 III. CƠ CHẾ GỢI Ý ĐỘNG VÀ NHẬN DIỆN MỤC TIÊU ĐIỀU TRA

### 1. Cơ chế Nhận diện Ý định Người chơi (Vũ vs Tùng)

Ở Giai đoạn 1 (Phase 1), tiến trình điều tra mang tính chất mở. Người chơi có thể tự do chọn thẩm tra **Lê Quang Vũ (Tuyến A)** hoặc **Nguyễn Thanh Tùng (Tuyến B)** trước.

Để hệ thống Web đưa ra đúng bộ gợi ý tương ứng mà không làm lộ trước đáp án của tuyến còn lại, hệ thống áp dụng **2 quy tắc nhận diện ý định** theo thứ tự ưu tiên:

```text
 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                   2 QUY TẮC NHẬN DIỆN MỤC TIÊU NGHI PHẠM (VŨ VS TÙNG)            │
 ├───────────────────────────────────────────────────────────────────────────────────┤
 │ 1. 🔤 Nhận diện theo Ô Nhập Tên Nghi Phạm — Ưu tiên cao nhất                      │
 │ 2. 🔄 Tự động Đảo Mục Tiêu khi xong 1 Nhánh                                      │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

#### 🔤 Quy tắc 1 — Theo từ khóa gõ vào Ô Tên Nghi Phạm:
- **Phát hiện hướng đến Lê Quang Vũ:** Khi ô nhập tên chứa một trong các từ khóa: `Vũ`, `vũ`, `Lê Quang Vũ`, `le quang vu`, `VŨ`.
  - ➔ **Kích hoạt Bộ Gợi Ý Tuyến A (Vũ):** Định hướng người chơi tìm mâu thuẫn mốc giờ 19:30 và chọn 5 tài liệu chứng cứ (`Sổ nợ 10`, `Tin nhắn SMS`, `Ảnh Vũ`, `Lời khai bà Lụa`, `App đặt xe`).
- **Phát hiện hướng đến Nguyễn Thanh Tùng:** Khi ô nhập tên chứa một trong các từ khóa: `Tùng`, `tùng`, `Nguyễn Thanh Tùng`, `nguyen thanh tung`, `TÙNG`.
  - ➔ **Kích hoạt Bộ Gợi Ý Tuyến B (Tùng):** Định hướng người chơi tìm vân tay trên khung ảnh vỡ `p4` và chọn 4 tài liệu chứng cứ (`Lời khai Tùng 14`, `Vân tay p4`, `Mảnh báo cũ p5`, `Ảnh 1996 p4`).
- **Trường hợp nhập tên đối tượng khác (không thuộc Vũ hay Tùng):**
  - ➔ **Hiển thị phản hồi mặc định:** *"Tôi không thấy đối tượng này có gì khả nghi cả..."*
- **Trường hợp chưa nhập tên nghi phạm:**
  - ➔ **Hiển thị phản hồi mặc định:** *"Bạn chưa điền tên đối tượng tình nghi nào vào ô thẩm tra cả..."*
- **🔄 Cơ chế Động khi Sửa/Xóa Tên Nghi Phạm:**
  - Hệ thống luôn đọc và re-evaluate theo **văn bản hiện tại trong ô nhập tên ngay tại thời điểm người chơi bấm nút `💡 Gợi ý`**. 
  - *Ví dụ:* Người chơi từng nhập "Vũ" và xem gợi ý Tuyến A, sau đó xóa đi đổi thành "Tùng" ➔ Bấm nút `💡 Gợi ý` hệ thống sẽ tự động cập nhật và đưa ra gợi ý của Tuyến B (Tùng) mà không bị lưu giữ gợi ý cũ. Nếu xóa trắng ô tên, hệ thống lại báo chưa điền tên.

#### 🔄 Quy tắc 2 — Tự động Chuyển Mục Tiêu ở Bước 2:
- Khi người chơi đã hoàn thành thẩm tra xong 1 nghi phạm (Ví dụ đã xong Tuyến Vũ):
  - ➔ Hệ thống tự động khóa mục tiêu còn lại = **`NGUYỄN THANH TÙNG`**. Khi người chơi bấm nút `💡 Gợi ý` ở bước thứ 2, hệ thống sẽ đưa thẳng bộ gợi ý bóc trần Nguyễn Thanh Tùng mà không cần chờ phân tích ý định nữa.

---

### 2. Quy tắc Gợi ý Từng Phần theo Tiến Trình Game

Mỗi Thẻ câu hỏi đều tích hợp **3 cấp độ gợi ý lũy tiến**. Người chơi bấm nút `💡 Gợi ý` trên thanh công cụ để mở từng cấp độ:

#### 📋 Giai đoạn 0 — Truy tìm danh tính 3 SĐT ẩn danh:
- **Gợi ý Cấp 1:** *"Hãy đối chiếu danh bạ/nhật ký cuộc gọi trong Điện thoại Khang với Sổ ghi nợ và Bảng tin rao vặt."*
- **Gợi ý Cấp 2:** *"Số `0988...` khớp với biệt danh con nợ trong Sổ nợ 10, còn số `0984...` nằm trên tin đăng đục phá bê tông ở Bảng tin 11."*
- **Gợi ý Cấp 3 (Đáp án):** *"Nhập 3 tên nghi phạm vào 3 ô: Ô 1: `Lê Quang Vũ` | Ô 2: `Nguyễn Thanh Tùng` | Ô 3: `Đạt Gà Chợ Cảng`."*

#### 🔀 Giai đoạn 1 — Thẩm tra Lê Quang Vũ (Tuyến A):
- **Gợi ý Cấp 1:** *"Hãy so sánh mốc thời gian Vũ khai rời đi với lịch sử di chuyển trên App đặt xe và lời khai hàng xóm."*
- **Gợi ý Cấp 2:** *"Vũ khai về lúc 19:00 cùng vợ, nhưng App đặt xe (p10) ghi nhận chuyến xe đón Vũ lúc 19:30 tại đầu ngõ."*
- **Gợi ý Cấp 3 (Đáp án):** *"Tích chọn đúng 5 chips vật chứng: `10`, `dev-00`, `p6`, `06/11`, `p10` rồi bấm Gửi báo cáo."*

#### 🔀 Giai đoạn 1 — Thẩm tra Nguyễn Thanh Tùng (Tuyến B):
- **Gợi ý Cấp 1:** *"Tùng khai chỉ gọi điện trao đổi, nhưng dấu vết vật lý tại hiện trường phòng khách lại nói lên điều ngược lại."*
- **Gợi ý Cấp 2:** *"Đối chiếu vết vân tay trên Khung ảnh vỡ (p4) với Bài báo cũ 1996 (p5) về bi kịch 12 năm trước."*
- **Gợi ý Cấp 3 (Đáp án):** *"Tích chọn đúng 4 chips vật chứng: `14`, `p4 (vân tay)`, `p5`, `p4 (ảnh 1996)` rồi bấm Gửi báo cáo."*

#### 🔑 Giai đoạn 1.5 — Nút Hội Tụ Loại Trừ Nghi Phạm:
- **Gợi ý Cấp 1:** *"Xem xét mốc thời gian xảy ra án mạng (~21:00) để tìm lý do ngoại phạm của từng nghi phạm (Mai, Vũ, Tùng)."*
- **Gợi ý Cấp 2:** *"Mai mất mạng TV lúc 20:10, Vũ có hóa đơn Quán Bia 88 lúc 21:15, Tùng đã bỏ đi sau khi xô ngã Khang lúc 20:15."*
- **Gợi ý Cấp 3 (Đáp án):** *"Tích chọn 3 lý do loại trừ, lấy Thẻ cứng Lệnh khám xét lại hiện trường và nhập mã `REINVESTIGATE-CASE00`."*

#### 🔴 Giai đoạn 2 — Bóc trần Thủ phạm Trần Thị Hà:
- **Gợi ý Cấp 1:** *"Chú ý đến âm thanh nền lọt vào đoạn Voicemail 20:32 và lịch sinh hoạt truyền hình thực tế của Hà."*
- **Gợi ý Cấp 2:** *"Tiếng còi tàu D19E chạy qua ngõ lúc 20:30 tố cáo Hà đang ở trước cổng nhà Khang chứ không phải ở phòng trọ xem phim."*
- **Gợi ý Cấp 3 (Đáp án):** *"Chọn Mâu thuẫn Địa điểm, tích 2 chứng cứ bẻ gãy: Voicemail 20:32 + Lịch VTV3 rồi bấm Gửi báo cáo."*

#### ⚖️ Giai đoạn 3 — Bản Cáo Trạng Định Tội & Kết Án:
- **Gợi ý Cấp 1:** *"Xem xét động cơ ghen tuông chiếm hữu và các dấu vết sinh học/vật lý để lại tại hiện trường."*
- **Gợi ý Cấp 2:** *"Động cơ xuất phát từ việc phát hiện Khang định bỏ trốn; chứng cứ chí mạng liên quan đến mẫu ADN tóc và phấn hoa."*
- **Gợi ý Cấp 3 (Đáp án):** *"Chọn Động cơ ghen tuông, tích 2 chứng cứ buộc tội: Lọn tóc dính máu (ADN) + Áo gió dính phấn hoa xoan rồi bấm Gửi Bản Cáo Trạng."*


