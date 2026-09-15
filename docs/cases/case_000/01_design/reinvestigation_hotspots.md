# 🔍 CASE #000 — DANH SÁCH ĐIỂM KHÁM XẾT LẠI (RE-INVESTIGATION HOTSPOTS)

> **Mục đích:** Đặc tả danh sách các vị trí tương tác (Chấm đỏ / Hotspot) trên **bức ảnh 2D góc rộng phối cảnh phòng khách** hiện trường nhà nạn nhân Nguyễn Văn Khang (Số 14 Đường Bờ Sông).
>
> **Visual Concept:** Phong cách Point-and-Click trinh thám cổ điển — Sử dụng 01 bức ảnh/tranh vẽ tĩnh 2D toàn cảnh góc nhìn ngang vào căn phòng khách (tỉ lệ 16:9). Các chấm đỏ (`🔴 Hotspots`) được gắn trực tiếp lên các đồ vật trong phòng. Khi click, màn hình zoom 2D mượt mà vào chi tiết đó (CSS/Framer transform `scale` & `translate`) và phát âm thanh SFX.

---

## 📍 TỔNG QUAN PHỐI CẢNH 2D CĂN PHÒNG & TỌA ĐỘ HOTSPOT

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 🖼️ BỨC ẢNH 2D PHỐI CẢNH PHÒNG KHÁCH & PHÒNG NGỦ (GÓC NHÌN NGANG RỘNG)  │
 │                                                                        │
 │ [🚪 Cửa chính / Nhìn ra gốc xoan]          [🪟 Cửa sổ nhìn ra ray tàu] │
 │  (🔴 Spot #2)                              (🔴 Spot #1)                │
 │                                                                        │
 │          [🛋️ Bàn trà, Khung ảnh & Ghe sofa (Thỏi son)]                 │
 │           (🔴 Spot #3 & 🔴 Spot #6: Khe ghế sofa)                     │
 │                                                                        │
 │ [🗑️ Thùng rác & Cửa ngách sau]   [📦 Tủ gỗ 1996 & Kẹp sách (Chia đất)]│
 │  (🔴 Spot #5)                    (🔴 Spot #4 & 🔴 Spot #7)            │
 │                                                                        │
 │                   [🛏️ Giường ngủ & Gối nằm (Bùa yêu)]                  │
 │                    (🔴 Spot #8)                                        │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 CHI TIẾT DANH SÁCH ĐIỂM TƯƠNG TÁC (🔴 HOTSPOTS)

### 🔴 Spot #1: Khung cửa sổ mở hé (Hướng ra đường sắt)
* **Vị trí tọa độ sơ đồ:** `(x: 72%, y: 35%)` — Phía góc trên bên phải phòng khách.
* **Hành động Zoom:** Camera phóng to cận cảnh 2.2x vào gờ cửa sổ mở hé.
* **Vật thể quan sát được (Ảnh/Sơ đồ zoom):**
  * Khung cửa sổ gỗ cũ mở hé khoảng 15cm nhìn thẳng ra gác chắn đường sắt Phân Khu Cảng.
  * Phấn hoa xoan vàng nhạt bám nhẹ ở gờ mép cửa sổ.
* **Âm thanh kích hoạt (SFX / Ambient):**
  * 🔊 **Tiếng còi tàu hỏa & chuông gác chắn rú vang (68 dB)**.
* **Ghi chú quan sát & Ẩn ý bối cảnh:**
  * Tiếng còi tàu và chuông gác chắn vọng vào phòng rất rõ từ ô cửa sổ này. Có bụi phấn hoa xoan vương trên gờ cửa như thể ai đó vừa tì người hoặc đứng rất sát cạnh cửa sổ lúc tàu chạy qua.

---

### 🔴 Spot #2: Gốc cây xoan trước cổng ngõ số 14
* **Vị trí tọa độ sơ đồ:** `(x: 28%, y: 65%)` — Góc dưới bên trái ngoài sân/cổng.
* **Hành động Zoom:** Camera phóng to cận cảnh 2.0x vào nền đất ẩm dưới gốc cây xoan.
* **Vật thể quan sát được (Ảnh/Sơ đồ zoom):**
  * Dấu vết đất bị giẫm lõm sâu (vết đế giày nhỏ cỡ 37 của nữ).
  * Vài cành lá non và chùm hoa xoan rụng lả tả quanh gốc.
* **Âm thanh kích hoạt (SFX):**
  * 🍃 **Tiếng gió rít nhẹ + tiếng lá cây xơ xác & tiếng bước chân nhẹ trên đất ẩm**.
* **Ghi chú quan sát & Ẩn ý bối cảnh:**
  * Nền đất ẩm dưới tán xoan bị xáo trộn do có người nán lại đứng chờ một khoảng thời gian khá lâu, vị trí này có góc nhìn bao quát thẳng vào cửa chính căn nhà.

---

### 🔴 Spot #3: Góc bàn trà & Khung ảnh kỷ niệm bị vỡ
* **Vị trí tọa độ sơ đồ:** `(x: 48%, y: 50%)` — Giữa phòng khách.
* **Hành động Zoom:** Camera phóng to cận cảnh 1.8x vào mặt bàn và nền nhà.
* **Vật thể quan sát được (Ảnh/Sơ đồ zoom):**
  * Mảnh ấm chén bình trà vỡ nát và khung ảnh kỷ niệm 1996 bung góc nằm lăn lóc.
  * Vết tróc sơn mới toanh trên cạnh gờ bàn gỗ.
* **Âm thanh kích hoạt (SFX):**
  * 💥 **Tiếng gốm sứ / thủy tinh va chạm khô khốc & tiếng thở dốc ngắn**.
* **Ghi chú quan sát & Ẩn ý bối cảnh:**
  * Dấu hiệu của một cuộc giằng co xô đẩy bột phát và nặng nề giữa hai người đàn ông, đồ đạc rơi vỡ vung vãi trước khi một bên hoảng hốt rút lui.

---

### 🔴 Spot #4: Chiếc tủ gỗ cũ gài then sắt (Gian phòng trong)
* **Vị trí tọa độ sơ đồ:** `(x: 82%, y: 68%)` — Gian trong góc phòng khách.
* **Hành động Zoom:** Camera phóng to cận cảnh 1.8x vào then cài sắt và cánh tủ gỗ.
* **Vật thể quan sát được (Ảnh/Sơ đồ zoom):**
  * Cánh tủ gỗ lim cũ kỹ, then cài then sắt bên ngoài đã hoen gỉ theo năm tháng.
  * Trên nóc tủ: Lớp bụi dầy bị xáo trộn bởi một vết đập cả bàn tay còn hằn rõ.
  * Mép cánh tủ hé mở, sâu bên trong vách gỗ còn vương những vệt cào móng tay đã mờ ố từ rất lâu.
* **Âm thanh kích hoạt (SFX):**
  * 🚪 **Tiếng kẽo kẹt của then sắt cài sập & tiếng đập bàn tay uất ức**.
* **Ghi chú quan sát & Ẩn ý bối cảnh:**
  * Dấu vết bàn tay đập mạnh trên bụi nóc tủ cho thấy sự kích động tâm lý dữ dội của người đến thăm khi đối diện với kỷ vật gắn liền với một tai nạn bi thương trong quá khứ.

---

### 🔴 Spot #5: Thùng rác & Lối cửa hậu (Hành lang sau nhà)
* **Vị trí tọa độ sơ đồ:** `(x: 18%, y: 40%)` — Góc hành lang gần cửa hậu.
* **Hành động Zoom:** Camera phóng to cận cảnh 2.0x vào thùng rác và tay nắm cửa hậu.
* **Vật thể quan sát được (Ảnh/Sơ đồ zoom):**
  * Trong thùng rác: 01 mẩu khăn giấy ướt bị vò nhăn dính vệt màu nhờ nhờ pha lẫn vệt son dưỡng bóng và vài hạt phấn hoa xoan.
  * Chốt then cửa hậu bật mở hé, tay nắm bên trong có vết quẹt mờ đã được lau qua.
* **Âm thanh kích hoạt (SFX):**
  * 📄 **Tiếng sột soạt vò giấy & tiếng kéo then chốt cửa rút lui vội vã**.
* **Ghi chú quan sát & Ẩn ý bối cảnh:**
  * Dấu vết cho thấy một người vừa vội vã chùi tay, mở then cửa sau rồi lén lút rút lui ra ngõ nhỏ phía sau để tránh gây chú ý ngoài mặt đường chính.

---

### 🔴 Spot #6: Khe ghế sofa phòng khách (Thỏi son rơi & Sợi tóc vàng)
* **Vị trí tọa độ sơ đồ:** `(x: 52%, y: 56%)` — Nằm rớt trong khe đệm ghế sofa gỗ/da phòng khách.
* **Hành động Zoom:** Camera phóng to cận cảnh 2.5x rọi sâu vào khe giữa 2 đệm ghế sofa.
* **Vật thể quan sát được (Ảnh/Sơ đồ zoom):**
  * 💄 01 Thỏi son trang điểm nắp mạ vàng bị đánh rơi mắc kẹt trong rãnh đệm.
  * Dính chặt trên thân thỏi son là **01 sợi tóc dài uốn nhuộm màu vàng kim (blonde hair)**.
* **Âm thanh kích hoạt (SFX):**
  * 🔍 **Tiếng lách tách kim loại nhẹ & tiếng sột soạt kiểm tra vật chứng**.
* **Ghi chú quan sát & Ẩn ý bối cảnh:**
  * Khang có lối sống ăn chơi phóng túng, thường xuyên đưa nhiều phụ nữ khác nhau về nhà qua đêm (sợi tóc vàng không phải của Hà — tóc đen ngang vai, cũng không phải của Mai — tóc đen buộc đuôi ngựa).

---

### 🔴 Spot #7: Cuốn sổ gia xóm / Khe bàn làm việc (Di thư chia đất 50:50 của Ông Nội)
* **Vị trí tọa độ sơ đồ:** `(x: 85%, y: 55%)` — Kẹp giữa khe bàn gỗ / cuốn sổ cũ gần tủ gỗ.
* **Hành động Zoom:** Camera phóng to cận cảnh 2.2x vào tờ giấy dó cổ kẹp trong cuốn sổ tay cũ.
* **Vật thể quan sát được (Ảnh/Sơ đồ zoom):**
  * 📄 01 Tờ di thư/chép tay bằng mực tàu đã ố vàng của Ông Nội để lại.
  * **Nội dung trích đoạn ghi rõ:** Nguồn gốc di sản nhà đất 200m² được chia **50:50 đồng đều cho 2 cháu (Nguyễn Văn Khang và Nguyễn Ngọc Mai)**, bác bỏ toàn bộ giấy tờ đứng tên chính chủ một mình Khang.
* **Âm thanh kích hoạt (SFX):**
  * 📜 **Tiếng giở trang giấy dó cũ & tiếng bút lông mực tàu sột soạt**.
* **Ghi chú quan sát & Ẩn ý bối cảnh:**
  * Vật chứng mang tính pháp lý cốt lõi chứng minh Mai hoàn toàn có cơ sở đòi lại 100m² quyền lợi chính đáng; đồng thời vạch trần hành vi gian dối, giấu giếm di thư của Khang nhằm chiếm đoạt toàn bộ tài sản.

---

### 🔴 Spot #8: Ruột gối nằm phòng ngủ nạn nhân (Lá Bùa Yêu Yếm Chỉ Đỏ)
* **Vị trí tọa độ sơ đồ:** `(x: 40%, y: 80%)` — Phòng ngủ gian sau, rọi sâu vào ruột gối bông.
* **Hành động Zoom:** Camera phóng to cận cảnh 2.5x khi mổ khóa kéo ruột gối nằm của Khang.
* **Vật thể quan sát được (Ảnh/Sơ đồ zoom):**
  * 🔮 01 Lá bùa yếm được gấp thành hình tam giác nhỏ bằng vải đỏ/giấy dó yếm bùa.
  * **Bên trong lá bùa chứa:**
    - Dòng chữ viết tay bằng mực son ghi họ tên, ngày tháng năm sinh của Nguyễn Văn Khang & Trần Thị Hà.
    - 01 lọn tóc nhỏ của Hà được quấn buộc chặt bằng sợi chỉ đỏ tươi.
* **Âm thanh kích hoạt (SFX):**
  * 🕯️ **Tiếng thì thầm thần chú ma mị u uất & tiếng xé vải/chỉ đỏ nhẹ**.
* **Ghi chú quan sát & Ẩn ý bối cảnh:**
  * Minh chứng cho sự cuồng yêu ám ảnh bệnh hoạn và mụ mị của Trần Thị Hà. Hà đã lén nhét bùa yêu vào gối nằm của Khang với mong muốn trói buộc tâm trí Khang vĩnh viễn không thể rời xa mình.

---

## ⚙️ BẢNG TỔNG HỢP HIỆU ỨNG TƯƠNG TÁC (INTERACTION MATRIX)

| Mã Spot | Tên vị trí | Tỷ lệ Zoom | Tọa độ (x, y) | Hình ảnh trực quan cận cảnh | Hiệu ứng âm thanh (SFX) | Ẩn ý gợi mở điều tra |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **Spot #1** | 🪟 Cửa sổ đường sắt | **2.2x** | `(72%, 35%)` | Khung cửa hé 15cm, phấn hoa xoan bám gờ cửa | 🔊 Còi tàu hỏa & chuông gác chắn | Gợi nhớ tạp âm nền còi tàu lọt vào trong một bản thu âm nào đó |
| **Spot #2** | 🌳 Gốc cây xoan | **2.0x** | `(28%, 65%)` | Vết giày nữ size 37, cành xoan rụng quanh gốc | 🍃 Gió rít & bước chân trên đất ẩm | Gợi ý có bóng người kiên nhẫn đứng rình rập ngoài cổng |
| **Spot #3** | 🛋️ Bàn trà & mảnh vỡ | **1.8x** | `(48%, 50%)` | Mảnh bình trà vỡ, vết xước gờ bàn xô xát | 💥 Thủy tinh va chạm & tiếng ngất | Tái hiện hiện trường cuộc xô xát bột phát giữa hai người |
| **Spot #4** | 📦 Chiếc tủ gỗ 1996 | **1.8x** | `(82%, 68%)` | Then sắt rỉ sét, bụi nóc tủ in vết tay giận dữ | 🚪 Then sắt cài sập & tiếng đập tay | Gợi nhắc nỗi đau uất ức về một ký ức bị niêm phong 20 năm |
| **Spot #5** | 🗑️ Thùng rác & Cửa hậu | **2.0x** | `(18%, 40%)` | Khăn giấy dính son & phấn xoan, chốt cửa mở hé | 📄 Vò giấy & tiếng then cửa tẩu thoát | Gợi ý dấu vết một bóng người vội vã rút lui theo lối ngõ sau |
| **Spot #6** | 💄 Khe ghế sofa | **2.5x** | `(52%, 56%)` | Thỏi son rơi, sợi tóc uốn nhuộm vàng kim dính trên son | 🔍 Tiếng lách tách kim loại & sột soạt | Thể hiện lối sống phóng túng của Khang, thường đưa gái lạ về |
| **Spot #7** | 📜 Di thư chi tiết đất | **2.2x** | `(85%, 55%)` | Di thư chép tay ông nội chia đất 50:50 cho Khang & Mai | 📜 Giấy dó sột soạt & tiếng bút mực | Chứng minh quyền lợi chính đáng của Mai & Khang gian dối giấu bài |
| **Spot #8** | 🔮 Bùa yêu trong gối | **2.5x** | `(40%, 80%)` | Bùa vải đỏ, viết tên Khang-Hà bằng mực son, lọn tóc buộc chỉ đỏ | 🕯️ Tiếng thì thầm thần chú ma mị | Thể hiện sự cuồng yêu ghen tuông bệnh hoạn, mù quáng của Hà |

---

## 🎯 QUY TRÌNH TRẢI NGHIỆM CỦA NGƯỜI CHƠI (USER FLOW)

1. **Người chơi mở menu FAB góc phải** ➔ Bấm chọn nút **"Khám xét lại"**.
2. **Màn hình hiện sơ đồ toàn cảnh** với 8 chấm đỏ nhấp nháy (`🔴 Spot #1` đến `🔴 Spot #8`).
3. **Người chơi nhấp vào từng chấm đỏ**:
   * Camera mượt mà zoom cận cảnh vào đúng tọa độ của điểm đó.
   * Âm thanh đặc trưng của vị trí đó vang lên (VD: Tiếng còi tàu hỏa vang lên khi nhấp vào cửa sổ, tiếng thì thầm ma mị khi nhấp vào bùa yêu).
4. **Nhấp lại lần nữa hoặc nhấp ra khoảng trống**: Camera tự động zoom out trở lại sơ đồ toàn cảnh.

