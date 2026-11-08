# Case Factory

Bộ công cụ để viết vụ án mới nhanh và chắc logic, dùng AI (Claude Code) làm người viết nháp, chủ dự án làm người duyệt.

```
case_factory/
  FORMULA.md                 công thức: luật cứng / khung mặc định / núm vặn — ĐỌC TRƯỚC
  rules/01_solution_graph.md  chi tiết 7 bước và quy tắc từng tầng
  rules/02_gameplay_constraints.md  engine làm được gì hôm nay
  library/skeletons.md        kho cấu trúc vụ
  library/devices.md          kho thủ pháp (twist, ngoại phạm giả, manh mối...)
  template/case_bible.template.yaml  form trống
  examples/case_000/          vụ mẫu điền đầy đủ (lấy độ chặt logic, không lấy câu chuyện)
  tools/check_bible.py        kiểm tra tham chiếu chéo
  cases/<slug>/               vụ mới (tạo khi bắt đầu)
```

## Làm một vụ mới

Mỗi bước là một lượt giao việc cho AI. Dán prompt, AI ghi vào `cases/<slug>/case_bible.yaml`, bạn duyệt rồi mới sang bước sau.

**Bước 0 — Ý tưởng mở**

> Đọc `case_factory/FORMULA.md`, `library/`, và dòng cuối Sổ vụ. Hạt giống: «…». Bung 5 premise, mỗi premise một cấu trúc khác nhau, khác vụ trước ở ≥3 trục. Được bịa cấu trúc và thủ pháp ngoài kho. Ghi vào `ideas` của `cases/<slug>/case_bible.yaml` (copy từ template).

**Bước 1 — Premise**

> Premise chọn: «…». Điền `meta` (cả `axes`, `breaks`, `needs_dev`) và `truth`. Kiểm thứ trong tuần, mùa, thời tiết của ngày đã chọn.

**Bước 2 — Sự thật**

> Điền `characters`, `locations`, `travel`, `timeline`. Mọi nghi phạm có vị trí suốt cửa sổ vụ án. Liệt kê chỗ nào bạn phải đoán.

**Bước 3 + 4 — Dấu vết và Suy luận**

> Điền `evidence` từ timeline, rồi `deductions`. Với mỗi suy luận kết luận: thử bỏ từng vật chứng bắt buộc, kết luận còn đứng không? Có nghi phạm khác nào cũng thỏa mãn không? Chạy `python -I case_factory/tools/check_bible.py <file>`.

**Bước 5 + 6 — Bề mặt và Tài liệu**

> Điền `statements`, `red_herrings`, `dossiers`. Viết nội dung Hỏi/Đáp từng lời khai theo giọng văn ở `meta.axes.tone`.

**Bước 7 — Checkpoint**

> Điền `checkpoints`, `epilogues`. Đáp án lấy từ `deductions`. Gợi ý 3 cấp. Chạy lại check.

Sau bước 7: thêm một dòng vào Sổ vụ trong `FORMULA.md`. Thủ pháp mới bịa ra thì thêm vào `library/`.

## Chưa có

- Script import bible vào Supabase dạng `DRAFT`. Hiện phải nhập tay qua Studio.
- Validator bằng TypeScript tích hợp `lib/checkpoints/case-linter.ts`. `check_bible.py` mới kiểm tham chiếu chéo, chưa kiểm timeline (trùng chỗ, di chuyển bất khả) và tính duy nhất của lời giải.
