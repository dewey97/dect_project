# TÀI LIỆU UI/UX: HỆ THỐNG ADMIN STUDIO
**(CREATOR WORKSPACE FOR INTERACTIVE DETECTIVE GAMES)**

Tài liệu này phác thảo các nguyên tắc thiết kế UI/UX và cấu trúc giao diện (Wireframe Concept) cho hệ thống Admin Studio, phục vụ cho tác giả tạo kịch bản phá án.

---

## I. NGUYÊN TẮC THIẾT KẾ UX (UX PRINCIPLES)

Khác với giao diện của Người chơi (tối giản, nhập vai, bí ẩn), Admin Studio là một **Công cụ làm việc cường độ cao (Power-User Tool)**. 

1. **Information Density (Mật độ thông tin cao):** Tác giả cần nhìn thấy toàn cảnh vụ án. Cần sử dụng các bảng Grid, Split-pane (chia màn hình) thay vì giấu thông tin vào các menu con.
2. **Visual Mapping (Sơ đồ hóa trực quan):** Mối quan hệ phức tạp và các mốc thời gian không thể chỉ nhập bằng Text. Phải có giao diện kéo thả (Drag & Drop), Node-based (như Figma/Miro) và Timeline (như phần mềm dựng phim).
3. **Real-time Feedback (Phản hồi thời gian thực):** Bất cứ khi nào tác giả nhập một "Luồng thời gian" hoặc "Lời khai" gây mâu thuẫn (VD: 2 người cùng ở 1 chỗ), hệ thống phải **Báo đỏ ngay lập tức** mà không cần đợi bấm nút "Save".
4. **Draft & Sandbox (Tự do thử nghiệm):** Luôn có nút "Playtest" ở góc phải trên cùng để nhảy ngay vào góc nhìn của Người chơi để test dữ liệu vừa nhập.

---

## II. CẤU TRÚC LAYOUT TỔNG THỂ (GLOBAL LAYOUT)

Giao diện Admin Studio tuân theo chuẩn **Desktop-First** (không ưu tiên Mobile vì thao tác quá phức tạp), sử dụng kiến trúc **3-Column Layout** hoặc **Sidebar + Workspace**:

- **Left Sidebar (Navigation):**
  - Chuyển đổi giữa các Mô-đun: Case Settings, Characters, Timeline, Clues, Settings.
  - Hiển thị Tree View của kịch bản hiện tại.
- **Top Bar (Action & Status):**
  - Breadcrumb: `Admin Studio / Vụ án: Lời nguyền Huyết Nguyệt / Timeline`
  - Nút trạng thái: `Draft`, `In Review`, `Published`.
  - Nút **[ ⏵ PLAYTEST ]** nổi bật.
  - Notification Icon cảnh báo Logic (Ví dụ: 🔴 3 Lỗi Logic đang tồn tại).
- **Main Workspace (Center):**
  - Vùng làm việc chính thay đổi tùy theo Mô-đun đang chọn.
- **Right Panel (Contextual Inspector - Tùy chọn):**
  - Khi click vào một Nhân vật hoặc một Node trên sơ đồ, Inspector panel mở ra bên phải để cấu hình chi tiết (Tương tự Unity hoặc Figma).

---

## III. CHI TIẾT UI/UX TỪNG MÔ-ĐUN (THE CREATOR FLOW)

### 1. Mô-đun: Quản lý Nhân vật & Sự thật (Character & Truth Matrix)
**Vấn đề UX:** Tác giả cần quản lý song song "Sự thật" và "Lời nói dối" của một nhân vật.
**Thiết kế UI (Bảng tính kết hợp Form):**
- **Split View:** Bên trái là danh sách nhân vật (dạng List/Grid). Bấm vào ai, bên phải hiện ra **Truth Inspector**.
- **Truth Inspector** chia làm 2 tab rõ ràng (Dùng màu sắc phân biệt):
  - 🟢 **Tab Sự Thật (The Truth):** Chứa `Real Motive`, `Real Alibi`. (Giao diện theme sáng/trung tính).
  - 🔴 **Tab Lời Khai/Bí mật (The Lies/Secrets):** Chứa `Red Herring Secret` và các lời nói dối dự kiến. (Giao diện cảnh báo đỏ hoặc tối màu để tác giả nhận thức rõ đây là lớp ngụy trang).

### 2. Mô-đun: Ma trận Quan hệ (Relationship Matrix)
**Vấn đề UX:** Nhập liệu quan hệ chéo (A ghét B, B yêu C) bằng text hoặc bảng (Table) cực kỳ rối mắt.
**Thiết kế UI (Node-Based Graph):**
- **Miro-board Style:** Một Canvas vô tận (Infinite Canvas).
- Các nhân vật là các Vòng tròn (Node). Tác giả có thể kéo thả vị trí của họ cho dễ nhìn.
- Kéo từ Node A sang Node B để tạo một **Đường nối (Edge)**.
- Khi tạo đường nối, một popover hiện ra để chọn: 
  - Loại quan hệ: Thù hận, Tình cảm, Gia đình... (Phân biệt bằng màu dây: Đỏ, Hồng, Xanh lam).
  - Thanh trượt (Slider) để kéo chỉ số Căng thẳng/Thân thiết (-100 đến +100). Dây sẽ dày lên hoặc mỏng đi tùy vào chỉ số này.

### 3. Mô-đun: Multi-Track Timeline (Kiểm toán Logic)
**Vấn đề UX:** Thời gian trong vụ án mạng là yếu tố dễ sai nhất. Cần công cụ để căn chỉnh giờ giấc trực quan.
**Thiết kế UI (Video-Editor Style Timeline):**
- **Trục X (Ngang):** Là mốc thời gian của vụ án (VD: từ 18:00 đến 23:59 đêm xảy ra án mạng). Zoom in/out để xem từng phút.
- **Trục Y (Dọc):** Mỗi Nhân vật hoặc mỗi Địa điểm (Location) là một "Track" (Luồng).
- **Hành động (Events):** Là các "Block" hình chữ nhật nằm trên Track. Tác giả có thể kéo dãn block để biểu thị khoảng thời gian (VD: Nhân vật A ở Phòng khách từ 19:00 - 20:30).
- **🔴 Lỗi Logic Realtime (Clash Detection):** 
  - Nếu Tác giả kéo block của Nhân vật A vào "Phòng ăn" lúc 19:15, nhưng đồng thời lại có một block khác của Nhân vật A ở "Vườn" lúc 19:15 -> Cả hai block **chớp đỏ liên tục**, kèm theo popup báo lỗi "Conflict: Phân thân".
  - Chức năng **Ghost Track**: Hiển thị mờ mờ "Lời khai (Alibi)" đè lên trên "Sự thật (Truth)". Nếu Lời khai khác Sự thật, khoảng chênh lệch sẽ được highlight màu vàng để tác giả biết nhân vật này đang nói dối đoạn nào.

### 4. Mô-đun: Sơ đồ Hiện trường (Hotspots)
**Vấn đề UX:** Làm sao gán Manh mối vào vị trí trên ảnh hiện trường?
**Thiết kế UI (Image Map Editor):**
- Tác giả upload ảnh 2D của hiện trường lên chính giữa.
- Kéo thả các "Pin" (Ghim) vào ảnh để tạo Hotspot. 
- Bấm vào Pin -> Mở Inspector bên phải để chọn Manh mối (Clue) sẽ được mở khóa khi người chơi bấm vào vị trí này.

### 5. Mô-đun: Playtest Sandbox
**Thiết kế UI (Overlay / Split-screen):**
- Khi bấm nút **[ ⏵ PLAYTEST ]**, màn hình Admin Studio sẽ mờ đi.
- Giao diện Phá án (Mobile-view hoặc Desktop-view) sẽ hiện lên dưới dạng một Mockup điện thoại hoặc Modal khổng lồ ở giữa màn hình.
- Có thêm một **Developer Console Overlay** nhỏ góc dưới (Chỉ hiện trong mode Playtest của Admin) báo: *"Event XYZ vừa được trigger"*, *"Người chơi vừa unlock manh mối số 3"*, giúp tác giả debug luồng kịch bản.

---

## IV. CÔNG NGHỆ & THƯ VIỆN ĐỀ XUẤT (FRONTEND STACK CHO ADMIN)

Vì UI của Admin Studio rất đặc thù và phức tạp, đề xuất sử dụng các thư viện chuyên dụng sau:

1. **State Management:** **Zustand** (Rất quan trọng vì dữ liệu Timeline và Node thay đổi liên tục, dùng Context API sẽ bị re-render nặng).
2. **Node-based Editor (Mô-đun Ma trận):** **React Flow** (Thư viện chuẩn công nghiệp để làm sơ đồ tư duy, kéo thả dây nối rất mượt).
3. **Timeline Editor (Mô-đun Logic):** Custom UI dựa trên CSS Grid, hoặc dùng các thư viện như `react-calendar-timeline` nhưng custom lại mạnh tay.
4. **Form & Validation:** `react-hook-form` + `zod` (Để validate dữ liệu nhập liệu, ví dụ: Không được để trống Động cơ, Tên nhân vật phải unique...).
5. **UI Components:** Giữ nguyên **shadcn/ui** và **Tailwind CSS** để đồng bộ Design System với Giao diện Phá án.
