# case_000: các quyết định khi chuẩn hóa vào Case Bible

Nguồn đối chiếu: `case_design.md`, `gameplay_design.md`, `db/schema/36_backfill_interrogation_criteria.sql`, `db/schema/17_case_checkpoint_dependencies.sql`, danh sách PDF trong `public/documents/case_000/`. Chưa đối chiếu dữ liệu Supabase production (MCP Supabase chưa có access token) và chưa đối chiếu các bản cập nhật chưa đẩy lên của chủ dự án.

Mỗi dòng: tài liệu cũ nói gì, bản mới chọn gì, vì sao. Chủ dự án duyệt hoặc đổi lại.

## Lỗi logic (cần sửa dù chọn phương án nào)

| #   | Vấn đề                                    | Chọn                                      | Lý do                                                                                     |
| --- | ----------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | Lịch VTV3 ghi "Thứ Sáu 24/07"             | Chủ nhật 24/07/2016                       | Lịch thật: 24/07/2016 là Chủ nhật. Người chơi tra lịch sẽ thấy sai                        |
| 2   | Phấn hoa xoan trên áo gió                 | Cánh hoa bằng lăng                        | Hoa xoan nở tháng 3–4, tháng 7 không có. Bằng lăng nở tháng 5–7                           |
| 3   | Phòng trọ Hà có nghe được còi tàu không   | Ghi rõ cách đường sắt ~2.5 km             | Nếu không ghi, còi tàu trong voice không chứng minh được Hà ở gần nhà Khang               |
| 4   | Ai đọc tin nhắn Thảo Vy                   | Thêm trạng thái "Đã xem 20:52" (MSG-03)   | Tạo manh mối công bằng: Khang bất tỉnh từ 20:05, người đọc phải là người khác trong phòng |
| 5   | Mã hộp thiếc 120713 không có nguồn suy ra | Thêm ảnh "Ngày đầu tiên 12.07.13" (PH-01) | Mật mã phải suy ra được từ vật chứng. **Cần chủ dự án xác nhận nguồn thật**               |

## Mâu thuẫn giữa các tài liệu

| #   | Chi tiết            | Các phiên bản cũ                    | Chọn                                                                      |
| --- | ------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| 6   | Vũ rời nhà Khang    | 19:25 / 19:30                       | Ra cổng 19:25, đặt xe 19:30                                               |
| 7   | Vũ đến quán         | 19:40 / 19:49                       | 19:45 (3.8 km, ~15 phút)                                                  |
| 8   | Vũ rời quán         | 20:45 / 21:15                       | 21:15                                                                     |
| 9   | Khoảng cách quán    | 4.5 km / 3.8 km                     | 3.8 km                                                                    |
| 10  | Vũ trả tiền         | chuyển khoản / tiền mặt             | Tiền mặt (khớp sổ thu chi và chủ quán làm chứng)                          |
| 11  | SĐT Vũ              | 0967.452.183 / 0988.200.991         | 0988200991 (khớp migration 36 đang chạy)                                  |
| 12  | Tùng xô Khang ngất  | 20:00 / 20:15                       | Đến 20:00, xô ngất 20:05, rời đi 20:15                                    |
| 13  | Lời khai Tùng       | "gọi 19:55" / gọi 19:00             | Gọi 19:00 (khớp nhật ký). Lời nói dối là "không sang", không phải giờ gọi |
| 14  | Hung khí            | mảnh sành / mảnh thủy tinh bình trà | Thủy tinh                                                                 |
| 15  | Nơi giấu tóc        | áo ngực / hộp thiếc                 | Hộp thiếc (khớp câu hỏi phụ mật mã của Hà)                                |
| 16  | Phấn hoa ở đâu      | áo ngực / áo gió                    | Áo gió (khớp lời Vũ thấy bóng áo gió)                                     |
| 17  | Mã sổ nợ            | `05` / `10`                         | A-10 (theo tên file PDF)                                                  |
| 18  | Bảng tin            | `11` và `18` riêng                  | Gộp một Bảng tin phường A-11 (chỉ có 1 file PDF)                          |
| 19  | Lịch VTV3 nằm ở đâu | không có file                       | Tờ báo trên bàn hiện trường (H-04)                                        |
| 20  | Vé xe buýt của Tùng | không rõ nơi thu                    | Thu trong ví Tùng, nằm trong bộ tự thú                                    |

## Thay đổi luồng chơi (khác production hiện tại)

| #   | Production / tài liệu cũ                  | Bản mới                                                                                          | Lý do                                                                                         |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| 21  | Bộ hồ sơ A, B, C                          | 8 bộ: A, Hiện trường, B (Tùng/Đạt), C (Vũ quán bia), D (tự thú), E (Hà), F (hộp thiếc), Kết luận | Engine mở sẵn slot 0 và 1, nên slot 1 dùng cho hiện trường. Mỗi bộ mở đúng lúc người chơi cần |
| 22  | Bộ quán bia mở sau `cp-000-1a-followup`   | Mở sau `cp-000-1a`                                                                               | Câu hỏi phụ hỏi giờ rời quán, cần sổ thu chi từ trước                                         |
| 23  | `cp-000-convergence` phụ thuộc `1a`, `1b` | Phụ thuộc `1a-followup`, `1b-followup`                                                           | Loại trừ cần kết quả minh oan của câu hỏi phụ                                                 |
| 24  | `cp-000-1c` không ghi phụ thuộc           | Phụ thuộc `cp-000-convergence`                                                                   | Đúng thiết kế: Hà chỉ bị nghi sau khi loại trừ 3 người                                        |

## Việc chưa làm

- Nội dung Hỏi/Đáp chi tiết của từng lời khai vẫn nằm trong PDF, chưa đưa vào bible (`documents_status: draft`).
- Chưa đối chiếu với dữ liệu Studio/Supabase và các bản cập nhật chưa đẩy lên.
