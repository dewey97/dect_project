# 🕵️ THIẾT KẾ GAMEPLAY & LUỒNG ĐIỀU TRA VỤ ÁN #000

## 🧭 I. SƠ ĐỒ LUỒNG ĐIỀU TRA & MỞ KHÓA GIAI ĐOẠN

```text
                     ┌─────────────────────────────────────────────────┐
                     │ 🔍 GIAI ĐOẠN 0: KHÁM NGHIỆM BAN ĐẦU             │
                     │    (Hiện trường phòng khách, Tử thi, Sổ nợ 10a, │
                     │     Bảng tin khu phố 18, Cuộc gọi 19:55 không tên)│
                     └────────────────────────┬────────────────────────┘
                                              │
                 ┌────────────────────────────┴────────────────────────────┐
           [LỰA CHỌN 1]                                              [LỰA CHỌN 2]
                 │                                                         │
                 ▼                                                         ▼
┌──────────────────────────────────┐                     ┌──────────────────────────────────┐
│ 🟢 TUYẾN ĐIỀU TRA A              │                     │ 🟡 TUYẾN ĐIỀU TRA B (TÙNG)       │
│   (TRẦN NGỌC MAI & VŨ)           │                     │   (Tra SĐT 19:55 ➔ Mở hồ sơ Tùng) │
├──────────────────────────────────┤                     ├──────────────────────────────────┤
│ • Mai đòi đất 19:00              │                     │ • Cấp 0: Thông tin người LQ lần 1│
│ • Vũ nợ 300M "Lệch Pha"          │                     │ • Cấp 1: Báo 20 năm + Còi cam    │
│ • Quán Bia 88 (20:45)            │                     │ • ➔ Soi vân tay Tùng trùng khớp  │
│ • ➔ Minh oan Vũ 20:45            │                     │ • Cấp 2: Trả lời đố chữ ➔ Mở     │
│   (HOÀN THÀNH TUYẾN A)           │                     │   Lời tự thú (BẾ TẮC 1 CHIỀU)    │
└────────────────┬─────────────────┘                     └────────────────┬─────────────────┘
                 │                                                        │
                 └────────────────────────────┬───────────────────────────┘
                                              │ (Yêu cầu hoàn thành CẢ Tuyến A & B)
                                              ▼
                     ┌─────────────────────────────────────────────────┐
                     │ 🔑 NÚT HỘI TỤ BẮT BUỘC (MỞ KHÓA LỆNH KHÁM XÉT)  │
                     │ ⚠️ ĐIỀU KIỆN: Vũ đã minh oan + Tùng rơi bế tắc   │
                     ├─────────────────────────────────────────────────┤
                     │ 📱 QUÉT QR THẺ CỨNG: "LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG"│
                     │ 🎧 Kích hoạt Audio thực nghiệm còi tàu 20:30    │
                     └────────────────────────┬────────────────────────┘
                                              │ (Hội tụ Voicemail 20:32 & Lịch VTV3)
                                              ▼
                         ┌──────────────────────────────────────────┐
                         │ 🔴 GIAI ĐOẠN 2: TUYẾN ĐIỀU TRA C         │
                         │    (XÂU CHUỖI BẰNG CHỨNG BUỘC TỘI HÀ)    │
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

## 🔒 THỂ CHẾ & ĐIỀU KIỆN KÍCH HOẠT LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG

1. **Vị trí Luồng:** Lệnh Khám xét lại hiện trường **KHÔNG thuộc riêng biệt Tuyến A hay Tuyến B**, mà là **NÚT HỘI TỤ CHUYỂN TIẾP BẮT BUỘC (Converging Gateway)** giữa Phase 1 và Phase 2.
2. **Cơ chế Kiểm soát Trạng thái (System State Validation):**
   - Người chơi có thể tự do chọn điều tra Tuyến A trước hoặc Tuyến B trước (hoặc làm song song).
   - Hệ thống theo dõi 2 cờ trạng thái (Flags):
     - `isTuyenACompleted`: Đã minh oan cho Vũ bằng Hóa đơn Quán Bia 88 (20:45) & App xe ôm.
     - `isTuyenBCompleted`: Đã bóc trần Tùng nói dối qua Dấu vân tay tách trà + Mở khóa Lời tự thú xô xát (dẫn đến Bế tắc 1 chiều).
   - **Điều kiện cho phép quét QR Lệnh Khám xét lại hiện trường:**
     $$\text{PermitActivation} = \text{isTuyenACompleted} \land \text{isTuyenBCompleted}$$
3. **Xử lý trải nghiệm (Player Experience):**
   - Nếu người chơi cố tình quét QR thẻ cứng trước khi hoàn thành đủ cả 2 tuyến, Web App hiển thị thông báo nghiệp vụ:  
     > 🛑 *"Chưa đủ điều kiện sử dụng. Lệnh khám xét lại hiện trường chỉ được phép kích hoạt sau khi Ban chuyên án đã khai thác hết mọi bằng chứng và giải trình xong toàn bộ các đối tượng nghi vấn ban đầu (Mai, Vũ, Tùng)."*
   - Khi cả 2 tuyến đã hoàn thành, hệ thống hiển thị thông báo gợi ý:  
     > 🔔 *"Tất cả đầu mối ban đầu đã được làm rõ nhưng vụ án vẫn rơi vào ngõ cúc bế tắc. Hãy sử dụng Thẻ cứng 'LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG' trong hộp điều tra để mở ra hướng đi mới!"*

---

## ⏱️ II. DIỄN BIẾN THỜI GIAN ĐÊM ÁN MẠNG (24/07/2026)

### 🔍 GIAI ĐOẠN 0: KHÁM NGHIỆM BAN ĐẦU & TRUY VẾT SĐT KHÔNG TÊN (`00_khoi_dau/`)

> 💡 **Lưu ý cốt lõi:** Ở Giai đoạn 0, **Nguyễn Thanh Tùng CHƯA XUẤT HIỆN như một người liên quan trong hồ sơ công an**. Tên "Tùng" hoàn toàn chưa có trong bảng danh sách thẩm vấn ban đầu. Cảnh sát chỉ có một danh sách các cuộc gọi/tin nhắn liên lạc với Khang trong 12h trước thời điểm tử vong (nhiễu), trong đó có 3 số không tên. Mục tiêu của Giai đoạn 0 là người chơi tra cứu bằng chứng để **xác định danh tính 3 số điện thoại không tên**, từ đó mới mở khóa **Biên bản lấy thông tin người liên quan lần 1 & Hồ sơ lý lịch của 3 đối tượng**.

* **Tài liệu tiếp cận:** 18 tài liệu cơ sở ban đầu (`01_tiep_nhan_tin_bao` đến `18_bang_tin_rao_vat`).
* **Dữ liệu thu thập & Vật chứng tại hiện trường:**
  1. **Khám nghiệm tử thi (`04`):** Nạn nhân chết do đứt động mạch cảnh trong khoảng **20:45 – 21:15 (ước tính ~21:00)**; vùng chẩm gáy có vết tụ máu do va đập trước đó; mảng tóc mai bên trái bị cắt sát da đầu.
  2. **Vật chứng hiện trường phòng khách (`05`):** 
     - Mảnh thủy tinh dính máu `p3` (hung khí vụ án).
     - Bộ bình trà thủy tinh vỡ vụn `p1`, **dấu vân tay ẩn trên tách trà** (chưa xác định danh tính).
     - Xấp đơn đòi đất `p2` (vết máu khô `M1`), sổ nợ tín dụng đen `10a`, hũ trà hoa cúc `17`, điện thoại nạn nhân `16` (mã `dev-00`).
     - **Mảnh bài báo bị xé nhỏ rải rác (`p5`):** Nằm dưới sàn gần bàn trà nơi Khang ngã đập đầu. Thu thập ghép lại thành bài báo cũ 20 năm trước có tiêu đề: *"SỰ CỐ THƯƠNG TÂM: BÉ TRAI TỬ VONG KHI BỊ KỆT TRONG TỦ"* (ngày âm lịch tai nạn trùng với ngày diễn ra vụ án). Bài báo đưa tin bé `N.G.H` (8 tuổi) bị câm bẩm sinh và bệnh tim tử vong khi chơi trốn tìm do chốt gỗ gài ngoài sập xuống. **Ảnh hiện trường bài báo:** Chiếc tủ gỗ cũ có **chiếc còi màu cam** rớt dưới đất phía ngoài tủ.
  3. **Bức ảnh tập thể xóm Bờ Sông 20 năm trước (`p4`):** Ảnh chụp kỷ niệm Lễ Đại Đoàn Kết xóm Bờ Sông (có Khang, Mai, Tùng, Huy). Đứa trẻ Huy **đeo chiếc còi màu cam** trên cổ (khớp chiếc còi rớt ngoài tủ gỗ trong bài báo `p5`); người đứng bế Huy có **vết sẹo ở lông mày** (sau này đối chiếu trùng khớp ảnh chân dung lý lịch Tùng).
  4. **Sổ ghi nợ tín dụng đen (`10a`):** Danh sách con nợ của Khang (biệt danh, SĐT, số tiền nợ, hạn trả).
  5. **Nhật ký cuộc gọi điện thoại nạn nhân (`16`):** Cảnh sát liên hệ các SĐT gọi đến cho Khang 12h trước khi chết. Thu thập được danh sách nhiễu, trong đó có **04 số không liên lạc được** (1 số có tên, 3 số không tên).
     - **2 số không tên:** Đối chiếu Sổ ghi nợ `10a` ➔ Xác minh được tên 2 con nợ (trong đó có Vũ nợ 300M).
     - **1 số không tên (cuộc gọi 19:55):** Đối chiếu Bảng tin khu phố `18` ➔ Thấy mẩu tin rao vặt *"Bán lại vật liệu xây nhà dự án Đô thị ABC..."* có đăng SĐT trùng khớp mang tên **TÙNG**.
  6. **Biên bản phỏng vấn bố mẹ Tùng (Hàng xóm sát vách nhà Khang):** Bố mẹ Tùng kể ngày xưa Khang chơi cùng 2 đứa con trai nhà bà. Cho đến khi con trai út qua đời thì không còn qua lại. Khang thời nhỏ ngỗ nghịch. Hôm trước nhờ **"thằng con trai lớn"** sang nhà Khang mời đám giỗ con trai út nhưng không thấy Khang qua ➔ *Kết quả: Gieo ấn tượng mơ hồ "thằng con lớn", chưa có tên "Tùng" chính thức trong hồ sơ.*
  7. **Bảng tin khu phố (`18`):**
     - **Tin sự cố đài truyền hình:** Xin lỗi khán giả vì sự cố gián đoạn phát sóng VTV1 từ **20:00 – 20:15**.
     - **Tin rao vặt:** Bán lại vật liệu xây nhà của dự án Đô thị ABC (do lỗi nhỏ), đăng SĐT của **Tùng**.
     - **Trưng cầu dân ý:** Quy hoạch lại khu AA xóm Bờ Sông (họp 19:30 tại Nhà văn hóa).
     - **Cảnh báo tín dụng đen:** Cá nhân cho vay nặng lãi 150%/năm và đe dọa con nợ.

* 💡 **MỤC TIÊU GIAI ĐOẠN 0:** Người chơi suy luận, ghép nối tìm đủ tên 3 chủ nhân SĐT không tên ➔ Hệ thống mở ra **Biên bản lấy thông tin người liên quan lần 1 & Lý lịch thông tin cơ bản kèm ảnh chân dung** của 3 đối tượng (Mai/Vũ, Tùng và Hà).

---

## 🟢 GIAI ĐOẠN 1: ĐIỀU TRA SONG SONG 02 TUYẾN ĐẦU MỐI (`01_nhanh_mai_vu/` & `02_nhanh_tung/`)

---

### 🟢 TUYẾN ĐIỀU TRA A: TRẦN NGỌC MAI & NGUYỄN VĂN VŨ (`01_nhanh_mai_vu/`)

#### 🔹 [CẤP 0] LẤY LỜI KHAI LẦN 1 MAI & VŨ
* **Tài liệu tiếp cận:** Biên bản lời khai Mai (`12_loi_khai_mai`) + Biên bản lời khai Vũ (`13_loi_khai_vu`).
* **Nội dung lời khai ban đầu:**
  - **Mai:** Khai đến đòi lại 50% mảnh đất lúc 18:30, vứt đơn đòi đất `p2` rồi bỏ về một mình lúc 19:00 bằng xe máy.
  - **Vũ:** Khai đến xin hoãn nợ 300M, bị Khang chửi bới đe dọa rồi rời đi lúc 19:30. Khai sau đó đi uống rượu một mình ở Quán Bia 88 đến 20:45.

#### 🔹 [CẤP 1] ĐỐI CHIẾU LỊCH TRÌNH & XÁC MINH ALIBI
* **Tài liệu đối chiếu:** Biên bản lời khai bà Lụa (`11`) + Lịch phát sóng VTV1 + Hóa đơn Quán Bia 88 (`08_hoa_don_quan_bia`).
* **Kết quả đối chiếu:**
  - **Minh oan cho Mai:** Bà Lụa xác nhận nghe tiếng rần ga phóng xe lúc nhịp hiệu Thời sự 19h00 vang lên ➔ Mai có alibi rời hiện trường lúc 19:00.
  - **Minh oan cho Vũ:** Hóa đơn Quán Bia 88 cùng lịch sử đặt xe công nghệ xác nhận Vũ ngồi ở Quán Bia 88 cách hiện trường 3.8 km từ 19:40 đến 20:45 ➔ Vũ không có mặt tại hiện trường lúc nạn nhân bị hạ sát (~21:00).
* 👉 **KẾT LUẬN TUYẾN A:** Mai và Vũ đều có ngoại phạm hợp lệ, không phải là thủ phạm đâm chết Khang (`isTuyenACompleted = true`).

---

### 🟡 TUYẾN ĐIỀU TRA B: NGUYỄN THANH TÙNG (`02_nhanh_tung/`)

#### 🔹 [CẤP 0] LẤY LỜI KHAI LẦN 1 TÙNG
* **Tài liệu tiếp cận:** Tra SĐT `19:55` từ Bảng tin rao vặt `18` ➔ Mở Lời khai lần 1 của Tùng (`14_loi_khai_tung`) & Hồ sơ lý lịch Tùng.
* **Lời khai lần 1 của Tùng:**
  - Tùng khai gọi điện cho Khang lúc **19:55** chỉ để hỏi hẹn gặp vay tiền làm lại nhà cho bố mẹ do thời gian tới xóm quy hoạch. Cuộc gọi ngắn vì Tùng chỉ hỏi giờ rảnh. Tùng **khẳng định không sang nhà Khang và không gặp mặt Khang đêm đó**.
  - Tùng chia sẻ không hay qua lại với Khang do không còn thân như hồi bé và hay đi làm xa; đợt này về vì đúng dịp đám giỗ 20 năm của em trai.
* ❓ **Nghi vấn điều tra:** Tùng khai chỉ gọi điện chứ không đến nhà Khang ➔ Liệu Tùng có nói dối?

#### 🔹 [CẤP 1] ĐỐI CHIẾU VẬT CHỨNG & BẮT THÓP LỜI KHAI NÓI DỐI
* **Tài liệu tiếp cận:** Mảnh báo ghép `p5` + Ảnh tuổi thơ `p4` + Biên bản phỏng vấn bố mẹ Tùng + Dấu vân tay trên tách trà `05`.
* **Luồng suy luận từng bước của người chơi:**
  - **Bước 1: Nhận diện bi kịch 20 năm trước:**
    - Đối chiếu mảnh báo ghép `p5` (bé `N.G.H` 8 tuổi ngạt thở trong tủ gỗ).
    - Soi bức ảnh tuổi thơ `p4`: Bé Huy **đeo chiếc còi màu cam** trên cổ. Người bế Huy có **vết sẹo ở lông mày** (đối chiếu trùng khớp ảnh chân dung trong lý lịch Tùng).
    - Kết hợp Biên bản phỏng vấn bố mẹ Tùng (đám giỗ 20 năm bé út) ➔ **Xác nhận bé N.G.H chính là Gia Huy — em trai ruột của Tùng!**
  - **Bước 2: Kết nối Tùng với hiện trường:**
    - Mảnh bài báo 20 năm trước bị xé tung tóe dưới sàn nhà Khang ngay nơi xảy ra xô xát chứng tỏ **chính Tùng đã cầm bài báo này sang nhà Khang đối chất và nảy sinh mâu thuẫn xé báo bộc phát!**
  - **Bước 3: Lấy mẫu đối sánh vân tay:**
    - Người chơi yêu cầu **lấy mẫu dấu vân tay của Tùng đối sánh với Dấu vân tay trên Tách trà** (`05`).
    - ➔ **KẾT QUẢ TRÙNG KHỚP!** Bóc trần Tùng nói dối: Tùng đã trực tiếp ngồi ở phòng khách nhà Khang đêm đó!

#### 🔹 [CẤP 2] MỞ KHÓA THẨM VẤN CUỐI & LỜI TỰ THÚ CỦA TÙNG
* **Câu hỏi tương tác mở khóa:** Hệ thống đưa ra câu hỏi đố chữ / suy luận nghiệp vụ:
  > *"Theo bạn vì sao Tùng đến gặp Khang? Mâu thuẫn thực sự giữa Tùng và Khang là gì?"*
  - Người chơi nhập câu trả lời chính xác bằng văn bản ➔ **Mở khóa Biên bản hỏi cung / Lời tự thú cuối cùng của Tùng!**

* **Tài liệu tiếp cận:** Biên bản hỏi cung tự thú của Tùng (`01_tu_thu_xo_xat_tung`).
* **Lời tự thú của Tùng:**
  - Tùng khai hai hôm trước đám bạn xóm Bờ Sông nhậu rượu. Khang say đắc ý khoe lại trò trốn tìm hồi nhỏ: *"Ê nhớ hồi đó tao trốn chỗ nào tụi mày tìm hoài không ra không? Đỉnh nhất là cái vụ nhốt trong tủ đó, không ai nghĩ ra luôn!"*.
  - Tùng bàng hoàng, sau khi tỉnh rượu cầm bài báo cũ sang nhà Khang bắt Khang ra mộ tạ tội. Khang trơ tráo buông lời bỡn cợt *"Thôi mà, chuyện xưa rồi"*.
  - Cơn uất hận bùng nổ, Tùng xé bài báo, xô Khang ngã đập đầu vào cạnh bàn trà bất tỉnh lúc 20:00. Tùng lay thấy Khang còn thở nhưng quá hoảng sợ nên mở cửa sau bỏ chạy.
* 🚨 **ĐIỂM NGHỄN BẾ TẮC / LỜI KHAI MỘT CHIỀU:**
  - Lời khai *"Tôi bỏ đi khi Khang vẫn còn thở"* hoàn toàn là **LỜI KHAI 1 CHIỀU ĐƠN PHƯƠNG** của Tùng!
  - Tùng không có bất kỳ bằng chứng hay nhân chứng ngoại phạm nào chứng minh sau đó Tùng không quay lại tung nhát đâm chí mạng. Cuộc điều tra rơi vào ngõ cụt bế tắc (`isTuyenBCompleted = true`).

---

### 🔑 NÚT HỘI TỤ BẮT BUỘC: KÍCH HOẠT LỆNH KHÁM XÉT LẠI HIỆN TRƯỜNG (CHUYỂN TIẾP PHASE 1 ➔ PHASE 2)

* **Đạo cụ vật lý:** Thẻ cứng **"LỆNH KHÁM XẤT LẠI HIỆN TRƯỜNG"** có mã QR trong hộp điều tra.
* **Điều kiện kích hoạt:** `isTuyenACompleted == true` (Vũ đã được minh oan) **AND** `isTuyenBCompleted == true` (Tùng rơi vào bế tắc lời khai 1 chiều).
* **Chú thích trên thẻ:** ⚠️ *"Chỉ được khám xét lại hiện trường vào thời điểm đã sử dụng hết mọi bằng chứng nhưng chưa đi được đến kết luận chính xác và khách quan."*
* **Thao tác tương tác (Quét mã QR):**
  - Khi cả 2 tuyến A & B đều hoàn thành, người chơi quét mã QR trên thẻ cứng.
  - Hệ thống Web App kích hoạt giao diện **Tái Khám Nghiệm Hiện Trường Ban Đêm**.
* **Manh mối âm thanh then chốt (Audio Clue):**
  - Hệ thống phát đoạn ghi âm thực nghiệm âm học tại hiện trường lúc 20h30 tối: Trong phòng khách nhà Khang, người chơi **nghe thấy rất rõ tiếng còi tàu hỏa kéo dài rú vang và tiếng chuông leng keng của gác chắn đường sắt** chạy ngang qua ngõ Bờ Sông sát vách nhà Khang.

---

### ❓ CÂU HỎI CHUYỂN TIẾP: MỞ KHÓA GIAI ĐOẠN 2 (TUYẾN ĐIỀU TRA C)

Sau khi nghe thấy tiếng còi tàu tại hiện trường từ việc quét thẻ kích hoạt, người chơi tiến hành xâu chuỗi để bóc trần kẻ khả nghi thực sự:

* ❓ **Câu hỏi nghiệp vụ đặt ra cho người chơi:**  
  > *"Sau khi khám xét lại hiện trường và lắng nghe âm thanh thực nghiệm, các manh mối hoặc lời khai nào dưới đây cùng hội tụ để chỉ ra điểm mâu thuẫn bóc trần đối tượng còn lại?"*

* 📋 **Danh sách 3 manh mối then chốt người chơi cần chọn đúng:**
  1. **Âm thanh thực nghiệm còi tàu tại hiện trường:** Xác nhận tiếng còi tàu và chuông gác chắn chỉ vang lên tại khu vực ngõ nhà Khang vào khung giờ chuyến tàu hàng chạy qua (**20:30 – 20:35** theo Bảng tin `18`).
  2. **Tin nhắn thoại / Voicemail lúc 20:32 trong máy Khang (`16`):** Đoạn voice Trần Thị Hà gọi cho Khang lúc **20:32:15** lọt rõ **tiếng còi tàu hỏa kéo dài và tiếng chuông gác chắn đường sắt leng keng ở hậu cảnh**.
  3. **Biên bản lời khai của Trần Thị Hà (`15`):** Hà khai ở phòng trọ sâu trong phố (cách 1.2km) xem *phim bộ VTV3 về kẻ phản bội* suốt từ 20h00 đến 21h30 không hề ra ngoài (trong khi lịch phát sóng VTV3 tối thứ Sáu chỉ chiếu Gameshow, và phòng trọ cách xa đường tàu không thể có tiếng còi tàu).

* 💡 **Lý giải logic nghiệp vụ (Cú Hội Tụ Đập Tan Bằng Chứng Ngoại Phạm Của Hà):**
  - Âm thanh còi tàu trong Voicemail 20:32 chứng minh không thể chối cãi: **Hà đang đứng ngay trước cửa ngõ nhà Khang lúc 20:32** chứ không hề ở phòng trọ xem tivi như đã khai!
  - Kết hợp lời khai của Vũ (`07`): Nhìn thấy bóng người mặc áo gió trùm đầu đứng rình dưới gốc cây xoan từ lúc 19:25.
  - ➔ **Sự thật phơi bày:** Tùng không phải là người duy nhất có mặt quanh hiện trường! Có một kẻ thứ ba (Trần Thị Hà) đã rình rập và lẻn vào nhà sau khi Tùng rời đi!
  - 🔓 **HỆ THỐNG CHÍNH THỨC MỞ KHÓA TẬP C: TUYẾN ĐIỀU TRA TRẦN THỊ HÀ (`03_nhanh_ha/`)!**

---

### 🔴 GIAI ĐOẠN 2: TUYẾN ĐIỀU TRA C — XÂU CHUỖI TOÀN BỘ CHỨNG CỨ ĐỂ BUỘC TỘI TRẦN THỊ HÀ (`03_nhanh_ha/`)

Sau khi bẻ gãy bằng chứng ngoại phạm bằng còi tàu 20:32 và Lịch VTV3, Cơ quan điều tra xác định **Trần Thị Hà chính là nghi phạm đã có mặt tại hiện trường nhưng nói dối quanh co**. 

Cảnh sát lập tức triệu tập hỏi cung, tuy nhiên Hà tỏ ra kích động, điên loạn, khóc lóc gào thét vì cái chết của Khang và kiên quyết bất hợp tác, không chịu khai nhận bất cứ điều gì. Trước thái độ ngoan cố đó, Cơ quan điều tra thi hành **Lệnh khám xét khẩn cấp nơi ở của Hà** và tiến hành giám định toàn diện. Người chơi tiếp cận toàn bộ hồ sơ Tuyến C để **xâu chuỗi các chứng cứ vật lý, sinh học và lời khai**:

1. **Dấu vết hiện diện tại hiện trường:**
   - **Chiếc áo gió màu sẫm dính phấn hoa xoan (`03_kham_xet_phong_ha`):** Khám xét phòng trọ thu giữ áo gió còn ẩm ướt, dính phấn hoa xoan ➔ Khớp với nhân dạng "bóng người bí ẩn" đứng rình dưới gốc cây xoan trước cổng nhà Khang lúc 20:45 trong lời khai nhân chứng `11` (và lúc 19:25 trong lời khai của Vũ `07`).
   - **Tin nhắn thoại 20:32:** Lọt tiếng còi tàu và chuông gác chắn đường sắt chỉ có tại đầu ngõ nhà Khang.

2. **Vật chứng buộc tội đanh thép nhất:**
   - **Lọn tóc mai dính máu khô (`04_giam_dinh_adn_lon_toc` / `EV-HAIR-DNA`):** Thu giữ tại phòng trọ của Hà ➔ Giám định ADN 16 locus STR **trùng khớp 100% ADN của nạn nhân Nguyễn Văn Khang** (khớp hoàn toàn với mảng tóc mai bị cắt cụt sát da đầu trong khám nghiệm tử thi `04`).

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
