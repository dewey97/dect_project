# Đặc Tả Kỹ Thuật: Hệ Thống Điểm Nghiệp Vụ & Bảng Xếp Hạng Thám Tử
## (Detective Rating, Penalty System & Leaderboard Spec)

> **Mã đặc tả**: `SPEC-CORE-16`  
> **Trạng thái**: Đã phê duyệt ý tưởng & ghi nhận kiến trúc (Ready for Roadmap Implementation)  
> **Phân hệ**: Core Gameplay, Epilogue & Global Leaderboard

---

## 🎯 1. Bối Cảnh & Mục Tiêu Thiết Kế

Trong các tựa game trinh thám điều tra thực tế, cảm giác thỏa mãn lớn nhất của người chơi đến từ khoảnh khắc **"Eureka"** — tự mình xâu chuỗi lời khai, biên bản và mốc thời gian để tìm ra chân tướng.
Nếu hệ thống gợi ý quá dễ tiếp cận và miễn phí, người chơi dễ hình thành phản xạ bấm xem ngay khi gặp khó, làm suy giảm nghiêm trọng giá trị cốt lõi của trò chơi.

Hệ thống **Điểm Nghiệp Vụ & Bảng Xếp Hạng (Detective Rating & Leaderboard)** được thiết kế nhằm:
1. **Tạo ra "cái giá" đánh đổi rõ ràng**: Mỗi lần xé niêm phong gợi ý đều ảnh hưởng trực tiếp đến kết quả đánh giá năng lực phá án cuối cùng.
2. **Kích thích lòng tự tôn và động lực chơi lại**: Người chơi cạnh tranh để đạt **Rank S (Thám Tử Bậc Thầy)** mà không cần bất kỳ sự trợ giúp nào.
3. **Mở rộng tính năng Bảng Xếp Hạng (Global Leaderboard)**: Vinh danh các thám tử phá án độc lập và chính xác nhất trên nền tảng.

---

## ⚖️ 2. Cơ Chế Thang Điểm Nghiệp Vụ (Detective Rating Points)

### 2.1. Điểm khởi điểm
- Khi bắt đầu một chuyên án mới, người chơi được cấp **100 Điểm Nghiệp Vụ** tối đa.

### 2.2. Ma trận trừ điểm (Penalty Matrix)

| Hành động | Mức độ can thiệp | Điểm trừ | Ghi chú nghiệp vụ |
| :--- | :--- | :---: | :--- |
| **Bóc Gợi ý Mức 1** | Định hướng tài liệu (Directional) | **-5 điểm** | Tham vấn bước đầu, chỉ điểm hồ sơ cần đọc lại |
| **Bóc Gợi ý Mức 2** | Gợi mở mâu thuẫn (Methodological) | **-15 điểm** | Đặt câu hỏi logic then chốt |
| **Bóc Gợi ý Mức 3** | Tiết lộ lời giải (Critical Reveal) | **-25 điểm** | Can thiệp trực tiếp vào kết luận |
| **Đoán sai Checkpoint liên tục** | Thử bừa đáp án (>3 lần sai) | **-2 điểm / lần** | Chống brute-force form nhập liệu |

---

## 🏅 3. Thang Phân Hạng Thám Tử (Detective Ranks)

Tại màn hình kết thúc vụ án (**Ký Sự Hậu Án / Epilogue**), hệ thống sẽ tổng kết toàn bộ quá trình điều tra và cấp **Giấy Chứng Nhận Nghiệp Vụ**:

```
+-------------------------------------------------------------------+
|               BỘ CÔNG AN // BAN CHUYÊN ÁN SỐ 14                  |
|                   BẢNG ĐÁNH GIÁ NĂNG LỰC ĐIỀU TRA                 |
|                                                                   |
|   ĐIỂM NGHIỆP VỤ: 95/100                                          |
|   XẾP HẠNG: HẠNG S [THÁM TỬ BẬC THẦY]                             |
|                                                                   |
|   - Số lần tham vấn gợi ý: 1 lần (Mức 1)                          |
|   - Thời gian phá án: 01 giờ 24 phút                              |
|   - Nhận định: Phá án xuất sắc, tư duy độc lập sắc bén.           |
+-------------------------------------------------------------------+
```

### Chi tiết các cấp bậc:

1. **Rank S — Thám Tử Bậc Thầy (Master Detective)** *(95 – 100 điểm)*:
   - **Tiêu chuẩn**: Hoàn toàn tự lực cánh sinh, hoặc tối đa chỉ mở 1 gợi ý Mức 1 trong suốt vụ án.
   - **Phần thưởng**: Huy chương vàng điều tra độc lập, hiệu ứng đặc biệt trên bảng vinh danh và mở khóa tư liệu tuyệt mật hậu trường vụ án.
2. **Rank A — Thám Tử Ưu Tú (Senior Detective)** *(80 – 94 điểm)*:
   - **Tiêu chuẩn**: Sử dụng rất ít viện trợ, suy luận logic vững vàng.
3. **Rank B — Thám Tử Cần Cù (Field Detective)** *(65 – 79 điểm)*:
   - **Tiêu chuẩn**: Cần sự trợ giúp ở các nút thắt then chốt, nhưng vẫn hoàn tất bản cáo trạng chuẩn xác.
4. **Rank C — Học Việc Nghiệp Vụ (Junior Investigator)** *(Dưới 65 điểm)*:
   - **Tiêu chuẩn**: Lạm dụng nhiều gợi ý Mức 2 và Mức 3. Bản án hoàn thành nhưng được đánh giá là phụ thuộc nhiều vào chỉ đạo tuyến trên.

---

## 🌐 4. Kiến Trúc Dữ Liệu & Bảng Xếp Hạng (Leaderboard Schema)

### 4.1. Bảng cơ sở dữ liệu Supabase: `case_leaderboards`

```sql
CREATE TABLE public.case_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    case_id VARCHAR(50) NOT NULL,
    detective_name VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    rank_tier VARCHAR(10) NOT NULL CHECK (rank_tier IN ('S', 'A', 'B', 'C')),
    hints_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb, -- { level1: 1, level2: 0, level3: 0 }
    completion_time_seconds INTEGER NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_verified BOOLEAN DEFAULT true,
    
    CONSTRAINT unique_user_case UNIQUE (user_id, case_id)
);

-- Index tra cứu bảng xếp hạng theo điểm số cao nhất và thời gian hoàn thành nhanh nhất
CREATE INDEX idx_case_leaderboards_rank ON public.case_leaderboards (case_id, score DESC, completion_time_seconds ASC);
```

### 4.2. Local Storage State (Client-Side)

Để hỗ trợ cả chế độ khách (Guest / Offline-first):
- `detective_score`: Lưu điểm số hiện tại của vụ án.
- `hint_unlocked_levels`: Ghi nhận số lượng và cấp độ gợi ý đã bóc niêm phong.
- `case_started_at`: Timestamp bắt đầu phá án.

---

## 🗺️ 5. Lộ Trình Triển Khai (Roadmap)

- [x] **Giai đoạn 1 (Đã hoàn tất)**: Xây dựng cơ chế **"Giữ 3 Giây Bóc Niêm Phong" (Hold-to-Reveal 3s)** tại `HintModal`, che mờ nội dung gợi ý bằng vệt đen mật (redacted bars) và cảnh báo nguyên tắc độc lập nghiệp vụ.
- [ ] **Giai đoạn 2 (Logic tính điểm & trừ điểm)**:
  - Tạo hook `useDetectiveScore(caseId)` lắng nghe sự kiện bóc niêm phong gợi ý.
  - Cập nhật điểm thời gian thực và ghi nhận vào localStorage / Supabase.
- [ ] **Giai đoạn 3 (Bằng Khen Hậu Án & Leaderboard)**:
  - Thiết kế component `DetectiveMeritCertificate` tại `EpilogueModal` với hình thức giấy khen cổ điển retro.
  - Xây dựng trang Bảng Vàng Danh Dự (`/cases/[id]/leaderboard`) cho phép chia sẻ chứng nhận lên mạng xã hội.
