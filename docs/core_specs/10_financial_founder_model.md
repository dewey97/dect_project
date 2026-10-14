# 💰 Mô Hình Tài Chính, Điểm Hòa Vốn & Thỏa Thuận Sáng Lập

> **Trạng thái:** Đặc tả tài chính & quản trị nội bộ  
> **Cập nhật lần cuối:** 2026-10-14  
> **Tài liệu kinh doanh chi tiết:** xem `09_business_model_spec.md`  
> **Hệ thống cấp quyền:** xem `07_license_access_system.md`

---

## 1. Cấu Trúc Chi Phí Chi Tiết (Cost Breakdown)

### 1.1. Chi Phí Cố Định (Fixed Costs)
* **Hạ tầng máy chủ (VPS):** ~150.000đ – 300.000đ / tháng (chạy Docker container tối ưu tại `72.62.199.110`).
* **Tên miền:** ~250.000đ – 350.000đ / năm.
* **Lưu trữ & Dịch vụ Cloud:** Sử dụng gói miễn phí Supabase + Cloudflare (chi phí hiện tại ~0đ).

### 1.2. Bóc Tách Chi Phí Sản Xuất Boardgame (COGS trên 1 bộ)

Sản phẩm gồm 3 nhóm cấu phần vật lý:
1. **Ruột tài liệu:** In màu/đen trắng trên giấy màu (kraft, ngả vàng vintage, xi măng) để tạo chất hồ sơ vụ án cũ; số ít in trên giấy trắng (kết quả giám định y khoa, xét nghiệm hóa sinh).
2. **Hiện vật vụ án:** Mẫu vật chứng (túi zip, vải chứng cứ, thư tay, tem niêm phong, ảnh polaroid chụp hiện trường).
3. **Bao bì ngoài:** Cân nhắc giữa **Túi hồ sơ giấy Kraft dây quấn** (chuẩn phong cách hồ sơ tuyệt mật vụ án, chi phí thấp, nhẹ tiền ship) và **Hộp cứng nắp gài** (sang trọng, bảo vệ tốt hơn nhưng chi phí và cước vận chuyển cao hơn).

#### Bảng 1: Chi phí linh kiện 1 bộ theo quy mô sản xuất (VNĐ)

| Nhóm cấu phần | Chi tiết quy cách | In mẫu lẻ (< 10 bộ) | Lô nhỏ (50 – 100 bộ) | Lô chuẩn (300 – 500 bộ) |
|---|---|---|---|---|
| **1. Ruột tài liệu** | ~15–20 trang A4/A5 giấy màu ngả vàng + giấy trắng | 45.000 – 60.000 | 25.000 – 35.000 | 18.000 – 25.000 |
| **2. Ảnh & Hiện vật** | 4-6 ảnh hiện trường + 2-3 vật chứng vật lý | 30.000 – 40.000 | 18.000 – 25.000 | 12.000 – 16.000 |
| **3A. Túi Kraft dây quấn** | Túi tài liệu xi măng dày, in tem niêm phong đỏ | 15.000 – 20.000 | 8.000 – 12.000 | 5.000 – 7.000 |
| **3B. Hộp cứng nắp gài** | Hộp carton sóng E bồi giấy kraft in 1 màu | 40.000 – 50.000 | 25.000 – 35.000 | 15.000 – 20.000 |
| **Phụ kiện & Dán tem** | Ghim rỉ, kẹp tài liệu, nhãn mã QR vào app | 5.000 | 4.000 | 3.000 |

#### Bảng 2: Tổng giá vốn sản xuất (COGS) theo phương án bao bì (VNĐ)

| Phương án đóng gói | In mẫu lẻ (< 10 bộ) | Lô nhỏ (50 – 100 bộ) | Lô chuẩn (300 – 500 bộ) | Nhận xét & Đánh giá |
|---|---|---|---|---|
| **Phương án A: Túi Kraft hồ sơ** | **95.000 – 125.000** | **55.000 – 76.000** | **38.000 – 51.000** | • Rất hợp vibe hồ sơ cảnh sát bí mật.<br>• Nhẹ, mỏng, tiết kiệm cước ship và bọc lót.<br>• Phù hợp nhất cho giai đoạn khởi động (MVP). |
| **Phương án B: Hộp cứng nắp gài** | **120.000 – 155.000** | **72.000 – 99.000** | **48.000 – 64.000** | • Cảm giác cao cấp, dày dặn.<br>• Cồng kềnh, dễ móp góc khi vận chuyển đường dài.<br>• Thích hợp làm bản đặc biệt (Collector Edition). |

### 1.3. Chi Phí Bán Hàng & Vận Hành Đơn Hàng

| Hạng mục chi phí | Mức chi phí dự tính | Ghi chú |
|---|---|---|
| **Phí sàn TMĐT (Shopee/TikTok)** | 8% – 12% giá bán | Tính trực tiếp trên giá niêm yết khi bán qua sàn |
| **Vật tư đóng gói ship** | 3.000 – 5.000đ / đơn | Thùng carton bảo vệ bên ngoài + màng chống sốc |
| **Cổng thanh toán Bản Online** | 1.5% – 2% / giao dịch | PayOS / Quét mã VietQR tự động |

---

## 2. Dự Phóng Điểm Hòa Vốn (Break-even Analysis)

### Giả định Chi phí Đầu tư Ban đầu (cho Vụ án #000):
* Thiết kế mẫu in, mockup, sản xuất mẫu kiểm tra: ~5.000.000đ.
* Chi phí marketing mồi (ảnh chụp mẫu, video giới thiệu): ~5.000.000đ.
* **Tổng vốn khởi điểm:** `10.000.000đ`.

### Kịch bản Hòa vốn:
| Chỉ số | Kênh Boardgame | Kênh Bản Online |
|---|---|---|
| **Giá bán trung bình** | 299.000đ | 89.000đ |
| **Chi phí biến đổi (Giá vốn + Phí sàn/cổng)** | ~120.000đ | ~2.000đ |
| **Lợi nhuận gộp / sản phẩm** | **~179.000đ** | **~87.000đ** |
| **Sản lượng để hòa vốn 10 triệu** | **~56 bộ** | **~115 lượt mua** |

> **Nhận xét:** Với cộng đồng yêu thích trinh thám và boardgame tại Việt Nam, con số 56 bộ hoặc 115 lượt mua online là mục tiêu rất khả thi ngay trong tháng đầu tiên mở bán.

---

## 3. Thỏa Thuận Sáng Lập & Cơ Chế Phân Bổ Doanh Thu

### 3.1. Bối Cảnh Hợp Tác: All-in vs. Part-time
* **Bạn (Lead Founder):** Định hướng **All-in** (toàn thời gian, chịu rủi ro cao nhất, tự bỏ vốn đầu tư ban đầu, tự tay lập trình 100% nền tảng công nghệ, điều hành tiến độ tổng thể).
* **2 Người bạn (Contributor Partners):** Tham gia **Part-time** (vẫn có công việc chính, đóng góp thời gian rảnh theo cam kết tối thiểu 5–8 giờ/tuần vào cuối tuần).
* **Nguyên tắc cốt lõi:**
  1. **Quyền sở hữu công nghệ (IP & Source Code):** Toàn bộ mã nguồn web app, kiến trúc hạ tầng và hệ thống cấp phép thuộc **sở hữu cá nhân của Bạn 100%**. Nhóm được cấp quyền khai thác độc quyền nền tảng này cho các vụ án.
  2. **Bảo vệ vốn đầu tư túi:** Tiền túi Bạn bỏ ra in ấn/sản xuất được tính là **Khoản Vay Ưu Tiên**. Khi có doanh thu bán hàng, tiền phải **ưu tiên hoàn vốn túi của Bạn trước 100%**, sau đó số tiền lời mới đem ra chia.
  3. **Không cào bằng thời gian:** Ai làm nhiều hưởng nhiều; thù lao lao động gắn chặt với từng vụ án cụ thể, tránh mâu thuẫn tị nạnh công sức.

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
      25% PHÍ NỀN TẢNG                                75% QUỸ VỤ ÁN
(Thuộc về Bạn - Công Dev & Duy trì máy chủ)      (Chia theo đóng góp nội dung)
                                                            │
                                            ┌───────────────┼───────────────┐
                                            ▼               ▼               ▼
                                       Kịch bản (45%)  Mỹ thuật (30%)  Kỹ thuật Web (25%)
                                                                       (Thuộc về Bạn)
```

#### TẦNG 1: QUYỀN SỞ HỮU & PHÍ NỀN TẢNG (25%)
Đại diện cho giá trị của cỗ máy công nghệ hoạt động 24/7 (hệ thống CMS, máy chủ, xử lý mã QR, phòng chơi nhóm):
* **Cơ chế thu phí:** Trích **25% doanh thu thuần** trả về cho Nền tảng (thuộc về Bạn) để bù đắp chi phí máy chủ và công sức xây dựng kiến trúc kỹ thuật.
* **Tỷ lệ cổ phần thương hiệu chung:**
  * **Bạn:** **65% – 70%** (Nắm quyền phủ quyết và quyền quyết định chiến lược cao nhất).
  * **Người bạn 2 & 3:** **15% – 17.5% mỗi người** (đi kèm cam kết thời gian đồng hành tối thiểu).

#### TẦNG 2: PHÂN BỔ THEO TỪNG VỤ ÁN (75%)
Doanh thu thuần còn lại của vụ án nào sẽ chuyển vào quỹ của vụ án đó và chia theo tỷ lệ công việc thực tế:

| Khâu công việc trong Vụ án | Tỷ trọng | Phân bổ Vụ án #000 | Định hướng từ Vụ án #001 trở đi |
|---|---|---|---|
| **Kịch bản & Câu đố** | **45%** | **Cả 3 người cùng làm** (mỗi người 15%) | Ai là người viết chính nhận phần này |
| **Mỹ thuật & Hiện vật** | **30%** | **Cả nhóm cùng tham gia** (mỗi người 10%) | Phân bổ theo người thiết kế đồ họa / đạo cụ |
| **Tích hợp Kỹ thuật & Đưa lên Web** | **25%** | **Bạn** (100% khâu kỹ thuật) | Người đưa kịch bản và cấu hình lên Web app |

#### Tỷ lệ thực nhận trên thực tế:
* **Vụ án #000 (Vụ án khởi động):**
  * Trong Quỹ Vụ án (75%): Bạn nhận 15% (Kịch bản) + 10% (Mỹ thuật) + 25% (Kỹ thuật) = **50% quỹ**; 2 người bạn mỗi người nhận **25% quỹ**.
  * Cộng thêm 25% Phí nền tảng ban đầu: **Tổng thực nhận thực tế của Bạn là ~62.5% tổng doanh thu**, mỗi người bạn nhận **~18.75% tổng doanh thu**.
* **Từ Vụ án #001 trở đi:**
  * Kể cả Bạn không trực tiếp viết chữ nào (để 2 bạn kia tự viết kịch bản và vẽ tranh): Nhờ sở hữu nền tảng và phụ trách kỹ thuật web, **Bạn vẫn luôn nhận: 25% (Phí nền tảng) + [25% x 75% = 18.75%] (Kỹ thuật) = ~43.75% doanh thu của vụ án đó**.
  * Hai bạn kia chia nhau phần còn lại dựa trên khối lượng kịch bản và mỹ thuật thực tế họ đóng góp.

### 3.3. Quy Tắc Quyết Định & Điều Hành
1. **Quyền quyết định tối cao (Final Call):** Thuộc về Bạn (Lead Founder All-in) đối với mọi vấn đề kỹ thuật, kiến trúc, hạ tầng và tiến độ phát hành.
2. **Cam kết trách nhiệm Part-time:** Hai bạn cam kết hoàn thành các đầu việc độc lập đúng hạn, không nằm trên luồng phụ thuộc khẩn cấp để tránh làm tắc nghẽn dự án.
3. **Thu hồi vốn đầu tư:** Tiền túi Bạn bỏ ra in ấn hoặc làm mẫu được ưu tiên hoàn trả ngay từ các đợt doanh thu đầu tiên trước khi chia lợi nhuận.
4. **Minh bạch tài chính:** Doanh thu và chi phí được cập nhật tự động hoặc định kỳ vào file theo dõi nội bộ để cả 3 người cùng nắm bắt.

---

## 4. Định Hướng Pháp Lý & Vận Hành Bán Hàng

### 4.1. Giai đoạn Khởi động & Bán thử nghiệm (Chưa cần thành lập công ty)
* **Hình thức:** Bán hàng dưới tư cách **Cá nhân kinh doanh** (dùng CCCD, mã số thuế cá nhân và tài khoản ngân hàng chính chủ).
* **Kênh phân phối:**
  * Bán Boardgame qua tài khoản người bán cá nhân trên Shopee / TikTok Shop / Mạng xã hội.
  * Bản Online tích hợp cổng thanh toán cá nhân (PayOS / VietQR tự động) cấp mã code vào game ngay lập tức.
* **Nghĩa vụ thuế cá nhân:** Doanh thu dưới 100 triệu/năm được miễn thuế; khi vượt 100 triệu, sàn thương mại điện tử sẽ tự động khấu trừ nộp thay (~1.5% doanh thu).

### 4.2. Lý do không vội vã mở công ty ở giai đoạn đầu
1. **Rủi ro và chi phí khi giải thể:** Thủ tục giải thể công ty tại Việt Nam cực kỳ phức tạp và kéo dài (6 tháng đến 1 năm) do phải quyết toán thuế toàn bộ quá trình hoạt động, chi phí thuê dịch vụ giải thể tốn 5 – 10 triệu đồng.
2. **Chi phí duy trì cố định:** Kể cả không có doanh thu, công ty vẫn phải chịu phí duy trì chữ ký số, thuế môn bài (2 triệu/năm từ năm thứ 2), và phí thuê dịch vụ kế toán làm báo cáo 4 quý (~8 – 15 triệu/năm).

### 4.3. Lộ trình nâng cấp pháp nhân tương lai
* **Mốc xem xét:** Khi sản phẩm đã chứng minh được nhu cầu thị trường, dòng tiền ổn định (> 50–100 triệu/tháng) hoặc cần xuất hóa đơn đỏ cho các đơn hàng lớn (trường học, quán cafe, công ty đặt hàng teambuilding).
* **Phương án ưu tiên kế tiếp:** Thành lập **Hộ kinh doanh cá thể** (thủ tục mở/đóng đơn giản tại UBND Quận/Huyện, thuế khoán nhẹ nhàng, không nặng gánh kế toán báo cáo). Chỉ chuyển đổi lên **Công ty TNHH** khi quy mô thật sự lớn và sẵn sàng chi trả chi phí bộ máy kế toán chuyên nghiệp.
