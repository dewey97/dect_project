# TỔNG QUAN DỰ ÁN — VERITAS

> **Định vị Cốt lõi:** **VERITAS là một Nền tảng Điều tra Số Dựa trên Bằng chứng (Evidence-Driven Digital Investigation Platform).**
> 
> *Khẩu hiệu:* *"Người chơi không chiến thắng bằng cách đoán đúng sự thật. Họ chiến thắng bằng cách chứng minh nó."*

---

## 01. Tóm Tắt Dự Án (Executive Summary)

**VERITAS** là một nền tảng điều tra kỹ thuật số đa thế hệ, kết hợp giữa trải nghiệm chơi vật lý (Board Game) và môi trường máy trạm điều tra pháp y kỹ thuật số (Investigation OS). 

Dự án ra đời nhằm giải quyết căn bệnh "đoán mò" (trial-and-error) của các tựa game trinh thám truyền thống bằng cách thiết lập một quy trình chứng minh sự thật dựa hoàn toàn vào chuỗi bằng chứng logic (**Chuỗi Lập Luận Chứng Cứ**).

---

## 02. Định Danh Cốt Lõi & Trải Nghiệm Nhập Vai (Role Fantasy)

* 🎭 **Hình tượng nhập vai:** Người chơi nhập vai vào **Điều tra viên thuộc Đơn vị Phân tích Pháp y Số (Forensic Analysis Unit)**, được giao nhiệm vụ tái dựng sự thật lịch sử từ các mảnh ghép dữ liệu còn sót lại (*Tái dựng Hiện thực*).
* 👁️ **Mục tiêu cốt lõi:** Không phải sáng tạo hay thay đổi kết bài, mà là **khám phá và chứng minh duy nhất một sự thật đã tồn tại từ trước**.

---

## 03. Điểm Khác Biệt Cốt Lõi (USP - Unique Selling Points)

1. **Bằng Chứng Trước Kết Luận (Evidence Before Conclusion):** Mọi báo cáo điều tra đều bắt buộc đính kèm mã chứng cứ xác thực hợp lệ (Alibi Clash - Mâu thuẫn ngoại phạm, nhật ký GPS, dữ liệu SMS). Không thưởng điểm cho việc chọn đúng đáp án ngẫu nhiên.
2. **Mô Hình Tương Tác Kép Linh Hoạt (Dual-Layer Engagement Spectrum):**
   * **Cấp độ 1: Companion Mode (Trợ lý linh hoạt):** Web đóng vai trò Game Master / Trợ lý cho nhóm người chơi Board Game vật lý quanh bàn.
   * **Cấp độ 2: Investigation OS Workstation (Máy trạm chuyên sâu):** Web là môi trường máy trạm phân tích log SHA-256, giả lập điện thoại/email, soi timeline mâu thuẫn dành cho game thủ Solo trên máy tính.
3. **Kiến Trúc Nội Dung Tách Biệt (Decoupled Content Architecture):** Nội dung vụ án hoàn toàn tách biệt với mã nguồn ứng dụng thông qua định dạng dữ liệu chuẩn hóa **Case Data Schema (JSON/YAML)**, sẵn sàng mở rộng cho cộng đồng tự tạo vụ án (UGC) trong tương lai.
4. **Hệ Thống Đánh Giá Hiệu Suất Điều Tra (Investigative Efficiency Rating):** Hệ thống tính điểm S/A/B/C/D đánh giá độ chính xác của lập luận và số thao tác thừa để ngăn chặn hành vi đoán mò.

---

## 04. Kiến Trúc Hệ Thống & Công Nghệ (Tech Stack)

```
                              NỀN TẢNG VERITAS
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
  GIAO DIỆN NGƯỜI DÙNG (Web OS)                           BỘ XỬ LÝ & BACKEND
  -----------------------------                           ------------------
  • Next.js 16 (App Router)                               • Bộ xử lý Vụ án (Decoupled Case Engine)
  • React 19 + Tailwind CSS v4                            • Bộ xác thực Chứng cứ (Graph Match Engine)
  • Zustand (Quản lý trạng thái local)                    • Supabase (Postgres + RLS + Synchronize Cloud)
  • Dexie.js (Lưu trữ offline IndexDB)                    • Mạng lưới Edge Vercel
```

---

## 05. Hệ Sinh Thái & Mô Hình Kinh Doanh (Business Model)

* **Mô hình Phễu:** Digital-First (Bán lẻ từng vụ án số) $\rightarrow$ Collector Physical Edition Box (Bản hộp vật lý cao cấp) $\rightarrow$ Season Pass.
* **Hệ sinh thái sản phẩm:**
  * **Companion & OS Web App:** Giao diện điều tra người dùng.
  * **CMS Case Studio:** Bộ công cụ biên soạn vụ án nội bộ.
  * **Creator Marketplace:** Chợ chia sẻ vụ án do cộng đồng tạo ra (Roadmap Year 3).

---

## 06. Danh Mục Tài Liệu Cốt Lõi

- 📑 **Tầm nhìn & Định hướng:** [01_PRODUCT_VISION.md](../01_PRODUCT/01_PRODUCT_VISION.md)
- 🌎 **Thế giới & Quy tắc:** [02_WORLD_BUILDING.md](../01_PRODUCT/02_WORLD_BUILDING.md)
- ⚖️ **Triết lý Điều tra:** [03_PHILOSOPHY.md](../01_PRODUCT/03_PHILOSOPHY.md)
