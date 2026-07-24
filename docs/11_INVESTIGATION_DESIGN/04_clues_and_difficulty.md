# PHÂN BỔ MANH MỐI & THANG ĐỘ KHÓ ĐỘC LẬP (CLUE DISTRIBUTION & DIFFICULTY DESIGN)

> **Nhiệm vụ Cốt lõi:** Quy định định lượng cơ chế phân bổ manh mối (Clue Distribution) và ma trận tiêu chuẩn thiết kế độ khó độc lập cho các vụ án trong game. Đảm bảo cân bằng game và tránh tình trạng nhảy vọt độ khó phi lý giữa các cấp độ.

---

## 🧩 01. Phân Hạng Phân Bổ Manh Mối (Clue Distribution)

Mọi tệp chứng cứ (`Evidence`) và lời khai nhân chứng đưa vào vụ án bắt buộc phải được xếp vào đúng 4 phân hạng chức năng sau để kiểm soát số lượng:

### 1. Mandatory Clues (Manh Mối Bắt Buộc)
- **Định nghĩa:** Những chứng cứ trực tiếp hoặc gián tiếp cấu thành nên xâu chuỗi (`requiredProofGraph`) để kết án hung thủ. Thiếu một trong số này, vụ án bị "Soft Lock" (không thể giải).

### 2. Optional Clues (Manh Mối Bối Cảnh / Gợi Ý)
- **Định nghĩa:** Manh mối không nằm trong đồ thị kết án bắt buộc, nhưng giúp người chơi hiểu nhanh hơn về mối liên kết giữa các nghi phạm hoặc củng cố lập luận loại trừ.

### 3. Red Herrings (Manh Mối Lạc Hướng Có Động Cơ)
- **Định nghĩa:** Manh mối hướng người chơi nghi ngờ nghi phạm nhiễu.
- **Yêu cầu bắt buộc:** CẤM tuyệt đối việc nhét "rác hiện trường vô danh". Mọi manh mối lạc hướng **phải có lời giải thích động cơ tâm lý/tội ác phụ riêng**.

### 4. World Building Clues (Manh Mối Xây Dựng Thế Giới)
- **Định nghĩa:** Các manh mối có vai trò liên kết vụ án hiện tại với các vụ án khác trong game (như nhắc đến một nhân vật, tập đoàn, sự kiện lịch sử hoặc tổ chức xuất hiện xuyên suốt). Chúng không bắt buộc phải phục vụ trực tiếp cho việc phá án của vụ hiện tại, nhưng giúp thể hiện các vụ án đều diễn ra trong cùng một vũ trụ/thế giới nhất quán.
- **Ví dụ:** Một bài báo đưa tin về tập đoàn mỹ thuật từng xuất hiện ở Vụ án 1, hoặc một bức thư tay từ nhân vật phụ của Vụ án trước gửi cho nạn nhân hiện tại.

---

## 🧠 02. Ma Trận Tiêu Chuẩn Thiết Kế Độ Khó (Difficulty Scaling Matrix)

Độ khó của vụ án được định nghĩa bằng các thông số kỹ thuật định lượng chặt chẽ dưới đây. AI và Designer bắt buộc phải thiết kế vụ án nằm đúng khung thông số của cấp độ tương ứng:

| Chỉ số Định lượng | Dễ | Trung Bình | Khó | Chuyên Gia |
| :--- | :---: | :---: | :---: | :---: |
| **Số lượng Nghi phạm** | 2 người | 3 người | 4 người | 5 - 6 người |
| **Độ sâu câu chuyện** | 1 - 2 tầng | 2 - 3 tầng | 3 tầng xâu chuỗi | 4 tầng xâu chuỗi phức tạp |
| **Mật độ Manh mối** | < 10 manh mối | 10 - 15 manh mối | 15 - 25 manh mối | > 30 manh mối |
| **Tỷ lệ Nhiễu** | < 15% | 20% - 25% | 30% - 40% (Điểm ngọt) | 45% - 50% |
| **Độ dài Dòng thời gian** | < 1 tiếng | 1 - 2 tiếng | 2 - 4 tiếng | > 6 tiếng (đa ngày) |
| **Độ sâu suy luận** | 1 nấc suy luận | 2 nấc suy luận | 3 nấc suy luận | $\ge$ 4 nấc suy luận bắc cầu |
| **Số bước suy luận kết án** | 1 - 2 bước | 3 bước | 4 - 5 bước | $\ge$ 6 bước |

---

### 🚦 Quy chuẩn Cân bằng Độ khó:
- **Độ sâu suy luận:** Số nấc suy luận trung gian bắc cầu người chơi phải đi qua từ chứng cứ thô để ra kết luận (Vd: Dễ: `Chìa khóa gãy` $\rightarrow$ `Tấn là hung thủ`; Khó: `Chìa khóa gãy` $\rightarrow$ `Thời điểm khóa cửa` $\rightarrow$ `Lời khai ngoại phạm của vợ dối trá` $\rightarrow$ `Tấn là hung thủ`).
- **Độ phân nhánh:** Số lượng con đường điều tra mở rộng đồng thời. Cấp độ Chuyên gia bắt buộc phải có ít nhất 3 nhánh điều tra song song để người chơi tự phân bổ thời gian.
