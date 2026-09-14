# 🕵️ HỒ SƠ TÀI LIỆU LUỒNG NGƯỜI CHƠI, ĐOẠN DẪN TRUYỆN & CÁC KỊCH BẢN TƯƠNG TÁC

---

## 📱 I. CHI TIẾT GIAO DIỆN WEB THỰC TẾ & LUỒNG THAO TÁC CỦA NGƯỜI CHƠI (ACTUAL WEB UI FLOW)

### 🗺️ Sơ đồ Luồng Tương tác Thực tế trên Web (Interface Interaction Flowchart)

```text
 [1. GIAI ĐOẠN 0: DẪN TRUYỆN BAN ĐẦU & TRUY TÌM DANH TÍNH 3 SĐT ẨN DANH (CHẾ ĐỘ 🎲 ĐỒNG HÀNH CÙNG BOARD GAME)]
  │
  ├─► Dẫn truyện: Màn hình hiển thị Typewriter Monologue Giai đoạn 0 (Đêm 24/07/2016)
  ├─► Thấy UI trên Web:
  │    • Thẻ câu hỏi `CaseCheckpointsSection` hiển thị trực tiếp trên màn hình (dành riêng cho Board Game Companion)
  │    • Menu Quick Action FAB góc dưới bên phải (Nút tròn 📱/🔍/🔑/💡)
  │    • Điện thoại giả lập Khang (`dev-00`): Mở app Call Log ➔ Thấy 3 SĐT ẩn danh
  ├─► Đọc vật lý: Tra `Sổ ghi nợ Khang (Vật chứng 10)` & `Bảng tin rao vặt (Vật chứng 11)`
  ├─► Nhập dữ liệu trực tiếp vào 3 ô Text Input trên Thẻ câu hỏi:
  │    • Ô 1 (`SĐT 0988.20.09.91:`): Nhập `Lê Quang Vũ` (hoặc `Vũ`)
  │    • Ô 2 (`SĐT 0984.180.357:`): Nhập `Nguyễn Thanh Tùng` (hoặc `Tùng`)
  │    • Ô 3 (`SĐT 0912.331.888:`): Nhập `Đạt Gà Chợ Cảng` (hoặc `Đạt Gà`)
  ├─► Ấn: Click button [GỬI CĂN CỨ VÀ NỘP BÁO CÁO ➔] tại chân thẻ câu hỏi
  │
  ▼
 [2. MỞ KHÓA TẬP HỒ SƠ PHASE 1 (NHÁNH ĐIỀU TRA SONG SONG `cp-000-1a` & `cp-000-1b`)]
  │
  ├─► Web phản hồi: Hiện con dấu đỏ `★ ĐÃ PHÊ DUYỆT ★` + Mở Typewriter Monologue Giai đoạn 1
  ├─► Thao tác vật lý: Người chơi bóc niêm phong tệp giấy [PHASE 1]
  ├─► Thấy UI: Thẻ câu hỏi chuyển sang dạng `evidence_picker` (Cho phép chọn thẩm tra Vũ hoặc Tùng trước)
  │
  ├─────────────────────────────────────────┐
  ▼                                         ▼
 [BRANCH A: THẨM TRA LÊ QUANG VŨ]         [BRANCH B: THẨM TRA NGUYỄN THANH TÙNG]
  │                                         │
  ├─► Đọc: Lời khai Vũ `07b` & App xe `p10` ├─► Đọc: Lời khai Tùng `14`, Ảnh vỡ `p4`, Mẩu báo `p5`
  ├─► Nhập tên: `Lê Quang Vũ`              ├─► Nhập tên: `Nguyễn Thanh Tùng`
  ├─► Chọn Chips vật chứng:                ├─► Chọn Chips vật chứng:
  │    `Sổ nợ 10`, `SMS dev-00`, `Ảnh p6`,  │    `Lời khai 14`, `Vân tay p4`,
  │    `Lời khai Lụa 06`, `App đặt xe p10`  │    `Mảnh báo p5`, `Ảnh 1996 p4`
  ├─► Ấn: [GỬI CĂN CỨ VÀ NỘP BÁO CÁO ➔]      ├─► Ấn: [GỬI CĂN CỨ VÀ NỘP BÁO CÁO ➔]
  ├─► Kết quả: Mở khóa Sổ Quán Bia `06`     ├─► Kết quả: Mở khóa Thẻ Tự Thú `01`
  ├─► Trạng thái: Minh oan cho Vũ           ├─► Trạng thái: Bế tắc 1 chiều
  └─────────────────┬───────────────────────┘
                    │
                    ▼
 [5. NÚT HỘI TỤ: LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG (`cp-000-convergence`)]
  │
  ├─► ĐIỀU KIỆN: Đã hoàn thành CẢ 2 nhánh thẩm tra Vũ và Tùng!
  ├─► Thấy UI: Form Nút Hội Tụ hiển thị 3 nhóm lý do loại trừ nghi phạm:
  │    1. Nguyễn Ngọc Mai: Chọn `Ngoại phạm xem TV bị đứt cáp 20:10`
  │    2. Lê Quang Vũ: Chọn `Chuyển khoản 195k tại Quán Bia 88 lúc 21:15`
  │    3. Nguyễn Thanh Tùng: Chọn `Tự thú xô ngã 20:00 rồi bỏ đi 20:15 (Án mạng đâm cổ lúc ~21:00)`
  ├─► Thao tác vật lý: Lấy Thẻ cứng [LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG] trong hộp game
  ├─► Thao tác Web: Click button [QUÉT MÃ QR KHÁM XÉT] hoặc nhập chuỗi `REINVESTIGATE-CASE00`
  │
  ▼
 [6. GIAI ĐOẠN 2: BÓC TRẦN THỦ PHẠM TRẦN THỊ HÀ (`cp-000-2a`)]
  │
  ├─► Dẫn truyện: Màn hình hiển thị Typewriter Monologue Giai đoạn 2 (Chiều 25/07/2016)
  ├─► Thao tác vật lý: Mở Phong bì niêm phong [KẾT QUẢ KHÁM XÉT - TẬP C]
  ├─► Thao tác Web: Phát file `Voicemail 20:32` trên điện thoại `dev-00` ➔ Nghe rõ tiếng còi tàu D19E
  ├─► Nhập liệu Form `cp-000-2a`:
  │    • Ô Đối tượng tình nghi: Nhập `Trần Thị Hà` (hoặc `Hà`)
  │    • Ô Chọn loại mâu thuẫn: Chọn `📍 Mâu thuẫn Địa điểm (Khai ở phòng trọ nhưng thực chất có mặt trước cổng)`
  │    • Ô Chọn tài liệu bẻ gãy: Chọn `Voice 20:32 (lọt còi tàu)` + `Lịch VTV3 (Gameshow)`
  ├─► Ấn: Click button [GỬI CĂN CỨ VÀ NỘP BÁO CÁO ➔]
  │
  ▼
 [7. GIAI ĐOẠN 3: BẢN CÁO TRẠNG ĐỊNH TỘI & KẾT ÁN (`cp-000-2b`)]
  │
  ├─► Dẫn truyện: Typewriter Monologue Giai đoạn 3 (Đêm 25/07/2016)
  ├─► Thấy UI: Form BẢN CÁO TRẠNG ĐỊNH TỘI CHUYÊN ÁN #000
  ├─► Nhập liệu Form `cp-000-2b`:
  │    • Chỉ danh thủ phạm chính: Nhập `Trần Thị Hà` (hoặc `Hà`)
  │    • Xác định động cơ gây án: Chọn `Cuồng yêu, ghen tuông bệnh hoạn khi mở điện thoại phát hiện Khang chuẩn bị tiền bỏ trốn với bồ mới`
  │    • Chọn chứng cứ buộc tội: Chọn `Lọn tóc mai dính máu (EV-HAIR-DNA)` + `Áo gió dính phấn hoa xoan`
  ├─► Ấn: Click button [GỬI BẢN CÁO TRẠNG & TUYÊN ÁN ➔]
  │
  ▼
 [8. KẾT ÁN THÀNH CÔNG & MỞ KHÓA ĐỌC KÝ SỰ HẬU ÁN (EPILOGUE)]
  ├─► Web UI: Hiển thị Banner Đã Khóa Án + Nút [📖 ĐỌC KÝ SỰ HẬU ÁN (EPILOGUE)]
  └─► Mở Modal Ký sự hậu án gồm 4 chương câu chuyện sâu sắc của các nhân vật.
```

---

## 📖 II. DẪN TRUYỆN & TOÀN BỘ NGUYÊN VĂN NARRATIVE TEXTS TRONG GAME

Dưới đây là danh sách **100% toàn bộ các đoạn văn bản dẫn truyện (Narrator Monologues), Thông báo Hệ thống và Ký sự Hậu án** xuất hiện trong ứng dụng Web của Vụ án #000:

### 1. Văn bản Dẫn truyện các Giai đoạn (`CASE_000_NARRATOR`)

#### 🎙️ Giai đoạn 0 — Đêm 24/07/2016:
> *"Căn nhà cũ số 14 Đường Bờ Sông chìm trong bóng tối tịch mịch.*  
> *Mùi trà hoa cúc quyện lẫn vị máu tanh nồng bốc lên từ bộ bình thủy tinh vỡ vụn dưới sàn phòng khách...*  
> *Tiếng bước chân lẩn khuất ngoài ngõ vắng vừa biến mất. Nạn nhân Khang gục xuống, nhưng sự thật dường như vẫn còn bị phong ấn..."*

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

### 2. Văn bản 4 Chương Ký sự Hậu án (`EPILOGUE_STORIES`)

#### 📻 Chương 1: 1998 — Bi Kịch Trốn Tìm (Nguyễn Thanh Tùng & Chiếc còi đồng im lìm)
> *"Trò chơi trốn tìm 12 năm trước chưa bao giờ thực sự kết thúc...*  
>  
> *Khang từ nhỏ đã bốc đồng và ganh tị với tình bạn giữa Tùng và Gia Huy. Ngày hôm đó năm 1998, Khang cố tình gài chốt gỗ nhốt Gia Huy (cậu bé câm bẩm sinh, mắc bệnh tim) vào tủ rồi bỏ đi chơi. Gia Huy hoảng sợ đập tủ trong vô vọng rồi phát bệnh tử vong.*  
>  
> *Suốt 12 năm qua, Tùng sống dằn dặt trong nỗi tự trách vì đã không tìm thấy em trai. Cho đến hai hôm trước đêm án mạng, trong cơn say ngà ngà tại bàn nhậu, Khang vô tình buông lời đùa cợt khoe 'chiến tích' gài chốt nhốt tủ năm xưa. Tùng bàng hoàng nhận ra sự thật đau đớn.*  
>  
> *Đêm 24/07/2016, Tùng mang bài báo cũ và bức ảnh 2 anh em sang nhà Khang chất vấn. Khang thờ ơ xé nát bài báo thách thức khiến Tùng bùng nổ cơn thịnh nộ. Cú xô ngã trong lúc giằng co chỉ làm Khang bất tỉnh tạm thời...*  
>  
> *Trò chơi trốn tìm năm 1998 cuối cùng đã khép lại bằng một tấn bi kịch kéo dài suốt hai thế hệ."*

#### 💔 Chương 2: Hà — Ký Sự Biệt Giam (Trần Thị Hà — Linh hồn điên dại vì tình)
> *" 'Trò chơi trốn tìm năm 1998 đã chôn vùi một đứa trẻ...*  
> *Còn trò trốn tìm năm 2016 đã giam cầm một linh hồn điên dại.*  
> *Khang ơi, anh trốn đi đâu được nữa?*  
> *Máu của anh đang ở trên môi em...'*  
>  
> *Ngồi trong phòng biệt giam số 4, hai bàn tay bị còng chặt vào thanh sắt, ánh mắt Hà không hề có chút ăn năn. Hà ngửa đầu nhìn lên ô thông gió nhỏ xíu trên cao, nơi ánh trăng lạnh lẽo hắt vào tường bê tông xám xịt và lẩm bẩm hát lại bài đồng dao thuở nhỏ.*  
>  
> *Với một kẻ mang tâm lý ái kỷ chiếm hữu bệnh hoạn, cái chết của Khang không phải là sự kết thúc, mà là sự 'bảo quản vĩnh cửu' cho một tình yêu lệch lạc. Hà đã biến người mình yêu thành một bức tượng bất tử không bao giờ có thể phản bội hay rời xa mình.*  
>  
> *Nhưng cái giá phải trả là bản án nghiêm khắc của pháp luật và một linh hồn vĩnh viễn mục rữa sau song sắt nhà tù..."*

#### 🛡️ Chương 3: Vũ — Gánh Nặng Sĩ Diện (Lê Quang Vũ — Chuỗi sai lầm nối tiếp)
> *"Vũ là người chồng sĩ diện nhưng bất lực. Nhìn gia đình nhà vợ (Mai) coi thường, Vũ sa lầy vào bốc họ 350M từ Khang để xoay xở làm ăn rồi dính bẫy lãi mẹ đẻ lãi con.*  
>  
> *Bị Khang dùng giấy nợ đe dọa ép làm giả bản vẽ đo đạc từ 75m2 lên 120m2 và dọa tung chuyện cho Mai biết, Vũ sống trong sợ hãi tột cùng. Đêm 24/07, Vũ giả vờ cho vợ về trước để lén chui cửa sau tìm giấy nợ tiêu hủy.*  
>  
> *Vũ không trực tiếp ra tay đâm người, nhưng sự lén lút và gian dối của Vũ đã vô tình đẩy chuỗi sự kiện đêm đó vào kịch bản án mạng đẫm máu."*

#### ⚖️ Chương 4: Mai — Lời Tạ Tội Muộn Màng (Nguyễn Ngọc Mai — Di chúc của ông nội)
> *"Mai luôn nghi ngờ Khang cướp di chúc, nhưng khi cầm bản di chúc gốc đến văn phòng luật sư, Mai mới bàng hoàng biết ông nội vốn đã chia đều căn nhà cho cả 2 anh em từ năm 2018.*  
>  
> *Khang vì lòng tham đã dùng hóa chất tẩy tên Mai để chiếm trọn khoản tiền đền bù. Sự tham lam của Khang và sự nghi hận của Mai đã phá nát tình anh em ruột thịt.*  
>  
> *Mai nhận lại mảnh đất đền bù nhưng mất đi người anh họ và đối mặt với người chồng (Vũ) đang vướng vào vòng lao lý vì gian lận đo đạc địa chính."*

---

### 3. Thông báo Kết quả & Phản hồi Hệ thống (System Toast & Modal Messages)

- **Khi trả lời Đúng:**  
  > 🏆 *Con dấu đỏ:* `★ ĐÃ PHÊ DUYỆT ★`  
  > 💬 *Thông báo:* `"Căn cứ lập luận của bạn rất sắc bén. Lệnh khai thác thông tin & mở rộng giai đoạn điều tra tiếp theo đã được phê duyệt!"*

- **Khi trả lời Sai:**  
  > ⚠️ *Thông báo:* `"Manh mối và căn cứ điều tra của bạn chưa đủ sức thuyết phục. Hãy kiểm tra lại mốc thời gian và danh mục chứng cứ!"`

- **Khi Hoàn thành Toàn bộ Vụ án (IsAllCompleted Callout):**  
  > 🏁 *Header:* `HỒ SƠ KHÓA ÁN // ĐÃ GIẢI MÃ TOÀN BỘ CHUYÊN ÁN #000`  
  > 📝 *Nội dung:* `"Toàn bộ mâu thuẫn mốc giờ, động cơ trục lợi và bộ vật chứng buộc tội chí mạng của chuyên án TRỐN TÌM đã được bóc tách chuẩn xác. Bạn đã bóc trần ngoại phạm giả mạo VTV3, còi tàu 20:32 và lọn tóc mai dính máu ADN của bị can Trần Thị Hà."`

---

## 💡 III. CƠ CHẾ GỢI Ý ĐỘNG VÀ NHẬN DIỆN MỤC TIÊU ĐIỀU TRA (DYNAMIC HINT SYSTEM & INTENT DETECTION)

### 1. Cơ chế Nhận diện Ý định Người chơi (Detecting Player Intent: Vũ vs Tùng)

Ở Giai đoạn 1 (Phase 1), tiến trình điều tra mang tính chất mở (Non-linear). Người chơi có thể tự do chọn thẩm tra **Lê Quang Vũ (Tuyến A)** hoặc **Nguyễn Thanh Tùng (Tuyến B)** trước.

Để hệ thống Web đưa ra đúng bộ gợi ý tương ứng mà không làm lộ trước đáp án của tuyến còn lại, hệ thống áp dụng **3 quy tắc nhận diện ý định (Intent Detection Rules)** theo thứ tự ưu tiên:

```text
 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                   3 QUY TẮC NHẬN DIỆN MỤC TIÊU NGHI PHẠM (VŨ VS TÙNG)            │
 ├───────────────────────────────────────────────────────────────────────────────────┤
 │ 1. 🔤 Nhận diện theo Ô Nhập Tên (`suspectInput`) — Ưu tiên cao nhất                │
 │ 2. 🧩 Nhận diện theo Nhóm Vật Chứng Đang Chọn (Evidence Chip Selection)           │
 │ 3. 🔄 Tự động Đảo Mục Tiêu khi xong 1 Nhánh (Step 2 Auto-Targeting)              │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

#### 🔤 Quy tắc 1 — Theo từ khóa gõ vào Ô Tên Nghi Phạm (`suspectInput`):
- **Phát hiện hướng đến Lê Quang Vũ:** Khi `suspectInput` chứa một trong các chuỗi từ khóa: `Vũ`, `vũ`, `Lê Quang Vũ`, `le quang vu`, `VŨ`.
  - ➔ **Kích hoạt Bộ Gợi Ý Tuyến A (Vũ):** Định hướng người chơi tìm mâu thuẫn mốc giờ 19:30 và chọn 5 tài liệu chứng cứ (`doc_10_so_no`, `sms_dev00`, `p6_anh_vu`, `doc_06_loi_khai_lua`, `p10_app_xe`).
- **Phát hiện hướng đến Nguyễn Thanh Tùng:** Khi `suspectInput` chứa một trong các chuỗi từ khóa: `Tùng`, `tùng`, `Nguyễn Thanh Tùng`, `nguyen thanh tung`, `TÙNG`.
  - ➔ **Kích hoạt Bộ Gợi Ý Tuyến B (Tùng):** Định hướng người chơi tìm vân tay trên khung ảnh vỡ `p4` và chọn 4 tài liệu chứng cứ (`doc_14_loi_khai_tung`, `p4_van_tay`, `p5_manh_bao`, `p4_anh_1996`).

#### 🧩 Quy tắc 2 — Theo Nhóm Chips Vật Chứng đang được tick chọn (Fallback khi chưa gõ tên):
- Nếu người chơi để trống ô tên nhưng đã tick chọn ít nhất 1 chip vật chứng thuộc Tuyến Vũ (`doc_10_so_no`, `p10_app_xe`, `p6_anh_vu`):
  - ➔ **Hệ thống hiển thị gợi ý:** *"💡 Bạn đang tích chọn vật chứng vay nợ và app đặt xe của Lê Quang Vũ. Hãy gõ tên 'Lê Quang Vũ' vào ô nghi phạm và chọn thêm Lời khai bà Lụa (06)!"*
- Nếu người chơi tick chọn ít nhất 1 chip vật chứng thuộc Tuyến Tùng (`p4_van_tay`, `p5_manh_bao`, `p4_anh_1996`):
  - ➔ **Hệ thống hiển thị gợi ý:** *"💡 Bạn đang tích chọn vết vân tay trên khung ảnh và mảnh báo cũ 1996 của Nguyễn Thanh Tùng. Hãy gõ tên 'Nguyễn Thanh Tùng' vào ô nghi phạm!"*

#### 🔄 Quy tắc 3 — Tự động Chuyển Mục Tiêu ở Bước 2 (`cp-000-1b`):
- Khi người chơi đã hoàn thành thẩm tra xong 1 nghi phạm (Ví dụ đã xong Tuyến Vũ):
  - ➔ Hệ thống tự động khóa mục tiêu còn lại = **`NGUYỄN THANH TÙNG`**. Khi người chơi bấm nút `💡 Gợi ý` ở bước `cp-000-1b`, hệ thống sẽ đưa thẳng bộ gợi ý bóc trần Nguyễn Thanh Tùng mà không cần chờ phân tích intent nữa.

---

### 2. Quy tắc Gợi ý Từng Phần theo Tiến Trình Game (Phase-by-Phase Hint Matrix)

Mỗi Thẻ câu hỏi (Checkpoint) đều tích hợp **3 cấp độ gợi ý lũy tiến (3-Tier Progressive Hints)**. Người chơi bấm nút `💡 Gợi ý` trên Quick Action FAB để mở từng cấp độ:

#### 📋 Giai đoạn 0 — Truy tìm danh tính 3 SĐT ẩn danh (`cp-000-0`):
- **Gợi ý Cấp 1:** *"Tra cứu SĐT `0988.20.09.91` trong Sổ ghi nợ 10 (con nợ 300M biệt danh 'Lệch Pha')."*
- **Gợi ý Cấp 2:** *"Tra cứu SĐT `0984.180.357` trên Bảng tin rao vặt 11 (tin rao đục phá bê tông của thợ nề)."*
- **Gợi ý Cấp 3 (Đáp án):** *"Nhập 3 tên nghi phạm vào 3 ô: Ô 1: `Lê Quang Vũ` | Ô 2: `Nguyễn Thanh Tùng` | Ô 3: `Đạt Gà Chợ Cảng`."*

#### 🔀 Giai đoạn 1 — Thẩm tra Lê Quang Vũ (`cp-000-1a` / `1b` - Tuyến A):
- **Gợi ý Cấp 1:** *"Nhập tên nghi phạm là `Lê Quang Vũ` (hoặc `Vũ`). Mâu thuẫn rời đi: Khai rời đi 19:00 cùng vợ nhưng App xe p10 đón lúc 19:30."*
- **Gợi ý Cấp 2:** *"Chọn đúng 5 tài liệu: Sổ nợ 10 + SMS dev-00 + Ảnh Vũ p6 + Lời khai bà Lụa (06/11) + App đặt xe p10."*
- **Gợi ý Cấp 3 (Đáp án):** *"Nhập `Lê Quang Vũ` và tích chọn đúng 5 chips: `10`, `dev-00`, `p6`, `06/11`, `p10` rồi bấm Gửi báo cáo."*

#### 🔀 Giai đoạn 1 — Thẩm tra Nguyễn Thanh Tùng (`cp-000-1a` / `1b` - Tuyến B):
- **Gợi ý Cấp 1:** *"Nhập tên nghi phạm là `Nguyễn Thanh Tùng` (hoặc `Tùng`). Tùng khai chỉ gọi điện nhưng có vết vân tay trên khung ảnh vỡ p4."*
- **Gợi ý Cấp 2:** *"Chọn đúng 4 tài liệu: Lời khai Tùng 14 + Vân tay p4 + Mảnh báo cũ 1996 p5 + Ảnh kỷ niệm 1996 p4."*
- **Gợi ý Cấp 3 (Đáp án):** *"Nhập `Nguyễn Thanh Tùng` và tích chọn đúng 4 chips: `14`, `p4 (vân tay)`, `p5`, `p4 (ảnh 1996)` rồi bấm Gửi báo cáo."*

#### 🔑 Giai đoạn 1.5 — Nút Hội Tụ Loại Trừ Nghi Phạm (`cp-000-convergence`):
- **Gợi ý Cấp 1:** *"Mai ở nhà xem TV bị đứt cáp quang lúc 20:10 (Lời khai Mai 12 + Bảng tin 18)."*
- **Gợi ý Cấp 2:** *"Vũ có hóa đơn chuyển khoản 195k tại Quán Bia 88 lúc 21:15 cách hiện trường 3.8km (Sổ Quán Bia 06)."*
- **Gợi ý Cấp 3 (Đáp án):** *"Tùng tự thú xô ngã Khang lúc 20:00 rồi bỏ chạy 20:15 khi Khang chưa bị đâm. Lấy Thẻ cứng Lệnh khám xét lại hiện trường và nhập mã `REINVESTIGATE-CASE00`."*

#### 🔴 Giai đoạn 2 — Bóc trần Thủ phạm Trần Thị Hà (`cp-000-2a`):
- **Gợi ý Cấp 1:** *"Nhập tên nghi phạm là `Trần Thị Hà` (hoặc `Hà`)."*
- **Gợi ý Cấp 2:** *"Chọn loại mâu thuẫn = `📍 Mâu thuẫn Địa điểm (Khai ở phòng trọ nhưng thực chất có mặt trước cổng)`."*
- **Gợi ý Cấp 3 (Đáp án):** *"Tích chọn 2 tài liệu bẻ gãy: Voice tin nhắn 20:32 (lọt tiếng còi tàu 20:30) + Lịch phát sóng VTV3 (chỉ chiếu Gameshow, không chiếu phim bộ)."*

#### ⚖️ Giai đoạn 3 — Bản Cáo Trạng Định Tội & Kết Án (`cp-000-2b`):
- **Gợi ý Cấp 1:** *"Thủ phạm chính gây ra vết đâm đứt động mạch cảnh lúc ~21:00 là `Trần Thị Hà`."*
- **Gợi ý Cấp 2:** *"Động cơ: Chọn `Cuồng yêu, ghen tuông bệnh hoạn khi mở điện thoại phát hiện Khang chuẩn bị tiền bỏ trốn với bồ mới Thảo Vy`."*
- **Gợi ý Cấp 3 (Đáp án):** *"Tích chọn 2 chứng cứ buộc tội chí mạng: `Lọn tóc mai dính máu (EV-HAIR-DNA)` + `Áo gió màu xám đen dính phấn hoa cây xoan` rồi bấm Gửi Bản Cáo Trạng."*


