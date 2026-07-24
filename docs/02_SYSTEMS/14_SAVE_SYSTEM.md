# ĐẶC TẢ HỆ THỐNG LƯU TRỮ (SAVE SYSTEM) — VERITAS

> **Nhiệm vụ Hệ thống:** Quản lý cơ chế lưu trữ Offline-first thông qua Dexie IndexedDB và tự động đồng bộ đám mây (Cloud Sync) tới Supabase Database.

---

## 01. Cơ Chế Lưu Trữ Đa Tầng (Multi-Tier Save Architecture)

```
[Màn hình điều tra] ──(Instant Action)──► [Dexie.js (IndexedDB)]
                                                │
                                    (Debounced Cloud Sync)
                                                │
                                                ▼
                                    [Supabase PostgreSQL RLS]
```

1. **Local Save (Dexie.js):** Mọi thao tác đánh dấu bằng chứng, ghép Timeline đều được lưu tức thì vào bộ nhớ trình duyệt `IndexedDB`. Người chơi có thể tiếp tục điều tra mượt mà kể cả khi mất kết nối Internet.
2. **Cloud Sync (Supabase):** Tự động đồng bộ tiến trình lên tài khoản Supabase khi có kết nối mạng để người chơi tiếp tục trên thiết bị khác.