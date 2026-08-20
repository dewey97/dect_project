# VỤ ÁN 000: TRỐN TÌM (HIDE-AND-SEEK) — THIẾT KẾ GAMEPLAY & CƠ CHẾ ĐIỀU TRA CHI TIẾT

> **Tài liệu Gameplay Master:** Quy định toàn bộ luồng chơi (Player Journey), thao tác tương tác, các trường hợp rẽ nhánh sai/đúng, hệ thống gợi ý 3 cấp độ và tiêu chí đánh giá điểm số Thám tử cho Vụ án 000.

---

## 🎮 CHƯƠNG I: TỔNG QUAN HỆ THỐNG GIAO DIỆN & CÔNG CỤ THÁM TỬ (INVESTIGATION TOOLS)

Trong quá trình điều tra, người chơi sử dụng **05 công cụ core UI** trên hệ thống Studio Thám tử:

1. **Hồ sơ Vụ án (Document Reader & Viewer):** Mở xem các báo cáo pháp y, biên bản lời khai, ảnh hiện trường và tài liệu dạng PDF/LaTeX.
2. **Công cụ So sánh Song song (Side-by-Side Document Comparison):** Đặt 2 tài liệu cạnh nhau để tìm điểm mâu thuẫn (Ví dụ: So sánh *Di chúc 2018* vs *Luật Đất đai 2021*, hoặc *Lời khai của Hà* vs *Thời gian tử vong Pháp y*).
3. **Bảng Đốm Sáng Manh Mối (Evidence Notebook & Pinboard):** Đánh dấu các từ khóa (Keywords), trích dẫn mốc thời gian và liên kết các manh mối với đối tượng nghi vấn.
4. **Cổng Nộp Bằng Chứng & Kết Luận Checkpoint (Submission Modal):** Nơi người chơi nộp tổ hợp `[Nghi phạm] + [Bằng chứng 1] + [Bằng chứng 2]` để vượt Phase hoặc đưa ra Lời buộc tội cuối cùng.
5. **Hệ thống Trợ lý Điều tra (Hint Assistant):** Cung cấp 3 cấp độ gợi ý (Gợi ý nhẹ -> Gợi ý trọng tâm -> Gợi ý trực tiếp) có tính phí điểm thưởng.

---

## 🗺️ CHƯƠNG II: LUỒNG CHƠI CHI TIẾT THEO 4 GIAI ĐOẠN (PHASE WALKTHROUGH)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ GIAI ĐOẠN 0     │────>│ GIAI ĐOẠN 1     │────>│ GIAI ĐOẠN 2     │────>│ GIAI ĐOẠN 3     │
│ Khám nghiệm     │     │ Tranh chấp      │     │ Bí mật quá khứ  │     │ Lật tẩy hung thủ│
│ Hiện trường     │     │ Di chúc (Mai/Vũ)│     │ Xô xát (Tùng)   │     │ Thực sự (Hà)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

### 🟢 GIAI ĐOẠN 0: KHÁM NGHIỆM HIỆN TRƯỜNG & KHOANH VÙNG SƠ BỘ

#### 1. Trạng thái mở đầu (Initial Unlocks)
* **Tài liệu khả dụng:**
  * Báo cáo tử thi sơ bộ (`pdf/phase_0_initial/01_bao_cao_kham_nghiem_tu_thi.pdf`)
  * Biên bản hiện trường (`pdf/phase_0_initial/02_bien_ban_kham_nghiem_hien_truong.pdf`)
  * Báo cáo tiến độ (`pdf/phase_0_initial/03_bao_cao_tien_do_dieu_tra.pdf`)
  * Xác minh nhân thân Khang (`pdf/phase_0_initial/04_bao_cao_xac_minh_nhan_than_khang.pdf`)
  * Rà soát mâu thuẫn (`pdf/phase_0_initial/05_bao_cao_chuyen_de_mau_thuan_va_quan_he.pdf`)
  * Biên bản lời khai hàng xóm (`pdf/phase_0_initial/06_bien_ban_lay_loi_khai_hang_xom.pdf`)
  * 04 Biên bản lời khai nghi phạm riêng biệt (`07a`, `07b`, `07c`, `07d`).

#### 2. Thao tác người chơi (Player Actions)
* Đọc báo cáo tử thi để ghi nhận 2 loại vết thương: **Vết bầm tím gáy** (do va đập) và **Vết đâm đứt động mạch cảnh** (nguyên nhân tử vong).
* Ghi nhận danh sách 04 nghi phạm chính: **Trần Ngọc Mai** (Em họ), **Lê Quang Vũ** (Chồng Mai), **Tùng** (Bạn cũ), **Trần Thị Hà** (Bạn gái cũ).

#### 3. Điều kiện vượt Checkpoint Phase 0
* **Yêu cầu:** Xác nhận thành công 04 đối tượng nghi vấn và khoanh vùng 2 nhóm mâu thuẫn lớn (Tài sản đền bù vs Mâu thuẫn cá nhân quá khứ).

---

### 🟡 GIAI ĐOẠN 1: BÓC TÁCH TRANH CHẤP TÀI SẢN (MAI & VŨ)

#### 1. Manh mối mới mở khóa (Phase 1 Unlocks)
* Di chúc ông nội viết tay (`pdf/phase_1_inheritance/08_di_chuc_ong_noi_gia_mao.pdf`)
* Kết quả giám định chữ ký & mực (`pdf/phase_1_inheritance/09_ket_qua_giam_dinh_chu_ky.pdf`)
* Bản đồ địa chính gốc & Giấy nợ Vũ (`pdf/phase_1_inheritance/10_ban_do_dia_chinh_va_giay_no_vu.pdf`)

#### 2. Thao tác suy luận của người chơi (Deduction Mechanics)
* **Thao tác 1 (Phát hiện Di chúc giả):** Người chơi mở công cụ Side-by-Side so sánh ngày ký di chúc **15/04/2018** với cụm từ *"Mã thửa địa chính khóa 2021-BS14"*.
  * *Suy luận:* Mã địa chính năm 2021 không thể xuất hiện trong di chúc năm 2018 $\rightarrow$ Khang đã tự viết chèn chữ làm giả di chúc để chiếm tài sản.
* **Thao tác 2 (Loại trừ Mai):** Kiểm tra Kết quả giám định chữ ký và Email luật sư $\rightarrow$ Mai phát hiện di chúc giả nên mang đi nhờ luật sư giám định hợp pháp (Loại trừ động cơ giết người tại hiện trường của Mai).
* **Thao tác 3 (Bóc tách Lê Quang Vũ):** Phân tích Giấy nợ 350 triệu và Bản đồ địa chính gốc 75m2 $\rightarrow$ Vũ nợ Khang 350 triệu giấu vợ, bị Khang ép đo khống 45m2 đất. Vũ lén vào hiện trường qua cửa sau lúc 19:30 chỉ để trộm bản vẽ tiêu hủy chứng cứ gian lận.

#### 3. Điều kiện nộp Checkpoint Phase 1
* **Lựa chọn:** Báo cáo giải trình mâu thuẫn tài sản.
* **Đáp án đúng:** Loại trừ Mai & Vũ khỏi khả năng là hung thủ trực tiếp đâm nạn nhân.

---

### 🔴 GIAI ĐOẠN 2: KHAI QUẬT QUÁ KHỨ & CUỘC XÔ XÁT (TÙNG)

#### 1. Manh mối mới mở khóa (Phase 2 Unlocks)
* Biên bản trích xuất camera cây xăng & Mảnh giấy note 1998 (`pdf/phase_2_altercation/11_bien_ban_trich_xuat_camera_va_tro_tron_tim.pdf`)
* Bài báo cũ năm 1998 & Ảnh chụp trò chơi trốn tìm.

#### 2. Thao tác suy luận của người chơi (Deduction Mechanics)
* **Thao tác 1 (Giải mã bí mật quá khứ):** Phân tích mảnh giấy note trốn tìm năm 1998 $\rightarrow$ Gia Huy (em Tùng) bị kẹt ngạt khí trong tủ âm tường do Khang gài chốt. Khang dùng kỷ vật này đe dọa tống tiền Tùng.
* **Thao tác 2 (Phân tích Camera & Lời khai Tùng):** Camera cây xăng ghi nhận Tùng đi vào nhà lúc 19:45 và tháo chạy hoảng loạn lúc **20:15**.
* **Bẫy Red Herring đỉnh điểm:** Tùng thừa nhận xô Khang bất tỉnh và làm vỡ bộ bình trà lúc 20:00. Tùng thật sự nghĩ mình đã làm chết Khang nên vô cùng hoảng sợ bối rối.

#### 3. Thử thách người chơi (Red Herring Trap)
* Người chơi dễ rơi vào bẫy quy kết Tùng là hung thủ sát hại Khang. Nếu nộp kết luận buộc tội Tùng ở giai đoạn này $\rightarrow$ **Bị cảnh báo sai lầm!**

---

### 🟣 GIAI ĐOẠN 3: LẬT TẨY HUNG THỦ THỰC SỰ (TRẦN THỊ HÀ)

#### 1. Manh mối mới mở khóa (Phase 3 Unlocks)
* Báo cáo pháp y bổ sung (`pdf/phase_3_conclusion/12_bao_cao_phap_y_bo_sung_va_loi_khai_ha_lo_loi.pdf`)
* Tập hợp tin nhắn SMS & Email (`pdf/phase_3_conclusion/13_tong_hop_tin_nhan_sms_va_email.pdf`)

#### 2. Thao tác suy luận chốt hạ (The Grand Deduction)
Người chơi phải kết nối **03 Manh mối Nút thắt (Clash Proofs)**:

* **Bằng chứng 1 (Thời gian tử vong Pháp y):** Báo cáo pháp y bổ sung xác định vết bầm gáy do Tùng xô ngã chỉ gây ngất tạm thời. Khang tử vong chính xác vào lúc **21:00 đến 21:15** do vết đâm đứt động mạch (45 phút sau khi Tùng đã bỏ đi lúc 20:15).
* **Bằng chứng 2 (Alibi Clash - Sự lỡ lời của Hà):** Mở Side-by-Side so sánh Biên bản lời khai của Hà (`07d`) với Biên bản hiện trường:
  * Hà khai: *"Cả tối 24/07 tôi ở nhà xem tivi không đi đâu"*.
  * Nhưng Hà lại lỡ lời: *"Tôi thấy anh Khang nằm gục cạnh bộ bình trà vỡ vụn dưới sàn nhà thật đáng thương..."*.
  * Bộ bình trà chỉ bị Tùng làm vỡ lúc 20:00 $\rightarrow$ Khẳng định Hà đã lén chui vào hiện trường sau 20:15!
* **Bằng chứng 3 (Động cơ bộc phát):** Ảnh tin nhắn điện thoại Khang cho thấy tin nhắn tình nhân mới lúc 20:40 $\rightarrow$ Hà chứng kiến Khang ngất + đọc tin nhắn phớt lờ $\rightarrow$ Ghen tuông cuồng loạn vơ mảnh thủy tinh đâm đứt động mạch Khang lúc 21:00.

---

## 🔀 CHƯƠNG III: CÁC KỊCH BẢN RẼ NHÁNH & KẾT CỤC (DECISION BRANCHES & FAIL CASES)

Khi người chơi đưa ra Lời buộc tội (Accusation Submission), hệ thống xử lý theo 4 kịch bản:

### 1. Kịch bản Buộc tội Sai 1: Buộc tội Trần Ngọc Mai (Em họ)
* **Cơ sở người chơi chọn sai:** Thấy Mai có dấu vân tay trên tủ âm tường và tranh chấp di chúc.
* **Phản hồi hệ thống (Fail Feedback):** *"Luật sư Nguyễn Văn Minh cung cấp bằng chứng Mai làm việc tại văn phòng luật từ 19:30 đến 20:30. Kết quả giám định cho thấy di chúc bị Khang làm giả trước đó. Mai hoàn toàn vô tội về hành vi sát hại."*
* **Hậu quả:** Trừ **-20 điểm Thám tử**. Cho phép thử lại.

### 2. Kịch bản Buộc tội Sai 2: Buộc tội Lê Quang Vũ (Chồng Mai)
* **Cơ sở người chơi chọn sai:** Thấy Vũ nợ Khang 350 triệu và có vết giày nam ở cửa sau.
* **Phản hồi hệ thống (Fail Feedback):** *"Dấu vết tại hiện trường cho thấy Vũ lén vào lúc 19:30 để trộm bản vẽ địa chính 75m2 tiêu hủy chứng cứ gian lận. Lời khai bạn nhậu xác nhận Vũ ở quán ăn từ 19:40 đến 22:00. Vũ không có mặt tại thời điểm án mạng 21:00."*
* **Hậu quả:** Trừ **-20 điểm Thám tử**. Cho phép thử lại.

### 3. Kịch bản Buộc tội Sai 3: Buộc tội Tùng (Bạn cũ)
* **Cơ sở người chơi chọn sai:** Bị sập bẫy Red Herring do thấy Tùng thừa nhận xô ngã Khang và camera ghi nhận Tùng tháo chạy hoảng hốt.
* **Phản hồi hệ thống (Fail Feedback):** *"Báo cáo pháp y bổ sung chỉ ra cú xô ngã của Tùng chỉ làm Khang ngất xỉu tạm thời. Nạn nhân tử vong lúc 21:00 do vết đâm mất máu cấp — tròn 45 phút sau khi Tùng đã bỏ chạy lúc 20:15 (theo camera cây xăng). Tùng không phải hung thủ đâm đứt động mạch nạn nhân!"*
* **Hậu quả:** Trừ **-30 điểm Thám tử**. Yêu cầu xem lại Báo cáo pháp y bổ sung (`12`).

### 4. Kịch bản Buộc tội Đúng 100%: Buộc tội Trần Thị Hà (Bạn gái cũ)
* **Tổ hợp điều kiện thắng (Victory Combo):**
  * `Accused Suspect`: Trần Thị Hà (`ha`)
  * `Primary Evidence 1`: Báo cáo pháp y bổ sung giờ tử vong 21:00 (`12_bao_cao_phap_y_bo_sung_va_loi_khai_ha_lo_loi.pdf`)
  * `Primary Evidence 2`: Biên bản lời khai lỡ lời của Hà về bộ bình trà vỡ (`07d_bien_ban_loi_khai_tran_thi_ha.pdf`)
* **Phản hồi hệ thống (True Ending):** *"Trần Thị Hà gục ngã trước những chứng cứ thép. Hà thừa nhận đã bám theo Tùng, chui qua cửa sau lúc 20:45. Thấy Khang bất tỉnh cùng tin nhắn tình nhân mới, cơn ghen cuồng loạn khiến Hà vơ mảnh thủy tinh đâm chết Khang lúc 21:00. Vụ án phá thành công!"*

---

## 💡 CHƯƠNG IV: HỆ THỐNG GỢI Ý 3 CẤP ĐỘ (HINT SYSTEM)

Nếu người chơi bị bế tắc, có thể mở bảng Trợ lý Điều tra để nhận gợi ý:

### 🟢 Gợi ý Cấp 1 (Soft Hint - Chi phí: 5 Điểm)
* **Phase 1:** *"Hãy so sánh năm lập di chúc viết tay với thời điểm các điều luật địa chính ghi trong văn bản được ban hành."*
* **Phase 2:** *"Thời gian Tùng xuất hiện trên camera cây xăng có thực sự trùng khớp với thời gian tử vong trong báo cáo tử thi không?"*
* **Phase 3:** *"Hãy đọc kỹ từng từ trong lời khai ban đầu của các nghi phạm. Có ai mô tả chi tiết hiện trường mà lẽ ra một người ở nhà không thể biết?"*

### 🟡 Gợi ý Cấp 2 (Medium Hint - Chi phí: 10 Điểm)
* **Phase 1:** *"Di chúc ghi năm 2018 nhưng lại nhắc tới 'Mã thửa 2021-BS14'. Khang đã làm giả di chúc này!"*
* **Phase 2:** *"Tùng tháo chạy lúc 20:15 sau khi xô Khang ngất. Hãy tìm xem ai là người chui vào nhà sau thời điểm 20:15."*
* **Phase 3:** *"So sánh file `07d_bien_ban_loi_khai_tran_thi_ha.pdf` với file `02_bien_ban_kham_nghiem_hien_truong.pdf`. Chi tiết 'bộ bình trà vỡ' chính là chìa khóa!"*

### 🔴 Gợi ý Cấp 3 (Direct Solution Hint - Chi phí: 20 Điểm)
* *"Hung thủ là Trần Thị Hà. Nộp kết hợp file `12` (Giờ tử vong 21:00) và file `07d` (Hà lỡ lời mô tả bình trà vỡ sau khi Tùng làm vỡ lúc 20:00) để hoàn thành vụ án."*

---

## 🏆 CHƯƠNG V: THẢNG ĐIỂM & BẢNG XẾP HẠNG THÁM TỬ (SCORING & RATING)

Điểm tổng kết được tính theo công thức:
$$\text{Tổng điểm} = 100 - (\text{Số lần đoán sai} \times 20) - (\text{Tổng chi phí gợi ý đã dùng})$$

* 🌟 **Hạng S (S-Rank - Thám tử Thiên tài):** Điểm từ **90 - 100**. Phá án không đoán sai, không dùng gợi ý Cấp 3.
* 🥇 **Hạng A (A-Rank - Thám tử Chuyên nghiệp):** Điểm từ **75 - 89**. Đoán sai tối đa 1 lần hoặc dùng gợi ý nhẹ.
* 🥈 **Hạng B (B-Rank - Thám tử Tập sự):** Điểm từ **60 - 74**. Sử dụng gợi ý Cấp 2 và đoán sai 1-2 lần.
* 🥉 **Hạng C (C-Rank - Đạt yêu cầu):** Điểm dưới **60**. Phá án thành công nhờ gợi ý Cấp 3.
