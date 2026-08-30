# VỤ ÁN 000: TRỐN TÌM (HIDE-AND-SEEK)
# HỆ THỐNG GAMEPLAY MASTER: PHÒNG HỒ SƠ CHUYÊN ÁN (DOSSIER HUB & LEAD-BASED INVESTIGATION)

> **Cổng kích hoạt vụ án:** `TEST-99`  
> **Kiến trúc gameplay:** Điều tra phi tuyến tính theo **3 Nhánh Đầu Mối (Lead-based Investigation)** kết hợp **Phòng Hồ Sơ Nghi Phạm Độc Lập (Dossier Hub)**.  
> **Hệ thống đối soát:** Đồng bộ 100% với toàn bộ 5 tập hồ sơ chuyên sâu (`dossier_tran_thi_ha.md`, `dossier_tung.md`, `dossier_tran_ngoc_mai.md`, `dossier_le_quang_vu.md`, `dossier_ba_lua.md`) và hệ thống tài liệu LaTeX/PDF.

---

## 🧭 I. TỔNG QUAN TRIẾT LÝ GAMEPLAY: LEAD-BASED INVESTIGATION

Khác với mô hình làm bài kiểm tra tuần tự qua từng Phase, mô hình **Dossier Hub** đưa người chơi vào vai trò **Điều tra viên thực thụ của Phòng Cảnh sát Hình sự (PC02)**. Người chơi tiếp cận vụ án thông qua **Phòng Hồ Sơ Chuyên Án**:

```text
                           ┌────────────────────────────────────────────────────────┐
                           │            HỒ SƠ TỔNG QUAN HIỆN TRƯỜNG & TỬ THI         │
                           │  • Báo cáo pháp y 2 giai đoạn & Dư lượng Diazepam      │
                           │  • Biên bản hiện trường: Bình trà vỡ, Cúc áo, Ghim cài │
                           │  • Trục thời gian Nhân chứng then chốt: BÀ LỤA (số 12) │
                           │  • Trích xuất điện thoại nạn nhân Khang (dev-00)       │
                           └───────────────────────────┬────────────────────────────┘
                                                       │
               ┌───────────────────────────────────────┼───────────────────────────────────────┐
               ▼                                       ▼                                       ▼
     [NHÁNH ĐẦU MỐI A]                       [NHÁNH ĐẦU MỐI B]                       [NHÁNH ĐẦU MỐI C]
      DI SẢN & NỢ NẦN                       BÓNG MA QUÁ KHỨ 1998                      BẠN GÁI ÁM ẢNH
   (Tập Hồ Sơ MAI & VŨ)                     (Tập Hồ Sơ TÙNG - ẨN)                    (Tập Hồ Sơ TRẦN HÀ)
   ───────────────────                     ─────────────────────                     ───────────────────
   • Kỹ thuật Đồ nét chữ ký đất 200m²      • Lần số lạ 20:55 qua Rao vặt             • Âm thanh còi tàu diesel 20:32
   • Hóa đơn & Camera Tiệm Thuốc (19:42)   • Bác bỏ alibi bằng Ghim cài áo           • Bóc trần ngoại phạm VTV3 thứ Sáu
   • Chà than chì sổ nợ rách 300M          • Bút tích sau khung tranh gỗ 1998        • Bắt lỗi lỡ lời "bình trà vỡ"
   • Tra cứu dấu thời gian POS Km18        • Ghép mảnh bài báo ngạt khí tủ           • Ép Touch ID đọc tin nhắn 20:48
   • Giải mã Red Herrings: Bùn & Cúc áo    • Phá bẫy xô ngã lúc 20:00 (vé xe)       • Tang vật: Lọn tóc ADN trong áo ngực
               │                                       │                                       │
               └───────────────────────────────────────┼───────────────────────────────────────┘
                                                       │
                                                       ▼
                           ┌────────────────────────────────────────────────────────┐
                           │        BẢN CÁO TRẠNG ĐỊNH TỘI (KẾT LUẬN ĐIỀU TRA)      │
                           │  • Chỉ danh Thủ phạm chính: TRẦN THỊ HÀ (ha)           │
                           │  • Xác định Động cơ: Ghen tuông cuồng sở hữu độc hại   │
                           │  • Cặp chứng cứ mâu thuẫn mốc giờ: Pháp y 21:00 & 07d  │
                           │  • Phán quyết Phá Án Hoàn Hảo & Mở 4 Ký Sự Hậu Án      │
                           │  • Thu thập Manh mối Tổ chức vĩ mô: QUÂN XE (TEST-99)  │
                           └────────────────────────────────────────────────────────┘
```

---

## ⚡ II. CHUỖI PHẢN ỨNG DÂY CHUYỀN ĐÊM MƯA LỚN (DOMINO CHAIN REACTION)

Mọi diễn biến trong đêm 24/07/2026 tạo thành một chuỗi Domino tác động liên hoàn đẩy nạn nhân đến cái chết:

```text
[18:30 – 18:50] MAI chở Vũ sang cãi vã đòi 50% đất 200m² -> Ném Đơn tố cáo xuống sàn rồi bỏ về lúc 18:50.
       │
       ▼ (Khiến Vũ sợ bị lộ món nợ 300M, Khang đắc chí tống tiền uy hiếp)
[19:00 – 19:15] VŨ quỳ lạy van xin hoãn nợ -> Bị Khang tát 2 cái, giật đứt cúc áo xanh đen -> Hoảng loạn cướp xé sổ nợ chạy trốn.
       │
       ▼ (Khang tức điên vì bị xé sổ nợ, nốc thêm rượu say khướt và trong trạng thái kích động hung hãn)
[20:00 – 20:15] TÙNG sang đối chất vụ án 1998 -> Khang say rượu giật xé bài báo nhạo báng -> TÙNG xô ngã Khang đập gáy bất tỉnh, vỡ bình trà lúc 20:00 -> Tùng tháo chạy lúc 20:15, quên khép cổng dưới mưa.
       │
       ▼ (Hà rình rập ngoài ngõ thấy Tùng chạy và cổng hé mở -> Lén chui vào nhà lúc 20:45)
[20:48 – 21:00] HÀ thấy Khang ngất, nắm ngón tay Khang ép vào Touch ID mở khóa điện thoại lướt đọc đoạn chat tình nhân đi Đà Lạt -> Cơn ghen cuồng loạn bùng nổ -> HÀ vơ mảnh thủy tinh đâm đứt động mạch cổ Khang lúc 21:00!
       │
       ▼ (Hà cắt lọn tóc mai dính máu nhét vào áo ngực rồi chuồn ra cửa sau lúc 21:08)
[21:20 (24/07) – 06:30 (25/07)] Đêm mưa bão nhà nào cũng khóa cửa -> 06:30 sáng 25/07 BÀ LỤA quét ngõ thấy cửa mở toang, phát hiện thi thể -> Báo công an 06:45 -> Khám nghiệm thấy Đơn tố cáo tên Mai lúc 07:45 -> Triệu tập Mai & Vũ lúc 08:30.
```

---

## 🛠️ III. HỆ THỐNG KỸ THUẬT NGHIỆP VỤ & THAO TÁC ĐIỀU TRA VẬT LÝ

Toàn bộ các manh mối trong vụ án được thiết kế để có thể **triển khai hoàn chỉnh thành Bộ Kit Hồ Sơ Thám Tử Vật Lý (Detective Case Box)** ngoài đời thực hoặc tương tác linh hoạt:

| STT | Tên Kỹ Thuật Nghiệp Vụ | Thao Tác Thực Hiện Vật Lý | Ứng Dụng Trong Vụ Án #000 |
| :---: | :--- | :--- | :--- |
| **1** | **Soi đè quang học**<br>(Soi trước nguồn sáng) | Cầm 2 tờ văn bản (hoặc 1 tờ giấy + 1 tấm phim trong suốt) đặt chồng lên nhau đưa ra trước ánh sáng đèn/cửa sổ. | Đè `Giấy ủy quyền giả (08)` lên `Biên bản gia đình (08-bg)` $\rightarrow$ Hai chữ ký trùng khít 100% từng nét uốn (Khang đồ nét chữ ký của Mai để cướp đất 200m²). |
| **2** | **Chà than chì & Soi góc nghiêng**<br>(Phát hiện vết hằn nét bút) | Cầm bút chì mềm (2B/4B) chà nhẹ hoặc chiếu đèn pin góc nghiêng lên mặt trang giấy trắng. | Chà lên trang giấy trắng số 13 kế tiếp trong cuốn sổ da bị giật xé $\rightarrow$ Nổi rõ vết hằn bút bi ghi nợ 300 triệu của Lê Quang Vũ (`V-Điện`). |
| **3** | **Tra cứu Mã số giao dịch**<br>(Giải mã dấu thời gian POS) | Đọc dãy số in trên mã vạch hóa đơn thanh toán bằng giấy thực tế $\rightarrow$ Tra cứu bảng đối chiếu thời gian. | Đọc mã giao dịch `1787924110` trên hóa đơn mua nước giải rượu tại Km18 $\rightarrow$ Xác định chính xác lúc **20:35:10** (cách 14km, minh oan cho Vũ). |
| **4** | **Tháo gỡ & Khám nghiệm hiện vật**<br>(Khám phá cấu trúc vật lý) | Trực tiếp lật mặt sau khung ảnh bằng giấy bồi, cạy khớp nối, soi chi tiết ghim cài áo kim loại và mảnh vỡ. | Tháo mặt sau khung tranh gỗ tìm bút tích tạ lỗi em trai năm 1998; kiểm tra bụi vôi vữa trên ghim cài áo xây dựng; kiểm tra dấu vân tay trên mảnh thủy tinh. |
| **5** | **Ghép mảnh phục hồi tài liệu**<br>(Ghép giấy rách thực tế) | Dùng tay sắp xếp, xoay và ghép các mẩu giấy báo bị xé vụn dựa theo đường rách, thớ giấy và mặt chữ in. | Ghép các mảnh giấy báo cũ bị xé rải rác thành bài báo hoàn chỉnh về vụ án ngạt khí tủ âm tường năm 1998 của bé Gia Huy. |
| **6** | **Đối chiếu Văn bản hành chính**<br>(Đọc chéo tài liệu nghiệp vụ) | Đọc và so sánh các văn bản hành chính in trên giấy A4/A5: Lịch phát sóng truyền hình, Biên bản sự cố cáp viễn thông, Biên bản hiện trường. | Đối chiếu lịch phát sóng VTV3 (tối thứ Sáu chỉ chiếu Gameshow, không có phim bộ) $\rightarrow$ Bóc trần lời khai giả mạo của Hà. |
| **7** | **Giám định Âm thanh & Tạp âm**<br>(Nghe ghi âm / Đọc bóc băng) | Nghe đoạn ghi âm thực tế (hoặc đọc biên bản giám định bóc băng ghi âm có phân tích âm học môi trường). | Phát hiện tiếng còi tàu hỏa diesel và chuông chắn đường sắt lọt trong cuộc gọi lúc 20:32 $\rightarrow$ Vạch trần Hà đang đứng trước cổng nhà Khang. |
| **8** | **Biên bản Kết luận Điều tra**<br>(Bản Cáo trạng phá án) | Điền thông tin thủ phạm, động cơ và đính kèm các tài liệu vật chứng làm căn cứ khởi tố vào biểu mẫu kết luận. | Hoàn thành bản kết án định tội Trần Thị Hà, bẻ gãy mốc giờ ngoại phạm và mở khóa hồ sơ hậu án. |

---

## 📂 IV. HỒ SƠ TỔNG QUAN HIỆN TRƯỜNG & NHÂN CHỨNG (CENTRAL MASTER ASSETS)

### 1. Báo cáo Pháp y Tử thi sơ bộ (`f1-1` - `01_bao_cao_kham_nghiem_tu_thi.pdf`):
- **02 Nhóm tổn thương cơ học riêng biệt:**
  1. *Tổn thương 1:* Vết bầm tụ máu chẩm gáy 6x4cm do va đập vật tày phẳng (cú ngã xô xát lúc 20:00 gây chấn thương sọ não kín và bất tỉnh tạm thời).
  2. *Tổn thương 2:* Vết thương rách da bờ sắc gọn 3.5cm tại tam giác cảnh trái làm đứt động mạch cảnh (nhát đâm mảnh thủy tinh gây mất máu cấp tử vong lúc 21:00).
- **Dư lượng Độc chất học:** Phát hiện hàm lượng thấp thuốc an thần *Benzodiazepin / Diazepam* trong dịch dạ dày (chứng minh Khang bị đầu độc làm giảm phản xạ vận động từ trước).

### 2. Biên bản Khám nghiệm Hiện trường (`f1-2` - `02_bien_ban_kham_nghiem_hien_truong.pdf`):
- **Vật chứng thu giữ:**
  - `p3`: Mảnh thủy tinh vỡ sắc nhọn dài 8cm dính máu khô & dấu vân tay miết (Hung khí).
  - `EV-SHIRT-BUTTON`: 01 Cúc áo sơ mi nam màu xanh đen rơi dưới gầm bàn trà.
  - `p8`: 01 Ghim cài áo đồng huy hiệu công ty xây dựng dính bụi vôi vữa.
  - `p5`: Các mảnh giấy báo cũ ố vàng bị xé rách vụn gần bàn trà.
  - `10a`: Cuốn sổ ghi nợ bìa da đen bị xé rách 3 trang giữa.
  - `p2`: Xấp hồ sơ `Đơn tố cáo lừa đảo` kèm `Giấy ủy quyền sử dụng đất 200m2` mang tên Trần Ngọc Mai.
  - Hũ thủy tinh đựng hoa cúc dán giấy note dặn dò chữ viết tay của Hà.
  - Vết giày nam size 41 và cửa sau bị bật chốt trong.

### 3. Trục thời gian Nhân chứng then chốt — BÀ LỤA (`WITNESS-01-LUA` - `dossier_ba_lua.md`):
- **Vị trí:** Nhà số 12 sát vách, cách 3.5m, nhìn bao quát ngõ đường Bờ Sông.
- **Lời khai khách quan định vị thời gian:**
  - `18:30 – 18:50`: Mai chở Vũ sang cãi nhau đòi đất; Mai ném hồ sơ về lúc 18:50.
  - `19:15`: Nghe tiếng Khang tát bốp bốp, thấy Vũ ôm má trái, cổ áo xộc xệch hoảng loạn lao xe máy chạy trốn dưới mưa.
  - `20:00 – 20:15`: Đang xem TV kênh `TH3` (sóng phát bình thường) thì nghe tiếng cãi nhau lớn đàn ông nhắc tên "thằng Huy", tiếng *"XOẢNG"* vỡ bình trà lúc 20:00, rồi thấy bóng người mặc áo công nhân (Tùng) chạy tháo thân lúc 20:15.
  - `20:45`: Thấy bóng người mặc áo gió trùm kín đầu ("bóng ma cây xoan" — Hà) lẻn vào nhà Khang.
  - `06:30 (Sáng 25/07)`: Sáng dậy quét ngõ thấy cửa nhà Khang mở toang từ đêm qua, phát hiện thi thể Khang co cứng trên vũng máu $\rightarrow$ Báo công an lúc 06:45.

### 4. Thiết bị Điện thoại tịch thu của Nạn nhân (`dev-00` - `Phone Simulator`):
- `19:15`: Tin nhắn đe dọa của Hà (*"Đừng để em tìm tới nhà đấy!"*).
- `20:32`: File ghi âm lời nhắn thoại của Hà dặn uống trà hoa cúc (lọt tiếng còi tàu diesel & chuông rào chắn).
- `20:40`: Tin nhắn tình nhân mới (Vy) rủ đi Đà Lạt (*"Anh nhớ giấu con mụ kế toán phiền phức kia..."*).
- `20:55`: Cuộc gọi nhỡ từ số máy lạ (số điện thoại của Tùng).
- Lịch sử tin nhắn kiểm soát thể xác: Soi từng sợi tóc mai ngắn hơn 1 phân (22/07) và cấm ai chạm vào cúc áo sơ mi xanh lỏng chỉ (23/07).

---

## 🗂️ V. CHI TIẾT 3 NHÁNH ĐẦU MỐI ĐIỀU TRA & CƠ CHẾ GIẢI ĐỐ

---

### 📌 NHÁNH ĐẦU MỐI A: TRANH CHẤP DI SẢN & KHOẢN NỢ BỐC HỌ (MAI & VŨ)
* **Truy cập:** `dossier_tran_ngoc_mai.md` (`SUSPECT-01-MAI`) & `dossier_le_quang_vu.md` (`SUSPECT-02-VU`).
* **Vật chứng liên kết:** `p2` (Giấy tờ đất văng vãi), `EV-SHIRT-BUTTON` (Cúc áo xanh đen), `10a` (Sổ nợ rách).

```text
                                [NHÁNH A: MAI & VŨ]
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
   [HỒ SƠ MAI]                                                       [HỒ SƠ VŨ]
   • Thao Tác Soi Đè 2 Mẫu Chữ Ký                                    • Thao Tác Chà Than Chì Sổ Nợ Rách
     (Giấy ủy quyền trùng khít 100% Biên bản gia đình                  (Hiện vết hằn nợ 300M & dọa báo bố vợ)
     -> Khang dùng kỹ thuật Đồ nét chữ ký làm giả)                    -> Giải thích vết bầm má & cúc áo đứt lúc 19:15.
   • Hóa Đơn & Camera Nhà Thuốc Minh Châu                            • Tra Cứu Dấu Thời Gian Hóa Đơn Km18
     (Mua Urgo & Paracetamol lúc 19:42 cách 4km                        (Mã POS 1787924110 -> 20:35:10, cách 14km)
     -> Mai ở nhà riêng suốt đêm sau 19:50)                            -> Không thể kịp quay lại sát hại lúc 21:00.
        │                                                                 │
        └────────────────────────────────┬────────────────────────────────┘
                                         ▼
                         [MINH OAN MAI & VŨ VÔ TỘI]
```

#### 🧩 Chi tiết 4 Cơ chế Khám phá Nhánh A:
1. **Cơ chế 1 — Thao Tác Soi Đè Quang Học Hai Mẫu Chữ Ký (`EV-SIGNATURE-TRACING`):**
   - Người chơi đặt `Giấy ủy quyền đất 200m2 (EV-SIGN-01)` đè lên `Biên bản gia đình gốc (EV-SIGN-02)` đưa ra trước nguồn sáng (hoặc đặt chồng phim trong suốt).
   - *Kết quả giám định:* Hai chữ ký trùng khít 100% từng góc lượn, độ nghiêng và chấm mực. Khoa học hình sự khẳng định không ai ký tay tự nhiên 2 lần trùng khớp tuyệt đối $\rightarrow$ Khang đã **đồ nét (tracing)** để chiếm đoạt đất 200m² thế chấp ngân hàng. Đơn tố cáo của Mai là hành vi đòi công lý hợp pháp.
2. **Cơ chế 2 — Hóa Đơn & Ảnh Camera Tiệm Thuốc Tây Minh Châu (`EV-PHARMACY-RECEIPT` & `EV-PHARMACY-CAM`):**
   - Hóa đơn in nhiệt tại Nhà thuốc Minh Châu (đầu Phố Đoàn Kết, cách nhà Khang 4km) ghi nhận Mai mua thuốc giảm đau Paracetamol, cồn đỏ và băng Urgo lúc **19:42:18 ngày 24/07/2026**.
   - Trích xuất ảnh Camera an ninh quầy thuốc: Mai mặc áo mưa vàng, dán băng Urgo ngón trỏ tay phải (bị xước lúc đập bàn cãi nhau với Khang lúc 18:50) rồi rời tiệm về nhà lúc 19:46.
   - Giải mã vết máu nhỏ trên mép bàn trà nhà Khang: Là máu từ ngón tay trỏ bị xước của Mai rớt ra lúc 18:50 (không phải máu xô xát án mạng).
   - $\rightarrow$ Chứng minh Mai ở nhà riêng từ 19:50 suốt đêm. **MINH OAN CHO MAI.**
3. **Cơ chế 3 — Thao Tác Chà Than Chì Trang Sổ Nợ Rách (`EV-DEBT-INDENTATION`):**
   - Dùng bút chì mềm (2B) chà nhẹ lên trang giấy số 13 kế tiếp trong cuốn sổ da bị xé (`10a`).
   - *Hiện rõ nét hằn:* *"12/03/2026: V-Điện (Thằng rể nhà Mai) bốc họ: 300.000.000đ. Lãi suất: 5k/triệu/ngày. Hạn chót: 30/07. Cầm: Giấy phép hành nghề Kỹ sư điện + Uy tín nhà 45 Đoàn Kết. Không trả tao ném giấy nợ về nhà bố vợ và cơ quan vợ!"*
   - Bóc trần lời khai gian dối của Vũ, làm rõ vết bầm gò má và cúc áo đứt là do Khang tát và giằng co lúc 19:10 khi Vũ van xin hoãn nợ.
4. **Cơ chế 4 — Tra Cứu Dấu Thời Gian POS & Bài Toán Quãng Đường (`EV-POS-RECEIPT-UNIX`):**
   - Hóa đơn mua nước giải rượu Ladodetox tại Trạm xăng Km18 Quốc Lộ bị nhòe nước mưa, mã Barcode `1787924110`.
   - Tra cứu Bảng chuyển đổi thời gian: Mã `1787924110` $\rightarrow$ **20:35:10 ngày 24/07/2026**.
   - Trạm xăng Km18 cách nhà Khang 14km đường đê ngập trơn trượt (mất 35-40 phút đi xe máy) $\rightarrow$ Vũ không thể có mặt tại hiện trường lúc án mạng diễn ra (~21:00). **MINH OAN CHO VŨ.**

---

### 📌 NHÁNH ĐẦU MỐI B: BÓNG MA QUÁ KHỨ 1998 & NGHI PHẠM ẨN (NGUYỄN THANH TÙNG)
* **Truy cập:** Gói niêm phong *"Nghi phạm ẩn danh"* $\rightarrow$ Mở khóa thành `dossier_tung.md` (`SUSPECT-03-TUNG`).
* **Vật chứng liên kết:** Cuộc gọi lạ 20:55 trong `dev-00`, `p8` (Ghim cài áo), `p5` (Mảnh báo xé), `p4` (Khung tranh tuổi thơ).

```text
                                [NHÁNH B: NGUYỄN THANH TÙNG]
                                             │
        ┌────────────────────────────────────┴────────────────────────────────────┐
        ▼                                                                         ▼
   [TRUY VẾT DANH TÍNH]                                                      [BÓC TÁCH HIỆN TRƯỜNG & ĐỘNG CƠ]
   • Tra cứu Bảng tin dân phố mục Rao vặt                                    • Ghim cài áo p8 bác bỏ lời khai chỉ gọi điện
     (Khớp SĐT cuộc gọi 20:55 -> Nguyễn Thanh Tùng)                            -> Mở lệnh khám xét phòng trọ Tùng.
   • Thẩm vấn Lần 1: Tùng khai gian chỉ gọi điện                             • Tháo mặt sau khung tranh gỗ p4
     hỏi vay vốn làm ăn công nhân.                                             (Lời tạ lỗi em trai Gia Huy: Hè 1998).
                                                                             • Minigame Ghép Puzzle Mảnh Báo Cũ 1998 p5
                                                                               (Bi kịch bé trai câm/tim ngạt khí tủ âm tường).
                                                                             • Lời tự thú: Xô ngã Khang bất tỉnh lúc 20:00.
        │                                                                         │
        └────────────────────────────────────┬────────────────────────────────────┘
                                             ▼
                        [BẪY RED HERRING: TÙNG TƯỞNG MÌNH GIẾT NGƯỜI]
                     Camera & Vé xe khách chứng minh Tùng rời bến lúc 20:15
                   (Khang tử vong lúc 21:00 do nhát đâm đứt động mạch cảnh)
```

#### 🧩 Chi tiết 4 Cơ chế Khám phá Nhánh B:
1. **Cơ chế 1 — Mở khóa Gói Hồ Sơ Ẩn danh qua Bảng Tin Dân Phố (`p9`):**
   - Đọc mục rao vặt trên bảng tin đầu ngõ $\rightarrow$ Khớp số điện thoại cuộc gọi 20:55 với tên **Nguyễn Thanh Tùng**. Người chơi nhập tên để giải mã hồ sơ Tùng.
2. **Cơ chế 2 — Bác bỏ Lời khai bằng Ghim Cài Áo Công Trường (`p8`):**
   - Tùng khai chỉ gọi điện thoại chứ không đến nhà (`07c`).
   - Người chơi dùng vật chứng `p8` (Ghim cài áo công ty xây dựng nơi Tùng làm việc rơi dưới chân bàn trà) để đối chất $\rightarrow$ Bác bỏ lời khai $\rightarrow$ Ra lệnh khám xét phòng riêng của Tùng.
3. **Cơ chế 3 — Bút tích sau Khung Tranh Tuổi Thơ (`p4`):**
   - Khám xét hộp đồ cũ trong phòng trọ Tùng, tháo mặt sau khung tranh gỗ phát hiện bút tích mực tím năm 1998: *"Thương em, anh xin lỗi vì đã không tìm thấy được em. An nghỉ em nhé. Hè 1998 — Anh Tùng"*.
4. **Cơ chế 4 — Minigame Ghép Mảnh Báo Vụ Án 1998 (`p5`):**
   - Ghép các mảnh báo rải rác gần bàn trà thành bài báo hoàn chỉnh: Vụ bé Gia Huy (8 tuổi, câm, bệnh tim) tử vong do ngạt khí trong tủ gỗ âm tường ngoài bãi đất hoang.
   - **Tùng tự thú toàn bộ:** Trong bữa nhậu 2 ngày trước, Khang say rượu khoe "chiến tích" gài chốt nhốt Huy. Tùng mang bài báo sang đối chất lúc 20:00, Khang giật xé thách thức $\rightarrow$ Tùng xô Khang đập gáy vào tủ/bàn ngất xỉu, làm vỡ bình trà lúc 20:00. Tùng tưởng Khang chết nên hoảng sợ bỏ chạy lúc 20:15 bắt xe về Hải Phòng.
   - ⚠️ **MINH OAN CHO TÙNG:** Cuống vé xe khách liên tỉnh và camera cây xăng xác nhận Tùng rời bến lúc 20:15. Khang tử vong lúc 21:00 do nhát đâm động mạch cổ. Tùng chỉ gây thương tích ngất tạm thời, không phải kẻ giết người!

---

### 📌 NHÁNH ĐẦU MỐI C: BẠN GÁI ÁM ẢNH & KẺ SÁT NHÂN THỰC SỰ (TRẦN THỊ HÀ)
* **Truy cập:** `dossier_tran_thi_ha.md` (`SUSPECT-04-HA` - Master Culprit Dossier).
* **Vật chứng liên kết:** `p3` (Mảnh thủy tinh dính máu), Hũ trà hoa cúc, File ghi âm thoại 20:32 trong `dev-00`, `12` (Pháp y bổ sung), `14` (Khám xét phòng Hà).

```text
                                [NHÁNH C: TRẦN THỊ HÀ]
                                           │
        ┌──────────────────────────────────┴──────────────────────────────────┐
        ▼                                                                     ▼
   [ĐỘNG CƠ ÁI KỶ & KIỂM SOÁT SINH HỌC]                                  [5 TẦNG BẰNG CHỨNG BẺ GÃY HUNG THỦ]
   • Hũ trà hoa cúc dán note yêu thương                                  1. Giám định Âm thanh 20:32 (EV-AUDIO-TRAIN)
     (Nghiền thuốc an thần Diazepam giữ chân Khang)                         (Lọt tiếng còi tàu diesel trước cửa nhà Khang)
   • Bàn thờ tình yêu dưới đáy tủ áo                                     2. Bóc trần Alibi VTV3 thứ Sáu (EV-VTV3-SCHEDULE)
     (142 ảnh chụp lén, lọ móng tay, lọ tóc 3 năm)                          (Thứ Sáu VTV3 chỉ chiếu Gameshow, không chiếu phim)
   • Áo len đỏ đan dở giữa mùa hè 39°C                                   3. Bắt lỗi Lỡ lời "Bình trà vỡ vụn" trong 07d
     (Ám ảnh thể xác từng thớ vải chạm da thịt Khang)                       (Bình trà vỡ lúc 20:00 -> Hà đã vào nhà sau 20:00)
   • Kích hoạt sát tâm lúc 20:48                                         4. Báo cáo Pháp y bổ sung 12 (EV-GLASS-SHARD)
     (Màn hình điện thoại sáng tin nhắn rủ đi Đà Lạt                       (Khang tử vong lúc 21:00 do đứt động mạch cảnh)
     của bồ nhí Vy -> Bùng nổ ghen tuông cuồng loạn)                     5. Tang vật Khám xét 14 & ADN Lọn tóc
                                                                            (Áo gió dính bùn & Lọn tóc mai dính máu trong áo ngực)
        │                                                                     │
        └──────────────────────────────────┬──────────────────────────────────┘
                                           ▼
                 [TRẦN THỊ HÀ GỤC NGÃ — THỦ PHẠM CHÍNH VỤ ÁN #000]
```

#### 🧩 Chi tiết 5 Cơ chế Khám phá Nhánh C:
1. **Cơ chế 1 — Giám định Âm thanh Hộp thư thoại lúc 20:32 (`EV-AUDIO-TRAIN-WHISTLE`):**
   - Lời nhắn thoại Hà gửi Khang lúc 20:32 dặn uống trà hoa cúc ngủ sớm.
   - **Thao tác người chơi (Audio Spectrogram Filter):** Khử tạp âm giọng nói $\rightarrow$ Phát hiện âm nền lọt rõ **tiếng còi tàu hỏa diesel vang rền & tiếng chuông rào chắn đường sắt réo rắt**. Tuyến đường sắt chỉ chạy ngang trước cổng nhà Khang (cách 30m), phòng trọ của Hà cách 1.2km không thể có. $\rightarrow$ **Vạch trần Hà đang rình rập trước cổng nhà Khang lúc 20:32!**
2. **Cơ chế 2 — Bóc trần Bằng chứng ngoại phạm "Xem phim bộ VTV3 tối Thứ Sáu" (`EV-VTV3-SCHEDULE`):**
   - Trong `07d`, Hà khai: *"Từ 20h00 đến hơn 21h00 tôi nằm ở phòng trọ xem phim bộ truyền hình VTV3 rồi đi ngủ."*
   - Đối chiếu `Lịch phát sóng VTV3`: Tối Thứ Sáu (24/07), khung giờ vàng VTV3 **chỉ phát Gameshow thực tế**, hoàn toàn KHÔNG chiếu phim bộ Việt Nam (phim bộ chỉ chiếu Thứ 2 – Thứ 5). $\rightarrow$ Bóc trần Hà bịa đặt lời khai!
3. **Cơ chế 3 — Bắt lỗi Lỡ lời chí mạng (Slip-of-the-Tongue Clash):**
   - Trong `07d`, Hà buột miệng mô tả: *"Tôi thấy anh Khang nằm gục mê man BÊN CẠNH BỘ BÌNH TRÀ VỠ VỤN..."*
   - Bình trà chỉ bị Tùng làm rơi vỡ lúc **20:00**. Nếu Hà ở phòng trọ cả tối thì làm sao biết Khang nằm cạnh đống bình trà vỡ? $\rightarrow$ Chứng minh Hà đã lẻn vào nhà Khang sau 20:00!
4. **Cơ chế 4 — Mâu thuẫn mốc giờ tử vong (Báo cáo pháp y bổ sung `12`):**
   - Pháp y xác định Khang tử vong do đứt động mạch cảnh lúc **21:00 đến 21:15**. Camera xác nhận Tùng rời đi lúc 20:15 $\rightarrow$ Hung thủ ra tay đâm lúc 21:00 chính là Hà!
5. **Cơ chế 5 — Mở khóa Touch ID Cưỡng bức & Động cơ Ái kỷ Điên loạn (`EV-TOUCHID-LOG`):**
   - **Manh mối Pháp y Kỹ thuật số (Digital Forensics Log):** Nhật ký hệ thống trên điện thoại `dev-00` ghi nhận sự kiện mở khóa bằng vân tay Touch ID của nạn nhân vào lúc **20:48**.
   - *Điểm bất thường pháp y:* Khang đã bị Tùng xô ngã chấn thương sọ não bất tỉnh từ **20:00** (Báo cáo pháp y `f1-1`). Việc Touch ID mở khóa lúc 20:48 chứng minh **đã có kẻ thứ ba cầm bàn tay của Khang đang mê man để áp vào nút mở khóa!**
   - Hà thừa nhận: Thấy Khang ngất, Hà đã cầm ngón tay trỏ của Khang áp vào cảm biến Touch ID mở máy, thong thả lướt đọc toàn bộ đoạn chat tình tứ, ảnh vé máy bay đi Đà Lạt và lời mỉa mai gọi Hà là *"con mụ kế toán phiền phức"*.
   - Cơn ghen cuồng sở hữu và triết lý ái kỷ biến thái trỗi dậy (*"Người sống sẽ phản bội, chỉ người chết mới mãi mãi chung thủy"*). Hà thì thầm bài đếm số trốn tìm, vơ mảnh thủy tinh `p3` đâm đứt động mạch cổ Khang lúc 21:00 để "khóa chốt chiếc tủ, giữ anh lại mãi mãi bên em".
   - Khám xét phòng trọ (`14`): Thu giữ chiếc áo gió trùm đầu dính bùn đỏ và **lọn tóc mai dính máu của Khang giấu trong áo ngực của Hà (kết quả giám định ADN trùng khớp 100%)**.

---

## ⚖️ VI. BIÊN BẢN KẾT LUẬN ĐIỀU TRA: CÁO TRẠNG ĐỊNH TỘI HUNG THỦ

Người điều tra hoàn thành **Bản Cáo Trạng Định Tội (Phá Án)** để nộp báo cáo:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│              BIÊN BẢN KẾT LUẬN ĐIỀU TRA CHUYÊN ÁN #000                  │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. CHỈ DANH THỦ PHẠM CHÍNH:                                             │
│    [◉] TRẦN THỊ HÀ (ha)                                                 │
│    [ ] NGUYỄN THANH TÙNG (tung)                                         │
│    [ ] LÊ QUANG VŨ (vu)                                                 │
│    [ ] TRẦN NGỌC MAI (mai)                                              │
│                                                                         │
│ 2. XÁC ĐỊNH ĐỘNG CƠ GÂY ÁN:                                             │
│    [◉] Tình ái / Ghen tuông cuồng sở hữu độc hại (`romantic-jealousy`) │
│    [ ] Thù hận vụ tai nạn trốn tìm 1998 (`revenge-1998`)                │
│    [ ] Tranh chấp di chúc đất đai 200m2 (`land-dispute`)                │
│    [ ] Bị tống tiền khoản nợ 300 triệu (`debt-blackmail`)               │
│                                                                         │
│ 3. CẶP CHỨNG CỨ BẺ GÃY MỐC GIỜ NGOẠI PHẠM:                             │
│    Vật chứng 1: [ EV-GLASS-SHARD ] (Báo cáo pháp y giờ tử vong 21:00)   │
│    Vật chứng 2: [ EV-TIME-MISMATCH ] (Biên bản 07d - Lỗi lỡ lời của Hà) │
└─────────────────────────────────────────────────────────────────────────┘
```

### 🏆 Đánh Giá Kết Quả Phá Án:
* **Phá Án Hoàn Hảo (100 Điểm):** Chỉ danh đúng Hà + Đúng động cơ Ghen tuông + Đính kèm đúng 2 bằng chứng mốc giờ + Không phụ thuộc gợi ý.
* **Phá Án Đạt Yêu Cầu (80-95 Điểm):** Bắt đúng Hà nhưng thiếu 1 vật chứng.
* **Sai Lệch Án Tích:** Sập bẫy kết tội oan Tùng, Mai hoặc Vũ.

---

## 📖 VII. HỒ SƠ HẬU ÁN: 4 GÓC KHẤT TÂM LÝ (EPILOGUE STORIES DASHBOARD)

Sau khi đạt **S-Rank**, giao diện Victory Screen mở khóa nút bấm tùy chọn:  
🔘 **`[📖 Đọc Ký Sự Hậu Án: 4 Góc Khất Tâm Lý]`**

```text
┌─────────────────────────┬─────────────────────────┐
│ 🩸 Ký Sự 1: HÀ          │ 🧱 Ký Sự 2: VŨ          │
│ "Ký sự biệt giam & Lời  │ "Gánh nặng gá nghĩa &   │
│ tự sự điên dại"         │ Nỗi sợ kẻ cùng đường"   │
├─────────────────────────┼─────────────────────────┤
│ 📻 Ký Sự 3: BI KỊCH 1998│ ⚖️ Ký Sự 4: MAI         │
│ "Tiếng còi đồng câm lặng│ "Bản di chúc ông nội &  │
│ trong tủ gỗ âm tường"   │ Lời tạ tội muộn màng"   │
└─────────────────────────┴─────────────────────────┘
```

---

## 🧩 VIII. MANH MỐI TỔ CHỨC VĨ MÔ (MACRO METAGAME TRACE)

> *Trong đống đồ chơi cũ của Gia Huy được giấu sâu trong khoang tủ âm tường, điều tra viên tìm thấy một mảnh giấy note ghi chép các vị trí trốn tìm kèm theo ký hiệu con dấu sáp **Quân XE** (`XE-CARD-000`). Đây là manh mối mở đầu dẫn dắt sang **Vụ Án #001** về mạng lưới 5 Quân Cờ ngầm trong thành phố...*
