# HỆ THỐNG THUẬT NGỮ ĐIỀU TRA & SUY LUẬN (INVESTIGATION ONTOLOGY) 

> **Nhiệm vụ Cốt lõi:** Tài liệu định nghĩa "nguồn chân lý" duy nhất về từ vựng nghiệp vụ cho toàn bộ dự án. Tất cả các tài liệu thiết kế, kịch bản vụ án, và mã nguồn (Zod Schema JSON) bắt buộc phải tuân thủ nghiêm ngặt định nghĩa này để tránh lẫn lộn khái niệm.

---

## 🎬 00. Tầng Cốt Truyện & Động Cơ (Backstory Layer)

### 1. Nguyên nhân gốc rễ (Root Cause)
- **Định nghĩa:** Điểm khởi nguồn của bi kịch. Đây là động cơ thúc đẩy hành vi phạm tội, phát sinh từ bất kỳ khía cạnh nào của tâm lý hoặc đời sống con người (như xung đột cảm xúc, lợi ích vật chất, bản năng bảo vệ bản thân/người khác, áp lực ngoại cảnh, hoặc các bất ổn tâm lý đặc thù).
- **Ví dụ:** Đức nợ nần chồng chất do cờ bạc và biết Nam vừa bán được bức tranh giá trị cao.

### 2. Hành động gây án (Crime Action)
- **Định nghĩa:** Toàn bộ diễn biến hành vi vật lý do hung thủ thực hiện (gồm cách tiếp cận hiện trường, phương thức sát hại và các hành vi thu dọn, dàn cảnh giả ngay sau đó) được định vị chính xác trên trục thời gian thực.
- **Ví dụ:** Tấn đột nhập vào xưởng vẽ lúc 22:00, xảy ra xô xát và siết cổ nạn nhân Nam lúc 22:15, sau đó tẩu thoát lúc 22:30.

---

## 🔤 01. Tầng Dữ Liệu Hiện Trường (Data Layer)

### 3. Dấu vết vật lý (Physical Trace)
- **Định nghĩa:** Những hệ quả vật lý, sinh học hoặc kỹ thuật số khách quan bị lưu lại hiện trường do hành động gây án sinh ra. Đây là những "sơ hở" vật chất không thể chối cãi mà hung thủ vô tình bỏ sót hoặc dàn dựng không hoàn hảo.
- **Ví dụ:** Vết sơn acrylic còn ướt dính trên tay nắm cửa xưởng vẽ.

### 4. Sự thật khách quan (Fact)
- **Định nghĩa:** Những sự kiện vật lý, mốc thời gian hoặc dữ liệu thô tuyệt đối chính xác đã diễn ra trong thực tế vụ án mà không phụ thuộc vào ý chí hay lời khai của nhân vật. 

### 5. Quan sát hiện trường (Observation)
- **Định nghĩa:** Những ghi nhận trực quan đầu tiên của điều tra viên tại hiện trường hoặc trên các vật thể thô khi chưa qua phân tích sâu.
- **Ví dụ:** Vết bầm mảnh quanh cổ nạn nhân; ly trà cúc đã nguội lạnh trên bàn.

### 6. Chứng cứ vật lý / số (Evidence)
- **Định nghĩa:** Vật chứng, dữ liệu số hoặc hồ sơ đã được kỹ thuật hình sự đóng gói, gán mã định danh duy nhất (Evidence ID) và có giá trị pháp lý trong hồ sơ vụ án.
- **Ví dụ:** Mảnh kim loại chìa khóa phụ gãy kẹt trong ổ khóa xưởng vẽ (`EVI-KEY-FRAGMENT`).

---

## 🔍 02. Tầng Manh Mối & Dẫn Dắt (Discovery Layer)

### 7. Manh mối (Clue)
- **Định nghĩa:** Những dấu vết logic rút ra từ việc phân tích và giải mã chứng cứ nhằm hướng người chơi suy luận ra một hành động hoặc một nghi vấn cụ thể.
- **Ví dụ:** Thời gian sơn acrylic khô bề mặt là 45 phút $\rightarrow$ chỉ ra bức tranh trên giá vẽ được đặt vào lúc 21:00.

### 8. Đầu mối điều tra (Lead)
- **Định nghĩa:** Một manh mối mở hướng dẫn dắt người chơi đi khám phá một địa điểm mới, hỏi cung một nghi phạm mới, hoặc tìm kiếm một tệp chứng cứ mới.
- **Ví dụ:** Lịch sử cuộc gọi của nạn nhân với số điện thoại lạ lúc 20:00 dẫn người chơi đi tìm danh tính chủ nhân số điện thoại.

### 9. Gợi ý hỗ trợ (Hint)
- **Định nghĩa:** Sự trợ giúp ngoài lề của hệ thống nhằm định hướng người chơi khi họ bị tắc nghẽn suy luận, không nằm trong thế giới hư cấu của game.
- **Ví dụ:** *"Hãy thử kiểm tra thời gian sập kích ô tô và so sánh với lời khai của chủ tiệm sửa xe."*

---

## 🧠 03. Tầng Suy Luận Logic (Reasoning Layer)

### 10. Bước suy luận (Inference)
- **Định nghĩa:** Bước tư duy logic kết nối các mảnh dữ liệu đơn lẻ lại với nhau để rút ra một nhận định/kết luận trung gian.
- **Ví dụ:** `Cửa chính khóa trong` + `Cửa sổ duy nhất mở và có dấu chân bùn hướng ra ngoài` $\rightarrow$ Bước suy luận: Hung thủ đã tẩu thoát qua đường cửa sổ.

### 11. Xác minh chéo (Corroboration)
- **Định nghĩa:** Sự củng cố hoặc củng cố thêm cho một nhận định/lời khai bằng cách cung cấp thêm các chứng cứ/manh mối độc lập khác có chung hướng kết luận.
- **Ví dụ:** Lời khai đi nhậu của Cường được xác nhận chéo bởi hóa đơn thanh toán quán nhậu lúc 01:10 và lời khai của chủ quán nhậu.

### 12. Điểm mâu thuẫn (Contradiction)
- **Định nghĩa:** Trạng thái xung đột trực tiếp giữa Lời khai của nghi phạm với Bằng chứng khách quan hoặc sự thật khách quan.
- **Ví dụ:** Lời khai `"Ở nhà ngủ suốt đêm"` $\leftrightarrow$ Dữ liệu camera ghi hình nghi phạm đi bộ qua hiện trường lúc 22:30 (thời điểm xảy ra án mạng).

### 13. Giả thuyết vụ án (Hypothesis)
- **Định nghĩa:** Một kịch bản giả định về động cơ, quá trình gây án hoặc hành vi của một nghi phạm dựa trên một chuỗi suy luận (Inferences) chưa được chứng minh hoàn toàn.
- **Ví dụ:** Giả thuyết Đức sát hại Nam để cướp tranh trả nợ.

### 14. Giả thuyết tổng thể (Theory)
- **Định nghĩa:** Kịch bản tái dựng vụ án ở mức độ vĩ mô, tập hợp các giả thuyết đã được liên kết logic hoàn chỉnh nhưng vẫn cần kiểm chứng bằng Xâu chuỗi (Proof Chain) cuối cùng.
- **Ví dụ:** Giả thuyết tổng thể cho rằng Đức đột nhập trộm tranh, sau đó Tấn vào xưởng vẽ tranh chấp và sát hại Nam để cướp tác phẩm nhằm trang trải nợ nần cho cả hai.

---

## 🎯 04. Tầng Kết Luận & Kết Án (Verdict Layer)

### 15. Xâu chuỗi (Proof Chain)
- **Định nghĩa:** Tập hợp các mắt xích logic được liên kết chặt chẽ với nhau để chứng minh hành vi phạm tội của hung thủ mà không thể bác bỏ. Trong hệ thống game, đây là đồ thị logic khép kín (`requiredProofGraph`) kết nối tuần tự từ: **Chứng cứ/Sự thật (Evidence/Fact)** $\rightarrow$ **Bước suy luận (Inference)** $\rightarrow$ **Điểm mâu thuẫn (Contradiction)** $\rightarrow$ **Báo cáo kết án (Verdict)**.
- **Ví dụ:** `Dây rèm cửa bị cắt mất 1.5m` + `Vết hằn trên cổ nạn nhân do dây vải gây ra` $\rightarrow$ Hung thủ đã siết cổ bằng dây rèm $\rightarrow$ Chỉ có Tấn ở trong phòng rèm lúc 22:00 $\rightarrow$ Kết luận: Tấn là hung thủ.

### 16. Chứng cứ then chốt (Exclusive Evidence)
- **Định nghĩa:** Chứng cứ có tính chất quyết định, loại bỏ hoàn toàn các giả thuyết vô hại khác và chỉ có thể xảy ra do hành vi phạm tội của hung thủ.
- **Ví dụ:** Mảnh kim loại chìa khóa gãy trong ổ khóa trùng khớp phôi chìa của Tấn (Loại bỏ giả thuyết Tấn vô tình dính sơn vì Tấn là chủ phòng tranh).

### 17. Sự thật tuyệt đối (Canon Truth)
- **Định nghĩa:** Sự thật duy nhất, khách quan đã xảy ra trong quá khứ của vụ án mà người chơi có nhiệm vụ phải khai quật và tái dựng lại.

### 18. Báo cáo kết án (Verdict)
- **Định nghĩa:** Lựa chọn kết án cuối cùng của người chơi gửi lên hệ thống HQ, chỉ ra hung thủ, động cơ và đính kèm đồ thị Proof Chain hợp lệ.
