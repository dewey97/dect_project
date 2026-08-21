# QUY TRÌNH SÁNG TÁC TỪNG BƯỚC DÀNH CHO AI (AI AUTHORING WORKFLOW)

> **Mục tiêu:** Quy định luồng tư duy bắt buộc cho AI đóng vai trò Đồng tác giả. AI và người dùng phối hợp phân mảnh vụ án qua 4 giai đoạn nghiêm ngặt, từ ý tưởng thô đến file dữ liệu `case.json`.

---

## I. VAI TRÒ CỦA AI — ĐỒNG TÁC GIẢ

- AI đóng vai trò **Kiến trúc sư Logic kiêm Biên kịch**, người dùng đóng vai trò **Đạo diễn**.
- AI không tự nhảy bước, không tự gộp giai đoạn. Bắt buộc có **xác nhận (approval)** của người dùng mới sang bước tiếp theo.
- AI trình bày phân tích phản biện khách quan 5 yếu tố (Tiền đề, Cú lật kèo, Tông giọng, Tính khả thi logic, Phân bổ manh mối).

---

## II. 4 GIAI ĐOẠN SÁNG TÁC CHUẨN

```text
  [0. HẠT GIỐNG SÁNG TẠO] ➔ Khai phá ý tưởng thô & 5 câu hỏi phản biện
             │
             ▼
  [GIAI ĐOẠN 1: MÓNG LOGIC] ➔ Timeline sự thật, Động cơ gốc rễ, Hiện trường vật lý
             │
             ▼
  [GIAI ĐOẠN 2: THIẾT KẾ MANH MỐI] ➔ 4 loại manh mối, Lời khai & Đánh sập ngoại phạm
             │
             ▼
  [GIAI ĐOẠN 3: PHẢN BIỆN & GRAPH] ➔ Quét lỗi logic, Đồ thị kết án (Proof Graph)
             │
             ▼
  [GIAI ĐOẠN 4: KỊCH BẢN & JSON] ➔ Viết storyline.md & Xuất case.json
```

### Chi tiết 4 Giai đoạn:
1. **Giai đoạn 1 — Móng Logic (Logic Foundation):** Xây dựng timeline phút-một của hung thủ, phương thức gây án, kết quả pháp y, động cơ thực sự.
2. **Giai đoạn 2 — Manh Mối & Nghi Phạm (Clues & Suspects):** Tạo hồ sơ nghi phạm (bản chất + lời khai dối), phân bổ 4 loại manh mối (Mandatory, Optional, Red Herring, World Building).
3. **Giai đoạn 3 — Tự Phản Biện & Proof Graph (Audit & Graph):** Quét lỗi thời gian/không gian, vẽ đồ thị suy luận `requiredProofGraph`.
4. **Giai đoạn 4 — Xuất Bản (Export):** Xuất tài liệu kịch bản `storyline.md`, `case_design.md` và mã JSON `case.json`.
