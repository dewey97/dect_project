# Công thức sản xuất vụ án

Công thức có 3 lớp, cứng dần từ ngoài vào trong:

| Lớp                   | Là gì                                                                         | Được phá không                      |
| --------------------- | ----------------------------------------------------------------------------- | ----------------------------------- |
| **1. Luật cứng**      | 6 điều giữ cho vụ án công bằng và không vỡ logic                              | Không                               |
| **2. Khung mặc định** | Cách làm đã chạy tốt ở case_000: 7 bước, thẩm tra 2 lớp, quy mô, số vật chứng | Được, khi ghi lý do vào `breaks`    |
| **3. Núm vặn**        | Mọi thứ còn lại: loại tội, cấu trúc, bối cảnh, giọng văn, cơ chế mới          | Tự do. Mỗi vụ nên vặn khác vụ trước |

Mục tiêu: vụ nào cũng **chắc** (lớp 1), nhưng không vụ nào giống vụ nào (lớp 3).

---

## Lớp 1: Luật cứng

1. **Viết từ lời giải ra.** Chốt sự thật (ai, làm gì, lúc nào, vì sao) trước khi viết một dòng lời khai hay câu hỏi.
2. **Một sự thật duy nhất.** Timeline và danh sách vật chứng là nguồn duy nhất. Mọi tài liệu khác tham chiếu bằng mã, không kể lại sự thật bằng văn xuôi.
3. **Công bằng.** Khi người chơi gặp một câu hỏi, mọi thứ cần để trả lời đã nằm trong tay họ. Không có manh mối giấu đến sau câu hỏi.
4. **Đáp án duy nhất cho mỗi câu hỏi chấm tự động.** Riêng câu hỏi tự do chấm bằng AI có thể có nhiều cách diễn đạt đúng, nhưng chỉ một kết luận đúng.
5. **Lời nói dối nào cũng có lý do.** Nếu game hỏi về một lời nói dối, phải có vật chứng vạch trần nó.
6. **Không sai với thực tế kiểm chứng được.** Gồm cả việc vật chứng phải lấy được bằng công cụ người chơi có trong truyện (trên tàu đang chạy thì không có kết quả ADN). Thứ trong tuần của ngày cụ thể, mùa hoa, thời tiết, khoảng cách, giá cả, công nghệ của năm đó. Người chơi sẽ tra Google.

Validator chỉ chặn cứng các luật này. Mọi thứ khác chỉ là cảnh báo.

---

## Lớp 2: Khung mặc định

Dùng khi không có lý do làm khác. Chi tiết: [rules/01_solution_graph.md](rules/01_solution_graph.md), [rules/02_gameplay_constraints.md](rules/02_gameplay_constraints.md).

- 7 bước: Premise → Sự thật → Dấu vết → Suy luận → Bề mặt → Tài liệu → Checkpoint.
- Mỗi suy luận ghép từ ≥2 vật chứng.
- Mỗi nghi phạm có một lượt thẩm tra 2 lớp (Động cơ, Mâu thuẫn).
- Có ít nhất một nghi phạm giả có động cơ mạnh hơn hung thủ thật.
- Vật chứng chí mạng không mở sẵn từ đầu.
- Gợi ý 3 cấp: hướng nhìn → tài liệu cụ thể → gần lời giải.
- Quy mô: 3–4 nghi phạm, 25–40 vật chứng, 8–12 checkpoint, 30 phút.

**Phá khung:** được làm khác bất kỳ điều nào ở trên. Ghi vào `breaks` trong bible, kèm lý do. Ví dụ: vụ không có nghi phạm giả vì người chơi phải chứng minh đây là tự sát; vụ có 2 hung thủ nên cáo trạng chọn 2 người.

**Cơ chế engine chưa có:** ghi vào `needs_dev` (ví dụ: chọn 2 bị can, giải mã thư mật mã, so khớp ảnh camera). Thiết kế vẫn tiếp tục; danh sách `needs_dev` thành việc cho dev.

---

## Lớp 3: Núm vặn

Mỗi vụ chọn một giá trị cho mỗi trục. Kho lựa chọn: [library/skeletons.md](library/skeletons.md) (cấu trúc), [library/devices.md](library/devices.md) (thủ pháp). Kho chỉ để gợi ý. Được trộn, được bịa thủ pháp mới, rồi bổ sung vào kho.

| Trục                 | Ví dụ giá trị                                                                    | case_000 chọn                    |
| -------------------- | -------------------------------------------------------------------------------- | -------------------------------- |
| Loại vụ              | Án mạng, mất tích, trộm, tống tiền, tự sát nghi vấn, tai nạn nghi vấn, lừa đảo   | Án mạng                          |
| Cấu trúc             | Phễu loại trừ, xoắn ốc, hai lớp sự thật, đếm ngược, kẻ kể chuyện không đáng tin… | Phễu loại trừ                    |
| Số thủ phạm          | 1, 2 đồng phạm, 2 người độc lập, không ai (tai nạn)                              | 1, nhưng 2 người gây thương tích |
| Twist chính          | Mồi nhử hoàn hảo, nạn nhân là thủ phạm, người kể chuyện, danh tính tráo…         | Mồi nhử hoàn hảo + Hai bàn tay   |
| Ngoại phạm giả       | Âm thanh nền, lịch kiểm chứng được, ảnh có dấu thời gian, nhân chứng mù…         | Âm thanh nền + lịch TV           |
| Cửa mở đầu           | Tra danh tính, giải mã, đọc hiện trường, câu hỏi thời gian                       | Tra 3 SĐT                        |
| Bối cảnh             | Thời đại, vùng miền, nghề nghiệp, cộng đồng khép kín                             | Xóm ven sông Hà Nội, 2016        |
| Giọng văn            | Hồ sơ lạnh, bi kịch gia đình, hài đen, kinh dị nhẹ                               | Bi kịch quá khứ                  |
| Nguồn manh mối chính | Hồ sơ giấy, điện thoại, hiện trường 360, bản đồ, âm thanh                        | Điện thoại + hồ sơ giấy          |
| Vai người chơi và hạn chót | Điều tra viên tại trụ sở, người trong cuộc, hành khách được nhờ; có hoặc không có hạn chót | Điều tra viên, không hạn chót |
| Từ ngữ giao diện (`ui_labels`) | Thẩm tra / Hỏi chuyện / Đối chất; Lời khai / Lời kể; Kết luận / Chỉ mặt hung thủ | Thẩm tra, Lời khai, Kết luận |

**Luật chống nhàm:** vụ mới phải khác vụ ngay trước ở ít nhất 3 trục. Ghi lựa chọn vào `meta.axes` và vào bảng [Sổ vụ](#sổ-vụ) bên dưới.

---

## Bước 0: Ý tưởng mở (trước 7 bước)

Đây là bước duy nhất được phép viết "từ cảm hứng". Không cần sự thật hoàn chỉnh.

1. **Hạt giống.** Một trong: một hình ảnh ("lọn tóc trong hộp thiếc"), một thủ pháp ("ngoại phạm bị phản bội bởi tiếng còi tàu"), một bối cảnh ("phiên chợ nổi lúc 4 giờ sáng"), một câu hỏi đạo đức ("giết người đã chết thì có tội không?").
2. **Bung 3–5 premise.** Mỗi premise dùng một cấu trúc khác nhau. Mỗi premise 5 dòng: nạn nhân, hung thủ, động cơ, twist, vì sao người chơi nghi sai.
3. **Chọn 1, hoặc ghép 2.** Chủ dự án chọn. Từ đây mới vào Bước 1 và áp luật cứng.

---

## case_000 làm mẫu: bóc thành thủ pháp

Mỗi thứ case_000 làm là một thủ pháp có thể tái dùng, thay thế hoặc đảo ngược.

| case_000 làm gì                                   | Tên thủ pháp            | Thay bằng gì ở vụ khác                                             |
| ------------------------------------------------- | ----------------------- | ------------------------------------------------------------------ |
| Tra 3 SĐT lạ trong nhật ký cuộc gọi               | Cửa danh tính           | Biển số xe, chữ ký, ảnh camera mờ, giọng trong ghi âm              |
| Tuyến Vũ và tuyến Tùng chơi song song             | Nhánh song song         | Tuyến tuần tự; 3 tuyến; tuyến chỉ mở khi chọn sai                  |
| Tùng có động cơ mạnh nhất, nói dối, để vân tay    | Mồi nhử hoàn hảo        | Mồi nhử tự nhận tội để bảo vệ người khác                           |
| Tùng xô ngất, Hà giết sau                         | Hai bàn tay             | Người thứ 2 chỉ dọn hiện trường; người thứ 1 là hung thủ thật      |
| Câu hỏi loại trừ 3 người trước khi lộ người thứ 4 | Phễu loại trừ           | Phễu ngược: bắt đầu nghi tất cả, mỗi bước thêm một người           |
| Voice note lọt tiếng còi tàu                      | Âm thanh phản bội       | Tiếng chuông nhà thờ, loa phường, tiếng sóng, tiếng ga tàu         |
| "Xem phim VTV3" nhưng tối đó không có phim        | Lịch kiểm chứng được    | Lịch bóng đá, giờ thủy triều, lịch cúp điện, giờ mặt trời lặn      |
| Sổ thu chi quán bia bàn B7 195k                   | Dấu thời gian giao dịch | Vé gửi xe, hóa đơn xăng, lịch sử chuyển khoản, check-in            |
| Bi kịch trốn tìm 1996, án mạng đúng ngày giỗ      | Bóng ma quá khứ         | Vụ cũ chưa giải, bài báo cũ, ảnh lớp học cũ                        |
| Hà giữ lọn tóc mai dính máu                       | Kẻ giữ kỷ vật           | Hung thủ lấy đi một món đồ, chỗ trống trên hiện trường là manh mối |
| Hộp thiếc khóa 6 số                               | Ổ khóa mật mã           | Mật khẩu điện thoại, két sắt, file zip, câu đố trong nhật ký       |
| 4 ký sự hậu án                                    | Hậu án đa tuyến         | Một kết mở, một lá thư của hung thủ, một tin báo 10 năm sau        |

Khi dùng case_000 làm tham chiếu: lấy **độ chặt của logic** (timeline đầy đủ, mỗi lời khai dối có vật chứng vạch trần), không lấy **câu chuyện**. Vụ mới không được dùng lại cùng lúc quá 2 thủ pháp của case_000.

---

## Sổ vụ

Cập nhật sau mỗi vụ để luật chống nhàm có dữ liệu.

| Vụ       | Loại    | Cấu trúc      | Twist                          | Ngoại phạm giả         | Cửa mở đầu | Bối cảnh                  |
| -------- | ------- | ------------- | ------------------------------ | ---------------------- | ---------- | ------------------------- |
| case_000 | Án mạng | Phễu loại trừ | Mồi nhử hoàn hảo + Hai bàn tay | Âm thanh nền + Lịch TV | Tra SĐT    | Hà Nội 2016, xóm ven sông |
