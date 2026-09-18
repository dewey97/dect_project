# 💡 HỒ SƠ ĐẶC TẢ HỆ THỐNG GỢI Ý & BẢNG ĐÁP ÁN CHUYÊN ÁN #000

> **Chuyên án:** Án Mạng Đêm Mưa — Trốn Tìm (Case #000)  
> **Thư mục:** `docs/cases/case_000/01_design/hint_system_and_answers.md`  
> **Quy chuẩn:** Kế thừa từ bộ tài liệu điều tra và bảng quy hoạch đáp án chuẩn hóa.

---

## 🧭 I. NGUYÊN TẮC HỆ THỐNG GỢI Ý NGỮ CẢNH (CONTEXT-AWARE HINT SYSTEM)

Hệ thống cung cấp gợi ý thông minh đa tầng dựa trên vị trí thao tác và tiến trình điều tra thực tế của người chơi:

1. **Ưu tiên Modal đang mở:** Nếu người chơi đang mở một Modal thẩm tra hoặc suy luận cụ thể, nút Gợi ý sẽ đưa ra chỉ dẫn trực tiếp cho hành động trong Modal đó.
2. **Gợi ý Màn hình chính (Main Canvas):** Nếu người chơi đang ở Màn hình chính (không mở Modal), hệ thống sẽ đọc tiến trình phá án hiện tại để đưa ra gợi ý hành động tiếp theo giúp người chơi không bị bế tắc.

---

## 📊 II. BẢNG TỔNG HỢP ĐÁP ÁN & HỆ THỐNG GỢI Ý CHI TIẾT

| STT | Đối tượng / Nhiệm vụ | Hạng mục / Yêu cầu điều tra | Đáp án & Căn cứ xác thực | Hệ thống Gợi ý (Hints) |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Giai đoạn Khởi đầu** | **Truy tìm danh tính 3 SĐT ẩn danh** | • `0988.200.991` ➔ **Lê Quang Vũ**<br>• `0912.331.888` ➔ **Nguyễn Thanh Tùng**<br>• `0984.180.357` ➔ **Đạt** *(Đạt Gà Chợ Cảng)* | • **Gợi ý 1:** Đối chiếu với Sổ tay ghi nợ của nạn nhân.<br>• **Gợi ý 2:** Đối chiếu với thông tin trên Bảng tin tổ dân phố. |
| **2** | **Lê Quang Vũ** | **Thẩm tra bước 1: Động cơ** | • **13** *(Sổ ghi nợ)*<br>• **Tin nhắn văn bản với SĐT `0988.200.991`** | • **Gợi ý 1:** Kiểm tra Sổ tay ghi nợ.<br>• **Gợi ý 2:** Xem lại chân dung của Vũ. |
| | | **Thẩm tra bước 1: Mâu thuẫn ngoại phạm** | • **10, 42**<br>*(Optional: 6, 8)* | • **Gợi ý:** Thời gian Vũ khai rời đi và thời gian xe đón. |
| | | **Giai đoạn sau: Xác định mốc thời gian Vũ rời khỏi Quán Bia 88** | • **21:15** | • **Gợi ý 1:** Lấy vụ ẩu đả làm mốc thời gian đối chiếu.<br>• **Gợi ý 2:** Tìm ra số tiền Vũ đã thanh toán. |
| **3** | **Nguyễn Thanh Tùng** | **Thẩm tra bước 1: Động cơ** | • **18, 40**<br>• **Tin nhắn văn bản với SĐT `0912.331.888`** | • **Gợi ý 1:** Chú ý mốc thời gian năm 1996.<br>• **Gợi ý 2:** Đối chiếu ảnh kỷ niệm xóm và chân dung các đối tượng. |
| | | **Thẩm tra bước 1: Mâu thuẫn ngoại phạm** | • **20, 41** | • **Gợi ý:** Manh mối nào tại hiện trường chưa được xác nhận danh tính? |
| **4** | **Trần Thị Hà** | **Thẩm tra bước 1: Động cơ** | • **Tin nhắn văn bản với SĐT `0978.552.109`**<br>*(Optional: `0984.112.568`, #53, 48)* | • **Gợi ý 1:** Mối quan hệ giữa Khang và Hà như thế nào?<br>• **Gợi ý 2:** Địa điểm xuất hiện trong tin nhắn giữa Khang và Vy. |
| | | **Thẩm tra bước 1: Mâu thuẫn ngoại phạm** | • **Tin nhắn thoại với SĐT `0984.112.568`**<br>• **12, 44**<br>*(Optional: 9, 7, 45)* | • **Gợi ý 1:** Âm thanh trong tin nhắn thoại của Hà.<br>• **Gợi ý 2:** Xem lịch phát sóng VTV3 ngày hôm đó. |
| | | **Giai đoạn sau: Khớp nối dấu vết / vật chứng** | 1. **Áo gió:** `45`, `10`, `6`<br>2. **Kéo và lọn tóc:** `4`<br>3. **Bùa yêu:** `49` | • **Gợi ý:** Đối chiếu 3 vật phẩm thu tại phòng Hà với hiện trường và biên bản khám nghiệm. |
| **5** | **Truy Tố & Kết Án**<br>*(Bản Cáo Trạng)* | **Chỉ danh Thủ phạm & Động cơ** | • **Thủ phạm:** Trần Thị Hà<br>• **Động cơ:** Mâu thuẫn tình cảm | • **Gợi ý:** Tìm đối tượng có mâu thuẫn tình cảm và phản ứng ghen tuông cực đoan. |
| | | **Chứng minh Bị can mang theo / để lại dấu vết vụ án** | • **2.1 (Áo gió):** **`52`**<br>• **2.2 (Kéo và lọn tóc mai):** **`50, 51`**<br>• **2.3 (Bùa yêu):** **`53`** | • **Gợi ý:** Chọn các mã vật chứng thu được tại phòng Hà tương ứng với từng dấu vết. |

---

## 🖥️ III. BẢNG QUY TẮC GỢI Ý MÀN HÌNH CHÍNH (MAIN SCREEN NAVIGATION HINTS)

Khi người chơi không mở bất kỳ Modal nào, nút Gợi ý trên thanh công cụ sẽ tự động tính toán dựa trên tiến trình game:

1. **Chưa tra cứu 3 SĐT:**
   * *"Hãy mở Điện thoại nạn nhân Khang kiểm tra Nhật ký cuộc gọi và đối chiếu với Sổ nợ, Bảng tin để xác định 3 số lạ trong đêm."*
2. **Đã mở 3 SĐT, chưa thẩm tra ai:**
   * *"Hãy chọn Lê Quang Vũ hoặc Nguyễn Thanh Tùng để thẩm tra động cơ và bóc tách mâu thuẫn ngoại phạm."*
3. **Đã thẩm tra 1 người (Vũ hoặc Tùng):**
   * *"Tiếp tục thẩm tra nghi phạm còn lại để hoàn thiện hồ sơ các đối tượng tình nghi ban đầu."*
4. **Đã thẩm tra cả Vũ & Tùng, chưa giải mốc giờ Quán Bia 88:**
   * *"Hãy mở câu hỏi suy luận của Lê Quang Vũ để xác định thời điểm chính xác đối tượng rời Quán Bia 88."*
5. **Đã giải xong suy luận, chưa thẩm tra Hà:**
   * *"Tiến hành khám xét phòng trọ và thẩm tra Trần Thị Hà để bóc trần ngoại phạm xem TV giả mạo."*
6. **Đã thẩm tra Hà, chưa giải khớp nối vật chứng:**
   * *"Mở câu hỏi suy luận của Trần Thị Hà để đối chiếu các vật phẩm thu giữ (Áo gió, Kéo & Tóc, Bùa yêu) với hiện trường."*
7. **Đã hoàn tất chứng cứ, chưa lập Cáo Trạng:**
   * *"Mở Bản Cáo Trạng Truy Tố để kết luận thủ phạm chính và đưa ra các chứng cứ buộc tội cuối cùng."*
8. **Đã kết án thành công:**
   * *"Chuyên án đã được phá thành công! Hãy mở Ký sự Hậu án để xem toàn bộ bí mật phía sau."*
