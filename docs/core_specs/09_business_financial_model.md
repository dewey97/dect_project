# 💼 Mô Hình Kinh Doanh, Tài Chính & Phân Bổ Sáng Lập

> **Trạng thái:** Bản thảo chiến lược tổng hợp  
> **Cập nhật lần cuối:** 2026-10-10  
> **Tài liệu liên quan:** `07_license_access_system.md`, `08_license_technical_spec.md`

---

## PHẦN 1: MÔ HÌNH KINH DOANH & CÁC DÒNG DOANH THU

Dự án kết hợp giữa **Boardgame** (tạo niềm tin, hiện vật cầm nắm, tính gắn kết xã hội) và **Bản Online** (biên lợi nhuận cao, khả năng nhân rộng không giới hạn).

```
   ┌────────────────────────────────────────────────────────┐
   │                                                        ▼
[Bán Bộ Boardgame] ──► [Quét QR vào App] ──► [Tạo tài khoản / Chơi thử]
                                                        │
                                                        ▼
[Mua tiếp Vụ án sau / Mua Lượt nhóm] ◄── [Trải nghiệm xuất sắc]
```

### 1.1. Doanh thu Boardgame
* **Đối tượng:** Nhóm bạn thích cầm hiện vật, chơi trực tiếp, quà tặng sinh nhật.
* **Quy cách:** Hộp hồ sơ vụ án, biên bản khám nghiệm, ảnh hiện trường in màu, chứng cứ thực tế (vải, thư tay, mã QR kích hoạt web tool).
* **Mức giá dự kiến:** `249.000đ – 349.000đ` / bộ.
* **Kênh phân phối:** Shopee, TikTok Shop, mạng xã hội, các quán Boardgame Cafe.

### 1.2. Doanh thu Bản Online
* **Đối tượng:** Người chơi đơn lẻ, người ở xa, nhóm bạn chơi online từ xa.
* **Nội dung:** Toàn bộ tài liệu số tương tác, ảnh pháp y chất lượng cao, file thoại thẩm vấn, hiện trường 3D.
* **Cấu trúc gói bán:**
  * **Gói Đơn (Solo):** `69.000đ – 89.000đ` (quyền chơi vĩnh viễn cho 1 tài khoản).
  * **Gói Nhóm (Party):** `129.000đ – 149.000đ` (quyền chơi đơn + 3 lượt tạo phòng chơi chung).
* **Biên lợi nhuận gộp:** `> 90%` (chỉ trừ phí cổng thanh toán ngân hàng/QR ~1.5% - 2%).

### 1.3. Bán Lẻ Lượt Chơi Nhóm
* **Đối tượng:** Khách hàng đã có gói Đơn hoặc đã dùng hết lượt nhóm, muốn mở phòng mới cho nhóm bạn khác.
* **Mức giá:** `25.000đ – 35.000đ` / 1 lượt tạo phòng.

---

## PHẦN 2: CẤU TRÚC CHI PHÍ & DỰ PHÓNG TÀI CHÍNH

### 2.1. Chi Phí Cố Định
* **Hạ tầng máy chủ (VPS):** ~150.000đ – 300.000đ / tháng (đã chạy Docker tối ưu tại `72.62.199.110`).
* **Tên miền:** ~250.000đ – 350.000đ / năm.
* **Lưu trữ & Dịch vụ Cloud:** Sử dụng gói miễn phí Supabase + Cloudflare (chi phí hiện tại ~0đ).

### 2.2. Chi Phí Sản Xuất Boardgame

Cấu trúc sản phẩm được bóc tách thành 3 nhóm linh kiện độc lập:
1. **Ruột tài liệu:** Đa số in màu/đen trắng trên giấy màu (kraft, ngả vàng vintage, xi măng) để tạo chất hồ sơ vụ án cũ; số ít in trên giấy trắng (kết quả giám định y khoa, xét nghiệm hóa sinh).
2. **Hiện vật vụ án:** Mẫu vật chứng (túi zip, vải chứng cứ, thư tay, tem niêm phong, ảnh polaroid chụp hiện trường).
3. **Bao bì ngoài:** Cân nhắc giữa **Túi hồ sơ giấy Kraft dây quấn** (chuẩn phong cách hồ sơ tuyệt mật vụ án, chi phí thấp, nhẹ tiền ship) và **Hộp cứng nắp gài** (sang trọng, bảo vệ tốt hơn nhưng chi phí và cước vận chuyển cao hơn).

#### Bảng 1: Bóc tách chi phí linh kiện trên 1 bộ theo quy mô sản xuất (VNĐ)

| Nhóm cấu phần | Chi tiết quy cách | In mẫu lẻ (< 10 bộ) | Lô nhỏ (50 – 100 bộ) | Lô chuẩn (300 – 500 bộ) |
|---|---|---|---|---|
| **1. Ruột tài liệu** | ~15–20 trang A4/A5 giấy màu ngả vàng + giấy trắng | 45.000 – 60.000 | 25.000 – 35.000 | 18.000 – 25.000 |
| **2. Ảnh & Hiện vật** | 4-6 ảnh hiện trường + 2-3 vật chứng vật lý | 30.000 – 40.000 | 18.000 – 25.000 | 12.000 – 16.000 |
| **3A. Túi Kraft dây quấn** | Túi tài liệu xi măng dày, in tem niêm phong đỏ | 15.000 – 20.000 | 8.000 – 12.000 | 5.000 – 7.000 |
| **3B. Hộp cứng nắp gài** | Hộp carton sóng E bồi giấy kraft in 1 màu | 40.000 – 50.000 | 25.000 – 35.000 | 15.000 – 20.000 |
| **Phụ kiện & Dán tem** | Ghim rỉ, kẹp tài liệu, nhãn mã QR vào app | 5.000 | 4.000 | 3.000 |

#### Bảng 2: Tổng giá vốn sản xuất (COGS) 1 bộ theo 2 phương án bao bì (VNĐ)

| Phương án đóng gói | In mẫu lẻ (< 10 bộ) | Lô nhỏ (50 – 100 bộ) | Lô chuẩn (300 – 500 bộ) | Nhận xét & Đánh giá |
|---|---|---|---|---|
| **Phương án A: Túi Kraft hồ sơ** | **95.000 – 125.000** | **55.000 – 76.000** | **38.000 – 51.000** | • Rất hợp vibe hồ sơ cảnh sát bí mật.<br>• Nhẹ, mỏng, tiết kiệm cước ship và bọc lót.<br>• Phù hợp nhất cho giai đoạn khởi động (MVP). |
| **Phương án B: Hộp cứng nắp gài** | **120.000 – 155.000** | **72.000 – 99.000** | **48.000 – 64.000** | • Cảm giác cao cấp, dày dặn.<br>• Cồng kềnh, dễ móp góc khi vận chuyển đường dài.<br>• Thích hợp làm bản đặc biệt (Collector Edition). |

### 2.3. Chi Phí Bán Hàng & Vận Hành Đơn Hàng

| Hạng mục chi phí | Mức chi phí dự tính | Ghi chú |
|---|---|---|
| **Phí sàn TMĐT (Shopee/TikTok)** | 8% – 12% giá bán | Tính trực tiếp trên giá niêm yết khi bán qua sàn |
| **Vật tư đóng gói ship** | 3.000 – 5.000đ / đơn | Thùng carton bảo vệ bên ngoài + màng chống sốc |
| **Cổng thanh toán Bản Online** | 1.5% – 2% / giao dịch | PayOS / Quét mã VietQR tự động |

### 2.4. Dự Phóng Điểm Hòa Vốn

#### Giả định Chi phí Đầu tư Ban đầu (cho Vụ án #000):
* Thiết kế mẫu in, mockup, sản xuất mẫu kiểm tra: ~5.000.000đ.
* Chi phí marketing mồi (ảnh chụp mẫu, video giới thiệu): ~5.000.000đ.
* **Tổng vốn khởi điểm:** `10.000.000đ`.

#### Kịch bản Hòa vốn:
| Chỉ số | Kênh Boardgame | Kênh Bản Online |
|---|---|---|
| **Giá bán trung bình** | 299.000đ | 89.000đ |
| **Chi phí biến đổi (Giá vốn + Phí sàn/cổng)** | ~120.000đ | ~2.000đ |
| **Lợi nhuận gộp / sản phẩm** | **~179.000đ** | **~87.000đ** |
| **Sản lượng để hòa vốn 10 triệu** | **~56 bộ** | **~115 lượt mua** |

> **Nhận xét:** Với cộng đồng yêu thích trinh thám và boardgame tại Việt Nam, con số 56 bộ hoặc 115 lượt mua online là mục tiêu rất khả thi ngay trong tháng đầu tiên mở bán.

---

## PHẦN 3: THỎA THUẬN SÁNG LẬP & PHÂN BỔ DOANH THU

### 3.1. Nguyên Tắc Cốt Lõi
1. **Minh bạch từ đầu để giữ tình bạn:** Tiền bạc và công sức phải có thước đo rõ ràng, tránh tâm lý "ai cũng nghĩ mình làm nhiều nhất" hoặc "ngại không dám nói".
2. **Tách biệt Nền tảng và Nội dung Vụ án:** 
   * **Nền tảng** là tài sản chung tích lũy lâu dài (mã nguồn, thương hiệu, hệ thống quản lý, cộng đồng).
   * **Nội dung (từng vụ án)** là sản phẩm cụ thể: ai bỏ công sức viết kịch bản, thiết kế vụ án nào thì hưởng doanh thu trực tiếp trên vụ án đó.
3. **Làm nhiều hưởng nhiều, không làm không có phần:** Tránh tình trạng cổ đông "treo" (người không đóng góp gì vẫn nhận đều tiền của các vụ án sau do người khác sáng tạo).

### 3.2. Mô Hình Phân Bổ Quyền Lợi 2 Tầng

```
                         TỔNG DOANH THU 1 VỤ ÁN
                                    │
               (Trừ chi phí trực tiếp: In ấn / Cổng TT / Sàn)
                                    │
                             DOANH THU THUẦN
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
   20% - 25% VÀO QUỸ NỀN TẢNG                      75% - 80% VÀO QUỸ VỤ ÁN
            │                                               │
  • Trừ chi phí chung (Server, duy trì)           • Chia trực tiếp cho những người
  • Lợi nhuận chia theo CỔ PHẦN NỀN TẢNG             sản xuất ra vụ án cụ thể đó
```

#### TẦNG 1: CỔ PHẦN NỀN TẢNG
Đại diện cho quyền sở hữu thương hiệu chung, website, mã nguồn hệ thống, danh sách khách hàng và quỹ nền tảng.

* **Bạn (Lead Dev, Kiến trúc hệ thống, Tác giả Vụ án #000):** **55% – 60%** (Nắm quyền phủ quyết và định hướng kỹ thuật/sản phẩm).
* **Người bạn 2 (Phụ trách Vận hành / In ấn / Đóng gói / CSKH):** **20% – 22.5%**
* **Người bạn 3 (Phụ trách Marketing / Kênh Bán / Cộng đồng / Đối ngoại):** **20% – 22.5%**

*Điều khoản Đồng hành:*
* Cổ phần nền tảng được tích lũy theo thời gian đồng hành (ví dụ: tối thiểu phải đồng hành 6 tháng đầu mới bắt đầu nhận cổ phần, phân bổ đều trong 24 tháng).
* Nếu một người rời đi trước 6 tháng: Toàn bộ cổ phần hoàn lại cho nhóm.
* Nếu rời đi sau 1 năm: Giữ lại phần cổ phần đã tích lũy của giai đoạn đó, nhưng không tham gia biểu quyết vận hành.

#### TẦNG 2: PHÂN BỔ THEO TỪNG VỤ ÁN (75% đến 80%)
Mỗi vụ án là một "dự án con". Doanh thu thuần của vụ án nào sẽ chuyển vào quỹ của vụ án đó và chia theo tỷ lệ đóng góp thực tế:

| Khâu công việc trong Vụ án | Tỷ trọng | Phân bổ Vụ án #000 | Định hướng từ Vụ án #001 trở đi |
|---|---|---|---|
| **Kịch bản & Câu đố** | **45%** | **Cả 3 người cùng làm** (mỗi người 15%) | Ai là người viết chính nhận phần này |
| **Mỹ thuật & Hiện vật** | **30%** | **Cả nhóm cùng tham gia** | Phân bổ theo người thiết kế đồ họa / đạo cụ |
| **Tích hợp Kỹ thuật & Đưa lên Web** | **25%** | **Bạn** (100% khâu kỹ thuật) | Phân bổ cho người đưa kịch bản lên Web app |

#### Ví dụ áp dụng thực tế:

* **Vụ án #000 (Vụ án khởi động):**
  * Khâu Kịch bản & Câu đố (45%): Cả 3 người cùng thảo luận, lên ý tưởng và viết chung -> Chia đều mỗi người 15%.
  * Khâu Mỹ thuật, ảnh & đạo cụ (30%): Cả nhóm cùng đóng góp, tìm kiếm và hoàn thiện -> Chia theo đóng góp thực tế (hoặc chia đều mỗi người 10%).
  * Khâu Kỹ thuật & Đưa lên Web (25%): Bạn chịu trách nhiệm toàn bộ -> Bạn nhận 25%.
  * **Tổng kết Vụ án #000:** Bạn nhận **~50%** quỹ vụ án (do gánh thêm phần kỹ thuật), 2 người bạn mỗi người nhận **~25%**.
  * *(Doanh thu quỹ nền tảng 20% - 25%: Sau khi trừ tiền máy chủ, chia theo tỷ lệ Cổ phần Tầng 1).*

* **Từ Vụ án #001 trở đi:**
  * Nhóm sẽ thống nhất giao vai trò rõ ràng trước khi bấm máy: Ai là người viết chính, ai vẽ tranh/làm hiện vật, ai đưa lên Web.
  * Ví dụ: Người bạn 2 viết chính (nhận trọn 45% Kịch bản), Người bạn 3 vẽ chính (nhận 30% Mỹ thuật), Bạn đưa lên Web (nhận 25% Kỹ thuật).
  * Ai không tham gia khâu nào của vụ án đó thì không nhận tiền của khâu đó.

### 3.3. Quy Tắc Quyết Định & Điều Hành
1. **Quyền quyết định Kỹ thuật & Hạ tầng:** Thuộc về Bạn.
2. **Quyền duyệt phát hành Vụ án mới:** Cần tối thiểu 2/3 người sáng lập đồng thuận sau khi chơi thử nghiệm thu.
3. **Tái đầu tư quay vòng vốn:** Trong 3 tháng đầu hoặc 100 sản phẩm đầu tiên, đề xuất giữ lại 50% lợi nhuận để quay vòng vốn sản xuất đợt in ấn tiếp theo.
4. **Minh bạch tài chính:** Mọi chi phí, hóa đơn in ấn, doanh thu ngân hàng, doanh thu sàn thương mại điện tử phải được cập nhật vào một file Google Sheets nội bộ để cả 3 người cùng theo dõi hàng tuần.
