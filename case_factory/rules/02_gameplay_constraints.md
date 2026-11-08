# Ràng buộc gameplay (khớp engine hiện tại)

Những gì engine chạy được **hôm nay**. Thiết kế nên ưu tiên các cơ chế này để ra vụ nhanh. Cơ chế ngoài danh sách vẫn được đề xuất: ghi vào `needs_dev` trong bible kèm mô tả, dev đánh giá sau. Không tự ý giả lập cơ chế mới bằng cách lạm dụng cơ chế cũ. Nguồn: `docs/studio/authoring_guide.md`, `lib/checkpoints/case-linter.ts`, `AGENTS.md` §13.

## Loại checkpoint được phép (`kind`)

| `kind`                           | Dùng khi                                             | Đáp án sinh từ                                                                                    |
| -------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `phone_lookup`                   | Tra SĐT ẩn danh ra tên người                         | `deduction.type = identify`, mỗi ô 1 SĐT, `validAnswers` = tên + aliases                          |
| `suspect_interrogation`          | Thẩm tra 1 nghi phạm, 2 lớp                          | 1 suy luận `motive` + 1 suy luận `contradiction` của cùng nghi phạm                               |
| `followup`                       | Câu hỏi phụ sau thẩm tra (giờ, trắc nghiệm, mã, chữ) | `deduction.answer`                                                                                |
| `choice`, `code`, `time`, `text` | Câu hỏi đơn                                          | `deduction.answer`                                                                                |
| `indictment`                     | Cáo trạng cuối                                       | suy luận `culprit`: `validSuspects`, `validMotives`, `requiredEvidenceIds`, `optionalEvidenceIds` |
| `epilogue`                       | Hậu án                                               | `epilogues[]`                                                                                     |

Không có lớp **Ngoại phạm** trong thẩm tra (đã bỏ). Minh oan một nghi phạm làm bằng `followup` hoặc `choice`, hoặc qua lớp Mâu thuẫn.

## Thẩm tra 2 lớp

- **Động cơ:** vật chứng chứng minh nghi phạm có lý do muốn nạn nhân chết.
- **Mâu thuẫn:** vật chứng bắt quả tang một câu nói dối trong lời khai của nghi phạm. Câu nói dối đó phải tồn tại trong `statements` với `truthful: false`.
- Người vô tội cũng có động cơ và cũng nói dối (vì bí mật riêng). Đó là cách tạo nghi phạm giả hợp lý.

## Bộ hồ sơ và phase

- Bộ hồ sơ ở `slot` 0 và 1 mở từ đầu.
- Bộ khác mở khi checkpoint có `unlocksDossier` = `dossier_key` của bộ được giải đúng.
- Cáo trạng đúng mở mọi bộ còn lại.
- Checkpoint không có `unlocksDossier` không mở gì. Nếu bộ không có checkpoint nào mở, bộ đó chỉ mở sau cáo trạng.

## Khám xét lại hiện trường (360)

- Mở sẵn từ đầu trên bản web.
- Mỗi hotspot gắn 1 vật chứng (`case_evidence.code`), có thể kèm ảnh và âm thanh.
- Vì mở từ đầu, hotspot không được chứa vật chứng chí mạng trực tiếp. Nó chỉ chứa dấu vết cần ghép với tài liệu mở sau (ví dụ âm thanh còi tàu chỉ có nghĩa khi đã có voice note).

## Điện thoại tang vật

- Một máy, thường của nạn nhân.
- Nguồn manh mối: danh bạ, tin nhắn (`code` dạng `MSG-01`), cuộc gọi, ảnh, ghi chú, lịch sử web, giao dịch ngân hàng.
- Mật mã khóa máy (tùy chọn) phải suy ra được từ vật chứng khác.

## Bản đồ

- Bản đồ thế giới dùng chung. Địa điểm mới của vụ là POI gắn `caseId`.
- Khoảng cách và thời gian di chuyển trong `timeline` phải khớp vị trí POI.

## Thời lượng và quy mô (gợi ý, không bắt buộc)

| Thông số        | Vụ ngắn (pilot) | Vụ chuẩn   |
| --------------- | --------------- | ---------- |
| Thời lượng chơi | 15–20 phút      | 25–35 phút |
| Nghi phạm       | 3               | 4          |
| Vật chứng       | 12–18           | 25–40      |
| Checkpoint      | 5–7             | 8–12       |
| Bộ hồ sơ        | 2–3             | 3–4        |

## Chữ hiển thị theo vụ (cần dev)

Hiện chữ "Thẩm tra", "Động cơ", "Mâu thuẫn", "Lời khai", "Kết luận" viết cứng trong giao diện (`components/investigation/board/add-suspect-modal.tsx` và 6 file khác). Bible khai báo `meta.ui_labels` cho từng vụ; khi dev xong, Studio đọc trường này. Trước đó, vụ dùng chữ khác vẫn thiết kế bình thường, ghi `needs_dev: ui_labels`.

## Văn hóa và bối cảnh

- Bối cảnh Việt Nam. Tên, địa danh, đơn vị (đồng, km), giờ 24h.
- Thủ tục điều tra theo cách gọi Việt Nam (PC02, điều tra viên, biên bản ghi lời khai).
- Không dùng tên người thật hoặc địa chỉ thật có thể nhận diện.
