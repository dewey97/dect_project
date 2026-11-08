# Kho cấu trúc vụ (skeletons)

Cấu trúc là hình dạng hành trình của người chơi: ai bị nghi lúc nào và sự thật lộ ra theo thứ tự nào. Đây là gợi ý, không phải danh sách đóng. Được ghép 2 cấu trúc, được bịa cấu trúc mới rồi thêm vào đây.

Mỗi mục: cơ chế, hình dạng đồ thị checkpoint, điểm cần cẩn thận, engine hiện tại chạy được chưa.

---

## 1. Phễu loại trừ

- **Cơ chế:** nhiều nghi phạm lộ diện cùng lúc. Người chơi minh oan từng người cho đến khi chỉ còn một người, thường là người ít bị nghi nhất.
- **Đồ thị:** cửa mở đầu → 2–3 nhánh song song → nút hội tụ (loại trừ) → nhánh hung thủ → kết luận.
- **Cẩn thận:** hung thủ phải xuất hiện từ đầu (có tên, có lời khai), nếu không sẽ thành "rơi từ trên trời".
- **Engine:** có. Ví dụ: case_000.

## 2. Xoắn ốc

- **Cơ chế:** chỉ có 1–2 nghi phạm. Mỗi vòng điều tra quay lại cùng một người với một lớp sự thật sâu hơn: nói dối về thời gian → nói dối về mối quan hệ → nói dối về hành vi.
- **Đồ thị:** chuỗi tuyến tính, mỗi checkpoint mở một lời khai lần 2, 3, 4 của cùng người.
- **Cẩn thận:** dễ nhàm nếu mỗi vòng cùng một kiểu mâu thuẫn. Đổi nguồn manh mối mỗi vòng (giấy, điện thoại, hiện trường).
- **Engine:** có.

## 3. Hai lớp sự thật

- **Cơ chế:** người chơi giải xong một vụ "bề mặt" (ví dụ vụ trộm). Lời giải đó mở ra vụ thật nằm bên dưới (vụ trộm là để che một vụ giết người).
- **Đồ thị:** kết luận giả ở giữa game, sau đó mở bộ hồ sơ mới làm đảo nghĩa vật chứng cũ.
- **Cẩn thận:** vật chứng cũ phải đọc được theo 2 nghĩa ngay từ đầu. Cần cho người chơi cảm giác "đã thấy mà không hiểu", không phải "bị lừa".
- **Engine:** có, nếu kết luận giả là một checkpoint thường (`choice`/`text`) chứ không phải `indictment`.

## 4. Đếm ngược

- **Cơ chế:** vụ chưa xảy ra hoặc đang tiếp diễn: con tin, lời đe dọa, kẻ đánh bom. Người chơi phải tìm ra địa điểm hoặc người trước một mốc giờ trong truyện.
- **Đồ thị:** mỗi checkpoint thu hẹp không gian (quận → phố → tòa nhà → phòng). Kết thúc bằng câu hỏi địa điểm thay vì bị can.
- **Cẩn thận:** áp lực thời gian là trong truyện, không phải đồng hồ thật, trừ khi làm cơ chế mới.
- **Engine:** có (dùng `text`/`code`/`choice` cho địa điểm). Đồng hồ thật: cần dev.

## 5. Kẻ kể chuyện không đáng tin

- **Cơ chế:** nguồn tin chính của người chơi (nhật ký nạn nhân, người báo án, thậm chí "điều tra viên" trong hồ sơ) là người nói dối hoặc là hung thủ.
- **Đồ thị:** bình thường đến gần cuối, rồi một vật chứng làm sụp đổ độ tin cậy của nguồn chính.
- **Cẩn thận:** phải có ít nhất 2 vết nứt nhỏ ở nguồn chính từ sớm, để người chơi tinh ý tự nhận ra.
- **Engine:** có.

## 6. Ngược dòng

- **Cơ chế:** biết hung thủ ngay từ đầu (đã tự thú hoặc bị bắt quả tang). Câu hỏi là "tại sao" hoặc "ai đứng sau" hoặc "lời tự thú có thật không".
- **Đồ thị:** kết luận không hỏi bị can mà hỏi động cơ, đồng phạm, hoặc người được bảo vệ.
- **Cẩn thận:** phải thay `indictment` bằng câu hỏi khác hoặc dùng `validSuspects` cho người đứng sau.
- **Engine:** có.

## 7. Không có tội phạm

- **Cơ chế:** mọi thứ trông như án mạng nhưng thực ra là tai nạn, tự sát hoặc chết tự nhiên. Có thể có người dàn dựng hiện trường vì lý do khác (bảo hiểm, che giấu bí mật).
- **Đồ thị:** các nghi phạm lần lượt được minh oan; câu hỏi cuối là "nạn nhân chết thế nào" và "ai dàn dựng, vì sao".
- **Cẩn thận:** người chơi dễ thấy bị lừa. Cần thông báo sớm khả năng này (ví dụ: pháp y ghi "chưa loại trừ tự sát").
- **Engine:** cần dev nhẹ: cáo trạng cho phép đáp án "không có bị can".

## 8. Hai vụ một đêm

- **Cơ chế:** hai sự việc độc lập xảy ra cùng chỗ, cùng đêm (một vụ trộm và một vụ giết, của hai người khác nhau). Vật chứng của hai vụ trộn lẫn.
- **Đồ thị:** 2 nhánh kết luận riêng, cùng dùng chung kho vật chứng.
- **Cẩn thận:** mỗi vật chứng phải ghi rõ thuộc vụ nào trong bible (`from_events`), nếu không chính người viết cũng lẫn.
- **Engine:** có nếu dùng 1 `indictment` + 1 checkpoint kết luận phụ. Hai cáo trạng: cần dev.

## 9. Nhóm chơi chia vai

- **Cơ chế:** dành cho chơi nhóm. Mỗi người chơi giữ một bộ hồ sơ riêng (của một nghi phạm hoặc một điều tra viên), phải trao đổi mới giải được.
- **Cẩn thận:** mỗi suy luận chính cần vật chứng từ ≥2 bộ hồ sơ khác nhau.
- **Engine:** cần dev (chia bộ hồ sơ theo người chơi).
