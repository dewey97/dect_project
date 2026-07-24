# ĐẶC TẢ HỆ THỐNG MỤC TIÊU (OBJECTIVE SYSTEM) — VERITAS

> **Nhiệm vụ Hệ thống:** Quản lý danh sách các mục tiêu điều tra và câu hỏi chặng (Checkpoints) cần người chơi hoàn thành để tiến chuyển vụ án.

---

## 01. Cấu Trúc Mục Tiêu (Objective Schema)

Mỗi vụ án gồm nhiều chặng điều tra. Mỗi chặng sở hữu một hoặc nhiều **Mục tiêu (Objectives)**:

```json
{
  "objectiveId": "OBJ-001-A",
  "chapterId": "CHAPTER_1",
  "title": "Xác minh lời khai ngoại phạm của V. Marsh",
  "description": "Đối chiếu nhật ký GPS của xe nâng với thời gian nạn nhân mất tích.",
  "isCompleted": false,
  "requiredEvidenceIds": ["EVI-GPS-04", "EVI-LOG-12"],
  "unlocksEvidenceIds": ["EVI-PHONE-BURNER"]
}
```

---

## 02. Cơ Chế Mở Khóa Tiến Trình

* **Progressive Unlocking:** Khi tất cả mục tiêu thuộc `CHAPTER_1` được xác thực đúng, hệ thống kích hoạt thông báo từ **Trợ lý Minh** và mở khóa tập bằng chứng tiếp theo cho `CHAPTER_2`.
* **Objective Tracking Widget:** Hiển thị trực quan ở góc trên bên phải màn hình làm việc để người chơi luôn nắm rõ nhiệm vụ hiện tại.