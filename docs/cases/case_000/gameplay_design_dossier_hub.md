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
   • Sự cố sập sóng TV TH3 (20:00)         • Bác bỏ alibi bằng Ghim cài áo           • Bóc trần ngoại phạm VTV3 thứ Sáu
   • Chà than chì sổ nợ rách 150M          • Bút tích sau khung tranh gỗ 1998        • Bắt lỗi lỡ lời "bình trà vỡ"
   • Giải mã Unix Timestamp POS Km18       • Ghép Puzzle bài báo ngạt khí tủ         • Màn hình tin nhắn bồ nhí 20:40
   • Red Herrings: Bùn đỏ & Cúc áo         • Bẫy Red Herring: Xô ngã lúc 20:00       • Tang vật: Lọn tóc ADN trong áo ngực
               │                                       │                                       │
               └───────────────────────────────────────┼───────────────────────────────────────┘
                                                       │
                                                       ▼
                           ┌────────────────────────────────────────────────────────┐
                           │              BÀN KẾT ÁN CHUNG CUỘC (TERMINAL)          │
                           │  • Chỉ danh Thủ phạm chính: TRẦN THỊ HÀ (ha)           │
                           │  • Xác định Động cơ: Ghen tuông cuồng sở hữu độc hại   │
                           │  • Cặp chứng cứ mâu thuẫn mốc giờ: Pháp y 21:00 & 07d  │
                           │  • Phán quyết S-Rank & Mở khóa 4 Ký Sự Hậu Án          │
                           │  • Thu thập Manh mối Tổ chức vĩ mô: QUÂN XE (TEST-99)  │
                           └────────────────────────────────────────────────────────┘
```

---

## ⚡ II. CHUỖI DÂY CHUYỀN SỰ KIỆN ĐÊM MƯA LỚN (DOMINO CHAIN REACTION)

Mọi diễn biến trong đêm 24/07/2026 tạo thành một chuỗi Domino tác động liên hoàn đẩy nạn nhân đến cái chết:

```text
[18:30 – 18:50] MAI chở Vũ sang cãi vã đòi 50% đất 200m² -> Ném Đơn tố cáo xuống sàn rồi bỏ về lúc 18:50.
       │
       ▼ (Khiến Vũ sợ bị lộ món nợ 150M, Khang đắc chí tống tiền uy hiếp)
[19:00 – 19:15] VŨ quỳ lạy van xin hoãn nợ -> Bị Khang tát 2 cái, giật đứt cúc áo xanh đen -> Hoảng loạn cướp xé sổ nợ chạy trốn.
       │
       ▼ (Khang tức điên vì bị xé sổ nợ, nốc thêm rượu say khướt và trong trạng thái kích động hung hãn)
[20:00 – 20:15] TÙNG sang đối chất vụ án 1998 -> Khang say rượu giật xé bài báo nhạo báng -> TÙNG xô ngã Khang đập gáy bất tỉnh, vỡ bình trà lúc 20:00 -> Tùng tháo chạy lúc 20:15, quên khép cổng dưới mưa.
       │
       ▼ (Hà rình rập ngoài ngõ thấy Tùng chạy và cổng hé mở -> Lén chui vào nhà lúc 20:45)
[20:48 – 21:00] HÀ thấy Khang ngất, đúng lúc điện thoại Khang sáng tin nhắn rủ đi Đà Lạt của bồ mới (Vy) -> Cơn ghen cuồng loạn bùng nổ -> HÀ vơ mảnh thủy tinh đâm đứt động mạch cổ Khang lúc 21:00!
       │
       ▼ (Hà cắt lọn tóc mai dính máu nhét vào áo ngực rồi chuồn ra cửa sau lúc 21:08)
[21:20 – 22:05] BÀ LỤA phát hiện thi thể -> Báo công an 21:25 -> Khám nghiệm thấy Đơn tố cáo tên Mai lúc 21:45 -> Triệu tập Mai lúc 22:05.
```

---

## 🛠️ III. HỆ THỐNG 9 CÔNG CỤ ĐIỀU TRA KỸ THUẬT SỐ TRÊN NOCTURNE (INVESTIGATION OS TOOLS)

Hệ thống NOCTURNE cung cấp cho người chơi **9 công cụ nghiệp vụ tương tác trực quan**:

| STT | Tên Công Cụ Kỹ Thuật Số | Mô Tả Chức Năng | Ứng Dụng Trong Vụ Án #000 |
| :---: | :--- | :--- | :--- |
| **1** | **`Optical Overlay Desk`**<br>(Bàn soi quang học) | Cho phép kéo thả, xoay và chỉnh độ trong suốt (opacity) để đặt chồng khít 2 tài liệu chữ ký. | Soi đè `Giấy ủy quyền giả (EV-SIGN-01)` và `Biên bản gia đình (EV-SIGN-02)` $\rightarrow$ Trùng khít 100% nét ký (Tracing Fraud). |
| **2** | **`Carbon Pencil Shading Tool`**<br>(Công cụ cà than chì) | Thao tác chà bút chì / quét đèn chiếu xiên (Oblique Light) lên mặt giấy trắng. | Chà lên trang trắng sổ nợ rách `10a` $\rightarrow$ Hiện rõ vết hằn bút bi ghi nợ 150M của Lê Quang Vũ. |
| **3** | **`Unix Timestamp Decoder`**<br>(Bộ giải mã Unix Epoch) | Nhập chuỗi số Barcode POS / Unix Timestamp để chuyển đổi ra ngày giờ thực GMT+7. | Nhập mã `1787924110` trên hóa đơn Km18 $\rightarrow$ Ra **20:35:10 - 24/07/2026** (Minh oan Vũ). |
| **4** | **`Audio Spectrogram Analyzer`**<br>(Phổ ký & Bộ lọc âm thanh) | Bật/tắt các dải tần số để khử giọng nói người và khuếch đại âm thanh môi trường nền. | Lọc tin nhắn thoại 20:32 $\rightarrow$ Bóc tách tiếng còi tàu diesel & chuông rào chắn trước nhà Khang (Vạch trần Hà). |
| **5** | **`Newspaper Puzzle Assembler`**<br>(Bàn ghép mảnh puzzle) | Kéo thả, xoay và ghép các mẩu giấy báo vụn bị xé rách tại hiện trường. | Ghép các mảnh báo rải rác `p5` thành bài báo hoàn chỉnh vụ ngạt khí tủ âm tường năm 1998. |
| **6** | **`Phone / Voicemail Simulator`**<br>(Bộ giả lập điện thoại `dev-00`) | Giao diện điện thoại cảm ứng: đọc SMS, nghe hộp thư thoại, xem danh bạ, nhật ký cuộc gọi. | Khai thác tin nhắn đe dọa 19:15, Voicemail 20:32, tin nhắn bồ nhí 20:40, cuộc gọi nhỡ 20:55 của Tùng. |
| **7** | **`3D Artifact & Frame Inspector`**<br>(Kính lúp & Xoay vật chứng 3D) | Xoay 360 độ vật phẩm, cạy nắp, tháo mặt sau khung tranh gỗ, soi cận cảnh vết máu. | Tháo mặt sau khung tranh `p4` tìm bút tích 1998; soi dấu vân tay miết trên mảnh kính `p3`; kiểm tra cúc áo `EV-SHIRT-BUTTON`. |
| **8** | **`Broadcast & Technical Log Viewer`**<br>(Bảng tra cứu lịch sóng) | Xem lịch phát sóng các đài truyền hình (VTV3, TH3) và nhật ký sự cố trạm phát cáp. | Tra cứu sự cố sập cáp TH3 khu X (20:00-20:12) cho Mai & Bóc trần VTV3 thứ Sáu chỉ chiếu Gameshow cho Hà. |
| **9** | **`Accusation & S-Rank Terminal`**<br>(Bàn kết án & Định tội) | Giao diện nộp cáo trạng: Chọn thủ phạm, chọn động cơ, kéo thả 2 chứng cứ đối chất mốc giờ. | Chấm điểm Radar, phân hạng S-Rank/A-Rank, kích hoạt mở khóa 4 Ký sự Hậu án và Quân Xe. |

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
  - `21:20`: Phát hiện thi thể Khang trên vũng máu $\rightarrow$ Báo công an lúc 21:25.

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
   • Minigame Soi Đè 3 Mẫu Chữ Ký                                    • Minigame Chà Than Chì Sổ Nợ Rách
     (Giấy ủy quyền trùng khít 100% Biên bản gia đình                  (Hiện vết hằn nợ 150M & dọa báo bố vợ)
     -> Khang dùng kỹ thuật Tracing làm giả)                           -> Giải thích vết bầm má & cúc áo đứt lúc 19:15.
   • Bằng Chứng Ngoại Phạm Sóng TV TH3                               • Giải Mã Unix Timestamp Hóa Đơn Km18
     (Kênh TH3 sập cáp khu X đúng 20:00-20:12                          (Barcode 1787924110 -> 20:35:10, cách 14km)
     -> Mai xem TV ở nhà suốt đêm)                                     -> Không thể kịp quay lại sát hại lúc 21:00.
        │                                                                 │
        └────────────────────────────────┬────────────────────────────────┘
                                         ▼
                         [MINH OAN MAI & VŨ VÔ TỘI]
```

#### 🧩 Chi tiết 4 Cơ chế Khám phá Nhánh A:
1. **Cơ chế 1 — Minigame Bàn Soi Quang Học Soi Đè Chữ Ký (`EV-SIGNATURE-TRACING`):**
   - Người chơi đặt `Giấy ủy quyền đất 200m2 (EV-SIGN-01)` đè lên `Biên bản gia đình gốc (EV-SIGN-02)`.
   - *Kết quả giám định:* Hai chữ ký trùng khít 100% từng góc lượn, độ nghiêng và chấm mực. Khoa học hình sự khẳng định không ai ký tay tự nhiên 2 lần trùng khớp tuyệt đối $\rightarrow$ Khang đã **đồ nét (tracing)** để chiếm đoạt đất 200m² thế chấp ngân hàng. Đơn tố cáo của Mai là hành vi đòi công lý hợp pháp.
2. **Cơ chế 2 — Đối chiếu Sự cố Sóng Truyền Hình (`EV-TV-GLITCH`):**
   - Mai khai lúc 20:00 xem kênh `TH3` bị màn hình xanh 12 phút.
   - Đối chiếu `Nhật ký kỹ thuật Đài TH3 (09)`: Trạm phát sóng cáp Phân khu X bị sập đúng **12 phút (20:00 – 20:12)**. Trong khi trạm Bờ Sông (nhà Khang / Bà Lụa) vẫn phát bình thường.
   - $\rightarrow$ Chứng minh Mai ở nhà riêng suốt buổi tối. **MINH OAN CHO MAI.**
3. **Cơ chế 3 — Minigame Chà Than Chì Trang Sổ Nợ Rách (`EV-DEBT-INDENTATION`):**
   - Sử dụng công cụ chà bút chì than lên trang giấy trắng kế tiếp trong cuốn sổ da bị xé (`10a`).
   - *Hiện rõ nét hằn:* *"Ngày 12/03/2026: Thằng Vũ (chồng con Mai) bốc họ 150.000.000đ. Lãi 5k/ngày. Hạn chót 30/07. Cầm cố: Danh dự gia đình, không trả tao méc bố vợ."*
   - Bóc trần lời khai gian dối của Vũ, làm rõ vết bầm gò má và cúc áo đứt là do Khang tát và giằng co lúc 19:10 khi Vũ van xin hoãn nợ.
4. **Cơ chế 4 — Tra cứu Unix Timestamp & Bài toán Quãng đường (`EV-POS-RECEIPT-UNIX`):**
   - Hóa đơn mua nước giải rượu Ladodetox tại Trạm xăng Km18 Quốc Lộ bị nhòe nước mưa, mã Barcode `1787924110`.
   - Tra cứu Unix Converter: `1787924110` $\rightarrow$ **20:35:10 ngày 24/07/2026**.
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
5. **Cơ chế 5 — Động cơ Ái kỷ Điên loạn & Tang vật ADN lọn tóc:**
   - Lúc 20:48, màn hình điện thoại Khang sáng tin nhắn rủ đi Đà Lạt của bồ mới (Vy) $\rightarrow$ Kích hoạt sát tâm.
   - Hà thì thầm bài đếm số trốn tìm, vơ mảnh thủy tinh `p3` đâm đứt động mạch cổ Khang lúc 21:00 để "giữ anh lại mãi mãi bên em".
   - Khám xét phòng trọ (`14`): Thu giữ chiếc áo gió trùm đầu dính bùn đỏ và **lọn tóc mai dính máu của Khang giấu trong áo ngực của Hà (kết quả giám định ADN trùng khớp 100%)**.

---

## ⚖️ VI. BÀN KẾT ÁN CHUNG CUỘC: TERMINAL S-RANK VERDICT

Người chơi mở **Bàn Kết Án (Accusation Terminal)** để nộp bản báo cáo định tội:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     BÁO CÁO KẾT TỘI CHUYÊN ÁN #000                      │
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
│    [ ] Bị tống tiền khoản nợ 150 triệu (`debt-blackmail`)               │
│                                                                         │
│ 3. CẶP CHỨNG CỨ BẺ GÃY MỐC GIỜ NGOẠI PHẠM:                             │
│    Vật chứng 1: [ EV-GLASS-SHARD ] (Báo cáo pháp y giờ tử vong 21:00)   │
│    Vật chứng 2: [ EV-TIME-MISMATCH ] (Biên bản 07d - Lỗi lỡ lời của Hà) │
└─────────────────────────────────────────────────────────────────────────┘
```

### 🏆 Tiêu chuẩn Xếp hạng Phá án (Ranking Rules):
* **Hạng S (S-Rank - 100 Điểm):** Bắt đúng Hà + Đúng động cơ Ghen tuông + Đính kèm đúng 2 bằng chứng mốc giờ + Sử dụng $\le 1$ gợi ý.
* **Hạng A (A-Rank - 80-95 Điểm):** Bắt đúng Hà nhưng sai 1 vật chứng hoặc dùng 2-3 gợi ý.
* **Hạng B/C (Bị trừ 20-30 điểm):** Sập bẫy kết tội nhầm Tùng, Mai hoặc Vũ.

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
