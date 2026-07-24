# HẠ TẦNG, HỆ THỐNG API & BẢO MẬT (INFRASTRUCTURE & SECURITY) — VERITAS

---

## 01. Hạ Tầng & Triển Khai (Vercel & Supabase)
* Frontend deploy trên **Vercel Edge Network**.
* Database PostgreSQL & Storage trên **Supabase** với Row Level Security (RLS).

## 02. Security & Anti-Spoiler Protocol
* Mã hóa đáp án chuẩn: Tập đáp án `solution.json` chỉ nằm ở Serverless API Routes.
* Client chỉ nhận phản hồi `VALIDATED` hoặc `REJECTED` từ Server.
