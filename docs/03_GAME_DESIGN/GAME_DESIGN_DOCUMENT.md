# TÀI LIỆU THIẾT KẾ GAME CHÍNH (GAME DESIGN DOCUMENT - GDD) — VERITAS

> **Tầm nhìn Game Design:** VERITAS là một nền tảng điều tra số kết hợp linh hoạt giữa tương tác vật lý (Board Game) và máy trạm kỹ thuật số, nơi người chơi giành chiến thắng bằng cách chứng minh sự thật thông qua chuỗi chứng cứ logic hợp lệ.

---

## 01. Trụ Cột Trải Nghiệm (Core Experience Pillars)

*Chi tiết định hướng 5 Trụ cột Sản phẩm xem tại **[01_PRODUCT_VISION.md](../01_PRODUCT/01_PRODUCT_VISION.md#03-product-pillars)**.*

1. **Evidence Before Conclusion (Bằng chứng trước kết luận):** Mọi báo cáo kết luận đều yêu cầu đính kèm mã chứng cứ chứng minh. Không thưởng điểm cho việc chọn đáp án ngẫu nhiên.
2. **Investigation Feels Real (Cảm giác điều tra chân thực):** Mô phỏng công việc pháp y thực tế (phục hồi dữ liệu bị xóa, đối chiếu tháp sóng di động, soi mâu thuẫn lời khai).
3. **Dual-Layer Engagement (Mô hình tương tác kép):** Phục vụ tối ưu cho cả nhóm chơi Board Game quanh bàn (**Companion Mode**) và game thủ Solo trên Web (**Investigation OS Mode**).
4. **Decoupled Case Engine:** Tách biệt hoàn toàn mã nguồn trò chơi khỏi tập dữ liệu vụ án (Case Data Schema JSON).

---

## 02. Phân Tách 2 Chế Độ Chơi (Game Modes Overview)

```
                                CHẾ ĐỘ CHƠI VERITAS
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
CHẾ ĐỘ TRỢ LÝ (Companion Mode)                                CHẾ ĐỘ MÁY TRẠM (Digital OS Mode)
------------------------------                                ---------------------------------
• Dành cho nhóm 3-4 người chơi Board Game                     • Dành cho 1 người chơi Solo trên Web
• Tương tác chính trên tài liệu giấy ngoài đời                 • Thao tác 100% trên giao diện máy trạm
• Web hỗ trợ:                                                 • Web cung cấp:
  - Nhập mã vật chứng (Unlock)                                  - Giả lập điện thoại Nokia / SMS / Call logs
  - Kiểm tra Checkpoints câu hỏi                                - Tự động phát hiện Alibi Clash trên Timeline
  - Nhận gợi ý phân tầng (Progressive Hints)                    - Phân tích mã SHA-256 & metadata EXIF
```