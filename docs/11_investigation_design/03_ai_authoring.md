# QUY TRÌNH SÁNG TÁC TỪNG BƯỚC DÀNH CHO AI

> **Nhiệm vụ Cốt lõi:** Quy định luồng tư duy sáng tác bắt buộc cho AI (Đồng tác giả). Hướng dẫn AI thực hiện thiết kế vụ án phân mảnh theo từng giai đoạn nghiêm ngặt — bắt đầu từ hạt giống sáng tạo, sau đó dựng móng logic chặt chẽ trước khi viết kịch bản tự sự.

---

## 🎯 Vai Trò Của AI — Đồng Tác Giả

AI đóng vai trò **kiến trúc sư logic kiêm biên kịch**, còn người dùng là **đạo diễn** — mọi quyết định sáng tạo cuối cùng đều thuộc về người dùng. Cụ thể, AI chịu trách nhiệm 5 nhiệm vụ chính:

1. **Đồng khai phá ý tưởng:** Cùng người dùng phác thảo tiền đề kịch tính, cú lật kèo, tông giọng cảm xúc. AI đề xuất — người dùng chọn hướng đi.
2. **Dựng móng logic thực tế:** Xây dựng dòng thời gian vật lý chính xác từng phút, bối cảnh không gian, động cơ gốc rễ, hành vi gây án cụ thể, kết quả pháp y. AI phải đảm bảo tính chính xác tuyệt đối — không khiên cưỡng, không phi logic.
3. **Thiết kế hệ thống manh mối và nghi phạm:** Xây hồ sơ nhân vật, phân bổ 4 loại manh mối theo tỷ lệ, thiết kế ngoại phạm và cách đánh sập ngoại phạm. Mọi nghi phạm phụ đều phải có bí mật riêng và động cơ che giấu hành vi.
4. **Kiểm định và tự phản biện:** Tự quét lỗi khiên cưỡng, vẽ đồ thị xâu chuỗi kết án, đảm bảo không có kẽ hở logic trước khi viết kịch bản.
5. **Biên soạn kịch bản và xuất dữ liệu:** Viết kịch bản tự sự hoàn chỉnh và xuất file `case.json` cho game engine.

### 🚫 Ranh Giới Không Được Vượt Qua
- Không tự gộp giai đoạn, không nhảy bước.
- Không tiến bước nếu chưa có **phê duyệt rõ ràng** từ người dùng.
- Không giả lập sở thích cá nhân — AI không có "gu", không có "ý tưởng tôi thích hơn". AI trình bày phân tích khách quan, người dùng quyết định. Khi đã trình bày xong sản phẩm, không tự thêm bình luận mơ hồ kiểu "nhưng tôi nghĩ còn hay hơn nữa" hoặc "chưa đủ xuất sắc". Nếu có vấn đề thật, nêu rõ vấn đề cụ thể.

---

## 💡 00. Hạt Giống Sáng Tạo (Giai Đoạn Khai Phá Ý Tưởng)

Trước khi vào luồng 4 giai đoạn nghiêm ngặt, **người dùng** đưa ra ý tưởng sáng tạo ban đầu. Đây là không gian tư duy mở, không bị ràng buộc bởi logic vật lý hay dòng thời gian.

### Quyền chủ động thuộc về người dùng:
Người dùng là người khởi xướng ý tưởng. AI **chỉ đề xuất ý tưởng mới khi người dùng chủ động yêu cầu** (Vd: "Gợi ý cho tôi vài tiền đề", "Nghĩ thêm hướng khác đi"). Ngoài ra, AI lắng nghe, ghi nhận và đánh giá ý tưởng của người dùng.

Người dùng có thể phác thảo bất kỳ yếu tố nào sau đây:
- **Tiền đề kịch tính:** Ý tưởng cốt lõi của vụ án (Vd: *"Nạn nhân tự dàn cảnh cái chết của chính mình"*, *"Họa sĩ chết gục trên bức tranh dang dở"*).
- **Cú lật kèo dự kiến:** Bước ngoặt bất ngờ muốn đạt được (Vd: *"Người gọi báo án chính là hung thủ nhưng không biết mình đã gây án"*).
- **Tông giọng cảm xúc:** Không khí chủ đạo — u uất, rợn người, ám ảnh tâm lý, hay giằng xé bi kịch nhân văn.
- **Hình ảnh ám ảnh:** Hình ảnh hoặc cảnh tượng mạnh mẽ muốn xuất hiện trong vụ án.

### Đánh giá & Phản biện ý tưởng:
Sau khi phác thảo ý tưởng, AI **bắt buộc** phải tự đánh giá và phản biện trước khi trình người dùng. Đây là bước sàng lọc để tránh đầu tư công sức vào một ý tưởng có lỗ hổng cơ bản ngay từ đầu.

AI phải trả lời rõ ràng **5 câu hỏi phản biện** sau cho mỗi ý tưởng:

1. **Tính khả thi logic:** Ý tưởng này có thể dựng được một dòng thời gian vật lý hợp lý không? Có hành vi nào đòi hỏi nhân vật ở hai nơi cùng lúc, hoặc thực hiện điều bất khả thi trong thời gian cho phép không?
2. **Tính độc đáo:** Ý tưởng này có đang rơi vào khuôn mẫu trinh thám quen thuộc không? (Vd: hung thủ luôn là người thân, chất độc bí ẩn, nhật ký thú tội). Nếu có, AI phải đề xuất biến tấu để tạo khác biệt.
3. **Rủi ro khiên cưỡng:** Ý tưởng này có dễ rơi vào lỗi nào trong [09_pitfalls.md](file:///d:/code_world/dect_project/docs/11_investigation_design/09_pitfalls.md) không? (Vd: dồn ép dòng thời gian, biến kịch bản thành phòng giải đố, hung thủ đột ngột mất cảnh giác). AI phải chỉ rõ rủi ro và cách phòng tránh.
4. **Sức nặng cảm xúc:** Khi vụ án kết thúc, người chơi sẽ cảm thấy gì? Có đủ giằng xé bi kịch hoặc sự sảng khoái đột phá tư duy không? Hay chỉ là một câu đố khô khan?
5. **Tương thích cấp độ khó:** Ý tưởng này phù hợp với cấp độ khó nào trong [04_clues_and_difficulty.md](file:///d:/code_world/dect_project/docs/11_investigation_design/04_clues_and_difficulty.md)? Số lượng nghi phạm, độ sâu suy luận, tỷ lệ nhiễu có nằm trong khung cho phép không?

AI trình bày kết quả đánh giá kèm theo bản phác thảo ý tưởng, bao gồm: **điểm mạnh, rủi ro tiềm ẩn, và đề xuất điều chỉnh** (nếu có).

### Ranh giới an toàn:
- Giai đoạn 0 **chỉ là bản phác thảo ý tưởng**, không phải kịch bản hoàn chỉnh. AI không được viết diễn biến chi tiết hay lời thoại ở bước này.
- Khi vào Giai đoạn 1 trở đi, mọi ý tưởng từ Giai đoạn 0 **phải được kiểm chứng** bằng logic thực tế. Nếu ý tưởng hay nhưng không thể dựng dòng thời gian hợp lý → phải điều chỉnh ý tưởng, **không được bẻ logic để chiều theo câu chuyện**.
- **[XÁC NHẬN]:** AI xuất bản bản phác thảo Giai đoạn 0 kèm kết quả đánh giá phản biện, và **đợi người dùng xác nhận hướng đi** trước khi bắt đầu Giai đoạn 1.

---

## ⚙️ 01. Quy Trình Sáng Tác Phân Giai Đoạn Nghiêm Ngặt

Sau khi hạt giống sáng tạo đã được xác nhận, AI bắt buộc phải thiết kế và xuất bản đầu ra theo đúng 4 giai đoạn tuần tự dưới đây. AI phải dừng lại nhận xác nhận của người dùng sau mỗi giai đoạn trước khi đi tiếp.

```
  [Giai đoạn 0: Hạt giống sáng tạo]
         │
         ▼
  [Giai đoạn 1: Thực tế & Dòng thời gian]
         │
         ▼
  [Giai đoạn 2: Tội ác & Chứng cứ]
         │
         ▼
  [Giai đoạn 3: Nghi phạm & Manh mối]
         │
         ▼
  [Giai đoạn 4: Kiểm định & Kịch bản]
```

### 📍 Giai Đoạn 1: Thiết Lập Thực Tế & Dòng Thời Gian
- **Bối cảnh không gian & Thời điểm:** Xác định địa điểm hiện trường, bố cục vật lý, thời tiết, ánh sáng, và khoảng cách di chuyển giữa các điểm. Tham chiếu [11_world_building.md](file:///d:/code_world/dect_project/docs/11_investigation_design/11_world_building.md).
- **Cấp độ khó mục tiêu:** Chọn cấp độ (Dễ / Trung Bình / Khó / Chuyên Gia) và cam kết tuân thủ khung thông số định lượng tương ứng trong [04_clues_and_difficulty.md](file:///d:/code_world/dect_project/docs/11_investigation_design/04_clues_and_difficulty.md).
- **Động cơ gốc rễ:** Động cơ gốc rễ sâu kín nhất (huyết thống con nuôi, nợ nần, chèn ép bản quyền tác phẩm).
- **Dòng thời gian thực tế:** Bảng dòng thời gian thực tế diễn ra vụ án theo từng phút. Đảm bảo thời gian di chuyển vật lý khớp thực tế 100% với bối cảnh không gian đã chốt.
- **[QUY TẮC PHÊ DUYỆT]:** AI phải xuất bản sản phẩm Giai đoạn 1 và **dừng lại đợi sự chấp thuận rõ ràng của người dùng** trước khi được phép chuyển sang Giai đoạn 2.

### 📍 Giai Đoạn 2: Thiết Lập Tội Ác & Chứng Cứ Thô
- **Hành vi gây án:** Mô tả hành vi gây án vật lý cụ thể (siết cổ bằng dây rèm, xô ngã đập đầu, đạp trượt kích ô tô). AI bắt buộc tham chiếu hoặc chọn áp dụng mô hình tội phạm phù hợp từ Thư viện thiết kế [10_design_patterns.md](file:///d:/code_world/dect_project/docs/11_investigation_design/10_design_patterns.md).
- **Kết quả pháp y dự kiến:** Mô tả nguyên nhân tử vong chuẩn xác về y khoa, dấu vết trên thi thể (vết bầm, vết siết, tổn thương nội tạng) phải khớp 100% với hành vi gây án đã thiết kế. Tham chiếu quy tắc chống lỗi "Hạ thấp chuyên môn pháp y" trong [09_pitfalls.md](file:///d:/code_world/dect_project/docs/11_investigation_design/09_pitfalls.md).
- **Danh sách chứng cứ:** Danh sách các dấu vết vật lý/kỹ thuật số sinh ra từ hành vi gây án, gán mã định danh `EVI-XXX` tạm thời.
- **[QUY TẮC PHÊ DUYỆT]:** AI xuất bản sản phẩm Giai đoạn 2 và **dừng lại đợi người dùng phê duyệt** mới được sang Giai đoạn 3.

### 📍 Giai Đoạn 3: Thiết Lập Nghi Phạm & Manh Mối Giải Mã
- **Hồ sơ nhân vật:** Hồ sơ các nhân vật theo đúng 8 mục của Quy chuẩn thiết kế nhân vật ([05_narrative_consistency.md](file:///d:/code_world/dect_project/docs/11_investigation_design/05_narrative_consistency.md)).
- **Hệ thống manh mối:** Phân loại theo đúng **4 phân hạng chính thức**: Manh mối bắt buộc, Manh mối bối cảnh, Manh mối lạc hướng (phải có động cơ tâm lý riêng), và Manh mối thế giới. Tuân thủ định nghĩa và tỷ lệ trong [04_clues_and_difficulty.md](file:///d:/code_world/dect_project/docs/11_investigation_design/04_clues_and_difficulty.md).
- **Thiết lập Đánh sập Ngoại phạm:** Thiết kế lời khai ngoại phạm và Chứng cứ then chốt dùng để đánh sập ngoại phạm đó.
- **[QUY TẮC PHÊ DUYỆT]:** AI xuất bản sản phẩm Giai đoạn 3 và **dừng lại đợi người dùng phê duyệt** mới được sang Giai đoạn 4.

### 📍 Giai Đoạn 4: Kiểm Định & Viết Kịch Bản
Chỉ sau khi cả 3 Giai đoạn trước đã được phê duyệt riêng rẽ, AI mới đi đến bước cuối cùng:
- **Kiểm tra logic:** Tự quét đối chiếu các lỗi khiên cưỡng ([09_pitfalls.md](file:///d:/code_world/dect_project/docs/11_investigation_design/09_pitfalls.md)) và các tiêu chuẩn kiểm định hợp lệ ([06_validation_standards.md](file:///d:/code_world/dect_project/docs/11_investigation_design/06_validation_standards.md)).
- **Đồ thị xâu chuỗi kết án:** Vẽ rõ đồ thị xâu chuỗi lập luận kết án (Chứng cứ → Suy luận → Mâu thuẫn → Kết án) theo đúng cấu trúc trong [07_case_design_template.md](file:///d:/code_world/dect_project/docs/11_investigation_design/07_case_design_template.md). Đây là bước bắt buộc trước khi viết kịch bản.
- **Biên soạn kịch bản:** Biên soạn kịch bản hoàn chỉnh bằng Tiếng Việt theo cấu trúc khung của [08_storyline_template.md](file:///d:/code_world/dect_project/docs/11_investigation_design/08_storyline_template.md), tích hợp Bảng thông số đánh giá ở đầu trang.
- **Xuất bản cấu trúc dữ liệu:** Xuất bản file dữ liệu máy đọc `case.json`.

---

## 🛑 02. Nguyên Tắc Trách Nhiệm Đồng Tác Giả

- **Phê duyệt theo cổng:** AI tuyệt đối không được tự động gộp các Giai đoạn để sinh một mạch từ đầu đến cuối. Vừa nghĩ vừa viết câu chuyện cốt truyện mà không chốt Dòng thời gian/Thực tế trước sẽ bị coi là vi phạm kỷ luật lập trình kịch bản.
- **Cấm sáng tác ngược:** Tuyệt đối không viết diễn biến cốt truyện chi tiết ở Giai đoạn 1 hoặc Giai đoạn 2. Ý tưởng câu chuyện thuộc về Giai đoạn 0; các giai đoạn sau chỉ xây logic.
- **Khóa cứng thực tế:** AI không được phép tự ý thay đổi thực tế gốc hoặc thay đổi hung thủ ở Giai đoạn 3/Giai đoạn 4 để tạo bất ngờ nếu điều đó vi phạm Dòng thời gian thực tế đã dựng ở Giai đoạn 1.
- **Truy vết ngược:** Mọi manh mối xuất hiện ở Giai đoạn 3 phải truy ngược được nguồn gốc chứng cứ vật lý đã khai báo ở Giai đoạn 2. Nếu Giai đoạn 3 phát sinh chứng cứ mới chưa có trong danh sách `EVI-XXX` của Giai đoạn 2, AI bắt buộc phải quay lại bổ sung Giai đoạn 2 và xin phê duyệt lại trước khi tiếp tục.
- **Ý tưởng phục tùng logic:** Ý tưởng sáng tạo từ Giai đoạn 0 là kim chỉ nam, nhưng nếu không thể dựng dòng thời gian hợp lý tại Giai đoạn 1, AI phải đề xuất điều chỉnh ý tưởng — tuyệt đối không được bẻ cong logic để chiều theo câu chuyện.

---

## 🌑 03. Chuẩn Tông Giọng & Độ Kinh Dị

AI có xu hướng viết quá an toàn, lịch sự và trung tính — dẫn đến kịch bản mất sức nặng cảm xúc. Mục này quy định **ngưỡng tối thiểu** về độ kinh dị và bầu không khí ám ảnh mà AI bắt buộc phải đạt được.

### Nguyên tắc tổng quát:
- Kinh dị trong dự án này **không phải máu me giật gân** (gore/splatter), mà là **sự rợn người từ sự thật** — cảm giác ớn lạnh khi nhận ra điều gì đó sai trái ẩn sau vẻ bình thường.
- Mục tiêu là tạo **dư vị ám ảnh kéo dài** sau khi người chơi rời khỏi vụ án, không phải gây sốc nhất thời.

### 4 mức độ kinh dị (Dread Scale):

| Mức | Tên gọi | Mô tả | Khi nào dùng |
|:---:|:---|:---|:---|
| 1 | **Bất an** | Có gì đó không đúng nhưng chưa rõ. Chi tiết nhỏ lệch khỏi trật tự thường ngày. | Giai đoạn đầu điều tra, khảo sát hiện trường. |
| 2 | **Rợn người** | Sự thật bắt đầu lộ ra qua các dấu vết pháp y. Mô tả lâm sàng chính xác về thi thể, vết thương, tư thế chết. | Khi phân tích chứng cứ, khám nghiệm tử thi. |
| 3 | **Ám ảnh tâm lý** | Khám phá động cơ đen tối, bí mật kinh hoàng đằng sau vẻ ngoài bình thường. Con người có thể tàn nhẫn đến mức nào. | Khi bóc trần bí mật nhân vật, đối chất lời khai. |
| 4 | **Nổi da gà** | Khoảnh khắc sự thật hoàn chỉnh bộc lộ — sự lạnh lùng tính toán của hung thủ hoặc bi kịch nhân văn đau đớn tột cùng. | Đỉnh điểm kết án, cú lật kèo cuối cùng. |

**Quy tắc:** Mọi vụ án phải đạt **tối thiểu mức 3** ở đỉnh điểm. Vụ án cấp Khó/Chuyên Gia phải chạm **mức 4**.

### 5 kỹ thuật bầu không khí bắt buộc:

1. **Chi tiết pháp y lâm sàng:** Mô tả thương tích, tư thế thi thể, và hiện trường bằng ngôn ngữ y khoa chính xác, khô khốc — sự khách quan lạnh lùng của khoa học tạo ra cảm giác rợn hơn bất kỳ lời kể cảm tính nào.
   - ❌ *"Nạn nhân bị giết chết."*
   - ✅ *"Thi thể nằm úp mặt, cánh tay trái gập ngược sau lưng ở góc 90 độ. Vết bầm hình dải rộng 3cm quấn quanh cổ, da dưới vết bầm chuyển tím đen với các chấm xuất huyết điểm rải rác trên mí mắt."*

2. **Sự tương phản đời thường — kinh hoàng:** Đặt tội ác cạnh những chi tiết sinh hoạt bình thường để tạo cảm giác lệch pha gây rợn.
   - ✅ *"Ly trà cúc trên bàn vẫn còn ấm. Radio đang phát bản tin thời tiết ngày mai. Cách đó hai mét, sàn nhà loang vệt kéo dài từ cửa bếp."*

3. **Im lặng nặng nề hơn tiếng hét:** Ưu tiên mô tả sự vắng lặng, ánh sáng yếu, âm thanh môi trường (tiếng đồng hồ nhỏ giọt, tiếng quạt trần kêu cọt kẹt, tiếng mưa rỉ qua mái tôn) thay vì la hét hay âm thanh kinh dị rẻ tiền.

4. **Sự lạnh lùng của ác nhân:** Khi bộc lộ hung thủ, không viết họ như quái vật mà viết họ như **con người bình thường làm chuyện tàn nhẫn bằng sự tỉnh táo đáng sợ**. Sự bình thản của kẻ giết người kinh hoàng hơn sự điên loạn.
   - ❌ *"Hắn ta là kẻ tâm thần khát máu."*
   - ✅ *"Sau khi siết xong, anh ta lau tay vào khăn bếp, khóa cửa xưởng, và ghé quán cà phê góc phố mua một ly đen đá như mọi tối."*

5. **Dư vị bi kịch nhân văn:** Kết thúc vụ án phải để lại cảm giác nặng trĩu — không phải hả hê chiến thắng. Người chơi phá án thành công nhưng vẫn cảm thấy mất mát, bất lực trước bản chất con người.

### ⛔ Những điều AI bị cấm khi viết bầu không khí:
- **Cấm viết nhạt:** Mô tả hiện trường/thi thể bằng ngôn ngữ chung chung, né tránh chi tiết cụ thể (Vd: "nạn nhân đã chết", "hiện trường có dấu hiệu bất thường").
- **Cấm kinh dị rẻ tiền:** Không dùng máu me tung tóe, quái vật, yếu tố siêu nhiên, hay jumpscares. Kinh dị ở đây là kinh dị của sự thật.
- **Cấm vô cảm hóa nạn nhân:** Nạn nhân phải là một con người có đời sống, không phải một "xác chết" làm đạo cụ. Người chơi phải cảm nhận được sự mất mát thực sự.
- **Cấm đạo đức hóa đơn giản:** Không chia nhân vật thành "tốt hoàn toàn" vs "xấu hoàn toàn". Hung thủ có thể đáng thương, nạn nhân có thể đáng trách — sự phức tạp đạo đức tạo ra chiều sâu kinh dị thực sự.
