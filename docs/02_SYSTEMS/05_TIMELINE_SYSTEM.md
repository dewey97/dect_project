# ĐẶC TẢ HỆ THỐNG DÒNG THỜI GIAN (TIMELINE SYSTEM) — VERITAS

> **Nhiệm vụ Hệ thống:** Quản lý việc xây dựng trục thời gian di chuyển, đối chiếu lời khai nghi phạm và tự động phát hiện mâu thuẫn ngoại phạm (**Alibi Clash Detection**).

---

## 01. Giao Diện Trục Thời Gian & Kéo Thả (Timeline Builder UI)

* **Trục Dọc Thời Gian (Vertical Timeline):** Hiển thị các mốc thời gian từ 18:00 đến 04:00 sáng.
* **Bộ Lọc Nghi Phạm (Suspect Filters):** Hỗ trợ chuyển đổi góc nhìn lời khai giữa 3 nhân vật: Nạn nhân Thomas Vance, Quản lý V. Marsh, và Quản đốc.
* **Deck Manh Mối (Evidence Dock):** Khay chứa các mảnh ghép bằng chứng bên phải màn hình để người chơi kéo-thả vào ô mốc thời gian tương ứng.

---

## 02. Cơ Chế Báo Động Alibi Clash (Phát Hiện Mâu Thuẫn)

```
[Lời khai Nghi phạm: "Tôi ở nhà lúc 22:00"] ──┐
                                             ├─► [ALIBI CLASH ALERT! (Chớp viền đỏ)]
[Nhật ký GPS Xe nâng: Xuất hiện lúc 22:05]  ──┘
```

* Khi mảnh ghép bằng chứng thả vào vị trí xung đột với lời khai, giao diện **chớp viền đỏ báo động Alibi Clash** kèm âm thanh cảnh báo và ghi nhận đây là một mắt xích mâu thuẫn đã được chứng minh.