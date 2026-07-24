# KIẾN TRÚC KỸ THUẬT TỔNG THỂ (TECHNICAL ARCHITECTURE) — VERITAS

> **Định hướng Kỹ thuật:** Xây dựng hệ thống Web đòn bẩy cao, hỗ trợ Offline-first, thời gian phản hồi tức thì và kiến trúc nội dung decoupled.

---

## 01. Tech Stack Chi Tiết

| Tầng Hệ Thống | Công Nghệ Sử Dụng | Lý Do Lựa Chọn |
| :--- | :--- | :--- |
| **Framework Core** | Next.js 16 (App Router) + Turbopack | Tối ưu SEO, render nhanh, hỗ trợ Server Components và API Routes. |
| **UI & Styling** | React 19 + Tailwind CSS v4 + Lucide Icons | Xây dựng giao diện responsive mượt mà, tối ưu dung lượng CSS. |
| **State Management**| Zustand | Quản lý trạng thái local nhẹ nhàng, không bị re-render thừa. |
| **Local Storage** | Dexie.js (IndexedDB) | Lưu trữ tiến trình điều tra offline trực tiếp trên trình duyệt người chơi. |
| **Backend & Database**| Supabase (PostgreSQL + RLS) | Quản lý người dùng, đồng bộ đám mây (Cloud Sync) và bảo mật RLS. |
| **Engine Core** | JSON Case Schema Parser | Bộ đọc và xác thực chuỗi bằng chứng độc lập với mã nguồn. |

---

## 02. Sơ Đồ Luồng Dữ Liệu (Data Flow Diagram)

```
[Case Data (.json)] ──► [Decoupled Case Engine]
                                 │
                                 ▼
   ┌──────────────────────────────────────────────────────────┐
   │                  Zustand Workspace Store                 │
   │  (Active Evidence, Suspect Timelines, Checkpoint State)   │
   └─────────────────────────────┬────────────────────────────┘
                                 │
       ┌─────────────────────────┴─────────────────────────┐
       ▼                                                   ▼
[Dexie.js (Local IndexedDB)]                    [Supabase Cloud Sync API]
  (Offline Fast Save)                             (Cross-device Sync & RLS)
```
