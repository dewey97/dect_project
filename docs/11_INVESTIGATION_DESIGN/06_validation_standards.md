# CHUẨN KIỂM ĐỊNH HỢP LỆ VỤ ÁN & CHỈ SỐ CHẤT LƯỢNG (CASE VALIDATION & QUALITY METRICS)

> **Nhiệm vụ Cốt lõi:** Thiết lập bộ tiêu chuẩn kỹ thuật bắt buộc để nghiệm thu vụ án, bao gồm chỉ số kiểm định cơ học ("Đúng") và chỉ số đánh giá trải nghiệm chơi ("Hay"), kết hợp hệ thống Điểm Phạt Khấu Trừ (Demerit Points) khắt khe.

---

## 🏆 01. 7 Tiêu Chuẩn Vàng Kiểm Định Cơ Học (Mechanical Standards - "Đúng")

1. **Quy tắc Hung thủ duy nhất (Single Culprit Rule):** Vụ án chỉ có duy nhất một hung thủ chính thức thực hiện hành vi sát nhân cuối cùng. Nghi phạm nhiễu có thể phạm tội ác phụ độc lập nhưng không tham gia hành vi tước đoạt mạng sống.
2. **Quy tắc Timeline duy nhất (Single Timeline Rule):** Không tồn tại hai kịch bản dòng thời gian thực tế mâu thuẫn nhau. Mọi di chuyển của nhân vật bắt buộc phải khớp nhau từng phút trên một trục thời gian vật lý duy nhất.
3. **Quy tắc Không tự mâu thuẫn chứng cứ (No Evidence Contradiction):** Các tệp chứng cứ vật lý/số thu thập được không được tự phủ quyết lẫn nhau về mặt thuộc tính (Vd: Pháp y kết luận ngạt thở cơ học thì không thể có độc chất gây tử vong tức thì trong dạ dày).
4. **Quy tắc Nguồn gốc manh mối minh bạch (Chain of Custody):** Mọi chứng cứ (`Evidence ID`) người chơi nhặt được phải có nguồn gốc tìm thấy rõ ràng, không tự nhiên xuất hiện trong kho đồ mà không qua thao tác điều tra.
5. **Quy tắc xâu chuỗi khép kín (Valid Proof Chain Graph):** Phải tồn tại ít nhất một con đường logic khép kín (Proof Path) nối từ Fact/Evidence $\rightarrow$ Inference (Đánh sập ngoại phạm) $\rightarrow$ Kết luận. Con đường này được mã hóa chính xác trong `solution.requiredProofGraph` của `case.json`.
6. **Khai quật động cơ logic (Motive Chain Rule):** Mọi động cơ của nghi phạm (sát nhân, trộm cắp, vứt sim rác) đều phải có chuỗi liên kết nhân quả dẫn đến hành vi của họ. Cấm tuyệt đối hành động vô cớ.
7. **Quy tắc Không tồn tại điểm tắc nghẽn (No Soft Lock Rule):** Người chơi bắt buộc phải thu thập đủ tất cả Mandatory Clues để giải quyết vụ án. Trò chơi phải thiết kế sao cho không có tình huống người chơi lỡ bỏ qua một chứng cứ ở chương trước mà chương sau không thể quay lại lấy.

---

## 🌟 02. Chỉ Số Đánh Giá Chất Lượng Trải Nghiệm (Quality Metrics - "Hay")

Một vụ án đạt chuẩn kỹ thuật "Đúng" vẫn có thể tẻ nhạt. Bộ tiêu chuẩn dưới đây đánh giá mức độ hấp dẫn và cảm xúc phá án của người chơi ("Hay"):

### 1. Nhịp độ vụ án & Phân bổ manh mối (Pacing & Clue Distribution)
- **Quy tắc định lượng:** 
  - Manh mối phải được phân bổ đều dọc theo tiến trình chơi (Explore Loop). Tránh dồn dập >70% lượng manh mối vào chương đầu, hoặc giấu tất cả đến tận chương cuối gây ức chế.
  - **Mandatory Clue** (Manh mối bắt buộc) không được phép xuất hiện quá muộn (không được đặt ở 15% thời lượng cuối cùng của vụ án).

### 2. Cân bằng Nghi phạm (Suspect Balance)
- **Quy tắc định lượng:** 
  - Tất cả các nghi phạm phụ bắt buộc phải có ít nhất 1 đầu mối đáng nghi mạnh mẽ và 1 bí mật riêng. Không được thiết kế một nghi phạm phụ hoàn toàn "sạch sẽ" ngay từ đầu (Xem lại)
  - **Giới hạn Clue:** Không nghi phạm nào được phép chiếm giữ hoặc liên quan trực tiếp tới **quá 50% tổng lượng Clues** của vụ án để tránh dồn sự chú ý quá lệch.
  - **Tần suất Hung thủ:** Hung thủ không được xuất hiện quá ít (phải có ít nhất 2 cuộc đối thoại hoặc 3 vết tích liên quan trước khi bị kết án).

### 3. Nhịp điệu điều tra & Điểm đột phá tư duy
- **Quy tắc định lượng:** 
  - Thời điểm xuất hiện cảm xúc "đột phá tư duy" phải xuất hiện tự nhiên sau khi người chơi giải mã hoặc kết nối thành công các manh mối bắt buộc.
  - **Giới hạn Chứng cứ then chốt:** Chứng cứ then chốt (Exclusive Evidence) phục vụ cú chốt Đánh sập ngoại phạm **tuyệt đối không được lộ ra trước 70% tiến trình điều tra** để bảo toàn nhịp điệu suy luận phá án.

### 4. Quyền tự quyết của người chơi (Player Agency)
- **Quy tắc định lượng:** 
  - Hệ thống gợi ý của Trợ lý Minh tuyệt đối không được tự động giải nghĩa hộ người chơi. 
  - Người chơi phải luôn là người chủ động ghép mã chứng cứ và đưa ra Inference để bẻ gãy ngoại phạm của nghi phạm.

### 5. Kết thúc thỏa mãn (Emotional Payoff)
- **Chuẩn:** Khi hung thủ cúi đầu nhận tội, người chơi phải cảm nhận được sự giằng xé bi kịch nhân văn hoặc sự lạnh lùng nổi da gà của phản diện, thay vì cảm giác kết thúc hụt hẫng.


---

## 🚨 03. Danh Mục Lỗi Hệ Trọng Bắt Buộc Phải Sửa (Critical Validation Blockers)

Mọi vụ án khi kiểm định nếu phát hiện bất kỳ lỗi nào dưới đây đều bị đánh giá là **KHÔNG ĐẠT (FAILED)** và bắt buộc phải được sửa chữa, tối ưu hóa lại kịch bản trước khi đưa vào sản xuất:

### 1. Nhóm Lỗi Chí Mạng (Blockers - Bắt buộc sửa ngay)
*   **Lỗi Tắc Nghẽn (Soft Lock):** Người chơi có thể vô tình làm kẹt tiến trình chơi do thiếu chứng cứ bắt buộc không thể lấy lại.
*   **Lỗi Ngoại Phạm Yếu:** Lập luận đánh sập ngoại phạm của hung thủ bị bẻ gãy bởi một chứng cứ không then chốt (hung thủ dễ dàng tự giải thích hợp lý bằng lý do vô hại khác trước tòa).
*   **Tự mâu thuẫn cơ học:** Các chứng cứ vật lý tự phủ quyết nhau (Vd: Pháp y kết luận ngạt thở cơ học nhưng phân tích lab lại kết luận chết do độc dược phát tác tức thì).

### 2. Nhóm Lỗi Phi Logic & Trải Nghiệm Kém (Narrative & Logic Bugs)
*   **Lỗi Tội Phạm Ngớ Ngẩn:** Kẻ phạm tội cẩn thận/IQ cao đột nhiên quên điện thoại, để lại ví tiền hay ghi nhật ký kế hoạch giết người một cách ngô nghê.
*   **Lỗi Bác Sĩ Bù Nhìn:** Cảnh sát/Bác sĩ pháp y địa bàn bỏ qua các dấu vết siết cổ hay vỡ sọ quá lộ liễu để tạo hiện trường giả một cách khiên cưỡng.
*   **Lỗi Dồn Ép Dòng Thời Gian:** Quá nhiều sự kiện lớn hoặc di chuyển trùng hợp xảy ra dồn dập trong khoảng thời gian quá ngắn (dưới 1 tiếng).
*   **Lỗi Escape-Room (Khiên cưỡng hóa câu đố):** Nhân vật ngồi xếp mật mã ẩn, gấp giấy mật thư trong tình huống nguy hiểm cần gọi cảnh sát theo bản năng sinh tồn.
*   **Lỗi Nhiễu Rác Vô Động Cơ:** Nhét chứng cứ nhiễu vào hiện trường mà không giải thích được động cơ tâm lý riêng biệt của nghi phạm phụ.

---

## 📈 04. Tiêu Chí Nghiệm Thu Vụ Án (Acceptance Criteria)

Vụ án chỉ được phê duyệt hoàn toàn để đưa vào game khi đạt đủ 2 điều kiện sau:
1.  **Về Logic:** Vượt qua 100% các tiêu chuẩn kiểm định cơ học, ghi nhận **0 lỗi chí mạng** và **0 lỗi phi logic**.
2.  **Về Trải Nghiệm:** Đạt tối thiểu 70% tỷ lệ người chơi thử (Blind Playtest) phá án thành công mà không cần trợ giúp gợi ý từ hệ thống.
