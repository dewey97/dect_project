# Công thức: Đồ thị lời giải (Solution Graph)

> Luật số 1: **viết từ lời giải ra, không viết từ mở đầu vào.** AI không được viết lời khai, tài liệu hay câu hỏi trước khi đồ thị lời giải (bước 1–4) được duyệt.

Một vụ án là một đồ thị 4 tầng. Mỗi tầng chỉ được sinh ra từ tầng ngay trên nó.

```
SỰ THẬT        timeline thật: ai, ở đâu, làm gì, lúc mấy giờ
   │  mỗi hành động để lại ≥0 dấu vết
   ▼
DẤU VẾT        vật chứng, tài liệu, dữ liệu điện thoại, âm thanh hiện trường (mã <bộ>-xx)
   │  ghép ≥2 dấu vết thành 1 kết luận
   ▼
SUY LUẬN       kết luận người chơi phải tự rút ra (mã D-xx)
   │  mỗi checkpoint kiểm tra 1 hoặc vài suy luận
   ▼
CHECKPOINT     câu hỏi trong game, đáp án = mã vật chứng của suy luận
```

Lời khai và câu chuyện bề mặt (bước 5) là **lớp phủ** lên đồ thị: chúng nói dối hoặc nói thật về timeline, và mỗi lời nói dối phải bị ít nhất một suy luận vạch trần.

---

## 7 bước sản xuất

Mỗi bước ghi vào một phần của `case_bible.yaml` (form: `template/case_bible.template.yaml`, mẫu: `examples/case_000/`). Trước 7 bước có Bước 0 Ý tưởng mở (xem `FORMULA.md`). Không sang bước sau khi bước trước chưa duyệt.

| Bước          | Ghi vào                      | Nội dung                                                                                                                                             | Cổng duyệt (chủ dự án kiểm)                                                            |
| ------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1. Premise    | `meta`, `truth`              | Nạn nhân, hung thủ, động cơ, phương thức, hung khí, khung giờ tử vong, **điểm xoắn** (vì sao người chơi nghi sai người lúc đầu), thời lượng mục tiêu | Có muốn chơi vụ này không? Điểm xoắn có bất ngờ mà vẫn công bằng không?                |
| 2. Sự thật    | `characters`, `timeline`     | Timeline thật của **mọi** nhân vật trong cửa sổ vụ án, theo phút. Mỗi nghi phạm có bí mật riêng (lý do họ nói dối)                                   | Có ai ở 2 nơi cùng lúc không? Thời gian di chuyển có hợp lý không?                     |
| 3. Dấu vết    | `evidence`                   | Mỗi sự kiện timeline quan trọng để lại dấu vết gì. Mỗi dấu vết ghi nguồn (hiện trường, tài liệu, điện thoại, hotspot 360) và sự kiện sinh ra nó      | Đủ dấu vết chưa? Có dấu vết nào "rơi từ trên trời" (không sinh từ timeline) không?     |
| 4. Suy luận   | `deductions`                 | Kết luận người chơi phải rút ra, mỗi kết luận cần tập vật chứng bắt buộc + tùy chọn. Bao gồm suy luận buộc tội, minh oan và loại trừ                 | **Lời giải có duy nhất không?** Bỏ một vật chứng bắt buộc thì kết luận còn đứng không? |
| 5. Bề mặt     | `statements`, `red_herrings` | Lời khai từng người: câu nào thật, câu nào dối, câu dối bị suy luận nào vạch trần. Đánh lạc hướng có chủ đích                                        | Giọng văn. Lời nói dối có động cơ hợp lý không?                                        |
| 6. Tài liệu   | `documents`, `dossiers`      | Nội dung từng tài liệu (lý lịch, lời khai Hỏi/Đáp, biên bản, sổ sách), xếp vào bộ hồ sơ theo phase                                                   | Đọc lướt, sửa văn                                                                      |
| 7. Checkpoint | `checkpoints`, `epilogues`   | Câu hỏi trong game, `depends_on`, `unlocksDossier`, gợi ý 3 cấp, lời dẫn, hậu án                                                                     | Validator chạy tự động; chủ dự án chơi thử                                             |

Bước 1, 2, 4 là bắt buộc duyệt thủ công. Bước 3, 5, 6 có thể duyệt gộp. Bước 7 do validator chặn.

---

## Quy tắc từng tầng

Đánh dấu **[cứng]** = luật cứng trong `FORMULA.md`, không phá. Các dòng còn lại là mặc định: được làm khác, ghi lý do vào `breaks`.

### Sự thật (`timeline`)

- Mỗi sự kiện có `time` dạng `HH:MM` và `date`. Khoảng thời gian dùng `time` + `end_time`.
- **[cứng]** Mỗi nghi phạm có vị trí xác định trong **toàn bộ** cửa sổ vụ án. Khoảng trống chỉ được phép khi chính khoảng trống là manh mối, và phải ghi rõ.
- **[cứng]** Di chuyển giữa 2 địa điểm phải khả thi (ghi `travel_minutes` khi có).
- Sự kiện `is_secret: true` = chỉ hung thủ hoặc người làm biết. Đây là thứ người chơi phải suy ra.

### Dấu vết (`evidence`)

- **[cứng]** Mỗi vật chứng có `from_events[]` trỏ về sự kiện timeline sinh ra nó. Ngoại lệ: tài liệu nền (lý lịch, nhân thân) để trống. Vật chứng đánh lạc hướng cũng phải có nguồn gốc (sinh từ sự kiện thật nhưng vô can).
- Mã vật chứng duy nhất trong vụ, khớp với `case_evidence.code` hoặc `tag_code` của tài liệu khi import.
- Vật chứng "chí mạng" không nằm trong bộ hồ sơ mở sẵn từ đầu. Ngoại lệ hay: để nó ngay trước mắt nhưng chỉ có nghĩa sau khi có mảnh ghép khác.

### Suy luận (`deductions`)

- Mỗi suy luận nên ghép từ **≥2 vật chứng**. Một vật chứng tự nói lên kết luận = người chơi chỉ đọc, không suy luận.
- Ngoại lệ: suy luận loại `identify` (tra danh tính) được dùng 1 vật chứng nếu thao tác tra cứu là phần chơi.
- Tập `required` phải **đủ** để rút ra kết luận. Tập `optional` là vật chứng liên quan nhưng không cần thiết; người chơi chọn thêm không bị phạt.
- Mọi vật chứng ngoài `required ∪ optional` mà người chơi chọn sẽ bị chấm sai (`validateEvidenceSelection`). Vì vậy `optional` phải liệt kê đủ những thứ một người chơi hợp lý có thể chọn.
- **[cứng]** Suy luận kết luận chỉ đúng với một đáp án (một người, hoặc một nhóm người nếu vụ có đồng phạm).

### Checkpoint

- **[cứng]** Mỗi checkpoint ghi `tests[]`. Đáp án lấy từ suy luận, không gõ riêng.
- Mỗi nghi phạm thường có 1 lượt `suspect_interrogation` (2 lớp Động cơ + Mâu thuẫn). Nghi phạm phụ có thể chỉ cần một câu hỏi minh oan.
- Thường kết thúc bằng 1 `indictment`. Cấu trúc khác (ngược dòng, không có tội phạm, hai vụ một đêm) có thể kết thúc khác, xem `library/skeletons.md`.

---

## Lỗi đã gặp ở case_000 (validator phải bắt được)

Đối chiếu `docs/cases/case_000/01_design/case_design.md` với `gameplay_design.md`:

| Mâu thuẫn                      | case_design.md | gameplay_design.md                                                   |
| ------------------------------ | -------------- | -------------------------------------------------------------------- |
| Vũ rời Quán Bia 88             | 20:45          | 21:15                                                                |
| Khoảng cách quán → hiện trường | 4.5 km         | 3.8 km                                                               |
| Vũ trả tiền                    | chuyển khoản   | tiền mặt                                                             |
| Mã sổ nợ                       | `05`           | `10` (bảng tài liệu) và `05` (câu hỏi 2A)                            |
| Tùng gọi điện                  | 19:00          | lời khai "19:55" (có thể là lời dối có chủ đích, nhưng không ghi rõ) |

Nguyên nhân gốc: sự thật được viết lại ở nhiều tài liệu văn xuôi. Trong Case Factory, sự thật chỉ nằm ở **một chỗ** (`timeline` + `evidence`), mọi tài liệu khác tham chiếu bằng mã. Lời khai sai giờ phải được đánh dấu `truthful: false` kèm suy luận vạch trần, nếu không validator báo lỗi.
