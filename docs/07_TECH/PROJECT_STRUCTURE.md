# CẤU TRÚC MÃ NGUỒN DỰ ÁN (NEXT.JS PROJECT STRUCTURE) — VERITAS

> **Cấu trúc Thư mục:** Xây dựng trên nền tảng Next.js 16 (App Router), tuân thủ nguyên tắc thiết kế mã nguồn mô-đun hóa cao.

---

```
d:\code_world\dect_project/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── page.tsx                # Trang chủ & Story Hook
│   ├── activate/               # Cổng nhập mã kích hoạt vụ án
│   ├── dashboard/              # Tổng quan máy trạm điều tra
│   ├── evidence/               # Màn hình phân loại tang vật
│   │   └── [id]/               # Trình giả lập điện thoại Nokia & Soi chi tiết
│   ├── trace/                  # Công cụ dựng Timeline & Alibi Clash
│   └── api/                    # Serverless API endpoints
│       └── cases/              # Verification & Schema routes
├── components/                 # React UI Components
│   ├── ui/                     # Base Radix/Tailwind components
│   ├── evidence/               # Evidence Cards, Forensic Toggle
│   ├── timeline/               # Vertical Timeline & Dock
│   └── simulator/              # Phone simulator apps (SMS, Calls)
├── lib/                        # Shared Utilities & Engines
│   ├── engine/                 # Case Engine & Graph Verifier
│   ├── store/                  # Zustand state stores
│   └── db/                     # Dexie.js IndexedDB schema
├── content/                    # Case JSON schemas (.json)
└── docs/                       # Hệ thống tài liệu 12 phân khu
```