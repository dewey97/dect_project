# TRIẾT LÝ THIẾT KẾ CUỘC ĐIỀU TRA

> **Nhiệm vụ Cốt lõi:** Tài liệu định hình tư duy thiết kế tổng quát cho Game Designer & Biên kịch. Quy định các nguyên tắc nền tảng để tạo ra một cuộc điều tra trinh thám công bằng, cuốn hút và đời thực.

---

## ⚖️ 01. Triết Lý Nền Tảng

### 1. Sự Thật Đã Tồn Tại Từ Trước
Sự thật vụ án không được sinh ra động hay thay đổi theo lựa chọn cảm tính của người chơi trong quá trình phá án. Tội ác, timeline thực tế, động cơ và hung thủ đã được "đông cứng" ngay từ phút đầu tiên thiết kế. Người chơi không phải là người sáng tác ra câu chuyện, họ là người đi **khai quật hiện thực**.

### 2. Nói Có Sách, Mách Có Chứng
Người chơi không thể phá án hay kết tội bằng cảm tính hoặc đoán mò trắc nghiệm. Mọi kết luận đưa ra đều phải được xây dựng từ các vật chứng, dấu vết thực tế thu thập được tại hiện trường và liên kết chặt chẽ với nhau thông qua xâu chuỗi logic.

### 3. Tính Khách Quan Của Lập Luận
Dù là ai điều tra, chỉ cần đi đúng các bước suy luận logic từ cùng một tập dữ liệu chứng cứ và lời khai khách quan thì đều phải hội tụ về cùng một kết luận duy nhất về hung thủ và phương thức gây án.

---

## 02. Quy Tắc Thiết Kế Cốt Lõi

* **Quy tắc 1 — Không Công Nghệ Thần Kỳ:** Cấm tuyệt đối việc sử dụng các tình tiết viễn tưởng, công nghệ hack ảo, hay ép người chơi phải sử dụng các kiến thức quá dị biệt nằm ngoài đời thực để giải án.
* **Quy tắc 2 — Công Bằng Tuyệt Đối:** Người chơi và điều tra viên phải có cơ hội ngang nhau trong việc tiếp cận sự thật. Mọi vật chứng, tài liệu và lời khai bắt buộc phải được phơi bày đầy đủ trong quá trình điều tra. Trò chơi quy định:
  * Cấm tuyệt đối việc giấu kín chứng cứ mấu chốt đến phút cuối để tạo cú lật kèo khiên cưỡng.
  * Cấm đưa vào các manh mối nhiễu thiếu lời giải thích logic sau đó.
  * Không cho phép giải quyết vụ án bằng sự thú tội đột ngột của một nhân vật xa lạ hay các yếu tố ngoại cảnh ngẫu nhiên.
* **Quy tắc 3 — Đời Thực Hóa:** Vụ án phải được đặt vào bối cảnh đời sống thực tế, các xung đột bế tắc tiền bạc, nợ nần, bản quyền hay huyết thống đời thường, tránh xa các âm mưu viễn tưởng.
* **Quy tắc 4 — Nhất Quán Tâm Lý:** Hành vi, lời nói và động cơ của tất cả nhân vật bắt buộc phải tuân theo phản ứng tâm lý đời thực. Nhân chứng chỉ nói dối hoặc che giấu thông tin khi có động cơ cá nhân đủ mạnh (nhũ bảo vệ người thân, giấu tội ác phụ, hoặc sợ bị trả thù). Cấm tuyệt đối việc tạo ra các lời khai mâu thuẫn ngô nghê thiếu động cơ tâm lý chỉ để "đánh đố" người chơi.
* **Quy tắc 5 — Logic Loại Trừ Nghi Phạm Nhiễu:** Không được phép kết tội nghi phạm chỉ dựa trên việc họ thiếu bằng chứng ngoại phạm. Người chơi bắt buộc phải thu thập chứng cứ chứng minh được hành vi đáng ngờ của nghi phạm nhiễu thực chất chỉ phục vụ cho một động cơ cá nhân hoặc một tội ác phụ hoàn toàn độc lập với vụ án mạng.
* **Quy tắc 6 — Logic Đánh Sập Lời Khai Ngoại Phạm:** Bắt buộc phải thiết lập sự xung đột trực tiếp và tuyệt đối về mặt không gian hoặc thời gian giữa lời khai ngoại phạm của hung thủ với các dấu vết vật lý hay dữ liệu khách quan tại hiện trường.
* **Quy tắc 7 — Logic Chứng Cứ Then Chốt:** Chứng cứ dùng để buộc tội và kết án hung thủ phải mang tính quyết định và độc bản. Chứng cứ này chỉ có thể sinh ra trực tiếp từ hành vi phạm tội của hung thủ và hoàn toàn không thể được giải thích bằng bất kỳ giả thuyết vô hại nào khác.

---

## ⚙️ 03. Chuỗi Logic Nhân Quả Tiêu Chuẩn

Mọi vụ án trong game bắt buộc phải được thiết kế và xâu chuỗi logic theo đúng 5 nấc nhân quả dưới đây (định nghĩa chi tiết từng thuật ngữ xem tại [00_ontology.md](file:///d:/code_world/dect_project/docs/11_investigation_design/00_ontology.md)):

```
  [1. Nguyên nhân gốc rễ] ──> [2. Hành động tội ác] ──> [3. Dấu vết vật lý]
                                                            │
  [5. Kết luận phá án]   <── [4. Giải mã & Chứng cứ] <──────┘
```

1. **Nguyên Nhân Gốc Rễ (Động cơ):** Điểm xuất phát tâm lý hoặc áp lực thực tế dẫn đến tội ác. Lý giải cho câu hỏi *"Tại sao tội ác lại xảy ra?"* và định hình tính nhất quán của tuyến nhân vật.
2. **Hành Động Gây Án (Thực tế):** Toàn bộ diễn biến hành vi vật lý diễn ra trên trục thời gian thực của hung thủ tại hiện trường.
3. **Dấu Vết Vật Lý (Hệ quả):** Các vết tích vật lý, sinh học hoặc kỹ thuật số khách quan còn lưu lại do hành động gây án sinh ra.
4. **Giải Mã & Chứng Cứ (Thu thập):** Quá trình thu thập vật chứng thô (`Evidence`), sử dụng các công cụ phân tích chuyên dụng để giải mã thành các manh mối logic (`Clue`).
5. **Kết Luận Phá Án (Buộc tội):** Kết nối các bước suy luận (`Inference`), chỉ ra điểm mâu thuẫn để bẻ gãy lời khai ngoại phạm và hoàn thành xâu chuỗi lập luận (`Proof Chain`) buộc tội hung thủ.
